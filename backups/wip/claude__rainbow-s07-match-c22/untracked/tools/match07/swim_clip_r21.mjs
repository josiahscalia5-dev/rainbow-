#!/usr/bin/env node
// s07 r21: swim_clip_half.mjs that starts part-way through the stage (fraction of checkpoint → stage end), deterministic sim steps to get there.
//   node tools/match07/swim_clip_r21.mjs <screen> <outDir> <seconds> <query> <startFrac>
// Starts at the screen's checkpoint and rides the real game simulation (Benny, camera rig, course, coins unchanged) with
// the shader clock running: straight, then left, then right, then straight — one frame per 1/fps s → OUT/0000.png …
// Generalises scripts/proj05-move.mjs --zigzag. Encode: ffmpeg -framerate 24 -i OUT/%04d.png -pix_fmt yuv420p clip.mp4
//   node tools/lead_r13/swim_clip.mjs <screen 04..08> <outDir> <seconds> [query]
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [SCREEN, OUT, SECS = '6', Q = '', FR = '0'] = process.argv.slice(2);
const fps = 24;
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5277);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  await page.evaluate(([id, fr]) => { const r = window.__rainbow; r.goto(id); const s0 = r.state().s, s1 = r.course.stage(id).s1; const tS = s0 + fr * (s1 - s0); let k = 0; while (r.state().s < tS && k < 6000) { r.step(1); k++; } }, [SCREEN, Number(FR)]);
  const n = Math.round(Number(SECS) * fps);
  for (let i = 0; i < n; i++) {
    const ph = i / n;                                   // straight 0–0.3, left 0.3–0.55, right 0.55–0.8, straight
    const dir = ph < 0.3 ? null : ph < 0.55 ? -1 : ph < 0.8 ? 1 : null;
    await page.evaluate(([t, dt, dir]) => { const R = window.__rainbow; R.setSteer(dir); R.freezeAt(t); R.step(Math.round(dt * 60), 1 / 60); R.freezeAt(t + dt); R.step(1, 1e-4); }, [12 + i / fps, 1 / fps, dir]);
    await page.evaluate(() => window.__rainbow.drawList());
    await page.screenshot({ path: `${OUT}/${String(i).padStart(4, '0')}.png` });
  }
  console.log('frames', n);
} finally {
  await browser.close();
  await vite.close();
}
