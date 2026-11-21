// Benny r28 step 3 probe (read-only QA): 06 star colour along the start of Screen 06. Loads the game ONCE, visits several
// positions (05 end → 06 entry, 06 checkpoint +0/+5/+10/+17 m) and renders star-colour variants (felt base × multiplier) per position.
//   cd /home/user/wt/benny && node probe06.mjs <outDir> "<query>"
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [OUT, Q] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const POS = JSON.parse(process.env.POS ?? '[["p02","05",2],["p10","06",0],["p15","06",5],["p20","06",10],["p27","06",16.87]]');
const VAR = JSON.parse(process.env.VAR ?? '[["cur",[0.9,1.2,0.55]],["g145",[0.9,1.45,0.55]],["g160",[0.9,1.6,0.55]],["g175",[0.9,1.75,0.6]]]');
const { chromium } = loadPlaywright();
const vite = await startVite(5279);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 600000 });
  for (const [pn, cp, dist] of POS) {
    const st = await page.evaluate(([cp, dist]) => {
      const r = window.__rainbow; r.goto(cp);
      let k = 0;
      if (cp === '05') { while (r.state().stage !== '06' && k < 20000) { r.step(1); k++; } }
      const s0 = r.state().s;
      while (r.state().s < s0 + dist && k < 30000) { r.step(1); k++; }
      r.freezeAt(10);
      return { ...r.state(), s06: r.course.stage('06').s0, s06e: r.course.stage('06').s1 };
    }, [cp, dist]);
    for (const [vn, m] of VAR) {
      const box = await page.evaluate(async (m) => {
        const B = window.__b20, R = window.__rainbow, x = B.starX;
        x.m.color.setRGB(x.base.r * m[0], x.base.g * m[1], x.base.b * m[2]);
        R.drawList();
        await new Promise((res) => requestAnimationFrame(() => res()));
        try { return B.screenBox(R.camera()); } catch { return null; }
      }, m);
      const b = box && box.length === 4 ? box : [100, 600, 760, 1500];
      const clip = { x: Math.max(0, b[0] - 20), y: Math.max(0, b[1] - 20) }; clip.width = Math.min(864, b[2] + 20) - clip.x; clip.height = Math.min(1536, b[3] + 20) - clip.y;
      await page.screenshot({ path: `${OUT}/${pn}_${vn}.png`, clip, timeout: 600000 });
      log.push({ pos: pn, variant: vn, m, state: st, box, clip });
      console.log(pn, vn, st.stage, st.s, JSON.stringify(box));
    }
  }
} finally {
  writeFileSync(`${OUT}/probe.json`, JSON.stringify({ query: Q, log }, null, 1));
  await browser.close(); await vite.close?.();
}
