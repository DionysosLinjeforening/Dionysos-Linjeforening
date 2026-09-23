/**
 * Core block: image. Shows a file from media/ (or a data URL for uploads
 * that are still unpublished in the draft). With href the image becomes a
 * link, which also covers logo use.
 *
 * The image sits in a frame (.urd-image-frame) that clips: rounding is
 * therefore ALWAYS visible (also with "show the whole image"/contain), and
 * zoom crops in towards the focal point. One shared applyImageStyle serves
 * both render AND the floating image editor, so the two can never drift apart.
 */

import { isSafeHref } from '../nav-model.js';
import { ta } from '../i18n.js';

/** Applies the non-destructive image style to the frame and the image.
 *  @param {HTMLElement} frame The frame element (.urd-image-frame) with the <img> inside */
export function applyImageStyle(frame, props) {
  const img = frame.querySelector('img');
  if (!img) return;
  const focus = `${(props.x ?? 0.5) * 100}% ${(props.y ?? 0.5) * 100}%`;
  img.alt = props.alt ?? '';
  img.style.objectFit = props.fit ?? 'cover';
  img.style.objectPosition = focus;
  // Zoom crops in towards the focal point; the frame clips the rest.
  const zoom = Number(props.zoom) || 1;
  img.style.transform = zoom !== 1 ? `scale(${zoom})` : '';
  img.style.transformOrigin = focus;
  const filters = [];
  if (props.brightness != null && props.brightness !== 1) filters.push(`brightness(${props.brightness})`);
  if (props.contrast != null && props.contrast !== 1) filters.push(`contrast(${props.contrast})`);
  if (props.saturate != null && props.saturate !== 1) filters.push(`saturate(${props.saturate})`);
  img.style.filter = filters.join(' ');
  // Rounding on the FRAME (which clips), so it shows whatever the fit is.
  frame.style.borderRadius = props.radius ? `var(--urd-radius-${props.radius})` : '';
}

export const imageBlock = {
  version: 1,
  label: 'Image',
  labelKey: 'blocks.image',
  defaults: () => ({
    src: '', alt: '', fit: 'cover', radius: 'md', href: null,
    // Additive fields: focal point (0..1), zoom (1 = none) and non-destructive
    // CSS adjustments (1 = neutral). lightbox opens the image full screen when a
    // visitor clicks it (absent = false, so old data needs no migration).
    x: 0.5, y: 0.5, zoom: 1, brightness: 1, contrast: 1, saturate: 1,
    lightbox: false,
  }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{src: string, alt: string, fit: 'cover'|'contain', radius: string|null, href: string|null}} props
   * @param {object} ctx
   */
  render(el, props, ctx) {
    // With no image: a quiet placeholder in the editor; visitors see nothing.
    if (!props.src) {
      if (ctx.preview) {
        const empty = document.createElement('div');
        empty.className = 'urd-image-empty';
        empty.textContent = ta('canvas.imageEmpty');
        el.appendChild(empty);
      }
      return;
    }
    const frame = document.createElement('span');
    frame.className = 'urd-image-frame';
    const img = document.createElement('img');
    // Content images are fetched only as they approach the viewport: that spares
    // images below the fold on heavy pages. loading/decoding are set BEFORE src,
    // or the browser may already have begun fetching. (Collection/gallery/video do the same.)
    img.loading = 'lazy';
    img.decoding = 'async';
    img.src = props.src;
    img.draggable = false;
    // Large images decode strip by strip while they load (which looks like a
    // gradual wipe from the top): keep the image invisible until it is
    // COMPLETE, then show it whole at once. Cached images are untouched.
    if (!img.complete) {
      img.style.visibility = 'hidden';
      img.addEventListener('load', () => { img.style.visibility = ''; }, { once: true });
      img.addEventListener('error', () => { img.style.visibility = ''; }, { once: true });
    }
    frame.appendChild(img);
    applyImageStyle(frame, props);

    // Shared guard (nav/footer plus internal paths/anchors): an unsafe href is treated as if the link were not there.
    const safeHref = props.href && isSafeHref(props.href) ? props.href : null;
    if (safeHref && !ctx.preview) {
      const a = document.createElement('a');
      a.href = safeHref;
      a.appendChild(frame);
      el.appendChild(a);
    } else {
      el.appendChild(frame);
    }

    // Full screen on click: always for visitors when the field is on; in preview
    // only in clean view (otherwise editing owns the click). A link wins.
    if (props.lightbox && !safeHref) {
      frame.classList.add('urd-lightbox-able');
      frame.addEventListener('click', async () => {
        if (ctx.preview && !document.body.classList.contains('urd-chrome-off')) return;
        const { openLightbox } = await import('../lightbox.js');
        openLightbox([{ src: props.src, alt: props.alt, style: props }], 0);
      });
    }
  },
};
