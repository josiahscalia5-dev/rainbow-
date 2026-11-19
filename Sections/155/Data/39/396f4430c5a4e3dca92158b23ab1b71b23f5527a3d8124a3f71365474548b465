#!/usr/bin/env node
// Obstruction probe on the REAL running game: plays the game from app start (intro t = 0, no tap) with the game's own
// 60 Hz simulation and, every --dt seconds of game time between --t0 and --t1, saves the frame the phone shows
// (full post chain + HUD) and measures it:
//   near2 / near05  share of the frame covered by anything (meshes, foam, particles) within 2 u / 0.5 u of the camera
//                   (camera.far clipped render, every object with its own material)
//   nearBy          which objects make up near2 (per-object near renders, layer isolation), share of frame each
//   benny           silhouette share hidden by other objects (full − no-Benny difference vs Benny-only mask), his
//                   screen box, his body bottom / centre relative to the surface hit straight below him (and its name)
//   inside          camera-origin rays (14 directions) whose first hit is a BACK face within 3 u (= camera inside or
//                   behind a mesh), with the mesh names
// Usage: node tools/camclear/probe.mjs --q=match08=1 --t0=0 --t1=54 --dt=0.5 --size=270x480 --out=DIR [--nometrics]
//        [--steer=-1|0|1] [--apk=<unzipped assets/public>] [--times=34,35.5,...]
import { writeFileSync, mkdirSync } from 'node:fs';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';

const arg = (k, d = '') => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const has = (k) => process.argv.includes(`--${k}`);
const q = arg('q');
const apk = arg('apk');
const t0 = Number(arg('t0', '0')), t1 = Number(arg('t1', '54')), dt = Number(arg('dt', '0.5'));
const times = arg('times') ? arg('times').split(',').map(Number) : null;
const [W, H] = arg('size', '270x480').split('x').map(Number);
const out = arg('out', 'qa/gameplay_video/probe');
const steer = arg('steer') === '' ? null : Number(arg('steer'));
const steerPlan = arg('steerplan') ? arg('steerplan').split(',').map((p) => p.split(':').map(Number)) : null;
const metrics = !has('nometrics');
mkdirSync(out, { recursive: true });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.glb': 'model/gltf-binary', '.woff2': 'font/woff2', '.woff': 'font/woff', '.txt': 'text/plain' };
async function serveStatic(root, port = 5233) {
  const server = createServer(async (req, res) => {
    const p = decodeURIComponent((req.url ?? '/').split('?')[0]);
    const f = resolve(join(root, p === '/' ? 'index.html' : p));
    if (!f.startsWith(resolve(root))) { res.writeHead(403); res.end(); return; }
    try { const b = await readFile(f); res.writeHead(200, { 'content-type': MIME[extname(f)] ?? 'application/octet-stream' }); res.end(b); } catch { res.writeHead(404); res.end(); }
  });
  await new Promise((r) => server.listen(port, '127.0.0.1', r));
  return { url: `http://127.0.0.1:${port}`, close: () => new Promise((r) => server.close(r)) };
}

const { chromium } = loadPlaywright();
const srv = apk ? await serveStatic(apk) : await startVite(5234);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
await page.goto(`${srv.url}/?qa=1&dpr=1${q ? '&' + q : ''}`);
await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
await page.evaluate(() => document.fonts.ready);

