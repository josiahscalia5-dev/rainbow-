// Capture Screen 05 from a BUILT bundle (the web app packaged inside the APK), with NO experiment switches in the URL.
// usage: node capture_dist.mjs <build_root_with_dist> <out.png>
// Mirrors scripts/capture.mjs (qa=1, dpr=1, 864x1536, __rainbow.goto, frozen time) and respects the shared render slots.
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';

const [root, out] = process.argv.slice(2);
const req = createRequire('/home/user/rainbow-/package.json');
const { preview } = await import('/home/user/rainbow-/node_modules/vite/dist/node/index.js');
const { chromium } = req('playwright');

const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
async function slot() {
  for (;;) {
    for (let i = 0; i < 2; i++) {
      const dir = `/tmp/rainbow-render-slot-${i}`;
      try { mkdirSync(dir); writeFileSync(`${dir}/pid`, String(process.pid)); const f = () => rmSync(dir, { recursive: true, force: true }); process.on('exit', f); return f; }
      catch { let pid = NaN; try { pid = Number(readFileSync(`${dir}/pid`, 'utf8')); } catch {} if (Number.isFinite(pid) && !alive(pid)) rmSync(dir, { recursive: true, force: true }); }
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
}
const free = await slot();
const server = await preview({ root, configFile: false, build: { outDir: `${root}/dist` }, preview: { port: 5281, host: '127.0.0.1', strictPort: false }, logLevel: 'error' });
const url = server.resolvedUrls.local[0].replace(/\/$/, '');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const errors = [];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('pageerror ' + e.message));
  await page.goto(`${url}/?qa=1&dpr=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const err = await page.evaluate(() => window.__error);
  if (err) throw new Error(err);
  await page.evaluate(() => window.__rainbow.goto('05'));
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  await page.screenshot({ path: out, timeout: 180000 });
  console.log('captured', out, 'console errors:', errors.length, errors.slice(0, 3));
} finally {
  await browser.close();
  server.httpServer.close();
  free();
}
process.exit(0);
