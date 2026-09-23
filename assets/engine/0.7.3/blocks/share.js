/**
 * Core block: share buttons. Plain, static share links without tracking
 * (never vendor SDKs): each service is an ordinary `<a>` to the service's
 * share URL with the page address as a parameter, drawn with the icon
 * library's SVGs. "Copy link" uses the Clipboard API and appears only where
 * that API exists (ADR-0011: feature check, never a half-dead element).
 */
// Only called in preview (after the admin dictionary has loaded): never at module level.
import { ta, adminLocaleReady, t } from '../i18n.js';
import { iconSvg } from '../icons.js';

/** Service id (data contract) to icon id and brand name (never translated). */
export const SHARE_SERVICES = [
  ['facebook', 'facebook', 'Facebook'],
  ['x', 'x', 'X'],
  ['linkedin', 'linkedin', 'LinkedIn'],
  ['whatsapp', 'whatsapp', 'WhatsApp'],
  ['email', 'mail', null],
  ['copy', 'share', null],
];

/**
 * Share URL for a service (pure, node-testable). Everything is URL-encoded;
 * 'copy' and unknown services give null (copying is a button, not a link).
 * @param {string} service Service id from SHARE_SERVICES
 * @param {string} pageUrl The page's full address
 * @param {string} title The page title (included in text-based shares)
 * @returns {string|null}
 */
export function shareUrl(service, pageUrl, title) {
  const url = encodeURIComponent(String(pageUrl ?? ''));
  const text = encodeURIComponent(String(title ?? ''));
  if (service === 'facebook') return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
  if (service === 'x') return `https://twitter.com/intent/tweet?url=${url}&text=${text}`;
  if (service === 'linkedin') return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
  if (service === 'whatsapp') return `https://wa.me/?text=${text}%20${url}`;
  if (service === 'email') return `mailto:?subject=${text}&body=${url}`;
  return null;
}

export const shareBlock = {
  version: 1,
  // Natural height in the mobile row grid (the buttons wrap on narrow screens).
  autoGrow: true,
  label: 'Share buttons',
  labelKey: 'blocks.share',
  defaults: () => ({
    services: ['facebook', 'x', 'linkedin', 'whatsapp', 'email', 'copy'],
    variant: 'icons',
    size: 38,
    color: '',
  }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{services?: string[], variant?: string, size?: number, color?: string}} props
   * @param {object} ctx Render context
   */
  render(el, props, ctx) {
    const host = document.createElement('div');
    host.className = `urd-share${props.variant === 'labels' ? ' urd-share-labels' : ''}`;
    const size = Math.min(64, Math.max(24, Number(props.size) || 38));
    host.style.setProperty('--urd-share-size', `${size}px`);
    // The colour is validated as hex or theme token; anything else gives the accent colour.
    const color = String(props.color ?? '');
    if (/^#[0-9a-fA-F]{3,8}$/.test(color)) host.style.setProperty('--urd-share-color', color);
    else if (/^[a-z][a-z0-9-]*$/.test(color)) host.style.setProperty('--urd-share-color', `var(--urd-color-${color})`);
    el.appendChild(host);
    const editable = Boolean(ctx.preview) && ctx.viewport !== 'mobile';

    const wanted = Array.isArray(props.services) ? props.services : [];
    for (const [service, icon, brand] of SHARE_SERVICES) {
      if (!wanted.includes(service)) continue;
      const label = brand ?? t(service === 'copy' ? 'share.copy' : 'share.email');
      const inner = `<span class="urd-share-icon">${iconSvg(icon) ?? ''}</span><span class="urd-share-name"></span>`;
      if (service === 'copy') {
        // Copy link: only with the Clipboard API (feature check, ADR-0011).
        if (!navigator.clipboard?.writeText) continue;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'urd-share-button';
        btn.innerHTML = inner;
        btn.querySelector('.urd-share-name').textContent = label;
        btn.title = label;
        btn.setAttribute('aria-label', label);
        btn.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(location.href);
            btn.querySelector('.urd-share-name').textContent = t('share.copied');
            btn.classList.add('urd-share-copied');
            setTimeout(() => {
              btn.querySelector('.urd-share-name').textContent = label;
              btn.classList.remove('urd-share-copied');
            }, 1600);
          } catch {
            // Permission denied: the button stays as it was, no error state to show.
          }
        });
        host.appendChild(btn);
        continue;
      }
      const link = document.createElement('a');
      link.className = 'urd-share-button';
      // The address and title are read on click, not at render: client-side
      // navigation may have swapped the page since the block was drawn.
      link.href = '#';
      link.addEventListener('click', (event) => {
        event.preventDefault();
        // Never open share windows from the editor, not even in the mobile view
        // (ctx.preview, never editable: that one is false in the mobile viewport).
        if (ctx.preview) return;
        const target = shareUrl(service, location.href, document.title);
        if (!target) return;
        if (service === 'email') location.href = target;
        else window.open(target, '_blank', 'noopener');
      });
      link.innerHTML = inner;
      link.querySelector('.urd-share-name').textContent = label;
      const aria = brand ? t('share.share', { service: brand }) : label;
      link.title = aria;
      link.setAttribute('aria-label', aria);
      host.appendChild(link);
    }

    if (editable) {
      // The help chip (ADR-0008): the absence of tracking is the block's distinguishing trait.
      Promise.all([import('../hint.js'), adminLocaleReady]).then(([{ attachHint }]) => {
        if (!el.isConnected || el.querySelector('.urd-hint-chip')) return;
        attachHint(el, {
          title: ta('hintShare.title'),
          lines: [ta('hintShare.l1'), ta('hintShare.l2'), ta('hintShare.l3')],
        });
      });
    }
  },
};
