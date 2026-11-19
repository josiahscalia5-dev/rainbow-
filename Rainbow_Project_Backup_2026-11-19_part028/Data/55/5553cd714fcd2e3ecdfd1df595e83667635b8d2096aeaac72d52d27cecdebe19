/**
 * Third-person ride camera: behind/above Benny, looking along his heading (the course tangent), or
 * along the straight tunnel axis inside the 05–07 tube so the gold rings converge to one vanishing point
 * as in the references. Pitch & roll follow the banked path smoothly — including the 07 plunge.
 */
import * as THREE from 'three';
import { WORLD } from '../world/course';
import type { Course, StageId } from '../world/course';
import type { TubePath } from '../world/tube';

export interface CamParams {
  back: number; // distance behind Benny
  up: number; // height above Benny's water point
  ahead: number; // look-at distance ahead
  lookUp: number; // look-at height
  fov: number;
  latFollow: number; // 1 = camera fully follows Benny's lateral offset
  roll: number; // 0..1 how much of the path bank the camera adopts
}

export const STAGE_CAM: Partial<Record<StageId, CamParams>> = {
  '03': { back: 6.5, up: 6.5, ahead: 6, lookUp: -1.5, fov: 64, latFollow: 0.3, roll: 0.3 },
  '04': { back: 8.5, up: 5.2, ahead: 14, lookUp: -3.0, fov: 66, latFollow: 0.6, roll: 0.4 },
  '05': { back: 6.4, up: 4.1, ahead: 18, lookUp: 1.8, fov: 62, latFollow: 0.6, roll: 0.5 },
  '06': { back: 5.6, up: 2.6, ahead: 12, lookUp: 3.4, fov: 66, latFollow: 0.7, roll: 0.4 },
  '07': { back: 6.4, up: 4.1, ahead: 18, lookUp: 1.8, fov: 62, latFollow: 0.6, roll: 0.6 },
  '08': { back: 6.2, up: 3.7, ahead: 16, lookUp: 0.2, fov: 62, latFollow: 0.8, roll: 0.3 },
  '09': { back: 6.2, up: 3.7, ahead: 15, lookUp: 0.6, fov: 62, latFollow: 0.8, roll: 0.3 },
  '10': { back: 5.8, up: 3.4, ahead: 11, lookUp: 1.2, fov: 62, latFollow: 0.8, roll: 0.2 },
};

const KEYS: (keyof CamParams)[] = ['back', 'up', 'ahead', 'lookUp', 'fov', 'latFollow', 'roll'];

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
    outPos.copy(anchor).addScaledVector(dir, -p.back).addScaledVector(upPos, p.up);
    outTarget.copy(anchor).addScaledVector(dir, p.ahead).addScaledVector(upPos, p.lookUp);
    outUp.set(0, 1, 0).lerp(up, p.roll).normalize();
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
