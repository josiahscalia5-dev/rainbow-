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
import { addM04, M04 } from './match04m4';

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
  /** milestone 3: the approved splash around Benny (camera-facing card; Game places it at Benny + splashOffset); null = `&splash04=0` */
  splash: THREE.Mesh | null;
  splashOffset: THREE.Vector3;
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
uniform vec2 uKeep;           // stretch-guard hand-over (milestone 2: 2.5..6; milestone 3 tunnel wall: earlier, sharper rings)
uniform float uR3;            // milestone 3 river (&river04=0 = milestone 2): swirl tile from the painted water around Benny
uniform sampler2D uRiv3;      //   tile_river3.png (pink ribbons, cyan streams, foam banks)
uniform vec4 uRiv3A;          //   lateral half-width, along start, along length, mouth distance down the slide
uniform vec4 uCut;            // round 9 m04room: x = +1 keep below / -1 keep above the basin-rim curve (0 = off); y, z, w:
                              //   curve in approved-image fractions  yTop = y + w * (x - z)^2
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
  if (uMode > 1.5 && uR3 > 0.5) {
    float along = -vL.z;
    // inside the tunnel the visible water is narrower: draw the painted banks a little closer to the walls
    float k = mix(1.0, 1.3, smoothstep(uRiv3A.w - 1.0, uRiv3A.w + 3.0, along));
    vec2 uv3 = vec2(vL.x * k / (2.0 * uRiv3A.x) + 0.5, (along - uRiv3A.y) / uRiv3A.z);
    vec3 sw = texture2D(uRiv3, uv3).rgb;
    vec4 ch = texture2D(uTile, vec2(vL.x / (2.0 * uTileA.x) + 0.5, (along - uTileA.y) / uTileA.z));  // tile_chev3: arrow + alpha
    vec3 col = mix(sw, ch.rgb, ch.a);
    float inRiver = 1.0 - smoothstep(0.9 * uRiv3A.x, uRiv3A.x, abs(vL.x * k));
    return mix(pc, col, inRiver);
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
  if (uCut.x != 0.0 && vProj.w > 0.0) {
    vec2 cu = vProj.xy / vProj.w * 0.5 + 0.5;
    float above = (1.0 - cu.y) - (uCut.y + uCut.w * (cu.x - uCut.z) * (cu.x - uCut.z));   // < 0: above the rim (room)
    if (above * uCut.x < 0.0) discard;
  }
  vec3 pc = tileColor(patchColor());
  vec3 t = pc;
  vec3 nn = normalize(vN);
  float cp = abs(dot(nn, normalize(uProjPos - vW))), cc = abs(dot(nn, normalize(cameraPosition - vW)));
  // stretch + magnification guard: the projection is used where the current view sees the surface no more face-on and
  // no more magnified than the approved view did (incidence-cosine ratio x distance ratio = 1 in the approved view)
  float mag = (cc / max(cp, 1e-3)) * (distance(uProjPos, vW) / max(distance(cameraPosition, vW), 1e-3));
  float keep = 1.0 - smoothstep(uKeep.x, uKeep.y, mag);
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
// milestone 3 (qa/match/04/NOTES.md): river design from the painted water around Benny + the chevron arrows on top;
// `&river04=0` = milestone-2 river tile
const RIVER04 = TILE04 && new URLSearchParams(location.search).get('river04') !== '0';
// milestone 3: the tunnel wall hands over from the (soft, glowy when magnified) painted far rings to the sharp painted
// ring tile earlier; `&rings04=0` = milestone 2. `&keep04=a,b` overrides the hand-over for tests.
const RINGS04 = TILE04 && new URLSearchParams(location.search).get('rings04') !== '0';
const KEEP04 = (new URLSearchParams(location.search).get('keep04') ?? '1.5,2.6').split(',').map(Number);
// milestone 3: Benny's splash cut from the approved picture (tools/match04/splash04.py); `&splash04=0` = none (milestone 2)
const SPLASH04 = new URLSearchParams(location.search).get('splash04') !== '0';
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
  const [tRing, tRiver] = await Promise.all([loadTile('ring'), loadTile(RIVER04 ? 'chev3' : 'river')]);
  const tRiv3 = RIVER04 ? await loadTile('river3') : tRiver;
  const tiles = await fetch(tex('tiles04.json')).then((r) => r.json());
  const r3 = tiles.river3 ?? { lateral: [-4, 4], alongFromBenny: [0, 1] };
  const riv3A = new THREE.Vector4(r3.lateral[1], r3.alongFromBenny[0], r3.alongFromBenny[1] - r3.alongFromBenny[0], 0);
  const mat = (patch: THREE.Texture, k: number, mode = 0, tile: THREE.Texture | null = null, tileA = new THREE.Vector4()) => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide, fog: false,
    extensions: { derivatives: true } as never,
    uniforms: { ...shared, uPatch: { value: patch }, uPatchK: { value: k }, uMode: { value: TILE04 ? mode : 0 },
      uTile: { value: tile ?? patch }, uTileA: { value: tileA }, uLipS: { value: tiles.ring?.lipS ?? 0 },
      uKeep: { value: mode === 1 && RINGS04 ? new THREE.Vector2(KEEP04[0], KEEP04[1]) : new THREE.Vector2(2.5, 6.0) },
      uR3: { value: RIVER04 ? 1 : 0 }, uRiv3: { value: tRiv3 }, uRiv3A: { value: riv3A }, uCut: { value: new THREE.Vector4() } },
  });

  // slide-local frame: x = world X, y = slide up U, z = -D (forward = -z); origin = Benny's water point on the path line
  const group = new THREE.Group();
  group.name = 'match04_projection';
  const X = new THREE.Vector3(...L.X), U = new THREE.Vector3(...L.U), Dn = new THREE.Vector3(...L.D).negate();
  group.matrixAutoUpdate = false;
  group.matrix.makeBasis(X, U, Dn).setPosition(new THREE.Vector3(...L.water));
  // round 9 `&m04lay=1` — FEASIBILITY TEST ONLY (not kept, qa/match/04/r9/PROGRESS.md "Foundation"): the whole washer
  // front as STATIC geometry scaled about the approved camera by 'm04layk' (same approved picture, opening k times as
  // far). Shows why a static bigger/farther front cannot hold the composition on the fixed course: the painted pool
  // ends up 3.39*(k-1) u below Benny's water and Benny's path / coins run through the middle of the opening.
  if (M04.lay) {
    const k = M04.num('m04layk', 3.0), P = proj.position;
    group.matrix.premultiply(new THREE.Matrix4().makeTranslation(-P.x, -P.y, -P.z)).premultiply(new THREE.Matrix4().makeScale(k, k, k)).premultiply(new THREE.Matrix4().makeTranslation(P.x, P.y, P.z));
  }
  const add = (g: THREE.BufferGeometry, m: THREE.Material, name: string) => { const o = new THREE.Mesh(g, m); o.name = 'm04_' + name; group.add(o); return o; };

  const T = L.tube;
  // round 8 `&m04ring=1`: the tunnel (and the water in it) runs on to 90 u so its far end is the painted small glow, not a disc
  const cx = T.ax - L.water[0], cy = T.h, z0 = -T.mouthS, len = M04.ring ? M04.num('m04len', 90) : 48;
  const rv = tiles.river;
  riv3A.w = T.mouthS;
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
  const roomWall = add(new THREE.ShapeGeometry(wall, 96).translate(0, 0, z0 - 0.01), M.wall, 'room_wall');
  // round 9 `&m04room=1`: the laundry room above the basin rim (porthole, towels on the shelf, control panel) moves onto a
  // parallel plane M04 'm04roomk' times as far from the projector (scaled about it, so the approved view is the same
  // picture), i.e. the room lies BEHIND the washer opening: it stays in view (and less magnified) while Benny approaches;
  // the near wall keeps the basin around the opening (cut along the painted gold basin rim)
  if (M04.room) {
    const cut = [M04.num('m04cuty', 338 / 1536), M04.num('m04cutx', 470 / 864), M04.num('m04cutc', 0.000244 * 864 * 864 / 1536)];
    (roomWall.material as THREE.ShaderMaterial).uniforms.uCut.value.set(1, cut[0], cut[1], cut[2]);
    const k = M04.num('m04roomk', 1.8);
    const cL = proj.position.clone().applyMatrix4(group.matrix.clone().invert());   // group.matrix = the slide frame (set above)
    const far = new THREE.ShapeGeometry(wall, 96).translate(0, 0, z0 - 0.01);
    const pa = far.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < pa.count; i++) {
      const v = new THREE.Vector3(pa.getX(i), pa.getY(i), pa.getZ(i)).sub(cL).multiplyScalar(k).add(cL);
      pa.setXYZ(i, v.x, v.y, v.z);
    }
    far.computeBoundingSphere();
    const fm = mat(pWall, 1 / (3.0 * k));
    fm.uniforms.uCut.value.set(-1, cut[0], cut[1], cut[2]);
    fm.uniforms.uUseDepth = { value: 0 };   // the near wall (cut away there) is in front of it in the projector depth bake
    add(far, fm, 'room_far');
    console.info('[match04] m04room', { k, cut });
  }
  // water plane at Benny's water level: from behind the camera, through the mouth, down the tunnel
  const zBack = 14, zEnd = z0 - len;
  const wp = new THREE.PlaneGeometry(28, zBack - zEnd, 56, 96);
  wp.rotateX(-Math.PI / 2).translate(0, 0, (zBack + zEnd) / 2);
  add(wp, M.water, 'water');
  // far end cap of the tunnel (the glowing vanishing point)
  add(new THREE.CircleGeometry(T.r, 64).translate(cx, cy, zEnd), M.gold, 'tube_end');

  // round 8 (M4): `&m04ring / m04foam / m04bub / m04arrow / m04wave =1` sub-switches (src/world/match04m4.ts); absent = no change
  const m4 = addM04({ group, shared: shared as unknown as Record<string, THREE.IUniform>, proj, cx, cy, z0, len, r: T.r, outerR: T.outerR,
    hideOld: (names) => group.children.forEach((o) => { if (names.includes(o.name)) o.visible = false; }) });

  // r11 `&m04mv=1` (lead DECISIVE TEST, qa/match/04/r11/PROGRESS.md): MULTI-VIEW projection — the Screen 08 method extended
  // from one picture to a chain of views along the stage. The user's PROVISIONAL reference views V04-1 / V04-2 (made from the
  // live game frames at forward 10 u / 20 u) are projected from those exact game cameras onto every Screen 04 surface (overlay
  // copies of the meshes, depth-tested against each view's own depth bake; the painted Benny / coins / HUD masked out), and
  // blended by the camera's distance to each view's camera. The approved view (10 u away from V04-1's camera) is unchanged.
  const MV2 = new URLSearchParams(location.search).get('m04mv2') === '1';
  // r12 `&m04mv2=1` (lead, corrected controlled test; implies m04mv): (1) the overlay's depth offset beats the river's own
  // (-2/-4 there: the r11 overlay at -2/-2 lost the depth test on every river pixel); (2) the game's tall foam-ball and bubble
  // sprites fade where a view is in charge (the view already carries the painted low foam / bubbles; they covered it);
  // (3) the views' masked holes (painted Benny / coins / bubbles) are filled from the surrounding scenery (mv04_*_fill.png),
  // so the bare game tunnel no longer shows through as a torn column. Diagnosis: qa/match/04/r12/PROGRESS.md.
  const MV = MV2 || new URLSearchParams(location.search).get('m04mv') === '1';
  const mvViews: { cam: THREE.PerspectiveCamera; rt: THREE.WebGLRenderTarget; pos: THREE.Vector3 }[] = [];
  const mvU = {
    uV0: { value: null as THREE.Texture | null }, uV1: { value: null as THREE.Texture | null },
    uD0: { value: null as THREE.Texture | null }, uD1: { value: null as THREE.Texture | null },
    uVP0: { value: new THREE.Matrix4() }, uVP1: { value: new THREE.Matrix4() },
    uW0: { value: 0 }, uW1: { value: 0 }, uMvNF: { value: new THREE.Vector2(0.2, 160) },
    uMvDbg: { value: 0 },   // r12 QA only (tools/match04/diag04.mjs): 1 / 2 = view 1 / 2 coverage colours (R depth-visible, G image alpha, B in frame)
    uPjPost: shared.uPjPost, uPjRes: shared.uPjRes,
  };
  if (MV) {
    const J: { views: { img: string; matrixWorld: number[]; fov: number; aspect: number }[] } = await fetch(tex('mv04.json')).then((r) => r.json());
    for (const [k, v] of J.views.slice(0, 2).entries()) {
      const t = await new THREE.TextureLoader().loadAsync(tex(MV2 ? v.img.replace('.png', '_fill.png') : v.img));
      t.colorSpace = THREE.NoColorSpace; t.minFilter = THREE.LinearMipmapLinearFilter; t.anisotropy = 8;
      const cam = new THREE.PerspectiveCamera(v.fov, v.aspect, 0.2, 160);
      cam.matrixWorld.fromArray(v.matrixWorld);
      cam.matrixWorld.decompose(cam.position, cam.quaternion, cam.scale);
      cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
      cam.updateProjectionMatrix();
      const rt = new THREE.WebGLRenderTarget(512, 910, { depthBuffer: true });
      rt.depthTexture = new THREE.DepthTexture(512, 910, THREE.UnsignedIntType);
      mvViews.push({ cam, rt, pos: cam.position.clone() });
      (k === 0 ? mvU.uV0 : mvU.uV1).value = t;
      (k === 0 ? mvU.uD0 : mvU.uD1).value = rt.depthTexture;
      (k === 0 ? mvU.uVP0 : mvU.uVP1).value.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);
    }
    const mvMat = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false,
      polygonOffset: true, polygonOffsetFactor: MV2 ? -4 : -2, polygonOffsetUnits: MV2 ? -8 : -2,
      uniforms: mvU,
      vertexShader: 'varying vec3 vW; void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }',
      fragmentShader: /* glsl */ `uniform sampler2D uV0; uniform sampler2D uV1; uniform sampler2D uD0; uniform sampler2D uD1;
uniform mat4 uVP0; uniform mat4 uVP1; uniform float uW0; uniform float uW1; uniform vec2 uMvNF;
uniform vec4 uPjPost; uniform vec2 uPjRes; uniform float uMvDbg; varying vec3 vW;
${PROJ05_INVERSE}
float mvLin(float d) { float n = uMvNF.x, f = uMvNF.y; return 2.0 * n * f / (f + n - (2.0 * d - 1.0) * (f - n)); }
vec4 mvLook(sampler2D V, sampler2D D, mat4 VP) {
  vec4 p = VP * vec4(vW, 1.0);
  if (p.w <= 0.0) return vec4(0.0);
  vec3 ndc = p.xyz / p.w; vec2 uv = ndc.xy * 0.5 + 0.5;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec4(0.0);
  float zs = mvLin(texture2D(D, uv).r), zf = mvLin(ndc.z * 0.5 + 0.5);
  float vis = 1.0 - smoothstep(0.015 * zs, 0.04 * zs + 0.05, zf - zs);
  vec4 c = texture2D(V, uv);
  return vec4(c.rgb, c.a * vis);
}
vec3 mvDbg(sampler2D V, sampler2D D, mat4 VP) {
  vec4 p = VP * vec4(vW, 1.0);
  if (p.w <= 0.0) return vec3(0.0);
  vec3 ndc = p.xyz / p.w; vec2 uv = ndc.xy * 0.5 + 0.5;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return vec3(0.0);
  float zs = mvLin(texture2D(D, uv).r), zf = mvLin(ndc.z * 0.5 + 0.5);
  return vec3(1.0 - smoothstep(0.015 * zs, 0.04 * zs + 0.05, zf - zs), texture2D(V, uv).a, 1.0);
}
void main() {
  if (uMvDbg > 0.5) { gl_FragColor = vec4(uMvDbg < 1.5 ? mvDbg(uV0, uD0, uVP0) : mvDbg(uV1, uD1, uVP1), 1.0); return; }
  vec4 a = mvLook(uV0, uD0, uVP0), b = mvLook(uV1, uD1, uVP1);
  float wa = uW0 * a.a, wb = uW1 * b.a;
  float ca = pow(wa, 3.0), cb = pow(wb, 3.0);
  float cov = clamp(max(wa, wb), 0.0, 1.0);
  if (cov < 0.004) discard;
  vec3 col = (a.rgb * ca + b.rgb * cb) / max(ca + cb, 1e-5);
  gl_FragColor = vec4(pjInverse(col), cov);
}`,
    });
    const meshes: THREE.Mesh[] = [];
    group.traverse((o) => { if ((o as THREE.Mesh).isMesh) meshes.push(o as THREE.Mesh); });
    for (const o of meshes) {
      const c = new THREE.Mesh(o.geometry, mvMat);
      c.name = `${o.name}_mv`; c.frustumCulled = false; c.renderOrder = (o.renderOrder || 0) + 1; c.userData.mv = true;
      o.add(c);
    }
    (window as unknown as { __m04mv?: unknown }).__m04mv = { mvU, mvMat, views: mvViews };   // r12 QA only (diag04.mjs)
    console.info('[match04] m04mv', { views: mvViews.length, overlays: meshes.length, cams: mvViews.map((v) => v.pos.toArray().map((x) => +x.toFixed(2))) });
  }

  let splash: THREE.Mesh | null = null;
  const SP: { offset: [number, number, number]; w: number; h: number } = await fetch(tex('splash04.json')).then((r) => r.json());
  if (SPLASH04) {
    const spTex = await new THREE.TextureLoader().loadAsync(tex('splash04.png'));
    spTex.colorSpace = THREE.NoColorSpace;
    splash = new THREE.Mesh(new THREE.PlaneGeometry(SP.w, SP.h), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, fog: false,
      uniforms: { uTex: { value: spTex }, uPjPost: shared.uPjPost, uPjRes: shared.uPjRes },
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform sampler2D uTex; uniform vec4 uPjPost; uniform vec2 uPjRes; varying vec2 vUv;\n${PROJ05_INVERSE}
void main() { vec4 c = texture2D(uTex, vUv); if (c.a < 0.02) discard; gl_FragColor = vec4(pjInverse(c.rgb), c.a); }`,
    }));
    splash.name = 'm04_splash';
    splash.visible = false;
    splash.renderOrder = 5;
  }

  const splashOffset = new THREE.Vector3(...SP.offset);
  const _bp = new THREE.Vector3();
  return {
    group,
    splash,
    splashOffset,
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
      // r11 m04mv: each extra view's own depth bake (its overlay copies are excluded)
      if (mvViews.length) {
        clone.traverse((o) => { if (o.userData.mv) o.visible = false; });
        for (const v of mvViews) { renderer.setRenderTarget(v.rt); renderer.clear(); renderer.render(scene, v.cam); }
      }
      renderer.setRenderTarget(prevRT);
      shared.uUseDepth.value = 1;
    },
    sync(renderer, w, h, camera?: THREE.Camera) {
      if (camera && !FAL04) shared.uMoved.value = THREE.MathUtils.smoothstep(camera.getWorldPosition(_cp).distanceTo(proj.position), 0.3, 2.0);
      shared.uPjPost.value.x = renderer.toneMappingExposure;
      shared.uPjRes.value.set(w, h);
      // r13: Benny's world position (Game puts the splash at Benny + splashOffset just before sync) for the m04arr3d fade
      if (m4 && camera) m4.update(camera.getWorldPosition(_cp), splash ? _bp.copy(splash.position).sub(splashOffset) : undefined);
      // r11 m04mv: full weight within 3 u of a view's camera, gone at 8 u (the approved camera is ~10 u from V04-1's)
      if (mvViews.length && camera) {
        const cp = camera.getWorldPosition(_cp);
        mvU.uW0.value = 1 - THREE.MathUtils.smoothstep(cp.distanceTo(mvViews[0].pos), 3, 8);
        mvU.uW1.value = mvViews[1] ? 1 - THREE.MathUtils.smoothstep(cp.distanceTo(mvViews[1].pos), 3, 8) : 0;
        if (MV2) {
          const fade = 1 - Math.max(mvU.uW0.value, mvU.uW1.value);
          for (const o of group.children) {
            if (o.name !== 'm04_foam' && o.name !== 'm04_bubbles') continue;
            const u = ((o as THREE.Mesh).material as THREE.ShaderMaterial).uniforms.uAlpha;
            u.value *= fade; o.visible = u.value > 0.01;
          }
        }
      }
    },
  };
}
