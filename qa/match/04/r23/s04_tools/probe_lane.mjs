// r23 s04 (QA only, read-only): river surface height (lane-local y) near Benny and Benny's body extent in the lane frame.
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
  const out = await page.evaluate(async () => {
    const r = window.__rainbow; r.goto('04'); const s0 = r.state().s, s1 = r.course.stage('04').s1, tS = s0 + 0.35 * (s1 - s0);
    let k = 0; while (r.state().s < tS && k < 6000) { r.step(1); k++; }
    r.freezeAt(10); r.drawList();
    const { scene } = r.qa3d(); scene.updateMatrixWorld(true);
    const river = scene.getObjectByName('m04_river'); const grp = river.parent;
    const inv = grp.matrixWorld.clone().invert(); const V = scene.position.constructor;
    const benny = scene.getObjectByName('Benny'); const bl = benny.getWorldPosition(new V()).applyMatrix4(inv);
    // river vertices near Benny (|dz| < 1.5) by x
    const pa = river.geometry.attributes.position; const P = new V(); const rows = {};
    const M = river.matrixWorld.clone().premultiply(inv);
    for (let i = 0; i < pa.count; i++) { P.fromBufferAttribute(pa, i).applyMatrix4(M); if (Math.abs(P.z - bl.z) < 1.0) { const kx = Math.round(P.x * 2) / 2; (rows[kx] ??= []).push(P.y); } }
    const prof = Object.keys(rows).map(Number).sort((a, b) => a - b).map((x) => [x, +(rows[x].reduce((a, b) => a + b, 0) / rows[x].length).toFixed(3)]);
    // Benny's vertices in the lane frame: y range, and radius (x/z half extent) per height band
    const bands = {}; let minY = 1e9, maxY = -1e9;
    benny.traverse((o) => { if (o.isMesh && o.visible) { const a = o.geometry.attributes.position; const MM = o.matrixWorld.clone().premultiply(inv); const st = Math.max(1, Math.floor(a.count / 30000));
      for (let i = 0; i < a.count; i += st) { P.fromBufferAttribute(a, i).applyMatrix4(MM); minY = Math.min(minY, P.y); maxY = Math.max(maxY, P.y);
        const b = Math.round(P.y * 10) / 10; const rr = Math.hypot(P.x - bl.x, P.z - bl.z); bands[b] = Math.max(bands[b] ?? 0, rr); } } });
    const bandList = Object.keys(bands).map(Number).sort((a, b) => a - b).filter((b) => b < 1.6).map((b) => [b, +bands[b].toFixed(2)]);
    return { bl: bl.toArray().map((x) => +x.toFixed(3)), riverProfile: prof, bennyY: [+minY.toFixed(3), +maxY.toFixed(3)], bands: bandList, riverName: river.name, grpName: grp.name };
  });
  console.log(JSON.stringify(out));
} finally { await browser.close(); await vite.close?.(); process.exit(0); }
