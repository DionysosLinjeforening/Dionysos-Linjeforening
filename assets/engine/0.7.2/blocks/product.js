/**
 * Core block: product cards (the shop, the data-block pattern in ADR-0007).
 * Renders the entries of a product collection (kind "products") as cards with
 * image, badge, price (and an optional member price), size and color choices
 * and an add-to-cart button. A color choice with its own image swaps the card
 * image. The catalog is git-owned data; the cart lives with the visitor (shop.js).
 *
 * For visitors, clicking the image or title opens a quick view: the product
 * details in a native <dialog> (ADR-0011) with an image gallery, full text,
 * variant choices and a buy button - the product page without a page change
 * (the Squarespace pattern). In the editor clicks belong to editing, and a
 * "+ Product" card at the end of the grid adds a new product to the collection
 * (urd-collection-add).
 *
 * The content is structured DATA: title and text are rich text through the same
 * sanitizing as the collection block, everything else renders with textContent.
 */
import { getCollection } from '../collections.js';
import { applyEntryImageStyle } from './collection.js';
import { growSectionTo, renderCardAnimations } from '../render.js';
import { stripActiveContent, plainText } from '../sanitize.js';
import { iconSvg } from '../icons.js';
import { readCart, writeCart, cartAdd, itemKey, variantLabel, formatPrice, altCardImage } from '../shop.js';
// Only called in preview (after the admin dictionary is loaded): never at module level.
import { ta, adminLocaleReady, t } from '../i18n.js';

const el2 = (tag, className, textContent) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (textContent != null) node.textContent = textContent;
  return node;
};

const post = (msg) => window.parent?.postMessage(msg, location.origin);

/** Rich text node (title/text) with click-and-type in preview (urd-collection-edit). */
function richNode(tag, className, entry, field, collection, editable) {
  const value = entry[field];
  if (!value && !editable) return null;
  const node = el2(tag, className);
  if (value) {
    node.innerHTML = value;
    stripActiveContent(node);
  } else {
    node.classList.add('urd-collection-placeholder');
    node.dataset.placeholder = ta('canvas.textPlaceholder');
  }
  if (editable) {
    node.contentEditable = 'true';
    node.classList.add('urd-collection-editable', 'urd-text');
    node.addEventListener('input', () => {
      post({ type: 'urd-collection-edit', collection, entryId: entry.id, field, value: node.innerHTML });
    });
  }
  return node;
}

/** Choice chips (size/color): one row of buttons where a single choice can be active. */
function choiceRow(className, labels, onPick) {
  const row = el2('div', `urd-product-options ${className}`);
  let active = null;
  for (const label of labels) {
    const btn = el2('button', 'urd-product-chip', label);
    btn.type = 'button';
    btn.setAttribute('aria-pressed', 'false');
    btn.addEventListener('click', () => {
      // Clicking the active choice clears it (choosing is optional).
      const next = active === label ? null : label;
      active = next;
      for (const other of row.children) other.setAttribute('aria-pressed', String(other === btn && next !== null));
      onPick(next);
    });
    row.appendChild(btn);
  }
  return row;
}

/** Price row: shown only when a price is set (a new product must not show "0 kr"). */
function priceRow(entry, currency) {
  if (entry.price == null) return null;
  const row = el2('div', 'urd-product-price');
  row.appendChild(el2('strong', null, formatPrice(entry.price, currency)));
  if (entry.memberPrice != null) {
    row.appendChild(el2('span', 'urd-product-member',
      t('shop.memberPrice', { price: formatPrice(entry.memberPrice, currency) })));
  }
  return row;
}

/** Buy button with an added-to-cart receipt; getChoice() reads the current variant choice. */
function buyButton(entry, currency, colors, getChoice) {
  const buy = el2('button', 'urd-product-buy', t('shop.addToCart'));
  buy.type = 'button';
  buy.addEventListener('click', () => {
    const { size, color } = getChoice();
    const variant = variantLabel(size, color);
    const chosen = colors.find((c) => c.name === color);
    writeCart(cartAdd(readCart(), {
      key: itemKey(entry.id, variant),
      id: entry.id,
      // The title is rich text; the cart line needs plain text.
      title: plainText(entry.title),
      price: Number(entry.price) || 0,
      variant: variant || undefined,
      image: chosen?.image || entry.image || undefined,
    }));
    buy.textContent = t('shop.added');
    buy.classList.add('urd-product-added');
    setTimeout(() => {
      buy.textContent = t('shop.addToCart');
      buy.classList.remove('urd-product-added');
    }, 1400);
  });
  return buy;
}

/**
 * Quick view (visitors only): the product details in a native <dialog> with a
 * gallery (main image plus color images), rich text and its own variant choices.
 * Built on first open and reused.
 */
