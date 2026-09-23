/**
 * Background layer: grain. A subtle noise texture over the other layers, made
 * with a small inline SVG (feTurbulence) - no image files needed.
 */
const NOISE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2"/></filter><rect width="128" height="128" filter="url(%23n)"/></svg>`;
const NOISE_URI = `url("data:image/svg+xml,${encodeURIComponent(NOISE_SVG).replaceAll('%2523', '%23')}")`;

export const grainLayer = {
  version: 1,
  label: 'Grain',
  labelKey: 'bgLayer.grain',
  defaults: () => ({ opacity: 0.06 }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{opacity: number}} props
   */
  render(el, props) {
    el.style.backgroundImage = NOISE_URI;
    el.style.backgroundRepeat = 'repeat';
    // Without the fallback, an old layer with no opacity field would render at full strength (a heavy noise surface).
    el.style.opacity = String(props.opacity ?? 0.06);
  },
};
