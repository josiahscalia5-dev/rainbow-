// Screen 08 r11: copy of tools/lead_r6/motion_audit.mjs (same shot positions, same simulation path) that renders only
// the shots named in M08_ONLY (comma list of name prefixes, e.g. M08_ONLY=a00,f10,t95) to keep test renders short.
// Usage: M08_ONLY=f10,t95 node tools/match08/shots08.mjs 08 <outDir> [query]
// M08_DET=1 (r15): no real-time frames before the screenshot (exactly the stepped positions, repeatable BEFORE / NEW)
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
const ALL_SHOTS = [
  ['a00_approved_view', 0, null],
  ['f03_forward3u', 3, null], ['f06_forward6u', 6, null], ['f10_forward10u', 10, null], ['f20_forward20u', 20, null],
  ['s_left_steer', 6, -1], ['s_right_steer', 6, 1], ['s_left_hard', 12, -1], ['s_right_hard', 12, 1],
  ['t33_through_screen', 't0.33', null], ['t66_through_screen', 't0.66', null], ['t95_through_screen', 't0.95', null],
];
const ONLY = (process.env.M08_ONLY ?? '').split(',').filter(Boolean);
const DET = process.env.M08_DET === '1';
const SHOTS = ONLY.length ? ALL_SHOTS.filter(([n]) => ONLY.some((o) => n.startsWith(o))) : ALL_SHOTS;
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  for (const [name, dist, steer] of SHOTS) {
    const st = await page.evaluate(async ([id, dist, steer, det]) => {
      const r = window.__rainbow; r.goto(id);
      const s0 = r.state().s;
      const stg = r.course.stage(id);
      const s1 = stg.s1 ?? (stg.s0 + (stg.length ?? 0));
      const target = typeof dist === 'string' ? s0 + Number(dist.slice(1)) * Math.max(0, s1 - s0) : s0 + dist;
      r.setSteer(steer);
      let n = 0; while (r.state().s < target - 1e-3 && n < 4000) { r.step(1); n++; }
      r.setSteer(null);
      // M08_DET=1 (r15): render the stepped state once (no real-time frames) -> BEFORE / NEW at exactly the same positions
      if (det) r.drawList();
      else { r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false); }
      return { ...r.state(), frames: n, s0, s1, target };
    }, [SCREEN, dist, steer, DET]);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    log.push({ name, dist, steer, ...st });
    console.log(SCREEN, name, 's', st.s, 'lat', st.lat, 'stage', st.stage, 'frames', st.frames);
  }
} finally {
  writeFileSync(`${OUT}/motion.json`, JSON.stringify({ screen: SCREEN, query: Q, deterministic: DET, shots: log }, null, 1));
  await browser.close(); await vite.close?.();
}
