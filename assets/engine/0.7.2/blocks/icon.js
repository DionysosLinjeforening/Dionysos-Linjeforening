/**
 * Core block: icon. A glyph/emoji in a chosen size and theme color, for
 * bullet lists, contact rows and small decorative elements. Emoji carry
 * their own colors; the theme color applies to text glyphs (★ ✓ → and so on).
 */
import { resolveColor } from '../theme.js';
import { isSafeImage } from '../nav-model.js';
import { iconSvg } from '../icons.js';

export const iconBlock = {
  version: 1,
  label: 'Icon',
  labelKey: 'blocks.icon',
  defaults: () => ({ glyph: '★', color: 'accent', size: 48 }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{glyph: string, color: string, size: number, image?: string|null, icon?: string|null}} props
   */
  render(el, props) {
    // Custom uploaded icon (additive field): the image renders at the glyph size and wins over the glyph until it is removed.
    // An unsafe source is treated as no source, the same path as an image that fails to load.
    if (isSafeImage(props.image)) {
      const img = document.createElement('img');
      img.src = props.image;
      img.alt = '';
      img.draggable = false;
      img.style.cssText = `height:${props.size || 48}px;width:auto;display:block;`;
      // Same load guard as the image block (no half-painted fade-in), and the glyph takes over if the image fails.
      if (!img.complete) {
        img.style.visibility = 'hidden';
        img.addEventListener('load', () => { img.style.visibility = ''; }, { once: true });
      }
      img.addEventListener('error', () => {
        img.remove();
        el.replaceChildren();
        iconBlock.render(el, { ...props, image: null });
      }, { once: true });
      el.appendChild(img);
      return;
    }
    // Drawn SVG icon from the library (additive field): sharp at every
    // size and follows the theme color. An unknown id (data from a newer
    // Urd) falls back silently to the glyph. The outer element keeps the
    // .urd-icon centering inside the frame; the inner element carries the size.
    if (typeof props.icon === 'string' && props.icon) {
      const svg = iconSvg(props.icon);
      if (svg) {
        const span = document.createElement('span');
        span.className = 'urd-icon';
        span.style.color = resolveColor(props.color);
        const inner = document.createElement('span');
        inner.innerHTML = svg;
        const size = props.size || 48;
        inner.style.cssText = `display:block;width:${size}px;height:${size}px;`;
        span.appendChild(inner);
        el.appendChild(span);
        return;
      }
    }
    const span = document.createElement('span');
    span.className = 'urd-icon';
    span.textContent = props.glyph || '★';
    span.style.fontSize = `${props.size || 48}px`;
    span.style.color = resolveColor(props.color);
    el.appendChild(span);
  },
};
