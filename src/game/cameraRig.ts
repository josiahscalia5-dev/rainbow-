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
import { flag05 } from '../vfx/waterRibbon';

/** r7 `?match06=1&m06cam=1` only: Screen 06 camera frame = chord toward the river this far ahead (`&m06la=`, default 40) */
const M06_CAM = flag05('m06cam');
/** A/B-only: let the camera follow the real curved ride path through Screen 05 instead of
 * holding the straight 05 tunnel vanishing point. No effect on normal gameplay. */
const FOLLOW05 = flag05('realride05') || flag05('follow05');
const M06_LA = (() => {
  const v = typeof location !== 'undefined' ? Number(new URLSearchParams(location.search).get('m06la')) : NaN;
  return Number.isFinite(v) && v > 5 ? v : 40;
})();
/** r21 `&m06view=1` (with m06cam; qa/match/06/r21/PROGRESS.md): composition test — the approved view direction / off-centre aim
 *  is held while Benny swims and eases toward the m06cam route view only as visibility needs it. Tunables (QA):
 *  `&m06vw=a,b` hold → hand-over (u past the checkpoint, default 20,38), `&m06vx=` max route x (NDC, default 0.85) */
const M06_VIEW = M06_CAM && flag05('m06view');
const m06num = (k: string, n: number, d: number[]) => {
  const v = typeof location !== 'undefined' ? new URLSearchParams(location.search).get(k) : null;
  const a = (v ?? '').split(',').map(Number);
  return v && a.length === n && a.every(Number.isFinite) ? a : d;
};
const M06_VW = m06num('m06vw', 2, [20, 38]);
const M06_VX = m06num('m06vx', 1, [0.85])[0];
/** `&m06vs=` share of the approved Benny→route screen separation kept over the crest (default 1; 0 = no rise) */
const M06_VS = m06num('m06vs', 1, [1])[0];

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
  /** `?match06=1` only (src/game/match.ts): over the 06 stage the camera sits at Benny's water point + this world offset
   *  and looks along the fixed world direction dir06 (the approved picture's view over the crest into the tunnel);
   *  absent = no change */
  off06?: [number, number, number];
  dir06?: [number, number, number];
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
  /** optional straight tunnel axis + the s-range where the camera aligns to it */
  axis: { path: TubePath; s0: number; s1: number } | null = null;
  /** `?match06=1`: off06 / dir06 in the river's level frame at the 06 checkpoint (computed once) */
  private m06: { s0: number; o: number[]; d: number[] } | null = null;
  /** r21 m06view: approved vertical angle between Benny and the river 6 u ahead (rad) */
  private m06vSep: number | null = null;

  constructor(private course: Course) {}

  /** desired pose for Benny at (s, lateral) */
  desired(s: number, lat: number, outPos: THREE.Vector3, outTarget: THREE.Vector3, outUp: THREE.Vector3): CamParams {
    const p = camParamsAt(this.course, s);
    const f = this.course.sample(s);
    const fb = this.course.sample(Math.max(0, s - p.back * 0.5)); // smoothing of heading
    const dir = f.tan.clone().lerp(fb.tan, 0.35).normalize();
    let up = f.up.clone();
    // Blend out still-image camera alignment over Screen 05 for diagnostic A/B tests.
    // Keep the original camera everywhere else, particularly at the 04→05 and 05→06 joins.
    const st05 = this.course.stage('05');
    const st06 = this.course.stage('06');
    const physical05 = FOLLOW05
      ? THREE.MathUtils.smoothstep(s, st05.s0 + 1, st05.s0 + 8) *
        (1 - THREE.MathUtils.smoothstep(s, st06.s0 - 10, st06.s0 - 1))
      : 0;
    if (this.axis) {
      const a = this.axis;
      const w = THREE.MathUtils.smoothstep(s, a.s0, a.s0 + 10) * (1 - THREE.MathUtils.smoothstep(s, a.s1 - 10, a.s1));
      if (w * (1 - physical05) > 0) {
        const af = a.path.frame(s);
        dir.lerp(af.tan, w * (1 - physical05)).normalize();
        up.lerp(af.up, w * (1 - physical05)).normalize();
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
      const w8 = THREE.MathUtils.smoothstep(s, st8.s0 - 3, st8.s0 + 1.5) * (1 - THREE.MathUtils.smoothstep(s, st8.s1 - 10, st8.s1 - 1));
      if (w8 > 0) {
        outPos.lerp(benny.clone().add(new THREE.Vector3(...p8.off08)), w8);
        outTarget.lerp(new THREE.Vector3(...p8.aim08), w8);
        outUp.lerp(new THREE.Vector3(0, 1, 0), w8).normalize();
      }
    }
    // `?match06=1`: the approved Screen 06 view — at the 06 checkpoint (06 start + 10) the camera is exactly Benny +
    // off06 (world), looking along dir06, level. Both are stored in the river's LEVEL frame there (smoothed heading, world
    // up, no bank) and carried rigidly along the river with Benny, so over the crest and down the far side the camera stays
    // the same height above the water behind him and looks along the slope (a fixed world offset ends up under the water
    // on the down-slope); half of Benny's steering offset. Blended in around the 06 start and out before 07 (absent = no change)
    const p6 = STAGE_CAM['06'];
    if (p6 && p6.off06 && p6.dir06) {
      const st6 = this.course.stage('06');
      const w6 = THREE.MathUtils.smoothstep(s, st6.s0 - 3, st6.s0 + 1.5) * (1 - THREE.MathUtils.smoothstep(s, st6.s1 - 10, st6.s1 - 1));
      if (w6 > 0) {
        const lvl = (x: number) => {
          const T = this.course.sample(x - 3).tan.clone().add(this.course.sample(x).tan).add(this.course.sample(x + 3).tan).normalize();
          const U = new THREE.Vector3(0, 1, 0).addScaledVector(T, -T.y).normalize();
          return { T, U, R: new THREE.Vector3().crossVectors(T, U).normalize() };
        };
        // r7 `&m06cam=1` (qa/match/06/r7/NOTES.md): the frame is the CHORD toward the river M06_LA units ahead (where the
        // painted tunnel's rings converge) instead of the local slope. At the checkpoint the approved camera is reproduced
        // exactly (offsets are stored in the same frame there); over the crest the local-slope frame tipped the view to
        // -47° at +10 u and -73° at +30 u (looking straight down at the water, the ring tunnel above the frame).
        const chord = (x: number) => {
          const a = this.course.sample(x).pos, b = this.course.sample(Math.min(x + M06_LA, this.course.length - 1)).pos;
          const T = b.clone().sub(a).normalize();
          const U = new THREE.Vector3(0, 1, 0).addScaledVector(T, -T.y).normalize();
          return { T, U, R: new THREE.Vector3().crossVectors(T, U).normalize() };
        };
        const frame6 = M06_CAM ? chord : lvl;
        if (!this.m06 || this.m06.s0 !== st6.s0) {
          const sB = st6.s0 + 10, F = frame6(sB), o = new THREE.Vector3(...p6.off06), d = new THREE.Vector3(...p6.dir06).normalize();
          this.m06 = { s0: st6.s0, o: [o.dot(F.R), o.dot(F.U), o.dot(F.T)], d: [d.dot(F.R), d.dot(F.U), d.dot(F.T)] };
        }
        const F = frame6(s), M = this.m06;
        const cp6 = f.pos.clone().addScaledVector(f.right, lat * 0.5)
          .addScaledVector(F.R, M.o[0]).addScaledVector(F.U, M.o[1]).addScaledVector(F.T, M.o[2]);
        const d6 = F.R.clone().multiplyScalar(M.d[0]).addScaledVector(F.U, M.d[1]).addScaledVector(F.T, M.d[2]);
        if (M06_CAM) {
          // keep the camera >= 1.6 u above the water directly below it (the chord frame is flatter than the slope), then
          // turn the view by the same angle so Benny keeps his approved place in the frame
          let best = Infinity, wy = -Infinity;
          for (let k = -14; k <= 4; k += 0.5) {
            const q = this.course.sample(Math.max(0, s + k)).pos, dx = q.x - cp6.x, dz = q.z - cp6.z;
            if (dx * dx + dz * dz < best) { best = dx * dx + dz * dz; wy = q.y; }
          }
          if (cp6.y < wy + 1.6) {
            const bn = f.pos.clone().addScaledVector(f.right, lat * 0.5);
            const v0 = bn.clone().sub(cp6).normalize();
            cp6.y = wy + 1.6;
            const v1 = bn.sub(cp6).normalize();
            d6.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(v0, v1));
          }
        }
        if (M06_VIEW) {
          // r21 m06view: the approved camera (checkpoint world offset + world view direction) carried with Benny, held while
          // the route stays visible; exactly the approved camera at the checkpoint (wv = 1), eased into the m06cam view
          // above by the hand-over distance (so the 06→07 join is unchanged)
          const sB = st6.s0 + 10;
          const wv = THREE.MathUtils.smoothstep(s, sB - 4, sB) * (1 - THREE.MathUtils.smoothstep(s, sB + M06_VW[0], sB + M06_VW[1]));
          if (wv > 0) {
            const bn = f.pos.clone().addScaledVector(f.right, lat * 0.5);
            const pv = bn.clone().add(new THREE.Vector3(...p6.off06));
            const dv = new THREE.Vector3(...p6.dir06).normalize();
            // keep >= 1.6 u above the water below (down the far slope), turning the view so Benny keeps his approved place
            let best = Infinity, wy = -Infinity;
            for (let k = -14; k <= 8; k += 0.5) {
              const q = this.course.sample(Math.max(0, s + k)).pos, dx = q.x - pv.x, dz = q.z - pv.z;
              if (dx * dx + dz * dz < best) { best = dx * dx + dz * dz; wy = q.y; }
            }
            // depth over the crest: rise (up to 4 u) so the river 6 u ahead stays as far above Benny on screen as in the
            // approved view (the route over the crest top stays visible behind him instead of a climbing wall of water)
            const elev = (c: THREE.Vector3, p: THREE.Vector3) => Math.atan2(p.y - c.y, Math.hypot(p.x - c.x, p.z - c.z));
            const r6 = (x: number) => this.course.sample(Math.min(x + 6, this.course.length - 1)).pos.clone()
              .addScaledVector(this.course.sample(Math.min(x + 6, this.course.length - 1)).right, lat * 0.5);
            if (this.m06vSep === null) {
              const b0 = this.course.sample(sB).pos, c0 = b0.clone().add(new THREE.Vector3(...p6.off06));
              this.m06vSep = elev(c0, r6(sB).sub(new THREE.Vector3())) - elev(c0, b0);
            }
            const sepT = this.m06vSep * M06_VS, r6p = r6(s), sep = (h: number) => {
              const c = pv.clone(); c.y += h; return elev(c, r6p) - elev(c, bn);
            };
            let hR = 0;
            if (s > sB && sep(0) < sepT) {
              let lo = 0, hi = 4;
              if (sep(hi) < sepT) lo = hi; else for (let i = 0; i < 12; i++) { const m = (lo + hi) / 2; if (sep(m) < sepT) lo = m; else hi = m; }
              hR = hi === 4 && lo === 4 ? 4 : hi;
            }
            const yT = Math.max(wy + 1.6, pv.y + hR);
            if (pv.y < yT) {
              const v0 = bn.clone().sub(pv).normalize();
              pv.y = yT;
              dv.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(v0, bn.clone().sub(pv).normalize()));
            }
            // visibility: turn only as much as needed so Benny stays in the lower middle and the route ahead (6 / 12 u)
            // stays inside the frame (vertical fov 62, portrait 9:16)
            const tV = Math.tan(THREE.MathUtils.degToRad(31)), tH = tV * 0.5625, UP = new THREE.Vector3(0, 1, 0);
            const pts: [THREE.Vector3, number, number, number, number][] = [
              [bn, -0.5, 0.5, -0.62, 0.05],
              ...[6, 12].map((d) => [this.course.sample(Math.min(s + d, this.course.length - 1)).pos.clone().addScaledVector(this.course.sample(Math.min(s + d, this.course.length - 1)).right, lat * 0.5), -0.75, M06_VX, -0.45, 0.62] as [THREE.Vector3, number, number, number, number]),
            ];
            for (let it = 0; it < 3; it++) {
              const Rv = new THREE.Vector3().crossVectors(dv, UP).normalize(), Uv = new THREE.Vector3().crossVectors(Rv, dv);
              let yaw = 0, pit = 0;
              for (const [p, x0, x1, y0, y1] of pts) {
                const r = p.clone().sub(pv), z = r.dot(dv);
                if (z < 0.5) continue;
                const ax = Math.atan2(r.dot(Rv), z), ay = Math.atan2(r.dot(Uv), z);
                const hi = Math.atan(x1 * tH), lo = Math.atan(x0 * tH), vhi = Math.atan(y1 * tV), vlo = Math.atan(y0 * tV);
                if (ax > hi) yaw = Math.max(yaw, ax - hi); else if (ax < lo) yaw = Math.min(yaw, ax - lo);
                if (ay > vhi) pit = Math.max(pit, ay - vhi); else if (ay < vlo) pit = Math.min(pit, ay - vlo);
              }
              if (Math.abs(yaw) < 1e-4 && Math.abs(pit) < 1e-4) break;
              dv.applyAxisAngle(UP, -yaw).applyAxisAngle(Rv, pit).normalize();
            }
            cp6.lerp(pv, wv);
            d6.normalize().lerp(dv, wv).normalize();
          }
        }
        outPos.lerp(cp6, w6);
        outTarget.lerp(cp6.addScaledVector(d6, 10), w6);
        outUp.lerp(new THREE.Vector3(0, 1, 0), w6).normalize();
      }
    }
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
    const w5 = this.axis ? THREE.MathUtils.smoothstep(s, st5.s0 + 1, st5.s0 + 8) * (1 - THREE.MathUtils.smoothstep(s, st5.s1 - 9, st5.s1 - 1)) * (1 - physical05) : 0;
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

  update(dt: number, s: number, lat: number, cam: THREE.PerspectiveCamera, snap = false) {
    const dp = new THREE.Vector3(), dt3 = new THREE.Vector3(), du = new THREE.Vector3();
    const p = this.desired(s, lat, dp, dt3, du);
    const k = snap || !this.init ? 1 : 1 - Math.exp(-dt * 7);
    const kt = snap || !this.init ? 1 : 1 - Math.exp(-dt * 9);
    this.pos.lerp(dp, k);
    this.target.lerp(dt3, kt);
    this.up.lerp(du, kt).normalize();
    this.fov += (p.fov - this.fov) * (snap || !this.init ? 1 : Math.min(1, dt * 3));
    this.init = true;
    cam.position.copy(this.pos);
    cam.up.copy(this.up);
    cam.lookAt(this.target);
    if (Math.abs(cam.fov - this.fov) > 0.01) { cam.fov = this.fov; cam.updateProjectionMatrix(); }
  }
}
