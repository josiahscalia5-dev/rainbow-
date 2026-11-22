// r23 s04 (QA only, read-only): at each audit shot report Benny's screen box, the camera, and every 3D chevron
// (distance ahead of Benny along the lane, screen box, opacity). Run from the worktree:
//   cd /home/user/wt/s04 && AUDIT_PORT=5274 node <this> "<query>"
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [Q] = process.argv.slice(2);
const SHOTS = process.env.AUDIT_SHOTS ? JSON.parse(process.env.AUDIT_SHOTS)
  : [['b_early', 0.12, null], ['c_middle', 0.35, null], ['d_late', 0.6, null], ['e_end', 0.85, null], ['g_hard_right', 0.35, 1]];
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5274));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  for (const [name, frac, steer] of SHOTS) {
    const out = await page.evaluate(async ([frac, steer]) => {
      const r = window.__rainbow; const _pn = performance.now; performance.now = () => 10000;
      r.goto('04'); const s0 = r.state().s, s1 = r.course.stage('04').s1, tS = s0 + frac * (s1 - s0);
      r.setSteer(steer); let k = 0; while (r.state().s < tS && k < 6000) { r.step(1); k++; } r.setSteer(null);
      r.freezeAt(10); r.drawList(); await new Promise((res) => requestAnimationFrame(() => res()));
      const { scene, camera } = r.qa3d(); camera.updateMatrixWorld();
      const T = scene.children[0].constructor; // unused
      const px = (v) => { const p = v.clone().project(camera); return [Math.round((p.x + 1) / 2 * 864), Math.round((1 - p.y) / 2 * 1536)]; };
      const benny = scene.getObjectByName('Benny');
      let bb = null;
      if (benny) {
        const B = new (benny.position.constructor)(); const mn = [1e9, 1e9], mx = [-1e9, -1e9];
        benny.updateMatrixWorld(true);
        benny.traverse((o) => { if (o.isMesh && o.visible && o.geometry) { o.geometry.computeBoundingBox?.(); const b = o.geometry.boundingBox; if (!b) return;
          for (let i = 0; i < 8; i++) { B.set(i & 1 ? b.max.x : b.min.x, i & 2 ? b.max.y : b.min.y, i & 4 ? b.max.z : b.min.z).applyMatrix4(o.matrixWorld);
            const [x, y] = px(B); mn[0] = Math.min(mn[0], x); mn[1] = Math.min(mn[1], y); mx[0] = Math.max(mx[0], x); mx[1] = Math.max(mx[1], y); } } });
        const wp = benny.getWorldPosition(new (benny.position.constructor)());
        const hY = [1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.4].map((h) => [h, px(wp.clone().add(new (wp.constructor)(0, h, 0)))[1]]);
        bb = { world: wp.toArray().map((x) => +x.toFixed(3)), screenRoot: px(wp), boxMin: mn, boxMax: mx, hY, rootPos: benny.position.toArray().map((x) => +x.toFixed(3)), parent: benny.parent?.name };
      }
      const arrows = [];
      scene.traverse((o) => { if (o.name === 'm04_arrow3d') {
        const wp = o.getWorldPosition(new (o.position.constructor)());
        arrows.push({ localZ: +o.position.z.toFixed(2), vis: o.visible, op: +(o.material.opacity ?? 0).toFixed(2), world: wp.toArray().map((x) => +x.toFixed(2)), screen: px(wp),
          distBenny: benny ? +wp.distanceTo(benny.getWorldPosition(new (o.position.constructor)())).toFixed(2) : null }); } });
      const cp = camera.getWorldPosition(new (camera.position.constructor)());
      performance.now = _pn;
      return { s: r.state().s, lat: r.state().lat, cam: cp.toArray().map((x) => +x.toFixed(3)), fov: camera.fov, benny: bb,
        arrows: arrows.filter((a) => a.vis || (a.distBenny < 40)).sort((a, b) => a.distBenny - b.distBenny).slice(0, 12) };
    }, [frac, steer]);
    console.log(name, JSON.stringify(out));
  }
} finally { await browser.close(); await vite.close?.(); process.exit(0); }
