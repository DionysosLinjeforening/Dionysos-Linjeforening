/**
 * GET /api/github/callback
 * OAuth return: validates state against the cookie, exchanges code for a
 * token SERVER-SIDE (with client_secret), stores the token in the httpOnly
 * cookie 'urd_gh' and redirects to /admin/. The token never reaches browser JS.
 */
import { cfg } from '../../_lib/github.js';
import { serializeCookie, expireCookie, readCookie } from '../../_lib/cookies.js';

export async function onRequestGet({ request, env }) {
  let config;
  try {
    config = cfg(env);
  } catch (err) {
    return new Response(err.message, { status: 503 });
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  if (!code || !state || state !== readCookie(request, 'urd_state')) {
    return new Response('Invalid OAuth state (try signing in again)', { status: 400 });
  }

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
    }),
  });
  // GitHub can answer with an error status or an HTML error page instead of
  // JSON (service disruptions): the sign-in is then rejected gracefully rather
  // than throwing a 500.
  let token;
  try {
    if (tokenRes.ok) token = (await tokenRes.json()).access_token;
  } catch { /* an unreadable response is treated as a rejected sign-in */ }
  if (!token) {
    return new Response('GitHub rejected the sign-in (expired code?)', { status: 401 });
  }

  const headers = new Headers({ location: '/admin/' });
  headers.append('set-cookie', serializeCookie('urd_gh', token));
  headers.append('set-cookie', expireCookie('urd_state'));
  return new Response(null, { status: 302, headers });
}
