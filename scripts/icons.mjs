// Renders PNG app icons from the SVG mark using Chromium.
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
const svg = readFileSync(new URL('../assets/logo.svg', import.meta.url), 'utf8');
const b = await chromium.launch();
async function render(size, out, padScale) {
  const p = await b.newPage({ viewport: { width: size, height: size }, deviceScaleFactor: 1 });
  let s = svg;
  if (padScale) s = s.replace('translate(8 6) scale(0.84)', `translate(${(100 - 100 * padScale) / 2 + 2} ${(100 - 100 * padScale) / 2}) scale(${padScale})`);
  await p.setContent(`<html><body style="margin:0;background:#0F1115">${s.replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body></html>`);
  await p.screenshot({ path: out, clip: { x: 0, y: 0, width: size, height: size } });
  await p.close();
}
await render(180, 'assets/icon-180.png');
await render(192, 'assets/icon-192.png');
await render(512, 'assets/icon-512.png');
await render(512, 'assets/icon-512-maskable.png', 0.66);
await b.close();
console.log('icons written');
