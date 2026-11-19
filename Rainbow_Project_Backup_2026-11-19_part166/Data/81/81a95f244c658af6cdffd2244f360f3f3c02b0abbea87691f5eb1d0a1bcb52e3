/**
 * Screen 04 milestone M4 (round 8, qa/match/04/NOTES.md) — sub-switches of `?match04=1`, each `&m04…=1`, default off:
 *  m04ring  — the gold washer opening and the gold-ring tunnel as REAL modeled geometry (lathe profiles sized from the
 *             approved picture's mouth ring r 3.58 → 4.11 and the painted stacked ring bands), shaded as polished gold
 *             (warm glow down the tunnel, pink / violet / cyan water reflections on the lower walls, glints, a row of
 *             amber bulbs on the opening and on every ring lip). In the approved view these surfaces show the approved
 *             pixels (camera projection, unchanged); they fade to their own crisp 3D gold as the camera leaves that view.
 *  m04foam  — puffy 3D foam banks along both water edges (the painted white-lilac foam clusters), hidden in the approved
 *             view (the painting carries them there), shown once the camera has left it.
 *  m04bub   — iridescent soap bubbles floating in the tunnel air (camera-facing bubble discs), same visibility rule.
 *  m04arrow — the five glowing blue chevron arrows drawn crisp on the water (distance-field shape at the painted
 *             spacing) instead of the magnified painted arrow tile.
 *  m04wave  — the painted swirl water without the obvious repeat (two offset samples of the swirl tile blended by a
 *             slow world-anchored noise) and flowing down the slide.
 *  m04foam3 — (round 9, with m04foam + m04river) LOW soft foam hugging the river banks (heaps a third as tall, smaller
 *             puffs, wider gaps where the pink water shows), lavender / pink shaded like the painted foam.
 *  m04pink  — (round 9, with m04river) the broad pink / magenta swirl bands on both sides of the narrow cyan arrow lane.
 *  m04arr5  — (round 9, with m04river) the five glowing chevrons as painted: fat flat white-cyan bars nested one after
 *             the other ahead of Benny (about five in view at a time, the farther ones fading into the glow).
 *  m04mouth — (round 9, needs m04ring) the approved GOLD WASHER OPENING: the painted mouth ring (thick polished band,
 *             thin bright lips, dark groove) unwrapped from the approved pixels and straightened (tools/match04/mouth04.py
 *             -> tile_mouth.png) on a modeled mouth ring flush with the painted ring plane, mapped through the projector so
 *             the approach continues the approved view; its row of glowing bulbs (the painted hot spots on both lips,
 *             mouth04.json) drawn as crisp glowing bulbs at any distance.
 * Without `?match04=1` nothing here runs; without the sub-switches nothing here is built.
 */
import * as THREE from 'three';
import { PROJ05_INVERSE } from '../vfx/waterRibbon';

const QS = new URLSearchParams(location.search);
const on = (k: string) => QS.get(k) === '1';
export const M04 = {
  ring: on('m04ring'),
  foam: on('m04foam'),
  bub: on('m04bub'),
  arrow: on('m04arrow'),
  wave: on('m04wave'),
  river: on('m04river'),
  gold: on('m04gold'),
  mouth: on('m04mouth'),
  room: on('m04room'),
  foam3: on('m04foam3'),
  pink: on('m04pink'),
  arr5: on('m04arr5'),
  arr3d: on('m04arr3d'),
  lay: on('m04lay'),
  num: (k: string, d: number) => (QS.has(k) ? Number(QS.get(k)) : d),
};

export interface M04Ctx {
  group: THREE.Group;
  shared: Record<string, THREE.IUniform>;
  proj: THREE.PerspectiveCamera;
  /** tube axis in group-local coordinates (x lateral, y up from the slide, z = -down the slide) */
  cx: number; cy: number; z0: number; len: number; r: number; outerR: number;
  hideOld: (names: string[]) => void;
}

const VERT = /* glsl */ `
uniform mat4 uProjVP;
attribute vec2 aK;
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
varying vec2 vK;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vProj = uProjVP * wp;
  vW = wp.xyz;
  vK = aK;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

// polished gold, art-directed in DISPLAY colours measured on the approved picture (then pjInverse like the plate):
// groove (110,35,5) / shadow band (168,70,18) / mid (205,97,28) / lit (245,143,38) / hot lip (255,204,77) / glint.
// Each ring = a broad polished band that brightens toward its lip, a bright rounded lip with hot spots, a thin dark groove;
// the far rings warm toward the glowing vanishing point; violet / pink water reflections on the lower walls.
const GOLD_FRAG = /* glsl */ `
uniform sampler2D uPlate;
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform float uAway;
uniform vec3 uAxO;
uniform vec3 uAxD;
uniform vec3 uAxU;
uniform vec3 uAxR;
uniform float uNB;
uniform float uP;
uniform float uLipBulb;
uniform float uBulbR;
uniform float uLen;
uniform vec4 uTone;        // band base, lip base, opening base, streak strength
uniform sampler2D uRingTile; // tile_ring.png: the painted ring colour at every angle (rows 56..176 = band near edge .. lip)
uniform float uPaint;      // how much of the painted ring colour drives the bands (m04paint)
uniform float uGoldY;      // m04gold: polished YELLOW-gold ramp (bright yellow-white highlights), fewer magenta tints
uniform float uMouthT;     // m04mouth: the painted mouth ring texture on the opening (tile_mouth.png)
uniform sampler2D uMouthTex;
uniform vec3 uMouthRho;    // tile rows: rho at the top row, rho at the bottom row (fitted mouth plane z0); z: rho offset
                           // (the painted band lies 0.1 u inside the fitted outer radius: lips onto the modeled lips)
