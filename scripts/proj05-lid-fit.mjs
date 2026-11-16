#!/usr/bin/env node
// Screen 05 paddles (`?projlid05=1`): fit each of the approved picture's six wall lids (tools/proj05/tunnel_common.py
// LIDS: L1 L2 L3 left, R1 R2 R3 right) with one real 3D lid on the real 05 wall, seen from the locked 05 camera.
// Lid = the approved D-shaped TRAY (src/vfx/proj05Tunnel.ts trayLidGeometry), lying on the wall: droop −90° (flat on
// the tangent plane) … −65° (raised off the wall), never into it.
// Grid search over (s along the tube, angle above the axis, droop, size, stretch along the tube) with the real lid geometry projected by the real
// camera; score = raster IoU of the projected silhouette (convex hull) with the approved outline polygon (bounding-box
// IoU >= 0.55 as a prefilter); a lid may not cross a gold ring band, and the camera must see its underside.
// Read-only: nothing in the game changes.   node scripts/proj05-lid-fit.mjs [--out=qa/pilot05/proj/tunnel/lid/fit.json]
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const OUT = typeof opt.out === 'string' ? opt.out : 'qa/pilot05/proj/tunnel/lid/fit.json';
const TARGETS = {   // approved outline boxes, full-frame px [x0, y0, x1, y1] (tunnel_common.LIDS)
  L1: [62.5, 315.5, 214, 420], L2: [248.8, 418.8, 332.5, 472.5], L3: [372, 455, 402, 478],
  R1: [720, 400, 864, 527.5], R2: [631, 394, 696, 451], R3: [581, 435, 622.5, 455],
};
const POLYS = {      // approved outlines (tunnel_common.LIDS), full-frame px
  L1: [[62.5, 360], [75, 324], [102, 315.5], [140, 322.5], [170, 340], [200, 372.5], [214, 400], [212.5, 415], [190, 420], [152, 410], [115, 392], [80, 375]],
  L2: [[248.8, 447.5], [260, 422.5], [280, 418.8], [305, 425], [325, 442.5], [332.5, 460], [330, 470], [310, 472.5], [280, 462.5], [255, 452.5]],
  L3: [[372, 458], [385, 455], [400, 462], [402, 476], [388, 478], [374, 470]],
  R1: [[720, 510], [735, 480], [760, 450], [800, 425], [835, 404], [864, 400], [864, 497.5], [835, 505], [785, 515], [750, 527.5], [732.5, 526], [720, 515]],
  R2: [[631, 444], [640, 420], [660, 405], [685, 394], [692.5, 395], [696, 425], [695, 434], [677.5, 442.5], [655, 451], [635, 450]],
  R3: [[581, 455], [587.5, 442.5], [602.5, 435.5], [619, 435], [622.5, 447.5], [620, 451], [597.5, 455]],
};
const { chromium } = loadPlaywright();
const vite = await startVite(5243);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const res = await page.evaluate(async ([TARGETS, POLYS]) => {
    const R = window.__rainbow; R.goto('05');
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const { camera } = R.qa3d();
    camera.updateMatrixWorld();
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const { wallLidMatrix } = await import('/src/world/tube.ts');
    const { trayLidGeometry } = await import('/src/vfx/proj05Tunnel.ts');
    const { far05Debug: D } = await import('/src/world/far05.ts');
    const path = D.perfPath;
    const TRAY_H = 0.45, SINK = 0.2;
    const geo = trayLidGeometry(TRAY_H, 16);
    const P = geo.attributes.position;
    const verts = []; for (let i = 0; i < P.count; i++) verts.push(new THREE.Vector3(P.getX(i), P.getY(i), P.getZ(i)));
    const vp = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    const M = new THREE.Matrix4(), MV = new THREE.Matrix4(), v = new THREE.Vector4();
    const r05 = path.radius(D.sCam05);
    let st = 1.0;
    const bandHalf = (D.band05?.width ?? 1.2) / 2;
    const ringsAhead = D.rings05.map((x) => x - D.sCam05);
    const pts = [];
    const project = (s, side, ang, droop, size) => {
      wallLidMatrix(path, s, side, ang, droop, size, st, SINK, M);
      MV.multiplyMatrices(vp, M);
      pts.length = 0;
      for (const p of verts) {
        v.set(p.x, p.y, p.z, 1).applyMatrix4(MV);
        if (v.w <= 0.05) return null;
        pts.push([(v.x / v.w * 0.5 + 0.5) * 864, (0.5 - v.y / v.w * 0.5) * 1536]);
      }
      return pts;
    };
    const hull = (P) => {            // monotone chain
      const a = P.slice().sort((p, q) => p[0] - q[0] || p[1] - q[1]);
      const cr = (o, p, q) => (p[0] - o[0]) * (q[1] - o[1]) - (p[1] - o[1]) * (q[0] - o[0]);
      const lo = [], up = [];
      for (const p of a) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
      for (let i = a.length - 1; i >= 0; i--) { const p = a[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
      return lo.slice(0, -1).concat(up.slice(0, -1));
    };
    const inPoly = (x, y, P) => {
      let c = false;
      for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
        const [xi, yi] = P[i], [xj, yj] = P[j];
        if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    const shapeIoU = (H, T, poly) => {     // raster IoU (2 px grid) of the projected hull vs the approved outline, on screen
      let x0 = Math.min(T[0], ...H.map((p) => p[0])), x1 = Math.max(T[2], ...H.map((p) => p[0]));
      let y0 = Math.min(T[1], ...H.map((p) => p[1])), y1 = Math.max(T[3], ...H.map((p) => p[1]));
      x0 = Math.max(0, x0); y0 = Math.max(0, y0); x1 = Math.min(864, x1); y1 = Math.min(1536, y1);
      let i = 0, u = 0;
      for (let y = y0 + 1; y < y1; y += 2) for (let x = x0 + 1; x < x1; x += 2) {
        const a = inPoly(x, y, H), b = inPoly(x, y, poly);
        if (a && b) i++; if (a || b) u++;
      }
      return u ? i / u : 0;
    };
    // the approved paddles are seen from BELOW (their flat underside faces down toward the camera): the camera must lie
    // on the underside of the lid plane (local +Y = the lid's top normal)
    const camP = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
    const lp = new THREE.Vector3(), ly = new THREE.Vector3();
    const seenFromBelow = (s, side, ang, droop, size) => {
      wallLidMatrix(path, s, side, ang, droop, size, st, SINK, M);
      lp.setFromMatrixPosition(M);
      ly.setFromMatrixColumn(M, 1).normalize();
      const d = camP.clone().sub(lp);
      return ly.dot(d) < -0.12 * d.length();
    };
    const clearOfRings = (ds, size) => ringsAhead.every((r) => Math.abs(ds - r) > size * st + bandHalf + 0.15);
    const box = (s, side, ang, droop, size) => {
      wallLidMatrix(path, s, side, ang, droop, size, st, SINK, M);
      MV.multiplyMatrices(vp, M);
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (const p of verts) {
        v.set(p.x, p.y, p.z, 1).applyMatrix4(MV);
        if (v.w <= 0.05) return null;                       // behind / at the camera
        const x = (v.x / v.w * 0.5 + 0.5) * 864, y = (0.5 - v.y / v.w * 0.5) * 1536;
        x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
      }
      return [Math.max(0, x0), Math.max(0, y0), Math.min(864, x1), Math.min(1536, y1)];
    };
    const iou = (a, b) => {
      const ix = Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])), iy = Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
      const i = ix * iy, u = (a[2] - a[0]) * (a[3] - a[1]) + (b[2] - b[0]) * (b[3] - b[1]) - i;
      return u > 0 ? i / u : 0;
    };
    const out = {};
    for (const [name, T] of Object.entries(TARGETS)) {
      if (name === 'L3' || name === 'R3') continue;   // beyond the real 05 tube: the forced-perspective far lids
      let best = null;
      for (const side of [name[0] === 'L' ? -1 : 1]) {
        for (let s = D.sCam05 + 1; s <= D.sCam05 + 53; s += 0.5) {
          for (let ang = -16; ang <= 70; ang += 2) {
            for (let droop = -90; droop <= -65; droop += 5) {
              for (const stv of [1.5, 2, 2.5, 3, 3.5, 4, 5]) { st = stv;
              for (let size = 0.6; size <= 3.01; size += 0.15) {
                const szw = size * Math.min(1.4, r05 / 7.6);
                if (!clearOfRings(s - D.sCam05, szw)) continue;
                const b = box(s, side, ang, droop, szw);
                if (!b || b[2] <= b[0] || b[3] <= b[1]) continue;
                const bi = iou(b, T);
                if (bi < 0.55) continue;
                const sc = shapeIoU(hull(project(s, side, ang, droop, szw)), T, POLYS[name]);
                if (!best || sc > best.iou) best = { iou: sc, boxIoU: bi, side, s, ds: s - D.sCam05, ang, droop, size, stretch: st, box: b.map((x) => Math.round(x)) };
              }
              }
            }
          }
        }
      }
      // refine around the best: finer steps
      if (!best) { out[name] = { target: T, none: true }; continue; }
      const b0 = best; st = b0.stretch;
      for (let s = b0.s - 0.5; s <= b0.s + 0.5; s += 0.125) for (let ang = b0.ang - 2; ang <= b0.ang + 2; ang += 0.5)
        for (let droop = Math.max(-90, b0.droop - 5); droop <= Math.min(-65, b0.droop + 5); droop += 2.5) for (let size = b0.size - 0.15; size <= b0.size + 0.15; size += 0.05) for (const stv of [b0.stretch - 0.25, b0.stretch, b0.stretch + 0.25]) { st = stv;
          const szw = size * Math.min(1.4, r05 / 7.6);
          if (!clearOfRings(s - D.sCam05, szw)) continue;
          const b = box(s, b0.side, ang, droop, szw);
          if (!b || b[2] <= b[0] || b[3] <= b[1]) continue;
          const bi = iou(b, T);
          if (bi < 0.55) continue;
          const sc = shapeIoU(hull(project(s, b0.side, ang, droop, szw)), T, POLYS[name]);
          if (sc > best.iou) best = { iou: sc, boxIoU: bi, side: b0.side, s, ds: s - D.sCam05, ang, droop, size, stretch: st, box: b.map((x) => Math.round(x)) };
        }
      out[name] = { target: T, ...best };
    }
    return { sCam05: D.sCam05, r05, rings05: D.rings05, sGlow05: D.sGlow05, bandHalf, fit: out };
  }, [TARGETS, POLYS]);
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(res, null, 1));
  for (const [k, f] of Object.entries(res.fit)) if (!f.none) console.log(k, 'shapeIoU', f.iou.toFixed(3), 'boxIoU', f.boxIoU.toFixed(3), 'side', f.side, 'ds', f.ds.toFixed(2), 'ang', f.ang, 'droop', f.droop, 'size', f.size.toFixed(2), 'stretch', f.stretch, 'box', JSON.stringify(f.box), 'target', JSON.stringify(f.target));
  console.log('rings05', JSON.stringify(res.rings05), 'sCam05', res.sCam05, 'r05', res.r05);
} finally { await browser.close(); await vite.close(); }
