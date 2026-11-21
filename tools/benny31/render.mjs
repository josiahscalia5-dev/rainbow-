// node tools/benny31/render.mjs <model> <outdir> '<json [[yaw,pitch],...]>' [size]
// model = current | <path to .glb under the repo> ; extra query via env Q (e.g. Q='benny05=1')
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const [model, out, posesJson, size = '512'] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const poses = JSON.parse(posesJson);
const { chromium } = loadPlaywright();
const vite = await startVite(5203 + Math.floor(Math.random() * 50));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 900, height: 900 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  const m = model === 'current' ? 'current' : '/' + model.replace(/^\.?\//, '');
  await page.goto(`${vite.url}/src/characters/benny/benny31-lab.html?model=${encodeURIComponent(m)}${process.env.Q ? '&' + process.env.Q : ''}`);
  await page.waitForFunction(() => window.__lab?.ready || window.__error, null, { timeout: 300000 });
  const err = await page.evaluate(() => window.__error); if (err) throw new Error(err);
  for (const [yaw, pitch] of poses) {
    const url = await page.evaluate(([y, p, s]) => window.__lab.render({ yaw: y, pitch: p, w: s, h: s }), [yaw, pitch, +size]);
    writeFileSync(`${out}/y${yaw}_p${pitch}.png`, Buffer.from(url.split(',')[1], 'base64'));
  }
  console.log('rendered', poses.length, 'to', out);
} finally { await browser.close(); await vite.close(); }
