/**
 * Scene 03 whirlpool: a funnel-shaped water surface over the basin (WORLD.basin / funnelY) whose
 * cyan / hot-pink / white bands follow the SAME logarithmic spiral as Benny's course through the
 * basin (θ decreasing as r shrinks, ~1 turn from r≈9.6 to r≈2.8) and swirl toward the drain.
 */
import * as THREE from 'three';
import { WORLD, funnelY } from '../world/course';
import { FRAG_TAIL, NOISE_GLSL, PALETTE, withFog } from './glsl';

/** spiral pitch: θ change per ln(r) along the course spiral: 2π / ln(9.6/2.8) */
export const SPIRAL_C = (Math.PI * 2) / Math.log(9.6 / 2.8);
export const FUNNEL_LIFT = 0.12;

const VERT = /* glsl */ `
uniform float uTime;
varying vec2 vPolar;   // r, theta
varying vec3 vPosW;
varying vec3 vNormalW;
#include <fog_pars_vertex>
attribute vec2 aPolar;
void main() {
  float r = aPolar.x;
  float th = aPolar.y;
  float w = 0.09 * sin(th * 3.0 - log(r) * 9.0 + uTime * 3.0) * smoothstep(2.6, 4.0, r);
  vec3 p = position + vec3(0.0, w, 0.0);
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vPolar = aPolar;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform float uSpiralC;
uniform float uRim;
uniform float uDrain;
uniform vec3 uCyanDeep;
uniform vec3 uCyan;
uniform vec3 uCyanBright;
uniform vec3 uPink;
uniform vec3 uPinkLight;
uniform vec3 uFoam;
uniform vec3 uHaze;
uniform vec3 uLightDir;
varying vec2 vPolar;
varying vec3 vPosW;
varying vec3 vNormalW;
#include <fog_pars_fragment>
${NOISE_GLSL}
// noise periodic in x with period P (lattice wrap) -> no seam where theta wraps
float pn(vec2 p, float P) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x0 = mod(i.x, P), x1 = mod(i.x + 1.0, P);
  return mix(mix(hash12(vec2(x0, i.y)), hash12(vec2(x1, i.y)), u.x),
             mix(hash12(vec2(x0, i.y + 1.0)), hash12(vec2(x1, i.y + 1.0)), u.x), u.y);
}
float pfbm(vec2 p, float P) {
  return 0.5 * pn(p, P) + 0.25 * pn(p * 2.0 + vec2(0.0, 7.3), P * 2.0) + 0.125 * pn(p * 4.0 + vec2(0.0, 3.1), P * 4.0);
}
float pcells(vec2 p, float P) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float md = 8.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 q = vec2(mod(i.x + g.x, P), i.y + g.y);
    vec2 o = vec2(hash12(q), hash12(q + 19.7));
    vec2 r = g + o - f;
    md = min(md, dot(r, r));
  }
  return sqrt(md);
}
void main() {
  float r = vPolar.x;
  float th = vPolar.y;
  float lr = log(r);
  // band coordinate is constant along the course flow lines; it rotates with time (swirl)
  float band = th - uSpiralC * lr;
  float swirl = band * (3.0 / 6.28318) + uTime * 0.45;
  // along-flow coordinate (inward motion) for streaks
  float along = lr * 6.0 + uTime * 1.6;
  float sw = band * (3.0 / 6.28318); // static part (periodic: +3 per turn)
  float n = pfbm(vec2(sw * 2.0 + uTime * 0.9, along * 0.6), 6.0);
  float bandF = fract(swirl + 0.18 * (n - 0.5));
  float pinkM = smoothstep(0.38, 0.46, bandF) * (1.0 - smoothstep(0.7, 0.78, bandF));
  float foamM = smoothstep(0.84, 0.9, bandF) * (1.0 - smoothstep(0.96, 1.0, bandF));
  foamM += smoothstep(0.02, 0.06, bandF) * (1.0 - smoothstep(0.08, 0.13, bandF)) * 0.55;
  vec3 cyanCol = mix(uCyanDeep, uCyan, 0.5 + 0.5 * n);
  cyanCol = mix(cyanCol, uCyanBright, smoothstep(0.6, 0.85, n) * 0.6);
  vec3 col = mix(cyanCol, mix(uPink, uPinkLight, n), pinkM);
  float c = pcells(vec2(sw * 22.0 + uTime * 9.9, along * 2.5), 66.0);
  col = mix(col, mix(uFoam, vec3(0.93, 0.88, 1.0), c), clamp(foamM * (0.7 + 0.3 * c), 0.0, 1.0));
  // streak highlights
  float lines = pow(pn(vec2(sw * 40.0 + uTime * 18.0, along * 1.2), 120.0), 7.0);
  col += vec3(1.0) * lines * 2.0;
  // glossy
  vec3 N = normalize(vNormalW + vec3(n - 0.5, 0.0, 0.5 - n) * 0.3);
  vec3 V = normalize(cameraPosition - vPosW);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  col = mix(col, mix(uHaze, vec3(1.0), 0.5), fres * 0.35);
  vec3 H = normalize(normalize(uLightDir) + V);
  col += pow(clamp(dot(N, H), 0.0, 1.0), 70.0) * 1.4;
  // sparkles
  vec2 g = vec2(sw * 30.0 + uTime * 13.5, along * 3.0);
  float hs = hash12(vec2(mod(floor(g.x), 90.0), floor(g.y)));
  col += step(0.94, hs) * smoothstep(0.2, 0.0, length(fract(g) - 0.5)) * (0.5 + 0.5 * sin(uTime * 6.0 + hs * 50.0)) * 1.3;
  // drain glow (bright light rising from the gold tube below) and white foam rim
  col = mix(col, vec3(1.6, 1.5, 1.2), smoothstep(uDrain + 1.6, uDrain, r) * 0.55);
  float rimFoam = smoothstep(uRim - 1.4, uRim - 0.2, r + 0.4 * (vnoise(vec2(th * 6.0, uTime)) - 0.5));
  col = mix(col, uFoam, rimFoam * 0.85);
  gl_FragColor = vec4(col, 1.0);
  ${FRAG_TAIL}
}
`;

