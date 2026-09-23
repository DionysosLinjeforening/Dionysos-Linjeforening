/**
 * The editing layer for preview mode: drag, resize (with grid snapping) and
 * delete directly in the real page inside the editor's iframe.
 *
 * Loaded ONLY in preview mode (dynamic import in urd.js) - visitors never
 * load this file. Changes are reported to the editor, which owns the
 * draft:
 *   page → editor: { type: 'urd-move',   sectionId, blockId, frame, frameKey }  (frameKey 'mobile': frame is a row-grid placement, ADR-0019)
 *                  { type: 'urd-delete', sectionId, blockId | blockIds }  (blockIds: multi-selection in one undo step)
 *                  { type: 'urd-add-section', index, section }
 *                  { type: 'urd-move-section', sectionId, dir }
 *                  { type: 'urd-delete-section', sectionId }
 *                  { type: 'urd-section-size', sectionId, minHeight, moves? }  (moves: the top-edge handle moves all blocks in the same undo step)
 *                  { type: 'urd-mobile-reset', sectionId, blockId? }  (reset mobile overrides; without blockId, the whole section)
 *                  { type: 'urd-mobile-order', sectionId, blockId, mobileOrder }  (arrow move in the mobile reading order)
 *                  { type: 'urd-review-done', sectionId }            (mobile reviewed)
 *                  { type: 'urd-block-flag', sectionId, blockId, decor?, hideMobile? }
 *                  { type: 'urd-block-menu', sectionId, blockId, rect }  (open the block menu in the editor)
 */
import { frameToCss, mobilePlacementToCss, reorderMobileKey } from './render.js';
import { MOBILE_ROW } from './migrate.js';
import { makeId } from './sections/presets.js';
import { cloneSectionForInsert, cloneBlocksForInsert } from './templates-model.js';
import { searchItems } from './palette-search.js';
import { applicableLayouts, layoutFrames } from './section-layouts.js';
import { presetThumb } from './preset-thumb.js';
import { openImageEditor, closeImageEditor } from './image-editor.js';
import { applyImageStyle } from './blocks/image.js';
import { openColorPicker, closeColorPicker } from './color-picker.js';
import { createDropdown, closeDropdowns } from './dropdown.js';
import { GLYPH_CATEGORIES, readRecentGlyphs, saveRecentGlyph } from './glyphs.js';
import { FONT_STACKS } from './fonts.js';
import { SIZE_MIN, SIZE_MAX, clampSize, stepSize, LINE_HEIGHTS, stepIndent, matchFontStack } from './text-typo.js';
import { frameAtPoint } from './place.js';
import { topDrag } from './section-size.js';
import { blocksInRect, alignMoves, distributeMoves, groupDelta } from './selection.js';
import { suspendSticky, resumeSticky } from './sticky.js';
import { nearestDock } from './sticky-model.js';
// This module is loaded dynamically by urd.js AFTER the admin dictionary
// is loaded (initAdminLocale), so ta() is safe even at module level here.
import { ta, adminLang } from './i18n.js';

/**
 * The content surface of a section (ADR-0018). Block x/w are percentages OF
 * THIS surface, not of the section, so everything that converts pixels to
 * percent (drag, resize, arrow keys, marquee, materializing mobile frames)
 * must measure here.
 *
 * We MEASURE the surface instead of computing the min() expression from
 * site.layout: if the editor computes it itself, it can arrive at a
 * different width than the engine, and then blocks drift by themselves.
 * The fallback to the section covers older DOM not yet re-rendered.
 *
 * The section's OWN geometry (height, top, bottom) is still read from host:
 * the background and section height are full-width and not part of the
 * surface.
 *
 * @param {HTMLElement} host The section element
 * @returns {HTMLElement}
 */
function canvasOf(host) {
  return host.querySelector(':scope > .urd-canvas') ?? host;
}

/**
 * The nav clearance for the section (0 except for the first section under
 * an out-of-flow menu, see base.css): how far the content surface is pushed
 * down. Measured as the canvas offset, so the height drags can work in pure
 * content heights (the same numbers as size.minHeight in the data).
 */
function sectionClearance(host) {
  const canvas = host.querySelector(':scope > .urd-canvas');
  if (!canvas) return 0;
  return Math.max(0, Math.round(canvas.getBoundingClientRect().top - host.getBoundingClientRect().top));
}

/** Inline minHeight as render.js writes it: a plain length in content
 *  height, the nav clearance being the section's padding (base.css). */
function styleMinHeight(px) {
  return `${px}px`;
}

/** Mobile view? The engine sets the body class from the breakpoint. */
const isMobile = () => document.body.classList.contains('urd-mobile');

/** The template drafts from the editor (the urd-templates message): {id, name, kind, section?, blocks?}.
 *  The editor owns the list; here it feeds the My templates tab in "+ New section". */
let templates = [];
export function setTemplates(list) {
  templates = Array.isArray(list) ? list : [];
}

/** The category choice in the preset gallery is remembered per session
 *  (category sidebar). */
let presetCategory = 'all';

/** Display names for the layouts (keys in the core languages). */
const LAYOUT_LABEL_KEYS = {
  'stack-center': 'canvas.layout.stackCenter',
  'stack-left': 'canvas.layout.stackLeft',
  'split-media-right': 'canvas.layout.splitMediaRight',
  'split-media-left': 'canvas.layout.splitMediaLeft',
  'two-columns': 'canvas.layout.twoColumns',
  'hero-top': 'canvas.layout.heroTop',
};

/** One layout card per applicable variant: a thumbnail from the section's
 *  OWN blocks with the variant's frames; a click posts urd-apply-layout
 *  (ONE undo step in the editor) and calls done(). */
function buildLayoutCards(section, grid, done) {
  const cards = [];
  for (const id of applicableLayouts(section.blocks)) {
    const result = layoutFrames(id, section.blocks, grid);
    if (!result) continue;
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'urd-layout-card';
    try {
      const clone = structuredClone(section);
      for (const { blockId, frame } of result.frames) {
        const b = clone.blocks.find((x) => x.id === blockId);
        if (b) b.frames.desktop = { ...b.frames.desktop, ...frame };
      }
      clone.size = { ...clone.size, minHeight: result.minHeight };
      const thumb = document.createElement('span');
      thumb.className = 'urd-layout-thumb';
      thumb.insertAdjacentHTML('afterbegin', presetThumb(clone));
      card.appendChild(thumb);
    } catch { /* text-only card without a thumbnail */ }
    const name = document.createElement('span');
    name.className = 'urd-layout-name';
    name.textContent = ta(LAYOUT_LABEL_KEYS[id] ?? id);
    card.appendChild(name);
    card.addEventListener('click', () => {
      post({ type: 'urd-apply-layout', sectionId: section.id, frames: result.frames, minHeight: result.minHeight });
      done();
    });
    cards.push(card);
  }
  return cards;
}

/**
 * The "Change layout" picker: a strip above the section (default) or a
 * gallery menu, following the personal preference in the Urd settings
 * (urd-layout-picker in shared localStorage; read on every open, so
 * switching works without a reload). Both stick to the screen within the
 * section and close on another button click, a choice, an outside click
 * and Escape.
 */
function toggleLayoutPicker(host, section, grid) {
  const existing = host.querySelector('.urd-layout-strip, .urd-layout-menu');
  document.querySelectorAll('.urd-layout-strip, .urd-layout-menu').forEach((el) => el.remove());
  if (existing) return;

  const asMenu = localStorage.getItem('urd-layout-picker') === 'menu';
  const picker = document.createElement('div');
  const outside = (event) => {
    // The button itself toggles; without this exception the capture
    // listener would remove the picker before the click, and the toggle
    // would rebuild it.
    if (picker.contains(event.target) || event.target.closest?.('.urd-layout-btn')) return;
    cleanup();
  };
  const onKey = (event) => {
    if (event.key === 'Escape') cleanup();
  };
  function cleanup() {
    document.removeEventListener('pointerdown', outside, true);
    document.removeEventListener('keydown', onKey, true);
    picker.remove();
  }

  const cards = buildLayoutCards(section, grid, cleanup);
  if (asMenu) {
    picker.className = 'urd-layout-menu';
    const head = document.createElement('div');
    head.className = 'urd-preset-head';
    const title = document.createElement('span');
    title.textContent = ta('canvas.layoutTitle');
    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'urd-layout-close';
    close.textContent = '×';
    close.title = ta('confirm.cancel');
    close.addEventListener('click', cleanup);
    head.append(title, close);
    const grid2 = document.createElement('div');
    grid2.className = 'urd-layout-grid';
    grid2.append(...cards);
    picker.append(head, grid2);
  } else {
    picker.className = 'urd-layout-strip';
    picker.append(...cards);
  }
  host.appendChild(picker);
  setTimeout(() => {
    document.addEventListener('pointerdown', outside, true);
    document.addEventListener('keydown', onKey, true);
  }, 0);
}

/** Last pointer position on the canvas: the slash command opens the block menu there. */
let lastPointer = null;
document.addEventListener('pointermove', (event) => {
  lastPointer = { x: event.clientX, y: event.clientY };
}, { passive: true });

/**
 * Open a section's + New block menu, shared by double-click and slash: with
 * a point, the block lands there (_urdAt) and the menu sits at the pointer;
 * without one it opens from the chip position. The search field is reset
 * and focused.
 */
function openBlockMenuAt(host, clientX = null, clientY = null) {
  const wrap = host.querySelector('.urd-add-block');
  const menu = wrap?.querySelector('.urd-add-block-menu');
  if (!wrap || !menu) return;
  const rect = host.getBoundingClientRect();
  // The block's landing point is a percentage of the CONTENT SURFACE, while
  // the menu itself is a child of the section and is positioned against it.
  // Two different frames.
  const canvasRect = canvasOf(host).getBoundingClientRect();
  if (clientX != null) {
    menu._urdAt = {
      x: Math.round(((clientX - canvasRect.left) / canvasRect.width) * 10000) / 100,
      y: Math.round(clientY - canvasRect.top),
    };
    wrap.style.left = `${Math.round(clientX - rect.left)}px`;
    wrap.style.top = `${Math.round(clientY - rect.top)}px`;
    wrap.style.right = 'auto';
    // At the pointer the menu appears alone: the chip button is hidden (the
    // CSS on .urd-at-pointer), so no "+ New block" sits above the menu.
    wrap.classList.add('urd-at-pointer');
  } else {
    menu._urdAt = null;
  }
  menu._urdRefreshTemplates?.();
  menu._urdSearchReset?.();
  menu.classList.add('open');
  menu._urdSearchFocus?.();
  if (clientX != null) {
    // The menu normally hangs to the left of the pointer (right: 0). Near
    // the left edge it would run off screen: there it opens to the right
    // of the pointer instead.
    menu.style.left = '';
    menu.style.right = '';
    const menuWidth = menu.getBoundingClientRect().width;
    if (clientX - menuWidth < 8) {
      menu.style.left = '0';
      menu.style.right = 'auto';
    }
  }
}

/** Closes open menus (preset gallery, block menu). Also called via urd-close-menus when the owner clicks in the admin panels, which the iframe's own click listeners never see. */
let collapseOpenPresetMenu = null;
export function closeMenus() {
  collapseOpenPresetMenu?.();
  collapseOpenPresetMenu = null;
  closeImageEditor();
  closeColorPicker();
  closeDropdowns();
  document.querySelectorAll('.urd-add-block-menu.open').forEach((m) => {
    const wrap = m.closest('.urd-add-block');
    if (wrap) resetBlockAdder(wrap);
  });
}

/**
 * Attaches editing handles to all blocks in a rendered section.
 * Called by render.js after every (re)render in preview mode.
 *
 * @param {HTMLElement} host The section element
 * @param {object} section Section data
 * @param {{columns: number, rowHeight: number}} grid Effective grid
 */
export function enhanceSection(host, section, grid) {
  for (const el of host.querySelectorAll('.urd-block')) {
    const block = section.blocks.find((b) => b.id === el.dataset.blockId);
    if (block) enhanceBlock(el, block, section, grid, host);
  }
  // The selection must survive re-renders (e.g. changes from the
  // Properties panel, which re-renders the whole section).
  if (selectedBlockId) {
    host.querySelector(`.urd-block[data-block-id="${selectedBlockId}"]`)?.classList.add('urd-selected');
  }
  // Likewise the multi-selection (including a freshly pasted selection,
  // where the ids were set BEFORE the re-render found the elements).
  if (multiIds.size && host.dataset.sectionId === multiSectionId) {
    for (const id of multiIds) {
      host.querySelector(`.urd-block[data-block-id="${CSS.escape(id)}"]`)?.classList.add('urd-multi-selected');
    }
    updateMultiToolbar();
  }
  addSectionToolbar(host, section, grid);
  // Structural changes (section height) belong to the desktop view.
  if (!isMobile()) {
    addSectionHeightHandle(host, section, grid);
    addSectionTopHandle(host, section, grid);
    addBlockAdder(host, section, grid);
  }
  // Persistent grid display (the grid menu in the editor is open) must
  // survive re-renders of the section.
  if (gridOverlaysOn) showGridOverlay(host, grid).classList.add('urd-grid-persistent');
  // Likewise the guide lines (a re-render removes the overlay elements).
  if (guideOverlaysOn) addGuideOverlays(host);
}

/**
 * Places a new block from the editor's palette in the middle of the user's
 * view: in the active section, otherwise the section closest to the middle
 * of the viewport. The iframe knows where the user has scrolled; the
 * editor does not.
 */
export function placeBlock(block, root) {
  let host = root.querySelector('.urd-section-active');
  if (!host) {
    let best = null;
    let bestDist = Infinity;
    for (const el of root.querySelectorAll('.urd-section')) {
      const r = el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= window.innerHeight) continue;
      const dist = Math.abs(r.top + r.height / 2 - window.innerHeight / 2);
      if (dist < bestDist) { best = el; bestDist = dist; }
    }
    host = best ?? root.querySelector('.urd-section');
  }
  if (!host) return;

  const rect = host.getBoundingClientRect();
  const visibleTop = Math.max(0, -rect.top);
  const visibleBottom = Math.max(visibleTop, Math.min(rect.height, window.innerHeight - rect.top));
  const frame = block.frames.desktop;
  frame.y = Math.max(8, Math.round((visibleTop + visibleBottom) / 2 - frame.h / 2));
  frame.x = Math.round(((100 - frame.w) / 2) * 100) / 100;

  post({ type: 'urd-add-block', sectionId: host.dataset.sectionId, block });
  // The new block is selected immediately (same pattern as duplicate):
  // the re-render after urd-add-block reads selectedBlockId, the editor
  // follows via urd-select-block, and Ctrl+D/arrow keys work without an
  // extra click first.
  document.querySelectorAll('.urd-block.urd-selected').forEach((b) => b.classList.remove('urd-selected'));
  selectedBlockId = block.id;
  post({ type: 'urd-select-block', sectionId: host.dataset.sectionId, blockId: block.id });
}

/**
 * Replays an entrance animation (demo when the editor changes it): snap
 * back to the start state without a transition, then glide in again.
 * Stagger hosts have the effect classes on their CHILDREN (each with its
 * own offset delay), so there the whole group is replayed.
 */
export function demoAnimation(el) {
  if (!el) return;
  const ENTRANCE = ['urd-anim-fade-in', 'urd-anim-slide-up', 'urd-anim-zoom-in'];
  // If the element carries an entrance class itself, it is played; otherwise
  // it is a group host (stagger/per-card) and the entrance-classed
  // descendants are played.
  const targets = ENTRANCE.some((c) => el.classList.contains(c))
    ? [el]
    : [...el.querySelectorAll(ENTRANCE.map((c) => `.${c}`).join(', '))];
  if (!targets.length) return;
  for (const t of targets) {
    t.style.transition = 'none';
    t.classList.remove('urd-anim-in');
  }
  void el.offsetWidth; // force a reflow so the start state actually applies
  for (const t of targets) t.style.transition = '';
  requestAnimationFrame(() => targets.forEach((t) => t.classList.add('urd-anim-in')));
}

/** Whether persistent grid display is on (controlled by the editor's grid menu). */
let gridOverlaysOn = false;

/**
 * Toggles the grid display in all sections. Used while the grid menu in
 * the editor is open, so setting changes are seen immediately.
 */
export function toggleGridOverlays(visible, page, site) {
  gridOverlaysOn = visible;
  document.querySelectorAll('.urd-grid-persistent').forEach((el) => el.remove());
  if (!visible || !page || !site) return;
  for (const host of document.querySelectorAll('.urd-section')) {
    const section = page.sections.find((s) => s.id === host.dataset.sectionId);
    if (!section) continue;
    showGridOverlay(host, section.grid ?? site.grid).classList.add('urd-grid-persistent');
  }
}

/** Whether the guide lines are on (controlled by the editor's top bar button). */
let guideOverlaysOn = false;

/**
 * Always-visible guide lines for the whole page: the page's vertical
 * center, each section's horizontal center, and the content-width lines at
 * 4%/96% (the default margin of the palette and presets). Dashed, in
 * contrast to the solid smart lines shown only during drag. Editor chrome
 * only: hidden in Clean view and never present for visitors.
 */
export function toggleGuideOverlays(visible) {
  guideOverlaysOn = visible;
  document.querySelectorAll('.urd-page-guide').forEach((el) => el.remove());
  if (!visible) return;
  document.querySelectorAll('.urd-section').forEach((host) => addGuideOverlays(host));
}

function addGuideOverlays(host) {
  const line = (cls, style) => {
    const el = document.createElement('div');
    el.className = `urd-page-guide ${cls}`;
    el.style.cssText = style;
    host.appendChild(el);
  };
  line('urd-page-guide-v', 'left:50%;');
  line('urd-page-guide-v', 'left:4%;');
  line('urd-page-guide-v', 'left:96%;');
  line('urd-page-guide-h', 'top:50%;');
}

/**
 * Shared height drag: moves the section's bottom edge (size.minHeight),
 * snapped to the grid. Used by the handle at the section's bottom edge AND
 * by the "+ New section" bar (which sits on the same boundary). Stored in
 * px (a re-render can still grow the section if the blocks need more, see
 * render.js).
 *
 * The drag only starts after a small threshold, so target can also be a
 * clickable button; opts.onDragged is then called (before the button's
 * click), so the click can be suppressed.
 */
/**
 * Direction-indicating cursor during section height drags: arrow down when
 * dragging down, arrow up when dragging up (the CSS classes in base.css
 * override everything with !important, since the cursor otherwise follows
 * the element beneath it). Small threshold against jitter; the direction
 * is kept until it actually reverses.
 */
function dragCursor() {
  let lastY = null;
  return {
    move(clientY) {
      if (lastY === null) {
        lastY = clientY;
        return;
      }
      if (Math.abs(clientY - lastY) < 2) return;
      const down = clientY > lastY;
      lastY = clientY;
      document.documentElement.classList.toggle('urd-drag-down', down);
      document.documentElement.classList.toggle('urd-drag-up', !down);
    },
    clear() {
      document.documentElement.classList.remove('urd-drag-down', 'urd-drag-up');
    },
  };
}

