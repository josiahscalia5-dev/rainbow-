// Round 41: REAL touch steering test of the main Rainbow game (src/, the built dist/) on any ride stage — Chromium touch events
// (CDP Input.dispatchTouchEvent: touchStart -> touchMove x n -> touchEnd on the game canvas), interleaved with game frames exactly like
// a phone (one 30 fps frame per touch sample), 412x915 portrait, hasTouch. Nothing calls the internal steering functions.
//   node touch_main.cjs <dist> <out> <stage e.g. 06> [seconds=8] [plan JSON [[t, 'left'|'right'], ...]] [query]
// Writes swipes.json: per swipe the detected swipe (game input log), the requested direction, Benny's lateral position before / +0.3 s /
// +0.6 s / at the next swipe, the on-screen x of Benny and his on-screen box; frames.json (every frame) and a few screenshots.
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dist, out, stage = '06', secs = '8', planArg = '', query = ''] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const plan = planArg ? JSON.parse(planArg) : [[0.6, 'left'], [1.6, 'left'], [2.6, 'right'], [3.0, 'right'], [4.0, 'right'], [4.4, 'left'], [5.4, 'left'], [6.4, 'right']];
  const port = 9600 + Math.floor(Math.random() * 300); const srv = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dist, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1200));
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--autoplay-policy=no-user-gesture-required'] });
  const errs = [], frames = [], W = 412, H = 915, fps = 30;
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); page.on('pageerror', (e) => errs.push(String(e).slice(0, 300)));
    await page.goto(`http://127.0.0.1:${port}/index.html?qa=1${query ? '&' + query : ''}`);
    await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 600000 });
    const cp = await page.evaluate((id) => window.__rainbow.goto(id), stage); await page.evaluate(() => window.__rainbow.unfreeze());
    const cdp = await ctx.newCDPSession(page);
    const touch = (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1, radiusX: 8, radiusY: 8, force: 1 }] });
    // a swipe = 5 touch samples over ~0.17 s (finger 30 % of the screen width), one game frame per sample
    const gestures = []; for (const [t, dir] of plan) { const sx = dir === 'left' ? 0.65 * W : 0.35 * W, ex = dir === 'left' ? 0.35 * W : 0.65 * W, y = 0.62 * H, f0 = Math.round(t * fps);
      gestures.push([f0, 'touchStart', sx, y]); for (let k = 1; k <= 4; k++) gestures.push([f0 + k, 'touchMove', sx + (ex - sx) * k / 4, y + 4 * k]); gestures.push([f0 + 5, 'touchEnd', ex, y + 20]); }
    const n = Math.round(+secs * fps);
    for (let i = 0; i < n; i++) {
      for (const g of gestures.filter((g) => g[0] === i)) await touch(g[1], g[2], g[3]);
      const st = await page.evaluate(() => { window.__rainbow.step(2, 1 / 60); return { s: window.__rainbow.state(), b: window.__rainbow.bennyBoxPx?.() ?? window.__rainbow.bennyScreen(), log: (window.__rainbow.inputLog?.() ?? []).length }; });
      frames.push({ i, t: +(i / fps).toFixed(3), s: st.s.s, stage: st.s.stage, lat: st.s.lat, bx: st.b.x, box: st.b.box, log: st.log });
      if (process.env.RECORD === '1' || i % 30 === 0 || gestures.some((g) => g[0] + 9 === i)) { await page.evaluate(() => window.__rainbow.renderNow()); await page.screenshot({ path: path.join(out, `f_${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 85 }); }
    }
    const log = await page.evaluate(() => window.__rainbow.inputLog?.() ?? []);
    const at = (t) => frames[Math.min(frames.length - 1, Math.max(0, Math.round(t * fps)))];
    const swipes = plan.map(([t, dir], k) => { const b = at(t - 1 / fps), a3 = at(t + 0.3 + 5 / fps), a6 = at(t + 0.6 + 5 / fps), nx = at((plan[k + 1]?.[0] ?? t + 1) - 1 / fps);
      const moved = +(nx.lat - b.lat).toFixed(3), want = dir === 'left' ? -1 : 1;
      return { t, requested: dir, detected_by_game: log[k] ? (log[k].dir === (dir === 'left' ? -1 : 1) ? `swipe ${log[k].dir < 0 ? 'left' : 'right'} (finger ${log[k].dx} px)` : 'WRONG direction') : 'NOT detected',
        lat_before: b.lat, lat_after_0_3s: a3.lat, lat_after_0_6s: a6.lat, lat_before_next_swipe: nx.lat, moved_lateral: moved, moved_right_way: Math.sign(moved) === want && Math.abs(moved) > 0.05,
        screen_x_before: b.bx, screen_x_after: nx.bx, box_after: nx.box }; });
    const res = { stage, checkpoint: cp, errors: errs, input_log: log, swipes, ok: swipes.filter((s) => s.moved_right_way).length, of: swipes.length,
      max_lat_step_per_frame: +Math.max(...frames.slice(1).map((f, k) => Math.abs(f.lat - frames[k].lat))).toFixed(4),
      box_off_screen_frames: frames.filter((f) => f.box && (f.box[0] < 0 || f.box[2] > W || f.box[3] > H || f.box[1] < 0)).length };
    fs.writeFileSync(path.join(out, 'swipes.json'), JSON.stringify(res, null, 1)); fs.writeFileSync(path.join(out, 'frames.json'), JSON.stringify(frames));
    console.log(JSON.stringify({ stage, ok: res.ok, of: res.of, max_lat_step_per_frame: res.max_lat_step_per_frame, box_off_screen_frames: res.box_off_screen_frames, errors: errs.slice(0, 3) }));
    for (const s of swipes) console.log(JSON.stringify({ t: s.t, req: s.requested, det: s.detected_by_game, before: s.lat_before, at03: s.lat_after_0_3s, next: s.lat_before_next_swipe, ok: s.moved_right_way, x: [s.screen_x_before, s.screen_x_after] }));
  } finally { await browser.close(); srv.kill(); }
})();
