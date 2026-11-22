// Round 42: capture the main game's checkpoint view of one screen (built dist/, 412x915 Android portrait, SwiftShader) for the
// approved-vs-game comparison, plus Benny's on-screen box (for the scenery mask) and the game state.
//   NODE_PATH=$(npm root -g) node tools/reflock/checkpoint_view.cjs <dist> <out dir> <stage e.g. 06> [query]
// Writes <out>/GAME_<stage>.jpg (q 95) and <out>/GAME_<stage>.json.
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dist, out, stage = '06', query = ''] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const port = 9300 + Math.floor(Math.random() * 250); const srv = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dist, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1200));
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errs = [], W = 412, H = 915;
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); page.on('pageerror', (e) => errs.push(String(e).slice(0, 300)));
    await page.goto(`http://127.0.0.1:${port}/index.html?qa=1${query ? '&' + query : ''}`);
    await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 600000 });
    const cp = await page.evaluate((id) => window.__rainbow.goto(id), stage);
    await page.evaluate(() => document.fonts.ready); await page.evaluate(() => window.__rainbow.renderNow());
    await page.waitForTimeout(300);
    const file = path.join(out, `GAME_${stage}.jpg`); await page.screenshot({ path: file, type: 'jpeg', quality: 95 });
    const info = await page.evaluate(() => ({ state: window.__rainbow.state(), benny: window.__rainbow.bennyBoxPx?.() ?? window.__rainbow.bennyScreen() }));
    fs.writeFileSync(path.join(out, `GAME_${stage}.json`), JSON.stringify({ stage, checkpoint: cp, viewport: [W, H], ...info, errors: errs }, null, 1));
    console.log(JSON.stringify({ file, box: info.benny?.box, s: info.state?.s, stage: info.state?.stage, errors: errs.slice(0, 3) }));
  } finally { await browser.close(); srv.kill(); }
})();
