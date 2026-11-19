/**
 * Drum A water (scenes 01–02).
 *  - surface: glossy swell filling the drum below WORLD.drumA.waterY with layered cyan / hot-pink
 *    bands and foam crests (ref 01); clipped to the drum cylinder in the fragment shader.
 *  - swirl sheet: a translucent spinning water shell hugging the drum wall (ref 02 tumble),
 *    faded in with `swirl` 0..1 by the game during scene 02.
 */
import * as THREE from 'three';
import { WORLD } from '../world/course';
import { FRAG_TAIL, NOISE_GLSL, PALETTE, withFog } from './glsl';

const SURF_VERT = /* glsl */ `
uniform float uTime;
uniform float uAgitation;
varying vec3 vPosW;
varying float vH;
#include <fog_pars_vertex>
float waveH(vec2 p, float t, float amp) {
  return amp * (0.55 * sin(p.x * 1.1 + p.y * 0.6 + t * 1.8)
              + 0.35 * sin(-p.x * 0.7 + p.y * 1.5 - t * 2.3)
              + 0.22 * sin(p.x * 2.3 - p.y * 1.9 + t * 3.1));
}
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  float amp = 0.3 + uAgitation * 0.5;
  float h = waveH(wp.xz, uTime, amp);
  wp.y += h;
  vH = h / amp;
  vPosW = wp.xyz;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const SURF_FRAG = /* glsl */ `
uniform float uTime;
uniform float uAgitation;
uniform vec3 uDrumC;     // centre x, y, radius
uniform vec3 uCyanDeep;
uniform vec3 uCyan;
uniform vec3 uCyanBright;
uniform vec3 uPink;
uniform vec3 uPinkLight;
uniform vec3 uFoam;
uniform vec3 uHaze;
uniform vec3 uLightDir;
varying vec3 vPosW;
varying float vH;
#include <fog_pars_fragment>
${NOISE_GLSL}
void main() {
  vec2 d = vPosW.xy - uDrumC.xy;
  if (dot(d, d) > uDrumC.z * uDrumC.z) discard;
  vec2 p = vPosW.xz;
  float n = fbm3(p * 0.55 + vec2(uTime * 0.25, -uTime * 0.15));
  // layered bands roughly parallel to the wave crests
  float field = sin(p.x * 0.85 + p.y * 0.55 + uTime * 0.7 + n * 3.0);
  float pinkM = smoothstep(0.15, 0.35, field);
  vec3 cyanCol = mix(uCyanDeep, uCyan, 0.45 + 0.55 * n);
  cyanCol = mix(cyanCol, uCyanBright, smoothstep(0.35, 0.9, vH) * 0.55);
  vec3 col = mix(cyanCol, mix(uPink, uPinkLight, n), pinkM);
  // foam on the band seams and on crests
  float seam = 1.0 - smoothstep(0.0, 0.12, abs(field - 0.25));
  float c = cells(p * 3.2 + vec2(uTime * 0.4, 0.0));
  float crest = smoothstep(0.55, 0.95, vH + (n - 0.5) * 0.5);
  float foamM = clamp(seam * 0.8 + crest * (0.6 + 0.4 * uAgitation), 0.0, 1.0) * (0.65 + 0.35 * smoothstep(0.15, 0.55, c));
  col = mix(col, mix(uFoam, vec3(0.93, 0.88, 1.0), c), foamM);
  // streak highlights
  float lines = pow(vnoise(vec2(p.x * 6.0 + p.y * 3.0, p.y * 1.2 - uTime * 0.8)), 7.0);
  col += lines * 1.8;
  // gloss (normal from the analytic wave slope is approximated by screen derivatives)
  vec3 N = normalize(cross(dFdx(vPosW), dFdy(vPosW)));
  if (N.y < 0.0) N = -N;
  vec3 V = normalize(cameraPosition - vPosW);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  col = mix(col, mix(uHaze, vec3(1.0), 0.6), fres * 0.45);
  vec3 H = normalize(normalize(uLightDir) + V);
  col += pow(clamp(dot(N, H), 0.0, 1.0), 60.0) * 1.6;
  vec2 g = p * 4.0;
  float hs = hash12(floor(g));
  col += step(0.95, hs) * smoothstep(0.2, 0.0, length(fract(g) - 0.5)) * (0.5 + 0.5 * sin(uTime * 6.0 + hs * 50.0)) * 1.4;
  gl_FragColor = vec4(col, 1.0);
  ${FRAG_TAIL}
}
`;

const SWIRL_VERT = /* glsl */ `
varying vec3 vPosW;
varying vec3 vNormalW;
#include <fog_pars_vertex>
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const SWIRL_FRAG = /* glsl */ `
uniform float uTime;
uniform float uSwirl;
uniform vec3 uDrumC;
uniform vec3 uCyan;
uniform vec3 uCyanBright;
uniform vec3 uPink;
uniform vec3 uPinkLight;
uniform vec3 uFoam;
varying vec3 vPosW;
varying vec3 vNormalW;
#include <fog_pars_fragment>
${NOISE_GLSL}
float pn(vec2 p, float P) {
  vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
  float x0 = mod(i.x, P), x1 = mod(i.x + 1.0, P);
  return mix(mix(hash12(vec2(x0, i.y)), hash12(vec2(x1, i.y)), u.x),
             mix(hash12(vec2(x0, i.y + 1.0)), hash12(vec2(x1, i.y + 1.0)), u.x), u.y);
}
void main() {
  vec2 d = vPosW.xy - uDrumC.xy;
  float th = atan(d.y, d.x);             // -pi..pi
  float a = th / 6.28318 + 0.5;          // 0..1 around
  float z = vPosW.z;
  float spin = a * 4.0 + z * 0.22 + uTime * 0.9;     // 4 bands per turn, spiralling along z
  float n = pn(vec2(a * 8.0 + uTime * 1.8, z * 0.8), 8.0);
  float f = fract(spin + 0.25 * (n - 0.5));
  float pinkM = smoothstep(0.42, 0.5, f) * (1.0 - smoothstep(0.72, 0.8, f));
  float foamM = smoothstep(0.86, 0.92, f) * (1.0 - smoothstep(0.97, 1.0, f));
  vec3 col = mix(mix(uCyan, uCyanBright, n), mix(uPink, uPinkLight, n), pinkM);
  col = mix(col, uFoam, foamM);
  col += pow(pn(vec2(a * 96.0 + uTime * 20.0, z * 2.0), 96.0), 7.0) * 1.6;
  // more water low in the drum, ragged gaps higher up so the perforated wall shows through
  float low = smoothstep(0.35, -0.6, d.y / uDrumC.z);
  float gaps = smoothstep(0.25, 0.55, pn(vec2(a * 6.0 - uTime * 0.6, z * 0.35 + 3.0), 6.0) + low * 0.6);
  float alpha = uSwirl * clamp(0.18 + 0.7 * gaps + foamM * 0.3, 0.0, 0.92);
  // fade toward the door so the opening stays readable
  alpha *= 1.0 - smoothstep(1.2, 3.2, z);
  gl_FragColor = vec4(col, alpha);
  ${FRAG_TAIL}
}
`;

