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
 * `w30old` share of the old painted streak strip kept (0) · `w30st=a,b` start hand-over (0.02,0.6) · `w30e=a,b` rainbow band from
 * |l|/Wc = a to b (0.36,1.0)
 */
import * as THREE from 'three';

/** inserted into match06.ts FRAG before main(); only compiled where the material defines W30 */
export const W30_GLSL = /* glsl */ `
#ifdef W30
uniform sampler2D uW30T;
uniform vec4 uW30A; // flow speed (u/s), vein strength, rainbow strength, glint strength
uniform vec4 uW30B; // vein tile across (u), along (u), ripple strength, share of the old painted strip kept
uniform vec4 uW30C; // start hand-over a..b (camera distance from the approved viewpoint), rainbow band inner / outer edge (|l| / Wc)
// display-space colour across the slide, x = |lateral| / Wc (0 centre .. 1 at the foam), read from the storyboard panels and the approved
// picture: bright cyan centre -> azure -> blue-violet -> magenta -> hot pink -> lilac-pink at the bank. k = how much of the iridescent
// RAINBOW strip shows in the edge band (the approved right-hand band measured across it: cyan, mint, yellow, peach, pink, magenta)
vec3 w30Lat(float x, float k) {
  vec3 c = vec3(0.14, 0.85, 1.0);
  c = mix(c, vec3(0.02, 0.74, 0.99), smoothstep(0.05, 0.28, x));
  c = mix(c, vec3(0.03, 0.53, 0.95), smoothstep(0.28, 0.44, x));
  vec3 p = mix(c, vec3(0.45, 0.36, 0.97), smoothstep(0.44, 0.56, x));
  p = mix(p, vec3(0.92, 0.27, 0.90), smoothstep(0.54, 0.68, x));
  p = mix(p, vec3(0.99, 0.45, 0.88), smoothstep(0.68, 0.82, x));
  p = mix(p, vec3(0.96, 0.62, 0.95), smoothstep(0.82, 0.93, x));
  p = mix(p, vec3(0.90, 0.32, 0.92), smoothstep(0.93, 1.0, x));
  vec3 r = mix(c, vec3(0.05, 0.84, 0.99), smoothstep(0.40, 0.50, x));
  r = mix(r, vec3(0.45, 0.93, 0.80), smoothstep(0.50, 0.58, x));
  r = mix(r, vec3(0.98, 0.93, 0.55), smoothstep(0.58, 0.66, x));
  r = mix(r, vec3(0.99, 0.70, 0.62), smoothstep(0.66, 0.74, x));
  r = mix(r, vec3(0.98, 0.42, 0.86), smoothstep(0.74, 0.84, x));
  r = mix(r, vec3(0.92, 0.26, 0.90), smoothstep(0.84, 0.97, x));
  return mix(p, r, k);
}
vec3 w30Water(vec3 old, vec2 ls, float wc, float t, float dAp, float fres) {
  float u = ls.x / wc, sd = u < 0.0 ? -1.0 : 1.0;
  float sf = ls.y - t * uW30A.x; // anchored to the river, flowing downstream (+s)
  // soft, broad flow lines (the vein tile read blurred = mip-biased, long along the flow): they bend the colour bands and give the
  // body light / deep zones (volume) without any thin scratch lines
  float body = texture2D(uW30T, vec2(ls.x / 1.3 + 0.37, sf / 7.5 + 0.11), 2.5).r;
  // the colour bands follow the river but meander gently and drift with the flow (flowing curves, not parallel stripes)
  float mu = 0.09 * sin(ls.y * 0.17 + t * 0.35) + 0.05 * sin(ls.y * 0.43 + 1.1) + 0.10 * (body - 0.15);
  float x = abs(u + mu * (1.0 - 0.5 * abs(u)));
  float rk = smoothstep(-0.3, 0.6, sin(ls.y * 0.11 + sd * 2.3) + 0.5 * sin(ls.y * 0.29 + 0.7)) * clamp(uW30A.z, 0.0, 1.0);
  float ew = mix(1.0, (x - uW30C.z) / max(uW30C.w - uW30C.z, 1e-3), step(0.0, uW30C.w)); // band placement (w30e)
  vec3 col = w30Lat(clamp(uW30C.z + ew * (1.0 - uW30C.z) * step(uW30C.z, x) + x * step(x, uW30C.z) - uW30C.z * step(uW30C.z, x) * 0.0, 0.0, 1.0), rk);
  col *= 0.86 + 0.32 * smoothstep(0.02, 0.4, body);
  // volume: brighter crown, slightly deeper just inside the banks
  col += vec3(0.10, 0.10, 0.06) * (1.0 - smoothstep(0.0, 0.35, x));
  col *= 1.0 - 0.10 * smoothstep(0.86, 1.0, x);
  // electric veins: crisp sparse white lightning (R) + branching crackle net (G) from two reads at different scale / speed,
  // flickering like current; a soft glow round them; white-cyan on the water, pink-white on the pink bands
  vec2 q1 = vec2(ls.x / uW30B.x, sf / uW30B.y);
  vec2 q2 = vec2(ls.x / (uW30B.x * 0.62) + 0.31 + 0.04 * sin(sf * 0.35), (ls.y - t * uW30A.x * 1.4) / (uW30B.y * 0.68) + 0.57);
  vec3 a = texture2D(uW30T, q1).rgb;
  vec3 b = texture2D(uW30T, q2).rgb;
  float fl = 0.72 + 0.28 * sin(t * 5.3 + sf * 1.7 + ls.x * 0.9);
  float glow = smoothstep(0.10, 0.55, max(a.r * fl, b.g)) * uW30A.y;
  float vein = clamp(max(smoothstep(0.60, 0.92, a.r * fl), 0.85 * smoothstep(0.50, 0.88, b.g)) * uW30A.y, 0.0, 1.0);
  float pinkS = smoothstep(0.55, 0.75, x) * (1.0 - rk * 0.5);
  vec3 vc = mix(vec3(0.84, 1.0, 1.0), vec3(1.0, 0.80, 0.98), pinkS);
  col = mix(col, mix(col, vec3(0.30, 0.92, 1.0), 1.0 - pinkS) + vec3(0.12) * pinkS, glow * 0.45);
  col = mix(col, vc, vein);
  // reflective highlights: soft white sheen patches drifting with the flow + the grazing-angle reflection far ahead
  float sh = sin(sf * 0.31 + u * 2.2 + 0.7) * sin(sf * 0.13 - u * 1.1 + 0.4);
  col += vec3(0.85, 0.95, 1.0) * 0.22 * pow(max(sh, 0.0), 3.0) * (0.5 + body);
  col += fres * 0.18 * vec3(0.9, 0.88, 1.0);
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
  const [ta, tb] = pair(qs, 'w30t', [2.2, 3.8]), [sa, sb] = pair(qs, 'w30st', [0.02, 0.6]), [ea, eb] = pair(qs, 'w30e', [0.36, 1.0]);
  Object.assign(mat.uniforms, {
    uW30T: { value: t },
    uW30A: { value: new THREE.Vector4(num(qs, 'w30f', 2.2), num(qs, 'w30v', 1), num(qs, 'w30rb', 1), num(qs, 'w30sp', 1)) },
    uW30B: { value: new THREE.Vector4(ta, tb, num(qs, 'w30rip', 0.55), num(qs, 'w30old', 0)) },
    uW30C: { value: new THREE.Vector4(sa, sb, ea, eb) },
  });
  mat.defines = { ...(mat.defines ?? {}), W30: '' };
  mat.needsUpdate = true;
  console.info('[match06] w30 rainbow water', { tile: [ta, tb], start: [sa, sb], band: [ea, eb] });
  return true;
}
