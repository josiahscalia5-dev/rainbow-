/**
 * `?paint=1` — the approved-artwork chain (round 31): consecutive screens shown as the user's OWN approved pictures, one continuous
 * journey. Keyframes in route order (assets/textures/paint/paint.json, tools/paint/): 05k0 = the approved Screen 05 picture,
 * 06k0 = the approved Screen 06 picture, 06k1..06k4 = the user's four Screen 06 storyboard panels.
 * Each keyframe = a full-screen plate (the picture's own pixels; painted HUD / Benny / collectible coins taken out; margins continued)
 * on a depth grid: at its rest moment the view IS the picture; the view eases gently toward the tunnel end as Benny swims.
 *  - Benny = each picture's own painted Benny as a layer: steers left/right, leans, bobs; the 3D Benny is hidden while he shows.
 *  - Coins = the painted coins as live sprites that flow down the painted river toward Benny, timed by the game's own coin list
 *    (overridden for these stages so every painted coin IS a game coin): collected ones pop and vanish, missed ones slide past him.
 *  - Picture -> picture: the next picture opens from its tunnel end (soft circle); 3D game -> chain and chain -> 3D game the same way.
 * Raw bytes in, raw bytes out (no tone mapping / grade): the painting's colours reach the screen unchanged.
 * Off (default): nothing here is built or drawn. `?paint06=1` (paint06.ts) is the earlier Screen-06-only candidate, kept as it was.
 */
import * as THREE from 'three';
import type { Course, StageId } from './course';
import type { CoinDef } from '../gameplay/coins';

interface CoinPath {
  sprite: string; sprite_px: [number, number]; sprite_coin_d: number; stage: StageId; pop_frame_px: [number, number];
  D0: number; c: number; samples: [number, number, number, number][]; layout: number[]; lat: number;
  /** per coin: visual distance along the painted trail per course unit (1 = the picture's own perspective, Screen 05) */
  vscale?: number[];
}
interface KeyDef {
  id: string; screen: StageId; rest: { mark?: string; stage?: StageId; off: number };
  files: { plate: string; benny: string; depth: string; flow?: string };
  benny_frame_px: [number, number, number, number]; pivot: [number, number]; vp_frame_px: [number, number];
  push: number; push_min: number; push_max: number; coins?: CoinPath;
  /** the painted water flows toward the viewer inside this mask: px per cycle at the frame bottom, cycles per second */
  flow?: { amp: number; rate: number };
}
interface Layout {
  frame: [number, number]; margin: [number, number]; plate_frame_px: [number, number]; plate_scale: number;
  keys: KeyDef[]; reveal: Record<string, { stage: StageId; off: number; half: number }>; speed: Record<string, number>;
}

const sm = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);
const clamp01 = (x: number) => THREE.MathUtils.clamp(x, 0, 1);
const asset = (p: string) => { const [dir, name] = p.split('/'); return new URL(`../../assets/textures/${dir}/${name}`, import.meta.url).href; };

const FOV = 50;
const Z_NEAR = 1.0, Z_FAR = 10.0;
const FADE_AT = 0.62, FADE_HALF = 1.7;
const FEATHER = 150;
const PX_PER_LAT = 66;
const CAM_PER_LAT = 0.02;
const BENNY_C: [number, number] = [420, 1000];

const VERT = /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
// Flowing water (keys with a flow mask): the painted water slides away from the tunnel end toward the viewer, two phases half a
// cycle apart cross-faded (the design stays the picture's own; at phase 0.5 - every whole second from the QA clock 12.0 - the
// offset is zero, so the rest moment is the picture exactly).
const FRAG = /* glsl */ `
  uniform sampler2D map; uniform float opacity;
  uniform vec4 frameMap; uniform vec2 vp; uniform float radius; uniform float feather; uniform float wipe;
  uniform sampler2D flowMap; uniform float flowOn; uniform vec2 vpUv; uniform vec2 platePx; uniform float flowAmp; uniform float flowPh;
  uniform float cutV;
  varying vec2 vUv;
  void main(){
    vec4 c;
    if (flowOn > 0.5) {
      float m = texture2D(flowMap, vUv).r;
      vec2 dpx = (vUv - vpUv) * platePx; float dl = max(length(dpx), 1.0);
      vec2 off = (dpx / dl) * flowAmp * (dl / platePx.y) / platePx * m;
      float p1 = flowPh, p2 = fract(flowPh + 0.5);
      vec4 c1 = texture2D(map, vUv - off * (p1 - 0.5), -0.45), c2 = texture2D(map, vUv - off * (p2 - 0.5), -0.45);
      c = mix(c1, c2, abs(2.0 * p1 - 1.0));
    } else c = texture2D(map, vUv, -0.45);
    float a = c.a * opacity;
    // paintswim: only the painted splash below his body travels with the 3D Benny (his painted body / hat are cut away)
    if (cutV > 0.0) { a *= 1.0 - smoothstep(cutV - 0.06, cutV + 0.01, vUv.y); vec2 e = (vUv - vec2(0.5, 0.2)) / vec2(0.5, 0.26); a *= 1.0 - smoothstep(0.7, 1.0, length(e)); }
    if (wipe != 0.0) {
      vec2 F = vec2(gl_FragCoord.x * frameMap.x + frameMap.y, gl_FragCoord.y * frameMap.z + frameMap.w);
      float inside = 1.0 - smoothstep(radius - feather, radius, length(F - vp));
      a *= wipe > 0.0 ? inside : 1.0 - inside;
    }
    gl_FragColor = vec4(c.rgb, a);
  }`;

