#!/usr/bin/env node
// Screen 05 agent — coin audit: per-stage coin counts and the coins the gameplay test's coin-seeking policy misses
// (same policy as scripts/gameplay-test.mjs).  node tools/match05/coin_audit.mjs --q='match05=1'
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const optQ = (process.argv.find((a) => a.startsWith('--q=')) ?? '').slice(4);
const { chromium } = loadPlaywright();
const vite = await startVite(5233);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 432, height: 768 } });
  await page.goto(`${vite.url}/?qa=1&dpr=1&bloom=0${optQ ? '&' + optQ : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready, null, { timeout: 240000 });
  const r = await page.evaluate(() => {
    const api = window.__rainbow; const dt = 1 / 60;
    api.startRideAt('03'); api.step(1, dt);
    const c0 = api.state().coins; let n = 0;
    while (n++ < 60 * 120) {
      const st = api.state(); if (st.mode !== 'ride') break;
      const next = api.coinDefs().find((d) => !d.taken && d.s > st.s + 0.5 && d.s < st.s + 12);
      api.setSteer(Math.max(-1, Math.min(1, ((next ? next.lat : 0) - st.lat) * 0.9)));
      api.step(1, dt);
    }
    const defs = api.coinDefs(); const per = {};
    for (const d of defs) per[d.stage] = (per[d.stage] ?? 0) + 1;
    return { total: defs.length, perStage: per, collected: (api.state().coins - c0) / 10,
      missed: defs.filter((d) => !d.taken).map((d) => ({ stage: d.stage, s: +d.s.toFixed(2), lat: +d.lat.toFixed(2) })) };
  });
  console.log(JSON.stringify(r));
} finally { await browser.close(); await vite.close?.(); process.exit(0); }
