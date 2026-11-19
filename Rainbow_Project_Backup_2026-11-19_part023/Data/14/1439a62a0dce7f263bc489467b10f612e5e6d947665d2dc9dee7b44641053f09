/**
 * Screen 05 test W11, material factor (`?flow05=1` / `?river05=1`): flow map + ripple map for the 05 river.
 *
 * FLOW MAP "from curves" (flowField05): a small RGBA8 texture over the river's own (u, s) domain — u across the
 * ribbon (−1 … 1 = bank to bank), s along the master course through stage 05 — generated at load time from the SAME
 * curves the game rides and draws: the course spline (course.ts meander05), the visible channel (channel05), the
 * cyan-core swing (coreLateral + coreShiftW10) and the magenta bands' S (sbend05). Every texel holds the local flow:
 *   R  lateral flow per unit travelled downstream (± FLOW_LAT_RANGE): the streamline through the texel keeps its
 *      fraction between the core line and the bank, so the flow bends with every S-curve and squeezes through
 *      the narrows beside a foam shelf
 *   G  speed (0 … 1): fast in the core, slower toward the banks, a little faster on the outside of a bend,
 *      almost still on a foam shelf
 *   B  turbulence (0 … 1): bank shear + bends (brighter, busier ripples)
 *   A  phase noise (0 … 1): de-synchronises the two-phase cycle from place to place (no visible pulse)
 * The fragment shaders (waterRibbon.ts, materials.ts farRiverMaterial) use it exactly like three.js Water2 uses its
 * `flowMap`: two samples of a tileable normal map are carried along the flow vector for one cycle each, half a cycle
 * apart, and cross-faded — but on the game's spline ribbon, without Water2's reflection / refraction render passes
 * (a planar mirror cannot follow a winding, banked stream and doubles the draw calls on a phone).
 *
 * RIPPLE MAP (rippleMap05): tileable 128² normal (RG) + height (B) + crest (A) texture, a deterministic sum of
 * integer-frequency waves (exactly periodic, mip-mapped). The same data can be replaced later by an authored map
 * (Blender bake, JangaFX IlluGen export): `tools/qa/flow05_dump.ts` writes both textures as PNG.
 *
 * Nothing here runs unless the switch is on (FLOWMAP05), so the default build is untouched.
 */
import * as THREE from 'three';
import type { Course } from '../world/course';
import { channel05, coreLateral, coreShiftW10, sbend05 } from './waterRibbon';

/** lateral flow (units per unit downstream) encoded in R as 0.5 + v / (2·range) */
export const FLOW_LAT_RANGE = 0.6;
export const FLOW_W = 32;
export const FLOW_H = 256;
export const RIPPLE_N = 128;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export interface FlowField05 {
  /** RGBA8, FLOW_W × FLOW_H, row 0 = s0 */
  data: Uint8Array;
  /** arc length of the first row and the covered length (v = (s − s0) / len) */
  s0: number;
  len: number;
}

