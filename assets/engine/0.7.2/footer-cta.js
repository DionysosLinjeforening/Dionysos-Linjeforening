/**
 * Pure logic for the footer CTA's newsletter submission: email validation,
 * honeypot check, endpoint payload and mailto fallback. No DOM, no fetch (the
 * DOM and the fetch itself live in footer.js). The engine must never depend on
 * a plugin, so these helpers mirror - but do NOT import - the form plugin's
 * form.js. Covered by tests/footer-cta.test.mjs.
 */
import { t } from './i18n.js';

// Simple email shape (not RFC complete, the same as the form plugin): something
// before @, something after, and a dot in the domain.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** @param {unknown} value @returns {boolean} */
export function isEmail(value) {
  return typeof value === 'string' && EMAIL_RE.test(value.trim());
}

/** Honeypot: a hidden field only bots fill in. Non-empty = spam. */
export function isSpam(honeypot) {
  return typeof honeypot === 'string' && honeypot.trim() !== '';
}

/**
 * JSON payload for the newsletter endpoint (Formspree/Mailchimp/own function).
 * `extra` (e.g. { side: location.pathname }) goes first, the email last.
 * @param {string} email
 * @param {Record<string, string>} [extra]
 * @returns {Record<string, string>}
 */
export function buildNewsletterPayload(email, extra = {}) {
  return { ...extra, email: (email ?? '').trim() };
}

/**
 * Mailto fallback when there is no endpoint. Null when the recipient is missing.
 * Spaces are encoded as %20 (URLSearchParams gives +), so email clients read the
 * subject and body correctly - the same trick as the form plugin's buildMailto.
 * @param {string} recipient
 * @param {string} email
 * @returns {string|null}
 */
export function buildNewsletterMailto(recipient, email) {
  const to = (recipient ?? '').trim();
  if (!to) return null;
  const params = new URLSearchParams({
    subject: t('footer.newsletter.mailtoSubject'),
    body: t('footer.newsletter.mailtoBody', { email: (email ?? '').trim() }),
  });
  return `mailto:${to}?${params.toString().replace(/\+/g, '%20')}`;
}

/**
 * Origin of an endpoint (for the _headers connect-src instruction in the editor).
 * Null for an invalid URL.
 * @param {string} url
 * @returns {string|null}
 */
export function endpointOrigin(url) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}
