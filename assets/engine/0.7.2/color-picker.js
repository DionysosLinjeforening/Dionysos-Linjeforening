/**
 * Shared color picker for the canvas (the preview layer; visitors never load it).
 * Used by the text toolbar (text color/highlight) and future surfaces; the admin
 * panels have their Svelte twin with the same look and shared «Recent»/«Saved»
 * stores.
 *
 * openColorPicker(anchor, { value, onpick }) → a floating card with an HSV area,
 * hue slider, alpha slider, hex and RGB fields, theme color dots, saved and
 * recent colors and an eyedropper (the EyeDropper API where it exists).
 * onpick(color) is called live on every pick; color is #rrggbb, or #rrggbbaa
 * when transparency is selected.
 */
// Loaded only through the preview layer (statically from preview-edit.js),
// always after the admin dictionary is loaded: ta() is safe even at module
// level here.
import { ta } from './i18n.js';

let panel = null;
let teardown = null;

const RECENT_KEY = 'urd-recent-colors';
const SAVED_KEY = 'urd-saved-colors';
const THEME_TOKENS = [['text', ta('lbl.textColor')], ['accent', ta('setup.accentPick')], ['bg', ta('lbl.background')], ['surface', ta('color.surface')]];

export function closeColorPicker() {
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

const hexToRgb = (hex) => {
  const m = /^#?([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(String(hex).trim());
  if (!m) return null;
  const n = parseInt(m[1], 16);
  const alpha = m[2] ? parseInt(m[2], 16) / 255 : 1;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255, alpha];
};

const rgbToHex = (r, g, b) => '#' + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, '0')).join('');

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let hue = 0;
  if (d) {
    if (max === r) hue = ((g - b) / d) % 6;
    else if (max === g) hue = (b - r) / d + 2;
    else hue = (r - g) / d + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }
  return [hue, max ? d / max : 0, max];
}

function hsvToRgb(hue, sat, val) {
  const c = val * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = val - c;
  const [r, g, b] = hue < 60 ? [c, x, 0] : hue < 120 ? [x, c, 0]
    : hue < 180 ? [0, c, x] : hue < 240 ? [0, x, c]
    : hue < 300 ? [x, 0, c] : [c, 0, x];
  return [(r + m) * 255, (g + m) * 255, (b + m) * 255];
}

