#!/usr/bin/env node
// Screen 05 projection test — MOVING CAMERA (2026-11-16). Starts at the locked 05 checkpoint and rides forward with
// the real game simulation (Benny + camera rig + course unchanged), capturing full-size frames.
//   node scripts/proj05-move.mjs --q='proj05=1' --out=DIR [--d=0,1,2,4,8,16,30,50] [--clip=SECONDS --fps=24]
// --d: distances ahead of the checkpoint (units of s) → DIR/move_<d>.png (shader clock frozen at 12: shows layout only)
// --clip: a riding clip with the shader clock running (flow animation) → DIR/clip/0000.png … (encode with ffmpeg)
// --still=SECONDS: water animation at the LOCKED camera (clock runs, camera still) → DIR/still/0000.png …
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';
const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const Q = typeof opt.q === 'string' ? opt.q : '';
const OUT = typeof opt.out === 'string' ? opt.out : 'qa/pilot05/proj/move';
const D = typeof opt.d === 'string' ? opt.d.split(',').map(Number) : [];
const fps = Number(opt.fps ?? 24);
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5241);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = { q: Q, frames: [] };
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const shot = async (file, extra) => {
    await page.evaluate(() => window.__rainbow.drawList());
    await page.screenshot({ path: file });
    const st = await page.evaluate(() => window.__rainbow.state());
    log.frames.push({ file, ...extra, s: st.s, cam: st.cam, lat: st.lat });
  };
  if (D.length) {
    await page.evaluate(() => window.__rainbow.goto('05'));
    const s0 = (await page.evaluate(() => window.__rainbow.state())).s;
    for (const d of D) {
      // ride with the real simulation until s >= s0 + d (shader clock stays frozen: only the camera moves)
      await page.evaluate(([target]) => { const R = window.__rainbow; let k = 0; while (R.state().s < target && k++ < 20000) R.step(1, 1 / 60); }, [s0 + d]);
      await shot(`${OUT}/move_${String(d).padStart(2, '0')}.png`, { d });
      console.log('move', d, JSON.stringify(log.frames.at(-1)));
    }
  }
  if (opt.still) {
    mkdirSync(`${OUT}/still`, { recursive: true });
    const n = Math.round(Number(opt.still) * fps);
    await page.evaluate(() => window.__rainbow.goto('05'));
    for (let i = 0; i < n; i++) {
      await page.evaluate(([t]) => { const R = window.__rainbow; R.freezeAt(t); R.step(1, 0); }, [12 + i / fps]);
      await shot(`${OUT}/still/${String(i).padStart(4, '0')}.png`, { t: 12 + i / fps });
    }
    console.log('still frames', n);
  }
  if (opt.clip) {
    mkdirSync(`${OUT}/clip`, { recursive: true });
    const n = Math.round(Number(opt.clip) * fps);
    await page.evaluate(() => window.__rainbow.goto('05'));
    for (let i = 0; i < n; i++) {
      await page.evaluate(([t, dt]) => { const R = window.__rainbow; R.freezeAt(t); R.step(Math.round(dt * 60), 1 / 60); R.freezeAt(t + dt); }, [12 + i / fps, 1 / fps]);
      await shot(`${OUT}/clip/${String(i).padStart(4, '0')}.png`, { t: 12 + (i + 1) / fps });
    }
    console.log('clip frames', n);
  }
} finally {
  writeFileSync(`${OUT}/move_log.json`, JSON.stringify(log, null, 1));
  await browser.close();
  await vite.close();
}
