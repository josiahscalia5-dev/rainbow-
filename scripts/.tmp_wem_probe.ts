// temporary probe (washer-environment-modeler); deleted after use
import * as THREE from 'three';
import { Course } from '../src/world/course';
import { straightTubePath, tubeCenterAt } from '../src/world/tube';
const c = new Course();
const s05 = c.stage('05').s0, s06 = c.stage('06').s0, s08 = c.stage('08').s0;
const p = straightTubePath(c, s05, s08, { window: 30, taper: 14, baseRadius: (s) => c.prop('tube', s) });
console.log('s05', s05.toFixed(2), 's06', s06.toFixed(2), 's08', s08.toFixed(2));
const cam = new THREE.Vector3(...(process.argv.slice(2).map(Number) as [number, number, number]));
for (const s of [s05, s05 + 10, 127.4, s05 + 40, s06 - 5, s06, s06 + 10]) {
  const f = p.frame(s); const ctr = tubeCenterAt(p, s);
  console.log(s.toFixed(1), 'ctr', ctr.toArray().map((v) => v.toFixed(2)).join(','), 'R', p.radius(s).toFixed(2), 'D', p.depth(s).toFixed(2), 'tan', f.tan.toArray().map((v) => v.toFixed(3)).join(','), 'stream', c.sample(s).pos.toArray().map((v) => v.toFixed(2)).join(','));
}
// camera in the tube frame at the nearest axis point
let best = s05, bd = 1e9;
for (let s = s05; s < s08; s += 0.25) { const d = tubeCenterAt(p, s).distanceTo(cam); if (d < bd) { bd = d; best = s; } }
const f = p.frame(best); const off = cam.clone().sub(tubeCenterAt(p, best));
console.log('cam nearest s', best.toFixed(2), 'offset right', off.dot(f.right).toFixed(2), 'up', off.dot(f.up).toFixed(2), 'R', p.radius(best).toFixed(2));
