#!/usr/bin/env node
// Real-time timeline of the game as the APK plays it (no user tap): what is on screen at every 0.25 s from the moment
// the game starts (intro t = 0). Runs EITHER the current source (Vite, --q=<query>) OR an APK's own packaged web bundle
// (--apk=<dir with index.html>, the APK's assets/public unzipped) — so each build is timed with its own code.
//   node tools/camclear/timeline.mjs --q=match08=1 --out=qa/gameplay_video/timeline_src_match08.json
//   node tools/camclear/timeline.mjs --apk=/path/to/unzipped/assets/public --out=...
// The simulation is the game's deterministic QA stepper (window.__rainbow.step) at 1/60 s, i.e. exactly the per-frame
// update the phone runs at 60 fps (the phone clamps dt to 0.05 s, so below 20 fps it would run slower than real time).
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';

const arg = (k) => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? '').slice(k.length + 3);
const q = arg('q');
const apk = arg('apk');
const out = arg('out') || 'qa/gameplay_video/timeline.json';
const dur = Number(arg('dur') || 60);

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary', '.woff2': 'font/woff2', '.woff': 'font/woff', '.mp4': 'video/mp4', '.webm': 'video/webm', '.txt': 'text/plain', '.ktx2': 'image/ktx2', '.bin': 'application/octet-stream' };
async function serveStatic(root, port = 5231) {
  const server = createServer(async (req, res) => {
    const p = decodeURIComponent((req.url ?? '/').split('?')[0]);
    const f = resolve(join(root, p === '/' ? 'index.html' : p));
    if (!f.startsWith(resolve(root))) { res.writeHead(403); res.end(); return; }
    try { const b = await readFile(f); res.writeHead(200, { 'content-type': MIME[extname(f)] ?? 'application/octet-stream' }); res.end(b); } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  return { url: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(r)) };
}

const { chromium } = loadPlaywright();
const srv = apk ? await serveStatic(apk) : await startVite(5232);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const page = await browser.newPage({ viewport: { width: 216, height: 384 } });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${srv.url}/?qa=1&dpr=1&bloom=0${q ? '&' + q : ''}`);
await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
const res = await page.evaluate((dur) => {
  const api = window.__rainbow;
  const c = api.course;
  const stages = c.stages.map((s) => ({ id: s.id, s0: +s.s0.toFixed(2), s1: +s.s1.toFixed(2), speed: s.speed }));
  const marks = Object.fromEntries(Object.entries(c.marks).filter(([k]) => /07|08/.test(k)).map(([k, v]) => [k, +v.toFixed(2)]));
  const rows = [];
  const firsts = {};
  let t = 0;
  rows.push({ t: 0, ...api.state() });
  while (t < dur) {
    const s = api.step(15, 1 / 60);
    t += 0.25;
    const key = s.mode === 'ride' || s.mode === 'intro' ? s.stage : s.mode;
    if (!(key in firsts)) firsts[key] = +t.toFixed(2);
    rows.push({ t: +t.toFixed(2), mode: s.mode, stage: s.stage, s: s.s, lat: s.lat, bennyY: s.bennyY, cam: s.cam, coins: s.coins, hearts: s.hearts });
  }
  return { stages, marks, firsts, rows, length: c.length };
}, dur);
res.query = q; res.apk = apk || null; res.errors = errors;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(res, null, 1));
// compact stage windows
const win = [];
for (const r of res.rows) {
  const k = r.mode === 'ride' ? r.stage : r.mode === 'intro' ? `intro ${r.stage}` : r.mode;
  if (!win.length || win[win.length - 1].k !== k) win.push({ k, t0: r.t, t1: r.t }); else win[win.length - 1].t1 = r.t;
}
console.log(JSON.stringify({ out, q, apk: apk || null, length: +res.length.toFixed(1), windows: win.map((w) => `${w.k}: ${w.t0}-${w.t1}`), marks: res.marks, errors }, null, 1));
await browser.close();
await srv.close();
