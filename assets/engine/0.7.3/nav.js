/**
 * Builds the navigation from site.json - the page register (site.pages) and
 * the nav data (site.nav). Nothing is hardcoded: nav items with `page` look
 * up their path in the page register; items with `href` are external links.
 *
 * Submenus follow the WAI-ARIA "disclosure navigation" pattern (not
 * menubar): real buttons with aria-expanded/aria-controls, natural Tab
 * order and no role="menu". An item with both its own target and a submenu
 * renders as a link plus its own arrow button, so the page stays reachable.
 * The mobile menu (the burger) is a non-modal disclosure of the same list,
 * styled by body.urd-mobile (the breakpoint is set in urd.js from site.json).
 */

import { navItems, navClasses, navSurface, navSubSurface, navLayerVeil, hostClasses, clampSideWidth, clampBorderWidth, navScrollState, navSizeVars, subOpenMode, isSafeImage } from './nav-model.js';
import { themeMode, toggleThemeMode, resolveColor } from './theme.js';
import { renderBackgroundLayers } from './render.js';
import { readCart, cartCount, onCartChange } from './shop.js';
import { createCartDrawer } from './blocks/cart.js';
import { iconSvg } from './icons.js';
import { t, ta } from './i18n.js';

/** How long the submenu stays open after the pointer leaves the item. */
const HOVER_CLOSE_DELAY = 250;

// renderNav runs again for every site draft from the editor; the controller
// detaches the previous render's listeners (including those on document) so
// there is never more than one active set.
let navController = null;

// Side column on narrow windows: below 900px the menu renders as a REGULAR
// top bar (effective variant bar) with horizontal items; the burger only
// appears at the mobile breakpoint, as for the bar variant. A separate
// break edge independent of the mobile breakpoint AND of the editor's
// viewport choice, so it also works in the preview's desktop mode.
const narrowMq = window.matchMedia('(max-width: 900px)');
let lastRender = null;
narrowMq.addEventListener('change', () => {
  const variant = lastRender?.site.nav.variant;
  if (variant === 'side-left' || variant === 'side-right') {
    renderNav(lastRender.site, lastRender.host);
  }
});

