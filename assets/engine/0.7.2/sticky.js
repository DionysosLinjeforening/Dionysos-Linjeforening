/**
 * Sticky blocks ("pin on scroll"): the DOM part. The state is computed by
 * the pure functions in sticky-model.js; here the document is measured and
 * the mode applied. Pinning is JS-based position:fixed, not CSS sticky:
 * sticky can never stick out of its own container, and the until model
 * (stay pinned past the block's own section) needs a free hand.
 *
 * Two modes: 'scroll' (the default) pins the block at the window top when
 * it is reached and releases at the limit, while 'screen' docks it at a
 * fixed point in the window for the whole page. Blocks with the same
 * sticky-group are pinned as one unit and keep their relative placement,
 * instead of piling on top of each other.
 *
 * Pinning is active in the editor preview too, so the toggle does
 * something visible where it is switched on. The conflict with drag
 * editing (both write left/top/width on the block) is resolved by the drag
 * suspending the pinning: preview-edit calls suspendSticky on drag start
 * and resumeSticky on release, so the block is always edited where it
 * actually belongs. The mobile view is document flow and never has pinning.
 *
 * Pinning is positioning without transitions, so prefers-reduced-motion
 * needs no special handling.
 */
import { stickyState, groupBox, dockPosition } from './sticky-model.js';

/** Below the menu and the editor chrome, above regular content. */
const FIXED_Z = '900';

let wired = false;
let ticking = false;
// A counter, not a flag: with two simultaneous drags (two fingers) the
// first release must not resume pinning while the second is still going.
let suspendDepth = 0;

/** Wired once from boot(); scroll/resize is rAF-throttled. */
export function initSticky() {
  if (wired) return;
  wired = true;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      applySticky();
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  // A shrinking menu (nav.scroll: 'shrink') changes height with a transition.
  // If scrolling stops mid-transition, the offset below would stay at the
  // stale menu height until the next scroll; transitionend gives a final
  // measurement.
  document.addEventListener('transitionend', (e) => {
    if (e.target instanceof Element && e.target.id === 'urd-nav') onScroll();
  });
  applySticky();
}

/** Called after a re-render and when toggling clean view (urd-chrome). */
export function refreshSticky() {
  if (wired) applySticky();
}

/**
 * Editing that writes geometry (drag, resize, align/distribute, arrow keys)
 * is starting: release all pinned blocks back to their true place. Without
 * this the write would put left/top on top of a frozen block.
 * opts.keep exempts one element: the dock drag moves the block WHILE it is
 * pinned, and a release would teleport it out of the grip.
 */
export function suspendSticky(opts = {}) {
  if (suspendDepth++ === 0) {
    for (const el of document.querySelectorAll('.urd-sticky-able')) {
      if (el !== opts.keep) release(el);
    }
  }
}

/** Editing done: measure again from the blocks' new base values. */
export function resumeSticky() {
  suspendDepth = Math.max(0, suspendDepth - 1);
  if (suspendDepth === 0 && wired) applySticky();
}

/** The block's own inline values, as render.js set them from the frame. */
function readGeom(el) {
  return {
    y: parseFloat(el.style.top) || 0,
    top: el.style.top,
    left: el.style.left,
    width: el.style.width,
    z: el.style.zIndex,
    // The mobile row grid places with margin-left (%); a percentage margin
    // on a fixed element would shift the docking, so it is zeroed while pinned.
    ml: el.style.marginLeft,
  };
}

function restore(el, base) {
  el.classList.remove('urd-sticky-fixed');
  el.style.position = '';
  el.style.left = base.left;
  el.style.width = base.width;
  el.style.top = base.top;
  el.style.zIndex = base.z;
  el.style.marginLeft = base.ml ?? '';
}

/**
 * Releases the block back to its own values and forgets the stash. The
 * stash exists ONLY while the block is pinned: then the inline values are
 * overwritten and the originals must be remembered. When the block stands
 * free, they are read fresh every time, so a move from arrow keys or
 * align/distribute (which do not re-render the preview) is never measured
 * against a stale position.
 */
function release(el) {
  if (!el._urdStickyBase) return;
  restore(el, el._urdStickyBase);
  delete el._urdStickyBase;
}

