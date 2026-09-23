/**
 * The form reference plugin: a contact form following the ApeironLF model.
 * By default it sends through the visitor's email client (mailto, zero
 * setup), or to an optional endpoint (the owner's Apps Script or Pages
 * Function) via fetch. A honeypot field guards against bots. It follows the
 * calendar reference: its own CSS in one style tag, a hover config panel, a
 * help chip (ADR-0008) and theme-driven dropdowns (ADR-0009).
 *
 * Visitor input is NEVER set as HTML (only .value/textContent). Endpoint mode
 * requires the owner to open connect-src for the endpoint in _headers
 * (ADR-0006); when a submission is blocked, the block explains the exact line.
 */
import {
  isSpam, validate, buildMailto, buildPayload, endpointOrigin,
} from './form.js';
import { createDropdown } from '/assets/urd/dropdown.js';
// Multilingual (ADR-0012): t() for visitor texts (the site language), ta()
// for the editor chrome and the seed defaults (the admin language). The
// dictionary (locales/) is loaded by the plugin loader BEFORE register() -
// t/ta are never called at module level.
import { t, ta } from '/assets/urd/i18n.js';

/** Field type id + label KEY (looked up with ta at use time; never at module level). */
const FIELD_TYPES = [
  ['text', 'form.edit.typeText'], ['email', 'form.edit.typeEmail'], ['tel', 'form.edit.typeTel'], ['textarea', 'form.edit.typeTextarea'],
  ['select', 'form.edit.typeSelect'], ['checkbox', 'form.edit.typeCheckbox'], ['radio', 'form.edit.typeRadio'], ['date', 'form.edit.typeDate'],
];

/** Field types that carry an option list (the field's `options`). */
const OPTION_TYPES = new Set(['select', 'radio']);

const el2 = (tag, className, textContent) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (textContent != null) node.textContent = textContent;
  return node;
};

const fieldId = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(3));
  return 'f' + [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
};

const post = (msg) => window.parent?.postMessage(msg, location.origin);

/* ---------- Form rendering ---------- */

function fieldControl(field) {
  // A visitor-facing dropdown is a NATIVE select with color-scheme (ADR-0009
  // covers editing UI only); an empty placeholder option is what makes the
  // required check possible.
  if (field.type === 'select') {
    const control = el2('select', 'urd-form-input urd-form-select');
    const placeholder = el2('option', null, t('form.choose'));
    placeholder.value = '';
    control.appendChild(placeholder);
    for (const option of field.options ?? []) {
      const node = el2('option', null, option);
      node.value = option;
      control.appendChild(node);
    }
    control.name = field.id;
    control.dataset.fieldId = field.id;
    return control;
  }
  const control = field.type === 'textarea'
    ? el2('textarea', 'urd-form-input')
    : el2('input', 'urd-form-input');
  if (field.type !== 'textarea') {
    control.type = field.type === 'email' ? 'email'
      : field.type === 'tel' ? 'tel'
        : field.type === 'date' ? 'date'
          : field.type === 'checkbox' ? 'checkbox' : 'text';
  }
  if (field.type === 'textarea') control.rows = 4;
  control.name = field.id;
  control.id = `${field.id}-in`;
  if (field.required && field.type !== 'checkbox') control.required = true;
  control.dataset.fieldId = field.id;
  return control;
}

/** One form row for the field: structure and control vary with the type. */
function fieldRow(field, controls) {
  const star = field.required ? ' *' : '';
  // Radio group: fieldset/legend instead of a wrapping label, one radio per
  // option sharing a name. Harvesting reads the group's :checked.
  if (field.type === 'radio') {
    const row = el2('fieldset', 'urd-form-row urd-form-fieldset');
    row.appendChild(el2('legend', 'urd-form-label', field.label + star));
    for (const option of field.options ?? []) {
      const optLabel = el2('label', 'urd-form-check');
      const radio = el2('input');
      radio.type = 'radio';
      radio.name = field.id;
      radio.value = option;
      optLabel.append(radio, el2('span', null, option));
      row.appendChild(optLabel);
    }
    controls[field.id] = row;
    return row;
  }
  // Checkbox: the box comes BEFORE the label, as the convention is.
  if (field.type === 'checkbox') {
    const row = el2('label', 'urd-form-row urd-form-checkrow');
    const inner = el2('span', 'urd-form-check');
    const control = fieldControl(field);
    controls[field.id] = control;
    inner.append(control, el2('span', 'urd-form-label', field.label + star));
    row.appendChild(inner);
    return row;
  }
  const row = el2('label', 'urd-form-row');
  const control = fieldControl(field);
  controls[field.id] = control;
  row.append(el2('span', 'urd-form-label', field.label + star), control);
  return row;
}

