// End-to-end probe of ?flowplan=1 coin credit: intro video -> held on 04 -> real coin-seeking ride 04..08 ->
// ending video -> 11 victory. Read-only w.r.t. the repo (writes only to the scratchpad). Run from the repo root.
import { writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '/home/user/rainbow-/scripts/lib/pw.mjs';
const OUT = process.argv[2];
const clip = 'node_modules/.rainbow-test/flow_test.webm';
const { chromium } = loadPlaywright();
const vite = await startVite(5241);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const out = { errors: [] };
try {
  const page = await browser.newPage({ viewport: { width: 432, height: 768 } });
  page.on('pageerror', (e) => out.errors.push(e.message));
  await page.goto(`${vite.url}/?seed=7&dpr=1&flowplan=1&introVideo=/${clip}&endingVideo=/${clip}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  out.info = await page.evaluate(() => {
    const a = window.__rainbow, c = a.course, d = a.coinDefs();
    const ids = ['03', '04', '05', '06', '07', '08', '09', '10', '11'];
    const per = {}; ids.slice(0, -1).forEach((id, k) => { const s0 = c.stage(id).s0, s1 = c.stage(ids[k + 1]).s0; per[id] = d.filter((x) => x.s >= s0 && x.s < s1).length; });
    const s08 = c.stage('08').s0;
    return { total: d.length, perStage: per, before08goto: d.filter((x) => x.s < s08 + 2.5).length, refCoins08: c.stage('08').refCoins };
  });
  await page.waitForSelector('[data-cinematic]', { timeout: 15000 });
  out.duringIntro = await page.evaluate(() => window.__rainbow.state());
  await page.waitForSelector('[data-cinematic]', { state: 'detached', timeout: 30000 });
  await page.evaluate(() => window.__rainbow.run(false));
  out.afterIntro = await page.evaluate(() => window.__rainbow.state());
  // coin-seeking drive (same steering rule as scripts/gameplay-test.mjs) until the ride hands over
  out.drive = await page.evaluate(() => {
    const a = window.__rainbow, dt = 1 / 60;
    for (let i = 0; i < 60 * 120; i++) {
      const st = a.state();
      if (st.mode !== 'ride') return { steps: i, state: st, untakenBefore09: a.coinDefs().filter((d) => !d.taken && d.s < a.course.stage('09').s0).map((d) => +d.s.toFixed(2)) };
      const next = a.coinDefs().find((d) => !d.taken && d.s > st.s + 0.5 && d.s < st.s + 12);
      const want = next ? next.lat : 0;
      a.setSteer(Math.max(-1, Math.min(1, (want - st.lat) * 0.9)));
      a.step(1, dt);
    }
    return null;
  });
  out.endingShown = await page.waitForSelector('[data-cinematic]', { timeout: 15000 }).then(() => true).catch(() => false);
  await page.waitForSelector('[data-cinematic]', { state: 'detached', timeout: 30000 }).catch(() => {});
  await page.evaluate(() => { window.__rainbow.setSteer(null); window.__rainbow.run(true); });
  out.reachedEnd = await page.waitForFunction(() => window.__rainbow.state().mode === 'end', null, { timeout: 120000 }).then(() => true).catch(() => false);
  out.final = await page.evaluate(() => window.__rainbow.state());
  out.takenFinal = await page.evaluate(() => window.__rainbow.coinDefs().filter((d) => d.taken).length);
  out.pass = out.final.coins === 2240 && out.takenFinal === 91 && out.reachedEnd && out.errors.length === 0;
} finally {
  writeFileSync(OUT, JSON.stringify(out, null, 2));
  await browser.close();
  await vite.close();
}
console.log(JSON.stringify({ pass: out.pass, info: out.info, introHeld: out.duringIntro, afterDriveCoins: out.drive?.state?.coins, untaken: out.drive?.untakenBefore09, final: out.final?.coins, taken: out.takenFinal, errors: out.errors }));
