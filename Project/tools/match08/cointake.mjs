import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const { chromium } = loadPlaywright(); const vite = await startVite(5269); const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try { const page = await browser.newPage({ viewport: { width: 432, height: 768 } });
  await page.goto(`${vite.url}/?qa=1&dpr=1&match08=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const r = await page.evaluate(() => { const g = window.__rainbow; g.goto('07c_plunge_bottom'); let st = g.state(); const lats = {};
    for (let i = 0; i < 4000 && st.mode === 'ride'; i++) { st = g.step(1, 1 / 60); const k = Math.round(st.s); if (!(k in lats)) lats[k] = +st.lat.toFixed(2); }
    return { end: st, missed: g.coinDefs().map((c, i) => [i, +c.s.toFixed(2), +c.lat.toFixed(2), c.taken]).filter((c) => c[1] > 375 && !c[3]), lats }; });
  console.log(JSON.stringify(r.missed), 'end s', r.end.s, r.end.mode); console.log('benny lat by s', JSON.stringify(Object.fromEntries(Object.entries(r.lats).filter(([k]) => k >= 380 && k <= 432))));
} finally { await browser.close(); await vite.close?.(); }
