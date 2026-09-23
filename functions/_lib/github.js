/**
 * GitHub API helpers for the publishing layer.
 *
 * The boundary here is deliberately vendor-shaped so GitLab/Gitea adapters can
 * be written after v1 without touching the endpoints.
 *
 * Configuration (environment variables at the host):
 *   GITHUB_REPO ("owner/name"), GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET,
 *   GITHUB_BRANCH (default "main"), GITHUB_SCOPE (default "public_repo"),
 *   ALLOWED_LOGINS (comma-separated),
 *   GITHUB_ROOT_DIR (optional: the subfolder in the repo that is the site root,
 *   e.g. "template" in the Urd monorepo; omitted when the site is at the root).
 */

/** Reads and validates the configuration from env. Throws on missing variables.
 *  The errors carry a machine-readable `code` (and any parameters) that the
 *  endpoints pass on in the error response, so admin can translate them
 *  (the api.* keys). */
export function cfg(env) {
  for (const key of ['GITHUB_REPO', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET']) {
    if (!env[key]) {
      throw Object.assign(
        new Error(`Publishing is not configured: the environment variable ${key} is missing`),
        { code: 'setupMissingEnv', key },
      );
    }
  }
  const rootDir = (env.GITHUB_ROOT_DIR || '').replace(/^\/+|\/+$/g, '');
  if (rootDir.split('/').includes('..')) {
    throw Object.assign(new Error('GITHUB_ROOT_DIR cannot contain ..'), { code: 'setupBadRootDir' });
  }
  return {
    repo: env.GITHUB_REPO,
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    branch: env.GITHUB_BRANCH || 'main',
    scope: env.GITHUB_SCOPE || 'public_repo',
    rootDir,
    // The template repo the updater fetches new Urd versions from (ADR-0014).
    // Override with URD_TEMPLATE_REPO for fork-based upstreams.
    templateRepo: env.URD_TEMPLATE_REPO || 'Artiscow/urd-template',
  };
}

/**
 * Authenticated call to api.github.com. Transient failures (5xx/429, such as
 * GitHub's "Unicorn" page) are retried automatically a couple of times.
 * Throws an Error with .status so the endpoints can tell "GitHub is down" from
 * "invalid token". Error text is truncated (never whole HTML pages).
 */
export async function gh(token, path, init = {}, attempt = 1) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      // token null = anonymous reads (public repos, lower rate limit); used only by read-only endpoints.
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      'user-agent': 'urd-publisher',
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) {
    if ((res.status >= 500 || res.status === 429) && attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      return gh(token, path, init, attempt + 1);
    }
    const isJson = res.headers.get('content-type')?.includes('json');
    const detail = isJson ? (await res.text()).slice(0, 300) : '(HTML error page from GitHub)';
    const error = new Error(`GitHub ${init.method ?? 'GET'} ${path} responded ${res.status}: ${detail}`);
    error.status = res.status;
    throw error;
  }
  return res.json();
}

/** The signed-in GitHub user for the token. */
export function currentUser(token) {
  return gh(token, '/user');
}

/**
 * GraphQL call to GitHub: used by the updater to fetch MANY file contents in
 * ONE subrequest (Blob.text via aliases), which REST would have needed one call
 * per file for. Same retry rule as gh().
 */
export async function ghGraphql(token, query, attempt = 1) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      'user-agent': 'urd-publisher',
    },
    body: JSON.stringify({ query }),
  });
  if (!res.ok) {
    if ((res.status >= 500 || res.status === 429) && attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      return ghGraphql(token, query, attempt + 1);
    }
    const error = new Error(`GitHub GraphQL responded ${res.status}`);
    error.status = res.status;
    throw error;
  }
  const payload = await res.json();
  if (payload.errors?.length) {
    throw new Error(`GitHub GraphQL: ${payload.errors[0].message}`.slice(0, 300));
  }
  return payload.data;
}

/** Base64 from the blobs API (arrives with embedded line breaks). */
export function cleanBase64(b64) {
  return String(b64 ?? '').replace(/\s/g, '');
}

/**
 * Optional explicit deploy trigger (DEPLOY_HOOK_URL) in addition to the git
 * webhook, which the host can miss. A failure here never topples the call -
 * the commit is already safely in the repo.
 */
export async function triggerDeploy(env) {
  if (!env.DEPLOY_HOOK_URL) return;
  try {
    await fetch(env.DEPLOY_HOOK_URL, { method: 'POST' });
  } catch (err) {
    console.warn('Urd: deploy hook failed', err.message);
  }
}

