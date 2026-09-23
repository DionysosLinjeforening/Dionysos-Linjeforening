/**
 * Core animations. Registry types with the same version+migrate contract as
 * blocks and background layers (docs/SCHEMA.md): an Urd update can change an
 * animation's props safely via migrations.
 *
 * The entrance animations (fade-in, slide-up, zoom-in) play when the element
 * scrolls into view for visitors (IntersectionObserver). In the editor preview
 * the END state is shown: editing must not trigger endless playback.
 * prefers-reduced-motion is respected (the CSS in base.css zeroes it out too).
 *
 * All the CSS lives in base.css (.urd-anim-*): the definitions here only set
 * classes and duration/delay as CSS variables.
 */

const entranceDefaults = () => ({ duration: 600, delay: 0 });

/* Default step time (ms) between the targets in group entrances: the stagger
   default and per-card animation (applyCardAnimation) share the same rhythm. */
const STAGGER_STEP = 90;

export const coreAnimations = {
  'fade-in': { version: 1, label: 'Fade in', labelKey: 'anim.fadeIn', entrance: true, defaults: entranceDefaults, migrations: {} },
  'slide-up': { version: 1, label: 'Slide up', labelKey: 'anim.slideUp', entrance: true, defaults: entranceDefaults, migrations: {} },
  'zoom-in': { version: 1, label: 'Zoom in', labelKey: 'anim.zoomIn', entrance: true, defaults: entranceDefaults, migrations: {} },
  'hover-lift': { version: 1, label: 'Lift on pointer', labelKey: 'anim.hoverLift', entrance: false, defaults: () => ({}), migrations: {} },
  // Stagger is a GROUP entrance animation (section level only): it does not
  // animate the section itself, but releases the section's card blocks staggered
  // from ONE shared trigger. pattern: 'sequence' (one step per card), 'columns'/
  // 'rows' (cards on the same x/y arrive together, the wave moves sideways) or
  // 'center' (outwards from the middle of the row). delay is a shared base delay
  // (additive since v0.6; older data lacks the field and reads as 0).
  stagger: {
    version: 1, label: 'Stagger (card group)', labelKey: 'anim.stagger', entrance: true, group: true,
    defaults: () => ({ duration: 600, delay: 0, step: STAGGER_STEP, effect: 'slide-up', pattern: 'sequence' }),
    migrations: {},
  },
};

const STAGGER_EFFECTS = ['fade-in', 'slide-up', 'zoom-in'];

/**
 * Delays (ms) for column/row stagger: positions are clustered with a tolerance
 * (cards that are almost aligned count as the same column/row), and the wave moves
 * along by ascending position. Pure function (node-tested).
 * @param {number[]} positions x or y position in px per card (same order as the cards)
 * @param {number} step Step time in ms
 * @param {number} [tolerance] Max px distance counted as the same cluster
 * @returns {number[]}
 */
export function staggerColumnDelays(positions, step, tolerance = 24) {
  const sorted = [...new Set(positions)].sort((a, b) => a - b);
  const clusterOf = new Map();
  let cluster = -1;
  let prev = null;
  for (const p of sorted) {
    if (prev === null || p - prev > tolerance) cluster += 1;
    clusterOf.set(p, cluster);
    prev = p;
  }
  return positions.map((p) => clusterOf.get(p) * step);
}

/**
 * Delays (ms) for the "from the center" stagger: the middle card (or the middle
 * pair for an even count) is released first, then the row waves outwards
 * symmetrically. Index-based (the order of the cards in the section). Pure function
 * (node-tested).
 * @param {number} count Number of cards
 * @param {number} step Step time in ms
 * @returns {number[]}
 */
export function staggerCenterDelays(count, step) {
  const mid = (count - 1) / 2;
  return Array.from({ length: count }, (_, i) => Math.floor(Math.abs(i - mid)) * step);
}

/** Shared observer: adds .urd-anim-in the first time the element is visible. */
let observer = null;
// Group entrances (stagger/per-card): the host is observed, but the TARGETS are released.
const staggerGroups = new WeakMap();

/**
 * Shared release for group entrances (stagger and per-card): in the preview and
 * with reduced motion the end state is shown at once; otherwise the targets are
 * released together the first time the host is visible.
 * @returns {boolean} true when the targets actually wait for visibility
 */
function releaseGroup(host, targets, ctx) {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (ctx.preview || reduced) {
    targets.forEach((el) => el.classList.add('urd-anim-in'));
    return false;
  }
  staggerGroups.set(host, targets);
  entranceObserver().observe(host);
  return true;
}

/**
 * The entrance animation plays when the element becomes visible - also when it is
 * already visible at load (it then fades/slides in just after the page appears, as
 * "Fade in" should). The IntersectionObserver callback runs only after the start
 * state (opacity 0 from CSS) has been painted, so the transition plays cleanly.
 * Elements scrolled to later play when they enter the viewport.
 * (In the editor preview the END state is shown immediately - see applyAnimation
 * - so the observer is only active for visitors and on the published page.)
 */
