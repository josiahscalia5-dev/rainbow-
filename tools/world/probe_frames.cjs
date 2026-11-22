// Rainbow round 46 - frame probe: replay the SAME real-touch plan as tools/reflock/section_run.cjs up to chosen frames and inspect them.
//   node probe_frames.cjs <game folder> <out> <frames "409,415"> [plan JSON] [query] [points JSON [[x,y],...]]
// For every chosen frame: f_<n>.png (game view), id_<n>.png (surface families: wall red, ring blue, water cyan, foam yellow, trays magenta,
// other grey), and probe.json: Benny's box (incl. paddling deformation), camera, edge guard, kitFrameQA and, for each probe point, the real
// meshes under that pixel (window.qaPickScenery). Default points = a 7 x 10 grid. Same server / browser / viewport / speed as the recorder.
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dir, out, framesArg, planArg = '', query = 's0=88', ptsArg = ''] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const W = 412, H = 915, fps = 30, speed = 2.2, frames = framesArg.split(',').map(Number).sort((a, b) => a - b);
  const plan = planArg ? JSON.parse(planArg) : [];
  const pts = ptsArg ? JSON.parse(ptsArg) : (() => { const r = []; for (let y = 140; y < H; y += 80) for (let x = 30; x < W; x += 58) r.push([x, y]); return r; })();
  const disk = fs.readFileSync(path.join(dir, 'play3.html'), 'utf8'); let port, srv;
  for (let i = 0; i < 20 && !srv; i++) { port = 9300 + Math.floor(Math.random() * 600); const s = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dir, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1000)); const got = await fetch(`http://127.0.0.1:${port}/play3.html`).then((r) => r.text()).catch(() => ''); if (got === disk) srv = s; else s.kill(); }
  if (!srv) throw new Error('no server for ' + dir);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errs = [], res = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const page = await ctx.newPage(); page.on('pageerror', (e) => errs.push(String(e).slice(0, 400))); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 400)); });
    await page.goto(`http://127.0.0.1:${port}/play3.html?w=${W}&h=${H}${query ? '&' + query : ''}`);
    await page.waitForFunction(() => window.ready === true || window.__err, null, { timeout: 1200000 }).catch((e) => errs.push('ready timeout ' + e));
    const cdp = await ctx.newCDPSession(page), gestures = [];
    for (const [t0, dir_] of plan) { const f0 = Math.round(t0 * fps), y = 0.62 * H;
      if (dir_ === 'left' || dir_ === 'right') { const sx = dir_ === 'left' ? 0.65 * W : 0.35 * W, ex = dir_ === 'left' ? 0.35 * W : 0.65 * W;
        gestures.push([f0, 'touchStart', sx, y]); for (let k = 1; k <= 4; k++) gestures.push([f0 + k, 'touchMove', sx + (ex - sx) * k / 4, y + 3 * k]); gestures.push([f0 + 5, 'touchEnd', ex, y + 15]); }
      else { const sy = dir_ === 'up' ? 0.7 * H : 0.5 * H, ey = dir_ === 'up' ? 0.5 * H : 0.7 * H;
        gestures.push([f0, 'touchStart', W / 2, sy]); for (let k = 1; k <= 4; k++) gestures.push([f0 + k, 'touchMove', W / 2 + 2 * k, sy + (ey - sy) * k / 4]); gestures.push([f0 + 5, 'touchEnd', W / 2, ey]); } }
    const last = frames[frames.length - 1];
    for (let i = 0; i <= last; i++) {
      for (const g of gestures.filter((g) => g[0] === i)) await cdp.send('Input.dispatchTouchEvent', { type: g[1], touchPoints: g[1] === 'touchEnd' ? [] : [{ x: g[2], y: g[3], id: 1, radiusX: 8, radiusY: 8, force: 1 }] });
      const o = await page.evaluate(([t, dt, sp]) => window.step(t, dt, 0, sp), [i / fps, i === 0 ? 0 : 1 / fps, speed]);
      if (!frames.includes(i)) continue;
      await page.evaluate(() => window.renderNow(1)); const tag = String(i).padStart(5, '0'); await page.screenshot({ path: path.join(out, `f_${tag}.png`) });
      const info = await page.evaluate((P) => ({ box: window.bennyBox(1), cam: window.camInfo(), edge: window.qaEdgeGuard ? window.qaEdgeGuard() : null, qa: window.kitFrameQA ? window.kitFrameQA() : null,
        picks: window.qaPickScenery ? P.map(([x, y]) => ({ x, y, hits: window.qaPickScenery(x, y, 3) })) : null }), pts);
      await page.evaluate(() => window.qaIdPass && window.qaIdPass(true)); await page.screenshot({ path: path.join(out, `id_${tag}.png`) }); await page.evaluate(() => window.qaRestore && window.qaRestore());
      res.push({ frame: i, ...o, ...info }); console.log('probed', i, 's', o.s, 'lat', o.lat, 'box', JSON.stringify(info.box));
    }
    fs.writeFileSync(path.join(out, 'probe.json'), JSON.stringify({ errors: errs, frames: res }, null, 1));
    if (errs.length) console.log('ERRORS', errs.slice(0, 6));
  } finally { await browser.close(); srv.kill(); }
})();
