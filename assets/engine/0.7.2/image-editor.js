/**
 * Shared image editor for the canvas (the preview layer; visitors never load it).
 * ONE floating panel that every editable image uses: image blocks, collection
 * entries, and future surfaces (the nav logo and others) hook in with an adapter.
 *
 * The adapter describes what the target supports and how values are read/written:
 *   { fields: ['image','remove','alt','fit','radius','href','focus','filters'],
 *     get(field), set(field, value), onDone?() }
 * set() both updates the DOM live and reports the change to the editor (which owns the draft).
 */
import { compressToWebp } from './imageTools.js';
// Loaded only through the preview layer (statically from preview-edit.js,
// dynamically from the blocks on click), always after the admin dictionary is
// loaded: ta() is safe here.
import { ta } from './i18n.js';

let panel = null;
let teardown = null;

export function closeImageEditor() {
  teardown?.();
  panel?.remove();
  panel = null;
  teardown = null;
}

const el2 = (tag, className, textContent) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (textContent != null) node.textContent = textContent;
  return node;
};

function row(labelText, control) {
  const label = el2('label', 'urd-imged-row', labelText);
  label.appendChild(control);
  return label;
}

/** Segmented choice (instead of a native select, which cannot be styled). */
function segmented(options, current, onchange) {
  const wrap = el2('div', 'urd-imged-seg');
  const buttons = [];
  for (const [value, name] of options) {
    const b = el2('button', null, name);
    b.type = 'button';
    if ((current ?? options[0][0]) === value) b.classList.add('selected');
    b.addEventListener('click', () => {
      for (const other of buttons) other.classList.remove('selected');
      b.classList.add('selected');
      onchange(value);
    });
    buttons.push(b);
    wrap.appendChild(b);
  }
  return wrap;
}

function slider(value, oninput, { min = '0', max = '2' } = {}) {
  const wrap = el2('span', 'urd-imged-slider');
  const input = document.createElement('input');
  input.type = 'range';
  input.min = min;
  input.max = max;
  input.step = '0.05';
  input.value = String(value ?? 1);
  const readout = el2('span', 'urd-imged-value', Number(value ?? 1).toFixed(2));
  input.addEventListener('input', () => {
    readout.textContent = Number(input.value).toFixed(2);
    oninput(Number(input.value));
  });
  wrap.append(input, readout);
  wrap.range = input;
  wrap.readout = readout;
  return wrap;
}

