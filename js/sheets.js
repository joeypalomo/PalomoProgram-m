// Shared quick-log sheets used across views.
import { html, raw, esc, openSheet, closeSheet, toast, haptic, segmented, segValue, wireSegments, bind, icon } from './ui.js';
import { getState, addEvent, removeEvent, nextMealNumber, sleepStatus, skillState, skillSessions, progressionCheck, advanceSkill, stepBackSkill, fmtTime, uid } from './store.js';
import { RESPONSES, SKILLS, skillById, REST, DOG } from './data/guide.js';

function saved(ev, message, extra = {}) {
  haptic([12, 30, 12]);
  toast(message, { action: 'Undo', onAction: () => removeEvent(ev.id), ...extra });
}

function isOvernight(d = new Date()) {
  const h = d.getHours();
  return h >= 22 || h < 6;
}

// ---------- potty ----------
export function pottySheet() {
  const body = openSheet(`
    <div class="field"><div class="label">Result</div>
      ${segmented('result', [
        { value: 'pee', label: 'Pee' }, { value: 'poop', label: 'Poop' }, { value: 'both', label: 'Both' },
        { value: 'nothing', label: 'Nothing' }, { value: 'accident', label: 'Accident' },
      ], 'pee')}
    </div>
    <div class="field" id="stoolField" hidden><div class="label">Stool</div>
      ${segmented('stool', [{ value: 'normal', label: 'Normal' }, { value: 'abnormal', label: 'Loose / odd' }], 'normal')}
    </div>
    <div class="field" id="accidentField" hidden>
      <div class="hint">Guide him outside calmly if you caught it starting. Clean with a pet-appropriate cleaner. Do not punish. Shorten the next interval.</div>
    </div>
    <div class="row-toggle">
      <label class="toggle"><input type="checkbox" id="rewarded" checked><span>Marked "yes" and rewarded outdoors</span></label>
    </div>
    <div class="row-toggle">
      <label class="toggle"><input type="checkbox" id="overnight" ${isOvernight() ? 'checked' : ''}><span>Overnight trip</span></label>
    </div>
    <button class="btn btn-primary btn-block" data-act="save">${icon('check')} Log potty</button>
  `, { title: 'Potty trip' });
  wireSegments(body, (name, value) => {
    if (name === 'result') {
      body.querySelector('#stoolField').hidden = !(value === 'poop' || value === 'both');
      body.querySelector('#accidentField').hidden = value !== 'accident';
      body.querySelector('.row-toggle').hidden = value === 'accident' || value === 'nothing';
    }
  });
  bind(body, {
    save: () => {
      const result = segValue(body, 'result');
      const ev = addEvent({
        type: 'potty', result,
        stool: result === 'poop' || result === 'both' ? segValue(body, 'stool') : undefined,
        rewarded: body.querySelector('#rewarded').checked,
        overnight: body.querySelector('#overnight').checked,
      });
      closeSheet();
      const msg = result === 'nothing' ? 'Dry trip logged. Close supervision, retry in 5-10 min.'
        : result === 'accident' ? 'Accident logged. Shorten the next potty interval.'
        : 'Potty logged. Nice work.';
      saved(ev, msg);
    },
  });
}

// ---------- meal ----------
export function mealSheet() {
  const s = getState();
  const next = nextMealNumber() || s.settings.mealsPerDay;
  const opts = [];
  for (let i = 1; i <= s.settings.mealsPerDay; i++) opts.push({ value: String(i), label: `Meal ${i}` });
  const body = openSheet(`
    <div class="field"><div class="label">Which meal</div>${segmented('meal', opts, String(next))}</div>
    <div class="row-toggle"><label class="toggle"><input type="checkbox" id="reserved" checked><span>Small portion set aside for rewards</span></label></div>
    <div class="row-toggle"><label class="toggle"><input type="checkbox" id="separate" checked><span>Fed separately from other pets</span></label></div>
    <div class="field"><div class="label">Appetite</div>${segmented('appetite', [{ value: 'ate', label: 'Ate all' }, { value: 'partial', label: 'Left some' }, { value: 'refused', label: 'Refused' }], 'ate')}</div>
    <div class="hint">Feed the measured ration only. Offer potty promptly afterward. Pick up leftovers.</div>
    <button class="btn btn-primary btn-block" data-act="save">${icon('check')} Log meal</button>
  `, { title: 'Meal' });
  wireSegments(body);
  bind(body, {
    save: () => {
      const ev = addEvent({
        type: 'meal', meal: Number(segValue(body, 'meal')),
        reserved: body.querySelector('#reserved').checked,
        separate: body.querySelector('#separate').checked,
        appetite: segValue(body, 'appetite'),
      });
      closeSheet();
      saved(ev, `Meal ${ev.meal} logged. Potty due within minutes.`);
    },
  });
}

