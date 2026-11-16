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
import { FLOW05_GLSL, flow05Shared, flow05Textures } from './flow05';

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

/** the ribbon shader's 05 band S (`sbend` in FRAG), CPU copy */
export const sbend05 = (s: number) => 1.05 * Math.sin(s * 0.31 - 0.834) + 0.18 * Math.sin(s * 0.62 + 0.6);

/**
 * W10 (?water05=1 only, else exactly 0): extra lateral shift (ribbon units) of the 05 core + band pair near the exit
 * bend just before the far-block seam. The route jogs ≈1.7 u right there (s 174–181), which drew the visible cyan
 * core 478 → 547 px across only 18 screen rows (y 587 → 569) — the right-hand "blob" at the vanishing point. The
 * approved river keeps climbing smoothly up-right there, so the VISIBLE core (route + core swing + band S) is held at
 * T(s) relative to the tunnel line (−0.67 u at s 172 → −0.3 u at the seam), then hands back to the normal layout by
 * s 189 (hidden behind the far block at the checkpoint; 06 unchanged). Coins (gameplay/coins.ts) are NOT moved: the
 * s 173.6 coin stays on the cyan core, the s 181.6 one lies over the far block.
 */
export function coreShiftW10(course: Course, s: number): number {
  if (!WATER05) return 0;
  const w = smooth(171, 175, s) * (1 - smooth(182, 189, s));
  if (w <= 0) return 0;
  const rx = Math.max(0.5, course.sample(s).right.x);
  const visible = course.offset05(s) + (coreLateral(course, s) + sbend05(s)) * rx;
  const target = -0.67 + 0.37 * smooth(172, 180, s);
  return (w * (target - visible)) / rx;
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

/**
 * Screen 05 controlled water test W10 (?water05=1, water-fx-specialist wave 10; qa/pilot05/wave10/water/NOTES.md).
 * ONE switch for the 05 river look: hue-ramped satin bands (hot pink body → violet → periwinkle → electric cyan,
 * colours sampled from the approved image and solved through the post chain), flow-aligned brushed streaks with
 * aqua / white-pink cores, deep-blue outer water, glossy near swells; the far river block (far05.ts / materials.ts)
 * and the 05 splash follow the same switch. Off (default): every shader and geometry is byte-for-byte the previous
 * one (the code sits behind `#ifdef WATER05` / `if (WATER05)`), so the default build renders pixel-identically.
 * Guarded read: false in vite-node / workers (no `location`).
 */
/**
 * Packaged builds (Android APK) have no URL query: `VITE_RAINBOW_Q05="silk05=1&puff05=1" npm run android:debug` bakes
 * the same 05 switches into a separate EXPERIMENT build. Unset (every normal build): '' — the default build is unchanged.
 */
const BUILD_Q05: string = import.meta.env?.VITE_RAINBOW_Q05 ?? '';
const q05 = (key: string): boolean => {
  try {
    if (typeof location !== 'undefined' && new URLSearchParams(location.search).get(key) === '1') return true;
  } catch {
    /* no location (vite-node / workers) */
  }
  return BUILD_Q05 !== '' && new URLSearchParams(BUILD_Q05).get(key) === '1';
};
/** the same switch reader for other modules (Game.ts: `?glow05=1`) */
export const flag05 = q05;
/**
 * 05 texture advection relative to the stage speed. Default 1.3 (>1: the current overtakes Benny, so relative to the
 * riding camera the pattern drifts slowly AWAY toward the light). Test `?flowcam05=1` (user 2026-11-16: "scroll the
 * texture so the water flows toward the camera"): 0.5 — slower than the ride, so the streaks stream TOWARD the camera
 * at half the ride speed while still moving downstream in the world.
 */
export const FLOW05: number = q05('flowcam05') ? 0.5 : 1.3;
/**
 * Screen 05 test W11 (2026-11-16, qa/pilot05/wave11/NOTES.md) — ONE reversible demonstration `?river05=1` made of two
 * factors that can also be switched on separately (each on top of the W10 palette, so `?water05=1` is their baseline):
 *  `?farw05=1`  GEOMETRY: the distant river is a narrower channel that winds between foam shelves (point bars on the
 *               inside of each bend) — far block (far05.ts) + the last stretch of the real ribbon before the seam
 *               (channel05 below). Visual only: course.ts, widthAt(), steering, coins and collisions are untouched.
 *  `?flow05=1`  MATERIAL: a flow map generated from the river's own curves (flow05.ts) drives two-phase advection of
 *               a tileable ripple normal / height map (the three.js Water2 technique, without its render passes) —
 *               animated ripples, glossy highlights and the Marble panorama's reflection follow the S-curves.
 * All off (default): every shader program and geometry attribute is the previous one (pixel-identical build).
 */
/**
 * Screen 05 test W12 (2026-11-16, qa/pilot05/wave12/NOTES.md), two more single factors on top of `?river05=1` (each
 * switch turns river05 on; default build untouched):
 *  `?silk05=1`  WATER MATERIAL: the user found river05 "too grainy" — one broad ripple octave on a longer tile, the fine
 *               brushed cores / ripple crests / second flare set mostly removed, highlights and panorama reflections
 *               keep the water's own cyan / magenta hue (only the strongest burn white): long, smooth, flow-aligned
 *               satin lanes and a deep electric cyan instead of a pastel sheet of hair lines.
 *  `?puff05=1`  FOAM BANKS: where the puff cells of the W11 foam shelves get too small they fall back to a coarser
 *               cell layer (round mounds at every distance) instead of the flat lavender fill that drew hard wedges.
 */
export const SILK05: boolean = q05('silk05');
export const PUFF05: boolean = q05('puff05');
export const RIVER05: boolean = SILK05 || PUFF05 || q05('river05');
export const FARW05: boolean = RIVER05 || q05('farw05');
export const FLOWMAP05: boolean = RIVER05 || q05('flow05');
export const WATER05: boolean = q05('water05') || FARW05 || FLOWMAP05;

/**
 * Screen 05 PROJECTION test (`?proj05=1`, 2026-11-16, qa/pilot05/proj/NOTES.md): the user's APPROVED Screen 05 water,
 * baked into the REAL river's own coordinates (u across, s along; tools/proj05/bake.py from the locked 05 camera), so
 * it is anchored to the river, not to the camera. Four layers, all from the user's pictures (approved image; the
 * isolated original artwork only where the approved water is hidden by Benny / coins / the bottom ring):
 *   E exact (≈ screen resolution at the locked eye), N near (full width), T tile (the rest of 05), D detail (streaks /
 *   glints, luminance high-pass) — E fades to N/T + D wherever the camera magnifies it (no stretching).
 * The shader undoes the post chain (grade → sRGB → Neutral tone map → exposure, vignette, fog) so the screen shows the
 * approved colours. Flow: two-phase advection toward the camera (`?projflow05=0` off). Default build: every shader
 * program and geometry is the previous one (code behind `#ifdef PROJ05` / `if (PROJ05)`).
 */
/**
 * Screen 05 FULL REFERENCE MATCH (`?match05=1`, 2026-11-16, qa/pilot05/full_reference_match/): one master switch that turns
 * on every Screen-05 reference-match part (proj05 water + env05 tunnel / rings / fittings + hud05 + coins05 + benny05 +
 * splash05m + bub05 …). `on05('part')` = that part's own switch OR the master switch. Default build: all off.
 */
export const MATCH05: boolean = q05('match05');
export const on05 = (key: string): boolean => q05(key) || MATCH05;
export const PROJ05: boolean = on05('proj05');
/** `?proj05=1`: texture loads of other proj05 parts (far block, bank strip) that the game waits for before `ready` */
export const proj05Pending: Promise<unknown>[] = [];

/**
 * W11 geometry (`?farw05=1`, else the full width): the VISIBLE water channel of the 05 river at arc length s, in the
 * ribbon frame — centre `c` (units along `right`) and half width `hw`. Between the channel and the bank lies a foam
 * shelf (drawn by the ribbon shader on the same surface; Benny can still ride over it — widthAt() and the steering
 * range are unchanged). Approved image, banks traced through the locked 05 eye: a left shelf ≈1.3 u wide at
 * y 640–720 (s ≈ 145–155) and a right shelf that grows to ≈3.9 u at the seam (y 560–590, the big foam bank at
 * x 546–592) and continues into the far block; it hands back to the full width behind the seam (s 183–191, hidden
 * by the far block at the checkpoint, the ride into 06 is the normal river).
 */
export function channel05(course: Course, s: number): { c: number; hw: number } {
  const hw = course.widthAt(s) / 2;
  if (!FARW05) return { c: 0, hw };
  const st = course.stage('05');
  if (s <= st.s0 || s >= st.s1 + 4) return { c: 0, hw };
  const o = s - st.s0;                              // 05-relative arc length (the checkpoint is at o ≈ 17.75)
  const shL = 1.35 * smooth(25, 32, o) * (1 - smooth(39.5, 47, o));
  const shR = 3.7 * smooth(52, 65, o) * (1 - smooth(68.5, 76.5, o));
  const k = Math.min(1, (hw - 2.4) / Math.max(1e-3, (shL + shR) / 2));   // never narrower than 2.4 u half width
  const a = shL * Math.max(0, k), b = shR * Math.max(0, k);
  return { c: (a - b) / 2, hw: hw - (a + b) / 2 };
}

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
#ifdef FARW05
attribute vec2 aChan;    // W11: visible channel centre / half width (units, see channel05)
varying vec2 vChan;
#endif
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
  #ifdef FARW05
  vChan = aChan;
  #endif
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

/** `?proj05=1`: the inverse of the post chain (needs uniforms uPjPost, uPjRes) — shared with the far river block */
export const PROJ05_INVERSE = /* glsl */ `
// undo grade (vignette, contrast, saturation) -> sRGB -> Neutral tone map -> exposure: the linear colour that the
// post chain turns into the display colour t (bloom is not undone: it is measured and fed back into the bake)
vec3 pjInverse(vec3 t) {
  vec2 q = gl_FragCoord.xy / uPjRes - 0.5; q.x *= 0.75;
  float vig = 1.0 - uPjPost.w * smoothstep(0.25, 0.75, length(q));
  vec3 c = t / max(vig, 0.5);
  c = (c - 0.5) / uPjPost.z + 0.5;
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  c = vec3(l) + (c - vec3(l)) / uPjPost.y;
  c = clamp(c, 0.0, 0.975);
  c = mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
  float np = max(c.r, max(c.g, c.b));
  if (np >= 0.76) {
    float peak = 0.0576 / (1.0 - np) - 0.24 + 0.76;
    float g = 1.0 - 1.0 / (0.15 * (peak - np) + 1.0);
    c = (c - g * np) / (1.0 - g);
    c *= peak / np;
  }
  float x = min(c.r, min(c.g, c.b));
  float off = x >= 0.04 ? 0.04 : (sqrt(max(x, 0.0)) / 2.5 - x);
  return (c + off) / uPjPost.x;
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
#ifdef FLOWMAP05
// W11 (?flow05=1): flow map from the river's curves + tileable ripple map (flow05.ts), Marble panorama reflection
uniform sampler2D uFlowMap;
uniform sampler2D uRipple;
uniform vec2 uFlowS;       // flow-map v = (s - x) * y
uniform sampler2D uPano;
uniform mat3 uPanoRot;     // world direction -> panorama lookup direction
uniform float uPanoK;      // strength of the mirrored highlights
#endif
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
#ifdef FARW05
varying vec2 vChan;
#endif
#include <fog_pars_fragment>
#ifdef PROJ05
uniform sampler2D uPjE;    // exact layer (rgb = approved display colour, a = valid)
uniform sampler2D uPjLut;  // s -> (V, centre u, half range u) for uPjE (float, nearest)
uniform vec4 uPjLutS;      // s0, s1, lut texels, unused
uniform vec2 uPjESize;     // uPjE texels
uniform sampler2D uPjN;    // near layer, full width (a = coverage)
uniform vec2 uPjNS;        // s0, s1
uniform sampler2D uPjT;    // periodic tile (repeat along s)
uniform vec2 uPjTS;        // start s, period L
uniform sampler2D uPjD;    // detail (luminance high-pass, 0.5 = none), repeats in u and s
uniform vec4 uPjDS;        // tile width (u), tile length (s), gain, unused
uniform vec4 uPjFlow;      // distance (s units), rate (1/s), phase at t = 0, on
uniform vec4 uPjPost;      // exposure, saturation, contrast, vignette (the live post chain)
uniform vec2 uPjRes;       // render target size (vignette inverse)
uniform float uPjDbg;      // QA ?projdbg05=1: layer map (green = exact, blue = near, red = tile)
// ?projnear05=1 (2026-11-16, tools/proj05/near_bake.py): the HIGH-RESOLUTION near tile T2 (≈110 texels per unit
// instead of 24, mirrored repeat along s, mipmaps) takes over wherever the exact layer would be magnified while riding;
// the old tile uPjT keeps its role where E / N have no data at the locked view. uPjNear: x = on, y = share of the
// detail layer kept on T2, z = ride focus s (set every frame by vfx/index.ts), w = focus s of the locked checkpoint
uniform vec4 uPjNear;
uniform sampler2D uPjT2;   // near tile T2
uniform sampler2D uPjWT2;  // its flow map (?projflow05=2)
uniform vec2 uPjT2S;       // start s, half period L (mirrored repeat: period 2 L)
// how far ?projnear05=1 is engaged: 0 within 0.5 u of the locked checkpoint (the locked picture is the original
// proj05 one EXACTLY, including its own hand-overs), 1 from 2 u of riding on
float pjNearK() { return uPjNear.x > 0.5 ? smoothstep(0.5, 2.0, abs(uPjNear.z - uPjNear.w)) : 0.0; }
vec4 pjLut(float s) {
  float x = clamp((s - uPjLutS.x) / (uPjLutS.y - uPjLutS.x), 0.0, 1.0) * (uPjLutS.z - 1.0);
  float i = floor(x);
  vec4 a = texture2D(uPjLut, vec2((i + 0.5) / uPjLutS.z, 0.5));
  vec4 b = texture2D(uPjLut, vec2((min(i + 1.0, uPjLutS.z - 1.0) + 0.5) / uPjLutS.z, 0.5));
  vec4 r = mix(a, b, x - i);
  r.w = step(uPjLutS.x, s) * step(s, uPjLutS.y);
  return r;
}
// display-space target at (u, s): exact layer where it is sharp enough, else near / tile layout + detail
vec3 pjTarget(float u, float s, float mE, out float wE, out float wN) {
  vec4 L = pjLut(s);
  vec2 eUV = vec2(0.5 + (u - L.y) / (2.0 * L.z), L.x);
  vec4 e = texture2D(uPjE, eUV);
  float inE = L.w * step(0.0, eUV.x) * step(eUV.x, 1.0);
  wE = e.a * inE * smoothstep(0.3, 0.55, mE);
  vec2 nUV = vec2(u * 0.5 + 0.5, (s - uPjNS.x) / (uPjNS.y - uPjNS.x));
  vec4 n = texture2D(uPjN, nUV);
  wN = n.a * smoothstep(0.0, 0.08, nUV.y) * (1.0 - smoothstep(0.92, 1.0, nUV.y));   // soft ends (≈3 u), no seam
  vec3 t = texture2D(uPjT, vec2(u * 0.5 + 0.5, (s - uPjTS.x) / uPjTS.y)).rgb;
  if (uPjNear.x > 0.5) {
    // ?projnear05=1: where the exact layer would be magnified, the 24-texel near layer and the old tile hand over to
    // the crisp tile T2 by the same test as E (at the locked checkpoint mE = 1.3: wT2 = 0, the locked picture is the
    // old one exactly)
    float wT2 = pjNearK() * (1.0 - smoothstep(0.3, 0.55, mE));
    t = mix(t, texture2D(uPjT2, vec2(u * 0.5 + 0.5, (s - uPjT2S.x) / uPjT2S.y)).rgb, wT2);
    wN *= 1.0 - wT2;
  }
  vec3 lay = mix(t, n.rgb, wN);
  return mix(lay, e.rgb, wE);
}
float pjDetail(float u, float s) {
  return texture2D(uPjD, vec2(u / uPjDS.x, s / uPjDS.y)).r - 0.5;
}
// ?projflow05=2 — the approved design's own streak direction at (u, s): x = du/ds along the streak, y = flow mask
// (0 on foam banks, bubbles and the river's edge). Baked by tools/proj05/flow_bake.py from the N and T layers.
uniform sampler2D uPjWN;   // flow map of the near layer (R slope, G mask, B coverage)
uniform sampler2D uPjWT;   // flow map of the periodic tile
uniform vec4 uPjFlow2;     // streamline mode on, slope scale, river half width (u), share of the flowing picture
vec2 pjFlowDir(float u, float s, float mE) {
  float ny = (s - uPjNS.x) / (uPjNS.y - uPjNS.x);
  vec3 fn = texture2D(uPjWN, vec2(u * 0.5 + 0.5, ny)).rgb;
  vec3 ft = texture2D(uPjWT, vec2(u * 0.5 + 0.5, (s - uPjTS.x) / uPjTS.y)).rgb;
  float wn = fn.b * smoothstep(0.0, 0.08, ny) * (1.0 - smoothstep(0.92, 1.0, ny));
  if (uPjNear.x > 0.5) {
    // T2's own streak direction where T2 is what is shown; a mirrored period runs its streaks mirrored
    float wT2 = pjNearK() * (1.0 - smoothstep(0.3, 0.55, mE));
    vec3 f2 = texture2D(uPjWT2, vec2(u * 0.5 + 0.5, (s - uPjT2S.x) / uPjT2S.y)).rgb;
    if (mod(floor((s - uPjT2S.x) / uPjT2S.y), 2.0) > 0.5) f2.r = 1.0 - f2.r;
    ft = mix(ft, f2, wT2);
    wn *= 1.0 - wT2;
  }
  vec2 f = mix(ft.rg, fn.rg, wn);
  return vec2((f.r - 0.5) / uPjFlow2.y, f.g);
}
${PROJ05_INVERSE}#endif
${NOISE_GLSL}
${FRAG_FX_GLSL}
#ifdef FLOWMAP05
${FLOW05_GLSL}
#endif

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

// 05 (wave 8) speed streaks: ref 05 water is motion-blurred satin — densely packed bright dashes running
// ALONG the flow (≈4–8 px apart in the mid field, long fanning streaks near the camera) over broad light /
// dark lanes, on the cyan AND on the pink bands. Anisotropic value noise (cells ≈15–25× longer along the
// flow than across), octaves 2.3× finer across / 1.6× along; each octave fades once its cells get under
// ≈3–8 px (fwX / fwV = screen derivatives taken by the caller outside any branch) and the loop stops at
// the first fully faded octave (all later ones are finer). Peaks of each octave are the dashes (lattice
// rows staggered by the golden ratio so they never line up across the flow).
// returns x = lane (≈ -0.5..0.5, broad light/dark lanes), y = dash (0..≈1, thin bright dashes),
//         z = finest visible octave (0..1, brushes the band edges into streaks)
#ifdef LOW_Q
#define SS_OCT 2
#else
#define SS_OCT 5
#endif
vec3 speedStreaks(float X, float v, float fwX, float fwV) {
  float lane = 0.0, dash = 0.0, fine = 0.5, nPrev = 0.6;
  // (it04) cells 25× (fine octaves ≈45×) longer along the flow than across, NO lattice shear: it03's
  // golden-ratio shear skewed every cell diagonally across the current and the lines curled like marble
  float kx = 2.2, kv = 0.088, amp = 0.5;
  for (int i = 0; i < SS_OCT; i++) {
    float cpx = fwX * kx;                         // cells per pixel across the flow
    float cpp = max(cpx, fwV * kv * 1.5);
    float a = 1.0 - smoothstep(0.12, 0.3, cpp);
    if (a <= 0.0) break;
    float n = vnoise(vec2(X * kx + float(i) * 3.17, v * kv + float(i) * 7.31));
    lane += (n - 0.5) * a * amp;
    // (it03) the dashes are the iso-lines n = 0.5 of every octave whose cells are ≤ ≈30 px across: ≈1–2 px
    // wide whatever the depth (distance |n − 0.5| over the estimated per-pixel gradient ≈1.3·cpx), so the
    // water is densely combed like ref 05 satin (it02's thresholded noise peaks were too sparse), broken into
    // dashes by the next coarser octave (they gather on its light lanes)
    float dpx = abs(n - 0.5) / (1.3 * cpx + 1e-5);
    float ln = 1.0 - smoothstep(0.3, 1.1, dpx);
    dash = max(dash, ln * smoothstep(0.5, 0.78, nPrev) * a * smoothstep(0.025, 0.05, cpx) * (0.6 + 0.8 * amp));
    fine = mix(fine, n, a);
    nPrev = n;
    kx *= 2.3; kv *= 1.85; amp *= 0.62;
  }
  return vec3(lane, dash, fine);
}

#ifdef WATER05
// ---- W10 (?water05=1): approved-image palette, shader-linear values solved through exposure 0.86 → Neutral →
// sRGB → grade (sat 1.36 / con 1.15), bloom ignored. Cyan has R ≈ 0 and aqua (G ≈ B) highlights like the approved;
// the bands ramp hot pink → violet → periwinkle → cyan on the core side and → deep blue toward the banks.
const vec3 W5_CDEEP = vec3(0.058, 0.197, 0.379);   // #0068AD
const vec3 W5_CDEEP2 = vec3(0.062, 0.290, 0.572);  // #0086D8
const vec3 W5_CMID = vec3(0.066, 0.424, 0.747);    // #00A8F5
const vec3 W5_CBRIGHT = vec3(0.088, 0.567, 0.825); // #00C4FB
#ifdef SILK05
// W12: red-free aqua / blue tones (approved cyan pixels have S ≈ 0.99 even in the bright lanes)
const vec3 W5_CAQUA = vec3(0.03, 0.78, 0.9);
const vec3 W5_CAQUAW = vec3(0.2, 0.93, 0.97);
#else
const vec3 W5_CAQUA = vec3(0.142, 0.787, 0.882);   // #20E8FA
const vec3 W5_CAQUAW = vec3(0.39, 0.942, 0.947);   // #7DF9FA
#endif
const vec3 W5_PDEEP = vec3(0.465, 0.086, 0.376);   // #C81CAE
const vec3 W5_PBODY = vec3(0.698, 0.112, 0.545);   // #F72BD4
const vec3 W5_PLIGHT = vec3(0.779, 0.204, 0.769);  // #FB57F9
const vec3 W5_PPALE = vec3(0.835, 0.534, 0.872);   // #F0AFF7
const vec3 W5_PWHITE = vec3(0.945, 0.767, 0.974);  // #F8D7FD
const vec3 W5_VIN = vec3(0.372, 0.170, 0.625);     // #A14FE4 violet, core side
const vec3 W5_VPERI = vec3(0.311, 0.252, 0.740);   // #866FF6 periwinkle
#ifdef SILK05
const vec3 W5_VBLUE = vec3(0.07, 0.40, 0.82);
#else
const vec3 W5_VBLUE = vec3(0.168, 0.427, 0.795);   // #3FA3F9 blue into the cyan core
#endif
const vec3 W5_VOUT = vec3(0.381, 0.185, 0.674);    // #A255ED violet, bank side
const vec3 W5_OBLUE = vec3(0.211, 0.256, 0.715);   // #5F73F3 blue-violet outer water
const vec3 W5_ODEEP = vec3(0.161, 0.316, 0.700);   // #4287ED deep blue outer water

// Flow-aligned brushed satin: anisotropic value noise (cells ≈44× longer along the flow than across in world units,
// ≈7–10× on screen in the mid field), 3 octaves, each faded before its cells drop under ≈4–8 px across (no shimmer,
// no hair lines); the finer octaves drift a little faster than the coarse ones (layered movement).
// returns x = coarse lane (-0.5..0.5), y = brushed value (0..1, mean 0.5), z = crisp lens-shaped streak cores of the
// two finer octaves (0..1), w = soft broad highlight lanes of the coarse octave (0..1)
vec4 brush05(float X, float v, float fwX, float fwV, float drift) {
  float lane = vnoise(vec2(X * 1.1 + 2.3, v * 0.03 + 3.0)) - 0.5;
  float b = 0.0, wsum = 0.0, core = 0.0, glow = 0.0;
  float kx = 4.0, kv = 0.05, wt = 1.0;
  #ifdef LOW_Q
  const int NB = 2;
  #else
  const int NB = 3;
  #endif
  for (int i = 0; i < NB; i++) {
    float cpx = max(fwX * kx, fwV * kv * 2.0);
    float a = 1.0 - smoothstep(0.12, 0.28, cpx);
    float n = vnoise(vec2(X * kx + float(i) * 7.13, (v - drift * float(i)) * kv + float(i) * 3.71));
    b += (n - 0.5) * a * wt;
    wsum += wt;
    if (i == 0) glow = smoothstep(0.6, 0.88, n) * a;
    else core = max(core, smoothstep(0.7, 0.88, n) * a);
    kx *= 2.2; kv *= 1.7; wt *= 0.8;
  }
  return vec4(lane, clamp(0.5 + b / wsum * 1.9, 0.0, 1.0), core, glow);
}

// Jagged white "lightning" flare (approved near field: ≈8–12 bright 60–120 px flares on the swell crests): a thick
// lens along SCREEN-horizontal whose spine zig-zags, a short vertical spike and a soft halo. g = world-anchored,
// advected cell grid; sizes in pixels, clamped so the flare never crosses its cell border (no clipped halos).
// Derivatives are taken before the early-out (Android-safe). returns x = white core, y = halo
vec2 bolt05(vec2 g, float density, float Lpx, float Tpx, float seed) {
  vec2 gx = dFdx(g);
  vec2 gy = dFdy(g);
  vec2 gi = floor(g);
  float hs = hash12(gi + seed);
  float det = gx.x * gy.y - gy.x * gx.y;
  if (hs < 1.0 - density || abs(det) < 1e-12) return vec2(0.0);
  vec2 dg = fract(g) - (vec2(hash12(gi + seed + 2.3), hash12(gi + seed + 6.9)) * 0.3 + 0.35);
  vec2 p = vec2(gy.y * dg.x - gy.x * dg.y, gx.x * dg.y - gx.y * dg.x) / det;   // pixels from the flare centre
  float limx = 0.3 / max(abs(gx.x) + abs(gx.y), 1e-6);
  float limy = 0.3 / max(abs(gy.x) + abs(gy.y), 1e-6);
  float L = min(Lpx * (0.6 + 0.8 * fract(hs * 37.0)), limx);
  float T = min(Tpx * (0.7 + 0.6 * fract(hs * 53.0)), limy * 0.35);
  float ax = abs(p.x / L);
  if (ax > 1.0 && abs(p.y) > limy) return vec2(0.0);
  float k = 2.0 + 1.5 * fract(hs * 71.0);             // zig-zag kinks per half length
  float zz = (abs(fract(p.x / L * k + hs * 3.0) - 0.5) * 2.0 - 0.5) * T * 1.3 * max(0.0, 1.0 - ax);
  float y = p.y - zz;
  float th = T * pow(max(0.0, 1.0 - ax * ax), 1.3);
  float core = (1.0 - smoothstep(th * 0.45, th + 0.8, abs(y))) * step(ax, 1.0);
  float spike = exp(-abs(p.x) * 0.9) * max(0.0, 1.0 - abs(p.y) / min(L * 0.3, limy));
  float halo = exp(-length(vec2(p.x / (L * 0.75), y / (T * 2.5 + 5.0))) * 2.0) * max(0.0, 1.0 - abs(p.y) / limy);
  return vec2(max(core, spike * 0.7), halo);
}
#ifdef SILK05
// W12 long streak along the current: lanes of constant X (k lanes per unit), one line per lane at a random offset,
// lit where a slow noise along the lane passes its threshold (dens = lit share, lens-shaped ends).
// returns x = ≈2 px white core, y = ≈8 px soft glow
vec2 silk05Streak(float X, float v, float k, float seed, float dens) {
  float g = X * k + seed;
  float fw = max(fwidth(g), 1e-4);
  float i = floor(g);
  float h = hash12(vec2(i, seed + 1.7));
  float dpx = abs(fract(g) - (0.3 + 0.4 * h)) / fw;            // px from this lane's line
  float seg = vnoise(vec2(i * 1.7 + seed, v * (0.05 + 0.04 * h) + h * 9.0));
  float on = smoothstep(1.0 - dens, 1.0 - dens + 0.22, seg);
  return vec2(1.0 - smoothstep(0.6, 2.0, dpx), 1.0 - smoothstep(1.5, 8.0, dpx)) * on;
}
#endif
#endif

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
  #ifdef FARW05
  // W11: the band layout lives in the visible channel (narrower than the ribbon where a foam shelf lines the bank)
  float chC = vChan.x;
  hw = vChan.y;
  #endif
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
    float Mb = M + sbend;
    #ifdef FARW05
    Mb -= chC;                                // core position relative to the channel centre (band clamps below)
    #endif
    // 05 (wave 7) channel shape fitted to ref 05 (band centres back-projected through the locked camera,
    // lateral from the core): the river widens at s≈148–166 (the right band runs along the right bank at
    // s≈152–157, the left band bulges toward the core at s≈145–152 and swings out at s≈158–166), and the
    // right band runs ≈0.3 u closer to the core at s≈136–139. Stationary in s; 0 beyond s 180 (06 join).
    float fR = -0.3 * smoothstep(133.0, 136.0, s) * (1.0 - smoothstep(139.5, 142.0, s))
             + 1.9 * smoothstep(146.5, 154.0, s) * (1.0 - smoothstep(160.0, 168.0, s))
             - 0.9 * smoothstep(165.0, 170.0, s) * (1.0 - smoothstep(174.0, 180.0, s));
    float fL = -0.5 * smoothstep(143.0, 147.0, s) * (1.0 - smoothstep(151.0, 155.0, s))
             + 1.0 * smoothstep(154.0, 158.0, s) * (1.0 - smoothstep(168.0, 176.0, s));
    offL += sw * fL;
    offR += sw * fR;
    // 05 (wave 7): approaching Benny the two S-bands swing OUT to the banks and leave the frame at the
    // image sides (ref 05: the left band exits at y≈930 ≈ 3.5 u ahead of him, the right one at y≈1090
    // ≈ 0.8 u ahead); behind him only the two diagonal wake sweeps (below) carry pink. (Wave 5 glided
    // the bands in to his track ±1.42 u instead, which drew the two wide vertical pink sheets.)
    if (vStyle.x > 0.0 && uBenny.z > 0.0) {
      float k5 = sw * vStyle.x;
      offL += k5 * 2.0 * smoothstep(7.0, 2.5, db);
      offR += k5 * 1.6 * smoothstep(2.6, 0.4, db);
    }
    // keep both bands inside the water (the core swing pushes one toward the bank on each bend);
    // the band pressed against the bank thins a little instead of collapsing the cyan core
    // (smooth minimum: a hard min() put a visible corner in the band where the clamp starts)
    float roomL = Mb + hw - 0.5 - offL, roomR = hw - 0.5 - Mb - offR;
    wL = smin(wL, max(roomL, 0.6 * wL), 0.5);
    wR = smin(wR, max(roomR, 0.6 * wR), 0.5);
    offL = smin(offL, Mb + hw - wL - 0.5, 1.2);
    offR = smin(offR, hw - wR - 0.5 - Mb, 1.2);
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
  // ---- 05 (wave 8): one speed-streak field for the whole river (cyan + pink) ----
  // X = across-flow coordinate (units): ahead of Benny it follows the S-band midline, normalised by the band
  // spacing so the streaks stay parallel to the pink bands on every bend; behind him it fans out from his
  // track (÷(1 + 0.7·back)) like his wake, so the near streaks and sweeps spread to the bottom corners.
  float back = max(-db, 0.0);
  float cLc = -offL - pert, cRc = offR - pert;
  float hS = max(0.5 * (cRc - cLc), 0.6);
  float q = (xb - 0.5 * (cLc + cRc)) / hS;
  float nearW = uBenny.z > 0.0 ? sw * smoothstep(5.0, 0.5, db) : 0.0;
  float X = (lat - mix(M + sbend + 0.5 * (cLc + cRc), uBenny.y, nearW)) * mix(3.0 / hS, 1.0, nearW) / (1.0 + 0.7 * back);
  X += 0.05 * sin(v5 * 0.21 + X * 1.1);       // the streaks braid gently
  float fwX5 = fwidth(X);
  vec3 SS = vec3(0.0, 0.0, 0.5);
  if (sw > 0.001) {
    #ifndef WATER05
    SS = speedStreaks(X, v5, fwX5, fws);
    #endif
    // brushed band edges: over ≈±22 % of the band width the pink and cyan interleave as streaks along the
    // flow (ref 05: the ribbons fray into the current) instead of the hard 1-px cut of the flat slab
    float fLw = 0.13 * wL + aaw, fRw = 0.13 * wR + aaw;
    float eL = clamp((wL - dL) / (2.0 * fLw) + 0.5, 0.0, 1.0);
    float eR = clamp((wR - dR) / (2.0 * fRw) + 0.5, 0.0, 1.0);
    pL = mix(pL, smoothstep(0.4, 0.6, eL + (SS.z - 0.5) * 0.6) * on, sw);
    pR = mix(pR, smoothstep(0.4, 0.6, eR + (SS.z - 0.5) * 0.6) * on, sw);
  }
  // hair-thin pink filaments drifting through the cyan core (mid/far field only)
  float fil = 0.0;
  #ifndef LOW_Q
  float fc = hw * 0.18 * sin(s * 0.21 + 0.8);
  fil = (1.0 - smoothstep(0.025 * hwc, 0.025 * hwc + aaw, abs(x - fc + pert * 0.7)))
      * smoothstep(0.62, 0.78, vnoise(vec2(s * 0.09, 21.0))) * gate * aa.x * freeK;   // 05 core: pure cyan
  #endif
  float pinkM = max(max(pL, pR), fil);
  // 05 (wave 7) wake sweeps: two satin pink ribbons leave Benny's sides under the splash and fan out
  // DIAGONALLY toward the bottom corners (ref 05 runs: y1240 x≈571–595, y1280 134–238 / 586–669,
  // y1320 91–202 / 626–738 → centre ±(0.4 + 0.52·back) u from his track, half width ≈0.2 u, measured
  // through the locked camera). They taper in from 0.3 u behind him, so the water right under and
  // behind him stays cyan, and leave the frame at the bottom corners (≈2.5 u behind him).
  float wake = (vStyle.x > 0.0 && uBenny.z > 0.0) ? sw * vStyle.x : 0.0;
  float dlB = lat - uBenny.y;
  // (it01 measured: Benny's real waterline s sits ≈0.3 u ahead of the checkpoint row, so the fit is
  // re-solved against the rendered sweeps: centre 0.2 + 0.55·back, tapering in 0.7 → 1.4 u behind him)
  float cW = 0.2 + 0.55 * back + 0.05 * sin(v5 * 1.7 + sign(dlB) * 1.9) * back;
  float wW = (0.12 + 0.07 * back) * smoothstep(0.7, 1.4, back);
  float dW = abs(abs(dlB) - cW);
  // (wave 8) soft brushed edges from the same streak field (the sweeps lie along the fanning X lines,
  // so their edges fray into streaks along the sweep instead of the straight plank edges of wave 7)
  float fWw = 0.4 * wW + aaw;
  float eW = clamp((wW - dW) / (2.0 * fWw) + 0.5, 0.0, 1.0);
  float pW = smoothstep(0.38, 0.62, eW + (SS.z - 0.5) * 0.7) * wake * step(0.001, wW);
  float relW = clamp((cW - abs(dlB)) / max(wW, 1e-3), -1.0, 1.0);   // -1 outer edge .. +1 toward Benny
  float pMain = max(pL, pR);
  pinkM = max(pinkM, pW);
  // glossy rims: light-pink just inside each band edge, bright cyan just outside it
  float rimIn = max(pL * smoothstep(wL - rimW, wL - aaw, dL), pR * smoothstep(wR - rimW, wR - aaw, dR));
  float rimOut = max((1.0 - pL) * (1.0 - smoothstep(wL + aaw, wL + rimW * 1.6, dL)),
                     (1.0 - pR) * (1.0 - smoothstep(wR + aaw, wR + rimW * 1.6, dR))) * on;
  float rel = pL >= pR ? sdL / max(wL, 1e-3) : -sdR / max(wR, 1e-3);   // -1 outer edge .. +1 core side
  if (pW > pMain) {
    rel = relW;
    rimIn = max(rimIn, pW * smoothstep(wW * 0.6, wW - aaw, dW));
  }
  rimOut = max(rimOut, (1.0 - pinkM) * (1.0 - smoothstep(wW + aaw, wW + 0.08 + aaw, dW)) * wake * step(0.001, wW));
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
  // Wave 8: the whole 05 river (cyan core, pink S-bands, near sweeps) is shaded from ONE speed-streak field
  // laid out along the flow coordinate X (see above): motion-blurred satin like ref 05 — broad light/dark
  // lanes + dense thin bright dashes along the current, on cyan and on pink — instead of flat pink fills and
  // marble-like silk lines. Depth: deep-azure lanes between bright crests, pink ribbons graded from a deep
  // magenta-violet outer edge to a light streaky core side, Fresnel tint, sun specular, the tunnel-end
  // glitter path and bump normals from the same height field; star flares carried by the current.
#ifdef WATER05
  // ---- W10 (?water05=1): satin S-ribbons + electric cyan, hue-ramped like the approved image ----
  if (sw > 0.001) {
    #ifdef FLOWMAP05
    // (W11: wider hand-over between the mid-field satin and the near swells — the narrow one drew a hard line
    // across the river ≈1.5 u behind Benny)
    float near5 = 1.0 - smoothstep(0.006, 0.024, fws);
    #else
    float near5 = 1.0 - smoothstep(0.0075, 0.014, fws);
    #endif
    float mid5 = 1.0 - near5;
    vec4 B5 = brush05(X, v5, fwX5, fws, uTime * 0.35);
    // near the camera the brushed lines stay faint (the approved near water is smooth glossy swells, no fanning rays)
    float br = mix(B5.y, 0.5 + (B5.y - 0.5) * 0.3, near5);
    #ifdef SILK05
    // W12: the brushed noise only tints the satin (its fine octaves read as grain); the crisp lens cores mostly go
    br = 0.5 + (br - 0.5) * 0.45;
    float bcore = B5.z * 0.3 * (1.0 - 0.8 * near5);
    #else
    float bcore = B5.z * (1.0 - 0.8 * near5);
    #endif
    float bglow = B5.w * (1.0 - 0.8 * near5);
    float lane5 = B5.x * (1.0 - 0.6 * near5);
    #ifdef FLOWMAP05
    // ---- W11 flow map: the local flow of the river, baked from its own curves (flow05.ts), carries the ripple map
    // downstream in two cross-faded phases (three.js Water2). The ripple uv lies in the river's streamline frame
    // (X follows the S-bands on every bend and fans out behind Benny), so the long ripple crests stay parallel to
    // the current; the flow map gives each streamline its own speed (fast core, slow banks, quicker outside of a
    // bend — the shear a single scrolling texture cannot do), its turbulence and its phase. (Sliding the stretched
    // map sideways by the map's direction channel cross-hatched the streaks: tested and dropped, it01 / it02.)
    vec4 fm = texture2D(uFlowMap, vec2(u * 0.5 + 0.5, (s - uFlowS.x) * uFlowS.y));
    #ifdef SILK05
    const vec2 RSC = vec2(0.3, 0.011);                         // W12: broader, longer tile (3.3 u across x 90 u along)
    #else
    const vec2 RSC = vec2(0.42, 0.016);                        // ripple tile = 2.4 u across x 62 u along the river
    #endif
    vec2 uvR = vec2(X, s) * RSC;
    vec2 advR = vec2(0.0, fm.g * uFlow05 * 1.25 * RSC.y);      // uv travelled during one 1.25 s cycle
    float cycR = uTime * 0.8 + fm.a;
    vec4 rp = flowRipple(uRipple, uvR, advR, cycR);
    #if !defined(LOW_Q) && !defined(SILK05)
    vec4 rp2 = flowRipple(uRipple, uvR * vec2(2.3, 2.9) + 0.19, advR * 2.9 * 1.15, cycR + 0.31);
    rp = vec4(rp.rg + (rp2.rg - 0.5) * 0.4, rp.b * 0.72 + rp2.b * 0.28, max(rp.a, rp2.a * 0.7));
    #endif
    #ifdef SILK05
    // W12 silk: the one broad ripple octave carries the shading as long liquid lanes; the crests are no longer drawn
    // as crisp lines, they become soft saturated highlight lanes along each swell (bglow), only the very top stays crisp
    lane5 += (rp.b - 0.5) * (0.8 + 0.2 * fm.b) * (1.0 - 0.3 * near5);
    float silkHi = smoothstep(0.7, 0.96, rp.b) * (1.0 - 0.5 * near5);
    bglow = max(bglow, silkHi * 0.85);
    bcore = max(bcore, rp.a * rp.a * 0.22 * (1.0 - 0.7 * near5));
    #else
    // the ripples shade the satin (long light / dark liquid lanes along the flow) and add sparse crisp crests,
    // a little busier where the flow map marks shear and bends; the band edges keep their clean brushed line
    lane5 += (rp.b - 0.5) * (0.5 + 0.25 * fm.b) * (1.0 - 0.35 * near5);
    bcore = max(bcore, rp.a * (0.4 + 0.35 * fm.b) * (1.0 - 0.6 * near5));
    #endif
    #endif
    // band coordinate of the nearer band: -1 = bank-side edge .. +1 = core-side edge, |t| > 1 outside the band
    float tL5 = sdL / max(wL, 1e-3), tR5 = -sdR / max(wR, 1e-3);
    float tb = abs(tL5) < abs(tR5) ? tL5 : tR5;
    bool sweep = false;
    if (wake > 0.0 && wW > 0.001) {
      float tW5 = (cW - abs(dlB)) / wW;          // near wake sweeps: -1 outer .. +1 toward Benny
      if (abs(tW5) < abs(tb)) { tb = tW5; sweep = true; }
    }
    tb += (br - 0.5) * 0.34 * mid5;              // brushed edges: pink and cyan interleave as streaks along the flow
    float at = abs(tb);
    // electric cyan: saturated brushed lanes deep -> mid -> bright (approved mid ladder p5 #0185E5, p50 #05B3FB),
    // soft aqua highlight lanes, crisp white-aqua lens streaks
    float h5 = clamp(0.5 + lane5 * 0.8 + (br - 0.5) * 0.7, 0.0, 1.0);
    vec3 cy = mix(W5_CDEEP, W5_CDEEP2, smoothstep(0.0, 0.22, h5));
    cy = mix(cy, W5_CMID, smoothstep(0.22, 0.45, h5));
    cy = mix(cy, W5_CBRIGHT, smoothstep(0.5, 0.76, h5) * 0.85);
    #ifdef SILK05
    // W12: highlights stay saturated aqua (approved cyan pixels: S ≈ 0.99), only the rare strongest cores go white
    cy = mix(cy, W5_CAQUA, bglow * 0.6);
    cy = mix(cy, W5_CAQUA, bcore * 0.8);
    cy += vec3(0.5, 0.9, 0.9) * bcore * bcore * bcore * 0.8;
    #else
    cy = mix(cy, W5_CAQUA, bglow * 0.55);
    cy = mix(cy, W5_CAQUAW, bcore * 0.85);
    cy += vec3(0.9, 1.1, 1.1) * bcore * bcore * 0.9;   // (it04) whiter streak cores
    #endif
    // near field: thick glossy swells rolling past Benny, bowed around his track (approved: ∩ highlight arcs
    // ≈60–100 px apart behind him), bright glossy cyan body, crisp aqua-white crest lines broken into segments
    float crestN = 0.0, phN = 0.0;
    if (near5 > 0.0) {
      float dlN = lat - uBenny.y;
      // (it03) stronger ∩ bow (approved arcs drop ≈40–60 px over ±250 px), less random warp, deeper troughs, the
      // bright tier only on the crest side of each swell (approved near ladder p5 #0087E2, p50 #01A5FA, p75 #03C0FC)
      float ph = v5 * 12.0 + 9.0 * dlN * dlN / (1.0 + 0.25 * back) + 0.9 * vnoise(vec2(dlN * 0.9 + 3.0, v5 * 0.6));
      phN = ph;
      float sv = 0.5 + 0.5 * sin(ph);
      // (it04) softer troughs (it03 read as regular stripes)
      vec3 nb = mix(mix(W5_CDEEP, W5_CDEEP2, 0.5), W5_CDEEP2, smoothstep(0.0, 0.25, sv));
      nb = mix(nb, W5_CMID, smoothstep(0.25, 0.6, sv));
      nb = mix(nb, W5_CBRIGHT, smoothstep(0.7, 1.0, sv) * 0.8);
      float seg = smoothstep(0.3, 0.58, vnoise(vec2(dlN * 1.4 + 9.0, v5 * 1.3)));
      float sp = max(0.0, sin(ph + 1.0));
      crestN = (pow(sp, 36.0) + 0.5 * pow(sp, 7.0)) * seg;
      #ifdef SILK05
      // W12: broad glossy swell tops (aqua sheen) instead of pixel-thin white crest lines
      nb = mix(nb, W5_CAQUA, clamp(0.65 * pow(sp, 5.0) * seg, 0.0, 1.0));
      nb = mix(nb, W5_CAQUAW, clamp(pow(sp, 22.0) * seg, 0.0, 1.0) * 0.5);
      #else
      nb = mix(nb, W5_CAQUA, clamp(0.5 * pow(sp, 7.0) * seg, 0.0, 1.0));
      nb = mix(nb, W5_CAQUAW, clamp(pow(sp, 36.0) * seg, 0.0, 1.0) * 0.95);
      nb += vec3(0.6, 0.9, 0.9) * pow(sp, 140.0) * seg * 1.4;
      #endif
      cy = mix(cy, nb, near5);
    }
    // deep blue / blue-violet water between a band and its bank
    vec3 ow = mix(W5_ODEEP * 0.82, W5_OBLUE, smoothstep(0.3, 0.75, h5));
    ow = mix(ow, W5_CAQUA, bcore * 0.35);
    // hot-pink satin: deep magenta grooves -> saturated hot-pink body, soft light-pink lanes, a narrow satin sheen along
    // the core-side half, crisp pale / white-pink lens streaks; deeper toward the bank-side edge
    float hp = clamp(0.5 + lane5 * 0.5 + (br - 0.5) * 0.8, 0.0, 1.0);
    vec3 pk = mix(W5_PDEEP, W5_PBODY, smoothstep(0.1, 0.45, hp));
    float hl = exp(-pow((tb - 0.45) / 0.18, 2.0));
    pk = mix(pk, W5_PLIGHT, clamp(bglow * 0.6 + hl * 0.3, 0.0, 1.0));
    float pc = clamp(bcore + (sweep ? B5.z * 0.5 : 0.0), 0.0, 1.0);
    pk = mix(pk, W5_PPALE, pc * 0.75);
    pk = mix(pk, W5_PWHITE, pc * pc * 0.85);
    pk += vec3(0.9, 0.6, 0.9) * pc * pc * pc * 0.6;   // (it04) white-pink streak cores burn brighter
    pk = mix(pk, W5_PDEEP, smoothstep(-0.2, -0.85, tb) * 0.35);
    // hue ramp across each band edge (approved: pink -> violet -> periwinkle -> blue -> cyan over ≈40 px)
    vec3 c5;
    if (tb >= 0.0) {
      c5 = mix(pk, W5_VIN, smoothstep(0.8, 1.0, at));
      c5 = mix(c5, W5_VPERI, smoothstep(0.98, 1.1, at));
      c5 = mix(c5, W5_VBLUE, smoothstep(1.08, 1.2, at));
      c5 = mix(c5, cy, smoothstep(1.17, 1.35, at));
    } else {
      c5 = mix(pk, W5_VOUT, smoothstep(0.8, 1.0, at));
      c5 = mix(c5, sweep ? W5_VBLUE : W5_OBLUE, smoothstep(1.0, 1.15, at));
      c5 = mix(c5, sweep ? cy : ow, smoothstep(1.12, 1.3, at));
    }
    float pk5 = 1.0 - smoothstep(0.85, 1.25, at);   // pink weight (tints the highlights)
    // glossy lighting from the brushed height field: aqua / pink-white sun glints, the tunnel-end glitter path
    // (a faint SAME-hue Fresnel only: a whitish Fresnel turned the whole river pastel)
    float H5 = clamp(h5 * 0.7 + bcore * 0.3, 0.0, 1.0);
    #if defined(FLOWMAP05)
    // W11: the surface normal comes from the flow-advected ripple map (tangent frame: across the river / along it;
    // the map is stretched 26:1 along the river, so its downstream slope is that much flatter)
    vec3 Rw5 = normalize(cross(vTanW, N0));
    vec2 nr5 = (rp.rg - 0.5) * 2.0;
    vec3 N5 = normalize(N0 + (Rw5 * nr5.x + vTanW * (nr5.y * 0.04)) * 0.38);
    #elif defined(LOW_Q)
    vec3 N5 = normalize(N0 + 0.3 * vec3(H5 - 0.5, 0.0, br - 0.5));
    #else
    vec3 N5 = bumpNormal(vPosW, N0, H5 * 0.09 * (1.0 - smoothstep(0.1, 0.5, fws)));
    #endif
    float nv5 = clamp(dot(N5, V), 0.0, 1.0);
    vec3 R5 = reflect(-V, N5);
    #ifdef SILK05
    // W12: sun / glitter glints in the water's own saturated hue (approved highlights are saturated cyan or crisp white,
    // hardly ever the pastel in between); the crisp white comes from the streak cores and flares only
    vec3 glintC = mix(vec3(0.08, 1.05, 1.35), vec3(1.4, 0.55, 1.3), pk5);
    #else
    vec3 glintC = mix(vec3(0.5, 1.25, 1.3), vec3(1.35, 0.95, 1.35), pk5);
    #endif
    c5 = mix(c5, mix(W5_CBRIGHT, W5_PLIGHT, pk5), pow(1.0 - nv5, 3.0) * 0.05);
    c5 += glintC * pow(clamp(dot(N5, Hv), 0.0, 1.0), 90.0) * 0.6;
    float gl5 = pow(clamp(dot(R5, Lg), 0.0, 1.0), 90.0);
    c5 += glintC * gl5 * (smoothstep(0.6, 0.92, H5) * 0.5 + bcore * 0.6);
    #ifdef FLOWMAP05
    // the tunnel mirrored in the ripples: the Marble panorama (World Labs world built from the approved 05 image).
    // Only its bright part — ring lamps, wall streaks, the golden light at the end — is added, as glossy
    // highlights that travel with the ripples; the water keeps its own cyan / magenta body colour
    vec3 pd5 = uPanoRot * R5;
    vec2 puv5 = vec2(atan(pd5.z, pd5.x) * 0.15915494 + 0.5, asin(clamp(pd5.y, -1.0, 1.0)) * 0.31830989 + 0.5);
    vec3 pano5 = texture2D(uPano, puv5).rgb;
    float plum5 = max(pano5.r, max(pano5.g, pano5.b));
    float fres5 = 0.06 + 0.94 * pow(1.0 - nv5, 5.0);
    #ifdef SILK05
    // W12: the mirrored lamps keep the water's hue (glossy, not milky); only the brightest ones burn white
    vec3 reflHue5 = mix(W5_CAQUA, W5_PLIGHT, pk5) * plum5 * 1.35;
    c5 += mix(reflHue5, vec3(plum5), smoothstep(0.9, 1.0, plum5) * 0.6) * smoothstep(0.62, 0.97, plum5) * fres5 * uPanoK;
    // long smooth satin sheen along the crest of each broad swell (mid field), same hue as the water under it
    c5 = mix(c5, mix(mix(W5_CBRIGHT, W5_CAQUA, 0.5), W5_PLIGHT, pk5), silkHi * mid5 * 0.32);
    // LONG smooth glossy streaks (approved mid field: long white / white-pink streaks along the current on both the
    // cyan and the ribbons), lit in long lens-shaped segments
    // (W12 it03: lines of constant streamline coordinate X — parallel to the current by construction; it02 used noise
    // contours, which looped across the current like marbling) one line per lane, ≈2 px core + soft same-hue glow
    float kS5 = mid5 * (1.0 - smoothstep(0.3, 0.8, fws));
    vec2 sS5 = max(silk05Streak(X, v5, 2.2, 0.0, 0.4), silk05Streak(X, v5, 3.7, 5.3, 0.3) * 0.7) * kS5;
    c5 = mix(c5, mix(W5_CAQUA, W5_PLIGHT, pk5), sS5.y * 0.4);
    c5 += mix(vec3(1.4, 1.9, 2.0), vec3(2.0, 1.5, 2.0), pk5) * sS5.x * 1.1;
    #else
    c5 += mix(pano5, vec3(plum5), 0.55) * smoothstep(0.5, 0.95, plum5) * fres5 * uPanoK;
    #endif
    #endif
    #ifndef LOW_Q
    // long glossy flares carried by the current (approved mid field: elongated white star streaks along the flow)
    #ifdef SILK05
    // W12: one sparse set of longer flares (selective white highlights) instead of two dense sets
    float flA = flowGlint(vec2(X * 1.6, v5 * 0.12), 0.8, 48.0, 4.6, 0.0, uTime);
    #else
    float flA = flowGlint(vec2(X * 2.0, v5 * 0.15), 0.85, 34.0, 4.8, 0.0, uTime);
    flA = max(flA, 0.85 * flowGlint(vec2(X * 4.3 + 0.37, v5 * 0.31 + 2.1), 0.6, 18.0, 4.4, 0.0, uTime + 1.9));
    #endif
    // near: big flares lying across the flow on the swell crests + lens flares (white core, aqua glow)
    float flB = flowGlint(vec2(X * 1.6, v5 * 1.4 + 0.5 + 1.3 * sin(X * 4.1 + 0.6)), 0.8, 56.0, 5.0, 0.85, uTime + 2.7);
    // (it03) jagged lightning flares replace the flat lens pills (two cell sets so they never line up)
    // (it04) one row of cells per swell crest (cell centre on the crest line) so the flares sit ON the ∩ arcs
    // like the approved, smaller cells across (it03 drew only ≈2 bolts in the near field)
    float gC = (phN - 0.571) / 6.2832 + 0.5;
    vec2 bz = bolt05(vec2(X * 2.4 + 0.3 * sin(gC * 2.1), gC), 0.7, 64.0, 6.5, 4.17);
    #ifndef SILK05
    vec2 bz2 = bolt05(vec2(X * 1.1 + 0.41, v5 * 2.0 + 0.7 * sin(X * 4.7 + 2.2)), 0.3, 40.0, 4.0, 9.31);
    bz = max(bz, bz2 * 0.8);
    #endif
    float boltN = near5 * (1.0 - pk5);
    c5 = mix(c5, W5_CAQUA, clamp(bz.y * 0.55, 0.0, 1.0) * boltN);
    c5 += vec3(2.0, 2.3, 2.4) * bz.x * boltN;
    c5 += mix(vec3(1.7, 2.1, 2.2), vec3(2.2, 1.7, 2.2), pk5) * (flA * (1.0 - near5) * (1.0 - smoothstep(0.3, 0.8, fws))
        + flB * near5 * (0.5 + 0.8 * smoothstep(0.2, 0.8, crestN)));
    #endif
    col = mix(col, c5, sw);
  }
#else
  if (sw > 0.001) {
    float near5 = 1.0 - smoothstep(0.0075, 0.014, fws);
    float wq = q + 0.05 * sin(v5 * 0.23 + q * 4.0);           // slow braid of the flow lines
    // (it02) near the camera the coarse lanes fan out like sun rays: keep them subtle there
    float lane = SS.x * (1.0 - 0.65 * near5), dash = SS.y;
    // height field (shading + bump): broad lanes, the dashes as glossy ridges on top
    float H5 = clamp(0.5 + lane * 0.95 + dash * 0.15, 0.0, 1.0);
    // cyan: deep azure lanes -> saturated electric cyan -> bright cyan crests (it01 was pastel: mid cyan
    // median #2BB2FF vs ref #06A5F9)
    vec3 cy = mix(uC5Deep, uC5, smoothstep(0.12, 0.56, H5));
    cy = mix(cy, uC5Bright, smoothstep(0.66, 0.97, H5) * 0.45);
    // pink satin: deep magenta-violet on the outer (bank) edge -> hot pink -> lighter on the core side
    float relB = clamp(rel, -1.0, 1.0);
    // (it05: it04 pink lum p50 197 vs ref 175 → deeper base, less light satin)
    vec3 pk = mix(uP5Deep, uP5, smoothstep(-1.05, -0.2, relB) * (0.42 + 0.6 * H5));
    pk = mix(pk, uP5Light, clamp(smoothstep(0.15, 1.0, relB) * 0.28 + smoothstep(0.75, 0.98, H5) * 0.25, 0.0, 1.0));
    vec3 c5 = mix(cy, pk, pinkM);
    // where pink and cyan streaks interleave (brushed edges) the seam lightens to a glossy lavender-white
    // instead of going violet
    c5 += vec3(0.45, 0.5, 0.6) * pinkM * (1.0 - pinkM) * 0.9;
    // speed-streak dashes: light cyan / light pink glow, the strongest burning to white; on the pink they
    // gather toward the core side (ref 05: white-pink streaks along the inner edge of each band)
    // (it04) the lines are SATURATED light cyan / light pink (ref mid cyan median #06A5F9: no red), only the
    // strongest burn to white; fewer lines in the near field (ref: glossy deep blue + flares there)
    // (it06: the near wake sweeps keep their full streaks — ref 05 sweeps are combed with white-pink lines)
    float dk = dash * mix(1.0, 0.65 + 0.55 * smoothstep(-0.6, 0.9, relB), pinkM) * (1.0 - 0.4 * near5) * (1.0 + 0.9 * pW);
    c5 = mix(c5, mix(uC5Bright * 1.2, mix(uP5, uP5Light, 0.65) * 1.2, pinkM), clamp(smoothstep(0.08, 0.5, dk) * mix(0.65, 0.6, pinkM), 0.0, 1.0));
    c5 += mix(vec3(0.7, 0.95, 1.1), vec3(1.0, 0.8, 1.0), pinkM) * smoothstep(0.62, 1.0, dk) * 0.8;

    // glossy lighting from the same height field
    #ifdef LOW_Q
    vec3 N5 = normalize(N0 + 0.3 * vec3(H5 - 0.5, 0.0, dash - 0.25));
    #else
    vec3 N5 = bumpNormal(vPosW, N0, H5 * 0.09 * (1.0 - smoothstep(0.1, 0.5, fws)));
    #endif
    float nv5 = clamp(dot(N5, V), 0.0, 1.0);
    vec3 R5 = reflect(-V, N5);
    c5 = mix(c5, mix(uC5Bright, uP5Light, pinkM), pow(1.0 - nv5, 3.0) * mix(0.1, 0.16, pinkM));
    c5 += vec3(1.0) * pow(clamp(dot(N5, Hv), 0.0, 1.0), 90.0) * 1.1;
    float gl5 = pow(clamp(dot(R5, Lg), 0.0, 1.0), 90.0);
    c5 += mix(vec3(0.6, 1.2, 1.6), vec3(1.4, 0.7, 1.3), pinkM) * gl5 * (smoothstep(0.6, 0.92, H5) * 0.6 + dash * 0.7);

    // near field (right behind Benny, 1 u ≈ 160–280 px): thick glossy water — deeper azure lanes (ref near
    // p5 lum 120: deep cyan between the highlights), saturated cyan glow on the light lanes, sheen toward
    // the screen sides; Benny's contact itself stays clean cyan (no white band)
    if (near5 > 0.0) {
      float dlN = lat - uBenny.y;
      // (it02) it01 near median lum 181 vs ref 145: the whole near body is deeper, the light lanes saturated
      c5 *= 1.0 - near5 * (0.14 + 0.45 * smoothstep(0.02, -0.18, lane)) * (1.0 - pinkM);
      c5 += vec3(0.0, 0.3, 0.8) * smoothstep(0.06, 0.3, lane) * 0.4 * near5 * (1.0 - pinkM);
      c5 = mix(c5, mix(vec3(0.1, 1.0, 1.9), uP5Light, pinkM), near5 * 0.14 * smoothstep(0.8, 1.6, abs(dlN)) * (1.0 - pW));
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
    // (wave 8) all flares sit on the streak coordinate X, so they streak with the current on every bend
    // (it06: twice as many rows along the flow, longer arms — ref mid field glitters with flares)
    float flA = flowGlint(vec2(X * 2.0, v5 * 0.15), 0.8, 22.0, 3.8, 0.0, uTime);
    // near: big flares lying across the fanning flow (ref 05: ≈8–12 bright 80–150 px flares below Benny)
    // + a smaller set (rows bent by a smooth across-flow warp so they never line up)
    float flB = flowGlint(vec2(X * 1.6, v5 * 1.4 + 0.5 + 1.3 * sin(X * 4.1 + 0.6)), 0.9, 38.0, 4.5, 0.45, uTime + 2.7);
    flB = max(flB, flowGlint(vec2(X * 2.7 + 0.37, v5 * 2.1 + 1.6 * sin(X * 5.3 + 2.0)), 0.65, 22.0, 4.0, 0.35, uTime + 0.9) * 0.8);
    // many small twinkling 4-point stars, clustered on the light lanes
    float flC = flowGlint(vec2(X * 7.0, v5 * 4.5 + 0.3 + 1.7 * sin(X * 13.0 + 0.7)), 0.75, 7.0, 2.6, 0.6, uTime + 1.3);
    flC *= 0.5 + 1.6 * smoothstep(-0.1, 0.3, lane);
    // lens flares across the near water (thin white core, cyan glow)
    // (it06: it05 near p95 lum 203 vs ref 246 → bigger, brighter near flares)
    float lz = lensFlare(vec2(X * 1.8, v5 * 1.6 + 1.1 * sin(X * 3.3 + 1.0)), 0.85, 120.0, 7.0, uTime);
    lz = max(lz, 0.85 * lensFlare(vec2(X * 3.1 + 0.41, v5 * 2.3 + 1.4 * sin(X * 4.7 + 2.2)), 0.6, 60.0, 4.5, uTime + 1.7));
    c5 += mix(vec3(0.3, 1.3, 2.1), vec3(2.3, 2.5, 2.6), smoothstep(0.55, 1.0, lz)) * lz * near5 * (1.0 - pinkM) * 1.8;
    float flD = flowGlint(vec2(X * 5.3, v5 * 0.32 + 7.0), 0.55, 6.0, 2.4, 0.3, uTime + 4.1);
    // (the pink ribbons sparkle too, pink-white — ref 05 mid bands are full of bright glints)
    c5 += mix(vec3(1.9, 2.1, 2.3), vec3(2.3, 1.7, 2.2), pinkM) * (flA * (1.0 - near5) * (1.0 - smoothstep(0.3, 0.8, fws))
        + flB * near5 * (1.2 + 1.0 * smoothstep(-0.05, 0.15, lane)) + flC * near5 + flD * (1.0 - near5) * (1.0 - smoothstep(0.2, 0.5, fws)) * 0.9)
        * (1.0 - 0.2 * pinkM);
    #endif
    col = mix(col, c5, sw);
  }
#endif
  #ifdef FARW05
  // ---- W11 foam shelf (point bar) between the visible channel and the bank: soap-foam puffs (cells ≈0.6 u wide,
  // 4.5× longer along the river so they read round from the ride camera), lit from above, lavender / blue creases,
  // a scalloped bubbly waterline and a soft blue contact shadow on the water beside it ----
  {
    float sideW = lat > chC ? vHalfW - chC - hw : chC - hw + vHalfW;      // shelf width on this side (units)
    float shOn = smoothstep(0.08, 0.6, sideW);
    if (shOn > 0.0) {
      float eC = abs(lat - chC) - hw;                                       // > 0 on the shelf
      float sgn = lat > chC ? 1.0 : -1.0;
      float wl = (vnoise(vec2(s * 0.5, sgn * 7.0)) - 0.5) * 0.7;
      float e2 = eC + wl * min(1.0, sideW);
      float fl2 = fwidth(lat) + 1e-4;
      vec2 pc = vec2(lat * 1.6 + 1.7, s * 0.36);
      float c1 = cells(pc);
      float c1u = cells(pc + vec2(0.0, 0.16));
      float c2 = cells(vec2(lat * 4.6 + 5.3, s * 1.05));
      float f1 = 1.0 - smoothstep(0.1, 0.3, fl2 * 1.6), f2 = 1.0 - smoothstep(0.1, 0.3, fl2 * 4.6);
      #ifdef PUFF05
      // W12: where the puffs get too small, 2.4x larger mounds take over (round foam at every distance, no flat fill)
      vec2 pc0 = pc * 0.42 + 3.1;
      float c0 = cells(pc0), c0u = cells(pc0 + vec2(0.0, 0.16));
      c1 = mix(c0, c1, f1);
      c1u = mix(c0u, c1u, f1);
      f1 = max(f1, 1.0 - smoothstep(0.1, 0.3, fl2 * 0.67));
      #endif
      float shelf = smoothstep(-0.1, 0.08, e2 + (0.5 - c1) * 0.55 * f1) * shOn;   // the waterline bulges round each puff
      float dome = 1.0 - smoothstep(0.15, 0.78, c1);
      float lit = clamp((c1u - c1) * 3.2 + 0.55, 0.0, 1.0);                 // top of each puff catches the light
      vec3 fo = mix(uFoamLav * 0.7, uFoam * 1.14, mix(0.62, dome * (0.45 + 0.55 * lit) + 0.25 * lit, f1));
      fo = mix(fo, vec3(0.5, 0.56, 1.05), (1.0 - smoothstep(0.03, 0.2, c2)) * f2 * 0.22);
      #ifdef PUFF05
      // W12: a bubbly surface like the bank lace and the approved foam (white bubble centres, lavender-blue rims)
      // instead of a smooth snow-drift sheet
      float cb = cells(vec2(lat * 3.4 + 0.7, s * 0.8));
      float fb = 1.0 - smoothstep(0.1, 0.3, fl2 * 3.4);
      fo = mix(fo, mix(uFoam * 1.2, uFoamLav * 0.72, smoothstep(0.2, 0.8, cb)) * (0.8 + 0.3 * lit), fb * 0.7);
      #endif
      fo = mix(fo, vec3(0.36, 0.42, 0.98), (1.0 - smoothstep(0.0, 0.3, e2)) * 0.4);            // shaded waterline
      col = mix(col, col * vec3(0.55, 0.6, 0.9), (1.0 - smoothstep(0.0, 0.5, -e2)) * 0.5 * shOn * (1.0 - shelf));
      col = mix(col, fo, shelf);
    }
  }
  #endif
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
      // 05 (wave 7): no rings and no V lines — in the magnified near field they drew "∩" pool-ripple
      // arcs; the diagonal pink wake sweeps + fanning speed streaks carry the wake there instead
      rings *= 1.0 - sw;
      float bk = max(-dv, 0.0);
      float wakeV = exp(-abs(abs(du) - bk * 0.42 - rb * 0.95) * 6.0) * exp(-bk * 0.18) * step(dv, 0.0) * (1.0 - sw);
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
  #ifdef PROJ05
  {
    float pjK = 1.0 - vStyle.w;                    // the 05 weight (1 on 05, blended over the 04 / 06 joins)
    if (pjK > 0.001) {
      // exact-layer magnification: texels per screen pixel along the least dense direction
      vec4 Lm = pjLut(s);
      vec2 tp = vec2(0.5 + (u - Lm.y) / (2.0 * Lm.z), Lm.x) * uPjESize;
      // smallest singular value of the texel-per-pixel Jacobian (robust to the shear of the per-row u range)
      vec2 ja = dFdx(tp), jb = dFdy(tp);
      float mE = abs(ja.x * jb.y - ja.y * jb.x) / max(max(length(ja), length(jb)), 1e-5);
      if (uPjNear.x > 0.5) {
        // ?projnear05=1: the hand-over to the crisp tile must not follow the WAVES. The per-pixel Jacobian above swings
        // with every wave crest (slopes facing the camera stretch the texture, back slopes compress it), which made the
        // E -> tile hand-over flicker into horizontal stripes across the river once the tile no longer shows the same
        // picture as E. Instead: the camera follows Benny, so a point d units past the locked checkpoint needs about
        // the density the locked view had at the same distance from Benny (scripts/proj05-ride-probe.mjs). Ratio of
        // what E stores here to what the locked view stored there (both straight from the LUT), × E's 1.3 margin:
        // exactly 1.3 at the locked checkpoint, so the locked picture is unchanged.
        float rideD = uPjNear.z - uPjNear.w;
        float sr = max(s - rideD, uPjLutS.x + 0.31);
        vec4 a0 = pjLut(s - 0.3), a1 = pjLut(s + 0.3), b0 = pjLut(sr - 0.3), b1 = pjLut(sr + 0.3);
        float rS = (a1.x - a0.x) / max(b1.x - b0.x, 1e-6);
        float rU = pjLut(sr).z / max(Lm.z, 1e-3);
        // at the locked checkpoint the original per-pixel test stays in charge (exactly the approved locked picture);
        // from 0.5 to 2 u of riding on the wave-free test takes over
        mE = mix(mE, 1.3 * min(rS, rU), pjNearK());
      }
      // two-phase flow toward the camera: layer A peaks with zero offset at phase 0.5 (the frozen QA clock)
      float ph = fract(uTime * uPjFlow.y + uPjFlow.z);
      float D = uPjFlow.x * uPjFlow.w;
      float sA = s + D * (ph - 0.5);
      float sB = s + D * (fract(ph + 0.5) - 0.5);
      float uA = u, uB = u;
      if (uPjFlow2.x > 0.5) {
        // ?projflow05=2: slide along the approved streaks (the S-curves), not straight down the river — the pink
        // ribbons stay where they are painted, only what lies along them travels; foam banks and bubbles stay still
        vec2 fd = pjFlowDir(u, s, mE);
        float k = fd.y / sqrt(1.0 + fd.x * fd.x * uPjFlow2.z * uPjFlow2.z);     // same speed along any direction
        float oA = (sA - s) * k, oB = (sB - s) * k;
        sA = s + oA; uA = u + fd.x * oA;
        sB = s + oB; uB = u + fd.x * oB;
      }
      float wA = 1.0 - abs(2.0 * ph - 1.0);
      float wEA, wEB, wNA, wNB;
      vec3 tA = pjTarget(uA, sA, mE, wEA, wNA);
      vec3 tB = pjTarget(uB, sB, mE, wEB, wNB);
      vec3 tgt = mix(tB, tA, wA);
      float wEx = mix(wEB, wEA, wA);
      float wNx = mix(wNB, wNA, wA);
      float det = mix(pjDetail(uB, sB), pjDetail(uA, sA), wA);
      // ?projnear05=1: the crisp tile carries its own approved streaks — the detail layer stays on the near layer only
      float dW = 1.0 - wEx;
      float wT2m = pjNearK() * (1.0 - smoothstep(0.3, 0.55, mE));   // share of T2 in the tile
      dW *= 1.0 - (1.0 - wNx) * wT2m * (1.0 - uPjNear.y);
      tgt = clamp(tgt + det * uPjDS.z * dW, 0.0, 1.0);
      if (uPjFlow2.x > 0.5 && uPjFlow2.w < 0.999) {
        // keep a share of the approved picture exactly where it is painted (the layout never dissolves)
        float wE0, wN0;
        vec3 t0 = pjTarget(u, s, mE, wE0, wN0);
        float dW0 = 1.0 - wE0;
        dW0 *= 1.0 - (1.0 - wN0) * wT2m * (1.0 - uPjNear.y);
        t0 = clamp(t0 + pjDetail(u, s) * uPjDS.z * dW0, 0.0, 1.0);
        tgt = mix(t0, tgt, uPjFlow2.w);
      }
      if (uPjDbg > 0.5) tgt = mix(mix(vec3(0.9, 0.15, 0.1), vec3(0.15, 0.35, 0.95), wNx), vec3(0.15, 0.85, 0.2), wEx) * (0.55 + 0.45 * dot(tgt, vec3(0.33)));
      vec3 lin = pjInverse(tgt);
      #ifdef USE_FOG
      #ifdef FOG_EXP2
      float pjF = 1.0 - exp(-fogDensity * fogDensity * vFogDepth * vFogDepth);
      #else
      float pjF = smoothstep(fogNear, fogFar, vFogDepth);
      #endif
      float pjFd = pjF * (1.0 - wEx);              // the exact layer already carries the approved haze
      lin = (lin * (1.0 - pjFd) + fogColor * pjFd - fogColor * pjF) / max(1.0 - pjF, 0.05);
      #endif
      col = mix(col, lin, pjK);
    }
  }
  #endif
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
  /** `?proj05=1`: resolves when the projection textures are loaded (undefined otherwise) */
  ready?: Promise<void>;
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
  const chan = FARW05 ? new Float32Array(n * 2) : null;
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
    const cl = coreLateral(course, s) + coreShiftW10(course, s);
    const ch = chan ? channel05(course, s) : null;
    const put =(u: number, lateral: number, h: number, isSkirt: number, nn: THREE.Vector3) => {
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
      if (chan && ch) { chan[k * 2] = ch.c; chan[k * 2 + 1] = ch.hw; }
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
  if (chan) geo.setAttribute('aChan', new THREE.BufferAttribute(chan, 2));
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
  if (FLOWMAP05) {
    // W11: textures / shared uniforms are attached AFTER the merge above (UniformsUtils.merge would clone them)
    const f5 = flow05Textures(course);
    const u5 = uniforms as Record<string, THREE.IUniform>;
    u5.uTime = flow05Shared.uTime;                       // the far river (environment.ts) runs on the same clock
    u5.uFlowMap = { value: f5.flowMap };
    u5.uRipple = { value: f5.ripple };
    u5.uFlowS = { value: f5.sRange };
    u5.uPano = flow05Shared.uPano;
    u5.uPanoRot = flow05Shared.uPanoRot;
    const pk = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('panok') : null;   // QA: ?panok=0 isolates the reflection
    u5.uPanoK = { value: pk !== null && isFinite(+pk) ? +pk : 0.9 };
  }
  const proj = PROJ05 ? attachProj05(uniforms as Record<string, THREE.IUniform>) : undefined;
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: VERT,
    fragmentShader: FRAG,
    fog: true,
    side: THREE.DoubleSide,
    defines: { ...(quality === 'low' ? { LOW_Q: 1 } : {}), ...(WATER05 ? { WATER05: 1 } : {}), ...(FARW05 ? { FARW05: 1 } : {}), ...(FLOWMAP05 ? { FLOWMAP05: 1 } : {}), ...(SILK05 ? { SILK05: 1 } : {}), ...(PUFF05 ? { PUFF05: 1 } : {}), ...(PROJ05 ? { PROJ05: 1 } : {}) },
  });
  const mesh = new THREE.Mesh(geo, mat);
  if (proj) mesh.onBeforeRender = proj.onBeforeRender;
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
    ready: proj?.ready,
  };
}

/** `?proj05=1`: uniforms + GLSL for the far river block (materials.ts farRiverMaterial) — its baked layer proj05_F.png */
export function proj05Far() {
  const u: Record<string, THREE.IUniform> = {
    uPjF: { value: null }, uPjFZ: { value: 400 },
    uPjPost: { value: new THREE.Vector4(0.86, 1.36, 1.15, 0.18) }, uPjRes: { value: new THREE.Vector2(864, 1536) },
  };
  proj05Pending.push(new Promise<void>((res) => {
    const tex = new THREE.TextureLoader().load(new URL('../../assets/textures/water05/proj05_F.png', import.meta.url).href, (t) => {
      t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true;
      res();
    }, undefined, () => res());
    tex.flipY = false;
    u.uPjF.value = tex;
  }));
  proj05Pending.push(fetch(new URL('../../assets/textures/water05/proj05_lut.json', import.meta.url).href).then((r) => r.json()).then((l) => { u.uPjFZ.value = l.F.zmax; }).catch(() => {}));
  const size = new THREE.Vector2();
  const onBeforeRender = (renderer: THREE.WebGLRenderer) => {
    const rt = renderer.getRenderTarget();
    if (rt) size.set(rt.width, rt.height); else renderer.getDrawingBufferSize(size);
    (u.uPjRes.value as THREE.Vector2).copy(size);
    (u.uPjPost.value as THREE.Vector4).x = renderer.toneMappingExposure;
  };
  const pars = 'uniform sampler2D uPjF; uniform float uPjFZ; uniform vec4 uPjPost; uniform vec2 uPjRes;\n' + PROJ05_INVERSE;
  const apply = 'col = mix(col, pjInverse(texture2D(uPjF, vec2(vRivUv.x, log(1.0 + max(vRivB.w, 0.0)) / log(1.0 + uPjFZ))).rgb), texture2D(uPjF, vec2(vRivUv.x, log(1.0 + max(vRivB.w, 0.0)) / log(1.0 + uPjFZ))).a);';
  return { uniforms: u, pars, apply, onBeforeRender };
}

/** `?proj05=1`: the baked approved-water layers (assets/textures/water05/, tools/proj05/bake.py) + live post values */
function attachProj05(u: Record<string, THREE.IUniform>) {
  const qs = typeof location !== 'undefined' ? new URLSearchParams(location.search) : new URLSearchParams();
  const qn = (k: string, d: number) => { const v = qs.get(k); return v !== null && v !== '' && isFinite(+v) ? +v : d; };
  const urls = {
    E: new URL('../../assets/textures/water05/proj05_E.png', import.meta.url).href,
    N: new URL('../../assets/textures/water05/proj05_N.png', import.meta.url).href,
    T: new URL('../../assets/textures/water05/proj05_T.png', import.meta.url).href,
    D: new URL('../../assets/textures/water05/proj05_D.png', import.meta.url).href,
    lut: new URL('../../assets/textures/water05/proj05_lut.json', import.meta.url).href,
  };
  const empty = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1);
  empty.needsUpdate = true;
  for (const k of ['uPjE', 'uPjN', 'uPjT', 'uPjD', 'uPjLut']) u[k] = { value: empty };
  u.uPjLutS = { value: new THREE.Vector4(0, 1, 1, 0) };
  u.uPjESize = { value: new THREE.Vector2(1, 1) };
  u.uPjNS = { value: new THREE.Vector2(0, 1) };
  u.uPjTS = { value: new THREE.Vector2(0, 1) };
  u.uPjDS = { value: new THREE.Vector4(1, 1, qn('projdetail05', 0.9), 0) };
  // flow toward the camera: distance (s units) per cycle, cycles / s; phase chosen so the frozen QA clock (t = 12)
  // shows layer A alone at zero offset (the locked comparison is the static bake)
  const rate = qn('projrate05', 0.55);
  // `&projflow05=2` (2026-11-16, tools/proj05/flow_bake.py): the same two-phase flow, but each phase slides ALONG the
  // approved streaks (flow map proj05_WN / proj05_WT) instead of straight down the river, foam banks and bubbles stay
  // still, and `projflowmix05` (share of the picture that travels; default 0.5, 1 = all) keeps the rest of the approved
  // picture fixed where it is painted — measured (qa/pilot05/proj/flow2/NOTES.md): similarity to the unflowed design
  // over a cycle 0.72 (old flow) -> 0.93, never below 0.90; direction toward the camera in every tracked frame pair.
  const FLOW2 = qs.get('projflow05') === '2';
  u.uPjFlow = { value: new THREE.Vector4(qn('projflowd05', 1.6), rate, 0.5 - ((12 * rate) % 1), qs.get('projflow05') === '0' ? 0 : 1) };
  u.uPjWN = { value: empty }; u.uPjWT = { value: empty };
  u.uPjFlow2 = { value: new THREE.Vector4(0, 2, 4.8, THREE.MathUtils.clamp(qn('projflowmix05', 0.5), 0, 1)) };
  u.uPjPost = { value: new THREE.Vector4(0.86, 1.36, 1.15, 0.18) };
  u.uPjRes = { value: new THREE.Vector2(864, 1536) };
  u.uPjDbg = { value: qs.get('projdbg05') === '1' ? 1 : 0 };
  // `&projnear05=1` (2026-11-16, tools/proj05/near_bake.py, qa/pilot05/proj/near/NOTES.md): while riding, the near
  // river used the 24-texel near / tile layers (pastel smear 8–17 u into the ride); this adds the HIGH-RESOLUTION near
  // tile T2 (the nearest approved water of the locked view, ≈110 texels per unit, bubbles removed, mirrored repeat +
  // mipmaps) in its own sampler uPjT2 with its flow map uPjWT2. Within 0.5 u of the locked checkpoint nothing changes
  // (pixel-identical locked picture). `projneardetail05` = share of the fine-streak detail layer kept on T2: default 1
  // (measured on ride frames at 8 / 17 / 35 u: 0 left the stretch where the tile's source is soft — 8 u — softer than
  // before; 1 is sharper than before in every band and showed no grain; 0 and 0.5 stay available for comparison).
  const NEAR = qs.get('projnear05') === '1';
  u.uPjNear = { value: new THREE.Vector4(0, THREE.MathUtils.clamp(qn('projneardetail05', 1), 0, 1), 0, 0) };
  u.uPjT2 = { value: empty }; u.uPjWT2 = { value: empty };
  u.uPjT2S = { value: new THREE.Vector2(0, 1) };
  const loader = new THREE.TextureLoader();
  const load = (url: string, mip: boolean, repeat: boolean) =>
    new Promise<THREE.Texture>((res, rej) =>
      loader.load(url, (t) => {
        t.flipY = false;
        t.colorSpace = THREE.NoColorSpace;          // the texels ARE display values: the shader undoes the post chain
        t.generateMipmaps = mip;
        t.minFilter = mip ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.wrapS = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
        t.wrapT = repeat ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
        if (mip) t.anisotropy = 4;
        t.needsUpdate = true;
        res(t);
      }, undefined, rej));
  const tile = (url: string) => load(url, false, false).then((t) => { t.wrapT = THREE.RepeatWrapping; return t; });
  const ready = Promise.all([
    load(urls.E, false, false), load(urls.N, false, false), tile(urls.T), load(urls.D, true, true),
    fetch(urls.lut).then((r) => r.json()),
  ]).then(([E, N, T, D, lut]) => {
    u.uPjE.value = E; u.uPjN.value = N; u.uPjT.value = T; u.uPjD.value = D;
    const n = lut.E.n as number;
    const data = new Float32Array(n * 4);
    for (let i = 0; i < n; i++) { data[i * 4] = lut.E.V[i]; data[i * 4 + 1] = lut.E.c[i]; data[i * 4 + 2] = lut.E.w[i]; data[i * 4 + 3] = 1; }
    const L = new THREE.DataTexture(data, n, 1, THREE.RGBAFormat, THREE.FloatType);
    L.minFilter = L.magFilter = THREE.NearestFilter;
    L.needsUpdate = true;
    u.uPjLut.value = L;
    (u.uPjLutS.value as THREE.Vector4).set(lut.E.s0, lut.E.s1, n, 0);
    (u.uPjESize.value as THREE.Vector2).set(lut.E.width, lut.E.height);
    (u.uPjNS.value as THREE.Vector2).set(lut.N.s0, lut.N.s1);
    (u.uPjTS.value as THREE.Vector2).set(lut.T.a, lut.T.L);
    const ds = u.uPjDS.value as THREE.Vector4;
    ds.x = lut.D.u1 - lut.D.u0; ds.y = lut.D.s1 - lut.D.s0;
  }).then(() => {
    if (!NEAR) return undefined;
    const mirrored = (t: THREE.Texture) => { t.wrapT = THREE.MirroredRepeatWrapping; t.needsUpdate = true; return t; };
    return Promise.all([
      load(new URL('../../assets/textures/water05/proj05_T2.png', import.meta.url).href, true, false).then(mirrored),
      fetch(new URL('../../assets/textures/water05/proj05_near.json', import.meta.url).href).then((r) => r.json()),
    ]).then(([T2, near]) => {
      u.uPjT2.value = T2;
      (u.uPjT2S.value as THREE.Vector2).set(near.T2.a, near.T2.L);
      const nv = u.uPjNear.value as THREE.Vector4;
      nv.x = 1; nv.w = near.locked_focus_s;
    });
  }).then(() => {
    if (!FLOW2) return undefined;
    return Promise.all([
      load(new URL('../../assets/textures/water05/proj05_WN.png', import.meta.url).href, false, false),
      tile(new URL('../../assets/textures/water05/proj05_WT.png', import.meta.url).href),
      fetch(new URL('../../assets/textures/water05/proj05_flow.json', import.meta.url).href).then((r) => r.json()),
      NEAR
        ? load(new URL('../../assets/textures/water05/proj05_WT2.png', import.meta.url).href, false, false).then((t) => { t.wrapT = THREE.MirroredRepeatWrapping; return t; })
        : Promise.resolve(empty),
    ]).then(([WN, WT, meta, WT2]) => {
      u.uPjWN.value = WN; u.uPjWT.value = WT; u.uPjWT2.value = WT2;
      const f2 = u.uPjFlow2.value as THREE.Vector4;
      f2.x = 1; f2.y = meta.scale; f2.z = meta.half_width_u;
    });
  }).catch((e) => { console.error('[rainbow] proj05 textures failed', e); });
  const size = new THREE.Vector2();
  const onBeforeRender = (renderer: THREE.WebGLRenderer) => {
    const rt = renderer.getRenderTarget();
    if (rt) size.set(rt.width, rt.height); else renderer.getDrawingBufferSize(size);
    (u.uPjRes.value as THREE.Vector2).copy(size);
    (u.uPjPost.value as THREE.Vector4).x = renderer.toneMappingExposure;
  };
  return { ready, onBeforeRender };
}
