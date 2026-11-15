/**
 * Foam banks along the stream (refs 03–10) + whirlpool rim foam.
 *  - berm: ONE continuous lumpy lather bank per side, swept along the course (custom shader:
 *    two-scale cellular soap bubbles with derivative bump lighting, lavender crevices, pores,
 *    faint iridescent rim). This is what makes the banks read as continuous foam, not cotton balls.
 *  - puffs: instanced bubble puffs sitting ON the berm crest (silhouette lumps), in ~40-unit chunks
 *    so only chunks near Benny are drawn; quality 'low' halves density and uses 20-tri puffs.
 *  - foam rings on the whirlpool rim and along its spiral bands (rotating with the swirl)
 */
import * as THREE from 'three';
import { type Course, WORLD, funnelY } from '../world/course';
import { EDGE_LIFT } from './waterRibbon';
import { SPIRAL_C, FUNNEL_LIFT } from './whirlpool';
import { FRAG_FX_GLSL, FRAG_TAIL, NOISE_GLSL, withFog } from './glsl';

interface Puff { p: THREE.Vector3; r: number; c: number }

// ---------------------------------------------------------------------------------- berm profile
/** berm spans e ∈ [BERM_IN, BERM_OUT] units outward from the ribbon edge (negative = over the water) */
export const BERM_IN = -0.6;
export const BERM_OUT = 1.2;
const hash1 = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const noise1 = (x: number) => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash1(i) * (1 - u) + hash1(i + 1) * u; };
/** 0..1 lumpiness of the bank at (s, side) — CPU only, baked into the mesh and the puff placement */
export function bermLump(s: number, side: number): number {
  return 0.55 * noise1(s * 0.33 + side * 31.7) + 0.45 * noise1(s * 1.05 + side * 7.3);
}
/** CPU cellular "bubble dome" field (0..1) so the bank silhouette is a pile of round lumps */
export function bermDomes(s: number, e: number, side: number): number {
  const gs = s / 0.95, ge = e / 0.62 + side * 11.3;
  const i0 = Math.floor(gs), j0 = Math.floor(ge);
  let best = 0;
  for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
    const i = i0 + di, j = j0 + dj;
    const ox = hash1(i * 17.13 + j * 3.71), oy = hash1(i * 5.31 + j * 19.7 + 4.2);
    const r = 0.45 + 0.4 * hash1(i * 7.7 + j * 13.1 + 9.9);
    const dx = (i + ox - gs) / r, dy = (j + oy - ge) / r;
    best = Math.max(best, 1 - (dx * dx + dy * dy));
  }
  return Math.max(0, best);
}

/** height (along course up) of the bank surface at e units outward from the edge */
export function bermHeight(e: number, hw: number, lump: number): number {
  const uIn = Math.max(0, (hw + BERM_IN) / hw);
  const hIn = EDGE_LIFT * uIn * uIn * uIn - 0.07;
  const ep = 0.08 + 0.22 * lump;
  const hp = EDGE_LIFT + 0.14 + 0.5 * lump;
  const hOut = -0.95;
  if (e <= ep) {
    const t = Math.min(1, Math.max(0, (e - BERM_IN) / (ep - BERM_IN)));
    return hIn + (hp - hIn) * (1 - (1 - t) * (1 - t));
  }
  const t = Math.min(1, (e - ep) / (BERM_OUT - ep));
  return hp + (hOut - hp) * t * t;
}

/** full bank surface height incl. bubble domes (shared by the mesh and the puff placement) */
export function bermSurface(s: number, e: number, side: number, hw: number): number {
  const domeK = Math.min(1, Math.max(0, (e + 0.3) / 0.35)) * Math.min(1, Math.max(0, (BERM_OUT - 0.1 - e) / 0.4));
  return bermHeight(e, hw, bermLump(s, side)) + 0.32 * domeK * Math.sqrt(bermDomes(s, e, side));
}

const BERM_VERT = /* glsl */ `
attribute vec3 aFoam;    // x = e (units outward from the stream edge), y = s, z = side (-1 / 1)
uniform float uTime;
varying vec3 vFoam;
varying vec3 vPosW;
varying vec3 vNormalW;
#include <fog_pars_vertex>
void main() {
  // gentle breathing of the lather (never at the water line)
  float k = smoothstep(-0.2, 0.3, aFoam.x);
  vec3 p = position + normal * (0.03 * k * sin(uTime * 1.6 + aFoam.y * 2.1 + aFoam.z * 3.0));
  vec4 wp = modelMatrix * vec4(p, 1.0);
  vPosW = wp.xyz;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vFoam = aFoam;
  vec4 mvPosition = viewMatrix * wp;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}
`;