uniform vec3 uProjPos;
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
varying vec2 vK;            // x: part (0 band, 1 lip, 2 groove, 3 opening face, 4 end glow), y: ring index (-1 = opening)
${PROJ05_INVERSE}
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec3 goldRamp(float x) {
  x = clamp(x, 0.0, 1.0) * 5.0;
  vec3 c0 = vec3(0.43, 0.14, 0.02), c1 = vec3(0.66, 0.27, 0.07), c2 = vec3(0.80, 0.38, 0.11);
  vec3 c3 = vec3(0.96, 0.56, 0.15), c4 = vec3(1.0, 0.80, 0.30), c5 = vec3(1.0, 0.96, 0.80);
  if (x < 1.0) return mix(c0, c1, x);
  if (x < 2.0) return mix(c1, c2, x - 1.0);
  if (x < 3.0) return mix(c2, c3, x - 2.0);
  if (x < 4.0) return mix(c3, c4, x - 3.0);
  return mix(c4, c5, x - 4.0);
}
vec3 goldRampY(float x) {
  x = clamp(x, 0.0, 1.0) * 5.0;
  vec3 c0 = vec3(0.52, 0.22, 0.03), c1 = vec3(0.76, 0.40, 0.07), c2 = vec3(0.89, 0.55, 0.12);
  vec3 c3 = vec3(0.98, 0.72, 0.20), c4 = vec3(1.0, 0.87, 0.42), c5 = vec3(1.0, 0.98, 0.86);
  if (x < 1.0) return mix(c0, c1, x);
  if (x < 2.0) return mix(c1, c2, x - 1.0);
  if (x < 3.0) return mix(c2, c3, x - 2.0);
  if (x < 4.0) return mix(c3, c4, x - 3.0);
  return mix(c4, c5, x - 4.0);
}
// a few long highlight streaks around the ring (painted smears), different on every ring
float streaks(float ang, float ring) {
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float c = (h21(vec2(ring, fi * 3.1)) * 2.0 - 1.0) * 2.6;
    float w = 0.12 + 0.30 * h21(vec2(ring, fi * 5.7));
    float d = ang - c; d = mod(d + 3.14159, 6.28318) - 3.14159;
    s += (0.45 + 0.55 * h21(vec2(ring, fi * 9.3))) * exp(-d * d / (w * w));
  }
  return s;
}
void main() {
  vec3 V = normalize(cameraPosition - vW);
  vec3 n = normalize(vN);
  if (dot(n, V) < 0.0) n = -n;
  vec3 q = vW - uAxO;
  float al = dot(q, uAxD);
  vec3 qr = q - uAxD * al;
  float rr = length(qr);
  float ang = atan(dot(qr, uAxR), dot(qr, uAxU));         // 0 = tunnel top, < 0 = left
  vec3 R = reflect(-V, n);
  float part = vK.x;
  float dc = distance(cameraPosition, vW);
  float facing = clamp(dot(n, V), 0.0, 1.0);
  vec3 col;
  if (part > 3.5) {
    // the far glow (painted vanishing point): small warm-white core, orange-gold outside with faint far rings
    // soft warm-white core, yellow-orange glow, orange toward the rim (matches the far bands), no hard target rings
    float rad = clamp(rr / 3.6, 0.0, 1.0);
    col = mix(vec3(1.0, 0.95, 0.78), vec3(1.0, 0.72, 0.24), smoothstep(0.04, 0.30, rad));
    col = mix(col, uGoldY > 0.5 ? vec3(0.98, 0.70, 0.22) : vec3(0.93, 0.52, 0.15), smoothstep(0.30, 0.95, rad));
    col *= 1.0 - 0.10 * smoothstep(0.25, 0.0, abs(fract(log(max(rad, 0.01)) / log(0.72)) - 0.5)) * smoothstep(0.35, 0.7, rad);
  } else {
    bool mouth = vK.y < -0.5;
    float ring = floor(vK.y + 0.5);             // integer ring index (the interpolated varying is not exact)
    float v, tb = 0.0;
    // gloss that moves with the view: the polished metal reflects the bright far end of the tunnel
    float gl = pow(max(dot(R, uAxD), 0.0), 6.0);
    if (mouth) {
      // the washer opening: thick bright polished gold, a long vertical highlight, glowing rounded lips
      float st = streaks(ang, 77.0);
      v = uTone.z + 0.08 * cos(ang) + 0.20 * st + 0.08 * gl;
      if (part > 0.5 && part < 1.5) v = uTone.z + 0.14 + 0.16 * facing + 0.10 * st;
      if (part > 1.5 && part < 2.5) v = 0.18;
    } else {
      float u = fract(al / uP) * uP;                       // world units inside this ring period (0 = groove step)
      float t = clamp((u - 0.06) / (uP - 0.6), 0.0, 1.0);  // band: 0 at its near edge .. 1 at its lip
      float far = smoothstep(10.0, 38.0, dc);
      float st = streaks(ang, ring);
      tb = t;
      float bump = smoothstep(0.0, 0.45, t) * (1.0 - 0.5 * smoothstep(0.7, 1.0, t));
      v = uTone.x + 0.20 * pow(t, 1.5) + 0.03 * cos(ang) + 0.04 * far + uTone.w * st * bump + 0.05 * gl;
      if (part > 0.5 && part < 1.5) v = uTone.y + 0.12 * facing + 0.04 * far + 0.15 * st;
      if (part > 1.5 && part < 2.5) v = 0.03 + 0.05 * far;
    }
    col = uGoldY > 0.5 ? goldRampY(v) : goldRamp(v);
    if (!mouth && part < 1.5) {
      // the painted ring colour at this angle (pinks, violets, yellow streaks of the approved rings), with the crisp
      // structure's brightness: painted palette + modeled lip / groove / highlight shapes
      float row = part > 0.5 ? 0.92 : mix(0.30, 0.90, tb);
      vec3 pc = texture2D(uRingTile, vec2(0.5 - ang / 6.2831853, row)).rgb;
      // painted variation only (this angle's colour minus the painted row average): the pink / violet / yellow streaks
      // ride on the measured gold ramp, so dark gold stays deep orange (scaling a yellow down would turn it olive)
      vec3 rm = mix(vec3(0.73, 0.33, 0.11), vec3(0.83, 0.42, 0.18), smoothstep(0.30, 0.45, row));
      rm = mix(rm, vec3(0.87, 0.49, 0.19), smoothstep(0.45, 0.60, row));
      rm = mix(rm, vec3(0.89, 0.59, 0.26), smoothstep(0.60, 0.75, row));
      rm = mix(rm, vec3(0.92, 0.76, 0.38), smoothstep(0.75, 0.92, row));
      col = clamp(col + uPaint * (pc - rm), 0.0, 1.0);
    }
    // violet (left) / pink (right) reflections of the swirl water on the lower walls, painterly variation above
    float low = smoothstep(1.25, 2.15, abs(ang));
    vec3 wc = ang < 0.0 ? vec3(0.62, 0.42, 0.86) : vec3(0.95, 0.42, 0.70);
    float ry = mouth ? 99.0 : ring, fa = ang * 2.2 + ry * 1.7;
    float hv = mix(h21(vec2(floor(fa), ry)), h21(vec2(floor(fa) + 1.0, ry)), smoothstep(0.0, 1.0, fract(fa)));
    float pk = (0.42 * low + 0.22 * smoothstep(0.78, 0.98, hv) * (1.0 - low)) * (part > 0.5 && part < 1.5 ? 0.35 : 1.0);
    vec3 wc2 = mix(wc, vec3(0.88, 0.42, 0.78), 1.0 - low);   // dusky violet-pink tint on the upper walls
    col = mix(col, wc2 * (0.55 + 0.6 * v), pk * (mouth ? 0.6 : 1.0) * (1.0 - 0.55 * uGoldY));
    // a few cool blue-violet glints on the bands (painted reflections of the cyan water)
    if (!mouth && part < 0.5) {
      float cb = streaks(ang + 1.3, ring + 31.0);
      col = mix(col, vec3(0.62, 0.66, 1.0), 0.55 * smoothstep(0.7, 1.0, cb) * step(0.55, h21(vec2(ring, 4.4))) * smoothstep(0.1, 0.5, tb));
    }
    // hot spots / amber bulbs: a row on the opening's face, smaller glints on every ring lip
    bool onFace = part > 2.5 && part < 3.5;
    bool onLip = uLipBulb > 0.5 && part > 0.5 && part < 1.5 && !mouth;
    if (onFace || onLip) {
      float nb = onFace ? uNB : floor(uNB * 0.6);
      float cell = fract(ang / 6.2831853 * nb + 0.5 * mod(max(ring, 0.0), 2.0)) - 0.5;
      float arc = cell * 6.2831853 * rr / nb;               // world units along the ring
      float rad = onFace ? abs(rr - uBulbR) : 0.0;
      float d = length(vec2(arc, rad));
      float bs = onFace ? 0.075 : 0.05;
      float on = onFace ? 1.0 : step(0.35, h21(vec2(floor(ang / 6.2831853 * nb + 0.5), ring)));
      on *= 1.0 - smoothstep(0.4, 1.0, fwidth(arc) / bs);
      col += vec3(1.0, 0.55, 0.12) * 0.55 * smoothstep(bs * 3.5, 0.0, d) * on;
      col = mix(col, vec3(1.0, 0.95, 0.75), smoothstep(bs, bs * 0.35, d) * on);
    }
    // star glints scattered on the polished gold (painted white sparkles), sparse
    vec2 gc = vec2(ang / 6.2831853 * 30.0, al * 1.1);
    vec2 gi = floor(gc), gf = fract(gc) - 0.5;
    float gh = h21(gi + ring * 7.0);
    float gfw = max(fwidth(gc.x), fwidth(gc.y));
    if (gh > 0.93 && gfw < 0.35) {
      vec2 o = (vec2(h21(gi + 1.3), h21(gi + 2.7)) - 0.5) * 0.6;
      vec2 p = (gf - o) * vec2(1.0, 0.7);
      float g = smoothstep(0.08, 0.0, length(p)) + 0.4 * smoothstep(0.02, 0.0, abs(p.x)) * smoothstep(0.28, 0.0, abs(p.y)) + 0.4 * smoothstep(0.02, 0.0, abs(p.y)) * smoothstep(0.28, 0.0, abs(p.x));
      col += vec3(1.0, 0.92, 0.70) * g * 0.6 * (1.0 - smoothstep(0.15, 0.35, gfw));
    }
    if (mouth && uMouthT > 0.5) {
      // m04mouth: the painted washer opening. The fragment is carried along the projector ray onto the fitted mouth plane
      // (homothety about the projector), so the approach continues the approved view; (psi, rho) there index the
      // straightened painted ring. Deeper parts of the inner lip land on the painted groove / inner band rows.
      float dP = dot(vW - uProjPos, uAxD), d0 = dot(uAxO - uProjPos, uAxD);
      vec3 Q = uProjPos + (vW - uProjPos) * (d0 / max(dP, 0.5));
      vec3 qq = Q - uAxO; qq -= uAxD * dot(qq, uAxD);
      float rhoQ = length(qq), psQ = atan(dot(qq, uAxR), dot(qq, uAxU));
      vec2 uvM = vec2(psQ / 6.2831853 + 0.5, (uMouthRho.x - rhoQ - uMouthRho.z) / (uMouthRho.x - uMouthRho.y));
      // explicit gradients without the psi wrap (the seam lies under the water)
      vec2 gx = dFdx(uvM), gy = dFdy(uvM);
      gx.x = abs(gx.x) > 0.5 ? 0.0 : gx.x; gy.x = abs(gy.x) > 0.5 ? 0.0 : gy.x;
      col = textureGrad(uMouthTex, uvM, gx, gy).rgb;
      // a soft polished sheen that moves with the view (the painted highlights stay where they were painted)
      col += vec3(1.0, 0.86, 0.55) * 0.10 * gl * smoothstep(0.0, 0.2, facing);
    }
  }
  col = clamp(col, 0.0, 1.0);
  // the approved view shows the approved pixels (the projector IS this camera there)
  if (uAway < 0.999 && vProj.w > 0.0) {
    vec2 uv = vProj.xy / vProj.w * 0.5 + 0.5;
    if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) col = mix(texture2D(uPlate, uv).rgb, col, uAway);
  }
  gl_FragColor = vec4(pjInverse(col), 1.0);
}`;

/** `m04river`: the wide painted river inside the tunnel — a curved trough (flat lane, sides rising to the walls) carrying
 * the approved water design (tile_river3: pink swirl ribbons, cyan streams, foam edges) by arc length across the trough,
 * two offset samples blended by slow world-anchored noise (no visible 4.7 u repeat), flowing down the slide, and the
 * glowing chevron arrows drawn crisp (distance field) on the centre lane. */
const RIVER_VERT = /* glsl */ `
uniform mat4 uProjVP;
attribute vec2 aR;          // x: signed arc length across the trough (u), y: 0
varying vec4 vProj;
varying vec3 vL;
varying float vS;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vProj = uProjVP * wp;
  vL = position;
  vS = aR.x;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const RIVER_FRAG = /* glsl */ `
uniform sampler2D uPlate;
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform float uAway;
uniform sampler2D uRiv;
uniform vec4 uRivA;          // lateral half-width, along start, along length, lateral scale
uniform float uTime;
uniform vec4 uArr;           // arrow spacing, first arrow (along), half width, arm thickness
uniform float uZ0;
uniform vec4 uPk;            // m04pink: x on, y cyan lane half width, z outer edge of the pink bands, w strength
uniform vec4 uA5;            // m04arr5: x on, y spacing, z first apex (along), w bar thickness along the flow
uniform vec4 uA5b;           // m04arr5: x half width, y arm slope (along per lateral), z camera along, w visible depth
uniform vec2 uA5n;           // r10 m04arr5: near fade-in distance (start, full) ahead of the camera; default 6.5, 9.0
varying vec4 vProj;
varying vec3 vL;
varying float vS;
${PROJ05_INVERSE}
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1, 0)), f.x), mix(h21(i + vec2(0, 1)), h21(i + vec2(1, 1)), f.x), f.y); }
// chevron pointing down the slide: distance to the two arms
float chev(vec2 p, float hw, float th) {
  p.x = abs(p.x);
  vec2 a = vec2(0.0, 0.0), b = vec2(hw, -hw * 2.3);   // long arms along the flow (painted arrows seen low)
  vec2 pa = p - a, ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - th;
}
void main() {
  float along = -vL.z;                                     // down the slide from Benny's checkpoint water point
  float flow = along - uTime * 0.9;                        // the design drifts down the slide with the current
  float lat = vS * uRivA.w + 0.9 * (vn(vec2(along * 0.07, 7.0)) - 0.5) * smoothstep(0.4, 1.6, abs(vS));
  float fl = flow + 2.2 * (vn(vec2(along * 0.05, vS * 0.15 + 1.0)) - 0.5);
  vec2 uv1 = vec2(lat / (2.0 * uRivA.x) + 0.5, (fl - uRivA.y) / uRivA.z);
  vec2 uv2 = vec2(-lat / (2.0 * uRivA.x) * 0.96 + 0.5, (fl - uRivA.y) / uRivA.z * 0.77 + 0.37);
  float w = smoothstep(0.3, 0.7, vn(vec2(along * 0.16, vS * 0.35 + 3.0)));
  vec3 col = mix(texture2D(uRiv, uv1).rgb, texture2D(uRiv, uv2).rgb, w);
  // the deeper cyan centre lane of the painting
  col = mix(col, col * vec3(0.55, 0.85, 1.0) + vec3(0.0, 0.05, 0.12), 0.35 * (1.0 - smoothstep(0.9, 1.7, abs(vS))));
  if (uPk.x > 0.5) {
    // m04pink: the painted broad pink / magenta swirl bands either side of the cyan lane; the swirl structure (the
    // tile's brightness) is kept, re-coloured into the painted magenta -> hot pink -> pale pink, with cyan streaks left
    float side = smoothstep(uPk.y, uPk.y + 0.7, abs(vS)) * (1.0 - smoothstep(uPk.z, uPk.z + 0.9, abs(vS)));
    float l = dot(col, vec3(0.30, 0.55, 0.15));
    vec3 pk = mix(vec3(0.55, 0.08, 0.58), vec3(0.96, 0.30, 0.78), smoothstep(0.22, 0.58, l));
    pk = mix(pk, vec3(1.0, 0.78, 0.96), smoothstep(0.66, 0.95, l));
    float n = vn(vec2(fl * 0.22, vS * 0.6 + 11.0));
    float keepCyan = smoothstep(0.62, 0.85, n);                       // a few cyan swirls survive inside the pink
    col = mix(col, pk, side * uPk.w * (1.0 - 0.75 * keepCyan));
  }
  if (uA5.x > 0.5) {
    // m04arr5: fat flat chevrons (bars between two nested V lines, ends cut along the flow), as painted
    float k5 = floor((along - uA5.z) / uA5.y + 0.5);
    float ap = uA5.z + k5 * uA5.y;                       // this arrow's apex (front edge at the centre)
    // along grows down the slide (away from the camera), the apex points away; v = 0 on the front V line, < 0 toward
    // the camera; the bar lies between v = -T and v = 0, its ends cut along the flow at |lat| = half width
    float v = (along - ap) + abs(vS) * uA5b.y;
    float dIn = max(max(v, -uA5.w - v), abs(vS) - uA5b.x); // < 0 inside the bar (units ~ along-flow)
    float cd = ap - uA5b.z;                               // arrow distance ahead of the camera
    float vis = (k5 >= 0.0 ? 1.0 : 0.0) * smoothstep(uA5n.x, uA5n.y, cd) * (1.0 - smoothstep(uA5b.w - 6.0, uA5b.w, cd));
    float px = fwidth(dIn) + 1e-4;
    float glow = exp(-max(dIn, 0.0) / 0.35);
    col = mix(col, vec3(0.05, 0.60, 0.98), 0.55 * glow * vis);
    col = mix(col, vec3(0.62, 0.94, 1.0), 0.70 * exp(-max(dIn, 0.0) / 0.12) * vis);
    float body = 1.0 - smoothstep(-px, px, dIn);
    float edge = 1.0 - smoothstep(-px, px, abs(dIn + 0.07) - 0.05);
    col = mix(col, mix(vec3(0.80, 0.97, 1.0), vec3(0.92, 1.0, 1.0), smoothstep(-0.6, -0.1, dIn)), body * 0.96 * vis);
    col = mix(col, vec3(1.0), edge * 0.6 * vis);
  }
  // crisp glowing arrows on the centre lane (painted: white-cyan core, cyan glow), world-anchored
  float ai = floor((along - uArr.y) / uArr.x + 0.5);
  float ac = uArr.y + ai * uArr.x;
  if (ai >= 0.0 && uA5.x < 0.5) {
    float d = chev(vec2(vS, along - ac - 1.5), uArr.z, uArr.w);
    float px = fwidth(d);
    float fade = smoothstep(-2.0, 0.5, ac) ;
    // the painted arrows sit in a deeper electric-cyan lane; a dark-cyan halo, then a glowing white-cyan body
    col = mix(col, vec3(0.05, 0.55, 0.96), 0.45 * exp(-max(d, 0.0) / 0.45) * fade);
    col = mix(col, vec3(0.55, 0.92, 1.0), exp(-max(d, 0.0) / 0.12) * 0.6 * fade);
    col = mix(col, vec3(0.86, 0.98, 1.0), (1.0 - smoothstep(-px, px, d)) * 0.95 * fade);
    col = mix(col, vec3(0.96, 1.0, 1.0), (1.0 - smoothstep(-px, px, abs(d + uArr.w * 0.12) - uArr.w * 0.10)) * fade);
  }
  col = clamp(col, 0.0, 1.0);
  if (uAway < 0.999 && vProj.w > 0.0) {
    vec2 uv = vProj.xy / vProj.w * 0.5 + 0.5;
    if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) col = mix(texture2D(uPlate, uv).rgb, col, uAway);
  }
  gl_FragColor = vec4(pjInverse(col), 1.0);
}`;

