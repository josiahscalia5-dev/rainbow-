#!/usr/bin/env node
// One small live Screen 05 timing sample, retaining every measured frame.
// node scripts/fit05-timing.mjs --q=fit05=1 --size=360x640 --label=timing
// Creates only a fresh qa/reference-fit/tests/<label>/timing.json. No browser downloads.
import { lstatSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, relative, resolve } from 'node:path';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const opts = new Map();
for (const arg of process.argv.slice(2)) {
  const match = /^--(q|size|label)=(.*)$/.exec(arg);
  if (!match) throw new Error(`Unknown argument: ${arg}`);
  opts.set(match[1], match[2]);
}
const label = opts.get('label') ?? 'timing';
if (!/^[a-z0-9_-]+$/i.test(label)) throw new Error('Use a simple file-safe --label');
const size = opts.get('size') ?? '360x640';
if (!/^\d+x\d+$/.test(size)) throw new Error('Use --size=WIDTHxHEIGHT');
const [width, height] = size.split('x').map(Number);
if (![width, height].every((n) => Number.isInteger(n) && n >= 200 && n <= 1920)) throw new Error('Invalid viewport');
const query = new URLSearchParams(opts.get('q') ?? 'fit05=1');
query.set('qa', '1'); query.set('dpr', '1');
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const out = resolve(root, 'qa/reference-fit/tests', label);
const stat = (path) => {
  try { return lstatSync(path); } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
};
for (let path = out; path !== root; path = dirname(path)) {
  if (stat(path)?.isSymbolicLink()) throw new Error(`Output path is a symlink: ${relative(root, path)}`);
}
if (stat(out)) throw new Error('Output already exists; choose a fresh --label to preserve earlier evidence');
mkdirSync(dirname(out), { recursive: true });
mkdirSync(out); // Exclusive creation prevents concurrent runs from sharing one evidence directory.
const output = resolve(out, 'timing.json');
const hash = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const sourceHashes = () => {
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', 'src', 'assets/textures/fit05-sheen.png'],
    { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  return Object.fromEntries([...new Set(files)].sort().map((file) => [file, hash(resolve(root, file))]));
};
const report = {
  created: new Date().toISOString(),
  branch: execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim(),
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(),
  sourceHashes: sourceHashes(), harnessSha256: hash(new URL(import.meta.url)),
  query: query.toString(), viewport: { width, height, deviceScaleFactor: 1 },
  checkpoint: '05', initialAnimationTime: 12, fixedStepSeconds: 1 / 60, warmupFrames: 3, measuredFrames: 8,
  method: 'Fresh page; goto(05,12), stop the automatic loop, unfreeze animation, and set zero steering. Three simulation/render/readback frames warm up the scene. Each of exactly eight measured frames times step(1,1/60), drawList(), and synchronous WebGL readPixels(1x1) together. The even-count median is the average of both middle values; every raw sample is retained.',
  limitation: 'Host Chromium with SwiftShader CPU rendering, fixed-step complete simulation/render/readback wall-clock timings including draw-list instrumentation. These are not Android/device FPS, GPU timestamp timings, sustained-play measurements, a comparison, or a performance guarantee.',
  passMeaning: 'Eight finite timing samples, active WebGL rendering, no game/browser/WebGL errors and no source changes. Pass does not imply a speed target or improvement.',
  samplesMs: [], errors: [], warnings: [],
};
let browser, vite, page;
try {
  vite = await startVite(5281);
  const { chromium } = loadPlaywright();
  const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ args: CHROMIUM_ARGS, ...(executablePath ? { executablePath } : {}) });
  report.browserVersion = browser.version();
  page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on('pageerror', (error) => report.errors.push({ type: 'pageerror', error: error.message }));
  page.on('console', (message) => {
    if (!['error', 'warning'].includes(message.type())) return;
    const record = { type: 'console', level: message.type(), url: message.location().url, message: message.text() };
    if (record.level === 'error' && record.url === `${vite.url}/favicon.ico` && record.message.includes('404 (Not Found)')) {
      report.warnings.push({ ...record, status: 404, reason: 'Known missing non-game browser favicon' });
    } else (record.level === 'warning' ? report.warnings : report.errors).push(record);
  });
  page.on('response', (response) => {
    if (response.status() < 400) return;
    const record = { type: 'response', url: response.url(), status: response.status() };
    if (record.url === `${vite.url}/favicon.ico` && record.status === 404) {
      report.warnings.push({ ...record, reason: 'Known missing non-game browser favicon' });
    } else report.errors.push(record);
  });
  page.on('requestfailed', (request) => report.errors.push({ type: 'requestfailed', url: request.url(), error: request.failure()?.errorText }));
  await page.goto(`${vite.url}/?${query}`);
  await page.waitForFunction(() => window.__rainbow?.ready || window.__error, null, { timeout: 240000 });
  const startupError = await page.evaluate(() => window.__error);
  if (startupError) throw new Error(startupError);
  await page.evaluate(() => document.fonts.ready);
  Object.assign(report, await page.evaluate(() => {
    const api = window.__rainbow;
    api.run(false); api.goto('05', 12); api.unfreeze(); api.setSteer(0);
    const gl = document.querySelector('canvas').getContext('webgl2');
    if (!gl || gl.isContextLost()) throw new Error('No active WebGL2 context');
    const extension = gl.getExtension('WEBGL_debug_renderer_info');
    const pixel = new Uint8Array(4), result = { samplesMs: [], warmupSamplesMs: [], glErrors: [] };
    const snapshot = () => ({ state: api.state(), camera: api.camera() });
    const frame = () => {
      const start = performance.now();
      api.step(1, 1 / 60); api.drawList();
      gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
      return performance.now() - start;
    };
    const recordGlError = (phase, index) => {
      const code = gl.getError();
      if (code !== gl.NO_ERROR) result.glErrors.push({ phase, index, code });
    };
    result.initial = snapshot();
    result.renderer = extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : 'unknown';
    try {
      recordGlError('initial', 0);
      for (let i = 0; i < 3; i++) { result.warmupSamplesMs.push(frame()); recordGlError('warmup', i); }
      result.before = snapshot();
      for (let i = 0; i < 8; i++) { result.samplesMs.push(frame()); recordGlError('measured', i); }
      result.after = snapshot();
      const { fps, ...resources } = api.stats(); result.resources = resources;
    } catch (error) { result.measurementError = error.stack || String(error); }
    result.contextLost = gl.isContextLost();
    result.readbackRgba = [...pixel];
    return result;
  }));
  // Flush browser diagnostics after the synchronized work without advancing the stopped game loop.
  await page.evaluate(() => new Promise((done) => requestAnimationFrame(done)));
  if (report.measurementError) report.errors.push({ type: 'measurement', error: report.measurementError });
  if (report.contextLost || report.glErrors.length) report.errors.push({ type: 'webgl', contextLost: report.contextLost, errors: report.glErrors });
  if (!report.resources?.calls || !report.resources?.triangles) report.errors.push({ type: 'render', error: 'No measured scene draws or triangles' });
} catch (error) {
  report.errors.push({ type: 'timing', error: error.stack || String(error) });
} finally {
  for (const [name, resource] of [['page', page], ['browser', browser], ['server', vite]]) {
    try { await resource?.close(); } catch (error) { report.errors.push({ type: `${name}-close`, error: String(error) }); }
  }
  try {
    report.sourceHashesAfter = sourceHashes();
    report.sourceChangedDuringRun = [...new Set([...Object.keys(report.sourceHashes), ...Object.keys(report.sourceHashesAfter)])]
      .filter((file) => report.sourceHashes[file] !== report.sourceHashesAfter[file]);
    if (report.sourceChangedDuringRun.length) report.errors.push({ type: 'source-changed', files: report.sourceChangedDuringRun });
  } catch (error) { report.errors.push({ type: 'source-check', error: String(error) }); }
  const sorted = [...report.samplesMs].sort((a, b) => a - b), mid = Math.floor(sorted.length / 2);
  report.medianMs = sorted.length ? (sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2) : null;
  report.minimumMs = sorted[0] ?? null; report.maximumMs = sorted.at(-1) ?? null;
  report.pass = report.errors.length === 0 && report.samplesMs.length === 8 && report.samplesMs.every((ms) => Number.isFinite(ms) && ms >= 0);
  writeFileSync(output, JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ file: relative(root, output), pass: report.pass, samplesMs: report.samplesMs, medianMs: report.medianMs,
  minimumMs: report.minimumMs, maximumMs: report.maximumMs, resources: report.resources, errors: report.errors, warnings: report.warnings }, null, 2));
process.exitCode = report.pass ? 0 : 1;
