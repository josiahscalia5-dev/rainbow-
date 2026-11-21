/**
 * RAINBOW master course — ONE continuous route through the washer world.
 *
 * Units: 1 unit ≈ 5 cm at Benny's scale (Benny body radius ≈ 0.8). +Y is up (absolute altitude).
 * The route starts inside Drum A (scene 01/02), drains through a chute into the whirlpool basin (03),
 * drops down the five-arrow slide (04), winds through the perforated current tube (05), crests the
 * rinse arch (06), winds through the washer tube and then PLUNGES ~62 units straight down (07) before
 * the bottom of that same tube flares into the Final Spin Chamber inlet (08). 08–10 stay in that same
 * chamber; the route ends under the purple towel on the platform, where the 11 cinematic plays.
 *
 * Every stage is a range of arc-length `s` on a single centripetal Catmull-Rom spline, so position
 * and tangent are continuous by construction; `validateContinuity()` measures it anyway.
 */
import * as THREE from 'three';
import { flag05 } from '../vfx/waterRibbon';
import river08 from '../../assets/textures/match08/river08.json';
/** `?tun05=1` (round 31): see the 06 arch below. Guarded read (no location in vite-node / workers -> false). */
const TUN05_COURSE: boolean = (() => { try { return typeof location !== 'undefined' && new URLSearchParams(location.search).get('tun05') === '1'; } catch { return false; } })();

export type StageId = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11';
export type TubeKind = 'none' | 'chute' | 'gold' | 'perf';
export type StageProp = 'width' | 'tube' | 'speed' | 'bank';

export interface StageDef {
  id: StageId;
  title: string;
  /** arc-length range on the course */
  s0: number;
  s1: number;
  /** water ribbon width (units) */
  width: number;
  /** enclosing tube radius (0 = open environment such as a drum/basin/chamber) */
  tube: number;
  tubeKind: TubeKind;
  /** auto-propulsion speed (units / s) */
  speed: number;
  /** coin counter shown in the locked reference screenshot of this stage */
  refCoins: number;
  interactive: boolean;
  /** banking strength multiplier */
  bank: number;
}

export interface CourseSample {
  s: number;
  pos: THREE.Vector3;
  tan: THREE.Vector3;
  up: THREE.Vector3;
  right: THREE.Vector3;
}

export const STAGE_TITLES: Record<StageId, string> = {
  '01': 'INSIDE THE WASHING MACHINE',
  '02': 'WHIRLPOOL TUMBLE',
  '03': 'WHIRLPOOL TWIRL',
  '04': 'THROUGH THE FIVE ARROWS',
  '05': 'FLOW INTO THE CURRENT',
  '06': 'CREST THE RINSE ARCH',
  '07': 'DIVE THE WASHER TUBE',
  '08': 'FINAL SPIN CHAMBER',
  '09': 'RIDE THE FINAL WAVE',
  '10': 'SLIDE INTO HIDING',
  '11': 'SAFELY HOME',
};

/** Fixed world anchors shared by environment builders (absolute coordinates). */
export const WORLD = {
  drumA: { center: new THREE.Vector3(0, 0, 0), radius: 5, zBack: -6.5, zDoor: 3.5, doorRadius: 3.2, waterY: -2.5 },
  basin: { center: new THREE.Vector3(2, -16, -19), rimRadius: 11.5, rimY: -10.6, drainRadius: 4.3, drainY: -20.2 },
  /** Final Spin Chamber (08–11): drum with axis along Z, door at the far (-Z) end */
  chamber: { center: new THREE.Vector3(12, -101.1, 0), radius: 13.5, zBack: -280, zDoor: -332, floorY: -113.6, doorRadius: 6.2 },
  platform: { center: new THREE.Vector3(12, -110.6, -325.0), radius: 6.2, topY: -110.6 },
  plunge: { topY: -52, bottomY: -113.6 },
};

/** funnel surface height of the whirlpool basin as a function of radius from its axis */
export function funnelY(r: number): number {
  const b = WORLD.basin;
  const t = THREE.MathUtils.clamp((r - b.drainRadius * 0.6) / (b.rimRadius - b.drainRadius * 0.6), 0, 1);
  return b.drainY + (b.rimY - b.drainY) * Math.pow(t, 0.72);
}

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const smooth = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * A stretch whose tunnel axis is an exact straight line a→b (the stream winds inside it). The
 * course lies on the line at both ends of the stretch; tube.ts aligns the tunnel axis to it.
 */
export interface StraightAxis {
  /** arc-length range of the stretch on the course */
  s0: number;
  s1: number;
  a: THREE.Vector3;
  b: THREE.Vector3;
  /** stream-to-tunnel-bottom depth on the line (water sits this high in the tube) */
  floorDepth: number;
}

