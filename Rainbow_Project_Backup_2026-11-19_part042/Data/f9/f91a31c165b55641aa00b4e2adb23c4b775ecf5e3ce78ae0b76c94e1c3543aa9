/**
 * Third-person ride camera: behind/above Benny, looking along his heading (the course tangent), or
 * along the straight tunnel axis inside the 05–07 tube so the gold rings converge to one vanishing point
 * as in the references. Pitch & roll follow the banked path smoothly — including the 07 plunge.
 */
import * as THREE from 'three';
import { WORLD } from '../world/course';
import type { Course, StageId } from '../world/course';
import type { TubePath } from '../world/tube';
import { applyMatchCam } from './match';
import { CAMCLEAR } from './camClear';

export interface CamParams {
  back: number; // distance behind Benny
  up: number; // height above Benny's water point
  ahead: number; // look-at distance ahead
  lookUp: number; // look-at height
  fov: number;
  latFollow: number; // 1 = camera fully follows Benny's lateral offset
  roll: number; // 0..1 how much of the path bank the camera adopts
  /** 05 only: view yaw (deg) to the LEFT of the tunnel axis, i.e. the vanishing point sits right of centre */
  yaw?: number;
  /** 05 only: lateral dead zone (units): the camera holds the tunnel axis while Benny is within ~this of it */
  deadZone?: number;
  /** `?match07=1` only (src/game/match.ts): extra view yaw (deg, + = look LEFT → scene moves right) and camera side
   *  shift (units along the view right) over the 07 stage; absent = no change */
  yaw07?: number;
  side07?: number;
  /** `?match08=1` only (src/game/match.ts): over the 08 stage the camera sits at Benny's water point + this world
   *  offset and looks at the fixed world point aim08 (the approved picture's view toward the door); absent = no change */
  off08?: [number, number, number];
  aim08?: [number, number, number];
}

export const STAGE_CAM: Partial<Record<StageId, CamParams>> = {
  '03': { back: 6.5, up: 6.5, ahead: 6, lookUp: -1.5, fov: 64, latFollow: 0.3, roll: 0.3 },
  '04': { back: 8.5, up: 5.2, ahead: 14, lookUp: -3.0, fov: 66, latFollow: 0.6, roll: 0.4 },
  // 05: level rear chase down the straight current tube, camera ON the tunnel axis (rings concentric).
  // Ref 05 measured at vFOV 62: VP (498, 479) → view pitched atan((up-lookUp)/(ahead+back)) ≈ 12.7°
  // below and yawed ≈ 3° left of the axis; Benny's waterline 711 px below the VP → up/back ≈ 0.56.
  '05': { back: 6.4, up: 3.6, ahead: 18, lookUp: -1.92, fov: 62, latFollow: 0.85, roll: 0, yaw: 2.96, deadZone: 1.0 },
  '06': { back: 5.6, up: 2.6, ahead: 12, lookUp: 3.4, fov: 66, latFollow: 0.7, roll: 0.4 },
  '07': { back: 6.4, up: 4.1, ahead: 18, lookUp: 1.8, fov: 62, latFollow: 0.6, roll: 0.6 },
  '08': { back: 6.2, up: 3.7, ahead: 16, lookUp: 0.2, fov: 62, latFollow: 0.8, roll: 0.3 },
  '09': { back: 6.2, up: 3.7, ahead: 15, lookUp: 0.6, fov: 62, latFollow: 0.8, roll: 0.3 },
  '10': { back: 5.8, up: 3.4, ahead: 11, lookUp: 1.2, fov: 62, latFollow: 0.8, roll: 0.2 },
};
// `?matchNN=1` (src/game/match.ts): the approved picture's camera framing for that screen; no switch: no change
applyMatchCam(STAGE_CAM);

/** the blended (required) numeric keys; 05-only extras (yaw, deadZone) are read directly from STAGE_CAM */
type BlendKey = 'back' | 'up' | 'ahead' | 'lookUp' | 'fov' | 'latFollow' | 'roll';
const KEYS: BlendKey[] = ['back', 'up', 'ahead', 'lookUp', 'fov', 'latFollow', 'roll'];