const BERM_FRAG = /* glsl */ `
uniform float uTime;
uniform vec2 uOutro;     // amount, chamber start s
uniform vec3 uLightDir;
varying vec3 vFoam;
varying vec3 vPosW;
varying vec3 vNormalW;
#include <fog_pars_fragment>
${NOISE_GLSL}
${FRAG_FX_GLSL}
void main() {
  float s = vFoam.y;
  if (uOutro.x > 0.0 && s > uOutro.y - 2.0) {
    float n = vnoise(vec2(vFoam.x * 3.0, s * 0.35)) * 0.7 + 0.3;
    if (n < uOutro.x * 1.15) discard;
  }
  vec2 p = vec2(vFoam.x * vFoam.z * 1.1, s - uTime * 0.25);
  // detail fade with distance (cells per pixel)
  float fw = max(fwidth(p.x), fwidth(p.y));
  float k1 = 1.0 - smoothstep(0.12, 0.3, fw * 1.6);
  float k2 = 1.0 - smoothstep(0.12, 0.3, fw * 3.8);
  float c1 = mix(0.45, cells(p * 1.6), k1);
  #ifdef LOW_Q
  float c2 = c1;
  #else
  float c2 = mix(0.45, cells(p * 3.8 + 11.0), k2);
  #endif
  // bubble domes: bright cell centres, deep crevices between bubbles
  float bub = (1.0 - c1 * c1) * 0.6 + (1.0 - c2 * c2) * 0.4;
  vec3 N0 = normalize(vNormalW);
  if (!gl_FrontFacing) N0 = -N0;
  #ifdef LOW_Q
  vec3 N = N0;
  #else
  vec3 N = bumpNormal(vPosW, N0, bub * 0.16);
  #endif
  vec3 L = normalize(uLightDir);
  vec3 V = normalize(cameraPosition - vPosW);
  float diff = 0.55 + 0.45 * max(dot(N, L), 0.0);
  vec3 white = vec3(1.0, 1.0, 1.0);
  vec3 lav = vec3(0.7, 0.68, 0.98);
  vec3 col = mix(lav, white, 0.3 + 0.7 * clamp(N.y * 0.5 + 0.5, 0.0, 1.0)) * diff;
  col = mix(col, lav * 0.8, smoothstep(0.6, 0.95, c1) * 0.7 * k1);
  col = mix(col, lav * 0.9, smoothstep(0.65, 0.95, c2) * 0.4 * k2);
  // tiny pores (open bubbles)
  #ifndef LOW_Q
  vec2 pp = p * 7.0 + 5.0;
  float pc = cells(pp);
  float kp = 1.0 - smoothstep(0.1, 0.25, fw * 7.0);
  col = mix(col, vec3(0.58, 0.56, 0.88), (1.0 - smoothstep(0.1, 0.2, pc)) * step(0.62, hash12(floor(pp))) * 0.75 * kp);
  #endif
  float spec = pow(max(dot(reflect(-V, N), L), 0.0), 28.0);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 3.0);
  col += vec3(1.0) * spec * 0.45 + iridescent(fres * 1.4 + c1 * 0.6) * fres * 0.18;
  gl_FragColor = vec4(col * 0.96, 1.0);
  ${FRAG_TAIL}
}
`;

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FOAM_COLORS = ['#ffffff', '#f4f6ff', '#eef0ff', '#ffffff', '#eaf6ff'].map((c) => new THREE.Color(c));