interface RouteData {
  points: THREE.Vector3[];
  marks: Record<string, number>;
  straight: { from: string; to: string; a: THREE.Vector3; b: THREE.Vector3; floorDepth: number }[];
}

/**
 * 05 current (ref 05): the tunnel is a straight line; the STREAM winds inside it. The meander is the
 * lateral (world +X) offset of the course centreline from that line, as a function of the distance
 * `u` along the line (0 … L05). It is applied to the route AFTER smoothPolyline, so it is exact (the
 * smoothing would shave ~25 % off the amplitude) and still C¹ at both ends (offset and slope → 0).
 *
 * Shape tuned against the reference's cyan core: a small first crest under Benny at the 05
 * checkpoint (u≈uCrest, offset a0 to the LEFT, heading parallel to the tunnel axis), then crests
 * that grow toward the far end (screen: Benny → (560,700) → (450,600) → (520,520) → VP).
 * Coins (gameplay/coins.ts) sit on this centreline (lat 0), so they wind with the same S.
 */
export const S05 = {
  /** length of the straight tunnel line (units) */
  L: 72,
  /** wavelength along the line (crest → crest of the same side) */
  lambda: 32,
  /** u of the first (left) crest, where Benny rides at the 05 checkpoint */
  uCrest: 14,
  /** crest amplitude at uCrest and at uCrest + 1.5 λ (linear growth in between) */
  a0: 0.45,
  a1: 1.85,
  /** half extent of the stream (|offset| + half width) in the current: fills the tube floor */
  extent: 6.0,
};

/**
 * 05 meander AHEAD of Benny's crest (u > uCrest): [u, offset] knots fitted to the APPROVED reference (wave 6
 * camera lock, qa/pilot05/wave6/camera_lock/landmarks.json). The reference's coin trail was back-projected
 * through the live locked 05 camera onto the river (coin height 1.2 u) and converted to offsets from the
 * tunnel line; coins sit at (1 + latK·CORE_SWING) ≈ 1.62 × the course offset, so knot = coin offset / 1.62.
 * Ref coins (px → u, coin offset): (474,726)→21.6,−0.31 · (548,661)→26.3,+0.60 · (482,612)→32.2,−0.37 ·
 * (431,574)→43.0,−1.85 · (466,546)→55.5,−1.28 · (495,533)→67.0,−0.26. The previous sine (λ 32) put the right
 * swing at u≈30–33 and +1.45 wide, so the 3rd coin sat ≈100 px right of the reference.
 * Interpolation: C¹ cubic Hermite (non-uniform Catmull-Rom tangents), slope 0 at the crest and at L.
 */
const MEANDER05_KNOTS: [number, number][] = [[26.3, 0.37], [32.2, -0.23], [43, -1.14], [55.5, -0.79]];

/** the original (wave 1–5) sine meander; kept verbatim up to U05_KEEP so the 04→05 join, the '05_crest'
 *  checkpoint search window (u ≤ uCrest + λ/4) and therefore the LOCKED 05 camera are bit-identical */
function meander05Sine(u: number): number {
  const { L, lambda, uCrest, a0, a1 } = S05;
  const grow = THREE.MathUtils.clamp((u - uCrest) / (1.5 * lambda), 0, 1);
  const amp = (a0 + (a1 - a0) * grow) * smooth(0, 10, u) * (1 - smooth(L - 12, L, u));
  return -amp * Math.cos((2 * Math.PI * (u - uCrest)) / lambda);
}
const U05_KEEP = S05.uCrest + S05.lambda / 4;

/** C¹ cubic Hermite through knots (non-uniform Catmull-Rom tangents; end slopes given) */
function hermiteKnots(k: [number, number][], u: number, m0: number, mN = 0): number {
  const n = k.length;
  if (u >= k[n - 1][0]) return k[n - 1][1];
  let i = 0;
  while (u > k[i + 1][0]) i++;
  const tan = (j: number) => (j === 0 ? m0 : j === n - 1 ? mN : (k[j + 1][1] - k[j - 1][1]) / (k[j + 1][0] - k[j - 1][0]));
  const [u0, p0] = k[i], [u1, p1] = k[i + 1];
  const h = u1 - u0, t = (u - u0) / h, t2 = t * t, t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * h * tan(i) + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * h * tan(i + 1);
}
/** from U05_TAIL to the 06 join the ORIGINAL curve is used verbatim, so the 05→06 junction (and the 06 up-vector
 *  smoothing, which looks ±12 samples back into 05) is bit-identical to the approved 06 */
