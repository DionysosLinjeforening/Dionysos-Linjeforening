/**
 * Maps theme.tokens from site.json to CSS variables on :root.
 * tokens.color.bg → --urd-color-bg, tokens.font.heading → --urd-font-heading, etc.
 *
 * The light/dark toggle: if the theme has an `alt` field, the site exists
 * in two modes. `theme.scheme` says what the MAIN theme is (light/dark,
 * default light); alt tokens override the main tokens in the opposite mode.
 * A first visit follows prefers-color-scheme; an active choice made with
 * the toggle (in the nav) is remembered in localStorage and wins on the
 * next visit.
 */

/** localStorage key for the visitor's active choice ('light'/'dark'). */
const MODE_KEY = 'urd-theme-mode';

/** Current mode in this session (null before the first applyTheme). */
let activeMode = null;

/**
 * Pure mode resolution: a stored choice wins, otherwise the OS preference.
 * @param {string|undefined} scheme theme.scheme ('light'/'dark', default light)
 * @param {string|null} stored Stored choice ('light'/'dark') or null
 * @param {boolean} prefersDark The visitor's prefers-color-scheme
 * @returns {'light'|'dark'}
 */
export function resolveThemeMode(scheme, stored, prefersDark) {
  if (stored === 'light' || stored === 'dark') return stored;
  // Without an alt theme only the main mode exists; scheme is then only
  // used as the answer.
  return prefersDark ? 'dark' : 'light';
}

/**
 * Pure token selection for a mode: the main tokens, overridden group by
 * group with the alt tokens when the mode is the opposite of the main
 * theme's scheme. Without an alt theme the main tokens are returned
 * regardless of mode.
 * @param {{tokens: object, scheme?: string, alt?: {tokens: object}}} theme
 * @param {'light'|'dark'} mode
 * @returns {Record<string, Record<string, string>>}
 */
export function activeTokens(theme, mode) {
  const main = theme.tokens || {};
  const mainScheme = theme.scheme === 'dark' ? 'dark' : 'light';
  if (!theme.alt?.tokens || mode === mainScheme) return main;
  const merged = {};
  for (const group of new Set([...Object.keys(main), ...Object.keys(theme.alt.tokens)])) {
    merged[group] = { ...main[group], ...theme.alt.tokens[group] };
  }
  return merged;
}

function readStoredMode() {
  // localStorage may be disabled (private mode); then the OS preference is followed.
  try { return localStorage.getItem(MODE_KEY); } catch { return null; }
}

function applyTokens(tokens, root) {
  for (const [group, values] of Object.entries(tokens)) {
    for (const [name, value] of Object.entries(values)) {
      root.style.setProperty(`--urd-${group}-${name}`, value);
      // Base copy of the color tokens: the sections' role sets reference
      // these (--urd-base-*) instead of the live --urd-color-*, so a role
      // that swaps bg<->text does not create a var() cycle (see SECTION_THEMES).
      if (group === 'color') root.style.setProperty(`--urd-base-${name}`, value);
    }
  }
}

/* Anchored allowlist for a CSS token value (a CodeQL-friendly barrier): only
   characters that occur in colors/lengths/font stacks. The char class excludes
   ; { } < > : @, and url()/comments/expression are rejected explicitly.
   Invalid tokens are dropped, so a logged-in publisher cannot inject arbitrary
   CSS through the theme (buildThemeCss writes raw text, not via
   style.setProperty which rejects silently). */
