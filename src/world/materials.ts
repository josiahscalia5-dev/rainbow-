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

export interface FarGlow { color: THREE.ColorRepresentation; near: number; far: number; strength: number }

/** GLSL for the distance glow, shared by the tube wall, rings and lids */
const FAR_GLOW_PARS = `uniform vec3 uFarGlowColor; uniform vec3 uFarGlowRange;
float farGlowK(){ return uFarGlowRange.z * smoothstep(uFarGlowRange.x, uFarGlowRange.y, length(vViewPosition)); }`;

function farGlowUniforms(g: FarGlow) {
  return {
    uFarGlowColor: { value: new THREE.Color(g.color) },
    uFarGlowRange: { value: new THREE.Vector3(g.near, g.far, g.strength) },
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
{ float fg = farGlowK(); diffuseColor.rgb = mix(diffuseColor.rgb, uFarGlowColor, fg * 0.5); totalEmissiveRadiance += uFarGlowColor * fg; }`,
      );
  };
  const prevKey = mat.customProgramCacheKey.bind(mat);
  mat.customProgramCacheKey = () => prevKey() + '|fg-' + key;
  mat.userData.farGlow = uniforms;
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
uniform vec3 uRelief; uniform vec3 uRimColor; uniform float uRimStrength;
#ifdef PERF_FARGLOW
${FAR_GLOW_PARS}
#endif
vec2 perfCell(vec2 uv){
  vec2 g = uv * uRepeat;
  g.x += mod(floor(g.y), 2.0) * 0.5;   // staggered rows
  return g;
}
// signed distance to the slot/hole (cell units, <0 inside)
float perfSdf(vec2 g){
  vec2 f = fract(g) - 0.5;
  vec2 hs = mix(vec2(uHoleSize*0.5), vec2(uHoleSize*0.62, uHoleSize*0.24), uSlot);
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
float streak = pow(0.5 + 0.5 * sin(vPerfUv.x * 6.2831 * 9.0 + 1.3), 18.0) * uStreaks;
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
{ float fg = farGlowK(); diffuseColor.rgb = mix(diffuseColor.rgb, uFarGlowColor, fg * 0.5); totalEmissiveRadiance += uFarGlowColor * fg; }
#endif`,
      );
  };
  mat.customProgramCacheKey = () => 'perf-v2' + (relief ? '-r' : '') + (o.farGlow ? '-g' : '');
  return mat;
}

/**
 * Reflection environment for the washer tubes (05–07): an HDR cube of hot-pink / magenta / violet with
 * pink-white strip lights around the tube and a warm gold-white glow down the tunnel (-Z), so the glossy
 * walls read rich saturated magenta (the shared candy studio has a cyan panel that turned them sky-blue).
 * Built from half-float DataTextures; three converts it to PMREM on first use (no renderer needed here).
 */
let tubeEnv: THREE.CubeTexture | null = null;
export function washerTubeEnv(): THREE.CubeTexture {
  if (tubeEnv) return tubeEnv;
  const N = 64;
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
  const radiance = (d: THREE.Vector3, out: THREE.Color) => {
    const ang = Math.atan2(d.y, d.x); // angle around the tunnel axis (Z)
    const up = d.y;
    // base: deep hot magenta above, violet toward the floor (kept dark so the strips give contrast)
    out.setRGB(0.4, 0.03, 0.3).lerp(new THREE.Color(0.16, 0.05, 0.5), THREE.MathUtils.smoothstep(-up, -0.2, 0.9));
    // pink-white strip lights running along the tunnel at fixed angles around it (8, uneven strength)
    for (let i = 0; i < 8; i++) {
      const a0 = 0.2 + (i * Math.PI) / 4;
      const dA = Math.abs(Math.atan2(Math.sin(ang - a0), Math.cos(ang - a0)));
      const k = Math.exp(-(dA * dA) / 0.005) * (1 - Math.abs(d.z) * 0.6) * (i % 2 ? 0.7 : 1.15);
      out.r += 3.4 * k; out.g += 1.7 * k; out.b += 3.1 * k;
    }
    // warm light far down the tunnel (-Z) and a softer pink glow behind (+Z)
    const ahead = Math.max(0, -d.z);
    const hot = Math.pow(ahead, 10), wide = Math.pow(ahead, 3);
    out.r += 3.4 * hot + 0.75 * wide; out.g += 2.7 * hot + 0.35 * wide; out.b += 1.3 * hot + 0.08 * wide;
    const back = Math.pow(Math.max(0, d.z), 4);
    out.r += 0.9 * back; out.g += 0.25 * back; out.b += 0.8 * back;
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
  tubeEnv = cube;
  return cube;
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
