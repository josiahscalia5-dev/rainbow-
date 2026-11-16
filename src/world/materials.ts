/**
 * Washer-world materials: procedural perforated magenta metal (round holes for drums, circumferential
 * slots for tunnels), thick reflective gold, chrome, glass — all PBR (MeshStandardMaterial) so they pick
 * up the candy PMREM environment, with shader patches for the perforations and glow.
 */
import * as THREE from 'three';

export interface PerforatedOptions {
  /** base metal colour */
  color?: THREE.ColorRepresentation;
  /** colour of the hole interiors */
  holeColor?: THREE.ColorRepresentation;
  /** 0 = round holes (drum), 1 = slots elongated along u (tunnel rings) */
  slot?: number;
  /** pattern repeats: holes around u (per 0..1) and per uv-unit along v */
  repeatU?: number;
  repeatV?: number;
  /** hole size relative to its cell (0..1) */
  holeSize?: number;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  side?: THREE.Side;
  /** bright stripe highlights running along v (tunnel light streaks) */
  streaks?: number;
  /** number of procedural lengthwise streaks around u (default 9) */
  streakCount?: number;
  /**
   * explicit slot half-size in CELL units [along u, along v] (overrides holeSize/slot); the cell is
   * 1/repeatU of the circumference by 1/repeatV along the tube, so world proportions follow from both
   */
  slotHalf?: [number, number];
  /** stagger every other slot row by half a cell (default true) */
  stagger?: boolean;
  /** pattern offset along v in cells (aligns slot rows between the ring bands) */
  offsetV?: number;
  /**
   * Washer-tube upgrade (05–07): pressed-metal corrugation + bevelled slot lips perturb the normal so
   * the glossy metal catches light around every slot (refs 05–07). Height amplitudes in world units.
   */
  relief?: { corrugation: number; bevel: number; bevelWidth?: number };
  /** emissive glow colour hugging every hole edge (refs: hot-pink glowing slot outlines) */
  rimColor?: THREE.ColorRepresentation;
  rimStrength?: number;
  /** warm "light at the end of the tunnel": emissive that grows with view distance */
  farGlow?: FarGlow;
  /** dedicated reflection environment (e.g. washerTubeEnv()) instead of scene.environment */
  envMap?: THREE.Texture | null;
  envMapIntensity?: number;
  /**
   * forced-perspective section (05 far tunnel): the geometry carries a per-vertex `fgExtra` attribute =
   * virtual minus real depth, so the distance glow / mid tint behave as if the tunnel ran on for hundreds
   * of units (see buildForcedTunnel in tube.ts)
   */
  virtualDepth?: boolean;
  /**
   * paint a far stream on the tunnel floor (forced-perspective section only): band centred on the
   * bottom (uv.x = 0.5), half width in uv.x, visible beyond `from` virtual units
   */
  river?: { halfWidth: number; from: number; core: THREE.ColorRepresentation; band: THREE.ColorRepresentation; foam: THREE.ColorRepresentation };
}

export interface FarGlow {
  color: THREE.ColorRepresentation; near: number; far: number; strength: number;
  /** optional mid-distance tint of the metal colour (refs: walls turn violet deeper in the tunnel) */
  mid?: { color: THREE.ColorRepresentation; near: number; far: number; amount: number };
}

/** GLSL for the distance glow, shared by the tube wall, rings and lids. With FG_VIRTUAL the distance is the
 *  forced-perspective (virtual) depth: real view distance + the per-vertex/per-instance `fgExtra`. */
const FAR_GLOW_PARS = `uniform vec3 uFarGlowColor; uniform vec3 uFarGlowRange; uniform vec3 uMidTint; uniform vec3 uMidRange;
#ifdef FG_VIRTUAL
varying float vFgExtra;
float fgDist(){ return length(vViewPosition) + vFgExtra; }
#else
float fgDist(){ return length(vViewPosition); }
#endif
float farGlowK(){ float k = smoothstep(uFarGlowRange.x, uFarGlowRange.y, fgDist()); return uFarGlowRange.z * k * k; }
float midTintK(){ return uMidRange.z * smoothstep(uMidRange.x, uMidRange.y, fgDist()); }`;
/** vertex side of FG_VIRTUAL: `fgExtra` is a plain attribute on tube geometry, an instanced one on rings/lids */
const FG_VIRTUAL_VERT_PARS = `#ifdef FG_VIRTUAL
attribute float fgExtra; varying float vFgExtra;
#endif`;
const FG_VIRTUAL_VERT = `#ifdef FG_VIRTUAL
vFgExtra = fgExtra;
#endif`;
/** `solid` = 0 inside perforation holes (they stay dark), 1 on metal */
const FAR_GLOW_APPLY = (solid = '1.0') => `{ float sol = ${solid}; float mt = midTintK() * sol; diffuseColor.rgb = mix(diffuseColor.rgb, uMidTint, mt); totalEmissiveRadiance *= 1.0 - mt * 0.5;
  float fg = farGlowK(); diffuseColor.rgb = mix(diffuseColor.rgb, uFarGlowColor, min(1.0, fg * 0.5) * sol); totalEmissiveRadiance += uFarGlowColor * fg * mix(0.35, 1.0, sol); }`;

function farGlowUniforms(g: FarGlow) {
  return {
    uFarGlowColor: { value: new THREE.Color(g.color) },
    uFarGlowRange: { value: new THREE.Vector3(g.near, g.far, g.strength) },
    uMidTint: { value: new THREE.Color(g.mid?.color ?? '#ffffff') },
    uMidRange: { value: new THREE.Vector3(g.mid?.near ?? 0, g.mid?.far ?? 1, g.mid?.amount ?? 0) },
  };
}

/**
 * Adds the warm distance glow to any MeshStandardMaterial (rings, lids). The far end of the tube melts
 * into a bright warm vanishing point like refs 05/07 without adding scene lights (mobile-friendly).
 */
