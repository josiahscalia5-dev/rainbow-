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
  // exact straight stretches (05 current): the axis is pulled onto the course's straight centre line
  // (foot of the perpendicular from the stream point), so the tunnel is truly straight — no yaw
  // wiggle, no roll — and the rings converge on one vanishing point. Blends in over 12 units after
  // the 04 junction; height/roll/radius/depth return to the 06 arch tube just past its foot (wRun),
  // the lateral position over the last ~20 units of the stretch (wXZ) so the hand-over to the
  // filtered 06 axis has no yaw kink and 06 itself is unchanged.
  const wRun = new Array<number>(n).fill(0);
  const wXZ = new Array<number>(n).fill(0);
  const runDepth = new Array<number>(n).fill(0);
  for (const r of course.straightAxes ?? []) {
    if (r.s1 <= s0 || r.s0 >= s1) continue;
    const ab = r.b.clone().sub(r.a);
    const ab2 = ab.lengthSq();
    for (let i = 0; i < n; i++) {
      const s = S(i);
      const wIn = THREE.MathUtils.smoothstep(s, r.s0, r.s0 + 12);
      const w = wIn * (1 - THREE.MathUtils.smoothstep(s, r.s1 - 6, r.s1 + 2));
      const wl = wIn * (1 - THREE.MathUtils.smoothstep(s, r.s1 - 18, r.s1 + 2));
      if (wl <= wXZ[i]) continue;
      wXZ[i] = wl;
      wRun[i] = w;
      runDepth[i] = r.floorDepth;
      const u = cp[i].clone().sub(r.a).dot(ab) / ab2;
      const onLine = r.a.clone().addScaledVector(ab, u);
      axis[i].x += (onLine.x - axis[i].x) * wl;
      axis[i].z += (onLine.z - axis[i].z) * wl;
      axis[i].y += (onLine.y - axis[i].y) * w;
    }
  }
  const WU = new THREE.Vector3(0, 1, 0);
  const frames: Frame[] = axis.map((p, i) => {
    const a = axis[Math.max(0, i - 2)], b = axis[Math.min(n - 1, i + 2)];
    const tan = b.clone().sub(a).normalize();
    const cu = course.sample(S(i)).up.clone().lerp(WU, wRun[i]); // no banking roll on straight stretches
    const up = cu.addScaledVector(tan, -cu.dot(tan)).normalize();
    const right = new THREE.Vector3().crossVectors(tan, up).normalize();
    return { pos: p, tan, up, right };
  });
  // radius/depth so the floor stays below the stream edges, dilated + smoothed for a steady tube
  const rawR: number[] = [], rawD: number[] = [], needR: number[] = [], needD: number[] = [];
  for (let i = 0; i < n; i++) {
    const s = S(i);
    const off = cp[i].clone().sub(frames[i].pos);
    const d = off.dot(frames[i].right);
    const X = Math.abs(d) + course.widthAt(s) / 2 + 0.25;
    const r = Math.max(opts.baseRadius(s), X + 0.7);
    rawR.push(r);
    rawD.push(Math.max(0.9, r - Math.sqrt(Math.max(0, r * r - X * X)) + 0.2));
    // straight stretches: also account for the stream's height above/below the (straight) axis point
    needR.push(X + 0.7);
    needD.push(r - Math.sqrt(Math.max(0, r * r - X * X)) + 0.2 - off.dot(frames[i].up));
  }
  const dilate = (arr: number[], k: number) => arr.map((_, i) => { let m = -Infinity; for (let j = i - k; j <= i + k; j++) m = Math.max(m, arr[THREE.MathUtils.clamp(j, 0, n - 1)]); return m; });
  const box = (arr: number[], k: number) => arr.map((_, i) => { let a = 0; for (let j = i - k; j <= i + k; j++) a += arr[THREE.MathUtils.clamp(j, 0, n - 1)]; return a / (2 * k + 1); });
  const R = box(dilate(rawR, 30), 16);
  const D = box(dilate(rawD, 30), 16);
  if (wRun.some((w) => w > 0)) {
    // on a straight stretch the tunnel keeps its own constant radius (the next stage's wider hall is
    // not dilated back into it) and the stream sits `floorDepth` above the tunnel bottom (wide current)
    const nR = box(dilate(needR, 30), 16);
    const nD = box(dilate(needD, 30), 16);
    for (let i = 0; i < n; i++) {
      const w = wRun[i];
      if (w <= 0) continue;
      R[i] += (Math.max(opts.baseRadius(S(i)), nR[i]) - R[i]) * w;
      D[i] += (Math.max(runDepth[i], nD[i], 0.9) - D[i]) * w;
    }
  }
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
  /**
   * Store the front-face (outward) normal. The faces wind outward, so BackSide/DoubleSide materials
   * flip this to the inward normal and light the inside of the tube correctly. The legacy default
   * (false) stores -d, which those materials flip to point AWAY from the viewer (dot(N,V) <= 0 →
   * full fresnel, un-tinted pale reflections); kept only so the 02 chute / 04 pipe look is unchanged.
   */
  frontNormals?: boolean;
  /** also store the local tube frame per vertex (`tubeAxis`, `tubeUp`) for withTubeStrips('attribute') */
  axisAttr?: boolean;
}

