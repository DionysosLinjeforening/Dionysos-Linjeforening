/**
 * The multilingual core (ADR-0012): two registries - t() for visitor texts
 * (follows site.lang) and ta() for the admin chrome (follows the admin
 * language in localStorage 'urd-admin-lang'). Norwegian bokmål is always the
 * static base; other languages are layered on top with Object.assign, so a
 * missing key yields the bokmål text and a completely unknown key yields the
 * key itself (a visible error, never a crash). Date names, plurals and
 * relative time go through native Intl (ADR-0011: the platform's CLDR data
 * over homegrown tables), with the bokmål tables in locales/site/nb.js as
 * fallback where ICU lacks the language. The translation files are plain ES
 * modules with no build step.
 */
import nb from './locales/site/nb.js';

/** The languages that ship with Urd; the parity test keeps the files in sync.
 *  More languages can be added as language-pack plugins (language-packs.js). */
export const SUPPORTED_LANGS = ['nb', 'nn', 'en-GB', 'se', 'tr'];

/**
 * The shape of a language code: BCP-47-like, with a lowercase primary tag
 * (nb, se, sv, en-GB). Used to tell a possible LANGUAGE PACK code from
 * garbage: a code the engine does not know is looked up among the language
 * packs, while a value that does not even look like a language code falls
 * straight back to bokmål.
 */
export const LANG_CODE_RE = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;

/* The tags that mean each built-in language. Both the two- and three-letter
   codes (ISO 639-1 and -3) are listed: if a system sends 'nob' it must
   become bokmål, and the code must also be taken so a language pack cannot
   hijack bokmål through it. Southern and Lule Sami (sma/smj) are an
   APPROXIMATION of Northern Sami, not an identity; they are therefore also
   taken, and a real Southern Sami language belongs in the engine, not in a
   pack. */
const LANG_TAGS = {
  nb: ['no', 'nor', 'nb', 'nob'],
  nn: ['nn', 'nno'],
  se: ['se', 'sme', 'smj', 'sma'],
  tr: ['tr', 'tur'],
  'en-GB': ['en', 'eng'],
};

/**
 * Matches a language tag (site.lang, navigator.language) against the
 * BUILT-IN languages, or null when nothing fits. The tag must be the whole
 * code or the code plus subtags ('nb-NO' is bokmål, 'nbx' is not):
 * otherwise a language pack whose code happens to start the same way
 * ('ses', 'trv') would be redirected to a built-in language and never
 * loaded. Null carries meaning: auto-detection should then try the NEXT tag
 * in navigator.languages, and a site.lang with no match may belong to a
 * language pack (see requestedLang).
 * @param {unknown} raw
 * @returns {string|null}
 */
export function matchLang(raw) {
  const v = String(raw ?? '').trim().toLowerCase();
  for (const [lang, tags] of Object.entries(LANG_TAGS)) {
    if (tags.some((tag) => v === tag || v.startsWith(`${tag}-`))) return lang;
  }
  return null;
}

/** Is the code one of Urd's built-in languages? Language packs
 *  (language-packs.js) can never override them: a plugin must not be able
 *  to hijack bokmål. */
export function isBuiltinLang(code) {
  return SUPPORTED_LANGS.includes(String(code ?? ''));
}

/**
 * Validates the languages list in a plugin manifest (mirrors
 * schema/plugin.schema.json, which cannot run in the browser without
 * dependencies). Lives here, not in language-packs.js, because the plugin
 * loader validates the manifest SYNCHRONOUSLY for all plugins - the pack
 * module itself is only fetched when a pack language is actually in use.
 * @param {unknown} list
 * @returns {string[]} Error messages; empty list = valid.
 */
export function validateLanguages(list) {
  const errors = [];
  if (!Array.isArray(list)) return ['languages must be a list'];
  for (const entry of list) {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      errors.push('languages: every entry must be an object');
      continue;
    }
    const code = String(entry.code ?? '');
    if (!LANG_CODE_RE.test(code)) errors.push(`languages: '${code}' is not a valid language code`);
    else if (isBuiltinLang(code)) errors.push(`languages: '${code}' is built into Urd and cannot be overridden`);
    if (typeof entry.name !== 'string' || !entry.name.trim()) errors.push(`languages/${code}: name is missing (the language's own name)`);
    for (const kind of ['site', 'admin']) {
      if (entry[kind] !== undefined && typeof entry[kind] !== 'boolean') errors.push(`languages/${code}: ${kind} must be a boolean`);
    }
    if (entry.site !== true && entry.admin !== true) errors.push(`languages/${code}: must cover site, admin or both`);
  }
  return errors;
}

