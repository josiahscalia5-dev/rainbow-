/**
 * Foam banks along the stream (refs 03–10) + whirlpool rim foam.
 *  - berm: ONE continuous lumpy lather bank per side, swept along the course (custom shader:
 *    two-scale cellular soap bubbles with derivative bump lighting, lavender crevices, pores,
 *    faint iridescent rim). This is what makes the banks read as continuous foam, not cotton balls.
 *  - puffs: instanced bubble puffs sitting ON the berm crest (silhouette lumps), in ~40-unit chunks
 *    so only chunks near Benny are drawn; quality 'low' halves density and uses 20-tri puffs.
 *  - foam rings on the whirlpool rim and along its spiral bands (rotating with the swirl)
 *  - rafts (05, wave 3): floating foam clumps ON the water. "Flank" rafts continue the two banks down
 *    both sides of the frame to Benny's level (ref 05: cloud banks hugging BOTH edges y≈540–1300);
 *    they float with the current alongside the rider, drift slowly forward and merge into the bank
 *    ahead, and part around Benny when he steers into them. "Wake" rafts are the whitewater shed
 *    behind the two spray fans (ref 05: foam at x 60–200 / 690–800, y≈1200–1290). One instanced
 *    draw, fixed pool, no per-frame allocation.
 */
import * as THREE from 'three';
import { type Course, WORLD, funnelY } from '../world/course';
import { EDGE_LIFT } from './waterRibbon';
import { SPIRAL_C, FUNNEL_LIFT } from './whirlpool';
import { FRAG_FX_GLSL, FRAG_TAIL, NOISE_GLSL, withFog } from './glsl';

/** c = (ambient occlusion 0..1, seed 0..1, tint -1..1) → instanceColor (see PUFF_VERT) */
interface Puff { p: THREE.Vector3; r: number; ao: number; tint: number }

// ---------------------------------------------------------------------------------- berm profile
/** berm spans e ∈ [BERM_IN, BERM_OUT] units outward from the ribbon edge (negative = over the water) */
export const BERM_IN = -0.6;
export const BERM_OUT = 1.2;
const hash1 = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise1 = (x: number) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash1(i) * (1 - u) + hash1(i + 1) * u; };
/** 0..1 lumpiness of the bank at (s, side) — CPU only, baked into the mesh and the puff placement */
export function bermLump(s: number, side: number): number {
  return 0.55 * noise1(s * 0.33 + side * 31.7) + 0.45 * noise1(s * 1.05 + side * 7.3);
}
/** CPU cellular "bubble dome" field (0..1) so the bank silhouette is a pile of round lumps */
export function bermDomes(s: number, e: number, side: number): number {
  const gs = s / 0.95, ge = e / 0.62 + side * 11.3;
  const i0 = Math.floor(gs), j0 = Math.floor(ge);
  let best = 0;
  for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
    const i = i0 + di, j = j0 + dj;
    const ox = hash1(i * 17.13 + j * 3.71), oy = hash1(i * 5.31 + j * 19.7 + 4.2);
    const r = 0.45 + 0.4 * hash1(i * 7.7 + j * 13.1 + 9.9);
    const dx = (i + ox - gs) / r, dy = (j + oy - ge) / r;
    best = Math.max(best, 1 - (dx * dx + dy * dy));
  }
  return Math.max(0, best);
}

/** height (along course up) of the bank surface at e units outward from the edge */
export function bermHeight(e: number, hw: number, lump: number): number {
  const uIn = Math.max(0, (hw + BERM_IN) / hw);
  const hIn = EDGE_LIFT * uIn * uIn * uIn - 0.07;
  const ep = 0.08 + 0.22 * lump;
  const hp = EDGE_LIFT + 0.14 + 0.5 * lump;
  const hOut = -0.95;
  if (e <= ep) {
    const t = Math.min(1, Math.max(0, (e - BERM_IN) / (ep - BERM_IN)));
    return hIn + (hp - hIn) * (1 - (1 - t) * (1 - t));
  }
  const t = Math.min(1, (e - ep) / (BERM_OUT - ep));
  return hp + (hOut - hp) * t * t;
}

