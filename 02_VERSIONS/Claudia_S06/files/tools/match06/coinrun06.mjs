// Screen 06 coin reachability probe (read-only): full 03→11 run with the gameplay test's coin-seeking policy, then list
// every coin left untaken (s / lateral / height / stage). usage: node tools/match06/coinrun06.mjs [query]
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const Q = process.argv[2] ?? 'match06=1';
const { chromium } = loadPlaywright();
const vite = await startVite(5279);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 216, height: 384 } });
  await page.goto(`${vite.url}/?qa=1&dpr=1&bloom=0&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready, null, { timeout: 240000 });
  const r = await page.evaluate(() => {
    const api = window.__rainbow, dt = 1 / 60;
    api.startRideAt('03'); api.step(1, dt);
    const c0 = api.state().coins; let steps = 0; const trace = [];
    while (steps < 60 * 120) {
      const st = api.state(); if (st.mode !== 'ride') break;
      const next = api.coinDefs().find((d) => !d.taken && d.s > st.s + 0.5 && d.s < st.s + 12);
      const want = next ? next.lat : 0;
      api.setSteer(Math.max(-1, Math.min(1, (want - st.lat) * 0.9)));
      api.step(1, dt); steps++;
      if (st.stage === '06' && steps % 6 === 0) trace.push([+st.s.toFixed(2), +st.lat.toFixed(2)]);
    }
    const defs = api.coinDefs();
    return { collected: (api.state().coins - c0) / 10, total: defs.length,
      missed: defs.map((d, i) => ({ i, ...d })).filter((d) => !d.taken).map((d) => ({ s: +d.s.toFixed(2), lat: +d.lat.toFixed(2), h: +(d.h ?? 0).toFixed(2), stage: d.stage })), trace };
  });
  console.log(JSON.stringify({ collected: r.collected, total: r.total, missed: r.missed }));
  console.log('06 trace (s, lat):', JSON.stringify(r.trace));
} finally { await browser.close(); await vite.close?.(); }
