/**
 * Core block: gallery. One block with three views (the Squarespace model: the
 * view is a prop, not separate block types): grid, carousel (side scrolling with
 * snap) and slides (one image at a time with automatic advance).
 *
 * The images live in props.images with the same non-destructive style vocabulary
 * as the image block (style: fit/x/y/zoom/filters); the tiles render with the
 * shared applyImageStyle. For visitors a click opens the lightbox (props.lightbox);
 * in preview a click opens the image editor, and in Clean view the lightbox, so
 * the owner gets to try it before publishing. A link (href) always wins over the
 * lightbox.
 *
 * The slide timer is the engine's first setInterval: it cleans itself up when the
 * host disappears from the DOM (re-render churn), stands still under reduced
 * motion, in hidden tabs, and in preview with the editing chrome on.
 */
import { applyImageStyle } from './image.js';
import { growSectionTo } from '../render.js';
import { stepIndex, canAutoplay, normalizeInterval, gridColumns } from '../gallery-model.js';
import { isSafeHref } from '../nav-model.js';
// ta/adminLocaleReady: only called in preview (after the admin dictionary is loaded), never at module level.
import { t, ta, adminLocaleReady } from '../i18n.js';

const post = (msg) => window.parent?.postMessage(msg, location.origin);

const el2 = (tag, className, textContent) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (textContent != null) node.textContent = textContent;
  return node;
};

const chromeOff = () => document.body.classList.contains('urd-chrome-off');
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

async function openLightboxAt(images, index) {
  const { openLightbox } = await import('../lightbox.js');
  openLightbox(images, index);
}

/** The image editor for one tile: the adapter reads and writes props.images[index]
 *  and posts the whole props to the editor (which owns the draft). Remove deletes the tile. */
async function openTileEditor(tile, props, index, ctx, blockEl) {
  const { openImageEditor } = await import('../image-editor.js');
  const img = props.images[index];
  openImageEditor(tile, {
    fields: ['image', 'remove', 'alt', 'fit', 'zoom', 'focus', 'filters'],
    get: (field) => {
      if (field === 'image') return img.src || null;
      if (field === 'alt') return img.alt ?? '';
      return (img.style ?? {})[field];
    },
    set: (field, value) => {
      let rerender = false;
      if (field === 'image') {
        if (value) img.src = value;
        else props.images.splice(index, 1);
        rerender = true;
      } else if (field === 'alt') {
        img.alt = value;
      } else {
        img.style = { ...(img.style ?? {}), [field]: value };
        applyImageStyle(tile, { ...img.style, alt: img.alt, radius: props.radius });
      }
      post({ type: 'urd-edit', sectionId: ctx.section.id, blockId: blockEl.dataset.blockId, props, rerender });
    },
  });
}

/** One tile: a clipping frame plus an img with the shared image style. The element
 *  is chosen by what the click should do: link (a), clickable (button) or pure decoration (span). */
function makeTile(props, index, ctx, blockEl) {
  const img = props.images[index];
  // Shared guard (nav/footer plus internal paths and anchors): an unsafe href gives a tile without a link (the lightbox takes over).
  const asLink = Boolean(img.href) && isSafeHref(img.href) && !ctx.preview;
  const clickable = ctx.preview || props.lightbox;
  const tile = el2(asLink ? 'a' : clickable ? 'button' : 'span', 'urd-gallery-tile');
  if (asLink) tile.href = img.href;
  if (tile.tagName === 'BUTTON') tile.type = 'button';

  const image = document.createElement('img');
  image.src = img.src;
  image.loading = 'lazy';
  image.draggable = false;
  // The same load guard as the image block: show the image complete, never in strips.
  if (!image.complete) {
    image.style.visibility = 'hidden';
    image.addEventListener('load', () => { image.style.visibility = ''; }, { once: true });
    image.addEventListener('error', () => { image.style.visibility = ''; }, { once: true });
  }
  tile.appendChild(image);
  applyImageStyle(tile, { ...(img.style ?? {}), alt: img.alt, radius: props.radius });

  if (ctx.preview) {
    // Chrome on: the image editor. Clean view: the lightbox, as for visitors.
    // The decision is made on click, so the Clean view switch needs no re-render.
    tile.classList.add('urd-gallery-edit');
    tile.title = ta('canvas.editImage');
    tile.addEventListener('click', (event) => {
      event.preventDefault();
      if (chromeOff()) {
        if (props.lightbox) openLightboxAt(props.images, index);
        return;
      }
      openTileEditor(tile, props, index, ctx, blockEl);
    });
  } else if (!asLink && props.lightbox) {
    tile.addEventListener('click', () => openLightboxAt(props.images, index));
  }
  return tile;
}

function renderGrid(host, props, ctx, blockEl) {
  host.classList.add('urd-gallery-grid');
  host.style.setProperty('--urd-gallery-cols', String(gridColumns(props.columns, props.images.length, ctx.viewport)));
  host.style.setProperty('--urd-gallery-gap', `${Number(props.gap) || 0}px`);
  props.images.forEach((_, i) => host.appendChild(makeTile(props, i, ctx, blockEl)));
}

function navButton(dir, label, onclick) {
  const btn = el2('button', `urd-gallery-nav urd-gallery-${dir}`);
  btn.type = 'button';
  btn.title = label;
  btn.setAttribute('aria-label', label);
  btn.innerHTML = dir === 'prev'
    ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>'
    : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
  btn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    onclick();
  });
  return btn;
}

