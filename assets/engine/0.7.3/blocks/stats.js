/**
 * Core block: statistic / key figure. One number with an optional prefix and
 * suffix and a label below; three blocks side by side give the number trio from
 * the statistics preset. What it adds over plain text blocks is the count-up
 * animation on first entrance (IntersectionObserver, one-shot): the number counts
 * from zero to the final value with the number format preserved. ADR-0011 gating:
 * without support, with prefers-reduced-motion, and in editing mode the number
 * stands in its FINAL STATE - the animation is pure decoration and never a
 * requirement.
 */
// Only called in preview (after the admin dictionary is loaded): never at module level.
import { ta, adminLocaleReady } from '../i18n.js';
import { growSectionTo } from '../render.js';

/**
 * Parses the display value as a number (pure, node-testable): the digits with an
 * optional decimal separator (comma or period), grouped with spaces or thin
 * spaces ("4 800", "1 234,5"). Anything else gives null (no animation).
 * @param {string} value The display value from props
 * @returns {{num: number, decimals: number}|null}
 */
export function parseStatValue(value) {
  const text = String(value ?? '').trim();
  if (!/^\d[\d\s  ]*([.,]\d+)?$/.test(text)) return null;
  const clean = text.replace(/[\s  ]/g, '');
  const decimals = clean.includes(',') || clean.includes('.')
    ? clean.length - Math.max(clean.indexOf(','), clean.indexOf('.')) - 1
    : 0;
  return { num: Number.parseFloat(clean.replace(',', '.')), decimals };
}

/**
 * Formats a number during the count in the SAME form as the target value: the
 * same number of decimals, the same decimal separator and the same grouping.
 * @param {number} n The number to show
 * @param {string} reference The target value as it stands in props
 * @param {number} decimals The number of decimals from parseStatValue
 * @returns {string}
 */
export function formatStatValue(n, reference, decimals) {
  const ref = String(reference ?? '');
  const comma = ref.includes(',');
  // The grouping character is taken from the target value itself (normal, hard or
  // narrow space), so the form never changes during the count.
  const group = ref.match(/\d([\s  ])\d/)?.[1] ?? null;
  let text = n.toFixed(decimals);
  if (comma) text = text.replace('.', ',');
  if (group) {
    const sep = text.includes(',') ? ',' : '.';
    const [whole, frac] = decimals ? text.split(sep) : [text, null];
    const spaced = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
    text = frac == null ? spaced : spaced + sep + frac;
  }
  return text;
}

export const statsBlock = {
  version: 1,
  autoGrow: true,
  label: 'Statistic',
  labelKey: 'blocks.stats',
  // The seed rule (ADR-0012): ta() is called only here, on insertion in preview.
  defaults: () => ({
    value: '4800',
    prefix: '',
    suffix: '+',
    label: ta('seed.statsBlock.label'),
    countUp: true,
  }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{value: string, prefix?: string, suffix?: string, label?: string, countUp?: boolean}} props
   * @param {object} ctx Render context
   */
  render(el, props, ctx) {
    const host = document.createElement('div');
    host.className = 'urd-stats';
    el.appendChild(host);
    const post = (msg) => window.parent?.postMessage(msg, location.origin);
    const editable = Boolean(ctx.preview) && ctx.viewport !== 'mobile';

    const row = document.createElement('div');
    row.className = 'urd-stat-number';
    const prefix = document.createElement('span');
    prefix.textContent = props.prefix ?? '';
    const value = document.createElement('span');
    value.className = 'urd-stat-value';
    value.textContent = props.value ?? '';
    const suffix = document.createElement('span');
    suffix.textContent = props.suffix ?? '';
    row.append(prefix, value, suffix);
    const label = document.createElement('div');
    label.className = 'urd-stat-label';
    label.textContent = props.label ?? '';
    host.append(row, label);

    if (editable) {
      // Click-and-type on the value and the label; prefix and suffix live in the panel.
      for (const [node, key] of [[value, 'value'], [label, 'label']]) {
        try {
          node.contentEditable = 'plaintext-only';
        } catch {
          node.contentEditable = 'true';
        }
        node.addEventListener('input', () => {
          post({
            type: 'urd-edit',
            sectionId: ctx.section.id,
            blockId: el.dataset.blockId,
            props: { ...props, [key]: node.textContent ?? '' },
          });
        });
      }
      // The help chip (ADR-0008): count-up is a special function.
      Promise.all([import('../hint.js'), adminLocaleReady]).then(([{ attachHint }]) => {
        if (!el.isConnected || el.querySelector('.urd-hint-chip')) return;
        attachHint(el, {
          title: ta('hintStats.title'),
          lines: [ta('hintStats.l1'), ta('hintStats.l2'), ta('hintStats.l3')],
        });
      });
    }

    // Count-up on first entrance: only for visitors, only when the value is a
    // number, and never under reduced motion - otherwise the final state stands.
    const parsed = parseStatValue(props.value);
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
    if (props.countUp !== false && parsed && parsed.num > 0 && !editable && !reduce
      && typeof IntersectionObserver === 'function') {
      const io = new IntersectionObserver((entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const start = performance.now();
        const duration = 1200;
        const tick = (now) => {
          const t = Math.min(1, (now - start) / duration);
          const eased = 1 - (1 - t) ** 3;
          value.textContent = formatStatValue(parsed.num * eased, props.value, parsed.decimals);
          if (t < 1) requestAnimationFrame(tick);
          else value.textContent = props.value;
        };
        requestAnimationFrame(tick);
      }, { threshold: 0.4 });
      io.observe(host);
    }

    // Auto-grow: the frame follows the content height. ONLY the height is posted (urd-grow).
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
