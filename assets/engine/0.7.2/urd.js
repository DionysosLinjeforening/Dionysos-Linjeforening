/**
 * The Urd engine - entry point.
 *
 * Run by template/index.html. Creates the global Urd object with the
 * registries, registers the core types and plugins, finds the right page in
 * the page register, and renders. All data is version-lifted on load
 * (migrate.js) - see docs/SCHEMA.md.
 *
 * In preview mode (?preview=1) the engine additionally listens for
 * postMessage drafts from the editor and rerenders incrementally.
 */
import { createRegistry } from './registry.js';
import { liftPageFile, liftSiteFile, PAGE_SCHEMA_VERSION } from './migrate.js';
import { applyTheme } from './theme.js';
import { applySiteLayout, renderPage, renderSection } from './render.js';
import { renderNav } from './nav.js';
import { isSafeImage } from './nav-model.js';
import { renderFooter } from './footer.js';
import { textBlock } from './blocks/text.js';
import { imageBlock } from './blocks/image.js';
import { buttonBlock } from './blocks/button.js';
import { shapeBlock } from './blocks/shape.js';
import { videoBlock } from './blocks/video.js';
import { iconBlock } from './blocks/icon.js';
import { collectionBlock } from './blocks/collection.js';
import { galleryBlock } from './blocks/gallery.js';
import { faqBlock } from './blocks/faq.js';
import { timelineBlock } from './blocks/timeline.js';
import { quoteBlock } from './blocks/quote.js';
import { statsBlock } from './blocks/stats.js';
import { tableBlock } from './blocks/table.js';
import { shareBlock } from './blocks/share.js';
import { countdownBlock } from './blocks/countdown.js';
import { audioBlock } from './blocks/audio.js';
import { productBlock } from './blocks/product.js';
import { cartBlock } from './blocks/cart.js';
import { checkoutBlock } from './blocks/checkout.js';
import { colorLayer } from './backgrounds/color.js';
import { gradientLayer } from './backgrounds/gradient.js';
import { glowLayer } from './backgrounds/glow.js';
import { grainLayer } from './backgrounds/grain.js';
import { imageLayer } from './backgrounds/image.js';
import { slideshowLayer } from './backgrounds/slideshow.js';
import { videoLayer } from './backgrounds/video.js';
import { coreAnimations } from './animations/core.js';
import { registerSectionPresets } from './sections/presets.js';
import { loadPlugins, loadPluginList, applyPluginSiteLocales } from './plugins.js';
import { setCollectionsDraft } from './collections.js';
import { initSticky, refreshSticky } from './sticky.js';
import { applyHeadMeta } from './seo.js';
import { readPrefetched, revalidateFile, wirePrefetch, sessionStore } from './prefetch.js';
import { t, ta, initSiteLocale, initAdminLocale, requestedLang, siteLang } from './i18n.js';

export const Urd = {
  blocks: createRegistry('blocks'),
  sections: createRegistry('sections'),
  backgrounds: createRegistry('backgrounds'),
  animations: createRegistry('animations'),
  // Plugin-provided templates (same def shape as the template files: {name,
  // kind, section|blocks}); the section gallery merges kind section into
  // the plugin group.
  templates: createRegistry('templates'),
};

// Legacy alias (ADR-0021): plugins written before the rename register
// through Urd.maler; both names refer to the same registry forever.
Urd.maler = Urd.templates;

// Globally available for plugins (register(Urd)) and the editor's preview bridge.
window.Urd = Urd;