function wireHeightDrag(target, host, section, grid, opts = {}) {
  target.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    target.setPointerCapture(event.pointerId);
    const startY = event.clientY;
    // The clearance is kept out of the calculation: px is pure content
    // height, the same number stored in size.minHeight.
    const startHeight = host.getBoundingClientRect().height - sectionClearance(host);
    const cursor = dragCursor();
    let px = startHeight;
    let moved = false;

    const onMove = (ev) => {
      if (!moved && Math.abs(ev.clientY - startY) < 4) return;
      moved = true;
      cursor.move(ev.clientY);
      px = Math.max(grid.size * 3, startHeight + (ev.clientY - startY));
      // Pixel-precise when snapping is off or Shift is held.
      const free = grid.snap === false || ev.shiftKey;
      px = free ? Math.round(px) : Math.round(px / grid.size) * grid.size;
      host.style.minHeight = styleMinHeight(px);
    };
    const onUp = () => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
      cursor.clear();
      if (!moved) return;
      opts.onDragged?.();
      if (Math.abs(px - startHeight) < 2) return;
      const minHeight = `${px}px`;
      section.size = { ...section.size, minHeight };
      post({ type: 'urd-section-size', sectionId: section.id, minHeight });
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
  });
}

/**
 * "+ Add block" at the bottom of the section (shown on hover): a click
 * opens a menu of all block kinds, and the choice is reported to the
 * editor, which builds the block and puts it in this exact section.
 */
const BLOCK_KINDS = [
  ['text', ta('blocks.text')], ['text-box', ta('ui.textBox')], ['button', ta('blocks.button')],
  ['image', ta('blocks.image')], ['video', ta('blocks.video')], ['icon', ta('blocks.icon')],
  ['collection', ta('blocks.collection')], ['gallery', ta('blocks.gallery')], ['faq', ta('blocks.faq')],
  ['timeline', ta('blocks.timeline')], ['quote', ta('blocks.quote')], ['stats', ta('blocks.stats')],
  ['table', ta('blocks.table')], ['share', ta('blocks.share')], ['countdown', ta('blocks.countdown')],
  ['audio', ta('blocks.audio')], ['product', ta('blocks.product')], ['cart', ta('blocks.cart')],
  ['checkout', ta('blocks.checkout')],
];

/** The shapes live in their own expandable submenu ("Shapes") in + New block. */
const SHAPE_KINDS = [
  ['shape-line', ta('shape.line')], ['shape-arrow', ta('shape.arrow')], ['shape-circle', ta('shape.circle')],
  ['shape-rect', ta('shape.rect')], ['shape-triangle', ta('shape.triangle')],
];

/** The core block types (the editor's palette owns building these). */
const CORE_BLOCK_TYPES = new Set(['text', 'image', 'button', 'shape', 'video', 'icon', 'collection', 'gallery',
  'faq', 'timeline', 'quote', 'stats', 'table', 'share', 'countdown', 'audio', 'product', 'cart', 'checkout']);

/**
 * Closes a "+ New block" menu and resets the double-click state: the chip
 * button back in the corner, the menu's edge clamping removed.
 */
function resetBlockAdder(wrap) {
  wrap.classList.remove('urd-at-pointer');
  wrap.style.left = '';
  wrap.style.top = '';
  wrap.style.right = '';
  const menu = wrap.querySelector('.urd-add-block-menu');
  if (menu) {
    menu.classList.remove('open');
    menu.style.left = '';
    menu.style.right = '';
  }
}

/** A click anywhere outside an open block menu closes it. One document
 *  listener for the whole page, wired the first time a menu is built. */
let blockMenuOutsideWired = false;
function wireBlockMenuOutsideClose() {
  if (blockMenuOutsideWired) return;
  blockMenuOutsideWired = true;
  document.addEventListener('pointerdown', (event) => {
    for (const menu of document.querySelectorAll('.urd-add-block-menu.open')) {
      const wrap = menu.closest('.urd-add-block');
      if (wrap && event.target instanceof Node && !wrap.contains(event.target)) resetBlockAdder(wrap);
    }
  }, true);
}

function addBlockAdder(host, section, grid) {
  wireBlockMenuOutsideClose();
  const wrap = document.createElement('div');
  wrap.className = 'urd-add-block';

  const openBtn = document.createElement('button');
  openBtn.className = 'urd-add-block-open';
  openBtn.textContent = ta('canvas.newBlock');

  const menu = document.createElement('div');
  menu.className = 'urd-add-block-menu';
  // The click point (section-relative: x in %, y in px) is set when the
  // menu opens via DOUBLE-CLICK on the section surface; the block then
  // lands there. Opened from the button, the point is null and the editor
  // centers the block.
  menu._urdAt = null;

  // The block search (flat hit list). Everything added to the menu is
  // registered in searchables with its visible label and a run that clicks
  // the REAL button, so hits and menu can never diverge.
  const searchables = [];
  const searchWrap = document.createElement('div');
  searchWrap.className = 'urd-block-search';
  searchWrap.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>';
  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = ta('canvas.searchBlocks');
  searchWrap.appendChild(searchInput);
  const hits = document.createElement('div');
  hits.className = 'urd-block-hits';
  menu.append(searchWrap, hits);
  const renderHits = () => {
    const query = searchInput.value;
    if (!query.trim()) {
      menu.classList.remove('urd-searching');
      hits.replaceChildren();
      return;
    }
    menu.classList.add('urd-searching');
    hits.replaceChildren();
    const all = searchables.concat(menu._urdTemplateSearchables ?? []);
    const found = searchItems(all, query, (item) => item.label);
    if (!found.length) {
      const empty = document.createElement('div');
      empty.className = 'urd-search-empty';
      empty.textContent = ta('canvas.searchEmpty');
      hits.appendChild(empty);
      return;
    }
    for (const item of found) {
      const b = document.createElement('button');
      b.textContent = item.label;
      b.addEventListener('click', item.run);
      hits.appendChild(b);
    }
  };
  searchInput.addEventListener('input', renderHits);
  searchInput.addEventListener('keydown', (event) => {
    // Enter inserts the first hit (the slash flow: "/", type, Enter);
    // Escape closes the menu. Stopped so the canvas shortcuts never see
    // them.
    if (event.key === 'Enter') hits.querySelector('button')?.click();
    else if (event.key === 'Escape') resetBlockAdder(wrap);
    event.stopPropagation();
  });
  menu._urdSearchReset = () => {
    searchInput.value = '';
    renderHits();
  };
  menu._urdSearchFocus = () => searchInput.focus();

  const kindButton = (parent, kind, label) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.addEventListener('click', () => {
      post({ type: 'urd-request-block', sectionId: section.id, kind, at: menu._urdAt ?? undefined });
      resetBlockAdder(wrap);
    });
    parent.appendChild(b);
    searchables.push({ label, run: () => b.click() });
  };
  for (const [kind, label] of BLOCK_KINDS) kindButton(menu, kind, label);

  // The shapes go in their own expandable submenu, keeping the main menu short.
  const shapesToggle = document.createElement('button');
  shapesToggle.className = 'urd-add-block-shapes-toggle';
  shapesToggle.textContent = `${ta('group.shapes')} ▾`;
  const shapes = document.createElement('div');
  shapes.className = 'urd-add-block-shapes';
  for (const [kind, label] of SHAPE_KINDS) kindButton(shapes, kind, label);
  shapesToggle.addEventListener('click', () => {
    const open = shapes.classList.toggle('open');
    shapesToggle.textContent = `${ta('group.shapes')} ${open ? '▴' : '▾'}`;
  });
  menu.append(shapesToggle, shapes);
  // Plugin blocks: their own section below the built-ins. The preview has
  // the registries (and thus defaults), so the block is built here and sent
  // complete.
  const pluginTypes = window.Urd.blocks.ids().filter((type) => !CORE_BLOCK_TYPES.has(type));
  if (pluginTypes.length) {
    const divider = document.createElement('div');
    divider.className = 'urd-add-block-plugins';
    divider.textContent = ta('panel.plugins');
    menu.appendChild(divider);
  }
  for (const type of pluginTypes) {
    const def = window.Urd.blocks.get(type);
    const title = typeof def.fromPlugin === 'string' ? ta('tip.blocks.fromPlugin', { plugin: def.fromPlugin }) : ta('tip.blocks.fromPluginGeneric');
    const buildAndPost = (extraProps = {}) => {
      // Opened via double-click: the plugin block lands on the click point
      // (the same pure placement the editor uses for core blocks).
      const w = 50;
      const h = 260;
      const pos = menu._urdAt
        ? frameAtPoint({ x: menu._urdAt.x, y: menu._urdAt.y, w, h, grid })
        : { x: 25, y: 40 };
      post({
        type: 'urd-add-block',
        sectionId: section.id,
        block: {
          id: makeId('blk'),
          type,
          version: def.version ?? 1,
          props: { ...(def.defaults ? def.defaults() : {}), ...extraProps },
          animation: null,
          frames: { desktop: { x: pos.x, y: pos.y, w, h, z: 1, rot: 0 }, mobile: null },
        },
      });
      resetBlockAdder(wrap);
    };
    // Blocks with variants (e.g. the calendar's views) get a fold-out menu like Shapes.
    const defLabel = def.labelKey ? ta(def.labelKey) : (def.label ?? type);
    if (Array.isArray(def.variants) && def.variants.length) {
      const toggle = document.createElement('button');
      toggle.className = 'urd-add-block-shapes-toggle';
      toggle.textContent = `${defLabel} ▾`;
      toggle.title = title;
      const sub = document.createElement('div');
      sub.className = 'urd-add-block-shapes';
      for (const variant of def.variants) {
        const b = document.createElement('button');
        const variantLabel = variant.labelKey ? ta(variant.labelKey) : variant.label;
        b.textContent = variantLabel;
        b.addEventListener('click', () => buildAndPost(variant.props ?? {}));
        sub.appendChild(b);
        // In the hit list the fold is flattened: "Calendar: Month" as its own row.
        searchables.push({ label: `${defLabel}: ${variantLabel}`, run: () => b.click() });
      }
      toggle.addEventListener('click', () => {
        const open = sub.classList.toggle('open');
        toggle.textContent = `${defLabel} ${open ? '▴' : '▾'}`;
      });
      menu.append(toggle, sub);
      continue;
    }
    const b = document.createElement('button');
    b.textContent = defLabel;
    b.title = title;
    b.addEventListener('click', () => buildAndPost());
    menu.appendChild(b);
    searchables.push({ label: defLabel, run: () => b.click() });
  }
  // My templates (block groups, the snippets model): saved groups in the
  // SAME menu as the blocks. The content is built on every open, so the
  // list is always fresh (saving/deleting happens without the section
  // re-rendering).
  const templatesWrap = document.createElement('div');
  menu.appendChild(templatesWrap);
  menu._urdRefreshTemplates = () => {
    templatesWrap.replaceChildren();
    menu._urdTemplateSearchables = [];
    const groupTemplates = templates.filter((m) => m.kind === 'blocks' && Array.isArray(m.blocks));
    if (!groupTemplates.length) return;
    const divider = document.createElement('div');
    divider.className = 'urd-add-block-plugins';
    divider.textContent = ta('canvas.tabMyTemplates');
    templatesWrap.appendChild(divider);
    for (const tpl of groupTemplates) {
      const b = document.createElement('button');
      b.textContent = tpl.name;
      b.title = ta('canvas.insertGroup');
      b.addEventListener('click', () => {
        // Opened via double-click: the group lands with its top-left corner
        // on the click point; otherwise the stored positions are kept
        // (clamping only).
        insertBlocksTemplate(tpl, section.id, menu._urdAt);
        resetBlockAdder(wrap);
      });
      templatesWrap.appendChild(b);
      menu._urdTemplateSearchables.push({ label: tpl.name, run: () => b.click() });
    }
  };
  openBtn.addEventListener('click', () => {
    // From the button: reset any double-click placement of the menu.
    const wasOpen = menu.classList.contains('open');
    menu._urdAt = null;
    resetBlockAdder(wrap);
    if (!wasOpen) {
      menu._urdRefreshTemplates?.();
      menu._urdSearchReset?.();
      menu.classList.add('open');
      menu._urdSearchFocus?.();
    }
  });
  // enhanceSection runs after EVERY re-render on the same host element: the listeners are added only once and look up the current menu at event time, otherwise one listener piles up per re-render.
  if (!host._urdAdderLeaveWired) {
    host._urdAdderLeaveWired = true;
    // The menu does NOT close when the pointer leaves the section: it stays
    // until a click outside (outside-pointerdown) or a block is chosen.
    // No mouseleave closing.
    // Double-click on empty section surface opens the menu AT THE POINTER,
    // and the block lands on the click point ("+ new block where you
    // click"). Never inside blocks (double-click is word selection/image
    // editor there) or on editing handles.
    host.addEventListener('dblclick', (event) => {
      if (isMobile()) return;
      const target = event.target instanceof Element ? event.target : null;
      if (!target) return;
      if (target.closest('.urd-block, .urd-add-block, .urd-add-section, .urd-section-toolbar, .urd-section-resize, .urd-section-resize-top, .urd-hint-chip, .urd-hint-card')) return;
      openBlockMenuAt(host, event.clientX, event.clientY);
    });
  }

  wrap.append(openBtn, menu);
  host.appendChild(wrap);
}

/** Drag handle at the section's bottom edge: adjusts size.minHeight. */
function addSectionHeightHandle(host, section, grid) {
  const handle = document.createElement('div');
  handle.className = 'urd-section-resize';
  handle.title = ta('canvas.sectionHeightDrag');
  wireHeightDrag(handle, host, section, grid);
  host.appendChild(handle);
}

/**
 * Drag handle at the TOP EDGE of the section: adds/removes space at the
 * top. The section grows/shrinks at the top and all blocks are shifted
 * accordingly (topDrag in section-size.js), so the content stands
 * visually still - the scroll position is compensated by the growth.
 * Neighboring sections are never touched, and the whole drag is reported
 * as ONE urd-section-size with moves (one undo step in the editor). The
 * bottom-edge handle remains.
 */
function addSectionTopHandle(host, section, grid) {
  const handle = document.createElement('div');
  handle.className = 'urd-section-resize-top';
  handle.title = ta('canvas.sectionTopDrag');
  handle.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    handle.setPointerCapture(event.pointerId);
    const startY = event.clientY;
    // Pure content height (without the nav clearance), as in the bottom-edge drag.
    const startHeight = host.getBoundingClientRect().height - sectionClearance(host);
    const startScrollY = window.scrollY;
    // The block elements and starting y are collected ONCE: no re-render
    // happens during the drag (an element swap would drop the pointer
    // capture).
    const parts = [...canvasOf(host).querySelectorAll(':scope > .urd-block')].map((el) => {
      const block = section.blocks.find((b) => b.id === el.dataset.blockId);
      return block ? { el, block, y: block.frames.desktop.y } : null;
    }).filter(Boolean);
    const cursor = dragCursor();
    let result = null;
    let moved = false;

    const onMove = (ev) => {
      if (!moved && Math.abs(ev.clientY - startY) < 4) return;
      moved = true;
      cursor.move(ev.clientY);
      result = topDrag({
        dyPointer: ev.clientY - startY,
        minHeightPx: startHeight,
        blockYs: parts.map((p) => p.y),
        grid,
        free: ev.shiftKey,
      });
      host.style.minHeight = styleMinHeight(result.minHeightPx);
      for (const p of parts) p.el.style.top = `${p.y + result.dy}px`;
      // The content must stand visually still: the document below the
      // section top moves by result.dy, and the scroll follows. Absolute
      // against the start value (never accumulated scrollBy: that drifts).
      // Near the document top there is not enough scroll to compensate
      // with, and the content visibly slides - an accepted edge case.
      // Explicitly instant: the compensation must never inherit
      // scroll-behavior: smooth.
      window.scrollTo({ top: Math.max(0, startScrollY + result.dy), behavior: 'instant' });
    };
    const onUp = () => {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      if (!moved || !result || result.dy === 0) return;
      section.size = { ...section.size, minHeight: `${result.minHeightPx}px` };
      for (const p of parts) {
        p.block.frames.desktop = { ...p.block.frames.desktop, y: p.y + result.dy };
      }
      post({
        type: 'urd-section-size',
        sectionId: section.id,
        minHeight: `${result.minHeightPx}px`,
        moves: parts.map((p) => ({ blockId: p.block.id, dy: result.dy })),
      });
    };
    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
  });
  host.appendChild(handle);
}

/**
 * Adds "+ New section" bars between (and around) the sections. Called by
 * render.js after every full page render in preview mode.
 *
 * @param {HTMLElement} root The page's root element
 * @param {object} page Page data (for the section count)
 * @param {object} site site.json (the grid for dragging on the section boundary)
 */
export function enhancePage(root, page, site) {
  initTextToolbar();
  root.querySelectorAll('.urd-add-section').forEach((el) => el.remove());
  // The mobile view is for adjustment and review, not building structure.
  if (isMobile()) return;
  const hosts = [...root.querySelectorAll(':scope > .urd-section')];
  // The bar sits on the boundary between two sections: dragging it moves
  // the boundary (= the height of the section ABOVE), just like the
  // section line.
  const above = (i) => (i > 0 ? {
    host: hosts[i - 1],
    section: page.sections[i - 1],
    grid: page.sections[i - 1]?.grid ?? site.grid,
  } : null);
  hosts.forEach((el, i) => root.insertBefore(makeSectionAdder(i, above(i)), el));
  root.appendChild(makeSectionAdder(hosts.length, above(hosts.length)));
}

/** The "+ New section" bar; a click shows the preset choices from the
 *  registry, dragging moves the section boundary (when a section exists
 *  above). */
