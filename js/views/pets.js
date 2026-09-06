import { html, raw, esc, bind, icon } from '../ui.js';
import { getState, petSessions, catProgress, fmtTime, dateKey } from '../store.js';
import { PETS, DOG } from '../data/guide.js';
import { petSheet, incidentSheet } from '../sheets.js';

function petBlock(p) {
  const prog = catProgress(p.id);
  const sessions = petSessions(p.id).slice(-5).reverse();
  const last = prog.last;
  const isCat = p.kind === 'cat';
  return `
    <section class="card pet-card">
      <div class="card-head">
        <div class="pet-name">${icon(isCat ? 'cat' : 'dog')}<div><b>${esc(p.name)}</b><span class="muted small">${esc(p.note || (isCat ? 'Cat' : 'Dog'))}</span></div></div>
        <button class="skill-run" data-pet="${p.id}" aria-label="Log observation">${icon('plus')}</button>
      </div>
      <div class="pet-stats">
        <div><b>${prog.sessions}</b><span>sessions</span></div>
        <div><b>${prog.streak}</b><span>calm streak</span></div>
        <div><b>${prog.distinctDays}</b><span>calm days</span></div>
        <div><b>${last ? esc(last.distance) : '—'}</b><span>last distance</span></div>
      </div>
      ${isCat ? (prog.ready
        ? `<div class="banner banner-accent static">${icon('lesson')}<div><b>Repeated calm on ${prog.distinctDays} days</b><span>You may change ONE thing: a little more viewing time OR a little less distance. Keep the barrier and leash.</span></div></div>`
        : last && (last.redFlag || !last.bodyLoose)
          ? `<div class="banner static">${icon('alert')}<div><b>Last session was not calm</b><span>Next time start easier: more distance or less viewing time. Do not repeat exposure until he stops reacting.</span></div></div>`
          : `<div class="hint">Progress only after repeated calm sessions on different occasions with the cat comfortable too.</div>`)
        : (last && last.maisieChoice === 'leave'
          ? `<div class="banner static">${icon('alert')}<div><b>Maisie chose to leave</b><span>The interaction was over at that point. Reward Teddie for following you away. Use barriers and separate activities if he cannot be guided away.</span></div></div>`
          : `<div class="hint">Interrupt after a short burst and invite Teddie away. Maisie decides whether to reapproach.</div>`)}
      ${sessions.length ? `<ul class="feed compact">${sessions.map((e) => `<li class="${e.redFlag ? 'warn' : ''}"><span class="ft">${dateKey(new Date(e.ts)).slice(5)} ${fmtTime(e.ts)}</span><span class="fx">${esc(e.distance)} · ${esc(e.body)}${e.turnedAway ? ' · turned away' : ''}${isCat ? (e.catComfortable ? ' · cat ok' : ' · cat unsure') : e.maisieChoice ? ` · Maisie: ${esc(e.maisieChoice)}` : ''}${e.redFlag ? ` · ${esc(e.redFlag)}` : ''}</span><span class="fc muted">${esc(e.cg || '')}</span></li>`).join('')}</ul>` : '<p class="muted small">No observations logged yet.</p>'}
    </section>`;
}

export function renderPets(root, nav) {
  const cats = DOG.residents.filter((p) => p.kind === 'cat');
  const maisie = DOG.residents.find((p) => p.kind === 'dog');
  const rushes = getState().events.filter((e) => e.type === 'incident' && e.kind === 'cat-rush');
  const rushWeek = rushes.filter((e) => Date.now() - e.ts < 7 * 86400000);
  root.innerHTML = html`
    <section class="hero"><div class="hero-top"><div><div class="eyebrow">Maisie, Charlie and Tortilla</div><h1 class="h1">Comfortable coexistence, not forced friendship</h1></div></div></section>
    <div class="btn-row"><button class="btn btn-primary btn-block" data-act="log">${raw(icon('pets'))} Log an observation</button><button class="btn btn-danger" data-act="rush">${raw(icon('alert'))} Rush</button></div>
    <section class="card">
      <div class="card-head"><div class="eyebrow">Cats: protected observation</div><span class="muted small">${rushWeek.length} rush${rushWeek.length === 1 ? '' : 'es'} this week · ${rushWeek.filter((e) => e.reached).length} reached</span></div>
      <p>${PETS.cats.setup}</p>
      <div class="kv"><span class="k">Method</span><span>${PETS.cats.method}</span></div>
      <div class="kv danger-text"><span class="k">Abort</span><span>${PETS.cats.abort}</span></div>
    </section>
    ${raw(cats.map(petBlock).join(''))}
    <section class="card"><div class="eyebrow">When you can progress</div><p>${PETS.cats.progress}</p><p class="fine">${PETS.cats.welfare}</p></section>
    <section class="card">
      <div class="eyebrow">Maisie: interrupt early, protect her choice</div>
      <p>${PETS.maisie.method}</p>
      <div class="kv danger-text"><span class="k">Over</span><span>${PETS.maisie.abort}</span></div>
      <div class="kv"><span class="k">Reward</span><span>${PETS.maisie.reward}</span></div>
    </section>
    ${raw(petBlock(maisie))}
    <p class="fine center">${PETS.logNote}</p>
  `.toString();
  bind(root, { log: () => petSheet('charlie'), rush: () => incidentSheet('cat-rush') });
  root.querySelectorAll('[data-pet]').forEach((b) => b.addEventListener('click', () => petSheet(b.getAttribute('data-pet'))));
}
