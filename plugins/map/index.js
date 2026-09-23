/**
 * The map reference plugin: privacy-friendly OpenStreetMap embedding. The
 * owner pastes in coordinates or an OSM link; the block embeds OSM's official
 * iframe (no tracking, no third-party tiles). It follows the calendar
 * reference: its own CSS in one style tag and a help chip (ADR-0008). The
 * settings are rendered in the Properties panel via the field contract
 * (`fields` on the block definition).
 *
 * CSP (ADR-0006): an iframe towards openstreetmap.org needs a frame-src
 * exception. The manifest declares it, the Plugins panel shows the owner the
 * line, and if CSP blocks the map the block shows the exact _headers line.
 */
import { parseLocation, buildEmbedUrl, buildLargerMapUrl, OSM_HOST } from './osm.js';
// Multilingual (ADR-0012): t() for visitor texts (the site language), ta()
// for the editor chrome and seed text (the admin language). The dictionary
// (locales/) is loaded by the plugin loader BEFORE register() - t/ta are
// never called at module level.
import { t, ta } from '/assets/urd/i18n.js';

const el2 = (tag, className, textContent) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (textContent != null) node.textContent = textContent;
  return node;
};

const post = (msg) => window.parent?.postMessage(msg, location.origin);

/* ---------- Empty state and CSP degradation ---------- */

function emptyState(host, ctx) {
  if (!ctx.preview) return;
  host.appendChild(el2('div', 'urd-map-empty', ta('map.edit.empty')));
}

/**
 * Catches a CSP violation on the iframe (when a host does NOT have
 * OpenStreetMap in frame-src) and replaces the broken iframe with something
 * calm: an explanation in the editor, a link that opens the map for visitors.
 * Urd's default _headers already allows OSM, so this normally never fires.
 */
function watchCspBlock(host, frame, ctx, largerUrl) {
  // Compare the blocked host EXACTLY (a parsed URL), never as a substring:
  // a substring check would also match openstreetmap.org.example.com.
  let blockedHost = null;
  try { blockedHost = new URL(OSM_HOST).hostname; } catch { /* OSM_HOST is a constant, so this cannot happen */ }
  const onViolation = (event) => {
    let violatedHost = null;
    try { violatedHost = new URL(event.blockedURI).hostname; } catch { /* blockedURI can be "inline", "eval" and the like */ }
    if (!(event.violatedDirective?.startsWith('frame-src') && violatedHost && violatedHost === blockedHost)) return;
    document.removeEventListener('securitypolicyviolation', onViolation);
    frame.remove();
    const note = el2('div', 'urd-map-empty');
    if (ctx.preview) {
      note.append(
        el2('strong', null, ta('map.edit.cspBlocked')),
        el2('p', 'urd-map-note', ta('map.edit.cspFix')),
        el2('code', 'urd-map-code', `frame-src ${OSM_HOST}`),
      );
    } else {
      // Visitors get a calm link instead of a broken iframe.
      const a = el2('a', 'urd-map-fallback', t('map.openOsm'));
      a.href = largerUrl;
      a.target = '_blank';
      a.rel = 'noopener';
      note.append(a);
    }
    host.appendChild(note);
  };
  document.addEventListener('securitypolicyviolation', onViolation);
  setTimeout(() => document.removeEventListener('securitypolicyviolation', onViolation), 4000);
}

/* ---------- CSS ---------- */

const MAP_CSS = `
.urd-map { width: 100%; position: relative; display: grid; gap: 6px; }
.urd-map-frame { width: 100%; border: 1px solid color-mix(in srgb, var(--urd-color-text) 15%, transparent);
  border-radius: var(--urd-radius-md); display: block; }
.urd-map-link { font-size: 0.82em; opacity: 0.75; }
.urd-map-link a { color: var(--urd-color-accent); }
.urd-map-empty { padding: 24px; text-align: center; border: 1px dashed color-mix(in srgb, var(--urd-color-text) 30%, transparent);
  border-radius: var(--urd-radius-md); opacity: 0.85; display: grid; gap: 8px; justify-items: center; }
.urd-map-code { font: 12px/1.4 ui-monospace, monospace; padding: 4px 8px; border-radius: 5px;
  background: color-mix(in srgb, var(--urd-color-text) 10%, transparent); }
.urd-map-fallback { color: var(--urd-color-accent); font-weight: 600; }
.urd-map-note { font-size: 11px; opacity: 0.6; margin: 0; }
.urd-map-tools { position: absolute; top: -32px; right: -6px; z-index: 5;
  display: flex; gap: 4px; align-items: center;
  /* An invisible bridge down to the block edge, so hover survives the trip up */
  padding-bottom: 8px; }
.urd-map-tools .urd-hint-chip { position: static; }
`;

function injectCss() {
  if (document.getElementById('urd-map-css')) return;
  const style = document.createElement('style');
  style.id = 'urd-map-css';
  style.textContent = MAP_CSS;
  document.head.appendChild(style);
}

/* ---------- Auto-grow ---------- */

