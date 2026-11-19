/**
 * Tunnel geometry generated from course-aligned "tube paths", so walls, rings and nozzles follow the
 * 04 slide, the 06 arch and the full 07 plunge with no seams.
 *  - courseTubePath:   tube centred on the course itself (chute, gold ring pipe)
 *  - straightTubePath: tube on a low-pass-filtered axis of the course (05–07): the tunnel stays
 *    straight with concentric rings converging to one vanishing point (refs 05/07) while the stream
 *    winds inside it. Radius/depth adapt so the floor always stays below the winding stream, and the
 *    axis converges exactly onto the course at both ends (04 pipe junction, 08 chamber inlet).
 */
import * as THREE from 'three';
import type { Course } from './course';

export interface Frame { pos: THREE.Vector3; tan: THREE.Vector3; up: THREE.Vector3; right: THREE.Vector3 }

export interface TubePath {
  frame(s: number): Frame;
  radius(s: number): number;
  /** distance from the water point on the axis down to the tube bottom */
  depth(s: number): number;
}

export function courseTubePath(course: Course, radius: (s: number) => number, depth: number | ((s: number) => number) = 0.9): TubePath {
  return {
    frame: (s) => course.sample(s),
    radius,
    depth: typeof depth === 'number' ? () => depth : depth,
  };
}

export function straightTubePath(
  course: Course,
  s0: number,
  s1: number,
  opts: { window: number; taper: number; baseRadius: (s: number) => number },
): TubePath {
  const ds = 0.5;
  const n = Math.ceil((s1 - s0) / ds) + 1;
  const S = (i: number) => Math.min(s1, s0 + i * ds);
  const axis: THREE.Vector3[] = [];
  const cp: THREE.Vector3[] = [];
  for (let i = 0; i < n; i++) cp.push(course.sample(S(i)).pos.clone());
  for (let i = 0; i < n; i++) {
    const s = S(i);
    const taper = THREE.MathUtils.smoothstep(s, s0, s0 + opts.taper) * (1 - THREE.MathUtils.smoothstep(s, s1 - opts.taper, s1));
    const W = opts.window * taper;
    const k = Math.round(W / ds);
    let x = 0, z = 0, wsum = 0;
    for (let j = i - k; j <= i + k; j++) {
      const jj = THREE.MathUtils.clamp(j, 0, n - 1);
      const w = k === 0 ? 1 : 1 - Math.abs(j - i) / (k + 1);
      x += cp[jj].x * w; z += cp[jj].z * w; wsum += w;
    }
    axis.push(new THREE.Vector3(x / wsum, cp[i].y, z / wsum));
  }
  const frames: Frame[] = axis.map((p, i) => {
    const a = axis[Math.max(0, i - 2)], b = axis[Math.min(n - 1, i + 2)];
    const tan = b.clone().sub(a).normalize();
    const cu = course.sample(S(i)).up;
    const up = cu.clone().addScaledVector(tan, -cu.dot(tan)).normalize();
    const right = new THREE.Vector3().crossVectors(tan, up).normalize();
    return { pos: p, tan, up, right };
  });
  // radius/depth so the floor stays below the stream edges, dilated + smoothed for a steady tube
  const rawR: number[] = [], rawD: number[] = [];
  for (let i = 0; i < n; i++) {
    const s = S(i);
    const d = cp[i].clone().sub(frames[i].pos).dot(frames[i].right);
    const X = Math.abs(d) + course.widthAt(s) / 2 + 0.25;
    const r = Math.max(opts.baseRadius(s), X + 1.2);
    rawR.push(r);
    rawD.push(Math.max(0.9, r - Math.sqrt(Math.max(0, r * r - X * X)) + 0.35));
  }
  const dilate = (arr: number[], k: number) => arr.map((_, i) => { let m = -Infinity; for (let j = i - k; j <= i + k; j++) m = Math.max(m, arr[THREE.MathUtils.clamp(j, 0, n - 1)]); return m; });
  const box = (arr: number[], k: number) => arr.map((_, i) => { let a = 0; for (let j = i - k; j <= i + k; j++) a += arr[THREE.MathUtils.clamp(j, 0, n - 1)]; return a / (2 * k + 1); });
  const R = box(dilate(rawR, 30), 16);
  const D = box(dilate(rawD, 30), 16);
  const idx = (s: number) => {
    const x = THREE.MathUtils.clamp((s - s0) / ds, 0, n - 1);
    const i = Math.min(n - 2, Math.floor(x));
    return { i, f: x - i };
  };
  const lerpArr = (arr: number[], s: number) => { const { i, f } = idx(s); return arr[i] + (arr[i + 1] - arr[i]) * f; };
  return {
    frame(s) {
      const { i, f } = idx(s);
      const A = frames[i], B = frames[i + 1];
      const pos = A.pos.clone().lerp(B.pos, f);
      const tan = A.tan.clone().lerp(B.tan, f).normalize();
      const up = A.up.clone().lerp(B.up, f);
      up.addScaledVector(tan, -up.dot(tan)).normalize();
      return { pos, tan, up, right: new THREE.Vector3().crossVectors(tan, up).normalize() };
    },
    radius: (s) => lerpArr(R, s),
    depth: (s) => lerpArr(D, s),
  };
}

export function tubeCenterAt(path: TubePath, s: number, out = new THREE.Vector3()) {
  const f = path.frame(s);
  return out.copy(f.pos).addScaledVector(f.up, path.radius(s) - path.depth(s));
}

export interface TubeGeoOptions {
  radial?: number;
  step?: number;
  vScale?: number;
  /** angular range (radians, measured from the bottom) — default full circle */
  arc?: number;
  /** radius offset (negative = inset toward the axis) */
  inset?: number;
}

