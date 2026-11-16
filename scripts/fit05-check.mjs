#!/usr/bin/env node
// Scoped live-game validation after the paused visual fit is ready; does not run all stages.
// node scripts/fit05-check.mjs --label=final [--q=fit05=1] [--size=432x768] [--low-quality]
// All new evidence goes to a fresh qa/reference-fit/tests/<label> directory.
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve, relative, dirname } from 'node:path';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const opts = new Map(), flags = new Set();
for (const arg of process.argv.slice(2)) {
  if (arg === '--low-quality') { flags.add(arg); continue; }
  const m = /^--(label|q|size|current)=(.*)$/.exec(arg);
  if (!m) throw new Error(`Unknown option ${arg}`);
  opts.set(m[1], m[2]);
}
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const label = opts.get('label') ?? 'final';
if (!/^[a-z0-9_-]+$/i.test(label)) throw new Error('Use a simple --label');
const out = resolve(root, 'qa/reference-fit/tests', label);
for (let p = out; p !== root; p = dirname(p)) if (existsSync(p) && lstatSync(p).isSymbolicLink()) throw new Error('Symlink output parent');
if (existsSync(out)) throw new Error('Output exists; choose a new label to preserve earlier evidence');
const [width, height] = (opts.get('size') ?? '432x768').split('x').map(Number);
if (![width, height].every((n) => Number.isInteger(n) && n >= 200 && n <= 1920)) throw new Error('Invalid viewport');
const current = resolve(root, opts.get('current') ?? 'qa/reference-fit/CURRENT.png');
const header = readFileSync(current);
if (header.subarray(1, 4).toString() !== 'PNG') throw new Error('CURRENT must be a PNG');
const currentSize = { width: header.readUInt32BE(16), height: header.readUInt32BE(20) };
const query = new URLSearchParams(opts.get('q') ?? 'fit05=1'); query.set('qa', '1'); query.set('dpr', '1');
const hash = (b) => createHash('sha256').update(b).digest('hex');
const sources = () => Object.fromEntries(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', 'src', 'assets/textures/fit05-sheen.png'], { encoding: 'utf8', cwd: root }).trim().split('\n').filter(Boolean).map((p) => [p, hash(readFileSync(resolve(root, p)))]));
mkdirSync(out, { recursive: true });
const report = { created: new Date().toISOString(), branch: execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim(),
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), sourceHashes: sources(),
  query: query.toString(), viewport: { width, height, deviceScaleFactor: 1 }, current: { path: relative(root, current), sha256: hash(header), ...currentSize },
  scope: 'Real browser input and deterministic Screen 05 to 06 simulation, actual WebGL captures and resource counts. Screenshots are unannotated playable-game renders. No full-route, Android-device, FPS or GPU-timing claim.',
  checks: {}, captures: [], errors: [], warnings: [] };
