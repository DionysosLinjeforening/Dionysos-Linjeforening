/**
 * Background layer: image gallery. Cycles through several images with a soft
 * cross-fade (hero gallery). With a single image, or when the visitor prefers
 * reduced motion, the layer degrades to a static image layer.
 *
 * The cross-fade uses two stacked children (.urd-bg-slide) that take turns
 * being visible; the next image is preloaded BEFORE the fade starts, so it
 * never fades in against a half-loaded image. The timer cleans itself up when
 * the layer leaves the DOM (re-render churn in the preview).
 */
import { canAutoplay, normalizeInterval, stepIndex } from '../gallery-model.js';
import { isSafeImage } from '../nav-model.js';
import { bgSize, bgPosition } from './image.js';

export const slideshowLayer = {
  version: 1,
  label: 'Image gallery',
  labelKey: 'bgLayer.slideshow',
  defaults: () => ({ images: [], fit: 'cover', interval: 6, fade: 1.5, opacity: 1, blur: 0 }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{images: Array<{src: string, x?: number, y?: number}>, fit: 'cover'|'contain',
   *          interval?: number, fade?: number, opacity?: number, blur?: number}} props
   */
  render(el, props) {
    // The sources go straight into CSS url(), so they pass the same guard as the image layer.
    const images = (props.images ?? []).filter((img) => isSafeImage(img?.src));
    if (!images.length) return;

    el.classList.add('urd-bg-slideshow');
    el.style.opacity = String(props.opacity ?? 1);
    // A little oversizing when blurred, so the edges do not "bleed" transparent
    // (the same trick as the image layer).
    if (props.blur > 0) {
      el.style.filter = `blur(${props.blur}px)`;
      el.style.inset = `-${props.blur * 2}px`;
    }
    const fade = Math.max(0, Number(props.fade) || 0);
    el.style.setProperty('--urd-bgg-fade', `${fade}s`);

    const paint = (slide, img) => {
      slide.style.backgroundImage = `url("${img.src}")`;
      slide.style.backgroundSize = bgSize(props.fit);
      slide.style.backgroundRepeat = 'no-repeat';
      slide.style.backgroundPosition = bgPosition(img.x, img.y);
    };

    // Same load guard as the image layer: keep the layer invisible until the first
    // image has finished loading, so it never appears in stripes.
    const probe = new Image();
    probe.src = images[0].src;
    if (!probe.complete) {
      el.style.visibility = 'hidden';
      const show = () => { el.style.visibility = ''; };
      probe.addEventListener('load', show, { once: true });
      probe.addEventListener('error', show, { once: true });
    }

    const first = document.createElement('div');
    first.className = 'urd-bg-slide on';
    paint(first, images[0]);
    el.appendChild(first);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!canAutoplay({ count: images.length, reducedMotion: reduced })) return;

    const other = document.createElement('div');
    other.className = 'urd-bg-slide';
    el.appendChild(other);

    let index = 0;
    let front = first;
    // The fade must have time to finish before the next swap.
    const ms = Math.max(normalizeInterval(props.interval, { fallback: 6 }), fade + 0.5) * 1000;
    const timerId = setInterval(() => {
      if (!el.isConnected) {
        clearInterval(timerId);
        return;
      }
      if (document.hidden) return;
      const nextIndex = stepIndex(index, 1, images.length);
      const next = new Image();
      next.src = images[nextIndex].src;
      const swap = () => {
        if (!el.isConnected) return;
        const back = front === first ? other : first;
        paint(back, images[nextIndex]);
        back.classList.add('on');
        front.classList.remove('on');
        front = back;
        index = nextIndex;
      };
      if (next.complete) {
        swap();
      } else {
        next.addEventListener('load', swap, { once: true });
        // A broken image is skipped, so the rotation does not get stuck on it.
        next.addEventListener('error', () => { index = nextIndex; }, { once: true });
      }
    }, ms);
  },
};
