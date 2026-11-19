/**
 * Iridescent soap bubbles.
 *  - big bubbles: InstancedMesh spheres with a thin-film shader (rainbow Fresnel rim, white
 *    window highlight, nearly clear centre) — pooled around Benny (focusS) or the Drum A volume
 *  - small bubbles: one THREE.Points draw of hundreds of tiny ring-sprite bubbles hugging the water
 * Bubbles drift with the flow, rise, wobble, and are respawned ahead when left behind.
 */
import * as THREE from 'three';
import { type Course, WORLD } from '../world/course';
import { FRAG_TAIL, NOISE_GLSL, withFog } from './glsl';

const BIG_VERT = /* glsl */ `
attribute float aSeed;
varying vec3 vPosW;
varying vec3 vNormalW;
varying float vSeed;
#include <fog_pars_vertex>
void main() {
  vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
  vSeed = aSeed;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;
const BIG_FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uLightDir;
varying vec3 vPosW;
varying vec3 vNormalW;
varying float vSeed;
#include <fog_pars_fragment>
${NOISE_GLSL}
void main() {
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  float nv = clamp(dot(N, V), 0.0, 1.0);
  float f = 1.0 - nv;
  // swirling thin-film thickness
  float swirl = vnoise(N.xy * 2.5 + vec2(uTime * 0.3 + vSeed * 10.0, vSeed * 5.0));
  vec3 irid = iridescent(f * 1.6 + swirl * 0.8 + vSeed);
  float rim = pow(f, 2.0);
  vec3 col = mix(vec3(0.85, 0.9, 1.0), irid, 0.9) * (0.3 + rim * 1.8);
  // window-like specular highlights
  vec3 R = reflect(-V, N);
  float spec = pow(clamp(dot(R, normalize(uLightDir)), 0.0, 1.0), 90.0);
  float spec2 = pow(clamp(dot(R, normalize(vec3(-0.6, 0.2, 0.7))), 0.0, 1.0), 40.0) * 0.5;
  col += vec3(1.0) * (spec * 2.4 + spec2);
  float alpha = clamp(0.06 + rim * 0.85 + spec * 0.9 + spec2 * 0.5, 0.0, 0.95);
  gl_FragColor = vec4(col, alpha);
  ${FRAG_TAIL}
}
`;

