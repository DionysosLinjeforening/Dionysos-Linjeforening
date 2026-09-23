/**
 * Sets the site icon in the admin tab as early as possible.
 * Without this the default Urd mark shows until the editor bundle has loaded and read site.json, which looks like an icon flash on every load.
 * Runs as its own small file (the CSP does not allow inline scripts) before the editor bundle; the editor takes over the syncing afterwards.
 */
fetch('/content/site.json')
  .then((response) => response.json())
  .then((site) => {
    const icon = site?.site?.icon;
    // Same guard as in the editor: only data:image (base64) or a site-relative path, as an anchored regex (CodeQL recognises RegExp.test as a barrier).
    if (typeof icon !== 'string') return;
    if (!/^(?:data:image\/[\w.+-]+;base64,[A-Za-z0-9+/=]+|\/(?!\/)[\w%./-]*)$/.test(icon)) return;
    document.querySelector('link[rel="icon"]').href = icon;
  })
  .catch(() => {});
