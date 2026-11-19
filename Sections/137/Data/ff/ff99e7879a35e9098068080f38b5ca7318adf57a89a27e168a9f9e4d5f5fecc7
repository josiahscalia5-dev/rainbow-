#!/usr/bin/env node
// benny08: 360-degree turntable of the REAL runtime Benny (canonical benny.glb + runtime) on the existing lab page
// src/characters/benny/benny-lab.html (?src=glb&views=turntable), CURRENT maps (benny05) vs NEW maps (bake08).
// Adapted copy of line B's qa/pilot05/full_reference_match/benny/work/labviews.mjs (read-only source).
//   node qa/match/08/benny08/work/labviews08.mjs --out=DIR   ->  DIR/turntable_{CURRENT,NEW}.png
import { mkdirSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../../../../scripts/lib/pw.mjs';
const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.join('=')]; }));
const out = opt.out || 'qa/match/08/benny08/views';
mkdirSync(out, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5243);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  for (const [label, q] of [['CURRENT', '&benny05=1'], ['NEW', '&benny05=1&bake08=1']]) {
    const page = await browser.newPage({ viewport: { width: 360 * 5, height: 520 }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.log('pageerror', e.message));
    page.on('console', (m) => { if (m.type() === 'error' || m.text().startsWith('[benny')) console.log('console:', m.text()); });
    await page.goto(`${vite.url}/src/characters/benny/benny-lab.html?src=glb&views=turntable${q}`);
    await page.waitForFunction(() => window.__done === true, null, { timeout: 240000 });
    const err = await page.evaluate(() => window.__error);
    if (err) throw new Error(err);
    await page.screenshot({ path: `${out}/turntable_${label}.png` });
    console.log('wrote', `${out}/turntable_${label}.png`);
    await page.close();
  }
} finally {
  await browser.close();
  await vite.close();
}
