/**
 * Vipps callback (ADR-0020): acknowledges receipt of payment updates. The
 * site is static and has no order database; orders are read in the Vipps
 * portal, so the callback stores nothing.
 */
export async function onRequestPost() {
  return new Response(null, { status: 200 });
}