const PT_VERT = /* glsl */ `
attribute float aSize;
attribute float aSeed;
uniform float uScale;
varying float vSeed;
varying float vPx;
#include <fog_pars_vertex>
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = clamp(aSize * uScale / -mvPosition.z, 1.0, 64.0);
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
  float ring = smoothstep(0.55, 0.85, d) * (1.0 - smoothstep(0.88, 1.0, d));
  vec3 irid = iridescent(d * 0.8 + vSeed + atan(c.y, c.x) * 0.1);
  float hl = smoothstep(0.28, 0.0, length(c - vec2(-0.17, -0.17)));
  vec3 col = mix(vec3(1.0), irid, 0.55) * ring * 1.3 + vec3(1.0) * hl * 1.5;
  // tiny sprites must not read as solid white dots: fade them, keep only rim + glint when large
  float alpha = clamp(ring * 0.85 + hl + 0.04, 0.0, 1.0) * (0.25 + 0.75 * smoothstep(3.0, 10.0, vPx));
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
}

function rnd(a: number, b: number) {
  return a + Math.random() * (b - a);
}

export function createBubbles(course: Course, opts: { quality: 'high' | 'low'; sStart: number }): BubbleSystem {
  const quality = opts.quality;
  const nBig = quality === 'high' ? 44 : 22;
  const nSmall = quality === 'high' ? 360 : 160;
  const group = new THREE.Group();
  group.name = 'bubbles';
  const dA = WORLD.drumA;
  const drumEnd = course.marks['02_drain'] ?? course.stage('03').s0;

  // ---- big ----
  const sphere = new THREE.SphereGeometry(1, quality === 'high' ? 24 : 14, quality === 'high' ? 16 : 10);
  const seeds = new Float32Array(nBig).map(() => Math.random());
  sphere.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
  const bigUniforms = withFog({ uTime: { value: 0 }, uLightDir: { value: new THREE.Vector3(0.4, 0.9, 0.5).normalize() } });
  const big = new THREE.InstancedMesh(
    sphere,
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
  const sSeed = new Float32Array(nSmall).map(() => Math.random());
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3).setUsage(THREE.DynamicDrawUsage));
  pGeo.setAttribute('aSize', new THREE.BufferAttribute(sSize, 1));
  pGeo.setAttribute('aSeed', new THREE.BufferAttribute(sSeed, 1));
  const ptUniforms = withFog({ uTime: { value: 0 }, uScale: { value: 600 } });
  const small = new THREE.Points(
    pGeo,
    new THREE.ShaderMaterial({ uniforms: ptUniforms, vertexShader: PT_VERT, fragmentShader: PT_FRAG, fog: true, transparent: true, depthWrite: false }),
  );
  small.name = 'bubbles_small';
  small.frustumCulled = false;
  small.renderOrder = 4;
  group.add(small);

  const bigS: BubbleState[] = Array.from({ length: nBig }, () => ({ s: 0, pos: new THREE.Vector3(), vel: new THREE.Vector3(), size: 1, phase: 0, age: 0, life: 1 }));
  const smallS: BubbleState[] = Array.from({ length: nSmall }, () => ({ s: 0, pos: new THREE.Vector3(), vel: new THREE.Vector3(), size: 1, phase: 0, age: 0, life: 1 }));

  const tmp = new THREE.Vector3();
  const spawn = (b: BubbleState, focusS: number, isBig: boolean, initial: boolean) => {
    b.phase = Math.random() * 6.28;
    b.age = 0;
    b.life = rnd(6, 14);
    if (focusS < drumEnd) {
      // Drum A volume: big bubbles floating around the drum, small ones near the water
      const th = rnd(0, Math.PI * 2);
      const r = Math.sqrt(Math.random()) * (dA.radius - 0.9);
      const x = dA.center.x + Math.cos(th) * r;
      const y = isBig ? rnd(dA.waterY - 0.2, dA.center.y + dA.radius * 0.7) : rnd(dA.waterY + 0.05, dA.waterY + 1.6);
      const z = rnd(dA.zBack + 0.6, dA.zDoor - 0.4);
      b.pos.set(x, y, z);
      b.s = focusS;
      b.vel.set(rnd(-0.15, 0.15), rnd(0.05, 0.25), rnd(-0.1, 0.1));
      b.size = isBig ? (Math.random() < 0.25 ? rnd(0.45, 0.85) : rnd(0.16, 0.42)) : rnd(0.05, 0.16);
      return;
    }
    const ahead = isBig ? rnd(initial ? -2 : 18, 75) : rnd(initial ? -3 : 8, 45);
    let s = Math.max(opts.sStart, focusS + ahead);
    if (s > course.length - 0.5) s = course.length - rnd(0.5, 30); // near the route end: fill the chamber behind
    const f = course.sample(s);
    const hw = course.widthAt(s) / 2;
    const tube = course.prop(s, 'tube');
    let lat: number, h: number;
    if (isBig) {
      // mostly low over the stream and its foam banks (refs 05–07), a few drifting higher
      const latMax = tube > 0 ? Math.min(tube * 0.8, hw + 2.2) : hw + 6;
      lat = rnd(-latMax, latMax);
      h = tube > 0 ? (Math.random() < 0.75 ? rnd(0.5, 3.2) : rnd(3.2, tube * 1.1)) : rnd(0.3, 7);
      b.size = Math.random() < 0.2 ? rnd(0.45, 0.8) : rnd(0.14, 0.4);
    } else {
      lat = tube > 0 ? rnd(-hw - 1.2, hw + 1.2) : rnd(-hw - 4, hw + 4);
      h = rnd(0.15, 2.6) * (Math.random() < 0.7 ? 0.5 : 1.2);
      b.size = rnd(0.05, 0.17);
    }
    b.pos.copy(f.pos).addScaledVector(f.right, lat).addScaledVector(f.up, h);
    b.s = s;
    const flow = course.prop(s, 'speed') * (isBig ? 0.12 : 0.25);
    b.vel.copy(f.tan).multiplyScalar(flow).addScaledVector(f.up, rnd(0.05, 0.3));
  };

  let lastFocus = -1e9;
  const tmpM = new THREE.Matrix4();
  const one = new THREE.Quaternion();
  const scl = new THREE.Vector3();
  const camPos = new THREE.Vector3();

  return {
    group,
    big,
    small,
    counts: { big: nBig, small: nSmall },
    update(time, dt, focusS, camera, density = 1) {
      bigUniforms.uTime.value = time;
      ptUniforms.uTime.value = time;
      const jump = Math.abs(focusS - lastFocus) > 25;
      const crossedDrum = (lastFocus < drumEnd) !== (focusS < drumEnd);
      if (jump || crossedDrum) {
        for (const b of bigS) spawn(b, focusS, true, true);
        for (const b of smallS) spawn(b, focusS, false, true);
      }
      lastFocus = focusS;
      camera.getWorldPosition(camPos);
      // pixel scale for point sprites
      const persp = camera as THREE.PerspectiveCamera;
      const vh = (typeof window !== 'undefined' ? window.innerHeight : 800) * (typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1);
      ptUniforms.uScale.value = persp.isPerspectiveCamera ? vh / (2 * Math.tan(THREE.MathUtils.degToRad(persp.fov) / 2)) : 600;
      const inDrum = focusS < drumEnd;
      const step = (b: BubbleState, isBig: boolean) => {
        b.age += dt;
        b.pos.addScaledVector(b.vel, dt);
        tmp.set(Math.sin(time * 1.3 + b.phase), Math.cos(time * 1.1 + b.phase * 1.7), Math.sin(time * 0.9 + b.phase * 0.6)).multiplyScalar(0.12 * dt);
        b.pos.add(tmp);
        // near the route end (outro) keep bubbles anywhere in the last ~30 units
        const behind = !inDrum && b.s < Math.min(focusS, course.length - 32) - (isBig ? 6 : 4);
        if (behind || b.age > b.life) spawn(b, focusS, isBig, false);
      };
      const bigLimit = Math.round((inDrum ? Math.min(nBig, 16) : nBig) * density);
      const smallLimit = Math.round((inDrum ? nSmall * 0.45 : nSmall) * density);
      for (let i = 0; i < nBig; i++) {
        const b = bigS[i];
        step(b, true);
        const pop = i < bigLimit ? Math.min(1, b.age * 2, (b.life - b.age) * 2) : 0;
        const sz = b.size * Math.max(0.001, pop) * (1 + 0.04 * Math.sin(time * 4 + b.phase));
        scl.set(sz, sz, sz);
        tmpM.compose(b.pos, one, scl);
        big.setMatrixAt(i, tmpM);
      }
      big.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < nSmall; i++) {
        const b = smallS[i];
        step(b, false);
        b.pos.toArray(sPos, i * 3);
        sSize[i] = i < smallLimit ? b.size * Math.min(1, b.age * 3, (b.life - b.age) * 3) : 0;
      }
      (pGeo.attributes.position as THREE.BufferAttribute).needsUpdate = true;
      (pGeo.attributes.aSize as THREE.BufferAttribute).needsUpdate = true;
    },
  };
}
