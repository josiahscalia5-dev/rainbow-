/**
 * Spline water ribbon — the traversable stream Benny rides from the Drum A drain to the towel.
 *
 * Geometry: rows every `ds` along the master course, columns across `widthAt(s)`; a slightly
 * concave trough with raised frothy edges plus a short skirt under each edge (thickness).
 * Shader: electric-cyan core with meandering hot-pink flow bands, advected white streaks and
 * sparkles (two-phase flow-map advection so per-stage speeds never shear), Fresnel/haze
 * reflection, specular glints, cellular soap-foam fringe, Benny ripple rings + V-wake, the five
 * glowing chevrons on the 04 slide, a dithered hand-over to the whirlpool surface in 03 and a
 * drain-away for the 11 outro.
 */
import * as THREE from 'three';
import type { Course, StageId } from '../world/course';
import { FRAG_TAIL, NOISE_GLSL, PALETTE, withFog } from './glsl';

/** wave amplitude per stage (units); blended across boundaries */
const AMP: Partial<Record<StageId, number>> = {
  '02': 0.06, '03': 0.08, '04': 0.03, '05': 0.1, '06': 0.12, '07': 0.1, '08': 0.1, '09': 0.16, '10': 0.08, '11': 0.05,
};
export const EDGE_LIFT = 0.28;

export function ampAt(course: Course, s: number): number {
  let v = 0, w = 0;
  for (const st of course.stages) {
    const a = smooth(st.s0 - 5, st.s0 + 5, s) * (1 - smooth(st.s1 - 5, st.s1 + 5, s));
    if (a > 0) { v += (AMP[st.id] ?? 0.08) * a; w += a; }
  }
  let amp = w > 0 ? v / w : 0.08;
  // calm the long straight of the deep plunge (fast sheet flow)
  const pt = course.marks['07_plunge_top'], pb = course.marks['07_plunge_bottom'];
  if (pt !== undefined) amp *= 1 - 0.6 * smooth(pt, pt + 8, s) * (1 - smooth(pb - 8, pb, s));
  return amp;
}

function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** CPU mirror of the vertex displacement (keep in sync with VERT). */
export function ribbonWave(u: number, s: number, t: number, amp: number): number {
  const au = Math.min(1, Math.abs(u));
  const trough = EDGE_LIFT * au * au * au;
  return trough + amp * (0.6 * Math.sin(s * 0.9 - t * 2.4 + u * 1.7) + 0.4 * Math.sin(s * 0.41 + t * 1.5 - u * 2.3));
}

