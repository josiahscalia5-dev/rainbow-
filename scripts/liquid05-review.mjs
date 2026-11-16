#!/usr/bin/env node
// Reproducible full-size screenshots and small adjacent-stage regressions for the isolated experiment.
// node --import ./scripts/use-installed-chromium.mjs scripts/liquid05-review.mjs
import { mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const root = 'qa/codex-water';
const query = 'liquid05=1&roundfoam05=1';
const cases = [
  ['default-after', '', [864, 1536], ['05']],
  ['final', query, [864, 1536], ['05']],
  ['low', `${query}&quality=low`, [432, 768], ['05']],
  ['scope-default', '', [432, 768], ['04', '06', '07']],
  ['scope-improved', query, [432, 768], ['04', '06', '07']],
];
const sourceFiles = ['src/vfx/liquid05.ts', 'src/vfx/foam05Options.ts', 'src/vfx/waterRibbon.ts',
  'src/vfx/foam.ts', 'src/world/materials.ts', 'src/world/far05.ts'];
const report = { created: new Date().toISOString(), source: Object.fromEntries(sourceFiles.map(file =>
  [file, createHash('sha256').update(readFileSync(file)).digest('hex')])), captures: [], errors: [], warnings: [] };
const vite = await startVite(5251);
const { chromium } = loadPlaywright();
const browser = await chromium.launch({ args: CHROMIUM_ARGS });
try {
  for (const [name, q, [width, height], ids] of cases) {
    const dir = `${root}/tests/${name}`;
    mkdirSync(dir, { recursive: true });
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    page.on('pageerror', e => report.errors.push({ name, error: e.message }));
    page.on('console', m => {
      if (m.type() === 'error' && /WebGL|GLSL|shader|THREE/i.test(m.text())) report.errors.push({ name, error: m.text() });
    });
    page.on('response', r => {
      if (r.status() < 400) return;
      const record = { name, status: r.status(), path: new URL(r.url()).pathname };
      (record.path === '/favicon.ico' && record.status === 404 ? report.warnings : report.errors).push(record);
    });
    await page.goto(`${vite.url}/?qa=1&dpr=1${q ? '&' + q : ''}`);
    await page.waitForFunction(() => window.__rainbow?.ready || window.__error, null, { timeout: 240000 });
    const startup = await page.evaluate(() => window.__error);
    if (startup) throw new Error(startup);
    await page.evaluate(() => document.fonts.ready);
    for (const id of ids) {
      await page.evaluate(id => window.__rainbow.goto(id), id);
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
      await page.waitForTimeout(250);
      const file = `${dir}/${id}.png`;
      await page.screenshot({ path: file, timeout: 180000 });
      const evidence = await page.evaluate(() => {
        const a = window.__rainbow;
        a.drawList();
        return { state: a.state(), camera: a.camera(), stats: a.stats() };
      });
      report.captures.push({ name, query: q, size: [width, height], id, file, ...evidence });
      console.log(name, id, JSON.stringify(evidence.stats));
    }
    await page.close();
  }
  copyFileSync(`${root}/tests/final/05.png`, `${root}/IMPROVED.png`);
} catch (error) {
  report.errors.push({ error: error.stack || String(error) });
} finally {
  report.pass = report.errors.length === 0;
  writeFileSync(`${root}/tests/render-review.json`, JSON.stringify(report, null, 2) + '\n');
  await browser.close();
  await vite.close();
}
process.exitCode = report.pass ? 0 : 1;
