// Uninterrupted real-gameplay clip (deterministic 30 fps steps) + per-frame log.
// node tools/paint/clip.mjs --q=paint=1 --from=<s> --to=<s> --tag=NAME [--weave=s0:s1,s2:s3] [--size=540x960] [--out=DIR] [--keep]
import { mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const opt = Object.fromEntries(process.argv.slice(2).map((a) => { const [k, ...r] = a.replace(/^--/, '').split('='); return [k, r.length ? r.join('=') : true]; }));
const [W, H] = (opt.size ?? '540x960').split('x').map(Number);
const out = opt.out ?? 'qa/match/05/paint05/clip'; const tag = opt.tag ?? 'clip';
const fdir = `${process.env.FRAMES_DIR ?? '/tmp/claude-0/-home-user-rainbow-/73e630f8-f9d6-5165-abf6-affe24158479/scratchpad/frames'}/frames_${tag}`; rmSync(fdir, { recursive: true, force: true }); mkdirSync(fdir, { recursive: true });
const weave = (opt.weave ? String(opt.weave).split(',').map((p) => p.split(':').map(Number)) : []);
const { chromium } = loadPlaywright();
const vite = await startVite(5300 + Math.floor(Math.random() * 60));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1${opt.q ? '&' + opt.q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 240000 });
  await page.evaluate((s0) => { window.__rainbow.gotoS(s0); window.__rainbow.unfreeze(); window.__rainbow.freezeAt(11.0); }, +opt.from);
  await page.evaluate(() => document.fonts.ready);
  let i = 0, t = 0;
  for (;;) {
    const st = await page.evaluate(([wv, t, side]) => {
      const r = window.__rainbow; const s = r.state().s; let v = 0;
      for (const [a, b] of wv) if (s > a && s < b) v = Math.sin((s - a) * 0.55) * 0.9;
      r.setSteer(v); r.freezeAt(11.0 + t); const o = r.step(2, 1 / 60);
      if (side) r.sideCam(...side); else r.renderNow(); return o;
    }, [weave, t, opt.side ? String(opt.side).split(',').map(Number) : null]);
    await page.screenshot({ path: `${fdir}/${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 90 });
    log.push({ i, t: +t.toFixed(3), s: st.s, lat: st.lat, stage: st.stage, coins: st.coins, hearts: st.hearts, benny3d: st.bennyVisible });
    i++; t += 1 / 30;
    if (st.s > +opt.to || i > 3000) break;
  }
  writeFileSync(`${out}/clip_${tag}.json`, JSON.stringify({ size: [W, H], fps: 30, query: opt.q ?? '', from: +opt.from, to: +opt.to, weave, frames_dir: fdir, frames: log }, null, 1));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '30', '-i', `${fdir}/%04d.jpg`, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '23', '-preset', 'slow', `${out}/${tag}.mp4`]);
  console.log(tag, 'frames', i, 's', log[0].s, '->', log.at(-1).s, 'coins', log[0].coins, '->', log.at(-1).coins);
} finally { await browser.close(); await vite.close(); }