function renderForm(host, props, ctx) {
  const fields = props.fields ?? [];
  const form = el2('form', 'urd-form-form');
  form.noValidate = true;

  const controls = {};
  for (const field of fields) {
    const row = fieldRow(field, controls);
    const error = el2('span', 'urd-form-error');
    error.dataset.for = field.id;
    row.appendChild(error);
    form.appendChild(row);
  }

  // Honeypot: hidden from humans, filled in by bots. Never visible, never tabbable.
  const honeypot = el2('input', 'urd-form-hp');
  honeypot.type = 'text';
  honeypot.name = 'website';
  honeypot.tabIndex = -1;
  honeypot.autocomplete = 'off';
  honeypot.setAttribute('aria-hidden', 'true');
  form.appendChild(honeypot);

  const submit = el2('button', 'urd-form-submit', props.submitLabel || t('form.send'));
  submit.type = 'submit';
  form.appendChild(submit);

  const status = el2('p', 'urd-form-status');
  form.appendChild(status);

  const showErrors = (errors) => {
    for (const field of fields) {
      const cell = form.querySelector(`.urd-form-error[data-for="${field.id}"]`);
      if (cell) cell.textContent = errors[field.id] ?? '';
    }
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'urd-form-status';
    status.textContent = '';
    // Per-type harvesting: a checkbox is boolean, a radio group reads
    // :checked, and the rest read .value.
    const values = {};
    for (const field of fields) {
      const control = controls[field.id];
      values[field.id] = field.type === 'checkbox' ? control?.checked === true
        : field.type === 'radio' ? (control?.querySelector('input:checked')?.value ?? '')
          : (control?.value ?? '');
    }

    // Spam: act as if it went through, but send nothing (do not tip off the bot).
    if (isSpam(honeypot.value)) {
      status.classList.add('ok');
      status.textContent = props.successText || t('form.thanks');
      return;
    }

    const result = validate(fields, values, {
      required: t('form.required'),
      email: t('form.invalidEmail'),
      choice: t('form.invalidChoice'),
      date: t('form.invalidDate'),
    });
    showErrors(result.errors);
    if (!result.ok) return;

    if (ctx.preview) {
      status.classList.add('ok');
      status.textContent = ta('form.edit.previewOk');
      return;
    }

    const done = () => {
      status.classList.add('ok');
      status.textContent = props.successText || t('form.thanks');
      form.reset();
    };

    if ((props.mode ?? 'mailto') === 'endpoint' && props.endpoint) {
      submit.disabled = true;
      try {
        const res = await fetch(props.endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(buildPayload(fields, values, { side: location.pathname })),
        });
        if (!res.ok) throw new Error(String(res.status));
        done();
      } catch {
        status.classList.add('error');
        status.textContent = t('form.sendFailed');
      } finally {
        submit.disabled = false;
      }
    } else {
      const url = buildMailto(props.recipient, props.subject || t('form.subjectDefault'), fields, values, { yes: t('form.yes') });
      if (!url) {
        status.classList.add('error');
        status.textContent = t('form.noRecipient');
        return;
      }
      window.location.href = url;
      done();
    }
  });

  host.appendChild(form);
}

/* ---------- Config panel (in the preview) ---------- */