/** full bank surface height incl. bubble domes (shared by the mesh and the puff placement) */
export function bermSurface(s: number, e: number, side: number, hw: number): number {
  const domeK = Math.min(1, Math.max(0, (e + 0.3) / 0.35)) * Math.min(1, Math.max(0, (BERM_OUT - 0.1 - e) / 0.4));
  return bermHeight(e, hw, bermLump(s, side)) + 0.2 * domeK * Math.sqrt(bermDomes(s, e, side));
}

const BERM_VERT = /* glsl */ `
attribute vec3 aFoam;    // x = e (units outward from the stream edge), y = s, z = side (-1 / 1)
uniform float uTime;
varying vec3 vFoam;
varying vec3 vPosW;
varying vec3 vNormalW;
#include <fog_pars_vertex>
void main() {
  // gentle breathing of the lather (never at the water line)
  float k = smoothstep(-0.2, 0.3, aFoam.x);
  vec3 p = position + normal * (0.03 * k * sin(uTime * 1.6 + aFoam.y * 2.1 + aFoam.z * 3.0));
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vFoam = aFoam;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const BERM_FRAG = /* glsl */ `
uniform float uTime;
uniform vec2 uOutro;     // amount, chamber start s
uniform vec3 uLightDir;
varying vec3 vFoam;
varying vec3 vPosW;
varying vec3 vNormalW;
#include <fog_pars_fragment>
${NOISE_GLSL}
${FRAG_FX_GLSL}
void main() {
  float s = vFoam.y;
  if (uOutro.x > 0.0 && s > uOutro.y - 2.0) {
    float n = vnoise(vec2(vFoam.x * 3.0, s * 0.35)) * 0.7 + 0.3;
    if (n < uOutro.x * 1.15) discard;
  }
  vec2 p = vec2(vFoam.x * vFoam.z * 1.1, s - uTime * 0.25);
  // detail fade with distance (cells per pixel)
  float fw = max(fwidth(p.x), fwidth(p.y));
  float k1 = 1.0 - smoothstep(0.12, 0.3, fw * 1.6);
  float k2 = 1.0 - smoothstep(0.12, 0.3, fw * 3.8);
  float c1 = mix(0.45, cells(p * 1.6), k1);
  #ifdef LOW_Q
  float c2 = c1;
  #else
  float c2 = mix(0.45, cells(p * 3.8 + 11.0), k2);
  #endif
  // bubble domes: bright cell centres, deep crevices between bubbles
  float bub = (1.0 - c1 * c1) * 0.6 + (1.0 - c2 * c2) * 0.4;
  vec3 N0 = normalize(vNormalW);
  if (!gl_FrontFacing) N0 = -N0;
  #ifdef LOW_Q
  vec3 N = N0;
  #else
  vec3 N = bumpNormal(vPosW, N0, bub * 0.1);
  #endif
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(cameraPosition - vPosW);
  float diff = 0.55 + 0.45 * max(dot(N, L), 0.0);
  vec3 white = vec3(1.0, 1.0, 1.0);
  vec3 lav = vec3(0.7, 0.68, 0.98);
  vec3 col = mix(lav, white, 0.3 + 0.7 * clamp(N.y * 0.5 + 0.5, 0.0, 1.0)) * diff;
  col = mix(col, lav * 0.8, smoothstep(0.6, 0.95, c1) * 0.7 * k1);
  col = mix(col, lav * 0.9, smoothstep(0.65, 0.95, c2) * 0.4 * k2);
  // tiny pores (open bubbles)
  #ifndef LOW_Q
  vec2 pp = p * 7.0 + 5.0;
  float pc = cells(pp);
  float kp = 1.0 - smoothstep(0.1, 0.25, fw * 7.0);
  col = mix(col, vec3(0.58, 0.56, 0.88), (1.0 - smoothstep(0.1, 0.2, pc)) * step(0.62, hash12(floor(pp))) * 0.75 * kp);
  #endif
  float spec = pow(max(dot(reflect(-V, N), L), 0.0), 28.0);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  col += vec3(1.0) * spec * 0.45 + iridescent(fres * 1.4 + c1 * 0.6) * fres * 0.18;
  gl_FragColor = vec4(col * 0.96, 1.0);
  ${FRAG_TAIL}
}
`;

// ---------------------------------------------------------------------------------- puffs
/**
 * Soap-foam puff (ref 05 "cloud banks": white-lavender clumps, #FCF6FF lit tops, soft lavender
 * undersides and crevices, a few darker pores, faint soap-film rim). instanceColor carries
 * (x = ambient occlusion 0..1, y = seed, z = tint -1..1), not a colour.
 */
const PUFF_VERT = /* glsl */ `
uniform float uTime;
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vLocal;
varying vec3 vInst;
#include <fog_pars_vertex>
void main() {
  vInst = instanceColor;
  float br = 1.0 + 0.035 * sin(uTime * 1.7 + instanceColor.y * 40.0);
  vec4 wp = modelMatrix * instanceMatrix * vec4(position * br, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vLocal = normal;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;
const PUFF_FRAG = /* glsl */ `
uniform vec3 uLightDir;
varying vec3 vNormalW;
varying vec3 vPosW;
varying vec3 vLocal;
varying vec3 vInst;
#include <fog_pars_fragment>
${NOISE_GLSL}
void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 L = normalize(uLightDir);
  float wrap = clamp(dot(N, L) * 0.55 + 0.5, 0.0, 1.0);
  float upF = clamp(N.y * 0.5 + 0.5, 0.0, 1.0);
  float lit = smoothstep(0.18, 0.88, wrap * 0.65 + upF * 0.35);
  vec3 lav = vec3(0.47, 0.44, 0.88);
  vec3 top = mix(vec3(1.1, 1.04, 1.16), vec3(1.04, 1.06, 1.16), clamp(vInst.z, 0.0, 1.0));
  top = mix(top, vec3(1.12, 1.02, 1.12), clamp(-vInst.z, 0.0, 1.0));
  vec3 col = mix(lav, top, lit);
  #ifndef LOW_Q
  // pores: small open bubbles on the puff skin (puff-local, two planar projections, no seam)
  vec3 an = abs(vLocal);
  vec2 pc = (an.x > an.z ? vLocal.zy : vLocal.xy) * 2.6 + vInst.y * 17.0;
  float cp = cells(pc);
  float kp = 1.0 - smoothstep(0.2, 0.45, fwidth(pc.x) + fwidth(pc.y));
  float pore = (1.0 - smoothstep(0.1, 0.2, cp)) * step(0.6, hash12(floor(pc) + vInst.y * 31.0));
  col = mix(col, lav * 0.95, pore * kp * 0.6 * lit);
  #endif
  // soap-film rim (cool lavender, a touch of pink) + soft glint
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.4);
  col = mix(col, vec3(0.8, 0.68, 1.0), fres * 0.42);
  float spec = pow(max(dot(reflect(-V, N), L), 0.0), 26.0);
  col += vec3(1.0) * spec * 0.3;
  col *= mix(0.68, 1.0, vInst.x);
  gl_FragColor = vec4(col, 1.0);
  ${FRAG_TAIL}
}
`;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makePuffMaterial(quality: 'high' | 'low') {
  const uniforms = withFog({
    uTime: { value: 0 },
    uLightDir: { value: new THREE.Vector3(0.3, 1.0, 0.45).normalize() },
  });
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: PUFF_VERT,
    fragmentShader: PUFF_FRAG,
    fog: true,
    defines: quality === 'low' ? { LOW_Q: 1 } : {},
  });
  return { mat, uniforms };
}