const U05_TAIL = 67;
const slopeOf = (f: (u: number) => number, u: number) => (f(u + 1e-3) - f(u - 1e-3)) / 2e-3;
const KNOTS05: [number, number][] = [[U05_KEEP, meander05Sine(U05_KEEP)], ...MEANDER05_KNOTS, [U05_TAIL, meander05Sine(U05_TAIL)]];
const SLOPE05_KEEP = slopeOf(meander05Sine, U05_KEEP);
const SLOPE05_TAIL = slopeOf(meander05Sine, U05_TAIL);

/**
 * 05 EXIT BEND (u 56–67, sin², C¹: zero value and slope at both ends): the original course swung right
 * here before the 06 arch too (old sine +1.71 u at u 62). Its amplitude is solved (secant on Course.length)
 * so the route keeps EXACTLY its old length 435.193. Why the length must stay: besides geometry, the water
 * wave/flow phase, Benny's float bob, foam lumps and bubbles are keyed on absolute s, so a shorter 05
 * (−0.78 u) shifted every later screen (06: Benny 0.034 lower, a ring grazing the frame bottom, different
 * bubbles/foam). The 06/07 rings, lids and slot rows are additionally anchored to the 06 stage start
 * (environment.ts STAGE ANCHORS) as a safety net.
 */
const EXIT05_BEND = { u0: 56, u1: U05_TAIL, amp: 1.353668 };

/** lateral offset (units, + = world +X = rider's right when heading -Z) of the 05 stream from its tunnel line */
export function meander05(u: number): number {
  if (u <= 0 || u >= S05.L) return 0;
  if (u <= U05_KEEP || u >= U05_TAIL) return meander05Sine(u);
  const { u0, u1, amp } = EXIT05_BEND;
  const bend = u > u0 && u < u1 ? amp * Math.sin((Math.PI * (u - u0)) / (u1 - u0)) ** 2 : 0;
  return hermiteKnots(KNOTS05, u, SLOPE05_KEEP, SLOPE05_TAIL) + bend;
}

