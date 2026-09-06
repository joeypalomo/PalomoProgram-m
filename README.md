# PalomoProgram

Teddie's daily training system. A mobile-first, offline-capable web app built from the
"Puppy Foundations, 10-16 weeks" daily training guide for Joey and Bryanna.

The app turns the sixteen-page guide into a tactical daily tool: the run of show, event-based
potty timing, the ten skill cards with the 4-of-5 progression rule, the response card, protected
pet observation for Charlie, Tortilla and Maisie, separation steps, the seven-day experience
rotation, the printable daily log rebuilt as an auto-computed summary, and the weekly review.

## Use it on a phone

1. Open the deployed URL (GitHub Pages deploys from `main` via `.github/workflows/pages.yml`).
2. iPhone: Share, then Add to Home Screen. Android: the browser offers Install.
3. Pick the caregiver on duty in the header. Every entry is tagged to that person.

No account, no server. Data lives in the phone's local storage. Review > Data exports a
backup you can share to the other caregiver's phone and merge, so two phones keep one log.

`dist/PalomoProgram.html` is a self-contained single file with the whole app inlined. It runs
from any host, or opened directly, for quick sharing.

## Structure

```
index.html               app shell
css/app.css              design system (dark first, light theme, safe areas)
js/app.js                router, header, tab bar, live refresh, onboarding
js/store.js              localStorage document, event log, derived state
js/sheets.js             quick-log bottom sheets and the lesson runner
js/data/guide.js         every rule, card, schedule and checklist from the guide
js/views/*.js            Today, Train, Respond, Pets, Review
sw.js, manifest          offline app shell and installability
scripts/build-single.mjs bundles everything into dist/PalomoProgram.html
scripts/icons.mjs        renders PNG icons from assets/logo.svg with Chromium
```

## Develop

```
npm start              # serves on http://localhost:8080
npm run build:single   # writes dist/PalomoProgram.html
npm run icons          # regenerates PNG icons
```

No build step is needed to run the source. It is plain ES modules.

## Ground rules baked in

The app enforces the guide's decision rules rather than decorating them: a lesson runner stops
you at five reps or three minutes, progression prompts only after 4/5 twice without a lure,
cat sessions unlock a single change only after repeated calm days, separation advances only
after three calm sessions, and the response card leads with the immediate action. Veterinary
instructions take precedence over anything in this app.
