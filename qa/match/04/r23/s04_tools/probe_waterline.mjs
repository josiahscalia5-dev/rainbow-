// r23 s04 (QA only, read-only): where the river surface is relative to Benny's root, his body size in his own frame, and the
// Screen 04 lane frame. cd /home/user/wt/s04 && AUDIT_PORT=5274 node <this> "<query>"
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [Q] = process.argv.slice(2);
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5274));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  for (const frac of [0.12, 0.35, 0.6, 0.85]) {
    const out = await page.evaluate(async (frac) => {
      const r = window.__rainbow; const _pn = performance.now; performance.now = () => 10000;
      r.goto('04'); const s0 = r.state().s, s1 = r.course.stage('04').s1, tS = s0 + frac * (s1 - s0);
      let k = 0; while (r.state().s < tS && k < 6000) { r.step(1); k++; }
      r.freezeAt(10); r.drawList(); await new Promise((res) => requestAnimationFrame(() => res()));
      const { scene } = r.qa3d(); scene.updateMatrixWorld(true);
      const V = scene.position.constructor;
      const benny = scene.getObjectByName('Benny'); const g = scene.getObjectByName('match04_projection') ?? null;
      const river = []; scene.traverse((o) => { if (o.name === 'm04_river' || o.name === 'm04_lane') river.push(o.name); });
      const riverM = scene.getObjectByName('m04_river');
      const root = benny.getWorldPosition(new V());
      // Benny's mesh extent along world up relative to root
      let minY = 1e9, maxY = -1e9; const P = new V();
      benny.traverse((o) => { if (o.isMesh && o.visible) { const pa = o.geometry.attributes.position; const n = Math.min(pa.count, 40000), st = Math.max(1, Math.floor(pa.count / n));
        for (let i = 0; i < pa.count; i += st) { P.fromBufferAttribute(pa, i).applyMatrix4(o.matrixWorld); minY = Math.min(minY, P.y - root.y); maxY = Math.max(maxY, P.y - root.y); } } });
      // river surface under Benny: raycast down world -Y
      const RC = new (window.__THREE?.Raycaster ?? Object)();
      let hit = null;
      if (riverM && window.__THREE) { RC.set(root.clone().add(new V(0, 4, 0)), new V(0, -1, 0)); const h = RC.intersectObject(riverM, false); hit = h.length ? +(h[0].point.y - root.y).toFixed(3) : null; }
      performance.now = _pn;
      return { s: r.state().s, root: root.toArray().map((x) => +x.toFixed(2)), bennyRelY: [+minY.toFixed(3), +maxY.toFixed(3)], riverHitRelY: hit, river, hasTHREE: !!window.__THREE,
        group: g ? g.matrixWorld.elements.map((x) => +x.toFixed(3)) : null };
    }, frac);
    console.log(frac, JSON.stringify(out));
  }
} finally { await browser.close(); await vite.close?.(); process.exit(0); }