/** world-space bubble discs + foam puffs share one tiny shader each (camera-facing sprites in an InstancedMesh) */
const SPRITE_VERT = /* glsl */ `
attribute vec4 aB;          // xyz world centre, w radius
attribute float aS;         // seed
uniform vec2 uNear;         // fade sprites out this close to the camera (no giant discs in the face)
varying vec2 vUv;
varying float vS;
varying float vF;
void main() {
  vUv = uv * 2.0 - 1.0;
  vS = aS;
  vec4 mv = viewMatrix * vec4(aB.xyz, 1.0);
  vF = smoothstep(uNear.x, uNear.y, -mv.z);
  mv.xy += position.xy * aB.w * 2.0;
  gl_Position = projectionMatrix * mv;
}`;
const BUB_FRAG = /* glsl */ `
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform float uAlpha;
varying vec2 vUv;
varying float vS;
varying float vF;
${PROJ05_INVERSE}
void main() {
  float r = length(vUv);
  if (r > 1.0) discard;
  // soap bubble: clear centre, iridescent rim (pink -> violet -> cyan around it), white window highlight
  float rim = smoothstep(0.55, 0.97, r) * (1.0 - smoothstep(0.97, 1.0, r));
  float a = atan(vUv.y, vUv.x) + vS * 6.0;
  vec3 iri = 0.5 + 0.5 * cos(vec3(0.0, 2.1, 4.2) + a * 1.0 + r * 3.0);
  iri = mix(vec3(0.95, 0.55, 0.95), iri, 0.55);
  vec3 col = mix(vec3(0.86, 0.80, 1.0), iri, rim);
  float hl = smoothstep(0.24, 0.05, length(vUv - vec2(-0.38, 0.42)));
  float alpha = 0.10 + 0.70 * rim + 0.85 * hl;
  col = mix(col, vec3(1.0), hl);
  gl_FragColor = vec4(pjInverse(col), clamp(alpha, 0.0, 1.0) * uAlpha * vF);
}`;
const FOAM_FRAG = /* glsl */ `
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform float uAlpha;
varying vec2 vUv;
varying float vS;
varying float vF;
${PROJ05_INVERSE}
void main() {
  float r = length(vUv);
  if (r > 1.0 || uAlpha * vF < 0.5) discard;
  // a painted foam puff: white top-left, lavender-blue / pink shadow low right, soft bright window highlight
  vec3 nrm = vec3(vUv, sqrt(max(0.0, 1.0 - r * r)));
  float l = clamp(dot(nrm, normalize(vec3(-0.45, 0.6, 0.65))), 0.0, 1.0);
  vec3 shade = mix(vec3(0.70, 0.64, 0.95), vec3(0.93, 0.70, 0.92), 0.5 + 0.5 * sin(vS * 11.0));
#ifdef FOAM3
  // painted glossy foam balls: lavender body, pink bounce light from the water below, white only at the top highlight
  shade = mix(vec3(0.66, 0.58, 0.93), vec3(0.95, 0.62, 0.90), 0.5 + 0.5 * sin(vS * 11.0));
  vec3 col = mix(shade, vec3(0.93, 0.90, 1.0), smoothstep(0.25, 0.95, l));
  col = mix(col, vec3(0.98, 0.55, 0.85), 0.35 * smoothstep(0.2, -0.8, vUv.y));
#else
  vec3 col = mix(shade, vec3(1.0, 0.99, 1.0), smoothstep(0.10, 0.80, l));
#endif
  col += vec3(1.0) * 0.45 * smoothstep(0.22, 0.0, length(vUv - vec2(-0.30, 0.36)));
  col = mix(col, shade * 0.92, 0.30 * smoothstep(0.88, 1.0, r));
  gl_FragColor = vec4(pjInverse(clamp(col, 0.0, 1.0)), 1.0);
}`;

