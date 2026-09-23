/**
 * The updater (ADR-0014): fetches a new Urd version from the template repo
 * (URD_TEMPLATE_REPO) and writes the Urd-owned files in the user's repo as
 * ONE atomic commit. All GitHub traffic goes through here (the visitor CSP
 * has connect-src 'self', and the token lives in the cookie).
 *
 * GET  /api/github/update[?to=vX.Y.Z]  check: classifies every file through
 *      blob SHAs (unchanged/hand-edited/new/deleted) without loading content.
 * POST /api/github/update              run: { to, expect, skip? }.
 *
 * The checksum model: the user's tree is compared with the template's tree
 * at the BASELINE v<engine> (engine is read from the user's urd.json in the
 * repo, never from the client) and at the target version. `_headers` is
 * NEVER written (ADR-0006); the check returns the upstream text so admin can
 * show the diff instructions. The slug copies (<slug>/index.html) are
 * refreshed in the same commit as the engine swap (the copy refresh duty,
 * ADR-0013).
 */
import { gh, ghGraphql, cleanBase64, commitTree, triggerDeploy } from '../../_lib/github.js';
import { requirePublisher } from '../../_lib/auth.js';
import { isPageIndexCopy } from '../../_lib/guard.js';
import { planUpdate, highestVersionTag, chunkEntries } from '../../_lib/update-plan.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const TAG_RE = /^v\d+\.\d+\.\d+$/;

const decodeBlob = (b64) =>
  new TextDecoder().decode(Uint8Array.from(atob(cleanBase64(b64)), (c) => c.charCodeAt(0)));

/** The user's tree as path -> blob SHA, limited to the site root
 *  (GITHUB_ROOT_DIR stripped, so the paths match the template repo's). */
function siteTree(tree, rootDir) {
  const prefix = rootDir ? `${rootDir}/` : '';
  const map = {};
  for (const entry of tree) {
    if (entry.type !== 'blob') continue;
    if (prefix && !entry.path.startsWith(prefix)) continue;
    map[entry.path.slice(prefix.length)] = entry.sha;
  }
  return map;
}

function treeAsMap(tree) {
  const map = {};
  for (const entry of tree) {
    if (entry.type === 'blob') map[entry.path] = entry.sha;
  }
  return map;
}

/** Loads the common ground for check and run: the user's HEAD + tree, the
 *  installed version, the target version and the template's two trees.
 *  Throws with .code. */
async function loadState(token, config, toParam) {
  const { repo, branch, rootDir, templateRepo } = config;

  const ref = await gh(token, `/repos/${repo}/git/ref/heads/${branch}`);
  const head = ref.object.sha;
  const rawTree = await gh(token, `/repos/${repo}/git/trees/${head}?recursive=1`);
  if (rawTree.truncated) {
    // A truncated tree would misclassify files outside the slice as
    // "missing locally" and rewrite them without warning: stop safely instead.
    throw Object.assign(
      new Error('The repository tree is too large to compare safely'),
      { code: 'updateFailed', detail: 'the git tree is truncated by GitHub' },
    );
  }
  const userTree = siteTree(rawTree.tree, rootDir);

  if (!userTree['urd.json']) {
    throw Object.assign(new Error('Could not find urd.json in the repository'), { code: 'updateFailed', detail: 'urd.json is missing' });
  }
  const urdBlob = await gh(token, `/repos/${repo}/git/blobs/${userTree['urd.json']}`);
  const engine = JSON.parse(decodeBlob(urdBlob.content)).engine;

  let target = toParam ?? null;
  let templateTags;
  try {
    if (!target) {
      templateTags = await gh(token, `/repos/${templateRepo}/tags?per_page=100`);
      target = highestVersionTag(templateTags.map((t) => t.name));
    }
    if (!target) {
      throw Object.assign(new Error('The template repository has no version tags'), { code: 'updateNoBaseline', tag: '(none)' });
    }
    if (target === `v${engine}`) {
      return { head, engine, target, userTree, upToDate: true };
    }

    let baselineTree;
    try {
      baselineTree = await gh(token, `/repos/${templateRepo}/git/trees/v${engine}?recursive=1`);
    } catch (err) {
      if (err.status === 404 || err.status === 422) {
        throw Object.assign(
          new Error(`Could not find the baseline tag v${engine} in the template repository`),
          { code: 'updateNoBaseline', tag: `v${engine}` },
        );
      }
      throw err;
    }
    let targetTree;
    try {
      targetTree = await gh(token, `/repos/${templateRepo}/git/trees/${target}?recursive=1`);
    } catch (err) {
      if (err.status === 404 || err.status === 422) {
        // A well-formed but nonexistent target tag must be diagnosed as
        // exactly that, not as "the template repo is unreachable".
        throw Object.assign(new Error(`The target version ${target} does not exist in the template repository`), { code: 'updateBadTarget', target });
      }
      throw err;
    }
    return {
      head,
      engine,
      target,
      userTree,
      upToDate: false,
      baselineTree: treeAsMap(baselineTree.tree),
      targetTree: treeAsMap(targetTree.tree),
    };
  } catch (err) {
    if (err.code) throw err;
    throw Object.assign(
      new Error(`Could not read the template repository ${templateRepo}: ${err.message}`),
      { code: 'updateTemplateUnreachable', repo: templateRepo, detail: err.message.slice(0, 200) },
    );
  }
}

