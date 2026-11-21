// live_loop_check.cjs — round 34 S2: proves that play3.html?live=1 steps the game exactly ONCE per animation frame and not before the
// "Tap to swim" tap (controls.js used to start its own requestAnimationFrame loop next to live.js: double speed + swimming behind the
// start screen). Real CDP touch tap + swipes, Android-portrait emulation, software WebGL (frame times are not a phone's).
//   NODE_PATH=$(npm root -g) bash tools/kit05/render_slot.sh node tools/kit05/live_loop_check.cjs <game folder> <out.json>
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dir, out] = process.argv.slice(2);
  const disk = fs.readFileSync(path.join(dir, 'play3.html'), 'utf8'); let port, srv;
  for (let i = 0; i < 20 && !srv; i++) { port = 9500 + Math.floor(Math.random() * 99); const s = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dir, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1000)); const got = await fetch(`http://127.0.0.1:${port}/play3.html`).then((r) => r.text()).catch(() => ''); if (got === disk) srv = s; else s.kill(); }
  if (!srv) throw new Error('no server for ' + dir);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errors = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 300))); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
    await page.goto(`http://127.0.0.1:${port}/play3.html?live=1&pr=1&w=412&h=915`);
    await page.waitForFunction(() => window.ready === true && typeof window.liveStart === 'function', null, { timeout: 600000 });
    // count every window.step call from here on
    await page.evaluate(() => { const f = window.step; window.__steps = 0; window.__dtSum = 0; window.step = (t, dt, a, b) => { window.__steps++; window.__dtSum += dt; return f(t, dt, a, b); }; });
    await new Promise((r) => setTimeout(r, 4000));
    const beforeTap = await page.evaluate(() => ({ s: window.state().s, steps: window.__steps }));
    const cdp = await ctx.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 206, y: 400, id: 1 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForFunction(() => window.liveStats && window.liveStats().frames > 0, null, { timeout: 60000 });
    const swipe = async (d) => { const x0 = 206, y0 = 640, L = 140, [dx, dy] = { left: [-L, 0], right: [L, 0], up: [0, -L], down: [0, L] }[d];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: 1 }] });
      for (const k of [0.25, 0.5, 0.75, 1]) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + dx * k, y: y0 + dy * k, id: 1 }] }); await new Promise((r) => setTimeout(r, 25)); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const states = [];
    for (const d of ['left', 'right', 'up', 'down']) { await new Promise((r) => setTimeout(r, 1500)); await swipe(d); states.push(await page.evaluate(() => ({ ...window.state(), lastSwipe: window.swimInfo ? window.swimInfo().lastSwipe : null }))); }
    await new Promise((r) => setTimeout(r, 1500));
    const end = await page.evaluate(() => ({ s: window.state().s, steps: window.__steps, dtSum: window.__dtSum, live: window.liveStats() }));
    const stepsAfterTap = end.steps - beforeTap.steps;
    const res = { before_tap: beforeTap, steps_after_tap: stepsAfterTap, live_frames: end.live.frames, steps_per_live_frame: +(stepsAfterTap / end.live.frames).toFixed(3),
      s_end: end.s, s_expected_from_dt: +(end.dtSum * 1.4).toFixed(3), swipe_states: states.map((x) => ({ lane: x.lane, move: x.move, lat: x.lat, h: x.height, last: x.lastSwipe })), live: end.live, errors,
      ok: beforeTap.steps === 0 && Math.abs(stepsAfterTap / end.live.frames - 1) < 0.05 };
    fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
  } finally { await browser.close(); srv.kill(); }
})();
