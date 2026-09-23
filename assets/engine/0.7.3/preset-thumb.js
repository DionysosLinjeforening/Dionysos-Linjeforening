/**
 * Auto-generated preset thumbnails: a schematic SVG sketch of the section
 * a preset creates, drawn from the actual blocks and background. Always in
 * sync with the preset, and follows the site's theme via CSS variables.
 * Pure string building without the DOM, so the generator is tested with
 * node --test.
 *
 * No user strings are interpolated into the SVG: colors only pass through
 * as validated hex or theme tokens (anchored regexes), everything else is
 * numbers we computed ourselves. Safe for insertAdjacentHTML.
 */

const HEX_RE = /^#[0-9a-fA-F]{3,8}$/;
const TOKEN_RE = /^[a-z][a-z0-9-]*$/;

/* Neutral fallback colors when the theme variables are absent (e.g. in tests). */
const FALLBACK_BG = '#171c26';
const FALLBACK_SURFACE = '#232a38';
const FALLBACK_TEXT = '#98a1b3';
const FALLBACK_ACCENT = '#7c5cff';

const token = (name, fallback) => `var(--urd-color-${name}, ${fallback})`;

/** Theme token or hex → safe SVG fill value; anything else yields the fallback. */
function safeColor(value, fallback) {
  if (typeof value !== 'string') return fallback;
  if (HEX_RE.test(value)) return value;
  if (TOKEN_RE.test(value)) return token(value, fallback);
  return fallback;
}

/** The section's minimum height in px: '360px' → 360, '70vh' → 560 (vh base 800), garbage → 400. */
export function parseMinHeightPx(minHeight, vhBase = 800) {
  const n = Number.parseFloat(minHeight);
  if (!Number.isFinite(n) || n <= 0) return 400;
  if (typeof minHeight === 'string' && minHeight.trim().endsWith('vh')) return (n / 100) * vhBase;
  return n;
}

const r1 = (v) => Math.round(v * 10) / 10;
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const rect = (x, y, w, h, fill, extra = '') =>
  `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(Math.max(w, 1))}" height="${r1(Math.max(h, 1))}" fill="${fill}"${extra}/>`;

/** The background fill: the first color/gradient layer sets the tone. A
 *  role set (section.theme) outweighs the token background, so bands with
 *  an inverse/soft/muted role read honestly in the gallery instead of as
 *  yet another bg surface. */
function bgFill(section) {
  if (section?.theme) {
    if (section.theme === 'inverse' || section.theme === 'deep') return token('text', FALLBACK_TEXT);
    if (section.theme === 'accent') return token('accent', FALLBACK_ACCENT);
    return token('surface', FALLBACK_SURFACE);
  }
  for (const layer of section?.background?.layers ?? []) {
    if (layer.type === 'color') return safeColor(layer.props?.value, FALLBACK_BG);
    if (layer.type === 'gradient') {
      const stop = Array.isArray(layer.props?.stops) ? layer.props.stops[0] : null;
      return safeColor(stop, FALLBACK_BG);
    }
  }
  return token('bg', FALLBACK_BG);
}

/**
 * Text block: 1-3 lines; headings give a thicker first line. The line
 * dimensions shrink proportionally when the field is shorter than natural
 * (the page thumbnails' bands), with a floor so the first line always
 * leaves a readable trace - a heading must never vanish from the card.
 * box texts (a card surface in the engine) get the card drawn behind the
 * lines.
 */
function textShapes(x, y, w, h, props) {
  const heading = /<h[1-3]/.test(String(props?.html ?? ''));
  const centered = props?.align === 'center';
  const textFill = token('text', FALLBACK_TEXT);
  const parts = [];
  if (props?.box) parts.push(rect(x, y, w, h, token('surface', FALLBACK_SURFACE), ' rx="1.5"'));
  const pad = props?.box ? Math.min(2, w * 0.06) : 0;
  const ix = x + pad;
  const iw = w - pad * 2;
  const widths = [0.72, 0.9, 0.5];
  const natural = [heading ? 4 : 2.2, 2.2, 2.2];
  const naturalH = natural[0] + natural[1] + natural[2] + 2.4 * 2 + 2;
  const f = clamp(h / naturalH, 0, 1);
  let ly = y + pad + Math.min(1, h * 0.08);
  for (let i = 0; i < 3; i++) {
    const lh = Math.min(Math.max(i === 0 ? (heading ? 1.4 : 1) : 0.8, natural[i] * f), Math.max(h, 1));
    if (i > 0 && ly + lh > y + h - pad) break;
    const lw = iw * widths[i];
    const lx = centered ? ix + (iw - lw) / 2 : ix;
    parts.push(rect(lx, ly, lw, lh, textFill, ` opacity="${i === 0 ? 0.8 : 0.4}" rx="${r1(Math.min(1, lh / 2))}"`));
    ly += lh + Math.max(0.8, 2.4 * f);
  }
  return parts.join('');
}

