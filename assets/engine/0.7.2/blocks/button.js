/**
 * Core block: button. Links to a page in the page registry (page) or an
 * external URL (href). page is looked up in ctx.site.pages at render time.
 */
import { isSafeHref } from '../nav-model.js';

// Seed rule (ADR-0012): ta() is called only in defaults(), on insertion in preview, never at module level.
import { ta } from '../i18n.js';

export const buttonBlock = {
  version: 1,
  label: 'Button',
  labelKey: 'blocks.button',
  defaults: () => ({ label: ta('seed.readMore'), page: null, href: null, style: 'primary' }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{label: string, page: string|null, href: string|null, style: string}} props
   * @param {{site: object}} ctx
   */
  render(el, props, ctx) {
    const a = document.createElement('a');
    a.className = `urd-button urd-button-${props.style}`;
    a.textContent = props.label;
    if (props.page) {
      const target = ctx.site.pages.find((p) => p.id === props.page);
      a.href = target ? target.path : '#';
      if (!target) console.warn(`Urd: button points to unknown page '${props.page}'`);
    } else {
      // Shared guard (nav/footer plus internal paths/anchors): an unsafe href (javascript:/data:) must never become a live link for visitors.
      a.href = isSafeHref(props.href) ? props.href : '#';
      if (props.href && !isSafeHref(props.href)) console.warn(`Urd: the button has an unsafe link '${props.href}'`);
    }
    el.appendChild(a);
  },
};
