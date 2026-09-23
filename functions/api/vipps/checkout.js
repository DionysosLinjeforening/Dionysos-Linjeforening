/**
 * Optional payment layer (ADR-0020): creates a Vipps Checkout session for the
 * cart and answers with the session URL; the client redirects there. The
 * amount is recomputed from the git-owned catalogue (never the client's
 * numbers), and the secrets live in the Cloudflare environment. Without
 * configuration the answer is 503, and the checkout block shows a calm
 * unavailable message (the form checkout works unchanged).
 */
import { vippsConfig, validOrderPayload, orderAmountOre, makeReference, buildSession } from '../../_lib/vipps.js';

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  });

export async function onRequestPost({ request, env }) {
  const config = vippsConfig(env);
  if (!config) return json({ error: 'Payment is not configured', code: 'vippsNotConfigured' }, 503);

  let payload = null;
  try {
    payload = await request.json();
  } catch {
    return json({ error: 'Invalid request body', code: 'orderInvalid' }, 400);
  }
  const clean = validOrderPayload(payload);
  if (!clean) return json({ error: 'Invalid order', code: 'orderInvalid' }, 400);

  // The catalogues come from our own deploy (same origin): git is the source of truth for prices.
  const origin = new URL(request.url).origin;
  let catalogs = [];
  try {
    const index = await (await fetch(`${origin}/content/samlinger.json`)).json();
    catalogs = await Promise.all((index.samlinger ?? []).slice(0, 50).map(async (id) => {
      try {
        return await (await fetch(`${origin}/content/samlinger/${encodeURIComponent(id)}.json`)).json();
      } catch {
        return null;
      }
    }));
  } catch {
    return json({ error: 'Could not read the catalogue', code: 'catalogUnreachable' }, 502);
  }
  const amountOre = orderAmountOre(clean.order, catalogs.filter(Boolean));
  if (amountOre == null || amountOre <= 0) {
    return json({ error: 'Unknown product in the order', code: 'orderInvalid' }, 400);
  }

  const body = buildSession({
    amountOre,
    reference: makeReference(),
    order: clean.order,
    contact: clean.contact,
    origin,
    returnPath: clean.returnPath,
    callbackToken: makeReference(),
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  let upstream;
  try {
    upstream = await fetch(`${config.apiBase}/checkout/v3/session`, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'content-type': 'application/json',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        'Ocp-Apim-Subscription-Key': config.subscriptionKey,
        'Merchant-Serial-Number': config.msn,
        'Vipps-System-Name': 'urd',
      },
      body: JSON.stringify(body),
    });
  } catch {
    clearTimeout(timer);
    return json({ error: 'Could not reach Vipps', code: 'vippsUnreachable' }, 502);
  }
  clearTimeout(timer);
  if (!upstream.ok) {
    return json({ error: `Vipps responded ${upstream.status}`, code: 'vippsUpstreamStatus', status: upstream.status }, 502);
  }
  let session = null;
  try {
    session = await upstream.json();
  } catch {
    return json({ error: 'Unexpected response from Vipps', code: 'vippsUnexpected' }, 502);
  }
  if (!session?.checkoutFrontendUrl || !session?.token) {
    return json({ error: 'Unexpected response from Vipps', code: 'vippsUnexpected' }, 502);
  }
  return json({ url: `${session.checkoutFrontendUrl}?token=${encodeURIComponent(session.token)}` });
}
