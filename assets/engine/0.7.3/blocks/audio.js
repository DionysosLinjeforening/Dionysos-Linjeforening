/**
 * Core block: audio. Native `<audio controls>` with a git-owned file from
 * media/ (the CSP's default-src 'self' covers playback; no third party, no
 * tracking). Optional title above the player; preload="metadata" so only the
 * duration is fetched before playback.
 */
// Called only in preview (after the admin dictionary has loaded): never at module level.
import { ta, adminLocaleReady } from '../i18n.js';

export const audioBlock = {
  version: 1,
  // Natural height in the mobile row grid (the player's height is the browser's).
  autoGrow: true,
  label: 'Audio',
  labelKey: 'blocks.audio',
  defaults: () => ({ src: '', title: '', loop: false }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{src?: string, title?: string, loop?: boolean}} props
   * @param {object} ctx Render context
   */
  render(el, props, ctx) {
    const editable = Boolean(ctx.preview) && ctx.viewport !== 'mobile';
    // With no file: a quiet placeholder in the editor; visitors see nothing.
    if (!props.src) {
      if (ctx.preview) {
        const empty = document.createElement('div');
        empty.className = 'urd-audio-empty';
        adminLocaleReady.then(() => {
          if (empty.isConnected) empty.textContent = ta('canvas.audioEmpty');
        });
        el.appendChild(empty);
      }
      return;
    }

    const host = document.createElement('div');
    host.className = 'urd-audio';
    el.appendChild(host);

    if (props.title) {
      const title = document.createElement('div');
      title.className = 'urd-audio-title';
      title.textContent = props.title;
      host.appendChild(title);
      if (editable) {
        try {
          title.contentEditable = 'plaintext-only';
        } catch {
          title.contentEditable = 'true';
        }
        title.addEventListener('input', () => {
          window.parent?.postMessage({
            type: 'urd-edit',
            sectionId: ctx.section.id,
            blockId: el.dataset.blockId,
            props: { ...props, title: title.textContent ?? '' },
          }, location.origin);
        });
      }
    }

    const audio = document.createElement('audio');
    audio.controls = true;
    audio.preload = 'metadata';
    if (props.loop) audio.loop = true;
    audio.src = props.src;
    host.appendChild(audio);

    if (editable) {
      // Help chip (ADR-0008): file choice and size considerations need explaining.
      Promise.all([import('../hint.js'), adminLocaleReady]).then(([{ attachHint }]) => {
        if (!el.isConnected || el.querySelector('.urd-hint-chip')) return;
        attachHint(el, {
          title: ta('hintAudio.title'),
          lines: [ta('hintAudio.l1'), ta('hintAudio.l2'), ta('hintAudio.l3')],
        });
      });
    }
  },
};