const qn = (k: string, d: number) => { const v = typeof location === 'undefined' ? null : new URLSearchParams(location.search).get(k); return v !== null && v !== '' && isFinite(+v) ? +v : d; };
/** `&paintpush=<f>`: the gentle forward ease toward the tunnel end (1 = as authored); `&paintpan=<f>`: steering parallax (1 = as authored) */
// default = scenery holds still (measured: every-frame likeness 82 % / 'looks the same' 93 % in 05 vs 41 % / 54 % with the ease)
const PUSH_K = qn('paintpush', 0), PAN_K = qn('paintpan', 0);
/**
 * `&paintswim=1` (round 32, user 2026-11-21: "I just want the pink character to swim around my approved screen … I want my exact
 * approved screen"): the approved Screen 05 picture stays EXACTLY as in `?paint=1` (same plate, same flowing water, held still);
 * the REAL 3D Benny (game runtime: swim clip, paddling, pom-pom spring, steering lean) is drawn into that picture and swims along
 * the painted S-river from his painted spot, through the gold bands, into the tunnel end, getting smaller with the picture's own
 * perspective. Coins sit still on the painted river and he swims into them. Off: `?paint=1` is unchanged.
 * Tuning: `&swimspeed=` (Screen 05 travel speed factor, default 0.75), `&swimpitch=` (rad, view from above), `&swimh=` (px, his
 * height at the start spot), `&swimsplash=0` (no painted splash).
 */
const SWIM = qn('paintswim', 0) > 0;
const SWIM_SPEED = qn('swimspeed', 0.75), SWIM_PITCH = qn('swimpitch', 0.22), SWIM_H = qn('swimh', 470), SWIM_SPLASH = qn('swimsplash', 1);
/** trail distance (painted-river units) Benny has covered when Screen 06 starts opening from the tunnel end */
const SWIM_END = qn('swimend', 56), SWIM_EASE = qn('swimease', 2.0);

export interface SwimOpts { root: THREE.Object3D; home: THREE.Object3D; environment: THREE.Texture | null }

