/**
 * SEO metadata in the document head (the SEO pack): description, canonical,
 * og fields (Open Graph) and JSON-LD for the site. The engine sets the tags
 * when rendering for visitors (the index shell is Urd-owned and static, so
 * per-page metadata has to be added client side until the v0.8 baking).
 * The tags are built pure (node-tested); only applyHeadMeta touches the DOM.
 */

/** Absolute address from a page-relative path (media images, pages). */
function absolute(origin, path) {
  try {
    return new URL(path, origin.replace(/\/+$/, '') + '/').href;
  } catch {
    return null;
  }
}

/**
 * The meta tags for a page: [{tag, attrs}] in insertion order.
 * The og fields fall back stepwise: og.title -> page title, og.description
 * -> page description -> site description, og.image -> the site icon.
 * The X/Twitter card needs only the card tag (the rest is read from the og fields).
 * A hidden page (noindex in the page registry) gets robots-noindex and no
 * canonical, but keeps the sharing fields (sharing is a deliberate choice).
 * @param {object} site the site.json content (migrated)
 * @param {{meta?: {title?: string, description?: string, og?: {title?: string, description?: string, image?: string}}}} page
 * @param {string} origin The page's origin (https://...)
 * @param {string} path The page's path (/, /om-oss)
 * @param {{noindex?: boolean}} [entry] The page's entry in the page registry
 * @returns {{tag: string, attrs: Record<string, string>}[]}
 */
export function pageMetaTags(site, page, origin, path, entry = {}) {
  const meta = page?.meta ?? {};
  const og = meta.og ?? {};
  const siteTitle = site?.site?.title ?? '';
  const pageTitle = meta.title ?? '';
  const description = meta.description;
  const ogDescription = og.description ?? description ?? site?.site?.description ?? '';
  const image = og.image ?? site?.site?.icon ?? null;
  const canonical = absolute(origin, path === '/' ? '/' : path);

  const tags = [];
  if (entry?.noindex) tags.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex' } });
  if (description) tags.push({ tag: 'meta', attrs: { name: 'description', content: description } });
  if (canonical && !entry?.noindex) tags.push({ tag: 'link', attrs: { rel: 'canonical', href: canonical } });
  tags.push({ tag: 'meta', attrs: { property: 'og:type', content: 'website' } });
  tags.push({ tag: 'meta', attrs: { property: 'og:site_name', content: siteTitle } });
  tags.push({ tag: 'meta', attrs: { property: 'og:title', content: og.title || pageTitle || siteTitle } });
  if (ogDescription) tags.push({ tag: 'meta', attrs: { property: 'og:description', content: ogDescription } });
  if (canonical) tags.push({ tag: 'meta', attrs: { property: 'og:url', content: canonical } });
  const imageUrl = image ? absolute(origin, image) : null;
  if (imageUrl) tags.push({ tag: 'meta', attrs: { property: 'og:image', content: imageUrl } });
  tags.push({ tag: 'meta', attrs: { name: 'twitter:card', content: imageUrl ? 'summary_large_image' : 'summary' } });
  return tags;
}

/**
 * JSON-LD for the site: Organization with name, address, description and
 * logo (the fields from the Site panel). Rich search results for the target
 * audience (associations, small businesses) with no dependency.
 * @param {object} site the site.json content (migrated)
 * @param {string} origin
 * @returns {object}
 */
export function siteJsonLd(site, origin) {
  const base = String(origin ?? '').replace(/\/+$/, '');
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site?.site?.title ?? '',
    url: base + '/',
  };
  if (site?.site?.description) data.description = site.site.description;
  const logo = site?.site?.icon ? absolute(base, site.site.icon) : null;
  if (logo) data.logo = logo;
  return data;
}

/**
 * Writes the meta tags and the JSON-LD into <head>. Called per page render for
 * visitors; its own earlier tags are replaced (client-side navigation can call
 * it again), marked with data-urd-seo.
 */
export function applyHeadMeta(site, page, origin, path, entry) {
  for (const el of document.head.querySelectorAll('[data-urd-seo]')) el.remove();
  for (const { tag, attrs } of pageMetaTags(site, page, origin, path, entry)) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
    el.setAttribute('data-urd-seo', '1');
    document.head.appendChild(el);
  }
  const jsonLd = document.createElement('script');
  jsonLd.type = 'application/ld+json';
  jsonLd.setAttribute('data-urd-seo', '1');
  jsonLd.textContent = JSON.stringify(siteJsonLd(site, origin));
  document.head.appendChild(jsonLd);
}
