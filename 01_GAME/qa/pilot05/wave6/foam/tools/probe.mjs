// QA probe (no screenshot): goto a checkpoint, dump window.__waterQA() (bubbles + foam raft rows) as JSON.
// node qa/pilot05/wave6/foam/tools/probe.mjs 05 > out.json
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../../../../scripts/lib/pw.mjs';
const id = process.argv[2] ?? '05';
const { chromium } = loadPlaywright();
const vite = await startVite(5231);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  await page.evaluate((cid) => window.__rainbow.goto(cid), id);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
  const q = await page.evaluate(() => window.__waterQA());
  console.log(JSON.stringify(q));
} finally {
  await browser.close();
  await vite.close();
}
