/**
 * Shared footer: edited in ONE place (site.footer) and shown at the bottom of
 * every page. Additive field since v0.5. Two shapes: the simple one (text
 * lines only) and the rich one (brand, columns, social links, call to action,
 * baseline with links, background layers). Pure logic lives in footer-model.js
 * and footer-cta.js.
 */

import { resolveColor } from './theme.js';
import { isSafeImage } from './nav-model.js';
import { iconSvg, ICON_LIBRARY } from './icons.js';
import { t } from './i18n.js';
import { renderBackgroundLayers } from './render.js';
import {
  footerBrand,
  footerColumns,
  footerSocial,
  footerBaseline,
  footerBaselineLinks,
  footerLinkRow,
  footerCta,
  hasRichFooter,
} from './footer-model.js';
import {
  isEmail,
  isSpam,
  buildNewsletterPayload,
  buildNewsletterMailto,
} from './footer-cta.js';

/**
 * Full layered background (additive since v0.6, shared with sections and nav):
 * a backdrop behind the footer content with the same layer stack as sections.
 * Prepended into .urd-footer-inner so it sits behind the wrap/baseline.
 * Returns true when layers were drawn, in which case the rich shape skips the
 * plain footer.bg color.
 */
function mountFooterBg(footer, inner) {
  const bg = footer.background;
  if (!Array.isArray(bg?.layers) || !bg.layers.length) return false;
  const backdrop = document.createElement('div');
  backdrop.className = 'urd-footer-bg';
  renderBackgroundLayers(backdrop, bg);
  inner.prepend(backdrop);
  return true;
}

/** Social row: one anchor per link, the icon is the engine's own drawn SVG. */
function buildSocial(social) {
  const row = document.createElement('div');
  row.className = 'urd-footer-social';
  for (const s of social) {
    const svg = iconSvg(s.icon);
    if (!svg) continue; // an unknown icon id is dropped silently
    const a = document.createElement('a');
    a.className = 'urd-footer-soc';
    a.href = s.url;
    a.rel = 'noopener noreferrer';
    // The icon's display name (brand name, language neutral) as the accessible
    // name, never the raw icon id.
    a.setAttribute('aria-label', ICON_LIBRARY[s.icon]?.label ?? s.icon);
    // iconSvg is the engine's own, self-authored SVG (same pattern as
    // blocks/icon.js), not user content, so it is safe to set as innerHTML.
    a.innerHTML = svg;
    row.appendChild(a);
  }
  return row;
}

/** A row of links (baseline links or the doormat row). */
function buildLinks(links, className) {
  const el = document.createElement('nav');
  el.className = className;
  for (const link of links) {
    const a = document.createElement('a');
    a.textContent = link.label;
    a.href = link.href;
    if (link.external) a.rel = 'noopener noreferrer';
    el.appendChild(a);
  }
  return el;
}

/**
 * The newsletter form: email field + hidden honeypot + button, submitted with
 * fetch to a configured endpoint (inline confirmation, no page load). Without
 * an endpoint it falls back to mailto. Mirrors the form plugin's submission,
 * but reuses the pure footer-cta.js (the engine must never depend on a
 * plugin). In preview nothing is sent, only the confirmation is shown.
 */
function buildNewsletterForm(cta) {
  const form = document.createElement('form');
  form.className = 'urd-footer-nl';
  form.noValidate = true;

  // Honeypot: hidden field that only bots fill in (CSS keeps it out of sight).
  const honeypot = document.createElement('input');
  honeypot.type = 'text';
  honeypot.name = 'website';
  honeypot.tabIndex = -1;
  honeypot.autocomplete = 'off';
  honeypot.className = 'urd-footer-hp';
  honeypot.setAttribute('aria-hidden', 'true');

  const email = document.createElement('input');
  email.type = 'email';
  email.required = true;
  email.placeholder = t('footer.newsletter.emailPlaceholder');
  email.className = 'urd-footer-nl-email';
  email.setAttribute('aria-label', t('footer.newsletter.emailLabel'));

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'urd-footer-cta-btn';
  submit.textContent = cta.label || t('footer.newsletter.subscribe');

  const status = document.createElement('p');
  status.className = 'urd-footer-nl-status';
  status.setAttribute('role', 'status');

  const row = document.createElement('div');
  row.className = 'urd-footer-nl-row';
  row.append(email, submit);
  form.append(honeypot, row, status);

  const done = () => {
    status.className = 'urd-footer-nl-status ok';
    status.textContent = cta.success || t('footer.newsletter.success');
    form.reset();
  };
  const fail = (msg) => {
    status.className = 'urd-footer-nl-status error';
    status.textContent = msg;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'urd-footer-nl-status';
    status.textContent = '';
    // Honeypot filled in: act as if it succeeded and send nothing (never tip
    // off the bot).
    if (isSpam(honeypot.value)) { done(); return; }
    const value = email.value.trim();
    if (!isEmail(value)) { fail(t('footer.newsletter.invalidEmail')); return; }
    // The editor preview never sends for real, it only shows the confirmation.
    if (document.body.classList.contains('urd-preview')) { done(); return; }

    if (cta.endpoint) {
      submit.disabled = true;
      try {
        const res = await fetch(cta.endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(buildNewsletterPayload(value, { side: location.pathname })),
        });
        if (!res.ok) throw new Error(String(res.status));
        done();
      } catch {
        fail(t('footer.newsletter.sendFailed'));
      } finally {
        submit.disabled = false;
      }
    } else {
      const url = buildNewsletterMailto(cta.recipient, value);
      if (!url) { fail(t('footer.newsletter.missingTarget')); return; }
      window.location.href = url;
      done();
    }
  });

  return form;
}

