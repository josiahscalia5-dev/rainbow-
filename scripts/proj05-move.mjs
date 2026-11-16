#!/usr/bin/env node
// Screen 05 motion check: the REAL game from the locked 05 checkpoint, ridden forward by the deterministic simulation
// (window.__rainbow.step, steering centred), one screenshot every --at units of arc length ahead.
//   node scripts/proj05-move.mjs --q='proj05=1&projlid05=1' --at=0,5,10,20 --out=DIR
// Writes DIR/move_<d>.png and DIR/move_log.json (s, Benny lateral, camera). Read-only: the game is unchanged.
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const OUT = typeof opt.out === 'string' ? opt.out : 'qa/pilot05/proj/tunnel/move';
const Q = typeof opt.q === 'string' ? opt.q : '';
const AT = (typeof opt.at === 'string' ? opt.at : '0,5,10,20').split(',').map(Number);
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5247);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = { q: Q, frames: [] };
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const s0 = (await page.evaluate(() => window.__rainbow.goto('05'))).s ?? (await page.evaluate(() => window.__rainbow.state().s));
  await page.evaluate(() => { window.__rainbow.unfreeze(); window.__rainbow.setSteer(0); });
  for (const d of AT) {
    // step the simulation until s has advanced d units past the checkpoint (60 Hz steps)
    await page.evaluate(([target]) => { const R = window.__rainbow; let k = 0; while (R.state().s < target && k++ < 4000) R.step(1); R.drawList?.(); }, [s0 + d]);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
    await page.waitForTimeout(150);
    const file = `${OUT}/move_${String(d).padStart(2, '0')}.png`;
    await page.screenshot({ path: file, timeout: 180000 });
    const st = await page.evaluate(() => window.__rainbow.state());
    log.frames.push({ file, d, s: st.s, lat: st.lat, stage: st.stage, cam: st.cam });
    console.log('d', d, '→', file, 's', st.s?.toFixed?.(2), 'stage', st.stage);
  }
} finally {
  writeFileSync(`${OUT}/move_log.json`, JSON.stringify(log, null, 1));
  await browser.close();
  await vite.close();
}
