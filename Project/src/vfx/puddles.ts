/**
 * Scene 11 leftover puddles: glimmering cyan/blue pools with foam bits on the curved perforated
 * floor of the Final Spin Chamber in front of the towel platform (ref 11). Patches conform to the
 * chamber cylinder (WORLD.chamber); faded in with `amount` (outro).
 */
import * as THREE from 'three';
import { WORLD } from '../world/course';
import { FRAG_TAIL, NOISE_GLSL, PALETTE, withFog } from './glsl';

const VERT = /* glsl */ `
varying vec2 vLocal;
varying vec3 vPosW;
attribute vec2 aLocal;
#include <fog_pars_vertex>
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  vLocal = aLocal;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;
const FRAG = /* glsl */ `
uniform float uTime;
uniform float uAmount;
uniform vec3 uCyanDeep;
uniform vec3 uCyan;
uniform vec3 uCyanBright;
uniform vec3 uPink;
uniform vec3 uFoam;
varying vec2 vLocal;   // -1..1 in the puddle patch
varying vec3 vPosW;
#include <fog_pars_fragment>
${NOISE_GLSL}
void main() {
  vec2 p = vLocal;
  float ang = atan(p.y, p.x);
  float rad = 0.72 + 0.22 * sin(ang * 3.0 + vPosW.x) + 0.12 * vnoise(vec2(ang * 2.0 + vPosW.z, 1.0)) - 0.06;
  float d = length(p);
  float inside = smoothstep(rad, rad - 0.06, d);
  if (inside * uAmount < 0.01) discard;
  vec2 q = vPosW.xz;
  float n = fbm3(q * 0.9 + vec2(uTime * 0.15, -uTime * 0.1));
  vec3 col = mix(uCyanDeep, uCyan, n);
  col = mix(col, uCyanBright, smoothstep(0.55, 0.85, n) * 0.6);
  col = mix(col, uPink, smoothstep(0.72, 0.8, vnoise(q * 1.4 + 9.0)) * 0.3);
  float rim = smoothstep(rad - 0.2, rad - 0.03, d) * inside;
  float c = cells(q * 4.0);
  col = mix(col, uFoam, rim * (0.5 + 0.5 * smoothstep(0.2, 0.5, c)));
  float lines = pow(vnoise(vec2(q.x * 5.0 + uTime * 0.3, q.y * 1.5)), 6.0);
  col += lines * 1.5;
  vec2 g = q * 5.0;
  float hs = hash12(floor(g));
  col += step(0.92, hs) * smoothstep(0.22, 0.0, length(fract(g) - 0.5)) * (0.5 + 0.5 * sin(uTime * 5.0 + hs * 40.0)) * 1.6;
  gl_FragColor = vec4(col, inside * uAmount * 0.88);
  ${FRAG_TAIL}
}
`;

export interface Puddles {
  group: THREE.Group;
  uniforms: Record<string, THREE.IUniform>;
}

export function createPuddles(): Puddles {
  const ch = WORLD.chamber;
  const pl = WORLD.platform;
  const uniforms = withFog({
    uTime: { value: 0 },
    uAmount: { value: 0 },
    uCyanDeep: { value: PALETTE.cyanDeep.clone() },
    uCyan: { value: PALETTE.cyan.clone() },
    uCyanBright: { value: PALETTE.cyanBright.clone() },
    uPink: { value: PALETTE.pink.clone() },
    uFoam: { value: PALETTE.foam.clone() },
  });
  const mat = new THREE.ShaderMaterial({
    uniforms, vertexShader: VERT, fragmentShader: FRAG, fog: true, transparent: true, depthWrite: false,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
  });
  const group = new THREE.Group();
  group.name = 'water_puddles';
  // puddle centres (dx from chamber axis, z) in front of the platform (camera side, +Z of platform)
  const spots: [number, number, number, number][] = [
    [-5.5, pl.center.z + 7.0, 3.2, 1.7],
    [4.8, pl.center.z + 6.0, 3.0, 1.5],
    [-1.0, pl.center.z + 9.5, 2.6, 1.3],
    [1.5, pl.center.z + 4.2, 2.2, 1.1],
    [-7.5, pl.center.z + 3.0, 1.6, 1.0],
    [7.8, pl.center.z + 9.0, 1.7, 0.9],
  ];
  for (const [dx, z, rx, rz] of spots) {
    const seg = 16;
    const pos: number[] = [], loc: number[] = [], idx: number[] = [];
    for (let i = 0; i <= seg; i++) {
      for (let j = 0; j <= seg; j++) {
        const lx = -1 + (2 * j) / seg, lz = -1 + (2 * i) / seg;
        const x = dx + lx * rx;
        const y = ch.center.y - Math.sqrt(Math.max(0, ch.radius ** 2 - x * x)) + 0.05;
        pos.push(ch.center.x + x, y, z + lz * rz);
        loc.push(lx, lz);
      }
    }
    for (let i = 0; i < seg; i++) for (let j = 0; j < seg; j++) {
      const a = i * (seg + 1) + j, b = a + 1, c = a + seg + 1, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aLocal', new THREE.Float32BufferAttribute(loc, 2));
    g.setIndex(idx);
    g.computeBoundingSphere();
    const m = new THREE.Mesh(g, mat);
    m.renderOrder = 1;
    group.add(m);
  }
  return { group, uniforms };
}
