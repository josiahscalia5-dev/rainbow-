#!/usr/bin/env node
// HUD harness runner (repo root): node qa/pilot05/full_reference_match/hud/harness.mjs --out=FILE.png [--q='hud05=1']
// No WebGL, no render slot needed: a Vite dev server + one Chromium page at 864 x 1536.
import { loadPlaywright, CHROMIUM_ARGS } from '../../../../scripts/lib/pw.mjs';
const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const { createServer } = await import('vite');
const server = await createServer({ server: { port: 5291, strictPort: false, host: '127.0.0.1', hmr: false, watch: { ignored: ['**/*'] } }, logLevel: 'error' });
await server.listen();
const url = (server.resolvedUrls?.local?.[0] ?? 'http://127.0.0.1:5291/').replace(/\/$/, '');
const { chromium } = loadPlaywright();
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(`${url}/qa/pilot05/full_reference_match/hud/harness.html?${opt.q ?? 'hud05=1'}`);
  await page.waitForFunction(() => window.__hudReady === true, null, { timeout: 120000 });
  await page.waitForTimeout(150);
  await page.screenshot({ path: opt.out ?? '/tmp/claude-0/hc05/harness.png' });
  const rects = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('#hud .bar > *, #hud .banner, #hud .banner span, #hud .bar')].map((e, i) => { const r = e.getBoundingClientRect(); return [`${i}:${e.className || e.tagName}${e.dataset.k ? '[' + e.dataset.k + ']' : ''}`, [+r.left.toFixed(1), +r.top.toFixed(1), +r.right.toFixed(1), +r.bottom.toFixed(1)]]; })));
  console.log(JSON.stringify(rects));
  if (errs.length) console.log('ERRORS', errs);
} finally { await browser.close(); await server.close(); }