/** The call to action: heading + subtext + button or newsletter form. */
function buildCta(cta) {
  const block = document.createElement('div');
  block.className = cta.big ? 'urd-footer-bigcta' : 'urd-footer-cta';
  if (cta.heading) {
    const h = document.createElement('div');
    h.className = 'urd-footer-cta-h';
    h.textContent = cta.heading;
    block.appendChild(h);
  }
  if (cta.sub) {
    const p = document.createElement('p');
    p.className = 'urd-footer-cta-sub';
    p.textContent = cta.sub;
    block.appendChild(p);
  }
  if (cta.kind === 'newsletter') {
    block.appendChild(buildNewsletterForm(cta));
  } else {
    const a = document.createElement('a');
    a.className = 'urd-footer-cta-btn';
    a.href = cta.target?.href ?? '#';
    a.textContent = cta.label || t('footer.readMore');
    if (cta.target?.external) a.rel = 'noopener noreferrer';
    block.appendChild(a);
  }
  return block;
}

/**
 * The brand: text, an uploaded logo (image) or both (mirrors the nav logo).
 * Without a logo in image/both mode it falls back to the title.
 */
function buildBrandIdentity(brand) {
  const el = document.createElement('div');
  el.className = 'urd-footer-brand-id';
  const hasLogo = (brand.mode === 'image' || brand.mode === 'both') && isSafeImage(brand.logo);
  const showTitle = brand.mode !== 'image' || !hasLogo;
  if (hasLogo) {
    const img = document.createElement('img');
    img.className = 'urd-footer-logo';
    img.src = brand.logo;
    img.alt = brand.title || '';
    img.loading = 'lazy';
    img.decoding = 'async';
    const h = Number(brand.logoHeight);
    img.style.setProperty('--urd-footer-logo-h', `${Number.isFinite(h) ? Math.min(160, Math.max(16, h)) : 40}px`);
    el.appendChild(img);
  }
  if (showTitle && brand.title) {
    const t = document.createElement('span');
    t.className = 'urd-footer-brand-title';
    t.textContent = brand.title;
    el.appendChild(t);
  }
  return el;
}

/**
 * @param {object} site site.json, already parsed
 * @param {HTMLElement} host The element the footer is built into
 * @param {string} [pageId] Current page id; the footer is hidden on pages
 *   listed in footer.hideOn (per-page exception, visible everywhere by
 *   default).
 */
