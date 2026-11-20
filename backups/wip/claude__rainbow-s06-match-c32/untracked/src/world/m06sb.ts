/**
 * r30b lead — `&m06sb=1` "storyboard" candidate for Screen 06 (user 2026-11-20 ~22:10 / ~22:20 UTC, docs/briefs/2026-11-20-r30/USER_R30.md §6:
 * the FOUR storyboard panels docs/briefs/2026-11-20-r30/USER_S06_STORYBOARD_R30.png are ALL mandatory approved targets). Builds on the
 * r30 v2 candidate (qa/match/06/r30/QUERY_NEW_v2.txt: m06deep + m06curl + m06camk/u). Every part is opt-in; `m06sb=1` turns all on:
 *   `&m06sbwall=1`  after the approved start view the tunnel wall = clean purple-magenta drum metal with small, regular, rounded slots
 *                   running round the drum (anti-aliased by pixel footprint: no blur, no stretching, no tile bands) and long pink-white
 *                   light streaks along the tunnel (colours measured from the storyboard walls, qa/match/06/r30b/align/).
 *   `&m06sbband=1`  the designed bands past the crest = broad polished copper-gold bands standing proud of the wall (two raised lips,
 *                   a broad domed face, bright reflection patches), every `&m06sbsp=` u (default 16) of tunnel axis, `&m06sbbw=` wide
 *                   (default 4.0 u), `&m06sbbd=` deep (default 0.9 u); ALL rings (also the painted ones near the crest) get the same
 *                   gold shading once the camera has left the approved view.
 *   `&m06sbhaze=1`  the far tunnel fades into the storyboard's bright lilac-violet (not the dark mauve of m06haze), `&m06sbhz=near,far,k`.
 *   `&m06sbjoin=1`  CAUSE of the pale peach circle (qa/match/06/r30b/diag/, src/world/environment.ts tubeGlow '#ffd08a' near 48 far 105):
 *                   Screen 07's tube (seen through the end of the 06 tunnel from 90-200 u away) turns into its warm far glow. While Benny
 *                   is in 06, 07's tube far glow + mid tint are the storyboard's far violet and its neon-magenta walls are tinted toward
 *                   the 06 purple; both ease back to 07's own look over the first `&m06sbj07=` u of Screen 07 (default 40).
 *   `&m06sbcam=1`   storyboard framing (src/game/cameraRig.ts): Benny kept at his APPROVED size and place in the frame (the four panels
 *                   all show him exactly there, qa/match/06/r30b/align/panel1_vs_approved_window.png), the view aimed so the river
 *                   `&m06sbla=a,b` u ahead (default 22,42) sits at NDC `&m06sbq=x,y` (default 0.10,0.16 = the panels' vanishing area);
 *                   camera lag predicted so Benny keeps his size while swimming; eased in after the start view, out before 07.
 * Without these switches nothing here runs (the uniforms stay 0, the GLSL branches are skipped).
 */
import * as THREE from 'three';

const QS = typeof location !== 'undefined' ? new URLSearchParams(location.search) : null;
const on = (k: string) => QS?.get('m06sb') === '1' || QS?.get(k) === '1';
const num = (k: string, d: number) => { const v = Number(QS?.get(k)); return QS?.get(k) != null && QS?.get(k) !== '' && Number.isFinite(v) ? v : d; };
const nums = (k: string, d: number[]) => { const a = (QS?.get(k) ?? '').split(',').map(Number); return a.length === d.length && a.every(Number.isFinite) ? a : d; };

export const SB = {
  wall: on('m06sbwall'),
  band: on('m06sbband'),
  haze: on('m06sbhaze'),
  join: on('m06sbjoin'),
  cam: on('m06sbcam'),
  sp: num('m06sbsp', 18), bw: num('m06sbbw', 6.0), bd: num('m06sbbd', 1.1),
  // `&m06sbr=` tunnel radius past the crest with the storyboard route (default 10.5; the approved crest keeps 14, 07's mouth is 15)
  rMid: num('m06sbr', 10.5),
  hz: nums('m06sbhz', [55, 150, 0.72]),
  j07: num('m06sbj07', 40),
  la: nums('m06sbla', [22, 42]),
  q: nums('m06sbq', [0.10, 0.16]),
  qh: num('m06sbqh', 0), // r30b t6: lift (u) of the aim point above the river ahead: a flatter view of Benny (painted near-level hat)
  k: num('m06sbk', 1.15), // r30b t3: the 3D Benny is ~20 % larger than the painted one at the approved camera
  by: num('m06sbby', 0), // NDC y shift of Benny's anchor (+ = higher)
  // r30b t4: vertical field of view of the storyboard framing (the panels read telephoto: storyboard panel 1 = the approved view with the
  // background ~1.15x larger at the same Benny size); the camera backs off along the ray through Benny so he keeps his size
  fov: num('m06sbfov', 50),
  // wall slots: row pitch along the axis, arc pitch round the drum, slot length (round) and width (along) in u
  slot: nums('m06sbslot', [1.2, 1.4, 0.95, 0.32]), // r30b t6: smaller, more numerous slots (storyboard: more metal between them)
};
/** the storyboard far tunnel violet (display values, measured: p2/p4 far tunnel median) */
export const SB_FAR = new THREE.Vector3(0.64, 0.40, 0.86);

