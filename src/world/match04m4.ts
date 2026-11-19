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
// The fourth complete washer lip lies 18.4 units inside the measured mouth.
const deepRimIndex = 3;
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
#ifdef CX04_REFLECT_RIVER
uniform sampler2D uReflectedRiver;
uniform vec4 uRiverPlane; // height relative to the ring axis, mouth depth, flat lane half-width, lateral scale
uniform float uWaterTime;
#endif
uniform sampler2D uRingTile; // tile_ring.png: the painted ring colour at every angle (rows 56..176 = band near edge .. lip)
uniform float uPaint;      // how much of the painted ring colour drives the bands (m04paint)
uniform float uBulge;      // r13 m04bulge: each band shaded as a ROUNDED tube (bright middle, darker edges) like the painted rings
uniform float uCopper;     // r13 m04copper: rich polished COPPER-gold ramp (dark maroon grooves -> copper -> warm-gold highlights)
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
vec3 goldRampC(float x) {
  x = clamp(x, 0.0, 1.0) * 5.0;
  vec3 c0 = vec3(0.17, 0.04, 0.03), c1 = vec3(0.42, 0.13, 0.06), c2 = vec3(0.66, 0.29, 0.12);
  vec3 c3 = vec3(0.86, 0.50, 0.22), c4 = vec3(0.98, 0.76, 0.44), c5 = vec3(1.0, 0.95, 0.86);
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
      v += uBulge * (sin(3.14159 * t) - 0.35);
      if (part > 0.5 && part < 1.5) v = uTone.y + 0.12 * facing + 0.04 * far + 0.15 * st;
      if (part > 1.5 && part < 2.5) v = 0.03 + 0.05 * far;
    }
    col = uCopper > 0.5 ? goldRampC(v * uCopper) : (uGoldY > 0.5 ? goldRampY(v) : goldRamp(v));
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
    #ifdef CX04_DEEP_RIM
    if (ring == float(CX04_DEEP_RIM) && part < 1.5) {
      // The lower flanks reflect the approved violet and pink river on either side.
      // Preserve the yellow crown, dark groove and the existing painted highlights.
      float flank = smoothstep(0.85, 1.55, abs(ang)) * (1.0 - smoothstep(2.30, 2.65, abs(ang)));
      float shoulder = part > 0.5 ? 0.55 : smoothstep(0.26, 0.70, tb);
      col = mix(col, wc * (0.52 + 0.63 * v), 0.34 * flank * shoulder);
    }
    #endif
    #ifdef CX04_REFLECT_RIVER
    if (ring >= 4.0 && ring <= 7.0 && part < 1.5) {
      // Intersect the reflected view ray with the flat middle of the real river mesh.
      // The painted current's original 8 by 4.652 unit tile supplies the reflection.
      float down = -dot(R, uAxU);
      float rayLength = (dot(q, uAxU) - uRiverPlane.x) / max(down, 0.015);
      vec3 hit = q + R * rayLength;
      float lateral = dot(hit, uAxR);
      float along = dot(hit, uAxD);
      float contact = smoothstep(0.025, 0.18, down) * smoothstep(0.0, 0.5, rayLength)
                    * (1.0 - smoothstep(10.0, 15.0, rayLength))
                    * (1.0 - smoothstep(uRiverPlane.z - 0.55, uRiverPlane.z, abs(lateral)))
                    * smoothstep(0.0, 2.0, along) * (1.0 - smoothstep(uLen - 2.0, uLen, along));
      float flow = along - uRiverPlane.y - uWaterTime * 0.9;
      vec2 sampleUV = vec2(0.5 + lateral * uRiverPlane.w / 8.0, (flow - 1.7572621) / 4.6517529);
      vec3 waterLight = texture2D(uReflectedRiver, sampleUV, 2.0).rgb;
      float polish = 0.16 + 0.18 * pow(1.0 - facing, 2.0);
      col = mix(col, waterLight * vec3(1.0, 0.86, 0.79), contact * polish);
    }
    #endif
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
uniform vec3 uLane;          // r13 m04lane: x on, y clean-lane half width (u), z strength
uniform vec2 uLane3;         // r13 m04lcd / m04lcw: deeper blue along the arrow line (strength, half width)
uniform vec2 uLane4;         // r14 m04lcn: deep-blue fade-in window ahead of the camera (start, full); off when y <= x
uniform vec4 uLane2;         // r13 m04lane2: x swirl detail, y gloss, z sparkle
uniform vec4 uEdge;          // r13 m04edge: x on, y half arc to the edge, z fringe width, w strength
uniform vec2 uSE;            // r13 m04rse / m04rsl: the climbing side water as long flowing currents (along stretch, from |lat|)
uniform float uTime;
uniform vec4 uArr;           // arrow spacing, first arrow (along), half width, arm thickness
uniform float uZ0;
uniform vec4 uPk;            // m04pink: x on, y cyan lane half width, z outer edge of the pink bands, w strength
uniform float uPkH;          // r14 m04pkh: pink only where the painted tile is pink (0 = off)
uniform sampler2D uSB;       // r15 m04sband: the painted swirl bands (tile_side04: across = lane side .. wall side reversed)
uniform vec4 uSB0;           // x strength, y inner |arc| where the bands start, z outer |arc| (water edge), w tile length along (u)
uniform vec4 uSB1;           // x blend width at the inner side, y re-apply the lilac-white edge fringe (0/1), z tile part used
                             // (1 = cyan..lilac, less = start nearer the pink ribbon), w slow lateral wander of the bands (u)