/**
 * The language a value ASKS for: a built-in match first, otherwise a code
 * that may belong to a language pack (kept as-is), otherwise bokmål.
 * @param {unknown} raw
 * @returns {string}
 */
export function requestedLang(raw) {
  const hit = matchLang(raw);
  if (hit) return hit;
  const v = String(raw ?? '').trim();
  return LANG_CODE_RE.test(v) ? v : 'nb';
}

/**
 * Fetches the strings of a language pack (plugin). The module is loaded
 * ONLY here, so a site in a built-in language never pays for pack support.
 * Runtime import from an absolute path, the same pattern as the admin
 * dictionaries: the code then works both in the engine and in the admin
 * bundle, without the build emitting separate chunk files. (In admin this
 * gives a separate module instance of i18n.js behind the pack module; it is
 * used only for pure functions, never for dictionary state.)
 * @param {string} code
 * @param {'site'|'admin'} kind
 * @returns {Promise<Record<string, string>|null>}
 */
async function loadPack(code, kind) {
  try {
    const mod = await import(/* @vite-ignore */ '/assets/urd/language-packs.js');
    return await mod.loadPackStrings(code, kind);
  } catch {
    return null;
  }
}

const site = { lang: 'nb', dict: { ...nb.strings }, dates: null };
const admin = { lang: 'nb', dict: {} };

/** {var} interpolation: simple and predictable, no ICU syntax. */
function format(str, params) {
  if (!params) return str;
  let out = str;
  for (const [k, v] of Object.entries(params)) out = out.replaceAll(`{${k}}`, String(v));
  return out;
}

/** Visitor text (follows site.lang). */
export function t(key, params) {
  return format(site.dict[key] ?? key, params);
}

/** Admin text (follows the admin language). */
export function ta(key, params) {
  return format(admin.dict[key] ?? key, params);
}

/**
 * Plural lookup: the key is suffixed with the Intl.PluralRules category
 * ('one'/'two'/'few'/'many'/'other'; Northern Sami has a dual form), with
 * .other as fallback. The count is always available as {n}.
 */
export function tp(baseKey, n, params) {
  let cat = 'other';
  try { cat = new Intl.PluralRules(site.lang).select(n); } catch { /* unknown language: other */ }
  const chosen = site.dict[`${baseKey}.${cat}`] ?? site.dict[`${baseKey}.other`];
  return format(chosen ?? `${baseKey}.${cat}`, { ...params, n });
}

/**
 * Error responses from the publishing layer (functions): the
 * machine-readable `code` is looked up as api.<code> and interpolated with
 * the response's own fields ({key}, {login}, {host} ...). An unknown code
 * falls back to the backend text (`error`), which always exists; null when
 * the response is missing entirely, so the caller can `??` its own fallback.
 */
export function taApiError(data) {
  const key = `api.${data?.code}`;
  if (data?.code && admin.dict[key] !== undefined) return format(admin.dict[key], data);
  return data?.error ?? null;
}

export function siteLang() { return site.lang; }
export function adminLang() { return admin.lang; }

/** Plugins add their visitor strings here (keys prefixed with the plugin id). */
export function addSiteDict(strings) { Object.assign(site.dict, strings ?? {}); }
/** Plugins and the admin locale files add admin strings here. */
export function addAdminDict(strings) { Object.assign(admin.dict, strings ?? {}); }

/**
 * Loads the visitor language (called by boot() once site.json is read).
 * Dynamic import on purpose: invisible to the modulepreload list, and
 * Norwegian sites (the base) pay nothing. A code the engine does not have
 * built in is looked up among the language packs (plugins). If loading
 * fails, the nb base stays in place.
 */
export async function initSiteLocale(rawLang) {
  const lang = requestedLang(rawLang);
  let strings = null;
  if (lang !== 'nb') {
    if (isBuiltinLang(lang)) {
      try {
        strings = (await import(/* @vite-ignore */ `./locales/site/${lang}.js`)).default.strings;
      } catch { /* missing language file: the bokmål base stays */ }
    } else {
      strings = await loadPack(lang, 'site');
    }
  }
  // The dictionary is swapped ONLY once the strings are in hand, in one go:
  // a render that happens while loading is in flight must see the previous
  // language, never a half-built one (in the preview a new draft can arrive
  // in the middle of a language switch). Always a fresh copy of the base, so
  // the overlay does not mutate the nb dictionary and a switch does not
  // inherit the previous language.
  site.lang = lang === 'nb' || strings ? lang : 'nb';
  site.dict = { ...nb.strings, ...(strings ?? {}) };
  site.dates = null;
  return site.lang;
}

