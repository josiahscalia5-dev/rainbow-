/**
 * Rider splash fans (ref 05: two V-shaped spray fans of white/cyan streaks thrown back and outward
 * from Benny's base, clear water straight behind him).
 *
 * One small mesh: two polar strips (left/right fan) of angle × radial, shaped and animated in the
 * vertex shader, drawn with a translucent "streak + droplet" fragment shader (no lace haze). It is
 * placed every frame at the computed water surface under Benny's real (lifted) body centre
 * (index.ts `wake()`), so its root always sits on the stream at his waterline. Hidden automatically
 * when wake() stops being called (intro / outro).
 */
import * as THREE from 'three';
import { FRAG_TAIL, NOISE_GLSL, withFog } from './glsl';

/** fan angle range from straight behind (0 = towards the chase camera, pi/2 = sideways) */
const TH0 = 0.32;
const TH1 = 1.4;

const VERT = /* glsl */ `
attribute vec2 aPolar;   // x = signed angle (side * th), y = radial 0..1
uniform float uTime;
uniform float uR;        // waterline radius of Benny's body (units): fan root
uniform float uLen;      // fan length beyond the root (units)
uniform float uH;        // peak height of the spray sheet (units)
uniform float uStrength; // 0..1
varying vec2 vPolar;
varying vec3 vPosW;
#include <fog_pars_vertex>
float h1(float n) { return fract(sin(n) * 43758.5453); }
float n1(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(i), h1(i + 1.0), f); }
void main() {
  float th = aPolar.x;
  float t = aPolar.y;
  float ath = abs(th);
  float wob = n1(ath * 6.0 + uTime * 6.0 + step(0.0, th) * 13.0) * 0.6 + n1(ath * 15.0 - uTime * 9.0) * 0.4;
  // the fan is longest on its diagonal (~45 deg back), shorter where it turns sideways
  float diag = 1.0 - 0.35 * smoothstep(0.9, 1.4, ath) - 0.25 * (1.0 - smoothstep(${TH0.toFixed(2)}, 0.6, ath));
  float r = uR * 0.92 + t * uLen * diag * (0.8 + 0.4 * wob) * (0.55 + 0.45 * uStrength);
  // sheet leaves the water at the body, arcs up and falls back toward the surface at its tips
  float y = uH * uStrength * (0.75 + 0.5 * wob) * sin(3.14159 * pow(t, 0.6)) * (1.0 - 0.45 * t) - 0.02;
  vec3 p = vec3(sin(th) * r, y, cos(th) * r);   // local: x = side, y = up, z = backwards
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vPosW = wp.xyz;
  vPolar = aPolar;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform float uStrength;
varying vec2 vPolar;
varying vec3 vPosW;
#include <fog_pars_fragment>
${NOISE_GLSL}
void main() {
  float th = vPolar.x;
  float t = vPolar.y;
  float ath = abs(th);
  float seed = step(0.0, th) * 7.3;
  // fine radial streaks (water jets) racing outward; two scales so they never read as a solid sheet
  float s1 = vnoise(vec2(ath * 46.0 + seed, t * 2.2 - uTime * 5.0));
  float s2 = vnoise(vec2(ath * 97.0 + seed * 2.0, t * 3.5 - uTime * 7.0));
  float streak = max(smoothstep(0.6, 0.86, s1), smoothstep(0.66, 0.9, s2) * 0.8);
  // droplet beads breaking off the streak tips
  vec2 g = vec2(ath * 30.0 + seed, t * 9.0 - uTime * 6.0);
  float cd = cells(g);
  float beads = (1.0 - smoothstep(0.1, 0.22, cd)) * step(0.55, hash12(floor(g) + seed)) * smoothstep(0.35, 0.7, t);
  // fan envelope: fade at both angle limits, at the root (hidden under the fur) and toward the tips
  float env = smoothstep(${TH0.toFixed(2)}, ${(TH0 + 0.2).toFixed(2)}, ath) * (1.0 - smoothstep(${(TH1 - 0.3).toFixed(2)}, ${TH1.toFixed(2)}, ath));
  float a = (streak * (1.0 - smoothstep(0.45, 0.92, t)) + beads * (1.0 - smoothstep(0.75, 1.0, t))) * env;
  a *= smoothstep(0.0, 0.06, t) * uStrength;
  if (a < 0.03) discard;
  // white cores, cyan translucent edges
  vec3 col = mix(vec3(0.55, 0.9, 1.0), vec3(1.25, 1.28, 1.3), smoothstep(0.25, 0.8, a));
  gl_FragColor = vec4(col, clamp(a * 0.95, 0.0, 0.92));
  ${FRAG_TAIL}
}
`;

export interface RiderSplash {
  mesh: THREE.Mesh;
  uniforms: Record<string, THREE.IUniform>;
  /** place on the water under Benny: waterline centre + frame + body radius at the waterline */
  place(center: THREE.Vector3, forward: THREE.Vector3, up: THREE.Vector3, radius: number, strength: number): void;
  update(time: number, dt: number): void;
}

export function createRiderSplash(quality: 'high' | 'low'): RiderSplash {
  const S = quality === 'high' ? 22 : 12; // angular columns per fan
  const R = quality === 'high' ? 6 : 4;
  const cols = S + 1, rows = R + 1;
  const polar = new Float32Array(2 * cols * rows * 2);
  let k = 0;
  for (const side of [-1, 1]) {
    for (let i = 0; i <= S; i++) {
      const th = TH0 + ((TH1 - TH0) * i) / S;
      for (let j = 0; j <= R; j++) {
        polar[k++] = side * th;
        polar[k++] = j / R;
      }
    }
  }
  const idx: number[] = [];
  for (let f = 0; f < 2; f++) {
    const base = f * cols * rows;
    for (let i = 0; i < S; i++) {
      for (let j = 0; j < R; j++) {
        const a = base + i * rows + j, b = a + 1, c = a + rows, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('aPolar', new THREE.BufferAttribute(polar, 2));
  // dummy position attribute (positions are generated in the vertex shader)
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(2 * cols * rows * 3), 3));
  geo.setIndex(idx);
  const uniforms = withFog({ uTime: { value: 0 }, uR: { value: 0.45 }, uLen: { value: 1.7 }, uH: { value: 0.32 }, uStrength: { value: 0 } });
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    fog: true,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'rider_splash';
  mesh.frustumCulled = false;
  mesh.renderOrder = 3;
  mesh.visible = false;
  const basis = new THREE.Matrix4();
  const back = new THREE.Vector3();
  const side = new THREE.Vector3();
  let target = 0;
  let fed = false;
  return {
    mesh,
    uniforms,
    place(center, forward, up, radius, strength) {
      back.copy(forward).multiplyScalar(-1);
      side.crossVectors(up, back).normalize(); // x × y = z  →  (side, up, back) right-handed
      basis.makeBasis(side, up, back);
      mesh.quaternion.setFromRotationMatrix(basis);
      mesh.position.copy(center);
      uniforms.uR.value = radius;
      target = strength;
      fed = true;
    },
    update(time, dt) {
      uniforms.uTime.value = time;
      if (!fed) target = 0;
      fed = false;
      const s = uniforms.uStrength.value as number;
      const v = dt > 0 ? s + (target - s) * Math.min(1, dt * 6) : target;
      uniforms.uStrength.value = v;
      mesh.visible = v > 0.01;
    },
  };
}