export function openImageEditor(anchor, adapter) {
  closeImageEditor();
  const has = (field) => adapter.fields.includes(field);

  panel = el2('div', 'urd-imged');

  const head = el2('div', 'urd-imged-head');
  head.appendChild(el2('strong', null, ta('blocks.image')));
  const close = el2('button', 'urd-imged-close', '×');
  close.type = 'button';
  close.title = ta('ui.close');
  close.addEventListener('click', closeImageEditor);
  head.appendChild(close);
  panel.appendChild(head);

  // Thumbnail with a draggable focus point (controls the crop framing)
  let dot = null;
  if (has('focus')) {
    const thumb = el2('div', 'urd-imged-thumb');
    const src = adapter.get('image');
    if (src) thumb.style.backgroundImage = `url("${src.replaceAll('"', '%22')}")`;
    else { thumb.classList.add('urd-imged-thumb-empty'); thumb.dataset.empty = ta('canvas.imageEditorEmpty'); }
    thumb.appendChild(el2('div', 'urd-imged-thumbgrid'));
    dot = el2('div', 'urd-imged-dot');
    dot.style.left = `${(adapter.get('x') ?? 0.5) * 100}%`;
    dot.style.top = `${(adapter.get('y') ?? 0.5) * 100}%`;
    thumb.appendChild(dot);
    thumb.title = ta('imged.focusTip');
    thumb.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      thumb.setPointerCapture(event.pointerId);
      const apply = (ev) => {
        const r = thumb.getBoundingClientRect();
        const x = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
        const y = Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height));
        dot.style.left = `${x * 100}%`;
        dot.style.top = `${y * 100}%`;
        adapter.set('x', Math.round(x * 100) / 100);
        adapter.set('y', Math.round(y * 100) / 100);
      };
      apply(event);
      const move = (ev) => apply(ev);
      const up = () => {
        thumb.removeEventListener('pointermove', move);
        thumb.removeEventListener('pointerup', up);
      };
      thumb.addEventListener('pointermove', move);
      thumb.addEventListener('pointerup', up);
    });
    panel.appendChild(thumb);
    panel.appendChild(el2('div', 'urd-imged-hint',
      ta('imged.focusHint')));
  }

  // Zoom: crops in towards the focus point (the frame clips the rest).
  if (has('zoom')) {
    panel.appendChild(row(ta('lbl.zoom'), slider(adapter.get('zoom'), (v) => adapter.set('zoom', v), { min: '1', max: '3' })));
  }

  // Change/remove
  const actions = el2('div', 'urd-imged-actions');
  const pick = el2('button', 'urd-imged-btn', adapter.get('image') ? ta('ui.changeImage') : ta('ui.chooseImage'));
  pick.type = 'button';
  pick.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      const img = await compressToWebp(file);
      adapter.set('image', img.dataUrl);
      adapter.onDone?.();
      closeImageEditor();
    });
    input.click();
  });
  actions.appendChild(pick);
  if (has('remove') && adapter.get('image')) {
    const remove = el2('button', 'urd-imged-btn urd-imged-danger', ta('ui.remove'));
    remove.type = 'button';
    remove.addEventListener('click', () => {
      adapter.set('image', '');
      adapter.onDone?.();
      closeImageEditor();
    });
    actions.appendChild(remove);
  }
  panel.appendChild(actions);

  // Adjustments (non-destructive CSS filters) with value readout, a grayscale shortcut and a reset.
  if (has('filters')) {
    const sliders = {
      brightness: slider(adapter.get('brightness'), (v) => applyFilter('brightness', v)),
      contrast: slider(adapter.get('contrast'), (v) => applyFilter('contrast', v)),
      saturate: slider(adapter.get('saturate'), (v) => applyFilter('saturate', v)),
    };
    const thumbFilter = () => {
      const thumbEl = panel.querySelector('.urd-imged-thumb');
      if (!thumbEl) return;
      thumbEl.style.filter = ['brightness', 'contrast', 'saturate']
        .map((f) => `${f}(${Number(sliders[f].range.value)})`).join(' ');
    };
    const applyFilter = (field, value) => {
      adapter.set(field, value);
      thumbFilter();
    };
    panel.appendChild(row(ta('lbl.brightness'), sliders.brightness));
    panel.appendChild(row(ta('lbl.contrast'), sliders.contrast));
    panel.appendChild(row(ta('lbl.saturate'), sliders.saturate));
    thumbFilter();

    const filterActions = el2('div', 'urd-imged-actions');
    const gray = el2('button', 'urd-imged-btn', ta('ie.grayscale'));
    gray.type = 'button';
    gray.title = ta('imged.grayTitle');
    gray.addEventListener('click', () => {
      sliders.saturate.range.value = '0';
      sliders.saturate.readout.textContent = '0.00';
      applyFilter('saturate', 0);
    });
    const reset = el2('button', 'urd-imged-btn', ta('ui.resetAdjust'));
    reset.type = 'button';
    reset.addEventListener('click', () => {
      for (const [field, s] of Object.entries(sliders)) {
        s.range.value = '1';
        s.readout.textContent = '1.00';
        adapter.set(field, 1);
      }
      thumbFilter();
    });
    filterActions.append(gray, reset);
    panel.appendChild(filterActions);
  }

  if (has('fit')) {
    panel.appendChild(row(ta('lbl.fit'), segmented(
      [['cover', ta('imged.fitCover')], ['contain', ta('imged.fitContain')]],
      adapter.get('fit') ?? 'cover',
      (value) => adapter.set('fit', value),
    )));
  }

  if (has('shape')) {
    panel.appendChild(row(ta('blocks.shape'), segmented(
      [['', ta('opt.auto')], ['wide', ta('imged.wide')], ['square', '1:1'], ['portrait', ta('imged.tall')], ['circle', ta('imged.round')]],
      adapter.get('shape') ?? '',
      (value) => adapter.set('shape', value || null),
    )));
  }

  if (has('radius')) {
    panel.appendChild(row(ta('lbl.radius'), segmented(
      [['', ta('common.none')], ['sm', ta('opt.size.sm')], ['md', ta('opt.radius.md')]],
      adapter.get('radius') ?? '',
      (value) => adapter.set('radius', value || null),
    )));
  }

  if (has('alt')) {
    const input = document.createElement('input');
    input.value = adapter.get('alt') ?? '';
    input.placeholder = ta('ph.altText');
    input.addEventListener('change', () => adapter.set('alt', input.value));
    panel.appendChild(row(ta('lbl.description'), input));
  }

  if (has('href')) {
    const input = document.createElement('input');
    input.value = adapter.get('href') ?? '';
    input.placeholder = ta('ph.optionalImageLink');
    input.addEventListener('change', () => adapter.set('href', input.value || null));
    panel.appendChild(row(ta('lbl.link'), input));
  }

  // Rule-of-thirds grid over the image itself while the editor is open (as in
  // cameras): shows the center and the thirds while dragging focus, zooming and
  // picking a shape.
  let grid = null;
  let gridObserver = null;
  if (adapter.get('image') && anchor instanceof Element) {
    grid = el2('div', 'urd-imged-grid');
    document.body.appendChild(grid);
    const syncGrid = () => {
      const r = anchor.getBoundingClientRect();
      grid.style.left = `${r.left}px`;
      grid.style.top = `${r.top}px`;
      grid.style.width = `${r.width}px`;
      grid.style.height = `${r.height}px`;
      grid.style.borderRadius = getComputedStyle(anchor).borderRadius;
    };
    syncGrid();
    // Shape/zoom change the image frame live; the grid follows along.
    gridObserver = new ResizeObserver(syncGrid);
    gridObserver.observe(anchor);
  }

  document.body.appendChild(panel);

  // Placement: beside the image, clamped inside the viewport
  const rect = anchor.getBoundingClientRect();
  const W = 260;
  const left = Math.max(8, Math.min(rect.right + 12, window.innerWidth - W - 8));
  const top = Math.max(8, Math.min(rect.top, window.innerHeight - panel.offsetHeight - 8));
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;

  // Closing: click outside, Escape or scrolling outside the panel
  const onDown = (event) => {
    if (!panel.contains(event.target)) closeImageEditor();
  };
  const onKey = (event) => {
    if (event.key === 'Escape') closeImageEditor();
  };
  const onScroll = (event) => {
    if (event.target instanceof Node && !panel.contains(event.target)) closeImageEditor();
  };
  setTimeout(() => {
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey, true);
    document.addEventListener('scroll', onScroll, true);
  }, 0);
  teardown = () => {
    document.removeEventListener('pointerdown', onDown, true);
    document.removeEventListener('keydown', onKey, true);
    document.removeEventListener('scroll', onScroll, true);
    gridObserver?.disconnect();
    grid?.remove();
  };
}
