/**
 * Image tools for the editor: compression to webp in the browser before
 * the image even enters the draft. Publishing materializes the data URLs
 * into files in media/.
 */

const MAX_DIMENSION = 1600;
const TARGET_QUALITY = 0.82;
const FALLBACK_QUALITY = 0.6;
/** Above this the user is warned (git and static hosts like small files). */
export const WARN_BYTES = 400_000;
/* The media limits, set as one whole: images are compressed to webp (max
   1600px, warning above WARN_BYTES), audio is published unchanged (warning
   above WARN_BYTES), video warns above VIDEO_WARN_BYTES and is rejected
   hard above VIDEO_MAX_BYTES - well below the host's file limit
   (Cloudflare Pages 25 MiB), and with margin for the base64 draft in
   localStorage blowing the quota (the draft then lives only in memory
   until it is published, and the editor warns). */
export const VIDEO_WARN_BYTES = 4_000_000;
export const VIDEO_MAX_BYTES = 15_000_000;

/**
 * Compresses an image file to webp, max 1600px on the longest side.
 * SVG is not rasterized: the vector is kept (after sanitizing), because a
 * logo must be sharp at every size. The file name at publish time gets the
 * right extension via mediaExtension.
 * @param {File} file
 * @returns {Promise<{dataUrl: string, bytes: number, width: number, height: number}>}
 */
export async function compressToWebp(file, maxDim = MAX_DIMENSION) {
  if (isSvgFile(file)) return svgToDataUrl(await file.text());
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const toBlob = (quality) => new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
  let blob = await toBlob(TARGET_QUALITY);
  if (blob.size > WARN_BYTES) blob = await toBlob(FALLBACK_QUALITY);

  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
  return { dataUrl, bytes: blob.size, width, height };
}

const SVG_MIME = 'image/svg+xml';

function isSvgFile(file) {
  return file.type === SVG_MIME || /\.svg$/i.test(file.name || '');
}

/**
 * Validates an SVG and packs it as a base64 data URL. The text is NEVER
 * reinterpreted as markup in the live DOM (no DOMParser/innerHTML) - it
 * only goes into a data URL and renders via <img>/CSS (secure static mode,
 * no scripts). The published /media file can still be opened directly, so
 * an SVG with script vectors is REJECTED (not stripped: rejecting is
 * robust, stripping can be bypassed). Logo SVGs never contain
 * scripts/event handlers, so this does not hit real use.
 * @returns {{dataUrl: string, bytes: number, width: number, height: number}}
 */