/**
 * Image frame. With an image set: a surface with mountains and a sun (the
 * classic placeholder glyph). Without an image the EMPTY state is drawn
 * (dashed outline and pale glyph), which is what the new page actually
 * shows.
 */
function imageShapes(x, y, w, h, empty = false) {
  const textFill = token('text', FALLBACK_TEXT);
  const parts = [];
  if (empty) {
    parts.push(rect(x, y, w, h, token('surface', FALLBACK_SURFACE), ' rx="1.5" opacity="0.35"'));
    parts.push(`<rect x="${r1(x + 0.4)}" y="${r1(y + 0.4)}" width="${r1(Math.max(w - 0.8, 1))}" height="${r1(Math.max(h - 0.8, 1))}" fill="none" stroke="${textFill}" stroke-width="0.6" stroke-dasharray="2 2" opacity="0.35" rx="1.5"/>`);
  } else {
    parts.push(rect(x, y, w, h, token('surface', FALLBACK_SURFACE), ' rx="1.5"'));
  }
  const glyphOpacity = empty ? 0.15 : 0.4;
  const px = (f) => r1(x + w * f);
  const py = (f) => r1(y + h * f);
  parts.push(`<polygon points="${px(0.08)},${py(0.9)} ${px(0.42)},${py(0.38)} ${px(0.62)},${py(0.68)} ${px(0.75)},${py(0.5)} ${px(0.92)},${py(0.9)}" fill="${textFill}" opacity="${glyphOpacity}"/>`);
  parts.push(`<circle cx="${px(0.28)}" cy="${py(0.26)}" r="${r1(Math.max(1, Math.min(w, h) * 0.1))}" fill="${textFill}" opacity="${r1(glyphOpacity + 0.1)}"/>`);
  return parts.join('');
}

/** Gallery: three tiles side by side inside the frame; an empty gallery is drawn empty. */
function galleryShapes(x, y, w, h, props) {
  const empty = !(Array.isArray(props?.images) && props.images.length);
  const gap = Math.max(1, w * 0.03);
  const tw = (w - gap * 2) / 3;
  const parts = [];
  for (let i = 0; i < 3; i++) parts.push(imageShapes(x + i * (tw + gap), y, tw, h, empty));
  return parts.join('');
}

/** Collection: three small cards with a text line below. */
function collectionShapes(x, y, w, h) {
  const gap = Math.max(1, w * 0.03);
  const tw = (w - gap * 2) / 3;
  const parts = [];
  for (let i = 0; i < 3; i++) {
    const tx = x + i * (tw + gap);
    parts.push(rect(tx, y, tw, h * 0.55, token('surface', FALLBACK_SURFACE), ' rx="1.5"'));
    parts.push(rect(tx, y + h * 0.62, tw * 0.8, 2, token('text', FALLBACK_TEXT), ' opacity="0.5" rx="1"'));
  }
  return parts.join('');
}

function shapeShapes(x, y, w, h, props) {
  const fill = safeColor(props?.color, FALLBACK_ACCENT);
  const kind = props?.kind;
  if (kind === 'circle') {
    return `<ellipse cx="${r1(x + w / 2)}" cy="${r1(y + h / 2)}" rx="${r1(Math.max(w / 2, 1))}" ry="${r1(Math.max(h / 2, 1))}" fill="${fill}" opacity="0.8"/>`;
  }
  if (kind === 'triangle') {
    return `<polygon points="${r1(x)},${r1(y + h)} ${r1(x + w / 2)},${r1(y)} ${r1(x + w)},${r1(y + h)}" fill="${fill}" opacity="0.8"/>`;
  }
  if (kind === 'line' || kind === 'arrow') {
    return rect(x, y + h / 2 - 0.75, w, 1.5, fill, ' opacity="0.85" rx="0.75"');
  }
  return rect(x, y, w, h, fill, ' opacity="0.8" rx="1"');
}

