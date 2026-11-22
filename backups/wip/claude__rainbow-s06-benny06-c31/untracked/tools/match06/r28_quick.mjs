// r28 s06: quick low-res copy of tools/lead23/audit06_slow.mjs (AUDIT_W / AUDIT_H, default 432x768); same shots / pinning.
// Round 21 lead audit (read-only): one playable screen of the REAL game at start / early / middle / late / end and hard
// r23 S06 copy: lead audit tool (tools/lead21/audit_screen.mjs) + Vite allowed to serve the symlinked node_modules (HUD fonts).
// left / right, deterministic (fixed sim steps, frozen shader clock, one frame rendered per shot, no real-time steps).
// Run from the worktree whose build you want to see (vite serves the current directory):
//   cd <worktree> && node /home/user/rainbow-/tools/lead21/audit_screen.mjs <outDir> <stage 04..08> "<query>"
// Shots are fractions of the stage from its checkpoint to its end; env AUDIT_SHOTS='[["name",frac,steer],...]' overrides.
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const { startVite } = await import(pathToFileURL(`${process.cwd()}/tools/match06/r23_vite.mjs`).href); // r23: fonts via symlinked node_modules
const [OUT, STAGE, Q] = process.argv.slice(2);
const SHOTS = process.env.AUDIT_SHOTS ? JSON.parse(process.env.AUDIT_SHOTS)
  : [['a_start', 0, null], ['b_early', 0.12, null], ['c_middle', 0.35, null], ['d_late', 0.6, null], ['e_end', 0.85, null],
     ['f_hard_left', 0.35, -1], ['g_hard_right', 0.35, 1]];
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5290));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: Number(process.env.AUDIT_W ?? 432), height: Number(process.env.AUDIT_H ?? 768) }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { if (m.type() === 'error' && /Shader|WebGL|rror/.test(m.text())) console.error('console', m.text().slice(0, 160)); });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  if (process.env.AUDIT_PIN) await page.evaluate((t) => { window.__pinNow = t; }, Number(process.env.AUDIT_PIN));
  for (const [name, frac, steer] of SHOTS) {
    const st = await page.evaluate(async ([stage, frac, steer]) => {
      const r = window.__rainbow;
      r.goto(stage);
      const s0 = r.state().s, s1 = r.course.stage(stage).s1;
      const tS = s0 + frac * (s1 - s0);
      r.setSteer(steer);
      let k = 0; while (r.state().s < tS && k < 6000) { r.step(1); k++; }
      r.setSteer(null);
      r.freezeAt(10);
      // r23: the 06 river shader reads the wall clock (performance.now) — pinned for the draw so BEFORE / NEW water matches
      const _pn = performance.now; if (window.__pinNow) performance.now = () => window.__pinNow; r.drawList(); performance.now = _pn;
      await new Promise((res) => requestAnimationFrame(() => res()));
      return { ...r.state(), s0, s1 };
    }, [STAGE, frac, steer]);
    await page.screenshot({ path: `${OUT}/${name}.png`, timeout: 600000 });
    log.push({ name, frac, steer, s: st.s, lat: st.lat, stage: st.stage, coins: st.coins, s0: st.s0, s1: st.s1 });
    console.log(STAGE, name, 's', st.s, 'lat', st.lat, 'stage', st.stage, 'coins', st.coins);
  }
} finally { writeFileSync(`${OUT}/shots.json`, JSON.stringify(log, null, 1)); await browser.close(); await vite.close?.(); }
