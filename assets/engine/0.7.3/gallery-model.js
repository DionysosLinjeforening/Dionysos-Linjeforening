/**
 * Pure logic for the gallery block, the lightbox and the image gallery
 * background layer: index stepping, autoplay conditions and column maths.
 * DOM-free, so all of it is tested with node --test (tests/gallery.test.mjs);
 * the DOM rendering is tested manually.
 */

/** Next/previous index, wrapping in both directions. An empty list always gives 0. */
export function stepIndex(current, delta, count) {
  if (!Number.isFinite(count) || count < 1) return 0;
  const base = Number.isFinite(current) ? current : 0;
  return ((((base + delta) % count) + count) % count);
}

/** Whether automatic advance is allowed: never below two images, never with reduced motion. */
export function canAutoplay({ count = 0, reducedMotion = false } = {}) {
  return count >= 2 && !reducedMotion;
}

/** Seconds between changes, with a floor and a safe default for junk values. */
export function normalizeInterval(seconds, { min = 2, fallback = 5 } = {}) {
  const n = Number(seconds);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.max(min, n);
}

/** Effective column count for the grid: 1..6, never more than the images, max 2 on mobile. */
export function gridColumns(columns, count, viewport) {
  const n = Number(columns);
  let cols = Number.isFinite(n) && n >= 1 ? Math.min(6, Math.round(n)) : 3;
  if (count > 0) cols = Math.min(cols, count);
  if (viewport === 'mobile') cols = Math.min(cols, 2);
  return Math.max(1, cols);
}
