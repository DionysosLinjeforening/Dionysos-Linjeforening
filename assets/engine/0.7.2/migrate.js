/**
 * Stepwise version lifting - Urd's core invariant (see docs/adr/0005).
 *
 * All data (blocks, background layers, animations, sections) carries
 * `version`, and every type definition states `version` + `migrations`
 * where migrations[n] lifts exactly v(n) → v(n+1) as a pure function
 * (props in, props out).
 *
 * Lifting happens in memory at load time - the files on disk are written
 * only at the next publish. On an unknown type or a missing migration,
 * data is NEVER dropped: the entry is marked as a placeholder and the
 * original is kept.
 */

/**
 * Lifts one data entry to the definition's current version.
 *
 * @param {{type?: string, version: number, props: object}} data
 *   Entry from a content file (not mutated).
 * @param {{version: number, migrations?: Record<number, (props: object) => object>}|undefined} def
 *   Type definition from the registry, or undefined if the type is unknown.
 * @returns {{ok: boolean, version: number, props: object, placeholder?: string}}
 *   ok=true with lifted props, or ok=false with a `placeholder` reason and
 *   the original props untouched ('unknown-type' | 'missing-migration' | 'newer-than-engine').
 */
export function lift(data, def) {
  if (!def) {
    return { ok: false, version: data.version, props: data.props, placeholder: 'unknown-type' };
  }
  // A missing/invalid version (hand-edited or truncated data) is treated
  // as v1, never as current: without this the while loop skips all the
  // migrations (undefined < n is false) and the old format is read as new.
  const from = Number.isInteger(data.version) ? data.version : 1;
  if (from > def.version) {
    // The content was written by a newer engine - rendered as a
    // placeholder, never misread or downgraded.
    return { ok: false, version: from, props: data.props, placeholder: 'newer-than-engine' };
  }

  let version = from;
  let props = data.props;
  while (version < def.version) {
    const step = def.migrations && def.migrations[version];
    if (typeof step !== 'function') {
      return { ok: false, version: from, props: data.props, placeholder: 'missing-migration' };
    }
    props = step(structuredClone(props));
    version++;
  }
  return { ok: true, version, props };
}

/** Current version of the page file format (content/pages/*.json). */
export const PAGE_SCHEMA_VERSION = 4;

/**
 * The row height of the mobile row grid (ADR-0019), in px. A model
 * constant on par with the breakpoint: never tied to grid.size, which is a
 * snapping tool for desktop.
 */
export const MOBILE_ROW = 8;

/** Vertical spacing between flow blocks in the mobile row grid, in px. */
export const MOBILE_GAP = 16;

/** Current version of the site.json format. */
export const SITE_SCHEMA_VERSION = 3;

/**
 * File-level migrations. Each function lifts exactly one version and
 * receives the whole page file (cloned) + site.json as context.
 */

/** The flow's top padding in the old mobile format: materialization
 *  measured y from the top of the surface, that is including the padding,
 *  so it is subtracted before the row index is computed. */
const V1_FLOW_PAD = 24;

/** attention.reason tokens were Norwegian in v1; data contracts use
 *  English identifiers. */
const V1_REASONS = {
  'oppsett-byttet': 'layout-changed',
  'blokk-endret': 'block-edited',
  'desktop-endret-etter-mobil': 'desktop-changed-after-mobile',
  'seksjonshøyde': 'section-height',
  'blokk-flyttet': 'block-moved',
  'blokk-slettet': 'block-deleted',
  'blokk-lagt-til': 'block-added',
};

/**
 * Lifts a block's frames.mobile from the v1 shape (a full frame
 * {x, y, w, h}) to the row-grid placement (ADR-0019). A placement already
 * in the new shape (without y/h) is returned untouched, and a byte-equal
 * copy of the desktop frame yields null: that was materialization's
 * fallback for blocks outside the flow, never a hand-placed position.
 * Used by the page migration AND by template insertion
 * (templates-model.js), which inserts stored payloads outside the page lift.
 */
