/**
 * r30 scenery specialist (`e30*` switches, qa/match/06/r30/scen06/NOTES.md) — Screen 06 tunnel look while Benny swims, toward the
 * approved picture + the user's four storyboard panels. Every part is opt-in; without an `e30*` switch nothing here runs.
 *   `&e30band=1`  the designed curl bands (route06curl.json rings, every 22 u) as SUBSTANTIAL polished copper-gold bands: broad
 *                 (`&e30bw=` u, default 7.2 = a third of the spacing), deep (`&e30bd=`, default 0.95 u), two raised lips, a gently domed
 *                 face, long soft highlights around the ring, no bulb rows. Same projection hand-over as the old rings (start view
 *                 unchanged), same far haze.
 *   `&e30wall=1`  the tunnel walls after the start view: brushed lilac-purple drum metal with small, clean, regular rounded slots
 *                 (anti-aliased by pixel footprint) and a soft sheen, instead of the magnified painted wall tile (blurry, stretched
 *                 slots, visible tile repeats). The approved start view keeps its projected pixels.
 *   `&e30far=1`   the far end: Screen 07's tube is shown only over the last `&e30far07=` u (default 30, ~2 s) and the 06 tunnel's end
 *                 (the doorway to 07) carries a ray-cast continuation of the SAME purple-and-gold tunnel (walls, bands, the river)
 *                 receding into deep purple, which cross-fades into 07's real tube over the last ~1.5 s (`&e30fade=d0,d1`, u before
 *                 the 07 entrance, default 28,8). Cause of the pale peach circle it replaces: 07's own tube materials blend toward a
 *                 warm '#ffd08a' far glow with camera distance (environment.ts wallGlow/tubeGlow, near 48 u, far 105 u), so the 07
 *                 tube seen from inside 06 through the 06 tunnel's open end (90-200 u away) was entirely that glow.
 */
import * as THREE from 'three';

export interface E30Flags { band: boolean; bw: number; bd: number; wall: boolean; far: boolean; far07: number; fade: [number, number] }

export function e30Flags(qs: URLSearchParams | null): E30Flags {
  const num = (k: string, d: number) => { const v = Number(qs?.get(k)); return qs?.get(k) != null && qs?.get(k) !== '' && Number.isFinite(v) ? v : d; };
  const fd = (qs?.get('e30fade') ?? '').split(',').map(Number);
  return {
    band: qs?.get('e30band') === '1', bw: num('e30bw', 7.2), bd: num('e30bd', 0.95),
    wall: qs?.get('e30wall') === '1',
    far: qs?.get('e30far') === '1', far07: num('e30far07', 30),
    fade: fd.length === 2 && fd.every(Number.isFinite) && fd[0] > fd[1] ? [fd[0], fd[1]] : [28, 8],
  };
}

/** Game.ts hook: how far before the 07 entrance Screen 07's tube is shown (null = unchanged) */
export function e30Show07(): number | null {
  if (typeof location === 'undefined') return null;
  const f = e30Flags(new URLSearchParams(location.search));
  return f.far ? Math.max(f.far07, f.fade[0] + 1) : null;
}

