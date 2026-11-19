// r7 (2026-11-18): structural probe along Screen 07 — camera pitch, Benny vs the fitted proxy water plane, where the
// proxy tube's far rings (axis points at the painted ring depths) project on screen. Read-only.
// usage: node tools/match07/probe_r7.mjs <out.json> [query]
import { writeFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [OUT, Q = ''] = process.argv.slice(2);
const L = JSON.parse(readFileSync('assets/textures/match07/proj07.json', 'utf8'));
const { chromium } = loadPlaywright();
const vite = await startVite(5291);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const res = await page.evaluate(async (L) => {
    const r = window.__rainbow; r.goto('07');
    const s0 = r.state().s, stg = r.course.stage('07'), marks = r.course.marks;
    const out = { s0, stage: stg, top: marks['07_plunge_top'], bottom: marks['07_plunge_bottom'], m08: marks['08'], rows: [] };
    const { camera } = r.qa3d();
    const add = (a, b, k) => a.map((v, i) => v + b[i] * k);
    const base = L.water, X = L.X, U = L.U, D = L.D, T = L.tube;
    const axis = (d) => add(add(add(base, X, T.ax), U, T.h), D, d);
    const dists = [0, 3, 6, 10, 20, 30, 40, 50, 55, 60, 64, 68];
    for (const d of dists) {
      const target = s0 + d;
      let n = 0; while (r.state().s < target - 1e-3 && n < 4000) { r.step(1); n++; }
      r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
      camera.updateMatrixWorld();
      const e = camera.matrixWorld.elements; const fwd = [-e[8], -e[9], -e[10]];
      const pitch = Math.asin(fwd[1]) * 180 / Math.PI;
      const st = r.state();
      const smp = r.course.sample(st.s);
      const P = smp.pos ?? smp.p ?? smp;
      const pt = Array.isArray(P) ? P : [P.x, P.y, P.z];
      // signed height of the river point above the proxy water plane
      const rel = pt.map((v, i) => v - base[i]);
      const hPlane = rel[0] * U[0] + rel[1] * U[1] + rel[2] * U[2];
      const along = -(rel[0] * D[0] + rel[1] * D[1] + rel[2] * D[2]) * -1;
      const proj = (p) => { const v = new camera.position.constructor(...p).project(camera); return [Math.round((v.x + 1) / 2 * 864), Math.round((1 - v.y) / 2 * 1536), +v.z.toFixed(3)]; };
      const rings = {}; for (const [k, dd] of Object.entries(L.rings)) rings[k] = proj(axis(dd));
      rings.end = proj(axis(130));
      const tan = smp.tan ? [smp.tan.x, smp.tan.y, smp.tan.z] : null;
      out.rows.push({ d, s: +st.s.toFixed(2), stage: st.stage, pitch: +pitch.toFixed(1), riverSlopeDeg: tan ? +(Math.asin(tan[1]) * 180 / Math.PI).toFixed(1) : null,
        riverAbovePlane: +hPlane.toFixed(2), alongAxis: +along.toFixed(2), cam: camera.position.toArray().map((v) => +v.toFixed(2)), rings });
    }
    return out;
  }, L);
  writeFileSync(OUT, JSON.stringify(res, null, 1));
  console.log('s0', res.s0, 'stage', res.stage.s0, res.stage.s1, 'top', res.top, 'bottom', res.bottom);
  for (const w of res.rows) console.log(JSON.stringify(w));
} finally { await browser.close(); await vite.close?.(); }
