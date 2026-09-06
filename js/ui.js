// Small UI kit: escaping template tag, bottom sheets, toasts, haptics.

export function esc(v) {
  if (v == null) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// html`...` escapes interpolated values unless wrapped with raw().
class Raw {
  constructor(s) { this.s = s; }
  toString() { return this.s; }
}
export const raw = (s) => new Raw(s);

export function html(strings, ...values) {
  let out = '';
  strings.forEach((str, i) => {
    out += str;
    if (i < values.length) {
      const v = values[i];
      if (v instanceof Raw) out += v.s;
      else if (Array.isArray(v)) out += v.map((x) => (x instanceof Raw ? x.s : esc(x))).join('');
      else if (v === false || v == null) out += '';
      else out += esc(v);
    }
  });
  return new Raw(out);
}

export function haptic(pattern = 10) {
  try { if (navigator.vibrate) navigator.vibrate(pattern); } catch (_) { /* noop */ }
}

// ---------- toast ----------
let toastTimer = null;
export function toast(message, { action, onAction, duration = 3500, tone = 'default' } = {}) {
  let host = document.getElementById('toast');
  if (!host) {
    host = document.createElement('div');
    host.id = 'toast';
    document.body.appendChild(host);
  }
  host.innerHTML = '';
  const el = document.createElement('div');
  el.className = `toast toast-${tone}`;
  el.innerHTML = `<span>${esc(message)}</span>${action ? `<button class="toast-action">${esc(action)}</button>` : ''}`;
  host.appendChild(el);
  if (action) {
    el.querySelector('.toast-action').addEventListener('click', () => {
      onAction && onAction();
      host.innerHTML = '';
    });
  }
  requestAnimationFrame(() => el.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => { if (host.contains(el)) host.removeChild(el); }, 250);
  }, duration);
}

// ---------- bottom sheet ----------
let sheetEl = null;
export function openSheet(contentHtml, { title, onOpen, tall = false } = {}) {
  closeSheet();
  const wrap = document.createElement('div');
  wrap.className = 'sheet-wrap';
  wrap.innerHTML = `
    <div class="sheet-backdrop"></div>
    <div class="sheet ${tall ? 'sheet-tall' : ''}" role="dialog" aria-modal="true">
      <div class="sheet-grip"></div>
      ${title ? `<div class="sheet-title">${esc(title)}</div>` : ''}
      <div class="sheet-body">${contentHtml}</div>
    </div>`;
  document.body.appendChild(wrap);
  document.body.classList.add('sheet-open');
  wrap.querySelector('.sheet-backdrop').addEventListener('click', closeSheet);
  requestAnimationFrame(() => wrap.classList.add('show'));
  sheetEl = wrap;
  // swipe down to close
  const sheet = wrap.querySelector('.sheet');
  let startY = null;
  sheet.addEventListener('touchstart', (e) => { if (sheet.scrollTop <= 0) startY = e.touches[0].clientY; }, { passive: true });
  sheet.addEventListener('touchmove', (e) => {
    if (startY == null) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0) sheet.style.transform = `translateY(${dy}px)`;
  }, { passive: true });
  sheet.addEventListener('touchend', (e) => {
    if (startY == null) return;
    const dy = e.changedTouches[0].clientY - startY;
    startY = null;
    if (dy > 90) closeSheet();
    else sheet.style.transform = '';
  });
  onOpen && onOpen(wrap.querySelector('.sheet-body'));
  return wrap.querySelector('.sheet-body');
}

export function closeSheet() {
  if (!sheetEl) return;
  const el = sheetEl;
  sheetEl = null;
  el.classList.remove('show');
  document.body.classList.remove('sheet-open');
  setTimeout(() => el.remove(), 220);
}

export function isSheetOpen() {
  return !!sheetEl;
}

// ---------- delegation ----------
// Binds click handlers for [data-act] within root. handlers: {actName: (el, ev) => void}
export function bind(root, handlers) {
  root.querySelectorAll('[data-act]').forEach((el) => {
    const act = el.getAttribute('data-act');
    if (handlers[act]) {
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        handlers[act](el, ev);
      });
    }
  });
}

