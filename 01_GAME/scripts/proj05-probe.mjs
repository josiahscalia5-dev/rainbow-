#!/usr/bin/env node
// Screen 05 texture-projection probe (Specialist 1, 2026-11-16) — exact, read-only measurements of the REAL game.
//   node scripts/proj05-probe.mjs [--q='switches'] [--out=qa/pilot05/proj/probe] [--raw=DIR for the float maps]
// Opens the game at the locked 05 checkpoint (time frozen, as scripts/capture.mjs) and writes into OUT:
//   camera.json      the live render camera (world matrix, projection matrix, vFOV, size) + uTime + stage numbers
//   uv_river.f32     864×1536×4 float32 (top row first): per pixel the river surface the camera sees when ONLY the
//                    river (+ the far tunnel wall as occluder) is drawn — ribbon: (u, s, 1 + skirt, 1);
//                    far block: (uv.x across the floor chord, Z virtual depth, 3, lateral units); else 0
//   uv_scene.f32     the same, but every other static object of the scene (walls, rings, lids, far wall, glow)
//                    occludes — Benny, coins, bubbles, foam, splash and spray hidden (not part of the water layer)
//   uv_foam.f32      only the game's 3D foam (berm / rafts / rim / flank) drawn as id 4 over the scene depth
//   river05_mesh.json  the river meshes exactly as rendered at this frame: ribbon rows in the 05 window with the
//                    vertex-shader wave displacement applied at the frozen uTime, the far block with its morph
//                    state — for the Blender projection bake (tools/blender/proj05_bake.py)
// Uses window.__rainbow.qa3d() (QA accessor; rendering is unchanged). Nothing in the game is modified.
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const OUT = typeof opt.out === 'string' ? opt.out : 'qa/pilot05/proj/probe';
const RAW = typeof opt.raw === 'string' ? opt.raw : OUT;   // the three 21 MB float maps (keep them out of git: --raw=scratch dir)
const Q = typeof opt.q === 'string' ? opt.q : '';
mkdirSync(OUT, { recursive: true });
mkdirSync(RAW, { recursive: true });
const W = 864, H = 1536;

