/**
 * GET /api/github/me
 * Sign-in status for the editor: { loggedIn, login?, allowed? }.
 * `allowed` is the ALLOWED_LOGINS check; it is enforced again in commit.js
 * REGARDLESS (defence in depth), this response is only for the UI.
 */
import { currentUser } from '../../_lib/github.js';
import { readCookie } from '../../_lib/cookies.js';
import { isAllowedLogin } from '../../_lib/guard.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export async function onRequestGet({ request, env }) {
  const token = readCookie(request, 'urd_gh');
  if (!token) return json({ loggedIn: false });

  try {
    const user = await currentUser(token);
    return json({ loggedIn: true, login: user.login, allowed: isAllowedLogin(user.login, env) });
  } catch (err) {
    // ONLY GitHub's 401 means signed out (invalid/expired token). Anything
    // else is GitHub trouble and must not be shown as a sign-out in the editor.
    if (err.status === 401) return json({ loggedIn: false });
    return json({ error: 'GitHub is unavailable right now', code: 'githubUnavailable' }, 503);
  }
}
