#!/usr/bin/env node
// Screen 05 agent — how many coins of each stage lie behind each ride checkpoint (hidden as "already collected" in that
// locked view).  node tools/match05/coin_cp_count.mjs --q='match05=1&coins05tot=0'
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const optQ = (process.argv.find((a) => a.startsWith('--q=')) ?? '').slice(4);
const { chromium } = loadPlaywright();
const vite = await startVite(5234);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 432, height: 768 } });
  await page.goto(`${vite.url}/?qa=1&dpr=1&bloom=0${optQ ? '&' + optQ : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready, null, { timeout: 240000 });
  const out = {};
  for (const id of ['03', '04', '05', '06', '07', '08', '09', '10']) {
    await page.evaluate((id) => window.__rainbow.goto(id), id);
    out[id] = await page.evaluate(() => +window.__rainbow.state().s.toFixed(2));
  }
  out.coins = await page.evaluate(() => window.__rainbow.coinDefs().map((d) => +d.s.toFixed(1)));
  console.log(JSON.stringify(out));
} finally { await browser.close(); await vite.close?.(); process.exit(0); }
