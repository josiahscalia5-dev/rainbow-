/**
 * Tunnel geometry generated directly from the master course frames, so walls, rings and nozzles
 * follow every bend, the 06 arch and the full 07 plunge with no seams.
 */
import * as THREE from 'three';
import type { Course } from './course';

export interface TubeOptions {
  radius: (s: number) => number;
  /** how far the tube bottom sits below the water surface (course centreline) */
  depth?: number;
  radial?: number;
  step?: number;
  /** world units per 1.0 of v texture coordinate */
  vScale?: number;
  /** extra centre lift (e.g. hall above the arch) */
  lift?: (s: number) => number;
}

export function tubeCenter(course: Course, s: number, r: number, depth: number, lift = 0, out = new THREE.Vector3()) {
  const f = course.sample(s);
  return out.copy(f.pos).addScaledVector(f.up, r - depth + lift);
}

export function buildTubeGeometry(course: Course, s0: number, s1: number, o: TubeOptions): THREE.BufferGeometry {
  const radial = o.radial ?? 48;
  const step = o.step ?? 0.6;
  const depth = o.depth ?? 0.9;
  const vScale = o.vScale ?? 1;
  const rings = Math.max(2, Math.ceil((s1 - s0) / step) + 1);
  const pos = new Float32Array(rings * (radial + 1) * 3);
  const nor = new Float32Array(rings * (radial + 1) * 3);
  const uv = new Float32Array(rings * (radial + 1) * 2);
  const c = new THREE.Vector3();
  const d = new THREE.Vector3();
  for (let i = 0; i < rings; i++) {
    const s = s0 + ((s1 - s0) * i) / (rings - 1);
    const f = course.sample(s);
    const r = o.radius(s);
    c.copy(f.pos).addScaledVector(f.up, r - depth + (o.lift ? o.lift(s) : 0));
    for (let j = 0; j <= radial; j++) {
      const th = -Math.PI / 2 + (j / radial) * Math.PI * 2; // j=0 at the bottom
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

/** Instanced thick gold ring ribs placed perpendicular to the course every `spacing` units. */
export function buildRings(
  course: Course,
  s0: number,
  s1: number,
  spacing: number,
  radius: (s: number) => number,
  material: THREE.Material,
  opts: { depth?: number; tube?: number; double?: boolean; inset?: number; lift?: (s: number) => number } = {},
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
  for (let s = s0; s <= s1 && k < n; s += spacing) {
    for (let dbl = 0; dbl < (opts.double ? 2 : 1); dbl++) {
      const ss = s + dbl * spacing * 0.16;
      const f = course.sample(ss);
      const r = radius(ss) - (opts.inset ?? 0.05);
      c.copy(f.pos).addScaledVector(f.up, radius(ss) - (opts.depth ?? 0.9) + (opts.lift ? opts.lift(ss) : 0));
      // torus lies in its local XY plane; map local X→right, Y→up, Z→tangent
      basis.makeBasis(f.right, f.up, f.tan);
      q.setFromRotationMatrix(basis);
      const sc = dbl ? r * 0.985 : r;
      m.compose(c, q, new THREE.Vector3(sc, sc, sc * (dbl ? 0.6 : 1)));
      mesh.setMatrixAt(k++, m);
    }
  }
  mesh.count = k;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
  mesh.frustumCulled = false;
  return mesh;
}

/** Half-dome wall "lids"/spray heads mounted on the upper tube walls (refs 05–07). */
export function buildNozzles(
  course: Course,
  s0: number,
  s1: number,
  spacing: number,
  radius: (s: number) => number,
  domeMat: THREE.Material,
  rimMat: THREE.Material,
  opts: { depth?: number; angleDeg?: number; size?: number } = {},
): THREE.Group {
  const group = new THREE.Group();
  const size = opts.size ?? 1.6;
  const dome = new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  dome.scale(1.25, 0.5, 0.85);
  const rim = new THREE.TorusGeometry(1, 0.09, 10, 40);
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
  const tan2 = new THREE.Vector3();
  let k = 0;
  for (let s = s0; s <= s1 && k < nDomes; s += spacing, k++) {
    const f = course.sample(s);
    const r = radius(s);
    const side = k % 2 === 0 ? 1 : -1;
    const ang = THREE.MathUtils.degToRad(opts.angleDeg ?? 32) * side; // from the horizontal
    c.copy(f.pos).addScaledVector(f.up, r - (opts.depth ?? 0.9));
    dir.copy(f.right).multiplyScalar(Math.cos(ang) * side).addScaledVector(f.up, Math.abs(Math.sin(ang)));
    dir.normalize();
    const p = c.clone().addScaledVector(dir, r * 0.985);
    // dome local +Y points inward (−dir), local Z along tangent
    const inward = dir.clone().negate();
    tan2.copy(f.tan);
    const xAxis = new THREE.Vector3().crossVectors(inward, tan2).normalize();
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
