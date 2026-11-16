import { loadPlaywright, CHROMIUM_ARGS, startVite } from '/home/user/rainbow-/scripts/lib/pw.mjs';
const { chromium } = loadPlaywright();
const vite = await startVite(5251);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&proj05=1&projflow05=2&projnear05=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const read = () => page.evaluate(() => { const { scene } = window.__rainbow.qa3d(); const r = scene.getObjectByName('water_ribbon'); const v = r.material.uniforms.uPjNear.value; return { near: [v.x, v.y, v.z, v.w], s: window.__rainbow.state().s }; });
  console.log('after ready     ', JSON.stringify(await read()));
  await page.evaluate(() => window.__rainbow.goto('05'));
  console.log('after goto 05   ', JSON.stringify(await read()));
  await page.evaluate(() => window.__rainbow.drawList());
  console.log('after drawList  ', JSON.stringify(await read()));
  await page.evaluate(() => window.__rainbow.step(1, 1 / 60));
  console.log('after step(1)   ', JSON.stringify(await read()));
} finally { await browser.close(); await vite.close(); }
