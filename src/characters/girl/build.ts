/**
 * ONE official cartoon girl — procedural model + joint-hierarchy rig + animation clips.
 * Identity source: character_references/official_cartoon_girl_original.jpg (NOT the realistic girls in refs 01/10/11).
 *
 * Contract: origin between the feet on the floor, faces +Z, up +Y, height ≈ 26 units.
 * Her LEFT is +X, her RIGHT is −X. Rig = named Object3D joints with rigid parts parented to them
 * (not skin-weighted). Clips target joints by name; blinking is done by the runtime (eyelidL/R).
 */
import * as THREE from 'three';
import type { BuiltModel } from '../types';
import {
  rng, eyeTexture, faceTexture, FACE_RECT, stripeTexture, ribTexture, denimTexture, hairTexture,
} from './textures';

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const TAU = Math.PI * 2;
const smoothstep = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

// ------------------------------------------------------------------ head shape
export const HEAD = { a: 2.78, b: 2.86, c: 2.64 };
const HEAD_CENTER = V(0, 20.95, 0.15); // world (rest)
const taper = (yn: number) => (yn < 0 ? 1 - 0.17 * yn * yn : 1 - 0.035 * yn * yn);
const kz = (yn: number) => (yn < 0 ? 1 - 0.07 * yn * yn : 1);
/** deform a unit-sphere direction into the cartoon head surface (head-centre local) */
function headPoint(x: number, y: number, z: number, grow = 0): THREE.Vector3 {
  return V(x * (HEAD.a + grow) * taper(y), y * (HEAD.b + grow), z * (HEAD.c + grow) * kz(y));
}
/** z of the head surface at head-local (x, y), front side */
export function surfaceZ(x: number, y: number): number {
  const yn = y / HEAD.b;
  const xn = x / (HEAD.a * taper(yn));
  const q = 1 - xn * xn - yn * yn;
  return q > 0 ? Math.sqrt(q) * HEAD.c * kz(yn) : 0;
}

// eye openings (head-centre local): almond — rounder top, flatter happy bottom
export const EYE = { cx: 1.12, cy: -0.22, rx: 0.7, ryT: 0.76, ryB: 0.56, uvHalf: 1.0 };
function eyeEllipseValue(s: number, x: number, y: number) {
  const dx = (x - s * EYE.cx) / EYE.rx;
  const dy = (y - EYE.cy) / (y > EYE.cy ? EYE.ryT : EYE.ryB);
  return dx * dx + dy * dy;
}
/** +1 / −1 if (x, y) lies inside the left / right eye opening, else 0 */
function eyeOpeningSide(x: number, y: number) {
  if (eyeEllipseValue(1, x, y) < 1) return 1;
  if (eyeEllipseValue(-1, x, y) < 1) return -1;
  return 0;
}

// ------------------------------------------------------------------ materials
function std(color: string, rough = 0.6, metal = 0, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra });
}

// ------------------------------------------------------------------ geometry helpers
function starShape(outer: number, inner: number) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer;
    const a = (i / 10) * TAU + Math.PI / 2;
    const p = [Math.cos(a) * r, Math.sin(a) * r] as const;
    if (i === 0) s.moveTo(p[0], p[1]); else s.lineTo(p[0], p[1]);
  }
  s.closePath();
  return s;
}
function starGeo(outer: number, depth = 0.08) {
  const g = new THREE.ExtrudeGeometry(starShape(outer, outer * 0.46), {
    depth, bevelEnabled: true, bevelThickness: depth * 0.6, bevelSize: outer * 0.09, bevelSegments: 2, curveSegments: 1,
  });
  g.center();
  return g;
}
function roundedRect(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function padGeo(w: number, h: number, depth: number, r = 0.2) {
  const g = new THREE.ExtrudeGeometry(roundedRect(w, h, r), {
    depth, bevelEnabled: true, bevelThickness: depth * 0.5, bevelSize: Math.min(r, depth) * 0.8, bevelSegments: 2, curveSegments: 4,
  });
  g.center();
  return g;
}
/** sets uv.v = local y / period (and u around) so stripes wrap horizontally */
function stripeUV(g: THREE.BufferGeometry, period: number, offset = 0) {
  const p = g.getAttribute('position');
  const uv = g.getAttribute('uv') as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const a = Math.atan2(p.getX(i), p.getZ(i));
    uv.setXY(i, (a / TAU + 0.5) * 2, (p.getY(i) + offset) / period);
  }
  uv.needsUpdate = true;
  return g;
}
function scaleUV(g: THREE.BufferGeometry, su: number, sv: number) {
  const uv = g.getAttribute('uv') as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
  uv.needsUpdate = true;
  return g;
}
/** tapered limb: open cylinder from y=0 down to y=-len with radii rTop→rBot plus end spheres */
function limb(rTop: number, rBot: number, len: number, seg = 20) {
  const g = new THREE.CylinderGeometry(rTop, rBot, len, seg, 6, true);
  g.translate(0, -len / 2, 0);
  return g;
}
function ellipsoid(rx: number, ry: number, rz: number, ws = 24, hs = 16) {
  const g = new THREE.SphereGeometry(1, ws, hs);
  g.scale(rx, ry, rz);
  return g;
}
/** lathe around Y from (radius, y) profile; elliptical cross-section */
function lathe(profile: [number, number][], sx: number, sz: number, seg = 40) {
  const g = new THREE.LatheGeometry(profile.map(([r, y]) => new THREE.Vector2(r, y)), seg);
  g.scale(sx, 1, sz);
  return g;
}
/** tube with radius taper along its length (tip thinner) */
function taperedTube(curve: THREE.Curve<THREE.Vector3>, tubular: number, radius: number, radial: number, tipScale = 0.35, rootScale = 0.7) {
  const g = new THREE.TubeGeometry(curve, tubular, radius, radial, false);
  // strands run along the tube: swap u (along) / v (around)
  const tuv = g.getAttribute('uv') as THREE.BufferAttribute;
  for (let i = 0; i < tuv.count; i++) tuv.setXY(i, tuv.getY(i), tuv.getX(i) * Math.max(1, curve.getLength() / 2));
  const p = g.getAttribute('position') as THREE.BufferAttribute;
  const c = new THREE.Vector3(), v = new THREE.Vector3();
  for (let i = 0; i <= tubular; i++) {
    const t = i / tubular;
    curve.getPointAt(t, c);
    const f = 1 - (1 - tipScale) * Math.pow(t, 1.4);
    const f0 = rootScale + (1 - rootScale) * smoothstep(0, 0.12, t); // thinner root
    for (let j = 0; j <= radial; j++) {
      const k = i * (radial + 1) + j;
      v.fromBufferAttribute(p, k).sub(c).multiplyScalar(f * f0).add(c);
      p.setXYZ(k, v.x, v.y, v.z);
    }
  }
  g.computeVertexNormals();
  return g;
}
/** helical ringlet wound around a drooping path */
class RingletCurve extends THREE.Curve<THREE.Vector3> {
  constructor(
    private start: THREE.Vector3, private dir: THREE.Vector3, private len: number, private droop: number,
    private coil: number, private turns: number, private phase: number, private side: THREE.Vector3,
  ) { super(); }
  path(t: number, out = new THREE.Vector3()) {
    const d = this.len * t;
    return out.copy(this.start).addScaledVector(this.dir, d).addScaledVector(this.side, d * 0.18 * t).add(V(0, -this.droop * d * d, 0));
  }
  getPoint(t: number, out = new THREE.Vector3()) {
    const p = this.path(t, new THREE.Vector3());
    const p2 = this.path(Math.min(1, t + 0.01), new THREE.Vector3());
    const p1 = this.path(Math.max(0, t - 0.01), new THREE.Vector3());
    const T = p2.sub(p1).normalize();
    const ref = Math.abs(T.y) < 0.9 ? V(0, 1, 0) : V(1, 0, 0);
    const N = new THREE.Vector3().crossVectors(T, ref).normalize();
    const B = new THREE.Vector3().crossVectors(T, N).normalize();
    const a = this.phase + t * this.turns * TAU;
    const rc = this.coil * (0.55 + 0.45 * smoothstep(0, 0.15, t)) * (1 - 0.25 * t);
    return out.copy(p).addScaledVector(N, Math.cos(a) * rc).addScaledVector(B, Math.sin(a) * rc);
  }
}

