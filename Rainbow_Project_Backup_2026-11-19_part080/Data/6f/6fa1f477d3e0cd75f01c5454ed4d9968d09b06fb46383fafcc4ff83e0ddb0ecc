#!/usr/bin/env node
// Focused authored-pose and phase-wrap evidence; no gameplay/performance claim.
// node scripts/fit05-temporal.mjs --label=temporal [--size=360x640]
// Optional --pose=.../05.png reuses a verified capture.json sibling instead of rendering 864x1536 again.
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve, relative, dirname } from 'node:path';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';
const args = new Map();
for (const arg of process.argv.slice(2)) { const m = /^--(label|size|pose|reference)=(.*)$/.exec(arg); if (!m) throw new Error('Unknown option ' + arg); args.set(m[1], m[2]); }
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const label = args.get('label') ?? 'temporal'; if (!/^[a-z0-9_-]+$/i.test(label)) throw new Error('Invalid label');
const out = resolve(root, 'qa/reference-fit/tests', label);
for (let p = out; p !== root; p = dirname(p)) if (existsSync(p) && lstatSync(p).isSymbolicLink()) throw new Error('Symlink output parent');
if (existsSync(out)) throw new Error('Use a fresh label');
const [width, height] = (args.get('size') ?? '360x640').split('x').map(Number);
if (![width, height].every((n) => Number.isInteger(n) && n >= 200 && n <= 1920)) throw new Error('Invalid size');
const reference = resolve(root, args.get('reference') ?? 'qa/reference-fit/iteration04/05.png');
const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sources = () => Object.fromEntries(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', 'src', 'assets/textures/fit05-sheen.png'], { encoding: 'utf8', cwd: root }).trim().split('\n').filter(Boolean).map((p) => [p, sha(readFileSync(resolve(root, p)))]));
mkdirSync(out, { recursive: true });
const report = { created: new Date().toISOString(), branch: execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim(),
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), sourceHashes: sources(),
  viewport: { width, height, deviceScaleFactor: 1 }, times: [14.48, 14.49, 14.50, 14.51, 14.52],
  scope: 'Actual unannotated Three.js frames. Full authored pose is compared exactly; wrap-frame deltas are descriptive, with a fitstill05 control for other effects. Analytic phase conditions and finite geometry are separate from rendered continuity. No Android or frame-rate claim.',
  checks: {}, captures: [], errors: [], warnings: [] };
