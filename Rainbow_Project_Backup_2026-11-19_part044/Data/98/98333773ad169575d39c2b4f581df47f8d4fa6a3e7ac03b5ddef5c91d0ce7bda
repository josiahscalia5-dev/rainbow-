// Screen 06 round 16: deterministic START-VIEW capture for the "approved start view unchanged" check.
// The lead's motion-audit shot runs the live game for two animation frames after goto (real time: under CPU load the
// start view lands at a slightly different s each run), and the 06 water clock is performance.now(). Here the page clock
// is frozen, the game is NOT run: goto('06') renders the checkpoint itself, then one more render with the frozen clock.
//   node tools/match06/r16_start.mjs <outDir> name1 "<query1>" [name2 "<query2>" ...]
// name@D (e.g. BEFORE@1.1): first ride D u forward from the checkpoint with fixed 1/60 s simulation steps (no steering)
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [OUT, ...rest] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5276);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  for (let i = 0; i + 1 < rest.length; i += 2) {
    const [name, Q] = [rest[i], rest[i + 1]];
    const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => console.error('pageerror', e.message));
    await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
    await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
    const D = name.includes('@') ? Number(name.split('@')[1]) : 0;
    const st = await page.evaluate((D) => {
      performance.now = () => 50000;
      const r = window.__rainbow; r.run(false); r.goto('06');
      const s0 = r.state().s; let n = 0;
      while (D > 0 && r.state().s < s0 + D - 1e-3 && n < 4000) { r.step(1); n++; }
      r.freezeAt(12); r.drawList();
      return r.state();
    }, D);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    console.log(name, 's', st.s, 'cam', st.cam.join(','), 'coins', st.coins);
    await page.close();
  }
} finally {
  await browser.close(); await vite.close?.();
}
