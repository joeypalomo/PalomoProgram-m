import { html, raw, esc, bind, icon, haptic, toast } from '../ui.js';
import {
  getState, dateKey, fmtTime, fmtAgo, fmtClock, fmtDuration, fmtLongDate, programDay, ageWeeks, planForDay, currentPhase,
  pendingReviewDay, shiftedSchedule, currentBlock, nextBlock, pottyStatus, sleepStatus, mealsLogged, nextMealNumber,
  daySummary, setDayField, eventsForDay, removeEvent, restoreEvent, minutesNow,
} from '../store.js';
import { PREP_ITEMS, HANDOFF_CHECKS, SCHEDULE_NOTES, SOCIAL, skillById, RESPONSES } from '../data/guide.js';
import { pottySheet, mealSheet, toggleSleep, logDrink, aloneSheet, noteSheet, lessonSheet, petSheet, incidentSheet, socialSheet, handlingSheet } from '../sheets.js';

const KIND_ICON = { potty: 'potty', meal: 'meal', play: 'paw', rest: 'sleep', lesson: 'lesson', calm: 'calm', night: 'sleep' };

function eventLine(e) {
  switch (e.type) {
    case 'potty': {
      const label = { pee: 'Pee', poop: 'Poop', both: 'Pee + poop', nothing: 'Dry trip', accident: 'Accident' }[e.result] || 'Potty';
      return { icon: 'potty', text: `${label}${e.stool === 'abnormal' ? ' · loose stool' : ''}${e.overnight ? ' · overnight' : ''}`, tone: e.result === 'accident' ? 'warn' : '' };
    }
    case 'meal': return { icon: 'meal', text: `Meal ${e.meal}${e.appetite && e.appetite !== 'ate' ? ` · ${e.appetite}` : ''}` };
    case 'drink': return { icon: 'drop', text: 'Big drink' };
    case 'sleep': return { icon: 'sleep', text: e.action === 'start' ? 'Rest started' : 'Woke up' };
    case 'lesson': { const k = skillById(e.skill); return { icon: 'lesson', text: `${k ? k.name : e.skill}: ${e.successes}/${e.attempts}${e.lured ? ' (lured)' : ''} · L${e.level || 1}` }; }
    case 'incident': { const r = RESPONSES.find((x) => x.id === e.kind); return { icon: 'alert', text: `${r ? r.short : e.kind}${e.reached ? ' · reached cat' : ''}${e.note ? ` · ${e.note}` : ''}`, tone: 'danger' }; }
    case 'pet': return { icon: e.kind === 'cat' ? 'cat' : 'dog', text: `${e.animal[0].toUpperCase() + e.animal.slice(1)} · ${e.distance} · ${e.body}${e.redFlag ? ` · ${e.redFlag}` : ''}`, tone: e.redFlag ? 'warn' : '' };
    case 'alone': return { icon: 'clock', text: `Alone step ${e.step} · ${e.seconds}s · ${e.comfort}` };
    case 'social': return { icon: 'social', text: `${e.exposure || 'Experience'} · ${e.response}` };
    case 'handling': return { icon: 'hand', text: `Handling: ${e.area} · ${e.comfort}` };
    case 'note': return { icon: 'note', text: e.note || e.text };
    default: return { icon: 'note', text: e.type };
  }
}

