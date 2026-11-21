// Round 32b: logic-only check of the 26-coin trail and the level end, on any folder with play3.html + controls.js
// (normally the private merged copy agentA/mergedtest = agentB's visuals + my controls).
// usage: NODE_PATH=$(npm root -g) node coins_level_check.cjs <folder> [out.json] [--stills]
// 1. frame 0: coinLayout(), levelEnd(), coinScreen() vs the approved coin centres / sizes (approved_coins.json, 864x1536 scaled to
//    the 412x915 canvas: same vertical FOV, centred), and a small search for run-1 coins 6-8 lat (QA projection, nothing moved).
// 2. the WHOLE level at 30 fps, speed 1.4, with an autopilot that follows the coin trail through window.input.swipe (lane changes,
//    leaps timed for the arcs; touch input itself is proven by acceptance_logic.cjs): every frame coinScreen() overlaps (r >= 6 px),
//    s / lat / height / coins / done, the camera pose, distance camera -> golden end disc. Stops 1.2 s after done.
// 3. --stills: renders at most 4 stills (frame 0, a side-lane run, a leap arc, the level end) into <folder>/out_coins/.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const args = process.argv.slice(2); const dir = path.resolve(args[0]); const outFile = args[1] && !args[1].startsWith('--') ? args[1] : path.join(dir, 'coins_level.json');
  const doStills = args.includes('--stills');
  const { serveHere } = require(path.join(dir, 'serve.cjs'));
  const srv = await serveHere();
  const W = 412, H = 915, fps = 30, speed = 1.4;
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errors = [], T0 = Date.now(); const res = { folder: dir }; const el = () => ((Date.now() - T0) / 1000).toFixed(0) + 's';
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 300)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 300)); });
    await page.goto(`${srv.url}/play3.html?w=${W}&h=${H}`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 900000 });
    res.load_s = +((Date.now() - T0) / 1000).toFixed(1); console.log('ready', el());
    const TR = JSON.parse(fs.readFileSync(path.join(dir, fs.existsSync(path.join(dir, 'track_w/track.json')) ? 'track_w/track.json' : 'track.json')));
    res.track = { N: TR.N, trail_end: TR.trail_s[TR.trail_s.length - 1], has_XB: !!TR.XB };
    const glow = TR.XB ? TR.XB.map((v, j) => v + TR.offsets[TR.N - 1][j] + 0.35 * TR.ax[j]) : null;
    // ---------- frame 0 ----------
    const f0 = await page.evaluate(() => ({ layout: window.coinLayout(), levelEnd: window.levelEnd(), state: window.state(), screen: window.coinScreen(), api: { coinLayout: typeof window.coinLayout, levelEnd: typeof window.levelEnd, coinScreen: typeof window.coinScreen } }));
    res.api = f0.api; res.layout = f0.layout; res.levelEnd = f0.levelEnd; res.sEnd = f0.state.sEnd; res.state0 = f0.state;
    const L = f0.layout;
    const sorted = [...L].sort((a, b) => a.s - b.s), gaps = sorted.slice(1).map((c, i) => +(c.s - sorted[i].s).toFixed(3));
    res.layout_checks = { count: L.length, min_path_gap: Math.min(...gaps), max_abs_lat: Math.max(...L.map((c) => Math.abs(c.lat))), min_h: Math.min(...L.map((c) => c.h)), max_h: Math.max(...L.map((c) => c.h)),
      last_coin_s: sorted[sorted.length - 1].s, coins_before_done: L.filter((c) => c.s < f0.levelEnd).length, hud_if_all: f0.state.coins + 10 * L.length };
    const apprFile = [path.join(dir, '..', 'approved_coins.json'), path.join(dir, '..', '..', 'approved_coins.json')].find((f) => fs.existsSync(f));
    const appr = JSON.parse(fs.readFileSync(apprFile, 'utf8'));
    const k = H / 1536, toOurs = (a) => ({ x: W / 2 + (a[0] - 432) * k, y: a[1] * k, r: a[2] / 2 * k });
    res.frame0 = { screen: f0.screen, approved_scaled: appr.map(toOurs).map((o) => ({ x: +o.x.toFixed(1), y: +o.y.toFixed(1), r: +o.r.toFixed(1) })) };
    res.frame0.match = appr.slice(0, 8).map((a, i) => { const o = toOurs(a), c = f0.screen.find((z) => z.i === i);
      return c ? { coin: i + 1, dx: +(c.x - o.x).toFixed(1), dy: +(c.y - o.y).toFixed(1), r_ours: c.r, r_appr: +o.r.toFixed(1) } : { coin: i + 1, missing: true }; });
    // small search: run-1 coins 6-8 lat (approved coins 6-8 are the far, less reliable ones)
    res.frame0.lat_search = await page.evaluate(([ap]) => ap.map(([s, tx, ty]) => { let best = null;
      for (let lat = -0.22; lat <= 0.2201; lat += 0.01) { const p = window.qaCoinProject(s, lat, 0), e = Math.hypot(p.x - tx, p.y - ty); if (!best || e < best.err) best = { s, lat: +lat.toFixed(2), err: +e.toFixed(1), x: +p.x.toFixed(1), y: +p.y.toFixed(1) }; }
      return best; }), [[[3.47, ...Object.values(toOurs(appr[5])).slice(0, 2)], [3.97, ...Object.values(toOurs(appr[6])).slice(0, 2)], [4.47, ...Object.values(toOurs(appr[7])).slice(0, 2)]]]);
    res.frame0.fit2d = await page.evaluate(([targets]) => targets.map(([s0, tx, ty]) => { let best = null;
      for (let s = s0 - 0.5; s <= s0 + 0.5; s += 0.01) for (let lat = -0.22; lat <= 0.2201; lat += 0.005) { const p = window.qaCoinProject(s, lat, 0), e = Math.hypot(p.x - tx, p.y - ty); if (!best || e < best.err) best = { s: +s.toFixed(2), lat: +lat.toFixed(3), err: +e.toFixed(1), r: +p.r.toFixed(1) }; }
      return best; }), [appr.map((a, i) => [res.layout[i].s, ...Object.values(toOurs(a)).slice(0, 2)])]);
    const overl = (scr) => { const v = scr.filter((c) => c.r >= 6), o = []; for (let i = 0; i < v.length; i++) for (let j = i + 1; j < v.length; j++) { const d = Math.hypot(v[i].x - v[j].x, v[i].y - v[j].y); if (d < v[i].r + v[j].r) o.push([v[i].i, v[j].i, +(d - v[i].r - v[j].r).toFixed(1)]); } return o; };
    res.frame0.overlaps = overl(f0.screen);
    const stills = []; const outDir = path.join(dir, 'out_coins'); if (doStills) fs.mkdirSync(outDir, { recursive: true });
    const shoot = async (name) => { const t1 = Date.now(); await page.evaluate(() => window.renderNow(1)); await page.screenshot({ path: path.join(outDir, name + '.png') });
      const st = await page.evaluate(() => ({ st: window.state(), scr: window.coinScreen(), hud: document.getElementById('coins').textContent }));
      stills.push({ name, s: st.st.s, lane: st.st.lane, h: st.st.height, coins: st.st.coins, done: st.st.done, hud: st.hud, coinScreen: st.scr, render_s: +((Date.now() - t1) / 1000).toFixed(1) }); console.log('still', name, el()); };
    if (doStills) { await shoot('c0_frame0'); fs.mkdirSync(path.join(outDir, 'vc'), { recursive: true }); await page.screenshot({ path: path.join(outDir, 'vc', 'f_0000.jpg'), type: 'jpeg', quality: 92 }); } // same frame, the lead's visual_check input
    // ---------- whole level with the trail-following autopilot ----------
    await page.evaluate(([fps, speed, glow]) => {
      const dt = 1 / fps, A = { rows: [], ov: [], ovPop: [], pickups: [], doneAt: null, i: 0, prevCoins: window.state().coins, leaps: new Set() };
      const L = window.coinLayout(); const LEAP_T = 0.62, V = speed;
      const want = (s) => { // lane wanted for the next coin ahead (within 1.0 u), else stay
        const ahead = L.filter((c) => c.s > s - 0.05 && c.s < s + 1.0); if (!ahead.length) return null;
        const c = ahead[0]; if (Math.abs(c.lat) >= 0.15) return Math.sign(c.lat); if (Math.abs(c.lat) <= 0.08) return 0; return null; };
      A.frame = () => {
        const i = A.i, st = window.state();
        if (st.move === null) { const w = want(st.s); if (w !== null && w !== st.lane && !st.queued) window.input.swipe(w < st.lane ? 'left' : 'right'); }
        for (const c of L) if (c.h >= 0.3 && !A.leaps.has(c.s)) { const ds = c.s - st.s; if (ds <= V * LEAP_T / 2 + 0.01 && ds > V * LEAP_T / 2 - 0.04) { A.leaps.add(c.s); window.input.swipe('up'); } }
        window.step(i * dt + dt, dt, 0, speed);
        const s2 = window.state(), scr = window.coinScreen(), scrP = window.coinScreen({ pops: true }), cam = window.camInfo ? window.camInfo() : null;
        const cp = cam ? (cam.p || cam.pos) : null, cq = cam && cam.q ? cam.q.map((x) => +x.toFixed(6)) : null;
        const v = scr.filter((c) => c.r >= 6); for (let a = 0; a < v.length; a++) for (let b = a + 1; b < v.length; b++) { const d = Math.hypot(v[a].x - v[b].x, v[a].y - v[b].y); if (d < v[a].r + v[b].r) A.ov.push({ f: i + 1, a: v[a].i, b: v[b].i, gap: +(d - v[a].r - v[b].r).toFixed(1) }); }
        const vp = scrP.filter((c) => c.r >= 6); for (let a = 0; a < vp.length; a++) for (let b = a + 1; b < vp.length; b++) { const d = Math.hypot(vp[a].x - vp[b].x, vp[a].y - vp[b].y); if (d < vp[a].r + vp[b].r && (vp[a].pop || vp[b].pop)) A.ovPop.push({ f: i + 1, a: vp[a].i, b: vp[b].i }); }
        if (s2.coins !== A.prevCoins) { A.pickups.push({ f: i + 1, s: s2.s, last: s2.lastPick }); A.prevCoins = s2.coins; }
        A.rows.push({ f: i + 1, s: s2.s, lane: s2.lane, lat: s2.lat, h: s2.height, coins: s2.coins, move: s2.move, done: s2.done, n: scr.length, maxR: scr.length ? Math.max(...scr.map((c) => c.r)) : 0,
          cam: cp ? cp.map((x) => +x.toFixed(4)) : null, camQ: cq, camGlow: cp && glow ? +Math.hypot(cp[0] - glow[0], cp[1] - glow[1], cp[2] - glow[2]).toFixed(3) : null });
        if (s2.done && A.doneAt === null) A.doneAt = i + 1;
        A.i++;
      };
      // run until s >= sTarget (or until 'after' frames past done when sTarget is null); returns the frame count
      A.until = (sTarget, after) => { for (let k = 0; k < 4000; k++) { const last = A.rows[A.rows.length - 1];
        if (sTarget !== null && last && last.s >= sTarget) break; if (sTarget === null && A.doneAt !== null && A.i >= A.doneAt + after) break; A.frame(); } return A.i; };
      window.__auto = A;
    }, [fps, speed, glow]);
    // stills: R2 side-lane run (Benny moving right toward it), R3 leap arc (near the top of his leap), the level end (at rest)
    const L2 = res.layout.filter((c) => c.run === 2), L3 = res.layout.filter((c) => c.run === 3);
    const plan = doStills ? [[L2[1].s - 0.4, 'c1_side_lane_run', 0], [L3[2].s - 0.15, 'c2_leap_arc', 0], [null, 'c3_level_end', 0], [null, null, Math.round(1.2 * fps)]] : [[null, null, Math.round(1.2 * fps)]];
    for (const [sT, name, after] of plan) { await page.evaluate(([sT, after]) => window.__auto.until(sT, after), [sT, after]); if (name) await shoot(name); }
    const run = await page.evaluate(() => { const A = window.__auto; return { rows: A.rows, ov: A.ov, ovPop: A.ovPop, pickups: A.pickups, doneAt: A.doneAt, final: window.state() }; });
    const rows = run.rows; res.run = { frames: rows.length, seconds: +(rows.length / fps).toFixed(2), done_frame: run.doneAt, done_t: run.doneAt ? +(run.doneAt / fps).toFixed(2) : null,
      done_s: run.doneAt ? rows[run.doneAt - 1].s : null, s_final: rows[rows.length - 1].s, s_max: Math.max(...rows.map((r) => r.s)), coins_end: run.final.coins, got: run.final.got,
      pickups: run.pickups.length, overlaps_r6: run.ov.length, overlaps_first: run.ov.slice(0, 12), overlap_pairs: (() => { const g = {}; for (const o of run.ov) { const k = o.a + '-' + o.b; g[k] = g[k] || { frames: 0, worst: 0, f0: o.f, f1: o.f }; g[k].frames++; g[k].worst = Math.min(g[k].worst, o.gap); g[k].f1 = o.f; } return g; })(), pop_overlaps: run.ovPop.length,
      max_abs_lat: Math.max(...rows.map((r) => Math.abs(r.lat))), h_range: [Math.min(...rows.map((r) => r.h)), Math.max(...rows.map((r) => r.h))],
      dLat_max: Math.max(...rows.slice(1).map((r, i) => Math.abs(r.lat - rows[i].lat))), ds_min_before_done: Math.min(...rows.slice(1, run.doneAt || rows.length).map((r, i) => r.s - rows[i].s)),
      cam_step_max: (() => { let m = 0; for (let i = 1; i < rows.length; i++) if (rows[i].cam && rows[i - 1].cam) m = Math.max(m, Math.hypot(...rows[i].cam.map((v, j) => v - rows[i - 1].cam[j]))); return +m.toFixed(4); })(),
      cam_to_glow_min: glow ? Math.min(...rows.map((r) => r.camGlow)) : null, done_stays_true: run.doneAt ? rows.slice(run.doneAt - 1).every((r) => r.done) : null,
      missed: res.layout.filter((c, i) => !run.pickups.some((p) => p.last && Math.abs(p.last.s - c.s) < 1e-3)).map((c) => [c.s, c.lat, c.h, c.runKind]) };
    // the 10 sample points along the level (frame indices evenly spread up to done) for the overlap report
    const nS = run.doneAt || rows.length; res.run.samples = Array.from({ length: 10 }, (_, j) => rows[Math.min(nS - 1, Math.round((j + 1) * nS / 10) - 1)]).map((r) => ({ f: r.f, s: r.s, visible: r.n, maxR: r.maxR, overlaps: run.ov.filter((o) => o.f === r.f).length }));
    res.rows_compact = rows.map((r) => [r.f, r.s, r.lane, r.lat, r.h, r.coins, r.move, r.done ? 1 : 0, r.n, r.camGlow]);
    res.cam_path = rows.map((r) => [r.s, r.cam, r.camQ]);
    res.screen0 = f0.screen; res.fov = await page.evaluate(() => { const p = window.qaCoinProject(1, 0, 0); return p; });
    console.log(JSON.stringify({ layout_checks: res.layout_checks, levelEnd: res.levelEnd, sEnd: res.sEnd, frame0_match: res.frame0.match, lat_search: res.frame0.lat_search, frame0_overlaps: res.frame0.overlaps }, null, 0));
    console.log(JSON.stringify(Object.fromEntries(Object.entries(res.run).filter(([k]) => k !== 'samples'))), '\nsamples', JSON.stringify(res.run.samples));
    res.errors = errors; res.stills = stills;
  } catch (e) { res.fatal = String(e).slice(0, 600); res.errors = errors; console.log('ERROR', e); }
  finally { res.wall_s = +((Date.now() - T0) / 1000).toFixed(0); fs.writeFileSync(outFile, JSON.stringify(res, null, 1)); await browser.close(); srv.close(); console.log('done', el(), '->', outFile); }
})();