export function buildTubeGeometry(path: TubePath, s0: number, s1: number, o: TubeGeoOptions = {}): THREE.BufferGeometry {
  const radial = o.radial ?? 48;
  const step = o.step ?? 0.6;
  const vScale = o.vScale ?? 1;
  const arc = o.arc ?? Math.PI * 2;
  const ns = o.frontNormals ? 1 : -1;
  const rings = Math.max(2, Math.ceil((s1 - s0) / step) + 1);
  const pos = new Float32Array(rings * (radial + 1) * 3);
  const nor = new Float32Array(rings * (radial + 1) * 3);
  const uv = new Float32Array(rings * (radial + 1) * 2);
  const ax = o.axisAttr ? new Float32Array(rings * (radial + 1) * 3) : null;
  const au = o.axisAttr ? new Float32Array(rings * (radial + 1) * 3) : null;
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
      if (ax && au) { f.tan.toArray(ax, k * 3); f.up.toArray(au, k * 3); }
      pos[k * 3] = c.x + d.x * r;
      pos[k * 3 + 1] = c.y + d.y * r;
      pos[k * 3 + 2] = c.z + d.z * r;
      nor[k * 3] = ns * d.x; nor[k * 3 + 1] = ns * d.y; nor[k * 3 + 2] = ns * d.z;
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
  if (ax && au) {
    g.setAttribute('tubeAxis', new THREE.BufferAttribute(ax, 3));
    g.setAttribute('tubeUp', new THREE.BufferAttribute(au, 3));
  }
  g.setIndex(idx);
  g.computeBoundingSphere();
  return g;
}

/**
 * Washer-tube ring collar (ref 05: "flat gold band with a double contour"): a broad FLAT inner band that
 * barely stands off the wall, a dark groove, then a thin raised lip on the near edge (−z, the side the
 * rider looks at) whose small camera-facing side catches a bright line. The protrusion is shallow on
 * purpose: a deep collar shows a big camera-facing annulus (the old "thick orange pipe" look, 21% gold)
 * and pokes through the stream where it hugs the wall (06 arch).
 * Lathe around local Z; radial values are fractions of the tube radius, axial values are world units
 * (the instance scales z by 1). Interior corners are duplicated so every facet keeps a crisp normal.
 */
export function collarGeometry(depth = 0.022, lip = 0.012, width = 1.1, segments = 96): THREE.BufferGeometry {
  const w = width / 2;
  const d = depth;
  const lipW = Math.min(0.16, width * 0.15), groove = Math.min(0.07, width * 0.06);
  // traversed from +z to -z so LatheGeometry's faces/normals point INWARD (toward the tunnel axis)
  const prof: [number, number][] = [
    [1.03, w], [1 - d * 0.5, w], // far side (hidden from the rider)
    [1 - d, w - 0.05], // far chamfer
    [1 - d, -w + lipW + groove + 0.02], // the flat band
    [1 - d * 0.55, -w + lipW + groove * 0.5], // dark groove (recessed toward the wall)
    [1 - d - lip, -w + lipW], [1 - d - lip, -w + 0.05], // raised lip
    [1 - d * 0.35, -w], // lip's camera-facing side → thin bright contour
    [1.03, -w],
  ];
  const pts: THREE.Vector2[] = [];
  prof.forEach(([x, y], i) => {
    pts.push(new THREE.Vector2(x, y));
    if (i > 0 && i < prof.length - 1) pts.push(new THREE.Vector2(x, y)); // crisp facet normals
  });
  const g = new THREE.LatheGeometry(pts, segments);
  g.rotateX(Math.PI / 2); // lathe axis Y → tube axis Z
  return g;
}

