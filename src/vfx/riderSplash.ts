/**
 * Rider splash crown: a thin animated water sheet that flares out of the surface around Benny's
 * waterline (ref 05: white splash/wake fanning out to both sides and backwards).
 *
 * One small mesh (polar grid: angle × radial), shaped and animated entirely in the vertex shader,
 * and drawn with a translucent "finger + lace" fragment shader. It is placed every frame at the
 * computed water surface under Benny (index.ts `wake()`), so it always sits exactly on the stream
 * that carries him. Hidden automatically when wake() stops being called (intro / outro).
 */
import * as THREE from 'three';
import { FRAG_TAIL, NOISE_GLSL, withFog } from './glsl';

const VERT = /* glsl */ `
attribute vec2 aPolar;   // x = angle (0 = straight behind Benny, ±pi = in front), y = radial 0..1
uniform float uTime;
uniform float uR;        // waterline radius of Benny's body (units)
uniform float uStrength; // 0..1
varying vec2 vPolar;
varying float vSide;
varying vec3 vPosW;
#include <fog_pars_vertex>
float h1(float n) { return fract(sin(n) * 43758.5453); }
float n1(float x) { float i = floor(x); float f = fract(x); f = f * f * (3.0 - 2.0 * f); return mix(h1(i), h1(i + 1.0), f); }
void main() {
  float th = aPolar.x;
  float t = aPolar.y;
  float ath = abs(th);
  // strongest beside Benny and diagonally behind him, low bow wave in front, calm right behind
  float side = smoothstep(0.5, 1.2, ath) * (1.0 - 0.8 * smoothstep(1.9, 2.8, ath));
  float wob = n1(th * 4.0 + uTime * 5.0) * 0.5 + n1(th * 9.0 - uTime * 7.0) * 0.5;
  float reach = mix(1.0, 2.15 + 0.5 * wob, t) * (0.75 + 0.25 * side);
  float r = uR * mix(0.92, reach, t);
  // sheet rises steeply out of the water at the body, then arcs back down (crown profile)
  float lift = uR * (0.55 + 0.25 * wob) * side * uStrength;
  float y = lift * sin(3.14159 * pow(t, 0.7)) * (1.0 - 0.35 * t) - 0.04 * uR;
  vec3 p = vec3(sin(th) * r, y, cos(th) * r);   // local: x = side, y = up, z = backwards
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vPosW = wp.xyz;
  vPolar = aPolar;
  vSide = side;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform float uStrength;
varying vec2 vPolar;
varying float vSide;
varying vec3 vPosW;
#include <fog_pars_fragment>
${NOISE_GLSL}
void main() {
  float th = vPolar.x;
  float t = vPolar.y;
  // radial fingers streaming outward, with soap-lace holes
  float fing = vnoise(vec2(th * 17.0, t * 1.6 - uTime * 4.0));
  fing = smoothstep(0.5, 0.78, fing);
  float lace = cells(vec2(th * 10.0, t * 6.0 - uTime * 3.0));
  float body = 1.0 - smoothstep(0.08, 0.3, t);           // churn right at the body
  float a = max(body * smoothstep(0.12, 0.35, lace), fing * smoothstep(0.15, 0.4, lace));
  a *= (1.0 - smoothstep(0.55, 0.95, t)) * vSide * uStrength;
  if (a < 0.02) discard;
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 col = mix(vec3(0.62, 0.92, 1.0), vec3(1.15, 1.18, 1.2), smoothstep(0.2, 0.75, a));
  gl_FragColor = vec4(col, clamp(a * 0.95, 0.0, 0.95));
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
  const S = quality === 'high' ? 56 : 28;
  const R = quality === 'high' ? 7 : 4;
  const polar = new Float32Array((S + 1) * (R + 1) * 2);
  let k = 0;
  for (let i = 0; i <= S; i++) {
    for (let j = 0; j <= R; j++) {
      polar[k++] = -Math.PI + (2 * Math.PI * i) / S;
      polar[k++] = j / R;
    }
  }
  const idx: number[] = [];
  for (let i = 0; i < S; i++) {
    for (let j = 0; j < R; j++) {
      const a = i * (R + 1) + j, b = a + 1, c = a + R + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('aPolar', new THREE.BufferAttribute(polar, 2));
  // dummy position attribute (positions are generated in the vertex shader)
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((S + 1) * (R + 1) * 3), 3));
  geo.setIndex(idx);
  const uniforms = withFog({ uTime: { value: 0 }, uR: { value: 0.7 }, uStrength: { value: 0 } });
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
