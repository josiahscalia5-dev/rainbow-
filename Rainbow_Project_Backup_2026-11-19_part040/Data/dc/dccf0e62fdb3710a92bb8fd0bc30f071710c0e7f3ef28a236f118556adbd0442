/**
 * `?match08=1` — Screen 08 approved-picture test (2026-11-17, qa/match/08/NOTES.md).
 * REAL 3D proxy geometry of the Final Spin Chamber, solved from the user's approved Screen 08 and the locked game
 * camera (tools/match08/fit_proxies.py → assets/textures/match08/proj08.json): inlet pipe, gold arch, chamber walls,
 * door wall, floor/river plane, platform (top tilted toward the camera as painted), towel and the four half-dome spouts.
 * Every surface is textured by camera projection of the CLEAN environment-only artwork (Benny, HUD, coins removed;
 * qa/imageblaster/08/) from that locked camera, so the locked view shows the approved scenery and a moving camera sees
 * it on geometry (parallax). Surfaces the projector cannot see (behind props) get a plain fallback colour instead of
 * a smeared copy (projector depth test). The shader undoes the game's post chain (PROJ05_INVERSE) and takes no fog.
 * Without the switch nothing in this file runs and the game is unchanged.
 */
import * as THREE from 'three';
import { PROJ05_INVERSE, flag05 } from '../vfx/waterRibbon';

interface Layout {
  camera: { matrixWorld: number[]; fov: number; size: [number, number] };
  floorY: number;
  chamber: { cx: number; cy: number; r: number; zBack: number; zDoor: number };
  arch: { z: number; outer: { cx: number; cy: number; r: number }; inner: { cx: number; cy: number; r: number }; depth: number };
  pipe: { cx: number; cy: number; r: number; z0: number; z1: number };
  backwall: { z: number; holeR: number };
  platform: { cx: number; cz: number; r: number; topY: number; rimBottomY: number; floorY: number; tiltDeg: number };
  towel: { cx: number; cz: number; w: number; h: number; y0: number; d: number };
  spouts: Record<string, { c: [number, number, number]; rx: number; ry: number }>;
}

export interface Match08 {
  group: THREE.Group;
  /** the approved picture's splash ring around Benny (camera-facing card; Game places it at Benny + splashOffset) */
  splash: THREE.Mesh;
  splashOffset: THREE.Vector3;
  /** render the projector depth map once (needs the renderer); call after the group is in the scene */
  bakeDepth(renderer: THREE.WebGLRenderer): void;
  /** live post values for the inverse (exposure from the renderer, render size for the vignette inverse) */
  sync(renderer: THREE.WebGLRenderer, w: number, h: number): void;
}