/** Instanced thick gold ring ribs placed perpendicular to the tube every `spacing` units. */
export function buildRings(
  path: TubePath,
  s0: number,
  s1: number,
  spacing: number,
  material: THREE.Material,
  opts: { tube?: number; double?: boolean; inset?: number; extra?: number; collar?: { depth?: number; lip?: number; width?: number; segments?: number } } = {},
): THREE.InstancedMesh {
  const tube = opts.tube ?? 0.075;
  const collar = opts.collar;
  const geo = collar ? collarGeometry(collar.depth, collar.lip, collar.width, collar.segments) : new THREE.TorusGeometry(1, tube, 14, 72);
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
      // a collar keeps its axial width in world units; a torus scales uniformly
      m.compose(c, q, new THREE.Vector3(sc, sc, collar ? 1 : sc * (dbl ? 0.6 : 1)));
      mesh.setMatrixAt(k++, m);
    }
  }
  mesh.count = k;
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  return mesh;
}

/**
 * Washer wall lids / nozzle hoods (ref 05): copper "D" hoods — a half disc with a tall polished rim band,
 * a softly domed top and a recessed underside with an inner lip — sticking out of BOTH side walls a bit
 * above eye level (≈2 and 10 o'clock seen from the rider), one symmetric pair per ring bay, so they
 * shrink toward the vanishing point in two rows and the rider sees the bright rim band and the dish
 * underneath. The straight edge of the D runs along the tube and is sunk into the wall; the hood droops
 * toward the stream like a spray nozzle. `skip(s, centre)` drops a lid where the stream runs too close
 * (06 arch climbs the wall). One instanced mesh (1 draw call).
 */
export function buildWallLids(
  path: TubePath,
  s0: number,
  s1: number,
  spacing: number,
  material: THREE.Material,
  opts: { angleDeg?: number; droopDeg?: number; size?: number; thickness?: number; stretch?: number; sink?: number; skip?: (s: number, centre: THREE.Vector3, size: number) => boolean } = {},
): THREE.InstancedMesh {
  const h = opts.thickness ?? 0.42;
  // bottom → top so the lathe normals face outward: recessed dish underneath with an inner lip,
  // rounded foot, tall rim band, shoulder, domed top
  const prof: [number, number][] = [
    [0, 0.09], [0.74, 0.07], [0.82, 0.0], [0.9, -0.03], [0.97, -0.01], [1, 0.05], [1, h * 0.78], [0.95, h * 0.97], [0.82, h * 1.04], [0, h * 1.08],
  ];
  // half revolution (phi 0..π → local +X): the open cut face lies in the wall plane x = 0
  const geo = new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), 28, 0, Math.PI);
  geo.translate(0, -h * 0.5, 0);
  const n = (Math.floor((s1 - s0) / spacing) + 1) * 2;
  const mesh = new THREE.InstancedMesh(geo, material, n);
  const size = opts.size ?? 1.6;
  const ang = THREE.MathUtils.degToRad(opts.angleDeg ?? 18);
  const tilt = ang + THREE.MathUtils.degToRad(opts.droopDeg ?? 20);
  const c = new THREE.Vector3(), dir = new THREE.Vector3(), X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3();
  const basis = new THREE.Matrix4(), m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3();
  let k = 0;
  for (let s = s0; s <= s1 + 1e-6; s += spacing) {
    for (const side of [1, -1]) {
      const f = path.frame(s);
      const r = path.radius(s);
      tubeCenterAt(path, s, c);
      dir.copy(f.right).multiplyScalar(Math.cos(ang) * side).addScaledVector(f.up, Math.sin(ang)).normalize();
      const sz = size * Math.min(1.4, r / 7.6);
      // in the cross-section: +X points inward (radially, then drooped toward the stream), +Y is the
      // hood's top normal, +Z runs along the tube (the D's straight edge)
      X.copy(f.right).multiplyScalar(-Math.cos(tilt) * side).addScaledVector(f.up, -Math.sin(tilt)).normalize();
      Y.copy(f.right).multiplyScalar(-Math.sin(tilt) * side).addScaledVector(f.up, Math.cos(tilt)).normalize();
      Z.crossVectors(X, Y).normalize();
      basis.makeBasis(X, Y, Z);
      q.setFromRotationMatrix(basis);
      p.copy(c).addScaledVector(dir, r - sz * (opts.sink ?? 0.12));
      if (opts.skip?.(s, p.clone().addScaledVector(X, sz * 0.5), sz)) continue;
      m.compose(p, q, new THREE.Vector3(sz, sz, sz * (opts.stretch ?? 1.25)));
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
