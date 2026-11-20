/**
 * r30 foam06 (`f30*` switches, qa/match/06/r30/foam06/NOTES.md) — Screen 06 foam + bubbles WHILE Benny swims, toward the approved
 * picture (references/06_crest_the_rinse_arch.png) and the user's storyboard (docs/briefs/2026-11-20-r30/USER_S06_STORYBOARD_R30.png):
 *   `&f30bank=1` big soft BUBBLY foam heaps piled along both banks (white-lilac soap-foam lobes of many sizes, glossy highlight,
 *                faint iridescent rim, bubble pores on the shaded side), replacing the rows of small `m06fclu` puffs. One instanced
 *                draw (+ one soft-rim pass). Every heap is capped as ONE unit on screen (no giant occluding blobs near the camera:
 *                a near heap reads like the painting's big corner clusters), far heaps collapse (LOD).
 *   `&f30bub=1`  LARGE iridescent soap bubbles floating in the air beside Benny and along the slide (clear film, rainbow rims, white
 *                window highlights), a fixed pool recycled ahead of Benny (no allocation per frame), on-screen size capped, never
 *                over Benny himself, drifting slowly downstream and bobbing.
 *   `&f30ring=1` a lacy white splash ring round Benny where he sits in the water + a few droplets flicking off at his sides.
 *   `&f30=1`     all three.
 * Shown only on Screen 06 once the camera has left the approved viewpoint (the approved start view = the projected picture, which
 * carries its own foam / bubbles / splash): everything grows in with match06's away() factor, so the start view is unchanged.
 * Colours are the approved picture's display values, written through the post-chain inverse like the rest of match06.
 * Without an `f30` switch buildFoam30() returns null and nothing is built.
 */
import * as THREE from 'three';
import { PROJ05_INVERSE } from '../vfx/waterRibbon';
import type { Course } from './course';

/** the r6 river profile of assets/textures/match06/proj06.json (tiles.r6): water |l| <= WC, raised foam bank WC..WB (height HB) */
const WC = 2.3, WB = 3.6, HB = 0.18;

export interface Foam30 {
  group: THREE.Group;
  /** once per sim step, after match06.setAway (it re-shows the old m06fclu lobes, which f30bank hides again) */
  update(o: { on: boolean; away: number; camera: THREE.PerspectiveCamera; benny: THREE.Vector3; s: number; time: number; renderer: THREE.WebGLRenderer; m06group: THREE.Object3D }): void;
}

