// r24 s07 (QA only): where the drop's foam lobes sit — lateral from the (bent) course centre vs s, both sides, for a query
//   node tools/match07/cloudprobe_r24.mjs "<query>" s0 s1
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [Q, S0, S1] = process.argv.slice(2);
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.QA_PORT ?? 5277));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 216, height: 384 } });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 600000 });
  const res = await page.evaluate(([s0, s1]) => {
    const r = window.__rainbow, c = r.course, { scene } = r.qa3d();
    let m = null; scene.traverse((o) => { if (o.name === 'm07_pl_cloud') m = o; });
    if (!m) return 'no mesh';
    m.updateMatrixWorld(true);
    const a = m.geometry.getAttribute('aLobe'), P = m.position.clone();
    const rows = {};
    for (let i = 0; i < a.count; i++) {
      P.set(a.getX(i), a.getY(i), a.getZ(i)).applyMatrix4(m.matrixWorld);
      let best = s0 - 5, bd = 1e9;
      for (let s = s0 - 5; s <= s1 + 5; s += 0.1) { const f = c.sample(s); const d = P.distanceToSquared(f.pos); if (d < bd) { bd = d; best = s; } }
      if (best < s0 || best > s1) continue;
      const f = c.sample(best), lat = P.clone().sub(f.pos).dot(f.right);
      const k = Math.floor(best);
      (rows[k] ??= []).push(+lat.toFixed(1) + '/' + a.getW(i).toFixed(2));
    }
    return Object.entries(rows).map(([k, v]) => `${k} bx=${c.bend07At(+k).toFixed(2)} n=${v.length} ` + v.sort((x, y) => parseFloat(x) - parseFloat(y)).join(' ')).join('\n');
  }, [Number(S0), Number(S1)]);
  console.log(res);
} finally { await browser.close(); await vite.close?.(); }
