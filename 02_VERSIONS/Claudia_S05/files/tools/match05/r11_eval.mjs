// Screen 05 round 11 (diagnostics only): evaluate JS in the running game. Run from the checkout:
//   node tools/match05/r11_eval.mjs "<query>" "<async body using r (window.__rainbow), far (far05Debug), THREE>" [shot.png]
import { pathToFileURL } from 'node:url';
import { realpathSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [Q = '', BODY = 'return {}', SHOT = ''] = process.argv.slice(2);
const slots = Math.max(1, Number(process.env.RAINBOW_RENDER_SLOTS ?? 2));
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
let free = () => {};
outer: for (;;) {
  for (let i = 0; i < slots; i++) {
    const dir = `/tmp/rainbow-render-slot-${i}`;
    try { mkdirSync(dir); writeFileSync(`${dir}/pid`, String(process.pid)); free = () => { try { rmSync(dir, { recursive: true, force: true }); } catch {} }; process.on('exit', free); break outer; } catch {
      let pid = NaN; try { pid = Number(readFileSync(`${dir}/pid`, 'utf8')); } catch {}
      if (Number.isFinite(pid) && !alive(pid)) { try { rmSync(dir, { recursive: true, force: true }); } catch {} }
    }
  }
  await new Promise((r) => setTimeout(r, 1500));
}
const { createServer } = await import('vite');
const server = await createServer({ server: { port: 5297, strictPort: false, host: '127.0.0.1', hmr: false, watch: { ignored: ['**/*'] }, fs: { allow: [process.cwd(), realpathSync(`${process.cwd()}/node_modules`)] } }, logLevel: 'error' });
await server.listen();
const url = (server.resolvedUrls?.local?.[0]).replace(/\/$/, '');
const { chromium } = loadPlaywright();
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const out = await page.evaluate(new Function(`return (async () => { const r = window.__rainbow; const far = (await import('/src/world/far05.ts')).far05Debug; const THREE = await import('/node_modules/three/build/three.module.js'); ${BODY} })()`));
  console.log(JSON.stringify(out, null, 1));
  if (SHOT) { await page.waitForTimeout(150); await page.screenshot({ path: SHOT }); }
} finally { await browser.close(); await server.close(); free(); }
