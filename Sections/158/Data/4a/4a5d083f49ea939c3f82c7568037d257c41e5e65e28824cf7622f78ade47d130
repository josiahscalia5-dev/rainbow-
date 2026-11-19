/**
 * Scene 09 "final wave": a tall curling wall of blue/pink water rising on the LEFT of the course
 * through the Final Spin Chamber, its foot joined to the stream's left edge, the lip curling back
 * over the stream, rolling along with the flow; white foam crest + spray (spray emitted by index.ts).
 */
import * as THREE from 'three';
import type { Course } from '../world/course';
import { EDGE_LIFT } from './waterRibbon';
import { FRAG_TAIL, NOISE_GLSL, PALETTE, withFog } from './glsl';

const VERT = /* glsl */ `
uniform float uTime;
attribute vec2 aWave;    // x = profile parameter p (0 foot .. 1 lip), y = s
attribute vec3 aOut;     // outward (left) direction at this row
attribute float aEnv;    // height envelope 0..1
varying vec2 vWave;
varying float vEnv;
varying vec3 vPosW;
varying vec3 vNormalW;
#include <fog_pars_vertex>
void main() {
  float p = aWave.x;
  float s = aWave.y;
  // rolling: the lip breathes and a bulge travels along the wall with the flow
  float roll = sin(s * 0.45 - uTime * 2.2) * 0.5 + sin(s * 0.17 - uTime * 0.9) * 0.5;
  vec3 pos = position;
  pos += normal * (0.35 * roll * p * aEnv);
  pos += aOut * (-0.6 * p * p * (0.5 + 0.5 * sin(uTime * 1.6 + s * 0.3)) * aEnv);
  vec4 wp = modelMatrix * vec4(pos, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vWave = aWave;
  vEnv = aEnv;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform float uSpeed;
uniform vec3 uCyanDeep;
uniform vec3 uCyan;
uniform vec3 uCyanBright;
uniform vec3 uPink;
uniform vec3 uPinkLight;
uniform vec3 uFoam;
uniform vec3 uHaze;
uniform vec3 uLightDir;
varying vec2 vWave;
varying float vEnv;
varying vec3 vPosW;
varying vec3 vNormalW;
#include <fog_pars_fragment>
${NOISE_GLSL}
void main() {
  float p = vWave.x;
  float s = vWave.y;
  // streaks run up the face toward the lip and along with the flow
  vec2 q = vec2(s * 0.5 - uTime * uSpeed * 0.5, p * 5.0 - uTime * 1.2);
  float n = fbm3(q * vec2(0.6, 0.8));
  float band = fract(p * 2.2 + 0.35 * (n - 0.5) + s * 0.03);
  float pinkM = smoothstep(0.45, 0.55, band) * (1.0 - smoothstep(0.8, 0.9, band));
  vec3 col = mix(mix(uCyanDeep, uCyan, 0.4 + 0.6 * n), mix(uPink, uPinkLight, n), pinkM);
  col = mix(col, uCyanBright, smoothstep(0.55, 0.85, n) * 0.5 * (1.0 - pinkM));
  float lines = pow(vnoise(vec2(s * 2.5 - uTime * uSpeed * 2.0, p * 30.0)), 7.0);
  col += lines * 2.0;
  // foam: crest + foot
  float c = cells(vec2(s * 2.0 - uTime * uSpeed * 0.6, p * 14.0 - uTime));
  float crest = smoothstep(0.74, 0.9, p + (n - 0.5) * 0.12);
  float foot = 1.0 - smoothstep(0.02, 0.1, p);
  col = mix(col, mix(uFoam, vec3(0.94, 0.9, 1.0), c), clamp(crest + foot * 0.7, 0.0, 1.0) * (0.75 + 0.25 * c));
  // gloss / translucency
  vec3 N = normalize(vNormalW);
  vec3 V = normalize(cameraPosition - vPosW);
  if (dot(N, V) < 0.0) N = -N;
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  col = mix(col, mix(uHaze, vec3(1.0), 0.5), fres * 0.4);
  vec3 H = normalize(normalize(uLightDir) + V);
  col += pow(clamp(dot(N, H), 0.0, 1.0), 60.0) * 1.5;
  vec2 g = vec2(s * 3.0, p * 18.0);
  float hs = hash12(floor(g));
  col += step(0.95, hs) * smoothstep(0.2, 0.0, length(fract(g) - 0.5)) * (0.5 + 0.5 * sin(uTime * 6.0 + hs * 50.0)) * 1.3;
  float alpha = clamp(0.82 + crest * 0.18, 0.0, 1.0) * smoothstep(0.0, 0.18, vEnv);
  gl_FragColor = vec4(col, alpha);
  ${FRAG_TAIL}
}
`;

