#!/usr/bin/env node
// Where is the ride camera relative to the 06/07 gold rings? For each sample time: the ring whose plane is nearest to
// the camera, the camera's and Benny's radial distance from that ring's axis in ring radii (>1 = outside the ring),
// and the axial distance to its plane. Usage: node tools/camclear/ringpos.mjs --q=... --times=28,31.5,40,42
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const arg = (k, d = '') => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const q = arg('q');
const times = arg('times', '28,31.5,32,39,40,41,42,43.5').split(',').map(Number);
const { chromium } = loadPlaywright();
const vite = await startVite(5236);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const page = await browser.newPage({ viewport: { width: 135, height: 240 } });
await page.goto(`${vite.url}/?qa=1&dpr=1&bloom=0${q ? '&' + q : ''}`);
await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
let tNow = 0;
for (const tg of times) {
  const n = Math.round((tg - tNow) * 60);
  await page.evaluate((n) => window.__rainbow.step(n, 1 / 60), n);
  tNow += n / 60;
  const r = await page.evaluate(() => {
    const api = window.__rainbow;
    const { scene, camera } = api.qa3d();
    const V3 = camera.position.constructor;
    const M4 = camera.matrixWorld.constructor;
    const benny = scene.getObjectByName('Benny');
    const bc = (benny.children[0] ?? benny).getWorldPosition(new V3());
    const out = [];
    scene.traverse((o) => {
      if (!o.isInstancedMesh || !o.visible) return;
      const col = o.material?.color?.getHexString?.();
      if (col !== 'ffc890') return;
      const m = new M4(), inv = new M4();
      let best = null;
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m);
        m.premultiply(o.matrixWorld);
        inv.copy(m).invert();
        const c = camera.position.clone().applyMatrix4(inv);
        const b = bc.clone().applyMatrix4(inv);
        // axial: local z is world units (collar keeps z scale 1); radial in ring radii
        const sx = new V3().setFromMatrixColumn(m, 0).length();
        const e = { i, camRadial: +Math.hypot(c.x, c.y).toFixed(3), camAxial: +c.z.toFixed(2), bennyRadial: +Math.hypot(b.x, b.y).toFixed(3), bennyAxial: +b.z.toFixed(2), ringR: +sx.toFixed(2) };
        if (Math.sign(c.z) !== Math.sign(b.z) || Math.abs(c.z) < 1.5) { if (!best || Math.abs(c.z) < Math.abs(best.camAxial)) best = e; }
      }
      out.push(best);
    });
    return { st: api.state(), ring: out };
  });
  console.log(JSON.stringify({ t: tg, stage: r.st.stage, s: r.st.s, ring: r.ring }));
}
await browser.close();
await vite.close();
