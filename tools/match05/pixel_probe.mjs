#!/usr/bin/env node
// Coordinator tool (Screen 05 full reference match): which 3D objects lie under given screen pixels of the locked 05
// frame? Loads the game exactly like scripts/capture.mjs, goes to checkpoint 05, then raycasts through each pixel with the
// live camera and lists every hit (name, parent chain, material type, distance, renderOrder, visible).
//   node tools/match05/pixel_probe.mjs --q='match05=1' --px=185,570 --px=350,555 [--hide=<name substring>] [--shot=out.png]
// Read-only: the game is not changed. --hide makes matching objects invisible before --shot (diagnostics only).
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';

const args = process.argv.slice(2);
const q = (args.find((a) => a.startsWith('--q=')) ?? '--q=').slice(4);
const pxs = args.filter((a) => a.startsWith('--px=')).map((a) => a.slice(5).split(',').map(Number));
const hide = args.filter((a) => a.startsWith('--hide=')).map((a) => a.slice(7));
const shot = (args.find((a) => a.startsWith('--shot=')) ?? '').slice(7);

const { chromium } = loadPlaywright();
const vite = await startVite(5203);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1${q ? '&' + q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  await page.evaluate(() => window.__rainbow.goto('05'));
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
  const out = await page.evaluate(async ({ pxs, hide }) => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { scene, camera } = window.__rainbow.qa3d();
    scene.updateMatrixWorld(true);
    const chain = (o) => { const n = []; for (let p = o; p && p !== scene; p = p.parent) n.push(p.name || p.type); return n.reverse().join(' > '); };
    const shown = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
    const rc = new THREE.Raycaster();
    const res = pxs.map(([x, y]) => {
      rc.setFromCamera(new THREE.Vector2((x + 0.5) / 864 * 2 - 1, -((y + 0.5) / 1536) * 2 + 1), camera);
      const hits = rc.intersectObjects(scene.children, true).filter((h) => shown(h.object)).slice(0, 8);
      return { px: [x, y], hits: hits.map((h) => ({ obj: chain(h.object), mat: h.object.material?.type ?? '-', d: +h.distance.toFixed(3), ro: h.object.renderOrder, transparent: !!h.object.material?.transparent, depthTest: h.object.material?.depthTest })) };
    });
    let hidden = 0;
    if (hide.length) scene.traverse((o) => { if (hide.some((h) => (o.name || '').includes(h))) { o.visible = false; hidden++; } });
    return { res, hidden };
  }, { pxs, hide });
  for (const r of out.res) {
    console.log(`px ${r.px.join(',')}`);
    for (const h of r.hits) console.log(`   d ${h.d}  ro ${h.ro}  ${h.mat}${h.transparent ? ' transparent' : ''}${h.depthTest === false ? ' noDepthTest' : ''}  ${h.obj}`);
  }
  if (hide.length) console.log('hidden objects:', out.hidden);
  if (shot) {
    await page.evaluate(() => window.__rainbow.drawList?.());
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
    await page.screenshot({ path: shot });
    console.log('shot →', shot);
  }
} finally {
  await browser.close();
  await vite.close();
}
