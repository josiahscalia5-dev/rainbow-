/**
 * Rider splash (ref 05: a V of fine white/cyan droplet streaks thrown BACK and OUTWARD from Benny's
 * base, one fan per flank, frothy lace at the roots, clear glossy water straight behind him).
 *
 * Wave 4 rebuild. The wave-3 fan was one continuous mesh sheet per flank (16 × 8 quads) whose straight
 * borders and long noise jets rendered as translucent white wedges / spikes beside Benny. Now the fan is
 * made of many INDEPENDENT streaks: each instance is a short, thin, camera-facing ribbon that rides along
 * its own ballistic jet path (rooted on the waterline circle under the fur, aimed back-outward, arcing up
 * and falling back to the water), tapers at its tail and breaks into droplet beads late in its flight.
 * A quarter of the instances are wider, short-lived "froth" puffs of white lace near the roots. Nothing
 * has a hard outline, so the fan reads as spray, not geometry. The ballistic droplets in spray.ts
 * (index.ts `wake()`) share the same jet layout (FAN).
 *
 * One instanced draw (2 × N streaks of 6 segments), shaped and animated entirely in the vertex shader
 * (no per-frame CPU work besides placement), placed every frame at the water surface under Benny's real
 * (lifted) body centre. Hidden automatically when wake() stops being called (intro / outro).
 */
import * as THREE from 'three';
import { FRAG_TAIL, NOISE_GLSL, withFog } from './glsl';

/**
 * Jet layout shared with the spray droplets (index.ts): across a = 0 (outer, most sideways jet) … 1
 * (inner, most backward jet). Angles in radians measured from straight back (towards the chase camera).
 * Ref 05 at the live camera (≈185 px per lateral unit, ≈100 px per unit back at Benny): the outer jets
 * leave at ≈32° below the horizontal on screen (≈41° from back in the world), the inner ones at ≈67°
 * (≈13° from back).
 */
export const FAN = {
  /** root angle on the body's waterline circle */
  root0: 1.45,
  root1: 0.85,
  /** jet direction */
  dir0: 0.8,
  dir1: 0.2,
} as const;

const SEG = 6;

const VERT = /* glsl */ `
attribute vec2 aUV;      // x: 0 tail .. 1 head (along the streak), y: -1..1 across
attribute vec4 aJet;     // x: side (-1 / 1), y: across a (0 outer .. 1 inner), z: phase, w: seed
uniform float uTime;
uniform float uR;        // waterline radius of Benny's body (units): jet roots sit on this circle
uniform float uLen;      // max jet length (units)
uniform float uH;        // max arc height (units)
uniform float uStrength; // 0..1
varying vec2 vUV;
varying float vTau;
varying float vSeed;
varying float vFroth;
#include <fog_pars_vertex>
float hs(float n) { return fract(sin(n * 91.345 + 3.17) * 43758.5453); }
vec3 jetPos(float tau, float side, float a, float seed, float froth) {
  float thR = mix(${FAN.root0.toFixed(3)}, ${FAN.root1.toFixed(3)}, a) + (hs(seed * 3.1) - 0.5) * 0.14;
  // jets curl slightly outward as they fly (ref: the outer streaks bend towards the banks)
  float phi = mix(${FAN.dir0.toFixed(3)}, ${FAN.dir1.toFixed(3)}, a) + (hs(seed * 5.7) - 0.5) * 0.2 + 0.22 * tau;
  vec2 root = vec2(sin(thR), cos(thR)) * uR * 0.96;
  float len = uLen * (0.5 + 0.5 * hs(seed * 7.3)) * (0.78 + 0.22 * sin(3.14159 * a)) * (0.55 + 0.45 * uStrength);
  len *= mix(1.0, 0.42, froth);
  vec2 q = root + vec2(sin(phi), cos(phi)) * tau * len;
  float H = uH * (0.3 + 0.7 * hs(seed * 9.1)) * (1.15 - 0.55 * a) * uStrength * mix(1.0, 0.35, froth);
  float tp = pow(max(tau, 0.0), 0.7);
  float y = H * 4.0 * tp * (1.0 - tp) - 0.012;
  return vec3(side * q.x, y, q.y);
}
void main() {
  float side = aJet.x;
  float a = aJet.y;
  float seed = aJet.w;
  float froth = step(0.74, hs(seed * 17.9));
  // life cycle: the streak's head runs from the root (tau 0) to the landing point (tau 1)
  float rate = mix(1.5, 2.5, hs(seed * 11.3)) * mix(1.0, 1.4, froth);
  float cyc = fract(aJet.z + uTime * rate);
  float tl = mix(0.22, 0.5, hs(seed * 13.7)) * mix(1.0, 0.6, froth);
  float head = cyc * (1.0 + tl);
  float tau = clamp(head - (1.0 - aUV.x) * tl, 0.0, 1.0);
  vec3 p = jetPos(tau, side, a, seed, froth);
  vec3 tg = jetPos(min(tau + 0.03, 1.0), side, a, seed, froth) - jetPos(max(tau - 0.03, 0.0), side, a, seed, froth);
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  vec2 tv = (modelViewMatrix * vec4(tg, 0.0)).xy;
  float tl2 = length(tv);
  vec2 nrm = tl2 > 1e-5 ? vec2(-tv.y, tv.x) / tl2 : vec2(0.0, 1.0);
  // thin jets (≈2–5 px wide at Benny's distance), wider soft froth; tapered tail, round head
  float w = mix(mix(0.009, 0.02, hs(seed * 19.1)), mix(0.045, 0.08, hs(seed * 23.3)), froth);
  w *= mix(0.35, 1.0, smoothstep(0.0, 0.7, aUV.x)) * (0.7 + 0.3 * uStrength);
  mvPosition.xy += nrm * aUV.y * w;
  vUV = aUV;
  vTau = tau;
  vSeed = seed;
  vFroth = froth;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const FRAG = /* glsl */ `
