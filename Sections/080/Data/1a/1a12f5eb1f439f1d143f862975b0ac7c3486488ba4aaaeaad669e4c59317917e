/**
 * CPU geometry checks for the opt-in approved-reference Screen 05 seam (no browser or Android FPS claim).
 * Run: npx vite-node scripts/reference05-seam.ts
 * Writes only qa/approved-water-study/tests/seam-numeric.json; exits nonzero on failure.
 *
 * The fixture reproduces environment.ts's locked Screen 05 far-tunnel construction.
 * scripts/liquid05-check.mjs separately checks the actual running scene's seam objects.
 * Analytical surface error and the existing near mesh's tessellation error are reported separately.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import * as THREE from 'three';

// The runtime reads experiment switches when its modules load.
(globalThis as unknown as { location: { search: string } }).location = { search: '?reference05=1' };
const { Course } = await import('../src/world/course');
const { straightTubePath, ForcedTunnel, tubeCenterAt } = await import('../src/world/tube');
const { farRiverLayout, farRiverGeometry } = await import('../src/world/far05');
const { STAGE_CAM } = await import('../src/game/cameraRig');
const { EDGE_LIFT, ampAt, createRibbon } = await import('../src/vfx/waterRibbon');
const { reference05Weight, reference05Shared } = await import('../src/vfx/reference05Geometry');

const course = new Course(), stage05 = course.stage('05');
const checkpoint = course.marks['05_crest'], camera = STAGE_CAM['05']!;
const eyeS = checkpoint - camera.back;
const floorExtra = (s: number) => 2 * (1 - THREE.MathUtils.smootherstep(s, eyeS + 28, eyeS + 38))
  * THREE.MathUtils.smoothstep(s, stage05.s0 + 2, stage05.s0 + 10);
const path = straightTubePath(course, stage05.s0, course.stage('08').s0,
  { window: 30, taper: 14, baseRadius: (s) => course.prop('tube', s), floorExtra });
const frame = path.frame(checkpoint), tangent = frame.tan.clone();
const up = new THREE.Vector3(0, 1, 0).addScaledVector(tangent, -tangent.y).normalize();
const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
const water = course.sample(checkpoint).pos.clone();
const offset = water.clone().sub(frame.pos).dot(right), deadZone = camera.deadZone ?? 1;
const follow = camera.latFollow * (1 - Math.exp(-offset * offset / (deadZone * deadZone)));
const eye = water.addScaledVector(tangent, -camera.back).addScaledVector(up, camera.up)
  .addScaledVector(right, -offset * (1 - follow));
const seamS = Math.min(eyeS + 54, course.stage('06').s0 - 8.4);
const depth = tubeCenterAt(path, seamS).sub(eye).dot(tangent);
const knots: [number, number][] = [[0, 0]];
[59, 97, 161, 222, 322].forEach((d, i) => knots.push([14 * (i + 0.5), Math.max(d - depth, knots[i][1] + 1)]));
const tunnel = new ForcedTunnel(path, seamS, eye, 6, 430 - depth, knots, tangent);
const level = -(path.radius(seamS) - path.depth(seamS)) + 0.04;
const layout = farRiverLayout(course, tunnel, level);
const far = farRiverGeometry(tunnel, layout, level, 16, 120), attributes = far.attributes;
const times = [0, 3.2, 11.98, 12, 12.02];
const focuses = [checkpoint, seamS - 16, seamS - 10, seamS];
const bodyVertices = Array.from({ length: 17 }, (_, i) => i + 3);
const wave = (s: number, u: number, time: number, amplitude: number) => amplitude
  * (0.6 * Math.sin(s * 0.9 - time * 2.4 + u * 1.7) + 0.4 * Math.sin(s * 0.41 + time * 1.5 - u * 2.3));
const vector = (a: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, i: number) => new THREE.Vector3().fromBufferAttribute(a, i);
const farBase = (i: number, focusS = checkpoint) => vector(attributes.position, i).addScaledVector(
  vector(attributes.aRivReference, i), reference05Weight(attributes.aRivReference.getW(i), focusS));
const farPosition = (i: number, time: number, focusS = checkpoint) => {
  const weight = reference05Weight(attributes.aRivReference.getW(i), focusS);
  const normal = vector(attributes.aRivSeamNormal, i).lerp(vector(attributes.aRivReferenceNormal, i), weight);
  return farBase(i, focusS).addScaledVector(normal, wave(attributes.aRivSeam.getX(i), attributes.aRivSeam.getY(i), time,
    attributes.aRivSeam.getZ(i)) * attributes.aRivSeam.getW(i));
};

const staticGaps: number[] = [], animatedGaps: number[] = [];
for (const i of bodyVertices) {
  const s = attributes.aRivSeam.getX(i), u = attributes.aRivSeam.getY(i);
  const f = course.sample(s), halfWidth = course.widthAt(s) / 2;
  const position = f.pos.clone().addScaledVector(f.right, u * halfWidth)
    .addScaledVector(f.up, EDGE_LIFT * Math.abs(u) ** 3);
  const normal = f.up.clone().addScaledVector(f.right, -EDGE_LIFT * 3 * u * Math.abs(u) / halfWidth).normalize();
  // Independent upright target from course tangent; do not call the production frame helper.
  const up = new THREE.Vector3(0, 1, 0).addScaledVector(f.tan, -f.tan.y).normalize();
  const right = new THREE.Vector3().crossVectors(f.tan, up).normalize();
  const target = f.pos.clone().addScaledVector(right, u * halfWidth).addScaledVector(up, EDGE_LIFT * Math.abs(u) ** 3);
  const targetNormal = up.clone().addScaledVector(right, -EDGE_LIFT * 3 * u * Math.abs(u) / halfWidth).normalize();
  for (const focusS of focuses) {
    const weight = reference05Weight(s, focusS), base = position.clone().lerp(target, weight);
    const renderedNormal = normal.clone().lerp(targetNormal, weight);
    staticGaps.push(base.distanceTo(farBase(i, focusS)));
    for (const time of times) animatedGaps.push(base.clone().addScaledVector(renderedNormal, wave(s, u, time, ampAt(course, s)))
      .distanceTo(farPosition(i, time, focusS)));
  }
}

const tessellation: { quality: string; samples: number; maxGap: number; limit: number; pass: boolean }[] = [];
let rayGeometry: THREE.BufferGeometry | undefined;
let contactSamples = 0, maxContactDisplacement = 0, sharedFocus = true;
for (const quality of ['high', 'low'] as const) {
  const start = (course.marks['02_drain'] ?? course.stage('02').s1 - 2) - 1;
  const ribbon = createRibbon(course, { s0: start, s1: course.length, quality });
  const geo = ribbon.mesh.geometry, a = geo.attributes;
  const columns = quality === 'high' ? 18 : 10, stride = columns + 3;
  const rows = a.position.count / stride;
  sharedFocus &&= ribbon.uniforms.uBenny === reference05Shared.uBenny;
  if (quality === 'high') rayGeometry = geo.clone();
  const vertex = (i: number, time: number, focusS: number) => {
    const height = wave(a.aUV.getY(i), a.aUV.getX(i), time, a.aAmp.getX(i));
    const target = vector(a.aRefPosition, i).addScaledVector(vector(a.aRefNormal, i), height);
    return vector(a.position, i).addScaledVector(vector(a.normal, i), height)
      .lerp(target, reference05Weight(a.aUV.getY(i), focusS));
  };
  for (const focusS of [checkpoint, 145, 160, 175, 185, 195]) for (let i = 0; i < a.position.count; i++) {
    const s = a.aUV.getY(i);
    if (s < focusS - 30 || s > focusS + 10 || a.aSkirt.getX(i) > 0) continue;
    maxContactDisplacement = Math.max(maxContactDisplacement,
      vector(a.position, i).distanceTo(vector(a.aRefPosition, i)) * reference05Weight(s, focusS));
    contactSamples++;
  }
  let maxGap = 0;
  for (const i of bodyVertices) {
    const s = attributes.aRivSeam.getX(i), u = attributes.aRivSeam.getY(i);
    let row = 0;
    while (row < rows - 2 && a.aUV.getY((row + 1) * stride + 1) < s) row++;
    const s0 = a.aUV.getY(row * stride + 1), s1 = a.aUV.getY((row + 1) * stride + 1);
    const ty = (s - s0) / (s1 - s0), across = (u + 1) * columns / 2;
    const column = Math.max(0, Math.min(columns - 1, Math.floor(across))), tx = across - column;
    // Use the actual indexed near mesh's two triangles for this cell (its diagonal is b→c).
    const indexOffset = (row * (stride - 1) + column + 1) * 6 + (tx + ty <= 1 ? 0 : 3);
    const indices = [0, 1, 2].map((j) => geo.index!.getX(indexOffset + j));
    const weights = tx + ty <= 1 ? [1 - tx - ty, ty, tx] : [1 - ty, 1 - tx, tx + ty - 1];
    for (const focusS of focuses) for (const time of times) {
      const near = new THREE.Vector3();
      indices.forEach((j, k) => near.addScaledVector(vertex(j, time, focusS), weights[k]));
      maxGap = Math.max(maxGap, near.distanceTo(farPosition(i, time, focusS)));
    }
  }
  const limit = quality === 'high' ? 0.025 : 0.048;
  tessellation.push({ quality, samples: bodyVertices.length * times.length * focuses.length, maxGap, limit, pass: maxGap <= limit });
  geo.dispose();
  (ribbon.mesh.material as THREE.Material).dispose();
}

let exteriorSamples = 0, maxExteriorLift = 0, minExteriorLift = Infinity;
for (const z of [0, 2, 5, 9.9]) for (let i = 0; i <= 40; i++) {
  const n = layout.nearSurface!(z, -layout.chord + 2 * layout.chord * i / 40);
  if (Math.abs(n.u) <= 1 + 1e-6) continue;
  const f = course.sample(n.s), lateral = n.u * course.widthAt(n.s) / 2;
  const lift = n.point.clone().sub(f.pos.clone().addScaledVector(f.right, lateral)).dot(f.up);
  exteriorSamples++;
  maxExteriorLift = Math.max(maxExteriorLift, lift);
  minExteriorLift = Math.min(minExteriorLift, lift);
}
const analytical = { bodyVertices: bodyVertices.length, times, focuses, animatedSamples: animatedGaps.length,
  maxStaticGap: Math.max(...staticGaps), bankGaps: [staticGaps[0], staticGaps.at(-1)],
  maxAnimatedGap: Math.max(...animatedGaps), limit: 0.0001 };
const exterior = { samples: exteriorSamples, minLift: minExteriorLift, maxLift: maxExteriorLift, limit: EDGE_LIFT,
  pass: exteriorSamples > 0 && minExteriorLift >= -0.000001 && maxExteriorLift <= EDGE_LIFT + 0.000001 };
// Project the actual closed far mesh through the unchanged locked Screen 05 camera.
// Static row reversals catch the previous bank fold; animated tolerance allows subpixel ripples.
const pitch = Math.atan2(camera.up - camera.lookUp, camera.ahead + camera.back);
const yaw = THREE.MathUtils.degToRad(camera.yaw ?? 0);
const look = tangent.clone().multiplyScalar(Math.cos(pitch) * Math.cos(yaw))
  .addScaledVector(up, -Math.sin(pitch)).addScaledVector(right, -Math.cos(pitch) * Math.sin(yaw));
const view = new THREE.PerspectiveCamera(camera.fov, 720 / 1280, 0.05, 1200);
view.position.copy(eye); view.up.copy(up); view.lookAt(eye.clone().add(look)); view.updateMatrixWorld();
const screenY = (p: THREE.Vector3) => 640 * (1 - p.project(view).y);
const stride = 23, rows = attributes.position.count / stride;
let staticRowReversal = 0, animatedRowReversal = 0, projectionSamples = 0;
for (let row = 1; row < rows; row++) {
  if (attributes.aRivB.getW(row * stride) > 45) break;
  for (const column of bodyVertices) {
    const i = row * stride + column, previous = i - stride;
    staticRowReversal = Math.max(staticRowReversal, screenY(farBase(i)) - screenY(farBase(previous)));
    for (const time of times) animatedRowReversal = Math.max(animatedRowReversal,
      screenY(farPosition(i, time)) - screenY(farPosition(previous, time)));
    projectionSamples++;
  }
}
const projection = { viewport: [720, 1280], virtualDepth: [0, 45], samples: projectionSamples,
  maxStaticDownwardStepPx: staticRowReversal, maxAnimatedDownwardStepPx: animatedRowReversal,
  staticLimitPx: 0.1, animatedLimitPx: 1.0,
  pass: staticRowReversal <= 0.1 && animatedRowReversal <= 1.0 };

// Reproduce the visible old near-water fold around y489. Exclude vertical outer skirts and
// coincident triangle-edge hits; count distinct visible water-surface depths along the camera ray.
const rayPoints = [[300, 489], [340, 489], [460, 480], [500, 480]];
const rayLayers: { pixel: number[]; original: number; reference: number }[] = [];
for (const pixel of rayPoints) rayLayers.push({ pixel, original: 0, reference: 0 });
for (const kind of ['original', 'reference'] as const) {
  const geometry = rayGeometry!.clone(), a = geometry.attributes;
  for (let i = 0; i < a.position.count; i++) {
    const s = a.aUV.getY(i), u = a.aUV.getX(i);
    const height = wave(s, u, 12, a.aAmp.getX(i)) * (1 - a.aSkirt.getX(i));
    const p = vector(a.position, i).addScaledVector(vector(a.normal, i), height);
    if (kind === 'reference') p.lerp(vector(a.aRefPosition, i).addScaledVector(vector(a.aRefNormal, i), height),
      reference05Weight(s, checkpoint));
    a.position.setXYZ(i, p.x, p.y, p.z);
  }
  geometry.setAttribute('uv', a.aUV); geometry.computeBoundingSphere();
  const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material); mesh.updateMatrixWorld();
  const ray = new THREE.Raycaster();
  for (const row of rayLayers) {
    ray.setFromCamera(new THREE.Vector2(row.pixel[0] / 360 - 1, 1 - row.pixel[1] / 640), view);
    const depths: number[] = [];
    for (const hit of ray.intersectObject(mesh)) {
      if (!hit.face || !hit.uv || hit.uv.y < 148 || hit.uv.y > 195 || hit.distance > 100) continue;
      if ([hit.face.a, hit.face.b, hit.face.c].some((i) => a.aSkirt.getX(i) > 0)) continue;
      if (!depths.some((d) => Math.abs(d - hit.distance) < 0.01)) depths.push(hit.distance);
    }
    row[kind] = depths.length;
  }
  geometry.dispose(); material.dispose();
}
rayGeometry!.dispose();
const contact = { samples: contactSamples, aheadUnchangedThrough: 10, maxDisplacement: maxContactDisplacement,
  sharedFocus, pass: contactSamples > 0 && maxContactDisplacement === 0 && sharedFocus };
const occlusion = { time: 12, focusS: checkpoint, rays: rayLayers,
  pass: rayLayers.every((r) => r.original >= 2 && r.reference === 1) };

// Check the designed body/bands throughout the far section, including both interpolation joins.
let minHalfWidth = Infinity, minBandHalfWidth = Infinity, minBandClearance = Infinity;
let maxJoinSlopeDifference = 0, finiteLayout = true;
for (let i = 0; i <= 1600; i++) {
  const row = layout.row(i / 4);
  finiteLayout &&= Object.values(row).every(Number.isFinite);
  minHalfWidth = Math.min(minHalfWidth, row.hw);
  minBandHalfWidth = Math.min(minBandHalfWidth, row.wL, row.wR);
  minBandClearance = Math.min(minBandClearance, row.cL - row.wL - (row.xB - row.hw),
    row.xB + row.hw - (row.cR + row.wR));
}
for (const z of [2, 27]) {
  const delta = 0.001, a = layout.row(z - delta), b = layout.row(z), c = layout.row(z + delta);
  for (const key of Object.keys(b) as (keyof typeof b)[]) maxJoinSlopeDifference = Math.max(maxJoinSlopeDifference,
    Math.abs((c[key] - b[key]) / delta - (b[key] - a[key]) / delta));
}
const shape = { samples: 1601, minHalfWidth, minBandHalfWidth, minBandClearance, maxJoinSlopeDifference,
  pass: finiteLayout && minHalfWidth > 0 && minBandHalfWidth > 0 && minBandClearance >= -0.001
    && maxJoinSlopeDifference < 0.05 };

// The existing opening morph must still put every far vertex below the real tube floor.
const open = far.morphAttributes.position[0];
let maxOpenFloorHeight = -Infinity, finiteOpen = true;
for (let i = 0; i < open.count; i++) {
  const s = tunnel.sF + tunnel.zOf(attributes.aRivB.getW(i));
  const f = tunnel.path.frame(s), centre = tubeCenterAt(tunnel.path, s);
  const position = vector(open, i);
  finiteOpen &&= position.toArray().every(Number.isFinite);
  maxOpenFloorHeight = Math.max(maxOpenFloorHeight,
    position.sub(centre).dot(f.up) + tunnel.path.radius(s));
}
const materialSource = readFileSync('src/world/materials.ts', 'utf8');
const opening = { vertices: open.count, maxHeightAboveTubeBottom: maxOpenFloorHeight,
  waveReleasedByMorph: materialSource.includes('seamClosed = 1.0 - morphTargetInfluences[0]'),
  pass: open.count === attributes.position.count && finiteOpen && maxOpenFloorHeight < -0.599
    && materialSource.includes('seamClosed = 1.0 - morphTargetInfluences[0]') };

const files = ['src/world/far05.ts', 'src/world/materials.ts', 'src/vfx/waterRibbon.ts', 'src/vfx/reference05.ts', 'src/vfx/reference05Geometry.ts'];
let baseCommit: string | null = null;
try { baseCommit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(); }
catch (error) {
  // Some managed runners report EPERM after returning git's stdout; metadata cannot invalidate geometry.
  const output = String((error as { stdout?: string }).stdout ?? '').trim();
  if (/^[a-f0-9]{40}$/.test(output)) baseCommit = output;
}
const report = {
  created: new Date().toISOString(), baseCommit,
  sourceSha256: Object.fromEntries(files.map((file) => [file, createHash('sha256').update(readFileSync(file)).digest('hex')])),
  note: 'World-unit geometric distances. Analytical matching does not imply pixel-identical shading or zero tessellation error. Projection uses the closed far mesh at the locked camera; opening checks geometry and the displacement gate, not a full browser ride. Browser capture and device tests are separate.',
  seamS, seamArcRange: [attributes.uv.getY(3), attributes.uv.getY(19)],
  farVertices: attributes.position.count, farTriangles: far.index!.count / 3,
  analytical, tessellation, exterior, projection, contact, occlusion, shape, opening,
  pass: analytical.maxStaticGap <= analytical.limit && analytical.maxAnimatedGap <= analytical.limit
    && tessellation.every((r) => r.pass) && exterior.pass && projection.pass && contact.pass && occlusion.pass && shape.pass && opening.pass,
};
far.dispose();
mkdirSync('qa/approved-water-study/tests', { recursive: true });
writeFileSync('qa/approved-water-study/tests/seam-numeric.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.pass ? 0 : 1;
