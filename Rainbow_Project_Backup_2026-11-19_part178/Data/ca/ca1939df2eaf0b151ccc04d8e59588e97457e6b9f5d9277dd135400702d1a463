/**
 * Screen 05 far section (path-camera-transition-engineer, wave 8): helpers for the forced-perspective far tunnel
 * built in environment.ts (`// ---- 05 far tunnel`). Everything here is laid in the ForcedTunnel's VIRTUAL
 * straight tunnel (depth Z beyond the section start sF, offset o in the cross-section) and mapped to real
 * geometry with ft.point(), so it continues the real near/mid tunnel without a seam at the locked 05 eye.
 *
 * FAR RIVER (ref 05, approved image): beyond the seam the river keeps winding: the cyan core with its two
 * hot-pink bands swings RIGHT (core ≈ x 530–547 at y 538–526, ≈ 535 at y 508) and then back LEFT into the
 * vanishing point (≈ 505 at y 496, ≈ 490 at y 490). The live far chord ran straight into the VP (06-style
 * candy stripes). The layout model here is the real ribbon's own (waterRibbon.ts, 05 block): route centre
 * xB, half width hw = extent − |xB|, core swing M = CORE_SWING·xB, band offsets 0.62·hw / widths 0.19·hw with
 * the same smooth clamps against the banks. For the first few virtual units it follows the REAL course
 * (s = sF + axial), so the far surface lands exactly on the real ribbon at the seam and covers the real
 * ribbon's continuation behind it; then it blends into a designed path fitted to the reference.
 */
import * as THREE from 'three';
import type { Course } from './course';
import type { ForcedTunnel } from './tube';
import { tubeCenterAt } from './tube';
import { coreLateral, CORE_SWING, EDGE_LIFT } from '../vfx/waterRibbon';

/** QA only: the far block publishes its tunnel + river path here (read by qa scripts via dynamic import) */
export const far05Debug: Record<string, unknown> = {};

/** S05.extent (course.ts): half extent |offset| + half width of the 05 stream (outer bank of each bend) */
const EXTENT05 = 6.0;

/**
 * Designed far path: route-centre lateral xB (units along ft.Rt, + = right) at virtual depth Z beyond the seam.
 * The visible cyan core sits at (1 + CORE_SWING)·xB. Fitted to the reference core centres back-projected through
 * the locked 05 eye (f 1278 px, VP (500,479), eye 3.56 u above the far water plane):
 * y 538 → x 530 (Z≈24), 532 → 542 (Z≈32), 526 → 547 (Z≈43), 511 → 537 (Z≈88), 505 → 534 (Z≈121),
 * then back left: 496 → ≈505 (Z≈215), 490 → ≈490 (Z≈330). The first knots continue the real exit bend
 * (route lateral ≈0.3 at Z≈6) straight into the right swing (the reference's dip to the left at y≈550 sits where
 * the locked course has its exit bend, so it is not chased: that would add a wiggle at the seam).
 */
export const FAR05_PATH: [number, number][] = [
  [6, 0.3], [12, 0.42], [17, 0.58], [24, 0.95], [32, 1.45], [43, 1.85], [60, 2.05], [90, 2.25], [125, 2.35],
  [160, 1.75], [215, 0.55], [280, -0.75], [330, -1.3], [400, -1.5],
];

