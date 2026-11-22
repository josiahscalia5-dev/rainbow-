import * as THREE from './node_modules/three/build/three.module.js';
import fs from 'fs';
const SC = JSON.parse(fs.readFileSync('scene05.json')); const TR = JSON.parse(fs.readFileSync('track.json'));
const N = new THREE.Vector3(...TR.n);
const T = TR.trail.map((p) => new THREE.Vector3(...p)), TS = TR.trail_s;
const at = (s, out) => { s = Math.max(0, Math.min(TS[TS.length - 1], s)); let lo = 0, hi = TS.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (TS[m] < s) lo = m; else hi = m; } const k = (s - TS[lo]) / Math.max(1e-6, TS[hi] - TS[lo]); return out.lerpVectors(T[lo], T[hi], k); };
const a = new THREE.Vector3(), b = new THREE.Vector3();
const frameAt = (s, win = 0.35) => { at(s - win * 0.3, a); at(s + win, b); const t = b.sub(a).normalize().clone(); const n = N.clone().addScaledVector(t, -t.dot(N)).normalize(); const r = new THREE.Vector3().crossVectors(t, n).normalize(); return { t, r, n }; };
const basis = (F) => new THREE.Matrix4().makeBasis(F.r.clone().negate(), F.n, F.t);
const camFwd = new THREE.Vector3(...SC.cam.fwd), camUp = new THREE.Vector3(...SC.cam.up);
const camQ0 = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(new THREE.Vector3(), camFwd, camUp));
const M0 = basis(frameAt(0));
const relPos = new THREE.Vector3().sub(T[0]).applyMatrix4(new THREE.Matrix4().copy(M0).transpose());
const relQ = new THREE.Quaternion().setFromRotationMatrix(M0).invert().multiply(camQ0);
for (const s of [0, 0.3, 1.2, 2.3, 4.4]) {
  const F = frameAt(s), Fc = frameAt(s, 0.9), Mc = basis(Fc);
  const B = at(s, new THREE.Vector3()); const C = relPos.clone().applyMatrix4(Mc).add(B);
  const q = new THREE.Quaternion().setFromRotationMatrix(Mc).multiply(relQ);
  const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(q); const dir = B.clone().sub(C).normalize();
  console.log('s', s, 'dist', C.distanceTo(B).toFixed(3), 'angle cam-fwd to Benny', THREE.MathUtils.radToDeg(fwd.angleTo(dir)).toFixed(1), 'tan pitch vs N', (90 - THREE.MathUtils.radToDeg(F.t.angleTo(N))).toFixed(1), 'relPos', relPos.toArray().map((x) => x.toFixed(3)).join(','));
}
