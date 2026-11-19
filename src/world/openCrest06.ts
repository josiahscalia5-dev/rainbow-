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
  [-140, 760, 904, 6.8], [-50, 658, 790, 8.65], [0, 589, 720, 9.7],
  [84, 530, 650, 11.9], [172, 493, 604, 14.6], [250, 482, 578, 17.0],
  [316, 484, 588, 19.0], [364, 493, 577, 20.9], [402, 503, 575, 22.6],
  [457, 523, 588, 24.5], [510, 550, 610, 26.7], [558, 582, 638, 28.7],
  [606, 614, 663, 30.0], [655, 650, 685, 31.8], [682, 676, 699, 32.8],
  [701, 701, 720, 33.4], [711, 726, 737, 33.9], [715, 760, 765, 34.4]
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
    const drop = .18 + 2.6 * Math.pow(Math.sin(Math.PI * t), .75);
    for (let column = 0; column <= 8; column++) {
      const fraction = column / 8;
      const point = lip.clone().addScaledVector(referenceForward, .12 * Math.sin(Math.PI * fraction) + .38 * fraction);
      point.y -= drop * fraction;
      addGridVertex(casing, point, station / 14, 13 + drop * fraction, column, 9);
    }
  }
  return { upper: finishGrid(wet), soffit: finishGrid(casing) };
}
