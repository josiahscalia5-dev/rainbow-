#!/usr/bin/env node
// Screen 05 CAMERA LOCK — measured image-to-geometry alignment (coordinator tool, wave 6).
//   python3 -I scripts/landmarks05.py references/05_flow_into_the_current.png qa/pilot05/wave6/camera_lock/landmarks_ref_px.json
//   node scripts/camera-lock-05.mjs [--ref=qa/pilot05/wave6/camera_lock/landmarks_ref_px.json]
// Opens the REAL game at the 05 checkpoint, reads the live render camera (window.__rainbow.camera()), the
// game's own coin screen positions, Benny's screen position and the 05 course frames, then
//   1. writes camera05.json  — the locked camera (Three.js world matrix, vFOV, aspect) + the same pose
//      converted to Blender axes, for tools/blender/camera_lock_05.py
//   2. back-projects reference landmarks (coin centres at the coins' real height, VP) through that camera
//      onto the river surface → world (s, lateral): the S-path the reference implies, in game coordinates
//   3. compares the game's coins/VP with the reference in pixels (residual table)
// Writes qa/pilot05/wave6/camera_lock/{camera05.json,landmarks.json}. Read-only for the game.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import * as THREE from 'three';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const OUT = 'qa/pilot05/wave6/camera_lock';
mkdirSync(OUT, { recursive: true });
const refPx = JSON.parse(readFileSync(opt.ref || `${OUT}/landmarks_ref_px.json`, 'utf8'));

const { chromium } = loadPlaywright();
const vite = await startVite(5207);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
let live;
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  live = await page.evaluate(() => {
    const R = window.__rainbow;
    R.goto('05');
    const c = R.course;
    const st = c.stage('05');
    const frames = [];
    for (let s = st.s0 - 2; s <= st.s1 + 2 + 1e-6; s += 0.25) {
      const f = c.sample(s);
      frames.push({ s, pos: f.pos.toArray(), tan: f.tan.toArray(), up: f.up.toArray(), right: f.right.toArray() });
    }
    const ax = c.straightAxes.find((a) => Math.abs(a.s0 - st.s0) < 1.5);
    return {
      camera: R.camera(), coins: R.coinScreen(), coinDefs: R.coinDefs(), benny: R.bennyScreen(), state: R.state(),
      stage: { s0: st.s0, s1: st.s1, crest: c.marks['05_crest'] }, frames,
      axis: ax ? { s0: ax.s0, s1: ax.s1, a: ax.a.toArray(), b: ax.b.toArray(), floorDepth: ax.floorDepth } : null,
    };
  });
  await page.close();
} finally {
  await browser.close();
  await vite.close();
}

// ---- camera
const cam = new THREE.PerspectiveCamera(live.camera.fov, live.camera.aspect, live.camera.near, live.camera.far);
const M = new THREE.Matrix4().fromArray(live.camera.matrixWorld);
M.decompose(cam.position, cam.quaternion, cam.scale);
cam.updateMatrixWorld(true);
cam.updateProjectionMatrix();
const W = live.camera.width, H = live.camera.height;
// Three (x, y, z) → Blender (x, −z, y): Mb = R · M
const Rb = new THREE.Matrix4().set(1, 0, 0, 0, 0, 0, -1, 0, 0, 1, 0, 0, 0, 0, 0, 1);
const Mb = Rb.clone().multiply(M);
const camOut = {
  note: 'Locked 05 gameplay camera at checkpoint 05_crest, read from the live game. three = Three.js world (+Y up); blender = same pose in Blender axes (x, −z, y). fov = vertical degrees (Blender: sensor_fit VERTICAL).',
  checkpoint: live.stage.crest, state: live.state,
  three: { matrixWorld: live.camera.matrixWorld, position: live.camera.position, target: live.camera.target, fov: live.camera.fov, aspect: live.camera.aspect, near: live.camera.near, far: live.camera.far },
  blender: { matrixWorldRowMajor: Mb.clone().transpose().toArray(), vfovDeg: live.camera.fov, resolution: [W, H] },
};
writeFileSync(`${OUT}/camera05.json`, JSON.stringify(camOut, null, 1));