const svg = (path) =>
  `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const CHEVRON = svg('<path d="M6 9l6 6 6-6"/>');
const BURGER = svg('<path d="M4 6h16M4 12h16M4 18h16"/>');
const SUN = svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>');
const MOON = svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>');

/**
 * @param {object} site site.json, already parsed
 * @param {HTMLElement} host Element the navigation is built into
 */
export function renderNav(site, host) {
  navController?.abort();
  navController = new AbortController();
  const signal = navController.signal;
  lastRender = { site, host };

  // Narrow windows: the side variant renders as a regular top bar
  // (effective variant bar); the breakpoint listener above re-renders on crossing.
  const wantsSide = site.nav.variant === 'side-left' || site.nav.variant === 'side-right';
  const effSite = wantsSide && narrowMq.matches
    ? { ...site, nav: { ...site.nav, variant: 'bar' } }
    : site;

  host.replaceChildren();
  const nav = document.createElement('nav');
  // layout (additive since v0.5): where the menu items sit; the logo is
  // always first and doubles as the "Home" button.
  nav.className = navClasses(effSite);
  // The burger follows the ACTUAL width via its own class on the nav: in
  // preview the editor's viewport choice owns body.urd-mobile (and with it
  // the structure tools), but the menu alone must still go mobile when the
  // window is narrower than the mobile breakpoint. For visitors,
  // body.urd-mobile is set at the same threshold; the double coverage in
  // the CSS is harmless.
  const mobileMq = window.matchMedia(`(max-width: ${site.breakpoints?.mobile ?? 640}px)`);
  mobileMq.addEventListener('change', () => renderNav(lastRender.site, lastRender.host), { signal });
  if (mobileMq.matches) nav.classList.add('urd-nav-mobile');
  // Sticky menu (the default): sticky must sit on the HOST (the header
  // element), not on the nav - a sticky element can never leave its parent,
  // and the parent here is exactly as tall as the nav.
  host.classList.toggle('urd-nav-sticky', effSite.nav.sticky !== false);
  // The variant drives the host and body: floating takes the host out of
  // the flow (the hero starts behind the pill), the side variant turns the
  // host into a fixed column and gives body content padding. All classes
  // are toggled on every render, so a variant switch in the editor never
  // leaves leftovers.
  const hc = hostClasses(effSite);
  for (const cls of ['urd-nav-float', 'urd-nav-overlay', 'urd-nav-side-host', 'urd-nav-side-host-left', 'urd-nav-side-host-right']) {
    host.classList.toggle(cls, hc.host.includes(cls));
  }
  for (const cls of ['urd-side-left', 'urd-side-right']) {
    document.body.classList.toggle(cls, hc.body.includes(cls));
  }
  // The side column's width: set on body so both the column and the
  // content padding read the same value.
  const isSide = hc.body.length > 0;
  if (isSide) {
    document.body.style.setProperty('--urd-nav-side-width', `${clampSideWidth(site.nav.style?.width)}px`);
  } else {
    document.body.style.removeProperty('--urd-nav-side-width');
  }

  // Scroll behavior (nav.scroll, additive since v0.6): 'shrink' shrinks the
  // menu after some scrolling, 'hide' hides it on scroll down and shows it
  // on scroll up. The state is computed by pure navScrollState; only
  // meaningful for a sticky top bar (not the side variant, not sticky off).
  // As with sticky blocks the behavior is inactive while editing (preview
  // with chrome on) - a menu that runs off during drag/scroll would fight
  // the editing - and always off while the mobile panel is open. The
  // listener is rAF-throttled, passive and aborted with the rest of the
  // render's listeners.
  const scrollMode = effSite.nav.scroll;
  const wantsScroll = (scrollMode === 'shrink' || scrollMode === 'hide')
    && !isSide && effSite.nav.sticky !== false;
  host.classList.toggle('urd-nav-scroll', wantsScroll);
  if (!wantsScroll) {
    host.classList.remove('urd-nav-compact', 'urd-nav-hidden');
  } else {
    let prevY = window.scrollY;
    let hidden = false;
    let ticking = false;
    const applyScroll = () => {
      const body = document.body;
      const editing = body.classList.contains('urd-preview') && !body.classList.contains('urd-chrome-off');
      const menuOpen = nav.classList.contains('urd-nav-open');
      const y = window.scrollY;
      const state = editing || menuOpen
        ? { compact: false, hidden: false }
        : navScrollState(scrollMode, prevY, y, hidden);
      prevY = y;
      hidden = state.hidden;
      host.classList.toggle('urd-nav-compact', state.compact);
      host.classList.toggle('urd-nav-hidden', state.hidden);
    };
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        applyScroll();
      });
    }, { passive: true, signal });
    applyScroll();
  }

  // Appearance (nav.style, additive since v0.5): background color with
  // opacity, blur behind, and its own text color. The background is set as
  // a CSS var so submenus and the mobile panel inherit the same surface;
  // without style the CSS default applies.
  const surface = navSurface(site.nav.style);
  // Full layer-based background (additive since v0.6, shared with sections
  // and the footer): a backdrop behind the nav content with the same layer
  // stack as sections. When present it takes over the surface, and the
  // plain veil/image path is skipped.
  const navBg = site.nav.style?.background;
  const hasNavBgLayers = Array.isArray(navBg?.layers) && navBg.layers.length > 0;
  if (hasNavBgLayers) {
    const backdrop = document.createElement('div');
    backdrop.className = 'urd-nav-bg';
    renderBackgroundLayers(backdrop, navBg);
    nav.appendChild(backdrop);
    // The layers define the surface: the nav element's own background is
    // made transparent (blur/frosted glass still works through it).
    nav.style.setProperty('--urd-nav-bg', 'transparent');
    // The submenu and mobile panel inherit the color layers as one flattened
    // veil, so the dropdown follows the bar's tone instead of the default veil.
    const layerVeil = navLayerVeil(navBg.layers);
    if (layerVeil) nav.style.setProperty('--urd-nav-sub-bg', layerVeil);
  } else if (surface.bg) {
    nav.style.setProperty('--urd-nav-bg', surface.bg);
  }
  // Blur is driven via a custom property (inherits to submenus and the mobile
  // panel; backdrop-filter itself does not inherit, so inherit in the CSS
  // would stop at the li).
  if (surface.blur === false) nav.style.setProperty('--urd-nav-blur', 'none');
  if (surface.color) nav.style.color = surface.color;
  // The submenu and mobile panel get their own surface: by default only the
  // color veil, never the background image (subImage turns the image on).
  // With a layer background, submenu/mobile keep the veil default (the layer
  // stack applies to the main bar).
  const subBg = navSubSurface(site.nav.style);
  if (subBg && !hasNavBgLayers) nav.style.setProperty('--urd-nav-sub-bg', subBg);
  // Hover colors (additive since v0.6): the effect color (underline/pill
  // surface/glow) and the text color on hover; without a choice the accent
  // color applies.
  if (site.nav.style?.hoverColor) {
    nav.style.setProperty('--urd-nav-hover', resolveColor(site.nav.style.hoverColor));
  }
  if (site.nav.style?.hoverTextColor) {
    nav.style.setProperty('--urd-nav-hover-text', resolveColor(site.nav.style.hoverTextColor));
  }
  // Glow strength for the lift-with-glow hover style (0..1, default 0.6):
  // set as a finished percentage, so the CSS color-mix can use the value directly.
  const glowStrength = Number(site.nav.style?.hoverGlow);
  if (Number.isFinite(glowStrength)) {
    nav.style.setProperty('--urd-nav-hover-glow', `${Math.round(Math.min(1, Math.max(0, glowStrength)) * 100)}%`);
  }
  // The pill items' own color (subStyle pills); without a choice the
  // submenu surface is used.
  if (site.nav.style?.subPillColor) {
    nav.style.setProperty('--urd-nav-sub-pill', resolveColor(site.nav.style.subPillColor));
  }
  // Submenu columns (n x n): the items are laid out in a grid with the chosen column count.
  const subCols = Math.round(Number(site.nav.style?.subColumns));
  if (subCols >= 2) nav.style.setProperty('--urd-nav-sub-cols', String(Math.min(4, subCols)));
  // Size (additive since v0.7, ADR-0023): thickness, side padding, item
  // gap, pill width and shrink factor as inline custom properties the CSS
  // reads with today's look as the fallback; the menu font size inline. The
  // mobile overrides are chosen from the breakpoint here (pure navSizeVars),
  // and the breakpoint listener above re-renders on crossing.
  const size = navSizeVars(site.nav.style, site.nav.logo, { mobile: mobileMq.matches });
  for (const [name, value] of Object.entries(size.vars)) nav.style.setProperty(name, value);
  if (size.font) nav.style.fontSize = size.font;
  // Border (additive since v0.7): the side is a class from navClasses; the
  // width and colour are variables with a hairline in the text colour as
  // the default.
  const border = site.nav.style?.border;
  if (border && typeof border === 'object') {
    nav.style.setProperty('--urd-nav-border-w', `${clampBorderWidth(border.width)}px`);
    if (border.color) nav.style.setProperty('--urd-nav-border-c', resolveColor(border.color));
  }

  const logoDef = site.nav.logo ?? { type: 'text', value: site.site.title };
  const logo = document.createElement('a');
  logo.className = 'urd-nav-logo';
  logo.href = '/';
  logo.title = t('nav.toFront');

  const logoImg = (src) => {
    const img = document.createElement('img');
    img.src = src;
    img.alt = site.site.title;
    // The height is set via a base variable, not inline height: the CSS
    // derives the drawn size from it (the scroll shrink can scale it) and
    // its calibration (a negative block margin scaling with the size) keeps
    // the bar height constant regardless of image height - the image fills
    // out, the bar never grows. The mobile size is chosen by navSizeVars.
    img.style.setProperty('--urd-logo-base', `${size.logoSize}px`);
    if (logoDef.radius) img.style.borderRadius = `${logoDef.radius}px`;
    return img;
  };
  // The logo text can be styled independently of the theme (additive fields
  // since v0.5); the default is the theme's heading font in bold.
  const logoText = () => {
    const span = document.createElement('span');
    span.textContent = logoDef.value || site.site.title;
    if (logoDef.font) span.style.fontFamily = logoDef.font;
    if (logoDef.textSize) span.style.fontSize = `${logoDef.textSize}px`;
    if (logoDef.bold === false) span.style.fontWeight = '400';
    if (logoDef.italic) span.style.fontStyle = 'italic';
    return span;
  };

  // An unsafe image source falls back to the logo text (same guard as the
  // nav background and the favicon), so the menu never lacks a brand mark.
  if (logoDef.type === 'image' && isSafeImage(logoDef.value)) {
    logo.appendChild(logoImg(logoDef.value));
  } else if (logoDef.type === 'both' && isSafeImage(logoDef.image)) {
    // Image plus text, in the chosen order.
    if ((logoDef.order ?? 'image-first') === 'image-first') {
      logo.append(logoImg(logoDef.image), logoText());
    } else {
      logo.append(logoText(), logoImg(logoDef.image));
    }
  } else {
    logo.appendChild(logoText());
  }
  nav.appendChild(logo);

  // The tool cluster at the far right: the light/dark toggle (when the
  // theme has an alt counterpart) and the burger. An empty cluster is
  // hidden in CSS (:empty).
  const tools = document.createElement('span');
  tools.className = 'urd-nav-tools';

  // The cart in the menu (the shop, additive nav.cart): a button with a
  // count badge that opens the same cart drawer as the cart block.
  if (site.nav?.cart?.show) {
    const cartCfg = site.nav.cart;
    const cartBtn = document.createElement('button');
    cartBtn.className = 'urd-nav-cart';
    cartBtn.type = 'button';
    cartBtn.setAttribute('aria-label', t('shop.cart'));
    cartBtn.innerHTML = iconSvg('cart') ?? '';
    const cartBadge = document.createElement('span');
    cartBadge.className = 'urd-nav-cart-badge';
    cartBadge.hidden = true;
    cartBtn.appendChild(cartBadge);
    const drawer = createCartDrawer({ href: cartCfg.href ?? '', currency: cartCfg.currency || 'kr' });
    nav.appendChild(drawer.dialog);
    const paintCart = () => {
      const count = cartCount(readCart());
      cartBadge.textContent = String(count);
      cartBadge.hidden = count === 0;
    };
    paintCart();
    onCartChange(nav, () => {
      paintCart();
      drawer.refresh();
    });
    cartBtn.addEventListener('click', () => drawer.open(), { signal });
    tools.appendChild(cartBtn);
  }

  if (site.theme?.alt?.tokens) {
    const themeBtn = document.createElement('button');
    themeBtn.className = 'urd-nav-theme';
    themeBtn.type = 'button';
    const paintToggle = () => {
      const dark = themeMode() === 'dark';
      // The icon shows the mode you SWITCH TO (the convention people know).
      themeBtn.innerHTML = dark ? SUN : MOON;
      themeBtn.setAttribute('aria-label', dark ? t('nav.toLightTheme') : t('nav.toDarkTheme'));
    };
    paintToggle();
    themeBtn.addEventListener('click', () => {
      toggleThemeMode(site.theme);
      paintToggle();
    }, { signal });
    tools.appendChild(themeBtn);
  }

  // The burger (only visible in mobile view via CSS): a non-modal disclosure
  // of the menu list - no focus trap or scroll lock, the panel scrolls itself.
  const burger = document.createElement('button');
  burger.className = 'urd-nav-burger';
  burger.type = 'button';
  burger.setAttribute('aria-expanded', 'false');
  burger.setAttribute('aria-controls', 'urd-nav-menu');
  burger.setAttribute('aria-label', t('nav.menu'));
  burger.innerHTML = BURGER;
  tools.appendChild(burger);

  const setMobileOpen = (open) => {
    nav.classList.toggle('urd-nav-open', open);
    burger.setAttribute('aria-expanded', String(open));
  };
  burger.addEventListener('click', () => {
    setMobileOpen(!nav.classList.contains('urd-nav-open'));
  }, { signal });

  const list = document.createElement('ul');
  list.className = 'urd-nav-list';
  list.id = 'urd-nav-menu';

  /** All li elements with a submenu, for closeAll. */
  const subs = [];
  const setOpen = (entry, open) => {
    entry.li.classList.toggle('open', open);
    entry.button.setAttribute('aria-expanded', String(open));
  };
  const closeAll = (except) => {
    for (const entry of subs) if (entry !== except) setOpen(entry, false);
  };

  // Hover only opens on devices with a real pointer - touch must never get
  // hover states that take an extra tap to dismiss. nav.style.subOpen
  // decides whether hover opens at all and whether leaving closes
  // (subOpenMode); click always works.
  // In the side column the submenus are accordions in the flow: there,
  // hover opens but never closes per item - closing would shorten the
  // column under the pointer and cause misclicks. The accordions close
  // only when the pointer leaves the whole menu.
  const isColumn = hc.host.includes('urd-nav-side-host');
  const { hoverOpens, hoverCloses } = subOpenMode(site.nav.style);
  const mouseHover = hoverOpens && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const items = navItems(site);
  items.forEach((item, index) => {
    if (item.missing && !item.external) {
      console.warn(`Urd: nav item points to unknown page (${item.label})`);
    }
    const li = document.createElement('li');

    const makeLink = (target) => {
      const a = document.createElement('a');
      a.textContent = target.label;
      a.href = target.href;
      if (target.external) a.rel = 'noopener';
      return a;
    };

    if (item.kind === 'link') {
      li.appendChild(makeLink(item));
      list.appendChild(li);
      return;
    }

    // Item with a submenu: 'split' = link plus its own arrow button (the
    // page stays reachable); 'toggle' = one button carries both the title
    // and the arrow.
    li.className = 'urd-nav-has-sub';
    const subId = `urd-nav-sub-${index}`;
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', subId);

    if (item.kind === 'split') {
      li.appendChild(makeLink(item));
      button.className = 'urd-nav-caret';
      button.setAttribute('aria-label', t('nav.submenuFor', { label: item.label }));
      button.innerHTML = CHEVRON;
    } else {
      button.className = 'urd-nav-toggle';
      const title = document.createElement('span');
      title.textContent = item.label;
      button.appendChild(title);
      button.insertAdjacentHTML('beforeend', CHEVRON);
    }
    li.appendChild(button);

    const sub = document.createElement('ul');
    sub.className = 'urd-nav-sub';
    sub.id = subId;
    for (const child of item.children) {
      if (child.missing && !child.external) {
        console.warn(`Urd: nav item points to unknown page (${child.label})`);
      }
      const childLi = document.createElement('li');
      childLi.appendChild(makeLink(child));
      sub.appendChild(childLi);
    }
    li.appendChild(sub);

    const entry = { li, button };
    subs.push(entry);

    button.addEventListener('click', () => {
      const open = !li.classList.contains('open');
      closeAll(entry);
      setOpen(entry, open);
    }, { signal });

    if (mouseHover) {
      // Real mouse only: on hybrid devices (laptop with touchscreen) a tap
      // fires both pointerenter and click, and without the guard the
      // submenu would open on enter and close again on click.
      let closeTimer = null;
      li.addEventListener('pointerenter', (event) => {
        if (event.pointerType !== 'mouse') return;
        clearTimeout(closeTimer);
        // In the column, other accordions stay open: closing moves the items
        // under the pointer. Closing happens collectively when the menu is left.
        if (!isColumn) closeAll(entry);
        setOpen(entry, true);
      }, { signal });
      if (!isColumn && hoverCloses) {
        li.addEventListener('pointerleave', (event) => {
          if (event.pointerType !== 'mouse') return;
          clearTimeout(closeTimer);
          closeTimer = setTimeout(() => setOpen(entry, false), HOVER_CLOSE_DELAY);
        }, { signal });
      }
    }

    // Tabbing out of the item closes the submenu - focus must never leave
    // an open menu behind.
    li.addEventListener('focusout', (event) => {
      if (!li.contains(event.relatedTarget)) setOpen(entry, false);
    }, { signal });

    list.appendChild(li);
  });

  nav.appendChild(list);
  nav.appendChild(tools);
  host.appendChild(nav);

  // The measured menu height as a CSS var on the root element: the nav
  // clearance in base.css (menu out of the flow) and the chrome parking in
  // preview read it. The distance is measured from the host's top to the
  // nav's bottom edge (offsetTop includes the pill's top gap). The column
  // variant takes no top height.
  const setNavH = () => {
    const h = isSide ? 0 : nav.offsetTop + nav.offsetHeight;
    document.documentElement.style.setProperty('--urd-nav-h', `${h}px`);
  };

  // Content-aware folding: menu items never wrap (nowrap in base.css), so
  // when the items no longer fit in the width, the whole list folds to the
  // burger via the same class as the mobile breakpoint. The unfolded full
  // width is remembered (foldNeeds), because after folding the list is
  // hidden and cannot be measured: unfolding happens only once the bar is
  // wider than the need, and then measures again in case the need has grown.
  let foldNeeds = 0;
  const evalFold = () => {
    if (isSide || mobileMq.matches) return;
    if (!nav.classList.contains('urd-nav-mobile')) {
      if (nav.scrollWidth > nav.clientWidth + 1) {
        foldNeeds = nav.scrollWidth;
        nav.classList.add('urd-nav-mobile');
      }
    } else if (nav.clientWidth > foldNeeds + 8) {
      nav.classList.remove('urd-nav-mobile');
      if (nav.scrollWidth > nav.clientWidth + 1) {
        foldNeeds = nav.scrollWidth;
        nav.classList.add('urd-nav-mobile');
      } else {
        setMobileOpen(false);
      }
    }
  };

  // A ResizeObserver on the nav (not the host: a host out of the flow has
  // no height of its own to observe) catches window width, font loading and
  // scroll shrink; it always delivers a first measurement on observe.
  const navRo = new ResizeObserver(() => {
    setNavH();
    evalFold();
  });
  navRo.observe(nav);
  signal.addEventListener('abort', () => navRo.disconnect());

  // The column's hover closing: all accordions close together when the
  // pointer leaves the whole menu; re-entering within the delay cancels
  // the closing.
  if (isColumn && mouseHover && hoverCloses) {
    let columnTimer = null;
    nav.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse') return;
      clearTimeout(columnTimer);
    }, { signal });
    nav.addEventListener('pointerleave', (event) => {
      if (event.pointerType !== 'mouse') return;
      clearTimeout(columnTimer);
      columnTimer = setTimeout(() => closeAll(), HOVER_CLOSE_DELAY);
    }, { signal });
  }

  // The side column's width is adjusted by dragging its inner edge (preview
  // only, like section heights). Live update via the CSS var; on release
  // the width is reported to the editor, which owns the draft (urd-nav-width).
  if (isSide && document.body.classList.contains('urd-preview')) {
    const grip = document.createElement('div');
    grip.className = 'urd-nav-side-resize';
    grip.title = ta('tip.nav.colResize');
    const rightSide = hc.host.includes('urd-nav-side-host-right');
    grip.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      grip.setPointerCapture(event.pointerId);
      const startX = event.clientX;
      const startW = clampSideWidth(site.nav.style?.width);
      let width = startW;
      const onMove = (ev) => {
        const delta = rightSide ? startX - ev.clientX : ev.clientX - startX;
        width = clampSideWidth(startW + delta);
        document.body.style.setProperty('--urd-nav-side-width', `${width}px`);
      };
      const onUp = () => {
        grip.removeEventListener('pointermove', onMove);
        grip.removeEventListener('pointerup', onUp);
        if (width !== startW) window.parent?.postMessage({ type: 'urd-nav-width', width }, location.origin);
      };
      grip.addEventListener('pointermove', onMove, { signal });
      grip.addEventListener('pointerup', onUp, { signal });
    }, { signal });
    host.appendChild(grip);
  }

  // Escape closes the nearest open layer and returns focus to the button
  // that opened it, so keyboard users land where they were.
  nav.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const openSub = subs.find((entry) => entry.li.classList.contains('open'));
    if (openSub) {
      setOpen(openSub, false);
      openSub.button.focus();
    } else if (nav.classList.contains('urd-nav-open')) {
      setMobileOpen(false);
      burger.focus();
    }
  }, { signal });

  // A click outside the nav closes both submenus and the mobile panel.
  document.addEventListener('pointerdown', (event) => {
    if (nav.contains(event.target)) return;
    closeAll();
    setMobileOpen(false);
  }, { signal });
}