/**
 * Commits several files as ONE commit via the Git Data API:
 *   1. Fetch the branch ref and the base commit
 *   2. Create one blob per file (deletion: a tree entry with sha: null)
 *   3. Create a tree with base_tree = the base commit's tree
 *   4. Create a commit with the base commit as parent
 *   5. Update the ref (force: false - fails safely if HEAD has moved)
 *
 * Files with `delete: true` are removed from the repo. Paths that do not exist
 * in the base tree are skipped silently (GitHub rejects the whole tree
 * otherwise), so a deletion can never topple publishing the rest.
 *
 * With `expect` set, HEAD is required to be exactly there (Error with status
 * 409 otherwise): it closes the editor's conflict-check-to-commit window.
 *
 * @param {string} token
 * @param {{repo: string, branch: string}} config From cfg(env)
 * @param {{message: string, files: Array<{path: string, content?: string, encoding?: 'utf-8'|'base64', delete?: boolean}>, expect?: string}} payload
 * @returns {Promise<{sha: string}>} The new commit SHA
 */
export async function commitFiles(token, config, { message, files, expect }) {
  const { repo, branch } = config;

  const ref = await gh(token, `/repos/${repo}/git/ref/heads/${branch}`);
  const baseSha = ref.object.sha;
  if (expect && expect !== baseSha) {
    const error = new Error('HEAD has moved since the conflict check');
    error.status = 409;
    throw error;
  }
  const baseCommit = await gh(token, `/repos/${repo}/git/commits/${baseSha}`);

  // Deletions are validated against the base tree: sha:null for an unknown
  // path gives 422 from GitHub. (recursive can be truncated in enormous repos;
  // then the deletion is skipped, which is the harmless direction.)
  let existing = null;
  if (files.some((f) => f.delete)) {
    const baseTree = await gh(token, `/repos/${repo}/git/trees/${baseCommit.tree.sha}?recursive=1`);
    existing = new Set(baseTree.tree.map((t) => t.path));
  }

  const tree = [];
  for (const file of files) {
    if (file.delete) {
      if (existing?.has(file.path)) {
        tree.push({ path: file.path, mode: '100644', type: 'blob', sha: null });
      }
      continue;
    }
    const blob = await gh(token, `/repos/${repo}/git/blobs`, {
      method: 'POST',
      body: JSON.stringify({
        content: file.content,
        encoding: file.encoding === 'base64' ? 'base64' : 'utf-8',
      }),
    });
    tree.push({ path: file.path, mode: '100644', type: 'blob', sha: blob.sha });
  }
  if (tree.length === 0) {
    // Everything to do was deletions of paths that are already gone.
    return { sha: baseSha };
  }

  const newTree = await gh(token, `/repos/${repo}/git/trees`, {
    method: 'POST',
    body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree }),
  });

  const commit = await gh(token, `/repos/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: newTree.sha, parents: [baseSha] }),
  });

  await gh(token, `/repos/${repo}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });

  return { sha: commit.sha };
}

/**
 * The updater's commit path (ADR-0014): like commitFiles, but the tree entries
 * are built with INLINE `content` (or a ready-made blob `sha`) instead of one
 * blob POST per file - that is what keeps a ~90-file engine update under
 * Cloudflare's subrequest limit. Large entry counts are split into CHAINED
 * trees (base_tree = the previous tree), still as ONE commit.
 *
 * @param {string} token
 * @param {{repo: string, branch: string}} config
 * @param {{message: string, entries: Array<{path: string, content?: string, sha?: string|null}>, expect?: string}} payload
 *   `content` for text files, `sha` for pre-made blobs (binary/truncated),
 *   `sha: null` for deletion. Deletions must target paths that exist.
 * @param {(entries: Array<object>) => Array<Array<object>>} chunk Pure chunking (from update-plan.js)
 * @returns {Promise<{sha: string}>}
 */
export async function commitTree(token, config, { message, entries, expect }, chunk) {
  const { repo, branch } = config;

  const ref = await gh(token, `/repos/${repo}/git/ref/heads/${branch}`);
  const baseSha = ref.object.sha;
  if (expect && expect !== baseSha) {
    const error = new Error('HEAD has moved since the update check');
    error.status = 409;
    throw error;
  }
  const baseCommit = await gh(token, `/repos/${repo}/git/commits/${baseSha}`);

  let treeSha = baseCommit.tree.sha;
  for (const group of chunk(entries.map((e) => ({
    path: e.path,
    mode: '100644',
    type: 'blob',
    ...(e.sha !== undefined ? { sha: e.sha } : { content: e.content }),
  })))) {
    const tree = await gh(token, `/repos/${repo}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({ base_tree: treeSha, tree: group }),
    });
    treeSha = tree.sha;
  }

  const commit = await gh(token, `/repos/${repo}/git/commits`, {
    method: 'POST',
    body: JSON.stringify({ message, tree: treeSha, parents: [baseSha] }),
  });

  await gh(token, `/repos/${repo}/git/refs/heads/${branch}`, {
    method: 'PATCH',
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });

  return { sha: commit.sha };
}
