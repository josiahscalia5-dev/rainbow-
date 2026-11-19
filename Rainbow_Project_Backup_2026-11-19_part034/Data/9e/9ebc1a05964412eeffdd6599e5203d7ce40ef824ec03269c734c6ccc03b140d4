/**
 * Iridescent soap bubbles.
 *  - big bubbles: instanced camera-facing sphere IMPOSTORS (2 triangles each) with an analytic
 *    thin-film shader: saturated magenta/cyan film, crisp outline, tinted interior, white window
 *    highlights (ref 05). The on-screen diameter is capped (uMaxPx) and bubbles fade out close to the
 *    camera, so a bubble can never become a giant occluding sphere.
 *  - small bubbles: one THREE.Points draw of tiny ring-sprite bubbles.
 * Ride (03–10): bubbles live only at the SIDES of the stream, over the foam banks and the lower
 * walls (ref 05: ≈18 large 25–65 px + ≈25 small, none over the path or Benny). Drum A (01–02):
 * free-floating in the drum volume as before.
 * Pooled (fixed arrays, no per-frame allocation); respawned ahead when Benny passes them.
 */
import * as THREE from 'three';
import { type Course, WORLD } from '../world/course';
import { BERM_OUT } from './foam';
import { FRAG_TAIL, NOISE_GLSL, withFog } from './glsl';

const BIG_VERT = /* glsl */ `
attribute float aSeed;
uniform float uFocal;   // pixels per unit at depth 1 (viewport height / (2 tan(fov/2)))
uniform float uMaxPx;   // cap on the on-screen diameter
uniform float uNear;    // fade-out distance from the camera
varying vec2 vP;
varying float vSeed;
varying float vFade;
varying float vPx;
#include <fog_pars_vertex>
void main() {
  vec4 c = modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  float r = length((instanceMatrix * vec4(1.0, 0.0, 0.0, 0.0)).xyz);
  vec4 cv = viewMatrix * c;
  float depth = max(-cv.z, 0.01);
  float px = 2.0 * r * uFocal / depth;
  float k = min(1.0, uMaxPx / max(px, 1e-3));
  r *= k;
  vPx = px * k;
  vFade = smoothstep(uNear, uNear * 1.8, depth) * step(0.0005, r);
  vP = position.xy;
  vSeed = aSeed;
  vec4 mvPosition = cv + vec4(position.xy * r, 0.0, 0.0);
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;
const BIG_FRAG = /* glsl */ `
uniform float uTime;
varying vec2 vP;
varying float vSeed;
varying float vFade;
varying float vPx;
#include <fog_pars_fragment>
${NOISE_GLSL}
void main() {
  float d2 = dot(vP, vP);
  if (d2 > 1.0 || vFade < 0.01) discard;
  float d = sqrt(d2);
  float z = sqrt(1.0 - d2);
  float f = 1.0 - z;                                   // 0 centre → 1 silhouette
  // swirling thin film: magenta / violet / cyan bands with a little gold (ref 05)
  float sw = vnoise(vP * 2.2 + vec2(uTime * 0.3 + vSeed * 13.0, vSeed * 7.0));
  float hue = f * 0.85 + sw * 0.75 + vP.x * 0.25 - vP.y * 0.2 + vSeed;
  vec3 film = iridescent(hue);
  film = vec3(film.r, film.g * 0.55 + 0.1, min(1.0, film.b * 1.1 + 0.1));   // less green
  film *= 0.74;                                        // stay under the tone-mapping knee: saturated
  float rim = smoothstep(0.5, 0.97, d);
  float edge = smoothstep(0.88, 0.97, d) * (1.0 - smoothstep(0.975, 1.0, d));
  // window highlights: a soft bright pane up-left, a small one down-right, sparkle dots on the rim
  vec2 q1 = (vP - vec2(-0.36, 0.42)) * vec2(2.2, 3.0);
  float hl = exp(-dot(q1, q1) * 2.2) * 1.2;
  vec2 q2 = vP - vec2(0.42, -0.45);
  hl += exp(-dot(q2, q2) * 55.0) * 0.7;
  float ang = atan(vP.y, vP.x);
  hl += smoothstep(0.8, 0.93, d) * (1.0 - smoothstep(0.95, 1.0, d)) * pow(max(0.0, sin(ang * 4.0 + vSeed * 31.0)), 30.0) * 0.9;
  // tiny bubbles: keep only the ring + one glint (no shimmering detail below ~14 px)
  float small = 1.0 - smoothstep(10.0, 22.0, vPx);
  hl *= 1.0 - 0.5 * small;
  vec3 col = film * (0.55 + 0.75 * rim) + vec3(1.0) * edge * 0.45 + vec3(1.05) * hl;
  float a = 0.14 + 0.1 * sw + rim * 0.6 + edge * 0.35 + hl;
  gl_FragColor = vec4(col, clamp(a, 0.0, 0.95) * vFade);
  ${FRAG_TAIL}
}
`;

const PT_VERT = /* glsl */ `
attribute float aSize;
attribute float aSeed;
uniform float uScale;
uniform float uMaxPx;
varying float vSeed;
varying float vPx;
#include <fog_pars_vertex>
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  float px = aSize * uScale / max(-mvPosition.z, 0.01);
  gl_PointSize = aSize > 0.0 ? clamp(px, 2.0, uMaxPx) : 0.0;
  vPx = gl_PointSize;
  vSeed = aSeed;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;
