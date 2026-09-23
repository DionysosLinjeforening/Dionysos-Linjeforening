/**
 * The block search: plain text matching for the insertion menus. Matches
 * against the VISIBLE (ta-translated) labels the menus already show, never
 * against keys or re-translations. Diacritics and letter case do not matter
 * (NFD stripping). No DOM - node-testable.
 */

/** Comparable form: lower case without diacritical marks. */
export function normalize(str) {
  return String(str ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

/**
 * Ranking for the hit list: 0 = the label starts with the query, 1 = a word in
 * the label starts with the query, 2 = the query occurs in the label, -1 = miss.
 * An empty query matches everything (rank 2), so the caller can show the whole list.
 */
export function rankLabel(label, query) {
  const q = normalize(query).trim();
  const l = normalize(label);
  if (!q) return 2;
  if (l.startsWith(q)) return 0;
  if (l.split(/[^a-z0-9]+/).some((word) => word.startsWith(q))) return 1;
  if (l.includes(q)) return 2;
  return -1;
}

/** True when the label matches the query (an empty query matches everything). */
export function matchLabel(label, query) {
  return rankLabel(label, query) >= 0;
}

/**
 * Filter and rank a list of entries against the query: best rank first,
 * equal ranks keep the list order (stable sort).
 * @param {Array<object>} items
 * @param {string} query
 * @param {(item: object) => string} getLabel
 */
export function searchItems(items, query, getLabel) {
  return items
    .map((item, i) => ({ item, i, rank: rankLabel(getLabel(item), query) }))
    .filter((x) => x.rank >= 0)
    .sort((a, b) => (a.rank - b.rank) || (a.i - b.i))
    .map((x) => x.item);
}
