// Screen 04 r8: the lead's moving audit (tools/lead_r6/motion_audit.mjs) with a selectable SHOTS subset, so a step can be
// rendered only at the 2–4 audit positions where it shows best (same shot names as qa/match/04/r8/BEFORE/).
//   node tools/match04/audit04.mjs <outDir> "<query>" [shot1,shot2,...]   (no list = all 12)
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [OUT, Q = '', PICK = ''] = process.argv.slice(2);
const SCREEN = '04';
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5274);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
const ALL = [
  ['a00_approved_view', 0, null],
  ['f03_forward3u', 3, null], ['f06_forward6u', 6, null], ['f10_forward10u', 10, null], ['f20_forward20u', 20, null],
  ['s_left_steer', 6, -1], ['s_right_steer', 6, 1], ['s_left_hard', 12, -1], ['s_right_hard', 12, 1],
  ['t33_through_screen', 't0.33', null], ['t66_through_screen', 't0.66', null], ['t95_through_screen', 't0.95', null],
];
const want = PICK ? PICK.split(',') : null;
const SHOTS = want ? ALL.filter(([n]) => want.includes(n)) : ALL;
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { if (m.type() === 'error' || m.text().includes('[match04]')) console.log('console', m.text()); });
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  for (const [name, dist, steer] of SHOTS) {
    const st = await page.evaluate(async ([id, dist, steer]) => {
      const r = window.__rainbow; r.goto(id);
      const s0 = r.state().s;
      const stg = r.course.stage(id);
      const s1 = stg.s1 ?? (stg.s0 + (stg.length ?? 0));
      const target = typeof dist === 'string' ? s0 + Number(dist.slice(1)) * Math.max(0, s1 - s0) : s0 + dist;
      r.setSteer(steer);
      let n = 0; while (r.state().s < target - 1e-3 && n < 4000) { r.step(1); n++; }
      r.setSteer(null);
      r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
      return { ...r.state(), frames: n, s0, s1, target };
    }, [SCREEN, dist, steer]);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    log.push({ name, dist, steer, ...st });
    console.log(SCREEN, name, 's', st.s, 'lat', st.lat, 'stage', st.stage, 'frames', st.frames);
  }
} finally {
  writeFileSync(`${OUT}/motion.json`, JSON.stringify({ screen: SCREEN, query: Q, shots: log }, null, 1));
  await browser.close(); await vite.close?.();
}
