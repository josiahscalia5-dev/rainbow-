/** Visual-only upright water ahead of the rider. The playable course and contact zone stay intact. */
import * as THREE from 'three';
import type { CourseSample } from '../world/course';

export const reference05Shared = { uBenny: { value: new THREE.Vector3() } };

export function reference05Weight(s: number, focusS: number): number {
  return THREE.MathUtils.smoothstep(s, 148, 158) * (1 - THREE.MathUtils.smoothstep(s, 185, 195))
    * THREE.MathUtils.smoothstep(s - focusS, 10, 22);
}

export function reference05TargetFrame(frame: CourseSample): CourseSample {
  const up = new THREE.Vector3(0, 1, 0).addScaledVector(frame.tan, -frame.tan.y).normalize();
  const right = new THREE.Vector3().crossVectors(frame.tan, up).normalize();
  return { s: frame.s, pos: frame.pos.clone(), tan: frame.tan.clone(), up, right };
}

/** Linear basis interpolation matches the vertex position blend; callers normalize shading normals. */
const blendUp = new THREE.Vector3(), blendRight = new THREE.Vector3();
export function reference05BlendFrame(frame: CourseSample, focusS: number): CourseSample {
  const weight = reference05Weight(frame.s, focusS);
  if (weight > 0) {
    blendUp.set(0, 1, 0).addScaledVector(frame.tan, -frame.tan.y).normalize();
    blendRight.crossVectors(frame.tan, blendUp).normalize();
    frame.up.lerp(blendUp, weight);
    frame.right.lerp(blendRight, weight);
  }
  return frame;
}

export const REFERENCE05_FRAME_GLSL = /* glsl */ `
float reference05Weight(float s, float focusS) {
  return smoothstep(148.0, 158.0, s) * (1.0 - smoothstep(185.0, 195.0, s))
    * smoothstep(10.0, 22.0, s - focusS);
}
`;
