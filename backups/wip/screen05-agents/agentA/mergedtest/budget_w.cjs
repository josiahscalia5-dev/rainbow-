// node budget_w.cjs [QS] : Android splat-budget sweep WITHOUT rendering (cheap): the whole level s = 0 -> 10.64 at 30 fps, speed 1.4,
// Benny switching lanes -0.22 / 0 / +0.22 and the camera rising +0.12 (like a leap) on part of it. Prints the visible-splat
// maximum, where the rear start piece (near_a) is hidden, and the count per section. Own server on 9400-9899, verified to serve THIS folder.
const { chromium } = require('playwright'); const { spawn } = require('child_process');
(async () => {
  const QS = process.argv[2] ?? '';
  let port, srv;
  for (let tries = 0; ; tries++) {
    port = 9400 + Math.floor(Math.random() * 500);
    srv = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: __dirname, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1500));
    const ok = await fetch(`http://127.0.0.1:${port}/budget_w.cjs`).then((r) => r.text()).then((t) => t.includes('verified to serve THIS folder')).catch(() => false);
    if (ok) break; srv.kill(); if (tries > 8) throw new Error('no own server');
  }
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const page = await browser.newPage({ viewport: { width: 412, height: 915 } });
    const errs = []; page.on('pageerror', (e) => errs.push(String(e).slice(0, 300)));
    await page.goto(`http://127.0.0.1:${port}/play3.html?w=412&h=915${QS}`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 900000 });
    const res = await page.evaluate(() => {
      const out = []; const lanes = [0, -0.22, -0.22, 0, 0.22, 0.22, 0, -0.22];
      for (let i = 0; i < 228; i++) {
        const t = i / 30, lane = lanes[Math.floor(t)] ?? 0, rise = (t > 2.9 && t < 3.5) || (t > 6.2 && t < 6.8) ? 0.12 : 0;
        window.qaPose(lane, rise); const r = window.step(t, i ? 1 / 30 : 0, 0, 1.4);
        out.push({ i, s: r.s, tile: r.tile, lane, rise, vis: window.qaVisibleSplats(), nearA: window.qaNearA ? window.qaNearA() : null });
      }
      return out;
    });
    const max = res.reduce((a, b) => (b.vis > a.vis ? b : a));
    const per = {}; for (const r of res) per[r.tile] = Math.max(per[r.tile] ?? 0, r.vis);
    const hide = res.find((r) => r.nearA === false);
    console.log(JSON.stringify({ errors: errs, frames: res.length, s_end: res[res.length - 1].s, max_visible: max.vis, at: { s: max.s, tile: max.tile }, max_per_section: per, nearA_hidden_from: hide ? { s: hide.s, tile: hide.tile } : null, nearA_visible_in_section1: res.filter((r) => r.tile >= 1 && r.nearA).length }));
  } finally { await browser.close(); srv.kill(); }
})();
