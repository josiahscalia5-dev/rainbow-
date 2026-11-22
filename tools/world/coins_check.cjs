// Rainbow round 46 - coin collection check: replays the SAME real-touch plan as section_run.cjs (no rendering), then lists every coin, whether
// Benny collected it, and Benny's lane offset when he passed it. A coin counts as "in Benny's path" when |coin lat - Benny lat| < 0.15 at its s.
//   node coins_check.cjs <game folder> <out.json> <seconds> [plan JSON] [query]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dir, outF, secs, planArg = '[]', query = 's0=88'] = process.argv.slice(2); const W = 412, H = 915, fps = 30, speed = 2.2, plan = JSON.parse(planArg);
  const disk = fs.readFileSync(path.join(dir, 'play3.html'), 'utf8'); let port, srv;
  for (let i = 0; i < 20 && !srv; i++) { port = 9300 + Math.floor(Math.random() * 600); const s = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dir, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1000)); const got = await fetch(`http://127.0.0.1:${port}/play3.html`).then((r) => r.text()).catch(() => ''); if (got === disk) srv = s; else s.kill(); }
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); const page = await ctx.newPage();
    await page.goto(`http://127.0.0.1:${port}/play3.html?w=${W}&h=${H}&${query}`); await page.waitForFunction(() => window.ready === true, null, { timeout: 1200000 });
    const cdp = await ctx.newCDPSession(page), gestures = [];
    for (const [t0, d] of plan) { const f0 = Math.round(t0 * fps), y = 0.62 * H;
      if (d === 'left' || d === 'right') { const sx = d === 'left' ? 0.65 * W : 0.35 * W, ex = d === 'left' ? 0.35 * W : 0.65 * W; gestures.push([f0, 'touchStart', sx, y]); for (let k = 1; k <= 4; k++) gestures.push([f0 + k, 'touchMove', sx + (ex - sx) * k / 4, y + 3 * k]); gestures.push([f0 + 5, 'touchEnd', ex, y + 15]); }
      else { const sy = d === 'up' ? 0.7 * H : 0.5 * H, ey = d === 'up' ? 0.5 * H : 0.7 * H; gestures.push([f0, 'touchStart', W / 2, sy]); for (let k = 1; k <= 4; k++) gestures.push([f0 + k, 'touchMove', W / 2 + 2 * k, sy + (ey - sy) * k / 4]); gestures.push([f0 + 5, 'touchEnd', W / 2, ey]); } }
    const n = Math.round(+secs * fps), track = [];
    for (let i = 0; i < n; i++) { for (const g of gestures.filter((g) => g[0] === i)) await cdp.send('Input.dispatchTouchEvent', { type: g[1], touchPoints: g[1] === 'touchEnd' ? [] : [{ x: g[2], y: g[3], id: 1, radiusX: 8, radiusY: 8, force: 1 }] });
      const o = await page.evaluate(([t, dt, sp]) => window.step(t, dt, 0, sp), [i / fps, i === 0 ? 0 : 1 / fps, speed]); track.push([o.s, o.lat, o.coins]); }
    const coins = await page.evaluate(() => window.coinLayout()); const s0 = track[0][0], s1 = track[track.length - 1][0];
    const latAt = (s) => { let best = track[0]; for (const t of track) if (Math.abs(t[0] - s) < Math.abs(best[0] - s)) best = t; return best[1]; };
    const passed = coins.filter((c) => c.s > s0 + 0.3 && c.s < s1 - 0.3).map((c) => ({ ...c, bennyLat: latAt(c.s), inPath: Math.abs(c.lat - latAt(c.s)) < 0.15, collected: c.got >= 0 }));
    const inPath = passed.filter((c) => c.inPath), missedInPath = inPath.filter((c) => !c.collected);
    const res = { frames: n, s_range: [s0, s1], coins_passed: passed.length, coins_in_bennys_path: inPath.length, collected_in_path: inPath.length - missedInPath.length, missed_in_path: missedInPath,
      collected_total: passed.filter((c) => c.collected).length, coin_counter_end: track[track.length - 1][2] };
    fs.writeFileSync(outF, JSON.stringify({ ...res, coins: passed }, null, 1)); console.log(JSON.stringify(res));
  } finally { await browser.close(); srv.kill(); }
})();
