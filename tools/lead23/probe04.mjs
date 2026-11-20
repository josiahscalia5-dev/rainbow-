import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [Q, FRAC, PTS] = process.argv.slice(2);
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5280));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const out = await page.evaluate(([frac, pts]) => {
    const r = window.__rainbow; r.goto('04');
    const s0 = r.state().s, s1 = r.course.stage('04').s1, tS = s0 + frac * (s1 - s0);
    let k = 0; while (r.state().s < tS && k < 6000) { r.step(1); k++; }
    r.freezeAt(10); r.drawList();
    return pts.map(([x, y]) => ({ x, y, hits: r.probe(x, y) }));
  }, [Number(FRAC), JSON.parse(PTS)]);
  console.log(JSON.stringify(out, null, 1));
} finally { await browser.close(); await vite.close?.(); process.exit(0); }
