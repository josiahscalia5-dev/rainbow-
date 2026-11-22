#!/usr/bin/env node
// Any screen (`?matchNN=1` generic projector, src/vfx/matchProj.ts): read-only probe of the REAL game at the screen's
// locked checkpoint, with its match switch on (so the matched camera framing is used).
//   node scripts/match-probe.mjs --id=07 [--q='match07=1'] [--out=qa/match/07/probe]
// Writes OUT/camera.json (view, projection, view-projection, eye, size), OUT/depth.f32 (W×H float32, top row first:
// the view depth (clip w) of the first STATIC surface per pixel, 0 = nothing; Benny, coins, particles hidden),
// OUT/dyn_mask.png (white where the game draws Benny or a coin at the checkpoint) and OUT/objects.json (what is in
// the scene: name, type, parent chain, visible) so a screen can decide what receives the projection.
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const ID = String(opt.id ?? '07');
const Q = typeof opt.q === 'string' ? opt.q : `match${ID}=1`;
const OUT = typeof opt.out === 'string' ? opt.out : `qa/match/${ID}/probe`;
const W = ID === '03' ? 727 : 864, H = 1536;
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5255);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const meta = await page.evaluate(async (id) => {
    const R = window.__rainbow;
    R.goto(id);
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const { scene, camera, renderer, composer } = R.qa3d();
    const THREE = await import('/node_modules/.vite/deps/three.js');
    camera.updateMatrixWorld();
    const objs = [];
    const chain = (o) => { const c = []; let p = o; while (p) { c.push(p.name || p.type); p = p.parent; } return c.slice(0, 5).join('<'); };
    scene.traverse((o) => { if (o.isMesh || o.isPoints || o.isSprite || o.isLine) objs.push({ name: o.name, type: o.type, chain: chain(o), visible: o.visible, count: o.count ?? null, mat: o.material?.type ?? null }); });
    // dynamic = Benny (named root chain contains 'benny'), coins (chain contains 'coin'), points / sprites / lines
    const isDyn = (o) => { const c = chain(o).toLowerCase(); return o.isPoints || o.isSprite || o.isLine || /benny|coin|bubble|spray|splash|particle|sparkle/.test(c); };
    const all = []; scene.traverse((o) => { if (o.isMesh || o.isPoints || o.isSprite || o.isLine) all.push(o); });
    const saved = all.map((o) => ({ o, mat: o.material, vis: o.visible }));
    const RT = composer.renderTarget1.constructor;
    const rt = new RT(innerWidth, innerHeight, { type: THREE.FloatType, format: THREE.RGBAFormat, depthBuffer: true });
    const depthMat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    depthMat.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>', 'gl_FragColor = vec4(1.0 / gl_FragCoord.w, 0.0, 0.0, 1.0);'); };
    depthMat.customProgramCacheKey = () => 'match-probe-depth';
    const white = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    white.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>', 'gl_FragColor = vec4(1.0);'); };
    white.customProgramCacheKey = () => 'match-probe-white';
    const bg = scene.background;
    scene.background = null;
    const pass = (dynWanted) => {
      for (const s of saved) {
        const dyn = isDyn(s.o);
        s.o.visible = s.vis && (dynWanted ? dyn && s.o.isMesh : !dyn && s.o.isMesh);
        if (s.o.visible) s.o.material = dynWanted ? white : depthMat;
      }
      renderer.setRenderTarget(rt);
      renderer.setClearColor(0x000000, 0);
      renderer.clear(true, true, true);
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      const buf = new Float32Array(rt.width * rt.height * 4);
      renderer.readRenderTargetPixels(rt, 0, 0, rt.width, rt.height, buf);
      const one = new Float32Array(rt.width * rt.height);
      for (let i = 0; i < one.length; i++) one[i] = buf[i * 4];
      return one;
    };
    window.__probeDepth = pass(false);
    window.__probeDyn = pass(true);
    for (const s of saved) { s.o.material = s.mat; s.o.visible = s.vis; }
    scene.background = bg;
    const vp = new THREE.Matrix4().multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    return {
      id, size: [rt.width, rt.height], fov: camera.fov, aspect: camera.aspect, near: camera.near, far: camera.far,
      eye: new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld).toArray(),
      view: camera.matrixWorldInverse.toArray(), projection: camera.projectionMatrix.toArray(), viewProjection: vp.toArray(),
      state: R.state(), objects: objs,
    };
  }, ID);
  const get = async (name) => {
    const b64 = await page.evaluate((n) => {
      const u8 = new Uint8Array(window[n].buffer);
      let s = '';
      for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
      return btoa(s);
    }, name);
    const raw = Buffer.from(b64, 'base64');
    const rowB = W * 4, out = Buffer.alloc(raw.length);
    for (let y = 0; y < H; y++) raw.copy(out, y * rowB, (H - 1 - y) * rowB, (H - y) * rowB);   // GL bottom row first -> top first
    return out;
  };
  writeFileSync(`${OUT}/depth.f32`, await get('__probeDepth'));
  const dyn = await get('__probeDyn');
  // dyn mask as PGM (no extra deps): 255 where a dynamic object was drawn
  const f = new Float32Array(dyn.buffer, dyn.byteOffset, dyn.length / 4);
  const pgm = Buffer.alloc(W * H);
  for (let i = 0; i < W * H; i++) pgm[i] = f[i] > 0.5 ? 255 : 0;
  writeFileSync(`${OUT}/dyn_mask.pgm`, Buffer.concat([Buffer.from(`P5 ${W} ${H} 255\n`), pgm]));
  const { objects, ...cam } = meta;
  writeFileSync(`${OUT}/camera.json`, JSON.stringify(cam, null, 1));
  writeFileSync(`${OUT}/objects.json`, JSON.stringify(objects, null, 1));
  console.log('probe', ID, 'size', cam.size, 'eye', cam.eye.map((x) => x.toFixed(2)).join(','), 'objects', objects.length);
} finally {
  await browser.close();
  await vite.close();
}
