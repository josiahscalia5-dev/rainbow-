// Lead r26 tool trial step 2: which object / material / draw call makes (a) the mirrored "heart" shapes in the cyan water and
// (b) the thin dotted arcs across the gold rings in the Screen 07 middle view (35 %). Three.js DevTools (raycast, material,
// texture) + Spector.js (per-draw-call frame capture). One browser session, one render slot.
//   cd /home/user/wt/trial07 && node /home/user/scratch/lead/trial07/probe2.mjs <outDir> "<query>"
import { mkdirSync, writeFileSync, readFileSync, realpathSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const T0 = Date.now(); const tm = {}; const mark = (k) => { tm[k] = +((Date.now() - T0) / 1000).toFixed(2); };
const { loadPlaywright, CHROMIUM_ARGS } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const { attachDevtools, waitForScene, threeCall } = await import('/home/user/tools-threejs-devtools/node_modules/threejs-devtools-mcp/dist/playwright.js');
async function startVite(port) {   // lead23 fix: allow the linked node_modules (HUD fonts)
  const { createServer, searchForWorkspaceRoot } = await import(pathToFileURL(`${process.cwd()}/node_modules/vite/dist/node/index.js`).href);
  const root = process.cwd();
  const server = await createServer({ server: { port, strictPort: false, host: '127.0.0.1', hmr: false, watch: { ignored: ['**/*'] },
    fs: { allow: [searchForWorkspaceRoot(root), realpathSync(`${root}/node_modules`)] } }, logLevel: 'error' });
  await server.listen();
  return { url: (server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${port}/`).replace(/\/$/, ''), close: () => server.close() };
}
const [OUT, Q] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const W = 864, H = 1536;
const PROBES = { heart1: [420, 1300], heart2: [372, 1478], water_l: [300, 1200], bank_l: [90, 1250], wall: [300, 560], ring: [430, 300], arc1: [300, 336], arc2: [560, 336] };
const ndc = ([x, y]) => ({ x: +(x / W * 2 - 1).toFixed(4), y: +(1 - y / H * 2).toFixed(4) });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5291));
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
const res = { query: Q, probes: PROBES };
try {
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await attachDevtools(ctx, { connect: false });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`);
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 600000 });
  await waitForScene(page, { timeout: 120000 }); mark('ready');
  await page.evaluate(() => { const r = window.__rainbow; r.goto('07'); const s0 = r.state().s, s1 = r.course.stage('07').s1; const tS = s0 + 0.35 * (s1 - s0);
    let k = 0; while (r.state().s < tS && k < 6000) { r.step(1); k++; } r.freezeAt(10); r.drawList(); });
  await page.screenshot({ path: `${OUT}/before.png`, timeout: 600000 }); mark('shot_before');
  // ---- DevTools: what is under each probe pixel
  res.hits = {};
  for (const [k, p] of Object.entries(PROBES)) {
    try { res.hits[k] = await threeCall(page, 'raycast', ndc(p)); } catch (e) { res.hits[k] = { error: String(e).slice(0, 300) }; }
  }
  mark('raycasts');
  writeFileSync(`${OUT}/probe2.json`, JSON.stringify(res, null, 1));
  // ---- Spector: per-draw-call capture of the same frame; which draw calls change each probe pixel
  await page.addScriptTag({ content: readFileSync('/home/user/tools-spector/node_modules/spectorjs/dist/spector.bundle.js', 'utf8') });
  res.spector = await page.evaluate(async ({ PROBES, W, H }) => {
    const spector = new window.SPECTOR.Spector();
    const canvas = document.querySelector('canvas');
    const cap = await new Promise((resolve, reject) => {
      const to = setTimeout(() => reject(new Error('spector timeout')), 900000);
      spector.onCapture.add((c) => { clearTimeout(to); resolve(c); });
      spector.captureCanvas(canvas, 0, false);
      window.__rainbow.drawList();
    });
    window.__cap = cap;
    const draws = cap.commands.filter((c) => /^draw/.test(c.name || ''));
    // thumbnails: VisualState.Attachments[0].src (data URL) after each draw call → sample the probe pixels
    const loadImg = (src) => new Promise((r) => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = src; });
    const cv = document.createElement('canvas'); const g = cv.getContext('2d', { willReadFrequently: true });
    const out = { nDraws: draws.length, nCommands: cap.commands.length, perProbe: {}, sample: null };
    let prev = {};
    for (const c of draws) {
      const a = c.VisualState?.Attachments?.[0]; if (!a?.src) continue;
      const im = await loadImg(a.src); if (!im) continue;
      cv.width = im.width; cv.height = im.height; g.drawImage(im, 0, 0);
      if (!out.sample) out.sample = { thumbW: im.width, thumbH: im.height, flipY: a.flipY ?? null };
      const prog = c.DrawCall?.programStatus?.program?.__SPECTOR_Object_TAG?.id;
      const fs = (c.DrawCall?.shaders || []).find((s) => s.shaderType === 'FRAGMENT_SHADER' || /FRAG/i.test(s.shaderType || ''));
      for (const [k, [x, y]] of Object.entries(PROBES)) {
        const tx = Math.min(im.width - 1, Math.round(x / W * im.width)), tyTop = Math.round(y / H * im.height);
        const ty = Math.min(im.height - 1, tyTop);
        const px = Array.from(g.getImageData(tx, ty, 1, 1).data.slice(0, 3));
        const p = prev[k];
        if (!p || Math.abs(p[0] - px[0]) + Math.abs(p[1] - px[1]) + Math.abs(p[2] - px[2]) > 6) {
          (out.perProbe[k] ||= []).push({ cmd: c.id, name: c.name, prog, rgb: px, fsHead: (fs?.source || '').slice(0, 0), fsLen: (fs?.source || '').length,
            blend: c.BlendState?.BLEND, depthMask: c.DepthState?.DEPTH_WRITEMASK, uniformNames: (c.DrawCall?.uniforms || []).map((u) => u.name).filter((n) => /^u[A-Z]/.test(n)).slice(0, 30) });
        }
        prev[k] = px;
      }
    }
    return out;
  }, { PROBES, W, H });
  mark('spector');
} finally {
  res.timings_s = tm;
  writeFileSync(`${OUT}/probe2.json`, JSON.stringify(res, null, 1));
  await browser.close(); await vite.close?.();
  console.log(JSON.stringify(tm));
}
