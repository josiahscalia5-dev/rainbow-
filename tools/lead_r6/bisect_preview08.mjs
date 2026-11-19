// Lead r6: frozen approved-view captures of one screen under several switch combinations (one vite, one browser).
// Same frozen method as scripts/capture.mjs (goto checkpoint, one frame, fonts ready). Read-only.
// usage (from the checkout to test): node <path>/bisect_preview08.mjs <screen> <outDir> <name>=<query> [<name>=<query> ...]
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [SCREEN, OUT, ...CASES] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5290);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  for (const c of CASES) {
    const i = c.indexOf('='); const name = c.slice(0, i); const q = c.slice(i + 1);
    const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.error(name, 'pageerror', e.message));
    await page.goto(`${vite.url}/?qa=1&dpr=1&${q}`);
    await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
    const st = await page.evaluate((id) => window.__rainbow.goto(id), SCREEN);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    const cam = await page.evaluate(() => window.__rainbow.camera());
    log.push({ name, q, checkpoint: st, cam: { position: cam.position, target: cam.target, fov: cam.fov } });
    console.log(name, JSON.stringify(cam.position), JSON.stringify(cam.target), cam.fov);
    await page.close();
  }
} finally {
  writeFileSync(`${OUT}/bisect.json`, JSON.stringify(log, null, 1));
  await browser.close(); await vite.close?.();
}