export function camParamsAt(course: Course, s: number, blend = 8): CamParams {
  const acc: CamParams = { back: 0, up: 0, ahead: 0, lookUp: 0, fov: 0, latFollow: 0, roll: 0 };
  let w = 0;
  for (const st of course.stages) {
    const p = STAGE_CAM[st.id];
    if (!p) continue;
    const a = THREE.MathUtils.smoothstep(s, st.s0 - blend, st.s0 + blend) * (1 - THREE.MathUtils.smoothstep(s, st.s1 - blend, st.s1 + blend));
    if (a <= 0) continue;
    for (const k of KEYS) acc[k] += p[k] * a;
    w += a;
  }
  if (w === 0) return { ...(STAGE_CAM['03'] as CamParams) };
  for (const k of KEYS) acc[k] /= w;
  return acc;
}

export class RideCamera {
  readonly pos = new THREE.Vector3();
  readonly target = new THREE.Vector3();
  readonly up = new THREE.Vector3(0, 1, 0);
  fov = 70;
  private init = false;
  /** `?camclear=1`: the 03 drain chute's fixed downhill heading (horizontal), for steadyUp0304 */
  private lipHeading: THREE.Vector3 | null = null;
  /** optional straight tunnel axis + the s-range where the camera aligns to it */
  axis: { path: TubePath; s0: number; s1: number } | null = null;

  constructor(private course: Course) {}

