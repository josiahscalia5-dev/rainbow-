// r30 lead QA: evaluate a JS expression in the live game at the 06 checkpoint (optionally after S river distance). usage: node r30_eval.mjs "<query>" "<expr using r, scene, cam>" [S]
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const { startVite } = await import(pathToFileURL(`${process.cwd()}/tools/match06/r23_vite.mjs`).href);
const [Q, EXPR, S = '0'] = process.argv.slice(2);
const { chromium } = loadPlaywright(); const vite = await startVite(5303); const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try { const page = await browser.newPage({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`); await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 300000 });
  console.log(JSON.stringify(await page.evaluate(([E, S]) => { const r = window.__rainbow; r.goto('06'); let k = 0; while (r.state().s < S && k < 8000) { r.step(1); k++; } r.freezeAt(10); r.drawList(); const { scene, camera: cam } = r.qa3d(); return eval(E); }, [EXPR, Number(S)])));
} finally { await browser.close(); await vite.close(); }
