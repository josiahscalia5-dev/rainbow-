// Screen 05 geometry probe (read-only): where the LOCKED checkpoint eye sits relative to the 05 tunnel axis.
//   npx vite-node tools/qa/axis05.ts [floorDelta]
// Prints, for depths ahead of the eye, the tunnel radius R, floor depth D (stream above tunnel bottom), the
// tunnel-centre offset from the eye in the tube frame (right / up, in units and in R), and the predicted
// projected ring-centre offset ratio (offset / ring radius) = what tools/qa/ring_fit05.py measures in pixels.
// floorDelta (optional) adds to the 05 straight's floorDepth exactly like the ?floor05= URL switch.
import * as THREE from 'three';
import { Course } from '../../src/world/course';
import { straightTubePath, tubeCenterAt } from '../../src/world/tube';
import { STAGE_CAM } from '../../src/game/cameraRig';

const delta = Number(process.argv[2] ?? 0);
const course = new Course();
if (delta) for (const r of course.straightAxes) r.floorDepth += delta;
const s05 = course.stage('05').s0, s08 = course.stage('08').s0;
const tubeR = (s: number) => course.prop('tube', s);
const path = straightTubePath(course, s05, s08, { window: 30, taper: 14, baseRadius: tubeR });
const cam = STAGE_CAM['05'] as { back: number; up: number };
const sB = course.marks['05_crest'];
const b = course.sample(sB);
const T = b.tan.clone().normalize();
const U = new THREE.Vector3(0, 1, 0).addScaledVector(T, -T.y).normalize();
const eye = b.pos.clone().addScaledVector(T, -cam.back).addScaledVector(U, cam.up);
const sEye = sB - cam.back;
console.log(`floorDepth delta ${delta}; eye at s=${sEye.toFixed(1)} (Benny s=${sB.toFixed(1)}), camera back ${cam.back} up ${cam.up}`);
console.log('depth | R    | D    | centre-eye right  up (u) | right/R  up/R | stream below eye');
for (const d of [14, 20, 26, 40, 54]) {
  const s = sEye + d;
  const f = path.frame(s);
  const c = tubeCenterAt(path, s);
  const v = c.clone().sub(eye);
  const R = path.radius(s), D = path.depth(s);
  const st = course.sample(s).pos;
  console.log(`${String(d).padStart(5)} | ${R.toFixed(2)} | ${D.toFixed(2)} | ${v.dot(f.right).toFixed(2).padStart(6)} ${v.dot(f.up).toFixed(2).padStart(6)}        | ` +
    `${(v.dot(f.right) / R).toFixed(3).padStart(6)} ${(v.dot(f.up) / R).toFixed(3).padStart(6)} | ${(eye.y - st.y).toFixed(2)}`);
}
