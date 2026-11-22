// Full-size (864x1536) stills of the real game at given route positions (QA clock pinned at 12.0).
// node tools/paint/stills.mjs --q=paint=1 --s=132.44,150,175 --out=DIR --tag=NEW
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const opt = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...r] = a.replace(/^--/, '').split('='); return [k, r.length ? r.join('=') : true]; }));
const ss = String(opt.s).split(',').map(Number); mkdirSync(opt.out, { recursive: true });
const { chromium } = loadPlaywright(); const vite = await startVite(5400 + Math.floor(Math.random() * 60));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1${opt.q ? '&' + opt.q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 240000 });
  await page.evaluate(() => document.fonts.ready);
  const log = [];
  for (const s of ss) {
    const st = await page.evaluate((s) => window.__rainbow.gotoS(s), s);
    await page.waitForTimeout(200);
    await page.screenshot({ path: `${opt.out}/${opt.tag}_s${s}.png` });
    log.push({ s, st });
  }
  writeFileSync(`${opt.out}/${opt.tag}_stills.json`, JSON.stringify(log, null, 1)); console.log(opt.tag, 'stills', ss.length);
} finally { await browser.close(); await vite.close(); }
