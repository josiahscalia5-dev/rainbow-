#!/usr/bin/env node
// Any screen: read-only dump of the REAL 3D layout around a checkpoint (course centre line, river width, tube radius,
// the straight-tube axis frames, the checkpoint camera and Benny), so structural fixes can be placed by measurement.
//   node scripts/match-geo.mjs --id=07 [--q=match07=1] [--from=-10] [--to=70] [--step=1] [--out=qa/match/07/geo.json]
// from/to are arc-length offsets from the stage start. Nothing in the game changes.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const ID = String(opt.id ?? '07');
const Q = typeof opt.q === 'string' ? opt.q : `match${ID}=1`;
const OUT = typeof opt.out === 'string' ? opt.out : `qa/match/${ID}/geo.json`;
const FROM = Number(opt.from ?? -10), TO = Number(opt.to ?? 70), STEP = Number(opt.step ?? 1);
const W = ID === '03' ? 727 : 864, H = 1536;
mkdirSync(dirname(OUT), { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5259);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const geo = await page.evaluate(async ([id, FROM, TO, STEP]) => {
    const { Course } = await import('/src/world/course.ts');
    const { straightTubePath } = await import('/src/world/tube.ts');
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const R = window.__rainbow;
    const c = new Course();
    const st = c.stage(id);
    const s05 = c.stage('05').s0, s08 = c.stage('08').s0;
    const perf = straightTubePath(c, s05, s08, { window: 30, taper: 14, baseRadius: (s) => c.prop('tube', s) });
    const r3 = (v) => v.toArray().map((x) => +x.toFixed(4));
    const rows = [];
    for (let d = FROM; d <= TO + 1e-6; d += STEP) {
      const s = st.s0 + d;
      if (s < 0 || s > c.length) continue;
      const f = c.sample(s);
      const row = { d: +d.toFixed(3), s: +s.toFixed(3), pos: r3(f.pos), tan: r3(f.tan), up: r3(f.up), right: r3(f.right), width: +c.widthAt(s).toFixed(3), tube: +c.prop('tube', s).toFixed(3) };
      if (s >= s05 && s <= s08) {
        const a = perf.frame(s);
        Object.assign(row, { axisPos: r3(a.pos), axisTan: r3(a.tan), axisUp: r3(a.up), axisR: +perf.radius(s).toFixed(3), axisDepth: +perf.depth(s).toFixed(3) });
      }
      rows.push(row);
    }
    R.goto(id);
    const { camera, scene } = R.qa3d();
    camera.updateMatrixWorld();
    let benny = null;
    scene.traverse((o) => { if (!benny && /benny_root/i.test(o.name)) benny = o; });
    const bp = benny ? new THREE.Vector3().setFromMatrixPosition(benny.matrixWorld) : null;
    const vp = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    return {
      id, stage: { s0: st.s0, s1: st.s1, width: st.width, tube: st.tube }, marks: c.marks, length: c.length, state: R.state(),
      camera: { pos: r3(camera.position), quat: camera.quaternion.toArray(), fov: camera.fov, aspect: camera.aspect, near: camera.near, far: camera.far, viewProjection: vp.toArray(), forward: r3(new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion)) },
      benny: bp ? r3(bp) : null, rows,
    };
  }, [ID, FROM, TO, STEP]);
  writeFileSync(OUT, JSON.stringify(geo, null, 1));
  console.log('geo', ID, 'rows', geo.rows.length, 'stage', JSON.stringify(geo.stage), 'state', JSON.stringify(geo.state), '→', OUT);
} finally {
  await browser.close();
  await vite.close();
}