// ------------------------------------------------------------------------------------------------ bank heaps
const BANK_VERT = /* glsl */ `
attribute vec4 aB;   // lobe centre (world) + radius
attribute vec4 aC;   // heap foot centre (world) + heap radius
attribute float aS;  // >= 1 foam lobe, < 1 small bubble; fract = seed
uniform vec3 uCap;   // x = max heap radius on screen, y = max lobe radius on screen (fractions of the half-height), z = grow-in 0..1
uniform vec2 uFar;   // LOD: heaps fade (shrink) out between these camera distances (u)
varying vec2 vUv;
varying float vS;
varying float vPx;
void main() {
  vUv = uv * 2.0 - 1.0;
  vS = aS;
  float P = projectionMatrix[1][1];
  float zc = -(viewMatrix * vec4(aC.xyz, 1.0)).z;
  // the whole heap is scaled about its foot so it never covers more than uCap.x of the screen (near corners = big clusters,
  // not a wall of white); behind / at the camera and beyond uFar it collapses
  float k = min(1.0, uCap.x / max(aC.w * P / max(zc, 0.05), 1e-4)) * uCap.z;
  k *= smoothstep(0.4, 1.2, zc) * (1.0 - smoothstep(uFar.x, uFar.y, zc));
  vec4 mv = viewMatrix * vec4(aC.xyz + (aB.xyz - aC.xyz) * k, 1.0);
  float r = aB.w * k;
  float lp = r * P / max(-mv.z, 0.05);
  r *= min(1.0, uCap.y / max(lp, 1e-4));
  vPx = r * P / max(-mv.z, 0.05);
  r *= step(0.0012, vPx); // LOD: lobes under ~1 px are dropped
  mv.xy += position.xy * r * 2.0;
  gl_Position = projectionMatrix * mv;
}`;
// approved picture's foam heaps (display values): white tops (253,252,253), pale lilac (238,230,252), lilac-blue (191,192,250),
// cool shadow (159,172,247); pores = darker lilac-blue dots with a glint; glossy white highlight up-left; faint pink/cyan rim
const BANK_FRAG = /* glsl */ `
uniform vec4 uPjPost;
uniform vec2 uPjRes;
varying vec2 vUv;
varying float vS;
varying float vPx;
${PROJ05_INVERSE}
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  float r = length(vUv);
  if (r > 1.0) discard;
#ifdef RIM
  if (r < 0.84) discard;
#else
  if (r > 0.9) discard;
#endif
  bool lobe = vS >= 1.0;
  float s = fract(vS);
  vec3 nrm = vec3(vUv, sqrt(max(0.0, 1.0 - r * r)));
  vec3 L = normalize(vec3(-0.40, 0.74, 0.55));
  float lt = dot(nrm, L);
  vec3 cSh = vec3(0.60, 0.66, 0.96), cMid = vec3(0.75, 0.75, 0.98), cLi = vec3(0.93, 0.90, 0.99), cW = vec3(0.995, 0.99, 0.995);
  vec3 col = mix(cSh, cMid, smoothstep(-0.35, 0.25, lt));
  col = mix(col, cLi, smoothstep(0.25, 0.62, lt));
  col = mix(col, cW, smoothstep(0.60, 0.90, lt));
  // bounce light from the cyan water on the underside
  col = mix(col, vec3(0.66, 0.80, 1.0), 0.35 * smoothstep(-0.2, -0.85, vUv.y) * smoothstep(0.2, -0.4, lt));
  if (lobe) {
    // bubble pores on the shaded part of a lobe (the painted froth), finer on lobes that are big on screen
    float cells = clamp(vPx * 70.0, 4.5, 15.0);
    vec2 q = vUv * cells + s * 17.0;
    vec2 id = floor(q), f = fract(q) - 0.5;
    vec2 jt = vec2(h21(id), h21(id + 7.3)) - 0.5;
    float pr = 0.12 + 0.13 * h21(id + 3.1);
    float pd = length(f - jt * 0.45);
    float pore = (1.0 - smoothstep(pr * 0.65, pr, pd)) * step(0.42, h21(id + 11.0)) * smoothstep(0.5, 0.05, lt) * smoothstep(0.98, 0.7, r);
    col = mix(col, cSh * 0.78, pore * 0.8);
    col = mix(col, cW, (1.0 - smoothstep(0.0, pr * 0.35, length(f - jt * 0.45 - vec2(-0.3, 0.3) * pr))) * pore * 0.75);
  }
  // glossy soap highlight: a crisp window up-left + a small glint
  float hl = smoothstep(0.24, 0.10, length((vUv - vec2(-0.38, 0.42)) * vec2(1.0, 1.35)));
  float hl2 = smoothstep(0.09, 0.03, length(vUv - vec2(0.40, -0.40)));
  col = mix(col, vec3(1.0), clamp((lobe ? 0.75 : 1.0) * hl + 0.55 * hl2, 0.0, 1.0));
  // faint iridescent rim (soap film seen edge-on): pink <-> cyan <-> lilac
  float ang = atan(vUv.y, vUv.x) + s * 6.2832;
  vec3 iri = 0.80 + 0.20 * cos(6.2832 * (vec3(0.0, 0.33, 0.67) + ang * 0.32 + r * 0.9));
  iri = mix(iri, vec3(0.98, 0.80, 1.0), 0.35);
  float fr = smoothstep(0.62, 0.98, r) * (0.4 + 0.6 * (1.0 - clamp(lt, 0.0, 1.0)));
  col = mix(col, iri, fr * (lobe ? 0.5 : 0.8));
  float a = 1.0;
#ifdef RIM
  a = 1.0 - smoothstep(0.88, 1.0, r);
#endif
  gl_FragColor = vec4(pjInverse(clamp(col, 0.0, 1.0)), a);
}`;

