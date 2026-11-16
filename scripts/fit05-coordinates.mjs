#!/usr/bin/env node
// Actual rendered-water screen coordinates, without changing game source.
// node scripts/fit05-coordinates.mjs --q=reference05=1 --out=qa/reference-fit/coordinates
//   [--size=864x1536] [--time=12] [--visible=1]
// Float32 RGBA = (s, lateral, type: 1 near / 2 far, valid). Rows start at top left.
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { resolve, relative, dirname, sep, isAbsolute } from 'node:path';
import { loadPlaywright, CHROMIUM_ARGS, startVite } from './lib/pw.mjs';

const options = new Map();
for (const arg of process.argv.slice(2)) {
  const match = /^--(q|out|size|time|visible)=(.*)$/.exec(arg);
  if (!match) throw new Error(`Unknown argument: ${arg}`);
  options.set(match[1], match[2]);
}
const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const out = resolve(root, options.get('out') ?? 'qa/reference-fit/coordinates');
const boundary = relative(resolve(root, 'qa/reference-fit'), out);
if (isAbsolute(boundary) || boundary === '..' || boundary.startsWith(`..${sep}`)) throw new Error('Output must be under qa/reference-fit');
for (let p = out; p !== root; p = dirname(p)) if (existsSync(p) && lstatSync(p).isSymbolicLink()) throw new Error('Symlink output parent');
if (existsSync(out)) throw new Error('Choose a fresh output directory; existing captures are preserved');
const [width, height] = (options.get('size') ?? '864x1536').split('x').map(Number);
if (![width, height].every((v) => Number.isInteger(v) && v >= 200 && v <= 4096)) throw new Error('Invalid size');
const time = Number(options.get('time') ?? 12), visible = options.get('visible') === '1';
if (!Number.isFinite(time) || time < 0) throw new Error('Invalid time');
const query = new URLSearchParams(options.get('q') ?? 'reference05=1');
query.set('qa', '1'); query.set('dpr', '1');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const sources = () => Object.fromEntries(execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '--', 'src'], { cwd: root, encoding: 'utf8' })
  .trim().split('\n').filter(Boolean).map((p) => [p, hash(readFileSync(resolve(root, p)))]));