const check = (name, pass, evidence) => { report.checks[name] = { pass, ...evidence }; console.log(`${name}: ${pass ? 'PASS' : 'FAIL'}`); };
let browser, vite;
try {
  vite = await startVite(5277);
  const { chromium } = loadPlaywright();
  const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ args: CHROMIUM_ARGS, ...(executablePath ? { executablePath } : {}) });
  const open = async (name, search, viewport = { width, height }) => {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => report.errors.push({ page: name, type: 'pageerror', error: e.message }));
    page.on('console', (m) => {
      if (!['error', 'warning'].includes(m.type())) return;
      const entry = { page: name, type: m.type(), url: m.location().url, message: m.text() };
      if (m.type() === 'warning' || (entry.url === `${vite.url}/favicon.ico` && entry.message.includes('404 (Not Found)'))) report.warnings.push(entry);
      else report.errors.push(entry);
    });
    page.on('response', (r) => {
      if (r.status() < 400) return;
      const entry = { page: name, type: 'response', url: r.url(), status: r.status() };
      (r.url() === `${vite.url}/favicon.ico` && r.status() === 404 ? report.warnings : report.errors).push(entry);
    });
    page.on('requestfailed', (r) => report.errors.push({ page: name, type: 'requestfailed', url: r.url(), error: r.failure()?.errorText }));
    await page.goto(`${vite.url}/?${search}`);
    await page.waitForFunction(() => window.__rainbow?.ready || window.__error, null, { timeout: 240000 });
    const error = await page.evaluate(() => window.__error); if (error) throw new Error(error);
    await page.evaluate(() => document.fonts.ready);
    return page;
  };
  const snapshot = async (page, name, time = 12) => {
    const evidence = await page.evaluate((t) => {
      const a = window.__rainbow; a.run(false); a.goto('05', t); a.setSteer(0); const drawList = a.drawList();
      const { fps, ...resources } = a.stats(), gl = document.querySelector('canvas').getContext('webgl2');
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      return { state: a.state(), camera: a.camera(), resources, drawList, contextLost: gl.isContextLost(),
        renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown' };
    }, time);
    const path = resolve(out, `${name}.png`); await page.screenshot({ path, timeout: 180000 });
    const after = await page.evaluate(() => ({ state: window.__rainbow.state(), camera: window.__rainbow.camera() }));
    if (JSON.stringify(after) !== JSON.stringify({ state: evidence.state, camera: evidence.camera })) throw new Error('Frozen capture state/camera changed');
    report.captures.push({ file: relative(root, path), time, sha256: hash(readFileSync(path)), kind: 'actual playable Three.js render, no annotation', ...evidence });
    return evidence;
  };
  const ride = async (page, capture) => {
    const limits = await page.evaluate(async () => {
      const a = window.__rainbow; a.run(false); a.goto('05', 12); a.unfreeze(); a.setSteer(0);
      const { far05Debug } = await import('/src/world/far05.ts');
      return { start: a.state().s, seam: far05Debug.ft.sF, join: a.course.stage('06').s0 };
    });
    const targets = [limits.seam - 2, limits.seam + 4, limits.join + 2].filter((s) => s > limits.start).sort((a, b) => a - b);
    const segments = [];
    for (const target of targets) {
      const segment = await page.evaluate((end) => {
        const a = window.__rainbow; let prev = a.state(), steps = 0, maxCameraStep = 0, maxBennyYStep = 0, nonMonotonic = 0;
        const samples = [prev];
        while (prev.s < end && steps < 1200 && prev.mode === 'ride') {
          const next = a.step(1, 1 / 60); steps++;
          maxCameraStep = Math.max(maxCameraStep, Math.hypot(...next.cam.map((v, i) => v - prev.cam[i])));
          maxBennyYStep = Math.max(maxBennyYStep, Math.abs(next.bennyY - prev.bennyY));
          if (next.s <= prev.s) nonMonotonic++;
          prev = next; if (steps % 30 === 0) samples.push(next);
        }
        samples.push(prev);
        return { target: end, state: prev, steps, samples, maxCameraStep, maxBennyYStep, nonMonotonic };
      }, target);
      segments.push(segment);
      if (capture) {
        const name = `fit05-ride-s${target.toFixed(2).replace('.', '_')}.png`, path = resolve(out, name);
        await page.evaluate(() => window.__rainbow.drawList()); await page.screenshot({ path, timeout: 180000 });
        report.captures.push({ file: relative(root, path), sha256: hash(readFileSync(path)), kind: 'actual playable Three.js render, no annotation', state: segment.state });
      }
    }
    return { limits, segments };
  };
  // Default-path preservation is compared at CURRENT's exact native size, before any input test.
  const baseline = await open('default', 'qa=1&dpr=1', currentSize);
  report.defaultResources = await snapshot(baseline, 'default-current-check');
  const pixelDiff = JSON.parse(execFileSync('python3', ['-c',
    'import sys,json,numpy as np;from PIL import Image;a=np.asarray(Image.open(sys.argv[1]).convert("RGBA"),dtype=np.int16);b=np.asarray(Image.open(sys.argv[2]).convert("RGBA"),dtype=np.int16);assert a.shape==b.shape;d=np.abs(a-b);print(json.dumps({"changedPixels":int(np.any(d,axis=2).sum()),"maximumChannelDelta":int(d.max()),"meanAbsoluteChannelDelta":float(d.mean()),"shape":list(a.shape)}))',
    current, resolve(out, 'default-current-check.png')], { encoding: 'utf8' }));
  check('defaultPixelsUnchanged', pixelDiff.changedPixels === 0, pixelDiff);
  report.defaultRide = await ride(baseline, false); await baseline.close();

  const page = await open('fit05', query.toString());
  report.fitResources = await snapshot(page, 'fit05-playable-05');
  check('fitWaterDrawn', !report.fitResources.contextLost && report.fitResources.resources.calls > 0
    && report.fitResources.drawList.some(([name, calls]) => name.includes('water_ribbon') && calls > 0)
    && report.fitResources.drawList.some(([name, calls]) => name.includes('fit05_authored_glints') && calls > 0),
    { resources: report.fitResources.resources, drawList: report.fitResources.drawList, note: 'Counts and actual mesh draws only; not performance timing or an aesthetic approval.' });
  const setup = () => page.evaluate(() => { const a = window.__rainbow; a.run(false); a.goto('05', 12); a.setSteer(null); return a.state(); });
  const step = (n) => page.evaluate((count) => window.__rainbow.step(count, 1 / 60), n);
  const keyboard = [];
  for (const [key, sign] of [['ArrowLeft', -1], ['ArrowRight', 1]]) {
    const before = await setup(); await page.keyboard.down(key); const after = await step(24); await page.keyboard.up(key);
    keyboard.push({ key, before: before.lat, after: after.lat, pass: (after.lat - before.lat) * sign > 0.2 });
  }
  check('keyboardSteering', keyboard.every((r) => r.pass), { events: keyboard });
  const beforePointer = await setup(); await page.mouse.move(width * .8, height * .72); await page.mouse.down();
  const pressed = await step(24); await page.mouse.move(width * .18, height * .72, { steps: 5 }); const dragged = await step(36); await page.mouse.up();
  check('pointerSteering', pressed.lat > beforePointer.lat + .2 && dragged.lat < pressed.lat - .2,
    { before: beforePointer.lat, pressed: pressed.lat, dragged: dragged.lat });
  await setup(); const beforePause = await step(10); await page.locator('[data-k="pause"]').click();
  const paused = await step(40); await page.locator('.pausedOverlay').click(); const resumed = await step(10);
  check('hudPauseResume', paused.paused && paused.s === beforePause.s && !resumed.paused && resumed.s > paused.s,
    { before: beforePause, paused, resumed });
  await page.keyboard.press('p'); const keyPaused = await step(20); await page.keyboard.press('Escape'); const keyResumed = await step(10);
  check('keyboardPauseResume', keyPaused.paused && keyPaused.s === resumed.s && !keyResumed.paused && keyResumed.s > keyPaused.s,
    { paused: keyPaused, resumed: keyResumed });
  report.fitRide = await ride(page, true);
  const segments = report.fitRide.segments, end = segments.at(-1)?.state;
  check('screen05To06Continuity', end?.stage === '06' && segments.every((s) => s.nonMonotonic === 0 && s.maxCameraStep < 1.5 && s.maxBennyYStep < 1),
    { finalState: end, segments: segments.map(({ samples, ...s }) => s), note: 'Sampled live simulation and rendered seam captures; not a claim of pixel-perfect geometry continuity.' });
  check('gameplayMatchesDefault', JSON.stringify(report.defaultRide) === JSON.stringify(report.fitRide),
    { samples: segments.reduce((n, s) => n + s.samples.length, 0), compared: 'All sampled states, coins, hearts, camera positions, Benny height and segment extrema from the same deterministic 05→06 route.' });
  await page.close();
  if (flags.has('--low-quality')) {
    const lowQuery = new URLSearchParams(query); lowQuery.set('quality', 'low');
    const low = await open('fit05-low', lowQuery.toString()); report.lowResources = await snapshot(low, 'fit05-low-playable-05');
    check('lowQualityRender', !report.lowResources.contextLost && report.lowResources.resources.calls > 0 && report.lowResources.resources.triangles > 0,
      { resources: report.lowResources.resources }); await low.close();
  }
  check('noBrowserErrors', report.errors.length === 0, { errors: report.errors, warnings: report.warnings });
} catch (e) { report.errors.push({ type: 'harness', error: e.stack || String(e) }); }
finally {
  await browser?.close(); await vite?.close();
  const after = sources(); report.sourceChanged = [...new Set([...Object.keys(after), ...Object.keys(report.sourceHashes)])].filter((p) => after[p] !== report.sourceHashes[p]);
  if (report.sourceChanged.length) report.errors.push({ type: 'source-changed', files: report.sourceChanged });
  report.pass = report.errors.length === 0 && Object.keys(report.checks).length >= 8 && Object.values(report.checks).every((c) => c.pass);
  writeFileSync(resolve(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ output: relative(root, out), pass: report.pass, checks: Object.fromEntries(Object.entries(report.checks).map(([k, v]) => [k, v.pass])), errors: report.errors }));
process.exitCode = report.pass ? 0 : 1;
