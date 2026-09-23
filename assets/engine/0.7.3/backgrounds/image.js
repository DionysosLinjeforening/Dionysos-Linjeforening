/**
 * Background layer: image. Shows a file from media/ (or a data URL for
 * unpublished uploads in a draft; publishing materializes it into a file,
 * the same flow as the image block).
 *
 * Position and size are CSS-native via `background-position` and
 * `background-size` on an inner `.urd-bg-image` element (same model as the
 * image gallery layer), NOT via transform. Transform is used only for parallax.
 *
 * Fields (all additive with safe defaults):
 * - fit: 'cover' (fill+crop), 'custom' (background-size %, width-relative - shrinks
 *   AND enlarges, is not cropped by the section height), 'contain' (show all), 'repeat'.
 * - x/y (0..1, 0.5 = centered): focal point via background-position percentages. The
 *   point stays visible whatever the section format, with no empty space.
 * - size (fraction, 1 = 100% of the width): only in 'custom' mode.
 * - blur (px): mood background behind text. opacity (0..1). parallax (0..1): the layer
 *   lags behind on scroll. bleed: let the parallax flow into the neighbouring sections.
 */

import { isSafeImage } from '../nav-model.js';

/** Maximum vertical travel (fraction of the viewport height) a parallax layer gets at
 *  full strength. Generous, since the free-placement image (scale + position) does not
 *  HAVE to fill the section: it shifts cleanly with no overscan/zoom, so the movement
 *  can be large. */
const MAX_SHIFT = 0.4;

/**
 * The background-position string for a focal point (0.5/0.5 = centered). Pure
 * function (node-tested). Same mapping as the image gallery layer.
 * @param {number} x Focal point, horizontal 0..1
 * @param {number} y Focal point, vertical 0..1
 * @returns {string}
 */
export function bgPosition(x, y) {
  return `${(x ?? 0.5) * 100}% ${(y ?? 0.5) * 100}%`;
}

/**
 * The background-size value. The free-placement model (`plain`/`tile`) uses a
 * width-relative SCALE (`{size*100}%`, height = auto keeps the aspect ratio), so the
 * user sets the size themselves. `cover`/`contain` are kept as keywords (image
 * gallery layer and backwards compatibility). Pure function (node-tested).
 * @param {'plain'|'tile'|'cover'|'contain'|'custom'|'repeat'} fit
 * @param {number} [size] Scale as a fraction (1 = 100% of the section width)
 * @returns {string}
 */
export function bgSize(fit, size) {
  if (fit === 'contain') return 'contain';
  if (fit === 'cover') return 'cover';
  // plain / tile / custom / repeat / other -> width-relative scale
  return `${Math.max(0, size ?? 1) * 100}%`;
}

/**
 * clip-path for a layer from the bleed direction. The sides are ALWAYS clipped at the
 * edge (no horizontal bleed → no sideways scrolling); top/bottom open on the bleed side
 * so a parallax layer can flow into the neighbouring section. Pure function (node-tested).
 * @param {'none'|'up'|'down'|'both'} [bleed]
 * @returns {string}
 */
export function bleedClip(bleed) {
  const o = '-9999px';
  if (bleed === 'up') return `inset(${o} 0 0 0)`;
  if (bleed === 'down') return `inset(0 0 ${o} 0)`;
  if (bleed === 'both') return `inset(${o} 0 ${o} 0)`;
  return 'inset(0)';
}

/**
 * Vertical overscan (px) for a parallax layer: exactly the travel the layer needs
 * to shift without revealing its edges. Proportional to the strength, so a low
 * strength gives minimal enlargement. Capped against the section height. Pure function (node-tested).
 * @param {number} sectionH The section height
 * @param {number} viewportH Viewport height
 * @param {number} speed Strength 0..1
 * @returns {number}
 */
export function parallaxPad(sectionH, viewportH, speed, capFrac = 0.18) {
  const travel = Math.max(0, Math.min(1, speed)) * MAX_SHIFT * viewportH;
  return Math.round(Math.min(travel, capFrac * sectionH));
}