function smoothstep(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
/** same smooth minimum as the ribbon shader */
function smin(a: number, b: number, k: number) {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
}
/** C¹ monotone-free cubic Hermite through knots (Catmull-Rom tangents, flat ends) */
function hermite(k: [number, number][], x: number) {
  const n = k.length;
  if (x <= k[0][0]) return k[0][1];
  if (x >= k[n - 1][0]) return k[n - 1][1];
  let i = 0;
  while (x > k[i + 1][0]) i++;
  const tan = (j: number) => (j === 0 || j === n - 1 ? 0 : (k[j + 1][1] - k[j - 1][1]) / (k[j + 1][0] - k[j - 1][0]));
  const [x0, p0] = k[i], [x1, p1] = k[i + 1];
  const h = x1 - x0, t = (x - x0) / h, t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * h * tan(i) + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * h * tan(i + 1);
}

/** one row of the river layout, all laterals in units from the tunnel axis along ft.Rt */
export interface FarRiverRow {
  /** route (water body) centre */
  xB: number;
  /** water body half width */
  hw: number;
  /** left / right pink band centre and half width */
  cL: number; wL: number; cR: number; wR: number;
  /** visible cyan core centre (between the bands) — flow lines and the far coins follow it */
  core: number;
}

/**
 * The real 05 ribbon's band layout (waterRibbon.ts FRAG, 05 block with sw = 1, freeK = 0, Benny far away,
 * time-dependent wobble/noise left out) for a route centre xB, half width hw, core swing M (from the route
 * centre) and band S offset sb, at arc length s (only feeds the slow sin() modulations).
 */
export function bandLayout(xB: number, hw: number, M: number, sb: number, s: number): FarRiverRow {
  const Mb = M + sb;
  let offL = hw * (0.62 + 0.03 * Math.sin(s * 0.13 + 1.7));
  let offR = hw * (0.62 + 0.03 * Math.sin(s * 0.11 + 4.2));
  let wL = hw * 0.19 * (1 + 0.15 * Math.sin(s * 0.19 + 0.4));
  let wR = hw * 0.19 * (1 + 0.15 * Math.sin(s * 0.17 + 2.9));
  const roomL = Mb + hw - 0.5 - offL, roomR = hw - 0.5 - Mb - offR;
  wL = smin(wL, Math.max(roomL, 0.6 * wL), 0.5);
  wR = smin(wR, Math.max(roomR, 0.6 * wR), 0.5);
  offL = smin(offL, Mb + hw - wL - 0.5, 1.2);
  offR = smin(offR, hw - wR - 0.5 - Mb, 1.2);
  const cL = xB + Mb - offL, cR = xB + Mb + offR;
  return { xB, hw, cL, wL, cR, wR, core: 0.5 * (cL + wL + cR - wR) };
}

/** the ribbon shader's 05 band S (sbend) */
const sbend05 = (s: number) => 1.05 * Math.sin(s * 0.31 - 0.834) + 0.18 * Math.sin(s * 0.62 + 0.6);

export interface FarRiverLayout {
  row(Z: number): FarRiverRow;
  /** lateral of the far coin trail (= the real coins' rule: centre + latK·M) */
  coinLat(Z: number, latK: number): number;
  /** half chord of the tube floor at the water level */
  chord: number;
}

/**
 * Layout of the far river at virtual depth Z. For Z ≲ 6 it is the REAL ribbon at the arc length s whose route
 * point lies Z units beyond the seam along the axis (what the eye would see there without the far section);
 * it blends (Z 3 → 12) into the designed FAR05_PATH, where the core swing is CORE_SWING·xB and the band S is off.
 */
export function farRiverLayout(course: Course, ft: ForcedTunnel, level: number): FarRiverLayout {
  const rel = new THREE.Vector3();
  const sample = (s: number) => {
    const f = course.sample(s);
    rel.copy(f.pos).sub(ft.c0);
    return { ax: rel.dot(ft.T), lat: rel.dot(ft.Rt), rx: f.right.dot(ft.Rt) };
  };
  // arc length of the route point at axial distance Z beyond the seam (monotone over the short join)
  const sOfAx = (Z: number) => {
    let a = ft.sF - 4, b = ft.sF + 14;
    for (let i = 0; i < 40; i++) { const m = 0.5 * (a + b); if (sample(m).ax < Z) a = m; else b = m; }
    return 0.5 * (a + b);
  };
  const realRow = (Z: number) => {
    const s = sOfAx(Z);
    const p = sample(s);
    const hw = course.widthAt(s) / 2;
    const M = coreLateral(course, s) * p.rx;
    return { s, xB: p.lat, hw, M, sb: sbend05(s) };
  };
  const designRow = (Z: number) => {
    const xB = hermite(FAR05_PATH, Z);
    return { s: ft.sF + Z, xB, hw: EXTENT05 - Math.sqrt(xB * xB + 0.09), M: CORE_SWING * xB, sb: 0 };
  };
  const mixRow = (Z: number) => {
    const w = smoothstep(3, 12, Z);
    if (w <= 0) return realRow(Z);
    const d = designRow(Z);
    if (w >= 1) return d;
    const r = realRow(Math.min(Z, 12));
    const L = (a: number, b: number) => a + (b - a) * w;
    return { s: L(r.s, d.s), xB: L(r.xB, d.xB), hw: L(r.hw, d.hw), M: L(r.M, d.M), sb: L(r.sb, d.sb) };
  };
  const chord = Math.sqrt(Math.max(0, ft.R * ft.R - level * level)) * 0.995;
  return {
    chord,
    row(Z) { const r = mixRow(Z); return bandLayout(r.xB, r.hw, r.M, r.sb, r.s); },
    coinLat(Z, latK) { const r = mixRow(Z); return r.xB + latK * r.M; },
  };
}

/**
 * The far river surface in the virtual tunnel: one row per screen step (uniform in 1/depth, like the far wall),
 * spanning the whole tube floor chord at `level` so it covers the real ribbon's continuation behind the seam.
 * Columns: 3 over each bank, `cols` over the water body (whose centre/width change per row); the body has the
 * ribbon's trough profile (EDGE_LIFT·|u|³) so it lands on the real ribbon at the seam, the banks sit a little
 * higher (foam rims). Attributes for farRiverMaterial: aRivLat (lateral, units from the axis), aRivA (xB, hw,
 * cL, cR), aRivB (wL, wR, core, Z), fgExtra (virtual − real depth). Morph "open": dropped below the real tube
 * bottom (as the old chord), so the ride into 06 is untouched.
 */
export function farRiverGeometry(ft: ForcedTunnel, lay: FarRiverLayout, level: number, cols = 16, steps = 120): THREE.BufferGeometry {
  const bank = 3;
  const per = cols + 1 + 2 * bank;
  const rows = steps + 1;
  const n = rows * per;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
  const lat = new Float32Array(n), A = new Float32Array(n * 4), B = new Float32Array(n * 4), ext = new Float32Array(n), opn = new Float32Array(n * 3);
  const o = new THREE.Vector3(), p = new THREE.Vector3(), cr = new THREE.Vector3();
  const ch = lay.chord;
  for (let i = 0; i < rows; i++) {
    const t = i / steps;
    const Dv = 1 / (1 / ft.D0 - t * (1 / ft.D0 - 1 / (ft.D0 + ft.zEnd)));
    const Z = Math.max(0, Dv - ft.D0);
    const z = ft.zOf(Z);
    const sReal = ft.sF + z;
    const fr = ft.path.frame(sReal);
    tubeCenterAt(ft.path, sReal, cr);
    const rr = ft.path.radius(sReal);
    const r = lay.row(Z);
    const e0 = Math.max(-ch + 0.05, r.xB - r.hw), e1 = Math.min(ch - 0.05, r.xB + r.hw);
    for (let j = 0; j < per; j++) {
      let x: number, h: number;
      if (j < bank) { const f = j / bank; x = -ch + (e0 + ch) * f; h = EDGE_LIFT + 0.1 * Math.sin(Math.PI * f); }
      else if (j > bank + cols) { const f = (j - bank - cols) / bank; x = e1 + (ch - e1) * f; h = EDGE_LIFT + 0.1 * Math.sin(Math.PI * f); }
      else {
        const f = (j - bank) / cols; x = e0 + (e1 - e0) * f;
        const u = Math.min(1, Math.abs(x - r.xB) / Math.max(0.5, r.hw));
        h = EDGE_LIFT * u * u * u;
      }
      o.copy(ft.Rt).multiplyScalar(x).addScaledVector(ft.U, level + h);
      ft.point(Z, o, p);
      const k = i * per + j;
      p.toArray(pos, k * 3);
      ft.U.toArray(nor, k * 3);
      uv[k * 2] = (x + ch) / (2 * ch); uv[k * 2 + 1] = ft.sF + ft.uOfZ(Z);
      lat[k] = x;
      A[k * 4] = r.xB; A[k * 4 + 1] = r.hw; A[k * 4 + 2] = r.cL; A[k * 4 + 3] = r.cR;
      B[k * 4] = r.wL; B[k * 4 + 1] = r.wR; B[k * 4 + 2] = r.core; B[k * 4 + 3] = Z;
      ext[k] = Z - z;
      o.copy(cr).addScaledVector(fr.right, x * (rr / ft.R)).addScaledVector(fr.up, -rr - 0.6);
      o.toArray(opn, k * 3);
    }
  }
  const idx: number[] = [];
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < per - 1; j++) {
      const a = i * per + j, b = a + per;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setAttribute('aRivLat', new THREE.BufferAttribute(lat, 1));
  g.setAttribute('aRivA', new THREE.BufferAttribute(A, 4));
  g.setAttribute('aRivB', new THREE.BufferAttribute(B, 4));
  g.setAttribute('fgExtra', new THREE.BufferAttribute(ext, 1));
  g.morphAttributes.position = [new THREE.BufferAttribute(opn, 3)];
  g.setIndex(idx);
  g.computeBoundingSphere();
  return g;
}