export async function buildPaint(course: Course, coins: { defs: CoinDef[]; collected: Uint8Array }, swimOpts?: SwimOpts) {
  const L: Layout = await fetch(asset('paint/paint.json')).then((r) => r.json());
  const [FW, FH] = L.frame, [MX, MY] = L.margin, [PW, PH] = L.plate_frame_px;
  const A0 = FW / FH, tanY = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const restOf = (K: KeyDef) => (K.rest.mark ? course.marks[K.rest.mark] : course.stage(K.rest.stage as StageId).s0) + K.rest.off;
  const rest = L.keys.map(restOf);
  const first = L.keys[0], last = L.keys[L.keys.length - 1];
  const chainS0 = course.stage(first.screen).s0, chainS1 = course.stage(last.screen).s1;

  const loader = new THREE.TextureLoader();
  const tex = async (p: string) => {
    const t = await loader.loadAsync(asset(p));
    t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 4;
    return t;
  };
  const depthOf = async (p: string) => {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = asset(p); });
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true })!; g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, img.width, img.height).data; const out = new Float32Array(img.width * img.height);
    for (let i = 0; i < out.length; i++) out[i] = d[i * 4] / 255;
    return { w: img.width, h: img.height, d: out };
  };
  type Depth = Awaited<ReturnType<typeof depthOf>>;
  const sampleDepth = (D: Depth, u: number, v: number) => {
    const x = THREE.MathUtils.clamp(u * (D.w - 1), 0, D.w - 1), y = THREE.MathUtils.clamp(v * (D.h - 1), 0, D.h - 1);
    const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(x0 + 1, D.w - 1), y1 = Math.min(y0 + 1, D.h - 1), fx = x - x0, fy = y - y0;
    return (D.d[y0 * D.w + x0] * (1 - fx) + D.d[y0 * D.w + x1] * fx) * (1 - fy) + (D.d[y1 * D.w + x0] * (1 - fx) + D.d[y1 * D.w + x1] * fx) * fy;
  };
  const zOf = (d: number) => 1 / (1 / Z_FAR + d * (1 / Z_NEAR - 1 / Z_FAR));
  /** frame px at rest -> the 3D point on the rest camera's ray at the plate's depth */
  const point = (D: Depth, X: number, Y: number, out: THREE.Vector3) => {
    const Z = zOf(sampleDepth(D, (X + MX) / PW, (Y + MY) / PH));
    return out.set(((X - FW / 2) / (FW / 2)) * tanY * A0 * Z, -((Y - FH / 2) / (FH / 2)) * tanY * Z, -Z);
  };
  const NX = 96, NY = 160;
  const plateGeometry = (D: Depth) => {
    const pos = new Float32Array((NX + 1) * (NY + 1) * 3), uv = new Float32Array((NX + 1) * (NY + 1) * 2); const v3 = new THREE.Vector3();
    let p = 0, q = 0;
    for (let j = 0; j <= NY; j++) for (let i = 0; i <= NX; i++) {
      const u = i / NX, v = j / NY; point(D, u * PW - MX, v * PH - MY, v3);
      pos[p++] = v3.x; pos[p++] = v3.y; pos[p++] = v3.z; uv[q++] = u; uv[q++] = 1 - v;
    }
    const idx: number[] = [];
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) { const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, e = c + 1; idx.push(a, c, b, b, c, e); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); g.setIndex(idx);
    return g;
  };
  const mat = (map: THREE.Texture) => new THREE.ShaderMaterial({
    uniforms: { map: { value: map }, opacity: { value: 1 }, frameMap: { value: new THREE.Vector4() }, vp: { value: new THREE.Vector2() }, radius: { value: 0 }, feather: { value: FEATHER }, wipe: { value: 0 },
      flowMap: { value: null as THREE.Texture | null }, flowOn: { value: 0 }, vpUv: { value: new THREE.Vector2() }, platePx: { value: new THREE.Vector2(PW, PH) }, flowAmp: { value: 0 }, flowPh: { value: 0.5 }, cutV: { value: -1 } },
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: false, depthWrite: false, toneMapped: false, side: THREE.DoubleSide,
  });

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(FOV, A0, 0.02, 100);
  const oScene = new THREE.Scene();
  const oCam = new THREE.OrthographicCamera(-FW / 2, FW / 2, FH / 2, -FH / 2, -10, 10);

  // ---------------------------------------------------------------- coins: the painted coins ARE the game's coins on these stages
  const coinKeys = new Map<number, number>(); // coin index -> key index
  const vscaleOf = new Map<number, number>();
  const queues = new Map<StageId, number[]>();
  for (const K of L.keys) if (K.coins && !queues.has(K.coins.stage))
    queues.set(K.coins.stage, coins.defs.map((d, i) => [d, i] as const).filter(([d]) => d.stage === K.coins!.stage).sort((a, b) => a[0].s - b[0].s).map(([, i]) => i));
  L.keys.forEach((K, k) => {
    if (!K.coins) return;
    const q = queues.get(K.coins.stage)!;
    K.coins.layout.forEach((dl, n) => {
      const i = q.shift(); if (i === undefined) return;
      coins.defs[i].s = rest[k] + dl; coins.defs[i].lat = K.coins!.lat; coinKeys.set(i, k); vscaleOf.set(i, K.coins!.vscale?.[n] ?? 1);
    });
  });
  // game coins of these stages with no painted coin: moved out of the course (never shown, never counted, also after QA resets)
  for (const q of queues.values()) for (const i of q) { coins.defs[i].s = -1000 - i; coins.collected[i] = 1; }

  const keys = await Promise.all(L.keys.map(async (K) => {
    const [plate, benny, depth, flow] = await Promise.all([tex(K.files.plate), tex(K.files.benny), depthOf(K.files.depth), K.files.flow ? tex(K.files.flow) : Promise.resolve(null)]);
    const mesh = new THREE.Mesh(plateGeometry(depth), mat(plate)); mesh.frustumCulled = false; mesh.visible = false; scene.add(mesh);
    if (flow && K.flow) {
      const U = (mesh.material as THREE.ShaderMaterial).uniforms;
      U.flowMap.value = flow; U.flowOn.value = 1; U.flowAmp.value = K.flow.amp;
      U.vpUv.value.set((K.vp_frame_px[0] + MX) / PW, 1 - (K.vp_frame_px[1] + MY) / PH);
    }
    const [bx0, by0, bx1, by1] = K.benny_frame_px, bw = bx1 - bx0, bh = by1 - by0, [px, py] = K.pivot;
    const pivot = new THREE.Group(); const quad = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), mat(benny));
    quad.position.set(bx0 + bw / 2 - px, -(by0 + bh / 2 - py), 0); pivot.add(quad); pivot.visible = false; oScene.add(pivot);
    const [vx, vy] = K.vp_frame_px;
    const pushDir = new THREE.Vector3(((vx - FW / 2) / (FW / 2)) * tanY * A0, -((vy - FH / 2) / (FH / 2)) * tanY, -1).normalize();
    let rMax = 0;
    for (const [cx, cy] of [[-MX, -MY], [FW + MX, -MY], [-MX, FH + MY], [FW + MX, FH + MY]]) rMax = Math.max(rMax, Math.hypot(cx - vx, cy - vy));
    let coin: { tex: THREE.Texture; geo: THREE.PlaneGeometry; meshes: Map<number, THREE.Mesh>; P: CoinPath } | null = null;
    if (K.coins) {
      const ct = await tex(K.coins.sprite);
      coin = { tex: ct, geo: new THREE.PlaneGeometry(1, 1), meshes: new Map(), P: K.coins };
    }
    return { K, mesh, depth, pivot, quad, vp: new THREE.Vector2(vx, vy), pushDir, rMax: rMax + FEATHER, coin };
  }));
  // one sprite mesh per coin of each key (shared texture); kept in `scene`, toggled per render
  const pops = new Map<number, THREE.Mesh>();
  keys.forEach((Q) => {
    if (!Q.coin) return;
    for (const [i, k] of coinKeys) if (keys[k] === Q) {
      const m = new THREE.Mesh(Q.coin.geo, mat(Q.coin.tex)); m.visible = false; m.frustumCulled = false; scene.add(m); Q.coin.meshes.set(i, m);
      const pm = new THREE.Mesh(Q.coin.geo, mat(Q.coin.tex)); pm.visible = false; oScene.add(pm); pops.set(i, pm);
    }
  });

  /** path of a coin d course units ahead of Benny, at rest (frame px x, y, diameter) */
  const pathAt = (P: CoinPath, d: number): [number, number, number] => {
    const sm_ = P.samples, d0 = sm_[0][0], step = sm_[1][0] - sm_[0][0];
    const f = THREE.MathUtils.clamp((d - d0) / step, 0, sm_.length - 1.001), i = Math.floor(f), t = f - i;
    const a = sm_[i], b = sm_[i + 1];
    return [a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, a[3] + (b[3] - a[3]) * t];
  };

  // ---------------------------------------------------------------- timeline
  const joinIn = (s: number) => clamp01((s - (chainS0 - 2.0)) / 4.5);
  const joinOut = (s: number) => clamp01((s - (chainS1 - 1.0)) / 5.0);
  const revealC = L.keys.map((K, k) => {
    if (k === 0) return [0, 0];
    const r = L.reveal[K.id];
    if (r) return [course.stage(r.stage).s0 + r.off, r.half];
    return [rest[k - 1] + FADE_AT * (rest[k] - rest[k - 1]), FADE_HALF];
  });
  const keyProg = (k: number, s: number) => (k === 0 ? 1 : clamp01((s - (revealC[k][0] - revealC[k][1])) / (2 * revealC[k][1])));
  const radiusAt = (Q: { rMax: number }, f: number) => Q.rMax * Math.pow(f, 1.35);
  const insideAt = (Q: { vp: THREE.Vector2; rMax: number }, f: number, x: number, y: number) => { const r = radiusAt(Q, f); return 1 - sm(r - FEATHER, r, Math.hypot(x - Q.vp.x, y - Q.vp.y)); };
  const weight = (s: number) => (joinIn(s) <= 0 || joinOut(s) >= 1 ? 0 : joinIn(s) >= 1 && joinOut(s) <= 0 ? 1 : 0.5);

  // ---------------------------------------------------------------- `&paintswim=1`: the real 3D Benny swims INTO the approved picture
  const P05 = keys[0].coin?.P ?? null;
  const swimOn = SWIM && !!swimOpts && !!P05;
  const swimS0 = chainS0 + 2.5; // the picture is fully shown: he sets off from his painted spot
  const swimS1 = keys.length > 1 ? revealC[1][0] - revealC[1][1] : chainS1; // the next picture starts opening at the tunnel end
    // his start = the painted Benny's waterline on the painted trail (painted coin trail: centre y + radius = the water surface)
  let swimT0 = 0;
  if (P05) for (let t = -6; t <= 4; t += 0.01) { const [, y, dia] = pathAt(P05, t); if (y + dia / 2 <= keys[0].K.pivot[1]) { swimT0 = t; break; } }
  const swimDia0 = P05 ? pathAt(P05, swimT0)[2] : 1;
  // eased: he stays big in the foreground longer, then swims on into the tunnel end (coins use the same curve, so he still meets each)
  const swimT = (s: number) => swimT0 + SWIM_END * Math.pow(THREE.MathUtils.clamp((s - swimS0) / Math.max(1, swimS1 - swimS0), 0, 1.12), SWIM_EASE);
  const swimScene = new THREE.Scene();
  if (swimOpts) {
    swimScene.environment = swimOpts.environment;
    swimScene.add(new THREE.HemisphereLight('#fff0ff', '#a33bb8', 1.15));
    const sun = new THREE.DirectionalLight('#fff4e6', 1.6); sun.position.set(0.2, 1, 0.6); swimScene.add(sun);
  }
  // the game's own colour chain for him (OutputPass tone mapping + sRGB, then grade.ts saturation / contrast), composited over the picture
  const compMat = new THREE.ShaderMaterial({
    uniforms: { tMap: { value: null as THREE.Texture | null }, uSat: { value: 1.36 }, uCon: { value: 1.15 } },
    vertexShader: /* glsl */ `varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `uniform sampler2D tMap; uniform float uSat; uniform float uCon; varying vec2 vUv;
      void main(){
        vec4 c = texture2D(tMap, vUv); if (c.a < 0.003) discard;
        gl_FragColor = vec4(c.rgb / c.a, c.a);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
        vec3 col = gl_FragColor.rgb; float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
        col = mix(vec3(l), col, uSat); col = (col - 0.5) * uCon + 0.5;
        gl_FragColor.rgb = clamp(col, 0.0, 1.0);
      }`,
    transparent: true, depthTest: false, depthWrite: false, toneMapped: true,
  });
  const compScene = new THREE.Scene(); const compQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), compMat); compQuad.frustumCulled = false; compScene.add(compQuad);
  let swimRT: THREE.WebGLRenderTarget | null = null;
  let bennyH = 0, bennyMinY = 0;
  const swimHead = { x: 0, y: 0, sc: 1 };
  const SWIM_Z0 = 2.5;
  const ray = (X: number, Y: number, Z: number, out: THREE.Vector3) => out.set(((X - FW / 2) / (FW / 2)) * tanY * A0 * Z, -((Y - FH / 2) / (FH / 2)) * tanY * Z, -Z);
  /** 3D water contact point on the painted trail at trail distance t (depth from the painted coins' perspective) */
  const swimC3 = (t: number, out: THREE.Vector3) => { const [x, y, dia] = pathAt(P05!, t); return ray(x, y + dia / 2, SWIM_Z0 * swimDia0 / dia, out); };
  const vpDir = ray(keys[0].K.vp_frame_px[0], keys[0].K.vp_frame_px[1], 1, new THREE.Vector3()).normalize();
  const upRiver = new THREE.Vector3(0, 1, 0).addScaledVector(vpDir, -vpDir.y).normalize();
  const sA = new THREE.Vector3(), sB = new THREE.Vector3(), sTan = new THREE.Vector3(), sUp = new THREE.Vector3(), sX = new THREE.Vector3(), sPos = new THREE.Vector3();
  const sM = new THREE.Matrix4(), sQ = new THREE.Quaternion(), sLean = new THREE.Quaternion(), Z_AXIS = new THREE.Vector3(0, 0, 1), bb = new THREE.Box3(), bm = new THREE.Box3();

  const speedMap: Record<string, number> = swimOn ? { ...L.speed, '05': SWIM_SPEED } : L.speed;
  const speedK = (s: number) => {
    let k = 1;
    for (const [id, f] of Object.entries(speedMap)) { const st = course.stage(id as StageId); k *= 1 + (f - 1) * sm(st.s0 - 4, st.s0 + 1, s) * (1 - sm(st.s1 - 2, st.s1 + 3, s)); }
    return k;
  };
  const paintBenny = (s: number) => {
    const fin = joinIn(s), fout = joinOut(s);
    if (fin <= 0 || fout >= 1) return 0;
    if (fin < 1) return insideAt(keys[0], fin, BENNY_C[0], BENNY_C[1]);
    if (fout > 0) return 1 - insideAt(keys[keys.length - 1], fout, BENNY_C[0], BENNY_C[1]);
    return 1;
  };

  const popStart = new Float32Array(coins.defs.length).fill(-1);
  const size = new THREE.Vector2(), buf = new THREE.Vector2(), v3 = new THREE.Vector3();

  /** paintswim: the painted splash + the real 3D Benny at his place on the painted river (camera = the picture's own, held still) */
  const drawSwim = (renderer: THREE.WebGLRenderer, o: { s: number; lat: number; steer: number; time: number }, mode: number, f: number, next: number) => {
    const Q = keys[0], t = swimT(o.s);
    const [x, y, dia] = pathAt(P05!, t), sc = dia / swimDia0;
    const X = x + o.lat * PX_PER_LAT * sc, Y = y + dia / 2;
    let vis = mode === 0 ? 1 : mode > 0 ? insideAt(Q, f, X, Y) : 1 - insideAt(Q, f, X, Y);
    if (next > 0) vis *= 1 - insideAt(keys[1], next, X, Y); // the next picture opens from the tunnel end: he swims into it
    swimHead.x = X; swimHead.y = Y - SWIM_H * 0.93 * sc; swimHead.sc = sc;
    if (vis < 0.5) return;
    // 1) the painted splash around his waist, travelling and shrinking with him (his painted body / hat cut away)
    if (SWIM_SPLASH > 0) {
      for (const R of keys) R.pivot.visible = R === Q;
      Q.pivot.position.set(X - FW / 2, FH / 2 - Y, 0); Q.pivot.rotation.z = -o.steer * 0.1;
      Q.pivot.scale.set(sc * (1 + 0.035 * Math.sin(o.time * 9.0)), sc * (1 + 0.05 * Math.sin(o.time * 7.0 + 1.0)), 1);
      const U = (Q.quad.material as THREE.ShaderMaterial).uniforms; U.opacity.value = 1; U.wipe.value = 0; U.cutV.value = 0.4;
      renderer.render(oScene, oCam);
      U.cutV.value = -1; Q.pivot.scale.set(1, 1, 1); Q.pivot.visible = false;
    }
    // 2) the real 3D Benny (game runtime: swim clip, paddling, pom-pom, lean), rendered in the picture's camera
    const R = swimOpts!.root, home = R.parent ?? swimOpts!.home;
    const save = { p: R.position.clone(), q: R.quaternion.clone(), s: R.scale.clone(), v: R.visible };
    R.visible = true;
    if (bennyH === 0) {
      R.position.set(0, 0, 0); R.quaternion.identity(); R.scale.set(1, 1, 1); R.updateMatrixWorld(true);
      bb.makeEmpty();
      R.traverseVisible((ob) => { const m = ob as THREE.Mesh; if (m.isMesh && m.geometry) { if (!m.geometry.boundingBox) m.geometry.computeBoundingBox(); bm.copy(m.geometry.boundingBox!).applyMatrix4(m.matrixWorld); bb.union(bm); } });
      bennyH = Math.max(0.05, bb.max.y - bb.min.y); bennyMinY = bb.min.y;
    }
    const Zb = SWIM_Z0 / sc, Sw = (SWIM_H * 2 * SWIM_Z0 * tanY / FH) / bennyH;
    swimC3(t - 0.5, sA); swimC3(t + 1.0, sB); sTan.subVectors(sB, sA).normalize();
    sUp.copy(upRiver).addScaledVector(sTan, -upRiver.dot(sTan)).normalize();
    // seen a little more from above, like the painting (top of the hat visible)
    const ca = Math.cos(SWIM_PITCH), sa = Math.sin(SWIM_PITCH);
    const up2 = sA.copy(sUp).multiplyScalar(ca).addScaledVector(sTan, -sa).normalize();
    const tan2 = sB.copy(sTan).multiplyScalar(ca).addScaledVector(sUp, sa).normalize();
    sX.crossVectors(up2, tan2).normalize();
    sQ.setFromRotationMatrix(sM.makeBasis(sX, up2, tan2)).multiply(sLean.setFromAxisAngle(Z_AXIS, -o.steer * 0.25));
    ray(X, Y, Zb, sPos).addScaledVector(up2, -bennyMinY * Sw);
    swimScene.add(R);
    R.position.copy(sPos); R.quaternion.copy(sQ); R.scale.setScalar(Sw); R.updateMatrixWorld(true);
    if (!swimRT || swimRT.width !== buf.x || swimRT.height !== buf.y) {
      swimRT?.dispose();
      swimRT = new THREE.WebGLRenderTarget(buf.x, buf.y, { type: THREE.HalfFloatType, samples: 4 });
    }
    const cc = renderer.getClearColor(new THREE.Color()), ca0 = renderer.getClearAlpha();
    renderer.setRenderTarget(swimRT); renderer.setClearColor(0x000000, 0); renderer.clear(true, true, true);
    renderer.render(swimScene, cam);
    renderer.setRenderTarget(null); renderer.setClearColor(cc, ca0);
    compMat.uniforms.tMap.value = swimRT.texture;
    renderer.render(compScene, oCam);
    home.add(R);
    R.position.copy(save.p); R.quaternion.copy(save.q); R.scale.copy(save.s); R.visible = save.v; R.updateMatrixWorld(true);
  };
  const draw = (renderer: THREE.WebGLRenderer, o: { s: number; lat: number; steer: number; time: number; clock: number }) => {
    renderer.getSize(size); renderer.getDrawingBufferSize(buf);
    const a = size.x / Math.max(1, size.y);
    let hx = tanY * A0, hy = tanY;
    if (a >= A0) { hy = tanY; hx = hy * a; const mx = tanY * A0 * (1 + MX / (FW / 2)); if (hx > mx) { hx = mx; hy = hx / a; } }
    else { hx = tanY * A0; hy = hx / a; const my = tanY * (1 + MY / (FH / 2)); if (hy > my) { hy = my; hx = hy * a; } }
    cam.aspect = a; cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(hy)); cam.updateProjectionMatrix();
    const ex = (hx / (tanY * A0)) * FW / 2, ey = (hy / tanY) * FH / 2;
    oCam.left = -ex; oCam.right = ex; oCam.top = ey; oCam.bottom = -ey; oCam.updateProjectionMatrix();
    const fm = new THREE.Vector4(2 * ex / buf.x, FW / 2 - ex, -2 * ey / buf.y, FH / 2 + ey);
    const fin = joinIn(o.s), fout = joinOut(o.s);
    if (fin <= 0 || fout >= 1) return;
    const prevAuto = renderer.autoClear; renderer.autoClear = false; renderer.setRenderTarget(null);
    if (fin >= 1 && fout <= 0) renderer.clear(true, true, true);
    let k0 = 0;
    for (let k = keys.length - 1; k >= 0; k--) if (keyProg(k, o.s) >= 1) { k0 = k; break; }
    let k1 = k0;
    for (let k = k0 + 1; k < keys.length; k++) if (keyProg(k, o.s) > 0) k1 = k;
    const camX = PAN_K * THREE.MathUtils.clamp(o.lat * CAM_PER_LAT, -0.07, 0.07);
    const wipeOf = (k: number): [number, number] => {
      if (k === 0 && fin < 1) return [1, fin];
      if (k > k0) return [1, keyProg(k, o.s)];
      if (k === keys.length - 1 && fout > 0) return [-1, fout];
      return [0, 1];
    };
    const setCam = (k: number) => {
      const Q = keys[k], z = PUSH_K * THREE.MathUtils.clamp((o.s - rest[k]) * Q.K.push, Q.K.push_min, Q.K.push_max);
      cam.position.copy(Q.pushDir).multiplyScalar(z / Math.abs(Q.pushDir.z)); cam.position.x += camX;
      cam.lookAt(cam.position.x, cam.position.y, cam.position.z - 1); cam.updateMatrixWorld();
    };
    const hideAll = () => scene.children.forEach((c) => { c.visible = false; });
    const setU = (m: THREE.Mesh, op: number, mode: number, f: number, Q: (typeof keys)[number]) => {
      const U = (m.material as THREE.ShaderMaterial).uniforms;
      U.opacity.value = op; U.wipe.value = mode; U.radius.value = radiusAt(Q, f); U.vp.value.copy(Q.vp); U.frameMap.value.copy(fm);
    };
    /** coins of key k: which = 'back' (ahead of Benny) | 'front' (passed him / popping) */
    const drawCoins = (k: number, which: 'back' | 'front', mode: number, f: number) => {
      const Q = keys[k]; if (!Q.coin) return;
      hideAll(); let any = false;
      const P = Q.coin.P, list: [number, THREE.Mesh][] = [];
      // paintswim (Screen 05 picture): the coins sit still on the painted river and Benny swims into them
      const swimK0 = swimOn && k === 0, bT = swimT(o.s);
      for (const [i, m] of Q.coin.meshes) {
        const def = coins.defs[i], col = coins.collected[i] === 1;
        const tc = swimK0 ? swimT(def.s) : (def.s - o.s) * (vscaleOf.get(i) ?? 1);
        const d = swimK0 ? tc - bT : tc; let op = 1; const lift = 0, grow = 1;
        if (col) continue; // collected: shown as the pop above his pom-pom (ortho, after Benny)
        {
          if (tc > P.samples[P.samples.length - 1][0] || tc < P.samples[0][0]) continue;
          if ((which === 'back') !== (d > (swimK0 ? -0.6 : 0.3))) continue; // paintswim: a coin he is reaching stays behind his body
          op = clamp01((P.samples[P.samples.length - 1][0] - tc) / 6);
        }
        const [x, y, dia0] = pathAt(P, tc);
        const ppu = swimK0 ? PX_PER_LAT * dia0 / swimDia0 : PX_PER_LAT * (P.D0 / Math.max(0.35, d + P.D0));
        let X = x + (def.lat - P.lat) * ppu; const Y = y - lift;
        // a coin he steered away from passes visibly BESIDE him (never through his body) and fades before it grows huge
        const dia = Math.min(dia0, 1.5 * P.sprite_coin_d);
        if (!swimK0 && d < 1.0) {
          const bx = Q.K.pivot[0] + o.lat * PX_PER_LAT, dx = X - bx, clear = 185 + dia / 2;
          if (Math.abs(dx) < clear) X = bx + Math.sign(dx || -1) * (Math.abs(dx) + (clear - Math.abs(dx)) * clamp01((1.0 - d) / 0.8));
        }
        if (d < -0.8) op *= clamp01((d + 2.4) / 1.6);
        if (op <= 0.01) continue;
        point(Q.depth, X, Math.min(Y, FH + MY - 2), v3);
        const Z = -v3.z, hWorld = (dia * grow / (FH / 2)) * tanY * Z;
        m.position.copy(v3); m.scale.set(hWorld * (P.sprite_px[0] / P.sprite_coin_d), hWorld * (P.sprite_px[1] / P.sprite_coin_d), 1);
        setU(m, op, mode, f, Q); m.visible = true; m.renderOrder = -d; list.push([d, m]); any = true;
      }
      if (!any) return;
      list.sort((p, q) => q[0] - p[0]); list.forEach(([, m], n) => { m.renderOrder = n; });
      renderer.render(scene, cam);
    };
    // plates (+ the coins still ahead of Benny), oldest first
    for (let k = k0; k <= k1; k++) {
      const Q = keys[k]; setCam(k);
      const [mode, f] = wipeOf(k);
      hideAll(); Q.mesh.visible = true; setU(Q.mesh, 1, mode, f, Q);
      if (Q.K.flow) (Q.mesh.material as THREE.ShaderMaterial).uniforms.flowPh.value = ((((o.time - 12.0) * Q.K.flow.rate + 0.5) % 1) + 1) % 1;
      renderer.render(scene, cam);
      drawCoins(k, 'back', mode, f);
    }
    // Benny: each picture's own painted Benny, switched where the reveal edge passes his centre
    const bob = Math.sin(o.time * Math.PI) * 2.5;
    for (let k = k0; k <= k1; k++) {
      const Q = keys[k]; const [mode, f] = wipeOf(k);
      if (swimOn && k === 0) { setCam(0); drawSwim(renderer, o, mode, f, k1 > 0 ? keyProg(1, o.s) : 0); continue; }
      const ins = mode === 0 ? 1 : insideAt(Q, f, BENNY_C[0], BENNY_C[1]); const al = mode < 0 ? 1 - ins : ins;
      if (al <= 0.001) continue;
      for (const R of keys) R.pivot.visible = R === Q;
      Q.pivot.position.set(Q.K.pivot[0] - FW / 2 + o.lat * PX_PER_LAT, FH / 2 - Q.K.pivot[1] + bob, 0); Q.pivot.rotation.z = -o.steer * 0.16;
      const U = (Q.quad.material as THREE.ShaderMaterial).uniforms; U.opacity.value = al; U.wipe.value = 0;
      renderer.render(oScene, oCam);
    }
    for (const R of keys) R.pivot.visible = false;
    // coins that have passed him: in front of Benny
    for (let k = k0; k <= k1; k++) { setCam(k); const [mode, f] = wipeOf(k); drawCoins(k, 'front', mode, f); }
    // collected coins: a small coin flies up from his pom-pom and fades (0.4 s) — only coins collected in play just now
    let anyPop = false;
    oScene.children.forEach((c) => { if (c !== undefined && (c as THREE.Mesh).isMesh) c.visible = false; });
    for (const [i, pm] of pops) {
      if (coins.collected[i] !== 1) { popStart[i] = -1; continue; }
      if (popStart[i] < 0) { if (Math.abs(coins.defs[i].s - o.s) > 1.6) { popStart[i] = -2; continue; } popStart[i] = o.clock; }
      if (popStart[i] === -2) continue;
      const t = (o.clock - popStart[i]) / 0.4; if (t < 0 || t >= 1) continue;
      const Q = keys[coinKeys.get(i)!]; const P = Q.coin!.P;
      if (swimOn && coinKeys.get(i) === 0) {
        // paintswim: the coin pops up from his pom-pom wherever he is in the picture, at his size there
        const dia = 58 * swimHead.sc * (1 - 0.55 * t);
        pm.scale.set(dia * P.sprite_px[0] / P.sprite_coin_d, dia * P.sprite_px[1] / P.sprite_coin_d, 1);
        pm.position.set(swimHead.x - FW / 2, FH / 2 - (swimHead.y - 170 * swimHead.sc * t), 0);
      } else {
      const dia = 58 * (1 - 0.55 * t);
      pm.scale.set(dia * P.sprite_px[0] / P.sprite_coin_d, dia * P.sprite_px[1] / P.sprite_coin_d, 1);
      pm.position.set(P.pop_frame_px[0] - FW / 2 + o.lat * PX_PER_LAT, FH / 2 - (P.pop_frame_px[1] - 170 * t), 0);
      }
      const U = (pm.material as THREE.ShaderMaterial).uniforms; U.opacity.value = 1 - t * t; U.wipe.value = 0;
      pm.visible = true; anyPop = true;
    }
    if (anyPop) renderer.render(oScene, oCam);
    for (const pm of pops.values()) pm.visible = false;
    hideAll();
    renderer.autoClear = prevAuto;
  };
  /** QA: frame px of every visible coin of the current picture (at rest, before the gentle push) */
  const coinInfo = (s: number) => {
    const out: { i: number; d: number; x: number; y: number; dia: number; collected: boolean }[] = [];
    keys.forEach((Q) => { if (!Q.coin) return; for (const [i] of Q.coin.meshes) { const d = (coins.defs[i].s - s) * (vscaleOf.get(i) ?? 1); const [x, y, dia] = pathAt(Q.coin.P, d); out.push({ i, d: +d.toFixed(2), x: +x.toFixed(1), y: +y.toFixed(1), dia: +dia.toFixed(1), collected: coins.collected[i] === 1 }); } });
    return out;
  };
  return { weight, speedK, draw, paintBenny, rest, keyIds: L.keys.map((K) => K.id), coinInfo, chainS0, chainS1 };
}
export type Paint = Awaited<ReturnType<typeof buildPaint>>;
