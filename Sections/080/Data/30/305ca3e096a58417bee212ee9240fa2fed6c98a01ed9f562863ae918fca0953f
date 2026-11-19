#!/usr/bin/env node
// Screen 05 RIDE probe (2026-11-16, `?projnear05` work) — read-only: which river coordinates (u across −1..1, s along)
// each screen pixel shows while Benny rides forward from the locked 05 checkpoint with the REAL simulation, and how
// many screen pixels one world unit of river covers there (the texel density a water texture needs to stay sharp).
//   node scripts/proj05-ride-probe.mjs [--q='switches'] --out=DIR [--d=0,8,17,35]
// DIR/ride_<d>.f32: 864×1536×4 float32 (top row first): (u, s, 1 if river ribbon else 0, 0); DIR/ride_probe.json.
// Same method as scripts/proj05-probe.mjs (pass B): the static environment occludes depth-only, the ribbon writes its
// own (u, s); Benny, coins, foam, bubbles, splash hidden. Nothing in the game is modified.
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const OUT = typeof opt.out === 'string' ? opt.out : 'qa/pilot05/proj/near/probe';
const Q = typeof opt.q === 'string' ? opt.q : '';
const D = typeof opt.d === 'string' ? opt.d.split(',').map(Number) : [0, 8, 17, 35];
mkdirSync(OUT, { recursive: true });
const W = 864, H = 1536;
const { chromium } = loadPlaywright();
const vite = await startVite(5233);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = { q: Q, frames: [] };
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1&hide=benny,coins&waterhide=crown,spray,bubbles,splash05,splashCrown${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  await page.evaluate(() => window.__rainbow.goto('05'));
  const s0 = (await page.evaluate(() => window.__rainbow.state())).s;
  for (const d of D) {
    await page.evaluate(([target]) => { const R = window.__rainbow; let k = 0; while (R.state().s < target && k++ < 20000) R.step(1, 1 / 60); }, [s0 + d]);
    await page.evaluate(() => window.__rainbow.drawList());
    const st = await page.evaluate(() => {
      const R = window.__rainbow;
      const { scene, camera, renderer } = R.qa3d();
      const ribbon = scene.getObjectByName('water_ribbon');
      const farWall = scene.getObjectByName('tube05_far_wall');
      const T3 = { FloatType: 1015, RGBAFormat: 1023, DoubleSide: 2 };
      const RT = renderer.getRenderTarget()?.constructor ?? R.qa3d().composer.renderTarget1.constructor;
      const rt = new RT(innerWidth, innerHeight, { type: T3.FloatType, format: T3.RGBAFormat, depthBuffer: true });
      const SM = ribbon.material.constructor;
      const ribMat = new SM({ vertexShader: ribbon.material.vertexShader, uniforms: ribbon.material.uniforms, defines: { ...ribbon.material.defines }, side: T3.DoubleSide,
        fragmentShader: 'varying vec2 vUV; varying float vSkirt; void main(){ gl_FragColor = vec4(vUV.x, vUV.y, 1.0 - vSkirt, 0.0); }' });
      const all = []; scene.traverse((o) => { if (o.isMesh || o.isPoints || o.isLine || o.isSprite) all.push(o); });
      const saved = all.map((o) => ({ o, vis: o.visible, mat: o.material }));
      let envRoot = farWall; while (envRoot.parent && envRoot.parent !== scene) envRoot = envRoot.parent;
      const underEnv = (o) => { let c = o; while (c) { if (c === envRoot) return true; c = c.parent; } return false; };
      const off = (m) => { const one = (x) => { if (!x) return x; const c = x.clone(); c.colorWrite = false; if (x.onBeforeCompile) c.onBeforeCompile = x.onBeforeCompile; if (x.customProgramCacheKey) c.customProgramCacheKey = x.customProgramCacheKey; return c; }; return Array.isArray(m) ? m.map(one) : one(m); };
      const bg = scene.background; scene.background = null;
      renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(true, true, true);
      const ac = renderer.autoClear; renderer.autoClear = false;
      for (const s of saved) { const on = s.vis && underEnv(s.o) && s.o !== ribbon; s.o.visible = on; if (on) s.o.material = off(s.mat); }
      renderer.render(scene, camera);
      for (const s of saved) { const on = s.vis && s.o === ribbon; s.o.visible = on; if (on) s.o.material = ribMat; }
      renderer.render(scene, camera);
      renderer.autoClear = ac; renderer.setRenderTarget(null);
      const buf = new Float32Array(rt.width * rt.height * 4);
      renderer.readRenderTargetPixels(rt, 0, 0, rt.width, rt.height, buf);
      for (const s of saved) { s.o.visible = s.vis; s.o.material = s.mat; }
      scene.background = bg; rt.dispose();
      window.__ride = buf;
      return { ...R.state(), w: rt.width, h: rt.height };
    });
    const b64 = await page.evaluate(() => {
      const u8 = new Uint8Array(window.__ride.buffer); let s = '';
      for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
      return btoa(s);
    });
    // flip to top row first
    const f = new Float32Array(Buffer.from(b64, 'base64').buffer.slice(0));
    const out = new Float32Array(f.length);
    for (let y = 0; y < H; y++) out.set(f.subarray((H - 1 - y) * W * 4, (H - y) * W * 4), y * W * 4);
    const file = `${OUT}/ride_${String(d).padStart(2, '0')}.f32`;
    writeFileSync(file, Buffer.from(out.buffer));
    log.frames.push({ d, file, s: st.s, cam: st.cam, lat: st.lat });
    console.log('ride probe', d, st.s);
  }
  writeFileSync(`${OUT}/ride_probe.json`, JSON.stringify(log, null, 1));
} finally {
  await browser.close();
  await vite.close();
}
