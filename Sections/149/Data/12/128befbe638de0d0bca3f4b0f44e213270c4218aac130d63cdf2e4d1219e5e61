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
import { WATER05, on05, proj05Pending } from './waterRibbon'; // Screen 05 water test W10 (?water05=1): thinner, wider splash threads

/** explicit `?<key>=0` switches a reference-match part off even under the master `?match05=1` (A/B captures) */
const off05 = (key: string): boolean => {
  try {
    return typeof location !== 'undefined' && new URLSearchParams(location.search).get(key) === '0';
  } catch {
    return false;
  }
};
/**
 * `?splash05m=1` (on with `?match05=1`; foam-bubbles-particles, qa/pilot05/full_reference_match/splash_bubbles/NOTES.md):
 * Screen 05's splash becomes the APPROVED splash — a low fan of white-blue filaments, droplets and the bright foam collar
 * under Benny — carried by a card lying on the water in Benny's frame (createWakeCard05 below) instead of the two
 * "angel wing" fans of straight white rope streaks. Off (default): nothing here runs.
 */
export const SPLASH05M: boolean = on05('splash05m') && !off05('splash05m');
/** live state of the 05 wake card, read by spray.ts (under SPLASH05M the small wake droplets step aside on 05) */
export const wake05State = { active: 0 };

/**
 * Jet layout shared with the spray droplets (index.ts): across a = 0 (outer, most sideways jet) … 1
 * (inner, most backward jet). Angles in radians measured from straight back (towards the chase camera).
 * Ref 05 at the live camera (≈185 px per lateral unit, ≈100 px per unit back at Benny): the outer jets
 * leave at ≈32° below the horizontal on screen (≈41° from back in the world), the inner ones at ≈67°
 * (≈13° from back).
 */