uniform float uStrength;
varying vec2 vUV;
varying float vTau;
varying float vSeed;
varying float vFroth;
#include <fog_pars_fragment>
${NOISE_GLSL}
void main() {
  float ac = abs(vUV.y);
  float across = 1.0 - smoothstep(0.25, 1.0, ac);
  float along = smoothstep(0.0, 0.75, vUV.x);
  // fade in as it leaves the water under the fur, fade out as it falls back in
  float life = smoothstep(0.0, 0.1, vTau) * (1.0 - smoothstep(0.78, 1.0, vTau));
  // late in flight the jet breaks into droplet beads
  float bead = 1.0 - smoothstep(0.18, 0.42, abs(fract(vUV.x * 3.0 + vSeed * 7.0) - 0.5));
  float breakup = smoothstep(0.42, 0.75, vTau);
  float jet = across * along * mix(1.0, bead, breakup);
  // froth: bubbly white lace (open cells), soft all round
  float lc = cells(vec2(vUV.x * 2.6 + vSeed * 31.0, vUV.y * 1.3 + vSeed * 17.0));
  float lace = (1.0 - smoothstep(0.25, 0.55, lc)) * (1.0 - smoothstep(0.5, 1.0, ac)) * smoothstep(0.0, 0.35, vUV.x);
  float k = mix(jet, lace, vFroth);
  float alpha = k * life * uStrength * mix(0.85, 0.6, vFroth);
  if (alpha < 0.015) discard;
  // white core, cyan translucent edges; froth slightly lavender in its crevices
  vec3 cyan = vec3(0.42, 0.86, 1.0);
  vec3 white = vec3(1.12, 1.14, 1.18);
  vec3 col = mix(cyan, white, mix(smoothstep(0.1, 0.9, across) * (0.55 + 0.45 * along), 0.85, vFroth));
  col = mix(col, vec3(0.86, 0.84, 1.06), vFroth * smoothstep(0.15, 0.4, lc) * 0.35);
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
  const perSide = quality === 'high' ? 120 : 48;
  // base strip: SEG segments along, 2 vertices across
  const uvs = new Float32Array((SEG + 1) * 2 * 2);
  for (let i = 0; i <= SEG; i++) {
    uvs.set([i / SEG, -1, i / SEG, 1], i * 4);
  }
  const idx: number[] = [];
  for (let i = 0; i < SEG; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    idx.push(a, c, b, b, c, d);
  }
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute('aUV', new THREE.BufferAttribute(uvs, 2));
  // dummy position attribute (positions are generated in the vertex shader)
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((SEG + 1) * 2 * 3), 3));
  geo.setIndex(idx);
  const n = perSide * 2;
  const jet = new Float32Array(n * 4);
  // deterministic layout: stratified across the fan, golden-ratio phases (no clumping in a frozen frame)
  let k = 0;
  for (const side of [-1, 1]) {
    for (let i = 0; i < perSide; i++) {
      const h = (x: number) => { const v = Math.sin(x * 127.1 + side * 311.7) * 43758.5453; return v - Math.floor(v); };
      const a = Math.min(1, Math.max(0, (i + h(i * 1.7)) / perSide));
      jet[k++] = side;
      // denser towards the middle of the fan, thinner at both borders
      jet[k++] = 0.5 + (a - 0.5) * (0.75 + 0.25 * Math.abs(a - 0.5) * 2);
      jet[k++] = (i * 0.6180339 + h(i * 3.3) * 0.25) % 1;
      jet[k++] = h(i * 5.1 + 0.37);
    }
  }
  geo.setAttribute('aJet', new THREE.InstancedBufferAttribute(jet, 4));
  geo.instanceCount = n;
  const uniforms = withFog({ uTime: { value: 0 }, uR: { value: 0.45 }, uLen: { value: 1.15 }, uH: { value: 0.32 }, uStrength: { value: 0 } });
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
