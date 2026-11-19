/**
 * Washer-world materials: procedural perforated magenta metal (round holes for drums, circumferential
 * slots for tunnels), thick reflective gold, chrome, glass — all PBR (MeshStandardMaterial) so they pick
 * up the candy PMREM environment, with shader patches for the perforations and glow.
 */
import * as THREE from 'three';
import { WATER05 } from '../vfx/waterRibbon'; // Screen 05 water test W10 (?water05=1): far river look only

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
  /** orientation of `envMap` (e.g. marblePanoRotation05 for the Marble panorama) */
  envMapRotation?: THREE.Euler;
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
  /** optional per-channel tone exponents on the final band colour (linear): >1 deepens mid-tones, highlights stay
   *  bright. Screen 05 test G1 (?gold05=1); undefined = shader unchanged */
  tone?: [number, number, number];
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
    uBcGroove: { value: lin3(0.5618, 0.1695, 0.1159) }, // (214,79,44) orange-red groove line (ref ring #1 top y 200–202)
    uBcSpot: { value: lin3(1.6, 1.5, 1.3) }, // warm white, blooms a little
    // wave 8: the rings READ gold because their sides are a broad pale-yellow crown between saturated orange
    // lines (ref ring #2 left side, x 199→239: dark · peach-orange lip (245,115,80) · orange-red line (234,89,4)
    // · pale yellow (252,206,130) with white maxima · orange (246,151,70) · peach); only the near top arc
    // (ring #1, ≈11–1 o'clock) is rose-red between big white spots
    uBcPale: { value: lin3(0.931, 0.6926, 0.3911) }, // (252,206,130)
    uBcGold: { value: lin3(0.8111, 0.4073, 0.193) }, // (246,151,70)
    uBcLine: { value: lin3(0.6601, 0.1926, 0.0761) }, // (234,89,4)
    uBcLipS: { value: lin3(0.7599, 0.2745, 0.1948) }, // (245,115,80)
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
uniform vec3 uBcPale; uniform vec3 uBcGold; uniform vec3 uBcLine; uniform vec3 uBcLipS;
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
  // wave 8: only the near top arc (±30°, gone by ±55°) keeps the rose-red body of ref ring #1's top; the sides
  // and the deeper rings read gold: pale-yellow crown framed by orange (ref ring #2/#3 sides)
  float topArc = (1.0 - smoothstep(0.52, 0.96, abs(atan(vBandP.y, vBandP.x) - 1.5707963))) * (1.0 - deep);
  vec3 body = mix(mix(uBcGold, uBcPale, smoothstep(0.42, 0.62, ndv)), uBcCrown, topArc);
  body = mix(body, mix(uBcOrange, uBcGold, 0.5), deep * 0.55);      // deeper rings: orange with bright spots
  vec3 c = mix(uBcDark, mix(uBcLipS, uBcRose, topArc), smoothstep(0.03, 0.12, ndv));
  c = mix(c, uBcOrange, smoothstep(0.13, 0.22, ndv));
  c = mix(c, body, smoothstep(0.26, 0.4, ndv));
  float hl = exp(-pow((nzv + 0.8) / 0.07, 2.0)) * smoothstep(0.3, 0.5, ndv);
  c = mix(c, uBcPeak, hl * (0.95 - 0.6 * deep) * (0.35 + 0.65 * topArc));
  // saturated orange-red line just inside the camera-side edge (ref: between the lip and the body)
  c = mix(c, mix(uBcLine, uBcGroove, topArc), exp(-pow((m + 0.84) / 0.07, 2.0)) * 0.9);
  c = mix(c, uBcDark, smoothstep(0.9, 1.0, abs(m)) * 0.85);           // contour where the band meets the wall
  vec3 cl = mix(uBcDark, mix(uBcLipS, mix(uBcRose, uBcCrown, 0.55), topArc), smoothstep(0.05, 0.3, ndv));
  cl = mix(cl, uBcPeak, exp(-pow((l + 0.3) / 0.22, 2.0)) * 0.55 * smoothstep(0.3, 0.6, ndv));   // light line on the lip
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
${b.tone ? `  bc = pow(clamp(bc, 0.0, 1.0), vec3(${b.tone.map((x) => x.toFixed(3)).join(', ')})) + max(bc - 1.0, vec3(0.0));` : ''}
${fg ? `  float bfg = farGlowK(); float bmt = midTintK();
  bc = mix(bc, uFarGlowColor * 0.9, min(1.0, bfg * 0.55)) + uFarGlowColor * bfg * 0.25;` : ''}
  outgoingLight = bc;
}
#include <opaque_fragment>`);
  };
  const prevKey = mat.customProgramCacheKey.bind(mat);
  mat.customProgramCacheKey = () => prevKey() + '|band-' + key + (b.tone ? '-tone' : '');
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
  // wave 8 palette, sampled on ref L1 (x 100 / 140 / 175, y 318 → 422): the near end of the rim is saturated
  // orange (250,119,38), the middle runs peach top edge (254,133,115) → orange-gold (252,165,95) → pale yellow
  // (249,205,112) → white (254,245,200) low on the bulge → pale orange (249,184,115) → orange-red bottom edge
  // (228,83,88), the tip side is peach (252,145,110); the underside below is DARK plum (150,40,92)…(175,58,100)
  // (wave 7 painted it lighter than the rim — inverted)
  const uniforms = {
    uLcRim: { value: lin3(0.7866, 0.2857, 0.1249) }, // (250,119,38) saturated orange (near end)
    uLcUnder: { value: lin3(0.298, 0.0954, 0.168) }, // (150,40,92) dark plum underside
    uLcTop: { value: lin3(0.838, 0.3415, 0.2905) }, // (254,133,115) peach upper edge / top
    uLcEdgeHi: { value: lin3(1.0471, 0.9918, 0.7441) }, // (254,245,200) white highlight low on the bulge
    uLcEdgeLo: { value: lin3(0.6355, 0.1828, 0.1922) }, // (228,83,88) orange-red bottom edge
    uLcDark: { value: lin3(0.2934, 0.0886, 0.1533) }, // (150,35,85)
    uLcSpot: { value: lin3(1.25, 1.0, 0.62) }, // warm yellow-white streak cores
    uLcGold: { value: lin3(0.8678, 0.4731, 0.2587) }, // (252,165,95)
    uLcPale: { value: lin3(0.9089, 0.6835, 0.3326) }, // (249,205,112)
    uLcPaleO: { value: lin3(0.8796, 0.5677, 0.3258) }, // (249,184,115)
    uLcPeach: { value: lin3(0.8423, 0.3875, 0.2847) }, // (252,145,110) tip side
    uLcRecess: { value: lin3(0.3927, 0.1254, 0.1958) }, // (175,58,100)
  };
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    prev.call(mat, shader, r);
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vLidP; varying vec3 vLidN; varying float vLidZv;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
vLidP = position; vLidN = normal;
#ifdef USE_INSTANCING
vLidZv = (viewMatrix * modelMatrix * instanceMatrix * vec4(0.0, 0.0, 1.0, 0.0)).z;
#else
vLidZv = (viewMatrix * modelMatrix * vec4(0.0, 0.0, 1.0, 0.0)).z;
#endif`);
    const fg = shader.fragmentShader.includes('float farGlowK()');
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `varying vec3 vLidP; varying vec3 vLidN; varying float vLidZv;
uniform vec3 uLcRim; uniform vec3 uLcUnder; uniform vec3 uLcTop; uniform vec3 uLcEdgeHi; uniform vec3 uLcEdgeLo; uniform vec3 uLcDark; uniform vec3 uLcSpot;
uniform vec3 uLcGold; uniform vec3 uLcPale; uniform vec3 uLcPaleO; uniform vec3 uLcPeach; uniform vec3 uLcRecess;
vec3 lidShade(){
  vec3 n = normalize(vLidN);
  float ny = n.y;                                    // barrel rim: ≈+0.45 upper bulge … −0.45 lower bulge, ±0.8 edges
  float th0 = atan(vLidP.x, vLidP.z);                // 0..pi along the half disc (lathe azimuth)
  // the lid's local Z points back toward the rider on one wall and away on the other: measure th from the end
  // nearest the camera (view-space +z = toward the camera)
  float th = vLidZv > 0.0 ? th0 : 3.14159265 - th0;  // 0 = end nearest the rider … pi/2 tip … pi far end
  float rr = length(vLidP.xz);
  // convex rim band, top edge → bottom edge: peach · orange-gold · pale yellow · white · pale orange · orange-red
  vec3 band = mix(uLcEdgeLo, uLcPaleO, smoothstep(-0.62, -0.42, ny));
  band = mix(band, uLcEdgeHi, smoothstep(-0.42, -0.24, ny) * (1.0 - smoothstep(-0.16, 0.02, ny)));
  band = mix(band, uLcPale, smoothstep(-0.16, 0.02, ny));
  band = mix(band, uLcGold, smoothstep(0.02, 0.26, ny));
  band = mix(band, uLcTop, smoothstep(0.32, 0.6, ny));
  // along the rim: saturated orange at the near end (no highlight there), peach toward the tip
  float nearEnd = 1.0 - smoothstep(0.25, 0.75, th);
  vec3 endCol = mix(uLcRim, uLcEdgeLo, smoothstep(-0.35, -0.6, ny));
  band = mix(band, endCol, nearEnd * 0.85);
  band = mix(band, mix(uLcPeach, band, 0.35), smoothstep(1.15, 1.6, th) * (1.0 - smoothstep(-0.4, -0.2, ny) * 0.5));
  // a few soft vertical streaks (strip-light reflections) across the band
  float st = pow(0.5 + 0.5 * cos(th * 6.0 - 1.4), 10.0) * (1.0 - nearEnd);
  band += uLcSpot * st * 0.35 * (1.0 - smoothstep(0.5, 0.75, abs(ny)));
  // dark plum underside with a slightly lighter recess ring, top: peach-gold
  vec3 uc = mix(uLcUnder, uLcRecess, exp(-pow((rr - 0.6) / 0.07, 2.0)));
  vec3 col = mix(band, uc, smoothstep(-0.72, -0.9, ny));
  col = mix(col, mix(uLcTop, uLcGold, 0.4), smoothstep(0.8, 0.92, ny));
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
  if (o.envMapRotation) mat.envMapRotation.copy(o.envMapRotation);
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
 * Wave 8 (user request): the Marble (World Labs) full-quality world generated from the approved 05 image, used
 * as the REFLECTION source of the 05 tunnel metal only. Runtime copy `assets/textures/marble05_env_1024.jpg`
 * (183 KB) = `qa/worldlabs/05/pilot/full/pano.png` (4608×2304) downsampled to 1024×512, with the hemisphere
 * below the vanishing-point row (row 234) replaced by a mirror of the one above it, so the glossy walls reflect
 * the pano's pink-magenta perforated walls, warm ring lights and the VP glow, never its cyan river floor.
 * three converts the equirect texture to a PMREM on first use (Equirectangular mapping on a standard
 * material); until the image has loaded the material simply renders without it.
 */
let marbleEnv05: THREE.Texture | null = null;
export function marblePano05(): THREE.Texture {
  if (marbleEnv05) return marbleEnv05;
  // three's UUIDs draw on Math.random: keep the global sequence untouched so the random canvas textures built
  // later (08 laundry room, pour streams) stay pixel-identical, and give the texture a fixed uuid instead
  const rnd = Math.random;
  Math.random = () => 0.5;
  let t: THREE.Texture;
  try {
    t = new THREE.TextureLoader().load(new URL('../../assets/textures/marble05_env_1024.jpg', import.meta.url).href);
  } finally {
    Math.random = rnd;
  }
  t.uuid = 'marble05-env-1024';
  t.mapping = THREE.EquirectangularReflectionMapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.name = 'marble05_env';
  marbleEnv05 = t;
  return t;
}
/** envMapRotation that puts the pano's vanishing point (u 0.514, v 0.542 in three's equirect uv) on the
 *  tunnel direction `tan` (and the pano's up on world up) */
export function marblePanoRotation05(tan: THREE.Vector3): THREE.Euler {
  const az = (0.514 - 0.5) * Math.PI * 2, el = (0.542 - 0.5) * Math.PI;
  const P = new THREE.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  const basis = (f: THREE.Vector3) => {
    const u = new THREE.Vector3(0, 1, 0).addScaledVector(f, -f.y).normalize();
    return new THREE.Matrix4().makeBasis(f.clone().normalize(), u, new THREE.Vector3().crossVectors(f, u).normalize());
  };
  const W = basis(tan), Q = basis(P);
  const M = Q.multiply(W.transpose()); // world direction → pano lookup direction
  const e = new THREE.Euler().setFromRotationMatrix(M, 'XYZ');
  // three applies makeRotationFromEuler(−rotation) to the lookup vector (WebGLMaterials, PMREM env)
  return new THREE.Euler(-e.x, -e.y, -e.z, 'XYZ');
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
      // wave 8: the reference VP is a larger white-gold light (radial means about (499,478): r 0–8 (252,248,211),
      // 8–16 (250,220,141), 16–24 (248,175,97), 24–32 (244,140,83), 32–48 (229,112,85)); live it06 went
      // white → (255,191,106) → (255,155,81) within 16 px. Disc ≈40 px radius at the checkpoint: white core to
      // ≈0.3 R, pale yellow, yellow-orange, orange, red-orange rim (display values solved through the pipeline)
      uCore: { value: new THREE.Color(3.0, 2.75, 2.1) },
      uPale: { value: new THREE.Color(0.95, 0.8, 0.45) }, // (250,220,141)
      uGold: { value: new THREE.Color(0.8587, 0.5199, 0.2695) }, // (248,175,97)
      uWarm: { value: new THREE.Color(0.7872, 0.3634, 0.2143) }, // (244,140,83)
      uRim: { value: new THREE.Color(0.6738, 0.2623, 0.2011) }, // (229,112,85)
    },
    vertexShader: /* glsl */ `varying vec2 vUv; varying float vFade; uniform vec4 uFade;
      void main(){
        vUv = uv;
        float d = distance(cameraPosition, (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz);
        vFade = smoothstep(uFade.x, uFade.y, d) * (1.0 - smoothstep(uFade.z, uFade.w, d));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `varying vec2 vUv; varying float vFade; uniform vec3 uCore; uniform vec3 uPale; uniform vec3 uGold; uniform vec3 uWarm; uniform vec3 uRim; uniform float uOpacity;
      void main(){
        float r = length(vUv - 0.5) * 2.0;
        vec3 c = mix(uRim, uWarm, smoothstep(0.95, 0.72, r));
        c = mix(c, uGold, smoothstep(0.72, 0.5, r));
        c = mix(c, uPale, smoothstep(0.52, 0.32, r));
        c = mix(c, uCore, smoothstep(0.34, 0.14, r));
        float a = (1.0 - smoothstep(0.86, 1.0, r)) * vFade * uOpacity;
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
 * Far stream of the 05 forced-perspective tunnel (far05.ts farRiverGeometry, wave 8): the water surface beyond
 * the real ribbon, laid out by the real ribbon's own band rules (per-row attributes aRivA/aRivB: route centre,
 * half width, pink band centres/widths, cyan core), so the cyan core and its two hot-pink bands keep WINDING
 * into the vanishing point (ref 05) instead of running straight (the old chord read as Screen 06). Flow lines
 * follow the winding core; fine lavender/blue-shaded foam rims along both banks; beyond the rim (inner bank of
 * a far bend) the fragment is dropped so the far wall shows down to the foam, as in the ref. Warms into the VP
 * glow with the virtual depth (`fgExtra`). Unlit (it is small on screen); morph "open" handled by three.
 */
export function farRiverMaterial(glow: FarGlow): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({ color: '#ffffff', fog: false });
  // wins the depth test against the real ribbon's continuation it covers just behind the seam
  mat.polygonOffset = true;
  mat.polygonOffsetFactor = -1;
  mat.polygonOffsetUnits = -2;
  const lin = (r: number, g: number, b: number) => new THREE.Color().setRGB(r, g, b, THREE.LinearSRGBColorSpace);
  const uniforms = {
    uRivCyanLo: { value: lin(0.02, 0.22, 0.62) },
    uRivCyan: { value: lin(0.03, 0.42, 0.95) },
    uRivCyanHi: { value: lin(0.25, 0.95, 1.6) },
    uRivPinkLo: { value: lin(0.45, 0.03, 0.42) },
    uRivPink: { value: lin(0.85, 0.07, 0.75) },
    uRivPinkHi: { value: lin(1.05, 0.42, 1.0) },
    uRivFoam: { value: lin(0.95, 0.92, 1.05) },
    uRivFoamLav: { value: lin(0.62, 0.52, 0.95) },
    uRivFoamBlue: { value: lin(0.32, 0.36, 0.9) },
    uRivGlow: { value: new THREE.Color(glow.color) },
    uRivGlowR: { value: new THREE.Vector3(glow.near, glow.far, glow.strength) },
  };
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>
attribute float fgExtra; attribute float aRivLat; attribute vec4 aRivA; attribute vec4 aRivB;
varying float vRivDist; varying vec2 vRivUv; varying float vRivLat; varying vec4 vRivA; varying vec4 vRivB;`)
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvRivUv = uv; vRivLat = aRivLat; vRivA = aRivA; vRivB = aRivB;')
      .replace('#include <project_vertex>', '#include <project_vertex>\nvRivDist = length(mvPosition.xyz) + fgExtra;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', `#include <common>
varying float vRivDist; varying vec2 vRivUv; varying float vRivLat; varying vec4 vRivA; varying vec4 vRivB;
uniform vec3 uRivCyanLo; uniform vec3 uRivCyan; uniform vec3 uRivCyanHi; uniform vec3 uRivPinkLo; uniform vec3 uRivPink; uniform vec3 uRivPinkHi;
uniform vec3 uRivFoam; uniform vec3 uRivFoamLav; uniform vec3 uRivFoamBlue; uniform vec3 uRivGlow; uniform vec3 uRivGlowR;
float rivHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float rivNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p); vec2 w = f * f * (3.0 - 2.0 * f);
  return mix(mix(rivHash(i), rivHash(i + vec2(1.0, 0.0)), w.x), mix(rivHash(i + vec2(0.0, 1.0)), rivHash(i + vec2(1.0, 1.0)), w.x), w.y);
}
float rivCells(vec2 p) {
  vec2 i = floor(p), f = fract(p); float d = 1.5;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec2 g = vec2(float(x), float(y));
    vec2 o = vec2(rivHash(i + g), rivHash(i + g + 19.7));
    d = min(d, length(g + o - f));
  }
  return d;
}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
{
  float lat = vRivLat;                                   // units from the tunnel axis (+ right)
  float xB = vRivA.x, hw = vRivA.y, cL = vRivA.z, cR = vRivA.w;
  float wL = vRivB.x, wR = vRivB.y, core = vRivB.z, Zv = vRivB.w;
  float s = vRivUv.y;                                    // virtual arc length (continues the real s)
  float fl = fwidth(lat) + 1e-4;
  float aaw = fl * 0.85 + 0.004;
  float e = abs(lat - xB) - hw;                          // > 0 outside the water body
  float bankN = (rivNoise(vec2(s * 0.9, sign(lat - xB) * 7.0 + lat * 1.3)) - 0.5) * 0.3;
  // beyond the foam rim (inner bank of a far bend) the far wall shows down to the foam (ref 05); right behind
  // the seam the surface covers the whole floor (the real ribbon's continuation lies under it)
  float bankW = mix(9.0, 1.3, smoothstep(10.0, 22.0, Zv));
  if (e > bankW + bankN * 2.0) discard;
#ifdef WATER05
  // ---- W10 (?water05=1): the near ribbon's approved-image palette and hue ramp (waterRibbon.ts W5_*): electric cyan
  // core with flow-aligned brushed streaks and aqua cores, hot-pink satin bands ramping through violet / periwinkle,
  // deep blue-violet water toward the banks, bubbly foam rims (no flat lavender sheet right behind the seam) ----
  vec3 C_DEEP2 = vec3(0.062, 0.290, 0.572), C_MID = vec3(0.066, 0.424, 0.747), C_BRIGHT = vec3(0.088, 0.567, 0.825);
  vec3 C_AQUA = vec3(0.142, 0.787, 0.882), C_AQUAW = vec3(0.39, 0.942, 0.947);
  vec3 P_DEEP = vec3(0.465, 0.086, 0.376), P_BODY = vec3(0.698, 0.112, 0.545), P_LIGHT = vec3(0.779, 0.204, 0.769);
  vec3 P_PALE = vec3(0.835, 0.534, 0.872);
  vec3 V_IN = vec3(0.372, 0.170, 0.625), V_PERI = vec3(0.311, 0.252, 0.740), V_BLUE = vec3(0.168, 0.427, 0.795);
  vec3 V_OUT = vec3(0.381, 0.185, 0.674), O_BLUE = vec3(0.211, 0.256, 0.715), O_DEEP = vec3(0.161, 0.316, 0.700);
  float xq = lat - core;
  float fsv = fwidth(s) + 1e-4;
  // brushed streaks along the winding core: 2 octaves, each faded before its cells drop under ≈4 px across / along
  float a1 = 1.0 - smoothstep(0.12, 0.28, max(fl * 3.0, fsv * 0.02 * 2.0));
  float a2 = 1.0 - smoothstep(0.12, 0.28, max(fl * 6.6, fsv * 0.034 * 2.0));
  float n1 = rivNoise(vec2(xq * 3.0 + 1.7, s * 0.02));
  float n2 = rivNoise(vec2(xq * 6.6 + 7.1, s * 0.034 + 3.7));
  float brv = clamp(0.5 + ((n1 - 0.5) * a1 + (n2 - 0.5) * a2 * 0.8) * 1.1, 0.0, 1.0);
  float bco = max(smoothstep(0.62, 0.88, n1) * a1 * 0.55, smoothstep(0.7, 0.88, n2) * a2);
  // band coordinate of the nearer band: -1 bank-side edge .. +1 core-side edge
  float tLb = (lat - cL) / max(wL, 1e-3), tRb = (cR - lat) / max(wR, 1e-3);
  float tb = abs(tLb) < abs(tRb) ? tLb : tRb;
  tb += (brv - 0.5) * 0.3 * a1;
  float at = abs(tb);
  float h5 = clamp(0.5 + (brv - 0.5) * 0.9, 0.0, 1.0);
  vec3 cy = mix(C_DEEP2, C_MID, smoothstep(0.1, 0.45, h5));
  cy = mix(cy, C_BRIGHT, smoothstep(0.5, 0.78, h5) * 0.85);
  cy = mix(cy, C_AQUAW, bco * 0.8);
  vec3 ow = mix(O_DEEP * 0.82, O_BLUE, smoothstep(0.3, 0.75, h5));
  vec3 pk = mix(P_DEEP, P_BODY, smoothstep(0.1, 0.45, h5));
  pk = mix(pk, P_LIGHT, exp(-pow((tb - 0.45) / 0.2, 2.0)) * 0.35);
  pk = mix(pk, P_PALE, bco * 0.75);
  pk = mix(pk, P_DEEP, smoothstep(-0.2, -0.85, tb) * 0.35);
  vec3 col;
  if (tb >= 0.0) {
    col = mix(pk, V_IN, smoothstep(0.8, 1.0, at));
    col = mix(col, V_PERI, smoothstep(0.98, 1.1, at));
    col = mix(col, V_BLUE, smoothstep(1.08, 1.2, at));
    col = mix(col, cy, smoothstep(1.17, 1.35, at));
  } else {
    col = mix(pk, V_OUT, smoothstep(0.8, 1.0, at));
    col = mix(col, O_BLUE, smoothstep(1.0, 1.15, at));
    col = mix(col, ow, smoothstep(1.12, 1.3, at));
  }
  // (it03) beyond the bank the floor reads as deep violet water, not as a flat pale foam sheet (the lavender wedge
  // left of the seam); only a narrow bubbly foam rim (puff cells ≥ ≈6 px, lavender / blue shading) lines each bank
  col = mix(col, O_DEEP * 0.6 + V_OUT * 0.25, smoothstep(0.15, 0.6, e));
  float foamIn = smoothstep(-0.42, -0.12, e + bankN) * (1.0 - smoothstep(0.25, 0.55, e + bankN));
  if (foamIn > 0.0) {
    float c = rivCells(vec2(lat * 2.4, s * 0.9 + lat * 0.7));
    float c2 = rivCells(vec2(lat * 5.0 + 3.1, s * 1.9 - lat * 0.5));
    float cf = 1.0 - smoothstep(0.08, 0.22, fl * 2.4);
    float cf2 = 1.0 - smoothstep(0.08, 0.22, fl * 5.0);
    float puff = mix(0.55, 1.0 - smoothstep(0.2, 0.85, c), cf);
    vec3 fo = mix(uRivFoamLav * 0.8, uRivFoam, puff);
    fo = mix(fo, uRivFoamBlue, (1.0 - smoothstep(0.05, 0.25, c2)) * cf2 * 0.6);
    col = mix(col, fo, foamIn);
  }
#else
  // ---- water: cyan core between two hot-pink bands, flow lines that follow the winding core ----
  float xq = lat - core;
  float dL = abs(lat - cL), dR = abs(lat - cR);
  float pL = 1.0 - smoothstep(wL - aaw, wL + aaw, dL);
  float pR = 1.0 - smoothstep(wR - aaw, wR + aaw, dR);
  float pink = max(pL, pR);
  float relB = pL >= pR ? (lat - cL) / max(wL, 1e-3) : (cR - lat) / max(wR, 1e-3);   // +1 on the core side
  // two octaves of flow lines along the winding core (fine near the seam, coarse further in), each faded out
  // where its spacing drops below a few px so the far water never shimmers
  float fade = 1.0 - smoothstep(0.05, 0.16, fl * 3.0);
  float fade2 = 1.0 - smoothstep(0.1, 0.3, fl * 1.1);
  float dn = rivNoise(vec2(xq * 3.2, s * 0.32));
  float dn2 = rivNoise(vec2(xq * 1.2 + 4.0, s * 0.11));
  float lines = pow(0.5 + 0.5 * sin(xq * 11.0 + 1.4 * sin(s * 0.23)), 8.0) * fade;
  float lines2 = pow(0.5 + 0.5 * sin(xq * 3.6 + 0.9 * sin(s * 0.09 + 1.0)), 10.0) * fade2 * smoothstep(0.3, 0.7, dn2);
  vec3 cy = mix(uRivCyanLo, uRivCyan, smoothstep(0.15, 0.75, mix(mix(0.55, dn2, fade2), dn, fade)));
  cy = mix(cy, uRivCyanHi, clamp(lines * smoothstep(0.35, 0.8, dn) * 0.85 + lines2 * 0.75, 0.0, 1.0));
  lines = max(lines, lines2);
  float rimOut = (1.0 - pink) * max(1.0 - smoothstep(wL, wL + 0.3, dL), 1.0 - smoothstep(wR, wR + 0.3, dR));
  cy = mix(cy, uRivCyanHi, rimOut * 0.45);
  float satin = exp(-pow((relB - 0.3) * 2.2, 2.0));
  vec3 pk = mix(uRivPinkLo, uRivPink, smoothstep(-0.95, -0.2, relB));
  pk = mix(pk, uRivPinkHi, clamp(satin * 0.5 + lines * 0.35, 0.0, 1.0));
  vec3 col = mix(cy, pk, pink);
  // ---- foam rims: fine bubbles, white tops, lavender / blue shading (low: the banks barely rise) ----
  float foamIn = smoothstep(-0.3, -0.04, e + bankN);
  if (foamIn > 0.0) {
    float c = rivCells(vec2(lat * 5.5, s * 2.4 + lat * 0.7));
    float cf = 1.0 - smoothstep(0.08, 0.22, fl * 5.5);    // bubble cells only where they are ≳ 3 px
    float bub = mix(0.5, smoothstep(0.12, 0.8, c), cf);
    vec3 fo = mix(uRivFoam, uRivFoamLav, bub);
    fo = mix(fo, uRivFoamBlue, 0.55 * (1.0 - smoothstep(0.0, 0.2, abs(e + 0.05))));          // shade at the waterline
    fo = mix(fo, uRivFoamBlue, 0.45 * smoothstep(0.45, 1.0, e / max(0.3, bankW)));         // shaded outer edge
    col = mix(col, fo, foamIn);
  }
#endif
  float fg = smoothstep(uRivGlowR.x, uRivGlowR.y, vRivDist);
  col = mix(col, uRivGlow, min(0.9, fg * fg * uRivGlowR.z));
  diffuseColor.rgb = col;
}`);
  };
  if (WATER05) {
    mat.defines = { WATER05: 1 };
    mat.customProgramCacheKey = () => 'far-river-w8-w10';
  } else {
    mat.customProgramCacheKey = () => 'far-river-w8';
  }
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
