#!/usr/bin/env node
// r24 s07 (QA only): a SEGMENT of the lead's labelled-clip run (tools/lead23/screen_clip.mjs: same steering schedule by the share
// of the screen travelled — straight < 0.30, LEFT 0.30–0.50, RIGHT 0.50–0.70, straight after — same per-frame stepping and pinned
// shader clock), but it records only from game time tFrom to tTo (seconds of the clip), at FPS frames per second of game time and
// at a smaller viewport (same 9:16 framing) for quick framing iterations. The frames before tFrom are simulated at 24 fps exactly
// like the full clip, so camera smoothing / steering state are identical to the full clip at the same t.
//   cd <tree> && SEG_PORT=5280 node tools/match07/seg_clip_r24.mjs <outDir> "<query>" <tFrom> <tTo> [fps=12] [width=432]
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
const [OUT, Q = '', T0 = '0', T1 = '9', FPS = '12', WID = '432'] = process.argv.slice(2);
const SCREEN = '07', fps = 24, every = Math.max(1, Math.round(fps / Number(FPS))), W = Number(WID), H = Math.round((W * 16) / 9);
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.SEG_PORT ?? 5280));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 600000 });
  const rng = await page.evaluate((id) => { const r = window.__rainbow; r.goto(id); const g = r.course.stage(id); return { s0: r.state().s, s1: g.s1 }; }, SCREEN);
  for (let i = 0; i < 2400; i++) {
    const t = i / fps;
    if (t > Number(T1) + 1e-6) break;
    const rec = t >= Number(T0) - 1e-6 && i % every === 0;
    const st = await page.evaluate(([t, dt, rng, draw]) => {
      const R = window.__rainbow;
      const frac = (R.state().s - rng.s0) / (rng.s1 - rng.s0);
      const dir = frac < 0.3 ? null : frac < 0.5 ? -1 : frac < 0.7 ? 1 : null;
      const _pn = performance.now; performance.now = () => (t + dt) * 1000;
      R.setSteer(dir); R.freezeAt(t); R.step(Math.round(dt * 60), 1 / 60); R.freezeAt(t + dt); R.step(1, 1e-4);
      R.drawList(); // every frame, like the full clip tool (identical state)
      performance.now = _pn;
      return { ...R.state(), frac, dir };
    }, [12 + i / fps, 1 / fps, rng, rec]);
    if (rec) {
      await page.screenshot({ path: `${OUT}/${String(i).padStart(4, '0')}.png`, timeout: 600000 });
      log.push({ i, t: +t.toFixed(3), s: st.s, lat: st.lat, stage: st.stage, frac: +st.frac.toFixed(3), steer: st.dir, cam: st.cam });
    }
    if (st.stage !== SCREEN && t > Number(T1)) break;
  }
  writeFileSync(`${OUT}/frames.json`, JSON.stringify({ query: Q, fps, every, frames: log }, null, 1));
  console.log('frames', log.length);
} finally { await browser.close(); await vite.close?.(); }
