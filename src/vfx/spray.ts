/**
 * Spray droplets: one pooled THREE.Points draw for Benny's wake fans, landing splashes, the
 * final-wave crest spray and spout splashes. Simple ballistic CPU sim (gravity along -Y).
 */
import * as THREE from 'three';
import { FRAG_TAIL, withFog } from './glsl';
import { SPLASH05M, wake05State } from './riderSplash';

/**
 * `?splash05m=1` (on with `?match05=1`): while the Screen 05 wake card is live (riderSplash.ts createWakeCard05, which
 * carries the approved splash's own droplets), the small wake droplets (size < WAKE_DROP: index.ts wake() emits
 * 0.012–0.05) are not drawn; landing splashes (0.06–0.16) and the final-wave crest spray (0.08–0.2) are unchanged.
 */
const WAKE_DROP = 0.055;

const VERT = /* glsl */ `
attribute float aSize;
attribute float aAlpha;
uniform float uScale;
varying float vAlpha;
#include <fog_pars_vertex>
void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = clamp(aSize * uScale / -mvPosition.z, 1.0, 28.0);
  vAlpha = aAlpha;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;
// water bead (ref 05 droplets): translucent cyan body, brighter rim, a white glint up-left. Never a
// solid white disc: the old opaque discs read as white dots stuck round Benny's base.
const FRAG = /* glsl */ `
varying float vAlpha;
#include <fog_pars_fragment>
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c) * 2.0;
  if (d > 1.0) discard;
  float body = 1.0 - smoothstep(0.7, 1.0, d);
  float rim = smoothstep(0.45, 0.85, d) * body;
  float hl = smoothstep(0.32, 0.0, length(c - vec2(-0.14, -0.14)));
  vec3 col = mix(vec3(0.5, 0.88, 1.0), vec3(1.15, 1.18, 1.2), clamp(rim * 0.6 + hl, 0.0, 1.0));
  gl_FragColor = vec4(col, (body * 0.38 + rim * 0.3 + hl * 0.5) * vAlpha);
  ${FRAG_TAIL}
}
`;

export interface Spray {
  points: THREE.Points;
  emit(pos: THREE.Vector3, vel: THREE.Vector3, size: number, life: number): void;
  update(dt: number, camera: THREE.Camera): void;
  capacity: number;
}

export function createSpray(quality: 'high' | 'low'): Spray {
  const N = quality === 'high' ? 600 : 220;
  const pos = new Float32Array(N * 3);
  const vel = new Float32Array(N * 3);
  const size = new Float32Array(N);
  const alpha = new Float32Array(N);
  const age = new Float32Array(N).fill(1e9);
  const life = new Float32Array(N).fill(1);
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage));
  const uniforms = withFog({ uScale: { value: 600 } });
  const points = new THREE.Points(geo, new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, fog: true, transparent: true, depthWrite: false }));
  points.name = 'spray';
  points.frustumCulled = false;
  points.renderOrder = 6;
  let cursor = 0;
  return {
    points,
    capacity: N,
    emit(p, v, s, l) {
      const i = cursor;
      cursor = (cursor + 1) % N;
      p.toArray(pos, i * 3);
      v.toArray(vel, i * 3);
      size[i] = s;
      age[i] = 0;
      life[i] = l;
    },
    update(dt, camera) {
      const persp = camera as THREE.PerspectiveCamera;
      const vh = (typeof window !== 'undefined' ? window.innerHeight : 800) * (typeof window !== 'undefined' ? Math.min(2, window.devicePixelRatio || 1) : 1);
      uniforms.uScale.value = persp.isPerspectiveCamera ? vh / (2 * Math.tan(THREE.MathUtils.degToRad(persp.fov) / 2)) : 600;
      const hideWake = SPLASH05M && wake05State.active > 0;
      for (let i = 0; i < N; i++) {
        if (age[i] > life[i]) { alpha[i] = 0; continue; }
        age[i] += dt;
        vel[i * 3 + 1] -= 18 * dt;
        pos[i * 3] += vel[i * 3] * dt;
        pos[i * 3 + 1] += vel[i * 3 + 1] * dt;
        pos[i * 3 + 2] += vel[i * 3 + 2] * dt;
        const k = age[i] / life[i];
        alpha[i] = k < 1 ? Math.min(1, (1 - k) * 2.5) : 0;
        if (hideWake && size[i] < WAKE_DROP) alpha[i] = 0;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aSize.needsUpdate = true;
      geo.attributes.aAlpha.needsUpdate = true;
    },
  };
}
