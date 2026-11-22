import { writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '/home/user/rainbow-/scripts/lib/pw.mjs';
const { chromium } = loadPlaywright();
const vite = await startVite(5259);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&match07=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 240000 });
  const info = await page.evaluate(async () => {
    const R = window.__rainbow; R.goto('07');
    const { scene, camera, renderer } = R.qa3d();
    const chain = (o) => { let c = ''; let p = o; while (p) { c += (p.name || p.type) + '<'; p = p.parent; } return c; };
    const vis = [];
    scene.traverse((o) => { if ((o.isMesh || o.isPoints) && /benny/i.test(chain(o)) && o.visible) { o.geometry.computeBoundingSphere?.(); vis.push([chain(o).slice(0, 60), o.type, o.geometry?.boundingSphere?.radius?.toFixed?.(2), o.material?.transparent, o.material?.alphaTest]); } });
    const saved = [];
    scene.traverse((o) => { if (o.isMesh || o.isPoints || o.isSprite || o.isLine) { saved.push([o, o.visible]); o.visible = o.visible && o.isMesh && /benny/i.test(chain(o)); } });
    const bg = scene.background; scene.background = null;
    renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL('image/png');
    scene.background = bg; for (const [o, v] of saved) o.visible = v;
    return { vis, url };
  });
  writeFileSync(process.argv[2], Buffer.from(info.url.split(',')[1], 'base64'));
  console.log(JSON.stringify(info.vis.slice(0, 40)));
} finally { await browser.close(); await vite.close(); }