// ------------------------------------------------------------------ rig
const JOINTS: [name: string, parent: string, world: THREE.Vector3][] = [
  ['girl_root', '', V(0, 0, 0)],
  ['hips', 'girl_root', V(0, 11.0, 0)],
  ['spine', 'hips', V(0, 12.4, 0)],
  ['chest', 'spine', V(0, 14.6, 0)],
  ['neck', 'chest', V(0, 17.25, -0.1)],
  ['head', 'neck', V(0, 18.35, 0)],
  ['shoulderL', 'chest', V(1.35, 16.75, -0.1)],
  ['upperArmL', 'shoulderL', V(3.0, 16.4, -0.1)],
  ['forearmL', 'upperArmL', V(3.0, 12.95, -0.1)],
  ['handL', 'forearmL', V(3.0, 9.9, -0.05)],
  ['shoulderR', 'chest', V(-1.35, 16.75, -0.1)],
  ['upperArmR', 'shoulderR', V(-3.0, 16.4, -0.1)],
  ['forearmR', 'upperArmR', V(-3.0, 12.95, -0.1)],
  ['handR', 'forearmR', V(-3.0, 9.9, -0.05)],
  ['thighL', 'hips', V(1.25, 10.55, 0)],
  ['shinL', 'thighL', V(1.3, 5.9, 0.05)],
  ['footL', 'shinL', V(1.33, 1.3, 0)],
  ['thighR', 'hips', V(-1.25, 10.55, 0)],
  ['shinR', 'thighR', V(-1.3, 5.9, 0.05)],
  ['footR', 'shinR', V(-1.33, 1.3, 0)],
];

export const ANIM_JOINTS = [
  'hips', 'spine', 'chest', 'neck', 'head', 'ponytail', 'ponytailL', 'ponytailR', 'ponytailTip',
  'shoulderL', 'upperArmL', 'forearmL', 'handL', 'shoulderR', 'upperArmR', 'forearmR', 'handR',
  'thighL', 'shinL', 'footL', 'thighR', 'shinR', 'footR',
] as const;
type JointName = (typeof ANIM_JOINTS)[number];
type Pose = Partial<Record<JointName, [number, number, number]>>;


