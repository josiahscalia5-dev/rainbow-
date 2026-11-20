/**
 * r30 water06 `&w30=1` (qa/match/06/r30/water06/NOTES.md; needs `match06=1&m06geo=1&m06flow=1`): the Screen 06 river WHILE Benny swims
 * as the rainbow water of the approved picture (references/06_crest_the_rinse_arch.png) and the r30 storyboard
 * (docs/briefs/2026-11-20-r30/USER_S06_STORYBOARD_R30.png) instead of the long cyan / pink / white speed streaks of the stretched painted
 * strip (tile_river6.png, 5x stretch):
 *   * bright cyan-turquoise slide (colours measured from the approved lower water), deeper azure toward the sides
 *   * iridescent RAINBOW bands along both outer edges: cyan -> mint -> yellow -> peach -> pink -> magenta at the foam (the approved
 *     picture's right-hand band, measured across it), breathing slowly along the river, shifting a little with the view angle
 *   * a fine network of sparkly white "electric" veins: ONE tileable texture (tile_w30veins.png, tools/match06/w30_make_veins.py:
 *     R jagged veins, G branching caustic net, B star glints) read twice at two scales / speeds, flickering like current, with
 *     twinkling glints; white-cyan on the water, pink-white on the magenta bands
 *   * soft swirl / ring ripples spreading outward round Benny (one-armed spiral rings, uBen from `&m06rip=1`)
 * Everything is world-anchored on the river's own coordinates (lateral l x course s, i.e. it follows the route spline) and flows
 * downstream (+s, with Benny) at `w30f` u/s, so while swimming it streams toward the camera. Mobile cost: 2 texture reads + ~60 ALU.
 * The approved START view is unchanged: the new water fades in over camera distance `w30st=a,b` from the approved viewpoint (the floor
 * there shows the projected approved picture anyway). Without `w30=1` nothing here runs: the define W30 is unset and the GLSL below
 * is stripped by the preprocessor, so every existing query renders exactly as before.
 *
 * Switches (all optional, with `w30=1`): `w30f` flow speed u/s (2.2) · `w30v` vein strength (1) · `w30rb` rainbow-band strength (1) ·
 * `w30sp` glint strength (1) · `w30t=a,b` vein tile size across, along (u; 2.2,3.8) · `w30rip` ripple strength (0.55) ·
 * `w30old` share of the old painted streak strip kept (0) · `w30st=a,b` start hand-over (0.02,0.6) · `w30e` the pink side starts at
 * |l|/Wc (0.62) · `w30rk` how strongly the rainbow strip between cyan and pink shows where it appears (0.8)
 */
import * as THREE from 'three';