// ------------------------------------------------------------------------------------------------ floating bubbles
const BUB_VERT = /* glsl */ `
attribute vec4 aP;  // centre (world) + radius (already capped / faded on the CPU)
attribute vec2 aA;  // alpha, seed
varying vec2 vP;
varying vec2 vA;
varying float vPx;
void main() {
  vP = position.xy * 2.0;
  vA = aA;
  vec4 mv = viewMatrix * vec4(aP.xyz, 1.0);
  vPx = aP.w * projectionMatrix[1][1] / max(-mv.z, 0.05);
  mv.xy += position.xy * 2.0 * aP.w * step(0.002, aA.x);
  gl_Position = projectionMatrix * mv;
}`;
// the painted bubbles: nearly clear lilac-tinted inside, a bright rainbow film toward the rim (pink up-left, cyan / blue down-right,
// a touch of gold), a thin bright outline, a big soft white window highlight up-left and a crisp white dot down-right
const BUB_FRAG = /* glsl */ `
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform float uTime;
varying vec2 vP;
varying vec2 vA;
varying float vPx;
${PROJ05_INVERSE}
void main() {
  float d2 = dot(vP, vP);
  if (d2 > 1.0) discard;
  float d = sqrt(d2);
  float f = 1.0 - sqrt(1.0 - d2);              // 0 centre .. 1 silhouette
  float seed = vA.y;
  float sw = sin(vP.x * 3.1 + vP.y * 2.3 + uTime * 0.5 + seed * 20.0) * 0.5 + 0.5;
  float hue = f * 0.9 + 0.25 * sw - vP.x * 0.22 + vP.y * 0.28 + seed;
  vec3 film = 0.62 + 0.38 * cos(6.2832 * (hue + vec3(0.0, 0.36, 0.68)));
  film = mix(film, vec3(0.95, 0.70, 1.0), 0.25);           // toward the painting's pink-lilac
  vec3 cool = vec3(0.55, 0.85, 1.0);
  film = mix(film, cool, 0.35 * smoothstep(-0.2, 0.7, vP.x - vP.y));  // cyan down-right
  float rim = smoothstep(0.55, 0.98, d);
  float edge = smoothstep(0.90, 0.975, d) * (1.0 - smoothstep(0.975, 1.0, d));
  vec2 q1 = (vP - vec2(-0.36, 0.40)) * vec2(2.3, 3.2);
  float hl = exp(-dot(q1, q1) * 2.0);
  // the painted window: a curved crescent highlight hugging the upper-left rim
  float cres = smoothstep(0.62, 0.78, d) * (1.0 - smoothstep(0.86, 0.95, d)) * smoothstep(0.2, 0.85, -vP.x * 0.6 + vP.y * 0.8);
  vec2 q2 = vP - vec2(0.40, -0.44);
  float dot2 = exp(-dot(q2, q2) * 70.0);
  float small = 1.0 - smoothstep(0.006, 0.02, vPx);   // tiny bubbles: ring + glint only
  vec3 inside = vec3(0.86, 0.80, 1.0);
  vec3 col = mix(inside, film, rim);
  col = mix(col, vec3(1.0), clamp(edge * 0.55 + hl * (1.0 - 0.4 * small) + cres * 0.7 + dot2, 0.0, 1.0));
  float a = 0.10 + 0.08 * sw + rim * 0.62 + edge * 0.3 + hl * 0.85 + cres * 0.6 + dot2;
  a = clamp(a, 0.0, 0.96) * vA.x;
  gl_FragColor = vec4(pjInverse(clamp(col, 0.0, 1.0)), a);
}`;

