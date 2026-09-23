/**
 * Core block: text. Rich text (HTML written by the site owner through the editor)
 * with alignment. The content is the owner's own and is treated as trusted; it is
 * the same trust model as the owner being able to edit the files in the repo
 * directly.
 */
import { stripActiveContent } from '../sanitize.js';
import { boxStyleCss } from '../box-style.js';

// The seed rule (ADR-0012): ta() is called only in defaults(), on insertion in preview, never at module level.
import { ta } from '../i18n.js';

export const textBlock = {
  version: 1,
  label: 'Text',
  labelKey: 'blocks.text',
  defaults: () => ({ html: ta('seed.text'), align: 'left', box: false }),
  migrations: {},
  /**
   * @param {HTMLElement} el The block element (positioned by render.js)
   * @param {{html: string, align: string, box?: boolean, boxStyle?: object, font?: string, size?: number, lineHeight?: number, letterSpacing?: number}} props
   * @param {object} ctx Render context
   */
  render(el, props, ctx) {
    // The text lives in its own inner element: the editing handles that
    // preview-edit puts on the block must NEVER end up inside the editable
    // content (or in the stored props.html).
    const content = document.createElement('div');
    // The text box variant: the same block, but the content sits in a card
    // (the theme's surface color, border, radius). Optional field; older data
    // lacks it and renders without the card.
    content.className = props.box ? 'urd-text urd-text-box' : 'urd-text';
    content.style.cssText = 'width:100%;min-height:100%;';
    // Optional card style (additive; empty = the base style in .urd-text-box).
    if (props.box) Object.assign(content.style, boxStyleCss(props.boxStyle));
    content.style.textAlign = props.align;
    // Optional font and size per text block (additive; empty = inherited from the theme).
    if (props.font) content.style.fontFamily = props.font;
    if (props.size) content.style.fontSize = `${props.size}px`;
    // Optional line and letter spacing per field (additive; empty = inherited).
    // The line height is unitless (it scales with the font size); the letter
    // spacing is px and can be negative (tighter than normal).
    if (props.lineHeight) content.style.lineHeight = String(props.lineHeight);
    if (typeof props.letterSpacing === 'number' && props.letterSpacing !== 0) {
      content.style.letterSpacing = `${props.letterSpacing}px`;
    }
    content.innerHTML = props.html;
    // Self-healing: content stored by older Urd can contain handle markup,
    // including orphaned buttons left when browser editing splits the wrapper.
    // Text content must never contain buttons, so all of them are removed on
    // render (and stored clean on the next edit).
    content.querySelectorAll('.urd-edit-toolbar, .urd-edit-resize, .urd-edit-rotate, button').forEach((n) => n.remove());
    // Visitor protection (shared with collection entries): executable code is always stripped on render.
    stripActiveContent(content);
    el.appendChild(content);

    // Click-and-type: in preview mode (inside the editor's iframe) the text is
    // directly editable, and every change is posted to the editor, which owns
    // the draft. The block id sits on the block element (set by render.js).
    // Desktop view only: the mobile view is layout adjustment, and text growth
    // writes the desktop frame.
    if (ctx.preview && ctx.viewport !== 'mobile') {
      content.contentEditable = 'true';
      content.addEventListener('input', () => {
        const post = (msg) => window.parent?.postMessage(msg, location.origin);

        // Grow with the content: when the text becomes taller than the frame,
        // the frame (and the section when needed) is expanded so nothing is
        // clipped or overlaps. Measured on the content element, so the handles
        // never count. The growth belongs to the same undo step as the typing.
        if (content.scrollHeight > el.clientHeight) {
          const block = ctx.section.blocks.find((b) => b.id === el.dataset.blockId);
          if (block) {
            const step = ctx.grid?.size ?? 8;
            const newH = Math.ceil(content.scrollHeight / step) * step;
            block.frames.desktop = { ...block.frames.desktop, h: newH };
            el.style.height = `${newH}px`;
            // The section is left alone: if the text grows past the edge it
            // hangs over (sections never clip, and the height is the user's).
            post({ type: 'urd-move', sectionId: ctx.section.id, blockId: block.id, frame: block.frames.desktop, coalesce: true });
          }
        }

        post({
          type: 'urd-edit',
          sectionId: ctx.section.id,
          blockId: el.dataset.blockId,
          props: { ...props, html: content.innerHTML },
        });
      });
    }

    // A safety net at RENDER, not only while typing (ADR-0018). The stored
    // height is in pixels while the wrapping depends on the width: if the content
    // width, the font size or the language changes, a text that fit perfectly
    // becomes too tall for its own box. The listener above catches that only
    // while someone is actually typing, so the same measurement is done here,
    // following the same pattern as the data blocks (quote, stats, faq ...).
    //
    // The growth is ONE-WAY: the frame never shrinks by itself, since an empty
    // or short text keeps the space the owner gave it. The tolerance keeps
    // rounding from causing endless small adjustments.
    requestAnimationFrame(() => {
      if (!el.isConnected || ctx.viewport === 'mobile') return;
      const needed = content.scrollHeight;
      if (needed <= el.clientHeight + 4) return;
      const step = ctx.grid?.size ?? 8;
      const newH = Math.ceil(needed / step) * step;
      el.style.height = `${newH}px`;
      // For visitors only the display is corrected; in preview the new height is
      // recorded in the draft, so the next publish does not have to measure again.
      if (!ctx.preview) return;
      const block = ctx.section?.blocks?.find((b) => b.id === el.dataset.blockId);
      if (!block || block.frames.desktop.h === newH) return;
      block.frames.desktop = { ...block.frames.desktop, h: newH };
      window.parent?.postMessage(
        { type: 'urd-grow', sectionId: ctx.section.id, blockId: el.dataset.blockId, h: newH },
        location.origin,
      );
    });
  },
};
