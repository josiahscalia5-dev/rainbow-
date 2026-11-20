import { loadPlaywright, CHROMIUM_ARGS, startVite } from '/home/user/rainbow-/scripts/lib/pw.mjs';
const clip = 'node_modules/.rainbow-test/flow_test.webm';
const { chromium } = loadPlaywright();
const vite = await startVite(5233);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
console.log('chromium', browser.version());
for (const [tag, q] of [['D', `&introVideo=/${clip}`], ['A', `&flowplan=1&introVideo=/${clip}`]]) {
  const page = await browser.newPage({ viewport: { width: 432, height: 768 } });
  page.on('console', (m) => { if (/video|cinematic|error/i.test(m.text())) console.log(tag, 'console:', m.text().slice(0, 200)); });
  page.on('requestfinished', (r) => { if (r.url().includes('flow_test')) console.log(tag, 'request ok', r.url().slice(-40)); });
  page.on('requestfailed', (r) => { if (r.url().includes('flow_test')) console.log(tag, 'request FAILED', r.failure()?.errorText); });
  const t0 = Date.now();
  await page.goto(`${vite.url}/?seed=7&dpr=1${q}`);
  let last = '';
  while (Date.now() - t0 < 12000) {
    const snap = await page.evaluate(() => {
      const w = document.querySelector('[data-cinematic]'); const v = w?.querySelector('video');
      const st = window.__rainbow?.ready ? window.__rainbow.state() : null;
      return JSON.stringify({ ready: !!window.__rainbow?.ready, overlay: !!w, op: w?.style.opacity, v: v ? { rs: v.readyState, t: +v.currentTime.toFixed(2), dur: v.duration, ended: v.ended, paused: v.paused, err: v.error?.code ?? null } : null, mode: st?.mode, stage: st?.stage, paused: st?.paused, s: st ? +st.s.toFixed(2) : null });
    }).catch((e) => 'eval-error ' + e.message.slice(0, 80));
    if (snap !== last) { console.log(tag, String(Date.now() - t0).padStart(6), snap); last = snap; }
    await new Promise((r) => setTimeout(r, 50));
  }
  await page.close();
}
await browser.close();
process.exit(0);
