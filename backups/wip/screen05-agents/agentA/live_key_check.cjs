// Quick check of the optional real-time loop (?live=1) and the keyboard path (ArrowLeft / KeyW). Small canvas to keep SwiftShader cheap.
// usage: NODE_PATH=$(npm root -g) node live_key_check.cjs
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const port = 8900 + Math.floor(Math.random() * 90);
  const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: __dirname, stdio: 'ignore' });
  await sleep(1200);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const res = {};
  try {
    const page = await browser.newPage({ viewport: { width: 206, height: 458 } });
    page.on('pageerror', (e) => { res.pageerror = String(e).slice(0, 200); });
    await page.goto(`http://127.0.0.1:${port}/play3.html?w=206&h=458&live=1`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 600000 });
    res.s_at_ready = (await page.evaluate(() => window.state())).s;
    await page.keyboard.press('ArrowLeft');
    await page.waitForFunction(() => window.state().s > 0.25, null, { timeout: 300000 });
    res.after_left = await page.evaluate(() => window.state());
    await page.keyboard.press('KeyW');
    await page.waitForFunction(() => window.state().move === 'leap' || window.state().height > 0, null, { timeout: 300000 });
    res.after_w = await page.evaluate(() => window.state());
    res.keyLog = await page.evaluate(() => window.input.log);
  } catch (e) { res.error = String(e).slice(0, 300); }
  finally { fs.writeFileSync(path.join(__dirname, 'live_key_check.json'), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res)); await browser.close(); srv.kill(); }
})();
