import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const { chromium } = loadPlaywright(); const vite = await startVite(5268); const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try { const page = await browser.newPage({ viewport: { width: 864, height: 1536 } });
  await page.goto(`${vite.url}/?qa=1&dpr=1&match08=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  console.log('len', await page.evaluate(() => window.__rainbow.coinDefs().length), 'end', await page.evaluate(() => window.__rainbow.state().s)); console.log(JSON.stringify(await page.evaluate(() => window.__rainbow.coinDefs().map((c, i) => [i, +c.s.toFixed(2), +c.lat.toFixed(2)]).filter((c) => c[1] > 380))));
} finally { await browser.close(); await vite.close?.(); }
