#!/usr/bin/env node
// foam-bubbles-particles (Screen 05, `splash05m` / `bub05`): read-only probe of the LOCKED 05 frame.
// Loads the game like scripts/capture.mjs, goes to checkpoint 05 and writes JSON with
//   * the live camera (matrixWorld, projection, fov, aspect),
//   * the 05 splash placement (rider_splash05: position, quaternion = Benny's water frame, uR, uStrength),
//   * for every approved bubble centre (masks/bubbles_approved.json) the visible hits along its view ray
//     (bubbles / splash / spray / transparent sprites skipped): distance + object chain,
// and optionally (--bg=FILE) a screenshot with the 05 splash, the shared splash fan and the spray hidden
// (the background the wake card is solved against).
//   node tools/splash05/probe.mjs --q='match05=1' --out=probe.json [--bg=bg.png]
import { readFileSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';

const args = process.argv.slice(2);
const arg = (k, d = '') => (args.find((a) => a.startsWith(`--${k}=`)) ?? `--${k}=${d}`).slice(k.length + 3);
const q = arg('q');
const out = arg('out', 'probe.json');
const bg = arg('bg');
const bubbles = JSON.parse(readFileSync('qa/pilot05/full_reference_match/masks/bubbles_approved.json', 'utf8'));

const { chromium } = loadPlaywright();
const vite = await startVite(5207);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1${q ? '&' + q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  await page.evaluate(() => window.__rainbow.goto('05'));
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
  const res = await page.evaluate(async ({ bubbles }) => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { scene, camera } = window.__rainbow.qa3d();
    scene.updateMatrixWorld(true);
    const chain = (o) => { const n = []; for (let p = o; p && p !== scene; p = p.parent) n.push(p.name || p.type); return n.reverse().join(' > '); };
    const shown = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
    const skip = (o) => /bubble|splash|spray|rider/i.test(chain(o));
    const rc = new THREE.Raycaster();
    const hitsAt = (x, y) => {
      rc.setFromCamera(new THREE.Vector2((x + 0.5) / 864 * 2 - 1, -((y + 0.5) / 1536) * 2 + 1), camera);
      return rc.intersectObjects(scene.children, true).filter((h) => shown(h.object) && !skip(h.object)).slice(0, 4)
        .map((h) => ({ d: +h.distance.toFixed(4), obj: chain(h.object), p: h.point.toArray().map((v) => +v.toFixed(4)), transparent: !!h.object.material?.transparent }));
    };
    let sp = null;
    scene.traverse((o) => { if (o.name === 'rider_splash05') sp = o; });
    const dir = new THREE.Vector3(); camera.getWorldDirection(dir);
    return {
      camera: { matrixWorld: camera.matrixWorld.toArray(), projection: camera.projectionMatrix.toArray(), fov: camera.fov, aspect: camera.aspect, near: camera.near, far: camera.far, position: camera.position.toArray(), dir: dir.toArray() },
      splash05: sp ? { position: sp.position.toArray(), quaternion: sp.quaternion.toArray(), matrixWorld: sp.matrixWorld.toArray(), visible: sp.visible, uR: sp.material.uniforms.uR.value, uStrength: sp.material.uniforms.uStrength.value } : null,
      bubbles: bubbles.map((b) => ({ ...b, hits: hitsAt(b.x, b.y) })),
      state: window.__rainbow.state(),
    };
  }, { bubbles });
  writeFileSync(out, JSON.stringify(res, null, 1));
  console.log('probe →', out, JSON.stringify(res.splash05));
  if (bg) {
    await page.evaluate(() => {
      const { scene } = window.__rainbow.qa3d();
      scene.traverse((o) => { if (['rider_splash05', 'rider_splash', 'spray'].includes(o.name)) o.visible = false; });
      window.__rainbow.drawList?.();
    });
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
    await page.screenshot({ path: bg });
    console.log('bg →', bg);
  }
} finally {
  await browser.close();
  await vite.close();
}