/**
 * translateY (px) for a parallax layer: the section center measured against the
 * viewport center, multiplied by the strength, clamped to [-pad, pad] so it never
 * shifts outside the overscan. Pure function (node-tested).
 * @param {number} rectTop The section top in viewport coordinates
 * @param {number} sectionH The section height
 * @param {number} viewportH Viewport height
 * @param {number} speed Strength 0..1
 * @param {number} pad Overscan in px (the limit for the shift)
 * @returns {number}
 */
export function parallaxOffset(rectTop, sectionH, viewportH, speed, pad) {
  const sectionMid = rectTop + sectionH / 2;
  const raw = (viewportH / 2 - sectionMid) * Math.max(0, Math.min(1, speed)) * MAX_SHIFT;
  const lim = pad ?? parallaxPad(sectionH, viewportH, speed);
  // `|| 0` normalizes -0 to +0.
  return Math.max(-lim, Math.min(lim, raw)) || 0;
}

// Active parallax layers: ONE module-level scroll/resize listener shifts them via
// rAF. Detached layers (after a re-render) are weeded out when apply returns false.
const parallaxAppliers = new Set();
let parallaxListening = false;
let parallaxRaf = 0;
function pumpParallax() {
  parallaxRaf = 0;
  for (const fn of [...parallaxAppliers]) if (!fn()) parallaxAppliers.delete(fn);
}
function scheduleParallax() {
  if (!parallaxRaf) parallaxRaf = requestAnimationFrame(pumpParallax);
}
function registerParallax(apply) {
  parallaxAppliers.add(apply);
  apply();
  if (parallaxListening || typeof window === 'undefined') return;
  parallaxListening = true;
  window.addEventListener('scroll', scheduleParallax, { passive: true });
  window.addEventListener('resize', scheduleParallax, { passive: true });
}

/**
 * Attaches parallax to the image element: one rAF-driven listener shifts it on
 * scroll via `translateY`. The overscan (top/bottom) keeps the shift from revealing
 * the edges; it is at least `blurMargin` (the blur fringe) and grows to the
 * parallax travel. OFF on mobile and with prefers-reduced-motion (the layer then
 * stands still, only the blur fringe is kept).
 * Fill modes (cover/tile) MUST overscan (they fill the section, so a gap at the
 * edge is unacceptable; overscan costs no zoom on a tile, a little on cover). The
 * free model (plain/custom/contain) shows the image with space around it, so there NO
 * overscan is needed: the image shifts cleanly, without zoom, and the whole strength
 * range is noticeable.
 * @param {HTMLElement} img The image element
 * @param {number} speed Strength 0..1
 * @param {number} blurMargin The blur fringe in px (0 without blur)
 * @param {'plain'|'tile'|'cover'|'custom'|'contain'|'repeat'} fit
 */
function mountParallax(img, speed, blurMargin, fit) {
  const fills = fit === 'cover' || fit === 'tile' || fit === 'repeat';
  const section = img.closest('.urd-section') ?? img.parentElement?.closest('.urd-section') ?? img.parentElement;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  img.style.willChange = 'transform';
  const setInset = (v) => { img.style.top = `-${v}px`; img.style.bottom = `-${v}px`; };
  const apply = () => {
    if (!img.isConnected) return false;
    if (reduce || document.body.classList.contains('urd-mobile')) {
      setInset(blurMargin);
      img.style.transform = '';
      return true;
    }
    const rect = (section ?? img).getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    // `limit` clamps the movement (dy). Fill modes have a tight cap (the overscan =
    // inverse zoom); the free model can move much further (no overscan).
    const limit = parallaxPad(rect.height, vh, speed, fills ? 0.18 : 0.6);
    setInset(fills ? Math.max(blurMargin, limit) : blurMargin);
    const dy = parallaxOffset(rect.top, rect.height, vh, speed, limit);
    img.style.transform = `translateY(${dy.toFixed(1)}px)`;
    return true;
  };
  registerParallax(apply);
  // `renderBackgroundLayers` puts the layer in the DOM AFTER render(), so the first
  // apply above runs before the section is measurable (overscan = 0). Run it again
  // once the layer is connected and measurable, otherwise the image only grows on
  // the next scroll.
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => requestAnimationFrame(apply));
  }
}

