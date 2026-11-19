// r8 (account 8): plunge-only copy of tools/lead_r6/motion_audit.mjs (same method, plunge shots t33..t95).
// Lead r6 (2026-11-17): ONE moving-gameplay audit method for every playable screen 04–08 (read-only).
// From the screen's approved-view checkpoint it rides the real game simulation forward / steers and screenshots what
// the live camera sees, so every screen is judged with the same shots. Generalises tools/match08/motion08.mjs.
// Run from the checkout to test (vite serves the current directory):
//   node <path>/motion_audit.mjs <screen 04..08> <outDir> [query]
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [SCREEN, OUT, Q = ''] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5270 + Number(SCREEN));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
// [name, forward distance in world units from the checkpoint (or 'tN' = fraction N of the rest of the stage), steer]
const SHOTS = [
  ['t33_through_screen', 't0.33', null], ['t50_through_screen', 't0.5', null], ['t66_through_screen', 't0.66', null],
  ['t80_through_screen', 't0.8', null], ['t95_through_screen', 't0.95', null],
];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
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
