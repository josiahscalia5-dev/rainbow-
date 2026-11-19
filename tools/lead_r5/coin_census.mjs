// coin census per stage for several switch sets (read-only probe; run with cwd = a worktree root)
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(process.cwd() + '/scripts/lib/pw.mjs').href);
const { chromium } = loadPlaywright();
const vite = await startVite(5450);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const sets = JSON.parse(process.argv[2]);
const out = {};
for (const [name, q] of Object.entries(sets)) {
  const page = await browser.newPage({ viewport: { width: 216, height: 384 } });
  await page.goto(`${vite.url}/?qa=1&dpr=1${q ? '&' + q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  out[name] = await page.evaluate(() => { const R = window.__rainbow, c = {}; for (const d of R.coinDefs()) { const id = R.course.stageAtS(d.s).id; c[id] = (c[id] ?? 0) + 1; } c.total = window.__rainbow.coinDefs().length; return c; });
  console.log(name.padEnd(8), JSON.stringify(out[name]));
  await page.close();
}
await browser.close(); await vite.close?.(); process.exit(0);
