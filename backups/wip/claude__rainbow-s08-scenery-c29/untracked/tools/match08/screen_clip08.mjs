#!/usr/bin/env node
// Screen 08 r23 (QA only): copy of tools/lead23/screen_clip.mjs whose dev server also serves the symlinked node_modules (HUD fonts).
// Lead r23: uninterrupted REAL-GAMEPLAY clip of one whole playable screen (entrance -> end, into the next screen), with the
// steering phase and the screen logged per frame (for labels). Real game speed: one frame per 1/24 s of game time.
// Steering by the share of the screen travelled: straight < 0.30, LEFT 0.30-0.50, RIGHT 0.50-0.70, straight after (end).
// The shader clock follows the clip clock (performance.now pinned per frame), so the water moves at its normal speed.
//   cd <worktree> && AUDIT_PORT=5290 node /home/user/rainbow-/tools/lead23/screen_clip.mjs <screen 04..08> <outDir> "<query>" [tailSecs]
import { mkdirSync, writeFileSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
// worktrees link node_modules to the main checkout: allow Vite to serve it too, else the HUD fonts fall back (s06 r23 fix)
async function startVite(port) {
  const { createServer, searchForWorkspaceRoot } = await import(pathToFileURL(`${process.cwd()}/node_modules/vite/dist/node/index.js`).href);
  const root = process.cwd();
  const server = await createServer({ server: { port, strictPort: false, host: '127.0.0.1', hmr: false, watch: { ignored: ['**/*'] },
    fs: { allow: [searchForWorkspaceRoot(root), realpathSync(`${root}/node_modules`)] } }, logLevel: 'error' });
  await server.listen();
  return { url: (server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${port}/`).replace(/\/$/, ''), close: () => server.close() };
}
const [SCREEN, OUT, Q = '', TAIL = '0.6'] = process.argv.slice(2);
const fps = 24;
mkdirSync(`${OUT}/f`, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5290));
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
    const st = await page.evaluate(([t, dt, dir]) => { const _pn = performance.now; performance.now = () => (t + dt) * 1000; const R = window.__rainbow; R.setSteer(dir); R.freezeAt(t); R.step(Math.round(dt * 60), 1 / 60); R.freezeAt(t + dt); R.step(1, 1e-4); R.drawList(); performance.now = _pn; return R.state(); }, [12 + i / fps, 1 / fps, dir]);
    await page.screenshot({ path: `${OUT}/f/${String(i).padStart(4, '0')}.png`, timeout: 600000 });
    log.push({ i, t: +(i / fps).toFixed(3), stage: st.stage, s: st.s, lat: st.lat, frac: +frac.toFixed(3), phase: st.stage === SCREEN ? phase : `next screen ${st.stage}` });
    if (st.stage !== SCREEN && --tailLeft <= 0) break;
  }
  writeFileSync(`${OUT}/frames.json`, JSON.stringify({ screen: SCREEN, fps, s0: rng.s0, s1: rng.s1, query: Q, frames: log }, null, 1));
  console.log('frames', log.length, 'seconds', (log.length / fps).toFixed(2));
} finally {
  await browser.close();
  await vite.close?.();
}