export function withFarGlow<T extends THREE.MeshStandardMaterial>(mat: T, g: FarGlow, key: string, virtualDepth = false): T {
  const uniforms = farGlowUniforms(g);
  const prev = mat.onBeforeCompile;
  if (virtualDepth) mat.defines = { ...(mat.defines ?? {}), FG_VIRTUAL: '' };
  mat.onBeforeCompile = (shader, r) => {
    prev.call(mat, shader, r);
    Object.assign(shader.uniforms, uniforms);
    if (virtualDepth) {
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\n' + FG_VIRTUAL_VERT_PARS)
        .replace('#include <project_vertex>', '#include <project_vertex>\n' + FG_VIRTUAL_VERT);
    }
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + FAR_GLOW_PARS)
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
${FAR_GLOW_APPLY()}`,
      );
  };
  const prevKey = mat.customProgramCacheKey.bind(mat);
  mat.customProgramCacheKey = () => prevKey() + '|fg2-' + key + (virtualDepth ? '-v' : '');
  mat.userData.farGlow = uniforms;
  return mat;
}

/**
 * Analytic strip lights for the washer tubes (refs 05–07). Narrow light strips run the full length of
 * the tunnel at evenly spaced angles around its axis. Their radiance depends only on the azimuth of the
 * reflected view ray around the LOCAL tube axis, so (unlike a cube map, whose meridians pinch together
 * and blur at the pole every grazing wall reflection looks into) they stay crisp at any distance and
 * follow the tube through the 06 arch and the 07 plunge. The term is added to the IBL radiance, so the
 * normal PBR BRDF weights it: glossy magenta panels get lengthwise white-pink streaks, every gold band
 * gets evenly spaced "marquee" spots, and both line up radially like in the reference.
 * Axis source: 'attribute' = per-vertex `tubeAxis`/`tubeUp` (buildTubeGeometry({ axisAttr: true })),
 * 'instance' = local Z (axis) / local Y (up) of each instance matrix (rings, lids).
 */
export interface TubeStrips {
  count: number;
  /** angular half-width of one strip (radians, before roughness widening) */
  width: number;
  intensity: number;
  color: THREE.ColorRepresentation;
  /** brightness of every other strip (default 0.7) */
  alt?: number;
}

export function withTubeStrips<T extends THREE.MeshStandardMaterial>(mat: T, s: TubeStrips, source: 'attribute' | 'instance', key: string): T {
  const uniforms = {
    uStripColor: { value: new THREE.Color(s.color).multiplyScalar(s.intensity) },
    uStripP: { value: new THREE.Vector4(s.count, s.width, 0, s.alt ?? 0.7) },
  };
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    prev.call(mat, shader, r);
    Object.assign(shader.uniforms, uniforms);
    const axis = source === 'instance'
      ? `vTubeAxis = normalize((viewMatrix * modelMatrix * instanceMatrix * vec4(0.0, 0.0, 1.0, 0.0)).xyz);
vTubeUp = normalize((viewMatrix * modelMatrix * instanceMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);`
      : `vTubeAxis = normalize((viewMatrix * modelMatrix * vec4(tubeAxis, 0.0)).xyz);
vTubeUp = normalize((viewMatrix * modelMatrix * vec4(tubeUp, 0.0)).xyz);`;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
varying vec3 vTubeAxis; varying vec3 vTubeUp;
${source === 'attribute' ? 'attribute vec3 tubeAxis; attribute vec3 tubeUp;' : ''}`)
      .replace('#include <project_vertex>', `#include <project_vertex>
${axis}`);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
varying vec3 vTubeAxis; varying vec3 vTubeUp; uniform vec3 uStripColor; uniform vec4 uStripP;
vec3 tubeStripRadiance(vec3 V, vec3 N, float rough){
  vec3 R = reflect(-V, N);
  vec3 A = normalize(vTubeAxis);
  vec3 E1 = normalize(vTubeUp - A * dot(vTubeUp, A));
  vec3 E2 = cross(A, E1);
  vec3 P = R - A * dot(R, A);
  float pl = length(P);
  float t = atan(dot(P, E2), dot(P, E1)) * uStripP.x / 6.2831853; // strip index space
  float fw = min(fwidth(t), fwidth(fract(t + 0.5)));
  float w0 = uStripP.y * uStripP.x / 6.2831853;            // half-width in pitch units
  float w = w0 + rough * rough * 1.5 + fw * 0.6;
  float dA = fract(t + 0.5) - 0.5;
  float k = exp(-dA * dA / (w * w)) * mix(1.0, w0 / w, 0.75);
  k *= mod(floor(t + 0.5), 2.0) > 0.5 ? uStripP.w : 1.0;
  return uStripColor * k * smoothstep(0.02, 0.12, pl);
}`)
      .replace('#include <lights_fragment_maps>', `#include <lights_fragment_maps>
#if defined( RE_IndirectSpecular )
radiance += tubeStripRadiance(geometryViewDir, geometryNormal, material.roughness);
#endif`);
  };
  const prevKey = mat.customProgramCacheKey.bind(mat);
  mat.customProgramCacheKey = () => prevKey() + '|strips-' + source + '-' + key;
  mat.userData.tubeStrips = uniforms;
  return mat;
}

/** linear radiance for a stylised palette entry: the values are solved so that, after Neutral tone mapping
 *  (exposure 0.86), sRGB output and the grade pass (sat 1.36 / con 1.15), they land on the display colour
 *  sampled from the approved reference (comment = target display sRGB) */
const lin3 = (r: number, g: number, b: number) => new THREE.Vector3(r, g, b);

/**
 * Ref 05 ring look (wave 7): a stylised polished band instead of the env-map PBR result (which clipped to one
 * flat orange). The band profile (roundBandGeometry: main half-round band, groove, camera-side lip) is read
 * from the object-space axial coordinate, so every ring — near, real far, forced-perspective far — gets the
 * same cross-section: dark rose contour at both edges → rose-copper → orange line → peach-gold body → pale
 * white-yellow highlight line on the crown, a darker orange-copper groove, and a rose lip with a light crown.
 * Warm-white "marquee" spots sit at `count` fixed azimuths (top spot at 12 o'clock) so the spots of all rings
 * line up radially toward the VP like the reference. Deeper rings fade to rose-copper (ref rings #2/#3); the
 * FarGlow (if the material has one) then melts them into the warm throat. Measured reference cross-section
 * (ring #1, y 188→230 at x≈499): dark (161,32,91) · rose lip (219,96,104) · groove (202,67,51) · peach body
 * (241,154,124) with white spots · rose (206,96,104) · dark (122,30,84); side view (y≈450): orange (251,135,29)
 * then pale yellow crown (252,205,130).
 */
