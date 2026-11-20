#!/usr/bin/env node
/**
 * Screen 06 QA, using the existing game's documented __rainbow API.
 * The caller owns the Vite server; this script never starts or stops it.
 *
 * node tools/chatgpt/s06-capture.mjs --url http://127.0.0.1:5199 --out /tmp/s06
 * node tools/chatgpt/s06-capture.mjs --url http://127.0.0.1:5199 --out /tmp/s06-quick --shots start,middle,end
 * node tools/chatgpt/s06-capture.mjs --url http://127.0.0.1:5199 --out /tmp/s06-clip --clip-only --steering straight
 *
 * Stills: checkpoint-relative fractions, plus a simulated crossing into 07.
 * Clip: 60 Hz fixed simulation, integer accumulator into 24 fps; no extra steps.
 * PNG frames + frames.jsonl are the source of truth. No inferred video is made.
 */
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadPlaywright, CHROMIUM_ARGS } from '../../scripts/lib/pw.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DEFAULT_QUERY = 'match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1&m06gold=1&m06fclu=1&m06st=1&m06fcl=1&m06view=1&m06vs=0&m06rip=1&m06hole=2&m06fade=1&m06spl=1&m06fcn=3&m06fcg=1&m06deep=1&m06leg=1&m06vw=34,56&m06tswap=2&m06haze=50,115,0.85';
const SHOTS = {
  start: { name: 'a_start', fraction: 0, steer: 0 },
  early: { name: 'b_early_12', fraction: 0.12, steer: 0 },
  middle: { name: 'c_middle_35', fraction: 0.35, steer: 0 },
  late: { name: 'd_late_60', fraction: 0.6, steer: 0 },
  end: { name: 'e_end_85', fraction: 0.85, steer: 0 },
  left: { name: 'f_left_35', fraction: 0.35, steer: -1 },
  right: { name: 'g_right_35', fraction: 0.35, steer: 1 },
  entry07: { name: 'h_actual_entry_07', stage07Offset: 3, steer: 0 },
};

function argsOf(argv) {
  const result = {};
  for (let i = 0; i < argv.length; i++) {
    const item = argv[i];
    if (!item.startsWith('--')) throw new Error(`Expected --option, got ${item}`);
    const eq = item.indexOf('=');
    if (eq !== -1) result[item.slice(2, eq)] = item.slice(eq + 1);
    else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith('--')) result[item.slice(2)] = argv[++i];
    else result[item.slice(2)] = true;
  }
  return result;
}
function numberOption(o, key, fallback, min, max) {
  const n = o[key] === undefined ? fallback : Number(o[key]);
  if (!Number.isFinite(n) || n < min || n > max) throw new Error(`Invalid --${key}: expected ${min}..${max}`);
  return n;
}
function resolvePlaywright() {
  try { return loadPlaywright(); }
  catch (original) {
    const root = process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
    if (!root) throw original;
    const req = createRequire(join(root, 'noop.js'));
    try { return req('playwright'); } catch { return req('playwright-core'); }
  }
}

