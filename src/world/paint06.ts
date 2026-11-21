/**
 * `?paint06=1` — Screen 06 shown as the user's OWN pictures (user decision 2026-11-21: "Yes, do Screen 06 first … I want
 * these exact … all these four images"). Five keyframes: k0 = the approved Screen 06 picture, k1..k4 = the four storyboard
 * panels ("1 curl right over the crest · 2 descend through the gold band · 3 follow the winding slide · 4 connect into
 * Screen 07"). Each keyframe is a full-screen plate (the panel's own pixels inside its window, the phone frame's extra
 * height continued around it — tools/paint06/, qa/match/06/paint06/) on a depth-displaced grid, so pushing the view
 * forward gives real parallax (near water grows faster than the far tunnel). At each keyframe's rest moment the view is
 * the picture exactly. Benny = that keyframe's own painted Benny pixels as a layer that steers / leans / bobs.
 * Plates cross-fade from one keyframe to the next; the live 3D game is cross-faded in only at the 05→06 and 06→07 joins.
 * Raw bytes in, raw bytes out (no tone mapping / grade): the painting's colours reach the screen unchanged.
 * Off (default): nothing here is built or drawn.
 */
import * as THREE from 'three';
import type { Course } from './course';

interface Layout {
  frame: [number, number];
  margin: [number, number];
  plate_frame_px: [number, number];
  plate_scale: number;
  keys: { k: number; benny_frame_px: [number, number, number, number] }[];
}

const sm = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);
const asset = (n: string) => new URL(`../../assets/textures/paint06/${n}`, import.meta.url).href;

/** keyframe rest moments, units into Screen 06 (k0 = the '06' QA checkpoint, s0 + 10) */
export const PAINT06_REST = [10, 21, 32, 43, 53];
const FOV = 50;
const Z_NEAR = 1.0, Z_FAR = 10.0; // depth map (1 = near) -> view distance
const PUSH = 0.022; // view moves this far (Z units) per course unit
const PUSH_MIN = -0.16, PUSH_MAX = 0.3;
const FADE_AT = 0.62, FADE_HALF = 2.0; // keyframe cross-fade: centred 62 % of the way to the next rest, ±2 u
const PX_PER_LAT = 60; // Benny layer: frame px per unit of steering offset
const CAM_PER_LAT = 0.02; // view pans this far (Z units) per unit of steering offset (parallax)
const SPEED_K = 0.33; // ride speed while the pictures show (06 at 11 u/s is ~5 s for five pictures -> ~16 s)

const VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = /* glsl */ `
  uniform sampler2D map; uniform float opacity; varying vec2 vUv;
  void main(){ vec4 c = texture2D(map, vUv, -0.45); gl_FragColor = vec4(c.rgb, c.a * opacity); }`; // bias: plates are 1.25x the 864 frame -> level 0 at rest, mips only when pushed

