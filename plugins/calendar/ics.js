/**
 * Dependency-free iCal parser and recurrence expander for the calendar
 * plugin. A PURE module (no DOM, no fetch): everything here is unit-testable
 * in node, and index.js handles fetching and rendering.
 *
 * The scope is the practical subset that club calendars use (Google
 * Calendar, Outlook, Nextcloud): VEVENT with DTSTART/DTEND (UTC, TZID or
 * all-day), RRULE with FREQ/INTERVAL/COUNT/UNTIL/BYDAY/BYMONTHDAY, EXDATE
 * and RECURRENCE-ID overrides. Unknown properties are ignored quietly.
 *
 * Time zones are resolved with the Intl API (no tables): wall time in the
 * zone is converted to UTC by estimating the offset, which is DST-correct.
 */

/* ---------- Line and property parsing ---------- */

/** Unfolds continuation lines (RFC 5545: line break + space/tab). */
function unfold(text) {
  return String(text).replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n[ \t]/g, '');
}

/** One content line → { name, params, value }. A colon inside "..." belongs to the parameters. */
function parseLine(line) {
  let inQuotes = false;
  let split = -1;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') inQuotes = !inQuotes;
    else if (ch === ':' && !inQuotes) { split = i; break; }
  }
  if (split < 0) return null;
  const head = line.slice(0, split);
  const value = line.slice(split + 1);
  const [name, ...paramParts] = head.split(';');
  const params = {};
  for (const part of paramParts) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    params[part.slice(0, eq).toUpperCase()] = part.slice(eq + 1).replace(/^"|"$/g, '');
  }
  return { name: name.toUpperCase(), params, value };
}

/** Text values: \n, \, \; and \\ are escaped in iCal. */
function unescapeText(value) {
  return String(value)
    .replace(/\\n/gi, '\n')
    .replace(/\\([,;\\])/g, '$1');
}

/* ---------- Date and time zone ---------- */

/** Wall time in an IANA zone → UTC ms. The offset is estimated with Intl and
 *  adjusted once more, which catches DST transitions. An unknown zone falls back to local time. */
function zonedToUtc(y, mo, d, h, mi, s, timeZone) {
  let formatter;
  try {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
  } catch {
    return new Date(y, mo - 1, d, h, mi, s).getTime();
  }
  const wallAsUtc = Date.UTC(y, mo - 1, d, h, mi, s);
  const readWall = (utcMs) => {
    const parts = {};
    for (const p of formatter.formatToParts(new Date(utcMs))) parts[p.type] = p.value;
    return Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day),
      Number(parts.hour) % 24, Number(parts.minute), Number(parts.second));
  };
  let utc = wallAsUtc - (readWall(wallAsUtc) - wallAsUtc);
  utc -= readWall(utc) - wallAsUtc;
  return utc;
}

/** Date value → { y, mo, d, h, mi, s, allDay, tzid } (wall time + zone), or null. */
function parseDateParts(value, params = {}) {
  const v = String(value).trim();
  let m = /^(\d{4})(\d{2})(\d{2})$/.exec(v);
  if (m || params.VALUE === 'DATE') {
    m = m ?? /^(\d{4})(\d{2})(\d{2})/.exec(v);
    if (!m) return null;
    return { y: +m[1], mo: +m[2], d: +m[3], h: 0, mi: 0, s: 0, allDay: true, tzid: null };
  }
  m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})(Z?)$/.exec(v);
  if (!m) return null;
  return {
    y: +m[1], mo: +m[2], d: +m[3], h: +m[4], mi: +m[5], s: +m[6],
    allDay: false,
    tzid: m[7] === 'Z' ? 'UTC' : (params.TZID ?? null),
  };
}

/** Wall-time parts → UTC ms. All-day is read as local midnight (rendered as a date). */
export function partsToMs(parts) {
  if (!parts) return NaN;
  const { y, mo, d, h, mi, s, tzid, allDay } = parts;
  if (allDay || !tzid) return new Date(y, mo - 1, d, h, mi, s).getTime();
  if (tzid === 'UTC') return Date.UTC(y, mo - 1, d, h, mi, s);
  return zonedToUtc(y, mo, d, h, mi, s, tzid);
}

