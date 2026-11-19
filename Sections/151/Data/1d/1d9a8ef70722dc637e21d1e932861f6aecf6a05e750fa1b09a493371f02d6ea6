/**
 * Foam banks along the stream (refs 03–10) + whirlpool rim foam.
 *  - berm: ONE continuous lumpy lather bank per side, swept along the course (custom shader:
 *    two-scale cellular soap bubbles with derivative bump lighting, lavender crevices, pores,
 *    faint iridescent rim). This is what makes the banks read as continuous foam, not cotton balls.
 *  - puffs: instanced bubble puffs sitting ON the berm crest (silhouette lumps), in ~40-unit chunks
 *    so only chunks near Benny are drawn; quality 'low' halves density and uses 20-tri puffs.
 *  - foam rings on the whirlpool rim and along its spiral bands (rotating with the swirl)
 *  - flank banks (05, wave 4): one CONTINUOUS cloud bank per side that continues the berm down both
 *    sides of the frame to Benny's level (ref 05: banks hugging BOTH edges y≈540–1300): a lather sheet
 *    (berm shader, 1 draw) + world-anchored instanced puffs (1 draw), fitted to the frame edges from
 *    the camera each frame. Replaces wave 3's floating "flank"/"wake" raft clumps, which read as round
 *    islands on open water. Fixed pools, no per-frame allocation.
 */
import * as THREE from 'three';
import { type Course, WORLD, funnelY } from '../world/course';
import { EDGE_LIFT, coreLateral } from './waterRibbon';
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

/**
 * 05 flank-bank bubble: a camera-facing sphere IMPOSTOR (2 triangles) shaded like the soap puffs
 * (white-lavender lit top, lavender underside, soap-film rim that reads as the crevice between piled
 * bubbles, a few pores, a glint). instanceColor = (ambient occlusion, seed, tint) as for the puffs.
 * The quad is pushed to the sphere's front so the lather apron and neighbours cut it like a sphere.
 */