function blockShapes(type, x, y, w, h, props) {
  if (type === 'text') return textShapes(x, y, w, h, props);
  if (type === 'image') return imageShapes(x, y, w, h, !props?.src);
  if (type === 'gallery') return galleryShapes(x, y, w, h, props);
  if (type === 'collection') return collectionShapes(x, y, w, h);
  if (type === 'faq') {
    // Accordion: rows with a surface + question line and chevron dot.
    const rows = clamp(Math.floor(h / 5), 2, 3);
    const gap = Math.max(0.6, h * 0.04);
    const rowH = (h - gap * (rows - 1)) / rows;
    const parts = [];
    for (let i = 0; i < rows; i += 1) {
      const ry = y + i * (rowH + gap);
      parts.push(rect(x, ry, w, rowH, token('surface', FALLBACK_SURFACE), ' rx="1"'));
      parts.push(rect(x + w * 0.06, ry + rowH / 2 - 0.7, w * 0.55, 1.4, token('text', FALLBACK_TEXT), ' opacity="0.5" rx="0.7"'));
      parts.push(`<circle cx="${r1(x + w * 0.92)}" cy="${r1(ry + rowH / 2)}" r="0.9" fill="${token('text', FALLBACK_TEXT)}" opacity="0.4"/>`);
    }
    return parts.join('');
  }
  if (type === 'shape') return shapeShapes(x, y, w, h, props);
  if (type === 'button') {
    return rect(x, y, w, h, token('accent', FALLBACK_ACCENT), ` rx="${r1(Math.min(h / 2, 4))}"`);
  }
  if (type === 'icon') {
    const r = Math.max(1.2, Math.min(w, h) / 2);
    return `<circle cx="${r1(x + w / 2)}" cy="${r1(y + h / 2)}" r="${r1(r)}" fill="${token('accent', FALLBACK_ACCENT)}" opacity="0.85"/>`;
  }
  if (type === 'video') {
    const parts = [rect(x, y, w, h, token('surface', FALLBACK_SURFACE), ' rx="1.5"')];
    const cx = x + w / 2;
    const cy = y + h / 2;
    const s = Math.max(1.5, Math.min(w, h) * 0.22);
    parts.push(`<polygon points="${r1(cx - s / 2)},${r1(cy - s)} ${r1(cx - s / 2)},${r1(cy + s)} ${r1(cx + s)},${r1(cy)}" fill="${token('text', FALLBACK_TEXT)}" opacity="0.6"/>`);
    return parts.join('');
  }
  if (type === 'timeline') {
    const parts = [rect(x + 1, y, 1.4, h, token('accent', FALLBACK_ACCENT), ' opacity="0.7" rx="0.7"')];
    for (let i = 0; i < 3; i += 1) {
      const cy = y + h * (0.18 + i * 0.32);
      parts.push(`<circle cx="${r1(x + 1.7)}" cy="${r1(cy)}" r="1.6" fill="${token('accent', FALLBACK_ACCENT)}"/>`);
      parts.push(rect(x + 5, cy - 1, w * 0.5, 2, token('text', FALLBACK_TEXT), ' opacity="0.5" rx="1"'));
    }
    return parts.join('');
  }
  if (type === 'quote') {
    return [
      `<text x="${r1(x + w / 2)}" y="${r1(y + h * 0.34)}" text-anchor="middle" font-size="${r1(Math.min(w, h) * 0.5)}" font-family="Georgia, serif" fill="${token('accent', FALLBACK_ACCENT)}">“</text>`,
      rect(x + w * 0.15, y + h * 0.48, w * 0.7, 2, token('text', FALLBACK_TEXT), ' opacity="0.6" rx="1"'),
      rect(x + w * 0.25, y + h * 0.62, w * 0.5, 2, token('text', FALLBACK_TEXT), ' opacity="0.6" rx="1"'),
      rect(x + w * 0.35, y + h * 0.82, w * 0.3, 1.6, token('text', FALLBACK_TEXT), ' opacity="0.35" rx="0.8"'),
    ].join('');
  }
  if (type === 'stats') {
    return [
      rect(x + w * 0.28, y + h * 0.15, w * 0.44, h * 0.42, token('accent', FALLBACK_ACCENT), ' opacity="0.85" rx="1"'),
      rect(x + w * 0.32, y + h * 0.72, w * 0.36, 1.6, token('text', FALLBACK_TEXT), ' opacity="0.4" rx="0.8"'),
    ].join('');
  }
  if (type === 'table') {
    // Header band + row lines with column dividers.
    const headH = Math.max(1.6, h * 0.22);
    const parts = [rect(x, y, w, headH, token('accent', FALLBACK_ACCENT), ' opacity="0.5" rx="0.8"')];
    const rows = clamp(Math.floor((h - headH) / 3.2), 1, 3);
    for (let i = 0; i < rows; i += 1) {
      parts.push(rect(x, y + headH + 1 + i * ((h - headH - 1) / rows), w, 1, token('text', FALLBACK_TEXT), ' opacity="0.3"'));
    }
    parts.push(rect(x + w * 0.33, y, 0.6, h, token('text', FALLBACK_TEXT), ' opacity="0.2"'));
    parts.push(rect(x + w * 0.66, y, 0.6, h, token('text', FALLBACK_TEXT), ' opacity="0.2"'));
    return parts.join('');
  }
  if (type === 'share') {
    // Row of small icon discs.
    const r = Math.max(1.2, Math.min(h / 2, w / 9));
    const parts = [];
    for (let i = 0; i < 4; i += 1) {
      parts.push(`<circle cx="${r1(x + r + i * (r * 2 + 1.5))}" cy="${r1(y + h / 2)}" r="${r1(r)}" fill="${token('accent', FALLBACK_ACCENT)}" opacity="0.8"/>`);
    }
    return parts.join('');
  }
  if (type === 'countdown') {
    // Four unit boxes with digit slots.
    const gap = Math.max(0.8, w * 0.03);
    const bw = (w - gap * 3) / 4;
    const parts = [];
    for (let i = 0; i < 4; i += 1) {
      const bx = x + i * (bw + gap);
      parts.push(rect(bx, y, bw, h, token('surface', FALLBACK_SURFACE), ' rx="1"'));
      parts.push(rect(bx + bw * 0.25, y + h * 0.2, bw * 0.5, h * 0.35, token('accent', FALLBACK_ACCENT), ' opacity="0.85" rx="0.8"'));
    }
    return parts.join('');
  }
  if (type === 'audio') {
    // Player bar: a surface with a play triangle and progress stripe.
    const parts = [rect(x, y, w, h, token('surface', FALLBACK_SURFACE), ' rx="1.5"')];
    const cy = y + h / 2;
    const s = Math.max(1.2, h * 0.28);
    parts.push(`<polygon points="${r1(x + w * 0.06)},${r1(cy - s)} ${r1(x + w * 0.06)},${r1(cy + s)} ${r1(x + w * 0.06 + s * 1.4)},${r1(cy)}" fill="${token('accent', FALLBACK_ACCENT)}" opacity="0.85"/>`);
    parts.push(rect(x + w * 0.2, cy - 0.6, w * 0.7, 1.2, token('text', FALLBACK_TEXT), ' opacity="0.35" rx="0.6"'));
    return parts.join('');
  }
  if (type === 'product') {
    // Product cards: three cards with an image field, price line and buy button.
    const gap = Math.max(0.8, w * 0.03);
    const cw = (w - gap * 2) / 3;
    const parts = [];
    for (let i = 0; i < 3; i += 1) {
      const cx = x + i * (cw + gap);
      parts.push(rect(cx, y, cw, h, token('surface', FALLBACK_SURFACE), ' rx="1"'));
      parts.push(rect(cx + cw * 0.08, y + h * 0.06, cw * 0.84, h * 0.42, token('text', FALLBACK_TEXT), ' opacity="0.15" rx="0.8"'));
      parts.push(rect(cx + cw * 0.08, y + h * 0.56, cw * 0.6, 1.4, token('text', FALLBACK_TEXT), ' opacity="0.5" rx="0.7"'));
      parts.push(rect(cx + cw * 0.08, y + h * 0.72, cw * 0.35, 1.4, token('accent', FALLBACK_ACCENT), ' opacity="0.85" rx="0.7"'));
      parts.push(rect(cx + cw * 0.08, y + h * 0.84, cw * 0.84, h * 0.1, token('accent', FALLBACK_ACCENT), ' opacity="0.6" rx="1"'));
    }
    return parts.join('');
  }
  if (type === 'cart') {
    // Cart disc with a count dot in the top right.
    const r = Math.max(1.5, Math.min(w, h) / 2.4);
    const cx = x + w / 2;
    const cy = y + h / 2;
    return [
      `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(r)}" fill="${token('surface', FALLBACK_SURFACE)}"/>`,
      rect(cx - r * 0.5, cy - r * 0.25, r, r * 0.55, token('text', FALLBACK_TEXT), ' opacity="0.5" rx="0.4"'),
      `<circle cx="${r1(cx + r * 0.75)}" cy="${r1(cy - r * 0.75)}" r="${r1(Math.max(0.9, r * 0.35))}" fill="${token('accent', FALLBACK_ACCENT)}"/>`,
    ].join('');
  }
  if (type === 'checkout') {
    // Order lines at the top, two field bands and a submit button at the bottom.
    return [
      rect(x, y, w * 0.7, 1.2, token('text', FALLBACK_TEXT), ' opacity="0.5" rx="0.6"'),
      rect(x, y + h * 0.12, w * 0.5, 1.2, token('text', FALLBACK_TEXT), ' opacity="0.35" rx="0.6"'),
      rect(x, y + h * 0.3, w, h * 0.14, token('surface', FALLBACK_SURFACE), ' rx="1"'),
      rect(x, y + h * 0.5, w, h * 0.14, token('surface', FALLBACK_SURFACE), ' rx="1"'),
      rect(x, y + h * 0.78, w * 0.45, h * 0.16, token('accent', FALLBACK_ACCENT), ' opacity="0.85" rx="1.2"'),
    ].join('');
  }
  // Unknown type (e.g. from a plugin): a calm card outline.
  return rect(x, y, w, h, token('surface', FALLBACK_SURFACE), ' rx="1.5"');
}

