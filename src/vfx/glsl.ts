/** Shared GLSL snippets for Rainbow water/foam/bubble shaders (WebGL2, mobile-safe). */
import * as THREE from 'three';

export const NOISE_GLSL = /* glsl */ `
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), u.x),
             mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm3(vec2 p) {
  float a = 0.5, s = 0.0;
  for (int i = 0; i < 3; i++) { s += a * vnoise(p); p = p * 2.03 + vec2(17.1, 9.2); a *= 0.5; }
  return s;
}
// cheap cellular "soap foam" pattern: 0 at cell centres -> 1 at borders
float cells(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float md = 8.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = vec2(hash12(i + g), hash12(i + g + 19.7));
    vec2 r = g + o - f;
    md = min(md, dot(r, r));
  }
  return sqrt(md);
}
vec3 iridescent(float t) {
  return 0.5 + 0.5 * cos(6.28318 * (t + vec3(0.0, 0.33, 0.67)));
}
`;

/**
 * Rainbow water palette (sRGB hex → linear THREE.Color, ready for uniforms).
 * Base hues are scaled below the NeutralToneMapping knee (~0.76 linear) so the renderer does not
 * desaturate them toward pastel; only highlights/sparkles/foam exceed 1.0 (and feed bloom).
 */
const knee = (hex: string, k = 0.74) => new THREE.Color(hex).multiplyScalar(k);
export const PALETTE = {
  cyanDeep: knee('#0080e8', 0.72),
  cyan: knee('#08c0ff'),
  cyanBright: knee('#56f0ff', 0.8),
  pink: knee('#ff149f'),
  pinkLight: knee('#ff4cc0', 0.78),
  magenta: new THREE.Color('#e01ea0'),
  foam: new THREE.Color('#ffffff'),
  foamLav: new THREE.Color('#efe2ff'),
  haze: new THREE.Color('#ffd6f4'),
};

/** fog-aware uniforms merged into every water ShaderMaterial */
export function withFog<T extends Record<string, THREE.IUniform>>(u: T): T & typeof THREE.UniformsLib.fog {
  return THREE.UniformsUtils.merge([THREE.UniformsLib.fog, u]) as T & typeof THREE.UniformsLib.fog;
}

/** standard tail: tonemapping + colour space + fog (call with gl_FragColor already set) */
export const FRAG_TAIL = /* glsl */ `
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
`;
