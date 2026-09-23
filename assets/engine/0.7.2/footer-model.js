/**
 * Pure footer logic: brand, columns, social links and baseline are built from
 * site.footer and the page registry. No DOM - the module is importable in node
 * and covered by tests/footer.test.mjs; the DOM building lives in footer.js.
 */

import { resolveItem, isSafeUrl } from './nav-model.js';

// The safe-URL guard lives in nav-model (shared with resolveItem); re-exported
// here for footer.js and the tests that import it from here.
export { isSafeUrl };

// Safe to string: hand-edited site.json can hold numbers/booleans where the
// model expects text. An empty string keeps .trim()/.split() from throwing and
// toppling the whole footer render (the page never dies of bad data).
const str = (v) => (typeof v === 'string' ? v : '');

/**
 * The brand column: explicit title plus optional tagline. No fallback to the
 * site title - a footer that was just switched on should be empty, not filled
 * with the site name. Null when there is nothing to show.
 * @param {object} site
 * @returns {{title: string, tagline: string}|null}
 */
export function footerBrand(site) {
  const brand = site.footer?.brand ?? {};
  const title = str(brand.title).trim();
  const tagline = str(brand.tagline).trim();
  // The brand can be text, an uploaded logo (image) or both (additive since
  // v0.6, mirroring the nav logo). mode controls what is shown.
  const logo = str(brand.logo).trim();
  const mode = brand.mode === 'image' || brand.mode === 'both' ? brand.mode : 'text';
  const hasLogo = logo && mode !== 'text';
  if (!title && !tagline && !hasLogo) return null;
  return { title, tagline, logo, mode, logoHeight: brand.logoHeight };
}

/**
 * The columns with resolved links (page → path, href → external). Links without
 * a label are skipped, and a column with no valid links is not rendered (a lone
 * title is not worth a column in the finished footer).
 * @param {object} site
 * @returns {Array<{title: string, links: Array<{label: string, href: string, external: boolean, missing: boolean}>}>}
 */
export function footerColumns(site) {
  const pages = site.pages ?? [];
  const columns = Array.isArray(site.footer?.columns) ? site.footer.columns : [];
  return columns
    .map((col) => {
      const links = (Array.isArray(col.links) ? col.links : [])
        .filter((l) => str(l.label).trim())
        .map((l) => resolveItem(l, pages));
      return {
        title: str(col.title).trim(),
        links,
        // Long column (many links, or an explicit col.wide): rendered across two
        // tracks and split into two sub-columns, so the footer stays symmetric.
        wide: col.wide === true || links.length > 6,
      };
    })
    .filter((col) => col.links.length);
}

/**
 * The baseline's optional right-hand links (privacy/terms/«Made with Urd»),
 * resolved like the column links. Additive since v0.6.
 * @param {object} site
 * @returns {Array<{label: string, href: string, external: boolean, missing: boolean}>}
 */
export function footerBaselineLinks(site) {
  const pages = site.pages ?? [];
  const links = Array.isArray(site.footer?.baseline) ? site.footer.baseline : [];
  return links.filter((l) => str(l.label).trim()).map((l) => resolveItem(l, pages));
}

/**
 * The doormat link row: one centered row of links (the Centered and Big CTA
 * templates). Additive since v0.6.
 * @param {object} site
 * @returns {Array<{label: string, href: string, external: boolean, missing: boolean}>}
 */
export function footerLinkRow(site) {
  const pages = site.pages ?? [];
  const row = Array.isArray(site.footer?.linkRow) ? site.footer.linkRow : [];
  return row.filter((l) => str(l.label).trim()).map((l) => resolveItem(l, pages));
}

/**
 * The call to action (CTA, additive since v0.6): normalized or null.
 * `kind` is 'button' (button as a link) or 'newsletter' (email field). `big`
 * gives the large centered variant. A button CTA requires button text; a
 * newsletter requires at least a heading - otherwise the CTA is empty (null).
 * @param {object} site
 * @returns {{kind: string, heading: string, sub: string, label: string, big: boolean, target: object|null, endpoint: string, recipient: string, success: string}|null}
 */
export function footerCta(site) {
  const cta = site.footer?.cta;
  if (!cta || typeof cta !== 'object') return null;
  const heading = str(cta.heading).trim();
  const rawLabel = str(cta.label).trim();
  const kind = cta.kind === 'newsletter' ? 'newsletter' : 'button';
  if (kind === 'button' && !rawLabel) return null;
  if (kind === 'newsletter' && !heading && !rawLabel) return null;
  const pages = site.pages ?? [];
  return {
    kind,
    heading,
    sub: str(cta.sub).trim(),
    // An empty label/success is filled in by the render layer with the visitor
    // language's default text (footer.js + t()); the model is language-free (ADR-0012).
    label: rawLabel,
    big: cta.big === true,
    target: kind === 'button' ? resolveItem({ label: rawLabel, page: cta.page, href: cta.href }, pages) : null,
    endpoint: str(cta.endpoint).trim(),
    recipient: str(cta.recipient).trim(),
    success: str(cta.success).trim(),
  };
}

/**
 * Social links: only safe URLs pass through (footer.js additionally verifies
 * the icon id via iconSvg and drops unknown ones).
 * @param {object} site
 * @returns {Array<{icon: string, url: string}>}
 */
export function footerSocial(site) {
  const social = Array.isArray(site.footer?.social) ? site.footer.social : [];
  return social
    .filter((s) => s && typeof s.icon === 'string' && s.icon.trim() && isSafeUrl(s.url))
    .map((s) => ({ icon: s.icon.trim(), url: s.url.trim() }));
}

/**
 * The baseline: explicit copyright when set, otherwise the plain text lines
 * (backwards compatible: a footer with only text renders unchanged).
 * @param {object} site
 * @returns {Array<string>}
 */
export function footerBaseline(site) {
  const footer = site.footer ?? {};
  const copyright = str(footer.copyright).trim();
  if (copyright) return [copyright];
  return str(footer.text).split('\n').map((l) => l.trim()).filter(Boolean);
}

/**
 * Does the footer have any rich content (brand/columns/social/copyright)?
 * No → footer.js keeps the byte-identical plain text rendering.
 * @param {object} site
 * @returns {boolean}
 */
export function hasRichFooter(site) {
  return !!(
    footerBrand(site) ||
    footerColumns(site).length ||
    footerSocial(site).length ||
    footerBaselineLinks(site).length ||
    footerLinkRow(site).length ||
    footerCta(site) ||
    str(site.footer?.copyright).trim()
  );
}
