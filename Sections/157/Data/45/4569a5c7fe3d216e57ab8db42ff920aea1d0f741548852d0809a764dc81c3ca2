/**
 * Washer-world materials: procedural perforated magenta metal (round holes for drums, circumferential
 * slots for tunnels), thick reflective gold, chrome, glass — all PBR (MeshStandardMaterial) so they pick
 * up the candy PMREM environment, with shader patches for the perforations and glow.
 */
import * as THREE from 'three';

export interface PerforatedOptions {
  /** base metal colour */
  color?: THREE.ColorRepresentation;
  /** colour of the hole interiors */
  holeColor?: THREE.ColorRepresentation;
  /** 0 = round holes (drum), 1 = slots elongated along u (tunnel rings) */
  slot?: number;
  /** pattern repeats: holes around u (per 0..1) and per uv-unit along v */
  repeatU?: number;
  repeatV?: number;
  /** hole size relative to its cell (0..1) */
  holeSize?: number;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  side?: THREE.Side;
  /** bright stripe highlights running along v (tunnel light streaks) */
  streaks?: number;
}

export function perforatedMetal(o: PerforatedOptions = {}): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    color: o.color ?? '#d13fd6',
    metalness: o.metalness ?? 0.72,
    roughness: o.roughness ?? 0.26,
    emissive: new THREE.Color(o.emissive ?? '#9a1fa8'),
    emissiveIntensity: o.emissiveIntensity ?? 0.42,
    side: o.side ?? THREE.BackSide,
    envMapIntensity: 1.25,
  });
  const uniforms = {
    uHoleColor: { value: new THREE.Color(o.holeColor ?? '#2b0640') },
    uSlot: { value: o.slot ?? 1 },
    uRepeat: { value: new THREE.Vector2(o.repeatU ?? 64, o.repeatV ?? 1.2) },
    uHoleSize: { value: o.holeSize ?? 0.42 },
    uStreaks: { value: o.streaks ?? 0.35 },
  };
  mat.userData.perfUniforms = uniforms;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vPerfUv;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvPerfUv = uv;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec2 vPerfUv;
uniform vec3 uHoleColor; uniform float uSlot; uniform vec2 uRepeat; uniform float uHoleSize; uniform float uStreaks;
float perfMask(vec2 uv, out float rim){
  vec2 g = uv * uRepeat;
  float row = floor(g.y);
  g.x += mod(row, 2.0) * 0.5;          // staggered rows
  vec2 f = fract(g) - 0.5;
  vec2 hs = mix(vec2(uHoleSize*0.5), vec2(uHoleSize*0.62, uHoleSize*0.24), uSlot);
  vec2 q = abs(f) - hs + min(hs.x, hs.y);
  float d = length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - min(hs.x, hs.y);
  float aa = fwidth(d) * 1.2 + 1e-4;
  rim = smoothstep(0.06, 0.0, abs(d - 0.02)) * step(0.0, f.y);  // light catching the lower lip
  return 1.0 - smoothstep(-aa, aa, d); // 1 inside hole
}`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
float perfRim; float perfHole = perfMask(vPerfUv, perfRim);
float streak = pow(0.5 + 0.5 * sin(vPerfUv.x * 6.2831 * 9.0 + 1.3), 18.0) * uStreaks;
diffuseColor.rgb = mix(diffuseColor.rgb * (1.0 + streak), uHoleColor, perfHole);`,
      )
      .replace(
        '#include <metalnessmap_fragment>',
        `#include <metalnessmap_fragment>
metalnessFactor *= (1.0 - perfHole);`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
roughnessFactor = mix(roughnessFactor, 0.9, perfHole);`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
totalEmissiveRadiance = totalEmissiveRadiance * (1.0 - perfHole) + vec3(1.0, 0.82, 1.0) * perfRim * 0.55 * (1.0 - perfHole) + vec3(1.0,0.9,1.0) * streak * 0.6;`,
      );
  };
  mat.customProgramCacheKey = () => 'perf-v1';
  return mat;
}

export function gold(opts: { roughness?: number; emissive?: number; color?: THREE.ColorRepresentation } = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: opts.color ?? '#ffb83d',
    metalness: 1,
    roughness: opts.roughness ?? 0.2,
    emissive: new THREE.Color('#b85c00'),
    emissiveIntensity: opts.emissive ?? 0.38,
    envMapIntensity: 1.6,
  });
}

/** gold with ribbed "ring pipe" bands along v (scene 04 tunnel) */
export function goldRibbed(repeatV = 1.6): THREE.MeshStandardMaterial {
  const m = gold({ roughness: 0.18, emissive: 0.5 });
  m.side = THREE.BackSide;
  const uniforms = { uRibs: { value: repeatV } };
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vRibUv;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvRibUv = uv;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vRibUv; uniform float uRibs;')
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
float rp = fract(vRibUv.y * uRibs);
diffuseColor.rgb *= 0.72 + 0.42 * smoothstep(0.0, 0.5, rp) * smoothstep(1.0, 0.5, rp);`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
float edge = smoothstep(0.85, 1.0, fract(vRibUv.y * uRibs));
totalEmissiveRadiance += vec3(1.0, 0.86, 0.5) * edge * 0.9;`,
      );
  };
  m.customProgramCacheKey = () => 'goldrib-v1';
  return m;
}

export function chrome(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: '#efe6ff', metalness: 1, roughness: 0.12, envMapIntensity: 1.5, emissive: '#3a2a55', emissiveIntensity: 0.25 });
}

export function glass(tint: THREE.ColorRepresentation = '#dfe9ff', opacity = 0.18): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0,
    roughness: 0.04,
    transmission: 0,
    transparent: true,
    opacity,
    envMapIntensity: 2.2,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

/** soft unlit-ish painted material for the laundry room seen through doors (keeps it bright & airy) */
export function painted(color: THREE.ColorRepresentation, emissive = 0.35, roughness = 0.75): THREE.MeshStandardMaterial {
  const c = new THREE.Color(color);
  return new THREE.MeshStandardMaterial({ color: c, roughness, metalness: 0, emissive: c, emissiveIntensity: emissive });
}

/** canvas texture helper */
export function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, srgb = true): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
