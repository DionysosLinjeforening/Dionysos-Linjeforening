/**
 * Background layer: solid color. The value can be a theme token ('surface')
 * or a raw color ('#151a23').
 */
import { resolveColor } from '../theme.js';

export const colorLayer = {
  version: 1,
  label: 'Colour',
  labelKey: 'bgLayer.color',
  defaults: () => ({ value: 'bg', opacity: 1 }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{value: string, opacity?: number}} props opacity is additive (older data lacks it)
   */
  render(el, props) {
    el.style.background = resolveColor(props.value);
    el.style.opacity = String(props.opacity ?? 1);
  },
};