/** Generates the dense control polyline of the route (absolute coordinates). */
function buildRoute(): RouteData {
  const pts: THREE.Vector3[] = [];
  const marks: Record<string, number> = {};
  const straight: RouteData['straight'] = [];
  const push = (p: THREE.Vector3) => {
    if (pts.length && p.distanceTo(pts[pts.length - 1]) < 0.25) return;
    pts.push(p);
  };
  const mark = (k: string) => (marks[k] = pts.length - 1);
  const seg = (n: number, f: (t: number) => THREE.Vector3, skipFirst = true) => {
    for (let i = skipFirst ? 1 : 0; i <= n; i++) push(f(i / n));
  };

  // ---- 01: Benny hidden in the towel, drum A front-left floor (camera looks toward the door) ----
  const dA = WORLD.drumA;
  const hc = V(0, -0.4, 0); // swirl axis
  const th0 = Math.atan2(-2.0, 1.6);
  push(V(1.6, -2.4, -2.2));
  mark('01');
  // ---- 02: whirlpool tumble — helix around the drum axis toward the back drain ----
  const thEnd = -Math.PI / 2 - Math.PI * 2;
  seg(26, (t) => {
    const th = th0 + (thEnd - th0) * t;
    const r = 2.56 + (3.9 - 2.56) * smooth(0, 1, t);
    const z = -2.2 + (-5.4 + 2.2) * t;
    return V(hc.x + r * Math.cos(th), hc.y + r * Math.sin(th), z);
  });
  mark('02_drain');
  // chute from drum A back drain down into the whirlpool basin rim
  const b = WORLD.basin;
  const spiralStart = V(b.center.x - 9.6, funnelY(9.6) + 0.25, b.center.z);
  const c0 = pts[pts.length - 1].clone();
  const chuteCtrl = [c0, V(-0.6, -5.6, -7.6), V(-3.2, -7.8, -10.4), V(-6.6, -9.8, -14.2), spiralStart.clone().add(V(0, 0.15, 2.4))];
  const chute = new THREE.CatmullRomCurve3(chuteCtrl, false, 'centripetal');
  seg(14, (t) => chute.getPoint(t));
  push(spiralStart);
  mark('03');
  // ---- 03: whirlpool twirl — 3/4 inward turn down the funnel that dives into the drain CENTRE ----
  // decreasing angle from the -X side (θ=-π/2) round the far and right sides to the near (+Z) side;
  // r shrinks as (1-t)^1.6 so the last stretch heads radially inward = straight -Z into the drain hole.
  seg(60, (t) => {
    const th = -Math.PI / 2 - Math.PI * 1.5 * (1 - (1 - t) * (1 - t)); // angle eases out → radial finish
    const r = 9.6 * Math.pow(1 - t, 0.9);
    return V(b.center.x + r * Math.sin(th), funnelY(r) + 0.25, b.center.z + r * Math.cos(th));
  });
  mark('04');
  // ---- 04: five-arrow slide — steep straight drop (≈32°) inside the gold ring pipe ----
  const s4 = pts[pts.length - 1].clone();
  const pitch4 = THREE.MathUtils.degToRad(32);
  const d4 = V(0, -Math.sin(pitch4), -Math.cos(pitch4));
  // pull-down arc from the drain lip into the steep slide pitch
  const R4a = 9;
  seg(7, (t) => {
    const a = pitch4 * t;
    return s4.clone().add(V(0, -R4a * (1 - Math.cos(a)), -R4a * Math.sin(a)));
  });
  const s4b = pts[pts.length - 1].clone();
  seg(16, (t) => s4b.clone().addScaledVector(d4, 34 * t));
  // pull out of the slide into the horizontal current
  const s4c = pts[pts.length - 1].clone();
  const R4 = 12;
  seg(8, (t) => {
    const a = -pitch4 + pitch4 * t;
    return s4c.clone().add(V(0, R4 * (Math.cos(-pitch4) - Math.cos(a)), R4 * (Math.sin(-pitch4) - Math.sin(a))));
  });
  mark('05');
  // ---- 05: long STRAIGHT perforated current tube (ref 05: concentric rings, ONE vanishing point);
  // the wide stream winds in S-curves inside it. Here only the straight line s5 → s5+L05 (slight
  // descent) is laid; the lateral S-offset meander05(u) is added after smoothing (see the end of
  // buildRoute). Offset and slope vanish at both ends, so 04 and 06 join tangentially and s6 (hence
  // 06/07/plunge/08) is unchanged. tube.ts builds the 05 tunnel on the line.
  const s5 = pts[pts.length - 1].clone();
  const L05 = V(0, -3, -S05.L);
  // 48 points (1.5-unit spacing) as before: the junction smoothing, hence the 04/05 and 05/06 stage
  // boundaries and the 06 checkpoint, stay exactly where they were
  seg(48, (t) => s5.clone().addScaledVector(L05, t));
  straight.push({ from: '05', to: '06', a: s5.clone(), b: s5.clone().add(L05), floorDepth: 3.3 });
  mark('06');
  // ---- 06: rinse arch — rises ~12 units, crests, curls down and to the right into the 07 tube ----
  // `?tun05=1` (round 31): a low crest (2.5 units) so the long approved 05 tunnel continues straight into 06 (the 12.5-unit arch
  // rose out of the tunnel right in front of the 05 view); the end point (hence 07, the plunge, 08 …) is the same.
  const ARCH06 = TUN05_COURSE ? 2.5 : 12.5;
  const s6 = pts[pts.length - 1].clone();
  seg(34, (t) =>
    V(
      s6.x - 4 * Math.sin(Math.PI * t) + (WORLD.chamber.center.x - s6.x) * smooth(0.4, 1, t),
      s6.y + ARCH06 * Math.pow(Math.sin(Math.PI * Math.min(t / 0.82, 1)), 1.15) - 4.5 * smooth(0.5, 1, t),
      s6.z - 46 * t,
    ),
  );
  mark('07');
  // ---- 07: winding washer tube (the visible stretch) ----
  const s7 = pts[pts.length - 1].clone();
  seg(32, (t) =>
    V(s7.x + 3.2 * Math.sin(3 * Math.PI * t) * Math.sin(Math.PI * t), s7.y + (WORLD.plunge.topY - s7.y) * t, s7.z - 60 * t),
  );
  mark('07_plunge_top');
  // ---- 07: THE DEEP PLUNGE — pull-down arc, long -70° straight, pull-up arc into the 08 inlet ----
  const p0 = pts[pts.length - 1].clone();
  const R = 14;
  const amax = THREE.MathUtils.degToRad(70);
  seg(12, (t) => {
    const a = amax * t;
    return p0.clone().add(V(0, -R * (1 - Math.cos(a)), -R * Math.sin(a)));
  });
  const p1 = pts[pts.length - 1].clone();
  const dPl = V(0, -Math.sin(amax), -Math.cos(amax));
  // straight length chosen so the bottom lands exactly on the chamber floor altitude
  const drop = p0.y - WORLD.plunge.bottomY;
  const Lstraight = (drop - 2 * R * (1 - Math.cos(amax))) / Math.sin(amax);
  seg(Math.ceil(Lstraight / 2), (t) => p1.clone().addScaledVector(dPl, Lstraight * t));
  mark('07_plunge_mid_end');
  const p2 = pts[pts.length - 1].clone();
  seg(12, (t) => {
    const a = -amax + amax * t;
    return p2.clone().add(V(0, R * (Math.cos(-amax) - Math.cos(a)), R * (Math.sin(-amax) - Math.sin(a))));
  });
  mark('07_plunge_bottom');
  const p3 = pts[pts.length - 1].clone();
  const zIn = WORLD.chamber.zBack;
  seg(4, (t) => V(p3.x, p3.y, p3.z + (zIn - p3.z) * t));
  mark('08');
  // ---- 08–10: Final Spin Chamber — winding stream toward the platform & towel ----
  const s8 = pts[pts.length - 1].clone();
  const plat = WORLD.platform;
  const end = V(plat.center.x, plat.topY + 0.45, plat.center.z + 0.6);
  // `?match08=1` (src/world/match08.ts, qa/match/08/NOTES.md): the 08–10 stream follows the APPROVED picture's painted
  // river (its centre line projected on the chamber floor from the locked 08 camera, assets/textures/match08/river08.json),
  // eased in over the first 3 u after the inlet and out over the last 4 u into the platform. Off: the formulas below.
  const m08 = flag05('match08') || flag05('matchall');
  const rz = river08.z.filter((z) => z >= -326), rxs = river08.x.slice(0, rz.length);
  const riverX = (z: number) => {
    if (z >= rz[0]) return rxs[0];
    for (let i = 1; i < rz.length; i++) if (z >= rz[i]) { const a = (z - rz[i - 1]) / (rz[i] - rz[i - 1]); return rxs[i - 1] + (rxs[i] - rxs[i - 1]) * a; }
    return rxs[rxs.length - 1];
  };
  const x08 = (z: number, xDefault: number) => {
    if (!m08) return xDefault;
    const wIn = smooth(0, 3, s8.z - z), wOut = smooth(0, 4, z - end.z);
    return s8.x + (riverX(z) - s8.x) * wIn * wOut + (end.x - s8.x) * (1 - wOut);
  };
  seg(14, (t) => V(x08(s8.z - 15 * t, s8.x + 3.6 * Math.sin(2 * Math.PI * t) * Math.sin(Math.PI * t)), s8.y, s8.z - 15 * t));
  mark('09');
  const s9 = pts[pts.length - 1].clone();
  seg(14, (t) => V(x08(s9.z - 15 * t, s9.x - 3.2 * Math.sin(Math.PI * t)), s9.y + 0.1 * t, s9.z - 15 * t));
  mark('10');
  const s10 = pts[pts.length - 1].clone();
  seg(10, (t) => {
    const z = s10.z + (end.z - s10.z) * t;
    return V(x08(z, s10.x + (end.x - s10.x) * t), s10.y + (end.y - s10.y) * smooth(0.3, 1, t), z);
  });
  mark('11');
  smoothPolyline(pts, marks['03'], 2.2, 3);
  // 05 meander: exact lateral offset from the straight tunnel line (after smoothing, see S05)
  const dir05 = L05.clone().normalize();
  for (let i = marks['05'] + 1; i < marks['06']; i++) {
    const u = pts[i].clone().sub(s5).dot(dir05) * (S05.L / L05.length());
    pts[i].x += meander05(u);
  }
  return { points: pts, marks, straight };
}

