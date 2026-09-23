/**
 * Pure nav logic: classifying menu items, page-register lookups and
 * appearance computation. No DOM - the module is node-importable and
 * covered by tests/nav.test.mjs; the DOM building lives in nav.js.
 */

import { resolveColor } from './theme.js';

// Safe image source: only known image shapes (a base64 data URL for
// unpublished uploads, or a site-relative path to media/) are let into
// img.src and CSS url(); everything else (external hosts, characters that
// break url("…")) is ignored. Anchored regex on purpose - CodeQL recognizes
// it as a barrier. Shared guard for the favicon, nav logo and background,
// footer logo, icon block and the image layer.
const SAFE_IMAGE_RE = /^(?:data:image\/[\w.+-]+;base64,[A-Za-z0-9+/=]+|\/(?!\/)[\w%./-]*)$/;

/** @param {unknown} src @returns {boolean} */
export function isSafeImage(src) {
  return typeof src === 'string' && SAFE_IMAGE_RE.test(src);
}

// Safe link URL for nav/footer links (item.href): only http(s), mailto and
// tel, like the footer social links. javascript:/data: and everything else
// is rejected, so an untouched href can never become an active URL.
// Anchored regex on purpose - CodeQL recognizes it as a barrier. Internal
// pages are linked via `page`, not href.
const SAFE_URL_RE = /^(?:https?:\/\/|mailto:|tel:)[^\s]+$/i;

/** @param {unknown} url @returns {boolean} */
export function isSafeUrl(url) {
  return typeof url === 'string' && SAFE_URL_RE.test(url.trim());
}

