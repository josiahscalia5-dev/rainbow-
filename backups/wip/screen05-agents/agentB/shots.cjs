// node shots.cjs <file.spz> <outdir> <viewsJSON>
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
(async () => {
  const [file, out, viewsJson] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const port = 8700 + Math.floor(Math.random() * 200);
  const srv = spawn('python3', ['-m', 'http.server', String(port)], { cwd: __dirname, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1200));
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
    page.on('console', (m) => { if (m.type() === 'error') console.log('console:', m.text().slice(0, 200)); });
    page.on('pageerror', (e) => console.log('pageerror:', String(e).slice(0, 300)));
    await page.goto(`http://127.0.0.1:${port}/index.html?file=${file}&w=540&h=960`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 400000 });
    console.log('bbox', JSON.stringify(await page.evaluate(() => window.bbox)));
    const views = JSON.parse(viewsJson);
    for (const v of views) {
      const t0 = Date.now();
      await page.evaluate((v) => window.setView(v), v);
      await page.screenshot({ path: `${out}/${v.name}.png`, timeout: 600000 });
      console.log(v.name, Date.now() - t0, 'ms');
    }
  } finally { await browser.close(); srv.kill(); }
})();
