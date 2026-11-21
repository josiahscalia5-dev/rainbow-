// r29 lead (QA only, no browser): the painted 06 coin trail rebuilt in 3D at ONE common coin size (depth = f * 0.632 / painted px size,
// monotonic-smoothed), expressed in the m06tun drum frame (axial a, radR, radU), vs the current route and the 07 start.
//   cd /home/user/wt/s06 && npx vite-node tools/match06/r29_route_probe.mjs -- "<query>"
import * as THREE from 'three';
import { readFileSync } from 'node:fs';
const Q = process.argv.slice(2).filter((a) => a !== '--')[0];
globalThis.location = { search: '?' + Q, href: 'http://x/?' + Q, hostname: 'x' };
const { Course } = await import('../../src/world/course');
const c = new Course();
const L = JSON.parse(readFileSync('assets/textures/match06/proj06.json', 'utf8'));
const CO = JSON.parse(readFileSync('assets/textures/match06/coins06.json', 'utf8')).coins;
const W = 864, H = 1536;
const proj = new THREE.PerspectiveCamera(L.camera.fov, W / H, 0.05, 2000);
proj.matrixWorld.fromArray(L.camera.matrixWorld); proj.matrixWorld.decompose(proj.position, proj.quaternion, proj.scale);
proj.matrixWorldInverse.copy(proj.matrixWorld).invert(); proj.updateProjectionMatrix();
const C = proj.position.clone(), f = (H / 2) / Math.tan(THREE.MathUtils.degToRad(L.camera.fov / 2));
const vp = L.tiles.tube.vp;
const ax = new THREE.Vector3((vp[0] / W) * 2 - 1, 1 - (vp[1] / H) * 2, 0.5).unproject(proj).sub(proj.position).normalize();
const O = new THREE.Vector3(3.618207615033741, -36.35146859486923, -132.599548800415);
const Ux = new THREE.Vector3(0, 1, 0).addScaledVector(ax, -ax.y).normalize(), Rx = new THREE.Vector3().crossVectors(ax, Ux).normalize();
const drum = (p) => { const q = p.clone().sub(O); const a = q.dot(ax); q.addScaledVector(ax, -a); return [a, q.dot(Rx), q.dot(Ux)]; };
const ray = (px, py) => new THREE.Vector3((px / W) * 2 - 1, 1 - (py / H) * 2, 0.5).unproject(proj).sub(C).normalize();
// depths: f*0.632/size, then smoothed monotonic (painted sizes of the far coins are rough)
let d = CO.map((k) => f * 0.632 / k.px[2]);
const ds = [...d]; for (let i = 1; i < ds.length; i++) ds[i] = Math.max(ds[i], ds[i - 1] + 2.2);
const fixed = process.env.DEPTHS ? JSON.parse(process.env.DEPTHS) : null; if (fixed) fixed.forEach((v, i) => { if (v) ds[i] = v; });
console.log('cam', C.toArray().map((v) => +v.toFixed(2)), 'ax', ax.toArray().map((v) => +v.toFixed(4)), 'f', f.toFixed(1));
const B = c.sample(L.sB); console.log('Benny sB', L.sB, 'pos', B.pos.toArray().map((v) => +v.toFixed(2)), 'tan', B.tan.toArray().map((v) => +v.toFixed(3)), 'drum', drum(B.pos).map((v) => +v.toFixed(2)), 'dist', B.pos.distanceTo(C).toFixed(2));
const e7 = c.sample(c.stage('07').s0); console.log('07 start', e7.pos.toArray().map((v) => +v.toFixed(2)), 'tan', e7.tan.toArray().map((v) => +v.toFixed(3)), 'drum', drum(e7.pos).map((v) => +v.toFixed(2)));
const out = [];
CO.forEach((k, i) => {
  const p = C.clone().addScaledVector(ray(k.px[0], k.px[1]), ds[i]);
  const w = p.clone().add(new THREE.Vector3(0, -0.45, 0)); // water under the coin
  const dr = drum(w);
  out.push({ i, px: k.px, depth: +ds[i].toFixed(2), coin: p.toArray().map((v) => +v.toFixed(3)), water: w.toArray().map((v) => +v.toFixed(3)), drum: dr.map((v) => +v.toFixed(2)) });
  console.log(String(i).padStart(2), 'px', k.px.join(','), 'depth', ds[i].toFixed(1), 'water', w.toArray().map((v) => v.toFixed(2)).join(','), '| axial', dr[0].toFixed(1), 'radR', dr[1].toFixed(2), 'radU', dr[2].toFixed(2), '| r', Math.hypot(dr[1], dr[2]).toFixed(1));
});
if (process.env.OUT) (await import('node:fs')).writeFileSync(process.env.OUT, JSON.stringify({ C: C.toArray(), ax: ax.toArray(), O: O.toArray(), Rx: Rx.toArray(), Ux: Ux.toArray(), B: { pos: B.pos.toArray(), tan: B.tan.toArray() }, e7: { pos: e7.pos.toArray(), tan: e7.tan.toArray(), s0: c.stage('07').s0 }, coins: out }, null, 1));
