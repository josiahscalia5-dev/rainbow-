/**
 * Screen 05 projection tests for the TUNNEL (2026-11-16, qa/pilot05/proj/tunnel/NOTES.md), same method as the water
 * (`?proj05=1`): the user's APPROVED Screen 05 picture, unwrapped into the tunnel's own coordinates and baked into
 * textures (tools/proj05/tunnel_rings.py + tunnel_bake.py → assets/textures/tunnel05/), so the design is anchored to the
 * 3D tunnel, not pasted over the screen.
 *   `?projwall05=1`  the purple metal WALLS: one texture row per wall bay between two gold rings (AB, BC, CD … as the
 *                    approved picture shows them from the locked 05 camera); u = angle round the tube, v = depth within
 *                    the bay. Bays the picture does not show (in front of ring A, behind the camera) repeat the AB row.
 *   `?projring05=1`  the gold RINGS: the band of the approved ring B unwrapped (u = angle round the ring, v = how far the
 *                    band stands out of the wall), on every 05 ring; the existing far glow still melts the far rings
 *                    into the warm throat.
 * The shader undoes the post chain (grade → sRGB → Neutral tone map → exposure) so the screen shows the approved
 * colours; bloom is measured and fed back into the bake. Default build: none of this runs — the wall and ring
 * materials are wrapped only when a switch is on, every default shader program is unchanged.
 */
import * as THREE from 'three';
import { M05WALL, M05WTILE, PROJ05_INVERSE, m05eye, on05, proj05Pending } from './waterRibbon';
// the tunnel bake follows its own switches OR the master `?match05=1` (on05)
const flag05 = on05;
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export const PROJWALL05: boolean = flag05('projwall05');
export const PROJRING05: boolean = flag05('projring05');
/** `?projframe05=1` (2026-11-16): the near gold frame (bottom corners + bottom lip) wears the approved gold band */
export const PROJFRAME05: boolean = flag05('projframe05');
/** `?projlid05=1` (2026-11-16): the approved paddles L1 L2 R1 R2 as Blender-built 3D trays on the real 05 wall */
export const PROJLID05: boolean = flag05('projlid05');
/**
 * `?env05=1` (2026-11-17, washer-environment-modeler, qa/pilot05/full_reference_match/env/NOTES.md): the 05 rings placed
 * where the approved picture shows them from the locked camera (src/world/environment.ts) and the walls / rings baked by
 * CAMERA PROJECTION in their own coordinates (tools/env05/proj_bake.py → assets/textures/env05/): wall atlas with own
 * rows for the near bays (N1, N2), and one ring atlas row per ring (A, B, C … G, N) sampled by (angle round the ring,
 * axial position across the band). Off = every program and texture exactly as before.
 */
export const ENV05: boolean = flag05('env05');

/**
 * The approved paddle is a D-shaped TRAY (studied at 4× zoom: a thick polished gold rim whose INNER face shows above a
 * lavender floor, a thin straight lip along the bottom). Half lathe toward local +X like wallLidGeometry: the D's
 * straight edge lies on local Z (along the tube); the open side faces −Y (the camera / the stream), the closed back +Y
 * (into the wall). Thickness h = tray depth (fraction of the size), centred on its thickness like the wall lids.
 */
export function trayLidGeometry(h: number, segments = 28): THREE.BufferGeometry {
  const prof: [number, number][] = [
    [0, 0.68 * h], [0.78, 0.68 * h], [0.84, 0.62 * h],         // floor (recessed from the open side), fillet
    [0.855, 0.3 * h], [0.865, 0.06 * h], [0.9, 0.0],            // inner rim face down to the lip
    [0.965, 0.0], [1.0, 0.06 * h], [1.025, 0.4 * h],            // rounded lip, outer bulge
    [1.0, 0.85 * h], [0.95, h], [0, h],                          // closed back against the wall
  ];
  const geo = new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), segments, 0, Math.PI);
  geo.translate(0, -h * 0.5, 0);
  return geo;
}

