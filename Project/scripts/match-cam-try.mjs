#!/usr/bin/env node
// Any screen: try camera framings at a checkpoint WITHOUT changing the game: overrides STAGE_CAM[stage] (and optionally
// the checkpoint position along the river) in the running page, captures the locked checkpoint frame for each candidate.
//   node scripts/match-cam-try.mjs --id=06 --out=DIR --cands='[{"back":8,"up":4.5,"ahead":16,"lookUp":-1,"fov":62},...]'
//        [--q='extra=1'] [--ds=0]   (ds: shift the checkpoint along the river, units)
// Writes DIR/cand_<i>.png and DIR/cands.json. Read-only: the source files are not touched.
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const opt = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const [k, ...r] = a.slice(2).split('='); return [k, r.length ? r.join('=') : true]; }));
const ID = String(opt.id ?? '06');
const OUT = typeof opt.out === 'string' ? opt.out : `qa/match/${ID}/cam`;
const CANDS = JSON.parse(typeof opt.cands === 'string' ? opt.cands : '[{}]');
const Q = typeof opt.q === 'string' ? opt.q : '';
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5251);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: ID === '03' ? 727 : 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  for (let i = 0; i < CANDS.length; i++) {
    const res = await page.evaluate(async ([id, cand]) => {
      const { STAGE_CAM } = await import('/src/game/cameraRig.ts');
      window.__camBase ??= JSON.parse(JSON.stringify(STAGE_CAM[id]));
      STAGE_CAM[id] = { ...window.__camBase, ...cand };
      return window.__rainbow.goto(id);
    }, [ID, CANDS[i]]);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => r())));
    await page.waitForTimeout(200);
    const file = `${OUT}/cand_${String(i).padStart(2, '0')}.png`;
    await page.screenshot({ path: file });
    const cam = await page.evaluate(() => window.__rainbow.camera?.());
    log.push({ i, cand: CANDS[i], file, cam, checkpoint: res });
    console.log(i, JSON.stringify(CANDS[i]), '→', file);
  }
} finally {
  writeFileSync(`${OUT}/cands.json`, JSON.stringify(log, null, 1));
  await browser.close();
  await vite.close();
}
