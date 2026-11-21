#!/usr/bin/env node
// Benny r25 (benny-character-artist, read-only QA): a SHORT uninterrupted real-gameplay swim clip of one screen, from its
// checkpoint, with Benny's projected screen box logged per frame (for a Benny-centred close-up clip). Copy of the lead's
// tools/lead23/screen_clip.mjs (same Vite set-up, same per-frame stepping: real game speed, one frame per 1/24 s of game
// time, shader clock pinned to the clip clock) with time-based steering so every clip of the same length has the same
// timing: straight 0-1.5 s, LEFT 1.5-3.0 s, RIGHT 3.0-4.5 s, straight after.
//   cd <worktree> && AUDIT_PORT=5279 node tools/benny25/swim_clip_c.mjs <screen 04..08> <outDir> "<query>" [seconds=6] [startFrac=0]
// -> <outDir>/f/0000.png ... + <outDir>/frames.json (per frame: t, stage, s, lat, phase, box). Label: tools/benny25/label_clip_c.py
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
const [SCREEN, OUT, Q = '', SECS = '6', START = '0'] = process.argv.slice(2);
const fps = 24;
const nFrames = Math.round(Number(SECS) * fps);
mkdirSync(`${OUT}/f`, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5279));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 600000 });
  const rng = await page.evaluate(([id, f]) => {
    const r = window.__rainbow; r.goto(id); const g = r.course.stage(id); const s0 = r.state().s;
    const tS = s0 + f * (g.s1 - s0); let k = 0; while (r.state().s < tS && k < 6000) { r.step(1); k++; }
    return { s0, s1: g.s1, sStart: r.state().s };
  }, [SCREEN, Number(START)]);
  for (let i = 0; i < nFrames; i++) {
    const t = i / fps;
    const dir = t < 1.5 ? null : t < 3.0 ? -1 : t < 4.5 ? 1 : null;
    const phase = t < 1.5 ? 'swimming straight' : t < 3.0 ? 'steering LEFT' : t < 4.5 ? 'steering RIGHT' : 'swimming straight';
    const st = await page.evaluate(([t, dt, dir]) => {
      const _pn = performance.now; performance.now = () => (t + dt) * 1000;
      const R = window.__rainbow; R.setSteer(dir); R.freezeAt(t); R.step(Math.round(dt * 60), 1 / 60); R.freezeAt(t + dt); R.step(1, 1e-4); R.drawList();
      performance.now = _pn;
      let box = null; try { box = window.__b20?.screenBox?.(R.camera()) ?? null; } catch (e) { box = null; }
      return { ...R.state(), box };
    }, [12 + t, 1 / fps, dir]);
    await page.screenshot({ path: `${OUT}/f/${String(i).padStart(4, '0')}.png`, timeout: 600000 });
    log.push({ i, t: +t.toFixed(3), stage: st.stage, s: st.s, lat: st.lat, phase: st.stage === SCREEN ? phase : `${phase} (screen ${st.stage})`, box: st.box });
    if (i % 24 === 0) console.log('frame', i, 'stage', st.stage, 's', st.s, 'lat', st.lat);
  }
  writeFileSync(`${OUT}/frames.json`, JSON.stringify({ screen: SCREEN, fps, ...rng, query: Q, frames: log }, null, 1));
  console.log('frames', log.length, 'seconds', (log.length / fps).toFixed(2));
} finally {
  await browser.close();
  await vite.close?.();
}