/**
 * `?projlid05=1` (Blender pipeline, qa/pilot05/proj/tunnel/NOTES.md): the approved picture's four large paddles L1 L2 R1
 * R2 (+ the small far pair L3 R3 on the far wall) as real 3D tray-blocks on the real 05 wall (assets/models/lids05.glb, built in Blender by tools/proj05/lid_blender.py
 * from the approved outlines lifted onto the wall through the locked 05 camera). From the checkpoint their outline is the
 * approved one; riding on, they show their real depth. They carry the approved paddle pixels (camera-projected UVs,
 * assets/textures/tunnel05/lid05.png inside the GLB), shown through the post-chain inverse like the walls. The default
 * paddle pairs and the far slab pucks are left out under the switch.
 */
let lids05Scene: THREE.Object3D | null = null;
// `?env05=1`: the same six paddles lifted onto the DISPLACED env05 wall (scripts/proj05-lid-raycast.mjs --q='<STACK>&env05=1'
// → tools/proj05/lid_blender.py → assets/models/lids05e.glb; qa/pilot05/full_reference_match/env/NOTES.md), else lids05.glb
const lids05Url = ENV05 ? new URL('../../assets/models/lids05e.glb', import.meta.url).href : new URL('../../assets/models/lids05.glb', import.meta.url).href;
const lids05Ready: Promise<void> | null = PROJLID05
  ? new GLTFLoader().loadAsync(lids05Url).then((gltf) => {
    gltf.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const map = (m.material as THREE.MeshStandardMaterial).map;
      if (!map) return;
      map.colorSpace = THREE.NoColorSpace;          // the texels ARE display values: the shader undoes the post chain
      map.needsUpdate = true;
      m.material = lidProjMaterial(map);
      m.frustumCulled = false;
    });
    lids05Scene = gltf.scene;
    lids05Scene.name = 'tube05_lids_blender';
  }).catch((e) => { console.error('[rainbow] projlid05: lids05.glb failed', e); })
  : null;
if (lids05Ready) proj05Pending.push(lids05Ready);

function lidProjMaterial(map: THREE.Texture): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({ map, side: THREE.DoubleSide, fog: false });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, shared);
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `uniform vec4 uPjPost; uniform vec2 uPjRes;
${PROJ05_INVERSE}
void main() {`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
gl_FragColor = vec4(pjInverse(texture2D(map, vMapUv).rgb), 1.0);   // ?projlid05=1: the approved paddle pixels`);
  };
  mat.customProgramCacheKey = () => 'ptlid05';
  mat.onBeforeRender = (renderer) => livePost(renderer);
  return mat;
}

/** the group environment.ts adds under `?projlid05=1`; the Blender paddles join it once the GLB has loaded */
export function lids05Group(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'tube05_lids05';
  const attach = () => { if (lids05Scene) g.add(lids05Scene); };
  if (lids05Scene) attach(); else lids05Ready?.then(attach);
  return g;
}

/** atlas rows of wall05.png (tools/proj05/tunnel_bake.py: ROWS) */
export const PT_ROW = { AB: 0, BC: 1, CD: 2, DE: 3, EF: 4, FG: 5, GX: 6, N1: 7, N2: 8 } as const;
const N_ROWS = ENV05 ? 9 : 7;
/** `?env05=1` ring atlas rows (assets/textures/env05/env05.json: ring.rows) */
export const E5_RING_ROW = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5, G: 6, N: 7 } as const;
const N_SEG = 8;

const empty = new THREE.DataTexture(new Uint8Array([128, 40, 150, 255]), 1, 1);
empty.needsUpdate = true;

const shared = {
  uPjPost: { value: new THREE.Vector4(0.86, 1.36, 1.15, 0.18) },
  uPjRes: { value: new THREE.Vector2(864, 1536) },
  uPtWall: { value: empty as THREE.Texture },
  uPtWallSize: { value: new THREE.Vector2(1, 1) },
  uPtRows: { value: Array.from({ length: N_ROWS }, () => new THREE.Vector2(0, 1)) },
  uPtRing: { value: empty as THREE.Texture },
  uPtRingSize: { value: new THREE.Vector2(1, 1) },
  uPtFrame: { value: empty as THREE.Texture },
  /** frame05.png: (texture height, band rows NV, left y0, right y0); lip y0 in uPtFrameLip */
  uPtFrameRows: { value: new THREE.Vector4(1, 1, 0, 0) },
  uPtFrameLip: { value: 0 },
  /** `?env05=1`: ring atlas, (texture height, rows height) */
  uE5Ring: { value: empty as THREE.Texture },
  uE5RingSize: { value: new THREE.Vector3(1, 1, 1) },
  /** QA only (scripts/proj05-tunnel-probe.mjs --coords): 1 = write the texture coordinates instead of the colour */
  uPtDbg: { value: 0 },
};
/** QA accessor for the probe script */
export const proj05TunnelShared = shared;

