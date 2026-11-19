// Screen 08 swim-lane probe (read-only): Benny's world position + the live camera while riding 08 straight / steering
// hard left / right, to size the fitted pipe/arch proxies so Benny never rides into them. usage: node lane08.mjs [q]
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const Q = process.argv[2] ?? 'match08=1&coins08px=1';
const { chromium } = loadPlaywright();
const vite = await startVite(5267);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  for (const steer of [0, -1, 1]) {
    const rows = await page.evaluate((steer) => {
      const r = window.__rainbow; r.goto('08'); r.setSteer(steer); const out = [];
      for (let i = 0; i <= 120; i += 6) { const s = r.state(); const b = r.bennyScreen(); out.push([i, s.stage, s.s, s.lat, ...b.benny, ...b.cam]); r.step(6); }
      r.setSteer(null); return out;
    }, steer);
    console.log('steer', steer); for (const r of rows) console.log(r.map((v) => (typeof v === 'number' ? v.toFixed(2) : v)).join(' '));
  }
} finally { await browser.close(); await vite.close?.(); }