/** unit sphere puff with smooth normals (detail 0 icosahedra get flat normals by default) */
function puffGeometry(detail: number) {
  const g = new THREE.IcosahedronGeometry(1, detail);
  const p = g.attributes.position as THREE.BufferAttribute;
  const n = g.attributes.normal as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).normalize(); n.setXYZ(i, v.x, v.y, v.z); }
  return g;
}

export interface FoamSystem {
  group: THREE.Group;
  whirlGroup: THREE.Group;
  berm: THREE.Mesh;
  /** floating foam rafts (flank banks + wake foam), 05 only */
  rafts: THREE.InstancedMesh;
  /** Benny's waterline position on the course (call from water.wake() each riding frame) */
  rider(s: number, lat: number, strength: number): void;
  update(time: number, dt: number, focusS: number, outro?: number): void;
  /** QA: current raft placement */
  qaRafts(): { visible: boolean; puffs: number; shown: number; clumps: { kind: string; ds: number; lat: number; k: number }[] };
  instanceCount: number;
}

// ---------------------------------------------------------------------------------- rafts
/** flank rafts cycle from DS0 (behind the camera) to DS1 (ahead, merged into the bank) relative to Benny */
const RAFT_DS0 = -2.6;
const RAFT_DS1 = 8.5;
/** relative forward drift of the flank rafts (cycles per second over DS0..DS1 ≈ 0.5 units/s) */
const RAFT_RATE = 0.042;
/** wake rafts are shed behind the fans: ds from -0.35 to WAKE_DS1, cycles per second */
const WAKE_DS1 = -3.3;
const WAKE_RATE = 0.3;
/** never closer than this to the stream centreline (coin line / cyan core) */
const RAFT_MIN_LAT = 1.9;

