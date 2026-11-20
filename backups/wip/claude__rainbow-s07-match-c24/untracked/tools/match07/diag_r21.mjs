// r21 Screen 07 diagnostics (read-only QA): deterministic shots like tools/lead21/audit_screen.mjs, plus per-shot hiding of
// named scene objects and ray probes, to see which mesh paints which part of the frame.
//   cd /home/user/wt/s07 && node tools/match07/diag_r21.mjs <outDir> "<query>" '<json shots>'
// shots: [{"name":"x","frac":0.85,"steer":null,"hide":["ribbon","foam"],"probe":[[0,0.5],[-0.5,0.2]]}]
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [OUT, Q, SH] = process.argv.slice(2);
const SHOTS = JSON.parse(SH);
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5277));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' || /m07/.test(t)) console.error('console', t.slice(0, 300)); });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 600000 });
  for (const sh of SHOTS) {
    const st = await page.evaluate(async (sh) => {
      const r = window.__rainbow;
      r.goto(sh.stage ?? '07');
      const s0 = r.state().s, s1 = r.course.stage(sh.stage ?? '07').s1;
      const tS = sh.s ?? s0 + sh.frac * (s1 - s0);
      r.setSteer(sh.steer ?? null);
      let k = 0; while (r.state().s < tS && k < 6000) { r.step(1); k++; }
      r.setSteer(null);
      r.freezeAt(10);
      r.drawList();
      const { scene } = r.qa3d();
      const hid = [];
      for (const n of sh.hide ?? []) scene.traverse((o) => { if (o.name === n && o.visible) { o.visible = false; hid.push(o); } });
      const calls = r.drawList();
      const sOf = (pt) => { let best = 1e9, bs = 0; for (let q = 240; q < 430; q += 0.25) { const p = r.course.sample(q).pos; const d = Math.hypot(p.x - pt[0], p.y - pt[1], p.z - pt[2]); if (d < best) { best = d; bs = q; } } return [bs, +best.toFixed(2)]; };
      const probes = (sh.probe ?? []).map(([x, y]) => ({ x, y, hits: r.probe(x, y).map((h) => ({ ...h, sd: sOf(h.p) })) }));
      await new Promise((res) => requestAnimationFrame(() => res()));
      window.__hid = hid;
      return { ...r.state(), s0, s1, hidden: hid.length, calls: calls.slice(0, 40), probes, marks: r.course.marks };
    }, sh);
    await page.screenshot({ path: `${OUT}/${sh.name}.png`, timeout: 600000 });
    await page.evaluate(() => { for (const o of window.__hid ?? []) o.visible = true; window.__hid = []; });
    log.push({ name: sh.name, ...st });
    console.log(sh.name, 's', st.s, 'lat', st.lat, 'hidden', st.hidden);
  }
} finally { writeFileSync(`${OUT}/diag.json`, JSON.stringify(log, null, 1)); await browser.close(); await vite.close?.(); }
