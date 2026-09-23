/**
 * Pure form logic for the form plugin (no DOM, no fetch): validation,
 * honeypot, mailto building and payload shaping. Everything here is
 * unit-tested in node; index.js handles rendering and submission.
 *
 * Visitor input is NEVER treated as HTML: the values are URL-encoded for
 * mailto and sent as JSON to an optional endpoint. The honeypot is a hidden
 * field that bots fill in; when it is filled in, the submission is discarded.
 */

/** A practical email check (not RFC-complete, but it catches the common mistakes). */
export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? '').trim());
}

/**
 * Honeypot: bots fill in every field, the hidden one included. When the
 * honeypot field is filled in, the submission is treated as spam.
 * @param {string} honeypotValue
 * @returns {boolean} true = spam (discard the submission)
 */
export function isSpam(honeypotValue) {
  return String(honeypotValue ?? '').trim() !== '';
}

/** A valid calendar date in ISO form (YYYY-MM-DD), the way `<input type="date">` gives it. */
export function isIsoDate(value) {
  const text = String(value ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  const [y, m, d] = text.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d;
}

/**
 * Validates the collected values against the field definitions.
 * A checkbox carries a boolean value (required = it must be ticked); select
 * and radio fields with `options` accept only values from that list (a guard
 * against tampered submissions in endpoint mode); a date must be a valid ISO
 * date.
 * @param {Array<{id, label, type, required, options?: string[]}>} fields
 * @param {Record<string,string|boolean>} values
 * @param {{required?: string, email?: string, choice?: string, date?: string}} [messages] Message templates ({label} is substituted)
 * @returns {{ ok: boolean, errors: Record<string,string> }}
 */
export function validate(fields, values, messages = {}) {
  // The message templates can be overridden (index.js passes the visitor
  // language's texts via t()); the defaults are English, so the node tests
  // stand on their own.
  const requiredMsg = messages.required ?? '{label} is required';
  const emailMsg = messages.email ?? 'Enter a valid email address';
  const choiceMsg = messages.choice ?? 'Choose one of the options';
  const dateMsg = messages.date ?? 'Enter a valid date';
  const errors = {};
  for (const field of fields) {
    // Boolean before string coercion: String(false) is a non-empty string
    // and would let a required, unticked box through.
    if (field.type === 'checkbox') {
      if (field.required && values[field.id] !== true) {
        errors[field.id] = requiredMsg.replaceAll('{label}', field.label);
      }
      continue;
    }
    const value = String(values[field.id] ?? '').trim();
    if (field.required && !value) {
      errors[field.id] = requiredMsg.replaceAll('{label}', field.label);
      continue;
    }
    if (!value) continue;
    if (field.type === 'email' && !isEmail(value)) {
      errors[field.id] = emailMsg;
    } else if ((field.type === 'select' || field.type === 'radio')
      && Array.isArray(field.options) && !field.options.includes(value)) {
      errors[field.id] = choiceMsg;
    } else if (field.type === 'date' && !isIsoDate(value)) {
      errors[field.id] = dateMsg;
    }
  }
  return { ok: Object.keys(errors).length === 0, errors };
}

/** "Field: value" lines, one per field that has a value (plain text, for the
 *  email body). A ticked box becomes the yes word (opts.yes); an empty box is
 *  left out like any other empty field. */
function bodyLines(fields, values, opts = {}) {
  const yes = opts.yes ?? 'Yes';
  return fields
    .map((field) => {
      const raw = values[field.id];
      const value = field.type === 'checkbox' ? (raw === true ? yes : '') : String(raw ?? '').trim();
      return [field.label, value];
    })
    .filter(([, value]) => value)
    .map(([label, value]) => `${label}: ${value}`)
    .join('\n');
}

/**
 * Builds a mailto URL with subject and body from the fields (all URL-encoded).
 * @param {string} recipient recipient address
 * @param {string} subject
 * @param {Array} fields
 * @param {Record<string,string|boolean>} values
 * @param {{yes?: string}} [opts] the yes word for checkbox fields (the visitor language)
 * @returns {string|null} null when the recipient is missing
 */
export function buildMailto(recipient, subject, fields, values, opts = {}) {
  const to = String(recipient ?? '').trim();
  if (!to) return null;
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  const body = bodyLines(fields, values, opts);
  if (body) params.set('body', body);
  const query = params.toString().replace(/\+/g, '%20');
  return query ? `mailto:${to}?${query}` : `mailto:${to}`;
}

/**
 * Payload for an external endpoint: the field values plus sender context.
 * The honeypot is deliberately left out (it is a client-side guard only).
 * Checkbox fields are sent as real booleans, the rest as trimmed strings.
 * @returns {Record<string, string|boolean>}
 */
export function buildPayload(fields, values, extra = {}) {
  const out = { ...extra };
  for (const field of fields) {
    out[field.id] = field.type === 'checkbox'
      ? values[field.id] === true
      : String(values[field.id] ?? '').trim();
  }
  return out;
}

/** The endpoint's origin (for the CSP instruction when a submission is blocked). */
export function endpointOrigin(url) {
  try {
    return new URL(String(url).trim()).origin;
  } catch {
    return null;
  }
}
