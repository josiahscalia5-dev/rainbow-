// benny-character-artist r20 (read-only QA): load the game ONCE, go to a screen checkpoint, then render many look variants
// of Benny at the same frozen frame (no sim step between variants: only the renderer runs) → <outDir>/<name>.png
// (+ <name>_mask.png with B20_MASK=1: flat part colours on white, fur red / pom green / crown cyan / cuff blue / star black).
//   node tools/benny20/probe.mjs <outDir> "<query>" <variants.json> [screen=04] [dist=0]
// variants.json: [{ "name": "v1", "js": "B.hat.scale.multiplyScalar(1.05)" }, ...] — js runs in the page with
// B = window.__b20 (benny20.ts QA handle), R = window.__rainbow; each variant starts from the previous variant's state.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const [OUT, Q = '', VJ, SCR = '04', DIST = '0'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const variants = JSON.parse(readFileSync(VJ, 'utf8'));
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.B20_PORT ?? 5278));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) console.error('console', m.text().slice(0, 300)); });
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const st = await page.evaluate(async ([scr, dist]) => {
    const r = window.__rainbow; r.goto(scr); const s0 = r.state().s;
    let k = 0; while (r.state().s < s0 + dist && k < 2000) { r.step(1); k++; }
    // deterministic frame: frozen shader / animation clock (as tools/lead_r13/swim_clip.mjs), no real-time loop
    // two normal steps first (the motion04 start view runs two real frames after goto: the camera settles on its rig)
    r.step(2); r.freezeAt(12); r.step(1, 1e-4); r.drawList();
    return r.state();
  }, [SCR, Number(DIST)]);
  console.log('at', SCR, 's', st.s);
  for (const v of variants) {
    const t0 = Date.now();
    await page.evaluate((js) => { const B = window.__b20; const R = window.__rainbow; new Function('B', 'R', js)(B, R); R.drawList(); }, v.js ?? '');
    await page.waitForTimeout(100);
    await page.screenshot({ path: `${OUT}/${v.name}.png` });
    if (process.env.B20_MASK) {
      await page.evaluate(() => {
        const { scene, camera, renderer } = window.__rainbow.qa3d();
        const benny = scene.getObjectByName('Benny');
        const keep = new Set(); for (let o = benny; o; o = o.parent) keep.add(o);
        const vis = [];
        scene.traverse((o) => { if (o === scene || keep.has(o)) return; for (let p = o.parent; p; p = p.parent) if (p === benny) return; vis.push([o, o.visible]); if (!o.isLight) o.visible = false; });
        const bg = scene.background; scene.background = null;
        let Ctor; scene.traverse((o) => { if (!Ctor && o.material?.color) Ctor = o.material.color.constructor; });
        const cc = renderer.getClearColor(new Ctor()); const ca = renderer.getClearAlpha();
        window.__bennyQA.mask(true);
        renderer.setClearColor(0xffffff, 1); renderer.setRenderTarget(null); renderer.clear(); renderer.render(scene, camera);
        window.__b20restore = () => { window.__bennyQA.mask(false); for (const [o, vv] of vis) o.visible = vv; scene.background = bg; renderer.setClearColor(cc, ca); };
      });
      await page.screenshot({ path: `${OUT}/${v.name}_mask.png` });
      await page.evaluate(() => { window.__b20restore(); window.__rainbow.drawList(); });
    }
    console.log('variant', v.name, Date.now() - t0, 'ms');
  }
  writeFileSync(`${OUT}/probe.json`, JSON.stringify({ query: Q, screen: SCR, dist: Number(DIST), s: st.s, variants }, null, 1));
} finally { await browser.close(); await vite.close?.(); }
