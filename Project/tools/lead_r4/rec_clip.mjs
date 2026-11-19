// Frame-exact gameplay recorder (scratch tool; read-only for the game). Run with cwd = a worktree root.
// usage: node rec.mjs <stageId> <query> <outDir> <port> <maxSec> <extraSec>
// From the stage's approved-view checkpoint, Benny rides forward with natural coin-seeking steering, then steers left,
// then right, then seeks coins again. Each video frame = exactly 1/30 s of game time (2 sim steps of 1/60 s), then one
// real render + screenshot — smooth regardless of how slow software WebGL renders.
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const [id, Q, OUT, PORT, MAXS, EXTRA] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(process.cwd() + '/scripts/lib/pw.mjs').href);
const { chromium } = loadPlaywright();
const vite = await startVite(+PORT);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = { id, Q, frames: [], errors: [] };
const t0 = Date.now();
try {
  const page = await browser.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => log.errors.push(e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const plan = await page.evaluate(([id, maxS, extra]) => {
    const r = window.__rainbow; r.goto(id); r.unfreeze(); r.drawList();
    const st = r.state(), sg = r.course.stage(id);
    const T = Math.min(maxS, Math.max(2, (sg.s1 - st.s) / sg.speed + extra));
    return { s: st.s, s1: sg.s1, speed: sg.speed, T, N: Math.round(T * 30) };
  }, [id, +MAXS, +EXTRA]);
  log.plan = plan;
  await page.screenshot({ path: `${OUT}/f0000.png` });
  for (let i = 1; i <= plan.N; i++) {
    const st = await page.evaluate(([i, N]) => {
      const r = window.__rainbow, p = i / N, s = r.state();
      let steer;
      if (p < 0.3 || p >= 0.8) { const next = r.coinDefs().find((d) => !d.taken && d.s > s.s + 0.5 && d.s < s.s + 12); steer = Math.max(-1, Math.min(1, ((next ? next.lat : 0) - s.lat) * 0.9)); }
      else steer = p < 0.55 ? -0.85 : 0.85;
      r.setSteer(steer); r.step(2, 1 / 60); r.drawList();
      return { ...r.state(), steer: +steer.toFixed(2) };
    }, [i, plan.N]);
    await page.screenshot({ path: `${OUT}/f${String(i).padStart(4, '0')}.png` });
    log.frames.push({ i, s: st.s, lat: st.lat, stage: st.stage, coins: st.coins, steer: st.steer, mode: st.mode });
    if (st.mode !== 'ride') break;
  }
} finally {
  log.seconds = (Date.now() - t0) / 1000;
  writeFileSync(`${OUT}/rec.json`, JSON.stringify(log, null, 1));
  await browser.close(); await vite.close?.();
}
console.log(JSON.stringify({ id, frames: log.frames.length + 1, plan: log.plan, sec: log.seconds, errors: log.errors.slice(0, 3) }));