/**
 * Arc-length Gaussian smoothing of the polyline from index `from` to the end (endpoints fixed).
 * Removes tangent kinks where independently generated segments meet; the 02 tumble helix
 * (before `from`) is left untouched.
 */
function smoothPolyline(pts: THREE.Vector3[], from: number, sigma: number, passes: number) {
  for (let pass = 0; pass < passes; pass++) {
    const cum: number[] = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + pts[i].distanceTo(pts[i - 1]));
    const out = pts.map((p) => p.clone());
    for (let i = from + 1; i < pts.length - 1; i++) {
      const acc = new THREE.Vector3();
      let wsum = 0;
      for (let j = i - 12; j <= i + 12; j++) {
        if (j < from || j >= pts.length) continue;
        const d = cum[j] - cum[i];
        const w = Math.exp(-(d * d) / (2 * sigma * sigma));
        acc.addScaledVector(pts[j], w);
        wsum += w;
      }
      out[i].copy(acc.divideScalar(wsum));
    }
    for (let i = from + 1; i < pts.length - 1; i++) pts[i].copy(out[i]);
  }
}

export class Course {
  readonly curve: THREE.CatmullRomCurve3;
  readonly length: number;
  readonly stages: StageDef[];
  readonly marks: Record<string, number>; // arc-length of named marks
  /** straight tunnel stretches (05 current) — see StraightAxis */
  readonly straightAxes: StraightAxis[];
  /** world X of the straight 05 tunnel line (the meander is pos.x − line05x) */
  private readonly line05x: number;
  private st05!: StageDef;
  private st10!: StageDef;
  private readonly N: number;
  private readonly ds: number;
  private readonly P: Float32Array;
  private readonly T: Float32Array;
  private readonly U: Float32Array;

