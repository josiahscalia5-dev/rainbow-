/**
 * `?match07=1` — Screen 07 approved-picture test (2026-11-17, qa/match/07/NOTES.md), the Screen 08 method.
 * REAL 3D proxy geometry of "Dive the Washer Tube", solved from the user's approved Screen 07 and the locked game camera
 * (tools/match07/solve_cam07.py → cam07_locked.json, tools/match07/fit_proxies07.py → proj07.json): the purple tube (a
 * cylinder along the game's 07 tube axis, radius and ring depths fitted to the painted gold rings), the water plane at
 * Benny's water level (the painted S-river, foam banks, bubbles) and the five paddles upper-left (blocks standing out of
 * the wall at the painted spots).
 * Every surface is textured by camera projection of the user's ORIGINAL approved pixels (HUD, title, Benny and coins
 * provisionally filled locally: assets/textures/match07/plate07_hybrid.png) from that locked camera, so the locked view
 * shows the approved scenery and a moving camera sees it on geometry (parallax). Surfaces the picture never showed, or
 * showed much farther / more edge-on than the moving camera sees them (stretch guard + projector depth test), get
 * RING-STRUCTURED tiles unwrapped from the artwork: the painted wall bay repeats every ring spacing along the tube (rings
 * stay rings deep inside the tube, no smears), the painted river repeats along the water. The shader undoes the game's
 * post chain (PROJ05_INVERSE) and takes no fog. Without the switch nothing in this file runs and the game is unchanged.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { PROJ05_INVERSE, flag05 } from '../vfx/waterRibbon';
import type { Course } from './course';

interface Layout07 {
  camera: { matrixWorld: number[]; fov: number; size: [number, number] };
  D: [number, number, number];
  U: [number, number, number];
  X: [number, number, number];
  water: [number, number, number];
  tube: { r: number; ax: number; h: number };
  rings: Record<string, number>;
  paddles: { pos: [number, number, number]; along: number; angleDeg: number; w: number }[];
}
interface Tiles07 { wall: { theta: [number, number]; along: [number, number]; bay: number }; river: { lateral: [number, number]; along: [number, number] } }

export interface Match07 {
  group: THREE.Group;
  bakeDepth(renderer: THREE.WebGLRenderer): void;
  sync(renderer: THREE.WebGLRenderer, w: number, h: number): void;
  /** M3 '?m07tube=1': true from the hand-over point on — the plunge tube shows and the fitted proxy ends at its depth */
  setPlunge(on: boolean): void;
}

