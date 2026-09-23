/**
 * Core block: table (opening hours, price lists). A semantic `<table>` in an
 * overflow-x wrapper, so wide tables scroll in their own surface instead of
 * tipping the page over. Cells are edited straight on the canvas (click and
 * type); rows and columns are added and removed in Properties. The style
 * choices (header row, striped rows, lines) live in the Style tab.
 */
// Only called in preview (after the admin dictionary has loaded): never at module level.
import { ta, adminLocaleReady } from '../i18n.js';
import { growSectionTo } from '../render.js';

/**
 * Rectangularises the rows (pure, node-testable): all rows the same length
 * (short ones padded with empty cells), at least 1 x 1, strings only.
 * @param {unknown} rows props.rows as they stand in the data
 * @returns {string[][]}
 */
export function normalizeRows(rows) {
  const safe = (Array.isArray(rows) ? rows : [])
    .filter(Array.isArray)
    .map((row) => row.map((cell) => String(cell ?? '')));
  if (!safe.length) return [['']];
  const cols = Math.max(1, ...safe.map((row) => row.length));
  return safe.map((row) => [...row, ...Array(cols - row.length).fill('')]);
}

export const tableBlock = {
  version: 1,
  autoGrow: true,
  label: 'Table',
  labelKey: 'blocks.table',
  // The seed rule (ADR-0012): ta() is called only here, on insertion in preview.
  defaults: () => ({
    header: true,
    striped: false,
    lines: 'rows',
    rows: [
      [ta('seed.table.h1'), ta('seed.table.h2'), ta('seed.table.h3')],
      [ta('seed.table.r1c1'), ta('seed.table.r1c2'), ''],
      [ta('seed.table.r2c1'), ta('seed.table.r2c2'), ''],
    ],
  }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{header?: boolean, striped?: boolean, lines?: string, rows?: string[][]}} props
   * @param {object} ctx Render context
   */
  render(el, props, ctx) {
    const host = document.createElement('div');
    host.className = 'urd-table';
    el.appendChild(host);
    const post = (msg) => window.parent?.postMessage(msg, location.origin);
    const editable = Boolean(ctx.preview) && ctx.viewport !== 'mobile';

    const rows = normalizeRows(props.rows);
    const table = document.createElement('table');
    const lines = ['rows', 'grid', 'none'].includes(props.lines) ? props.lines : 'rows';
    table.className = `urd-table-table urd-table-lines-${lines}${props.striped ? ' urd-table-striped' : ''}`;

    const makeCell = (tag, text) => {
      const cell = document.createElement(tag);
      cell.textContent = text;
      if (tag === 'th') cell.scope = 'col';
      return cell;
    };
    const body = document.createElement('tbody');
    rows.forEach((row, index) => {
      const tr = document.createElement('tr');
      const headerRow = props.header !== false && index === 0;
      for (const cell of row) tr.appendChild(makeCell(headerRow ? 'th' : 'td', cell));
      if (headerRow) {
        const head = document.createElement('thead');
        head.appendChild(tr);
        table.appendChild(head);
      } else {
        body.appendChild(tr);
      }
    });
    if (body.rows.length) table.appendChild(body);
    host.appendChild(table);

    if (editable) {
      // Click and type per cell; the whole row set is read from the DOM on
      // change, so props always mirror what the table actually holds.
      const collect = () => [...table.rows].map((tr) => [...tr.cells].map((cell) => cell.textContent ?? ''));
      for (const tr of table.rows) {
        for (const cell of tr.cells) {
          try {
            cell.contentEditable = 'plaintext-only';
          } catch {
            cell.contentEditable = 'true';
          }
          cell.addEventListener('input', () => {
            post({
              type: 'urd-edit',
              sectionId: ctx.section.id,
              blockId: el.dataset.blockId,
              props: { ...props, rows: collect() },
            });
          });
        }
      }
      // The help chip (ADR-0008): cells on the canvas plus rows/columns in the panel.
      Promise.all([import('../hint.js'), adminLocaleReady]).then(([{ attachHint }]) => {
        if (!el.isConnected || el.querySelector('.urd-hint-chip')) return;
        attachHint(el, {
          title: ta('hintTable.title'),
          lines: [ta('hintTable.l1'), ta('hintTable.l2'), ta('hintTable.l3')],
        });
      });
    }

    // Auto-grow: the frame follows the content height. ONLY the height is reported (urd-grow).
    requestAnimationFrame(() => {
      if (!el.isConnected) return;
      const needed = host.scrollHeight;
      if (Math.abs(needed - el.clientHeight) > 8 && ctx.viewport !== 'mobile') {
        el.style.height = `${needed}px`;
        const sectionEl = el.closest('.urd-section');
        if (sectionEl) growSectionTo(sectionEl, el.offsetTop + needed + 24);
        if (ctx.preview) {
          const block = ctx.section?.blocks?.find((b) => b.id === el.dataset.blockId);
          if (block && block.frames.desktop.h !== needed) {
            block.frames.desktop = { ...block.frames.desktop, h: needed };
            post({ type: 'urd-grow', sectionId: ctx.section.id, blockId: el.dataset.blockId, h: needed });
          }
        }
      }
    });
  },
};
