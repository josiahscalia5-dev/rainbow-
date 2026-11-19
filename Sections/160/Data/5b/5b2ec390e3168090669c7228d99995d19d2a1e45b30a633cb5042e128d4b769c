/**
 * `?match04=1` — Screen 04 approved-picture test (2026-11-17, qa/match/04/NOTES.md), the Screen 08 method.
 * REAL 3D proxy geometry of "Through the Five Arrows", solved from the user's approved Screen 04 and the locked game
 * camera (tools/match04/solve_cam04.py → cam04_locked.json, tools/match04/fit_proxies04.py → proj04.json):
 * the gold-ring tunnel (a cylinder along the straight 32° slide), the big gold mouth ring, the room wall around it
 * (porthole, towels, control panel, foam) and the water plane at Benny's water level (swirls, chevron arrows, foam).
 * Every surface is textured by camera projection of the user's ORIGINAL approved pixels (HUD, title, Benny and coins
 * provisionally filled locally: assets/textures/match04/plate04_hybrid.png) from that locked camera, so the locked view
 * shows the approved scenery and a moving camera sees it on geometry (parallax). Surfaces the picture never showed (or
 * showed edge-on) get mirrored tiles of material patches cut from the artwork (stretch guard + projector depth test).
 * The shader undoes the game's post chain (PROJ05_INVERSE) and takes no fog.
 * Milestone 2 (qa/match/04/NOTES.md): the tunnel wall's fallback is ONE painted gold ring (tile_ring.png) repeating
 * straight along the tunnel, the water's fallback is the painted river with its chevron arrows (tile_river.png),
 * both anchored to the world; under Benny the provisional fill gives way to the painted river once the camera moves.
 * `&tile04=0` = milestone 1 (A/B).
 * Without the switch nothing in this file runs and the game is unchanged.
 */
import * as THREE from 'three';
import { PROJ05_INVERSE } from '../vfx/waterRibbon';

interface Layout04 {
  camera: { matrixWorld: number[]; fov: number; size: [number, number] };
  D: [number, number, number];
  U: [number, number, number];
  X: [number, number, number];
  water: [number, number, number];
  tube: { r: number; ax: number; h: number; mouthS: number; outerR: number };
}

