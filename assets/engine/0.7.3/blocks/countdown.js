/**
 * Core block: a countdown towards a point in time (typically an event). Four
 * unit boxes (days/hours/minutes/seconds) ticking with setInterval; the ticking
 * is logic, not animation (ADR-0011), so reduced motion needs no special
 * handling. A target in the past shows the done text. The unit words are their
 * own keys instead of Intl.RelativeTimeFormat (Northern Sami is missing from ICU
 * and would fall back to a bare number).
 */
// Only called in preview (after the admin dictionary is loaded): never at module level.
import { ta, adminLocaleReady, t } from '../i18n.js';

/**
 * Splits the time until the target into units (pure, node-testable).
 * @param {number} targetMs The target in epoch ms
 * @param {number} nowMs Now in epoch ms
 * @returns {{done: boolean, days: number, hours: number, minutes: number, seconds: number}}
 */
export function countdownParts(targetMs, nowMs) {
  const left = Math.floor((targetMs - nowMs) / 1000);
  if (!Number.isFinite(left) || left <= 0) {
    return { done: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }
  return {
    done: false,
    days: Math.floor(left / 86400),
    hours: Math.floor((left % 86400) / 3600),
    minutes: Math.floor((left % 3600) / 60),
    seconds: left % 60,
  };
}

/** The target time in epoch ms, or null when props.target cannot be parsed. */
export function parseTarget(target) {
  const text = String(target ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(text)) return null;
  const ms = new Date(text).getTime();
  return Number.isFinite(ms) ? ms : null;
}

export const countdownBlock = {
  version: 1,
  // Natural height in the mobile row grid (the boxes wrap on narrow screens).
  autoGrow: true,
  label: 'Countdown',
  labelKey: 'blocks.countdown',
  // The seed rule (ADR-0012): ta() is called only here, on insertion in preview.
  // The target is seeded 30 days ahead, so the block counts from the first moment.
  defaults: () => {
    const soon = new Date(Date.now() + 30 * 86400 * 1000);
    const pad = (n) => String(n).padStart(2, '0');
    return {
      target: `${soon.getFullYear()}-${pad(soon.getMonth() + 1)}-${pad(soon.getDate())}T18:00`,
      doneText: ta('seed.countdown.done'),
      variant: 'boxes',
      showSeconds: true,
    };
  },
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{target?: string, doneText?: string, variant?: string, showSeconds?: boolean}} props
   * @param {object} ctx Render context
   */
  render(el, props, ctx) {
    const host = document.createElement('div');
    host.className = `urd-countdown${props.variant === 'plain' ? ' urd-countdown-plain' : ''}`;
    el.appendChild(host);
    const editable = Boolean(ctx.preview) && ctx.viewport !== 'mobile';

    const target = parseTarget(props.target);
    const units = [
      ['days', t('countdown.days')],
      ['hours', t('countdown.hours')],
      ['minutes', t('countdown.minutes')],
      ...(props.showSeconds !== false ? [['seconds', t('countdown.seconds')]] : []),
    ];
    const cells = {};
    for (const [unit, label] of units) {
      const box = document.createElement('div');
      box.className = 'urd-countdown-unit';
      const value = document.createElement('div');
      value.className = 'urd-countdown-number';
      value.textContent = '0';
      const name = document.createElement('div');
      name.className = 'urd-countdown-name';
      name.textContent = label;
      box.append(value, name);
      host.appendChild(box);
      cells[unit] = value;
    }
    const doneEl = document.createElement('div');
    doneEl.className = 'urd-countdown-done';
    doneEl.textContent = props.doneText ?? '';

    const paint = () => {
      const parts = countdownParts(target ?? 0, Date.now());
      if (target === null || parts.done) {
        host.replaceChildren(doneEl);
        return false;
      }
      cells.days.textContent = String(parts.days);
      cells.hours.textContent = String(parts.hours).padStart(2, '0');
      cells.minutes.textContent = String(parts.minutes).padStart(2, '0');
      if (cells.seconds) cells.seconds.textContent = String(parts.seconds).padStart(2, '0');
      return true;
    };

    if (paint()) {
      const timer = setInterval(() => {
        // A re-render replaces the element: the ticker follows the element's lifetime.
        if (!el.isConnected || !paint()) clearInterval(timer);
      }, 1000);
    }

    if (editable) {
      // The done text is click-and-type while it is shown; the target is set in the panel.
      if (target === null || countdownParts(target, Date.now()).done) {
        try {
          doneEl.contentEditable = 'plaintext-only';
        } catch {
          doneEl.contentEditable = 'true';
        }
        doneEl.addEventListener('input', () => {
          window.parent?.postMessage({
            type: 'urd-edit',
            sectionId: ctx.section.id,
            blockId: el.dataset.blockId,
            props: { ...props, doneText: doneEl.textContent ?? '' },
          }, location.origin);
        });
      }
      // The help chip (ADR-0008): the target and the done state need explaining.
      Promise.all([import('../hint.js'), adminLocaleReady]).then(([{ attachHint }]) => {
        if (!el.isConnected || el.querySelector('.urd-hint-chip')) return;
        attachHint(el, {
          title: ta('hintCountdown.title'),
          lines: [ta('hintCountdown.l1'), ta('hintCountdown.l2'), ta('hintCountdown.l3')],
        });
      });
    }
  },
};
