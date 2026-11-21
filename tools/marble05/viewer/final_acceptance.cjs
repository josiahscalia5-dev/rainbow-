// Screen 05 acceptance run: the WHOLE level, uninterrupted, normal speed, driven by REAL touch swipes (CDP Input.dispatchTouchEvent)
// on an Android-portrait emulation (412x915, isMobile, hasTouch). Writes every frame, an mp4, a per-frame log and automatic checks.
// node final_acceptance.cjs <folder with play3.html> <outdir> [seconds=7.6] [speed=1.4]
// env FRAMES=a:b  render (screenshot) only frames a..b-1 (the whole level is still PLAYED with the same real swipes, so the state is
//                 identical; used to split one run over several browsers or to resume an interrupted run — see SKIP_EXISTING)
// env SKIP_EXISTING=1  do not re-render frames whose f_NNNN.jpg already exists (resume)
// env NO_MP4=1  skip the mp4 (the lead joins split runs afterwards)
// Round 32 (lead, 2026-11-21): server bound to 127.0.0.1 and VERIFIED to serve <folder> (byte-compares play3.html; a busy port once
// made a browser silently load another specialist's folder), camera pose per frame (window.camInfo), per-swipe response check.
const { chromium } = require('playwright'); const { spawn, execFileSync } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dir, out, secs = '7.6', speed = '1.4'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const W = 412, H = 915, fps = 30, n = Math.round(+secs * fps);
  const [fa, fb] = (process.env.FRAMES || `0:${n}`).split(':').map(Number), skipExisting = !!process.env.SKIP_EXISTING;
  const disk = fs.readFileSync(path.join(dir, 'play3.html'), 'utf8');
  let port, srv;
  for (let tries = 0; tries < 20 && !srv; tries++) {
    port = 8900 + Math.floor(Math.random() * 90);
    const s = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dir, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1200));
    const served = await fetch(`http://127.0.0.1:${port}/play3.html`).then((r) => r.text()).catch(() => '');
    if (served === disk) srv = s; else s.kill();
  }
  if (!srv) throw new Error('could not start a server that verifiably serves ' + dir);
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
      const file = `${out}/f_${String(i).padStart(4, '0')}.jpg`;
      if (i >= fa && i < fb && !(skipExisting && fs.existsSync(file))) {
        await page.evaluate(() => window.renderNow(1));
        await page.screenshot({ path: file, type: 'jpeg', quality: 92, timeout: 600000 });
      }
      log.push({ i, t: +t.toFixed(3), ...o, cam });
      if (i % 10 === 0) { console.log('frame', i, '/', n, JSON.stringify(o), new Date().toISOString().slice(11, 19)); fs.writeFileSync(`${out}/run_log.json`, JSON.stringify(log)); }
    }
    fs.writeFileSync(`${out}/run_log.json`, JSON.stringify(log, null, 1));
    if (!process.env.NO_MP4) execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', `${out}/f_%04d.jpg`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', `${out}/screen05_swipe_run.mp4`]);
    // automatic checks
    const fr = log.filter((x) => x.i !== undefined);
    const dS = fr.slice(1).map((x, k) => x.s - fr[k].s), dLat = fr.slice(1).map((x, k) => Math.abs((x.lat ?? 0) - (fr[k].lat ?? 0)));
    const dH = fr.slice(1).map((x, k) => Math.abs((x.height ?? 0) - (fr[k].height ?? 0)));
    const camFr = fr.filter((x) => x.cam), dCam = camFr.slice(1).map((x, k) => Math.hypot(...x.cam.p.map((v, j) => v - camFr[k].cam.p[j])));
    const dAng = camFr.slice(1).map((x, k) => { const a = x.cam.q, b = camFr[k].cam.q; const d = Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]); return 2 * Math.acos(Math.min(1, d)) * 180 / Math.PI; });
    // per-swipe response: what the player asked for vs what Benny did in the following window
    const swipes = log.filter((x) => x.swipe), responses = [];
    let lane = fr[0].lane ?? 0;
    for (const [k, sw] of swipes.entries()) {
      // window: from the swipe until the next swipe is sent (exclusive; the next swipe is applied in the frame it is sent) or 0.7 s
      const tEnd = Math.min(k + 1 < swipes.length ? swipes[k + 1].t - 1e-6 : 1e9, sw.t + 0.7);
      const win = fr.filter((x) => x.t >= sw.t - 1e-6 && x.t <= tEnd), before = fr.filter((x) => x.t < sw.t - 1e-6).pop();
      const r = { swipe: sw.swipe, t: sw.t };
      if (sw.swipe === 'left' || sw.swipe === 'right') {
        const want = Math.max(-1, Math.min(1, lane + (sw.swipe === 'left' ? -1 : 1)));
        r.expected_lane = want; r.lane_before = before?.lane; r.lane_after = win.length ? win[win.length - 1].lane : null;
        r.at_edge = want === lane; r.ok = r.lane_after === want; lane = want;
      } else {
        const hs = win.map((x) => x.height ?? 0); r.max_height = Math.max(...hs); r.min_height = Math.min(...hs);
        r.ok = sw.swipe === 'up' ? r.max_height > 0.15 : r.min_height < -0.15;
      }
      responses.push(r);
    }
    const res = {
      frames: fr.length, seconds: +(fr.length / fps).toFixed(2), errors, rendered: `${fa}:${fb}`,
      forward: { min_step: Math.min(...dS), max_step: Math.max(...dS), freezes: dS.filter((v) => v <= 1e-6).length, s_end: fr[fr.length - 1].s },
      lateral: { max_step_per_frame: Math.max(...dLat), teleports_over_0_06: dLat.filter((v) => v > 0.06).length, lanes_seen: [...new Set(fr.map((x) => x.lane))], max_abs_lat: Math.max(...fr.map((x) => Math.abs(x.lat ?? 0))) },
      vertical: { max_step_per_frame: Math.max(...dH), max_height: Math.max(...fr.map((x) => x.height ?? 0)), min_height: Math.min(...fr.map((x) => x.height ?? 0)) },
      camera: camFr.length ? { frames: camFr.length, max_move_per_frame: Math.max(...dCam), median_move_per_frame: dCam.slice().sort((a, b) => a - b)[dCam.length >> 1], max_turn_deg_per_frame: Math.max(...dAng) } : null,
      coins: { start: fr[0].coins, end: fr[fr.length - 1].coins, got: fr[fr.length - 1].got ?? null },
      swipes_sent: swipes.length, swipe_responses: responses, swipes_ok: responses.filter((r) => r.ok).length,
    };
    fs.writeFileSync(`${out}/test_results.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
  } finally { await browser.close(); srv.kill(); }
})();
