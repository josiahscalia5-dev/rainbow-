// r30b lead diagnosis (read-only): at given river positions s, report stage boundaries, camera, and what object each probe point
// on a grid hits (window.__rainbow.probe), plus screenshots with selected objects hidden (by name substring) to show causes.
//   cd <worktree> && node tools/match06/r30b_diag.mjs <outDir> "<query>"   env: DIAG_S='[238,266,310,387]' DIAG_HIDE='[["no07",["tube07"]]]'
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const { startVite } = await import(pathToFileURL(`${process.cwd()}/tools/match06/r23_vite.mjs`).href);
const [OUT, Q] = process.argv.slice(2);
const SS = JSON.parse(process.env.DIAG_S ?? '[238,266,310,387]');
const HIDE = JSON.parse(process.env.DIAG_HIDE ?? '[]');
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5360));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const out = { query: Q, shots: [] };
try {
  const W = Number(process.env.AUDIT_W ?? 432), H = Number(process.env.AUDIT_H ?? 768);
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { const t = m.text(); if (/match06|rror/.test(t)) console.log('console', t.slice(0, 300)); });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  out.stages = await page.evaluate(() => Object.fromEntries(['05', '06', '07', '08'].map((k) => { const s = window.__rainbow.course.stage(k); return [k, { s0: s.s0, s1: s.s1 }]; })));
  console.log('stages', JSON.stringify(out.stages));
  for (const tS of SS) {
    const st = await page.evaluate(async (tS) => {
      const r = window.__rainbow; r.goto('06');
      let k = 0; while (r.state().s < tS && k < 8000) { r.step(1); k++; }
      r.freezeAt(10); r.drawList();
      await new Promise((res) => requestAnimationFrame(() => res()));
      const grid = [];
      for (let y = 0.9; y >= -0.2; y -= 0.1) for (let x = -0.6; x <= 0.61; x += 0.3) {
        const h = r.probe(x, y)[0]; grid.push({ x: +x.toFixed(1), y: +y.toFixed(1), obj: h?.obj ?? 'none', d: h?.d ?? null });
      }
      return { state: r.state(), cam: r.camera().position, target: r.camera().target, bs: r.bennyScreen(), grid };
    }, tS);
    await page.screenshot({ path: `${OUT}/s${tS}.png` });
    const rec = { s: tS, ...st, hidden: [] };
    for (const [tag, names] of HIDE) {
      await page.evaluate(async (names) => {
        const { scene } = window.__rainbow.qa3d(); window.__hid = [];
        scene.traverse((o) => { if (o.visible && names.some((n) => (o.name || '').includes(n))) { o.visible = false; window.__hid.push(o); } });
        window.__rainbow.drawList(); await new Promise((res) => requestAnimationFrame(() => res()));
      }, names);
      await page.screenshot({ path: `${OUT}/s${tS}_${tag}.png` });
      rec.hidden.push({ tag, n: await page.evaluate(() => { const n = window.__hid.length; for (const o of window.__hid) o.visible = true; return n; }) });
    }
    out.shots.push(rec);
    console.log('s', tS, 'stage', st.state.stage, 'benny', JSON.stringify(st.bs));
    const seen = {}; for (const g of st.grid) seen[g.obj] = (seen[g.obj] ?? 0) + 1;
    console.log('  hits', JSON.stringify(seen));
  }
  out.names = await page.evaluate(() => { const a = new Set(); window.__rainbow.qa3d().scene.traverse((o) => { if (o.name) a.add((o.parent?.name ? o.parent.name + '/' : '') + o.name); }); return [...a].slice(0, 400); });
} finally { writeFileSync(`${OUT}/diag.json`, JSON.stringify(out, null, 1)); await browser.close(); await vite.close?.(); }