/** Calendar arithmetic on wall-time parts (DST-safe: the clock time survives). */
function addDays(parts, days) {
  const base = new Date(Date.UTC(parts.y, parts.mo - 1, parts.d + days));
  return { ...parts, y: base.getUTCFullYear(), mo: base.getUTCMonth() + 1, d: base.getUTCDate() };
}

function addMonths(parts, months) {
  const total = parts.y * 12 + (parts.mo - 1) + months;
  return { ...parts, y: Math.floor(total / 12), mo: (total % 12) + 1 };
}

const weekday = (parts) => new Date(Date.UTC(parts.y, parts.mo - 1, parts.d)).getUTCDay();

const daysInMonth = (y, mo) => new Date(Date.UTC(y, mo, 0)).getUTCDate();

const BYDAY_CODES = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

/* ---------- VEVENT parsing ---------- */

/**
 * Parses a whole iCal text.
 * @returns {{ name: string|null, events: object[] }} events are RAW events
 *   (one per VEVENT, recurrences NOT expanded); see expandEvents.
 */
export function parseIcs(text) {
  const lines = unfold(text).split('\n');
  const events = [];
  let calendarName = null;
  let current = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (line === 'BEGIN:VEVENT') {
      current = { exdates: [] };
      continue;
    }
    if (line === 'END:VEVENT') {
      if (current?.start) events.push(current);
      current = null;
      continue;
    }
    const prop = parseLine(line);
    if (!prop) continue;
    if (!current) {
      if (prop.name === 'X-WR-CALNAME') calendarName = unescapeText(prop.value).trim();
      continue;
    }
    switch (prop.name) {
      case 'UID': current.uid = prop.value.trim(); break;
      case 'SUMMARY': current.summary = unescapeText(prop.value).trim(); break;
      case 'DESCRIPTION': current.description = unescapeText(prop.value).trim(); break;
      case 'LOCATION': current.location = unescapeText(prop.value).trim(); break;
      case 'URL': current.url = prop.value.trim(); break;
      case 'STATUS': current.status = prop.value.trim().toUpperCase(); break;
      case 'DTSTART': current.start = parseDateParts(prop.value, prop.params); break;
      case 'DTEND': current.end = parseDateParts(prop.value, prop.params); break;
      case 'RRULE': current.rrule = parseRrule(prop.value); break;
      case 'RECURRENCE-ID': current.recurrenceId = parseDateParts(prop.value, prop.params); break;
      case 'EXDATE':
        for (const part of prop.value.split(',')) {
          const parsed = parseDateParts(part, prop.params);
          if (parsed) current.exdates.push(parsed);
        }
        break;
      default: break;
    }
  }
  return { name: calendarName, events };
}