function bezier(p0: THREE.Vector2, p1: THREE.Vector2, p2: THREE.Vector2, p3: THREE.Vector2, t: number, out: THREE.Vector2) {
  const it = 1 - t;
  out.set(0, 0)
    .addScaledVector(p0, it * it * it)
    .addScaledVector(p1, 3 * it * it * t)
    .addScaledVector(p2, 3 * it * t * t)
    .addScaledVector(p3, t * t * t);
  return out;
}

export interface FinalWave {
  mesh: THREE.Mesh;
  uniforms: Record<string, THREE.IUniform>;
  /** world positions along the curling lip (for spray emission) */
  crest: THREE.Vector3[];
  s0: number;
  s1: number;
}

export function createFinalWave(course: Course, quality: 'high' | 'low', height = 9): FinalWave {
  const st = course.stage('09');
  const s0 = st.s0 - 4, s1 = course.stage('10').s0 + 3;
  const rows = quality === 'high' ? 90 : 50;
  const cols = quality === 'high' ? 28 : 16;
  const pos: number[] = [], nor: number[] = [], wave: number[] = [], out: number[] = [], env: number[] = [], idx: number[] = [];
  const crest: THREE.Vector3[] = [];
  const b = new THREE.Vector2();
  const b2 = new THREE.Vector2();
  const P = new THREE.Vector3();
  for (let i = 0; i <= rows; i++) {
    const s = s0 + ((s1 - s0) * i) / rows;
    const f = course.sample(s);
    const hw = course.widthAt(s) / 2;
    const x = (s - s0) / (s1 - s0);
    // height envelope: grows in, peaks in the middle of 09, tapers by early 10
    const e = Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, x))), 0.75);
    const H = height * e;
    const left = f.right.clone().negate();
    // profile in (outward o, height h) relative to the stream's left edge
    const p0 = new THREE.Vector2(0, EDGE_LIFT);
    const p1 = new THREE.Vector2(3.4, 0.6 + 0.2 * H);
    const p2 = new THREE.Vector2(4.6, H * 1.06);
    const p3 = new THREE.Vector2(1.0 - 0.15 * H, H * 0.8);
    for (let j = 0; j <= cols; j++) {
      const t = j / cols;
      bezier(p0, p1, p2, p3, t, b);
      bezier(p0, p1, p2, p3, Math.min(1, t + 0.01), b2);
      P.copy(f.pos).addScaledVector(left, hw + b.x).addScaledVector(f.up, b.y);
      pos.push(P.x, P.y, P.z);
      // normal: perpendicular to the profile tangent, facing the stream (inside of the curl)
      const tx = b2.x - b.x, ty = b2.y - b.y;
      const n = new THREE.Vector3().addScaledVector(left, ty).addScaledVector(f.up, -tx).normalize().negate();
      nor.push(n.x, n.y, n.z);
      wave.push(t, s);
      out.push(left.x, left.y, left.z);
      env.push(e);
      if (j === cols && i % 4 === 0 && e > 0.35) crest.push(P.clone());
    }
  }
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const a = i * (cols + 1) + j, bb = a + 1, c = a + cols + 1, d = c + 1;
      idx.push(a, c, bb, bb, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('aWave', new THREE.Float32BufferAttribute(wave, 2));
  geo.setAttribute('aOut', new THREE.Float32BufferAttribute(out, 3));
  geo.setAttribute('aEnv', new THREE.Float32BufferAttribute(env, 1));
  geo.setIndex(idx);
  geo.computeBoundingSphere();
  const uniforms = withFog({
    uTime: { value: 0 },
    uSpeed: { value: st.speed },
    uCyanDeep: { value: PALETTE.cyanDeep.clone() },
    uCyan: { value: PALETTE.cyan.clone() },
    uCyanBright: { value: PALETTE.cyanBright.clone() },
    uPink: { value: PALETTE.pink.clone() },
    uPinkLight: { value: PALETTE.pinkLight.clone() },
    uFoam: { value: PALETTE.foam.clone() },
    uHaze: { value: PALETTE.haze.clone() },
    uLightDir: { value: new THREE.Vector3(0.3, 1.0, 0.45).normalize() },
  });
  const mesh = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, fog: true, transparent: true, side: THREE.DoubleSide }),
  );
  mesh.name = 'water_final_wave';
  mesh.renderOrder = 1;
  return { mesh, uniforms, crest, s0, s1 };
}
