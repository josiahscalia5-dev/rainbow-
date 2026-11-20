#!/usr/bin/env node
// r30 lead (copy of r23_swim.mjs): ONE uninterrupted real-gameplay clip from the Screen 06 checkpoint until `END` u past the 07
// entrance (no cuts, no teleports: every frame = 1/24 s of the real simulation; shader clock pinned to the clip clock), Benny steered
// by nobody (STEER unset) or the r29 schedule (STEER=zigzag). Writes OUT/0000.png ... + OUT/frames.json (s, stage, lat, coins per frame).
//   cd <worktree> && node tools/match06/r30_clip.mjs <outDir> "<query>" [END=20] [W=864] [H=1536]
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const { startVite } = await import(pathToFileURL(`${process.cwd()}/tools/match06/r23_vite.mjs`).href);
const [OUT, Q = '', END = '20', W = '864', H = '1536'] = process.argv.slice(2);
const fps = 24, ZIG = process.env.STEER === 'zigzag';
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5298));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const { s0, s07 } = await page.evaluate(() => { const R = window.__rainbow; R.goto('06'); return { s0: R.state().s, s07: R.course.stage('07').s0 }; });
  const sEnd = s07 + Number(END);
  for (let i = 0; i < 24 * 60; i++) {
    const st0 = log.length ? log[log.length - 1].s : s0, ph = (st0 - s0) / (s07 - s0);
    const dir = !ZIG ? null : ph < 0.3 ? null : ph < 0.5 ? -1 : ph < 0.7 ? 1 : null;
    const st = await page.evaluate(([t, dt, dir]) => { const _pn = performance.now; performance.now = () => (t + dt) * 1000; const R = window.__rainbow; R.setSteer(dir); R.freezeAt(t); R.step(Math.round(dt * 60), 1 / 60); R.freezeAt(t + dt); R.step(1, 1e-4); R.drawList(); performance.now = _pn; const s = R.state(); return { s: +s.s.toFixed(3), stage: s.stage, lat: +s.lat.toFixed(3), coins: s.coins }; }, [12 + i / fps, 1 / fps, dir]);
    await page.screenshot({ path: `${OUT}/${String(i).padStart(4, '0')}.png` });
    log.push({ i, t: +(i / fps).toFixed(3), steer: dir, ...st });
    if (i % 24 === 0) console.log('frame', i, st);
    if (st.s > sEnd) break;
  }
  console.log('frames', log.length, 's0', s0, 's07', s07);
} finally {
  writeFileSync(`${OUT}/frames.json`, JSON.stringify({ query: Q, fps, log }, null, 0));
  await browser.close(); await vite.close();
}