function parseRrule(value) {
  const rule = {};
  for (const part of String(value).split(';')) {
    const eq = part.indexOf('=');
    if (eq < 0) continue;
    rule[part.slice(0, eq).toUpperCase()] = part.slice(eq + 1);
  }
  const freq = rule.FREQ?.toUpperCase();
  if (!['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(freq)) return null;
  const byday = rule.BYDAY
    ? rule.BYDAY.split(',').map((code) => {
      const m = /^(-?\d)?([A-Z]{2})$/.exec(code.trim().toUpperCase());
      return m && m[2] in BYDAY_CODES ? { ord: m[1] ? Number(m[1]) : 0, day: BYDAY_CODES[m[2]] } : null;
    }).filter(Boolean)
    : null;
  return {
    freq,
    interval: Math.max(1, Number(rule.INTERVAL) || 1),
    count: rule.COUNT ? Math.max(1, Number(rule.COUNT) || 1) : null,
    until: rule.UNTIL ? partsToMs(parseDateParts(rule.UNTIL)) : null,
    byday,
    bymonthday: rule.BYMONTHDAY
      ? rule.BYMONTHDAY.split(',').map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 31)
      : null,
  };
}

/* ---------- Expansion ---------- */

/** Generates wall-time starts for a rule, from DTSTART onwards (sorted). */
function* ruleStarts(startParts, rule) {
  const guard = 3000;
  let produced = 0;
  if (rule.freq === 'DAILY') {
    for (let i = 0; produced < guard; i += rule.interval) {
      yield addDays(startParts, i);
      produced++;
    }
  } else if (rule.freq === 'WEEKLY') {
    const days = (rule.byday?.length ? rule.byday.map((b) => b.day) : [weekday(startParts)]).sort();
    // The week is anchored in the week of the DTSTART day (weeks start on Sunday, like getUTCDay).
    const weekAnchor = addDays(startParts, -weekday(startParts));
    for (let week = 0; produced < guard; week += rule.interval) {
      for (const day of days) {
        const candidate = addDays(weekAnchor, week * 7 + day);
        if (partsToMs(candidate) < partsToMs(startParts)) continue;
        yield candidate;
        produced++;
      }
    }
  } else if (rule.freq === 'MONTHLY') {
    for (let i = 0; produced < guard; i += rule.interval) {
      const month = addMonths(startParts, i);
      const dim = daysInMonth(month.y, month.mo);
      let candidates = [];
      if (rule.byday?.length) {
        for (const { ord, day } of rule.byday) {
          // The nth (or nth from last) weekday of the month; ord 0 means all of them.
          const matches = [];
          for (let d = 1; d <= dim; d++) {
            if (weekday({ ...month, d }) === day) matches.push(d);
          }
          if (ord > 0 && matches[ord - 1]) candidates.push(matches[ord - 1]);
          else if (ord < 0 && matches[matches.length + ord] != null) candidates.push(matches[matches.length + ord]);
          else if (ord === 0) candidates.push(...matches);
        }
      } else if (rule.bymonthday?.length) {
        candidates = rule.bymonthday.filter((d) => d <= dim);
      } else if (startParts.d <= dim) {
        candidates = [startParts.d];
      }
      for (const d of [...new Set(candidates)].sort((a, b) => a - b)) {
        const candidate = { ...month, d };
        if (partsToMs(candidate) < partsToMs(startParts)) continue;
        yield candidate;
        produced++;
      }
    }
  } else if (rule.freq === 'YEARLY') {
    for (let i = 0; produced < guard; i += rule.interval) {
      const candidate = { ...startParts, y: startParts.y + i };
      if (candidate.mo === 2 && candidate.d === 29 && daysInMonth(candidate.y, 2) < 29) continue;
      yield candidate;
      produced++;
    }
  }
}

/**
 * Expands raw events into concrete occurrences inside a window.
 * A RECURRENCE-ID event overrides its base occurrence, EXDATE removes one,
 * and STATUS:CANCELLED removes one. The result is sorted by start.
 *
 * @param {object[]} events from parseIcs
 * @param {{ from?: Date|number, to?: Date|number, max?: number }} window
 * @returns {Array<{ summary, description, location, url, start: number, end: number, allDay: boolean, uid }>}
 */
export function expandEvents(events, { from = Date.now(), to, max = 300 } = {}) {
  const fromMs = Number(from);
  const toMs = to != null ? Number(to) : fromMs + 400 * 24 * 3600 * 1000;

  // Overrides: uid + the base occurrence's start → the replacement event.
  const overrides = new Map();
  for (const event of events) {
    if (event.uid && event.recurrenceId) {
      overrides.set(`${event.uid}@${partsToMs(event.recurrenceId)}`, event);
    }
  }

  const out = [];
  const push = (event, startMs, endMs) => {
    if (event.status === 'CANCELLED') return;
    out.push({
      uid: event.uid ?? null,
      summary: event.summary ?? '',
      description: event.description ?? '',
      location: event.location ?? '',
      url: event.url ?? null,
      start: startMs,
      end: endMs,
      allDay: !!event.start.allDay,
    });
  };

  for (const event of events) {
    if (event.recurrenceId) continue;
    const startMs = partsToMs(event.start);
    if (!Number.isFinite(startMs)) continue;
    // DTEND is exclusive for all-day events in iCal; otherwise the duration is DTEND - DTSTART.
    const durationMs = event.end
      ? Math.max(0, partsToMs(event.end) - startMs - (event.start.allDay ? 24 * 3600 * 1000 : 0))
      : (event.start.allDay ? 0 : 3600 * 1000);

    if (!event.rrule) {
      if (startMs + durationMs >= fromMs && startMs <= toMs) push(event, startMs, startMs + durationMs);
      continue;
    }

    const exdateMs = new Set(event.exdates.map(partsToMs));
    let produced = 0;
    for (const parts of ruleStarts(event.start, event.rrule)) {
      const occurrenceMs = partsToMs(parts);
      if (event.rrule.until != null && occurrenceMs > event.rrule.until) break;
      produced++;
      if (event.rrule.count != null && produced > event.rrule.count) break;
      if (occurrenceMs > toMs) break;
      if (exdateMs.has(occurrenceMs)) continue;
      const override = event.uid ? overrides.get(`${event.uid}@${occurrenceMs}`) : null;
      if (override) {
        const oStart = partsToMs(override.start);
        const oEnd = override.end ? partsToMs(override.end) : oStart + durationMs;
        if (oEnd >= fromMs && oStart <= toMs) push({ ...event, ...override }, oStart, oEnd);
        continue;
      }
      if (occurrenceMs + durationMs < fromMs) continue;
      push(event, occurrenceMs, occurrenceMs + durationMs);
      if (out.length >= max * 2) break;
    }
  }

  out.sort((a, b) => a.start - b.start);
  return out.slice(0, max);
}

/* ---------- Conventions (the ApeironLF patterns) ---------- */

/** "Category: Title" → { category, title }; without a colon prefix category is null. */
export function splitCategory(summary) {
  const m = /^([^:]{1,24}):\s+(.+)$/.exec(String(summary ?? '').trim());
  if (!m || /https?$/i.test(m[1])) return { category: null, title: String(summary ?? '').trim() };
  return { category: m[1].trim(), title: m[2].trim() };
}

/** Signup link from the description: a line naming a signup wins, otherwise the first URL. */
export function findSignupLink(description) {
  const text = String(description ?? '');
  const urlPattern = /https?:\/\/[^\s<>"')\]]+/i;
  // Trailing punctuation belongs to the sentence, not to the link.
  const clean = (url) => url.replace(/[.,;:!?]+$/, '');
  for (const line of text.split('\n')) {
    if (/påmeld|pamel|sign\s?up|registrer/i.test(line)) {
      const m = urlPattern.exec(line);
      if (m) return clean(m[0]);
    }
  }
  const m = urlPattern.exec(text);
  return m ? clean(m[0]) : null;
}

/**
 * Normalizes a source the way the owner writes it:
 * webcal:// → https://, https is kept, http is lifted to https, and a bare
 * Google calendar id (someone@gmail.com / ...@group.calendar.google.com)
 * becomes its public ICS address. An unknown form gives null.
 */
export function normalizeSourceUrl(input) {
  const raw = String(input ?? '').trim();
  if (!raw) return null;
  if (/^webcal:\/\//i.test(raw)) return 'https://' + raw.slice('webcal://'.length);
  if (/^https:\/\//i.test(raw)) return raw;
  if (/^http:\/\//i.test(raw)) return 'https://' + raw.slice('http://'.length);
  if (/^[^\s/]+@[^\s/]+$/.test(raw)) {
    return `https://calendar.google.com/calendar/ical/${encodeURIComponent(raw)}/public/basic.ics`;
  }
  return null;
}

/** Subscribe links for a source: webcal always; Google calendars also get "add to Google". */
export function subscribeLinks(url) {
  const normalized = normalizeSourceUrl(url);
  if (!normalized) return null;
  const links = { webcal: 'webcal://' + normalized.slice('https://'.length), google: null };
  const m = /^https:\/\/calendar\.google\.com\/calendar\/ical\/([^/]+)\//.exec(normalized);
  if (m) links.google = `https://calendar.google.com/calendar/r?cid=${m[1]}`;
  return links;
}
