/**
 * Pure logic for the section top-edge drag: the section grows/shrinks at
 * the TOP, and every block is shifted accordingly so the content stays
 * visually still (block y is measured from the section top). Neighbours
 * are never touched. DOM-free so the clamps can be contract-tested
 * (tests/section-size.test.mjs); preview-edit.js owns the drag itself.
 */

/**
 * @param {{
 *   dyPointer: number,       // px the pointer has been dragged: > 0 = DOWN (shrink), < 0 = UP (grow)
 *   minHeightPx: number,     // the section's measured height at drag start
 *   blockYs: number[],       // every block's desktop y at drag start
 *   grid: { size: number, snap?: boolean },
 *   free?: boolean           // Shift held: pixel-precise, no snapping
 * }} p
 * @returns {{ dy: number, minHeightPx: number }}
 *   dy = px every block moves (y += dy); minHeightPx = the new height.
 */
export function topDrag(p) {
  const size = p.grid?.size || 8;
  const snapFree = p.free || p.grid?.snap === false;
  let grow = -p.dyPointer;
  grow = snapFree ? Math.round(grow) : Math.round(grow / size) * size;

  if (grow < 0) {
    // Shrinking takes space from ABOVE: never more than brings the topmost
    // block to y=0, and never below the minimum height. A block that already
    // hangs above the top (negative y) stops top-edge shrinking entirely -
    // it must not be pushed further; the bottom handle is still there.
    const minY = p.blockYs.length ? Math.min(...p.blockYs) : Infinity;
    const room = Math.min(Math.max(0, minY), Math.max(0, p.minHeightPx - size * 3));
    // || 0 normalizes -0 (clamped to a standstill) to 0.
    grow = Math.max(grow, -room) || 0;
  }

  return { dy: grow, minHeightPx: p.minHeightPx + grow };
}
