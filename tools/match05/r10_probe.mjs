// Screen 05 round 10: which 3D objects lie under given screen pixels at a RIDING audit position (same stepping as
// r8_shots.mjs / the lead's motion_audit), optionally hiding objects by name before a screenshot (diagnostics only).
//   node tools/match05/r10_probe.mjs <shot> "<query>" [--px=x,y ...] [--hide=name ...] [--shot=out.png] [--list] [--port=5295]
// Read-only: the game is not changed (hidden objects only in this page).
import { pathToFileURL } from 'node:url';
import { realpathSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const args = process.argv.slice(2);
const pos = args.filter((a) => !a.startsWith('--'));
const [SHOT = 't66_through_screen', Q = ''] = pos;
const pxs = args.filter((a) => a.startsWith('--px=')).map((a) => a.slice(5).split(',').map(Number));
const hide = args.filter((a) => a.startsWith('--hide=')).map((a) => a.slice(7));
const shot = (args.find((a) => a.startsWith('--shot=')) ?? '').slice(7);
const list = args.includes('--list');
const PORT = Number((args.find((a) => a.startsWith('--port=')) ?? '--port=5295').slice(7));
const ALL = {
  a00_approved_view: [0, null], f03_forward3u: [3, null], f06_forward6u: [6, null], f10_forward10u: [10, null], f20_forward20u: [20, null],
  s_left_steer: [6, -1], s_right_steer: [6, 1], s_left_hard: [12, -1], s_right_hard: [12, 1],
  t33_through_screen: ['t0.33', null], t66_through_screen: ['t0.66', null], t95_through_screen: ['t0.95', null],
  // round 10: inside the 05 -> 06 kink (s ≈ 178), straight and steered to both banks
  t97_end: ['t0.97', null], t99_end: ['t0.99', null], t102_06: ['t1.02', null], t105_06: ['t1.05', null],
  t88_end: ['t0.88', null], t90_end: ['t0.90', null], t92_end: ['t0.92', null], t94_end: ['t0.94', null],
  k81_kink: ['t0.81', null], k81_kink_left: ['t0.81', -1], k81_kink_right: ['t0.81', 1],
};
// render slot (same protocol as scripts/lib/pw.mjs): one browser render at a time on the shared CPU
const slots = Math.max(1, Number(process.env.RAINBOW_RENDER_SLOTS ?? 2));
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
let free = () => {};
outer: for (;;) {
  for (let i = 0; i < slots; i++) {
    const dir = `/tmp/rainbow-render-slot-${i}`;
    try { mkdirSync(dir); writeFileSync(`${dir}/pid`, String(process.pid)); free = () => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* */ } }; process.on('exit', free); break outer; } catch {
      let pid = NaN; try { pid = Number(readFileSync(`${dir}/pid`, 'utf8')); } catch { /* */ }
      if (Number.isFinite(pid) && !alive(pid)) { try { rmSync(dir, { recursive: true, force: true }); } catch { /* */ } }
    }
  }
  await new Promise((r) => setTimeout(r, 1500));
}
const { createServer } = await import('vite');
const server = await createServer({ server: { port: PORT, strictPort: false, host: '127.0.0.1', hmr: false, watch: { ignored: ['**/*'] }, fs: { allow: [process.cwd(), realpathSync(`${process.cwd()}/node_modules`)] } }, logLevel: 'error' });
await server.listen();
const url = (server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${PORT}/`).replace(/\/$/, '');
const { chromium } = loadPlaywright();
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { if (m.text().startsWith('TUBEMESH')) console.log(m.text()); });
  await page.goto(`${url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const [dist, steer] = ALL[SHOT];
  const out = await page.evaluate(async ([id, dist, steer, pxs, hide, list]) => {
    const r = window.__rainbow; r.goto(id);
    const s0 = r.state().s;
    const stg = r.course.stage(id);
    const s1 = stg.s1 ?? (stg.s0 + (stg.length ?? 0));
    const target = typeof dist === 'string' ? s0 + Number(dist.slice(1)) * Math.max(0, s1 - s0) : s0 + dist;
    r.setSteer(steer);
    let n = 0; while (r.state().s < target - 1e-3 && n < 4000) { r.step(1); n++; }
    r.setSteer(null);
    r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
    const THREE = await import('/node_modules/three/build/three.module.js');
    const { scene, camera } = r.qa3d();
    scene.updateMatrixWorld(true);
    const chain = (o) => { const nn = []; for (let p = o; p && p !== scene; p = p.parent) nn.push(p.name || p.type); return nn.reverse().join(' > '); };
    const shown = (o) => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
    const rc = new THREE.Raycaster();
    const res = pxs.map(([x, y]) => {
      rc.setFromCamera(new THREE.Vector2((x + 0.5) / 864 * 2 - 1, -((y + 0.5) / 1536) * 2 + 1), camera);
      const hits = rc.intersectObjects(scene.children, true).filter((h) => shown(h.object)).slice(0, 10);
      return { px: [x, y], hits: hits.map((h) => ({ obj: chain(h.object), mat: h.object.material?.type ?? '-', d: +h.distance.toFixed(3), p: h.point.toArray().map((v) => +v.toFixed(2)), ro: h.object.renderOrder })) };
    });
    const names = [];
    if (list) scene.traverse((o) => { if (o.isMesh || o.isPoints) names.push(`${shown(o) ? 'V' : '-'} ${chain(o)} ${o.material?.type ?? ''}`); });
    let hidden = 0;
    if (hide.length) scene.traverse((o) => { if (hide.some((h) => (o.name || '').includes(h))) { o.visible = false; hidden++; } });
    if (hide.length) { r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false); }
    return { s: r.state().s, lat: r.state().lat, cam: camera.position.toArray(), res, hidden, names };
  }, [ '05', dist, steer, pxs, hide, list ]);
  console.log('shot', SHOT, 's', out.s, 'lat', out.lat, 'cam', out.cam.map((v) => v.toFixed(2)).join(','));
  for (const r of out.res) {
    console.log(`px ${r.px.join(',')}`);
    for (const h of r.hits) console.log(`   d ${h.d}  ro ${h.ro}  ${h.mat}  ${h.obj}  @${h.p.join(',')}`);
  }
  if (list) for (const n of out.names) console.log(n);
  if (hide.length) console.log('hidden objects:', out.hidden);
  if (shot) { await page.waitForTimeout(150); await page.screenshot({ path: shot }); console.log('shot →', shot); }
  // --idmap=out.png : every mesh drawn flat in a colour per object (water_ribbon cyan, foam_berm white, proj05_apron yellow,
  // tube05_far_river blue, tube05_far_wall violet, tube05_far dark violet, other tubes grey, foam meshes green, near frame orange)
  const idmap = (args.find((a) => a.startsWith('--idmap=')) ?? '').slice(8);
  if (idmap) {
    await page.evaluate(async () => {
      const THREE = await import('/node_modules/three/build/three.module.js');
      const r = window.__rainbow; const { scene } = r.qa3d();
      const col = (n, chain) => n === 'water_ribbon' ? 0x00ffff : n === 'foam_berm' ? 0xffffff : n === 'proj05_apron' ? 0xffff00 : n === 'tube05_far_river' ? 0x0000ff
        : n === 'tube05_far_wall' ? 0xaa00ff : n === 'tube05_far' ? 0x550088 : n === 'tube05_near_frame' ? 0xff8800 : chain.includes('foam_banks') ? 0x00ff00
        : chain.includes('zone_tubes') ? (window.__r10tubeIdx = (window.__r10tubeIdx ?? 0) + 1, [0x808080, 0xff0000, 0x00ff00, 0x0000aa, 0xaaaa00, 0x00aaaa, 0xaa00aa, 0x804000, 0x008040, 0x400080][window.__r10tubeIdx % 10]) : chain.includes('Benny') ? 0xff00ff : chain.includes('coins') ? 0xffd700 : chain.includes('bubbles') || chain.includes('splash') || chain.includes('spray') ? null : 0x400000;
      scene.traverse((o) => {
        if (!(o.isMesh || o.isPoints)) return;
        const chain = []; for (let p = o; p; p = p.parent) chain.push(p.name || '');
        const c = col(o.name, chain.join('>'));
        if (c === null) { o.visible = false; return; }
        if (chain.join('>').includes('zone_tubes')) { const bb = o.geometry.boundingBox ?? (o.geometry.computeBoundingBox(), o.geometry.boundingBox); console.log('TUBEMESH', (window.__r10tubeIdx ?? 0) % 10, o.name, o.material?.type, o.material?.map?.name ?? o.material?.map?.source?.data?.src?.slice(-60) ?? '', bb.min.toArray().map((v) => v.toFixed(0)).join(','), bb.max.toArray().map((v) => v.toFixed(0)).join(','), o.visible); }
        if (o.isMesh) { const m = new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide }); if (o.material?.morphTargets !== undefined) m.morphTargets = true; o.material = m; }
      });
      r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
    });
    await page.waitForTimeout(150);
    await page.screenshot({ path: idmap });
    console.log('idmap →', idmap);
  }
  // --sets=a+b,c : one extra screenshot per hide set (objects whose name contains any of the '+'-joined parts), restored after
  const sets = (args.find((a) => a.startsWith('--sets=')) ?? '').slice(7).split(',').filter(Boolean);
  for (const set of sets) {
    const parts = set.split('+');
    const n = await page.evaluate(async (parts) => {
      const r = window.__rainbow; const { scene } = r.qa3d(); const hid = [];
      scene.traverse((o) => { if (o.visible && parts.some((h) => (o.name || '').includes(h))) { o.visible = false; hid.push(o); } });
      r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
      window.__r10hid = hid; return hid.length;
    }, parts);
    await page.waitForTimeout(150);
    const f = (shot || '/tmp/r10.png').replace(/\.png$/, `_hide_${set.replace(/[^a-z0-9]+/gi, '_')}.png`);
    await page.screenshot({ path: f });
    await page.evaluate(() => { for (const o of window.__r10hid ?? []) o.visible = true; });
    console.log('set', set, 'hidden', n, '→', f);
  }
} finally {
  await browser.close();
  await server.close();
  free();
}