/**
 * Does the browser support scroll-driven animations? Then the compositor drives
 * the parallax via `animation-timeline: view()` (CSS), and we avoid both the scroll
 * listener and the rAF pump (mountParallaxCss). Otherwise we fall back to the
 * rAF-driven mountParallax. Also gated in CSS with `@supports`.
 */
function supportsScrollTimeline() {
  return typeof CSS !== 'undefined' && typeof CSS.supports === 'function'
    && CSS.supports('animation-timeline', 'view()');
}

// CSS parallax: the travel (--urd-px-shift) and the overscan (top/bottom) are set
// once and on RESIZE, never on scroll. The shift itself is scrubbed by the view()
// timeline in base.css on the compositor thread. A shared resize listener with the
// same cleanup as the rAF fallback: detached layers are weeded out when the measure
// function returns false.
const parallaxMeasurers = new Set();
let measureBound = false;
let measureRaf = 0;
function pumpMeasure() {
  measureRaf = 0;
  for (const fn of [...parallaxMeasurers]) if (!fn()) parallaxMeasurers.delete(fn);
}
function scheduleMeasure() {
  if (!measureRaf && typeof requestAnimationFrame === 'function') measureRaf = requestAnimationFrame(pumpMeasure);
}
function registerMeasure(measure) {
  parallaxMeasurers.add(measure);
  measure();
  if (measureBound || typeof window === 'undefined') return;
  measureBound = true;
  window.addEventListener('resize', scheduleMeasure, { passive: true });
}

/**
 * Attaches CSS parallax to the image element: the travel and the overscan are
 * computed from the section height and the viewport height (the same parallaxPad
 * formula as mountParallax), but the shift is scrubbed by `animation-timeline: view()`
 * in CSS - no scroll listener, no rAF per image. Still on mobile / with reduced
 * motion (CSS then sets animation:none; here the overscan is held at the blur fringe
 * so the layer sits cleanly in its end state).
 * @param {HTMLElement} img The image element
 * @param {number} speed Strength 0..1
 * @param {number} blurMargin The blur fringe in px (0 without blur)
 * @param {'plain'|'tile'|'cover'|'custom'|'contain'|'repeat'} fit
 */
function mountParallaxCss(img, speed, blurMargin, fit) {
  const fills = fit === 'cover' || fit === 'tile' || fit === 'repeat';
  const section = img.closest('.urd-section') ?? img.parentElement?.closest('.urd-section') ?? img.parentElement;
  img.style.willChange = 'transform';
  img.classList.add('urd-parallax-css');
  const measure = () => {
    if (!img.isConnected) return false;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const still = reduce || document.body.classList.contains('urd-mobile');
    const rect = (section ?? img).getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    // Travel = parallaxPad (fill: tight cap; free: large cap). Overscan only in fill
    // mode when the layer actually moves; otherwise the blur fringe is enough.
    const shift = parallaxPad(rect.height, vh, speed, fills ? 0.18 : 0.6);
    const inset = (fills && !still) ? Math.max(blurMargin, shift) : blurMargin;
    img.style.setProperty('--urd-px-shift', `${shift}px`);
    img.style.top = `-${inset}px`;
    img.style.bottom = `-${inset}px`;
    return true;
  };
  registerMeasure(measure);
  // Same reason as mountParallax: the layer is put in the DOM after render(), so the
  // first measurement must happen when the section is actually measurable.
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(() => requestAnimationFrame(measure));
  }
}

