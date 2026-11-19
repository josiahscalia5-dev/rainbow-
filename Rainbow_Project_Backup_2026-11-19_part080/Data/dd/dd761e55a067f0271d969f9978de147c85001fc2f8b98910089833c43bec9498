// Screen 05 round 9 BLUEPRINT: structural measurements of live game frames (same shot list / stepping as r8_shots.mjs).
// For each shot: screenshot + the screen position of the river's 3D edges (real ribbon from Benny to the far tunnel seam,
// then the far river's water body), the course centre line, the real and far gold rings (projected circles), the end
// glow (throat) and Benny — written to <outDir>/<shot>.geo.json for tools/match05/blueprint05.py.
//   node tools/match05/blueprint05_game.mjs <outDir> "<query>" name,name,... [port]
import { mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [OUT, Q = '', ONLY = 't66_through_screen', PORT = '5295'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const ALL = {
  a00_approved_view: [0, null], f03_forward3u: [3, null], f06_forward6u: [6, null], f10_forward10u: [10, null], f20_forward20u: [20, null],
  s_left_steer: [6, -1], s_right_steer: [6, 1], s_left_hard: [12, -1], s_right_hard: [12, 1],
  t33_through_screen: ['t0.33', null], t66_through_screen: ['t0.66', null], t95_through_screen: ['t0.95', null],
};
const { createServer } = await import('vite');
const server = await createServer({ server: { port: Number(PORT), strictPort: false, host: '127.0.0.1', hmr: false, watch: { ignored: ['**/*'] }, fs: { allow: [process.cwd(), realpathSync(`${process.cwd()}/node_modules`)] } }, logLevel: 'error' });
await server.listen();
const url = (server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${PORT}/`).replace(/\/$/, '');
const { chromium } = loadPlaywright();
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  for (const name of ONLY.split(',')) {
    const [dist, steer] = ALL[name];
    const geo = await page.evaluate(async ([id, dist, steer]) => {
      const r = window.__rainbow; r.goto(id);
      const s0 = r.state().s;
      const stg = r.course.stage(id);
      const s1 = stg.s1 ?? (stg.s0 + (stg.length ?? 0));
      const target = typeof dist === 'string' ? s0 + Number(dist.slice(1)) * Math.max(0, s1 - s0) : s0 + dist;
      r.setSteer(steer);
      let n = 0; while (r.state().s < target - 1e-3 && n < 4000) { r.step(1); n++; }
      r.setSteer(null);
      r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
      const { scene, camera } = r.qa3d();
      camera.updateMatrixWorld(); camera.updateProjectionMatrix();
      const V3 = camera.position.constructor;
      const P = (v) => { const q = v.clone().project(camera); return q.z > 1 || q.z < -1 ? null : [+((q.x + 1) * 432).toFixed(1), +((1 - q.y) * 768).toFixed(1)]; };
      const { far05Debug } = await import('/src/world/far05.ts');
      const { tubeCenterAt } = await import('/src/world/tube.ts');
      const d = far05Debug; const path = d.perfPath; const ft = d.ft;
      const st = r.state();
      // seam (live far block): the far river's first row
      let river = null, farRings = null, glow = null;
      scene.traverse((o) => { if (o.name === 'tube05_far_river') river = o; if (o.name === 'tube05_end_glow') glow = o; if (o.isInstancedMesh && o.parent && o.count >= 3 && o.geometry?.getAttribute('position')?.count > 200 && !farRings && o.name === 'tube05_far') farRings = o; });
      const pa = river.geometry.getAttribute('position'), A = river.geometry.getAttribute('aRivA'), B = river.geometry.getAttribute('aRivB'), lat = river.geometry.getAttribute('aRivLat');
      const rowsN = 121, per = pa.count / rowsN;
      const seamZ = B.getW(0);
      const sSeam = ft.sF + seamZ;
      const near = [];
      for (let s = st.s - 4; s < Math.min(sSeam, st.s + 60); s += 0.5) {
        const f = r.course.sample(s); const hw = r.course.widthAt(s) / 2;
        const L = f.pos.clone().addScaledVector(f.right, -hw).addScaledVector(f.up, 0.28);
        const R = f.pos.clone().addScaledVector(f.right, hw).addScaledVector(f.up, 0.28);
        const C = f.pos.clone();
        const tc = tubeCenterAt(path, s, new V3()); const rad = path.radius(s); const tf = path.frame(s);
        const top = tc.clone().addScaledVector(tf.up, rad), wl = tc.clone().addScaledVector(tf.right, -rad), wr = tc.clone().addScaledVector(tf.right, rad);
        near.push({ s: +s.toFixed(2), hw: +hw.toFixed(2), L: P(L), R: P(R), C: P(C), top: P(top), wallL: P(wl), wallR: P(wr) });
      }
      // far river water body edges per geometry row (vertex columns at the body edges e0 / e1: j = 3 and j = per - 4)
      const far = [];
      for (let i = 0; i < rowsN; i += 2) {
        const k0 = i * per + 3, k1 = i * per + per - 4;
        const v0 = new V3(pa.getX(k0), pa.getY(k0), pa.getZ(k0)), v1 = new V3(pa.getX(k1), pa.getY(k1), pa.getZ(k1));
        far.push({ Z: +B.getW(k0).toFixed(2), L: P(v0), R: P(v1), xB: +A.getX(k0).toFixed(2), hw: +A.getY(k0).toFixed(2) });
      }
      // rings: real 05 rings (tube circle at each ring s) + far ring instances (unit circle in the instance frame)
      const circ = (pts) => { const ok = pts.filter(Boolean); if (ok.length < 6) return null; const cx = ok.reduce((a, p) => a + p[0], 0) / ok.length, cy = ok.reduce((a, p) => a + p[1], 0) / ok.length; const rr = ok.reduce((a, p) => a + Math.hypot(p[0] - cx, p[1] - cy), 0) / ok.length; return [+cx.toFixed(1), +cy.toFixed(1), +rr.toFixed(1)]; };
      const rings = [];
      for (const s of d.rings05) {
        if (s < st.s - 6 || s > sSeam + 1) continue;
        const tc = tubeCenterAt(path, s, new V3()); const rad = path.radius(s); const tf = path.frame(s);
        const pts = []; for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; pts.push(P(tc.clone().addScaledVector(tf.right, Math.cos(a) * rad).addScaledVector(tf.up, Math.sin(a) * rad))); }
        rings.push({ kind: 'real', s: +s.toFixed(2), c: circ(pts) });
      }
      if (farRings) {
        const m = new camera.matrixWorld.constructor();
        for (let i = 0; i < farRings.count; i++) {
          farRings.getMatrixAt(i, m); m.premultiply(farRings.matrixWorld);
          const pts = []; for (let k = 0; k < 24; k++) { const a = (k / 24) * Math.PI * 2; pts.push(P(new V3(Math.cos(a), Math.sin(a), 0).applyMatrix4(m))); }
          rings.push({ kind: 'far', i, c: circ(pts) });
        }
      }
      let glowC = null;
      if (glow) { glow.updateMatrixWorld(); const c = P(glow.position.clone()); const e = P(new V3(1, 0, 0).applyMatrix4(glow.matrixWorld)); glowC = c && e ? [c[0], c[1], +Math.hypot(e[0] - c[0], e[1] - c[1]).toFixed(1)] : null; }
      return { state: st, seamZ: +seamZ.toFixed(2), sSeam: +sSeam.toFixed(2), benny: r.bennyScreen(), near, far, rings, glow: glowC };
    }, ['05', dist, steer]);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    writeFileSync(`${OUT}/${name}.geo.json`, JSON.stringify({ query: Q, shot: name, ...geo }));
    console.log(name, 's', geo.state.s, 'seam', geo.sSeam, 'near rows', geo.near.length, 'rings', geo.rings.length, 'glow', JSON.stringify(geo.glow));
  }
} finally {
  await browser.close(); await server.close();
}
