/**
 * Rider splash fans (ref 05: a V-shaped spray of white/cyan droplet streaks thrown BACK and OUTWARD
 * from Benny's base, one fan per flank, and clear glossy water straight behind him).
 *
 * Wave 3 rebuild. The old fan was a polar strip centred on Benny's axis (angles 18°–80° from straight
 * back) drawn with crisp hair-thin white streaks: from the chase camera it read as a white serrated
 * "whisker" crown around his base. Now each fan is a sheet of jets rooted on the FLANK of the body at
 * the waterline (root angle 53°–93° from straight back) and aimed back-outward (17°–63°), so the
 * two fans open into a V towards the camera and leave the water directly behind him clear (ref 05:
 * fan roots at x≈330 / x≈540, tips at ≈(190, 1250) / ≈(680, 1230)). The fragment shader draws soft,
 * translucent cyan sheets with white jet cores that break into droplet beads at the tips: no outline,
 * no white rim against the fur.
 *
 * One small mesh (two strips of across × along), shaped and animated in the vertex shader, placed
 * every frame at the computed water surface under Benny's real (lifted) body centre (index.ts
 * `wake()`). Hidden automatically when wake() stops being called (intro / outro).
 */
import * as THREE from 'three';
import { FRAG_TAIL, NOISE_GLSL, withFog } from './glsl';

/**
 * Jet layout shared with the spray droplets (index.ts): across a = 0 (outer, most sideways jet) … 1
 * (inner, most backward jet). Angles are measured from straight back (towards the chase camera).
 */
export const FAN = {
  /** root angle on the body's waterline circle */
  root0: 1.6,
  root1: 0.95,
  /** jet direction */
  dir0: 0.98,
  dir1: 0.26,
} as const;

const VERT = /* glsl */ `
attribute vec3 aFan;     // x = side (-1 / 1), y = across 0..1 (outer → inner), z = along 0..1 (root → tip)
uniform float uTime;
uniform float uR;        // waterline radius of Benny's body (units): jet roots sit on this circle
uniform float uLen;      // jet length (units)
uniform float uH;        // peak height of the spray sheet (units)
uniform float uStrength; // 0..1
varying vec3 vFan;
#include <fog_pars_vertex>
float h1(float n) { return fract(sin(n) * 43758.5453); }
float n1(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(i), h1(i + 1.0), f); }
void main() {
  float side = aFan.x;
  float a = aFan.y;
  float t = aFan.z;
  float seed = step(0.0, side) * 13.0;
  float wob = n1(a * 5.0 + uTime * 5.0 + seed) * 0.6 + n1(a * 13.0 - uTime * 8.0 + seed) * 0.4;
  float thR = mix(${FAN.root0.toFixed(3)}, ${FAN.root1.toFixed(3)}, a);
  float phi = mix(${FAN.dir0.toFixed(3)}, ${FAN.dir1.toFixed(3)}, a) + (wob - 0.5) * 0.12;
  vec2 root = vec2(sin(thR), cos(thR)) * uR * 0.97;
  // middle jets are the longest: the fan reads as a rounded wedge, not a rectangle
  float len = uLen * (0.72 + 0.28 * sin(3.14159 * a)) * (0.82 + 0.36 * wob) * (0.55 + 0.45 * uStrength);
  vec2 q = root + vec2(sin(phi), cos(phi)) * t * len;
  // the sheet leaves the water at the flank, arcs up and falls back to the surface at its tips
  float y = uH * uStrength * (0.7 + 0.5 * wob) * sin(3.14159 * pow(t, 0.45)) * (1.0 - 0.6 * t) - 0.015;
  vec3 p = vec3(side * q.x, y, q.y);   // local: x = side, y = up, z = backwards
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vFan = aFan;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform float uStrength;
varying vec3 vFan;
#include <fog_pars_fragment>
${NOISE_GLSL}
void main() {
  float a = vFan.y;
  float t = vFan.z;
  float seed = step(0.0, vFan.x) * 7.3;
  // jets: broad soft water jets plus finer ones racing outward (never hair-thin lines)
  float j1 = vnoise(vec2(a * 13.0 + seed, t * 1.4 - uTime * 4.0));
  float j2 = vnoise(vec2(a * 30.0 + seed * 2.0, t * 2.6 - uTime * 6.0));
  float jets = smoothstep(0.38, 0.78, j1) * 0.8 + smoothstep(0.5, 0.85, j2) * 0.5;
  // whitewater lace: bubbly white foam inside the jets, densest near the root (ref 05 fan texture)
  vec2 lg = vec2(a * 18.0 + seed, t * 6.0 - uTime * 3.0);
  float lc = cells(lg);
  float lace = (1.0 - smoothstep(0.18, 0.42, lc)) * (1.0 - smoothstep(0.35, 0.8, t)) * smoothstep(0.3, 0.7, j1 + 0.25);
  // the jets break into droplet beads towards the tips
  vec2 g = vec2(a * 22.0 + seed, t * 8.0 - uTime * 6.0);
  float cd = cells(g);
  float beads = (1.0 - smoothstep(0.12, 0.26, cd)) * step(0.45, hash12(floor(g) + seed)) * smoothstep(0.35, 0.7, t) * (1.0 - smoothstep(0.85, 1.0, t));
  float breakup = 1.0 - smoothstep(0.5, 0.95, t);
  // thin translucent cyan water sheet between the jets, densest at the root
  float sheet = (1.0 - smoothstep(0.05, 0.65, t)) * (0.4 + 0.6 * j1) * 0.35;
  // envelope: soft across both fan borders and at the root (under the fur): no hard outline
  float env = smoothstep(0.0, 0.2, a) * (1.0 - smoothstep(0.78, 1.0, a)) * smoothstep(0.0, 0.1, t);
  float white = clamp(jets * breakup + lace * 0.9 + beads, 0.0, 1.0);
  float alpha = clamp((white * 0.82 + sheet) * env * uStrength, 0.0, 0.85);
  if (alpha < 0.02) discard;
  vec3 col = mix(vec3(0.4, 0.84, 1.0), vec3(1.1, 1.13, 1.18), smoothstep(0.2, 0.8, white));
  // a touch of lavender in the lace crevices (soap foam, like the banks)
  col = mix(col, vec3(0.86, 0.84, 1.08), lace * smoothstep(0.1, 0.3, lc) * 0.35);
  gl_FragColor = vec4(col, alpha);
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
  const A = quality === 'high' ? 16 : 9; // across
  const T = quality === 'high' ? 8 : 5; // along
  const cols = A + 1, rows = T + 1;
  const fan = new Float32Array(2 * cols * rows * 3);
  let k = 0;
  for (const side of [-1, 1]) {
    for (let i = 0; i <= A; i++) {
      for (let j = 0; j <= T; j++) {
        fan[k++] = side;
        fan[k++] = i / A;
        fan[k++] = j / T;
      }
    }
  }
  const idx: number[] = [];
  for (let f = 0; f < 2; f++) {
    const base = f * cols * rows;
    for (let i = 0; i < A; i++) {
      for (let j = 0; j < T; j++) {
        const a = base + i * rows + j, b = a + 1, c = a + rows, d = c + 1;
        idx.push(a, c, b, b, c, d);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('aFan', new THREE.BufferAttribute(fan, 3));
  // dummy position attribute (positions are generated in the vertex shader)
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(2 * cols * rows * 3), 3));
  geo.setIndex(idx);
  const uniforms = withFog({ uTime: { value: 0 }, uR: { value: 0.45 }, uLen: { value: 1.45 }, uH: { value: 0.18 }, uStrength: { value: 0 } });
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
