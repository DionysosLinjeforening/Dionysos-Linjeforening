/**
 * Plugin loading. The contract is described in docs/SCHEMA.md and schema/plugin.schema.json.
 *
 * The promises here are the same as for everything else in Urd: a failing plugin never stops the site,
 * and a plugin written for a different engine version is rejected BEFORE it gets to define anything.
 * register(Urd) runs against a staging layer: the definitions are adopted only if all of register() completes,
 * so a plugin that throws halfway never leaves half-finished registrations behind.
 */

import { siteLang, adminLang, addSiteDict, addAdminDict, validateLanguages } from './i18n.js';

/** Parses «x.y.z» into [x, y, z], or null when the string is not semver. */
export function parseSemver(text) {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(String(text).trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}

const cmp = (a, b) => (a[0] - b[0]) || (a[1] - b[1]) || (a[2] - b[2]);

/**
 * Minimal, dependency-free semver range check for requiresEngine.
 * Supports space-separated requirements that must ALL hold: >=x.y.z, >x.y.z, <=x.y.z, <x.y.z,
 * =x.y.z / x.y.z (exact), ^x.y.z (same major; for 0.y: same minor) and ~x.y.z (same major.minor).
 * Unknown/unparseable requirements yield false: a plugin with an unintelligible requirement must not be loaded blindly.
 */
export function satisfiesEngine(version, range) {
  const v = parseSemver(version);
  if (!v || typeof range !== 'string' || !range.trim()) return false;
  for (const part of range.trim().split(/\s+/)) {
    const m = /^(>=|<=|>|<|=|\^|~)?(\d+\.\d+\.\d+)$/.exec(part);
    if (!m) return false;
    const op = m[1] ?? '=';
    const t = parseSemver(m[2]);
    const d = cmp(v, t);
    const ok = op === '>=' ? d >= 0
      : op === '>' ? d > 0
      : op === '<=' ? d <= 0
      : op === '<' ? d < 0
      : op === '^' ? (t[0] === 0
        ? (v[0] === 0 && v[1] === t[1] && d >= 0)
        : (v[0] === t[0] && d >= 0))
      : op === '~' ? (v[0] === t[0] && v[1] === t[1] && d >= 0)
      : d === 0;
    if (!ok) return false;
  }
  return true;
}

const ID_RE = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Mirrors the requirements in schema/plugin.schema.json (the schema cannot run in the browser without dependencies).
 * @returns {string[]} Error messages; empty list = valid.
 */
export function validateManifest(manifest) {
  const errors = [];
  if (!manifest || typeof manifest !== 'object') return ['the manifest is not an object'];
  if (!ID_RE.test(manifest.id ?? '')) errors.push('id is missing or invalid');
  if (typeof manifest.name !== 'string' || !manifest.name) errors.push('name is missing');
  if (!parseSemver(manifest.version ?? '')) errors.push('version is not semver');
  if (typeof manifest.requiresEngine !== 'string' || !manifest.requiresEngine) errors.push('requiresEngine is missing');
  // A pure LANGUAGE PACK has no code: entry and provides are then optional.
  // If they are given anyway, the usual requirements apply.
  const isLanguagePack = Array.isArray(manifest.languages) && manifest.languages.length > 0;
  if (manifest.entry !== undefined || !isLanguagePack) {
    if (typeof manifest.entry !== 'string' || !manifest.entry.endsWith('.js')) errors.push('entry is missing or is not a .js file');
  }
  if (manifest.provides !== undefined || !isLanguagePack) {
    if (!manifest.provides || typeof manifest.provides !== 'object') errors.push('provides is missing');
  }
  if (manifest.languages !== undefined) errors.push(...validateLanguages(manifest.languages));
  // Optional multilingual fields: locales promises locales/<lang>.js files,
  // names is the display name per admin language.
  if (manifest.locales !== undefined && typeof manifest.locales !== 'boolean') errors.push('locales must be a boolean');
  if (manifest.names !== undefined && (typeof manifest.names !== 'object' || manifest.names === null || Array.isArray(manifest.names)
    || Object.values(manifest.names).some((v) => typeof v !== 'string' || !v))) errors.push('names must be an object mapping language code to name');
  return errors;
}

/** The registry kinds a plugin can define in, and the manifest key that promises them. */
const KINDS = [
  ['blocks', 'blocks'],
  ['sections', 'sectionPresets'],
  ['backgrounds', 'backgrounds'],
  ['animations', 'animations'],
  ['templates', 'templates'],
];

/**
 * Staging layer around the Urd registries: register(Urd) defines against
 * this, and commit() adopts the definitions only once all of register() has
 * completed. pluginName marks the definitions (def.fromPlugin), so the
 * menus can show plugin content in their own from-plugins sections.
 * @returns {{staged: object, commit: () => string[], defined: () => Record<string, string[]>}}
 */
export function createStagedUrd(Urd, pluginName = null) {
  const captured = new Map(KINDS.map(([kind]) => [kind, []]));
  const staged = {};
  for (const [kind] of KINDS) {
    staged[kind] = {
      define(id, def) {
        if (!ID_RE.test(id ?? '')) throw new Error(`Urd.${kind}: invalid id '${id}'`);
        captured.get(kind).push([id, pluginName ? { ...def, fromPlugin: pluginName } : def]);
      },
      get: (id) => Urd[kind].get(id),
      ids: () => Urd[kind].ids(),
    };
  }
  // Legacy alias (ADR-0021): plugins written before the rename register
  // their templates through urd.maler.
  staged.maler = staged.templates;
  return {
    staged,
    /** @returns {string[]} Warnings (e.g. id collisions that were skipped) */
    commit() {
      const warnings = [];
      for (const [kind] of KINDS) {
        for (const [id, def] of captured.get(kind)) {
          try {
            Urd[kind].define(id, def);
          } catch (err) {
            warnings.push(`${kind}/${id}: ${err.message}`);
          }
        }
      }
      return warnings;
    },
    defined() {
      const out = {};
      for (const [kind, provideKey] of KINDS) {
        out[provideKey] = captured.get(kind).map(([id]) => id);
      }
      return out;
    },
  };
}

/**
 * Compares what the manifest PROMISES (provides) with what register() actually defined.
 * A mismatch is never fatal (the plugin works), but it is logged so the plugin author sees the contract breach.
 * @returns {string[]} Mismatch descriptions
 */
export function checkProvides(provides, defined) {
  const diffs = [];
  for (const [, provideKey] of KINDS) {
    // Dual-read (ADR-0021): the manifest key was 'maler' before the rename.
    const promised = provides?.[provideKey]
      ?? (provideKey === 'templates' ? provides?.maler : undefined)
      ?? [];
    const actual = defined[provideKey] ?? [];
    for (const id of promised) {
      if (!actual.includes(id)) diffs.push(`promises ${provideKey}/${id} but never defined it`);
    }
    for (const id of actual) {
      if (!promised.includes(id)) diffs.push(`defined ${provideKey}/${id} without promising it in provides`);
    }
  }
  return diffs;
}

/** Plugins already loaded in this page: an import cannot be undone, so each id is loaded at most once. */
const loadedPlugins = new Set();

/** Loads in flight per plugin id, so concurrent load requests (the preview
 *  sends urd-plugins on every draft change) share one fetch instead of
 *  importing the same module twice. */
const inFlight = new Map();

/**
 * Network seam: everything the loader fetches or imports goes through here,
 * so the loading contract (parallel fetch, ordered registration) is
 * testable in node without a browser.
 */
export const io = {
  fetchJson: async (url) => (await fetch(url)).json(),
  importModule: (url) => import(/* @vite-ignore */ url),
};

/* ---------- Plugin-locales (ADR-0012) ---------- */

/** Loaded plugin ids with locales: true - used on language switches in the preview. */
const localePlugins = new Set();

/** Is this the editor's preview? Same detection as boot. */
const isPreview = () => new URLSearchParams(location.search).get('preview') === '1';

/**
 * Loads one plugin dictionary: the nb base at the bottom, the chosen
 * language on top (a missing language file falls silently back to nb, the
 * same model as the admin dictionary).
 * @returns {Promise<Record<string, string>|null>} null when even the base is missing
 */
async function loadPluginLocale(id, lang) {
  const load = async (code) => (await io.importModule(`/plugins/${id}/locales/${code}.js`)).default.strings;
  try {
    const [base, extra] = await Promise.all([
      load('nb'),
      lang !== 'nb' ? load(lang).catch(() => null) : null,
    ]);
    return { ...base, ...(extra ?? {}) };
  } catch {
    console.warn(`Urd: plugin '${id}' promises locales, but locales/nb.js could not be loaded`);
    return null;
  }
}

/** Loads the plugin's strings for the registries: the SITE language for the
 *  visitor registry, and in the preview ALSO the ADMIN language for the
 *  admin registry (the canvas chrome). Loading and applying are separate
 *  steps, so the dictionaries are applied in plugin list order even though
 *  the files arrive in download order.
 *  @returns {Promise<{site: object, admin: object|null}|null>} */
async function loadPluginLocales(id) {
  const site = await loadPluginLocale(id, siteLang());
  if (!site) return null;
  let admin = null;
  if (isPreview()) admin = adminLang() === siteLang() ? site : await loadPluginLocale(id, adminLang());
  return { site, admin };
}

/** Puts loaded plugin strings into the registries. */
function applyPluginLocales(id, loaded) {
  if (!loaded) return;
  addSiteDict(loaded.site);
  localePlugins.add(id);
  if (loaded.admin) addAdminDict(loaded.admin);
}

/**
 * Re-adds the plugin strings to the visitor registry. Called after
 * initSiteLocale on a language switch in the preview: initSiteLocale builds
 * the dictionary from the engine's nb base, so the plugin keys must be
 * layered on top again.
 */
export async function applyPluginSiteLocales() {
  for (const id of localePlugins) {
    const strings = await loadPluginLocale(id, siteLang());
    if (strings) addSiteDict(strings);
  }
}

/**
 * Fetches everything ONE plugin needs: manifest fetch → validation →
 * requiresEngine check → dictionary and entry module in parallel. Nothing is
 * registered here, so any number of plugins can be prepared concurrently.
 * A failure at any step yields null with a clear log line; the site always
 * lives on.
 * @returns {Promise<{manifest: object, mod: object|null, locales: object|null}|null>}
 */
async function preparePlugin(engineVersion, id) {
  try {
    const manifest = await io.fetchJson(`/plugins/${id}/plugin.json`);
    const errors = validateManifest(manifest);
    if (errors.length) {
      console.warn(`Urd: plugin '${id}' has an invalid manifest: ${errors.join('; ')}`);
      return null;
    }
    if (!satisfiesEngine(engineVersion, manifest.requiresEngine)) {
      console.warn(`Urd: plugin '${id}' requires engine '${manifest.requiresEngine}', this is ${engineVersion} - skipped`);
      return null;
    }
    // The dictionary, the language-pack module and the entry module depend
    // only on the manifest, so they are fetched in one wave. The dictionary
    // is applied at commit, BEFORE register()/render, so the plugin's
    // t()/ta() lookups hit from the first rendering. Visitors: loadPlugins
    // runs after initSiteLocale in boot. Preview: the urd-plugins message
    // arrives after initAdminLocale, so both registries are ready.
    const [locales, , mod] = await Promise.all([
      manifest.locales === true ? loadPluginLocales(id) : null,
      // The language pack's languages are registered before anything
      // renders, so the preview knows a draft-enabled pack language without
      // re-reading the manifests. The pack module is fetched only here,
      // never for a plugin without languages.
      manifest.languages?.length
        ? io.importModule('/assets/urd/language-packs.js').then(({ registerPackLanguages }) => registerPackLanguages(id, manifest.languages))
        : null,
      // Pure language pack: no entry, nothing to run.
      manifest.entry ? io.importModule(`/plugins/${id}/${manifest.entry}`) : null,
    ]);
    return { manifest, mod, locales };
  } catch (err) {
    console.warn(`Urd: plugin '${id}' could not be loaded`, err);
    return null;
  }
}

/**
 * Registers ONE prepared plugin: register(staging) → commit → provides
 * check. Runs in list order, so id collisions between plugins resolve the
 * same way regardless of which download finished first.
 */
function commitPlugin(Urd, id, prepared) {
  const { manifest, mod, locales } = prepared;
  applyPluginLocales(id, locales);
  if (!mod) {
    loadedPlugins.add(id);
    return;
  }
  if (typeof mod.register !== 'function') {
    console.warn(`Urd: plugin '${id}' is missing a register() export`);
    return;
  }
  // fromPlugin carries the DISPLAY NAME (manifest.names for the admin
  // language when it exists): the field is used only in the editor
  // chrome (tip.blocks.fromPlugin).
  const displayName = manifest.names?.[adminLang()] ?? manifest.name ?? id;
  const staging = createStagedUrd(Urd, displayName);
  try {
    mod.register(staging.staged);
  } catch (err) {
    console.warn(`Urd: plugin '${id}' could not be loaded`, err);
    return;
  }
  for (const warning of staging.commit()) {
    console.warn(`Urd: plugin '${id}': ${warning}`);
  }
  for (const diff of checkProvides(manifest.provides, staging.defined())) {
    console.warn(`Urd: plugin '${id}' breaks the provides contract: ${diff}`);
  }
  loadedPlugins.add(id);
}

/** Loads ONE plugin (fetch, then register). Shared with the list loader. */
export async function loadPluginById(Urd, engineVersion, id) {
  await loadPluginList(Urd, engineVersion, [id]);
}

/** List loads run one after another: two overlapping lists (a draft toggled
 *  while a load is in flight) would otherwise commit in completion order. */
let listQueue = Promise.resolve();

/**
 * Loads a list of plugin ids (the enabled list for visitors, the editor's
 * draft in the preview): every plugin is fetched in parallel, then
 * registered one by one in list order. An id already loaded, or in flight
 * from an earlier call, is never fetched again.
 */
export function loadPluginList(Urd, engineVersion, ids) {
  const run = listQueue.then(async () => {
    const wanted = [...new Set(ids ?? [])].filter((id) => !loadedPlugins.has(id));
    const prepared = await Promise.all(wanted.map((id) => {
      if (!inFlight.has(id)) {
        inFlight.set(id, preparePlugin(engineVersion, id).finally(() => inFlight.delete(id)));
      }
      return inFlight.get(id);
    }));
    wanted.forEach((id, i) => {
      if (prepared[i] && !loadedPlugins.has(id)) commitPlugin(Urd, id, prepared[i]);
    });
  });
  listQueue = run.catch(() => {});
  return run;
}

/**
 * Loads the enabled plugins from plugins/plugins.json against a given engine version.
 * @param {typeof window.Urd} Urd
 * @param {string} engineVersion The engine version (from urd.json)
 */
export async function loadPlugins(Urd, engineVersion) {
  let index;
  try {
    index = await io.fetchJson('/plugins/plugins.json');
  } catch {
    return; // no plugin index is perfectly fine
  }
  await loadPluginList(Urd, engineVersion, index.enabled);
}
