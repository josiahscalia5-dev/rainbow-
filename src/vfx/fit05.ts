/** Reference-measured curve material. Textures hold spline parameters, never image pixels. */
import * as THREE from 'three';
import measurements from './fit05-data.json';

type Pair = [number, number];
type Band = { id: string; outerLeft: Pair[]; coreLeft: Pair[]; coreRight: Pair[]; outerRight: Pair[] };
type Domain = { sRange: [number, number]; bands: Band[]; glints: unknown[]; sheens?: unknown[] };
const ROWS = 2048, BANDS = 4;
const cache: Partial<Record<'near' | 'far', Record<string, THREE.IUniform>>> = {};
let opticalField: THREE.Texture | undefined;

function fit05OpticalField(): THREE.Texture {
  if (!opticalField) {
    opticalField = new THREE.TextureLoader().load(new URL('../../assets/textures/fit05-sheen.png', import.meta.url).href);
    // Grayscale material response in river coordinates, not display colour.
    opticalField.colorSpace = THREE.NoColorSpace;
    opticalField.flipY = false;
    opticalField.wrapS = opticalField.wrapT = THREE.ClampToEdgeWrapping;
    opticalField.minFilter = THREE.LinearMipmapLinearFilter;
    opticalField.magFilter = THREE.LinearFilter;
    opticalField.anisotropy = 4;
  }
  return opticalField;
}

function interpolate(points: number[][], s: number): number {
  if (!points.length) return 0;
  if (s <= points[0][0]) return points[0][1];
  for (let i = 1; i < points.length; i++) {
    if (s <= points[i][0]) {
      const a = points[i - 1], b = points[i];
      const t = (s - a[0]) / Math.max(1e-8, b[0] - a[0]);
      return a[1] + (b[1] - a[1]) * t;
    }
  }
  return points[points.length - 1][1];
}

export function fit05Uniforms(which: 'near' | 'far'): Record<string, THREE.IUniform> {
  if (cache[which]) return cache[which]!;
  const domain = (measurements as unknown as Record<string, Domain>)[which];
  // The reference crop ends before the water mesh. Hold the final observed
  // near-side cross section outside that crop; do not cut a pink ribbon at a photo edge.
  const range: [number, number] = [which === 'near' ? Math.min(128.5, domain.sRange[0]) : domain.sRange[0], domain.sRange[1]];
  // Perspective allocates most pixels to the first few world units. Spend table
  // resolution there too so a traced foreground glint is not reduced to one row.
  const extent = range[1] - range[0];
  const curveScale = 1 - 1 / (1 + extent / 3);
  const sampleS = (i: number) => range[0] + 3 * (1 / (1 - i / (ROWS - 1) * curveScale) - 1);
  const values = new Float32Array(ROWS * BANDS * 4);
  const ranges = Array.from({ length: BANDS }, () => new THREE.Vector2(1, 0));
  const set = (row: number, i: number, v: number[]) => values.set(v, (row * ROWS + i) * 4);
  domain.bands.slice(0, BANDS).forEach((band, row) => {
    const edges = [band.outerLeft, band.coreLeft, band.coreRight, band.outerRight];
    if (edges.some((edge) => !edge.length)) return;
    const lo = Math.max(...edges.map((edge) => edge[0][0]));
    const hi = Math.min(...edges.map((edge) => edge[edge.length - 1][0]));
    ranges[row].set(which === 'near' ? range[0] : lo, hi);
    for (let i = 0; i < ROWS; i++) {
      const s = sampleS(i);
      set(row, i, edges.map((edge) => interpolate(edge, s)));
    }
  });

  const texture = new THREE.DataTexture(values, ROWS, BANDS, THREE.RGBAFormat, THREE.FloatType);
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;
  const flat = typeof location !== 'undefined' && new URLSearchParams(location.search).get('fitflat05') === '1';
  const still = typeof location !== 'undefined' && new URLSearchParams(location.search).get('fitstill05') === '1';
  return cache[which] = {
    uFitCurves: { value: texture },
    uFitRange: { value: new THREE.Vector2(...range) },
    uFitBandRanges: { value: ranges },
    uFitFlat: { value: flat ? 1 : 0 },
    uFitSheen: { value: fit05OpticalField() },
    uFitNear: { value: which === 'near' ? 1 : 0 },
    uFitStill: { value: still ? 1 : 0 },
  };
}

