/**
 * Third-person ride camera: behind/above Benny along the course frame (pitch & roll follow the
 * banked path smoothly — including the 07 plunge), with per-stage framing blended continuously by s.
 */
import * as THREE from 'three';
import { WORLD } from '../world/course';
import type { Course, StageId } from '../world/course';

export interface CamParams {
  back: number; // distance behind Benny along the course (units of s)
  up: number; // height above the water along the frame up
  ahead: number; // look-at distance ahead of Benny
  lookUp: number; // look-at height
  fov: number;
  latFollow: number; // how much the camera follows Benny's lateral offset
  roll: number; // 0..1 how much of the path bank the camera adopts
}

export const STAGE_CAM: Partial<Record<StageId, CamParams>> = {
  '03': { back: 6.5, up: 6.5, ahead: 6, lookUp: -1.5, fov: 64, latFollow: 0.3, roll: 0.3 },
  '04': { back: 4.6, up: 3.2, ahead: 11, lookUp: -0.2, fov: 70, latFollow: 0.4, roll: 0.6 },
  '05': { back: 4.4, up: 2.3, ahead: 12, lookUp: 0.6, fov: 70, latFollow: 0.4, roll: 0.6 },
  '06': { back: 4.4, up: 2.4, ahead: 12, lookUp: 1.5, fov: 70, latFollow: 0.4, roll: 0.5 },
  '07': { back: 4.4, up: 2.4, ahead: 12, lookUp: 0.8, fov: 70, latFollow: 0.4, roll: 0.7 },
  '08': { back: 4.0, up: 2.6, ahead: 13, lookUp: 1.0, fov: 72, latFollow: 0.35, roll: 0.4 },
  '09': { back: 4.0, up: 2.6, ahead: 12, lookUp: 1.4, fov: 72, latFollow: 0.35, roll: 0.4 },
  '10': { back: 3.8, up: 2.6, ahead: 8, lookUp: 1.2, fov: 70, latFollow: 0.3, roll: 0.3 },
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

  constructor(private course: Course) {}

  /** desired pose for Benny at (s, lateral) */
  desired(s: number, lat: number, outPos: THREE.Vector3, outTarget: THREE.Vector3, outUp: THREE.Vector3): CamParams {
    const p = camParamsAt(this.course, s);
    const fb = this.course.sample(Math.max(0, s - p.back));
    const fa = this.course.sample(Math.min(this.course.length, s + p.ahead));
    const fs = this.course.sample(s);
    outPos.copy(fb.pos).addScaledVector(fb.right, lat * p.latFollow).addScaledVector(fb.up, p.up);
    outTarget.copy(fa.pos).addScaledVector(fa.right, lat * p.latFollow * 0.5).addScaledVector(fa.up, p.lookUp);
    outUp.set(0, 1, 0).lerp(fs.up, p.roll).normalize();
    // 03 whirlpool: dynamic high angle from the near side, looking down into the vortex toward the
    // drain and the porthole wall (Benny left, drain lower-right as in the reference)
    const st3 = this.course.stage('03');
    const w = THREE.MathUtils.smoothstep(s, st3.s0 - 6, st3.s0 + 2) * (1 - THREE.MathUtils.smoothstep(s, st3.s1 - 5, st3.s1 + 3));
    if (w > 0) {
      const B = WORLD.basin;
      const bp = fs.pos.clone().addScaledVector(fs.right, lat);
      const wp = bp.clone().add(new THREE.Vector3(3.2, 6.4, 9.8));
      const drain = new THREE.Vector3(B.center.x, B.drainY, B.center.z);
      const wt = bp.clone().lerp(drain, 0.42).add(new THREE.Vector3(0, -0.6, -2.5));
      outPos.lerp(wp, w);
      outTarget.lerp(wt, w);
      outUp.lerp(new THREE.Vector3(0, 1, 0), w).normalize();
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
