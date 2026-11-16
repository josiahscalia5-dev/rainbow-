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
import { coreLateral, EDGE_LIFT } from '../vfx/waterRibbon';
import { C05, coinVisuals } from '../gameplay/coins';

/** QA only: the far block publishes its tunnel + river path here (read by qa scripts via dynamic import) */
export const far05Debug: Record<string, unknown> = {};

/** far water body: outer bank of each far bend (units from the axis; the floor chord is ≈6.53, foam rim outside) */
const EXTENT_FAR = 6.25;

/**
 * Designed far path: lateral of the VISIBLE cyan core (units along ft.Rt, + = right) at virtual depth Z beyond the
 * seam. Fitted to the reference core (between the two pink bands) back-projected through the locked 05 eye
 * (f 1278 px, VP (500,479), eye 3.56 u above the far water plane): y 538 → core x 506–553 (Z≈24), 532 → 525–560
 * (Z≈32), 526 → 529–565 (Z≈43), 511 → 513–561 (Z≈88), 508 → 518–555 (Z≈103), then back left into the VP:
 * coins/core ≈505 at y 496 (Z≈215), ≈490 at y 490 (Z≈330). The first knots continue the real exit bend
 * (route lateral ≈0.3 at Z≈6) straight into the right swing (the reference's dip to the left at y≈550 sits where
 * the locked course has its exit bend, so it is not chased: that would add a wiggle at the seam).
 */
export const FAR05_CORE: [number, number][] = [
  [8, 0.55], [12, 0.75], [17, 1.0], [24, 1.8], [32, 2.75], [43, 3.4], [60, 3.6], [88, 4.0], [110, 4.35], [140, 4.45],
  [175, 4.1], [212, 2.6], [260, 0.8], [310, -1.6], [350, -2.5], [400, -2.8],
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
  /** half chord of the tube floor at the water level */
  chord: number;
}

/**
 * Far design row for a water-body centre xB: the body hugs the outer wall of each bend (half width
 * EXTENT_FAR − |xB|); the two pink bands are thin lines near the banks (ref 05 far field: 3–10 px bands, the cyan
 * core fills the river), the inner-bank band sits a little further in.
 */
function designFromXB(xB: number, Z: number): FarRiverRow {
  const hw = EXTENT_FAR - Math.sqrt(xB * xB + 0.09);
  const bend = Math.min(1, Math.abs(xB) / 2.5);
  const aIn = 0.25 + 0.2 * bend, aOut = 0.25 - 0.08 * bend;
  const aL = xB >= 0 ? aIn : aOut, aR = xB >= 0 ? aOut : aIn;
  const w = Math.min(0.65, Math.max(0.26, 0.13 * hw)) * (1 - 0.35 * smoothstep(60, 200, Z));
  const cL = xB - hw * (1 - aL), cR = xB + hw * (1 - aR);
  return { xB, hw, cL, wL: w, cR, wR: w, core: 0.5 * (cL + cR) };
}

/**
 * Layout of the far river at virtual depth Z. For small Z it is the REAL ribbon exactly as the eye would see it
 * there without the far section: at the seam the route is in its exit bend (heading ≈26° off the axis), so a
 * screen row cuts the ribbon diagonally — each band centre / bank edge curve l(s) of the real ribbon is intersected
 * with the row (axial = Z), widths divided by cos(heading). It blends (Z 2 → 10) into the designed FAR05_CORE path.
 */
