// Screen 06 r21 (QA only): camera / Benny / route screen positions along 06 for a query.
//   node tools/match06/r21_probe.mjs "<query>" [steer]
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [Q, STEER] = process.argv.slice(2);
const { chromium } = loadPlaywright();
const vite = await startVite(5277);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const rows = await page.evaluate(async (steer) => {
    const r = window.__rainbow; r.goto('06');
    const { camera } = r.qa3d(); const T = camera.position.constructor;
    const s1 = r.course.stage('06').s1, out = [];
    r.setSteer(steer === undefined ? null : Number(steer));
    const pr = (p) => { const v = p.clone().project(camera); return [+(((v.x + 1) / 2) * 864).toFixed(0), +(((1 - v.y) / 2) * 1536).toFixed(0), v.z < 1 ? 1 : 0]; };
    let k = 0, next = r.state().s;
    while (r.state().s < s1 + 4 && k < 8000) {
      const st = r.state();
      if (st.s >= next) {
        next += 2; camera.updateMatrixWorld();
        const fw = new T(); camera.getWorldDirection(fw);
        const ahead = [4, 8, 14, 22].map((d) => pr(r.course.sample(Math.min(st.s + d, r.course.length - 1)).pos));
        out.push({ s: st.s, lat: st.lat, cam: st.cam, fw: fw.toArray().map((x) => +x.toFixed(3)), benny: (() => { const b = r.bennyScreen(); return [Math.round((b.x + 1) / 2 * 864), Math.round((1 - b.y) / 2 * 1536)]; })(), ahead });
      }
      r.step(1); k++;
    }
    return out;
  }, STEER);
  for (const o of rows) console.log(JSON.stringify(o));
} finally { await browser.close(); await vite.close?.(); }
