/**
 * Spline water ribbon — the traversable stream Benny rides from the Drum A drain to the towel.
 *
 * Geometry: rows every `ds` along the master course, columns across `widthAt(s)`; a slightly
 * concave trough with raised frothy edges plus a short skirt under each edge (thickness).
 * Shader: electric-cyan core with meandering hot-pink flow bands, advected white streaks and
 * sparkles (two-phase flow-map advection so per-stage speeds never shear), Fresnel/haze
 * reflection, specular glints, cellular soap-foam fringe, Benny ripple rings + V-wake, the five
 * glowing chevrons on the 04 slide, a dithered hand-over to the whirlpool surface in 03 and a
 * drain-away for the 11 outro.
 */
import * as THREE from 'three';
import type { Course, StageId } from '../world/course';
import { FRAG_FX_GLSL, FRAG_TAIL, NOISE_GLSL, PALETTE, withFog } from './glsl';

/** wave amplitude per stage (units); blended across boundaries */
const AMP: Partial<Record<StageId, number>> = {
  '02': 0.06, '03': 0.08, '04': 0.03, '05': 0.1, '06': 0.12, '07': 0.1, '08': 0.1, '09': 0.16, '10': 0.08, '11': 0.05,
};
export const EDGE_LIFT = 0.28;

/**
 * Per-stage colour-band layout (blended across stage boundaries, baked into `aStyle`):
 *  x gate: 1 = pink bands taper off and part around Benny so the water at and behind him is pure
 *          cyan (ref 05: rows y=1200/1400 are 0% pink); 0 = bands run right past him (refs 04/06/07
 *          keep pink at the sides near the camera)
 *  y off:  band-centre offset from the meandering core centre, fraction of the half width
 *  z wid:  band half width, fraction of the half width
 * Between the two bands is the electric-cyan core; outside them more cyan, then the foam lace.
 */
type Style = [number, number, number, number];
/*  w free: weight of the shader's own drifting channel meander (meander() in FRAG). 0 in 05, where the
 *          course itself winds (S05/meander05 in course.ts) and the core is pinned to the route (see
 *          coreLateral) so the coins on the route stay on the cyan core. 1 elsewhere (04/06/07 unchanged).
 * 05 layout from ref 05 at the live 05 camera (y=600 ≈ 36 px/u, y=700 ≈ 63, y=800 ≈ 93): in the mid/far
 * field each pink band is ≈20 % of the water width, the cyan core ≈45 %, a thin outer cyan strip ≈7 %
 * → band centre 0.62 hw, half width 0.19 hw. Toward Benny the bands taper to half width (gate, FRAG),
 * which gives the ref's ≈100–130 px bands at y=800 and a pure-cyan near field. */
const BAND_STYLE: Partial<Record<StageId, Style>> = {
  '04': [0, 0.6, 0.19, 1],
  '05': [1, 0.62, 0.19, 0],
  '06': [0.4, 0.48, 0.1, 1],
  '07': [0, 0.52, 0.13, 1],
};
const BAND_DEFAULT: Style = [0, 0.5, 0.12, 1];

function bandStyleAt(course: Course, s: number): Style {
  const o: Style = [0, 0, 0, 0];
  let w = 0;
  for (const st of course.stages) {
    const a = smooth(st.s0 - 5, st.s0 + 5, s) * (1 - smooth(st.s1 - 5, st.s1 + 5, s));
    if (a <= 0) continue;
    const v = BAND_STYLE[st.id] ?? BAND_DEFAULT;
    for (let i = 0; i < 4; i++) o[i] += v[i] * a;
    w += a;
  }
  if (w <= 0) return [...(BAND_STYLE[course.stageAtS(s).id] ?? BAND_DEFAULT)];
  return [o[0] / w, o[1] / w, o[2] / w, o[3] / w];
}

/**
 * 05 current: lateral position (units, ribbon `right` axis, + = right) of the centre of the
 * electric-cyan core relative to the route centreline. The core swings WITH the course meander,
 * amplified by CORE_SWING, so the two pink bands trace S-bends ≈(1 + CORE_SWING)× as strong as the
 * route's own (ref 05: ±60–120 px). Bounded by CORE_SWING · max|offset05| (≈0.9 · 1.85 = 1.7 u at the
 * far crest; ≤1.25 u within 35 u of the 05 checkpoint), inside the ≥2 u core half width, so a coin on
 * the route centre (lat 0) still sits on cyan. 0 outside 05.
 * gameplay/coins.ts may place the 05 coins at this lateral to put them exactly on the core centre.
 */
export const CORE_SWING = 0.9;
export function coreLateral(course: Course, s: number): number {
  const st = course.stage('05');
  if (s <= st.s0 || s >= st.s1) return 0;
  return CORE_SWING * course.offset05(s) * course.sample(s).right.x;
}

/**
 * Ribbon colours in shader (pre-tonemap, linear) space. NeutralToneMapping desaturates anything
 * whose peak channel passes ≈0.76·exposure, so these were solved by inverting Neutral at the game's
 * exposure 0.86 (src/render/env.ts). Flat values after tone mapping: cyanDeep #0065D6, cyan #1D89F0,
 * cyanBright #42C8F7, pinkDeep #E206BE, pink #F741DD (H 308°, not violet), pinkLight #FA93E7. The
 * streaks/crests/glints added on top lift the rendered cyan median to ≈#06A7FF (ref 05 #039FF6).
 * Crests/highlights are allowed to desaturate toward white (that is how the ref highlights look).
 * The shared PALETTE in glsl.ts is untouched (whirlpool, drum and final wave use it).
 */
const lin = (r: number, g: number, b: number) => new THREE.Color().setRGB(r, g, b, THREE.LinearSRGBColorSpace);
const RIBBON_PAL = {
  cyanDeep: lin(0.0, 0.15, 0.78),
  cyan: lin(0.0, 0.31, 1.12),
  cyanBright: lin(0.04, 0.95, 1.55),
  pinkDeep: lin(0.9, 0.02, 0.62),
  pink: lin(1.55, 0.03, 1.2),
  pinkLight: lin(2.2, 0.5, 1.8),
};
/**
 * 05 river palette (wave 4), shader-space linear values solved through the full post chain
 * (exposure 0.86 → Neutral → sRGB → grade.ts saturation 1.36 / contrast 1.15; bloom ignored) so the
 * flat colours land on the ref 05 samples instead of clipping: cyan deep ≈#0466CF (troughs),
 * cyan ≈#029AF3 (ref core), bright ≈#33C0FF, streak ≈#8FE6FF; pink deep ≈#BC16A8, pink ≈#F73DEA
 * (ref #F739E5 / band medians #F749F1), light ≈#FA9EF2, streak ≈#FEC0F6. The old RIBBON_PAL pink
 * (1.55, 0.03, 1.2) clips to #FF23FF in that chain and the lighting lifted it to lavender #FF6CFF.
 */
