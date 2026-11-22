// r25 (QA only): dump the m06holedump floor unwrap (plate RGB + vis, mask06 R/G + body fill, projector px) to <outPrefix>.{bin,xy.bin,json}
//   cd /home/user/wt/s06 && AUDIT_PORT=5283 node tools/match06/r25_holedump.mjs "<query>" <outPrefix>
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
  page.on('console', (m) => { if (/m06hole|rror/.test(m.text())) console.log('console', m.text().slice(0, 300)); });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}&m06holedump=1`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 600000 });
  const r = await page.evaluate(() => window.__m06hole ?? null);
  if (!r) throw new Error('no __m06hole');
  writeFileSync(`${OUT}.bin`, Buffer.from(r.data, 'base64'));
  writeFileSync(`${OUT}.xy.bin`, Buffer.from(r.xy, 'base64'));
  const { data, xy, ...meta } = r;
  writeFileSync(`${OUT}.json`, JSON.stringify(meta, null, 1));
  console.log('hole dump', meta);
} finally { await browser.close(); await vite.close?.(); }