export const imageLayer = {
  version: 2,
  label: 'Image',
  labelKey: 'bgLayer.image',
  defaults: () => ({ src: '', fit: 'plain', x: 0.5, y: 0.5, size: 1, opacity: 1, blur: 0, parallax: 0, bleed: 'none' }),
  migrations: {
    // 1 -> 2 (ADR-0021): Norwegian fit values renamed to English.
    1: (props) => ({
      ...props,
      fit: props.fit === 'vanlig' ? 'plain' : props.fit === 'flislegg' ? 'tile' : props.fit === 'egen' ? 'custom' : props.fit,
    }),
  },
  /**
   * @param {HTMLElement} el
   * @param {{src: string, fit?: 'plain'|'tile'|'cover'|'custom'|'contain'|'repeat', x?: number, y?: number, size?: number, opacity?: number, blur?: number, parallax?: number, bleed?: 'none'|'up'|'down'|'both'}} props
   */
  render(el, props) {
    // An empty or unsafe source yields no layer: the source goes straight into
    // CSS url(), so it must pass the same guard as the nav background (shared isSafeImage).
    if (!isSafeImage(props.src)) return;
    el.style.opacity = String(props.opacity ?? 1);
    // Clipping: a directional clip-path driven by bleed (inset(0) = clip to the section).
    el.style.clipPath = bleedClip(props.bleed);
    // Bleed DOWN/BOTH: the section below comes later in the DOM and paints its own
    // background on top of what flows down. Lift the layer to z-index 1 so it paints
    // OVER the next section's background (but still under its content, which sits at
    // z>=1 later in the tree). Bleed UP already paints over the previous section (tree order).
    el.style.zIndex = (props.bleed === 'down' || props.bleed === 'both') ? '1' : '';

    const img = document.createElement('div');
    img.className = 'urd-bg-image';
    img.style.position = 'absolute';
    img.style.left = '0';
    img.style.right = '0';
    img.style.top = '0';
    img.style.bottom = '0';
    const tile = props.fit === 'tile' || props.fit === 'repeat';
    img.style.backgroundImage = `url("${props.src}")`;
    img.style.backgroundSize = bgSize(props.fit, props.size);
    img.style.backgroundRepeat = tile ? 'repeat' : 'no-repeat';
    // Placement via background-position. The image is (usually) SMALLER than the
    // section, so 0/100 % = flush left/right (intuitive), and x/y can go BELOW 0 /
    // ABOVE 1 to put the subject partly or entirely outside the edge.
    img.style.backgroundPosition = bgPosition(props.x, props.y);
    // Blur: stretch the image a touch past the edge (clipped by the layer) so the
    // transparent fringe blur() creates ends up outside. No deliberate zoom.
    let blurMargin = 0;
    if (props.blur > 0) {
      img.style.filter = `blur(${props.blur}px)`;
      blurMargin = Math.ceil(props.blur);
      img.style.left = `-${blurMargin}px`;
      img.style.right = `-${blurMargin}px`;
      img.style.top = `-${blurMargin}px`;
      img.style.bottom = `-${blurMargin}px`;
    }

    // Same load guard as the image block: the layer is kept invisible until the image
    // has finished loading, so it never appears in stripes.
    const probe = new Image();
    probe.src = props.src;
    if (!probe.complete) {
      el.style.visibility = 'hidden';
      const show = () => { el.style.visibility = ''; };
      probe.addEventListener('load', show, { once: true });
      probe.addEventListener('error', show, { once: true });
    }

    el.appendChild(img);
    // Parallax (additive since v0.6): the layer lags behind on scroll.
    if (props.parallax > 0) mountLayerParallax(img, props.parallax, blurMargin, props.fit ?? 'cover');
  },
};

/**
 * Hooks parallax onto a layer element (image or video, shared with the video layer):
 * modern browsers drive it with scroll-driven CSS (compositor thread, no scroll
 * listener); older ones fall back to the rAF-driven variant.
 * @param {HTMLElement} el The layer element
 * @param {number} speed Strength 0..1
 * @param {number} blurMargin The blur fringe in px (0 without blur)
 * @param {'plain'|'tile'|'cover'|'custom'|'contain'|'repeat'} fit
 */
export function mountLayerParallax(el, speed, blurMargin, fit) {
  if (supportsScrollTimeline()) mountParallaxCss(el, speed, blurMargin, fit);
  else mountParallax(el, speed, blurMargin, fit);
}
