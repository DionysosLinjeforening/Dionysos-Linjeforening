/**
 * Core block: shape. Lines and arrows (direction via the frame's rot field),
 * circles/ellipses, rectangles and triangles. Decorative elements for free
 * composition.
 */
import { resolveColor } from '../theme.js';

export const shapeBlock = {
  version: 1,
  label: 'Shape',
  labelKey: 'blocks.shape',
  defaults: () => ({ kind: 'line', color: 'accent', thickness: 2, fill: null }),
  migrations: {},
  /**
   * @param {HTMLElement} el
   * @param {{kind: 'line'|'arrow'|'circle'|'rect'|'triangle', color: string, thickness: number, fill: string|null}} props
   * @param {object} ctx
   */
  render(el, props, ctx) {
    const color = resolveColor(props.color);

    if (props.kind === 'line' || props.kind === 'arrow') {
      // A horizontal line centred in the frame; direction comes from rot.
      const line = document.createElement('div');
      line.style.cssText = `position:absolute;left:0;right:${props.kind === 'arrow' ? '10px' : '0'};top:50%;transform:translateY(-50%);height:${props.thickness}px;background:${color};`;
      el.appendChild(line);
      if (props.kind === 'arrow') {
        const head = document.createElement('div');
        const size = Math.max(6, props.thickness * 4);
        head.style.cssText = `position:absolute;right:0;top:50%;transform:translateY(-50%);width:0;height:0;border-top:${size}px solid transparent;border-bottom:${size}px solid transparent;border-left:${size * 1.4}px solid ${color};`;
        el.appendChild(head);
      }
      return;
    }

    if (props.kind === 'triangle') {
      // A triangle is drawn as a filled surface (clip-path cannot take a stroke).
      const tri = document.createElement('div');
      tri.style.cssText = `position:absolute;inset:0;background:${resolveColor(props.fill ?? props.color)};clip-path:polygon(50% 0, 100% 100%, 0 100%);`;
      el.appendChild(tri);
      return;
    }

    // circle / rect: a circle becomes an ellipse in non-square frames.
    if (props.fill) {
      el.style.background = resolveColor(props.fill);
    } else {
      el.style.border = `${props.thickness}px solid ${color}`;
    }
    if (props.kind === 'circle') el.style.borderRadius = '50%';
  },
};
