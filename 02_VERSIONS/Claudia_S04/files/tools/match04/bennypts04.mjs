// read-only: world-space vertices (subsampled) of Benny's visible meshes at the 04 checkpoint + the course frame there,
// for the offline camera solve (tools/match04/solve_cam04.py). usage: node tools/match04/bennypts04.mjs [query] > out.json
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const q = process.argv[2] || '';
const { chromium } = loadPlaywright();
const vite = await startVite(5267);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  await page.evaluate(() => window.__rainbow.goto('04'));
  const out = await page.evaluate(() => {
    const R = window.__rainbow; const { scene, camera } = R.qa3d();
    let benny = null; scene.traverse((o) => { if (!benny && o.name === 'Benny') benny = o; });
    benny.updateWorldMatrix(true, true);
    const V = camera.position.constructor; const t = new V(); const pts = [];
    benny.traverse((o) => { if (!o.isMesh || !o.visible || !o.geometry) return; let vis = true; let p = o; while (p) { if (!p.visible) vis = false; p = p.parent; } if (!vis) return;
      const pa = o.geometry.attributes.position; const step = Math.max(1, Math.floor(pa.count / 400));
      for (let i = 0; i < pa.count; i += step) { t.fromBufferAttribute(pa, i); if (o.isSkinnedMesh) o.applyBoneTransform(i, t); t.applyMatrix4(o.matrixWorld); pts.push([+t.x.toFixed(4), +t.y.toFixed(4), +t.z.toFixed(4)]); } });
    const s = R.state().s; const f = R.course.sample(s);
    return { s, root: benny.position.toArray(), water: f.pos.toArray(), tan: f.tan.toArray(), up: f.up.toArray(), right: f.right.toArray(), cam: R.camera(), pts };
  });
  console.log(JSON.stringify(out));
} finally { await browser.close(); await vite.close?.(); }