export function bindInputs(root, handlers) {
  root.querySelectorAll('[data-input]').forEach((el) => {
    const name = el.getAttribute('data-input');
    if (handlers[name]) {
      el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', (ev) => handlers[name](el, ev));
    }
  });
}

// Segmented control helper: returns HTML, selection tracked via data-value on active item.
export function segmented(name, options, value) {
  return `<div class="seg" data-seg="${esc(name)}">${options
    .map((o) => `<button type="button" class="seg-item ${o.value === value ? 'active' : ''}" data-value="${esc(o.value)}">${esc(o.label)}</button>`)
    .join('')}</div>`;
}

export function segValue(root, name) {
  const active = root.querySelector(`[data-seg="${name}"] .seg-item.active`);
  return active ? active.getAttribute('data-value') : null;
}

export function wireSegments(root, onChange) {
  root.querySelectorAll('.seg').forEach((seg) => {
    seg.querySelectorAll('.seg-item').forEach((btn) => {
      btn.addEventListener('click', () => {
        seg.querySelectorAll('.seg-item').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        haptic(6);
        onChange && onChange(seg.getAttribute('data-seg'), btn.getAttribute('data-value'));
      });
    });
  });
}

export function icon(name, cls = '') {
  const paths = {
    potty: '<path d="M7 3v5a5 5 0 0 0 10 0V3"/><path d="M5 21h14"/><path d="M12 13v8"/>',
    meal: '<path d="M4 10h16l-1.5 9H5.5z"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    sleep: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
    lesson: '<path d="M12 2l3 6 6 .9-4.5 4.3 1.1 6.3L12 16.6 6.4 19.5l1.1-6.3L3 8.9 9 8z"/>',
    alert: '<path d="M12 3l10 18H2z"/><path d="M12 10v5"/><circle cx="12" cy="18.5" r=".8"/>',
    paw: '<circle cx="12" cy="15" r="4"/><circle cx="6" cy="10" r="1.7"/><circle cx="18" cy="10" r="1.7"/><circle cx="9" cy="5.5" r="1.7"/><circle cx="15" cy="5.5" r="1.7"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    play: '<path d="M7 4l12 8-12 8z"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="1.5"/>',
    home: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
    train: '<path d="M4 20l6-6"/><path d="M14 4l6 6-8 8-6-6z"/><path d="M12 8l4 4"/>',
    shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
    pets: '<circle cx="8" cy="9" r="3"/><circle cx="16" cy="9" r="3"/><path d="M4 20c0-3 3.5-5 8-5s8 2 8 5"/>',
    review: '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cat: '<path d="M5 9l-1-5 5 3h6l5-3-1 5"/><path d="M4 9a8 8 0 0 0 16 0"/><path d="M9 13h.01M15 13h.01"/>',
    dog: '<path d="M4 7l4-3 2 4h4l2-4 4 3-2 5v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-5z"/><path d="M10 13h.01M14 13h.01"/>',
    chevron: '<path d="M9 6l6 6-6 6"/>',
    back: '<path d="M15 6l-6 6 6 6"/>',
    social: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18z"/>',
    calm: '<path d="M3 14c3-4 6-4 9 0s6 4 9 0"/><path d="M3 9c3-4 6-4 9 0s6 4 9 0"/>',
    drop: '<path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z"/>',
    note: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 12h6M9 16h6"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    book: '<path d="M4 4h7a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h7z"/>',
    hand: '<path d="M8 13V5a1.5 1.5 0 0 1 3 0v6"/><path d="M11 11V4a1.5 1.5 0 0 1 3 0v7"/><path d="M14 11V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L3 13.5a1.5 1.5 0 0 1 2.5-1.6L8 14"/>',
    undo: '<path d="M4 10h10a5 5 0 0 1 0 10H9"/><path d="M8 6l-4 4 4 4"/>',
  };
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || ''}</svg>`;
}