// ------------------------------------------------------------------------------------------------ lace splash ring
const RING_VERT = /* glsl */ `
varying vec2 vL;
void main() {
  vL = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
// local frame: x = river right, y = downstream, ring in the water plane. Lace = a white frothy band hugging the body, wider at the
// sides, broken into holes (lace) with a beaded outer edge, slowly churning
const RING_FRAG = /* glsl */ `
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform float uTime;
uniform vec3 uRing;  // body waterline radius, band width, alpha
varying vec2 vL;
${PROJ05_INVERSE}
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
void main() {
  float rho = length(vL), th = atan(vL.y, vL.x);
  float side = abs(cos(th));                       // 1 at his left / right, 0 ahead / behind
  float R0 = uRing.x, w = uRing.y * (0.75 + 0.6 * side);
  float u = (rho - R0) / w;                        // 0 at the body .. 1 at the band's outer edge
  if (u < -0.15 || u > 1.6) discard;
  float ang = th * 7.0;
  float n1 = vn(vec2(th * 9.0 + uTime * 0.6, rho * 9.0 - uTime * 1.3));
  float n2 = vn(vec2(th * 23.0 - uTime * 0.9, rho * 22.0 + uTime * 0.7));
  float lace = smoothstep(0.38, 0.55, 0.62 * n1 + 0.38 * n2 + 0.25 * (1.0 - u));   // holes
  float band = smoothstep(-0.15, 0.08, u) * (1.0 - smoothstep(0.55 + 0.35 * n1, 1.0 + 0.25 * n2, u));
  // beads on the outer edge: a ring of small droplets
  float cells = 46.0 + 10.0 * side;
  float cid = floor((th / 6.2832 + 0.5) * cells);
  float cf = fract((th / 6.2832 + 0.5) * cells) - 0.5;
  float bu = 1.05 + 0.35 * h21(vec2(cid, 3.0));
  float bead = (1.0 - smoothstep(0.18, 0.30, length(vec2(cf * 6.2832 * rho / cells * 2.0 / w, (u - bu) * 1.6)))) * step(0.35, h21(vec2(cid, 9.0)));
  float m = max(band * lace, bead * 0.9);
  if (m < 0.02) discard;
  vec3 col = mix(vec3(0.78, 0.93, 1.0), vec3(1.0), smoothstep(0.3, 0.9, n2 + 0.3 * (1.0 - u)));
  gl_FragColor = vec4(pjInverse(col), m * uRing.z);
}`;
const DROP_VERT = /* glsl */ `
attribute float aSize;
uniform float uScale;
varying float vA;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = aSize > 0.0 ? clamp(aSize * uScale / max(-mv.z, 0.05), 1.5, 14.0) : 0.0;
  vA = aSize > 0.0 ? 1.0 : 0.0;
  gl_Position = projectionMatrix * mv;
}`;
const DROP_FRAG = /* glsl */ `
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform float uAlpha;
varying float vA;
${PROJ05_INVERSE}
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0 || vA < 0.5) discard;
  vec3 col = mix(vec3(1.0), vec3(0.70, 0.90, 1.0), smoothstep(0.4, 1.0, d));
  col = mix(col, vec3(1.0), smoothstep(0.35, 0.0, length(c - vec2(-0.12, -0.12))));
  gl_FragColor = vec4(pjInverse(col), (1.0 - smoothstep(0.75, 1.0, d)) * uAlpha);
}`;

export function buildFoam30(course: Course): Foam30 | null {
  if (typeof location === 'undefined') return null;
  const qs = new URLSearchParams(location.search);
  const all = qs.get('f30') === '1';
  const BANK = all || qs.get('f30bank') === '1', BUB = all || qs.get('f30bub') === '1', RING = all || qs.get('f30ring') === '1';
  if (!BANK && !BUB && !RING) return null;
  const num = (k: string, d: number) => { const v = qs.get(k); return v !== null && v !== '' && Number.isFinite(+v) ? +v : d; };
  const st = course.stage('06');
  const group = new THREE.Group();
  group.name = 'm06_f30';
  group.visible = false;
  // shared post-chain inverse (the match06 default grade; exposure + buffer size follow the renderer)
  const uPjPost = { value: new THREE.Vector4(0.86, 1.36, 1.15, 0.18) }, uPjRes = { value: new THREE.Vector2(864, 1536) };
  const uTime = { value: 0 };
  const quad = new THREE.PlaneGeometry(1, 1);
  let seed = 30061; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

  // ---- bank heaps (static, instanced)
  let bankU: { uCap: { value: THREE.Vector3 } } | null = null;
  const bankObjs: THREE.Mesh[] = [];
  if (BANK) {
    const hs = num('f30bs', 1), hn = num('f30bn', 1);
    const aB: number[] = [], aC: number[] = [], aS: number[] = [];
    const t1 = new THREE.Vector3();
    for (const side of [-1, 1]) {
      let s = st.s0 + 1 + rnd() * 1.5;
      while (s < st.s1 + 2) {
        const big = rnd() < 0.22;
        const Rh = (0.55 + 0.45 * rnd()) * (big ? 1.35 : 1) * hs;   // heap radius (u)
        const Hh = (0.32 + 0.3 * rnd()) * (big ? 1.3 : 1) * hs;     // heap height (u)
        const fr = course.sample(s);
        const lc = side * (WC + 0.45 + 0.5 * rnd());                 // on the raised bank, spilling a little onto the water
        const foot = fr.pos.clone().addScaledVector(fr.right, lc).addScaledVector(fr.up, HB - 0.06);
        t1.copy(fr.tan).normalize();
        const n = Math.max(8, Math.min(46, Math.round((10 + 30 * Rh) * hn)));
        for (let i = 0; i < n; i++) {
          const lobe = i < 3 || rnd() < 0.55;
          const th = rnd() * Math.PI * 2, dd = Math.sqrt(rnd());
          const du = Math.cos(th) * dd * Rh * 1.3, dl = Math.sin(th) * dd * Rh * 0.75;   // elongated along the bank
          const dome = Hh * Math.sqrt(Math.max(0, 1 - dd * dd));
          const rho = lobe ? Rh * (0.20 + 0.22 * rnd()) * (1 - 0.35 * dd) : Rh * (0.05 + 0.08 * Math.pow(rnd(), 1.4));
          const hgt = lobe ? Math.max(rho * 0.35, dome * (0.55 + 0.45 * rnd()) - rho * 0.25) : dome * (0.4 + 0.6 * rnd()) + rho * 0.4;
          const p = foot.clone().addScaledVector(t1, du).addScaledVector(fr.right, dl).addScaledVector(fr.up, hgt);
          aB.push(p.x, p.y, p.z, rho); aC.push(foot.x, foot.y, foot.z, Rh * 1.3 + Hh * 0.3); aS.push(rnd() * 0.999 + (lobe ? 1 : 0));
        }
        s += (big ? 1.5 : 1.0) * Rh * 2.0 * (0.75 + 0.5 * rnd()) + (rnd() < 0.2 ? 0.8 + rnd() * 1.4 : 0); // close piles, a few gaps
      }
    }
    const g = new THREE.InstancedBufferGeometry();
    g.setIndex(quad.index); g.setAttribute('position', quad.attributes.position); g.setAttribute('uv', quad.attributes.uv);
    g.setAttribute('aB', new THREE.InstancedBufferAttribute(new Float32Array(aB), 4));
    g.setAttribute('aC', new THREE.InstancedBufferAttribute(new Float32Array(aC), 4));
    g.setAttribute('aS', new THREE.InstancedBufferAttribute(new Float32Array(aS), 1));
    g.instanceCount = aS.length;
    const uCap = { value: new THREE.Vector3(num('f30bc', 0.24), num('f30bl', 0.065), 0) };
    const uFar = { value: new THREE.Vector2(55, 75) };
    bankU = { uCap };
    for (const rim of [false, true]) {
      const m = new THREE.ShaderMaterial({ vertexShader: BANK_VERT, fragmentShader: (rim ? '#define RIM\n' : '') + BANK_FRAG,
        transparent: rim, depthWrite: !rim, fog: false, uniforms: { uPjPost, uPjRes, uCap, uFar } });
      const o = new THREE.Mesh(g, m);
      o.name = rim ? 'f30_bank_rim' : 'f30_bank'; o.frustumCulled = false; o.renderOrder = rim ? 4 : 3;
      group.add(o); bankObjs.push(o);
    }
    console.info('[f30] bank', { lobes: aS.length });
  }

  // ---- floating bubbles (pool, recycled ahead of Benny)
  interface Bub { s: number; l: number; h: number; r: number; ph: number; seed: number; }
  const bubs: Bub[] = [];
  let bubMesh: THREE.Mesh | null = null, aP: THREE.InstancedBufferAttribute | null = null, aA: THREE.InstancedBufferAttribute | null = null;
  const WIN0 = -5, WIN = num('f30bw', 46);
  if (BUB) {
    const nBig = Math.round(num('f30bbn', 30)), nSmall = Math.round(num('f30bsn', 34)), bs = num('f30bbs', 1);
    for (let i = 0; i < nBig + nSmall; i++) {
      const bigB = i < nBig;
      const side = rnd() < 0.5 ? -1 : 1;
      // beside the slide (over the foam banks and the lower walls) and some over the water's edges, at many heights
      const l = side * (bigB ? 1.2 + 3.2 * rnd() : 0.8 + 3.8 * rnd());
      const h = bigB ? 0.3 + 3.0 * Math.pow(rnd(), 1.2) : 0.2 + 3.4 * rnd();
      const r = (bigB ? 0.11 + 0.17 * Math.pow(rnd(), 0.8) : 0.03 + 0.045 * rnd()) * bs;
      bubs.push({ s: rnd() * WIN, l, h, r, ph: rnd() * 6.283, seed: rnd() });
    }
    const g = new THREE.InstancedBufferGeometry();
    g.setIndex(quad.index); g.setAttribute('position', quad.attributes.position);
    aP = new THREE.InstancedBufferAttribute(new Float32Array(bubs.length * 4), 4); aP.setUsage(THREE.DynamicDrawUsage);
    aA = new THREE.InstancedBufferAttribute(new Float32Array(bubs.length * 2), 2); aA.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('aP', aP); g.setAttribute('aA', aA);
    g.instanceCount = bubs.length;
    bubMesh = new THREE.Mesh(g, new THREE.ShaderMaterial({ vertexShader: BUB_VERT, fragmentShader: BUB_FRAG, transparent: true, depthWrite: false, fog: false,
      uniforms: { uPjPost, uPjRes, uTime } }));
    bubMesh.name = 'f30_bubbles'; bubMesh.frustumCulled = false; bubMesh.renderOrder = 6;
    group.add(bubMesh);
  }

  // ---- lace splash ring + droplets round Benny
  let ring: THREE.Mesh | null = null, drops: THREE.Points | null = null;
  const ringU = { uRing: { value: new THREE.Vector3(num('f30rr', 0.62), num('f30rw', 0.2), 0.95) } };
  const ND = 44;
  const dropSeed: number[][] = [];
  const dropPos = new Float32Array(ND * 3), dropSize = new Float32Array(ND);
  const dropU = { uScale: { value: 1000 }, uAlpha: { value: 1 } };
  if (RING) {
    const rg = new THREE.RingGeometry(ringU.uRing.value.x * 0.85, ringU.uRing.value.x + ringU.uRing.value.y * 2.4, 96, 4);
    ring = new THREE.Mesh(rg, new THREE.ShaderMaterial({ vertexShader: RING_VERT, fragmentShader: RING_FRAG, transparent: true, depthWrite: false, fog: false,
      side: THREE.DoubleSide, uniforms: { uPjPost, uPjRes, uTime, ...ringU } }));
    ring.name = 'f30_ring'; ring.renderOrder = 5; ring.frustumCulled = false;
    group.add(ring);
    for (let i = 0; i < ND; i++) {
      // mostly at his left / right (the painted side splashes), a few all round
      const sd = rnd() < 0.5 ? 0 : Math.PI;
      const th = rnd() < 0.75 ? sd + (rnd() - 0.5) * 1.6 : rnd() * Math.PI * 2;
      dropSeed.push([th, rnd(), 0.6 + 0.8 * rnd(), 0.018 + 0.03 * rnd(), 0.15 + 0.35 * rnd()]); // angle, phase, rate, size, height
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.BufferAttribute(dropPos, 3).setUsage(THREE.DynamicDrawUsage));
    dg.setAttribute('aSize', new THREE.BufferAttribute(dropSize, 1).setUsage(THREE.DynamicDrawUsage));
    drops = new THREE.Points(dg, new THREE.ShaderMaterial({ vertexShader: DROP_VERT, fragmentShader: DROP_FRAG, transparent: true, depthWrite: false, fog: false,
      uniforms: { uPjPost, uPjRes, ...dropU } }));
    drops.name = 'f30_drops'; drops.renderOrder = 6; drops.frustumCulled = false;
    ring.add(drops);
  }

  const fr = { s: 0, pos: new THREE.Vector3(), tan: new THREE.Vector3(), up: new THREE.Vector3(), right: new THREE.Vector3() };
  const v = new THREE.Vector3(), ndc = new THREE.Vector3(), bN = new THREE.Vector3(), m4 = new THREE.Matrix4(), dbs = new THREE.Vector2();
  let hidOld: THREE.Object3D[] | null = null;
  return {
    group,
    update({ on, away, camera, benny, s, time, renderer, m06group }) {
      group.visible = on && away > 0.5;
      if (BANK && on) {
        // the old m06fclu / m06foam puffs give way to the new heaps (match06.setAway re-shows them every step)
        hidOld ??= ['m06_foamclu', 'm06_foamclu_rim', 'm06_foamclouds'].map((n) => m06group.getObjectByName(n)).filter((o): o is THREE.Object3D => !!o);
        for (const o of hidOld) o.visible = false;
      }
      if (!group.visible) return;
      const grow = THREE.MathUtils.smoothstep(away, 0.5, 1.0);
      uPjPost.value.x = renderer.toneMappingExposure;
      renderer.getDrawingBufferSize(dbs); uPjRes.value.copy(dbs);
      uTime.value = time;
      camera.updateMatrixWorld();
      if (bankU) bankU.uCap.value.z = grow;
      if (bubMesh && aP && aA) {
        // Benny's body on screen (no bubble may cover him)
        course.sample(s, fr);
        bN.copy(benny).addScaledVector(fr.up, 0.55).project(camera);
        const P = camera.projectionMatrix.elements[5];
        const capR = num('f30bcap', 0.062);  // max bubble radius on screen (fraction of the half-height): ~95 px diameter at 1536
        for (let i = 0; i < bubs.length; i++) {
          const b = bubs[i];
          // drifting downstream (slower than Benny) inside a window that travels with him; recycled at the far end
          const sw = ((((b.s + time * 1.1 - (s + WIN0)) % WIN) + WIN) % WIN);
          const sb = s + WIN0 + sw;
          course.sample(Math.min(sb, st.s1 + 8), fr);
          v.copy(fr.pos).addScaledVector(fr.right, b.l + 0.12 * Math.sin(time * 0.6 + b.ph * 2.0))
            .addScaledVector(fr.up, b.h + 0.14 * Math.sin(time * 0.9 + b.ph));
          ndc.copy(v).applyMatrix4(camera.matrixWorldInverse);
          const z = -ndc.z;
          let r = b.r, a = 1;
          if (z > 0.05) r = Math.min(r, (capR * z) / P);
          a *= THREE.MathUtils.smoothstep(z, 0.9, 2.2);                    // pass the camera without filling the screen
          a *= 1 - THREE.MathUtils.smoothstep(sw, WIN - 9, WIN);           // fade in far ahead (recycled bubbles)
          a *= 1 - THREE.MathUtils.smoothstep(sb, st.s1 - 2, st.s1 + 6);    // none beyond 06
          ndc.copy(v).project(camera);
          const ex = (ndc.x - bN.x) / 0.34, ey = (ndc.y - bN.y) / 0.30;      // keep clear of Benny
          a *= THREE.MathUtils.smoothstep(Math.hypot(ex, ey), 0.9, 1.25);
          a *= grow;
          aP.setXYZW(i, v.x, v.y, v.z, r); aA.setXY(i, a, b.seed);
        }
        aP.needsUpdate = true; aA.needsUpdate = true;
      }
      if (ring && drops) {
        course.sample(s, fr);
        const hgt = v.copy(benny).sub(fr.pos).dot(fr.up);
        const c = v.copy(benny).addScaledVector(fr.up, 0.035 - hgt);
        m4.makeBasis(fr.right, fr.tan, fr.up).setPosition(c);
        ring.matrixAutoUpdate = false; ring.matrix.copy(m4); ring.matrixWorldNeedsUpdate = true;
        ringU.uRing.value.z = 0.95 * grow;
        dropU.uAlpha.value = grow;
        dropU.uScale.value = dbs.y / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
        const R0 = ringU.uRing.value.x;
        for (let i = 0; i < ND; i++) {
          const [th, ph, rate, size, hmax] = dropSeed[i];
          const t = (time * rate + ph) % 1;
          const rr = R0 + 0.06 + 0.42 * t;
          dropPos[i * 3] = Math.cos(th) * rr; dropPos[i * 3 + 1] = Math.sin(th) * rr * 0.7; dropPos[i * 3 + 2] = 4 * hmax * t * (1 - t);
          dropSize[i] = t < 0.9 ? size * (1 - 0.5 * t) : 0;
        }
        (drops.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
        (drops.geometry.attributes.aSize as THREE.BufferAttribute).needsUpdate = true;
      }
    },
  };
}