export interface BandShade {
  /** band profile (same numbers as the BandOpts given to bandGeometry) */
  width: number; lipWidth: number; groove: number;
  /** spots per turn, spot half-width (fraction of the pitch), spot strength */
  spots?: [number, number, number];
  /** view distance range over which the crown highlight fades to rose-copper (deeper rings) */
  fade?: [number, number];
}
export function withBandShading<T extends THREE.MeshStandardMaterial>(mat: T, b: BandShade, key: string): T {
  const w = (b.width + b.groove + b.lipWidth) / 2;
  const uniforms = {
    uBandG: { value: new THREE.Vector4(w - b.width / 2, b.width / 2, -w + b.lipWidth / 2, b.lipWidth / 2) },
    // ref ring #1: spot pitch ≈85 px at r 273 (≈20/turn), white core ≈12 px inside a yellow halo
    uBandS: { value: new THREE.Vector4(...(b.spots ?? [20, 0.055, 1.6]), 0) },
    uBandF: { value: new THREE.Vector2(...(b.fade ?? [44, 110])) },
    uBcDark: { value: lin3(0.2934, 0.0886, 0.1533) }, // (150,35,85)
    uBcRose: { value: lin3(0.5899, 0.2114, 0.2222) }, // (215,95,100)
    uBcOrange: { value: lin3(0.7352, 0.2871, 0.1269) }, // (240,120,40)
    uBcCrown: { value: lin3(0.6246, 0.22, 0.199) }, // (222,98,88) rose-gold body between the spots (ref (215–230,90–100,80–95))
    uBcPeak: { value: lin3(0.9077, 0.602, 0.3465) }, // (252,190,120) highlight line
    uBcHalo: { value: lin3(0.9439, 0.6846, 0.2725) }, // (255,205,90) yellow halo around each spot
    uBcGroove: { value: lin3(0.4938, 0.1484, 0.1192) }, // (200,70,50)
    uBcSpot: { value: lin3(1.6, 1.5, 1.3) }, // warm white, blooms a little
  };
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    prev.call(mat, shader, r);
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vBandP; varying vec3 vBandAx;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
vBandP = position;
#ifdef USE_INSTANCING
vBandAx = (viewMatrix * modelMatrix * instanceMatrix * vec4(0.0, 0.0, 1.0, 0.0)).xyz;
#else
vBandAx = (viewMatrix * modelMatrix * vec4(0.0, 0.0, 1.0, 0.0)).xyz;
#endif`);
    const fg = shader.fragmentShader.includes('float farGlowK()');
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `varying vec3 vBandP; varying vec3 vBandAx;
uniform vec4 uBandG; uniform vec4 uBandS; uniform vec2 uBandF;
uniform vec3 uBcDark; uniform vec3 uBcRose; uniform vec3 uBcOrange; uniform vec3 uBcCrown; uniform vec3 uBcPeak; uniform vec3 uBcGroove; uniform vec3 uBcSpot; uniform vec3 uBcHalo;
// The rider sees every band at a grazing angle, i.e. mostly its camera-facing flank: the colour therefore
// follows the view-space normal — facing (ndv) for body → orange line → rose → dark silhouette contour, the
// normal's axial component (nzv: -1 camera-facing base … 0 crown) for the highlight line — and the axial
// coordinate only for the thin dark contour lines where band and lip meet the wall and for the groove.
vec3 bandShade(float deep, vec3 N, vec3 V){
  float z = vBandP.z;
  float m = (z - uBandG.x) / uBandG.y;          // main band: -1 camera side … +1 far side
  float l = (z - uBandG.z) / uBandG.w;          // lip
  float fm = fwidth(m) + 1e-3, fl = fwidth(l) + 1e-3;
  // sign-robust: the forced-perspective rings are placed with a mirrored basis (inverted winding), so the
  // rendered side can face away; shade the camera-facing orientation of whatever side is drawn
  float nv = dot(N, V);
  float ndv = abs(nv);
  vec3 ax = normalize(vBandAx);
  ax *= sign(dot(ax, -V) + 1e-4);                // tube axis pointing away from the camera
  float nzv = dot(N * sign(nv + 1e-4), ax);      // -1 = flank facing the camera … 0 = crown
  vec3 body = mix(uBcCrown, mix(uBcRose * 1.12, uBcCrown, 0.3), deep);   // deeper rings: rose-copper body
  vec3 c = mix(uBcDark, uBcRose, smoothstep(0.03, 0.14, ndv));
  c = mix(c, uBcOrange, smoothstep(0.16, 0.26, ndv));
  c = mix(c, body, smoothstep(0.3, 0.46, ndv));
  float hl = exp(-pow((nzv + 0.8) / 0.07, 2.0)) * smoothstep(0.3, 0.5, ndv);
  c = mix(c, uBcPeak, hl * (0.95 - 0.6 * deep));
  c = mix(c, uBcDark, smoothstep(0.9, 1.0, abs(m)) * 0.85);           // contour where the band meets the wall
  vec3 cl = mix(uBcDark, mix(uBcRose, uBcCrown, 0.55 - 0.35 * deep), smoothstep(0.05, 0.3, ndv));
  cl = mix(cl, uBcDark, smoothstep(0.86, 1.0, abs(l)) * 0.85);
  float inMain = smoothstep(-1.0 - fm, -1.0 + fm, m);
  float inLip = 1.0 - smoothstep(1.0 - fl, 1.0 + fl, l);
  vec3 col = mix(uBcGroove, cl, inLip);
  col = mix(col, c, inMain);
  // marquee spots at fixed azimuths (12 o'clock = a spot): radial lines of spots into the VP
  float phi = atan(vBandP.y, vBandP.x);
  float t = (phi - 1.5707963) * uBandS.x / 6.2831853;
  float ft = min(fwidth(t), fwidth(fract(t + 0.5)));
  float d = fract(t + 0.5) - 0.5;
  float sw = uBandS.y + ft * 0.7, hw = uBandS.y * 3.0 + ft * 0.7;
  float sp = exp(-d * d / (sw * sw)) * mix(1.0, uBandS.y / sw, 0.6);
  float halo = exp(-d * d / (hw * hw));
  float across = inMain * smoothstep(0.25, 0.5, ndv) * (1.0 - smoothstep(0.93, 0.99, abs(m))) + inLip * (1.0 - inMain) * 0.4 * smoothstep(0.2, 0.4, ndv);
  col = mix(col, uBcHalo, halo * across * 0.8);
  col += uBcSpot * sp * across * uBandS.z * (1.0 - 0.4 * deep);
  return col;
}
void main() {`)
      .replace('#include <opaque_fragment>', `{
  float bDist = length(vViewPosition);
${fg ? '  bDist = fgDist();' : ''}
  vec3 bc = bandShade(smoothstep(uBandF.x, uBandF.y, bDist), normalize(normal), normalize(vViewPosition));
${fg ? `  float bfg = farGlowK(); float bmt = midTintK();
  bc = mix(bc, uFarGlowColor * 0.9, min(1.0, bfg * 0.55)) + uFarGlowColor * bfg * 0.25;` : ''}
  outgoingLight = bc;
}
#include <opaque_fragment>`);
  };
  const prevKey = mat.customProgramCacheKey.bind(mat);
  mat.customProgramCacheKey = () => prevKey() + '|band-' + key;
  mat.userData.bandShade = uniforms;
  return mat;
}