/** One section's sketch content (background + glow + blocks) in a w x h field. */
function sectionShapes(section, w, h) {
  const blocks = Array.isArray(section?.blocks) ? section.blocks : [];
  const bottoms = blocks.map((b) => (b.frames?.desktop?.y ?? 0) + (b.frames?.desktop?.h ?? 0));
  const contentH = Math.max(
    parseMinHeightPx(section?.size?.minHeight),
    bottoms.length ? Math.max(...bottoms) + 16 : 0,
  );
  const sy = h / contentH;
  const parts = [rect(0, 0, w, h, bgFill(section))];

  // Glow layers as a soft circle, so hero-like presets keep their character.
  for (const layer of section?.background?.layers ?? []) {
    if (layer.type !== 'glow') continue;
    const p = layer.props ?? {};
    parts.push(`<circle cx="${r1(clamp(p.x ?? 0.5, 0, 1) * w)}" cy="${r1(clamp(p.y ?? 0.3, 0, 1) * h)}" r="${r1(w * clamp(p.radius ?? 0.5, 0.1, 1) * 0.5)}" fill="${safeColor(p.color, FALLBACK_ACCENT)}" opacity="${r1(clamp(p.opacity ?? 0.3, 0, 0.5))}"/>`);
  }

  // The content surface (ADR-0018): the blocks' x/w are percentages of the
  // bound canvas, not of the full width. A fixed side margin mirrors the
  // default gutter, so the content sits inset as on the actual page.
  const inset = w * 0.06;
  const cw = w - inset * 2;
  for (const block of blocks) {
    const d = block.frames?.desktop;
    if (!d) continue;
    const x = clamp(inset + (d.x ?? 0) * (cw / 100), 0, w - 2);
    const y = clamp((d.y ?? 0) * sy, 0, h - 2);
    const bw = clamp((d.w ?? 10) * (cw / 100), 2, w - x);
    const bh = clamp((d.h ?? 20) * sy, 2, h - y);
    parts.push(blockShapes(block.type, x, y, bw, bh, block.props));
  }

  return parts.join('');
}