const SAFE_CSS_VALUE = /^[a-zA-Z0-9#%.,()'"\s+\-*/]+$/;
export function safeCssValue(value) {
  return typeof value === 'string'
    && SAFE_CSS_VALUE.test(value)
    && !/url\(|\/\*|\*\/|expression/i.test(value);
}

/**
 * Builds a static CSS string that sets the theme's color tokens as
 * light-dark(light, dark) behind @supports, with a single-value fallback
 * (the main theme) for older browsers. Materialized into content/theme.css
 * at publish time and loaded render-blocking, so the first paint has the
 * site's actual colors without FOUC. color-scheme follows the OS; a manual
 * choice overrides via [data-urd-theme] (light-dark() picks its side from
 * the computed color-scheme). Pure function, reuses activeTokens.
 * @param {{tokens: object, scheme?: string, alt?: {tokens: object}}} theme
 * @returns {string}
 */
export function buildThemeCss(theme) {
  const main = theme.tokens || {};
  const light = activeTokens(theme, 'light');
  const dark = activeTokens(theme, 'dark');
  const mainScheme = theme.scheme === 'dark' ? 'dark' : 'light';

  const fallback = [];     // the main theme as single values (all tokens)
  const dualColor = [];    // colors that differ light/dark -> light-dark()
  const altNonColor = [];  // non-color differing per mode (rare)

  const groups = new Set([...Object.keys(main), ...Object.keys(light), ...Object.keys(dark)]);
  for (const group of groups) {
    const isColor = group === 'color';
    const names = new Set([
      ...Object.keys(main[group] || {}),
      ...Object.keys(light[group] || {}),
      ...Object.keys(dark[group] || {}),
    ]);
    for (const name of names) {
      const mv = main[group]?.[name];
      const lv = light[group]?.[name];
      const dv = dark[group]?.[name];
      if (safeCssValue(mv)) {
        fallback.push(`  --urd-${group}-${name}: ${mv};`);
        if (isColor) fallback.push(`  --urd-base-${name}: ${mv};`);
      }
      if (lv === dv) continue; // equal in both modes: the single value suffices
      if (isColor && safeCssValue(lv) && safeCssValue(dv)) {
        dualColor.push({ name, lv, dv });
      } else if (!isColor && safeCssValue(lv) && safeCssValue(dv)) {
        altNonColor.push({ group, name, lv, dv });
      }
    }
  }

  // Without a dark variant (alt) the site is one theme: lock color-scheme
  // to it, no light-dark() and no toggle. With a variant, color-scheme
  // follows the OS and light-dark() carries both sets; a manual choice
  // overrides via [data-urd-theme].
  const hasDual = dualColor.length > 0 || altNonColor.length > 0;
  let css = `:root {\n  color-scheme: ${hasDual ? 'light dark' : mainScheme};\n${fallback.join('\n')}\n}\n`;
  if (!hasDual) return css;

  const ld = [];
  for (const c of dualColor) {
    const v = `light-dark(${c.lv}, ${c.dv})`;
    ld.push(`    --urd-color-${c.name}: ${v};`);
    ld.push(`    --urd-base-${c.name}: ${v};`);
  }
  css += '@supports (color: light-dark(#000, #fff)) {\n';
  if (ld.length) css += `  :root {\n${ld.join('\n')}\n  }\n`;
  // Manual choice: color-scheme decides which side light-dark() picks.
  css += '  :root[data-urd-theme="light"] { color-scheme: light; }\n';
  css += '  :root[data-urd-theme="dark"] { color-scheme: dark; }\n';
  if (altNonColor.length) {
    // Non-color cannot use light-dark(): steer per mode via media + attribute.
    const rows = (pick) => altNonColor.map((t) => `    --urd-${t.group}-${t.name}: ${pick(t)};`).join('\n');
    css += `  @media (prefers-color-scheme: dark) {\n    :root {\n${altNonColor.map((t) => `      --urd-${t.group}-${t.name}: ${t.dv};`).join('\n')}\n    }\n  }\n`;
    css += `  :root[data-urd-theme="light"] {\n${rows((t) => t.lv)}\n  }\n`;
    css += `  :root[data-urd-theme="dark"] {\n${rows((t) => t.dv)}\n  }\n`;
  }
  css += '}\n';
  return css;
}

/** Does the browser support native light-dark()? (Baseline 2024; otherwise the JS fallback.) */
function supportsLightDark() {
  return typeof window !== 'undefined' && !!window.CSS?.supports?.('color', 'light-dark(#000, #fff)');
}

/**
 * @param {{tokens: Record<string, Record<string, string>>}} theme The `theme` object from site.json
 * @param {HTMLElement} [root] Element the variables are set on (default: document.documentElement)
 */
export function applyTheme(theme, root = document.documentElement) {
  const stored = readStoredMode();
  activeMode = resolveThemeMode(
    theme.scheme,
    stored,
    window.matchMedia('(prefers-color-scheme: dark)').matches,
  );
  if (supportsLightDark()) {
    // Modern path: the CSS carries light-dark(). Inject the draft's/site's
    // tokens as a <style> (so preview and live changes work), and let a
    // stored choice override the OS via data-urd-theme. No inline
    // --urd-color-* (it would clobber light-dark()).
    const doc = root.ownerDocument || document;
    let style = doc.getElementById('urd-theme');
    if (!style) {
      style = doc.createElement('style');
      style.id = 'urd-theme';
      doc.head.appendChild(style);
    }
    style.textContent = buildThemeCss(theme);
    if (stored === 'light' || stored === 'dark') root.setAttribute('data-urd-theme', stored);
    else root.removeAttribute('data-urd-theme');
  } else {
    // Fallback (no light-dark()): JS sets the tokens inline for the resolved mode.
    applyTokens(activeTokens(theme, activeMode), root);
  }
}

/** Current mode ('light'/'dark'); set by applyTheme at boot. */
export function themeMode() {
  return activeMode ?? 'light';
}

/**
 * Switches mode (the nav toggle), remembers the choice and reapplies tokens.
 * @param {{tokens: object, scheme?: string, alt?: object}} theme
 * @returns {'light'|'dark'} The new mode
 */
export function toggleThemeMode(theme) {
  activeMode = themeMode() === 'dark' ? 'light' : 'dark';
  try { localStorage.setItem(MODE_KEY, activeMode); } catch { /* private mode */ }
  const root = document.documentElement;
  if (supportsLightDark()) {
    // color-scheme (via data-urd-theme) decides which side light-dark() picks.
    root.setAttribute('data-urd-theme', activeMode);
  } else {
    applyTokens(activeTokens(theme, activeMode), root);
  }
  return activeMode;
}

/**
 * Resolves a color value from content to CSS. Simple names ('accent', 'bg')
 * are interpreted as theme tokens and become var(--urd-color-<name>);
 * anything else ('#7c5cff', 'rgb(...)') is used raw.
 * @param {string} value
 * @returns {string}
 */
export function resolveColor(value) {
  return /^[a-z][a-z0-9-]*$/.test(value) ? `var(--urd-color-${value})` : value;
}

/**
 * Ready-made section themes (role sets): a role overrides the section's
 * color tokens. The values reference the BASE copies (--urd-base-*, set by
 * applyTokens), not the live --urd-color-*, so a role that swaps bg<->text
 * (inverse) does not create a var() cycle, and light/dark follows along by
 * itself. The blocks inherit the overrides via resolveColor -> var(--urd-color-*).
 */
export const SECTION_THEMES = {
  surface: {
    '--urd-color-bg': 'var(--urd-base-surface)',
    '--urd-color-surface': 'color-mix(in srgb, var(--urd-base-text) 7%, var(--urd-base-surface))',
  },
  accent: {
    '--urd-color-bg': 'var(--urd-base-accent)',
    '--urd-color-surface': 'color-mix(in srgb, var(--urd-base-accent) 82%, #000)',
    '--urd-color-text': 'var(--urd-base-accent-text)',
    '--urd-color-accent': 'var(--urd-base-accent-text)',
    '--urd-color-accent-text': 'var(--urd-base-accent)',
  },
  inverse: {
    '--urd-color-bg': 'var(--urd-base-text)',
    // 78/22 (not 88/12): the cards (surface) need enough separation from
    // the inverted background, or they turn muddy.
    '--urd-color-surface': 'color-mix(in srgb, var(--urd-base-text) 78%, var(--urd-base-bg))',
    '--urd-color-text': 'var(--urd-base-bg)',
  },
  // Soft: the accent as a faint pastel tint across the whole section.
  soft: {
    '--urd-color-bg': 'color-mix(in srgb, var(--urd-base-accent) 12%, var(--urd-base-bg))',
    '--urd-color-surface': 'color-mix(in srgb, var(--urd-base-accent) 8%, var(--urd-base-surface))',
  },
  // Muted: a low-key gray-toned zone with softer text for secondary content.
  muted: {
    '--urd-color-bg': 'color-mix(in srgb, var(--urd-base-text) 5%, var(--urd-base-bg))',
    '--urd-color-surface': 'color-mix(in srgb, var(--urd-base-text) 10%, var(--urd-base-bg))',
    '--urd-color-text': 'color-mix(in srgb, var(--urd-base-text) 82%, var(--urd-base-bg))',
  },
  // Deep: inverse with an accent tint - the contrast zone takes on the brand color.
  deep: {
    '--urd-color-bg': 'color-mix(in srgb, var(--urd-base-accent) 30%, var(--urd-base-text))',
    '--urd-color-surface': 'color-mix(in srgb, var(--urd-base-accent) 40%, var(--urd-base-text))',
    '--urd-color-text': 'var(--urd-base-bg)',
  },
  // Highlighted cards: the section stays Standard, only the surface (the cards) is tinted.
  highlighted: {
    '--urd-color-surface': 'color-mix(in srgb, var(--urd-base-accent) 14%, var(--urd-base-surface))',
  },
};

/** Display-name KEYS for the section-theme picker (Standard is "no role"):
 *  the ta lookup happens at the consumer; this module lives in the visitor
 *  closure and can never call ta() at module level. */
export const SECTION_THEME_LABELS = {
  surface: 'sectionTheme.surface',
  accent: 'sectionTheme.accent',
  inverse: 'sectionTheme.inverse',
  soft: 'sectionTheme.soft',
  muted: 'sectionTheme.muted',
  deep: 'sectionTheme.deep',
  highlighted: 'sectionTheme.highlighted',
};

/** Every token key any role can set - used to reset before a new role. */
const SECTION_THEME_KEYS = [...new Set(Object.values(SECTION_THEMES).flatMap(Object.keys))];

/**
 * The token overrides for a role (pure function, node-tested). Standard,
 * absence and an unknown role yield no overrides ({}).
 * @param {string|undefined} role
 * @returns {Record<string, string>}
 */
export function sectionThemeVars(role) {
  return SECTION_THEMES[role] ?? {};
}

/**
 * Applies (or resets) a section's role set on an element. Resets ALL
 * possible role keys first, so switching role (or back to Standard) on an
 * incremental rerender never leaves the previous role's overrides behind.
 * @param {HTMLElement} host
 * @param {string|undefined} role
 */
export function applySectionTheme(host, role) {
  const vars = sectionThemeVars(role);
  for (const key of SECTION_THEME_KEYS) {
    if (key in vars) host.style.setProperty(key, vars[key]);
    else host.style.removeProperty(key);
  }
}

/**
 * WCAG relative luminance (0..1) of a #rrggbb/#rgb color, or null for a
 * value that is not a hex (token names/color-mix cannot be measured
 * statically).
 * @param {string} hex
 * @returns {number|null}
 */
export function relativeLuminance(hex) {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(typeof hex === 'string' ? hex.trim() : '');
  if (!m) return null;
  let h = m[1];
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const chan = (v) => {
    const s = parseInt(v, 16) / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * chan(h.slice(0, 2)) + 0.7152 * chan(h.slice(2, 4)) + 0.0722 * chan(h.slice(4, 6));
}

/**
 * WCAG contrast ratio (1..21) between two hex colors, or null when one of
 * them is not a measurable hex (token names/color-mix). Pure function,
 * node-tested.
 * @param {string} a @param {string} b
 * @returns {number|null}
 */
export function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  if (la == null || lb == null) return null;
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