function registerCore() {
  Urd.blocks.define('text', textBlock);
  Urd.blocks.define('image', imageBlock);
  Urd.blocks.define('button', buttonBlock);
  Urd.blocks.define('shape', shapeBlock);
  Urd.blocks.define('video', videoBlock);
  Urd.blocks.define('icon', iconBlock);
  Urd.blocks.define('collection', collectionBlock);
  Urd.blocks.define('gallery', galleryBlock);
  Urd.blocks.define('faq', faqBlock);
  Urd.blocks.define('timeline', timelineBlock);
  Urd.blocks.define('quote', quoteBlock);
  Urd.blocks.define('stats', statsBlock);
  Urd.blocks.define('table', tableBlock);
  Urd.blocks.define('share', shareBlock);
  Urd.blocks.define('countdown', countdownBlock);
  Urd.blocks.define('audio', audioBlock);
  Urd.blocks.define('product', productBlock);
  Urd.blocks.define('cart', cartBlock);
  Urd.blocks.define('checkout', checkoutBlock);
  Urd.backgrounds.define('color', colorLayer);
  Urd.backgrounds.define('gradient', gradientLayer);
  Urd.backgrounds.define('glow', glowLayer);
  Urd.backgrounds.define('grain', grainLayer);
  Urd.backgrounds.define('image', imageLayer);
  Urd.backgrounds.define('slideshow', slideshowLayer);
  Urd.backgrounds.define('video', videoLayer);
  for (const [id, def] of Object.entries(coreAnimations)) Urd.animations.define(id, def);
  registerSectionPresets(Urd);
  // Old plugin contract ids resolve to the renamed reference plugins
  // (ADR-0021): a manually updated plugin folder defines the new ids, while
  // pages built before the rename still carry the old ones. A plugin that
  // still defines the old id wins directly (registry alias semantics).
  Urd.blocks.alias('kalender', 'calendar');
  Urd.blocks.alias('kart', 'map');
  Urd.blocks.alias('skjema', 'form');
  Urd.sections.alias('hva-skjer', 'whats-on');
  Urd.sections.alias('finn-oss', 'find-us');
  Urd.sections.alias('kontaktskjema', 'contact-form');
}

/**
 * The engine version from urd.json: the basis for the plugins' requiresEngine check.
 * An unreachable manifest yields '0.0.0', which rejects the version requirements instead of loading blindly.
 */
