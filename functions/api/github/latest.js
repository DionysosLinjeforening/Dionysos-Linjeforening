/**
 * GET /api/github/latest[?base=<sha>]
 * Returns the HEAD commit on the publishing branch; with ?base it also lists
 * the files changed in base..HEAD. The editor uses this for conflict
 * detection: if someone else has published since load, the user is warned.
 */
import { cfg, gh } from '../../_lib/github.js';
import { readCookie } from '../../_lib/cookies.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export async function onRequestGet({ request, env }) {
  let config;
  try {
    config = cfg(env);
  } catch (err) {
    return json({ error: err.message, code: err.code, key: err.key }, 503);
  }

  const token = readCookie(request, 'urd_gh');
  if (!token) return json({ error: 'Not signed in', code: 'notLoggedIn' }, 401);

  try {
    const ref = await gh(token, `/repos/${config.repo}/git/ref/heads/${config.branch}`);
    const head = ref.object.sha;

    const base = new URL(request.url).searchParams.get('base');
    if (!base || base === head) return json({ head, changedFiles: [] });
    // base goes into the GitHub API path and must be a real commit sha, not arbitrary text.
    if (!/^[0-9a-f]{7,64}$/i.test(base)) return json({ error: 'Invalid base', code: 'badBase' }, 400);

    const diff = await gh(token, `/repos/${config.repo}/compare/${base}...${head}`);
    // Report paths relative to the site (the same space the editor uses).
    const prefix = config.rootDir ? `${config.rootDir}/` : '';
    const allFiles = diff.files ?? [];
    const changedFiles = allFiles
      .map((f) => f.filename)
      .filter((name) => name.startsWith(prefix))
      .map((name) => name.slice(prefix.length));
    // GitHub truncates the file list at 300: site files CAN then be missing,
    // and the conflict check must treat the diff as "may overlap". The flag
    // is set from the length of the whole diff (truncation happens before our
    // filter), but only once the limit is actually reached.
    return json({ head, changedFiles, truncated: allFiles.length >= 300 });
  } catch (err) {
    console.error('Urd latest:', err.message);
    return json({ error: 'Could not read repository status from GitHub', code: 'statusFailed' }, 502);
  }
}