const PT_FRAG = /* glsl */ `
uniform float uTime;
varying float vSeed;
varying float vPx;
#include <fog_pars_fragment>
${NOISE_GLSL}
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;
  float ring = smoothstep(0.5, 0.85, d) * (1.0 - smoothstep(0.9, 1.0, d));
  vec3 irid = iridescent(d * 0.7 + vSeed + atan(c.y, c.x) * 0.12);
  irid = vec3(irid.r, irid.g * 0.55 + 0.1, irid.b) * 0.8;
  float hl = smoothstep(0.26, 0.0, length(c - vec2(-0.17, -0.17)));
  vec3 col = mix(vec3(1.0), irid, 0.6) * ring * 1.2 + vec3(1.0) * hl * 1.4 + irid * 0.25;
  // tiny sprites must not read as solid white dots: keep rim + glint, fade the very smallest
  float alpha = clamp(ring * 0.8 + hl + 0.12, 0.0, 1.0) * (0.35 + 0.65 * smoothstep(3.0, 8.0, vPx));
  gl_FragColor = vec4(col, alpha);
  ${FRAG_TAIL}
}
`;

interface BubbleState {
  s: number;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  size: number;
  phase: number;
  age: number;
  life: number;
}

export interface BubbleSystem {
  group: THREE.Group;
  big: THREE.InstancedMesh;
  small: THREE.Points;
  update(time: number, dt: number, focusS: number, camera: THREE.Camera, density?: number): void;
  counts: { big: number; small: number };
  /** QA: on-screen centres and diameters (px) of the bubbles currently drawn */
  qaScreen(camera: THREE.PerspectiveCamera, w: number, h: number): { big: number[][]; small: number[][] };
}