const opts = argsOf(process.argv.slice(2));
if (opts.help) {
  console.log('Required: --url <existing Vite URL>. Options: --out <dir>, --shots start,early,middle,late,end,left,right,entry07, --shot-spec <JSON array>, --query <query>, --query-file <file>, --add-query <query>, --width 432, --height 768, --shader-time 10, --timeout 60000, --clip, --clip-only, --fps 24, --tail 1.5, --clip-seconds <limit>, --max-frames 2400, --steering pattern|straight, --inspect top,side. SIGINT/SIGTERM saves partial metadata and closes Chromium.');
  process.exit(0);
}
if (!opts.url && !process.env.S06_CAPTURE_URL) throw new Error('Pass --url for the Vite server already running.');
const width = Math.round(numberOption(opts, 'width', 432, 64, 4096));
const height = Math.round(numberOption(opts, 'height', 768, 64, 4096));
const timeout = numberOption(opts, 'timeout', 60000, 1000, 60000);
const shaderTime = numberOption(opts, 'shader-time', 10, 0, 1e6);
const fps = numberOption(opts, 'fps', 24, 1, 60);
const maxFrames = Math.round(numberOption(opts, 'max-frames', 2400, 1, 36000));
const tailSeconds = numberOption(opts, 'tail', 1.5, 0, 30);
const clipSeconds = numberOption(opts, 'clip-seconds', 0, 0, 600);
const steering = opts.steering ?? 'pattern';
if (!['pattern', 'straight'].includes(steering)) throw new Error('--steering must be pattern or straight');
const out = resolve(opts.out ?? join(ROOT, 'qa/chatgpt-s06', new Date().toISOString().replace(/[:.]/g, '-')));
const query = opts['query-file'] ? readFileSync(resolve(opts['query-file']), 'utf8').trim() : (opts.query ?? DEFAULT_QUERY);
const url = new URL(opts.url ?? process.env.S06_CAPTURE_URL);
for (const [k, v] of new URLSearchParams(query)) url.searchParams.set(k, v);
for (const [k, v] of new URLSearchParams(opts['add-query'] ?? '')) url.searchParams.set(k, v);
url.searchParams.set('qa', '1'); url.searchParams.set('dpr', '1');
let shotSpecs = opts['shot-spec'] ? JSON.parse(opts['shot-spec']) : String(opts.shots ?? Object.keys(SHOTS).join(',')).split(',').filter(Boolean).map((key) => {
  if (!SHOTS[key]) throw new Error(`Unknown shot ${key}; available: ${Object.keys(SHOTS).join(',')}`);
  return { ...SHOTS[key] };
});
if (opts['clip-only']) shotSpecs = [];
if (!Array.isArray(shotSpecs)) throw new Error('--shot-spec must be an array');
for (const shot of shotSpecs) {
  if (!/^[a-zA-Z0-9_-]+$/.test(shot.name ?? '')) throw new Error('Each shot needs a filesystem-safe name');
  if (shot.fraction !== undefined && (!Number.isFinite(shot.fraction) || shot.fraction < 0 || shot.fraction > 1)) throw new Error('Shot fraction must be 0..1');
  if (shot.fraction === undefined && (!Number.isFinite(shot.stage07Offset) || shot.stage07Offset < 0 || shot.stage07Offset > 30)) throw new Error('Each shot needs fraction or stage07Offset (0..30)');
  if (![undefined, -1, 0, 1].includes(shot.steer)) throw new Error('Shot steer must be -1, 0, or 1');
}
mkdirSync(out, { recursive: true });
const metadataFile = join(out, 'capture.json');
const meta = {
  schema: 1, startedUTC: new Date().toISOString(), status: 'starting', url: url.href,
  viewport: { width, height, deviceScaleFactor: 1 }, simulationHz: 60, stillShaderTime: shaderTime,
  executablePath: String(opts.chromium ?? '/usr/bin/chromium'),
  source: 'Existing Rainbow Screen 06 runtime; captured pixels, no generated or repainted gameplay frames.',
  errors: [], warnings: [], shots: [], inspections: [], clip: null,
};
const flush = () => writeFileSync(metadataFile, JSON.stringify(meta, null, 2) + '\n');
const progress = (event, detail = {}) => console.log(JSON.stringify({ event, utc: new Date().toISOString(), ...detail }));
let browser, page, interrupted = false, phase = 'launch';
const checkInterrupted = () => { if (interrupted) throw new Error('Capture interrupted'); };
const noteError = (kind, details) => { meta.errors.push({ kind, phase, utc: new Date().toISOString(), ...details }); flush(); };
async function bounded(promise, label) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label} exceeded ${timeout} ms`)), timeout); })]);
  } finally { clearTimeout(timer); }
}
for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => {
  interrupted = true; meta.status = 'interrupted'; meta.signal = signal; flush();
  progress('interrupted', { signal, metadataFile });
  process.exitCode = signal === 'SIGINT' ? 130 : 143;
  void browser?.close().catch(() => {});
});
const heartbeat = setInterval(() => progress('working', { phase, shotsSaved: meta.shots.length, framesSaved: meta.clip?.framesSaved ?? 0 }), 15000);
heartbeat.unref();
flush();

async function startAt06() {
  return bounded(page.evaluate((time) => {
    const r = window.__rainbow; r.run(false);
    const oldNow = performance.now;
    try { performance.now = () => time * 1000; r.goto('06', time); r.setSteer(0); }
    finally { performance.now = oldNow; }
    return { checkpointS: r.state().s, stage06: r.course.stage('06'), stage07: r.course.stage('07'), state: r.state() };
  }, shaderTime), 'Reset to Screen 06');
}
async function inspectState() {
  return bounded(page.evaluate(() => {
    const r = window.__rainbow;
    const benny = typeof r.bennyScreen === 'function' ? r.bennyScreen() : null;
    return { state: r.state(), stats: r.stats(), camera: r.camera(), benny, error: window.__error ?? null };
  }), 'Read QA state');
}
async function draw(time) {
  return bounded(page.evaluate((t) => {
    const r = window.__rainbow, oldNow = performance.now;
    try { performance.now = () => t * 1000; r.freezeAt(t); r.drawList(); }
    finally { performance.now = oldNow; }
  }, time), 'Draw frame');
}

try {
  const { chromium } = resolvePlaywright();
  browser = await bounded(chromium.launch({ executablePath: meta.executablePath, headless: true, args: [...CHROMIUM_ARGS, '--no-sandbox'], timeout }), 'Launch Chromium');
  page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.setDefaultTimeout(timeout); page.setDefaultNavigationTimeout(timeout);
  page.on('pageerror', (e) => noteError('pageerror', { message: e.stack ?? e.message }));
  page.on('console', (m) => { if (m.type() === 'error') noteError('console', { message: m.text().slice(0, 2000) }); });
  page.on('requestfailed', (r) => noteError('requestfailed', { url: r.url().slice(0, 1000), message: r.failure()?.errorText ?? 'request failed' }));
  page.on('response', (r) => { if (r.status() >= 400) noteError('http', { status: r.status(), url: r.url().slice(0, 1000) }); });
  phase = 'loading'; progress('loading', { url: url.href, out });
  await page.goto(url.href, { waitUntil: 'domcontentloaded', timeout });
  await page.waitForFunction(() => window.__rainbow?.ready === true || window.__error, null, { timeout });
  const fatal = await page.evaluate(() => window.__error ?? null);
  if (fatal) throw new Error(fatal);
  await bounded(page.evaluate(() => document.fonts.ready.then(() => true)), 'Load HUD fonts');
  meta.initial = await inspectState();
  const standIns = Object.entries(meta.initial.stats.modules ?? {}).filter(([, value]) => String(value).includes('STAND-IN'));
  if (standIns.length) meta.warnings.push({ kind: 'stand-in-models', modules: standIns, message: 'These captures contain logged fallback assets; do not represent them as restored approved characters.' });
  meta.status = 'capturing'; flush(); progress('ready', { modules: meta.initial.stats.modules });

  for (const shot of shotSpecs) {
    checkInterrupted(); phase = `still:${shot.name}`; progress('shot-start', { name: shot.name });
    const range = await startAt06();
    const goal = shot.stage07Offset !== undefined ? range.stage07.s0 + shot.stage07Offset : range.checkpointS + shot.fraction * (range.stage06.s1 - range.checkpointS);
    let ticks = 0, lastS = range.state.s, state = range.state;
    const transitions = [];
    while (state.s + 0.0005 < goal) {
      checkInterrupted();
      const batch = await bounded(page.evaluate(({ goal, steer, time }) => {
        const r = window.__rainbow; r.setSteer(steer); r.freezeAt(time);
        let steps = 0, before = r.state(); const transitions = [];
        while (steps < 120 && before.s + 0.0005 < goal) {
          r.step(1, 1 / 60); steps++;
          const after = r.state();
          if (after.stage !== before.stage) transitions.push({ from: before.stage, to: after.stage, atStep: steps, s: after.s });
          before = after;
        }
        return { steps, state: before, transitions };
      }, { goal, steer: shot.steer ?? 0, time: shaderTime }), 'Advance still simulation');
      for (const t of batch.transitions) transitions.push({ ...t, simulationTime: (ticks + t.atStep) / 60 });
      ticks += batch.steps; state = batch.state;
      if (ticks > 12000) throw new Error(`Shot ${shot.name}: simulation exceeded 200 seconds (possible repeated respawn)`);
      if (batch.steps === 0 || (state.s === lastS && batch.steps >= 120)) throw new Error(`Shot ${shot.name}: simulation made no progress`);
      lastS = state.s;
    }
    await draw(shaderTime);
    const file = join(out, `${shot.name}.png`);
    await page.screenshot({ path: file, timeout, animations: 'allow' });
    const details = await inspectState();
    const record = { ...shot, file, goalS: goal, simulationTicks: ticks, simulationTime: ticks / 60, shaderTime, range, transitions, ...details };
    meta.shots.push(record); flush(); progress('shot-saved', { name: shot.name, file, stage: details.state.stage, s: details.state.s, simulationTime: ticks / 60 });
  }

  if (opts.inspect) {
    for (const view of String(opts.inspect).split(',')) {
      if (!['top', 'side'].includes(view)) throw new Error('--inspect supports top,side');
      checkInterrupted(); phase = `inspection:${view}`;
      await startAt06();
      const inspection = await bounded(page.evaluate(({ view, time }) => {
        const r = window.__rainbow, { camera } = r.qa3d(), stage = r.course.stage('06');
        const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
        for (let s = stage.s0; s <= stage.s1; s += 1) {
          const p = r.course.sample(s).pos.toArray();
          for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], p[k]); hi[k] = Math.max(hi[k], p[k]); }
        }
        const c = lo.map((a, k) => (a + hi[k]) / 2);
        const extent = Math.max(...hi.map((a, k) => a - lo[k])) + 35;
        const distance = extent / (2 * Math.tan(camera.fov * Math.PI / 360) * Math.min(1, camera.aspect));
        if (view === 'top') { camera.position.set(c[0], c[1] + distance, c[2]); camera.up.set(0, 0, -1); }
        else { camera.position.set(c[0] + distance, c[1] + extent * 0.08, c[2]); camera.up.set(0, 1, 0); }
        camera.lookAt(...c); camera.updateMatrixWorld();
        const oldNow = performance.now;
        try { performance.now = () => time * 1000; r.drawList(); } finally { performance.now = oldNow; }
        return { view, bounds: { min: lo, max: hi }, camera: r.camera(), note: 'Diagnostic free camera of real scene, not gameplay camera. Enclosing tunnel may occlude interior.' };
      }, { view, time: shaderTime }), 'Draw diagnostic camera');
      const file = join(out, `inspection_${view}.png`);
      await page.screenshot({ path: file, timeout });
      meta.inspections.push({ ...inspection, file }); flush(); progress('inspection-saved', { view, file });
    }
  }

  if (opts.clip || opts['clip-only']) {
    phase = 'clip'; checkInterrupted();
    const framesDir = join(out, 'frames'); mkdirSync(framesDir, { recursive: true });
    const framesLog = join(out, 'frames.jsonl'); writeFileSync(framesLog, '');
    const range = await startAt06();
    let ticks = 0, exitTick = null, stopReason = 'max-frames';
    meta.clip = { fps, simulationHz: 60, steering, tailSeconds, clipSeconds, range, framesDir, framesLog, framesSaved: 0, transitions: [] };
    flush(); progress('clip-start', { fps, maxFrames, steering });
    for (let i = 0; i < maxFrames; i++) {
      checkInterrupted();
      const targetTicks = Math.floor(((i + 1) * 60) / fps + 1e-9), nextSteps = targetTicks - ticks;
      const videoTime = (i + 1) / fps;
      const result = await bounded(page.evaluate(({ steps, doneTicks, videoTime, baseTime, range, steering }) => {
        const r = window.__rainbow, oldNow = performance.now; const transitions = [];
        let state = r.state(), steer = 0;
        try {
          for (let k = 0; k < steps; k++) {
            const frac = (state.s - range.checkpointS) / (range.stage06.s1 - range.checkpointS);
            steer = steering === 'straight' || state.stage !== '06' ? 0 : frac < 0.3 ? 0 : frac < 0.5 ? -1 : frac < 0.7 ? 1 : 0;
            const time = baseTime + (doneTicks + k + 1) / 60;
            performance.now = () => time * 1000;
            r.freezeAt(time); r.setSteer(steer); r.step(1, 1 / 60);
            const after = r.state();
            if (after.stage !== state.stage) transitions.push({ from: state.stage, to: after.stage, simulationTick: doneTicks + k + 1, s: after.s });
            state = after;
          }
          const time = baseTime + videoTime;
          performance.now = () => time * 1000; r.freezeAt(time); r.drawList();
          return { state: r.state(), camera: r.camera(), stats: r.stats(), steer, transitions, error: window.__error ?? null };
        } finally { performance.now = oldNow; }
      }, { steps: nextSteps, doneTicks: ticks, videoTime, baseTime: shaderTime, range, steering }), 'Advance and draw clip frame');
      ticks = targetTicks;
      const fileName = `${String(i).padStart(6, '0')}.png`;
      await page.screenshot({ path: join(framesDir, fileName), timeout, animations: 'allow' });
      const record = { frame: i, file: fileName, videoTime, simulationTicks: ticks, simulationTime: ticks / 60, shaderTime: shaderTime + videoTime, ...result };
      appendFileSync(framesLog, JSON.stringify(record) + '\n');
      meta.clip.framesSaved = i + 1; meta.clip.simulationTicks = ticks; meta.clip.videoDuration = (i + 1) / fps;
      meta.clip.transitions.push(...result.transitions);
      if (exitTick === null) {
        const exit = result.transitions.find((t) => t.from === '06');
        if (exit) exitTick = exit.simulationTick;
      }
      flush(); progress('frame-saved', { frame: i, file: fileName, stage: result.state.stage, s: result.state.s, videoTime, simulationTime: ticks / 60 });
      if (result.error) throw new Error(result.error);
      if (clipSeconds > 0 && videoTime >= clipSeconds) { stopReason = 'clip-seconds'; break; }
      if (exitTick !== null && ticks - exitTick >= tailSeconds * 60) { stopReason = 'tail-after-stage06'; break; }
    }
    meta.clip.stopReason = stopReason;
    meta.clip.actualCrossingInto07 = meta.clip.transitions.some((t) => t.from === '06' && t.to === '07');
    meta.clip.encodeExample = `ffmpeg -framerate ${fps} -i frames/%06d.png -c:v libx264 -pix_fmt yuv420p -movflags +faststart screen06.mp4`;
    flush(); progress('clip-finished', { frames: meta.clip.framesSaved, stopReason, crossedInto07: meta.clip.actualCrossingInto07 });
  }
  meta.final = await inspectState(); meta.status = meta.errors.length ? 'completed-with-errors' : 'complete';
} catch (error) {
  meta.status = interrupted ? 'interrupted' : 'error';
  meta.failure = { message: error.message, stack: error.stack, phase };
  if (!interrupted) process.exitCode = 1;
  progress('failed', { phase, message: error.message, metadataFile });
} finally {
  clearInterval(heartbeat); meta.finishedUTC = new Date().toISOString(); flush();
  if (browser) await browser.close().catch(() => {});
  progress('finished', { status: meta.status, shots: meta.shots.length, frames: meta.clip?.framesSaved ?? 0, errors: meta.errors.length, metadataFile });
}
