// Round 34: REAL-TIME check of play3.html?play=1 (the phone mode): Android-portrait emulation (412x915, isMobile, hasTouch), real CDP
// touch swipes sent on the wall clock while the game runs on requestAnimationFrame, then window.liveStats() (fps, slow frames,
// input -> first-frame-with-the-move latency). In this container WebGL is software-rendered (SwiftShader), so the fps here is NOT a
// phone's fps — this proves the live loop, the tap-to-start and the touch path work; the phone's own numbers come from its meter.
// node live_check.cjs <game folder> <out.json> [seconds=8] [query]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dir, out, secs = '8', extra = ''] = process.argv.slice(2);
  const disk = fs.readFileSync(path.join(dir, 'play3.html'), 'utf8'); let port, srv;
  for (let i = 0; i < 20 && !srv; i++) { port = 9100 + Math.floor(Math.random() * 300); const s = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dir, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1000)); const got = await fetch(`http://127.0.0.1:${port}/play3.html`).then((r) => r.text()).catch(() => ''); if (got === disk) srv = s; else s.kill(); }
  if (!srv) throw new Error('no server for ' + dir);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errors = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 300))); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
    await page.goto(`http://127.0.0.1:${port}/play3.html?play=1&pr=1${extra ? '&' + extra : ''}`);
    await page.waitForFunction(() => window.ready === true && typeof window.liveStart === 'function', null, { timeout: 600000 });
    const cdp = await ctx.newCDPSession(page);
    const tap = async (x, y) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const swipe = async (dir) => { const x0 = 206, y0 = 640, d = 140, [dx, dy] = { left: [-d, 0], right: [d, 0], up: [0, -d], down: [0, d] }[dir];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: 1 }] });
      for (const k of [0.25, 0.5, 0.75, 1]) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + dx * k, y: y0 + dy * k, id: 1 }] }); await new Promise((r) => setTimeout(r, 25)); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    await tap(206, 400);   // the real "Tap to swim" tap
    const started = await page.waitForFunction(() => window.liveStats && window.liveStats().frames > 0, null, { timeout: 60000 }).then(() => true).catch(() => false);
    const plan = ['left', 'right', 'right', 'left', 'up', 'down', 'left', 'right'], t0 = Date.now(), per = (+secs * 1000) / (plan.length + 1), states = [];
    for (const d of plan) { await new Promise((r) => setTimeout(r, per)); await swipe(d); states.push(await page.evaluate(() => (window.state ? window.state() : null))); }
    await new Promise((r) => setTimeout(r, per));
    const stats = await page.evaluate(() => window.liveStats());
    await page.screenshot({ path: out.replace(/\.json$/, '.jpg'), type: 'jpeg', quality: 85 });
    const res = { started_by_tap: started, wall_seconds: (Date.now() - t0) / 1000, swipes_sent: plan.length, stats, errors,
      note: 'software WebGL in a cloud container: fps is NOT a phone measurement; checks the live loop, the tap and the touch path' };
    fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
  } finally { await browser.close(); srv.kill(); }
})();
