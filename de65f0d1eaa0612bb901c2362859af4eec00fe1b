#!/usr/bin/env node
// Runs the web bundle packed INSIDE an Android APK (assets/public) in headless Chromium + WebGL2 and captures one
// checkpoint — proves what the APK will render without a phone (no device fps: SwiftShader is a CPU rasteriser).
//   node scripts/apk-web-check.mjs builds/rainbow-debug-w12-water.apk OUT.png [checkpoint=05]
// The APK has no URL query: any Screen 05 switches must be baked in at build time (VITE_RAINBOW_Q05).
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, extname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { loadPlaywright, CHROMIUM_ARGS } from './lib/pw.mjs';

const [apk, out, id = '05'] = process.argv.slice(2);
if (!apk || !out) { console.error('usage: node scripts/apk-web-check.mjs APK OUT.png [checkpoint]'); process.exit(2); }
const dir = mkdtempSync(join(tmpdir(), 'rainbow-apk-'));
execFileSync('unzip', ['-q', resolve(apk), 'assets/public/*', '-d', dir]);
const root = join(dir, 'assets', 'public');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary', '.mp4': 'video/mp4', '.webp': 'image/webp', '.wasm': 'application/wasm', '.svg': 'image/svg+xml' };
const server = createServer((req, res) => {
  const p = decodeURIComponent((req.url ?? '/').split('?')[0]);
  const f = join(root, p === '/' ? 'index.html' : p);
  if (!f.startsWith(root) || !existsSync(f)) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(f)] ?? 'application/octet-stream' });
  res.end(readFileSync(f));
}).listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const url = `http://127.0.0.1:${server.address().port}`;
const { chromium } = loadPlaywright();
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror ' + e.message));
  await page.goto(`${url}/?qa=1&dpr=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const st = await page.evaluate((cid) => window.__rainbow.goto(cid), id);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.screenshot({ path: out, timeout: 180000 });
  const stats = await page.evaluate(() => window.__rainbow.stats());
  const res = { apk, checkpoint: id, state: st, calls: stats.calls, triangles: stats.triangles, modules: stats.modules, errors };
  writeFileSync(out.replace(/\.png$/, '.json'), JSON.stringify(res, null, 1));
  console.log(JSON.stringify(res));
} finally {
  await browser.close();
  server.close();
}
