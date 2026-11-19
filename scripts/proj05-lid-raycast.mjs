#!/usr/bin/env node
// Screen 05 paddles (`?projlid05=1`), Blender pipeline step B: lift every vertex of the approved paddle outlines
// (qa/pilot05/proj/tunnel/lid/mesh2d.json, tools/proj05/lid_mesh2d.py) onto the REAL 05 wall: a ray from the real locked
// 05 camera through the vertex pixel, first hit on the real 05 wall mesh (rings, lids, water and Benny ignored); beyond the
// real wall's end, the forced-perspective far wall.
// Writes raycast.json: camera (position, matrixWorld, projection, fov, aspect) + per paddle per vertex the wall point,
// the wall normal (toward the camera) and the ray direction. Read-only: nothing in the game changes.
//   node scripts/proj05-lid-raycast.mjs [--dir=qa/pilot05/proj/tunnel/lid]
import { readFileSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const DIR = typeof opt.dir === 'string' ? opt.dir : 'qa/pilot05/proj/tunnel/lid';
const mesh2d = JSON.parse(readFileSync(`${DIR}/mesh2d.json`, 'utf8'));
const { chromium } = loadPlaywright();
const vite = await startVite(5245);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const res = await page.evaluate(async (mesh2d) => {
    const R = window.__rainbow; R.goto('05');
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const { scene, camera } = R.qa3d();
    camera.updateMatrixWorld();
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const walls = [], farWalls = [];
    scene.traverse((o) => {
      let k = '';
      try { k = o.material?.customProgramCacheKey?.() ?? ''; } catch { /* */ }
      if (o.isMesh && /strips-attribute-wall05v/.test(k)) farWalls.push(o);
      else if (o.isMesh && /strips-attribute-wall05/.test(k)) walls.push(o);
    });
    let onFar = 0;
    const rc = new THREE.Raycaster();
    const camP = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
    const nm = new THREE.Matrix3();
    const out = {};
    let miss = 0;
    for (const [name, L] of Object.entries(mesh2d.lids)) {
      const P = [], N = [], D = [];
      for (const [x, y] of L.verts_px) {
        rc.setFromCamera({ x: (x / 864) * 2 - 1, y: -((y / 1536) * 2 - 1) }, camera);
        // the real wall first; beyond its end (the deep parts of L2 / R2) the forced-perspective far wall
        let h = rc.intersectObjects(walls, false)[0];
        if (!h) { h = rc.intersectObjects(farWalls, false)[0]; if (h) onFar++; }
        if (!h) { miss++; P.push(null); N.push(null); D.push(rc.ray.direction.toArray()); continue; }
        nm.getNormalMatrix(h.object.matrixWorld);
        const n = h.face.normal.clone().applyMatrix3(nm).normalize();
        if (n.dot(rc.ray.direction) > 0) n.negate();              // toward the camera (into the tube)
        P.push(h.point.toArray()); N.push(n.toArray()); D.push(rc.ray.direction.toArray());
      }
      out[name] = { P, N, D };
    }
    return {
      walls: walls.length, farWalls: farWalls.length, onFar, miss,
      camera: { position: camP.toArray(), matrixWorld: camera.matrixWorld.toArray(), projection: camera.projectionMatrix.toArray(), fov: camera.fov, aspect: camera.aspect },
      lids: out,
    };
  }, mesh2d);
  writeFileSync(`${DIR}/raycast.json`, JSON.stringify(res));
  console.log('walls', res.walls, 'far walls', res.farWalls, 'on far wall', res.onFar, 'missed rays', res.miss, Object.fromEntries(Object.entries(res.lids).map(([k, v]) => [k, v.P.length])));
} finally { await browser.close(); await vite.close(); }
