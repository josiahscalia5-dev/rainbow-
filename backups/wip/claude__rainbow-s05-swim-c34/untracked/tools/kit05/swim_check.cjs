// swim_check.cjs — round 34 S2 (Benny's swimming + swipe controls): short frame-stepped runs with REAL CDP touch swipes on a
// 412x915 Android-portrait emulation (same device, swipe gesture and stepping as tools/marble05/viewer/final_acceptance.cjs), but
// with selectable swipe plans and the responsiveness numbers S2 must report. Frames are rendered only when asked (RENDER), so the
// logic-only runs take seconds instead of minutes.
//   NODE_PATH=$(npm root -g) bash tools/kit05/render_slot.sh node tools/kit05/swim_check.cjs <game folder> <outdir> [secs=3] [speed=1.4]
// env PLAN = fixed (the acceptance plan, 7.6 s) | rapid (L R L R reversals mid-move) | air (lane changes during a leap / dive, down
//            during a leap, up during a dive) | same (R R, L L L consecutive) | <JSON [[t, dir], ...]>
// env RENDER = "a:b" (render frames a..b-1) | "a,b,c" | unset (no screenshots)      env URLQ = extra query string (e.g. "&c_LEAN_K=0.12")
const { chromium } = require('playwright'); const { spawn, execFileSync } = require('child_process'); const fs = require('fs'); const path = require('path');
const PLANS = {
  fixed: [[0.9, 'left'], [1.6, 'left'], [2.3, 'right'], [2.9, 'up'], [3.7, 'right'], [4.3, 'right'], [4.9, 'down'], [5.6, 'left'], [6.2, 'up'], [6.9, 'left']],
  rapid: [[0.4, 'left'], [0.5, 'right'], [1.0, 'right'], [1.1, 'left'], [1.6, 'left'], [1.667, 'right'], [1.733, 'left'], [2.3, 'right'], [2.4, 'right']],
  air: [[0.3, 'up'], [0.45, 'left'], [1.2, 'down'], [1.45, 'right'], [1.8, 'up'], [2.3, 'up'], [2.5, 'down']],
  same: [[0.3, 'right'], [0.4, 'right'], [1.0, 'left'], [1.1, 'left'], [1.2, 'left'], [1.9, 'right'], [2.0, 'right']],
};
function analyze(log, errors, out, pn, fps = 30) {
  if (!log[0].sent) { const plan = PLANS[pn] || JSON.parse(pn); let pi = 0; log.forEach((f) => { f.sent = []; while (pi < plan.length && plan[pi][0] <= f.t + 1e-9) f.sent.push(plan[pi++][1]); }); }
  // ---------------- numbers ----------------
  const D = (a, f) => a.slice(1).map((x, k) => f(x) - f(a[k]));
  const dLat = D(log, (x) => x.lat), dH = D(log, (x) => x.height), dLean = D(log, (x) => x.lean), dRoll = D(log, (x) => x.benny?.rollDeg ?? 0);
  const deg = (r) => +(r * 180 / Math.PI).toFixed(2), mx = (a) => Math.max(...a.map(Math.abs));
  const per = [], swFrames = []; log.forEach((f, i) => f.sent.forEach(() => swFrames.push(i)));
  let k = 0;
  log.forEach((f, i) => f.sent.forEach((d) => {
    const nextF = swFrames.find((j) => j > i) ?? Infinity, end = Math.min(log.length, nextF, i + 24); k++;
    const prev = log[i - 1] || f, r = { swipe: d, t: f.t, frame: i, before: { lane: prev.lane, lat: prev.lat, h: prev.height, move: prev.move }, after: { lane: f.lane, move: f.move, queued: f.queued } };
    // first frame (0 = the frame stepped right after the swipe) in which Benny visibly moves the asked way beyond where his motion
    // before the swipe would have taken him (> 0.002 u = ~1 px)
    const sign = d === 'left' || d === 'down' ? -1 : 1, key = d === 'left' || d === 'right' ? 'lat' : 'height';
    const v0 = i >= 2 ? log[i - 1][key] - log[i - 2][key] : 0;
    let first = null; for (let j = i; j < end; j++) { const pred = prev[key] + v0 * (j - i + 1); if (sign * (log[j][key] - pred) > 0.002) { first = j - i; break; } }
    r.frames_to_visible_response = first;
    if (key === 'lat') {
      const tgt = f.lane * 0.22; let reach = null; for (let j = i; j < end; j++) if (Math.abs(log[j].lat - tgt) < 0.011) { reach = +((j - i + 1) / fps).toFixed(3); break; }
      r.target_lat = tgt; r.time_to_95pct_s = reach; const seg = log.slice(i, end), dirn = Math.sign(tgt - prev.lat) || sign;
      r.overshoot_beyond_target = +Math.max(0, ...seg.map((x) => (x.lat - tgt) * dirn)).toFixed(4);
      r.max_step = +Math.max(...seg.map((x, q) => Math.abs(x.lat - (q ? seg[q - 1].lat : prev.lat)))).toFixed(4);
    } else r.heights = log.slice(i, end).map((x) => +x.height.toFixed(3));
    per.push(r);
  }));
  const res = {
    plan: pn, frames: log.length, errors,
    lateral: { max_step_per_frame: +mx(dLat).toFixed(4), teleports_over_0_06: dLat.filter((v) => Math.abs(v) > 0.06).length, max_abs_lat: +mx(log.map((x) => x.lat)).toFixed(4), lanes_seen: [...new Set(log.map((x) => x.lane))] },
    bank: { max_lean_deg: deg(mx(log.map((x) => x.lean))), max_lean_change_deg_per_frame: deg(mx(dLean)), max_screen_roll_deg: +mx(log.map((x) => x.benny?.rollDeg ?? 0)).toFixed(2), max_screen_roll_change_deg_per_frame: +mx(dRoll).toFixed(2) },
    vertical: { max_step_per_frame: +mx(dH).toFixed(4), max_height: Math.max(...log.map((x) => x.height)), min_height: Math.min(...log.map((x) => x.height)) },
    swim_clock_always_advances: log.slice(2).every((x, k) => (x.fx ? x.fx.uT > log[k + 1].fx.uT : true)),
    swipes: per,
    heights: log.map((x) => +x.height.toFixed(3)), lats: log.map((x) => +x.lat.toFixed(3)), leanDeg: log.map((x) => deg(x.lean)),
  };
  fs.writeFileSync(`${out}/test_results.json`, JSON.stringify(res, null, 1));
  const { heights, lats, leanDeg, swipes, ...short } = res; console.log(JSON.stringify(short)); for (const s of swipes) console.log(JSON.stringify(s));
}
(async () => {
  if (process.env.ANALYZE) { const [, o] = process.argv.slice(2); analyze(JSON.parse(fs.readFileSync(`${o}/run_log.json`, 'utf8')), [], o, process.env.PLAN || '?'); return; }
  const [dir, out, secs = '3', speed = '1.4'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const W = 412, H = 915, fps = 30, n = Math.round(+secs * fps);
  const pn = process.env.PLAN || 'rapid', plan = PLANS[pn] || JSON.parse(pn);
  const R = process.env.RENDER || '', renderSet = new Set();
  if (R.includes(':')) { const [a, b] = R.split(':').map(Number); for (let i = a; i < b; i++) renderSet.add(i); } else if (R) R.split(',').forEach((x) => renderSet.add(+x));
  const disk = fs.readFileSync(path.join(dir, 'play3.html'), 'utf8');
  let port, srv;
  for (let tries = 0; tries < 20 && !srv; tries++) {
    port = 9500 + Math.floor(Math.random() * 99);
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
    await page.goto(`http://127.0.0.1:${port}/play3.html?w=${W}&h=${H}${process.env.URLQ || ''}`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 900000 });
    const cdp = await ctx.newCDPSession(page);
    const swipe = async (d) => {          // the acceptance harness's real finger swipe (~120 ms, lower middle of the screen)
      const x0 = W / 2, y0 = H * 0.7, L = 140, [dx, dy] = { left: [-L, 0], right: [L, 0], up: [0, -L], down: [0, L] }[d];
      const pt = (k) => [{ x: x0 + dx * k, y: y0 + dy * k, id: 1, radiusX: 8, radiusY: 8, force: 1 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(0) });
      for (const k of [0.25, 0.5, 0.75, 1]) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(k) }); await new Promise((r) => setTimeout(r, 30)); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    let pi = 0;
    for (let i = 0; i < n; i++) {
      const t = i / fps; const sw = [];
      while (pi < plan.length && plan[pi][0] <= t + 1e-9) { await swipe(plan[pi][1]); sw.push(plan[pi][1]); pi++; }
      const o = await page.evaluate(([t, dt, sp]) => { const r = window.step(t, dt, 0, sp); const s = window.state ? window.state() : {};
        return Object.assign({}, r, s, { benny: window.bennyInfo ? window.bennyInfo() : null, fx: window.swimInfo ? window.swimInfo() : null }); }, [t, i === 0 ? 0 : 1 / fps, +speed]);
      if (renderSet.has(i)) { await page.evaluate(() => window.renderNow(1)); await page.screenshot({ path: `${out}/f_${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92, timeout: 600000 }); }
      log.push({ i, t: +t.toFixed(3), ...o, sent: sw });
    }
    fs.writeFileSync(`${out}/run_log.json`, JSON.stringify(log));
    analyze(log, errors, out, pn, fps);
    if (renderSet.size > 20 && !process.env.NO_MP4) {
      try { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-start_number', String(Math.min(...renderSet)), '-i', `${out}/f_%04d.jpg`, '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2:0:0', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '21', '-movflags', '+faststart', `${out}/clip.mp4`]); } catch (e) { console.error('mp4 failed', String(e).slice(0, 200)); }
    }
  } finally { await browser.close(); srv.kill(); }
})();