// Safe block href (button/image/collection/gallery): in addition to the
// external schemes above, site-internal paths ('/...', never
// protocol-relative '//...') and anchors ('#...') are accepted, as the
// collection schema documents for entry.href. Backslash is rejected in the
// path branch: browsers normalize '\' to '/' in http(s) URLs, so '/\evil.no'
// would otherwise become protocol-relative anyway. Anchored regex on
// purpose - CodeQL recognizes it as a barrier.
const SAFE_INTERNAL_RE = /^(?:\/(?![/\\])[^\s\\]*|#[^\s]*)$/;

/** @param {unknown} url @returns {boolean} */
export function isSafeHref(url) {
  return isSafeUrl(url) || (typeof url === 'string' && SAFE_INTERNAL_RE.test(url.trim()));
}

/**
 * Resolves a menu item against the page register: `page` is looked up to a
 * path, `href` is an external link OR a site-internal path/anchor (additive
 * since v0.6: `#section-id` and `/path#section-id` via isSafeHref, so
 * footer columns and menu items can point at sections - sections render
 * with a DOM id). An unknown page or unsafe href yields '#' with a missing
 * flag (nav.js logs the warning - this module has no side effects).
 * @param {{label: string, page?: string, href?: string}} item
 * @param {Array<{id: string, path: string}>} pages The page register (site.pages)
 * @returns {{label: string, href: string, external: boolean, missing: boolean}}
 */
export function resolveItem(item, pages) {
  if (item.page) {
    const target = pages.find((p) => p.id === item.page);
    return { label: item.label, href: target ? target.path : '#', external: false, missing: !target };
  }
  const href = (item.href ?? '').trim();
  if (isSafeUrl(href)) return { label: item.label, href, external: true, missing: false };
  // Internal targets never open in a new tab and get no rel - they are not external.
  if (isSafeHref(href)) return { label: item.label, href, external: false, missing: false };
  return { label: item.label, href: '#', external: false, missing: true };
}

/**
 * Builds the flat menu model nav.js renders from. Each item gets a `kind`:
 * 'link' (plain link), 'split' (own target plus submenu: link plus arrow
 * button) or 'toggle' (submenu only: the whole item is the opener). The
 * submenu is one level - any grandchildren are ignored defensively.
 * @param {{nav: {items?: Array<object>}, pages?: Array<object>}} site
 * @returns {Array<{label: string, href: string, external: boolean, missing: boolean, kind: string, children: Array<object>}>}
 */
export function navItems(site) {
  const pages = site.pages ?? [];
  return (site.nav.items ?? []).map((item) => {
    const children = Array.isArray(item.children)
      ? item.children.map((child) => resolveItem(child, pages))
      : [];
    const hasTarget = !!(item.page || item.href);
    const kind = children.length === 0 ? 'link' : hasTarget ? 'split' : 'toggle';
    // A toggle item has no link of its own - resolveItem would flag it as
    // missing, so openers are modeled without an href.
    const own = kind === 'toggle'
      ? { label: item.label, href: '', external: false, missing: false }
      : resolveItem(item, pages);
    return { ...own, kind, children };
  });
}

/**
 * Scroll behavior for the menu (nav.scroll, additive since v0.6): pure
 * state computation, the DOM part lives in nav.js. 'shrink' = compact
 * after some scrolling; 'hide' = hidden on scroll down, shown on scroll up.
 * Near the top (below TOP_ZONE) the menu is always normal and visible.
 * Small movements below JITTER never flip the hidden state (jitter guard
 * against e.g. scroll rounding at momentum stop).
 * @param {string|undefined} mode nav.scroll ('shrink' | 'hide' | undefined)
 * @param {number} prevY Previous scrollY
 * @param {number} y Current scrollY
 * @param {boolean} prevHidden Whether the menu was hidden
 * @returns {{compact: boolean, hidden: boolean}}
 */
export function navScrollState(mode, prevY, y, prevHidden) {
  const TOP_ZONE = 80;
  const JITTER = 4;
  if (mode === 'shrink') return { compact: y > TOP_ZONE, hidden: false };
  if (mode !== 'hide') return { compact: false, hidden: false };
  if (y <= TOP_ZONE) return { compact: false, hidden: false };
  if (Math.abs(y - prevY) < JITTER) return { compact: false, hidden: prevHidden };
  return { compact: false, hidden: y > prevY };
}

/**
 * The CSS classes on the nav element. Variant (floating pill) and hover
 * style (additive since v0.6) yield extra classes only when they deviate
 * from the default, so existing sites render unchanged.
 * @param {{nav: {layout?: string, variant?: string, style?: {hover?: string}}}} site
 * @returns {string}
 */
/** The floating variants (pill, square, tab) share the base class urd-nav-var-floating. */
function isFloating(variant) {
  return variant === 'floating' || variant === 'floating-square' || variant === 'floating-tab';
}

/**
 * How the submenus open on a mouse device: hover opens and closes them
 * (`hover`, the default), hover opens them and only a click, another item
 * or a click outside closes them (`stay`), or the pointer does nothing and
 * only a click opens and closes them (`click`). Touch never gets hover in
 * any mode. Pure function; an unknown value reads as the default.
 * @param {object} style nav.style
 * @returns {{hoverOpens: boolean, hoverCloses: boolean}}
 */
export function subOpenMode(style = {}) {
  const mode = style?.subOpen;
  if (mode === 'click') return { hoverOpens: false, hoverCloses: false };
  if (mode === 'stay') return { hoverOpens: true, hoverCloses: false };
  return { hoverOpens: true, hoverCloses: true };
}

export function navClasses(site) {
  let classes = `urd-nav urd-nav-${site.nav.layout ?? 'right'}`;
  const variant = site.nav.variant;
  if (isFloating(variant)) {
    classes += ' urd-nav-var-floating';
    // The square variant is the pill without rounded corners.
    if (variant === 'floating-square') classes += ' urd-nav-square';
    // The tab variant hangs down: square top, only the bottom corners rounded.
    if (variant === 'floating-tab') classes += ' urd-nav-tab';
    // Glow is an opt-in for the pill (off by default).
    if (site.nav.style?.glow) classes += ' urd-nav-glow';
    // Space above the pill is the default; topGap: false puts it flush at the top.
    if (site.nav.style?.topGap === false) classes += ' urd-nav-flush';
  }
  const hover = site.nav.style?.hover;
  if (hover && hover !== 'standard') classes += ` urd-nav-hover-${hover}`;
  // Size (additive since v0.6): md is the default and yields no class.
  // The values are allowlisted - class names must never be built from free strings.
  const size = site.nav.style?.size;
  if (['sm', 'lg', 'xl'].includes(size)) classes += ` urd-nav-size-${size}`;
  // Text alignment of the items in the side column (default left).
  const salign = site.nav.style?.sideAlign;
  if (['center', 'right'].includes(salign)) classes += ` urd-nav-salign-${salign}`;
  // Vertical placement of the menu list in the column (default top). Its
  // own field, not nav.layout: layout is the top bar's concept.
  const splace = site.nav.style?.sidePlacement;
  if (['middle', 'bottom'].includes(splace)) classes += ` urd-nav-splace-${splace}`;
  // Submenu design (default is the card style).
  const sub = site.nav.style?.subStyle;
  if (['flat', 'pills', 'lines', 'flyout'].includes(sub)) classes += ` urd-nav-sub-${sub}`;
  // Inset (additive since v0.7, ADR-0023): the bar's contents line up with
  // the content edge while the background keeps the full width. Only the
  // top bar can be inset; the pill has its own width and the column none.
  const isBar = !isFloating(variant) && variant !== 'side-left' && variant !== 'side-right';
  if (site.nav.style?.inset === true && isBar) classes += ' urd-nav-inset';
  // The logo image follows the scroll shrink (additive since v0.7).
  if (site.nav.style?.shrinkLogo === true) classes += ' urd-nav-shrink-logo';
  // Border and shadow (additive since v0.7): the side the border sits on
  // and the shadow strength are allowlisted classes; the border's width and
  // colour are variables set by nav.js. The column draws no border, and the
  // pill has its glow instead of a shadow.
  const isSide = variant === 'side-left' || variant === 'side-right';
  const borderSide = site.nav.style?.border?.side;
  if (['bottom', 'top', 'both', 'all'].includes(borderSide) && !isSide) classes += ` urd-nav-border-${borderSide}`;
  const shadow = site.nav.style?.shadow;
  if (['soft', 'strong'].includes(shadow) && isBar) classes += ` urd-nav-shadow-${shadow}`;
  return classes;
}

/**
 * The border's width in px (nav.style.border.width), clamped to 1-8;
 * anything invalid yields 1.
 */
export function clampBorderWidth(width) {
  const n = Number(width);
  if (!Number.isFinite(n)) return 1;
  return Math.min(8, Math.max(1, Math.round(n)));
}

/**
 * The bounds of the size fields (nav.style.*, nav.logo.*), shared with the
 * schema and the editor's nav-size module (a parity test ties them together).
 */
export const NAV_SIZE_BOUNDS = {
  padY: [0, 64],
  textSize: [12, 28],
  padX: [0, 80],
  gap: [0, 64],
  pillWidth: [480, 1920],
  shrinkTo: [0.3, 0.8],
  logoSize: [12, 128],
};

/** A number clamped to [min, max] with the given decimals; undefined when the value is not a number. */
function clampNum(value, [min, max], decimals = 0) {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  const f = 10 ** decimals;
  return Math.min(max, Math.max(min, Math.round(n * f) / f));
}

/**
 * The inline size values for the nav element (ADR-0023): custom properties
 * the CSS reads with today's look as the fallback, the menu font size and
 * the logo image height. The mobile overrides (nav.style.mobile and
 * nav.logo.mobileSize) are chosen here from the breakpoint state at render
 * time: the burger class is also set by content folding on desktop, and a
 * class rule can never beat an inline value, so the choice belongs in JS.
 * An empty style yields empty vars.
 * @param {object} [style] nav.style
 * @param {object} [logo] nav.logo
 * @param {{mobile?: boolean}} [state] Whether the mobile breakpoint matches
 * @returns {{vars: Record<string, string>, font: string|undefined, logoSize: number}}
 */
export function navSizeVars(style = {}, logo = {}, { mobile = false } = {}) {
  const s = style ?? {};
  const m = mobile && s.mobile && typeof s.mobile === 'object' ? s.mobile : {};
  const vars = {};
  const padY = clampNum(m.padY ?? s.padY, NAV_SIZE_BOUNDS.padY);
  if (padY !== undefined) vars['--urd-nav-pad-y'] = `${padY}px`;
  const padX = clampNum(s.padX, NAV_SIZE_BOUNDS.padX);
  if (padX !== undefined) vars['--urd-nav-pad-x'] = `${padX}px`;
  const gap = clampNum(s.gap, NAV_SIZE_BOUNDS.gap);
  if (gap !== undefined) vars['--urd-nav-gap'] = `${gap}px`;
  // The pill width applies above the breakpoint only: on a phone the pill
  // keeps the full width minus its air, as without the field.
  if (!mobile) {
    if (s.pillWidth === 'content') {
      vars['--urd-nav-pill-w'] = 'min(var(--urd-canvas-w, 100%), calc(100% - 2 * var(--urd-canvas-gutter-desktop, 0px)))';
    } else {
      const w = clampNum(s.pillWidth, NAV_SIZE_BOUNDS.pillWidth);
      if (w !== undefined) vars['--urd-nav-pill-w'] = `${w}px`;
    }
  }
  const shrinkTo = clampNum(s.shrinkTo, NAV_SIZE_BOUNDS.shrinkTo, 2);
  if (shrinkTo !== undefined) vars['--urd-nav-shrink-to'] = String(shrinkTo);
  const textSize = clampNum(m.textSize ?? s.textSize, NAV_SIZE_BOUNDS.textSize);
  const l = logo ?? {};
  const logoSize = clampNum(mobile ? (l.mobileSize ?? l.size) : l.size, NAV_SIZE_BOUNDS.logoSize) ?? 32;
  return { vars, font: textSize !== undefined ? `${textSize}px` : undefined, logoSize };
}

/**
 * Classes for the HOST (the header element) and body, derived from the
 * variant: floating takes the host out of the flow; the side variant turns
 * it into a fixed column and gives body content padding on the same side.
 * @param {{nav: {variant?: string}}} site
 * @returns {{host: string[], body: string[]}}
 */
export function hostClasses(site) {
  const v = site.nav.variant;
  if (isFloating(v)) return { host: ['urd-nav-float'], body: [] };
  if (v === 'side-left') return { host: ['urd-nav-side-host', 'urd-nav-side-host-left'], body: ['urd-side-left'] };
  if (v === 'side-right') return { host: ['urd-nav-side-host', 'urd-nav-side-host-right'], body: ['urd-side-right'] };
  // Overlay only applies to the full-width bar: the host is taken out of the
  // flow so the top section slides up under the menu. Floating/side already
  // sit outside.
  if (site.nav.overlay) return { host: ['urd-nav-overlay'], body: [] };
  return { host: [], body: [] };
}

/**
 * Computes the appearance overrides from nav.style: `bg` is the finished
 * background value for --urd-nav-bg (submenus and the mobile panel reuse
 * the var), `blur: false` turns the blur off, `color` is the text color.
 * With `image` (additive since v0.6) the background becomes the image
 * with the color/opacity as a veil on top. An empty object = the CSS
 * defaults apply.
 * @param {{bg?: string, bgOpacity?: number, blur?: boolean, textColor?: string, image?: string}} [style]
 * @returns {{bg?: string, blur?: boolean, color?: string}}
 */
export function navSurface(style = {}) {
  const out = {};
  const hasVeil = style.bg || style.bgOpacity != null;
  if (isSafeImage(style.image)) {
    // The veil is repeated as a gradient layer over the image; without
    // explicit choices the default surface is used (surface at 85 %), so
    // the text always has a background to sit on.
    const color = resolveColor(style.bg ?? 'surface');
    const cover = veil(style);
    const layers = [`linear-gradient(${cover}, ${cover})`];
    // Image strength (0..1, default 1): a weaker image is toned toward the
    // background color with its own layer under the veil - CSS cannot set
    // opacity on a single background layer.
    const strength = style.imageOpacity ?? 1;
    if (strength < 1) {
      const fade = `color-mix(in srgb, ${color} ${Math.round((1 - strength) * 100)}%, transparent)`;
      layers.push(`linear-gradient(${fade}, ${fade})`);
    }
    // Crop position (0..100, default 50 centered): the height is what
    // matters in the low wide bar, the width in the tall narrow side
    // column - both are exposed, so the choice works in every variant.
    const x = Math.min(100, Math.max(0, style.imageX ?? 50));
    const y = Math.min(100, Math.max(0, style.imageY ?? 50));
    layers.push(`url("${style.image}") ${x}% ${y}% / cover`);
    out.bg = layers.join(', ');
  } else if (hasVeil) {
    out.bg = veil(style);
  }
  if (style.blur === false) out.blur = false;
  if (style.textColor) out.color = resolveColor(style.textColor);
  return out;
}

/** The veil alone (the color with opacity), without the image layers. */
function veil(style) {
  const color = resolveColor(style.bg ?? 'surface');
  const pct = Math.round((style.bgOpacity ?? 0.85) * 100);
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}

/**
 * The background for the submenu and the mobile panel (--urd-nav-sub-bg):
 * by default ONLY the veil, never the background image - the image comes
 * along only when the owner turns on nav.style.subImage. Undefined = the
 * CSS default applies.
 * @param {{bg?: string, bgOpacity?: number, image?: string, subImage?: boolean}} [style]
 * @returns {string|undefined}
 */
export function navSubSurface(style = {}) {
  if (isSafeImage(style.image) && style.subImage === true) {
    return navSurface(style).bg;
  }
  if (style.bg || style.bgOpacity != null) return veil(style);
  return undefined;
}

/**
 * Flattens the layer stack's COLOR layers into one veil for the submenu
 * and the mobile panel, so the dropdown follows the bar's tone when the
 * nav has a layer background. Image and gradient layers are kept out, the
 * same principle as subImage: the submenu never gets the image. Layers are
 * drawn in list order (first at the back), so each color layer is mixed
 * over the previous ones. Null = no color layers, the CSS default applies.
 * @param {Array<{type?: string, props?: {value?: string, opacity?: number}}>} [layers]
 * @returns {string|null}
 */
export function navLayerVeil(layers) {
  let mix = null;
  for (const layer of Array.isArray(layers) ? layers : []) {
    if (layer?.type !== 'color') continue;
    const pct = Math.round(Math.min(1, Math.max(0, layer.props?.opacity ?? 1)) * 100);
    if (pct === 0) continue;
    const color = resolveColor(layer.props?.value ?? 'bg');
    mix = `color-mix(in srgb, ${color} ${pct}%, ${mix ?? 'transparent'})`;
  }
  return mix;
}

/**
 * The side column's width in px (nav.style.width), clamped to sensible
 * bounds; anything invalid yields the default width 250.
 * @param {number|string|undefined} width
 * @returns {number}
 */
export function clampSideWidth(width) {
  const n = Number(width);
  if (!Number.isFinite(n)) return 250;
  return Math.min(400, Math.max(180, Math.round(n)));
}
