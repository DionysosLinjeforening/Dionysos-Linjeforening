/**
 * Collections (the data block pattern, ADR-0007): data fetching and pure helpers.
 * The helpers are DOM-free and tested in tests/collections.test.mjs; the
 * collection block (blocks/collection.js) uses them.
 */
import { dates } from './i18n.js';

/** Current version of the collection file format (content/samlinger/<id>.json). */
export const COLLECTION_SCHEMA_VERSION = 1;

/**
 * Sorts entries: newest date first (or oldest when newestFirst is false).
 * Entries without a date keep their relative order and end up last.
 * Never mutates the input.
 */
export function sortEntries(entries, newestFirst = true) {
  const dated = entries.filter((e) => e.date);
  const undated = entries.filter((e) => !e.date);
  dated.sort((a, b) => (newestFirst ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));
  return [...dated, ...undated];
}

/**
 * Groups entries by year (from the date), newest year first; entries without a
 * date end up last in the group with year null. The entries within each group
 * are sorted newest first.
 * @returns {Array<{year: string|null, entries: object[]}>}
 */
export function groupByYear(entries) {
  const groups = new Map();
  for (const entry of sortEntries(entries, true)) {
    const year = entry.date ? entry.date.slice(0, 4) : null;
    if (!groups.has(year)) groups.set(year, []);
    groups.get(year).push(entry);
  }
  return [...groups.entries()].map(([year, list]) => ({ year, entries: list }));
}

/**
 * Date badge parts from an ISO date: {day: '19', month: 'jul', year: '2026'}.
 * The month name follows the visitor language (Intl via i18n.js, nb without init).
 * An invalid or missing date gives null (the view drops the badge).
 */
export function dateBadge(date) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date ?? '');
  if (!m) return null;
  const monthIndex = Number(m[2]) - 1;
  if (monthIndex < 0 || monthIndex > 11) return null;
  return { day: String(Number(m[3])), month: dates().monthsShort[monthIndex], year: m[1] };
}

/** Draft override from the editor (the urd-collections message): id → collection data. */
let draftCollections = null;

export function setCollectionsDraft(collections) {
  draftCollections = collections;
  fetched.clear();
}

/** Fetched collections are cached per page load (id → Promise<data|null>). */
const fetched = new Map();

/**
 * Fetches a collection: the draft from the editor wins (preview), otherwise the
 * server file. null for a missing or invalid file - the block shows its empty
 * state, never a crash.
 */
export function getCollection(id) {
  if (draftCollections && Object.hasOwn(draftCollections, id)) {
    return Promise.resolve(draftCollections[id]);
  }
  if (!fetched.has(id)) {
    fetched.set(id, fetch(`/content/samlinger/${encodeURIComponent(id)}.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => (data && Array.isArray(data.entries) ? data : null))
      .catch(() => null));
  }
  return fetched.get(id);
}