export async function buildPaint06(course: Course) {
  const L: Layout = await fetch(asset('paint06.json')).then((r) => r.json());
  const [FW, FH] = L.frame;
  const [MX, MY] = L.margin;
  const [PW, PH] = L.plate_frame_px;
  const A0 = FW / FH;
  const tanY = Math.tan(THREE.MathUtils.degToRad(FOV / 2));
  const st06 = course.stage('06');
  const s0 = st06.s0, s1 = st06.s1;
  const rest = PAINT06_REST.map((r) => s0 + r);

  const loader = new THREE.TextureLoader();
  const tex = async (n: string) => {
    const t = await loader.loadAsync(asset(n));
    t.colorSpace = THREE.NoColorSpace; // raw sRGB bytes straight through to the screen
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.anisotropy = 4;
    return t;
  };
  const depthOf = async (n: string) => {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = asset(n); });
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d', { willReadFrequently: true })!; g.drawImage(img, 0, 0);
    const d = g.getImageData(0, 0, img.width, img.height).data;
    const out = new Float32Array(img.width * img.height);
    for (let i = 0; i < out.length; i++) out[i] = d[i * 4] / 255;
    return { w: img.width, h: img.height, d: out };
  };
  const sampleDepth = (D: { w: number; h: number; d: Float32Array }, u: number, v: number) => {
    const x = THREE.MathUtils.clamp(u * (D.w - 1), 0, D.w - 1), y = THREE.MathUtils.clamp(v * (D.h - 1), 0, D.h - 1);
    const x0 = Math.floor(x), y0 = Math.floor(y), x1 = Math.min(x0 + 1, D.w - 1), y1 = Math.min(y0 + 1, D.h - 1);
    const fx = x - x0, fy = y - y0;
    const a = D.d[y0 * D.w + x0] * (1 - fx) + D.d[y0 * D.w + x1] * fx;
    const b = D.d[y1 * D.w + x0] * (1 - fx) + D.d[y1 * D.w + x1] * fx;
    return a * (1 - fy) + b * fy;
  };

  /** plate grid: every vertex sits on the rest camera's ray through its own pixel, at its depth -> exact at rest */
  const NX = 96, NY = 160;
  const plateGeometry = (D: { w: number; h: number; d: Float32Array }) => {
    const pos = new Float32Array((NX + 1) * (NY + 1) * 3), uv = new Float32Array((NX + 1) * (NY + 1) * 2);
    let p = 0, q = 0;
    for (let j = 0; j <= NY; j++) {
      const v = j / NY; // 0 = top of the plate
      for (let i = 0; i <= NX; i++) {
        const u = i / NX;
        const X = u * PW - MX, Y = v * PH - MY; // frame px
        const xn = (X - FW / 2) / (FW / 2), yn = -(Y - FH / 2) / (FH / 2);
        const d = sampleDepth(D, u, v);
        const Z = 1 / (1 / Z_FAR + d * (1 / Z_NEAR - 1 / Z_FAR));
        pos[p++] = xn * tanY * A0 * Z; pos[p++] = yn * tanY * Z; pos[p++] = -Z;
        uv[q++] = u; uv[q++] = 1 - v;
      }
    }
    const idx: number[] = [];
    for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
      const a = j * (NX + 1) + i, b = a + 1, c = a + NX + 1, e = c + 1;
      idx.push(a, c, b, b, c, e);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setIndex(idx);
    return g;
  };
  const mat = (map: THREE.Texture) => new THREE.ShaderMaterial({
    uniforms: { map: { value: map }, opacity: { value: 1 } },
    vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthTest: true, depthWrite: true,
    toneMapped: false, side: THREE.DoubleSide,
  });

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(FOV, A0, 0.05, 100);
  const oScene = new THREE.Scene();
  const oCam = new THREE.OrthographicCamera(-FW / 2, FW / 2, FH / 2, -FH / 2, -10, 10);

  const keys = await Promise.all(L.keys.map(async (K) => {
    const [plate, benny, depth] = await Promise.all([tex(`k${K.k}_plate.jpg`), tex(`k${K.k}_benny.png`), depthOf(`k${K.k}_depth.png`)]);
    const mesh = new THREE.Mesh(plateGeometry(depth), mat(plate));
    mesh.frustumCulled = false;
    mesh.visible = false;
    scene.add(mesh);
    const [bx0, by0, bx1, by1] = K.benny_frame_px;
    const bw = bx1 - bx0, bh = by1 - by0;
    // pivot = Benny's waterline centre (frame px 418, 1190): lean / bob turn around it
    const pivot = new THREE.Group();
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), mat(benny));
    quad.material.depthTest = false; quad.material.depthWrite = false;
    quad.position.set((bx0 + bw / 2) - 418, -((by0 + bh / 2) - 1190), 0);
    pivot.add(quad);
    pivot.visible = false;
    oScene.add(pivot);
    return { mesh, pivot, quad };
  }));

  /** 0..1: how much of the screen the pictures cover (3D game cross-faded in at the 05→06 and 06→07 joins) */
  const weight = (s: number) => sm(s0 - 1.5, s0 + 3.5, s) * (1 - sm(s1 - 1.0, s1 + 5.0, s));
  /** ride speed factor while the pictures show */
  const speedK = (s: number) => 1 + (SPEED_K - 1) * sm(s0 - 4, s0 + 1, s) * (1 - sm(s1 - 2, s1 + 3, s));
  /** opacity of keyframe k over the earlier ones */
  const keyAlpha = (k: number, s: number) => {
    if (k === 0) return 1;
    const c = rest[k - 1] + FADE_AT * (rest[k] - rest[k - 1]);
    return sm(c - FADE_HALF, c + FADE_HALF, s);
  };

  const size = new THREE.Vector2();
  const draw = (renderer: THREE.WebGLRenderer, o: { s: number; lat: number; steer: number; time: number; w: number }) => {
    renderer.getSize(size);
    const a = size.x / Math.max(1, size.y);
    // visible extent: the 9:16 frame, widened / heightened into the plate margins on other screen shapes
    let hx = tanY * A0, hy = tanY;
    if (a >= A0) { hy = tanY; hx = hy * a; const mx = tanY * A0 * (1 + MX / (FW / 2)); if (hx > mx) { hx = mx; hy = hx / a; } }
    else { hx = tanY * A0; hy = hx / a; const my = tanY * (1 + MY / (FH / 2)); if (hy > my) { hy = my; hx = hy * a; } }
    cam.aspect = a; cam.fov = THREE.MathUtils.radToDeg(2 * Math.atan(hy)); cam.updateProjectionMatrix();
    const ex = (hx / (tanY * A0)) * FW / 2, ey = (hy / tanY) * FH / 2;
    oCam.left = FW / 2 - ex - FW / 2; oCam.right = FW / 2 + ex - FW / 2; oCam.top = ey; oCam.bottom = -ey;
    // ortho frame px: x = X - FW/2, y = FH/2 - Y
    oCam.updateProjectionMatrix();

    const prevAuto = renderer.autoClear;
    renderer.autoClear = false;
    renderer.setRenderTarget(null);
    if (o.w >= 0.999) renderer.clear(true, true, true);
    // first keyframe that is fully opaque from here on (earlier ones are hidden under it)
    let first = 0;
    for (let k = keys.length - 1; k >= 0; k--) if (keyAlpha(k, o.s) >= 0.999) { first = k; break; }
    const camX = THREE.MathUtils.clamp(o.lat * CAM_PER_LAT, -0.07, 0.07);
    for (let k = first; k < keys.length; k++) {
      const al = keyAlpha(k, o.s);
      if (al <= 0.001) break;
      const K = keys[k];
      const z = THREE.MathUtils.clamp((o.s - rest[k]) * PUSH, PUSH_MIN, PUSH_MAX);
      cam.position.set(camX, 0, -z);
      cam.lookAt(camX, 0, -z - 1);
      (K.mesh.material as THREE.ShaderMaterial).uniforms.opacity.value = al * o.w;
      for (const Q of keys) Q.mesh.visible = Q === K;
      renderer.clearDepth();
      renderer.render(scene, cam);
    }
    // Benny: the same keyframe order, on top
    const bob = Math.sin(o.time * Math.PI) * 2.5; // 2 s bob; zero at whole seconds (QA clock 12.0 = the picture exactly)
    for (let k = first; k < keys.length; k++) {
      const al = keyAlpha(k, o.s);
      if (al <= 0.001) break;
      const K = keys[k];
      for (const Q of keys) Q.pivot.visible = Q === K;
      K.pivot.position.set(418 - FW / 2 + o.lat * PX_PER_LAT, FH / 2 - 1190 + bob, 0);
      K.pivot.rotation.z = -o.steer * 0.16;
      (K.quad.material as THREE.ShaderMaterial).uniforms.opacity.value = al * o.w;
      renderer.render(oScene, oCam);
    }
    for (const Q of keys) { Q.mesh.visible = false; Q.pivot.visible = false; }
    renderer.autoClear = prevAuto;
  };

  return { weight, speedK, draw, rest, s0, s1 };
}
export type Paint06 = Awaited<ReturnType<typeof buildPaint06>>;
