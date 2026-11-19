/* Capture the actual static Screen 06 candidate meshes and three game cameras.
 * Usage: node export-runtime.cjs http://localhost:5173 mesh-capture.json.gz
 * Requires Playwright and Chromium. Set CHROMIUM_PATH to use a system browser.
 */
const fs = require('node:fs');
const path = require('node:path');
const { gzipSync, gunzipSync } = require('node:zlib');
const { createHash } = require('node:crypto');
const { chromium } = require('playwright');

const baseURL = process.argv[2];
const output = process.argv[3];
if (!baseURL || !output) throw new Error('Supply a local game URL and a snapshot filename');
const flags = 'qa=1&dpr=1&match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1&m06gold=1&m06fclu=1&cx06ArchedPassage=1';
const candidateFlag = process.env.CREST_CANDIDATE_FLAG || 'cx06OpenCrest=1&cx06RoundedCrest=1';

async function capture(browser, candidate) {
  const page = await browser.newPage({ viewport: { width: 216, height: 384 }, deviceScaleFactor: 1 });
  try {
    const query = flags + (candidate ? '&' + candidateFlag : '');
    await page.goto(baseURL + '/?' + query, { timeout: 90000 });
    await page.waitForFunction(() => window.__rainbow?.ready || window.__error, null, { timeout: 120000 });
    const error = await page.evaluate(() => window.__error);
    if (error) throw Error(error);
    return await page.evaluate(({ query, candidate }) => {
      const api = window.__rainbow;
      api.run(false);
      api.goto('06');
      const { scene, camera } = api.qa3d();
      function binary(values, type) {
        const array = type === 'uint32' ? new Uint32Array(values) : new Float32Array(values);
        const bytes = new Uint8Array(array.buffer);
        let result = '';
        const chunk = 16384;
        for (let i = 0; i < bytes.length; i += chunk)
          result += String.fromCharCode(...bytes.subarray(i, i + chunk));
        return { encoding: type + '-little-endian', data: btoa(result) };
      }
      function attributeValues(attr) {
        // The accessor API also handles interleaved attributes.
        const values = new Float32Array(attr.count * attr.itemSize);
        const components = ['getX', 'getY', 'getZ', 'getW'];
        for (let i = 0; i < attr.count; i++)
          for (let j = 0; j < attr.itemSize; j++)
            values[attr.itemSize * i + j] = attr[components[j]](i);
        return binary(values, 'float32');
      }
      api.drawList();
      scene.updateMatrixWorld(true);
      const meshes = [];
      scene.traverse(obj => {
        if (!obj.isMesh || !/^m06_(arched|opencrest|crest)_/i.test(obj.name)) return;
        const g = obj.geometry;
        const attrs = {};
        for (const key of ['position','normal','uv']) {
          const attr = g.getAttribute(key);
          if (attr) attrs[key] = { size: attr.itemSize, ...attributeValues(attr) };
        }
        const idx = g.getIndex();
        const indices = idx ? idx.array : Uint32Array.from({length: g.getAttribute('position').count}, (_, i) => i);
        if (indices.length % 3) throw Error('Mesh does not have triangle faces: ' + obj.name);
        meshes.push({ name: obj.name, matrixWorld: obj.matrixWorld.toArray(),
          attributes: attrs, index: binary(indices, 'uint32'), vertexCount: g.getAttribute('position').count,
          faceCount: indices.length / 3 });
      });
      if (!meshes.some(m => m.name === 'm06_arched_water')) throw Error('Playable arched-passage water mesh missing');
      const cameras = [];
      const startingS = api.state().s;
      for (const offset of [0,3,6]) {
        const target = startingS + offset;
        api.setSteer(0);
        let n = 0;
        while (api.state().s < target - .001 && n++ < 3000) api.step(1);
        if (n >= 3000) throw Error('Game did not reach camera checkpoint ' + offset);
        api.setSteer(null);
        api.drawList();
        camera.updateMatrixWorld(true);
        cameras.push({ name: 'Camera_' + (offset === 0 ? 'Opening' : 'Forward_' + offset), offset,
          courseS: api.state().s, lateral: api.state().lat, matrixWorld: camera.matrixWorld.toArray(),
          projectionMatrix: camera.projectionMatrix.toArray(), near: camera.near, far: camera.far,
          fov: camera.getEffectiveFOV(), aspect: camera.aspect });
      }
      return { schema: 1, flags: query, candidate, width:864, height:1536, meshes, cameras };
    }, { query, candidate });
  } finally { await page.close(); }
}
function fingerprint(mesh) {
  const h = createHash('sha256');
  // Include indices, transform and all attributes. Vertex positions alone miss topology-only aperture changes.
  h.update(JSON.stringify(mesh.matrixWorld));
  for (const value of [mesh.index, mesh.attributes.position, mesh.attributes.normal, mesh.attributes.uv])
    if (value) h.update(Buffer.from(value.data, 'base64'));
  return h.digest('hex');
}
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--disable-background-networking'] });
  try {
    const baseline = process.env.CREST_BASELINE_CAPTURE
      ? JSON.parse(gunzipSync(fs.readFileSync(process.env.CREST_BASELINE_CAPTURE)).toString('utf8'))
      : await capture(browser, false);
    const candidate = await capture(browser, true);
    const before = new Map(baseline.meshes.map(m => [m.name, fingerprint(m)]));
    candidate.changedMeshes = [];
    for (const mesh of candidate.meshes) {
      mesh.digest = fingerprint(mesh);
      if (before.get(mesh.name) !== mesh.digest) candidate.changedMeshes.push(mesh.name);
    }
    if (!candidate.changedMeshes.length && !process.env.CREST_ALLOW_REFERENCE_SMOKE)
      throw Error('No runtime geometry changed when the candidate flag switched on');
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, gzipSync(JSON.stringify(candidate), { level: 6 }));
    console.log(JSON.stringify({ meshCount:candidate.meshes.length, changedMeshes:candidate.changedMeshes,
      faces:candidate.meshes.reduce((n,m)=>n+m.faceCount,0), cameras:candidate.cameras.map(c=>[c.name,c.courseS]) }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
