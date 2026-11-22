// Fast LOGIC-ONLY self-check against the lead's /home/user/rainbow-/tools/marble05/viewer/final_acceptance.cjs:
// the same device (412x915, dpr 1, isMobile, hasTouch, Android UA), the same 7.6 s at 30 fps, speed 1.4, the same plan and the
// same REAL CDP touch swipes (touchStart + 4 touchMoves 30 ms apart + touchEnd, 140 px, at x = 206, y = 640.5), the same
// per-frame read (window.step(...) merged with window.state(), window.camInfo ? camInfo() : null) and the same automatic checks
// -- but NO renderNow / screenshots (SwiftShader takes ~30 s per frame). Adds a per-swipe response analysis.
// usage: NODE_PATH=$(npm root -g) node acceptance_logic.cjs [seconds=7.6] [speed=1.4]  -> acceptance_logic.json (run from the folder to test,
// e.g. node mergedtest/acceptance_logic.cjs: it serves its own folder)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
const { serveHere } = require('./serve.cjs');
(async () => {
  const [secs = '7.6', speed = '1.4'] = process.argv.slice(2);
  const W = 412, H = 915, fps = 30, n = Math.round(+secs * fps);
  const srv = await serveHere();
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errors = [], log = [], T0 = Date.now(); let res = {};
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true,
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36' });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => errors.push('pageerror: ' + String(e).slice(0, 300)));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 300)); });
    await page.goto(`${srv.url}/play3.html?w=${W}&h=${H}`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 900000 });
    const load_s = +((Date.now() - T0) / 1000).toFixed(1);
    const api = await page.evaluate(() => ({ step: typeof window.step, state: typeof window.state, renderNow: typeof window.renderNow, camInfo: typeof window.camInfo, input: typeof window.input }));
    // what element receives a touch at the acceptance test's swipe point (an overlay there would swallow canvas-only listeners)
    const hitEl = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? e.tagName + (e.id ? '#' + e.id : '') : null; }, [W / 2, H * 0.7]);
    const cdp = await ctx.newCDPSession(page);
    const swipe = async (dir) => {          // IDENTICAL to final_acceptance.cjs
      const x0 = W / 2, y0 = H * 0.7, d = 140, [dx, dy] = { left: [-d, 0], right: [d, 0], up: [0, -d], down: [0, d] }[dir];
      const pt = (k) => [{ x: x0 + dx * k, y: y0 + dy * k, id: 1, radiusX: 8, radiusY: 8, force: 1 }];
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(0) });
      for (const k of [0.25, 0.5, 0.75, 1]) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(k) }); await new Promise((r) => setTimeout(r, 30)); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    const plan = [[0.9, 'left'], [1.6, 'left'], [2.3, 'right'], [2.9, 'up'], [3.7, 'right'], [4.3, 'right'], [4.9, 'down'], [5.6, 'left'], [6.2, 'up'], [6.9, 'left']];
    let pi = 0; const afterSwipe = [];
    for (let i = 0; i < n; i++) {
      const t = i / fps;
      while (pi < plan.length && plan[pi][0] <= t) {
        await swipe(plan[pi][1]); log.push({ swipe: plan[pi][1], t: +t.toFixed(3) });
        afterSwipe.push(await page.evaluate(() => { const s = window.state(); return { lane: s.lane, move: s.move, queued: s.queued, swipes: s.swipes }; })); // read-only
        pi++;
      }
      const o = await page.evaluate(([t, dt, sp]) => { const r = window.step(t, dt, 0, sp); return Object.assign({}, r, window.state ? window.state() : {}); }, [t, i === 0 ? 0 : 1 / fps, +speed]);
      const cam = await page.evaluate(() => (window.camInfo ? window.camInfo() : null));
      log.push({ i, t: +t.toFixed(3), ...o, cam });
    }
    const inputLog = await page.evaluate(() => window.input.log);
    const hud = await page.evaluate(() => document.getElementById('coins').textContent);
    // ---- the lead's automatic checks, verbatim ----
    const fr = log.filter((x) => x.i !== undefined);
    const dS = fr.slice(1).map((x, k) => x.s - fr[k].s), dLat = fr.slice(1).map((x, k) => Math.abs((x.lat ?? 0) - (fr[k].lat ?? 0)));
    const dH = fr.slice(1).map((x, k) => Math.abs((x.height ?? 0) - (fr[k].height ?? 0)));
    const lead = {
      frames: fr.length, seconds: +(fr.length / fps).toFixed(2), errors,
      forward: { min_step: Math.min(...dS), max_step: Math.max(...dS), freezes: dS.filter((v) => v <= 1e-6).length },
      lateral: { max_step_per_frame: Math.max(...dLat), teleports_over_0_06: dLat.filter((v) => v > 0.06).length, lanes_seen: [...new Set(fr.map((x) => x.lane))] },
      vertical: { max_step_per_frame: Math.max(...dH), max_height: Math.max(...fr.map((x) => x.height ?? 0)), min_height: Math.min(...fr.map((x) => x.height ?? 0)) },
      coins: { start: fr[0].coins, end: fr[fr.length - 1].coins },
      swipes_sent: log.filter((x) => x.swipe).length,
    };
    // ---- per-swipe response ----
    const EXPECT = ['lane -1', 'stay -1 (left edge: wobble only)', 'lane 0', 'leap', 'lane +1', 'stay +1 (right edge: wobble only)', 'dive', 'queued during the dive, then lane 0', 'leap', 'lane -1'];
    const sw = log.filter((x) => x.swipe);
    const swipes = sw.map((x, k) => {
      const f0 = Math.round(x.t * fps), f1 = k + 1 < sw.length ? Math.round(sw[k + 1].t * fps) : fr.length; // [f0, f1): frames stepped after this swipe
      const rows = fr.slice(f0, f1), before = f0 > 0 ? fr[f0 - 1] : fr[0], last = rows[rows.length - 1];
      const il = inputLog[k] || {};
      const r = { dir: x.swipe, t: x.t, expect: EXPECT[k], src: il.src, input_clock: il.clock, expected_clock: +((f0 - 1) / fps).toFixed(3),
        state_right_after_swipe: afterSwipe[k], lane_before: before.lane, lane_end: last.lane, lat_end: last.lat, to_t: +((f1 - 1) / fps).toFixed(3) };
      const fl = rows.find((y) => y.lane !== before.lane); r.lane_change_at = fl ? fl.t : null;
      r.maxH = Math.max(...rows.map((y) => y.height)); r.minH = Math.min(...rows.map((y) => y.height));
      const fu = rows.find((y) => y.height > 0.001), fd = rows.find((y) => y.height < -0.001);
      r.leap_start_at = fu ? fu.t : null; r.dive_start_at = fd ? fd.t : null;
      r.coins_gained = last.coins - before.coins;
      const want = { 'lane -1': () => r.lane_end === -1 && r.lane_change_at !== null, 'lane 0': () => r.lane_end === 0 && r.lane_change_at !== null, 'lane +1': () => r.lane_end === 1 && r.lane_change_at !== null,
        'stay -1 (left edge: wobble only)': () => r.lane_before === -1 && r.lane_end === -1, 'stay +1 (right edge: wobble only)': () => r.lane_before === 1 && r.lane_end === 1,
        leap: () => r.maxH > 0.25, dive: () => r.minH < -0.25, 'queued during the dive, then lane 0': () => afterSwipe[k].queued === 'left' && r.lane_end === 0 && r.lane_change_at !== null };
      r.ok = !!(want[EXPECT[k]] && want[EXPECT[k]]()) && il.src === 'touch';
      return r;
    });
    // smoothness extras
    const d2 = (key) => { let m = 0; for (let i = 2; i < fr.length; i++) m = Math.max(m, Math.abs(fr[i][key] - 2 * fr[i - 1][key] + fr[i - 2][key])); return +m.toFixed(5); };
    const cams = fr.map((x) => x.cam).filter(Boolean).map((c) => ({ ...c, pos: c.pos || c.p })); // my camInfo {pos} or the lead's merged {p, q}
    const camStep = cams.slice(1).map((c, k) => Math.hypot(...c.pos.map((v, j) => v - cams[k].pos[j])));
    const extra = { lat_d2: d2('lat'), height_d2: d2('height'), camLat_d2: d2('camLat'), camH_d2: d2('camH'), maxAbsLat: Math.max(...fr.map((x) => Math.abs(x.lat))),
      maxAbsCamLat: Math.max(...fr.map((x) => Math.abs(x.camLat))), camH_range: [Math.min(...fr.map((x) => x.camH)), Math.max(...fr.map((x) => x.camH))],
      cam_pos_step_per_frame: cams.length > 1 ? { min: +Math.min(...camStep).toFixed(4), max: +Math.max(...camStep).toFixed(4) } : null,
      cam_toBenny_range: cams.length && cams[0].toBenny != null ? [Math.min(...cams.map((c) => c.toBenny)), Math.max(...cams.map((c) => c.toBenny))] : null,
      cam_aboveWater_min: cams.length && cams[0].aboveWater != null ? Math.min(...cams.map((c) => c.aboveWater)) : null,
      got_by_kind: fr[fr.length - 1].got, hud_end: hud, hud_matches: hud.replace(/[^0-9]/g, '') === String(fr[fr.length - 1].coins) };
    res = { what: 'logic-only replica of final_acceptance.cjs (no renderNow / screenshots)', load_s, api, touch_target_at_swipe_point: hitEl, lead_checks: lead,
      pass: { no_errors: errors.length === 0, no_freeze: lead.forward.freezes === 0, no_teleport: lead.lateral.teleports_over_0_06 === 0,
        lanes_all_seen: [-1, 0, 1].every((l) => lead.lateral.lanes_seen.includes(l)), leap_up: lead.vertical.max_height > 0, dive_down: lead.vertical.min_height < 0,
        coins_increase: lead.coins.end > lead.coins.start, all_10_swipes_as_intended: swipes.every((x) => x.ok), renderNow_exists: api.renderNow === 'function', camInfo_exists: api.camInfo === 'function' },
      swipes, extra, input_log: inputLog, wall_s: +((Date.now() - T0) / 1000).toFixed(0),
      frames_compact: fr.map((x) => [x.i, x.s, x.lane, x.lat, x.height, x.coins, x.move, x.queued, x.camLat, x.camH]) };
    console.log(JSON.stringify({ load_s, api, hitEl, lead, pass: res.pass }, null, 1));
    for (const x of swipes) console.log(x.ok ? 'OK ' : 'BAD', x.t, x.dir, '|', x.expect, '| src', x.src, 'clock', x.input_clock, '(exp', x.expected_clock + ')', 'after:', JSON.stringify(x.state_right_after_swipe), 'lane', x.lane_before, '->', x.lane_end, '@', x.lane_change_at, 'maxH', x.maxH, 'minH', x.minH, 'coins+', x.coins_gained);
  } catch (e) { res.fatal = String(e).slice(0, 500); res.errors = errors; console.log('ERROR', e); }
  finally { fs.writeFileSync(path.join(__dirname, 'acceptance_logic.json'), JSON.stringify(res, null, 1)); await browser.close(); srv.close(); console.log('done', ((Date.now() - T0) / 1000).toFixed(0) + 's'); }
})();
