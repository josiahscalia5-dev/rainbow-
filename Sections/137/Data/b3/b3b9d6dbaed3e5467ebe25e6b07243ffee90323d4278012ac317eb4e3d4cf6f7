/**
 * `?match05=1&m05far=1` (Screen 05 round 7, src/world/match05far.ts): a clip plane at the far tunnel's sliding seam.
 * Real 06 foam behind the seam (the rising 06 banks) would otherwise stand inside the 05 far tunnel as white columns;
 * materials that opt in (foam puffs) discard fragments beyond the plane while the switch is on and the far block is
 * live (n = 0 disables it). Default build: nothing imports the GLSL below into any program.
 */
import * as THREE from 'three';
import { MATCH05, flag05 } from './waterRibbon';

export const M05CLIP: boolean = MATCH05 && flag05('m05far');
export const clip05 = {
  uClip05P: { value: new THREE.Vector3() },
  uClip05N: { value: new THREE.Vector3() },
};
/** inject into a ShaderMaterial whose fragment shader has `varying vec3 <posVar>` (world position) */
export function withClip05(mat: THREE.ShaderMaterial, posVar: string): void {
  if (!M05CLIP) return;
  Object.assign(mat.uniforms, clip05);
  mat.fragmentShader = mat.fragmentShader.replace('void main() {', `uniform vec3 uClip05P; uniform vec3 uClip05N;
void main() {
  {  // ?m05far=1: behind the 05 far tunnel seam, inside its tube (axial 0..40 u, within 9 u of the axis) only
    vec3 cd = ${posVar} - uClip05P; float ca = dot(cd, uClip05N);
    if (ca > 0.0 && ca < 40.0 && length(cd - ca * uClip05N) < 9.0) discard;
  }`);
}
