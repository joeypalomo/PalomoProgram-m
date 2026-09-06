// PalomoProgram store: single JSON document in localStorage, event-sourced daily log.
import { DOG, SCHEDULE, SKILLS, PLAN14, REVIEW_DAYS, phaseForDay } from './data/guide.js';

const KEY = 'palomoprogram.v1';
const listeners = new Set();

const DEFAULTS = () => ({
  version: 1,
  settings: {
    dogName: DOG.name,
    birthDate: DOG.defaultBirthDate,
    programStart: DOG.defaultProgramStart,
    caregivers: [...DOG.caregivers],
    activeCaregiver: DOG.caregivers[0],
    mealsPerDay: 4,
    wakeShiftMin: 0, // shift the whole default clock by N minutes
    pottyIntervalMin: 30, // active-play interval (page 3)
    theme: 'dark',
    notifications: false,
    onboarded: false,
  },
  setup: {}, // free-text setup record fields
  events: [], // {id, ts, type, cg, ...payload}
  days: {}, // dateKey -> {prep:{}, handoff:{}, playMinutes, notes}
  skills: {}, // skillId -> {level, history:[{ts, level, note}]}
  separation: { step: 1, history: [] },
  weekly: {}, // reviewDay -> {answers:{}, decision, priorities:[], setupChange, help, ts}
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULTS();
    const parsed = JSON.parse(raw);
    const base = DEFAULTS();
    return {
      ...base,
      ...parsed,
      settings: { ...base.settings, ...(parsed.settings || {}) },
      separation: { ...base.separation, ...(parsed.separation || {}) },
    };
  } catch (e) {
    console.warn('store load failed', e);
    return DEFAULTS();
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('store persist failed', e);
  }
  listeners.forEach((fn) => fn(state));
}

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function update(mutator) {
  mutator(state);
  persist();
}

export function replaceState(next) {
  const base = DEFAULTS();
  state = { ...base, ...next, settings: { ...base.settings, ...(next.settings || {}) } };
  persist();
}

export function resetAll() {
  state = DEFAULTS();
  persist();
}

// ---------- time helpers ----------
export const pad = (n) => String(n).padStart(2, '0');

export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDateKey(key) {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function fmtTime(ts) {
  const d = new Date(ts);
  let h = d.getHours();
  const m = pad(d.getMinutes());
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m}${ap}`;
}

export function fmtClock(minutes) {
  const total = ((minutes % 1440) + 1440) % 1440;
  let h = Math.floor(total / 60);
  const m = pad(total % 60);
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m}${ap}`;
}