export function buildGirl(): BuiltModel {
  const scene = new THREE.Group();
  scene.name = 'rainbow_girl';
  const J: Record<string, THREE.Object3D> = {};
  const JW: Record<string, THREE.Vector3> = {};
  for (const [name, parent, w] of JOINTS) {
    const o = new THREE.Object3D();
    o.name = name;
    JW[name] = w.clone();
    if (parent) { o.position.copy(w).sub(JW[parent]); J[parent].add(o); } else scene.add(o);
    J[name] = o;
  }
  const addJoint = (name: string, parent: string, world: THREE.Vector3) => {
    const o = new THREE.Object3D();
    o.name = name;
    o.position.copy(world).sub(JW[parent]);
    J[parent].add(o);
    J[name] = o;
    JW[name] = world.clone();
    return o;
  };
  let meshCount = 0;
  const put = (joint: string, geo: THREE.BufferGeometry, mat: THREE.Material, world: THREE.Vector3, rot?: THREE.Euler, name?: string) => {
    const m = new THREE.Mesh(geo, mat);
    m.name = name ?? `${joint}_part${meshCount++}`;
    m.position.copy(world).sub(JW[joint]);
    if (rot) m.rotation.copy(rot);
    J[joint].add(m);
    return m;
  };

  // ---------------- materials (colour picks sampled by eye from the official reference)
  const R = rng(1977);
  const stripes = stripeTexture();
  const hairTex = hairTexture();
  const denimTex = denimTexture('#ffffff');
  const ribTex = ribTexture();
  const M = {
    skin: std('#f5b892', 0.6, 0, { emissive: new THREE.Color('#5a1a08'), emissiveIntensity: 0.08 }),
    skinDeep: std('#f0a989', 0.6),
    lid: std('#eeaa86', 0.62),
    hair: std('#8e5c38', 0.45, 0, { map: hairTex }),
    hairLight: std('#b27d4c', 0.42, 0, { map: hairTex }),
    hairDark: std('#54321e', 0.55, 0, { map: hairTex }),
    brow: std('#4a2312', 0.6),
    lash: std('#24100a', 0.5),
    eye: std('#ffffff', 0.42, 0, { map: eyeTexture() }),
    face: new THREE.MeshStandardMaterial({ map: faceTexture(), transparent: true, roughness: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }),
    hoodie: std('#ffffff', 0.85, 0, { map: stripes }),
    rib: std('#ffffff', 0.9, 0, { map: ribTex }),
    collar: std('#c49cf0', 0.88, 0, { map: ribTex }),
    lining: std('#f3ecfb', 0.85),
    zip: std('#e9e4f2', 0.35, 0.5),
    denim: std('#5468ad', 0.82, 0, { map: denimTex }),
    denimLight: std('#7d90cc', 0.82, 0, { map: denimTex }),
    stitch: std('#e7b55a', 0.7),
    purple: std('#9b4fe0', 0.42, 0, { emissive: new THREE.Color('#3a0a6a'), emissiveIntensity: 0.15 }),
    purpleDeep: std('#7d36c4', 0.45),
    shoe: std('#9353d8', 0.5),
    white: std('#f8f6fc', 0.55),
    sole: std('#fbfaff', 0.6),
    gold: std('#ffc43a', 0.24, 1.0),
    starYellow: std('#ffcd38', 0.55, 0.05, { emissive: new THREE.Color('#5a3a00'), emissiveIntensity: 0.15 }),
    sock: std('#fbf9ff', 0.8),
  };

  for (const [k, m] of Object.entries(M)) m.name = k;

  // ================================================================== HEAD
  const hc = addJoint('headCenter', 'head', HEAD_CENTER);
  void hc;
  // skull / face — with real almond eye openings (boundary snapped exactly onto the opening curve)
  {
    const g = new THREE.SphereGeometry(1, 84, 60);
    const p = g.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const q = headPoint(p.getX(i), p.getY(i), p.getZ(i));
      p.setXYZ(i, q.x, q.y, q.z);
    }
    const index = g.getIndex()!;
    const keepTri: number[] = [];
    const usedKeep = new Uint8Array(p.count), usedCut = new Uint8Array(p.count);
    for (let i = 0; i < index.count; i += 3) {
      const ia = index.getX(i), ib = index.getX(i + 1), ic = index.getX(i + 2);
      const cx = (p.getX(ia) + p.getX(ib) + p.getX(ic)) / 3;
      const cy = (p.getY(ia) + p.getY(ib) + p.getY(ic)) / 3;
      const cz = (p.getZ(ia) + p.getZ(ib) + p.getZ(ic)) / 3;
      const cut = cz > 0.8 && eyeOpeningSide(cx, cy) !== 0;
      for (const v of [ia, ib, ic]) (cut ? usedCut : usedKeep)[v] = 1;
      if (!cut) keepTri.push(ia, ib, ic);
    }
    for (let v = 0; v < p.count; v++) {
      if (!(usedKeep[v] && usedCut[v])) continue;
      const x = p.getX(v), y = p.getY(v);
      const s = Math.sign(x) || 1;
      const k = 1 / Math.sqrt(eyeEllipseValue(s, x, y));
      const nx = s * EYE.cx + (x - s * EYE.cx) * k, ny = EYE.cy + (y - EYE.cy) * k;
      p.setXYZ(v, nx, ny, surfaceZ(nx, ny));
    }
    g.setIndex(keepTri);
    g.computeVertexNormals();
    put('headCenter', g, M.skin, HEAD_CENTER, undefined, 'head_skin');
  }
  // face decal (smile, cheeks) hugging the face surface
  {
    const nx = 44, ny = 36;
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    const valid: boolean[] = [];
    for (let j = 0; j <= ny; j++) {
      for (let i = 0; i <= nx; i++) {
        const x = FACE_RECT.x0 + ((FACE_RECT.x1 - FACE_RECT.x0) * i) / nx;
        const y = FACE_RECT.y0 + ((FACE_RECT.y1 - FACE_RECT.y0) * j) / ny;
        const z = surfaceZ(x, y);
        valid.push(z > 0.55);
        pos.push(x, y, z + 0.025);
        uv.push(i / nx, j / ny);
      }
    }
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1;
        if (valid[a] && valid[b] && valid[c] && valid[d]) idx.push(a, b, d, a, d, c);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    const m = put('headCenter', g, M.face, HEAD_CENTER, undefined, 'face_decal');
    m.renderOrder = 2;
  }
  // small button nose
  put('headCenter', ellipsoid(0.24, 0.17, 0.2, 16, 12), M.skinDeep, HEAD_CENTER.clone().add(V(0, -0.86, surfaceZ(0, -0.86) - 0.08)), undefined, 'nose');
  // ears + gold hoop earrings
  for (const s of [1, -1]) {
    const ex = s * (HEAD.a * taper(-0.4 / HEAD.b) - 0.12);
    put('headCenter', ellipsoid(0.42, 0.72, 0.56, 16, 12), M.skin, HEAD_CENTER.clone().add(V(ex, -0.38, -0.12)), undefined, s > 0 ? 'earL' : 'earR');
    put('headCenter', ellipsoid(0.2, 0.42, 0.3, 12, 8), M.skinDeep, HEAD_CENTER.clone().add(V(ex + s * 0.25, -0.38, -0.05)));
    const hoop = new THREE.TorusGeometry(0.46, 0.085, 10, 32);
    put('headCenter', hoop, M.gold, HEAD_CENTER.clone().add(V(ex + s * 0.18, -1.38, 0.0)), new THREE.Euler(0, Math.PI / 2, 0), s > 0 ? 'hoopL' : 'hoopR');
  }
  // eyes: face-conforming eye surface set just behind each opening (planar iris UVs),
  // blink lid = skin patch behind the opening with a 'blink' morph target, lash line along the top edge
  for (const s of [1, -1]) {
    const side = s > 0 ? 'L' : 'R';
    const ecx = s * EYE.cx, ecy = EYE.cy;
    const eyeJ = addJoint(`eye${side}`, 'headCenter', HEAD_CENTER.clone().add(V(ecx, ecy, surfaceZ(ecx, ecy) - 0.07)));
    // eye surface
    {
      const nx = 26, ny = 26, pad = 0.2;
      const x0 = ecx - EYE.rx - pad, x1 = ecx + EYE.rx + pad, y0 = ecy - EYE.ryB - pad, y1 = ecy + EYE.ryT + pad;
      const pos: number[] = [], uv: number[] = [], idx: number[] = [];
      const o = eyeJ.position.clone().add(JW['headCenter']).sub(HEAD_CENTER); // eye joint in head-centre space
      for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
        const x = x0 + ((x1 - x0) * i) / nx, y = y0 + ((y1 - y0) * j) / ny;
        pos.push(x - o.x, y - o.y, surfaceZ(x, y) - 0.07 - o.z);
        uv.push((x - ecx) / (2 * EYE.uvHalf) + 0.5, (y - ecy - 0.1) / (2 * EYE.uvHalf) + 0.5); // iris centred in the almond
      }
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const a0 = j * (nx + 1) + i;
        idx.push(a0, a0 + 1, a0 + nx + 2, a0, a0 + nx + 2, a0 + nx + 1);
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      g.setIndex(idx);
      g.computeVertexNormals();
      const m = new THREE.Mesh(g, M.eye);
      m.name = `eyeball${side}`;
      eyeJ.add(m);
    }
    // blink lid (behind the skin, only visible through the opening); base = collapsed at the top edge
    {
      const nc = 18, nr = 8, pad = 0.12;
      const base: number[] = [], closed: number[] = [], idx: number[] = [];
      const o = eyeJ.position.clone().add(JW['headCenter']).sub(HEAD_CENTER);
      for (let r = 0; r <= nr; r++) for (let c = 0; c <= nc; c++) {
        const u = (c / nc) * 2 - 1;
        const x = ecx + u * (EYE.rx + pad);
        const w = Math.sqrt(Math.max(0, 1 - Math.min(1, Math.abs(u)) ** 2));
        const top = ecy + (EYE.ryT + pad) * w + 0.02, bot = ecy - (EYE.ryB + pad) * w - 0.02;
        const yc = top + (bot - top) * (r / nr);
        closed.push(x - o.x, yc - o.y, surfaceZ(x, yc) - 0.03 - o.z);
        base.push(x - o.x, top - o.y, surfaceZ(x, top) - 0.03 - o.z);
      }
      for (let r = 0; r < nr; r++) for (let c = 0; c < nc; c++) {
        const a0 = r * (nc + 1) + c;
        idx.push(a0, a0 + nc + 1, a0 + 1, a0 + 1, a0 + nc + 1, a0 + nc + 2);
      }
      const gc = new THREE.BufferGeometry();
      gc.setAttribute('position', new THREE.Float32BufferAttribute(closed, 3));
      gc.setIndex(idx);
      gc.computeVertexNormals();
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(base, 3));
      g.setAttribute('normal', gc.getAttribute('normal').clone());
      g.setIndex(idx);
      g.morphAttributes.position = [new THREE.Float32BufferAttribute(closed, 3)];
      const lid = new THREE.Mesh(g, M.lid);
      lid.name = `eyelid${side}`;
      lid.morphTargetInfluences = [0];
      lid.morphTargetDictionary = { blink: 0 };
      eyeJ.add(lid);
      J[lid.name] = lid;
    }
    // lash line along the top edge of the opening (on the skin) + outer-corner flicks
    {
      const pts: THREE.Vector3[] = [];
      for (let k = 0; k <= 18; k++) {
        const th = THREE.MathUtils.lerp(0.05, Math.PI - 0.05, k / 18);
        const x = ecx + Math.cos(th) * EYE.rx * 1.02, y = ecy + Math.sin(th) * EYE.ryT * 1.02 + 0.02;
        pts.push(V(x, y, surfaceZ(x, y) + 0.05));
      }
      put('headCenter', taperedTube(new THREE.CatmullRomCurve3(pts), 30, 0.085, 6, 0.6, 0.45), M.lash, HEAD_CENTER, undefined, `lash${side}`);
      // outer corner: +X end for the left eye, −X end for the right eye
      for (let f = 0; f < 2; f++) {
        const th = s > 0 ? 0.12 + f * 0.32 : Math.PI - 0.12 - f * 0.32;
        const bx = ecx + Math.cos(th) * EYE.rx * 1.02, by = ecy + Math.sin(th) * EYE.ryT * 1.02 + 0.02;
        const base = V(bx, by, surfaceZ(bx, by) + 0.05);
        const tx = bx + s * (0.32 - f * 0.1), ty = by + 0.22 - f * 0.04;
        const tip = V(tx, ty, surfaceZ(tx, ty) + 0.12);
        const mid = base.clone().lerp(tip, 0.5).add(V(0, -0.03, 0.04));
        put('headCenter', taperedTube(new THREE.CatmullRomCurve3([base, mid, tip]), 8, 0.075, 5, 0.12, 1), M.lash, HEAD_CENTER, undefined, `lash_flick${side}`);
      }
    }
    // eyebrow (warm dark brown, gently arched)
    const bp: THREE.Vector3[] = [];
    for (let k = 0; k <= 8; k++) {
      const t = k / 8;
      const x = s * (0.45 + 1.25 * t);
      const y = 0.98 + 0.26 * Math.sin(Math.PI * (0.15 + 0.75 * t)) - 0.12 * t;
      bp.push(V(x, y, surfaceZ(x, y) + 0.05));
    }
    put('headCenter', taperedTube(new THREE.CatmullRomCurve3(bp), 16, 0.15, 6, 0.4), M.brow, HEAD_CENTER, undefined, `brow${side}`);
  }

  // ---------------- HAIR: cap pulled back from a soft, exact hairline (parametric rows hairline → crown)
  {
    // hairline elevation (unit-sphere y) by azimuth φ (0° = front, 90° = her side/ear, 180° = back)
    const ctl: [number, number][] = [[0, 0.64], [18, 0.6], [38, 0.49], [58, 0.34], [76, 0.19], [92, 0.1], [108, -0.2], [128, -0.5], [155, -0.66], [180, -0.7]];
    const thrAt = (deg: number) => {
      const a = Math.abs((((deg + 180) % 360) + 360) % 360 - 180);
      for (let i = 0; i < ctl.length - 1; i++) {
        if (a <= ctl[i + 1][0]) return THREE.MathUtils.lerp(ctl[i][1], ctl[i + 1][1], smoothstep(ctl[i][0], ctl[i + 1][0], a));
      }
      return ctl[ctl.length - 1][1];
    };
    const NU = 96, NV = 26;
    const pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let iu = 0; iu <= NU; iu++) {
      const deg = (iu / NU) * 360;
      const phi = THREE.MathUtils.degToRad(deg);
      const el0 = Math.asin(thrAt(deg));
      for (let iv = 0; iv <= NV; iv++) {
        const f = iv / NV;
        const el = el0 + (Math.PI / 2 - el0) * (1 - Math.pow(1 - f, 1.35));
        const y = Math.sin(el), rxz = Math.cos(el);
        const x = Math.sin(phi) * rxz, z = Math.cos(phi) * rxz;
        const grow = 0.02 + 0.17 * smoothstep(0, 0.5, f);
        const q = headPoint(x, y, z, grow);
        q.y += 0.05 + 0.24 * Math.max(0, y) * Math.max(0, y) * (z > 0 ? 1 : 0.6) * smoothstep(0, 0.3, f);
        q.z -= 0.03;
        pos.push(q.x, q.y, q.z);
        uv.push((iu / NU) * 7 + Math.sin(phi) * f * 0.55, f * 1.6); // strands sweep outward-back
      }
    }
    for (let iu = 0; iu < NU; iu++) {
      for (let iv = 0; iv < NV; iv++) {
        const a = iu * (NV + 1) + iv, b = a + NV + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    const capMat = M.hair.clone();
    capMat.side = THREE.DoubleSide;
    put('headCenter', g, capMat, HEAD_CENTER, undefined, 'hair_cap');
  }
  // temple ringlets + baby curls at the hairline
  const ringlet = (joint: string, startW: THREE.Vector3, dir: THREE.Vector3, len: number, droop: number, coil: number, tube: number, mat: THREE.Material, side = V(1, 0, 0)) => {
    const turns = len / 0.62;
    const curve = new RingletCurve(V(0, 0, 0), dir.clone().normalize(), len, droop, coil, turns, R() * TAU, side);
    curve.arcLengthDivisions = 260;
    const tubular = Math.max(20, Math.ceil(turns * 8));
    const g = taperedTube(curve, tubular, tube, 5, 0.4);
    return put(joint, g, mat, startW, undefined, 'ringlet');
  };
  for (const s of [1, -1]) {
    ringlet('headCenter', HEAD_CENTER.clone().add(V(s * 2.42, 0.5, 0.75)), V(s * 0.15, -1, 0.12), 2.0, 0.02, 0.17, 0.12, M.hair);
    ringlet('headCenter', HEAD_CENTER.clone().add(V(s * 2.6, 0.2, 0.2)), V(s * 0.2, -1, -0.1), 1.5, 0.02, 0.15, 0.1, M.hairDark);
  }
  // ---------------- HIGH CURLY PONYTAIL (joint at the crown-back tie point)
  // fountain silhouette: rises above the crown, arcs back and cascades down to about the nape
  const tieW = HEAD_CENTER.clone().add(V(0, 2.62, -1.25));
  addJoint('ponytail', 'headCenter', tieW);
  addJoint('ponytailL', 'ponytail', tieW.clone().add(V(0.4, 0.3, -0.5)));
  addJoint('ponytailR', 'ponytail', tieW.clone().add(V(-0.4, 0.3, -0.5)));
  addJoint('ponytailTip', 'ponytail', tieW.clone().add(V(0, 0.2, -1.6)));
  // purple hair tie
  put('ponytail', new THREE.TorusGeometry(0.55, 0.22, 10, 24), M.purple, tieW.clone().add(V(0, 0.12, -0.05)), new THREE.Euler(-0.55, 0, 0), 'hair_tie');
  const arcDir = V(0, 0.82, -0.58);
  const arc = (d: number, droop = 0.26) => tieW.clone().addScaledVector(arcDir, d).add(V(0, -droop * d * d, 0));
  // short dense ringlets bunched at the tie for a full, puffy crown of curls
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * TAU;
    const dir = V(Math.cos(a) * 0.7, 0.75 + 0.3 * Math.sin(a), -0.35 + Math.sin(a) * 0.45);
    ringlet(i % 2 ? 'ponytailL' : 'ponytailR', tieW.clone().add(V(Math.cos(a) * 0.35, 0.1, Math.sin(a) * 0.3 - 0.2)), dir, 1.8 + R() * 1.2, 0.32, 0.3, 0.22, i % 3 ? M.hair : M.hairLight, V(Math.cos(a), 0, 0));
  }
  // springy corkscrew ringlets cascading from the tie point
  for (let i = 0; i < 40; i++) {
    const sx = (R() - 0.5) * 1.5;
    const dir = V(sx, 0.62 + R() * 0.4, -0.42 - R() * 0.42);
    const len = 3.4 + R() * 3.8;
    const start = tieW.clone().add(V((R() - 0.5) * 0.7, R() * 0.3, -0.1 - R() * 0.35));
    const joint = sx > 0.3 ? 'ponytailL' : sx < -0.3 ? 'ponytailR' : len > 5.2 ? 'ponytailTip' : 'ponytail';
    ringlet(joint, start, dir, len, 0.2 + R() * 0.12, 0.3 + R() * 0.1, 0.21 + R() * 0.06, R() > 0.4 ? M.hair : M.hairLight, V(Math.sign(sx) || 1, 0, 0));
  }

  // ---------------- PURPLE HEADBAND + BIG BOW with gold star
  {
    const band = new THREE.TorusGeometry(3.06, 0.2, 8, 72, Math.PI + 0.62);
    band.rotateZ(-0.31);
    band.scale(1, 1, 2.3);
    put('headCenter', band, M.purple, HEAD_CENTER.clone().add(V(0, 0.08, 0.2)), new THREE.Euler(0.34, 0, 0), 'headband');
    // bow sits on top, a touch toward her right and front
    const bowW = HEAD_CENTER.clone().add(V(-0.45, 3.05, 1.0));
    const bow = new THREE.Group();
    bow.name = 'bow';
    bow.position.copy(bowW).sub(JW['headCenter']);
    bow.rotation.set(-0.42, 0.18, 0.2);
    bow.scale.setScalar(0.86);
    J['headCenter'].add(bow);
    // puffy satin loops: fat torus so only a narrow fold opening remains
    const loop = new THREE.TorusGeometry(0.5, 0.47, 14, 28);
    loop.scale(1.62, 0.86, 0.5);
    for (const s of [1, -1]) {
      const l = new THREE.Mesh(loop, M.purple);
      l.name = 'bow_loop';
      l.position.set(s * 1.0, 0.18, 0);
      l.rotation.set(0, 0, s * 0.32);
      bow.add(l);
      const tail = new THREE.Mesh(padGeo(0.55, 1.25, 0.1, 0.12), M.purpleDeep);
      tail.name = 'bow_tail';
      tail.position.set(s * 0.42, -0.62, -0.12);
      tail.rotation.set(0.25, 0, s * 0.45);
      bow.add(tail);
    }
    const knot = new THREE.Mesh(ellipsoid(0.42, 0.4, 0.32, 16, 12), M.purpleDeep);
    knot.name = 'bow_knot';
    bow.add(knot);
    const st = new THREE.Mesh(starGeo(0.3, 0.06), M.starYellow);
    st.name = 'bow_star';
    st.position.set(0, 0.02, 0.36);
    bow.add(st);
  }

  // ================================================================== NECK + HOODIE
  put('neck', new THREE.CylinderGeometry(0.72, 0.8, 1.9, 16), M.skin, V(0, 18.1, 0.0), undefined, 'neck_skin');
  const PERIOD = 1.45;
  // full silhouette profile (used for the zipper/drawstrings) …
  const torsoProfile: [number, number][] = [
    [0.0, 10.25], [2.45, 10.3], [2.62, 10.75], [2.52, 11.6], [2.36, 12.6], [2.34, 13.7], [2.46, 14.9],
    [2.47, 15.8], [2.32, 16.55], [2.0, 17.05], [1.45, 17.45], [0.95, 17.6],
  ];
  {
    // … split in two so leaning never exposes the waist: upper torso rides the spine joint,
    // the lower "skirt" (hem) rides the hips and tucks inside the torso above the waist.
    const upper: [number, number][] = [[1.9, 11.8], [2.36, 12.0], [2.36, 12.6], ...torsoProfile.slice(5)];
    const g = lathe(upper, 1.13, 0.86, 44);
    stripeUV(g, PERIOD);
    put('spine', g, M.hoodie, V(0, 0, 0), undefined, 'hoodie_torso');
    const skirt = lathe([[0.0, 10.25], [2.45, 10.3], [2.62, 10.75], [2.54, 11.6], [2.38, 12.3], [2.22, 12.75], [1.9, 12.95]], 1.13, 0.86, 44);
    stripeUV(skirt, PERIOD);
    put('hips', skirt, M.hoodie, V(0, 0, 0), undefined, 'hoodie_skirt');
    // ribbed hem
    const hem = new THREE.TorusGeometry(2.5, 0.34, 10, 44);
    hem.rotateX(Math.PI / 2);
    hem.scale(1.13, 1, 0.86);
    scaleUV(hem, 10, 1);
    put('hips', hem, M.rib, V(0, 10.5, 0), undefined, 'hoodie_hem');
    // zipper + drawstrings following the front surface
    const rAt = (y: number) => {
      for (let i = 1; i < torsoProfile.length; i++) {
        const [r1, y1] = torsoProfile[i], [r0, y0] = torsoProfile[i - 1];
        if (y <= y1) return r0 + ((r1 - r0) * (y - y0)) / (y1 - y0);
      }
      return 1;
    };
    const zp: THREE.Vector3[] = [];
    for (let y = 11.9; y <= 17.2; y += 0.4) zp.push(V(0, y, rAt(y) * 0.86 + 0.02));
    put('spine', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(zp), 20, 0.07, 6), M.zip, V(0, 0, 0), undefined, 'zipper');
    const zl: THREE.Vector3[] = [];
    for (let y = 10.5; y <= 12.3; y += 0.3) zl.push(V(0, y, rAt(y) * 0.86 + 0.03));
    put('hips', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(zl), 8, 0.07, 6), M.zip, V(0, 0, 0), undefined, 'zipper_lower');
    put('spine', padGeo(0.22, 0.5, 0.08, 0.06), M.zip, V(0.0, 15.7, rAt(15.7) * 0.86 + 0.08), undefined, 'zip_pull');
    for (const s of [1, -1]) {
      const dp: THREE.Vector3[] = [];
      for (let y = 17.0; y >= 14.4; y -= 0.35) dp.push(V(s * (0.5 + 0.06 * (17 - y)), y, rAt(y) * 0.86 + 0.06));
      put('spine', new THREE.TubeGeometry(new THREE.CatmullRomCurve3(dp), 16, 0.06, 6), M.white, V(0, 0, 0), undefined, 'drawstring');
      put('spine', new THREE.CylinderGeometry(0.08, 0.08, 0.32, 8), M.gold, dp[dp.length - 1].clone().add(V(0, -0.15, 0)));
    }
  }
  // hood bunched behind the neck + collar
  {
    const collar = new THREE.TorusGeometry(1.3, 0.42, 12, 32);
    collar.rotateX(Math.PI / 2 - 0.15);
    scaleUV(collar, 12, 1);
    put('chest', collar, M.collar, V(0, 17.45, -0.15), undefined, 'hood_collar');
    const hood = ellipsoid(2.05, 1.35, 1.15, 28, 18);
    stripeUV(hood, PERIOD, 0.4);
    put('chest', hood, M.hoodie, V(0, 17.2, -1.75), new THREE.Euler(0.25, 0, 0), 'hood');
    const lining = ellipsoid(1.4, 0.75, 0.6, 20, 12);
    put('chest', lining, M.lining, V(0, 17.75, -1.25), new THREE.Euler(0.5, 0, 0), 'hood_lining');
  }
  // arms: shoulder ball, striped sleeves, elbow, cuff, wrist, hand
  for (const s of [1, -1]) {
    const sd = s > 0 ? 'L' : 'R';
    const ua = JW[`upperArm${sd}`], fa = JW[`forearm${sd}`], hd = JW[`hand${sd}`];
    put(`upperArm${sd}`, stripeUV(ellipsoid(1.02, 1.0, 0.98, 24, 16), PERIOD, 0.2), M.hoodie, ua.clone(), undefined, `shoulder_ball${sd}`);
    put(`upperArm${sd}`, stripeUV(limb(0.98, 0.86, 3.45, 22), PERIOD), M.hoodie, ua.clone(), undefined, `sleeve_upper${sd}`);
    put(`forearm${sd}`, stripeUV(ellipsoid(0.88, 0.88, 0.88, 20, 14), PERIOD), M.hoodie, fa.clone(), undefined, `elbow${sd}`);
    put(`forearm${sd}`, stripeUV(limb(0.87, 0.8, 2.75, 22), PERIOD, 0.3), M.hoodie, fa.clone(), undefined, `sleeve_fore${sd}`);
    const cuff = new THREE.CylinderGeometry(0.66, 0.6, 0.55, 22, 1, true);
    scaleUV(cuff, 6, 1);
    put(`forearm${sd}`, cuff, M.rib, fa.clone().add(V(0, -2.85, 0)), undefined, `cuff${sd}`);
    put(`forearm${sd}`, new THREE.CylinderGeometry(0.42, 0.45, 0.6, 14), M.skin, fa.clone().add(V(0, -2.95, 0)));
    // star patch on her RIGHT upper sleeve, outer side
    if (s < 0) {
      put('upperArmR', starGeo(0.55, 0.07), M.starYellow, ua.clone().add(V(-0.97, -1.25, 0.05)), new THREE.Euler(0, -Math.PI / 2 + 0.08, 0.1), 'sleeve_star');
    }
    // hand: palm faces the body (thin along X), four fingers + thumb, slightly curled
    put(`hand${sd}`, ellipsoid(0.32, 0.62, 0.56, 18, 14), M.skin, hd.clone().add(V(0, -0.62, 0.05)), undefined, `palm${sd}`);
    for (let f = 0; f < 4; f++) {
      const fz = 0.38 - f * 0.25;
      const g = new THREE.CapsuleGeometry(0.135, 0.52 - Math.abs(f - 1.3) * 0.07, 4, 8);
      put(`hand${sd}`, g, M.skin, hd.clone().add(V(-s * 0.05, -1.4, fz)), new THREE.Euler(0.05 * (f - 1.5), 0, -s * 0.22), `finger${sd}${f}`);
    }
    put(`hand${sd}`, new THREE.CapsuleGeometry(0.15, 0.42, 4, 8), M.skin, hd.clone().add(V(-s * 0.16, -0.62, 0.62)), new THREE.Euler(0.75, 0, -s * 0.35), `thumb${sd}`);
  }

  // ================================================================== JEANS
  {
    const g = lathe([[0, 9.2], [2.0, 9.25], [2.28, 9.8], [2.38, 10.6], [2.3, 11.4], [2.0, 11.9], [0, 11.95]], 1.08, 0.9, 36);
    scaleUV(g, 3, 2);
    put('hips', g, M.denim, V(0, 0, 0), undefined, 'jeans_hips');
    // back pockets
    for (const s of [1, -1]) {
      put('hips', padGeo(1.15, 1.05, 0.08, 0.25), M.denimLight, V(s * 0.95, 9.85, -2.08), new THREE.Euler(0, Math.PI, 0), 'back_pocket');
    }
  }
  for (const s of [1, -1]) {
    const sd = s > 0 ? 'L' : 'R';
    const th = JW[`thigh${sd}`], sh = JW[`shin${sd}`], ft = JW[`foot${sd}`];
    put(`thigh${sd}`, ellipsoid(1.28, 1.25, 1.24, 20, 14), M.denim, th.clone(), undefined, `hip_ball${sd}`);
    put(`thigh${sd}`, scaleUV(limb(1.28, 1.08, 4.7, 22), 3, 3), M.denim, th.clone(), undefined, `jeans_thigh${sd}`);
    put(`shin${sd}`, ellipsoid(1.08, 1.08, 1.08, 18, 12), M.denim, sh.clone(), undefined, `knee${sd}`);
    put(`shin${sd}`, scaleUV(limb(1.07, 1.04, 3.7, 22), 3, 3), M.denim, sh.clone(), undefined, `jeans_shin${sd}`);
    // wide rolled cuff (lighter denim) with rounded lips
    const cuffY = 2.3;
    put(`shin${sd}`, scaleUV(new THREE.CylinderGeometry(1.18, 1.2, 0.8, 24, 1, true), 4, 1), M.denimLight, V(sh.x, cuffY, sh.z), undefined, `jeans_cuff${sd}`);
    for (const dy of [0.4, -0.4]) {
      const t = new THREE.TorusGeometry(1.19, 0.11, 6, 24);
      t.rotateX(Math.PI / 2);
      put(`shin${sd}`, t, M.denimLight, V(sh.x, cuffY + dy, sh.z));
    }
    // cargo pocket on the outer thigh — yellow star patch on her RIGHT pocket
    const px = s * 2.38;
    const pk = put(`thigh${sd}`, padGeo(1.25, 1.45, 0.22, 0.22), M.denim, V(px, 7.85, 0.15), new THREE.Euler(0, s * Math.PI / 2, 0), `cargo_pocket${sd}`);
    pk.rotation.z = -s * 0.04;
    put(`thigh${sd}`, padGeo(1.35, 0.45, 0.22, 0.15), M.denimLight, V(px + s * 0.05, 8.75, 0.15), new THREE.Euler(0, s * Math.PI / 2, 0), `cargo_flap${sd}`);
    if (s < 0) put('thighR', starGeo(0.42, 0.06), M.starYellow, V(px - 0.2, 7.75, 0.15), new THREE.Euler(0, -Math.PI / 2, 0), 'pocket_star');
    // sock
    put(`foot${sd}`, new THREE.CylinderGeometry(0.66, 0.7, 1.1, 18), M.sock, V(ft.x, 1.7, ft.z), undefined, `sock${sd}`);
    // sneaker: white sole, purple upper, white toe cap, collar, laces, yellow star (outer side)
    const sole = new THREE.ExtrudeGeometry(roundedRect(1.7, 3.4, 0.75), { depth: 0.3, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.08, bevelSegments: 2, curveSegments: 6 });
    sole.rotateX(-Math.PI / 2);
    put(`foot${sd}`, sole, M.sole, V(ft.x, 0.05, ft.z + 0.62), undefined, `sole${sd}`);
    put(`foot${sd}`, ellipsoid(0.82, 0.66, 1.55, 24, 16), M.shoe, V(ft.x, 0.78, ft.z + 0.5), undefined, `shoe_upper${sd}`);
    put(`foot${sd}`, ellipsoid(0.8, 0.5, 0.72, 20, 12), M.white, V(ft.x, 0.62, ft.z + 1.55), undefined, `toe_cap${sd}`);
    const collar = new THREE.TorusGeometry(0.7, 0.2, 8, 20);
    collar.rotateX(Math.PI / 2 + 0.25);
    put(`foot${sd}`, collar, M.purpleDeep, V(ft.x, 1.22, ft.z - 0.15), undefined, `shoe_collar${sd}`);
    for (let k = 0; k < 3; k++) {
      const z = ft.z + 0.35 + k * 0.33;
      put(`foot${sd}`, new THREE.CapsuleGeometry(0.07, 0.72, 3, 6), M.white, V(ft.x, 1.25 - k * 0.12, z), new THREE.Euler(0.35, 0, Math.PI / 2), `lace${sd}`);
    }
    put(`foot${sd}`, starGeo(0.34, 0.05), M.starYellow, V(ft.x + s * 0.8, 0.8, ft.z + 0.45), new THREE.Euler(0, s * Math.PI / 2, 0), `shoe_star${sd}`);
  }

  // ================================================================== ANIMATIONS
  const animations = buildClips();
  scene.userData = {
    character: 'official cartoon girl (Rainbow)',
    identity: 'character_references/official_cartoon_girl_original.jpg',
    rig: 'joint hierarchy, rigid parts (not skin-weighted)',
    height: 26,
  };
  return { scene, animations };
}