export const FIT05_GLSL = /* glsl */ `
uniform sampler2D uFitCurves;
uniform vec2 uFitRange;
uniform vec2 uFitBandRanges[4];
uniform float uFitFlat;
uniform sampler2D uFitSheen;
uniform float uFitNear;
uniform float uFitStill;
vec4 fit05Fetch(float row, float s) {
  float scale=1.0-1.0/(1.0+(uFitRange.y-uFitRange.x)/3.0);
  float p=clamp((1.0-1.0/(1.0+max(0.0,s-uFitRange.x)/3.0))/scale,0.0,1.0)*2047.0;
  float left = floor(p);
  vec2 a = vec2((left+0.5)/2048.0,(row+0.5)/4.0);
  return mix(texture2D(uFitCurves,a),texture2D(uFitCurves,a+vec2(1.0/2048.0,0.0)),fract(p));
}
float fit05Bell(float x) {return exp(-x*x);}
float fit05Optical(float lat, float s) {
  float v=(1.0-1.0/(1.0+max(0.0,s-128.5)/3.0))/(1.0-1.0/(1.0+(190.0-128.5)/3.0));
  return texture2D(uFitSheen,vec2((lat+6.6)/13.2,v)).r;
}
vec3 fit05Color(float lat, float s, float time, vec3 fallback) {
  if (s<uFitRange.x || s>uFitRange.y) return fallback;
  float core=0.0, shoulder=0.0, bandQ=0.0, nearest=10000.0;
  float leftCentre=-4.0, rightCentre=4.0;
  for(int i=0;i<4;i++) {
    vec2 range=uFitBandRanges[i];
    if(s<range.x || s>range.y) continue;
    vec4 e=fit05Fetch(float(i),s);
    float aa=max(fwidth(lat)*0.6,0.0001);
    float mid=(e.y+e.z)*0.5;
    float halfWidth=max((e.z-e.y)*0.5,aa);
    float q=(lat-mid)/halfWidth;
    float c=smoothstep(e.x-aa,e.y+aa,lat)*(1.0-smoothstep(e.z-aa,e.w+aa,lat));
    float sh=smoothstep(e.x-halfWidth*0.18,e.x+aa,lat)*(1.0-smoothstep(e.w-aa,e.w+halfWidth*0.18,lat));
    if(abs(q)<nearest) {nearest=abs(q);bandQ=q;}
    core=max(core,c);shoulder=max(shoulder,sh);
    if(i==0) leftCentre=mid;
    if(i==1) rightCentre=mid;
  }
  if(uFitFlat>0.5) return mix(vec3(0.0,0.42,1.0),vec3(1.0,0.0,0.65),core);
  float q=(lat-leftCentre)/max(0.5,rightCentre-leftCentre);
  // Unequal broad sheets follow the measured band contours. These are low contrast
  // depth/sheen support; the conspicuous white reflections below are individually traced.
  float a=fit05Bell((q-0.34)/0.20);
  float b=fit05Bell((q-0.71)/0.12);
  float deep=fit05Bell((q-0.54)/0.085);
  // Numerically inverted from measured reference swatches through the unchanged
  // exposure / Neutral tone mapper / sRGB / saturation-and-contrast pipeline.
  vec3 cyan=mix(vec3(0.072220,0.292446,0.616343),vec3(0.081280,0.425117,0.769562),clamp(0.18+a*0.68+b*0.45-deep*0.24,0.0,1.0));
  cyan=mix(cyan,vec3(0.090253,0.615079,0.847841),fit05Bell((q-0.31)/0.075)*0.48+fit05Bell((q-0.76)/0.055)*0.30);
  vec3 pink=mix(vec3(0.642370,0.104295,0.508640),vec3(0.740898,0.187007,0.755719),fit05Bell((bandQ+0.15)/0.8));
  pink=mix(pink,vec3(0.814419,0.374931,0.809222),fit05Bell((bandQ-0.17)/0.12)*0.50+fit05Bell((bandQ+0.46)/0.18)*0.24);
  if(uFitNear>0.5) {
    // Two overlapping advection phases hide each texture reset. At the authored
    // t=12 pose phase A has zero displacement and full weight, preserving the fit.
    float phase=fract((time-12.0)*(1.0-uFitStill)/5.0+0.5);
    float phaseB=fract(phase+0.5);
    float weight=1.0-abs(phase*2.0-1.0);
    float optical=mix(fit05Optical(lat,s+(phaseB-0.5)*0.6),fit05Optical(lat,s+(phase-0.5)*0.6),weight);
    cyan=mix(vec3(0.072220,0.292446,0.616343),vec3(0.081280,0.425117,0.769562),min(1.0,optical/0.45));
    cyan=mix(cyan,vec3(0.090253,0.615079,0.847841),clamp((optical-0.45)/0.35,0.0,1.0));
    cyan=mix(cyan,vec3(0.11524333,0.81196928,0.88675652),max(0.0,(optical-0.8)/0.2));
    pink=mix(vec3(0.642370,0.104295,0.508640),vec3(0.740898,0.187007,0.755719),min(1.0,optical*2.0));
    pink=mix(pink,vec3(0.814419,0.374931,0.809222),max(0.0,optical*2.0-1.0));
  }
  vec3 colour=mix(cyan,vec3(0.497586,0.134585,0.665643),shoulder*(1.0-core)*0.48);
  colour=mix(colour,pink,core);
  float blend=smoothstep(uFitRange.x,uFitRange.x+0.35,s)*(1.0-smoothstep(uFitRange.y-0.35,uFitRange.y,s));
  return mix(fallback,colour,blend);
}
`;