function entranceObserver() {
  observer ??= new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      // Elements much taller than the viewport (tall sections) never reach a 15 % visible ratio.
      // They trigger instead once the visible part covers more than half the viewport, so the content is not left at opacity 0 forever.
      const tall = entry.rootBounds && entry.intersectionRect.height >= entry.rootBounds.height * 0.5;
      if (entry.intersectionRatio < 0.15 && !tall) continue;
      const el = entry.target;
      observer.unobserve(el);
      // Stagger host: release the CHILDREN (each with its staggered delay), not the host.
      const group = staggerGroups.get(el);
      if (group) group.forEach((child) => child.classList.add('urd-anim-in'));
      else el.classList.add('urd-anim-in');
    }
  }, { threshold: [0.05, 0.1, 0.15] });
  return observer;
}

/**
 * Stagger (group): find the section's card blocks (those without their own
 * animation), give them an entrance effect + a staggered delay by pattern, and
 * release them together from the section's visibility. In preview/reduced-motion
 * the end state is shown at once.
 */
function applyStagger(host, props, ctx) {
  const effect = STAGGER_EFFECTS.includes(props.effect) ? props.effect : 'slide-up';
  const step = Number.isFinite(props.step) ? Math.max(0, props.step) : STAGGER_STEP;
  const base = Number.isFinite(props.delay) ? Math.max(0, props.delay) : 0;
  host.classList.add('urd-anim-stagger');
  // The card blocks: every .urd-block in the section that does not already have its
  // own animation. Decor blocks are excluded (as in the mobile stacking): they are
  // ornament and must not delay the content wave.
  const targets = [...host.querySelectorAll('.urd-block')]
    .filter((el) => !/\burd-anim-/.test(el.className) && !el.dataset.decor);
  if (!targets.length) return;
  const delays = props.pattern === 'columns'
    ? staggerColumnDelays(targets.map((el) => el.offsetLeft), step)
    : props.pattern === 'rows'
      ? staggerColumnDelays(targets.map((el) => el.offsetTop), step)
      : props.pattern === 'center'
        ? staggerCenterDelays(targets.length, step)
        : targets.map((_, i) => i * step);
  targets.forEach((el, i) => {
    el.classList.add(`urd-anim-${effect}`);
    if (props.duration != null) el.style.setProperty('--urd-anim-duration', `${props.duration}ms`);
    el.style.setProperty('--urd-anim-delay', `${base + delays[i]}ms`);
  });
  releaseGroup(host, targets, ctx);
}

/**
 * Hooks an (already version-lifted) animation onto an element.
 * Note: blocks with rotation have an inline transform that beats the transform of
 * the animation classes - only the opacity part then plays.
 *
 * @param {HTMLElement} el
 * @param {string} type Animation type (key in the registry)
 * @param {{duration?: number, delay?: number}} props Lifted props
 * @param {{entrance?: boolean}} def The type definition
 * @param {{preview?: boolean}} [ctx] Render context
 */
export function applyAnimation(el, type, props, def, ctx = {}) {
  // Group animation (stagger): animates the children, not the element itself.
  if (def.group) {
    applyStagger(el, props, ctx);
    return;
  }
  el.classList.add(`urd-anim-${type}`);
  if (props.duration != null) el.style.setProperty('--urd-anim-duration', `${props.duration}ms`);
  if (props.delay != null) el.style.setProperty('--urd-anim-delay', `${props.delay}ms`);
  if (!def.entrance) return;

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  if (ctx.preview || reduced) {
    el.classList.add('urd-anim-in');
    return;
  }
  entranceObserver().observe(el);
}

/**
 * Per-card animation (blocks with the animPerCard flag): the block's entrance
 * animation plays per card with an index-staggered delay from ONE shared trigger
 * (the block's visibility), like stagger; pointer effects are applied to each card.
 * In preview/reduced-motion the end state is shown at once.
 *
 * @param {HTMLElement} el The block element (the trigger)
 * @param {HTMLElement[]} cards The card elements in order
 * @param {string} type Animation type (key in the registry)
 * @param {{duration?: number, delay?: number}} props Lifted props
 * @param {{entrance?: boolean, group?: boolean}} def The type definition
 * @param {{preview?: boolean}} [ctx] Render context
 */
export function applyCardAnimation(el, cards, type, props, def, ctx = {}) {
  // Stagger is section level and makes no sense per card.
  if (def.group || !cards.length) return;
  if (!def.entrance) {
    for (const card of cards) applyAnimation(card, type, props, def, ctx);
    return;
  }
  const base = Math.max(0, Number(props.delay) || 0);
  cards.forEach((card, i) => {
    card.classList.add(`urd-anim-${type}`);
    if (props.duration != null) card.style.setProperty('--urd-anim-duration', `${props.duration}ms`);
    card.style.setProperty('--urd-anim-delay', `${base + i * STAGGER_STEP}ms`);
  });
  if (releaseGroup(el, cards, ctx)) {
    // After the entrance the delay is cleared: the combination rule for entrance +
    // pointer effect (base.css) reuses the variable in the transition, and the lift
    // back must not inherit the card's staggered start.
    for (const card of cards) {
      const clearDelay = (event) => {
        if (event.target !== card || event.propertyName !== 'opacity') return;
        card.style.removeProperty('--urd-anim-delay');
        card.removeEventListener('transitionend', clearDelay);
      };
      card.addEventListener('transitionend', clearDelay);
    }
  }
}
