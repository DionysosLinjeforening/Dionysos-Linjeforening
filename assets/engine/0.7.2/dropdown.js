/**
 * Theme-driven dropdown for the canvas (ADR-0009): native select popups are
 * drawn by the browser/OS and turn unreadable in dark toolbars and panels, so
 * ALL editing UI in the preview (and plugins) uses this instead.
 * Self-contained styling (its own style tag), like hint.js.
 *
 *   const dd = createDropdown({ value, options: [['p', 'Paragraph'], …], onchange });
 *   parent.appendChild(dd.el);  dd.set('h2');
 *
 * The buttons do not steal focus (mousedown is prevented), so a text field's
 * selection survives the choice - which is why it fits in the text toolbar.
 */

let openMenu = null;
let teardown = null;

const DD_CSS = `
.urd-dd { position: relative; display: inline-flex; }
.urd-dd-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font: 12px/1.2 system-ui, sans-serif; color: inherit;
  background: rgb(255 255 255 / 6%); border: 1px solid rgb(255 255 255 / 20%);
  border-radius: 5px; padding: 4px 8px; cursor: pointer; white-space: nowrap;
}
.urd-dd-btn:hover { background: rgb(255 255 255 / 12%); }
.urd-dd-caret { font-size: 9px; opacity: 0.65; }
.urd-dd-menu {
  position: fixed; z-index: 100004; min-width: 120px; max-height: 300px; overflow-y: auto;
  display: grid; gap: 2px; padding: 5px;
  background: #151a23; color: #e8eaf0;
  border: 1px solid rgb(255 255 255 / 18%); border-radius: 8px;
  box-shadow: 0 12px 36px rgb(0 0 0 / 55%);
  font: 12px/1.3 system-ui, sans-serif;
}
.urd-dd-menu button {
  font: inherit; color: inherit; text-align: left; background: transparent;
  border: 0; border-radius: 5px; padding: 5px 8px; cursor: pointer; white-space: nowrap;
}
.urd-dd-menu button:hover { background: rgb(255 255 255 / 10%); }
.urd-dd-menu button.selected { background: color-mix(in srgb, #7c5cff 30%, transparent); }
body.urd-chrome-off .urd-dd, body.urd-chrome-off .urd-dd-menu { display: none !important; }
`;

function injectCss() {
  if (document.getElementById('urd-dd-css')) return;
  const style = document.createElement('style');
  style.id = 'urd-dd-css';
  style.textContent = DD_CSS;
  document.head.appendChild(style);
}

export function closeDropdowns() {
  teardown?.();
  openMenu?.remove();
  openMenu = null;
  teardown = null;
}

/**
 * @param {{ value?: string, options: Array<[string, string]>, onchange: (value: string) => void, title?: string }} spec
 * @returns {{ el: HTMLElement, set: (value: string) => void }}
 */
export function createDropdown({ value = null, options = [], onchange, title = '' }) {
  injectCss();
  let current = value;

  const root = document.createElement('span');
  root.className = 'urd-dd';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'urd-dd-btn';
  if (title) btn.title = title;
  const labelEl = document.createElement('span');
  const caret = document.createElement('span');
  caret.className = 'urd-dd-caret';
  caret.textContent = '▾';
  btn.append(labelEl, caret);
  root.appendChild(btn);

  const labelFor = (v) => options.find(([ov]) => `${ov ?? ''}` === `${v ?? ''}`)?.[1] ?? '';
  const set = (v) => {
    current = v;
    labelEl.textContent = labelFor(v);
  };
  set(value ?? options[0]?.[0]);

  // Focus stays where it is (the text selection survives the choice).
  root.addEventListener('mousedown', (event) => event.preventDefault());

  btn.addEventListener('click', () => {
    if (openMenu) {
      closeDropdowns();
      return;
    }
    const menu = document.createElement('div');
    menu.className = 'urd-dd-menu';
    for (const [v, label] of options) {
      const choice = document.createElement('button');
      choice.type = 'button';
      choice.textContent = label;
      if (`${v ?? ''}` === `${current ?? ''}`) choice.classList.add('selected');
      choice.addEventListener('click', () => {
        closeDropdowns();
        set(v);
        onchange?.(v);
      });
      menu.appendChild(choice);
    }
    // The focus guard must cover the menu itself too (it lives in body, outside root).
    menu.addEventListener('mousedown', (event) => event.preventDefault());
    document.body.appendChild(menu);
    openMenu = menu;

    const rect = btn.getBoundingClientRect();
    const below = rect.bottom + 6 + menu.offsetHeight <= window.innerHeight - 8;
    menu.style.left = `${Math.max(8, Math.min(rect.left, window.innerWidth - menu.offsetWidth - 8))}px`;
    menu.style.top = `${below ? rect.bottom + 6 : Math.max(8, rect.top - menu.offsetHeight - 6)}px`;

    const onDown = (event) => {
      if (!menu.contains(event.target) && event.target !== btn) closeDropdowns();
    };
    const onKey = (event) => {
      if (event.key === 'Escape') closeDropdowns();
    };
    setTimeout(() => {
      document.addEventListener('pointerdown', onDown, true);
      document.addEventListener('keydown', onKey, true);
    }, 0);
    teardown = () => {
      document.removeEventListener('pointerdown', onDown, true);
      document.removeEventListener('keydown', onKey, true);
    };
  });

  return { el: root, set };
}