export function liftMobileFrame(m, desktop) {
  if (!m || !('y' in m || 'h' in m)) return m ?? null;
  if (desktop && m.x === desktop.x && m.y === desktop.y && m.w === desktop.w && m.h === desktop.h) {
    return null;
  }
  const placement = { x: m.x, w: m.w };
  if (Number.isFinite(m.y)) {
    placement.row = Math.max(1, Math.round((m.y - V1_FLOW_PAD) / MOBILE_ROW) + 1);
    placement.rows = Number.isFinite(m.h) ? Math.max(1, Math.ceil(m.h / MOBILE_ROW)) : 1;
  }
  if (Number.isFinite(m.z) && m.z !== 1) placement.z = m.z;
  if (m.rot) placement.rot = m.rot;
  return placement;
}

/**
 * Core block types were Norwegian before v3; data contracts use English
 * identifiers (ADR-0021). Plugin-owned types (kalender, kart, skjema) are
 * deliberately absent: old plugin folders in user repos keep defining the
 * old ids forever, so those are resolved through registry aliases instead.
 */
export const V2_BLOCK_TYPES = {
  samling: 'collection',
  galleri: 'gallery',
  tidslinje: 'timeline',
  sitat: 'quote',
  statistikk: 'stats',
  tabell: 'table',
  deling: 'share',
  nedteller: 'countdown',
  produkt: 'product',
  handlekurv: 'cart',
  kasse: 'checkout',
};

/** Background layer types renamed in v3 (ADR-0021). */
export const V2_LAYER_TYPES = {
  bildegalleri: 'slideshow',
};

/** Section theme roles renamed in v3 (ADR-0021); see SECTION_THEMES in theme.js. */
export const V2_SECTION_THEMES = {
  flate: 'surface',
  aksent: 'accent',
  invers: 'inverse',
  dus: 'soft',
  dempet: 'muted',
  dyp: 'deep',
  uthevet: 'highlighted',
};

/**
 * Core section preset ids renamed in v4 (ADR-0021). Plugin preset ids
 * (hva-skjer, finn-oss, kontaktskjema) are deliberately absent; they resolve
 * through registry aliases like the plugin block types.
 */
export const V3_PRESET_IDS = {
  tom: 'blank',
  'hero-sentrert': 'hero-centered',
  bilder: 'images',
  galleri: 'gallery',
  kontakt: 'contact',
  funksjonskort: 'feature-cards',
  'funksjonskort-enkel': 'feature-cards-simple',
  nyheter: 'news',
  'nyheter-samling': 'news-collection',
  oppslagstavle: 'noticeboard',
  publikasjonsarkiv: 'publication-archive',
  arrangementer: 'events',
  tidslinje: 'timeline',
  steg: 'steps',
  hovedoppslag: 'lead-story',
  produkter: 'products',
  butikk: 'shop',
  'butikk-hero': 'shop-hero',
  'butikk-kategorier': 'shop-categories',
  'butikk-tillit': 'shop-trust',
  'butikk-utstilling': 'shop-showcase',
  kasse: 'checkout',
  sitat: 'quote',
  statistikk: 'stats',
  sponsorer: 'sponsors',
  medlemskap: 'membership',
};

/**
 * Renames contract tokens (block types, background layer types and section
 * theme roles) in place. Accepts a section-like object ({blocks, background,
 * theme}) or a bare block array. Used by pageMigrations[2] and by template
 * insertion (templates-model), which inserts stored payloads outside the
 * page lift.
 */
export function liftContractTokens(target) {
  const blocks = Array.isArray(target) ? target : target.blocks ?? [];
  for (const block of blocks) {
    if (V2_BLOCK_TYPES[block.type]) block.type = V2_BLOCK_TYPES[block.type];
  }
  if (!Array.isArray(target)) {
    for (const layer of target.background?.layers ?? []) {
      if (V2_LAYER_TYPES[layer.type]) layer.type = V2_LAYER_TYPES[layer.type];
    }
    if (V2_SECTION_THEMES[target.theme]) target.theme = V2_SECTION_THEMES[target.theme];
    if (V3_PRESET_IDS[target.preset]) target.preset = V3_PRESET_IDS[target.preset];
  }
  return target;
}

