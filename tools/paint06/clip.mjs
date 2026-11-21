// paint06: one uninterrupted real-gameplay clip through Screen 06 (`?paint06=1`) into Screen 07, 30 fps, deterministic steps.
// node tools/paint06/clip.mjs [--size=540x960] [--weave] [--out=qa/match/06/paint06/clip]
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const opt = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...r] = a.replace(/^--/, '').split('='); return [k, r.length ? r.join('=') : true]; }));
const [W, H] = (opt.size ?? '540x960').split('x').map(Number);
const out = opt.out ?? 'qa/match/06/paint06/clip';
const tag = opt.weave ? 'steer' : 'straight';
const fdir = `${out}/frames_${tag}`;
rmSync(fdir, { recursive: true, force: true }); mkdirSync(fdir, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5202);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&paint06=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 240000 });
  await page.evaluate(() => { window.__rainbow.goto('06p_in'); window.__rainbow.unfreeze(); window.__rainbow.freezeAt(11.0); });
  await page.evaluate(() => document.fonts.ready);
  const c = await page.evaluate(() => window.__rainbow.course.stage('06'));
  let i = 0, t = 0;
  for (;;) {
    const st = await page.evaluate(([weave, t, s0]) => {
      const r = window.__rainbow;
      const s = r.state().s;
      // steering demo (--weave): left / right weaves between the 2nd and 3rd pictures and after the 4th
      let v = 0;
      if (weave && ((s > s0 + 23 && s < s0 + 31) || (s > s0 + 44 && s < s0 + 50))) v = Math.sin(t * 2.2) * 0.85;
      r.setSteer(v);
      r.freezeAt(11.0 + t); // animation clock = clip time (deterministic)
      const out = r.step(2, 1 / 60);
      r.renderNow();
      return out;
    }, [!!opt.weave, t, c.s0]);
    await page.screenshot({ path: `${fdir}/${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 90 });
    log.push({ i, t: +t.toFixed(3), s: st.s, lat: st.lat, stage: st.stage, coins: st.coins });
    i++; t += 1 / 30;
    if (st.s > c.s1 + 14 || i > 1200) break;
  }
  writeFileSync(`${out}/clip_${tag}.json`, JSON.stringify({ size: [W, H], fps: 30, query: '?paint06=1', frames: log }, null, 1));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', `${fdir}/%04d.jpg`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', `${out}/SCREEN06_paint06_${tag}_1x.mp4`]);
  console.log('frames', i, 'from s', log[0].s, 'to', log.at(-1).s, '->', `${out}/SCREEN06_paint06_${tag}_1x.mp4`);
} finally { await browser.close(); await vite.close(); }
