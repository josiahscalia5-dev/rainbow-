// Solve the Screen 08 locked camera in the live game (read-only): camera position + aim so that, at fov 62,
// Benny's projected box, the door centre and the platform centre land where the approved picture has them.
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const { chromium } = loadPlaywright();
const vite = await startVite(5264);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&match08=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  await page.evaluate(() => window.__rainbow.goto('08'));
  const out = await page.evaluate(() => {
    const { scene, camera } = window.__rainbow.qa3d();
    const V = camera.position.constructor;
    let benny = null; scene.traverse((o) => { if (!benny && o.name === 'Benny') benny = o; });
    const B3 = new (Object.getPrototypeOf(camera.matrixWorld).constructor === Object ? Object : Object)();
    // world-space AABB of Benny's visible meshes only
    const mn = new V(1e9, 1e9, 1e9), mx = new V(-1e9, -1e9, -1e9); const tmp = new V();
    benny.updateWorldMatrix(true, true);
    benny.traverse((o) => { if (o.isMesh && o.visible && o.geometry) { o.geometry.computeBoundingBox(); const bb = o.geometry.boundingBox;
      for (const x of [bb.min.x, bb.max.x]) for (const y of [bb.min.y, bb.max.y]) for (const z of [bb.min.z, bb.max.z]) { tmp.set(x, y, z).applyMatrix4(o.matrixWorld); mn.min(tmp); mx.max(tmp); } } });
    const corners = []; for (const x of [mn.x, mx.x]) for (const y of [mn.y, mx.y]) for (const z of [mn.z, mx.z]) corners.push(new V(x, y, z));
    const cam = camera.clone(); const W = 864, H = 1536;
    const proj = (p) => { const n = p.clone().project(cam); return [(n.x * 0.5 + 0.5) * W, (-n.y * 0.5 + 0.5) * H]; };
    const box = () => { let a = [1e9, 1e9, -1e9, -1e9]; for (const c of corners) { const [x, y] = proj(c); a = [Math.min(a[0], x), Math.min(a[1], y), Math.max(a[2], x), Math.max(a[3], y)]; } return a; };
    const door = new V(12, -103.6, -332), plat = new V(12, -110.6, -325);
    // current camera: box of the AABB vs the real visible Benny in the current capture (x 305-705, y 1005-1500)
    const cur = box();
    // calibrate: AABB-projected box -> visible box (scale per side measured on the current frame)
    const vis = [305, 1005, 705, 1500];
    // target (approved): visible box 260,850,600,1210 ; door (490,400) ; platform (480,560)
    const T = { box: [260, 850, 600, 1210], door: [490, 400], plat: [480, 560] };
    const toVisible = (b) => { // map AABB box to visible box with the current frame's relative insets
      const w = cur[2] - cur[0], h = cur[3] - cur[1];
      const fx0 = (vis[0] - cur[0]) / w, fx1 = (cur[2] - vis[2]) / w, fy0 = (vis[1] - cur[1]) / h, fy1 = (cur[3] - vis[3]) / h;
      const W2 = b[2] - b[0], H2 = b[3] - b[1];
      return [b[0] + fx0 * W2, b[1] + fy0 * H2, b[2] - fx1 * W2, b[3] - fy1 * H2]; };
    const bc = mn.clone().add(mx).multiplyScalar(0.5);
    const set = (p) => { // p = [cx, cy, cz, aimx, aimy, aimz] camera position + aim point
      cam.position.set(p[0], p[1], p[2]); cam.up.set(0, 1, 0); cam.lookAt(p[3], p[4], p[5]); cam.updateMatrixWorld(true); cam.updateProjectionMatrix(); };
    const err = (p) => { set(p); const b = toVisible(box()), d = proj(door), q = proj(plat); let e = 0;
      for (let i = 0; i < 4; i++) e += (b[i] - T.box[i]) ** 2; e += 2 * ((d[0] - T.door[0]) ** 2 + (d[1] - T.door[1]) ** 2) + 0.5 * ((q[0] - T.plat[0]) ** 2 + (q[1] - T.plat[1]) ** 2); return e; };
    // Nelder-Mead
    let x0 = [camera.position.x, camera.position.y, camera.position.z, door.x, door.y - 14, door.z];
    const nm = (f, x, step, iters) => { const n = x.length; let S = [x.slice()]; for (let i = 0; i < n; i++) { const y = x.slice(); y[i] += step[i]; S.push(y); }
      let F = S.map(f); for (let it = 0; it < iters; it++) { const idx = F.map((v, i) => i).sort((a, b) => F[a] - F[b]); S = idx.map((i) => S[i]); F = idx.map((i) => F[i]);
        const c = new Array(n).fill(0); for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) c[j] += S[i][j] / n;
        const xr = c.map((v, j) => v + (v - S[n][j])); const fr = f(xr);
        if (fr < F[0]) { const xe = c.map((v, j) => v + 2 * (v - S[n][j])); const fe = f(xe); if (fe < fr) { S[n] = xe; F[n] = fe; } else { S[n] = xr; F[n] = fr; } }
        else if (fr < F[n - 1]) { S[n] = xr; F[n] = fr; }
        else { const xc = c.map((v, j) => v + 0.5 * (S[n][j] - v)); const fc = f(xc); if (fc < F[n]) { S[n] = xc; F[n] = fc; } else { for (let i = 1; i <= n; i++) { S[i] = S[i].map((v, j) => S[0][j] + 0.5 * (v - S[0][j])); F[i] = f(S[i]); } } } }
      const i0 = F.indexOf(Math.min(...F)); return [S[i0], F[i0]]; };
    let best = nm(err, x0, [1, 1, 1, 4, 4, 4], 3000);
    best = nm(err, best[0], [0.3, 0.3, 0.3, 1, 1, 1], 3000);
    set(best[0]); const b = toVisible(box());
    return { bennyAABB: [mn.toArray(), mx.toArray()], bennyCenter: bc.toArray(), curAABBbox: cur, pose: best[0].map((v) => +v.toFixed(3)), err: +best[1].toFixed(1),
      boxPx: b.map((v) => +v.toFixed(0)), doorPx: proj(door).map((v) => +v.toFixed(0)), platPx: proj(plat).map((v) => +v.toFixed(0)),
      camMinusBenny: [best[0][0] - bc.x, best[0][1] - mn.y, best[0][2] - bc.z].map((v) => +v.toFixed(3)) };
  });
  console.log(JSON.stringify(out));
} finally { await browser.close(); await vite.close?.(); }