const check = (name, pass, evidence) => { report.checks[name] = { pass, ...evidence }; console.log(`${name}: ${pass ? 'PASS' : 'FAIL'}`); };
let browser, vite;
try {
  vite = await startVite(5279); const { chromium } = loadPlaywright();
  const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ args: CHROMIUM_ARGS, ...(executablePath ? { executablePath } : {}) });
  const open = async (name, query, viewport) => {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    page.on('pageerror', (e) => report.errors.push({ page: name, type: 'pageerror', message: e.message }));
    page.on('console', (m) => {
      if (!['error', 'warning'].includes(m.type())) return;
      const entry = { page: name, type: m.type(), url: m.location().url, message: m.text() };
      (m.type() === 'warning' || (entry.url === `${vite.url}/favicon.ico` && entry.message.includes('404 (Not Found)')) ? report.warnings : report.errors).push(entry);
    });
    page.on('response', (r) => { if (r.status() < 400) return; const entry = { page: name, type: 'response', url: r.url(), status: r.status() }; (r.url() === `${vite.url}/favicon.ico` && r.status() === 404 ? report.warnings : report.errors).push(entry); });
    page.on('requestfailed', (r) => report.errors.push({ page: name, type: 'requestfailed', url: r.url(), error: r.failure()?.errorText }));
    await page.goto(`${vite.url}/?${query}&qa=1&dpr=1`);
    await page.waitForFunction(() => window.__rainbow?.ready || window.__error, null, { timeout: 240000 });
    const error = await page.evaluate(() => window.__error); if (error) throw new Error(error);
    await page.evaluate(() => document.fonts.ready); return page;
  };
  const capture = async (page, name, time) => {
    const before = await page.evaluate((t) => { const a = window.__rainbow; a.run(false); a.goto('05', t); a.setSteer(0); a.drawList(); return { state: a.state(), camera: a.camera() }; }, time);
    const file = resolve(out, name + '.png'); await page.screenshot({ path: file, timeout: 180000 });
    const after = await page.evaluate(() => ({ state: window.__rainbow.state(), camera: window.__rainbow.camera() }));
    if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error('Frozen state/camera changed');
    report.captures.push({ file: relative(root, file), time, sha256: sha(readFileSync(file)), ...before }); return file;
  };
  let pose;
  const moving = await open('moving', 'fit05=1', args.has('pose') ? { width, height } : { width: 864, height: 1536 });
  if (args.has('pose')) {
    pose = resolve(root, args.get('pose')); const metadata = JSON.parse(readFileSync(resolve(dirname(pose), 'capture.json'), 'utf8'));
    const record = metadata.captures.find((c) => resolve(root, c.file) === pose);
    if (!record || record.time !== 12 || record.sha256 !== sha(readFileSync(pose)) || new URLSearchParams(metadata.effectiveQuery).get('fit05') !== '1') throw new Error('Reused pose lacks matching actual fit05 time-12 capture metadata');
    const mismatches = Object.entries(metadata.source ?? {}).filter(([p, hash]) => report.sourceHashes[p] !== undefined && report.sourceHashes[p] !== hash).map(([p]) => p);
    if (mismatches.length) throw new Error('Reused pose source differs: ' + mismatches.join(', '));
    report.reusedPose = { file: relative(root, pose), metadata: relative(root, resolve(dirname(pose), 'capture.json')) };
    await moving.evaluate(() => { const a = window.__rainbow; a.run(false); a.goto('05', 12); a.setSteer(0); a.drawList(); });
  } else { pose = await capture(moving, 'authored-pose-12', 12); await moving.setViewportSize({ width, height }); }
  const poseDiff = JSON.parse(execFileSync('python3', ['-c', 'import json,sys,numpy as np;from PIL import Image;a=np.asarray(Image.open(sys.argv[1]).convert("RGBA"),dtype=np.int16);b=np.asarray(Image.open(sys.argv[2]).convert("RGBA"),dtype=np.int16);assert a.shape==b.shape;d=np.abs(a-b);print(json.dumps({"changedPixels":int(np.any(d,axis=2).sum()),"maxChannelDelta":int(d.max()),"meanChannelDelta":float(d.mean())}))', reference, pose], { encoding: 'utf8' }));
  check('authoredPoseUnchanged', poseDiff.changedPixels === 0, { reference: relative(root, reference), actual: relative(root, pose), ...poseDiff });
  check('authoredPoseWithinOneChannelLevel', poseDiff.maxChannelDelta <= 1, { ...poseDiff,
    rationale: 'A separate maximum-error bound on decoded 8-bit channels, not pixel identity. A one-level difference is consistent with render quantization; its cause is not proven by this bound.' });
  const paths = { moving: [], still: [] };
  for (const time of report.times) paths.moving.push(await capture(moving, `moving-${time.toFixed(2)}`, time));
  report.geometry = await moving.evaluate(async () => {
    const url = performance.getEntriesByType('resource').map((r) => r.name).find((p) => /\/\.vite\/deps\/three\.js(?:\?|$)/.test(p));
    if (!url) throw new Error('Loaded Three module not found'); const THREE = await import(url);
    const old = THREE.Object3D.prototype.traverse; let scene;
    THREE.Object3D.prototype.traverse = function (fn) { if (this.isScene && !scene) scene = this; return old.call(this, fn); };
    try { window.__rainbow.drawList(); } finally { THREE.Object3D.prototype.traverse = old; }
    const glints = scene?.getObjectByName('fit05_authored_glints'); if (!glints) throw new Error('Actual glint mesh missing');
    const attributes = glints.geometry.attributes;
    return { instanced: !!glints.isInstancedMesh, instances: glints.count, vertices: attributes.position.count,
      finiteAttributes: Object.values(attributes).every((a) => Array.from(a.array).every(Number.isFinite)),
      cycles: Array.from(attributes.aCycle.array), motion: glints.material.uniforms.uMotion.value,
      declaredMotion: glints.userData.fit05, note: 'Actual live mesh attributes and uniforms. Mathematical phase samples below do not replace rendered-frame inspection.' };
  });
  const g = report.geometry, period = g.declaredMotion.flowPeriod, maxOffset = g.declaredMotion.maxFlowOffset;
  const phaseRows = [12, 14.49, 14.5 - 1e-6, 14.5, 14.5 + 1e-6, 14.51].map((time) => {
    const layers = g.cycles.map((cycle) => { const phase = ((time - 12) * g.motion / period + .5 + cycle) % 1; return { cycle, phase, weight: 1 - Math.abs(2 * phase - 1), deltaS: -(phase - .5) * 2 * maxOffset }; });
    return { time, layers, sumWeight: layers.reduce((sum, l) => sum + l.weight, 0) };
  });
  check('phaseAndFiniteGeometry', g.instanced && g.instances === 2 && g.finiteAttributes && g.motion === 1
    && g.cycles.length === 2 && phaseRows.every((r) => Math.abs(r.sumWeight - 1) < 1e-10 && r.layers.every((l) => Number.isFinite(l.deltaS) && l.weight >= 0 && l.weight <= 1))
    && phaseRows.find((r) => r.time === 14.5).layers.some((l) => l.phase === 0 && l.weight === 0), { geometry: g, phaseRows,
      meaning: 'The declared two-layer flow has unit summed weight and its resetting layer reaches zero opacity. Live geometry inputs are finite. This is an analytic condition, not a pixel continuity threshold.' });
  await moving.close();
  const still = await open('fit-still-control', 'fit05=1&fitstill05=1', { width, height });
  // Match the moving page's authored-pose warmup before the temporal series. Particle pools and
  // page-local RNG can still differ, so paired residuals remain an approximation, not isolation.
  await still.evaluate(() => { const a = window.__rainbow; a.run(false); a.goto('05', 12); a.setSteer(0); a.drawList(); });
  for (const time of report.times) paths.still.push(await capture(still, `still-${time.toFixed(2)}`, time));
  await still.close();
  const inputs = resolve(out, 'temporal-inputs.json'); writeFileSync(inputs, JSON.stringify({ paths, times: report.times }));
  report.renderedDeltas = JSON.parse(execFileSync('python3', ['-c', `import json,sys,numpy as np
from PIL import Image
r=json.load(open(sys.argv[1]));m=[np.asarray(Image.open(p).convert('RGB'),dtype=float) for p in r['paths']['moving']];s=[np.asarray(Image.open(p).convert('RGB'),dtype=float) for p in r['paths']['still']]
h,w=m[0].shape[:2];yy,xx=np.mgrid[:h,:w];mask=(yy>=h*.4)&(yy<h*.94)&~((yy>h*.5)&(xx>w*.25)&(xx<w*.72))
def metric(a):
 v=np.abs(a[mask]);return {'meanAbsoluteRgb':float(v.mean()),'p95ChannelDelta':float(np.percentile(v,95)),'maxChannelDelta':float(v.max())}
steps=[]
for i in range(1,len(m)):
 steps.append({'from':r['times'][i-1],'to':r['times'][i],'moving':metric(m[i]-m[i-1]),'stillControl':metric(s[i]-s[i-1]),'changeOfMovingMinusControl':metric((m[i]-s[i])-(m[i-1]-s[i-1]))})
print(json.dumps({'roiPixels':int(mask.sum()),'steps':steps,'meaning':'Descriptive adjacent-frame deltas in a fixed lower screen region excluding central Benny. Other particles can remain. The still control freezes only fit material/glint flow; control-subtracted deltas help separate that flow, but do not certify optical-flow direction or impose a blind pass threshold.'}))`, inputs], { encoding: 'utf8' }));
  check('noBrowserErrors', report.errors.length === 0, { errors: report.errors, warnings: report.warnings });
} catch (e) { report.errors.push({ type: 'harness', error: e.stack || String(e) }); }
finally {
  await browser?.close(); await vite?.close(); const after = sources();
  report.sourceChanged = [...new Set([...Object.keys(after), ...Object.keys(report.sourceHashes)])].filter((p) => after[p] !== report.sourceHashes[p]);
  if (report.sourceChanged.length) report.errors.push({ type: 'source-changed', files: report.sourceChanged });
  const requiredChecks = ['authoredPoseUnchanged', 'authoredPoseWithinOneChannelLevel', 'phaseAndFiniteGeometry', 'noBrowserErrors'];
  report.pass = report.errors.length === 0 && requiredChecks.every((name) => report.checks[name]?.pass === true);
  writeFileSync(resolve(out, 'report.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ output: relative(root, out), pass: report.pass, checks: Object.fromEntries(Object.entries(report.checks).map(([k, v]) => [k, v.pass])), errors: report.errors }));
process.exitCode = report.pass ? 0 : 1;
