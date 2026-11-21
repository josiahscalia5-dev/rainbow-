// Round 34 S3 (camera + path + coins): LOGIC run of the Screen 05 kit game — steps window.step() frame by frame at 30 fps with REAL CDP
// touch swipes (412x915 Android portrait emulation) but takes NO screenshots, so the whole 23 s level runs in about a minute.
// Measures what S3 owns: camera smoothness (move / turn / jerk per frame), camera inside the tunnel, Benny's on-screen box,
// coins collected vs total, on-screen coin overlaps, forward progress (freezes), ring sections passed, ending transition.
//   NODE_PATH=$(npm root -g) bash tools/kit05/render_slot.sh node qa/kit05/r34/s3/logic_run.cjs <game dir> <out.json> [plan=trail|stress|none] [query]
// query = extra URL parameters, e.g. "bend=0.2,7.5"
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dir, outFile, planKind = 'trail', query = ''] = process.argv.slice(2);
  const W = 412, H = 915, fps = 30, speed = 1.4;
  const K = JSON.parse(fs.readFileSync(path.join(dir, 'kit.json'), 'utf8'));
  const disk = fs.readFileSync(path.join(dir, 'play3.html'), 'utf8');
  let port, srv;
  for (let tries = 0; tries < 20 && !srv; tries++) {
    port = 8000 + Math.floor(Math.random() * 800);
    const s = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dir, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1200));
    const served = await fetch(`http://127.0.0.1:${port}/play3.html`).then((r) => r.text()).catch(() => '');
    if (served === disk) srv = s; else s.kill();
  }
  if (!srv) throw new Error('no server for ' + dir);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errors = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 300)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 300)); });
    await page.goto(`http://127.0.0.1:${port}/play3.html?w=${W}&h=${H}${query ? '&' + query : ''}`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 900000 });
    const cdp = await ctx.newCDPSession(page);
    const swipe = async (d) => {
      const x0 = W / 2, y0 = H * 0.7, L = 140, [dx, dy] = { left: [-L, 0], right: [L, 0], up: [0, -L], down: [0, L] }[d];
      const pt = (k) => [{ x: x0 + dx * k, y: y0 + dy * k, id: 1, radiusX: 8, radiusY: 8, force: 1 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(0) });
      for (const k of [0.25, 0.5, 0.75, 1]) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(k) });
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    const frame0 = await page.evaluate(() => ({ cam: window.camInfo(), box: window.bennyBox(), coins: window.coinScreen(), benny: window.bennyInfo() }));
    const layout = await page.evaluate(() => window.coinLayout());
    const sEnd = await page.evaluate(() => window.levelEnd());
    const tEnd = sEnd / speed;
    let plan = [];
    if (planKind === 'trail') {   // the acceptance harness's coin-trail player (lane before side-lane coins, one leap per air arc)
      const DUR = { left: 0.3, right: 0.3, up: 0.75, down: 1.0 }; const cs = layout.slice().sort((a, b) => a.s - b.s); let lane = 0, busy = 0.6;
      const add = (t, d, why) => { t = Math.max(t, busy); plan.push([+t.toFixed(3), d, why]); busy = t + DUR[d]; };
      for (let k = 0; k < cs.length; k++) {
        const c = cs[k], tc = c.s / speed, want = Math.max(-1, Math.min(1, Math.round(c.lat / 0.22)));
        while (lane !== want) { const d = want < lane ? 'left' : 'right'; add(tc - 0.6, d, 'coin lane'); lane += d === 'left' ? -1 : 1; }
        if (c.h > 0.15) { let e = k; while (e + 1 < cs.length && cs[e + 1].h > 0.15 && cs[e + 1].s - cs[e].s < 0.8) e++;
          const top = cs.slice(k, e + 1).reduce((a, b) => (b.h > a.h ? b : a)); add(top.s / speed - 0.31, 'up', 'coin arc'); k = e; }
      }
    } else if (planKind === 'stress') {   // swipes in every direction, rapid left-right changes, leaps and dives, all over the level
      const cyc = ['left', 'left', 'right', 'right', 'right', 'left', 'up', 'left', 'left', 'down', 'right', 'right', 'right', 'left', 'left', 'up', 'right', 'down', 'left', 'right'];
      let i = 0; for (let t = 0.5; t < tEnd - 0.4; t += (i % 3 === 0 ? 0.18 : 0.42)) plan.push([+t.toFixed(3), cyc[i++ % cyc.length], 'stress']);
    }
    plan.sort((a, b) => a[0] - b[0]);
    const nMax = Math.ceil((tEnd + 0.6) * fps), fr = []; let pi = 0;
    for (let i = 0; i < nMax; i++) {
      const t = i / fps;
      while (pi < plan.length && plan[pi][0] <= t) { await swipe(plan[pi][1]); pi++; }
      const o = await page.evaluate(([t, dt, sp]) => { const r = window.step(t, dt, 0, sp); const st = window.state();
        const cs = window.coinScreen(); return { ...r, ...st, cam: window.camInfo(), box: window.bennyBox(), bi: window.bennyInfo(), cs, endK: window.endK() }; }, [t, i === 0 ? 0 : 1 / fps, speed]);
      o.i = i; o.t = t; fr.push(o);
      if (o.done) break;
    }
    // ---- metrics ----
    const A = K.A, A0 = K.A0, NUP = K.NUP, RR = K.RR;
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], sub = (a, b) => a.map((x, j) => x - b[j]);
    const axisDist = (p) => { const d = sub(p, A0); const za = dot(d, A); const r = d.map((x, j) => x - za * A[j]); return Math.hypot(...r); };
    const play = fr.filter((x) => !(x.endK > 0.05));
    const P = fr.map((x) => x.cam.p), Q = fr.map((x) => x.cam.q);
    const mv = P.slice(1).map((p, k) => Math.hypot(...sub(p, P[k])));
    const turn = Q.slice(1).map((q, k) => { const b = Q[k]; const d = Math.abs(q[0] * b[0] + q[1] * b[1] + q[2] * b[2] + q[3] * b[3]); return 2 * Math.acos(Math.min(1, d)) * 180 / Math.PI; });
    const jerk = P.slice(2).map((p, k) => Math.hypot(...p.map((x, j) => x - 2 * P[k + 1][j] + P[k][j])));
    const turnAcc = turn.slice(1).map((x, k) => Math.abs(x - turn[k]));
    // camera lateral (along RR) relative to the straight start line, per frame -> smoothness of the lateral motion alone
    const camLatW = P.map((p) => dot(p, RR));
    const camLatVel = camLatW.slice(1).map((x, k) => (x - camLatW[k]) * fps);
    const camLatAcc = camLatVel.slice(1).map((x, k) => Math.abs(x - camLatVel[k]) * fps);
    const boxes = play.map((x) => x.box);
    let overl = 0, overlFrames = 0, maxPairs = 0, overl3 = 0; const firstOv = [];
    for (const x of fr) { const big = x.cs.filter((c) => c.r >= 6), all = x.cs.filter((c) => c.r >= 3); let n = 0, n3 = 0;
      for (let a = 0; a < big.length; a++) for (let b = a + 1; b < big.length; b++) if (Math.hypot(big[a].x - big[b].x, big[a].y - big[b].y) < big[a].r + big[b].r) n++;
      for (let a = 0; a < all.length; a++) for (let b = a + 1; b < all.length; b++) if (Math.hypot(all[a].x - all[b].x, all[a].y - all[b].y) < all[a].r + all[b].r) n3++;
      overl += n; overl3 += n3; if (n) { overlFrames++; if (firstOv.length < 8) firstOv.push(x.i); } maxPairs = Math.max(maxPairs, n); }
    // coin pop-in: frames where a coin's on-screen radius grows by > 40 % in one frame while already >= 4 px (a visible jump)
    let pops = 0; const lastR = {};
    for (const x of fr) { const seen = {}; for (const c of x.cs) { seen[c.i] = 1; if (lastR[c.i] != null && lastR[c.i] >= 4 && c.r > lastR[c.i] * 1.4) pops++; lastR[c.i] = c.r; } for (const k of Object.keys(lastR)) if (!seen[k]) delete lastR[k]; }
    const dS = fr.slice(1).map((x, k) => x.s - fr[k].s);
    const last = fr[fr.length - 1];
    const res = {
      query, plan: planKind, swipes: plan.length, frames: fr.length, errors,
      level: { s_done_target: sEnd, s_end: last.s, done: !!last.done, freezes: dS.filter((v) => v <= 1e-6 && !fr[dS.indexOf(v) + 1]?.done).length, min_step: Math.min(...dS.slice(0, -2)),
        tiles_seen: [...new Set(fr.map((x) => x.tile))].sort((a, b) => a - b), rings_passed: (() => { const tB0 = K.level.tB0; let n = 0; for (let k = -1; k < 40; k++) { const rt = K.Z2 + (k - 2) * K.S; if (rt > tB0 && rt <= tB0 + last.s) n++; } return n; })(),
        ending: { first_frame: fr.findIndex((x) => x.endK > 0.05), k_end: +last.endK.toFixed(3), monotonic: fr.every((x, k) => k === 0 || x.endK >= fr[k - 1].endK - 1e-3) } },
      camera: { max_move_per_frame: +Math.max(...mv).toFixed(4), median_move: +mv.slice().sort((a, b) => a - b)[mv.length >> 1].toFixed(4), max_turn_deg_per_frame: +Math.max(...turn).toFixed(3),
        max_jerk_per_frame2: +Math.max(...jerk).toFixed(5), max_turn_change_deg: +Math.max(...turnAcc).toFixed(4), max_lat_accel_u_s2: +Math.max(...camLatAcc).toFixed(3),
        max_axis_dist: +Math.max(...P.map(axisDist)).toFixed(3), min_clearance_to_ring: +(K.RING_IN - Math.max(...P.map(axisDist))).toFixed(3),
        height_above_water: [+Math.min(...P.map((p) => dot(p, NUP) - K.PD)).toFixed(3), +Math.max(...P.map((p) => dot(p, NUP) - K.PD)).toFixed(3)],
        max_roll_deg: +Math.max(...play.map((x) => Math.abs(x.bi.camRollDeg - fr[0].bi.camRollDeg))).toFixed(2) },
      benny_box: { x: [Math.min(...boxes.map((b) => b.x0)), Math.max(...boxes.map((b) => b.x1))], y: [Math.min(...boxes.map((b) => b.y0)), Math.max(...boxes.map((b) => b.y1))],
        frames_off_screen: boxes.filter((b) => b.x0 < 0 || b.x1 > W || b.y0 < 0 || b.y1 > H).length, max_abs_roll_deg: +Math.max(...play.map((x) => Math.abs(x.bi.rollDeg))).toFixed(2),
        centre_x: [Math.min(...play.map((x) => x.bi.x)), Math.max(...play.map((x) => x.bi.x))].map((v) => +v.toFixed(1)) },
      coins: { start: fr[0].coins, end: last.coins, got: (last.coins - fr[0].coins) / 10, total: layout.length, got_by_kind: last.got },
      coin_overlap: { pairs_total: overl, frames_with_overlap: overlFrames, max_pairs: maxPairs, first_frames: firstOv, pairs_r3_total: overl3, size_pops: pops },
      lanes_seen: [...new Set(fr.map((x) => x.lane))], max_abs_lat: Math.max(...fr.map((x) => Math.abs(x.lat))),
      frame0: { cam: frame0.cam, box: frame0.box, coins: frame0.coins, benny: { x: frame0.benny.x, y: frame0.benny.y, rollDeg: frame0.benny.rollDeg } },
    };
    fs.writeFileSync(outFile, JSON.stringify(res, null, 1));
    if (process.env.DUMP) fs.writeFileSync(process.env.DUMP, JSON.stringify(fr.map((x) => ({ i: x.i, s: x.s, lat: x.lat, lane: x.lane, h: x.height, p: x.cam.p, q: x.cam.q, box: x.box, bx: x.bi.x, by: x.bi.y, roll: x.bi.rollDeg, crl: x.bi.camRollDeg, ncs: x.cs.length, cs: x.cs, coins: x.coins, tile: x.tile, endK: x.endK }))));
    console.log(JSON.stringify(res, (k, v) => (k === 'coins' && Array.isArray(v) ? v.length : v)));
  } finally { await browser.close(); srv.kill(); }
})();
