// r28 (QA only, no browser): the 06 route vs the locked approved camera and the m06tun tunnel axis.
//   cd /home/user/wt/s06 && npx vite-node tools/match06/r28_probe.mjs -- "<query>" [sa] [sb] [ds]
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
const args = process.argv.slice(2).filter((a) => a !== '--');
const [Q, SA, SB, DS] = args;
globalThis.location = { search: '?' + Q, href: 'http://x/?' + Q, hostname: 'x' };
const { Course, validateContinuity } = await import('../../src/world/course');
const c = new Course();
const L = JSON.parse(readFileSync('assets/textures/match06/proj06.json', 'utf8'));
const W = 864, H = 1536;
const proj = new THREE.PerspectiveCamera(L.camera.fov, W / H, 0.05, 2000);
proj.matrixWorld.fromArray(L.camera.matrixWorld); proj.matrixWorld.decompose(proj.position, proj.quaternion, proj.scale);
proj.matrixWorldInverse.copy(proj.matrixWorld).invert(); proj.updateProjectionMatrix();
const vp = L.tiles.tube.vp;
const ax = new THREE.Vector3((vp[0] / W) * 2 - 1, 1 - (vp[1] / H) * 2, 0.5).unproject(proj).sub(proj.position).normalize();
const sA = L.s0 + 12, sE = L.s0 + 12 + 44; const C = proj.position.clone();
const cen = new THREE.Vector3(); let n = 0;
for (let s = L.s0; s <= sE; s += 1) { const q = c.sample(s).pos.sub(C); cen.add(q.addScaledVector(ax, -q.dot(ax))); n++; }
cen.multiplyScalar(1 / n);
const Ux = new THREE.Vector3(0, 1, 0).addScaledVector(ax, -ax.y).normalize(), Rx = new THREE.Vector3().crossVectors(ax, Ux).normalize();
const O = C.clone().add(cen).addScaledVector(Ux, 3);
const px = (p) => { const q = p.clone().project(proj); return [Math.round((q.x + 1) / 2 * W), Math.round((1 - q.y) / 2 * H), q.z < 1 ? '' : 'BEHIND']; };
console.log('O_full', JSON.stringify(O.toArray())); console.log('cam', C.toArray().map((v) => +v.toFixed(2)), 'ax', ax.toArray().map((v) => +v.toFixed(3)), 'O', O.toArray().map((v) => +v.toFixed(2)), 'Rx', Rx.toArray().map((v) => +v.toFixed(3)), 'Ux', Ux.toArray().map((v) => +v.toFixed(3)));
for (const id of ['05', '06', '07', '08']) { const st = c.stage(id); console.log('stage', id, st.s0.toFixed(2), st.s1.toFixed(2)); }
console.log('marks', Object.fromEntries(Object.entries(c.marks).map(([k, v]) => [k, +v.toFixed(2)])));
const sa = Number(SA ?? 195), sb = Number(SB ?? 262), ds = Number(DS ?? 2);
for (let s = sa; s <= sb + 1e-9; s += ds) {
  const f = c.sample(s); const q = f.pos.clone().sub(O); const a = q.dot(ax); const rr = q.addScaledVector(ax, -a);
  console.log(s.toFixed(1), 'pos', f.pos.toArray().map((v) => +v.toFixed(2)).join(','), 'tan', f.tan.toArray().map((v) => +v.toFixed(2)).join(','),
    'w', c.widthAt(s).toFixed(1), 'axial', a.toFixed(1), 'radR', rr.dot(Rx).toFixed(2), 'radU', rr.dot(Ux).toFixed(2), 'px', px(f.pos).join(','));
}
const r = validateContinuity(c); console.log('continuity ok', r.ok, JSON.stringify(r.boundaries.filter((b) => ['05', '06', '07'].includes(b.from))));
