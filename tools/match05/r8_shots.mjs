// Screen 05 round 8: the lead's motion_audit (tools/lead_r6/motion_audit.mjs) with a shot filter + per-shot probes
// (coin screen sizes, Benny's screen box). Same shot list / same simulation stepping as the audit, so a shot taken here
// equals the audit frame of the same name. Run from the checkout:
//   node tools/match05/r8_shots.mjs <outDir> "<query>" [name,name,...|all] [port]
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
import { realpathSync, mkdirSync as mk, rmSync, readFileSync } from 'node:fs';
// own dev server: node_modules is a symlink into the lead checkout in this worktree, so Vite's default fs allow list
// refused the HUD font (fallback font in the HUD). Same render-slot protocol as scripts/lib/pw.mjs.
async function startVite(port) {
  const slots = Math.max(1, Number(process.env.RAINBOW_RENDER_SLOTS ?? 2));
  const alive = (pid) => { try { process.kill(pid, 0); return true; } catch { return false; } };
  let free = () => {};
  const t0 = Date.now();
  outer: for (;;) {
    for (let i = 0; i < slots; i++) {
      const dir = `/tmp/rainbow-render-slot-${i}`;
      try { mk(dir); writeFileSync(`${dir}/pid`, String(process.pid)); free = () => { try { rmSync(dir, { recursive: true, force: true }); } catch { /* */ } }; process.on('exit', free); break outer; } catch {
        let pid = NaN; try { pid = Number(readFileSync(`${dir}/pid`, 'utf8')); } catch { /* */ }
        if (Number.isFinite(pid) && !alive(pid)) { try { rmSync(dir, { recursive: true, force: true }); } catch { /* */ } }
      }
    }
    if (Date.now() - t0 > 40 * 60 * 1000) break;
    await new Promise((r) => setTimeout(r, 1500));
  }
  const { createServer } = await import('vite');
  const server = await createServer({ server: { port, strictPort: false, host: '127.0.0.1', hmr: false, watch: { ignored: ['**/*'] }, fs: { allow: [process.cwd(), realpathSync(`${process.cwd()}/node_modules`)] } }, logLevel: 'error' });
  await server.listen();
  const addr = server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${port}/`;
  return { url: addr.replace(/\/$/, ''), close: async () => { try { await server.close(); } finally { free(); } } };
}
const [OUT, Q = '', ONLY = 'all', PORT = '5291'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(PORT));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
const ALL = [
  ['a00_approved_view', 0, null],
  ['f03_forward3u', 3, null], ['f06_forward6u', 6, null], ['f10_forward10u', 10, null], ['f20_forward20u', 20, null],
  ['s_left_steer', 6, -1], ['s_right_steer', 6, 1], ['s_left_hard', 12, -1], ['s_right_hard', 12, 1],
  ['t33_through_screen', 't0.33', null], ['t66_through_screen', 't0.66', null], ['t95_through_screen', 't0.95', null],
];
const want = ONLY === 'all' ? null : new Set(ONLY.split(','));
const SHOTS = want ? ALL.filter(([n]) => want.has(n)) : ALL;
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('console', m.text()); });
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  for (const [name, dist, steer] of SHOTS) {
    const st = await page.evaluate(async ([id, dist, steer]) => {
      const r = window.__rainbow; r.goto(id);
      const s0 = r.state().s;
      const stg = r.course.stage(id);
      const s1 = stg.s1 ?? (stg.s0 + (stg.length ?? 0));
      const target = typeof dist === 'string' ? s0 + Number(dist.slice(1)) * Math.max(0, s1 - s0) : s0 + dist;
      r.setSteer(steer);
      let n = 0; while (r.state().s < target - 1e-3 && n < 4000) { r.step(1); n++; }
      r.setSteer(null);
      r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
      return { ...r.state(), frames: n, s0, s1, target, coinsOnScreen: r.coinScreen(), benny: r.bennyScreen() };
    }, ['05', dist, steer]);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    log.push({ name, dist, steer, ...st });
    const big = st.coinsOnScreen.filter((c) => c.d > 60).map((c) => `#${c.i}@${c.x},${c.y} d${c.d}`).join(' ');
    console.log(name, 's', st.s, 'lat', st.lat, 'coins', st.coins, 'benny', st.benny.x, st.benny.y, 'big coins:', big || '-');
  }
} finally {
  writeFileSync(`${OUT}/shots.json`, JSON.stringify({ query: Q, shots: log }, null, 1));
  await browser.close(); await vite.close?.();
}
