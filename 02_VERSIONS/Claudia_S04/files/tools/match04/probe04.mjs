// read-only probe of the live game at the 04 checkpoint: camera, Benny, course frames over stage 04 (no source change)
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const q = process.argv[2] || '';
const { chromium } = loadPlaywright();
const vite = await startVite(5266);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const st = await page.evaluate(() => window.__rainbow.goto('04'));
  const info = await page.evaluate(() => {
    const R = window.__rainbow; const { scene, camera } = R.qa3d(); const c = R.course;
    const v = (p) => p.toArray().map((x) => +x.toFixed(3));
    const st4 = c.stage('04'), st5 = c.stage('05');
    const frames = []; for (let s = st4.s0 - 4; s <= st5.s0 + 4; s += 2) { const f = c.sample(s); frames.push({ s: +s.toFixed(2), pos: v(f.pos), tan: v(f.tan), up: v(f.up), right: v(f.right) }); }
    let benny = null; scene.traverse((o) => { if (!benny && o.name === 'Benny') benny = o; });
    const V = camera.position.constructor; const mn = new V(1e9, 1e9, 1e9), mx = new V(-1e9, -1e9, -1e9), tmp = new V();
    benny.updateWorldMatrix(true, true);
    benny.traverse((o) => { if (o.isMesh && o.visible && o.geometry) { o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox;
      for (const x of [bb.min.x, bb.max.x]) for (const y of [bb.min.y, bb.max.y]) for (const z of [bb.min.z, bb.max.z]) { tmp.set(x, y, z).applyMatrix4(o.matrixWorld); mn.min(tmp); mx.max(tmp); } } });
    return { s0: st4.s0, s1: st4.s1, cam: R.camera(), bennyRoot: v(benny.position), bennyAABB: [v(mn), v(mx)], frames, state: R.state() };
  });
  console.log(JSON.stringify({ q, st, ...info }));
} finally { await browser.close(); await vite.close?.(); }