function autoGrow(el, host, ctx) {
  const needed = host.scrollHeight;
  if (Math.abs(needed - el.clientHeight) > 8 && ctx.viewport !== 'mobile') {
    el.style.height = `${needed}px`;
    const sectionEl = el.closest('.urd-section');
    if (sectionEl) {
      const bottom = el.offsetTop + needed + 24;
      // Both sides are content heights: the nav clearance is the section's
      // padding, and the inline min-height is a plain length.
      const current = Number.parseFloat(getComputedStyle(sectionEl).minHeight) || 0;
      if (bottom > current) sectionEl.style.minHeight = `${bottom}px`;
    }
    if (ctx.preview) {
      const block = ctx.section?.blocks?.find((b) => b.id === el.dataset.blockId);
      if (block && block.frames.desktop.h !== needed) {
        block.frames.desktop = { ...block.frames.desktop, h: needed };
        // ONLY the height is posted (urd-grow), never the whole frame: a
        // dragged block would otherwise teleport back to the snapshot's old x/y.
        post({ type: 'urd-grow', sectionId: ctx.section.id, blockId: el.dataset.blockId, h: needed });
      }
    }
  }
}

/* ---------- The block ---------- */

function renderMap(el, props, ctx) {
  injectCss();
  const host = el2('div', 'urd-map');
  el.appendChild(host);

  // Stored coordinates (from an address search or an earlier parse) win;
  // otherwise the location string (coordinates or OSM link) is parsed here.
  const loc = (Number.isFinite(props.lat) && Number.isFinite(props.lon))
    ? { lat: props.lat, lon: props.lon, zoom: props.zoom }
    : parseLocation(props.location);
  if (loc) {
    const zoom = props.zoom ?? loc.zoom ?? 15;
    const largerUrl = buildLargerMapUrl({ lat: loc.lat, lon: loc.lon, zoom });
    const frame = el2('iframe', 'urd-map-frame');
    frame.src = buildEmbedUrl({ lat: loc.lat, lon: loc.lon, zoom });
    frame.style.height = `${props.height ?? 320}px`;
    frame.loading = 'lazy';
    frame.title = t('map.mapTitle');
    frame.setAttribute('referrerpolicy', 'no-referrer');
    host.appendChild(frame);
    watchCspBlock(host, frame, ctx, largerUrl);

    const link = el2('div', 'urd-map-link');
    const a = el2('a', null, t('map.larger'));
    a.href = largerUrl;
    a.target = '_blank';
    a.rel = 'noopener';
    link.appendChild(a);
    host.appendChild(link);
  } else {
    emptyState(host, ctx);
  }

  if (ctx.preview && ctx.viewport !== 'mobile') {
    // The settings (place, zoom, height) live in the Properties panel via
    // the field contract (`fields` on the block definition); only the help
    // chip belongs here.
    const tools = el2('div', 'urd-map-tools');
    host.append(tools);
    import('/assets/urd/hint.js').then(({ attachHint }) => {
      if (!host.isConnected || host.querySelector('.urd-hint-chip')) return;
      const chip = attachHint(tools, {
        title: ta('map.edit.hintTitle'),
        lines: [
          ta('map.edit.hint1'),
          ta('map.edit.hint2'),
          ta('map.edit.hint3'),
          ta('map.edit.hint4'),
          ta('map.edit.hint5'),
        ],
      });
      tools.insertBefore(chip, tools.firstChild);
    });
  }

  autoGrow(el, host, ctx);
}

/* ---------- The find-us preset ---------- */

const blockId = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return 'blk-' + [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
};

function finnOssSection() {
  return {
    id: 'sec-' + blockId().slice(4),
    version: 1,
    preset: 'find-us',
    size: { minHeight: '480px' },
    grid: null,
    background: { version: 1, layers: [{ type: 'color', version: 1, props: { color: 'bg', opacity: 1 } }] },
    blocks: [
      {
        id: blockId(),
        type: 'text',
        version: 1,
        props: { html: ta('map.edit.seedTitle'), align: 'left', box: false },
        animation: null,
        frames: { desktop: { x: 6, y: 40, w: 60, h: 70, z: 1, rot: 0 }, mobile: null },
      },
      {
        id: blockId(),
        type: 'map',
        version: 1,
        props: { location: '', zoom: 15, height: 320 },
        animation: null,
        frames: { desktop: { x: 6, y: 120, w: 88, h: 360, z: 2, rot: 0 }, mobile: null },
      },
    ],
    responsive: { mobile: { mode: 'auto', attention: null } },
  };
}

/* ---------- Registration ---------- */

/** @param {typeof window.Urd} Urd */
export function register(Urd) {
  Urd.blocks.define('map', {
    version: 1,
    autoGrow: true,
    label: 'Map',
    labelKey: 'map.edit.blockLabel',
    defaults: () => ({ location: '', zoom: 15, height: 320 }),
    // The field contract: the settings are rendered in the admin Properties
    // panel. `place` writes {location, lat, lon} (address search via
    // /api/geocode in admin; coordinates and OSM links are parsed by
    // parseLocation at render time).
    fields: [
      { key: 'location', type: 'place', labelKey: 'map.edit.location', placeholderKey: 'map.edit.locationPh' },
      { key: 'zoom', type: 'number', labelKey: 'map.edit.zoom', min: 1, max: 19 },
      { key: 'height', type: 'number', labelKey: 'map.edit.height', min: 120, max: 900, step: 10 },
    ],
    migrations: {},
    render: renderMap,
  });

  Urd.sections.define('find-us', {
    label: 'Find us',
    labelKey: 'map.edit.presetLabel',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'Map with your address (privacy-friendly OpenStreetMap)',
    hintKey: 'map.edit.presetHint',
    create: finnOssSection,
  });
}
