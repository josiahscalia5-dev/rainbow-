// Lead QA (read-only): where does each coin land on screen in the approved 08 view (?match08=1 + extra switches)?
// Compares with the painted coin pixels in assets/textures/match08/coins08.json. No game code is changed.
//   node tools/match08/coinprobe08.mjs [--q=extra=1] [--out=qa/match/08/coins/probe.json]
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const arg = (k, d = '') => (process.argv.find((a) => a.startsWith(`--${k}=`)) ?? `--${k}=${d}`).slice(k.length + 3);
const q = arg('q'), out = arg('out');
const painted = JSON.parse(readFileSync('assets/textures/match08/coins08.json', 'utf8')).coins.map((c) => c.px);
const { chromium } = loadPlaywright();
const vite = await startVite(5223);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
await page.goto(`${vite.url}/?qa=1&dpr=1&match08=1${q ? '&' + q : ''}`);
await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 240000 });
await page.evaluate(() => window.__rainbow.goto('08'));
await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
const res = await page.evaluate(() => {
  const api = window.__rainbow, { scene, camera } = api.qa3d(), defs = api.coinDefs();
  let mesh = null;
  scene.traverse((o) => { if (o.isInstancedMesh && o.count === defs.length && !mesh) mesh = o; });
  const T = mesh.constructor; // any three class gives us access to the namespace via instances below
  const m = mesh.instanceMatrix.array, W = 864, H = 1536, outv = [];
  const v = camera.position.clone();
  for (let i = 0; i < defs.length; i++) {
    const p = v.clone().set(m[i * 16 + 12], m[i * 16 + 13], m[i * 16 + 14]);
    const sx = m[i * 16 + 0], sy = m[i * 16 + 1], sz = m[i * 16 + 2], scale = Math.hypot(sx, sy, sz);
    const d = p.distanceTo(camera.position);
    const ndc = p.clone().project(camera);
    if (ndc.z > 1 || ndc.z < -1) continue;
    const x = (ndc.x + 1) / 2 * W, y = (1 - ndc.y) / 2 * H;
    if (x < -50 || x > W + 50 || y < -50 || y > H + 50) continue;
    outv.push({ i, s: +defs[i].s.toFixed(2), lat: +defs[i].lat.toFixed(2), taken: defs[i].taken, px: [Math.round(x), Math.round(y)], scale: +scale.toFixed(3), dist: +d.toFixed(2) });
  }
  return { cam: camera.position.toArray(), fov: camera.fov, coins: outv };
});
res.painted = painted;
// nearest painted coin for each visible coin
for (const c of res.coins) { let b = null; for (const p of painted) { const d = Math.hypot(c.px[0] - p[0], c.px[1] - p[1]); if (!b || d < b.d) b = { d: Math.round(d), p }; } c.nearestPainted = b; }
console.log(JSON.stringify(res, null, 0).slice(0, 4000));
if (out) { mkdirSync(dirname(out), { recursive: true }); writeFileSync(out, JSON.stringify(res, null, 1)); }
await browser.close(); await vite.close(); process.exit(0);
