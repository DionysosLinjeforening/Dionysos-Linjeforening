/**
 * Core block: collection (the data-block pattern, ADR-0007). Renders the entries
 * of a collection from content/samlinger/ in one of three views: cards (a
 * responsive grid), list (rows with a date badge) or archive (grouped by year).
 *
 * The content is structured DATA and renders with textContent, never innerHTML.
 * Fetching the data is asynchronous: render draws the shell synchronously and
 * fills it once the collection is loaded; a missing collection gives a calm empty
 * state, never a crash.
 */
import { getCollection, sortEntries, groupByYear, dateBadge } from '../collections.js';
import { growSectionTo } from '../render.js';
import { stripActiveContent } from '../sanitize.js';
import { isSafeHref } from '../nav-model.js';
// Only called in preview (after the admin dictionary is loaded): never at module level.
import { ta, adminLocaleReady } from '../i18n.js';

/** Editing context while a collection renders in preview: {collection}, or null (visitors). */
let editCtx = null;

const post = (msg) => window.parent?.postMessage(msg, location.origin);

/** Click-and-type on the title/text right in the block: the change is posted to the editor, which owns the collection draft.
 *  The title is stored as plain text; the entry text is rich (html: true) and stores safe HTML (ADR-0007). */
function editable(node, entryId, field, html = false) {
  if (!editCtx) return node;
  node.contentEditable = 'true';
  node.classList.add('urd-collection-editable');
  const collection = editCtx.collection;
  node.addEventListener('input', () => {
    post({ type: 'urd-collection-edit', collection, entryId, field, value: html ? node.innerHTML : node.textContent });
  });
  return node;
}

/** Image editing in preview: a click opens the SHARED image editor with the WHOLE palette
 *  (dynamic import: visitors never load it). The style fields live in entry.imageStyle (additive). */
function wireImageEdit(target, entry) {
  if (!editCtx) return;
  const collection = editCtx.collection;
  target.classList.add('urd-collection-image-edit');
  target.title = ta('canvas.editImage');
  target.addEventListener('click', async () => {
    const { openImageEditor } = await import('../image-editor.js');
    openImageEditor(target, {
      fields: ['image', 'remove', 'alt', 'fit', 'shape', 'zoom', 'radius', 'focus', 'filters'],
      get: (field) => {
        if (field === 'image') return entry.image ?? null;
        if (field === 'alt') return entry.imageAlt ?? '';
        return (entry.imageStyle ?? {})[field];
      },
      set: (field, value) => {
        if (field === 'image') {
          post({ type: 'urd-collection-edit', collection, entryId: entry.id, field, value });
          return;
        }
        if (field === 'alt') {
          entry.imageAlt = value;
        } else {
          entry.imageStyle = { ...(entry.imageStyle ?? {}), [field]: value };
        }
        applyEntryImageStyle(target, entry);
        post({
          type: 'urd-collection-edit',
          collection,
          entryId: entry.id,
          field: field === 'alt' ? 'imageAlt' : 'imageStyle',
          value: field === 'alt' ? value : entry.imageStyle,
        });
      },
    });
  });
}

/** Entry text: rich (a safe HTML subset, the same sanitizing as text blocks). The urd-text class
 *  gives the floating text editor for free in preview. Empty fields show as editable placeholders. */
function textOrPlaceholder(entry) {
  if (!entry.text && !editCtx) return null;
  const node = el2('div', 'urd-text urd-collection-text');
  if (entry.text) {
    node.innerHTML = entry.text;
    stripActiveContent(node);
  } else {
    node.classList.add('urd-collection-placeholder');
    node.dataset.placeholder = ta('canvas.textPlaceholder');
  }
  return editable(node, entry.id, 'text', true);
}

function imageOrAdder(entry, className) {
  const img = imageNode(entry, className);
  if (img) {
    wireImageEdit(img, entry);
    return img;
  }
  if (!editCtx) return null;
  const adder = el2('button', 'urd-collection-image-adder', ta('ui.addImages'));
  adder.type = 'button';
  wireImageEdit(adder, entry);
  return adder;
}

const el2 = (tag, className, textContent) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (textContent != null) node.textContent = textContent;
  return node;
};

