// read-only: at the 06 checkpoint dump Benny's world vertices (subsampled), the live camera and the course frames from
// 06 start to 07 + 70 u (pos, tan, up, right, width) for the offline camera solve / proxy fit (tools/match06/*.py).
// usage: node tools/match06/probe06.mjs [query] > out.json
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const q = process.argv[2] || '';
const { chromium } = loadPlaywright();
const vite = await startVite(5276);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  await page.evaluate(() => window.__rainbow.goto('06'));
  const out = await page.evaluate(() => {
    const R = window.__rainbow; const { scene, camera } = R.qa3d(); const c = R.course;
    let benny = null; scene.traverse((o) => { if (!benny && o.name === 'Benny') benny = o; });
    benny.updateWorldMatrix(true, true);
    const V = camera.position.constructor; const t = new V(); const pts = [];
    benny.traverse((o) => { if (!o.isMesh || !o.visible || !o.geometry) return; let vis = true; let p = o; while (p) { if (!p.visible) vis = false; p = p.parent; } if (!vis) return;
      const pa = o.geometry.attributes.position; const step = Math.max(1, Math.floor(pa.count / 400));
      for (let i = 0; i < pa.count; i += step) { t.fromBufferAttribute(pa, i); if (o.isSkinnedMesh) o.applyBoneTransform(i, t); t.applyMatrix4(o.matrixWorld); pts.push([+t.x.toFixed(4), +t.y.toFixed(4), +t.z.toFixed(4)]); } });
    const v = (p) => p.toArray().map((x) => +x.toFixed(4));
    const st6 = c.stage('06'), st7 = c.stage('07');
    const frames = []; for (let s = st6.s0 - 12; s <= st7.s0 + 70; s += 0.5) { const f = c.sample(s); frames.push({ s: +s.toFixed(2), pos: v(f.pos), tan: v(f.tan), up: v(f.up), right: v(f.right), w: +c.widthAt(s).toFixed(3) }); }
    const st = R.state();
    return { s: st.s, lat: st.lat, s06: [st6.s0, st6.s1], s07: [st7.s0, st7.s1], root: v(benny.position), cam: R.camera(), mw: camera.matrixWorld.elements, fov: camera.fov, water: v(c.sample(st.s).pos), frames, pts };
  });
  console.log(JSON.stringify(out));
} finally { await browser.close(); await vite.close?.(); }