const BANK_BUB_VERT = /* glsl */ `
varying vec2 vP;
varying vec3 vInst;
#include <fog_pars_vertex>
void main() {
  vec4 c = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float r = length((instanceMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
  vec4 mvPosition = viewMatrix * c;
  mvPosition.xyz += normalize(-mvPosition.xyz) * r * 0.6;
  mvPosition.xy += position.xy * r;
  vP = position.xy;
  vInst = instanceColor;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;
const BANK_BUB_FRAG = /* glsl */ `
uniform vec3 uLightDir;
uniform float uTime;
varying vec2 vP;
varying vec3 vInst;
#include <fog_pars_fragment>
${NOISE_GLSL}
void main() {
  float d2 = dot(vP, vP);
  if (d2 > 1.0) discard;
  float z = sqrt(1.0 - d2);
  vec3 Nv = vec3(vP, z);
  vec3 N = normalize((vec4(Nv, 0.0) * viewMatrix).xyz);   // view → world (rotation transpose)
  vec3 L = normalize(uLightDir);
  float wrap = clamp(dot(N, L) * 0.55 + 0.5, 0.0, 1.0);
  float upF = clamp(N.y * 0.5 + 0.5, 0.0, 1.0);
  float lit = smoothstep(0.15, 0.85, wrap * 0.6 + upF * 0.4);
  vec3 lav = vec3(0.5, 0.47, 0.9);
  vec3 top = mix(vec3(1.1, 1.05, 1.16), vec3(1.04, 1.07, 1.16), clamp(vInst.z, 0.0, 1.0));
  top = mix(top, vec3(1.12, 1.03, 1.13), clamp(-vInst.z, 0.0, 1.0));
  vec3 col = mix(lav, top, lit);
  // pores: one or two small open bubbles on the larger puffs
  vec2 pc = vP * 2.2 + vInst.y * 17.0;
  float cp = cells(pc);
  float kp = 1.0 - smoothstep(0.25, 0.5, fwidth(pc.x) * 2.0);
  col = mix(col, lav * 0.95, (1.0 - smoothstep(0.1, 0.2, cp)) * step(0.7, hash12(floor(pc) + vInst.y * 31.0)) * kp * 0.55 * lit);
  // soap-film rim: lavender with a hint of pink, darkest right at the silhouette (crevices in a pile)
  float fres = pow(1.0 - z, 1.8);
  col = mix(col, vec3(0.74, 0.62, 0.98), fres * 0.55);
  vec3 Lv = (viewMatrix * vec4(L, 0.0)).xyz;
  float spec = pow(max(dot(reflect(vec3(0.0, 0.0, -1.0), Nv), Lv), 0.0), 24.0);
  col += vec3(1.0) * spec * 0.32;
  col *= mix(0.7, 1.0, vInst.x);
  gl_FragColor = vec4(col, 1.0);
  ${FRAG_TAIL}
}
`;

function makeBankBubbleMaterial() {
  const uniforms = withFog({
    uTime: { value: 0 },
    uLightDir: { value: new THREE.Vector3(0.3, 1.0, 0.45).normalize() },
  });
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: BANK_BUB_VERT, fragmentShader: BANK_BUB_FRAG, fog: true });
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
  /** 05 flank-bank puffs (instanced, on top of `flank`) */
  rafts: THREE.InstancedMesh;
  /** 05 flank-bank lather sheet (shares the berm material) */
  flank: THREE.Mesh;
  /** Benny's waterline position on the course (call from water.wake() each riding frame) */
  rider(s: number, lat: number, strength: number): void;
  /** camera: needed in 05, where the flank banks are fitted to the frame edges */
  update(time: number, dt: number, focusS: number, outro?: number, camera?: THREE.Camera): void;
  /** QA: current flank-bank placement (kind L/R, row ds, inner-edge lateral, bank width) */
  qaRafts(): { visible: boolean; puffs: number; shown: number; clumps: { kind: string; ds: number; lat: number; k: number }[] };
  instanceCount: number;
}

// ---------------------------------------------------------------------------------- flank banks (05)
/**
 * In 05 the stream fills the tube floor wall to wall (S05.extent), so from the locked chase camera the
 * real stream edges and their berm leave the frame below y≈800 and the near field shows only open water.
 * Ref 05 has white cloud banks hugging BOTH sides all the way down to Benny's level (left x≈0–330 over
 * y≈540–1300, right x≈560–864). Wave 4: one continuous bank per side, fitted to the frame edges each
 * frame from the camera (so it holds for any device aspect), not floating islands:
 *  - a lather sheet (berm shader) from just below the frame bottom (ds −3.4) up the side of the frame
 *    until it merges into the berm (ds +15); its inner edge sits BANK_PX px in from the frame edge
 *    (lumpy, slow noise along s) and dips just under the water so the stream cuts a natural waterline;
 *  - instanced puffs (rim, crest, heaps) anchored to world cells along s, so the bank stays put on the
 *    water like the berm and Benny rides past it; they give the lumpy cloud silhouette.
 * Never closer than BANK_CLEAR_RIDER to Benny (near him) or BANK_CLEAR_CORE to the cyan core / coin line.
 */
const BANK_DS0 = -3.4;
const BANK_DS1 = 15;
/** puffs stop here (further ahead the berm and its own puffs take over) */
const BANK_PUFF_DS1 = 12.5;
/** inner edge of the bank: px in from the frame edge (fraction of an 864-px wide frame) */
const BANK_PX: [number, number] = [60, 155];
const BANK_CLEAR_RIDER = 1.3;
const BANK_CLEAR_CORE = 1.45;

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

  // ---- 05 flank banks: lather sheet + world-anchored bubble puffs fitted to the frame edges ----
  const st05 = course.stage('05');
  const sm = (a: number, b: number, x: number) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  const R = quality === 'high' ? 40 : 22; // sheet rows per side
  const C = quality === 'high' ? 7 : 5; // sheet columns (inner edge → beyond the frame edge)
  const bankPos = new Float32Array(2 * R * C * 3);
  const bankFoam = new Float32Array(2 * R * C * 3);
  const bankIdx: number[] = [];
  for (let sd = 0; sd < 2; sd++) {
    for (let i = 0; i < R - 1; i++) {
      for (let j = 0; j < C - 1; j++) {
        const a = (sd * R + i) * C + j, b = a + 1, c = a + C, d = c + 1;
        quadIdx(bankIdx, sd, a, b, c, d);
      }
    }
  }
  const bankGeo = new THREE.BufferGeometry();
  bankGeo.setAttribute('position', new THREE.BufferAttribute(bankPos, 3).setUsage(THREE.DynamicDrawUsage));
  bankGeo.setAttribute('aFoam', new THREE.BufferAttribute(bankFoam, 3).setUsage(THREE.DynamicDrawUsage));
  bankGeo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(2 * R * C * 3), 3).setUsage(THREE.DynamicDrawUsage));
  bankGeo.setIndex(bankIdx);
  const flank = new THREE.Mesh(bankGeo, berm.mesh.material);
  flank.name = 'foam_flank';
  flank.frustumCulled = false;
  flank.visible = false;
  group.add(flank);
  /** row data per side (signed laterals + water heights at both bank borders), for the puffs between rows */
  const rowDs = new Float32Array(R);
  for (let i = 0; i < R; i++) rowDs[i] = BANK_DS0 + (BANK_DS1 - BANK_DS0) * Math.pow(i / (R - 1), 1.5);
  const rowIn = [new Float32Array(R), new Float32Array(R)];
  const rowOut = [new Float32Array(R), new Float32Array(R)];
  const rowHIn = [new Float32Array(R), new Float32Array(R)];
  const rowHOut = [new Float32Array(R), new Float32Array(R)];
  /** 0..1 lumpiness of the flank bank (inner-edge width): slow, so the edge never zig-zags between rows */
  const bankLump = (s: number, side: number) => 0.7 * noise1(s * 0.5 + side * 17.3) + 0.3 * noise1(s * 1.15 + side * 5.1);
  /** lather apron height above the water: f = 0 inner edge (just under the water) … 1 outer */
  const bankProf = (f: number, s: number, side: number) => {
    const top = 0.035 + 0.05 * noise1(s * 1.4 + side * 9.1 + 40);
    const u = Math.min(1, f / 0.3);
    return -0.05 + (0.05 + top) * (1 - (1 - u) * (1 - u));
  };

  // bubble puffs: camera-facing sphere impostors (2 triangles each), CELL-spaced world cells along s,
  // P puffs per cell, a ring buffer of NC cells per side
  const CELL = quality === 'high' ? 0.16 : 0.3;
  const P = quality === 'high' ? 6 : 4;
  const NC = Math.ceil((BANK_PUFF_DS1 - BANK_DS0) / CELL) + 3;
  const nRaft = 2 * NC * P;
  const rr = rng(4242);
  const bub = makeBankBubbleMaterial();
  const rafts = new THREE.InstancedMesh(new THREE.PlaneGeometry(2, 2), bub.mat, nRaft);
  rafts.name = 'foam_rafts';
  rafts.frustumCulled = false;
  rafts.renderOrder = 1;
  for (let i = 0; i < nRaft; i++) {
    const kind = i % P; // 0–1 rim, 2–3 body, 4 heap, 5 outer
    rafts.setColorAt(i, tmpC.setRGB(kind < 2 ? 0.86 + 0.1 * rr() : 0.8 + 0.2 * rr(), rr(), rr() * 2 - 1));
    rafts.setMatrixAt(i, tmpM.makeScale(0, 0, 0));
  }
  if (rafts.instanceColor) rafts.instanceColor.needsUpdate = true;
  rafts.visible = false;
  group.add(rafts);
  total += nRaft;
  /** per puff kind: across range [f0, f0 + df], radius [r0, r0 + dr], lift (× r above the apron), probability */
  const KIND: [number, number, number, number, number, number][] = quality === 'high'
    ? [[0.0, 0.08, 0.04, 0.045, 0.1, 1], [0.04, 0.12, 0.05, 0.04, 0.2, 1], [0.12, 0.5, 0.06, 0.06, 0.35, 1], [0.2, 0.55, 0.065, 0.06, 0.35, 1], [0.15, 0.5, 0.1, 0.06, 0.5, 0.6], [0.6, 0.4, 0.07, 0.05, 0.3, 1]]
    : [[0.0, 0.1, 0.045, 0.05, 0.15, 1], [0.12, 0.5, 0.065, 0.06, 0.35, 1], [0.15, 0.5, 0.1, 0.06, 0.5, 0.7], [0.55, 0.45, 0.07, 0.05, 0.3, 1]];

  const rider = { s: 0, lat: 0, str: 0, target: 0, fed: false };
  const fr = { s: 0, pos: new THREE.Vector3(), tan: new THREE.Vector3(), up: new THREE.Vector3(), right: new THREE.Vector3() };
  const pP = new THREE.Vector3();
  const pv = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  const qa: { kind: string; ds: number; lat: number; k: number }[] = [];
  let shown = 0;
  let hBase = 0;
  /** NDC x of the water point at `lat` on the current row frame `fr` */
  const ndcX = (cam: THREE.Camera, lat: number) => pv.copy(fr.pos).addScaledVector(fr.right, lat).addScaledVector(fr.up, hBase).project(cam).x;
  /** lateral on the current row whose water point projects to NDC x = target (secant; the map is ~linear) */
  const solveLat = (cam: THREE.Camera, target: number, l0: number, l1: number) => {
    let x0 = ndcX(cam, l0) - target, x1 = ndcX(cam, l1) - target;
    for (let it = 0; it < 5 && Math.abs(x1) > 1e-4; it++) {
      const d = x1 - x0;
      if (Math.abs(d) < 1e-7) break;
      const l2 = Math.max(-14, Math.min(14, l1 - (x1 * (l1 - l0)) / d));
      l0 = l1; x0 = x1;
      l1 = l2; x1 = ndcX(cam, l1) - target;
    }
    return l1;
  };
  const hideRafts = () => {
    for (let i = 0; i < nRaft; i++) rafts.setMatrixAt(i, tmpM.makeScale(0, 0, 0));
    rafts.instanceMatrix.needsUpdate = true;
  };

  const updateRafts = (time: number, dt: number, focusS: number, outro: number, camera?: THREE.Camera) => {
    if (!rider.fed) rider.target = 0;
    rider.fed = false;
    rider.str = dt > 0 ? rider.str + (rider.target - rider.str) * Math.min(1, dt * 4) : rider.target;
    const w = sm(st05.s0 + 2, st05.s0 + 7, focusS) * (1 - sm(st05.s1 - 7, st05.s1 - 2, focusS)) * rider.str * (1 - outro);
    qa.length = 0;
    shown = 0;
    const cam = camera as THREE.PerspectiveCamera | undefined;
    const on = w > 0.01 && !!cam && cam.isPerspectiveCamera;
    if (!on) {
      if (rafts.visible) hideRafts();
      rafts.visible = false;
      flank.visible = false;
      return;
    }
    rafts.visible = true;
    flank.visible = true;
    bub.uniforms.uTime.value = time;
    cam.updateMatrixWorld();
    cam.getWorldPosition(camPos);
    const frac0 = (2 * BANK_PX[0]) / 864, frac1 = (2 * BANK_PX[1]) / 864;
    // ---- lather apron rows ----
    let k = 0;
    for (let sd = 0; sd < 2; sd++) {
      const side = sd === 0 ? -1 : 1;
      for (let i = 0; i < R; i++) {
        const ds = rowDs[i];
        const s = Math.min(s1, Math.max(s0, rider.s + ds));
        course.sample(s, fr);
        const hw = course.widthAt(s) / 2;
        hBase = heightAt(s, side * 2.5, time);
        const camLat = pv.copy(camPos).sub(fr.pos).dot(fr.right);
        const lump = bankLump(s, side);
        const edge = solveLat(cam, side, camLat + side * 1.5, camLat + side * 3);
        const inner = solveLat(cam, side * (1 - (frac0 + (frac1 - frac0) * lump)), camLat + side * 1.0, edge);
        // keep clear of Benny (near him) and of the cyan core / coin line; merge into the berm at the edge
        const clearR = BANK_CLEAR_RIDER * (1 - sm(2.5, 4.5, Math.abs(ds)));
        let a = Math.max(side * inner, side * rider.lat + clearR, side * coreLateral(course, s) + BANK_CLEAR_CORE);
        a = Math.min(a, hw - 0.3);
        const outA = Math.max(a + 0.12, Math.min(side * edge + 0.55, hw + 0.15));
        // fade in/out (stage entry/exit): the bank narrows towards the frame edge instead of sinking
        a = outA - (outA - a) * w;
        rowIn[sd][i] = side * a;
        rowOut[sd][i] = side * outA;
        const hIn = heightAt(s, side * a, time), hOut = heightAt(s, side * outA, time);
        rowHIn[sd][i] = hIn;
        rowHOut[sd][i] = hOut;
        if (qa.length < 64 && i % 4 === 0) qa.push({ kind: side < 0 ? 'L' : 'R', ds: +ds.toFixed(2), lat: +(side * a).toFixed(2), k: +(outA - a).toFixed(2) });
        for (let j = 0; j < C; j++) {
          const f = Math.pow(j / (C - 1), 0.85);
          // the apron starts a little outside the bank's inner edge: its lip hides behind the rim bubbles
          const lat = side * (a + Math.min(0.1, (outA - a) * 0.3) + (outA - a - Math.min(0.1, (outA - a) * 0.3)) * f);
          const h = hIn + (hOut - hIn) * f + bankProf(f, s, side);
          pP.copy(fr.pos).addScaledVector(fr.right, lat).addScaledVector(fr.up, h);
          pP.toArray(bankPos, k * 3);
          // berm-shader coordinates (e across, s along) at twice the berm's density: the near-field
          // bank is seen ≈5× closer than the berm, so its soap cells must be smaller
          bankFoam[k * 3] = 2 * ((f - 0.3) * (outA - a));
          bankFoam[k * 3 + 1] = 2 * s;
          bankFoam[k * 3 + 2] = side;
          k++;
        }
      }
    }
    bankGeo.attributes.position.needsUpdate = true;
    bankGeo.attributes.aFoam.needsUpdate = true;
    bankGeo.computeVertexNormals();
    // ---- bubble puffs piled on the apron (world cells along s: the bank stays put, Benny rides past) ----
    const j0 = Math.floor((rider.s + BANK_DS0) / CELL);
    for (let sd = 0; sd < 2; sd++) {
      const side = sd === 0 ? -1 : 1;
      for (let c = 0; c < NC; c++) {
        const j = j0 + c;
        const slot = ((j % NC) + NC) % NC;
        const hh = (q: number) => hash1(j * 7.13 + side * 3.7 + q * 1.31);
        const sC = (j + 0.5 + (hh(0) - 0.5) * 0.7) * CELL;
        const ds = sC - rider.s;
        const base = (sd * NC + slot) * P;
        const kFade = w * (1 - sm(BANK_PUFF_DS1 - 1.5, BANK_PUFF_DS1, ds)) * sm(BANK_DS0, BANK_DS0 + 0.3, ds);
        if (kFade < 0.02 || sC < s0 || sC > s1) {
          for (let p = 0; p < P; p++) rafts.setMatrixAt(base + p, tmpM.makeScale(0, 0, 0));
          continue;
        }
        // interpolate the bank rows at this ds
        const t = Math.pow(Math.min(1, Math.max(0, (ds - BANK_DS0) / (BANK_DS1 - BANK_DS0))), 1 / 1.5) * (R - 1);
        const ri = Math.min(R - 2, Math.floor(t)), rf = t - ri;
        const L = (A: Float32Array) => A[ri] + (A[ri + 1] - A[ri]) * rf;
        const lin = L(rowIn[sd]), lout = L(rowOut[sd]), hin = L(rowHIn[sd]), hout = L(rowHOut[sd]);
        const wid = Math.abs(lout - lin);
        course.sample(sC, fr);
        // bubbles grow with distance so their on-screen size stays ≈10–45 px (ref 05 bank texture)
        const scale = Math.min(2.0, 0.9 + 0.1 * Math.max(0, ds)) * kFade * Math.min(1, wid / 0.3);
        for (let p = 0; p < P; p++) {
          const [f0, df, r0, dr, lift, prob] = KIND[p];
          if (hh(10 + p) > prob) { rafts.setMatrixAt(base + p, tmpM.makeScale(0, 0, 0)); continue; }
          const f = Math.min(1, f0 + df * hh(20 + p));
          const r = (r0 + dr * hh(30 + p)) * scale;
          if (r < 0.004) { rafts.setMatrixAt(base + p, tmpM.makeScale(0, 0, 0)); continue; }
          const lat = lin + (lout - lin) * f;
          const h = hin + (hout - hin) * f + bankProf(f, sC, side) + r * lift;
          pP.copy(fr.pos).addScaledVector(fr.right, lat).addScaledVector(fr.up, h).addScaledVector(fr.tan, (hh(40 + p) - 0.5) * CELL);
          tmpM.makeScale(r, r, r).setPosition(pP);
          rafts.setMatrixAt(base + p, tmpM);
          shown++;
        }
      }
    }
    rafts.instanceMatrix.needsUpdate = true;
  };

  return {
    group,
    whirlGroup,
    berm: berm.mesh,
    rafts,
    flank,
    instanceCount: total,
    rider(s, lat, strength) {
      rider.s = s;
      rider.lat = lat;
      rider.target = strength;
      rider.fed = true;
    },
    qaRafts: () => ({ visible: rafts.visible, puffs: nRaft, shown, clumps: qa.slice() }),
    update(time, dt, focusS, outro = 0, camera) {
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
      updateRafts(time, dt, focusS, outro, camera);
    },
  };
}

/** two triangles of a bank quad, wound CCW seen from above on both sides */
function quadIdx(out: number[], sideIndex: number, a: number, b: number, c: number, d: number) {
  if (sideIndex === 1) out.push(a, b, c, b, d, c);
  else out.push(a, c, b, b, c, d);
}
