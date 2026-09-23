/**
 * Core block: quote/testimonial. Semantic <figure>/<blockquote> with the
 * attribution in <figcaption>, which the quote preset (two text boxes)
 * cannot give. Two variants: "large" (a centered spread with a quotation
 * glyph) and "short" (a testimonial card with an optional portrait). The
 * quotation glyph is drawn in CSS (::before), never as content.
 *
 * In the editor the quote, the name and the role are directly editable
 * (click and type); the portrait is chosen in the properties panel.
 * Auto-grow reports ONLY height (urd-grow), never the whole frame.
 */
// Called only in preview (after the admin dictionary has loaded): never at module level.
import { ta } from '../i18n.js';
import { growSectionTo } from '../render.js';
import { accentCss } from './timeline.js';

export const quoteBlock = {
  version: 2,
  autoGrow: true,
  label: 'Quote',
  labelKey: 'blocks.quote',
  // Seed rule (ADR-0012): ta() is called only here, on insertion in preview.
  defaults: () => ({
    text: ta('seed.quoteBlock.text'),
    attribution: ta('seed.quoteBlock.name'),
    role: ta('seed.quoteBlock.role'),
    variant: 'large',
    image: '',
    accent: null,
  }),
  migrations: {
    // 1 -> 2 (ADR-0021): Norwegian variant values renamed to English.
    1: (props) => ({
      ...props,
      variant: props.variant === 'kort' ? 'short' : props.variant === 'stor' ? 'large' : props.variant,
    }),
  },
  /**
   * @param {HTMLElement} el
   * @param {{text: string, attribution: string, role: string, variant?: string, image?: string, accent?: string|null}} props
   * @param {object} ctx Render context
   */
  render(el, props, ctx) {
    const kort = props.variant === 'short';
    const host = document.createElement('figure');
    host.className = `urd-quote urd-quote-${kort ? 'short' : 'large'}`;
    // The accent (glyph and portrait ring) only as a validated hex value or theme token.
    const accent = accentCss(props.accent);
    if (accent) host.style.setProperty('--urd-quote-accent', accent);
    el.appendChild(host);
    const post = (msg) => window.parent?.postMessage(msg, location.origin);
    const editable = Boolean(ctx.preview) && ctx.viewport !== 'mobile';

    if (kort && props.image) {
      const img = document.createElement('img');
      img.className = 'urd-quote-portrait';
      img.alt = props.attribution ?? '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = props.image;
      host.appendChild(img);
    }

    const body = document.createElement('div');
    body.className = 'urd-quote-body';
    const quote = document.createElement('blockquote');
    quote.className = 'urd-quote-text';
    quote.textContent = props.text ?? '';
    const caption = document.createElement('figcaption');
    caption.className = 'urd-quote-caption';
    const name = document.createElement('span');
    name.className = 'urd-quote-name';
    name.textContent = props.attribution ?? '';
    const role = document.createElement('span');
    role.className = 'urd-quote-role';
    role.textContent = props.role ?? '';
    caption.append(name, role);
    body.append(quote, caption);
    host.appendChild(body);

    if (editable) {
      // Click and type: all three fields are plain text.
      for (const [node, key] of [[quote, 'text'], [name, 'attribution'], [role, 'role']]) {
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
