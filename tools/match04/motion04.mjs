// Screen 04 moving-camera test (read-only): from the 04 checkpoint ride forward / steer with the real game sim and
// screenshot what the live camera sees. usage: node tools/match04/motion04.mjs <outDir> [q]
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const OUT = process.argv[2]; const Q = process.argv[3] ?? 'match04=1';
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5268);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  // [name, forward distance (u), steer]
  const shots = [['f00_checkpoint', 0, null], ['f03_forward3u', 3, null], ['f06_forward6u', 6, null], ['f10_forward10u', 10, null], ['f15_forward15u', 15, null],
                 ['f20_forward20u', 20, null], ['s_left_steer', 6, -1], ['s_right_steer', 6, 1]];
  for (const [name, dist, steer] of shots) {
    const st = await page.evaluate(async ([dist, steer]) => {
      const r = window.__rainbow; r.goto('04'); const s0 = r.state().s; r.setSteer(steer);
      let k = 0; while (r.state().s < s0 + dist && k < 2000) { r.step(1); k++; }
      r.setSteer(null);
      r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
      return { ...r.state(), frames: k };
    }, [dist, steer]);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    log.push({ name, dist, steer, frames: st.frames, s: st.s, lat: st.lat, stage: st.stage, coins: st.coins }); console.log(name, 's', st.s, 'lat', st.lat, st.stage, 'coins', st.coins);
  }
} finally { writeFileSync(`${OUT}/motion.json`, JSON.stringify(log, null, 1)); await browser.close(); await vite.close?.(); }
