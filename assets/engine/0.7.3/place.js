/**
 * Pure placement logic for new blocks: adding a block puts it WHERE the
 * owner clicked in the section, not at a fixed spot. Kept DOM-free so the
 * maths can be contract-tested (tests/place.test.mjs).
 */

/**
 * Centres a w×h frame on a click point, clamped inside the section and
 * snapped to the grid. x/w are percentages of the section width, y/h/grid
 * in px (the same physical units as frames elsewhere, see docs/SCHEMA.md).
 *
 * @param {{ x: number, y: number, w: number, h: number, grid: { size: number, snap?: boolean }, snap?: boolean }} p
 *   x/y is the click point (section-relative); p.snap === false gives free placement.
 * @returns {{ x: number, y: number }}
 */
export function frameAtPoint(p) {
  const r2 = (v) => Math.round(v * 100) / 100;
  const maxX = Math.max(0, r2(100 - p.w));
  const x = Math.min(maxX, Math.max(0, r2(p.x - p.w / 2)));
  let y = Math.max(0, p.y - p.h / 2);
  const free = p.snap === false || p.grid?.snap === false;
  const size = p.grid?.size || 8;
  y = free ? Math.round(y) : Math.round(y / size) * size;
  return { x, y: Math.max(0, y) };
}