  constructor() {
    const route = buildRoute();
    this.curve = new THREE.CatmullRomCurve3(route.points, false, 'centripetal');
    // arc-length table over curve parameter u
    const M = route.points.length * 24;
    const us: number[] = [0];
    const ls: number[] = [0];
    let prev = this.curve.getPoint(0);
    for (let i = 1; i <= M; i++) {
      const u = i / M;
      const p = this.curve.getPoint(u);
      ls.push(ls[i - 1] + p.distanceTo(prev));
      us.push(u);
      prev = p;
    }
    this.length = ls[M];
    const uAtS = (s: number) => {
      let lo = 0, hi = M;
      while (hi - lo > 1) {
        const mid = (lo + hi) >> 1;
        if (ls[mid] < s) lo = mid; else hi = mid;
      }
      const f = (s - ls[lo]) / Math.max(1e-6, ls[hi] - ls[lo]);
      return us[lo] + (us[hi] - us[lo]) * f;
    };
    const sAtIndex = (i: number) => {
      const u = i / (route.points.length - 1);
      const k = Math.round(u * M);
      return ls[k];
    };
    this.marks = {};
    for (const [k, i] of Object.entries(route.marks)) this.marks[k] = sAtIndex(i);
    this.straightAxes = route.straight.map((r) => ({ s0: this.marks[r.from], s1: this.marks[r.to], a: r.a, b: r.b, floorDepth: r.floorDepth }));
    this.line05x = route.straight[0].a.x;

    // ---- stages ----
    const m = this.marks;
    const def = (id: StageId, s0: number, s1: number, o: Partial<StageDef>): StageDef => ({
      id, title: STAGE_TITLES[id], s0, s1, width: 5, tube: 0, tubeKind: 'none', speed: 11, refCoins: 0,
      interactive: true, bank: 1, ...o,
    });
    this.stages = [
      def('01', 0, 0.01, { width: 6, interactive: false, speed: 0 }),
      def('02', 0.01, m['03'], { width: 5, interactive: false, speed: 9, bank: 0 }),
      def('03', m['03'], m['04'], { width: 7, speed: 9, refCoins: 1330, bank: 2.2 }),
      def('04', m['04'], m['05'], { width: 4.4, tube: 4.8, tubeKind: 'gold', speed: 14, refCoins: 1330 }),
      // 05: level current (ref 05 shows no tilt) → weak curvature banking. `width` is the hand-over
      // value at the 04/06 junctions; inside the current widthAt() widens the stream to fill the floor.
      def('05', m['05'], m['06'], { width: 9, tube: 7.6, tubeKind: 'perf', speed: 11, refCoins: 1420, bank: 0.25 }),
      def('06', m['06'], m['07'], { width: 7, tube: 15, tubeKind: 'perf', speed: 11, refCoins: 1680, bank: 0.6 }),
      def('07', m['07'], m['08'], { width: 5.6, tube: 7.2, tubeKind: 'perf', speed: 12, refCoins: 1940 }),
      def('08', m['08'], m['09'], { width: 4.8, speed: 9.5, refCoins: 2040 }),
      def('09', m['09'], m['10'], { width: 6.4, speed: 9.5, refCoins: 2280 }),
      def('10', m['10'], m['11'], { width: 3.8, speed: 7.5, refCoins: 2500 }),
      def('11', m['11'], this.length, { width: 3, interactive: false, speed: 0, refCoins: 2500 }),
    ];

    // ---- dense frame table (pos, tangent, banked up) ----
    this.N = Math.ceil(this.length / 0.25) + 1;
    this.ds = this.length / (this.N - 1); // exact spacing so the last interval is not short
    this.P = new Float32Array(this.N * 3);
    this.T = new Float32Array(this.N * 3);
    this.U = new Float32Array(this.N * 3);
    const pos: THREE.Vector3[] = [];
    const tan: THREE.Vector3[] = [];
    for (let i = 0; i < this.N; i++) {
      const s = Math.min(this.length, i * this.ds);
      const u = uAtS(s);
      pos.push(this.curve.getPoint(u));
      tan.push(this.curve.getTangent(u).normalize());
    }
    // up: world-up projected off the tangent + curvature banking, then smoothed
    const WU = new THREE.Vector3(0, 1, 0);
    const ups: THREE.Vector3[] = [];
    let prevUp = WU.clone();
    for (let i = 0; i < this.N; i++) {
      const t = tan[i];
      let up = WU.clone().addScaledVector(t, -WU.dot(t));
      if (up.lengthSq() < 1e-4) up = prevUp.clone().addScaledVector(t, -prevUp.dot(t));
      up.normalize();
      // banking from lateral curvature
      const i0 = Math.max(0, i - 4), i1 = Math.min(this.N - 1, i + 4);
      const k = tan[i1].clone().sub(tan[i0]).divideScalar((i1 - i0) * this.ds);
      const right = new THREE.Vector3().crossVectors(t, up).normalize();
      const st = this.stageAtS(i * this.ds);
      const bankAngle = THREE.MathUtils.clamp(-k.dot(right) * 6 * st.bank, -0.85, 0.85);
      up.applyAxisAngle(t, bankAngle);
      ups.push(up);
      prevUp = up;
    }
    // smooth up vectors (box filter) & re-orthogonalize
    const sm: THREE.Vector3[] = ups.map((_, i) => {
      const acc = new THREE.Vector3();
      for (let j = -8; j <= 8; j++) acc.add(ups[THREE.MathUtils.clamp(i + j, 0, this.N - 1)]);
      const t = tan[i];
      return acc.addScaledVector(t, -acc.dot(t)).normalize();
    });
    for (let i = 0; i < this.N; i++) {
      pos[i].toArray(this.P, i * 3);
      tan[i].toArray(this.T, i * 3);
      sm[i].toArray(this.U, i * 3);
    }
    this.st05 = this.stage('05');
    this.st10 = this.stage('10');
    // '05_crest': the first meander crest (stream furthest left, heading parallel to the tunnel
    // axis) — the 05 QA checkpoint, where Benny faces the vanishing point down the straight tube
    let best = this.st05.s0 + S05.uCrest, dMin = Infinity;
    for (let s = this.st05.s0 + 4; s < this.st05.s0 + S05.uCrest + S05.lambda / 4; s += 0.05) {
      const d = this.offset05(s);
      if (d < dMin) { dMin = d; best = s; }
    }
    this.marks['05_crest'] = best;
  }

