import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const { startVite } = await import(pathToFileURL(`${process.cwd()}/tools/match06/r23_vite.mjs`).href);
const [Q, S] = process.argv.slice(2);
const { chromium } = loadPlaywright(); const vite = await startVite(5295); const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const logs = [];
try {
  const page = await browser.newPage({ viewport: { width: 432, height: 768 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { const t = m.text(); if (/\[match06\]/.test(t)) logs.push(t.slice(0, 300)); });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true, null, { timeout: 300000 });
  if (process.env.NDC) await page.evaluate((n) => { globalThis.__NDC = n; }, JSON.parse(process.env.NDC));
  const res = await page.evaluate(([S]) => { const r = window.__rainbow; r.goto('06'); let k = 0; while (r.state().s < S && k < 8000) { r.step(1); k++; } r.freezeAt(10); r.drawList();
    const out = {}; for (const [x, y] of (globalThis.__NDC ?? [[0, 0.5], [0, 0.2], [-0.5, 0.3], [0.5, 0.3], [0, 0.05]])) out[`${x},${y}`] = globalThis.__NDC ? r.probe(x, y).concat(r.probe(x, y)).filter((h) => /m06_/.test(h.obj)) : r.probe(x, y); return { s: r.state().s, s07: r.course.stage('07').s0, hits: out }; }, [Number(S)]);
  console.log(JSON.stringify(res, null, 1)); console.log(logs.join('\n'));
} finally { await browser.close(); await vite.close(); }
