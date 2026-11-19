import * as THREE from 'three';

// Calibrated native camera from assets/textures/match06/cam06_locked.json.
// It is used to survey the artwork during construction, never to move the mesh.
const referenceEye = new THREE.Vector3(1.7205354776, -35.3694142931, -132.6440191904);
const referenceRight = new THREE.Vector3(.9808381362, 0, -.1948244098);
const referenceUp = new THREE.Vector3(-.0369568501, .9818434296, -.1860582461);
const referenceForward = new THREE.Vector3(-.1912870667, -.1896931198, -.9630294795);
const halfWidth = 432;
const halfHeight = 768;
const focalLength = halfHeight / Math.tan(31 * Math.PI / 180);

// Native X, the far and near boundary Y positions, and independent metric station depth.
// Depths seat the visible curl on the existing outboard shoulder. Both ends taper into
// the washer casing and water; the cyan arm never crosses the existing swimming lane.
const upperCrestSurvey: [number, number, number, number][] = [
  [-250, 1130, 1150, 6.1],
  [-140, 820, 860, 7.7],
  [-50, 658, 790, 8.65],
  [0, 589, 720, 9.7],
  [84, 530, 650, 12.0],
  [172, 493, 604, 16.3],
  [250, 482, 578, 20.5],
  [316, 484, 588, 24.2],
  [364, 493, 577, 24.9],
  [402, 503, 575, 25.3],
  [457, 523, 588, 25.8],
  [510, 550, 610, 26.9],
  [558, 582, 638, 28.7],
  [606, 614, 663, 30.0],
  [655, 650, 685, 31.8],
  [682, 676, 699, 32.8],
  [701, 701, 720, 33.4],
  [715, 737, 750, 33.9],
  [733, 778, 802, 34.5],
  [755, 830, 848, 35.3],
  [780, 875, 886, 36.9],
  [804, 899, 905, 38.5],
  [821, 908, 911, 39.1],
];

// Feet of the machine casing sampled from the same physical river geometry as Benny.
// The exposed upper sheet now rejoins water at both ends. At the deep turn the lower
// silhouette follows the blue bank continuously instead of hanging above it.
const outerBankSeats: [number, number, number][] = [
  [-2.566, -38.269, -137.662],
  [-2.866, -37.437, -139.113],
  [-3.071, -36.987, -139.86],
  [-3.361, -36.616, -140.62],
  [-3.73, -35.832, -143.071],
  [-3.349, -35.639, -147.449],
  [-3.073, -36.738, -151.424],
  [-2.505, -37.713, -154.505],
  [-2.276, -37.973, -155.368],
  [-2.152, -38.139, -155.793],
  [-1.884, -38.47, -156.633],
  [-1.442, -38.886, -157.857],
  [-0.623, -39.724, -159.793],
  [0.08, -40.504, -161.255],
  [0.989, -41.499, -162.98],
  [1.542, -42.074, -163.97],
  [1.91, -42.55, -164.61],
  [2.463, -43.198, -165.555],
  [3.014, -43.898, -166.484],
  [3.74, -44.737, -167.709],
  [4.659, -45.768, -169.276],
  [5.579, -46.634, -170.881],
  [6.116, -47.016, -171.855],
];

function surveyedPoint(x: number, y: number, depth: number) {
  return referenceEye.clone()
    .addScaledVector(referenceForward, depth)
    .addScaledVector(referenceRight, (x - halfWidth) * depth / focalLength)
    .addScaledVector(referenceUp, (halfHeight - y) * depth / focalLength);
}

type Grid = { positions: number[], texcoords: number[], indices: number[] };
function addGridVertex(grid: Grid, point: THREE.Vector3, u: number, v: number, column: number, columns: number) {
  const index = grid.positions.length / 3;
  grid.positions.push(point.x, point.y, point.z);
  grid.texcoords.push(u, v);
  if (column > 0 && index >= columns) {
    grid.indices.push(index - columns - 1, index - columns, index, index - columns - 1, index, index - 1);
  }
}

