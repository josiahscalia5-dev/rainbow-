// Screen 05 round 8: the lead's motion_audit (tools/lead_r6/motion_audit.mjs) with a shot filter + per-shot probes
// (coin screen sizes, Benny's screen box). Same shot list / same simulation stepping as the audit, so a shot taken here
// equals the audit frame of the same name. Run from the checkout:
//   node tools/match05/r8_shots.mjs <outDir> "<query>" [name,name,...|all] [port]
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
import { realpathSync, mkdirSync as mk, rmSync, readFileSync } from 'node:fs';
// own dev server: node_modules is a symlink into the lead checkout in this worktree, so Vite's default fs allow list
// refused the HUD font (fallback font in the HUD). Same render-slot protocol as scripts/lib/pw.mjs.
async function startVite(port) {
  const slots = Math.max(1, Number(process.env.RAINBOW_RENDER_SLOTS ?? 2));
  const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
  let free = () => {};
  const t0 = Date.now();
  outer: for (;;) {
    for (let i = 0; i < slots; i++) {
      const dir = `/tmp/rainbow-render-slot-${i}`;
      try { mk(dir); writeFileSync(`${dir}/pid`, String(process.pid)); free = () => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* */ } }; process.on('exit', free); break outer; } catch {
        let pid = NaN; try { pid = Number(readFileSync(`${dir}/pid`, 'utf8')); } catch { /* */ }
        if (Number.isFinite(pid) && !alive(pid)) { try { rmSync(dir, { recursive: true, force: true }); } catch { /* */ } }
      }
    }
    if (Date.now() - t0 > 40 * 60 * 1000) break;
    await new Promise((r) => setTimeout(r, 1500));
  }
  const { createServer } = await import('vite');
  const server = await createServer({ server: { port, strictPort: false, host: '127.0.0.1', hmr: false, watch: { ignored: ['**/*'] }, fs: { allow: [process.cwd(), realpathSync(`${process.cwd()}/node_modules`)] } }, logLevel: 'error' });
  await server.listen();
  const addr = server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${port}/`;
  return { url: addr.replace(/\/$/, ''), close: async () => { try { await server.close(); } finally { free(); } } };
}
const [SHOT = 't66_through_screen', Q = '', PTS = '', PORT = '5293'] = process.argv.slice(2);
// Screen 05 round 8: what does the screen show at pixel (x,y)? Same shot list / stepping as r8_shots.mjs.
//   node tools/match05/r8_probe.mjs <shot> "<query>" "x,y;x,y;..." [port]
const { chromium } = loadPlaywright();
const vite = await startVite(Number(PORT));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const ALL = {
  a00_approved_view: [0, null], f03_forward3u: [3, null], f06_forward6u: [6, null], f10_forward10u: [10, null], f20_forward20u: [20, null],
  s_left_steer: [6, -1], s_right_steer: [6, 1], s_left_hard: [12, -1], s_right_hard: [12, 1],
  t33_through_screen: ['t0.33', null], t66_through_screen: ['t0.66', null], t95_through_screen: ['t0.95', null],
};
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const [dist, steer] = ALL[SHOT];
  const pts = PTS.split(';').filter(Boolean).map((p) => p.split(',').map(Number));
  const out = await page.evaluate(async ([id, dist, steer, pts]) => {
    const r = window.__rainbow; r.goto(id);
    const s0 = r.state().s;
    const stg = r.course.stage(id);
    const s1 = stg.s1 ?? (stg.s0 + (stg.length ?? 0));
    const target = typeof dist === 'string' ? s0 + Number(dist.slice(1)) * Math.max(0, s1 - s0) : s0 + dist;
    r.setSteer(steer);
    let n = 0; while (r.state().s < target - 1e-3 && n < 4000) { r.step(1); n++; }
    r.setSteer(null);
    r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
    const { scene, camera } = r.qa3d();
    const T = camera.constructor; // THREE classes are not global: build a raycaster from the camera's own module via probe()
    const detail = (x, y) => {
      const hits = r.probe(x / 432 - 1, 1 - y / 768);
      const first = hits[0];
      if (!first) return hits;
      // locate the first hit mesh again by walking the scene for an object whose bounding sphere contains the point
      const out = [];
      scene.traverse((o) => {
        if (!o.isMesh || !o.visible || out.length > 3) return;
        const g = o.geometry; if (!g) return;
        if (!g.boundingSphere) g.computeBoundingSphere();
        const c = g.boundingSphere.center.clone().applyMatrix4(o.matrixWorld);
        const rad = g.boundingSphere.radius * o.matrixWorld.getMaxScaleOnAxis();
        const d = Math.hypot(c.x - first.p[0], c.y - first.p[1], c.z - first.p[2]);
        if (d < rad && !o.name && o.parent?.name === 'zone_tubes') out.push({ type: g.type, verts: g.attributes.position?.count, mat: (Array.isArray(o.material) ? o.material[0] : o.material)?.type, key: (Array.isArray(o.material) ? o.material[0] : o.material)?.customProgramCacheKey?.(), inst: o.isInstancedMesh ? o.count : 0, ud: Object.keys(o.userData || {}), r: +rad.toFixed(1) });
      });
      return { hits, cands: out };
    };
    const nearS = (q) => { let best = 1e9, bs = 0; for (let s = 100; s < 260; s += 0.25) { const f = r.course.sample(s); const d = Math.hypot(f.pos.x - q[0], f.pos.y - q[1], f.pos.z - q[2]); if (d < best) { best = d; bs = s; } } const f = r.course.sample(bs); const v = [q[0] - f.pos.x, q[1] - f.pos.y, q[2] - f.pos.z]; return { s: bs, d: +best.toFixed(2), lat: +(v[0] * f.right.x + v[1] * f.right.y + v[2] * f.right.z).toFixed(2), up: +(v[0] * f.up.x + v[1] * f.up.y + v[2] * f.up.z).toFixed(2) }; };
    return { state: r.state(), hits: pts.map(([x, y]) => { const h = detail(x, y); const hs = Array.isArray(h) ? h : h.hits; return { x, y, h, at: hs.map((q) => ({ obj: q.obj.split('<')[0], ...nearS(q.p) })) }; }) };
  }, [ '05', dist, steer, pts ]);
  console.log(JSON.stringify(out.state));
  if (process.env.HIDE_OUT) {
    // hide each candidate of the first point in turn, screenshot (QA only)
    const n = out.hits[0]?.h?.cands?.length ?? 0;
    for (let k = -1; k < n; k++) {
      const info = await page.evaluate(async ([k, pt]) => {
        const r = window.__rainbow; const { scene } = r.qa3d();
        const first = r.probe(pt[0] / 432 - 1, 1 - pt[1] / 768)[0];
        const list = [];
        scene.traverse((o) => {
          if (!o.isMesh || !o.geometry || o.name || o.parent?.name !== 'zone_tubes') return;
          const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere();
          const c = g.boundingSphere.center.clone().applyMatrix4(o.matrixWorld);
          const rad = g.boundingSphere.radius * o.matrixWorld.getMaxScaleOnAxis();
          if (first && Math.hypot(c.x - first.p[0], c.y - first.p[1], c.z - first.p[2]) < rad) list.push(o);
        });
        list.forEach((o, i) => { o.visible = i !== k; });
        r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
        const o = list[k];
        const res = o ? { k, verts: o.geometry.attributes.position.count, pos: o.position.toArray(), color: o.material.color?.getHexString?.(), emissive: o.material.emissive?.getHexString?.(), metal: o.material.metalness, rough: o.material.roughness, map: !!o.material.map, uv: !!o.geometry.attributes.uv, groups: o.geometry.groups?.length, idx: !!o.geometry.index } : { k };
        list.forEach((o) => { o.visible = true; });
        return res;
      }, [k, out.hits[0] ? [out.hits[0].x, out.hits[0].y] : [0, 0]]);
      await page.screenshot({ path: `${process.env.HIDE_OUT}/hide_${k}.png` });
      console.log('hide', JSON.stringify(info));
    }
  }
  for (const p of out.hits) console.log(p.x, p.y, JSON.stringify(p.at));
} finally {
  await browser.close(); await vite.close?.();
}
