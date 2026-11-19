// Screen 08 moving-camera test (read-only): from the 08 checkpoint ride forward / steer with the real game sim and
// screenshot what the live camera sees. usage: node motion08.mjs <outDir> [q]
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const OUT = process.argv[2]; const Q = process.argv[3] ?? 'match08=1';
const EXTRA = process.env.M08_SHOTS === 'full';
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5266);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { if (m.text().startsWith('m08dbg')) console.log(m.text()); });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const shots = [['f00_checkpoint', 0, null], ['f03_forward3u', 19, null], ['f06_forward6u', 38, null], ['f10_forward10u', 63, null],
                 ['f15_forward15u', 95, null], ['s_left_steer', 40, -1], ['s_right_steer', 40, 1]];
  // M08_SHOTS=full (scenery round, 2026-11-17): long hard steering both ways (Benny pressed against the side walls)
  if (EXTRA) shots.push(['s_left_hard', 80, -1], ['s_right_hard', 80, 1], ['s_right_hard6u', 38, 1], ['s_right_hard10u', 63, 1]);
  for (const [name, n, steer] of shots) {
    const st = await page.evaluate(async ([n, steer]) => {
      const r = window.__rainbow; r.goto('08'); r.setSteer(steer); const s = r.step(n); r.setSteer(null);
      r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
      return { ...r.state(), cam: r.camera?.() };
    }, [n, steer]);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    log.push({ name, frames: n, steer, s: st.s, lat: st.lat, stage: st.stage }); console.log(name, 's', st.s?.toFixed?.(2), 'lat', st.lat?.toFixed?.(2), st.stage);
  }
} finally { writeFileSync(`${OUT}/motion.json`, JSON.stringify(log, null, 1)); await browser.close(); await vite.close?.(); }