/**
 * Ref 05 wall lids (wave 7): stylised rose-copper half-disc pucks seen from below (reference L1/R1: rim
 * (229,91,93)…(246,130,114) with white vertical highlight streaks and a bright top edge line, a lighter
 * rose-peach underside with a thin orange contour). Regions come from the object-space normal of the lid
 * lathe (wallLidGeometry, half revolution toward +X, Y = top normal), the streaks from the lathe azimuth.
 */
export function withLidShading<T extends THREE.MeshStandardMaterial>(mat: T, key: string): T {
  const uniforms = {
    uLcRim: { value: lin3(0.612, 0.2117, 0.2013) }, // (220,95,90)
    uLcUnder: { value: lin3(0.7024, 0.2903, 0.2645) }, // (232,120,110) (ref L1 region mean (200,95,105); wave-7 it03 (230,137,142))
    uLcTop: { value: lin3(0.7971, 0.3659, 0.2802) }, // (245,140,110)
    uLcEdgeHi: { value: lin3(0.9686, 0.7531, 0.4015) }, // (255,215,130) bright yellow top edge
    uLcEdgeLo: { value: lin3(0.776, 0.3236, 0.1466) }, // (245,130,50) orange contour
    uLcDark: { value: lin3(0.2934, 0.0886, 0.1533) }, // (150,35,85)
    uLcSpot: { value: lin3(1.25, 1.0, 0.62) }, // warm yellow-white streak cores
  };
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    prev.call(mat, shader, r);
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLidP; varying vec3 vLidN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvLidP = position; vLidN = normal;');
    const fg = shader.fragmentShader.includes('float farGlowK()');
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `varying vec3 vLidP; varying vec3 vLidN;
uniform vec3 uLcRim; uniform vec3 uLcUnder; uniform vec3 uLcTop; uniform vec3 uLcEdgeHi; uniform vec3 uLcEdgeLo; uniform vec3 uLcDark; uniform vec3 uLcSpot;
vec3 lidShade(){
  vec3 n = normalize(vLidN);
  float ny = n.y;
  float th = atan(vLidP.x, vLidP.z);                 // 0..pi along the half disc
  float rr = length(vLidP.xz);
  // rim band with vertical highlight streaks (reflections of the tunnel strip lights)
  float st = pow(0.5 + 0.5 * cos(th * 7.0 - 0.6), 8.0);
  vec3 rim = uLcRim * (0.85 + 0.3 * sin(th * 2.0 + 0.4)) + uLcSpot * st * 1.1;
  // bright line along the upper rounded edge, orange contour along the lower one
  float hi = exp(-pow((ny - 0.55) / 0.22, 2.0));
  float lo = exp(-pow((ny + 0.5) / 0.2, 2.0));
  vec3 col = mix(rim, uLcEdgeHi, hi * 0.9);
  col = mix(col, uLcEdgeLo, lo * 0.8);
  // underside: lighter rose-peach with a darker recess ring
  float under = smoothstep(-0.6, -0.85, ny);
  vec3 uc = mix(uLcUnder, uLcRim * 0.85, exp(-pow((rr - 0.6) / 0.05, 2.0)) * 0.8);
  col = mix(col, uc, under);
  float top = smoothstep(0.75, 0.9, ny);
  col = mix(col, uLcTop + uLcSpot * 0.25 * st, top);
  // dark seam where the lid meets the wall
  col = mix(col, uLcDark, smoothstep(0.12, 0.0, th) * 0.6 + smoothstep(3.02, 3.14159, th) * 0.6);
  return col;
}
void main() {`)
      .replace('#include <opaque_fragment>', `{
  vec3 lc = lidShade();
${fg ? `  float lfg = farGlowK();
  lc = mix(lc, uFarGlowColor * 0.9, min(1.0, lfg * 0.55)) + uFarGlowColor * lfg * 0.25;` : ''}
  outgoingLight = lc;
}
#include <opaque_fragment>`);
  };
  const prevKey = mat.customProgramCacheKey.bind(mat);
  mat.customProgramCacheKey = () => prevKey() + '|lid-' + key;
  mat.userData.lidShade = uniforms;
  return mat;
}

