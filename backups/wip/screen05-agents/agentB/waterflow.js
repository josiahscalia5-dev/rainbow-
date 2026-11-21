// waterflow.js - Screen 05 flowing water on the Marble splat track (Spark 2.4 dyno worldModifier, GPU only).
//
// What it does, per splat, inside Spark's splat-generation pass (no extra geometry, no textures, no CPU work per splat):
//   * finds the river's own splats: height above the (sloped) water surface < ~0.1 and inside the tunnel floor
//     (the same water plane the track builder uses: scene05.json plane n/d, the per-section drop DH = D.n);
//   * multiplies their colour by a gentle travelling ripple (+-AMP_RIPPLE) that moves TOWARD the camera along the
//     tunnel axis (the river's flow direction) - the painted cyan / pink streak design and its colours stay the painting's;
//   * adds a view-dependent sparkle: each splat gets a ripple normal (analytic slope of the same wave field), the view ray
//     is reflected about it and compared with the light coming from the bright golden tunnel end -> moving, varied
//     white-cyan reflections that change as Benny / the camera moves;
//   * a tiny sideways shimmer of the water splats (a few mm, follows the flow phase);
//   * everything fades out with distance from the camera (5 -> 9 units), so distant copies cost nothing visually
//     and the pattern never repeats visibly between copies. Walls, rings, paddles, foam tops are untouched (height mask).
// The pattern is computed in WORLD coordinates, so it runs continuously across the copied sections (no seams at rings).
//
// Usage (see play3.html, lines marked // [waterflow]):
//   import { createWaterFlow } from './waterflow.js';
//   const WF = createWaterFlow({ TR, SC, meshes: [near, far, ...tiles.flatMap((t) => [t.hi, t.lo])], far });
//   ... each frame after the camera is placed:  WF.update(dt, camera);
// URL: ?noflow=1 disables it, ?flowamp=0.5 halves every effect, ?flowspeed=1.2 sets the flow speed (units / s).
import * as THREE from 'three';
import { dyno } from '@sparkjsdev/spark';

const f = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));
const v3 = (v) => `vec3(${f(v.x)}, ${f(v.y)}, ${f(v.z)})`;