/** GLSL (display values; match06's FRAG writes pjInverse(pc)) */
export const SB_GLSL = /* glsl */ `
uniform float uSbWall;
uniform float uSbBand;
uniform vec4 uSbSlot;
varying vec3 vAxT;
// strip lights round the drum (9, world-anchored): the long streaks on the walls and the bright patches on the bands
float sbStrip(float th, float k) { return pow(0.5 + 0.5 * cos(th * 9.0 + 0.7), k); }
vec3 sbWall(float th, float ax, float R, vec3 n, vec3 V, vec3 T) {
  vec3 n2 = dot(n, V) < 0.0 ? -n : n;
  vec3 Rf = reflect(-V, n2);
  float fw = dot(Rf, T);
  // r30b t2: the light varies ROUND the drum (world-anchored broad bands), not with the grazing angle (which lit every far wall pixel):
  // storyboard walls p25 (151,35,100) p50 (174,44,112) p75 (223,72,132), highlights (251,139,223) as streaks only
  float broad = 0.5 + 0.25 * cos(th * 3.0 + 1.1) + 0.25 * cos(th * 2.0 - 0.4);
  vec3 c = mix(vec3(0.52, 0.08, 0.40), vec3(0.72, 0.16, 0.52), smoothstep(0.15, 0.6, broad)); // r30b t6: more saturated magenta-violet
  c = mix(c, vec3(0.90, 0.27, 0.58), 0.8 * smoothstep(0.6, 0.95, broad));
  // violet toward the sides, magenta on the ceiling (storyboard p2 ceiling vs p3 side wall)
  float side = abs(cos(th));
  c = mix(c, vec3(0.62, 0.22, 0.70), 0.3 * side);
  float arc = th * R;
  // brushed grain along the tunnel
  float gr = sin(arc * 29.0 + sin(ax * 0.31) * 1.3) * 0.5 + sin(arc * 61.0 + ax * 0.07) * 0.5;
  c *= 1.0 + 0.05 * gr;
  // long pink-white streaks along the tunnel (narrow), a little stronger where the wall reflects the light down the tunnel
  // r30b t4: more luminous (storyboard walls p75 (223,72,132), p95 (251,139,223)): wider streaks + a soft sheen round each
  float st = sbStrip(th, 22.0) * (0.5 + 0.5 * smoothstep(0.2, 1.0, fw));
  float st2 = pow(0.5 + 0.5 * cos(th * 23.0 + 1.9), 50.0) * 0.5;
  float sh = sbStrip(th, 4.0) * 0.35;
  c = mix(c, vec3(0.90, 0.30, 0.58), sh);
  c = mix(c, vec3(0.99, 0.60, 0.88), clamp(0.75 * st + st2, 0.0, 0.85));
  c += vec3(0.75, 0.30, 0.60) * 0.10 * pow(max(fw, 0.0), 20.0);
  // slots: rows round the drum, staggered, long axis round the drum
  vec2 pitch = vec2(uSbSlot.y, uSbSlot.x);
  float row = floor(ax / pitch.y);
  vec2 p = vec2((fract(arc / pitch.x + 0.5 * mod(row, 2.0)) - 0.5) * pitch.x, (fract(ax / pitch.y) - 0.5) * pitch.y);
  float rr = 0.5 * uSbSlot.w, hl = 0.5 * uSbSlot.z;
  float d = length(max(abs(p) - vec2(hl - rr, 0.0), 0.0)) - rr;
  float aa = max(fwidth(d), 1e-4);
  float cov = 1.0 - smoothstep(-aa, aa, d);
  float fp = max(fwidth(arc) / pitch.x, fwidth(ax) / pitch.y);
  float far = smoothstep(0.18, 0.42, fp);
  float mean = 3.14159 * rr * rr + 4.0 * (hl - rr) * rr; mean /= pitch.x * pitch.y;
  vec3 hole = vec3(0.20, 0.02, 0.19) + vec3(0.10, 0.02, 0.10) * smoothstep(-rr, rr, p.y);
  // punched rim: bright on the far edge (it faces the camera down the tunnel), shadowed on the near edge
  float rim = (1.0 - smoothstep(-aa, aa, abs(d - 0.045) - 0.03)) * (1.0 - far);
  vec3 cs = mix(c, hole, cov) + vec3(1.0, 0.75, 0.98) * 0.30 * rim * smoothstep(-0.02, 0.06, p.y) - vec3(0.12, 0.05, 0.10) * rim * smoothstep(0.02, -0.06, p.y);
  return clamp(mix(cs, mix(c, hole, mean * 0.8), far), 0.0, 1.0);
}
// polished copper-gold band: th = angle round the ring, v = 0..1 across its profile, n = normal, T = tunnel direction
vec3 sbGold(float th, float v, vec3 n, vec3 V, vec3 T) {
  vec3 n2 = dot(n, V) < 0.0 ? -n : n;
  vec3 Rf = reflect(-V, n2);
  vec3 dark = vec3(0.40, 0.10, 0.05), mid = vec3(0.82, 0.34, 0.12), gold = vec3(0.99, 0.58, 0.20), brt = vec3(1.0, 0.84, 0.46);
  float body = smoothstep(0.03, 0.2, v) * smoothstep(0.97, 0.8, v);
  vec3 c = mix(dark, mid, 0.3 + 0.7 * body);
  c = mix(c, gold, 0.7 * exp(-pow((v - 0.5) / 0.26, 2.0)));
  float lip = exp(-pow((v - 0.13) / 0.03, 2.0)) + exp(-pow((v - 0.87) / 0.03, 2.0));
  float grv = exp(-pow((v - 0.21) / 0.018, 2.0)) + exp(-pow((v - 0.79) / 0.018, 2.0));
  c *= 1.0 - 0.42 * grv;
  c = mix(c, vec3(1.0, 0.88, 0.58), 0.7 * lip);
  // bright reflection patches round the ring (the same strip lights as the walls) + a broad soft sheen
  // r30b t3: crisp bright bars across the band (strip-light reflections) + finer secondary bars; brushed lines round the band
  float pt = sbStrip(th, 26.0) + 0.55 * pow(0.5 + 0.5 * cos(th * 17.0 + 2.3), 40.0), pt2 = pow(0.5 + 0.5 * cos(th * 3.0 - 0.4), 6.0);
  c *= 0.93 + 0.07 * sin(v * 210.0 + sin(th * 5.0));
  float acr = exp(-pow((v - 0.47) / 0.2, 2.0)) + 0.6 * exp(-pow((v - 0.72) / 0.08, 2.0));
  // r30b t2: storyboard gold p25 (223,111,51) p50 (249,145,63) p75 (253,207,112); white only in the reflection patches
  c = mix(c, brt, clamp(0.65 * pt2 * acr + 0.15 * body, 0.0, 0.7));
  c = mix(c, vec3(1.0, 0.96, 0.84), clamp(pt * acr * 1.1, 0.0, 0.92));
  float fw = dot(Rf, T);
  c += vec3(0.9, 0.55, 0.25) * 0.2 * pow(max(fw, 0.0), 24.0) * (0.4 + 0.6 * body);
  float fr = pow(1.0 - abs(dot(n2, V)), 4.0);
  c = mix(c, vec3(0.98, 0.70, 0.40), fr * 0.15);
  return clamp(c, 0.0, 1.0);
}
`;

