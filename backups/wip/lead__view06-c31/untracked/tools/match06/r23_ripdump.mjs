// r23 (QA only): dump the m06rip decal (raw RGBA premultiplied) + the build log.  node tools/match06/r23_ripdump.mjs "<query>" out.raw
import { writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const { startVite } = await import(pathToFileURL(`${process.cwd()}/tools/match06/r23_vite.mjs`).href);
const [Q, OUT] = process.argv.slice(2);
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5283));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('console', (m) => { if (/m06rip|rror/.test(m.text())) console.log('console', m.text().slice(0, 300)); });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}&m06ripdbg=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const r = await page.evaluate(() => { const d = window.__m06rip; return d ? { NX: d.NX, NY: d.NY, b: Array.from(d.data) } : null; });
  if (r) { writeFileSync(OUT, Buffer.from(r.b)); console.log('decal', r.NX, r.NY); }
} finally { await browser.close(); await vite.close?.(); }