/**
 * @param {object} section A fresh section from a preset's create() (the data is discarded afterwards)
 * @returns {string} Schematic SVG thumbnail of the section
 */
export function presetThumb(section, { w = 120, h = 68 } = {}) {
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${sectionShapes(section, w, h)}</svg>`;
}

/**
 * Page thumbnail: the sections stacked as bands, weighted by minimum
 * height, so the card shows the PAGE's structure (hero large, cta small).
 * Used by the new-page-from-template grid in the Pages panel; tolerates an
 * empty page (a plain background field).
 * @param {object} page Page file ({ sections: [...] }); the data is discarded afterwards
 * @returns {string} Schematic SVG thumbnail of the whole page
 */
export function pageThumb(page, { w = 96, h = 116, max = 6 } = {}) {
  const sections = (Array.isArray(page?.sections) ? page.sections : []).slice(0, max);
  if (!sections.length) {
    return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${rect(0, 0, w, h, token('bg', FALLBACK_BG))}</svg>`;
  }
  const gap = 1;
  const weights = sections.map((s) => clamp(parseMinHeightPx(s?.size?.minHeight), 160, 900));
  const sum = weights.reduce((a, b) => a + b, 0);
  const avail = h - gap * (sections.length - 1);
  const parts = [];
  let y = 0;
  for (let i = 0; i < sections.length; i += 1) {
    const bandH = Math.max(6, (weights[i] / sum) * avail);
    parts.push(`<g transform="translate(0 ${r1(y)})">${sectionShapes(sections[i], w, bandH)}</g>`);
    y += bandH + gap;
  }
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${parts.join('')}</svg>`;
}
