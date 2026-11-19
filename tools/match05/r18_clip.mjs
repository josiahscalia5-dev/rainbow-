#!/usr/bin/env node
// Screen 05 round 18: a short REAL-GAMEPLAY swimming clip from a chosen point of Stage 05 (read-only), half size.
// Same stepping as tools/lead_r13/swim_clip.mjs (game simulation, camera rig, coins unchanged; shader clock running), but it
// first rides to <startFrac> of the stage, then: straight 0–0.25, hard left 0.25–0.6, hard right 0.6–0.85, straight.
// Frames OUT/0000.png … at <fps>; encode: ffmpeg -framerate <fps> -i OUT/%04d.png -pix_fmt yuv420p clip.mp4
//   node tools/match05/r18_clip.mjs <outDir> <startFrac 0..1> <seconds> <fps> [query] [port]
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [OUT, START = '0.6', SECS = '4', FPS = '10', Q = '', PORT = '5275'] = process.argv.slice(2);
const fps = Number(FPS);
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(PORT));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  // half size: the page renders at 432 × 768 device pixels (portrait layout unchanged)
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 0.5 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  await page.evaluate((frac) => {
    const r = window.__rainbow; r.goto('05');
    const s0 = r.state().s, stg = r.course.stage('05');
    const s1 = stg.s1 ?? (stg.s0 + (stg.length ?? 0));
    const target = s0 + frac * (s1 - s0);
    let n = 0; while (r.state().s < target - 1e-3 && n < 4000) { r.step(1); n++; }
  }, Number(START));
  const n = Math.round(Number(SECS) * fps);
  for (let i = 0; i < n; i++) {
    const ph = i / n;
    const dir = ph < 0.25 ? null : ph < 0.6 ? -1 : ph < 0.85 ? 1 : null;
    await page.evaluate(([t, dt, dir]) => { const R = window.__rainbow; R.setSteer(dir); R.freezeAt(t); R.step(Math.round(dt * 60), 1 / 60); R.freezeAt(t + dt); R.step(1, 1e-4); }, [30 + i / fps, 1 / fps, dir]);
    await page.evaluate(() => window.__rainbow.drawList());
    await page.screenshot({ path: `${OUT}/${String(i).padStart(4, '0')}.png` });
  }
  const st = await page.evaluate(() => window.__rainbow.state());
  console.log('frames', n, 'end s', st.s, 'stage', st.stage);
} finally {
  await browser.close(); await vite.close?.();
}
