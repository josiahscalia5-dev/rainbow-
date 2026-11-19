#!/usr/bin/env node
// Screen 05 tunnel probe (walls + gold rings bake, `?projwall05=1` / `?projring05=1`) — exact, read-only
// measurements of the REAL game at the locked 05 checkpoint (time frozen, as scripts/capture.mjs).
//   node scripts/proj05-tunnel-probe.mjs [--q='switches'] [--out=qa/pilot05/proj/tunnel/probe] [--raw=DIR] [--all]
// Writes into OUT:
//   tunnel.json     camera (world + projection matrix), the 05 tunnel numbers (checkpoint eye s, ring positions, far
//                   block knots / virtual depths, band widths) and the list of probed meshes
// and into RAW (21 MB each, keep them out of git):
//   tunnel_id.f32   864×1536×4 float32, top row first. Per pixel, the first surface the camera sees:
//                     real 05 wall   (uv.x round the tube, uv.y = s,            1, 10)
//                     far wall       (uv.x,                uv.y = sF + u,       2, 10)
//                     real ring      (phi object space,    z across the band,   3, 20 + instance)
//                     far ring       (phi,                 z,                   4, 20 + instance)
//                     real lid / far lid (object x, y, 5 / 6, 40 + instance); anything else: its own colour, alpha ≤ 1
//                   Benny, coins, bubbles, foam, splash and spray are hidden unless --all is given (then they occlude,
//                   and pixels blended with something transparent no longer carry an exact alpha → not usable).
//   tunnel_coords.f32  (--coords, with --q='projwall05=1&projring05=1'): the same frame, but the tunnel shaders write the
//                   baked-texture coordinates they sample: wall (u, v in wall05.png, 7, 77), ring (u, v in ring05.png, 8, 78)
// Uses window.__rainbow.qa3d() (QA accessor; rendering is unchanged). Nothing in the game is modified.
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const OUT = typeof opt.out === 'string' ? opt.out : 'qa/pilot05/proj/tunnel/probe';
const RAW = typeof opt.raw === 'string' ? opt.raw : OUT;
const Q = typeof opt.q === 'string' ? opt.q : '';
const ALL = !!opt.all;
const COORDS = !!opt.coords;   // with ?projwall05=1 / ?projring05=1: the baked-texture coordinates the shaders use (tunnel_coords.f32)
mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });
const W = 864, H = 1536;