export function fmtAgo(ts, now = Date.now()) {
  const mins = Math.max(0, Math.round((now - ts) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m ? `${h}h ${m}m ago` : `${h}h ago`;
}

export function fmtDuration(ms) {
  const s = Math.max(0, Math.round(ms / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rs = s % 60;
  if (m < 60) return rs ? `${m}m ${rs}s` : `${m}m`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h}h ${rm}m` : `${h}h`;
}

export function fmtLongDate(d = new Date()) {
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
}

export function minutesNow(d = new Date()) {
  return d.getHours() * 60 + d.getMinutes();
}

// ---------- program facts ----------
export function programDay(d = new Date()) {
  const start = parseDateKey(state.settings.programStart);
  const diff = Math.floor((startOfDay(d) - startOfDay(start)) / 86400000);
  return diff + 1;
}

export function ageWeeks(d = new Date()) {
  const birth = parseDateKey(state.settings.birthDate);
  const days = Math.floor((startOfDay(d) - startOfDay(birth)) / 86400000);
  return { weeks: Math.floor(days / 7), days: days % 7, totalDays: days };
}

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function planForDay(day) {
  if (day >= 1 && day <= 14) return PLAN14[day - 1];
  return null;
}

export function currentPhase(day) {
  return phaseForDay(Math.max(1, day));
}

export function isReviewDay(day) {
  return REVIEW_DAYS.includes(day);
}

export function pendingReviewDay(day) {
  // The most recent review milestone reached that has not been completed.
  const due = REVIEW_DAYS.filter((r) => r <= day);
  const last = due[due.length - 1];
  if (!last) return null;
  return state.weekly[last]?.completed ? null : last;
}

// ---------- schedule ----------
export function shiftedSchedule() {
  const shift = state.settings.wakeShiftMin || 0;
  const meals = state.settings.mealsPerDay || 4;
  return SCHEDULE.filter((b) => !(b.meal && b.meal > meals)).map((b) => ({
    ...b,
    start: b.start + shift,
    end: b.end + shift,
  }));
}

export function currentBlock(now = new Date()) {
  const m = minutesNow(now);
  const blocks = shiftedSchedule();
  // Night block wraps past midnight.
  for (const b of blocks) {
    if (m >= b.start && m < b.end) return b;
    if (b.end > 1440 && m < b.end - 1440) return b;
  }
  return blocks[blocks.length - 1];
}

export function nextBlock(now = new Date()) {
  const blocks = shiftedSchedule();
  const cur = currentBlock(now);
  const idx = blocks.findIndex((b) => b.id === cur.id);
  return blocks[(idx + 1) % blocks.length];
}

// ---------- events ----------
export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function addEvent(ev) {
  const full = { id: uid(), ts: Date.now(), cg: state.settings.activeCaregiver, ...ev };
  update((s) => {
    s.events.push(full);
    if (s.events.length > 20000) s.events = s.events.slice(-20000);
  });
  return full;
}

export function removeEvent(id) {
  update((s) => {
    s.events = s.events.filter((e) => e.id !== id);
  });
}

export function restoreEvent(ev) {
  update((s) => {
    if (!s.events.some((e) => e.id === ev.id)) s.events.push(ev);
    s.events.sort((a, b) => a.ts - b.ts);
  });
}

export function eventsForDay(key = dateKey()) {
  return state.events.filter((e) => dateKey(new Date(e.ts)) === key).sort((a, b) => a.ts - b.ts);
}

export function lastEvent(type, filter) {
  for (let i = state.events.length - 1; i >= 0; i--) {
    const e = state.events[i];
    if (e.type === type && (!filter || filter(e))) return e;
  }
  return null;
}

// Sleep is modelled as start/stop events. Current sleep = a start with no later stop.
export function sleepStatus() {
  const lastStart = lastEvent('sleep', (e) => e.action === 'start');
  const lastStop = lastEvent('sleep', (e) => e.action === 'stop');
  if (lastStart && (!lastStop || lastStop.ts < lastStart.ts)) return { asleep: true, since: lastStart.ts };
  return { asleep: false, since: lastStop ? lastStop.ts : null };
}

export function sleepMinutesForDay(key = dateKey()) {
  const evs = eventsForDay(key).filter((e) => e.type === 'sleep');
  const dayStart = parseDateKey(key).getTime();
  const dayEnd = dayStart + 86400000;
  let total = 0;
  let open = null;
  // Handle a sleep started the previous day.
  const before = state.events.filter((e) => e.type === 'sleep' && e.ts < dayStart).sort((a, b) => a.ts - b.ts);
  const lastBefore = before[before.length - 1];
  if (lastBefore && lastBefore.action === 'start') open = dayStart;
  for (const e of evs) {
    if (e.action === 'start') open = e.ts;
    else if (e.action === 'stop' && open != null) {
      total += e.ts - open;
      open = null;
    }
  }
  if (open != null) total += Math.min(Date.now(), dayEnd) - open;
  return Math.round(total / 60000);
}

// Potty logic (page 3): due immediately after waking, promptly after meals or drinking, before rest,
// and about every 30 minutes during active play.
export function pottyStatus(now = Date.now()) {
  const lastPotty = lastEvent('potty', (e) => e.result !== 'accident');
  const lastMeal = lastEvent('meal');
  const lastDrink = lastEvent('drink');
  const sleep = sleepStatus();
  const interval = (state.settings.pottyIntervalMin || 30) * 60000;
  const reasons = [];
  let dueAt = null;

  if (sleep.asleep) {
    return { due: false, asleep: true, lastPotty, text: 'Asleep. Potty the moment he wakes.' };
  }
  if (sleep.since && (!lastPotty || lastPotty.ts < sleep.since)) {
    reasons.push('just woke');
    dueAt = sleep.since;
  }
  if (lastMeal && (!lastPotty || lastPotty.ts < lastMeal.ts)) {
    reasons.push('after meal');
    dueAt = Math.min(dueAt ?? Infinity, lastMeal.ts + 5 * 60000);
  }
  if (lastDrink && (!lastPotty || lastPotty.ts < lastDrink.ts)) {
    reasons.push('after a big drink');
    dueAt = Math.min(dueAt ?? Infinity, lastDrink.ts + 5 * 60000);
  }
  if (lastPotty) {
    const nextByInterval = lastPotty.ts + interval;
    if (dueAt == null) dueAt = nextByInterval;
    if (lastPotty.result === 'nothing') {
      // Retry in 5-10 minutes if nothing happened.
      dueAt = Math.min(dueAt, lastPotty.ts + 7 * 60000);
      reasons.push('retry after a dry trip');
    }
  }
  if (dueAt == null) return { due: true, lastPotty, text: 'No potty logged yet. Start with a trip now.', reasons: ['no record'] };
  const due = now >= dueAt;
  return { due, dueAt, lastPotty, reasons, text: due ? 'Potty due now' : `Next potty around ${fmtTime(dueAt)}` };
}

export function mealsLogged(key = dateKey()) {
  return eventsForDay(key).filter((e) => e.type === 'meal').map((e) => e.meal);
}

export function nextMealNumber(key = dateKey()) {
  const done = mealsLogged(key);
  for (let i = 1; i <= (state.settings.mealsPerDay || 4); i++) if (!done.includes(i)) return i;
  return null;
}

// ---------- daily summary (page 14) ----------
export function daySummary(key = dateKey()) {
  const evs = eventsForDay(key);
  const potty = evs.filter((e) => e.type === 'potty');
  const pottySuccess = potty.filter((e) => e.result === 'pee' || e.result === 'poop' || e.result === 'both').length;
  const accidents = potty.filter((e) => e.result === 'accident').length;
  const stoolsAbnormal = potty.filter((e) => (e.result === 'poop' || e.result === 'both') && e.stool === 'abnormal').length;
  const stoolsLogged = potty.filter((e) => e.result === 'poop' || e.result === 'both').length;
  const incidents = evs.filter((e) => e.type === 'incident');
  const bites = incidents.filter((e) => e.kind === 'bite' || e.kind === 'bite-repeat').length;
  const catRushes = incidents.filter((e) => e.kind === 'cat-rush');
  const catRushReached = catRushes.filter((e) => e.reached).length;
  const lessons = evs.filter((e) => e.type === 'lesson');
  const pets = evs.filter((e) => e.type === 'pet');
  const alone = evs.filter((e) => e.type === 'alone');
  const bestAlone = alone.reduce((a, e) => (e.seconds > (a?.seconds || 0) ? e : a), null);
  const social = evs.filter((e) => e.type === 'social');
  const overnightWakes = evs.filter((e) => e.type === 'potty' && e.overnight);
  const maisie = pets.filter((e) => e.animal === 'maisie');
  const maisieChoice = maisie.length ? maisie[maisie.length - 1].maisieChoice : null;
  const meals = mealsLogged(key);
  const day = state.days[key] || {};
  return {
    key,
    pottySuccess,
    accidents,
    stoolsLogged,
    stoolsAbnormal,
    bites,
    playMinutes: day.playMinutes || 0,
    catRushes: catRushes.length,
    catRushReached,
    lessons,
    pets,
    alone,
    bestAlone,
    social,
    sleepMin: sleepMinutesForDay(key),
    overnightWakes,
    maisieChoice,
    meals,
    incidents,
    prep: day.prep || {},
    handoff: day.handoff || {},
    notes: day.notes || '',
  };
}

export function setDayField(key, path, value) {
  update((s) => {
    s.days[key] = s.days[key] || {};
    if (Array.isArray(path)) {
      let o = s.days[key];
      for (let i = 0; i < path.length - 1; i++) {
        o[path[i]] = o[path[i]] || {};
        o = o[path[i]];
      }
      o[path[path.length - 1]] = value;
    } else {
      s.days[key][path] = value;
    }
  });
}

// ---------- skills and progression (page 5 rule) ----------
export function skillState(id) {
  return state.skills[id] || { level: 1, history: [] };
}

export function skillSessions(id) {
  return state.events.filter((e) => e.type === 'lesson' && e.skill === id).sort((a, b) => a.ts - b.ts);
}

// Ready to advance when the last two sessions at the current level, on separate occasions,
// each scored >= 4/5 comfortable successes without a lure.
export function progressionCheck(id) {
  const st = skillState(id);
  const sessions = skillSessions(id).filter((s) => (s.level || 1) === st.level);
  const recent = sessions.slice(-2);
  const qualifying = recent.filter((s) => s.attempts >= 5 && s.successes >= 4 && !s.lured);
  const separate = recent.length === 2 && recent[1].ts - recent[0].ts > 20 * 60000;
  return {
    level: st.level,
    sessionsAtLevel: sessions.length,
    lastTwo: recent,
    ready: qualifying.length === 2 && separate,
    struggling: sessions.length >= 2 && sessions.slice(-2).every((s) => s.attempts > 0 && s.successes / s.attempts < 0.5),
  };
}

export function advanceSkill(id, note) {
  update((s) => {
    const st = s.skills[id] || { level: 1, history: [] };
    const skill = SKILLS.find((k) => k.id === id);
    const max = skill ? skill.levels.length : 5;
    if (st.level < max) st.level += 1;
    st.history.push({ ts: Date.now(), level: st.level, note: note || 'advanced' });
    s.skills[id] = st;
  });
}

export function stepBackSkill(id, note) {
  update((s) => {
    const st = s.skills[id] || { level: 1, history: [] };
    if (st.level > 1) st.level -= 1;
    st.history.push({ ts: Date.now(), level: st.level, note: note || 'stepped back' });
    s.skills[id] = st;
  });
}

// ---------- pets (page 9) ----------
export function petSessions(animal) {
  return state.events.filter((e) => e.type === 'pet' && e.animal === animal).sort((a, b) => a.ts - b.ts);
}

export function catProgress(animal) {
  const sessions = petSessions(animal);
  // Count consecutive calm sessions on different days at the trailing end.
  let calmDays = new Set();
  let streak = 0;
  for (let i = sessions.length - 1; i >= 0; i--) {
    const s = sessions[i];
    const calm = s.bodyLoose && s.turnedAway && s.catComfortable && !s.redFlag;
    if (!calm) break;
    calmDays.add(dateKey(new Date(s.ts)));
    streak++;
  }
  const last = sessions[sessions.length - 1] || null;
  return { sessions: sessions.length, streak, distinctDays: calmDays.size, ready: calmDays.size >= 3, last };
}

// ---------- separation (page 10) ----------
export function aloneSessions() {
  return state.events.filter((e) => e.type === 'alone').sort((a, b) => a.ts - b.ts);
}

export function separationCheck() {
  const step = state.separation.step || 1;
  const sessions = aloneSessions().filter((s) => s.step === step);
  const last3 = sessions.slice(-3);
  const ready = last3.length === 3 && last3.every((s) => s.comfort === 'calm');
  const distress = sessions.length && sessions[sessions.length - 1].comfort === 'panic';
  return { step, sessionsAtStep: sessions.length, ready, distress, best: sessions.reduce((a, s) => Math.max(a, s.seconds || 0), 0) };
}

export function setSeparationStep(step, note) {
  update((s) => {
    s.separation.step = Math.max(1, Math.min(4, step));
    s.separation.history.push({ ts: Date.now(), step: s.separation.step, note });
  });
}

// ---------- export / import ----------
export function exportJSON() {
  return JSON.stringify(state, null, 2);
}

export function importJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.events)) throw new Error('Not a PalomoProgram backup');
  replaceState(parsed);
}

export function mergeJSON(text) {
  const parsed = JSON.parse(text);
  if (!parsed || !Array.isArray(parsed.events)) throw new Error('Not a PalomoProgram backup');
  update((s) => {
    const ids = new Set(s.events.map((e) => e.id));
    for (const e of parsed.events) if (!ids.has(e.id)) s.events.push(e);
    s.events.sort((a, b) => a.ts - b.ts);
    for (const [k, v] of Object.entries(parsed.days || {})) s.days[k] = { ...(s.days[k] || {}), ...v };
    for (const [k, v] of Object.entries(parsed.skills || {})) {
      const mine = s.skills[k];
      if (!mine || v.level > mine.level) s.skills[k] = v;
    }
    for (const [k, v] of Object.entries(parsed.weekly || {})) if (!s.weekly[k]) s.weekly[k] = v;
    s.setup = { ...(parsed.setup || {}), ...s.setup };
    if ((parsed.separation?.step || 1) > (s.separation.step || 1)) s.separation = parsed.separation;
  });
}
