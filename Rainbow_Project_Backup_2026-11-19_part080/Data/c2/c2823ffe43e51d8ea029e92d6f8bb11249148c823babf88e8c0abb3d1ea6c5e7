#!/usr/bin/env node
// benny-character-artist: 360° / identity sheets of the REAL runtime Benny (canonical benny.glb + runtime), via the
// existing lab page src/characters/benny/benny-lab.html (?src=glb). Switch off vs on (benny05).
//   node qa/pilot05/full_reference_match/benny/work/labviews.mjs --out=DIR
// → DIR/{turntable,cmp}_{off,on}.png
import { mkdirSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../../../../scripts/lib/pw.mjs';
const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.join('=')]; }));
const out = opt.out || 'qa/pilot05/full_reference_match/benny/views';
mkdirSync(out, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5233);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  for (const [views, w, h] of [['turntable', 360 * 5, 520], ['cmp', 432 * 5, 768]]) {
    for (const sw of ['off', 'on']) {
      const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      page.on('pageerror', (e) => console.log('pageerror', e.message));
      page.on('console', (m) => { if (m.type() === 'error' || m.text().startsWith('[benny')) console.log('console:', m.text()); });
      await page.goto(`${vite.url}/src/characters/benny/benny-lab.html?src=glb&views=${views}${sw === 'on' ? '&benny05=1' : ''}`);
      await page.waitForFunction(() => window.__done === true, null, { timeout: 240000 });
      const err = await page.evaluate(() => window.__error);
      if (err) throw new Error(err);
      await page.screenshot({ path: `${out}/${views}_${sw}.png` });
      console.log('wrote', `${out}/${views}_${sw}.png`);
      await page.close();
    }
  }
} finally {
  await browser.close();
  await vite.close();
}
