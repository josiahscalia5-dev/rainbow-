// temporary analysis probe (washer-environment-modeler, wave 4) — deleted after use
import * as THREE from 'three';
import { Course } from '../src/world/course';
import { straightTubePath, tubeCenterAt } from '../src/world/tube';
import { RideCamera, STAGE_CAM } from '../src/game/cameraRig';
const course = new Course();
const s05 = course.stage('05').s0, s06 = course.stage('06').s0, s08 = course.stage('08').s0;
const tubeR = (s: number) => course.prop('tube', s);
const perfPath = straightTubePath(course, s05, s08, { window: 30, taper: 14, baseRadius: tubeR });
const rc = new RideCamera(course);
rc.axis = { path: perfPath, s0: s05, s1: course.marks['07_plunge_top'] };
const s = course.marks['05_crest'];
const P = new THREE.Vector3(), T = new THREE.Vector3(), U = new THREE.Vector3();
const p = rc.desired(s, 0, P, T, U);
const cam = new THREE.PerspectiveCamera(p.fov, 864 / 1536, 0.05, 1200);
cam.position.copy(P); cam.up.copy(U); cam.lookAt(T); cam.updateMatrixWorld(); cam.updateProjectionMatrix();
const proj = (v: THREE.Vector3) => { const q = v.clone().project(cam); return [Math.round((q.x + 1) / 2 * 864), Math.round((1 - q.y) / 2 * 1536)]; };
console.log('s05', s05.toFixed(2), 's06', s06.toFixed(2), 'crest', s.toFixed(2), 'fov', p.fov, 'cam', P.toArray().map((x) => +x.toFixed(2)));
const sCam05 = s - (STAGE_CAM['05']?.back ?? 6.4);
console.log('sCam05', sCam05.toFixed(2));
const far = perfPath.frame(s06 - 5.9);
const vp = proj(tubeCenterAt(perfPath, s05 + 200 > s06 ? s06 - 5.9 : s06).clone().addScaledVector(far.tan, 2000));
console.log('VP (axis at infinity)', vp);
for (let ss = sCam05 + 2; ss < s06 + 2; ss += 4) {
  const f = perfPath.frame(ss); const c = tubeCenterAt(perfPath, ss); const r = perfPath.radius(ss);
  const top = proj(c.clone().addScaledVector(f.up, r)), bot = proj(c.clone().addScaledVector(f.up, -r)), ctr = proj(c);
  const d = c.clone().sub(P).dot(far.tan);
  console.log('s', ss.toFixed(1), 'u', (ss - s05).toFixed(1), 'dAx', d.toFixed(1), 'R', r.toFixed(2), 'depth', perfPath.depth(ss).toFixed(2), 'ctr', ctr, 'top', top, 'bot', bot, 'rpx', ctr[1] - top[1]);
}