  /** 05 current: lateral offset (units, +X) of the stream centreline from the straight tunnel line */
  offset05(s: number): number {
    const st = this.st05;
    if (s <= st.s0 || s >= st.s1) return 0;
    return this.sample(s).pos.x - this.line05x;
  }

  stageAtS(s: number): StageDef {
    for (const st of this.stages) if (s < st.s1) return st;
    return this.stages[this.stages.length - 1];
  }

  stage(id: StageId): StageDef {
    return this.stages.find((s) => s.id === id)!;
  }

  /**
   * smoothly blended per-stage property (blend ±blend units around stage boundaries).
   * Accepts either argument order: prop(s, 'width') or prop('width', s).
   */
  prop(s: number, key: StageProp, blend?: number): number;
  prop(key: StageProp, s: number, blend?: number): number;
  prop(a: number | StageProp, b: number | StageProp, blend = 6): number {
    const s = (typeof a === 'number' ? a : b) as number;
    const key = (typeof a === 'string' ? a : b) as StageProp;
    let v = 0, w = 0;
    for (const st of this.stages) {
      const a = smooth(st.s0 - blend, st.s0 + blend, s) * (1 - smooth(st.s1 - blend, st.s1 + blend, s));
      if (a > 0) { v += st[key] * a; w += a; }
    }
    return w > 0 ? v / w : this.stageAtS(s)[key];
  }

  widthAt(s: number): number {
    let base = this.prop(s, 'width');
    // 05 current (ref 05): the water fills the tube floor wall to wall. The centreline winds by
    // offset05(s), so the half width is S05.extent − |offset| (smooth abs): the outer edge of each bend
    // stays on the same tube chord (constant tunnel radius/depth in tube.ts) and the inner side of a
    // bend leaves a narrow bank for the foam, like a river.
    const st5 = this.st05;
    const k = smooth(st5.s0 + 0.5, st5.s0 + 10, s) * (1 - smooth(st5.s1 - 10, st5.s1 - 0.5, s));
    if (k > 0) {
      const d = this.offset05(s);
      base += (2 * (S05.extent - Math.sqrt(d * d + 0.09)) - base) * k;
    }
    // the stream narrows into the towel opening at the very end of 10
    const st10 = this.st10;
    return base * (1 - 0.35 * smooth(st10.s1 - 8, st10.s1, s));
  }

