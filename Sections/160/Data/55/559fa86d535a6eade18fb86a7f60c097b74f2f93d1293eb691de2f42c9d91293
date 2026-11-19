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
interface Puff { p: THREE.Vector3; r: number; ao: number; tint: number; w5?: number; imp?: boolean }

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

/**
 * wave 7: ref 05 soap colour ramp t = 0..1: blue-violet crevice -> blue -> periwinkle -> lavender-white -> white
 * top cap. Stops = the ref 05 rim foam at its 5/20/50/70/90th luminance percentiles ((107,101,234) (117,143,247)
 * (171,184,250) (216,212,251) (250,243,254)) inverted through the display pipeline (Neutral tone map x0.86 ->
 * sRGB -> grade sat 1.36 / contrast 1.15; qa/pilot05/wave6/foam/tools/pipe.py). Only t > 0.8 reaches white.
 * `soapT` = the shared view-space lighting (top-lit from the upper left, like the ref bubbles).
 */
const SOAP05_GLSL = /* glsl */ `
const vec3 SOAP_CREV = vec3(0.23, 0.22, 0.66);
vec3 soap05(float t) {
  t = clamp(t, 0.0, 1.0) * 5.0;
  vec3 c = mix(SOAP_CREV, vec3(0.26, 0.38, 0.84), clamp(t, 0.0, 1.0));
  c = mix(c, vec3(0.38, 0.54, 0.97), clamp(t - 1.0, 0.0, 1.0));
  c = mix(c, vec3(0.56, 0.63, 0.96), clamp(t - 2.0, 0.0, 1.0));
  c = mix(c, vec3(0.78, 0.79, 0.98), clamp(t - 3.0, 0.0, 1.0));
  return mix(c, vec3(1.05, 1.03, 1.08), clamp(t - 4.0, 0.0, 1.0));
}
float soapT(vec3 Nv) {
  vec3 Lv = normalize(vec3(-0.35, 0.8, 0.5));
  float wrap = clamp(dot(Nv, Lv) * 0.55 + 0.5, 0.0, 1.0);
  float up = clamp(Nv.y * 0.5 + 0.5, 0.0, 1.0);
  return smoothstep(0.1, 0.8, wrap * 0.6 + up * 0.4);
}
`;

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
uniform vec4 uSt05;      // wave 7: 05 soap shading weight ramps in s0..s1, out s2..s3 (= bermScale05)
varying vec3 vFoam;
varying vec3 vPosW;
varying vec3 vNormalW;
#include <fog_pars_fragment>
${NOISE_GLSL}
${FRAG_FX_GLSL}
${SOAP05_GLSL}
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
  col *= 0.96;
  // 05 (wave 7): the low rim under the puffs reads as small piled soap bubbles: white only on the cell
  // tops, periwinkle bodies, blue-violet crevices between the cells (ref 05 rim)
  float k05 = smoothstep(uSt05.x, uSt05.y, s) * (1.0 - smoothstep(uSt05.z, uSt05.w, s));
  // 05: the bank stops just past its bubble crest with a scalloped (cell) edge, so the purple wall shows right above
  // the rim instead of a pale lather slope (ref 05; e is the raw offset outward from the stream edge)
  if (vFoam.x > mix(9.0, 0.3 + 0.45 * (1.0 - c1), k05)) discard;
  if (k05 > 0.0) {
    vec3 Nv = normalize((viewMatrix * vec4(N, 0.0)).xyz);
    float t5 = soapT(Nv) * 0.55 + 0.45 * mix(0.55, bub, max(k1, 0.3)) - 0.1;
    t5 -= smoothstep(0.55, 0.95, c1) * 0.45 * k1 + smoothstep(0.62, 0.95, c2) * 0.25 * k2;
    vec3 c5 = soap05(t5);
    #ifndef LOW_Q
    c5 = mix(c5, SOAP_CREV, (1.0 - smoothstep(0.1, 0.2, pc)) * step(0.62, hash12(floor(pp))) * 0.7 * kp);
    #endif
    c5 += vec3(1.0) * spec * 0.3;
    col = mix(col, c5, k05);
  }
  gl_FragColor = vec4(col, 1.0);
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
varying float vW5;
#include <fog_pars_vertex>
void main() {
  // instanceColor.x = ao + 2 q, q = 0..8 = the 05 soap-shading weight x 8 (wave 7; ao <= 1 so floor(x / 2) = q)
  float q5 = floor(instanceColor.x * 0.5);
  vInst = vec3(instanceColor.x - 2.0 * q5, instanceColor.yz);
  vW5 = q5 / 8.0;
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
varying float vW5;
#include <fog_pars_fragment>
${NOISE_GLSL}
${SOAP05_GLSL}
void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 L = normalize(uLightDir);
  float wrap = clamp(dot(N, L) * 0.55 + 0.5, 0.0, 1.0);
  float upF = clamp(N.y * 0.5 + 0.5, 0.0, 1.0);
  float lit = smoothstep(0.18, 0.88, wrap * 0.65 + upF * 0.35);
  vec3 c5 = vec3(0.0);
  if (vW5 > 0.0) {
    // 05 (wave 7): ref soap ramp, view-space top light: white caps, periwinkle bodies, blue crevice rims
    vec3 Nv = normalize((viewMatrix * vec4(N, 0.0)).xyz);
    float z = clamp(Nv.z, 0.0, 1.0);
    float t5 = soapT(Nv) - pow(1.0 - z, 1.5) * (0.3 + 0.45 * clamp(0.5 - Nv.y * 0.7, 0.0, 1.0)) - (1.0 - vInst.x) * 0.35;
    c5 = soap05(t5 + 0.04 * vInst.z);
    #ifndef LOW_Q
    vec3 an5 = abs(vLocal);
    vec2 pc5 = (an5.x > an5.z ? vLocal.zy : vLocal.xy) * 2.6 + vInst.y * 17.0;
    float kp5 = 1.0 - smoothstep(0.2, 0.45, fwidth(pc5.x) + fwidth(pc5.y));
    c5 = mix(c5, SOAP_CREV, (1.0 - smoothstep(0.1, 0.2, cells(pc5))) * step(0.6, hash12(floor(pc5) + vInst.y * 31.0)) * kp5 * 0.5);
    #endif
    c5 += vec3(1.0) * pow(max(dot(reflect(-V, N), L), 0.0), 26.0) * 0.25;
  }
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
  col = mix(col, c5, vW5);
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
/**
 * wave 8: fine soap-foam micro texture (ref 05 lumps: the lit tops are smooth lavender-white, the lower half and the
 * flanks are packed with tiny open bubbles = blue holes with a lit lower-right lip, and a few glossy specks).
 * p in cells; dens 0..1 = share of cells that are open bubbles. Returns (hole, lip, dome = cell interior, speck).
 */
const MICRO_GLSL = /* glsl */ `
vec4 microFoam(vec2 p, float dens) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float d1 = 8.0, d2 = 8.0;
  vec2 r1 = vec2(0.0), h1 = vec2(0.0);
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = vec2(hash12(i + g), hash12(i + g + 19.7));
    vec2 r = g + o - f;
    float dd = dot(r, r);
    if (dd < d1) { d2 = d1; d1 = dd; r1 = r; h1 = vec2(hash12(i + g + 7.3), hash12(i + g + 3.1)); }
    else if (dd < d2) d2 = dd;
  }
  d1 = sqrt(d1); d2 = sqrt(d2);
  float rad = 0.14 + 0.15 * h1.x;
  float on = step(h1.y, dens);
  vec2 dir = -r1 / max(d1, 1e-4);
  float hole = (1.0 - smoothstep(rad * 0.68, rad, d1)) * on;
  float ring = smoothstep(rad * 0.7, rad, d1) * (1.0 - smoothstep(rad, rad * 1.55, d1));
  float lip = ring * on * clamp(dot(dir, vec2(0.6, -0.8)) * 0.7 + 0.45, 0.0, 1.0);
  float dome = smoothstep(0.0, 0.32, d2 - d1);
  float speck = (1.0 - smoothstep(0.03, 0.08, length(-r1 - vec2(-0.13, 0.15)))) * (1.0 - on) * step(0.55, h1.x);
  return vec4(hole, lip, dome, speck);
}
`;

const BANK_BUB_VERT = /* glsl */ `
varying vec2 vP;
varying vec3 vInst;
varying float vBig;
varying vec3 vCv;
varying float vR;
#include <fog_pars_vertex>
void main() {
  vec4 c = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float r = length((instanceMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
  vec4 mvPosition = viewMatrix * c;
  vCv = mvPosition.xyz;
  vR = r;
  // wave 7: 0 for bubbles <= ~18 px, 1 for >= ~40 px on screen (the ref's big near bumps show large white caps)
  vBig = smoothstep(0.012, 0.026, projectionMatrix[1][1] * r / max(-mvPosition.z, 0.01));
  mvPosition.xyz += normalize(-mvPosition.xyz) * r * 0.6;
  mvPosition.xy += position.xy * r;
  vP = position.xy;
  vInst = instanceColor;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;
/**
 * wave 8 (05 only: rafts + the 05 berm puffs): one foam lump = a sphere impostor with the true per-pixel sphere depth,
 * so lumps sink into the water and into each other with curved creases (a merged low foam mound, not stacked discs);
 * the lower outline of larger lumps is scalloped by small piled bubbles; the micro texture packs tiny open bubbles on
 * the lower half / flanks; bubbles under ~14 px render as glossy little soap bubbles with a thin blue rim.
 */
const BANK_BUB_FRAG = /* glsl */ `
uniform mat4 projectionMatrix;
uniform vec3 uLightDir;
uniform float uTime;
varying vec2 vP;
varying vec3 vInst;
varying float vBig;
varying vec3 vCv;
varying float vR;
#include <fog_pars_fragment>
${NOISE_GLSL}
${SOAP05_GLSL}
${MICRO_GLSL}
// wave 9: ref 05 clump ramp. The soap05 stops rendered the clumps grey-blue (G > R: mid third #DCE2F7, dark #B4BEFC, top
// #EEEAF6); the ref clumps are violet-lavender (mid #E8D7FF, dark #B3ABFA) with near-white caps (#FDFBFF)
vec3 bank05(float t) {
  t = clamp(t, 0.0, 1.0) * 4.0;
  vec3 c = mix(vec3(0.25, 0.2, 0.72), vec3(0.44, 0.38, 0.93), clamp(t, 0.0, 1.0));
  c = mix(c, vec3(0.6, 0.5, 0.98), clamp(t - 1.0, 0.0, 1.0));
  c = mix(c, vec3(0.86, 0.71, 1.02), clamp(t - 2.0, 0.0, 1.0));
  return mix(c, vec3(1.3, 1.25, 1.32), clamp(t - 3.0, 0.0, 1.0));
}
void main() {
  float px = 2.0 / max(fwidth(vP.x), 1e-4);
  float d = length(vP);
  float ang = atan(vP.y, vP.x);
  float nS = clamp(floor(px / 8.0), 5.0, 16.0);
  float sc = abs(sin(ang * nS * 0.5 + vInst.y * 31.0));
  float amp = 0.11 * smoothstep(16.0, 34.0, px) * smoothstep(0.45, -0.35, vP.y / max(d, 1e-3));
  float R = 1.0 - amp * (1.0 - sc);
  if (d > R) discard;
  vec2 q = vP / R;
  float z = sqrt(max(1.0 - dot(q, q), 0.0));
  vec3 Nv = vec3(q, z);
  vec4 clip = projectionMatrix * vec4(vCv + vR * vec3(vP, z * R), 1.0);
  gl_FragDepth = 0.5 * clip.z / clip.w + 0.5;
  // wave 7 ramp: white top caps, lavender-white bodies, periwinkle / blue undersides; lower / side silhouette = the
  // blue-violet crevice between piled bubbles; inner / lower bubbles of a pile (ambient occlusion vInst.x) bluer
  // wave 8: steeper key light from the upper left (ref lumps: white caps only on the lit top, lavender middle, blue lower
  // half); soapT put a sphere's centre at t ~0.86 (near white), so the clumps read grey-white
  float tl = dot(Nv, normalize(vec3(-0.4, 0.85, 0.35)));
  // wave 9: soft cloud lumps (ref): bright upper silhouette, the rim darkens only on the lower half (crease to the next
  // lump / the water), front faces lifted so the lump centres read pale lavender, not grey
  float t = 0.56 + 0.58 * tl + 0.12 * z - pow(1.0 - z, 1.5) * (0.06 + 0.42 * clamp(0.35 - q.y * 0.8, 0.0, 1.0)) - (1.0 - vInst.x) * 0.3 + 0.06 * vBig;
  // fine open bubbles: dense on the lower half and the flanks, (almost) none on the lit top
  vec2 mp = q * (1.0 + 0.6 * (1.0 - z)) * clamp(px / 7.0, 1.2, 14.0) + vInst.y * 37.0;
  float dens = clamp(0.04 + 0.95 * smoothstep(0.15, -0.65, q.y) + 0.25 * (1.0 - z) - 0.2 * vBig, 0.0, 0.95);
  vec4 mf = microFoam(mp, dens);
  float kf = 1.0 - smoothstep(0.5, 0.9, fwidth(mp.x) + fwidth(mp.y));
  // wave 8 (it04): tone S-curve: few grey mid-tones, a broad white-lavender lit area and clearly blue shading
  // it05: the shading boundary sits higher (it04's 0.2..0.9 curve turned 50 % of the clump px pure white)
  // it06: boundary lower again (it05 clump boxes W 27-59 %, ref 22-28 %), no white bonus for big lumps
  t = 0.12 + 0.95 * smoothstep(0.38, 1.12, t - 0.06 * vBig);
  t += (mf.z - 0.6) * 0.16 * dens * kf - mf.x * 0.6 * kf + mf.y * 0.22 * kf;
  vec3 col = bank05(t + 0.04 * vInst.z);
  col += vec3(1.0) * mf.w * 0.4 * kf;
  vec3 Lv = (viewMatrix * vec4(normalize(uLightDir), 0.0)).xyz;
  float rl = max(dot(reflect(vec3(0.0, 0.0, -1.0), Nv), Lv), 0.0);
  col += vec3(1.0) * (pow(rl, 24.0) * 0.25 + pow(rl, 6.0) * 0.1);
  // tiny bubbles: lavender-white glossy body, thin blue rim, white speck (the lace at the ref waterlines)
  float tiny = 1.0 - smoothstep(9.0, 16.0, px);
  vec2 qs = vP - vec2(-0.32, 0.34);
  vec3 cb = mix(bank05(0.8 + 0.1 * vInst.z), bank05(0.15), smoothstep(0.5, 0.95, d)) + vec3(1.0) * exp(-dot(qs, qs) * 14.0) * 0.55;
  col = mix(col, cb, tiny);
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
  /** wave 8: 05 berm puffs + rim bubbles as fine-foam impostors */
  rim05: THREE.InstancedMesh;
  /** 05 flank-bank lather sheet (shares the berm material) */
  flank: THREE.Mesh;
  /** Benny's waterline position on the course (call from water.wake() each riding frame) */
  rider(s: number, lat: number, strength: number): void;
  /** camera: needed in 05, where the flank banks are fitted to the frame edges */
  update(time: number, dt: number, focusS: number, outro?: number, camera?: THREE.Camera): void;
  /** QA: current flank-bank placement (kind L/R, row ds, inner-edge lateral, bank width) */
  qaRafts(): { visible: boolean; puffs: number; shown: number; clumps: { kind: string; ds: number; lat: number; k: number; y?: number; x?: number; env?: number; s?: number }[] };
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
/** inner edge of a clump at its widest: px in from the frame edge (of an 864-px wide frame), L / R */
const BANK_PX: [number, number] = [170, 200];
/** lateral size of a clump (px): a clump whose inner edge lies further in than this floats off the frame
 * edge with water beyond it (ref 05 lower clumps x≈50–200 and 610–790) */
const CLUMP_PX = 135;
/**
 * The flank lather SHEET (berm shader) read as flat white paper with straight cut edges at the clump ends;
 * the ref clumps are piled bubbles only, so wave 5 hides it and the impostor bubbles carry the clumps.
 */
const FLANK_SHEET = false;
/**
 * Wave 5: world-anchored clump envelope per side, [seed, frequency along s, threshold]. The near-field bank is a
 * chain of separate LOW clumps with open water between them (ref 05: left clumps y≈1016–1108 and
 * 1202–1330, right y≈800–950 and 1217–1300), not a continuous strip up the frame edge (wave 4 read as
 * a white wall: the outer 40 px were foam on 74 % / 100 % of the rows y 700–1400). The seeds put the
 * clumps of the QA frame (s≈132.4) where the ref has them; along 05 clumps cover ≈40 % of the length.
 */
const BANK_ENV: [number, number, number][] = [[58.457, 0.835, 0.581], [607.242, 0.459, 0.357], [267.601, 1.094, 0.563]];
/**
 * wave 7 (ref 05 rows, qa/pilot05/wave7/foam): the bank row's inner edge (px in from the frame edge) and lateral size
 * (px) by row ds. The right bank ahead of Benny is a NARROW rim hugging the river edge (ref y 700-940: inner edge
 * 30 -> 158 -> 70 px, 20-66 px per row), not the wave-5 heap (124-179 px per row). The ref's near clumps: left x 0-130
 * y 1020-1110 (ds 0.5-1.5), lower left x 60-230 y 1220-1300 and lower right x 650-800 y 1260-1330 (behind Benny,
 * ds -1.1..-1.7). The envelope seeds
 * (BANK_ENV, searched; [2] = right side beside / behind Benny) open/close the clumps at those rows of the QA frame.
 */
const RIM_R: [number, number][] = [[2.6, 60], [3.4, 70], [4.4, 105], [5.5, 140], [6.6, 158], [7.8, 153], [9.0, 135], [10.3, 104], [11.6, 70], [12.9, 30]];
const RIM_R_PX = 80;
function rimR(ds: number): number {
  if (ds <= RIM_R[0][0]) return RIM_R[0][1];
  for (let i = 1; i < RIM_R.length; i++) {
    if (ds <= RIM_R[i][0]) {
      const [a, pa] = RIM_R[i - 1], [b, pb] = RIM_R[i];
      return pa + ((pb - pa) * (ds - a)) / (b - a);
    }
  }
  return RIM_R[RIM_R.length - 1][1];
}
const BANK_CLEAR_RIDER = 1.3;
const BANK_CLEAR_CORE = 1.45;
/** wave 9: the near wake bands (behind Benny) keep their outer border this many px in from the frame edge and end at
 * this ds (ref 05: they stop at the corner rings, x >= ~56 px, y <= ~1310) */
const V_EDGE_PX = 64;
const V_DS_END = -1.45;

/**
 * wave 5: 0.4 in 05 (smooth ramps at the stage ends), 1 elsewhere. In 05 the stream-edge rim toward the VP
 * is a LOW band of piled bubbles (ref ≈40–60 px); the full-height berm read as tall white heaps.
 */
function bermScale05(course: Course): (s: number) => number {
  const st = course.stage('05');
  const sm = (a: number, b: number, x: number) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
  return (s) => 1 - 0.6 * sm(st.s0 - 6, st.s0 - 1, s) * (1 - sm(st.s1 - 1, st.s1 + 4, s));
}
/** squash the part of the bank above the stream's edge water level by k (k = 1: unchanged) */
const squashBerm = (h: number, k: number) => (k < 1 && h > EDGE_LIFT ? EDGE_LIFT + (h - EDGE_LIFT) * k : h);

/** continuous lather bank along both stream edges (skips the 03 whirlpool interior) */
function createBerm(course: Course, s0: number, s1: number, skip: [number, number], quality: 'high' | 'low') {
  const hk = bermScale05(course);
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
        const k05 = hk(s);
        const h = squashBerm(bermSurface(s, e, side, hw), k05);
        // 05: the outer (dry) side is laterally compressed too, so the rim is a narrow band of bubbles
        const eS = e > 0 ? e * (0.1 + 0.9 * k05) : e;
        tmp.copy(f.pos).addScaledVector(f.right, side * (hw + eS)).addScaledVector(f.up, h);
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
  const st05 = course.stage('05');
  const uniforms = withFog({
    uTime: { value: 0 },
    uOutro: { value: new THREE.Vector2(0, course.stage('08').s0) },
    uLightDir: { value: new THREE.Vector3(0.3, 1.0, 0.45).normalize() },
    // colour starts at the 05 stage start (not s0 - 6 like the squash) so the 04 frame keeps its own foam colours
    uSt05: { value: new THREE.Vector4(st05.s0 - 1, st05.s0 + 2, st05.s1 - 1, st05.s1 + 4) },
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

  /** wave 8: the 05 berm puffs (Puff.imp) go to one impostor list (fine-foam shader, 2 tris each), see imp05 below */
  const imp05: { p: THREE.Vector3; r: number; c: [number, number, number] }[] = [];
  const build = (list: Puff[], parent: THREE.Object3D, sa: number, sb: number) => {
    if (!list.length) return;
    const nMesh = list.reduce((n, pf) => n + (pf.imp ? 0 : 1), 0);
    const mesh = nMesh ? new THREE.InstancedMesh(geoHi, mat, nMesh) : null;
    let i = 0;
    // the same rand() calls per puff whichever list it lands in, so every other stage's foam stays identical
    for (const pf of list) {
      tmpQ.setFromEuler(tmpE.set(rand() * 6, rand() * 6, rand() * 6));
      tmpS.set(pf.r, pf.r * (0.78 + rand() * 0.22), pf.r);
      const seed = rand();
      if (pf.imp) { imp05.push({ p: pf.p, r: pf.r, c: [pf.ao, seed, pf.tint] }); continue; }
      tmpM.compose(pf.p, tmpQ, tmpS);
      mesh!.setMatrixAt(i, tmpM);
      // x = ao + 2 q (q = 05 soap-shading weight x 8, see PUFF_VERT)
      mesh!.setColorAt(i, tmpC.setRGB(pf.ao + 2 * Math.round(Math.min(1, Math.max(0, pf.w5 ?? 0)) * 8), seed, pf.tint));
      i++;
    }
    if (!mesh) return;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    parent.add(mesh);
    chunks.push({ mesh, sa, sb });
    total += nMesh;
  };

  // ---- continuous lather bank (berm) along both edges ----
  const skip: [number, number] = [st03.s0 + 4, st04.s0 - 6];
  const berm = createBerm(course, s0, s1, skip, quality);
  group.add(berm.mesh);

  // ---- cloud banks of puffs hugging both stream edges (ref 05: 10–40 px white-lavender clumps) ----
  const inSkip = (s: number) => s > skip[0] && s < skip[1];
  // wave 5: in 05 the stream-edge rim toward the VP is a LOW rim of piled bubbles (ref ≈40–60 px), not
  // tall heaps: crest puffs × 0.85, heaps × 0.6 and never stacked. Only sizes change, so the shared
  // rand() sequence (and every other stage's foam) stays identical.
  const st05b = course.stage('05');
  const bermK = bermScale05(course);
  const low05 = (s: number) => s > st05b.s0 - 4 && s < st05b.s1 + 2;
  /** wave 8: berm puffs drawn as fine-foam impostors (full 05 soap weight only, so 04 / 06 keep their sphere puffs) */
  const imp05S = (s: number) => s > st05b.s0 + 2 && s < st05b.s1 - 2;
  const bermPoint = (ss: number, e: number, side: number, lift: number) => {
    const f = course.sample(ss);
    const hw = course.widthAt(ss) / 2;
    const k05 = bermK(ss);
    const h = squashBerm(bermSurface(ss, e, side, hw), k05) + lift;
    const eS = e > 0 ? e * (0.1 + 0.9 * k05) : e;
    return f.pos.clone().addScaledVector(f.right, side * (hw + eS)).addScaledVector(f.up, h);
  };
  const addPuff = (list: Puff[], s: number, e: number, side: number, r: number, lift: number, ao: number) => {
    const ss = Math.min(s1, Math.max(s0, s));
    if (inSkip(ss)) return;
    const imp = imp05S(ss);
    if (imp) {
      // 05 fine foam: wide size spread (most lumps smaller, a few larger), sunk into the bank so the rim stays low
      const hz = hash1(ss * 13.1 + e * 7.7 + side * 3.3);
      r *= 0.5 + 0.95 * hz * hz;
      lift -= 0.4 * r;
    }
    list.push({ p: bermPoint(ss, e, side, lift), r, ao, tint: rand() * 2 - 1, w5: soap05W(ss), imp });
  };
  const smw = (a: number, b: number, x: number) => { const u = Math.min(1, Math.max(0, (x - a) / (b - a))); return u * u * (3 - 2 * u); };
  /** 05 soap-shading weight of a puff (same ramp as the berm's uSt05) */
  const soap05W = (s: number) => smw(st05b.s0 - 1, st05b.s0 + 2, s) * (1 - smw(st05b.s1 - 1, st05b.s1 + 4, s));
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
          const r = (0.11 + rand() * 0.13) * (low05(s) ? 0.85 : 1);
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
        const lo = low05(s);
        for (let k = 0; k < n; k++) {
          const r = (0.15 + rand() * 0.18) * (lo ? 0.6 : 1);
          const stack = k > 2 && rand() < 0.4 && !lo ? r * 0.65 : 0;
          const lift = r * (0.1 + rand() * 0.45) + stack;
          addPuff(list, s + (rand() - 0.5) * 1.8, ec + (rand() - 0.5) * 0.55, side, r, lift, 0.72 + 0.28 * Math.min(1, lift / (r * 0.9)));
        }
      }
    }
    build(list, group, sa - 2, sb + 2);
  }
  // wave 8: extra small bubbles along both 05 rims (own RNG: the shared sequence above is untouched): a lace of tiny
  // bubbles at the waterline and small bubbles piled on the crest, so the rim reads as fine foam toward the VP
  {
    const r5 = rng(9091);
    const n5 = quality === 'high' ? 7 : 3;
    for (let s = st05b.s0 + 2; s < st05b.s1 - 2; s += step) {
      for (const side of [-1, 1]) {
        for (let k = 0; k < n5; k++) {
          const ss = s + (r5() - 0.5) * step;
          const lace = k < 3;
          const e = lace ? -0.6 + r5() * 0.35 : -0.35 + r5() * 0.75;
          const u = r5();
          const r = lace ? 0.025 + 0.03 * u * u : 0.035 + 0.06 * u * u;
          imp05.push({ p: bermPoint(ss, e, side, r * (lace ? 0.2 : -0.1)), r, c: [lace ? 0.95 : 0.75 + 0.25 * r5(), r5(), r5() * 2 - 1] });
        }
      }
    }
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
  /** 0..1 clump envelope (sd 0 = left, 1 = right): 0 = no bank (open water up to the frame edge) */
  const bankEnv = (s: number, sd: number) => {
    const [seed, f, t0] = BANK_ENV[sd];
    return sm(t0, t0 + 0.12, 0.65 * noise1(s * f + seed) + 0.35 * noise1(s * f * 2.3 + seed * 1.7 + 11.0));
  };
  const rowEnv = [new Float32Array(R), new Float32Array(R)];
  /** lather apron height above the water: f = 0 inner edge (just under the water) … 1 outer */
  const bankProf = (f: number, s: number, side: number) => {
    const top = 0.035 + 0.05 * noise1(s * 1.4 + side * 9.1 + 40);
    const u = Math.min(1, f / 0.3);
    return -0.05 + (0.05 + top) * (1 - (1 - u) * (1 - u));
  };

  // bubble puffs: camera-facing sphere impostors (2 triangles each), CELL-spaced world cells along s,
  // P puffs per cell, a ring buffer of NC cells per side
  const CELL = quality === 'high' ? 0.16 : 0.3;
  const P = quality === 'high' ? 13 : 7;
  const NC = Math.ceil((BANK_PUFF_DS1 - BANK_DS0) / CELL) + 3;
  const nRaft = 2 * NC * P;
  const rr = rng(4242);
  const bub = makeBankBubbleMaterial();
  const rafts = new THREE.InstancedMesh(new THREE.PlaneGeometry(2, 2), bub.mat, nRaft);
  rafts.name = 'foam_rafts';
  rafts.frustumCulled = false;
  rafts.renderOrder = 1;
  for (let i = 0; i < nRaft; i++) {
    const kind = i % P; // see KIND
    rafts.setColorAt(i, tmpC.setRGB(kind < 2 || kind >= 8 ? 0.86 + 0.1 * rr() : 0.8 + 0.2 * rr(), rr(), rr() * 2 - 1));
    rafts.setMatrixAt(i, tmpM.makeScale(0, 0, 0));
  }
  if (rafts.instanceColor) rafts.instanceColor.needsUpdate = true;
  rafts.visible = false;
  group.add(rafts);
  total += nRaft;
  // wave 8: the 05 berm puffs + rim bubbles as fine-foam impostors (one draw, static)
  const rim05 = new THREE.InstancedMesh(rafts.geometry, bub.mat, Math.max(1, imp05.length));
  rim05.name = 'foam_rim05';
  rim05.frustumCulled = false;
  rim05.count = imp05.length;
  imp05.forEach((b, i) => {
    rim05.setMatrixAt(i, tmpM.makeScale(b.r, b.r, b.r).setPosition(b.p));
    rim05.setColorAt(i, tmpC.setRGB(b.c[0], b.c[1], b.c[2]));
  });
  rim05.instanceMatrix.needsUpdate = true;
  if (rim05.instanceColor) rim05.instanceColor.needsUpdate = true;
  group.add(rim05);
  total += imp05.length;
  /** per puff kind: across range [f0, f0 + df], radius [r0, r0 + dr], lift (× r above the apron), probability */
  // wave 8: fine foam = a few LOW lumps sunk into the water (negative lift: with the impostor's sphere depth only the
  // cap shows) + many small / tiny bubbles (size spread ~3-40 px, most under 12 px): 0-1 waterline lace, 2-3 body lumps,
  // 4 big low lump, 5 outer, 6 small on the lumps, 7 body, 8 lace on the water off the edge, 9-12 small / tiny
  const KIND: [number, number, number, number, number, number][] = quality === 'high'
    ? [[-0.04, 0.12, 0.01, 0.016, 0.2, 1], [0.0, 0.14, 0.014, 0.02, 0.1, 1], [0.12, 0.5, 0.065, 0.06, -0.3, 1], [0.2, 0.55, 0.06, 0.055, -0.2, 1], [0.2, 0.5, 0.1, 0.06, -0.5, 0.6], [0.6, 0.4, 0.065, 0.05, -0.15, 1], [0.05, 0.9, 0.022, 0.024, 0.35, 1], [0.3, 0.65, 0.045, 0.045, -0.05, 1], [-0.16, 0.16, 0.007, 0.011, 0.3, 0.7], [0.0, 0.5, 0.016, 0.018, 0.25, 1], [0.1, 0.8, 0.013, 0.016, 0.55, 0.8], [-0.08, 0.3, 0.008, 0.01, 0.35, 0.8], [0.4, 0.6, 0.02, 0.02, 0.3, 0.8]]
    : [[-0.04, 0.12, 0.012, 0.018, 0.15, 1], [0.12, 0.5, 0.065, 0.06, -0.25, 1], [0.15, 0.5, 0.1, 0.05, -0.45, 0.7], [0.55, 0.45, 0.065, 0.05, -0.1, 1], [0.1, 0.8, 0.05, 0.05, 0.0, 1], [0.0, 0.6, 0.02, 0.02, 0.3, 1], [-0.12, 0.25, 0.009, 0.012, 0.3, 0.8]];
  /** kinds left out of the narrow right rim (heap, outer, 2nd wide body) */
  const RIM_SKIP = quality === 'high' ? [4, 5, 7] : [2, 3];
  /** body kinds that sometimes become a big bump (ref 05 clumps: a few 30-45 px bumps among 10-20 px bubbles) */
  const BUMP = quality === 'high' ? [2, 3] : [1];

  const rider = { s: 0, lat: 0, str: 0, target: 0, fed: false };
  const fr = { s: 0, pos: new THREE.Vector3(), tan: new THREE.Vector3(), up: new THREE.Vector3(), right: new THREE.Vector3() };
  const pP = new THREE.Vector3();
  const pv = new THREE.Vector3();
  const camPos = new THREE.Vector3();
  const qa: { kind: string; ds: number; lat: number; k: number; y?: number; x?: number; env?: number; s?: number }[] = [];
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
    flank.visible = FLANK_SHEET;
    bub.uniforms.uTime.value = time;
    cam.updateMatrixWorld();
    cam.getWorldPosition(camPos);
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
        // wave 7: inner-edge px / clump size by row (RIM_R): lower clumps behind Benny, narrow right rim ahead;
        // the right side blends its own short-clump envelope (BANK_ENV[2], beside / behind Benny) into the rim's
        let pxIn: number, pxClump: number, env: number;
        if (sd === 0) {
          const kz = sm(-0.6, 0.2, ds);
          env = bankEnv(s, 0);
          pxIn = 214 + (BANK_PX[0] * (0.72 + 0.28 * lump) - 214) * kz;
          pxClump = 157 + (CLUMP_PX - 157) * kz;
        } else {
          const kz = sm(1.4, 2.6, ds);
          env = bankEnv(s, 2) + (bankEnv(s, 1) - bankEnv(s, 2)) * kz;
          pxIn = 214 + (rimR(ds) * (0.85 + 0.3 * lump) - 214) * kz;
          pxClump = 150 + (RIM_R_PX - 150) * kz;
        }
        const frac = ((2 * pxIn) / 864) * env;
        const fracOut = frac - (2 * pxClump) / 864;
        const edge = solveLat(cam, side, camLat + side * 1.5, camLat + side * 3);
        const inner = frac > 0.002 ? solveLat(cam, side * (1 - frac), camLat + side * 1.0, edge) : edge;
        const outer = fracOut > 0.004 ? solveLat(cam, side * (1 - fracOut), inner, edge) : edge;
        // keep clear of Benny (near him) and of the cyan core / coin line; merge into the berm at the edge
        // behind Benny (ds < −0.6) there are no coins and only the spray fan: clearances relax (wave 7: rider ×0.32,
        // core ×0.25 at ds ≤ −1.2; the ref's lower clumps sit right beside the fan, x 60-230 / 650-800)
        const behind = sm(-0.5, -1.2, ds);
        const clearR = BANK_CLEAR_RIDER * (1 - sm(2.5, 4.5, Math.abs(ds))) * (1 - 0.68 * behind);
        const clearC = BANK_CLEAR_CORE * (1 - 0.75 * behind);
        let a = Math.max(side * inner, side * rider.lat + clearR, side * coreLateral(course, s) + clearC);
        a = Math.min(a, hw - 0.3);
        // outer border: beyond the frame edge, or (wide clump) CLUMP_PX out from its inner edge
        let outA = Math.max(a + 0.12, Math.min(outer === edge ? side * edge + 0.55 : side * outer, hw + 0.15));
        // wave 9: behind Benny the near banks are the splash's foam WAKE (ref 05): two narrow bands trailing back-outward
        // along the pink bands from under the splash roots (ref left (300,1160) -> (56,1300), right (620,1190) ->
        // (795,1311): |lat - rider| inner 0.3 + 0.7 b, outer 0.9 + 0.47 b, b = -ds), ending before the frame edge
        // (outer border >= V_EDGE_PX in from it), instead of round blobs fitted to the frame edges
        const vK = 1 - sm(-0.45, 0.05, ds);
        if (vK > 0) {
          const b = Math.max(0, -ds);
          const vIn = side * rider.lat + 0.3 + 0.7 * b + 0.08 * (lump - 0.5);
          const lim = side * solveLat(cam, side * (1 - (2 * V_EDGE_PX) / 864), camLat + side * 1.0, edge);
          const vOut = Math.min(side * rider.lat + 0.9 + 0.47 * b + 0.06 * lump, lim, hw + 0.1);
          const vEnv = (1 - sm(-0.3, 0.0, ds)) * sm(V_DS_END - 0.3, V_DS_END, ds) * sm(0.12, 0.3, vOut - vIn);
          a += (Math.min(vIn, hw - 0.3) - a) * vK;
          outA += (Math.max(vOut, vIn + 0.12) - outA) * vK;
          env += (vEnv - env) * vK;
        }
        rowEnv[sd][i] = env;
        // fade in/out (stage entry/exit): the bank narrows towards the frame edge instead of sinking
        a = outA - (outA - a) * w;
        rowIn[sd][i] = side * a;
        rowOut[sd][i] = side * outA;
        const hIn = heightAt(s, side * a, time), hOut = heightAt(s, side * outA, time);
        rowHIn[sd][i] = hIn;
        rowHOut[sd][i] = hOut;
        if (qa.length < 80 && i % 2 === 0) {
          // screen y (0 top … 1 bottom) of the bank's inner edge on this row
          const pN = pv.copy(fr.pos).addScaledVector(fr.right, side * a).addScaledVector(fr.up, hIn).project(cam);
          qa.push({ kind: side < 0 ? 'L' : 'R', ds: +ds.toFixed(2), lat: +(side * a).toFixed(2), k: +(outA - a).toFixed(2), y: +((1 - pN.y) / 2).toFixed(3), x: +((1 + pN.x) / 2).toFixed(3), env: +env.toFixed(2), s: +s.toFixed(2) });
        }
        for (let j = 0; j < C; j++) {
          const f = Math.pow(j / (C - 1), 0.85);
          // the apron starts a little outside the bank's inner edge: its lip hides behind the rim bubbles
          const lat = side * (a + Math.min(0.1, (outA - a) * 0.3) + (outA - a - Math.min(0.1, (outA - a) * 0.3)) * f);
          const evR = sm(0.06, 0.45, env);
          const h = hIn + (hOut - hIn) * f + bankProf(f, s, side) * evR - 0.1 * (1 - evR);
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
    if (FLANK_SHEET) {
      bankGeo.attributes.position.needsUpdate = true;
      bankGeo.attributes.aFoam.needsUpdate = true;
      bankGeo.computeVertexNormals();
    }
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
        const ev = sm(0.06, 0.45, L(rowEnv[sd]));
        const wid = Math.abs(lout - lin);
        course.sample(sC, fr);
        // bubbles grow with distance so their on-screen size stays ≈10–45 px (ref 05 bank texture)
        const scale = Math.min(2.0, 0.9 + 0.1 * Math.max(0, ds)) * kFade * Math.min(1, wid / 0.3) * ev;
        // wave 7: the right rim ahead of Benny is one low layer of smaller bubbles (no heap / outer kinds)
        const rimK = side > 0 ? sm(1.4, 2.6, ds) : 0;
        // wave 7: the near clumps (beside / behind Benny) are compact mounds of overlapping bubbles (ref 05),
        // not a loose scatter: bigger bubbles drawn toward the clump middle, taller in the middle
        const nearK = 1 - sm(2.0, 3.0, ds);
        for (let p = 0; p < P; p++) {
          const [f0, df, r0, dr, lift0, prob] = KIND[p];
          if (hh(10 + p) > prob || (rimK > 0.5 && RIM_SKIP.includes(p))) { rafts.setMatrixAt(base + p, tmpM.makeScale(0, 0, 0)); continue; }
          const fr0 = Math.min(1, f0 + df * hh(20 + p));
          const f = 0.5 + (fr0 - 0.5) * (1 - 0.25 * nearK);
          const bump = BUMP.includes(p) && hh(50 + p) < 0.22;
          // wave 8: the right rim ahead of Benny is lower (ref band 40-65 px): smaller lumps, still sunk into the water
          const r = (r0 + dr * hh(30 + p)) * scale * (1 - 0.3 * rimK) * (bump ? 1.55 : 1) * (1 + 0.05 * nearK);
          const lift = (lift0 < 0 ? lift0 : lift0 * (1 - 0.5 * rimK)) * (bump ? 0.45 : 1) + 0.12 * nearK * Math.sin(Math.PI * f);
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
    rim05,
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
      rim05.visible = imp05.length > 0 && st05.s1 - 2 > focusS - 12 && st05.s0 + 2 < focusS + 130 && outro < 0.3;
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