function renderCarousel(host, props, ctx, blockEl) {
  host.classList.add('urd-gallery-carousel');
  const track = el2('div', 'urd-gallery-track');
  props.images.forEach((_, i) => track.appendChild(makeTile(props, i, ctx, blockEl)));
  host.appendChild(track);
  if (props.images.length > 1) {
    const behavior = reducedMotion() ? 'auto' : 'smooth';
    host.appendChild(navButton('prev', t('gallery.prevImages'), () => track.scrollBy({ left: -track.clientWidth * 0.8, behavior })));
    host.appendChild(navButton('next', t('gallery.nextImages'), () => track.scrollBy({ left: track.clientWidth * 0.8, behavior })));
  }
}

function renderSlides(host, props, ctx, blockEl) {
  host.classList.add('urd-gallery-slides');
  const count = props.images.length;
  const slides = props.images.map((_, i) => {
    const slide = el2('div', 'urd-gallery-slide');
    slide.appendChild(makeTile(props, i, ctx, blockEl));
    host.appendChild(slide);
    return slide;
  });
  const dots = [];
  let current = 0;

  const show = (i) => {
    current = i;
    slides.forEach((slide, j) => slide.classList.toggle('on', j === i));
    dots.forEach((dot, j) => dot.classList.toggle('on', j === i));
  };

  // Self-cleaning timer: the host disappears from the DOM on every re-render in
  // preview, and the interval has to die with it (otherwise one stacks up per render).
  let timerId = 0;
  const startTimer = () => {
    clearInterval(timerId);
    if (!canAutoplay({ count, reducedMotion: reducedMotion() })) return;
    timerId = setInterval(() => {
      if (!host.isConnected) {
        clearInterval(timerId);
        return;
      }
      if (document.hidden) return;
      // In preview the slide advances only in Clean view: while editing, nothing
      // should move under the pointer.
      if (ctx.preview && !chromeOff()) return;
      show(stepIndex(current, 1, count));
    }, normalizeInterval(props.interval) * 1000);
  };
  const manual = (delta) => {
    show(stepIndex(current, delta, count));
    startTimer();
  };

  if (count > 1) {
    host.appendChild(navButton('prev', t('gallery.prevImage'), () => manual(-1)));
    host.appendChild(navButton('next', t('gallery.nextImage'), () => manual(1)));
    const dotRow = el2('div', 'urd-gallery-dots');
    props.images.forEach((_, i) => {
      const dot = el2('button', 'urd-gallery-dot urd-gallery-nav');
      dot.type = 'button';
      dot.setAttribute('aria-label', t('gallery.imageN', { n: i + 1 }));
      dot.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        show(i);
        startTimer();
      });
      dots.push(dot);
      dotRow.appendChild(dot);
    });
    host.appendChild(dotRow);
  }
  show(0);
  startTimer();
}

const VIEWS = { grid: renderGrid, carousel: renderCarousel, slides: renderSlides };

export const galleryBlock = {
  version: 1,
  autoGrow: true,
  label: 'Gallery',
  labelKey: 'blocks.gallery',
  defaults: () => ({
    images: [], view: 'grid', columns: 3, gap: 12, radius: 'md', lightbox: true, interval: 5,
  }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{images: Array<{src: string, alt?: string, href?: string|null, style?: object}>,
   *          view: 'grid'|'carousel'|'slides', columns: number, gap: number,
   *          radius: string|null, lightbox: boolean, interval: number}} props
   * @param {object} ctx
   */
  render(el, props, ctx) {
    if (!props.images?.length) {
      if (ctx.preview) el.appendChild(el2('div', 'urd-gallery-empty', ta('canvas.galleryEmpty')));
      return;
    }
    const host = el2('div', 'urd-gallery');
    el.appendChild(host);
    (VIEWS[props.view] ?? renderGrid)(host, props, ctx, el);

    // The help chip (ADR-0008): the block has special functions and explains itself.
    if (ctx.preview && ctx.viewport !== 'mobile') {
      // adminLocaleReady: the first render can happen before boot has loaded the dictionary.
      Promise.all([import('../hint.js'), adminLocaleReady]).then(([{ attachHint }]) => {
        if (!el.isConnected || el.querySelector('.urd-hint-chip')) return;
        attachHint(el, {
          title: ta('hintGallery.title'),
          lines: [
            ta('hintGallery.l1'),
            ta('hintGallery.l2'),
            ta('hintGallery.l3'),
            ta('hintGallery.l4'),
          ],
        });
      });
    }

    // Auto-grow for the grid: the row height follows the number of images, so the
    // frame follows the content (the same pattern as the collection block). The
    // measurement has to wait until the block is in the DOM: render is called
    // before appendChild.
    if (props.view === 'grid' && ctx.viewport !== 'mobile') requestAnimationFrame(() => {
      if (!el.isConnected) return;
      const needed = host.scrollHeight;
      if (Math.abs(needed - el.clientHeight) > 8) {
        el.style.height = `${needed}px`;
        const sectionEl = el.closest('.urd-section');
        if (sectionEl) growSectionTo(sectionEl, el.offsetTop + needed + 24);
        if (ctx.preview) {
          const block = ctx.section?.blocks?.find((b) => b.id === el.dataset.blockId);
          if (block && block.frames.desktop.h !== needed) {
            block.frames.desktop = { ...block.frames.desktop, h: needed };
            // ONLY the height is posted (urd-grow), never the whole frame: otherwise
            // a dragged block would teleport back to the snapshot's old x/y.
            post({ type: 'urd-grow', sectionId: ctx.section.id, blockId: el.dataset.blockId, h: needed });
          }
        }
      }
    });
  },
};
