// r23 (QA only): where the camera, Benny and the river sit in the m06tun tunnel's cross-section along 06, and where the
// tunnel's vanishing point / near ring centres land on screen.  node tools/match06/r23_tunprobe.mjs "<query>" [steer]
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const { startVite } = await import(pathToFileURL(`${process.cwd()}/tools/match06/r23_vite.mjs`).href);
const [Q, STEER] = process.argv.slice(2);
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5283));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const out = await page.evaluate(async (steer) => {
    const r = window.__rainbow; r.goto('06');
    const { scene, camera } = r.qa3d(); const V = camera.position.constructor;
    let rings = null; scene.traverse((o) => { if (o.name === 'm06_rings') rings = o; });
    const u = rings.material.uniforms, O = u.uAxO.value, ax = u.uAxD.value, Rx = u.uAxR.value, Ux = u.uAxU.value;
    const cs = (p) => { const q = p.clone().sub(O); const a = q.dot(ax); return [+a.toFixed(1), +q.dot(Rx).toFixed(2), +q.dot(Ux).toFixed(2)]; };
    const pr = (p) => { const v = p.clone().project(camera); return [Math.round(((v.x + 1) / 2) * 864), Math.round(((1 - v.y) / 2) * 1536), v.z < 1 ? 1 : 0]; };
    const s0 = r.state().s, s1 = r.course.stage('06').s1, rows = [];
    r.setSteer(steer === undefined ? null : Number(steer));
    let next = s0, k = 0;
    while (r.state().s < s1 + 2 && k < 9000) {
      const st = r.state();
      if (st.s >= next) {
        next += 2; camera.updateMatrixWorld();
        const fw = new V(); camera.getWorldDirection(fw);
        const c = camera.position.clone(), ca = c.clone().sub(O).dot(ax);
        const vp = pr(c.clone().addScaledVector(ax, 5000));
        // centre of the ring 8 u / 20 u ahead of the camera along the axis
        const rc = (d) => pr(O.clone().addScaledVector(ax, ca + d));
        rows.push({ s: st.s, lat: st.lat, cam: cs(c), benny: cs(r.course.sample(st.s).pos.clone().addScaledVector(r.course.sample(st.s).right, st.lat)),
          riv10: cs(r.course.sample(st.s + 10).pos), riv25: cs(r.course.sample(st.s + 25).pos), fwAx: +fw.dot(ax).toFixed(3),
          vp, ring8: rc(8), ring20: rc(20) });
      }
      r.step(1); k++;
    }
    return { axis: { O: O.toArray(), ax: ax.toArray(), Rx: Rx.toArray(), Ux: Ux.toArray() }, s0, s1, rows };
  }, STEER);
  console.log(JSON.stringify(out.axis), out.s0, out.s1);
  for (const o of out.rows) console.log(JSON.stringify(o));
} finally { await browser.close(); await vite.close?.(); }
