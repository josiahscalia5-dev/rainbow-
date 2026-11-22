// Rainbow screen kit: bake a screen ONCE (same code as the live bake in screen.html) and save it for the app build: <out>/baked/*.jpg|png + manifest.json
//   NODE_PATH=$(npm root -g) node tools/screenkit/screen_export.cjs <game folder> <out folder>
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dir, out] = process.argv.slice(2); const B = path.join(out, 'baked'); fs.mkdirSync(B, { recursive: true });
  const port = 9400 + Math.floor(Math.random() * 400); const srv = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dir, stdio: 'ignore' }); await new Promise((r) => setTimeout(r, 1200));
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const page = await (await browser.newContext({ viewport: { width: 412, height: 915 } })).newPage(); page.on('pageerror', (e) => console.log('ERR', e.message));
    await page.goto(`http://127.0.0.1:${port}/play3.html?w=412&h=915`); await page.waitForFunction(() => window.ready === true, null, { timeout: 1200000 });
    const names = await page.evaluate(() => window.bakeNames()); const man = { meshes: {} }; const tpl = {};
    for (const n of names) { const e = await page.evaluate((n) => window.bakeExport(n), n); if (!e) continue; if (e.template) { tpl[n] = e.template; continue; }
      fs.writeFileSync(path.join(B, `${n}_bake.jpg`), Buffer.from(e.bake.split(',')[1], 'base64')); fs.writeFileSync(path.join(B, `${n}_den.png`), Buffer.from(e.den.split(',')[1], 'base64'));
      man.meshes[n] = { bake: `${n}_bake.jpg`, den: `${n}_den.png`, cov: e.cov }; }
    for (const [n, t] of Object.entries(tpl)) if (man.meshes[t]) man.meshes[n] = { ...man.meshes[t], template: t };
    fs.writeFileSync(path.join(B, 'manifest.json'), JSON.stringify(man)); console.log('exported', Object.keys(man.meshes).length, 'meshes');
  } finally { await browser.close(); srv.kill(); }
})();
