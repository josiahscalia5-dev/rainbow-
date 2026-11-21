// node play_shots.cjs <outdir> <mode> ; mode=stills|clip|inspect
const { chromium } = require('playwright'); const { spawn, execFileSync } = require('child_process'); const fs = require('fs');
(async () => {
  const [out, mode, file = 'full_500k.spz', secs = '4', speed = '1.4'] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const port = 8700 + Math.floor(Math.random() * 200);
  const srv = spawn('python3', ['-m', 'http.server', String(port)], { cwd: __dirname, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1200));
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const log = [];
  try {
    const page = await browser.newPage({ viewport: { width: 540, height: 960 } });
    page.on('pageerror', (e) => console.log('pageerror:', String(e).slice(0, 300)));
    await page.goto(`http://127.0.0.1:${port}/${process.env.PAGE ?? 'play.html'}?file=${file}${process.env.QS ?? ''}`);
    await page.waitForFunction(() => window.ready === true, null, { timeout: 900000 });
    if (mode === 'stills') {
      let prev = 0; for (const s of JSON.parse(process.env.STILLS ?? '[0,0.5,1.0,1.5,2.0,2.5]')) {
        await page.evaluate(([s, p]) => { window.step(0, (s - p) / 1.4, 0, 1.4); }, [s, prev]); prev = s;
        await page.evaluate(() => window.renderNow(3)); await page.screenshot({ path: `${out}/s_${s}.png`, timeout: 600000 }); console.log('still', s);
      }
    } else if (mode === 'inspect') {
      const views = JSON.parse(fs.readFileSync(`${out}/inspect_views.json`, 'utf8'));
      for (const v of views) { await page.evaluate((v) => window.inspect(v.pos, v.look), v); await page.screenshot({ path: `${out}/${v.name}.png` }); console.log('inspect', v.name); }
    } else {
      const fps = 30, n = Math.round(+secs * fps);
      for (let i = 0; i < n; i++) {
        const t = i / fps;
        const steer = t > 0.5 && t < 2.2 ? Math.sin((t - 0.5) * 3.7) * 0.9 : 0;
        const o = await page.evaluate(([t, dt, st, sp]) => window.step(t, dt, st, sp), [t, i === 0 ? 0 : 1 / fps, steer, +speed]);
        await page.evaluate(() => window.renderNow(1));
        await page.screenshot({ path: `${out}/f_${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 90 });
        log.push({ i, t: +t.toFixed(3), steer: +steer.toFixed(3), ...o });
        if (i % 15 === 0) console.log('frame', i, JSON.stringify(o));
      }
      fs.writeFileSync(`${out}/clip_log.json`, JSON.stringify(log, null, 1));
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', `${out}/f_%04d.jpg`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '22', `${out}/clip.mp4`]);
    }
  } finally { await browser.close(); srv.kill(); }
})();
