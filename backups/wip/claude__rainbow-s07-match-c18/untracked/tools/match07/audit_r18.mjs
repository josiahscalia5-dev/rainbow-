// r18: tools/match07/audit_r16.mjs + the course marks of 07 / 08 in motion.json and extra plunge shots t72 / t88.
// r16: tools/match07/audit_r15.mjs + an optional 4th argument = comma list of shot names to render (CPU is shared) and the
// page's console.info lines logged into motion.json.
// r15 (account 15): tools/lead_r6/motion_audit.mjs + the two extra plunge shots t50 / t80 of tools/match07/plunge_audit_r8.mjs (one load).
// Lead r6 (2026-11-17): ONE moving-gameplay audit method for every playable screen 04–08 (read-only).
// From the screen's approved-view checkpoint it rides the real game simulation forward / steers and screenshots what
// the live camera sees, so every screen is judged with the same shots. Generalises tools/match08/motion08.mjs.
// Run from the checkout to test (vite serves the current directory):
//   node <path>/motion_audit.mjs <screen 04..08> <outDir> [query]
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [SCREEN, OUT, Q = '', ONLY = ''] = process.argv.slice(2);
const only = ONLY ? new Set(ONLY.split(',')) : null;
const info = [];
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5270 + Number(SCREEN));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
let marks = null;
// [name, forward distance in world units from the checkpoint (or 'tN' = fraction N of the rest of the stage), steer]
const SHOTS = [
  ['a00_approved_view', 0, null],
  ['f03_forward3u', 3, null], ['f06_forward6u', 6, null], ['f10_forward10u', 10, null], ['f20_forward20u', 20, null],
  ['s_left_steer', 6, -1], ['s_right_steer', 6, 1], ['s_left_hard', 12, -1], ['s_right_hard', 12, 1],
  ['t33_through_screen', 't0.33', null], ['t50_through_screen', 't0.5', null], ['t66_through_screen', 't0.66', null], ['t72_through_screen', 't0.72', null], ['t80_through_screen', 't0.8', null], ['t88_through_screen', 't0.88', null], ['t95_through_screen', 't0.95', null],
];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { if (m.type() === 'info' || m.type() === 'error') { info.push(m.text()); if (m.type() === 'error') console.error(m.text()); } });
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  marks = await page.evaluate(() => { const m = window.__rainbow.course.marks; const o = {}; for (const k of Object.keys(m)) if (/^0[78]/.test(k)) o[k] = +m[k].toFixed(2); return o; });
  console.log('marks', JSON.stringify(marks));
  for (const [name, dist, steer] of SHOTS) {
    if (only && !only.has(name)) continue;
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
  writeFileSync(`${OUT}/motion.json`, JSON.stringify({ screen: SCREEN, query: Q, marks, shots: log, console: info.filter((t) => t.includes('m07')) }, null, 1));
  await browser.close(); await vite.close?.();
}