interface RaftPuff { dx: number; dl: number; dh: number; r: number; q: THREE.Quaternion }
interface Clump { kind: 0 | 1; side: number; phase: number; depth: number; puffs: RaftPuff[]; first: number }

/** continuous lather bank along both stream edges (skips the 03 whirlpool interior) */
function createBerm(course: Course, s0: number, s1: number, skip: [number, number], quality: 'high' | 'low') {
  const ds = quality === 'high' ? 0.32 : 0.8;
  const E = quality === 'high' ? [BERM_IN, -0.4, -0.25, -0.1, 0.04, 0.18, 0.34, 0.52, 0.75, 0.98, BERM_OUT] : [BERM_IN, -0.2, 0.15, 0.55, BERM_OUT];
  const rows = Math.ceil((s1 - s0) / ds) + 1;
  const C = E.length;
  const n = rows * C * 2;
  const pos = new Float32Array(n * 3);
  const foam = new Float32Array(n * 3);
  const tmp = new THREE.Vector3();
  let k = 0;
  const rowS: number[] = [];
  for (let i = 0; i < rows; i++) {
    const s = Math.min(s1, s0 + i * ds);
    rowS.push(s);
    const f = course.sample(s);
    const hw = course.widthAt(s) / 2;
    for (const side of [-1, 1]) {
      for (let j = 0; j < C; j++) {
        // left side is mirrored so every row runs inner → outer; bubble domes everywhere except
        // at the water line (keeps the lace edge flush with the stream)
        const e = E[j];
        const h = bermSurface(s, e, side, hw);
        tmp.copy(f.pos).addScaledVector(f.right, side * (hw + e)).addScaledVector(f.up, h);
        tmp.toArray(pos, k * 3);
        foam[k * 3] = e;
        foam[k * 3 + 1] = s;
        foam[k * 3 + 2] = side;
        k++;
      }
    }
  }
  const idx: number[] = [];
  const rowStride = C * 2;
  for (let i = 0; i < rows - 1; i++) {
    const sa = rowS[i], sb = rowS[i + 1];
    if (sb > skip[0] && sa < skip[1]) continue;
    for (let sideI = 0; sideI < 2; sideI++) {
      for (let j = 0; j < C - 1; j++) {
        const a = i * rowStride + sideI * C + j, b = a + 1, c = a + rowStride, d = c + 1;
        // CCW seen from above on both sides (side +1 runs +right, side −1 runs −right)
        if (sideI === 1) idx.push(a, b, c, b, d, c);
        else idx.push(a, c, b, b, c, d);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aFoam', new THREE.BufferAttribute(foam, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const uniforms = withFog({
    uTime: { value: 0 },
    uOutro: { value: new THREE.Vector2(0, course.stage('08').s0) },
    uLightDir: { value: new THREE.Vector3(0.3, 1.0, 0.45).normalize() },
  });
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: BERM_VERT,
    fragmentShader: BERM_FRAG,
    fog: true,
    side: THREE.DoubleSide,
    defines: quality === 'low' ? { LOW_Q: 1 } : {},
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'foam_berm';
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}

export function createFoam(
  course: Course,
  opts: { s0: number; s1: number; quality: 'high' | 'low'; height?: (s: number, lat: number, t: number) => number },
): FoamSystem {
  const { s0, s1, quality } = opts;
  const heightAt = opts.height ?? (() => 0);
  const rand = rng(1337);
  const density = quality === 'high' ? 1 : 0.5;
  // LOD: 80-tri puffs in the chunks around Benny, 20-tri puffs further out (low tier: 20-tri only)
  const geoHi = puffGeometry(quality === 'high' ? 1 : 0);
  const geoLo = quality === 'high' ? puffGeometry(0) : geoHi;
  const puff = makePuffMaterial(quality);
  const mat = puff.mat;
  const group = new THREE.Group();
  group.name = 'foam_banks';
  const st03 = course.stage('03'), st04 = course.stage('04');
  const chunkLen = 24;
  const chunks: { mesh: THREE.InstancedMesh; sa: number; sb: number }[] = [];
  let total = 0;
  const tmpM = new THREE.Matrix4();
  const tmpQ = new THREE.Quaternion();
  const tmpS = new THREE.Vector3();
  const tmpE = new THREE.Euler();
  const tmpC = new THREE.Color();

  const build = (list: Puff[], parent: THREE.Object3D, sa: number, sb: number) => {
    if (!list.length) return;
    const mesh = new THREE.InstancedMesh(geoHi, mat, list.length);
    list.forEach((pf, i) => {
      tmpQ.setFromEuler(tmpE.set(rand() * 6, rand() * 6, rand() * 6));
      tmpS.set(pf.r, pf.r * (0.78 + rand() * 0.22), pf.r);
      tmpM.compose(pf.p, tmpQ, tmpS);
      mesh.setMatrixAt(i, tmpM);
      mesh.setColorAt(i, tmpC.setRGB(pf.ao, rand(), pf.tint));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    parent.add(mesh);
    chunks.push({ mesh, sa, sb });
    total += list.length;
  };

  // ---- continuous lather bank (berm) along both edges ----
  const skip: [number, number] = [st03.s0 + 4, st04.s0 - 6];
  const berm = createBerm(course, s0, s1, skip, quality);
  group.add(berm.mesh);

  // ---- cloud banks of puffs hugging both stream edges (ref 05: 10–40 px white-lavender clumps) ----
  const inSkip = (s: number) => s > skip[0] && s < skip[1];
  const addPuff = (list: Puff[], s: number, e: number, side: number, r: number, lift: number, ao: number) => {
    const ss = Math.min(s1, Math.max(s0, s));
    if (inSkip(ss)) return;
    const f = course.sample(ss);
    const hw = course.widthAt(ss) / 2;
    const h = bermSurface(ss, e, side, hw) + lift;
    const p = f.pos.clone().addScaledVector(f.right, side * (hw + e)).addScaledVector(f.up, h);
    list.push({ p, r, ao, tint: rand() * 2 - 1 });
  };
  const step = quality === 'high' ? 0.36 : 0.62;
  for (let sa = s0; sa < s1; sa += chunkLen) {
    const sb = Math.min(s1, sa + chunkLen);
    const list: Puff[] = [];
    // skip most of 03 (the whirlpool has its own foam), keep the chute→rim hand-over
    for (let s = sa; s < sb; s += step) {
      if (inSkip(s)) continue;
      for (const side of [-1, 1]) {
        // crest puffs: the body of the bank
        const nC = quality === 'high' && rand() < 0.55 ? 2 : 1;
        for (let k = 0; k < nC; k++) {
          const r = 0.11 + rand() * 0.13;
          addPuff(list, s + (rand() - 0.5) * step, -0.32 + rand() * 0.82, side, r, r * (0.05 + rand() * 0.3), 0.8 + 0.2 * rand());
        }
        // small puffs right at the water line (the lacy edge of the bank)
        if (rand() < 0.65) {
          const r = 0.06 + rand() * 0.06;
          addPuff(list, s + (rand() - 0.5) * step, -0.58 + rand() * 0.28, side, r, r * 0.15, 0.9);
        }
      }
      // heaps: clusters of big puffs stacked on the crest → lumpy cloud-bank silhouette
      if (rand() < (quality === 'high' ? 0.16 : 0.1)) {
        const side = rand() < 0.5 ? -1 : 1;
        const n = 5 + ((rand() * 6) | 0);
        const ec = -0.1 + rand() * 0.55;
        for (let k = 0; k < n; k++) {
          const r = 0.15 + rand() * 0.18;
          const stack = k > 2 && rand() < 0.4 ? r * 0.65 : 0;
          const lift = r * (0.1 + rand() * 0.45) + stack;
          addPuff(list, s + (rand() - 0.5) * 1.8, ec + (rand() - 0.5) * 0.55, side, r, lift, 0.72 + 0.28 * Math.min(1, lift / (r * 0.9)));
        }
      }
    }
    build(list, group, sa - 2, sb + 2);
  }

  // ---- whirlpool: rim ring + spiral band foam (rotates with the swirl) ----
  const whirlGroup = new THREE.Group();
  whirlGroup.name = 'foam_whirlpool';
  const b = WORLD.basin;
  whirlGroup.position.set(b.center.x, 0, b.center.z);
  const wl: Puff[] = [];
  // rim: cloud clusters of soap foam with a thin continuous fringe between them
  const nClusters = Math.round(26 * density);
  for (let k = 0; k < nClusters; k++) {
    const th0 = rand() * Math.PI * 2;
    const n = 10 + ((rand() * 16) | 0);
    for (let i = 0; i < n; i++) {
      const th = th0 + (rand() - 0.5) * 0.35;
      const r = b.rimRadius - 0.7 + (rand() - 0.4) * 1.3;
      const sz = 0.18 + rand() * 0.42;
      wl.push({ p: new THREE.Vector3(r * Math.sin(th), funnelY(r) + FUNNEL_LIFT + sz * 0.35 + rand() * 0.55, r * Math.cos(th)), r: sz, ao: 0.75 + 0.25 * rand(), tint: rand() * 2 - 1 });
    }
  }
  const nRim = Math.round(200 * density);
  for (let i = 0; i < nRim; i++) {
    const th = rand() * Math.PI * 2;
    const r = b.rimRadius - 0.4 + (rand() - 0.5) * 0.6;
    const sz = 0.1 + rand() * 0.18;
    wl.push({ p: new THREE.Vector3(r * Math.sin(th), funnelY(r) + FUNNEL_LIFT + sz * 0.3, r * Math.cos(th)), r: sz, ao: 0.85 + 0.15 * rand(), tint: rand() * 2 - 1 });
  }
  // along 3 spiral flow lines (constant th - C ln r) to echo the white foam bands
  const nBand = Math.round(60 * density);
  for (let i = 0; i < nBand; i++) {
    const band = ((i % 3) * Math.PI * 2) / 3 + 0.4;
    const r = 3.0 + rand() * (b.rimRadius - 3.6);
    const th = band + SPIRAL_C * Math.log(r) + (rand() - 0.5) * 0.12;
    const sz = 0.07 + rand() * 0.13;
    wl.push({ p: new THREE.Vector3(r * Math.sin(th), funnelY(r) + FUNNEL_LIFT + sz * 0.3, r * Math.cos(th)), r: sz, ao: 0.85 + 0.15 * rand(), tint: rand() * 2 - 1 });
  }
  const whirlStart = chunks.length;
  build(wl, whirlGroup, st03.s0 - 30, st04.s0 + 25);
  group.add(whirlGroup);

  // ---- floating rafts (05): flank banks + wake foam ----
  const rr = rng(4242);
  const clumps: Clump[] = [];
  let nRaft = 0;
  const NF = quality === 'high' ? 10 : 6;
  const NW = quality === 'high' ? 4 : 3;
  const randQ = () => new THREE.Quaternion().setFromEuler(new THREE.Euler(rr() * 6, rr() * 6, rr() * 6));
  for (const side of [-1, 1]) {
    for (let i = 0; i < NF; i++) {
      // cloud clump (ref 05: 10–40 px soap-bubble puffs packed into a bank): a dome of bigger puffs
      // in the middle, smaller ones round the rim, a third stacked on top; spacing < puff radius so
      // the clump reads as one lumpy cloud, not separate cotton balls
      const P = quality === 'high' ? 13 + ((rr() * 4) | 0) : 7 + ((rr() * 3) | 0);
      const puffs: RaftPuff[] = [];
      const len = 0.5 + rr() * 0.35, wid = 0.28 + rr() * 0.16;
      for (let k = 0; k < P; k++) {
        const ang = rr() * Math.PI * 2, rad = Math.sqrt(rr());
        const r = (k < 4 ? 0.12 + rr() * 0.06 : 0.06 + rr() * 0.07) * (1 - 0.35 * rad);
        const stack = k >= 4 && rad < 0.6 && rr() < 0.4 ? 0.1 + rr() * 0.06 : 0;
        puffs.push({ dx: Math.cos(ang) * rad * len, dl: Math.sin(ang) * rad * wid, dh: r * (0.1 + rr() * 0.3) + stack * (1 - rad), r, q: randQ() });
      }
      clumps.push({ kind: 0, side, phase: (i + rr() * 0.6) / NF, depth: 1.7 + rr() * 1.5, puffs, first: nRaft });
      nRaft += P;
    }
    for (let i = 0; i < NW; i++) {
      const P = quality === 'high' ? 8 + ((rr() * 3) | 0) : 5;
      const puffs: RaftPuff[] = [];
      for (let k = 0; k < P; k++) {
        const ang = rr() * Math.PI * 2, rad = Math.sqrt(rr());
        const r = (k < 3 ? 0.08 + rr() * 0.05 : 0.045 + rr() * 0.05) * (1 - 0.3 * rad);
        puffs.push({ dx: Math.cos(ang) * rad * 0.4, dl: Math.sin(ang) * rad * 0.24, dh: r * (0.05 + rr() * 0.25), r, q: randQ() });
      }
      clumps.push({ kind: 1, side, phase: (i + rr() * 0.6) / NW, depth: 1.0 + rr() * 0.2, puffs, first: nRaft });
      nRaft += P;
    }
  }
  const rafts = new THREE.InstancedMesh(geoHi, mat, nRaft);
  rafts.name = 'foam_rafts';
  rafts.frustumCulled = false;
  for (const c of clumps) {
    c.puffs.forEach((pf, k) => {
      // lit tops (ao high) for the big centre domes, a bit more shade on the small rim puffs
      rafts.setColorAt(c.first + k, tmpC.setRGB(c.kind === 1 ? 0.92 : 0.78 + 0.22 * Math.min(1, pf.r / 0.22), rr(), rr() * 2 - 1));
      rafts.setMatrixAt(c.first + k, tmpM.makeScale(0, 0, 0));
    });
  }
  if (rafts.instanceColor) rafts.instanceColor.needsUpdate = true;
  rafts.visible = false;
  group.add(rafts);
  total += nRaft;
  const st05 = course.stage('05');
  const sm = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const rider = { s: 0, lat: 0, str: 0, target: 0, fed: false };
  const fr = { s: 0, pos: new THREE.Vector3(), tan: new THREE.Vector3(), up: new THREE.Vector3(), right: new THREE.Vector3() };
  const base = new THREE.Vector3();
  const pP = new THREE.Vector3();
  const qa: { kind: string; ds: number; lat: number; k: number }[] = [];
  let shown = 0;

  const updateRafts = (time: number, dt: number, focusS: number, outro: number) => {
    if (!rider.fed) rider.target = 0;
    rider.fed = false;
    rider.str = dt > 0 ? rider.str + (rider.target - rider.str) * Math.min(1, dt * 4) : rider.target;
    const w = sm(st05.s0 + 2, st05.s0 + 7, focusS) * (1 - sm(st05.s1 - 7, st05.s1 - 2, focusS)) * rider.str * (1 - outro);
    qa.length = 0;
    shown = 0;
    rafts.visible = w > 0.01;
    if (!rafts.visible) return;
    for (const c of clumps) {
      let ds: number, lat: number, k: number;
      if (c.kind === 0) {
        const cyc = (((c.phase + time * RAFT_RATE) % 1) + 1) % 1;
        ds = RAFT_DS0 + cyc * (RAFT_DS1 - RAFT_DS0);
        const hw = course.widthAt(rider.s + ds) / 2;
        // deep in the water next to Benny, pushed out to the bank further ahead
        const depth = c.depth * (1 - 0.72 * sm(1.5, 7.5, ds));
        lat = c.side * Math.max(RAFT_MIN_LAT, hw - depth);
        // part around Benny (he can steer anywhere across the stream)
        const part = sm(1.35, 2.0, Math.hypot(ds * 0.55, lat - rider.lat));
        k = sm(RAFT_DS0, RAFT_DS0 + 1.2, ds) * (1 - sm(RAFT_DS1 - 2.5, RAFT_DS1, ds)) * part;
      } else {
        const cyc = (((c.phase + time * WAKE_RATE) % 1) + 1) % 1;
        ds = -0.35 + cyc * (WAKE_DS1 + 0.35);
        lat = rider.lat + c.side * (c.depth + 0.3 * -ds);
        k = sm(-0.35, -0.95, ds) * (1 - sm(WAKE_DS1 + 0.9, WAKE_DS1, ds));
      }
      k *= w;
      const s = Math.min(s1, Math.max(s0, rider.s + ds));
      course.sample(s, fr);
      base.copy(fr.pos).addScaledVector(fr.right, lat).addScaledVector(fr.up, heightAt(s, lat, time));
      if (qa.length < 64) qa.push({ kind: c.kind === 0 ? 'flank' : 'wake', ds: +ds.toFixed(2), lat: +lat.toFixed(2), k: +k.toFixed(2) });
      for (let i = 0; i < c.puffs.length; i++) {
        const pf = c.puffs[i];
        const r = pf.r * k * (1 + 0.035 * Math.sin(time * 1.7 + i * 2.3 + c.phase * 20));
        if (r < 0.004) { rafts.setMatrixAt(c.first + i, tmpM.makeScale(0, 0, 0)); continue; }
        pP.copy(base).addScaledVector(fr.tan, pf.dx).addScaledVector(fr.right, c.side * pf.dl).addScaledVector(fr.up, pf.dh * k + r * 0.15);
        tmpS.set(r, r * 0.8, r);
        tmpM.compose(pP, pf.q, tmpS);
        rafts.setMatrixAt(c.first + i, tmpM);
        shown++;
      }
    }
    rafts.instanceMatrix.needsUpdate = true;
  };

  return {
    group,
    whirlGroup,
    berm: berm.mesh,
    rafts,
    instanceCount: total,
    rider(s, lat, strength) {
      rider.s = s;
      rider.lat = lat;
      rider.target = strength;
      rider.fed = true;
    },
    qaRafts: () => ({ visible: rafts.visible, puffs: nRaft, shown, clumps: qa.slice() }),
    update(time, dt, focusS, outro = 0) {
      berm.uniforms.uTime.value = time;
      (berm.uniforms.uOutro.value as THREE.Vector2).x = outro;
      const s08 = course.stage('08').s0;
      puff.uniforms.uTime.value = time;
      for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        c.mesh.visible = c.sb > focusS - 12 && c.sa < focusS + 130 && !(outro > 0.3 && c.sb > s08 + 8);
        if (c.mesh.visible) c.mesh.geometry = c.sb > focusS - 12 && c.sa < focusS + 30 ? geoHi : geoLo;
      }
      // rotate whirlpool foam about the basin axis with the swirl (θ decreasing = course direction)
      whirlGroup.rotation.y = -time * 0.45 * ((Math.PI * 2) / 3);
      void whirlStart;
      updateRafts(time, dt, focusS, outro);
    },
  };
}
