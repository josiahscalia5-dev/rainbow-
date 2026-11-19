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
 * Fragment-only helpers (use screen-space derivatives, so never include in a vertex shader).
 *  - bumpNormal: Mikkelsen-style "bump mapping without tangents" from a scalar height field
 *  - starGlint:  4-point star glint anchored to a world-space cell grid but sized in PIXELS, so the
 *                cross stays star-shaped under grazing foreshortening (refs 05–07 white glints)
 */
export const FRAG_FX_GLSL = /* glsl */ `
vec3 bumpNormal(vec3 pos, vec3 n, float h) {
  vec3 dpx = dFdx(pos);
  vec3 dpy = dFdy(pos);
  float dhx = dFdx(h);
  float dhy = dFdy(h);
  vec3 r1 = cross(dpy, n);
  vec3 r2 = cross(n, dpx);
  float det = dot(dpx, r1);
  vec3 grad = sign(det) * (dhx * r1 + dhy * r2);
  return normalize(abs(det) * n - grad);
}
// g: cell coordinates (world-anchored); density: probability a cell holds a star; L: arm length px;
// stretch: horizontal (g.x) arm length relative to the vertical one (ref 05 glints are wide flares)
float starGlint(vec2 g, float density, float L, float stretch, float time) {
  vec2 gi = floor(g);
  float hs = hash12(gi + 7.31);
  if (hs < 1.0 - density) return 0.0;
  vec2 cpp = max(fwidth(g), vec2(1e-4));           // cells per pixel
  vec2 c = vec2(hash12(gi + 3.1), hash12(gi + 5.7)) * 0.5 + 0.25;
  vec2 px = (fract(g) - c) / cpp;                   // offset in pixels
  vec2 lim = 0.24 / cpp;                            // never cross the cell border
  float l = L * (0.55 + 0.9 * fract(hs * 37.0));
  float ax = exp(-abs(px.y) * 0.75) * max(0.0, 1.0 - abs(px.x) / min(l * stretch, lim.x));
  float ay = exp(-abs(px.x) * 0.8) * max(0.0, 1.0 - abs(px.y) / min(l, lim.y));
  float core = exp(-dot(px, px) * 0.05) * 1.6;
  float tw = 0.55 + 0.45 * pow(0.5 + 0.5 * sin(time * 5.0 + hs * 60.0), 2.0);
  return ((ax * ax + ay * ay) * 1.6 + core) * tw;
}
// 4-point flare on a FLOW-aligned cell grid g = (across-flow, along-flow) cell coordinates (world-anchored,
// advected). The pixel offset from the star centre is solved through the screen Jacobian of g, and the
// long arm is laid along the SCREEN direction of +g.y (the current), so the flares streak with the flow
// on every bend (ref 05 mid-field) instead of collapsing into horizontal dashes under grazing
// foreshortening. horiz 0..1 turns the long arm toward screen-horizontal (ref 05 near-field flares lie
// across the flow). Arms taper to zero before the cell border (no clipped arms). Derivatives are taken
// before any early-out (Android-safe).
float flowGlint(vec2 g, float density, float L, float stretch, float horiz, float time) {
  vec2 gx = dFdx(g);
  vec2 gy = dFdy(g);
  vec2 gi = floor(g);
  float hs = hash12(gi + 7.31);
  float det = gx.x * gy.y - gy.x * gx.y;
  if (hs < 1.0 - density || abs(det) < 1e-12) return 0.0;
  vec2 dg = fract(g) - (vec2(hash12(gi + 3.1), hash12(gi + 5.7)) * 0.2 + 0.4);
  vec2 p = vec2(gy.y * dg.x - gy.x * dg.y, gx.x * dg.y - gx.y * dg.x) / det;   // pixels
  vec2 f = vec2(-gy.x, gx.x);                    // screen direction of +g.y (unnormalised, sign-free)
  f *= sign(f.x + 1e-6) / max(length(f), 1e-9);
  vec2 a = normalize(mix(f, vec2(1.0, 0.0), horiz) + vec2(1e-5, 0.0));
  vec2 b = vec2(-a.y, a.x);
  float pa = dot(p, a), pb = dot(p, b);
  vec2 ca = a.x * gx + a.y * gy, cb = b.x * gx + b.y * gy;   // cell units per pixel along a / b
  float la = 0.38 / max(max(abs(ca.x), abs(ca.y)), 1e-6);
  float lb = 0.38 / max(max(abs(cb.x), abs(cb.y)), 1e-6);
  float l = L * (0.55 + 0.9 * fract(hs * 37.0));
  float tA = max(0.0, 1.0 - abs(pa) / min(l * stretch, la));
  float armA = exp(-abs(pb) * 0.85) * tA;
  float armB = exp(-abs(pa) * 0.85) * max(0.0, 1.0 - abs(pb) / min(l, lb));
  // (wave 7) small hot core (≈2 px): the old wide soft core (exp(-r²·0.06)) read as round snow dots
  float core = exp(-dot(p, p) * 0.22) * 1.4;
  // (wave 8) soft glow lying along the long arm (≈5 px wide, tapering): ref 05 flares are thick glowing
  // streaks, the bare 1-px arms read as thin wire crosses (the game's bloom is weak)
  float glowA = exp(-abs(pb) * 0.2) * tA * tA * 0.3;
  float tw = 0.55 + 0.45 * pow(0.5 + 0.5 * sin(time * 5.0 + hs * 60.0), 2.0);
  return ((armA * armA + armB * armB) * 1.6 + core + glowA) * tw;
}
// Lens-shaped glossy flare (ref 05 near field): a bright streak lying along SCREEN-horizontal, thick in
// the middle and tapering to points (half thickness T·(1 − x²)), slightly arched, with a soft glow.
// g = world-anchored, advected cell grid; Lpx / Tpx = half length / half thickness in pixels (clamped so
// the lens never crosses its cell border). Returns ≈1 on the white core, a fraction in the glow.
// Derivatives are taken before the early-out (Android-safe).
float lensFlare(vec2 g, float density, float Lpx, float Tpx, float time) {
  vec2 gx = dFdx(g);
  vec2 gy = dFdy(g);
  vec2 gi = floor(g);
  float hs = hash12(gi + 4.17);
  float det = gx.x * gy.y - gy.x * gx.y;
  if (hs < 1.0 - density || abs(det) < 1e-12) return 0.0;
  vec2 dg = fract(g) - (vec2(hash12(gi + 2.3), hash12(gi + 6.9)) * 0.3 + 0.35);
  vec2 p = vec2(gy.y * dg.x - gy.x * dg.y, gx.x * dg.y - gx.y * dg.x) / det;   // pixels
  float limx = 0.3 / max(abs(gx.x) + abs(gx.y), 1e-6);
  float limy = 0.3 / max(abs(gy.x) + abs(gy.y), 1e-6);
  float L = min(Lpx * (0.55 + 0.9 * fract(hs * 37.0)), limx);
  float T = min(Tpx * (0.7 + 0.6 * fract(hs * 53.0)), limy * 0.5);
  float x = p.x / L;
  if (abs(x) > 1.0) return 0.0;
  float y = p.y - 0.35 * T * (1.0 - x * x);       // slight arch
  float th = T * (1.0 - x * x);
  float lens = 1.0 - smoothstep(th * 0.6, th + 1.0, abs(y));
  float glow = exp(-abs(y) / (T * 2.2 + 1.0)) * (1.0 - abs(x));
  float tw = 0.75 + 0.25 * sin(time * 3.0 + hs * 40.0);
  return (lens + 0.7 * glow) * tw;
}
// (wave 9, 05 near field) "Lightning" flare like ref 05's near-water bolts: a jagged white streak lying across the
// flow (screen-horizontal ± ≈17° tilt), thick in the middle and tapering to points, with a Z-kink near both
// ends, a short thin cross arm and a wide soft halo. g = world-anchored, advected cell grid; Lpx / Tpx = half
// length / half core thickness in pixels (clamped so the bolt never crosses its cell border).
// Returns x = core (≈1 on the white core), y = halo (0..1). Derivatives before the early-out (Android-safe).
vec2 boltFlare(vec2 g, float density, float Lpx, float Tpx, float time) {
  vec2 gx = dFdx(g);
  vec2 gy = dFdy(g);
  vec2 gi = floor(g);
  float hs = hash12(gi + 4.17);
  float det = gx.x * gy.y - gy.x * gx.y;
  if (hs < 1.0 - density || abs(det) < 1e-12) return vec2(0.0);
  vec2 dg = fract(g) - (vec2(hash12(gi + 2.3), hash12(gi + 6.9)) * 0.3 + 0.35);
  vec2 p = vec2(gy.y * dg.x - gy.x * dg.y, gx.x * dg.y - gx.y * dg.x) / det;   // pixels
  float limx = 0.3 / max(abs(gx.x) + abs(gx.y), 1e-6);
  float limy = 0.3 / max(abs(gy.x) + abs(gy.y), 1e-6);
  float L = min(Lpx * (0.6 + 0.8 * fract(hs * 37.0)), limx);
  float T = min(Tpx * (0.7 + 0.6 * fract(hs * 53.0)), limy * 0.3);
  float ang = (fract(hs * 91.0) - 0.5) * 0.6;
  float ca = cos(ang), sa = sin(ang);
  p = vec2(ca * p.x + sa * p.y, -sa * p.x + ca * p.y);
  float x = p.x / L;
  float ax = abs(x);
  // Z-kink: the streak steps sideways by ≈1.4·T over a short run at |x| ≈ 0.3 (sharp lightning steps), plus a
  // slight arch (it02: it01's soft 0.9·T kink read as a flat white "bat")
  float kz = (fract(hs * 13.0) > 0.5 ? 1.4 : -1.4) * T;
  float y = p.y - kz * (smoothstep(-0.36, -0.27, x) - smoothstep(0.27, 0.36, x)) - 0.25 * T * (1.0 - x * x);
  float th = T * max(1.0 - x * x, 0.0);
  float core = (1.0 - smoothstep(th * 0.4, th + 0.8, abs(y))) * step(ax, 1.0);
  float arm = exp(-abs(p.x) * 0.9) * max(0.0, 1.0 - abs(p.y) / (0.3 * L));
  core = max(core, arm * arm * 1.2);
  // wide electric halo (ref: the bolts sit in a 15–25 px cyan glow)
  float halo = exp(-abs(y) / (T * 3.0 + 5.0)) * max(0.0, 1.0 - ax * ax) + 0.6 * exp(-length(p) / (T * 4.0 + 6.0));
  // (it03) the halo fades out inside its own cell (it02's halo was cut at the cell border: boxy light patches)
  halo *= (1.0 - smoothstep(0.2, 0.34, abs(dg.x))) * (1.0 - smoothstep(0.2, 0.34, abs(dg.y)));
  float tw = 0.8 + 0.2 * sin(time * 3.0 + hs * 40.0);
  return vec2(core, min(halo, 1.0)) * tw;
}
`;

/**
 * Rainbow water palette (sRGB hex → linear THREE.Color, ready for uniforms).
 * Base hues are scaled below the NeutralToneMapping knee (~0.76 linear) so the renderer does not
 * desaturate them toward pastel; only highlights/sparkles/foam exceed 1.0 (and feed bloom).
 */
const knee = (hex: string, k = 0.74) => new THREE.Color(hex).multiplyScalar(k);
export const PALETTE = {
  cyanDeep: knee('#0a62f0', 0.72),
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
