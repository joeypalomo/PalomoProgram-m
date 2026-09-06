// PalomoProgram shell: header, tab bar, hash router, live refresh.
import { getState, subscribe, update, pottyStatus, sleepStatus } from './store.js';
import { icon, haptic, toast, isSheetOpen, esc } from './ui.js';
import { markSVG } from './logo.js';
import { renderToday } from './views/today.js';
import { renderTrain } from './views/train.js';
import { renderRespond } from './views/respond.js';
import { renderPets } from './views/pets.js';
import { renderReview, applyTheme } from './views/review.js';

const TABS = [
  { id: 'today', label: 'Today', icon: 'home', render: renderToday },
  { id: 'train', label: 'Train', icon: 'train', render: renderTrain },
  { id: 'respond', label: 'Respond', icon: 'shield', render: renderRespond, danger: true },
  { id: 'pets', label: 'Pets', icon: 'pets', render: renderPets },
  { id: 'review', label: 'Review', icon: 'review', render: renderReview },
];

const app = document.getElementById('app');
let current = { id: 'today', params: {} };
let scrollMemory = {};

function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const [id, query] = h.split('?');
  const params = {};
  if (query) query.split('&').forEach((kv) => { const [k, v] = kv.split('='); params[decodeURIComponent(k)] = decodeURIComponent(v || ''); });
  return { id: TABS.some((t) => t.id === id) ? id : 'today', params };
}

export function nav(id, params = {}) {
  const q = Object.entries(params).filter(([, v]) => v != null && v !== '').map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
  location.hash = `/${id}${q ? '?' + q : ''}`;
}

function renderShell() {
  const s = getState();
  document.getElementById('header').innerHTML = `
    <div class="brand">${markSVG({ size: 30 })}<div class="wordmark">PALOMO<span>PROGRAM</span></div></div>
    <div class="cg-switch" role="group" aria-label="Caregiver on duty">
      ${s.settings.caregivers.map((c) => `<button class="cg ${c === s.settings.activeCaregiver ? 'active' : ''}" data-cg="${esc(c)}">${esc(c)}</button>`).join('')}
    </div>`;
  document.querySelectorAll('[data-cg]').forEach((b) => b.addEventListener('click', () => {
    haptic(8);
    update((st) => { st.settings.activeCaregiver = b.getAttribute('data-cg'); });
    toast(`${b.getAttribute('data-cg')} is on duty. Entries are tagged to you.`);
  }));
  document.getElementById('tabbar').innerHTML = TABS.map((t) => `
    <button class="tab ${t.id === current.id ? 'active' : ''} ${t.danger ? 'tab-danger' : ''}" data-tab="${t.id}" aria-label="${t.label}">
      ${icon(t.icon)}<span>${t.label}</span>
    </button>`).join('');
  document.querySelectorAll('[data-tab]').forEach((b) => b.addEventListener('click', () => { haptic(6); nav(b.getAttribute('data-tab')); }));
}

function renderView() {
  const tab = TABS.find((t) => t.id === current.id);
  app.className = `view view-${current.id}`;
  tab.render(app, nav, current.params);
  const remembered = scrollMemory[current.id + JSON.stringify(current.params)];
  window.scrollTo(0, remembered || 0);
}

function route() {
  scrollMemory[current.id + JSON.stringify(current.params)] = window.scrollY;
  current = parseHash();
  renderShell();
  renderView();
}

// Re-render on state change unless a sheet is open (to avoid yanking inputs).
let pendingRefresh = false;
subscribe(() => {
  if (isSheetOpen()) { pendingRefresh = true; return; }
  renderShell();
  scrollMemory[current.id + JSON.stringify(current.params)] = window.scrollY;
  renderView();
});
window.addEventListener('pp:refresh', () => { renderShell(); renderView(); });
// When a sheet closes, apply deferred refresh.
const observer = new MutationObserver(() => {
  if (pendingRefresh && !isSheetOpen()) { pendingRefresh = false; scrollMemory[current.id + JSON.stringify(current.params)] = window.scrollY; renderShell(); renderView(); }
});
observer.observe(document.body, { childList: true });

// Tick every 30s so timers, potty-due and the current block stay live.
let lastPottyNotified = 0;
setInterval(() => {
  if (isSheetOpen()) return;
  if (current.id === 'today') { scrollMemory[current.id + JSON.stringify(current.params)] = window.scrollY; renderView(); }
  const s = getState();
  if (s.settings.notifications && 'Notification' in window && Notification.permission === 'granted') {
    const p = pottyStatus();
    if (p.due && !p.asleep && Date.now() - lastPottyNotified > 15 * 60000) {
      lastPottyNotified = Date.now();
      try { new Notification('PalomoProgram', { body: `Potty due for ${s.settings.dogName}${p.reasons && p.reasons.length ? ` (${p.reasons[0]})` : ''}.`, tag: 'potty' }); } catch (_) { /* noop */ }
    }
  }
}, 30000);

window.addEventListener('hashchange', route);
document.addEventListener('visibilitychange', () => { if (!document.hidden && !isSheetOpen()) renderView(); });

// ---------- onboarding ----------
function onboarding() {
  const s = getState();
  if (s.settings.onboarded) return;
  const wrap = document.createElement('div');
  wrap.className = 'onboard';
  wrap.innerHTML = `
    <div class="onboard-inner">
      ${markSVG({ size: 96, cut: 'var(--bg)' })}
      <div class="wordmark big">PALOMO<span>PROGRAM</span></div>
      <p class="lead">${esc(s.settings.dogName)}'s daily training system. Built from the Puppy Foundations guide, tuned for one-handed use at 7am.</p>
      <ul class="onboard-list">
        <li>${icon('home')}<span><b>Today</b> runs the clock, potty timing, meals, rest and the handoff card.</span></li>
        <li>${icon('train')}<span><b>Train</b> holds the ten skill cards, the 14-day plan, separation steps and experiences.</span></li>
        <li>${icon('shield')}<span><b>Respond</b> is the response card: tap what happened, act calmly, log it.</span></li>
        <li>${icon('pets')}<span><b>Pets</b> tracks Charlie, Tortilla and Maisie sessions and tells you when to change one thing.</span></li>
        <li>${icon('review')}<span><b>Review</b> auto-builds the daily log and the weekly review.</span></li>
      </ul>
      <p class="fine">Add to your home screen for the full-screen app. iPhone: Share, then Add to Home Screen.</p>
      <button class="btn btn-primary btn-block" id="onboardGo">Rock and roll</button>
    </div>`;
  document.body.appendChild(wrap);
  document.getElementById('onboardGo').addEventListener('click', () => {
    haptic([10, 40, 10]);
    update((st) => { st.settings.onboarded = true; });
    wrap.classList.add('hide');
    setTimeout(() => wrap.remove(), 300);
  });
}

// ---------- boot ----------
applyTheme();
if (!location.hash) location.hash = '/today';
route();
onboarding();

if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
