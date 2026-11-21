import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const { startVite } = await import(pathToFileURL(`${process.cwd()}/tools/match06/r23_vite.mjs`).href);
const { chromium } = loadPlaywright(); const vite = await startVite(5301); const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try { const page = await browser.newPage({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${process.argv[2]}`); await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 300000 });
  console.log(JSON.stringify(await page.evaluate(() => { const r = window.__rainbow; r.goto('06'); r.freezeAt(10); r.drawList(); return r.camera(); })));
} finally { await browser.close(); await vite.close(); }
