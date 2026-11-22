// Round 42: stills of the main game (built dist/) at given ride positions, one page load, 412x915 Android portrait, SwiftShader.
//   NODE_PATH=$(npm root -g) node tools/reflock/stills_main.cjs <dist> <out dir> <s list "260.95:0,286.95:1.6"> [query] [tag]
// Each entry = s[:lat]. Writes <out>/<tag>_s<s>.jpg and <out>/<tag>_stills.json (state + Benny's on-screen box per still).
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dist, out, list, query = '', tag = 'still'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const port = 9100 + Math.floor(Math.random() * 200); const srv = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dist, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1200));
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errs = [], res = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); page.on('pageerror', (e) => errs.push(String(e).slice(0, 300)));
    await page.goto(`http://127.0.0.1:${port}/index.html?qa=1${query ? '&' + query : ''}`);
    await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 600000 });
    await page.evaluate(() => document.fonts.ready);
    for (const e of list.split(',')) {
      const [s, lat = '0'] = e.split(':').map(Number);
      await page.evaluate(([sv, lv]) => window.__rainbow.gotoS(sv, lv), [s, lat]); await page.evaluate(() => window.__rainbow.renderNow());
      const file = path.join(out, `${tag}_s${s.toFixed(1)}.jpg`); await page.screenshot({ path: file, type: 'jpeg', quality: 92 });
      res.push({ file, ...(await page.evaluate(() => ({ state: window.__rainbow.state(), benny: window.__rainbow.bennyBoxPx?.() }))) });
    }
    fs.writeFileSync(path.join(out, `${tag}_stills.json`), JSON.stringify({ query, errors: errs, stills: res }, null, 1));
    console.log(JSON.stringify({ tag, n: res.length, errors: errs.slice(0, 3) }));
  } finally { await browser.close(); srv.kill(); }
})();