uniform vec2 uSB2;           // far ahead of the camera (x -> y u) the bands smooth into long unbroken stripes (no repeat ribs)
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
#ifdef SWEPT_WATERBANDS
float sweptArc(float section, float along) {
  float sweep = 1.10 * sin(along * 0.39 + 0.35) + 0.24 * sin(along * 0.73 - 0.55);
  float taper = 1.0 - smoothstep(0.73 * uSB0.z, uSB0.z, abs(section));
  return abs(section) + taper * (0.48 + sign(section) * sweep);
}
#endif
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
  float se = 1.0 + (uSE.x - 1.0) * smoothstep(uSE.y, uSE.y + 0.9, abs(vS));
  vec2 uv1 = vec2(lat / (2.0 * uRivA.x) + 0.5, (fl - uRivA.y) / (uRivA.z * se));
  vec2 uv2 = vec2(-lat / (2.0 * uRivA.x) * 0.96 + 0.5, (fl - uRivA.y) / (uRivA.z * se) * 0.77 + 0.37);
  float w = smoothstep(0.3, 0.7, vn(vec2(along * 0.16, vS * 0.35 + 3.0)));
  vec3 col = mix(texture2D(uRiv, uv1).rgb, texture2D(uRiv, uv2).rgb, w);
  vec3 tileC = col;                                        // r14: the painted tile colour before any re-colouring
  // the deeper cyan centre lane of the painting
  col = mix(col, col * vec3(0.55, 0.85, 1.0) + vec3(0.0, 0.05, 0.12), 0.35 * (1.0 - smoothstep(0.9, 1.7, abs(vS))));
  if (uLane.x > 0.5) {
    // r13 m04lane: the painted centre path is ONE clean glossy blue lane (deep cyan-blue, soft long light streaks, no
    // foam crests or swirl knots): the tile seen heavily smoothed (mip bias) for its gentle light / dark flow, re-coloured
    // into the painted lane blues, plus a few long thin highlights running down the path
    float kl = 1.0 - smoothstep(uLane.y, uLane.y + 0.9, abs(vS));
    vec3 bl = mix(texture2D(uRiv, uv1, 4.5).rgb, texture2D(uRiv, uv2, 4.5).rgb, w);
    float lb = dot(bl, vec3(0.30, 0.55, 0.15));
    vec3 laneC = mix(vec3(0.02, 0.42, 0.88), vec3(0.30, 0.82, 1.0), smoothstep(0.35, 0.80, lb));
    float sk = vn(vec2(vS * 3.1 + 2.0, fl * 0.12));
    laneC += vec3(0.55, 0.85, 1.0) * 0.35 * smoothstep(0.80, 0.97, sk);
    if (uLane2.x > 0.0) {
      // r13 m04lane2: the painted lane as RICH glossy magical water — saturated electric blue -> electric cyan, the tile's
      // own swirls kept at a moderate blur (uLane2.x = detail), flowing glossy highlight ribbons, twinkling white sparkles
      vec3 dl = mix(texture2D(uRiv, uv1, 1.5).rgb, texture2D(uRiv, uv2, 1.5).rgb, w);
      float ld = mix(lb, dot(dl, vec3(0.30, 0.55, 0.15)), uLane2.x) + uLane2.w;   // w = brighter / more turquoise
      laneC = mix(vec3(0.00, 0.22, 0.86), vec3(0.00, 0.62, 1.00), smoothstep(0.20, 0.55, ld));
      laneC = mix(laneC, vec3(0.16, 0.92, 1.00), smoothstep(0.55, 0.82, ld));
      laneC = mix(laneC, vec3(0.80, 0.98, 1.00), uLane2.y * smoothstep(0.84, 0.97, ld));            // glossy crests
      float rib = vn(vec2(vS * 2.3 + 5.0, fl * 0.35));                                              // flowing highlight ribbons
      laneC += vec3(0.45, 0.85, 1.0) * 0.30 * uLane2.y * smoothstep(0.72, 0.92, rib) * (0.6 + 0.4 * sin(fl * 2.0 + vS));
      vec2 sc = vec2(vS * 5.0, fl * 3.0); vec2 si = floor(sc), sf = fract(sc) - 0.5;              // sparkles
      float sh = h21(si + 17.0);
      float tw = 0.5 + 0.5 * sin(uTime * 6.0 + sh * 40.0);
      float spk = smoothstep(0.16, 0.0, length(sf - (vec2(h21(si + 3.1), h21(si + 7.7)) - 0.5) * 0.6)) * step(0.86, sh) * tw;
      laneC += vec3(1.0) * uLane2.z * spk * (1.0 - smoothstep(0.3, 0.8, fwidth(sc.x)));
      // r13 m04lcd: the painted lane is DEEPER blue along the arrow line (the glassy arrows pop on it), brighter turquoise
      // toward the pink edges
      // r14 m04lcn=a,b: the deep blue only AHEAD of Benny (fades in from a to b u ahead of the camera; Benny ≈ 6.4 u
      // ahead) — the painted water round / behind him is bright cyan, the deep electric blue lies under the arrows
      float rk = uLane4.y > uLane4.x ? smoothstep(uLane4.x, uLane4.y, along - uA5b.z) : 1.0;
      float wl = rk * (1.0 - smoothstep(0.2, uLane3.y, abs(vS)));
      if (uLane4.y > uLane4.x && uLane4.x < 0.0) {
        // r14 m04lcn=-a,b (negative start): the PAINTED deep azure keyed on the water's own brightness, so the swirls,
        // glossy crests and white glints survive (a plain multiply flattened the lane into a dark royal-blue patch)
        float lq = dot(laneC, vec3(0.30, 0.55, 0.15));
        vec3 deep = mix(vec3(0.00, 0.40, 0.86), vec3(0.02, 0.66, 0.98), smoothstep(0.40, 0.88, lq));
        deep = mix(deep, laneC, smoothstep(0.90, 0.99, lq));                                     // keep only the white glints
        laneC = mix(laneC, deep, min(uLane3.x, 1.0) * smoothstep(-uLane4.x, uLane4.y, along - uA5b.z) * (1.0 - smoothstep(0.2, uLane3.y, abs(vS))));
      } else {
        laneC = mix(laneC, laneC * vec3(0.42, 0.70, 1.0), uLane3.x * wl);
      }
    }
    col = mix(col, laneC, kl * uLane.z);
  }
  float fringe = 0.0;
  if (uEdge.x > 0.5) {
    // r13 m04edge: soft irregular water edge against the gold wall — pink / magenta current then a lilac-white lacy fringe
    // in broken patches (no straight hard line, no tall foam): uEdge.y = half arc to the edge, z = fringe width, w = strength
    float e = smoothstep(uEdge.y - uEdge.z, uEdge.y - 0.04, abs(vS));
    float n1 = vn(vec2(fl * 0.9, sign(vS) * 7.0 + abs(vS) * 2.0)), n2 = vn(vec2(fl * 2.7 + 3.0, abs(vS) * 6.0));
    float patchy = smoothstep(0.35, 0.75, 0.65 * n1 + 0.35 * n2);
    vec3 pinkC = mix(vec3(0.78, 0.16, 0.66), vec3(1.0, 0.45, 0.82), n2);
    col = mix(col, pinkC, uEdge.w * smoothstep(uEdge.y - uEdge.z * 2.2, uEdge.y - uEdge.z, abs(vS)) * (0.5 + 0.5 * n1));
    fringe = uEdge.w * e * patchy;
    col = mix(col, vec3(0.97, 0.90, 1.0), fringe);
  }
  if (uPk.x > 0.5) {
    // m04pink: the painted broad pink / magenta swirl bands either side of the cyan lane; the swirl structure (the
    // tile's brightness) is kept, re-coloured into the painted magenta -> hot pink -> pale pink, with cyan streaks left
    float bandArc = abs(vS);
#ifdef SWEPT_WATERBANDS
    bandArc = sweptArc(vS, along);
#endif
    float side = smoothstep(uPk.y, uPk.y + 0.7, bandArc) * (1.0 - smoothstep(uPk.z, uPk.z + 0.9, bandArc));
    float l = dot(col, vec3(0.30, 0.55, 0.15));
    vec3 pk = mix(vec3(0.55, 0.08, 0.58), vec3(0.96, 0.30, 0.78), smoothstep(0.22, 0.58, l));
    pk = mix(pk, vec3(1.0, 0.78, 0.96), smoothstep(0.66, 0.95, l));
    float n = vn(vec2(fl * 0.22, vS * 0.6 + 11.0));
    float keepCyan = smoothstep(0.62, 0.85, n);                       // a few cyan swirls survive inside the pink
    float pkMix = 1.0 - 0.75 * keepCyan;
    if (uPkH > 0.0) {
      // r14 m04pkh=x: the PAINTED band structure — re-colour only where the painted tile itself is pink / magenta (red
      // above green); its cyan streaks between the satin bands stay cyan (x = how strictly; 0 = old uniform pink)
      float pinkness = smoothstep(-0.04, 0.22, tileC.r - tileC.g);
      pkMix = mix(pkMix, 0.12 + 0.88 * pinkness, uPkH);
    }
    col = mix(col, pk, side * uPk.w * pkMix);
  }
  if (uSB0.x > 0.0) {
    // r15 m04sband: the side water carries the PAINTED swirl bands (cyan streaks by the lane -> violet -> hot-pink satin
    // ribbon -> lilac sparkle at the wall), cut from references/04 (tools/match04/sideband04.py), by arc length across the
    // trough and world position along it (flowing with the current), two offset samples blended like the river tile
    float as = abs(vS);
#ifdef SWEPT_WATERBANDS
    // Both banks follow a fixed S on the existing 3D trough. The wall contact stays in place.
    as = sweptArc(vS, along);
#endif
    float wan = uSB1.w * (vn(vec2(along * 0.11, sign(vS) * 5.0 + 2.0)) - 0.5) * 2.0;
    float tb = clamp((as + wan - uSB0.y) / max(0.1, uSB0.z - uSB0.y), 0.0, 1.0);
    float vb = fl / uSB0.w + (vS < 0.0 ? 0.0 : 0.43);
    float ub = (1.0 - tb) * uSB1.z;
    vec3 bc = mix(texture2D(uSB, vec2(ub, vb)).rgb, texture2D(uSB, vec2(ub, vb * 0.81 + 0.29)).rgb, w);
    float kd = uSB2.y > uSB2.x ? smoothstep(uSB2.x, uSB2.y, along - uA5b.z) : 0.0;
    if (kd > 0.0) {
      vec3 sm = vec3(0.0);
      for (int i = 0; i < 6; i++) sm += texture2D(uSB, vec2(ub, vb + float(i) * 0.167), 1.0).rgb;
      bc = mix(bc, sm / 6.0, kd);
    }
    col = mix(col, bc, uSB0.x * smoothstep(uSB0.y - uSB1.x, uSB0.y + 0.25 * uSB1.x, as));
    if (uSB1.y > 0.5) col = mix(col, vec3(0.97, 0.90, 1.0), fringe);
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

/** r16 `&m04end=1`: the distant glowing opening (own material on the far end disc; the ring shader is untouched). The disc
 * paints the tunnel CONTINUING beyond the modelled rings — a telescoping series of copper-gold rings that shrink toward a
 * small hot white-gold light just above the water, the river converging into that light — instead of a flat orange disc.
 * Rings = the circle family through each disc point whose centres slide from the tunnel axis (bore) to the glow point. */
const END_VERT = /* glsl */ `
uniform mat4 uProjVP;
uniform vec3 uC;             // tube axis x, y (group-local) and radius
varying vec4 vProj;
varying vec2 vLoc;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vProj = uProjVP * wp;
  vLoc = (position.xy - uC.xy) / uC.z;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;
const END_FRAG = /* glsl */ `
uniform sampler2D uPlate;
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform float uAway;
uniform vec4 uE;             // x glow point height (fraction of r, < 0 below the axis), y ring shrink per ring, z core size, w halo size
uniform vec4 uE2;            // x water level (fraction of r), y lane half width (fraction of the floor), z glow strength, w ring contrast
uniform float uTime;
varying vec4 vProj;
varying vec2 vLoc;
${PROJ05_INVERSE}
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec2 p = vLoc, g = vec2(0.0, uE.x);
  float s = length(p);
  for (int i = 0; i < 8; i++) s = length(p - g * (1.0 - s));
  s = clamp(s, 1e-3, 1.3);
  vec2 rel = (p - g * (1.0 - s)) / s;                    // where on its own ring this point lies (unit circle)
  float ph = log(s) / log(uE.y);                         // rings counted from the bore toward the light
  float f = fract(ph), pw = fwidth(ph);
  float warm = exp(-s * 2.4);                            // the light floods the deep rings
  // telescoping rings: a broad copper band brightening toward its inner lip, a hot lip, a thin dark groove
  float band = smoothstep(0.0, 0.85, f);
  float lip = smoothstep(0.70, 0.84, f) * (1.0 - smoothstep(0.88, 0.93, f));
  float groove = smoothstep(0.90, 0.95, f);
  float rk = (1.0 - smoothstep(0.25, 0.6, pw)) * uE2.w;  // rings too fine to resolve fade to their average
  vec3 cBand = mix(vec3(0.70, 0.27, 0.16), vec3(0.95, 0.52, 0.22), band);
  vec3 cLip = vec3(1.0, 0.80, 0.42);
  vec3 cGr = vec3(0.45, 0.14, 0.12);
  vec3 ring = mix(cBand, cLip, lip);
  ring = mix(ring, cGr, groove * 0.85);
  vec3 col = mix(vec3(0.92, 0.50, 0.24), ring, rk);
  // pink-violet reflections of the water on the lower ring walls (painted)
  col = mix(col, vec3(0.80, 0.36, 0.62), 0.35 * smoothstep(-0.2, -0.75, rel.y));
  col = mix(col, vec3(1.0, 0.86, 0.58), 0.75 * warm);
  // the river converging into the light: the floor wedge below the rings' water lines
  float wl = uE2.x;
  float sf = (g.y - p.y) / max(g.y - wl, 1e-3);         // depth (ring scale) of the floor point here
  float lx = p.x / max(sf * sqrt(1.0 - wl * wl), 1e-4);  // across the river (-1 .. 1)
  float onFloor = step(0.0, sf) * (1.0 - smoothstep(0.92, 1.0, abs(lx)));
  if (onFloor > 0.0) {
    float al = log(max(sf, 1e-3)) / log(uE.y);
    vec3 wc = mix(vec3(0.05, 0.50, 0.95), vec3(0.20, 0.80, 1.0), 0.5 + 0.5 * sin(al * 5.0 + lx * 3.0 - uTime * 2.0));
    wc = mix(wc, vec3(0.92, 0.32, 0.72), smoothstep(uE2.y, uE2.y + 0.25, abs(lx)));             // pink side water
    wc = mix(wc, vec3(0.56, 0.58, 0.88), smoothstep(0.55, 0.12, sf));                             // lilac haze toward the light
    vec2 sc = vec2(lx * 9.0, al * 4.0 - uTime * 3.0); vec2 si = floor(sc);
    wc += vec3(0.75, 0.95, 1.0) * 0.6 * step(0.9, h21(si)) * smoothstep(0.5, 0.0, length(fract(sc) - 0.5)) * (1.0 - smoothstep(0.3, 0.8, fwidth(sc.y)));
    wc = mix(wc, vec3(1.0, 0.92, 0.80), 0.8 * exp(-sf * 5.0));                                  // the light on the water
    col = mix(col, wc, onFloor);
  }
  // the light itself: hot white-gold core and a warm halo just above the water
  float d = length(p - g);
  float halo = exp(-pow(d / uE.w, 2.0)) * uE2.z;
  col = col * (1.0 + 0.35 * halo) + vec3(1.0, 0.72, 0.36) * 0.45 * halo;
  col = mix(col, vec3(1.0, 0.97, 0.86), clamp(exp(-pow(d / uE.z, 2.0)) * 1.15 * uE2.z, 0.0, 1.0));
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
#ifdef SHRINK
  // r15 m04fclu: foam bubbles shrink away as they near the camera (no pale puff popping in the screen corners)
  mv.xy += position.xy * aB.w * 2.0 * vF;
#else
  mv.xy += position.xy * aB.w * 2.0;
#endif
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

// r15 `&m04fclu=1`: ONE small shiny foam bubble of the painted foam clusters (references/04: heaps of many pearly lilac-white
// bubbles, lavender body, pink bounce light from the water below, a brighter faintly iridescent rim, a crisp white window
// highlight and a tiny second glint). Drawn in two passes from the same instances: CORE (opaque, depth-writing, r < 0.86)
// and RIM (#define RIM: the outer annulus blended on top, fading out at the very edge = slightly see-through edges).
const FOAMB_FRAG = /* glsl */ `
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform float uAlpha;
uniform vec3 uFB;           // x rim see-through (0 = opaque edge), y highlight strength, z lilac depth
varying vec2 vUv;
varying float vS;
varying float vF;
${PROJ05_INVERSE}
void main() {
  float r = length(vUv);
  if (r > 1.0 || uAlpha < 0.5 || vF < 0.02) discard;
#ifdef RIM
  if (r < 0.80) discard;
#else
  if (r > 0.86) discard;
#endif
  vec3 nrm = vec3(vUv, sqrt(max(0.0, 1.0 - r * r)));
  float h = fract(vS * 7.31);
  // a lit pearly sphere: white-lilac top-left, lilac middle, lavender-pink lower right (a few whiter / pinker bubbles)
  vec3 litC = mix(vec3(0.93, 0.91, 1.0), vec3(0.99, 0.97, 1.0), h);
  vec3 shC = mix(vec3(0.70, 0.64, 0.95), vec3(0.84, 0.66, 0.94), 0.5 + 0.5 * sin(vS * 11.0)) * (1.0 - 0.10 * uFB.z);
  float lt = clamp(dot(nrm, normalize(vec3(-0.5, 0.62, 0.6))), 0.0, 1.0);
  vec3 col = mix(shC, litC, smoothstep(0.05, 0.95, lt));
  col = mix(col, vec3(0.97, 0.64, 0.92), 0.30 * smoothstep(0.1, -0.95, vUv.y));      // pink bounce from the water
  // rim light on the shadow side (the bubble film seen edge-on), faintly pink <-> cyan
  float ang = atan(vUv.y, vUv.x) + vS * 6.2832;
  vec3 iri = mix(vec3(1.0, 0.74, 0.96), vec3(0.74, 0.95, 1.0), 0.5 + 0.5 * sin(ang * 2.0 + r * 5.0));
  float fr = smoothstep(0.64, 0.96, r) * (0.45 + 0.55 * (1.0 - lt));
  col = mix(col, mix(vec3(0.99, 0.97, 1.0), iri, 0.35), fr * 0.75);
  // crisp window highlight + tiny second glint
  float hl = smoothstep(0.20, 0.07, length((vUv - vec2(-0.36, 0.40)) * vec2(1.0, 1.35)));
  float hl2 = smoothstep(0.10, 0.03, length(vUv - vec2(0.36, -0.42)));
  col = mix(col, vec3(1.0), clamp((hl + 0.6 * hl2) * uFB.y, 0.0, 1.0));
  float a = 1.0;
#ifdef RIM
  a = 1.0 - uFB.x * smoothstep(0.86, 1.0, r);
#endif
  gl_FragColor = vec4(pjInverse(clamp(col, 0.0, 1.0)), a);
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
  const time = { value: 0 };
  const reflectedRiver = { value: null as THREE.Texture | null };
  const fade = (M04.num('m04fade0', 0.3)), fade1 = M04.num('m04fade1', 2.5);
  const out: { update(cam: THREE.Vector3, benny?: THREE.Vector3): void } = { update() {} };
  const updaters: ((a: number) => void)[] = [];
  let endCap: THREE.Mesh | null = null;

  if (M04.ring) {
    const ringTile = new THREE.TextureLoader().load(new URL('../../assets/textures/match04/tile_ring.png', import.meta.url).href, (t) => { t.needsUpdate = true; });
    ringTile.colorSpace = THREE.NoColorSpace; ringTile.flipY = false; ringTile.wrapS = THREE.RepeatWrapping; ringTile.wrapT = THREE.ClampToEdgeWrapping;
    ringTile.minFilter = THREE.LinearMipmapLinearFilter; ringTile.anisotropy = 8;
    const deepRim = on('cx04DeepRim');
    const gm = new THREE.ShaderMaterial({
      defines: {
        ...(deepRim ? { CX04_DEEP_RIM: deepRimIndex } : {}),
        ...(M04.river && on('cx04RiverReflection') ? { CX04_REFLECT_RIVER: 1 } : {}),
      },
      vertexShader: VERT, fragmentShader: GOLD_FRAG, side: THREE.DoubleSide, fog: false, extensions: { derivatives: true } as never,
      uniforms: { uPlate: shared.uPlate, uPjPost: shared.uPjPost, uPjRes: shared.uPjRes, uProjVP: shared.uProjVP,
        uAway: away, uAxO: { value: axO }, uAxD: { value: axD }, uAxU: { value: axU }, uAxR: { value: axR }, uNB: { value: M04.num('m04nb', 28) },
        uReflectedRiver: reflectedRiver, uRiverPlane: { value: new THREE.Vector4(0.02 - cy, z0, M04.num('m04xf', 2.1), M04.num('m04rk', 1)) }, uWaterTime: time,
        uP: { value: M04.num('m04ringp', 2.6) }, uLipBulb: { value: M04.num('m04lipbulb', 1) }, uBulbR: { value: (r + ctx.outerR) / 2 }, uLen: { value: len }, uRingTile: { value: ringTile }, uPaint: { value: M04.num('m04paint', M04.gold ? 0.8 : 1.4) }, uGoldY: { value: M04.gold ? 1 : 0 }, uCopper: { value: M04.num('m04copper', 0) }, uBulge: { value: M04.num('m04bulge', 0) }, uMouthT: { value: 0 }, uMouthTex: { value: null }, uMouthRho: { value: new THREE.Vector3(4.45, 3.25, M04.num('m04mro', -0.10)) }, uProjPos: shared.uProjPos, uTone: { value: new THREE.Vector4(M04.num('m04tb', 0.11), M04.num('m04tl', 0.38), M04.num('m04tm', 0.5), M04.num('m04ts', 0.45)) } },
    });
    const baseWidth = M04.num('m04ringgw', 1);
    const P = M04.num('m04ringp', 2.6); // ring period along the tunnel (painted ring spacing seen from the approved camera)
    // stepped polished washers: per period a broad band narrowing slightly toward the glow (faces the camera like the
    // painted bands), a rounded lip bead (hot spots), a step back out (the thin dark groove); a = distance down the tunnel
    const prof: { r: number; a: number; part: number }[] = [];
    const ringOf: number[] = [];
    const nP = Math.ceil(len / P);
    for (let k = 0; k < nP; k++) {
      const a = k * P;
      // Widen and round just this existing bead without moving its groove or neighbours.
      const isDeepRim = deepRim && k === deepRimIndex;
      const gw = baseWidth * (isDeepRim ? 1.45 : 1);
      const relief = isDeepRim ? 1.24 : 1;
      const pushP = (rr: number, aa: number, part: number) => { prof.push({ r: rr, a: aa, part }); ringOf.push(k); };
      pushP(r + 0.22, a + 0.01, 2);
      pushP(r + 0.17, a + 0.07, 0);
      pushP(r + 0.07, a + P * 0.5, 0);
      // r13 `m04ringgw` widens the lip bead + dark groove (the painted rings show a deep dark recess between bands)
      pushP(r - 0.05, a + P - 0.56 * gw, 0);
      pushP(r - 0.10 * relief, a + P - 0.48 * gw, 1);
      pushP(r - 0.22 * relief, a + P - 0.39 * gw, 1);
      pushP(r - 0.28 * Math.min(gw, 1.4), a + P - 0.27 * gw, 1);
      pushP(r - 0.23 * relief, a + P - 0.15 * gw, 1);
      pushP(r - 0.08, a + P - 0.07 * gw, 2);
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
        const k = M04.river ? THREE.MathUtils.smoothstep(ang, angW - M04.num('m04rf0', 0.95), angW - M04.num('m04rf1', 0.55)) : THREE.MathUtils.smoothstep(ang, angW - 0.45, angW - 0.1);
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
    endCap = cm;
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

  if (endCap && M04.num('m04end', 0) > 0) {
    // r16 `&m04end=1`: the distant glowing opening (END_FRAG): m04eg glow point height (fraction of r), m04eq ring shrink per
    // ring, m04ec core size, m04eh halo size, m04es glow strength, m04el lane half width on the far floor, m04ek ring contrast
    endCap.material = new THREE.ShaderMaterial({ vertexShader: END_VERT, fragmentShader: END_FRAG, side: THREE.DoubleSide, fog: false,
      extensions: { derivatives: true } as never,
      uniforms: { uPlate: shared.uPlate, uPjPost: shared.uPjPost, uPjRes: shared.uPjRes, uProjVP: shared.uProjVP, uAway: away, uTime: time,
        uC: { value: new THREE.Vector3(cx, cy, r) },
        uE: { value: new THREE.Vector4(M04.num('m04eg', -0.28), M04.num('m04eq', 0.78), M04.num('m04ec', 0.14), M04.num('m04eh', 0.55)) },
        uE2: { value: new THREE.Vector4((0.02 - cy) / r, M04.num('m04el', 0.62), M04.num('m04es', 1.25), M04.num('m04ek', 1.0)) } } });
    console.info('[match04] m04end', { water: (0.02 - cy) / r });
  }
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
    reflectedRiver.value = riv;
    riv.colorSpace = THREE.NoColorSpace; riv.flipY = false; riv.wrapS = riv.wrapT = THREE.RepeatWrapping;
    riv.minFilter = THREE.LinearMipmapLinearFilter; riv.anisotropy = 8;
    let sideBand: THREE.Texture | null = null;
    if (M04.num('m04sband', 0) > 0) {
      sideBand = new THREE.TextureLoader().load(new URL('../../assets/textures/match04/tile_side04.png', import.meta.url).href, (t) => { t.needsUpdate = true; });
      sideBand.colorSpace = THREE.NoColorSpace; sideBand.flipY = false; sideBand.wrapS = THREE.ClampToEdgeWrapping; sideBand.wrapT = THREE.RepeatWrapping;
      sideBand.minFilter = THREE.LinearMipmapLinearFilter; sideBand.anisotropy = 8;
    }
    // tiles04.json river3: lateral +-4 u, along 1.757 .. 6.409 u from Benny's checkpoint water point
    const rm = new THREE.ShaderMaterial({ vertexShader: RIVER_VERT, fragmentShader: RIVER_FRAG, defines: M04.num('cx04WaterSweep', 0) > 0 ? { SWEPT_WATERBANDS: 1 } : {}, side: THREE.DoubleSide, fog: false,
      extensions: { derivatives: true } as never, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4,
      uniforms: { uPlate: shared.uPlate, uPjPost: shared.uPjPost, uPjRes: shared.uPjRes, uProjVP: shared.uProjVP, uAway: away,
        uRiv: { value: riv }, uRivA: { value: new THREE.Vector4(4, 1.7572621, 4.6517529, M04.num('m04rk', 1.0)) }, uTime: time,
        uArr: { value: new THREE.Vector4(M04.num('m04ap', 5.6), 9.58, M04.num('m04aw', 1.0), M04.num('m04at', 0.21)) }, uZ0: { value: z0 },
        uLane: { value: new THREE.Vector3(M04.num('m04lane', 0), M04.num('m04lanew', 1.9), M04.num('m04lanes', 0.85)) },
        uLane3: { value: new THREE.Vector2(M04.num('m04lcd', 0), M04.num('m04lcw', 1.6)) },
        uLane4: { value: (() => { const s = (new URLSearchParams(location.search).get('m04lcn') ?? '').split(',').map(Number);
          return s.length === 2 && s.every(Number.isFinite) ? new THREE.Vector2(s[0], s[1]) : new THREE.Vector2(0, 0); })() },
        uLane2: { value: new THREE.Vector4(M04.num('m04lane2', 0), M04.num('m04lgl', 1.0), M04.num('m04lsp', 0.9), M04.num('m04lbr', 0)) },
        uEdge: { value: new THREE.Vector4(M04.num('m04edge', 0), arc[nX], M04.num('m04edgew', 0.45), M04.num('m04edges', 0.8)) },
        uSE: { value: new THREE.Vector2(M04.num('m04rse', 1), M04.num('m04rsl', 1.2)) },
        uPk: { value: new THREE.Vector4(M04.pink ? 1 : 0, M04.num('m04pkl', 1.05), M04.num('m04pko', 3.6), M04.num('m04pkw', 0.85)) },
        uPkH: { value: M04.num('m04pkh', 0) },
        // r15 `&m04sband=1`: painted swirl bands on the side water (m04sbs strength, m04sbi inner arc, m04sbl tile length u,
        // m04sbw inner blend width, m04sbf 1 = keep the lilac-white edge fringe on top, m04sbu tile part, m04sbn wander,
        // m04sbd0 / m04sbd1 far smoothing window ahead of the camera)
        // r16 defaults (= variant D, chosen by eye at f06 / t66 / hard right): bands from 2.0 u across, the cyan..pink part of the
        // tile (0.7), 10 u long satin stripes with a slow 0.5 u lateral wander, 0.95 strength
        uSB: { value: sideBand }, uSB1: { value: new THREE.Vector4(M04.num('m04sbw', 0.45), M04.num('m04sbf', 1), M04.num('m04sbu', 0.7), M04.num('m04sbn', 0.5)) },
        uSB2: { value: new THREE.Vector2(M04.num('m04sbd0', 0), M04.num('m04sbd1', 0)) },
        uSB0: { value: new THREE.Vector4(M04.num('m04sband', 0) > 0 ? M04.num('m04sbs', 0.95) : 0, M04.num('m04sbi', 2.0), arc[nX], M04.num('m04sbl', 10)) },
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
    // r14 `&m04foamr=L`: the painted foam clouds sit round the ENTRANCE RIM only — the edge banks stop L u inside the
    // opening (user: no foam walls inside the tunnel); the banks before the opening stay
    const rimL = M04.num('m04foamr', 1e9);
    // r15 `&m04fclu=1`: every puff becomes a LOW heap of MANY small shiny bubbles (the painted foam), same layout as the
    // kept L4 banks. `m04fch` heap height scale (low heaps), `m04fcs` cluster size scale, `m04fck` bubble count scale,
    // `m04fcr` smallest bubble radius (u). A separate random stream keeps every other random layout (bubbles) unchanged.
    const clu = M04.num('m04fclu', 0) > 0;
    const fch = clu ? M04.num('m04fch', 0.75) : 1, fcs = M04.num('m04fcs', 1.3), fck = M04.num('m04fck', 1.0), fcr = M04.num('m04fcr', 0.035);
    const fcb = M04.num('m04fcb', 1.25);   // bubble size scale inside a cluster
    let seed2 = 9871; const rnd2 = () => ((seed2 = (seed2 * 16807) % 2147483647) / 2147483647);
    const emit = (x: number, y: number, z: number, rad: number, s: number, base: number) => {
      if (!clu) { items.push({ p: new THREE.Vector3(x, y, z), r: rad, s }); return; }
      const R = rad * fcs;
      const n = Math.min(48, Math.max(4, Math.round((5 + 60 * R) * fck)));
      for (let i = 0; i < n; i++) {
        // a surface-biased point of a flattened dome round the puff centre (the hidden inside needs no bubbles)
        const th = rnd2() * Math.PI * 2, c = rnd2() * 1.6 - 0.6, sn = Math.sqrt(Math.max(0, 1 - c * c));
        const d = R * (0.35 + 0.55 * Math.sqrt(rnd2()));
        const big = rnd2() < 0.16;
        const rho = Math.max(fcr, R * fcb * (big ? 0.52 + rnd2() * 0.22 : 0.18 + Math.pow(rnd2(), 1.4) * 0.30));
        const py = Math.max(base + rho * 0.45, y + c * d * 0.7);
        items.push({ p: new THREE.Vector3(x + sn * Math.cos(th) * d * 1.05, py, z + sn * Math.sin(th) * d * 1.05), r: rho, s: rnd2() });
      }
    };
    for (const side of [-1, 1]) {
      let a = 0.2 + rnd() * 0.5;
      while (heaped && a < Math.min(len - 1, rimL)) {
        const f3 = M04.foam3;                                     // round 9: low soft banks hugging the river edge
        const cl = 0.5 + Math.pow(rnd(), 1.3) * 2.4;            // clump length along the river
        const H = (0.2 + Math.pow(rnd(), 1.8) * 1.1) * (f3 ? 0.35 : 1) * fch;   // heap height (a few tall heaps, many low ones)
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
          const ys = onWall ? RY + rnd() * (f3 ? 0.25 : 0.7) * env * fch : 0.02 + RY * tt * tt;
          const x = side * (onWall ? xW - 0.12 - rnd() * 0.15 : XF + (xW - XF) * tt - 0.05);
          const y = ys + rad * (0.25 + 0.4 * rnd()) * (clu ? 0.6 : 1) + hf * H;
          if (Math.hypot(x, y - cy) > r - 0.08) continue;
          emit(cx + x, y, z0 - a - t * cl, rad, rnd(), ys);
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
        const y = rad * 0.55 + rnd() * 0.3 * fch, z = z0 - a + rnd() * 0.3;
        emit(x, y, z, rad, rnd(), 0);
      }
    }
    // r14 m04foamn0 / m04foamn1: fade puffs out this close to the camera (big plain balls in the face while steering)
    const nearF = [M04.num('m04foamn0', 0.6), M04.num('m04foamn1', 1.2)];
    if (clu) {
      // r15: two passes of the same bubble instances — opaque cores, then the see-through rims blended on top
      const fb = new THREE.Vector3(M04.num('m04fce', 0.5), M04.num('m04fcg', 1.0), M04.num('m04fcd', 1.0));
      const vertShrink = SPRITE_VERT.replace('uniform vec2 uNear;', 'uniform vec2 uNear;\n#define SHRINK');
      const before = group.children.length;
      sprites(items, FOAMB_FRAG, 'm04_foam', 3, true, nearF);
      sprites(items, FOAMB_FRAG.replace('uniform float uAlpha;', 'uniform float uAlpha;\n#define RIM'), 'm04_foam_rim', 4, false, nearF);
      for (const m of group.children.slice(before) as THREE.Mesh[]) {
        const sm = m.material as THREE.ShaderMaterial;
        sm.vertexShader = vertShrink; sm.uniforms.uFB = { value: fb };
      }
      console.info('[match04] m04fclu', { bubbles: items.length });
    } else {
      sprites(items, M04.foam3 ? FOAM_FRAG.replace('uniform float uAlpha;', 'uniform float uAlpha;\n#define FOAM3') : FOAM_FRAG, 'm04_foam', 3, true, nearF);
    }
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
    // r13 `&m04a3tex=1`: the PAINTED arrow look — each chevron drawn once as a glowing image (glassy pale white-cyan bar,
    // bright white rim, soft cyan glow round it, square-cut ends along the flow, softened joins) on one leaning panel
    const tex = M04.num('m04a3tex', 0) > 0;
    let texMat: THREE.MeshBasicMaterial | null = null, texGeo: THREE.BufferGeometry | null = null;
    if (tex) {
      const mg = M04.num('m04a3tm', 0.35) * hw, U = hw + mg, y0 = mg, y1 = -(drop + th) - mg;
      const W = 512, H = Math.max(64, Math.round(W * (y0 - y1) / (2 * U)));
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      const c2 = cv.getContext('2d')!;
      const P = (u: number, y: number): [number, number] => [((u + U) / (2 * U)) * W, ((y0 - y) / (y0 - y1)) * H];
      const path = () => {
        c2.beginPath();
        const pts: [number, number][] = [[0, 0], [hw, -drop], [hw, -drop - th], [0, -th], [-hw, -drop - th], [-hw, -drop]];
        pts.forEach(([u, y], i) => { const [x, yy] = P(u, y); if (i) c2.lineTo(x, yy); else c2.moveTo(x, yy); });
        c2.closePath();
      };
      c2.lineJoin = 'round';
      c2.shadowColor = 'rgba(30,190,255,1)'; c2.shadowBlur = W * M04.num('m04a3gb', 0.07);
      c2.fillStyle = 'rgba(40,175,255,0.85)'; path(); c2.fill(); path(); c2.fill();
      c2.shadowBlur = W * 0.02; c2.shadowColor = 'rgba(120,230,255,1)';
      const gr = c2.createLinearGradient(0, P(0, 0)[1], 0, P(0, -drop - th)[1]);
      const fa = M04.num('m04a3fa', 0.88);
      gr.addColorStop(0, `rgba(240,253,255,${Math.min(1, fa + 0.08)})`); gr.addColorStop(0.5, `rgba(195,242,255,${fa})`); gr.addColorStop(1, `rgba(240,253,255,${Math.min(1, fa + 0.08)})`);
      c2.fillStyle = gr; path(); c2.fill();
      c2.shadowBlur = 0; c2.strokeStyle = 'rgba(255,255,255,1)'; c2.lineWidth = W * M04.num('m04a3rw', 0.016); path(); c2.stroke();
      const ct = new THREE.CanvasTexture(cv); ct.colorSpace = THREE.SRGBColorSpace; ct.anisotropy = 8;
      texMat = new THREE.MeshBasicMaterial({ map: ct, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
      texGeo = new THREE.PlaneGeometry(2 * U, y0 - y1).translate(0, (y0 + y1) / 2, 0);
      toLane(texGeo, 0.006);
    }
    const river = group.getObjectByName('m04_river') as THREE.Mesh | undefined;
    if (river) ((river.material as THREE.ShaderMaterial).uniforms.uArr.value as THREE.Vector4).y = 1e5;
    // r13 `&m04a3w2=1`: the painted chevrons are glowing WHITE bars with a bright cyan neon halo (r12 = pale cyan, dim halo)
    const neon = M04.num('m04a3w2', 0) > 0;
    const coreC = neon ? new THREE.Color(1.0, 1.0, 1.0) : new THREE.Color(0.86, 0.98, 1.0);
    const glowC = neon ? new THREE.Color(0.22, 0.86, 1.0) : new THREE.Color(0.10, 0.62, 1.0);
    for (let a = first; a < len - 6; a += sp) {
      const core = new THREE.MeshBasicMaterial({ color: coreC, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide });
      // r13 `&m04a3hb=1`: a deep-blue halo with NORMAL blending (the painted arrows pop as white bars in a blue glow; an
      // additive halo only whitened the bright cyan water round them)
      const hb = M04.num('m04a3hb', 0) > 0;
      const glow = new THREE.MeshBasicMaterial({ color: hb ? new THREE.Color(0.02, 0.50, 1.0) : glowC, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide, blending: hb ? THREE.NormalBlending : THREE.AdditiveBlending });
      const coreT = texMat ? texMat.clone() : null;
      if (coreT) glow.visible = false;                                   // the painted image carries its own glow
      // r13 `&m04a3lum=x`: the painted arrows are LUMINOUS — a second, additive copy of the painted arrow image makes the
      // white core and the cyan glow light up the water like neon glass (x = its strength)
      const lum = M04.num('m04a3lum', 0);
      if (coreT && lum > 0) {
        glow.visible = true; glow.map = coreT.map; glow.color.setScalar(lum); glow.blending = THREE.AdditiveBlending;
      }
      const m = new THREE.Mesh(texGeo ?? base, coreT ?? core), g = new THREE.Mesh(coreT && lum > 0 ? texGeo! : halo, glow);
      m.position.set(cx, 0, z0 - a); g.position.set(cx, 0, z0 - a - 0.002);
      m.renderOrder = 5; g.renderOrder = coreT && lum > 0 ? 6 : 4; m.name = 'm04_arrow3d'; g.name = 'm04_arrow3d_glow';   // luminous layer on top
      m.visible = g.visible = false;                                     // invisible during the projector depth bake
      group.add(g); group.add(m);
      arrowsOut.push({ mesh: m, za: z0 - a, mats: [coreT ?? core, glow] });
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
        core.opacity = M04.num('m04a3co', 0.95) * k; glow.opacity = go * k;
        arrowsOut[i].mesh.visible = arrowsOut[i + 1].mesh.visible = k > 0.01;
      }
    }
  };
  return out;
}