// m04mouth: a glowing bulb on the washer opening — white-hot core, yellow glow, soft amber halo, a faint vertical light
// streak across the band (as painted); vS = brightness
const BULB_FRAG = /* glsl */ `
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform float uAlpha;
varying vec2 vUv;
varying float vS;
varying float vF;
${PROJ05_INVERSE}
void main() {
  float r = length(vUv);
  if (r > 1.0) discard;
  float core = smoothstep(0.17, 0.09, r);
  float glow = exp(-r * r / 0.06);
  float halo = exp(-r * r / 0.30) * (1.0 - smoothstep(0.7, 1.0, r));
  float streak = exp(-vUv.x * vUv.x / 0.008) * exp(-vUv.y * vUv.y / 0.30) * 0.6;
  vec3 col = mix(vec3(1.0, 0.62, 0.16), vec3(1.0, 0.86, 0.42), clamp(glow + streak, 0.0, 1.0));
  col = mix(col, vec3(1.0, 0.99, 0.90), core);
  float a = clamp(core + 0.85 * glow + 0.35 * halo + streak, 0.0, 1.0) * (0.75 + 0.25 * vS);
  gl_FragColor = vec4(pjInverse(col), a * uAlpha * vF);
}`;

function lathe(prof: { r: number; a: number; part: number }[], segs: number, ringIdx: (i: number) => number) {
  const pts = prof.map((p) => new THREE.Vector2(p.r, p.a));
  const g = new THREE.LatheGeometry(pts, segs);
  const n = g.attributes.position.count;
  const k = new Float32Array(n * 2);
  // LatheGeometry: vertex index = seg * pts.length + j
  for (let i = 0; i < n; i++) { const j = i % pts.length; k[i * 2] = prof[j].part; k[i * 2 + 1] = ringIdx(j); }
  g.setAttribute('aK', new THREE.Float32BufferAttribute(k, 2));
  g.deleteAttribute('uv');
  return g;
}

