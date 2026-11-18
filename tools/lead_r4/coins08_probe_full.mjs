// Per-coin pickup check for Screen 08 under ?match08=1&coins08px=1 (real ride from 03, coin-seeking steering) and a
// no-steering ride (shows which 08 coins need the player to steer). Scratch only; run from the repo root.
import { writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '/home/user/rainbow-/scripts/lib/pw.mjs';
const OUT = process.argv[2];
const { chromium } = loadPlaywright();
const vite = await startVite(5245);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const res = {};
try {
  for (const mode of ['seek', 'straight']) {
    const page = await browser.newPage({ viewport: { width: 432, height: 768 } });
    await page.goto(`${vite.url}/?qa=1&dpr=1&bloom=0&match08=1&coins08px=1`);
    await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
    res[mode] = await page.evaluate((mode) => {
      const a = window.__rainbow, c = a.course, dt = 1 / 60;
      const s08 = c.stage('08').s0, s09 = c.stage('09').s0;
      a.startRideAt('03');
      const pick = {}; let prevTaken = a.coinDefs().map((d) => d.taken);
      for (let i = 0; i < 60 * 120; i++) {
        const st = a.state();
        if (st.mode !== 'ride') break;
        if (mode === 'seek') {
          const next = a.coinDefs().find((d) => !d.taken && d.s > st.s + 0.5 && d.s < st.s + 12);
          a.setSteer(Math.max(-1, Math.min(1, ((next ? next.lat : 0) - st.lat) * 0.9)));
        } else a.setSteer(0);
        a.step(1, dt);
        const now = a.coinDefs().map((d) => d.taken);
        now.forEach((t, k) => { if (t && !prevTaken[k]) pick[k] = { atS: +a.state().s.toFixed(2), benLat: +a.state().lat.toFixed(2) }; });
        prevTaken = now;
      }
      const defs = a.coinDefs();
      const in08 = defs.map((d, k) => ({ k, s: +d.s.toFixed(2), lat: +d.lat.toFixed(2), taken: d.taken, pickedAt: pick[k] ?? null })).filter((d) => d.s >= s08 - 0.5);
      return { coins: a.state().coins, takenTotal: defs.filter((d) => d.taken).length, total: defs.length, stage08: in08 };
    }, mode);
    await page.close();
  }
} finally {
  writeFileSync(OUT, JSON.stringify(res, null, 2));
  await browser.close();
  await vite.close();
}
for (const m of Object.keys(res)) console.log(m, 'run coins', res[m].coins, 'taken', res[m].takenTotal + '/' + res[m].total, '| 08 coins taken', res[m].stage08.filter((d) => d.taken).length + '/' + res[m].stage08.length);
