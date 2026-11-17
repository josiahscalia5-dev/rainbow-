/**
 * `?camclear=1` (also on under `?matchall=1`; OFF by default) — keep the ride view clear (user's Android gameplay
 * recording, 2026-11-17, qa/gameplay_video/NOTES.md). Nothing in the scenery moves or changes colour; only what would
 * block the view while riding is made see-through:
 *  1. Line of sight to Benny: fragments of the "prop" occluders (gold rings, lids/hoods, gold torus lips and rims, the
 *     03 basin funnel and deck, foam banks) that lie IN FRONT of Benny inside a cone from the lens to Benny are dithered
 *     away, so a ring band, the drain funnel or a foam bank passing between the camera and Benny never hides him
 *     (06 rinse-arch rings, 07 plunge rings, 03/04 foam sheets and the drain funnel).
 *  2. Lens clearance: the same occluders fade out (screen-door dither) within ~1.5 u of the lens, so the camera never
 *     shows a frame-filling slice of a ring, the funnel or a foam bank it passes through (06 / 07 full-frame gold,
 *     04 "pink wall with holes").
 *  Walls, floors, water, the 05 near frame, the Screen 08 projection, Benny and coins are never touched, and both
 *  effects only run in the ride (03–10), so the cinematics and the locked 05 / 08 views are unchanged (verified 0 px).
 * Cost: one shared uniform block, one varying, ~20 ALU ops per patched fragment, one Box3 per frame.
 */
import * as THREE from 'three';
import { flag05 } from '../vfx/waterRibbon';

export const CAMCLEAR = flag05('camclear') || flag05('matchall');

/** cone radius (u) at the lens and at Benny: wide for big props (rings, funnel), Benny-sized for the foam banks */
const R_PROP: [number, number] = [1.6, 2.2];
const R_FOAM: [number, number] = [1.2, 1.5];

/** `lens` (coins): no cone — a coin fades out once it is nearer to the lens than Benny's front (between COIN_LENS[0] and
 *  [1] u relative to that depth), i.e. only coins he has missed and that are passing the view */
