/**
 * Core block: timeline. A vertical list of events (year/title/text) along a
 * drawn line with markers - pure CSS (ADR-0011), no JS animation. Two
 * variants: "left" (line on the left, content on the right) and "alternating"
 * (line in the middle, cards on alternating sides; needs block width).
 * Vertical and width invariant, so the v0.7 width work leaves it alone.
 *
 * In the editor the texts are directly editable (click and type, as in FAQ);
 * order and count are controlled from the Properties panel. Auto-grow reports
 * ONLY height (urd-grow), never the whole frame.
 */
// Only called in preview (after the admin dictionary has loaded): never at module level.
import { ta } from '../i18n.js';
import { growSectionTo } from '../render.js';

const SAFE_HEX = /^#[0-9a-fA-F]{3,8}$/;
const SAFE_TOKEN = /^[a-z][a-z0-9-]*$/;

/** Colour prop to a safe CSS value: validated hex or theme token; otherwise null. */
export function accentCss(value) {
  if (typeof value !== 'string') return null;
  if (SAFE_HEX.test(value)) return value;
  if (SAFE_TOKEN.test(value)) return `var(--urd-color-${value})`;
  return null;
}

export const timelineBlock = {
  version: 2,
  autoGrow: true,
  label: 'Timeline',
  labelKey: 'blocks.timeline',
  // The seed rule (ADR-0012): ta() is called only here, on insertion in preview.
  defaults: () => ({
    items: [
      { year: '2019', title: ta('seed.timeline.t1'), text: ta('seed.timeline.text') },
      { year: '2022', title: ta('seed.timeline.t2'), text: ta('seed.timeline.text') },
      { year: '2026', title: ta('seed.timeline.t3'), text: ta('seed.timeline.text') },
    ],
    variant: 'left',
    marker: 'filled',
    accent: null,
  }),
  migrations: {
    // 1 -> 2 (ADR-0021): Norwegian variant/marker values renamed to English.
    1: (props) => ({
      ...props,
      variant: props.variant === 'veksler' ? 'alternating' : props.variant === 'venstre' ? 'left' : props.variant,
      marker: props.marker === 'fylt' ? 'filled' : props.marker,
    }),
  },
  /**
   * @param {HTMLElement} el
   * @param {{items: Array<{year: string, title: string, text: string}>, variant?: string, marker?: string, accent?: string|null}} props
   * @param {object} ctx Render context
   */
  render(el, props, ctx) {
    const host = document.createElement('ol');
    host.className = `urd-timeline urd-timeline-${props.variant === 'alternating' ? 'alternating' : 'left'}`;
    if (props.marker === 'ring') host.classList.add('urd-timeline-ring');
    // The accent colour only as validated hex or theme token; otherwise the theme accent.
    const accent = accentCss(props.accent);
    if (accent) host.style.setProperty('--urd-timeline-accent', accent);
    el.appendChild(host);
    const post = (msg) => window.parent?.postMessage(msg, location.origin);
    const editable = Boolean(ctx.preview) && ctx.viewport !== 'mobile';

    /** Reads the current texts out of the DOM and posts the whole items list. */
    const postItems = () => {
      const items = [...host.querySelectorAll('.urd-timeline-item')].map((item) => ({
        year: item.querySelector('.urd-timeline-year')?.textContent ?? '',
        title: item.querySelector('.urd-timeline-title')?.textContent ?? '',
        text: item.querySelector('.urd-timeline-text')?.textContent ?? '',
      }));
      post({
        type: 'urd-edit',
        sectionId: ctx.section.id,
        blockId: el.dataset.blockId,
        props: { ...props, items },
      });
    };

    for (const entry of props.items ?? []) {
      const item = document.createElement('li');
      item.className = 'urd-timeline-item';
      const fields = [
        ['urd-timeline-year', entry.year],
        ['urd-timeline-title', entry.title],
        ['urd-timeline-text', entry.text],
      ];
      for (const [cls, value] of fields) {
        const node = document.createElement('div');
        node.className = cls;
        node.textContent = value ?? '';
        if (editable) {
          // Click and type: every field is plain text (like the FAQ question).
          try {
            node.contentEditable = 'plaintext-only';
          } catch {
            node.contentEditable = 'true';
          }
          node.addEventListener('input', postItems);
        }
        item.appendChild(node);
      }
      host.appendChild(item);
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
