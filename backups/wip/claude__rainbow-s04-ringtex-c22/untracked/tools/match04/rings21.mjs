// Screen 04 r21 ring proof shots (read-only): DETERMINISTIC camera + shader clock, so BEFORE / AFTER line up pixel for pixel.
// The game sim is stepped a fixed way (step(1) until s >= target), the shader clock is frozen, and ONE frame is rendered
// directly (no real-time rAF steps, which made motion04's positions drift by up to ~0.25 u between runs).
// usage: node tools/match04/rings21.mjs <outDir> <query> [shots JSON]
//   shots: [[name, targetS (absolute course s) | "+d" (forward d u from the 04 checkpoint), steer|null, clockT]]
//   env M04_CLIP="n,ds,fps,steerPattern": instead of shots, n frames advancing ds u each (steer pattern: 0 / lr = left-right)
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const OUT = process.argv[2]; const Q = process.argv[3] ?? 'match04=1';
const SHOTS = process.argv[4] ? JSON.parse(process.argv[4]) : [['f06', 84.183, null, 10]];
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.M04_PORT ?? 5281));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', async (m) => { if (m.type() !== 'error') return; let t = m.text(); try { t = (await Promise.all(m.args().map((a) => a.jsonValue()))).join(' '); } catch {} const e = String(t).split('\n').filter((l) => /ERROR|rror:/.test(l)).slice(0, 8).join(' | '); console.error('console', String(t).slice(0, 100), e); if (process.env.M04_ERRLOG) (await import('node:fs')).appendFileSync(process.env.M04_ERRLOG, String(t) + '\n----\n'); });
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 240000 });
  const shoot = async (name, target, steer, clock, fromHere) => {
    const st = await page.evaluate(async ([target, steer, clock, fromHere]) => {
      const r = window.__rainbow;
      if (!fromHere) r.goto('04');
      const s0 = r.state().s;
      const tS = typeof target === 'string' ? s0 + Number(target) : target;
      r.setSteer(steer);
      let k = 0; while (r.state().s < tS && k < 4000) { r.step(1); k++; }
      r.setSteer(null);
      r.freezeAt(clock);
      r.drawList();                                  // renders exactly one frame of the current state
      await new Promise((res) => requestAnimationFrame(() => res()));
      return { ...r.state(), frames: k };
    }, [target, steer, clock, fromHere]);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    log.push({ name, target, steer, clock, s: st.s, lat: st.lat, stage: st.stage, coins: st.coins, cam: st.cam });
    console.log(name, 's', st.s, 'lat', st.lat, st.stage, 'coins', st.coins);
  };
  if (process.env.M04_CLIP) {
    // a moving view: Benny swims on from the 04 checkpoint, steering gently left / right, the water clock running
    const [n, ds, fps, pat] = process.env.M04_CLIP.split(',');
    const s0 = Number(process.env.M04_CLIP_S0 ?? 81.5);
    await shoot('c000', s0, null, 10, false);
    for (let i = 1; i < Number(n); i++) {
      const steer = pat === 'lr' ? Math.sin(i / Number(n) * Math.PI * 2) * 0.8 : null;
      await shoot(`c${String(i).padStart(3, '0')}`, s0 + i * Number(ds), steer, 10 + i / Number(fps), true);
    }
  } else {
    for (const [name, target, steer, clock] of SHOTS) await shoot(name, target, steer, clock ?? 10, false);
  }
} finally { writeFileSync(`${OUT}/shots.json`, JSON.stringify(log, null, 1)); await browser.close(); await vite.close?.(); }
