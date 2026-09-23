/**
 * The calendar reference plugin: a subscribable event calendar built from
 * iCal feeds (Google Calendar, Nextcloud, Outlook and others), following the
 * ApeironLF design requirements. It is also the REFERENCE for plugin
 * authors: a manifest with provides, a block with version and migrations, a
 * section preset, its own CSS in one style tag, and editing in the preview
 * via urd-edit.
 *
 * Fetching ALWAYS goes through the site's own feed proxy (/api/ics): feed
 * hosts send no CORS, and the site's CSP allows connect-src 'self' only, so
 * the plugin needs no CSP exception. Locally, without functions, the preview
 * shows demo data and visitors get a quiet empty state.
 *
 * Views: list (date-badge rows), cards, month and next (a panel for the next
 * event). Conventions: "Category: Title" gives category chips with a filter,
 * and a signup link in the description becomes a button.
 */
import {
  parseIcs, expandEvents, splitCategory, findSignupLink,
  normalizeSourceUrl, subscribeLinks,
} from './ics.js';
// Multilingual (ADR-0012): t() for visitor texts (the site language), ta()
// for the editor chrome (the admin language), dates() for month and weekday
// names, and tp() for plurals. The dictionary (locales/) is loaded by the
// plugin loader BEFORE register() - t/ta are called only inside render and
// factory bodies, never at module level.
import { t, ta, tp, taApiError, dates } from '/assets/urd/i18n.js';

const el2 = (tag, className, textContent) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (textContent != null) node.textContent = textContent;
  return node;
};

/* ---------- Fetching (proxy + short-lived cache) ---------- */

const CACHE_TTL = 10 * 60 * 1000;

async function fetchSource(url) {
  const key = `urd-cal-cache:${url}`;
  try {
    const cached = JSON.parse(sessionStorage.getItem(key) ?? 'null');
    if (cached && Date.now() - cached.t < CACHE_TTL) return cached.text;
  } catch { /* a corrupt cache entry is ignored */ }
  const res = await fetch(`/api/ics?url=${encodeURIComponent(url)}`);
  if (!res.ok) {
    const detail = taApiError(await res.json().catch(() => null));
    throw new Error(detail ?? ta('calendar.edit.feedStatus', { status: res.status }));
  }
  const text = await res.text();
  try { sessionStorage.setItem(key, JSON.stringify({ t: Date.now(), text })); } catch { /* a full store is fine */ }
  return text;
}

/** All sources → sorted occurrences with category and signup link. */
async function loadOccurrences(sources, limit) {
  const errors = [];
  const events = [];
  await Promise.all(sources.map(async (source) => {
    const url = normalizeSourceUrl(source);
    if (!url) { errors.push(ta('calendar.edit.unknownSource', { source })); return; }
    try {
      events.push(...parseIcs(await fetchSource(url)).events);
    } catch (error) {
      errors.push(`${url}: ${error.message}`);
    }
  }));
  const occurrences = expandEvents(events, { from: Date.now() - 6 * 3600 * 1000, max: Math.max(limit * 4, 120) })
    .map((occ) => {
      const { category, title } = splitCategory(occ.summary);
      return { ...occ, category, title, signup: findSignupLink(occ.description) };
    });
  return { occurrences, errors };
}

/* ---------- Demo data (preview only, when no sources or feed) ---------- */

function demoOccurrences() {
  const day = 24 * 3600 * 1000;
  const base = Date.now();
  return [
    { start: base + 3 * day, end: base + 3 * day + 2 * 3600 * 1000, allDay: false, title: ta('calendar.edit.demoTitle1'), category: ta('calendar.edit.demoCat1'), location: ta('calendar.edit.demoLoc1'), signup: null, description: '' },
    { start: base + 10 * day, end: base + 10 * day + 3600 * 1000, allDay: false, title: ta('calendar.edit.demoTitle2'), category: ta('calendar.edit.demoCat2'), location: ta('calendar.edit.demoLoc1'), signup: null, description: '' },
    { start: base + 17 * day, end: base + 17 * day, allDay: true, title: ta('calendar.edit.demoTitle3'), category: ta('calendar.edit.demoCat3'), location: ta('calendar.edit.demoLoc2'), signup: null, description: '' },
  ];
}

/* ---------- Formatting ---------- */

const two = (n) => String(n).padStart(2, '0');

