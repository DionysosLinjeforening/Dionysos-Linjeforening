/**
 * Lightbox: full screen image viewing for visitors (and in the editor's Clean
 * view). Loaded only via dynamic import on the first click, so a visitor who
 * never clicks an image never loads it.
 *
 * Built on the native <dialog> element (showModal): the top layer removes the
 * z-index war, ::backdrop gives the dark background, and focus trap, focus
 * return and an inert background come along for free. Esc closes (native),
 * the arrow keys step, a background click closes. Body scroll is locked by
 * body:has(dialog:modal) in base.css, no JS bookkeeping.
 */
import { stepIndex } from './gallery-model.js';
import { t } from './i18n.js';

let overlay = null;

/** Synchronous teardown of the current overlay (used on re-open, so a
 *  trailing close event does not tear down a freshly opened overlay). */
function hardTeardown() {
  if (!overlay) return;
  const d = overlay;
  overlay = null;
  if (d.open) d.close();
  d.remove();
}

export function closeLightbox() {
  if (overlay?.open) overlay.close(); // -> the 'close' event cleans up (native focus return)
  else hardTeardown();
}

const el2 = (tag, className, textContent) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (textContent != null) node.textContent = textContent;
  return node;
};

/** The non-destructive colour adjustments follow into the full view; the
 *  cropping (fit/focus/zoom) does not: the lightbox shows the whole image. */
function filterCss(style) {
  const filters = [];
  if (style?.brightness != null && style.brightness !== 1) filters.push(`brightness(${Number(style.brightness) || 1})`);
  if (style?.contrast != null && style.contrast !== 1) filters.push(`contrast(${Number(style.contrast) || 1})`);
  if (style?.saturate != null && style.saturate !== 1) filters.push(`saturate(${Number(style.saturate) || 1})`);
  return filters.join(' ');
}

/**
 * @param {Array<{src: string, alt?: string, style?: object}>} images
 * @param {number} [startIndex]
 */
export function openLightbox(images, startIndex = 0) {
  const list = (images ?? []).filter((img) => img?.src);
  if (!list.length) return;
  hardTeardown();

  let index = Math.min(Math.max(startIndex, 0), list.length - 1);

  const dialog = el2('dialog', 'urd-lightbox');
  overlay = dialog;
  const figure = el2('figure', 'urd-lightbox-figure');
  const image = document.createElement('img');
  image.className = 'urd-lightbox-img';
  const caption = el2('figcaption', 'urd-lightbox-caption');
  figure.append(image, caption);
  dialog.appendChild(figure);

  const show = (i) => {
    index = i;
    const entry = list[index];
    image.src = entry.src;
    image.alt = entry.alt ?? '';
    image.style.filter = filterCss(entry.style);
    caption.textContent = entry.alt ?? '';
    caption.style.display = entry.alt ? '' : 'none';
    // The neighbouring images are preloaded, so paging feels immediate.
    for (const delta of [1, -1]) {
      const probe = new Image();
      probe.src = list[stepIndex(index, delta, list.length)].src;
    }
  };

  const step = (delta) => show(stepIndex(index, delta, list.length));

  const navButton = (dir, label, delta) => {
    const btn = el2('button', `urd-lightbox-nav urd-lightbox-${dir}`);
    btn.type = 'button';
    btn.setAttribute('aria-label', label);
    btn.innerHTML = dir === 'prev'
      ? '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'
      : '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      step(delta);
    });
    return btn;
  };
  if (list.length > 1) {
    dialog.append(navButton('prev', t('lightbox.prev'), -1), navButton('next', t('lightbox.next'), 1));
  }

  const close = el2('button', 'urd-lightbox-close');
  close.type = 'button';
  close.setAttribute('aria-label', t('lightbox.close'));
  close.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 5l14 14"/><path d="M19 5L5 19"/></svg>';
  close.addEventListener('click', closeLightbox);
  dialog.appendChild(close);

  // Cleanup when the dialog closes (native Esc included): instance guarded so
  // a trailing close from an earlier overlay does not null out the new one.
  dialog.addEventListener('close', () => {
    if (overlay === dialog) overlay = null;
    dialog.remove();
  });

  // A background click closes; clicks on the image and the buttons do not.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog || event.target === figure) closeLightbox();
  });

  // The arrow keys step; Esc closes natively via the dialog's cancel handling.
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') step(1);
    else if (event.key === 'ArrowLeft') step(-1);
  });

  show(index);
  document.body.appendChild(dialog);
  dialog.showModal();
}
