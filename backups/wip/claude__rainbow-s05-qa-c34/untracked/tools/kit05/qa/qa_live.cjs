// S4 (round 34) — REAL-TIME check of play3.html?live=1 (the phone mode). Improved copy of tools/kit05/live_check.cjs (stricter):
// Android-portrait emulation (412x915, isMobile, hasTouch), the real "Tap to swim" tap, real CDP touch swipes on the wall clock.
// Adds what the old check could not see (all device-independent):
//  * the level must NOT run behind the start overlay (Benny's path position before the tap must stay 0)
//  * exactly ONE game step per displayed frame (two loops calling window.step = the game runs at double speed)
//  * game time per displayed frame never above the 1/20 s clamp; forward speed = 1.4 u per game second
//  * swipe -> first frame with the move, counted in DISPLAYED FRAMES (the ms number here is software-WebGL time, not a phone's)
//  * page / console errors, the tap, every swipe registered by the controls
// node qa_live.cjs <game folder> <out.json> [seconds=8] [extra query]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dir, out, secs = '8', extra = ''] = process.argv.slice(2);
  const disk = fs.readFileSync(path.join(dir, 'play3.html'), 'utf8'); let port, srv;
  for (let i = 0; i < 20 && !srv; i++) { port = 9800 + Math.floor(Math.random() * 190); const s = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dir, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1000)); const got = await fetch(`http://127.0.0.1:${port}/play3.html`).then((r) => r.text()).catch(() => ''); if (got === disk) srv = s; else s.kill(); }
  if (!srv) throw new Error('no server for ' + dir);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errors = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 300))); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
    await page.goto(`http://127.0.0.1:${port}/play3.html?live=1&pr=1${extra ? '&' + extra : ''}`);
    await page.waitForFunction(() => window.ready === true && typeof window.liveStart === 'function', null, { timeout: 600000 });
    // instrumentation (test side only): count window.step calls and the browser's displayed frames; remember the dt of every call
    await page.evaluate(() => {
      const Q = (window.__live = { calls: 0, ticks: 0, dts: [], callsPerTick: [], lastTickCalls: 0, sAtTick: [] });
      const orig = window.step; window.step = function (t, dt, a, b) { Q.calls++; Q.dts.push(dt); return orig.apply(this, arguments); };
      const tick = () => { Q.ticks++; Q.callsPerTick.push(Q.calls - Q.lastTickCalls); Q.lastTickCalls = Q.calls; Q.sAtTick.push(window.state ? window.state().s : null); requestAnimationFrame(tick); }; requestAnimationFrame(tick);
    });
    await new Promise((r) => setTimeout(r, 3000));
    const before = await page.evaluate(() => ({ s: window.state ? window.state().s : null, calls: window.__live.calls, ticks: window.__live.ticks }));
    const cdp = await ctx.newCDPSession(page);
    const tap = async (x, y) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const swipe = async (d) => { const x0 = 206, y0 = 640, L = 140, [dx, dy] = { left: [-L, 0], right: [L, 0], up: [0, -L], down: [0, L] }[d];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: x0, y: y0, id: 1 }] });
      for (const k of [0.25, 0.5, 0.75, 1]) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x0 + dx * k, y: y0 + dy * k, id: 1 }] }); await new Promise((r) => setTimeout(r, 25)); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    await page.evaluate(() => { window.__live.callsAtTap = window.__live.calls; window.__live.ticksAtTap = window.__live.ticks; window.__live.dtsAtTap = window.__live.dts.length; });
    await tap(206, 400);   // the real "Tap to swim" tap
    const started = await page.waitForFunction(() => window.liveStats && window.liveStats().frames > 0, null, { timeout: 60000 }).then(() => true).catch(() => false);
    const plan = ['left', 'right', 'right', 'left', 'up', 'down', 'left', 'right'], t0 = Date.now(), per = (+secs * 1000) / (plan.length + 1), sw = [];
    for (const d of plan) {
      await new Promise((r) => setTimeout(r, per));
      const a = await page.evaluate(() => ({ ticks: window.__live.ticks, st: window.state() }));
      await swipe(d);
      // frames until the move shows: lane / height starts changing in the swipe direction (polled per displayed frame, max 20 frames)
      const res = await page.evaluate(([d, a]) => new Promise((resolve) => {
        const t0 = window.__live.ticks, s0 = window.state(); let n = 0;
        const chk = () => { const s = window.state(); n = window.__live.ticks - a.ticks;
          const moved = d === 'left' ? s.lat < s0.lat - 0.004 || (s0.lane === -1 && s.lane === -1) : d === 'right' ? s.lat > s0.lat + 0.004 || (s0.lane === 1 && s.lane === 1) : d === 'up' ? s.height > 0.004 : s.height < -0.004;
          if (moved || window.__live.ticks - t0 > 20) resolve({ framesToMove: moved ? n : null, swipesSeen: s.swipes, queued: s.queued, move: s.move }); else requestAnimationFrame(chk); };
        requestAnimationFrame(chk); }), [d, a]);
      sw.push({ dir: d, ...res });
    }
    await new Promise((r) => setTimeout(r, per));
    const stats = await page.evaluate(() => window.liveStats());
    const Q = await page.evaluate(() => { const Q = window.__live; const after = Q.callsPerTick.slice(Q.ticksAtTap); const dts = Q.dts.slice(Q.dtsAtTap).filter((x) => x > 0);
      const s = window.state(); return { calls_total: Q.calls, ticks_total: Q.ticks, calls_before_tap: Q.callsAtTap, ticks_before_tap: Q.ticksAtTap,
        calls_per_tick_after_tap: { max: Math.max(...after), mean: +(after.reduce((a, b) => a + b, 0) / Math.max(1, after.length)).toFixed(3), ticks: after.length },
        game_seconds: +dts.reduce((a, b) => a + b, 0).toFixed(3), max_dt: Math.max(...dts), s_end: s.s, swipes_seen: s.swipes }; });
    await page.screenshot({ path: out.replace(/\.json$/, '.jpg'), type: 'jpeg', quality: 85 });
    const ticksAfter = Q.ticks_total - Q.ticks_before_tap, expectS = Math.min(32, Q.game_seconds / Math.max(1, Q.calls_per_tick_after_tap.mean) * 1.4);
    const checks = {
      L1_level_waits_for_tap: { pass: before.s === 0 && before.calls === 0, value: before, rule: 'before the tap: path position 0 and no game steps (the level must not run behind the start overlay)' },
      L2_tap_starts: { pass: started, value: started, rule: 'the real tap starts the live loop' },
      L3_one_step_per_frame: { pass: Q.calls_per_tick_after_tap.max <= 1 && Q.calls_per_tick_after_tap.mean <= 1.02, value: Q.calls_per_tick_after_tap, rule: 'exactly one window.step per displayed frame (2 = the game runs at double speed)' },
      L4_game_clock: { pass: Q.max_dt <= 0.0501 && Math.abs(Q.s_end - expectS) <= 0.05 + 0.02 * expectS, value: { max_dt: Q.max_dt, s_end: Q.s_end, s_expected_one_loop: +expectS.toFixed(3), game_seconds_all_calls: Q.game_seconds, displayed_frames: ticksAfter }, rule: 'dt <= 1/20 s per step; distance swum = 1.4 u per game second of ONE loop' },
      L5_every_swipe_registered: { pass: Q.swipes_seen === plan.length, value: { sent: plan.length, seen: Q.swipes_seen }, rule: 'every real touch swipe reaches the controls' },
      L6_response_frames: { pass: sw.every((x) => x.framesToMove !== null && x.framesToMove <= 2), value: sw.map((x) => `${x.dir}:${x.framesToMove}`), rule: 'the move is visible within 2 displayed frames of the swipe (device-independent; on a 60 Hz phone 2 frames = 33 ms)' },
      L7_no_errors: { pass: errors.length === 0, value: errors.slice(0, 5), rule: '0 page / console errors' },
    };
    const res = { pass: Object.values(checks).every((c) => c.pass), checks, swipes: sw, stats, wall_seconds: (Date.now() - t0) / 1000, errors,
      note: 'software WebGL (SwiftShader) in a 4-CPU cloud container: fps / ms here are NOT a phone measurement; frames-to-move, steps per frame and the clock checks are device-independent' };
    fs.writeFileSync(out, JSON.stringify(res, null, 1)); console.log(JSON.stringify({ pass: res.pass, ...Object.fromEntries(Object.entries(checks).map(([k, c]) => [k, c.pass])) }));
  } finally { await browser.close(); srv.kill(); }
})();
