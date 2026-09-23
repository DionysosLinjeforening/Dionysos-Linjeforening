/**
 * Pure typography logic for the text toolbar (the "Office bar"): size steps
 * with clamping, indent steps and font stack recognition. No DOM here; the
 * DOM surgery (caret normalisation) lives in preview-edit.js and is verified
 * in a headless browser.
 */
import { FONT_STACKS } from './fonts.js';

/** The bounds for font size on a selection, in px. */
export const SIZE_MIN = 8;
export const SIZE_MAX = 120;

/** Round and clamp to [SIZE_MIN, SIZE_MAX]; an invalid number gives null. */
export function clampSize(px) {
  const n = Math.round(Number(px));
  if (!Number.isFinite(n)) return null;
  return Math.min(SIZE_MAX, Math.max(SIZE_MIN, n));
}

/** One step up or down from an effective size (delta in px, fine adjustment). */
export function stepSize(px, delta) {
  return clampSize(Number(px) + Number(delta));
}

/**
 * The size ladder that A-up/A-down jumps through, the way Word/LibreOffice
 * does it: small steps at the bottom, larger steps at the top. Values outside
 * the ladder round to the nearest rung in the step direction.
 */
export const SIZE_LADDER = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 40, 48, 64, 80, 96, 120];

/** The next rung up (dir 1) or down (dir -1) on the size ladder. */
export function ladderStep(px, dir) {
  const cur = Number(px);
  if (!Number.isFinite(cur)) return clampSize(px);
  if (dir > 0) {
    const next = SIZE_LADDER.find((s) => s > cur);
    return next ?? SIZE_MAX;
  }
  const below = SIZE_LADDER.filter((s) => s < cur);
  return below.length ? below[below.length - 1] : SIZE_MIN;
}

/**
 * The line height presets in the spacing menu: [CSS value, display name].
 * An empty value = inherit (removes the override from the paragraph).
 * @type {Array<[string, string]>}
 */
export const LINE_HEIGHTS = [
  ['', 'Inherit'],
  ['1', '1.0'],
  ['1.15', '1.15'],
  ['1.5', '1.5'],
  ['2', '2.0'],
];

/** The indent step and the ceiling, in em (relative steps follow the font size). */
export const INDENT_STEP_EM = 2;
export const INDENT_MAX_EM = 16;

/**
 * One indent step from a marginLeft value. Empty string at zero indent (the
 * style attribute can be dropped). Values in units other than em (an old px
 * margin from pasted content, say) are reset and stepped from 0.
 */
export function stepIndent(marginLeft, dir) {
  const m = /^(\d+(?:\.\d+)?)em$/.exec(String(marginLeft || '').trim());
  const cur = m ? Number(m[1]) : 0;
  const next = Math.min(INDENT_MAX_EM, Math.max(0, cur + dir * INDENT_STEP_EM));
  return next === 0 ? '' : `${next}em`;
}

/** The first font name in a CSS font stack, normalised (no quotes, lower case). */
export function firstFamily(css) {
  const first = String(css || '').split(',')[0].trim().replace(/^['"]|['"]$/g, '');
  return first.toLowerCase();
}

/**
 * Find the FONT_STACKS value if the stack matches a computed font-family
 * (compared on the first font name), otherwise an empty string (shown as inherit).
 */
export function matchFontStack(css) {
  const wanted = firstFamily(css);
  if (!wanted) return '';
  const hit = FONT_STACKS.find(([, stack]) => firstFamily(stack) === wanted);
  return hit ? hit[1] : '';
}