// polished copper-gold band (display values): th = angle round the ring (world-anchored), v = 0..1 across the band
// (0 = the camera-facing edge), n = normal, V = to camera, T = tunnel direction at the band
const GOLD_GLSL = /* glsl */ `
vec3 e30Gold(float th, float v, vec3 n, vec3 V, vec3 T, vec3 U) {
  vec3 n2 = dot(n, V) < 0.0 ? -n : n;
  vec3 Rf = reflect(-V, n2);
  vec3 dark = vec3(0.50, 0.19, 0.08), mid = vec3(0.86, 0.42, 0.15), gold = vec3(0.98, 0.66, 0.30), hot = vec3(1.0, 0.93, 0.74);
  // across the band: darker toward the edges, a broad bright body, two raised lips with bright lines, two fine grooves
  float body = smoothstep(0.02, 0.22, v) * smoothstep(0.98, 0.78, v);
  vec3 c = mix(dark, mid, 0.25 + 0.75 * body);
  c = mix(c, gold, 0.55 * exp(-pow((v - 0.50) / 0.22, 2.0)));
  float lip = exp(-pow((v - 0.12) / 0.028, 2.0)) + exp(-pow((v - 0.88) / 0.028, 2.0));
  float groove = exp(-pow((v - 0.20) / 0.016, 2.0)) + exp(-pow((v - 0.80) / 0.016, 2.0)) + 0.6 * exp(-pow((v - 0.36) / 0.012, 2.0)) + 0.6 * exp(-pow((v - 0.64) / 0.012, 2.0));
  c *= 1.0 - 0.38 * groove;
  c = mix(c, vec3(1.0, 0.84, 0.52), 0.65 * lip);
  // long soft highlights round the ring (world-anchored, a few broad lobes of different strength)
  float l1 = pow(0.5 + 0.5 * cos(th - 1.45), 10.0), l2 = pow(0.5 + 0.5 * cos(th - 0.35), 16.0), l3 = pow(0.5 + 0.5 * cos(th - 2.65), 16.0);
  float l4 = pow(0.5 + 0.5 * cos(th + 0.6), 22.0) * 0.6 + pow(0.5 + 0.5 * cos(th - 3.6), 22.0) * 0.6;
  float lob = l1 + 0.8 * l2 + 0.8 * l3 + l4;
  float acr = exp(-pow((v - 0.44) / 0.16, 2.0)) + 0.7 * exp(-pow((v - 0.70) / 0.07, 2.0));
  c = mix(c, hot, clamp(lob * acr * 0.95, 0.0, 0.92));
  // view-dependent polish: the warm light down the tunnel + a softer one from above, fresnel to warm white
  float sp = pow(max(dot(Rf, normalize(T + U * 0.25)), 0.0), 14.0) * 0.55 + pow(max(dot(Rf, U), 0.0), 6.0) * 0.18;
  c += vec3(1.0, 0.82, 0.55) * sp * (0.4 + 0.6 * body);
  float fr = pow(1.0 - abs(dot(n2, V)), 4.0);
  c = mix(c, vec3(1.0, 0.86, 0.62), fr * 0.25);
  return clamp(c, 0.0, 1.0);
}
`;

// brushed lilac-purple drum metal with small rounded slots; q = (arc length round the tunnel, axial position) in u
const WALL_GLSL = /* glsl */ `
vec3 e30Wall(vec2 q, vec3 n, vec3 V, vec3 T) {
  vec3 n2 = dot(n, V) < 0.0 ? -n : n;
  float fw = dot(reflect(-V, n2), T);
  float lit = smoothstep(-0.8, 0.9, fw);
  vec3 base = mix(vec3(0.40, 0.15, 0.56), vec3(0.62, 0.30, 0.80), lit);
  // brushed grain + broad soft sheen bands running round the drum (world-anchored)
  float grain = sin(q.y * 37.0 + sin(q.x * 0.9) * 2.0) * 0.5 + sin(q.y * 71.0 + q.x * 0.31) * 0.5;
  base *= 1.0 + 0.035 * grain;
  float sh = pow(0.5 + 0.5 * sin(q.x * 0.21 + 0.8), 6.0) * 0.6 + pow(0.5 + 0.5 * sin(q.x * 0.13 - 1.1), 10.0) * 0.5;
  base = mix(base, vec3(0.86, 0.62, 0.98), 0.32 * sh * (0.5 + 0.5 * lit));
  base += vec3(0.95, 0.70, 1.0) * 0.20 * pow(max(fw, 0.0), 10.0);
  // slots: rows round the drum (long axis round it), staggered; arc pitch 0.80 u, row pitch 0.56 u, slot 0.40 x 0.13 u
  vec2 pitch = vec2(0.80, 0.56);
  float row = floor(q.y / pitch.y);
  vec2 p = vec2((fract(q.x / pitch.x + 0.5 * mod(row, 2.0)) - 0.5) * pitch.x, (fract(q.y / pitch.y) - 0.5) * pitch.y);
  float d = length(max(abs(p) - vec2(0.135, 0.0), 0.0)) - 0.065;
  float aa = max(fwidth(d), 1e-4);
  float cov = 1.0 - smoothstep(-aa, aa, d);
  // footprint: once a slot is smaller than ~3 px it becomes its average darkening (no shimmer, no moire)
  float fp = max(fwidth(q.x) / pitch.x, fwidth(q.y) / pitch.y);
  float far = smoothstep(0.12, 0.35, fp);
  float mean = 0.24;
  vec3 hole = vec3(0.16, 0.03, 0.20);
  float rim = (1.0 - smoothstep(-aa, aa, abs(d - 0.02) - 0.012)) * step(0.0, p.y) * (1.0 - far);
  vec3 c = mix(base, hole, mix(cov, mean, far));
  c += vec3(0.95, 0.72, 1.0) * 0.16 * rim;
  return clamp(c, 0.0, 1.0);
}
`;

const injectGlsl = (src: string, glsl: string) => src.replace('void main() {', glsl + '\nvoid main() {');

