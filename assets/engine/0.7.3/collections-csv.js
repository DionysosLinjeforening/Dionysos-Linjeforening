/**
 * CSV import/export for collections (feature map C12): pure logic without DOM,
 * tested in tests/collections-csv.test.mjs. The module is imported ONLY by the
 * editor (bundled there) and deliberately kept outside the visitor closure:
 * visitors never need it.
 *
 * The format is RFC 4180-like: comma separated, fields containing comma/quote/
 * newline are wrapped in quotes ("" is an escaped quote). The first row holds
 * the column names. The list fields sizes and colors are separated by «|»;
 * color images are not carried in the CSV (they are set in the panel).
 */

/** The columns in export order. image is a path in media/ and round-trips. */
const COLUMNS = ['id', 'title', 'date', 'text', 'href', 'image', 'price', 'memberPrice', 'badge', 'sizes', 'colors'];

function csvField(value) {
  const text = String(value ?? '');
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** One entry's cell value for a column (lists and numbers become text). */
function cellFor(entry, column) {
  if (column === 'sizes') return (entry.sizes ?? []).join('|');
  if (column === 'colors') return (entry.colors ?? []).map((c) => c.name).join('|');
  return entry[column] ?? '';
}

/** The collection's entries as CSV text (header plus one row per entry). */
export function entriesToCsv(entries) {
  const rows = [COLUMNS.join(',')];
  for (const entry of entries ?? []) {
    rows.push(COLUMNS.map((column) => csvField(cellFor(entry, column))).join(','));
  }
  return rows.join('\n') + '\n';
}

/** Raw CSV text → rows of cells (handles quotes and newlines inside fields). */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  const src = String(text ?? '');
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(cell);
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  // Completely empty rows (double newlines, a trailing line) are discarded.
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

const splitList = (value) => String(value ?? '').split('|').map((s) => s.trim()).filter(Boolean);

/**
 * CSV text → entries. The column names in the first row drive the parsing
 * (the order is free, unknown columns are ignored); rows without a title are
 * skipped. id may be empty - the caller then assigns a new one.
 * @returns {{entries: object[], skipped: number}|null} null without header/rows
 */
export function csvToEntries(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return null;
  const header = rows[0].map((name) => name.trim());
  if (!header.includes('title')) return null;
  const entries = [];
  let skipped = 0;
  for (const row of rows.slice(1)) {
    const raw = {};
    header.forEach((name, i) => { raw[name] = row[i] ?? ''; });
    const title = String(raw.title ?? '').trim();
    if (!title) { skipped += 1; continue; }
    const entry = { id: String(raw.id ?? '').trim(), title };
    for (const field of ['date', 'text', 'href', 'image', 'badge']) {
      const value = String(raw[field] ?? '').trim();
      if (value) entry[field] = value;
    }
    for (const field of ['price', 'memberPrice']) {
      const value = String(raw[field] ?? '').trim();
      if (value === '') continue;
      // Comma decimals from spreadsheets are accepted; invalid numbers skip the field.
      const n = Number(value.replace(',', '.'));
      if (Number.isFinite(n) && n >= 0) entry[field] = n;
    }
    const sizes = splitList(raw.sizes);
    if (sizes.length) entry.sizes = sizes;
    const colors = splitList(raw.colors);
    if (colors.length) entry.colors = colors.map((name) => ({ name }));
    entries.push(entry);
  }
  return { entries, skipped };
}
