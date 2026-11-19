// Diagnosis for flowplan-test D (race?) and E (missed coin). Scratch only; run from the repo root.
import { writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '/home/user/rainbow-/scripts/lib/pw.mjs';
const OUT = process.argv[2];
const clip = 'node_modules/.rainbow-test/flow_test.webm';
const { chromium } = loadPlaywright();
const vite = await startVite(5243);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const res = { D: [], E: [] };
const open = async (q) => {
  const page = await browser.newPage({ viewport: { width: 432, height: 768 } });
  await page.goto(`${vite.url}/?seed=7&dpr=1${q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  return page;
};
const ov = () => { const w = document.querySelector('[data-cinematic]'); const v = w?.querySelector('video');
  return { opacity: w?.style.opacity, t: v?.currentTime, dur: v?.duration, ended: v?.ended, err: v?.error?.code ?? null, paused: window.__rainbow.state().paused }; };
try {
  for (let k = 0; k < 3; k++) {
    const page = await open(`&introVideo=/${clip}`);
    await page.waitForSelector('[data-cinematic]', { timeout: 15000 });
    res.D.push(await page.evaluate(ov));
    await page.close();
  }
  for (let k = 0; k < 2; k++) {
    const page = await open(`&flowplan=1&introVideo=/${clip}&endingVideo=/${clip}`);
    await page.waitForSelector('[data-cinematic]', { timeout: 15000 });
    await page.evaluate(() => window.__rainbow.run(false)); // take control while the video still covers the paused ride
    const atShow = await page.evaluate(ov);
    await page.waitForFunction(() => window.__rainbow.state().paused === false, null, { timeout: 30000 });
    const start = await page.evaluate(() => window.__rainbow.state());
    const drive = await page.evaluate(() => {
      const a = window.__rainbow, dt = 1 / 60;
      for (let i = 0; i < 60 * 120; i++) {
        const st = a.state();
        if (st.mode !== 'ride') return { steps: i, coins: st.coins, stage: st.stage,
          missed: a.coinDefs().filter((d) => !d.taken).map((d) => ({ s: +d.s.toFixed(2), lat: +d.lat.toFixed(2) })) };
        const next = a.coinDefs().find((d) => !d.taken && d.s > st.s + 0.5 && d.s < st.s + 12);
        a.setSteer(Math.max(-1, Math.min(1, ((next ? next.lat : 0) - st.lat) * 0.9)));
        a.step(1, dt);
      }
      return null;
    });
    await page.waitForSelector('[data-cinematic]', { timeout: 15000 }).catch(() => {});
    await page.waitForSelector('[data-cinematic]', { state: 'detached', timeout: 30000 }).catch(() => {});
    await page.evaluate(() => { window.__rainbow.setSteer(null); window.__rainbow.run(true); });
    await page.waitForFunction(() => window.__rainbow.state().mode === 'end', null, { timeout: 120000 }).catch(() => {});
    const fin = await page.evaluate(() => ({ ...window.__rainbow.state(), taken: window.__rainbow.coinDefs().filter((d) => d.taken).length }));
    res.E.push({ atShow, start: { s: start.s, lat: start.lat, coins: start.coins }, handOver: drive && { steps: drive.steps, coins: drive.coins, stage: drive.stage, missedBefore09: drive.missed.filter((m) => m.s < 404.79) }, final: { coins: fin.coins, taken: fin.taken, mode: fin.mode } });
    await page.close();
  }
} finally {
  writeFileSync(OUT, JSON.stringify(res, null, 2));
  await browser.close();
  await vite.close();
}
console.log(JSON.stringify(res));
