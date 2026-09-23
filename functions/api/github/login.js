/**
 * GET /api/github/login
 * Starts GitHub OAuth: sets a random state cookie (CSRF protection) and
 * redirects to GitHub's authorization page.
 */
import { cfg } from '../../_lib/github.js';
import { serializeCookie } from '../../_lib/cookies.js';

export async function onRequestGet({ request, env }) {
  let config;
  try {
    config = cfg(env);
  } catch (err) {
    return new Response(err.message, { status: 503 });
  }

  const state = crypto.randomUUID();
  const authorize = new URL('https://github.com/login/oauth/authorize');
  authorize.searchParams.set('client_id', config.clientId);
  authorize.searchParams.set('redirect_uri', `${new URL(request.url).origin}/api/github/callback`);
  authorize.searchParams.set('scope', config.scope);
  authorize.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      location: authorize.toString(),
      'set-cookie': serializeCookie('urd_state', state, { maxAge: 600 }),
    },
  });
}
