/**
 * Core block: video/embed. Paste a YouTube or Vimeo link and a
 * privacy-friendly embed is rendered (youtube-nocookie / dnt=1).
 * The CSP in _headers has a deliberate frame-src exception for exactly
 * these two hosts; other embeds need a plugin and the owner's own CSP choice.
 */
import { t, ta } from '../i18n.js';

/** Returns the embed URL for a known video service, otherwise null. */
export function embedUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');

  // YouTube ids are alphanumeric with hyphens/underscores; anything else (including extra path segments) is rejected.
  const ytId = (id) => (/^[\w-]{5,}$/.test(id ?? '') ? id : null);

  if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    const id = ytId(url.pathname.startsWith('/embed/')
      ? url.pathname.slice('/embed/'.length)
      : url.pathname.startsWith('/shorts/')
        ? url.pathname.slice('/shorts/'.length)
        : url.searchParams.get('v'));
    return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
  }
  if (host === 'youtu.be') {
    const id = ytId(url.pathname.slice(1));
    return id ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` : null;
  }
  if (host === 'vimeo.com') {
    // Private links have the form vimeo.com/<id>/<hash>; the hash must be passed as ?h= for the player to accept the video.
    const [id, hash] = url.pathname.split('/').filter(Boolean);
    if (!/^\d+$/.test(id ?? '')) return null;
    const h = /^[a-f0-9]+$/i.test(hash ?? '') ? `h=${hash}&` : '';
    return `https://player.vimeo.com/video/${id}?${h}dnt=1`;
  }
  if (host === 'player.vimeo.com') {
    // Only real player paths (/video/<id>) are accepted, and any private hash (?h=) is kept.
    const m = /^\/video\/(\d+)\/?$/.exec(url.pathname);
    if (!m) return null;
    const hash = url.searchParams.get('h');
    const h = /^[a-f0-9]+$/i.test(hash ?? '') ? `h=${hash}&` : '';
    return `https://player.vimeo.com/video/${m[1]}?${h}dnt=1`;
  }
  return null;
}

export const videoBlock = {
  version: 1,
  label: 'Video',
  labelKey: 'blocks.video',
  defaults: () => ({ url: '', title: 'Video' }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{url: string, title?: string}} props
   * @param {object} ctx
   */
  render(el, props, ctx) {
    const src = embedUrl(props.url);
    if (!src) {
      // Without a valid URL: a quiet placeholder, never a crash.
      const hint = document.createElement('div');
      hint.className = 'urd-video-empty';
      hint.textContent = props.url ? t('video.unknownUrl') : t('video.emptyHint');
      el.appendChild(hint);
      return;
    }
    const frame = document.createElement('iframe');
    frame.src = src;
    frame.title = props.title || 'Video';
    frame.setAttribute('allowfullscreen', '');
    frame.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture';
    frame.loading = 'lazy';
    frame.style.cssText = 'width:100%;height:100%;border:0;display:block;';
    el.appendChild(frame);
    // In edit mode a click selects the block instead of starting the player.
    if (ctx.preview && ctx.viewport !== 'mobile') {
      const shield = document.createElement('div');
      shield.className = 'urd-video-shield';
      shield.title = ta('canvas.videoOnPublished');
      el.appendChild(shield);
    }
  },
};
