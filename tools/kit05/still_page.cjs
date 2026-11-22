// One screenshot of a page (play3.html of a folder) after it reports ready, optionally after window.step poses.
// node still_page.cjs <folder> <page> <out.png> <w> <h>
const { chromium } = require('playwright'); const { spawn } = require('child_process'); const fs = require('fs'); const path = require('path');
(async () => {
  const [dir, pg, out, w, h] = process.argv.slice(2); const disk = fs.readFileSync(path.join(dir, pg), 'utf8'); let port, srv;
  for (let i = 0; i < 20 && !srv; i++) { port = 9100 + Math.floor(Math.random() * 300); const s = spawn('python3', ['-m', 'http.server', '--bind', '127.0.0.1', String(port)], { cwd: dir, stdio: 'ignore' });
    await new Promise((r) => setTimeout(r, 1000)); const got = await fetch(`http://127.0.0.1:${port}/${pg}`).then((r) => r.text()).catch(() => ''); if (got === disk) srv = s; else s.kill(); }
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try { const page = await (await browser.newContext({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 })).newPage();
    await page.goto(`http://127.0.0.1:${port}/${pg}?w=${w}&h=${h}`); await page.waitForFunction(() => window.ready === true, null, { timeout: 1200000 });
    await page.evaluate(() => window.renderNow ? window.renderNow(3) : 0); await page.screenshot({ path: out }); console.log('wrote', out);
  } finally { await browser.close(); srv.kill(); }
})();
