// Screen 05 acceptance run: the WHOLE level, uninterrupted, normal speed, driven by REAL touch swipes (CDP Input.dispatchTouchEvent)
// on an Android-portrait emulation (412x915, isMobile, hasTouch). Writes every frame, an mp4, a per-frame log and automatic checks.
// node final_acceptance.cjs <folder with play3.html> <outdir> [seconds=7.6] [speed=1.4]
const { chromium } = require('playwright'); const { spawn, execFileSync } = require('child_process'); const fs = require('fs');
(async () => {
  const [dir, out, secs = '7.6', speed = '1.4'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const W = 412, H = 915, fps = 30, n = Math.round(+secs * fps);
  const port = 8900 + Math.floor(Math.random() * 90);
  const srv = spawn('python3', ['-m', 'http.server', String(port)], { cwd: dir, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1200));
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errors = [], log = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 300)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 300)); });
    await page.goto(`http://127.0.0.1:${port}/play3.html?w=${W}&h=${H}`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 900000 });
    const cdp = await ctx.newCDPSession(page);
    const swipe = async (dir) => {          // a real finger swipe over ~120 ms in the lower middle of the screen
      const x0 = W / 2, y0 = H * 0.7, d = 140, [dx, dy] = { left: [-d, 0], right: [d, 0], up: [0, -d], down: [0, d] }[dir];
      const pt = (k) => [{ x: x0 + dx * k, y: y0 + dy * k, id: 1, radiusX: 8, radiusY: 8, force: 1 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(0) });
      for (const k of [0.25, 0.5, 0.75, 1]) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(k) }); await new Promise((r) => setTimeout(r, 30)); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    // the player's inputs over the level (seconds): repeated left / right, leaps and dives
    const plan = [[0.9, 'left'], [1.6, 'left'], [2.3, 'right'], [2.9, 'up'], [3.7, 'right'], [4.3, 'right'], [4.9, 'down'], [5.6, 'left'], [6.2, 'up'], [6.9, 'left']];
    let pi = 0;
    for (let i = 0; i < n; i++) {
      const t = i / fps;
      while (pi < plan.length && plan[pi][0] <= t) { await swipe(plan[pi][1]); log.push({ swipe: plan[pi][1], t: +t.toFixed(3) }); pi++; }
      const o = await page.evaluate(([t, dt, sp]) => { const r = window.step(t, dt, 0, sp); return Object.assign({}, r, window.state ? window.state() : {}); }, [t, i === 0 ? 0 : 1 / fps, +speed]);
      const cam = await page.evaluate(() => (window.camInfo ? window.camInfo() : null));
      await page.evaluate(() => window.renderNow(1));
      await page.screenshot({ path: `${out}/f_${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92, timeout: 600000 });
      log.push({ i, t: +t.toFixed(3), ...o, cam });
      if (i % 10 === 0) { console.log('frame', i, '/', n, JSON.stringify(o), new Date().toISOString().slice(11, 19)); fs.writeFileSync(`${out}/run_log.json`, JSON.stringify(log)); }
    }
    fs.writeFileSync(`${out}/run_log.json`, JSON.stringify(log, null, 1));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', `${out}/f_%04d.jpg`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', `${out}/screen05_swipe_run.mp4`]);
    // automatic checks
    const fr = log.filter((x) => x.i !== undefined);
    const dS = fr.slice(1).map((x, k) => x.s - fr[k].s), dLat = fr.slice(1).map((x, k) => Math.abs((x.lat ?? 0) - (fr[k].lat ?? 0)));
    const dH = fr.slice(1).map((x, k) => Math.abs((x.height ?? 0) - (fr[k].height ?? 0)));
    const res = {
      frames: fr.length, seconds: +(fr.length / fps).toFixed(2), errors,
      forward: { min_step: Math.min(...dS), max_step: Math.max(...dS), freezes: dS.filter((v) => v <= 1e-6).length },
      lateral: { max_step_per_frame: Math.max(...dLat), teleports_over_0_06: dLat.filter((v) => v > 0.06).length, lanes_seen: [...new Set(fr.map((x) => x.lane))] },
      vertical: { max_step_per_frame: Math.max(...dH), max_height: Math.max(...fr.map((x) => x.height ?? 0)), min_height: Math.min(...fr.map((x) => x.height ?? 0)) },
      coins: { start: fr[0].coins, end: fr[fr.length - 1].coins },
      swipes_sent: log.filter((x) => x.swipe).length,
    };
    fs.writeFileSync(`${out}/test_results.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
  } finally { await browser.close(); srv.kill(); }
})();