  /** desired pose for Benny at (s, lateral) */
  desired(s: number, lat: number, outPos: THREE.Vector3, outTarget: THREE.Vector3, outUp: THREE.Vector3): CamParams {
    const p = camParamsAt(this.course, s);
    const f = this.course.sample(s);
    const fb = this.course.sample(Math.max(0, s - p.back * 0.5)); // smoothing of heading
    const dir = f.tan.clone().lerp(fb.tan, 0.35).normalize();
    let up = f.up.clone();
    if (this.axis) {
      const a = this.axis;
      const w = THREE.MathUtils.smoothstep(s, a.s0, a.s0 + 10) * (1 - THREE.MathUtils.smoothstep(s, a.s1 - 10, a.s1));
      if (w > 0) {
        const af = a.path.frame(s);
        dir.lerp(af.tan, w).normalize();
        up.lerp(af.up, w).normalize();
      }
    }
    up.addScaledVector(dir, -up.dot(dir)).normalize();
    const right = new THREE.Vector3().crossVectors(dir, up).normalize();
    const benny = f.pos.clone().addScaledVector(f.right, lat);
    const anchor = benny.clone().addScaledVector(right, -lat * (1 - p.latFollow));
    // offsets use an 'upright' up: banking only tilts the camera as much as `roll` allows
    const upPos = new THREE.Vector3(0, 1, 0).lerp(up, Math.max(p.roll, Math.abs(dir.y))).normalize();
    // position: ON the curved course behind Benny (stays inside bending/pitching tubes, e.g. the
    // 07 pull-up arc); aim: along his heading so he stays centred in winding streams
    const fbk = this.course.sample(Math.max(0, s - p.back));
    const upB = new THREE.Vector3(0, 1, 0).lerp(fbk.up, Math.max(p.roll, Math.abs(fbk.tan.y))).normalize();
    const straightPos = anchor.clone().addScaledVector(dir, -p.back).addScaledVector(upPos, p.up);
    const curvedPos = fbk.pos.clone().addScaledVector(fbk.right, lat * p.latFollow).addScaledVector(upB, p.up);
    // use the curved position where the path bends in pitch (plunge arcs), straight elsewhere
    const pitchBend = THREE.MathUtils.clamp(Math.abs(fbk.tan.y - f.tan.y) * 6, 0, 1);
    outPos.copy(straightPos).lerp(curvedPos, Math.max(pitchBend, 0.35));
    outTarget.copy(anchor).addScaledVector(dir, p.ahead).addScaledVector(upPos, p.lookUp);
    outUp.set(0, 1, 0).lerp(up, p.roll).normalize();
    // `?match07=1`: approved-picture framing in 07 — yaw the view and shift the camera sideways (both 0 / absent by default)
    const p7 = STAGE_CAM['07'];
    if (p7 && (p7.yaw07 || p7.side07)) {
      const st7 = this.course.stage('07');
      const sTop = this.course.marks['07_plunge_top'];
      const w7 = THREE.MathUtils.smoothstep(s, st7.s0 + 2, st7.s0 + 10) * (1 - THREE.MathUtils.smoothstep(s, sTop - 12, sTop - 2));
      if (w7 > 0) {
        const fwd = outTarget.clone().sub(outPos);
        fwd.applyAxisAngle(outUp, THREE.MathUtils.degToRad((p7.yaw07 ?? 0) * w7));
        const side = new THREE.Vector3().crossVectors(fwd, outUp).normalize().multiplyScalar((p7.side07 ?? 0) * w7);
        outPos.add(side);
        outTarget.copy(outPos).add(fwd);
      }
    }
    // `?match08=1`: the approved Screen 08 view — camera at Benny + off08 (world), aimed at aim08 near the chamber door,
    // level (no bank roll); blended in just before the 08 checkpoint and out before 09 (absent = no change)
    const p8 = STAGE_CAM['08'];
    if (p8 && p8.off08 && p8.aim08) {
      const st8 = this.course.stage('08');
      const wIn8 = THREE.MathUtils.smoothstep(s, st8.s0 - 3, st8.s0 + 1.5);
      let wOut8 = 1 - THREE.MathUtils.smoothstep(s, st8.s1 - 10, st8.s1 - 1);
      let b8 = benny;
      if (CAMCLEAR) {
        // `?camclear=1`: the projected 08 scenery is exact only from the approved viewpoint, so the camera stops THERE (the
        // '08' checkpoint, s0 + 2) and holds it while Benny rides on into the picture, whatever his steering (lateral → 0
        // as the view blends in); it leaves for 09 only over the last 3 u of 08. At and before the checkpoint with lat 0
        // this is exactly the previous pose (approved still view unchanged).
        const sLock = st8.s0 + 2.0;
        if (s > sLock) wOut8 = Math.max(wOut8, 1 - THREE.MathUtils.smoothstep(s, st8.s1 - 3, st8.s1 + 2));
        const f8 = this.course.sample(Math.min(s, sLock));
        b8 = f8.pos.clone().addScaledVector(f8.right, lat * (1 - wIn8));
      }
      const w8 = wIn8 * wOut8;
      if (w8 > 0) {
        outPos.lerp(b8.clone().add(new THREE.Vector3(...p8.off08)), w8);
        outTarget.lerp(new THREE.Vector3(...p8.aim08), w8);
        outUp.lerp(new THREE.Vector3(0, 1, 0), w8).normalize();
      }
    }
    // `?camclear=1` 06 rinse arch: where the stream climbs the wall the chase camera ends up at the wall itself, looking
    // up at it (the drum wall + a gold band fill the view). Keep the camera inside the tube (≥ 2.5 u from the wall) while
    // Benny is inside it, and turn the view toward the tunnel's vanishing point (the approved 06 looks down the tunnel,
    // ≈9° below its axis), only as far as Benny stays well inside the frame. Off: unchanged.
    if (CAMCLEAR && this.axis) this.clear06(s, p, benny, outPos, outTarget);
    // 03 whirlpool: dynamic high angle from the near side, looking down into the vortex toward the
    // drain and the porthole wall (Benny left, drain lower-right as in the reference)
    const st3 = this.course.stage('03');
    const w3 = THREE.MathUtils.smoothstep(s, st3.s0 - 6, st3.s0 + 2) * (1 - THREE.MathUtils.smoothstep(s, st3.s1 - 6, st3.s1 + 1));
    if (w3 > 0) {
      const B = WORLD.basin;
      const wp = benny.clone().add(new THREE.Vector3(2.8, 3.6, 5.6));
      const drain = new THREE.Vector3(B.center.x, B.drainY, B.center.z);
      const wt = benny.clone().lerp(drain, 0.2).add(new THREE.Vector3(0.6, -1.0, -2.4));
      outPos.lerp(wp, w3);
      outTarget.lerp(wt, w3);
      outUp.lerp(new THREE.Vector3(0, 1, 0), w3).normalize();
    }
    // 05 straight current tube: the '05' preset measured in the straight tunnel's own frame — aimed
    // along the tunnel axis (not Benny's S-curve heading) so the gold rings stay concentric on ONE
    // vanishing point, level (no roll). Laterally the camera rides the tunnel axis while Benny is near
    // it and eases toward him (latFollow) only as he swings wide (Gaussian dead zone), so the rings
    // stay concentric on the ref composition and Benny never leaves the frame when steering.
    const st5 = this.course.stage('05');
    const p5 = STAGE_CAM['05'] as CamParams;
    const w5 = this.axis ? THREE.MathUtils.smoothstep(s, st5.s0 + 1, st5.s0 + 8) * (1 - THREE.MathUtils.smoothstep(s, st5.s1 - 9, st5.s1 - 1)) : 0;
    if (w5 > 0 && this.axis) {
      const af = this.axis.path.frame(s);
      const T = af.tan.clone();
      const U = new THREE.Vector3(0, 1, 0).addScaledVector(T, -T.y).normalize();
      const Rt = new THREE.Vector3().crossVectors(T, U).normalize();
      const water = f.pos.clone().addScaledVector(f.right, lat); // Benny's point on the stream
      const off = water.clone().sub(af.pos).dot(Rt); // his lateral offset from the tunnel axis
      const dz = p5.deadZone ?? 1;
      const follow = p5.latFollow * (1 - Math.exp(-(off * off) / (dz * dz)));
      const cp = water.addScaledVector(T, -p5.back).addScaledVector(U, p5.up).addScaledVector(Rt, -off * (1 - follow));
      const pitch = Math.atan2(p5.up - p5.lookUp, p5.ahead + p5.back);
      const yaw = THREE.MathUtils.degToRad(p5.yaw ?? 0);
      const look = T.clone().multiplyScalar(Math.cos(pitch) * Math.cos(yaw)).addScaledVector(U, -Math.sin(pitch)).addScaledVector(Rt, -Math.cos(pitch) * Math.sin(yaw));
      outPos.lerp(cp, w5);
      outTarget.lerp(cp.clone().addScaledVector(look, p5.ahead + p5.back), w5);
      outUp.lerp(U, w5).normalize();
    }
    return p;
  }