export const FAN = {
  /** root angle on the root circle (ref 05 roots ≈(330, 1180) / (540, 1170): ≈0.5 u out, 0.3 u back) */
  root0: 1.25,
  root1: 0.72,
  /** jet direction */
  dir0: 0.78,
  dir1: 0.1,
  /** jets start at the fur skirt, not under the body: root circle radius ≥ this (units) */
  rootMin: 0.56,
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
  float phi = mix(${FAN.dir0.toFixed(3)}, ${FAN.dir1.toFixed(3)}, a) + (hs(seed * 5.7) - 0.5) * 0.3 + 0.18 * tau;
  vec2 root = vec2(sin(thR), cos(thR)) * max(uR, ${FAN.rootMin.toFixed(3)}) * (0.9 + 0.12 * hs(seed * 2.3));
  float len = uLen * (0.6 + 0.4 * hs(seed * 7.3)) * (0.85 + 0.15 * sin(3.14159 * a)) * (0.55 + 0.45 * uStrength);
  len *= mix(1.0, 0.5, froth);
  vec2 q = root + vec2(sin(phi), cos(phi)) * tau * len;
  // most jets skim low over the water (ref: a flat fan), one in five is flung up as a high arc
  float tall = step(0.8, hs(seed * 29.3));
  float H = uH * mix(0.22 + 0.4 * hs(seed * 9.1), 1.0 + 0.35 * hs(seed * 9.1), tall) * (1.1 - 0.4 * a) * uStrength * mix(1.0, 0.4, froth);
  float tp = pow(max(tau, 0.0), 0.7);
  float y = H * 4.0 * tp * (1.0 - tp) - 0.012;
  return vec3(side * q.x, y, q.y);
}
void main() {
  float side = aJet.x;
  float a = aJet.y;
  float seed = aJet.w;
  float froth = step(0.6, hs(seed * 17.9));
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
  float w = mix(mix(0.011, 0.024, hs(seed * 19.1)), mix(0.05, 0.095, hs(seed * 23.3)), froth);
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
  float alpha = k * life * uStrength * mix(0.95, 0.75, vFroth);
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
  const perSide = quality === 'high' ? 150 : 60;
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
  const uniforms = withFog({ uTime: { value: 0 }, uR: { value: 0.45 }, uLen: { value: 1.25 }, uH: { value: 0.34 }, uStrength: { value: 0 } });
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

// ------------------------------------------------------------------------------------------------ 05 splash (wave 8)
/**
 * Ref 05 splash, wave 8: the water parts round Benny's base and pours back-outward in two fans of WHITEWATER ROPES
 * lying on the surface (white, bubbly, lumpy-edged, thinning and turning translucent cyan toward their tails; outer
 * ropes ≈35° below the horizontal on screen, inner ones ≈70°), a frothy collar of fine bubbles at the roots, and a low
 * crown of droplet jets thrown up beside the body. Used only inside 05 (index.ts cross-fades it with the shared fan
 * above, which stays bit-identical in 03/04/06–10). One instanced draw, shaped and animated in the vertex shader.
 * aType: 0 = surface rope, 1 = crown droplet jet, 2 = root froth.
 */
const SEG5 = 8;
const VERT5 = /* glsl */ `
attribute vec2 aUV;      // x: 0 root .. 1 tail, y: -1..1 across
attribute vec4 aJet;     // x: side, y: across a (0 outer .. 1 inner), z: phase, w: seed
attribute float aType;
uniform float uTime;
uniform float uR;
uniform float uLen;
uniform float uStrength;
varying vec2 vUV;
varying float vSeed;
varying float vType;
varying float vLen;
varying float vTau;
#include <fog_pars_vertex>
float hs(float n) { return fract(sin(n * 91.345 + 3.17) * 43758.5453); }
vec3 ropePos(float u, float side, float a, float seed, float len) {
  // root on the waterline circle (from beside the body to its back flank), direction measured from straight back
  // roots just outside the fur's silhouette (the waterline chord uR hides under the body from the chase camera)
  #ifdef WATER05
  // W10 (?water05=1): approved splash = a wide fan of thin water threads leaving Benny's lower back and flanks
  // (straight back … ≈65° out), curling outward along their length; not two dense white "wings"
  float thR = mix(1.5, 0.35, a) + (hs(seed * 3.1) - 0.5) * 0.22;
  float phi = mix(1.1, 0.08, a) + (hs(seed * 5.7) - 0.5) * 0.34 + 0.35 * u * u;
  #else
  float thR = mix(1.4, 0.5, a) + (hs(seed * 3.1) - 0.5) * 0.18;
  float phi = mix(0.62, 0.06, a) + (hs(seed * 5.7) - 0.5) * 0.26 + 0.25 * u * u;
  #endif
  vec2 root = vec2(sin(thR), cos(thR)) * max(uR, 0.5) * (1.3 + 0.2 * hs(seed * 2.3));
  vec2 q = root + vec2(sin(phi), cos(phi)) * u * len;
  // ropes ride on the surface with small humps (whitewater, not flying jets)
  float y = 0.035 + 0.06 * hs(seed * 9.1) * sin(3.14159 * min(u * 1.6, 1.0)) * (1.0 - u);
  return vec3(side * q.x, y, q.y);
}
vec3 jetPos(float tau, float side, float a, float seed) {
  float thR = mix(1.6, 0.8, a) + (hs(seed * 3.1) - 0.5) * 0.2;
  float phi = mix(1.2, 0.45, a) + (hs(seed * 5.7) - 0.5) * 0.35;
  vec2 root = vec2(sin(thR), cos(thR)) * max(uR, 0.5) * 1.4;
  float len = (0.3 + 0.5 * hs(seed * 7.3)) * (0.55 + 0.45 * uStrength);
  vec2 q = root + vec2(sin(phi), cos(phi)) * tau * len;
  float H = (0.12 + 0.3 * hs(seed * 9.1)) * uStrength;
  return vec3(side * q.x, H * 4.0 * tau * (1.0 - tau) + 0.02, q.y);
}
void main() {
  float side = aJet.x, a = aJet.y, seed = aJet.w;
  vec3 p, tg;
  float w;
  vLen = 1.0;
  vTau = aUV.x;
  if (aType < 0.5) {
    // rope: fixed shape, breathing length; the lace texture flows along it in the fragment shader
    float len = uLen * (0.35 + 0.65 * hs(seed * 7.3)) * (0.9 + 0.1 * sin(uTime * 2.3 + seed * 20.0)) * (0.5 + 0.5 * uStrength);
    vLen = len;
    p = ropePos(aUV.x, side, a, seed, len);
    tg = ropePos(min(aUV.x + 0.04, 1.0), side, a, seed, len) - ropePos(max(aUV.x - 0.04, 0.0), side, a, seed, len);
    #ifdef WATER05
    // W10: thin threads (≈2–5 px near the camera), a little longer, so the water shows between them
    len *= 1.15;
    vLen = len;
    p = ropePos(aUV.x, side, a, seed, len);
    tg = ropePos(min(aUV.x + 0.04, 1.0), side, a, seed, len) - ropePos(max(aUV.x - 0.04, 0.0), side, a, seed, len);
    w = mix(0.015, 0.004, pow(aUV.x, 0.7)) * (0.55 + 0.7 * hs(seed * 19.1));
    #else
    w = mix(0.034, 0.008, pow(aUV.x, 0.7)) * (0.5 + 0.7 * hs(seed * 19.1));
    #endif
  } else if (aType < 1.5) {
    // crown droplet jet: the head runs root -> landing, the jet is a short chain of beads
    float rate = mix(1.6, 2.6, hs(seed * 11.3));
    float cyc = fract(aJet.z + uTime * rate);
    float tl = 0.3;
    float tau = clamp(cyc * (1.0 + tl) - (1.0 - aUV.x) * tl, 0.0, 1.0);
    vTau = tau;
    p = jetPos(tau, side, a, seed);
    tg = jetPos(min(tau + 0.03, 1.0), side, a, seed) - jetPos(max(tau - 0.03, 0.0), side, a, seed);
    w = mix(0.009, 0.018, hs(seed * 23.3));
  } else {
    // root froth: lace pads hugging the fur's silhouette at the water, from beside the body round to its back flank
    float th = mix(1.7, 0.3, a) + (hs(seed * 3.1) - 0.5) * 0.12;
    vec2 root = vec2(sin(th), cos(th)) * max(uR, 0.5) * (1.25 + 0.15 * hs(seed * 2.9));
    vec2 dir = vec2(sin(th + 0.35), cos(th + 0.35));
    float len = 0.2 + 0.18 * hs(seed * 7.3);
    vLen = len;
    vec2 q = root + dir * aUV.x * len;
    p = vec3(side * q.x, 0.06 + 0.04 * sin(3.14159 * aUV.x), q.y);
    tg = vec3(side * dir.x, 0.0, dir.y);
    w = (0.05 + 0.045 * hs(seed * 19.1)) * (1.0 - 0.35 * aUV.x);
  }
  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  vec2 tv = (modelViewMatrix * vec4(tg, 0.0)).xy;
  float tl2 = length(tv);
  vec2 nrm = tl2 > 1e-5 ? vec2(-tv.y, tv.x) / tl2 : vec2(0.0, 1.0);
  mvPosition.xy += nrm * aUV.y * w * (0.7 + 0.3 * uStrength);
  vUV = aUV;
  vSeed = seed;
  vType = aType;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;
const FRAG5 = /* glsl */ `
uniform float uTime;
uniform float uStrength;
varying vec2 vUV;
varying float vSeed;
varying float vType;
varying float vLen;
varying float vTau;
#include <fog_pars_fragment>
${NOISE_GLSL}
void main() {
  float ac = abs(vUV.y);
  vec3 cyan = vec3(0.45, 0.88, 1.0);
  vec3 white = vec3(1.1, 1.12, 1.16);
  vec3 blue = vec3(0.42, 0.6, 1.0);
  vec3 col;
  float alpha;
  if (vType < 0.5) {
    // whitewater rope: bubbly lace flowing back along it, lumpy edges, white root -> translucent cyan tail
    // chain of foam lumps (cells along the rope set a lumpy outline), breaking into separate blobs further out
    vec2 lp = vec2(vUV.x * vLen * 7.0 - uTime * 2.6 + vSeed * 31.0, vUV.y * 0.8 + vSeed * 7.0);
    float lc = cells(lp);
    float lump = 1.0 - smoothstep(0.25, 0.75, lc);
    float edge = 1.0 - smoothstep(0.25 + 0.6 * lump, 0.35 + 0.65 * lump, ac);
    float tail = 1.0 - smoothstep(0.55, 1.0, vUV.x);
    float brk = mix(1.0, smoothstep(0.3, 0.6, lump), smoothstep(0.2, 0.75, vUV.x));
    float hole = (1.0 - smoothstep(0.1, 0.2, cells(lp * 2.7 + 3.0))) * (1.0 - smoothstep(0.6, 1.0, ac));
    // it04: white only in the rope core, translucent cyan edges / tail, so the water shows between the strands
    alpha = edge * tail * brk * smoothstep(0.0, 0.04, vUV.x) * mix(0.9, 0.45, smoothstep(0.3, 1.0, ac + vUV.x * 0.5));
    col = mix(cyan, white, clamp(1.2 - vUV.x * 0.9 - ac * 0.9, 0.0, 1.0));
    col = mix(col, blue, hole * 0.55 * (1.0 - vUV.x));
  } else if (vType < 1.5) {
    // crown droplets: a chain of round beads, fading in off the water and out as they fall back
    // it05: small translucent water beads (cyan body, bright rim / glint), not white flakes
    vec2 bq = vec2((fract(vUV.x * 3.0 + vSeed * 7.0) - 0.5) * 2.4, vUV.y);
    float bd = length(bq);
    float bead = 1.0 - smoothstep(0.6, 0.9, bd);
    float life = smoothstep(0.0, 0.12, vTau) * (1.0 - smoothstep(0.75, 1.0, vTau));
    alpha = bead * life * (0.45 + 0.45 * smoothstep(0.3, 0.8, bd));
    col = mix(cyan, white, 0.35 + 0.6 * smoothstep(0.35, 0.8, bd));
  } else {
    // froth collar: fine bubbles (white with blue open holes), soft all round
    vec2 lp = vec2(vUV.x * vLen * 14.0 - uTime * 1.2 + vSeed * 17.0, vUV.y * 2.2 + vSeed * 5.0);
    float lc = cells(lp);
    float hole = 1.0 - smoothstep(0.1, 0.22, lc);
    float lace = 1.0 - smoothstep(0.45, 0.75, lc);
    float soft = (1.0 - smoothstep(0.4, 1.0, ac)) * smoothstep(0.0, 0.2, vUV.x) * (1.0 - smoothstep(0.6, 1.0, vUV.x));
    alpha = lace * soft * 0.9;
    col = mix(white, blue, hole * 0.7);
  }
  alpha *= uStrength;
  if (alpha < 0.02) discard;
  gl_FragColor = vec4(col, min(alpha, 1.0));
  ${FRAG_TAIL}
}
`;

/** wave 8: the 05 splash (same API as the shared fan) */
export function createRiderSplash05(quality: 'high' | 'low'): RiderSplash {
  if (SPLASH05M) return createWakeCard05();
  const nRope = quality === 'high' ? 44 : 20;
  const nJet = quality === 'high' ? 40 : 16;
  const nFroth = quality === 'high' ? 16 : 8;
  const uvs = new Float32Array((SEG5 + 1) * 2 * 2);
  for (let i = 0; i <= SEG5; i++) uvs.set([i / SEG5, -1, i / SEG5, 1], i * 4);
  const idx: number[] = [];
  for (let i = 0; i < SEG5; i++) {
    const a = i * 2, b = a + 1, c = a + 2, d = a + 3;
    idx.push(a, c, b, b, c, d);
  }
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute('aUV', new THREE.BufferAttribute(uvs, 2));
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((SEG5 + 1) * 2 * 3), 3));
  geo.setIndex(idx);
  const perSide = nRope + nJet + nFroth;
  const n = perSide * 2;
  const jet = new Float32Array(n * 4);
  const typ = new Float32Array(n);
  let k = 0;
  for (const side of [-1, 1]) {
    const h = (x: number) => { const v = Math.sin(x * 127.1 + side * 311.7) * 43758.5453; return v - Math.floor(v); };
    const add = (count: number, type: number, salt: number) => {
      for (let i = 0; i < count; i++) {
        const a = Math.min(1, Math.max(0, (i + h(i * 1.7 + salt)) / count));
        typ[k] = type;
        jet[k * 4] = side;
        jet[k * 4 + 1] = a;
        jet[k * 4 + 2] = (i * 0.6180339 + h(i * 3.3 + salt) * 0.25) % 1;
        jet[k * 4 + 3] = h(i * 5.1 + 0.37 + salt);
        k++;
      }
    };
    add(nFroth, 2, 11.0);
    add(nRope, 0, 0.0);
    add(nJet, 1, 5.0);
  }
  geo.setAttribute('aJet', new THREE.InstancedBufferAttribute(jet, 4));
  geo.setAttribute('aType', new THREE.InstancedBufferAttribute(typ, 1));
  geo.instanceCount = n;
  const uniforms = withFog({ uTime: { value: 0 }, uR: { value: 0.45 }, uLen: { value: 1.55 }, uStrength: { value: 0 } });
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT5, fragmentShader: FRAG5, fog: true, transparent: true, depthWrite: false, side: THREE.DoubleSide, ...(WATER05 ? { defines: { WATER05: 1 } } : {}) });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'rider_splash05';
  mesh.frustumCulled = false;
  mesh.renderOrder = 3;
  mesh.visible = false;
  const basis = new THREE.Matrix4();
  const back = new THREE.Vector3();
  const sideV = new THREE.Vector3();
  let target = 0;
  let fed = false;
  return {
    mesh,
    uniforms,
    place(center, forward, up, radius, strength) {
      back.copy(forward).multiplyScalar(-1);
      sideV.crossVectors(up, back).normalize();
      basis.makeBasis(sideV, up, back);
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

// ------------------------------------------------------------------------------------------------ 05 wake card (splash05m)
/**
 * `?splash05m=1`: the approved Screen 05 splash (Part 8 of the user's order: low fan-shaped white-blue spray from Benny's
 * base, fine droplets, curved filaments, foam collar and bright water under the body — not straight spiky streaks).
 * A flat card on the water in Benny's frame (placed every frame like the fans above: water surface under his lifted body
 * centre, side / up / back basis), so it moves, steers and turns with him. Its texture (assets/textures/splash05/wake05.png,
 * tools/splash05/bake.py) holds the approved splash as a premultiplied LINEAR layer (L, a) solved against the game's own
 * water through the inverse post chain, so it blends as light + a little cover over whatever water is under it:
 * out = L + water · (1 − a). Each fragment finds its texel by projecting its local position with the LOCKED 05 camera
 * (uLock: Benny frame → clip), i.e. the card is the approved splash camera-projected onto real geometry attached to Benny.
 * Animated: two-phase flow pushes the spray outward from his base (phase locked so the frozen QA clock t = 12 shows the
 * approved pixels), and it scales with the ride strength. One draw, 2 triangles, no per-frame CPU work besides placement.
 */
const CARD_VERT = /* glsl */ `
varying vec3 vLocal;
varying vec3 vView;
void main() {
  vLocal = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vView = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;
const CARD_FRAG = /* glsl */ `
uniform mat4 projectionMatrix;
uniform sampler2D uTex;
uniform mat4 uLock;      // Benny frame -> clip of the locked 05 camera
uniform vec4 uRect;      // texture origin x, y and size x, y (locked-frame pixels)
uniform vec2 uFrame;     // locked frame size (864, 1536)
uniform float uLmax;
uniform float uTime;
uniform float uStrength; // 1 = the locked ride strength
uniform vec2 uFlowO;     // locked-frame pixel the spray streams away from (Benny's base)
uniform vec3 uFlow;      // stream distance per cycle (px), cycles per second, phase (locks t = 12 to the approved pixels)
uniform float uBias;     // depth bias toward the camera (units): the river's vertex waves must not cut holes into the card
varying vec3 vLocal;
varying vec3 vView;
vec4 tap(vec2 px) {
  vec2 uv = (px - uRect.xy) / uRect.zw;
  if (uv.x <= 0.0 || uv.y <= 0.0 || uv.x >= 1.0 || uv.y >= 1.0) return vec4(0.0);
  vec3 e = texture2D(uTex, vec2(uv.x, uv.y * 0.5)).rgb;
  float a = texture2D(uTex, vec2(uv.x, 0.5 + uv.y * 0.5)).r;
  return vec4(e * e * uLmax, a);
}
void main() {
  vec4 c = uLock * vec4(vLocal, 1.0);
  if (c.w <= 1e-4) discard;
  vec2 ndc = c.xy / c.w;
  vec2 px = vec2((ndc.x * 0.5 + 0.5) * uFrame.x, (0.5 - ndc.y * 0.5) * uFrame.y);
  vec2 dv = px - uFlowO;
  vec2 dir = dv / max(length(dv), 1.0);
  float p = fract(uTime * uFlow.y + uFlow.z);
  float q = fract(p + 0.5);
  float wA = 1.0 - abs(2.0 * p - 1.0);
  vec4 o = tap(px - dir * (p - 0.5) * uFlow.x) * wA + tap(px - dir * (q - 0.5) * uFlow.x) * (1.0 - wA);
  o *= uStrength;
  if (o.a < 0.002 && max(o.r, max(o.g, o.b)) < 0.002) discard;
  vec4 cb = projectionMatrix * vec4(vView * (1.0 - uBias / max(length(vView), uBias + 0.1)), 1.0);
  gl_FragDepth = 0.5 * cb.z / cb.w + 0.5;
  gl_FragColor = o;
}
`;

/** card footprint on the water (Benny frame, units): covers the locked splash rays (x ±1.6, back −1.6 … 1.5) */
const CARD_HALF = 1.8;
/** card height above the waterline point (units) */
const CARD_LIFT = 0.04;
/** depth bias toward the camera (units, gl_FragDepth): the river's vertex waves (± ≈ 0.25 u around Benny) stay behind the
 *  card, while his fur and anything else clearly in front of it still hides it */
const CARD_BIAS = 0.4;

function createWakeCard05(): RiderSplash {
  const geo = new THREE.PlaneGeometry(CARD_HALF * 2, CARD_HALF * 2, 1, 1);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, CARD_LIFT, 0);
  const uniforms: Record<string, THREE.IUniform> = {
    uTex: { value: null },
    uLock: { value: new THREE.Matrix4() },
    uRect: { value: new THREE.Vector4(0, 0, 1, 1) },
    uFrame: { value: new THREE.Vector2(864, 1536) },
    uLmax: { value: 2 },
    uTime: { value: 0 },
    uStrength: { value: 0 },
    uFlowO: { value: new THREE.Vector2(423, 1060) },
    uFlow: { value: new THREE.Vector3(12, 1.4, 0) },
    uBias: { value: CARD_BIAS },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: CARD_VERT,
    fragmentShader: CARD_FRAG,
    transparent: true,
    depthWrite: false,
    fog: false,
    blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor,
    blendDst: THREE.OneMinusSrcAlphaFactor,
    blendSrcAlpha: THREE.OneFactor,
    blendDstAlpha: THREE.OneMinusSrcAlphaFactor,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'rider_splash05';
  mesh.frustumCulled = false;
  mesh.renderOrder = 3;
  mesh.visible = false;
  let sLock = 1;
  let loaded = false;
  proj05Pending.push(Promise.all([
    fetch(new URL('../../assets/textures/splash05/wake05.json', import.meta.url).href).then((r) => r.json()),
    new Promise<THREE.Texture | null>((res) => {
      new THREE.TextureLoader().load(new URL('../../assets/textures/splash05/wake05.png', import.meta.url).href, (t) => res(t), undefined, () => res(null));
    }),
  ]).then(([meta, tex]) => {
    if (!tex) return;
    tex.flipY = false;
    tex.colorSpace = THREE.NoColorSpace;
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    uniforms.uTex.value = tex;
    (uniforms.uLock.value as THREE.Matrix4).fromArray(meta.lock);
    (uniforms.uRect.value as THREE.Vector4).set(meta.org[0], meta.org[1], meta.size[0], meta.size[1]);
    (uniforms.uFrame.value as THREE.Vector2).set(meta.frame[0], meta.frame[1]);
    uniforms.uLmax.value = meta.LMAX;
    // flow phase: the frozen QA clock (t_lock) sits at the full-weight, zero-offset point of phase A
    const f = uniforms.uFlow.value as THREE.Vector3;
    f.z = 0.5 - ((meta.t_lock * f.y) % 1);
    sLock = meta.strength;
    loaded = true;
  }).catch(() => undefined));
  const basis = new THREE.Matrix4();
  const back = new THREE.Vector3();
  const sideV = new THREE.Vector3();
  let target = 0;
  let fed = false;
  let s = 0;
  return {
    mesh,
    uniforms,
    place(center, forward, up, _radius, strength) {
      back.copy(forward).multiplyScalar(-1);
      sideV.crossVectors(up, back).normalize();
      basis.makeBasis(sideV, up, back);
      mesh.quaternion.setFromRotationMatrix(basis);
      mesh.position.copy(center);
      target = strength;
      fed = true;
    },
    update(time, dt) {
      uniforms.uTime.value = time;
      if (!fed) target = 0;
      fed = false;
      s = dt > 0 ? s + (target - s) * Math.min(1, dt * 6) : target;
      // full approved splash from 95 % of the locked ride strength up, thinner when Benny slows down
      uniforms.uStrength.value = Math.min(1, s / (0.95 * sLock));
      mesh.visible = loaded && s > 0.01;
      wake05State.active = mesh.visible ? 1 : 0;
    },
  };
}
