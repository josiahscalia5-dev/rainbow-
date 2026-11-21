// S4 (round 34) — Screen 05 gameplay acceptance runner. Improved copy of tools/marble05/viewer/final_acceptance.cjs (stricter, never looser).
//   node qa_play.cjs <game folder with play3.html> <outdir> [speed=1.4]
// What it does
//  1. PROBE: loads the page, steps the WHOLE level with no input and no rendering, records the path Benny swims (world position
//     un-projected from window.bennyInfo) and the per-frame JavaScript cost of window.step(): the river's real curvature profile.
//  2. RUN: reloads the page and plays the whole level frame by frame (1/30 s game steps) on a 412x915 Android-portrait emulation
//     (isMobile, hasTouch, Pixel-7 UA) with REAL finger swipes (CDP Input.dispatchTouchEvent, ~120 ms per swipe). The swipe plan =
//     a coin-trail player (lane changes before coin runs, a leap under each coin arc) + lane-neutral test blocks in the free gaps:
//     rapid left->right reversals (0.13-0.17 s apart), repeated same-direction swipes (incl. one into the river edge), a lane change
//     during a leap, a lane change during a dive, out-and-back steering at the river's sharpest bends (from the probe), extra
//     leaps / dives until every direction is used >= 6 times when the gaps allow it.
//  3. Per frame it logs state(), camera pose, Benny's anchor + on-screen box (window.qaBennyFit = his mesh projected, above-water
//     part), splash state, coins on screen + overlaps, step() cost; on rendered frames also WebGL load (draw calls, triangles,
//     points, live textures + their memory, programs) via a non-invasive WebGL wrapper (addInitScript; the game code is untouched).
// env PLAN  = coins (default: the coin-trail player of final_acceptance.cjs) | stress (dense lane-neutral test blocks, coins not the goal)
// env SHOTS = all | quick (frames 0..89 + 6 stills) | stills (6 stills) | none | list:a,b,c   (default all)
// env STILLS = number of representative stills (default 6), spread over the level (5 %..95 %)
// Output: <outdir>/f_NNNN.jpg (rendered frames), run_log.json, probe.json, plan.json, perf.json, play_results.json
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
const GLQ = () => {   // WebGL load counters (runs in the page before any script; counts what the GPU is asked to do)
  const S = (window.__glq = { draws: 0, tris: 0, points: 0, lines: 0, texBytes: 0, texCount: 0, programs: 0, maxTexDim: 0, uploads: 0 });
  const bpp = (f) => ({ 0x8058: 4, 0x8c43: 4, 0x8051: 4, 0x8c41: 4, 0x1908: 4, 0x1907: 4, 0x8229: 1, 0x822b: 2, 0x1903: 1, 0x881a: 8, 0x8814: 16, 0x88f0: 4, 0x81a5: 2, 0x81a6: 4, 0x8cac: 4, 0x1909: 1, 0x190a: 2 })[f] || 4;
  const wrap = (proto) => {
    if (!proto || proto.__glq) return; proto.__glq = 1;
    const o = {}; for (const k of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced', 'texImage2D', 'texStorage2D', 'createTexture', 'deleteTexture', 'bindTexture', 'activeTexture', 'createProgram', 'deleteProgram', 'generateMipmap']) o[k] = proto[k];
    const tri = (m, c, n = 1) => { if (m === 4) S.tris += Math.floor(c / 3) * n; else if (m === 5 || m === 6) S.tris += Math.max(0, c - 2) * n; else if (m === 0) S.points += c * n; else S.lines += c * n; };
    const st = (gl) => gl.__q || (gl.__q = { unit: 0, bound: {} });
    const setBytes = (gl, target, level, b, w, h) => { const t = st(gl).bound[st(gl).unit + ':' + (target === 0x0de1 ? 2 : 3)]; if (!t) return;
      t.__lv = t.__lv || {}; const old = Object.values(t.__lv).reduce((a, x) => a + x, 0) * (t.__mip ? 4 / 3 : 1); t.__lv[level] = b;
      const now = Object.values(t.__lv).reduce((a, x) => a + x, 0) * (t.__mip ? 4 / 3 : 1); S.texBytes += now - old; S.maxTexDim = Math.max(S.maxTexDim, w || 0, h || 0); S.uploads++; };
    proto.drawArrays = function (m, f, c) { S.draws++; tri(m, c); return o.drawArrays.apply(this, arguments); };
    proto.drawElements = function (m, c) { S.draws++; tri(m, c); return o.drawElements.apply(this, arguments); };
    if (o.drawArraysInstanced) proto.drawArraysInstanced = function (m, f, c, n) { S.draws++; tri(m, c, n); return o.drawArraysInstanced.apply(this, arguments); };
    if (o.drawElementsInstanced) proto.drawElementsInstanced = function (m, c, ty, off, n) { S.draws++; tri(m, c, n); return o.drawElementsInstanced.apply(this, arguments); };
    proto.createTexture = function () { const t = o.createTexture.apply(this, arguments); if (t) S.texCount++; return t; };
    proto.deleteTexture = function (t) { if (t && !t.__del) { t.__del = 1; S.texCount--; const b = Object.values(t.__lv || {}).reduce((a, x) => a + x, 0) * (t.__mip ? 4 / 3 : 1); S.texBytes -= b; } return o.deleteTexture.apply(this, arguments); };
    proto.activeTexture = function (u) { st(this).unit = u; return o.activeTexture.apply(this, arguments); };
    proto.bindTexture = function (target, t) { st(this).bound[st(this).unit + ':' + (target === 0x0de1 ? 2 : 3)] = t; return o.bindTexture.apply(this, arguments); };
    proto.generateMipmap = function (target) { const t = st(this).bound[st(this).unit + ':' + (target === 0x0de1 ? 2 : 3)]; if (t && !t.__mip && t.__lv) { const b = Object.values(t.__lv).reduce((a, x) => a + x, 0); S.texBytes += b / 3; t.__mip = 1; } return o.generateMipmap.apply(this, arguments); };
    proto.texStorage2D = function (target, levels, f, w, h) {
      let b = 0; for (let l = 0; l < levels; l++) b += Math.max(1, w >> l) * Math.max(1, h >> l) * bpp(f); if (target === 0x8513) b *= 6;
      setBytes(this, target, 'storage', b, w, h); return o.texStorage2D.apply(this, arguments); };
    proto.texImage2D = function (target, level, f, a3, a4) {
      let w, h; if (arguments.length >= 9) { w = a3; h = a4; } else { const src = arguments[5]; w = src && (src.videoWidth || src.naturalWidth || src.width); h = src && (src.videoHeight || src.naturalHeight || src.height); }
      if (w && h) setBytes(this, target === 0x0de1 ? 0x0de1 : 0x8513, (target === 0x0de1 ? '' : target + ':') + level, w * h * bpp(f), w, h);
      return o.texImage2D.apply(this, arguments); };
    proto.createProgram = function () { S.programs++; return o.createProgram.apply(this, arguments); };
  };
  wrap(window.WebGL2RenderingContext && WebGL2RenderingContext.prototype); wrap(window.WebGLRenderingContext && WebGLRenderingContext.prototype);
};
const rotq = (q, v) => { const [x, y, z, w] = q, [vx, vy, vz] = v; const ix = w * vx + y * vz - z * vy, iy = w * vy + z * vx - x * vz, iz = w * vz + x * vy - y * vx, iw = -x * vx - y * vy - z * vz;
  return [ix * w + iw * -x + iy * -z - iz * -y, iy * w + iw * -y + iz * -x - ix * -z, iz * w + iw * -z + ix * -y - iy * -x]; };
const sub = (a, b) => a.map((v, i) => v - b[i]), dot = (a, b) => a.reduce((s, v, i) => s + v * b[i], 0), norm = (a) => Math.hypot(...a), unit = (a) => { const n = norm(a) || 1; return a.map((v) => v / n); };
(async () => {
  const [dir, out, speedArg = '1.4'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const W = 412, H = 915, fps = 30, speed = +speedArg, SHOTS = process.env.SHOTS || 'all', NST = +(process.env.STILLS || 6);
  const K = JSON.parse(fs.readFileSync(path.join(dir, 'kit.json'), 'utf8'));
  const disk = fs.readFileSync(path.join(dir, 'play3.html'), 'utf8');
  let port, srv;
  for (let tries = 0; tries < 20 && !srv; tries++) {   // a server VERIFIED to serve <dir> (a busy port once served another folder)
    port = 9400 + Math.floor(Math.random() * 400);
    const s = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dir, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1200));
    const served = await fetch(`http://127.0.0.1:${port}/play3.html`).then((r) => r.text()).catch(() => '');
    if (served === disk) srv = s; else s.kill();
  }
  if (!srv) throw new Error('could not start a server that verifiably serves ' + dir);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--enable-precise-memory-info'] });
  const errors = [], netErrors = [], T0 = Date.now();
  const unproject = (cam, b) => {   // Benny's world position from his screen anchor + camera distance (bennyInfo) and the camera pose
    const fov = (cam.fov || K.fov) * Math.PI / 180, ty = Math.tan(fov / 2), nx = 2 * b.x / W - 1, ny = 1 - 2 * b.y / H;
    const d = unit(rotq(cam.q, unit([nx * ty * W / H, ny * ty, -1]))); return cam.p.map((v, i) => v + d[i] * b.dist); };
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36' });
    await ctx.addInitScript(GLQ);
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 300)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 300)); });
    page.on('crash', () => errors.push('PAGE CRASHED'));
    page.on('requestfailed', (r) => netErrors.push(`${r.url().split('/').pop()} failed: ${r.failure()?.errorText}`));
    page.on('response', (r) => { if (r.status() >= 400) netErrors.push(`${r.url().split('/').pop()} HTTP ${r.status()}`); });
    const url = `http://127.0.0.1:${port}/play3.html?w=${W}&h=${H}`;
    const load = async () => { const t = Date.now(); await page.goto(url); await page.waitForFunction(() => window.ready === true, null, { timeout: 900000 }); return (Date.now() - t) / 1000; };
    // one evaluate per frame: step + everything the checks need (the step() cost is timed alone)
    const frameEval = ([t, dt, sp, fit]) => {
      const t0 = performance.now(); const r = window.step(t, dt, 0, sp); const stepMs = performance.now() - t0;
      const s = window.state ? window.state() : {}; const cam = window.camInfo ? window.camInfo() : null;
      const benny = window.bennyInfo ? window.bennyInfo() : null; const endK = window.endK ? window.endK() : null;
      const spl = window.qaSplash ? window.qaSplash() : null; let box = null;
      if (fit && window.qaBennyFit) { const b = window.qaBennyFit(1, -(s.height || 0), 0); if (b && b.top < 1e8) box = [b.xL, b.top, b.xR, b.lowestAbove]; }
      const cs = window.coinScreen ? window.coinScreen() : null; let ov = null;
      if (cs) { ov = 0; const big = cs.filter((c) => c.r >= 6); for (let a = 0; a < big.length; a++) for (let b2 = a + 1; b2 < big.length; b2++) if (Math.hypot(big[a].x - big[b2].x, big[a].y - big[b2].y) < big[a].r + big[b2].r) ov++; }
      return { ...r, ...s, stepMs: +stepMs.toFixed(3), cam, benny, endK, splash: spl && { v: spl.visible, o: +(+spl.opacity).toFixed(3) }, box, coinsOnScreen: cs ? cs.length : null, coinOverlaps: ov,
        heap: performance.memory ? performance.memory.usedJSHeapSize : null };
    };
    // ---------------- 1. PROBE (no input, no rendering) ----------------
    const loadProbe = await load();
    const glAtLoad = await page.evaluate(() => ({ ...window.__glq }));
    const layout = await page.evaluate(() => (window.coinLayout ? window.coinLayout() : null));
    const sEnd = await page.evaluate(() => (window.levelEnd ? window.levelEnd() : null));
    const probe = []; const nGuess = Math.ceil(((sEnd || 32) / speed + 0.6) * fps);
    for (let i = 0; i < nGuess; i++) {
      const o = await page.evaluate(frameEval, [i / fps, i === 0 ? 0 : 1 / fps, speed, false]);
      probe.push({ i, s: o.s, stepMs: o.stepMs, cam: o.cam, bw: o.cam && o.benny ? unproject(o.cam, o.benny) : null, done: o.done });
      if (o.done) break;
    }
    // path tangent + heading change rate (deg/s) over +-3 frames; lateral offset of the swum path from the tunnel axis
    const A = K.A, RR = K.RR, NUP = K.NUP, A0 = K.A0;
    const P = probe.map((x) => x.bw);
    const yawAt = (i) => { const a = P[Math.max(0, i - 3)], b = P[Math.min(P.length - 1, i + 3)]; if (!a || !b) return 0; const T = sub(b, a); return Math.atan2(dot(T, RR), dot(T, A)) * 180 / Math.PI; };
    for (let i = 0; i < probe.length; i++) {
      if (!P[i]) continue;
      const a = P[Math.max(0, i - 3)], b = P[Math.min(P.length - 1, i + 3)], T = sub(b, a);
      probe[i].heading = { yawDeg: +yawAt(i).toFixed(3), pitchDeg: +(Math.atan2(dot(T, NUP), dot(T, A)) * 180 / Math.PI).toFixed(3) };
      // bend rate in the river plane (yaw only: Benny's up-down bob is not a bend), over +-6 frames
      probe[i].turnDegPerS = i >= 9 && i + 9 < P.length ? +(Math.abs(yawAt(i + 6) - yawAt(i - 6)) / (12 / fps)).toFixed(3) : 0;
      probe[i].latAxis = +dot(sub(P[i], A0), RR).toFixed(4); probe[i].upAxis = +dot(sub(P[i], A0), NUP).toFixed(4);
    }
    fs.writeFileSync(`${out}/probe.json`, JSON.stringify({ load_s: loadProbe, frames: probe.length, sEnd, glAtLoad, probe }, null, 0));
    const turn = probe.map((x) => x.turnDegPerS || 0), yaw = probe.map((x) => x.heading?.yawDeg ?? 0);
    console.log('probe', probe.length, 'frames; max turn', Math.max(...turn).toFixed(2), 'deg/s; yaw range', Math.min(...yaw).toFixed(2), Math.max(...yaw).toFixed(2), 'load', loadProbe, 's');
    // ---------------- 2. the swipe plan ----------------
    const v = speed, tEnd = (sEnd || 32) / v, DUR = { left: 0.3, right: 0.3, up: 0.75, down: 1.0 }, PLAN = process.env.PLAN || 'coins';
    const ev = [], other = (d) => (d === 'left' ? 'right' : 'left'), outDir = (l) => (l <= 0 ? (l < 0 ? 'right' : 'left') : 'left');
    const nDir = (d) => ev.filter((e) => e[1] === d).length, got = {};
    const peaks = probe.filter((x, i) => (x.turnDegPerS || 0) >= 4 && (x.turnDegPerS || 0) >= Math.max(...probe.slice(Math.max(0, i - 20), i + 21).map((y) => y.turnDegPerS || 0)) - 1e-9).sort((a, b) => b.turnDegPerS - a.turnDegPerS);
    if (PLAN === 'coins') {
      // the coin-trail player of final_acceptance.cjs (r32b/r33, unchanged logic): lane changes before coin runs, a leap under each air
      // arc, extra dives / leaps and out-and-back lane moves in the gaps, >= 4 leaps and >= 4 dives
      const cs = (layout || []).slice().sort((a, b) => a.s - b.s); let lane = 0, busy = 0.6;
      const add = (t, d, why) => { t = Math.max(t, busy); ev.push([+t.toFixed(3), d, why]); busy = t + DUR[d]; };
      for (let k = 0; k < cs.length; k++) {
        const c = cs[k], tc = c.s / v, want = Math.max(-1, Math.min(1, Math.round(c.lat / 0.22)));
        while (lane !== want) { const d = want < lane ? 'left' : 'right'; add(tc - 0.6, d, 'coin lane'); lane += d === 'left' ? -1 : 1; }
        if (c.h > 0.15) { let e = k; while (e + 1 < cs.length && cs[e + 1].h > 0.15 && cs[e + 1].s - cs[e].s < 0.8) e++;
          const top = cs.slice(k, e + 1).reduce((a, b) => (b.h > a.h ? b : a)); add(top.s / v - 0.31, 'up', 'coin arc'); k = e; }
      }
      const laneAt = (t) => { let l = 0; for (const [te, d] of ev.slice().sort((a, b) => a[0] - b[0])) { if (te > t) break; if (d === 'left') l = Math.max(-1, l - 1); if (d === 'right') l = Math.min(1, l + 1); } return l; };
      const base = ev.slice().sort((a, b) => a[0] - b[0]), marks = [[0, null], ...base, [tEnd - 0.4, null]];
      for (let k = 0; k + 1 < marks.length; k++) {
        let gs = marks[k][0] + (marks[k][1] ? DUR[marks[k][1]] : 0.6) + 0.15; const ge = marks[k + 1][0] - 0.45;
        const vDir = () => (nDir('down') <= nDir('up') ? 'down' : 'up');
        for (let m = 0; m < 2; m++) { const d = vDir(); if (ge - gs < DUR[d] + 0.15) break; ev.push([+gs.toFixed(3), d, 'extra']); gs += DUR[d] + 0.15; }
        if (ge - gs >= 0.95) { const l = laneAt(gs), o = outDir(l); ev.push([+gs.toFixed(3), o, 'extra'], [+(gs + 0.5).toFixed(3), other(o), 'extra']); }
      }
      for (const d of ['up', 'down', 'up', 'down', 'up', 'down', 'up', 'down']) {
        if (nDir(d) >= 4) continue; let best = null, bestGap = 0;
        for (let t = 1.0; t < tEnd - 1.6; t += 0.05) { const clear = Math.min(...ev.map(([te, de]) => (te > t ? te - t - DUR[d] - 0.12 : t - te - DUR[de] - 0.12))); if (clear > bestGap) { bestGap = clear; best = t; } }
        if (best !== null && bestGap > 0) ev.push([+best.toFixed(3), d, 'extra (coverage)']);
      }
    } else {
      // STRESS: the whole level filled with lane-neutral test blocks (coins are not the goal here): rapid reversals, repeated
      // same-direction swipes (incl. into the river edge), lane changes during a leap / a dive, leaps, dives, lane shifts so every
      // block also runs from the side lanes; steering at the river's sharpest bends (probe) is placed first
      const BLOCK = {
        reversal: (l) => { const a = l >= 0 ? 'left' : 'right'; return { ev: [[0, a], [0.15, other(a)]], len: 0.6, dl: 0 }; },
        double: (l) => l === 0 ? { ev: [[0, 'left'], [0.3, 'left'], [0.65, 'right']], len: 1.0, dl: 0 }
          : { ev: [[0, other(l > 0 ? 'right' : 'left')], [0.3, other(l > 0 ? 'right' : 'left')], [0.75, l > 0 ? 'right' : 'left'], [1.05, l > 0 ? 'right' : 'left']], len: 1.4, dl: 0 },
        airSteer: (l) => { const d = outDir(l); return { ev: [[0, 'up'], [0.2, d], [0.85, other(d)]], len: 1.2, dl: 0 }; },
        diveSteer: (l) => { const d = outDir(l); return { ev: [[0, 'down'], [0.3, d], [1.0, other(d)]], len: 1.35, dl: 0 }; },
        curve: (l) => { const d = outDir(l); return { ev: [[0, d], [0.55, other(d)]], len: 0.9, dl: 0 }; },
        up: () => ({ ev: [[0, 'up']], len: 0.8, dl: 0 }), down: () => ({ ev: [[0, 'down']], len: 1.05, dl: 0 }),
        shiftL: (l) => (l > -1 ? { ev: [[0, 'left']], len: 0.45, dl: -1 } : null), shiftR: (l) => (l < 1 ? { ev: [[0, 'right']], len: 0.45, dl: 1 } : null),
      };
      const SEQ = ['reversal', 'up', 'shiftL', 'reversal', 'airSteer', 'double', 'reversal', 'down', 'shiftR', 'diveSteer', 'shiftR', 'reversal', 'double', 'up', 'airSteer', 'down', 'shiftL', 'diveSteer', 'shiftL', 'up', 'down', 'reversal', 'shiftR'];
      let t = 0.8, lane = 0, k = 0; const curveTimes = peaks.map((x) => x.i / fps - 0.15).filter((x) => x > 0.8 && x < tEnd - 1.5).sort((a, b) => a - b);
      while (t < tEnd - 1.6) {
        let kind = SEQ[k % SEQ.length]; const ct = curveTimes.find((c) => c >= t && c < t + 1.0);
        let b; if (ct !== undefined && (got.curve || 0) < 6) { kind = 'curve'; t = ct; b = BLOCK.curve(lane); curveTimes.splice(curveTimes.indexOf(ct), 1); } else { b = BLOCK[kind](lane); k++; }
        if (!b) continue; if (t + b.len > tEnd - 0.4) break;
        for (const [o, d] of b.ev) ev.push([+(t + o).toFixed(3), d, 'test: ' + kind]);
        lane += b.dl; got[kind] = (got[kind] || 0) + 1; t += b.len + 0.12;
      }
    }
    const plan = ev.sort((a, b) => a[0] - b[0]);
    fs.writeFileSync(`${out}/plan.json`, JSON.stringify({ planKind: PLAN, layout, sEnd, speed, blocks: got, directions: { left: nDir('left'), right: nDir('right'), up: nDir('up'), down: nDir('down') }, curve_peaks: peaks.slice(0, 8).map((x) => ({ i: x.i, turnDegPerS: x.turnDegPerS })), plan }, null, 1));
    console.log('plan', PLAN, plan.length, 'swipes', JSON.stringify(got), JSON.stringify({ left: nDir('left'), right: nDir('right'), up: nDir('up'), down: nDir('down') }));
    // ---------------- 3. the real run ----------------
    await page.reload(); await page.waitForFunction(() => window.ready === true, null, { timeout: 900000 });
    const cdp = await ctx.newCDPSession(page);
    const swipe = async (d) => {   // a real finger swipe over ~120 ms in the lower middle of the screen
      const x0 = W / 2, y0 = H * 0.7, L = 140, [dx, dy] = { left: [-L, 0], right: [L, 0], up: [0, -L], down: [0, L] }[d];
      const pt = (k) => [{ x: x0 + dx * k, y: y0 + dy * k, id: 1, radiusX: 8, radiusY: 8, force: 1 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(0) });
      for (const k of [0.25, 0.5, 0.75, 1]) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(k) }); await new Promise((r) => setTimeout(r, 30)); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    const nMax = probe.length + 2, stillAt = Array.from({ length: NST }, (_, k) => Math.round((0.05 + 0.9 * k / Math.max(1, NST - 1)) * (probe.length - 1)));
    const render = (i) => SHOTS === 'all' || (SHOTS === 'quick' && (i < 90 || stillAt.includes(i))) || (SHOTS === 'stills' && (i === 0 || stillAt.includes(i))) || (SHOTS.startsWith('list:') && SHOTS.slice(5).split(',').map(Number).includes(i));
    const log = [], perf = []; let pi = 0, n2 = nMax;
    for (let i = 0; i < n2; i++) {
      const t = i / fps;
      while (pi < plan.length && plan[pi][0] <= t) { await swipe(plan[pi][1]); log.push({ swipe: plan[pi][1], t: +t.toFixed(3), why: plan[pi][2] }); pi++; }
      const o = await page.evaluate(frameEval, [t, i === 0 ? 0 : 1 / fps, speed, true]);
      if (o.done && n2 === nMax) n2 = i + 1;
      if (o.cam && o.benny) o.bw = unproject(o.cam, o.benny).map((x) => +x.toFixed(5));
      if (render(i)) {
        const g = await page.evaluate(async () => { const a = { ...window.__glq }; const t0 = performance.now(); await window.renderNow(1); const ms = performance.now() - t0 - 30; const b = { ...window.__glq };
          return { draws: (b.draws - a.draws) / 2, tris: (b.tris - a.tris) / 2, points: (b.points - a.points) / 2, texCount: b.texCount, texMB: +(b.texBytes / 1048576).toFixed(1), programs: b.programs, maxTexDim: b.maxTexDim, renderSubmitMsPer: +(ms / 2).toFixed(2) }; });
        perf.push({ i, ...g });
        await page.screenshot({ path: `${out}/f_${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92, timeout: 600000 });
      }
      log.push({ i, t: +t.toFixed(3), ...o });
      if (i % 30 === 0) { console.log('frame', i, '/', n2, 's', o.s, 'lane', o.lane, 'h', o.height, 'coins', o.coins, 'step', o.stepMs, 'ms', new Date().toISOString().slice(11, 19)); fs.writeFileSync(`${out}/run_log.json`, JSON.stringify(log)); }
    }
    fs.writeFileSync(`${out}/run_log.json`, JSON.stringify(log));
    const memEnd = await page.evaluate(() => (performance.memory ? performance.memory.usedJSHeapSize : null));
    fs.writeFileSync(`${out}/perf.json`, JSON.stringify({ render_frames: perf, gl_at_load: glAtLoad, heap_end: memEnd }, null, 1));
    fs.writeFileSync(`${out}/play_results.json`, JSON.stringify({ errors, net_errors: netErrors, frames: log.filter((x) => x.i !== undefined).length, swipes: log.filter((x) => x.swipe).length,
      shots: SHOTS, stills: stillAt, plan: process.env.PLAN || 'coins', wall_seconds: (Date.now() - T0) / 1000, probe_load_s: loadProbe, game: dir, W, H, fps, speed }, null, 1));
    console.log('done', (Date.now() - T0) / 1000, 's; errors', errors.length, 'net', netErrors.length);
  } finally { await browser.close(); srv.kill(); }
})();