// ---------- sleep toggle ----------
export function toggleSleep() {
  const st = sleepStatus();
  if (st.asleep) {
    const ev = addEvent({ type: 'sleep', action: 'stop' });
    saved(ev, 'Awake. Straight to the potty spot on leash.', { duration: 5000 });
  } else {
    const ev = addEvent({ type: 'sleep', action: 'start' });
    saved(ev, 'Rest started. Respond if he wakes needing potty.');
  }
}

export function logDrink() {
  const ev = addEvent({ type: 'drink' });
  saved(ev, 'Big drink logged. Potty coming up.');
}

// ---------- alone / separation ----------
export function aloneSheet() {
  const s = getState();
  const step = s.separation.step || 1;
  const stepOpts = REST.separationSteps.map((x) => ({ value: String(x.step), label: `Step ${x.step}` }));
  const body = openSheet(`
    <div class="field"><div class="label">Separation step</div>${segmented('step', stepOpts, String(step))}</div>
    <div class="stepdesc muted" id="stepDesc">${esc(REST.separationSteps[step - 1].title)}: ${esc(REST.separationSteps[step - 1].text)}</div>
    <div class="field"><div class="label">How long</div>
      <div class="chips" id="secs">
        ${[2, 5, 10, 20, 30, 60, 120, 300].map((n) => `<button type="button" class="chip ${n === 5 ? 'active' : ''}" data-v="${n}">${n < 60 ? n + 's' : n / 60 + 'm'}</button>`).join('')}
      </div>
    </div>
    <div class="field"><div class="label">Where you were</div>${segmented('dist', [{ value: 'beside', label: 'Beside' }, { value: 'step', label: 'One step' }, { value: 'room', label: 'Across room' }, { value: 'out', label: 'Out of view' }], step >= 4 ? 'out' : step >= 3 ? 'step' : 'beside')}</div>
    <div class="field"><div class="label">His comfort</div>${segmented('comfort', [{ value: 'calm', label: 'Calm' }, { value: 'fuss', label: 'Mild fuss' }, { value: 'panic', label: 'Distress' }], 'calm')}</div>
    <div class="row-toggle"><label class="toggle"><input type="checkbox" id="foodToy"><span>Food toy used (check comfort after it ended)</span></label></div>
    <div class="hint">Increase distance or time, not both. Return before distress. Escalating cries or frantic escape attempts mean stop and make it easier.</div>
    <button class="btn btn-primary btn-block" data-act="save">${icon('check')} Log alone practice</button>
  `, { title: 'Alone practice' });
  wireSegments(body, (name, value) => {
    if (name === 'step') {
      const st = REST.separationSteps[Number(value) - 1];
      body.querySelector('#stepDesc').textContent = `${st.title}: ${st.text}`;
    }
  });
  body.querySelectorAll('#secs .chip').forEach((c) => c.addEventListener('click', () => {
    body.querySelectorAll('#secs .chip').forEach((x) => x.classList.remove('active'));
    c.classList.add('active');
  }));
  bind(body, {
    save: () => {
      const comfort = segValue(body, 'comfort');
      const ev = addEvent({
        type: 'alone', step: Number(segValue(body, 'step')),
        seconds: Number(body.querySelector('#secs .chip.active').getAttribute('data-v')),
        distance: segValue(body, 'dist'), comfort,
        foodToy: body.querySelector('#foodToy').checked,
      });
      closeSheet();
      saved(ev, comfort === 'panic' ? 'Logged. End the hard exposure; next time start easier.' : 'Alone practice logged.');
    },
  });
}

