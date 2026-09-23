/**
 * The analytics reference plugin (the SEO pack, feature map C14):
 * privacy-friendly visitor measurement via Cloudflare Web Analytics - no
 * cookies, no fingerprinting, a tracking-free core. The plugin registers no
 * blocks: it only adds the measurement script on visitor-facing pages when a
 * token is set in plugin.json (git-owned setup, see README.md).
 *
 * CSP (ADR-0006): the script-src and connect-src exceptions are declared in
 * the manifest; the Plugins panel shows the owner the exact _headers lines.
 */
export async function register() {
  // Never in the editor preview: editing sessions are not visits.
  if (new URLSearchParams(location.search).has('preview')) return;
  let config;
  try {
    config = (await (await fetch('/plugins/analytics/plugin.json')).json()).config;
  } catch {
    return;
  }
  const token = config?.token;
  if (typeof token !== 'string' || !token) return;
  const beacon = document.createElement('script');
  beacon.defer = true;
  beacon.src = 'https://static.cloudflareinsights.com/beacon.min.js';
  beacon.dataset.cfBeacon = JSON.stringify({ token });
  document.head.appendChild(beacon);
}
