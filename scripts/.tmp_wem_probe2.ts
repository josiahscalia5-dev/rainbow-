// temporary probe (washer-environment-modeler); deleted after use
import * as THREE from 'three';
import { Course } from '../src/world/course';
import { straightTubePath, tubeCenterAt } from '../src/world/tube';
const c = new Course();
const s05 = c.stage('05').s0, s08 = c.stage('08').s0;
const p = straightTubePath(c, s05, s08, { window: 30, taper: 14, baseRadius: (s) => c.prop('tube', s) });
const [cx, cy, cz, sb] = process.argv.slice(2).map(Number);
const cam = new THREE.Vector3(cx, cy, cz);
const sp = 7.2;
for (let k = 0; ; k++) {
  const s = s05 + 3 + k * sp; if (s > s08 - 1) break;
  if (Math.abs(s - sb) > 25) continue;
  const f = p.frame(s); const ctr = tubeCenterAt(p, s); const r = p.radius(s) - 0.02;
  const off = cam.clone().sub(ctr); const ax = off.dot(f.tan); const rad = Math.sqrt(off.lengthSq() - ax * ax);
  const st = c.sample(sb).pos.clone().sub(ctr); const sax = st.dot(f.tan); const srad = Math.sqrt(st.lengthSq() - sax * sax);
  console.log('ring s', s.toFixed(1), 'r', r.toFixed(2), 'inner', (r * (1 - 0.078)).toFixed(2), '| cam axial', ax.toFixed(2), 'radial', rad.toFixed(2), '| stream(Benny) axial', sax.toFixed(2), 'radial', srad.toFixed(2));
}
