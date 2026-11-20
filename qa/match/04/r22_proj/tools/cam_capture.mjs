// r22 S04 projection (QA only, read-only): reproduce the three accepted-plate game cameras EXACTLY as
// tools/lead21/clean_frame.mjs made the structure frames (same query, steps, freeze, Benny / coins / splash / HUD hidden),
// record each camera (world matrix, projection matrix, fov, aspect, near / far) and the Screen 04 group frame, and save the
// clean frame so it can be compared with qa/review_r21/artwork/04/game_frames/<shot>.png.
//   cd /home/user/wt/s04 && AUDIT_PORT=5273 node <this> <outDir> "<query>"
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [OUT, Q] = process.argv.slice(2);
const SHOTS = process.env.AUDIT_SHOTS ? JSON.parse(process.env.AUDIT_SHOTS)
  : [['c_middle', 0.35, null], ['d_late', 0.6, null], ['e_end', 0.85, null]];
const PIN = process.env.PIN !== '0';
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5273));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('console', m.text().slice(0, 200)); });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  for (const [name, frac, steer] of SHOTS) {
    const st = await page.evaluate(async ([stage, frac, steer, pin]) => {
      const r = window.__rainbow;
      const _pn = performance.now; if (pin) performance.now = () => 10000;
      r.goto(stage);
      const s0 = r.state().s, s1 = r.course.stage(stage).s1;
      const tS = s0 + frac * (s1 - s0);
      r.setSteer(steer);
      let k = 0; while (r.state().s < tS && k < 6000) { r.step(1); k++; }
      r.setSteer(null);
      r.freezeAt(10);
      const { scene, camera } = r.qa3d();
      const hidden = [];
      for (const o of scene.children) if (/^(Benny|coins|m0[4-8]_splash)$/.test(o.name) && o.visible) { o.visible = false; hidden.push(o); }
      const hud = document.getElementById('hud'); if (hud) hud.style.visibility = 'hidden';
      r.drawList();
      await new Promise((res) => requestAnimationFrame(() => res()));
      camera.updateMatrixWorld();
      const g = scene.getObjectByName('match04_projection');
      const out = { ...r.state(), s0, s1, cam: r.camera(), projectionMatrix: camera.projectionMatrix.toArray(),
        matrixWorldInverse: camera.matrixWorldInverse.toArray(), group: g ? g.matrixWorld.toArray() : null };
      window.__restore = () => { for (const o of hidden) o.visible = true; if (hud) hud.style.visibility = ''; };
      performance.now = _pn;
      return out;
    }, ['04', frac, steer, PIN]);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    await page.evaluate(() => window.__restore?.());
    log.push({ name, frac, steer, ...st });
    console.log(name, 's', st.s, 'lat', st.lat, 'cam', st.cam.position.map((x) => x.toFixed(3)).join(','), 'fov', st.cam.fov, 'aspect', st.cam.aspect);
  }
} finally { writeFileSync(`${OUT}/cams.json`, JSON.stringify(log, null, 1)); await browser.close(); await vite.close?.(); }
