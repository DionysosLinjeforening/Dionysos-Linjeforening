/**
 * Page prefetch on intent: when a visitor hovers, presses or focuses an
 * internal link, the target's page file is fetched and parked in
 * sessionStorage, so the boot on the next page reads it without a round
 * trip and only revalidates in the background. The page files are served
 * with max-age=0, so the browser's own cache would still cost a 304 round
 * trip per navigation; the parked copy is what removes that hop.
 *
 * Pure functions (link resolution, the parked store, revalidation) are
 * separated from the DOM wiring so they are contract-tested in node. Inert
 * in the editor preview, where page switches happen via postMessage.
 */

const KEY = 'urd-prefetch';
/** A parked page older than this is ignored: the click did not follow the hover. */
const MAX_AGE_MS = 5 * 60 * 1000;
/** Upper bound on parked pages, so a long hover session never grows the store. */
const MAX_ENTRIES = 8;

/** The session store, or null where the browser blocks storage access
 *  (the accessor itself throws in some private modes). */
export function sessionStore() {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
}

/** Normalizes a pathname the same way resolvePage in urd.js does. */
const normalizePath = (pathname) => pathname.replace(/\/$/, '') || '/';

/**
 * The page-register entry a link points to, or null when the link is not a
 * plain internal page link: another origin, a query string, a path outside
 * the register, or the current page itself (an in-page hash included).
 * @param {string} href The link's href attribute
 * @param {{pages?: Array<{path?: string, file?: string}>}} site
 * @param {{origin: string, pathname: string}} current The current location
 */
export function internalPageFor(href, site, current) {
  if (typeof href !== 'string' || !href) return null;
  let url;
  try {
    url = new URL(href, `${current.origin}${current.pathname}`);
  } catch {
    return null;
  }
  if (url.origin !== current.origin || url.search) return null;
  const path = normalizePath(url.pathname);
  if (path === normalizePath(current.pathname)) return null;
  const entry = (site?.pages ?? []).find((p) => p.path === path);
  return entry?.file ? entry : null;
}

function readStore(storage) {
  try {
    const raw = storage?.getItem(KEY);
    const store = raw ? JSON.parse(raw) : null;
    return store && typeof store === 'object' ? store : {};
  } catch {
    return {};
  }
}

function writeStore(storage, store) {
  try {
    storage?.setItem(KEY, JSON.stringify(store));
  } catch {
    // Quota or a blocked storage: prefetch is a convenience, never a requirement.
  }
}

/**
 * Parks one page file. Entries older than MAX_AGE_MS are dropped on the way,
 * and the oldest go first when the store exceeds MAX_ENTRIES.
 * @param {string} file The register's file path
 * @param {string} text The raw JSON text as served
 * @param {string|null} etag The ETag the server sent, for the revalidation
 */
export function storePrefetched(file, text, etag, storage, now = Date.now()) {
  const store = readStore(storage);
  for (const [key, entry] of Object.entries(store)) {
    if (!entry || typeof entry.at !== 'number' || now - entry.at > MAX_AGE_MS) delete store[key];
  }
  store[file] = { text, etag: etag ?? null, at: now };
  const keys = Object.keys(store).sort((a, b) => store[a].at - store[b].at);
  while (keys.length > MAX_ENTRIES) delete store[keys.shift()];
  writeStore(storage, store);
}

/**
 * Takes a parked page file out of the store (consumed once). Returns the
 * parsed page, the raw text and the ETag it was fetched with, or null when
 * nothing fresh is parked for that file.
 * @returns {{page: object, text: string, etag: string|null}|null}
 */
export function readPrefetched(file, storage, now = Date.now()) {
  const store = readStore(storage);
  const entry = store[file];
  if (!entry) return null;
  delete store[file];
  writeStore(storage, store);
  if (typeof entry.at !== 'number' || now - entry.at > MAX_AGE_MS || typeof entry.text !== 'string') return null;
  try {
    const page = JSON.parse(entry.text);
    return page && typeof page === 'object' ? { page, text: entry.text, etag: entry.etag ?? null } : null;
  } catch {
    return null;
  }
}

/**
 * Fetches a page file and parks it. Failures are silent: the next boot
 * simply fetches the file itself.
 */
export async function prefetchPage(file, { fetchFn = fetch, storage, now } = {}) {
  try {
    const res = await fetchFn(`/${file}`);
    if (!res.ok) return false;
    storePrefetched(file, await res.text(), res.headers.get('etag'), storage, now);
    return true;
  } catch {
    return false;
  }
}

/**
 * Revalidates a served JSON file against the copy a page was rendered from
 * (a parked copy, or the boot fetch of a prerendered or restored page).
 * Resolves to the fresh page with its text and ETag when the server has a
 * different version, or null when the copy was current (304, same ETag, or
 * identical text). Without an ETag the request is unconditional and the
 * text comparison decides.
 * @returns {Promise<{page: object, text: string, etag: string|null}|null>}
 */
export async function revalidateFile(file, etag, { fetchFn = fetch, text = null } = {}) {
  const headers = etag ? { 'If-None-Match': etag } : {};
  const res = await fetchFn(`/${file}`, { headers });
  if (res.status === 304 || !res.ok) return null;
  const freshEtag = res.headers.get('etag');
  if (etag && freshEtag && freshEtag === etag) return null;
  const freshText = await res.text();
  if (text !== null && freshText === text) return null;
  return { page: JSON.parse(freshText), text: freshText, etag: freshEtag ?? null };
}

/** The fresh page alone, or null when the copy was current. */
export async function revalidatePage(file, etag, opts) {
  return (await revalidateFile(file, etag, opts))?.page ?? null;
}

/**
 * Attaches the intent listeners: hover (mouse), press (touch and pen, which
 * fire before the click) and keyboard focus on any internal page link. Each
 * page file is prefetched at most once per MAX_AGE_MS window.
 * @param {object} site The lifted site (the page register)
 * @param {{doc?: Document, storage?: Storage, fetchFn?: typeof fetch}} [deps]
 * @returns {() => void} Detaches the listeners
 */
export function wirePrefetch(site, { doc = document, storage = sessionStore(), fetchFn = fetch } = {}) {
  const fetchedAt = new Map();
  const controller = new AbortController();
  const onIntent = (event) => {
    const link = event.target?.closest?.('a[href]');
    // A link opening elsewhere never reads this tab's parked store.
    if (!link || (link.target && link.target !== '_self')) return;
    const entry = internalPageFor(link.getAttribute('href'), site, { origin: location.origin, pathname: location.pathname });
    if (!entry) return;
    const now = Date.now();
    const last = fetchedAt.get(entry.file);
    if (last && now - last < MAX_AGE_MS) return;
    fetchedAt.set(entry.file, now);
    prefetchPage(entry.file, { fetchFn, storage, now });
  };
  const { signal } = controller;
  doc.addEventListener('pointerover', onIntent, { passive: true, signal });
  doc.addEventListener('pointerdown', onIntent, { passive: true, signal });
  doc.addEventListener('focusin', onIntent, { passive: true, signal });
  return () => controller.abort();
}
