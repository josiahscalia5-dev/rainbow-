#!/usr/bin/env node
// r25 s04 (QA only, read-only): uninterrupted REAL-GAMEPLAY clip of the WHOLE of Screen 04 (checkpoint -> into 05 + tail).
// Copy of tools/lead23/screen_clip.mjs with two QA-only changes:
//  * fps = 20, so one frame = exactly 3 game steps of 1/60 s = 0.05 s of game time AND 0.05 s of shader clock
//    (the lead tool's 1/24 s frame rounds to 3 steps = 0.05 s, so its 24 fps "1x" plays at 1.2x). Encode 20 fps = 1.0x, 10 fps = 0.5x.
//  * per frame it logs the 3D chevrons (m04_arrow3d): how many are in view AHEAD of Benny and how many he has swum through.
// Steering by the share of the screen travelled (same as the lead tool): straight < 0.30, LEFT 0.30-0.50, RIGHT 0.50-0.70, straight.
//   cd /home/user/wt/s04 && AUDIT_PORT=5274 node <this> 04 <outDir> "<query>" [tailSecs]
import { mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
async function startVite(port) {
  const { createServer, searchForWorkspaceRoot } = await import(pathToFileURL(`${process.cwd()}/node_modules/vite/dist/node/index.js`).href);
  const root = process.cwd();
  const server = await createServer({ server: { port, strictPort: false, host: '127.0.0.1', hmr: false, watch: { ignored: ['**/*'] },
    fs: { allow: [searchForWorkspaceRoot(root), realpathSync(`${root}/node_modules`)] } }, logLevel: 'error' });
  await server.listen();
  return { url: (server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${port}/`).replace(/\/$/, ''), close: () => server.close() };
}
const [SCREEN, OUT, Q = '', TAIL = '0.6'] = process.argv.slice(2);
const fps = 20, dt = 0.05;
mkdirSync(`${OUT}/f`, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5274));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 600000 });
  const rng = await page.evaluate((id) => { const r = window.__rainbow; r.goto(id); const g = r.course.stage(id); return { s0: r.state().s, s1: g.s1 }; }, SCREEN);
  let tailLeft = Math.round(Number(TAIL) * fps);
  for (let i = 0; i < 2400; i++) {
    const st0 = await page.evaluate(() => window.__rainbow.state());
    const frac = (st0.s - rng.s0) / (rng.s1 - rng.s0);
    const dir = frac < 0.3 ? null : frac < 0.5 ? -1 : frac < 0.7 ? 1 : null;
    const phase = frac < 0.3 ? 'ENTRANCE (straight)' : frac < 0.5 ? 'MIDDLE (steering LEFT)' : frac < 0.7 ? 'MIDDLE (steering RIGHT)' : 'END (straight)';
    const st = await page.evaluate(([t, dt, dir]) => {
      const _pn = performance.now; performance.now = () => (t + dt) * 1000; const R = window.__rainbow;
      R.setSteer(dir); R.freezeAt(t); R.step(3, 1 / 60); R.freezeAt(t + dt); R.step(1, 1e-4); R.drawList(); performance.now = _pn;
      const S = R.state();
      // chevrons: distance ahead of Benny along the lane (lane-local -z) + whether drawn
      const arrows = [];
      try {
        const { scene } = R.qa3d(); const benny = scene.getObjectByName('Benny');
        if (benny) {
          const bw = benny.getWorldPosition(new (benny.position.constructor)());
          scene.traverse((o) => { if (o.name === 'm04_arrow3d' && o.parent) {
            const bl = o.parent.worldToLocal(bw.clone());
            arrows.push({ z: +o.position.z.toFixed(2), ahead: +(bl.z - o.position.z).toFixed(2), vis: o.visible, op: +(o.material.opacity ?? 0).toFixed(3) }); } });
        }
      } catch (e) { /* not on 04 */ }
      return { ...S, arrows };
    }, [12 + i * dt, dt, dir]);
    await page.screenshot({ path: `${OUT}/f/${String(i).padStart(4, '0')}.png`, timeout: 600000 });
    log.push({ i, t: +(i * dt).toFixed(3), stage: st.stage, s: st.s, lat: st.lat, frac: +frac.toFixed(3), coins: st.coins,
      phase: st.stage === SCREEN ? phase : `next screen ${st.stage}`, arrows: st.arrows });
    if (i % 10 === 0) console.log('frame', i, 'stage', st.stage, 'frac', frac.toFixed(3));
    if (st.stage !== SCREEN && --tailLeft <= 0) break;
  }
  writeFileSync(`${OUT}/frames.json`, JSON.stringify({ screen: SCREEN, fps, dt, s0: rng.s0, s1: rng.s1, query: Q, frames: log }, null, 1));
  console.log('frames', log.length, 'game seconds', (log.length * dt).toFixed(2));
} finally {
  await browser.close();
  await vite.close?.();
}
