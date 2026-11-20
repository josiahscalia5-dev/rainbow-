// Screen 06 round 18 (QA only): deterministic start-view render like r16_start.mjs, with optional per-surface debug tints
// (tube green, floor red, rings blue, paddles yellow) to see which proxy surface a pixel comes from.
//   node tools/match06/r18_dbg.mjs <outDir> "<query>" name@D[:tint] [name@D[:tint] ...]
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [OUT, Q, ...shots] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5276);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  for (const spec of shots) {
    const [nameD, tint] = spec.split(':');
    const [name, Ds] = nameD.split('@');
    const D = Number(Ds || 0);
    const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.error('pageerror', e.message));
    page.on('console', (m) => { const t = m.text(); if (t.includes('[match06]')) console.log(t); });
    await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
    await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
    const st = await page.evaluate(([D, tint]) => {
      performance.now = () => 50000;
      const r = window.__rainbow; r.run(false); r.goto('06');
      const s0 = r.state().s; let n = 0;
      while (D > 0 && r.state().s < s0 + D - 1e-3 && n < 4000) { r.step(1); n++; }
      if (tint) {
        const { scene } = r.qa3d();
        const col = { m06_tube: [0, 1, 0], m06_floor: [1, 0, 0], m06_rings: [0, 0, 1], m06_paddles: [1, 1, 0], m06_end: [1, 0, 1] };
        scene.traverse((o) => { const u = o.material?.uniforms?.uDbg; if (u && col[o.name]) u.value.set(...col[o.name]); });
      }
      r.freezeAt(12); r.drawList();
      return r.state();
    }, [D, tint === 'tint']);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log(name, 's', st.s, 'cam', st.cam.join(','), 'coins', st.coins);
    await page.close();
  }
} finally {
  await browser.close(); await vite.close?.();
}
