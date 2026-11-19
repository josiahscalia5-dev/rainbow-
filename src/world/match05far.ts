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
import type { Course, CourseSample } from './course';
import { EDGE_LIFT, M05BLEND, M05JOIN, M05LIDF, M05WCRISP, MATCH05, ampAt, flag05, m05blend, m05blendTime, m05eye, m05fw, m05join, m05seam } from '../vfx/waterRibbon';
import { clip05, m05rideS } from '../vfx/clip05';
import type { FarLump05 } from '../vfx/foam';

export const M05FAR: boolean = MATCH05 && flag05('m05far');
/**
 * `&m05end=1` (Screen 05 round 11, needs m05far): the last part of the stage (t ≈ 0.88 … 0.96, Benny ≈ 182 … 186.5)
 * stays inside the painted 05 tunnel. The far block folded away while the eye was still 10 … 6.5 u from its capped
 * seam (s ≈ 186.5), so for the last ≈ 5 u of the stage the camera looked into the old generic 06 hall (white foam
 * walls, flat pink) instead of the 05 rings / slotted walls / S-river. Now it folds only once Benny reaches the seam
 * (eye → seam 6.8 … 5.2 u: Benny ≈ 187.6 … 189, done as Benny enters 06): until then the same world-anchored 05 block (rings, walls, far river,
 * warm throat) continues ahead — faithful continuation of the painted tunnel, nothing new. Geometry, course and the
 * 06 look unchanged; the locked view never uses this (block at its build-time geometry there).
 */
export const M05END: boolean = M05FAR && flag05('m05end');
/**
 * `&m05trans=1` (Screen 05 round 15, needs m05end; qa/match/05/r15/PROGRESS.md step 1): the 05 -> 06 hand-over. With m05end
 * the far block folded while Benny rode the last ≈ 1.3 u of 05 (eye → seam 6.8 … 5.2 u): its rings flew from the
 * compressed tunnel to their real places as small copper hoops floating over the rising 06 crest, its wall swelled into a
 * smeared stack round a flat pink disc (the 06 floor sheet seen through it) and a straight line crossed the water under
 * Benny (t97 / t98). Now the block stays whole — the painted 05 tunnel, gold rings, far river and warm throat — through
 * the whole of 05 and is removed in one step as Benny crosses into 06 (Benny's course position, `m05rideS`), the moment
 * the HUD title turns to 06. From there on everything is exactly as before (the block was already fully folded at the
 * first metres of 06 under m05end), so 06 itself is unchanged. Safety: it still folds if the eye ever comes within
 * 1 u of the seam. Locked view: untouched (atLock path).
 */
export const M05TRANS: boolean = M05END && flag05('m05trans');
/**
 * `&m05fcoin=1` (Screen 05 round 12, needs m05far; src/gameplay/coins.ts): coin LOOK only. Past the far seam the real
 * course climbs away toward 06 while the far block shows the painted 05 river running on into the throat, so the next
 * coins (06) floated over the far block's left wall (t90 / t95). While the block is live, a coin past the seam is drawn
 * where the far block shows that stretch of river: on the far river's cyan core at virtual depth Z = s − sF, scaled like
 * the block (kOf), facing down the tunnel; as the block folds into 06 it moves back to its real place. Positions,
 * pickups, count and score unchanged. `far05Coins` is written by the live sync below.
 */
