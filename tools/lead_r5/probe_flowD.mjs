// Probe: timeline of the intro-video overlay vs game readiness (flowplan test A / D failure analysis).
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '/home/user/rainbow-/scripts/lib/pw.mjs';
const clip = 'node_modules/.rainbow-test/flow_test.webm';
const { chromium } = loadPlaywright();
const vite = await startVite(5232);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const results = [];
for (const [tag, q] of [['D', `&introVideo=/${clip}`], ['A', `&flowplan=1&introVideo=/${clip}`]]) {
  const page = await browser.newPage({ viewport: { width: 432, height: 768 } });
  await page.addInitScript(() => {
    window.__probe = [];
    const t0 = performance.now();
    const log = (e) => window.__probe.push([Math.round(performance.now() - t0), e]);
    new MutationObserver((ms) => {
      for (const m of ms) {
        for (const n of m.addedNodes) if (n.nodeType === 1 && n.hasAttribute('data-cinematic')) {
          log('overlay+');
          const v = n.querySelector('video');
          for (const ev of ['loadedmetadata', 'play', 'playing', 'ended', 'error', 'pause', 'stalled']) v?.addEventListener(ev, () => log(`video:${ev}${ev === 'error' ? ' code=' + v.error?.code : ''}`));
        }
        for (const n of m.removedNodes) if (n.nodeType === 1 && n.hasAttribute?.('data-cinematic')) log('overlay-');
      }
    }).observe(document.documentElement, { childList: true, subtree: true });
    const iv = setInterval(() => { if (window.__rainbow?.ready === true) { log('game ready'); clearInterval(iv); } }, 20);
  });
  const t = Date.now();
  await page.goto(`${vite.url}/?seed=7&dpr=1${q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const readyMs = Date.now() - t;
  await page.waitForTimeout(6000);
  results.push({ tag, readyMsFromGoto: readyMs, timeline: await page.evaluate(() => window.__probe) });
  await page.close();
}
console.log(JSON.stringify(results, null, 1));
await browser.close();
vite.stop?.(); vite.close?.(); vite.kill?.();
process.exit(0);
