/**
 * Publish-generated visibility files (the SEO pack): sitemap.xml, robots.txt
 * and RSS feeds for dated collections. Pure string builders without DOM or
 * network (node-tested); the editor calls them on publish and commits the
 * result as content files, the same pattern as theme.css.
 * Absolute addresses are built from the origin the editor runs on (admin lives
 * on the deployed site).
 */

/** XML entities in text content and attributes. */
export function escapeXml(text) {
  return String(text ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

/**
 * sitemap.xml for the page registry. Hidden pages (noindex) are left out.
 * @param {{path: string, noindex?: boolean}[]} pages The page registry (site.pages)
 * @param {string} origin E.g. https://ekspempel.no (without a trailing slash)
 * @returns {string}
 */
export function buildSitemapXml(pages, origin) {
  const base = String(origin ?? '').replace(/\/+$/, '');
  const urls = (pages ?? [])
    .filter((p) => !p.noindex)
    .map((p) => `  <url><loc>${escapeXml(base + (p.path === '/' ? '/' : p.path))}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n`
    + `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

/**
 * robots.txt: everything open except admin, pointing at the sitemap.
 * @param {string} origin
 * @returns {string}
 */
export function buildRobotsTxt(origin) {
  const base = String(origin ?? '').replace(/\/+$/, '');
  return `User-agent: *\nDisallow: /admin/\n\nSitemap: ${base}/sitemap.xml\n`;
}

/** Collection kinds that get an RSS feed: dated content worth subscribing to. */
export const FEED_KINDS = ['news', 'notices', 'publications'];

/**
 * RSS 2.0 feed for a collection. The entries arrive READY as plain text
 * (rich text is stripped by the caller, which has the DOM); dates must be parsable.
 * @param {{title: string, description?: string, origin: string, path: string,
 *   items: {title: string, text?: string, date?: string, href?: string}[]}} feed
 * @returns {string}
 */
export function buildRssXml(feed) {
  const base = String(feed.origin ?? '').replace(/\/+$/, '');
  const items = (feed.items ?? []).map((item) => {
    const link = item.href ? new URL(item.href, base + '/').href : base + '/';
    const date = item.date ? new Date(item.date) : null;
    const pubDate = date && !Number.isNaN(date.getTime())
      ? `\n      <pubDate>${date.toUTCString()}</pubDate>` : '';
    const description = item.text ? `\n      <description>${escapeXml(item.text)}</description>` : '';
    return `    <item>\n      <title>${escapeXml(item.title)}</title>\n`
      + `      <link>${escapeXml(link)}</link>\n`
      + `      <guid isPermaLink="false">${escapeXml(`${feed.path}#${item.id ?? item.title}`)}</guid>`
      + `${description}${pubDate}\n    </item>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n`
    + `<rss version="2.0">\n  <channel>\n`
    + `    <title>${escapeXml(feed.title)}</title>\n`
    + `    <link>${escapeXml(base + '/')}</link>\n`
    + `    <description>${escapeXml(feed.description ?? feed.title)}</description>\n`
    + `${items}${items ? '\n' : ''}  </channel>\n</rss>\n`;
}
