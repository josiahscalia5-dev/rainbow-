// Benny r23 (benny-character-artist, read-only QA): load the game ONCE at a screen checkpoint (frozen frame, as
// tools/benny20/probe.mjs) and render many knit-map variants of Benny's beanie without a reload: each variant swaps the
// crown / cuff albedo + normal images on the live b20knit materials (query must contain &benny20=1&b20knit=1) and may set
// the material colour factors / normal strengths, then runs optional js (async; B = window.__b20, R = window.__rainbow).
//   node tools/benny23/knitprobe.mjs <outDir> "<query>" <variants.json> [screen=04] [dist=0] [steer=null]
// variants.json: [{ "name": "v1", "dir": "/.cache/b23knit/v1", "ccol": [r,g,b], "rcol": [r,g,b], "kcn": 2, "kbn": 2.5,
//                   "js": "..." }]   dir = URL folder holding crown.png, crown_n.png, brim.png, brim_n.png (any subset)
// Writes <outDir>/<name>.png and <outDir>/probe.json (incl. Benny's screen box for Benny-centred crops).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from '../../scripts/lib/pw.mjs';
const [OUT, Q = '', VJ, SCR = '04', DIST = '0', STEER = 'null'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const variants = JSON.parse(readFileSync(VJ, 'utf8'));
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.B20_PORT ?? 5279));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const log = [];
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) console.error('console', m.text().slice(0, 300)); });
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  const st = await page.evaluate(async ([scr, dist, steer]) => {
    const r = window.__rainbow; r.goto(scr); const s0 = r.state().s;
    if (steer !== null) r.setSteer(steer);
    let k = 0; while (r.state().s < s0 + dist && k < 4000) { r.step(1); k++; }
    r.setSteer(null);
    r.step(2); r.freezeAt(12); r.step(1, 1e-4); r.drawList();
    return r.state();
  }, [SCR, Number(DIST), JSON.parse(STEER)]);
  console.log('at', SCR, 's', st.s);
  for (const v of variants) {
    const t0 = Date.now();
    const box = await page.evaluate(async (v) => {
      const B = window.__b20; const R = window.__rainbow;
      const img = async (url) => { const i = new Image(); i.src = url + '?t=' + Date.now(); await i.decode(); return i; };
      const set = async (mesh, file, prop) => {
        const m = B.scene.getObjectByName(mesh)?.material;
        if (!m || !m[prop]) return;
        try { m[prop].image = await img(`${v.dir}/${file}`); m[prop].needsUpdate = true; } catch { /* file absent: keep */ }
      };
      if (v.dir) {
        await set('hat_crown', 'crown.png', 'map'); await set('hat_crown', 'crown_n.png', 'normalMap');
        await set('hat_brim', 'brim.png', 'map'); await set('hat_brim', 'brim_n.png', 'normalMap');
      }
      // star (r23 step 3): sdir = URL folder with star.png / star_n.png; scol = colour factor; se = emissive intensity;
      // sem = emissive colour; sns = normal strength; srough = roughness
      const smat = B.scene.getObjectByName('hat_star')?.material;
      if (smat && v.sdir) {
        if (smat.map) { try { smat.map.image = await img(`${v.sdir}/star.png`); smat.map.needsUpdate = true; } catch {} }
        if (smat.normalMap) { try { smat.normalMap.image = await img(`${v.sdir}/star_n.png`); smat.normalMap.needsUpdate = true; } catch {} }
      }
      if (smat) {
        if (v.scol) smat.color.setRGB(...v.scol);
        if (v.se !== undefined) smat.emissiveIntensity = v.se;
        if (v.sem) smat.emissive.setRGB(...v.sem);
        if (v.sns !== undefined) smat.normalScale.setScalar(v.sns);
        if (v.srough !== undefined) smat.roughness = v.srough;
      }
      const cm = B.scene.getObjectByName('hat_crown')?.material, bm = B.scene.getObjectByName('hat_brim')?.material;
      if (v.ccol && cm) cm.color.setRGB(...v.ccol);
      if (v.rcol && bm) bm.color.setRGB(...v.rcol);
      if (v.kcn !== undefined && cm) cm.normalScale.setScalar(v.kcn);
      if (v.kbn !== undefined && bm) bm.normalScale.setScalar(v.kbn);
      if (v.js) await new Function('B', 'R', `return (async () => { ${v.js} })()`)(B, R);
      R.drawList();
      await new Promise((res) => requestAnimationFrame(() => res()));
      try { return B.screenBox(R.camera()); } catch { return null; }
    }, v);
    await page.waitForTimeout(100);
    await page.screenshot({ path: `${OUT}/${v.name}.png` });
    log.push({ name: v.name, box });
    console.log('variant', v.name, Date.now() - t0, 'ms', 'box', box);
  }
} finally {
  writeFileSync(`${OUT}/shots.json`, JSON.stringify(log, null, 1));
  writeFileSync(`${OUT}/probe.json`, JSON.stringify({ query: Q, screen: SCR, dist: Number(DIST), steer: STEER, variants }, null, 1));
  await browser.close(); await vite.close?.();
}