// in-page measurement helpers (installed once)
await page.evaluate(() => {
  const api = window.__rainbow;
  const { scene, camera, renderer, composer } = api.qa3d();
  const RT = composer.renderTarget1.constructor;
  const Color = scene.background.constructor;
  const V3 = camera.position.constructor;
  const KEY = new Color(0, 1, 0);
  const LAYER = 30;
  const named = (o) => { const a = []; let c = o; while (c && c !== scene) { a.push(c.name || (c.isMesh || c.isPoints ? `${c.type}(${c.material?.name || c.material?.type || ''}${c.material?.color ? '#' + c.material.color.getHexString() : ''},${c.geometry?.attributes?.position?.count ?? 0}v)` : c.type)); c = c.parent; } return a.slice(0, 4).join(' < '); };
  let rt = null;
  const grab = (setup, teardown) => {
    const size = renderer.getDrawingBufferSize({ x: 0, y: 0, set(x, y) { this.x = x; this.y = y; return this; }, floor() { this.x = Math.floor(this.x); this.y = Math.floor(this.y); return this; } });
    // full drawing-buffer size: the camclear Benny ellipse is in drawing-buffer pixels
    const w = Math.max(1, Math.round(size.x)), h = Math.max(1, Math.round(size.y));
    if (!rt || rt.width !== w || rt.height !== h) { rt?.dispose(); rt = new RT(w, h); }
    const bg = scene.background, far = camera.far, layers = camera.layers.mask;
    scene.background = KEY;
    setup?.();
    camera.updateProjectionMatrix();
    renderer.setRenderTarget(rt);
    renderer.setClearColor(KEY, 1);
    renderer.clear();
    renderer.render(scene, camera);
    const px = new Uint8Array(w * h * 4);
    renderer.readRenderTargetPixels(rt, 0, 0, w, h, px);
    renderer.setRenderTarget(null);
    scene.background = bg; camera.far = far; camera.layers.mask = layers; camera.updateProjectionMatrix();
    teardown?.();
    return { px, w, h };
  };
  const notKey = (p, i) => Math.max(Math.abs(p[i]), Math.abs(p[i + 1] - 255), Math.abs(p[i + 2])) > 10;
  const cover = (g) => { let n = 0; for (let i = 0; i < g.px.length; i += 4) if (notKey(g.px, i)) n++; return n / (g.w * g.h); };
  const onLayer = (root, on) => root.traverse((o) => { if (on) o.layers.enable(LAYER); else o.layers.disable(LAYER); });
  const nearOf = (root, far) => cover(grab(() => { camera.far = far; camera.layers.set(LAYER); onLayer(root, true); }, () => onLayer(root, false)));
  // attribution candidates: scene children, plus children of the big containers (two levels for the washer world)
  const candidates = () => {
    const list = [];
    for (const c of scene.children) {
      if (!c.visible || c.isLight) continue;
      const kids = c.children.filter((k) => k.visible && !k.isLight);
      if (c.name === 'washer_world' || c.name === 'water_system' || c.name === 'match08_projection') {
        for (const k of kids) {
          const kk = k.children.filter((x) => x.visible);
          if (k.name?.startsWith('zone_') && kk.length) list.push(...kk); else list.push(k);
        }
      } else list.push(c);
    }
    return list;
  };
  window.__cc = {
    measure() {
      const res = {};
      res.near2 = +nearOf(scene, 2.0).toFixed(4);
      res.near05 = +nearOf(scene, 0.5).toFixed(4);
      res.nearBy = [];
      if (res.near2 > 0.002) {
        for (const c of candidates()) {
          const v = nearOf(c, 2.0);
          if (v > 0.002) {
            // drill one level into a container that covers the near zone
            if (c.children.length > 1 && c.children.length < 80 && !c.isMesh) {
              const sub = c.children.filter((x) => x.visible).map((x) => ({ o: x, v: nearOf(x, 2.0) })).filter((e) => e.v > 0.002);
              if (sub.length) { for (const e of sub) res.nearBy.push({ obj: named(e.o), share: +e.v.toFixed(4) }); continue; }
            }
            res.nearBy.push({ obj: named(c), share: +v.toFixed(4) });
          }
        }
        res.nearBy.sort((a, b) => b.share - a.share);
        res.nearBy = res.nearBy.slice(0, 8);
      }
      // Benny occlusion
      const benny = scene.getObjectByName('Benny');
      if (benny && benny.visible) {
        const A = grab(null, null);
        const B = grab(() => { benny.visible = false; }, () => { benny.visible = true; });
        const C = grab(() => { camera.layers.set(LAYER); onLayer(benny, true); }, () => onLayer(benny, false));
        const mask = new Uint8Array(C.w * C.h);
        let m = 0, vis = 0, x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
        for (let y = 0; y < C.h; y++) for (let x = 0; x < C.w; x++) {
          const i = (y * C.w + x) * 4;
          if (!notKey(C.px, i)) continue;
          m++; mask[y * C.w + x] = 1;
          x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y);
          const d = Math.max(Math.abs(A.px[i] - B.px[i]), Math.abs(A.px[i + 1] - B.px[i + 1]), Math.abs(A.px[i + 2] - B.px[i + 2]));
          if (d > 12) vis++;
        }
        // screen box in top-left image coords (render targets are bottom-up)
        res.benny = m ? { maskShare: +(m / (C.w * C.h)).toFixed(4), hidden: +(1 - vis / m).toFixed(3), box: [x0 / C.w, 1 - (y1 + 1) / C.h, (x1 + 1) / C.w, 1 - y0 / C.h].map((v) => +v.toFixed(3)) } : { maskShare: 0, hidden: null, box: null, offscreen: true };
        // everything IN FRONT of Benny (view depth < his depth − 0.9): share of the frame and of his silhouette, per object
        const bc = (benny.children[0] ?? benny).getWorldPosition(new V3());
        const fwd = camera.getWorldDirection(new V3());
        const dB = bc.clone().sub(camera.position).dot(fwd);
        res.benny.depth = +dB.toFixed(2);
        const farFg = Math.max(0.06, dB - 0.9);
        const onMask = (g) => { let n = 0; for (let k = 0; k < mask.length; k++) if (mask[k] && notKey(g.px, k * 4)) n++; return m ? n / m : 0; };
        const F = grab(() => { camera.far = farFg; benny.visible = false; }, () => { benny.visible = true; });
        res.benny.fgFrame = +cover(F).toFixed(4);
        res.benny.fgOnBenny = +onMask(F).toFixed(3);
        res.benny.occluders = [];
        if (res.benny.fgOnBenny > 0.01) {
          const one = (o) => grab(() => { camera.far = farFg; camera.layers.set(LAYER); onLayer(o, true); }, () => onLayer(o, false));
          for (const c of candidates()) {
            if (c === benny) continue;
            const v = onMask(one(c));
            if (v <= 0.01) continue;
            if (c.children.length > 1 && c.children.length < 80 && !c.isMesh) {
              const sub = c.children.filter((x) => x.visible).map((x) => ({ o: x, v: onMask(one(x)) })).filter((e) => e.v > 0.01);
              if (sub.length) { for (const e of sub) res.benny.occluders.push({ obj: named(e.o), onBenny: +e.v.toFixed(3) }); continue; }
            }
            res.benny.occluders.push({ obj: named(c), onBenny: +v.toFixed(3) });
          }
          res.benny.occluders.sort((a, b) => b.onBenny - a.onBenny);
          res.benny.occluders = res.benny.occluders.slice(0, 6);
        }
        // body bottom / centre vs the surface straight below him (first non-Benny mesh hit)
        // measured along Benny's own up axis (= the course up; the plunge is steep, world-vertical would overstate it)
        const U = new V3(0, 1, 0).applyQuaternion(benny.quaternion).normalize();
        let minY = Infinity;
        benny.updateMatrixWorld(true);
        benny.traverse((o) => {
          if (!o.isMesh || !o.visible || !o.geometry?.attributes?.position) return;
          if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
          const bb = o.geometry.boundingBox;
          for (const cx of [bb.min.x, bb.max.x]) for (const cy of [bb.min.y, bb.max.y]) for (const cz of [bb.min.z, bb.max.z]) {
            const p = new V3(cx, cy, cz).applyMatrix4(o.matrixWorld).dot(U); if (p < minY) minY = p;
          }
        });
        res.benny.centreY = +bc.y.toFixed(3);
        res.benny.up = U.toArray().map((v) => +v.toFixed(3));
        res.benny.rootY = +benny.position.y.toFixed(3);
        if (window.__RCctor) {
          const rc = new window.__RCctor();
          rc.set(bc.clone().addScaledVector(U, 3), U.clone().negate());
          rc.far = 8;
          const skip = (o) => { for (let c = o; c; c = c.parent) if (c === benny || c.name === 'm08_splash' || c.name === 'rider_splash' || c.name === 'rider_splash05' || c.name === 'spray' || /coin/i.test(c.name)) return true; return false; };
          const meshes = [];
          scene.traverseVisible((o) => { if (o.isMesh && !o.isInstancedMesh && !skip(o)) meshes.push(o); });
          const h = rc.intersectObjects(meshes, false)[0];
          if (h) { const hs = h.point.dot(U); res.benny.surfaceY = +h.point.y.toFixed(3); res.benny.surfaceObj = named(h.object); res.benny.bottomAboveSurface = +(minY - hs).toFixed(3); res.benny.centreAboveSurface = +(bc.dot(U) - hs).toFixed(3); }
        }
      } else res.benny = { visible: false };
      return res;
    },
  };
});