mkdirSync(out, { recursive: true });
const report = {
  created: new Date().toISOString(), branch: execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim(),
  commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), sourceHashes: sources(),
  query: query.toString(), viewport: { width, height, deviceScaleFactor: 1 }, time, visibleDepthPass: visible,
  files: [], errors: [], warnings: [],
  channels: ['s', 'lateral', 'type (1 = near water, 2 = far water)', 'valid (1 = water, 0 = no water)'],
  dtype: '<f4', shape: [height, width, 4], compression: 'gzip',
  layout: 'Float32 little-endian, interleaved RGBA, row-major TOP LEFT. Pixel (x,y): offset=((y*width+x)*4)*4 bytes.',
  coordinates: 'Near: s=vUV.y, lateral=vUV.x*vHalfW (course frame). Far: s=vRivUv.y, lateral=vRivLat (forced-tunnel chord frame). These lateral frames are different; use the type channel.',
  method: 'Actual live water meshes, frozen game camera and vertex shaders. A wrapper calls each original fragment main (retaining all discards), then overrides only the output with coordinates. Water-only pass hides other renderables; it includes water normally occluded by Benny, coins or foam. No postprocessing, antialiasing, HUD, tone mapping or colour encoding is applied to the coordinate data.',
  visibleMaskMeaning: 'Optional --visible=1 applies original scene depth-writing occluders. It is a depth mask, not final transparency compositing: non-depth-writing effects do not mask water, and translucent depth-writing surfaces mask it fully.',
};
let browser, vite;
try {
  vite = await startVite(5273);
  const { chromium } = loadPlaywright();
  const executablePath = process.env.CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);
  browser = await chromium.launch({ args: CHROMIUM_ARGS, ...(executablePath ? { executablePath } : {}) });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => report.errors.push({ type: 'pageerror', message: e.message }));
  page.on('console', (m) => {
    if (!['error', 'warning'].includes(m.type())) return;
    const item = { type: m.type(), url: m.location().url, message: m.text() };
    if (m.type() === 'warning' || (item.url === `${vite.url}/favicon.ico` && item.message.includes('404'))) report.warnings.push(item);
    else report.errors.push(item);
  });
  page.on('response', (r) => {
    if (r.status() < 400) return;
    const item = { type: 'response', url: r.url(), status: r.status() };
    (r.url() === `${vite.url}/favicon.ico` && r.status() === 404 ? report.warnings : report.errors).push(item);
  });
  page.on('requestfailed', (r) => report.errors.push({ type: 'requestfailed', url: r.url(), error: r.failure()?.errorText }));
  console.log(`Capture starting: ${width}x${height}, time=${time}, ${query}`);
  await page.goto(`${vite.url}/?${query}`);
  await page.waitForFunction(() => window.__rainbow?.ready || window.__error, null, { timeout: 240000 });
  const startup = await page.evaluate(() => window.__error);
  if (startup) throw new Error(startup);
  await page.evaluate(() => document.fonts.ready);
  report.frozen = await page.evaluate((t) => {
    const a = window.__rainbow; a.run(false); a.goto('05', t); a.setSteer(0); const drawList = a.drawList();
    return { state: a.state(), camera: a.camera(), drawList };
  }, time);
  const baseline = resolve(out, 'baseline.png');
  await page.screenshot({ path: baseline, timeout: 180000 });
  report.files.push({ file: 'baseline.png', sha256: hash(readFileSync(baseline)) });
  const result = await page.evaluate(async ({ width, height, visible }) => {
    const a = window.__rainbow;
    const threeUrl = performance.getEntriesByType('resource').map((r) => r.name).find((url) => /\/(?:\.vite\/deps\/three\.js|three\/build\/three\.module\.js)(?:\?|$)/.test(url));
    if (!threeUrl) throw new Error('Loaded Three module not found');
    const THREE = await import(threeUrl);
    let scene, renderer, camera;
    const traverse = THREE.Object3D.prototype.traverse;
    THREE.Object3D.prototype.traverse = function (fn) { if (this.isScene && !scene) scene = this; return traverse.call(this, fn); };
    try { a.drawList(); } finally { THREE.Object3D.prototype.traverse = traverse; }
    if (!scene) throw new Error('Actual scene not found');
    const waters = [], renderables = [];
    scene.traverse((o) => {
      if (o.isMesh || o.isPoints || o.isSprite || o.isLine) renderables.push({ object: o, visible: o.visible });
      const at = o.geometry?.attributes;
      if (at?.aUV && at.aHalfW && at.aAmp) waters.push({ object: o, type: 1 });
      else if (at?.aRivLat && at.aRivA && at.aRivB) waters.push({ object: o, type: 2 });
    });
    if (!waters.some((o) => o.type === 1) || !waters.some((o) => o.type === 2)) throw new Error('Both actual water meshes are required');
    const first = waters[0].object, oldCallback = first.onAfterRender;
    first.onAfterRender = function (r, s, c, ...rest) { renderer = r; camera = c; oldCallback.call(this, r, s, c, ...rest); };
    try { a.drawList(); } finally { first.onAfterRender = oldCallback; }
    if (!renderer || !camera) throw new Error('Actual renderer/camera not captured');
    const gl = renderer.getContext(), ext = gl.getExtension('WEBGL_debug_renderer_info');
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('Float render targets unsupported; no lossy fallback is silently substituted');
    const target = new THREE.WebGLRenderTarget(width, height, { type: THREE.FloatType, format: THREE.RGBAFormat,
      minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter, depthBuffer: true, stencilBuffer: false });
    target.texture.colorSpace = THREE.NoColorSpace;
    target.texture.internalFormat = 'RGBA32F';
    const original = { target: renderer.getRenderTarget(), background: scene.background, autoClear: renderer.autoClear,
      clearColor: renderer.getClearColor(new THREE.Color()), clearAlpha: renderer.getClearAlpha(),
      viewport: renderer.getViewport(new THREE.Vector4()), scissor: renderer.getScissor(new THREE.Vector4()), scissorTest: renderer.getScissorTest() };
    const materialState = waters.map(({ object, type }) => ({ object, type, original: object.material }));
    const meshMetadata = materialState.map(({ object, type, original }) => ({ name: object.name, type, vertices: object.geometry.attributes.position.count,
      defines: original.defines ?? {}, morphInfluences: object.morphTargetInfluences ?? [],
      focus: type === 1 ? original.uniforms?.uBenny?.value.toArray() : renderer.properties.get(original).uniforms?.uRefBenny?.value.toArray(),
      time: type === 1 ? original.uniforms?.uTime?.value : renderer.properties.get(original).uniforms?.uRivTime?.value }));
    const clones = [], changedColourWrites = new Map();
    const b64 = (bytes) => { const chunks = []; for (let i = 0; i < bytes.length; i += 32768) chunks.push(String.fromCharCode(...bytes.subarray(i, i + 32768))); return btoa(chunks.join('')); };
    const read = (name) => {
      const bottomUp = new Float32Array(width * height * 4), topDown = new Float32Array(bottomUp.length);
      renderer.readRenderTargetPixels(target, 0, 0, width, height, bottomUp);
      const glError = gl.getError(); if (glError) throw new Error(`Float readback WebGL error ${glError}`);
      const counts = { near: 0, far: 0, invalid: 0 }, bounds = { s: [Infinity, -Infinity], lateral: [Infinity, -Infinity] };
      const preview = new Uint8ClampedArray(bottomUp.length);
      for (let y = 0; y < height; y++) topDown.set(bottomUp.subarray((height - 1 - y) * width * 4, (height - y) * width * 4), y * width * 4);
      for (let i = 0; i < topDown.length; i += 4) {
        if (topDown[i + 3] < 0.5) { counts.invalid++; continue; }
        if (![topDown[i], topDown[i + 1], topDown[i + 2], topDown[i + 3]].every(Number.isFinite)) throw new Error('Non-finite coordinate pixel');
        const near = topDown[i + 2] < 1.5; counts[near ? 'near' : 'far']++;
        bounds.s[0] = Math.min(bounds.s[0], topDown[i]); bounds.s[1] = Math.max(bounds.s[1], topDown[i]);
        bounds.lateral[0] = Math.min(bounds.lateral[0], topDown[i + 1]); bounds.lateral[1] = Math.max(bounds.lateral[1], topDown[i + 1]);
        preview.set(near ? [0, 195, 255, 255] : [255, 35, 180, 255], i);
      }
      const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
      canvas.getContext('2d').putImageData(new ImageData(preview, width, height), 0, 0);
      return { name, counts, bounds, bytes: b64(new Uint8Array(topDown.buffer)), preview: canvas.toDataURL('image/png').split(',')[1] };
    };
    const outputs = [];
    try {
      renderer.setRenderTarget(target); renderer.setViewport(0, 0, width, height); renderer.setScissorTest(false);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('Float framebuffer incomplete');
      renderer.setClearColor(0, 0); renderer.autoClear = false; scene.background = null;
      for (const { object, type, original: mat } of materialState) {
        if (Array.isArray(mat)) throw new Error('Water material array is unsupported');
        const clone = mat.clone(); clone.uniforms = mat.uniforms;
        clone.toneMapped = false; clone.blending = THREE.NoBlending;
        clone.customProgramCacheKey = () => `fit05_coordinates_${type}_${mat.customProgramCacheKey()}`;
        clone.onBeforeCompile = (shader, activeRenderer) => {
          mat.onBeforeCompile(shader, activeRenderer);
          const coords = type === 1 ? 'vec4(vUV.y, vUV.x * vHalfW, 1.0, 1.0)' : 'vec4(vRivUv.y, vRivLat, 2.0, 1.0)';
          shader.fragmentShader = '#define main coordinateOriginalMain\n' + shader.fragmentShader
            + '\n#undef main\nvoid main() { coordinateOriginalMain(); gl_FragColor = ' + coords + '; }\n';
        };
        clones.push(clone); object.material = clone;
      }
      for (const { object } of renderables) if (!waters.some((w) => w.object === object)) object.visible = false;
      renderer.clear(true, true, true); renderer.render(scene, camera);
      outputs.push(read('water-coordinates'));
      if (visible) {
        // Establish depth with original non-water materials and their real alpha/discard logic.
        // Transparent effects that do not write depth do not occlude this optional mask.
        for (const entry of renderables) entry.object.visible = entry.visible;
        for (const { object } of waters) object.visible = false;
        for (const { object } of renderables) for (const mat of [object.material].flat()) {
          if (!changedColourWrites.has(mat)) changedColourWrites.set(mat, mat.colorWrite);
          mat.colorWrite = false;
        }
        renderer.clear(true, true, true); renderer.render(scene, camera);
        for (const [mat, value] of changedColourWrites) mat.colorWrite = value;
        for (const entry of renderables) entry.object.visible = waters.some((w) => w.object === entry.object) && entry.visible;
        renderer.render(scene, camera); outputs.push(read('visible-water-coordinates'));
      }
    } finally {
      for (const [mat, value] of changedColourWrites) mat.colorWrite = value;
      for (const entry of materialState) entry.object.material = entry.original;
      for (const entry of renderables) entry.object.visible = entry.visible;
      scene.background = original.background; renderer.autoClear = original.autoClear;
      renderer.setRenderTarget(original.target); renderer.setViewport(original.viewport); renderer.setScissor(original.scissor); renderer.setScissorTest(original.scissorTest);
      renderer.setClearColor(original.clearColor, original.clearAlpha);
      for (const clone of clones) clone.dispose(); target.dispose();
    }
    return { outputs, meshes: meshMetadata, renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown',
      byteOrder: new Uint8Array(new Uint16Array([1]).buffer)[0] === 1 ? 'little-endian' : 'big-endian', after: { state: a.state(), camera: a.camera() } };
  }, { width, height, visible });
  if (result.byteOrder !== 'little-endian') throw new Error('Float output requires a little-endian host; refusing a mismatched <f4 declaration');
  for (const entry of result.outputs) {
    const bytes = Buffer.from(entry.bytes, 'base64'), png = Buffer.from(entry.preview, 'base64');
    if (bytes.length !== width * height * 16) throw new Error('Unexpected coordinate byte count');
    const compressed = gzipSync(bytes, { level: 9 });
    writeFileSync(resolve(out, `${entry.name}.f32.gz`), compressed); writeFileSync(resolve(out, `${entry.name}.png`), png);
    report.files.push({ file: `${entry.name}.f32.gz`, uncompressedBytes: bytes.length, bytes: compressed.length, sha256: hash(compressed), uncompressedSha256: hash(bytes), counts: entry.counts, bounds: entry.bounds });
    report.files.push({ file: `${entry.name}.png`, sha256: hash(png), note: 'Type/coverage preview: cyan near, magenta far, transparent invalid.' });
  }
  report.meshes = result.meshes; report.renderer = result.renderer; report.byteOrder = result.byteOrder;
  report.frozenUnchanged = JSON.stringify(result.after) === JSON.stringify({ state: report.frozen.state, camera: report.frozen.camera });
  if (!report.frozenUnchanged) throw new Error('State/camera changed during coordinate capture');
  if (!result.outputs[0].counts.near || !result.outputs[0].counts.far) throw new Error('Coordinate map must include both water meshes');
  console.log(JSON.stringify({ files: report.files.map((f) => f.file), meshes: report.meshes, counts: result.outputs.map((o) => o.counts) }));
} catch (error) { report.errors.push({ type: 'capture', error: error.stack || String(error) }); }
finally {
  await browser?.close(); await vite?.close();
  const after = sources(); report.sourceChanged = [...new Set([...Object.keys(after), ...Object.keys(report.sourceHashes)])].filter((p) => after[p] !== report.sourceHashes[p]);
  if (report.sourceChanged.length) report.errors.push({ type: 'source-changed', files: report.sourceChanged });
  report.pass = report.errors.length === 0 && report.files.some((f) => f.file === 'water-coordinates.f32.gz');
  writeFileSync(resolve(out, 'metadata.json'), JSON.stringify(report, null, 2) + '\n');
}
console.log(JSON.stringify({ output: relative(root, out), pass: report.pass, errors: report.errors, warnings: report.warnings }));
process.exitCode = report.pass ? 0 : 1;
