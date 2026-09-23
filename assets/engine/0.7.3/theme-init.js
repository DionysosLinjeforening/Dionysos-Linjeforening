/* Sets the stored light/dark choice as data-urd-theme BEFORE the first paint, so
   a manual choice does not flash. "Follow system" needs none of this (CSS
   light-dark() follows the OS on its own). A classic, parser-blocking script
   (CSP: script-src 'self', no 'unsafe-inline'), NOT a module - it is never
   imported and so stays out of the modulepreload list. The key mirrors MODE_KEY
   in theme.js. */
try {
  var m = localStorage.getItem('urd-theme-mode');
  if (m === 'light' || m === 'dark') {
    document.documentElement.setAttribute('data-urd-theme', m);
  }
} catch (e) {
  /* localStorage denied (private mode): follow the system. */
}