export function renderFooter(site, host, pageId) {
  host.replaceChildren();
  host.style.removeProperty('background');
  const footer = site.footer;
  // Hidden globally (show off), or turned off on this particular page.
  if (!footer?.show || (pageId && Array.isArray(footer.hideOn) && footer.hideOn.includes(pageId))) {
    host.style.display = 'none';
    return;
  }

  const rich = hasRichFooter(site);
  const baseline = footerBaseline(site);

  // On, but with no content: a visible yet COMPLETELY empty footer. No text,
  // no placeholder, no page title; it fills up once something is entered in
  // the Footer panel. (show off gives no footer at all, handled above.)
  if (!rich && !baseline.length) {
    host.style.display = '';
    const inner = document.createElement('div');
    inner.className = 'urd-footer urd-footer-empty';
    mountFooterBg(footer, inner);
    host.appendChild(inner);
    return;
  }

  // Simple shape: text lines only, no columns or social row.
  if (!rich) {
    host.style.display = '';
    const inner = document.createElement('div');
    inner.className = `urd-footer urd-footer-${footer.align ?? 'center'}`;
    for (const line of String(footer.text ?? '').split('\n')) {
      if (!line.trim()) continue;
      const p = document.createElement('p');
      p.textContent = line;
      inner.appendChild(p);
    }
    mountFooterBg(footer, inner);
    host.appendChild(inner);
    return;
  }

  // Rich shape.
  const brand = footerBrand(site);
  const columns = footerColumns(site);
  const social = footerSocial(site);
  const baselineLinks = footerBaselineLinks(site);
  const linkRow = footerLinkRow(site);
  const cta = footerCta(site);
  host.style.display = '';

  const inner = document.createElement('div');
  // A big CTA always centers; otherwise the alignment choice applies.
  const alignClass = cta && cta.big ? 'center' : footer.align ?? 'left';
  inner.className = `urd-footer urd-footer-rich urd-footer-${alignClass}`;
  // The layered background takes over the surface when present; otherwise the
  // plain background color (default = the theme surface from base.css).
  const hasFooterBgLayers = mountFooterBg(footer, inner);
  if (!hasFooterBgLayers && footer.bg) inner.style.background = resolveColor(footer.bg);

  const wrap = document.createElement('div');
  wrap.className = 'urd-footer-wrap';

  if (cta && cta.big) {
    // Big centered call to action, with an optional brand above.
    if (brand) {
      const bt = document.createElement('div');
      bt.className = 'urd-footer-brand-top';
      bt.appendChild(buildBrandIdentity(brand));
      wrap.appendChild(bt);
    }
    wrap.appendChild(buildCta(cta));
    if (social.length) {
      const sr = buildSocial(social);
      sr.classList.add('urd-footer-social-center');
      wrap.appendChild(sr);
    }
  } else if (brand || columns.length || social.length || cta) {
    const top = document.createElement('div');
    top.className = 'urd-footer-top';
    // Alignment of a wide (two-slot) column's heading: left or centered.
    if (footer.columnsAlign === 'center') top.classList.add('urd-footer-cols-center');

    if (brand || social.length || cta) {
      const brandCol = document.createElement('div');
      brandCol.className = 'urd-footer-brand';
      if (brand) {
        brandCol.appendChild(buildBrandIdentity(brand));
        if (brand.tagline) {
          const tagline = document.createElement('p');
          tagline.className = 'urd-footer-tagline';
          tagline.textContent = brand.tagline;
          brandCol.appendChild(tagline);
        }
      }
      if (cta) brandCol.appendChild(buildCta(cta));
      if (social.length) brandCol.appendChild(buildSocial(social));
      top.appendChild(brandCol);
    }

    // The columns in a grid: --n is the number of slots (a wide column counts
    // as two), so the columns come out equally wide and evenly spaced whatever
    // the link count.
    let n = 0;
    for (const col of columns) {
      const c = document.createElement('div');
      c.className = 'urd-footer-col';
      if (col.wide) { c.classList.add('urd-footer-col-wide'); n += 2; } else { n += 1; }
      if (col.title) {
        const h = document.createElement('h4');
        h.textContent = col.title;
        c.appendChild(h);
      }
      const ul = document.createElement('ul');
      for (const link of col.links) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = link.label;
        a.href = link.href;
        if (link.external) a.rel = 'noopener noreferrer';
        li.appendChild(a);
        ul.appendChild(li);
      }
      c.appendChild(ul);
      top.appendChild(c);
    }
    if (n) top.style.setProperty('--n', String(n));
    wrap.appendChild(top);
  }

  // The doormat link row (Centered / Big CTA): one centered row.
  if (linkRow.length) wrap.appendChild(buildLinks(linkRow, 'urd-footer-linkrow'));

  // The baseline: copyright/text on the left, optional links on the right.
  if (baseline.length || baselineLinks.length) {
    const base = document.createElement('div');
    base.className = 'urd-footer-baseline';
    const left = document.createElement('div');
    left.className = 'urd-footer-baseline-text';
    for (const line of baseline) {
      const span = document.createElement('span');
      span.textContent = line;
      left.appendChild(span);
    }
    base.appendChild(left);
    if (baselineLinks.length) base.appendChild(buildLinks(baselineLinks, 'urd-footer-baseline-links'));
    wrap.appendChild(base);
  }

  inner.appendChild(wrap);
  host.appendChild(inner);
}