  /**
   * `?camclear=1` only — 03 → 04 drain drop: the view trails 10–13 u above and beside Benny while he falls down the drain
   * chute, so the chute's own falling water passes between the view and Benny for ~0.6 s (60–100 % of him hidden, a
   * frame-filling striped sheet; the user's recording at 7 s). Over that stretch only, the smoothed view rides ON the
   * stream 3.5 u behind Benny, 1.4 u above the water (the water he rides can then never come between), aim unchanged; it
   * blends in and back out over a few metres of the ride. Off: unchanged.
   * Round 4: the blend-in is spread over 6 u (was 2.5 u: a one-frame 18° jolt as the view swung over), the view rides
   * 3.4 u above the water (was 1.6: the curling chute water then filled the lower screen) aimed at Benny himself (was
   * 1.5 u ahead: he sat cut off at the left screen edge), never looks down steeper than ~56°, and the returned weight
   * steadies the picture's "up" over the lip (see steadyUp0304). Lip probe: Benny hidden max 44 % → 25 %.
   */
  private clear0304(s: number, lat: number): number {
    const s3 = this.course.stage('03').s1;
    const w = THREE.MathUtils.smoothstep(s, s3 - 8, s3 - 2) * (1 - THREE.MathUtils.smoothstep(s, s3 + 6, s3 + 12));
    if (w <= 0) return 0;
    // world up, not the stream's own up: the chute water twists over the drain lip, and a view tied to its up would
    // swing underneath it
    const f = this.course.sample(Math.max(0, s - 3));
    const p = f.pos.clone().addScaledVector(f.right, lat).add(new THREE.Vector3(0, 3.4, 0));
    this.pos.lerp(p, w);
    // aim at Benny (a little below his centre line ahead), so he stays in the frame while the view swings behind him
    const fb = this.course.sample(s + 0.5);
    this.target.lerp(fb.pos.clone().addScaledVector(fb.right, lat), w);
    // never look down steeper than ~56° while the view swings over (it tipped to ~70° for a moment): same heading,
    // aim point raised; Benny stays well inside the frame (at most ~15° below its centre)
    const d = this.target.clone().sub(this.pos);
    const h = Math.hypot(d.x, d.z), len = d.length();
    const maxDown = 0.83 * len; // sin(56°)
    if (-d.y > maxDown && h > 1e-3) {
      const y = -maxDown, hh = Math.sqrt(len * len - y * y);
      const lim = new THREE.Vector3(d.x / h * hh, y, d.z / h * hh);
      this.target.copy(this.pos).add(d.lerp(lim, Math.min(1, w * 4)));
    }
    return w;
  }

