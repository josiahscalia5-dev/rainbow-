// Round 12 (lead): A/B test renders for Screen 04 — the same shot positions and simulation stepping as
// tools/lead_r6/motion_audit.mjs, but only the named shots and several query variants in ONE browser/vite session.
//   node tools/match04/ab04.mjs <outDir> '<shots JSON: [[name, dist|"tN", steer|null], ...]>' label1='<query>' label2='<query>' ...
// Writes <outDir>/<label>/<shot>.png (+ motion.json per label). Run from the worktree root.
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [OUT, SHOTS_JSON, ...VARIANTS] = process.argv.slice(2);
const SHOTS = JSON.parse(SHOTS_JSON);
const SCREEN = '04';
import { readFileSync } from 'node:fs';
const VIEW_EYES = JSON.parse(readFileSync('assets/textures/match04/mv04.json', 'utf8')).views.map((v) => v.eye);
const { chromium } = loadPlaywright();
const vite = await startVite(5290);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  for (const v of VARIANTS) {
    const eq = v.indexOf('=');
    const label = v.slice(0, eq), Q = v.slice(eq + 1);
    const dir = `${OUT}/${label}`; mkdirSync(dir, { recursive: true });
    const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.error('pageerror', e.message));
    await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
    await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
    const log = [];
    for (const [name, dist, steer] of SHOTS) {
      const st = await page.evaluate(async ([id, dist, steer, exact]) => {
        const r = window.__rainbow; r.goto(id);
        const s0 = r.state().s;
        const stg = r.course.stage(id);
        const s1 = stg.s1 ?? (stg.s0 + (stg.length ?? 0));
        // dist: units forward of the checkpoint | 'tN' = fraction N of the stage | 'sX' = absolute course position X
        const target = typeof dist === 'string' ? (dist[0] === 's' ? Number(dist.slice(1)) : s0 + Number(dist.slice(1)) * Math.max(0, s1 - s0)) : s0 + dist;
        r.setSteer(steer);
        let n = 0; while (r.state().s < target - 1e-3 && n < 4000) { r.step(1); n++; }
        r.setSteer(null);
        if (exact) r.drawList();   // EXACT=1: draw the stepped state as is (no extra real-time frames that move Benny on)
        else { r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false); }
        return { ...r.state(), frames: n, cam: r.camera().position };
      }, [SCREEN, dist, steer, process.env.EXACT === '1']);
      await page.waitForTimeout(150);
      await page.screenshot({ path: `${dir}/${name}.png` });
      log.push({ name, dist, steer, ...st });
      const dv = VIEW_EYES.map((e) => +Math.hypot(st.cam[0] - e[0], st.cam[1] - e[1], st.cam[2] - e[2]).toFixed(2));
      log[log.length - 1].cam_to_view_cams = dv;
      console.log(label, name, 's', st.s?.toFixed?.(2), 'lat', st.lat, 'cam->V04-1/V04-2', dv.join('/'));
    }
    writeFileSync(`${dir}/motion.json`, JSON.stringify({ screen: SCREEN, query: Q, shots: log }, null, 1));
    await page.close();
  }
} finally {
  await browser.close(); await vite.close?.();
}