const pageMigrations = {
  // 1 -> 2 (synced mobile model, ADR-0019): frames.mobile changes shape
  // from a full frame {x,y,w,h} to a partial row-grid placement
  // {x,w,row,rows}, the section mode 'manual' is retired, and decor blocks
  // get the new hideMobile field that takes over mobile hiding. Pre-v1 the
  // visual change (row quantization ±8 px) is accepted (ADR-0005).
  1: (page) => {
    for (const section of page.sections ?? []) {
      const mobile = section.responsive?.mobile;
      for (const block of section.blocks ?? []) {
        if (block.decor) block.hideMobile = true;
        if (block.frames?.mobile) {
          block.frames.mobile = liftMobileFrame(block.frames.mobile, block.frames.desktop);
        }
      }
      if (mobile?.mode === 'manual') mobile.mode = 'auto';
      const reason = mobile?.attention?.reason;
      if (reason && V1_REASONS[reason]) mobile.attention.reason = V1_REASONS[reason];
    }
    return page;
  },
  // 2 -> 3 (ADR-0021): core block and background layer types renamed from
  // Norwegian to English contract identifiers.
  2: (page) => {
    for (const section of page.sections ?? []) liftContractTokens(section);
    return page;
  },
  // 3 -> 4 (ADR-0021): core section preset ids renamed. liftContractTokens
  // covers presets too, so a v2 page gets them in the first step and this
  // step is its no-op second pass; pages written at exactly v3 need it.
  3: (page) => {
    for (const section of page.sections ?? []) liftContractTokens(section);
    return page;
  },
};

const siteMigrations = {
  // 1 -> 2 (bound content width, ADR-0018): the content is bound by a
  // design width instead of following the window width. The default is
  // written in explicitly instead of being derived at read time, so the
  // engine and the editor can never arrive at different values. Pre-v1 the
  // visual change is accepted (ADR-0005).
  1: (site) => ({ ...site, layout: site.layout ?? { contentWidth: 1440, gutter: 6 } }),
  // 2 -> 3: the page gutter changed from pixels to a PERCENTAGE OF THE
  // WINDOW WIDTH. The old value cannot be converted meaningfully (24 px is
  // not a fixed share of anything), so all are set to the default. Pre-v1
  // the small visual change is accepted (ADR-0005).
  2: (site) => ({ ...site, layout: { ...(site.layout ?? { contentWidth: 1440 }), gutter: 6 } }),
};

/**
 * Lifts site.json to the current schemaVersion. Same rules as
 * liftPageFile: stepwise, never destructive, the original is never mutated.
 */
export function liftSiteFile(site) {
  let lifted = structuredClone(site);
  let version = lifted.schemaVersion ?? 1;
  while (version < SITE_SCHEMA_VERSION) {
    const step = siteMigrations[version];
    if (typeof step !== 'function') return site;
    lifted = step(lifted) ?? lifted;
    version++;
    lifted.schemaVersion = version;
  }
  return lifted;
}

/**
 * Lifts a page file to the current schemaVersion. Stepwise and never
 * destructive: if a migration step is missing (or the file is NEWER than
 * the engine), it is returned untouched instead of being misread.
 *
 * @param {object} page Page file, already parsed
 * @param {object} site site.json (context for conversions)
 * @returns {object} Lifted copy (the original is never mutated)
 */
export function liftPageFile(page, site) {
  let lifted = structuredClone(page);
  let version = lifted.schemaVersion ?? 1;
  while (version < PAGE_SCHEMA_VERSION) {
    const step = pageMigrations[version];
    if (typeof step !== 'function') return page;
    lifted = step(lifted, site) ?? lifted;
    version++;
    lifted.schemaVersion = version;
  }
  return lifted;
}
