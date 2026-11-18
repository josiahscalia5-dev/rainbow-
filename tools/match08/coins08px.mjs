// Screen 08 coins on the painted spots (lead, 2026-11-17 r3; `?match08=1&coins08px=1` only).
// For each of the approved picture's nine coins (assets/textures/match08/coins08.json `px` = centre + radius in px), cast
// the ray of the locked approved 08 camera through the painted pixel and choose the depth on that ray where the coin
// stands ON the water (bottom edge at the painted water level, 0.41 u above the river centre line) within pickup reach
// (|lateral| <= 1.05); its scale makes it exactly the painted size at that depth. If no depth is within reach on the
// water, the coin keeps the in-reach depth closest to the water (it floats a little, like the previous layout). Writes assets/textures/match08/coins08px.json with exact world
// points; src/gameplay/coins.ts turns them into river s / lateral / height. Read-only on the game.
//   node tools/match08/coins08px.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const painted = JSON.parse(readFileSync('assets/textures/match08/coins08.json', 'utf8')).coins.map((c) => c.px);
const { chromium } = loadPlaywright();
const vite = await startVite(5227);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
await page.goto(`${vite.url}/?qa=1&dpr=1&match08=1`);
await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 240000 });
await page.evaluate(() => window.__rainbow.goto('08'));
await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
const res = await page.evaluate((painted) => {
  const api = window.__rainbow, { scene, camera } = api.qa3d(), defs = api.coinDefs(), W = 864, H = 1536;
  let mesh = null;
  scene.traverse((o) => { if (o.isInstancedMesh && o.count === defs.length && !mesh) mesh = o; });
  const a = mesh.instanceMatrix.array, cam = camera.position.clone();
  // the game's current picture coins = the visible coins of stage 08/09 (stage 10's own coins are excluded)
  const game = [];
  for (let i = 0; i < defs.length; i++) {
    const st = api.course.stageAtS(defs[i].s).id;
    if (st !== '08' && st !== '09' && st !== '10') continue;
    if (st === '10' && defs[i].lat === -0.15) continue; // stage 10's own five coins (straight line into the towel tunnel)
    const p = cam.clone().set(a[i * 16 + 12], a[i * 16 + 13], a[i * 16 + 14]);
    const n = p.clone().project(camera);
    if (Math.abs(n.z) > 1) continue;
    const x = (n.x + 1) / 2 * W, y = (1 - n.y) / 2 * H;
    if (x < 0 || x > W || y < 0 || y > H) continue;
    game.push({ i, p, px: [x, y], scale: Math.hypot(a[i * 16], a[i * 16 + 1], a[i * 16 + 2]), dist: p.distanceTo(cam) });
  }
  // unique nearest assignment painted <-> game coin (greedy by pixel distance)
  const pairs = [];
  painted.forEach((q, j) => game.forEach((g, k) => pairs.push({ j, k, d: Math.hypot(g.px[0] - q[0], g.px[1] - q[1]) })));
  pairs.sort((u, v) => u.d - v.d);
  const usedJ = new Set(), usedK = new Set(), out = [];
  for (const pr of pairs) {
    if (usedJ.has(pr.j) || usedK.has(pr.k)) continue;
    usedJ.add(pr.j); usedK.add(pr.k);
    const q = painted[pr.j], g = game[pr.k];
    const dir = cam.clone().set(q[0] / W * 2 - 1, 1 - q[1] / H * 2, 0.5).unproject(camera).sub(cam).normalize();
    const s0 = api.course.stage('08').s0, s1 = api.course.stage('11').s0, F = (H / 2) / Math.tan(camera.fov * Math.PI / 360), R0 = 0.5, WATER = 0.41;
    const frame = (T) => {
      let best = 0, bd = Infinity;
      for (let s = s0; s <= s1; s += 0.05) { const f = api.course.sample(s).pos; const d = (f.x - T.x) ** 2 + (f.z - T.z) ** 2; if (d < bd) { bd = d; best = s; } }
      const f = api.course.sample(best), d = T.clone().sub(f.pos);
      return { s: best, lat: d.dot(f.right), h: d.dot(f.up), along: d.dot(f.tan) };
    };
    let pick = null;
    for (let D = Math.max(4, g.dist * 0.5); D <= g.dist * 2.2; D += 0.05) {
      const T = cam.clone().addScaledVector(dir, D), r = frame(T), scale = q[2] * D / (R0 * F);
      if (Math.abs(r.lat) > 1.05 || r.h < 0.25) continue;
      const err = Math.abs(r.h - (WATER + R0 * scale));
      if (!pick || err < pick.err) pick = { D, T, r, scale, err };
    }
    if (!pick) { const r = frame(cam.clone().addScaledVector(dir, g.dist)); pick = { D: g.dist, T: cam.clone().addScaledVector(dir, g.dist), r, scale: q[2] * g.dist / (R0 * F), err: -1 }; }
    out.push({ px: q, was_px: g.px.map((v) => +v.toFixed(1)), moved_px: +pr.d.toFixed(1), world: pick.T.toArray().map((v) => +v.toFixed(4)),
      dist: +pick.D.toFixed(3), was_dist: +g.dist.toFixed(3), scale: +pick.scale.toFixed(4), was_scale: +g.scale.toFixed(4),
      s: +pick.r.s.toFixed(3), lat: +pick.r.lat.toFixed(3), h: +pick.r.h.toFixed(3), above_water: +(pick.r.h - WATER - R0 * pick.scale).toFixed(3), along: +pick.r.along.toFixed(3) });
  }
  out.sort((u, v) => u.s - v.s);
  return { cam: cam.toArray(), coins: out };
}, painted);
writeFileSync('assets/textures/match08/coins08px.json', JSON.stringify({
  note: 'Screen 08 picture coins ON the painted pixels (lead r3 2026-11-17, tools/match08/coins08px.mjs): each coin on the locked approved camera ray through its painted pixel, at the depth of the previous match08 coin (same size + pickup reach). Used only with ?match08=1&coins08px=1.',
  faceTo: res.cam, coins: res.coins }, null, 1));
for (const c of res.coins) console.log(JSON.stringify(c));
await browser.close(); await vite.close(); process.exit(0);