function loadTextures() {
  const loader = new THREE.TextureLoader();
  const load = (url: string) =>
    new Promise<THREE.Texture>((res, rej) =>
      loader.load(url, (t) => {
        t.flipY = false;
        t.colorSpace = THREE.NoColorSpace;          // the texels ARE display values: the shader undoes the post chain
        t.generateMipmaps = false;
        t.minFilter = THREE.LinearFilter;
        t.magFilter = THREE.LinearFilter;
        t.wrapS = THREE.RepeatWrapping;             // round the tube
        t.wrapT = THREE.ClampToEdgeWrapping;
        t.needsUpdate = true;
        res(t);
      }, undefined, rej));
  const jobs: Promise<unknown>[] = [];
  if (PROJWALL05 || ENV05) {
    jobs.push(Promise.all([
      load(ENV05 ? new URL('../../assets/textures/env05/wall05e.png', import.meta.url).href : new URL('../../assets/textures/tunnel05/wall05.png', import.meta.url).href),
      fetch(ENV05 ? new URL('../../assets/textures/env05/env05.json', import.meta.url).href : new URL('../../assets/textures/tunnel05/tunnel05.json', import.meta.url).href).then((r) => r.json()),
    ]).then(([t, meta]) => {
      shared.uPtWall.value = t;
      shared.uPtWallSize.value.set(meta.wall.w, meta.wall.h);
      (Object.keys(PT_ROW) as (keyof typeof PT_ROW)[]).forEach((k) => {
        const r = meta.wall.rows[k];
        if (r) shared.uPtRows.value[PT_ROW[k]].set(r.y0, r.h);
      });
    }));
  }
  if (ENV05) {
    jobs.push(Promise.all([
      load(new URL('../../assets/textures/env05/ring05e.png', import.meta.url).href),
      fetch(new URL('../../assets/textures/env05/env05.json', import.meta.url).href).then((r) => r.json()),
    ]).then(([t, meta]) => {
      shared.uE5Ring.value = t;
      shared.uE5RingSize.value.set(meta.ring.w, meta.ring.h, meta.ring.rowH);
    }));
  }
  if (PROJRING05) {
    jobs.push(load(new URL('../../assets/textures/tunnel05/ring05.png', import.meta.url).href).then((t) => {
      shared.uPtRing.value = t;
      shared.uPtRingSize.value.set(t.image.width, t.image.height);
    }));
  }
  if (PROJFRAME05) {
    jobs.push(Promise.all([
      // `?env05=1`: the frame pieces fitted to the approved outline wear their own bake (tools/proj05/frame_bake.py --pieces)
      load(ENV05 ? new URL('../../assets/textures/env05/frame05.png', import.meta.url).href : new URL('../../assets/textures/tunnel05/frame05.png', import.meta.url).href),
      fetch(ENV05 ? new URL('../../assets/textures/env05/frame05.json', import.meta.url).href : new URL('../../assets/textures/tunnel05/frame05.json', import.meta.url).href).then((r) => r.json()),
    ]).then(([t, meta]) => {
      t.wrapS = THREE.ClampToEdgeWrapping;          // the frame bands are open arcs, not closed rings
      t.needsUpdate = true;
      shared.uPtFrame.value = t;
      shared.uPtFrameRows.value.set(meta.h, meta.rows.left.h, meta.rows.left.y0, meta.rows.right.y0);
      shared.uPtFrameLip.value = meta.rows.lip.y0;
    }));
  }
  return Promise.all(jobs).catch((e) => { console.error('[rainbow] proj05 tunnel textures failed', e); });
}
// the game waits for these before `ready` (vfx/index.ts), so a capture never shows the 1×1 placeholder
if (PROJWALL05 || PROJRING05 || PROJFRAME05 || ENV05) proj05Pending.push(loadTextures());

