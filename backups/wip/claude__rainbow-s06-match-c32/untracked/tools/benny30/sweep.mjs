// r30 benny06: ONE page load, many Benny configurations (window.__b30.set, benny30.ts) x shots (absolute river s or 0 = start).
// usage: cd <worktree> && AUDIT_W=864 AUDIT_H=1536 AUDIT_PORT=5320 node tools/benny30/sweep.mjs <outDir> "<query>" '<configs json>' '<shots json>' [mask]
//   configs: [["label", {b30 params}], ...]  (label "base" with {} = the query as loaded)   shots: [["a_start",0],["b_marked",214.86],...]
// Same deterministic stepping / frozen clock / pinned performance.now as tools/match06/r30_shots.mjs.
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const { startVite } = await import(pathToFileURL(`${process.cwd()}/tools/match06/r23_vite.mjs`).href);
const [OUT, Q, CFG, SH, MASK] = process.argv.slice(2);
const CONFIGS = JSON.parse(CFG), SHOTS = JSON.parse(SH);
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5320));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: Number(process.env.AUDIT_W ?? 432), height: Number(process.env.AUDIT_H ?? 768) }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('console', m.text().slice(0, 200)); });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  await page.evaluate(() => { window.__pinNow = 10000; });
  for (const [label, params] of CONFIGS) {
    const applied = await page.evaluate((p) => (window.__b30 ? window.__b30.set(p) : null), params);
    for (const [name, sAbs] of SHOTS) {
      const st = await page.evaluate(async ([sAbs, mask]) => {
        const r = window.__rainbow;
        r.goto('06');
        let k = 0; while (r.state().s < sAbs && k < 8000) { r.step(1); k++; }
        r.freezeAt(10);
        const draw = () => { const _pn = performance.now; performance.now = () => window.__pinNow; r.drawList(); performance.now = _pn; };
        draw();
        await new Promise((res) => requestAnimationFrame(() => res()));
        return r.state();
      }, [sAbs]);
      await page.screenshot({ path: `${OUT}/${label}_${name}.png`, timeout: 600000 });
      if (MASK) {
        await page.evaluate(async () => {
          window.__bennyQA.mask(true);
          const _pn = performance.now; performance.now = () => window.__pinNow; window.__rainbow.drawList(); performance.now = _pn;
          await new Promise((res) => requestAnimationFrame(() => res()));
        });
        await page.screenshot({ path: `${OUT}/${label}_${name}_mask.png`, timeout: 600000 });
        await page.evaluate(() => window.__bennyQA.mask(false));
      }
      log.push({ label, name, s: st.s, stage: st.stage, params: applied });
      console.log(label, name, 's', st.s, 'stage', st.stage);
    }
  }
} finally { writeFileSync(`${OUT}/sweep.json`, JSON.stringify(log, null, 1)); await browser.close(); await vite.close?.(); }
