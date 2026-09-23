/**
 * Shared visitor-side protection for rich text (text blocks and collection
 * entries): pasted or stored HTML can carry event attributes or active
 * elements, and legitimate formatting never needs either.
 * The owner is trusted for MARKUP; executable code is always stripped at render.
 */
export function stripActiveContent(root) {
  for (const el of root.querySelectorAll('*')) {
    for (const attr of [...el.attributes]) {
      if (attr.name.toLowerCase().startsWith('on')) el.removeAttribute(attr.name);
    }
    if (/^\s*javascript:/i.test(el.getAttribute?.('href') ?? '')) el.removeAttribute('href');
  }
  root.querySelectorAll('script, iframe, object, embed').forEach((n) => n.remove());
}

/**
 * Plain text from rich text (cart lines, emptiness checks, panel summaries):
 * the markup is parsed in an inert document and the text content read out,
 * so no tag remnants can survive the way they can with a regex pass.
 */
export function plainText(html) {
  const doc = new DOMParser().parseFromString(String(html ?? ''), 'text/html');
  return (doc.body.textContent ?? '').trim();
}