export function svgToDataUrl(text) {
  const raw = String(text ?? '');
  // Anchored regex barriers (CodeQL recognizes them): it must look like an
  // SVG, and none of the script vectors may be present.
  if (!/<svg[\s>]/i.test(raw)) throw new Error('Invalid SVG');
  if (/<\s*script[\s>]/i.test(raw)
    || /<\s*foreignObject[\s>]/i.test(raw)
    || /\son[a-z]+\s*=/i.test(raw)
    || /javascript:/i.test(raw)) {
    throw new Error('The SVG contains scripts or event handlers and cannot be used');
  }
  const bytes = new Blob([raw]).size;
  // The encodeURIComponent detour lets btoa handle non-ASCII (æøå in title/desc).
  const dataUrl = `data:${SVG_MIME};base64,${btoa(unescape(encodeURIComponent(raw)))}`;
  // Dimensions are read from the OPENING tag (not child elements): viewBox preferred.
  const svgTag = raw.match(/<svg\b[^>]*>/i)?.[0] ?? '';
  const box = svgTag.match(/viewBox\s*=\s*["']\s*([-\d.]+(?:[\s,]+[-\d.]+){3})\s*["']/i)?.[1]?.split(/[\s,]+/).map(Number);
  const width = box?.length === 4 ? box[2] : Number.parseFloat(svgTag.match(/\bwidth\s*=\s*["']?([\d.]+)/i)?.[1]) || 0;
  const height = box?.length === 4 ? box[3] : Number.parseFloat(svgTag.match(/\bheight\s*=\s*["']?([\d.]+)/i)?.[1]) || 0;
  return { dataUrl, bytes, width, height };
}

/**
 * Tightens an SVG's `viewBox` (and width/height) to the motif's actual
 * extent, so dead space around a logo is removed and the image box follows
 * the content. The bounding box (in the SVG's user coordinates) is
 * measured outside this function (canvas pixels in the editor); only the
 * pure text rewrite happens here. A small padding fraction is added.
 * Invalid/empty box -> the text is returned unchanged. Pure function
 * (node-tested).
 * @param {string} svgText
 * @param {{x: number, y: number, width: number, height: number}} bbox
 * @param {number} [padFrac] Padding as a fraction of the longest side (default 0.04)
 * @returns {string}
 */
export function tightSvgViewBox(svgText, bbox, padFrac = 0.04) {
  const raw = String(svgText ?? '');
  if (!bbox || !(bbox.width > 0) || !(bbox.height > 0)) return raw;
  const tag = raw.match(/<svg\b[^>]*>/i)?.[0];
  if (!tag) return raw;
  const r = (n) => Math.round(n * 1000) / 1000;
  const pad = Math.max(bbox.width, bbox.height) * Math.max(0, padFrac);
  const x = r(bbox.x - pad);
  const y = r(bbox.y - pad);
  const w = r(bbox.width + 2 * pad);
  const h = r(bbox.height + 2 * pad);
  const cleaned = tag
    .replace(/\sviewBox\s*=\s*["'][^"']*["']/i, '')
    .replace(/\swidth\s*=\s*["'][^"']*["']/i, '')
    .replace(/\sheight\s*=\s*["'][^"']*["']/i, '');
  const newTag = cleaned.replace(/<svg\b/i, `<svg viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}"`);
  return raw.replace(tag, newTag);
}

/** The viewBox numbers [minX, minY, w, h] from an SVG text, otherwise null. */
export function svgViewBox(svgText) {
  const tag = String(svgText ?? '').match(/<svg\b[^>]*>/i)?.[0] ?? '';
  const vb = tag.match(/viewBox\s*=\s*["']\s*([-\d.]+(?:[\s,]+[-\d.]+){3})\s*["']/i)?.[1]?.split(/[\s,]+/).map(Number);
  if (vb?.length === 4 && vb.every(Number.isFinite)) return vb;
  const w = Number.parseFloat(tag.match(/\bwidth\s*=\s*["']?([\d.]+)/i)?.[1]);
  const h = Number.parseFloat(tag.match(/\bheight\s*=\s*["']?([\d.]+)/i)?.[1]);
  return w > 0 && h > 0 ? [0, 0, w, h] : null;
}

/** Media file extension from a data URL: SVG keeps the vector, the rest is webp. */
export function mediaExtension(dataUrl) {
  const url = dataUrl || '';
  if (/^data:image\/svg\+xml[;,]/.test(url)) return 'svg';
  // Audio files are published unchanged (no canvas path to compress
  // through), so the extension is derived from the MIME type.
  const audio = url.match(/^data:audio\/([a-z0-9.+-]+)[;,]/i)?.[1]?.toLowerCase();
  if (audio) {
    return { mpeg: 'mp3', mp3: 'mp3', mp4: 'm4a', 'x-m4a': 'm4a', aac: 'aac', wav: 'wav', 'x-wav': 'wav', ogg: 'ogg', webm: 'webm', flac: 'flac' }[audio] ?? 'mp3';
  }
  // Video is also published unchanged; the upload only lets mp4/webm in.
  const video = url.match(/^data:video\/([a-z0-9.+-]+)[;,]/i)?.[1]?.toLowerCase();
  if (video) return video === 'webm' ? 'webm' : 'mp4';
  return 'webp';
}

/** File name → safe slug for media/ paths. */
export function slugify(name, fallback = 'image') {
  return name
    .replace(/\.[^.]+$/, '')
    .toLowerCase()
    .replaceAll('æ', 'ae').replaceAll('ø', 'o').replaceAll('å', 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || fallback;
}

/** Short, deterministic hash of the content (same image → same file name). */
export function contentHash(text) {
  let hash = 5381;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) + hash + text.charCodeAt(i)) >>> 0;
  return hash.toString(16).padStart(8, '0');
}