  sample(s: number, out?: CourseSample): CourseSample {
    const o = out ?? { s: 0, pos: new THREE.Vector3(), tan: new THREE.Vector3(), up: new THREE.Vector3(), right: new THREE.Vector3() };
    const x = THREE.MathUtils.clamp(s, 0, this.length) / this.ds;
    const i = Math.min(this.N - 2, Math.floor(x));
    const f = x - i;
    const lerp3 = (A: Float32Array, v: THREE.Vector3) =>
      v.set(
        A[i * 3] + (A[i * 3 + 3] - A[i * 3]) * f,
        A[i * 3 + 1] + (A[i * 3 + 4] - A[i * 3 + 1]) * f,
        A[i * 3 + 2] + (A[i * 3 + 5] - A[i * 3 + 2]) * f,
      );
    o.s = s;
    lerp3(this.P, o.pos);
    lerp3(this.T, o.tan).normalize();
    lerp3(this.U, o.up);
    o.up.addScaledVector(o.tan, -o.up.dot(o.tan)).normalize();
    o.right.crossVectors(o.tan, o.up).normalize();
    return o;
  }

  /** world position on the water at arc-length s with lateral offset (− left, + right) and height */
  pointAt(s: number, lateral = 0, height = 0, out = new THREE.Vector3()): THREE.Vector3 {
    const f = this.sample(s);
    return out.copy(f.pos).addScaledVector(f.right, lateral).addScaledVector(f.up, height);
  }
}

export interface ContinuityReport {
  ok: boolean;
  boundaries: { from: StageId; to: StageId; s: number; posGap: number; tangentAngleDeg: number; upAngleDeg: number; altitude: number }[];
  maxStepTangentDeg: number;
  maxStepPos: number;
  plunge: { entryAltitude07: number; plungeTop: { s: number; y: number }; plungeMid: { s: number; y: number }; plungeBottom: { s: number; y: number }; inlet08: { s: number; y: number }; verticalDrop: number; minPitchDeg: number };
}

/** Numerical continuity validation of the whole route. */
export function validateContinuity(c: Course): ContinuityReport {
  const eps = 0.02;
  const boundaries = c.stages.slice(0, -1).map((st, i) => {
    const nx = c.stages[i + 1];
    const sa = Math.max(st.s1 - eps, 0);
    const sb = Math.min(st.s1 + eps, c.length); // 11 starts at the route end (cinematic)
    const a = c.sample(sa);
    const b = c.sample(sb);
    return {
      from: st.id,
      to: nx.id,
      s: +st.s1.toFixed(2),
      posGap: +(a.pos.distanceTo(b.pos) - (sb - sa)).toFixed(4),
      tangentAngleDeg: +THREE.MathUtils.radToDeg(a.tan.angleTo(b.tan)).toFixed(3),
      upAngleDeg: +THREE.MathUtils.radToDeg(a.up.angleTo(b.up)).toFixed(3),
      altitude: +a.pos.y.toFixed(2),
    };
  });
  let maxT = 0, maxP = 0;
  const step = 0.25;
  let prev = c.sample(0);
  let minPitch = 0;
  const rideStart = c.stage('03').s0; // 01–02 tumble helix is a cinematic, checked for gaps only
  for (let s = step; s <= c.length; s += step) {
    const cur = c.sample(s);
    if (s > rideStart + step) maxT = Math.max(maxT, THREE.MathUtils.radToDeg(prev.tan.angleTo(cur.tan)));
    maxP = Math.max(maxP, prev.pos.distanceTo(cur.pos));
    if (s > c.marks['07_plunge_top'] && s < c.marks['08']) minPitch = Math.min(minPitch, THREE.MathUtils.radToDeg(Math.asin(cur.tan.y)));
    prev = { ...cur, pos: cur.pos.clone(), tan: cur.tan.clone(), up: cur.up.clone(), right: cur.right.clone() };
  }
  const y = (s: number) => +c.sample(s).pos.y.toFixed(2);
  const top = c.marks['07_plunge_top'];
  const bottom = c.marks['07_plunge_bottom'];
  const mid = (top + bottom) / 2;
  const inlet = c.marks['08'];
  const plunge = {
    entryAltitude07: y(c.stage('07').s0),
    plungeTop: { s: +top.toFixed(2), y: y(top) },
    plungeMid: { s: +mid.toFixed(2), y: y(mid) },
    plungeBottom: { s: +bottom.toFixed(2), y: y(bottom) },
    inlet08: { s: +inlet.toFixed(2), y: y(inlet) },
    verticalDrop: +(y(top) - y(inlet)).toFixed(2),
    minPitchDeg: +minPitch.toFixed(1),
  };
  const ok =
    boundaries.every((b) => Math.abs(b.posGap) < 0.01 && b.tangentAngleDeg < 1 && b.upAngleDeg < 2) &&
    maxP < step * 1.05 &&
    maxT < 8 && // ≥1.8-unit turn radius anywhere on the ride (tightest: the drop into the 03 drain)
    plunge.verticalDrop > 50 &&
    plunge.inlet08.y < plunge.entryAltitude07 - 50;
  return { ok, boundaries, maxStepTangentDeg: +maxT.toFixed(3), maxStepPos: +maxP.toFixed(4), plunge };
}