export function buildTubeGeometry(path: TubePath, s0: number, s1: number, o: TubeGeoOptions = {}): THREE.BufferGeometry {
  const radial = o.radial ?? 48;
  const step = o.step ?? 0.6;
  const vScale = o.vScale ?? 1;
  const arc = o.arc ?? Math.PI * 2;
  const rings = Math.max(2, Math.ceil((s1 - s0) / step) + 1);
  const pos = new Float32Array(rings * (radial + 1) * 3);
  const nor = new Float32Array(rings * (radial + 1) * 3);
  const uv = new Float32Array(rings * (radial + 1) * 2);
  const c = new THREE.Vector3();
  const d = new THREE.Vector3();
  for (let i = 0; i < rings; i++) {
    const s = s0 + ((s1 - s0) * i) / (rings - 1);
    const f = path.frame(s);
    const r = path.radius(s) + (o.inset ?? 0);
    c.copy(f.pos).addScaledVector(f.up, path.radius(s) - path.depth(s));
    for (let j = 0; j <= radial; j++) {
      const th = -Math.PI / 2 - arc / 2 + (j / radial) * arc; // centred on the bottom
      d.copy(f.right).multiplyScalar(Math.cos(th)).addScaledVector(f.up, Math.sin(th));
      const k = i * (radial + 1) + j;
      pos[k * 3] = c.x + d.x * r;
      pos[k * 3 + 1] = c.y + d.y * r;
      pos[k * 3 + 2] = c.z + d.z * r;
      nor[k * 3] = -d.x; nor[k * 3 + 1] = -d.y; nor[k * 3 + 2] = -d.z;
      uv[k * 2] = j / radial;
      uv[k * 2 + 1] = s / vScale;
    }
  }
  const idx: number[] = [];
  for (let i = 0; i < rings - 1; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * (radial + 1) + j, b = a + radial + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeBoundingSphere();
  return g;
}

/** Instanced thick gold ring ribs placed perpendicular to the tube every `spacing` units. */
export function buildRings(
  path: TubePath,
  s0: number,
  s1: number,
  spacing: number,
  material: THREE.Material,
  opts: { tube?: number; double?: boolean; inset?: number; extra?: number } = {},
): THREE.InstancedMesh {
  const tube = opts.tube ?? 0.075;
  const geo = new THREE.TorusGeometry(1, tube, 14, 72);
  const n = Math.max(1, Math.floor((s1 - s0) / spacing) + 1) * (opts.double ? 2 : 1);
  const mesh = new THREE.InstancedMesh(geo, material, n);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const basis = new THREE.Matrix4();
  const c = new THREE.Vector3();
  let k = 0;
  for (let s = s0; s <= s1 + 1e-6 && k < n; s += spacing) {
    for (let dbl = 0; dbl < (opts.double ? 2 : 1); dbl++) {
      const ss = s + dbl * spacing * 0.16;
      const f = path.frame(ss);
      const r = path.radius(ss) - (opts.inset ?? 0.05) + (opts.extra ?? 0);
      c.copy(f.pos).addScaledVector(f.up, path.radius(ss) - path.depth(ss));
      basis.makeBasis(f.right, f.up, f.tan);
      q.setFromRotationMatrix(basis);
      const sc = dbl ? r * 0.985 : r;
      m.compose(c, q, new THREE.Vector3(sc, sc, sc * (dbl ? 0.6 : 1)));
      mesh.setMatrixAt(k++, m);
    }
  }
  mesh.count = k;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  return mesh;
}

/** Half-dome wall "lids"/spray heads mounted on the upper tube walls (refs 05–07). */
export function buildNozzles(
  path: TubePath,
  s0: number,
  s1: number,
  spacing: number,
  domeMat: THREE.Material,
  rimMat: THREE.Material,
  opts: { angleDeg?: number; size?: number } = {},
): THREE.Group {
  const group = new THREE.Group();
  const size = opts.size ?? 1.6;
  const dome = new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.scale(1.25, 0.55, 0.85);
  const rim = new THREE.TorusGeometry(1, 0.1, 10, 40);
  rim.rotateX(Math.PI / 2);
  rim.scale(1.25, 1, 0.85);
  const nDomes = Math.floor((s1 - s0) / spacing) + 1;
  const imDome = new THREE.InstancedMesh(dome, domeMat, nDomes);
  const imRim = new THREE.InstancedMesh(rim, rimMat, nDomes);
  const m = new THREE.Matrix4();
  const basis = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Vector3();
  const dir = new THREE.Vector3();
  let k = 0;
  for (let s = s0; s <= s1 && k < nDomes; s += spacing, k++) {
    const f = path.frame(s);
    const r = path.radius(s);
    const side = k % 2 === 0 ? 1 : -1;
    const ang = THREE.MathUtils.degToRad(opts.angleDeg ?? 32);
    tubeCenterAt(path, s, c);
    dir.copy(f.right).multiplyScalar(Math.cos(ang) * side).addScaledVector(f.up, Math.sin(ang)).normalize();
    const p = c.clone().addScaledVector(dir, r * 0.985);
    const inward = dir.clone().negate();
    const xAxis = new THREE.Vector3().crossVectors(inward, f.tan).normalize();
    const zAxis = new THREE.Vector3().crossVectors(xAxis, inward).normalize();
    basis.makeBasis(xAxis, inward, zAxis);
    q.setFromRotationMatrix(basis);
    m.compose(p, q, new THREE.Vector3(size, size, size));
    imDome.setMatrixAt(k, m);
    imRim.setMatrixAt(k, m);
  }
  imDome.count = imRim.count = k;
  imDome.frustumCulled = imRim.frustumCulled = false;
  group.add(imDome, imRim);
  return group;
}
