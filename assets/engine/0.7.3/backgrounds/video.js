/**
 * Background layer: video (feature map C6). Self-hosted mp4/webm loop from
 * media/ (or a data URL for unpublished uploads in a draft; publishing
 * materializes it into a file, the same flow as the image layer).
 * Privacy-friendly: the file is git-owned, no third-party hosts.
 *
 * Playback: autoplay requires muted + playsinline; the loop is paused outside
 * the viewport via a shared IntersectionObserver (logic, not animation,
 * ADR-0011). With prefers-reduced-motion video never plays: the poster is
 * shown as a still image, and without a poster the layer is left out so the
 * layers below show through - always an end state, never hidden content.
 */

import { isSafeImage } from '../nav-model.js';
import { bgPosition, mountLayerParallax } from './image.js';

/* The source goes straight into the video element's src: the same anchored guard
   pattern as the image layers (isSafeImage), limited to media/ paths and video data URLs. */
const SAFE_VIDEO_RE = /^(?:data:video\/[\w.+-]+;base64,[A-Za-z0-9+/=]+|\/media\/[\w%./-]+\.(?:mp4|webm))$/i;

/** @param {unknown} src @returns {boolean} */
export function isSafeVideo(src) {
  return typeof src === 'string' && SAFE_VIDEO_RE.test(src);
}

// Shared observer: background videos play only while the section is in the viewport.
// Detached elements (after a re-render) are weeded out in the callback.
let videoObserver = null;
function observeVideo(video) {
  videoObserver ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.target.isConnected) {
        videoObserver.unobserve(entry.target);
        continue;
      }
      // play() can be rejected by the autoplay policy; the poster / first frame
      // then stays, which is a clean end state.
      if (entry.isIntersecting) entry.target.play().catch(() => {});
      else entry.target.pause();
    }
  }, { threshold: 0 });
  videoObserver.observe(video);
}

const fillStyle = (el, fit, x, y) => {
  el.style.position = 'absolute';
  el.style.inset = '0';
  el.style.width = '100%';
  el.style.height = '100%';
  el.style.objectFit = fit === 'contain' ? 'contain' : 'cover';
  el.style.objectPosition = bgPosition(x, y);
};

export const videoLayer = {
  version: 1,
  label: 'Video',
  labelKey: 'bgLayer.video',
  defaults: () => ({ src: '', poster: '', fit: 'cover', x: 0.5, y: 0.5, opacity: 1, parallax: 0 }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{src: string, poster?: string, fit?: 'cover'|'contain', x?: number, y?: number, opacity?: number, parallax?: number}} props
   */
  render(el, props) {
    if (!isSafeVideo(props.src)) return;
    el.style.opacity = String(props.opacity ?? 1);

    // Reduced motion: the poster as a still image (same framing).
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      if (!isSafeImage(props.poster)) return;
      const still = document.createElement('img');
      still.className = 'urd-bg-video-poster';
      still.alt = '';
      still.setAttribute('aria-hidden', 'true');
      still.src = props.poster;
      fillStyle(still, props.fit, props.x, props.y);
      el.appendChild(still);
      return;
    }

    const video = document.createElement('video');
    video.className = 'urd-bg-video';
    video.muted = true;
    video.setAttribute('muted', '');
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    // The observer starts playback (never the autoplay attribute), and with
    // preload=metadata the film itself is loaded only when the section approaches
    // the viewport - a video below the fold otherwise costs the whole file on load.
    video.preload = 'metadata';
    video.disablePictureInPicture = true;
    // Pure decoration: the background is never announced by screen readers.
    video.setAttribute('aria-hidden', 'true');
    if (isSafeImage(props.poster)) video.poster = props.poster;
    video.src = props.src;
    fillStyle(video, props.fit, props.x, props.y);
    el.appendChild(video);
    observeVideo(video);
    // Parallax (additive): the image layer's machinery; cover overscans the edges,
    // contain shifts freely with space around it.
    if (props.parallax > 0) mountLayerParallax(video, props.parallax, 0, props.fit === 'contain' ? 'contain' : 'cover');
  },
};