export function perforatedMetal(o: PerforatedOptions = {}): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    color: o.color ?? '#d13fd6',
    metalness: o.metalness ?? 0.72,
    roughness: o.roughness ?? 0.26,
    emissive: new THREE.Color(o.emissive ?? '#9a1fa8'),
    emissiveIntensity: o.emissiveIntensity ?? 0.26,
    side: o.side ?? THREE.BackSide,
    envMapIntensity: o.envMapIntensity ?? 1.0,
  });
  if (o.envMap) mat.envMap = o.envMap;
  const relief = o.relief;
  // mean hole coverage of one cell (capsule area / cell area): sub-pixel slot rows fade to this instead
  // of aliasing into moiré stripes down the tunnel
  const hs = o.slotHalf ?? [((o.holeSize ?? 0.42) * ((o.slot ?? 1) ? 0.62 : 0.5)), ((o.holeSize ?? 0.42) * ((o.slot ?? 1) ? 0.24 : 0.5))];
  const rr = Math.min(hs[0], hs[1]);
  const holeCover = THREE.MathUtils.clamp(4 * hs[0] * hs[1] - (4 - Math.PI) * rr * rr, 0, 1);
  const river = o.river;
  const uniforms = {
    uHoleColor: { value: new THREE.Color(o.holeColor ?? '#2b0640') },
    uSlot: { value: o.slot ?? 1 },
    uRepeat: { value: new THREE.Vector2(o.repeatU ?? 64, o.repeatV ?? 1.2) },
    uHoleSize: { value: o.holeSize ?? 0.42 },
    uStreaks: { value: o.streaks ?? 0.35 },
    uStreakN: { value: o.streakCount ?? 9 },
    uSlotHalf: { value: new THREE.Vector2(o.slotHalf?.[0] ?? -1, o.slotHalf?.[1] ?? -1) },
    uStagger: { value: o.stagger === false ? 0 : 0.5 },
    uOffsetV: { value: o.offsetV ?? 0 },
    uRelief: { value: new THREE.Vector3(relief?.corrugation ?? 0, relief?.bevel ?? 0, relief?.bevelWidth ?? 0.09) },
    uRimColor: { value: new THREE.Color(o.rimColor ?? '#ffd1ff') },
    uRimStrength: { value: o.rimStrength ?? 0.55 },
    uHoleCover: { value: holeCover },
    uRiver: { value: new THREE.Vector2(river?.halfWidth ?? 0, river?.from ?? 0) },
    uRiverCore: { value: new THREE.Color(river?.core ?? '#000000') },
    uRiverBand: { value: new THREE.Color(river?.band ?? '#000000') },
    uRiverFoam: { value: new THREE.Color(river?.foam ?? '#000000') },
    ...(o.farGlow ? farGlowUniforms(o.farGlow) : {}),
  };
  const defines: Record<string, string> = {};
  if (relief) defines.PERF_RELIEF = '';
  if (o.farGlow) defines.PERF_FARGLOW = '';
  if (o.farGlow && o.virtualDepth) defines.FG_VIRTUAL = '';
  if (river && o.farGlow && o.virtualDepth) defines.PERF_RIVER = '';
  mat.defines = defines;
  mat.userData.perfUniforms = uniforms;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vPerfUv;\n' + FG_VIRTUAL_VERT_PARS)
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvPerfUv = uv;\n' + FG_VIRTUAL_VERT);
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec2 vPerfUv;
uniform vec3 uHoleColor; uniform float uSlot; uniform vec2 uRepeat; uniform float uHoleSize; uniform float uStreaks;
uniform vec3 uRelief; uniform vec3 uRimColor; uniform float uRimStrength; uniform float uStreakN; uniform vec2 uSlotHalf; uniform float uStagger; uniform float uOffsetV;
uniform float uHoleCover; uniform vec2 uRiver; uniform vec3 uRiverCore; uniform vec3 uRiverBand; uniform vec3 uRiverFoam;
#ifdef PERF_FARGLOW
${FAR_GLOW_PARS}
#endif
vec2 perfCell(vec2 uv){
  vec2 g = uv * uRepeat;
  g.y += uOffsetV;
  g.x += mod(floor(g.y), 2.0) * uStagger;   // staggered rows
  return g;
}
// signed distance to the slot/hole (cell units, <0 inside)
float perfSdf(vec2 g){
  vec2 f = fract(g) - 0.5;
  vec2 hs = uSlotHalf.x > 0.0 ? uSlotHalf : mix(vec2(uHoleSize*0.5), vec2(uHoleSize*0.62, uHoleSize*0.24), uSlot);
  vec2 q = abs(f) - hs + min(hs.x, hs.y);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - min(hs.x, hs.y);
}
float perfMask(vec2 uv, out float rim){
  vec2 g = perfCell(uv);
  vec2 f = fract(g) - 0.5;
  float d = perfSdf(g);
  float aa = fwidth(d) * 1.2 + 1e-4;
  rim = smoothstep(0.06, 0.0, abs(d - 0.02)) * step(0.0, f.y);  // light catching the lower lip
  return 1.0 - smoothstep(-aa, aa, d); // 1 inside hole
}
#ifdef PERF_RELIEF
// pressed-metal relief (world units): shallow grooves along each slot row, bevelled lips into every slot
float perfHeight(vec2 g){
  float fy = fract(g.y) - 0.5;
  float d = perfSdf(g);
  return -cos(6.2831853 * fy) * uRelief.x + (smoothstep(0.0, uRelief.z, d) - 1.0) * uRelief.y;
}
#endif`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
float perfRim; float perfHole = perfMask(vPerfUv, perfRim);
#ifdef PERF_RELIEF
{ // washer tubes: once a slot cell gets sub-pixel, settle to the mean coverage (no moiré down the tunnel)
  float cpx = length(fwidth(perfCell(vPerfUv)));
  perfHole = mix(perfHole, uHoleCover, smoothstep(0.3, 0.85, cpx));
  perfRim *= 1.0 - smoothstep(0.2, 0.6, cpx);
}
#endif
float streak = pow(0.5 + 0.5 * sin(vPerfUv.x * 6.2831 * uStreakN + 1.3), 18.0) * uStreaks;
diffuseColor.rgb = mix(diffuseColor.rgb * (1.0 + streak), uHoleColor, perfHole);`,
      )
      .replace(
        '#include <normal_fragment_maps>',
        `#include <normal_fragment_maps>
