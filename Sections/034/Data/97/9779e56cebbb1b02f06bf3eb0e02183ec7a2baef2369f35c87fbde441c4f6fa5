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
  /**
   * wave 8: lateral stretch of the cross-section (1 = circle): the `right` component of every wall point is
   * multiplied by oval(s) (ref 05 rings are ovals ≈1.75 wider than tall), normals follow the ellipse
   */
  oval?: (s: number) => number;
  /**
   * wave 9 (05 oval): flat bank floor — wall points lower than floor(s).y (height above the tube centre along
   * `up`) are lifted onto it, blended by floor(s).w (0 = untouched circle/ellipse, 1 = flat), so the wide oval
   * tube has a level bank between the river edge and the wall foot instead of a trench below the water line
   */
  floor?: (s: number) => { y: number; w: number };
}

/**
 * wave 9 (environment): the 05 tunnel's oval cross-section, shared with the far block (ForcedTunnel, path-camera)
 * so the seam stays continuous: lateral stretch K of the `right` component, and the level bank floor
 * `floorBelowWater` units under the water line (see TubeGeoOptions.floor).
 */
export const OVAL05 = { K: 1.7, floorBelowWater: 0.18 } as const;

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
    const ov = o.oval ? o.oval(s) : 1;
    const fl = o.floor ? o.floor(s) : null;
    c.copy(f.pos).addScaledVector(f.up, path.radius(s) - path.depth(s));
    for (let j = 0; j <= radial; j++) {
      const th = -Math.PI / 2 - arc / 2 + (j / radial) * arc; // centred on the bottom
      d.copy(f.right).multiplyScalar(Math.cos(th) * ov).addScaledVector(f.up, Math.sin(th));
      const k = i * (radial + 1) + j;
      if (ax && au) { f.tan.toArray(ax, k * 3); f.up.toArray(au, k * 3); }
      // flat bank floor (05 oval): lift the part below the water line onto a level floor
      const lift = fl && fl.w > 0 && Math.sin(th) * r < fl.y ? (fl.y - Math.sin(th) * r) * fl.w : 0;
      pos[k * 3] = c.x + d.x * r + f.up.x * lift;
      pos[k * 3 + 1] = c.y + d.y * r + f.up.y * lift;
      pos[k * 3 + 2] = c.z + d.z * r + f.up.z * lift;
      if (ov !== 1) d.copy(f.right).multiplyScalar(Math.cos(th) / ov).addScaledVector(f.up, Math.sin(th)).normalize();
      if (lift > 0) d.lerp(f.up.clone().negate(), fl!.w).normalize();
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

/**
 * Ref 05 ring (wave 4): a ROUNDED gold band with a double contour — a thick half-round main band (the
 * camera-facing body catches a bright highlight on its crown and falls to copper in its shadowed lower
 * half) and, on the camera side (−z), a thin half-round lip separated by a narrow dark groove. Radial
 * values are fractions of the ring radius (1 = wall), axial values world units. Lathe around local Z,
 * traversed +z → −z so the faces point inward.
 */
export function roundBandGeometry(height = 0.095, width = 0.78, lipHeight = 0.045, lipWidth = 0.26, groove = 0.07, segments = 96): THREE.BufferGeometry {
  const w = (width + groove + lipWidth) / 2;
  const yc = w - width / 2, a = width / 2;
  const yl = -w + lipWidth / 2, al = lipWidth / 2;
  const pts: THREE.Vector2[] = [];
  const dup = (x: number, y: number) => { pts.push(new THREE.Vector2(x, y), new THREE.Vector2(x, y)); };
  pts.push(new THREE.Vector2(1.03, w));
  dup(1.0, w);
  for (let i = 1; i < 12; i++) {
    const f = (i / 12) * Math.PI;
    pts.push(new THREE.Vector2(1 - height * Math.sin(f), yc + a * Math.cos(f)));
  }
  dup(1.0, yc - a);
  pts.push(new THREE.Vector2(1.0 - height * 0.04, yc - a - groove * 0.5));
  dup(1.0, yl + al);
  for (let i = 1; i < 7; i++) {
    const f = (i / 7) * Math.PI;
    pts.push(new THREE.Vector2(1 - lipHeight * Math.sin(f), yl + al * Math.cos(f)));
  }
  dup(1.0, -w);
  pts.push(new THREE.Vector2(1.03, -w));
  const g = new THREE.LatheGeometry(pts, segments);
  g.rotateX(Math.PI / 2); // lathe axis Y → tube axis Z
  return g;
}

export type BandOpts = { height?: number; width?: number; lipHeight?: number; lipWidth?: number; groove?: number; segments?: number };

export type RingOpts = {
  tube?: number; double?: boolean; inset?: number; extra?: number; collar?: { depth?: number; lip?: number; width?: number; segments?: number }; band?: BandOpts;
  /** wave 8: lateral stretch (see TubeGeoOptions.oval) — the ring's local x (= ∓right) is scaled by oval(s) */
  oval?: (s: number) => number;
};

export function bandGeometry(b: BandOpts): THREE.BufferGeometry {
  return roundBandGeometry(b.height, b.width, b.lipHeight, b.lipWidth, b.groove, b.segments);
}

/** Instanced thick gold ring ribs placed perpendicular to the tube every `spacing` units. */
export function buildRings(
  path: TubePath,
  s0: number,
  s1: number,
  spacing: number,
  material: THREE.Material,
  opts: RingOpts = {},
): THREE.InstancedMesh {
  const list: number[] = [];
  for (let s = s0; s <= s1 + 1e-6; s += spacing) list.push(s);
  return buildRingsAt(path, list, material, opts, spacing);
}

/** Same rings at an explicit list of path positions (e.g. one evenly spaced set per tunnel section). */
export function buildRingsAt(path: TubePath, list: number[], material: THREE.Material, opts: RingOpts = {}, spacing = 9): THREE.InstancedMesh {
  const tube = opts.tube ?? 0.075;
  const collar = opts.band ?? opts.collar;
  const geo = opts.band ? bandGeometry(opts.band) : opts.collar ? collarGeometry(opts.collar.depth, opts.collar.lip, opts.collar.width, opts.collar.segments) : new THREE.TorusGeometry(1, tube, 14, 72);
  const n = Math.max(1, list.length) * (opts.double ? 2 : 1);
  const mesh = new THREE.InstancedMesh(geo, material, n);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const basis = new THREE.Matrix4();
  const c = new THREE.Vector3();
  let k = 0;
  for (const s of list) {
    for (let dbl = 0; dbl < (opts.double ? 2 : 1); dbl++) {
      const ss = s + dbl * spacing * 0.16;
      const f = path.frame(ss);
      const r = path.radius(ss) - (opts.inset ?? 0.05) + (opts.extra ?? 0);
      c.copy(f.pos).addScaledVector(f.up, path.radius(ss) - path.depth(ss));
      // (right, up, tan) is left-handed (right = tan × up), so the quaternion below is not the intended
      // frame: band rings (05 only) use the right-handed (−right, up, tan) so their lip really sits on the
      // camera side (−z); collar/torus rings (04/06/07) keep the legacy orientation unchanged
      if (opts.band) basis.makeBasis(f.right.clone().negate(), f.up, f.tan);
      else basis.makeBasis(f.right, f.up, f.tan);
      q.setFromRotationMatrix(basis);
      const sc = dbl ? r * 0.985 : r;
      // a collar keeps its axial width in world units; a torus scales uniformly
      m.compose(c, q, new THREE.Vector3(sc * (opts.oval ? opts.oval(ss) : 1), sc, collar ? 1 : sc * (dbl ? 0.6 : 1)));
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
  opts: {
    angleDeg?: number; droopDeg?: number; size?: number; thickness?: number; stretch?: number; sink?: number;
    skip?: (s: number, centre: THREE.Vector3, size: number) => boolean;
    /** explicit lid positions along the path (default: s0, s0 + spacing, … s1) */
    positions?: number[];
    /**
     * 'hood' (legacy 06/07 D-hood), 'dome' (half puck with a domed cap) or 'slab' (ref 05 wave 4: a flat
     * copper-gold half-disc lid standing out of the wall — flat underside, rounded edges, a straight
     * polished rim band and a flat top, like the ref's wall-mounted nozzle lids)
     */
    shape?: 'hood' | 'dome' | 'slab';
    /** wave 8: lateral stretch of the wall the lids sit on (see TubeGeoOptions.oval) */
    oval?: (s: number) => number;
  } = {},
): THREE.InstancedMesh {
  const geo = wallLidGeometry(opts.shape ?? 'hood', opts.thickness ?? 0.42);
  const list: number[] = opts.positions ?? [];
  if (!opts.positions) for (let s = s0; s <= s1 + 1e-6; s += spacing) list.push(s);
  const n = Math.max(1, list.length) * 2;
  const mesh = new THREE.InstancedMesh(geo, material, n);
  const size = opts.size ?? 1.6;
  const ang = THREE.MathUtils.degToRad(opts.angleDeg ?? 18);
  const tilt = ang + THREE.MathUtils.degToRad(opts.droopDeg ?? 20);
  const c = new THREE.Vector3(), dir = new THREE.Vector3(), X = new THREE.Vector3(), Y = new THREE.Vector3(), Z = new THREE.Vector3();
  const basis = new THREE.Matrix4(), m = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3();
  let k = 0;
  for (const s of list) {
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
      if (opts.oval) p.addScaledVector(f.right, (opts.oval(s) - 1) * r * Math.cos(ang) * side);
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

/** Profile of a wall lid (lathe, half revolution toward local +X), centred on its thickness. */
export function wallLidGeometry(shape: 'hood' | 'dome' | 'slab', h: number, segments?: number): THREE.BufferGeometry {
  // bottom → top so the lathe normals face outward
  const prof: [number, number][] = shape === 'dome'
    ? [
      [0, 0.06], [0.62, 0.05], [0.7, 0.0], [0.86, -0.04], [1.04, -0.05], [1.08, 0.0], [1.0, 0.06],
      [0.98, h * 0.55], [0.96, h * 0.82], [0.88, h * 1.02], [0.72, h * 1.18], [0.48, h * 1.3], [0.24, h * 1.36], [0, h * 1.38],
    ]
    : shape === 'slab'
      ? [
        // flat underside with a shallow recess and an inner ring, rounded lower edge, straight rim band,
        // rounded upper edge, flat (very slightly crowned) top
        // (edge rounding scales with the thickness so thin pucks stay valid)
        // wave 8: ROUNDED puck — the rim band bulges (barrel, radius 0.95 → 1.04 → 0.95) between two rounded
        // edges, so its smooth normal sweeps up/down across the band and the shading reads a glossy convex
        // copper-gold rim with a highlight low on the bulge (ref L1 at x 140: peach top edge → orange-gold → pale
        // yellow → white → orange-red bottom edge) instead of a flat plank; flat recessed underside; domed top
        [0, 0.1 * h], [0.56, 0.1 * h], [0.62, 0.03 * h], [0.88, 0.0], [0.94, 0.035 * h], [0.975, 0.12 * h],
        [1.015, 0.3 * h], [1.04, 0.5 * h], [1.015, 0.7 * h], [0.975, 0.86 * h], [0.93, 0.95 * h], [0.86, h],
        [0.55, h * 1.07], [0, h * 1.1],
      ]
      : [
        [0, 0.09], [0.74, 0.07], [0.82, 0.0], [0.9, -0.03], [0.97, -0.01], [1, 0.05], [1, h * 0.78], [0.95, h * 0.97], [0.82, h * 1.04], [0, h * 1.08],
      ];
  // half revolution (phi 0..π → local +X): the open cut face lies in the wall plane x = 0
  const geo = new THREE.LatheGeometry(prof.map(([x, y]) => new THREE.Vector2(x, y)), segments ?? (shape === 'hood' ? 28 : 24), 0, Math.PI);
  geo.translate(0, -h * 0.5, 0);
  return geo;
}

/** Orientation of a wall lid in a tube cross-section (see buildWallLids): radial direction to the wall
 *  point, inward X (drooped), top normal Y, Z along the tube. */
export function wallLidBasis(f: Frame, side: number, angDeg: number, droopDeg: number) {
  const ang = THREE.MathUtils.degToRad(angDeg);
  const tilt = ang + THREE.MathUtils.degToRad(droopDeg);
  const dir = f.right.clone().multiplyScalar(Math.cos(ang) * side).addScaledVector(f.up, Math.sin(ang)).normalize();
  const X = f.right.clone().multiplyScalar(-Math.cos(tilt) * side).addScaledVector(f.up, -Math.sin(tilt)).normalize();
  const Y = f.right.clone().multiplyScalar(-Math.sin(tilt) * side).addScaledVector(f.up, Math.cos(tilt)).normalize();
  const Z = new THREE.Vector3().crossVectors(X, Y).normalize();
  return { dir, X, Y, Z };
}

/**
 * Forced-perspective far section of the straight 05 tunnel (ref 05: ≈10 concentric rings converging on
 * one small hot spot — far more tunnel than the 72-unit straight holds before the 06 hall). A short real
 * funnel, calibrated for the locked 05 checkpoint camera `eye`, reproduces what a straight tunnel of the
 * same radius running on for `zEnd` more units would look like from there: a virtual depth Z maps to the
 * real depth z = Z / (1 + Z/L) and every cross-section is scaled by k(Z) = (D0 + z)/(D0 + Z) about the
 * eye's line of sight, so walls, slots, rings and lids project where the long tunnel would put them.
 * Normals stay those of the straight cylinder, so it shades like the real tube. A `fgExtra` attribute
 * (Z − z) lets the distance glow use the virtual depth. Morph target 0 ("open") moves every vertex just
 * outside the real tube wall at the same depth: the section opens like an iris as the rider arrives.
 */
export class ForcedTunnel {
  readonly c0: THREE.Vector3;
  readonly T: THREE.Vector3;
  readonly U: THREE.Vector3;
  readonly Rt: THREE.Vector3;
  readonly R: number;
  readonly D0: number;
  /** eye offset from the section's centre line, in the cross-section plane */
  readonly q: THREE.Vector3;
  /**
   * `knots` ([u, Z] pairs, increasing, starting at [0, 0]): the virtual tunnel coordinate u (continues
   * the real s, so slot rows / ring bays repeat every bay in u) → virtual depth Z, piecewise linear. Ref 05
   * draws the far bays longer than the near ones (ring radii 288,192,122,85,66,54,45 px): one ring per
   * knot reproduces that while every bay keeps its slot rows and lid pair. Without knots Z = u.
   */
  constructor(readonly path: TubePath, readonly sF: number, eye: THREE.Vector3, readonly L: number, readonly zEnd: number, readonly knots: [number, number][] = [], axis?: THREE.Vector3) {
    const f = path.frame(sF);
    this.c0 = tubeCenterAt(path, sF);
    // `axis`: direction of the straight run the camera looks down (the path's tangent at sF may already
    // be easing toward the next stage's axis, which would put the far vanishing point off the real one)
    this.T = (axis ?? f.tan).clone().normalize();
    this.U = f.up.clone().addScaledVector(this.T, -f.up.dot(this.T)).normalize();
    this.Rt = new THREE.Vector3().crossVectors(this.T, this.U).normalize();
    this.R = path.radius(sF);
    const rel = this.c0.clone().sub(eye);
    this.D0 = rel.dot(this.T);
    this.q = rel.negate().addScaledVector(this.T, this.D0); // eye − c0 minus its axial part
  }
  private interp(x: number, a: 0 | 1) {
    const k = this.knots, b = (1 - a) as 0 | 1;
    if (k.length < 2) return x;
    for (let i = 1; i < k.length; i++) {
      if (x <= k[i][a] || i === k.length - 1) {
        const t = (x - k[i - 1][a]) / (k[i][a] - k[i - 1][a]);
        return k[i - 1][b] + t * (k[i][b] - k[i - 1][b]);
      }
    }
    return x;
  }
  /** virtual depth Z of tunnel coordinate u (see `knots`) */
  zOfU(u: number) { return this.interp(u, 0); }
  /** tunnel coordinate u of virtual depth Z */
  uOfZ(Z: number) { return this.interp(Z, 1); }
  /** 0 = forced perspective (closed), 1 = folded away outside the real tube: the rider camera within
   *  `near`…`far` units (along the axis) of the section start opens it, so the ride into 06 is untouched */
  openFor(cam: THREE.Vector3, near = 18, far = 34) {
    const d = this.c0.clone().sub(cam).dot(this.T);
    return 1 - THREE.MathUtils.smoothstep(d, near, far);
  }
  zOf(Z: number) { return Z / (1 + Z / this.L); }
  kOf(Z: number) { return (this.D0 + this.zOf(Z)) / (this.D0 + Z); }
  /** dz/dZ: axial compression of small objects at virtual depth Z */
  cOf(Z: number) { const a = 1 + Z / this.L; return 1 / (a * a); }
  /** real position of the virtual point (depth Z, cross-section offset o from the tube centre line) */
  point(Z: number, o: THREE.Vector3, out = new THREE.Vector3()) {
    const k = this.kOf(Z);
    return out.copy(this.c0).addScaledVector(this.T, this.zOf(Z)).add(this.q).addScaledVector(o.clone().sub(this.q), k);
  }
  /** virtual depth Z at which the projected radius equals `frac` of the section start's */
  zForScreen(frac: number) { return this.D0 / frac - this.D0; }
  /**
   * Instance matrix for an object placed in the virtual straight tunnel (depth Z, offset o, rotation
   * basis X/Y/Z, scale s), blended toward its `open` placement (`openPos`, `openScale` multiplier).
   */
  matrix(Z: number, o: THREE.Vector3, basis: THREE.Matrix4, s: THREE.Vector3, open: number, openPos: THREE.Vector3, openScale: number, out = new THREE.Matrix4()) {
    const k = THREE.MathUtils.lerp(this.kOf(Z), openScale, open);
    const c = THREE.MathUtils.lerp(this.cOf(Z), 1, open);
    const p = this.point(Z, o).lerp(openPos, open);
    // A = k·I + (c − k)·T Tᵀ : in-plane scale k, axial scale c
    const T = this.T;
    const A = new THREE.Matrix4().set(
      k + (c - k) * T.x * T.x, (c - k) * T.x * T.y, (c - k) * T.x * T.z, 0,
      (c - k) * T.y * T.x, k + (c - k) * T.y * T.y, (c - k) * T.y * T.z, 0,
      (c - k) * T.z * T.x, (c - k) * T.z * T.y, k + (c - k) * T.z * T.z, 0,
      0, 0, 0, 1,
    );
    return out.copy(A).multiply(basis).multiply(new THREE.Matrix4().makeScale(s.x, s.y, s.z)).setPosition(p);
  }
  /** wall geometry: uv.y = sF + Z (virtual s, so slot rows continue), radial normals, morph target "open" */
  geometry(radial = 72, steps = 72, inset = 0.004): THREE.BufferGeometry {
    const rows = steps + 1;
    const n = rows * (radial + 1);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
    const ax = new Float32Array(n * 3), au = new Float32Array(n * 3), ext = new Float32Array(n), opn = new Float32Array(n * 3);
    const d = new THREE.Vector3(), o = new THREE.Vector3(), p = new THREE.Vector3(), cr = new THREE.Vector3();
    const r0 = this.R * (1 - inset);
    for (let i = 0; i < rows; i++) {
      // uniform in projected radius (1/D): dense near the vanishing point where the rings crowd
      const t = i / steps;
      const Dv = 1 / (1 / this.D0 - t * (1 / this.D0 - 1 / (this.D0 + this.zEnd)));
      const Z = Math.max(0, Dv - this.D0);
      const z = this.zOf(Z);
      const sReal = this.sF + z;
      const fr = this.path.frame(sReal);
      tubeCenterAt(this.path, sReal, cr);
      const rOpen = this.path.radius(sReal) * 1.1 + 0.4;
      for (let j = 0; j <= radial; j++) {
        const th = -1.5 * Math.PI + (j / radial) * Math.PI * 2;
        d.copy(this.Rt).multiplyScalar(Math.cos(th)).addScaledVector(this.U, Math.sin(th));
        o.copy(d).multiplyScalar(r0);
        this.point(Z, o, p);
        const k = i * (radial + 1) + j;
        p.toArray(pos, k * 3);
        d.toArray(nor, k * 3);
        uv[k * 2] = j / radial; uv[k * 2 + 1] = this.sF + this.uOfZ(Z);
        this.T.toArray(ax, k * 3); this.U.toArray(au, k * 3);
        ext[k] = Z - z;
        // open: just outside the real (flaring) tube wall at the same depth
        o.copy(fr.right).multiplyScalar(Math.cos(th)).addScaledVector(fr.up, Math.sin(th)).multiplyScalar(rOpen).add(cr);
        o.toArray(opn, k * 3);
      }
    }
    const idx: number[] = [];
    for (let i = 0; i < rows - 1; i++) {
      for (let j = 0; j < radial; j++) {
        const a = i * (radial + 1) + j, b = a + radial + 1;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setAttribute('tubeAxis', new THREE.BufferAttribute(ax, 3));
    g.setAttribute('tubeUp', new THREE.BufferAttribute(au, 3));
    g.setAttribute('fgExtra', new THREE.BufferAttribute(ext, 1));
    g.morphAttributes.position = [new THREE.BufferAttribute(opn, 3)];
    g.setIndex(idx);
    g.computeBoundingSphere();
    return g;
  }

  /**
   * The virtual tunnel's water surface: a flat chord across the section at `level` (relative to the tube
   * centre, along U) — uv.x 0..1 across, uv.y = sF + u. Because the section is a depth compression along
   * eye rays, this chord sits exactly on the real stream at the section start and rises above it further
   * in, so it takes over from the real water ribbon without a seam. Morph "open": dropped below the
   * real tube bottom.
   */
  chordGeometry(level: number, cols = 12, steps = 64, widthFrac = 1): THREE.BufferGeometry {
    const rows = steps + 1;
    const n = rows * (cols + 1);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2);
    const ext = new Float32Array(n), opn = new Float32Array(n * 3);
    const o = new THREE.Vector3(), p = new THREE.Vector3(), cr = new THREE.Vector3();
    const w = Math.sqrt(Math.max(0, this.R * this.R - level * level)) * 0.995 * widthFrac;
    for (let i = 0; i < rows; i++) {
      const t = i / steps;
      const Dv = 1 / (1 / this.D0 - t * (1 / this.D0 - 1 / (this.D0 + this.zEnd)));
      const Z = Math.max(0, Dv - this.D0);
      const z = this.zOf(Z);
      const sReal = this.sF + z;
      const fr = this.path.frame(sReal);
      tubeCenterAt(this.path, sReal, cr);
      const rr = this.path.radius(sReal);
      for (let j = 0; j <= cols; j++) {
        const x = (j / cols * 2 - 1) * w;
        o.copy(this.Rt).multiplyScalar(x).addScaledVector(this.U, level);
        this.point(Z, o, p);
        const k = i * (cols + 1) + j;
        p.toArray(pos, k * 3);
        this.U.toArray(nor, k * 3);
        uv[k * 2] = j / cols; uv[k * 2 + 1] = this.sF + this.uOfZ(Z);
        ext[k] = Z - z;
        o.copy(cr).addScaledVector(fr.right, x * (rr / this.R)).addScaledVector(fr.up, -rr - 0.6);
        o.toArray(opn, k * 3);
      }
    }
    const idx: number[] = [];
    for (let i = 0; i < rows - 1; i++) {
      for (let j = 0; j < cols; j++) {
        const a = i * (cols + 1) + j, b = a + cols + 1;
        idx.push(a, a + 1, b, b, a + 1, b + 1);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setAttribute('fgExtra', new THREE.BufferAttribute(ext, 1));
    g.morphAttributes.position = [new THREE.BufferAttribute(opn, 3)];
    g.setIndex(idx);
    g.computeBoundingSphere();
    return g;
  }

  /**
   * Lay instanced objects (rings, lids) into the virtual tunnel: item at tunnel coordinate `u`, offset `o`
   * from the centre line, rotation `basis` (local Z must run along the tube), scale `s`; when open they move
   * to `openPos` with in-plane scale `openScale`. Writes the instance matrices and the per-instance
   * `fgExtra` (virtual − real depth) the FG_VIRTUAL glow reads.
   */
  placeInstances(mesh: THREE.InstancedMesh, items: { u: number; o: THREE.Vector3; basis: THREE.Matrix4; s: THREE.Vector3; openPos: THREE.Vector3; openScale: number }[], open: number) {
    const m = new THREE.Matrix4();
    let ext = mesh.geometry.getAttribute('fgExtra') as THREE.InstancedBufferAttribute | undefined;
    if (!ext || ext.count < items.length) {
      ext = new THREE.InstancedBufferAttribute(new Float32Array(Math.max(1, items.length)), 1);
      mesh.geometry.setAttribute('fgExtra', ext);
    }
    items.forEach((it, i) => {
      const Z = this.zOfU(it.u);
      this.matrix(Z, it.o, it.basis, it.s, open, it.openPos, it.openScale, m);
      mesh.setMatrixAt(i, m);
      ext!.setX(i, (Z - this.zOf(Z)) * (1 - open));
    });
    mesh.count = items.length;
    mesh.instanceMatrix.needsUpdate = true;
    ext.needsUpdate = true;
  }
}

/**
 * Ref 05 near gold frame (wave 7): the approved image is framed at the bottom by two thick gold ring segments
 * cut flat where they meet the stream (bottom corners) and the ∩ lip of a gold ring the stream pours over
 * (bottom arc). Built as one real 3D mesh in REFERENCE-PIXEL units of an 864×1536 portrait frame (origin at the
 * frame centre, +x right, +y up, +z toward the viewer); environment.ts places it in camera space and scales
 * it by the camera's FOV, so it keeps this framing on any portrait viewport. Each band is a rounded strip
 * (half-round bulge toward the viewer). uv = (along the arc, across the band 0 = edge toward the stream);
 * `framePiece` 0 = corner (uv.x = 1 at the cut), 1 = bottom lip. Measured reference edges: corner inner edge
 * (0,1210) · (65,1300) · (135,1400) · cut ≈ (150,1420); right mirrored; lip top edge ≈ y 1466 at x 432.
 */
export function nearFrameGeometry(): THREE.BufferGeometry {
  const pos: number[] = [], uv: number[] = [], piece: number[] = [], idx: number[] = [];
  const strip = (id: number, cx: number, cy: number, a0: number, b0: number, w: number, dir: 1 | -1, th0: number, th1: number, z0: number, nu: number, nv = 10) => {
    const base = pos.length / 3;
    for (let i = 0; i <= nu; i++) {
      const th = THREE.MathUtils.degToRad(th0 + ((th1 - th0) * i) / nu);
      for (let j = 0; j <= nv; j++) {
        const t = j / nv;
        const a = a0 + dir * t * w, b = b0 + dir * t * w;
        const xs = cx + a * Math.cos(th), ys = cy - b * Math.sin(th); // screen px (y down)
        pos.push(xs - 432, 768 - ys, z0 + w * 0.22 * Math.sin(Math.PI * t));
        uv.push(i / nu, t);
        piece.push(id);
      }
    }
    for (let i = 0; i < nu; i++) {
      for (let j = 0; j < nv; j++) {
        const p = base + i * (nv + 1) + j, q = p + nv + 1;
        idx.push(p, q, p + 1, q, q + 1, p + 1);
      }
    }
  };
  // corners: inner circle centre (432, 1060), r 457 (through the reference edge (0,1210) and the cut (150,1420)),
  // band 190 px outward; uv.x = 1 at the cut (θ −122° / −58°)
  strip(0, 432, 1060, 457, 457, 190, 1, -163, -122, 40, 36);
  strip(0, 432, 1060, 457, 457, 190, 1, -17, -58, 40, 36);
  // bottom lip: circle centre (432, 2121), top edge radius 655, band 130 px inward (downward)
  strip(1, 432, 2121, 655, 655, 130, -1, 122, 58, 0, 48);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('framePiece', new THREE.Float32BufferAttribute(piece, 1));
  g.setIndex(idx);
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
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