function finishGrid(grid: Grid) {
  const mesh = new THREE.BufferGeometry();
  mesh.setIndex(grid.indices);
  mesh.setAttribute('position', new THREE.Float32BufferAttribute(grid.positions, 3));
  mesh.setAttribute('uv', new THREE.Float32BufferAttribute(grid.texcoords, 2));
  mesh.computeVertexNormals();
  return mesh;
}

// Native +3 visibility rays at image x150–250 first hit the outboard shoulder at
// lateral −3.52 to −3.33 near stations 20–22. Carry the small grade adjustment
// through foam and rim seats, with full water contact inside the ±2.95 steer limit.
export function lowerOuterShoulder06(geometry: THREE.BufferGeometry) {
  const positions = geometry.getAttribute('position');
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const outside = THREE.MathUtils.smoothstep(-.16 - x, 3.12, 3.42);
    const station = (z + 148.65) / 2.9;
    const lowering = .25 * outside * Math.exp(-station * station);
    positions.setY(i, positions.getY(i) - lowering);
  }
  positions.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
}

export function reconstructOpenCrest06(water: THREE.BufferGeometry) {
  // Smooth the central channel over the crest without cutting the swimming surface or
  // changing the steering/collision course. Its former top intercepted the purple-window rays.
  // Leave a full, wet support under Benny at both side steering limits and at the release.
  const positions = water.getAttribute('position');
  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);
    const longitudinal = (z + 142.15) / 3.2;
    const transverse = (x - .24) / 2.2;
    const depth = .27 * Math.exp(-longitudinal * longitudinal - transverse * transverse);
    positions.setY(i, positions.getY(i) - depth);
  }
  positions.needsUpdate = true;
  water.computeVertexNormals();
  water.computeBoundingBox();
  water.computeBoundingSphere();

  const outerEdge: THREE.Vector3[] = [];
  const innerEdge: THREE.Vector3[] = [];
  const centers: THREE.Vector3[] = [];
  for (const [x, farY, nearY, depth] of upperCrestSurvey) {
    const halfDepth = Math.min(.58, (nearY - farY) * .007);
    outerEdge.push(surveyedPoint(x, farY, depth + halfDepth));
    innerEdge.push(surveyedPoint(x, nearY, depth - halfDepth));
    centers.push(surveyedPoint(x, (farY + nearY) / 2, depth));
  }
  const outer = new THREE.CatmullRomCurve3(outerEdge);
  const inner = new THREE.CatmullRomCurve3(innerEdge);
  const center = new THREE.CatmullRomCurve3(centers);
  const seat = new THREE.CatmullRomCurve3(outerBankSeats.map(point => new THREE.Vector3(...point)));
  const wet: Grid = { positions: [], texcoords: [], indices: [] };
  const casing: Grid = { positions: [], texcoords: [], indices: [] };
  let previousCenter = center.getPoint(0);
  let station = 0;
  for (let row = 0; row <= 100; row++) {
    const t = row / 100;
    const back = outer.getPoint(t);
    const lip = inner.getPoint(t);
    const middle = center.getPoint(t);
    station += middle.distanceTo(previousCenter);
    previousCenter = middle;
    const crown = Math.min(.17, back.distanceTo(lip) * .12);
    for (let column = 0; column <= 10; column++) {
      const across = column / 10;
      const point = back.clone().lerp(lip, across);
      point.y += crown * Math.sin(across * Math.PI);
      addGridVertex(wet, point, .10 + .84 * across, station, column, 11);
    }

    // The perforated sidewall sits below the inboard lip, rather than filling the wet
    // foreground. Continuous surfaces give the two lips real depth separation around turns.
    const foot = seat.getPoint(t);
    const span = lip.distanceTo(foot);
    for (let column = 0; column <= 8; column++) {
      const fraction = column / 8;
      const point = lip.clone().lerp(foot, fraction);
      point.addScaledVector(referenceForward, Math.min(.12, .09 * span) * Math.sin(Math.PI * fraction));
      // A photographed slot measures roughly 0.45 × 0.20 course units on this visible
      // close inner panel. The outboard casing has its own metric UVs at this scale.
      addGridVertex(casing, point, station * 1.85 / 14, 13 + span * fraction * 1.85, column, 9);
    }
  }
  return { upper: finishGrid(wet), soffit: finishGrid(casing) };
}
