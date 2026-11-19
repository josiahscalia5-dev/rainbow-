#!/usr/bin/env node
// env05 (washer-environment-modeler) diagnostics for the locked Screen 05 frame: ONE game load, then
//  * per pixel: every ray hit with object name, index in its parent, program cache key, vertex count, uv, face, point
//  * one screenshot per hide-set (exact object names or "#<index>" children of zone_tubes; comma separated)
//   node scripts/env05-hideshots.mjs --q='match05=1' --out=DIR [--px=x,y ...] [--hide=name1,name2 ...]
// → DIR/shot_00_none.png, DIR/shot_01_<names>.png …, DIR/hits.json. Read-only: nothing in the game is changed
// (visibility is restored after every shot).
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const args = process.argv.slice(2);
const q = (args.find((a) => a.startsWith('--q=')) ?? '--q=').slice(4);
const out = (args.find((a) => a.startsWith('--out=')) ?? '--out=/tmp/env05_hide').slice(6);
const pxs = args.filter((a) => a.startsWith('--px=')).map((a) => a.slice(5).split(',').map(Number));
const hides = args.filter((a) => a.startsWith('--hide=')).map((a) => a.slice(7).split(','));
mkdirSync(out, { recursive: true });

const { chromium } = loadPlaywright();
const vite = await startVite(5207);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${vite.url}/?qa=1&dpr=1${q ? '&' + q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  await page.evaluate(() => window.__rainbow.goto('05'));
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);
  const hits = await page.evaluate(async ({ pxs }) => {
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { scene, camera } = window.__rainbow.qa3d();
    scene.updateMatrixWorld(true);
    const chain = (o) => { const n = []; for (let p = o; p && p !== scene; p = p.parent) n.push((p.name || p.type) + (p.parent ? '#' + p.parent.children.indexOf(p) : '')); return n.reverse().join(' > '); };
    const shown = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
    const rc = new THREE.Raycaster();
    return pxs.map(([x, y]) => {
      rc.setFromCamera(new THREE.Vector2((x + 0.5) / 864 * 2 - 1, -((y + 0.5) / 1536) * 2 + 1), camera);
      const hs = rc.intersectObjects(scene.children, true).filter((h) => shown(h.object)).slice(0, 8);
      return { px: [x, y], hits: hs.map((h) => {
        const m = h.object.material; let key = '';
        try { key = m?.customProgramCacheKey?.() ?? ''; } catch { key = '?'; }
        return { obj: chain(h.object), key: key.slice(-60), verts: h.object.geometry?.attributes?.position?.count, d: +h.distance.toFixed(3),
          uv: h.uv ? [+h.uv.x.toFixed(4), +h.uv.y.toFixed(4)] : null, face: h.faceIndex, inst: h.instanceId, p: h.point.toArray().map((v) => +v.toFixed(3)) };
      }) };
    });
  }, { pxs });
  writeFileSync(`${out}/hits.json`, JSON.stringify(hits, null, 1));
  // --grid=x0,y0,x1,y1,step --objs=name|#idx,… : per pixel, the nearest hit distance against EACH object alone
  // (occlusion order of overlapping surfaces; −1 = no hit) → DIR/grid.json
  const grid = (args.find((a) => a.startsWith('--grid=')) ?? '').slice(7);
  const objs = (args.find((a) => a.startsWith('--objs=')) ?? '').slice(7).split(',').filter(Boolean);
  if (grid && objs.length) {
    const g = await page.evaluate(async ({ grid, objs }) => {
      const THREE = await import('/node_modules/three/build/three.module.js');
      const { scene, camera } = window.__rainbow.qa3d();
      scene.updateMatrixWorld(true);
      const zt = scene.getObjectByName('zone_tubes');
      const find = (n) => (n.startsWith('#') ? zt.children[+n.slice(1)] : (() => { let f = null; scene.traverse((o) => { if (!f && o.name === n && o.visible !== false) f = o; }); return f; })());
      const list = objs.map((n) => [n, find(n)]);
      const [x0, y0, x1, y1, st] = grid.split(',').map(Number);
      const rc = new THREE.Raycaster();
      const rows = [];
      for (let y = y0; y <= y1; y += st) for (let x = x0; x <= x1; x += st) {
        rc.setFromCamera(new THREE.Vector2((x + 0.5) / 864 * 2 - 1, -((y + 0.5) / 1536) * 2 + 1), camera);
        const r = { x, y };
        for (const [n, o] of list) { const h = o ? rc.intersectObject(o, true) : []; r[n] = h.length ? +h[0].distance.toFixed(3) : -1; if (h.length) r[n + '_p'] = h[0].point.toArray().map((v) => +v.toFixed(3)); }
        rows.push(r);
      }
      return rows;
    }, { grid, objs });
    writeFileSync(`${out}/grid.json`, JSON.stringify(g));
    console.log('grid', g.length, 'rays');
  }
  for (const r of hits) {
    console.log(`px ${r.px.join(',')}`);
    for (const h of r.hits) console.log(`   d ${h.d}  ${h.obj}  [${h.key}] v${h.verts} uv ${h.uv} f ${h.face}${h.inst !== undefined ? ' i ' + h.inst : ''}`);
  }
  const sets = [[], ...hides];
  for (let i = 0; i < sets.length; i++) {
    const names = sets[i];
    const n = await page.evaluate(({ names }) => {
      const { scene } = window.__rainbow.qa3d();
      const zt = scene.getObjectByName('zone_tubes');
      const hidden = [];
      scene.traverse((o) => {
        const idx = o.parent === zt ? '#' + zt.children.indexOf(o) : null;
        if (names.includes(o.name) || (idx && names.includes(idx))) { if (o.visible) { o.visible = false; hidden.push(o); } }
      });
      window.__env05Hidden = hidden;
      return hidden.length;
    }, { names });
    await page.evaluate(() => window.__rainbow.drawList?.());
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
    const tag = names.length ? names.join('+').replace(/[^\w+#-]/g, '_') : 'none';
    await page.screenshot({ path: `${out}/shot_${String(i).padStart(2, '0')}_${tag}.png` });
    await page.evaluate(() => { for (const o of window.__env05Hidden) o.visible = true; window.__env05Hidden = []; });
    console.log('shot', i, tag, 'hidden', n);
  }
  if (errors.length) console.log('console errors:', errors.slice(0, 5));
} finally {
  await browser.close();
  await vite.close();
}