// ---------- incident (response card) ----------
export function incidentSheet(kind) {
  const r = RESPONSES.find((x) => x.id === kind);
  if (!r) return;
  const isCat = kind === 'cat-rush';
  const body = openSheet(`
    <div class="respond-now">
      <div class="eyebrow danger">Do this now</div>
      <p class="lead">${esc(r.now)}</p>
    </div>
    <div class="respond-next">
      <div class="eyebrow">Teach next</div>
      <p>${esc(r.next)}</p>
    </div>
    ${isCat ? `<div class="row-toggle"><label class="toggle"><input type="checkbox" id="reached"><span>He reached the cat (contact happened)</span></label></div>
    <div class="field"><div class="label">Which cat</div>${segmented('cat', [{ value: 'charlie', label: 'Charlie' }, { value: 'tortilla', label: 'Tortilla' }, { value: 'unknown', label: 'Not sure' }], 'unknown')}</div>` : ''}
    ${kind === 'bite' || kind === 'bite-repeat' ? `<div class="field"><div class="label">Context</div>${segmented('ctx', [{ value: 'play', label: 'Play' }, { value: 'handling', label: 'Handling' }, { value: 'tired', label: 'Overtired' }, { value: 'other', label: 'Other' }], 'play')}</div>` : ''}
    <div class="field"><input class="input" id="note" placeholder="One-line note (optional)"></div>
    ${r.severity === 'high' ? `<div class="hint danger-text">Guarding: keep pets separated and arrange professional guidance before practicing around the trigger.</div>` : ''}
    <button class="btn btn-danger btn-block" data-act="save">${icon('check')} Log "${esc(r.short)}"</button>
  `, { title: r.label });
  wireSegments(body);
  bind(body, {
    save: () => {
      const ev = addEvent({
        type: 'incident', kind,
        reached: isCat ? body.querySelector('#reached').checked : undefined,
        cat: isCat ? segValue(body, 'cat') : undefined,
        context: segValue(body, 'ctx') || undefined,
        note: body.querySelector('#note').value.trim() || undefined,
      });
      closeSheet();
      saved(ev, `${r.short} logged. Calm reset.`);
    },
  });
}

// ---------- note ----------
export function noteSheet() {
  const body = openSheet(`
    <div class="field"><textarea class="input" id="note" rows="4" placeholder="What happened, what to make easier tomorrow..."></textarea></div>
    <button class="btn btn-primary btn-block" data-act="save">${icon('check')} Save note</button>
  `, { title: 'Note' });
  body.querySelector('#note').focus();
  bind(body, {
    save: () => {
      const text = body.querySelector('#note').value.trim();
      if (!text) return;
      const ev = addEvent({ type: 'note', text });
      closeSheet();
      saved(ev, 'Note saved.');
    },
  });
}

