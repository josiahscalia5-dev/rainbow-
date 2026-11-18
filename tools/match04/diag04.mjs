// Round 12 (lead): EXACT render diagnosis of Screen 04 at chosen ride positions (read-only, QA).
// For the real game frame at each shot it re-renders the frame with one object group hidden at a time (camera layers, nothing
// else changes: same simulation state, same uniforms, same post chain) and records which pixels change -> which objects
// produce every visible pixel. With &m04mv=1 it also renders the projection overlay's own coverage (debug colours:
// R = passes the per-view depth test, G = view image alpha, B = inside the view frame) for view 1 and view 2.
//   node tools/match04/diag04.mjs <outDir> '<shots JSON>' '<query>'
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const [OUT, SHOTS_JSON, Q = ''] = process.argv.slice(2);
const SHOTS = JSON.parse(SHOTS_JSON);
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(5291);
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const report = { query: Q, shots: [] };
try {
  const page = await browser.newPage({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1${Q ? '&' + Q : ''}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 300000 });
  for (const [name, dist, steer] of SHOTS) {
    const res = await page.evaluate(async ([id, dist, steer]) => {
      const r = window.__rainbow; r.goto(id);
      const s0 = r.state().s;
      const stg = r.course.stage(id);
      const s1 = stg.s1 ?? (stg.s0 + (stg.length ?? 0));
      const target = typeof dist === 'string' ? s0 + Number(dist.slice(1)) * Math.max(0, s1 - s0) : s0 + dist;
      r.setSteer(steer);
      let n = 0; while (r.state().s < target - 1e-3 && n < 4000) { r.step(1); n++; }
      r.setSteer(null);
      r.run(true); await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res))); r.run(false);
      const { scene, camera, renderer, composer } = r.qa3d();
      const W = renderer.domElement.width, H = renderer.domElement.height;
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const ctx = cv.getContext('2d', { willReadFrequently: true });
      const snap = () => { composer.render(); ctx.clearRect(0, 0, W, H); ctx.drawImage(renderer.domElement, 0, 0); return ctx.getImageData(0, 0, W, H).data; };
      // categories of drawable objects
      const cats = new Map();
      const catOf = (o) => {
        if (o.userData?.mv) return 'm04mv_overlay';
        const chain = []; for (let p = o; p && p !== scene; p = p.parent) chain.push(p.name || p.type);
        if (chain.includes('benny_root') || chain.includes('Benny')) return 'benny';
        if (chain.includes('match04_projection')) return 'm04:' + (o.name || o.parent?.name || o.type);
        const top = chain[chain.length - 1], second = chain[chain.length - 2] || '';
        if (top === 'water_system') return 'water_system:' + second;
        if (/coin/i.test(chain.join('/'))) return 'coins';
        return top + (second ? '/' + second : '');
      };
      scene.traverse((o) => {
        if (!(o.isMesh || o.isPoints || o.isSprite || o.isLine)) return;
        let vis = true; for (let p = o; p; p = p.parent) if (!p.visible) { vis = false; break; }
        if (!vis) return;
        const c = catOf(o); if (!cats.has(c)) cats.set(c, []); cats.get(c).push(o);
      });
      const base = snap();
      const N = W * H, best = new Float32Array(N), who = new Int16Array(N).fill(-1);
      const names = [...cats.keys()], counts = {};
      names.forEach((c, ci) => {
        const objs = cats.get(c), saved = objs.map((o) => o.layers.mask);
        objs.forEach((o) => { o.layers.mask = 0; });
        const img = snap();
        objs.forEach((o, i) => { o.layers.mask = saved[i]; });
        let k = 0;
        for (let i = 0, j = 0; i < N; i++, j += 4) {
          const d = Math.abs(img[j] - base[j]) + Math.abs(img[j + 1] - base[j + 1]) + Math.abs(img[j + 2] - base[j + 2]);
          if (d > 30) { k++; if (d > best[i]) { best[i] = d; who[i] = ci; } }
        }
        counts[c] = { objects: objs.length, changed_px: k, share: +(k / N).toFixed(4) };
      });
      // dominant-producer ID map (palette PNG)
      const pal = (ci) => { const h = (ci * 137.508) % 360; const f = (n) => { const kk = (n + h / 30) % 12; return 255 * (0.62 - 0.38 * Math.max(-1, Math.min(kk - 3, 9 - kk, 1))); }; return [f(0), f(8), f(4)]; };
      const idImg = ctx.createImageData(W, H), dom = {};
      for (let i = 0, j = 0; i < N; i++, j += 4) {
        const ci = who[i]; const c = ci >= 0 ? pal(ci) : [0, 0, 0];
        idImg.data[j] = c[0]; idImg.data[j + 1] = c[1]; idImg.data[j + 2] = c[2]; idImg.data[j + 3] = 255;
        const nm = ci >= 0 ? names[ci] : '(none: no single group changes it)'; dom[nm] = (dom[nm] || 0) + 1;
      }
      ctx.putImageData(idImg, 0, 0);
      const idPng = cv.toDataURL('image/png');
      const legend = names.map((c, ci) => ({ c, rgb: pal(ci).map(Math.round) }));
      // projection overlay coverage (only with &m04mv=1): overlays alone, debug colours per view
      const mv = window.__m04mv; const cover = {};
      if (mv) {
        const all = []; scene.traverse((o) => { if (o.isMesh || o.isPoints || o.isSprite || o.isLine) all.push(o); });
        const saved = all.map((o) => o.layers.mask);
        all.forEach((o) => { if (!o.userData?.mv) o.layers.mask = 0; });
        const mm = mv.mvMat, keep = [mm.depthWrite, mm.transparent];
        mm.depthWrite = true; mm.transparent = false; mm.needsUpdate = true;
        for (const v of [1, 2]) {
          mv.mvU.uMvDbg.value = v;
          const img = snap();
          let inF = 0, dep = 0, alp = 0, both = 0;
          for (let i = 0, j = 0; i < N; i++, j += 4) {
            if (img[j + 2] > 60) { inF++; const dv = img[j] > 100, av = img[j + 1] > 100; if (dv) dep++; if (av) alp++; if (dv && av) both++; }
          }
          cover['view' + v] = { in_frame_px: inF, depth_visible_px: dep, image_opaque_px: alp, usable_px: both, share_of_frame_usable: +(both / N).toFixed(4) };
          cover['view' + v + '_png'] = cv.toDataURL.call((() => { ctx.putImageData(new ImageData(new Uint8ClampedArray(img), W, H), 0, 0); return cv; })(), 'image/png');
        }
        mv.mvU.uMvDbg.value = 0;
        [mm.depthWrite, mm.transparent] = keep; mm.needsUpdate = true;
        all.forEach((o, i) => { o.layers.mask = saved[i]; });
        cover.weights = { w0: mv.mvU.uW0.value, w1: mv.mvU.uW1.value };
        const cp = camera.getWorldPosition(new camera.position.constructor());
        cover.cam_to_view_cam = mv.views.map((v) => +cp.distanceTo(v.pos).toFixed(3));
      }
      snap();
      return { s: r.state().s, lat: r.state().lat, counts, dominant: dom, legend, idPng, cover };
    }, [SCREEN_ID(), dist, steer]);
    const save = (file, dataUrl) => writeFileSync(`${OUT}/${file}`, Buffer.from(dataUrl.split(',')[1], 'base64'));
    save(`${name}_id_map.png`, res.idPng); delete res.idPng;
    for (const v of ['view1', 'view2']) if (res.cover[v + '_png']) { save(`${name}_mv_${v}_coverage.png`, res.cover[v + '_png']); delete res.cover[v + '_png']; }
    await page.screenshot({ path: `${OUT}/${name}_frame.png` });
    report.shots.push({ name, dist, steer, ...res });
    console.log(name, 's', res.s?.toFixed?.(2), JSON.stringify(res.cover?.weights ?? {}), JSON.stringify(res.cover?.cam_to_view_cam ?? []));
  }
} finally {
  writeFileSync(`${OUT}/diag.json`, JSON.stringify(report, null, 1));
  await browser.close(); await vite.close?.();
}
function SCREEN_ID() { return '04'; }
