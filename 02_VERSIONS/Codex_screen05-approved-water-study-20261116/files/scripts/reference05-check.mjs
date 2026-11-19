#!/usr/bin/env node
// Focused real-browser checks for the separate approved-water Screen 05 study.
// Outputs only qa/approved-water-study/tests; no historical reports or reference images are rewritten.
// node scripts/reference05-check.mjs [--q=reference05=1] [--size=432x768] [--label=reference05] [--temporal-only|--geometry-only]
// CHROMIUM_EXECUTABLE_PATH selects a browser; otherwise use installed /usr/bin/chromium when present.
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const option = (key, fallback) => process.argv.find((a) => a.startsWith(`--${key}=`))?.slice(key.length + 3) ?? fallback;
const query = option('q', 'reference05=1');
const label = option('label', 'reference05');
const temporalOnly = process.argv.includes('--temporal-only');
const geometryOnly = process.argv.includes('--geometry-only');
if (temporalOnly && geometryOnly) throw new Error('Choose only one focused test mode');
if (!/^[a-z0-9_-]+$/i.test(label)) throw new Error('Use a simple file-safe label');
const [width, height] = option('size', '432x768').split('x').map(Number);
if (![width, height].every((n) => Number.isInteger(n) && n >= 200 && n <= 1920)) throw new Error('Invalid size');
const out = `qa/approved-water-study/tests/${label}`;
if (existsSync(out)) throw new Error('Output already exists; choose a fresh --label to preserve all prior evidence');
for (const path of ['qa', 'qa/approved-water-study', 'qa/approved-water-study/tests']) {
  if (existsSync(path) && lstatSync(path).isSymbolicLink()) throw new Error('Output parent must not be a symlink: ' + path);
}
mkdirSync(out, { recursive: true });
const sourceHashes = () => {
  const paths = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', 'src'], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
  return Object.fromEntries(paths.map((path) => [path, createHash('sha256').update(readFileSync(path)).digest('hex')]));
};
const effectiveQuery = new URLSearchParams(query);
effectiveQuery.set('qa', '1');
effectiveQuery.set('dpr', '1');
const report = {
  created: new Date().toISOString(), commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  branch: execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim(),
  sourceHashes: sourceHashes(),
  query, effectiveQuery: effectiveQuery.toString(), temporalOnly, geometryOnly, viewport: { width, height, deviceScaleFactor: 1 },
  note: 'Real WebGL rendering and browser input events; simulation is stepped deterministically. Not Android hardware performance.',
  checks: {}, errors: [], failedResources: [], nonGameResourceWarnings: [], captures: [],
};
const check = (name, pass, evidence) => { report.checks[name] = { pass, ...evidence }; console.log(`${name}: ${pass ? 'PASS' : 'FAIL'}`); };
const { chromium } = loadPlaywright();
const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
const vite = await startVite(5267);
let browser;
try {
  browser = await chromium.launch({ args: CHROMIUM_ARGS, ...(executablePath ? { executablePath } : {}) });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const watchPage = (page, name) => {
  page.on('pageerror', (e) => report.errors.push(`[${name}] ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    const url = m.location().url;
    // The repository has no favicon. Chromium's automatic request was verified as the sole 404 in
    // the initial run. Keep that exact non-game request visible; do not ignore any shader/asset error.
    if (url === `${vite.url}/favicon.ico` && m.text().includes('404 (Not Found)')) {
      report.nonGameResourceWarnings.push({ page: name, url, status: 404, source: 'console', reason: 'Pre-existing missing browser favicon; no game asset is substituted.' });
    } else report.errors.push(`[${name}] ${m.text().slice(0, 1000)} (${url || 'no source URL'})`);
  });
  page.on('response', (response) => { if (response.status() >= 400) report.failedResources.push({ page: name, status: response.status(), url: response.url() }); });
  page.on('requestfailed', (request) => report.errors.push(`[${name}] ${request.url()}: ${request.failure()?.errorText}`));
  };
  watchPage(page, 'main');
  await page.goto(`${vite.url}/?${effectiveQuery}`);
  await page.waitForFunction(() => window.__rainbow?.ready || window.__error, null, { timeout: 240000 });
  const startupError = await page.evaluate(() => window.__error);
  if (startupError) throw new Error(startupError);
  report.renderer = await page.evaluate(() => {
    const gl = document.querySelector('canvas').getContext('webgl2'), ext = gl.getExtension('WEBGL_debug_renderer_info');
    return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown';
  });
  await page.evaluate(() => document.fonts.ready);
  const state = () => page.evaluate(() => window.__rainbow.state());
  const step = (n) => page.evaluate((count) => window.__rainbow.step(count, 1 / 60), n);
  const setupInput = () => page.evaluate(() => { const a = window.__rainbow; a.run(false); a.goto('05'); a.setSteer(null); return a.state(); });
  const shot = async (name, extra = {}) => {
    await page.evaluate(() => window.__rainbow.drawList());
    const path = `${out}/${name}.png`;
    await page.screenshot({ path, timeout: 180000 });
    report.captures.push({ file: path, state: await state(), ...extra });
  };

  if (!temporalOnly) {
  if (!geometryOnly) {
  await page.evaluate(() => { const a = window.__rainbow; a.run(false); a.goto('05', 12); a.drawList(); });
  await shot('main_quality_05', { waterTime: 12, query: effectiveQuery.toString() });
  report.mainQualityResources = await page.evaluate(() => { const { fps, ...resources } = window.__rainbow.stats(); return resources; });
  // Real keydown/keyup events reach createInput; setSteer(null) releases the QA override.
  const keys = [];
  for (const [key, sign] of [['ArrowLeft', -1], ['ArrowRight', 1]]) {
    const before = await setupInput();
    await page.keyboard.down(key);
    const after = await step(24);
    await page.keyboard.up(key);
    keys.push({ key, before: before.lat, after: after.lat, pass: (after.lat - before.lat) * sign > 0.2 });
  }
  check('keyboardSteering', keys.every((r) => r.pass), { events: keys });

  const pointerBefore = await setupInput();
  await page.mouse.move(width * 0.8, height * 0.72);
  await page.mouse.down();
  const pressed = await step(24);
  await page.mouse.move(width * 0.18, height * 0.72, { steps: 5 });
  const dragged = await step(36);
  await page.mouse.up();
  check('pointerPressAndDrag', pressed.lat > pointerBefore.lat + 0.2 && dragged.lat < pressed.lat - 0.2,
    { before: pointerBefore.lat, rightPress: pressed.lat, leftDrag: dragged.lat });

  await setupInput();
  const beforePause = await step(10);
  await page.locator('[data-k="pause"]').click();
  const paused = await step(60);
  await page.locator('.pausedOverlay').click();
  const resumed = await step(10);
  check('hudPauseResume', paused.paused && paused.s === beforePause.s && !resumed.paused && resumed.s > paused.s,
    { before: beforePause.s, paused: paused.s, resumed: resumed.s });
  await page.keyboard.press('p');
  const keyPaused = await step(20);
  await page.keyboard.press('Escape');
  const keyResumed = await step(10);
  check('keyboardPauseResume', keyPaused.paused && keyPaused.s === resumed.s && !keyResumed.paused && keyResumed.s > keyPaused.s,
    { paused: keyPaused.s, resumed: keyResumed.s });

  await page.evaluate(() => { const a = window.__rainbow; a.goto('11'); a.step(420, 1 / 60); a.drawList(); });
  await page.locator('[data-k="replay"]').waitFor({ state: 'visible', timeout: 15000 });
  const victory = await state();
  await page.locator('[data-k="replay"]').click();
  const replay = await state();
  check('replayButton', victory.mode === 'end' && replay.mode === 'intro' && replay.stage === '01' && replay.s === 0 && replay.hearts === 5,
    { before: victory, after: replay });
  }

  // Inspect the actual course/far-block objects used by the rendered game. In addition to finite geometry,
  // independently intersect each near-bank curve with the far seam plane and compare its lateral position.
  report.geometry = await page.evaluate(async () => {
    const a = window.__rainbow;
    a.run(false);
    a.goto('05');
    // goto settles Benny at one simulated step ahead, then restores state.s. Two zero-time updates
    // synchronize the rendered body and water's previous-frame focus without advancing the ride.
    a.step(2, 0);
    const { far05Debug: d, farRiverGeometry } = await import('/src/world/far05.ts');
    const { channel05, LIQUID05, REFERENCE05, EDGE_LIFT, ampAt } = await import('/src/vfx/waterRibbon.ts');
    const { reference05Shared, reference05Weight } = await import('/src/vfx/reference05Geometry.ts');
    const { ft, farLay: lay, level } = d;
    const geo = farRiverGeometry(ft, lay, level);
    const attr = geo.attributes;
    const finite = Object.values(attr).every((at) => Array.from(at.array).every(Number.isFinite));
    const rows = [-0.01, 0, 0.01, 1.99, 2, 2.01, 9.99, 10, 10.01, 24, 26.99, 27, 27.01, 60, 110, 215, 330].map((z) => ({ z, ...lay.row(z) }));
    const localJumps = [0, 2, 5, 10, 24, 27].map((z) => {
      const left = lay.row(z - 0.001), right = lay.row(z + 0.001);
      return { z, maxDelta: Math.max(...Object.keys(left).map((k) => Math.abs(left[k] - right[k]))) };
    });
    const entryTangents = [2, 27].map((z) => {
      const e = 0.01, left = lay.row(z - e), centre = lay.row(z), right = lay.row(z + e);
      const slopeMismatch = Object.fromEntries(['xB', 'hw', 'cL', 'cR', 'wL', 'wR'].map((k) =>
        [k, Math.abs((centre[k] - left[k]) / e - (right[k] - centre[k]) / e)]));
      return { z, slopeMismatch, maxSlopeMismatch: Math.max(...Object.values(slopeMismatch)) };
    });
    const ribbonEnvelope = Array.from({ length: 101 }, (_, i) => ({ z: i / 2, ...lay.row(i / 2) }));
    const bank = (side) => {
      const sample = (s) => {
        const f = a.course.sample(s), ch = channel05(a.course, s), lateral = ch.c + side * ch.hw;
        const p = f.pos.clone().addScaledVector(f.right, lateral);
        return { s, p, f, lateral, axial: p.clone().sub(ft.c0).dot(ft.T) };
      };
      let lo = ft.sF - 8, hi = ft.sF + 16;
      for (let i = 0; i < 48; i++) { const mid = (lo + hi) / 2; if (sample(mid).axial < 0) lo = mid; else hi = mid; }
      const n = sample((lo + hi) / 2), r = lay.row(0), x = n.p.clone().sub(ft.c0).dot(ft.Rt);
      const expected = r.xB + side * r.hw;
      const u = n.lateral / (a.course.widthAt(n.s) / 2);
      const nearSurface = n.p.clone().addScaledVector(n.f.up, EDGE_LIFT * Math.abs(u) ** 3);
      const farSurface = ft.point(0, ft.Rt.clone().multiplyScalar(expected).addScaledVector(ft.U, level + EDGE_LIFT));
      return { side, s: n.s, axialResidual: n.axial, lateralGap: x - expected,
        staticSurfaceGap: nearSurface.distanceTo(farSurface) };
    };
    const banks = [-1, 1].map(bank);
    const firstRowLongitudinal = attr.uv.getY(3);
    const bridgeVertices = [];
    if (attr.aRivSeam) for (let j = 3; j <= 19; j++) {
      const seam = attr.aRivSeam, s = seam.getX(j), u = seam.getY(j), f = a.course.sample(s);
      const hw = a.course.widthAt(s) / 2;
      const nearPoint = f.pos.clone().addScaledVector(f.right, u * hw).addScaledVector(f.up, EDGE_LIFT * Math.abs(u) ** 3);
      const nearNormal = f.up.clone().addScaledVector(f.right, -(EDGE_LIFT * 3 * u * Math.abs(u)) / hw).normalize();
      const farPoint = ft.Rt.clone().fromBufferAttribute(attr.position, j);
      const farNormal = ft.Rt.clone().fromBufferAttribute(attr.aRivSeamNormal, j);
      bridgeVertices.push({ vertex: j, s, u, weight: seam.getW(j), amplitudeGap: Math.abs(seam.getZ(j) - ampAt(a.course, s)), staticGap: nearPoint.distanceTo(farPoint),
        waveDirectionGap: nearNormal.distanceTo(farNormal), uvGap: Math.abs(attr.uv.getY(j) - s) });
    }
    const supportLifts = [];
    if (attr.aRivSeam) for (const j of [0, 1, 2, 20, 21, 22]) {
      const s = attr.aRivSeam.getX(j), u = attr.aRivSeam.getY(j), f = a.course.sample(s);
      const base = f.pos.clone().addScaledVector(f.right, u * a.course.widthAt(s) / 2);
      const point = ft.Rt.clone().fromBufferAttribute(attr.position, j);
      supportLifts.push({ vertex: j, u, lift: point.sub(base).dot(f.up) });
    }
    const st = a.course.stage('05');
    const channelJoins = [st.s0, st.s1 + 4].map((s) => {
      const l = channel05(a.course, s - 0.001), r = channel05(a.course, s + 0.001);
      return { s, centreDelta: Math.abs(l.c - r.c), widthDelta: Math.abs(l.hw - r.hw) };
    });
    let liveReference;
    if (REFERENCE05) {
      // Inspect meshes and compiled uniforms that actually render. Import the already-loaded Three
      // URL (including Vite's version query). Previous drawList calls leave own onAfterRender values,
      // so a prototype render hook cannot observe those meshes. Capture the scene through traverse,
      // then temporarily wrap each actual mesh's own callback instead.
      const threeUrl = performance.getEntriesByType('resource').map((r) => r.name).find((url) =>
        /\/(?:\.vite\/deps\/three\.js|three\/build\/three\.module\.js)(?:\?|$)/.test(url));
      if (!threeUrl) throw new Error('Cannot locate the actual loaded Three module for live geometry inspection');
      const THREE = await import(threeUrl);
      const previousTraverse = THREE.Object3D.prototype.traverse;
      let liveScene;
      THREE.Object3D.prototype.traverse = function (callback) {
        if (this.isScene && !liveScene) liveScene = this;
        return previousTraverse.call(this, callback);
      };
      try { a.drawList(); } finally { THREE.Object3D.prototype.traverse = previousTraverse; }
      if (!liveScene) throw new Error('Could not inspect the actual game scene');
      const seen = new Set(), meshes = [];
      const focusS = reference05Shared.uBenny.value.x;
      const exactStateS = a.course.marks['05_crest'];
      const anchor = liveScene.getObjectByName('Benny');
      if (!anchor) throw new Error('Actual scene has no Benny anchor');
      const bodyCentre = (anchor.children[0] ?? anchor).getWorldPosition(new THREE.Vector3());
      const focusFrame = a.course.sample(exactStateS);
      const projectedBodyFocusS = Math.min(a.course.length, Math.max(0,
        exactStateS + bodyCentre.clone().sub(focusFrame.pos).dot(focusFrame.tan)));
      const hooked = [];
      liveScene.traverse((object) => {
        const attributes = object.geometry?.attributes;
        // Foam also carries aRefPosition; only the playable ribbon has the course aUV/aAmp pair.
        if (!(attributes?.aRefPosition && attributes.aUV && attributes.aAmp) && !attributes?.aRivReference) return;
        const previous = object.onAfterRender;
        hooked.push({ object, previous, own: Object.hasOwn(object, 'onAfterRender') });
        object.onAfterRender = function (renderer, scene, camera, geometry, material, group) {
        previous.call(this, renderer, scene, camera, geometry, material, group);
        if (seen.has(this.uuid)) return;
        const at = geometry?.attributes;
        if (!(at?.aRefPosition && at.aUV && at.aAmp) && !at?.aRivReference) return;
        seen.add(this.uuid);
        const near = !!(at.aRefPosition && at.aUV && at.aAmp);
        const compiled = renderer.properties.get(material).uniforms;
        const uniform = near ? material.uniforms?.uBenny : compiled?.uRefBenny;
        let localVertices = 0, localMaxWeight = 0, distantVertices = 0, maxDistantCorrection = 0;
        for (let i = 0; i < at.position.count; i++) {
          const s = near ? at.aUV.getY(i) : at.aRivReference.getW(i);
          const weight = reference05Weight(s, focusS);
          if (s <= focusS + 10) { localVertices++; localMaxWeight = Math.max(localMaxWeight, weight); }
          if (weight > 0) {
            distantVertices++;
            const target = near ? at.aRefPosition : at.aRivReference;
            const delta = near ? Math.hypot(target.getX(i) - at.position.getX(i), target.getY(i) - at.position.getY(i), target.getZ(i) - at.position.getZ(i))
              : Math.hypot(target.getX(i), target.getY(i), target.getZ(i));
            maxDistantCorrection = Math.max(maxDistantCorrection, delta * weight);
          }
        }
        meshes.push({ name: this.name, kind: near ? 'near-ribbon' : 'far-river', vertices: at.position.count,
          sharedUniformIdentity: uniform === reference05Shared.uBenny,
          hasTargetNormal: !!(near ? at.aRefNormal : at.aRivReferenceNormal),
          localVertices, localMaxWeight, distantVertices, maxDistantCorrection });
        };
      });
      try { a.drawList(); } finally {
        for (const { object, previous, own } of hooked) {
          if (own) object.onAfterRender = previous; else delete object.onAfterRender;
        }
      }
      liveReference = { focusS, stateS: a.state().s, exactStateS, bodyCentre: bodyCentre.toArray(), projectedBodyFocusS,
        bodyFocusGap: Math.abs(focusS - projectedBodyFocusS), meshes,
        note: 'Inspect actual rendered mesh attributes and compiled uniform identity. Expected focus is the real lifted Benny body centre projected onto the current course tangent, as water.wake uses; it is not state.s. Two zero-time steps synchronize the previous-frame focus after goto. Local zero-weight protection is checked on actual attributes. Rendered seam, triangle residuals and layer raycasts are tested separately by scripts/reference05-seam.ts.' };
    }
    const result = { referenceEnabled: REFERENCE05, liquidEnabled: LIQUID05, finite, vertices: attr.position.count, triangles: geo.index.count / 3,
      seamS: ft.sF, seamLongitudinal: firstRowLongitudinal, seamUvGap: Math.abs(firstRowLongitudinal - ft.sF),
      rows, localJumps, entryTangents, ribbonEnvelope, banks, channelJoins, bridgeVertices, supportLifts, maxSupportLift: EDGE_LIFT, liveReference,
      note: 'banks.staticSurfaceGap measures the legacy unbridged floor formula. bridgeVertices compares banked base first-row positions/wave vectors before the dynamic reference target blend. Rendered reference seam and triangle residuals are tested separately by scripts/reference05-seam.ts; ride captures support visual review.' };
    geo.dispose();
    return result;
  });
  const g = report.geometry;
  check('finiteFarGeometry', g.finite && [...g.rows, ...g.ribbonEnvelope].every((r) =>
    Object.values(r).every(Number.isFinite) && r.hw > 0 && r.wL > 0 && r.wR > 0 && r.cL < r.cR),
    { vertices: g.vertices, triangles: g.triangles, envelopeSamples: g.ribbonEnvelope.length });
  check('bankAndUvContinuity', g.banks.every((b) => Math.abs(b.lateralGap) < 0.001)
    && (g.bridgeVertices.length ? g.bridgeVertices.every((v) => v.uvGap < 0.0001) : g.seamUvGap < 0.0001),
    { banks: g.banks, longitudinalMapping: g.bridgeVertices.length ? 'actual near s varies across the oblique seam' : 'constant legacy seam s', seamUvGap: g.seamUvGap });
  if (g.liquidEnabled) check('baseSurfaceBridge', g.bridgeVertices.length === 17
    && g.bridgeVertices.every((v) => v.staticGap < 0.0001 && v.waveDirectionGap < 0.0001 && v.amplitudeGap < 0.000001 && v.weight === 1),
    { vertices: g.bridgeVertices, tolerances: { staticGap: 0.0001, waveDirectionGap: 0.0001, amplitudeGap: 0.000001 } });
  if (g.liquidEnabled) check('baseFoamSupportHeight', g.supportLifts.length === 6
    && g.supportLifts.every((v) => v.lift >= -0.0001 && v.lift <= g.maxSupportLift + 0.0001),
    { maximum: g.maxSupportLift, vertices: g.supportLifts });
  check('layoutBlendContinuity', g.localJumps.every((r) => r.maxDelta < 0.02) && g.channelJoins.every((r) => r.centreDelta < 0.01 && r.widthDelta < 0.01),
    { localJumps: g.localJumps, channelJoins: g.channelJoins });
  if (g.referenceEnabled) check('farEntryTangents', g.entryTangents.every((r) => r.maxSlopeMismatch < 0.03),
    { tolerance: 0.03, derivativeStep: 0.01, samples: g.entryTangents });
  if (g.referenceEnabled) {
    const live = g.liveReference;
    check('liveReferenceGeometry', live.meshes.some((m) => m.kind === 'near-ribbon') && live.meshes.some((m) => m.kind === 'far-river')
      && live.bodyFocusGap < 0.000001 && live.meshes.every((m) => m.sharedUniformIdentity && m.hasTargetNormal)
      && live.meshes.some((m) => m.distantVertices > 0 && m.maxDistantCorrection > 0.01), live);
    check('localWaterContact', live.meshes.some((m) => m.kind === 'near-ribbon')
      && live.meshes.filter((m) => m.kind === 'near-ribbon').every((m) => m.localVertices > 0 && m.localMaxWeight === 0),
      { focusS: live.focusS, protectedAheadDistance: 10, meshes: live.meshes.filter((m) => m.kind === 'near-ribbon'),
        note: 'The visible target-frame correction is zero over all sampled near-ribbon vertices behind Benny and through 10 units ahead. Detailed full-width sampled contact regression is also in the numerical seam report.' });
  }
  }

  if (!geometryOnly) {
  // Capture the actual continuous material at equal small steps and several later times. These
  // frames support visual review of toward-camera travel; the numerical checks below establish
  // non-static water-coloured pixels and bounded changes, not an inferred optical-flow direction.
  const pixels = async () => page.evaluate(() => {
    window.__rainbow.drawList();
    const canvas = document.querySelector('canvas'), gl = canvas.getContext('webgl2');
    const all = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, all);
    const values = [], waterMask = [];
    for (let y = 8; y < canvas.height * 0.43; y += 4) for (let x = 8; x < canvas.width - 8; x += 4) {
      if (x > canvas.width * 0.32 && x < canvas.width * 0.7) continue;
      const i = (y * canvas.width + x) * 4;
      values.push(all[i], all[i + 1], all[i + 2]);
      const r = all[i], g = all[i + 1], b = all[i + 2];
      waterMask.push(b > 120 && Math.max(r, g, b) - Math.min(r, g, b) > 50
        && ((b - r > 15 && g > 70) || (r > 130 && r - g > 50)));
    }
    return { values, waterMask };
  });
  const delta = (a, b) => {
    let sum = 0, pixels = 0;
    for (let j = 0; j < a.waterMask.length; j++) {
      if (!a.waterMask[j] || !b.waterMask[j]) continue;
      for (let k = 0; k < 3; k++) sum += Math.abs(a.values[j * 3 + k] - b.values[j * 3 + k]);
      pixels++;
    }
    return { meanAbsoluteRgb: pixels ? sum / (pixels * 3) : null, maskedPixels: pixels };
  };
  const times = [12 - 1 / 60, 12, 12 + 1 / 60, 12.2, 12.4, 12.6];
  const frames = [];
  for (const time of times) {
    await page.evaluate((t) => { window.__rainbow.run(false); window.__rainbow.goto('05', t); }, time);
    await shot(`time_${time.toFixed(4).replace('.', '_')}`, { waterTime: time });
    frames.push(await pixels());
  }
  const smallDeltas = [[0, 1], [1, 2]].map(([a, b]) => ({ from: times[a], to: times[b], ...delta(frames[a], frames[b]) }));
  const motion = delta(frames[1], frames[5]);
  check('animatedWater', motion.maskedPixels > 100 && motion.meanAbsoluteRgb > 0.1, { seconds: 0.6, ...motion });
  check('temporalStepSamples', smallDeltas.every((r) => r.maskedPixels > 100 && r.meanAbsoluteRgb < 15),
    { threshold: 15, units: 'mean absolute RGB difference, range 0–255, at 1/60-second steps in water-coloured lower outer strips', samples: smallDeltas });
  report.motionDirection = { verifiedNumerically: false, evidenceTimes: [12, 12.2, 12.4, 12.6],
    note: 'Review the actual frozen frame sequence for reflection travel toward the camera. Pixel activity alone does not certify direction; no shader-formula mirror is used as a direction test.' };
  }

  if (!temporalOnly && !geometryOnly) {
  // Ride from the checkpoint through the forced-perspective section opening and into stage 06.
  const g = report.geometry;
  const limits = await page.evaluate(() => { const a = window.__rainbow; a.goto('05'); a.unfreeze(); a.setSteer(0); return { start: a.state().s, join: a.course.stage('06').s0 }; });
  const targets = [...new Set([g.seamS - 12, g.seamS - 6, g.seamS, g.seamS + 4, limits.join - 0.5, limits.join + 0.5, limits.join + 4])].filter((s) => s > limits.start).sort((a, b) => a - b);
  report.ride = { samples: [], maxCameraStep: 0, maxBennyYStep: 0, nonMonotonicSteps: 0 };
  for (const target of targets) {
    const segment = await page.evaluate((stop) => {
      const a = window.__rainbow; let prev = a.state(), maxCameraStep = 0, maxBennyYStep = 0, nonMonotonicSteps = 0, steps = 0;
      while (prev.s < stop && steps < 1200 && prev.mode === 'ride') {
        const next = a.step(1, 1 / 60);
        maxCameraStep = Math.max(maxCameraStep, Math.hypot(...next.cam.map((v, i) => v - prev.cam[i])));
        maxBennyYStep = Math.max(maxBennyYStep, Math.abs(next.bennyY - prev.bennyY));
        if (next.s <= prev.s) nonMonotonicSteps++;
        prev = next; steps++;
      }
      return { state: prev, steps, maxCameraStep, maxBennyYStep, nonMonotonicSteps };
    }, target);
    report.ride.samples.push(segment);
    report.ride.maxCameraStep = Math.max(report.ride.maxCameraStep, segment.maxCameraStep);
    report.ride.maxBennyYStep = Math.max(report.ride.maxBennyYStep, segment.maxBennyYStep);
    report.ride.nonMonotonicSteps += segment.nonMonotonicSteps;
    await shot(`ride_s${target.toFixed(2).replace('.', '_')}`, { targetS: target });
  }
  const end = await state();
  check('screen05To06', end.stage === '06' && report.ride.nonMonotonicSteps === 0 && report.ride.maxCameraStep < 1.5 && report.ride.maxBennyYStep < 1,
    { stage: end.stage, maxCameraStep: report.ride.maxCameraStep, maxBennyYStep: report.ride.maxBennyYStep, nonMonotonicSteps: report.ride.nonMonotonicSteps });
  }
  report.stats = await page.evaluate(() => { const { fps, ...resources } = window.__rainbow.stats(); return resources; });
  if (!temporalOnly && !geometryOnly) {
    const lowQuery = new URLSearchParams(effectiveQuery);
    lowQuery.set('quality', 'low');
    const lowPage = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    const errorsBefore = report.errors.length, resourcesBefore = report.failedResources.length;
    watchPage(lowPage, 'low-quality');
    await lowPage.goto(`${vite.url}/?${lowQuery}`);
    await lowPage.waitForFunction(() => window.__rainbow?.ready || window.__error, null, { timeout: 240000 });
    const startup = await lowPage.evaluate(() => window.__error);
    if (startup) throw new Error(startup);
    await lowPage.evaluate(() => document.fonts.ready);
    const low = await lowPage.evaluate(() => {
      const a = window.__rainbow; a.run(false); a.goto('05', 12); a.drawList();
      const { fps, ...stats } = a.stats(), gl = document.querySelector('canvas').getContext('webgl2');
      return { state: a.state(), camera: a.camera(), stats, contextLost: !gl || gl.isContextLost() };
    });
    const file = `${out}/low_quality_05.png`;
    await lowPage.screenshot({ path: file, timeout: 180000 });
    report.captures.push({ file, waterTime: 12, query: lowQuery.toString(), ...low });
    const failedGameAssets = report.failedResources.slice(resourcesBefore).filter((r) => !(r.url === `${vite.url}/favicon.ico` && r.status === 404));
    check('lowQualityShader', !low.contextLost && low.stats.calls > 0 && low.stats.triangles > 0
      && report.errors.length === errorsBefore && failedGameAssets.length === 0,
      { ...low, query: lowQuery.toString(), failedGameAssets, note: 'Compilation and render/resource evidence only; no frame-rate claim.' });
    await lowPage.close();
  }
  const gameResourceErrors = report.failedResources.filter((r) => !(r.url === `${vite.url}/favicon.ico` && r.status === 404));
  check('noBrowserErrors', report.errors.length === 0 && gameResourceErrors.length === 0,
    { count: report.errors.length, gameResourceErrors, nonGameResourceWarnings: report.nonGameResourceWarnings });
} catch (error) {
  report.errors.push(error.stack || String(error));
  check('completed', false, { message: String(error) });
} finally {
  const after = sourceHashes();
  report.sourceChangedDuringRun = [...new Set([...Object.keys(report.sourceHashes), ...Object.keys(after)])].filter((file) => report.sourceHashes[file] !== after[file]);
  if (report.sourceChangedDuringRun.length) report.errors.push('Source changed during test: ' + report.sourceChangedDuringRun.join(', '));
  report.pass = Object.values(report.checks).every((c) => c.pass) && report.errors.length === 0;
  writeFileSync(`${out}/report.json`, JSON.stringify(report, null, 2) + '\n');
  await browser?.close();
  await vite.close();
}
console.log(JSON.stringify({ out, pass: report.pass, checks: Object.fromEntries(Object.entries(report.checks).map(([key, value]) => [key, value.pass])), errors: report.errors, warnings: report.nonGameResourceWarnings }, null, 2));
process.exitCode = report.pass ? 0 : 1;