const size = new THREE.Vector2();
function livePost(renderer: THREE.WebGLRenderer) {
  const rt = renderer.getRenderTarget();
  if (rt) size.set(rt.width, rt.height); else renderer.getDrawingBufferSize(size);
  shared.uPjRes.value.copy(size);
  shared.uPjPost.value.x = renderer.toneMappingExposure;
}

/**
 * `&m05wall=1` (Screen 05 round 9, waterRibbon.ts M05WALL): where the projected atlas would be magnified while swimming
 * (texels per screen pixel < 0.9) the bay becomes crisp perforated metal in the approved palette (display values,
 * measured on the approved near walls: plum slot (50,1,37), violet metal (171,51,185), lit metal (232,67,186), pink lip
 * (244,101,240), highlight (253,213,250)); slot grid measured from the atlas rows (44 of 2048 texels round the tube =
 * 46.5 slots per turn, 6.7 slot rows per 14-u bay ≈ 1.9 u). The atlas's own low-frequency colour (blurred over one slot
 * pitch) keeps the painted light distribution wherever it is wall-coloured (purple: low green); water / foam texels of
 * a bay (the far wall by the left bank) fall back to the violet metal. Off at the locked checkpoint eye (0 px there).
 */
const M05WALL_GLSL = /* glsl */ `
  {
    vec2 tpw = puv * uPtWallSize;
    vec2 jwa = dFdx(tpw), jwb = dFdy(tpw);
    float mW = abs(jwa.x * jwb.y - jwa.y * jwb.x) / max(max(length(jwa), length(jwb)), 1e-5);
    float rideW = uM05Eye.w > 0.5 ? smoothstep(0.02, 0.5, distance(cameraPosition, uM05Eye.xyz)) : 0.0;
    float wC = rideW * (1.0 - smoothstep(0.45, 0.9, mW));
    if (wC > 0.0) {
      // low-frequency colour of the bay: the atlas blurred over about one slot pitch (rows clamped to this bay's row)
      float y0 = (rw.x + 0.5) / uPtWallSize.y, y1 = (rw.x + rw.y - 0.5) / uPtWallSize.y;
      vec2 bx = vec2(22.0 / uPtWallSize.x, 0.0), by = vec2(0.0, max(rw.y / 13.4, 1.0) / uPtWallSize.y);
      vec3 lf = pc * 2.0;
      lf += texture2D(uPtWall, vec2(puv.x + bx.x, puv.y)).rgb + texture2D(uPtWall, vec2(puv.x - bx.x, puv.y)).rgb;
      lf += texture2D(uPtWall, vec2(puv.x, clamp(puv.y + by.y, y0, y1))).rgb + texture2D(uPtWall, vec2(puv.x, clamp(puv.y - by.y, y0, y1))).rgb;
      lf += texture2D(uPtWall, vec2(puv.x + bx.x, clamp(puv.y + by.y, y0, y1))).rgb + texture2D(uPtWall, vec2(puv.x - bx.x, clamp(puv.y - by.y, y0, y1))).rgb;
      lf += texture2D(uPtWall, vec2(puv.x - bx.x, clamp(puv.y + by.y, y0, y1))).rgb + texture2D(uPtWall, vec2(puv.x + bx.x, clamp(puv.y - by.y, y0, y1))).rgb;
      lf /= 10.0;
      float wallK = smoothstep(0.08, 0.24, min(lf.r, lf.b) - lf.g);
      vec3 metal = mix(vec3(0.671, 0.200, 0.725), clamp(lf * 1.12, 0.0, 1.0), wallK);
      // slot grid (units): 46.5 slots round the tube, rows every 1.9 u along it; rounded-square slots ≈ 0.6 × 0.6 u
      // (atlas: 26 × 13 texels = 0.61 u round × 0.64 u along — they read as tall capsules only through the perspective)
      vec2 gw = vec2(vPerfUv.x * 46.5, vPerfUv.y / 1.9);
      vec2 qw = (fract(gw) - 0.5) * vec2(1.03, 1.9);
      vec2 kq = max(abs(qw) - vec2(0.16, 0.15), 0.0);
      float dS = length(kq) + min(max(abs(qw.x) - 0.16, abs(qw.y) - 0.15), 0.0) - 0.14;
      float aS = fwidth(dS) * 0.9 + 1e-4;
      float hole = 1.0 - smoothstep(-aS, aS, dS);
      float glow = exp(-max(dS, 0.0) / 0.06) * (1.0 - hole);
      float lip = glow * smoothstep(-0.02, 0.06, qw.y);
      vec3 cw = metal;
      cw = mix(cw, vec3(0.957, 0.396, 0.941), clamp(glow * 0.35 + lip * 0.45, 0.0, 1.0));
      cw = mix(cw, mix(vec3(0.196, 0.004, 0.145), vec3(0.35, 0.05, 0.3), smoothstep(-0.1, 0.0, dS)), hole);
      pc = mix(pc, cw, wC);
    }
  }`;

