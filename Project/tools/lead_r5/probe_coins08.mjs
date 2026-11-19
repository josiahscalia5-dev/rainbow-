import { loadPlaywright, CHROMIUM_ARGS, startVite } from '/home/user/rainbow-/scripts/lib/pw.mjs';
const { chromium } = loadPlaywright();
const vite = await startVite(5235);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const page = await browser.newPage({ viewport: { width: 216, height: 384 } });
await page.goto(`${vite.url}/?seed=7&dpr=1&match08=1&coins08px=1`);
await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
const r = await page.evaluate(() => {
  const a = window.__rainbow, c = a.course;
  const st = (n) => ({ s0: +c.stage(n).s0.toFixed(2), s1: +c.stage(n).s1.toFixed(2) });
  const stages = { '07': st('07'), '08': st('08'), '09': st('09'), '10': st('10') };
  a.goto('08'); a.step   const coins = a.coinDefs()  const coins = a.coinDefs() a.step(1, 1/60);
  const coins = a.coinDefs().filter((d) => d.s >= c.stage('08').s0 - 5 && d.s < c.stage('10').s0).map((d) => ({ s: +d.s.toFixed(2), lat: +d.lat.toFixed(2) }));
  a.goto('08'); const cp = a.state();
  return { stages, checkpoint08_s: +cp.s.toFixed(2), coins };
});
console.log(JSON.stringify(r, null, 1));
await browser.close(); process.exit(0);