const RIVER05_PAL = {
  cyanDeep: lin(0.04, 0.16, 0.46),
  cyan: lin(0.06, 0.37, 0.74),
  cyanBright: lin(0.1, 0.8, 1.8),
  cyanStreak: lin(0.36, 1.25, 2.1),
  pinkDeep: lin(0.36, 0.04, 0.3),
  pink: lin(0.7, 0.08, 0.64),
  pinkLight: lin(0.92, 0.3, 0.88),
  pinkStreak: lin(1.1, 0.58, 1.04),
};
/** 05 texture advection relative to the stage speed (>1: the current visibly overtakes Benny) */
const FLOW05 = 1.3;

export function ampAt(course: Course, s: number): number {
  let v = 0, w = 0;
  for (const st of course.stages) {
    const a = smooth(st.s0 - 5, st.s0 + 5, s) * (1 - smooth(st.s1 - 5, st.s1 + 5, s));
    if (a > 0) { v += (AMP[st.id] ?? 0.08) * a; w += a; }
  }
  let amp = w > 0 ? v / w : 0.08;
  // calm the long straight of the deep plunge (fast sheet flow)
  const pt = course.marks['07_plunge_top'], pb = course.marks['07_plunge_bottom'];
  if (pt !== undefined) amp *= 1 - 0.6 * smooth(pt, pt + 8, s) * (1 - smooth(pb - 8, pb, s));
  return amp;
}

function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/** CPU mirror of the vertex displacement (keep in sync with VERT). */
export function ribbonWave(u: number, s: number, t: number, amp: number): number {
  const au = Math.min(1, Math.abs(u));
  const trough = EDGE_LIFT * au * au * au;
  return trough + amp * (0.6 * Math.sin(s * 0.9 - t * 2.4 + u * 1.7) + 0.4 * Math.sin(s * 0.41 + t * 1.5 - u * 2.3));
}

const VERT = /* glsl */ `
attribute vec2 aUV;      // x = u (-1..1 across), y = s (arc length)
attribute float aHalfW;
attribute float aSpeed;
attribute float aAmp;
attribute float aSkirt;  // 0 surface, 1 skirt bottom
attribute vec4 aStyle;   // band layout: gate, offset, half width, free-meander weight (see BAND_STYLE)
attribute float aCore;   // 05: core-centre lateral swing (units, see coreLateral)
attribute vec3 aTan;     // course tangent (downstream)
uniform float uTime;
uniform vec4 uHide;      // s03Start, s04Start, chuteMark, unused
varying vec2 vUV;
varying float vHalfW;
varying float vSpeed;
varying float vSkirt;
varying float vHide;
varying vec4 vStyle;
varying float vCore;
varying vec3 vTanW;
varying vec3 vPosW;
varying vec3 vNormalW;
#include <fog_pars_vertex>
void main() {
  vStyle = aStyle;
  vCore = aCore;
  vTanW = normalize(mat3(modelMatrix) * aTan);
  float u = aUV.x;
  float s = aUV.y;
  float h = aAmp * (0.6 * sin(s * 0.9 - uTime * 2.4 + u * 1.7) + 0.4 * sin(s * 0.41 + uTime * 1.5 - u * 2.3));
  vec3 p = position + normal * h * (1.0 - aSkirt);
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vUV = aUV;
  vHalfW = aHalfW;
  vSpeed = aSpeed;
  vSkirt = aSkirt;
  // hand the stream over to the whirlpool surface during 03 (dithered fade both ways)
  float inside03 = smoothstep(uHide.x + 0.5, uHide.x + 3.5, s) * (1.0 - smoothstep(uHide.y - 9.0, uHide.y - 1.5, s));
  vHide = 1.0 - inside03;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const FRAG = /* glsl */ `
uniform float uTime;
uniform vec3 uCyanDeep;
uniform vec3 uCyan;
uniform vec3 uCyanBright;
uniform vec3 uPinkDeep;
uniform vec3 uPink;
uniform vec3 uPinkLight;
uniform vec3 uFoam;
uniform vec3 uFoamLav;
uniform vec3 uHaze;
uniform vec3 uLightDir;
uniform vec3 uBenny;      // s, lateral (units), strength
uniform float uBennyR;    // Benny's waterline radius (units)
uniform vec3 uChevron;    // start s, spacing, enabled
uniform vec2 uOutro;      // amount, chamber start s
// 05 river palette (see RIVER05_PAL) + its one constant advection speed (no stage-speed shear)
uniform vec3 uC5Deep;
uniform vec3 uC5;
uniform vec3 uC5Bright;
uniform vec3 uC5Streak;
uniform vec3 uP5Deep;
uniform vec3 uP5;
uniform vec3 uP5Light;
uniform vec3 uP5Streak;
uniform float uFlow05;
varying vec2 vUV;
varying float vHalfW;
varying float vSpeed;
varying float vSkirt;
varying float vHide;
varying vec4 vStyle;
varying float vCore;
varying vec3 vTanW;
varying vec3 vPosW;
varying vec3 vNormalW;
#include <fog_pars_fragment>
${NOISE_GLSL}
${FRAG_FX_GLSL}

// Stationary channel shape (refs 05–07): lateral offset (units) of the electric-cyan core centre
// relative to the course centreline. Two incommensurate sines + slow noise so the S-curves do not
// visibly repeat; λ≈26 u differs from the course's own 05 geometry meander (λ≈36 u), so the two beat
// rather than cancel. It only drifts slowly downstream (+s) at a constant rate (no shear between
// stage speeds); the strand texture below is what is advected at the local stage speed.
float meander(float s, float hw) {
  float a = s - uTime * 0.7;
  float m = 0.2 * sin(a * 0.24) + 0.08 * sin(a * 0.53 + 1.3) + 0.12 * (vnoise(vec2(a * 0.05, 4.7)) - 0.5);
  return m * min(hw, 4.5);
}

// polynomial smooth minimum (k = blend width, units)
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

// Combed flow lines (ref 05: thin bright streaks along the flow, 2–4 px apart in the mid-ground).
// Anti-aliased lines across the flow (K slots per unit), each broken into tapered streak segments of
// varying length/brightness. Line width is in PIXELS (≈1.2 px core + ≈2.5 px glow), so near the camera
// the slots spread apart into sparse crisp glints instead of wide parallel light stripes (the
// "flattened stripes" the user rejected); the lines fade once they get closer than ≈3 px.
float combed(float x, float v, float K, float seed) {
  float p = x * K;
  float id = floor(p);
  float fw = max(fwidth(p), 1e-4);            // slots per pixel
  float hs = hash12(vec2(id, seed));
  float dpx = abs(fract(p) - 0.5 - (hs - 0.5) * 0.5) / fw;   // pixels from the line centre
  float line = (1.0 - smoothstep(0.4, 1.3, dpx)) * 0.8 + exp(-dpx * 0.45) * 0.3;
  // each line breaks into tapered streak segments; sparser when the slots are far apart on screen
  float sparse = smoothstep(0.03, 0.006, fw);
  float seg = smoothstep(0.5 + 0.15 * sparse, 0.9, vnoise(vec2(id * 3.7 + seed, v * 0.2 + hs * 9.0)));
  return line * seg * (0.45 + 0.55 * hs) * (1.0 - smoothstep(0.22, 0.4, fw));
}