#ifdef PERF_RELIEF
{
  // analytic relief gradient in uv space → view space via the screen-derivative cotangent frame
  vec2 g = perfCell(vPerfUv);
  float e = 0.015;
  float h0 = perfHeight(g);
  vec2 dHdg = vec2(perfHeight(g + vec2(e, 0.0)) - h0, perfHeight(g + vec2(0.0, e)) - h0) / e;
  vec2 dHduv = dHdg * uRepeat;
  vec3 dp1 = dFdx(-vViewPosition), dp2 = dFdy(-vViewPosition);
  vec2 duv1 = dFdx(vPerfUv), duv2 = dFdy(vPerfUv);
  vec3 dp2perp = cross(dp2, normal), dp1perp = cross(normal, dp1);
  float det = dot(dp1, dp2perp);
  if (abs(det) > 1e-12) {
    vec3 gradU = (dp2perp * duv1.x + dp1perp * duv2.x) / det;
    vec3 gradV = (dp2perp * duv1.y + dp1perp * duv2.y) / det;
    // fade the relief out where the pattern gets sub-pixel (prevents sparkle in the distance)
    float px = max(length(fwidth(g)), 1e-4);
    float lod = 1.0 - smoothstep(0.18, 0.45, px);
    normal = normalize(normal - (dHduv.x * gradU + dHduv.y * gradV) * lod);
  }
}
#endif`,
      )
      .replace(
        '#include <metalnessmap_fragment>',
        `#include <metalnessmap_fragment>
metalnessFactor *= (1.0 - perfHole);`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `#include <roughnessmap_fragment>
roughnessFactor = mix(roughnessFactor, 0.9, perfHole);`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
totalEmissiveRadiance = totalEmissiveRadiance * (1.0 - perfHole) + uRimColor * perfRim * uRimStrength * (1.0 - perfHole) + vec3(1.0,0.9,1.0) * streak * 0.6;
#ifdef PERF_FARGLOW
${FAR_GLOW_APPLY('1.0 - perfHole')}
#endif
#ifdef PERF_RIVER
{ // far stream painted on the floor of the forced-perspective section: thin winding cyan core, hot-pink
  // bands, white foam lips, warming into the vanishing-point glow
  float du = vPerfUv.x - 0.5 - 0.022 * sin(vPerfUv.y * 0.045 + 1.1);
  float t = abs(du) / uRiver.x;
  float on = (1.0 - smoothstep(0.9, 1.0, t)) * smoothstep(uRiver.y, uRiver.y + 8.0, vPerfUv.y);
  vec3 rc = mix(uRiverCore, uRiverBand, smoothstep(0.3, 0.46, t));
  rc = mix(rc, uRiverFoam, smoothstep(0.72, 0.84, t));
  float rfg = farGlowK();
  rc = mix(rc, uFarGlowColor, min(0.85, rfg * 0.5));
  diffuseColor.rgb = mix(diffuseColor.rgb, rc * 0.35, on);
  metalnessFactor = mix(metalnessFactor, 0.0, on);
  roughnessFactor = mix(roughnessFactor, 0.3, on);
  totalEmissiveRadiance = mix(totalEmissiveRadiance, rc * 0.8, on);
}
#endif`,
      );
  };
  mat.customProgramCacheKey = () => 'perf-v4' + (relief ? '-r' : '') + (o.farGlow ? '-g' : '') + (o.farGlow && o.virtualDepth ? '-v' : '') + (river && o.farGlow && o.virtualDepth ? '-w' : '');
  return mat;
}

/**
 * Reflection environment for the washer tubes (05–07): an HDR cube of hot-pink / magenta / violet with
 * pink-white strip lights around the tube and a warm gold-white glow down the tunnel (-Z), so the glossy
 * walls read rich saturated magenta (the shared candy studio has a cyan panel that turned them sky-blue).
 * Built from half-float DataTextures; three converts it to PMREM on first use (no renderer needed here).
 */
const tubeEnvs: Partial<Record<'wall' | 'gold' | 'gold05', THREE.CubeTexture>> = {};
/** variant 'gold': same tunnel lighting seen by polished gold (warm-white strips, amber base) so rings and
 *  lids read clean orange-gold with yellow-white highlights instead of salmon (gold × magenta). */
export function washerTubeEnv(variant: 'wall' | 'gold' | 'gold05' = 'wall'): THREE.CubeTexture {
  const cached = tubeEnvs[variant];
  if (cached) return cached;
  const isGold = variant !== 'wall';
  const N = 128;
  const dir = new THREE.Vector3();
  const col = new THREE.Color();
  const faces: THREE.DataTexture[] = [];
  // cube face orientation (same convention as WebGL cube maps)
  const faceDir = (f: number, a: number, b: number) => {
    switch (f) {
      case 0: return dir.set(1, -b, -a);
      case 1: return dir.set(-1, -b, a);
      case 2: return dir.set(a, 1, b);
      case 3: return dir.set(a, -1, -b);
      case 4: return dir.set(a, -b, 1);
      default: return dir.set(-a, -b, -1);
    }
  };
  // Smooth base only: the strip lights are analytic (withTubeStrips), because grazing wall reflections all
  // look almost straight down the tunnel, where a cube map's meridian strips pinch together and blur.
  // gold (wave 4): warm yellow-white above (polished yellow-gold mids/highlights, ref #F4B70F…#FCE082),
  // copper only toward the floor (shadowed side); was amber 0.62/0.24/0.07 → saturated orange rings
  // 'gold05' (wave 5, 05 rings/lids only): brighter pale-yellow sky (ref highlights #FCE082) over a copper
  // floor, so the bands read yellow-gold with copper only on the shadowed side
  const cBaseTop = variant === 'gold05' ? new THREE.Color(0.95, 0.8, 0.4) : isGold ? new THREE.Color(0.78, 0.56, 0.24) : new THREE.Color(0.5, 0.04, 0.36);
  const cBaseLow = variant === 'gold05' ? new THREE.Color(0.36, 0.15, 0.05) : isGold ? new THREE.Color(0.26, 0.09, 0.04) : new THREE.Color(0.17, 0.035, 0.44);
  const copper05 = new THREE.Color(0.42, 0.15, 0.035);
  const radiance = (d: THREE.Vector3, out: THREE.Color) => {
    const up = d.y;
    if (variant === 'gold05') {
      // saturated gold all round (no dark gaps between the marquee spots), pale yellow toward the light at
      // the tunnel end (-Z), from above and back toward the rider (the camera-facing slope of every band),
      // copper only straight down: the shadowed lower side of each band
      const ahead = Math.max(0, -d.z), behind = Math.max(0, d.z);
      out.setRGB(0.88, 0.52, 0.1);
      const lift = Math.pow(ahead, 3) * 0.7 + Math.max(0, up) * 0.25 + Math.pow(behind, 2) * 0.3;
      // two sharp axis-symmetric light cones (≈57° and ≈53° off the tunnel axis): every band crown and its
      // thin lip reflect them as a continuous pale-yellow highlight line all the way round (double contour)
      const cone = 1.5 * Math.exp(-Math.pow((d.z - 0.55) / 0.07, 2)) + 1.1 * Math.exp(-Math.pow((d.z + 0.6) / 0.06, 2));
      out.r += 0.5 * lift + 0.95 * cone; out.g += 0.55 * lift + 0.85 * cone; out.b += 0.28 * lift + 0.45 * cone;
      out.lerp(copper05, 0.8 * THREE.MathUtils.smoothstep(-up, 0.45, 0.85));
      const hot = Math.pow(ahead, 60);
      out.r += 2.0 * hot; out.g += 1.85 * hot; out.b += 1.1 * hot;
      return out;
    }
    // base: magenta above, violet toward the floor
    out.copy(cBaseTop).lerp(cBaseLow, THREE.MathUtils.smoothstep(-up, -0.3, 0.9));
    // gold only: a warm yellow-white core at the very end of the tunnel (-Z) so far bands glow like the VP
    const ahead = Math.max(0, -d.z);
    if (isGold) {
      const hot = Math.pow(ahead, 60), wide = Math.pow(ahead, 6);
      out.r += 2.0 * hot + 0.16 * wide; out.g += 1.85 * hot + 0.12 * wide; out.b += 1.1 * hot + 0.04 * wide;
    } else {
      const wide = Math.pow(ahead, 6);
      out.r += 0.04 * wide; out.g += 0.015 * wide; out.b += 0.2 * wide; // violet haze down the tunnel
    }
    return out;
  };
  for (let f = 0; f < 6; f++) {
    const data = new Uint16Array(N * N * 4);
    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const a = ((x + 0.5) / N) * 2 - 1, b = ((y + 0.5) / N) * 2 - 1;
        radiance(faceDir(f, a, b).normalize(), col);
        const i = (y * N + x) * 4;
        data[i] = THREE.DataUtils.toHalfFloat(col.r);
        data[i + 1] = THREE.DataUtils.toHalfFloat(col.g);
        data[i + 2] = THREE.DataUtils.toHalfFloat(col.b);
        data[i + 3] = THREE.DataUtils.toHalfFloat(1);
      }
    }
    const t = new THREE.DataTexture(data, N, N, THREE.RGBAFormat, THREE.HalfFloatType);
    t.colorSpace = THREE.LinearSRGBColorSpace;
    t.needsUpdate = true;
    faces.push(t);
  }
  const cube = new THREE.CubeTexture(faces as unknown as HTMLImageElement[]);
  cube.type = THREE.HalfFloatType;
  cube.format = THREE.RGBAFormat;
  cube.colorSpace = THREE.LinearSRGBColorSpace;
  cube.minFilter = THREE.LinearFilter;
  cube.magFilter = THREE.LinearFilter;
  cube.generateMipmaps = false;
  cube.needsUpdate = true;
  tubeEnvs[variant] = cube;
  return cube;
}

