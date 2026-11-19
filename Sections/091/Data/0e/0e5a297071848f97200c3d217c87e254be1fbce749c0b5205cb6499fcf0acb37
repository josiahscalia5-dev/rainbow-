import * as THREE from 'three';
import fit from '../../assets/textures/match06/crest-route.json';

/** Displace the existing world-space samples once. All consumers, including the river
 * mesh and swimmer, then share the same curve and station clock. */
export function applyCrestRoute06(
  stageStart: number,
  stationSpacing: number,
  positions: THREE.Vector3[],
  tangents: THREE.Vector3[],
  upFrames: THREE.Vector3[],
): void {
  const knots = fit.knots;
  const previousTangent = new THREE.Vector3();
  const rotation = new THREE.Quaternion();
  const pointOffset = new THREE.Vector3();
  const tangentOffset = new THREE.Vector3();
  const first = Math.ceil((stageStart + fit.begin) / stationSpacing);
  const last = Math.floor((stageStart + fit.end) / stationSpacing);
  let interval = 0;
  for (let i = first; i <= last; ++i) {
    const station = i * stationSpacing - stageStart;
    while (interval + 2 < knots.length && station > knots[interval + 1][0]) ++interval;
    const a = knots[interval], b = knots[interval + 1];
    const length = b[0] - a[0];
    const u = (station - a[0]) / length;
    const u2 = u * u, u3 = u2 * u;
    const h0 = 2*u3 - 3*u2 + 1, h1 = -2*u3 + 3*u2;
    const m0 = u3 - 2*u2 + u, m1 = u3 - u2;
    for (let axis = 0; axis < 3; ++axis) {
      pointOffset.setComponent(axis,
        h0*a[axis+1] + h1*b[axis+1] + length*(m0*a[axis+4] + m1*b[axis+4]));
      tangentOffset.setComponent(axis,
        (6*u2-6*u)*(a[axis+1]-b[axis+1])/length +
        (3*u2-4*u+1)*a[axis+4] + (3*u2-2*u)*b[axis+4]);
    }
    positions[i].add(pointOffset);
    previousTangent.copy(tangents[i]);
    tangents[i].add(tangentOffset).normalize();
    rotation.setFromUnitVectors(previousTangent, tangents[i]);
    upFrames[i].applyQuaternion(rotation).normalize();
  }
}
