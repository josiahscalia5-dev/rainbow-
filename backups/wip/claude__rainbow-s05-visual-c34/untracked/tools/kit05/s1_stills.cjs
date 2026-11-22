// Round 34 S1 (visual accuracy): stills of the kit game at chosen path positions and lanes, same page setup as final_acceptance.cjs
// (412x915 Android portrait, isMobile, hasTouch, SwiftShader). The game is PLAYED forward with window.step at 30 fps / speed 1.4 and the
// lane is chosen with window.input.swipe (the same request path as a touch swipe) right after load, so a still = what a player sees.
//   node s1_stills.cjs <game folder> <outdir> <s list, e.g. 0,3,8,15> [lanes=0] [extra query] [tag]
// Writes <outdir>/<tag>s<ss.s>_l<lane>.jpg (jpeg q92 like the harness) + stills.json (state, camera, Benny per still).
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dir, out, sList = '0', lanes = '0', extra = '', tag = ''] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const W = 412, H = 915, fps = 30, speed = 1.4, S = sList.split(',').map(Number).sort((a, b) => a - b);
  const disk = fs.readFileSync(path.join(dir, 'play3.html'), 'utf8'); let port, srv;
  for (let i = 0; i < 20 && !srv; i++) { port = 9700 + Math.floor(Math.random() * 280); const s = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dir, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1000)); const got = await fetch(`http://127.0.0.1:${port}/play3.html`).then((r) => r.text()).catch(() => ''); if (got === disk) srv = s; else s.kill(); }
  if (!srv) throw new Error('no server for ' + dir);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const res = []; const errs = [];
  try {
    for (const lane of lanes.split(',').map(Number)) {
      const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      const page = await ctx.newPage(); page.on('pageerror', (e) => errs.push(String(e).slice(0, 300))); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 300)); });
      await page.goto(`http://127.0.0.1:${port}/play3.html?w=${W}&h=${H}${extra ? '&' + extra : ''}`);
      await page.waitForFunction(() => window.ready === true, null, { timeout: 900000 });
      let i = 0, s = 0;
      if (lane !== 0) await page.evaluate((d) => window.input.swipe(d), lane < 0 ? 'left' : 'right');
      for (const target of S) {
        if (lane !== 0 && target < 0.5) continue;   // a side lane needs ~0.3 s to reach
        while (s < target - 1e-6 || i === 0) {
          const o = await page.evaluate(([t, dt]) => window.step(t, dt, 0, 1.4), [i / fps, i === 0 ? 0 : 1 / fps]); s = o.s; i++;
          if (i > 3000) break;
        }
        await page.evaluate(() => window.renderNow(1));
        const f = path.join(out, `${tag}s${target.toFixed(1)}_l${lane}.jpg`); await page.screenshot({ path: f, type: 'jpeg', quality: 92 });
        const info = await page.evaluate(() => ({ st: window.state ? window.state() : null, cam: window.camInfo(), benny: window.bennyInfo() }));
        res.push({ file: path.basename(f), target, lane, s, frame: i - 1, ...info }); console.log(f, 's', s);
      }
      await ctx.close();
    }
  } finally { await browser.close(); srv.kill(); }
  fs.writeFileSync(path.join(out, `${tag}stills.json`), JSON.stringify({ errors: errs, stills: res }, null, 1));
  if (errs.length) console.log('ERRORS', errs.slice(0, 5));
})();