function makeSectionAdder(index, above = null) {
  const bar = document.createElement('div');
  bar.className = 'urd-add-section';

  const collapse = () => {
    bar.classList.remove('open');
    bar.replaceChildren(openBtn);
  };

  const openBtn = document.createElement('button');
  openBtn.textContent = ta('canvas.newSection');
  if (above) {
    openBtn.title = ta('canvas.newSectionDrag');
    let dragged = false;
    wireHeightDrag(openBtn, above.host, above.section, above.grid, {
      onDragged: () => { dragged = true; },
    });
    // A completed drag must not also open the preset menu.
    openBtn.addEventListener('click', (e) => {
      if (dragged) {
        dragged = false;
        e.stopImmediatePropagation();
      }
    }, { capture: true });
  }
  openBtn.addEventListener('click', () => {
    bar.classList.add('open');
    bar.replaceChildren();

    // The preset gallery in category-sidebar form: a narrow category list
    // on the left (All, the core groups, Plugins, My templates), a grid
    // with search on the right. The groups keep the registry's order;
    // presets without a group land under "Other".
    const menu = document.createElement('div');
    menu.className = 'urd-preset-menu';
    // The bottom boundary sits at the end of the page, where the iframe has no room below: open the gallery upward instead.
    // On an empty page (only one boundary) there is nothing above, so it still opens downward.
    if (!bar.nextElementSibling && bar.previousElementSibling) menu.classList.add('urd-preset-up');

    // The sources are collected ONCE at opening: core groups keyed by the
    // group STRING (display via groupKey - the plugin contract), plugin
    // presets and plugin-provided templates (kind section, via the re-id
    // rule) in their own group.
    const groups = new Map();
    const pluginDefs = [];
    for (const id of window.Urd.sections.ids()) {
      const def = window.Urd.sections.get(id);
      if (def.fromPlugin) {
        pluginDefs.push(def);
        continue;
      }
      const group = def.group ?? '';
      if (!groups.has(group)) groups.set(group, { labelKey: def.groupKey ?? null, defs: [] });
      groups.get(group).defs.push(def);
    }
    for (const id of window.Urd.templates?.ids?.() ?? []) {
      const tpl = window.Urd.templates.get(id);
      if (tpl?.kind !== 'section' || !tpl.section) continue;
      pluginDefs.push({ label: tpl.name ?? id, fromPlugin: tpl.fromPlugin, create: () => cloneSectionForInsert(tpl.section, makeId) });
    }
    if (pluginDefs.length) groups.set('__plugins', { labelKey: 'panel.plugins', defs: pluginDefs });
    const groupLabel = (name, labelKey) => (labelKey ? ta(labelKey) : (name || ta('canvas.groupOther')));

    // The category colors: each group gets a fixed color step derived from
    // the admin accent in base.css (--urd-category-1..5, cyclic with more
    // groups); My templates always has step 5. The color is set as
    // --urd-category-color on cards, headings and category buttons.
    const TEMPLATE_CAT = 5;
    const categoryFor = new Map([...groups.keys()].map((name, i) => [name, (i % 5) + 1]));
    const setCategory = (el, category) => el.style.setProperty('--urd-category-color', `var(--urd-category-${category})`);
    const makeDot = () => {
      const dot = document.createElement('span');
      dot.className = 'urd-preset-dot';
      return dot;
    };

    // The category rail: All + the groups + My templates (the relevance
    // rule: an empty plugin group does not exist in groups and therefore
    // gets no button).
    const rail = document.createElement('div');
    rail.className = 'urd-preset-rail';
    const railTitle = document.createElement('span');
    railTitle.className = 'urd-preset-rail-title';
    railTitle.textContent = ta('canvas.newSectionTitle');
    rail.appendChild(railTitle);

    const main = document.createElement('div');
    main.className = 'urd-preset-main';
    const top = document.createElement('div');
    top.className = 'urd-preset-top';
    const search = document.createElement('input');
    search.type = 'text';
    search.className = 'urd-preset-search';
    search.placeholder = ta('canvas.searchSections');
    search.title = ta('canvas.searchSections');
    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'urd-preset-close';
    cancel.textContent = '×';
    cancel.title = ta('confirm.cancel');
    cancel.addEventListener('click', collapse);
    top.append(search, cancel);
    const content = document.createElement('div');
    content.className = 'urd-preset-content';
    main.append(top, content);
    menu.append(rail, main);

    /** Preset card in the grid: thumbnail + name, the hint as a tooltip.
     *  A throwing plugin preset must never topple the menu: a text card
     *  without a sketch instead. */
    const buildCard = (def, category) => {
      const choice = document.createElement('button');
      choice.type = 'button';
      choice.className = 'urd-preset-card';
      setCategory(choice, category);
      if (def.hintKey || def.hint) choice.title = def.hintKey ? ta(def.hintKey) : def.hint;
      try {
        const thumb = document.createElement('span');
        thumb.className = 'urd-preset-thumb';
        thumb.insertAdjacentHTML('afterbegin', presetThumb(def.create()));
        choice.appendChild(thumb);
      } catch { /* text-only card without a thumbnail */ }
      const label = document.createElement('span');
      label.className = 'urd-preset-label';
      label.textContent = def.labelKey ? ta(def.labelKey) : def.label;
      choice.appendChild(label);
      choice.addEventListener('click', () => {
        post({ type: 'urd-add-section', index, section: def.create() });
        // The re-render removes the menu from the DOM: clean up the document listener now instead of at the next stray click.
        cleanupOutside();
      });
      return choice;
    };

    const buildGrid = (entries) => {
      const grid = document.createElement('div');
      grid.className = 'urd-preset-grid';
      for (const { def, category } of entries) grid.appendChild(buildCard(def, category));
      return grid;
    };

    // My templates: a grid with a large thumbnail, name and delete button.
    // Insertion goes via cloneSectionForInsert (the re-id rule in
    // SCHEMA.md): new ids every time, so the same template can be inserted
    // multiple times.
    const renderTemplates = () => {
      const list = templates.filter((m) => m.kind === 'section' && m.section);
      if (!list.length) {
        const empty = document.createElement('div');
        empty.className = 'urd-template-empty';
        empty.textContent = ta('canvas.templatesEmpty');
        content.appendChild(empty);
        return;
      }
      const grid = document.createElement('div');
      grid.className = 'urd-template-grid';
      for (const tpl of list) {
        const card = document.createElement('div');
        card.className = 'urd-template-card';
        const pick = document.createElement('button');
        pick.type = 'button';
        pick.className = 'urd-template-pick';
        try {
          const thumb = document.createElement('span');
          thumb.className = 'urd-template-thumb';
          thumb.insertAdjacentHTML('afterbegin', presetThumb(tpl.section));
          pick.appendChild(thumb);
        } catch { /* text-only card without a thumbnail */ }
        const nameEl = document.createElement('span');
        nameEl.className = 'urd-template-name';
        nameEl.textContent = tpl.name;
        pick.appendChild(nameEl);
        pick.addEventListener('click', () => {
          post({ type: 'urd-add-section', index, section: cloneSectionForInsert(tpl.section, makeId) });
          cleanupOutside();
        });
        const del = document.createElement('button');
        del.type = 'button';
        del.className = 'urd-template-delete';
        del.textContent = '×';
        del.title = ta('canvas.deleteTemplate');
        del.addEventListener('click', (event) => {
          // The editor owns the confirmation and deletion; the menu closes
          // so the list is fresh the next time it opens.
          event.stopPropagation();
          post({ type: 'urd-delete-template', id: tpl.id });
          cleanupOutside();
          collapse();
        });
        setCategory(card, TEMPLATE_CAT);
        card.append(pick, del);
        grid.appendChild(card);
      }
      content.appendChild(grid);
    };

    // The search always spans all categories (a flat, ranked hit list like
    // the block menu's) and matches the visible labels.
    const searchables = [];
    for (const [name, { defs }] of groups) {
      for (const def of defs) searchables.push({ label: def.labelKey ? ta(def.labelKey) : def.label, def, category: categoryFor.get(name) });
    }
    const templateDef = (tpl) => ({ label: tpl.name, create: () => cloneSectionForInsert(tpl.section, makeId) });

    const renderContent = () => {
      content.replaceChildren();
      const query = search.value.trim();
      if (query) {
        const all = [...searchables,
          ...templates.filter((m) => m.kind === 'section' && m.section).map((m) => ({ label: m.name, def: templateDef(m), category: TEMPLATE_CAT }))];
        const found = searchItems(all, query, (item) => item.label);
        if (!found.length) {
          const empty = document.createElement('div');
          empty.className = 'urd-template-empty';
          empty.textContent = ta('canvas.searchEmpty');
          content.appendChild(empty);
          return;
        }
        content.appendChild(buildGrid(found));
        return;
      }
      if (presetCategory === 'templates') {
        renderTemplates();
        return;
      }
      for (const [name, { labelKey, defs }] of groups) {
        if (presetCategory !== 'all' && presetCategory !== name) continue;
        const category = categoryFor.get(name);
        // A single chosen category needs no heading above itself.
        if (presetCategory === 'all') {
          const heading = document.createElement('div');
          heading.className = 'urd-preset-group';
          setCategory(heading, category);
          heading.append(makeDot(), document.createTextNode(groupLabel(name, labelKey)));
          content.appendChild(heading);
        }
        content.appendChild(buildGrid(defs.map((def) => ({ def, category }))));
      }
    };

    // The category buttons; the choice is remembered per session. An
    // active search wins over the category until the field is cleared.
    const railButtons = new Map();
    const addRailButton = (id, label, category) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      if (id === 'all') btn.classList.add('urd-preset-rail-all');
      if (id === 'templates') btn.classList.add('urd-preset-rail-templates');
      if (category) setCategory(btn, category);
      btn.append(makeDot(), document.createTextNode(label));
      btn.addEventListener('click', () => {
        presetCategory = id;
        search.value = '';
        applyCategory();
      });
      railButtons.set(id, btn);
      rail.appendChild(btn);
    };
    addRailButton('all', ta('canvas.groupAll'), 1);
    for (const [name, { labelKey }] of groups) addRailButton(name, groupLabel(name, labelKey), categoryFor.get(name));
    addRailButton('templates', ta('canvas.tabMyTemplates'), TEMPLATE_CAT);
    if (!railButtons.has(presetCategory)) presetCategory = 'all';

    const applyCategory = () => {
      for (const [id, btn] of railButtons) btn.classList.toggle('on', id === presetCategory);
      renderContent();
    };
    search.addEventListener('input', renderContent);
    search.addEventListener('keydown', (event) => {
      // Enter inserts the first hit; Escape closes (like the block menu).
      if (event.key === 'Enter') content.querySelector('.urd-preset-card, .urd-template-pick')?.click();
      if (event.key === 'Escape') {
        cleanupOutside();
        collapse();
      }
      event.stopPropagation();
    });
    applyCategory();
    bar.appendChild(menu);
    search.focus();

    // A click outside the menu closes it, the same expectation as elsewhere
    // in the editor. The listener is cleaned up on close and on preset
    // choice.
    const outside = (event) => {
      if (!menu.contains(event.target)) {
        cleanupOutside();
        collapse();
      }
    };
    function cleanupOutside() {
      document.removeEventListener('pointerdown', outside, true);
    }
    setTimeout(() => document.addEventListener('pointerdown', outside, true), 0);
    collapseOpenPresetMenu = () => {
      cleanupOutside();
      collapse();
    };
  });

  collapse();
  return bar;
}

/**
 * The formatting toolbar for text fields (Squarespace-style): shown above
 * the BLOCK while a text field is being edited, with heading level,
 * bold/italic/underline, colors, link, alignment, lists, quote and clear
 * formatting. The commands go via contenteditable (execCommand), which
 * fires the input event in text.js - saving reuses the whole draft flow.
 * (Font and base size per field live in the Properties panel.)
 */
let textToolbarReady = false;

