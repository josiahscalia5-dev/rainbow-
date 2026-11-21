// Lead r26 tool trial: Three.js DevTools (threejs-devtools-mcp 0.5.0, in-page API via its Playwright helper) on the REAL
// Screen 07 candidate, middle section (35 % of 07, the s07 worker's c_middle / hard-left / hard-right positions).
// Also times every phase of a capture (step 5 of the user's request).
//   cd /home/user/wt/trial07 && node /home/user/scratch/lead/trial07/inspect.mjs <outDir> "<query>" [mode]
// mode: inspect (default) = dump renderer / textures / materials of the middle view + timings
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const T0 = Date.now(); const tm = {}; const mark = (k) => { tm[k] = (Date.now() - T0) / 1000; };
const { loadPlaywright, CHROMIUM_ARGS, startVite } = await import(pathToFileURL(`${process.cwd()}/scripts/lib/pw.mjs`).href);
const { attachDevtools, waitForScene, threeCall } = await import('/home/user/tools-threejs-devtools/node_modules/threejs-devtools-mcp/dist/playwright.js');
const [OUT, Q, MODE = 'inspect'] = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const { chromium } = loadPlaywright();
const vite = await startVite(Number(process.env.AUDIT_PORT ?? 5291)); mark('vite_started');
const browser = await chromium.launch({ args: CHROMIUM_ARGS }); mark('browser_launched');
const res = { query: Q, chromium_args: CHROMIUM_ARGS };
try {
  const ctx = await browser.newContext({ viewport: { width: 864, height: 1536 }, deviceScaleFactor: 1 });
  await attachDevtools(ctx, { connect: false });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto(`${vite.url}/?qa=1&dpr=1&${Q}`); mark('page_loaded');
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout: 600000 }); mark('game_ready');
  await waitForScene(page, { timeout: 120000 }); mark('devtools_scene_found');
  res.gl = await page.evaluate(() => { const g = document.querySelector('canvas').getContext('webgl2'); const d = g?.getExtension('WEBGL_debug_renderer_info');
    const a = g?.getExtension('EXT_texture_filter_anisotropic'); return { renderer: d ? g.getParameter(d.UNMASKED_RENDERER_WEBGL) : '?', vendor: d ? g.getParameter(d.UNMASKED_VENDOR_WEBGL) : '?', maxAniso: a ? g.getParameter(a.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0 }; });
  const st = await page.evaluate(() => { const r = window.__rainbow; r.goto('07'); const s0 = r.state().s, s1 = r.course.stage('07').s1; const tS = s0 + 0.35 * (s1 - s0);
    let k = 0; while (r.state().s < tS && k < 6000) { r.step(1); k++; } r.freezeAt(10); return { ...r.state(), steps: k }; }); mark('sim_to_middle');
  await page.evaluate(() => window.__rainbow.drawList()); mark('render_1_frame');
  await page.evaluate(() => window.__rainbow.drawList()); mark('render_2nd_frame');
  await page.screenshot({ path: `${OUT}/c_middle.png`, timeout: 600000 }); mark('screenshot_1');
  await page.screenshot({ path: `${OUT}/c_middle_again.png`, timeout: 600000 }); mark('screenshot_2');
  res.state = st;
  res.renderer_info = await threeCall(page, 'renderer_info');
  res.renderer_settings = await threeCall(page, 'renderer_settings');
  res.scene_tree = await threeCall(page, 'scene_tree', { depth: 3, maxChildren: 40 });
  res.texture_list = await threeCall(page, 'texture_list');
  res.material_list = await threeCall(page, 'material_list');
  res.draw_calls = await threeCall(page, 'draw_call_breakdown').catch((e) => String(e));
  mark('devtools_queries');
} finally {
  res.timings_s = tm;
  writeFileSync(`${OUT}/inspect.json`, JSON.stringify(res, null, 1));
  await browser.close(); await vite.close?.();
  console.log(JSON.stringify(tm));
}