/**
 * `&m05wtile=1` (Screen 05 round 11, waterRibbon.ts M05WTILE): a far bay row (BC … GX) magnified while swimming shows the
 * approved near bay N1 instead (same angle round the tube, same place within the bay), tinted by the ratio of the bay's
 * own low-frequency colour to N1's, so the painted light distribution of each bay stays. Rows AB / N1 / N2 are sharp
 * already and stay as they are. Off at the locked checkpoint eye.
 */
const M05WTILE_GLSL = /* glsl */ `
  if (prow > 0.5 && prow < 6.5) {
    vec2 tpt = puv * uPtWallSize;
    vec2 jta = dFdx(tpt), jtb = dFdy(tpt);
    float mT = abs(jta.x * jtb.y - jta.y * jtb.x) / max(max(length(jta), length(jtb)), 1e-5);
    float rideT = uM05Eye.w > 0.5 ? smoothstep(0.02, 0.5, distance(cameraPosition, uM05Eye.xyz)) : 0.0;
    float wT = rideT * (1.0 - smoothstep(0.35, 0.85, mT));
    if (wT > 0.0) {
      // the bay's own row keeps its painted light along the tunnel (streaks = detail round the tube, which the atlas
      // has at full resolution); N1 adds the slot rows along the tunnel that the own row lacks: N1 divided by its own
      // average over one slot pitch along the tunnel (≈ 38 texel rows) = the slots' light / dark pattern only
      vec2 rN = uPtRows[${7}];
      float lo = (rN.x + 0.5) / uPtWallSize.y, hi = (rN.x + rN.y - 0.5) / uPtWallSize.y;
      float yN = (rN.x + clamp(pt * rN.y, 0.5, rN.y - 0.5)) / uPtWallSize.y;
      float st = 9.5 / uPtWallSize.y;
      vec3 cN = texture2D(uPtWall, vec2(puv.x, yN)).rgb;
      vec3 avN = cN;
      avN += texture2D(uPtWall, vec2(puv.x, clamp(yN + st, lo, hi))).rgb + texture2D(uPtWall, vec2(puv.x, clamp(yN - st, lo, hi))).rgb;
      avN += texture2D(uPtWall, vec2(puv.x, clamp(yN + 2.0 * st, lo, hi))).rgb + texture2D(uPtWall, vec2(puv.x, clamp(yN - 2.0 * st, lo, hi))).rgb;
      avN /= 5.0;
      vec3 ratio = clamp((cN + 0.03) / (avN + 0.03), vec3(0.2), vec3(1.7));
      // only where the own row is wall-coloured (purple: low green); water / foam texels keep N1 as it is
      float wallO = smoothstep(0.05, 0.18, min(pc.r, pc.b) - pc.g);
      vec3 cW = mix(cN, clamp(pc * ratio, 0.0, 1.0), wallO);
      pc = mix(pc, cW, wT);
    }
  }`;

/** one wall bay: tunnel coordinate range [v0, v1) (the wall's uv.y) → atlas row, t at v0 and at v1 */
export interface WallSeg { v0: number; v1: number; row: number; t0: number; t1: number }

/**
 * `?projwall05=1`: wrap a perforatedMetal wall material (real 05 wall or the forced-perspective far wall; both carry
 * `vPerfUv` = (angle round the tube 0..1 from the top, tunnel coordinate)). `segs` (≤ 8) lists the bays; anything outside
 * them repeats the AB row every `tile.period` units from `tile.anchor`.
 */