export interface Match04 {
  group: THREE.Group;
  bakeDepth(renderer: THREE.WebGLRenderer): void;
  sync(renderer: THREE.WebGLRenderer, w: number, h: number, camera?: THREE.Camera): void;
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
  vL = position;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */ `
uniform sampler2D uPlate;
uniform sampler2D uDepth;
uniform float uUseDepth;
uniform vec2 uNearFar;
uniform sampler2D uPatch;
uniform float uPatchK;
uniform vec3 uProjPos;
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform float uMode;          // 0 room wall / mouth ring: artwork patch; 1 tunnel wall: painted ring tile; 2 water: painted river tile
uniform sampler2D uTile;
uniform vec4 uTileA;          // mode 1: cx, cy, mouth z, ring period | mode 2: lateral half-width, along start, along length, -
uniform float uLipS;
uniform sampler2D uFill;      // plate04_fillmask: where the plate is a provisional fill (HUD, title, Benny, coins)
uniform float uMoved;         // 0 in the approved view, 1 once the camera has moved away from it
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
varying vec3 vL;
${PROJ05_INVERSE}
// triplanar, mirrored-repeat sampling (slide-local coordinates) of the patch cut from the approved artwork
vec3 patchColor() {
  vec3 n = abs(normalize(vN)); n /= max(n.x + n.y + n.z, 1e-4);
  vec3 p = vL * uPatchK;
  return texture2D(uPatch, p.zy).rgb * n.x + texture2D(uPatch, p.xz).rgb * n.y + texture2D(uPatch, p.xy).rgb * n.z;
}
float linZ(float d) { float n = uNearFar.x, f = uNearFar.y; float z = d * 2.0 - 1.0; return 2.0 * n * f / (f + n - z * (f - n)); }
// milestone 2: world-anchored design tiles cut from the approved artwork for the views the picture never resolved
vec3 tileColor(vec3 pc) {
  if (uMode > 0.5 && uMode < 1.5) {
    vec2 rel = vL.xy - uTileA.xy;
    float psi = atan(-rel.x, rel.y);                       // 0 = tunnel top, seam at the bottom (under the water)
    float ax = uTileA.z - vL.z;                            // distance down the tunnel from the mouth
    vec2 uv = vec2(psi / 6.2831853 + 0.5, (ax - 7.1) / uTileA.w + uLipS);
    return textureGrad(uTile, uv, vec2(dFdx(uv.x), dFdx(uv.y)) * vec2(step(abs(dFdx(uv.x)), 0.5), 1.0),
                       vec2(dFdy(uv.x), dFdy(uv.y)) * vec2(step(abs(dFdy(uv.x)), 0.5), 1.0)).rgb;
  }
  if (uMode > 1.5) {
    float along = -vL.z;                                    // down the slide from Benny's water point
    vec2 uv = vec2(vL.x / (2.0 * uTileA.x) + 0.5, (along - uTileA.y) / uTileA.z);
    float inRiver = 1.0 - smoothstep(0.9 * uTileA.x, uTileA.x, abs(vL.x));
    return mix(pc, texture2D(uTile, uv).rgb, inRiver);
  }
  return pc;
}
void main() {
  vec3 pc = tileColor(patchColor());
  vec3 t = pc;
  vec3 nn = normalize(vN);
  float cp = abs(dot(nn, normalize(uProjPos - vW))), cc = abs(dot(nn, normalize(cameraPosition - vW)));
  // stretch + magnification guard: the projection is used where the current view sees the surface no more face-on and
  // no more magnified than the approved view did (incidence-cosine ratio x distance ratio = 1 in the approved view)
  float mag = (cc / max(cp, 1e-3)) * (distance(uProjPos, vW) / max(distance(cameraPosition, vW), 1e-3));
  float keep = 1.0 - smoothstep(2.5, 6.0, mag);
  if (vProj.w > 0.0) {
    vec3 ndc = vProj.xyz / vProj.w;
    vec2 uv = ndc.xy * 0.5 + 0.5;
    if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
      float vis = 1.0;
      if (uUseDepth > 0.5) {
        float zs = linZ(texture2D(uDepth, uv).r), zf = linZ(ndc.z * 0.5 + 0.5);
        vis = 1.0 - smoothstep(0.015 * zs, 0.04 * zs + 0.05, zf - zs);
      }
      // provisional fill (no painted pixels there) gives way to the painted tiles once the camera moves
      float fill = uMode > 1.5 ? texture2D(uFill, uv).r * uMoved : 0.0;   // water only (the coin fills on the bank stay)
      t = mix(pc, texture2D(uPlate, uv).rgb, vis * keep * (1.0 - fill));
    }
  }
  gl_FragColor = vec4(pjInverse(t), 1.0);
}`;

const TILE04 = new URLSearchParams(location.search).get('tile04') !== '0'; // milestone-2 tiles (A/B: &tile04=0 = milestone 1)
// `&fal04=1`: the ONE fal clean plate (request 01a1ea70, qa/match/04/fal/) inside the fill mask instead of the provisional
// fill (tools/match04/fal_plate04.py -> plate04_hybrid_fal.png); then the fill needs no hand-over to the river tile
const FAL04 = new URLSearchParams(location.search).get('fal04') !== '0'; // milestone 3: on by default under match04; &fal04=0 = milestone 2
const tex = (f: string) => new URL(`../../assets/textures/match04/${f}`, import.meta.url).href;

const _cp = new THREE.Vector3();
export async function buildMatch04(): Promise<Match04> {
  const L: Layout04 = await fetch(tex('proj04.json')).then((r) => r.json());
  const plate = await new THREE.TextureLoader().loadAsync(tex(FAL04 ? 'plate04_hybrid_fal.png' : 'plate04_hybrid.png'));
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
  const fillMask = await new THREE.TextureLoader().loadAsync(tex('plate04_fillmask.png'));
  fillMask.colorSpace = THREE.NoColorSpace;
  const shared = {
    uFill: { value: fillMask },
    uMoved: { value: 0 },
    uPlate: { value: plate },
    uDepth: { value: depthRT.depthTexture as THREE.Texture },
    uUseDepth: { value: 0 },
    uNearFar: { value: new THREE.Vector2(proj.near, proj.far) },
    uProjVP: { value: projVP },
    uPjPost: { value: new THREE.Vector4(0.86, 1.36, 1.15, 0.18) },
    uPjRes: { value: new THREE.Vector2(W, H) },
    uProjPos: { value: proj.position.clone() },
  };
  const loadPatch = async (name: string) => {
    const t = await new THREE.TextureLoader().loadAsync(tex(`patch_${name}.png`));
    t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.anisotropy = 4; return t;
  };
  const [pGold, pWater, pWall] = await Promise.all([loadPatch('gold'), loadPatch('water'), loadPatch('wall')]);
  const loadTile = async (name: string) => {
    const t = await new THREE.TextureLoader().loadAsync(tex(`tile_${name}.png`));
    t.colorSpace = THREE.NoColorSpace; t.flipY = false; t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 8; t.needsUpdate = true; return t;
  };
  const [tRing, tRiver] = await Promise.all([loadTile('ring'), loadTile('river')]);
  const tiles = await fetch(tex('tiles04.json')).then((r) => r.json());
  const mat = (patch: THREE.Texture, k: number, mode = 0, tile: THREE.Texture | null = null, tileA = new THREE.Vector4()) => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide, fog: false,
    extensions: { derivatives: true } as never,
    uniforms: { ...shared, uPatch: { value: patch }, uPatchK: { value: k }, uMode: { value: TILE04 ? mode : 0 },
      uTile: { value: tile ?? patch }, uTileA: { value: tileA }, uLipS: { value: tiles.ring?.lipS ?? 0 } },
  });

  // slide-local frame: x = world X, y = slide up U, z = -D (forward = -z); origin = Benny's water point on the path line
  const group = new THREE.Group();
  group.name = 'match04_projection';
  const X = new THREE.Vector3(...L.X), U = new THREE.Vector3(...L.U), Dn = new THREE.Vector3(...L.D).negate();
  group.matrixAutoUpdate = false;
  group.matrix.makeBasis(X, U, Dn).setPosition(new THREE.Vector3(...L.water));
  const add = (g: THREE.BufferGeometry, m: THREE.Material, name: string) => { const o = new THREE.Mesh(g, m); o.name = 'm04_' + name; group.add(o); return o; };

  const T = L.tube;
  const cx = T.ax - L.water[0], cy = T.h, z0 = -T.mouthS, len = 48;
  const rv = tiles.river;
  const M = {
    gold: mat(pGold, 1 / 1.6),
    tunnel: mat(pGold, 1 / 1.6, 1, tRing, new THREE.Vector4(cx, cy, z0, tiles.ring?.period_u ?? 6.5)),
    water: mat(pWater, 1 / 2.2, 2, tRiver, new THREE.Vector4(rv.lateral[1], rv.alongFromBenny[0], rv.alongFromBenny[1] - rv.alongFromBenny[0], 0)),
    wall: mat(pWall, 1 / 3.0),
  };
  // gold-ring tunnel: cylinder from the mouth down the slide
  const tube = new THREE.CylinderGeometry(T.r, T.r, len, 128, 24, true);
  tube.rotateX(Math.PI / 2).translate(cx, cy, z0 - len / 2);
  add(tube, M.tunnel, 'tube');
  // the big gold mouth ring (annulus, a little depth toward the camera)
  const ring = new THREE.Shape(); ring.absarc(0, 0, T.outerR, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(0, 0, T.r, 0, Math.PI * 2, true); ring.holes.push(hole);
  const ringG = new THREE.ExtrudeGeometry(ring, { depth: 0.6, bevelEnabled: false, curveSegments: 96 });
  ringG.translate(cx, cy, z0);
  add(ringG, M.gold, 'mouth_ring');
  // room wall around the mouth (porthole, towels, control panel, foam banks)
  const wall = new THREE.Shape(); wall.moveTo(-40, -12); wall.lineTo(40, -12); wall.lineTo(40, 45); wall.lineTo(-40, 45); wall.lineTo(-40, -12);
  const wh = new THREE.Path(); wh.absarc(cx, cy, T.r, 0, Math.PI * 2, true); wall.holes.push(wh);
  add(new THREE.ShapeGeometry(wall, 96).translate(0, 0, z0 - 0.01), M.wall, 'room_wall');
  // water plane at Benny's water level: from behind the camera, through the mouth, down the tunnel
  const zBack = 14, zEnd = z0 - len;
  const wp = new THREE.PlaneGeometry(28, zBack - zEnd, 56, 96);
  wp.rotateX(-Math.PI / 2).translate(0, 0, (zBack + zEnd) / 2);
  add(wp, M.water, 'water');
  // far end cap of the tunnel (the glowing vanishing point)
  add(new THREE.CircleGeometry(T.r, 64).translate(cx, cy, zEnd), M.gold, 'tube_end');

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
    sync(renderer, w, h, camera?: THREE.Camera) {
      if (camera && !FAL04) shared.uMoved.value = THREE.MathUtils.smoothstep(camera.getWorldPosition(_cp).distanceTo(proj.position), 0.3, 2.0);
      shared.uPjPost.value.x = renderer.toneMappingExposure;
      shared.uPjRes.value.set(w, h);
    },
  };
}
