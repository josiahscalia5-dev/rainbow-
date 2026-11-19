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
    col = mix(col, vec3(0.93, 0.52, 0.15), smoothstep(0.30, 0.95, rad));
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
    col = goldRamp(v);
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
    col = mix(col, wc2 * (0.55 + 0.6 * v), pk * (mouth ? 0.6 : 1.0));
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
  }
  col = clamp(col, 0.0, 1.0);
  // the approved view shows the approved pixels (the projector IS this camera there)
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
varying vec2 vUv;
varying float vS;
void main() {
  vUv = uv * 2.0 - 1.0;
  vS = aS;
  vec4 mv = viewMatrix * vec4(aB.xyz, 1.0);
  mv.xy += position.xy * aB.w * 2.0;
  gl_Position = projectionMatrix * mv;
}`;
const BUB_FRAG = /* glsl */ `
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform float uAlpha;
varying vec2 vUv;
varying float vS;
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
  gl_FragColor = vec4(pjInverse(col), clamp(alpha, 0.0, 1.0) * uAlpha);
}`;
const FOAM_FRAG = /* glsl */ `
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform float uAlpha;
varying vec2 vUv;
varying float vS;
${PROJ05_INVERSE}
void main() {
  float r = length(vUv);
  if (r > 1.0) discard;
  // a foam bubble ball as painted: lilac-white sphere shading, bright upper-left, violet-blue lower rim, soft edge
  vec3 nrm = vec3(vUv, sqrt(max(0.0, 1.0 - r * r)));
  float l = clamp(dot(nrm, normalize(vec3(-0.45, 0.6, 0.65))), 0.0, 1.0);
  vec3 col = mix(vec3(0.70, 0.68, 0.95), vec3(0.98, 0.96, 1.0), l);
  col = mix(col, vec3(0.98, 0.78, 0.95), 0.25 * smoothstep(0.6, 1.0, r) * (0.5 + 0.5 * sin(vS * 9.0)));
  col += vec3(1.0) * 0.5 * smoothstep(0.22, 0.0, length(vUv - vec2(-0.35, 0.4)));
  float alpha = 1.0 - smoothstep(0.88, 1.0, r);
  gl_FragColor = vec4(pjInverse(clamp(col, 0.0, 1.0)), alpha * uAlpha);
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
  const any = M04.ring || M04.foam || M04.bub || M04.arrow || M04.wave;
  if (!any) return null;
  group.updateMatrixWorld(true);
  const Mw = group.matrixWorld;
  const toW = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z).applyMatrix4(Mw);
  const axO = toW(cx, cy, z0), axD = toW(cx, cy, z0 - 1).sub(axO).normalize();
  const axU = toW(cx, cy + 1, z0).sub(axO).normalize(), axR = toW(cx + 1, cy, z0).sub(axO).normalize();
  const away = { value: 0 };
  const fade = (M04.num('m04fade0', 0.3)), fade1 = M04.num('m04fade1', 2.5);
  const out: { update(cam: THREE.Vector3): void } = { update() {} };
  const updaters: ((a: number) => void)[] = [];

  if (M04.ring) {
    const ringTile = new THREE.TextureLoader().load(new URL('../../assets/textures/match04/tile_ring.png', import.meta.url).href, (t) => { t.needsUpdate = true; });
    ringTile.colorSpace = THREE.NoColorSpace; ringTile.flipY = false; ringTile.wrapS = THREE.RepeatWrapping; ringTile.wrapT = THREE.ClampToEdgeWrapping;
    ringTile.minFilter = THREE.LinearMipmapLinearFilter; ringTile.anisotropy = 8;
    const gm = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: GOLD_FRAG, side: THREE.DoubleSide, fog: false, extensions: { derivatives: true } as never,
      uniforms: { uPlate: shared.uPlate, uPjPost: shared.uPjPost, uPjRes: shared.uPjRes, uProjVP: shared.uProjVP,
        uAway: away, uAxO: { value: axO }, uAxD: { value: axD }, uAxU: { value: axU }, uAxR: { value: axR }, uNB: { value: M04.num('m04nb', 28) },
        uP: { value: M04.num('m04ringp', 2.6) }, uLipBulb: { value: M04.num('m04lipbulb', 1) }, uBulbR: { value: (r + ctx.outerR) / 2 }, uLen: { value: len }, uRingTile: { value: ringTile }, uPaint: { value: M04.num('m04paint', 1.4) }, uTone: { value: new THREE.Vector4(M04.num('m04tb', 0.11), M04.num('m04tl', 0.38), M04.num('m04tm', 0.5), M04.num('m04ts', 0.45)) } },
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
        const k = THREE.MathUtils.smoothstep(ang, angW - 0.45, angW - 0.1);
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
    const mouth = lathe(mp, 192, () => -1);
    mouth.rotateX(-Math.PI / 2).translate(cx, cy, z0);
    const mm = new THREE.Mesh(mouth, gm); mm.name = 'm04_ring_mouth'; group.add(mm);
    // far glow instead of the flat end cap
    const cap = new THREE.CircleGeometry(r + 0.2, 64).translate(cx, cy, z0 - len);
    const nC = cap.attributes.position.count;
    cap.setAttribute('aK', new THREE.Float32BufferAttribute(new Float32Array(nC * 2).map((_, i) => (i % 2 === 0 ? 4 : 0)), 2));
    const cm = new THREE.Mesh(cap, gm); cm.name = 'm04_ring_glow'; group.add(cm);
    ctx.hideOld(['m04_tube', 'm04_mouth_ring', 'm04_tube_end']);
    console.info('[match04] m04ring', { period: P, rings: nP });
  }

  // sprite clouds (foam puffs, bubbles): world positions computed in the slide-local frame
  const sprites = (items: { p: THREE.Vector3; r: number; s: number }[], frag: string, name: string, order: number) => {
    const quad = new THREE.PlaneGeometry(1, 1);
    const g = new THREE.InstancedBufferGeometry();
    g.setIndex(quad.index); g.setAttribute('position', quad.attributes.position); g.setAttribute('uv', quad.attributes.uv);
    const aB = new Float32Array(items.length * 4), aS = new Float32Array(items.length);
    items.forEach((it, i) => { const w = it.p.clone().applyMatrix4(Mw); aB.set([w.x, w.y, w.z, it.r], i * 4); aS[i] = it.s; });
    g.setAttribute('aB', new THREE.InstancedBufferAttribute(aB, 4));
    g.setAttribute('aS', new THREE.InstancedBufferAttribute(aS, 1));
    g.instanceCount = items.length;
    const alpha = { value: 0 };
    const m = new THREE.ShaderMaterial({ vertexShader: SPRITE_VERT, fragmentShader: frag, transparent: true, depthWrite: false, fog: false,
      uniforms: { uPjPost: shared.uPjPost, uPjRes: shared.uPjRes, uAlpha: alpha } });
    const mesh = new THREE.Mesh(g, m);
    mesh.name = name; mesh.frustumCulled = false; mesh.renderOrder = order; mesh.visible = false; // invisible during the projector depth bake
    group.add(mesh);
    updaters.push((a) => { alpha.value = a; mesh.visible = a > 0.01; });
  };
  let seed = 4321; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const waterHalf = Math.sqrt(Math.max(0, r * r - cy * cy)); // where the water meets the tunnel wall
  if (M04.foam) {
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
    sprites(items, FOAM_FRAG, 'm04_foam', 3);
  }
  if (M04.bub) {
    const items: { p: THREE.Vector3; r: number; s: number }[] = [];
    for (let i = 0; i < 110; i++) {
      const a = -6 + rnd() * (len - 4);
      const th = (rnd() * 2 - 1) * 2.0, rad = 0.04 + Math.pow(rnd(), 2.6) * 0.3;
      const rr = (0.45 + 0.5 * Math.sqrt(rnd())) * (r - 0.5);
      const y = cy + rr * Math.cos(th);
      if (y < rad + 0.25) continue;
      items.push({ p: new THREE.Vector3(cx + rr * Math.sin(th), y, z0 - a), r: rad, s: rnd() });
    }
    sprites(items, BUB_FRAG, 'm04_bubbles', 6);
  }

  out.update = (cam: THREE.Vector3) => {
    away.value = THREE.MathUtils.smoothstep(cam.distanceTo(proj.position), fade, fade1);
    const a2 = THREE.MathUtils.smoothstep(cam.distanceTo(proj.position), 0.4, 1.6);
    for (const u of updaters) u(a2);
  };
  return out;
}