/** inserted into match06.ts FRAG before main(); only compiled where the material defines W30 */
export const W30_GLSL = /* glsl */ `
#ifdef W30
uniform sampler2D uW30T;
uniform vec4 uW30A; // flow speed (u/s), vein strength, rainbow strength, glint strength
uniform vec4 uW30B; // vein tile across (u), along (u), ripple strength, share of the old painted strip kept
uniform vec4 uW30C; // start hand-over a..b (camera distance from the approved viewpoint), pink side starts at |l|/Wc, rainbow strip max
// display-space colour across the slide, x = |lateral| / Wc remapped so that 0.5 = where the pink side starts (w30e), 1 = the foam.
// Measured on the storyboard panels (panel 3 rows under Benny) and the approved picture: azure core (5,150,240) lit by bright cyan
// glows (100,225,252) -> blue-violet -> saturated magenta (245,65,235) -> hot pink (252,150,252) -> lavender pink at the bank.
// k = how much of the iridescent RAINBOW strip shows between the cyan and the pink (the approved right-hand band measured across
// it: cyan, mint, yellow, peach, pink, magenta); it comes and goes along the river, independently on each side
vec3 w30Lat(float x, float k, float lit) {
  vec3 c = mix(vec3(0.06, 0.46, 0.95), vec3(0.16, 0.86, 1.0), lit);   // core: deep azure .. bright cyan (volume)
  c = mix(c, vec3(0.12, 0.40, 0.96), smoothstep(0.26, 0.40, x) * (1.0 - 0.5 * lit));
  // (pinks set deeper than measured: the bloom of the bright foam lifts them by ~60 levels in green)
  vec3 p = mix(c, vec3(0.36, 0.34, 0.97), smoothstep(0.36, 0.47, x));
  p = mix(p, vec3(0.86, 0.07, 0.82), smoothstep(0.48, 0.58, x));
  p = mix(p, vec3(0.97, 0.26, 0.88), smoothstep(0.64, 0.78, x));
  p = mix(p, vec3(0.64, 0.42, 0.98), smoothstep(0.85, 0.97, x));
  vec3 r = mix(c, vec3(0.06, 0.86, 0.99), smoothstep(0.36, 0.42, x));
  r = mix(r, vec3(0.42, 0.95, 0.66), smoothstep(0.42, 0.47, x));
  r = mix(r, vec3(0.99, 0.93, 0.48), smoothstep(0.47, 0.52, x));
  r = mix(r, vec3(1.0, 0.64, 0.52), smoothstep(0.52, 0.57, x));
  r = mix(r, vec3(0.95, 0.24, 0.84), smoothstep(0.57, 0.63, x));
  r = mix(r, p, smoothstep(0.63, 0.72, x));
  return mix(p, r, k);
}
vec3 w30Water(vec3 old, vec2 ls, float wc, float t, float dAp, float fres) {
  float u = ls.x / wc, sd = u < 0.0 ? -1.0 : 1.0;
  float sf = ls.y - t * uW30A.x; // anchored to the river, flowing downstream (+s): every pattern below streams with the water
  // soft, broad light / deep zones (the vein tile read heavily blurred, mip-biased): volume without any thin scratch lines
  float body = texture2D(uW30T, vec2(ls.x / 1.6 + 0.37, sf / 4.5 + 0.11), 3.0).r;
  float body2 = texture2D(uW30T, vec2(ls.x / 2.3 + 0.71, sf / 6.0 + 0.53), 3.5).g;
  float lit = smoothstep(0.08, 0.42, body * 0.8 + body2 * 0.6);
  // the colour bands follow the river but meander and swirl with the flow (flowing curves, not parallel stripes)
  float mu = 0.11 * sin(sf * 0.23 + sd * 0.9) + 0.06 * sin(sf * 0.61 + 1.1) + 0.12 * (body - 0.15);
  float x0 = clamp(abs(u) + sd * mu * (1.0 - abs(u)) * 1.4, 0.0, 1.0);
  float pe = clamp(uW30C.z, 0.2, 0.8);
  float x = x0 < pe ? 0.5 * x0 / pe : 0.5 + 0.5 * (x0 - pe) / (1.0 - pe);
  float rk = smoothstep(0.05, 0.85, sin(sf * 0.13 + sd * 2.3) + 0.6 * sin(sf * 0.37 + 0.7 + sd)) * clamp(uW30A.z, 0.0, 1.0) * uW30C.w;
  vec3 col = w30Lat(x, rk, lit);
  float pinkS = smoothstep(0.46, 0.60, x);
  // volume: brighter crown, slightly deeper just inside the banks
  col += vec3(0.06, 0.08, 0.04) * (1.0 - smoothstep(0.0, 0.30, x));
  col *= 1.0 - 0.10 * smoothstep(0.88, 1.0, x);
  // silky light lines on the pink sides (the painting's curved pink-white flow lines): soft, curving with the water, broken up
  float wv = x0 + 0.05 * sin(sf * 0.47 + sd * 1.7) + 0.035 * sin(sf * 1.13 + 0.4) + 0.05 * body2;
  // (thin lines fade out with distance before they would alias; a broader glossy crest line along the pink stays)
  float dist = distance(cameraPosition, vW);
  float silk = smoothstep(0.45, 1.0, sin(wv * 34.0)) * (0.35 + 0.65 * smoothstep(0.05, 0.45, body + 0.5 * body2)) * (1.0 - smoothstep(7.0, 16.0, dist));
  float crest = exp(-pow((wv - 0.80) / 0.045, 2.0)) * smoothstep(0.0, 0.35, body2 + 0.3 * body);
  // the pink sides breathe between deep magenta and a lighter glowing pink along the flow (no flat neon band)
  col = mix(col, vec3(0.99, 0.48, 0.95), 0.45 * smoothstep(0.15, 0.55, body2 + 0.4 * sin(sf * 0.29 + sd * 1.3)) * pinkS * smoothstep(0.62, 0.8, x));
  col = mix(col, vec3(1.0, 0.70, 0.98), clamp(silk * 0.8 + crest * 0.6, 0.0, 1.0) * pinkS * (1.0 - 0.6 * rk));
  // electric veins: crisp sparse white lightning (R) + branching crackle net (G) from two reads at different scale / speed,
  // flickering like current; a soft cyan glow round them; white-cyan on the water, pink-white on the pink sides
  vec2 q1 = vec2(ls.x / uW30B.x, sf / uW30B.y);
  vec2 q2 = vec2(ls.x / (uW30B.x * 0.62) + 0.31 + 0.04 * sin(sf * 0.35), (ls.y - t * uW30A.x * 1.4) / (uW30B.y * 0.68) + 0.57);
  vec3 a = texture2D(uW30T, q1).rgb;
  vec3 b = texture2D(uW30T, q2).rgb;
  float fl = 0.72 + 0.28 * sin(t * 5.3 + sf * 1.7 + ls.x * 0.9);
  float glow = smoothstep(0.10, 0.55, max(a.r * fl, b.g)) * uW30A.y;
  float vein = clamp(max(smoothstep(0.60, 0.92, a.r * fl), 0.85 * smoothstep(0.50, 0.88, b.g)) * uW30A.y, 0.0, 1.0);
  vec3 vc = mix(vec3(0.86, 1.0, 1.0), vec3(1.0, 0.84, 0.99), pinkS);
  col = mix(col, vec3(0.32, 0.92, 1.0), glow * 0.45 * (1.0 - pinkS));
  col = mix(col, vc, vein * (1.0 - 0.45 * pinkS));
  // reflective highlights: soft white sheen patches drifting with the flow + the grazing-angle reflection far ahead
  float sh = sin(sf * 0.31 + u * 2.2 + 0.7) * sin(sf * 0.13 - u * 1.1 + 0.4);
  col += vec3(0.85, 0.95, 1.0) * 0.20 * pow(max(sh, 0.0), 3.0) * (0.5 + body);
  col += fres * 0.16 * vec3(0.9, 0.88, 1.0);
  // star glints twinkling on the veins
  float gl = max(a.b, b.b * 0.8) * (0.35 + 0.65 * pow(0.5 + 0.5 * sin(t * 8.0 + ls.x * 6.1 + sf * 2.3), 3.0));
  col += vec3(0.85, 0.97, 1.0) * gl * uW30A.w;
  // soft swirl / ring ripples spreading outward round Benny (uBen = lateral, s; one-armed spiral = swirl)
  vec2 dB = ls - uBen;
  float d = length(dB);
  if (uW30B.z > 0.0 && d < 2.6) {
    float ph = d * 6.2831853 / 0.42 - t * 3.2 + atan(dB.y, dB.x);
    float rg = pow(0.5 + 0.5 * cos(ph), 5.0) * smoothstep(2.6, 0.9, d) * smoothstep(0.45, 0.8, d);
    col = mix(col, vec3(0.86, 1.0, 1.0), rg * uW30B.z);
  }
  col = mix(col, old, uW30B.w);
  return mix(old, clamp(col, 0.0, 1.0), smoothstep(uW30C.x, uW30C.y, dAp));
}
#endif
`;

