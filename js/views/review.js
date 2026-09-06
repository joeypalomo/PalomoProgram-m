import { html, raw, esc, bind, icon, openSheet, closeSheet, toast, haptic, segmented, segValue, wireSegments } from '../ui.js';
import { getState, update, dateKey, parseDateKey, programDay, daySummary, fmtTime, exportJSON, importJSON, mergeJSON, resetAll, pendingReviewDay, ageWeeks, skillState, separationCheck, eventsForDay } from '../store.js';
import { WEEKLY_QUESTIONS, WEEKLY_DECISIONS, REVIEW_DAYS, NOT_INFER, SUCCESS, KEEP_CHANGE, CARE, EVIDENCE, HELP, SETUP_FIELDS, SKILLS, skillById, RESPONSES } from '../data/guide.js';

const REVIEW_TABS = [
  { id: 'log', label: 'Log' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'guide', label: 'Guide' },
  { id: 'setup', label: 'Setup' },
  { id: 'data', label: 'Data' },
];

export function renderReview(root, nav, params = {}) {
  const tab = params.tab || 'log';
  root.innerHTML = html`
    <section class="hero"><div class="hero-top"><div><div class="eyebrow">Review</div><h1 class="h1">Patterns, not grades</h1></div></div></section>
    <nav class="subtabs">${raw(REVIEW_TABS.map((t) => `<button class="subtab ${t.id === tab ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`).join(''))}</nav>
    <div id="reviewBody"></div>
  `.toString();
  root.querySelectorAll('.subtab').forEach((b) => b.addEventListener('click', () => { haptic(6); nav('review', { tab: b.getAttribute('data-tab') }); }));
  const body = root.querySelector('#reviewBody');
  ({ log: renderLog, weekly: renderWeekly, guide: renderGuide, setup: renderSetup, data: renderData }[tab] || renderLog)(body, nav, params);
}

// ---------- Log ----------
function dayKeys(n = 14) {
  const keys = [];
  const d = new Date();
  for (let i = 0; i < n; i++) {
    keys.push(dateKey(d));
    d.setDate(d.getDate() - 1);
  }
  return keys;
}

function dayNumber(key) {
  const start = parseDateKey(getState().settings.programStart);
  return Math.floor((parseDateKey(key) - start) / 86400000) + 1;
}

function summaryCard(key, open) {
  const s = daySummary(key);
  const d = parseDateKey(key);
  const start = parseDateKey(getState().settings.programStart);
  const dayN = Math.floor((d - start) / 86400000) + 1;
  const lessonsText = s.lessons.map((l) => `${l.skill} ${l.successes}/${l.attempts}`).join(', ');
  const hasData = s.pottySuccess || s.accidents || s.lessons.length || s.bites || s.pets.length || s.sleepMin || s.alone.length || s.incidents.length;
  return `
    <section class="card daylog ${open ? 'open' : ''}" data-day="${key}">
      <div class="card-head" data-toggle="${key}">
        <div><div class="eyebrow">${d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · Day ${dayN}</div>
        <div class="muted small">${hasData ? `${s.pottySuccess} potty · ${s.accidents} accidents · ${s.lessons.length} lessons · ${s.bites} bites` : 'no entries'}</div></div>
        ${icon('chevron', open ? 'rot' : '')}
      </div>
      <div class="daylog-body" ${open ? '' : 'hidden'}>
        <div class="stat-grid">
          <div><b>${s.pottySuccess}</b><span>outdoor potty</span></div>
          <div class="${s.accidents ? 'warn' : ''}"><b>${s.accidents}</b><span>accidents</span></div>
          <div class="${s.stoolsAbnormal ? 'warn' : ''}"><b>${s.stoolsLogged ? (s.stoolsAbnormal ? 'No' : 'Yes') : '—'}</b><span>stools normal</span></div>
          <div><b>${Math.floor(s.sleepMin / 60)}h ${s.sleepMin % 60}m</b><span>sleep (logged)</span></div>
          <div><b>${s.overnightWakes.length}</b><span>overnight trips</span></div>
          <div class="${s.bites ? 'warn' : ''}"><b>${s.bites}</b><span>bites${s.playMinutes ? ` / ${s.playMinutes}m play` : ''}</span></div>
          <div class="${s.catRushReached ? 'danger' : ''}"><b>${s.catRushes}</b><span>cat rushes${s.catRushReached ? ` (${s.catRushReached} reached)` : ''}</span></div>
          <div><b>${s.bestAlone ? s.bestAlone.seconds + 's' : '—'}</b><span>alone${s.bestAlone ? ` · step ${s.bestAlone.step} · ${s.bestAlone.distance}` : ''}</span></div>
          <div><b>${s.meals.length}</b><span>meals</span></div>
          <div><b>${s.maisieChoice ? esc(s.maisieChoice) : '—'}</b><span>Maisie chose</span></div>
        </div>
        ${s.lessons.length ? `<div class="kv"><span class="k">Lessons</span><span>${esc(lessonsText)}</span></div>` : ''}
        ${s.pets.length ? `<div class="kv"><span class="k">Pet observations</span><span>${s.pets.map((p) => `${p.animal} (${p.distance}, ${p.body}${p.redFlag ? ', ' + p.redFlag : ''})`).join('; ')}</span></div>` : ''}
        ${s.social.length ? `<div class="kv"><span class="k">Experiences</span><span>${s.social.map((p) => `${esc(p.exposure)} · ${p.response}`).join('; ')}</span></div>` : ''}
        ${s.handoff.best ? `<div class="kv"><span class="k">Best change</span><span>${esc(s.handoff.best)}</span></div>` : ''}
        ${s.handoff.easier ? `<div class="kv"><span class="k">Easier tomorrow</span><span>${esc(s.handoff.easier)}</span></div>` : ''}
        ${s.incidents.filter((e) => e.note).length ? `<div class="kv"><span class="k">Incident notes</span><span>${s.incidents.filter((e) => e.note).map((e) => esc(e.note)).join('; ')}</span></div>` : ''}
        ${eventsForDay(key).filter((e) => e.type === 'note').map((e) => `<div class="kv"><span class="k">${fmtTime(e.ts)}</span><span>${esc(e.text)}</span></div>`).join('')}
      </div>
    </section>`;
}

function renderLog(root) {
  const keys = dayKeys(14);
  const s = getState();
  // 7-day trend numbers
  const last7 = keys.slice(0, 7).map(daySummary);
  const prev7 = dayKeys(14).slice(7).map(daySummary);
  const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);
  const trend = (a, b) => (b === 0 && a === 0 ? '' : a < b ? '↓' : a > b ? '↑' : '→');
  const acc7 = sum(last7, (x) => x.accidents), accP = sum(prev7, (x) => x.accidents);
  const bite7 = sum(last7, (x) => x.bites), biteP = sum(prev7, (x) => x.bites);
  const rush7 = sum(last7, (x) => x.catRushes), rushP = sum(prev7, (x) => x.catRushes);
  const les7 = sum(last7, (x) => x.lessons.length);
  const potty7 = sum(last7, (x) => x.pottySuccess);
  root.innerHTML = html`
    <section class="card">
      <div class="card-head"><div class="eyebrow">Last 7 days vs previous 7</div></div>
      <div class="stat-grid">
        <div><b>${potty7}</b><span>outdoor potty</span></div>
        <div class="${acc7 > accP ? 'warn' : ''}"><b>${acc7} <small>${trend(acc7, accP)}</small></b><span>accidents (was ${accP})</span></div>
        <div class="${bite7 > biteP ? 'warn' : ''}"><b>${bite7} <small>${trend(bite7, biteP)}</small></b><span>bites (was ${biteP})</span></div>
        <div class="${rush7 > rushP ? 'warn' : ''}"><b>${rush7} <small>${trend(rush7, rushP)}</small></b><span>cat rushes (was ${rushP})</span></div>
        <div><b>${les7}</b><span>lessons</span></div>
        <div><b>${Object.keys(s.skills).filter((k) => (s.skills[k].level || 1) > 1).length}</b><span>skills advanced</span></div>
      </div>
      <p class="fine">Fewer incidents because barriers prevented access are a management win; they are not proof of a changed impulse. Never create a risky test to gather data.</p>
    </section>
    ${raw(keys.filter((k, i) => i === 0 || dayNumber(k) >= 1 || eventsForDay(k).length).map((k, i) => summaryCard(k, i === 0)).join(''))}
  `.toString();
  root.querySelectorAll('[data-toggle]').forEach((h) => h.addEventListener('click', () => {
    const card = h.closest('.daylog');
    const body = card.querySelector('.daylog-body');
    body.hidden = !body.hidden;
    card.classList.toggle('open', !body.hidden);
    h.querySelector('.ic').classList.toggle('rot', !body.hidden);
  }));
}

// ---------- Weekly ----------
function renderWeekly(root, nav, params) {
  const s = getState();
  const day = programDay();
  const pending = pendingReviewDay(day);
  const selected = Number(params.day) || pending || REVIEW_DAYS.filter((r) => r <= day).pop() || 7;
  const rec = s.weekly[selected] || { answers: {}, priorities: ['', ''] };
  const skillsAdvanced = SKILLS.filter((k) => skillState(k.id).level > 1).map((k) => `${k.id} L${skillState(k.id).level}`).join(', ') || 'none yet';
  const sep = separationCheck();
  // Auto facts for the week ending on the selected day
  const start = parseDateKey(s.settings.programStart);
  const weekKeys = [];
  for (let i = selected - 6; i <= selected; i++) { const d = new Date(start); d.setDate(d.getDate() + i - 1); weekKeys.push(dateKey(d)); }
  const ws = weekKeys.map(daySummary);
  const sum = (f) => ws.reduce((a, x) => a + f(x), 0);
  root.innerHTML = html`
    <section class="card">
      <div class="card-head"><div class="eyebrow">Review on days 7, 14, 21, 28, 35 and 42</div><span class="muted small">today is day ${day}</span></div>
      <div class="chips">${raw(REVIEW_DAYS.map((r) => `<button class="chip ${r === selected ? 'active' : ''} ${s.weekly[r]?.completed ? 'chip-done' : ''} ${r > day ? 'chip-future' : ''}" data-rday="${r}">Day ${r}${s.weekly[r]?.completed ? ' ✓' : ''}</button>`).join(''))}</div>
      ${pending && pending === selected ? html`<div class="banner banner-accent static">${raw(icon('review'))}<div><b>Due now</b><span>Answer from the log, pick one decision, set two priorities.</span></div></div>` : ''}
    </section>
    <section class="card">
      <div class="eyebrow">What the log says for days ${Math.max(1, selected - 6)}-${selected}</div>
      <div class="stat-grid">
        <div><b>${sum((x) => x.pottySuccess)}</b><span>outdoor potty</span></div>
        <div><b>${sum((x) => x.accidents)}</b><span>accidents</span></div>
        <div><b>${sum((x) => x.bites)}</b><span>bites</span></div>
        <div><b>${sum((x) => x.catRushes)}</b><span>cat rushes</span></div>
        <div><b>${sum((x) => x.lessons.length)}</b><span>lessons</span></div>
        <div><b>${sum((x) => x.pets.length)}</b><span>pet observations</span></div>
      </div>
      <div class="kv"><span class="k">Skills advanced</span><span>${skillsAdvanced}</span></div>
      <div class="kv"><span class="k">Separation</span><span>step ${sep.step} · best ${sep.best}s</span></div>
    </section>
    <section class="card" id="weeklyForm">
      <div class="eyebrow">Eight questions</div>
      ${raw(WEEKLY_QUESTIONS.map((q) => `<div class="field"><div class="label">${esc(q.q)}</div><textarea class="input" rows="2" data-q="${q.id}" placeholder="This week's observation">${esc(rec.answers[q.id] || '')}</textarea></div>`).join(''))}
      <div class="field"><div class="label">Decision</div>
        ${raw(segmented('decision', WEEKLY_DECISIONS.map((d) => ({ value: d.id, label: d.label })), rec.decision || 'repeat'))}
        <div class="hint" id="decisionHint">${WEEKLY_DECISIONS.find((d) => d.id === (rec.decision || 'repeat')).text}</div>
      </div>
      <div class="field"><div class="label">Next week's two training priorities</div>
        <input class="input" data-p="0" value="${(rec.priorities || [])[0] || ''}" placeholder="1.">
        <input class="input" data-p="1" value="${(rec.priorities || [])[1] || ''}" placeholder="2." style="margin-top:8px">
      </div>
      <div class="field"><div class="label">One change to home setup</div><input class="input" data-f="setupChange" value="${rec.setupChange || ''}"></div>
      <div class="field"><div class="label">Professional help to arrange, if needed</div><input class="input" data-f="help" value="${rec.help || ''}"></div>
      <button class="btn btn-primary btn-block" data-act="complete">${raw(icon('check'))} ${rec.completed ? 'Update review' : 'Complete day ' + selected + ' review'}</button>
      ${rec.completed ? html`<p class="muted small center">Completed ${fmtTime(rec.ts)} on ${dateKey(new Date(rec.ts))}</p>` : ''}
    </section>
    <section class="card"><div class="eyebrow">What not to infer</div><p>${NOT_INFER}</p><p class="fine">If the household cannot safely meet all animals' needs, discuss support and responsible placement with the vet, trainer and breeder. That decision does not require labeling the puppy bad.</p></section>
  `.toString();
  root.querySelectorAll('[data-rday]').forEach((b) => b.addEventListener('click', () => nav('review', { tab: 'weekly', day: b.getAttribute('data-rday') })));
  wireSegments(root, (n, v) => { root.querySelector('#decisionHint').textContent = WEEKLY_DECISIONS.find((d) => d.id === v).text; });
  const save = (completed) => {
    const answers = {};
    root.querySelectorAll('[data-q]').forEach((t) => { answers[t.getAttribute('data-q')] = t.value; });
    update((st) => {
      const prev = st.weekly[selected] || {};
      st.weekly[selected] = {
        ...prev, answers,
        decision: segValue(root, 'decision'),
        priorities: [root.querySelector('[data-p="0"]').value, root.querySelector('[data-p="1"]').value],
        setupChange: root.querySelector('[data-f="setupChange"]').value,
        help: root.querySelector('[data-f="help"]').value,
        completed: completed || prev.completed || false,
        ts: completed ? Date.now() : prev.ts,
      };
    });
  };
  root.querySelectorAll('#weeklyForm textarea, #weeklyForm input').forEach((el) => el.addEventListener('change', () => save(false)));
  bind(root, { complete: () => { save(true); toast(`Day ${selected} review saved.`); nav('review', { tab: 'weekly', day: selected }); } });
}

// ---------- Guide library ----------
function renderGuide(root) {
  const sections = [
    { id: 'success', title: 'What success means', body: `<p>${esc(SUCCESS.body)}</p><ol class="steps">${SUCCESS.priorities.map((p) => `<li>${esc(p)}</li>`).join('')}</ol><p class="fine">${esc(SUCCESS.caution)}</p>` },
    { id: 'keep', title: 'Keep the foundation; change these details', body: `<table class="kc"><tr><th>Keep</th><th>Change now</th></tr>${KEEP_CHANGE.rows.map((r) => `<tr><td>${esc(r.keep)}</td><td>${esc(r.change)}</td></tr>`).join('')}</table>` },
    { id: 'food', title: 'Food: measure the day, then divide it', body: `<p>${esc(CARE.food.text)}</p><p>${esc(CARE.food.split)}</p><p>${esc(CARE.food.treats)}</p><p class="fine">${esc(CARE.food.fast)}</p>` },
    { id: 'water', title: 'Water: fix the spill, preserve access', body: `<p>${esc(CARE.water.text)}</p>` },
    { id: 'potty', title: 'Potty: use events as well as reminders', body: `<p>${esc(CARE.potty.when)}</p><p>${esc(CARE.potty.how)}</p><p class="fine">${esc(CARE.potty.accident)}</p>` },
    { id: 'home', title: 'Prepare the home', body: `${CARE.home.spaces.map((s) => `<div class="kv"><span class="k">${esc(s.name)}</span><span>${esc(s.text)}</span></div>`).join('')}<div class="eyebrow" style="margin-top:12px">Equipment you actually need</div><ul class="bullets">${CARE.home.equipment.map((e) => `<li>${esc(e)}</li>`).join('')}</ul><p class="fine">${esc(CARE.home.equipmentNote)}</p>` },
    { id: 'poop', title: 'Poop cleanup: a short, repeatable sequence', body: `<ol class="steps">${CARE.home.poop.map((p) => `<li>${esc(p)}</li>`).join('')}</ol><p class="fine">${esc(CARE.home.poopNote)}</p>` },
    { id: 'help', title: 'When to seek help', body: `<p>${esc(HELP.when)}</p><p>${esc(HELP.urgent)}</p><p>${esc(HELP.medical)}</p><p class="danger-text">${esc(HELP.emergency)}</p><p class="fine">${esc(HELP.handoff)}</p>` },
    { id: 'evidence', title: 'Evidence notes and limits', body: `<ul class="bullets">${EVIDENCE.supports.map((e) => `<li>${esc(e)}</li>`).join('')}</ul><p class="fine">${esc(EVIDENCE.limits)}</p>` },
  ];
  root.innerHTML = sections.map((s) => `<section class="card acc"><button class="acc-head" data-acc="${s.id}"><span>${esc(s.title)}</span>${icon('chevron')}</button><div class="acc-body" hidden>${s.body}</div></section>`).join('');
  root.querySelectorAll('[data-acc]').forEach((h) => h.addEventListener('click', () => {
    const b = h.nextElementSibling;
    b.hidden = !b.hidden;
    h.querySelector('.ic').classList.toggle('rot', !b.hidden);
  }));
}

// ---------- Setup & settings ----------
function renderSetup(root, nav) {
  const s = getState();
  root.innerHTML = html`
    <section class="card">
      <div class="eyebrow">Program</div>
      <div class="field"><div class="label">Puppy's name</div><input class="input" data-set="dogName" value="${s.settings.dogName}"></div>
      <div class="two">
        <div class="field"><div class="label">Birth date</div><input class="input" type="date" data-set="birthDate" value="${s.settings.birthDate}"></div>
        <div class="field"><div class="label">Program start (day 1)</div><input class="input" type="date" data-set="programStart" value="${s.settings.programStart}"></div>
      </div>
      <div class="two">
        <div class="field"><div class="label">Meals per day</div><select class="input" data-set="mealsPerDay"><option value="3" ${s.settings.mealsPerDay === 3 ? 'selected' : ''}>3</option><option value="4" ${s.settings.mealsPerDay === 4 ? 'selected' : ''}>4</option></select></div>
        <div class="field"><div class="label">Active-play potty interval (min)</div><input class="input" type="number" inputmode="numeric" data-set="pottyIntervalMin" value="${s.settings.pottyIntervalMin}"></div>
      </div>
      <div class="field"><div class="label">Shift the daily clock (minutes; negative = earlier)</div><input class="input" type="number" inputmode="numeric" data-set="wakeShiftMin" value="${s.settings.wakeShiftMin}"><div class="hint">The guide's clock starts at 7:00. Enter 30 if your household wakes at 7:30.</div></div>
      <div class="field"><div class="label">Caregivers (comma separated)</div><input class="input" data-set="caregivers" value="${s.settings.caregivers.join(', ')}"></div>
      <div class="field"><div class="label">Theme</div>${raw(segmented('theme', [{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }, { value: 'auto', label: 'System' }], s.settings.theme || 'dark'))}</div>
      <div class="row-toggle"><label class="toggle"><input type="checkbox" data-set="notifications" ${s.settings.notifications ? 'checked' : ''}><span>Potty reminders while the app is open</span></label></div>
    </section>
    ${raw(SETUP_FIELDS.map((sec) => `<section class="card"><div class="eyebrow">${esc(sec.section)}</div>${sec.fields.map((f) => `<div class="field"><div class="label">${esc(f.label)}</div><div class="input-row"><input class="input" data-setup="${f.id}" value="${esc(s.setup[f.id] || '')}">${f.tel && s.setup[f.id] ? `<a class="btn btn-ghost" href="tel:${esc(String(s.setup[f.id]).replace(/[^\d+]/g, ''))}">Call</a>` : ''}</div></div>`).join('')}</section>`).join(''))}
    <p class="fine center">Use prescribed doses only. Veterinary instructions take precedence over anything in this app.</p>
  `.toString();
  root.querySelectorAll('[data-set]').forEach((el) => el.addEventListener('change', () => {
    const k = el.getAttribute('data-set');
    update((st) => {
      if (k === 'caregivers') { st.settings.caregivers = el.value.split(',').map((x) => x.trim()).filter(Boolean); if (!st.settings.caregivers.includes(st.settings.activeCaregiver)) st.settings.activeCaregiver = st.settings.caregivers[0]; }
      else if (k === 'notifications') { st.settings.notifications = el.checked; if (el.checked && 'Notification' in window && Notification.permission === 'default') Notification.requestPermission(); }
      else if (['mealsPerDay', 'pottyIntervalMin', 'wakeShiftMin'].includes(k)) st.settings[k] = Number(el.value) || 0;
      else st.settings[k] = el.value;
    });
    toast('Saved.');
  }));
  wireSegments(root, (n, v) => { if (n === 'theme') { update((st) => { st.settings.theme = v; }); applyTheme(); } });
  root.querySelectorAll('[data-setup]').forEach((el) => el.addEventListener('change', () => { update((st) => { st.setup[el.getAttribute('data-setup')] = el.value; }); toast('Saved.'); }));
}

export function applyTheme() {
  const t = getState().settings.theme || 'dark';
  document.documentElement.setAttribute('data-theme', t === 'auto' ? '' : t);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', t === 'light' ? '#F6F4EF' : '#0B0C0F');
}

// ---------- Data ----------
function renderData(root) {
  const s = getState();
  const size = Math.round(JSON.stringify(s).length / 1024);
  root.innerHTML = html`
    <section class="card">
      <div class="eyebrow">Your data stays on this phone</div>
      <p>${s.events.length} entries · ${Object.keys(s.days).length} days · ${size} KB. Nothing leaves the device unless you export it.</p>
      <div class="btn-row"><button class="btn btn-primary" data-act="share">${raw(icon('chevron'))} Share backup</button><button class="btn btn-ghost" data-act="download">Download</button></div>
      <button class="btn btn-ghost btn-block" data-act="copy">Copy backup to clipboard</button>
    </section>
    <section class="card">
      <div class="eyebrow">Two phones, one log</div>
      <p>Each caregiver installs the app. At handoff, share a backup from one phone and merge it on the other. Merge keeps both logs; replace overwrites.</p>
      <div class="field"><textarea class="input" id="importText" rows="4" placeholder="Paste a backup here"></textarea></div>
      <div class="btn-row"><button class="btn btn-primary" data-act="merge">Merge into mine</button><button class="btn btn-ghost" data-act="replace">Replace mine</button></div>
      <label class="btn btn-ghost btn-block file-btn">Import from file<input type="file" accept="application/json,.json" id="importFile" hidden></label>
    </section>
    <section class="card danger-card">
      <div class="eyebrow danger">Reset</div>
      <p>Erase everything on this phone. Export first.</p>
      <button class="btn btn-danger btn-block" data-act="reset">Erase all data</button>
    </section>
  `.toString();
  const filename = () => `PalomoProgram-${dateKey()}.json`;
  const doImport = (text, mode) => {
    try {
      if (mode === 'merge') mergeJSON(text); else importJSON(text);
      toast(mode === 'merge' ? 'Merged.' : 'Replaced.');
      applyTheme();
    } catch (e) { toast(`Import failed: ${e.message}`, { tone: 'danger' }); }
  };
  bind(root, {
    share: async () => {
      const text = exportJSON();
      try {
        const file = new File([text], filename(), { type: 'application/json' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], title: 'PalomoProgram backup' }); return; }
        if (navigator.share) { await navigator.share({ title: 'PalomoProgram backup', text }); return; }
      } catch (e) { if (e.name === 'AbortError') return; }
      await navigator.clipboard.writeText(text);
      toast('Sharing unavailable. Copied to clipboard instead.');
    },
    download: () => {
      const blob = new Blob([exportJSON()], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename();
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    },
    copy: async () => { try { await navigator.clipboard.writeText(exportJSON()); toast('Copied.'); } catch (_) { toast('Clipboard blocked. Use Download.'); } },
    merge: () => { const t = root.querySelector('#importText').value.trim(); if (t) doImport(t, 'merge'); },
    replace: () => { const t = root.querySelector('#importText').value.trim(); if (t && confirm('Replace all data on this phone with the pasted backup?')) doImport(t, 'replace'); },
    reset: () => { if (confirm('Erase all PalomoProgram data on this phone?') && confirm('This cannot be undone. Erase?')) { resetAll(); toast('Erased.'); } },
  });
  root.querySelector('#importFile').addEventListener('change', async (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const text = await f.text();
    const mode = confirm('Merge into existing data? (Cancel replaces everything.)') ? 'merge' : 'replace';
    doImport(text, mode);
  });
}
