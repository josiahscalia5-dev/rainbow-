/**
 * `?match05=1&m05far=1` — Screen 05 round 7 (line B, qa/match/05/NOTES.md "Round 7"): the far forced-perspective tunnel
 * of Screen 05 (environment.ts `// ---- 05 far tunnel`, tube.ts ForcedTunnel) recalibrated to the LIVE camera every
 * frame instead of folding away.
 *
 * Why: the far block (rings C … G, the far S-river, the warm throat) is a depth compression along the eye rays of the
 * LOCKED checkpoint eye. From ≈34 u before its seam (sF05) it folded away (`openFor`), so from ≈20 u into the stage the
 * camera saw the far rings / river morphing out and the 06 arch hall behind them — the "old pink default world" of
 * the lead's audit (t66 / t95 frames). The compression is exact for ANY eye position once its two eye-dependent
 * constants (D0 = eye depth of the seam, q = eye offset from the axis) follow the eye, so under this switch:
 *   * the VIRTUAL tunnel (virtual depth Z beyond sF05, tunnel coordinate v = sF05 + u(Z)) stays put — rings, wall rows,
 *     the baked far water F and the far river layout are anchored to it, so everything approaches like real geometry;
 *   * the seam slides ahead of the eye so it never comes nearer than the locked view had it (D0lock ≈ 53 u): the part
 *     of the virtual tunnel between sF05 and the seam is drawn at REAL scale (k = 1) on the same straight axis (it
 *     covers the 05 → 06 flare), capped at `zCap` (just past the 06 start: the 06 river must not climb inside it);
 *   * the far river starts AT the seam (the real ribbon carries the course, coins and Benny before it);
 *   * only at the very end of the stage (eye ≤ ~11 u from the capped seam) the block folds away as before, into 06.
 * Default build and `?match05=1` without `m05far`: this file is never called (environment.ts keeps `openFor`).
 */
import * as THREE from 'three';
import type { ForcedTunnel, TubeWarp } from './tube';
import { tubeCenterAt } from './tube';
import type { FarRiverLayout, FarRiverRow } from './far05';
import { EDGE_LIFT, MATCH05, flag05, m05seam } from '../vfx/waterRibbon';
import { clip05 } from '../vfx/clip05';

export const M05FAR: boolean = MATCH05 && flag05('m05far');

type Item = { u: number; o: THREE.Vector3; basis: THREE.Matrix4; s: THREE.Vector3; openPos: THREE.Vector3; openScale: number };

export interface LiveFar05Args {
  ft: ForcedTunnel;
  farWall: THREE.Mesh;
  farRiver: THREE.Mesh;
  farRings: THREE.InstancedMesh;
  farLids: THREE.InstancedMesh;
  ringItems: Item[];
  lidItems: Item[];
  glow: THREE.Mesh;
  glowMat: THREE.ShaderMaterial;
  lay: FarRiverLayout;
  level: number;
  zEnd: number;
  warp?: TubeWarp;
  /** wall build parameters (as ft.geometry(radial, steps, inset)) */
  radial: number; wallSteps: number; inset: number;
  /** river build parameters (as farRiverGeometry(cols, steps)) */
  cols: number; riverSteps: number;
  /** largest real extension beyond sF05 (units) */
  zCap: number;
  /** fold window: eye → seam distance (units) */
  foldNear: number; foldFar: number;
  /** the real course's height above the axis at real distance z beyond sF05 (the far water meets it at the seam) */
  riverUp: (z: number) => number;
}

const ROW_KEYS: (keyof FarRiverRow)[] = ['xB', 'hw', 'cL', 'wL', 'cR', 'wR', 'core'];