const probeRays = async () => page.evaluate(() => {
  // raycasts through the game's own probe(): camera-centre ray + the surface below Benny (via projected points)
  const api = window.__rainbow;
  return { centre: api.probe(0, 0).slice(0, 2) };
});

const sample = async (tGame, idx) => {
  const st = await page.evaluate(() => window.__rainbow.state());
  // full frame as the phone shows it (post chain + DOM HUD)
  await page.evaluate(() => window.__rainbow.drawList());
  const f = `${out}/f_${String(idx).padStart(3, '0')}_t${tGame.toFixed(2)}.png`;
  await page.screenshot({ path: f });
  const row = { t: +tGame.toFixed(2), file: f, ...st };
  if (metrics) {
    Object.assign(row, await page.evaluate(() => window.__cc.measure()));
    row.ray = await probeRays();
    row.inside = await page.evaluate(() => {
      // camera-origin rays in 14 directions: first hit within 3 u a back face → camera behind/inside that mesh
      const api = window.__rainbow;
      const { scene, camera } = api.qa3d();
      const V3 = camera.position.constructor;
      const dirs = [];
      for (const x of [-1, 0, 1]) for (const y of [-1, 0, 1]) for (const z of [-1, 0, 1]) if (Math.abs(x) + Math.abs(y) + Math.abs(z) === 1 || Math.abs(x) + Math.abs(y) + Math.abs(z) === 3) dirs.push(new V3(x, y, z).normalize());
      const RC = window.__RCctor;
      if (!RC) return null;
      const rc = new RC();
      rc.far = 3;
      const res = [];
      const meshes = [];
      scene.traverseVisible((o) => { if (o.isMesh && !o.isSkinnedMesh && o.name !== 'm08_splash' && !(o.material?.transparent && o.material?.opacity < 0.3)) meshes.push(o); });
      for (const d of dirs) {
        rc.set(camera.position, d);
        const hits = rc.intersectObjects(meshes, false);
        const h = hits[0];
        if (!h || !h.face) continue;
        const n = h.face.normal.clone().transformDirection(h.object.matrixWorld);
        const side = h.object.material?.side ?? 0;
        if (n.dot(d) > 0.05 && side === 0) {
          let c = h.object, nm = []; while (c && c !== scene) { nm.push(c.name || c.type); c = c.parent; }
          res.push({ dir: d.toArray().map((v) => +v.toFixed(2)), d: +h.distance.toFixed(2), obj: nm.slice(0, 4).join(' < ') });
        }
      }
      return res;
    });
  }
  return row;
};