export function addM04(ctx: M04Ctx) {
  const { group, shared, proj, cx, cy, z0, len, r } = ctx;
  const any = M04.ring || M04.foam || M04.bub || M04.arrow || M04.wave || M04.river;
  if (!any) return null;
  group.updateMatrixWorld(true);
  const Mw = group.matrixWorld;
  const toW = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyMatrix4(Mw);
  const axO = toW(cx, cy, z0), axD = toW(cx, cy, z0 - 1).sub(axO).normalize();
  const axU = toW(cx, cy + 1, z0).sub(axO).normalize(), axR = toW(cx + 1, cy, z0).sub(axO).normalize();
  const away = { value: 0 };
  const fade = (M04.num('m04fade0', 0.3)), fade1 = M04.num('m04fade1', 2.5);
  const out: { update(cam: THREE.Vector3, benny?: THREE.Vector3): void } = { update() {} };
  const updaters: ((a: number) => void)[] = [];

  if (M04.ring) {
    const ringTile = new THREE.TextureLoader().load(new URL('../../assets/textures/match04/tile_ring.png', import.meta.url).href, (t) => { t.needsUpdate = true; });
    ringTile.colorSpace = THREE.NoColorSpace; ringTile.flipY = false; ringTile.wrapS = THREE.RepeatWrapping; ringTile.wrapT = THREE.ClampToEdgeWrapping;
    ringTile.minFilter = THREE.LinearMipmapLinearFilter; ringTile.anisotropy = 8;
    const gm = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: GOLD_FRAG, side: THREE.DoubleSide, fog: false, extensions: { derivatives: true } as never,
      uniforms: { uPlate: shared.uPlate, uPjPost: shared.uPjPost, uPjRes: shared.uPjRes, uProjVP: shared.uProjVP,
        uAway: away, uAxO: { value: axO }, uAxD: { value: axD }, uAxU: { value: axU }, uAxR: { value: axR }, uNB: { value: M04.num('m04nb', 28) },
        uP: { value: M04.num('m04ringp', 2.6) }, uLipBulb: { value: M04.num('m04lipbulb', 1) }, uBulbR: { value: (r + ctx.outerR) / 2 }, uLen: { value: len }, uRingTile: { value: ringTile }, uPaint: { value: M04.num('m04paint', M04.gold ? 0.8 : 1.4) }, uGoldY: { value: M04.gold ? 1 : 0 }, uMouthT: { value: 0 }, uMouthTex: { value: null }, uMouthRho: { value: new THREE.Vector3(4.45, 3.25, M04.num('m04mro', -0.10)) }, uProjPos: shared.uProjPos, uTone: { value: new THREE.Vector4(M04.num('m04tb', 0.11), M04.num('m04tl', 0.38), M04.num('m04tm', 0.5), M04.num('m04ts', 0.45)) } },
    });
    const P = M04.num('m04ringp', 2.6); // ring period along the tunnel (painted ring spacing seen from the approved camera)
    // stepped polished washers: per period a broad band narrowing slightly toward the glow (faces the camera like the
    // painted bands), a rounded lip bead (hot spots), a step back out (the thin dark groove); a = distance down the tunnel
    const prof: { r: number; a: number; part: number }[] = [];
    const ringOf: number[] = [];
    const nP = Math.ceil(len / P);
    for (let k = 0; k < nP; k++) {
      const a = k * P;
      const pushP = (rr: number, aa: number, part: number) => { prof.push({ r: rr, a: aa, part }); ringOf.push(k); };
      pushP(r + 0.22, a + 0.01, 2);
      pushP(r + 0.17, a + 0.07, 0);
      pushP(r + 0.07, a + P * 0.5, 0);
      pushP(r - 0.05, a + P - 0.56, 0);
      pushP(r - 0.10, a + P - 0.48, 1);
      pushP(r - 0.22, a + P - 0.39, 1);
      pushP(r - 0.28, a + P - 0.27, 1);
      pushP(r - 0.23, a + P - 0.15, 1);
      pushP(r - 0.08, a + P - 0.07, 2);
      pushP(r + 0.22, a + P - 0.01, 2);
    }
    const tun = lathe(prof, 160, (j) => ringOf[j]);
    // below the water line the corrugation flattens to the plain wall (no saw-tooth where the beads cross the water)
    {
      const pa = tun.attributes.position as THREE.BufferAttribute;
      const angW = Math.acos(-cy / r); // angle from the top where the wall meets the water
      for (let i = 0; i < pa.count; i++) {
        const x = pa.getX(i), z = pa.getZ(i), rad = Math.hypot(x, z);
        const ang = Math.atan2(Math.abs(x), z);
        const k = M04.river ? THREE.MathUtils.smoothstep(ang, angW - 0.95, angW - 0.55) : THREE.MathUtils.smoothstep(ang, angW - 0.45, angW - 0.1);
        const nr = rad + (r + 0.05 - rad) * k;
        pa.setX(i, (x / rad) * nr); pa.setZ(i, (z / rad) * nr);
      }
      tun.computeVertexNormals();
    }
    // lathe axis = +y; rotate so y -> -z (down the tunnel), then place at the mouth
    tun.rotateX(-Math.PI / 2).translate(cx, cy, z0);
    const tm = new THREE.Mesh(tun, gm); tm.name = 'm04_ring_tunnel'; group.add(tm);
    // the washer opening: thick polished ring r 3.58 -> 4.11 in front of the wall, rounded lips, bulb row on the face
    const R0 = r, R1 = ctx.outerR;
    const mp: { r: number; a: number; part: number }[] = [
      { r: R0 + 0.02, a: 0.5, part: 1 }, { r: R0 - 0.04, a: 0.2, part: 1 }, { r: R0 - 0.06, a: -0.2, part: 1 },
      { r: R0 - 0.02, a: -0.45, part: 1 }, { r: R0 + 0.06, a: -0.58, part: 1 }, { r: R0 + 0.12, a: -0.62, part: 3 },
      { r: (R0 + R1) / 2, a: -0.66, part: 3 }, { r: R1 - 0.1, a: -0.62, part: 3 }, { r: R1 - 0.04, a: -0.56, part: 1 },
      { r: R1 + 0.01, a: -0.42, part: 1 }, { r: R1 + 0.02, a: -0.1, part: 1 }, { r: R1 + 0.02, a: 0.05, part: 2 },
    ];
    // round 9 `m04mouth`: the painted ring plane (z0) carries the painted band, so the modeled opening sits nearly flush
    // with it: a thick polished band (front face 0.15 u proud of the wall) with rounded lips, the inner lip curving
    // into the tunnel; the painted texture is mapped through the projector (shader), the bulbs drawn on top
    const mp2: { r: number; a: number; part: number }[] = [
      { r: R0 - 0.03, a: 0.75, part: 1 }, { r: R0 - 0.07, a: 0.35, part: 1 }, { r: R0 - 0.07, a: 0.02, part: 1 },
      { r: R0 - 0.04, a: -0.09, part: 1 }, { r: R0 + 0.02, a: -0.14, part: 1 }, { r: R0 + 0.08, a: -0.155, part: 3 },
      { r: (R0 + R1) / 2, a: -0.165, part: 3 }, { r: R1 - 0.07, a: -0.155, part: 3 }, { r: R1 - 0.02, a: -0.13, part: 1 },
      { r: R1 + 0.02, a: -0.07, part: 1 }, { r: R1 + 0.03, a: 0.0, part: 1 }, { r: R1 + 0.03, a: 0.03, part: 2 },
    ];
    const mouth = lathe(M04.mouth ? mp2 : mp, M04.mouth ? 384 : 192, () => -1);
    mouth.rotateX(-Math.PI / 2).translate(cx, cy, z0);
    const mm = new THREE.Mesh(mouth, gm); mm.name = 'm04_ring_mouth'; group.add(mm);
    // far glow instead of the flat end cap
    const cap = new THREE.CircleGeometry(r + 0.2, 64).translate(cx, cy, z0 - len);
    const nC = cap.attributes.position.count;
    cap.setAttribute('aK', new THREE.Float32BufferAttribute(new Float32Array(nC * 2).map((_, i) => (i % 2 === 0 ? 4 : 0)), 2));
    const cm = new THREE.Mesh(cap, gm); cm.name = 'm04_ring_glow'; group.add(cm);
    ctx.hideOld(['m04_tube', 'm04_mouth_ring', 'm04_tube_end']);
    console.info('[match04] m04ring', { period: P, rings: nP });
    if (M04.mouth) {
      const mt = new THREE.TextureLoader().load(new URL('../../assets/textures/match04/tile_mouth.png', import.meta.url).href, (t) => { t.needsUpdate = true; });
      mt.colorSpace = THREE.NoColorSpace; mt.flipY = false; mt.wrapS = THREE.RepeatWrapping; mt.wrapT = THREE.ClampToEdgeWrapping;
      mt.minFilter = THREE.LinearMipmapLinearFilter; mt.anisotropy = 8;
      gm.uniforms.uMouthTex.value = mt; gm.uniforms.uMouthT.value = 1;
      // the painted bulbs: from the fitted plane (psi, rho) along the projector ray onto the modeled front face
      const Cp = (shared.uProjPos.value as THREE.Vector3).clone();
      const faceA = -0.165 - 0.03;
      void fetch(new URL('../../assets/textures/match04/mouth04.json', import.meta.url).href).then((r) => r.json()).then((mj: { bulbs: { psi: number; rho: number; lum: number; lip: string }[] }) => {
        const items: { p: THREE.Vector3; r: number; s: number }[] = [];
        const d0 = axO.clone().sub(Cp).dot(axD), dF = d0 + faceA;  // faceA < 0: toward the camera
        const inv = Mw.clone().invert();
        for (const b of mj.bulbs) {
          const rq = b.rho - (gm.uniforms.uMouthRho.value as THREE.Vector3).z;  // tile rho -> fitted-plane rho
          const Qw = axO.clone().addScaledVector(axU, rq * Math.cos(b.psi)).addScaledVector(axR, rq * Math.sin(b.psi));
          const Pw = Cp.clone().add(Qw.sub(Cp).multiplyScalar(dF / d0));
          const pl = Pw.applyMatrix4(inv);
          if (pl.y < 0.15) continue;                                       // under the water line
          const k = THREE.MathUtils.clamp((b.lum - 205) / 45, 0, 1);
          items.push({ p: pl, r: M04.num('m04bulbr', 0.28) * (0.8 + 0.4 * k), s: 0.5 + 0.5 * k });
        }
        sprites(items, BULB_FRAG, 'm04_bulbs', 4, false, [0.5, 1.1]);
        console.info('[match04] m04mouth bulbs', items.length);
      }).catch(() => {});
    }
  }

  // `m04river`: the wide painted river trough inside the tunnel (world-anchored, replaces the flat ramp there)
  const RY = M04.num('m04ry', 1.0);                         // how high the river sides climb the wall (u above the water)
  const XF = M04.num('m04xf', 1.9);                         // half width of the flat centre lane (Benny's steering room)
  const xW = Math.sqrt(Math.max(0, (r + 0.08) ** 2 - (cy - RY) ** 2)); // where the river side meets the wall
  const time = { value: 0 };
  const a5b = new THREE.Vector4(M04.num('m04a5w', 1.3), M04.num('m04a5s', 2.2), 0, M04.num('m04a5d', 30));
  const MwInv = Mw.clone().invert();
  if (M04.river) {
    const nX = 28, nA = Math.ceil(len / 0.5);
    const pos: number[] = [], aR: number[] = [], idx: number[] = [];
    // cross-section: flat lane |x| <= XF (a hair above the old water plane), then sides curving up to the wall
    const xs: { x: number; y: number }[] = [];
    for (let i = 0; i <= nX; i++) {
      const u = (i / nX) * 2 - 1, au = Math.abs(u);
      const kf = 0.45; // share of the half section that is the flat lane
      let x: number, y: number;
      if (au <= kf) { x = (au / kf) * XF; y = 0.02; } else { const t = (au - kf) / (1 - kf); x = XF + (xW - XF) * t; y = 0.02 + RY * t * t; }
      xs.push({ x: Math.sign(u) * x, y });
    }
    const arc: number[] = [0]; const mid = nX / 2;
    for (let i = mid + 1; i <= nX; i++) arc[i] = (arc[i - 1] ?? 0) + Math.hypot(xs[i].x - xs[i - 1].x, xs[i].y - xs[i - 1].y);
    arc[mid] = 0; for (let i = mid - 1; i >= 0; i--) arc[i] = arc[i + 1] - Math.hypot(xs[i].x - xs[i + 1].x, xs[i].y - xs[i + 1].y);
    // from BEHIND (aB u before the opening, where the camera starts) to the far end; before the opening the river
    // lies flat (no wall to climb), the sides rise over the first 2 u inside the tunnel
    const aB = M04.num('m04rb', 14);
    const nT = nA + Math.ceil(aB / 0.5);
    for (let j = 0; j <= nT; j++) {
      const a = -aB + (j / nT) * (len + aB);
      const k = THREE.MathUtils.smoothstep(a, -0.6, 1.4);
      for (let i = 0; i <= nX; i++) { pos.push(cx + xs[i].x, 0.02 + (xs[i].y - 0.02) * k, z0 - a); aR.push(arc[i], 0); }
    }
    for (let j = 0; j < nT; j++) for (let i = 0; i < nX; i++) {
      const p0 = j * (nX + 1) + i, p1 = p0 + 1, p2 = p0 + nX + 1, p3 = p2 + 1;
      idx.push(p0, p2, p1, p1, p2, p3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aR', new THREE.Float32BufferAttribute(aR, 2));
    g.setIndex(idx);
    const riv = new THREE.TextureLoader().load(new URL('../../assets/textures/match04/tile_river3.png', import.meta.url).href, (t) => { t.needsUpdate = true; });
    riv.colorSpace = THREE.NoColorSpace; riv.flipY = false; riv.wrapS = riv.wrapT = THREE.RepeatWrapping;
    riv.minFilter = THREE.LinearMipmapLinearFilter; riv.anisotropy = 8;
    // tiles04.json river3: lateral +-4 u, along 1.757 .. 6.409 u from Benny's checkpoint water point
    const rm = new THREE.ShaderMaterial({ vertexShader: RIVER_VERT, fragmentShader: RIVER_FRAG, side: THREE.DoubleSide, fog: false,
      extensions: { derivatives: true } as never, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4,
      uniforms: { uPlate: shared.uPlate, uPjPost: shared.uPjPost, uPjRes: shared.uPjRes, uProjVP: shared.uProjVP, uAway: away,
        uRiv: { value: riv }, uRivA: { value: new THREE.Vector4(4, 1.7572621, 4.6517529, M04.num('m04rk', 1.0)) }, uTime: time,
        uArr: { value: new THREE.Vector4(M04.num('m04ap', 5.6), 9.58, M04.num('m04aw', 1.0), M04.num('m04at', 0.21)) }, uZ0: { value: z0 },
        uPk: { value: new THREE.Vector4(M04.pink ? 1 : 0, M04.num('m04pkl', 1.05), M04.num('m04pko', 3.6), M04.num('m04pkw', 0.85)) },
        uA5: { value: new THREE.Vector4(M04.arr5 ? 1 : 0, M04.num('m04a5p', 3.3), M04.num('m04a5f', 11.6), M04.num('m04a5t', 1.45)) },
        uA5b: { value: a5b }, uA5n: { value: new THREE.Vector2(M04.num('m04a5n0', 6.5), M04.num('m04a5n1', 9.0)) } } });
    const rmesh = new THREE.Mesh(g, rm); rmesh.name = 'm04_river'; rmesh.renderOrder = 1; group.add(rmesh);
    console.info('[match04] m04river', { xW, RY, XF });
  }

  // sprite clouds (foam puffs, bubbles): world positions computed in the slide-local frame
  const sprites = (items: { p: THREE.Vector3; r: number; s: number }[], frag: string, name: string, order: number, opaque = false, near = [1.2, 2.6]) => {
    const quad = new THREE.PlaneGeometry(1, 1);
    const g = new THREE.InstancedBufferGeometry();
    g.setIndex(quad.index); g.setAttribute('position', quad.attributes.position); g.setAttribute('uv', quad.attributes.uv);
    const aB = new Float32Array(items.length * 4), aS = new Float32Array(items.length);
    items.forEach((it, i) => { const w = it.p.clone().applyMatrix4(Mw); aB.set([w.x, w.y, w.z, it.r], i * 4); aS[i] = it.s; });
    g.setAttribute('aB', new THREE.InstancedBufferAttribute(aB, 4));
    g.setAttribute('aS', new THREE.InstancedBufferAttribute(aS, 1));
    g.instanceCount = items.length;
    const alpha = { value: 0 };
    const m = new THREE.ShaderMaterial({ vertexShader: SPRITE_VERT, fragmentShader: frag, transparent: !opaque, depthWrite: opaque, fog: false,
      uniforms: { uPjPost: shared.uPjPost, uPjRes: shared.uPjRes, uAlpha: alpha, uNear: { value: new THREE.Vector2(near[0], near[1]) } } });
    const mesh = new THREE.Mesh(g, m);
    mesh.name = name; mesh.frustumCulled = false; mesh.renderOrder = order; mesh.visible = false; // invisible during the projector depth bake
    group.add(mesh);
    updaters.push((a) => { alpha.value = a; mesh.visible = a > 0.01; });
  };
  let seed = 4321; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const waterHalf = Math.sqrt(Math.max(0, r * r - cy * cy)); // where the water meets the tunnel wall
  if (M04.foam && M04.river) {
    // the painted foam clouds: big white puffy balls piled along both river edges where the river meets the gold wall,
    // in clusters of varied size with short gaps, plus bigger banks before the opening
    const items: { p: THREE.Vector3; r: number; s: number }[] = [];
    // `m04foam2` (default with m04foam under m04river): irregular heaped clumps instead of evenly spaced rows
    const heaped = M04.num('m04foam2', 1) > 0.5;
    for (const side of [-1, 1]) {
      let a = 0.2 + rnd() * 0.5;
      while (heaped && a < len - 1) {
        const f3 = M04.foam3;                                     // round 9: low soft banks hugging the river edge
        const cl = 0.5 + Math.pow(rnd(), 1.3) * 2.4;            // clump length along the river
        const H = (0.2 + Math.pow(rnd(), 1.8) * 1.1) * (f3 ? 0.35 : 1);   // heap height (a few tall heaps, many low ones)
        const reach = (0.3 + rnd() * 0.5 + H * 0.6) * (f3 ? 0.6 : 1);     // how far the clump spills into the river
        const n = Math.round((6 + cl * (8 + H * 22)) * (f3 ? 0.75 : 1));
        const lean = (rnd() - 0.5) * 0.6;
        for (let i = 0; i < n; i++) {
          const t = rnd(), env = Math.pow(Math.sin(Math.PI * t), 0.7);
          const hf = Math.pow(rnd(), 1.6) * env;                 // height fraction inside the heap
          const big = rnd() < 0.18;
          const rad = (big ? 0.28 + rnd() * 0.30 : 0.06 + Math.pow(rnd(), 1.7) * 0.24) * (1 - 0.45 * hf) * (f3 ? (big ? 0.5 : 0.75) : 1);
          const d = Math.min(xW - XF + 0.4, rnd() * reach * env + lean * t * 0.5);   // inward from the wall
          const onWall = rnd() < (f3 ? 0.08 : 0.25);              // some puffs heaped up the lower wall
          const tt = Math.max(0, 1 - Math.max(0, d) / Math.max(0.1, xW - XF));
          const ys = onWall ? RY + rnd() * (f3 ? 0.25 : 0.7) * env : 0.02 + RY * tt * tt;
          const x = side * (onWall ? xW - 0.12 - rnd() * 0.15 : XF + (xW - XF) * tt - 0.05);
          const y = ys + rad * (0.25 + 0.4 * rnd()) + hf * H;
          if (Math.hypot(x, y - cy) > r - 0.08) continue;
          items.push({ p: new THREE.Vector3(cx + x, y, z0 - a - t * cl), r: rad, s: rnd() });
        }
        a += cl + 0.1 + Math.pow(rnd(), 1.5) * 2.2 * (f3 ? 1.6 : 1);   // irregular gaps (wider: the pink water shows)
      }
      while (!heaped && a < len - 1) {
        const cl = 1.2 + rnd() * 2.2, n = Math.round(cl * (9 + rnd() * 6));
        for (let i = 0; i < n; i++) {
          const t = rnd(), env = Math.sin(Math.PI * t);
          const rad = 0.10 + Math.pow(rnd(), 1.4) * 0.34 * (0.5 + 0.5 * env);
          const inward = rnd() * 0.75 * (0.4 + 0.6 * env);
          const tt = Math.max(0, 1 - inward / Math.max(0.1, xW - XF));
          const x = side * (XF + (xW - XF) * tt - 0.05), y = 0.02 + RY * tt * tt + rad * (0.3 + 0.5 * rnd()) + 0.25 * env * rnd();
          items.push({ p: new THREE.Vector3(cx + x, y, z0 - a - t * cl), r: rad, s: rnd() });
        }
        a += cl + 0.15 + rnd() * 0.7;
      }
    }
    for (let a = -7; a < 0; a += M04.foam3 ? 0.5 : 0.35) for (const side of [-1, 1]) {
      const n = 3 + Math.floor(rnd() * 3);
      for (let i = 0; i < n; i++) {
        const rad = (0.16 + rnd() * 0.34) * (M04.foam3 ? 0.7 : 1);
        const x = cx + side * (waterHalf + 0.3 + rnd() * 2.2);
        items.push({ p: new THREE.Vector3(x, rad * 0.55 + rnd() * 0.3, z0 - a + rnd() * 0.3), r: rad, s: rnd() });
      }
    }
    sprites(items, M04.foam3 ? FOAM_FRAG.replace('uniform float uAlpha;', 'uniform float uAlpha;\n#define FOAM3') : FOAM_FRAG, 'm04_foam', 3, true, [0.6, 1.2]);
  } else if (M04.foam) {
    const items: { p: THREE.Vector3; r: number; s: number }[] = [];
    // inside the tunnel: irregular foam clusters (0.6–1.6 u long, gaps between) along both water edges, climbing a
    // little up the wall — the painted white-lilac bubbly foam, not a continuous rope
    for (const side of [-1, 1]) {
      let a = 0.3 + rnd() * 0.8;
      while (a < len - 2) {
        const cl = 0.6 + rnd() * 1.0, n = Math.round(cl * (10 + rnd() * 8));
        for (let i = 0; i < n; i++) {
          const t = rnd(), rad = 0.05 + Math.pow(rnd(), 1.6) * 0.2 * (1 - Math.abs(t - 0.5));
          const up = rnd() * 0.5 * (1 - Math.abs(t - 0.5) * 1.4);
          const th = Math.asin(Math.min(1, waterHalf / r)) + up / r; // walk up the wall from the water line (th 0 = bottom)
          const x = side * (r * Math.sin(th) - 0.12 - rnd() * 0.4), y = cy - r * Math.cos(th) + rad * 0.5 + rnd() * 0.08;
          items.push({ p: new THREE.Vector3(cx + x, Math.max(rad * 0.5, y), z0 - a - t * cl), r: rad, s: rnd() });
        }
        a += cl + 0.4 + rnd() * 1.4;
      }
    }
    // before the opening: the painted foam banks left and right of the river (bigger clusters)
    for (let a = -7; a < 0; a += 0.3) for (const side of [-1, 1]) {
      const n = 3 + Math.floor(rnd() * 3);
      for (let i = 0; i < n; i++) {
        const rad = 0.14 + rnd() * 0.32;
        const x = cx + side * (waterHalf + 0.2 + rnd() * 2.2);
        items.push({ p: new THREE.Vector3(x, rad * 0.55 + rnd() * 0.3, z0 - a + rnd() * 0.3), r: rad, s: rnd() });
      }
    }
    sprites(items, FOAM_FRAG, 'm04_foam', 3, true, [0.6, 1.2]);
  }
  if (M04.bub) {
    const items: { p: THREE.Vector3; r: number; s: number }[] = [];
    for (let i = 0; i < 140; i++) {
      const a = -6 + rnd() * (len - 4);
      const side = rnd() < 0.5 ? -1 : 1, edge = rnd() < 0.7;
      const rad = 0.05 + Math.pow(rnd(), 2.2) * 0.42;
      // most bubbles hover above the foam banks along the walls (as painted), some float higher in the tunnel air
      const x = edge ? side * (xW - 0.3 - rnd() * 0.9) : side * rnd() * 2.6;
      const y = edge ? RY + 0.2 + rnd() * 1.4 : 1.4 + rnd() * 2.6;
      if (Math.hypot(x, y - cy) > r - rad - 0.15) continue;
      items.push({ p: new THREE.Vector3(cx + x, y, z0 - a), r: rad, s: rnd() });
    }
    sprites(items, BUB_FRAG, 'm04_bubbles', 6, false, [1.5, 3.5]);
  }

  // r12 REBUILD step 2 `&m04arr3d=1`: the five glowing chevrons as REAL geometry on the lane. Flat arrows on the water are
  // invisible from the swim camera (the lane is seen almost edge-on and Benny covers its near part), so each painted chevron
  // (fat white-cyan bars, apex pointing down the tunnel, cyan glow) leans back toward the camera like the painted lane seen
  // from above; spaced so about five are in view ahead; each fades in from 2 u ahead (Benny never clips through one) and out
  // far away; hidden at the approved viewpoint (the painted picture is shown there). The flat river chevrons are switched off.
  const arrowsOut: { mesh: THREE.Mesh; za: number; mats: THREE.MeshBasicMaterial[] }[] = [];
  let arrA = 0;
  if (M04.arr3d) {
    const hw = M04.num('m04a3w', 1.15), th = M04.num('m04a3t', 0.42), drop = M04.num('m04a3d', 0.95);
    const tilt = THREE.MathUtils.degToRad(M04.num('m04a3k', 38)), sp = M04.num('m04a3p', 5.0), first = M04.num('m04a3f', 3.0);
    const sh = new THREE.Shape();
    sh.moveTo(0, 0); sh.lineTo(hw, -drop); sh.lineTo(hw, -drop - th); sh.lineTo(0, -th); sh.lineTo(-hw, -drop - th); sh.lineTo(-hw, -drop); sh.lineTo(0, 0);
    const base = new THREE.ShapeGeometry(sh);
    // r13: halo size (m04a3g = growth of the cyan glow round each bar; 1 = the r12 D1/D2 size)
    const hg = M04.num('m04a3g', 1);
    const halo = new THREE.ShapeGeometry(sh); halo.translate(0, (drop + th) / 2, 0); halo.scale(1 + 0.28 * hg, 1 + 0.45 * hg, 1); halo.translate(0, -(drop + th) / 2, 0);
    const toLane = (g: THREE.BufferGeometry, lift: number) => {        // shape (u, v) -> lane plane leaning back toward the camera
      const pa = g.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pa.count; i++) {
        const u = pa.getX(i), v = pa.getY(i) + drop + th;               // v = 0 at the nearest bar edge
        pa.setXYZ(i, u, 0.05 + M04.num('m04a3y', 0) + lift + v * Math.sin(tilt), -v * Math.cos(tilt));   // r13 m04a3y = raise
      }
      g.computeBoundingSphere();
    };
    toLane(base, 0.004); toLane(halo, 0.0);
    const river = group.getObjectByName('m04_river') as THREE.Mesh | undefined;
    if (river) ((river.material as THREE.ShaderMaterial).uniforms.uArr.value as THREE.Vector4).y = 1e5;
    // r13 `&m04a3w2=1`: the painted chevrons are glowing WHITE bars with a bright cyan neon halo (r12 = pale cyan, dim halo)
    const neon = M04.num('m04a3w2', 0) > 0;
    const coreC = neon ? new THREE.Color(1.0, 1.0, 1.0) : new THREE.Color(0.86, 0.98, 1.0);
    const glowC = neon ? new THREE.Color(0.22, 0.86, 1.0) : new THREE.Color(0.10, 0.62, 1.0);
    for (let a = first; a < len - 6; a += sp) {
      const core = new THREE.MeshBasicMaterial({ color: coreC, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
      const glow = new THREE.MeshBasicMaterial({ color: glowC, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
      const m = new THREE.Mesh(base, core), g = new THREE.Mesh(halo, glow);
      m.position.set(cx, 0, z0 - a); g.position.set(cx, 0, z0 - a - 0.002);
      m.renderOrder = 5; g.renderOrder = 4; m.name = 'm04_arrow3d'; g.name = 'm04_arrow3d_glow';
      m.visible = g.visible = false;                                     // invisible during the projector depth bake
      group.add(g); group.add(m);
      arrowsOut.push({ mesh: m, za: z0 - a, mats: [core, glow] });
      arrowsOut.push({ mesh: g, za: z0 - a, mats: [] });
    }
    updaters.push((a) => { arrA = a; });
    console.info('[match04] m04arr3d', { arrows: arrowsOut.length / 2, sp, tilt: M04.num('m04a3k', 38) });
  }

  out.update = (cam: THREE.Vector3, benny?: THREE.Vector3) => {
    time.value = performance.now() / 1000;
    a5b.z = -cam.clone().applyMatrix4(MwInv).z;   // camera position down the slide (local along)
    away.value = THREE.MathUtils.smoothstep(cam.distanceTo(proj.position), fade, fade1);
    const a2 = THREE.MathUtils.smoothstep(cam.distanceTo(proj.position), 0.4, 1.6);
    for (const u of updaters) u(a2);
    if (arrowsOut.length) {
      const cz = -a5b.z;                                                // camera local z (forward = -z)
      // r13: fade window ahead of the camera (Benny swims ≈ 6.4 u ahead of it on 04: m04a3n0/n1 ≈ 6.5/8.5 makes every
      // chevron vanish as it reaches him, like the painted picture where all five lie ahead); far fade m04a3f0/f1 keeps
      // about five in view; m04a3o = glow opacity. Defaults = the r12 D1/D2 values.
      const n0 = M04.num('m04a3n0', 2.0), n1 = M04.num('m04a3n1', 4.5), f0 = M04.num('m04a3f0', 30), f1 = M04.num('m04a3f1', 40);
      const go = M04.num('m04a3o', 0.55);
      const b0 = M04.num('m04a3b0', 1.6), b1 = M04.num('m04a3b1', 3.0);
      const bz = M04.num('m04a3b', 0) > 0 && benny ? benny.clone().applyMatrix4(MwInv).z : null;   // Benny's local z (same frame as cz)
      for (let i = 0; i < arrowsOut.length; i += 2) {
        const d = cz - arrowsOut[i].za;                                 // distance ahead of the camera
        // r13 `&m04a3b=1`: the near fade is measured from BENNY (m04a3b0/b1 u ahead of him), so no chevron ever sits round
        // his body, also where the camera closes in on him at the end of the stage
        const nearK = bz !== null ? THREE.MathUtils.smoothstep(bz - arrowsOut[i].za, b0, b1) : THREE.MathUtils.smoothstep(d, n0, n1);
        const k = arrA * nearK * (1 - THREE.MathUtils.smoothstep(d, f0, f1));
        const [core, glow] = arrowsOut[i].mats;
        core.opacity = 0.95 * k; glow.opacity = go * k;
        arrowsOut[i].mesh.visible = arrowsOut[i + 1].mesh.visible = k > 0.01;
      }
    }
  };
  return out;
}
