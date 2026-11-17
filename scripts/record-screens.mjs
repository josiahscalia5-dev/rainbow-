#!/usr/bin/env node
// Screen recordings of the REAL running game (headless Chromium, WebGL), rendered frame by frame so the video plays
// at true game speed however slow software WebGL is. Benny steers toward the coins like a player would.
//   node scripts/record-screens.mjs                      → qa/recordings/full_playthrough.mp4 (01 → 11, whole game)
//                                                           + one clip per screen qa/recordings/screen_01.mp4 … _11.mp4
//   node scripts/record-screens.mjs --q=match08=1&coins08px=1 --from=07 --until=09 --name=screen_08_match08
//                                                         → a ride segment with URL test switches
// Options: --size=540x960 (viewport, CSS px, dpr 1) --fps=30 --out=DIR --name=BASE --q=SWITCHES
//          --from=NN (start the ride at stage NN instead of the intro) --until=NN (stop when stage NN is reached)
//          --tail=SEC (keep recording after the victory, default 3) --noclips (skip the per-screen clips)
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const [W, H] = (typeof opt.size === 'string' ? opt.size : '540x960').split('x').map(Number);
const FPS = Number(opt.fps ?? 30);
const STEPS = Math.round(60 / FPS); // simulation runs at 60 Hz, one frame every STEPS steps
const outDir = typeof opt.out === 'string' ? opt.out : 'qa/recordings';
const name = typeof opt.name === 'string' ? opt.name : opt.from ? `ride_${opt.from}` : 'full_playthrough';
const tail = Number(opt.tail ?? 3);
const q = typeof opt.q === 'string' ? opt.q : '';
const frames = `node_modules/.rainbow-test/rec_${name}`;
rmSync(frames, { recursive: true, force: true });
mkdirSync(frames, { recursive: true });
mkdirSync(outDir, { recursive: true });

const { chromium } = loadPlaywright();
const vite = await startVite(5231);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${vite.url}/?qa=1&dpr=1${q ? '&' + q : ''}`);
await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
const err = await page.evaluate(() => window.__error);
if (err) throw new Error(err);
await page.evaluate(() => document.fonts.ready);

await page.evaluate((from) => {
  const api = window.__rainbow;
  if (from) { api.startRideAt(from); api.unfreeze(); } else api.restart();
  api.renderNow();
}, opt.from || null);

const log = [];
const t0 = Date.now();
let endFrames = null;
for (let f = 0; f < FPS * 240; f++) {
  const st = await page.evaluate(({ steps, until }) => {
    const api = window.__rainbow;
    let s = api.state();
    for (let i = 0; i < steps; i++) {
      if (s.mode === 'ride') {
        // player-like steering: drift toward the next coin ahead, otherwise back to the middle of the river
        const next = api.coinDefs().find((d) => !d.taken && d.s > s.s + 0.5 && d.s < s.s + 12);
        api.setSteer(Math.max(-1, Math.min(1, ((next ? next.lat : 0) - s.lat) * 0.9)));
      } else api.setSteer(null);
      s = api.step(1, 1 / 60);
    }
    api.renderNow();
    return { ...s, stop: until ? s.stage >= until && s.mode === 'ride' : false };
  }, { steps: f === 0 ? 0 : STEPS, until: opt.until || null });
  if (st.stop) break;
  await page.screenshot({ path: `${frames}/${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 92 });
  log.push({ f, stage: st.stage, mode: st.mode, s: st.s, coins: st.coins, hearts: st.hearts });
  if (f % (FPS * 2) === 0) console.log(`frame ${f} (${(f / FPS).toFixed(1)} s game time) ${st.mode} ${st.stage} coins ${st.coins} — ${((Date.now() - t0) / 1000).toFixed(0)} s elapsed`);
  if (st.mode === 'end' && endFrames === null) endFrames = f + Math.round(tail * FPS);
  if (endFrames !== null && f >= endFrames) break;
}
await browser.close();
await vite.close();

const enc = (out, start = 0, count = log.length) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-start_number', String(start), '-i', `${frames}/%05d.jpg`,
  '-frames:v', String(count), '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
enc(`${outDir}/${name}.mp4`);
const clips = [];
if (!opt.noclips && !opt.from) {
  // one clip per screen, cut at the exact frames where the game switches screens
  const ranges = [];
  for (const e of log) {
    const last = ranges[ranges.length - 1];
    if (last && last.stage === e.stage) last.end = e.f; else ranges.push({ stage: e.stage, start: e.f, end: e.f });
  }
  for (const r of ranges) {
    const file = `${outDir}/screen_${r.stage}.mp4`;
    enc(file, r.start, r.end - r.start + 1);
    clips.push({ screen: r.stage, file, seconds: +((r.end - r.start + 1) / FPS).toFixed(2), fromSecond: +(r.start / FPS).toFixed(2) });
  }
}
const summary = { when: new Date().toISOString(), query: q || null, size: [W, H], fps: FPS, frames: log.length, seconds: +(log.length / FPS).toFixed(2), video: `${outDir}/${name}.mp4`, clips, final: log[log.length - 1], renderSeconds: Math.round((Date.now() - t0) / 1000), errors };
writeFileSync(`${outDir}/${name}.json`, JSON.stringify(summary, null, 2));
rmSync(frames, { recursive: true, force: true });
console.log(JSON.stringify(summary, null, 1));
