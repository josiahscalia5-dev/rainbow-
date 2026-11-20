// r25 s04 (QA only, read-only): Benny's height vs the visible Screen 04 river surface under him and the m04wl waterline
// patch, at several lateral positions (steer held for N steps from the middle of 04). Run from the worktree:
//   cd /home/user/wt/s04 && AUDIT_PORT=5275 node <this> "<query>"
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [Q] = process.argv.slice(2);
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5275));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 600000 });
  for (const [frac, steer, n] of [[0.3, null, 0], [0.5, 1, 15], [0.5, 1, 30], [0.5, 1, 45], [0.3, -1, 30]]) {
    const out = await page.evaluate(([frac, steer, n]) => {
      const r = window.__rainbow; const _pn = performance.now; performance.now = () => 10000;
      r.goto('04'); const s0 = r.state().s, s1 = r.course.stage('04').s1, tS = s0 + frac * (s1 - s0);
      let k = 0; while (r.state().s < tS && k < 6000) { r.step(1); k++; }
      r.setSteer(steer); for (let i = 0; i < n; i++) r.step(1); r.setSteer(null); r.step(1, 1e-4); r.drawList();
      const { scene } = r.qa3d(); const benny = scene.getObjectByName('Benny'); const river = scene.getObjectByName('m04_river');
      const wl = scene.getObjectByName('m04_waterline');
      const bw = benny.getWorldPosition(new (benny.position.constructor)());
      const bl = wl.parent.worldToLocal(bw.clone());
      const br = river.worldToLocal(bw.clone());
      const pa = river.geometry.attributes.position; let best = 1e9, by = null, bx = null;
      for (let i = 0; i < pa.count; i++) { const d = Math.hypot(pa.getX(i) - br.x, pa.getZ(i) - br.z); if (d < best) { best = d; by = pa.getY(i); bx = pa.getX(i); } }
      performance.now = _pn;
      return { frac, steer, n, lat: r.state().lat, bennyLocal: bl.toArray().map((x) => +x.toFixed(3)), bennyRiverLocal: br.toArray().map((x) => +x.toFixed(3)),
        riverY: +by.toFixed(3), riverVertDist: +best.toFixed(3), wlPos: wl.position.toArray().map((x) => +x.toFixed(3)), wlVisible: wl.visible, splash: scene.getObjectByName('Benny') && r.qa3d().scene.children.filter((o)=>o.isSprite||o.type==='Sprite').length,
        riverSameFrame: river.parent === wl.parent, riverPos: river.position.toArray() };
    }, [frac, steer, n]);
    console.log(JSON.stringify(out));
  }
} finally { await browser.close(); await vite.close?.(); process.exit(0); }