const num = (qs: URLSearchParams | null, k: string, d: number) => { const v = qs?.get(k); return v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v)) ? Number(v) : d; };
const pair = (qs: URLSearchParams | null, k: string, d: [number, number]): [number, number] => {
  const p = (qs?.get(k) ?? '').split(',').map(Number);
  return p.length === 2 && p.every(Number.isFinite) ? [p[0], p[1]] : d;
};

/** `&w30=1`: switch the river floor material (m06_floor and the m06leg ribbon share it) to the r30 rainbow water. Returns whether on. */
export async function setupW30(mat: THREE.ShaderMaterial, qs: URLSearchParams | null, flow: boolean): Promise<boolean> {
  if (qs?.get('w30') !== '1' || !flow) return false;
  const t = await new THREE.TextureLoader().loadAsync(new URL('../../assets/textures/match06/tile_w30veins.png', import.meta.url).href);
  t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  const [ta, tb] = pair(qs, 'w30t', [2.2, 3.8]), [sa, sb] = pair(qs, 'w30st', [0.02, 0.6]), ea = num(qs, 'w30e', 0.62), eb = num(qs, 'w30rk', 0.8);
  Object.assign(mat.uniforms, {
    uW30T: { value: t },
    uW30A: { value: new THREE.Vector4(num(qs, 'w30f', 2.2), num(qs, 'w30v', 1), num(qs, 'w30rb', 1), num(qs, 'w30sp', 1)) },
    uW30B: { value: new THREE.Vector4(ta, tb, num(qs, 'w30rip', 0.55), num(qs, 'w30old', 0)) },
    uW30C: { value: new THREE.Vector4(sa, sb, ea, eb) },
  });
  mat.defines = { ...(mat.defines ?? {}), W30: '' };
  mat.needsUpdate = true;
  console.info('[match06] w30 rainbow water', { tile: [ta, tb], start: [sa, sb], pink: ea, rainbow: eb });
  return true;
}
