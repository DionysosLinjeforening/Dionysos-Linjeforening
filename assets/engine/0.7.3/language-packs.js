/**
 * Language packs (ADR-0012): plugins that supply ONLY translations. A pack
 * declares its languages in the manifest:
 *
 *   "languages": [{ "code": "sv", "name": "Svenska", "site": true, "admin": false }]
 *
 * and puts the files in plugins/<id>/locales/site/<code>.js and
 * plugins/<id>/locales/admin/<code>.js, the same shape as the engine's own
 * locale files and the same overlay rule: the bokmal base sits underneath, so
 * a pack may cover everything or only parts. A pack cannot override a builtin
 * language (that would let a plugin hijack nb), and needs neither entry nor
 * provides: it has no code to run.
 *
 * The module is DELIBERATELY outside the engine's static import closure (no
 * modulepreload): it is fetched only when something actually asks for a
 * language the core does not have, or when a plugin with languages is loaded.
 * The pure validation of the manifest field therefore lives in i18n.js, which
 * is already loaded.
 */
import { LANG_CODE_RE, isBuiltinLang, validateLanguages } from './i18n.js';

/** Code to { code, name, site, admin, plugin } for the packs known so far. */
const registry = new Map();

/**
 * Registers the languages of one plugin. Called by the plugin loader, so packs
 * in the editor's DRAFT LIST are known in the preview before they are published.
 * Invalid entries are skipped one by one: the rest of the pack still works.
 */
export function registerPackLanguages(pluginId, list) {
  for (const entry of Array.isArray(list) ? list : []) {
    if (validateLanguages([entry]).length) continue;
    registry.set(entry.code, {
      code: entry.code,
      name: entry.name,
      site: entry.site === true,
      admin: entry.admin === true,
      plugin: pluginId,
    });
  }
}

/* The manifest scan runs at most once per page: it is needed only when someone
   asks for a language the core does not have, and the answer does not change. */
let scan = null;

async function scanEnabledPlugins() {
  let index;
  try {
    index = await (await fetch('/plugins/plugins.json')).json();
  } catch {
    return; // no plugin index at all is perfectly fine
  }
  // The manifests are fetched in parallel: they do not depend on each other, and
  // this sits in front of the first render when the site uses a pack language.
  await Promise.all((index.enabled ?? []).map(async (id) => {
    try {
      const manifest = await (await fetch(`/plugins/${id}/plugin.json`)).json();
      registerPackLanguages(id, manifest.languages);
    } catch { /* unreadable manifest: the plugin loader warns about the same thing */ }
  }));
}

/** The languages the enabled packs offer (the manifests are read on the first call). */
export async function packLanguages() {
  scan ??= scanEnabledPlugins();
  await scan;
  return [...registry.values()];
}

/**
 * Finds the pack that owns a language code. The registry is checked first
 * (plugins already loaded), then the manifests are read.
 */
async function findPack(code) {
  if (registry.has(code)) return registry.get(code);
  await packLanguages();
  return registry.get(code) ?? null;
}

/**
 * Fetches the strings a pack offers for one register.
 * @param {string} code The language code (never a builtin language)
 * @param {'site'|'admin'} kind
 * @returns {Promise<Record<string, string>|null>} null when no pack covers it
 */
export async function loadPackStrings(code, kind) {
  if (!LANG_CODE_RE.test(String(code ?? '')) || isBuiltinLang(code)) return null;
  const pack = await findPack(code);
  if (!pack || pack[kind] !== true) return null;
  try {
    const mod = await import(`/plugins/${pack.plugin}/locales/${kind}/${code}.js`);
    return mod.default?.strings ?? null;
  } catch {
    console.warn(`Urd: language pack '${pack.plugin}' promises ${kind} strings for '${code}', but locales/${kind}/${code}.js could not be loaded`);
    return null;
  }
}
