import { html, raw, esc, bind, icon, openSheet, closeSheet, toast, haptic } from '../ui.js';
import { getState, programDay, planForDay, currentPhase, skillState, skillSessions, progressionCheck, advanceSkill, stepBackSkill, fmtTime, dateKey, separationCheck, setSeparationStep, aloneSessions, eventsForDay } from '../store.js';
import { SKILLS, SKILL_SELECTION, LESSON_RULES, VOCABULARY, PLAN14, PLAN_NOTES, PHASES, REST, SOCIAL, TROUBLESHOOT, skillById } from '../data/guide.js';
import { lessonSheet, aloneSheet, socialSheet, handlingSheet } from '../sheets.js';

const TRAIN_TABS = [
  { id: 'plan', label: 'Plan' },
  { id: 'skills', label: 'Skills' },
  { id: 'calm', label: 'Calm & alone' },
  { id: 'world', label: 'Experiences' },
];

export function renderTrain(root, nav, params = {}) {
  const tab = params.tab || 'skills';
  root.innerHTML = html`
    <section class="hero"><div class="hero-top"><div><div class="eyebrow">Train</div><h1 class="h1">One clear action, one reward, then a break</h1></div></div></section>
    <nav class="subtabs">${raw(TRAIN_TABS.map((t) => `<button class="subtab ${t.id === tab ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`).join(''))}</nav>
    <div id="trainBody"></div>
  `.toString();
  root.querySelectorAll('.subtab').forEach((b) => b.addEventListener('click', () => { haptic(6); nav('train', { tab: b.getAttribute('data-tab') }); }));
  const body = root.querySelector('#trainBody');
  if (tab === 'plan') renderPlan(body, nav);
  else if (tab === 'skills') renderSkills(body, nav, params);
  else if (tab === 'calm') renderCalm(body, nav);
  else renderWorld(body, nav);
}

// ---------- Plan ----------
function renderPlan(root, nav) {
  const day = programDay();
  const phase = currentPhase(day);
  root.innerHTML = html`
    <section class="card">
      <div class="eyebrow">Daily dose</div>
      <p class="lead">3-5 tiny planned lessons of 1-3 minutes, plus ordinary rewards for good choices. Pet exposure and handling replace a lesson when he is tiring. Never cram missed sessions into the evening.</p>
      <div class="kv"><span class="k">Selection</span><span>${SKILL_SELECTION.rule}</span></div>
    </section>
    <section class="card">
      <div class="eyebrow">Phase now · ${phase.label} · ${phase.age}</div>
      <p class="lead">${phase.focus}</p>
      <ol class="phases">${raw(PHASES.map((p) => `<li class="${p.id === phase.id ? 'current' : day > p.to ? 'past' : ''}"><b>${esc(p.label)}</b><span class="muted">${esc(p.age)}</span><p>${esc(p.focus)}</p></li>`).join(''))}</ol>
    </section>
    <section class="card">
      <div class="card-head"><div class="eyebrow">The first 14 days</div><span class="muted small">${day >= 1 && day <= 14 ? `today is day ${day}` : day < 1 ? 'starts soon' : 'complete'}</span></div>
      <p class="fine">${PLAN_NOTES.days}</p>
      <ol class="plan14">${raw(PLAN14.map((p) => `<li class="${p.day === day ? 'current' : p.day < day ? 'past' : ''}">
        <div class="pd">${p.day}</div>
        <div class="pb"><div class="pf">${esc(p.focus)}</div><div class="pp muted">${esc(p.progress)}</div>
        <div class="chips static">${p.skills.map((id) => `<button class="chip" data-skill="${id}">${id} · ${esc(skillById(id).name)}</button>`).join('')}${p.review ? '<span class="chip chip-accent">Review day</span>' : ''}${p.separation ? `<span class="chip">Separation step ${p.separation}</span>` : ''}</div></div>
      </li>`).join(''))}</ol>
    </section>
    <section class="card">
      <div class="eyebrow">If you miss a day</div><p>${PLAN_NOTES.missed}</p>
      <div class="eyebrow" style="margin-top:12px">If progress is flat</div><p>${PLAN_NOTES.flat}</p>
    </section>
    <section class="card">
      <div class="eyebrow">Troubleshooting that saves time</div>
      <ul class="qa">${raw(TROUBLESHOOT.map((t) => `<li><b>${esc(t.problem)}</b><p>${esc(t.fix)}</p></li>`).join(''))}</ul>
    </section>
  `.toString();
  root.querySelectorAll('[data-skill]').forEach((b) => b.addEventListener('click', () => nav('train', { tab: 'skills', skill: b.getAttribute('data-skill') })));
}

// ---------- Skills ----------
function renderSkills(root, nav, params) {
  const day = programDay();
  const plan = planForDay(day);
  const today = eventsForDay().filter((e) => e.type === 'lesson');
  const groups = [
    { id: 'movement', label: 'Attention and movement', hint: 'Choose two, not all five. Practice away from the pets first.' },
    { id: 'household', label: 'Household manners', hint: 'One household skill per day. Teach access, release and calm separately.' },
    { id: 'handling', label: 'Handling', hint: 'A few seconds daily. One gentle touch per repetition.' },
  ];
  root.innerHTML = html`
    <section class="card rules">
      <div class="card-head"><div class="eyebrow">Working rules</div><button class="link" data-act="vocab">Vocabulary ${raw(icon('chevron'))}</button></div>
      <div class="rule"><b>Before</b><span>${LESSON_RULES.before}</span></div>
      <div class="rule"><b>During</b><span>${LESSON_RULES.during}</span></div>
      <div class="rule"><b>After</b><span>${LESSON_RULES.after}</span></div>
      <div class="rule accent"><b>Advance</b><span>${LESSON_RULES.progression}</span></div>
    </section>
    <div class="btn-row sticky-cta"><button class="btn btn-primary btn-block" data-act="newLesson">${raw(icon('play'))} Start a lesson</button></div>
    ${raw(groups.map((g) => `
      <div class="group-head"><div class="eyebrow">${esc(g.label)}</div><span class="muted small">${esc(g.hint)}</span></div>
      <div class="skill-list">${SKILLS.filter((k) => k.group === g.id).map((k) => skillCard(k, plan, today)).join('')}</div>
    `).join(''))}
  `.toString();
  bind(root, {
    vocab: () => openSheet(`<table class="vocab">${VOCABULARY.map((v) => `<tr><td><b>${esc(v.word)}</b></td><td>${esc(v.meaning)}</td></tr>`).join('')}</table>
      <div class="hint" style="margin-top:12px">${esc(LESSON_RULES.marker)}</div><div class="hint">${esc(LESSON_RULES.fade)}</div>`, { title: 'Household vocabulary' }),
    newLesson: () => lessonSheet(plan ? plan.skills[0] : 'A'),
  });
  root.querySelectorAll('[data-open]').forEach((el) => el.addEventListener('click', () => skillDetail(el.getAttribute('data-open'), nav)));
  root.querySelectorAll('[data-run]').forEach((el) => el.addEventListener('click', (e) => { e.stopPropagation(); lessonSheet(el.getAttribute('data-run')); }));
  if (params.skill) skillDetail(params.skill, nav);
}

function skillCard(k, plan, today) {
  const st = skillState(k.id);
  const check = progressionCheck(k.id);
  const sessions = skillSessions(k.id);
  const last = sessions[sessions.length - 1];
  const todayN = today.filter((e) => e.skill === k.id).length;
  const planned = plan && plan.skills.includes(k.id);
  const pct = Math.round(((st.level - 1) / k.levels.length) * 100);
  return `
    <div class="skill ${planned ? 'planned' : ''} ${check.ready ? 'ready' : ''}" data-open="${k.id}">
      <div class="skill-id">${k.id}</div>
      <div class="skill-body">
        <div class="skill-name">${esc(k.name)} ${planned ? '<span class="tag">today</span>' : ''} ${check.ready ? '<span class="tag tag-accent">ready to advance</span>' : ''}</div>
        <div class="skill-level muted">L${st.level} · ${esc(k.levels[st.level - 1])}</div>
        <div class="bar"><span style="width:${pct}%"></span></div>
        <div class="skill-meta muted small">${sessions.length} session${sessions.length === 1 ? '' : 's'}${last ? ` · last ${last.successes}/${last.attempts}${last.lured ? ' lured' : ''}` : ''}${todayN ? ` · ${todayN} today` : ''}</div>
      </div>
      <button class="skill-run" data-run="${k.id}" aria-label="Start lesson">${icon('play')}</button>
    </div>`;
}

function skillDetail(id, nav) {
  const k = skillById(id);
  if (!k) return;
  const render = () => {
    const st = skillState(id);
    const check = progressionCheck(id);
    const sessions = skillSessions(id).slice(-8).reverse();
    return `
      <div class="eyebrow">Skill ${k.id} · page ${k.page}</div>
      <h2 class="h2" style="margin:2px 0 10px">${esc(k.name)}</h2>
      <div class="kv"><span class="k">Goal</span><span>${esc(k.goal)}</span></div>
      <ol class="steps">${k.steps.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>
      <div class="hint">${esc(k.ifStuck)}</div>
      ${k.note ? `<div class="hint">${esc(k.note)}</div>` : ''}
      <div class="eyebrow" style="margin-top:14px">Difficulty ladder</div>
      <ol class="ladder">${k.levels.map((l, i) => `<li class="${i + 1 === st.level ? 'current' : i + 1 < st.level ? 'past' : ''}"><span>${i + 1}</span>${esc(l)}</li>`).join('')}</ol>
      ${check.ready ? `<div class="banner banner-accent static">${icon('lesson')}<div><b>Ready to advance</b><span>4/5 twice at this level on separate sessions. Change one thing: distance, duration or distraction.</span></div></div>` : ''}
      ${check.struggling ? `<div class="banner static">${icon('alert')}<div><b>He is struggling here</b><span>Step back to where he succeeds. Check reward value, timing, distance, sleep and health.</span></div></div>` : ''}
      <div class="btn-row">
        <button class="btn btn-ghost" data-act="back" ${st.level <= 1 ? 'disabled' : ''}>${icon('back')} Step back</button>
        <button class="btn ${check.ready ? 'btn-primary' : 'btn-ghost'}" data-act="adv" ${st.level >= k.levels.length ? 'disabled' : ''}>Advance ${icon('chevron')}</button>
      </div>
      <button class="btn btn-primary btn-block" data-act="run">${icon('play')} Start ${esc(k.name)} lesson</button>
      <div class="eyebrow" style="margin-top:14px">Recent sessions</div>
      ${sessions.length ? `<ul class="feed compact">${sessions.map((s) => `<li><span class="ft">${dateKey(new Date(s.ts)).slice(5)} ${fmtTime(s.ts)}</span><span class="fx">${s.successes}/${s.attempts} · L${s.level || 1} · ${esc(s.setting || '')}${s.lured ? ' · lured' : ''}</span><span class="fc muted">${esc(s.cg || '')}</span></li>`).join('')}</ul>` : '<p class="muted">No sessions yet.</p>'}
    `;
  };
  const body = openSheet(render(), { tall: true });
  const wire = () => bind(body, {
    back: () => { stepBackSkill(id, 'manual'); body.innerHTML = render(); wire(); toast(`${k.name} back to level ${skillState(id).level}.`); },
    adv: () => { advanceSkill(id, 'manual'); body.innerHTML = render(); wire(); toast(`${k.name} now level ${skillState(id).level}. Change only one thing.`); },
    run: () => { closeSheet(); lessonSheet(id, { onDone: () => nav('train', { tab: 'skills' }) }); },
  });
  wire();
}

// ---------- Calm and alone ----------
function renderCalm(root) {
  const sep = separationCheck();
  const s = getState();
  const recent = aloneSessions().slice(-6).reverse();
  root.innerHTML = html`
    <section class="card">
      <div class="eyebrow">Rest through the day</div><p>${REST.rest}</p>
      <div class="eyebrow" style="margin-top:12px">Count sleep, not crate hours</div><p>${REST.sleep}</p>
    </section>
    <section class="card">
      <div class="card-head"><div class="eyebrow">Calm outside the crate</div><button class="link" data-act="settle">Log calm mat time ${raw(icon('chevron'))}</button></div>
      <p>${REST.settle}</p>
    </section>
    <section class="card">
      <div class="card-head"><div class="eyebrow">Separation in tiny steps</div><span class="muted small">step ${sep.step} of 4 · ${sep.sessionsAtStep} at this step</span></div>
      <ol class="ladder big">${raw(REST.separationSteps.map((x) => `<li class="${x.step === sep.step ? 'current' : x.step < sep.step ? 'past' : ''}"><span>${x.step}</span><div><b>${esc(x.title)}</b><p>${esc(x.text)}</p></div></li>`).join(''))}</ol>
      ${sep.ready ? html`<div class="banner banner-accent static">${raw(icon('lesson'))}<div><b>Three calm sessions in a row</b><span>You can try the next step. Increase distance or time, not both.</span></div></div>` : ''}
      ${sep.distress ? html`<div class="banner static">${raw(icon('alert'))}<div><b>Last session showed distress</b><span>End the difficult exposure. Repeat an easier version and return before distress next time.</span></div></div>` : ''}
      <div class="btn-row">
        <button class="btn btn-ghost" data-act="sepBack" ${sep.step <= 1 ? 'disabled' : ''}>${raw(icon('back'))} Easier step</button>
        <button class="btn ${sep.ready ? 'btn-primary' : 'btn-ghost'}" data-act="sepAdv" ${sep.step >= 4 ? 'disabled' : ''}>Next step ${raw(icon('chevron'))}</button>
      </div>
      <button class="btn btn-primary btn-block" data-act="alone">${raw(icon('clock'))} Log alone practice</button>
      <p class="fine">${REST.separationRules}</p>
      ${recent.length ? raw(`<ul class="feed compact">${recent.map((e) => `<li class="${e.comfort === 'panic' ? 'danger' : ''}"><span class="ft">${dateKey(new Date(e.ts)).slice(5)} ${fmtTime(e.ts)}</span><span class="fx">Step ${e.step} · ${e.seconds}s · ${esc(e.distance)} · ${esc(e.comfort)}${e.foodToy ? ' · food toy' : ''}</span></li>`).join('')}</ul>`) : ''}
    </section>
    <section class="card"><div class="eyebrow">Overnight</div><p>${REST.overnight}</p></section>
  `.toString();
  bind(root, {
    alone: () => aloneSheet(),
    settle: () => aloneSheet(),
    sepAdv: () => { setSeparationStep(sep.step + 1, 'advanced'); toast(`Separation step ${sep.step + 1}. Keep the easier versions in rotation.`); },
    sepBack: () => { setSeparationStep(sep.step - 1, 'easier'); toast(`Back to separation step ${sep.step - 1}.`); },
  });
}

// ---------- Experiences ----------
function renderWorld(root) {
  const day = programDay();
  const idx = (day - 1 + 7000) % 7;
  const todaySocial = eventsForDay().filter((e) => e.type === 'social');
  root.innerHTML = html`
    <section class="card"><div class="eyebrow">Start now, safely</div><p>${SOCIAL.intro}</p><p class="fine">${SOCIAL.rule}</p></section>
    <section class="card">
      <div class="card-head"><div class="eyebrow">Seven-day rotation</div><span class="muted small">${todaySocial.length} logged today</span></div>
      <ol class="rotation">${raw(SOCIAL.rotation.map((r, i) => `<li class="${i === idx ? 'current' : ''}"><div class="pd">${r.day}</div><div class="pb"><div class="pf">${esc(r.exposure)}</div><div class="pp muted">Enrichment: ${esc(r.enrichment)}</div></div><button class="skill-run" data-social="${i}" aria-label="Log">${icon('plus')}</button></li>`).join(''))}</ol>
      <p class="fine">This rotation is a practical example, not a required novelty quota. Repeat the cycle with small variations; avoid stacking several difficult experiences in one outing. Do not scatter food in a potentially contaminated potty area.</p>
    </section>
    <section class="card"><div class="card-head"><div class="eyebrow">Handling</div><button class="link" data-act="handling">Log handling ${raw(icon('chevron'))}</button></div><p>${skillById('J').steps.join(' ')}</p><p class="fine">${skillById('J').ifStuck}</p></section>
    <section class="card"><div class="eyebrow">Exercise without exhausting him</div><p>${SOCIAL.exercise}</p></section>
    <section class="card"><div class="eyebrow">Class readiness</div><p>${SOCIAL.classes}</p></section>
  `.toString();
  root.querySelectorAll('[data-social]').forEach((b) => b.addEventListener('click', () => { const r = SOCIAL.rotation[Number(b.getAttribute('data-social'))]; socialSheet(r.exposure, r.enrichment); }));
  bind(root, { handling: () => handlingSheet() });
}