async function engineVersion() {
  try {
    return (await (await fetch('/urd.json')).json()).engine ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

/**
 * "To top" arrow: appears at the bottom right after some scrolling.
 */
function mountToTop() {
  const btn = document.createElement('button');
  btn.className = 'urd-totop';
  btn.textContent = '↑';
  btn.title = t('nav.toTop');
  btn.setAttribute('aria-label', t('nav.toTopFull'));
  btn.addEventListener('click', () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  });
  document.body.appendChild(btn);
  const toggle = () => btn.classList.toggle('visible', window.scrollY > 400);
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}

/**
 * Cross-document View Transitions (ADR-0011): nav and footer get a
 * view-transition-name ONLY within the transition window itself (pageswap on
 * departure, pagereveal on arrival), so the page chrome stays put while the
 * content fades. A static name in CSS would make the elements backdrop
 * roots, which disables the menu's backdrop-filter (the blur behind nav) in
 * all normal display. Without cross-document support the events never fire:
 * the names are not set, and the page navigates normally (end state).
 */
function wireViewTransitionNames() {
  const setNames = (on) => {
    for (const id of ['urd-nav', 'urd-footer']) {
      const el = document.getElementById(id);
      if (on) el?.style.setProperty('view-transition-name', id);
      else el?.style.removeProperty('view-transition-name');
    }
  };
  window.addEventListener('pageswap', (event) => {
    if (event.viewTransition) setNames(true);
  });
  window.addEventListener('pagereveal', (event) => {
    // Without a transition (including bfcache revival after an aborted
    // departure) the names must be gone, otherwise the backdrop root stays
    // on and the blur remains off.
    if (!event.viewTransition) { setNames(false); return; }
    setNames(true);
    event.viewTransition.finished.finally(() => setNames(false));
  });
}

/**
 * The site icon (favicon) from site.json: overrides the default icon in
 * index.html. Additive field; without an icon the Urd mark is kept.
 */
function applyFavicon(href) {
  // Only known icon shapes (data:image base64 or a site-relative path);
  // shared guard with the nav logo, the footer logo and the image layers.
  if (!isSafeImage(href)) return;
  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = href;
}

/**
 * Finds the page for the current URL in the page register.
 * ?page=<id> overrides (useful locally, where simple file servers do not
 * route the paths); otherwise location.pathname is matched; the fallback is
 * the first page in the register.
 */
function resolvePage(site) {
  const params = new URLSearchParams(location.search);
  const wanted = params.get('page');
  if (wanted) {
    const byId = site.pages.find((p) => p.id === wanted);
    if (byId) return byId;
  }
  const path = location.pathname.replace(/\/$/, '') || '/';
  return site.pages.find((p) => p.path === path) ?? site.pages[0];
}

/**
 * Attaches postMessage listening and height reporting in preview mode.
 * state = { page, site, viewport } is shared with boot, so breakpoint
 * switches and editor messages always work on the same data.
 */
function enablePreview(state, opts) {
  const root = opts.root;
  const vp = () => ({ preview: true, viewport: state.viewport });

  /* Language switches in the preview are serialized: initSiteLocale can wait
     on the network (pack languages), and a quick switch back must not be
     clobbered by the OLD load finishing last. Each task reads the draft's
     language at RUN time, so the last one in the queue always lands on the
     current choice; langPending says whether something is in flight, so the
     fast path (same language, render synchronously) is never taken while a
     load could undo it. */
  let langQueue = Promise.resolve();
  let langPending = 0;
  const langOutOfSync = () => langPending > 0 || requestedLang(state.site.site?.lang) !== siteLang();
  function syncSiteLocale() {
    langPending++;
    langQueue = langQueue.then(async () => {
      try {
        if (requestedLang(state.site.site?.lang) !== siteLang()) {
          document.documentElement.lang = await initSiteLocale(state.site.site?.lang);
          await applyPluginSiteLocales();
        }
      } finally {
        langPending--;
      }
    });
    return langQueue;
  }
  /** Preserves the scroll position across a full rerender: the document
   *  collapses transiently while the data blocks measure asynchronously, and
   *  the browser otherwise clamps scrollY. Restored after two rAF (after the
   *  regrow layout). */
  const keepScroll = (fn) => {
    const y = window.scrollY;
    fn();
    requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo(0, y)));
  };
  window.addEventListener('message', (event) => {
    if (event.origin !== location.origin) return; // only the editor on the same site
    const msg = event.data;
    if (msg?.type === 'urd-preview' && msg.section) {
      const host = root.querySelector(`[data-section-id="${msg.section.id}"]`);
      if (host) renderSection(msg.section, state.site, host, vp());
      const i = state.page.sections.findIndex((s) => s.id === msg.section.id);
      if (i >= 0) state.page.sections[i] = msg.section;
    } else if (msg?.type === 'urd-preview-full' && msg.page) {
      // Same normalization as boot(): a page without sections must give an
      // empty view, not throw in renderPage (and in findIndex on the next
      // message). The same page (undo/redo and the like) keeps the scroll
      // position; a real page switch naturally starts at the top.
      const samePage = msg.page?.meta?.id === state.page?.meta?.id;
      state.page = msg.page;
      if (!Array.isArray(state.page.sections)) state.page.sections = [];
      const paint = () => renderPage(state.page, state.site, root, vp());
      if (samePage) keepScroll(paint); else paint();
      // Page switch in the editor: the footer can have per-page visibility (hideOn).
      if (opts.footer) renderFooter(state.site, opts.footer, state.page?.meta?.id);
    } else if (msg?.type === 'urd-chrome') {
      // Clean view: hide/show the editing handles (CSS only, see base.css).
      document.body.classList.toggle('urd-chrome-off', !msg.visible);
      // Sticky blocks are only active in Clean view in the editor: pin/release
      // immediately on switch, not first at the next scroll.
      refreshSticky();
    } else if (msg?.type === 'urd-show-grid') {
      // The grid menu in the editor is open: show the grid in all sections.
      window.UrdPreviewEdit?.toggleGridOverlays(msg.visible, state.page, state.site);
    } else if (msg?.type === 'urd-admin-theme' && msg.colors) {
      // The admin color theme: the editor menus in the preview (the block
      // menu, the section gallery) follow admin, not the page being edited.
      // The values are set as separate variables; base.css uses them ONLY on
      // the editor chrome, never on the page's own content.
      for (const key of ['bg', 'surface', 'accent', 'text', 'accent-text']) {
        if (typeof msg.colors[key] === 'string') {
          document.documentElement.style.setProperty(`--urd-admin-${key}`, msg.colors[key]);
        }
      }
    } else if (msg?.type === 'urd-show-guides') {
      // The guide button in the editor: center and width guides on/off.
      window.UrdPreviewEdit?.toggleGuideOverlays(msg.visible);
    } else if (msg?.type === 'urd-place-block' && msg.block) {
      // The palette: find a placement in the middle of the viewport and report back.
      window.UrdPreviewEdit?.placeBlock(msg.block, root);
    } else if (msg?.type === 'urd-demo-anim' && msg.sectionId) {
      // The editor changed an animation: play it once as a demo.
      const host = root.querySelector(`[data-section-id="${msg.sectionId}"]`);
      const el = msg.blockId ? host?.querySelector(`[data-block-id="${msg.blockId}"]`) : host;
      window.UrdPreviewEdit?.demoAnimation(el);
    } else if (msg?.type === 'urd-open-block-config' && msg.blockId) {
      // The plugin block's settings open from Properties: click the hidden
      // config toggle in the block.
      root.querySelector(`[data-block-id="${msg.blockId}"] .urd-cfg-toggle`)?.click();
    } else if (msg?.type === 'urd-attention' && msg.sectionId) {
      // The editor detected desktop drift in an overridden section: mark it live.
      root.querySelector(`[data-section-id="${msg.sectionId}"]`)
        ?.classList.toggle('urd-attention', msg.needed !== false);
    } else if (msg?.type === 'urd-scroll-section' && msg.sectionId) {
      // The attention badge in the top bar: scroll to the section that needs
      // review, so the badge points at a place and not just a mode.
      root.querySelector(`[data-section-id="${msg.sectionId}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (msg?.type === 'urd-collections' && msg.collections) {
      // Collection drafts from the editor: used instead of the server files.
      // Only sections with collection blocks are rerendered: a full
      // renderPage collapses the document transiently (the data blocks
      // measure asynchronously), and the browser then clamps the scroll
      // position to the top.
      setCollectionsDraft(msg.collections);
      const usesCollections = (b) => Boolean(Urd.blocks.get(b.type)?.usesCollections);
      for (const section of state.page.sections ?? []) {
        if (!Array.isArray(section.blocks) || !section.blocks.some(usesCollections)) continue;
        const host = root.querySelector(`[data-section-id="${section.id}"]`);
        if (host) renderSection(section, state.site, host, vp());
      }
    } else if (msg?.type === 'urd-templates') {
      // The template drafts from the editor: shown in the My templates tab in "+ New section".
      window.UrdPreviewEdit?.setTemplates?.(msg.templates);
    } else if (msg?.type === 'urd-insert-template') {
      // The Blocks panel's My templates: insert the block group template into the active section.
      window.UrdPreviewEdit?.insertTemplate?.(msg.id);
    } else if (msg?.type === 'urd-close-menus') {
      // The owner clicked in the admin panels: close open menus (preset gallery, block menu).
      window.UrdPreviewEdit?.closeMenus();
    } else if (msg?.type === 'urd-duplicate') {
      // Ctrl+D with focus in the admin panels: duplicate the selected block in the preview.
      window.UrdPreviewEdit?.duplicateSelected();
    } else if (msg?.type === 'urd-select' && msg.blockId) {
      // The editor built a block itself (the + New block menu): select it.
      window.UrdPreviewEdit?.selectById(msg.blockId);
    } else if (msg?.type === 'urd-plugins') {
      // The editor's plugin draft: load the enabled plugins (the files are
      // already in the repo) and rerender, so plugins work in the preview
      // BEFORE publishing.
      loadPluginList(Urd, state.engine, msg.enabled).then(async () => {
        // The list may have contained a LANGUAGE PACK: if the draft's
        // language was unknown when the site draft arrived (or at boot), it
        // is loaded now.
        if (langOutOfSync()) await syncSiteLocale();
        renderPage(state.page, state.site, root, vp());
        // Report the plugin blocks back (type, label, defaults), so the
        // Blocks panel in admin can show them in its own "From plugins" section.
        const blocks = [];
        for (const type of Urd.blocks.ids()) {
          const def = Urd.blocks.get(type);
          if (!def?.fromPlugin) continue;
          // The admin WINDOW's dictionary never has plugin keys: the labels
          // are resolved HERE (the iframe side, where the plugin dictionary
          // lives) and sent as finished strings. fromPlugin already carries
          // the display name (manifest.names).
          blocks.push({
            type,
            label: def.labelKey ? ta(def.labelKey) : (def.label ?? type),
            version: def.version ?? 1,
            plugin: def.fromPlugin,
            defaults: def.defaults ? def.defaults() : {},
            variants: Array.isArray(def.variants)
              ? def.variants.map((v) => ({ label: v.labelKey ? ta(v.labelKey) : v.label, props: v.props ?? {} }))
              : [],
            // The field contract (additive): a def with `fields` gets its
            // settings rendered directly in the Properties panel instead of
            // a separate config panel. The labels are resolved here for the
            // same reason as above.
            fields: Array.isArray(def.fields)
              ? def.fields.map((f) => ({
                  key: f.key,
                  type: f.type,
                  label: f.labelKey ? ta(f.labelKey) : (f.label ?? f.key),
                  placeholder: f.placeholderKey ? ta(f.placeholderKey) : (f.placeholder ?? ''),
                  ...(f.min !== undefined ? { min: f.min } : {}),
                  ...(f.max !== undefined ? { max: f.max } : {}),
                  ...(f.step !== undefined ? { step: f.step } : {}),
                  ...(Array.isArray(f.options)
                    ? { options: f.options.map((o) => ({ value: o.value, label: o.labelKey ? ta(o.labelKey) : (o.label ?? String(o.value)) })) }
                    : {}),
                }))
              : [],
          });
        }
        window.parent?.postMessage({ type: 'urd-plugin-blocks', blocks }, location.origin);
      });
    } else if (msg?.type === 'urd-zoom') {
      // The canvas is scaled with a transform on the iframe, so EVERYTHING
      // inside shrinks with the zoom, including the editing handles. They
      // should however keep the same screen size as the admin panels, so
      // they are counter-scaled with 1/zoom. Only a CSS variable: no
      // rerender, and visitors never see it.
      const z = Number(msg.scale);
      document.documentElement.style.setProperty(
        '--urd-chrome-scale',
        Number.isFinite(z) && z > 0 ? String(1 / z) : '1',
      );
    } else if (msg?.type === 'urd-viewport' && (msg.mode === 'desktop' || msg.mode === 'mobile')) {
      // The preview follows the editor's view choice, never the iframe width:
      // a narrow admin window must not flip the preview to mobile and hide the structure tools.
      state.viewport = msg.mode;
      document.body.classList.toggle('urd-mobile', state.viewport === 'mobile');
      renderPage(state.page, state.site, root, vp());
    } else if (msg?.type === 'urd-site' && msg.site) {
      // Site draft from the editor (grid, theme, nav): everything that
      // depends on site.json is rerendered. Same truncation guard as in
      // boot(): a draft missing these parts must never throw and freeze the
      // preview.
      state.site = msg.site;
      state.site.site ??= { title: '', lang: 'no' };
      state.site.pages ??= [];
      state.site.theme ??= { version: 1, tokens: {} };
      state.site.nav ??= { version: 1, items: [] };
      const rerender = () => keepScroll(() => {
        applyTheme(state.site.theme);
        applySiteLayout(state.site);
        applyFavicon(state.site.site?.icon);
        if (opts.nav) renderNav(state.site, opts.nav);
        if (opts.footer) renderFooter(state.site, opts.footer, state.page?.meta?.id);
        renderPage(state.page, state.site, root, vp());
      });
      // Changed site.lang in the draft: reload the visitor locale BEFORE the
      // re-render, so the preview is WYSIWYG for the language too (boot read
      // the published site.json and may have a different language). The
      // plugin texts are layered back on inside syncSiteLocale:
      // initSiteLocale builds the dictionary from the engine's nb base,
      // without the plugin keys.
      if (langOutOfSync()) {
        syncSiteLocale().then(rerender);
      } else {
        rerender();
      }
    }
  });

  // Tell the editor the listener is attached: drafts sent before this
  // point would be lost (the iframe load happens before boot finishes).
  window.parent?.postMessage({ type: 'urd-ready' }, location.origin);
}

/**
 * Boots the engine.
 * @param {{root: HTMLElement, nav?: HTMLElement}} opts
 */
export async function boot(opts) {
  registerCore();

  // Start the engine version fetch (urd.json) alongside site.json: they are
  // independent, so they should not sit in a serial queue. Only site.json
  // blocks the page lookup; the engine version is awaited first right
  // before plugin loading.
  const enginePromise = engineVersion();

  // The raw file is kept as migration context: the v1 page lift needs the
  // ORIGINAL grid (columns/rowHeight), which the lifted site has lost. The
  // served text and ETag are kept too: a prerendered or restored page
  // rechecks them against the server (see recheck below).
  const served = { site: null, page: null };
  const siteRes = await fetch('/content/site.json');
  const siteText = await siteRes.text();
  served.site = { text: siteText, etag: siteRes.headers.get('etag') };
  const rawSite = JSON.parse(siteText);
  const site = liftSiteFile(rawSite);
  const preview = new URLSearchParams(location.search).get('preview') === '1';
  // The engine tolerates a truncated site.json: missing parts get empty defaults instead of a crash (the page never dies from bad data).
  site.site ??= { title: '', lang: 'no' };
  site.pages ??= [];
  site.theme ??= { version: 1, tokens: {} };
  site.nav ??= { version: 1, items: [] };
  // The visitor language (ADR-0012): site.lang governs the engine's own
  // texts and date names. Must be loaded BEFORE the first render; the
  // document's lang attribute is set from the same source (the shells
  // hardcode "no" as the pre-JS default).
  document.documentElement.lang = await initSiteLocale(site.site.lang);
  applyTheme(site.theme);
  applySiteLayout(site);
  applyFavicon(site.site.icon);
  // An empty page register (hand-edited site.json) gives an empty page, not a crash.
  const entry = resolvePage(site) ?? { id: 'empty', title: '', file: 'content/pages/missing.json' };
  // A page file parked by the previous page's intent prefetch (prefetch.js)
  // is used as it is and revalidated after the first render; visitors only,
  // the preview receives its pages via postMessage.
  const parked = preview ? null : readPrefetched(entry.file, sessionStore());
  // Otherwise the page file depends only on the register, so its fetch
  // starts here and runs alongside the plugin loading instead of after it:
  // with the engine cached, the serial round trips are what a page switch
  // costs.
  const pagePromise = parked
    ? Promise.resolve(parked)
    : fetch(`/${entry.file}`).then(async (res) => {
        const text = await res.text();
        return { page: JSON.parse(text), text, etag: res.headers.get('etag') };
      });
  // The rejection is consumed here; the failure is handled where the
  // promise is awaited.
  pagePromise.catch(() => {});
  const engine = await enginePromise;
  // In preview the EDITOR owns the plugin list (the draft in plugins.json): boot loads nothing,
  // and the urd-plugins message loads the draft's active plugins so they work before publishing.
  if (!preview) await loadPlugins(Urd, engine);

  if (opts.nav) renderNav(site, opts.nav);
  // Shared footer: its own element right after the main content (index.html
  // is Urd-owned and cannot be changed by publishing, so the element is
  // created here).
  opts.footer = document.createElement('footer');
  opts.footer.id = 'urd-footer';
  opts.root.insertAdjacentElement('afterend', opts.footer);
  mountToTop();
  // Inert in preview (page switches happen via postMessage, never navigation).
  wireViewTransitionNames();

  // Version lifting at file level: older page files are lifted to the
  // current format in memory (disk is written first at the next publish).
  // If the page file is missing (half-finished deploy, hand-edited
  // register), an empty page is shown instead of a crash - the page never
  // dies from bad data.
  let page;
  try {
    const loaded = await pagePromise;
    page = liftPageFile(loaded.page, rawSite);
    served.page = { text: loaded.text, etag: loaded.etag };
  } catch {
    console.warn(`Urd: could not load page file '${entry.file}' - rendering an empty page`);
    page = { schemaVersion: PAGE_SCHEMA_VERSION, meta: { id: entry.id, title: entry.title }, sections: [] };
  }
  if (!Array.isArray(page.sections)) page.sections = [];
  document.title = `${page.meta?.title ?? entry.title ?? ''} - ${site.site.title}`;
  // SEO metadata (description, canonical, og: fields, JSON-LD) is set only
  // for visitors: the preview address (?preview=1) is never a canonical page.
  if (!preview) applyHeadMeta(site, page, location.origin, location.pathname, entry);
  // The footer is rendered now that the page id is known (per-page hideOn visibility).
  renderFooter(site, opts.footer, page.meta?.id ?? entry.id);

  if (preview) {
    // The canvas chrome follows the ADMIN language (two registers,
    // ADR-0012): the dictionary is loaded BEFORE the editing layer, with
    // the same detection as the editor's main.js (shared localStorage,
    // same origin).
    await initAdminLocale();
    // The editing layer is loaded dynamically ONLY in preview - visitors
    // never fetch this code. Must be in place before the first render.
    window.UrdPreviewEdit = await import('./preview-edit.js');
    document.body.classList.add('urd-preview');
  }

  // Responsive: the viewport follows the screen width (also in the
  // editor's preview, where the iframe is narrowed to mobile width). When
  // the breakpoint is crossed, the page is rerendered in the right mode.
  const mq = window.matchMedia(`(max-width: ${site.breakpoints?.mobile ?? 640}px)`);
  // In preview the editor owns the viewport (the urd-viewport message); for visitors it follows the screen width.
  const state = { page, site, engine, viewport: preview ? 'desktop' : (mq.matches ? 'mobile' : 'desktop') };
  document.body.classList.toggle('urd-mobile', state.viewport === 'mobile');

  renderPage(state.page, state.site, opts.root, { preview, viewport: state.viewport });
  // Sticky blocks ("pin on scroll"): one scroll listener for the whole page.
  initSticky();

  if (!preview) {
    mq.addEventListener('change', (event) => {
      state.viewport = event.matches ? 'mobile' : 'desktop';
      document.body.classList.toggle('urd-mobile', state.viewport === 'mobile');
      renderPage(state.page, state.site, opts.root, { preview, viewport: state.viewport });
      refreshSticky();
    });
    // Intent prefetch of the next page (hover, press, focus on internal links).
    wirePrefetch(site);

    // A newer page file rerenders in place. The scroll position survives
    // the rerender (the document collapses transiently while the data
    // blocks measure), and the sticky blocks are re-pinned right away.
    const applyFreshPage = (fresh) => {
      served.page = { text: fresh.text, etag: fresh.etag };
      state.page = liftPageFile(fresh.page, rawSite);
      if (!Array.isArray(state.page.sections)) state.page.sections = [];
      document.title = `${state.page.meta?.title ?? entry.title ?? ''} - ${site.site.title}`;
      applyHeadMeta(site, state.page, location.origin, location.pathname, entry);
      const y = window.scrollY;
      renderPage(state.page, state.site, opts.root, { preview, viewport: state.viewport });
      requestAnimationFrame(() => requestAnimationFrame(() => {
        window.scrollTo(0, y);
        refreshSticky();
      }));
    };
    // The page shown may predate the site as published: a parked copy, a
    // prerendered document, or one restored from the back-forward cache.
    // One check at a time against the server: a changed site.json (the
    // register, nav, theme, layout or language) reloads, a changed page
    // file rerenders, a current copy leaves the page be. Errors are
    // swallowed: the page never dies from a failed check.
    let checking = null;
    let queuedSite = false;
    const recheck = ({ site: checkSite }) => {
      // A site check arriving mid-flight runs after the current one, so the
      // stronger request is never dropped.
      if (checking) { queuedSite ||= checkSite; return checking; }
      checking = (async () => {
        if (checkSite) {
          const freshSite = await revalidateFile('content/site.json', served.site.etag, { text: served.site.text });
          if (freshSite) { location.reload(); return; }
        }
        const fresh = await revalidateFile(entry.file, served.page?.etag ?? null, { text: served.page?.text ?? null });
        if (fresh) applyFreshPage(fresh);
      })().catch(() => {}).finally(() => {
        checking = null;
        if (queuedSite) { queuedSite = false; recheck({ site: true }); }
      });
      return checking;
    };
    // A prerendered document checks at activation, everything else now.
    if (parked && !document.prerendering) recheck({ site: false });
    if (document.prerendering) {
      document.addEventListener('prerenderingchange', () => recheck({ site: true }), { once: true });
    }
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) recheck({ site: true });
    });
  }

  if (preview) enablePreview(state, opts);
}
