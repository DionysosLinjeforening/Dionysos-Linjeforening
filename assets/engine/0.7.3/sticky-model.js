/**
 * Pure state logic for sticky blocks ("pin on scroll"): given the scroll
 * position and document measurements, decides whether the block stays in
 * its normal absolute position (static), pins at the window top (fixed)
 * or parks at the release limit (parked). The DOM work lives in
 * sticky.js; this module is DOM-free and contract-tested in
 * tests/sticky.test.mjs.
 *
 * Pinning is positioning, not animation (no transitions), so
 * prefers-reduced-motion needs no special handling here.
 */

/**
 * @param {number} scrollY
 * @param {{
 *   sectionTop: number,   // the section's top in document px
 *   blockY: number,       // the block's desktop y (section-relative px)
 *   blockH: number,       // the block's height in px
 *   limitBottom: number,  // the release limit in document px: the bottom of
 *                         // the until section, or the own section's bottom
 *                         // without until
 *   offset: number        // desired distance from the window top
 * }} m
 * @returns {{ mode: 'static' } | { mode: 'fixed', top: number } | { mode: 'parked', y: number }}
 *   parked.y is section-relative px (may exceed the section height when
 *   until points at a later section; sections never clip).
 */
/**
 * Bounding box for a group of pinned blocks. The group pins and releases
 * as ONE unit, and each member keeps its place inside the box, instead of
 * all of them piling up at the window top.
 * @param {Array<{x: number, y: number, w: number, h: number}>} items
 * @returns {{x: number, y: number, w: number, h: number}}
 */
export function groupBox(items) {
  const x = Math.min(...items.map((i) => i.x));
  const y = Math.min(...items.map((i) => i.y));
  const right = Math.max(...items.map((i) => i.x + i.w));
  const bottom = Math.max(...items.map((i) => i.y + i.h));
  return { x, y, w: right - x, h: bottom - y };
}

/**
 * Screen docking ("pin to screen"): the box is placed at one of nine anchor
 * points in the window and stays there regardless of scrolling. The margin
 * applies only to the edges the box docks to; center axes are centered and
 * ignore it.
 * @param {string} dock 'top-left' … 'bottom-right' (vertical-horizontal)
 * @param {number} margin distance from the docked edges in px
 * @param {{w: number, h: number}} box the box measurements in px
 * @param {{w: number, h: number}} view the window measurements in px
 * @returns {{left: number, top: number}} position in px from the window's left/top
 */
export function dockPosition(dock, margin, box, view) {
  const [vert, horz] = String(dock || 'bottom-right').split('-');
  const m = Number.isFinite(margin) ? margin : 0;
  // If the box is larger than the window, the top/left edge wins: centering
  // is then meaningless, and the content must not be pushed off screen.
  const center = (available) => Math.max(0, available / 2);
  let top;
  if (vert === 'top') top = m;
  else if (vert === 'bottom') top = Math.max(0, view.h - box.h - m);
  else top = center(view.h - box.h);
  let left;
  if (horz === 'left') left = m;
  else if (horz === 'right') left = Math.max(0, view.w - box.w - m);
  else left = center(view.w - box.w);
  return { left, top };
}

/**
 * The nearest dock point for a box dropped in the window: the center point
 * decides in a three-way grid (left/center/right x top/middle/bottom).
 * The keys match the schema's dock enum (the middle row is 'middle').
 * Pure function, tested in tests/sticky.test.mjs.
 * @param {{left: number, top: number, w: number, h: number}} box the box in window px
 * @param {{w: number, h: number}} view the window measurements in px
 * @returns {string} dock key ('top-left' … 'bottom-right')
 */
export function nearestDock(box, view) {
  const cx = box.left + box.w / 2;
  const cy = box.top + box.h / 2;
  const horz = cx < view.w / 3 ? 'left' : cx > (2 * view.w) / 3 ? 'right' : 'center';
  const vert = cy < view.h / 3 ? 'top' : cy > (2 * view.h) / 3 ? 'bottom' : 'middle';
  return `${vert}-${horz}`;
}

export function stickyState(scrollY, m) {
  // Invalid or too-early limit (above the block's natural place): pinning
  // makes no sense, the block always stays where it is.
  const parkY = m.limitBottom - m.sectionTop - m.blockH;
  if (parkY < m.blockY) return { mode: 'static' };

  // The block has not reached the pin point yet.
  if (m.sectionTop + m.blockY - scrollY >= m.offset) return { mode: 'static' };

  // Pinned, as long as there is room between the window top and the release limit.
  if (m.offset + m.blockH <= m.limitBottom - scrollY) return { mode: 'fixed', top: m.offset };

  // The release limit is passed: the block is left behind at the limit.
  return { mode: 'parked', y: parkY };
}
