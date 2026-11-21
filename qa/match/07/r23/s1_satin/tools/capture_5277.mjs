#!/usr/bin/env node
// r22 s07 QA copy of scripts/capture.mjs: identical capture, dev server on port 5277; pass --out=DIR (capture_log.json goes there)
// Playwright capture of the REAL running game (WebGL) at the native reference sizes.
//   node scripts/capture.mjs                 → screenshots/01.png … 11.png (+ qa/capture_log.json)
//   node scripts/capture.mjs 03 07           → only those
//   node scripts/capture.mjs --plunge        → qa/continuity/07a…07d.png descent proof frames
//   node scripts/capture.mjs --size=1080x1920 → extra Android-size set into screenshots/1080x1920/
//   node scripts/capture.mjs --out=DIR       → custom output dir
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
let ids = args.filter((a) => !a.startsWith('--'));
const NATIVE = { '03': [727, 1536] };
const plunge = ['07a_plunge_top', '07b_plunge_mid', '07c_plunge_bottom', '07d_entering_08'];
if (opt.plunge) ids = plunge;
if (!ids.length) ids = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
const size = typeof opt.size === 'string' ? opt.size.split('x').map(Number) : null;
const outDir = typeof opt.out === 'string' ? opt.out : opt.plunge ? 'qa/continuity' : size ? `screenshots/${size[0]}x${size[1]}` : 'screenshots';
mkdirSync(outDir, { recursive: true });
// (r22 copy: port 5277, log into the out dir)

const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.QA_PORT ?? 5277));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = { when: new Date().toISOString(), renderer: null, shots: [], errors: [] };
try {
  for (const id of ids) {
    const [w, h] = size ?? NATIVE[id] ?? [864, 1536];
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    page.on('console', (m) => { if (m.type() === 'error') log.errors.push(`[${id}] ${m.text()}`); });
    page.on('pageerror', (e) => log.errors.push(`[${id}] pageerror ${e.message}`));
    await page.goto(`${vite.url}/?qa=1&dpr=1${typeof opt.q === "string" ? "&" + opt.q : ""}`);
    await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
    const err = await page.evaluate(() => window.__error);
    if (err) throw new Error(err);
    if (!log.renderer) log.renderer = await page.evaluate(() => { const g = document.querySelector('canvas').getContext('webgl2'); const d = g?.getExtension('WEBGL_debug_renderer_info'); return d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown'; });
    const st = await page.evaluate((cid) => window.__rainbow.goto(cid), id);
    // let a few frames render (fonts, bloom) — time is frozen so the image is deterministic
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    const name = /^\d\d$/.test(id) ? `${id}.png` : `${id}.png`;
    await page.screenshot({ path: `${outDir}/${name}`, timeout: 180000 });
    const stats = await page.evaluate(() => window.__rainbow.stats());
    // The first frame after load also counts one-time GPU work (three converts each cube env map to PMREM on
    // first use). Render once more (after the screenshot) and report that per-frame cost as calls/tris.
    const firstFrame = { calls: stats.calls, triangles: stats.triangles };
    await page.evaluate(() => window.__rainbow.drawList?.());
    const steady = await page.evaluate(() => window.__rainbow.stats());
    Object.assign(stats, { calls: steady.calls, triangles: steady.triangles, firstFrameCalls: firstFrame.calls, firstFrameTriangles: firstFrame.triangles });
    const state = await page.evaluate(() => window.__rainbow.state());
    log.shots.push({ id, file: `${outDir}/${name}`, size: [w, h], checkpoint: st, state, stats });
    console.log(id, '→', `${outDir}/${name}`, JSON.stringify({ stage: state.stage, s: state.s, y: state.bennyY, calls: stats.calls, tris: stats.triangles, modules: stats.modules }));
    await page.close();
  }
} finally {
  writeFileSync(`${outDir}/capture_log.json`, JSON.stringify(log, null, 2));
  await browser.close();
  await vite.close();
}
if (log.errors.length) console.error('console errors:', log.errors.slice(0, 10));