function makeMaterial() {
  const m = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.4,
    metalness: 0.0,
    emissive: new THREE.Color('#eef0ff'),
    emissiveIntensity: 0.45,
    envMapIntensity: 1.0,
  });
  // subtle soap-film rim tint
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       float rimF = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0), 2.5);
       totalEmissiveRadiance += vec3(0.55, 0.35, 0.75) * rimF * 0.35;`,
    );
  };
  return m;
}

export interface FoamSystem {
  group: THREE.Group;
  whirlGroup: THREE.Group;
  berm: THREE.Mesh;
  update(time: number, focusS: number, outro?: number): void;
  instanceCount: number;
}

/** continuous lather bank along both stream edges (skips the 03 whirlpool interior) */
function createBerm(course: Course, s0: number, s1: number, skip: [number, number], quality: 'high' | 'low') {
  const ds = quality === 'high' ? 0.45 : 0.8;
  const E = quality === 'high' ? [BERM_IN, -0.38, -0.2, -0.05, 0.1, 0.28, 0.5, 0.8, BERM_OUT] : [BERM_IN, -0.2, 0.15, 0.55, BERM_OUT];
  const rows = Math.ceil((s1 - s0) / ds) + 1;
  const C = E.length;
  const n = rows * C * 2;
  const pos = new Float32Array(n * 3);
  const foam = new Float32Array(n * 3);
  const tmp = new THREE.Vector3();
  let k = 0;
  const rowS: number[] = [];
  for (let i = 0; i < rows; i++) {
    const s = Math.min(s1, s0 + i * ds);
    rowS.push(s);
    const f = course.sample(s);
    const hw = course.widthAt(s) / 2;
    for (const side of [-1, 1]) {
      for (let j = 0; j < C; j++) {
        // left side is mirrored so every row runs inner → outer; bubble domes everywhere except
        // at the water line (keeps the lace edge flush with the stream)
        const e = E[j];
        const h = bermSurface(s, e, side, hw);
        tmp.copy(f.pos).addScaledVector(f.right, side * (hw + e)).addScaledVector(f.up, h);
        tmp.toArray(pos, k * 3);
        foam[k * 3] = e;
        foam[k * 3 + 1] = s;
        foam[k * 3 + 2] = side;
        k++;
      }
    }
  }
  const idx: number[] = [];
  const rowStride = C * 2;
  for (let i = 0; i < rows - 1; i++) {
    const sa = rowS[i], sb = rowS[i + 1];
    if (sb > skip[0] && sa < skip[1]) continue;
    for (let sideI = 0; sideI < 2; sideI++) {
      for (let j = 0; j < C - 1; j++) {
        const a = i * rowStride + sideI * C + j, b = a + 1, c = a + rowStride, d = c + 1;
        // CCW seen from above on both sides (side +1 runs +right, side −1 runs −right)
        if (sideI === 1) idx.push(a, b, c, b, d, c);
        else idx.push(a, c, b, b, c, d);
      }
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aFoam', new THREE.BufferAttribute(foam, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const uniforms = withFog({
    uTime: { value: 0 },
    uOutro: { value: new THREE.Vector2(0, course.stage('08').s0) },
    uLightDir: { value: new THREE.Vector3(0.3, 1.0, 0.45).normalize() },
  });
  const mat = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: BERM_VERT,
    fragmentShader: BERM_FRAG,
    fog: true,
    side: THREE.DoubleSide,
    defines: quality === 'low' ? { LOW_Q: 1 } : {},
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'foam_berm';
  mesh.frustumCulled = false;
  return { mesh, uniforms };
}

export function createFoam(course: Course, opts: { s0: number; s1: number; quality: 'high' | 'low' }): FoamSystem {
  const { s0, s1, quality } = opts;
  const rand = rng(1337);
  const density = quality === 'high' ? 1 : 0.5;
  const geo = new THREE.IcosahedronGeometry(1, quality === 'high' ? 1 : 0);
  const mat = makeMaterial();
  const group = new THREE.Group();
  group.name = 'foam_banks';
  const st03 = course.stage('03'), st04 = course.stage('04');
  const chunkLen = 40;
  const chunks: { mesh: THREE.InstancedMesh; sa: number; sb: number }[] = [];
  let total = 0;
  const tmpM = new THREE.Matrix4();
  const tmpQ = new THREE.Quaternion();
  const tmpS = new THREE.Vector3();

  const build = (list: Puff[], parent: THREE.Object3D, sa: number, sb: number) => {
    if (!list.length) return;
    const mesh = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((pf, i) => {
      tmpQ.setFromEuler(new THREE.Euler(rand() * 6, rand() * 6, rand() * 6));
      tmpS.set(pf.r, pf.r * (0.75 + rand() * 0.25), pf.r);
      tmpM.compose(pf.p, tmpQ, tmpS);
      mesh.setMatrixAt(i, tmpM);
      mesh.setColorAt(i, FOAM_COLORS[pf.c % FOAM_COLORS.length]);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    parent.add(mesh);
    chunks.push({ mesh, sa, sb });
    total += list.length;
  };

  // ---- continuous lather bank (berm) along both edges ----
  const skip: [number, number] = [st03.s0 + 4, st04.s0 - 6];
  const berm = createBerm(course, s0, s1, skip, quality);
  group.add(berm.mesh);

  // ---- bubble puffs sitting on the bank crest (silhouette lumps) ----
  for (let sa = s0; sa < s1; sa += chunkLen) {
    const sb = Math.min(s1, sa + chunkLen);
    const list: Puff[] = [];
    // skip most of 03 (the whirlpool has its own foam), keep the chute→rim hand-over
    for (let s = sa; s < sb; s += 0.7 / density) {
      if (s > skip[0] && s < skip[1]) continue;
      const f = course.sample(s);
      const hw = course.widthAt(s) / 2;
      for (const side of [-1, 1]) {
        if (rand() < 0.2) continue;
        const e = -0.22 + rand() * 0.7;
        const r = 0.09 + rand() * 0.17;
        const p = f.pos.clone().addScaledVector(f.right, side * (hw + e)).addScaledVector(f.up, bermSurface(s, e, side, hw) + r * 0.05);
        list.push({ p, r, c: (rand() * 5) | 0 });
      }
      // bigger lather lumps on the crest
      if (rand() < 0.1 * density) {
        const side = rand() < 0.5 ? -1 : 1;
        const n = 4 + ((rand() * 7) | 0);
        const ec = 0.05 + rand() * 0.45;
        for (let k = 0; k < n; k++) {
          const ss = Math.min(s1, Math.max(s0, s + (rand() - 0.5) * 2.4));
          if (ss > skip[0] && ss < skip[1]) continue;
          const f2 = course.sample(ss);
          const hw2 = course.widthAt(ss) / 2;
          const e = ec + (rand() - 0.5) * 0.6;
          const r = 0.17 + rand() * 0.25;
          const h = bermSurface(ss, e, side, hw2) + r * (0.1 + rand() * 0.35);
          const p = f2.pos.clone().addScaledVector(f2.right, side * (hw2 + e)).addScaledVector(f2.up, h);
          list.push({ p, r, c: (rand() * 5) | 0 });
        }
      }
    }
    build(list, group, sa - 6, sb + 6);
  }

  // ---- whirlpool: rim ring + spiral band foam (rotates with the swirl) ----
  const whirlGroup = new THREE.Group();
  whirlGroup.name = 'foam_whirlpool';
  const b = WORLD.basin;
  whirlGroup.position.set(b.center.x, 0, b.center.z);
  const wl: Puff[] = [];
  // rim: cloud clusters of soap foam with a thin continuous fringe between them
  const nClusters = Math.round(26 * density);
  for (let k = 0; k < nClusters; k++) {
    const th0 = rand() * Math.PI * 2;
    const n = 10 + ((rand() * 16) | 0);
    for (let i = 0; i < n; i++) {
      const th = th0 + (rand() - 0.5) * 0.35;
      const r = b.rimRadius - 0.7 + (rand() - 0.4) * 1.3;
      const sz = 0.18 + rand() * 0.42;
      wl.push({ p: new THREE.Vector3(r * Math.sin(th), funnelY(r) + FUNNEL_LIFT + sz * 0.35 + rand() * 0.55, r * Math.cos(th)), r: sz, c: (rand() * 5) | 0 });
    }
  }
  const nRim = Math.round(200 * density);
  for (let i = 0; i < nRim; i++) {
    const th = rand() * Math.PI * 2;
    const r = b.rimRadius - 0.4 + (rand() - 0.5) * 0.6;
    const sz = 0.1 + rand() * 0.18;
    wl.push({ p: new THREE.Vector3(r * Math.sin(th), funnelY(r) + FUNNEL_LIFT + sz * 0.3, r * Math.cos(th)), r: sz, c: (rand() * 5) | 0 });
  }
  // along 3 spiral flow lines (constant th - C ln r) to echo the white foam bands
  const nBand = Math.round(60 * density);
  for (let i = 0; i < nBand; i++) {
    const band = ((i % 3) * Math.PI * 2) / 3 + 0.4;
    const r = 3.0 + rand() * (b.rimRadius - 3.6);
    const th = band + SPIRAL_C * Math.log(r) + (rand() - 0.5) * 0.12;
    const sz = 0.07 + rand() * 0.13;
    wl.push({ p: new THREE.Vector3(r * Math.sin(th), funnelY(r) + FUNNEL_LIFT + sz * 0.3, r * Math.cos(th)), r: sz, c: (rand() * 5) | 0 });
  }
  const whirlStart = chunks.length;
  build(wl, whirlGroup, st03.s0 - 30, st04.s0 + 25);
  group.add(whirlGroup);

  return {
    group,
    whirlGroup,
    berm: berm.mesh,
    instanceCount: total,
    update(time, focusS, outro = 0) {
      berm.uniforms.uTime.value = time;
      (berm.uniforms.uOutro.value as THREE.Vector2).x = outro;
      const s08 = course.stage('08').s0;
      for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        c.mesh.visible = c.sb > focusS - 25 && c.sa < focusS + 140 && !(outro > 0.3 && c.sb > s08 + 8);
      }
      // rotate whirlpool foam about the basin axis with the swirl (θ decreasing = course direction)
      whirlGroup.rotation.y = -time * 0.45 * ((Math.PI * 2) / 3);
      void whirlStart;
    },
  };
}
