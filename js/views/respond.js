import { html, raw, esc, bind, icon, openSheet } from '../ui.js';
import { getState, eventsForDay, fmtTime, dateKey } from '../store.js';
import { RESPONSES, RESPONSE_RULES, HELP } from '../data/guide.js';
import { incidentSheet } from '../sheets.js';

export function renderRespond(root, nav) {
  const today = eventsForDay().filter((e) => e.type === 'incident');
  const counts = {};
  today.forEach((e) => { counts[e.kind] = (counts[e.kind] || 0) + 1; });
  // Last 7 days trend
  const week = {};
  const now = Date.now();
  getState().events.filter((e) => e.type === 'incident' && now - e.ts < 7 * 86400000).forEach((e) => { week[e.kind] = (week[e.kind] || 0) + 1; });

  root.innerHTML = html`
    <section class="hero hero-danger">
      <div class="hero-top"><div><div class="eyebrow danger">Response card</div><h1 class="h1">Calm action, every time</h1></div></div>
      <p class="muted">Tap what just happened. You get the immediate response, what to teach next, and a one-tap log.</p>
    </section>
    <section class="respond-grid">
      ${raw(RESPONSES.map((r) => `<button class="rbtn ${r.severity === 'high' ? 'rbtn-high' : ''}" data-kind="${r.id}">
        <span class="rbtn-label">${esc(r.label)}</span>
        <span class="rbtn-meta">${counts[r.id] ? `<b>${counts[r.id]}</b> today` : ''}${week[r.id] ? `<span class="muted"> · ${week[r.id]} this week</span>` : ''}</span>
        ${icon('chevron')}
      </button>`).join(''))}
    </section>
    <section class="card danger-card">
      <div class="eyebrow danger">Never</div><p>${RESPONSE_RULES.never}</p>
    </section>
    <section class="card"><div class="eyebrow">Play biting</div><p>${RESPONSE_RULES.biting}</p></section>
    <section class="card accent-card">
      <div class="eyebrow">Caregiver reset</div><p>${RESPONSE_RULES.reset}</p>
      <button class="btn btn-ghost btn-block" data-act="handoff">Hand off to the other adult ${raw(icon('chevron'))}</button>
    </section>
    <section class="card">
      <div class="card-head"><div class="eyebrow">Arrange help promptly</div><button class="link" data-act="contacts">Contacts ${raw(icon('chevron'))}</button></div>
      <p>${HELP.when}</p>
      <div class="kv"><span class="k">Separate and call</span><span>${HELP.urgent}</span></div>
      <div class="kv"><span class="k">Vet advice</span><span>${HELP.medical}</span></div>
      <div class="kv danger-text"><span class="k">Emergency</span><span>${HELP.emergency}</span></div>
    </section>
    ${today.length ? html`<section class="card"><div class="card-head"><div class="eyebrow">Incidents today</div><span class="muted small">${today.length}</span></div>
      <ul class="feed compact">${raw(today.slice().reverse().map((e) => { const r = RESPONSES.find((x) => x.id === e.kind); return `<li class="danger"><span class="ft">${fmtTime(e.ts)}</span><span class="fx">${esc(r ? r.short : e.kind)}${e.reached ? ' · reached cat' : ''}${e.context ? ` · ${esc(e.context)}` : ''}${e.note ? ` · ${esc(e.note)}` : ''}</span><span class="fc muted">${esc(e.cg || '')}</span></li>`; }).join(''))}</ul>
      <p class="fine">Counts are for spotting patterns, not grading the puppy or caregiver. Fewer incidents because barriers prevented access are a management win.</p></section>` : ''}
  `.toString();
  root.querySelectorAll('[data-kind]').forEach((b) => b.addEventListener('click', () => incidentSheet(b.getAttribute('data-kind'))));
  bind(root, {
    handoff: () => {
      const s = getState();
      const other = s.settings.caregivers.find((c) => c !== s.settings.activeCaregiver) || s.settings.caregivers[0];
      openSheet(`<p class="lead">Check his needs, place him comfortably in the safe area, and hand off to ${esc(other)}.</p>
        <div class="kv"><span class="k">Say</span><span>Last potty, last meal and remaining ration, last sleep, medication due, current pet separation.</span></div>
        <button class="btn btn-primary btn-block" data-act="go">Open handoff card</button>`, { title: 'Caregiver reset', onOpen: (b) => bind(b, { go: () => { nav('today'); } }) });
    },
    contacts: () => nav('review', { tab: 'setup' }),
  });
}
