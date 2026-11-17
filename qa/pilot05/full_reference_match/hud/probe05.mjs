#!/usr/bin/env node
// Screen 05 HUD + coins probe (animation-and-gameplay-engineer, full reference match). Run from the repo root.
// One real game session per query (render slot via scripts/lib/pw.mjs), locked 05 checkpoint exactly like
// scripts/capture.mjs (time frozen at 12, 864 x 1536, dpr 1). Writes, per query tag:
//   <out>/<tag>.png        full frame (= capture.mjs 05 output)
//   <out>/<tag>_nohud.png  the same frame with #hud hidden (background for the HUD harness)
//   <out>/<tag>.json       HUD element rects, coinScreen(), camera(), coin defs near the checkpoint
//   [--solve=targets.json] also solves course (s, lat) for each approved coin centre (see solveCoins below)
// usage: node qa/pilot05/full_reference_match/hud/probe05.mjs --out=DIR tag1='query' [tag2='query' ...] [--solve=FILE]
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../../../scripts/lib/pw.mjs';

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const runs = args.filter((a) => !a.startsWith('--')).map((a) => { const i = a.indexOf('='); return [a.slice(0, i), a.slice(i + 1)]; });
const OUT = opt.out ?? '/tmp/claude-0/hc05/probe';
mkdirSync(OUT, { recursive: true });
const targets = opt.solve ? JSON.parse(readFileSync(opt.solve, 'utf8')) : null;
const { chromium } = loadPlaywright();
const vite = await startVite(5251);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  for (const [tag, q] of runs) {
    const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(`${vite.url}/?qa=1&dpr=1${q ? '&' + q : ''}`);
    await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
    const err = await page.evaluate(() => window.__error);
    if (err) throw new Error(err);
    await page.evaluate(() => window.__rainbow.goto('05'));
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(250);
    await page.screenshot({ path: `${OUT}/${tag}.png` });
    const info = await page.evaluate(() => {
      const R = window.__rainbow;
      const rect = (sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return [+r.left.toFixed(1), +r.top.toFixed(1), +r.width.toFixed(1), +r.height.toFixed(1)]; };
      const sels = ['#hud .bar', '#hud .seg.hearts', '#hud .seg.coins', '#hud .seg.pause', '#hud .hearts .icon', '#hud [data-k="hearts"]', '#hud .plus', '#hud .coins .icon', '#hud [data-k="coins"]', '#hud .pbtn', '#hud .banner', '#hud .banner span'];
      const hud = Object.fromEntries(sels.map((s) => [s, rect(s)]));
      const c = R.course; const sCp = c.marks['05_crest'];
      const defs = R.coinDefs().map((d, i) => ({ i, ...d })).filter((d) => d.s > sCp - 8 && d.s < c.stage('06').s0);
      return { hud, coinsText: document.querySelector('#hud [data-k="coins"]')?.textContent, state: R.state(), coinScreen: R.coinScreen(), camera: R.camera(), sCp, s05: [c.stage('05').s0, c.stage('05').s1], defs };
    });
    if (targets) {
      info.solve = await page.evaluate((T) => {
        // For each approved coin centre (x, y) find the course point (s, lat) whose coin centre (height h, the same bob as
        // coins.ts at the frozen clock t = 12) projects onto it with the live render camera. Coarse grid + Newton.
        const R = window.__rainbow; const c = R.course; const { camera } = R.qa3d();
        const V3 = camera.position.constructor; camera.updateMatrixWorld();
        const W = 864, H = 1536; const sCp = c.marks['05_crest'];
        const right = new V3().setFromMatrixColumn(camera.matrixWorld, 0);
        const P = (s, lat, h) => { const f = c.sample(s); return f.pos.clone().addScaledVector(f.right, lat).addScaledVector(f.up, h); };
        const proj = (p) => { const v = p.clone().project(camera); return [((v.x + 1) / 2) * W, ((1 - v.y) / 2) * H, v.z]; };
        const dia = (p) => { const a = p.clone().project(camera), e = p.clone().addScaledVector(right, 0.5).project(camera); return (e.x - a.x) * W; };
        const out = [];
        const base = R.coinDefs().findIndex((d) => d.s > sCp);
        for (const [k, t] of T.coins.entries()) {
          t.index = base + k;
          const h = (t.h ?? T.h) + 0.08 * Math.sin(12 * 3 + t.index);
          let best = null;
          for (let s = sCp + (t.dsMin ?? 1); s < sCp + (t.dsMax ?? T.sMax); s += 0.05) for (let lat = -(t.latMax ?? 3.6); lat <= (t.latMax ?? 3.6); lat += 0.1) {
            const [x, y, z] = proj(P(s, lat, h)); if (z > 1 || z < -1) continue;
            const e = (x - t.x) ** 2 + (y - t.y) ** 2; if (!best || e < best.e) best = { e, s, lat };
          }
          let { s, lat } = best;
          for (let it = 0; it < 30; it++) {
            const [x, y] = proj(P(s, lat, h)); const ex = x - t.x, ey = y - t.y;
            const ds = 1e-3, dl = 1e-3;
            const [xs, ys] = proj(P(s + ds, lat, h)); const [xl, yl] = proj(P(s, lat + dl, h));
            const a = (xs - x) / ds, b = (xl - x) / dl, cc = (ys - y) / ds, d = (yl - y) / dl; const det = a * d - b * cc;
            if (Math.abs(det) < 1e-9) break;
            s -= (d * ex - b * ey) / det; lat -= (-cc * ex + a * ey) / det;
            s = Math.min(sCp + (t.dsMax ?? T.sMax), Math.max(sCp + (t.dsMin ?? 1), s)); lat = Math.max(-(t.latMax ?? 3.6), Math.min(t.latMax ?? 3.6, lat));
          }
          const p = P(s, lat, h); const [x, y] = proj(p); const d1 = dia(p);
          out.push({ ...t, s: +s.toFixed(3), ds: +(s - sCp).toFixed(3), lat: +lat.toFixed(3), x: +x.toFixed(1), y: +y.toFixed(1), d_at_scale1: +d1.toFixed(2), scale: +(t.w / d1).toFixed(3), dist: +p.distanceTo(camera.position).toFixed(2) });
        }
        return out;
      }, targets);
    }
    info.errors = errors;
    writeFileSync(`${OUT}/${tag}.json`, JSON.stringify(info, null, 1));
    await page.evaluate(() => { document.getElementById('hud').style.visibility = 'hidden'; });
    await page.waitForTimeout(100);
    await page.screenshot({ path: `${OUT}/${tag}_nohud.png` });
    console.log(tag, '→', `${OUT}/${tag}.png`, 'coins', info.coinsText, 'errors', errors.length);
    await page.close();
  }
} finally {
  await browser.close();
  await vite.close();
}
