// Frame-exact screen recorder for the user's "all screens" tour (scratch tool; read-only for the game).
// Based on tools/lead_r4/rec_clip.mjs (account 4). Run with cwd = a worktree root.
// usage: node rec_tour.mjs <stageId> <query> <outDir> <port> <seconds>
// Starts at the stage's approved-view checkpoint (window.__rainbow.goto). Ride stages: coin-seeking steering for the first
// 30 %, then steer left, then right, then coin-seeking again (shows the scenery while moving). Cinematic stages (01, 02, 11):
// the real-time cinematic simply plays. Each video frame = exactly 1/30 s of game time (2 sim steps of 1/60 s).
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const [id, Q, OUT, PORT, SECS] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(process.cwd() + '/scripts/lib/pw.mjs').href);
const { chromium } = loadPlaywright();
const vite = await startVite(+PORT);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = { id, Q, cwd: process.cwd(), frames: [], errors: [] };
const t0 = Date.now();
try {
  const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => log.errors.push(e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const err = await page.evaluate(() => window.__error);
  if (err) throw new Error(String(err));
  const N = Math.round(+SECS * 30);
  log.start = await page.evaluate((id) => { const r = window.__rainbow; r.goto(id); r.unfreeze(); r.drawList(); return r.state(); }, id);
  await page.screenshot({ path: `${OUT}/f0000.jpg`, type: 'jpeg', quality: 92 });
  for (let i = 1; i <= N; i++) {
    const st = await page.evaluate(([i, N]) => {
      const r = window.__rainbow, p = i / N, s = r.state();
      if (s.mode === 'ride') {
        let steer;
        if (p < 0.3 || p >= 0.8) { const next = r.coinDefs().find((d) => !d.taken && d.s > s.s + 0.5 && d.s < s.s + 12); steer = Math.max(-1, Math.min(1, ((next ? next.lat : 0) - s.lat) * 0.9)); }
        else steer = p < 0.55 ? -0.85 : 0.85;
        r.setSteer(steer);
      } else r.setSteer(null);
      r.step(2, 1 / 60); r.drawList();
      return r.state();
    }, [i, N]);
    await page.screenshot({ path: `${OUT}/f${String(i).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 92 });
    log.frames.push({ i, mode: st.mode, stage: st.stage, s: +st.s.toFixed(2), lat: +st.lat.toFixed(2), coins: st.coins });
  }
} catch (e) {
  log.errors.push('fatal ' + e.message);
} finally {
  log.seconds = (Date.now() - t0) / 1000;
  writeFileSync(`${OUT}/rec.json`, JSON.stringify(log, null, 1));
  await browser.close(); await vite.close?.();
}
const stages = [...new Set(log.frames.map((f) => f.stage))];
console.log(JSON.stringify({ id, frames: log.frames.length + 1, stages, sec: log.seconds, errors: log.errors.slice(0, 3) }));
process.exit(0);
