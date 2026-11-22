// Rainbow screen kit: whole-level run of a kit screen (tools/reflock/section_run.cjs 'run' mode + the kit's per-frame physical QA):
// real CDP touch swipes (TOUCH=1), every frame saved, Benny on screen, camera step / turn, static world, and per frame window.kitFrameQA():
// camera clearance from the scenery, Benny's water gap + posture vs the real water surface, immersion.
//   TOUCH=1 NODE_PATH=$(npm root -g) node tools/screenkit/kit_run.cjs <game folder> <out> '<plan json>' '<query>'
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dir, out, planArg, query = ''] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const W = 412, H = 915, fps = 30, speed = 2.2, plan = JSON.parse(planArg);
  const port = 9300 + Math.floor(Math.random() * 600); const srv = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dir, stdio: 'ignore' }); await new Promise((r) => setTimeout(r, 1200));
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const errs = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true }); const page = await ctx.newPage();
    page.on('pageerror', (e) => errs.push(String(e).slice(0, 400))); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 400)); });
    // r44: START_S / END_S (env) record one stretch of a long route (e.g. the world: one join, uninterrupted, from before it to after it)
    const S0 = process.env.START_S ? +process.env.START_S : null, S1 = process.env.END_S ? +process.env.END_S : null;
    await page.goto(`http://127.0.0.1:${port}/play3.html?w=${W}&h=${H}${query ? '&' + query : ''}${S0 !== null ? '&s0=' + S0 : ''}`); await page.waitForFunction(() => window.ready === true, null, { timeout: 1200000 });
    const info = await page.evaluate(() => window.sectionInfo()); const END = S1 ?? info.LEVEL; const n = Math.ceil((END - (S0 ?? info.S_REF)) / speed * fps) + 10;
    const cdp = process.env.TOUCH === '1' ? await ctx.newCDPSession(page) : null, gestures = [];
    for (const [t0, d] of plan) { const f0 = Math.round(t0 * fps), y = 0.62 * H;
      if (d === 'left' || d === 'right') { const sx = d === 'left' ? 0.65 * W : 0.35 * W, ex = d === 'left' ? 0.35 * W : 0.65 * W; gestures.push([f0, 'touchStart', sx, y]); for (let k = 1; k <= 4; k++) gestures.push([f0 + k, 'touchMove', sx + (ex - sx) * k / 4, y + 3 * k]); gestures.push([f0 + 5, 'touchEnd', ex, y + 15]); }
      else { const sy = d === 'up' ? 0.7 * H : 0.5 * H, ey = d === 'up' ? 0.5 * H : 0.7 * H; gestures.push([f0, 'touchStart', W / 2, sy]); for (let k = 1; k <= 4; k++) gestures.push([f0 + k, 'touchMove', W / 2 + 2 * k, sy + (ey - sy) * k / 4]); gestures.push([f0 + 5, 'touchEnd', W / 2, ey]); } }
    const audit0 = await page.evaluate(() => window.sceneAudit()); const log = []; let pi = 0;
    for (let i = 0; i < n; i++) { const t = i / fps;
      if (cdp) for (const g of gestures.filter((g) => g[0] === i)) await cdp.send('Input.dispatchTouchEvent', { type: g[1], touchPoints: g[1] === 'touchEnd' ? [] : [{ x: g[2], y: g[3], id: 1, radiusX: 8, radiusY: 8, force: 1 }] });
      else while (pi < plan.length && plan[pi][0] <= t + 1e-9) await page.evaluate((d) => window.input.swipe(d), plan[pi++][1]);
      const o = await page.evaluate(([t, dt, sp]) => window.step(t, dt, 0, sp), [t, i === 0 ? 0 : 1 / fps, speed]);
      const fr = { i, t: +t.toFixed(3), s: o.s, lat: o.lat, coins: o.coins, box: await page.evaluate(() => window.bennyBox()), cam: await page.evaluate(() => window.camInfo()), qa: await page.evaluate(() => window.kitFrameQA()) };
      await page.evaluate(() => window.renderNow(1)); const f = path.join(out, `f_${String(i).padStart(5, '0')}.png`); await page.screenshot({ path: f }); fr.file = path.basename(f);
      log.push(fr); if (i % 60 === 0) console.log('frame', i, 's', o.s, 'lat', o.lat, JSON.stringify(fr.qa));
      if (o.s >= END - 0.01) break; }
    const audit1 = await page.evaluate(() => window.sceneAudit()); const inLog = await page.evaluate(() => (window.input?.log ?? []).map((e) => ({ ...e })));
    const moved = audit0.filter((a, k) => JSON.stringify(a.m) !== JSON.stringify(audit1[k]?.m)).map((a) => a.name);
    const off = log.filter((f) => f.box.x0 < 0 || f.box.x1 > W || f.box.y0 < 0 || f.box.y1 > H).map((f) => f.i);
    const camStep = log.slice(1).map((f, k) => Math.hypot(...f.cam.p.map((x, j) => x - log[k].cam.p[j])));
    const angStep = log.slice(1).map((f, k) => { const a = f.cam.q, b = log[k].cam.q; const d = Math.abs(a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]); return 2 * Math.acos(Math.min(1, d)) * 180 / Math.PI; });
    const q = log.map((f) => f.qa), num = (a) => a.filter((x) => x !== null && Number.isFinite(x));
    const checks = { frames: log.length, errors: errs, benny_offscreen_frames: off.length, camera_max_step_u: +Math.max(...camStep).toFixed(4), camera_max_step_expected_u: +(speed / fps * 1.6).toFixed(4),
      camera_max_turn_deg_per_frame: +Math.max(...angStep).toFixed(3), static_world_meshes: audit0.length, scenery_meshes_moved: moved,
      camera_min_clearance_u: +Math.min(...num(q.map((x) => x.camClear))).toFixed(3), benny_water_gap_max_u: +Math.max(...num(q.map((x) => Math.abs(x.waterGap ?? 9)))).toFixed(4),
      benny_water_missing_frames: q.filter((x) => x.waterGap === null).length, benny_posture_vs_surface_max_deg: +Math.max(...num(q.map((x) => x.bennyTiltVsSurfaceDeg))).toFixed(2),
      route_normal_vs_surface_max_deg: +Math.max(...num(q.map((x) => x.slopeErrDeg))).toFixed(2), immersion_range: [Math.min(...num(q.map((x) => x.submerged))), Math.max(...num(q.map((x) => x.submerged)))],
      bank_range_deg: [Math.min(...q.map((x) => x.bank)), Math.max(...q.map((x) => x.bank))], swipes_sent: plan.length, swipes_detected: inLog.length, input: cdp ? 'real CDP touch' : 'API', input_log: inLog,
      coins_end: log[log.length - 1].coins, s_end: log[log.length - 1].s, lat_range: [Math.min(...log.map((f) => f.lat)), Math.max(...log.map((f) => f.lat))] };
    fs.writeFileSync(path.join(out, 'run_log.json'), JSON.stringify(log)); fs.writeFileSync(path.join(out, 'checks.json'), JSON.stringify(checks, null, 1)); console.log(JSON.stringify({ ...checks, input_log: undefined }));
  } finally { await browser.close(); srv.kill(); }
})();