// seeded RNG: re-seeded on every respawn-all (checkpoint jump), so QA frames are deterministic
let rngState = 0x0b0b;
function rand() {
  rngState = (rngState + 0x6d2b79f5) >>> 0;
  let t = rngState;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function rnd(a: number, b: number) {
  return a + rand() * (b - a);
}

/** ride counts (visible at once in a 05-like frame) and caps, per quality tier */
const RIDE = {
  high: { big: 24, small: 34 },
  low: { big: 16, small: 20 },
};
/** ride big bubbles: target on-screen diameter range (px in the 864×1536 frame), ref 05 ≈25–65 px */
const BIG_PX: [number, number] = [25, 65];
/** max on-screen diameters (px at the capture/device resolution) */
const MAX_PX_RIDE = 66;
const MAX_PX_DRUM = 120;
const MAX_PX_SMALL = 22;

export function createBubbles(course: Course, opts: { quality: 'high' | 'low'; sStart: number }): BubbleSystem {
  const quality = opts.quality;
  const ride = RIDE[quality];
  const nBig = Math.max(ride.big, 16);
  const nSmall = quality === 'high' ? 170 : 80; // drum A keeps its fizz; the ride uses ride.small
  const group = new THREE.Group();
  group.name = 'bubbles';
  const dA = WORLD.drumA;
  const drumEnd = course.marks['02_drain'] ?? course.stage('03').s0;

  // ---- big (impostors) ----
  const quad = new THREE.PlaneGeometry(2, 2);
  const seeds = new Float32Array(nBig).map(() => rand());
  quad.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
  const bigUniforms = withFog({ uTime: { value: 0 }, uFocal: { value: 1000 }, uMaxPx: { value: MAX_PX_RIDE }, uNear: { value: 3.2 } });
  const big = new THREE.InstancedMesh(
    quad,
    new THREE.ShaderMaterial({ uniforms: bigUniforms, vertexShader: BIG_VERT, fragmentShader: BIG_FRAG, fog: true, transparent: true, depthWrite: false }),
    nBig,
  );
  big.name = 'bubbles_big';
  big.frustumCulled = false;
  big.renderOrder = 5;
  group.add(big);

  // ---- small ----
  const sPos = new Float32Array(nSmall * 3);
  const sSize = new Float32Array(nSmall);
  const sSeed = new Float32Array(nSmall).map(() => rand());
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3).setUsage(THREE.DynamicDrawUsage));
  pGeo.setAttribute('aSize', new THREE.BufferAttribute(sSize, 1).setUsage(THREE.DynamicDrawUsage));
  pGeo.setAttribute('aSeed', new THREE.BufferAttribute(sSeed, 1));
  const ptUniforms = withFog({ uTime: { value: 0 }, uScale: { value: 600 }, uMaxPx: { value: MAX_PX_SMALL } });
  const small = new THREE.Points(
    pGeo,
    new THREE.ShaderMaterial({ uniforms: ptUniforms, vertexShader: PT_VERT, fragmentShader: PT_FRAG, fog: true, transparent: true, depthWrite: false }),
  );
  small.name = 'bubbles_small';
  small.frustumCulled = false;
  small.renderOrder = 4;
  group.add(small);

  const mk = (): BubbleState => ({ s: 0, pos: new THREE.Vector3(), vel: new THREE.Vector3(), size: 1, phase: 0, age: 0, life: 1 });
  const bigS: BubbleState[] = Array.from({ length: nBig }, mk);
  const smallS: BubbleState[] = Array.from({ length: nSmall }, mk);

  const tmp = new THREE.Vector3();
  const tmp2 = new THREE.Vector3();
  const tmp3 = new THREE.Vector3();
  /** camera basis of the current frame (screen-space placement / exclusion) */
  const view = { pos: new THREE.Vector3(), dir: new THREE.Vector3(0, 0, -1), right: new THREE.Vector3(1, 0, 0), up: new THREE.Vector3(0, 1, 0), tanV: 0.6, tanH: 0.34, inv: new THREE.Matrix4(), ok: false };
  /**
   * 1 = fine, 0 = in the no-bubble corridor (stream centre: Benny, splash, coin line), -1 = out of
   * the frame / too close to the camera. NDC from the camera basis; `r` (world radius) widens the
   * corridor so a bubble's rim never overlaps Benny either.
   */
  const allowed = (p: THREE.Vector3, r = 0): number => {
    if (!view.ok) return 1;
    const v = tmp3.copy(p).applyMatrix4(view.inv);
    const depth = -v.z;
    if (depth < 2.5) return -1;
    const xn = v.x / (depth * view.tanH), yn = v.y / (depth * view.tanV);
    if (Math.abs(xn) > 1.12 || yn < -1.12 || yn > 1.1) return -1;
    if (yn > 0.62) return 0; // upper tube / HUD: keep clear (ref 05 has none there)
    const rN = r / (depth * view.tanH);
    const corridor = yn < 0.1 ? 0.47 : 0.3;
    return Math.abs(xn) - rN < corridor ? 0 : 1;
  };
  /** pixels per unit at depth 1 and the frame-height scale of the current frame (set in update) */
  let focalNow = 1000;
  let pxKNow = 1;
  const f0 = { s: 0, pos: new THREE.Vector3(), tan: new THREE.Vector3(), up: new THREE.Vector3(), right: new THREE.Vector3() };
  const fi = { s: 0, pos: new THREE.Vector3(), tan: new THREE.Vector3(), up: new THREE.Vector3(), right: new THREE.Vector3() };
  const ray = new THREE.Vector3();
  const spawn = (b: BubbleState, focusS: number, isBig: boolean, initial: boolean) => {
    b.phase = rand() * 6.28;
    b.age = initial ? rnd(0.5, 3) : 0;
    b.life = rnd(7, 15);
    if (focusS < drumEnd) {
      // Drum A volume: big bubbles floating around the drum, small ones near the water
      const th = rnd(0, Math.PI * 2);
      const r = Math.sqrt(rand()) * (dA.radius - 0.9);
      const x = dA.center.x + Math.cos(th) * r;
      const y = isBig ? rnd(dA.waterY - 0.2, dA.center.y + dA.radius * 0.7) : rnd(dA.waterY + 0.05, dA.waterY + 1.6);
      const z = rnd(dA.zBack + 0.6, dA.zDoor - 0.4);
      b.pos.set(x, y, z);
      b.s = focusS;
      b.vel.set(rnd(-0.15, 0.15), rnd(0.05, 0.25), rnd(-0.1, 0.1));
      b.size = isBig ? (rand() < 0.25 ? rnd(0.45, 0.85) : rnd(0.16, 0.42)) : rnd(0.05, 0.16);
      return;
    }
    // ---- ride: at the SIDES of the frame only (over the foam banks / outer water), never over the
    // stream corridor where Benny, his splash and the coin line are (ref 05: ≈18 large 25–65 px and
    // ≈25 small bubbles between the bank tops at y≈540 and Benny's splash at y≈1290, x at the sides).
    // Placed in SCREEN space so it holds for any camera: pick a side screen point, find where its view
    // ray meets the water, and float the bubble somewhere between the camera and that point. Size is
    // chosen from the wanted on-screen diameter at that depth. Respawns start further up the frame
    // (far, small) and grow naturally as Benny rides towards them.
    course.sample(Math.max(opts.sStart, focusS), f0);
    const side = rand() < 0.5 ? -1 : 1;
    const H = 1536;
    let D = 6;
    for (let attempt = 0; attempt < 5; attempt++) {
      const yPx = initial ? rnd(530, 1290) : rnd(530, 820);
      const yn = 1 - (2 * yPx) / H;
      const xn = side * rnd(isBig ? 0.55 : 0.5, 0.97);
      ray.copy(view.dir).addScaledVector(view.right, xn * view.tanH).addScaledVector(view.up, yn * view.tanV);
      // distance (along the view axis) to the water plane under Benny
      const den = ray.dot(f0.up);
      let Dw = den < -1e-3 ? tmp2.copy(f0.pos).sub(view.pos).dot(f0.up) / den : 40;
      Dw = Math.min(40, Math.max(3, Dw));
      D = Math.max(3.9, Dw * rnd(isBig ? 0.55 : 0.6, 0.92));
      // keep inside the tube: shorten the ray while the point is beyond the bank top
      let s = focusS;
      for (let k = 0; k < 4; k++) {
        tmp.copy(view.pos).addScaledVector(ray, D);
        s = focusS;
        for (let it = 0; it < 2; it++) {
          course.sample(Math.min(course.length, Math.max(opts.sStart, s)), fi);
          s += tmp2.copy(tmp).sub(fi.pos).dot(fi.tan);
        }
        s = Math.min(course.length - 0.3, Math.max(opts.sStart, s));
        course.sample(s, fi);
        const hw = course.widthAt(s) / 2;
        const lat = tmp2.copy(tmp).sub(fi.pos).dot(fi.right);
        if (Math.abs(lat) <= hw + BERM_OUT + 0.3) break;
        D *= 0.85;
      }
      // never under the water / inside the bank foam
      const above = tmp2.copy(tmp).sub(fi.pos).dot(fi.up);
      if (above < 0.15) tmp.addScaledVector(fi.up, 0.15 - above);
      b.pos.copy(tmp);
      b.s = s;
      const flow = course.prop(s, 'speed') * (isBig ? 0.1 : 0.2);
      b.vel.copy(fi.tan).multiplyScalar(flow).addScaledVector(fi.up, rnd(0.04, 0.16));
      const depth = Math.max(2.5, tmp2.copy(b.pos).sub(view.pos).dot(view.dir));
      if (isBig) {
        const px = BIG_PX[0] + (BIG_PX[1] - BIG_PX[0]) * Math.pow(rand(), 1.25);
        b.size = THREE.MathUtils.clamp((px * pxKNow * depth) / (2 * focalNow), 0.05, 0.5);
      } else {
        const px = 6 + 14 * Math.pow(rand(), 1.4);
        b.size = THREE.MathUtils.clamp((px * pxKNow * depth) / focalNow, 0.02, 0.3); // point-sprite diameter
      }
      if (allowed(b.pos, isBig ? b.size : b.size * 0.5) > 0) break;
    }
  };

  let lastFocus = -1e9;
  const lastCam = new THREE.Vector3(1e9, 1e9, 1e9);
  const tmpM = new THREE.Matrix4();
  const one = new THREE.Quaternion();
  const scl = new THREE.Vector3();

  const qv = new THREE.Vector3();
  const qm = new THREE.Matrix4();
  const qs = new THREE.Vector3();
  return {
    group,
    big,
    small,
    counts: { big: nBig, small: nSmall },
    qaScreen(camera, w, h) {
      const out = { big: [] as number[][], small: [] as number[][] };
      if (!camera.isPerspectiveCamera) return out;
      const focal = h / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2));
      const maxPx = (bigUniforms.uMaxPx.value as number) * (h / (window.innerHeight * Math.min(2, window.devicePixelRatio || 1)));
      for (let i = 0; i < nBig; i++) {
        big.getMatrixAt(i, qm);
        qs.setFromMatrixScale(qm);
        if (qs.x < 1e-4) continue;
        qv.setFromMatrixPosition(qm);
        const depth = qv.clone().applyMatrix4(camera.matrixWorldInverse).z * -1;
        if (depth < 0.1) continue;
        qv.project(camera);
        if (Math.abs(qv.x) > 1.05 || Math.abs(qv.y) > 1.05) continue;
        out.big.push([Math.round((qv.x * 0.5 + 0.5) * w), Math.round((0.5 - qv.y * 0.5) * h), Math.round(Math.min(maxPx, (2 * qs.x * focal) / depth))]);
      }
      for (let i = 0; i < nSmall; i++) {
        if (sSize[i] <= 0) continue;
        qv.fromArray(sPos, i * 3);
        const depth = qv.clone().applyMatrix4(camera.matrixWorldInverse).z * -1;
        if (depth < 0.1) continue;
        qv.project(camera);
        if (Math.abs(qv.x) > 1.05 || Math.abs(qv.y) > 1.05) continue;
        out.small.push([Math.round((qv.x * 0.5 + 0.5) * w), Math.round((0.5 - qv.y * 0.5) * h), Math.round(Math.min(MAX_PX_SMALL * (h / 1536), (sSize[i] * focal) / depth))]);
      }
      return out;
    },
    update(time, dt, focusS, camera, density = 1) {
      bigUniforms.uTime.value = time;
      ptUniforms.uTime.value = time;
      const persp = camera as THREE.PerspectiveCamera;
      view.ok = !!persp.isPerspectiveCamera;
      if (view.ok) {
        camera.updateMatrixWorld();
        view.inv.copy(camera.matrixWorldInverse);
        camera.getWorldPosition(view.pos);
        camera.getWorldDirection(view.dir);
        view.right.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
        view.up.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
        view.tanV = Math.tan(THREE.MathUtils.degToRad(persp.fov) / 2);
        view.tanH = view.tanV * persp.aspect;
      }
      // pixel scale for impostors and point sprites
      const vh = (typeof window !== 'undefined' ? window.innerHeight : 800) * (typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1);
      const focal = persp.isPerspectiveCamera ? vh / (2 * Math.tan(THREE.MathUtils.degToRad(persp.fov) / 2)) : 600;
      const pxK = vh / 1536; // caps are authored for the 864×1536 reference frame
      focalNow = focal;
      pxKNow = pxK;
      // respawn everything after a checkpoint jump / respawn or a camera teleport (the screen-space
      // placement needs the camera that will actually show the bubbles)
      const camJump = view.ok && lastCam.distanceToSquared(view.pos) > 4;
      if (view.ok) lastCam.copy(view.pos);
      const jump = Math.abs(focusS - lastFocus) > 25 || (camJump && focusS >= drumEnd);
      const crossedDrum = (lastFocus < drumEnd) !== (focusS < drumEnd);
      if (jump || crossedDrum) {
        rngState = (0x0b0b ^ Math.round(focusS * 16)) >>> 0;
        for (const b of bigS) spawn(b, focusS, true, true);
        for (const b of smallS) spawn(b, focusS, false, true);
      }
      lastFocus = focusS;
      ptUniforms.uScale.value = focal;
      ptUniforms.uMaxPx.value = MAX_PX_SMALL * pxK;
      bigUniforms.uFocal.value = focal;
      const inDrum = focusS < drumEnd;
      bigUniforms.uMaxPx.value = (inDrum ? MAX_PX_DRUM : MAX_PX_RIDE) * pxK;
      bigUniforms.uNear.value = inDrum ? 1.2 : 2.6;
      const step = (b: BubbleState, isBig: boolean) => {
        b.age += dt;
        b.pos.addScaledVector(b.vel, dt);
        tmp.set(Math.sin(time * 1.3 + b.phase), Math.cos(time * 1.1 + b.phase * 1.7), Math.sin(time * 0.9 + b.phase * 0.6)).multiplyScalar(0.12 * dt);
        b.pos.add(tmp);
        if (inDrum) {
          if (b.age > b.life) spawn(b, focusS, isBig, false);
          return;
        }
        // ride: recycle when passed / out of frame; pop (fast shrink) when drifting into the corridor
        const behind = b.s < Math.min(focusS, course.length - 32) - (isBig ? 3 : 2);
        const a = allowed(b.pos, isBig ? b.size : 0);
        if (behind || a < 0 || b.age > b.life) spawn(b, focusS, isBig, false);
        else if (a === 0) b.life = Math.min(b.life, b.age + 0.25);
      };
      const bigLimit = Math.round((inDrum ? Math.min(nBig, 16) : ride.big) * density);
      const smallLimit = Math.round((inDrum ? nSmall * 0.95 : ride.small) * density);
      for (let i = 0; i < nBig; i++) {
        const b = bigS[i];
        step(b, true);
        const pop = i < bigLimit ? Math.min(1, b.age * 1.5, (b.life - b.age) * 2) : 0;
        const sz = b.size * Math.max(0, pop) * (1 + 0.04 * Math.sin(time * 4 + b.phase));
        scl.set(sz, sz, sz);
        tmpM.compose(b.pos, one, scl);
        big.setMatrixAt(i, tmpM);
      }
      big.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < nSmall; i++) {
        const b = smallS[i];
        step(b, false);
        b.pos.toArray(sPos, i * 3);
        sSize[i] = i < smallLimit ? b.size * Math.max(0, Math.min(1, b.age * 3, (b.life - b.age) * 3)) : 0;
      }
      (pGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (pGeo.attributes.aSize as THREE.BufferAttribute).needsUpdate = true;
    },
  };
}
