#!/usr/bin/env node
// Frozen real-WebGL captures for the separate approved-water study. No historical QA is rewritten.
// node scripts/fit05-review.mjs --out=qa/reference-fit/iteration01 --q=reference05=1
//   --size=864x1536 --stage=05 --time=12 [--times=11.983333,12.016667,12.6]
// Default viewport: 720x1280. --times adds frozen captures at absolute animation times.
// CHROMIUM_EXECUTABLE_PATH overrides the installed /usr/bin/chromium fallback.
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, isAbsolute, relative, resolve, sep } from 'node:path';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const options = new Map();
const allowed = new Set(['out', 'q', 'size', 'stage', 'time', 'times']);
for (const arg of process.argv.slice(2)) {
  const match = /^--([^=]+)=(.*)$/.exec(arg);
  if (!match || !allowed.has(match[1])) throw new Error(`Unknown argument: ${arg}`);
  options.set(match[1], match[2]);
}
const repository = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const allowedRoot = resolve(repository, 'qa/reference-fit');
const out = resolve(repository, options.get('out') ?? 'qa/reference-fit/iteration01');
const within = relative(allowedRoot, out);
if (isAbsolute(within) || within === '..' || within.startsWith(`..${sep}`)) {
  throw new Error('--out must be under qa/reference-fit; existing QA directories are protected');
}
// An existing symlink must not redirect the otherwise bounded output into an older QA directory.
for (let path = out; path !== repository; path = dirname(path)) {
  if (existsSync(path) && lstatSync(path).isSymbolicLink()) throw new Error(`Output path contains a symlink: ${path}`);
}
const stage = options.get('stage') ?? '05';
if (!/^[a-zA-Z0-9_]+$/.test(stage)) throw new Error('Invalid stage/checkpoint name');
const size = options.get('size') ?? '720x1280';
if (!/^\d+x\d+$/.test(size)) throw new Error('Use --size=WIDTHxHEIGHT');
const [width, height] = size.split('x').map(Number);
if (![width, height].every((n) => Number.isInteger(n) && n >= 200 && n <= 4096)) throw new Error('Viewport must be between 200 and 4096 pixels per dimension');
const time = Number(options.get('time') ?? '12');
const additionalTimes = options.has('times') ? options.get('times').split(',').map(Number) : [];
const times = [...new Set([time, ...additionalTimes])];
if (!times.every((t) => Number.isFinite(t) && t >= 0)) throw new Error('Animation times must be finite, non-negative seconds');
const query = options.get('q') ?? 'fit05=1';
const search = new URLSearchParams(query);
// These invariants take priority over optional visual switches.
search.set('qa', '1');
search.set('dpr', '1');
const files = times.map((t, index) => ({ time: t, file: resolve(out, index === 0 ? `${stage}.png` : `${stage}_time_${String(t).replace('.', '_')}.png`) }));
const reportPath = resolve(out, 'capture.json');
for (const file of [reportPath, ...files.map((item) => item.file)]) {
  if (existsSync(file)) throw new Error(`Refusing to overwrite ${relative(repository, file)}; choose a fresh --out directory`);
}
mkdirSync(out, { recursive: true });
const sha256 = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const sourceHashes = () => {
  const paths = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', 'src', 'vite.config.ts', 'package.json', 'package-lock.json'], { cwd: repository, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  return Object.fromEntries([...new Set(paths)].sort().map((file) => [file, sha256(resolve(repository, file))]));
};
const report = {
  created: new Date().toISOString(),
  branch: execFileSync('git', ['branch', '--show-current'], { cwd: repository, encoding: 'utf8' }).trim(),
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repository, encoding: 'utf8' }).trim(),
  source: sourceHashes(),
  query, effectiveQuery: search.toString(), stage, times,
  viewport: { width, height, deviceScaleFactor: 1 },
  captureMode: 'QA simulation loop stopped and animation time frozen by goto(checkpoint,time); pause overlay intentionally absent',
  note: 'Actual Three.js WebGL captures. Resource/draw counts are reported; QA-loop FPS is not a performance measurement.',
  captures: [], errors: [], warnings: [],
};
const warningOrError = (record) => {
  if (record.path === '/favicon.ico' && record.status === 404) report.warnings.push(record);
  else report.errors.push(record);
};
let vite, browser;
try {
  vite = await startVite(5261);
  const { chromium } = loadPlaywright();
  const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ args: CHROMIUM_ARGS, ...(executablePath ? { executablePath } : {}) });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on('pageerror', (error) => report.errors.push({ type: 'pageerror', error: error.message }));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const url = message.location().url;
    if (url === `${vite.url}/favicon.ico` && message.text().includes('404 (Not Found)')) {
      report.warnings.push({ type: 'console', path: '/favicon.ico', status: 404, error: message.text() });
    } else report.errors.push({ type: 'console', url, error: message.text() });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) warningOrError({ type: 'response', status: response.status(), path: new URL(response.url()).pathname });
  });
  page.on('requestfailed', (request) => report.errors.push({ type: 'requestfailed', url: request.url(), error: request.failure()?.errorText }));
  await page.goto(`${vite.url}/?${search}`);
  await page.waitForFunction(() => window.__rainbow?.ready || window.__error, null, { timeout: 240000 });
  const startupError = await page.evaluate(() => window.__error);
  if (startupError) throw new Error(startupError);
  await page.evaluate(() => document.fonts.ready);
  report.renderer = await page.evaluate(() => {
    const gl = document.querySelector('canvas').getContext('webgl2');
    const extension = gl?.getExtension('WEBGL_debug_renderer_info');
    return extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : 'unknown';
  });
  for (const item of files) {
    const frozen = await page.evaluate(({ stage, time }) => {
      const api = window.__rainbow;
      if (!api.checkpoints.includes(stage)) throw new Error(`Unknown checkpoint: ${stage}`);
      api.run(false);
      api.goto(stage, time); // This freezes both st.clock and water animation uniforms before rendering.
      api.setSteer(0);
      return { state: api.state(), camera: api.camera() };
    }, { stage, time: item.time });
    await page.evaluate(() => new Promise((done) => requestAnimationFrame(done)));
    // Render again after first-use PMREM/shader setup, then capture that same frozen frame.
    const rendered = await page.evaluate(() => {
      const api = window.__rainbow, drawList = api.drawList();
      const { fps, ...stats } = api.stats();
      const gl = document.querySelector('canvas').getContext('webgl2');
      return { state: api.state(), camera: api.camera(), stats, drawList, contextLost: !gl || gl.isContextLost() };
    });
    if (rendered.contextLost) throw new Error('WebGL context lost during capture');
    await page.screenshot({ path: item.file, timeout: 180000 });
    const after = await page.evaluate(() => ({ state: window.__rainbow.state(), camera: window.__rainbow.camera() }));
    if (JSON.stringify(frozen) !== JSON.stringify(after)) throw new Error('Game state or camera moved during the frozen capture');
    const capture = { file: relative(repository, item.file), time: item.time, sha256: sha256(item.file), ...rendered };
    report.captures.push(capture);
    console.log(JSON.stringify({ file: capture.file, time: item.time, calls: rendered.stats.calls, triangles: rendered.stats.triangles, errors: report.errors.length }));
  }
} catch (error) {
  report.errors.push({ type: 'capture', error: error.stack || String(error) });
} finally {
  await browser?.close();
  await vite?.close();
  const after = sourceHashes();
  report.sourceChangedDuringCapture = [...new Set([...Object.keys(report.source), ...Object.keys(after)])].filter((file) => report.source[file] !== after[file]);
  if (report.sourceChangedDuringCapture.length) report.errors.push({ type: 'source-changed', files: report.sourceChangedDuringCapture });
  report.pass = report.errors.length === 0 && report.captures.length === files.length;
  writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ report: relative(repository, reportPath), pass: report.pass, captures: report.captures.length, errors: report.errors, warnings: report.warnings }, null, 2));
process.exitCode = report.pass ? 0 : 1;
