#!/usr/bin/env node
// Small, synchronized Screen 05 comparison. Raw timings and every run's diagnostics are retained.
// node scripts/reference05-perf.mjs --q=reference05=1 --size=360x640 --frames=8 --rounds=2 --label=performance
// Outputs only a FRESH qa/approved-water-study/tests/<label>/performance.json.
// CHROMIUM_EXECUTABLE_PATH overrides the installed /usr/bin/chromium fallback. No browser downloads.
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, relative } from 'node:path';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const options = new Map();
const allowed = new Set(['q', 'size', 'frames', 'rounds', 'label']);
for (const arg of process.argv.slice(2)) {
  const match = /^--([^=]+)=(.*)$/.exec(arg);
  if (!match || !allowed.has(match[1])) throw new Error(`Unknown argument: ${arg}`);
  options.set(match[1], match[2]);
}
const query = options.get('q') ?? 'reference05=1';
const label = options.get('label') ?? 'performance';
if (!/^[a-zA-Z0-9_-]+$/.test(label)) throw new Error('Use a simple file-safe --label');
const size = options.get('size') ?? '360x640';
if (!/^\d+x\d+$/.test(size)) throw new Error('Use --size=WIDTHxHEIGHT');
const [width, height] = size.split('x').map(Number);
if (![width, height].every((n) => Number.isInteger(n) && n >= 200 && n <= 1920)) throw new Error('Invalid viewport');
const frames = Number(options.get('frames') ?? 8);
const rounds = Number(options.get('rounds') ?? 2);
if (!Number.isInteger(frames) || frames < 2 || frames > 120) throw new Error('--frames must be an integer from 2 to 120');
if (!Number.isInteger(rounds) || rounds < 1 || rounds > 10) throw new Error('--rounds must be an integer from 1 to 10');
const repository = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const testsRoot = resolve(repository, 'qa/approved-water-study/tests');
for (const path of ['qa', 'qa/approved-water-study', 'qa/approved-water-study/tests']) {
  const absolute = resolve(repository, path);
  if (existsSync(absolute) && lstatSync(absolute).isSymbolicLink()) throw new Error(`Output parent is a symlink: ${path}`);
}
const out = resolve(testsRoot, label);
if (existsSync(out)) throw new Error('Output already exists; choose a fresh --label to preserve earlier evidence');
mkdirSync(testsRoot, { recursive: true });
mkdirSync(out); // Exclusive directory creation also prevents two runs from sharing one label.
const outputFile = resolve(out, 'performance.json');
const hash = (file) => createHash('sha256').update(readFileSync(file)).digest('hex');
const sourceHashes = () => {
  const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', 'src', 'vite.config.ts', 'package.json', 'package-lock.json'], { cwd: repository, encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  return Object.fromEntries([...new Set(files)].sort().map((file) => [file, hash(resolve(repository, file))]));
};
const report = {
  created: new Date().toISOString(),
  branch: execFileSync('git', ['branch', '--show-current'], { cwd: repository, encoding: 'utf8' }).trim(),
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: repository, encoding: 'utf8' }).trim(),
  sourceHashes: sourceHashes(), harnessSha256: hash(new URL(import.meta.url)),
  viewport: { width, height, deviceScaleFactor: 1 }, framesPerRun: frames, rounds, warmupFrames: 2,
  checkpoint: '05', animationTime: 12,
  method: 'Frozen actual WebGL scene. Each sample times drawList() plus synchronous gl.readPixels(1x1). Two warm-up frames are excluded. Raw sample order is preserved; an even sample count uses the arithmetic mean of its two middle values for the median.',
  order: 'Default then reference in odd-numbered rounds; reference then default in even-numbered rounds to reduce consistent order bias.',
  limitation: 'Descriptive host Chromium/SwiftShader CPU-renderer timing, including draw-list instrumentation and synchronization. Not Android FPS, GPU timestamp timing, or a device-performance guarantee. No fastest-run selection or speed threshold is used.',
  passMeaning: 'All requested runs rendered successfully without game errors or source changes; pass does not assert a speed improvement.',
  variants: [{ name: 'default', query: '' }, { name: 'reference', query }],
  runs: [], errors: [], sourceChangedDuringRun: [],
};
const save = () => writeFileSync(outputFile, JSON.stringify(report, null, 2) + '\n');
let browser, vite;
try {
  vite = await startVite(5269);
  const { chromium } = loadPlaywright();
  const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ args: CHROMIUM_ARGS, ...(executablePath ? { executablePath } : {}) });
  for (let round = 1; round <= rounds; round++) {
    const variants = round % 2 === 1 ? report.variants : [...report.variants].reverse();
    for (const [index, variant] of variants.entries()) {
      const search = new URLSearchParams(variant.query);
      search.set('qa', '1'); search.set('dpr', '1');
      const run = { round, order: index + 1, name: variant.name, query: variant.query, effectiveQuery: search.toString(), errors: [], warnings: [], samplesMs: [] };
      report.runs.push(run);
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      page.on('pageerror', (error) => run.errors.push({ type: 'pageerror', error: error.message }));
      page.on('console', (message) => {
        if (message.type() !== 'error') return;
        const url = message.location().url;
        const record = { type: 'console', url, error: message.text() };
        if (url === `${vite.url}/favicon.ico` && message.text().includes('404 (Not Found)')) {
          run.warnings.push({ ...record, status: 404, reason: 'Known missing non-game browser favicon' });
        } else run.errors.push(record);
      });
      page.on('response', (response) => {
        if (response.status() < 400) return;
        const record = { type: 'response', url: response.url(), status: response.status() };
        (record.url === `${vite.url}/favicon.ico` && record.status === 404 ? run.warnings : run.errors).push(record);
      });
      page.on('requestfailed', (request) => run.errors.push({ type: 'requestfailed', url: request.url(), error: request.failure()?.errorText }));
      try {
        await page.goto(`${vite.url}/?${search}`);
        await page.waitForFunction(() => window.__rainbow?.ready || window.__error, null, { timeout: 240000 });
        const startupError = await page.evaluate(() => window.__error);
        if (startupError) throw new Error(startupError);
        await page.evaluate(() => document.fonts.ready);
        Object.assign(run, await page.evaluate((count) => {
          const api = window.__rainbow;
          api.run(false); api.goto('05', 12); api.setSteer(0);
          const gl = document.querySelector('canvas').getContext('webgl2');
          if (!gl || gl.isContextLost()) throw new Error('No active WebGL2 context');
          const extension = gl.getExtension('WEBGL_debug_renderer_info');
          const pixel = new Uint8Array(4);
          const one = () => { api.drawList(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel); };
          one(); one();
          const before = { state: api.state(), camera: api.camera() };
          const samplesMs = [];
          for (let i = 0; i < count; i++) { const start = performance.now(); one(); samplesMs.push(performance.now() - start); }
          const sorted = [...samplesMs].sort((a, b) => a - b), mid = Math.floor(sorted.length / 2);
          const medianMs = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
          const stats = api.stats(), after = { state: api.state(), camera: api.camera() };
          const glError = gl.getError();
          return {
            samplesMs, medianMs, minimumMs: sorted[0], maximumMs: sorted[sorted.length - 1],
            glError, contextLost: gl.isContextLost(),
            resources: { calls: stats.calls, triangles: stats.triangles, textures: stats.textures, geometries: stats.geometries },
            renderer: extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : 'unknown',
            before, after, frozenStateUnchanged: JSON.stringify(before) === JSON.stringify(after),
          };
        }, frames));
        // Let console messages associated with the measured GPU work reach the browser client.
        await page.evaluate(() => new Promise((done) => requestAnimationFrame(done)));
        if (run.contextLost || run.glError !== 0) run.errors.push({ type: 'webgl', error: `Context lost: ${run.contextLost}; error code: ${run.glError}` });
        if (!run.frozenStateUnchanged) run.errors.push({ type: 'simulation', error: 'State or camera moved during a frozen benchmark' });
      } catch (error) {
        run.errors.push({ type: 'run', error: error.stack || String(error) });
      } finally {
        await page.close();
        run.pass = run.errors.length === 0 && run.samplesMs.length === frames;
        save();
        console.log(JSON.stringify({ round, name: run.name, medianMs: run.medianMs, samples: run.samplesMs.length, resources: run.resources, errors: run.errors, warnings: run.warnings }));
      }
    }
  }
} catch (error) {
  report.errors.push({ type: 'benchmark', error: error.stack || String(error) });
} finally {
  try { await browser?.close(); } catch (error) { report.errors.push({ type: 'browser-close', error: String(error) }); }
  try { await vite?.close(); } catch (error) { report.errors.push({ type: 'server-close', error: String(error) }); }
  const after = sourceHashes();
  report.sourceChangedDuringRun = [...new Set([...Object.keys(report.sourceHashes), ...Object.keys(after)])].filter((file) => report.sourceHashes[file] !== after[file]);
  if (report.sourceChangedDuringRun.length) report.errors.push({ type: 'source-changed', files: report.sourceChangedDuringRun });
  report.pairedRoundComparisons = Array.from({ length: rounds }, (_, index) => {
    const round = index + 1;
    const baseline = report.runs.find((run) => run.round === round && run.name === 'default');
    const candidate = report.runs.find((run) => run.round === round && run.name === 'reference');
    const valid = Boolean(baseline?.pass && candidate?.pass);
    return { round, valid, defaultMedianMs: baseline?.medianMs ?? null, referenceMedianMs: candidate?.medianMs ?? null,
      referenceChangePercent: valid ? (candidate.medianMs / baseline.medianMs - 1) * 100 : null };
  });
  report.pass = report.errors.length === 0 && report.runs.length === rounds * 2 && report.runs.every((run) => run.pass);
  save();
}
console.log(JSON.stringify({ file: relative(repository, outputFile), pass: report.pass, pairedRoundComparisons: report.pairedRoundComparisons, errors: report.errors }, null, 2));
process.exitCode = report.pass ? 0 : 1;