/** broad band geometry (attributes for match06's VERT: position, aTile = (angle*4/2pi, v), aLS = (axial offset, 0), aAxT) */
export function buildSbBands(rings: { p: THREE.Vector3; t: THREE.Vector3; r: THREE.Vector3; u: THREE.Vector3; R: number }[], W: number, D: number, NS = 160) {
  const h = W / 2;
  const prof: [number, number][] = [[0.3, -h], [-0.8 * D, -h], [-D, -h + 0.08], [-D - 0.07, -h + 0.22], [-D - 0.07, -h + 0.42], [-D + 0.05, -h + 0.52], [-D + 0.05, -h + 0.62]];
  for (let k = 1; k < 10; k++) { const f = k / 10; prof.push([-D - 0.025 * Math.sin(Math.PI * f), -h + 0.72 + f * (W - 1.44)]); } // r30b t3: flat broad face (t2 dome read as a plastic tube)
  prof.push([-D + 0.05, h - 0.62], [-D + 0.05, h - 0.52], [-D - 0.07, h - 0.42], [-D - 0.07, h - 0.22], [-D, h - 0.08], [-0.8 * D, h], [0.3, h]);
  const vP: number[] = [0];
  for (let i = 1; i < prof.length; i++) vP.push(vP[i - 1] + Math.hypot(prof[i][0] - prof[i - 1][0], prof[i][1] - prof[i - 1][1]));
  const L = vP[vP.length - 1], np = prof.length;
  const pos: number[] = [], tile: number[] = [], ls: number[] = [], at: number[] = [], idx: number[] = [];
  let base = 0;
  const dir = new THREE.Vector3();
  for (const g of rings) {
    for (let i = 0; i <= NS; i++) {
      const ph = (i / NS) * Math.PI * 2;
      dir.copy(g.r).multiplyScalar(Math.cos(ph)).addScaledVector(g.u, Math.sin(ph));
      for (let j = 0; j < np; j++) {
        const [x, y] = prof[j];
        const p = g.p.clone().addScaledVector(g.t, y).addScaledVector(dir, g.R + x);
        pos.push(p.x, p.y, p.z); tile.push((ph / (Math.PI * 2)) * 4, vP[j] / L); ls.push(y, 0); at.push(g.t.x, g.t.y, g.t.z);
      }
    }
    for (let i = 0; i < NS; i++) for (let j = 0; j < np - 1; j++) { const a = base + i * np + j, b = a + 1, c = a + np, d = c + 1; idx.push(a, c, b, b, c, d); }
    base += (NS + 1) * np;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('aTile', new THREE.Float32BufferAttribute(tile, 2));
  geo.setAttribute('aLS', new THREE.Float32BufferAttribute(ls, 2));
  geo.setAttribute('aAxT', new THREE.Float32BufferAttribute(at, 3));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}

type FG = { uFarGlowColor: { value: THREE.Color }; uFarGlowRange: { value: THREE.Vector3 }; uMidTint: { value: THREE.Color }; uMidRange: { value: THREE.Vector3 } };
/** `m06sbjoin`: retint Screen 07's tube (its far glow, mid tint and wall colour) while Benny is in 06; k = 1 in 06 .. 0 past s07 + j07 */
export function makeSbJoin(tube07: THREE.Object3D) {
  const mats: { fg?: FG; rest: { col: THREE.Color; rng: THREE.Vector3; mid: THREE.Color; mrng: THREE.Vector3 } | null; m: THREE.MeshStandardMaterial; colRest: THREE.Color; strip?: { value: THREE.Color }; stripRest?: THREE.Color }[] = [];
  tube07.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
    if (!m || !(m as THREE.MeshStandardMaterial).isMeshStandardMaterial || mats.some((x) => x.m === m)) return;
    // withFarGlow() keeps its uniforms in userData.farGlow; perforatedMetal() (the 07 tube WALL) in userData.perfUniforms
    const pu = m.userData.perfUniforms as Partial<FG> | undefined;
    const fg = (m.userData.farGlow as FG | undefined) ?? (pu?.uFarGlowColor && pu.uFarGlowRange && pu.uMidTint && pu.uMidRange ? (pu as FG) : undefined);
    const strip = (m.userData.tubeStrips as { uStripColor?: { value: THREE.Color } } | undefined)?.uStripColor;
    mats.push({ fg, m, colRest: m.color.clone(), strip, stripRest: strip?.value.clone(),
      rest: fg ? { col: fg.uFarGlowColor.value.clone(), rng: fg.uFarGlowRange.value.clone(), mid: fg.uMidTint.value.clone(), mrng: fg.uMidRange.value.clone() } : null });
  });
  // r30b t5: a deeper violet than the 06 haze (07's bright strip reflections on top of it read pale pink-lilac in t4)
  const far = new THREE.Color(0.50, 0.26, 0.78), wallTint = new THREE.Color(0.62, 0.42, 1.0);
  let last = -1;
  return {
    count: mats.length,
    update(k: number) {
      if (Math.abs(k - last) < 1e-3) return; last = k;
      for (const x of mats) {
        if (x.fg && x.rest) {
          x.fg.uFarGlowColor.value.copy(x.rest.col).lerp(far, k);
          x.fg.uFarGlowRange.value.copy(x.rest.rng).lerp(new THREE.Vector3(40, 120, 0.4), k);
          x.fg.uMidTint.value.copy(x.rest.mid).lerp(far, k);
          x.fg.uMidRange.value.copy(x.rest.mrng).lerp(new THREE.Vector3(14, 70, 0.6), k);
        }
        if (x.strip && x.stripRest) x.strip.value.copy(x.stripRest).multiplyScalar(1 - 0.6 * k); // 07's strip lights dimmed while seen from 06
        // walls only (the gold rings / lids keep their colour): magenta -> violet like the 06 drum
        if (x.m.metalness < 0.99) x.m.color.copy(x.colRest).lerp(x.colRest.clone().multiply(wallTint), k); // perforated wall 0.92, gold() 1
      }
    },
  };
}