function metaLine(occ) {
  const start = new Date(occ.start);
  const d = dates();
  const parts = [t('calendar.dateLine', {
    wd: d.weekdaysShort[(start.getDay() + 6) % 7],
    d: start.getDate(),
    m: d.monthsShort[start.getMonth()],
  })];
  if (!occ.allDay) parts.push(t('calendar.timeAt', { time: `${two(start.getHours())}:${two(start.getMinutes())}` }));
  if (occ.location) parts.push(occ.location);
  return parts.join(' · ');
}

function badgeNode(occ) {
  const start = new Date(occ.start);
  const badge = el2('div', 'urd-collection-badge');
  badge.append(el2('strong', null, String(start.getDate())), el2('span', null, dates().monthsShort[start.getMonth()]));
  return badge;
}

function chipNode(category) {
  return category ? el2('span', 'urd-cal-chip', category) : null;
}

function signupNode(occ) {
  if (!occ.signup) return null;
  const a = el2('a', 'urd-cal-signup', t('calendar.signup'));
  a.href = occ.signup;
  a.target = '_blank';
  a.rel = 'noopener';
  a.title = t('calendar.signupTitle');
  return a;
}

/* ---------- Views ---------- */

function renderList(host, occs) {
  const list = el2('div', 'urd-collection-list');
  for (const occ of occs) {
    const row = el2('article', 'urd-collection-row');
    row.appendChild(badgeNode(occ));
    const body = el2('div', 'urd-collection-body');
    const titleRow = el2('div', 'urd-cal-titlerow');
    titleRow.appendChild(el2('strong', 'urd-collection-title', occ.title));
    const chip = chipNode(occ.category);
    if (chip) titleRow.appendChild(chip);
    body.appendChild(titleRow);
    body.appendChild(el2('div', 'urd-cal-meta', metaLine(occ)));
    const signup = signupNode(occ);
    if (signup) body.appendChild(signup);
    row.appendChild(body);
    list.appendChild(row);
  }
  host.appendChild(list);
}

function renderCards(host, occs) {
  const grid = el2('div', 'urd-collection-cards');
  for (const occ of occs) {
    const card = el2('article', 'urd-collection-card');
    const top = el2('div', 'urd-cal-titlerow');
    top.appendChild(el2('span', 'urd-collection-date', metaLine(occ)));
    const chip = chipNode(occ.category);
    if (chip) top.appendChild(chip);
    card.appendChild(top);
    card.appendChild(el2('strong', 'urd-collection-title', occ.title));
    const excerpt = String(occ.description ?? '').split('\n')[0].slice(0, 140);
    if (excerpt) card.appendChild(el2('div', 'urd-collection-text', excerpt));
    const signup = signupNode(occ);
    if (signup) card.appendChild(signup);
    grid.appendChild(card);
  }
  host.appendChild(grid);
}

function renderNext(host, occs) {
  const occ = occs[0];
  if (!occ) return;
  const panel = el2('div', 'urd-cal-next');
  panel.appendChild(el2('div', 'urd-cal-next-label', t('calendar.next')));
  const row = el2('div', 'urd-cal-next-row');
  row.appendChild(badgeNode(occ));
  const body = el2('div', null);
  const titleRow = el2('div', 'urd-cal-titlerow');
  titleRow.appendChild(el2('strong', 'urd-cal-next-title', occ.title));
  const chip = chipNode(occ.category);
  if (chip) titleRow.appendChild(chip);
  body.appendChild(titleRow);
  body.appendChild(el2('div', 'urd-cal-meta', metaLine(occ)));
  const days = Math.max(0, Math.round((occ.start - Date.now()) / (24 * 3600 * 1000)));
  // Dedicated keys instead of Intl.RelativeTimeFormat: the exclaiming
  // today wording is kept, and ICU has no North Sami (it would fall back to
  // a bare number).
  body.appendChild(el2('div', 'urd-cal-next-count', days === 0 ? t('calendar.today') : days === 1 ? t('calendar.tomorrow') : tp('calendar.inDays', days)));
  const signup = signupNode(occ);
  if (signup) body.appendChild(signup);
  row.appendChild(body);
  panel.appendChild(row);
  host.appendChild(panel);
}

