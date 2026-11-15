#!/usr/bin/env node
// Edge-to-edge check of the REAL running game on Android portrait aspect ratios.
//   node scripts/aspect-test.mjs                 → qa/aspect/<device>_<stage>.png + qa/aspect/aspect_report.json
//   node scripts/aspect-test.mjs 05 11           → only those checkpoints
//   node scripts/aspect-test.mjs --out=DIR
// Per device it verifies: the canvas covers the whole viewport (no bars / borders), no edge row or
// column is a flat empty colour, the HUD bar is fully inside the screen below the top safe inset,
// and it reports the horizontal / vertical field of view so cropping of the 9:16 composition is visible.
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const args = process.argv.slice(2);
const opt = Object.fromEntries(args.filter((a) => a.startsWith('--')).map((a) => { const [k, v] = a.slice(2).split('='); return [k, v ?? true]; }));
let stages = args.filter((a) => !a.startsWith('--'));
if (!stages.length) stages = ['05', '11'];
const outDir = typeof opt.out === 'string' ? opt.out : 'qa/aspect';
mkdirSync(outDir, { recursive: true });

// CSS-pixel portrait viewports of common Android devices (+ the 9:16 reference frame)
const DEVICES = [
  { id: 'ref_9x16', w: 432, h: 768, note: '9:16 reference composition (864x1536 / 2)' },
  { id: '18x9_360x720', w: 360, h: 720, note: '18:9 older phones' },
  { id: '19.5x9_393x851', w: 393, h: 851, note: '19.5:9 Pixel 4a/5 class' },
  { id: '20x9_412x915', w: 412, h: 915, note: '20:9 Pixel 7 / Galaxy S2x class' },
  { id: '21x9_411x960', w: 411, h: 960, note: '21:9 Xperia 1 class (tallest)' },
  { id: 'tab_10x16_800x1280', w: 800, h: 1280, note: '10:16 Android tablet portrait' },
  { id: 'fold_inner_673x841', w: 673, h: 841, note: 'foldable inner screen (near square)' },
];

const { chromium } = loadPlaywright();
const vite = await startVite(5231);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const report = { when: new Date().toISOString(), devices: [], errors: [] };
try {
  for (const d of DEVICES) {
    for (const st of stages) {
      const page = await browser.newPage({ viewport: { width: d.w, height: d.h }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
      page.on('pageerror', (e) => report.errors.push(`[${d.id} ${st}] ${e.message}`));
      await page.goto(`${vite.url}/?qa=1&dpr=1`);
      await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
      await page.evaluate((cid) => window.__rainbow.goto(cid), st);
      await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(250);
      const file = `${outDir}/${d.id}_${st}.png`;
      await page.screenshot({ path: file });
      const m = await page.evaluate(() => {
        const c = document.querySelector('canvas#scene').getBoundingClientRect();
        const bar = document.querySelector('#hud .bar')?.getBoundingClientRect();
        const cam = window.__rainbow.camera?.() ?? null;
        return { vw: innerWidth, vh: innerHeight, canvas: [c.left, c.top, c.width, c.height],
          hudBar: bar && bar.width ? [bar.left, bar.top, bar.width, bar.height] : null, cam };
      });
      // edge analysis on the screenshot pixels (flat rows/cols = bars or empty borders)
      const edges = await page.evaluate(async (src) => {
        const img = new Image(); img.src = src; await img.decode();
        const cv = new OffscreenCanvas(img.width, img.height); const g = cv.getContext('2d'); g.drawImage(img, 0, 0);
        const px = g.getImageData(0, 0, img.width, img.height).data;
        const stdOf = (xs) => { const n = xs.length / 3; let s = [0, 0, 0], q = [0, 0, 0];
          for (let i = 0; i < xs.length; i += 3) for (let k = 0; k < 3; k++) { s[k] += xs[i + k]; q[k] += xs[i + k] ** 2; }
          return Math.max(...s.map((v, k) => Math.sqrt(Math.max(0, q[k] / n - (v / n) ** 2)))); };
        const line = (x0, y0, dx, dy, n) => { const o = []; for (let i = 0; i < n; i++) { const j = ((y0 + dy * i) * img.width + (x0 + dx * i)) * 4; o.push(px[j], px[j + 1], px[j + 2]); } return o; };
        return { top: stdOf(line(0, 0, 1, 0, img.width)), bottom: stdOf(line(0, img.height - 1, 1, 0, img.width)),
          left: stdOf(line(0, 0, 0, 1, img.height)), right: stdOf(line(img.width - 1, 0, 0, 1, img.height)) };
      }, `data:image/png;base64,${(await page.screenshot()).toString('base64')}`);
      const fullCover = Math.abs(m.canvas[0]) < 1 && Math.abs(m.canvas[1]) < 1 && Math.abs(m.canvas[2] - m.vw) < 1 && Math.abs(m.canvas[3] - m.vh) < 1;
      const flatEdges = Object.entries(edges).filter(([, s]) => s < 2).map(([k]) => k);
      const hudInside = m.hudBar ? m.hudBar[0] >= 0 && m.hudBar[0] + m.hudBar[2] <= m.vw && m.hudBar[1] >= 0 : null;
      const row = { device: d.id, note: d.note, stage: st, file, aspect: +(d.w / d.h).toFixed(4), fullCover, flatEdges, edgeStd: edges, hudInside, hudBar: m.hudBar, cam: m.cam };
      report.devices.push(row);
      console.log(`${d.id.padEnd(22)} ${st} cover=${fullCover} flatEdges=[${flatEdges}] hud=${hudInside} ${m.cam ? `vfov=${m.cam.vfov?.toFixed(1)} hfov=${m.cam.hfov?.toFixed(1)}` : ''}`);
      await page.close();
    }
  }
} finally {
  writeFileSync(`${outDir}/aspect_report.json`, JSON.stringify(report, null, 2));
  await browser.close();
  await vite.close();
}
const bad = report.devices.filter((r) => !r.fullCover || r.flatEdges.length || r.hudInside === false);
console.log(bad.length ? `FAIL: ${bad.length} device/stage combos have bars, flat edges or HUD overflow` : 'PASS: every device fills edge to edge');
process.exit(bad.length ? 1 : 0);
