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

export type StageId = '01' | '02' | '03' | '04' | '05' | '06' | '07' | '08' | '09' | '10' | '11';
export type TubeKind = 'none' | 'chute' | 'gold' | 'perf';

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
  basin: { center: new THREE.Vector3(2, -16, -19), rimRadius: 11.5, rimY: -10.6, drainRadius: 2.6, drainY: -20.2 },
  /** Final Spin Chamber (08–11): drum with axis along Z, door at the far (-Z) end */
  chamber: { center: new THREE.Vector3(12, -101.1, 0), radius: 13.5, zBack: -280, zDoor: -332, floorY: -113.6, doorRadius: 6.2 },
  platform: { center: new THREE.Vector3(12, -110.6, -322.5), radius: 6.2, topY: -110.6 },
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

interface RouteData {
  points: THREE.Vector3[];
  marks: Record<string, number>;
}

/** Generates the dense control polyline of the route (absolute coordinates). */
function buildRoute(): RouteData {
  const pts: THREE.Vector3[] = [];
  const marks: Record<string, number> = {};
  const push = (p: THREE.Vector3) => {
    if (pts.length && p.distanceTo(pts[pts.length - 1]) < 0.6) return;
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
  // ---- 03: whirlpool twirl — one inward turn down the funnel, ending heading -Z into the drain ----
  seg(44, (t) => {
    const th = -Math.PI / 2 - Math.PI * 2 * t; // decreasing angle; tangent = (-cos, +sin)
    const r = 9.6 + (2.0 - 9.6) * (1 - Math.pow(1 - t, 1.25));
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
  // ---- 05: horizontal S-shaped current in the perforated tube ----
  const s5 = pts[pts.length - 1].clone();
  seg(36, (t) =>
    V(s5.x + 6.5 * Math.sin(2 * Math.PI * t) * Math.sin(Math.PI * t), s5.y - 3 * t, s5.z - 72 * t),
  );
  mark('06');
  // ---- 06: rinse arch — rises ~12 units, crests, curls down and to the right into the 07 tube ----
  const s6 = pts[pts.length - 1].clone();
  seg(34, (t) =>
    V(
      s6.x - 4 * Math.sin(Math.PI * t) + 12 * smooth(0.4, 1, t),
      s6.y + 12.5 * Math.pow(Math.sin(Math.PI * Math.min(t / 0.82, 1)), 1.15) - 4.5 * smooth(0.5, 1, t),
      s6.z - 46 * t,
    ),
  );
  mark('07');
  // ---- 07: winding washer tube (the visible stretch) ----
  const s7 = pts[pts.length - 1].clone();
  seg(32, (t) =>
    V(s7.x + 5.5 * Math.sin(3 * Math.PI * t) * Math.sin(Math.PI * t), s7.y + (WORLD.plunge.topY - s7.y) * t, s7.z - 60 * t),
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
  seg(14, (t) => V(s8.x + 3.6 * Math.sin(2 * Math.PI * t) * Math.sin(Math.PI * t), s8.y, s8.z - 15 * t));
  mark('09');
  const s9 = pts[pts.length - 1].clone();
  seg(14, (t) => V(s9.x - 3.2 * Math.sin(Math.PI * t), s9.y + 0.1 * t, s9.z - 15 * t));
  mark('10');
  const s10 = pts[pts.length - 1].clone();
  const end = V(plat.center.x, plat.topY + 0.45, plat.center.z + 0.6);
  seg(10, (t) =>
    V(s10.x + (end.x - s10.x) * t, s10.y + (end.y - s10.y) * smooth(0.3, 1, t), s10.z + (end.z - s10.z) * t),
  );
  mark('11');
  return { points: pts, marks };
}

export class Course {
  readonly curve: THREE.CatmullRomCurve3;
  readonly length: number;
  readonly stages: StageDef[];
  readonly marks: Record<string, number>; // arc-length of named marks
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
      def('05', m['05'], m['06'], { width: 6.2, tube: 7.6, tubeKind: 'perf', speed: 11, refCoins: 1420 }),
      def('06', m['06'], m['07'], { width: 7, tube: 15, tubeKind: 'perf', speed: 11, refCoins: 1680, bank: 0.6 }),
      def('07', m['07'], m['08'], { width: 5.6, tube: 7.2, tubeKind: 'perf', speed: 12, refCoins: 1940 }),
      def('08', m['08'], m['09'], { width: 4.8, speed: 9.5, refCoins: 2040 }),
      def('09', m['09'], m['10'], { width: 6.4, speed: 9.5, refCoins: 2280 }),
      def('10', m['10'], m['11'], { width: 3.8, speed: 7.5, refCoins: 2500 }),
      def('11', m['11'], this.length, { width: 3, interactive: false, speed: 0, refCoins: 2500 }),
    ];

    // ---- dense frame table (pos, tangent, banked up) ----
    this.ds = 0.25;
    this.N = Math.ceil(this.length / this.ds) + 1;
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
  }

  stageAtS(s: number): StageDef {
    for (const st of this.stages) if (s < st.s1) return st;
    return this.stages[this.stages.length - 1];
  }

  stage(id: StageId): StageDef {
    return this.stages.find((s) => s.id === id)!;
  }

  /** smoothly blended per-stage property (blend ±blend units around stage boundaries) */
  prop(s: number, key: 'width' | 'tube' | 'speed' | 'bank', blend = 6): number {
    let v = 0, w = 0;
    for (const st of this.stages) {
      const a = smooth(st.s0 - blend, st.s0 + blend, s) * (1 - smooth(st.s1 - blend, st.s1 + blend, s));
      if (a > 0) { v += st[key] * a; w += a; }
    }
    return w > 0 ? v / w : this.stageAtS(s)[key];
  }

  widthAt(s: number): number {
    // the stream narrows into the towel opening at the very end of 10
    const st10 = this.stage('10');
    const base = this.prop(s, 'width');
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
    const a = c.sample(st.s1 - eps);
    const b = c.sample(st.s1 + eps);
    return {
      from: st.id,
      to: nx.id,
      s: +st.s1.toFixed(2),
      posGap: +(a.pos.distanceTo(b.pos) - 2 * eps).toFixed(4),
      tangentAngleDeg: +THREE.MathUtils.radToDeg(a.tan.angleTo(b.tan)).toFixed(3),
      upAngleDeg: +THREE.MathUtils.radToDeg(a.up.angleTo(b.up)).toFixed(3),
      altitude: +a.pos.y.toFixed(2),
    };
  });
  let maxT = 0, maxP = 0;
  const step = 0.25;
  let prev = c.sample(0);
  let minPitch = 0;
  for (let s = step; s <= c.length; s += step) {
    const cur = c.sample(s);
    maxT = Math.max(maxT, THREE.MathUtils.radToDeg(prev.tan.angleTo(cur.tan)));
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
    maxT < 6 &&
    plunge.verticalDrop > 50 &&
    plunge.inlet08.y < plunge.entryAltitude07 - 50;
  return { ok, boundaries, maxStepTangentDeg: +maxT.toFixed(3), maxStepPos: +maxP.toFixed(4), plunge };
}