const VERT = /* glsl */ `
uniform mat4 uProjVP;
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vProj = uProjVP * wp;
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */ `
uniform sampler2D uPlate;
uniform sampler2D uDepth;
uniform float uUseDepth;
uniform vec2 uNearFar;
uniform vec3 uFallback;
uniform sampler2D uPatch;   // material patch cut from the approved artwork (wall slots / gold band / towel)
uniform float uPatchK;      // patch repeats per world unit
uniform vec3 uProjPos;      // projector (approved view) position
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform sampler2D uFill;    // m08fill: world-anchored wall tile cut from the picture's near pipe wall (unwrap08.py)
uniform float uFillMode;    // 0 off (triplanar patch), 1 drum wall (around the chamber axis), 2 flat disc (x/y)
uniform vec2 uFillSize;     // tile size in world units (around, along)
uniform vec3 uDrum;         // chamber axis x, y and radius
uniform mat4 uProjVP;
uniform float uSwim;        // m08swim (floor only): the painted river's banks spread to cover Benny's whole swim lane
uniform sampler2D uRiv;     // 64 x 1: painted river centre x (r) and full width (g) along z
uniform vec4 uRivZ;         // z at texel 0, z at texel 63, lane half-width to cover, floor y
uniform sampler2D uOcc;     // m08occ (door wall only): plate with towel + platform painted out (occ08.py), alpha = usable
uniform float uOccOn;
uniform sampler2D uTMask;   // m08towelm (towel only): the painted towel's outline in plate coordinates (towelmask08.py)
uniform float uTMaskOn;
uniform vec4 uClipIn;       // m08far collar only: discard inside this x/y circle (the chamber's cross-section) ...
uniform vec4 uClipOut;      // ... and outside this one (the pushed arch's outline); w > 0.5 = on
uniform vec4 uCeil;         // m08ceil (door wall only): painted door centre x, y on the door plane, plane z, w > 0.5 = on
uniform vec4 uCeilW;        // m08ceil source window: angle start, angle width (rad), radius band start, end (world u)
uniform sampler2D uRingT;   // m08ring: periodic slot-ring tile (ring08.py): u = angle, v = radius (repeat-wrapped)
uniform vec4 uRing;         // m08ring: angle start, angle period (rad), radius start, radius period (u)
uniform float uRingOn;
uniform vec2 uCeilD;        // m08drum (chamber drum only): x > 0.5 = on, y = fade length (u) from the door plane toward the arch
uniform sampler2D uNearT;   // m08near (floor only): crisp near-river tile from the approved picture's own near band (near08.py)
uniform vec4 uNear;         // z at tile v = 0, world length of one tile period along the river, tile lateral half range A, w > 0.5 = on
uniform vec4 uNearM;        // projection magnification ramp start / end, lateral fade start / end (|lane position|, 1 = bank)
uniform vec2 uNearC;        // tile a of the lane centre and of the half lane (the painted water incl. foam spans c +- h)
uniform vec4 uCup;          // m08cup (spout cups only): cup centre xyz, w > 0.5 = on
uniform vec3 uCupM;         // m08cup mirror plane normal (horizontal, perpendicular to the projector's view of the cup)
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
${PROJ05_INVERSE}
// triplanar, mirrored-repeat sampling of the patch: surfaces the approved picture never showed (or showed edge-on)
vec3 patchColor() {
  vec3 n = abs(normalize(vN)); n /= max(n.x + n.y + n.z, 1e-4);
  vec3 p = vW * uPatchK;
  return texture2D(uPatch, p.zy).rgb * n.x + texture2D(uPatch, p.xz).rgb * n.y + texture2D(uPatch, p.xy).rgb * n.z;
}
float linZ(float d) { float n = uNearFar.x, f = uNearFar.y; float z = d * 2.0 - 1.0; return 2.0 * n * f / (f + n - z * (f - n)); }
vec3 fillColor() {
  vec2 q;
  if (uFillMode < 1.5) {
    // angle from straight down: the wrap of atan lies under the floor, never seen
    float a = atan(vW.x - uDrum.x, -(vW.y - uDrum.y));
    float n = floor(6.2831853 * uDrum.z / uFillSize.x + 0.5);  // whole tiles around the drum: no seam
    q = vec2(a / 6.2831853 * n, vW.z / uFillSize.y);
  } else q = vW.xy / uFillSize;
  return texture2D(uFill, q).rgb;
}
// m08ceil: the painted end wall is concentric around the door (chrome rim, gold bulb ring, slot rows), so a door-wall point
// the approved view could not see (behind the arch ring: the ceiling above the door) takes the user's pixels from the SAME
// radius in a clean window of the painted wall beside the door (left of the door, between the spout cup and its stream),
// repeated (mirrored, a whole number of times around) by angle; beyond the window's slot band the slot rows repeat outward.
// The rings therefore continue across the old seam instead of meeting a generic tile.
vec3 ceilColorAt(vec2 pxy) {
  vec2 d = pxy - uCeil.xy;
  float r = length(d), a = atan(d.y, d.x);
  float fu = mod((a - uCeilW.x) / uCeilW.y, 2.0);
  float as = uCeilW.x + (fu < 1.0 ? fu : 2.0 - fu) * uCeilW.y;
  float rs = r;
  if (r > uCeilW.w) { float w2 = uCeilW.w - uCeilW.z, fr = mod(r - uCeilW.w, 2.0 * w2); rs = fr < w2 ? uCeilW.w - fr : uCeilW.z + (fr - w2); }
  vec4 q = uProjVP * vec4(uCeil.xy + rs * vec2(cos(as), sin(as)), uCeil.z, 1.0);
  vec3 c = texture2D(uPlate, q.xy / q.w * 0.5 + 0.5).rgb;
  // m08ring (r12): the slot band and beyond repeat the same window PERIODICALLY (no mirror lines -> no chevrons / diamonds);
  // explicit gradients from the continuous point (the atan wrap would break the implicit mip selection)
  vec2 ex = dFdx(pxy), ey = dFdy(pxy);
  float r2 = max(r * r, 1e-6), r1 = max(r, 1e-3);
  vec2 gx = vec2((d.x * ex.y - d.y * ex.x) / r2 / uRing.y, dot(d, ex) / r1 / uRing.w);
  vec2 gy = vec2((d.x * ey.y - d.y * ey.x) / r2 / uRing.y, dot(d, ey) / r1 / uRing.w);
  vec3 rc = textureGrad(uRingT, vec2((a - uRing.x) / uRing.y, (r - uRing.z) / uRing.w), gx, gy).rgb;
  return mix(c, rc, uRingOn * smoothstep(uCeilW.z, uCeilW.z + 0.15, r));
}
vec3 riv(float z) {
  float f = clamp((z - uRivZ.x) / (uRivZ.y - uRivZ.x), 0.0, 1.0) * 63.0;
  float i0 = floor(f);
  vec3 a = texture2D(uRiv, vec2((i0 + 0.5) / 64.0, 0.5)).rgb, b = texture2D(uRiv, vec2((min(i0 + 1.0, 63.0) + 0.5) / 64.0, 0.5)).rgb;
  return mix(a, b, f - i0);
}
// m08swim: lateral remap of a floor point. The middle of the painted river stays as painted, its banks (water edge,
// foam) are spread out to the lane half-width, the floor beyond is pushed out and eased back over 2.5 u. World-anchored
// (depends on the floor point only) and faded in with the camera's distance from the approved viewpoint.
vec3 swimRemap(vec3 w, float mv) {
  vec3 r = riv(w.z);
  // (b > 0, m08rw only: a wider lane to cover near the camera, where the painted gold arch legs hug the banks)
  float hp = 0.5 * r.y, h = mix(hp, max(hp, r.z > 0.0 ? r.z : uRivZ.z), mv);
  if (h <= hp + 1e-3) return w;
  float d = w.x - r.x, ad = abs(d), a = 0.45 * hp, e = h - hp, o;
  if (ad <= a) o = ad;
  else if (ad <= h) o = a + (ad - a) * (hp - a) / (h - a);
  else o = ad - e * max(0.0, 1.0 - (ad - h) / 2.5);
  return vec3(r.x + sign(d) * o, w.y, w.z);
}
void main() {
  if (uClipIn.w > 0.5 && (distance(vW.xy, uClipIn.xy) < uClipIn.z || distance(vW.xy, uClipOut.xy) > uClipOut.z)) discard;
  // m08towelm: the towel proxy is cut to the painted towel's outline (the depth bake does the same, so the door wall
  // behind receives the window pixels that the rectangle used to carry at towel depth)
  if (uTMaskOn > 0.5 && vProj.w > 0.0 && texture2D(uTMask, vProj.xy / vProj.w * 0.5 + 0.5).r < 0.5) discard;
  // m08fill fades in as the camera leaves the approved viewpoint (the approved view keeps its exact old pixels)
  vec3 pc = patchColor();
  if (uFillMode > 0.5) pc = mix(pc, fillColor(), smoothstep(0.2, 1.5, distance(cameraPosition, uProjPos)));
  if (uCeil.w > 0.5) pc = mix(pc, ceilColorAt(vW.xy), smoothstep(0.2, 1.5, distance(cameraPosition, uProjPos)));
  // m08drum: a drum point the approved view could not see (the top corners next to the door, behind the arch ring) continues
  // the SAME painted rings as the door wall: the projector ray through it is followed to the door plane and coloured there
  // as m08ceil colours the door wall (identical at the drum / door-wall junction, so no seam); fades out toward the arch
  if (uCeilD.x > 0.5) {
    vec3 dp = uProjPos + (vW - uProjPos) * ((uCeil.z - uProjPos.z) / (vW.z - uProjPos.z));
    float wz = 1.0 - smoothstep(uCeil.z + 0.5 * uCeilD.y, uCeil.z + uCeilD.y, vW.z);
    pc = mix(pc, ceilColorAt(dp.xy), wz * smoothstep(0.2, 1.5, distance(cameraPosition, uProjPos)));
  }
  vec3 t = pc;
  // stretch guard: the projection is used where the current view sees the surface no more face-on than the approved
  // view did (ratio of the two incidence cosines); in the approved view itself the ratio is 1 -> pure projection
  vec3 nn = normalize(vN);
  float cp = abs(dot(nn, normalize(uProjPos - vW))), cc = abs(dot(nn, normalize(cameraPosition - vW)));
  float keep = 1.0 - smoothstep(2.5, 6.0, cc / max(cp, 1e-3));
  vec4 pj = vProj;
  float pw = 0.0;  // weight of the direct projection in t (m08cup fills the rest from the cup's mirrored side)
  if (uSwim > 0.5) {
    float ms = smoothstep(0.2, 1.5, distance(cameraPosition, uProjPos));
    if (ms > 0.0) pj = uProjVP * vec4(swimRemap(vW, ms), 1.0);
  }
  if (pj.w > 0.0) {
    vec3 ndc = pj.xyz / pj.w;
    vec2 uv = ndc.xy * 0.5 + 0.5;
    if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
      float vis = 1.0;
      if (uUseDepth > 0.5) {
        float zf = linZ(ndc.z * 0.5 + 0.5);
        float zs = linZ(texture2D(uDepth, uv).r);
        vis = 1.0 - smoothstep(0.015 * zs, 0.04 * zs + 0.05, zf - zs);
        // m08fill: once the camera has left the approved viewpoint, a soft hand-over to the fill (5 x 5 taps over ~3 %
        // of the frame) instead of a hard shadow line; at the viewpoint itself the exact single-tap test (view unchanged)
        float mv = uFillMode > 0.5 ? smoothstep(0.2, 1.5, distance(cameraPosition, uProjPos)) : 0.0;
        if (mv > 0.0) {
          float sv = 0.0;
          for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) {
            float zt = linZ(texture2D(uDepth, uv + vec2(float(i), float(j) * 0.5625) * 0.007).r);
            sv += 1.0 - smoothstep(0.015 * zt, 0.04 * zt + 0.05, zf - zt);
          }
          vis = mix(vis, smoothstep(0.0, 1.0, sv / 25.0), mv);
        }
      }
      // m08occ: what the approved view could not see behind the towel / platform comes from the occlusion plate (the
      // painted door / window continued), not from the fallback tile with its straight edges; off the viewpoint only
      vec3 base = pc;
      if (uOccOn > 0.5) {
        vec4 oc = texture2D(uOcc, uv);
        base = mix(pc, oc.rgb, oc.a * smoothstep(0.2, 1.5, distance(cameraPosition, uProjPos)));
      }
      t = mix(base, texture2D(uPlate, uv).rgb, vis * keep);
      pw = vis * keep;
    }
  }
  // m08cup: the cups are round (rotationally symmetric), so a cup point the approved view could not see (its top hidden
  // behind the gold arch, or its outer part beyond the picture's edge) takes the painted pixels of its mirror point
  // across the vertical plane through the cup axis and the projector; off the approved viewpoint only
  if (uCup.w > 0.5) {
    float mc = smoothstep(0.2, 1.5, distance(cameraPosition, uProjPos));
    // (r12: turning the hidden point about the cup axis instead (+-45 / +-90 deg) put wall pixels on the cup top: the
    // proxy dome is taller than the painted cup -> mirror only)
    vec3 wm = vW - 2.0 * dot(vW - uCup.xyz, uCupM) * uCupM;
    vec4 pm = uProjVP * vec4(wm, 1.0);
    if (mc > 0.0 && pw < 0.999 && pm.w > 0.0) {
      vec3 nd = pm.xyz / pm.w;
      vec2 um = nd.xy * 0.5 + 0.5;
      if (um.x >= 0.0 && um.x <= 1.0 && um.y >= 0.0 && um.y <= 1.0) {
        float zf = linZ(nd.z * 0.5 + 0.5), zs = linZ(texture2D(uDepth, um).r);
        float vm = 1.0 - smoothstep(0.015 * zs, 0.04 * zs + 0.05, zf - zs);
        t = mix(t, texture2D(uPlate, um).rgb, vm * (1.0 - pw) * mc);
      }
    }
  }
  // m08near: where the moving camera sees the floor projection magnified (it shows plate pixels the approved view saw far
  // away and small: smeared streaks), the crisp painted near river takes over, world-anchored along the painted river
  // (lateral = position across the swim lane, banks on the painted foam fringe; along = repeating with z). Off the
  // approved viewpoint only (approved view unchanged).
  if (uNear.w > 0.5) {
    // (measured on the plain projection: the swim remap is piecewise, its kinks would make the hand-over jump)
    vec2 pu = vProj.xy / max(vProj.w, 1e-4) * 0.5 * uPjRes;
    float det = abs(dFdx(pu).x * dFdy(pu).y - dFdx(pu).y * dFdy(pu).x);
    float mag = vProj.w > 0.0 ? inversesqrt(max(det, 1e-8)) : 99.0;
    float mn = smoothstep(0.2, 1.5, distance(cameraPosition, uProjPos));
    vec3 r = riv(vW.z);
    float hp = 0.5 * r.y, h = mix(hp, max(hp, uRivZ.z), mn);
    float sl = (vW.x - r.x) / h;
    vec2 tuv = vec2(0.5 + (uNearC.x + uNearC.y * sl) / (2.0 * uNear.z), (uNear.x - vW.z) / uNear.y);
    float wn = mn * smoothstep(uNearM.x, uNearM.y, mag) * (1.0 - smoothstep(uNearM.z, uNearM.w, abs(sl)));
    if (wn > 0.0) t = mix(t, texture2D(uNearT, tuv).rgb, wn);
  }
  gl_FragColor = vec4(pjInverse(t), 1.0);
}`;

/** several (nu × nv) vertex grids f(u, v) → one indexed geometry (m08arch: fine tessellation for per-vertex pushes) */
function gridGeo(parts: [number, number, (u: number, v: number) => THREE.Vector3][]): THREE.BufferGeometry {
  const pos: number[] = [], idx: number[] = [];
  for (const [nu, nv, f] of parts) {
    const b = pos.length / 3;
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) { const p = f(i / nu, j / nv); pos.push(p.x, p.y, p.z); }
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = b + j * (nu + 1) + i, c = a + nu + 1; idx.push(a, c, a + 1, c, c + 1, a + 1); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}

export async function buildMatch08(): Promise<Match08> {
  const L: Layout = await fetch(new URL('../../assets/textures/match08/proj08.json', import.meta.url).href).then((r) => r.json());
  const plate = await new THREE.TextureLoader().loadAsync(new URL('../../assets/textures/match08/plate08_hybrid.png', import.meta.url).href);
  plate.colorSpace = THREE.NoColorSpace; // raw display values: the shader inverts the post chain itself
  plate.minFilter = THREE.LinearMipmapLinearFilter;
  plate.anisotropy = 8;

  // the projector = the locked game camera the picture was matched to
  const [W, H] = L.camera.size;
  const proj = new THREE.PerspectiveCamera(L.camera.fov, W / H, 0.2, 160);
  proj.matrixWorld.fromArray(L.camera.matrixWorld);
  proj.matrixWorld.decompose(proj.position, proj.quaternion, proj.scale);
  proj.matrixWorldInverse.copy(proj.matrixWorld).invert();
  proj.updateProjectionMatrix();
  const projVP = new THREE.Matrix4().multiplyMatrices(proj.projectionMatrix, proj.matrixWorldInverse);

  const depthRT = new THREE.WebGLRenderTarget(1024, Math.round((1024 * H) / W), { depthBuffer: true });
  depthRT.depthTexture = new THREE.DepthTexture(depthRT.width, depthRT.height, THREE.UnsignedIntType);
  const shared = {
    uPlate: { value: plate },
    uDepth: { value: depthRT.depthTexture as THREE.Texture },
    uUseDepth: { value: 0 },
    uNearFar: { value: new THREE.Vector2(proj.near, proj.far) },
    uProjVP: { value: projVP },
    uPjPost: { value: new THREE.Vector4(0.86, 1.36, 1.15, 0.18) },
    uPjRes: { value: new THREE.Vector2(W, H) },
    uProjPos: { value: proj.position.clone() },
  };
  // material patches cut from the approved artwork (tools: qa/match/08/NOTES.md), mirrored so the tiling has no seams
  const loadPatch = async (name: string) => {
    const t = await new THREE.TextureLoader().loadAsync(new URL(`../../assets/textures/match08/patch_${name}.png`, import.meta.url).href);
    t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.anisotropy = 4; return t;
  };
  const [pWall, pGold, pTowel] = await Promise.all([loadPatch('wall'), loadPatch('gold'), loadPatch('towel')]);
  // `&m08fill=1` (scenery round): chamber surfaces the picture never showed get a world-anchored tile of the picture's
  // own wall (no mirrored kaleidoscope); see tools/match08/unwrap08.py and qa/match/08/scenery/NOTES.md
  const fill = flag05('m08fill');
  let fillTex: THREE.Texture | null = null, fillSize = new THREE.Vector2(1, 1);
  if (fill) {
    const FJ: { w: number; h: number } = await fetch(new URL('../../assets/textures/match08/fill_drum.json', import.meta.url).href).then((r) => r.json());
    fillTex = await new THREE.TextureLoader().loadAsync(new URL('../../assets/textures/match08/fill_drum.png', import.meta.url).href);
    fillTex.colorSpace = THREE.NoColorSpace; fillTex.wrapS = fillTex.wrapT = THREE.RepeatWrapping; fillTex.anisotropy = 8;
    // `&m08seam=1` (r6): the tile came from the NEAR pipe wall; on the chamber drum its slots looked denser than the painted
    // chamber wall beside them (a visible slot-size change at the hand-over) -> scale the tile (×m08seamk, default 1.6)
    const seamK = flag05('m08seam') ? Number(new URLSearchParams(location.search).get('m08seamk') ?? '') || 1.6 : 1;
    fillSize = new THREE.Vector2(FJ.w * seamK, FJ.h * seamK);
  }
  // `&m08swim=1` (scenery round r6): Benny can steer ±2.22 u (+ his body) off the course centre, but the painted river is
  // only 2–4 u wide over the first 8 u of the chamber, so hard steering put him on the purple floor. The floor material
  // spreads the painted river's banks to the whole reachable lane (river08.json centre / width), approved view unchanged.
  const swimOn = flag05('m08swim');
  const RV: { z: number[]; x: number[]; width: number[] } = await fetch(new URL('../../assets/textures/match08/river08.json', import.meta.url).href).then((r) => r.json());
  const SWIM_HALF = Number(new URLSearchParams(location.search).get('m08swimw') ?? '') || 2.95; // lat 2.22 + body ≈ 0.73
  const rivData = new Float32Array(64 * 4);
  // z descending arrays -> centre x, width at z (clamped at both ends)
  const rivAt = (R: { z: number[]; x: number[]; width: number[] }, z: number): [number, number] => {
    let k = 0; while (k < R.z.length - 2 && R.z[k + 1] > z) k++;
    const f = THREE.MathUtils.clamp((z - R.z[k]) / (R.z[k + 1] - R.z[k]), 0, 1);
    return [R.x[k] + (R.x[k + 1] - R.x[k]) * f, R.width[k] + (R.width[k + 1] - R.width[k]) * f];
  };
  // `&m08rw=1` (r12): near the camera river08's traced edges follow Benny's splash crest / the arch feet, not the banks
  // (0.8-2.5 u instead of the painted ~3-4.5 u), so the swim remap stretched the near water sideways up to ~13x and
  // jumped where the trace starts. Render remap only: the bank-to-bank width read on the picture (rivnear08.py) near the
  // camera, river08 beyond (the gameplay path in course.ts is unchanged)
  let RN: { z: number[]; x: number[]; width: number[]; blend: [number, number]; nearHalf: number; nearZ: [number, number] } | null = null;
  if (flag05('m08rw')) RN = await fetch(new URL('../../assets/textures/match08/river08_near.json', import.meta.url).href).then((r) => r.json());
  const rz0 = RN ? Math.max(RV.z[0], RN.z[0]) : RV.z[0], rz1 = RV.z[RV.z.length - 1];
  for (let i = 0; i < 64; i++) {
    const z = rz0 + ((rz1 - rz0) * i) / 63;
    let [x, w] = rivAt(RV, z);
    if (RN) {
      const [xn, wn] = rivAt(RN, z), b = THREE.MathUtils.smoothstep(z, RN.blend[1], RN.blend[0]);
      x += (xn - x) * b; w += (wn - w) * b;
    }
    rivData[i * 4] = x;
    rivData[i * 4 + 1] = w;
    // m08rw: lane half-width to cover (b): near the camera the frame bottom shows +-3.5 u of floor and the painted gold legs
    // lie just beyond the banks there, so the banks are spread to 4.0 u (the legs' pixels stay out of frame); 0 = default
    if (RN) rivData[i * 4 + 2] = SWIM_HALF + (RN.nearHalf - SWIM_HALF) * THREE.MathUtils.smoothstep(z, RN.nearZ[1], RN.nearZ[0]);
  }
  const rivTex = new THREE.DataTexture(rivData, 64, 1, THREE.RGBAFormat, THREE.FloatType);
  rivTex.minFilter = rivTex.magFilter = THREE.NearestFilter; rivTex.needsUpdate = true;
  const rivZ = new THREE.Vector4(rz0, rz1, SWIM_HALF, L.floorY);
  // `&m08occ=1` (r8): occlusion plate for the door wall (tools/match08/occ08.py)
  let occTex: THREE.Texture | null = null;
  if (flag05('m08occ')) {
    occTex = await new THREE.TextureLoader().loadAsync(new URL('../../assets/textures/match08/occ08_door.png', import.meta.url).href);
    occTex.colorSpace = THREE.NoColorSpace; occTex.minFilter = THREE.LinearMipmapLinearFilter; occTex.anisotropy = 8;
  }
  // `&m08towelm=1` (r8): towel outline mask (tools/match08/towelmask08.py); only the towel material switches it on
  let tMaskTex: THREE.Texture | null = null;
  if (flag05('m08towelm')) {
    tMaskTex = await new THREE.TextureLoader().loadAsync(new URL('../../assets/textures/match08/towel08_mask.png', import.meta.url).href);
    tMaskTex.colorSpace = THREE.NoColorSpace;
  }
  // `&m08near=1` (r11): crisp near-river tile cut from the approved picture's own near river band (tools/match08/near08.py)
  let nearTex: THREE.Texture | null = null;
  let NJ: { A: number; z0: number; zLen: number; halfWidth: number; waterA: [number, number] } | null = null;
  if (swimOn && flag05('m08near')) {
    NJ = await fetch(new URL('../../assets/textures/match08/near08.json', import.meta.url).href).then((r) => r.json());
    nearTex = await new THREE.TextureLoader().loadAsync(new URL('../../assets/textures/match08/near08.png', import.meta.url).href);
    nearTex.colorSpace = THREE.NoColorSpace; nearTex.wrapS = THREE.ClampToEdgeWrapping; nearTex.wrapT = THREE.RepeatWrapping;
    nearTex.minFilter = THREE.LinearMipmapLinearFilter; nearTex.anisotropy = 8;
  }
  // `&m08ring=1` (r12): periodic slot-ring tile for m08ceil / m08drum (tools/match08/ring08.py)
  let ringTex: THREE.Texture | null = null;
  let RG: { a0Deg: number; aPeriodDeg: number; r0: number; rPeriod: number } | null = null;
  if (flag05('m08ceil') && flag05('m08ring')) {
    RG = await fetch(new URL('../../assets/textures/match08/ring08.json', import.meta.url).href).then((r) => r.json());
    ringTex = await new THREE.TextureLoader().loadAsync(new URL('../../assets/textures/match08/ring08.png', import.meta.url).href);
    ringTex.colorSpace = THREE.NoColorSpace; ringTex.wrapS = ringTex.wrapT = THREE.RepeatWrapping;
    ringTex.minFilter = THREE.LinearMipmapLinearFilter; ringTex.anisotropy = 8;
  }
  const mat = (fallback: string, patch: THREE.Texture, k: number, fillMode = 0, swimMode = 0) => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide, fog: false,
    uniforms: { ...shared, uFallback: { value: new THREE.Color(fallback) }, uPatch: { value: patch }, uPatchK: { value: k },
      uFill: { value: fillTex ?? patch }, uFillMode: { value: fill ? fillMode : 0 }, uFillSize: { value: fillSize },
      uDrum: { value: new THREE.Vector3(L.chamber.cx, L.chamber.cy, L.chamber.r) },
      uSwim: { value: swimOn ? swimMode : 0 }, uRiv: { value: rivTex }, uRivZ: { value: rivZ },
      uOcc: { value: occTex ?? plate }, uOccOn: { value: 0 }, uTMask: { value: tMaskTex ?? plate }, uTMaskOn: { value: 0 },
      uClipIn: { value: new THREE.Vector4(0, 0, 0, 0) }, uClipOut: { value: new THREE.Vector4(0, 0, 0, 0) },
      uCeil: { value: new THREE.Vector4(0, 0, 0, 0) }, uCeilW: { value: new THREE.Vector4(0, 1, 0, 1) }, uCeilD: { value: new THREE.Vector2(0, 1) },
      uRingT: { value: ringTex ?? plate }, uRing: { value: new THREE.Vector4(0, 1, 0, 1) }, uRingOn: { value: 0 },
      uNearT: { value: nearTex ?? plate }, uNear: { value: new THREE.Vector4(0, 1, 1, 0) }, uNearM: { value: new THREE.Vector4(1, 2, 0.9, 1) },
      uNearC: { value: new THREE.Vector2(0, 1) },
      uCup: { value: new THREE.Vector4(0, 0, 0, 0) }, uCupM: { value: new THREE.Vector3(1, 0, 0) } },
  });
  // patch scale: wall slots ≈ 2.4 u per patch, gold band ≈ 1.2 u, towel ≈ 1 u
  const M = { wall: mat('#c25bd0', pWall, 1 / 2.4), drum: mat('#c25bd0', pWall, 1 / 2.4, 1), disc: mat('#c25bd0', pWall, 1 / 2.4, 2), floor: mat('#9c55c8', pWall, 1 / 2.4, 0, 1), gold: mat('#e8a24a', pGold, 1 / 1.2), plat: mat('#b78ad6', pWall, 1 / 2.4), towel: mat('#6c3bc4', pTowel, 1 / 1.0) };

  if (tMaskTex) M.towel.uniforms.uTMaskOn.value = 1;
  if (nearTex && NJ) {
    // lane banks (+-SWIM_HALF) onto the painted foam fringe; along the river the tile keeps the painted proportions
    // (same scale as across: the lane is ~2x the painted near river, so the painted pattern is shown ~2x larger, unstretched)
    const q = new URLSearchParams(location.search), num = (k: string, d: number) => Number(q.get(k) ?? '') || d;
    const c = (NJ.waterA[0] + NJ.waterA[1]) / 2, hw = (NJ.waterA[1] - NJ.waterA[0]) / 2;
    const kIso = SWIM_HALF / hw / NJ.halfWidth;
    const u = M.floor.uniforms;
    u.uNear.value.set(NJ.z0, NJ.zLen * kIso * num('m08nearv', 1), NJ.A, 1);
    u.uNearM.value.set(num('m08nearm0', 1.6), num('m08nearm1', 2.6), num('m08nearl0', 0.85), num('m08nearl1', 1.0));
    u.uNearC.value.set(c, hw);
  }
  const group = new THREE.Group();
  group.name = 'match08_projection';
  const add = (g: THREE.BufferGeometry, m: THREE.Material, name: string) => { const o = new THREE.Mesh(g, m); o.name = 'm08_' + name; group.add(o); return o; };
  const C = L.chamber;

  // Scenery-in-motion round (2026-11-17, qa/match/08/scenery/NOTES.md). Every proxy surface shows exactly the approved
  // picture from the approved view (projection), so the near proxies can be reshaped / enlarged ABOUT THE APPROVED
  // VIEWPOINT without changing that view; only what a moving camera sees changes.
  //  `&m08lane=1`: inlet pipe + gold arch scaled ×LANE_K about the approved viewpoint (same picture, a wider swim lane:
  //   the fitted pipe left only ±1.35 u of water at the waterline, Benny steers to ±1.85 u + his body) and the pipe's
  //   lower half squared off (walls rise from the water at the lane edge instead of curving into it).
  //  `&m08bw=1`: the chamber's entrance wall sits flush behind the gold arch (was 3.6 u further in, where it rose out
  //   of the painted river and showed a stretched second copy of river / wall when riding forward).
  const fixLane = flag05('m08lane'), fixArch = !fixLane && flag05('m08arch'), fixBw = flag05('m08bw') || fixLane || fixArch;
  // `&m08arch=1` (scenery round r6): inlet pipe, gold arch and entrance wall pushed AWAY from the approved viewpoint
  // along the projector's own rays (×ARCH_K = 2.6), so the approved view stays the same picture while the camera, which
  // passed only ~0.4 u inside the fitted arch ring when steering, gets ~2 u of room. Uniform ×ARCH_K keeps the ring a
  // ring (a floor cap bent it toward the camera). The lowest band at the water stays where it was fitted (the arch's
  // bottom sill covers Benny's underside exactly as painted), ramping to ×ARCH_K by 0.9 u above the floor; pushed parts
  // that end below the floor are hidden by it (the floor then shows their painted pixels: gold feet near the arch).
  // `&m08far=1` (r10): ×4.2 instead of ×2.6. The ring then lies behind the two big near spout cups (as painted: the cups
  // overlap the arch's legs) and, seen from the moving camera, stays ~1.6× longer in frame as the gold oval framing the
  // chamber (top band + upper legs) instead of leaving the frame in the first third of the stage. Same approved picture
  // (uniform push along the projector rays); a collar at the ring's back closes the opening where it is wider than the drum.
  const farOn = fixArch && flag05('m08far');
  const ARCH_K = Number(new URLSearchParams(location.search).get('m08archk') ?? '') || (farOn ? 4.2 : 2.6);
  const VP = proj.position.clone();
  // `&m08sill=1` (r7): the unpushed water-level band stayed ~2.6× nearer than the rest of the ring, so riding 3 u forward
  // the camera passed over it and it tore into gold / blue slabs along the frame bottom. Uniform push: the whole ring moves
  // along its own rays (same approved picture); what ends below the water is hidden by the floor.
  const sillOn = flag05('m08sill');
  const pushK = (v: THREE.Vector3) => (sillOn ? ARCH_K : v.y <= L.floorY ? 1 : 1 + (ARCH_K - 1) * THREE.MathUtils.smoothstep(v.y, L.floorY + 0.1, L.floorY + 0.9));
  const pushV = (v: THREE.Vector3) => { const k = pushK(v); return v.sub(VP).multiplyScalar(k).add(VP); };
  const pushGeo = (g: THREE.BufferGeometry) => {
    if (!fixArch) return g;
    const a = g.getAttribute('position') as THREE.BufferAttribute, v = new THREE.Vector3();
    for (let i = 0; i < a.count; i++) { pushV(v.fromBufferAttribute(a, i)); a.setXYZ(i, v.x, v.y, v.z); }
    a.needsUpdate = true; g.computeVertexNormals(); return g;
  };
  const LANE_K = 1.45;
  const toView = new THREE.Matrix4();
  if (fixLane) {
    const P = proj.position;
    toView.makeTranslation(P.x, P.y, P.z).multiply(new THREE.Matrix4().makeScale(LANE_K, LANE_K, LANE_K)).multiply(new THREE.Matrix4().makeTranslation(-P.x, -P.y, -P.z));
  }
  // inlet pipe around the camera, ending at the arch (the picture's near walls outside the arch)
  const pipeLen = L.pipe.z0 - L.pipe.z1;
  let pipe: THREE.BufferGeometry;
  if (fixLane) {
    // open tube, circular top half, superellipse (n = 6) lower half: squared-off walls down to the water
    const NA = 128, NZ = 8, pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let j = 0; j <= NZ; j++) {
      const z = L.pipe.z0 - (pipeLen * j) / NZ;
      for (let i = 0; i <= NA; i++) {
        const a = (i / NA) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
        const e = sn < 0 ? 1 / 3 : 1; // |c|^(2/n), n = 6
        const x = L.pipe.r * Math.sign(c) * Math.pow(Math.abs(c), e), y = L.pipe.r * Math.sign(sn) * Math.pow(Math.abs(sn), e);
        pos.push(L.pipe.cx + x, L.pipe.cy + y, z); uv.push(i / NA, j / NZ);
      }
    }
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NA; i++) { const a = j * (NA + 1) + i, b = a + NA + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    pipe = new THREE.BufferGeometry();
    pipe.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); pipe.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    pipe.setIndex(idx); pipe.computeVertexNormals(); pipe.applyMatrix4(toView);
  } else {
    pipe = new THREE.CylinderGeometry(L.pipe.r, L.pipe.r, pipeLen, 128, fixArch ? 32 : 8, true);
    pipe.rotateX(Math.PI / 2).translate(L.pipe.cx, L.pipe.cy, (L.pipe.z0 + L.pipe.z1) / 2);
    pushGeo(pipe);
  }
  add(pipe, M.wall, 'pipe');
  // gold arch: annulus at the chamber entrance, extruded toward the door
  const ring = new THREE.Shape(); ring.absarc(0, 0, L.arch.outer.r, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(L.arch.inner.cx - L.arch.outer.cx, L.arch.inner.cy - L.arch.outer.cy, L.arch.inner.r, 0, Math.PI * 2, true);
  ring.holes.push(hole);
  let archG: THREE.BufferGeometry;
  if (fixArch) {
    // m08arch: the same ring as fine grids (front, bore, outer side, back), so every small piece moves along its own ray
    const oc = new THREE.Vector2(L.arch.outer.cx, L.arch.outer.cy), ic = new THREE.Vector2(L.arch.inner.cx, L.arch.inner.cy);
    const zF = L.arch.z, zB = L.arch.z - L.arch.depth;
    const cp = (c: THREE.Vector2, r: number, a: number, z: number) => new THREE.Vector3(c.x + r * Math.cos(a), c.y + r * Math.sin(a), z);
    const NA = 256;
    archG = gridGeo([
      [NA, 6, (u, t) => cp(ic, L.arch.inner.r, u * 2 * Math.PI, zF).lerp(cp(oc, L.arch.outer.r, u * 2 * Math.PI, zF), t)],
      [NA, 6, (u, t) => cp(ic, L.arch.inner.r, u * 2 * Math.PI, zF + (zB - zF) * t)],
      [NA, 6, (u, t) => cp(oc, L.arch.outer.r, u * 2 * Math.PI, zF + (zB - zF) * t)],
      [NA, 6, (u, t) => cp(ic, L.arch.inner.r, u * 2 * Math.PI, zB).lerp(cp(oc, L.arch.outer.r, u * 2 * Math.PI, zB), t)],
    ]);
  } else {
    archG = new THREE.ExtrudeGeometry(ring, { depth: L.arch.depth, bevelEnabled: false, curveSegments: 96 });
    archG.translate(L.arch.outer.cx, L.arch.outer.cy, L.arch.z - L.arch.depth);
  }
  if (fixLane) archG.applyMatrix4(toView);
  pushGeo(archG);
  add(archG, M.gold, 'arch');
  // the arch's back face (where the chamber starts) and its outer ring, after the optional lane scaling
  const archC = new THREE.Vector3(L.arch.outer.cx, L.arch.outer.cy, L.arch.z - L.arch.depth).applyMatrix4(toView);
  // (m08arch: the entrance wall is built at the unpushed arch and pushed with it; the chamber starts at the pushed wall)
  const chamberZ0 = fixArch ? VP.z + ARCH_K * (archC.z - VP.z) : archC.z;
  const archR = L.arch.outer.r * (fixLane ? LANE_K : 1);
  // back wall around the pipe mouth (closes the gap between pipe and chamber; seen only when moving in)
  // (m08bw: outer edge 3 u beyond the chamber wall so the bigger opening stays inside the outline — the rim is hidden
  // behind the chamber wall / under the floor)
  const bw = new THREE.Shape(); bw.absarc(C.cx, C.cy, C.r + (fixBw ? 3 : 0), 0, Math.PI * 2, false);
  const bh = new THREE.Path();
  if (fixBw) bh.absarc(archC.x, archC.y, archR * 0.985, 0, Math.PI * 2, true);
  else bh.absarc(L.pipe.cx, L.pipe.cy, L.backwall.holeR, 0, Math.PI * 2, true);
  bw.holes.push(bh);
  if (fixArch) {
    // m08arch: entrance wall as a fine polar grid between the arch outline and the outer rim (pushed piece by piece)
    const zW = archC.z - 0.02, ro = C.r + 3;
    add(pushGeo(gridGeo([[192, 24, (u, t) => {
      const a = u * 2 * Math.PI, ca = Math.cos(a), sa = Math.sin(a);
      return new THREE.Vector3(archC.x + archR * 0.985 * ca, archC.y + archR * 0.985 * sa, zW).lerp(new THREE.Vector3(C.cx + ro * ca, C.cy + ro * sa, zW), t);
    }]])), M.disc, 'backwall');
  } else add(new THREE.ShapeGeometry(bw, 64).translate(0, 0, fixBw ? archC.z - 0.02 : L.backwall.z), M.disc, 'backwall');
  // chamber walls (from the arch to the door wall) + the door wall
  const chLen = chamberZ0 - C.zDoor;
  const ch = new THREE.CylinderGeometry(C.r, C.r, chLen, 160, 24, true);
  ch.rotateX(Math.PI / 2).translate(C.cx, C.cy, C.zDoor + chLen / 2);
  add(ch, M.drum, 'chamber');
  if (farOn) {
    // m08far collar: in the arch's back plane, the part of the (pushed) arch opening that lies outside the drum's circular
    // cross-section (lower left / right just above the water) — without it the camera looked through that gap into the void
    const aP = archC.clone().sub(VP).multiplyScalar(ARCH_K).add(VP), rP = archR * ARCH_K + 0.5;
    const cm = mat('#c25bd0', pWall, 1 / 2.4, 2);
    cm.uniforms.uClipIn.value.set(C.cx, C.cy, C.r - 0.02, 1);
    cm.uniforms.uClipOut.value.set(aP.x, aP.y, rP, 1);
    add(new THREE.CircleGeometry(rP, 128).translate(aP.x, aP.y, chamberZ0 - 0.01), cm, 'collar');
  }
  // `&m08ceil=1` (r11): the door wall's unseen parts (above the door behind the arch ring = the curved ceiling seam) continue
  // the painted end wall by radius around the door (ceilColor in FRAG; window measured with tools/match08/ceil08.py polar
  // unroll: door centre = the painted door's rings, window 187°–217° (360° = 6 mirrored pairs) x radius 7.25–8.1 u slot band)
  const ceilOn = flag05('m08ceil');
  const doorM = occTex || ceilOn ? mat('#c25bd0', pWall, 1 / 2.4, 2) : M.disc;
  if (occTex) (doorM as THREE.ShaderMaterial).uniforms.uOccOn.value = 1;
  if (ceilOn) {
    const q = new URLSearchParams(location.search), num = (k: string, d: number) => Number(q.get(k) ?? '') || d;
    const d2r = THREE.MathUtils.degToRad;
    (doorM as THREE.ShaderMaterial).uniforms.uCeil.value.set(11.952, -103.725, C.zDoor, 1);
    (doorM as THREE.ShaderMaterial).uniforms.uCeilW.value.set(d2r(num('m08ceila', 187)), d2r(num('m08ceilw', 30)), num('m08ceilr0', 7.25), num('m08ceilr1', 8.1));
    if (RG) {
      const u = (doorM as THREE.ShaderMaterial).uniforms;
      u.uRing.value.set(d2r(RG.a0Deg), d2r(RG.aPeriodDeg), RG.r0, RG.rPeriod); u.uRingOn.value = 1;
    }
    // `&m08drum=1` (r12): the drum's top corners next to the door (hidden behind the arch ring in the approved view, a fill
    // tile with a soft curved edge against the door wall while swimming) continue the door wall's painted rings (FRAG)
    if (flag05('m08drum')) {
      const du = M.drum.uniforms;
      du.uCeil.value.set(11.952, -103.725, C.zDoor, 0);
      du.uCeilW.value.copy((doorM as THREE.ShaderMaterial).uniforms.uCeilW.value);
      du.uCeilD.value.set(1, num('m08druml', 16));
      du.uRing.value.copy((doorM as THREE.ShaderMaterial).uniforms.uRing.value); du.uRingOn.value = (doorM as THREE.ShaderMaterial).uniforms.uRingOn.value;
    }
  }
  add(new THREE.CircleGeometry(C.r, 96).translate(C.cx, C.cy, C.zDoor), doorM, 'doorwall');
  // floor / river plane at Benny's water level, from behind the camera to the door wall
  const fl = new THREE.PlaneGeometry(2 * C.r, L.pipe.z0 - C.zDoor, 32, 64);
  fl.rotateX(-Math.PI / 2).translate(C.cx, L.floorY, (L.pipe.z0 + C.zDoor) / 2);
  add(fl, M.floor, 'floor');
  // platform: top disc tilted toward the camera as painted, rim, leg skirt to the floor
  const P = L.platform;
  const top = new THREE.CircleGeometry(P.r, 96);
  const topM = add(top, M.plat, 'platform_top');
  topM.rotation.x = -Math.PI / 2 + THREE.MathUtils.degToRad(P.tiltDeg);
  topM.position.set(P.cx, P.topY, P.cz);
  const rimH = P.topY - P.rimBottomY;
  add(new THREE.CylinderGeometry(P.r, P.r, rimH, 96, 1, true).translate(P.cx, P.topY - rimH / 2, P.cz), M.gold, 'platform_rim');
  const skH = P.rimBottomY - P.floorY;
  add(new THREE.CylinderGeometry(P.r * 0.85, P.r * 0.85, skH, 96, 1, true).translate(P.cx, P.rimBottomY - skH / 2, P.cz), M.plat, 'platform_legs');
  // towel on the platform
  const T = L.towel;
  if (flag05('m08towel')) {
    // `&m08towel=1` (r7): the box's top / side faces were visible from the approved viewpoint and carried the door
    // window painted just above / beside the towel, so a moving camera saw a rectangular slab of door pixels on the
    // towel. Back corners now lie on the projector rays through the front corners (a frustum away from the viewpoint):
    // from the approved view only the front face shows (= the painted towel), the door wall behind gets its own pixels.
    const zF = T.cz + T.d / 2, zB = T.cz - T.d / 2, kB = (zB - VP.z) / (zF - VP.z);
    const F = (u: number, v: number) => new THREE.Vector3(T.cx - T.w / 2 + T.w * u, T.y0 + T.h * v, zF);
    const Bk = (u: number, v: number) => F(u, v).sub(VP).multiplyScalar(kB).add(VP);
    const side = (e: (t: number) => [number, number]) => (t: number, s: number) => F(...e(t)).lerp(Bk(...e(t)), s);
    add(gridGeo([
      [8, 8, F], [8, 8, (u, v) => Bk(1 - u, v)],
      [8, 4, side((t) => [t, 1])], [8, 4, side((t) => [1 - t, 0])],
      [8, 4, side((t) => [0, 1 - t])], [8, 4, side((t) => [1, t])],
    ]), M.towel, 'towel');
  } else add(new THREE.BoxGeometry(T.w, T.h, T.d, 4, 4, 4).translate(T.cx, T.y0 + T.h / 2, T.cz), M.towel, 'towel');
  // four half-dome spouts (flat perforated underside down)
  // `&m08cup=1` (r11): each cup gets its own material that mirrors the painted cup into the parts the approved view missed
  const cupOn = flag05('m08cup');
  for (const [k, s] of Object.entries(L.spouts)) {
    const dome = new THREE.SphereGeometry(1, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cap = new THREE.CircleGeometry(1, 48).rotateX(Math.PI / 2);
    let cm: THREE.ShaderMaterial = M.gold;
    if (cupOn) {
      cm = mat('#e8a24a', pGold, 1 / 1.2);
      const dx = VP.x - s.c[0], dz = VP.z - s.c[2], dl = Math.hypot(dx, dz);
      cm.uniforms.uCup.value.set(s.c[0], s.c[1], s.c[2], 1);
      cm.uniforms.uCupM.value.set(-dz / dl, 0, dx / dl);
    }
    // `&m08cupg=1` (r12, defect A): the approved view sees the two UPPER cups from below, and the painted cups hang well
    // below the fitted rim: a gold band, then the perforated underside dish (lowest painted point = the underside's far
    // edge). Those pixels used to land on the door wall 10 u behind (they slid off the cups while swimming and the top
    // half's band was smeared over the dome as an X). The upper cups get a band (open cylinder, same radius) down to the
    // painted underside and the underside disc at its bottom: band height read on the picture (projected far bottom edge
    // = painted lowest point: UL row 427 -> 1.5 u, UR row 464 -> 1.55 u). Lower cups (seen from above) unchanged.
    const band = flag05('m08cupg') ? ({ UL: 1.5, UR: 1.55 } as Record<string, number>)[k] ?? 0 : 0;
    const parts: [THREE.BufferGeometry, string][] = [[dome, 'dome'], [band > 0 ? cap.translate(0, -band / s.ry, 0) : cap, 'under']];
    if (band > 0) parts.push([new THREE.CylinderGeometry(1, 1, band / s.ry, 48, 4, true).translate(0, -band / s.ry / 2, 0), 'band']);
    for (const [g, nm] of parts) {
      const o = add(g, cm, `spout_${k}_${nm}`);
      o.scale.set(s.rx, s.ry, s.rx);
      o.position.set(...s.c);
    }
  }

  // QA only `&m08dbg=1`: every fitted surface in its own flat colour (which proxy carries which part of the frame)
  if (flag05('m08dbg')) {
    const pal = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ffffff', '#ff8000', '#8000ff', '#008040', '#804000', '#808080'];
    group.children.forEach((o, i) => { if (o.name === 'm08_collar') o.visible = false; /* its clip needs the shader */ (o as THREE.Mesh).material = new THREE.MeshBasicMaterial({ color: pal[i % pal.length], side: THREE.DoubleSide }); });
    console.log('m08dbg', group.children.map((o, i) => `${o.name}=${pal[i % pal.length]}`).join(' '));
  }

  // Benny's splash ring, cut from the ORIGINAL approved picture (white crest + droplets around his base; alpha = white,
  // low saturation): a card that rides with him, facing the camera, 1.3 u in front of his centre
  const SP: { offset: [number, number, number]; w: number; h: number } = await fetch(new URL('../../assets/textures/match08/splash08.json', import.meta.url).href).then((r) => r.json());
  const spTex = await new THREE.TextureLoader().loadAsync(new URL('../../assets/textures/match08/splash08.png', import.meta.url).href);
  spTex.colorSpace = THREE.NoColorSpace;
  const splash = new THREE.Mesh(new THREE.PlaneGeometry(SP.w, SP.h), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false,
    uniforms: { uTex: { value: spTex }, uPjPost: shared.uPjPost, uPjRes: shared.uPjRes },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform sampler2D uTex; uniform vec4 uPjPost; uniform vec2 uPjRes; varying vec2 vUv;\n${PROJ05_INVERSE}
void main() { vec4 c = texture2D(uTex, vUv); if (c.a < 0.02) discard; gl_FragColor = vec4(pjInverse(c.rgb), c.a); }`,
  }));
  splash.name = 'm08_splash';
  splash.visible = false;
  splash.renderOrder = 5;

  return {
    group,
    splash,
    splashOffset: new THREE.Vector3(...SP.offset),
    bakeDepth(renderer) {
      const prevRT = renderer.getRenderTarget();
      const scene = new THREE.Scene();
      const clone = group.clone(true);
      clone.visible = true;
      const towelBake = tMaskTex ? new THREE.ShaderMaterial({
        colorWrite: false, side: THREE.DoubleSide, vertexShader: VERT,
        uniforms: { uProjVP: { value: projVP }, uTMask: { value: tMaskTex } },
        fragmentShader: 'uniform sampler2D uTMask; varying vec4 vProj; varying vec3 vW; varying vec3 vN;\nvoid main() { if (vProj.w <= 0.0 || texture2D(uTMask, vProj.xy / vProj.w * 0.5 + 0.5).r < 0.5) discard; gl_FragColor = vec4(0.0); }',
      }) : null;
      // m08far collar: the bake must cut the same circles as the colour pass (a full disc would hide the whole chamber)
      const clipBake = (u: Record<string, THREE.IUniform>) => new THREE.ShaderMaterial({
        colorWrite: false, side: THREE.DoubleSide, vertexShader: VERT,
        uniforms: { uProjVP: { value: projVP }, uClipIn: u.uClipIn, uClipOut: u.uClipOut },
        fragmentShader: 'uniform vec4 uClipIn; uniform vec4 uClipOut; varying vec4 vProj; varying vec3 vW; varying vec3 vN;\nvoid main() { if (distance(vW.xy, uClipIn.xy) < uClipIn.z || distance(vW.xy, uClipOut.xy) > uClipOut.z) discard; gl_FragColor = vec4(0.0); }',
      });
      clone.traverse((o) => {
        if (!(o as THREE.Mesh).isMesh) return;
        const u = ((o as THREE.Mesh).material as THREE.ShaderMaterial).uniforms;
        (o as THREE.Mesh).material = towelBake && o.name === 'm08_towel' ? towelBake : u?.uClipIn?.value.w > 0.5 ? clipBake(u) : new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide });
      });
      scene.add(clone);
      renderer.setRenderTarget(depthRT);
      renderer.clear();
      renderer.render(scene, proj);
      renderer.setRenderTarget(prevRT);
      shared.uUseDepth.value = 1;
    },
    sync(renderer, w, h) {
      shared.uPjPost.value.x = renderer.toneMappingExposure;
      shared.uPjRes.value.set(w, h);
    },
  };
}
