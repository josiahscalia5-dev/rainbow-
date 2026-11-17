// Record the WHOLE game (01 intro cinematic -> 03..10 ride -> 11 victory) from a BUILT bundle (the web app inside the APK).
// Deterministic: the real game simulation is advanced in fixed steps (1/60 s), one frame rendered every 1/fps s, so the
// video plays at true game speed even though software WebGL renders slowly here. Steering = the coin-seeking policy of
// scripts/gameplay-test.mjs (what a player does: steer toward the next coin). No URL experiment switches (baked in the build).
// usage: node record_full.mjs <build_root_with_dist> <out_dir> [--w=540 --h=960 --fps=30 --hold=3 --dry --max=N]
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { createRequire } from 'node:module';

const [root, OUT] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const W = Number(opt.w ?? 540), H = Number(opt.h ?? 960), FPS = Number(opt.fps ?? 30), HOLD = Number(opt.hold ?? 3);
const MAX = opt.max ? Number(opt.max) : Infinity, DRY = !!opt.dry;
const SUB = Math.round(60 / FPS); // sim steps of 1/60 s per video frame
mkdirSync(`${OUT}/frames`, { recursive: true });

const req = createRequire('/home/user/rainbow-/package.json');
const { preview } = await import('/home/user/rainbow-/node_modules/vite/dist/node/index.js');
const { chromium } = req('playwright');

const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
async function slot() {
  for (;;) {
    for (let i = 0; i < 2; i++) {
      const dir = `/tmp/rainbow-render-slot-${i}`;
      try { mkdirSync(dir); writeFileSync(`${dir}/pid`, String(process.pid)); const f = () => rmSync(dir, { recursive: true, force: true }); process.on('exit', f); process.on('SIGTERM', () => { f(); process.exit(1); }); return f; }
      catch { let pid = NaN; try { pid = Number(readFileSync(`${dir}/pid`, 'utf8')); } catch {} if (Number.isFinite(pid) && !alive(pid)) rmSync(dir, { recursive: true, force: true }); }
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
}
const free = DRY ? () => {} : await slot();
const server = await preview({ root, configFile: false, build: { outDir: `${root}/dist` }, preview: { port: 5291, host: '127.0.0.1', strictPort: false }, logLevel: 'error' });
const url = server.resolvedUrls.local[0].replace(/\/$/, '');
const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const log = { when: new Date().toISOString(), w: W, h: H, fps: FPS, frames: [], errors: [], segments: {} };
const t0 = Date.now();
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (m.type() === 'error') log.errors.push(m.text()); });
  page.on('pageerror', (e) => log.errors.push('pageerror ' + e.message));
  await page.goto(`${url}/?qa=1&dpr=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const err = await page.evaluate(() => window.__error);
  if (err) throw new Error(err);
  await page.evaluate(() => window.__rainbow.unfreeze());
  let outroFrames = 0, i = 0;
  for (; i < MAX; i++) {
    // advance one video frame of real game time (with the coin-seeking steering policy during the ride)
    const st = await page.evaluate(([sub]) => {
      const R = window.__rainbow;
      let s = R.state();
      for (let k = 0; k < sub; k++) {
        if (s.mode === 'ride') {
          const next = R.coinDefs().find((d) => !d.taken && d.s > s.s + 0.5 && d.s < s.s + 12);
          R.setSteer(Math.max(-1, Math.min(1, ((next ? next.lat : 0) - s.lat) * 0.9)));
        } else R.setSteer(null);
        s = R.step(1, 1 / 60);
      }
      return s;
    }, [SUB]);
    const key = `${st.mode}:${st.stage}`;
    if (!log.segments[key]) log.segments[key] = { firstFrame: i, t: +(i / FPS).toFixed(2) };
    if (st.mode === 'outro' || st.mode === 'end') outroFrames++;
    if (!DRY) {
      await page.evaluate(() => window.__rainbow.drawList());
      await page.screenshot({ path: `${OUT}/frames/${String(i).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
    }
    log.frames.push({ i, mode: st.mode, stage: st.stage, s: st.s, coins: st.coins, hearts: st.hearts });
    if (i % 150 === 0) {
      console.log(`frame ${i} t=${(i / FPS).toFixed(1)}s ${st.mode} ${st.stage} s=${st.s} coins=${st.coins} hearts=${st.hearts} elapsed=${((Date.now() - t0) / 1000).toFixed(0)}s`);
      writeFileSync(`${OUT}/record_log.json`, JSON.stringify(log));
    }
    if (outroFrames >= Math.round((5.2 + HOLD) * FPS)) { i++; break; }
  }
  log.totalFrames = i; log.seconds = +(i / FPS).toFixed(2); log.wallSeconds = Math.round((Date.now() - t0) / 1000);
  console.log('DONE frames', i, 'video seconds', log.seconds, 'wall seconds', log.wallSeconds, 'errors', log.errors.length);
} finally {
  writeFileSync(`${OUT}/record_log.json`, JSON.stringify(log, null, 1));
  await browser.close();
  server.httpServer.close();
  free();
}
process.exit(0);
