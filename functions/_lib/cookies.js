/**
 * Cookie helpers for the OAuth token.
 *
 * The token is stored in an httpOnly + Secure + SameSite=Lax cookie
 * ('urd_gh') and NEVER reaches browser JS. A short-lived 'urd_state' cookie
 * protects the OAuth flow against CSRF.
 */

/**
 * @param {string} name
 * @param {string} value
 * @param {{maxAge?: number}} [opts] maxAge in seconds (default 30 days)
 * @returns {string} Value for a Set-Cookie header
 */
export function serializeCookie(name, value, opts = {}) {
  const maxAge = opts.maxAge ?? 60 * 60 * 24 * 30;
  return `${name}=${value}; Max-Age=${maxAge}; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

/** Set-Cookie value that deletes the cookie. */
export function expireCookie(name) {
  return `${name}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`;
}

/**
 * @param {Request} request
 * @param {string} name
 * @returns {string|null}
 */
export function readCookie(request, name) {
  const header = request.headers.get('cookie') ?? '';
  for (const part of header.split(/;\s*/)) {
    const eq = part.indexOf('=');
    if (eq > 0 && part.slice(0, eq).trim() === name) return part.slice(eq + 1);
  }
  return null;
}
