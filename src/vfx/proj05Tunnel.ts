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
import { PROJ05_INVERSE, flag05, proj05Pending } from './waterRibbon';
import { wallLidMatrix, type TubePath } from '../world/tube';

export const PROJWALL05: boolean = flag05('projwall05');
export const PROJRING05: boolean = flag05('projring05');
/** `?projframe05=1` (2026-11-16): the near gold frame (bottom corners + bottom lip) wears the approved gold band */
export const PROJFRAME05: boolean = flag05('projframe05');
/** `?projlid05=1` (2026-11-16): the real 05 wall paddles where (and as tilted as) the approved picture shows them */
export const PROJLID05: boolean = flag05('projlid05');

/**
 * `?projlid05=1`: the approved picture's large wall paddles L1 L2 (left) R1 R2 (right), each fitted with one real lid
 * on the real 05 wall seen from the locked 05 camera (scripts/proj05-lid-fit.mjs → qa/pilot05/proj/tunnel/lid/fit.json,
 * tray silhouette IoU 0.51–0.76, never crossing a ring band). ds = arc length ahead of the 05 checkpoint eye (sCam05), side +1 = screen right, angle
 * above the tube axis and droop as wallLidBasis, size before the radius scale. They sit higher on the wall than the
 * default pairs (above eye level), so the camera sees their undersides like the approved picture. The small far pair
 * (L3, R3) is the existing forced-perspective far lids.
 */
export const LIDS05_FIT = [
  { name: 'L1', side: -1, ds: 24.375, ang: 22, droop: -115, size: 1.75, stretch: 1.5 },
  { name: 'L2', side: -1, ds: 47.5, ang: 0, droop: -115, size: 2.4, stretch: 1.5 },
  { name: 'R1', side: 1, ds: 33.5, ang: -3.5, droop: -115, size: 2.8, stretch: 1.5 },
  { name: 'R2', side: 1, ds: 50.5, ang: 9.5, droop: -50, size: 2.0, stretch: 1.25 },
] as const;

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

/** the fitted 05 paddles (approved trays) as one InstancedMesh */
export const TRAY05 = { depth: 0.45, sink: 0.2 };
export function buildLids05Fit(path: TubePath, sCam05: number, material: THREE.Material): THREE.InstancedMesh {
  const mesh = new THREE.InstancedMesh(trayLidGeometry(TRAY05.depth), material, LIDS05_FIT.length);
  const m = new THREE.Matrix4();
  LIDS05_FIT.forEach((l, i) => {
    const s = sCam05 + l.ds;
    mesh.setMatrixAt(i, wallLidMatrix(path, s, l.side, l.ang, l.droop, l.size * Math.min(1.4, path.radius(s) / 7.6), l.stretch, TRAY05.sink, m));
  });
  mesh.count = LIDS05_FIT.length;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  return mesh;
}

/** atlas rows of wall05.png (tools/proj05/tunnel_bake.py: ROWS) */
export const PT_ROW = { AB: 0, BC: 1, CD: 2, DE: 3, EF: 4, FG: 5, GX: 6 } as const;
const N_ROWS = 7;
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
  if (PROJWALL05) {
    jobs.push(Promise.all([
      load(new URL('../../assets/textures/tunnel05/wall05.png', import.meta.url).href),
      fetch(new URL('../../assets/textures/tunnel05/tunnel05.json', import.meta.url).href).then((r) => r.json()),
    ]).then(([t, meta]) => {
      shared.uPtWall.value = t;
      shared.uPtWallSize.value.set(meta.wall.w, meta.wall.h);
      (Object.keys(PT_ROW) as (keyof typeof PT_ROW)[]).forEach((k) => {
        const r = meta.wall.rows[k];
        if (r) shared.uPtRows.value[PT_ROW[k]].set(r.y0, r.h);
      });
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
      load(new URL('../../assets/textures/tunnel05/frame05.png', import.meta.url).href),
      fetch(new URL('../../assets/textures/tunnel05/frame05.json', import.meta.url).href).then((r) => r.json()),
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
if (PROJWALL05 || PROJRING05 || PROJFRAME05) proj05Pending.push(loadTextures());

const size = new THREE.Vector2();
function livePost(renderer: THREE.WebGLRenderer) {
  const rt = renderer.getRenderTarget();
  if (rt) size.set(rt.width, rt.height); else renderer.getDrawingBufferSize(size);
  shared.uPjRes.value.copy(size);
  shared.uPjPost.value.x = renderer.toneMappingExposure;
}

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
  const uniforms = { ...shared, uPtSeg: { value: seg }, uPtSegT: { value: segT }, uPtTile: { value: new THREE.Vector2(tile.anchor, tile.period) } };
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
  vec3 pc = texture2D(uPtWall, puv).rgb;
  gl_FragColor = uPtDbg > 0.5 ? vec4(puv, 7.0, 77.0) : vec4(pjInverse(pc), 1.0);
}`);
  };
  const prevKey = mat.customProgramCacheKey.bind(mat);
  mat.customProgramCacheKey = () => prevKey() + '|ptwall-' + key;
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
