// r29 lead (QA, no browser): the painted 06 coins on the m06deep river. Coins 0-1 (inside the unchanged first metres) keep
// coins06.json; coins 2-14 = the painted pixel's ray from the approved camera at the r29 depth (route06deep design), placed on the
// NEW course (s, lat, h) with the scale that covers the painted coin at the approved view. Writes assets/textures/match06/coins06deep.json.
//   cd /home/user/wt/s06 && npx vite-node tools/match06/r29_coins_deep.mjs -- "<query incl. m06deep=1>"
import * as THREE from 'three';
import { readFileSync, writeFileSync } from 'node:fs';
const Q = process.argv.slice(2).filter((a) => a !== '--')[0];
globalThis.location = { search: '?' + Q, href: 'http://x/?' + Q, hostname: 'x' };
const { Course } = await import('../../src/world/course');
const c = new Course();
const L = JSON.parse(readFileSync('assets/textures/match06/proj06.json', 'utf8'));
const C06 = JSON.parse(readFileSync('assets/textures/match06/coins06.json', 'utf8'));
const W = 864, H = 1536;
const proj = new THREE.PerspectiveCamera(L.camera.fov, W / H, 0.05, 2000);
proj.matrixWorld.fromArray(L.camera.matrixWorld); proj.matrixWorld.decompose(proj.position, proj.quaternion, proj.scale);
proj.matrixWorldInverse.copy(proj.matrixWorld).invert(); proj.updateProjectionMatrix();
const C = proj.position.clone(), f = (H / 2) / Math.tan(THREE.MathUtils.degToRad(L.camera.fov / 2));
const DEP = [8, 10.2, 13.7, 18.8, 25.2, 33, 39, 44, 48.5, 53, 58, 63, 72, 84, 96];
const s06 = c.stage('06'), s07 = c.stage('07');
console.log('stages 06', s06.s0.toFixed(2), s06.s1.toFixed(2), '07', s07.s0.toFixed(2), s07.s1.toFixed(2), 'course length', c.length.toFixed(1));
const B = c.sample(L.sB); console.log('Benny sB pos', B.pos.toArray().map((v) => +v.toFixed(4)), 'tan', B.tan.toArray().map((v) => +v.toFixed(4)));
const coins = [];
C06.coins.forEach((k, i) => {
  if (i < 2) { coins.push(k); return; }
  const dir = new THREE.Vector3((k.px[0] / W) * 2 - 1, 1 - (k.px[1] / H) * 2, 0.5).unproject(proj).sub(C).normalize();
  const p = C.clone().addScaledVector(dir, DEP[i]);
  let best = s06.s0, bd = Infinity;
  for (let s = L.sB; s <= s07.s0; s += 0.02) { const q = c.sample(s).pos; const dd = q.distanceToSquared(p); if (dd < bd) { bd = dd; best = s; } }
  const fr = c.sample(best), d = p.clone().sub(fr.pos);
  const lat = d.dot(fr.right), h = d.dot(fr.up), dist = p.distanceTo(C), scale = (k.px[2] * dist) / f;
  coins.push({ px: k.px, s: best, lat, h, scale, dist, pos: p.toArray() });
  console.log(String(i).padStart(2), 's', best.toFixed(2), 'lat', lat.toFixed(2), 'h', h.toFixed(2), 'scale', scale.toFixed(3), 'dist', dist.toFixed(1), 'along-miss', d.dot(fr.tan).toFixed(2));
});
writeFileSync('assets/textures/match06/coins06deep.json', JSON.stringify({ note: 'r29 m06deep painted 06 coins (tools/match06/r29_coins_deep.mjs): coins 0-1 = coins06.json, 2-14 on the m06deep river at the painted pixel, approved-view size', faceTo: C06.faceTo, coins }, null, 1));
