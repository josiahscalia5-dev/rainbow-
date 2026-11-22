// Screen kit — extraction evaluation, step 1: GROUND TRUTH from the real game (built dist/, 412x915 portrait, SwiftShader).
// For each checkpoint: the normal frame, the same frame with Benny hidden and with the coins hidden (pixel difference = exact Benny /
// coin silhouettes), and a sparse ray-cast depth grid (exact camera distance of the first visible surface). These game frames share
// the approved pictures' style, so a segmentation / depth tool can be scored against exact answers before it touches the artwork.
//   NODE_PATH=$(npm root -g) node tools/screenkit/eval/gt_frames.cjs <dist> <out> [checkpoints=04,05,06,07,08,09,10] [grid=24x52]
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dist, out, cps = '04,05,06,07,08,09,10', gridArg = '24x52'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const [GX, GY] = gridArg.split('x').map(Number);
  const port = 9500 + Math.floor(Math.random() * 90); const srv = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dist, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1200));
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const errs = [], meta = {};
  try {
    const ctx = await browser.newContext({ viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); page.on('pageerror', (e) => errs.push(String(e).slice(0, 300)));
    await page.goto(`http://127.0.0.1:${port}/index.html?qa=1`);
    await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 600000 }); await page.evaluate(() => document.fonts.ready);
    for (const cp of cps.split(',')) {
      await page.evaluate((id) => window.__rainbow.goto(id), cp);
      const shot = async (tag) => { await page.evaluate(() => window.__rainbow.renderNow()); await page.screenshot({ path: path.join(out, `${cp}_${tag}.png`) }); };
      await shot('full');
      // hide Benny (the scene child at his root position that has children) / the coin group, render, restore
      const toggle = (what, vis) => page.evaluate(([w, v]) => { const r = window.__rainbow, { scene } = r.qa3d(); const bp = r.bennyScreen().benny; let n = 0;
        for (const o of scene.children) { const isB = o.children.length > 0 && Math.hypot(o.position.x - bp[0], o.position.y - bp[1], o.position.z - bp[2]) < 0.02;
          if ((w === 'benny' && isB) || (w === 'coins' && o.name === 'coins')) { o.visible = v; n++; } } return n; }, [what, vis]);
      const nb = await toggle('benny', false); await shot('nobenny'); await toggle('benny', true);
      const nc = await toggle('coins', false); await shot('nocoins'); await toggle('coins', true);
      // depth grid (camera distance along the view ray of the first visible mesh; -1 = nothing hit)
      const depth = await page.evaluate(([gx, gy]) => { const r = window.__rainbow, rows = [];
        for (let j = 0; j < gy; j++) { const row = []; for (let i = 0; i < gx; i++) { const x = ((i + 0.5) / gx) * 2 - 1, y = 1 - ((j + 0.5) / gy) * 2; const h = r.probe(x, y); row.push(h.length ? h[0].d : -1); } rows.push(row); }
        return rows; }, [GX, GY]);
      meta[cp] = { benny_roots: nb, coin_groups: nc, box: (await page.evaluate(() => window.__rainbow.bennyBoxPx())).box, grid: [GX, GY], depth };
      console.log(cp, 'benny', nb, 'coins', nc);
    }
    fs.writeFileSync(path.join(out, 'gt.json'), JSON.stringify({ errors: errs, frames: meta }));
  } finally { await browser.close(); srv.kill(); }
})();
