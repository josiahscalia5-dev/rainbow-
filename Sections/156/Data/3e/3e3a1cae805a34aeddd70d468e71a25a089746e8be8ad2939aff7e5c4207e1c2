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
}

export interface FarGlow {
  color: THREE.ColorRepresentation; near: number; far: number; strength: number;
  /** optional mid-distance tint of the metal colour (refs: walls turn violet deeper in the tunnel) */
  mid?: { color: THREE.ColorRepresentation; near: number; far: number; amount: number };
}

/** GLSL for the distance glow, shared by the tube wall, rings and lids */
const FAR_GLOW_PARS = `uniform vec3 uFarGlowColor; uniform vec3 uFarGlowRange; uniform vec3 uMidTint; uniform vec3 uMidRange;
float farGlowK(){ return uFarGlowRange.z * smoothstep(uFarGlowRange.x, uFarGlowRange.y, length(vViewPosition)); }
float midTintK(){ return uMidRange.z * smoothstep(uMidRange.x, uMidRange.y, length(vViewPosition)); }`;
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
export function withFarGlow<T extends THREE.MeshStandardMaterial>(mat: T, g: FarGlow, key: string): T {
  const uniforms = farGlowUniforms(g);
  const prev = mat.onBeforeCompile;
  mat.onBeforeCompile = (shader, r) => {
    prev.call(mat, shader, r);
    Object.assign(shader.uniforms, uniforms);
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + FAR_GLOW_PARS)
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
${FAR_GLOW_APPLY()}`,
      );
  };
  const prevKey = mat.customProgramCacheKey.bind(mat);
  mat.customProgramCacheKey = () => prevKey() + '|fg-' + key;
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
    ...(o.farGlow ? farGlowUniforms(o.farGlow) : {}),
  };
  const defines: Record<string, string> = {};
  if (relief) defines.PERF_RELIEF = '';
  if (o.farGlow) defines.PERF_FARGLOW = '';
  mat.defines = defines;
  mat.userData.perfUniforms = uniforms;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vPerfUv;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvPerfUv = uv;');
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
varying vec2 vPerfUv;
uniform vec3 uHoleColor; uniform float uSlot; uniform vec2 uRepeat; uniform float uHoleSize; uniform float uStreaks;
uniform vec3 uRelief; uniform vec3 uRimColor; uniform float uRimStrength; uniform float uStreakN; uniform vec2 uSlotHalf; uniform float uStagger; uniform float uOffsetV;
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
#endif`,
      );
  };
  mat.customProgramCacheKey = () => 'perf-v3' + (relief ? '-r' : '') + (o.farGlow ? '-g' : '');
  return mat;
}

/**
 * Reflection environment for the washer tubes (05–07): an HDR cube of hot-pink / magenta / violet with
 * pink-white strip lights around the tube and a warm gold-white glow down the tunnel (-Z), so the glossy
 * walls read rich saturated magenta (the shared candy studio has a cyan panel that turned them sky-blue).
 * Built from half-float DataTextures; three converts it to PMREM on first use (no renderer needed here).
 */
const tubeEnvs: Partial<Record<'wall' | 'gold', THREE.CubeTexture>> = {};
/** variant 'gold': same tunnel lighting seen by polished gold (warm-white strips, amber base) so rings and
 *  lids read clean orange-gold with yellow-white highlights instead of salmon (gold × magenta). */
export function washerTubeEnv(variant: 'wall' | 'gold' = 'wall'): THREE.CubeTexture {
  const cached = tubeEnvs[variant];
  if (cached) return cached;
  const isGold = variant === 'gold';
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
  const cBaseTop = isGold ? new THREE.Color(0.62, 0.24, 0.07) : new THREE.Color(0.62, 0.05, 0.42);
  const cBaseLow = isGold ? new THREE.Color(0.3, 0.09, 0.05) : new THREE.Color(0.22, 0.05, 0.55);
  const radiance = (d: THREE.Vector3, out: THREE.Color) => {
    const up = d.y;
    // base: magenta above, violet toward the floor
    out.copy(cBaseTop).lerp(cBaseLow, THREE.MathUtils.smoothstep(-up, -0.3, 0.9));
    // gold only: a warm yellow-white core at the very end of the tunnel (-Z) so far bands glow like the VP
    const ahead = Math.max(0, -d.z);
    if (isGold) {
      const hot = Math.pow(ahead, 60), wide = Math.pow(ahead, 6);
      out.r += 2.4 * hot + 0.3 * wide; out.g += 2.0 * hot + 0.16 * wide; out.b += 1.0 * hot + 0.04 * wide;
    } else {
      const wide = Math.pow(ahead, 6);
      out.r += 0.05 * wide; out.g += 0.02 * wide; out.b += 0.25 * wide; // violet haze down the tunnel
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
      uCore: { value: new THREE.Color(3.4, 3.0, 2.0) },
      uGold: { value: new THREE.Color(2.3, 1.35, 0.32) },
      uWarm: { value: new THREE.Color(1.05, 0.34, 0.3) },
      uRim: { value: new THREE.Color(0.36, 0.05, 0.42) },
    },
    vertexShader: /* glsl */ `varying vec2 vUv; varying float vFade; uniform vec4 uFade;
      void main(){
        vUv = uv;
        float d = distance(cameraPosition, (modelMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz);
        vFade = smoothstep(uFade.x, uFade.y, d) * (1.0 - smoothstep(uFade.z, uFade.w, d));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `varying vec2 vUv; varying float vFade; uniform vec3 uCore; uniform vec3 uGold; uniform vec3 uWarm; uniform vec3 uRim;
      void main(){
        float r = length(vUv - 0.5) * 2.0;
        vec3 c = mix(uRim, uWarm, smoothstep(0.92, 0.5, r));
        c = mix(c, uGold, smoothstep(0.6, 0.18, r));
        c = mix(c, uCore, smoothstep(0.26, 0.0, r));
        float a = (1.0 - smoothstep(0.7, 1.0, r)) * vFade;
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