const VERT = /* glsl */ `
uniform mat4 uProjVP;
uniform float uCtr[64];   // r16 '?m07nearw=1': river centre line (tube-local x) every uCtrA.y units of depth from uCtrA.x
uniform vec3 uCtrA;       // first depth, step, on (z)
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
varying vec3 vL;
varying vec2 vUv;
varying float vCtr;
void main() {
  vUv = uv;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vProj = uProjVP * wp;
  vW = wp.xyz;
  vL = (uGroupInv * wp).xyz;
  vCtr = 0.0;
  if (uCtrA.z > 0.5) {
    float ia = clamp((-vL.z - uCtrA.x) / uCtrA.y, 0.0, 62.999);
    int i0 = int(floor(ia));
    vCtr = mix(uCtr[i0], uCtr[i0 + 1], ia - float(i0));
  }
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */ `
uniform sampler2D uPlate;
uniform sampler2D uDepth;
uniform float uUseDepth;
uniform vec2 uNearFar;
uniform sampler2D uTile;
uniform float uMode;      // 0 = triplanar patch, 1 = tube wall unwrap, 2 = river unwrap
uniform float uPatchK;
uniform vec4 uTube;       // ax, h, ring R2 depth, bay length
uniform vec2 uTheta;      // unwrap angle range (rad): right water line .. left water line over the top
uniform vec4 uRiver;      // lateral min, lateral max, along min, along max
uniform vec3 uProjPos;
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform sampler2D uFill;   // M2 '?m07fill=1': provisional-fill mask of the plate (1 = filled, not original pixels)
uniform float uFillTile;  // 1 = on the water, filled plate pixels give way to the river tile
uniform vec2 uAng;        // M2 '?m07ang=1': view-vs-projector angle cosines (full plate above x, tile below y); x < 0 = off
uniform float uGoldLit;   // M2 '?m07gold=1': paddle blocks shaded as solid polished gold where the picture does not cover them
uniform vec3 uKey;        // world direction toward the key light (from the viewer's side and above, so the faces the camera sees are lit)
uniform float uClip;      // M3 '?m07tube=1': proxy surfaces end at this depth along the tube axis (the plunge tube continues); 0 = off
uniform vec2 uGuard;      // stretch guard thresholds (M1/M2 2.2..4.5; M3 '?m07near=1' tighter)
uniform vec2 uFade;       // M3 plunge river: fades out between these arc depths (the game's own water continues into 08)
uniform float uNearOn;    // r16 '?m07nearw=1': the level-stretch water tile = the painted NEAR river (near_bank / near_foam)
uniform vec4 uNearW;      // river half-width incl. the magenta band, magenta band width, bank-tile period along, foam-tile size
uniform float uNearM;     // share of the bank tile's columns that is the magenta band (column 0 = its outer edge)
uniform sampler2D uNearTile;
uniform sampler2D uFoamTile;
uniform vec3 uWF;         // r16 '?m07wfoam=1': foam clouds piled on the lowest wall band — base height, cloud-top height, on (z)
uniform vec4 uBand;       // r18 '?m07band=1': S-sweep of the river centre off Benny's lane: amplitude, wavelength, phase (along), on (w)
uniform vec4 uBand2;      // r18 m07band: reach of Benny's lane (lane ± steer + body), cyan core half-width, min band width, foam-edge wobble
varying vec2 vUv;
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
varying vec3 vL;
varying float vCtr;
${PROJ05_INVERSE}
// r16 m07nearw: [foam | magenta | trim | cyan | cyan | trim | magenta | foam] across a winding centre line, world-anchored.
// Both banks are the painted lower-left band straightened (tools/match07/near_tiles_r16.py) at about the painted near
// scale; the right bank reads another stretch of the strip (no mirror image across the centre).
vec3 nearWater() {
  float along = -vL.z;
  float d = vL.x - vCtr;
  float R = uNearW.x, mw = uNearW.y;
  float Rc = R - mw;                       // cyan core half-width
  float Ro = R;                            // outer edge of the magenta band (foam beyond)
  if (uBand.w > 0.5) {
    // r18 m07band: the painted near river — a narrow glossy cyan core with THICK magenta satin bands close beside Benny, the
    // core sweeping in a world-anchored S off his lane (so the bands curve across the view as he swims, like the painted
    // S-sweeps); on the outside of each bend the band widens to cover everywhere Benny can steer (never foam under him)
    float S = uBand.x * sin(6.2831853 * (along - uBand.z) / uBand.y);
    d -= S;
    float reach = (d > 0.0 ? -S : S) + uBand2.x;
    Rc = uBand2.y;
    Ro = max(Rc + uBand2.z, reach);
  }
  float a = abs(d);
  float u;
  if (a < Rc) u = uNearM + (1.0 - uNearM) * (1.0 - a / Rc);
  else if (uBand.w > 0.5) {
    // the band tile's magenta columns spread across the whole (varying) band width (wide soft satin highlights where the band
    // is thick; no mirrored repeats, which read as a diamond lattice)
    u = uNearM * (1.0 - clamp((a - Rc) / max(Ro - Rc, 1e-3), 0.0, 1.0));
  } else u = uNearM * clamp((R - a) / mw, 0.0, 1.0);
  float v = along / uNearW.z;
  vec3 cL = texture2D(uNearTile, vec2(u, v)).rgb;
  vec3 cR = texture2D(uNearTile, vec2(u, v + 0.5)).rgb;
  vec3 river = mix(cL, cR, smoothstep(-0.32, 0.32, d));
  R = Ro;
  // r18 m07band: a scalloped (puffy) foam line along the band's outer edge instead of a straight cut
  if (uBand.w > 0.5) R += uBand2.w * (0.6 * sin(along * 2.3 + sign(d) * 1.7) + 0.4 * sin(along * 5.1 + 0.4 + sign(d)));
  // painted foam clouds on the banks: two offset readings of the foam tile blended by a slow world mask (no wallpaper grid)
  vec2 fp = vec2(vL.x, along) / uNearW.w;
  vec3 f1 = texture2D(uFoamTile, fp).rgb;
  vec3 f2 = texture2D(uFoamTile, vec2(fp.y, -fp.x) * 0.77 + vec2(0.31, 0.57)).rgb;
  float fm = smoothstep(0.25, 0.75, 0.5 + 0.35 * sin(fp.x * 1.9 + 1.4 * sin(fp.y * 1.1)) + 0.25 * sin(fp.y * 1.6 + 0.8));
  vec3 foam = mix(f1, f2, fm);
  return mix(river, foam, smoothstep(R - 0.04, R + 0.10, a));
}
// r16 m07wfoam: the painted foam clouds piled where the tube wall meets the water (no hard wall / floor edge when steering hard);
// a scalloped cloud-top line along the wall, world-anchored, the foam tile from the lower-right painted bank
vec3 wallFoam(vec3 c, float hy, float along, float side) {
  float k = along * 1.35 + side * 3.1;
  float b1 = pow(abs(sin(k + 0.8 * sin(along * 0.43 + side))), 0.55);
  float b2 = pow(abs(sin(k * 2.3 + 1.7)), 0.6);
  float hE = uWF.x + uWF.y * (0.65 * b1 + 0.35 * b2);
  float f = 1.0 - smoothstep(hE - 0.05, hE + 0.03, hy);
  vec3 foam = texture2D(uFoamTile, vec2(along, hy + side * 0.37) / 1.1).rgb;
  foam *= 0.9 + 0.14 * smoothstep(hE - 0.3, hE, hy);   // brighter cloud tops, softer shade toward the water
  return mix(c, foam, f);
}
vec3 riverTile() {
  float u = (vL.x - uRiver.x) / (uRiver.y - uRiver.x);
  u = 1.0 - abs(mod(u, 2.0) - 1.0);                       // mirrored across the banks
  float v = fract((-vL.z - uRiver.z) / (uRiver.w - uRiver.z));
  return texture2D(uTile, vec2(u, v)).rgb;
}
vec3 tileColor() {
  // M3 '?m07tube=1' plunge surfaces (real geometry along the course): uv = (arc depth along the tube, angle / lateral)
  if (uMode > 3.5) {
    float u = (vUv.x - uRiver.x) / (uRiver.y - uRiver.x);
    u = 1.0 - abs(mod(u, 2.0) - 1.0);
    float v = fract((vUv.y - uRiver.z) / (uRiver.w - uRiver.z));
    return texture2D(uTile, vec2(u, v)).rgb;
  }
  if (uMode > 2.5) {
    float u = fract((vUv.x - uTube.z) / uTube.w);
    float v = clamp((vUv.y - uTheta.x) / (uTheta.y - uTheta.x), 0.0, 1.0);
    return texture2D(uTile, vec2(u, v)).rgb;
  }
  if (uMode > 1.5) {
    if (uNearOn > 0.5) return nearWater();
    return riverTile();
  }
  if (uMode > 0.5) {
    float a = atan(vL.y - uTube.y, vL.x - uTube.x);
    if (a < -1.5707963) a += 6.2831853;
    float v = clamp((a - uTheta.x) / (uTheta.y - uTheta.x), 0.0, 1.0);
    float u = fract((-vL.z - uTube.z) / uTube.w);
    vec3 wc = texture2D(uTile, vec2(u, v)).rgb;
    if (uWF.z > 0.5) wc = wallFoam(wc, vL.y, -vL.z, sign(vL.x - uTube.x));
    return wc;
  }
  vec3 n = abs(normalize(vN)); n /= max(n.x + n.y + n.z, 1e-4);
  vec3 p = vL * uPatchK;
  vec3 g = texture2D(uTile, p.zy).rgb * n.x + texture2D(uTile, p.xz).rgb * n.y + texture2D(uTile, p.xy).rgb * n.z;
  if (uGoldLit > 0.5) {
    vec3 nw = normalize(vN); vec3 vv = normalize(cameraPosition - vW);
    if (dot(nw, vv) < 0.0) nw = -nw;
    // saturated polished gold (the painted paddles' orange-gold), the patch only adds texture variation
    float lum = dot(g, vec3(0.299, 0.587, 0.114));
    float dif = 0.25 + 0.85 * max(dot(nw, uKey), 0.0);
    float spec = pow(max(dot(reflect(-uKey, nw), vv), 0.0), 24.0);
    float rim = pow(1.0 - max(dot(nw, vv), 0.0), 2.0);
    g = vec3(1.0, 0.58, 0.18) * (0.55 + 0.6 * lum) * dif + vec3(1.0, 0.9, 0.62) * (0.8 * spec + 0.45 * rim);
  }
  return g;
}
float linZ(float d) { float n = uNearFar.x, f = uNearFar.y; float z = d * 2.0 - 1.0; return 2.0 * n * f / (f + n - z * (f - n)); }
void main() {
  if (uClip > 0.0 && uMode < 2.5 && -vL.z > uClip) discard;
  vec3 pc = tileColor();
  if (uMode > 2.5) {
    // plunge surfaces: never in the approved picture → the ring-bay / river tiles only, world-anchored
    float a = uMode > 3.5 ? 1.0 - smoothstep(uFade.x, uFade.y, vUv.y) : 1.0;
    if (a < 0.003) discard;
    gl_FragColor = vec4(pjInverse(pc), a);
    return;
  }
  vec3 t = pc;
  vec3 nn = normalize(vN);
  float cp = abs(dot(nn, normalize(uProjPos - vW))), cc = abs(dot(nn, normalize(cameraPosition - vW)));
  // stretch + magnification guard: the projection is used where the current view sees the surface no more face-on and
  // no more magnified than the approved view did (incidence-cosine ratio x distance ratio = 1 in the approved view)
  float mag = (cc / max(cp, 1e-3)) * (distance(uProjPos, vW) / max(distance(cameraPosition, vW), 1e-3));
  float keep = 1.0 - smoothstep(uGuard.x, uGuard.y, mag);
  if (vProj.w > 0.0) {
    vec3 ndc = vProj.xyz / vProj.w;
    vec2 uv = ndc.xy * 0.5 + 0.5;
    if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
      float vis = 1.0;
      if (uUseDepth > 0.5) {
        float zs = linZ(texture2D(uDepth, uv).r), zf = linZ(ndc.z * 0.5 + 0.5);
        vis = 1.0 - smoothstep(0.015 * zs, 0.04 * zs + 0.05, zf - zs);
      }
      float w = vis * keep;
      // M2 '?m07fill=1': on the water, the provisional fill (Benny / coins in the picture) gives way to the river tile
      if (uFillTile > 0.5 && uMode > 1.5) w *= 1.0 - texture2D(uFill, uv).r;
      // M2 '?m07ang=1': painted relief (ring flanges, paddles) flattened on the proxy doubles when seen from another
      // direction: use the picture only where the view direction is close to the approved view's (identical there)
      if (uAng.x > 0.0) w *= smoothstep(uAng.y, uAng.x, dot(normalize(cameraPosition - vW), normalize(uProjPos - vW)));
      // m07gold (round 4): the paddle blocks show the picture only near the approved view direction; seen from beside or
      // below while passing they are solid polished gold (no picture of the wall smeared over their faces)
      if (uGoldLit > 0.5 && uMode < 0.5) w *= smoothstep(0.970, 0.995, dot(normalize(cameraPosition - vW), normalize(uProjPos - vW)));
      // r16 m07nearw: where the approved view itself looks (no magnification) the provisional fill keeps the old river tile, so
      // the approved start view stays exactly as it was; the painted near river takes over as the view magnifies the water
      vec3 pcf = pc;
      if (uNearOn > 0.5 && uMode > 1.5) pcf = mix(pc, riverTile(), keep * vis);
      t = mix(pcf, texture2D(uPlate, uv).rgb, w);
    }
  }
  gl_FragColor = vec4(pjInverse(t), 1.0);
}`;

const tex = (f: string) => new URL(`../../assets/textures/match07/${f}`, import.meta.url).href;
/** r18: numeric URL tunable (QA only), default when absent or not a number */
const num07 = (k: string, def: number) => {
  const v = typeof location !== 'undefined' ? parseFloat(new URLSearchParams(location.search).get(k) ?? '') : NaN;
  return Number.isFinite(v) ? v : def;
};

/** M3 '?m07tube=1': the plunge continuation needs the course (arc samples) and where it starts / ends */
export interface Plunge07 { course: Course; sA: number; sB: number; fade: [number, number] }

export async function buildMatch07(plunge?: Plunge07): Promise<Match07> {
  const [L, TL]: [Layout07, Tiles07] = await Promise.all([fetch(tex('proj07.json')).then((r) => r.json()), fetch(tex('tiles07.json')).then((r) => r.json())]);
  const load = async (f: string, wrap: THREE.Wrapping) => {
    const t = await new THREE.TextureLoader().loadAsync(tex(f));
    t.colorSpace = THREE.NoColorSpace; // raw display values: the shader inverts the post chain itself
    t.wrapS = t.wrapT = wrap; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 8;
    return t;
  };
  // MILESTONE 2 test switches (one factor each, qa/match/07/m2/NOTES.md); off = the MILESTONE 1 result unchanged
  const fixFill = flag05('m07fill');
  const fixAng = flag05('m07ang');
  const fixGold = flag05('m07gold');
  const fixWall = flag05('m07wall'); // the ring-bay wall tile without the painted paddle (it repeated in every bay deep in the tube)
  const fixRiver = flag05('m07river'); // the river tile without the slice of painted gold ring (orange smears on the near water)
  // M3: the clean wall tile with its painted gold rings straightened (tools/match07/straighten_wall07.py) — in the unwrap
  // the ring band drifted ~43 % of a bay across the rows, so deep in the tube the rings rendered as twisted diagonal bands
  const fixRing = flag05('m07ring');
  const fixNear = flag05('m07near'); // M3: tighter stretch guard — magnified projected near water gives way to the river tile sooner
  // r16: the level-stretch water tile = the painted NEAR river (magenta satin bands, bubbly trim, glossy cyan) winding along the
  // lane at about the painted near scale, painted foam clouds on the banks (tools/match07/near_tiles_r16.py)
  const nearW = flag05('m07nearw');
  const wallFoamOn = flag05('m07wfoam'); // r16: painted foam clouds on the lowest wall band (no hard wall / floor edge when steering hard)
  // r18: on top of m07nearw, the painted near-river proportions — narrow cyan core, thick magenta bands, world-anchored S-sweep
  // (the r17 draft '&m07nearf' was rejected: qa/match/07/r18/PROGRESS.md)
  const band = nearW && flag05('m07band');
  const [tNear, tFoam] = await Promise.all([nearW ? load('near_bank.png', THREE.RepeatWrapping) : null, nearW || wallFoamOn ? load('near_foam.png', THREE.RepeatWrapping) : null]);
  if (tNear) tNear.wrapS = THREE.ClampToEdgeWrapping;
  const [plate, tWall, tRiver, pGold, fillMask] = await Promise.all([
    load('plate07_hybrid.png', THREE.ClampToEdgeWrapping), load(fixRing ? 'tile_wall_ring.png' : fixWall ? 'tile_wall_clean.png' : 'tile_wall.png', THREE.RepeatWrapping),
    load(fixRiver ? 'tile_river_clean.png' : 'tile_river.png', THREE.RepeatWrapping), load('patch_gold.png', THREE.MirroredRepeatWrapping),
    // m07fill (round 4): feathered inside the filled area so the river tile fades in without a hard-edged patch
    load(fixFill ? 'plate07_fillmask_soft.png' : 'plate07_fillmask.png', THREE.ClampToEdgeWrapping),
  ]);

  // the projector = the locked game camera the picture was matched to
  const [W, H] = L.camera.size;
  const proj = new THREE.PerspectiveCamera(L.camera.fov, W / H, 0.2, 200);
  proj.matrixWorld.fromArray(L.camera.matrixWorld);
  proj.matrixWorld.decompose(proj.position, proj.quaternion, proj.scale);
  proj.matrixWorldInverse.copy(proj.matrixWorld).invert();
  proj.updateProjectionMatrix();
  const projVP = new THREE.Matrix4().multiplyMatrices(proj.projectionMatrix, proj.matrixWorldInverse);

  // tube-local frame: x = level right X, y = up U, z = -D (forward = -z); origin = Benny's water point at the checkpoint
  const group = new THREE.Group();
  group.name = 'match07_projection';
  const X = new THREE.Vector3(...L.X), U = new THREE.Vector3(...L.U), Dv = new THREE.Vector3(...L.D);
  const base = new THREE.Vector3(...L.water);
  group.matrixAutoUpdate = false;
  group.matrix.makeBasis(X, U, Dv.clone().negate()).setPosition(base);
  group.matrixWorld.copy(group.matrix);
  const groupInv = group.matrix.clone().invert();

  const depthRT = new THREE.WebGLRenderTarget(1024, Math.round((1024 * H) / W), { depthBuffer: true });
  depthRT.depthTexture = new THREE.DepthTexture(depthRT.width, depthRT.height, THREE.UnsignedIntType);
  const T = L.tube;
  const shared = {
    uPlate: { value: plate },
    uDepth: { value: depthRT.depthTexture as THREE.Texture },
    uUseDepth: { value: 0 },
    uNearFar: { value: new THREE.Vector2(proj.near, proj.far) },
    uProjVP: { value: projVP },
    uGroupInv: { value: groupInv },
    uPjPost: { value: new THREE.Vector4(0.86, 1.36, 1.15, 0.18) },
    uPjRes: { value: new THREE.Vector2(W, H) },
    uFill: { value: fillMask },
    uGoldLit: { value: fixGold ? 1 : 0 },
    uKey: { value: new THREE.Vector3(...L.D).multiplyScalar(-1).addScaledVector(new THREE.Vector3(...L.U), 0.8).normalize() },
    uFillTile: { value: fixFill ? 1 : 0 },
    uClip: { value: 0 },
    uGuard: { value: fixNear ? new THREE.Vector2(1.35, 2.3) : new THREE.Vector2(2.2, 4.5) },
    uFade: { value: new THREE.Vector2(1e6, 1e6 + 1) },
    uAng: { value: fixAng ? new THREE.Vector2(Math.cos(THREE.MathUtils.degToRad(6)), Math.cos(THREE.MathUtils.degToRad(14))) : new THREE.Vector2(-1, -1) },
    uProjPos: { value: proj.position.clone() },
    uTube: { value: new THREE.Vector4(T.ax, T.h, TL.wall.along[0], TL.wall.bay) },
    // unwrap rows: image row 0 = theta1 (left water line) = v 1 (three flips images), last row = theta0 (right water line)
    uTheta: { value: new THREE.Vector2(TL.wall.theta[0], TL.wall.theta[1]) },
    uRiver: { value: new THREE.Vector4(TL.river.lateral[0], TL.river.lateral[1], TL.river.along[0], TL.river.along[1]) },
    uCtr: { value: new Array<number>(64).fill(0) },
    uCtrA: { value: new THREE.Vector3(-8, 1.5, 0) },
    uNearOn: { value: nearW ? 1 : 0 },
    // river half-width incl. the magenta band 2.6 u (Benny steers up to 2.25 u off the lane: he stays on the water, at most on
    // the magenta band), magenta band 0.75 u (≈ the painted band's width at the bottom of the picture), bank strip period 2.4 u
    // along, foam tile 1.1 u
    uNearW: { value: new THREE.Vector4(2.6, 0.75, 2.4, 1.1) },
    uNearM: { value: 92 / 268 },
    uNearTile: { value: tNear },
    uFoamTile: { value: tFoam },
    uWF: { value: new THREE.Vector3(0.3, 0.5, wallFoamOn ? 1 : 0) },
    // r18 m07band: S-sweep ±0.6 u every 14 u; Benny's reach lane ± 2.25 steer + 0.6 body; cyan core ±1.1 u; band ≥ 0.95 u;
    // foam-edge wobble 0.12 u. Tunables ?m07bA= / ?m07bL= / ?m07bC=
    uBand: { value: new THREE.Vector4(num07('m07bA', 0.6), num07('m07bL', 14), 0, band ? 1 : 0) },
    uBand2: { value: new THREE.Vector4(2.85, num07('m07bC', 1.1), 0.95, 0.12) },
  };
  if (nearW) {
    // river centre line in the tube-local frame: the lane Benny swims (course centre, sampled at the depth) plus the painted
    // river's winding (tools/match07/river_coins07.py → river07.json, clamped so Benny stays in the cyan), continued by a gentle
    // S beyond the painted stretch; none behind the checkpoint
    const Rv: { along: number[]; lat: number[] } = await fetch(tex('river07.json')).then((r) => r.json());
    const Xa = new THREE.Vector3(...L.X), Da = new THREE.Vector3(...L.D), b0 = new THREE.Vector3(...L.water);
    let sCk = 0;
    if (plunge) {
      let best = 1e9;
      for (let s = plunge.course.stage('07').s0; s < plunge.sA; s += 0.1) { const dd = plunge.course.sample(s).pos.distanceTo(b0); if (dd < best) { best = dd; sCk = s; } }
    }
    const lerpT = (xs: number[], ys: number[], x: number) => {
      if (x <= xs[0]) return ys[0];
      for (let i = 1; i < xs.length; i++) if (x <= xs[i]) return ys[i - 1] + ((ys[i] - ys[i - 1]) * (x - xs[i - 1])) / (xs[i] - xs[i - 1]);
      return ys[ys.length - 1];
    };
    const aEnd = Rv.along[Rv.along.length - 1];
    const q = new THREE.Vector3();
    const ctr = shared.uCtr.value;
    for (let k = 0; k < 64; k++) {
      const along = -8 + 1.5 * k;
      let lane = 0;
      if (plunge) {
        let s = sCk + along;
        for (let it = 0; it < 3; it++) s += along - q.copy(plunge.course.sample(s).pos).sub(b0).dot(Da);
        lane = q.copy(plunge.course.sample(s).pos).sub(b0).dot(Xa);
      }
      const painted = along < 0 ? 0 : THREE.MathUtils.clamp(lerpT(Rv.along, Rv.lat, along) - lane, -0.3, 0.3);
      const tail = 0.6 * Math.sin(((along - aEnd) / 18) * Math.PI * 2);
      const kk = THREE.MathUtils.smoothstep(along, aEnd - 4, aEnd + 6);
      // r18 m07band: the lane only (the S-sweep is added in the shader, uBand)
      ctr[k] = band ? lane : lane + painted * (1 - kk) + tail * kk;
    }
    // smooth (no kinks between samples: the bands must curve, not zigzag)
    for (let pass = 0; pass < 4; pass++) {
      const c0 = ctr.slice();
      for (let k = 1; k < 63; k++) ctr[k] = 0.25 * c0[k - 1] + 0.5 * c0[k] + 0.25 * c0[k + 1];
    }
    shared.uCtrA.value.z = 1;
    console.info('[m07nearw] checkpoint s', sCk.toFixed(2), 'centre line', ctr.map((v) => v.toFixed(2)).join(' '));
  }
  const mat = (tile: THREE.Texture, mode: number, k = 1) => new THREE.ShaderMaterial({
    vertexShader: 'uniform mat4 uGroupInv;\n' + VERT, fragmentShader: FRAG, side: THREE.DoubleSide, fog: false,
    uniforms: { ...shared, uTile: { value: tile }, uMode: { value: mode }, uPatchK: { value: k } },
  });
  const M = { wall: mat(tWall, 1), water: mat(tRiver, 2), gold: mat(pGold, 0, 1 / 1.2) };
  const add = (g: THREE.BufferGeometry, m: THREE.Material, name: string) => {
    const o = new THREE.Mesh(g, m); o.name = 'm07_' + name; o.frustumCulled = false; group.add(o); return o;
  };

  const zBack = 20, zEnd = -110;
  // purple tube: cylinder along the axis, from behind the camera to far beyond the painted bright end
  const tube = new THREE.CylinderGeometry(T.r, T.r, zBack - zEnd, 160, 130, true);
  tube.rotateX(Math.PI / 2).translate(T.ax, T.h, (zBack + zEnd) / 2);
  add(tube, M.wall, 'tube');
  add(new THREE.CircleGeometry(T.r, 64).translate(T.ax, T.h, zEnd), M.wall, 'tube_end');
  // water plane at Benny's water level (the painted S-river, pink banks, foam), cut by the tube walls
  const halfW = T.r + 0.5;
  const wp = new THREE.PlaneGeometry(2 * halfW, zBack - zEnd, 48, 260);
  wp.rotateX(-Math.PI / 2).translate(T.ax, 0, (zBack + zEnd) / 2);
  add(wp, M.water, 'water');
  // paddles: blocks standing out of the wall at the painted spots (width from the painting, 1.2 u deep into the tube)
  for (const [i, p] of L.paddles.entries()) {
    const q = new THREE.Vector3(...p.pos).sub(base);
    const lx = q.dot(X), ly = q.dot(U), lz = -q.dot(Dv);
    const ang = Math.atan2(ly - T.h, lx - T.ax);
    const depth = 1.2, w = p.w;
    // M2 '?m07gold=1': rounded block (bevelled edges catch the light and read as solid metal while passing close)
    const g = fixGold ? new RoundedBoxGeometry(w, depth, w * 0.42, 4, Math.min(0.3, w * 0.12)) : new THREE.BoxGeometry(w, depth, w * 0.42);
    const o = add(g, M.gold, 'paddle' + i);
    o.position.set(T.ax + (T.r - depth / 2 + 0.05) * Math.cos(ang), T.h + (T.r - depth / 2 + 0.05) * Math.sin(ang), lz);
    o.rotation.z = ang - Math.PI / 2; // local +y along the radius (out of the wall toward the axis)
  }
  // M3 '?m07tube=1': the matched tube continues as REAL geometry along the course from sA (just before the plunge top)
  // down the whole plunge to the 08 inlet — same radius and axis height as the fitted tube, the same ring-bay wall tile
  // (rings every bay, phase continuous with the fitted tube) and the same river tile, anchored to arc length. The fitted
  // proxy ends at sA's depth along its straight axis (uClip), so it no longer runs on straight through the plunge.
  let plungeAlong = 0;
  const plungeMeshes: THREE.Object3D[] = [];
  if (plunge) {
    const { course, sA, sB } = plunge;
    const f0 = course.sample(sA);
    const alongA = f0.pos.clone().sub(base).dot(Dv);
    plungeAlong = alongA;
    shared.uFade.value.set(plunge.fade[0] - sA + alongA, plunge.fade[1] - sA + alongA);
    const axisA = base.clone().addScaledVector(X, T.ax).addScaledVector(U, T.h).addScaledVector(Dv, alongA);
    const d0 = axisA.clone().sub(f0.pos.clone().addScaledVector(f0.up, T.h));
    const ds = 0.4, nS = Math.ceil((sB - sA) / ds) + 1, nT = 160;
    const tubeP: number[] = [], tubeUV: number[] = [], rivP: number[] = [], rivUV: number[] = [], idxT: number[] = [], idxR: number[] = [];
    const halfW = Math.sqrt(Math.max(T.r * T.r - T.h * T.h, 1)) + 0.15;
    const nR = 24;
    const c = new THREE.Vector3(), p = new THREE.Vector3();
    for (let i = 0; i < nS; i++) {
      const s = Math.min(sB, sA + i * ds);
      const f = course.sample(s);
      const k = 1 - THREE.MathUtils.smootherstep(s, sA, sA + 14);
      const along = alongA + (s - sA);
      c.copy(f.pos).addScaledVector(f.up, T.h).addScaledVector(d0, k);
      for (let j = 0; j <= nT; j++) {
        const th = -Math.PI / 2 + (2 * Math.PI * j) / nT; // same angle convention as the fitted tube (x = right, y = up)
        p.copy(c).addScaledVector(f.right, T.r * Math.cos(th)).addScaledVector(f.up, T.r * Math.sin(th));
        tubeP.push(p.x, p.y, p.z); tubeUV.push(along, th);
      }
      const lat0 = d0.dot(f.right) * k;
      for (let j = 0; j <= nR; j++) {
        const l = -halfW + (2 * halfW * j) / nR;
        p.copy(f.pos).addScaledVector(f.right, lat0 + T.ax + l).addScaledVector(f.up, 0.06);
        rivP.push(p.x, p.y, p.z); rivUV.push(T.ax + l, along); // centred on the tube axis like the fitted water
      }
      if (i > 0) {
        for (let j = 0; j < nT; j++) { const a = (i - 1) * (nT + 1) + j, b = a + nT + 1; idxT.push(a, b, a + 1, b, b + 1, a + 1); }
        for (let j = 0; j < nR; j++) { const a = (i - 1) * (nR + 1) + j, b = a + nR + 1; idxR.push(a, b, a + 1, b, b + 1, a + 1); }
      }
    }
    const geo = (P: number[], UV: number[], I: number[]) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2));
      g.setIndex(I); g.computeVertexNormals();
      return g;
    };
    // world-space vertices: the meshes are added to the scene-level group with the inverse group matrix
    const toLocal = (g: THREE.BufferGeometry) => g.applyMatrix4(groupInv);
    const wallM = mat(tWall, 3), rivM = mat(tRiver, 4);
    rivM.transparent = true;
    const t = add(toLocal(geo(tubeP, tubeUV, idxT)), wallM, 'pl_tube');
    const r = add(toLocal(geo(rivP, rivUV, idxR)), rivM, 'pl_river');
    r.renderOrder = 1;
    t.visible = r.visible = false;
    plungeMeshes.push(t, r);
  }
  group.traverse((o) => o.updateMatrixWorld?.(true));

  return {
    group,
    bakeDepth(renderer) {
      const prevRT = renderer.getRenderTarget();
      const scene = new THREE.Scene();
      const clone = group.clone(true);
      clone.visible = true;
      // the plunge continuation is not in the approved picture: it never occludes the projector
      const drop: THREE.Object3D[] = []; clone.traverse((o) => { if (o.name.startsWith('m07_pl_')) drop.push(o); });
      for (const o of drop) o.removeFromParent();
      clone.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide }); });
      scene.add(clone);
      clone.updateMatrixWorld(true);
      renderer.setRenderTarget(depthRT);
      renderer.clear();
      renderer.render(scene, proj);
      renderer.setRenderTarget(prevRT);
      shared.uUseDepth.value = 1;
    },
    setPlunge(on) {
      if (!plungeMeshes.length) return;
      for (const o of plungeMeshes) o.visible = on;
      shared.uClip.value = on ? plungeAlong : 0;
    },
    sync(renderer, w, h) {
      shared.uPjPost.value.x = renderer.toneMappingExposure;
      shared.uPjRes.value.set(w, h);
    },
  };
}
