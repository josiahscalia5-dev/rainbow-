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

/**
 * `&m05edge=1` (Screen 05 round 8, needs `m05far=1`; qa/match/05/NOTES.md "Round 8"): the same seam clip for standard
 * (lit) materials. The first legacy 06 hood (wall lid at s ≈ 188, environment.ts `lids0607`) lies just behind the far
 * tunnel's seam and stood inside the 05 far tunnel as a flat orange tray on the left bank in every swimming frame.
 * Opt-in per material (`margin`: the clip starts that many units camera-side of the seam — only for materials used
 * nowhere near the 05 tube, i.e. the 06/07 rings and hoods); default build and every other switch: no program changes.
 */
export const M05EDGE: boolean = M05CLIP && flag05('m05edge');
export function withClip05Std(mat: THREE.Material, margin = 0): void {
  if (!M05EDGE) return;
  const prev = mat.onBeforeCompile;
  const prevKey = mat.customProgramCacheKey;
  mat.onBeforeCompile = function (this: THREE.Material, shader, renderer) {
    prev.call(this, shader, renderer);
    Object.assign(shader.uniforms, clip05);
    shader.vertexShader = shader.vertexShader
      .replace('void main() {', 'varying vec3 vC05W;\nvoid main() {')
      .replace('#include <project_vertex>', `#include <project_vertex>
  {
    vec4 c05p = vec4(transformed, 1.0);
    #ifdef USE_INSTANCING
    c05p = instanceMatrix * c05p;
    #endif
    vC05W = (modelMatrix * c05p).xyz;
  }`);
    shader.fragmentShader = shader.fragmentShader.replace('void main() {', `varying vec3 vC05W; uniform vec3 uClip05P; uniform vec3 uClip05N;
void main() {
  {  // m05edge: behind the 05 far tunnel seam, inside its tube only (as withClip05)
    vec3 cd = vC05W - uClip05P; float ca = dot(cd, uClip05N);
    if (dot(uClip05N, uClip05N) > 0.5 && ca > ${(-margin).toFixed(2)} && ca < 40.0 && length(cd - ca * uClip05N) < 9.0) discard;   // n = 0: off
  }`);
  };
  mat.customProgramCacheKey = function (this: THREE.Material) { return prevKey.call(this) + '|clip05e' + margin; };
}