function renderMonth(host, occs) {
  const now = new Date();
  let shown = { y: now.getFullYear(), mo: now.getMonth() };

  const wrap = el2('div', 'urd-cal-month');
  const head = el2('div', 'urd-cal-month-head');
  const prev = el2('button', 'urd-cal-nav', '‹');
  prev.type = 'button';
  prev.setAttribute('aria-label', t('calendar.prevMonth'));
  const label = el2('strong', null, '');
  const next = el2('button', 'urd-cal-nav', '›');
  next.type = 'button';
  next.setAttribute('aria-label', t('calendar.nextMonth'));
  head.append(prev, label, next);
  const grid = el2('div', 'urd-cal-grid');
  wrap.append(head, grid);

  const paint = () => {
    label.textContent = `${dates().months[shown.mo]} ${shown.y}`;
    grid.replaceChildren();
    for (const day of dates().weekdaysShort) grid.appendChild(el2('div', 'urd-cal-dow', day));
    const first = new Date(shown.y, shown.mo, 1);
    const lead = (first.getDay() + 6) % 7;
    const dim = new Date(shown.y, shown.mo + 1, 0).getDate();
    const today = new Date();
    for (let i = 0; i < lead; i++) grid.appendChild(el2('div', 'urd-cal-day urd-cal-day-empty'));
    for (let d = 1; d <= dim; d++) {
      const cell = el2('div', 'urd-cal-day');
      if (d === today.getDate() && shown.mo === today.getMonth() && shown.y === today.getFullYear()) {
        cell.classList.add('urd-cal-idag');
      }
      cell.appendChild(el2('span', 'urd-cal-daynum', String(d)));
      const todays = occs.filter((occ) => {
        const s = new Date(occ.start);
        return s.getFullYear() === shown.y && s.getMonth() === shown.mo && s.getDate() === d;
      });
      for (const occ of todays.slice(0, 3)) {
        const pill = el2('div', 'urd-cal-pill', occ.title);
        pill.title = `${occ.title}\n${metaLine(occ)}`;
        cell.appendChild(pill);
      }
      if (todays.length > 3) cell.appendChild(el2('div', 'urd-cal-more', t('calendar.more', { n: todays.length - 3 })));
      grid.appendChild(cell);
    }
  };
  prev.addEventListener('click', () => { shown = shown.mo ? { ...shown, mo: shown.mo - 1 } : { y: shown.y - 1, mo: 11 }; paint(); });
  next.addEventListener('click', () => { shown = shown.mo < 11 ? { ...shown, mo: shown.mo + 1 } : { y: shown.y + 1, mo: 0 }; paint(); });
  paint();
  host.appendChild(wrap);
}

const VIEWS = { list: renderList, cards: renderCards, month: renderMonth, next: renderNext };

/* ---------- Subscribe and category filter ---------- */

function subscribeRow(sources) {
  const row = el2('div', 'urd-cal-subscribe');
  for (const source of sources) {
    const links = subscribeLinks(source);
    if (!links) continue;
    const webcal = el2('a', 'urd-cal-sub-btn', sources.length > 1 ? t('calendar.subscribeMulti') : t('calendar.subscribe'));
    webcal.href = links.webcal;
    webcal.title = t('calendar.subscribeTitle');
    row.appendChild(webcal);
    if (links.google) {
      const google = el2('a', 'urd-cal-sub-btn', t('calendar.addGoogle'));
      google.href = links.google;
      google.target = '_blank';
      google.rel = 'noopener';
      google.title = t('calendar.addGoogleTitle');
      row.appendChild(google);
    }
  }
  return row.children.length ? row : null;
}

function categoryRow(occs, active, onpick) {
  const categories = [...new Set(occs.map((occ) => occ.category).filter(Boolean))];
  if (categories.length < 2) return null;
  const row = el2('div', 'urd-cal-chips');
  const all = el2('button', 'urd-cal-chipbtn', t('calendar.all'));
  all.type = 'button';
  if (!active) all.classList.add('selected');
  all.addEventListener('click', () => onpick(null));
  row.appendChild(all);
  for (const category of categories) {
    const btn = el2('button', 'urd-cal-chipbtn', category);
    btn.type = 'button';
    if (active === category) btn.classList.add('selected');
    btn.addEventListener('click', () => onpick(category));
    row.appendChild(btn);
  }
  return row;
}

/* ---------- Source panel in the preview ---------- */

function post(msg) {
  window.parent?.postMessage(msg, location.origin);
}

