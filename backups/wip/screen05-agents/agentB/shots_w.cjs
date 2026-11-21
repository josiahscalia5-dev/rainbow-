// node shots_w.cjs <outdir> ; env PAGE, QS, STILLS='[0,2.3,4.4,6.4]', W, H, PREFIX, TPAIR='[s, dt]' (extra still at the same s after dt seconds of flow)
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs');
(async () => {
  const [out] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const W = +(process.env.W ?? 540), H = +(process.env.H ?? 960), pre = process.env.PREFIX ?? 's_';
  // own server on a free port, verified to serve THIS folder (another specialist runs servers on similar ports)
  let port, srv;
  for (let tries = 0; ; tries++) {
    port = 9400 + Math.floor(Math.random() * 500);
    srv = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: __dirname, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1500));
    const ok = await fetch(`http://127.0.0.1:${port}/shots_w.cjs`).then((r) => r.text()).then((t) => t.includes('verified to serve THIS folder')).catch(() => false);
    if (ok) break; srv.kill(); if (tries > 8) throw new Error('no own server');
  }
  console.log('server', port);
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
    // a still is s, or [s, lat, rise]: Benny's lane (-0.22 / 0 / +0.22) and a camera rise like a leap (+0.12), named s_<s>_l<lat>_r<rise>
    for (const e of JSON.parse(process.env.STILLS ?? '[0,2.3,4.4,6.4]')) {
      const [s, lat, rise] = Array.isArray(e) ? e : [e, 0, 0]; const nm = Array.isArray(e) ? `${s}_l${lat}_r${rise}` : `${s}`;
      const t1 = Date.now();
      await page.evaluate(([lat, rise]) => { if (window.qaPose) window.qaPose(lat, rise); }, [lat ?? 0, rise ?? 0]);
      await page.evaluate(([s, p]) => { window.step(0, Math.max(0.3, (s - p) / 1.4), 0, (s - p) / Math.max(0.3, (s - p) / 1.4)); }, [s, prev]); prev = s;
      await page.evaluate(() => window.renderNow(3)); await page.screenshot({ path: `${out}/${pre}${nm}.png`, timeout: 600000 }); console.log('still', s, (Date.now() - t1) / 1000, 'visible splats', await page.evaluate(() => window.qaVisibleSplats ? window.qaVisibleSplats() : -1));
    }
    if (process.env.TSEQ) { // n consecutive frames dt apart at the same place: only the water flow advances (flicker check)
      const [s, n, dt] = JSON.parse(process.env.TSEQ);
      for (let i = 1; i <= n; i++) { await page.evaluate((dt) => { window.qaFlow(dt); }, dt); await page.evaluate(() => window.renderNow(3)); await page.screenshot({ path: `${out}/${pre}${s}_flow${i}.png`, timeout: 600000 }); console.log('flow frame', i); }
    }
    if (process.env.TPAIR) { // same position, flow advanced by dt seconds (speed 0 -> camera does not move)
      const [s, dt] = JSON.parse(process.env.TPAIR);
      await page.evaluate(([s, p]) => { window.step(0, (s - p) / 1.4, 0, 1.4); }, [s, prev]);
      await page.evaluate(() => window.renderNow(3)); await page.screenshot({ path: `${out}/${pre}${s}_t0.png`, timeout: 600000 });
      await page.evaluate((dt) => { window.qaFlow(dt); }, dt);
      await page.evaluate(() => window.renderNow(3)); await page.screenshot({ path: `${out}/${pre}${s}_t${dt}.png`, timeout: 600000 }); console.log('tpair done');
    }
  } finally { await browser.close(); srv.kill(); }
})();
