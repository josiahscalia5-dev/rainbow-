// node tools/benny31/uvpass.mjs <glb> <yaw> <pitch> <size> <out.f32>   (rows bottom-up, RGBA float32: u, v, facing, coverage)
import { writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const [glb, yaw, pitch, size, out] = process.argv.slice(2);
const { chromium } = loadPlaywright();
const vite = await startVite(5260 + Math.floor(Math.random() * 30));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await page.goto(`${vite.url}/src/characters/benny/benny31-lab.html?model=${encodeURIComponent('/' + glb)}`);
  await page.waitForFunction(() => window.__lab?.ready || window.__error, null, { timeout: 300000 });
  const b64 = await page.evaluate(([y, p, s]) => window.__lab.uv({ yaw: y, pitch: p, w: s, h: s }), [+yaw, +pitch, +size]);
  writeFileSync(out, Buffer.from(b64, 'base64'));
  console.log('uv pass', out);
} finally { await browser.close(); await vite.close(); }