/** View id + label KEY (looked up with ta at use time; never at module level). */
const VIEW_NAMES = [['list', 'calendar.edit.viewList'], ['cards', 'calendar.edit.viewCards'], ['month', 'calendar.edit.viewMonth'], ['next', 'calendar.edit.viewNext']];

function configPanel(el, props, ctx) {
  const gear = el2('button', 'urd-cal-gear urd-cfg-toggle', `⚙ ${ta('calendar.edit.sources')}`);
  gear.type = 'button';
  gear.title = ta('calendar.edit.gearTitle');
  const panel = el2('div', 'urd-cal-config');

  const label = (text) => el2('label', 'urd-cal-config-label', text);
  const sources = document.createElement('textarea');
  sources.rows = 3;
  sources.placeholder = ta('calendar.edit.sourcesPh');
  sources.value = (props.sources ?? []).join('\n');

  // View: theme-driven segment buttons (native select popups follow the OS
  // theme and turn unreadable in dark panels).
  let chosenView = props.view ?? 'list';
  const viewSeg = el2('div', 'urd-cal-seg');
  const viewButtons = [];
  for (const [value, nameKey] of VIEW_NAMES) {
    const b = el2('button', null, ta(nameKey));
    b.type = 'button';
    if (value === chosenView) b.classList.add('selected');
    b.addEventListener('click', () => {
      chosenView = value;
      for (const other of viewButtons) other.classList.remove('selected');
      b.classList.add('selected');
      syncLimitRow();
    });
    viewButtons.push(b);
    viewSeg.appendChild(b);
  }

  // The max count applies to list and cards only; month shows its month and next shows one.
  const limitLabel = label(ta('lbl.maxCount'));
  const limit = document.createElement('input');
  limit.type = 'number';
  limit.min = '1';
  limit.max = '50';
  limit.value = String(props.limit ?? 6);
  const syncLimitRow = () => {
    const relevant = chosenView === 'list' || chosenView === 'cards';
    limitLabel.style.display = relevant ? '' : 'none';
    limit.style.display = relevant ? '' : 'none';
  };
  syncLimitRow();

  const check = (text, checked) => {
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = checked;
    const wrap = el2('label', 'urd-cal-config-check');
    wrap.append(input, document.createTextNode(` ${text}`));
    return [wrap, input];
  };
  const [categoriesLabel, categories] = check(ta('calendar.edit.showCategories'), props.showCategories !== false);
  const [subscribeLabel, subscribe] = check(ta('calendar.edit.showSubscribe'), props.showSubscribe !== false);

  const apply = el2('button', 'urd-cal-apply', ta('common.apply'));
  apply.type = 'button';
  apply.addEventListener('click', () => {
    const nextProps = {
      sources: sources.value.split('\n').map((s) => s.trim()).filter(Boolean),
      view: chosenView,
      limit: Math.max(1, Math.min(50, Number(limit.value) || 6)),
      showCategories: categories.checked,
      showSubscribe: subscribe.checked,
    };
    post({ type: 'urd-edit', sectionId: ctx.section.id, blockId: el.dataset.blockId, props: nextProps, rerender: true });
    close();
  });

  panel.append(
    label(ta('calendar.edit.sources')), sources,
    label(ta('lbl.view')), viewSeg,
    limitLabel, limit,
    categoriesLabel, subscribeLabel, apply,
  );

  // A click outside the panel closes it (a click inside the panel or on the button does not).
  const onOutside = (event) => {
    if (!panel.isConnected) { close(); return; }
    if (panel.contains(event.target) || event.target === gear) return;
    close();
  };
  function close() {
    panel.classList.remove('visible');
    document.removeEventListener('pointerdown', onOutside, true);
  }
  gear.addEventListener('click', (event) => {
    event.stopPropagation();
    if (panel.classList.toggle('visible')) {
      setTimeout(() => document.addEventListener('pointerdown', onOutside, true), 0);
    } else {
      close();
    }
  });
  return [gear, panel];
}

/* ---------- Auto-grow (the same pattern as the collection block) ---------- */