export function farRiverLayout(course: Course, ft: ForcedTunnel, level: number): FarRiverLayout {
  const q = new THREE.Vector3();
  const at = (s: number, l: number) => {
    const f = course.sample(s);
    q.copy(f.pos).addScaledVector(f.right, l).sub(ft.c0);
    return { ax: q.dot(ft.T), x: q.dot(ft.Rt), rx: f.right.dot(ft.Rt) };
  };
  // the real ribbon's band layout at s, relative to the route centre (ribbon frame, vCore = coreLateral)
  const relLay = (s: number) => bandLayout(0, course.widthAt(s) / 2, coreLateral(course, s), sbend05(s), s);
  const cross = (Z: number, lOf: (s: number) => number) => {
    let a = ft.sF - 8, b = ft.sF + 16;
    for (let i = 0; i < 36; i++) { const m = 0.5 * (a + b); if (at(m, lOf(m)).ax < Z) a = m; else b = m; }
    const s = 0.5 * (a + b), p = at(s, lOf(s));
    return { s, x: p.x, rx: Math.max(0.3, p.rx) };
  };
  const realRow = (Z: number): FarRiverRow => {
    const eL = cross(Z, (s) => -course.widthAt(s) / 2), eR = cross(Z, (s) => course.widthAt(s) / 2);
    const bl = cross(Z, (s) => relLay(s).cL), br = cross(Z, (s) => relLay(s).cR);
    const wL = relLay(bl.s).wL / bl.rx, wR = relLay(br.s).wR / br.rx;
    return { xB: 0.5 * (eL.x + eR.x), hw: 0.5 * (eR.x - eL.x), cL: bl.x, wL, cR: br.x, wR, core: 0.5 * (bl.x + wL + br.x - wR) };
  };
  const designRow = (Z: number): FarRiverRow => {
    const target = hermite(FAR05_CORE, Z);
    let a = -5, b = 5;
    for (let i = 0; i < 36; i++) { const m = 0.5 * (a + b); if (designFromXB(m, Z).core < target) a = m; else b = m; }
    return designFromXB(0.5 * (a + b), Z);
  };
  // wave 9: × the section's lateral stretch (05 oval) — the floor between the river and the wall foot is wider
  const chord = Math.sqrt(Math.max(0, ft.R * ft.R - level * level)) * 0.995 * ft.aspect;
  return {
    chord,
    row(Z) {
      const w = smoothstep(2, 10, Z);
      if (w <= 0) return realRow(Z);
      const d = designRow(Z);
      if (w >= 1) return d;
      const r = realRow(Math.min(Z, 8));
      const o = {} as FarRiverRow;
      for (const k of Object.keys(d) as (keyof FarRiverRow)[]) o[k] = r[k] + (d[k] - r[k]) * w;
      return o;
    },
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
/**
 * wave 9: width (units) of the foam bank along each far river edge at virtual depth Z (foam-bubbles-particles 03:20:
 * a low band hugging each edge, lumps sunk into the bank; ref far banks ≈ 2–3 u, narrower at the seam where the
 * real foam rims end). Beyond it the fragment is dropped and the far section's wall / bank floor shows (as in the ref).
 */
export const farFoamWidth = (Z: number) => 1.1 + 1.9 * smoothstep(1, 18, Z);
/** height of the foam bank's crest above the far water level (rounded lumpy bank, ≈0.6 × lump radius high) */
const FOAM_CREST = 0.55;

/**
 * wave 9: bank floor of the far (oval) section — level `floorY` (the near 05 bank floor, environment floor05) at the
 * seam; further in, beyond each foam bank's foot it slopes up toward the wall, so the slotted wall runs down to the
 * foam as in ref 05 (instead of a flat pale platform between foam and wall). It must stay a floor (lifted, never the
 * open ellipse below): the forced section maps virtual heights above the real ones, so a lifted floor always hides
 * the real tube floor / ribbon past the seam.
 */
export function farFloor05(lay: FarRiverLayout, floorY: number, rise = 0.9, run = 2.2) {
  return (Z: number, x: number) => {
    const w = smoothstep(3, 16, Z);
    if (w <= 0) return floorY;
    const r = lay.row(Z), fw = farFoamWidth(Z);
    const b0 = r.xB - r.hw - fw * 0.85, b1 = r.xB + r.hw + fw * 0.85;
    const d = x < b0 ? b0 - x : x > b1 ? x - b1 : 0;
    // a low ramp (never a tall slab: the far rings' lower arcs and the lids must stay visible)
    return floorY + w * rise * smoothstep(0, run, d);
  };
}

export function farRiverGeometry(ft: ForcedTunnel, lay: FarRiverLayout, level: number, cols = 16, steps = 120): THREE.BufferGeometry {
  // columns: floor (2) · foam bank (bank) · water (cols) · foam bank · floor (2)
  const bank = 6, flr = 2;
  const per = cols + 1 + 2 * (bank + flr);
  const rows = steps + 1;
  const n = rows * per;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
  const lat = new Float32Array(n), A = new Float32Array(n * 4), B = new Float32Array(n * 4), ext = new Float32Array(n), opn = new Float32Array(n * 3);
  const fwA = new Float32Array(n);
  const o = new THREE.Vector3(), p = new THREE.Vector3(), cr = new THREE.Vector3();
  const ch = lay.chord;
  // rounded bank: waterline at the ribbon's edge height, crest ≈40 % out, foot just above the bank floor
  const bankH = (f: number) => EDGE_LIFT * (1 - f) + FOAM_CREST * Math.sin(Math.PI * Math.pow(f, 0.8)) - 0.12 * f * f;
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
    const fw = farFoamWidth(Z);
    const e0 = Math.max(-ch + 0.05, r.xB - r.hw), e1 = Math.min(ch - 0.05, r.xB + r.hw);
    const b0 = Math.max(-ch + 0.02, e0 - fw), b1 = Math.min(ch - 0.02, e1 + fw);
    for (let j = 0; j < per; j++) {
      let x: number, h: number;
      const jw = j - flr - bank; // water column index
      if (j < flr) { x = -ch + (b0 + ch) * (j / flr); h = -0.12; }
      else if (jw < 0) { const f = -jw / bank; x = e0 + (b0 - e0) * f; h = bankH(f); }
      else if (jw <= cols) {
        const f = jw / cols; x = e0 + (e1 - e0) * f;
        const u = Math.min(1, Math.abs(x - r.xB) / Math.max(0.5, r.hw));
        h = EDGE_LIFT * u * u * u;
      } else if (jw <= cols + bank) { const f = (jw - cols) / bank; x = e1 + (b1 - e1) * f; h = bankH(f); }
      else { const f = (jw - cols - bank) / flr; x = b1 + (ch - b1) * f; h = -0.12; }
      fwA[i * per + j] = fw;
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
  g.setAttribute('aRivF', new THREE.BufferAttribute(fwA, 1));
  g.morphAttributes.position = [new THREE.BufferAttribute(opn, 3)];
  g.setIndex(idx);
  g.computeBoundingSphere();
  return g;
}

/**
 * FAR COINS (wave 9). Ref 05 continues the coin trail along the winding core right into the light: past ref coin #2
 * (494, 531) come (518, 522) 16 px · (531, 516) 13 · (536, 507) 12 · (526, 498) 9 · (515, 493) 7 · (506, 489) 6 ·
 * (497, 486) 5. With the real coin height C05.h over the far water those rows are virtual depths D ≈ 70 / 82 / 108 /
 * 159 / 215 / 301 / 431, the x positions lie within ≈7 px of the far core (FAR05_CORE), so each far coin sits on the
 * far river's core at its depth. The ref draws the far coins a little larger than physical (×1 → ×1.5 by D ≈ 300).
 * Purely visual: same geometry/materials as the real coins (coinVisuals), placed through ft.matrix, never pickups.
 * They exist only while the far section is closed and shrink away (smoothly, ≤ 16 px on screen) while it opens
 * (rider camera 34 → 18 u before the seam), before the real tube beyond shows — no pop, never a double coin.
 * The real 05 trail ends with the seam coin (coins.ts, C05.seamAxisLat) just in front of the first far coin.
 */
export const FAR05_COIN_D = [70, 83, 106, 150, 205, 280, 370];

export function farCoins05(ft: ForcedTunnel, lay: FarRiverLayout, level: number) {
  const { geo, materials } = coinVisuals();
  const items = FAR05_COIN_D.map((D) => {
    const Z = D - ft.D0;
    const r = lay.row(Z);
    // the real coin pose (coins.ts place(): face toward the camera, leaning back by C05.tilt)
    const basis = new THREE.Matrix4().makeBasis(ft.Rt, ft.U, ft.T.clone().negate())
      .multiply(new THREE.Matrix4().makeRotationX(-C05.tilt));
    const k = C05.scale * (1 + 0.5 * smoothstep(90, 300, D));
    // water level − 0.04 = the real course water at the seam; the coin centre C05.h above it. Lateral: the real
    // trail's rule (C05.latK × core: inside the middle of the core) — lands within ≈5 px of every ref far coin
    const o = ft.Rt.clone().multiplyScalar(C05.latK * r.core).addScaledVector(ft.U, level - 0.04 + C05.h);
    return { Z, o, basis, s: new THREE.Vector3(k, k, k) };
  });
  const mesh = new THREE.InstancedMesh(geo, materials, items.length);
  mesh.name = 'coins05_far';
  mesh.frustumCulled = false;
  const m = new THREE.Matrix4(), sc = new THREE.Vector3();
  /** open: the far section's open state (0 closed … 1 folded away) */
  const place = (open: number) => {
    const fade = 1 - smoothstep(0, 0.45, open);
    mesh.visible = fade > 1e-3;
    if (!mesh.visible) return;
    items.forEach((it, i) => {
      // closed placement (open = 0): the forced-perspective mapping; only the size fades while it opens
      ft.matrix(it.Z, it.o, it.basis, sc.copy(it.s).multiplyScalar(fade), 0, it.o, 1, m);
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  place(0);
  Object.assign(far05Debug, { farCoins: items.map((it) => ({ Z: it.Z, o: it.o.toArray(), k: it.s.x })) });
  return { mesh, place };
}

/** far glow parameters (environment.ts glow05 shape) */
export interface FarRiverGlow { color: THREE.ColorRepresentation; near: number; far: number; strength: number }

/**
 * Far stream material (wave 9, path-camera; wave-8 version moved here from materials.ts, which is environment-owned).
 * Laid out per row by farRiverGeometry (aRivA/aRivB: route centre, half width, band centres/widths, core, Z; aRivF:
 * foam bank width). Unlit (small on screen), so the colours are the 05 ribbon's flat display colours
 * (RIVER05_PAL in waterRibbon.ts, solved through exposure → Neutral → grade):
 *  - cyan core lighter and streakier than wave 8 (ref far field cyan median #4DC2F9; live it01 #00A8FF), thin light
 *    flow lines that follow the winding core;
 *  - pink bands = water-fx SEAM LOOK: #BC16A8 on the bank side → #F73DEA → lighter #FA9EF2 toward the core;
 *  - foam banks = foam-bubbles-particles' far-rim look: white-lavender lit tops #FAF3FE, periwinkle body #ABB8FA,
 *    blue lower half / crevices #758FF7 → #6B65EA, bubble cells, scalloped outer edge — beyond it the fragment is
 *    dropped so the far wall / bank floor shows, as in the ref.
 * Warms into the VP glow with the virtual depth (`fgExtra`).
 */
export function farRiverMaterial05(glow: FarRiverGlow): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false });
  // wins the depth test against the real ribbon's continuation it covers just behind the seam
  mat.polygonOffset = true;
  mat.polygonOffsetFactor = -1;
  mat.polygonOffsetUnits = -2;
  const lin = (r: number, g: number, b: number) => new THREE.Color().setRGB(r, g, b, THREE.LinearSRGBColorSpace);
  const uniforms = {
    uRivCyanLo: { value: lin(0.05, 0.3, 0.82) },
    uRivCyan: { value: lin(0.14, 0.62, 1.25) },
    uRivCyanHi: { value: lin(0.5, 1.35, 2.0) },
    uRivPinkLo: { value: lin(0.36, 0.04, 0.3) },
    uRivPink: { value: lin(0.7, 0.08, 0.64) },
    uRivPinkHi: { value: lin(0.92, 0.3, 0.88) },
    uFoamTop: { value: lin(0.95, 0.9, 1.0) },
    uFoamPeri: { value: lin(0.45, 0.5, 0.95) },
    uFoamBlue: { value: lin(0.2, 0.28, 0.9) },
    uFoamDeep: { value: lin(0.15, 0.13, 0.75) },
    uRivGlow: { value: new THREE.Color(glow.color) },
    uRivGlowR: { value: new THREE.Vector3(glow.near, glow.far, glow.strength) },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
attribute float fgExtra; attribute float aRivLat; attribute vec4 aRivA; attribute vec4 aRivB; attribute float aRivF;
varying float vRivDist; varying vec2 vRivUv; varying float vRivLat; varying vec4 vRivA; varying vec4 vRivB; varying float vRivF;`)
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvRivUv = uv; vRivLat = aRivLat; vRivA = aRivA; vRivB = aRivB; vRivF = aRivF;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvRivDist = length(mvPosition.xyz) + fgExtra;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
varying float vRivDist; varying vec2 vRivUv; varying float vRivLat; varying vec4 vRivA; varying vec4 vRivB; varying float vRivF;
uniform vec3 uRivCyanLo; uniform vec3 uRivCyan; uniform vec3 uRivCyanHi; uniform vec3 uRivPinkLo; uniform vec3 uRivPink; uniform vec3 uRivPinkHi;
uniform vec3 uFoamTop; uniform vec3 uFoamPeri; uniform vec3 uFoamBlue; uniform vec3 uFoamDeep; uniform vec3 uRivGlow; uniform vec3 uRivGlowR;
float rivHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float rivNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 w = f * f * (3.0 - 2.0 * f);
  return mix(mix(rivHash(i), rivHash(i + vec2(1.0, 0.0)), w.x), mix(rivHash(i + vec2(0.0, 1.0)), rivHash(i + vec2(1.0, 1.0)), w.x), w.y);
}
float rivCells(vec2 p) {
  vec2 i = floor(p), f = fract(p); float d = 1.5;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = vec2(rivHash(i + g), rivHash(i + g + 19.7));
    d = min(d, length(g + o - f));
  }
  return d;
}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{
  float lat = vRivLat;                                   // units from the tunnel axis (+ right)
  float xB = vRivA.x, hw = vRivA.y, cL = vRivA.z, cR = vRivA.w;
  float wL = vRivB.x, wR = vRivB.y, core = vRivB.z;
  float fw = max(vRivF, 0.3);
  float s = vRivUv.y;                                    // virtual arc length (continues the real s)
  float fl = fwidth(lat) + 1e-4;
  float fs = fwidth(s) + 1e-4;
  float aaw = fl * 0.85 + 0.004;
  float side = sign(lat - xB);
  float e = abs(lat - xB) - hw;                          // > 0 outside the water body
  float fb = e / fw;                                     // 0 at the waterline … 1 at the foam bank's foot
  // scalloped outer edge of the foam bank (lumps ≈0.3 u, faded to a smooth edge where they would be < 2 px)
  float scN = rivNoise(vec2(s * 2.2, side * 9.0 + lat * 0.4));
  float scF = 1.0 - smoothstep(0.1, 0.35, fs * 2.2);
  if (fb > 0.88 + mix(0.0, 0.22 * (scN - 0.5), scF)) discard;
  // ---- water: cyan core between two hot-pink bands, flow lines that follow the winding core ----
  float xq = lat - core;
  float dL = abs(lat - cL), dR = abs(lat - cR);
  float pL = 1.0 - smoothstep(wL - aaw, wL + aaw, dL);
  float pR = 1.0 - smoothstep(wR - aaw, wR + aaw, dR);
  float pink = max(pL, pR);
  float relB = pL >= pR ? (lat - cL) / max(wL, 1e-3) : (cR - lat) / max(wR, 1e-3);   // +1 on the core side
  // two octaves of flow lines (fine near the seam, coarse further in), each faded where its spacing < a few px
  float fade = 1.0 - smoothstep(0.05, 0.16, fl * 3.0);
  float fade2 = 1.0 - smoothstep(0.1, 0.3, fl * 1.1);
  float dn = rivNoise(vec2(xq * 3.2, s * 0.32));
  float dn2 = rivNoise(vec2(xq * 1.2 + 4.0, s * 0.11));
  float lines = pow(0.5 + 0.5 * sin(xq * 11.0 + 1.4 * sin(s * 0.23)), 8.0) * fade;
  float lines2 = pow(0.5 + 0.5 * sin(xq * 3.6 + 0.9 * sin(s * 0.09 + 1.0)), 6.0) * fade2 * smoothstep(0.25, 0.65, dn2);
  vec3 cy = mix(uRivCyanLo, uRivCyan, smoothstep(0.1, 0.7, mix(mix(0.6, dn2, fade2), dn, fade)));
  cy = mix(cy, uRivCyanHi, clamp(lines * smoothstep(0.3, 0.8, dn) * 0.9 + lines2 * 0.8, 0.0, 1.0));
  // far field (lines faded): a light glossy sheen down the middle of the core instead (ref far cyan #4DC2F9)
  float sheen = exp(-pow(xq / max(0.35 * hw, 0.3), 2.0));
  cy = mix(cy, uRivCyanHi, sheen * 0.32 * (1.0 - fade2 * 0.5));
  lines = max(lines, lines2);
  float rimOut = (1.0 - pink) * max(1.0 - smoothstep(wL, wL + 0.3, dL), 1.0 - smoothstep(wR, wR + 0.3, dR));
  cy = mix(cy, uRivCyanHi, rimOut * 0.4);
  float satin = exp(-pow((relB - 0.35) * 2.0, 2.0));
  vec3 pk = mix(uRivPinkLo, uRivPink, smoothstep(-0.95, -0.25, relB));
  pk = mix(pk, uRivPinkHi, clamp(satin * 0.55 + lines * 0.35, 0.0, 1.0));
  vec3 col = mix(cy, pk, pink);
  // ---- foam bank: fine bubbles, white-lavender lit tops, periwinkle body, blue waterline / crevices / foot ----
  float bankN = (rivNoise(vec2(s * 0.9, side * 7.0 + lat * 1.3)) - 0.5) * 0.12;
  float foamIn = smoothstep(-0.06, 0.02, fb + bankN);
  if (foamIn > 0.0) {
    float c = rivCells(vec2(lat * 3.4, s * 1.7 + lat * 0.5));
    float c2 = rivCells(vec2(lat * 8.0 + 3.0, s * 4.0));
    float cf = 1.0 - smoothstep(0.08, 0.25, max(fl * 3.4, fs * 1.7));   // lumps only where they are ≳ 3 px
    float cf2 = 1.0 - smoothstep(0.08, 0.25, max(fl * 8.0, fs * 4.0));
    float lump = mix(0.45, smoothstep(0.08, 0.85, c), cf);              // 0 = lit lump top … 1 = crevice
    float crest = exp(-pow((fb - 0.4) / 0.32, 2.0));
    vec3 fo = mix(uFoamBlue, uFoamPeri, smoothstep(0.0, 0.22, fb));     // blue at the waterline → periwinkle body
    fo = mix(fo, uFoamTop, crest * (1.0 - 0.75 * lump));                // white-lavender lit tops
    fo = mix(fo, uFoamDeep, (1.0 - crest) * lump * 0.55);               // shaded crevices
    fo = mix(fo, uFoamBlue, cf2 * smoothstep(0.55, 0.0, fb) * (1.0 - smoothstep(0.05, 0.3, c2)) * 0.6); // small blue bubble dots low
    fo = mix(fo, uFoamDeep, smoothstep(0.62, 1.0, fb) * 0.55);           // foot in the shade of the bank
    col = mix(col, fo, foamIn);
  }
  float fg = smoothstep(uRivGlowR.x, uRivGlowR.y, vRivDist);
  col = mix(col, uRivGlow, min(0.9, fg * fg * uRivGlowR.z));
  diffuseColor.rgb = col;
}`);
  };
  mat.customProgramCacheKey = () => 'far-river-05-w9';
  return mat;
}
