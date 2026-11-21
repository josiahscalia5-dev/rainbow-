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
    if (wipe != 0.0) {
      vec2 F = vec2(gl_FragCoord.x * frameMap.x + frameMap.y, gl_FragCoord.y * frameMap.z + frameMap.w);
      float inside = 1.0 - smoothstep(radius - feather, radius, length(F - vp));
      a *= wipe > 0.0 ? inside : 1.0 - inside;
    }
    gl_FragColor = vec4(c.rgb, a);
  }`;

const qn = (k: string, d: number) => { const v = typeof location === 'undefined' ? null : new URLSearchParams(location.search).get(k); return v !== null && v !== '' && isFinite(+v) ? +v : d; };
/** `&paintpush=<f>`: scale of the gentle forward ease (1 = as authored, 0 = scenery holds still); `&paintpan=<f>`: steering parallax */
const PUSH_K = qn('paintpush', 1), PAN_K = qn('paintpan', 1);

export async function buildPaint(course: Course, coins: { defs: CoinDef[]; collected: Uint8Array }) {
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
      flowMap: { value: null as THREE.Texture | null }, flowOn: { value: 0 }, vpUv: { value: new THREE.Vector2() }, platePx: { value: new THREE.Vector2(PW, PH) }, flowAmp: { value: 0 }, flowPh: { value: 0.5 } },
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
  const speedK = (s: number) => {
    let k = 1;
    for (const [id, f] of Object.entries(L.speed)) { const st = course.stage(id as StageId); k *= 1 + (f - 1) * sm(st.s0 - 4, st.s0 + 1, s) * (1 - sm(st.s1 - 2, st.s1 + 3, s)); }
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
      for (const [i, m] of Q.coin.meshes) {
        const def = coins.defs[i], col = coins.collected[i] === 1;
        const d = (def.s - o.s) * (vscaleOf.get(i) ?? 1); let op = 1; const lift = 0, grow = 1;
        if (col) continue; // collected: shown as the pop above his pom-pom (ortho, after Benny)
        {
          if (d > P.samples[P.samples.length - 1][0] || d < P.samples[0][0]) continue;
          if ((which === 'back') !== (d > 0.3)) continue;
          op = clamp01((P.samples[P.samples.length - 1][0] - d) / 6);
        }
        const [x, y, dia] = pathAt(P, d);
        const ppu = PX_PER_LAT * (P.D0 / Math.max(0.35, d + P.D0));
        const X = x + (def.lat - P.lat) * ppu, Y = y - lift;
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
      const dia = 58 * (1 - 0.55 * t);
      pm.scale.set(dia * P.sprite_px[0] / P.sprite_coin_d, dia * P.sprite_px[1] / P.sprite_coin_d, 1);
      pm.position.set(P.pop_frame_px[0] - FW / 2 + o.lat * PX_PER_LAT, FH / 2 - (P.pop_frame_px[1] - 170 * t), 0);
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