function autoGrow(el, host, ctx) {
  const needed = host.scrollHeight;
  if (Math.abs(needed - el.clientHeight) > 8 && ctx.viewport !== 'mobile') {
    el.style.height = `${needed}px`;
    const sectionEl = el.closest('.urd-section');
    if (sectionEl) {
      const bottom = el.offsetTop + needed + 24;
      // Both sides are content heights: the nav clearance is the section's
      // padding, and the inline min-height is a plain length.
      const current = Number.parseFloat(getComputedStyle(sectionEl).minHeight) || 0;
      if (bottom > current) sectionEl.style.minHeight = `${bottom}px`;
    }
    if (ctx.preview) {
      const block = ctx.section?.blocks?.find((b) => b.id === el.dataset.blockId);
      if (block && block.frames.desktop.h !== needed) {
        block.frames.desktop = { ...block.frames.desktop, h: needed };
        // ONLY the height is posted (urd-grow), never the whole frame: a
        // dragged block would otherwise teleport back to the snapshot's old x/y.
        post({ type: 'urd-grow', sectionId: ctx.section.id, blockId: el.dataset.blockId, h: needed });
      }
    }
  }
}

/* ---------- Plugin CSS: one style tag, theme-following tokens ---------- */

const CAL_CSS = `
.urd-cal { width: 100%; display: grid; gap: 12px; position: relative; }
.urd-cal-titlerow { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.urd-cal-meta { font-size: 0.85em; opacity: 0.7; }
.urd-cal-chip { font-size: 0.72em; padding: 2px 8px; border-radius: 999px;
  background: color-mix(in srgb, var(--urd-color-accent) 18%, transparent);
  border: 1px solid color-mix(in srgb, var(--urd-color-accent) 45%, transparent); }
.urd-cal-signup { display: inline-block; margin-top: 4px; font-size: 0.85em; font-weight: 600;
  color: var(--urd-color-accent); text-decoration: none; }
.urd-cal-signup:hover { text-decoration: underline; }
.urd-cal-chips { display: flex; gap: 6px; flex-wrap: wrap; }
.urd-cal-chipbtn { font: inherit; font-size: 0.78em; padding: 3px 10px; border-radius: 999px; cursor: pointer;
  color: inherit; background: transparent;
  border: 1px solid color-mix(in srgb, var(--urd-color-text) 25%, transparent); }
.urd-cal-chipbtn.selected { background: var(--urd-color-accent); border-color: var(--urd-color-accent); color: #fff; }
.urd-cal-subscribe { display: flex; gap: 8px; flex-wrap: wrap; }
.urd-cal-sub-btn { font-size: 0.82em; padding: 5px 12px; border-radius: var(--urd-radius-sm);
  color: inherit; text-decoration: none;
  border: 1px solid color-mix(in srgb, var(--urd-color-text) 25%, transparent);
  background: var(--urd-color-surface); }
.urd-cal-sub-btn:hover { border-color: var(--urd-color-accent); }
.urd-cal-next { padding: 16px; border-radius: var(--urd-radius-md); background: var(--urd-color-surface);
  border: 1px solid color-mix(in srgb, var(--urd-color-text) 12%, transparent); }
.urd-cal-next-label { font-size: 0.72em; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;
  opacity: 0.6; margin-bottom: 10px; }
.urd-cal-next-row { display: flex; gap: 14px; align-items: flex-start; }
.urd-cal-next-title { font-size: 1.15em; font-family: var(--urd-font-heading); }
.urd-cal-next-count { margin-top: 4px; font-size: 0.85em; font-weight: 600; color: var(--urd-color-accent); }
.urd-cal-month { display: grid; gap: 8px; }
.urd-cal-month-head { display: flex; align-items: center; justify-content: space-between; }
.urd-cal-nav { font: inherit; width: 30px; height: 30px; border-radius: 50%; cursor: pointer; color: inherit;
  background: var(--urd-color-surface); border: 1px solid color-mix(in srgb, var(--urd-color-text) 20%, transparent); }
.urd-cal-nav:hover { border-color: var(--urd-color-accent); }
.urd-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
.urd-cal-dow { font-size: 0.7em; text-transform: uppercase; opacity: 0.55; text-align: center; padding: 2px 0; }
.urd-cal-day { min-height: 64px; padding: 4px; border-radius: var(--urd-radius-sm);
  background: color-mix(in srgb, var(--urd-color-surface) 70%, transparent);
  border: 1px solid color-mix(in srgb, var(--urd-color-text) 8%, transparent);
  display: grid; gap: 2px; align-content: start; }
.urd-cal-day-empty { background: transparent; border-color: transparent; }
.urd-cal-idag { border-color: var(--urd-color-accent); }
.urd-cal-daynum { font-size: 0.72em; opacity: 0.6; }
.urd-cal-pill { font-size: 0.68em; line-height: 1.25; padding: 2px 5px; border-radius: 4px;
  background: color-mix(in srgb, var(--urd-color-accent) 22%, transparent);
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.urd-cal-more { font-size: 0.66em; opacity: 0.6; }
.urd-cal-empty { opacity: 0.65; font-size: 0.9em; }
.urd-cal-note { font-size: 0.75em; opacity: 0.55; }
.urd-cal-tools { position: absolute; top: -32px; right: -6px; z-index: 5;
  display: flex; gap: 4px; align-items: center;
  /* An invisible bridge down to the block edge, so hover survives the trip up */
  padding-bottom: 8px; }
.urd-cal-tools .urd-hint-chip { position: static; }
/* The config toggle is hidden: the settings open from the block's Properties
   panel (urd-cfg-toggle is clicked via urd-open-block-config). */
.urd-cal-gear { display: none; }
.urd-block:hover .urd-cal-gear, .urd-cal-gear:focus-visible,
.urd-cal:has(.urd-cal-config.visible) .urd-cal-gear { opacity: 0.92; pointer-events: auto; }
.urd-cal-config { position: absolute; top: 24px; right: 0; z-index: 6; width: min(340px, 90%);
  display: none; gap: 6px; padding: 12px; border-radius: 10px; background: #151a23; color: #e8eaf0;
  border: 1px solid rgb(255 255 255 / 18%); box-shadow: 0 12px 36px rgb(0 0 0 / 55%);
  font: 12px/1.4 system-ui, sans-serif; }
.urd-cal-config.visible { display: grid; }
.urd-cal-config-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.55; }
.urd-cal-config textarea, .urd-cal-config select, .urd-cal-config input[type='number'] {
  font: 12px/1.4 system-ui, sans-serif; color: inherit; background: rgb(255 255 255 / 6%);
  border: 1px solid rgb(255 255 255 / 20%); border-radius: 6px; padding: 5px 7px; min-width: 0; color-scheme: dark; }
.urd-cal-config-check { display: flex; align-items: center; gap: 6px; font-size: 12px; }
.urd-cal-seg { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3px;
  padding: 2px; background: rgb(255 255 255 / 6%);
  border: 1px solid rgb(255 255 255 / 20%); border-radius: 6px; }
.urd-cal-seg button { font: 11px/1.2 system-ui, sans-serif; color: inherit; background: transparent;
  border: 0; border-radius: 4px; padding: 5px 4px; cursor: pointer; white-space: nowrap; }
.urd-cal-seg button:hover { background: rgb(255 255 255 / 10%); }
.urd-cal-seg button.selected { background: #7c5cff; color: #fff; }
.urd-cal-apply { font: 600 12px/1 system-ui, sans-serif; padding: 7px 0; border-radius: 6px; cursor: pointer;
  color: #fff; background: #7c5cff; border: 0; }
body.urd-chrome-off .urd-cal-gear, body.urd-chrome-off .urd-cal-config { display: none !important; }
`;

