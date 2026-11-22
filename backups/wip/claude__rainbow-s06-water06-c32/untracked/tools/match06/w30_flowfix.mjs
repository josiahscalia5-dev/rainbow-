// QA only (water06 r30b): fixed camera at river s = S, shader clock advanced by DT ms per frame -> proves the water pattern itself flows.
//   cd <worktree> && node <this> <outDir> "<query>" [S=266] [N=6] [DT=250]
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const { startVite } = await import(pathToFileURL(`${process.cwd()}/tools/match06/r23_vite.mjs`).href);
const [OUT, Q = '', S = '266', N = '6', DT = '250'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5338));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const st = await page.evaluate((tS) => { const r = window.__rainbow; r.goto('06'); let k = 0; while (r.state().s < tS && k < 6000) { r.step(1); k++; } r.setSteer(null); r.freezeAt(10); return r.state(); }, Number(S));
  console.log('at s', st.s);
  for (let i = 0; i < Number(N); i++) {
    const t = 12000 + i * Number(DT);
    await page.evaluate(async (t) => { const r = window.__rainbow; const _pn = performance.now; performance.now = () => t; r.drawList(); performance.now = _pn; await new Promise((res) => requestAnimationFrame(() => res())); }, t);
    await page.screenshot({ path: `${OUT}/t${String(i).padStart(2, '0')}.png` });
  }
  writeFileSync(`${OUT}/info.json`, JSON.stringify({ query: Q, s: st.s, dtMs: Number(DT), n: Number(N) }));
} finally { await browser.close(); await vite.close(); }