function openQuickView(card, entry, props) {
  let dialog = card.querySelector('.urd-product-dialog');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.className = 'urd-product-dialog';
    const colors = Array.isArray(entry.colors) ? entry.colors.filter((c) => c?.name) : [];
    let size = null;
    let color = null;

    const close = el2('button', 'urd-product-close');
    close.type = 'button';
    close.innerHTML = iconSvg('cross') ?? '';
    close.setAttribute('aria-label', t('shop.close'));
    close.addEventListener('click', () => dialog.close());
    dialog.appendChild(close);

    const body = el2('div', 'urd-product-dialogbody');
    const images = [entry.image, ...colors.map((c) => c.image)].filter(Boolean)
      .filter((src, i, all) => all.indexOf(src) === i);
    let mainImg = null;
    if (images.length) {
      const gallery = el2('div', 'urd-product-gallery');
      mainImg = document.createElement('img');
      mainImg.src = images[0];
      mainImg.alt = entry.imageAlt ?? '';
      gallery.appendChild(mainImg);
      if (images.length > 1) {
        const thumbs = el2('div', 'urd-product-thumbs');
        for (const src of images) {
          const thumb = document.createElement('img');
          thumb.src = src;
          thumb.alt = '';
          thumb.addEventListener('click', () => { mainImg.src = src; });
          thumbs.appendChild(thumb);
        }
        gallery.appendChild(thumbs);
      }
      body.appendChild(gallery);
    }

    const info = el2('div', 'urd-product-dialoginfo');
    if (entry.badge) info.appendChild(el2('span', 'urd-product-badge', entry.badge));
    const title = richNode('strong', 'urd-product-title', entry, 'title', props.collection, false);
    if (title) info.appendChild(title);
    const text = richNode('div', 'urd-product-text', entry, 'text', props.collection, false);
    if (text) info.appendChild(text);
    const price = priceRow(entry, props.currency);
    if (price) info.appendChild(price);
    const sizes = Array.isArray(entry.sizes) ? entry.sizes.filter(Boolean) : [];
    if (sizes.length) info.appendChild(choiceRow('urd-product-sizes', sizes, (v) => { size = v; }));
    if (colors.length) {
      info.appendChild(choiceRow('urd-product-colors', colors.map((c) => c.name), (name) => {
        color = name;
        const picked = colors.find((c) => c.name === name);
        if (mainImg) mainImg.src = picked?.image || images[0];
      }));
    }
    info.appendChild(buyButton(entry, props.currency, colors, () => ({ size, color })));
    body.appendChild(info);
    dialog.appendChild(body);

    // Light dismiss: a click on ::backdrop hits the dialog element itself.
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    card.appendChild(dialog);
  }
  dialog.showModal();
}

function renderCard(entry, props, editable, preview) {
  const card = el2('article', 'urd-product-card');
  let chosenSize = null;
  let chosenColor = null;

  // The image: the same non-destructive styling as collection entries. A color
  // choice with its own image swaps src; with no choice the entry's main image shows.
  const baseImage = entry.image ?? '';
  let img = null;
  let wrap = null;
  if (baseImage) {
    img = document.createElement('img');
    img.src = baseImage;
    img.loading = 'lazy';
    img.draggable = false;
    wrap = el2('span', 'urd-collection-imgwrap urd-product-image');
    wrap.appendChild(img);
    applyEntryImageStyle(wrap, entry);
    // Secondary image (the first color image): fades in on hover (CSS-first,
    // ADR-0011); gives way when a color choice with its own image is active.
    const alt = altCardImage(entry);
    if (alt) {
      const altImg = document.createElement('img');
      altImg.src = alt;
      altImg.alt = '';
      altImg.loading = 'lazy';
      altImg.draggable = false;
      altImg.className = 'urd-product-image-alt';
      wrap.appendChild(altImg);
    }
    card.appendChild(wrap);
  }
  if (entry.badge) {
    card.appendChild(el2('span', `urd-product-badge${img ? ' urd-product-badge-over' : ''}`, entry.badge));
  }

  const title = richNode('strong', 'urd-product-title', entry, 'title', props.collection, editable);
  if (title) card.appendChild(title);
  const text = richNode('div', 'urd-product-text', entry, 'text', props.collection, editable);
  if (text) card.appendChild(text);
  const price = priceRow(entry, props.currency);
  if (price) card.appendChild(price);

  const sizes = Array.isArray(entry.sizes) ? entry.sizes.filter(Boolean) : [];
  if (sizes.length) card.appendChild(choiceRow('urd-product-sizes', sizes, (v) => { chosenSize = v; }));

  const colors = Array.isArray(entry.colors) ? entry.colors.filter((c) => c?.name) : [];
  if (colors.length) {
    card.appendChild(choiceRow('urd-product-colors', colors.map((c) => c.name), (name) => {
      chosenColor = name;
      const picked = colors.find((c) => c.name === name);
      if (img) img.src = picked?.image || baseImage;
      wrap?.classList.toggle('urd-product-color-selected', Boolean(picked?.image));
    }));
  }

  card.appendChild(buyButton(entry, props.currency, colors, () => ({ size: chosenSize, color: chosenColor })));

  // Quick view for visitors: the image and the title open the detail view.
  // In the editor clicks belong to editing (click-and-type), so nothing is wired
  // there - nor in the mobile view (the preview flag, never editable).
  if (!preview) {
    for (const target of [wrap, title].filter(Boolean)) {
      target.classList.add('urd-product-opener');
      target.setAttribute('role', 'button');
      target.setAttribute('aria-label', t('shop.quickView'));
      target.tabIndex = 0;
      const open = () => openQuickView(card, entry, props);
      target.addEventListener('click', open);
      target.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          open();
        }
      });
    }
  }
  return card;
}

