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
// display-space colour across the edge band, e = 0 inner (cyan) .. 1 at the foam (magenta). Rainbow ramp = the approved picture's
// right-hand band measured across it (cyan, mint, yellow, peach, pink, magenta); plain ramp = its near-camera sides (azure -> violet
// -> pink -> magenta, no yellow). k = how much of the rainbow shows (comes and goes along the river)
vec3 w30Edge(float e, float k) {
  vec3 r = vec3(0.04, 0.84, 0.99);
  r = mix(r, vec3(0.45, 0.93, 0.80), smoothstep(0.02, 0.12, e));
  r = mix(r, vec3(0.98, 0.93, 0.55), smoothstep(0.12, 0.22, e));
  r = mix(r, vec3(0.99, 0.70, 0.62), smoothstep(0.22, 0.32, e));
  r = mix(r, vec3(0.98, 0.42, 0.86), smoothstep(0.32, 0.44, e));
  r = mix(r, vec3(0.93, 0.24, 0.88), smoothstep(0.44, 0.62, e));
  r = mix(r, vec3(0.80, 0.20, 0.92), smoothstep(0.75, 1.0, e));
  vec3 p = vec3(0.02, 0.55, 0.94);
  p = mix(p, vec3(0.50, 0.30, 0.95), smoothstep(0.05, 0.25, e));
  p = mix(p, vec3(0.97, 0.38, 0.88), smoothstep(0.22, 0.42, e));
  p = mix(p, vec3(0.93, 0.24, 0.88), smoothstep(0.42, 0.62, e));
  p = mix(p, vec3(0.80, 0.20, 0.92), smoothstep(0.75, 1.0, e));
  return mix(p, r, k);
}
vec3 w30Water(vec3 old, vec2 ls, float wc, float t, float dAp, float fres) {
  float u = ls.x / wc, au = abs(u), sd = u < 0.0 ? -1.0 : 1.0;
  float sf = ls.y - t * uW30A.x; // anchored to the river, flowing downstream (+s)
  // electric veins: two reads of the vein tile (different scale, speed, slight cross drift) -> jagged veins + branching net
  vec2 q1 = vec2(ls.x / uW30B.x, sf / uW30B.y);
  vec2 q2 = vec2(ls.x / (uW30B.x * 0.62) + 0.31 + 0.04 * sin(sf * 0.35), (ls.y - t * uW30A.x * 1.4) / (uW30B.y * 0.68) + 0.57);
  vec3 a = texture2D(uW30T, q1).rgb;
  vec3 b = texture2D(uW30T, q2).rgb;
  float fl = 0.75 + 0.25 * sin(t * 5.3 + sf * 1.7 + ls.x * 0.9); // current flickering along the veins
  float vein = max(a.r * fl, b.g * (1.0 - 0.3 * fl)) * uW30A.y;
  // water body: deep azure between the veins, bright cyan in their glow, broad lighter / deeper zones drifting with the flow
  // (approved lower water: azure ~(10, 128, 231), cyan ~(0-30, 170-220, 245), vein cores white-cyan)
  float zone = 0.5 + 0.5 * sin(sf * 0.47 + ls.x * 1.1) * sin(sf * 0.19 - ls.x * 0.6 + 1.3);
  vec3 col = mix(vec3(0.01, 0.50, 0.92), vec3(0.02, 0.70, 0.98), zone * 0.7 + 0.3 * (1.0 - smoothstep(0.0, 0.5, au)));
  col = mix(col, vec3(0.10, 0.86, 1.0), smoothstep(0.08, 0.55, vein));
  // magenta sides with a rainbow strip that comes and goes along the river (each side its own phase), wavy edges (follow the veins)
  float wob = 0.6 * sin(ls.y * 0.21 + sd * 1.9) + 0.4 * sin(ls.y * 0.57 + 0.8 * sd + t * 0.6);
  float e = (au - uW30C.z) / max(uW30C.w - uW30C.z, 1e-3) + 0.06 * wob + 0.10 * (a.r - 0.25) - 0.08 * fres;
  float rk = smoothstep(-0.3, 0.5, sin(ls.y * 0.11 + sd * 2.3) + 0.5 * sin(ls.y * 0.29 + 0.7)) * uW30A.z;
  col = mix(col, w30Edge(clamp(e, 0.0, 1.0), rk), smoothstep(-0.02, 0.12, e) * min(uW30A.z, 1.0));
  // vein cores: white-cyan on the water, pink-white on the magenta sides
  vec3 vc = mix(vec3(0.82, 1.0, 1.0), vec3(1.0, 0.78, 0.98), smoothstep(0.35, 0.7, e));
  col = mix(col, vc, smoothstep(0.5, 0.95, vein));
  col += vec3(0.35, 0.80, 1.0) * 0.15 * a.g * b.r * uW30A.y; // faint caustic interference
  float gl = max(a.b, b.b * 0.8) * (0.35 + 0.65 * pow(0.5 + 0.5 * sin(t * 8.0 + ls.x * 6.1 + sf * 2.3), 3.0));
  col += vec3(0.80, 0.95, 1.0) * gl * uW30A.w;
  col += fres * 0.16 * vec3(0.9, 0.85, 1.0);
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
