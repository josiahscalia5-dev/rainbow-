#!/usr/bin/env node
// Any screen: search the checkpoint camera framing (STAGE_CAM override, nothing in the source changes) so the game's
// Benny lands on the approved picture's Benny: bounding-box IoU of the REAL rendered Benny (Benny-only mask) vs the
// target box measured on the approved picture (Benny rendered with his own materials so the fur cards' alpha test
// holds; the mask is the render's alpha). Coarse grid, then a local refinement round.
//   node scripts/match-cam-fit.mjs --id=07 --target=200,790,640,1200 [--q=match07=1]
//        [--grid='{"back":[5.5,6.5,7.5],"up":[3.2,4,4.8],"lookUp":[-2,-0.5,1],"ahead":[16,22],"latFollow":[0.6]}']
// Prints the best candidates; writes qa/match/<id>/cam/fit.json.
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const ID = String(opt.id ?? '07');
const Q = typeof opt.q === 'string' ? opt.q : `match${ID}=1`;
const TARGET = String(opt.target).split(',').map(Number);
const GRID = JSON.parse(typeof opt.grid === 'string' ? opt.grid : '{"back":[5.5,6.5,7.5],"up":[3.2,4,4.8],"lookUp":[-2,-0.5,1],"ahead":[16,22]}');
const OUT = typeof opt.out === 'string' ? opt.out : `qa/match/${ID}/cam`;
const W = ID === '03' ? 727 : 864, H = 1536;
mkdirSync(OUT, { recursive: true });
const cartesian = (g) => Object.entries(g).reduce((acc, [k, vs]) => acc.flatMap((a) => vs.map((v) => ({ ...a, [k]: v }))), [{}]);
const { chromium } = loadPlaywright();
const vite = await startVite(5257);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const evalAll = (cands) => page.evaluate(async ([id, cands, T, W, H]) => {
    const { STAGE_CAM } = await import('/src/game/cameraRig.ts');
    const THREE = await import('/node_modules/.vite/deps/three.js');
    const R = window.__rainbow;
    window.__camBase ??= JSON.parse(JSON.stringify(STAGE_CAM[id]));
    const { scene, camera, renderer } = R.qa3d();
    const sw = W / 4, sh = H / 4;
    const rt = new THREE.WebGLRenderTarget(sw, sh);
    const white = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const chain = (o) => { let c = ''; let p = o; while (p) { c += (p.name || '') + '<'; p = p.parent; } return c.toLowerCase(); };
    const out = [];
    for (const cand of cands) {
      STAGE_CAM[id] = { ...window.__camBase, ...cand };
      R.goto(id);
      camera.updateMatrixWorld();
      const saved = [];
      // Benny with his OWN materials (the fur cards need their alpha test), everything else hidden: alpha = mask
      scene.traverse((o) => { if (o.isMesh || o.isPoints || o.isSprite || o.isLine) { saved.push([o, o.visible, o.material]); const b = o.isMesh && /benny/.test(chain(o)); o.visible = o.visible && b; } });
      const bg = scene.background; scene.background = null;
      renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); renderer.setRenderTarget(null);
      scene.background = bg;
      for (const [o, v, m] of saved) { o.visible = v; o.material = m; }
      const px = new Uint8Array(sw * sh * 4); renderer.readRenderTargetPixels(rt, 0, 0, sw, sh, px);
      let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
      for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) if (px[(y * sw + x) * 4 + 3] > 127) { const Y = sh - 1 - y; x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }
      if (x1 < 0) { out.push({ cand, iou: 0, box: null }); continue; }
      const b = [x0 * 4, y0 * 4, (x1 + 1) * 4, (y1 + 1) * 4];
      const ix = Math.max(0, Math.min(b[2], T[2]) - Math.max(b[0], T[0])), iy = Math.max(0, Math.min(b[3], T[3]) - Math.max(b[1], T[1]));
      const inter = ix * iy, uni = (b[2] - b[0]) * (b[3] - b[1]) + (T[2] - T[0]) * (T[3] - T[1]) - inter;
      out.push({ cand, iou: inter / uni, box: b });
    }
    STAGE_CAM[id] = window.__camBase;
    return out;
  }, [ID, cands, TARGET, W, H]);
  const coarse = await evalAll(cartesian(GRID));
  coarse.sort((a, b) => b.iou - a.iou);
  const best = coarse[0].cand;
  const fine = [];
  for (const k of Object.keys(best)) {
    const step = { back: 0.4, up: 0.3, lookUp: 0.5, ahead: 2, latFollow: 0.15, fov: 2 }[k] ?? 0.2;
    for (const d of [-1, 1]) fine.push({ ...best, [k]: Math.round((best[k] + d * step) * 100) / 100 });
  }
  const fineRes = (await evalAll(fine)).concat(coarse.slice(0, 1)).sort((a, b) => b.iou - a.iou);
  writeFileSync(`${OUT}/fit.json`, JSON.stringify({ id: ID, target: TARGET, best: fineRes[0], coarse: coarse.slice(0, 10), fine: fineRes.slice(0, 10) }, null, 1));
  for (const r of fineRes.slice(0, 5)) console.log('iou', r.iou.toFixed(3), JSON.stringify(r.cand), 'box', JSON.stringify(r.box));
} finally {
  await browser.close();
  await vite.close();
}
