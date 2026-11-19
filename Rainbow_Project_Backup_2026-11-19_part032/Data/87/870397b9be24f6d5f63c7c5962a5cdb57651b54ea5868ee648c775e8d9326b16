#!/usr/bin/env node
// benny-character-artist QA probe: load the real game once, goto(05), then for each step file evaluate its JS
// (an async function body with `R` = window.__rainbow, `Q` = R.qa3d()) and optionally screenshot.
//   node bennyprobe.mjs --q='<query>' --out=DIR step1.js [step2.js ...]   (a step whose name ends in .shot.js screenshots)
import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { basename } from 'node:path';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../../../../scripts/lib/pw.mjs';
const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.join('=')]; }));
const steps = args.filter((a) => !a.startsWith('--'));
const out = opt.out || 'qa/pilot05/full_reference_match/benny/work/probe';
mkdirSync(out, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5231);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const t0 = Date.now();
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error' || m.text().startsWith('[benny')) console.log('console:', m.text()); });
  page.on('pageerror', (e) => console.log('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1${opt.q ? '&' + opt.q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  console.log('loaded', (Date.now() - t0) / 1000);
  await page.evaluate(() => window.__rainbow.goto('05'));
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
  await page.waitForTimeout(250);
  for (const s of steps) {
    const body = readFileSync(s, 'utf8');
    const res = await page.evaluate(async (b) => { const R = window.__rainbow, Q = R.qa3d(); const f = new Function('R', 'Q', `return (async () => { ${b} })()`); return await f(R, Q); }, body);
    console.log(basename(s), JSON.stringify(res));
    if (s.endsWith('.shot.js')) {
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${out}/${basename(s, '.shot.js')}.png` });
    }
  }
} finally {
  await browser.close();
  await vite.close();
  console.log('done', (Date.now() - t0) / 1000);
}