const COIN_LENS: [number, number] = [-3.0, -0.8];
const fdecl = (r: [number, number] | 'lens') => /* glsl */ `
uniform vec4 uCCB;   // Benny's centre in view space (xyz) + view depth of his front (w)
uniform vec4 uCCZ;   // x: on (0/1), y: lens fade full (u), z: lens fade end (u)
varying vec3 vCCv;   // view-space position of this fragment
float ccB2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
float ccBayer(vec2 a) { return ccB2(0.5 * a) * 0.25 + ccB2(a); }
void ccClip() {
  if (uCCZ.x < 0.5) return;
  float depth = -vCCv.z;
${r === 'lens' ? `  float keep = max(smoothstep(${COIN_LENS[0].toFixed(3)}, ${COIN_LENS[1].toFixed(3)}, depth - uCCB.w), 0.0);
  if (false) {` : `  float keep = smoothstep(uCCZ.y, uCCZ.z, depth);
  if (depth < uCCB.w) {`}
    vec3 B = uCCB.xyz;
    float t = clamp(dot(vCCv, B) / max(dot(B, B), 1e-4), 0.0, 1.0);
    float rr = mix(${r === 'lens' ? '0.0' : r[0].toFixed(3)}, ${r === 'lens' ? '0.0' : r[1].toFixed(3)}, t);
    keep = min(keep, smoothstep(0.72 * rr, rr, length(vCCv - B * t)));
  }
  if (keep < ccBayer(gl_FragCoord.xy) + 0.03125) discard;
}
`;
// the vertex stage hands its view-space position to the fragment stage, recovered from the clip position (symmetric
// perspective: x_v = x_c / P00, y_v = y_c / P11, z_v = -w_c) — works for every material, instanced or not
const VTAIL = /* glsl */ `
varying vec3 vCCv;
void main() {
  ccMainOrig();
  vCCv = vec3(gl_Position.x / projectionMatrix[0][0], gl_Position.y / projectionMatrix[1][1], -gl_Position.w);
}
`;

export interface CamClear {
  /** per frame, before rendering: Benny's view-space centre and front depth from the live camera; `on` = ride mode */
  update(camera: THREE.PerspectiveCamera, benny: THREE.Object3D, on: boolean): void;
  /** QA: the patched objects (names) */
  patched: string[];
}

export function createCamClear(roots: { env: THREE.Object3D; foam?: THREE.Object3D | null; coins?: THREE.Object3D | null }): CamClear {
  const U = {
    uCCB: { value: new THREE.Vector4(0, 0, -1, 0) },
    uCCZ: { value: new THREE.Vector4(0, 0.7, 1.5, 0) },
  };
  const done = new WeakSet<THREE.Material>();
  const patch = (m: THREE.Material, r: [number, number] | 'lens') => {
    if (done.has(m)) return;
    done.add(m);
    const prevOBC = m.onBeforeCompile;
    const prevKey = m.customProgramCacheKey;
    const decl = fdecl(r);
    m.onBeforeCompile = function (this: THREE.Material, sh, rd) {
      prevOBC.call(this, sh, rd);
      const re = /void\s+main\s*\(\s*(void)?\s*\)\s*\{/;
      if (!re.test(sh.fragmentShader) || !re.test(sh.vertexShader)) return;
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader.replace(re, 'void ccMainOrig() {') + VTAIL;
      sh.fragmentShader = sh.fragmentShader.replace(re, (s) => `${decl}\n${s}\n  ccClip();\n`);
    };
    // the previous program key (exactly as before) + a suffix, so patched and unpatched programs never mix
    m.customProgramCacheKey = function (this: THREE.Material) {
      const cur = this.onBeforeCompile;
      this.onBeforeCompile = prevOBC;
      const k = prevKey.call(this);
      this.onBeforeCompile = cur;
      return `${k}|camclear2:${Array.isArray(r) ? r.join(',') : r}`;
    };
    m.needsUpdate = true;
  };
  const patched: string[] = [];
  const take = (o: THREE.Object3D, r: [number, number] | 'lens') => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    for (const m of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) patch(m, r);
    patched.push(o.name || `${o.parent?.name ?? ''}/${(mesh.geometry as THREE.BufferGeometry).type}`);
  };
  // the washer world's props in the ride zones: instanced rings / collars / lids / hoods (04–07), gold torus lips, rims
  // and rings (03 basin, 04 pipe mouth) and the 03 basin funnel + deck (the drain the ride drops through into 04).
  // Tube walls, the 05 near frame, the far 05 block's walls and the chamber are not touched.
  const basin = roots.env.getObjectByName('zone_basin');
  const tubes = roots.env.getObjectByName('zone_tubes');
  for (const zone of [basin, tubes]) {
    zone?.children.forEach((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const type = (mesh.geometry as THREE.BufferGeometry).type;
      if ((mesh as THREE.InstancedMesh).isInstancedMesh || type === 'TorusGeometry') take(o, R_PROP);
      else if (zone === basin && (type === 'LatheGeometry' || type === 'ShapeGeometry')) take(o, R_PROP);
    });
  }
  // foam banks along the stream: the lather berm, its bubble puff chunks and the 03 whirlpool foam (the 05 flank banks,
  // rafts and rim impostors keep their own look)
  roots.foam?.traverse((o) => {
    if (o === roots.foam) return;
    if (['foam_flank', 'foam_rafts', 'foam_rim05'].includes(o.name)) return;
    take(o, R_FOAM);
  });

  // coins (round 4): a coin Benny missed passes the lens huge (08 while the view holds the approved picture and Benny
  // steers off the coin line: big coins over the lower third) — coins fade out within ~2–4 u of the lens. Pickup unchanged.
  roots.coins?.traverse((o) => take(o, 'lens'));

  const box = new THREE.Box3();
  const c = new THREE.Vector3();
  const v = new THREE.Vector3();
  return {
    patched,
    update(camera, benny, on) {
      U.uCCZ.value.x = 0;
      if (!on || !benny.visible) return;
      camera.updateMatrixWorld();
      box.setFromObject(benny);
      if (box.isEmpty()) return;
      box.getCenter(c).applyMatrix4(camera.matrixWorldInverse);
      // view depth of Benny's front: nearest bbox corner, a little margin toward the camera
      let dMin = Infinity;
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
        dMin = Math.min(dMin, -v.set(x, y, z).applyMatrix4(camera.matrixWorldInverse).z);
      }
      if (!(dMin > camera.near * 2)) return;
      U.uCCB.value.set(c.x, c.y, c.z, dMin - 0.15);
      U.uCCZ.value.x = 1;
    },
  };
}