export function createWaterFlow({ TR, SC, meshes, far = null, amp = 1, speed = 0.9 }) {
  const N = new THREE.Vector3(...SC.plane.n).normalize();
  const AX = new THREE.Vector3(...TR.ax).normalize();
  const RT = new THREE.Vector3(...TR.right).normalize();
  const D = new THREE.Vector3(...TR.D);
  const LT = TR.UB - TR.UA, DU = D.dot(AX);
  const DH = D.dot(N);            // water drop per copied section (builder ramp)
  const DLAT = D.dot(RT);         // sideways drift of the tunnel per section
  const L = AX.clone().addScaledVector(N, 0.32).normalize(); // light from the golden tunnel end, slightly above the water

  const uT = dyno.dynoFloat(0), uAmp = dyno.dynoFloat(amp), uK = dyno.dynoFloat(1);
  const uCam = dyno.dynoVec3(new THREE.Vector3());

  const GLOBALS = `
const vec3 WF_AX = ${v3(AX)};
const vec3 WF_N = ${v3(N)};
const vec3 WF_RT = ${v3(RT)};
const vec3 WF_L = ${v3(L)};
const float WF_D = ${f(SC.plane.d)};
const float WF_DH = ${f(DH)};
const float WF_DLAT = ${f(DLAT)};
const float WF_UA = ${f(TR.UA)};
const float WF_LT = ${f(LT)};
const float WF_V = ${f(speed)};
float wf_hash(int i) { return fract(sin(float(i) * 12.9898 + 4.1414) * 43758.5453); }
`;

  const makeModifier = () => dyno.dynoBlock({ gsplat: dyno.Gsplat }, { gsplat: dyno.Gsplat }, ({ gsplat }) => {
    const d = new dyno.Dyno({
      inTypes: { gsplat: dyno.Gsplat, t: 'float', cam: 'vec3', amp: 'float', kmax: 'float' },
      outTypes: { gsplat: dyno.Gsplat },
      globals: () => [GLOBALS],
      statements: ({ inputs, outputs }) => dyno.unindentLines(`
        ${outputs.gsplat} = ${inputs.gsplat};
        if (isGsplatActive(${outputs.gsplat}.flags)) {
          vec3 P = ${outputs.gsplat}.center;
          float u = dot(P, WF_AX);
          float k = clamp((u - WF_UA) / WF_LT, 0.0, ${inputs.kmax});
          float h = dot(P, WF_N) - WF_D - WF_DH * k;          // height above this section's water surface
          float lat = dot(P, WF_RT) - WF_DLAT * k;            // sideways from the tunnel's own centre line
          float wW = 1.0 - smoothstep(0.05, 0.15, h);         // water + low foam only (walls, rings, paddles untouched)
          float wL = 1.0 - smoothstep(0.98, 1.18, abs(lat));  // inside the tunnel floor
          float dist = length(P - ${inputs.cam});
          float w = wW * wL * (1.0 - smoothstep(5.0, 9.0, dist)) * ${inputs.amp};
          if (w > 0.002) {
            float t = ${inputs.t};
            float hs = wf_hash(${outputs.gsplat}.index);
            float tt = t * WF_V;
            // three travelling wave trains; phase (u + V t): crests move to smaller u = toward the camera
            float a1 = (u + tt) * 13.0 + lat * 2.1 + 1.3 * sin(lat * 2.7 + u * 1.9);
            float a2 = (u + tt * 1.35) * 29.0 - lat * 4.3 + 1.1 * sin(u * 3.3 - lat * 2.2 + t * 0.8);
            float a3 = (u + tt * 0.7) * 5.0 + lat * 1.1;
            float r = 0.5 * sin(a1) + 0.3 * sin(a2) + 0.2 * sin(a3);
            // ripple slopes -> normal -> reflection of the golden tunnel-end light
            float du = 6.5 * cos(a1) * (1.0 + 1.3 * 1.9 * cos(lat * 2.7 + u * 1.9) / 13.0) + 8.7 * cos(a2) + 1.0 * cos(a3);
            float dl = 0.5 * cos(a1) * (2.1 + 1.3 * 2.7 * cos(lat * 2.7 + u * 1.9)) - 0.3 * cos(a2) * (4.3 + 1.1 * 2.2 * cos(u * 3.3 - lat * 2.2 + t * 0.8)) + 0.22 * cos(a3);
            vec3 nrm = normalize(WF_N - 0.011 * (du * WF_AX + dl * WF_RT));
            vec3 R = reflect(normalize(P - ${inputs.cam}), nrm);
            float sp = pow(max(dot(R, WF_L), 0.0), 40.0);
            float tw = smoothstep(0.6, 1.0, 0.5 + 0.5 * sin(t * 3.1 + hs * 6.2832));
            vec3 c = ${outputs.gsplat}.rgba.rgb;
            c *= 1.0 + 0.08 * r * w;                                   // brightness only: hue and saturation unchanged
            c += w * (0.11 * sp + 0.08 * sp * tw) * vec3(0.80, 0.96, 1.0); // sparse white-cyan glints (kept small: whitening lowers saturation)
            ${outputs.gsplat}.rgba.rgb = c;
            ${outputs.gsplat}.center += WF_RT * (0.0035 * w * sin(t * 2.3 + u * 7.0 + hs * 6.2832));
          }
        }
      `),
    });
    gsplat = d.apply({ gsplat, t: uT, cam: uCam, amp: uAmp, kmax: uK }).gsplat;
    return { gsplat };
  });

  for (const m of meshes) { m.worldModifier = makeModifier(); m.updateGenerator(); }

  let time = 0;
  return {
    meshes,
    get time() { return time; },
    set amp(a) { uAmp.value = a; },
    update(dt, camera) {
      time += Math.max(0, dt || 0);
      uT.value = time;
      camera.getWorldPosition(uCam.value);
      // the far piece sits after copy `last`; its water is flat at the level after that copy
      const last = far ? Math.round(far.position.dot(AX) / DU) : (TR.N ?? 10);
      uK.value = last + 1;
      for (const m of meshes) if (m.visible) m.updateVersion();
    },
  };
}
