/**
 * Pure logic for multi-selection: marquee hits, align/distribute computation
 * and group offset on paste. Everything works on frame values (x/w in percent
 * of the section width, y/h in px - the same physical units as
 * docs/SCHEMA.md) and is DOM free, so the maths is contract-tested in
 * tests/selection.test.mjs. The DOM part lives in preview-edit.js.
 */

/**
 * Which blocks does a marquee hit? Rect and blocks share a coordinate system
 * (section-relative px); a block is included when the rects overlap (partial
 * is enough - there is no need to enclose the whole block).
 *
 * @param {{ left: number, top: number, right: number, bottom: number }} rect
 * @param {Array<{ id: string, left: number, top: number, right: number, bottom: number }>} blocks
 * @returns {string[]}
 */
export function blocksInRect(rect, blocks) {
  return blocks
    .filter((b) => b.left < rect.right && b.right > rect.left && b.top < rect.bottom && b.bottom > rect.top)
    .map((b) => b.id);
}

/**
 * Align the selection inside its own bounding box: left/center/right use x/w
 * (percent), top/middle/bottom use y/h (px).
 *
 * @param {Array<{ id: string, x: number, y: number, w: number, h: number }>} items
 * @param {'left'|'center'|'right'|'top'|'middle'|'bottom'} mode
 * @returns {Array<{ id: string, x?: number, y?: number }>} only the blocks that actually move
 */
export function alignMoves(items, mode) {
  if (items.length < 2) return [];
  const r2 = (v) => Math.round(v * 100) / 100;
  const horizontal = mode === 'left' || mode === 'center' || mode === 'right';
  const start = Math.min(...items.map((b) => (horizontal ? b.x : b.y)));
  const end = Math.max(...items.map((b) => (horizontal ? b.x + b.w : b.y + b.h)));
  const moves = [];
  for (const b of items) {
    const size = horizontal ? b.w : b.h;
    let pos;
    if (mode === 'left' || mode === 'top') pos = start;
    else if (mode === 'right' || mode === 'bottom') pos = end - size;
    else pos = start + (end - start) / 2 - size / 2;
    pos = horizontal ? r2(pos) : Math.round(pos);
    if (pos !== (horizontal ? b.x : b.y)) {
      moves.push(horizontal ? { id: b.id, x: pos } : { id: b.id, y: pos });
    }
  }
  return moves;
}

/**
 * Distribute the selection evenly: the first and last block (by position)
 * stay put, and the space BETWEEN the blocks is made equal. Needs at least
 * three blocks.
 *
 * @param {Array<{ id: string, x: number, y: number, w: number, h: number }>} items
 * @param {'x'|'y'} axis
 * @returns {Array<{ id: string, x?: number, y?: number }>}
 */
export function distributeMoves(items, axis) {
  if (items.length < 3) return [];
  const r2 = (v) => Math.round(v * 100) / 100;
  const pos = (b) => (axis === 'x' ? b.x : b.y);
  const size = (b) => (axis === 'x' ? b.w : b.h);
  const sorted = [...items].sort((a, b) => pos(a) - pos(b));
  const first = sorted[0];
  const last = sorted[sorted.length - 1];
  const span = pos(last) + size(last) - pos(first);
  const total = sorted.reduce((sum, b) => sum + size(b), 0);
  const gap = (span - total) / (sorted.length - 1);
  const moves = [];
  let cursor = pos(first) + size(first) + gap;
  for (const b of sorted.slice(1, -1)) {
    const target = axis === 'x' ? r2(cursor) : Math.round(cursor);
    if (target !== pos(b)) moves.push(axis === 'x' ? { id: b.id, x: target } : { id: b.id, y: target });
    cursor += size(b) + gap;
  }
  return moves;
}

/**
 * Clamp a wanted group offset (paste/duplicate) so the WHOLE selection stays
 * within the section width and below the top - without distorting the
 * internal layout (every block gets the same delta).
 *
 * @param {Array<{ x: number, y: number, w: number, h: number }>} frames
 * @param {number} dx Wanted offset in % (may be clipped)
 * @param {number} dy Wanted offset in px (clipped against the top)
 * @returns {{ dx: number, dy: number }}
 */
export function groupDelta(frames, dx, dy) {
  if (!frames.length) return { dx: 0, dy: 0 };
  const r2 = (v) => Math.round(v * 100) / 100;
  const minX = Math.min(...frames.map((f) => f.x));
  const maxRight = Math.max(...frames.map((f) => f.x + f.w));
  const minY = Math.min(...frames.map((f) => f.y));
  const clampedDx = Math.min(Math.max(dx, -minX), Math.max(0, 100 - maxRight));
  const clampedDy = Math.max(dy, -Math.max(0, minY));
  return { dx: r2(clampedDx) || 0, dy: Math.round(clampedDy) || 0 };
}