export async function onRequestGet({ request, env }) {
  const auth = await requirePublisher(request, env);
  if (auth.response) return auth.response;
  const { config, token } = auth;

  const to = new URL(request.url).searchParams.get('to');
  if (to !== null && !TAG_RE.test(to)) {
    return json({ error: `Invalid target version '${to}'`, code: 'updateBadTarget', target: to }, 400);
  }

  try {
    const state = await loadState(token, config, to);
    if (state.upToDate) {
      return json({ current: state.engine, target: state.target, head: state.head, upToDate: true, changes: [] });
    }
    const { changes, upToDate } = planUpdate(state.baselineTree, state.targetTree, state.userTree);

    // The _headers instruction (ADR-0006): never in the write set; the
    // upstream text is sent along when the user's file differs from the
    // target, so admin can show exactly what should be added by hand.
    const headers = {
      changed: state.baselineTree['_headers'] !== state.targetTree['_headers'],
      edited: state.userTree['_headers'] !== state.baselineTree['_headers'],
      upstream: null,
    };
    if (state.targetTree['_headers'] && state.userTree['_headers'] !== state.targetTree['_headers']) {
      const blob = await gh(token, `/repos/${config.templateRepo}/git/blobs/${state.targetTree['_headers']}`);
      headers.upstream = decodeBlob(blob.content);
    }

    // The release notes (optional): the release Action publishes the
    // monorepo release's notes on to the template repo. 404 is normal for
    // older versions; an error here must never topple the check.
    let notes = null;
    try {
      const release = await gh(token, `/repos/${config.templateRepo}/releases/tags/${state.target}`);
      notes = typeof release.body === 'string' && release.body.trim() ? release.body.slice(0, 4000) : null;
    } catch { /* no release with notes: the field stays null */ }

    return json({ current: state.engine, target: state.target, head: state.head, upToDate, changes, headers, notes });
  } catch (err) {
    if (err.code) return json({ error: err.message, code: err.code, tag: err.tag, repo: err.repo, target: err.target, detail: err.detail }, 502);
    console.error('Urd update check:', err.message);
    return json({ error: `The update check failed: ${err.message}`, code: 'updateFailed', detail: err.message.slice(0, 200) }, 502);
  }
}