  /**
   * `?camclear=1` only — the picture's "up" over the 03 → 04 drain lip, anchored to the world instead of the twisting
   * chute water: world up made square to the view, leaning toward the chute's fixed downhill heading as the view turns
   * steeply down (so it is never undefined and can never flip), blended in with the drop weight `w`. Applied AFTER the
   * usual easing of the up vector: it follows the view direction exactly, so the fast swing over the lip adds no tilt.
   */
  private steadyUp0304(w: number, up: THREE.Vector3) {
    if (w <= 0) return;
    if (!this.lipHeading) {
      const t = this.course.sample(this.course.stage('03').s1).tan;
      this.lipHeading = new THREE.Vector3(t.x, 0, t.z).normalize();
    }
    const d = this.target.clone().sub(this.pos).normalize();
    const v = THREE.MathUtils.smoothstep(Math.abs(d.y), 0.9, 0.99);
    const ref = new THREE.Vector3(0, 1, 0).multiplyScalar(1 - v).addScaledVector(this.lipHeading, v * Math.sign(-d.y || 1));
    ref.addScaledVector(d, -ref.dot(d));
    if (ref.lengthSq() < 1e-6) return;
    up.lerp(ref.normalize(), w).normalize();
  }

  /** `?camclear=1` only — see desired() */
  private clear06(s: number, p: CamParams, benny: THREE.Vector3, outPos: THREE.Vector3, outTarget: THREE.Vector3) {
    const a = this.axis;
    if (!a) return;
    const st6 = this.course.stage('06');
    const w6 = THREE.MathUtils.smoothstep(s, st6.s0 + 1, st6.s0 + 6) * (1 - THREE.MathUtils.smoothstep(s, st6.s1 - 4, st6.s1 + 2));
    if (w6 <= 0) return;
    const axisAt = (ss: number) => {
      const f = a.path.frame(ss);
      return { f, c: f.pos.clone().addScaledVector(f.up, a.path.radius(ss) - a.path.depth(ss)), R: a.path.radius(ss) };
    };
    const radial = (q: THREE.Vector3, ax: ReturnType<typeof axisAt>) => {
      const d = q.clone().sub(ax.c);
      return d.addScaledVector(ax.f.tan, -d.dot(ax.f.tan));
    };
    // 1. inside the tube while Benny is: radial distance of the camera ≤ R − 2.5
    const axB = axisAt(s);
    const bennyIn = 1 - THREE.MathUtils.smoothstep(radial(benny, axB).length(), axB.R - 2.5, axB.R - 1.0);
    const axC = axisAt(Math.max(0, s - p.back));
    const rv = radial(outPos, axC);
    const rMax = axC.R - 2.5;
    const rl = rv.length();
    if (rl > rMax && bennyIn > 0) outPos.addScaledVector(rv, -(1 - rMax / rl) * w6 * bennyIn);
    // 2. look toward the tunnel's vanishing point (axis tangent pitched ≈9° down), while Benny stays inside ±20° of it
    const T = axC.f.tan.clone();
    const Up = new THREE.Vector3(0, 1, 0).addScaledVector(T, -T.y).normalize();
    const look = T.multiplyScalar(Math.cos(0.157)).addScaledVector(Up, -Math.sin(0.157)).normalize();
    const cur = outTarget.clone().sub(outPos);
    const dist = cur.length();
    const toB = benny.clone().sub(outPos).normalize();
    const off = Math.acos(THREE.MathUtils.clamp(look.dot(toB), -1, 1));
    const k = w6 * (1 - THREE.MathUtils.smoothstep(off, 0.26, 0.42));
    if (k > 0) outTarget.copy(outPos).add(cur.normalize().lerp(look, k).normalize().multiplyScalar(dist));
  }

  update(dt: number, s: number, lat: number, cam: THREE.PerspectiveCamera, snap = false) {
    const dp = new THREE.Vector3(), dt3 = new THREE.Vector3(), du = new THREE.Vector3();
    const p = this.desired(s, lat, dp, dt3, du);
    const k = snap || !this.init ? 1 : 1 - Math.exp(-dt * 7);
    const kt = snap || !this.init ? 1 : 1 - Math.exp(-dt * 9);
    this.pos.lerp(dp, k);
    this.target.lerp(dt3, kt);
    const w0304 = CAMCLEAR ? this.clear0304(s, lat) : 0;
    this.up.lerp(du, kt).normalize();
    if (w0304 > 0) this.steadyUp0304(Math.min(1, w0304 * 4), this.up);
    this.fov += (p.fov - this.fov) * (snap || !this.init ? 1 : Math.min(1, dt * 3));
    this.init = true;
    cam.position.copy(this.pos);
    cam.up.copy(this.up);
    cam.lookAt(this.target);
    if (Math.abs(cam.fov - this.fov) > 0.01) { cam.fov = this.fov; cam.updateProjectionMatrix(); }
  }
}
