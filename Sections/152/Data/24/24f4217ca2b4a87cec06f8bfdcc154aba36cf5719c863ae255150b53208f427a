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
import { FRAG_FX_GLSL, FRAG_TAIL, NOISE_GLSL, PALETTE, withFog } from './glsl';

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
uniform float uBennyR;    // Benny's waterline radius (units)
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
${FRAG_FX_GLSL}

// Stationary channel shape (refs 05–07): u-centre of the electric-cyan core. It only drifts slowly
// downstream at a constant rate (no shear between stage speeds); the strand texture below is what
// is advected at the local stage speed.
float meander(float s) {
  float a = s - uTime * 0.9;
  return 0.25 * sin(a * 0.24) + 0.1 * sin(a * 0.55 + 1.3) + 0.2 * (vnoise(vec2(a * 0.055, 4.7)) - 0.5);
}

// advected strand texture ("combed" glossy water lines parallel to the flow)
// x = lateral units relative to the meander centre, v = advected arc length, aa = 0..1 detail fade
// returns: x = height 0..1 (shading + bump), y = white glint lines, z = mid strands, w = fine strands
vec4 strands(float x, float v, vec2 aa) {
  float a = vnoise(vec2(x * 2.4, v * 0.08));
  float b = vnoise(vec2(x * 7.0 + a * 1.6, v * 0.19 + 5.0));
  #ifdef LOW_Q
  float c = b;
  #else
  float c = vnoise(vec2(x * 17.0 + b * 2.2, v * 0.42 + 3.0));
  #endif
  b = mix(0.5, b, aa.x);
  c = mix(0.5, c, aa.y);
  float h = a * 0.48 + b * 0.32 + c * 0.2;
  float line = smoothstep(0.74, 0.88, c) * aa.y + smoothstep(0.8, 0.92, b) * aa.x * 0.55;
  return vec4(h, line, b, c);
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

  // ---- channel layout: cyan core winding inside hot-pink side bands ----
  float M = meander(s);
  float q = u - M;
  float x = q * vHalfW;                       // lateral units in the core's frame
  float lat = u * vHalfW;                     // lateral units in the ribbon frame

  // detail fade with distance (cells per pixel), keeps far water from shimmering
  float fwx = fwidth(x);
  float fws = fwidth(s);
  vec2 aa = vec2(1.0 - smoothstep(0.08, 0.2, max(fwx * 7.0, fws * 0.19)),
                 1.0 - smoothstep(0.05, 0.14, max(fwx * 17.0, fws * 0.42)));
  #ifdef LOW_Q
  aa.y = 0.0;
  #endif

  // two-phase flow-map advection of the strands (period 4 s; offset scales with stage speed)
  float ph0 = fract(uTime * 0.25);
  float ph1 = fract(uTime * 0.25 + 0.5);
  float w0 = 1.0 - abs(1.0 - 2.0 * ph0);
  vec4 F = mix(strands(x, s - vSpeed * ph1 * 4.0 + 23.0, aa), strands(x, s - vSpeed * ph0 * 4.0, aa), w0);

  float coreW = 0.56 + 0.08 * (vnoise(vec2(s * 0.1, 2.0)) - 0.5);
  // interleave pink/cyan strands along the band boundary (follows the flow)
  float aq = abs(q) + (F.z - 0.5) * 0.09 + (F.w - 0.5) * 0.05;
  float pinkBand = smoothstep(coreW - 0.035, coreW + 0.035, aq);
  // woven ribbons parallel to the flow: thin pink inside the cyan, thin cyan inside the pink
  float weave = vnoise(vec2(s * 0.045, 9.0));
  float pinkRib = (1.0 - smoothstep(0.012, 0.035, abs(aq - coreW * 0.58 - 0.05 * sin(s * 0.31)))) * smoothstep(0.42, 0.62, weave);
  float cyanRib = (1.0 - smoothstep(0.01, 0.03, abs(aq - coreW - 0.16 - 0.03 * sin(s * 0.4 + 2.0)))) * smoothstep(0.45, 0.65, 1.0 - weave);
  float pinkM = clamp(max(pinkBand, pinkRib) - cyanRib * pinkBand, 0.0, 1.0);

  float h = F.x;
  vec3 cyanCol = mix(uCyanDeep, uCyan, smoothstep(0.22, 0.5, h));
  cyanCol = mix(cyanCol, uCyanBright, smoothstep(0.52, 0.78, h));
  vec3 pinkCol = mix(uPink * 0.82, uPink, smoothstep(0.22, 0.48, h));
  pinkCol = mix(pinkCol, uPinkLight, smoothstep(0.55, 0.82, h));
  vec3 col = mix(cyanCol, pinkCol, pinkM);

  // ---- glossy lighting ----
  vec3 N0 = normalize(vNormalW);
  if (!gl_FrontFacing) N0 = -N0;
  #ifdef LOW_Q
  vec3 N = normalize(N0 + 0.25 * vec3(h - 0.5, 0.0, F.z - 0.5));
  #else
  float bumpAmt = 0.07 * (1.0 - smoothstep(0.1, 0.5, fws));
  vec3 N = bumpNormal(vPosW, N0, h * bumpAmt);
  #endif
  vec3 V = normalize(cameraPosition - vPosW);
  float nv = clamp(dot(N, V), 0.0, 1.0);
  float fres = pow(1.0 - nv, 4.0);
  vec3 R = reflect(-V, N);
  vec3 reflTint = mix(uCyanBright * 1.25, uPinkLight * 1.2, pinkM);
  vec3 refl = mix(reflTint, vec3(1.1), smoothstep(0.35, 0.95, R.y));
  col = mix(col, refl, fres * 0.35);
  vec3 L = normalize(uLightDir);
  vec3 H = normalize(L + V);
  float spec = pow(clamp(dot(N, H), 0.0, 1.0), 120.0);
  float sheen = pow(clamp(dot(R, L), 0.0, 1.0), 10.0);
  col += vec3(1.0) * spec * 1.3 + mix(uCyanBright, uPinkLight, pinkM) * sheen * 0.22;
  col += vec3(0.95, 1.0, 1.0) * F.y * 0.85;

  // ---- white star glints (4-point, twinkling, carried by the flow) ----
  #ifdef LOW_Q
  vec2 g = vec2(lat * 1.2, (s - vSpeed * uTime * 0.6) * 0.8);
  float hs = hash12(floor(g));
  float sparkle = step(0.9, hs) * smoothstep(0.22, 0.0, length(fract(g) - 0.5)) * (0.5 + 0.5 * sin(uTime * 7.0 + hs * 40.0));
  col += vec3(1.3) * sparkle;
  #else
  float glint = starGlint(vec2(lat * 1.15, (s - vSpeed * uTime * 0.55) * 0.6), 0.16, 18.0, uTime);
  col += vec3(1.25) * glint * (1.0 - smoothstep(0.25, 0.7, fws));
  #endif

  // ---- soap-foam lace where the water meets the foam banks ----
  float edgeN = (vnoise(vec2(s * 1.3, u * 2.0)) - 0.5) * 0.1;
  float eu = abs(lat) - vHalfW;               // units from the edge (negative inside)
  float edge = smoothstep(-0.75, -0.3, eu + edgeN * vHalfW);
  if (edge > 0.0) {
    float c = cells(vec2(lat * 3.2, (s - vSpeed * uTime * 0.35) * 3.2));
    vec3 foamCol = mix(uFoam * 1.15, uFoamLav * 0.85, smoothstep(0.25, 0.75, c));
    col = mix(col, foamCol, edge * smoothstep(0.05, 0.4, c + edge * 0.3));
  }
  col = mix(col, uFoamLav * 0.92, vSkirt);
  float cutC = cells(vec2(u * vHalfW * 4.0, s * 3.6));
  col = mix(col, mix(uFoam * 1.2, uFoamLav * 0.8, smoothstep(0.2, 0.7, cutC)), cutFoam);

  // ---- Benny: churned contact foam, lace splash fans to both sides + V wake behind ----
  if (uBenny.z > 0.0) {
    float du = lat - uBenny.y;
    float dv = s - uBenny.x;
    float rb = uBennyR;
    float d = length(vec2(du, dv));
    if (d < rb * 9.0) {
      float k = uBenny.z;
      float phi = atan(abs(du), -dv);           // 0 = straight behind (camera side), pi/2 = beside
      float rr = max(0.0, d - rb * 0.9);
      // contact ring of churned white water hugging the body
      float lace = cells(vec2(du * 4.2, (dv + uTime * vSpeed * 0.25) * 4.2));
      float contact = (1.0 - smoothstep(rb * 0.25, rb * 0.65, rr)) * smoothstep(0.02, 0.3, lace + 0.12);
      // radiating lace tendrils fanning sideways/backwards (ref 05 splash at the water line)
      float fan = smoothstep(2.5, 1.6, phi) * smoothstep(0.35, 0.9, phi);
      float tend = vnoise(vec2(phi * 9.0, rr * 0.9 - uTime * 3.2));
      tend = smoothstep(0.42, 0.72, tend) * smoothstep(0.08, 0.32, lace);
      float tendrils = tend * fan * exp(-rr / (rb * 1.5));
      // ripple rings + long V wake
      float rings = smoothstep(0.6, 1.0, 0.5 + 0.5 * sin(d * 5.0 - uTime * 9.0)) * exp(-d * 0.5) * smoothstep(rb, rb * 1.4, d) * 0.45;
      float back = clamp(-dv, 0.0, 30.0);
      float wakeV = exp(-abs(abs(du) - back * 0.42 - rb * 0.9) * 3.0) * exp(-back * 0.14) * step(dv, 0.0) * smoothstep(0.3, 0.7, lace + 0.3);
      float foamK = clamp((contact + tendrils * 1.1 + rings + wakeV * 0.8) * k, 0.0, 1.0);
      col = mix(col, uFoam * 1.25, foamK);
    }
  }

  // 04: exactly five glowing chevrons pointing downhill (direction of travel)
  if (uChevron.z > 0.5) {
    float x = u * vHalfW;
    for (int k = 0; k < 5; k++) {
      float y = s - (uChevron.x + float(k) * uChevron.y);
      if (abs(y) < 2.4 && abs(x) < 1.6) {
        // "^" pointing toward +s: tip at y=+1.0, arms sweep back 1.9 units over ±1.15 lateral
        float dist = abs(y - (1.0 - abs(x) * 1.65)) * 0.52;
        float arm = smoothstep(1.2, 1.1, abs(x));
        float core = smoothstep(0.2, 0.11, dist) * arm;
        float halo = smoothstep(0.7, 0.0, dist) * smoothstep(1.5, 0.9, abs(x)) * 0.5;
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
    uBennyR: { value: 0.7 },
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