const { chromium } = loadPlaywright();
const vite = await startVite(5231);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('console', m.text()); });
  await page.goto(`${vite.url}/?qa=1&dpr=1&hide=benny,coins&waterhide=crown,spray,bubbles,splash05,splashCrown${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const meta = await page.evaluate(async () => {
    const R = window.__rainbow;
    R.goto('05');
    const { scene, camera, renderer, composer } = R.qa3d();
    const ribbon = scene.getObjectByName('water_ribbon');
    const far = scene.getObjectByName('tube05_far_river');
    const farWall = scene.getObjectByName('tube05_far_wall');
    const apron = scene.getObjectByName('proj05_apron');   // ?proj05=1: visual-only bank strip (id 5: t·side, s)
    // the game's own THREE classes, taken from live objects (no second three.js instance)
    const T3 = { FloatType: 1015, RGBAFormat: 1023, DoubleSide: 2 };
    const RT = composer.renderTarget1.constructor, SM = ribbon.material.constructor, MBM = far.material.constructor;
    const rt = new RT(innerWidth, innerHeight, { type: T3.FloatType, format: T3.RGBAFormat, depthBuffer: true });
    const ribMat = new SM({
      vertexShader: ribbon.material.vertexShader,
      fragmentShader: 'varying vec2 vUV; varying float vSkirt; void main(){ gl_FragColor = vec4(vUV.x, vUV.y, 1.0 + vSkirt, 1.0); }',
      uniforms: ribbon.material.uniforms,
      defines: { ...ribbon.material.defines },
      side: T3.DoubleSide,
    });
    const farMat = new MBM({ color: 0xffffff, fog: false });
    farMat.polygonOffset = true; farMat.polygonOffsetFactor = -1; farMat.polygonOffsetUnits = -2;
    farMat.onBeforeCompile = (sh) => {
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute float aRivLat; attribute vec4 aRivB; varying vec2 vPUv; varying float vPLat; varying float vPZ;')
        .replace('#include <uv_vertex>', '#include <uv_vertex>\nvPUv = uv; vPLat = aRivLat; vPZ = aRivB.w;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vPUv; varying float vPLat; varying float vPZ;')
        .replace('#include <dithering_fragment>', 'gl_FragColor = vec4(vPUv.x, vPZ, 3.0, vPLat);');
    };
    const apronMat = apron ? new SM({ vertexShader: apron.material.vertexShader, fragmentShader: 'varying vec2 vPj; void main(){ gl_FragColor = vec4(vPj.x, vPj.y, 5.0, 1.0); }', side: T3.DoubleSide }) : null;
    const foamMat = new MBM({ color: 0xffffff, fog: false });
    foamMat.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>', 'gl_FragColor = vec4(0.0, 0.0, 4.0, 1.0);'); };
    const foamNames = new Set();
    // every renderable
    const all = [];
    scene.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine || o.isSprite) all.push(o); });
    const saved = all.map((o) => ({ o, vis: o.visible, mat: o.material }));
    const isFoam = (o) => { let c = o; while (c) { if (c.name && /foam/i.test(c.name)) return true; c = c.parent; } return false; };
    const bg = scene.background;
    scene.background = null;
    const read = () => {
      const buf = new Float32Array(rt.width * rt.height * 4);
      renderer.readRenderTargetPixels(rt, 0, 0, rt.width, rt.height, buf);
      return buf;
    };
    const writeOff = (m) => {
      const one = (x) => { if (!x) return x; const c = x.clone(); c.colorWrite = false; if (x.onBeforeCompile) c.onBeforeCompile = x.onBeforeCompile; if (x.customProgramCacheKey) c.customProgramCacheKey = x.customProgramCacheKey; return c; };
      return Array.isArray(m) ? m.map(one) : one(m);
    };
    let envRoot = farWall;
    while (envRoot.parent && envRoot.parent !== scene) envRoot = envRoot.parent;
    const underEnv = (o) => { if (o === apron) return false; let c = o; while (c) { if (c === envRoot) return true; c = c.parent; } return false; };
    for (const s of saved) { if (isFoam(s.o)) foamNames.add(s.o.name || s.o.type); }
    /** two draws into one target: (1) occluders depth-only (their own vertex shaders, colour writes off), (2) writers
     *  with their id material, depth-tested against (1) — so a river pixel survives only where it is the first hit */
    const pass = (occ, writer) => {
      renderer.setRenderTarget(rt);
      renderer.setClearColor(0x000000, 0);
      renderer.clear(true, true, true);
      const ac = renderer.autoClear;
      renderer.autoClear = false;
      for (const s of saved) { const on = s.vis && occ(s.o); s.o.visible = on; if (on) { s.depthOnly ??= writeOff(s.mat); s.o.material = s.depthOnly; } }
      renderer.render(scene, camera);
      for (const s of saved) { const m = s.vis ? writer(s.o) : null; s.o.visible = !!m; if (m) s.o.material = m; }
      renderer.render(scene, camera);
      renderer.autoClear = ac;
      renderer.setRenderTarget(null);
      return read();
    };
    const riverId = (o) => (o === ribbon ? ribMat : o === far ? farMat : apron && o === apron ? apronMat : null);
    // A: the river surfaces alone (the far tunnel wall occludes, as it hides the ribbon's continuation behind the seam)
    const A = pass((o) => o === farWall, riverId);
    // B: the whole static environment occludes (walls, rings, lids, far wall, glow); Benny, coins, the girl and every
    // other water part (foam, bubbles, splash, spray) are left out — they are not part of the isolated water layer
    const B = pass((o) => underEnv(o), riverId);
    // F: the game's 3D foam (id 4) where it is the first hit in front of the environment and the river surfaces
    const F = pass((o) => underEnv(o) || o === ribbon || o === far, (o) => (isFoam(o) ? foamMat : null));
    // restore
    for (const s of saved) { s.o.visible = s.vis; s.o.material = s.mat; }
    scene.background = bg;
    window.__probe = { A, B, F };
    // ---- river meshes exactly as rendered (for Blender)
    const c = R.course, st = c.stage('05'), st6 = c.stage('06');
    const uTime = ribbon.material.uniforms.uTime.value;
    const g = ribbon.geometry;
    const P = g.attributes.position.array, N = g.attributes.normal.array, UV = g.attributes.aUV.array, SK = g.attributes.aSkirt.array, AM = g.attributes.aAmp.array;
    const per = 21; // high quality: 19 surface columns + 2 skirts
    const nRows = P.length / 3 / per;
    const sA = st.s0 - 8, sB = st6.s0 + 14;
    const rows = [];
    for (let i = 0; i < nRows; i++) {
      const s = UV[(i * per) * 2 + 1];
      if (s < sA || s > sB) continue;
      const row = [];
      for (let j = 0; j < per; j++) {
        const k = i * per + j;
        const u = UV[k * 2];
        const h = AM[k] * (0.6 * Math.sin(s * 0.9 - uTime * 2.4 + u * 1.7) + 0.4 * Math.sin(s * 0.41 + uTime * 1.5 - u * 2.3)) * (1 - SK[k]);
        row.push([P[k * 3] + N[k * 3] * h, P[k * 3 + 1] + N[k * 3 + 1] * h, P[k * 3 + 2] + N[k * 3 + 2] * h, u, s, SK[k]]);
      }
      rows.push(row);
    }
    const fg = far.geometry;
    const inf = far.morphTargetInfluences?.[0] ?? 0;
    const fp = fg.attributes.position.array, fm = fg.morphAttributes.position[0].array;
    const fpos = [];
    for (let k = 0; k < fp.length; k++) fpos.push(fp[k] + (fm[k] - fp[k]) * inf);
    camera.updateMatrixWorld();
    return {
      w: rt.width, h: rt.height, uTime, foamNames: [...foamNames],
      camera: { matrixWorld: camera.matrixWorld.toArray(), projection: camera.projectionMatrix.toArray(), fov: camera.fov, aspect: camera.aspect, near: camera.near, far: camera.far, position: camera.position.toArray() },
      stage05: { s0: st.s0, s1: st.s1, crest: c.marks['05_crest'] }, stage06: { s0: st6.s0 },
      ribbon: { per, rows },
      far: { morphInfluence: inf, position: fpos, uv: Array.from(fg.attributes.uv.array), lat: Array.from(fg.attributes.aRivLat.array), A: Array.from(fg.attributes.aRivA.array), B: Array.from(fg.attributes.aRivB.array), index: Array.from(fg.index.array) },
      state: R.state(),
    };
  });
  const { w, h } = meta;
  const fetch = async (key) => {
    const out = Buffer.alloc(w * h * 16);
    const step = 192;
    for (let y0 = 0; y0 < h; y0 += step) {
      const n = Math.min(step, h - y0);
      const b64 = await page.evaluate(([key, y0, n, w]) => {
        const a = window.__probe[key];
        const u8 = new Uint8Array(a.buffer, y0 * w * 16, n * w * 16);
        let s = '';
        for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
        return btoa(s);
      }, [key, y0, n, w]);
      Buffer.from(b64, 'base64').copy(out, y0 * w * 16);
    }
    // GL rows are bottom-up: flip to top-down
    const flip = Buffer.alloc(out.length);
    for (let y = 0; y < h; y++) out.copy(flip, y * w * 16, (h - 1 - y) * w * 16, (h - y) * w * 16);
    return flip;
  };
  writeFileSync(`${RAW}/uv_river.f32`, await fetch('A'));
  writeFileSync(`${RAW}/uv_scene.f32`, await fetch('B'));
  writeFileSync(`${RAW}/uv_foam.f32`, await fetch('F'));
  const { ribbon, far, ...cam } = meta;
  writeFileSync(`${OUT}/camera.json`, JSON.stringify({ ...cam, query: Q }, null, 1));
  writeFileSync(`${OUT}/river05_mesh.json`, JSON.stringify({ uTime: meta.uTime, camera: meta.camera, stage05: meta.stage05, ribbon, far }));
  console.log('probe →', OUT, JSON.stringify({ w, h, uTime: meta.uTime, ribbonRows: ribbon.rows.length, farVerts: far.position.length / 3, farMorph: far.morphInfluence, foam: meta.foamNames, state: meta.state }));
  await page.close();
} finally {
  await browser.close();
  await vite.close();
}
