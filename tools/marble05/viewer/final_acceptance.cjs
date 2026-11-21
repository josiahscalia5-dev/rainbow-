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
    // the player's inputs over the level (seconds)
    // r32b: the page exposes the coin trail (window.coinLayout) and the level end (window.levelEnd): the run then plays the WHOLE level
    // until state().done, as a player who follows the coin trail (lane changes before side-lane runs, a leap under each air arc) and
    // fills the gaps with extra dives and left/right moves (out and back), so every direction is used again and again.
    // Without them (older pages) the fixed 7.6 s plan below is used. PLAN=fixed forces it.
    const v = +speed, layout = await page.evaluate(() => (window.coinLayout ? window.coinLayout() : null));
    const sEnd = await page.evaluate(() => (window.levelEnd ? window.levelEnd() : null));
    let plan = [[0.9, 'left'], [1.6, 'left'], [2.3, 'right'], [2.9, 'up'], [3.7, 'right'], [4.3, 'right'], [4.9, 'down'], [5.6, 'left'], [6.2, 'up'], [6.9, 'left']];
    let nMax = n;
    if (layout && sEnd && process.env.PLAN !== 'fixed') {
      const tEnd = sEnd / v, DUR = { left: 0.3, right: 0.3, up: 0.75, down: 1.0 }, ev = [];
      const cs = layout.slice().sort((a, b) => a.s - b.s); let lane = 0, busy = 0.6;
      const add = (t, d, why) => { t = Math.max(t, busy); ev.push([+t.toFixed(3), d, why]); busy = t + DUR[d]; };
      for (let k = 0; k < cs.length; k++) {
        const c = cs[k], tc = c.s / v, want = Math.max(-1, Math.min(1, Math.round(c.lat / 0.22)));
        while (lane !== want) { const d = want < lane ? 'left' : 'right'; add(tc - 0.6, d, 'coin lane'); lane += d === 'left' ? -1 : 1; }
        if (c.h > 0.15) {          // one leap per air arc, timed so the peak (0.31 s after take-off) meets the arc's highest coin
          let e = k; while (e + 1 < cs.length && cs[e + 1].h > 0.15 && cs[e + 1].s - cs[e].s < 0.8) e++;
          const top = cs.slice(k, e + 1).reduce((a, b) => (b.h > a.h ? b : a)); add(top.s / v - 0.31, 'up', 'coin arc'); k = e;
        }
      }
      // extras in the gaps between coin moves: a dive, then out to the free side and back
      const laneAt = (t) => { let l = 0; for (const [te, d] of ev.slice().sort((a, b) => a[0] - b[0])) { if (te > t) break; if (d === 'left') l = Math.max(-1, l - 1); if (d === 'right') l = Math.min(1, l + 1); } return l; };
      const base = ev.slice().sort((a, b) => a[0] - b[0]), marks = [[0, null], ...base, [tEnd - 0.4, null]];
      for (let k = 0; k + 1 < marks.length; k++) {
        let gs = marks[k][0] + (marks[k][1] ? DUR[marks[k][1]] : 0.6) + 0.15; const ge = marks[k + 1][0] - 0.45;
        if (ge - gs >= 1.15) { ev.push([+gs.toFixed(3), 'down', 'extra']); gs += DUR.down + 0.15; }
        if (ge - gs >= 0.95) { const l = laneAt(gs), out = l <= 0 ? (l < 0 ? 'right' : 'left') : 'left', back = out === 'left' ? 'right' : 'left';
          ev.push([+gs.toFixed(3), out, 'extra'], [+(gs + 0.5).toFixed(3), back, 'extra']); }
      }
      plan = ev.sort((a, b) => a[0] - b[0]).map(([t, d, why]) => [t, d, why]);
      nMax = Math.ceil((tEnd + 0.6) * fps);
    }
    fs.writeFileSync(`${out}/plan.json`, JSON.stringify({ layout, sEnd, plan }, null, 1));
    let pi = 0, n2 = nMax;
    for (let i = 0; i < n2; i++) {
      const t = i / fps;
      while (pi < plan.length && plan[pi][0] <= t) { await swipe(plan[pi][1]); log.push({ swipe: plan[pi][1], t: +t.toFixed(3), why: plan[pi][2] || 'fixed' }); pi++; }
      const o = await page.evaluate(([t, dt, sp]) => { const r = window.step(t, dt, 0, sp); return Object.assign({}, r, window.state ? window.state() : {}); }, [t, i === 0 ? 0 : 1 / fps, +speed]);
      if (o.done && n2 === nMax) n2 = i + 1;   // the level is complete: this is the last frame
      const cam = await page.evaluate(() => (window.camInfo ? window.camInfo() : null));
      o.endK = await page.evaluate(() => (window.endK ? window.endK() : null));   // ending transition strength (golden-light bloom), 0 = gameplay
      // coins on screen this frame: any two visible coins (on-screen radius >= 6 px) that overlap = crowding
      const cs2 = await page.evaluate(() => (window.coinScreen ? window.coinScreen() : null));
      let coinOverlaps = null;
      if (cs2) { coinOverlaps = 0; const big = cs2.filter((c) => c.r >= 6); for (let a = 0; a < big.length; a++) for (let b = a + 1; b < big.length; b++) if (Math.hypot(big[a].x - big[b].x, big[a].y - big[b].y) < big[a].r + big[b].r) coinOverlaps++; }
      o.coinsOnScreen = cs2 ? cs2.length : null; o.coinOverlaps = coinOverlaps;
      const file = `${out}/f_${String(i).padStart(4, '0')}.jpg`;
      if (i >= fa && i < fb && !(skipExisting && fs.existsSync(file))) {
        await page.evaluate(() => window.renderNow(1));
        await page.screenshot({ path: file, type: 'jpeg', quality: 92, timeout: 600000 });
      }
      log.push({ i, t: +t.toFixed(3), ...o, cam });
      if (i % 10 === 0) { console.log('frame', i, '/', n2, JSON.stringify(o), new Date().toISOString().slice(11, 19)); fs.writeFileSync(`${out}/run_log.json`, JSON.stringify(log)); }
    }
    fs.writeFileSync(`${out}/run_log.json`, JSON.stringify(log, null, 1));
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
    const ov = fr.filter((x) => x.coinOverlaps !== null && x.coinOverlaps !== undefined);
    // the level as BUILT (the page's own track file): its end must be the level end (no shortened level)
    const trk = ['track_w/track.json', 'track.json'].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));
    const pathEnd = trk ? JSON.parse(fs.readFileSync(trk, 'utf8')).trail_s.slice(-1)[0] : null, nSec = trk ? JSON.parse(fs.readFileSync(trk, 'utf8')).N : null;
    const tiles = [...new Set(fr.map((x) => x.tile))].sort((a, b) => a - b);
    const ek = fr.map((x) => x.endK ?? 0), kFirst = ek.findIndex((k) => k > 0.05);
    const camMoves = camFr.slice(1).map((x, k) => Math.hypot(...x.cam.p.map((v2, j) => v2 - camFr[k].cam.p[j])));
    const dirs = {}; for (const x of swipes) dirs[x.swipe] = (dirs[x.swipe] || 0) + 1;
    const res = {
      frames: fr.length, seconds: +(fr.length / fps).toFixed(2), errors, rendered: `${fa}:${fb}`,
      level: { s_end_target: sEnd, done: !!fr[fr.length - 1].done, done_frame: fr.findIndex((x) => x.done), plan: layout && sEnd && process.env.PLAN !== 'fixed' ? 'coin-trail player + extras' : 'fixed 7.6 s' },
      built_level: { path_end: pathEnd, sections: nSec, sections_entered: tiles, level_end_vs_path_end: pathEnd && sEnd ? +(sEnd - pathEnd).toFixed(3) : null, swim_speed: +speed },
      position_stalls: camMoves.length ? camMoves.filter((m, k) => !(fr[k + 1].endK > 0.05) && m < 0.3 * (camMoves.slice().sort((a, b) => a - b)[camMoves.length >> 1])).length : null,
      ending_transition: { present: ek.some((k) => k > 0.05), first_frame: kFirst, k_at_end: ek[ek.length - 1], monotonic: ek.every((k, i) => i === 0 || k >= ek[i - 1] - 1e-3), frames: ek.filter((k) => k > 0.05).length },
      coin_crowding: ov.length ? { frames_checked: ov.length, frames_with_overlap: ov.filter((x) => x.coinOverlaps > 0).length, max_pairs: Math.max(...ov.map((x) => x.coinOverlaps)), first_frames: ov.filter((x) => x.coinOverlaps > 0).slice(0, 8).map((x) => x.i) } : null,
      swipe_directions: dirs,
      forward: { min_step: Math.min(...dS), max_step: Math.max(...dS), freezes: dS.filter((v) => v <= 1e-6).length, s_end: fr[fr.length - 1].s },
      lateral: { max_step_per_frame: Math.max(...dLat), teleports_over_0_06: dLat.filter((v) => v > 0.06).length, lanes_seen: [...new Set(fr.map((x) => x.lane))], max_abs_lat: Math.max(...fr.map((x) => Math.abs(x.lat ?? 0))) },
      vertical: { max_step_per_frame: Math.max(...dH), max_height: Math.max(...fr.map((x) => x.height ?? 0)), min_height: Math.min(...fr.map((x) => x.height ?? 0)) },
      camera: camFr.length ? { frames: camFr.length, max_move_per_frame: Math.max(...dCam), median_move_per_frame: dCam.slice().sort((a, b) => a - b)[dCam.length >> 1], max_turn_deg_per_frame: Math.max(...dAng) } : null,
      coins: { start: fr[0].coins, end: fr[fr.length - 1].coins, got: fr[fr.length - 1].got ?? null },
      swipes_sent: swipes.length, swipe_responses: responses, swipes_ok: responses.filter((r) => r.ok).length,
    };
    fs.writeFileSync(`${out}/test_results.json`, JSON.stringify(res, null, 1)); console.log(JSON.stringify(res));
    // the recording (after the results, so an encoder problem can never lose a run): 915 px is odd and yuv420p needs even sizes, so the
    // bottom pixel row is dropped (412x914) — r32 lead fix, the original call failed on every 412x915 run
    if (!process.env.NO_MP4) {
      try { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', `${out}/f_%04d.jpg`, '-vf', 'crop=trunc(iw/2)*2:trunc(ih/2)*2:0:0', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-movflags', '+faststart', `${out}/screen05_swipe_run.mp4`]); }
      catch (e) { console.error('mp4 encode failed (results are already written):', String(e).slice(0, 300)); }
    }
  } finally { await browser.close(); srv.kill(); }
})();
