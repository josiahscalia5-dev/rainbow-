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
      // the WHOLE level: from s = 0 to the path end (+ a few frames), lanes change every second, leaps (camera +0.12) every 3 s
      const out = []; const lanes = [0, -0.22, -0.22, 0, 0.22, 0.22, 0, -0.22]; const SL = window.S_LAST ?? 32.16; const n = Math.ceil((SL + 0.3) / 1.4 * 30);
      for (let i = 0; i < n; i++) {
        const t = i / 30, lane = lanes[Math.floor(t) % 8], rise = (t % 3) > 1.9 && (t % 3) < 2.5 ? 0.12 : 0;
        window.qaPose(lane, rise); const r = window.step(t, i ? 1 / 30 : 0, 0, 1.4);
        out.push({ i, s: r.s, tile: r.tile, lane, rise, vis: window.qaVisibleSplats(), nearA: window.qaNearA ? window.qaNearA() : null, k: window.endK ? +window.endK().toFixed(4) : null });
      }
      return { out, SL };
    });
    const R = res.out, max = R.reduce((a, b) => (b.vis > a.vis ? b : a));
    const per = {}; for (const r of R) per[r.tile] = Math.max(per[r.tile] ?? 0, r.vis);
    const hide = R.find((r) => r.nearA === false);
    const tr = R.filter((r) => r.k > 0); const dk = tr.slice(1).map((r, j) => +(r.k - tr[j].k).toFixed(4));
    console.log(JSON.stringify({ errors: errs, frames: R.length, s_end: R[R.length - 1].s, S_LAST: res.SL, max_visible: max.vis, at: { s: max.s, tile: max.tile }, max_per_section: per,
      nearA_hidden_from: hide ? { s: hide.s, tile: hide.tile } : null, nearA_visible_in_section1plus: R.filter((r) => r.tile >= 1 && r.nearA).length,
      transition: tr.length ? { first_frame: tr[0].i, first_s: tr[0].s, k1_frame: (R.find((r) => r.k >= 1) || {}).i, frames_0_to_1: tr.filter((r) => r.k < 1).length, max_dk_per_frame: Math.max(...dk), k_series: tr.filter((r) => r.k < 1).map((r) => r.k) } : null }));
  } finally { await browser.close(); srv.kill(); }
})();
