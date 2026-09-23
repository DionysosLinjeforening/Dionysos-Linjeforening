/**
 * The core section presets: data factories that produce a starting section.
 * A preset is NOT a code path - once created, every section is an equal,
 * generic container (see docs/SCHEMA.md). Plugins can define further presets
 * through the same API.
 *
 * The library is built against the patterns from the site survey (the inspiration sites plus ApeironLF, see docs/BACKLOG.md).
 * Everything is a composition of existing block types with theme colour tokens, so the presets follow the user's palette.
 * `group` and `hint` are optional fields the "+ New section" menu uses for grouping and description.
 * `item`/`itemLabel` are optional factories for repeating elements: the section toolbar then shows a "+ card/row" button.
 */

/** Short, collision-safe id for sections and blocks made in the editor.
 *  crypto.randomUUID exists only in secure contexts (https/localhost); on for instance http://0.0.0.0
 *  (the local test server) crypto.getRandomValues is used, since it works everywhere and anything
 *  minting new ids would otherwise die silently there. */
export function makeId(prefix) {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}-${hex}`;
}

// The seed rule (ADR-0012): ta() is called ONLY inside the factory functions
// (create/item/the block factories), at the moment of insertion - never at
// module level. The module is in the visitor closure and gets bundled; at a
// visitor the factories never run.
import { ta } from '../i18n.js';

const autoMobile = () => ({ mobile: { mode: 'auto', attention: null } });

/* Block factories: every return is a fresh object, because presets are called several times and sections must never share sub-objects. */

const frame = (x, y, w, h, z = 1) => ({ desktop: { x, y, w, h, z, rot: 0 }, mobile: null });

const text = (fr, html, props = {}) => ({
  id: makeId('blk'),
  type: 'text',
  version: 1,
  props: { html, align: 'left', box: false, ...props },
  animation: null,
  frames: fr,
});

const image = (fr, props = {}) => ({
  id: makeId('blk'),
  type: 'image',
  version: 1,
  // Empty src: the image block shows the frame, and the owner swaps the image in Properties.
  // Deliberately no external placeholder URLs (CSP).
  props: { src: '', alt: ta('seed.imageAlt'), fit: 'cover', radius: 'md', href: null, ...props },
  animation: null,
  frames: fr,
});

const button = (fr, label, props = {}) => ({
  id: makeId('blk'),
  type: 'button',
  version: 1,
  props: { label, page: null, href: '#', style: 'primary', ...props },
  animation: null,
  frames: fr,
});

const icon = (fr, glyph, size = 40) => ({
  id: makeId('blk'),
  type: 'icon',
  version: 1,
  props: { glyph, color: 'accent', size },
  animation: null,
  frames: fr,
});

const hoverLift = () => ({ type: 'hover-lift', version: 1, props: {} });

/* Collection block (ADR-0007): collection is set by the owner in Properties; null gives a guiding empty state. */
const collection = (fr, view, props = {}) => ({
  id: makeId('blk'),
  type: 'collection',
  version: 1,
  props: { collection: null, view, limit: 6, newestFirst: true, ...props },
  animation: null,
  frames: fr,
});

/* The shop blocks: product cards from a product collection plus a basket.
   collection is set by the owner in Properties (as in the collection block). */
const product = (fr, props = {}) => ({
  id: makeId('blk'),
  type: 'product',
  version: 1,
  props: { collection: null, limit: 0, columns: 0, currency: 'kr', ...props },
  animation: null,
  frames: fr,
});

const cart = (fr, props = {}) => ({
  id: makeId('blk'),
  type: 'cart',
  version: 1,
  props: { variant: 'button', href: '', currency: 'kr', ...props },
  animation: null,
  frames: fr,
});

const checkout = (fr, props = {}) => ({
  id: makeId('blk'),
  type: 'checkout',
  version: 1,
  props: { recipient: '', endpoint: '', vipps: '', currency: 'kr', ...props },
  animation: null,
  frames: fr,
});

/* Gallery block: the images are added by the owner in Properties (multi-select). */
const gallery = (fr, props = {}) => ({
  id: makeId('blk'),
  type: 'gallery',
  version: 1,
  props: { images: [], view: 'grid', columns: 3, gap: 12, radius: 'md', lightbox: true, interval: 5, ...props },
  animation: null,
  frames: fr,
});

/* FAQ block: the question list is edited in Properties and straight in the preview. */
const faq = (fr, items) => ({
  id: makeId('blk'),
  type: 'faq',
  version: 1,
  props: { items, multi: false },
  animation: null,
  frames: fr,
});

/* Quote block: semantic figure/blockquote with attribution. */
const quote = (fr, props = {}) => ({
  id: makeId('blk'),
  type: 'quote',
  version: 1,
  props: { text: '', attribution: '', role: '', variant: 'large', image: '', accent: null, ...props },
  animation: null,
  frames: fr,
});

/* Timeline block: events along a drawn line. */
const timeline = (fr, items) => ({
  id: makeId('blk'),
  type: 'timeline',
  version: 1,
  props: { items, variant: 'left', marker: 'filled', accent: null },
  animation: null,
  frames: fr,
});

/* Statistics block: one key figure with a label and count-up. */
const stats = (fr, props = {}) => ({
  id: makeId('blk'),
  type: 'stats',
  version: 1,
  props: { value: '4800', prefix: '', suffix: '', label: '', countUp: true, ...props },
  animation: null,
  frames: fr,
});

const bg = (...layers) => ({ version: 1, layers });
const colorLayer = (value) => ({ type: 'color', version: 1, props: { value } });
const glowLayer = (x, y, opacity, radius = 0.5) => ({
  type: 'glow', version: 1, props: { x, y, color: 'accent', radius, opacity },
});

/* Extendable presets: item(section) makes the NEXT element (card/row/logo) ready-placed in the first FREE slot (freeSlot below), so the button works even after the owner has deleted or moved elements.
   item can additionally return moves ([{blockId, dy}]) that shift existing blocks, for instance FAQ pushing the closing line down.
   The placement assumes the preset layout; if the owner has rebuilt the section entirely, the new element is still ordinary blocks that can be dragged into place. */
const maxBottom = (sec) => Math.max(0, ...sec.blocks.map((b) => b.frames.desktop.y + b.frames.desktop.h));
const gridSlot = (n, per, x0, dx, y0, dy) => ({ x: x0 + (n % per) * dx, y: y0 + Math.floor(n / per) * dy });

/* Free-slot search: TRIES the slots in order instead of counting elements.
   That refills the hole when the owner has deleted an element in the middle, instead of the counter dropping and the next element landing on top of an existing one.
   yOff/h describe the whole card's footprint around the slot (the icon sitting above the box, for instance). */
const freeSlot = (sec, per, x0, dx, y0, dy, w, h, yOff = 0) => {
  const hits = (r) => sec.blocks.some((b) => {
    const d = b.frames.desktop;
    return d.x < r.x + r.w - 0.01 && r.x < d.x + d.w - 0.01 && d.y < r.y + r.h - 0.01 && r.y < d.y + d.h - 0.01;
  });
  for (let i = 0; i < 60; i++) {
    const slot = gridSlot(i, per, x0, dx, y0, dy);
    if (!hits({ x: slot.x, y: slot.y + yOff, w, h })) return { ...slot, n: i };
  }
  return { x: x0, y: maxBottom(sec) + 16, n: 0 };
};

/* Mobile stacking key: keeps a card's blocks together in the auto stacking (see stackOrder in render.js).
   The key is read on the same scale as desktop y: column 0 sorts first, and the elements within the card keep their relative order. */
const cardOrder = (baseY, col, idx) => baseY + col * 0.1 + idx * 0.01;

const section = (preset, minHeight, background, blocks, grid = null) => ({
  id: makeId('sec'),
  version: 1,
  preset,
  size: { minHeight },
  grid,
  background,
  blocks,
  responsive: autoMobile(),
});

export function registerSectionPresets(Urd) {
  /* ---------- Basics ---------- */

  Urd.sections.define('blank', {
    label: 'Empty section',
    labelKey: 'preset.blank.label',
    group: 'Basics',
    groupKey: 'presetGroup.basic',
    hint: 'A blank canvas to build on freely',
    hintKey: 'preset.blank.hint',
    create: () => section('blank', '40vh', bg(colorLayer('bg')), []),
  });

  Urd.sections.define('hero', {
    label: 'Hero',
    labelKey: 'preset.hero.label',
    group: 'Basics',
    groupKey: 'presetGroup.basic',
    hint: 'Large opening with gradient and glow, left-aligned',
    hintKey: 'preset.hero.hint',
    create: () => section('hero', '70vh', {
      version: 1,
      layers: [
        { type: 'gradient', version: 1, props: { stops: ['#0b0e14', '#1a1030'], angle: 160, animate: false } },
        glowLayer(0.7, 0.2, 0.35),
        { type: 'grain', version: 1, props: { opacity: 0.06 } },
      ],
    }, [
      text(frame(8.33, 40, 50, 38), ta('seed.hero.title')),
      text(frame(8.33, 84, 41.67, 26), ta('seed.hero.intro')),
      button(frame(8.33, 118, 20, 32), ta('seed.readMore')),
    ]),
  });

  Urd.sections.define('hero-centered', {
    label: 'Hero, centred',
    labelKey: 'preset.hero-centered.label',
    group: 'Basics',
    groupKey: 'presetGroup.basic',
    hint: 'Centred opening with two buttons',
    hintKey: 'preset.hero-centered.hint',
    create: () => section('hero-centered', '60vh', bg(colorLayer('bg')), [
      text(frame(15, 64, 70, 44), ta('seed.heroCenter.title'), { align: 'center' }),
      text(frame(25, 116, 50, 26), ta('seed.heroCenter.intro'), { align: 'center' }),
      button(frame(31.5, 160, 17, 40), ta('seed.join')),
      button(frame(51.5, 160, 17, 40), ta('seed.readMore'), { style: 'secondary' }),
    ]),
  });

  Urd.sections.define('images', {
    label: 'Images',
    labelKey: 'preset.images.label',
    group: 'Basics',
    groupKey: 'presetGroup.basic',
    hint: 'Title and three image frames',
    hintKey: 'preset.images.hint',
    create: () => section('images', '360px', bg(colorLayer('bg')), [
      text(frame(4, 24, 50, 32), ta('seed.images.title')),
      image(frame(4, 72, 28, 220)),
      image(frame(36, 72, 28, 220)),
      image(frame(68, 72, 28, 220)),
    ]),
    itemLabel: 'image',
    itemLabelKey: 'item.image',
    item: (sec) => {
      const { x, y } = freeSlot(sec, 3, 4, 32, 72, 244, 28, 220);
      return { blocks: [image(frame(x, y, 28, 220))], bottom: y + 244 };
    },
  });

  Urd.sections.define('gallery', {
    label: 'Gallery',
    labelKey: 'preset.gallery.label',
    group: 'Basics',
    groupKey: 'presetGroup.basic',
    hint: 'Image gallery in a grid with full-screen view (lightbox)',
    hintKey: 'preset.gallery.hint',
    create: () => section('gallery', '440px', bg(colorLayer('bg')), [
      text(frame(4, 24, 50, 32), ta('seed.gallery.title')),
      gallery(frame(4, 72, 92, 320)),
    ]),
  });

  Urd.sections.define('contact', {
    label: 'Contact',
    labelKey: 'preset.contact.label',
    group: 'Basics',
    groupKey: 'presetGroup.basic',
    hint: 'Contact details in a card with an email button',
    hintKey: 'preset.contact.hint',
    create: () => section('contact', '320px', bg(colorLayer('surface'), glowLayer(0.2, 0.8, 0.2)), [
      text(frame(10, 32, 40, 36), ta('seed.contact.title')),
      text(frame(10, 84, 36, 130),
        ta('seed.contact.info'),
        { box: true }),
      button(frame(60, 100, 22, 40), ta('seed.contact.button'), { href: `mailto:${ta('seed.email')}` }),
    ]),
  });

  /* No "Footer" section preset: the shared footer lives in the Footer panel
     (site.footer), not as a section per page. */

  /* ---------- Cards and lists ---------- */

  Urd.sections.define('feature-cards', {
    label: 'Feature cards',
    labelKey: 'preset.feature-cards.label',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'Three cards with icon, title and text',
    hintKey: 'preset.feature-cards.hint',
    create: () => {
      const card = (x, col, glyph, title) => {
        const ic = icon(frame(x + 10.5, 88, 4, 52), glyph);
        const box = text(frame(x, 152, 25, 200),
          ta('seed.features.card', { title }),
          { align: 'center', box: true });
        box.animation = hoverLift();
        ic.mobileOrder = cardOrder(88, col, 0);
        box.mobileOrder = cardOrder(88, col, 1);
        return [ic, box];
      };
      return section('feature-cards', '420px', bg(colorLayer('bg')), [
        text(frame(6, 28, 60, 38), ta('seed.features.title')),
        ...card(6, 0, '✦', ta('seed.features.card1')),
        ...card(37.5, 1, '★', ta('seed.features.card2')),
        ...card(69, 2, '✓', ta('seed.features.card3')),
      ]);
    },
    itemLabel: 'card',
    itemLabelKey: 'item.card',
    item: (sec) => {
      const { x, y, n } = freeSlot(sec, 3, 6, 31.5, 152, 296, 25, 264, -64);
      const ic = icon(frame(x + 10.5, y - 64, 4, 52), '✦');
      const box = text(frame(x, y, 25, 200),
        ta('seed.features.card', { title: ta('seed.features.newTitle') }),
        { align: 'center', box: true });
      box.animation = hoverLift();
      ic.mobileOrder = cardOrder(88, n, 0);
      box.mobileOrder = cardOrder(88, n, 1);
      return { blocks: [ic, box], bottom: y + 228 };
    },
  });

  Urd.sections.define('feature-cards-simple', {
    label: 'Feature cards without icons',
    labelKey: 'preset.feature-cards-simple.label',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'Three cards with title and text (without the icons above)',
    hintKey: 'preset.feature-cards-simple.hint',
    create: () => {
      const card = (x, col, title) => {
        const box = text(frame(x, 88, 25, 200),
          ta('seed.features.card', { title }),
          { align: 'center', box: true });
        box.animation = hoverLift();
        box.mobileOrder = cardOrder(88, col, 0);
        return box;
      };
      return section('feature-cards-simple', '360px', bg(colorLayer('bg')), [
        text(frame(6, 28, 60, 38), ta('seed.features.title')),
        card(6, 0, ta('seed.features.card1')),
        card(37.5, 1, ta('seed.features.card2')),
        card(69, 2, ta('seed.features.card3')),
      ]);
    },
    itemLabel: 'card',
    itemLabelKey: 'item.card',
    item: (sec) => {
      const { x, y, n } = freeSlot(sec, 3, 6, 31.5, 88, 232, 25, 200);
      const box = text(frame(x, y, 25, 200),
        ta('seed.features.card', { title: ta('seed.features.newTitle') }),
        { align: 'center', box: true });
      box.animation = hoverLift();
      box.mobileOrder = cardOrder(88, n, 0);
      return { blocks: [box], bottom: y + 228 };
    },
  });

  Urd.sections.define('news', {
    label: 'News',
    labelKey: 'preset.news.label',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'Three news cards with image, tag and date',
    hintKey: 'preset.news.hint',
    create: () => {
      const card = (x, col) => {
        const img = image(frame(x, 88, 25, 160));
        const txt = text(frame(x, 256, 25, 160),
          ta('seed.news.card'));
        img.mobileOrder = cardOrder(88, col, 0);
        txt.mobileOrder = cardOrder(88, col, 1);
        return [img, txt];
      };
      return section('news', '460px', bg(colorLayer('bg')), [
        text(frame(6, 28, 50, 38), ta('seed.news.title')),
        button(frame(78, 30, 16, 36), ta('seed.news.seeAll'), { style: 'secondary' }),
        ...card(6, 0), ...card(37.5, 1), ...card(69, 2),
      ]);
    },
    itemLabel: 'story',
    itemLabelKey: 'item.story',
    item: (sec) => {
      const { x, y, n } = freeSlot(sec, 3, 6, 31.5, 88, 344, 25, 328);
      const img = image(frame(x, y, 25, 160));
      const txt = text(frame(x, y + 168, 25, 160),
        ta('seed.news.card'));
      img.mobileOrder = cardOrder(88, n, 0);
      txt.mobileOrder = cardOrder(88, n, 1);
      return { blocks: [img, txt], bottom: y + 352 };
    },
  });

  Urd.sections.define('news-collection', {
    label: 'News (collection)',
    labelKey: 'preset.news-collection.label',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'News cards from a collection: write entries, the cards follow',
    hintKey: 'preset.news-collection.hint',
    create: () => section('news-collection', '300px', bg(colorLayer('bg')), [
      text(frame(6, 28, 50, 38), ta('seed.news.title')),
      collection(frame(6, 88, 88, 180), 'cards'),
    ]),
  });

  Urd.sections.define('noticeboard', {
    label: 'Noticeboard',
    labelKey: 'preset.noticeboard.label',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'Dated list from a collection (notices/announcements)',
    hintKey: 'preset.noticeboard.hint',
    create: () => section('noticeboard', '300px', bg(colorLayer('surface')), [
      text(frame(6, 28, 50, 38), ta('seed.noticeboard.title')),
      collection(frame(6, 88, 88, 180), 'list', { limit: 8 }),
    ]),
  });

  Urd.sections.define('publication-archive', {
    label: 'Publication archive',
    labelKey: 'preset.publication-archive.label',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'Year-grouped archive from a collection (issues, minutes, reports)',
    hintKey: 'preset.publication-archive.hint',
    create: () => section('publication-archive', '300px', bg(colorLayer('bg')), [
      text(frame(6, 28, 60, 38), ta('seed.archive.title')),
      collection(frame(6, 88, 88, 180), 'archive', { limit: 0 }),
    ]),
  });

  Urd.sections.define('events', {
    label: 'Events',
    labelKey: 'preset.events.label',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'Three rows with date badge and sign-up button',
    hintKey: 'preset.events.hint',
    create: () => {
      const row = (y, day, month, title) => [
        text(frame(6, y, 8, 88), ta('seed.events.dateBadge', { day, month }), { align: 'center', box: true }),
        text(frame(16, y, 58, 88), ta('seed.events.row', { title })),
        button(frame(78, y + 24, 16, 40), ta('seed.events.signup'), { style: 'secondary' }),
      ];
      return section('events', '440px', bg(colorLayer('surface')), [
        text(frame(6, 28, 50, 38), ta('seed.events.title')),
        ...row(88, '11', ta('seed.events.monthAug'), ta('seed.events.row1')),
        ...row(196, '25', ta('seed.events.monthAug'), ta('seed.events.row2')),
        ...row(304, '8', ta('seed.events.monthSep'), ta('seed.events.row3')),
      ]);
    },
    itemLabel: 'row',
    itemLabelKey: 'item.row',
    item: (sec) => {
      const y = maxBottom(sec) + 16;
      return {
        blocks: [
          text(frame(6, y, 8, 88), ta('seed.events.newBadge'), { align: 'center', box: true }),
          text(frame(16, y, 58, 88), ta('seed.events.row', { title: ta('seed.events.newTitle') })),
          button(frame(78, y + 24, 16, 40), ta('seed.events.signup'), { style: 'secondary' }),
        ],
        bottom: y + 116,
      };
    },
  });

  Urd.sections.define('team', {
    label: 'Team/board',
    labelKey: 'preset.team.label',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'Portraits with name, role and email',
    hintKey: 'preset.team.hint',
    create: () => {
      const member = (x, col, role) => {
        const img = image(frame(x, 80, 22, 180), { alt: ta('seed.team.alt') });
        const txt = text(frame(x, 268, 22, 84),
          ta('seed.team.member', { role }),
          { align: 'center' });
        img.mobileOrder = cardOrder(80, col, 0);
        txt.mobileOrder = cardOrder(80, col, 1);
        return [img, txt];
      };
      return section('team', '420px', bg(colorLayer('surface')), [
        text(frame(6, 24, 50, 32), ta('seed.team.title')),
        ...member(7.5, 0, ta('seed.team.role1')), ...member(39, 1, ta('seed.team.role2')), ...member(70.5, 2, ta('seed.team.role3')),
      ]);
    },
    itemLabel: 'person',
    itemLabelKey: 'item.person',
    item: (sec) => {
      const { x, y, n } = freeSlot(sec, 3, 7.5, 31.5, 80, 288, 22, 272);
      const img = image(frame(x, y, 22, 180), { alt: ta('seed.team.alt') });
      const txt = text(frame(x, y + 188, 22, 84),
        ta('seed.team.member', { role: ta('seed.team.roleNew') }),
        { align: 'center' });
      img.mobileOrder = cardOrder(80, n, 0);
      txt.mobileOrder = cardOrder(80, n, 1);
      return { blocks: [img, txt], bottom: y + 296 };
    },
  });

  Urd.sections.define('faq', {
    label: 'FAQ',
    labelKey: 'preset.faq.label',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'Questions and answers in cards',
    hintKey: 'preset.faq.hint',
    // Uses the faq block rather than a text-box imitation. New questions are
    // added in Properties or straight in the preview, so the preset needs no
    // item button.
    create: () => section('faq', '520px', bg(colorLayer('bg')), [
      text(frame(25, 24, 50, 36), ta('seed.faq.title'), { align: 'center' }),
      faq(frame(20, 80, 60, 320), [
        { q: ta('seed.faq.q1'), a: ta('seed.faq.answer') },
        { q: ta('seed.faq.q2'), a: ta('seed.faq.answer') },
        { q: ta('seed.faq.q3'), a: ta('seed.faq.answer') },
      ]),
      text(frame(20, 416, 60, 32),
        ta('seed.faq.more'),
        { align: 'center' }),
    ]),
  });

  Urd.sections.define('timeline', {
    label: 'Timeline',
    labelKey: 'preset.timeline.label',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'Your story as events along a line',
    hintKey: 'preset.timeline.hint',
    create: () => section('timeline', '480px', bg(colorLayer('bg')), [
      text(frame(25, 24, 50, 36), ta('seed.timeline.title'), { align: 'center' }),
      timeline(frame(25, 88, 50, 330), [
        { year: '2019', title: ta('seed.timeline.t1'), text: ta('seed.timeline.text') },
        { year: '2022', title: ta('seed.timeline.t2'), text: ta('seed.timeline.text') },
        { year: '2026', title: ta('seed.timeline.t3'), text: ta('seed.timeline.text') },
      ]),
    ]),
  });

  Urd.sections.define('steps', {
    label: 'Step by step',
    labelKey: 'preset.steps.label',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'Three numbered cards',
    hintKey: 'preset.steps.hint',
    create: () => {
      const step = (x, col, title) => {
        const num = text(frame(x, 88, 25, 72), `<h3>${col + 1}</h3>`, { align: 'center', size: 44 });
        const box = text(frame(x, 168, 25, 160),
          ta('seed.steps.card', { title }),
          { align: 'center', box: true });
        num.mobileOrder = cardOrder(88, col, 0);
        box.mobileOrder = cardOrder(88, col, 1);
        return [num, box];
      };
      return section('steps', '400px', bg(colorLayer('bg')), [
        text(frame(6, 28, 60, 38), ta('seed.steps.title')),
        ...step(6, 0, ta('seed.steps.s1')),
        ...step(37.5, 1, ta('seed.steps.s2')),
        ...step(69, 2, ta('seed.steps.s3')),
      ]);
    },
    itemLabel: 'step',
    itemLabelKey: 'item.step',
    item: (sec) => {
      const { x, y, n } = freeSlot(sec, 3, 6, 31.5, 88, 272, 25, 240);
      const num = text(frame(x, y, 25, 72), `<h3>${n + 1}</h3>`, { align: 'center', size: 44 });
      const box = text(frame(x, y + 80, 25, 160),
        ta('seed.steps.card', { title: ta('seed.steps.newTitle') }),
        { align: 'center', box: true });
      num.mobileOrder = cardOrder(88, n, 0);
      box.mobileOrder = cardOrder(88, n, 1);
      return { blocks: [num, box], bottom: y + 268 };
    },
  });

  Urd.sections.define('lead-story', {
    label: 'Lead story',
    labelKey: 'preset.lead-story.label',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'One big story and two small beside it',
    hintKey: 'preset.lead-story.hint',
    create: () => {
      // mobileOrder keeps the lead story together (image, intro, button) ahead of the small items in the mobile stacking.
      const blocks = [
        image(frame(6, 40, 55, 300)),
        text(frame(6, 348, 55, 108), ta('seed.feature.main')),
        button(frame(6, 464, 14, 38), ta('seed.readMore'), { style: 'secondary' }),
        image(frame(66, 40, 28, 120)),
        text(frame(66, 164, 28, 60), ta('seed.feature.small1')),
        image(frame(66, 244, 28, 120)),
        text(frame(66, 368, 28, 60), ta('seed.feature.small2')),
      ];
      blocks.forEach((block, i) => { block.mobileOrder = cardOrder(40, i < 3 ? 0 : 1, i); });
      return section('lead-story', '540px', bg(colorLayer('bg')), blocks);
    },
  });

  Urd.sections.define('products', {
    label: 'Products',
    labelKey: 'preset.products.label',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'Three hand-built product cards with their own buy link; the Shop preset gives real products with a basket',
    hintKey: 'preset.products.hint',
    create: () => {
      const productCard = (x, col, name, price) => {
        const blocks = [
          image(frame(x, 88, 25, 200)),
          text(frame(x, 296, 25, 76), ta('seed.products.card', { name, price }), { align: 'center' }),
          button(frame(x + 5, 380, 15, 40), ta('seed.products.buy')),
        ];
        blocks.forEach((block, i) => { block.mobileOrder = cardOrder(88, col, i); });
        return blocks;
      };
      return section('products', '470px', bg(colorLayer('bg')), [
        text(frame(6, 28, 50, 38), ta('seed.products.title')),
        ...productCard(6, 0, ta('seed.products.name'), ta('seed.products.price1')),
        ...productCard(37.5, 1, ta('seed.products.name'), ta('seed.products.price2')),
        ...productCard(69, 2, ta('seed.products.name'), ta('seed.products.price3')),
      ]);
    },
    itemLabel: 'product',
    itemLabelKey: 'item.product',
    item: (sec) => {
      const { x, y, n } = freeSlot(sec, 3, 6, 31.5, 88, 348, 25, 332);
      const blocks = [
        image(frame(x, y, 25, 200)),
        text(frame(x, y + 208, 25, 76), ta('seed.products.card', { name: ta('seed.products.name'), price: ta('seed.products.price1') }), { align: 'center' }),
        button(frame(x + 5, y + 292, 15, 40), ta('seed.products.buy')),
      ];
      blocks.forEach((block, i) => { block.mobileOrder = cardOrder(88, n, i); });
      return { blocks, bottom: y + 356 };
    },
  });

  /* ---------- Shop ---------- */

  Urd.sections.define('shop', {
    label: 'Shop',
    labelKey: 'preset.shop.label',
    group: 'Shop',
    groupKey: 'presetGroup.shop',
    hint: 'Real product cards from a product collection, with a basket',
    hintKey: 'preset.shop.hint',
    // The basket sits below the chrome band (y 88), so its block toolbar
    // never ends up behind the sticky section toolbar.
    create: () => section('shop', '544px', bg(colorLayer('bg')), [
      text(frame(6, 28, 50, 38), ta('seed.shop.title')),
      cart(frame(78, 88, 16, 48)),
      product(frame(6, 176, 88, 320)),
    ]),
  });

  Urd.sections.define('shop-hero', {
    label: 'Shop hero',
    labelKey: 'preset.shop-hero.label',
    group: 'Shop',
    groupKey: 'presetGroup.shop',
    hint: 'Campaign band: big heading, subtext, CTA and a campaign image',
    hintKey: 'preset.shop-hero.hint',
    create: () => {
      const blocks = [
        text(frame(6, 48, 52, 96), ta('seed.shopHero.title')),
        text(frame(6, 152, 40, 48), ta('seed.shopHero.sub')),
        button(frame(6, 216, 17, 42), ta('seed.shopHero.cta')),
        image(frame(62, 40, 32, 300)),
      ];
      blocks.forEach((b, i) => { b.mobileOrder = cardOrder(48, i < 3 ? 0 : 1, i); });
      return section('shop-hero', '400px', { version: 1, layers: [
        colorLayer('bg'),
        glowLayer(0.8, 0.25, 0.28, 0.6),
        { type: 'grain', version: 1, props: { opacity: 0.05 } },
      ] }, blocks);
    },
  });

  Urd.sections.define('shop-categories', {
    label: 'Shop categories',
    labelKey: 'preset.shop-categories.label',
    group: 'Shop',
    groupKey: 'presetGroup.shop',
    hint: 'Four category tiles with image and name; set the link on the image in Properties',
    hintKey: 'preset.shop-categories.hint',
    create: () => {
      const tile = (x, col, name) => {
        const img = image(frame(x, 88, 21, 170));
        const label = text(frame(x, 266, 21, 34), ta('seed.shopCategories.tile', { name }), { align: 'center' });
        img.mobileOrder = cardOrder(88, col, 0);
        label.mobileOrder = cardOrder(88, col, 1);
        return [img, label];
      };
      const sec = section('shop-categories', '360px', bg(colorLayer('bg')), [
        text(frame(6, 28, 60, 38), ta('seed.shopCategories.title')),
        ...tile(6, 0, ta('seed.shopCategories.cat1')),
        ...tile(29.5, 1, ta('seed.shopCategories.cat2')),
        ...tile(53, 2, ta('seed.shopCategories.cat3')),
        ...tile(76.5, 3, ta('seed.shopCategories.cat4')),
      ]);
      sec.theme = 'soft';
      return sec;
    },
    itemLabel: 'category',
    itemLabelKey: 'item.category',
    item: (sec) => {
      const { x, y, n } = freeSlot(sec, 4, 6, 23.5, 88, 220, 21, 212);
      const img = image(frame(x, y, 21, 170));
      const label = text(frame(x, y + 178, 21, 34), ta('seed.shopCategories.tile', { name: ta('seed.shopCategories.newCat') }), { align: 'center' });
      img.mobileOrder = cardOrder(88, n, 0);
      label.mobileOrder = cardOrder(88, n, 1);
      return { blocks: [img, label], bottom: y + 220 };
    },
  });

  Urd.sections.define('shop-trust', {
    label: 'Shop trust',
    labelKey: 'preset.shop-trust.label',
    group: 'Shop',
    groupKey: 'presetGroup.shop',
    hint: 'Three trust points with icon and text (returns, help, safe ordering)',
    hintKey: 'preset.shop-trust.hint',
    create: () => {
      const pair = (x, col, key, glyph) => {
        const ic = icon(frame(x + 10.5, 88, 4, 52), glyph, 44);
        const txt = text(frame(x, 148, 25, 96), ta(key), { align: 'center' });
        ic.mobileOrder = cardOrder(88, col, 0);
        txt.mobileOrder = cardOrder(88, col, 1);
        return [ic, txt];
      };
      const sec = section('shop-trust', '300px', bg(colorLayer('bg')), [
        text(frame(6, 28, 60, 38), ta('seed.shopTrust.title')),
        ...pair(6, 0, 'seed.shopTrust.t1', '✓'),
        ...pair(37.5, 1, 'seed.shopTrust.t2', '↻'),
        ...pair(69, 2, 'seed.shopTrust.t3', '✉'),
      ]);
      sec.theme = 'muted';
      return sec;
    },
    itemLabel: 'card',
    itemLabelKey: 'item.card',
    item: (sec) => {
      const { x, y, n } = freeSlot(sec, 3, 6, 31.5, 148, 216, 25, 156, -60);
      const ic = icon(frame(x + 10.5, y - 60, 4, 52), '✓', 44);
      const txt = text(frame(x, y, 25, 96), ta('seed.shopTrust.newItem'), { align: 'center' });
      ic.mobileOrder = cardOrder(88, n, 0);
      txt.mobileOrder = cardOrder(88, n, 1);
      return { blocks: [ic, txt], bottom: y + 104 };
    },
  });

  Urd.sections.define('shop-showcase', {
    label: 'Shop feature',
    labelKey: 'preset.shop-showcase.label',
    group: 'Shop',
    groupKey: 'presetGroup.shop',
    hint: 'Statement band: big typography, text, CTA and an image on a deep surface',
    hintKey: 'preset.shop-showcase.hint',
    create: () => {
      const blocks = [
        text(frame(6, 56, 52, 100), ta('seed.shopShowcase.title')),
        text(frame(6, 164, 42, 56), ta('seed.shopShowcase.text')),
        button(frame(6, 236, 18, 42), ta('seed.shopShowcase.cta')),
        image(frame(62, 48, 32, 240)),
      ];
      blocks.forEach((b, i) => { b.mobileOrder = cardOrder(56, i < 3 ? 0 : 1, i); });
      const sec = section('shop-showcase', '340px', bg(colorLayer('bg')), blocks);
      sec.theme = 'deep';
      return sec;
    },
  });

  Urd.sections.define('checkout', {
    label: 'Checkout',
    labelKey: 'preset.checkout.label',
    group: 'Shop',
    groupKey: 'presetGroup.shop',
    hint: 'Order form that sends the basket as an email or to an endpoint',
    hintKey: 'preset.checkout.hint',
    create: () => section('checkout', '560px', bg(colorLayer('bg')), [
      text(frame(6, 28, 50, 38), ta('seed.checkout.title')),
      checkout(frame(25, 96, 50, 430)),
    ]),
  });

  /* ---------- Highlight ---------- */

  Urd.sections.define('cta', {
    label: 'CTA banner',
    labelKey: 'preset.cta.label',
    group: 'Highlight',
    groupKey: 'presetGroup.highlight',
    hint: 'Full width with one clear action',
    hintKey: 'preset.cta.hint',
    create: () => section('cta', '280px', bg(colorLayer('surface'), glowLayer(0.5, 0.5, 0.3, 0.7)), [
      text(frame(20, 56, 60, 40), ta('seed.cta.title'), { align: 'center' }),
      text(frame(25, 104, 50, 26), ta('seed.cta.sub'), { align: 'center' }),
      button(frame(42, 148, 16, 42), ta('seed.join')),
    ]),
  });

  Urd.sections.define('quote', {
    label: 'Quote',
    labelKey: 'preset.quote.label',
    group: 'Highlight',
    groupKey: 'presetGroup.highlight',
    hint: 'Large quote with attribution',
    hintKey: 'preset.quote.hint',
    // Uses the quote block (semantic blockquote) rather than two loose text
    // blocks.
    create: () => section('quote', '300px', bg(colorLayer('bg')), [
      quote(frame(20, 56, 60, 190), {
        text: ta('seed.quoteBlock.text'),
        attribution: ta('seed.quoteBlock.name'),
        role: ta('seed.quoteBlock.role'),
      }),
    ]),
  });

  Urd.sections.define('stats', {
    label: 'Statistics',
    labelKey: 'preset.stats.label',
    group: 'Highlight',
    groupKey: 'presetGroup.highlight',
    hint: 'Three big numbers with labels',
    hintKey: 'preset.stats.hint',
    // Uses the statistics block (count-up on entry) rather than two text
    // blocks per number.
    create: () => {
      const stat = (x, col, value, suffix, label) => {
        const s = stats(frame(x, 76, 25, 120), { value, suffix, label });
        s.mobileOrder = cardOrder(76, col, 0);
        return s;
      };
      return section('stats', '260px', bg(colorLayer('surface')), [
        stat(6, 0, '120', '+', ta('seed.stats.l1')),
        stat(37.5, 1, '25', '', ta('seed.stats.l2')),
        stat(69, 2, '1981', '', ta('seed.stats.l3')),
      ]);
    },
    itemLabel: 'number',
    itemLabelKey: 'item.number',
    item: (sec) => {
      const { x, y, n } = freeSlot(sec, 3, 6, 31.5, 76, 140, 25, 120);
      const s = stats(frame(x, y, 25, 120), { value: '42', label: ta('seed.stats.newLabel') });
      s.mobileOrder = cardOrder(76, n, 0);
      return { blocks: [s], bottom: y + 148 };
    },
  });

  Urd.sections.define('sponsors', {
    label: 'Sponsors',
    labelKey: 'preset.sponsors.label',
    group: 'Highlight',
    groupKey: 'presetGroup.highlight',
    hint: 'Greyscale logo row with links',
    hintKey: 'preset.sponsors.hint',
    create: () => {
      // saturate 0 gives greyscale logos (the classic sponsor band).
      // The logo is shown whole (contain) without rounding.
      const logo = (x) => image(frame(x, 108, 18.5, 100),
        { alt: ta('seed.sponsors.alt'), fit: 'contain', radius: null, saturate: 0 });
      return section('sponsors', '280px', bg(colorLayer('bg')), [
        text(frame(6, 28, 60, 36), ta('seed.sponsors.title')),
        logo(5.5), logo(29), logo(52.5), logo(76),
      ]);
    },
    itemLabel: 'logo',
    itemLabelKey: 'item.logo',
    item: (sec) => {
      const { x, y } = freeSlot(sec, 4, 5.5, 23.5, 108, 124, 18.5, 100);
      return {
        blocks: [image(frame(x, y, 18.5, 100),
          { alt: ta('seed.sponsors.alt'), fit: 'contain', radius: null, saturate: 0 })],
        bottom: y + 124,
      };
    },
  });

  Urd.sections.define('membership', {
    label: 'Membership',
    labelKey: 'preset.membership.label',
    group: 'Highlight',
    groupKey: 'presetGroup.highlight',
    hint: 'Price tiers with benefits and a Vipps line',
    hintKey: 'preset.membership.hint',
    create: () => section('membership', '500px', bg(colorLayer('surface')), [
      text(frame(6, 28, 50, 38), ta('seed.membership.title')),
      text(frame(14, 88, 32, 250),
        ta('seed.membership.tier1'),
        { align: 'center', box: true }),
      text(frame(54, 88, 32, 250),
        ta('seed.membership.tier2'),
        { align: 'center', box: true }),
      button(frame(42, 358, 16, 42), ta('seed.join')),
      text(frame(25, 414, 50, 30), ta('seed.membership.vipps'), { align: 'center' }),
    ]),
  });
}