/** the band material: match06's projected-scenery material (approved pixels at the start view) with the e30 gold shading */
export function e30PatchBandMat(m: THREE.ShaderMaterial, T: THREE.Vector3, U: THREE.Vector3) {
  m.uniforms.uE30T = { value: T.clone() };
  m.uniforms.uE30U = { value: U.clone() };
  m.fragmentShader = injectGlsl(m.fragmentShader, 'uniform vec3 uE30T;\nuniform vec3 uE30U;\n' + GOLD_GLSL)
    .replace('vec3 gc = texture2D(uRingTex, vTile).rgb;', 'vec3 gc = e30Gold(vTile.x, vTile.y, nn, V, normalize(uE30T), normalize(uE30U));');
}

/** the wall material: after the start view the painted tile gives way to the e30 drum metal (tube coordinates from vTile) */
export function e30PatchWallMat(m: THREE.ShaderMaterial, tt: { period: number; anglePeriod: number; wallAngle: [number, number] }, kS: number, R: number, swapped: boolean) {
  m.uniforms.uE30W = { value: new THREE.Vector4(tt.period, tt.anglePeriod, tt.wallAngle[0], kS) };
  m.uniforms.uE30R = { value: R };
  m.uniforms.uE30Sw = { value: swapped ? 1 : 0 };
  m.fragmentShader = injectGlsl(m.fragmentShader, 'uniform vec4 uE30W;\nuniform float uE30R;\nuniform float uE30Sw;\n' + WALL_GLSL)
    .replace('vec3 nn = normalize(vN);', `vec3 nn = normalize(vN);
  if (uFloor < 0.5 && uRing < 0.5) {
    vec2 tq = uE30Sw > 0.5 ? vTile : vTile.yx; // (axial tile coord, angle tile coord)
    float aAx = tq.x * uE30W.x - uE30W.w, th = tq.y * uE30W.y + uE30W.z;
    vec3 Vw = normalize(cameraPosition - vW);
    vec3 Tw = normalize(cross(nn, cross(vec3(0.0, 1.0, 0.0), nn)) + vec3(1e-4));
    pc = e30Wall(vec2(th * uE30R, aAx), nn, Vw, normalize(dFdx(vW) + dFdy(vW) + vec3(1e-4)) * 0.0 + Vw * -1.0);
  }`);
}

