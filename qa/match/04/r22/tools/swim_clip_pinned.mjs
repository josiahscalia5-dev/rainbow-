#!/usr/bin/env node
// r22 S04 copy of tools/lead_r13/swim_clip.mjs: port AUDIT_PORT (default 5273) and performance.now() pinned to the clip clock
// while each frame is stepped and drawn (the Screen 04 river shader reads the wall clock), so BEFORE / NEW clips match.
// Lead r13 (2026-11-18): a short REAL-GAMEPLAY swimming clip for any playable screen 04–08 (read-only).
// Starts at the screen's checkpoint and rides the real game simulation (Benny, camera rig, course, coins unchanged) with
// the shader clock running: straight, then left, then right, then straight — one frame per 1/fps s → OUT/0000.png …
// Generalises scripts/proj05-move.mjs --zigzag. Encode: ffmpeg -framerate 24 -i OUT/%04d.png -pix_fmt yuv420p clip.mp4
//   node tools/lead_r13/swim_clip.mjs <screen 04..08> <outDir> <seconds> [query]
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [SCREEN, OUT, SECS = '6', Q = ''] = process.argv.slice(2);
const fps = 24;
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5273));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  await page.evaluate((id) => window.__rainbow.goto(id), SCREEN);
  const n = Math.round(Number(SECS) * fps);
  for (let i = 0; i < n; i++) {
    const ph = i / n;                                   // straight 0–0.3, left 0.3–0.55, right 0.55–0.8, straight
    const dir = ph < 0.3 ? null : ph < 0.55 ? -1 : ph < 0.8 ? 1 : null;
    await page.evaluate(([t, dt, dir]) => { const _pn = performance.now; performance.now = () => (t + dt) * 1000; const R = window.__rainbow; R.setSteer(dir); R.freezeAt(t); R.step(Math.round(dt * 60), 1 / 60); R.freezeAt(t + dt); R.step(1, 1e-4); window.__rainbow.drawList(); performance.now = _pn; }, [12 + i / fps, 1 / fps, dir]);
    await page.screenshot({ path: `${OUT}/${String(i).padStart(4, '0')}.png` });
  }
  console.log('frames', n);
} finally {
  await browser.close();
  await vite.close();
}
