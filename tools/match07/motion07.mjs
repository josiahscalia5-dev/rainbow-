// Screen 07 moving-camera test (read-only): from the 07 checkpoint ride forward / steer with the real game sim and
// screenshot what the live camera sees; plus the start of the 07→08 drop. usage: node tools/match07/motion07.mjs <outDir> [q]
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const OUT = process.argv[2]; const Q = process.argv[3] ?? 'match07=1';
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5278);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  // [name, checkpoint, forward distance (u), steer]
  const shots = [['f00_checkpoint', '07', 0, null], ['f03_forward3u', '07', 3, null], ['f06_forward6u', '07', 6, null], ['f10_forward10u', '07', 10, null],
                 ['f20_forward20u', '07', 20, null], ['s_left_steer', '07', 6, -1], ['s_right_steer', '07', 6, 1],
                 ['d0_before_drop_8u', '07a_plunge_top', -7, null], ['d1_drop_start', '07a_plunge_top', 0, null], ['d2_drop_4u', '07a_plunge_top', 4, null], ['d3_drop_mid', '07b_plunge_mid', 0, null]];
  for (const [name, cp, dist, steer] of shots) {
    const st = await page.evaluate(async ([cp, dist, steer]) => {
      const r = window.__rainbow; let k = 0;
      if (dist < 0) { r.goto('07'); const target = r.course.marks['07_plunge_top'] - 1 + dist; while (r.state().s < target && k < 4000) { r.step(1); k++; } }
      else { r.goto(cp); const s0 = r.state().s; r.setSteer(steer); while (r.state().s < s0 + dist && k < 2000) { r.step(1); k++; } r.setSteer(null); }
      r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
      return { ...r.state(), frames: k };
    }, [cp, dist, steer]);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    log.push({ name, cp, dist, steer, frames: st.frames, s: st.s, lat: st.lat, stage: st.stage, coins: st.coins }); console.log(name, 's', st.s, 'lat', st.lat, st.stage, 'coins', st.coins);
  }
} finally { writeFileSync(`${OUT}/motion.json`, JSON.stringify(log, null, 1)); await browser.close(); await vite.close?.(); }