// ---------- lesson session runner ----------
// A live 1-3 minute session: tap success / miss, timer, then save with setting and lure flag.
export function lessonSheet(skillId, { onDone } = {}) {
  const s = getState();
  const skills = SKILLS.map((k) => ({ value: k.id, label: `${k.id}` }));
  let current = skillId || 'A';
  let successes = 0, misses = 0, running = false, startTs = null, timer = null;

  const body = openSheet(`
    <div class="lesson-pick">
      <div class="chips" id="skillChips">${SKILLS.map((k) => `<button type="button" class="chip ${k.id === current ? 'active' : ''}" data-id="${k.id}">${k.id} · ${esc(k.name)}</button>`).join('')}</div>
    </div>
    <div class="lesson-head">
      <div>
        <div class="eyebrow" id="lvlLabel"></div>
        <div class="lesson-name" id="lessonName"></div>
      </div>
      <div class="timer" id="timer">0:00</div>
    </div>
    <div class="lesson-steps muted" id="lessonSteps"></div>
    <div class="counter">
      <button type="button" class="count-btn count-miss" data-act="miss">${icon('x')}<span>Miss</span><b id="missN">0</b></button>
      <div class="count-mid"><div class="count-big" id="score">0<span>/0</span></div><div class="muted small">comfortable successes</div></div>
      <button type="button" class="count-btn count-hit" data-act="hit">${icon('check')}<span>Success</span><b id="hitN">0</b></button>
    </div>
    <div class="field"><div class="label">Setting</div>${segmented('setting', [{ value: 'quiet', label: 'Quiet room' }, { value: 'second', label: '2nd room' }, { value: 'house', label: 'Household' }, { value: 'outside', label: 'Outside' }], 'quiet')}</div>
    <div class="row-toggle"><label class="toggle"><input type="checkbox" id="lured"><span>Lure shown first (does not count toward progression)</span></label></div>
    <div class="lesson-warn muted small" id="warn"></div>
    <div class="btn-row">
      <button class="btn btn-ghost" data-act="start" id="startBtn">${icon('play')} Start timer</button>
      <button class="btn btn-primary" data-act="save">${icon('check')} Save session</button>
    </div>
  `, { title: 'Lesson', tall: true });

  const fmt = (ms) => { const t = Math.floor(ms / 1000); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
  const refresh = () => {
    const k = skillById(current);
    const st = skillState(current);
    body.querySelector('#lessonName').textContent = `${k.id}. ${k.name}`;
    body.querySelector('#lvlLabel').textContent = `Level ${st.level} of ${k.levels.length}: ${k.levels[st.level - 1]}`;
    body.querySelector('#lessonSteps').innerHTML = `<ol>${k.steps.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>`;
    body.querySelector('#hitN').textContent = successes;
    body.querySelector('#missN').textContent = misses;
    body.querySelector('#score').innerHTML = `${successes}<span>/${successes + misses}</span>`;
    const w = body.querySelector('#warn');
    if (misses >= 2 && successes < 2) w.textContent = 'Two misses: make it easier or stop. Do not repeat the cue louder.';
    else if (successes + misses >= 5) w.textContent = 'Five reps done. Finish with something easy and save.';
    else w.textContent = '';
  };
  const tick = () => {
    const ms = Date.now() - startTs;
    body.querySelector('#timer').textContent = fmt(ms);
    if (ms > 180000) { body.querySelector('#timer').classList.add('over'); body.querySelector('#warn').textContent = 'Over three minutes. Stop here; a short break beats drilling.'; }
  };
  body.querySelectorAll('#skillChips .chip').forEach((c) => c.addEventListener('click', () => {
    body.querySelectorAll('#skillChips .chip').forEach((x) => x.classList.remove('active'));
    c.classList.add('active');
    current = c.getAttribute('data-id');
    refresh();
  }));
  wireSegments(body);
  bind(body, {
    hit: () => { successes++; haptic(8); if (!running) startTimer(); refresh(); },
    miss: () => { misses++; haptic([8, 40, 8]); if (!running) startTimer(); refresh(); },
    start: () => { if (running) stopTimer(); else startTimer(); },
    save: () => {
      if (successes + misses === 0) { toast('Tap Success or Miss at least once.'); return; }
      stopTimer();
      const st = skillState(current);
      const ev = addEvent({
        type: 'lesson', skill: current, level: st.level,
        successes, attempts: successes + misses,
        seconds: startTs ? Math.round((Date.now() - startTs) / 1000) : null,
        setting: segValue(body, 'setting'),
        lured: body.querySelector('#lured').checked,
      });
      closeSheet();
      const k = skillById(current);
      const check = progressionCheck(current);
      if (check.ready) {
        toast(`${k.name}: 4/5 twice. Ready for one small increase.`, { action: 'Advance', onAction: () => { advanceSkill(current, 'auto after 4/5 x2'); toast(`${k.name} now level ${skillState(current).level}.`); }, duration: 7000 });
      } else if (check.struggling) {
        toast(`${k.name} is hard right now. Step back a level?`, { action: 'Step back', onAction: () => { stepBackSkill(current, 'struggling'); toast(`${k.name} back to level ${skillState(current).level}.`); }, duration: 7000 });
      } else {
        saved(ev, `Session saved: ${successes}/${successes + misses} on ${k.name}.`);
      }
      onDone && onDone(ev);
    },
  });
  function startTimer() { running = true; startTs = startTs || Date.now(); timer = setInterval(tick, 500); body.querySelector('#startBtn').innerHTML = `${icon('stop')} Stop timer`; }
  function stopTimer() { running = false; clearInterval(timer); body.querySelector('#startBtn').innerHTML = `${icon('play')} Resume`; }
  refresh();
}

// ---------- pet observation ----------
export function petSheet(animal) {
  const pet = DOG.residents.find((p) => p.id === animal) || DOG.residents[0];
  const isCat = pet.kind === 'cat';
  const body = openSheet(`
    <div class="field"><div class="label">Animal</div>${segmented('animal', DOG.residents.map((p) => ({ value: p.id, label: p.name })), pet.id)}</div>
    <div class="field"><div class="label">Distance</div>${segmented('distance', [{ value: 'far', label: 'Far (other room / barrier)' }, { value: 'mid', label: 'Mid (same room)' }, { value: 'near', label: 'Near' }], 'far')}</div>
    <div class="field"><div class="label">Teddie's body</div>${segmented('body', [{ value: 'loose', label: 'Loose' }, { value: 'alert', label: 'Alert but ok' }, { value: 'stiff', label: 'Stiff / fixated' }], 'loose')}</div>
    <div class="row-toggle"><label class="toggle"><input type="checkbox" id="turned" checked><span>Turned away to you without a lure</span></label></div>
    <div id="catFields" ${isCat ? '' : 'hidden'}>
      <div class="row-toggle"><label class="toggle"><input type="checkbox" id="catOk" checked><span>Cat comfortable (appeared by choice, ate, moved freely)</span></label></div>
    </div>
    <div id="maisieFields" ${isCat ? 'hidden' : ''}>
      <div class="field"><div class="label">Maisie chose to</div>${segmented('maisie', [{ value: 'reapproach', label: 'Reapproach' }, { value: 'leave', label: 'Leave' }, { value: 'none', label: 'No contact' }], 'none')}</div>
    </div>
    <div class="field"><div class="label">Red flags</div>${segmented('flag', [{ value: 'none', label: 'None' }, { value: 'bark', label: 'Bark / lunge' }, { value: 'stare', label: 'Rigid stare' }, { value: 'chase', label: 'Chase' }], 'none')}</div>
    <div class="field"><input class="input" id="note" placeholder="Seconds viewed, what you changed (optional)"></div>
    <div class="hint">Only a few easy repetitions, then leave. Food acceptance alone is not proof he is relaxed. Never provoke an interaction to fill the log.</div>
    <button class="btn btn-primary btn-block" data-act="save">${icon('check')} Log observation</button>
  `, { title: 'Pet observation', tall: true });
  wireSegments(body, (name, value) => {
    if (name === 'animal') {
      const p = DOG.residents.find((x) => x.id === value);
      body.querySelector('#catFields').hidden = p.kind !== 'cat';
      body.querySelector('#maisieFields').hidden = p.kind === 'cat';
    }
  });
  bind(body, {
    save: () => {
      const a = segValue(body, 'animal');
      const p = DOG.residents.find((x) => x.id === a);
      const flag = segValue(body, 'flag');
      const bodyState = segValue(body, 'body');
      const ev = addEvent({
        type: 'pet', animal: a, kind: p.kind,
        distance: segValue(body, 'distance'),
        body: bodyState, bodyLoose: bodyState === 'loose',
        turnedAway: body.querySelector('#turned').checked,
        catComfortable: p.kind === 'cat' ? body.querySelector('#catOk').checked : undefined,
        maisieChoice: p.kind === 'dog' ? segValue(body, 'maisie') : undefined,
        redFlag: flag !== 'none' ? flag : undefined,
        note: body.querySelector('#note').value.trim() || undefined,
      });
      closeSheet();
      saved(ev, flag !== 'none' || bodyState === 'stiff' ? 'Logged. Increase distance or end visual access. Start easier next time.' : `${p.name} observation logged.`);
    },
  });
}

// ---------- socialization ----------
export function socialSheet(defaultExposure = '', defaultEnrichment = '') {
  const body = openSheet(`
    <div class="field"><div class="label">Exposure</div><input class="input" id="exp" value="${esc(defaultExposure)}" placeholder="What he saw or heard"></div>
    <div class="field"><div class="label">His response</div>${segmented('resp', [{ value: 'relaxed', label: 'Relaxed' }, { value: 'curious', label: 'Curious' }, { value: 'unsure', label: 'Unsure' }, { value: 'froze', label: 'Froze / retreated' }], 'relaxed')}</div>
    <div class="field"><div class="label">Enrichment</div><input class="input" id="enr" value="${esc(defaultEnrichment)}" placeholder="Easy enrichment done (optional)"></div>
    <div class="hint">Pair the sight or sound with food and stop before he is overwhelmed. If he froze, repeat an easier version before making it harder.</div>
    <button class="btn btn-primary btn-block" data-act="save">${icon('check')} Log experience</button>
  `, { title: 'Socialization' });
  wireSegments(body);
  bind(body, {
    save: () => {
      const ev = addEvent({ type: 'social', exposure: body.querySelector('#exp').value.trim(), response: segValue(body, 'resp'), enrichment: body.querySelector('#enr').value.trim() || undefined });
      closeSheet();
      saved(ev, 'Experience logged.');
    },
  });
}

// ---------- handling ----------
export function handlingSheet() {
  const body = openSheet(`
    <div class="field"><div class="label">Touch practiced</div>${segmented('area', [{ value: 'shoulder', label: 'Shoulder' }, { value: 'harness', label: 'Harness' }, { value: 'paws', label: 'Paws' }, { value: 'ears', label: 'Ears' }, { value: 'brush', label: 'Brush' }, { value: 'lip', label: 'Lip lift' }], 'shoulder')}</div>
    <div class="field"><div class="label">Comfort</div>${segmented('comfort', [{ value: 'relaxed', label: 'Relaxed' }, { value: 'tolerated', label: 'Tolerated' }, { value: 'pulled', label: 'Pulled away / mouthed' }], 'relaxed')}</div>
    <div class="hint">One gentle touch per repetition, then feed. Stop if he pulls away, freezes or mouths harder.</div>
    <button class="btn btn-primary btn-block" data-act="save">${icon('check')} Log handling</button>
  `, { title: 'Handling' });
  wireSegments(body);
  bind(body, {
    save: () => {
      const ev = addEvent({ type: 'handling', area: segValue(body, 'area'), comfort: segValue(body, 'comfort') });
      closeSheet();
      saved(ev, 'Handling logged.');
    },
  });
}