const readStore = (key) => {
  try {
    const parsed = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function openColorPicker(anchor, { value = '#ffffff', onpick } = {}) {
  closeColorPicker();

  const parsed = hexToRgb(value) ?? [255, 255, 255, 1];
  let [h, s, v] = rgbToHsv(parsed[0], parsed[1], parsed[2]);
  let a = parsed[3];
  let lastPicked = null;

  panel = el2('div', 'urd-cp');

  const head = el2('div', 'urd-cp-head');
  head.appendChild(el2('strong', null, ta('lbl.color')));
  const close = el2('button', 'urd-cp-close', '×');
  close.type = 'button';
  close.title = ta('ui.close');
  head.appendChild(close);
  panel.appendChild(head);

  const area = el2('div', 'urd-cp-area');
  const cursor = el2('div', 'urd-cp-cursor');
  area.appendChild(cursor);
  const hue = document.createElement('input');
  hue.type = 'range';
  hue.min = '0';
  hue.max = '360';
  hue.step = '1';
  hue.className = 'urd-cp-hue';

  // Transparency: checkerboard track with a gradient towards the current color.
  const alpha = document.createElement('input');
  alpha.type = 'range';
  alpha.min = '0';
  alpha.max = '100';
  alpha.step = '1';
  alpha.className = 'urd-cp-alpha';
  alpha.title = ta('cp.alpha');

  const fields = el2('div', 'urd-cp-fields');
  const hexInput = document.createElement('input');
  hexInput.className = 'urd-cp-hex';
  hexInput.spellcheck = false;
  const rgbInputs = ['R', 'G', 'B'].map((label) => {
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = '255';
    input.title = label;
    return input;
  });

  const solidHex = () => rgbToHex(...hsvToRgb(h, s, v));
  const currentColor = () => {
    const hex = solidHex();
    return a >= 0.995 ? hex : hex + Math.round(a * 255).toString(16).padStart(2, '0');
  };

  const paint = () => {
    area.style.backgroundColor = `hsl(${h}, 100%, 50%)`;
    cursor.style.left = `${s * 100}%`;
    cursor.style.top = `${(1 - v) * 100}%`;
    hue.value = String(h);
    alpha.value = String(Math.round(a * 100));
    const hex = solidHex();
    alpha.style.background = `linear-gradient(to right, transparent, ${hex}), `
      + 'repeating-conic-gradient(rgb(255 255 255 / 35%) 0 25%, rgb(0 0 0 / 35%) 0 50%) 0 0 / 10px 10px';
    hexInput.value = currentColor();
    const rgb = hexToRgb(hex);
    rgbInputs.forEach((input, i) => { input.value = String(rgb[i]); });
  };

  const commit = () => {
    const color = currentColor();
    lastPicked = color;
    onpick?.(color);
    paint();
  };

  const setFromHex = (hex) => {
    const rgb = hexToRgb(hex);
    if (!rgb) return false;
    [h, s, v] = rgbToHsv(rgb[0], rgb[1], rgb[2]);
    a = rgb[3];
    return true;
  };

  area.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    area.setPointerCapture(event.pointerId);
    const apply = (ev) => {
      const r = area.getBoundingClientRect();
      s = Math.min(1, Math.max(0, (ev.clientX - r.left) / r.width));
      v = 1 - Math.min(1, Math.max(0, (ev.clientY - r.top) / r.height));
      commit();
    };
    apply(event);
    const move = (ev) => apply(ev);
    const up = () => {
      area.removeEventListener('pointermove', move);
      area.removeEventListener('pointerup', up);
    };
    area.addEventListener('pointermove', move);
    area.addEventListener('pointerup', up);
  });
  hue.addEventListener('input', () => { h = Number(hue.value); commit(); });
  alpha.addEventListener('input', () => { a = Number(alpha.value) / 100; commit(); });
  hexInput.addEventListener('change', () => { if (setFromHex(hexInput.value)) commit(); else paint(); });
  for (const input of rgbInputs) {
    input.addEventListener('change', () => {
      const [r, g, b] = rgbInputs.map((x) => Math.min(255, Math.max(0, Number(x.value) || 0)));
      [h, s, v] = rgbToHsv(r, g, b);
      commit();
    });
  }

  fields.appendChild(hexInput);
  for (const input of rgbInputs) fields.appendChild(input);

  // Eyedropper: pick a color from anywhere on screen (where the API exists).
  if (window.EyeDropper) {
    const eye = el2('button', 'urd-cp-eye');
    eye.type = 'button';
    eye.title = ta('cp.eyedropper');
    eye.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2l4 4-3 3-4-4 3-3z"/><path d="M15 5L4 16l-1 5 5-1L19 9"/></svg>';
    eye.addEventListener('click', async () => {
      try {
        const result = await new window.EyeDropper().open();
        if (setFromHex(result.sRGBHex)) commit();
      } catch { /* a cancelled eyedropper is perfectly fine */ }
    });
    fields.appendChild(eye);
  }

  panel.append(area, hue, alpha, fields);

  const swatch = (hex, onclickExtra) => {
    const dot = el2('button', 'urd-cp-token');
    dot.type = 'button';
    dot.title = hex;
    dot.style.background = hex;
    dot.addEventListener('click', () => {
      if (setFromHex(hex)) commit();
      onclickExtra?.();
    });
    return dot;
  };

  // The theme colors: read live from the CSS variables, so they always follow the current theme.
  const tokens = el2('div', 'urd-cp-tokens');
  const rootStyle = getComputedStyle(document.documentElement);
  for (const [token, name] of THEME_TOKENS) {
    const hex = rootStyle.getPropertyValue(`--urd-color-${token}`).trim();
    if (!hex) continue;
    const dot = swatch(hex);
    dot.title = ta('cp.tokenTitleShort', { name });
    tokens.appendChild(dot);
  }
  if (tokens.children.length) {
    panel.appendChild(el2('div', 'urd-cp-label', ta('cp.themeColors')));
    panel.appendChild(tokens);
  }

  // Saved: the owner's fixed palette, a store shared with the admin color picker.
  // The plus button saves the current color; the × on a dot removes it.
  let saved = readStore(SAVED_KEY);
  const savedLabel = el2('div', 'urd-cp-label urd-cp-label-row');
  savedLabel.appendChild(el2('span', null, ta('cp.saved')));
  const addSaved = el2('button', 'urd-cp-add', '+');
  addSaved.type = 'button';
  addSaved.title = ta('cp.saveTitle');
  savedLabel.appendChild(addSaved);
  const savedRow = el2('div', 'urd-cp-tokens');
  const renderSaved = () => {
    savedRow.replaceChildren();
    for (const hex of saved.slice(0, 12)) {
      const wrap = el2('span', 'urd-cp-saved');
      wrap.appendChild(swatch(hex));
      const del = el2('button', 'urd-cp-del', '×');
      del.type = 'button';
      del.title = ta('cp.removeSaved');
      del.addEventListener('click', () => {
        saved = saved.filter((c) => c !== hex);
        localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
        renderSaved();
      });
      wrap.appendChild(del);
      savedRow.appendChild(wrap);
    }
  };
  addSaved.addEventListener('click', () => {
    const color = currentColor();
    if (saved.includes(color)) return;
    saved = [color, ...saved].slice(0, 12);
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    renderSaved();
  });
  renderSaved();
  panel.append(savedLabel, savedRow);

  // Recent: a store shared with the admin color picker.
  const recent = readStore(RECENT_KEY);
  if (recent.length) {
    panel.appendChild(el2('div', 'urd-cp-label', ta('common.recent')));
    const row = el2('div', 'urd-cp-tokens');
    for (const hex of recent.slice(0, 8)) row.appendChild(swatch(hex));
    panel.appendChild(row);
  }

  document.body.appendChild(panel);
  paint();

  // Placement: PREFERABLY above the anchor (the text toolbar sits above the text,
  // so the picker must not cover what is being edited), otherwise below, clamped
  // inside the viewport.
  const rect = anchor.getBoundingClientRect();
  const W = 236;
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - W - 8));
  const above = rect.top - panel.offsetHeight - 8;
  panel.style.left = `${left}px`;
  panel.style.top = `${above >= 8 ? above : Math.min(rect.bottom + 8, window.innerHeight - panel.offsetHeight - 8)}px`;

  const saveRecent = () => {
    if (!lastPicked) return;
    const next = [lastPicked, ...readStore(RECENT_KEY).filter((c) => c !== lastPicked)].slice(0, 8);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  };
  const dismiss = () => {
    saveRecent();
    closeColorPicker();
  };
  close.addEventListener('click', dismiss);
  const onDown = (event) => {
    if (!panel.contains(event.target)) dismiss();
  };
  const onKey = (event) => {
    if (event.key === 'Escape') dismiss();
  };
  setTimeout(() => {
    document.addEventListener('pointerdown', onDown, true);
    document.addEventListener('keydown', onKey, true);
  }, 0);
  teardown = () => {
    document.removeEventListener('pointerdown', onDown, true);
    document.removeEventListener('keydown', onKey, true);
  };
}
