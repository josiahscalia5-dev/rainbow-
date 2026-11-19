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

export const PROJWALL05: boolean = flag05('projwall05');
export const PROJRING05: boolean = flag05('projring05');

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
  return Promise.all(jobs).catch((e) => { console.error('[rainbow] proj05 tunnel textures failed', e); });
}
// the game waits for these before `ready` (vfx/index.ts), so a capture never shows the 1×1 placeholder
if (PROJWALL05 || PROJRING05) proj05Pending.push(loadTextures());

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