/** broad band geometry: one lathe per ring around its own frame (p = centre, t = tunnel direction, r/u = frame), radius R */
export function buildE30Bands(rings: { p: THREE.Vector3; t: THREE.Vector3; r: THREE.Vector3; u: THREE.Vector3; R: number }[], W: number, D: number, NS = 160) {
  const h = W / 2;
  const prof: [number, number][] = [[0.3, -h], [-0.25 * D, -h], [-0.85 * D, -h + 0.1], [-D, -h + 0.25], [-D, -h + 0.45], [-0.86 * D, -h + 0.62]];
  for (let k = 1; k < 10; k++) { const f = k / 10; prof.push([-0.86 * D - 0.1 * D * Math.sin(Math.PI * f), -h + 0.62 + f * (W - 1.24)]); }
  prof.push([-0.86 * D, h - 0.62], [-D, h - 0.45], [-D, h - 0.25], [-0.85 * D, h - 0.1], [-0.25 * D, h], [0.3, h]);
  const vP: number[] = [0];
  for (let i = 1; i < prof.length; i++) vP.push(vP[i - 1] + Math.hypot(prof[i][0] - prof[i - 1][0], prof[i][1] - prof[i - 1][1]));
  const L = vP[vP.length - 1];
  const np = prof.length, pos: number[] = [], tile: number[] = [], ls: number[] = [], idx: number[] = [];
  let base = 0;
  const dir = new THREE.Vector3();
  for (const g of rings) {
    for (let i = 0; i <= NS; i++) {
      const ph = (i / NS) * Math.PI * 2;
      dir.copy(g.r).multiplyScalar(Math.cos(ph)).addScaledVector(g.u, Math.sin(ph));
      for (let j = 0; j < np; j++) {
        const [x, y] = prof[j];
        const p = g.p.clone().addScaledVector(g.t, y).addScaledVector(dir, g.R + x);
        pos.push(p.x, p.y, p.z); tile.push(ph, vP[j] / L); ls.push(y, 0);
      }
    }
    for (let i = 0; i < NS; i++) for (let j = 0; j < np - 1; j++) {
      const a = base + i * np + j, b = a + 1, c = a + np, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    base += (NS + 1) * np;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('aTile', new THREE.Float32BufferAttribute(tile, 2));
  geo.setAttribute('aLS', new THREE.Float32BufferAttribute(ls, 2));
  geo.setIndex(idx); geo.computeVertexNormals();
  return geo;
}

const PORTAL_VERT = /* glsl */ `
varying vec3 vW;
void main() { vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }`;

const NSEG = 16, NBAND = 10;
const PORTAL_FRAG = (inv: string) => /* glsl */ `
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform vec3 uC; uniform vec3 uT; uniform vec3 uR; uniform vec3 uU;
uniform float uRad; uniform float uAlpha;
uniform float uBandZ[${NBAND}]; uniform vec2 uBandWD;
uniform vec3 uRP[${NSEG}]; uniform vec3 uRT[${NSEG}]; uniform vec3 uRR[${NSEG}]; uniform vec3 uRU[${NSEG}]; uniform float uRL[${NSEG}];
uniform vec2 uRW;
uniform vec4 uHaze; uniform vec3 uHazeCol; uniform vec4 uDeep;
uniform float uTime;
varying vec3 vW;
${inv}
${GOLD_GLSL}
${WALL_GLSL}
// exit distance of a ray (o, d in the tube frame, o inside) from the cylinder of radius r round the tube axis
float cylExit(vec3 o, vec3 d, float r) {
  float a = dot(d.xy, d.xy), b = dot(o.xy, d.xy), c = dot(o.xy, o.xy) - r * r;
  if (a < 1e-6) return 1e6;
  float q = b * b - a * c; if (q < 0.0) return -1.0;
  return (-b + sqrt(q)) / a;
}
void main() {
  vec3 ro = cameraPosition, rd = normalize(vW - cameraPosition);
  vec3 o = vec3(dot(ro - uC, uR), dot(ro - uC, uU), dot(ro - uC, uT));
  vec3 d = vec3(dot(rd, uR), dot(rd, uU), dot(rd, uT));
  float W = uBandWD.x, D = uBandWD.y, Rb = uRad - D;
  // nearest surface: the wall, a band's camera-facing face or its inner face, or the river
  float lam = cylExit(o, d, uRad); int kind = 0; float vB = 0.5; vec3 nrm = vec3(0.0);
  if (lam < 0.0) lam = 1e6;
  float lamB = cylExit(o, d, Rb);
  for (int k = 0; k < ${NBAND}; k++) {
    float z0 = uBandZ[k] - 0.5 * W;
    if (uBandZ[k] < -1e3) continue;
    if (d.z > 1e-4) {
      float lf = (z0 - o.z) / d.z;
      vec2 hp = o.xy + d.xy * lf; float rr = length(hp);
      if (lf > 0.0 && lf < lam && rr > Rb && rr < uRad + 0.3) { lam = lf; kind = 1; vB = 0.03; nrm = -uT; }
    }
    if (lamB > 0.0) { float zb = o.z + d.z * lamB; if (zb > z0 && zb < z0 + W && lamB < lam) { lam = lamB; kind = 1; vB = 0.06 + 0.88 * (zb - z0) / W; vec2 hp = o.xy + d.xy * lamB; nrm = -normalize(uR * hp.x + uU * hp.y); } }
  }
  vec3 wc = vec3(0.0);
  for (int i = 0; i < ${NSEG}; i++) {
    float den = dot(rd, uRU[i]); if (abs(den) < 1e-5) continue;
    float l = dot(uRP[i] - ro, uRU[i]) / den;
    if (l <= 0.0 || l >= lam) continue;
    vec3 h = ro + rd * l - uRP[i];
    float al = dot(h, uRT[i]), lt = dot(h, uRR[i]);
    if (al < -0.05 || al > uRL[i] + 0.05 || abs(lt) > uRW.y) continue;
    lam = l; kind = 2; wc = vec3(lt, al, float(i));
  }
  vec3 hw = ro + rd * lam;
  vec3 hl = o + d * lam;
  float dist = lam;
  vec3 V = -rd;
  vec3 col;
  if (kind == 2) {
    // the river continuing: cyan water with pink-violet edges and soft white-lilac foam banks
    float a = abs(wc.x) / uRW.x;
    vec3 w = mix(vec3(0.30, 0.86, 1.0), vec3(0.62, 0.95, 1.0), 0.5 + 0.5 * sin(wc.y * 1.7 + wc.x * 2.3 - uTime * 3.0));
    w = mix(w, vec3(0.95, 0.45, 0.95), smoothstep(0.55, 0.95, a));
    float fo = smoothstep(0.95, 1.08, a);
    col = mix(w, vec3(0.92, 0.88, 1.0), fo);
  } else {
    float th = atan(hl.y, hl.x);
    vec3 n = kind == 1 ? nrm : -normalize(uR * hl.x + uU * hl.y);
    if (kind == 1) col = e30Gold(th, vB, n, V, uT, uU);
    else col = e30Wall(vec2(th * uRad, hl.z), n, V, uT);
  }
  // the 06 tunnel's far fade into the painted deep-tunnel purple, then the storyboard's deep purple far down
  if (uHaze.w > 0.5) col = mix(col, uHazeCol, uHaze.z * smoothstep(uHaze.x, uHaze.y, dist));
  col = mix(col, uDeep.rgb, uDeep.w * smoothstep(uHaze.y - 20.0, uHaze.y + 160.0, dist));
  gl_FragColor = vec4(pjInverse(col), uAlpha);
}`;

export interface E30Portal { mesh: THREE.Mesh; update(sBenny: number, time: number): void }

/**
 * the ray-cast continuation of the 06 tunnel behind its end (the doorway into 07): a disc in the doorway plane, depth-tested (the
 * river, Benny and the 06 walls in front of it stay), drawn after the opaque scene; fades out over the last ~1.5 s before 07
 */
export function buildE30Portal(o: {
  c: THREE.Vector3; t: THREE.Vector3; r: THREE.Vector3; u: THREE.Vector3; R: number; bandZ: number[]; bandW: number; bandD: number;
  river: { p: THREE.Vector3; t: THREE.Vector3; r: THREE.Vector3; u: THREE.Vector3; len: number }[]; rw: [number, number];
  haze: THREE.Vector4; hazeCol: THREE.Vector3; pj: { uPjPost: { value: THREE.Vector4 }; uPjRes: { value: THREE.Vector2 } }; inv: string;
  sDoor: number; fade: [number, number];
}): E30Portal {
  const bz = new Array(NBAND).fill(-1e4); o.bandZ.slice(0, NBAND).forEach((z, i) => { bz[i] = z; });
  const seg = o.river.slice(0, NSEG);
  const pad = <T,>(a: T[], f: T) => { const b = a.slice(); while (b.length < NSEG) b.push(f); return b; };
  const far = new THREE.Vector3(0, -1e5, 0);
  const m = new THREE.ShaderMaterial({
    vertexShader: PORTAL_VERT, fragmentShader: PORTAL_FRAG(o.inv), side: THREE.DoubleSide, fog: false,
    transparent: false, blending: THREE.CustomBlending, blendSrc: THREE.SrcAlphaFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
    depthTest: true, depthWrite: true,
    uniforms: {
      uPjPost: o.pj.uPjPost, uPjRes: o.pj.uPjRes,
      uC: { value: o.c.clone() }, uT: { value: o.t.clone() }, uR: { value: o.r.clone() }, uU: { value: o.u.clone() },
      uRad: { value: o.R }, uAlpha: { value: 1 }, uTime: { value: 0 },
      uBandZ: { value: bz }, uBandWD: { value: new THREE.Vector2(o.bandW, o.bandD) },
      uRP: { value: pad(seg.map((q) => q.p.clone()), far) }, uRT: { value: pad(seg.map((q) => q.t.clone()), new THREE.Vector3(0, 0, 1)) },
      uRR: { value: pad(seg.map((q) => q.r.clone()), new THREE.Vector3(1, 0, 0)) }, uRU: { value: pad(seg.map((q) => q.u.clone()), new THREE.Vector3(0, 1, 0)) },
      uRL: { value: pad(seg.map((q) => q.len), 0) }, uRW: { value: new THREE.Vector2(o.rw[0], o.rw[1]) },
      uHaze: { value: o.haze.clone() }, uHazeCol: { value: o.hazeCol.clone() }, uDeep: { value: new THREE.Vector4(0.27, 0.07, 0.40, 0.85) },
    },
  });
  const geo = new THREE.CircleGeometry(o.R + 0.6, 96);
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.copy(o.c);
  mesh.lookAt(o.c.clone().sub(o.t));
  mesh.name = 'm06_e30portal'; mesh.frustumCulled = false; mesh.renderOrder = 10;
  mesh.visible = false; // shown from the first update (not in the projector depth bake)
  return {
    mesh,
    update(s, time) {
      const a = 1 - THREE.MathUtils.smoothstep(s, o.sDoor - o.fade[0], o.sDoor - o.fade[1]);
      m.uniforms.uAlpha.value = a;
      m.uniforms.uTime.value = time;
      m.depthWrite = a > 0.5;
      mesh.visible = a > 0.002;
    },
  };
}