/**
 * Ref 05 near gold frame (nearFrameGeometry in tube.ts): stylised polished gold bands. Corners (from the edge
 * toward the stream outward, reference row y 1330): broad white highlight · thin orange line · yellow-orange ·
 * orange with a pale striation, dark cut face; bottom lip (reference column x 432, top → down): pale edge ·
 * dark orange line · salmon with two white spots · orange · dark amber · rose. Colours solved through the
 * output pipeline like the band palette; a mild facing term keeps the half-round bulge readable.
 */
export function nearFrameMaterial(): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({ color: '#ffb347', metalness: 1, roughness: 0.2, side: THREE.DoubleSide, fog: false });
  mat.onBeforeCompile = (shader) => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float framePiece; varying vec2 vFrUv; varying float vFrPiece;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvFrUv = uv; vFrPiece = framePiece;');
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `varying vec2 vFrUv; varying float vFrPiece;
vec3 frameShade(float ndv){
  float u = vFrUv.x, v = vFrUv.y;
  vec3 c;
  if (vFrPiece < 0.5) {
    c = vec3(0.7669, 0.3044, 0.1155);                                                  // (245,125,30)
    c = mix(c, vec3(0.9079, 0.6239, 0.2219), 1.0 - smoothstep(0.3, 0.42, v));          // (252,195,72)
    c = mix(c, vec3(0.8461, 0.4509, 0.0961), exp(-pow((v - 0.16) / 0.025, 2.0)));      // thin orange line
    c = mix(c, vec3(1.2, 1.12, 0.98), 1.0 - smoothstep(0.07, 0.13, v));                // white highlight on the inner bevel
    c = mix(c, vec3(1.0, 0.82, 0.5), exp(-pow((v - 0.62) / 0.035, 2.0)) * 0.7);        // pale striation
    c = mix(c, vec3(0.4522, 0.1464, 0.0954), smoothstep(0.93, 1.0, v));                // outer contour
    c = mix(c, vec3(0.32, 0.09, 0.07), smoothstep(0.965, 0.995, u));                    // dark cut face
  } else {
    c = vec3(0.5533, 0.2056, 0.2503);                                                  // (207,93,113) rose
    c = mix(c, vec3(0.4522, 0.1464, 0.0954), 1.0 - smoothstep(0.6, 0.68, v));          // dark amber
    c = mix(c, vec3(0.6941, 0.2626, 0.1093), 1.0 - smoothstep(0.5, 0.57, v));          // orange
    c = mix(c, vec3(0.8453, 0.3825, 0.2436), 1.0 - smoothstep(0.42, 0.48, v));         // salmon
    c = mix(c, vec3(0.6052, 0.1934, 0.0783), 1.0 - smoothstep(0.09, 0.13, v));         // dark orange line
    c = mix(c, vec3(1.0514, 0.9607, 0.8204), 1.0 - smoothstep(0.02, 0.05, v));         // pale top edge
    float sp = exp(-pow((u - 0.36) / 0.022, 2.0)) + exp(-pow((u - 0.64) / 0.022, 2.0));
    c += vec3(1.3, 1.2, 1.0) * sp * smoothstep(0.1, 0.16, v) * (1.0 - smoothstep(0.36, 0.44, v));
  }
  return c * mix(0.78, 1.0, ndv);
}
void main() {`)
      .replace('#include <opaque_fragment>', `outgoingLight = frameShade(abs(dot(normalize(normal), normalize(vViewPosition))));
#include <opaque_fragment>`);
  };
  mat.customProgramCacheKey = () => 'near-frame-05-v1';
  return mat;
}

/**
 * "Light at the end of the tunnel" (ref 05): a warm radial glow filling the tube cross-section at the end
 * of the straight 05 current. Opaque yellow-white core → gold → warm magenta → transparent rim, HDR so the
 * core blooms a little. It fades with the CAMERA distance to its own centre: full beyond `fade.y`, gone
 * inside `fade.x` (the rider approaching 06 sees the arch hall open up) and again beyond `fade.w` (far
 * stages never see it). Unit circle in local XY, facing +Z.
 */