const VERT = /* glsl */ `
attribute vec2 aUV;      // x = u (-1..1 across), y = s (arc length)
attribute float aHalfW;
attribute float aSpeed;
attribute float aAmp;
attribute float aSkirt;  // 0 surface, 1 skirt bottom
uniform float uTime;
uniform vec4 uHide;      // s03Start, s04Start, chuteMark, unused
varying vec2 vUV;
varying float vHalfW;
varying float vSpeed;
varying float vSkirt;
varying float vHide;
varying vec3 vPosW;
varying vec3 vNormalW;
#include <fog_pars_vertex>
void main() {
  float u = aUV.x;
  float s = aUV.y;
  float h = aAmp * (0.6 * sin(s * 0.9 - uTime * 2.4 + u * 1.7) + 0.4 * sin(s * 0.41 + uTime * 1.5 - u * 2.3));
  vec3 p = position + normal * h * (1.0 - aSkirt);
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vUV = aUV;
  vHalfW = aHalfW;
  vSpeed = aSpeed;
  vSkirt = aSkirt;
  // hand the stream over to the whirlpool surface during 03 (dithered fade both ways)
  float inside03 = smoothstep(uHide.x + 0.5, uHide.x + 3.5, s) * (1.0 - smoothstep(uHide.y - 9.0, uHide.y - 1.5, s));
  vHide = 1.0 - inside03;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uCyanDeep;
uniform vec3 uCyan;
uniform vec3 uCyanBright;
uniform vec3 uPink;
uniform vec3 uPinkLight;
uniform vec3 uFoam;
uniform vec3 uFoamLav;
uniform vec3 uHaze;
uniform vec3 uLightDir;
uniform vec3 uBenny;      // s, lateral (units), strength
uniform vec3 uChevron;    // start s, spacing, enabled
uniform vec2 uOutro;      // amount, chamber start s
varying vec2 vUV;
varying float vHalfW;
varying float vSpeed;
varying float vSkirt;
varying float vHide;
varying vec3 vPosW;
varying vec3 vNormalW;
#include <fog_pars_fragment>
${NOISE_GLSL}

// one advected layer of the flow pattern
// returns: x = pink mask, y = white streaks, z = streak noise (shading), w = pink fine streaks
vec4 flowLayer(float u, float v) {
  float m = (vnoise(vec2(v * 0.07, 3.1)) - 0.5) * 0.9 + sin(v * 0.19) * 0.16;
  float core = 0.54 + 0.16 * (vnoise(vec2(v * 0.13, u * 1.3 + 7.0)) - 0.5);
  float pinkMask = smoothstep(core - 0.07, core + 0.07, abs(u - m * 0.55));
  #ifdef LOW_Q
  float sn = vnoise(vec2(u * 4.0 + m * 4.0, v * 0.28));
  #else
  float sn = fbm3(vec2(u * 4.0 + m * 4.0, v * 0.28));
  #endif
  // crisp, thin white highlight lines stretched along the flow
  float ln = vnoise(vec2(u * 15.0 + m * 6.0 + sn * 2.5, v * 0.33));
  float streak = smoothstep(0.8, 0.93, ln) * 1.5 + smoothstep(0.72, 0.8, sn) * 0.25;
  float fineP = smoothstep(0.7, 0.76, vnoise(vec2(u * 7.0 - m * 3.0, v * 0.21 + 11.0)));
  return vec4(pinkMask, streak, sn, fineP);
}

void main() {
  float u = vUV.x;
  float s = vUV.y;
  // dithered hide (03 hand-over)
  if (vHide < 0.5) discard;
  float cutFoam = 1.0 - smoothstep(0.5, 0.85, vHide);
  // 11 outro: the stream drains away in the chamber, leaving puddles
  if (uOutro.x > 0.0 && s > uOutro.y - 2.0) {
    float n = vnoise(vec2(u * 3.0, s * 0.35)) * 0.7 + 0.3;
    if (n < uOutro.x * 1.15) discard;
  }

  // two-phase flow-map advection (period 4 s); offset scales with the local stage speed
  float ph0 = fract(uTime * 0.25);
  float ph1 = fract(uTime * 0.25 + 0.5);
  float w0 = 1.0 - abs(1.0 - 2.0 * ph0);
  vec4 A = flowLayer(u, s - vSpeed * ph0 * 4.0);
  vec4 B = flowLayer(u, s - vSpeed * ph1 * 4.0 + 23.0);
  vec4 F = mix(B, A, w0);

  vec3 cyanCol = mix(uCyanDeep, uCyan, smoothstep(0.22, 0.62, F.z));
  cyanCol = mix(cyanCol, uCyanBright, smoothstep(0.6, 0.82, F.z) * 0.7);
  vec3 pinkCol = mix(uPink, uPinkLight, F.z * 0.7);
  float pinkM = clamp(F.x + F.w * 0.8, 0.0, 1.0);
  vec3 col = mix(cyanCol, pinkCol, pinkM);

  // perturbed normal from the streak noise for glossy highlights
  float e = 0.02;
  vec3 N = normalize(vNormalW + 0.35 * vec3(F.z - 0.5, 0.0, F.y * 0.3 - 0.15));
  vec3 V = normalize(cameraPosition - vPosW);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  vec3 R = reflect(-V, N);
  vec3 refl = mix(uHaze, vec3(1.0), smoothstep(0.1, 0.9, R.y));
  col = mix(col, refl, fres * 0.2);
  vec3 H = normalize(normalize(uLightDir) + V);
  float spec = pow(clamp(dot(N, H), 0.0, 1.0), 80.0);
  col += vec3(1.0) * (spec * 1.4 + F.y * 0.9);

  // twinkling sparkles
  vec2 g = vec2(u * 9.0, (s - vSpeed * uTime * 0.6) * 1.6);
  vec2 gi = floor(g);
  float hs = hash12(gi);
  vec2 gf = fract(g) - 0.5;
  float tw = 0.5 + 0.5 * sin(uTime * 7.0 + hs * 40.0);
  float sparkle = step(0.93, hs) * smoothstep(0.18, 0.0, length(gf)) * tw;
  col += vec3(1.2) * sparkle;

  // soap-foam fringe along the edges
  float edgeN = (vnoise(vec2(s * 1.3, u * 2.0)) - 0.5) * 0.16;
  float edge = smoothstep(0.8, 0.96, abs(u) + edgeN);
  float c = cells(vec2(u * vHalfW * 2.6, (s - vSpeed * uTime * 0.5) * 2.4));
  vec3 foamCol = mix(uFoam * 1.15, uFoamLav * 0.85, smoothstep(0.25, 0.75, c));
  col = mix(col, foamCol, edge * (0.8 + 0.2 * smoothstep(0.2, 0.5, c)));
  col = mix(col, uFoamLav * 0.92, vSkirt);
  col = mix(col, foamCol, cutFoam);

  // Benny: ripple rings around him + V wake behind
  if (uBenny.z > 0.0) {
    float du = u * vHalfW - uBenny.y;
    float dv = s - uBenny.x;
    float d = length(vec2(du, dv * 0.8));
    float rings = smoothstep(0.55, 1.0, 0.5 + 0.5 * sin(d * 5.5 - uTime * 9.0)) * exp(-d * 0.7) * smoothstep(0.75, 1.05, d);
    float back = clamp(-dv, 0.0, 30.0);
    float wakeV = exp(-abs(abs(du) - back * 0.42 - 0.7) * 3.5) * exp(-back * 0.16) * step(dv, 0.0);
    col = mix(col, uFoam, clamp((rings * 0.75 + wakeV * 0.85) * uBenny.z, 0.0, 1.0));
  }

  // 04: exactly five glowing chevrons pointing downhill (direction of travel)
  if (uChevron.z > 0.5) {
    float x = u * vHalfW;
    for (int k = 0; k < 5; k++) {
      float y = s - (uChevron.x + float(k) * uChevron.y);
      if (abs(y) < 1.4 && abs(x) < 1.6) {
        float dist = abs(y - (0.55 - abs(x) * 0.95)) * 0.72;
        float arm = step(abs(x), 1.25);
        float core = smoothstep(0.2, 0.1, dist) * arm;
        float halo = smoothstep(0.75, 0.0, dist) * smoothstep(1.6, 0.9, abs(x)) * 0.45;
        col = mix(col, vec3(1.0), clamp(halo, 0.0, 1.0));
        col = mix(col, vec3(2.2, 2.4, 2.5), core);
      }
    }
  }
  gl_FragColor = vec4(col, 1.0);
  ${FRAG_TAIL}
}
`;