export interface DrumWater {
  group: THREE.Group;
  surface: THREE.Mesh;
  swirl: THREE.Mesh;
  uniforms: Record<string, THREE.IUniform>;
  swirlUniforms: Record<string, THREE.IUniform>;
  heightAt(x: number, z: number, t: number): number;
}

export function createDrumWater(quality: 'high' | 'low'): DrumWater {
  const dA = WORLD.drumA;
  const group = new THREE.Group();
  group.name = 'water_drumA';
  const res = quality === 'high' ? 72 : 36;
  const w = 2 * Math.sqrt(dA.radius ** 2 - (dA.waterY - dA.center.y) ** 2) + 1.4;
  const len = dA.zDoor - 0.15 - dA.zBack;
  const geo = new THREE.PlaneGeometry(w, len, res, Math.round(res * (len / w)));
  geo.rotateX(-Math.PI / 2);
  geo.translate(dA.center.x, dA.waterY, dA.zBack + len / 2);
  const common = {
    uTime: { value: 0 },
    uAgitation: { value: 0 },
    uDrumC: { value: new THREE.Vector3(dA.center.x, dA.center.y, dA.radius - 0.04) },
    uCyanDeep: { value: PALETTE.cyanDeep.clone() },
    uCyan: { value: PALETTE.cyan.clone() },
    uCyanBright: { value: PALETTE.cyanBright.clone() },
    uPink: { value: PALETTE.pink.clone() },
    uPinkLight: { value: PALETTE.pinkLight.clone() },
    uFoam: { value: PALETTE.foam.clone() },
    uHaze: { value: PALETTE.haze.clone() },
    uLightDir: { value: new THREE.Vector3(-0.2, 1.0, 0.6).normalize() },
  };
  const uniforms = withFog(common);
  const surface = new THREE.Mesh(
    geo,
    new THREE.ShaderMaterial({ uniforms, vertexShader: SURF_VERT, fragmentShader: SURF_FRAG, fog: true, side: THREE.DoubleSide }),
  );
  surface.name = 'water_drumA_surface';
  group.add(surface);

  const swirlGeo = new THREE.CylinderGeometry(dA.radius - 0.3, dA.radius - 0.3, dA.zDoor - dA.zBack - 0.6, quality === 'high' ? 72 : 40, 12, true);
  swirlGeo.rotateX(Math.PI / 2);
  swirlGeo.translate(dA.center.x, dA.center.y, (dA.zDoor + dA.zBack) / 2 - 0.1);
  const swirlUniforms = withFog({
    uTime: uniforms.uTime,
    uSwirl: { value: 0 },
    uDrumC: uniforms.uDrumC,
    uCyan: { value: PALETTE.cyan.clone() },
    uCyanBright: { value: PALETTE.cyanBright.clone() },
    uPink: { value: PALETTE.pink.clone() },
    uPinkLight: { value: PALETTE.pinkLight.clone() },
    uFoam: { value: PALETTE.foam.clone() },
  });
  // share the same time uniform object
  swirlUniforms.uTime = uniforms.uTime;
  swirlUniforms.uDrumC = uniforms.uDrumC;
  const swirl = new THREE.Mesh(
    swirlGeo,
    new THREE.ShaderMaterial({
      uniforms: swirlUniforms,
      vertexShader: SWIRL_VERT,
      fragmentShader: SWIRL_FRAG,
      fog: true,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    }),
  );
  swirl.name = 'water_drumA_swirl';
  swirl.renderOrder = 2;
  swirl.visible = false;
  group.add(swirl);

  return {
    group,
    surface,
    swirl,
    uniforms,
    swirlUniforms,
    heightAt(x, z, t) {
      const amp = 0.3 + (uniforms.uAgitation.value as number) * 0.5;
      return (
        dA.waterY +
        amp * (0.55 * Math.sin(x * 1.1 + z * 0.6 + t * 1.8) + 0.35 * Math.sin(-x * 0.7 + z * 1.5 - t * 2.3) + 0.22 * Math.sin(x * 2.3 - z * 1.9 + t * 3.1))
      );
    },
  };
}
