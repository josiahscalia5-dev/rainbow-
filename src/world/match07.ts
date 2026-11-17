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
}

const VERT = /* glsl */ `
uniform mat4 uProjVP;
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
varying vec3 vL;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vProj = uProjVP * wp;
  vW = wp.xyz;
  vL = (uGroupInv * wp).xyz;
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
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
varying vec3 vL;
${PROJ05_INVERSE}
vec3 tileColor() {
  if (uMode > 1.5) {
    float u = (vL.x - uRiver.x) / (uRiver.y - uRiver.x);
    u = 1.0 - abs(mod(u, 2.0) - 1.0);                       // mirrored across the banks
    float v = fract((-vL.z - uRiver.z) / (uRiver.w - uRiver.z));
    return texture2D(uTile, vec2(u, v)).rgb;
  }
  if (uMode > 0.5) {
    float a = atan(vL.y - uTube.y, vL.x - uTube.x);
    if (a < -1.5707963) a += 6.2831853;
    float v = clamp((a - uTheta.x) / (uTheta.y - uTheta.x), 0.0, 1.0);
    float u = fract((-vL.z - uTube.z) / uTube.w);
    return texture2D(uTile, vec2(u, v)).rgb;
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
  vec3 pc = tileColor();
  vec3 t = pc;
  vec3 nn = normalize(vN);
  float cp = abs(dot(nn, normalize(uProjPos - vW))), cc = abs(dot(nn, normalize(cameraPosition - vW)));
  // stretch + magnification guard: the projection is used where the current view sees the surface no more face-on and
  // no more magnified than the approved view did (incidence-cosine ratio x distance ratio = 1 in the approved view)
  float mag = (cc / max(cp, 1e-3)) * (distance(uProjPos, vW) / max(distance(cameraPosition, vW), 1e-3));
  float keep = 1.0 - smoothstep(2.2, 4.5, mag);
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
      t = mix(pc, texture2D(uPlate, uv).rgb, w);
    }
  }
  gl_FragColor = vec4(pjInverse(t), 1.0);
}`;

const tex = (f: string) => new URL(`../../assets/textures/match07/${f}`, import.meta.url).href;

export async function buildMatch07(): Promise<Match07> {
  const [L, TL]: [Layout07, Tiles07] = await Promise.all([fetch(tex('proj07.json')).then((r) => r.json()), fetch(tex('tiles07.json')).then((r) => r.json())]);
  const load = async (f: string, wrap: THREE.Wrapping) => {
    const t = await new THREE.TextureLoader().loadAsync(tex(f));
    t.colorSpace = THREE.NoColorSpace; // raw display values: the shader inverts the post chain itself
    t.wrapS = t.wrapT = wrap; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 8;
    return t;
  };
  const [plate, tWall, tRiver, pGold, fillMask] = await Promise.all([
    load('plate07_hybrid.png', THREE.ClampToEdgeWrapping), load('tile_wall.png', THREE.RepeatWrapping),
    load('tile_river.png', THREE.RepeatWrapping), load('patch_gold.png', THREE.MirroredRepeatWrapping),
    load('plate07_fillmask.png', THREE.ClampToEdgeWrapping),
  ]);
  // MILESTONE 2 test switches (one factor each, qa/match/07/m2/NOTES.md); off = the MILESTONE 1 result unchanged
  const fixFill = flag05('m07fill');
  const fixAng = flag05('m07ang');
  const fixGold = flag05('m07gold');

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
    uAng: { value: fixAng ? new THREE.Vector2(Math.cos(THREE.MathUtils.degToRad(6)), Math.cos(THREE.MathUtils.degToRad(14))) : new THREE.Vector2(-1, -1) },
    uProjPos: { value: proj.position.clone() },
    uTube: { value: new THREE.Vector4(T.ax, T.h, TL.wall.along[0], TL.wall.bay) },
    // unwrap rows: image row 0 = theta1 (left water line) = v 1 (three flips images), last row = theta0 (right water line)
    uTheta: { value: new THREE.Vector2(TL.wall.theta[0], TL.wall.theta[1]) },
    uRiver: { value: new THREE.Vector4(TL.river.lateral[0], TL.river.lateral[1], TL.river.along[0], TL.river.along[1]) },
  };
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
  group.traverse((o) => o.updateMatrixWorld?.(true));

  return {
    group,
    bakeDepth(renderer) {
      const prevRT = renderer.getRenderTarget();
      const scene = new THREE.Scene();
      const clone = group.clone(true);
      clone.visible = true;
      clone.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide }); });
      scene.add(clone);
      clone.updateMatrixWorld(true);
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
