#!/usr/bin/env node
// Screenshots the water lab at every scene checkpoint into docs/vfx/ (+ stats JSON).
//   node scripts/water-lab.mjs [01 03 04 ...] [--q=low]
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite, waitDone } from './lib/pw.mjs';

const args = process.argv.slice(2);
const presets = args.filter((a) => !a.startsWith('--'));
const list = presets.length ? presets : ['01', '02', '03', '04', '05', '06', '07', '07mid', '08', '09', '10', '11'];
const qArg = (args.find((a) => a.startsWith('--q=')) ?? '--q=high').slice(4);
const extra = args.filter((a) => a.startsWith('--') && !a.startsWith('--q=')).map((a) => a.slice(2)).join('&');

const { chromium } = loadPlaywright();
const vite = await startVite(5201);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
mkdirSync('docs/vfx', { recursive: true });
const stats = {};
try {
  for (const p of list) {
    const page = await browser.newPage({ viewport: { width: 432, height: 768 } });
    page.on('console', (m) => { if (m.type() === 'error') console.error(`[${p}] ${m.text()}`); });
    await page.goto(`${vite.url}/tools/water-lab.html?preset=${p}&q=${qArg}${extra ? '&' + extra : ''}`);
    await waitDone(page, 240000);
    const out = `docs/vfx/water_${p}${qArg === 'low' ? '_low' : ''}.png`;
    await page.locator('#lab').screenshot({ path: out });
    stats[p] = await page.evaluate(() => window.__info);
    console.log(out, JSON.stringify(stats[p]));
    await page.close();
  }
} finally {
  await browser.close();
  await vite.close();
}
writeFileSync(`docs/vfx/water_stats${qArg === 'low' ? '_low' : ''}.json`, JSON.stringify(stats, null, 2));
