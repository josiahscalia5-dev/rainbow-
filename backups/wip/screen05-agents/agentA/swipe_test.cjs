// Android-portrait swipe test for play3.html + controls.js: REAL touch swipes via CDP Input.dispatchTouchEvent on the canvas,
// deterministic 30 fps game steps between swipes, state() logged after every swipe, 6 stills rendered (SwiftShader, slow).
// usage: NODE_PATH=$(npm root -g) node swipe_test.cjs [--nostills] [--compare0]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const SW_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const W = 412, H = 915, FPS = 30, DT = 1 / FPS, SPEED = 1.4;
// timeline in frames (t = frame / 30): the 8 swipes of the brief, timed like a player would (side rows, air arcs)
const SWIPES = [[9, 'left'], [22, 'left'], [50, 'right'], [57, 'up'], [80, 'right'], [90, 'down'], [122, 'left'], [134, 'up']];
const STILLS = [[0, 'a_start_frame0'], [13, 'b_mid_lane_change_left'], [67, 'c_leap_top'], [72, 'd_after_air_coin'], [102, 'e_dive'], [118, 'f_resurface_splash']];
const END = 162;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const argv = process.argv.slice(2); const noStills = argv.includes('--nostills'), cmp0 = argv.includes('--compare0');
  if (argv.includes('--only0')) return only0();
  const out = path.join(__dirname, 'out_controls'); fs.mkdirSync(out, { recursive: true });
  const port = 8900 + Math.floor(Math.random() * 90);
  const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: __dirname, stdio: 'ignore' });
  await sleep(1200);
  const browser = await chromium.launch({ args: SW_ARGS });
  const result = { device: 'Pixel-7-like portrait 412x915, dpr 1, isMobile, hasTouch', speed: SPEED, fps: FPS, swipes: [], stills: [], checks: {}, errors: [] };
  const T0 = Date.now(); const el = () => ((Date.now() - T0) / 1000).toFixed(0) + 's';
  try {
    const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36' });
    const page = await context.newPage();
    page.on('pageerror', (e) => { result.errors.push(String(e).slice(0, 300)); console.log('pageerror:', String(e).slice(0, 300)); });
    page.on('console', (m) => { if (m.type() === 'error') { result.errors.push('console: ' + m.text().slice(0, 300)); console.log('console error:', m.text().slice(0, 300)); } });
    await page.goto(`http://127.0.0.1:${port}/play3.html?w=${W}&h=${H}`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 900000 });
    result.load_s = +((Date.now() - T0) / 1000).toFixed(1); console.log('ready', el());
    const cdp = await context.newCDPSession(page);
    const box = await page.locator('canvas').boundingBox();
    result.canvas = box;
    const cx = box.x + box.width * 0.5, cy = box.y + box.height * 0.62;

    // one real finger swipe: touchStart -> 6 touchMoves -> touchEnd over ~120 ms
    async function swipe(dir) {
      const [dx, dy] = { left: [-150, 9], right: [150, -7], up: [6, -170], down: [-5, 170] }[dir];
      const n0 = await page.evaluate(() => window.input.log.length);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: cx, y: cy, id: 7, radiusX: 9, radiusY: 9, force: 0.6 }] });
      for (let k = 1; k <= 6; k++) {
        await sleep(17);
        const e = k / 6, ease = e * (2 - e);
        await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: cx + dx * ease, y: cy + dy * ease, id: 7, radiusX: 9, radiusY: 9, force: 0.6 }] });
      }
      await sleep(17);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await page.waitForFunction((n) => window.input.log.length > n, n0, { timeout: 5000 });
      return page.evaluate(() => window.input.log[window.input.log.length - 1]);
    }
    let frame = 0;
    const stepTo = (fEnd) => page.evaluate(([f0, f1, dt, sp]) => { const rows = []; for (let f = f0 + 1; f <= f1; f++) rows.push(window.step(f * dt, dt, 0, sp)); return rows; }, [frame, fEnd, DT, SPEED]).then((rows) => { frame = fEnd; return rows; });
    async function still(name) {
      if (noStills) return;
      const t1 = Date.now(); await page.evaluate(() => window.renderNow(1));
      const file = path.join(out, `${name}.png`); await page.screenshot({ path: file });
      const st = await page.evaluate(() => window.state()); const hud = await page.evaluate(() => document.getElementById('coins').textContent);
      result.stills.push({ name, file: path.basename(file), frame, t: +(frame / FPS).toFixed(3), state: st, hud, render_s: +((Date.now() - t1) / 1000).toFixed(1) });
      console.log('still', name, 'frame', frame, el());
    }
    const allRows = [];
    const s0 = await page.evaluate(() => window.state());
    result.state0 = s0;
    const events = [...SWIPES.map(([f, d]) => ({ f, kind: 'swipe', d })), ...STILLS.map(([f, n]) => ({ f, kind: 'still', n }))].sort((a, b) => a.f - b.f || (a.kind === 'still' ? -1 : 1));
    for (const ev of events) {
      if (ev.f > frame) allRows.push(...(await stepTo(ev.f)));
      if (ev.kind === 'still') { await still(ev.n); continue; }
      const before = await page.evaluate(() => window.state());
      const ack = await swipe(ev.d);
      const after = await page.evaluate(() => window.state());
      result.swipes.push({ dir: ev.d, frame, t: +(frame / FPS).toFixed(3), source: ack.src, before, after_swipe: after });
    }
    allRows.push(...(await stepTo(END)));
    // per-swipe window summaries (from this swipe to the next one / the end)
    const rowAt = (f) => allRows[f - 1];
    for (let i = 0; i < result.swipes.length; i++) {
      const sw = result.swipes[i], f0 = Math.round(sw.t * FPS), f1 = i + 1 < result.swipes.length ? Math.round(result.swipes[i + 1].t * FPS) : END;
      const rows = allRows.slice(f0, f1);
      sw.window = { to_t: +(f1 / FPS).toFixed(3), end: rowAt(f1), maxHeight: Math.max(...rows.map((r) => r.height)), minHeight: Math.min(...rows.map((r) => r.height)),
        maxAbsLean: Math.max(...rows.map((r) => Math.abs(r.lean))), coinsGained: rowAt(f1).coins - (f0 ? rowAt(f0).coins : s0.coins) };
      console.log(sw.dir, 'src', sw.source, 't', sw.t, '-> lane', sw.window.end.lane, 'lat', sw.window.end.lat, 'maxH', sw.window.maxHeight, 'minH', sw.window.minHeight, 'coins +', sw.window.coinsGained);
    }
    // smoothness of the camera offsets and of his lateral position (max second difference per 1/30 s step)
    const d2 = (k) => { let m = 0; for (let i = 2; i < allRows.length; i++) m = Math.max(m, Math.abs(allRows[i][k] - 2 * allRows[i - 1][k] + allRows[i - 2][k])); return +m.toFixed(5); };
    result.smooth = { camLat_d2: d2('camLat'), camH_d2: d2('camH'), lat_d2: d2('lat'), maxAbsCamLat: Math.max(...allRows.map((r) => Math.abs(r.camLat))), maxCamH: Math.max(...allRows.map((r) => r.camH)), minCamH: Math.min(...allRows.map((r) => r.camH)), maxAbsLat: Math.max(...allRows.map((r) => Math.abs(r.lat))) };
    const fin = await page.evaluate(() => ({ st: window.state(), hud: document.getElementById('coins').textContent, inputLog: window.input.log }));
    result.final = fin.st; result.final_hud = fin.hud; result.input_log = fin.inputLog;
    result.rows = allRows.map((r, i) => ({ f: i + 1, s: r.s, lane: r.lane, lat: r.lat, h: r.height, lean: r.lean, pitch: r.pitch, camLat: r.camLat, camH: r.camH, coins: r.coins, move: r.move }));
    // checks
    const S = result.swipes, near = (a, b, e) => Math.abs(a - b) <= e;
    const C = result.checks;
    C.all_swipes_from_real_touch = S.every((x) => x.source === 'touch');
    C.frame0_offsets_zero = s0.lat === 0 && s0.height === 0 && s0.camLat === 0 && s0.camH === 0;
    C.left1_to_left_lane = S[0].window.end.lane === -1 && near(S[0].window.end.lat, -0.22, 0.01);
    C.left2_clamped_at_edge = S[1].window.end.lane === -1 && near(S[1].window.end.lat, -0.22, 0.01);
    C.left_lane_coins_collected = S[1].window.end.got.lane >= 3;
    C.right1_back_to_centre = S[2].window.end.lane === 0 && near(S[2].window.end.lat, 0, 0.03);
    C.up1_leap_peak = near(S[3].window.maxHeight, 0.6 * 0.99 * 0.471, 0.02) && S[3].window.end.height === 0;
    C.up1_air_coins = S[3].window.end.got.air >= 2;
    C.right2_to_right_lane = S[4].window.end.lane === 1 && near(S[4].window.end.lat, 0.22, 0.01);
    C.down_dive_depth = near(S[5].window.minHeight, -(0.8 - 0.22) * 0.99 * 0.471, 0.02) && near(S[5].window.end.height, 0, 1e-6);
    C.left3_to_centre = S[6].window.end.lane === 0 && near(S[6].window.end.lat, 0, 0.03);
    C.up2_leap_and_air_coins = S[7].window.maxHeight > 0.25 && result.final.got.air >= S[3].window.end.got.air + 2;
    C.hud_matches_counter = fin.hud.replace(/[^0-9]/g, '') === String(result.final.coins);
    C.camera_lat_clamped = result.smooth.maxAbsCamLat <= 0.12 + 1e-9;
    C.lat_inside_river = result.smooth.maxAbsLat <= 0.26;
    C.no_page_errors = result.errors.length === 0;
    console.log('checks', JSON.stringify(C));
    if (cmp0 && !noStills) {
      // frame 0 must equal the approved camera / old build: render ?controls=0 frame 0 and compare pixels with a_start_frame0.png
      const p2 = await context.newPage();
      await p2.goto(`http://127.0.0.1:${port}/play3.html?w=${W}&h=${H}&controls=0`);
      await p2.waitForFunction(() => window.ready === true, null, { timeout: 900000 });
      await p2.evaluate(() => window.renderNow(1)); await p2.screenshot({ path: path.join(out, 'a_start_frame0_controls_off.png') });
      result.compare0 = 'a_start_frame0_controls_off.png written';
    }
  } catch (e) { result.errors.push('test: ' + String(e).slice(0, 400)); console.log('ERROR', e); }
  finally {
    result.wall_s = +((Date.now() - T0) / 1000).toFixed(0);
    fs.writeFileSync(path.join(__dirname, 'swipe_log.json'), JSON.stringify(result, null, 1));
    await browser.close(); srv.kill(); console.log('done', el());
  }
})();

// --only0: frame 0 of the OLD code path (?controls=0) with the same device + render procedure -> out_controls/a_start_frame0_controls_off.png
async function only0() {
  const out = path.join(__dirname, 'out_controls'); fs.mkdirSync(out, { recursive: true });
  const port = 8900 + Math.floor(Math.random() * 90);
  const srv = spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1'], { cwd: __dirname, stdio: 'ignore' });
  await sleep(1200);
  const browser = await chromium.launch({ args: SW_ARGS });
  try {
    const context = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const page = await context.newPage();
    page.on('pageerror', (e) => console.log('pageerror:', String(e).slice(0, 300)));
    await page.goto(`http://127.0.0.1:${port}/play3.html?w=${W}&h=${H}&controls=0`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 900000 });
    await page.evaluate(() => window.renderNow(1)); await page.screenshot({ path: path.join(out, 'a_start_frame0_controls_off.png') });
    console.log('only0 written', await page.evaluate(() => typeof window.state));
  } finally { await browser.close(); srv.kill(); }
}