export function tunnelEndGlowMaterial(fade = new THREE.Vector4(14, 30, 95, 120)): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uFade: { value: fade },
      uOpacity: { value: 1 },
      // wave 7: smaller pale core inside an ORANGE halo (ref 05 VP: hot core ≈115 px², glow radius 13/20 px,
      // r 16–24 (248,169,89), r 24–32 (244,134,76); live was a 289 px² pale-yellow disc, r 16–24 (255,220,139))
      uCore: { value: new THREE.Color(3.0, 2.75, 2.1) },
      uGold: { value: new THREE.Color(1.6, 0.85, 0.32) },
      uWarm: { value: new THREE.Color(1.05, 0.42, 0.2) },
      uRim: { value: new THREE.Color(0.8, 0.3, 0.2) },
    },
    vertexShader: /* glsl */ `varying vec2 vUv; varying float vFade; uniform vec4 uFade;
      void main(){
        vUv = uv;
        float d = distance(cameraPosition, (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz);
        vFade = smoothstep(uFade.x, uFade.y, d) * (1.0 - smoothstep(uFade.z, uFade.w, d));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `varying vec2 vUv; varying float vFade; uniform vec3 uCore; uniform vec3 uGold; uniform vec3 uWarm; uniform vec3 uRim; uniform float uOpacity;
      void main(){
        float r = length(vUv - 0.5) * 2.0;
        vec3 c = mix(uRim, uWarm, smoothstep(1.0, 0.6, r));
        c = mix(c, uGold, smoothstep(0.62, 0.25, r));
        c = mix(c, uCore, smoothstep(0.34, 0.02, r));
        float a = (1.0 - smoothstep(0.82, 1.0, r)) * vFade * uOpacity;
        if (a < 0.003) discard;
        gl_FragColor = vec4(c, a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent: true,
    depthWrite: false,
    fog: false,
  });
}

/**
 * Far stream of the 05 forced-perspective tunnel (ForcedTunnel.chordGeometry): the water surface beyond
 * the real ribbon, seen only as a thin winding band toward the vanishing point — a cyan core meandering
 * between two hot-pink bands, blue edges, white foam lips, glossy flow streaks, warming into the VP glow
 * with the virtual depth (`fgExtra`). Unlit (it is tiny on screen); morph "open" handled by three.
 */
export function farRiverMaterial(glow: FarGlow): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false });
  const uniforms = {
    uRivCore: { value: new THREE.Color('#0aa2f6') },
    uRivBand: { value: new THREE.Color('#ee2fd8') },
    uRivEdge: { value: new THREE.Color('#1677e8') },
    uRivFoam: { value: new THREE.Color('#f4eeff') },
    uRivGlow: { value: new THREE.Color(glow.color) },
    uRivGlowR: { value: new THREE.Vector3(glow.near, glow.far, glow.strength) },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nattribute float fgExtra; varying float vRivDist; varying vec2 vRivUv;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvRivUv = uv;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvRivDist = length(mvPosition.xyz) + fgExtra;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
varying float vRivDist; varying vec2 vRivUv;
uniform vec3 uRivCore; uniform vec3 uRivBand; uniform vec3 uRivEdge; uniform vec3 uRivFoam; uniform vec3 uRivGlow; uniform vec3 uRivGlowR;`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{
  float x = vRivUv.x * 2.0 - 1.0;
  float u = vRivUv.y;
  float cx = 0.3 * sin(u * 0.09 + 0.6) * (1.0 - 0.5 * smoothstep(20.0, 80.0, u));            // the cyan core meanders (ref: S-bends to the VP)
  float t = abs(x - cx);
  vec3 col = uRivCore;
  col = mix(col, uRivBand, smoothstep(0.14, 0.22, t) * (1.0 - smoothstep(0.44, 0.52, t)));
  col = mix(col, uRivEdge, smoothstep(0.5, 0.6, t) * 0.6);
  float st = pow(0.5 + 0.5 * sin((x - cx) * 46.0), 12.0);   // flow lines along the stream
  col += vec3(0.6, 0.8, 1.0) * st * 0.15;
  // cloud-like foam banks on both sides (purple wall above them stays visible)
  float bump = 0.06 * sin(u * 1.3 + x * 7.0) * sin(u * 0.7 - x * 11.0);
  float foam = smoothstep(0.74 + bump, 0.84 + bump, abs(x));
  col = mix(col, uRivFoam * (0.86 + 0.14 * sin(u * 2.1 + x * 19.0)), foam);
  float fg = smoothstep(uRivGlowR.x, uRivGlowR.y, vRivDist);
  col = mix(col, uRivGlow, min(0.9, fg * fg * uRivGlowR.z));
  diffuseColor.rgb = col * 0.88;
}`);
  };
  mat.customProgramCacheKey = () => 'far-river-v4';
  return mat;
}

export function gold(opts: { roughness?: number; emissive?: number; color?: THREE.ColorRepresentation } = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: opts.color ?? '#ffcf4d',
    metalness: 1,
    roughness: opts.roughness ?? 0.2,
    emissive: new THREE.Color('#c98a00'),
    emissiveIntensity: opts.emissive ?? 0.38,
    envMapIntensity: 1.6,
  });
}

/** gold with ribbed "ring pipe" bands along v (scene 04 tunnel) */
export function goldRibbed(repeatV = 1.6): THREE.MeshStandardMaterial {
  const m = gold({ roughness: 0.18, emissive: 0.5 });
  m.side = THREE.BackSide;
  const uniforms = { uRibs: { value: repeatV } };
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vRibUv;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvRibUv = uv;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vRibUv; uniform float uRibs;')
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
float rp = fract(vRibUv.y * uRibs);
diffuseColor.rgb *= 0.72 + 0.42 * smoothstep(0.0, 0.5, rp) * smoothstep(1.0, 0.5, rp);`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
float edge = smoothstep(0.85, 1.0, fract(vRibUv.y * uRibs));
totalEmissiveRadiance += vec3(1.0, 0.86, 0.5) * edge * 0.9;`,
      );
  };
  m.customProgramCacheKey = () => 'goldrib-v1';
  return m;
}

export function chrome(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color: '#efe6ff', metalness: 1, roughness: 0.12, envMapIntensity: 1.5, emissive: '#3a2a55', emissiveIntensity: 0.25 });
}

export function glass(tint: THREE.ColorRepresentation = '#dfe9ff', opacity = 0.18): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: tint,
    metalness: 0,
    roughness: 0.04,
    transmission: 0,
    transparent: true,
    opacity,
    envMapIntensity: 2.2,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
}

/** soft unlit-ish painted material for the laundry room seen through doors (keeps it bright & airy) */
export function painted(color: THREE.ColorRepresentation, emissive = 0.2, roughness = 0.75): THREE.MeshStandardMaterial {
  const c = new THREE.Color(color);
  return new THREE.MeshStandardMaterial({ color: c, roughness, metalness: 0, emissive: c, emissiveIntensity: emissive });
}

/** canvas texture helper */
export function canvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void, srgb = true): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d')!, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}