export function createWhirlpool(quality: 'high' | 'low'): { mesh: THREE.Mesh; uniforms: Record<string, THREE.IUniform> } {
  const b = WORLD.basin;
  const rings = quality === 'high' ? 56 : 32;
  const segs = quality === 'high' ? 128 : 72;
  const rIn = b.drainRadius, rOut = b.rimRadius + 0.4;
  const pos: number[] = [], polar: number[] = [], nor: number[] = [], idx: number[] = [];
  for (let i = 0; i <= rings; i++) {
    // denser rings near the drain
    const t = i / rings;
    const r = rIn + (rOut - rIn) * Math.pow(t, 1.35);
    const y = funnelY(r) + FUNNEL_LIFT;
    const dr = 0.05;
    const dy = (funnelY(r + dr) - funnelY(Math.max(rIn * 0.6, r - dr))) / (2 * dr);
    for (let j = 0; j <= segs; j++) {
      const th = (j / segs) * Math.PI * 2;
      // same polar convention as the course: x = cx + r·sinθ, z = cz + r·cosθ
      const sx = Math.sin(th), cz = Math.cos(th);
      pos.push(b.center.x + r * sx, y, b.center.z + r * cz);
      const n = new THREE.Vector3(-dy * sx, 1, -dy * cz).normalize();
      nor.push(n.x, n.y, n.z);
      polar.push(r, th);
    }
  }
  for (let i = 0; i < rings; i++) {
    for (let j = 0; j < segs; j++) {
      const a = i * (segs + 1) + j, bb = a + 1, c = a + segs + 1, d = c + 1;
      idx.push(a, bb, c, bb, d, c);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  geo.setAttribute('aPolar', new THREE.Float32BufferAttribute(polar, 2));
  geo.setIndex(idx);
  geo.computeBoundingSphere();
  const uniforms = withFog({
    uTime: { value: 0 },
    uSpiralC: { value: SPIRAL_C },
    uRim: { value: b.rimRadius },
    uDrain: { value: b.drainRadius },
    uCyanDeep: { value: PALETTE.cyanDeep.clone() },
    uCyan: { value: PALETTE.cyan.clone() },
    uCyanBright: { value: PALETTE.cyanBright.clone() },
    uPink: { value: PALETTE.pink.clone() },
    uPinkLight: { value: PALETTE.pinkLight.clone() },
    uFoam: { value: PALETTE.foam.clone() },
    uHaze: { value: PALETTE.haze.clone() },
    uLightDir: { value: new THREE.Vector3(0.3, 1.0, 0.45).normalize() },
  });
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, fog: true, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'water_whirlpool';
  return { mesh, uniforms };
}

/** height of the whirlpool water above the course frame at a world point (≈ wave only) */
export function whirlpoolHeight(x: number, z: number, t: number): number {
  const b = WORLD.basin;
  const dx = x - b.center.x, dz = z - b.center.z;
  const r = Math.max(0.1, Math.hypot(dx, dz));
  const th = Math.atan2(dx, dz);
  const k = Math.min(1, Math.max(0, (r - 2.6) / 1.4));
  return 0.09 * Math.sin(th * 3 - Math.log(r) * 9 + t * 3) * k * k * (3 - 2 * k);
}