/**
 * Admin language detection (shared by the editor's main.js and the preview
 * chrome): an explicit choice in localStorage 'urd-admin-lang' wins;
 * otherwise the device language is matched strictly against the supported
 * ones (the next tag is tried on a miss); no match yields English. A stored
 * choice can be a language-pack code the engine does not know: it is kept,
 * and initAdminLocale looks it up. Auto-detection covers only the built-in
 * languages (it is synchronous, and the pack list requires network).
 */
export function detectAdminLang() {
  let stored = null;
  try { stored = localStorage.getItem('urd-admin-lang'); } catch { /* private mode */ }
  if (stored) return requestedLang(stored);
  for (const cand of navigator.languages ?? [navigator.language]) {
    const hit = matchLang(cand);
    if (hit) return hit;
  }
  return 'en-GB';
}

/**
 * Resolves when the admin dictionary is loaded. Preview chrome that can be
 * rendered BEFORE initAdminLocale finishes (the help chips in the core
 * blocks: the first page render happens before the preview branch in boot)
 * waits on this before calling ta(), so key names are never frozen into
 * chrome from the first render. The visitor path never resolves it - the
 * chips only exist in the preview.
 */
let adminLocaleReadyResolve;
export const adminLocaleReady = new Promise((resolve) => { adminLocaleReadyResolve = resolve; });

/**
 * Loads the admin dictionary: the nb base at the bottom, the chosen
 * language on top. Runtime import from an absolute path, so the same code
 * works in the admin bundle AND in the preview iframe, and the dictionaries
 * are never bundled. A language that is not built in is fetched from a
 * language pack; if none exists, the bokmål base stays. If loading fails
 * entirely (vite dev without the template server) the keys are shown.
 */
export async function initAdminLocale(lang = detectAdminLang()) {
  const load = async (code) => (await import(/* @vite-ignore */ `/assets/urd/locales/admin/${code}.js`)).default.strings;
  admin.lang = requestedLang(lang);
  const builtin = isBuiltinLang(admin.lang);
  try {
    Object.assign(admin.dict, await load('nb'));
    if (builtin && admin.lang !== 'nb') Object.assign(admin.dict, await load(admin.lang));
  } catch { /* without a dictionary the keys are shown; the app must never die from this */ }
  if (!builtin) {
    const strings = await loadPack(admin.lang, 'admin');
    if (strings) Object.assign(admin.dict, strings);
    else admin.lang = 'nb';
  }
  adminLocaleReadyResolve(admin.lang);
  return admin.lang;
}

/* Date names: built from Intl for the current site language and cached per
   language. Weekdays start on Monday (Norwegian convention, same as the
   tables). Short month names are normalized without the period ('jan.' ->
   'jan'), matching the badge format. If ICU lacks the language, the bokmål
   tables from the base are used. */
function buildDates(lang) {
  try {
    if (!Intl.DateTimeFormat.supportedLocalesOf([lang]).length) return nb.dates;
    const fmt = (opts) => new Intl.DateTimeFormat(lang, opts);
    const strip = (s) => s.replace(/\.$/, '');
    const months = [];
    const monthsShort = [];
    for (let m = 0; m < 12; m++) {
      const d = new Date(Date.UTC(2026, m, 15, 12));
      months.push(fmt({ month: 'long', timeZone: 'UTC' }).format(d));
      monthsShort.push(strip(fmt({ month: 'short', timeZone: 'UTC' }).format(d)));
    }
    const weekdays = [];
    const weekdaysShort = [];
    for (let i = 0; i < 7; i++) {
      // January 5, 2026 is a Monday.
      const d = new Date(Date.UTC(2026, 0, 5 + i, 12));
      weekdays.push(fmt({ weekday: 'long', timeZone: 'UTC' }).format(d));
      weekdaysShort.push(strip(fmt({ weekday: 'short', timeZone: 'UTC' }).format(d)));
    }
    return { months, monthsShort, weekdays, weekdaysShort };
  } catch {
    return nb.dates;
  }
}

/** @returns {{months: string[], monthsShort: string[], weekdays: string[], weekdaysShort: string[]}} */
export function dates() {
  site.dates ??= buildDates(site.lang);
  return site.dates;
}

/** Relative day count («om 3 døgn»/«3 jándora maŋŋilit»); fallback = the raw number. */
export function relativeDays(days) {
  try {
    return new Intl.RelativeTimeFormat(site.lang, { numeric: 'auto' }).format(days, 'day');
  } catch {
    return String(days);
  }
}