/** the river's flow field, straight from its curves (pure data: also used by the QA dump in node) */
export function flowField05(course: Course): FlowField05 {
  const st = course.stage('05');
  const s0 = st.s0 - 2, len = st.s1 + 6 - s0;
  const data = new Uint8Array(FLOW_W * FLOW_H * 4);
  const rnd = mulberry32(0x05f10a);
  // low-frequency phase noise lattice (bilinear), 5 × 33 knots
  const NX = 5, NY = 33;
  const lattice = Array.from({ length: NX * NY }, () => rnd());
  const phase = (fx: number, fy: number) => {
    const x = fx * (NX - 1), y = fy * (NY - 1);
    const i = Math.min(NX - 2, Math.floor(x)), j = Math.min(NY - 2, Math.floor(y));
    const tx = x - i, ty = y - j;
    const g = (a: number, b: number) => lattice[b * NX + a];
    return (g(i, j) * (1 - tx) + g(i + 1, j) * tx) * (1 - ty) + (g(i, j + 1) * (1 - tx) + g(i + 1, j + 1) * tx) * ty;
  };
  const w05 = (s: number) => smooth(st.s0 - 5, st.s0 + 5, s) * (1 - smooth(st.s1 - 5, st.s1 + 5, s));
  /** core line, channel edges (ribbon lateral units) at s */
  const lines = (s: number) => {
    const ch = channel05(course, s);
    const core = coreLateral(course, s) + coreShiftW10(course, s) + sbend05(s) * w05(s);
    const eL = ch.c - ch.hw, eR = ch.c + ch.hw;
    return { core: Math.min(eR - 0.8, Math.max(eL + 0.8, core)), eL, eR };
  };
  const D = 0.3;
  for (let j = 0; j < FLOW_H; j++) {
    const s = s0 + ((j + 0.5) / FLOW_H) * len;
    const hwFull = course.widthAt(s) / 2;
    const a = lines(s - D), m = lines(s), b = lines(s + D);
    const bend = (b.core - a.core) / (2 * D);                  // heading of the core line (lateral per unit s)
    const curv = (b.core - 2 * m.core + a.core) / (D * D);
    for (let i = 0; i < FLOW_W; i++) {
      const u = -1 + (2 * (i + 0.5)) / FLOW_W;
      const lat = u * hwFull;
      let dl: number, spd: number, turb: number;
      if (lat < m.eL || lat > m.eR) {
        // foam shelf: almost still, creeping along the bank line
        const eA = lat < m.eL ? a.eL : a.eR, eB = lat < m.eL ? b.eL : b.eR;
        dl = (0.5 * (eB - eA)) / (2 * D);
        spd = 0.08;
        turb = 0.2;
      } else {
        const right = lat >= m.core;
        const t = right ? (lat - m.core) / Math.max(0.3, m.eR - m.core) : (m.core - lat) / Math.max(0.3, m.core - m.eL);
        // the streamline keeps its fraction t between the core line and its bank
        const la = right ? a.core + t * (a.eR - a.core) : a.core - t * (a.core - a.eL);
        const lb = right ? b.core + t * (b.eR - b.core) : b.core - t * (b.core - b.eL);
        dl = (lb - la) / (2 * D);
        // outside of a bend runs faster (the core line curves away from it)
        const outer = Math.max(-1, Math.min(1, -curv * 6)) * (right ? 1 : -1);
        spd = Math.min(1, (0.46 + 0.54 * (1 - t * t)) * (1 + 0.16 * outer * t));
        turb = Math.min(1, 0.85 * smooth(0.55, 1, t) + 0.9 * Math.abs(bend));
      }
      const k = (j * FLOW_W + i) * 4;
      data[k] = Math.round(255 * Math.min(1, Math.max(0, 0.5 + dl / (2 * FLOW_LAT_RANGE))));
      data[k + 1] = Math.round(255 * spd);
      data[k + 2] = Math.round(255 * turb);
      data[k + 3] = Math.round(255 * phase((i + 0.5) / FLOW_W, (j + 0.5) / FLOW_H));
    }
  }
  return { data, s0, len };
}

/** tileable ripple map: RG = normal xy (0.5 + 0.5 n), B = height 0..1, A = crest mask (sharp bright wave tops) */
export function rippleData05(N = RIPPLE_N): Uint8Array {
  const rnd = mulberry32(0x21b6e5);
  const waves: { kx: number; ky: number; a: number; ph: number; sharp: number }[] = [];
  // 26 waves, |k| 2 … 12 cycles per tile; a few more waves run ACROSS the flow axis (x) than along it, so after the
  // 4:1 stretch along the river the crests read as long streaks with shorter cross ripples riding on them
  while (waves.length < 26) {
    const kx = Math.round((rnd() * 2 - 1) * 12), ky = Math.round((rnd() * 2 - 1) * 9);
    const kk = Math.hypot(kx, ky);
    if (kk < 2 || kk > 12.5) continue;
    waves.push({ kx, ky, a: 1 / Math.pow(kk, 1.15), ph: rnd() * Math.PI * 2, sharp: 1.4 + rnd() * 1.6 });
  }
  const h = new Float32Array(N * N);
  let lo = Infinity, hi = -Infinity;
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      let v = 0;
      for (const w of waves) {
        const c = 0.5 + 0.5 * Math.cos((2 * Math.PI * (w.kx * x + w.ky * y)) / N + w.ph);
        v += w.a * Math.pow(c, w.sharp);                      // narrow crests, broad troughs
      }
      h[y * N + x] = v;
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
  }
  const out = new Uint8Array(N * N * 4);
  const at = (x: number, y: number) => (h[((y + N) % N) * N + ((x + N) % N)] - lo) / (hi - lo);
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      const v = at(x, y);
      const gx = (at(x + 1, y) - at(x - 1, y)) * 0.5 * N, gy = (at(x, y + 1) - at(x, y - 1)) * 0.5 * N;
      // slopes are ≈ ±12 per tile: 0.045 keeps |n.xy| mostly under 0.6
      const nx = -gx * 0.045, ny = -gy * 0.045;
      const il = 1 / Math.hypot(nx, ny, 1);
      const k = (y * N + x) * 4;
      out[k] = Math.round(255 * (0.5 + 0.5 * nx * il));
      out[k + 1] = Math.round(255 * (0.5 + 0.5 * ny * il));
      out[k + 2] = Math.round(255 * v);
      out[k + 3] = Math.round(255 * smooth(0.56, 0.86, v));
    }
  }
  return out;
}