const { chromium } = loadPlaywright();
const vite = await startVite(5233);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('console', m.text()); });
  const hide = ALL ? '' : '&hide=benny,coins&waterhide=crown,spray,bubbles,splash05,splashCrown,foamRim05,foamFlank,foamRafts';
  await page.goto(`${vite.url}/?qa=1&dpr=1${hide}${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const meta = await page.evaluate(async (COORDS) => {
    const R = window.__rainbow;
    R.goto('05');
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    const { scene, camera, renderer, composer } = R.qa3d();
    const far = scene.getObjectByName('tube05_far_river');
    const MBM = far.material.constructor;
    const RT = composer.renderTarget1.constructor;
    const rt = new RT(innerWidth, innerHeight, { type: 1015 /* FloatType */, format: 1023 /* RGBA */, depthBuffer: true });
    const idMat = (expr, tag) => {
      const m = new MBM({ color: 0xffffff, fog: false });
      m.side = 2;
      m.onBeforeCompile = (sh) => {
        sh.vertexShader = sh.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec2 vPUv; varying vec3 vPPos; varying float vPInst;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvPUv = uv; vPPos = position;\n#ifdef USE_INSTANCING\nvPInst = float(gl_InstanceID);\n#else\nvPInst = 0.0;\n#endif');
        sh.fragmentShader = sh.fragmentShader
          .replace('#include <common>', '#include <common>\nvarying vec2 vPUv; varying vec3 vPPos; varying float vPInst;')
          .replace('#include <dithering_fragment>', `gl_FragColor = ${expr};`);
      };
      m.customProgramCacheKey = () => 'tunnel-probe-' + tag;
      return m;
    };
    const mats = {
      wall: idMat('vec4(vPUv.x, vPUv.y, 1.0, 10.0)', 'wall'),
      farWall: idMat('vec4(vPUv.x, vPUv.y, 2.0, 10.0)', 'farwall'),
      ring: idMat('vec4(atan(vPPos.y, vPPos.x), vPPos.z, 3.0, 20.0 + floor(vPInst + 0.5))', 'ring'),
      farRing: idMat('vec4(atan(vPPos.y, vPPos.x), vPPos.z, 4.0, 20.0 + floor(vPInst + 0.5))', 'farring'),
      lid: idMat('vec4(vPPos.x, vPPos.y, 5.0, 40.0 + floor(vPInst + 0.5))', 'lid'),
      farLid: idMat('vec4(vPPos.x, vPPos.y, 6.0, 40.0 + floor(vPInst + 0.5))', 'farlid'),
    };
    const keyOf = (o) => { try { return typeof o.material?.customProgramCacheKey === 'function' ? o.material.customProgramCacheKey() : ''; } catch { return ''; } };
    const classify = (o) => {
      const k = keyOf(o);
      if (/strips-attribute-wall05v/.test(k)) return 'farWall';
      if (/strips-attribute-wall05/.test(k)) return 'wall';
      if (/band-ring05v/.test(k)) return 'farRing';
      if (/band-ring05/.test(k)) return 'ring';
      if (/lid-lid05v/.test(k)) return 'farLid';
      if (/lid-lid05/.test(k)) return 'lid';
      return null;
    };
    const all = [];
    scene.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine || o.isSprite) all.push(o); });
    const saved = all.map((o) => ({ o, mat: o.material, cls: classify(o) }));
    const probed = {};
    // --coords: no material is replaced; the projwall05 / projring05 shaders themselves write (texture u, v, 7 | 8, 77 | 78)
    const ptShared = COORDS ? (await import('/src/vfx/proj05Tunnel.ts')).proj05TunnelShared : null;
    if (ptShared) ptShared.uPtDbg.value = 1;
    else for (const s of saved) if (s.cls) { s.o.material = mats[s.cls]; probed[s.cls] = (probed[s.cls] ?? 0) + 1; }
    const bg = scene.background;
    scene.background = null;
    renderer.setRenderTarget(rt);
    renderer.setClearColor(0x000000, 0);
    renderer.clear(true, true, true);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    const buf = new Float32Array(rt.width * rt.height * 4);
    renderer.readRenderTargetPixels(rt, 0, 0, rt.width, rt.height, buf);
    for (const s of saved) s.o.material = s.mat;
    if (ptShared) ptShared.uPtDbg.value = 0;
    scene.background = bg;
    window.__probe = buf;
    // ring instances: world matrices of the real rings (centre, radius, axial position along the tube)
    const ringMesh = saved.find((s) => s.cls === 'ring')?.o;
    const farRingMesh = saved.find((s) => s.cls === 'farRing')?.o;
    const inst = (mesh) => { if (!mesh) return []; mesh.updateMatrixWorld(); const out = []; for (let i = 0; i < mesh.count; i++) out.push(Array.from(mesh.instanceMatrix.array.slice(i * 16, i * 16 + 16))); return out; };
    const dbg = (await import('/src/world/far05.ts')).far05Debug;
    const cam = (await import('/src/game/cameraRig.ts')).STAGE_CAM;
    camera.updateMatrixWorld();
    const c = R.course;
    return {
      w: rt.width, h: rt.height, probed,
      camera: { matrixWorld: camera.matrixWorld.toArray(), projection: camera.projectionMatrix.toArray(), fov: camera.fov, aspect: camera.aspect, position: camera.position.toArray() },
      stage05: { s0: c.stage('05').s0, s1: c.stage('05').s1, crest: c.marks['05_crest'] }, stage06: { s0: c.stage('06').s0 },
      stageCam05: cam['05'],
      tunnel: {
        sCam05: dbg.sCam05, s05: dbg.s05, sGlow05: dbg.sGlow05, sF05: dbg.sF05, bay05: dbg.bay05, rings05: dbg.rings05, ringDv: dbg.ringDv, knots: dbg.knots,
        realSeamRing: dbg.realSeamRing, D0: dbg.ft?.D0, L: dbg.ft?.L, zEnd: dbg.ft?.zEnd, R: dbg.ft?.R, band05: dbg.band05, band05near: dbg.band05near, eye: dbg.eye?.toArray?.(),
      },
      ringInstances: inst(ringMesh), farRingInstances: inst(farRingMesh),
      state: R.state(),
    };
  }, COORDS);
  const b64 = await page.evaluate(() => {
    const u8 = new Uint8Array(window.__probe.buffer);
    let s = '';
    for (let i = 0; i < u8.length; i += 32768) s += String.fromCharCode.apply(null, u8.subarray(i, i + 32768));
    return btoa(s);
  });
  // WebGL reads bottom row first → flip to top row first
  const raw = Buffer.from(b64, 'base64');
  const rowB = W * 4 * 4;
  const flipped = Buffer.alloc(raw.length);
  for (let y = 0; y < H; y++) raw.copy(flipped, y * rowB, (H - 1 - y) * rowB, (H - y) * rowB);
  const tag = `${COORDS ? 'coords' : 'id'}${ALL ? '_all' : ''}`;
  writeFileSync(`${RAW}/tunnel_${tag}.f32`, flipped);
  if (!COORDS) writeFileSync(`${OUT}/tunnel${ALL ? '_all' : ''}.json`, JSON.stringify({ ...meta, q: Q, all: ALL }, null, 1));
  console.log('probed', JSON.stringify(meta.probed), 'tunnel', JSON.stringify(meta.tunnel));
} finally {
  await browser.close();
  await vite.close();
}
