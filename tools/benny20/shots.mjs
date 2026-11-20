// benny-character-artist r19b (read-only shot tool): from a screen checkpoint ride forward / steer with the real game sim and
// screenshot what the live camera sees (same method as tools/match04/motion04.mjs, any screen, own port 5278).
//   node tools/benny20/shots.mjs <outDir> "<query>"   env B20_SHOTS='[["name","04",dist,steer],...]'
import { mkdirSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const OUT = process.argv[2]; const Q = process.argv[3] ?? '';
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.B20_PORT ?? 5278));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error('console', m.type(), m.text().slice(0, 200)); });
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const shots = process.env.B20_SHOTS ? JSON.parse(process.env.B20_SHOTS)
    : [['f00_start_view', '04', 0, null], ['f03_forward3u', '04', 3, null], ['f06_forward6u', '04', 6, null], ['s_left_steer', '04', 6, -1], ['s_right_steer', '04', 6, 1]];
  for (const [name, scr, dist, steer] of shots) {
    const st = await page.evaluate(async ([scr, dist, steer]) => {
      const r = window.__rainbow; r.goto(scr); const s0 = r.state().s; r.setSteer(steer);
      let k = 0; while (r.state().s < s0 + dist && k < 2000) { r.step(1); k++; }
      r.setSteer(null);
      r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
      return { ...r.state(), frames: k };
    }, [scr, dist, steer]);
    await page.waitForTimeout(150);
    await page.screenshot({ path: `${OUT}/${name}.png` });
    if (process.env.B20_MASK) {
      // flat part-colour mask of Benny alone (white background): fur red, pom green, crown cyan, cuff blue, star black
      await page.evaluate(() => {
        const { scene, camera, renderer } = window.__rainbow.qa3d();
        const benny = scene.getObjectByName('Benny');
        const keep = new Set(); for (let o = benny; o; o = o.parent) keep.add(o);
        const vis = [];
        scene.traverse((o) => { if (o === scene || keep.has(o)) return; let inB = false; for (let p = o.parent; p; p = p.parent) if (p === benny) { inB = true; break; } if (inB) return; vis.push([o, o.visible]); if (!o.isLight) o.visible = false; });
        const bg = scene.background; scene.background = null;
        let Ctor; scene.traverse((o) => { if (!Ctor && o.material?.color) Ctor = o.material.color.constructor; }); const cc = renderer.getClearColor(new Ctor()); const ca = renderer.getClearAlpha();
        window.__bennyQA.mask(true);
        renderer.setClearColor(0xffffff, 1); renderer.setRenderTarget(null); renderer.clear(); renderer.render(scene, camera);
        window.__b20restore = () => { window.__bennyQA.mask(false); for (const [o, v] of vis) o.visible = v; scene.background = bg; renderer.setClearColor(cc, ca); };
      });
      await page.screenshot({ path: `${OUT}/${name}_mask.png` });
      await page.evaluate(() => { window.__b20restore(); });
    }
    log.push({ name, scr, dist, steer, frames: st.frames, s: st.s, lat: st.lat, stage: st.stage, coins: st.coins });
    console.log(name, scr, 's', st.s, 'lat', st.lat, st.stage, 'coins', st.coins);
  }
} finally { writeFileSync(`${OUT}/${process.env.B20_LOG ?? 'shots.json'}`, JSON.stringify(log, null, 1)); await browser.close(); await vite.close?.(); }
