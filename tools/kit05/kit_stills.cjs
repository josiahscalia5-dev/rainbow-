// Render kit05.html stills at given poses (headless Chromium, SwiftShader WebGL2, Android-portrait size).
// node kit_stills.cjs <folder with kit05.html> <outdir> '<json list of [s, lat, camLat, t]>' [w=412] [h=915] [query]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dir, out, poses = '[[0,0,0,0]]', w = '412', h = '915', extra = ''] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const disk = fs.readFileSync(path.join(dir, 'kit05.html'), 'utf8'); let port, srv;
  for (let i = 0; i < 20 && !srv; i++) { port = 9500 + Math.floor(Math.random() * 400); const s = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dir, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1000)); const got = await fetch(`http://127.0.0.1:${port}/kit05.html`).then((r) => r.text()).catch(() => ''); if (got === disk) srv = s; else s.kill(); }
  if (!srv) throw new Error('no server for ' + dir);
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const page = await (await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 })).newPage();
    const errs = []; page.on('pageerror', (e) => errs.push(String(e))); page.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await page.goto(`http://127.0.0.1:${port}/kit05.html?w=${w}&h=${h}${extra ? '&' + extra : ''}`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 600000 });
    for (const p of JSON.parse(poses)) {
      const t0 = Date.now(); const info = await page.evaluate((p) => window.pose(...p), p);
      const f = path.join(out, `kit_s${p[0].toFixed(2)}_l${p[1].toFixed(2)}.png`); await page.screenshot({ path: f });
      console.log(f, JSON.stringify(info), (Date.now() - t0) + ' ms');
    }
    if (errs.length) console.log('ERRORS', errs.slice(0, 5));
  } finally { await browser.close(); srv.kill(); }
})();
