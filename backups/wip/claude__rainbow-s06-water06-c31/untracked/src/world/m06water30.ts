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
 * `w30sp` glint strength (1) · `w30t=a,b` vein tile size across, along (u; 1.7,3.2) · `w30rip` ripple strength (0.55) ·
 * `w30old` share of the old painted streak strip kept (0) · `w30st=a,b` start hand-over (0.02,0.6) · `w30e=a,b` rainbow band from
 * |l|/Wc = a to b (0.5,1.0)
 */
import * as THREE from 'three';

/** inserted into match06.ts FRAG before main(); only compiled where the material defines W30 */
export const W30_GLSL = /* glsl */ `
#ifdef W30
uniform sampler2D uW30T;
uniform vec4 uW30A; // flow speed (u/s), vein strength, rainbow strength, glint strength
uniform vec4 uW30B; // vein tile across (u), along (u), ripple strength, share of the old painted strip kept
uniform vec4 uW30C; // start hand-over a..b (camera distance from the approved viewpoint), rainbow band inner / outer edge (|l| / Wc)
// display-space rainbow across the edge band: e = 0 inner (cyan) .. 1 at the foam (magenta)
vec3 w30Rainbow(float e) {
  vec3 c = vec3(0.04, 0.86, 0.99);
  c = mix(c, vec3(0.42, 0.93, 0.78), smoothstep(0.04, 0.20, e));
  c = mix(c, vec3(0.99, 0.95, 0.56), smoothstep(0.20, 0.36, e));
  c = mix(c, vec3(0.99, 0.74, 0.60), smoothstep(0.36, 0.50, e));
  c = mix(c, vec3(0.98, 0.46, 0.86), smoothstep(0.50, 0.66, e));
  c = mix(c, vec3(0.91, 0.24, 0.88), smoothstep(0.66, 0.86, e));
  return c;
}
vec3 w30Water(vec3 old, vec2 ls, float wc, float t, float dAp, float fres) {
  float u = ls.x / wc, au = abs(u), sd = u < 0.0 ? -1.0 : 1.0;
  float sf = ls.y - t * uW30A.x; // anchored to the river, flowing downstream (+s)
  // cyan core -> deeper azure toward the sides (approved lower water: ~(0-10, 150-210, 230-250) core, (10, 128, 231) azure)
  vec3 col = mix(vec3(0.07, 0.80, 0.99), vec3(0.03, 0.58, 0.95), smoothstep(0.15, 0.55, au));
  // rainbow edge band, breathing along the river (each side its own phase) and shifting a little with the view angle
  float wob = 0.6 * sin(ls.y * 0.21 + sd * 1.9) + 0.4 * sin(ls.y * 0.57 + 0.8 * sd + t * 0.6);
  float e = (au - uW30C.z) / max(uW30C.w - uW30C.z, 1e-3) + 0.07 * wob - 0.10 * fres;
  float inB = smoothstep(-0.02, 0.10, e);
  col = mix(col, w30Rainbow(clamp(e, 0.0, 1.0)), inB * uW30A.z);
  // electric veins: two reads of the vein tile (different scale, speed, slight cross drift) -> jagged veins + branching net
  vec2 q1 = vec2(ls.x / uW30B.x, sf / uW30B.y);
  vec2 q2 = vec2(ls.x / (uW30B.x * 0.62) + 0.31 + 0.04 * sin(sf * 0.35), (ls.y - t * uW30A.x * 1.4) / (uW30B.y * 0.68) + 0.57);
  vec3 a = texture2D(uW30T, q1).rgb;
  vec3 b = texture2D(uW30T, q2).rgb;
  float fl = 0.78 + 0.22 * sin(t * 5.3 + sf * 1.7 + ls.x * 0.9); // current flickering along the veins
  float vein = clamp(max(a.r * fl, b.g * (1.0 - 0.35 * fl)) * uW30A.y, 0.0, 1.0);
  vec3 vc = mix(vec3(0.80, 1.0, 1.0), mix(col, vec3(1.0), 0.62), smoothstep(0.45, 0.9, e));
  col = mix(col, vc, vein);
  col += vec3(0.35, 0.80, 1.0) * 0.18 * a.g * b.r * uW30A.y; // faint caustic interference
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
  const [ta, tb] = pair(qs, 'w30t', [1.7, 3.2]), [sa, sb] = pair(qs, 'w30st', [0.02, 0.6]), [ea, eb] = pair(qs, 'w30e', [0.5, 1.0]);
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
