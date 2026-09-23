/**
 * Shared auth prologue for the mutating endpoints. Holds what commit.js and
 * revert.js both need: config, CSRF check (Sec-Fetch-Site with Origin as
 * fallback), cookie token, GitHub user lookup and ALLOWED_LOGINS enforcement.
 */
import { cfg, currentUser } from './github.js';
import { readCookie } from './cookies.js';
import { isAllowedLogin } from './guard.js';

const json = (body, status) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

/**
 * Is this call from a FOREIGN site? Pure function, tested in tests/auth.test.mjs.
 *
 * Applies to ALL methods, not just the mutating ones: the helper is used only by
 * signed-in endpoints (publishing, revert, update), and there a call from a
 * foreign site is never legitimate. The update check is a GET that uses the
 * owner's GitHub token, so a blanket exemption for safe methods would let a
 * foreign site trigger it from the owner's browser.
 *
 * Sec-Fetch-Site is the primary signal (set by the browser itself, cannot be
 * overridden by JavaScript, in every browser since March 2023) and tells us only
 * the RELATIONSHIP between sender and receiver, never the sender's address, so
 * it leaks less than Origin. `same-origin` is our own admin; `none` is the
 * user's own navigation (address bar/bookmark). `same-site` is rejected on
 * purpose: on shared hosts (e.g. *.pages.dev) neighbours share the registrable
 * domain, and SameSite=Lax does not tell them apart from us.
 *
 * Origin is the fallback for clients without Sec-Fetch. With BOTH missing this
 * is not a browser from after 2020, and then the attack does not exist - the
 * call is let through (the same trade-off as the Go standard library's
 * CrossOriginProtection).
 *
 * @param {{secFetchSite: string|null, origin: string|null, url: string}} req
 * @returns {boolean}
 */
export function isCrossOrigin({ secFetchSite, origin, url }) {
  if (secFetchSite) return secFetchSite !== 'same-origin' && secFetchSite !== 'none';
  if (origin) return origin !== new URL(url).origin;
  return false;
}

/**
 * Runs the whole prologue. Returns {config, token, user} on success, or
 * {response}, which the endpoint should return directly on a rejection.
 *
 * @param {Request} request
 * @param {object} env
 * @returns {Promise<{config?: object, token?: string, user?: object, response?: Response}>}
 */
export async function requirePublisher(request, env) {
  let config;
  try {
    config = cfg(env);
  } catch (err) {
    return { response: json({ error: err.message, code: err.code, key: err.key }, 503) };
  }

  // Defence in depth against CSRF (on top of SameSite=Lax on the cookie):
  // signed-in calls must come from our own site, never from a foreign one.
  const crossOrigin = isCrossOrigin({
    secFetchSite: request.headers.get('sec-fetch-site'),
    origin: request.headers.get('origin'),
    url: request.url,
  });
  if (crossOrigin) {
    return { response: json({ error: 'The request comes from the wrong site', code: 'wrongOrigin' }, 403) };
  }

  const token = readCookie(request, 'urd_gh');
  if (!token) return { response: json({ error: 'Not signed in', code: 'notLoggedIn' }, 401) };

  let user;
  try {
    user = await currentUser(token);
  } catch (err) {
    if (err.status === 401) return { response: json({ error: 'Invalid or expired sign-in', code: 'loginExpired' }, 401) };
    return { response: json({ error: 'GitHub is unavailable right now - try again shortly', code: 'githubUnavailable' }, 503) };
  }
  if (!isAllowedLogin(user.login, env)) {
    return { response: json({ error: `The GitHub user '${user.login}' does not have publishing access`, code: 'notAllowed', login: user.login }, 403) };
  }

  return { config, token, user };
}