// ---- back-projection onto the river surface (+ height h above it)
const frames = live.frames.map((f) => ({ s: f.s, pos: new THREE.Vector3(...f.pos), tan: new THREE.Vector3(...f.tan), up: new THREE.Vector3(...f.up), right: new THREE.Vector3(...f.right) }));
const frameAt = (s) => {
  const i = THREE.MathUtils.clamp(Math.floor((s - frames[0].s) / 0.25), 0, frames.length - 2);
  const a = frames[i], b = frames[i + 1], t = THREE.MathUtils.clamp((s - a.s) / 0.25, 0, 1);
  return { s, pos: a.pos.clone().lerp(b.pos, t), tan: a.tan.clone().lerp(b.tan, t).normalize(), up: a.up.clone().lerp(b.up, t).normalize(), right: a.right.clone().lerp(b.right, t).normalize() };
};
function backProject(px, py, h = 0) {
  const ndc = new THREE.Vector2((px / W) * 2 - 1, -(py / H) * 2 + 1);
  const ray = new THREE.Raycaster();
  ray.setFromCamera(ndc, cam);
  let s = live.stage.crest + 10;
  for (let it = 0; it < 40; it++) {
    const f = frameAt(s);
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(f.up, f.pos.clone().addScaledVector(f.up, h));
    const hit = ray.ray.intersectPlane(plane, new THREE.Vector3());
    if (!hit) return null;
    const ds = hit.clone().sub(f.pos).dot(f.tan);
    s = THREE.MathUtils.clamp(s + ds, frames[0].s, frames[frames.length - 1].s);
    if (Math.abs(ds) < 1e-3) {
      const lat = hit.clone().sub(f.pos).dot(f.right);
      return { s: +s.toFixed(3), lat: +lat.toFixed(3), depth: +hit.clone().sub(cam.position).dot(cam.getWorldDirection(new THREE.Vector3())).toFixed(2), world: hit.toArray().map((v) => +v.toFixed(3)) };
    }
  }
  return null;
}
const project = (v) => { const p = v.clone().project(cam); return [+(((p.x + 1) / 2) * W).toFixed(1), +(((1 - p.y) / 2) * H).toFixed(1)]; };

// reference coins: keep the trail (x 380–640), nearest first
const refCoins = refPx.coins.filter((c) => c.x > 380 && c.x < 640).sort((a, b) => b.y - a.y);
const refCoinsWorld = refCoins.map((c) => ({ px: [c.x, c.y], d: c.w, ...backProject(c.x, c.y, 1.2) }));
// game coins in front of the camera, nearest first (largest diameter first)
const gameCoins = [...live.coins].sort((a, b) => b.d - a.d);
const pairs = refCoins.map((c, i) => {
  const g = gameCoins[i];
  return g ? { i, ref: [c.x, c.y, c.w], game: [g.x, g.y, g.d], dx: +(g.x - c.x).toFixed(1), dy: +(g.y - c.y).toFixed(1), dd: g.d - c.w } : { i, ref: [c.x, c.y, c.w], game: null };
});
// the VP the camera produces: the far tunnel axis projected
const axisFar = live.axis ? new THREE.Vector3(...live.axis.b).add(new THREE.Vector3(...live.axis.b).sub(new THREE.Vector3(...live.axis.a)).multiplyScalar(50)) : null;
const vpGame = axisFar ? project(axisFar) : null;
// course centre / the game river path as seen by the camera (for overlays)
const coursePx = frames.filter((f) => f.s > live.stage.crest - 2).map((f) => ({ s: +f.s.toFixed(2), px: project(f.pos) })).filter((q) => q.px[1] > 0 && q.px[1] < H);

const out = {
  generated: new Date().toISOString(),
  method: 'reference landmarks (scripts/landmarks05.py colour thresholds) back-projected through the LIVE locked 05 camera onto the river surface (course frame plane, + coin height 1.2 u for coins).',
  camera: { fov: live.camera.fov, position: live.camera.position, target: live.camera.target },
  vp: { ref: refPx.vp, gameAxisProjected: vpGame },
  benny: { refBox: [230, 767, 612, 1185], gameNdc: live.benny },
  coins: { ref: refCoinsWorld, gameDefs05: live.coinDefs.filter((d) => d.s > live.stage.s0 && d.s < live.stage.s1), pairs },
  coursePx,
};
writeFileSync(`${OUT}/landmarks.json`, JSON.stringify(out, null, 1));
console.log('camera pos', live.camera.position.map((v) => v.toFixed(2)).join(','), 'fov', live.camera.fov, 'aspect', live.camera.aspect.toFixed(4));
console.log('VP ref', refPx.vp && [refPx.vp.x, refPx.vp.y], 'game axis VP', vpGame);
console.log('ref coins → world (s, lat):'); for (const c of refCoinsWorld) console.log(' ', c.px, 'd', c.d, '→ s', c.s, 'lat', c.lat, 'depth', c.depth);
console.log('coin residuals (game − ref):'); for (const p of pairs) console.log(' ', JSON.stringify(p));
