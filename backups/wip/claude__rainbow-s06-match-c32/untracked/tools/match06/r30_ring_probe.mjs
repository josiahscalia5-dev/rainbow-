// r30 lead (read-only diagnosis, docs/briefs/2026-11-20-r30): at a share of Screen 06 in REAL gameplay, measure what draws the gold
// "target": the camera's position / view direction in the painted tunnel's drum frame (a along the axis, r right, u up), every
// modeled gold ring ahead (axial distance, its projected centre + radius in screen px) and the wall tile's painted gold stripes.
// usage (from the worktree): node tools/match06/r30_ring_probe.mjs <out.json> "<query>" [frac=0.14] [W=864] [H=1536]
import { writeFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const { startVite } = await import(pathToFileURL(`${process.cwd()}/tools/match06/r23_vite.mjs`).href);
const [OUT, Q, FR = '0.14', W = '864', H = '1536'] = process.argv.slice(2);
const R6 = JSON.parse(readFileSync('assets/textures/match06/route06deep.json', 'utf8'));
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5291));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const logs = [];
try {
  const page = await browser.newPage({ viewport: { width: +W, height: +H }, deviceScaleFactor: 1 });
  page.on('console', (m) => { const t = m.text(); if (/\[match06\]|\[course\]/.test(t)) logs.push(t.slice(0, 400)); });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const res = await page.evaluate(async ([frac, R6]) => {
    const r = window.__rainbow; r.goto('06');
    const s0 = r.state().s, s1 = r.course.stage('06').s1, tS = s0 + frac * (s1 - s0);
    let k = 0; while (r.state().s < tS && k < 6000) { r.step(1); k++; }
    r.freezeAt(10); r.drawList();
    const { scene, camera } = r.qa3d(); camera.updateMatrixWorld();
    const V = camera.position.constructor;
    const O = new V().fromArray(R6.O), ax = new V().fromArray(R6.ax), Rx = new V().fromArray(R6.Rx), Ux = new V().fromArray(R6.Ux);
    const drum = (p) => { const q = p.clone().sub(O); const a = q.dot(ax); q.addScaledVector(ax, -a); return [a, q.dot(Rx), q.dot(Ux)]; };
    const dir = new V(0, 0, -1).applyQuaternion(camera.quaternion);
    const W = innerWidth, H = innerHeight;
    const px = (p) => { const v = p.clone().project(camera); return [(v.x + 1) / 2 * W, (1 - v.y) / 2 * H, v.z]; };
    // the tunnel's vanishing point on screen = projection of a far point on the axis
    const camD = drum(camera.position);
    const vp = px(O.clone().addScaledVector(ax, camD[0] + 2000));
    let rings = null, mesh = null;
    scene.traverse((o) => { if (o.name === 'm06_rings') mesh = o; });
    if (mesh) {
      const P = mesh.geometry.attributes.position, by = new Map();
      for (let i = 0; i < P.count; i += 7) {
        const p = new V(P.getX(i), P.getY(i), P.getZ(i)).applyMatrix4(mesh.matrixWorld), d = drum(p);
        const key = Math.round(d[0] * 2) / 2; // rings are ~2.2 u wide: cluster to the nearest ring below
        let hit = null; for (const [kk, v] of by) if (Math.abs(kk - d[0]) < 2.5) { hit = v; break; }
        if (!hit) { hit = { a: [], pts: [] }; by.set(key, hit); }
        hit.a.push(d[0]); hit.pts.push(p);
      }
      rings = [...by.values()].map((g) => {
        const a = g.a.reduce((x, y) => x + y, 0) / g.a.length;
        const c = O.clone().addScaledVector(ax, a);
        const rad = g.pts.reduce((x, p) => { const q = p.clone().sub(O); q.addScaledVector(ax, -q.dot(ax)); return x + q.length(); }, 0) / g.pts.length;
        // screen footprint: project 32 points of the ring's mean circle
        const sp = []; for (let j = 0; j < 32; j++) { const t = (j / 32) * Math.PI * 2; sp.push(px(c.clone().addScaledVector(Rx, rad * Math.cos(t)).addScaledVector(Ux, rad * Math.sin(t)))); }
        const inFront = sp.filter((q) => q[2] < 1);
        const cx = inFront.reduce((x, q) => x + q[0], 0) / Math.max(1, inFront.length), cy = inFront.reduce((x, q) => x + q[1], 0) / Math.max(1, inFront.length);
        const rpx = inFront.reduce((x, q) => x + Math.hypot(q[0] - cx, q[1] - cy), 0) / Math.max(1, inFront.length);
        return { a: +a.toFixed(2), ahead: +(a - camD[0]).toFixed(2), radius: +rad.toFixed(2), screenCentre: [+cx.toFixed(0), +cy.toFixed(0)], screenRadiusPx: +rpx.toFixed(0), allInFront: inFront.length === 32 };
      }).sort((x, y) => x.a - y.a);
    }
    const tube = (() => { let m = null; scene.traverse((o) => { if (o.name === 'm06_tube') m = o; }); if (!m) return null; const P = m.geometry.attributes.position; let amin = 1e9, amax = -1e9; for (let i = 0; i < P.count; i += 50) { const a = drum(new V(P.getX(i), P.getY(i), P.getZ(i)))[0]; amin = Math.min(amin, a); amax = Math.max(amax, a); } return { aFrom: +amin.toFixed(1), aTo: +amax.toFixed(1) }; })();
    const st = r.state();
    return { frac, s: st.s, s0, s1, coins: st.coins, camera: { drum: camD.map((v) => +v.toFixed(2)), angleToAxisDeg: +(Math.acos(Math.min(1, dir.dot(ax))) * 180 / Math.PI).toFixed(2), fovDeg: camera.fov },
      vanishingPointPx: vp.slice(0, 2).map((v) => +v.toFixed(0)), benny: r.bennyScreen(), tube, rings };
  }, [Number(FR), R6]);
  res.console = logs; res.query = Q; res.viewport = [+W, +H];
  writeFileSync(OUT, JSON.stringify(res, null, 1));
  const ahead = (res.rings ?? []).filter((g) => g.ahead > 0);
  console.log('camera drum', res.camera, 'vp', res.vanishingPointPx, 'tube', res.tube);
  console.log('rings total', res.rings?.length, 'ahead', ahead.length, 'spacing', ahead.length > 1 ? +(ahead[1].a - ahead[0].a).toFixed(2) : null);
  for (const g of ahead.slice(0, 30)) console.log(`  ring ${g.ahead.toFixed(1).padStart(6)} u ahead  r=${g.radius}  centre ${g.screenCentre}  radius ${g.screenRadiusPx}px`);
} finally { await browser.close(); await vite.close?.(); }