// advected strand texture ("combed" glossy water lines parallel to the flow)
// x = lateral units relative to the meander centre, v = advected arc length, aa = 0..1 detail fade
// returns: x = height 0..1 (shading + bump), y = white glint lines, z = mid strands, w = fine strands
// sw = swirl (05): the strands wander laterally and are less stretched, so the water reads as
// curling glossy flow instead of uniform straight parallel stripes (the user's rejected look)
vec4 strands(float x, float v, vec2 aa, float sw) {
  x += sw * 0.9 * (vnoise(vec2(x * 0.45, v * 0.2 + 7.0)) - 0.5);
  float a = vnoise(vec2(x * 2.4, v * (0.08 + 0.1 * sw)));
  float b = vnoise(vec2(x * 7.0 + a * 1.6, v * 0.19 + 5.0));
  #ifdef LOW_Q
  float c = b;
  #else
  float c = vnoise(vec2(x * 17.0 + b * 2.2, v * 0.42 + 3.0));
  #endif
  b = mix(0.5, b, aa.x);
  c = mix(0.5, c, aa.y);
  float h = a * 0.42 + b * 0.34 + c * 0.24;
  h = smoothstep(0.18, 0.82, h);              // more contrast: deep azure troughs, bright crests
  float line = smoothstep(0.72, 0.86, c) * aa.y + smoothstep(0.7, 0.86, b) * aa.x * 0.85;
  // the combed lines follow the large-scale strand warp so they bend with the flow
  float xw = x + (a - 0.5) * 0.5;
  line = max(line, combed(xw, v, 6.0, 0.0) * 0.85);
  #ifndef LOW_Q
  line = max(line, combed(xw + (b - 0.5) * 0.12, v * 1.3, 15.0, 11.0) * 0.55);
  #endif
  return vec4(h, line, b, c);
}

// 05 silk streaks: anti-aliased light lines along the FLOW coordinate q (band-relative, so they bend
// with the pink S-bands instead of running as straight parallel road stripes). Each line wanders
// slowly (wig, slot fraction) so neighbours braid, and breaks into advected tapered segments of
// varying brightness. Width in pixels; the lines fade once they crowd closer than ≈3 px.
float silk(float q, float v, float K, float seed, float wig) {
  float p = q * K;
  float fw = max(fwidth(p), 1e-4);
  float id = floor(p);
  float hs = hash12(vec2(id, seed));
  float c = 0.5 + (hs - 0.5) * 0.34 + wig * sin(v * (0.28 + 0.3 * hs) + hs * 6.283);
  float dpx = abs(fract(p) - c) / fw;
  float line = (1.0 - smoothstep(0.3, 1.2, dpx)) * 0.7 + exp(-dpx * 0.55) * 0.4;
  // short tapered brush dashes (≈1–2 u: ref 05 speed streaks are 30–80 px in the mid field)
  float n = vnoise(vec2(id * 3.1 + seed, v * 0.42 + hs * 17.0));
  float seg = smoothstep(0.5, 0.86, n);
  return line * seg * (0.5 + 0.7 * hs) * (1.0 - smoothstep(0.22, 0.42, fw));
}

