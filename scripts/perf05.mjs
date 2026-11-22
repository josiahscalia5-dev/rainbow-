// Relative frame cost of Screen 05 URL-switch variants at the locked checkpoint (headless Chromium, WebGL2).
//   node scripts/perf05.mjs OUT.json [--size=864x1536] name=query ...
import { writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';
const args = process.argv.slice(2); const out = args.shift();
const size = (args.find((a) => a.startsWith('--size=')) ?? '--size=864x1536').slice(7).split('x').map(Number);
const N = 14;
const variants = args.filter((a) => !a.startsWith('--')).map((a) => { const i = a.indexOf('='); return [a.slice(0, i), a.slice(i + 1)]; });
const { chromium } = loadPlaywright();
const vite = await startVite(5237);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const res = { when: new Date().toISOString(), size, frames: N, renderer: null, note: 'headless Chromium, WebGL2 on SwiftShader (CPU rasteriser): RELATIVE cost only, not device fps', variants: [] };
try {
  for (let round = 0; round < 2; round++) for (const [name, q] of variants) {
    const page = await browser.newPage({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 1 });
    const errors = []; page.on('pageerror', (e) => errors.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)); });
    await page.goto(`${vite.url}/?qa=1&dpr=1${q ? '&' + q : ''}`);
    await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
    await page.evaluate(() => window.__rainbow.goto('05'));
    await page.waitForTimeout(300);
    const r = await page.evaluate((n) => {
      const gl = document.querySelector('canvas').getContext('webgl2'); const px = new Uint8Array(4);
      const d = gl.getExtension('WEBGL_debug_renderer_info');
      const one = () => { window.__rainbow.drawList(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); };
      one(); one();
      const ts = [];
      for (let i = 0; i < n; i++) { const t = performance.now(); one(); ts.push(performance.now() - t); }
      ts.sort((a, b) => a - b);
      const st = window.__rainbow.stats();
      return { median: ts[Math.floor(n / 2)], min: ts[0], max: ts[n - 1], calls: st.calls, tris: st.triangles, textures: st.textures, geometries: st.geometries, renderer: d ? gl.getParameter(d.UNMASKED_RENDERER_WEBGL) : 'unknown' };
    }, N);
    res.renderer = r.renderer;
    let v = res.variants.find((x) => x.name === name);
    if (!v) { v = { name, query: q, runs: [] }; res.variants.push(v); }
    v.runs.push(+r.median.toFixed(1)); Object.assign(v, { calls: r.calls, tris: r.tris, textures: r.textures, geometries: r.geometries, errors });
    console.log(round, name, JSON.stringify({ medianMs: +r.median.toFixed(1), minMs: +r.min.toFixed(1), calls: r.calls, tris: r.tris, textures: r.textures, errors: errors.length }));
    await page.close();
  }
  for (const v of res.variants) v.medianMs = Math.min(...v.runs);
  const base = res.variants[0].medianMs;
  for (const v of res.variants) v.vsFirst = +(v.medianMs / base).toFixed(3);
} finally {
  writeFileSync(out, JSON.stringify(res, null, 2));
  await browser.close(); await vite.close();
}
console.log(JSON.stringify(res.variants.map((v) => [v.name, v.medianMs, v.vsFirst, v.textures])));
