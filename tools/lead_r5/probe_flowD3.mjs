import { loadPlaywright, CHROMIUM_ARGS, startVite } from '/home/user/rainbow-/scripts/lib/pw.mjs';
const clip = 'node_modules/.rainbow-test/flow_test.webm';
const { chromium } = loadPlaywright();
const vite = await startVite(5234);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const vstate = (page) => page.evaluate(() => { const w = document.querySelector('[data-cinematic]'); const v = w?.querySelector('video');
  const st = window.__rainbow?.ready ? window.__rainbow.state() : null;
  return { overlay: !!w, op: w?.style.opacity, v: v ? { rs: v.readyState, t: +v.currentTime.toFixed(2), ended: v.ended } : null, mode: st?.mode, stage: st?.stage, paused: st?.paused, s: st ? +st.s.toFixed(2) : null, perf: Math.round(performance.now()) }; });
for (const [tag, q] of [['A', `&flowplan=1&introVideo=/${clip}`], ['D', `&introVideo=/${clip}`]]) {
  const page = await browser.newPage({ viewport: { width: 432, height: 768 } });
  const t0 = Date.now(); const lg = (m, x) => console.log(tag, String(Date.now() - t0).padStart(6), m, x ? JSON.stringify(x) : '');
  await page.goto(`${vite.url}/?seed=7&dpr=1${q}`); lg('goto done');
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 }); lg('ready resolved');
  const shown = await page.waitForSelector('[data-cinematic]', { timeout: 15000 }).then(() => true).catch(() => false); lg('selector', { shown });
  lg('state now', await vstate(page));
  lg('state again', await vstate(page));
  await page.waitForTimeout(4000);
  lg('after 4s', await vstate(page));
  await page.close();
}
await browser.close(); process.exit(0);
