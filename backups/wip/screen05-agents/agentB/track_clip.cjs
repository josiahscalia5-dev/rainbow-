// Uninterrupted normal-speed run through the whole Screen 05 track (deterministic 30 fps steps), frames -> mp4
const { chromium } = require('playwright'); const { spawn, execFileSync } = require('child_process'); const fs = require('fs');
(async () => {
  const [out, secs = '7.6', speed = '1.4', w = '480', h = '854'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const port = 8700 + Math.floor(Math.random() * 200);
  const srv = spawn('python3', ['-m', 'http.server', String(port)], { cwd: __dirname, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1200));
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const log = [];
  try {
    const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.log('pageerror:', String(e).slice(0, 300)));
    await page.goto(`http://127.0.0.1:${port}/play3.html?w=${w}&h=${h}`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 900000 });
    const fps = 30, n = Math.round(+secs * fps);
    for (let i = 0; i < n; i++) {
      const t = i / fps;
      const steer = t > 0.8 && t < 6.8 ? Math.sin((t - 0.8) * 1.9) * 0.75 : 0;
      const o = await page.evaluate(([t, dt, st, sp]) => window.step(t, dt, st, sp), [t, i === 0 ? 0 : 1 / fps, steer, +speed]);
      await page.evaluate(() => window.renderNow(1));
      await page.screenshot({ path: `${out}/f_${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92, timeout: 600000 });
      log.push({ i, t: +t.toFixed(3), steer: +steer.toFixed(3), ...o });
      if (i % 10 === 0) { console.log('frame', i, '/', n, JSON.stringify(o), new Date().toISOString().slice(11, 19)); fs.writeFileSync(`${out}/clip_log.json`, JSON.stringify(log)); }
    }
    fs.writeFileSync(`${out}/clip_log.json`, JSON.stringify(log, null, 1));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', `${out}/f_%04d.jpg`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', `${out}/screen05_full_run.mp4`]);
    console.log('done', n, 'frames');
  } finally { await browser.close(); srv.kill(); }
})();
