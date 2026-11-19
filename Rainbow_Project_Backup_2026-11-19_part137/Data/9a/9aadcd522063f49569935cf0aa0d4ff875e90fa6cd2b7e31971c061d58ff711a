// r7 (2026-11-18): checkpoint captures for 0-px proofs (default build and switch sets). Run from the checkout to test.
// usage: node <path>/proof0px_r7.mjs <outDir> <port> [query]
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [OUT, PORT = '5301', Q = ''] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const IDS = ['06', '07', '07a_plunge_top', '07b_plunge_mid', '07c_plunge_bottom', '07d_entering_08', '08'];
const { chromium } = loadPlaywright(); const vite = await startVite(Number(PORT));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  for (const id of IDS) {
    await page.evaluate(async (id) => { const r = window.__rainbow; r.goto(id); r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false); }, id);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/${id}.png` });
  }
} finally { await browser.close(); await vite.close?.(); }