export function withProj05Wall<T extends THREE.MeshStandardMaterial>(mat: T, segs: WallSeg[], tile: { anchor: number; period: number }, key: string): T {
  const seg = Array.from({ length: N_SEG }, (_, i) => (segs[i] ? new THREE.Vector4(segs[i].v0, segs[i].v1, 0, 0) : new THREE.Vector4(1e9, 1e9, 0, 0)));
  const segT = Array.from({ length: N_SEG }, (_, i) => (segs[i] ? new THREE.Vector3(segs[i].row, segs[i].t0, segs[i].t1) : new THREE.Vector3(0, 0, 0)));
  const uniforms = { ...shared, uPtSeg: { value: seg }, uPtSegT: { value: segT }, uPtTile: { value: new THREE.Vector2(tile.anchor, tile.period) }, ...(M05WALL || M05WTILE ? { uM05Eye: m05eye } : {}) };
  // env05 run #4: the bays stay editable until the first render (environment.ts adds the real wall's bay past the seam)
  mat.userData.ptSeg = seg;
  mat.userData.ptSegT = segT;
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    prev.call(mat, shader, r);
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `uniform sampler2D uPtWall; uniform vec2 uPtWallSize; uniform vec2 uPtRows[${N_ROWS}];
uniform vec4 uPtSeg[${N_SEG}]; uniform vec3 uPtSegT[${N_SEG}]; uniform vec2 uPtTile; uniform float uPtDbg;
uniform vec4 uPjPost; uniform vec2 uPjRes;
${PROJ05_INVERSE}
void main() {`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
{ // ?projwall05=1: the approved wall of this bay (texture anchored to the tunnel)
  float pv = vPerfUv.y;
  float prow = 0.0;
  float pt = fract((pv - uPtTile.x) / uPtTile.y);
  for (int i = 0; i < ${N_SEG}; i++) {
    vec4 sg = uPtSeg[i];
    if (pv >= sg.x && pv < sg.y) { prow = uPtSegT[i].x; pt = mix(uPtSegT[i].y, uPtSegT[i].z, (pv - sg.x) / (sg.y - sg.x)); }
  }
  vec2 rw = uPtRows[int(prow + 0.5)];
  vec2 puv = vec2(fract(vPerfUv.x + 0.25), (rw.x + clamp(pt * rw.y, 0.5, rw.y - 0.5)) / uPtWallSize.y);
  vec3 pc = texture2D(uPtWall, puv).rgb;${M05WTILE && ENV05 ? M05WTILE_GLSL : ''}${M05WALL ? M05WALL_GLSL : ''}
  gl_FragColor = uPtDbg > 0.5 ? vec4(puv, 7.0, 77.0) : vec4(pjInverse(pc), 1.0);
}`);
    if (M05WALL || M05WTILE) shader.fragmentShader = shader.fragmentShader.replace('void main() {', 'uniform vec4 uM05Eye;\nvoid main() {');
  };
  const prevKey = mat.customProgramCacheKey.bind(mat);
  mat.customProgramCacheKey = () => prevKey() + '|ptwall-' + key + (M05WALL ? '|m05wall' : '') + (M05WTILE ? '|m05wtile' : '');
  const prevRender = mat.onBeforeRender;
  mat.onBeforeRender = (renderer, ...rest) => { livePost(renderer); prevRender.call(mat, renderer, ...rest); };
  return mat;
}

/**
 * `?projring05=1`: wrap a withBandShading ring material. `flip` = the ring's local x points to screen LEFT (the real 05
 * rings, basis (−right, up, tan)); the forced-perspective far rings use (right, up, tan). `height` = the band's height
 * (BandOpts.height, fraction of the ring radius): v = how far the surface stands out of the wall, 0 wall … 1 crown.
 */
export function withProj05Ring<T extends THREE.MeshStandardMaterial>(mat: T, flip: boolean, height: number, key: string): T {
  const uniforms = { ...shared, uPtRingP: { value: new THREE.Vector2(flip ? 1 : 0, height) } };
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    prev.call(mat, shader, r);
    Object.assign(shader.uniforms, uniforms);
    const marker = 'vec3 bc = bandShade(smoothstep(uBandF.x, uBandF.y, bDist), normalize(normal), normalize(vViewPosition));';
    if (!shader.fragmentShader.includes(marker)) { console.error('[rainbow] projring05: band shader marker not found'); return; }
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `uniform sampler2D uPtRing; uniform vec2 uPtRingSize; uniform vec2 uPtRingP; uniform float uPtDbg;
uniform vec4 uPjPost; uniform vec2 uPjRes;
vec2 gPtRingUv;
${PROJ05_INVERSE}
void main() {`)
      .replace(marker, `${marker}
  { // ?projring05=1: the approved gold band (ring B of the approved picture), anchored to the ring
    float ph = atan(vBandP.y, vBandP.x);
    float th = uPtRingP.x > 0.5 ? 3.14159265 - ph : ph;
    float rv = clamp((1.0 - length(vBandP.xy)) / uPtRingP.y, 0.0, 1.0);
    gPtRingUv = vec2(fract(th / 6.2831853), (0.5 + rv * (uPtRingSize.y - 1.0)) / uPtRingSize.y);
    bc = pjInverse(texture2D(uPtRing, gPtRingUv).rgb);
  }`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
if (uPtDbg > 0.5) gl_FragColor = vec4(gPtRingUv, 8.0, 78.0);`);
  };
  const prevKey = mat.customProgramCacheKey.bind(mat);
  mat.customProgramCacheKey = () => prevKey() + '|ptring-' + key;
  const prevRender = mat.onBeforeRender;
  mat.onBeforeRender = (renderer, ...rest) => { livePost(renderer); prevRender.call(mat, renderer, ...rest); };
  return mat;
}

