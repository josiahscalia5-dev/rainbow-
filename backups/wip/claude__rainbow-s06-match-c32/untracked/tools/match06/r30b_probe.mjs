// r30b lead (read-only): probe chosen NDC points at chosen river positions; prints the first 3 hits (object path, distance)
//   cd <worktree> && node tools/match06/r30b_probe.mjs "<query>"   env: PROBE='[[350,[[0.2,0.4],[0.1,0.3]]]]'
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const { startVite } = await import(pathToFileURL(`${process.cwd()}/tools/match06/r23_vite.mjs`).href);
const [Q] = process.argv.slice(2);
const P = JSON.parse(process.env.PROBE);
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5365));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  for (const [tS, pts] of P) {
    const out = await page.evaluate(async ([tS, pts]) => {
      const r = window.__rainbow; r.goto('06');
      let k = 0; while (r.state().s < tS && k < 8000) { r.step(1); k++; }
      r.freezeAt(10); r.drawList();
      return { s: r.state().s, benny: r.bennyScreen(), hits: pts.map(([x, y]) => ({ x, y, h: r.probe(x, y).slice(0, 3) })) };
    }, [tS, pts]);
    console.log(JSON.stringify(out));
  }
} finally { await browser.close(); await vite.close?.(); }
