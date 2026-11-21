// Rainbow tool check: the preinstalled Playwright + Chromium start headless and give a WebGL2 context
// (the same launch flags the capture and gameplay tests use). Prints one JSON line; exit 0 = ready.
//   node scripts/lib/pw-smoke.mjs
import { loadPlaywright, CHROMIUM_ARGS } from './pw.mjs';

const t0 = Date.now();
try {
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ args: CHROMIUM_ARGS });
  const page = await browser.newPage();
  const gl = await page.evaluate(() => {
    const c = document.createElement('canvas');
    const ctx = c.getContext('webgl2');
    if (!ctx) return null;
    const ext = ctx.getExtension('WEBGL_debug_renderer_info');
    return { renderer: ext ? ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ctx.getParameter(ctx.RENDERER) };
  });
  const version = browser.version();
  await browser.close();
  console.log(JSON.stringify({ ok: !!gl, chromium: version, webgl2: gl?.renderer ?? null, ms: Date.now() - t0 }));
  process.exit(gl ? 0 : 1);
} catch (e) {
  console.log(JSON.stringify({ ok: false, error: String(e).slice(0, 200) }));
  process.exit(1);
}