function injectCss() {
  if (document.getElementById('urd-calendar-css')) return;
  const style = document.createElement('style');
  style.id = 'urd-calendar-css';
  style.textContent = CAL_CSS;
  document.head.appendChild(style);
}

/* ---------- The block ---------- */

function renderCalendar(el, props, ctx) {
  injectCss();
  const host = el2('div', 'urd-cal');
  el.appendChild(host);

  const sources = (props.sources ?? []).filter(Boolean);
  let activeCategory = null;

  const draw = (occurrences, note) => {
    host.replaceChildren();
    if (ctx.preview && ctx.viewport !== 'mobile') {
      const [gear, panel] = configPanel(el, props, ctx);
      // The help chip and the sources gear share one row at the top right, clear of the rotation handle.
      const tools = el2('div', 'urd-cal-tools');
      tools.appendChild(gear);
      host.append(tools, panel);
      // The help chip (ADR-0008): blocks with special functions explain themselves.
      import('/assets/urd/hint.js').then(({ attachHint }) => {
        if (!host.isConnected || host.querySelector('.urd-hint-chip')) return;
        const chip = attachHint(tools, {
          title: ta('calendar.edit.hintTitle'),
          lines: [
            ta('calendar.edit.hint1'),
            ta('calendar.edit.hint2'),
            ta('calendar.edit.hint3'),
            ta('calendar.edit.hint4'),
            ta('calendar.edit.hint5'),
            ta('calendar.edit.hint6'),
            ta('calendar.edit.hint7'),
          ],
        });
        // The help chip first, then the gear.
        tools.insertBefore(chip, tools.firstChild);
      });
    }
    const filtered = activeCategory
      ? occurrences.filter((occ) => occ.category === activeCategory)
      : occurrences;
    // The max count applies to list and cards; month shows its month and next shows one.
    const limited = (props.view === 'month' || props.view === 'next')
      ? filtered
      : filtered.slice(0, Math.max(1, props.limit ?? 6));
    const chips = props.showCategories === false ? null : categoryRow(occurrences, activeCategory, (category) => {
      activeCategory = category;
      draw(occurrences, note);
    });
    if (chips) host.appendChild(chips);
    if (!limited.length) {
      host.appendChild(el2('div', 'urd-cal-empty', t('calendar.empty')));
    } else {
      (VIEWS[props.view] ?? renderList)(host, limited);
    }
    if (props.showSubscribe !== false && sources.length) {
      const row = subscribeRow(sources);
      if (row) host.appendChild(row);
    }
    if (note) host.appendChild(el2('p', 'urd-cal-note', note));
    autoGrow(el, host, ctx);
  };

  if (!sources.length) {
    if (ctx.preview) {
      draw(demoOccurrences(), ta('calendar.edit.demoNote'));
    }
    return;
  }

  if (ctx.preview) draw([], null);
  loadOccurrences(sources, Math.max(1, props.limit ?? 6)).then(({ occurrences, errors }) => {
    if (!host.isConnected) return;
    if (!occurrences.length && errors.length) {
      // Visitors get a quiet empty state; the preview gets the error.
      draw([], ctx.preview ? ta('calendar.edit.feedFailed', { error: errors[0] }) : null);
      return;
    }
    draw(occurrences, ctx.preview && errors.length ? ta('calendar.edit.sourceFailed', { error: errors[0] }) : null);
  });
}

