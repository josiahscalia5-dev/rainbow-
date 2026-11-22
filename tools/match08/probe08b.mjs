// read-only probe of the live game at the 08 checkpoint (no source change)
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const q = process.argv[2] || 'match08=1';
const { chromium } = loadPlaywright();
const vite = await startVite(5265);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const st = await page.evaluate(() => window.__rainbow.goto('08'));
  const info = await page.evaluate(() => {
    const { scene, camera } = window.__rainbow.qa3d();
    const v = (p) => [+p.x.toFixed(3), +p.y.toFixed(3), +p.z.toFixed(3)];
    const fwd = camera.getWorldDirection(new camera.position.constructor());
    let benny = null; scene.traverse((o) => { if (!benny && /benny/i.test(o.name)) benny = o; });
    const bp = benny ? benny.getWorldPosition(new camera.position.constructor()) : null;
    // door centre / platform from WORLD (course.ts): door at (12, platform.topY+7, zDoor)
    const door = new camera.position.constructor(12, -110.6 + 7.0, -332); const dp = door.clone().project(camera);
    const plat = new camera.position.constructor(12, -110.6, -325.0); const pp = plat.clone().project(camera);
    const px = (n) => [+((n.x * 0.5 + 0.5) * 864).toFixed(1), +((-n.y * 0.5 + 0.5) * 1536).toFixed(1), +n.z.toFixed(4)];
    return { mw: camera.matrixWorld.elements, pm: camera.projectionMatrix.elements, cam: v(camera.position), fwd: v(fwd), up: v(camera.up), fov: camera.fov, aspect: camera.aspect, benny: bp && v(bp), bennyName: benny && benny.name,
      doorPx: px(dp), platPx: px(pp), quat: camera.quaternion.toArray().map((x) => +x.toFixed(5)) };
  });
  console.log(JSON.stringify({ q, st, ...info }));
} finally { await browser.close(); await vite.close?.(); }