export function renderToday(root, nav) {
  const s = getState();
  const now = new Date();
  const key = dateKey(now);
  const day = programDay(now);
  const age = ageWeeks(now);
  const plan = planForDay(day);
  const phase = currentPhase(day);
  const review = pendingReviewDay(day);
  const block = currentBlock(now);
  const next = nextBlock(now);
  const potty = pottyStatus();
  const sleep = sleepStatus();
  const meals = mealsLogged(key);
  const nextMeal = nextMealNumber(key);
  const sum = daySummary(key);
  const evs = eventsForDay(key).slice().reverse();
  const blockChecks = (s.days[key]?.blocks || {})[block.id] || {};
  const prepDone = PREP_ITEMS.filter((p) => sum.prep[p.id]).length;
  const hour = now.getHours();
  const showPrep = prepDone < PREP_ITEMS.length || hour < 12;
  const socialDay = SOCIAL.rotation[(day - 1 + 7000) % 7];
  const lessonsToday = sum.lessons.length;
  const awakeSince = !sleep.asleep && sleep.since ? sleep.since : null;

  root.innerHTML = html`
    <section class="hero">
      <div class="hero-top">
        <div>
          <div class="eyebrow">${fmtLongDate(now)}</div>
          <h1 class="h1">Day ${day} <span class="muted">· ${age.weeks}w ${age.days}d</span></h1>
        </div>
        <div class="phase-pill">${phase.label}</div>
      </div>
      ${review ? html`<button class="banner banner-accent" data-act="review">${raw(icon('review'))}<div><b>Weekly review due</b><span>Day ${review} check-in: eight questions, one decision.</span></div>${raw(icon('chevron'))}</button>` : ''}
    </section>

    <section class="status-grid">
      <button class="tile ${potty.due ? 'tile-due' : ''} ${potty.asleep ? 'tile-quiet' : ''}" data-act="potty">
        <div class="tile-head">${raw(icon('potty'))}<span>Potty</span></div>
        <div class="tile-main">${potty.asleep ? 'Asleep' : potty.due ? 'Due now' : fmtTime(potty.dueAt)}</div>
        <div class="tile-sub">${potty.lastPotty ? `Last ${fmtAgo(potty.lastPotty.ts)}` : 'None logged'}${potty.reasons && potty.reasons.length && !potty.asleep ? ` · ${potty.reasons[0]}` : ''}</div>
      </button>
      <button class="tile ${sleep.asleep ? 'tile-sleep' : ''}" data-act="sleep">
        <div class="tile-head">${raw(icon('sleep'))}<span>${sleep.asleep ? 'Resting' : 'Awake'}</span></div>
        <div class="tile-main">${sleep.asleep ? fmtDuration(Date.now() - sleep.since) : awakeSince ? fmtDuration(Date.now() - awakeSince) : '—'}</div>
        <div class="tile-sub">${sleep.asleep ? 'Tap when he wakes' : awakeSince ? 'awake · tap to start rest' : 'Tap to start rest'} · ${sum.sleepMin}m slept today</div>
      </button>
      <button class="tile" data-act="meal">
        <div class="tile-head">${raw(icon('meal'))}<span>Meals</span></div>
        <div class="tile-main">${meals.length}<span class="muted">/${s.settings.mealsPerDay}</span></div>
        <div class="tile-sub">${nextMeal ? `Next: meal ${nextMeal}` : 'All meals done'}</div>
      </button>
      <button class="tile" data-act="lesson">
        <div class="tile-head">${raw(icon('lesson'))}<span>Lessons</span></div>
        <div class="tile-main">${lessonsToday}<span class="muted">/3-5</span></div>
        <div class="tile-sub">${lessonsToday >= 5 ? 'Dose reached. Rest wins.' : lessonsToday >= 3 ? 'In range' : 'Tiny, 1-3 min each'}</div>
      </button>
    </section>

    <section class="card now-card">
      <div class="card-head">
        <div class="eyebrow">Now · ${fmtClock(block.start)} to ${fmtClock(block.end)}</div>
        <div class="muted small">Next: ${next.title} at ${fmtClock(next.start)}</div>
      </div>
      <h2 class="h2">${raw(icon(KIND_ICON[block.kind] || 'clock'))} ${block.title}</h2>
      <ul class="checklist">
        ${raw(block.tasks.map((t, i) => `<li><label class="check ${blockChecks[i] ? 'done' : ''}"><input type="checkbox" data-block-task="${i}" ${blockChecks[i] ? 'checked' : ''}><span>${esc(t)}</span></label></li>`).join(''))}
      </ul>
      <p class="fine">${SCHEDULE_NOTES.overrides}</p>
    </section>

    <section class="quick">
      <div class="eyebrow">Quick log</div>
      <div class="quick-grid">
        <button class="qbtn" data-act="potty">${raw(icon('potty'))}<span>Potty</span></button>
        <button class="qbtn" data-act="meal">${raw(icon('meal'))}<span>Meal</span></button>
        <button class="qbtn" data-act="drink">${raw(icon('drop'))}<span>Big drink</span></button>
        <button class="qbtn" data-act="sleep">${raw(icon('sleep'))}<span>${sleep.asleep ? 'Woke up' : 'Rest'}</span></button>
        <button class="qbtn" data-act="lesson">${raw(icon('lesson'))}<span>Lesson</span></button>
        <button class="qbtn qbtn-danger" data-act="incident">${raw(icon('alert'))}<span>Incident</span></button>
        <button class="qbtn" data-act="pet">${raw(icon('pets'))}<span>Pet obs.</span></button>
        <button class="qbtn" data-act="alone">${raw(icon('clock'))}<span>Alone</span></button>
        <button class="qbtn" data-act="handling">${raw(icon('hand'))}<span>Handling</span></button>
        <button class="qbtn" data-act="social">${raw(icon('social'))}<span>Experience</span></button>
        <button class="qbtn" data-act="note">${raw(icon('note'))}<span>Note</span></button>
      </div>
    </section>

    ${plan ? html`
    <section class="card">
      <div class="card-head"><div class="eyebrow">Today's focus · Day ${plan.day} of 14</div><button class="link" data-act="train">Open Train ${raw(icon('chevron'))}</button></div>
      <p class="lead">${plan.focus}</p>
      <div class="kv"><span class="k">Counts as progress</span><span>${plan.progress}</span></div>
      <div class="chips static">${raw(plan.skills.map((id) => { const k = skillById(id); return `<button class="chip" data-act="skill" data-skill="${id}">${id} · ${esc(k.name)}</button>`; }).join(''))}</div>
    </section>` : html`
    <section class="card">
      <div class="card-head"><div class="eyebrow">${phase.label} · ${phase.age}</div><button class="link" data-act="train">Open Train ${raw(icon('chevron'))}</button></div>
      <p class="lead">${phase.focus}</p>
    </section>`}

    <section class="card">
      <div class="card-head"><div class="eyebrow">Today's experience · rotation day ${socialDay.day}</div><button class="link" data-act="socialToday">Log it ${raw(icon('chevron'))}</button></div>
      <div class="kv"><span class="k">Exposure</span><span>${socialDay.exposure}</span></div>
      <div class="kv"><span class="k">Enrichment</span><span>${socialDay.enrichment}</span></div>
    </section>

    ${showPrep ? html`
    <section class="card">
      <div class="card-head"><div class="eyebrow">Morning preparation</div><span class="muted small">${prepDone}/${PREP_ITEMS.length}</span></div>
      <ul class="checklist">
        ${raw(PREP_ITEMS.map((p) => `<li><label class="check ${sum.prep[p.id] ? 'done' : ''}"><input type="checkbox" data-prep="${p.id}" ${sum.prep[p.id] ? 'checked' : ''}><span>${esc(p.label)}</span></label></li>`).join(''))}
      </ul>
    </section>` : ''}

    <section class="card">
      <div class="card-head"><div class="eyebrow">Run of show</div><span class="muted small">${s.settings.wakeShiftMin ? `shifted ${s.settings.wakeShiftMin > 0 ? '+' : ''}${s.settings.wakeShiftMin}m` : 'default clock'}</span></div>
      <ol class="timeline">
        ${raw(shiftedSchedule().map((b) => `<li class="${b.id === block.id ? 'current' : b.end <= minutesNow(now) && b.end <= 1440 ? 'past' : ''}"><span class="t">${fmtClock(b.start)}</span><span class="ic-wrap">${icon(KIND_ICON[b.kind] || 'clock')}</span><span class="tt">${esc(b.title)}</span></li>`).join(''))}
      </ol>
    </section>

    <section class="card handoff">
      <div class="card-head"><div class="eyebrow">Handoff card</div><span class="muted small">auto from today's log</span></div>
      <div class="kv"><span class="k">Last potty</span><span>${potty.lastPotty ? `${fmtTime(potty.lastPotty.ts)} · ${eventLine(potty.lastPotty).text}` : 'none'}</span></div>
      <div class="kv"><span class="k">Last meal</span><span>${meals.length ? `Meal ${meals[meals.length - 1]} · ${fmtTime(lastOf(evs, 'meal').ts)}` : 'none'} · ${nextMeal ? `${s.settings.mealsPerDay - meals.length} left` : 'ration done'}</span></div>
      <div class="kv"><span class="k">Sleep</span><span>${sleep.asleep ? `Resting since ${fmtTime(sleep.since)}` : sleep.since ? `Awake since ${fmtTime(sleep.since)}` : 'not tracked yet'} · ${sum.sleepMin}m today</span></div>
      <div class="kv"><span class="k">Medication</span><span>${s.setup.nextDose || 'no dose recorded'}</span></div>
      <div class="kv"><span class="k">Pets</span><span>${sum.incidents.filter((e) => e.kind === 'cat-rush').length} cat rushes · ${sum.pets.length} observations today</span></div>
      <div class="field"><div class="label">Best useful change today</div><input class="input" data-day="best" value="${sum.handoff.best || ''}" placeholder="One line"></div>
      <div class="field"><div class="label">Make easier tomorrow</div><input class="input" data-day="easier" value="${sum.handoff.easier || ''}" placeholder="One line"></div>
      <div class="field"><div class="label">Remaining food, next medicine, next likely potty</div><input class="input" data-day="remaining" value="${sum.handoff.remaining || ''}" placeholder="One line"></div>
      <div class="field"><div class="label">Play minutes today (for the bite rate)</div><input class="input" type="number" inputmode="numeric" data-day="playMinutes" value="${sum.playMinutes || ''}" placeholder="approx minutes of interactive play"></div>
      <ul class="checklist">
        ${raw(HANDOFF_CHECKS.map((p) => `<li><label class="check ${sum.handoff[p.id] ? 'done' : ''}"><input type="checkbox" data-handoff="${p.id}" ${sum.handoff[p.id] ? 'checked' : ''}><span>${esc(p.label)}</span></label></li>`).join(''))}
      </ul>
    </section>

    <section class="card">
      <div class="card-head"><div class="eyebrow">Today's log</div><span class="muted small">${evs.length} entries</span></div>
      ${evs.length ? raw(`<ul class="feed">${evs.map((e) => { const l = eventLine(e); return `<li class="${l.tone || ''}"><span class="ft">${fmtTime(e.ts)}</span>${icon(l.icon)}<span class="fx">${esc(l.text)}</span><span class="fc muted">${esc(e.cg || '')}</span><button class="fdel" data-del="${e.id}" aria-label="Delete">${icon('x')}</button></li>`; }).join('')}</ul>`) : html`<p class="muted">Nothing logged yet. Start with the wake-up potty trip.</p>`}
    </section>
  `.toString();

  bind(root, {
    potty: () => pottySheet(),
    meal: () => mealSheet(),
    drink: () => logDrink(),
    sleep: () => toggleSleep(),
    lesson: () => lessonSheet(plan ? plan.skills[0] : 'A'),
    incident: () => nav('respond'),
    pet: () => petSheet('charlie'),
    alone: () => aloneSheet(),
    handling: () => handlingSheet(),
    social: () => socialSheet(),
    socialToday: () => socialSheet(socialDay.exposure, socialDay.enrichment),
    note: () => noteSheet(),
    review: () => nav('review', { tab: 'weekly' }),
    train: () => nav('train'),
    skill: (el) => nav('train', { skill: el.getAttribute('data-skill') }),
  });
  root.querySelectorAll('[data-block-task]').forEach((cb) => cb.addEventListener('change', () => {
    haptic(6);
    setDayField(key, ['blocks', block.id, cb.getAttribute('data-block-task')], cb.checked);
  }));
  root.querySelectorAll('[data-prep]').forEach((cb) => cb.addEventListener('change', () => {
    haptic(6);
    setDayField(key, ['prep', cb.getAttribute('data-prep')], cb.checked);
  }));
  root.querySelectorAll('[data-handoff]').forEach((cb) => cb.addEventListener('change', () => {
    haptic(6);
    setDayField(key, ['handoff', cb.getAttribute('data-handoff')], cb.checked);
  }));
  root.querySelectorAll('[data-day]').forEach((inp) => inp.addEventListener('change', () => {
    const f = inp.getAttribute('data-day');
    if (f === 'playMinutes') setDayField(key, 'playMinutes', Number(inp.value) || 0);
    else setDayField(key, ['handoff', f], inp.value);
  }));
  root.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', () => {
    const id = b.getAttribute('data-del');
    const ev = s.events.find((e) => e.id === id);
    removeEvent(id);
    toast('Entry removed.', { action: 'Undo', onAction: () => { if (ev) restoreEvent(ev); } });
  }));
}

function lastOf(evsDesc, type) {
  return evsDesc.find((e) => e.type === type) || { ts: Date.now() };
}