/** Title: rich text (a safe HTML subset) with the full text editor in preview (the urd-text class
 *  gives the floating bar). With a link it renders as an anchor for visitors; in the editor the text is edited. */
function titleNode(entry) {
  // Shared guard (nav/footer plus internal paths and anchors): an unsafe href gives a title without a link.
  const tag = entry.href && isSafeHref(entry.href) && !editCtx ? 'a' : 'strong';
  const node = el2(tag, 'urd-collection-title');
  node.innerHTML = entry.title;
  stripActiveContent(node);
  if (tag === 'a') {
    node.href = entry.href;
    return node;
  }
  node.classList.add('urd-text');
  return editable(node, entry.id, 'title', true);
}

/** The shapes: the frame's aspect ratio. Circle is 1:1 with full rounding. */
const SHAPE_ASPECTS = { wide: '16 / 9', square: '1 / 1', portrait: '3 / 4', circle: '1 / 1' };

/** Entry image with the additive style (imageStyle) and the description applied.
 *  node is the wrapper (a span with an img inside) or a standalone img: the image gets
 *  focus, filters and zoom, the frame gets shape and rounding and clips the zoom (overflow). */
export function applyEntryImageStyle(node, entry) {
  const img = node instanceof HTMLImageElement ? node : node.querySelector?.('img');
  if (!img) return;
  const style = entry.imageStyle ?? {};
  const focus = `${(style.x ?? 0.5) * 100}% ${(style.y ?? 0.5) * 100}%`;
  img.alt = entry.imageAlt ?? '';
  img.style.objectFit = style.fit ?? 'cover';
  img.style.objectPosition = focus;
  const zoom = Number(style.zoom) || 1;
  img.style.transform = zoom !== 1 ? `scale(${zoom})` : '';
  img.style.transformOrigin = focus;
  const filters = [];
  if (style.brightness != null && style.brightness !== 1) filters.push(`brightness(${style.brightness})`);
  if (style.contrast != null && style.contrast !== 1) filters.push(`contrast(${style.contrast})`);
  if (style.saturate != null && style.saturate !== 1) filters.push(`saturate(${style.saturate})`);
  img.style.filter = filters.join(' ');
  node.style.borderRadius = style.shape === 'circle' ? '50%'
    : style.radius ? `var(--urd-radius-${style.radius})` : '';
  node.style.aspectRatio = SHAPE_ASPECTS[style.shape] ?? '';
  node.style.height = style.shape ? 'auto' : '';
}

function imageNode(entry, className = 'urd-collection-image') {
  if (!entry.image) return null;
  const img = document.createElement('img');
  img.src = entry.image;
  img.loading = 'lazy';
  img.draggable = false;
  const wrap = el2('span', `urd-collection-imgwrap ${className}`);
  wrap.appendChild(img);
  applyEntryImageStyle(wrap, entry);
  return wrap;
}

function badgeNode(entry) {
  const badge = dateBadge(entry.date);
  if (!badge) return null;
  const box = el2('div', 'urd-collection-badge');
  box.append(el2('strong', null, badge.day), el2('span', null, badge.month));
  return box;
}

/** Card grid: image, date, title and text per entry. */
function renderCards(host, entries) {
  const grid = el2('div', 'urd-collection-cards');
  for (const entry of entries) {
    const card = el2('article', 'urd-collection-card');
    const img = imageOrAdder(entry, 'urd-collection-image');
    if (img) card.appendChild(img);
    const badge = dateBadge(entry.date);
    if (badge) card.appendChild(el2('span', 'urd-collection-date', `${badge.day}. ${badge.month} ${badge.year}`));
    card.appendChild(titleNode(entry));
    const text = textOrPlaceholder(entry);
    if (text) card.appendChild(text);
    grid.appendChild(card);
  }
  host.appendChild(grid);
}