export async function onRequestPost({ request, env }) {
  const auth = await requirePublisher(request, env);
  if (auth.response) return auth.response;
  const { config, token } = auth;

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON in the request', code: 'badJson' }, 400);
  }
  const { to, expect, skip } = body ?? {};
  if (typeof to !== 'string' || !TAG_RE.test(to)) {
    return json({ error: `Invalid target version '${to}'`, code: 'updateBadTarget', target: String(to) }, 400);
  }
  if (typeof expect !== 'string' || !expect) {
    return json({ error: 'expect must be a commit sha', code: 'badExpect' }, 400);
  }
  if (skip !== undefined && (!Array.isArray(skip) || skip.length > 500 || skip.some((p) => typeof p !== 'string'))) {
    // api.updateFailed interpolates detail, so the text is right for THIS
    // caller (api.badFiles describes the commit endpoint).
    return json({ error: 'skip must be a list of paths', code: 'updateFailed', detail: 'skip must be a list of paths (max 500)' }, 400);
  }

  try {
    const state = await loadState(token, config, to);
    if (state.head !== expect) {
      return json({ error: 'The repository changed after the update check', code: 'updateRace' }, 409);
    }
    if (state.upToDate) {
      return json({ current: state.engine, target: state.target, upToDate: true });
    }

    // The plan is recomputed server-side; the client may only opt out of
    // files OUTSIDE the engine atom group (ADR-0014).
    const plan = planUpdate(state.baselineTree, state.targetTree, state.userTree);
    const planned = new Map(plan.changes.map((c) => [c.path, c]));
    for (const path of skip ?? []) {
      const change = planned.get(path);
      if (!change || change.atom) {
        return json({ error: `The file '${path}' cannot be held back from the update`, code: 'updateBadSkip', path }, 400);
      }
      planned.delete(path);
    }

    const writes = [...planned.values()].filter((c) => c.action === 'write');
    const deletes = [...planned.values()].filter((c) => c.action === 'delete');

    // The copy refresh duty (ADR-0013): every <slug>/index.html in the
    // user's tree must be byte-identical to the template's root index.html
    // after the swap. Comparing blob SHAs decides which ones actually need
    // a write. The template's OWN slug copies are already in the plan (they
    // exist in the template trees); without the planned filter they would
    // become duplicate tree entries.
    const rootIndexSha = state.targetTree['index.html'];
    const copyPaths = Object.keys(state.userTree)
      .filter((p) => isPageIndexCopy(p) && state.userTree[p] !== rootIndexSha && !planned.has(p));
    const needsRootText = copyPaths.length > 0 && !writes.some((c) => c.path === 'index.html');

    // ONE GraphQL call fetches all the target texts; binary/truncated blobs
    // take the REST detour (read base64 from the template repo, write a blob
    // in the user's repo).
    const fetchPaths = [...writes.map((c) => c.path), ...(needsRootText ? ['index.html'] : [])];
    const texts = {};
    const blobEntries = {};
    if (fetchPaths.length > 0) {
      const [owner, name] = config.templateRepo.split('/');
      const fields = fetchPaths.map((p, i) =>
        `f${i}: object(expression: ${JSON.stringify(`${to}:${p}`)}) { ... on Blob { text isBinary isTruncated } }`);
      const data = await ghGraphql(token, `{ repository(owner: ${JSON.stringify(owner)}, name: ${JSON.stringify(name)}) { ${fields.join(' ')} } }`);
      for (let i = 0; i < fetchPaths.length; i++) {
        const path = fetchPaths[i];
        const blob = data.repository[`f${i}`];
        if (blob && typeof blob.text === 'string' && !blob.isTruncated && !blob.isBinary) {
          texts[path] = blob.text;
        } else {
          const raw = await gh(token, `/repos/${config.templateRepo}/git/blobs/${state.targetTree[path]}`);
          const made = await gh(token, `/repos/${config.repo}/git/blobs`, {
            method: 'POST',
            body: JSON.stringify({ content: cleanBase64(raw.content), encoding: 'base64' }),
          });
          blobEntries[path] = made.sha;
        }
      }
    }

    const prefix = config.rootDir ? `${config.rootDir}/` : '';
    const entries = [
      ...writes.map((c) => (blobEntries[c.path] !== undefined
        ? { path: `${prefix}${c.path}`, sha: blobEntries[c.path] }
        : { path: `${prefix}${c.path}`, content: texts[c.path] })),
      ...copyPaths.map((p) => (blobEntries['index.html'] !== undefined
        ? { path: `${prefix}${p}`, sha: blobEntries['index.html'] }
        : { path: `${prefix}${p}`, content: texts['index.html'] })),
      ...deletes.map((c) => ({ path: `${prefix}${c.path}`, sha: null })),
    ];

    const { sha } = await commitTree(token, config, {
      message: `Update Urd to ${to} via admin`,
      entries,
      expect,
    }, chunkEntries);
    await triggerDeploy(env);
    return json({ sha, current: state.engine, target: to, written: writes.length + copyPaths.length, deleted: deletes.length });
  } catch (err) {
    if (err.status === 409 || (err.status === 422 && /fast.?forward/i.test(err.message))) {
      return json({ error: 'The repository changed while the update was running', code: 'updateRace' }, 409);
    }
    if (err.code) return json({ error: err.message, code: err.code, tag: err.tag, repo: err.repo, target: err.target, detail: err.detail }, 502);
    console.error('Urd update:', err.message);
    return json({ error: `The update failed: ${err.message}`, code: 'updateFailed', detail: err.message.slice(0, 200) }, 502);
  }
}
