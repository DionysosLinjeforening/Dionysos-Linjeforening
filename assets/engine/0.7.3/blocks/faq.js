/**
 * Core block: FAQ accordion. Built on the native <details name> element: the
 * answer unfolds on a click on the question row (summary), the browser owns the
 * open/closed state and the keyboard and screen reader semantics, and `name`
 * gives exclusive unfolding (one open answer at a time) without JS. Find-in-page
 * opens a match automatically. Soft unfolding via ::details-content where the
 * browser supports it (base.css, behind @supports); otherwise the answer unfolds
 * instantly.
 *
 * For visitors a click anywhere on the summary row opens it. In the editor the
 * texts are directly editable, so there a click on the question text places the
 * caret; only the arrow icon unfolds.
 *
 * Open and closed answers are view state, never content: the block's stored
 * height is always the collapsed one (auto-grow via urd-grow like the other data
 * blocks), and unfolding grows only visually.
 */
import { stripActiveContent } from '../sanitize.js';
import { growSectionTo } from '../render.js';
import { boxStyleCss } from '../box-style.js';
// Only called in preview (after the admin dictionary is loaded): never at module level.
import { ta, adminLocaleReady } from '../i18n.js';

/**
 * The group name for the FAQ elements (pure, node-testable). Without `multi` all
 * the questions in the block share one name, which gives native exclusive
 * unfolding (one open answer at a time); with `multi` the name is empty so
 * several can stay open. The name is bound to the block id so two FAQ blocks on
 * the same page do not switch each other off.
 *
 * @param {string} blockId The block id
 * @param {boolean} multi Whether several answers can be open at the same time
 * @returns {string} The name attribute, or '' when it should not be set
 */
export function groupName(blockId, multi) {
  return multi ? '' : `urd-faq-${blockId || 'x'}`;
}

const CHEVRON = '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 6l4.5 4.5L12.5 6"/></svg>';

export const faqBlock = {
  version: 1,
  autoGrow: true,
  label: 'FAQ',
  labelKey: 'blocks.faq',
  // The seed rule (ADR-0012): ta() is called only here, on insertion in preview.
  defaults: () => ({
    items: [
      { q: ta('seed.faq.q1'), a: ta('seed.faq.answer') },
      { q: ta('seed.faq.q2'), a: ta('seed.faq.answer') },
      { q: ta('seed.faq.q3'), a: ta('seed.faq.answer') },
    ],
    multi: false,
  }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{items: Array<{q: string, a: string}>, multi?: boolean, boxStyle?: object}} props
   * @param {object} ctx Render context
   */
  render(el, props, ctx) {
    const host = document.createElement('div');
    host.className = 'urd-faq';
    el.appendChild(host);
    const post = (msg) => window.parent?.postMessage(msg, location.origin);
    const editable = Boolean(ctx.preview) && ctx.viewport !== 'mobile';

    /** Reads the current texts out of the DOM and posts the whole items list. */
    const postItems = () => {
      const items = [...host.querySelectorAll('.urd-faq-item')].map((item) => ({
        q: item.querySelector('.urd-faq-q')?.textContent ?? '',
        a: item.querySelector('.urd-faq-a .urd-text')?.innerHTML ?? '',
      }));
      post({
        type: 'urd-edit',
        sectionId: ctx.section.id,
        blockId: el.dataset.blockId,
        props: { ...props, items },
      });
    };

    /** Visual height: the collapsed base plus the open answers. Display only,
     *  never recorded in the draft (urd-grow always posts the collapsed height).
     *  Measures the answers' own height, independent of the unfold animation. */
    const adjustHeight = () => {
      const openHeights = [...host.querySelectorAll('.urd-faq-item[open] .urd-faq-a')]
        .reduce((sum, a) => sum + a.scrollHeight, 0);
      const needed = (el._urdFaqBase ?? host.scrollHeight) + openHeights;
      el.style.height = `${needed}px`;
      const sectionEl = el.closest('.urd-section');
      if (sectionEl) growSectionTo(sectionEl, el.offsetTop + needed + 24);
    };

    const name = groupName(el.dataset.blockId, Boolean(props.multi));

    (props.items ?? []).forEach((entry) => {
      const item = document.createElement('details');
      item.className = 'urd-faq-item urd-text-box';
      if (name) item.name = name;
      Object.assign(item.style, boxStyleCss(props.boxStyle));

      const head = document.createElement('summary');
      head.className = 'urd-faq-head';
      const q = document.createElement('span');
      q.className = 'urd-faq-q';
      q.textContent = entry.q ?? '';
      // The arrow icon is decorative: summary is the native toggle itself, so
      // the icon must not be announced separately (aria-hidden).
      const chevron = document.createElement('span');
      chevron.className = 'urd-faq-toggle';
      chevron.setAttribute('aria-hidden', 'true');
      chevron.innerHTML = CHEVRON;
      // Without the stop, pointerdown would bubble to the block's drag and
      // selection listeners. Only bubbling is stopped, not the default action,
      // so the native toggle (click) still fires.
      chevron.addEventListener('pointerdown', (event) => event.stopPropagation());
      head.append(q, chevron);

      const region = document.createElement('div');
      region.className = 'urd-faq-a';
      const answer = document.createElement('div');
      answer.className = 'urd-text';
      answer.innerHTML = entry.a ?? '';
      answer.querySelectorAll('.urd-edit-toolbar, .urd-edit-resize, .urd-edit-rotate, button').forEach((n) => n.remove());
      stripActiveContent(answer);
      region.appendChild(answer);
      item.append(head, region);
      host.appendChild(item);

      // Native <details> grows and shrinks on its own; we adjust only the block
      // frame's VISUAL height (and the section's minHeight) so the unfolding is
      // not clipped.
      item.addEventListener('toggle', adjustHeight);

      if (editable) {
        // Click-and-type like the text block: the question is plain text, the
        // answer rich text (.urd-text[contenteditable] gives the formatting bar).
        try {
          q.contentEditable = 'plaintext-only';
        } catch {
          q.contentEditable = 'true';
        }
        answer.contentEditable = 'true';
        q.addEventListener('input', postItems);
        answer.addEventListener('input', () => {
          postItems();
          adjustHeight();
        });
        // A click on the question text places the caret rather than unfolding;
        // only the arrow icon toggles (native toggle on summary via the chevron
        // click).
        head.addEventListener('click', (event) => {
          if (!chevron.contains(event.target)) event.preventDefault();
        });
        // Space and Enter while the question is edited are typed, not a toggle.
        q.addEventListener('keydown', (event) => {
          if (event.key === ' ' || event.key === 'Enter') event.stopPropagation();
        });
      }
    });

    if (editable) {
      // The help chip (ADR-0008): the block has special functions and explains itself.
      // adminLocaleReady: the first render can happen before boot has loaded the dictionary.
      Promise.all([import('../hint.js'), adminLocaleReady]).then(([{ attachHint }]) => {
        if (!el.isConnected || el.querySelector('.urd-hint-chip')) return;
        attachHint(el, {
          title: ta('hintFaq.title'),
          lines: [
            ta('hintFaq.l1'),
            ta('hintFaq.l2'),
            ta('hintFaq.l3'),
            ta('hintFaq.l4'),
          ],
        });
      });
    }

    // Auto-grow (like the collection block): the frame follows the collapsed height.
    // All answers are closed at startup, so host.scrollHeight = collapsed.
    // ONLY the height is posted (urd-grow), never the whole frame.
    requestAnimationFrame(() => {
      if (!el.isConnected) return;
      el._urdFaqBase = host.scrollHeight;
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
