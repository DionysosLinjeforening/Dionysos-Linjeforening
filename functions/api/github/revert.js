/**
 * POST /api/github/revert
 * "Undo the last publish" as a FORWARD revert (ADR-0003): a new commit with
 * the current HEAD as its parent - history is never deleted, and the undo
 * can itself be undone.
 *
 * The undo applies to the SITE, not the repo: the new commit takes HEAD's
 * tree, but swaps the site subtree (GITHUB_ROOT_DIR, the whole repo without
 * rootDir) back to how it was BEFORE the publish being undone. In a monorepo
 * no code outside the site is touched.
 *
 * Body {expect: <sha>}: the publish to undo. It must still be the LAST
 * content commit (same filter as history.js), otherwise 409 - two editors
 * never undo each other's work.
 *
 * Known limitation: if the publish is a merge commit, the first parent's
 * content state is restored.
 */
import { gh, triggerDeploy } from '../../_lib/github.js';
import { requirePublisher } from '../../_lib/auth.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/** The sha of the subtree at a path (e.g. "template") in a given tree. */
async function subtreeSha(token, repo, treeSha, pathSegments) {
  let sha = treeSha;
  for (const segment of pathSegments) {
    const tree = await gh(token, `/repos/${repo}/git/trees/${sha}`);
    const entry = tree.tree.find((t) => t.path === segment && t.type === 'tree');
    if (!entry) return null;
    sha = entry.sha;
  }
  return sha;
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
  if (typeof body?.expect !== 'string' || !/^[0-9a-f]{7,64}$/i.test(body.expect)) {
    return json({ error: 'expect (the publish to revert) is missing or invalid', code: 'badRevertTarget' }, 400);
  }

  try {
    const { repo, branch, rootDir } = config;

    // expect must still be the latest publish (same filter as history.js).
    const contentPath = rootDir ? `${rootDir}/content` : 'content';
    const latest = await gh(
      token,
      `/repos/${repo}/commits?sha=${branch}&per_page=1&path=${encodeURIComponent(contentPath)}`,
    );
    if (latest[0]?.sha !== body.expect) {
      return json({ error: 'Someone has published in the meantime - reload the history', code: 'revertRace' }, 409);
    }

    const target = await gh(token, `/repos/${repo}/git/commits/${body.expect}`);
    const targetParentSha = target.parents?.[0]?.sha;
    if (!targetParentSha) return json({ error: 'Nothing to revert: this is the first publish', code: 'nothingToRevert' }, 400);
    const targetParent = await gh(token, `/repos/${repo}/git/commits/${targetParentSha}`);

    const ref = await gh(token, `/repos/${repo}/git/ref/heads/${branch}`);
    const headSha = ref.object.sha;

    // The tree for the new commit: the site subtree from before the publish,
    // everything else unchanged from HEAD.
    let treeSha;
    if (rootDir) {
      const before = await subtreeSha(token, repo, targetParent.tree.sha, rootDir.split('/'));
      const headCommit = await gh(token, `/repos/${repo}/git/commits/${headSha}`);
      const newTree = await gh(token, `/repos/${repo}/git/trees`, {
        method: 'POST',
        body: JSON.stringify({
          base_tree: headCommit.tree.sha,
          // sha null deletes the subtree (the site did not exist in the parent).
          tree: [{ path: rootDir, mode: '040000', type: 'tree', sha: before }],
        }),
      });
      treeSha = newTree.sha;
    } else {
      treeSha = targetParent.tree.sha;
    }

    const firstLine = target.message.split('\n')[0];
    const commit = await gh(token, `/repos/${repo}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message: `Revert "${firstLine}" via Urd admin`,
        tree: treeSha,
        parents: [headSha],
      }),
    });
    await gh(token, `/repos/${repo}/git/refs/heads/${branch}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });

    await triggerDeploy(env);
    return json({ sha: commit.sha });
  } catch (err) {
    // 422 non-fast-forward: someone committed inside the revert window itself.
    if (err.status === 422 && /fast.?forward/i.test(err.message)) {
      return json({ error: 'Someone has published in the meantime - reload the history', code: 'revertRace' }, 409);
    }
    console.error('Urd revert:', err.message);
    return json({ error: `Could not revert: ${err.message}`, code: 'revertFailed', detail: err.message }, 502);
  }
}