/** returns sync(cam): call from every far part's onBeforeRender */
export function createLiveFar05(a: LiveFar05Args): (cam: THREE.Camera) => void {
  const { ft } = a;
  const L = ft.L, c0 = ft.c0, T = ft.T, U = ft.U, Rt = ft.Rt, R = ft.R, sF = ft.sF;
  const D0lock = ft.D0;
  // the river layout depends on Z only: tabulate it once (dense near the seam) and interpolate
  const NT = 2400;
  const tz = new Float64Array(NT + 1), tr = new Float64Array((NT + 1) * ROW_KEYS.length);
  for (let n = 0; n <= NT; n++) {
    const Z = a.zEnd * (n / NT) ** 2;
    tz[n] = Z;
    const r = a.lay.row(Z);
    ROW_KEYS.forEach((k, i) => { tr[n * ROW_KEYS.length + i] = r[k]; });
  }
  const rowAt = (Z: number): FarRiverRow => {
    const f = Math.sqrt(Math.min(1, Math.max(0, Z / a.zEnd))) * NT;
    const n = Math.min(NT - 1, Math.floor(f)), w = f - n;
    const o = {} as FarRiverRow;
    ROW_KEYS.forEach((k, i) => { o[k] = tr[n * ROW_KEYS.length + i] * (1 - w) + tr[(n + 1) * ROW_KEYS.length + i] * w; });
    return o;
  };

  // live state
  let D0 = D0lock, zs = 0;
  const q = new THREE.Vector3();
  const zOf = (Z: number) => (Z <= zs ? Z : zs + (Z - zs) / (1 + (Z - zs) / L));
  const kOf = (Z: number) => (D0 + zOf(Z)) / (D0 + Z);
  const cOf = (Z: number) => { if (Z <= zs) return 1; const b = 1 + (Z - zs) / L; return 1 / (b * b); };
  const tmp = new THREE.Vector3();
  const point = (Z: number, o: THREE.Vector3, out: THREE.Vector3) => {
    const k = kOf(Z);
    return out.copy(c0).addScaledVector(T, zOf(Z)).add(q).addScaledVector(tmp.copy(o).sub(q), k);
  };

  // originals, restored whenever the eye is back at the locked checkpoint eye (the locked view stays bit-identical)
  const wg = a.farWall.geometry, rg = a.farRiver.geometry;
  const keep = (g: THREE.BufferGeometry, names: string[]) => names.map((n) => (g.getAttribute(n).array as Float32Array).slice());
  const wallNames = ['position', 'uv', 'fgExtra'];
  const wallOrig = keep(wg, wallNames);
  const wallOpenOrig = (wg.morphAttributes.position[0].array as Float32Array).slice();
  const rivNames = ['position', 'uv', 'aRivLat', 'aRivA', 'aRivB', 'fgExtra'];
  const rivOrig = keep(rg, rivNames);
  const rivOpenOrig = (rg.morphAttributes.position[0].array as Float32Array).slice();
  const eyeLock = c0.clone().addScaledVector(T, -D0lock).add(ft.q);
  const glowPos0 = a.glow.position.clone(), glowScale0 = a.glow.scale.x;

  const restore = () => {
    wallNames.forEach((n, i) => { (wg.getAttribute(n).array as Float32Array).set(wallOrig[i]); wg.getAttribute(n).needsUpdate = true; });
    (wg.morphAttributes.position[0].array as Float32Array).set(wallOpenOrig); wg.morphAttributes.position[0].needsUpdate = true;
    rivNames.forEach((n, i) => { (rg.getAttribute(n).array as Float32Array).set(rivOrig[i]); rg.getAttribute(n).needsUpdate = true; });
    (rg.morphAttributes.position[0].array as Float32Array).set(rivOpenOrig); rg.morphAttributes.position[0].needsUpdate = true;
    a.glow.position.copy(glowPos0); a.glow.scale.setScalar(glowScale0);
  };

  const d = new THREE.Vector3(), o = new THREE.Vector3(), p = new THREE.Vector3(), cr = new THREE.Vector3();
  const wv = new THREE.Vector2();
  const rowZ = (i: number, steps: number, zFrom: number) => {
    // uniform in projected radius (1/D), as ForcedTunnel.geometry
    const t = i / steps, Da = D0 + zFrom;
    const Dv = 1 / (1 / Da - t * (1 / Da - 1 / (D0 + a.zEnd)));
    return Math.max(zFrom, Dv - D0);
  };
  const fillWall = () => {
    const pos = wg.getAttribute('position').array as Float32Array, uv = wg.getAttribute('uv').array as Float32Array;
    const ext = wg.getAttribute('fgExtra').array as Float32Array, opn = wg.morphAttributes.position[0].array as Float32Array;
    const r0 = R * (1 - a.inset);
    for (let i = 0; i <= a.wallSteps; i++) {
      const Z = rowZ(i, a.wallSteps, 0), z = zOf(Z), sReal = sF + z;
      const fr = ft.path.frame(sReal);
      tubeCenterAt(ft.path, sReal, cr);
      const rOpen = ft.path.radius(sReal) * 1.1 + 0.4;
      const vv = sF + ft.uOfZ(Z);
      for (let j = 0; j <= a.radial; j++) {
        const th = -1.5 * Math.PI + (j / a.radial) * Math.PI * 2;
        d.copy(Rt).multiplyScalar(Math.cos(th)).addScaledVector(U, Math.sin(th));
        o.copy(d).multiplyScalar(r0);
        if (a.warp) { a.warp(Z, th, wv); o.addScaledVector(Rt, wv.x).addScaledVector(U, wv.y); }
        point(Z, o, p);
        const k = i * (a.radial + 1) + j;
        p.toArray(pos, k * 3);
        uv[k * 2 + 1] = vv;
        ext[k] = Z - z;
        o.copy(fr.right).multiplyScalar(Math.cos(th)).addScaledVector(fr.up, Math.sin(th)).multiplyScalar(rOpen).add(cr);
        o.toArray(opn, k * 3);
      }
    }
    for (const n of wallNames) wg.getAttribute(n).needsUpdate = true;
    wg.morphAttributes.position[0].needsUpdate = true;
  };
  const fillRiver = () => {
    const pos = rg.getAttribute('position').array as Float32Array, uv = rg.getAttribute('uv').array as Float32Array;
    const lat = rg.getAttribute('aRivLat').array as Float32Array, A = rg.getAttribute('aRivA').array as Float32Array;
    const B = rg.getAttribute('aRivB').array as Float32Array, ext = rg.getAttribute('fgExtra').array as Float32Array;
    const opn = rg.morphAttributes.position[0].array as Float32Array;
    const bank = 3, per = a.cols + 1 + 2 * bank, ch = a.lay.chord;
    for (let i = 0; i <= a.riverSteps; i++) {
      // the far river starts AT the seam: before it the real ribbon carries the course
      const Z = rowZ(i, a.riverSteps, zs), z = zOf(Z), sReal = sF + z;
      const fr = ft.path.frame(sReal);
      tubeCenterAt(ft.path, sReal, cr);
      const rr = ft.path.radius(sReal);
      const r = rowAt(Z);
      // lift to the real river where the seam has slid (the real ribbon starts climbing toward 06 there): 0 at zs = 0
      const lift = zs > 0 ? a.riverUp(Math.min(Z, zs)) - a.riverUp(0) : 0;
      const e0 = Math.max(-ch + 0.05, r.xB - r.hw), e1 = Math.min(ch - 0.05, r.xB + r.hw);
      const vv = sF + ft.uOfZ(Z);
      for (let j = 0; j < per; j++) {
        let x: number, h: number;
        if (j < bank) { const f = j / bank; x = -ch + (e0 + ch) * f; h = EDGE_LIFT + 0.1 * Math.sin(Math.PI * f); }
        else if (j > bank + a.cols) { const f = (j - bank - a.cols) / bank; x = e1 + (ch - e1) * f; h = EDGE_LIFT + 0.1 * Math.sin(Math.PI * f); }
        else {
          const f = (j - bank) / a.cols; x = e0 + (e1 - e0) * f;
          const u = Math.min(1, Math.abs(x - r.xB) / Math.max(0.5, r.hw));
          h = EDGE_LIFT * u * u * u;
        }
        o.copy(Rt).multiplyScalar(x).addScaledVector(U, a.level + h + lift);
        point(Z, o, p);
        const k = i * per + j;
        p.toArray(pos, k * 3);
        uv[k * 2] = (x + ch) / (2 * ch); uv[k * 2 + 1] = vv;
        lat[k] = x;
        A[k * 4] = r.xB; A[k * 4 + 1] = r.hw; A[k * 4 + 2] = r.cL; A[k * 4 + 3] = r.cR;
        B[k * 4] = r.wL; B[k * 4 + 1] = r.wR; B[k * 4 + 2] = r.core; B[k * 4 + 3] = Z;
        ext[k] = Z - z;
        o.copy(cr).addScaledVector(fr.right, x * (rr / R)).addScaledVector(fr.up, -rr - 0.6);
        o.toArray(opn, k * 3);
      }
    }
    for (const n of rivNames) rg.getAttribute(n).needsUpdate = true;
    rg.morphAttributes.position[0].needsUpdate = true;
  };
  const m = new THREE.Matrix4(), A4 = new THREE.Matrix4(), S4 = new THREE.Matrix4();
  const place = (mesh: THREE.InstancedMesh, items: Item[], open: number) => {
    const ext = mesh.geometry.getAttribute('fgExtra') as THREE.InstancedBufferAttribute | undefined;
    items.forEach((it, i) => {
      const Z = ft.zOfU(it.u);
      const k = THREE.MathUtils.lerp(kOf(Z), it.openScale, open);
      const c = THREE.MathUtils.lerp(cOf(Z), 1, open);
      point(Z, it.o, p).lerp(it.openPos, open);
      A4.set(
        k + (c - k) * T.x * T.x, (c - k) * T.x * T.y, (c - k) * T.x * T.z, 0,
        (c - k) * T.y * T.x, k + (c - k) * T.y * T.y, (c - k) * T.y * T.z, 0,
        (c - k) * T.z * T.x, (c - k) * T.z * T.y, k + (c - k) * T.z * T.z, 0,
        0, 0, 0, 1,
      );
      m.copy(A4).multiply(it.basis).multiply(S4.makeScale(it.s.x, it.s.y, it.s.z)).setPosition(p);
      mesh.setMatrixAt(i, m);
      ext?.setX(i, (Z - zOf(Z)) * (1 - open));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (ext) ext.needsUpdate = true;
  };

  let lastEye = new THREE.Vector3(Infinity, 0, 0), live = true, open = 0;
  const eye = new THREE.Vector3();
  return (cam: THREE.Camera) => {
    eye.setFromMatrixPosition(cam.matrixWorld);
    if (eye.distanceToSquared(lastEye) < 1e-10) return;
    lastEye.copy(eye);
    const atLock = eye.distanceTo(eyeLock) < 2e-3;
    D0 = Math.max(0.5, c0.clone().sub(eye).dot(T));
    q.copy(eye).sub(c0).addScaledVector(T, c0.clone().sub(eye).dot(T));
    zs = Math.min(a.zCap, Math.max(0, D0lock - D0));
    if (zs < 1e-6) zs = 0;
    open = 1 - THREE.MathUtils.smoothstep(D0 + zs, a.foldNear, a.foldFar);
    if (atLock) {
      // the locked checkpoint eye: the build-time geometry (bit-identical locked view)
      if (live) { restore(); live = false; }
      D0 = D0lock; q.copy(ft.q); zs = 0; open = 0;
      ft.placeInstances(a.farRings, a.ringItems, 0);
      ft.placeInstances(a.farLids, a.lidItems, 0);
    } else {
      fillWall(); fillRiver();
      a.glow.position.copy(point(a.zEnd, o.set(0, 0, 0), p));
      a.glow.scale.setScalar(R * kOf(a.zEnd) * 1.35);
      live = true;
      place(a.farRings, a.ringItems, open);
      place(a.farLids, a.lidItems, open);
    }
    // foam behind the seam (the rising 06 banks) is clipped while the block is live (src/vfx/clip05.ts)
    if (atLock || open > 0.5) clip05.uClip05N.value.set(0, 0, 0);
    else { clip05.uClip05P.value.copy(c0).addScaledVector(T, zs); clip05.uClip05N.value.copy(T); }
    // `&m05seam=1` (Screen 05 round 8): the seam's course position for the near river's design hand-over (waterRibbon.ts)
    m05seam.value.set(sF + zs, atLock || open > 0.5 ? 0 : 1);
    a.farWall.morphTargetInfluences![0] = open;
    a.farRiver.morphTargetInfluences![0] = open;
    a.glowMat.uniforms.uOpacity.value = 1 - open;
  };
}
