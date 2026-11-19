// read-only probe of the live game at the 07 checkpoint (no source change): course samples over 06..08, Benny's visible
// mesh vertices (subsampled, world), his water point + frame, the live camera. usage: node tools/match07/probe07.mjs [query] > out.json
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const q = process.argv[2] || '';
const { chromium } = loadPlaywright();
const vite = await startVite(5277);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  await page.evaluate(() => window.__rainbow.goto('07'));
  const out = await page.evaluate(() => {
    const R = window.__rainbow; const { scene, camera } = R.qa3d(); const c = R.course;
    let benny = null; scene.traverse((o) => { if (!benny && o.name === 'Benny') benny = o; });
    benny.updateWorldMatrix(true, true);
    const V = camera.position.constructor; const t = new V(); const pts = [];
    benny.traverse((o) => { if (!o.isMesh || !o.visible || !o.geometry) return; let vis = true; let p = o; while (p) { if (!p.visible) vis = false; p = p.parent; } if (!vis) return;
      const pa = o.geometry.attributes.position; const step = Math.max(1, Math.floor(pa.count / 400));
      for (let i = 0; i < pa.count; i += step) { t.fromBufferAttribute(pa, i); if (o.isSkinnedMesh) o.applyBoneTransform(i, t); t.applyMatrix4(o.matrixWorld); pts.push([+t.x.toFixed(4), +t.y.toFixed(4), +t.z.toFixed(4)]); } });
    const s = R.state().s; const f = c.sample(s);
    const a = (v) => v.toArray().map((x) => +x.toFixed(4));
    const samples = []; for (let u = c.stage('05').s0; u <= c.stage('08').s0 + 0.001; u += 0.5) { const g = c.sample(u); samples.push([+u.toFixed(2), ...a(g.pos), ...a(g.tan), ...a(g.up), ...a(g.right)]); }
    const st = {}; for (const id of ['05', '06', '07', '08']) { const x = c.stage(id); st[id] = [x.s0, x.s1, x.width, x.tube]; }
    return { s, stages: st, marks: c.marks, root: benny.position.toArray(), water: a(f.pos), tan: a(f.tan), up: a(f.up), right: a(f.right), cam: R.camera(), state: R.state(), pts, samples };
  });
  console.log(JSON.stringify(out));
} finally { await browser.close(); await vite.close?.(); }