function configPanel(el, props, ctx) {
  const gear = el2('button', 'urd-form-gear urd-cfg-toggle', `⚙ ${ta('form.edit.gear')}`);
  gear.type = 'button';
  gear.title = ta('form.edit.gearTitle');
  const panel = el2('div', 'urd-form-config');

  const label = (text) => el2('div', 'urd-form-config-label', text);
  const textInput = (value, placeholder) => {
    const input = el2('input', 'urd-form-config-input');
    input.value = value ?? '';
    if (placeholder) input.placeholder = placeholder;
    return input;
  };

  let mode = props.mode ?? 'mailto';
  const recipient = textInput(props.recipient, ta('form.edit.recipientPh'));
  const subject = textInput(props.subject, ta('form.edit.subjectPh'));
  const endpoint = textInput(props.endpoint, ta('form.edit.endpointPh'));
  const submitLabel = textInput(props.submitLabel, ta('form.edit.sendDefault'));
  const successText = textInput(props.successText, ta('form.edit.thanksDefault'));

  const modeRow = el2('div', 'urd-form-config-row');
  const modeDd = createDropdown({
    value: mode,
    title: ta('form.edit.modeTitle'),
    options: [['mailto', ta('form.edit.modeMailto')], ['endpoint', ta('form.edit.modeEndpoint')]],
    onchange: (value) => { mode = value; syncMode(); },
  });
  modeRow.appendChild(modeDd.el);

  const mailtoBox = el2('div', 'urd-form-config-box');
  mailtoBox.append(label(ta('form.edit.recipient')), recipient, label(ta('form.edit.subject')), subject);
  const endpointBox = el2('div', 'urd-form-config-box');
  endpointBox.append(label(ta('form.edit.endpoint')), endpoint,
    el2('p', 'urd-form-config-note', ta('form.edit.endpointNote')));
  const syncMode = () => {
    mailtoBox.style.display = mode === 'mailto' ? '' : 'none';
    endpointBox.style.display = mode === 'endpoint' ? '' : 'none';
  };
  syncMode();

  // Field editing: add, change name/type/required, remove. Select and radio
  // get their own option line (comma separated) right under their row;
  // changing the type re-renders the list, so the line shows only where it
  // applies.
  let fields = (props.fields ?? []).map((f) => ({ ...f, options: Array.isArray(f.options) ? [...f.options] : undefined }));
  const fieldList = el2('div', 'urd-form-fieldlist');
  const renderFields = () => {
    fieldList.replaceChildren();
    fields.forEach((field, index) => {
      const row = el2('div', 'urd-form-fieldrow');
      const name = textInput(field.label, ta('form.edit.fieldNamePh'));
      name.addEventListener('input', () => { field.label = name.value; });
      const typeDd = createDropdown({
        value: field.type,
        options: FIELD_TYPES.map(([value, key]) => [value, ta(key)]),
        onchange: (value) => { field.type = value; renderFields(); },
      });
      const req = el2('label', 'urd-form-fieldreq');
      const reqBox = el2('input');
      reqBox.type = 'checkbox';
      reqBox.checked = field.required !== false;
      reqBox.addEventListener('change', () => { field.required = reqBox.checked; });
      req.append(reqBox, document.createTextNode(` ${ta('form.edit.required')}`));
      const del = el2('button', 'urd-form-fielddel', '✕');
      del.type = 'button';
      del.title = ta('form.edit.removeField');
      del.addEventListener('click', () => { fields.splice(index, 1); renderFields(); });
      row.append(name, typeDd.el, req, del);
      fieldList.appendChild(row);
      if (OPTION_TYPES.has(field.type)) {
        const opts = textInput((field.options ?? []).join(', '), ta('form.edit.optionsPh'));
        opts.classList.add('urd-form-fieldopts');
        opts.addEventListener('input', () => {
          field.options = opts.value.split(',').map((v) => v.trim()).filter(Boolean);
        });
        fieldList.appendChild(opts);
      }
    });
  };
  renderFields();
  const addField = el2('button', 'urd-form-addfield', ta('form.edit.addField'));
  addField.type = 'button';
  addField.addEventListener('click', () => {
    fields.push({ id: fieldId(), label: ta('form.edit.newField'), type: 'text', required: false });
    renderFields();
  });

  const apply = el2('button', 'urd-form-apply', ta('common.apply'));
  apply.type = 'button';
  apply.addEventListener('click', () => {
    const cleaned = fields
      .map((f) => ({
        id: f.id || fieldId(),
        label: (f.label || ta('form.edit.fieldFallback')).trim(),
        type: f.type || 'text',
        required: f.required !== false,
        // The option list follows only the types that use it, so changing
        // the type away from select or radio leaves no orphaned list.
        ...(OPTION_TYPES.has(f.type) ? { options: (f.options ?? []).filter(Boolean) } : {}),
      }))
      .filter((f) => f.label);
    post({
      type: 'urd-edit',
      sectionId: ctx.section.id,
      blockId: el.dataset.blockId,
      props: {
        recipient: recipient.value.trim(),
        subject: subject.value.trim(),
        mode,
        endpoint: endpoint.value.trim(),
        submitLabel: submitLabel.value.trim() || ta('form.edit.sendDefault'),
        successText: successText.value.trim() || ta('form.edit.thanksDefault'),
        fields: cleaned,
      },
      rerender: true,
    });
    close();
  });

  panel.append(
    label(ta('form.edit.mode')), modeRow, mailtoBox, endpointBox,
    label(ta('form.edit.fields')), fieldList, addField,
    label(ta('lbl.buttonText')), submitLabel,
    label(ta('form.edit.receipt')), successText,
    apply,
  );

  const onOutside = (event) => {
    if (!panel.isConnected) { close(); return; }
    if (panel.contains(event.target) || event.target === gear || event.target.closest('.urd-dd-menu')) return;
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

/* ---------- Auto-grow (the same pattern as collection and calendar) ---------- */

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

/* ---------- CSS ---------- */

const FORM_CSS = `
.urd-form { width: 100%; position: relative; display: grid; gap: 10px; }
.urd-form-form { display: grid; gap: 12px; }
.urd-form-row { display: grid; gap: 4px; }
.urd-form-label { font-size: 0.85em; font-weight: 600; }
.urd-form-input { font: inherit; color: inherit; background: var(--urd-color-surface);
  border: 1px solid color-mix(in srgb, var(--urd-color-text) 22%, transparent);
  border-radius: var(--urd-radius-sm); padding: 8px 10px; width: 100%; }
.urd-form-input:focus { outline: 2px solid var(--urd-color-accent); outline-offset: 1px; }
textarea.urd-form-input { resize: vertical; min-height: 90px; }
/* Native select and date input for visitors (ADR-0009 covers editing UI only):
   color-scheme lets the popup and the date picker follow the user's OS theme. */
.urd-form-select, .urd-form-input[type="date"] { color-scheme: light dark; }
.urd-form-fieldset { border: 0; padding: 0; margin: 0; }
.urd-form-fieldset legend { padding: 0; margin-bottom: 4px; }
.urd-form-check { display: flex; align-items: center; gap: 8px; cursor: pointer; }
.urd-form-check input { accent-color: var(--urd-color-accent); width: 16px; height: 16px; margin: 0; }
.urd-form-checkrow .urd-form-label { font-weight: 400; }
.urd-form-error { font-size: 0.8em; color: #e05252; min-height: 0; }
.urd-form-error:empty { display: none; }
.urd-form-hp { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none; }
.urd-form-submit { justify-self: start; font: inherit; font-weight: 600; cursor: pointer;
  color: #fff; background: var(--urd-color-accent); border: 0;
  border-radius: var(--urd-radius-sm); padding: 10px 20px; }
.urd-form-submit:disabled { opacity: 0.6; cursor: default; }
.urd-form-status { font-size: 0.9em; margin: 0; }
.urd-form-status.ok { color: color-mix(in srgb, #4ac26b 85%, var(--urd-color-text)); }
.urd-form-status.error { color: #e05252; }
.urd-form-tools { position: absolute; top: -32px; right: -6px; z-index: 5;
  display: flex; gap: 4px; align-items: center;
  /* An invisible bridge down to the block edge, so hover survives the trip up */
  padding-bottom: 8px; }
.urd-form-tools .urd-hint-chip { position: static; }
/* The config toggle is hidden: the settings open from the block's Properties panel. */
.urd-form-gear { display: none; }
.urd-block:hover .urd-form-gear, .urd-form-gear:focus-visible,
.urd-form:has(.urd-form-config.visible) .urd-form-gear { opacity: 0.92; pointer-events: auto; }
.urd-form-config { position: absolute; top: -6px; right: 0; z-index: 6; width: min(360px, 92vw);
  max-height: 80vh; overflow-y: auto; display: none; gap: 6px; padding: 12px; border-radius: 10px;
  background: #151a23; color: #e8eaf0; border: 1px solid rgb(255 255 255 / 18%);
  box-shadow: 0 12px 36px rgb(0 0 0 / 55%); font: 12px/1.4 system-ui, sans-serif; }
.urd-form-config.visible { display: grid; }
.urd-form-config-label { font-size: 10px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.55; }
.urd-form-config-box { display: grid; gap: 6px; }
.urd-form-config-note { font-size: 11px; opacity: 0.6; margin: 0; }
.urd-form-config-input { font: 12px/1.4 system-ui, sans-serif; color: inherit; background: rgb(255 255 255 / 6%);
  border: 1px solid rgb(255 255 255 / 20%); border-radius: 6px; padding: 5px 7px; width: 100%; }
.urd-form-fieldlist { display: grid; gap: 6px; }
.urd-form-fieldrow { display: grid; grid-template-columns: 1fr auto auto auto; gap: 6px; align-items: center; }
.urd-form-fieldopts { margin: -2px 0 2px; }
.urd-form-fieldreq { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; white-space: nowrap; }
.urd-form-fielddel { font: inherit; color: #e05252; background: transparent; border: 0; cursor: pointer; padding: 2px 6px; }
.urd-form-addfield, .urd-form-apply { font: 600 12px/1 system-ui, sans-serif; cursor: pointer;
  border-radius: 6px; padding: 7px 10px; border: 1px solid rgb(255 255 255 / 20%);
  background: rgb(255 255 255 / 8%); color: inherit; }
.urd-form-apply { background: #7c5cff; color: #fff; border: 0; }
body.urd-chrome-off .urd-form-gear, body.urd-chrome-off .urd-form-config { display: none !important; }
`;

function injectCss() {
  if (document.getElementById('urd-form-css')) return;
  const style = document.createElement('style');
  style.id = 'urd-form-css';
  style.textContent = FORM_CSS;
  document.head.appendChild(style);
}

/* ---------- The block ---------- */

function renderFormBlock(el, props, ctx) {
  injectCss();
  const host = el2('div', 'urd-form');
  el.appendChild(host);
  renderForm(host, props, ctx);

  if (ctx.preview && ctx.viewport !== 'mobile') {
    const [gear, panel] = configPanel(el, props, ctx);
    // The help chip and the form gear share one row at the top right, with a hover bridge (clear of the rotation handle).
    const tools = el2('div', 'urd-form-tools');
    tools.appendChild(gear);
    host.append(tools, panel);
    import('/assets/urd/hint.js').then(({ attachHint }) => {
      if (!host.isConnected || host.querySelector('.urd-hint-chip')) return;
      const chip = attachHint(tools, {
        title: ta('form.edit.hintTitle'),
        lines: [
          ta('form.edit.hint1'),
          ta('form.edit.hint2'),
          ta('form.edit.hint3'),
          ta('form.edit.hint4'),
          ta('form.edit.hint5'),
        ],
      });
      tools.insertBefore(chip, tools.firstChild);
    });
  }

  autoGrow(el, host, ctx);
}

/* ---------- The contact-form preset ---------- */

const blockId = () => {
  const bytes = crypto.getRandomValues(new Uint8Array(4));
  return 'blk-' + [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
};

// The seed rule (ADR-0012): the field labels are written into props at
// insertion time, translated ONCE with the admin language (ta in the factory
// body).
const defaultFields = () => [
  { id: 'navn', label: ta('form.edit.fieldName'), type: 'text', required: true },
  { id: 'epost', label: ta('form.edit.fieldEmail'), type: 'email', required: true },
  { id: 'melding', label: ta('form.edit.fieldMessage'), type: 'textarea', required: true },
];

function contactSection() {
  return {
    id: 'sec-' + blockId().slice(4),
    version: 1,
    preset: 'contact-form',
    size: { minHeight: '520px' },
    grid: null,
    background: { version: 1, layers: [{ type: 'color', version: 1, props: { color: 'bg', opacity: 1 } }] },
    blocks: [
      {
        id: blockId(),
        type: 'text',
        version: 1,
        props: { html: ta('form.edit.seedIntro'), align: 'left', box: false },
        animation: null,
        frames: { desktop: { x: 6, y: 40, w: 60, h: 120, z: 1, rot: 0 }, mobile: null },
      },
      {
        id: blockId(),
        type: 'form',
        version: 1,
        props: { recipient: '', subject: '', mode: 'mailto', endpoint: '', submitLabel: ta('form.edit.sendDefault'), successText: ta('form.edit.thanksDefault'), fields: defaultFields() },
        animation: null,
        frames: { desktop: { x: 6, y: 180, w: 60, h: 380, z: 2, rot: 0 }, mobile: null },
      },
    ],
    responsive: { mobile: { mode: 'auto', attention: null } },
  };
}

/* ---------- Registration ---------- */

/** @param {typeof window.Urd} Urd */
export function register(Urd) {
  Urd.blocks.define('form', {
    version: 1,
    autoGrow: true,
    label: 'Form',
    labelKey: 'form.edit.blockLabel',
    defaults: () => ({
      recipient: '', subject: '', mode: 'mailto', endpoint: '',
      submitLabel: ta('form.edit.sendDefault'), successText: ta('form.edit.thanksDefault'), fields: defaultFields(),
    }),
    migrations: {},
    render: renderFormBlock,
  });

  Urd.sections.define('contact-form', {
    label: 'Contact form',
    labelKey: 'form.edit.presetLabel',
    group: 'Cards and lists',
    groupKey: 'presetGroup.cards',
    hint: 'Contact form that sends via email (or your own endpoint)',
    hintKey: 'form.edit.presetHint',
    create: contactSection,
  });
}
