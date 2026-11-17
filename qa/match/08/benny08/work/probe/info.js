const { scene, camera } = Q;
const B = scene.getObjectByName('Benny');
const V = () => new camera.position.constructor();
const W = 864, H = 1536;
const px = (v) => { const p = v.clone().project(camera); return [+((p.x + 1) / 2 * W).toFixed(1), +((1 - p.y) / 2 * H).toFixed(1)]; };
const wp = (n) => B.getObjectByName(n).getWorldPosition(V());
const out = {};
for (const n of ['body', 'hat', 'pom', 'hat_star', 'armL', 'armR', 'eyes']) { const o = B.getObjectByName(n); if (o) out[n] = { px: px(wp(n)), w: wp(n).toArray().map((x) => +x.toFixed(3)) }; }
const body = B.getObjectByName('body');
const q = body.getWorldQuaternion(new camera.quaternion.constructor());
const ax = (x, y, z) => V().set(x, y, z).applyQuaternion(q).toArray().map((v) => +v.toFixed(3));
out.bodyUp = ax(0, 1, 0); out.bodyFwd = ax(0, 0, 1); out.bodyRight = ax(1, 0, 0);
const cq = camera.quaternion;
out.camFwd = V().set(0, 0, -1).applyQuaternion(cq).toArray().map((v) => +v.toFixed(3));
out.camRight = V().set(1, 0, 0).applyQuaternion(cq).toArray().map((v) => +v.toFixed(3));
out.camUp = V().set(0, 1, 0).applyQuaternion(cq).toArray().map((v) => +v.toFixed(3));
out.cam = camera.position.toArray().map((v) => +v.toFixed(3));
out.fov = camera.fov;
out.rootScale = B.scale.toArray();
out.bodyLocalQ = body.quaternion.toArray().map((v) => +v.toFixed(4));
out.hatLocal = B.getObjectByName('hat').position.toArray();
// world scale: pixels per unit at Benny
const c = wp('body'); const r = c.clone().add(V().set(1,0,0).applyQuaternion(cq).multiplyScalar(0.5));
out.pxPerUnit = +((px(r)[0] - px(c)[0]) * 2).toFixed(1);
return out;
