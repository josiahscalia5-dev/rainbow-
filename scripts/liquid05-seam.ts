/**
 * CPU geometry checks for the opt-in Screen 05 seam (no browser or Android FPS claim).
 * Run: npx vite-node scripts/liquid05-seam.ts
 * Writes only qa/codex-water/tests/seam-numeric.json; exits nonzero on failure.
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
(globalThis as unknown as { location: { search: string } }).location = { search: '?liquid05=1' };
const { Course } = await import('../src/world/course');
const { straightTubePath, ForcedTunnel, tubeCenterAt } = await import('../src/world/tube');
const { farRiverLayout, farRiverGeometry } = await import('../src/world/far05');
const { STAGE_CAM } = await import('../src/game/cameraRig');
const { EDGE_LIFT, ampAt, createRibbon } = await import('../src/vfx/waterRibbon');

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
const bodyVertices = Array.from({ length: 17 }, (_, i) => i + 3);
const wave = (s: number, u: number, time: number, amplitude: number) => amplitude
  * (0.6 * Math.sin(s * 0.9 - time * 2.4 + u * 1.7) + 0.4 * Math.sin(s * 0.41 + time * 1.5 - u * 2.3));
const vector = (a: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, i: number) => new THREE.Vector3().fromBufferAttribute(a, i);
const farPosition = (i: number, time: number) => vector(attributes.position, i).addScaledVector(
  vector(attributes.aRivSeamNormal, i), wave(attributes.aRivSeam.getX(i), attributes.aRivSeam.getY(i), time,
    attributes.aRivSeam.getZ(i)) * attributes.aRivSeam.getW(i));

const staticGaps: number[] = [], animatedGaps: number[] = [];
for (const i of bodyVertices) {
  const s = attributes.aRivSeam.getX(i), u = attributes.aRivSeam.getY(i);
  const f = course.sample(s), halfWidth = course.widthAt(s) / 2;
  const position = f.pos.clone().addScaledVector(f.right, u * halfWidth)
    .addScaledVector(f.up, EDGE_LIFT * Math.abs(u) ** 3);
  const normal = f.up.clone().addScaledVector(f.right, -EDGE_LIFT * 3 * u * Math.abs(u) / halfWidth).normalize();
  staticGaps.push(position.distanceTo(vector(attributes.position, i)));
  for (const time of times) animatedGaps.push(position.clone().addScaledVector(normal, wave(s, u, time, ampAt(course, s)))
    .distanceTo(farPosition(i, time)));
}

const tessellation: { quality: string; samples: number; maxGap: number; limit: number; pass: boolean }[] = [];
for (const quality of ['high', 'low'] as const) {
  const start = (course.marks['02_drain'] ?? course.stage('02').s1 - 2) - 1;
  const ribbon = createRibbon(course, { s0: start, s1: course.length, quality });
  const geo = ribbon.mesh.geometry, a = geo.attributes;
  const columns = quality === 'high' ? 18 : 10, stride = columns + 3;
  const rows = a.position.count / stride;
  const vertex = (i: number, time: number) => vector(a.position, i).addScaledVector(vector(a.normal, i),
    wave(a.aUV.getY(i), a.aUV.getX(i), time, a.aAmp.getX(i)));
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
    for (const time of times) {
      const near = new THREE.Vector3();
      indices.forEach((j, k) => near.addScaledVector(vertex(j, time), weights[k]));
      maxGap = Math.max(maxGap, near.distanceTo(farPosition(i, time)));
    }
  }
  const limit = quality === 'high' ? 0.025 : 0.048;
  tessellation.push({ quality, samples: bodyVertices.length * times.length, maxGap, limit, pass: maxGap <= limit });
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
const analytical = { bodyVertices: bodyVertices.length, times, animatedSamples: animatedGaps.length,
  maxStaticGap: Math.max(...staticGaps), bankGaps: [staticGaps[0], staticGaps.at(-1)],
  maxAnimatedGap: Math.max(...animatedGaps), limit: 0.0001 };
const exterior = { samples: exteriorSamples, minLift: minExteriorLift, maxLift: maxExteriorLift, limit: EDGE_LIFT,
  pass: exteriorSamples > 0 && minExteriorLift >= -0.000001 && maxExteriorLift <= EDGE_LIFT + 0.000001 };
const files = ['src/world/far05.ts', 'src/world/materials.ts', 'src/vfx/waterRibbon.ts', 'src/vfx/liquid05.ts'];
const report = {
  created: new Date().toISOString(), baseCommit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  sourceSha256: Object.fromEntries(files.map((file) => [file, createHash('sha256').update(readFileSync(file)).digest('hex')])),
  note: 'World-unit geometric distances. Analytical matching does not imply pixel-identical shading or zero tessellation error. Browser capture and device tests are separate.',
  seamS, seamArcRange: [attributes.uv.getY(3), attributes.uv.getY(19)],
  farVertices: attributes.position.count, farTriangles: far.index!.count / 3,
  analytical, tessellation, exterior,
  pass: analytical.maxStaticGap <= analytical.limit && analytical.maxAnimatedGap <= analytical.limit
    && tessellation.every((r) => r.pass) && exterior.pass,
};
far.dispose();
mkdirSync('qa/codex-water/tests', { recursive: true });
writeFileSync('qa/codex-water/tests/seam-numeric.json', JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.pass ? 0 : 1;