// ------------------------------------------------------------------ clips
const base = (): Pose => ({
  upperArmL: [0, 0, 7], upperArmR: [0, 0, -7], forearmL: [-12, 0, 0], forearmR: [-12, 0, 0],
  handL: [0, 0, -3], handR: [0, 0, 3],
});

function merge(...ps: Pose[]): Pose {
  const out: Pose = {};
  for (const p of ps) for (const k in p) {
    const key = k as JointName;
    const a = out[key] ?? [0, 0, 0];
    const b = p[key]!;
    out[key] = [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  }
  return out;
}

interface Frame { pose: Pose; hips?: [number, number, number] }

function sampleClip(name: string, duration: number, fn: (t: number) => Frame, fps = 24): THREE.AnimationClip {
  const n = Math.max(2, Math.round(duration * fps) + 1);
  const times: number[] = [];
  const quats: Record<string, number[]> = {};
  const hipsPos: number[] = [];
  const e = new THREE.Euler();
  const q = new THREE.Quaternion();
  const prev: Record<string, THREE.Quaternion> = {};
  for (let i = 0; i < n; i++) {
    const t = (i / (n - 1)) * duration;
    times.push(t);
    const f = fn(t);
    for (const j of ANIM_JOINTS) {
      const r = f.pose[j] ?? [0, 0, 0];
      e.set(THREE.MathUtils.degToRad(r[0]), THREE.MathUtils.degToRad(r[1]), THREE.MathUtils.degToRad(r[2]), 'XYZ');
      q.setFromEuler(e);
      if (prev[j] && prev[j].dot(q) < 0) q.set(-q.x, -q.y, -q.z, -q.w);
      prev[j] = (prev[j] ?? new THREE.Quaternion()).copy(q);
      (quats[j] ??= []).push(q.x, q.y, q.z, q.w);
    }
    const h = f.hips ?? [0, 0, 0];
    hipsPos.push(h[0], 11.0 + h[1], h[2]);
  }
  const tracks: THREE.KeyframeTrack[] = ANIM_JOINTS.map((j) => new THREE.QuaternionKeyframeTrack(`${j}.quaternion`, times, quats[j]));
  tracks.push(new THREE.VectorKeyframeTrack('hips.position', times, hipsPos));
  return new THREE.AnimationClip(name, duration, tracks);
}

/** key-pose interpolation with smooth (ease in/out) blending */
function keyed(keys: { t: number; pose: Pose; hips?: [number, number, number] }[], extra?: (t: number) => Pose) {
  return (t: number): Frame => {
    let i = 0;
    while (i < keys.length - 2 && t > keys[i + 1].t) i++;
    const a = keys[i], b = keys[Math.min(i + 1, keys.length - 1)];
    const w = b.t > a.t ? smoothstep(a.t, b.t, t) : 1;
    const pose: Pose = {};
    for (const j of ANIM_JOINTS) {
      const pa = a.pose[j] ?? [0, 0, 0], pb = b.pose[j] ?? [0, 0, 0];
      pose[j] = [pa[0] + (pb[0] - pa[0]) * w, pa[1] + (pb[1] - pa[1]) * w, pa[2] + (pb[2] - pa[2]) * w];
    }
    const ha = a.hips ?? [0, 0, 0], hb = b.hips ?? [0, 0, 0];
    return { pose: extra ? merge(pose, extra(t)) : pose, hips: [ha[0] + (hb[0] - ha[0]) * w, ha[1] + (hb[1] - ha[1]) * w, ha[2] + (hb[2] - ha[2]) * w] };
  };
}

const bump = (p: number, c: number, w: number) => Math.exp(-(((p - c) / w) ** 2));

/** walking legs + pelvis + ponytail for phase φ (0..1); stride scales amplitude */
function walkCore(phi: number, stride = 1): Frame {
  const pose: Pose = {};
  for (const [sd, off] of [['L', 0], ['R', 0.5]] as const) {
    const p = (phi + off) % 1;
    pose[`thigh${sd}`] = [(-24 * Math.cos(TAU * p) + 2) * stride, 0, 0];
    pose[`shin${sd}`] = [6 + 12 * bump(p, 0.08, 0.07) + 54 * stride * bump(p, 0.76, 0.12), 0, 0];
    pose[`foot${sd}`] = [-14 * (bump(p, 0, 0.08) + bump(p, 1, 0.08)) + 24 * bump(p, 0.56, 0.07) - 6 * bump(p, 0.8, 0.1), 0, 0];
  }
  pose.hips = [2, -5 * Math.cos(TAU * phi) * stride, -2.5 * Math.sin(TAU * phi)];
  pose.spine = [2, 4 * Math.cos(TAU * phi) * stride, 1.2 * Math.sin(TAU * phi)];
  pose.chest = [3, 3 * Math.cos(TAU * phi) * stride, 0];
  pose.neck = [0, -2 * Math.cos(TAU * phi), 0];
  pose.head = [-3 + 1.5 * Math.cos(2 * TAU * phi), -2 * Math.cos(TAU * phi), 0];
  pose.ponytail = [-3 + 6 * Math.cos(2 * TAU * phi - 1.2), 0, 7 * Math.sin(TAU * phi - 1.0)];
  pose.ponytailL = [3 * Math.sin(2 * TAU * phi - 1.8), 0, 4 * Math.sin(TAU * phi - 1.5)];
  pose.ponytailR = [3 * Math.sin(2 * TAU * phi - 2.0), 0, 4 * Math.sin(TAU * phi - 1.4)];
  pose.ponytailTip = [5 * Math.sin(2 * TAU * phi - 2.2), 0, 6 * Math.sin(TAU * phi - 1.9)];
  return { pose, hips: [0, 0.16 * Math.cos(2 * TAU * phi + Math.PI) * stride, 0] };
}

function buildClips(): THREE.AnimationClip[] {
  const clips: THREE.AnimationClip[] = [];

  // idle: two breaths, slow weight shift, glance around, gentle ponytail sway (6 s loop)
  clips.push(sampleClip('idle', 6, (t) => {
    const w = (TAU * t) / 6, b = (TAU * 2 * t) / 6;
    return {
      pose: merge(base(), {
        hips: [0, 2 * Math.sin(w), 2.2 * Math.sin(w)],
        spine: [0.6 * Math.sin(b), -1.2 * Math.sin(w), -1.5 * Math.sin(w)],
        chest: [1.4 * Math.sin(b), 0, -0.6 * Math.sin(w)],
        neck: [0, 4 * Math.sin(w + 1.2), 0],
        head: [-2 + 2 * Math.sin(b + 0.6), 5 * Math.sin(w + 1.4), 2 * Math.sin(w + 0.4)],
        upperArmL: [2 * Math.sin(w + 0.5), 0, 1.5 * Math.sin(b)],
        upperArmR: [-2 * Math.sin(w + 0.5), 0, -1.5 * Math.sin(b)],
        forearmL: [-3 * Math.sin(w), 0, 0], forearmR: [-3 * Math.sin(w + 1), 0, 0],
        thighL: [-2, 0, -2.2 * Math.sin(w)], thighR: [2, 0, -2.2 * Math.sin(w)],
        shinL: [3 + 2 * Math.max(0, -Math.sin(w)), 0, 0], shinR: [3 + 2 * Math.max(0, Math.sin(w)), 0, 0],
        ponytail: [1.5 * Math.sin(b + 1), 0, 3 * Math.sin(w + 0.8)],
        ponytailTip: [2 * Math.sin(b + 1.6), 0, 3 * Math.sin(w + 1.4)],
      }),
      hips: [0.18 * Math.sin(w), -0.04 * Math.abs(Math.sin(w)), 0],
    };
  }));

  // walk: 1.06 s cycle, natural arm swing opposite the legs
  const WALK = 1.06;
  clips.push(sampleClip('walk', WALK, (t) => {
    const phi = t / WALK;
    const f = walkCore(phi);
    const arms: Pose = {};
    for (const [sd, off, s] of [['L', 0, 1], ['R', 0.5, -1]] as const) {
      const p = (phi + off) % 1;
      arms[`upperArm${sd}`] = [20 * Math.cos(TAU * p), 0, s * 8];
      arms[`forearm${sd}`] = [-14 - 16 * (0.5 - 0.5 * Math.cos(TAU * (p + 0.5))), 0, 0];
      arms[`hand${sd}`] = [0, 0, -s * 4];
    }
    return { pose: merge(f.pose, arms), hips: f.hips };
  }));

  // carryTowel: walking with a bundle held in front (shorter stride, arms locked forward)
  clips.push(sampleClip('carryTowel', WALK, (t) => {
    const phi = t / WALK;
    const f = walkCore(phi, 0.8);
    const bob = Math.cos(2 * TAU * phi);
    return {
      pose: merge(f.pose, {
        chest: [-5, 0, 0],
        head: [2, 0, 0],
        upperArmL: [-40 + 2 * bob, 0, 13], upperArmR: [-40 + 2 * bob, 0, -13],
        forearmL: [-64, 0, 0], forearmR: [-64, 0, 0],
        handL: [10, 0, -22], handR: [10, 0, 22],
      }),
      hips: f.hips,
    };
  }));

  const carry: Pose = {
    chest: [-4, 0, 0], upperArmL: [-40, 0, 13], upperArmR: [-40, 0, -13], forearmL: [-64, 0, 0], forearmR: [-64, 0, 0],
    handL: [10, 0, -22], handR: [10, 0, 22],
  };
  // dropLoad: lean toward the open front-loader and push the bundle in, then straighten up
  clips.push(sampleClip('dropLoad', 2.3, keyed([
    { t: 0, pose: merge(carry, { thighL: [-2, 0, 0], thighR: [2, 0, 0] }) },
    { t: 0.45, pose: merge(carry, { spine: [6, 0, 0], thighL: [-6, 0, 0], shinL: [8, 0, 0] }) },
    {
      t: 1.15, hips: [0, -0.7, -0.7],
      pose: {
        hips: [8, 0, 0], spine: [18, 0, 0], chest: [16, 0, 0], neck: [-6, 0, 0], head: [-10, 0, 0],
        upperArmL: [-78, 0, 10], upperArmR: [-78, 0, -10], forearmL: [-22, 0, 0], forearmR: [-22, 0, 0], handL: [25, 0, -10], handR: [25, 0, 10],
        thighL: [-24, 0, 0], shinL: [28, 0, 0], footL: [-4, 0, 0], thighR: [-8, 0, 0], shinR: [22, 0, 0], footR: [-12, 0, 0],
        ponytail: [10, 0, 0], ponytailTip: [12, 0, 0],
      },
    },
    {
      t: 1.5, hips: [0, -0.75, -0.75],
      pose: {
        hips: [9, 0, 0], spine: [20, 0, 0], chest: [18, 0, 0], neck: [-6, 0, 0], head: [-10, 0, 0],
        upperArmL: [-86, 0, 8], upperArmR: [-86, 0, -8], forearmL: [-8, 0, 0], forearmR: [-8, 0, 0], handL: [10, 0, -6], handR: [10, 0, 6],
        thighL: [-24, 0, 0], shinL: [28, 0, 0], footL: [-4, 0, 0], thighR: [-8, 0, 0], shinR: [22, 0, 0], footR: [-12, 0, 0],
        ponytail: [-6, 0, 3], ponytailTip: [-8, 0, 0],
      },
    },
    { t: 2.3, pose: merge(base(), { ponytail: [3, 0, 0] }) },
  ])));

  // closeDoor: wind up and swing the right arm to push the door shut
  clips.push(sampleClip('closeDoor', 1.4, keyed([
    { t: 0, pose: base() },
    { t: 0.38, pose: merge(base(), { chest: [2, 16, 0], spine: [2, 8, 0], upperArmR: [-55, 0, -30], forearmR: [-48, 0, 0], handR: [0, 0, 10], head: [0, 8, 0], thighR: [-6, 0, 0] }) },
    { t: 0.72, hips: [0, -0.2, 0.2], pose: merge(base(), { chest: [6, -12, 0], spine: [6, -6, 0], upperArmR: [-84, 0, 0], forearmR: [-6, 0, 0], handR: [-30, 0, 0], head: [-2, -6, 0], thighR: [-16, 0, 0], shinR: [10, 0, 0], ponytail: [0, 0, -8] }) },
    { t: 1.4, pose: merge(base(), { ponytail: [0, 0, 3] }) },
  ])));

  // laundryCounter: standing at a counter folding (loop 3.2 s)
  clips.push(sampleClip('laundryCounter', 3.2, (t) => {
    const w = (TAU * t) / 3.2;
    return {
      pose: {
        hips: [0, 2 * Math.sin(w), 1.5 * Math.sin(w)], spine: [4, 0, 0], chest: [8 + Math.sin(2 * w), 3 * Math.sin(w), 0],
        neck: [4, 0, 0], head: [14 + 3 * Math.sin(w + 0.5), 6 * Math.sin(w), 0],
        upperArmL: [-42 + 9 * Math.sin(w), 0, 10], upperArmR: [-42 + 9 * Math.sin(w + Math.PI), 0, -10],
        forearmL: [-46 - 12 * Math.sin(w + 0.6), 0, 0], forearmR: [-46 - 12 * Math.sin(w + Math.PI + 0.6), 0, 0],
        handL: [22, 0, -10 + 8 * Math.sin(w)], handR: [22, 0, 10 + 8 * Math.sin(w + Math.PI)],
        thighL: [-2, 0, -1.5 * Math.sin(w)], thighR: [2, 0, -1.5 * Math.sin(w)], shinL: [3, 0, 0], shinR: [3, 0, 0],
        ponytail: [-2, 0, 3 * Math.sin(w + 0.9)], ponytailTip: [0, 0, 3 * Math.sin(w + 1.5)],
      },
      hips: [0.1 * Math.sin(w), 0, 0],
    };
  }));

  // leanReachTowel: lean ~42° into the drum, both hands down/forward onto the towel, face up, smile (holds last pose)
  const lean: Pose = {
    hips: [8, 0, 0], spine: [18, 0, 0], chest: [16, 0, 0], neck: [-10, 0, 0], head: [-16, 0, 5],
    upperArmL: [-64, 0, 6], upperArmR: [-64, 0, -6], forearmL: [-26, 0, 0], forearmR: [-26, 0, 0],
    handL: [22, 0, -8], handR: [22, 0, 8],
    thighL: [-16, 0, 0], shinL: [26, 0, 0], footL: [-10, 0, 0], thighR: [-16, 0, 0], shinR: [26, 0, 0], footR: [-10, 0, 0],
    ponytail: [12, 0, 4], ponytailL: [4, 0, 0], ponytailR: [4, 0, 0], ponytailTip: [14, 0, 0],
  };
  clips.push(sampleClip('leanReachTowel', 1.6, keyed([
    { t: 0, pose: merge(base(), { upperArmL: [-10, 0, 0], upperArmR: [-10, 0, 0] }) },
    { t: 0.95, hips: [0, -0.75, -0.95], pose: merge(lean, { head: [-6, 0, 0], ponytailTip: [6, 0, 0] }) },
    { t: 1.6, hips: [0, -0.8, -1.0], pose: lean },
  ])));

  // holdTowel: holding the folded towel in front at chest height, slight lift (loop 3 s)
  clips.push(sampleClip('holdTowel', 3, (t) => {
    const w = (TAU * t) / 3;
    return {
      pose: {
        hips: [0, 0, 1.2 * Math.sin(w)], spine: [1, 0, 0], chest: [-2 + Math.sin(2 * w), 0, 0],
        neck: [2, 0, 0], head: [8 + 2 * Math.sin(w), 4 * Math.sin(w + 0.8), 5 + 2 * Math.sin(w)],
        upperArmL: [-32 + 3 * Math.sin(w), 0, 12], upperArmR: [-32 + 3 * Math.sin(w), 0, -12],
        forearmL: [-74 + 2 * Math.sin(w), 0, 0], forearmR: [-74 + 2 * Math.sin(w), 0, 0],
        handL: [0, 0, -18], handR: [0, 0, 18],
        thighL: [-1, 0, 0], thighR: [1, 0, 0], shinL: [3, 0, 0], shinR: [3, 0, 0],
        ponytail: [1.5 * Math.sin(2 * w), 0, 3 * Math.sin(w + 1)], ponytailTip: [2 * Math.sin(2 * w + 0.6), 0, 3 * Math.sin(w + 1.6)],
      },
      hips: [0.06 * Math.sin(w), 0.05 * Math.sin(2 * w), 0],
    };
  }));

  // blink (eyelid morph targets) — the runtime also blinks procedurally
  clips.push(new THREE.AnimationClip('blink', 0.24, [
    new THREE.NumberKeyframeTrack('eyelidL.morphTargetInfluences[blink]', [0, 0.07, 0.12, 0.24], [0, 1, 1, 0]),
    new THREE.NumberKeyframeTrack('eyelidR.morphTargetInfluences[blink]', [0, 0.07, 0.12, 0.24], [0, 1, 1, 0]),
  ]));
  return clips;
}