function initTextToolbar() {
  if (textToolbarReady) return;
  textToolbarReady = true;

  const bar = document.createElement('div');
  bar.className = 'urd-text-toolbar';
  // Clicks in the toolbar must not move focus out of the text field.
  // Exception: select and input MUST receive mousedown, otherwise the
  // level picker will not open and the link field cannot be clicked; their
  // focus switching is handled explicitly.
  bar.addEventListener('mousedown', (event) => {
    if (event.target instanceof Element && event.target.closest('select, input')) return;
    event.preventDefault();
  });

  const exec = (name, value = null) => document.execCommand(name, false, value);

  // The color picker and link field move focus/selection: the selection is saved beforehand and restored on use.
  let savedRange = null;
  const saveSelection = () => {
    const sel = document.getSelection();
    savedRange = sel && sel.rangeCount ? sel.getRangeAt(0).cloneRange() : null;
  };
  const restoreSelection = () => {
    if (!savedRange) return;
    const sel = document.getSelection();
    sel.removeAllRanges();
    sel.addRange(savedRange);
  };

  /** Groups that wrap AS A WHOLE, so no lone button ends up on its own line. */
  let group = null;
  const startGroup = (host) => {
    group = document.createElement('span');
    group.className = 'urd-tt-group';
    host.appendChild(group);
  };
  // Buttons with an execCommand state (bold, alignment, lists ...) are
  // marked active when the caret sits in the format. cmd = the
  // queryCommandState name.
  const stateButtons = [];
  const btn = (html, title, run, cmd) => {
    const b = document.createElement('button');
    b.innerHTML = html;
    b.title = title;
    b.addEventListener('click', () => { run(); reposition(); });
    group.appendChild(b);
    if (cmd) stateButtons.push([b, cmd]);
    return b;
  };

  // Two FIXED rows (Office/Word style): row 1 = structure + size, row 2 =
  // character formatting + paragraph. The expandable subrows (colors,
  // spacing, glyphs, link) go below both.
  const row1 = document.createElement('div');
  row1.className = 'urd-tt-row';
  const row2 = document.createElement('div');
  row2.className = 'urd-tt-row';
  bar.append(row1, row2);

  // --- Sentinel normalization: one technique for all inline styles on the
  // SELECTION (size, font, letter spacing). execCommand('fontName') does
  // the range surgery (splits partially selected text nodes, spans
  // multiple paragraphs); afterwards the markers are swapped for clean
  // spans. styleWithCSS is never touched, so themeify (font[color])
  // survives. ---
  const SENTINEL = 'urd-marker';

  const unwrap = (el) => {
    const parent = el.parentNode;
    if (!parent) return;
    while (el.firstChild) parent.insertBefore(el.firstChild, el);
    parent.removeChild(el);
  };
  // The markers: font[face] (the default without styleWithCSS) OR a span
  // with font-family set to the sentinel (some browsers, e.g. Firefox).
  const collectMarkers = () => {
    const out = [...activeText.querySelectorAll(`font[face="${SENTINEL}"]`)];
    for (const el of activeText.querySelectorAll('span[style]')) {
      if (el.style.fontFamily.replace(/["']/g, '') === SENTINEL) out.push(el);
    }
    return out;
  };
  // Remove the same prop from descendants (so the outermost span wins),
  // and clean up empty spans.
  const stripDescendantProp = (root, prop) => {
    for (const el of [...root.querySelectorAll('[style]')]) {
      if (!el.style[prop]) continue;
      el.style[prop] = '';
      if (el.getAttribute('style') === '') el.removeAttribute('style');
      if (el.tagName === 'SPAN' && !el.attributes.length) unwrap(el);
    }
  };
  const reselect = (nodes) => {
    const valid = nodes.filter((n) => n && n.isConnected);
    if (!valid.length) return;
    const range = document.createRange();
    range.setStartBefore(valid[0]);
    range.setEndAfter(valid[valid.length - 1]);
    const sel = document.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  };
  // Collapsed caret: expand to the word the caret sits in (like Word),
  // never with an invisible character in the stored HTML.
  const expandToWord = () => {
    const sel = document.getSelection();
    if (!sel || !sel.rangeCount || !sel.isCollapsed) return;
    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    if (node.nodeType !== 3) return;
    const text = node.textContent;
    let start = range.startOffset;
    let end = range.startOffset;
    while (start > 0 && /\S/.test(text[start - 1])) start--;
    while (end < text.length && /\S/.test(text[end])) end++;
    if (start === end) return;
    const r = document.createRange();
    r.setStart(node, start);
    r.setEnd(node, end);
    sel.removeAllRanges();
    sel.addRange(r);
  };
  // Set a fixed inline value (value null/'' = remove the style, "Inherit") on the selection.
  const applyInlineStyle = (prop, value) => {
    if (!activeText) return;
    expandToWord();
    exec('fontName', SENTINEL);
    const markers = collectMarkers();
    if (!markers.length) return;
    const made = [];
    for (const marker of markers) {
      const span = document.createElement('span');
      if (value != null && value !== '') span.style[prop] = value;
      while (marker.firstChild) span.appendChild(marker.firstChild);
      stripDescendantProp(span, prop);
      if (span.getAttribute('style')) {
        marker.replaceWith(span);
        made.push(span);
      } else {
        const kids = [...span.childNodes];
        marker.replaceWith(...kids);
        made.push(...kids);
      }
    }
    reselect(made);
    activeText.dispatchEvent(new Event('input', { bubbles: true }));
  };
  // Size per run (A-up/A-down and ±1px): each text run is stepped from ITS
  // own computed size, so mixed selections are preserved. Works directly
  // on the text nodes (not via a fontName marker, which merges neighboring
  // runs).
  const applySizeStep = (read) => {
    if (!activeText) return;
    expandToWord();
    const sel = document.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return;
    // Split the text nodes at the selection boundaries, so the runs align on nodes.
    if (range.startContainer.nodeType === 3 && range.startOffset > 0) {
      const after = range.startContainer.splitText(range.startOffset);
      range.setStart(after, 0);
    }
    if (range.endContainer.nodeType === 3 && range.endOffset < range.endContainer.length) {
      range.endContainer.splitText(range.endOffset);
    }
    sel.removeAllRanges();
    sel.addRange(range);
    const runs = [];
    const walker = document.createTreeWalker(activeText, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.textContent && sel.containsNode(node, false)) runs.push(node);
    }
    if (!runs.length) return;
    const made = [];
    for (const tn of runs) {
      const parent = tn.parentElement;
      const next = read(parseFloat(getComputedStyle(parent).fontSize));
      // Is the run the ENTIRE content of a size span? Update it in place,
      // so repeated stepping does not stack new spans.
      if (parent.tagName === 'SPAN' && parent.childNodes.length === 1 && parent.style.fontSize) {
        parent.style.fontSize = `${next}px`;
        made.push(parent);
      } else {
        const span = document.createElement('span');
        span.style.fontSize = `${next}px`;
        parent.insertBefore(span, tn);
        span.appendChild(tn);
        made.push(span);
      }
    }
    reselect(made);
    activeText.dispatchEvent(new Event('input', { bubbles: true }));
  };

  // Block-level operations (line height, indent): affect the paragraphs in
  // the selection, not individual words.
  const BLOCK_SEL = 'p,h1,h2,h3,h4,h5,h6,li,blockquote,div';
  const blocksInRange = () => {
    const sel = document.getSelection();
    if (!sel || !sel.rangeCount || !activeText) return [];
    const range = sel.getRangeAt(0);
    const leaf = (list) => list.filter((el) => !list.some((o) => o !== el && el.contains(o)));
    let hits = leaf([...activeText.querySelectorAll(BLOCK_SEL)].filter((el) => range.intersectsNode(el)));
    if (!hits.length) {
      // Only bare text nodes directly in the field: normalize to one paragraph first.
      exec('formatBlock', 'p');
      hits = leaf([...activeText.querySelectorAll(BLOCK_SEL)].filter((el) => range.intersectsNode(el)));
    }
    return hits;
  };
  const setLineHeight = (value) => {
    if (!activeText) return;
    for (const el of blocksInRange()) {
      el.style.lineHeight = value;
      if (el.getAttribute('style') === '') el.removeAttribute('style');
    }
    activeText.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const applyIndent = (dir) => {
    if (!activeText) return;
    const hits = blocksInRange();
    // Pure lists: let the browser create/tear down levels (correct ul nesting).
    if (hits.length && hits.every((el) => el.tagName === 'LI')) {
      exec(dir > 0 ? 'indent' : 'outdent');
      return;
    }
    for (const el of hits) {
      if (el.tagName === 'LI') continue;
      el.style.marginLeft = stepIndent(el.style.marginLeft, dir);
      if (el.getAttribute('style') === '') el.removeAttribute('style');
    }
    activeText.dispatchEvent(new Event('input', { bubbles: true }));
  };

  // ---------------- ROW 1: structure and size ----------------
  // Heading level: a themed dropdown (ADR-0009: never a native select in
  // editing UI). The dropdown does not steal focus, so the selection
  // remains.
  startGroup(row1);
  const level = createDropdown({
    value: 'p',
    title: ta('tt.level'),
    options: [['p', ta('tt.paragraph')], ['h1', ta('tt.headingN', { n: 1 })], ['h2', ta('tt.headingN', { n: 2 })], ['h3', ta('tt.headingN', { n: 3 })]],
    onchange: (value) => exec('formatBlock', value),
  });
  group.appendChild(level.el);

  // Font for the SELECTION (not the whole field; the field's font lives in
  // Properties). "Inherit from theme" removes font-family from the
  // selection.
  const fontDd = createDropdown({
    value: '',
    title: ta('tt.fontTitle'),
    options: [['', ta('tt.inheritFont')], ...FONT_STACKS.map(([name, value]) => [value, ta(name)])],
    onchange: (v) => { applyInlineStyle('fontFamily', v || null); reposition(); },
  });
  group.appendChild(fontDd.el);

  // Size for the SELECTION: a number field with minus/plus (±1px). The
  // field steals focus, so the selection is saved/restored (the linkRow
  // pattern).
  const MINUS_SVG = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M2.5 6h7"/></svg>';
  const PLUS_SVG = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 2.5v7M2.5 6h7"/></svg>';

  startGroup(row1);
  btn(MINUS_SVG, ta('tt.sizeMinus'), () => applySizeStep((cur) => stepSize(cur, -1)));
  const sizeInput = document.createElement('input');
  sizeInput.type = 'number';
  sizeInput.className = 'urd-tt-num urd-tt-size';
  sizeInput.min = String(SIZE_MIN);
  sizeInput.max = String(SIZE_MAX);
  sizeInput.step = '1';
  sizeInput.title = ta('tt.sizeTitle');
  const applySizeFromField = () => {
    restoreSelection();
    const raw = sizeInput.value.trim();
    if (raw === '') { applyInlineStyle('fontSize', null); return; }
    const px = clampSize(Number(raw));
    if (px == null) return;
    sizeInput.value = String(px);
    applyInlineStyle('fontSize', `${px}px`);
  };
  // Save the selection BEFORE focus moves to the field (at pointerdown it
  // is still in the text; by focus it may be gone).
  sizeInput.addEventListener('pointerdown', saveSelection);
  sizeInput.addEventListener('change', () => { applySizeFromField(); reposition(); });
  sizeInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); applySizeFromField(); activeText?.focus(); reposition(); }
  });
  group.appendChild(sizeInput);
  btn(PLUS_SVG, ta('tt.sizePlus'), () => applySizeStep((cur) => stepSize(cur, 1)));

  // ---------------- ROW 2: character formatting and paragraph ----------------
  startGroup(row2);
  btn(`<b>${ta('format.boldLetter')}</b>`, ta('tt.bold'), () => exec('bold'), 'bold');
  btn(`<i>${ta('format.italicLetter')}</i>`, ta('tt.italic'), () => exec('italic'), 'italic');
  btn(`<u>${ta('format.underlineLetter')}</u>`, ta('tt.underline'), () => exec('underline'), 'underline');
  btn(`<s>${ta('format.strikeLetter')}</s>`, ta('tt.strike'), () => exec('strikeThrough'), 'strikeThrough');
  btn('<span class="urd-tt-supsub">A<sup>2</sup></span>', ta('tt.superscript'), () => exec('superscript'), 'superscript');
  btn('<span class="urd-tt-supsub">A<sub>2</sub></span>', ta('tt.subscript'), () => exec('subscript'), 'subscript');

  // Colors: collected in a dropdown row (the palette icon is the dropdown
  // button), keeping the main toolbar narrow. The row itself is built
  // further down (colorRow).
  startGroup(row2);
  const PALETTE_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="8.5" cy="9" r="1" fill="currentColor"/><circle cx="15.5" cy="9" r="1" fill="currentColor"/><circle cx="8.5" cy="15" r="1" fill="currentColor"/><path d="M21 12a9 9 0 0 1-9 9c2.5-2 1-4.5 3-5.5s6 .5 6-3.5z"/></svg>';
  btn(PALETTE_SVG, ta('tt.colors'), () => toggleColorRow());

  const alignIcon = (kind) =>
    `<span class="urd-ticon urd-ticon-${kind}"><i></i><i></i><i></i></span>`;
  startGroup(row2);
  btn(alignIcon('left'), ta('tt.alignLeft'), () => exec('justifyLeft'), 'justifyLeft');
  btn(alignIcon('center'), ta('tt.alignCenter'), () => exec('justifyCenter'), 'justifyCenter');
  btn(alignIcon('right'), ta('tt.alignRight'), () => exec('justifyRight'), 'justifyRight');
  btn(alignIcon('justify'), ta('tt.alignJustify'), () => exec('justifyFull'), 'justifyFull');
  // Line and letter spacing: their own dropdown row behind the spacing button.
  const SPACING_SVG = '<svg width="16" height="14" viewBox="0 0 16 14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2.5v9M1.2 4.2 3 2.4l1.8 1.8M1.2 9.8 3 11.6l1.8-1.8M7.5 3.5h7.5M7.5 7h7.5M7.5 10.5h7.5"/></svg>';
  btn(SPACING_SVG, ta('tt.spacing'), () => toggleSpacingRow());

  startGroup(row2);
  btn('<span class="urd-licon"><i></i><i></i><i></i></span>', ta('tt.ul'),
    () => exec('insertUnorderedList'), 'insertUnorderedList');
  btn('<span class="urd-licon urd-licon-ol"><i>1</i><i>2</i><i>3</i></span>', ta('tt.ol'),
    () => exec('insertOrderedList'), 'insertOrderedList');
  const OUTDENT_SVG = '<svg width="15" height="13" viewBox="0 0 15 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 2h12M6.5 6.5h7M1.5 11h12M4.3 4.5 2 6.5l2.3 2"/></svg>';
  const INDENT_SVG = '<svg width="15" height="13" viewBox="0 0 15 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 2h12M6.5 6.5h7M1.5 11h12M2 4.5l2.3 2L2 8.5"/></svg>';
  btn(OUTDENT_SVG, ta('tt.outdent'), () => applyIndent(-1));
  btn(INDENT_SVG, ta('tt.indent'), () => applyIndent(1));

  startGroup(row2);
  const QUOTE_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6 5C3.8 5 2 6.8 2 9s1.8 4 4 4c.3 0 .5 0 .8-.1C6.2 14.8 5 16.4 3.4 17.4l1.2 1.8C8 17 10 13.7 10 10.2 10 7.2 8.3 5 6 5z"/><path d="M17 5c-2.2 0-4 1.8-4 4s1.8 4 4 4c.3 0 .5 0 .8-.1-.6 1.9-1.8 3.5-3.4 4.5l1.2 1.8C19 17 21 13.7 21 10.2 21 7.2 19.3 5 17 5z"/></svg>';
  // Quote is a toggle: if the caret sits in a quote, it becomes a paragraph again.
  const quoteBtn = btn(QUOTE_SVG, ta('tt.quote'), () => {
    let inQuote = false;
    try { inQuote = (document.queryCommandValue('formatBlock') || '').toLowerCase() === 'blockquote'; } catch { /* noop */ }
    exec('formatBlock', inQuote ? 'p' : 'blockquote');
  });
  // The glyph menu: the same selection as the icon block's glyph picker
  // (shared module in glyphs.js), inserted at the caret. The button is a
  // drawn smiley (never emoji in editor chrome); the glyphs themselves are
  // content.
  const GLYPH_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><line x1="9" y1="9.5" x2="9" y2="9.5"/><line x1="15" y1="9.5" x2="15" y2="9.5"/><path d="M8.5 14.5c.8 1.2 2 2 3.5 2s2.7-.8 3.5-2"/></svg>';
  btn(GLYPH_SVG, ta('tt.glyphs'), () => toggleGlyphRow());

  startGroup(row2);
  const LINK_SVG = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M10 13a5 5 0 0 0 7.07 0l3-3a5 5 0 0 0-7.07-7.07l-1.5 1.5"/><path d="M14 11a5 5 0 0 0-7.07 0l-3 3a5 5 0 0 0 7.07 7.07l1.5-1.5"/></svg>';
  const CLEAR_SVG = '<svg width="16" height="14" viewBox="0 0 26 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 5h12"/><path d="M11 5L8 19"/><path d="M18 15l6 6"/><path d="M24 15l-6 6"/></svg>';
  btn(LINK_SVG, ta('lbl.link'), () => toggleLinkRow());
  btn(CLEAR_SVG, ta('tt.clearFormat'), () => {
    exec('removeFormat');
    exec('unlink');
    exec('formatBlock', 'p');
    // removeFormat does not touch block-level style: reset the paragraphs too.
    for (const el of blocksInRange()) {
      el.style.lineHeight = '';
      el.style.marginLeft = '';
      if (el.getAttribute('style') === '') el.removeAttribute('style');
    }
  });

  // Inline link field (modern flow, no prompt): opened by the link button on its own row in the toolbar.
  const linkRow = document.createElement('div');
  linkRow.className = 'urd-tt-linkrow';
  const linkInput = document.createElement('input');
  linkInput.placeholder = ta('tt.linkPh');
  linkInput.spellcheck = false;
  const linkApply = document.createElement('button');
  linkApply.textContent = ta('common.apply');
  const linkRemove = document.createElement('button');
  linkRemove.textContent = ta('tt.removeLink');
  linkRow.append(linkInput, linkApply, linkRemove);
  bar.appendChild(linkRow);

  const applyLink = () => {
    const trimmed = linkInput.value.trim();
    // Only ordinary link forms: active URL schemes must never become clickable for visitors.
    if (/^(javascript|data|vbscript):/i.test(trimmed)) return;
    restoreSelection();
    if (trimmed) exec('createLink', trimmed);
    else exec('unlink');
    linkRow.classList.remove('visible');
  };
  linkApply.addEventListener('click', applyLink);
  linkInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') applyLink();
    if (event.key === 'Escape') linkRow.classList.remove('visible');
  });
  linkRemove.addEventListener('click', () => {
    restoreSelection();
    exec('unlink');
    linkRow.classList.remove('visible');
  });

  function toggleLinkRow() {
    if (linkRow.classList.contains('visible')) {
      linkRow.classList.remove('visible');
      return;
    }
    colorRow.classList.remove('visible');
    glyphRow.classList.remove('visible');
    spacingRow.classList.remove('visible');
    saveSelection();
    // Prefill with the existing link when the caret sits in one.
    const sel = document.getSelection();
    const anchorEl = sel?.anchorNode instanceof HTMLElement ? sel.anchorNode : sel?.anchorNode?.parentElement;
    linkInput.value = anchorEl?.closest('a')?.getAttribute('href') ?? '';
    linkRow.classList.add('visible');
    linkInput.focus();
  }

  // The theme color commands: execCommand can only write a FIXED color;
  // afterwards it is swapped for var(--urd-color-<token>) in the field, so
  // the content follows theme switches. execCommand normalizes colors
  // differently (hex/rgb), so matching happens in rgb form. Custom colors
  // deliberately remain detached hex.
  const normColor = (value) => {
    if (!value) return '';
    const v = String(value).trim().toLowerCase();
    const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/.exec(v);
    if (!hex) return v.replace(/\s+/g, ' ');
    let h = hex[1];
    if (h.length === 3) h = [...h].map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`;
  };
  const themeify = (token, styleProp) => {
    if (!activeText) return;
    const target = normColor(getComputedStyle(document.documentElement)
      .getPropertyValue(`--urd-color-${token}`));
    if (!target) return;
    for (const el of activeText.querySelectorAll('[style], font[color]')) {
      if (styleProp === 'color' && el.tagName === 'FONT' && normColor(el.getAttribute('color')) === target) {
        el.removeAttribute('color');
        el.style.color = `var(--urd-color-${token})`;
        continue;
      }
      if (normColor(el.style[styleProp]) === target) {
        el.style[styleProp] = `var(--urd-color-${token})`;
      }
    }
    // The swap happens outside execCommand: dispatch input ourselves, so the draft is saved.
    activeText.dispatchEvent(new Event('input', { bubbles: true }));
  };

  // The color row (the dropdown behind the palette icon): theme colors and
  // custom text color, then highlighting with accent/custom color and
  // remove highlight.
  const colorRow = document.createElement('div');
  colorRow.className = 'urd-tt-colorrow';
  bar.insertBefore(colorRow, linkRow);
  const colorBtn = (html, title, run) => {
    const b = document.createElement('button');
    b.innerHTML = html;
    b.title = title;
    b.addEventListener('click', () => { run(); reposition(); });
    colorRow.appendChild(b);
    return b;
  };
  // The color menu does NOT close on choice (so several colors can be
  // tried); it only closes when the whole toolbar disappears, another
  // subrow opens, or the palette icon is pressed again (toggleColorRow).
  //
  // The shared color picker reports onpick LIVE on every choice. Each
  // execCommand changes the DOM, so a fixed stored Range becomes invalid.
  // The selection is therefore renewed after EVERY application
  // (saveSelection), so the next live call hits the same text.
  const pickInto = (apply) => (hex) => {
    restoreSelection();
    apply(hex);
    saveSelection();
  };
  for (const token of ['text', 'accent']) {
    const b = colorBtn('', token === 'text' ? ta('tt.textColorTheme') : ta('tt.accentColorTheme'), () => {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(`--urd-color-${token}`).trim();
      exec('foreColor', value);
      themeify(token, 'color');
    });
    b.className = 'urd-text-swatch';
    b.style.background = `var(--urd-color-${token})`;
  }
  colorBtn('<span class="urd-tt-acolor">A</span>', ta('tt.customTextColor'), () => {
    saveSelection();
    openColorPicker(bar, {
      value: '#ffffff',
      onpick: pickInto((hex) => exec('foreColor', hex)),
    });
  });
  const colorSep = document.createElement('span');
  colorSep.className = 'urd-tt-sep';
  colorRow.appendChild(colorSep);
  colorBtn('<span class="urd-tt-hl">A</span>', ta('tt.hlAccent'), () => {
    const accent = getComputedStyle(document.documentElement)
      .getPropertyValue('--urd-color-accent').trim();
    exec('hiliteColor', accent);
    themeify('accent', 'backgroundColor');
  });
  colorBtn('<span class="urd-tt-hl urd-tt-hl-free">A</span>', ta('tt.hlCustom'), () => {
    saveSelection();
    openColorPicker(bar, {
      onpick: pickInto((hex) => exec('hiliteColor', hex)),
    });
  });
  colorBtn('<span class="urd-tt-hl urd-tt-hl-none">A</span>', ta('tt.hlNone'), () => {
    exec('hiliteColor', 'transparent');
  });

  function toggleColorRow() {
    linkRow.classList.remove('visible');
    glyphRow.classList.remove('visible');
    spacingRow.classList.remove('visible');
    colorRow.classList.toggle('visible');
  }

  // The glyph row (behind the smiley button): "Recent" + the categories
  // from the shared glyph module, in a scrollable grid. The glyph is
  // inserted at the caret via insertText, which fires the input event in
  // text.js - saving reuses the draft flow. The row is built only when it
  // opens (several hundred buttons); the recent list is shared with the
  // admin picker via the same localStorage key.
  const glyphRow = document.createElement('div');
  glyphRow.className = 'urd-tt-glyphrow';
  bar.insertBefore(glyphRow, linkRow);
  let glyphRowBuilt = false;

  const glyphHeading = (name) => {
    const h = document.createElement('div');
    h.className = 'urd-tt-glyphhead';
    h.textContent = name;
    return h;
  };
  const glyphGrid = () => {
    const g = document.createElement('div');
    g.className = 'urd-tt-glyphgrid';
    return g;
  };
  const glyphCell = (host, glyph) => {
    const b = document.createElement('button');
    b.textContent = glyph;
    b.title = ta('tt.insert');
    b.addEventListener('click', () => {
      exec('insertText', glyph);
      saveRecentGlyph(glyph);
      renderRecentGlyphs();
      reposition();
    });
    host.appendChild(b);
  };

  const recentGlyphs = document.createElement('div');
  const renderRecentGlyphs = () => {
    recentGlyphs.replaceChildren();
    const recent = readRecentGlyphs();
    if (!recent.length) return;
    recentGlyphs.appendChild(glyphHeading(ta('common.recent')));
    const grid = glyphGrid();
    recent.forEach((glyph) => glyphCell(grid, glyph));
    recentGlyphs.appendChild(grid);
  };

  function toggleGlyphRow() {
    linkRow.classList.remove('visible');
    colorRow.classList.remove('visible');
    spacingRow.classList.remove('visible');
    if (glyphRow.classList.contains('visible')) {
      glyphRow.classList.remove('visible');
      return;
    }
    if (!glyphRowBuilt) {
      glyphRowBuilt = true;
      glyphRow.appendChild(recentGlyphs);
      for (const [name, glyphs] of GLYPH_CATEGORIES) {
        glyphRow.appendChild(glyphHeading(ta(name)));
        const grid = glyphGrid();
        glyphs.split(' ').forEach((glyph) => glyphCell(grid, glyph));
        glyphRow.appendChild(grid);
      }
    }
    renderRecentGlyphs();
    glyphRow.classList.add('visible');
    reposition();
  }

  // The spacing row (behind the spacing button): the line-height presets
  // and letter spacing for the SELECTION. Line height applies to the
  // paragraphs in the selection, letter spacing to the characters.
  // Everything is additive inline; "Inherit" removes the override.
  const spacingRow = document.createElement('div');
  spacingRow.className = 'urd-tt-spacerow';
  bar.insertBefore(spacingRow, linkRow);

  const spacingLabel = (text) => {
    const s = document.createElement('span');
    s.className = 'urd-tt-typolabel';
    s.textContent = text;
    return s;
  };
  spacingRow.appendChild(spacingLabel(ta('tt.lineHeight')));
  // The numeric labels follow the admin locale's decimal separator.
  const lhFormat = new Intl.NumberFormat(adminLang(), { minimumFractionDigits: 1, maximumFractionDigits: 2 });
  for (const [value] of LINE_HEIGHTS) {
    const b = document.createElement('button');
    b.className = 'urd-tt-lh';
    const label = value ? lhFormat.format(Number(value)) : ta('common.inherit');
    b.textContent = label;
    b.title = value ? ta('tt.lineHeightN', { label }) : ta('tt.inheritLh');
    b.addEventListener('click', () => { setLineHeight(value); reposition(); });
    spacingRow.appendChild(b);
  }
  const spacingSep = document.createElement('span');
  spacingSep.className = 'urd-tt-sep';
  spacingRow.appendChild(spacingSep);
  spacingRow.appendChild(spacingLabel(ta('tt.letterSpacing')));
  const lsInput = document.createElement('input');
  lsInput.type = 'number';
  lsInput.className = 'urd-tt-num';
  lsInput.min = '-2';
  lsInput.max = '10';
  lsInput.step = '0.1';
  lsInput.placeholder = ta('common.inherit');
  lsInput.title = ta('tt.letterSpacingTitle');
  const applyLetterSpacing = () => {
    restoreSelection();
    const raw = lsInput.value.trim();
    applyInlineStyle('letterSpacing', raw === '' ? null : `${Number(raw)}px`);
  };
  lsInput.addEventListener('pointerdown', saveSelection);
  lsInput.addEventListener('change', () => { applyLetterSpacing(); reposition(); });
  lsInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') { event.preventDefault(); applyLetterSpacing(); activeText?.focus(); reposition(); }
  });
  spacingRow.appendChild(lsInput);

  function toggleSpacingRow() {
    linkRow.classList.remove('visible');
    colorRow.classList.remove('visible');
    glyphRow.classList.remove('visible');
    spacingRow.classList.toggle('visible');
  }

  document.body.appendChild(bar);

  // The toolbar is shown while a text field has focus, anchored at the
  // SELECTION (the block rect as fallback), clamped below the page's
  // sticky menu.
  let activeText = null;
  // The block id of the active field: prop changes (the typography row,
  // the Properties panel) re-render the section and swap out the element,
  // so the toolbar finds it again via the id. Cleared on deliberate close,
  // otherwise the toolbar would never let go.
  let activeBlockId = null;

  const reposition = () => {
    if (activeBlockId && (!activeText || !activeText.isConnected)) {
      activeText = document.querySelector(`.urd-block[data-block-id="${activeBlockId}"] .urd-text[contenteditable="true"]`);
    }
    if (!activeText || !activeText.isConnected) {
      bar.classList.remove('visible');
      linkRow.classList.remove('visible');
      colorRow.classList.remove('visible');
      glyphRow.classList.remove('visible');
      spacingRow.classList.remove('visible');
      return;
    }
    // The toolbar is always anchored at the TOP of the text field (the
    // block), not at the caret, so it stays put while typing. An invalid
    // rect (the block not laid out yet) must not move the toolbar.
    const block = activeText.closest('.urd-block') ?? activeText;
    const anchor = block.getBoundingClientRect();
    if (!anchor || (!anchor.width && !anchor.height)) return;
    bar.classList.add('visible');
    const navHeight = document.getElementById('urd-nav')?.offsetHeight ?? 0;
    const left = Math.max(8, Math.min(anchor.left, window.innerWidth - bar.offsetWidth - 8));
    let top = anchor.top - bar.offsetHeight - 10;
    // Above the block; but never under the sticky menu (then it is clamped
    // right below the menu, still near the top of the field).
    if (top < navHeight + 8) top = navHeight + 8;
    bar.style.left = `${left}px`;
    bar.style.top = `${top}px`;
    // The level picker and quote button mirror the caret's position.
    try {
      const value = (document.queryCommandValue('formatBlock') || 'p').toLowerCase();
      level.set(['h1', 'h2', 'h3'].includes(value) ? value : 'p');
      quoteBtn.classList.toggle('active', value === 'blockquote');
    } catch { /* some browsers refuse before the first command */ }
    // The format buttons (bold, italic, alignment, lists,
    // superscript/subscript) are marked active when the caret sits in the
    // format.
    for (const [b, cmd] of stateButtons) {
      let on = false;
      try { on = document.queryCommandState(cmd); } catch { /* noop */ }
      b.classList.toggle('active', on);
    }
    syncTypoControls();
  };

  // The size field and font dropdown mirror the selection. Run from
  // reposition (selectionchange), never while the user is typing in the
  // field itself.
  let lastFontSet = '';
  const styledAncestor = (node) => {
    let el = node?.nodeType === 3 ? node.parentElement : node;
    return el instanceof HTMLElement && activeText.contains(el) ? el : null;
  };
  const selectionSize = () => {
    const sel = document.getSelection();
    if (!sel || !sel.rangeCount) return null;
    const range = sel.getRangeAt(0);
    // Collapsed caret: the size where the caret sits.
    if (range.collapsed) {
      const el = styledAncestor(range.startContainer);
      return el ? Math.round(parseFloat(getComputedStyle(el).fontSize)) : null;
    }
    // Otherwise: measure the actual size of every SELECTED text run. We
    // walk the text nodes, not the selection endpoints, because those can
    // point at a container (after reselect with setStartBefore) and yield
    // the field's base size.
    const sizes = new Set();
    const walker = document.createTreeWalker(activeText, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = walker.nextNode())) {
      if (n.textContent && n.parentElement && sel.containsNode(n, true)) {
        sizes.add(Math.round(parseFloat(getComputedStyle(n.parentElement).fontSize)));
      }
    }
    if (sizes.size === 0) return null;
    return sizes.size === 1 ? [...sizes][0] : null; // mixed -> empty
  };
  const selectionFamily = () => {
    let el = styledAncestor(document.getSelection()?.anchorNode);
    while (el && el !== activeText) {
      if (el.style?.fontFamily) return el.style.fontFamily;
      if (el.tagName === 'FONT' && el.getAttribute('face')) return el.getAttribute('face');
      el = el.parentElement;
    }
    return '';
  };
  const syncTypoControls = () => {
    if (document.activeElement !== sizeInput) {
      const px = selectionSize();
      const shown = px == null ? '' : String(px);
      if (sizeInput.value !== shown) sizeInput.value = shown;
    }
    const wantFont = matchFontStack(selectionFamily()) || '';
    if (wantFont !== lastFontSet) { fontDd.set(wantFont); lastFontSet = wantFont; }
  };

  document.addEventListener('focusin', (event) => {
    const target = event.target instanceof HTMLElement
      ? event.target.closest('.urd-text[contenteditable="true"]')
      : null;
    if (target && target !== activeText) {
      activeText = target;
      activeBlockId = target.closest('.urd-block')?.dataset.blockId ?? null;
      linkRow.classList.remove('visible');
      colorRow.classList.remove('visible');
      glyphRow.classList.remove('visible');
      spacingRow.classList.remove('visible');
    }
    if (target) reposition();
  });
  document.addEventListener('focusout', () => {
    // Wait a beat: focus may be on its way to the toolbar itself (or the link field).
    requestAnimationFrame(() => {
      const el = document.activeElement;
      if (el instanceof HTMLElement && (bar.contains(el) || el.closest('.urd-text[contenteditable="true"]'))) return;
      // Was the field SWAPPED OUT by a re-render (typography/panel
      // change), not abandoned by the user? Then reposition reconnects
      // via the block id instead of closing the toolbar.
      if (activeText && !activeText.isConnected && activeBlockId) {
        reposition();
        return;
      }
      activeText = null;
      activeBlockId = null;
      reposition();
    });
  });
  // A click anywhere outside the field closes the toolbar. The surface
  // drag in preview swallows mousedown (preventDefault), so the text field
  // never loses focus by itself; it is therefore closed explicitly here.
  // Clicks in the toolbar, the color picker, the image editor or another
  // text field must NOT close it (they handle themselves).
  document.addEventListener('pointerdown', (event) => {
    if (!activeText) return;
    const target = event.target instanceof Element ? event.target : null;
    if (!target) return;
    if (bar.contains(target) || activeText.contains(target)) return;
    if (target.closest('.urd-text[contenteditable="true"], .urd-cp, .urd-imged, .urd-dd-menu')) return;
    activeText.blur();
    activeText = null;
    activeBlockId = null;
    reposition();
  }, true);
  document.addEventListener('selectionchange', () => {
    // Only when the selection actually sits in the active field; otherwise
    // clicks elsewhere would reposition the toolbar out of context.
    const sel = document.getSelection();
    if (activeText && sel?.anchorNode && activeText.contains(sel.anchorNode)) reposition();
  });
  window.addEventListener('scroll', () => { if (activeText) reposition(); }, { passive: true, capture: true });
  window.addEventListener('resize', () => { if (activeText) reposition(); });
}

/** Toolbar at the section's top right. Desktop: move up/down, fit height,
 *  delete. Mobile: reviewed (✓) and back to auto (↺). */
function addSectionToolbar(host, section, grid) {
  const bar = document.createElement('div');
  bar.className = 'urd-section-toolbar';

  const mk = (text, title, onClick) => {
    const btn = document.createElement('button');
    btn.textContent = text;
    btn.title = title;
    btn.addEventListener('click', onClick);
    bar.appendChild(btn);
  };

  if (isMobile()) {
    const attention = section.responsive?.mobile?.attention;
    if (attention?.needed) {
      // The attention card: WHAT happened (translated reason) and WHEN
      // (relative time), with the reviewed button beside it.
      host.appendChild(buildAttentionCard(host, section, attention));
    }
    // Reset is shown only when the section actually has mobile overrides.
    if (section.blocks.some((b) => b.frames?.mobile)) {
      const reset = document.createElement('button');
      reset.innerHTML = RESET_SVG;
      reset.title = ta('canvas.mobileReset');
      armConfirm(reset, () => post({ type: 'urd-mobile-reset', sectionId: section.id }));
      bar.appendChild(reset);
    }
    // Hidden blocks are otherwise invisible in the mobile view: the chip
    // makes them rediscoverable, with an eye button per block that shows
    // it again.
    const hidden = section.blocks.filter((b) => b.hideMobile);
    if (hidden.length) {
      const chip = document.createElement('button');
      chip.className = 'urd-hidden-chip';
      chip.textContent = ta('canvas.hiddenCount', { n: hidden.length });
      chip.title = ta('canvas.hiddenList');
      chip.addEventListener('click', () => {
        const open = host.querySelector(':scope > .urd-hidden-list');
        if (open) { open.remove(); return; }
        host.appendChild(buildHiddenList(section, hidden));
      });
      bar.appendChild(chip);
    }
  } else {
    // Extensible presets: a "+ card/row/person" button that adds the NEXT item to the section.
    // The factory (def.item) lives in the preset definition; the section remains a generic container.
    const def = section.preset ? window.Urd.sections.get(section.preset) : null;
    if (def?.item) {
      const itemLabel = def.itemLabelKey ? ta(def.itemLabelKey) : (def.itemLabel ?? ta('canvas.itemFallback'));
      mk(`+ ${itemLabel}`, ta('canvas.addItemTitle', { label: itemLabel }), (event) => {
        // Disable until the section re-renders: a double-click before the round trip would put two items in the same slot.
        event.target.disabled = true;
        const next = def.item(section);
        post({ type: 'urd-add-blocks', sectionId: section.id, blocks: next.blocks, minBottom: next.bottom, moves: next.moves ?? [] });
        // Select and scroll to the new item after the re-render: a new
        // EMPTY frame is identical to its neighbors, so without this the
        // click looks dead.
        setTimeout(() => {
          const el = document.querySelector(`.urd-block[data-block-id="${next.blocks[0].id}"]`);
          if (!el) return;
          selectBlock(el);
          // 'nearest' instead of 'center': minimal movement, so the plus button stays in view during repeated additions.
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);
      });
    }
    mk('↑', ta('canvas.sectionUp'), () => post({ type: 'urd-move-section', sectionId: section.id, dir: -1 }));
    mk('↓', ta('canvas.sectionDown'), () => post({ type: 'urd-move-section', sectionId: section.id, dir: 1 }));
    mk('⤓', ta('canvas.fitHeight'), () => {
      const maxBottom = Math.max(0, ...section.blocks.map((b) => b.frames.desktop.y + b.frames.desktop.h));
      const px = Math.max(grid.size * 3, maxBottom + grid.size);
      const minHeight = `${px}px`;
      section.size = { ...section.size, minHeight };
      host.style.minHeight = styleMinHeight(px);
      post({ type: 'urd-section-size', sectionId: section.id, minHeight });
    });
    // "Change layout": only when the section has something to change
    // (the relevance rule: at least two movable blocks).
    if (applicableLayouts(section.blocks).length) {
      const layoutBtn = document.createElement('button');
      layoutBtn.className = 'urd-layout-btn';
      layoutBtn.title = ta('canvas.changeLayout');
      layoutBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="8" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
      layoutBtn.addEventListener('click', () => toggleLayoutPicker(host, section, grid));
      bar.appendChild(layoutBtn);
    }
    // "Save as template": a nameless snapshot to the editor, which names
    // and stores the draft. Re-id happens only at insertion, never here.
    const save = document.createElement('button');
    save.className = 'urd-save-template';
    save.title = ta('canvas.saveTemplate');
    save.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/><path d="M12 7v6M9 10h6"/></svg>';
    save.addEventListener('click', () => {
      post({ type: 'urd-save-template', kind: 'section', section: JSON.parse(JSON.stringify(section)) });
    });
    bar.appendChild(save);
    mk('×', ta('canvas.deleteSection'), () => {
      post({ type: 'urd-delete-section', sectionId: section.id });
    });
  }

  if (bar.childElementCount) host.appendChild(bar);
}

/**
 * Two-click confirmation on a destructive button: the first click arms it
 * (red, "Sure?"), the second click executes. A click outside or Escape
 * disarms. The listeners are cleaned up on every exit.
 */
function armConfirm(btn, onConfirm) {
  const label = btn.innerHTML;
  let armed = false;
  let cleanup = null;
  const disarm = () => {
    armed = false;
    btn.classList.remove('urd-armed');
    btn.innerHTML = label;
    cleanup?.();
    cleanup = null;
  };
  btn.addEventListener('click', () => {
    if (armed) {
      disarm();
      onConfirm();
      return;
    }
    armed = true;
    btn.classList.add('urd-armed');
    btn.textContent = ta('canvas.confirmReset');
    const onDown = (ev) => { if (!btn.contains(ev.target)) disarm(); };
    const onKey = (ev) => { if (ev.key === 'Escape') disarm(); };
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey, true);
    cleanup = () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey, true);
    };
  });
}

/** Relative time for the attention card, in the admin language ("2 hours ago"). */
function relativeTime(iso) {
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return '';
  try {
    const rtf = new Intl.RelativeTimeFormat(adminLang(), { numeric: 'auto' });
    const mins = Math.round((Date.now() - then) / 60000);
    if (Math.abs(mins) < 60) return rtf.format(-mins, 'minute');
    const hours = Math.round(mins / 60);
    if (Math.abs(hours) < 24) return rtf.format(-hours, 'hour');
    return rtf.format(-Math.round(hours / 24), 'day');
  } catch {
    return '';
  }
}

/**
 * The attention card in the mobile view: what happened on desktop
 * (translated attention.reason), when (relative time from
 * attention.since), and the reviewed button. reason tokens without a
 * translation (e.g. from a newer engine) fall back to the generic text.
 */
function buildAttentionCard(host, section, attention) {
  const card = document.createElement('div');
  card.className = 'urd-attention-card';

  const text = document.createElement('div');
  const key = `canvas.attention.${attention.reason}`;
  const label = ta(key);
  text.textContent = label === key ? ta('canvas.attention.fallback') : label;
  card.appendChild(text);

  const when = relativeTime(attention.since);
  if (when) {
    const time = document.createElement('div');
    time.className = 'urd-attention-since';
    time.textContent = when;
    card.appendChild(time);
  }

  const ok = document.createElement('button');
  ok.innerHTML = CHECK_SVG;
  ok.append(` ${ta('canvas.mobileReviewedShort')}`);
  ok.title = ta('canvas.mobileReviewed');
  ok.addEventListener('click', () => {
    section.responsive.mobile.attention = null;
    host.classList.remove('urd-attention');
    card.remove();
    post({ type: 'urd-review-done', sectionId: section.id });
  });
  card.appendChild(ok);
  return card;
}

/**
 * The list of blocks hidden on mobile (the chip in the section toolbar):
 * a type label + an eye button that shows the block again.
 */
function buildHiddenList(section, hidden) {
  const EYE_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z"/><circle cx="12" cy="12" r="2.6"/></svg>';
  const list = document.createElement('div');
  list.className = 'urd-hidden-list';
  for (const block of hidden) {
    const row = document.createElement('div');
    const def = window.Urd.blocks.get(block.type);
    const name = document.createElement('span');
    name.textContent = def?.labelKey ? ta(def.labelKey) : (def?.label ?? block.type);
    row.appendChild(name);
    const show = document.createElement('button');
    show.innerHTML = EYE_SVG;
    show.title = ta('canvas.showBlock');
    show.addEventListener('click', () => {
      block.hideMobile = false;
      post({ type: 'urd-block-flag', sectionId: section.id, blockId: block.id, hideMobile: false });
    });
    row.appendChild(show);
    list.appendChild(row);
  }
  return list;
}

// Drawn icons for the mobile buttons (ADR-0009: never glyphs/emoji in
// chrome): reset (counterclockwise arrow), arrow up/down (order) and a
// check mark.
const RESET_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4v6h6"/><path d="M3.5 13a8.5 8.5 0 1 0 2-5.5L3 10"/></svg>';
const ORDER_UP_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V4"/><path d="M5 11l7-7 7 7"/></svg>';
const ORDER_DOWN_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v16"/><path d="M5 13l7 7 7-7"/></svg>';
const CHECK_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 7"/></svg>';

/**
 * The row index (1-based) at a y offset from the row grid's content top.
 * The track list holds the ACTUAL row heights (grown tracks are taller
 * than MOBILE_ROW); past the last track the grid continues in MOBILE_ROW
 * steps.
 */
function rowAtOffset(tracks, y) {
  let sum = 0;
  for (let i = 0; i < tracks.length; i++) {
    sum += tracks[i];
    if (y < sum) return i + 1;
  }
  return tracks.length + 1 + Math.max(0, Math.floor((y - sum) / MOBILE_ROW));
}

function post(msg) {
  window.parent?.postMessage(msg, location.origin);
}

// Ctrl+Z / Ctrl+Shift+Z inside the iframe is forwarded to the editor,
// which owns the history - UNLESS focus sits in editable text (there the
// browser's own text undo applies; urd-edit keeps the draft in sync).
window.addEventListener('keydown', (event) => {
  if (!(event.ctrlKey || event.metaKey)) return;
  const key = event.key.toLowerCase();
  if (key !== 'z' && key !== 'y') return;
  const target = event.target;
  if (target instanceof HTMLElement && target.isContentEditable) return;
  event.preventDefault();
  post({ type: 'urd-undo', redo: key === 'y' || event.shiftKey });
});

// Selection: clicking a block gives it lasting focus (the handles stay
// visible, see base.css). Clicking outside all blocks deselects. The
// selection survives re-renders via the id.
let selectedBlockId = null;

/**
 * Multi-selection: a set of blocks in ONE section (ids + the section they
 * live in). selectedBlockId is always the primary block of the set. The
 * set is built with shift-click or marquee (dragging on empty surface),
 * and is treated as one unit for drag, arrow keys, deletion and
 * Ctrl+C/D/V.
 */
let multiIds = new Set();
let multiSectionId = null;

/** The clipboard for Ctrl+C/V: block JSON + the source section. Lives in
 *  the preview's module state, so it resets on page switch. */
let clipboard = null;

function selectedEls() {
  if (!multiIds.size) return [];
  return [...multiIds]
    .map((id) => document.querySelector(`.urd-block[data-block-id="${CSS.escape(id)}"]`))
    .filter(Boolean);
}

function applyMultiClasses() {
  document.querySelectorAll('.urd-block.urd-multi-selected').forEach((el) => {
    if (!multiIds.has(el.dataset.blockId)) el.classList.remove('urd-multi-selected');
  });
  for (const el of selectedEls()) el.classList.add('urd-multi-selected');
  updateMultiToolbar();
}

function clearMulti() {
  if (!multiIds.size) return;
  multiIds = new Set();
  multiSectionId = null;
  applyMultiClasses();
}

/** Shift-click: add/remove the block in the set (within one section). */
function toggleMulti(el) {
  const id = el.dataset.blockId;
  const sec = el.closest('.urd-section')?.dataset.sectionId ?? null;
  if (multiSectionId && multiSectionId !== sec) clearMulti();
  multiSectionId = sec;
  // The starting point is the already selected block (same section).
  if (!multiIds.size && selectedBlockId && selectedBlockId !== id) {
    const cur = document.querySelector(`.urd-block[data-block-id="${CSS.escape(selectedBlockId)}"]`);
    if (cur?.closest('.urd-section')?.dataset.sectionId === sec) multiIds.add(selectedBlockId);
  }
  if (multiIds.has(id)) {
    multiIds.delete(id);
    // The primary block remains one still part of the set.
    const rest = selectedEls();
    selectBlock(rest[0] ?? null, { keepMulti: true });
  } else {
    multiIds.add(id);
    selectBlock(el, { keepMulti: true });
  }
  if (multiIds.size < 2) clearMulti();
  applyMultiClasses();
}

function selectBlock(el, opts = {}) {
  if (!opts.keepMulti) clearMulti();
  const previous = selectedBlockId;
  selectedBlockId = el?.dataset.blockId ?? null;
  document.querySelectorAll('.urd-block.urd-selected').forEach((b) => {
    if (b !== el) b.classList.remove('urd-selected');
  });
  el?.classList.add('urd-selected');
  if (previous !== selectedBlockId) {
    post({
      type: 'urd-select-block',
      sectionId: el?.closest('.urd-section')?.dataset.sectionId ?? null,
      blockId: selectedBlockId,
    });
  }
}

// Internal navigation in preview goes via the editor (which switches page
// and keeps the dropdown in sync); external links open in a new tab
// instead of pulling the iframe out of editing mode. Links INSIDE blocks
// (buttons, images, text links) never trigger while editing: the click
// selects the block, and the link is tested via "View page".
document.addEventListener('click', (event) => {
  const a = event.target instanceof HTMLElement ? event.target.closest('a[href]') : null;
  if (!a) return;
  if (a.closest('.urd-block')) {
    event.preventDefault();
    return;
  }
  const href = a.getAttribute('href');
  if (!href || href.startsWith('#')) return;
  event.preventDefault();
  const url = new URL(href, location.href);
  if (url.origin === location.origin) {
    post({ type: 'urd-navigate', path: url.pathname });
  } else {
    window.open(url, '_blank', 'noopener');
  }
});

// Keyboard on a selected block/set: arrow keys move (grid steps;
// Shift = 1 px), Delete deletes, Esc deselects, Ctrl+C/V copies and
// pastes with the layout preserved, Ctrl+D duplicates. Never when focus
// sits in text/fields, and moving applies to the desktop view.
window.addEventListener('keydown', (event) => {
  const target = event.target;
  if (target instanceof HTMLElement
    && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
  const ctrl = event.ctrlKey || event.metaKey;

  // Ctrl+V needs no selection: paste where the active section is.
  if (ctrl && event.key.toLowerCase() === 'v') {
    if (isMobile() || !clipboard) return;
    event.preventDefault();
    pasteClipboard();
    return;
  }

  // Set deletion needs no single-block anchor (a marquee can be left
  // without one after group operations). Deletion is structural work and
  // belongs to the desktop view, like the other shortcuts.
  if ((event.key === 'Delete' || event.key === 'Backspace') && multiIds.size > 1) {
    if (isMobile()) return;
    event.preventDefault();
    deleteSelection();
    return;
  }

  // Slash command: "/" opens the + New block menu with the search field
  // focused, in the active section (otherwise the section under the
  // pointer); if the pointer sits in the section, the block lands at the
  // pointer point.
  if (event.key === '/' && !ctrl && !event.altKey) {
    if (isMobile() || document.body.classList.contains('urd-chrome-off')) return;
    const active = document.querySelector('.urd-section-active');
    const under = lastPointer
      ? document.elementFromPoint(lastPointer.x, lastPointer.y)?.closest?.('.urd-section') ?? null
      : null;
    const host = active ?? under ?? document.querySelector('.urd-section');
    if (!host) return;
    event.preventDefault();
    closeMenus();
    if (lastPointer && host === under) openBlockMenuAt(host, lastPointer.x, lastPointer.y);
    else openBlockMenuAt(host);
    return;
  }

  if (!selectedBlockId) return;

  if (event.key === 'Escape') {
    selectBlock(null);
    return;
  }

  const el = document.querySelector(`.urd-block[data-block-id="${selectedBlockId}"]`);
  const ctx = el?._urdCtx;
  if (!ctx) return;

  if (ctrl && event.key.toLowerCase() === 'c') {
    if (isMobile()) return;
    event.preventDefault();
    copySelection(ctx);
    return;
  }

  if (ctrl && event.key.toLowerCase() === 'd') {
    if (isMobile()) return;
    event.preventDefault();
    if (multiIds.size > 1) duplicateSelection(ctx);
    else duplicateBlock(ctx.section, ctx.block);
    return;
  }

  if (event.key === 'Delete' || event.key === 'Backspace') {
    if (isMobile()) return;
    event.preventDefault();
    post({ type: 'urd-delete', sectionId: ctx.section.id, blockId: selectedBlockId });
    selectBlock(null);
    return;
  }

  const dirs = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
  const dir = dirs[event.key];
  if (!dir || isMobile()) return;
  event.preventDefault();

  const stepPx = event.shiftKey ? 1 : ctx.grid.size;
  const pctPerPx = 100 / canvasOf(ctx.host).clientWidth;
  const r1 = (v) => Math.round(v * 10) / 10;

  if (multiIds.size > 1) {
    // The whole set moves by the same delta, clamped so the group stays
    // within the width; a burst of presses becomes one undo step.
    // The axis NOT being moved is never touched (rounding an untouched
    // x/y would leave an invisible change keeping the draft dirty).
    const parts = selectedEls().map((e) => ({ el: e, ctx: e._urdCtx })).filter((p) => p.ctx);
    const d = dir[0] ? groupDelta(parts.map((p) => p.ctx.block.frames.desktop), r1(dir[0] * stepPx * pctPerPx), 0) : { dx: 0 };
    suspendSticky();
    for (const p of parts) {
      const frame = { ...p.ctx.block.frames.desktop };
      if (dir[0]) frame.x = r1(frame.x + d.dx);
      if (dir[1]) frame.y = frame.y + dir[1] * stepPx;
      p.ctx.block.frames.desktop = frame;
      Object.assign(p.el.style, frameToCss(frame));
      post({ type: 'urd-move', sectionId: p.ctx.section.id, blockId: p.ctx.block.id, frame, frameKey: 'desktop', coalesce: true, groupKey: 'multi-arrow' });
    }
    resumeSticky();
    updateMultiToolbar();
    return;
  }

  const frame = { ...ctx.block.frames.desktop };
  if (dir[0]) frame.x = clamp(r1(frame.x + dir[0] * stepPx * pctPerPx), 0, r1(100 - frame.w));
  if (dir[1]) frame.y = frame.y + dir[1] * stepPx;
  ctx.block.frames.desktop = frame;
  suspendSticky();
  Object.assign(el.style, frameToCss(frame));
  resumeSticky();
  // coalesce: a burst of arrow-key presses becomes one undo step.
  post({ type: 'urd-move', sectionId: ctx.section.id, blockId: selectedBlockId, frame, frameKey: 'desktop', coalesce: true });
});

// Active section: the editor's palette puts new blocks in the last
// clicked section, marked with an accent line at the left edge.
//
// markActiveVisual sets ONLY the class (the palette hint). markActive
// additionally posts urd-select-section, which makes the editor show the
// SECTION's properties - that must only happen when the bare section
// surface is clicked, never when a block or a block handle is touched
// (then the block's own urd-select-block carries the section context, and
// Properties stays on the block).
function markActiveVisual(host) {
  document.querySelectorAll('.urd-section-active').forEach((s) => {
    if (s !== host) s.classList.remove('urd-section-active');
  });
  if (host) host.classList.add('urd-section-active');
}
function markActive(host) {
  markActiveVisual(host);
  if (host) post({ type: 'urd-select-section', sectionId: host.dataset.sectionId });
}

document.addEventListener('pointerdown', (event) => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  // Clicks in the multi toolbar must never change the set it acts on.
  if (target?.closest('.urd-multi-toolbar')) return;
  const blockEl = target?.closest('.urd-block') ?? null;
  if (blockEl && event.shiftKey && !isMobile()) {
    toggleMulti(blockEl);
  } else if (blockEl && multiIds.size > 1 && multiIds.has(blockEl.dataset.blockId)) {
    // Clicking a member keeps the set (group drag), but makes the block
    // primary.
    selectBlock(blockEl, { keepMulti: true });
  } else {
    selectBlock(blockEl);
  }
  // Clicking a block must not post a section choice (Properties stays on
  // the block); only the bare section surface switches to the section's
  // properties.
  const host = target?.closest('.urd-section');
  if (blockEl) markActiveVisual(host);
  else markActive(host);
});

// Marquee: dragging on empty section surface draws a selection frame, and
// every block it overlaps becomes the set (a click without a drag remains
// a click; the set is limited to the section the drag started in).
document.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || event.shiftKey || isMobile()) return;
  if (document.body.classList.contains('urd-chrome-off')) return;
  const target = event.target instanceof HTMLElement ? event.target : null;
  const host = target?.closest('.urd-section');
  if (!host) return;
  if (target.closest('.urd-block, .urd-add-block, .urd-add-section, .urd-section-toolbar, .urd-section-resize, .urd-section-resize-top, .urd-hint-chip, .urd-hint-card, .urd-multi-toolbar, .urd-text-toolbar')) return;

  // The marquee rectangle and hit detection are measured against the
  // content surface: the blocks' offsetLeft/offsetTop are relative to it
  // (it is their offsetParent), so both sides of the comparison must
  // share the same frame.
  const canvas = canvasOf(host);
  const startRect = canvas.getBoundingClientRect();
  const start = { x: event.clientX - startRect.left, y: event.clientY - startRect.top };
  let rectEl = null;

  const onMove = (ev) => {
    const hostRect = canvas.getBoundingClientRect();
    const cur = { x: ev.clientX - hostRect.left, y: ev.clientY - hostRect.top };
    if (!rectEl) {
      if (Math.abs(cur.x - start.x) + Math.abs(cur.y - start.y) < 6) return;
      rectEl = document.createElement('div');
      rectEl.className = 'urd-marquee';
      canvas.appendChild(rectEl);
      document.body.classList.add('urd-marqueeing');
      document.getSelection()?.removeAllRanges();
    }
    const rect = {
      left: Math.min(start.x, cur.x),
      top: Math.min(start.y, cur.y),
      right: Math.max(start.x, cur.x),
      bottom: Math.max(start.y, cur.y),
    };
    rectEl.style.left = `${rect.left}px`;
    rectEl.style.top = `${rect.top}px`;
    rectEl.style.width = `${rect.right - rect.left}px`;
    rectEl.style.height = `${rect.bottom - rect.top}px`;
    const blocks = [...canvas.querySelectorAll(':scope > .urd-block')].map((el) => ({
      id: el.dataset.blockId,
      left: el.offsetLeft,
      top: el.offsetTop,
      right: el.offsetLeft + el.offsetWidth,
      bottom: el.offsetTop + el.offsetHeight,
    }));
    multiSectionId = host.dataset.sectionId;
    multiIds = new Set(blocksInRect(rect, blocks));
    applyMultiClasses();
  };
  const onUp = () => {
    document.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerup', onUp);
    document.body.classList.remove('urd-marqueeing');
    if (!rectEl) return;
    rectEl.remove();
    if (multiIds.size < 2) {
      const single = selectedEls()[0] ?? null;
      clearMulti();
      selectBlock(single);
      return;
    }
    selectBlock(selectedEls()[0], { keepMulti: true });
    updateMultiToolbar();
  };
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerup', onUp);
});

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/* ---------- Multi-selection: toolbar, copy/paste ---------- */

/** Deletes the whole set as ONE undo step (shared by the Delete key and
 *  the toolbar's delete button). */
function deleteSelection() {
  const ctx = selectedEls()[0]?._urdCtx;
  const sectionId = multiSectionId ?? ctx?.section?.id;
  if (!sectionId || multiIds.size < 2) return;
  post({ type: 'urd-delete', sectionId, blockIds: [...multiIds] });
  selectBlock(null);
}

/** Floating toolbar above the set: align/distribute + count. */
let multiBar = null;

function buildMultiBar() {
  multiBar = document.createElement('div');
  multiBar.className = 'urd-multi-toolbar';
  // Clicks in the toolbar must not bubble to the document's selection listener.
  multiBar.addEventListener('pointerdown', (event) => event.stopPropagation());

  const count = document.createElement('span');
  count.className = 'urd-multi-count';
  multiBar.appendChild(count);
  multiBar._urdCount = count;

  const svg = (body) => `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${body}</svg>`;
  const btn = (html, title, run) => {
    const b = document.createElement('button');
    b.innerHTML = html;
    b.title = title;
    b.addEventListener('click', run);
    multiBar.appendChild(b);
    return b;
  };
  btn(svg('<path d="M4 3v18"/><rect x="7" y="6" width="10" height="4"/><rect x="7" y="14" width="14" height="4"/>'), ta('canvas.alignLeft'), () => applyAlign('left'));
  btn(svg('<path d="M12 3v18"/><rect x="7" y="6" width="10" height="4"/><rect x="4" y="14" width="16" height="4"/>'), ta('canvas.alignCenterH'), () => applyAlign('center'));
  btn(svg('<path d="M20 3v18"/><rect x="7" y="6" width="10" height="4"/><rect x="3" y="14" width="14" height="4"/>'), ta('canvas.alignRight'), () => applyAlign('right'));
  btn(svg('<path d="M3 4h18"/><rect x="6" y="7" width="4" height="10"/><rect x="14" y="7" width="4" height="14"/>'), ta('canvas.alignTop'), () => applyAlign('top'));
  btn(svg('<path d="M3 12h18"/><rect x="6" y="7" width="4" height="10"/><rect x="14" y="4" width="4" height="16"/>'), ta('canvas.alignMiddleV'), () => applyAlign('middle'));
  btn(svg('<path d="M3 20h18"/><rect x="6" y="7" width="4" height="10"/><rect x="14" y="3" width="4" height="14"/>'), ta('canvas.alignBottom'), () => applyAlign('bottom'));
  const distH = btn(svg('<path d="M3 3v18M21 3v18"/><rect x="7" y="9" width="3" height="6"/><rect x="14" y="9" width="3" height="6"/>'), ta('canvas.distributeH'), () => applyDistribute('x'));
  const distV = btn(svg('<path d="M3 3h18M3 21h18"/><rect x="9" y="7" width="6" height="3"/><rect x="9" y="14" width="6" height="3"/>'), ta('canvas.distributeV'), () => applyDistribute('y'));
  multiBar._urdDist = [distH, distV];
  // "Save group as template" (the snippets model): the whole set is saved
  // as a reusable block group; naming and storage happen in the editor
  // (urd-save-template), and the group appears in the block menus.
  const saveGroup = btn(svg('<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/><path d="M12 7v6M9 10h6"/>'), ta('canvas.saveGroup'), () => {
    const blocks = selectedEls().map((el) => el._urdCtx?.block).filter(Boolean);
    if (blocks.length < 2) return;
    post({ type: 'urd-save-template', kind: 'blocks', blocks: JSON.parse(JSON.stringify(blocks)) });
  });
  saveGroup.classList.add('urd-multi-save');
  // "Pin the group": the whole set gets the same group id and is pinned
  // as ONE unit, so the blocks keep their relative placement instead of
  // all piling up at the top of the window. If the set is already pinned
  // as a group, the button unpins it.
  btn(svg('<path d="M12 17v5"/><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3z"/>'), ta('canvas.stickyGroup'), () => {
    const blocks = selectedEls().map((el) => el._urdCtx?.block).filter(Boolean);
    if (blocks.length < 2) return;
    const grouped = blocks.every((b) => b.sticky?.group);
    post({
      type: 'urd-sticky-group',
      sectionId: multiSectionId,
      blockIds: blocks.map((b) => b.id),
      on: !grouped,
    });
  });
  // The drag handle: grab the whole set and drag it together (its own
  // button next to the trash icon); recorded as ONE undo step on release.
  const grip = document.createElement('button');
  grip.className = 'urd-multi-drag';
  grip.title = ta('canvas.dragSelected');
  grip.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><g fill="currentColor"><circle cx="3" cy="3.5" r="1.4"/><circle cx="7" cy="3.5" r="1.4"/><circle cx="11" cy="3.5" r="1.4"/><circle cx="3" cy="10.5" r="1.4"/><circle cx="7" cy="10.5" r="1.4"/><circle cx="11" cy="10.5" r="1.4"/></g></svg>';
  grip.addEventListener('pointerdown', startSelectionDrag);
  multiBar.appendChild(grip);
  const del = btn(svg('<path d="M4 7h16"/><path d="M9 7V5h6v2"/><path d="M6 7l1 13h10l1-13"/><path d="M10 11v6M14 11v6"/>'), ta('canvas.deleteSelected'), deleteSelection);
  del.classList.add('urd-multi-delete');
  document.body.appendChild(multiBar);
}

/** Drag the whole set together from the toolbar handle: a live view
 *  during the drag (clamped by groupDelta so the group stays in the
 *  section), recorded as ONE undo step on release. Cancel restores
 *  everything. */
function startSelectionDrag(event) {
  // The isPrimary guard: a second finger on the handle must not start a
  // competing drag with its own listeners fighting over the delta.
  if (event.button !== 0 || !event.isPrimary) return;
  const items = selectionItems();
  const host = selectedEls()[0]?.closest('.urd-section');
  if (!host || items.length < 2) return;
  event.preventDefault();
  event.stopPropagation();
  const handle = event.currentTarget;
  handle.setPointerCapture(event.pointerId);
  // As with the single drag: pinned blocks are released back to their real
  // place before the drag writes geometry on them.
  suspendSticky();

  const width = canvasOf(host).getBoundingClientRect().width;
  const startX = event.clientX;
  const startY = event.clientY;
  const r2 = (v) => Math.round(v * 100) / 100;
  let delta = { dx: 0, dy: 0 };

  const apply = (frameFor) => {
    for (const it of items) {
      const el = document.querySelector(`.urd-block[data-block-id="${CSS.escape(it.id)}"]`);
      if (el) Object.assign(el.style, frameToCss(frameFor(it)));
    }
    // The toolbar follows the set, so the handle stays under the pointer the whole way.
    updateMultiToolbar();
  };
  const move = (e) => {
    delta = groupDelta(items, ((e.clientX - startX) / width) * 100, e.clientY - startY);
    apply((it) => ({ ...it, x: it.x + delta.dx, y: it.y + delta.dy }));
  };
  const finish = (commit) => {
    handle.removeEventListener('pointermove', move);
    handle.removeEventListener('pointerup', up);
    handle.removeEventListener('pointercancel', cancel);
    resumeSticky();
    if (commit && (delta.dx || delta.dy)) {
      applySelectionMoves(items.map((it) => ({ id: it.id, x: r2(it.x + delta.dx), y: it.y + delta.dy })));
    } else {
      apply((it) => it);
    }
  };
  const up = () => finish(true);
  const cancel = () => finish(false);
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', up);
  handle.addEventListener('pointercancel', cancel);
}

function updateMultiToolbar() {
  const active = multiIds.size >= 2 && !isMobile() && !document.body.classList.contains('urd-chrome-off');
  if (!active) {
    multiBar?.classList.remove('visible');
    return;
  }
  if (!multiBar) buildMultiBar();
  const els = selectedEls();
  if (els.length < 2) {
    multiBar.classList.remove('visible');
    return;
  }
  multiBar._urdCount.textContent = ta('canvas.selectedCount', { n: els.length });
  // The distribute buttons require at least three blocks (settings only when relevant).
  for (const b of multiBar._urdDist) b.style.display = els.length >= 3 ? '' : 'none';
  multiBar.classList.add('visible');
  const rects = els.map((el) => el.getBoundingClientRect());
  const left = Math.min(...rects.map((r) => r.left));
  const right = Math.max(...rects.map((r) => r.right));
  const top = Math.min(...rects.map((r) => r.top));
  const x = clamp((left + right) / 2 - multiBar.offsetWidth / 2, 8, window.innerWidth - multiBar.offsetWidth - 8);
  const y = Math.max(8, top - multiBar.offsetHeight - 10);
  multiBar.style.left = `${x}px`;
  multiBar.style.top = `${y}px`;
}

// The toolbar follows the set on scroll/resize (fixed positioning).
window.addEventListener('scroll', () => { if (multiIds.size > 1) updateMultiToolbar(); }, { passive: true, capture: true });
window.addEventListener('resize', () => { if (multiIds.size > 1) updateMultiToolbar(); });

/** The set's frames as plain items for align/distribute. */
function selectionItems() {
  return selectedEls()
    .map((el) => {
      const block = el._urdCtx?.block;
      return block ? { id: block.id, ...block.frames.desktop } : null;
    })
    .filter(Boolean);
}

/** Record a list of moves as ONE undo step (shared groupKey). */
function applySelectionMoves(moves) {
  if (!moves.length) return;
  // Writes geometry straight onto the elements without a re-render, so
  // the pinning must let go first (otherwise the next pin is measured
  // against the old place).
  suspendSticky();
  const key = makeId('malign');
  for (const move of moves) {
    const el = document.querySelector(`.urd-block[data-block-id="${CSS.escape(move.id)}"]`);
    const ctx = el?._urdCtx;
    if (!ctx) continue;
    const frame = { ...ctx.block.frames.desktop };
    if (typeof move.x === 'number') frame.x = move.x;
    if (typeof move.y === 'number') frame.y = move.y;
    ctx.block.frames.desktop = frame;
    Object.assign(el.style, frameToCss(frame));
    post({ type: 'urd-move', sectionId: ctx.section.id, blockId: move.id, frame, frameKey: 'desktop', coalesce: true, groupKey: key });
  }
  resumeSticky();
  updateMultiToolbar();
}

function applyAlign(mode) {
  applySelectionMoves(alignMoves(selectionItems(), mode));
}

function applyDistribute(axis) {
  applySelectionMoves(distributeMoves(selectionItems(), axis));
}

/** Ctrl+C: the set (or the single selected block) to the clipboard. */
function copySelection(ctx) {
  const ids = multiIds.size > 1 ? multiIds : new Set([selectedBlockId]);
  const blocks = ctx.section.blocks.filter((b) => ids.has(b.id));
  if (!blocks.length) return;
  clipboard = { sectionId: ctx.section.id, blocks: JSON.parse(JSON.stringify(blocks)) };
}

/**
 * Ctrl+V: paste the clipboard with the internal layout preserved - all
 * blocks get the SAME offset (slightly down/right, clamped by groupDelta
 * so the whole group stays within the section). The target is the active
 * section, otherwise the source section, otherwise the first. Sent
 * together as urd-add-blocks = ONE undo step, and the new set is
 * selected.
 */
function pasteClipboard(source = clipboard) {
  if (!source?.blocks?.length) return;
  const host = document.querySelector('.urd-section-active')
    ?? document.querySelector(`.urd-section[data-section-id="${CSS.escape(source.sectionId)}"]`)
    ?? document.querySelector('.urd-section');
  if (!host) return;
  const sectionId = host.dataset.sectionId;
  const r2 = (v) => Math.round(v * 100) / 100;
  const frames = source.blocks.map((b) => b.frames.desktop);
  const { dx, dy } = groupDelta(frames, 2, 16);
  const blocks = source.blocks.map((b) => {
    const copy = JSON.parse(JSON.stringify(b));
    copy.id = makeId('blk');
    copy.frames.desktop = { ...copy.frames.desktop, x: r2(copy.frames.desktop.x + dx), y: copy.frames.desktop.y + dy };
    return copy;
  });
  const minBottom = Math.max(...blocks.map((b) => b.frames.desktop.y + b.frames.desktop.h));
  post({ type: 'urd-add-blocks', sectionId, blocks, minBottom, moves: [] });
  // The next paste continues from the pasted content (no stacking on top of each other).
  if (source === clipboard) clipboard = { sectionId, blocks: JSON.parse(JSON.stringify(blocks)) };
  // The pasted content becomes the new set: the re-render after
  // urd-add-blocks reads multiIds/selectedBlockId (enhanceSection), and
  // the editor follows.
  document.querySelectorAll('.urd-block.urd-selected, .urd-block.urd-multi-selected')
    .forEach((b) => b.classList.remove('urd-selected', 'urd-multi-selected'));
  multiSectionId = sectionId;
  multiIds = blocks.length > 1 ? new Set(blocks.map((b) => b.id)) : new Set();
  selectedBlockId = blocks[0].id;
  post({ type: 'urd-select-block', sectionId, blockId: selectedBlockId });
}

/** Insert a block-group template into a section: re-id + anchor/clamp via
 *  the template model (the re-id rule in SCHEMA.md), ONE undo step via
 *  urd-add-blocks, and the inserted content becomes the new set (the same
 *  tail as pasteClipboard). anchor = {x in %, y in px} or null. */
function insertBlocksTemplate(tpl, sectionId, anchor) {
  const { blocks, minBottom } = cloneBlocksForInsert(tpl.blocks, makeId, { anchor });
  post({ type: 'urd-add-blocks', sectionId, blocks, minBottom, moves: [] });
  document.querySelectorAll('.urd-block.urd-selected, .urd-block.urd-multi-selected')
    .forEach((b) => b.classList.remove('urd-selected', 'urd-multi-selected'));
  multiSectionId = sectionId;
  multiIds = blocks.length > 1 ? new Set(blocks.map((b) => b.id)) : new Set();
  selectedBlockId = blocks[0].id;
  post({ type: 'urd-select-block', sectionId, blockId: selectedBlockId });
}

/** The Blocks panel's My templates group (urd-insert-template): insert
 *  into the active section (otherwise the first) with stored positions,
 *  clamping only. */
export function insertTemplate(id) {
  const tpl = templates.find((m) => m.id === id && m.kind === 'blocks' && Array.isArray(m.blocks));
  const host = document.querySelector('.urd-section-active') ?? document.querySelector('.urd-section');
  if (!tpl || !host) return;
  insertBlocksTemplate(tpl, host.dataset.sectionId, null);
}

/** Ctrl+D with a multi-selection: duplicate the set (via the paste flow). */
function duplicateSelection(ctx) {
  const ids = [...multiIds];
  const blocks = ctx.section.blocks.filter((b) => ids.includes(b.id));
  pasteClipboard({ sectionId: ctx.section.id, blocks: JSON.parse(JSON.stringify(blocks)) });
}

/**
 * Select a block by id (the bridge: the editor just built the block
 * itself, e.g. from the + New block menu, and the preview does not know
 * the id until the section is re-rendered). Called AFTER the re-render.
 */
export function selectById(blockId) {
  const el = document.querySelector(`.urd-block[data-block-id="${CSS.escape(blockId)}"]`);
  if (el) selectBlock(el);
}

/** Duplicate the selected block (the bridge: Ctrl+D with focus in the admin panels). */
export function duplicateSelected() {
  if (isMobile() || !selectedBlockId) return;
  const ctx = document.querySelector(`.urd-block[data-block-id="${selectedBlockId}"]`)?._urdCtx;
  if (ctx) duplicateBlock(ctx.section, ctx.block);
}

/** Duplicate a block: a copy with a new id, slightly offset, in the same section. */
function duplicateBlock(section, block) {
  const copy = JSON.parse(JSON.stringify(block));
  copy.id = makeId('blk');
  const f = copy.frames.desktop;
  copy.frames.desktop = {
    ...f,
    x: clamp(Math.round((f.x + 2) * 100) / 100, 0, Math.max(0, Math.round((100 - f.w) * 100) / 100)),
    y: f.y + 16,
  };
  post({ type: 'urd-add-block', sectionId: section.id, block: copy });
  // The duplicate becomes the selected block: the re-render after
  // urd-add-block selects it (enhanceSection reads selectedBlockId), and
  // the editor follows via urd-select-block so the Properties panel shows
  // the copy.
  document.querySelectorAll('.urd-block.urd-selected').forEach((b) => b.classList.remove('urd-selected'));
  selectedBlockId = copy.id;
  post({ type: 'urd-select-block', sectionId: section.id, blockId: copy.id });
}

/**
 * Visible grid overlay in the section while dragging/resizing, so the
 * snapping has something visible to snap against. The lines are drawn
 * with CSS gradients at the exact column width/row height.
 */
function showGridOverlay(host, grid) {
  const overlay = document.createElement('div');
  overlay.className = 'urd-grid-overlay';
  overlay.style.backgroundSize = `${grid.size}px ${grid.size}px`;
  // In the content surface, not in the section: the snapping is relative
  // to the surface, so the cells must start where the blocks start.
  canvasOf(host).appendChild(overlay);
  return overlay;
}

function enhanceBlock(el, block, section, grid, host) {
  el.classList.add('urd-editable');
  if (block.id === selectedBlockId) el.classList.add('urd-selected');
  if (block.decor) el.classList.add('urd-decor');
  // The keyboard handler (arrow keys/Delete) needs the block's context.
  el._urdCtx = { block, section, grid, host };

  const mobile = isMobile();

  const toolbar = document.createElement('div');
  toolbar.className = 'urd-edit-toolbar';
  // The toolbar sits above the block; at the top of the page or right
  // below the menu there is no visible room there (above the document top
  // or behind the menu). Then it flips below the block. Measured against
  // the VIEWPORT when the pointer hits the block (and on selection): the
  // position is changed by both dragging and scrolling, which never
  // re-render.
  const updateToolbarSide = () => {
    const cs = getComputedStyle(document.documentElement);
    const navH = Number.parseFloat(cs.getPropertyValue('--urd-nav-h')) || 0;
    const scale = Number.parseFloat(cs.getPropertyValue('--urd-chrome-scale')) || 1;
    toolbar.classList.toggle('urd-toolbar-under', el.getBoundingClientRect().top < navH + 34 * scale);
  };
  updateToolbarSide();
  el.addEventListener('pointerenter', updateToolbarSide);

  // The shared image editor for image blocks: all the fields, with live DOM updates
  // (only an image swap needs a re-render, and then the panel closes).
  const openBlockImageEditor = () => {
    const frame = () => el.querySelector('.urd-image-frame');
    // The full editor: swap/remove, alt, fit, zoom, rounding, link, focus
    // point (with a rule-of-thirds grid) and filters (grayscale/reset).
    openImageEditor(frame() ?? el.querySelector('img') ?? el, {
      fields: ['image', 'remove', 'alt', 'fit', 'zoom', 'radius', 'href', 'focus', 'filters'],
      get: (field) => (field === 'image' ? block.props.src || null : block.props[field]),
      set: (field, value) => {
        const key = field === 'image' ? 'src' : field;
        block.props = { ...block.props, [key]: value };
        // Swapping/removing the image requires a new render (the frame is
        // rebuilt); other fields update live via the shared
        // applyImageStyle.
        const node = frame();
        if (node && field !== 'image') applyImageStyle(node, block.props);
        post({ type: 'urd-edit', sectionId: section.id, blockId: block.id, props: block.props, rerender: field === 'image' });
      },
    });
  };
  if (block.type === 'image' && !mobile) {
    el.addEventListener('dblclick', (event) => {
      event.preventDefault();
      openBlockImageEditor();
    });
  }

  const moveHandle = document.createElement('button');
  moveHandle.className = 'urd-edit-move';
  moveHandle.textContent = '⠿';
  moveHandle.title = ta('canvas.dragMove');
  toolbar.appendChild(moveHandle);

  // Flowing mobile block: arrows that move it in the reading order
  // (writes mobileOrder). Pinned blocks do not take part in the flow and
  // get ↺ instead.
  if (mobile && !Number.isFinite(block.frames.mobile?.row)) {
    for (const [svg, dir, key] of [[ORDER_UP_SVG, -1, 'canvas.orderUp'], [ORDER_DOWN_SVG, 1, 'canvas.orderDown']]) {
      const btn = document.createElement('button');
      btn.innerHTML = svg;
      btn.title = ta(key);
      btn.addEventListener('click', () => {
        const order = reorderMobileKey(section.blocks, block.id, dir);
        if (order === null) return;
        block.mobileOrder = order;
        post({ type: 'urd-mobile-order', sectionId: section.id, blockId: block.id, mobileOrder: order });
      });
      toolbar.appendChild(btn);
    }
  }

  // Overridden mobile block: a pin badge showing the state, and a ↺ that
  // resets ONLY this block's override (back in sync with desktop).
  if (mobile && block.frames.mobile) {
    const MOBILE_PIN_SVG = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3z"/></svg>';
    const pin = document.createElement('div');
    pin.className = 'urd-mobile-pin';
    pin.innerHTML = MOBILE_PIN_SVG;
    pin.title = ta('canvas.mobilePinned');
    el.appendChild(pin);

    const resetBtn = document.createElement('button');
    resetBtn.innerHTML = RESET_SVG;
    resetBtn.title = ta('canvas.mobileResetBlock');
    resetBtn.addEventListener('click', () => {
      post({ type: 'urd-mobile-reset', sectionId: section.id, blockId: block.id });
    });
    toolbar.appendChild(resetBtn);
  }

  // z-order: put the block at the top/bottom among the section's blocks.
  const bumpZ = (dir) => {
    const others = section.blocks.filter((b) => b.id !== block.id);
    const zs = others.map((b) => b.frames.desktop.z ?? 1);
    let z;
    if (dir > 0) {
      z = zs.length ? Math.max(...zs) + 1 : 1;
    } else if (!zs.length || Math.min(...zs) > 1) {
      z = 1;
    } else {
      // Someone already sits at the bottom: push the others one notch up
      // instead, so this one can go last (z never goes below 1).
      z = 1;
      for (const other of others) {
        const frame = { ...other.frames.desktop, z: (other.frames.desktop.z ?? 1) + 1 };
        other.frames.desktop = frame;
        host.querySelector(`[data-block-id="${other.id}"]`)?.style.setProperty('z-index', String(frame.z));
        // groupKey collects the whole z reordering (all blocks) into ONE undo step in the editor.
        post({ type: 'urd-move', sectionId: section.id, blockId: other.id, frame, coalesce: true, groupKey: `z-${block.id}` });
      }
    }
    const frame = { ...block.frames.desktop, z };
    block.frames.desktop = frame;
    el.style.zIndex = String(z);
    post({ type: 'urd-move', sectionId: section.id, blockId: block.id, frame, coalesce: true, groupKey: `z-${block.id}` });
  };
  // Structure (z-order, decor, deletion) is edited in the desktop view;
  // the mobile view is pure layout adjustment.
  if (!mobile) {
    const Z_FRONT_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14"/><path d="M12 20V9"/><path d="M7 13l5-5 5 5"/></svg>';
    const Z_BACK_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 20h14"/><path d="M12 4v11"/><path d="M7 11l5 5 5-5"/></svg>';
    const frontBtn = document.createElement('button');
    frontBtn.innerHTML = Z_FRONT_SVG;
    frontBtn.title = ta('canvas.zFront');
    frontBtn.addEventListener('click', () => bumpZ(1));
    toolbar.appendChild(frontBtn);

    const backBtn = document.createElement('button');
    backBtn.innerHTML = Z_BACK_SVG;
    backBtn.title = ta('canvas.zBack');
    backBtn.addEventListener('click', () => bumpZ(-1));
    toolbar.appendChild(backBtn);

    // Mobile visibility: phone = the block is shown on mobile, crossed-out
    // phone = it is hidden (hideMobile). The icon IS the state (a drawn
    // SVG, not emoji); the tooltip explains the click.
    const PHONE_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.2h3"/></svg>';
    const PHONE_OFF_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10.5 18.2h3"/><path d="M3.5 3.5l17 17"/></svg>';
    const hideBtn = document.createElement('button');
    hideBtn.className = 'urd-edit-decor';
    const syncHide = () => {
      hideBtn.innerHTML = block.hideMobile ? PHONE_OFF_SVG : PHONE_SVG;
      hideBtn.title = block.hideMobile
        ? ta('canvas.hideMobileOn')
        : ta('canvas.hideMobileOff');
      hideBtn.classList.toggle('on', Boolean(block.hideMobile));
    };
    syncHide();
    hideBtn.addEventListener('click', () => {
      block.hideMobile = !block.hideMobile;
      syncHide();
      post({ type: 'urd-block-flag', sectionId: section.id, blockId: block.id, hideMobile: block.hideMobile });
    });
    toolbar.appendChild(hideBtn);

    const DUP_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg>';
    if (block.type === 'image') {
      const imgBtn = document.createElement('button');
      imgBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3l4 4L8 20l-5 1 1-5L17 3z"/></svg>';
      imgBtn.title = ta('canvas.editImage');
      imgBtn.addEventListener('click', () => openBlockImageEditor());
      toolbar.appendChild(imgBtn);
    }

    const dupBtn = document.createElement('button');
    dupBtn.innerHTML = DUP_SVG;
    dupBtn.title = ta('canvas.duplicate');
    dupBtn.addEventListener('click', () => duplicateBlock(section, block));
    toolbar.appendChild(dupBtn);

    // Block menu: all the block settings in a floating menu by the block
    // (the calendar pattern). The menu itself lives in the editor (the
    // same controls as Properties); only the position is reported here.
    const GEAR_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3.2"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3 1a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.7a7 7 0 0 0-2 1.2l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 2 1.2l.4 2.7h4l.4-2.7a7 7 0 0 0 2-1.2l2.3 1 2-3.4-2-1.5c.06-.4.1-.8.1-1.2z"/></svg>';
    const menuBtn = document.createElement('button');
    menuBtn.innerHTML = GEAR_SVG;
    menuBtn.title = ta('canvas.blockMenu');
    // Without the stop, pointerdown would bubble to the document's
    // selection listener, which can trigger a re-render (section
    // activation) BEFORE click fires - and then the button is swapped out
    // mid-click (the same guard as the handles).
    menuBtn.addEventListener('pointerdown', (event) => event.stopPropagation());
    menuBtn.addEventListener('click', () => {
      selectBlock(el);
      const r = el.getBoundingClientRect();
      post({
        type: 'urd-block-menu',
        sectionId: section.id,
        blockId: block.id,
        rect: { left: r.left, top: r.top, right: r.right, bottom: r.bottom },
      });
    });
    toolbar.appendChild(menuBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'urd-edit-delete';
    deleteBtn.textContent = '×';
    deleteBtn.title = ta('canvas.deleteBlock');
    deleteBtn.addEventListener('click', () => {
      post({ type: 'urd-delete', sectionId: section.id, blockId: block.id });
      // Without deselecting, a phantom selection of the deleted block would survive in the module state.
      selectBlock(null);
    });
    toolbar.appendChild(deleteBtn);
  }
  el.appendChild(toolbar);

  const resizeHandle = document.createElement('div');
  resizeHandle.className = 'urd-edit-resize';
  resizeHandle.title = ta('canvas.dragResize');
  el.appendChild(resizeHandle);

  // Pinning is otherwise invisible until you scroll: a pin in the corner
  // shows that the block has "Pin on scroll" enabled. On mobile only
  // screen docking applies, so the pin follows that boundary.
  if (block.sticky && (!mobile || block.sticky.mode === 'screen')) {
    const PIN_SVG = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 17v5"/><path d="M9 3h6l-1 6 3 3v2H7v-2l3-3z"/></svg>';
    const pin = document.createElement('div');
    pin.className = 'urd-sticky-badge';
    pin.innerHTML = PIN_SVG;
    pin.title = ta('lbl.sticky');
    el.appendChild(pin);
  }

  wireDrag(moveHandle, 'move');
  wireDrag(resizeHandle, 'resize');
  // The whole block surface can also be dragged directly (⠿ remains). A
  // threshold keeps clicks as clicks; editable text and handles are
  // exempt.
  wireDrag(el, 'move', { surface: true });
  // Links/images must never start the browser's own drag behavior.
  el.addEventListener('dragstart', (event) => event.preventDefault());

  // Rotation handle (desktop only: rot lives in the desktop frame).
  // Dragged around the block's center; snaps to 15° steps, Shift gives a
  // free angle.
  if (!mobile) {
    const rotHandle = document.createElement('div');
    rotHandle.className = 'urd-edit-rotate';
    rotHandle.textContent = '⟳';
    rotHandle.title = ta('canvas.dragRotate');
    el.appendChild(rotHandle);

    rotHandle.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      event.stopPropagation();
      markActiveVisual(host);
      selectBlock(el, { keepMulti: multiIds.has(block.id) });
      rotHandle.setPointerCapture(event.pointerId);
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angleAt = (ev) => (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI;
      const startAngle = angleAt(event);
      const orig = block.frames.desktop.rot ?? 0;
      let rot = orig;

      const onMove = (ev) => {
        rot = orig + (angleAt(ev) - startAngle);
        rot = ev.shiftKey ? Math.round(rot) : Math.round(rot / 15) * 15;
        if (rot > 180) rot -= 360;
        if (rot < -180) rot += 360;
        el.style.transform = rot ? `rotate(${rot}deg)` : '';
      };
      const onUp = () => {
        rotHandle.removeEventListener('pointermove', onMove);
        rotHandle.removeEventListener('pointerup', onUp);
        if (rot === orig) return;
        const frame = { ...block.frames.desktop, rot };
        block.frames.desktop = frame;
        post({ type: 'urd-move', sectionId: section.id, blockId: block.id, frame, frameKey: 'desktop' });
      };
      rotHandle.addEventListener('pointermove', onMove);
      rotHandle.addEventListener('pointerup', onUp);
    });
  }

  /**
   * Mobile drag: pins ONE block to the row grid (ADR-0019). During the
   * drag the element is positioned absolutely in the flow surface, so the
   * rest of the grid reflows around it and shows the layout the block is
   * being pinned into. On release the placement is converted to row
   * tracks via the actual track heights (grown tracks are taller than
   * MOBILE_ROW), the DOM is converted in place and the editor records it
   * via urd-move with frameKey 'mobile'.
   */
  function mobileDrag(handle, event, kind, opts = {}) {
    const canvas = canvasOf(host);
    const flowEl = canvas.querySelector(':scope > .urd-flow');
    if (!flowEl) return;
    const flowRect = flowEl.getBoundingClientRect();
    const padTop = parseFloat(getComputedStyle(flowEl).paddingTop) || 0;
    const startRect = el.getBoundingClientRect();

    const start = { x: event.clientX, y: event.clientY };
    const orig = {
      left: startRect.left - flowRect.left,
      top: startRect.top - flowRect.top,
      w: startRect.width,
      h: startRect.height,
    };
    let current = { ...orig };
    // A surface drag only starts after a small threshold, so clicks remain clicks.
    const threshold = opts.surface ? 4 : 0;
    let started = false;

    const begin = () => {
      started = true;
      // Out of the grid and into free positioning; the grid reflows.
      el.style.position = 'absolute';
      el.style.left = `${orig.left}px`;
      el.style.top = `${orig.top}px`;
      el.style.width = `${orig.w}px`;
      if (kind === 'resize') el.style.height = `${orig.h}px`;
      el.style.marginLeft = '0';
      el.style.zIndex = '100001';
    };
    if (threshold === 0) begin();

    const onMove = (ev) => {
      if (!started) {
        if (Math.abs(ev.clientX - start.x) + Math.abs(ev.clientY - start.y) < threshold) return;
        begin();
      }
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      if (kind === 'move') {
        current = {
          ...orig,
          left: clamp(orig.left + dx, 0, Math.max(0, canvas.clientWidth - orig.w)),
          top: Math.max(0, orig.top + dy),
        };
        el.style.left = `${current.left}px`;
        el.style.top = `${current.top}px`;
      } else {
        current = {
          ...orig,
          w: clamp(orig.w + dx, 24, canvas.clientWidth - orig.left),
          h: Math.max(MOBILE_ROW, orig.h + dy),
        };
        el.style.width = `${current.w}px`;
        el.style.height = `${current.h}px`;
      }
    };

    const finish = () => {
      handle.removeEventListener('pointermove', onMove);
      handle.removeEventListener('pointerup', onUp);
      handle.removeEventListener('pointercancel', finish);
    };

    const onUp = () => {
      finish();
      if (!started) return;

      // The row index is read against the track heights WITHOUT the block
      // (it is absolutely positioned now), which is exactly the grid it is
      // being pinned into.
      const tracks = getComputedStyle(flowEl).gridTemplateRows
        .split(' ').map(parseFloat).filter(Number.isFinite);
      const rect = el.getBoundingClientRect();
      const r2 = (v) => Math.round(v * 100) / 100;
      const wPct = r2((rect.width / canvas.clientWidth) * 100);
      const old = block.frames.mobile;
      const placement = {
        x: clamp(r2((current.left / canvas.clientWidth) * 100), 0, r2(100 - wPct)),
        w: wPct,
        row: rowAtOffset(tracks, current.top - padTop),
        rows: Math.max(1, Math.round(rect.height / MOBILE_ROW)),
      };
      if (Number.isFinite(old?.z)) placement.z = old.z;
      if (old?.rot) placement.rot = old.rot;
      block.frames.mobile = placement;

      // Convert the DOM back into the grid with the new placement.
      el.style.position = '';
      el.style.left = '';
      el.style.top = '';
      el.style.width = '';
      el.style.height = '';
      el.style.marginLeft = '';
      el.style.zIndex = '';
      el.classList.remove('urd-block-flow');
      el.classList.add('urd-block-pinned');
      const def = window.Urd.blocks.get(block.type);
      const autoGrow = block.type === 'text' || Boolean(def?.autoGrow);
      Object.assign(el.style, mobilePlacementToCss(placement, block.frames.desktop, { autoGrow }));

      post({ type: 'urd-move', sectionId: section.id, blockId: block.id, frame: placement, frameKey: 'mobile' });
    };

    handle.addEventListener('pointermove', onMove);
    handle.addEventListener('pointerup', onUp);
    handle.addEventListener('pointercancel', finish);
  }

  /**
   * Shared drag logic for moving and resizing. Pixels are translated to
   * grid units and rounded continuously, so the block snaps visibly while
   * dragging. On release the new frame is reported to the editor.
   */
  function wireDrag(handle, kind, opts = {}) {
    handle.addEventListener('pointerdown', (event) => {
      if (opts.surface) {
        const target = event.target instanceof HTMLElement ? event.target : null;
        // Editable text is only exempt when the block is ALREADY selected
        // (then the text is being edited). An unselected block drags
        // freely from the text too - a click without a drag selects it,
        // another click edits.
        if (target?.closest('.urd-text[contenteditable="true"]') && selectedBlockId === block.id && multiIds.size <= 1) return;
        // The cart button follows the text block's two-step model: selected
        // block = native click (the drawer opens), unselected block =
        // surface drag and selection.
        if (target?.closest('.urd-cart-button') && selectedBlockId === block.id && multiIds.size <= 1) return;
        // The plugin config panels are guarded by class name, the old
        // reference plugin names included: plugin copies in user repos
        // keep them forever (see the compatibility surface in SCHEMA.md).
        if (target?.closest('.urd-edit-toolbar, .urd-edit-resize, .urd-edit-rotate, button:not(.urd-cart-button), input, select, textarea, dialog, .urd-collection-editable, .urd-collection-image-edit, .urd-faq-q, .urd-cal-config, .urd-form-config, .urd-kal-config, .urd-skjema-config, .urd-kart-config')) return;
        // Flowing mobile block: the first pinning must be a deliberate
        // choice (dragging ⠿), not a click on the block. A screen-docked
        // block is exempt: there the drag moves the docking, not the row
        // grid.
        if (mobile && !Number.isFinite(block.frames.mobile?.row) && !el.classList.contains('urd-sticky-fixed')) return;
        event.preventDefault();
      } else {
        event.preventDefault();
        event.stopPropagation();
        markActiveVisual(host);
        // Grabbing ⠿/resize on a set member must not collapse the set.
        selectBlock(el, { keepMulti: multiIds.has(block.id) });
      }
      handle.setPointerCapture(event.pointerId);

      // Screen-docked block: the drag moves the DOCKING, not the frame.
      // The block follows the pointer as fixed, and on release the
      // nearest of the nine anchor points is chosen from where it lands
      // (nearestDock). A regular drag would release the pinning
      // (suspendSticky) and teleport the block back to the section the
      // moment the grab started.
      if (kind === 'move' && el.classList.contains('urd-sticky-fixed') && el.dataset.stickyMode === 'screen') {
        const threshold = opts.surface ? 4 : 0;
        let started = threshold === 0;
        let holds = false;
        const hold = () => { if (!holds) { holds = true; suspendSticky({ keep: el }); } };
        const drop = () => { if (holds) { holds = false; resumeSticky(); } };
        if (started) hold();
        const start = { x: event.clientX, y: event.clientY };
        const orig = { left: parseFloat(el.style.left) || 0, top: parseFloat(el.style.top) || 0 };
        const onDockMove = (ev) => {
          if (!started) {
            if (Math.abs(ev.clientX - start.x) + Math.abs(ev.clientY - start.y) < threshold) return;
            started = true;
            hold();
          }
          el.style.left = `${orig.left + (ev.clientX - start.x)}px`;
          el.style.top = `${orig.top + (ev.clientY - start.y)}px`;
        };
        const finishDock = (commit) => {
          handle.removeEventListener('pointermove', onDockMove);
          handle.removeEventListener('pointerup', onDockUp);
          handle.removeEventListener('pointercancel', onDockCancel);
          if (commit && started) {
            const rect = el.getBoundingClientRect();
            const dock = nearestDock(
              { left: rect.left, top: rect.top, w: rect.width, h: rect.height },
              { w: document.documentElement.clientWidth, h: window.innerHeight },
            );
            // The dock group comes along: applySticky reads the leader's
            // dock, and published data must say the same for every member.
            const groupId = el.dataset.stickyGroup;
            const members = groupId
              ? [...document.querySelectorAll(`.urd-sticky-able[data-sticky-group="${CSS.escape(groupId)}"]`)]
              : [el];
            for (const m of members) {
              if (m.dataset.stickyDock === dock) continue;
              m.dataset.stickyDock = dock;
              const sid = m.closest('.urd-section')?.dataset.sectionId;
              if (sid && m.dataset.blockId) {
                post({ type: 'urd-sticky-dock', sectionId: sid, blockId: m.dataset.blockId, dock });
              }
            }
            if (block.sticky) block.sticky = { ...block.sticky, dock };
          }
          // Resume last: then the group docks against the new point.
          drop();
        };
        const onDockUp = () => finishDock(true);
        const onDockCancel = () => finishDock(false);
        handle.addEventListener('pointermove', onDockMove);
        handle.addEventListener('pointerup', onDockUp);
        handle.addEventListener('pointercancel', onDockCancel);
        return;
      }

      // Mobile has its own drag mechanics: the drag pins ONE block to the
      // row grid, the rest keep flowing (ADR-0019).
      if (mobile) {
        mobileDrag(handle, event, kind, opts);
        return;
      }
      const frameKey = 'desktop';

      // A surface drag only starts after a small threshold, so clicks
      // (selection, caret) remain clicks.
      const threshold = opts.surface ? 4 : 0;
      let started = threshold === 0;
      // Pinned blocks are released back to their real place before the
      // drag writes geometry. A pure click (threshold not passed)
      // suspends nothing. The pair must be exact: an unmatched resume
      // would cut short the suspension of another drag in progress.
      let holdsSticky = false;
      const holdSticky = () => { if (!holdsSticky) { holdsSticky = true; suspendSticky(); } };
      const dropSticky = () => { if (holdsSticky) { holdsSticky = false; resumeSticky(); } };
      if (started) holdSticky();

      const start = { x: event.clientX, y: event.clientY };
      const orig = { ...(block.frames[frameKey] ?? block.frames.desktop) };
      // Group drag: if the block is part of a multi-selection, the rest
      // follow (same delta, clamped so the whole group stays within the
      // width).
      const canvas = canvasOf(host);
      const groupParts = (kind === 'move' && multiIds.size > 1 && multiIds.has(block.id))
        ? [...canvas.querySelectorAll(':scope > .urd-block')]
            .filter((o) => o !== el && multiIds.has(o.dataset.blockId))
            .map((o) => {
              const b = section.blocks.find((x) => x.id === o.dataset.blockId);
              return b ? { el: o, block: b, orig: { ...b.frames.desktop } } : null;
            })
            .filter(Boolean)
        : [];
      const groupKey = groupParts.length ? makeId('mdrag') : null;
      // Frames are physical (x/w in %, y/h in px); the grid controls ONLY
      // what we snap against: square cells of grid.size px. Snapping off
      // gives free placement (0.1% / 1 px precision).
      const pctPerPx = 100 / canvas.clientWidth;
      const colStep = grid.size * pctPerPx;
      const r2 = (v) => Math.round(v * 100) / 100;
      const overlay = showGridOverlay(host, grid);
      let current = orig;

      // Smart guides (Wix-style): neighboring blocks' edges/centers + the
      // content surface's midline as snap lines. The targets are
      // collected at drag start.
      const GUIDE_TOL = 5;
      const xTargets = [canvas.clientWidth / 2];
      const yTargets = [];
      for (const other of canvas.querySelectorAll(':scope > .urd-block')) {
        if (other === el) continue;
        const left = other.offsetLeft;
        const top = other.offsetTop;
        xTargets.push(left, left + other.offsetWidth / 2, left + other.offsetWidth);
        yTargets.push(top, top + other.offsetHeight / 2, top + other.offsetHeight);
      }
      const guideEls = [];
      const clearGuides = () => {
        for (const g of guideEls) g.remove();
        guideEls.length = 0;
      };
      const drawGuide = (axis, px) => {
        const g = document.createElement('div');
        g.className = `urd-smart-guide urd-smart-guide-${axis}`;
        if (axis === 'v') g.style.left = `${px}px`;
        else g.style.top = `${px}px`;
        canvas.appendChild(g);
        guideEls.push(g);
      };
      /** Adjusts current toward the nearest snap line and draws it. */
      const applyGuides = () => {
        clearGuides();
        if (kind !== 'move') return;
        const wPx = (current.w / 100) * canvas.clientWidth;
        let leftPx = (current.x / 100) * canvas.clientWidth;
        let best = null;
        for (const t of xTargets) {
          for (const edge of [0, wPx / 2, wPx]) {
            const d = t - (leftPx + edge);
            if (Math.abs(d) <= GUIDE_TOL && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, line: t };
          }
        }
        if (best) {
          leftPx += best.d;
          current = { ...current, x: clamp(r2((leftPx * 100) / canvas.clientWidth), 0, r2(100 - current.w)) };
          drawGuide('v', best.line);
        }
        best = null;
        for (const t of yTargets) {
          for (const edge of [0, current.h / 2, current.h]) {
            const d = t - (current.y + edge);
            if (Math.abs(d) <= GUIDE_TOL && (!best || Math.abs(d) < Math.abs(best.d))) best = { d, line: t };
          }
        }
        if (best) {
          current = { ...current, y: current.y + best.d };
          drawGuide('h', best.line);
        }
      };

      const onMove = (ev) => {
        if (!started) {
          if (Math.abs(ev.clientX - start.x) + Math.abs(ev.clientY - start.y) < threshold) return;
          started = true;
          holdSticky();
        }
        // Shift held = temporary free placement (0.1% / 1 px); otherwise
        // grid.snap decides.
        const free = grid.snap === false || ev.shiftKey;
        const snapPct = free ? (v) => Math.round(v * 10) / 10 : (v) => r2(Math.round(v / colStep) * colStep);
        const snapPx = free ? Math.round : (v) => Math.round(v / grid.size) * grid.size;
        const dx = (ev.clientX - start.x) * pctPerPx;
        const dy = ev.clientY - start.y;
        current = kind === 'move'
          ? {
              ...orig,
              x: clamp(snapPct(orig.x + dx), 0, r2(100 - orig.w)),
              // y is unbounded in both directions: blocks can deliberately
              // hang above the section top, just as below the bottom.
              y: snapPx(orig.y + dy),
            }
          : {
              ...orig,
              w: clamp(snapPct(orig.w + dx), r2(colStep), r2(100 - orig.x)),
              h: Math.max(4, snapPx(orig.h + dy)),
            };
        // Shift = fully free: then smart guides are skipped too.
        if (!free) applyGuides();
        else clearGuides();
        if (groupParts.length) {
          // The delta is clamped against the group's combined width
          // limits; y is unbounded as in a single drag (blocks may hang
          // outside).
          const d = groupDelta([orig, ...groupParts.map((g) => g.orig)], current.x - orig.x, 0);
          const dyPx = current.y - orig.y;
          current = { ...current, x: r2(orig.x + d.dx) };
          for (const g of groupParts) {
            Object.assign(g.el.style, frameToCss({ ...g.orig, x: r2(g.orig.x + d.dx), y: g.orig.y + dyPx }));
          }
          updateMultiToolbar();
        }
        Object.assign(el.style, frameToCss(current));
      };

      // Aborted drag (the browser takes over the pointer, or the element
      // is swapped out mid-drag): clean up and release the pinning,
      // otherwise it would stay suspended for the rest of the session.
      const onCancel = () => {
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onCancel);
        overlay.remove();
        clearGuides();
        dropSticky();
      };

      const onUp = () => {
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', onUp);
        handle.removeEventListener('pointercancel', onCancel);
        overlay.remove();
        clearGuides();
        // Re-pins from the block's NEW base values.
        dropSticky();
        if (!started) return;

        // Group drag: record the whole set as ONE undo step (shared
        // groupKey) and skip section transfer (the set lives in one
        // section).
        if (groupParts.length) {
          if (current.x === orig.x && current.y === orig.y) return;
          const dx = r2(current.x - orig.x);
          const dyPx = current.y - orig.y;
          block.frames.desktop = current;
          post({ type: 'urd-move', sectionId: section.id, blockId: block.id, frame: current, frameKey: 'desktop', coalesce: true, groupKey });
          for (const g of groupParts) {
            const frame = { ...g.orig, x: r2(g.orig.x + dx), y: g.orig.y + dyPx };
            g.block.frames.desktop = frame;
            post({ type: 'urd-move', sectionId: section.id, blockId: g.block.id, frame, frameKey: 'desktop', coalesce: true, groupKey });
          }
          return;
        }

        // If the block's CENTER is released over another section, the
        // block moves there - grid and ownership must follow the section
        // it actually sits in, not the one it came from.
        if (kind === 'move') {
          const rect = el.getBoundingClientRect();
          const target = document
            .elementsFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
            .find((n) => n instanceof HTMLElement && n.classList.contains('urd-section'));
          if (target && target.dataset.sectionId !== section.id) {
            const tRect = target.getBoundingClientRect();
            const frame = { ...current, y: Math.round(rect.top - tRect.top) };
            post({
              type: 'urd-move-block-section',
              fromSectionId: section.id,
              toSectionId: target.dataset.sectionId,
              blockId: block.id,
              frame,
            });
            return;
          }
        }

        if (current.x !== orig.x || current.y !== orig.y || current.w !== orig.w || current.h !== orig.h) {
          block.frames[frameKey] = current;
          post({ type: 'urd-move', sectionId: section.id, blockId: block.id, frame: current, frameKey });
        }
      };

      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', onUp);
      handle.addEventListener('pointercancel', onCancel);
    });
  }
}