/**
 * `?env05=1`: wrap a withBandShading ring material (real 05 ring: one mesh per ring, `perInstance` false; far rings: one
 * instanced mesh, row = row0 + instance index). The colour is the ring's own row of the env05 ring atlas, sampled by
 * u = angle round the ring (object space, atan(y, x)), v = axial position across the band (−w camera side … +w far side,
 * w = (width + groove + lipWidth) / 2) — unique on the visible band, so the camera-projection bake is exact. Written as the
 * final colour through the post-chain inverse (no far-glow / fog on top: the bake already carries the approved look).
 */
export function withEnv05Ring<T extends THREE.MeshStandardMaterial>(mat: T, row0: number, perInstance: boolean, halfW: number, key: string): T {
  const uniforms = { ...shared, uE5RingP: { value: new THREE.Vector2(row0, halfW) } };
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    prev.call(mat, shader, r);
    Object.assign(shader.uniforms, uniforms);
    const vMark = 'vBandP = position;';
    if (!shader.vertexShader.includes(vMark) || !shader.fragmentShader.includes('varying vec3 vBandP;')) { console.error('[rainbow] env05: band shader marker not found'); return; }
    shader.vertexShader = shader.vertexShader
      .replace('void main() {', 'varying float vE5Inst; attribute float aE5Skirt; varying float vE5Skirt;\nvoid main() {')
      .replace(vMark, `${vMark}
vE5Skirt = aE5Skirt;
#ifdef USE_INSTANCING
vE5Inst = ${perInstance ? 'float(gl_InstanceID)' : '0.0'};
#else
vE5Inst = 0.0;
#endif`);
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `uniform sampler2D uE5Ring; uniform vec3 uE5RingSize; uniform vec2 uE5RingP; uniform float uPtDbg;
uniform vec4 uPjPost; uniform vec2 uPjRes;
varying float vE5Inst; varying float vE5Skirt;
${PROJ05_INVERSE}
void main() {
  if (vE5Skirt > 0.001) discard;   // the skirt behind the wall line (tube.ts markBandSkirt): never drawn under env05`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>
{ // ?env05=1: this ring's row of the camera-projection ring atlas
  float e5row = floor(uE5RingP.x + vE5Inst + 0.5);
  float e5v = clamp((vBandP.z + uE5RingP.y) / (2.0 * uE5RingP.y), 0.0, 1.0);
  vec2 e5uv = vec2(fract(atan(vBandP.y, vBandP.x) / 6.2831853 + 1.0), (e5row * uE5RingSize.z + 0.5 + e5v * (uE5RingSize.z - 1.0)) / uE5RingSize.y);
  gl_FragColor = uPtDbg > 0.5 ? vec4(e5uv, 8.0, 78.0) : vec4(pjInverse(texture2D(uE5Ring, e5uv).rgb), 1.0);
}`);
  };
  const prevKey = mat.customProgramCacheKey.bind(mat);
  mat.customProgramCacheKey = () => prevKey() + '|e5ring-' + key;
  const prevRender = mat.onBeforeRender;
  mat.onBeforeRender = (renderer, ...rest) => { livePost(renderer); prevRender.call(mat, renderer, ...rest); };
  return mat;
}

/**
 * `?projframe05=1`: wrap nearFrameMaterial (src/world/materials.ts; geometry nearFrameGeometry in tube.ts). The frame
 * is the existing camera-held 3D band (bottom corners + bottom lip); this only replaces its hand-picked palette with the
 * approved gold band profile (tools/proj05/frame_bake.py: the approved picture sampled in the frame's own band
 * coordinates, hidden parts filled, smoothed along the arc), shown through the post-chain inverse like the walls/rings.
 * Which corner: the sign of the geometry's x (reference pixels from the frame centre).
 */
export function withProj05Frame<T extends THREE.MeshStandardMaterial>(mat: T): T {
  /** tan(fov/2) / 768: reference px of depth → relative scale (environment.ts places the frame at depth d = 0.8) */
  const frameK = { value: 0 };
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    prev.call(mat, shader, r);
    Object.assign(shader.uniforms, shared);
    const vMark = 'vFrUv = uv; vFrPiece = framePiece;';
    const fMark = '#include <dithering_fragment>';
    if (!shader.vertexShader.includes(vMark) || !shader.fragmentShader.includes(fMark)) {
      console.error('[rainbow] projframe05: near-frame shader marker not found');
      return;
    }
    // The frame stands toward the viewer (corner z0 40 + half-round bulge, reference px), so perspective pushed its
    // outline ≈15–35 px outward from the measured reference edges. Pre-shrink x, y by the depth factor so every
    // vertex projects onto its designed reference pixel (the band keeps its 3D bulge for the shading).
    shader.uniforms.uPtFrameK = frameK;
    shader.vertexShader = shader.vertexShader
      .replace('void main() {', 'varying float vPtSide; uniform float uPtFrameK;\nvoid main() {')
      .replace(vMark, `${vMark} vPtSide = position.x; transformed.xy *= 1.0 - transformed.z * uPtFrameK;`);
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `uniform sampler2D uPtFrame; uniform vec4 uPtFrameRows; uniform float uPtFrameLip; uniform float uPtDbg;
uniform vec4 uPjPost; uniform vec2 uPjRes;
varying float vPtSide;
${PROJ05_INVERSE}
void main() {`)
      .replace(fMark, `${fMark}
{ // ?projframe05=1: the approved gold band of this frame piece, in the band's own (along, across) coordinates
  float y0 = vFrPiece > 0.5 ? uPtFrameLip : (vPtSide < 0.0 ? uPtFrameRows.z : uPtFrameRows.w);
  float nv = uPtFrameRows.y;
  vec2 fuv = vec2(clamp(vFrUv.x, 0.0, 1.0), (y0 + clamp(vFrUv.y * nv, 0.5, nv - 0.5)) / uPtFrameRows.x);
  gl_FragColor = uPtDbg > 0.5 ? vec4(fuv, 9.0, 79.0) : vec4(pjInverse(texture2D(uPtFrame, fuv).rgb), 1.0);
}`);
  };
  const prevKey = mat.customProgramCacheKey.bind(mat);
  mat.customProgramCacheKey = () => prevKey() + '|ptframe';
  const prevRender = mat.onBeforeRender;
  mat.onBeforeRender = (renderer, scene, camera, ...rest) => {
    livePost(renderer);
    const pc = camera as THREE.PerspectiveCamera;
    if (pc.isPerspectiveCamera) frameK.value = Math.tan(THREE.MathUtils.degToRad(pc.fov) / 2) / 768;
    prevRender.call(mat, renderer, scene, camera, ...rest);
  };
  return mat;
}
