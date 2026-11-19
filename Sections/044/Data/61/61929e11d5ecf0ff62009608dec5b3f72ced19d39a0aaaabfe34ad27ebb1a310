// Screen 06 round 16: the lead's motion-audit shots (tools/lead_r6/motion_audit.mjs, same positions), but only the named
// subset, so a visual step renders just the views it needs (CPU shared by six workers). Port 5276.
//   node tools/match06/r16_shots.mjs <outDir> "<query>" a00,f03,f10,...
// R16_DET=1: deterministic (BEFORE and NEW land on exactly the same spot): no real-time frames after the fixed-step ride,
// the page clock is frozen and the frame is drawn once (the lead's audit runs two real-time frames, which under CPU load
// moves the view by a varying 0.3-1.1 u)
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [OUT, Q = '', LIST = ''] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const ALL = [
  ['a00_approved_view', 0, null],
  ['f03_forward3u', 3, null], ['f06_forward6u', 6, null], ['f10_forward10u', 10, null], ['f20_forward20u', 20, null],
  ['s_left_steer', 6, -1], ['s_right_steer', 6, 1], ['s_left_hard', 12, -1], ['s_right_hard', 12, 1],
  ['t33_through_screen', 't0.33', null], ['t66_through_screen', 't0.66', null], ['t95_through_screen', 't0.95', null],
];
const want = LIST ? LIST.split(',') : null;
const SHOTS = want ? ALL.filter(([n]) => want.some((w) => n.startsWith(w))) : ALL;
const { chromium } = loadPlaywright();
const vite = await startVite(5276);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { const t = m.text(); if (t.includes('[match06]')) console.log(t); });
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const DET = process.env.R16_DET === '1';
  for (const [name, dist, steer] of SHOTS) {
    const st = await page.evaluate(async ([id, dist, steer, DET]) => {
      const r = window.__rainbow; r.goto(id);
      const s0 = r.state().s;
      const stg = r.course.stage(id);
      const s1 = stg.s1 ?? (stg.s0 + (stg.length ?? 0));
      const target = typeof dist === 'string' ? s0 + Number(dist.slice(1)) * Math.max(0, s1 - s0) : s0 + dist;
      r.setSteer(steer);
      let n = 0; while (r.state().s < target - 1e-3 && n < 4000) { r.step(1); n++; }
      r.setSteer(null);
      if (DET) {
        if (!window.__pnow) { window.__pnow = performance.now.bind(performance); performance.now = () => 50000; }
        r.freezeAt(12); r.drawList();
      } else { r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false); }
      return { ...r.state(), frames: n, s0, s1, target };
    }, ['06', dist, steer, DET]);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    log.push({ name, dist, steer, ...st });
    console.log(name, 's', st.s, 'lat', st.lat, 'stage', st.stage, 'frames', st.frames);
  }
} finally {
  writeFileSync(`${OUT}/motion.json`, JSON.stringify({ screen: '06', query: Q, shots: log }, null, 1));
  await browser.close(); await vite.close?.();
}
