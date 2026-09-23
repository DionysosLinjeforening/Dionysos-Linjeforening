/**
 * The modern branch for the editor's floating menus (ADR-0011 addendum):
 * the Popover API puts a menu in the top layer, so the panels' overflow
 * never clips it, and CSS anchor positioning places it against its
 * button with the browser flipping it away from the viewport edge. The
 * gate is the STRICTER feature, position-try fallbacks: anchoring without
 * flipping would let a menu near the bottom run off the screen, so a
 * browser with anchors but no fallbacks stays on the JS branch, which
 * measures and places with position: fixed as before.
 */

/**
 * @param {object} [win] The window (injectable for tests)
 * @returns {boolean}
 */
export function nativeAnchoring(win = globalThis) {
  const proto = win?.HTMLElement?.prototype;
  const css = win?.CSS;
  return !!(proto && 'popover' in proto && typeof proto.showPopover === 'function'
    && typeof css?.supports === 'function'
    && css.supports('anchor-name: --urd')
    && css.supports('position-try-fallbacks: flip-block'));
}

let seq = 0;

/**
 * A unique anchor name per menu instance: anchor names are global, so two
 * buttons sharing one name would send a menu to the last of them.
 * @param {string} [prefix]
 * @returns {string} A dashed-ident, e.g. --urd-pop-3
 */
export function anchorName(prefix = 'urd-pop') {
  seq += 1;
  return `--${prefix}-${seq}`;
}

/**
 * Names the pane a picker stands in (a panel body or the floating block
 * menu) as the anchor --urd-pane while the picker is open, so the card's
 * CSS can keep itself inside the pane's edges. One picker is open at a
 * time (light dismiss), so one shared name suffices; the name is removed
 * on close.
 * @param {Element|null} el The picker's root element
 * @param {boolean} open
 */
export function namePane(el, open) {
  const pane = el?.closest?.('.panel-body, .block-menu-body');
  if (!pane) return;
  if (open) pane.style.setProperty('anchor-name', '--urd-pane');
  else pane.style.removeProperty('anchor-name');
}
