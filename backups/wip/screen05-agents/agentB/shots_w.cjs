// node shots_w.cjs <outdir> ; env PAGE, QS, STILLS='[0,2.3,4.4,6.4]', W, H, PREFIX, TPAIR='[s, dt]' (extra still at the same s after dt seconds of flow)
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs');
(async () => {
  const [out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const W = +(process.env.W ?? 540), H = +(process.env.H ?? 960), pre = process.env.PREFIX ?? 's_';
  const port = 8900 + Math.floor(Math.random() * 90);
  const srv = spawn('python3', ['-m', 'http.server', String(port)], { cwd: __dirname, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1200));
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    page.on('pageerror', (e) => console.log('pageerror:', String(e).slice(0, 600)));
    page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('console.' + m.type() + ':', m.text().slice(0, 1500)); });
    const t0 = Date.now();
    await page.goto(`http://127.0.0.1:${port}/${process.env.PAGE ?? 'play3.html'}?w=${W}&h=${H}${process.env.QS ?? ''}`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 900000 });
    console.log('ready', (Date.now() - t0) / 1000);
    let prev = 0;
    for (const s of JSON.parse(process.env.STILLS ?? '[0,2.3,4.4,6.4]')) {
      const t1 = Date.now();
      await page.evaluate(([s, p]) => { window.step(0, (s - p) / 1.4, 0, 1.4); }, [s, prev]); prev = s;
      await page.evaluate(() => window.renderNow(3)); await page.screenshot({ path: `${out}/${pre}${s}.png`, timeout: 600000 }); console.log('still', s, (Date.now() - t1) / 1000, 'visible splats', await page.evaluate(() => window.qaVisibleSplats ? window.qaVisibleSplats() : -1));
    }
    if (process.env.TPAIR) { // same position, flow advanced by dt seconds (speed 0 -> camera does not move)
      const [s, dt] = JSON.parse(process.env.TPAIR);
      await page.evaluate(([s, p]) => { window.step(0, (s - p) / 1.4, 0, 1.4); }, [s, prev]);
      await page.evaluate(() => window.renderNow(3)); await page.screenshot({ path: `${out}/${pre}${s}_t0.png`, timeout: 600000 });
      await page.evaluate((dt) => { window.step(0, dt, 0, 0); }, dt);
      await page.evaluate(() => window.renderNow(3)); await page.screenshot({ path: `${out}/${pre}${s}_t${dt}.png`, timeout: 600000 }); console.log('tpair done');
    }
  } finally { await browser.close(); srv.kill(); }
})();
