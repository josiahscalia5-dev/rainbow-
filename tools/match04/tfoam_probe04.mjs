// r19 Thrixel foam test probe (read-only): where is the m04tfoam model, is it loaded, where does it project?
// usage: node tools/match04/tfoam_probe04.mjs "<query>"
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const Q = process.argv[2];
const { chromium } = loadPlaywright();
const vite = await startVite(5268);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { const t = m.text(); if (t.includes('m04') || m.type() === 'error' || m.type() === 'warning') console.log('console:', m.type(), t.slice(0, 300)); }); page.on('requestfailed', (q) => console.log('reqfail', q.url().slice(-80))); page.on('response', (q) => { if (q.status() >= 400) console.log('resp', q.status(), q.url().slice(-90)); });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const fx = await page.evaluate(async () => {
    const out = [];
    for (const u of ['/assets/models/thrixel/foam_cluster_s04.glb', '/assets/models/benny.glb']) {
      try { const r = await fetch(u); out.push([u, r.status, r.headers.get('content-type'), (await r.arrayBuffer()).byteLength]); } catch (e) { out.push([u, String(e)]); }
    }
    return out;
  });
  console.log('fetch', JSON.stringify(fx));
  const res = await page.evaluate(async () => {
    const r = window.__rainbow; r.goto('04');
    r.run(true); await new Promise((res) => setTimeout(res, 6000)); r.run(false);
    const { scene, camera } = r.qa3d();
    let h = null; scene.traverse((o) => { if (o.name === 'm04_thrixel_foam') h = o; });
    if (!h) return { found: false };
    h.updateMatrixWorld(true);
    const THREE = { };
    const wp = h.getWorldPosition(h.position.clone());
    const p = wp.clone().project(camera);
    let meshes = 0, tris = 0; h.traverse((o) => { if (o.isMesh) { meshes++; tris += (o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count) / 3; } });
    return { found: true, visible: h.visible, children: h.children.length, meshes, tris, local: h.position.toArray(), world: wp.toArray(), ndc: [p.x, p.y, p.z], px: [(p.x + 1) / 2 * 864, (1 - p.y) / 2 * 1536] };
  });
  console.log(JSON.stringify(res));
} finally { await browser.close(); await vite.close?.(); }