export interface Flow05 {
  flowMap: THREE.DataTexture;
  ripple: THREE.DataTexture;
  /** x = s0, y = 1 / len (flow-map v = (s − x) · y) */
  sRange: THREE.Vector2;
}
let cache: Flow05 | null = null;
/** the two GPU textures (built once; 32×256 + 128² RGBA8 ≈ 0.1 MB with mips) */
export function flow05Textures(course: Course): Flow05 {
  if (cache) return cache;
  const ff = flowField05(course);
  // three's texture UUIDs draw on Math.random: keep the global sequence untouched (see marblePano05)
  const rndG = Math.random;
  Math.random = () => 0.5;
  let flowMap: THREE.DataTexture, ripple: THREE.DataTexture;
  try {
    flowMap = new THREE.DataTexture(ff.data, FLOW_W, FLOW_H, THREE.RGBAFormat, THREE.UnsignedByteType);
    ripple = new THREE.DataTexture(rippleData05(), RIPPLE_N, RIPPLE_N, THREE.RGBAFormat, THREE.UnsignedByteType);
  } finally {
    Math.random = rndG;
  }
  flowMap.uuid = 'flow05-map';
  flowMap.name = 'flow05_map';
  flowMap.magFilter = flowMap.minFilter = THREE.LinearFilter;
  flowMap.wrapS = flowMap.wrapT = THREE.ClampToEdgeWrapping;
  flowMap.colorSpace = THREE.NoColorSpace;
  flowMap.needsUpdate = true;
  ripple.uuid = 'flow05-ripple';
  ripple.name = 'flow05_ripple';
  ripple.wrapS = ripple.wrapT = THREE.RepeatWrapping;
  ripple.magFilter = THREE.LinearFilter;
  ripple.minFilter = THREE.LinearMipmapLinearFilter;
  ripple.generateMipmaps = true;
  ripple.anisotropy = 4;
  ripple.colorSpace = THREE.NoColorSpace;
  ripple.needsUpdate = true;
  cache = { flowMap, ripple, sRange: new THREE.Vector2(ff.s0, 1 / ff.len) };
  return cache;
}

/**
 * Uniform objects shared between the ribbon (vfx) and the 05 tunnel (world): the game clock the ribbon is driven
 * with (so the far river animates in step), and the Marble panorama (set by environment.ts, which owns it).
 */
export const flow05Shared = {
  uTime: { value: 0 } as THREE.IUniform<number>,
  uPano: { value: null } as THREE.IUniform<THREE.Texture | null>,
  /** world direction → panorama lookup direction (materials.ts marblePanoMatrix05) */
  uPanoRot: { value: new THREE.Matrix3() } as THREE.IUniform<THREE.Matrix3>,
};

/**
 * GLSL (fragment): two-phase flow-map sampling of the ripple map, the three.js Water2 scheme. `uv` = ripple uv at
 * rest, `adv` = uv travelled along the flow during one cycle, `cyc` = cycle counter (time / period + phase noise).
 * Each phase is centred on its rest position (offset −½ … +½ cycle), so it is least distorted when its weight peaks.
 */
export const FLOW05_GLSL = /* glsl */ `
vec4 flowRipple(sampler2D map, vec2 uv, vec2 adv, float cyc) {
  float p0 = fract(cyc), p1 = fract(cyc + 0.5);
  vec4 a = texture2D(map, uv - adv * (p0 - 0.5));
  vec4 b = texture2D(map, uv - adv * (p1 - 0.5) + vec2(0.37, 0.61));
  return mix(b, a, 1.0 - abs(1.0 - 2.0 * p0));
}
`;