/** List: a row with a date badge plus title and text (the ApeironLF style). */
function renderList(host, entries) {
  const list = el2('div', 'urd-collection-list');
  for (const entry of entries) {
    const row = el2('article', 'urd-collection-row');
    const badge = badgeNode(entry);
    if (badge) row.appendChild(badge);
    const thumb = imageOrAdder(entry, 'urd-collection-thumb');
    if (thumb) row.appendChild(thumb);
    const body = el2('div', 'urd-collection-body');
    body.appendChild(titleNode(entry));
    const text = textOrPlaceholder(entry);
    if (text) body.appendChild(text);
    row.appendChild(body);
    list.appendChild(row);
  }
  host.appendChild(list);
}

/** Archive: year headings with the entries below (publications and issues). */
function renderArchive(host, entries) {
  const wrap = el2('div', 'urd-collection-archive');
  for (const group of groupByYear(entries)) {
    wrap.appendChild(el2('h3', 'urd-collection-year', group.year ?? ta('ui.noDate')));
    const list = el2('div', 'urd-collection-list');
    for (const entry of group.entries) {
      const row = el2('article', 'urd-collection-row');
      const thumb = imageOrAdder(entry, 'urd-collection-thumb');
      if (thumb) row.appendChild(thumb);
      const body = el2('div', 'urd-collection-body');
      body.appendChild(titleNode(entry));
      const text = textOrPlaceholder(entry);
      if (text) body.appendChild(text);
      row.appendChild(body);
      list.appendChild(row);
    }
    wrap.appendChild(list);
  }
  host.appendChild(wrap);
}

const VIEWS = { cards: renderCards, list: renderList, archive: renderArchive };

function emptyState(el, ctx, message) {
  if (!ctx.preview) return;
  el.appendChild(el2('div', 'urd-collection-empty', message));
}

export const collectionBlock = {
  version: 1,
  autoGrow: true,
  // Collection consumer: the urd-collections message re-renders only sections
  // with blocks carrying this flag (the scroll position is preserved).
  usesCollections: true,
  label: 'Collection',
  labelKey: 'blocks.collection',
  defaults: () => ({ collection: null, view: 'cards', limit: 6, newestFirst: true }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{collection: string|null, view: string, limit: number, newestFirst: boolean}} props
   * @param {object} ctx
   */
  render(el, props, ctx) {
    const host = el2('div', 'urd-collection');
    el.appendChild(host);

    if (!props.collection) {
      emptyState(el, ctx, ta('canvas.collectionEmpty'));
      return;
    }

    getCollection(props.collection).then((data) => {
      // The block may have been re-rendered or removed while the data was fetched.
      if (!host.isConnected) return;
      if (!data) {
        emptyState(el, ctx, ta('canvas.collectionMissing', { name: props.collection }));
        return;
      }
      let entries = sortEntries(data.entries, props.newestFirst !== false);
      if (props.limit > 0) entries = entries.slice(0, props.limit);
      if (!entries.length) {
        emptyState(el, ctx, ta('canvas.collectionNoEntries', { name: data.name }));
        return;
      }
      const view = VIEWS[props.view] ?? renderCards;
      editCtx = ctx.preview && ctx.viewport !== 'mobile' ? { collection: props.collection } : null;
      // finally: if the view throws, the module global would otherwise stay set
      // and leak this collection's editing context into the next block rendered.
      try {
        view(host, entries);
      } finally {
        editCtx = null;
      }

      // The help chip (ADR-0008): the block has special functions and explains itself.
      if (ctx.preview && ctx.viewport !== 'mobile') {
        // adminLocaleReady: the first render can happen before boot has loaded the dictionary.
        Promise.all([import('../hint.js'), adminLocaleReady]).then(([{ attachHint }]) => {
          if (!el.isConnected || el.querySelector('.urd-hint-chip')) return;
          attachHint(el, {
            title: ta('hintCollection.title'),
            lines: [
              ta('hintCollection.l1'),
              ta('hintCollection.l2'),
              ta('hintCollection.l3'),
              ta('hintCollection.l4'),
            ],
          });
        });
      }

      // Auto-grow: collection content is dynamic, so the frame follows the content instead
      // of the templates guessing a large fixed height. The section is raised when needed
      // (display only for visitors; in the editor the height is recorded in the draft, as
      // the text blocks do).
      const needed = host.scrollHeight;
      if (Math.abs(needed - el.clientHeight) > 8 && ctx.viewport !== 'mobile') {
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