/* ---------- The whats-on preset ---------- */

const presetId = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return 'blk-' + [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
};

function hvaSkjerSection() {
  return {
    id: 'sec-' + presetId().slice(4),
    version: 1,
    preset: 'whats-on',
    size: { minHeight: '520px' },
    grid: null,
    background: { version: 1, layers: [{ type: 'color', version: 1, props: { color: 'bg', opacity: 1 } }] },
    blocks: [
      {
        id: presetId(),
        type: 'text',
        version: 1,
        props: { html: ta('calendar.edit.seedTitle'), align: 'left', box: false },
        animation: null,
        frames: { desktop: { x: 6, y: 40, w: 60, h: 70, z: 1, rot: 0 }, mobile: null },
      },
      {
        id: presetId(),
        type: 'calendar',
        version: 1,
        props: { sources: [], view: 'list', limit: 5, showCategories: true, showSubscribe: true },
        animation: null,
        frames: { desktop: { x: 6, y: 130, w: 88, h: 320, z: 2, rot: 0 }, mobile: null },
      },
    ],
    responsive: { mobile: { mode: 'auto', attention: null } },
  };
}

/* ---------- Registration ---------- */

/** @param {typeof window.Urd} Urd */
export function register(Urd) {
  Urd.blocks.define('calendar', {
    version: 1,
    autoGrow: true,
    label: 'Calendar',
    labelKey: 'calendar.edit.blockLabel',
    defaults: () => ({ sources: [], view: 'list', limit: 6, showCategories: true, showSubscribe: true }),
    // The fold-out menu in the block menus: one variant per view (the generic
    // variants field). labelKey is resolved by the consumers (the iframe side
    // has the plugin dictionary).
    variants: VIEW_NAMES.map(([view, labelKey]) => ({ label: view, labelKey, props: { view } })),
    migrations: {},
    render: renderCalendar,
  });

  Urd.sections.define('whats-on', {
    label: 'What is on',
    labelKey: 'calendar.edit.presetLabel',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'Event list from a subscribable calendar (iCal/Google)',
    hintKey: 'calendar.edit.presetHint',
    create: hvaSkjerSection,
  });
}
