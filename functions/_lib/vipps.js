/**
 * Pure logic for the optional Vipps Checkout payment layer (ADR-0020): reading
 * the configuration, validating the payload, converting to øre against the
 * git-owned catalogue, and the session body for checkout/v3. No fetch here;
 * the endpoint (api/vipps/checkout.js) handles the network. Tested in
 * tests/vipps.test.mjs.
 *
 * The amount is ALWAYS recomputed from the catalogue: the basket lives with
 * the visitor, so anything the client sends may have been tampered with.
 */

/** Reads the configuration from env; null when the payment layer is not set up. */
export function vippsConfig(env) {
  const clientId = env?.VIPPS_CLIENT_ID;
  const clientSecret = env?.VIPPS_CLIENT_SECRET;
  const subscriptionKey = env?.VIPPS_SUBSCRIPTION_KEY;
  const msn = env?.VIPPS_MSN;
  if (!clientId || !clientSecret || !subscriptionKey || !msn) return null;
  return {
    clientId,
    clientSecret,
    subscriptionKey,
    msn,
    apiBase: env.VIPPS_API_BASE || 'https://api.vipps.no',
  };
}

/** Entry ids follow the same regime as the collections (anchored, the CodeQL lesson). */
const ID_RE = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Validates and cleans the order payload from the client. Only the shape is
 * accepted: order lines with a known id form and clamped quantities, contact
 * fields as short strings. Prices from the client are deliberately ignored.
 * @returns {{order: Array<{id: string, qty: number, variant?: string}>, contact: {name: string, email: string, phone: string, comment: string}}|null}
 */
export function validOrderPayload(payload) {
  if (!payload || typeof payload !== 'object') return null;
  const rawOrder = Array.isArray(payload.order) ? payload.order : [];
  if (!rawOrder.length || rawOrder.length > 50) return null;
  const order = [];
  for (const line of rawOrder) {
    if (!line || typeof line !== 'object') return null;
    const id = String(line.id ?? '');
    if (!ID_RE.test(id) || id.length > 80) return null;
    const qty = Math.trunc(Number(line.qty));
    if (!Number.isFinite(qty) || qty < 1 || qty > 99) return null;
    const clean = { id, qty };
    if (line.variant != null) {
      const variant = String(line.variant).slice(0, 80);
      if (variant) clean.variant = variant;
    }
    order.push(clean);
  }
  const field = (value) => String(value ?? '').slice(0, 200).trim();
  // Return path: an internal path on our own site (anchored; never a full URL from the client).
  const rawPath = String(payload.returnPath ?? '/');
  const returnPath = /^\/[a-z0-9\-/]*$/.test(rawPath) && rawPath.length <= 200 ? rawPath : '/';
  return {
    order,
    returnPath,
    contact: {
      name: field(payload.contact?.name),
      email: field(payload.contact?.email),
      phone: field(payload.contact?.phone),
      comment: field(payload.contact?.comment),
    },
  };
}

/**
 * Computes the order total in øre against the catalogues (kind products). An
 * unknown id or a product without a price gives null (the order is rejected);
 * the member price is a trust-based display and is never charged (ADR-0020).
 * @param {Array<{id: string, qty: number}>} order Cleaned order (validOrderPayload)
 * @param {Array<{kind?: string, entries?: Array}>} catalogs The collection files
 * @returns {number|null}
 */
export function orderAmountOre(order, catalogs) {
  const prices = new Map();
  for (const catalog of catalogs) {
    if (catalog?.kind !== 'products') continue;
    for (const entry of catalog.entries ?? []) {
      const price = Number(entry?.price);
      if (entry?.id && Number.isFinite(price) && price >= 0 && !prices.has(entry.id)) {
        prices.set(entry.id, price);
      }
    }
  }
  let sum = 0;
  for (const line of order) {
    const price = prices.get(line.id);
    if (price == null) return null;
    sum += Math.round(price * 100) * line.qty;
  }
  return sum;
}

/** Session reference in the Vipps form [a-zA-Z0-9-]{8,50}. */
export function makeReference() {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `urd-${hex}`;
}

/**
 * The body for POST {apiBase}/checkout/v3/session. The order lines and the
 * contact fields ride along as the description, so the order can be read in
 * the Vipps portal; the site stores nothing itself (ADR-0020).
 */
export function buildSession({ amountOre, reference, order, contact, origin, returnPath, callbackToken }) {
  const lines = order
    .map((line) => `${line.qty} x ${line.id}${line.variant ? ` (${line.variant})` : ''}`)
    .join(', ');
  const who = [contact.name, contact.email, contact.phone].filter(Boolean).join(' / ');
  return {
    merchantInfo: {
      callbackUrl: `${origin}/api/vipps/callback`,
      returnUrl: `${origin}${returnPath ?? '/'}?ordered=1`,
      callbackAuthorizationToken: callbackToken,
    },
    transaction: {
      amount: { value: amountOre, currency: 'NOK' },
      reference,
      paymentDescription: `${lines}${who ? ` - ${who}` : ''}`.slice(0, 100),
    },
  };
}