void main() {
  float u = vUV.x;
  float s = vUV.y;
  // dithered hide (03 hand-over)
  if (vHide < 0.5) discard;
  float cutFoam = 1.0 - smoothstep(0.5, 0.85, vHide);
  // 11 outro: the stream drains away in the chamber, leaving puddles
  if (uOutro.x > 0.0 && s > uOutro.y - 2.0) {
    float n = vnoise(vec2(u * 3.0, s * 0.35)) * 0.7 + 0.3;
    if (n < uOutro.x * 1.15) discard;
  }

  // ---- channel layout: winding cyan core between two hot-pink S-bands, cyan again outside ----
  float hw = vHalfW;
  float lat = u * hw;                         // lateral units in the ribbon frame
  // core centre: free drifting meander on 04/06/07 (freeK = 1); on 05 (freeK = 0) pinned to the
  // course's own S-meander, amplified (vCore = CORE_SWING · offset05), so the coins stay on cyan
  float freeK = vStyle.w;
  float sw = 1.0 - freeK;                     // weight of the 05 river look (1 on 05 only)
  float M = meander(s, hw) * freeK + vCore;
  float x = lat - M;                          // lateral units in the core's frame
  // 05: the pink bands swing a further ±1.05 u about the core (a stationary λ≈20 u S on top of the
  // course meander, in phase with it: left at s≈139.5 / y≈800, right at s≈149.7 / y≈680 on the locked
  // view), so they read as ≈2 clear S-bends to the VP (ref 05: ±100 px). A small 2nd harmonic skews
  // each bend so the S is not a plain sine. The coins (at coreLateral = M) stay ≥0.3 u inside the cyan.
  float sbend = sw * (1.05 * sin(s * 0.31 - 0.834) + 0.18 * sin(s * 0.62 + 0.6));
  float xb = x - sbend;                       // band frame (== x on 04/06/07)

  // detail fade with distance (cells per pixel), keeps far water from shimmering
  float fwx = fwidth(x);
  float fws = fwidth(s);
  // (a noise cell must stay ≳6–8 px wide; the combed lines of ref 05 are 2–4 px apart in the
  // mid-ground, so fading earlier than this flattens the water into a plain fill)
  vec2 aa = vec2(1.0 - smoothstep(0.12, 0.26, max(fwx * 7.0, fws * 0.19)),
                 1.0 - smoothstep(0.09, 0.2, max(fwx * 17.0, fws * 0.42)));
  // hair-fine combed strands for close-up water (refs: dense parallel flow lines)
  float aaH = 1.0 - smoothstep(0.14, 0.3, fwx * 46.0);
  #ifdef LOW_Q
  aa.y = 0.0;
  aaH = 0.0;
  #endif

  // two-phase flow-map advection of the strands (period 4 s; offset scales with stage speed)
  float ph0 = fract(uTime * 0.25);
  float ph1 = fract(uTime * 0.25 + 0.5);
  float w0 = 1.0 - abs(1.0 - 2.0 * ph0);
  // (04/06/07 strand texture; 05 has its own silk/swell field below)
  vec4 F = vec4(0.5, 0.0, 0.5, 0.5);
  if (freeK > 0.001) F = mix(strands(x, s - vSpeed * ph1 * 4.0 + 23.0, aa, sw), strands(x, s - vSpeed * ph0 * 4.0, aa, sw), w0);
  float v5 = s - uTime * uFlow05;             // 05 advected arc length (one constant speed: no shear)

  // Benny parts the bands like a bow wave (vStyle.x, ref 05): just ahead of him they narrow and
  // swing outward, so the water at and behind him (the near field) is pure cyan; behind him they
  // continue only as thin streaks pushed out toward the foam banks
  // (05: the near rows only show lat ±2.3 behind Benny, so a light parting is enough there)
  float gate = 1.0, part = 0.0, near05 = 1.0;
  float db = s - uBenny.x;
  if (vStyle.x > 0.0) {
    // 05 (wave 4): the bands stay wide (≥75 %) and run in CLOSER (0.8× offset) beside Benny, so they
    // sweep past both his sides like ref 05 (pink beside the hat/body at y≈800–1000) instead of
    // parting out under the foam banks; full width/offset ≈14–20 u ahead
    float g05 = 0.75 + 0.25 * smoothstep(1.0, 20.0, db);
    float gOld = 0.4 + 0.6 * smoothstep(0.0, 4.5, db);
    gate = mix(1.0, mix(g05, gOld, freeK), vStyle.x);
    part = vStyle.x * hw * 0.3 * freeK * (1.0 - smoothstep(-1.0, 9.0, db));
    near05 = mix(1.0, 0.8 + 0.2 * smoothstep(2.0, 14.0, db), sw * vStyle.x);
  }
  float hwc = min(hw, 4.5);
  float aaw = fwidth(lat) * 0.85 + 0.01;      // ≈1 px edges: no lavender cyan/pink blend zone
  // flowing band edges (the advected strand texture). 05: only a soft travelling ripple, so the band
  // edges are clean S-curves instead of the torn/jagged combed edges of the old slab
  float pert = mix((vnoise(vec2(x * 0.9, v5 * 0.12 + 3.0)) - 0.5) * 0.3,
                   (F.z - 0.5) * 0.5 + (F.w - 0.5) * 0.22, freeK) * hwc * 0.22;
  // 05: the band shapes are carried downstream (a slow travelling wobble), so the pink S-sections
  // visibly flow and swirl even though the channel itself is fixed to the course meander
  float tv = s - uTime * vSpeed * 0.3;
  float wob = sw * hwc;
  float offL = hw * (vStyle.y * near05 + mix(0.03, 0.07, freeK) * sin(s * 0.13 + 1.7)) + part + wob * 0.05 * sin(tv * 0.42 + 1.1);
  float offR = hw * (vStyle.y * near05 + mix(0.03, 0.07, freeK) * sin(s * 0.11 + 4.2)) + part + wob * 0.05 * sin(tv * 0.37 + 3.9);
  float modA = mix(0.15, 0.4, freeK);         // 05: even band width (the ±40 % swell drew the slab)
  float wL = hw * vStyle.z * (1.0 + modA * sin(s * 0.19 + 0.4) + 0.08 * wob * sin(tv * 0.6)) * gate;
  float wR = hw * vStyle.z * (1.0 + modA * sin(s * 0.17 + 2.9) + 0.08 * wob * sin(tv * 0.55 + 2.0)) * gate;
  float brush = 0.0;
  if (freeK < 0.5) {
    // keep both bands inside the water (the core swing pushes one toward the bank on each bend);
    // the band pressed against the bank thins a little instead of collapsing the cyan core
    // (smooth minimum: a hard min() put a visible corner in the band where the clamp starts)
    float Mb = M + sbend;
    float roomL = Mb + hw - 0.5 - offL, roomR = hw - 0.5 - Mb - offR;
    wL = smin(wL, max(roomL, 0.6 * wL), 0.5);
    wR = smin(wR, max(roomR, 0.6 * wR), 0.5);
    offL = smin(offL, Mb + hw - wL - 0.5, 1.2);
    offR = smin(offR, hw - wR - 0.5 - Mb, 1.2);
    // 05 (wave 5): behind Benny both S-bands run on as broad brushed sweeps at the image sides (ref 05
    // near rows: pink at x≈90–265 / 550–770, glossy cyan between and under him). From ≈3 u ahead of him
    // their centres glide to his track ±1.45 u and narrow to ±0.34 u, so each band stays ONE continuous
    // ribbon. (This replaces the separate wake "trail" sweep, which drew the two hard pink "fins".)
    if (vStyle.x > 0.0 && uBenny.z > 0.0) {
      float nb = sw * vStyle.x * (1.0 - smoothstep(-0.5, 3.0, db));
      float side = 1.42 + 0.02 * max(-db, 0.0);
      offL = mix(offL, Mb - (uBenny.y - side), nb);
      offR = mix(offR, (uBenny.y + side) - Mb, nb);
      wL = mix(wL, 0.34, nb);
      wR = mix(wR, 0.34, nb);
    }
    // brushed edges: each band edge is combed into pink / cyan strands along the flow (ref 05: the
    // ribbons fray into light streaks); crisp per-pixel strands, so no violet pink-over-cyan blend.
    // Faded out where a strand would be < ≈3 px wide (no shimmer in the far field)
    float bK = 11.0;
    brush = sw * (vnoise(vec2(xb * bK, v5 * 0.11 + 5.0)) - 0.5) * (1.0 - smoothstep(0.05, 0.12, fwx * bK));
  }
  float sdL = xb + offL + pert;
  float sdR = xb - offR + pert;
  float dL = abs(sdL);
  float dR = abs(sdR);
  float on = smoothstep(0.02, 0.2, gate);
  float pL = (1.0 - smoothstep(wL - aaw, wL + aaw, dL - brush * wL * 0.55)) * on;
  float pR = (1.0 - smoothstep(wR - aaw, wR + aaw, dR - brush * wR * 0.55)) * on;
  // a thin cyan thread splits a band into two streaks along some stretches (ref 05 mid-ground)
  float rimW = 0.05 * hwc + aaw;
  float thrW = 0.028 * hwc;
  float splitOn = smoothstep(0.55, 0.7, vnoise(vec2(s * 0.07, 13.0))) * mix(0.0, 1.0, freeK);
  float sL = (1.0 - smoothstep(thrW, thrW + aaw, abs(xb + offL + pert * 1.4 + 0.25 * wL * sin(s * 0.5)))) * splitOn;
  float sR = (1.0 - smoothstep(thrW, thrW + aaw, abs(xb - offR + pert * 1.4 - 0.25 * wR * sin(s * 0.45 + 1.0)))) * (1.0 - splitOn) * freeK;
  // only split bands that are wide enough (smooth ramp: a hard step cut the band across the flow)
  pL *= 1.0 - sL * smoothstep(rimW * 1.8, rimW * 2.8, wL);
  pR *= 1.0 - sR * smoothstep(rimW * 1.8, rimW * 2.8, wR);
  // hair-thin pink filaments drifting through the cyan core (mid/far field only)
  float fil = 0.0;
  #ifndef LOW_Q
  float fc = hw * 0.18 * sin(s * 0.21 + 0.8);
  fil = (1.0 - smoothstep(0.025 * hwc, 0.025 * hwc + aaw, abs(x - fc + pert * 0.7)))
      * smoothstep(0.62, 0.78, vnoise(vec2(s * 0.09, 21.0))) * gate * aa.x * freeK;   // 05 core: pure cyan
  #endif
  float pinkM = max(max(pL, pR), fil);
  // (wave 5: the separate 05 wake "trail" sweep is gone; the main bands themselves run on behind Benny)
  // glossy rims: light-pink just inside each band edge, bright cyan just outside it
  float rimIn = max(pL * smoothstep(wL - rimW, wL - aaw, dL), pR * smoothstep(wR - rimW, wR - aaw, dR));
  float rimOut = max((1.0 - pL) * (1.0 - smoothstep(wL + aaw, wL + rimW * 1.6, dL)),
                     (1.0 - pR) * (1.0 - smoothstep(wR + aaw, wR + rimW * 1.6, dR))) * on;
  float rel = pL >= pR ? sdL / max(wL, 1e-3) : -sdR / max(wR, 1e-3);   // -1 outer edge .. +1 core side
  vec3 N0 = normalize(vNormalW);
  if (!gl_FrontFacing) N0 = -N0;
  vec3 V = normalize(cameraPosition - vPosW);
  vec3 L = normalize(uLightDir);
  vec3 Hv = normalize(L + V);
  vec3 Lg = normalize(vTanW + N0 * 0.1);      // the bright tunnel end, far downstream

  vec3 col = vec3(0.0);
  // =============== 04 / 06 / 07 surface (freeK = 1; unchanged look) ===============
  if (freeK > 0.001) {
    float h = F.x;
    float hair = 0.5;
    if (aaH > 0.0) {
      float sv = s - vSpeed * fract(uTime * 0.5) * 2.0;
      float hA = vnoise(vec2(x * 46.0 + F.w * 3.0, sv * 0.9));
      float hB = vnoise(vec2(x * 46.0 + F.w * 3.0, (sv + vSpeed) * 0.9 + 17.0));
      hair = mix(0.5, mix(hB, hA, 1.0 - abs(1.0 - 2.0 * fract(uTime * 0.5))), aaH);
    }
    // deep azure troughs → electric cyan → light-cyan crests (crests stay a minority of the area)
    vec3 cyanCol = mix(uCyanDeep, uCyan, smoothstep(mix(0.3, 0.22, freeK), mix(0.72, 0.62, freeK), h));
    cyanCol = mix(cyanCol, uCyanBright, smoothstep(mix(0.7, 0.64, freeK), 0.95, h) * mix(0.55, 0.7, freeK) + rimOut * 0.45);
    // satin ribbon: a soft light streak runs along each band, off-centre toward the core
    float satin = exp(-pow((rel - 0.3) * 2.2, 2.0));
    vec3 pinkCol = mix(uPinkDeep, uPink, smoothstep(0.3, 0.72, h + satin * 0.2));
    pinkCol = mix(pinkCol, uPinkLight, clamp(smoothstep(0.6, 0.92, h) * 0.7 + satin * 0.35 + rimIn * 0.45, 0.0, 1.0));
    col = mix(cyanCol, pinkCol, pinkM);
    col *= 0.88 + 0.24 * hair;
    vec3 streakCol = mix(vec3(0.6, 1.25, 1.6), vec3(1.6, 0.8, 1.6), pinkM);
    col += streakCol * smoothstep(0.82, 0.94, hair) * 0.3 * aaH;

    // ---- glossy lighting ----
    #ifdef LOW_Q
    vec3 N = normalize(N0 + 0.25 * vec3(h - 0.5, 0.0, F.z - 0.5));
    #else
    float bumpAmt = 0.07 * (1.0 - smoothstep(0.1, 0.5, fws));
    vec3 N = bumpNormal(vPosW, N0, h * bumpAmt);
    #endif
    float nv = clamp(dot(N, V), 0.0, 1.0);
    float fres = pow(1.0 - nv, 4.0);
    vec3 R = reflect(-V, N);
    // tinted (not white) reflection so the glossy far water stays saturated, not pastel
    vec3 reflTint = mix(uCyanBright, uPinkLight, pinkM);
    vec3 refl = mix(reflTint, vec3(1.5), smoothstep(0.6, 1.0, R.y) * 0.5);
    col = mix(col, refl, fres * 0.22);
    float spec = pow(clamp(dot(N, Hv), 0.0, 1.0), 120.0);
    float sheen = pow(clamp(dot(R, L), 0.0, 1.0), 10.0);
    col += vec3(1.0) * spec * 1.2 + reflTint * sheen * 0.12;
    // glossy white-blue reflection of the bright tunnel end (refs 05–07): the light sits far
    // downstream, so its mirror image is a glitter path along the river toward the VP, broken into
    // streaks by the bump normals and the strand crests (never a flat milky sheet)
    float glit = pow(clamp(dot(R, Lg), 0.0, 1.0), 160.0);
    float glitMask = smoothstep(0.5, 0.88, h) * 0.75 + F.y * 0.6;
    col += mix(vec3(0.7, 1.1, 1.45), vec3(1.5, 0.85, 1.4), pinkM) * glit * glitMask * mix(0.9, 0.45, freeK);
    // advected glossy streak lines along the flow
    col += streakCol * F.y * 0.8;

    // ---- foreground ripple crests: pixel-thin lines bowed upstream around the core, in short
    // segments, so the near water reads as moving glossy ripples, not soft horizontal bars
    float nearK = 1.0 - smoothstep(0.02, 0.05, fws);
    if (nearK > 0.0) {
      float ph = s * 4.2 - uTime * 6.0 + 0.2 * x * x + 1.6 * vnoise(vec2(lat * 0.7, s * 0.45));
      float q = fract(ph * 0.159155 - 0.25) - 0.5;              // 0 on a crest (sin = 1)
      float dpx = abs(q) / max(fwidth(ph * 0.159155), 1e-4);
      float crest = (1.0 - smoothstep(0.5, 1.8, dpx)) * smoothstep(0.52, 0.8, vnoise(vec2(lat * 2.6, s * 1.1 + 3.0)));
      col *= 1.0 - 0.14 * nearK * (0.5 - 0.5 * sin(ph));
      col += mix(vec3(0.9, 1.4, 1.7), vec3(1.7, 1.1, 1.7), pinkM) * crest * nearK * mix(0.9, 0.6, freeK);
    }

    // ---- white star glints (4-point, twinkling, carried by the flow) ----
    #ifdef LOW_Q
    vec2 g = vec2(lat * 1.2, (s - vSpeed * uTime * 0.6) * 0.8);
    float hs = hash12(floor(g));
    float sparkle = step(0.9, hs) * smoothstep(0.22, 0.0, length(fract(g) - 0.5)) * (0.5 + 0.5 * sin(uTime * 7.0 + hs * 40.0));
    col += vec3(1.3) * sparkle;
    #else
    // wide cells so the long horizontal arms are not clipped at the cell border in the mid-ground
    float glint = starGlint(vec2(lat * 0.55, (s - vSpeed * uTime * 0.55) * 0.42), 0.42, 22.0, 2.4, uTime);
    col += vec3(2.0, 2.2, 2.3) * glint * (1.0 - smoothstep(0.3, 0.8, fws));
    #endif
  }

  // =============== 05: thick glossy river (sw = 1) ===============
  // The user rejected the 05 water as "a flat blue road with straight stripes". Here the surface is a
  // flow-aligned height field: every streak, ridge and flare is laid out in the flow coordinate q
  // (-1 on the left band's centre line, +1 on the right one), so they bend with the pink S-bands.
  // Depth comes from deep-azure troughs between bright crests, tubular pink ribbons (deep magenta
  // edges → hot pink → light satin crest), Fresnel sky tint, sun specular, the tunnel-end glitter
  // path and bump normals from the same height field; the near field (right behind Benny, where
  // 1 u ≈ 250 px) swaps the along-flow ridges for bowed cross-flow ripple crests and horizontal flares.
  if (sw > 0.001) {
    float cLc = -offL - pert, cRc = offR - pert;
    float hS = max(0.5 * (cRc - cLc), 0.6);
    float q = (xb - 0.5 * (cLc + cRc)) / hS;
    float near5 = 1.0 - smoothstep(0.0075, 0.014, fws);
    float wq = q + 0.05 * sin(v5 * 0.23 + q * 4.0);           // slow braid of the flow lines
    // height: braided swell ridges along the flow (mid/far), ripple cells (near), silk lines on top
    float rFar = vnoise(vec2(wq * 7.0, v5 * 0.2));
    // near field (wave 5): thick water heaving over Benny's track. Bowed cross-flow swells (crest lines
    // arch toward the VP, "∩" like ref 05's near arcs, λ ≈ 0.55 u ≈ 90–110 px), broken into short
    // glossy segments by noise and warped so they never read as contour rings; deep azure troughs
    // between them. Advected with the current (v5).
    float dlN = lat - uBenny.y;
    float phN = (v5 + 0.2 * dlN * dlN) * 11.4 + 2.4 * vnoise(vec2(lat * 0.9, v5 * 0.7 + 2.0));
    float cN = 0.5 + 0.5 * sin(phN);
    float segN = smoothstep(0.3, 0.66, vnoise(vec2(lat * 1.8 + 4.0, floor(phN * 0.159155 + 0.25) * 1.37)));
    float crestN = (pow(cN, 30.0) + 0.15 * pow(cN, 6.0)) * segN;
    float troughN = pow(1.0 - cN, 3.0) * (0.65 + 0.35 * vnoise(vec2(lat * 0.7, v5 * 0.9 + 6.0)));
    // short thin speed streaks along the current (≈80–100 px dashes, ≈85 px apart, wavy)
    float strN = silk(lat, v5 * 5.0 + 60.0, 2.6, 21.0, 0.3);
    float rNear = 0.42 + 0.42 * crestN - 0.3 * troughN;
    float swell = mix(rFar, rNear, near5);
    swell = mix(0.5, swell, 1.0 - smoothstep(0.3, 0.7, fwidth(wq * 7.0)) * (1.0 - near5));
    float silkA = silk(wq, v5, 15.0, 0.0, 0.16);
    float silkB = 0.0;
    #ifndef LOW_Q
    silkB = silk(wq, v5 * 1.35 + 40.0, 38.0, 7.0, 0.1);
    #endif
    // (near field: the silk lines stay on the pink sweeps only, as brushed satin; on cyan they read as road lines)
    float silkL = max(silkA, silkB * mix(0.45, 0.8, pinkM)) * (1.0 - near5 * (1.0 - pinkM));
    float H5 = clamp(swell * 0.8 + silkL * 0.35 + 0.18 * near5, 0.0, 1.0);

    // cyan: deep azure troughs -> electric cyan -> bright cyan crests; light seam beside each band
    vec3 cy = mix(uC5Deep, uC5, smoothstep(0.26, 0.74, H5));
    cy = mix(cy, uC5Bright, clamp(smoothstep(0.76, 0.98, H5) * 0.6 + rimOut * 0.55, 0.0, 1.0));
    // pink: tubular ribbons (deep magenta edges -> hot pink -> light satin crest off-centre)
    float relB = clamp(rel, -1.0, 1.0);
    float prof = 1.0 - relB * relB;
    float satin5 = exp(-pow((relB - 0.3) * 3.2, 2.0));
    vec3 pk = mix(uP5Deep, uP5, smoothstep(0.0, 0.6, prof) * (0.62 + 0.55 * H5));
    pk = mix(pk, uP5Light, clamp(satin5 * 0.4 + smoothstep(0.78, 0.98, H5) * 0.25 + rimIn * 0.35, 0.0, 1.0));
    // glossy crest line along each ribbon (its brightest silk, toward the core side)
    pk = mix(pk, uP5Streak, exp(-pow((relB - 0.42) * 9.0, 2.0)) * 0.55 * smoothstep(0.35, 0.65, swell));
    vec3 c5 = mix(cy, pk, pinkM);
    // silk streak light: light cyan-white on cyan, light pink on pink (the ribbons are combed silk);
    // the strongest dashes burn to near-white (ref 05 streak heads)
    c5 = mix(c5, mix(uC5Streak, uP5Streak, pinkM), clamp(silkL * mix(0.9, 1.05, pinkM), 0.0, 1.0));
    c5 += vec3(0.9, 1.0, 1.1) * smoothstep(0.75, 1.1, silkA) * 0.6;

    // glossy lighting from the same height field
    #ifdef LOW_Q
    vec3 N5 = normalize(N0 + 0.3 * vec3(H5 - 0.5, 0.0, swell - 0.5));
    #else
    vec3 N5 = bumpNormal(vPosW, N0, H5 * 0.09 * (1.0 - smoothstep(0.1, 0.5, fws)));
    #endif
    float nv5 = clamp(dot(N5, V), 0.0, 1.0);
    vec3 R5 = reflect(-V, N5);
    c5 = mix(c5, mix(uC5Bright, uP5Light, pinkM), pow(1.0 - nv5, 3.0) * mix(0.1, 0.16, pinkM));
    c5 += vec3(1.0) * pow(clamp(dot(N5, Hv), 0.0, 1.0), 90.0) * 1.1;
    float gl5 = pow(clamp(dot(R5, Lg), 0.0, 1.0), 90.0);
    c5 += mix(vec3(0.6, 1.2, 1.6), vec3(1.4, 0.7, 1.3), pinkM) * gl5 * (smoothstep(0.6, 0.92, H5) * 0.6 + silkL * 0.7);

    // near field (right behind Benny, 1 u ≈ 160–280 px): deep azure troughs, blue-white glossy swell
    // crests (the reflection of the lit tunnel on the heaving surface; on the pink sweeps a light-pink
    // sheen), soft flow streaks
    if (near5 > 0.0) {
      c5 *= 1.0 - near5 * 0.3 * troughN * (1.0 - 0.5 * pinkM);
      vec3 crestCol = mix(vec3(0.85, 1.65, 2.3), uP5Streak * 1.2, pinkM);
      c5 += crestCol * crestN * 2.1 * near5 * (1.0 - 0.45 * pinkM);
      c5 += mix(vec3(0.6, 1.3, 1.9), uP5Streak, pinkM) * strN * 0.45 * near5 * (1.0 - pinkM);
      // Fresnel-style sheen toward the screen sides (the surface bulges, its flanks face away)
      c5 = mix(c5, mix(vec3(0.5, 1.2, 1.9), uP5Light, pinkM), near5 * 0.18 * smoothstep(0.8, 1.6, abs(dlN)));
    }

    // white 4-point flares carried by the current: along the flow in the mid field, across it near
    #ifdef LOW_Q
    vec2 g5 = vec2(wq * 6.0, v5 * 0.25);
    float hs5 = hash12(floor(g5));
    c5 += vec3(1.3) * step(0.88, hs5) * smoothstep(0.22, 0.0, length(fract(g5) - 0.5)) * (0.5 + 0.5 * sin(uTime * 7.0 + hs5 * 40.0));
    vec2 g5n = vec2(lat * 3.0, v5 * 2.4);
    float hs5n = hash12(floor(g5n) + 3.0);
    c5 += vec3(1.4) * near5 * step(0.6, hs5n) * smoothstep(0.16, 0.0, length(fract(g5n) - 0.5)) * (0.6 + 0.4 * sin(uTime * 6.0 + hs5n * 30.0));
    #else
    float flA = flowGlint(vec2(wq * 6.0, v5 * 0.075), 0.75, 18.0, 3.8, 0.0, uTime);
    float flB = flowGlint(vec2(lat * 1.6, v5 * 1.4 + 0.5), 0.6, 26.0, 3.2, 1.0, uTime + 2.7);
    // many small twinkling 4-point stars (ref 05: dozens of tiny white glints in the near and mid water)
    float flC = flowGlint(vec2(lat * 4.0, v5 * 3.2 + 0.3), 0.8, 8.0, 2.6, 1.0, uTime + 1.3);
    flC *= 0.4 + 0.9 * pow(cN, 3.0);            // the small stars cluster on the swell crests (not a uniform snow)
    float flD = flowGlint(vec2(wq * 16.0, v5 * 0.32 + 7.0), 0.5, 6.0, 2.4, 0.3, uTime + 4.1);
    // (the big near flares sit mostly on the swell crests: light catching the heaving surface)
    c5 += vec3(1.9, 2.1, 2.3) * (flA * (1.0 - near5) * (1.0 - smoothstep(0.3, 0.8, fws))
        + flB * near5 * (0.35 + 1.4 * pow(cN, 6.0) * segN) + flC * near5 + flD * (1.0 - near5) * (1.0 - smoothstep(0.2, 0.5, fws)) * 0.9)
        * (1.0 - 0.5 * pinkM);
    #endif
    col = mix(col, c5, sw);
  }
  // ---- soap-foam lace where the water meets the foam banks ----
  float edgeN = (vnoise(vec2(s * 1.3, u * 2.0)) - 0.5) * 0.1;
  float eu = abs(lat) - vHalfW;               // units from the edge (negative inside)
  float edge = smoothstep(-0.75, -0.3, eu + edgeN * vHalfW);
  if (edge > 0.0) {
    float c = cells(vec2(lat * 3.2, (s - vSpeed * uTime * 0.35) * 3.2));
    vec3 foamCol = mix(uFoam * 1.15, uFoamLav * 0.85, smoothstep(0.25, 0.75, c));
    col = mix(col, foamCol, edge * smoothstep(0.05, 0.4, c + edge * 0.3));
  }
  col = mix(col, uFoamLav * 0.92, vSkirt);
  float cutC = cells(vec2(u * vHalfW * 4.0, s * 3.6));
  col = mix(col, mix(uFoam * 1.2, uFoamLav * 0.8, smoothstep(0.2, 0.7, cutC)), cutFoam);

  // ---- Benny: ripple rings and a V wake on the surface ----
  // (the 3D splash crown, spray fan and foam belong to riderSplash/spray/foam; here the water
  // around and behind him stays glossy electric cyan as in ref 05.) There is deliberately NO white
  // contact band at the waterline: the old contact -> uFoam mix drew a white elliptical rim that the
  // fur fringe turned into the jagged "splash artifact" under Benny (wave-3 correction 7). Only a
  // faint cyan brightening marks the waterline.
  if (uBenny.z > 0.0) {
    float du = lat - uBenny.y;
    float dv = s - uBenny.x;
    float rb = uBennyR;
    float d = length(vec2(du, dv));
    if (d < rb * 8.0) {
      float k = uBenny.z;
      float rr = max(0.0, d - rb * 0.92);
      float rings = smoothstep(0.75, 1.0, 0.5 + 0.5 * sin(d * 5.0 - uTime * 9.0)) * exp(-rr * 0.55) * smoothstep(rb, rb * 1.3, d);
      // 05: the magnified near field turned full rings into contour arcs; keep broken ripple fragments
      rings *= mix(1.0, 0.45 * smoothstep(0.45, 0.8, vnoise(vec2(atan(du, dv) * 3.0, d * 2.0))), sw);
      float back = max(-dv, 0.0);
      float wakeV = exp(-abs(abs(du) - back * 0.42 - rb * 0.95) * 6.0) * exp(-back * 0.18) * step(dv, 0.0);
      col += uCyanBright * 0.18 * (1.0 - smoothstep(0.0, rb * 0.3, rr)) * k;
      col += mix(uCyanBright, vec3(1.3), 0.4) * (rings * 0.22 + wakeV * 0.35) * k * (1.0 - pinkM * 0.5);
    }
  }

  // 04: exactly five glowing chevrons pointing downhill (direction of travel)
  if (uChevron.z > 0.5) {
    float x = u * vHalfW;
    for (int k = 0; k < 5; k++) {
      float y = s - (uChevron.x + float(k) * uChevron.y);
      if (abs(y) < 2.4 && abs(x) < 1.6) {
        // "^" pointing toward +s: tip at y=+1.0, arms sweep back 1.9 units over ±1.15 lateral
        float dist = abs(y - (1.0 - abs(x) * 1.65)) * 0.52;
        float arm = smoothstep(1.2, 1.1, abs(x));
        float core = smoothstep(0.2, 0.11, dist) * arm;
        float halo = smoothstep(0.7, 0.0, dist) * smoothstep(1.5, 0.9, abs(x)) * 0.5;
        col = mix(col, vec3(1.0), clamp(halo, 0.0, 1.0));
        col = mix(col, vec3(2.2, 2.4, 2.5), core);
      }
    }
  }
  gl_FragColor = vec4(col, 1.0);
  ${FRAG_TAIL}
}
`;

export interface Ribbon {
  mesh: THREE.Mesh;
  uniforms: Record<string, THREE.IUniform>;
  s0: number;
  s1: number;
  heightAt(s: number, lateral: number, t: number): number;
}

export function createRibbon(course: Course, opts: { s0: number; s1: number; quality: 'high' | 'low' }): Ribbon {
  const { s0, s1, quality } = opts;
  const ds = quality === 'high' ? 0.4 : 0.7;
  const cols = quality === 'high' ? 18 : 10;
  const rows = Math.ceil((s1 - s0) / ds) + 1;
  const vertsPerRow = cols + 1 + 2; // + skirt left/right
  const n = rows * vertsPerRow;
  const pos = new Float32Array(n * 3);
  const nor = new Float32Array(n * 3);
  const uv = new Float32Array(n * 2);
  const halfW = new Float32Array(n);
  const speed = new Float32Array(n);
  const amp = new Float32Array(n);
  const skirt = new Float32Array(n);
  const style = new Float32Array(n * 4);
  const core = new Float32Array(n);
  const tang = new Float32Array(n * 3);
  const tmp = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  let k = 0;
  for (let i = 0; i < rows; i++) {
    const s = Math.min(s1, s0 + i * ds);
    const f = course.sample(s);
    const hw = course.widthAt(s) / 2;
    const sp = Math.max(3, course.prop(s, 'speed'));
    const a = ampAt(course, s);
    const bs = bandStyleAt(course, s);
    const cl = coreLateral(course, s);
    const put = (u: number, lateral: number, h: number, isSkirt: number, nn: THREE.Vector3) => {
      tmp.copy(f.pos).addScaledVector(f.right, lateral).addScaledVector(f.up, h);
      tmp.toArray(pos, k * 3);
      nn.toArray(nor, k * 3);
      f.tan.toArray(tang, k * 3);
      uv[k * 2] = u;
      uv[k * 2 + 1] = s;
      halfW[k] = hw;
      speed[k] = sp;
      amp[k] = a;
      skirt[k] = isSkirt;
      for (let q = 0; q < 4; q++) style[k * 4 + q] = bs[q];
      core[k] = cl;
      k++;
    };
    // left skirt (below left edge)
    put(-1, -hw * 1.01, EDGE_LIFT - 0.7, 1, nrm.copy(f.right).negate());
    for (let j = 0; j <= cols; j++) {
      const u = -1 + (2 * j) / cols;
      const lift = EDGE_LIFT * Math.abs(u) ** 3;
      const slope = (EDGE_LIFT * 3 * u * Math.abs(u)) / hw; // d lift / d lateral
      nrm.copy(f.up).addScaledVector(f.right, -slope).normalize();
      put(u, u * hw, lift, 0, nrm);
    }
    put(1, hw * 1.01, EDGE_LIFT - 0.7, 1, nrm.copy(f.right));
  }
  const idx: number[] = [];
  for (let i = 0; i < rows - 1; i++) {
    for (let j = 0; j < vertsPerRow - 1; j++) {
      const a = i * vertsPerRow + j, b = a + 1, c = a + vertsPerRow, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.setAttribute('aUV', new THREE.BufferAttribute(uv, 2));
  geo.setAttribute('aHalfW', new THREE.BufferAttribute(halfW, 1));
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(speed, 1));
  geo.setAttribute('aAmp', new THREE.BufferAttribute(amp, 1));
  geo.setAttribute('aSkirt', new THREE.BufferAttribute(skirt, 1));
  geo.setAttribute('aStyle', new THREE.BufferAttribute(style, 4));
  geo.setAttribute('aCore', new THREE.BufferAttribute(core, 1));
  geo.setAttribute('aTan', new THREE.BufferAttribute(tang, 3));
  geo.setIndex(idx);
  geo.computeBoundingSphere();

  const st03 = course.stage('03'), st04 = course.stage('04'), st08 = course.stage('08');
  const uniforms = withFog({
    uTime: { value: 0 },
    uCyanDeep: { value: RIBBON_PAL.cyanDeep.clone() },
    uCyan: { value: RIBBON_PAL.cyan.clone() },
    uCyanBright: { value: RIBBON_PAL.cyanBright.clone() },
    uPinkDeep: { value: RIBBON_PAL.pinkDeep.clone() },
    uPink: { value: RIBBON_PAL.pink.clone() },
    uPinkLight: { value: RIBBON_PAL.pinkLight.clone() },
    uFoam: { value: PALETTE.foam.clone() },
    uFoamLav: { value: PALETTE.foamLav.clone() },
    uHaze: { value: PALETTE.haze.clone() },
    uLightDir: { value: new THREE.Vector3(0.3, 1.0, 0.45).normalize() },
    uBenny: { value: new THREE.Vector3(0, 0, 0) },
    uBennyR: { value: 0.7 },
    uChevron: { value: new THREE.Vector3(st04.s0 + 8.5, 3.6, 1) },
    uOutro: { value: new THREE.Vector2(0, st08.s0) },
    uHide: { value: new THREE.Vector4(st03.s0, st04.s0, 0, 0) },
    uC5Deep: { value: RIVER05_PAL.cyanDeep.clone() },
    uC5: { value: RIVER05_PAL.cyan.clone() },
    uC5Bright: { value: RIVER05_PAL.cyanBright.clone() },
    uC5Streak: { value: RIVER05_PAL.cyanStreak.clone() },
    uP5Deep: { value: RIVER05_PAL.pinkDeep.clone() },
    uP5: { value: RIVER05_PAL.pink.clone() },
    uP5Light: { value: RIVER05_PAL.pinkLight.clone() },
    uP5Streak: { value: RIVER05_PAL.pinkStreak.clone() },
    uFlow05: { value: course.stage('05').speed * FLOW05 },
  });
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    fog: true,
    side: THREE.DoubleSide,
    defines: quality === 'low' ? { LOW_Q: 1 } : {},
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'water_ribbon';
  mesh.frustumCulled = false; // one long mesh spanning the whole course
  return {
    mesh,
    uniforms,
    s0,
    s1,
    heightAt(s, lateral, t) {
      const hw = course.widthAt(s) / 2;
      return ribbonWave(lateral / hw, s, t, ampAt(course, s));
    },
  };
}