export const M05FCOIN: boolean = M05FAR && flag05('m05fcoin');
export const far05Coins = {
  /** 1 while the far block is live (not at the locked eye, not fully folded) */
  live: 0,
  /** course s of the sliding seam */
  seamS: 0,
  /** fold factor 0 … 1 */
  open: 1,
  /** `&m05trans=1` (round 16): Benny's course position at which the block is removed (coins.ts: no far look from there) */
  popS: Infinity,
  /** tunnel axis (coins face down it) */
  T: new THREE.Vector3(0, 0, 1),
  /** visual place of a coin at course s, lateral offset dl from the core, height h above the water: writes `out`,
   *  returns the block's scale there (0 = beyond the throat) */
  map: null as null | ((s: number, dl: number, h: number, out: THREE.Vector3) => number),
};

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
  /** `&m05trans=1` (round 15): the course position (06 start) where the block is removed in one step */
  popS?: number;
  /** the real course's height above the axis at real distance z beyond sF05 (the far water meets it at the seam) */
  riverUp: (z: number) => number;
  /** `&m05blend=1` (round 9): the real course (the far river's first rows are laid onto the ribbon's surface at the seam) */
  course?: Course;
  /** `&m05fcloud=1` (round 12): foam-cloud lumps along both far banks (src/vfx/foam.ts createFarCloud05) */
  clouds?: { mesh: THREE.InstancedMesh; lumps: FarLump05[] };
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
  if (M05JOIN) {
    // `&m05join=1` (Screen 05 round 13, waterRibbon.ts M05JOIN): the far layout by virtual depth for the near ribbon's
    // blend band before the seam (the seam never passes zCap) — float, read with manual interpolation (nearest)
    const NJ = 512, zMax = a.zCap + 1;
    const dj = new Float32Array(NJ * 2 * 4);
    for (let n = 0; n < NJ; n++) {
      const Z = (n / (NJ - 1)) * zMax, r = rowAt(Z);
      dj.set([r.xB, r.hw, r.cL, r.wL, r.cR, r.wR, r.core, ft.uOfZ(Z)], n * 8);
    }
    const tj = new THREE.DataTexture(dj, 2, NJ, THREE.RGBAFormat, THREE.FloatType);
    tj.minFilter = tj.magFilter = THREE.NearestFilter;
    tj.generateMipmaps = false;
    tj.needsUpdate = true;
    m05join.uJnLay.value = tj;
    m05join.uJnP.value.set(sF, zMax, NJ, 0);
  }

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
  m05eye.value.set(eyeLock.x, eyeLock.y, eyeLock.z, 1);   // `&m05wall=1` (round 9): crisp walls only away from this eye
  if (M05WCRISP || M05LIDF) {
    // `&m05wcrisp=1` (round 18): the far wall's exact tunnel coordinate per pixel (src/vfx/proj05Tunnel.ts)
    // `&m05lidf=1` (round 18): the locked eye's seam depth and axis offset (the far paddles' locked compression)
    m05fw.uM05FwD.value.x = D0lock; m05fw.uM05FwQL.value.copy(ft.q);
    m05fw.uM05FwC.value.copy(c0); m05fw.uM05FwT.value.copy(T);
    const kn = ft.knots.length >= 2 ? ft.knots : [[0, 0], [1, 1]] as [number, number][];
    m05fw.uM05FwK.value.forEach((v, i) => {
      if (i < kn.length) { v.set(kn[i][0], kn[i][1]); return; }
      // past the last knot: continue its slope (ForcedTunnel.interp extrapolates the last segment)
      const a = kn[kn.length - 2], b = kn[kn.length - 1], du = (i - kn.length + 1) * 1e4;
      v.set(b[0] + du, b[1] + du * (b[1] - a[1]) / (b[0] - a[0]));
    });
  }
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
  // `&m05blend=1` (round 9): the far river's first rows are laid onto the near ribbon's surface (course frame + trough +
  // the ribbon's own vertex wave) so the two surfaces meet without a step at the seam (measured at t66 before: the far
  // row stood 0.36 u above the ribbon on the left and 0.31 u below it on the right — the course banks there, the far
  // river is level in the tunnel frame)
  const HB = 3;
  const cs: CourseSample = { s: 0, pos: new THREE.Vector3(), tan: new THREE.Vector3(), up: new THREE.Vector3(), right: new THREE.Vector3() };
  const tq = new THREE.Vector3();
  const onRibbon = (P: THREE.Vector3, sGuess: number, w: number) => {
    const course = a.course!;
    let sR = sGuess;
    for (let it = 0; it < 3; it++) { course.sample(sR, cs); sR += tq.copy(P).sub(cs.pos).dot(cs.tan); }
    course.sample(sR, cs);
    const hwR = course.widthAt(sR) / 2;
    const lat = tq.copy(P).sub(cs.pos).dot(cs.right);
    const uu = Math.min(1, Math.abs(lat) / hwR);
    const t = (m05blendTime.u?.value as number | undefined) ?? 0, uS = Math.max(-1, Math.min(1, lat / hwR));
    const hR = EDGE_LIFT * uu * uu * uu + ampAt(course, sR) * (0.6 * Math.sin(sR * 0.9 - t * 2.4 + uS * 1.7) + 0.4 * Math.sin(sR * 0.41 + t * 1.5 - uS * 2.3));
    tq.copy(cs.pos).addScaledVector(cs.right, lat).addScaledVector(cs.up, hR).sub(P);
    // outside the ribbon (its skirt drops away) the far bank keeps its own height
    const wl = w * (1 - THREE.MathUtils.smoothstep(Math.abs(lat), hwR, hwR + 0.8));
    P.addScaledVector(U, tq.dot(U) * wl);
  };
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
        if (M05BLEND && a.course && zs > 0 && Z < zs + HB) onRibbon(p, sReal, 1 - THREE.MathUtils.smoothstep(Z, zs, zs + HB));
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
  // `&m05fcloud=1` (Screen 05 round 12): far-bank foam clouds on the far layout's water edge, anchored to the virtual
  // tunnel, compressed like the block, only where the block is live and its baked picture magnified (as m05fmag)
  const cm = new THREE.Matrix4(), cp = new THREE.Vector3(), co = new THREE.Vector3();
  // `&m05fcoin=1` (Screen 05 round 12): a coin's visual place on the far river's core (see M05FCOIN)
  const fco = new THREE.Vector3();
  if (M05FCOIN) {
    if (M05TRANS && a.popS !== undefined) far05Coins.popS = a.popS;
    far05Coins.map = (s: number, dl: number, h: number, out: THREE.Vector3) => {
      const Z = s - sF;
      if (Z > a.zEnd * 0.98) return 0;
      const r = rowAt(Z);
      const lift0 = zs > 0 ? a.riverUp(Math.min(Z, zs)) - a.riverUp(0) : 0;
      fco.copy(Rt).multiplyScalar(THREE.MathUtils.clamp(r.core + dl, r.cL, r.cR)).addScaledVector(U, a.level + lift0 + h);
      point(Z, fco, out);
      return kOf(Z);
    };
  }
  const placeClouds = (show: boolean) => {
    const c = a.clouds;
    if (!c) return;
    c.mesh.visible = show;
    if (!show) return;
    const lift0 = zs > 0 ? a.riverUp(zs) - a.riverUp(0) : 0;
    const ch = a.lay.chord - 0.1;
    c.lumps.forEach((l, i) => {
      let sc = 0;
      if (l.Z > zs + 0.02) {
        const r = rowAt(l.Z);
        const x = THREE.MathUtils.clamp(l.side < 0 ? r.xB - r.hw - l.e : r.xB + r.hw + l.e, -ch, ch);
        co.copy(Rt).multiplyScalar(x).addScaledVector(U, a.level + EDGE_LIFT + lift0 + l.lift);
        point(l.Z, co, cp);
        const mag = (D0lock + l.Z) / Math.max(cp.distanceTo(eye), 0.5);
        sc = l.r * kOf(l.Z) * THREE.MathUtils.smoothstep(mag, 1.4, 2.2) * THREE.MathUtils.smoothstep(l.Z, zs, zs + 0.6) * (1 - open);
      }
      c.mesh.setMatrixAt(i, cm.makeScale(sc, sc, sc).setPosition(cp));
    });
    c.mesh.instanceMatrix.needsUpdate = true;
  };
  return (cam: THREE.Camera) => {
    eye.setFromMatrixPosition(cam.matrixWorld);
    if (eye.distanceToSquared(lastEye) < 1e-10) return;
    lastEye.copy(eye);
    const atLock = eye.distanceTo(eyeLock) < 2e-3;
    D0 = Math.max(0.5, c0.clone().sub(eye).dot(T));
    q.copy(eye).sub(c0).addScaledVector(T, c0.clone().sub(eye).dot(T));
    zs = Math.min(a.zCap, Math.max(0, D0lock - D0));
    if (zs < 1e-6) zs = 0;
    // m05end (r11): the TRUE eye → seam distance (D0 is clamped at 0.5 u once the eye passes sF, so D0 + zs never fell
    // under 0.5 + zCap ≈ 7 u and the block could not fold inside a window nearer than that)
    open = 1 - THREE.MathUtils.smoothstep(M05END ? c0.clone().sub(eye).dot(T) + zs : D0 + zs, a.foldNear, a.foldFar);
    // m05trans (r15): whole until Benny enters 06, then gone in one step (no half-folded frames)
    if (M05TRANS && a.popS !== undefined) open = Math.max(m05rideS.value >= a.popS ? 1 : 0, open);
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
    placeClouds(!atLock && open < 0.999);
    if (M05FCOIN) {
      far05Coins.live = !atLock && open < 0.999 ? 1 : 0;
      far05Coins.seamS = sF + zs;
      far05Coins.open = open;
      far05Coins.T.copy(T);
    }
    // foam behind the seam (the rising 06 banks) is clipped while the block is live (src/vfx/clip05.ts)
    if (M05WCRISP || M05LIDF) {
      m05fw.uM05FwP.value.set(zs, L, sF, atLock || open > 0.5 ? 0 : 1);
      m05fw.uM05FwD.value.y = D0; m05fw.uM05FwQ.value.copy(q);
    }
    if (atLock || open > 0.5) clip05.uClip05N.value.set(0, 0, 0);
    else { clip05.uClip05P.value.copy(c0).addScaledVector(T, zs); clip05.uClip05N.value.copy(T); }
    // `&m05seam=1` (Screen 05 round 8): the seam's course position for the near river's design hand-over (waterRibbon.ts)
    m05seam.value.set(sF + zs, atLock || open > 0.5 ? 0 : 1);
    if (M05BLEND) {
      // `&m05blend=1` (Screen 05 round 9): the near ribbon fades into the far river's picture over a band before the
      // seam (waterRibbon.ts M05BLEND). Band ≈ a quarter of the eye → seam distance (2.5–8 u), never before sF (F has no
      // rows there); off at the locked eye and while folding
      m05blend.uFbC0.value.copy(c0); m05blend.uFbT.value.copy(T); m05blend.uFbRt.value.copy(Rt);
      const band = Math.min(zs, THREE.MathUtils.clamp(0.25 * (D0 + zs), 2.5, 8));
      m05blend.uFbP.value.set(zs, band, a.lay.chord, atLock || open > 0.5 ? 0 : 1);
    }
    a.farWall.morphTargetInfluences![0] = open;
    a.farRiver.morphTargetInfluences![0] = open;
    a.glowMat.uniforms.uOpacity.value = 1 - open;
  };
}