/** The "+ Product" adder (editor only): asks the editor to add a new product to the collection. */
function adderCard(collection) {
  const btn = el2('button', 'urd-product-adder', ta('canvas.addProduct'));
  btn.type = 'button';
  btn.addEventListener('click', () => {
    post({ type: 'urd-collection-add', collection });
  });
  return btn;
}

function emptyState(el, ctx, message, action) {
  if (!ctx.preview) return;
  const box = el2('div', 'urd-collection-empty', message);
  if (action) box.appendChild(action);
  el.appendChild(box);
}

export const productBlock = {
  version: 1,
  autoGrow: true,
  // Collection consumer: the urd-collections message re-renders only sections
  // with blocks carrying this flag (the scroll position is preserved).
  usesCollections: true,
  // Per-card animation: the block's entrance and pointer effect play per card,
  // not on the block element (render.js skips it; the cards are animated in render).
  animPerCard: true,
  label: 'Product cards',
  labelKey: 'blocks.product',
  defaults: () => ({ collection: null, limit: 0, columns: 0, currency: 'kr' }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{collection: string|null, limit?: number, columns?: number, currency?: string}} props
   * @param {object} ctx Render context
   */
  render(el, props, ctx) {
    const host = el2('div', 'urd-product');
    el.appendChild(host);
    const editable = Boolean(ctx.preview) && ctx.viewport !== 'mobile';
    // The block's own data: shared by the auto-grow (urd-grow) and the animations.
    const block = ctx.section?.blocks?.find((b) => b.id === el.dataset.blockId);

    if (!props.collection) {
      // With no cards the animation fields play on the block element, as on
      // other blocks, so the choice in Properties is never inert.
      if (block) renderCardAnimations(el, [el], block, ctx);
      adminLocaleReady.then(() => {
        if (host.isConnected) emptyState(el, ctx, ta('canvas.productEmpty'));
      });
      return;
    }

    getCollection(props.collection).then((data) => {
      // The block may have been re-rendered or removed while the data was fetched.
      if (!host.isConnected) return;

      // Auto-grow: the cards are dynamic content, the frame follows them (as in
      // the collection block). Called again when the adder card is added, so its
      // row is measured too.
      const fit = () => {
        const needed = host.scrollHeight;
        if (Math.abs(needed - el.clientHeight) > 8 && ctx.viewport !== 'mobile') {
          el.style.height = `${needed}px`;
          const sectionEl = el.closest('.urd-section');
          if (sectionEl) growSectionTo(sectionEl, el.offsetTop + needed + 24);
          if (ctx.preview) {
            if (block && block.frames.desktop.h !== needed) {
              block.frames.desktop = { ...block.frames.desktop, h: needed };
              // ONLY the height is posted (urd-grow), never the whole frame.
              post({ type: 'urd-grow', sectionId: ctx.section.id, blockId: el.dataset.blockId, h: needed });
            }
          }
        }
      };

      const all = Array.isArray(data?.entries) ? data.entries : [];
      let entries = all;
      if (props.limit > 0) entries = entries.slice(0, props.limit);
      if (!entries.length) {
        if (block) renderCardAnimations(el, [el], block, ctx);
        adminLocaleReady.then(() => {
          if (!host.isConnected) return;
          emptyState(el, ctx, ta('canvas.productNoEntries', { name: data?.name ?? props.collection }),
            editable ? adderCard(props.collection) : null);
        });
        return;
      }
      const grid = el2('div', 'urd-product-cardlist');
      const columns = Math.min(6, Math.max(0, Number(props.columns) || 0));
      if (columns) grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
      const cards = entries.map((entry) => renderCard(entry, props, editable, Boolean(ctx.preview)));
      grid.append(...cards);
      host.appendChild(grid);
      fit();

      // Per-card animation (animPerCard): the block's entrance animation plays
      // per card with a staggered start, and the pointer effect lifts card by card.
      if (block) renderCardAnimations(el, cards, block, ctx);

      if (editable) {
        Promise.all([import('../hint.js'), adminLocaleReady]).then(([{ attachHint }]) => {
          if (!el.isConnected) return;
          // The adder only when the grid is not truncated by limit: a new entry
          // would otherwise fall outside the view and the click would look dead.
          if (!(props.limit > 0 && all.length >= props.limit)) {
            grid.appendChild(adderCard(props.collection));
            fit();
          }
          // The help chip (ADR-0008): the catalog lives in the Collections panel.
          if (el.querySelector('.urd-hint-chip')) return;
          attachHint(el, {
            title: ta('hintProduct.title'),
            lines: [ta('hintProduct.l1'), ta('hintProduct.l2'), ta('hintProduct.l3'), ta('hintProduct.l4')],
          });
        });
      }
    });
  },
};