function applySticky() {
  // Suspended (editing is writing geometry): the blocks are already released
  // back to their true place, and measuring here would read values mid-write.
  if (suspendDepth > 0) return;
  const els = document.querySelectorAll('.urd-sticky-able');
  if (!els.length) return;
  const body = document.body;
  // Mobile is document flow: scroll pinning does not apply there, but
  // screen docking does (render.js only marks screen mode on mobile).
  const mobile = body.classList.contains('urd-mobile');
  const scrollY = window.scrollY;
  // A sticky menu sits above the pinned block (the nav has a higher z-index,
  // and raising the block above the menu would put it on top of the
  // submenus). The block is therefore pinned BELOW the menu: its height is
  // added to the chosen offset. Only the top bar takes space at the top; a
  // side menu is a column. If the menu has slid away (scroll behavior
  // 'hide'), the offset is kept anyway: a block hopping up and down in step
  // with the menu would flicker.
  const stickyNav = document.querySelector('header#urd-nav.urd-nav-sticky:not(.urd-nav-side-host)');
  const navH = stickyNav ? stickyNav.offsetHeight : 0;

  // Blocks with the same sticky-group are pinned as ONE unit; the rest are
  // groups of one member each, so the whole loop below has the same shape.
  const groups = new Map();
  for (const [i, el] of els.entries()) {
    const key = el.dataset.stickyGroup || `solo-${i}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(el);
  }

  for (const members of groups.values()) {
    const lead = members[0];
    const section = lead.closest('.urd-section');
    // A transformed section ancestor would make fixed relative to itself
    // (containing block); pinning is then meaningless - stand still.
    const blocked = !section || getComputedStyle(section).transform !== 'none'
      || (mobile && lead.dataset.stickyMode !== 'screen');
    if (blocked) {
      for (const el of members) release(el);
      continue;
    }

    // Mobile screen docking: each block docks on its own against its own
    // measured size (the row grid has no frames to compute group geometry from).
    if (mobile) {
      const view = { w: document.documentElement.clientWidth, h: window.innerHeight };
      for (const el of members) {
        const base = el._urdStickyBase ?? readGeom(el);
        const w = el.offsetWidth;
        const pos = dockPosition(el.dataset.stickyDock, Number(el.dataset.stickyOffset) || 0, { w, h: el.offsetHeight }, view);
        el._urdStickyBase ??= base;
        el.classList.add('urd-sticky-fixed');
        el.style.position = 'fixed';
        el.style.marginLeft = '0';
        el.style.width = `${w}px`;
        el.style.top = `${pos.top}px`;
        el.style.left = `${pos.left}px`;
        el.style.zIndex = String(Number(FIXED_Z) + (Number(base.z) || 0));
      }
      continue;
    }

    const sectionRect = section.getBoundingClientRect();
    // Two rects, on purpose (ADR-0018): the block's left/width are
    // percentages of the CONTENT SURFACE, while the release limit is the
    // section's top and bottom. Measuring both against the section gives
    // pinned blocks the wrong width and makes them drift toward the left
    // edge the moment they pin.
    const canvasRect = (section.querySelector(':scope > .urd-canvas') ?? section).getBoundingClientRect();
    // The canvas can be pushed down inside the section (the nav clearance
    // in the first section under an out-of-flow menu): the block's
    // style.top is canvas-relative, while the pin and release limits are
    // computed against the section.
    const canvasTop = canvasRect.top - sectionRect.top;
    // Geometry is read from the stash while the block is pinned (the inline
    // values are then overwritten), otherwise fresh from the element.
    const geoms = new Map(members.map((el) => [el, el._urdStickyBase ?? readGeom(el)]));
    // The members' measurements in px, shared by both modes. left/width are
    // computed from the canvas rect every time (survives resize); rotation
    // and height are never touched.
    const boxes = members.map((el) => ({
      el,
      x: canvasRect.left - sectionRect.left + canvasRect.width * ((parseFloat(geoms.get(el).left) || 0) / 100),
      y: geoms.get(el).y,
      w: canvasRect.width * ((parseFloat(geoms.get(el).width) || 0) / 100),
      h: el.offsetHeight,
    }));
    const box = groupBox(boxes);

    const place = (el, left, top) => {
      // Stashed only when the block actually pins: then the inline values
      // are overwritten, and the originals must be remembered until release.
      el._urdStickyBase ??= geoms.get(el);
      el.classList.add('urd-sticky-fixed');
      el.style.position = 'fixed';
      el.style.top = `${top}px`;
      el.style.left = `${left}px`;
      // The group's internal stacking order must survive pinning, so the
      // block's own z is added on top of the floor instead of being replaced
      // by it.
      el.style.zIndex = String(Number(FIXED_Z) + (Number(geoms.get(el).z) || 0));
    };

    // Pin to screen: the group docks at a fixed point in the window and
    // stays there regardless of scrolling. The release limit does not apply here.
    if (lead.dataset.stickyMode === 'screen') {
      const view = { w: document.documentElement.clientWidth, h: window.innerHeight };
      const pos = dockPosition(lead.dataset.stickyDock, Number(lead.dataset.stickyOffset) || 0, box, view);
      for (const b of boxes) {
        b.el.style.width = `${b.w}px`;
        place(b.el, pos.left + (b.x - box.x), pos.top + (b.y - box.y));
      }
      continue;
    }

    const sectionTop = sectionRect.top + scrollY;
    let limitBottom = sectionRect.bottom + scrollY;
    const untilId = lead.dataset.stickyUntil;
    if (untilId) {
      const untilEl = document.querySelector(`.urd-section[data-section-id="${CSS.escape(untilId)}"]`);
      // A deleted/unknown until section degrades to the block's own section limit.
      if (untilEl) limitBottom = untilEl.getBoundingClientRect().bottom + scrollY;
    }

    // The group is measured as one block: it pins when the top of the box
    // reaches the offset, and the members keep their place inside the box.
    const state = stickyState(scrollY, {
      sectionTop,
      blockY: box.y + canvasTop,
      blockH: box.h,
      limitBottom,
      offset: (Number(lead.dataset.stickyOffset) || 0) + navH,
    });

    for (const b of boxes) {
      if (state.mode === 'fixed') {
        b.el.style.width = `${b.w}px`;
        place(b.el, sectionRect.left + b.x, state.top + (b.y - box.y));
      } else if (state.mode === 'parked') {
        // Parked overwrites top, so the stash must REMAIN: without it the
        // next measurement would read the parking height as the block's
        // natural place. parkY is section-relative; style.top is canvas-relative.
        b.el._urdStickyBase ??= geoms.get(b.el);
        restore(b.el, b.el._urdStickyBase);
        b.el.style.top = `${state.y - canvasTop + (b.y - box.y)}px`;
      } else {
        release(b.el);
      }
    }
  }
}
