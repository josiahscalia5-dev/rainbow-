// Round 40 QA harness for the reference-locked section (tools/reflock/section.html), 412x915 Android portrait emulation, SwiftShader WebGL.
//   node section_run.cjs <game folder> <out> stills <s list> [lane=0] [query]      -> s<ss>_l<lane>.png + stills.json
//   node section_run.cjs <game folder> <out> run <seconds|end> [plan] [query]       -> f_00000.png ... + run_log.json + checks.json
// plan = JSON [[t, 'left'|'right'|'up'|'down'], ...] (default: steering left / right repeatedly through the whole section)
// Swipes go through window.input.swipe (the same request path as a touch swipe in controls.js). Every frame is checked:
//   * Benny's whole model box inside the frame (no character leaving the screen)
//   * camera jump: position step and view-angle step between consecutive frames
//   * with ?sentinel=1: pure-green background pixels = holes in the world (missing geometry) are counted in each frame
//   * the static world: every scenery mesh's world matrix at the end equals the one at the start (nothing follows the camera)
// Env RENDER_EVERY=n renders / saves every n-th frame only (logic still stepped every frame).
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const { PNG } = (() => { try { return require('pngjs'); } catch (e) { return {}; } })();
(async () => {
  const [dir, out, mode, arg = '0', a2 = '', a3 = ''] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const W = 412, H = 915, fps = 30, speed = 2.2;
  const disk = fs.readFileSync(path.join(dir, 'play3.html'), 'utf8'); let port, srv;
  for (let i = 0; i < 20 && !srv; i++) { port = 9300 + Math.floor(Math.random() * 600); const s = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dir, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1000)); const got = await fetch(`http://127.0.0.1:${port}/play3.html`).then((r) => r.text()).catch(() => ''); if (got === disk) srv = s; else s.kill(); }
  if (!srv) throw new Error('no server for ' + dir);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const page = await ctx.newPage(); page.on('pageerror', (e) => errs.push(String(e).slice(0, 400))); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 400)); });
    const query = mode === 'stills' ? a3 : a3;
    const t0 = Date.now();
    await page.goto(`http://127.0.0.1:${port}/play3.html?w=${W}&h=${H}${query ? '&' + query : ''}`);
    await page.waitForFunction(() => window.ready === true || window.__err, null, { timeout: 1200000 }).catch((e) => errs.push('ready timeout ' + e));
    const info = await page.evaluate(() => window.sectionInfo && window.sectionInfo());
    console.log('loaded in', ((Date.now() - t0) / 1000).toFixed(1), 's', JSON.stringify(info && { LEVEL: info.LEVEL, S_SOCK: info.S_SOCK, meshes: info.meshes, foam: info.foam, bake_ms: info.bake?._ms }));
    if (mode === 'stills') {
      const S = arg.split(',').map(Number).sort((a, b) => a - b), lane = +(a2 || 0); const res = []; let i = 0, s = 0;
      if (lane) await page.evaluate((d) => window.input.swipe(d), lane < 0 ? 'left' : 'right');
      for (const target of S) {
        while (s < target - 1e-6 || i === 0) { const o = await page.evaluate(([t, dt, sp]) => window.step(t, dt, 0, sp), [i / fps, i === 0 ? 0 : 1 / fps, speed]); s = o.s;
          if (s < target - 1e-6 && target - s < speed / fps) { /* land exactly on the target (reference views) */ await page.evaluate(([t, ds]) => window.step(t, ds / 2.2, 0, 2.2), [i / fps, target - s]); s = target; } i++; if (i > 5000) break; }
        await page.evaluate(() => window.renderNow(1));
        const f = path.join(out, `s${target.toFixed(2)}_l${lane}.png`); await page.screenshot({ path: f });
        res.push({ file: path.basename(f), target, s, cam: await page.evaluate(() => window.camInfo()), box: await page.evaluate(() => window.bennyBox()) }); console.log(f);
      }
      fs.writeFileSync(path.join(out, 'stills.json'), JSON.stringify({ errors: errs, info, stills: res }, null, 1));
    } else {
      const end = await page.evaluate(() => window.sectionInfo().LEVEL); const n = arg === 'end' ? Math.ceil(end / speed * fps) + 15 : Math.round(+arg * fps);
      const plan = a2 ? JSON.parse(a2) : [[1.0, 'left'], [2.2, 'right'], [3.4, 'right'], [4.8, 'left'], [6.2, 'left'], [7.4, 'right'], [8.6, 'right'], [9.9, 'left'], [11.2, 'left'],
        [12.4, 'right'], [13.8, 'right'], [15.0, 'left'], [16.4, 'left'], [17.6, 'right'], [18.8, 'right'], [20.0, 'left'], [21.2, 'up'], [22.4, 'left']];
      const every = +(process.env.RENDER_EVERY || 1), log = []; let pi = 0;
      // TOUCH=1: real finger gestures (CDP touchStart -> 4 touchMove -> touchEnd over 5 frames, 30 % of the screen width), not the API
      const TOUCH = process.env.TOUCH === '1', cdp = TOUCH ? await ctx.newCDPSession(page) : null, gestures = [];
      if (TOUCH) for (const [t0, dir] of plan) { const f0 = Math.round(t0 * fps), y = 0.62 * H;
        if (dir === 'left' || dir === 'right') { const sx = dir === 'left' ? 0.65 * W : 0.35 * W, ex = dir === 'left' ? 0.35 * W : 0.65 * W;
          gestures.push([f0, 'touchStart', sx, y]); for (let k = 1; k <= 4; k++) gestures.push([f0 + k, 'touchMove', sx + (ex - sx) * k / 4, y + 3 * k]); gestures.push([f0 + 5, 'touchEnd', ex, y + 15]); }
        else { const sy = dir === 'up' ? 0.7 * H : 0.5 * H, ey = dir === 'up' ? 0.5 * H : 0.7 * H;
          gestures.push([f0, 'touchStart', W / 2, sy]); for (let k = 1; k <= 4; k++) gestures.push([f0 + k, 'touchMove', W / 2 + 2 * k, sy + (ey - sy) * k / 4]); gestures.push([f0 + 5, 'touchEnd', W / 2, ey]); } }
      const audit0 = await page.evaluate(() => window.sceneAudit());
      for (let i = 0; i < n; i++) {
        const t = i / fps; const sent = [];
        if (TOUCH) { for (const g of gestures.filter((g) => g[0] === i)) await cdp.send('Input.dispatchTouchEvent', { type: g[1], touchPoints: g[1] === 'touchEnd' ? [] : [{ x: g[2], y: g[3], id: 1, radiusX: 8, radiusY: 8, force: 1 }] }); while (pi < plan.length && plan[pi][0] <= t + 1e-9) sent.push(plan[pi++][1]); }
        else while (pi < plan.length && plan[pi][0] <= t + 1e-9) { sent.push(plan[pi][1]); await page.evaluate((d) => window.input.swipe(d), plan[pi][1]); pi++; }
        const o = await page.evaluate(([t, dt, sp]) => window.step(t, dt, 0, sp), [t, i === 0 ? 0 : 1 / fps, speed]);
        const fr = { i, t: +t.toFixed(3), s: o.s, lat: o.lat, coins: o.coins, socks: o.socks, sent, box: await page.evaluate(() => window.bennyBox()), cam: await page.evaluate(() => window.camInfo()) };
        if (process.env.FRAMEQA === '1') fr.qa = await page.evaluate(() => (window.kitFrameQA ? window.kitFrameQA() : null));   // r45: camera clearance, water gap, tilt, immersion per frame
        if (i % every === 0) { await page.evaluate(() => window.renderNow(1)); const f = path.join(out, `f_${String(i).padStart(5, '0')}.png`); await page.screenshot({ path: f }); fr.file = path.basename(f);
          if (PNG && /sentinel=1/.test(query)) { const im = PNG.sync.read(fs.readFileSync(f)); let g = 0; for (let k = 0; k < im.data.length; k += 4) if (im.data[k + 1] > 235 && im.data[k] < 40 && im.data[k + 2] < 40) g++; fr.holes = g; } }
        log.push(fr); if (i % 30 === 0) console.log('frame', i, 's', o.s, 'lat', o.lat, 'coins', o.coins, 'socks', o.socks);
      }
      const audit1 = await page.evaluate(() => window.sceneAudit());
      const inLog = await page.evaluate(() => (window.input?.log ?? []).map((e) => ({ ...e })));
      const moved = audit0.filter((a, k) => JSON.stringify(a.m) !== JSON.stringify(audit1[k]?.m)).map((a) => a.name);
      const off = log.filter((f) => f.box.x0 < 0 || f.box.x1 > W || f.box.y0 < 0 || f.box.y1 > H).map((f) => f.i);
      const camStep = log.slice(1).map((f, k) => Math.hypot(...f.cam.p.map((x, j) => x - log[k].cam.p[j])));
      const angStep = log.slice(1).map((f, k) => { const a = f.cam.q, b = log[k].cam.q; const d = Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]); return 2 * Math.acos(Math.min(1, d)) * 180 / Math.PI; });
      const holes = log.filter((f) => f.holes != null);
      const checks = { frames: n, errors: errs, benny_offscreen_frames: off.length, benny_offscreen_list: off.slice(0, 20),
        camera_max_step_u: +Math.max(...camStep).toFixed(4), camera_max_step_expected_u: +(speed / fps * 1.6).toFixed(4), camera_max_turn_deg_per_frame: +Math.max(...angStep).toFixed(3),
        static_world_meshes: audit0.length, scenery_meshes_moved: moved, hole_pixels_max: holes.length ? Math.max(...holes.map((f) => f.holes)) : null, hole_frames: holes.filter((f) => f.holes > 0).length, holes_checked_frames: holes.length,
        ...(process.env.FRAMEQA === '1' ? (() => { const Q = log.map((f) => f.qa).filter(Boolean), v = (k) => Q.map((x) => x[k]).filter((x) => x !== null && x !== undefined), hgt = log.map((f) => f.box.y1 - f.box.y0);
          return { frame_qa: { camera_clearance_min_u: Math.min(...v('camClear')), water_gap_abs_max_u: Math.max(...v('waterGap').map(Math.abs)), frames_without_water_under_benny: Q.filter((x) => x.waterGap === null).length,
            immersion_min: Math.min(...v('submerged')), immersion_max: Math.max(...v('submerged')), benny_tilt_vs_surface_max_deg: Math.max(...v('bennyTiltVsSurfaceDeg')), bank_max_deg: Math.max(...v('bank').map(Math.abs)),
            benny_height_px_min: Math.min(...hgt), benny_height_px_max: Math.max(...hgt) } }; })() : {}),
        swipes_sent: plan.filter((p) => p[0] < n / fps).length, input_mode: TOUCH ? 'real CDP touch gestures' : 'window.input.swipe (API)', input_log: inLog, coins_end: log[log.length - 1].coins, socks_end: log[log.length - 1].socks, s_end: log[log.length - 1].s,
        lat_range: [Math.min(...log.map((f) => f.lat)), Math.max(...log.map((f) => f.lat))] };
      fs.writeFileSync(path.join(out, 'run_log.json'), JSON.stringify(log)); fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify(checks, null, 1)); console.log(JSON.stringify(checks));
    }
    if (errs.length) console.log('ERRORS', errs.slice(0, 6));
  } finally { await browser.close(); srv.kill(); }
})();