export interface Ribbon {
  mesh: THREE.Mesh;
  uniforms: Record<string, THREE.IUniform>;
  s0: number;
  s1: number;
  heightAt(s: number, lateral: number, t: number): number;
}

export function createRibbon(course: Course, opts: { s0: number; s1: number; quality: 'high' | 'low' }): Ribbon {
  const { s0, s1, quality } = opts;
  const ds = quality === 'high' ? 0.4 : 0.7;
  const cols = quality === 'high' ? 18 : 10;
  const rows = Math.ceil((s1 - s0) / ds) + 1;
  const vertsPerRow = cols + 1 + 2; // + skirt left/right
  const n = rows * vertsPerRow;
  const pos = new Float32Array(n * 3);
  const nor = new Float32Array(n * 3);
  const uv = new Float32Array(n * 2);
  const halfW = new Float32Array(n);
  const speed = new Float32Array(n);
  const amp = new Float32Array(n);
  const skirt = new Float32Array(n);
  const tmp = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  let k = 0;
  for (let i = 0; i < rows; i++) {
    const s = Math.min(s1, s0 + i * ds);
    const f = course.sample(s);
    const hw = course.widthAt(s) / 2;
    const sp = Math.max(3, course.prop(s, 'speed'));
    const a = ampAt(course, s);
    const put = (u: number, lateral: number, h: number, isSkirt: number, nn: THREE.Vector3) => {
      tmp.copy(f.pos).addScaledVector(f.right, lateral).addScaledVector(f.up, h);
      tmp.toArray(pos, k * 3);
      nn.toArray(nor, k * 3);
      uv[k * 2] = u;
      uv[k * 2 + 1] = s;
      halfW[k] = hw;
      speed[k] = sp;
      amp[k] = a;
      skirt[k] = isSkirt;
      k++;
    };
    // left skirt (below left edge)
    put(-1, -hw * 1.01, EDGE_LIFT - 0.7, 1, nrm.copy(f.right).negate());
    for (let j = 0; j <= cols; j++) {
      const u = -1 + (2 * j) / cols;
      const lift = EDGE_LIFT * Math.abs(u) ** 3;
      const slope = (EDGE_LIFT * 3 * u * Math.abs(u)) / hw; // d lift / d lateral
      nrm.copy(f.up).addScaledVector(f.right, -slope).normalize();
      put(u, u * hw, lift, 0, nrm);
    }
    put(1, hw * 1.01, EDGE_LIFT - 0.7, 1, nrm.copy(f.right));
  }
  const idx: number[] = [];
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < vertsPerRow - 1; j++) {
      const a = i * vertsPerRow + j, b = a + 1, c = a + vertsPerRow, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.setAttribute('aUV', new THREE.BufferAttribute(uv, 2));
  geo.setAttribute('aHalfW', new THREE.BufferAttribute(halfW, 1));
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
  geo.setAttribute('aAmp', new THREE.BufferAttribute(amp, 1));
  geo.setAttribute('aSkirt', new THREE.BufferAttribute(skirt, 1));
  geo.setIndex(idx);
  geo.computeBoundingSphere();

  const st03 = course.stage('03'), st04 = course.stage('04'), st08 = course.stage('08');
  const uniforms = withFog({
    uTime: { value: 0 },
    uCyanDeep: { value: PALETTE.cyanDeep.clone() },
    uCyan: { value: PALETTE.cyan.clone() },
    uCyanBright: { value: PALETTE.cyanBright.clone() },
    uPink: { value: PALETTE.pink.clone() },
    uPinkLight: { value: PALETTE.pinkLight.clone() },
    uFoam: { value: PALETTE.foam.clone() },
    uFoamLav: { value: PALETTE.foamLav.clone() },
    uHaze: { value: PALETTE.haze.clone() },
    uLightDir: { value: new THREE.Vector3(0.3, 1.0, 0.45).normalize() },
    uBenny: { value: new THREE.Vector3(0, 0, 0) },
    uChevron: { value: new THREE.Vector3(st04.s0 + 8.5, 3.6, 1) },
    uOutro: { value: new THREE.Vector2(0, st08.s0) },
    uHide: { value: new THREE.Vector4(st03.s0, st04.s0, 0, 0) },
  });
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    fog: true,
    side: THREE.DoubleSide,
    defines: quality === 'low' ? { LOW_Q: 1 } : {},
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'water_ribbon';
  mesh.frustumCulled = false; // one long mesh spanning the whole course
  return {
    mesh,
    uniforms,
    s0,
    s1,
    heightAt(s, lateral, t) {
      const hw = course.widthAt(s) / 2;
      return ribbonWave(lateral / hw, s, t, ampAt(course, s));
    },
  };
}