// Raycaster constructor: the game's probe() builds one; capture it by wrapping intersectObjects once
await page.evaluate(() => {
  const api = window.__rainbow;
  const { scene } = api.qa3d();
  // probe() → rc.intersectObjects(scene.children) → each object's raycast(raycaster, …): grab raycaster.constructor
  let found = null;
  scene.traverse((o) => { if (!found && o.isMesh && !o.isInstancedMesh && !o.isSkinnedMesh) found = o; });
  const mproto = Object.getPrototypeOf(found);
  const prev = mproto.raycast;
  mproto.raycast = function (raycaster, inter) { window.__RCctor = raycaster.constructor; return prev.call(this, raycaster, inter); };
  api.probe(0, 0);
  mproto.raycast = prev;
});

const rows = [];
let tNow = 0;
const sched = times ?? (() => { const a = []; for (let t = t0; t <= t1 + 1e-6; t += dt) a.push(+t.toFixed(3)); return a; })();
if (steer !== null) await page.evaluate((v) => window.__rainbow.setSteer(v), steer);
let idx = 0;
const steerAt = (t) => { let v = null; for (const [a, b] of steerPlan ?? []) if (t >= a) v = b; return v; };
for (const tg of sched) {
  const n = Math.round((tg - tNow) * 60);
  if (steerPlan) {
    // step frame by frame so the steering plan switches at its own times
    const plan = Array.from({ length: n }, (_, i) => steerAt(tNow + i / 60));
    await page.evaluate((plan) => { for (const v of plan) { window.__rainbow.setSteer(v); window.__rainbow.step(1, 1 / 60); } }, plan);
  } else if (n > 0) await page.evaluate((n) => window.__rainbow.step(n, 1 / 60), n);
  tNow += n / 60;
  const r = await sample(tNow, idx++);
  rows.push(r);
  console.log(JSON.stringify({ t: r.t, mode: r.mode, stage: r.stage, s: r.s, near2: r.near2, near05: r.near05, top: r.nearBy?.[0], bennyHidden: r.benny?.hidden, inside: r.inside?.length }));
}
writeFileSync(`${out}/probe.json`, JSON.stringify({ q, apk: apk || null, size: [W, H], steer, steerPlan, patched: await page.evaluate(() => window.__rainbow.camClear?.() ?? null), rows, errors }, null, 1));
await browser.close();
await srv.close();
if (errors.length) console.error('page errors', errors.slice(0, 5));
