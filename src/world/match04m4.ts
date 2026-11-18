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

// polished gold: everything in DISPLAY colours (measured on the approved picture), then pjInverse like the plate
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
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
varying vec2 vK;            // x: part (0 band, 1 lip, 2 groove, 3 opening face, 4 end glow), y: ring index
${PROJ05_INVERSE}
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
void main() {
  vec3 V = normalize(cameraPosition - vW);
  vec3 n = normalize(vN);
  if (dot(n, V) < 0.0) n = -n;
  vec3 q = vW - uAxO;
  float al = dot(q, uAxD);
  vec3 qr = q - uAxD * al;
  float rr = length(qr);
  float ang = atan(dot(qr, uAxR), dot(qr, uAxU));         // 0 = tunnel top
  vec3 R = reflect(-V, n);
  float fw = dot(R, uAxD);                                 // reflection toward the warm glow down the tunnel
  float dn = -dot(R, uAxU);                                // reflection toward the water below
  float part = vK.x;
  vec3 col;
  if (part > 3.5) {
    // the far glow of the tunnel (painted vanishing point): warm white core -> orange
    float rad = clamp(rr / 3.6, 0.0, 1.0);
    col = mix(vec3(1.0, 0.97, 0.86), vec3(1.0, 0.70, 0.38), smoothstep(0.0, 1.0, rad));
  } else {
    // art-directed polished gold in the approved picture's display colours: shadow (157,67,65) / mid (210,116,71) /
    // lit (251,190,106) / hot glint (254,250,220); saturated orange, never the grey-tan of a physical reflection
    bool mouth = vK.y < -0.5;
    float u = fract(al / uP);                                // position inside one ring period (0 groove .. 1 lip)
    float band = smoothstep(0.05, 0.95, u);
    float streak = 0.5 + 0.5 * sin(ang * 3.0 + 1.7 + 0.8 * sin(ang * 7.0));
    float dc = distance(cameraPosition, vW);
    float sp = pow(max(dot(R, normalize(uAxD * 0.75 + uAxU * 0.55)), 0.0), 18.0) + 0.7 * pow(max(dot(R, normalize(uAxD * 0.8 - uAxR * 0.5)), 0.0), 22.0);
    if (mouth) {
      // the washer opening: bright polished gold face, glowing lips
      col = mix(vec3(0.90, 0.52, 0.18), vec3(1.0, 0.74, 0.36), 0.5 + 0.5 * sin(ang * 2.0 + 0.6));
      col = mix(col, vec3(1.0, 0.80, 0.42), 0.35 * smoothstep(0.3, 0.95, dot(n, V)) * streak);
      if (part > 0.5 && part < 1.5) col = mix(col, vec3(1.0, 0.88, 0.58), smoothstep(0.55, 0.95, dot(n, V)) * (0.4 + 0.5 * streak));
      if (part > 1.5 && part < 2.5) col = vec3(0.55, 0.22, 0.10);
    } else {
      float a = clamp(0.30 + 0.50 * band + 0.30 * (streak - 0.5), 0.0, 1.0);
      col = mix(vec3(0.58, 0.24, 0.13), vec3(0.88, 0.47, 0.19), a);
      col = mix(col, vec3(1.0, 0.72, 0.34), 0.5 * smoothstep(0.55, 0.98, fw) * smoothstep(0.35, 1.0, band));
      // the tunnel brightens toward its glowing far end
      col = mix(col, vec3(1.0, 0.74, 0.40), 0.45 * smoothstep(14.0, 44.0, dc));
      // lips: a thin hot line where the bead faces the viewer, orange-gold elsewhere; grooves: dark copper
      if (part > 0.5 && part < 1.5) col = mix(col, vec3(1.0, 0.90, 0.60), smoothstep(0.35, 0.9, dot(n, V)) * (0.5 + 0.4 * streak));
      if (part > 1.5 && part < 2.5) col = mix(col, vec3(0.33, 0.10, 0.06), 0.8);
    }
    // pink / violet / cyan reflections of the swirl water, strongest on the lower walls
    float hue = 0.5 + 0.5 * sin(ang * 2.3 + al * 0.45 + h21(vec2(floor(al / 2.0), 3.0)) * 6.0);
    vec3 wc = mix(vec3(0.96, 0.40, 0.72), vec3(0.52, 0.52, 1.0), hue);
    float wr = smoothstep(-0.1, 0.7, dn) * (0.35 + 0.65 * smoothstep(-0.3, 0.7, -cos(ang)));
    col = mix(col, wc, 0.38 * wr * (mouth ? 0.5 : 1.0));
    col += vec3(1.0, 0.82, 0.48) * 0.30 * sp;
    // amber bulbs on the washer opening's face (and, if asked, on the ring lips)
    if ((part > 2.5 && part < 3.5) || (uLipBulb > 0.5 && part > 0.5 && part < 1.5 && !mouth)) {
      float nb = part > 2.5 ? uNB : uNB * 0.75;
      float cell = fract(ang / 6.2831853 * nb + 0.5 * mod(vK.y, 2.0)) - 0.5;
      float arc = cell * 6.2831853 * rr / nb;               // world units along the ring
      float rad = part > 2.5 ? abs(rr - uBulbR) : 0.0;
      float d = length(vec2(arc, rad));
      float bs = part > 2.5 ? 0.07 : 0.045;
      col += vec3(1.0, 0.60, 0.20) * 0.45 * smoothstep(bs * 3.0, 0.0, d);
      col = mix(col, vec3(1.0, 0.96, 0.82), smoothstep(bs, bs * 0.4, d));
    }
    // star glints scattered on the polished gold (painted white sparkles)
    vec2 gc = vec2(ang / 6.2831853 * 34.0, al * 1.3);
    vec2 gi = floor(gc), gf = fract(gc) - 0.5;
    float gh = h21(gi + vK.y * 7.0);
    if (gh > 0.9) {
      vec2 o = (vec2(h21(gi + 1.3), h21(gi + 2.7)) - 0.5) * 0.6;
      vec2 p = (gf - o) * vec2(1.0, 0.7);
      float g = smoothstep(0.09, 0.0, length(p)) + 0.5 * smoothstep(0.02, 0.0, abs(p.x)) * smoothstep(0.3, 0.0, abs(p.y)) + 0.5 * smoothstep(0.02, 0.0, abs(p.y)) * smoothstep(0.3, 0.0, abs(p.x));
      col += vec3(1.0, 0.95, 0.82) * g * 0.75;
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
    const gm = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: GOLD_FRAG, side: THREE.DoubleSide, fog: false,
      uniforms: { uPlate: shared.uPlate, uPjPost: shared.uPjPost, uPjRes: shared.uPjRes, uProjVP: shared.uProjVP,
        uAway: away, uAxO: { value: axO }, uAxD: { value: axD }, uAxU: { value: axU }, uAxR: { value: axR }, uNB: { value: M04.num('m04nb', 28) },
        uP: { value: M04.num('m04ringp', 2.4) }, uLipBulb: { value: M04.num('m04lipbulb', 0) }, uBulbR: { value: (r + ctx.outerR) / 2 } },
    });
    const P = M04.num('m04ringp', 2.4); // ring period along the tunnel (painted stacked bands)
    // corrugated tunnel wall: per period a band that narrows slightly toward the glow (faces the camera like the painted
    // stacked bands), a rounded lip bead with bulbs, a dark groove; axial a = distance down the tunnel from the mouth
    const prof: { r: number; a: number; part: number }[] = [];
    const ringOf: number[] = [];
    const nP = Math.ceil(len / P);
    for (let k = 0; k < nP; k++) {
      const a = k * P;
      const pushP = (rr: number, aa: number, part: number) => { prof.push({ r: rr, a: aa, part }); ringOf.push(k); };
      pushP(r + 0.14, a + 0.02, 2);
      pushP(r + 0.08, a + 0.10, 0);
      pushP(r - 0.02, a + P * 0.45, 0);
      pushP(r - 0.10, a + P - 0.50, 0);
      pushP(r - 0.12, a + P - 0.44, 1);
      pushP(r - 0.22, a + P - 0.36, 1);
      pushP(r - 0.26, a + P - 0.27, 1);
      pushP(r - 0.22, a + P - 0.18, 1);
      pushP(r - 0.10, a + P - 0.10, 2);
      pushP(r + 0.14, a + P - 0.02, 2);
    }
    const tun = lathe(prof, 160, (j) => ringOf[j]);
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
