/**
 * Benny — the ONE canonical mascot model + joint rig (procedural, exported to assets/models/benny.glb).
 *
 * Contract: origin = centre of the round body, faces +Z, up +Y. Skin sphere r = 0.70, fur adds ~0.14
 * (visual body radius ≈ 0.84). Total height incl. beanie + pom-pom ≈ 2.5 units.
 * Joints: benny_root › body › { hat › pom, eyes › eyeL/eyeR, mouth, armL, armR, footL, footR }.
 * Meshes named fur_* receive the runtime shell-fur shader (see fur.ts); their userData carries the
 * fur parameters (exported as glTF extras).
 */
import * as THREE from 'three';
import type { BuiltModel } from '../types';
import {
  BENNY_COLORS as C,
  blushTexture,
  eyeTexture,
  knitCrownTextures,
  mouthTexture,
  ribbedBrimTextures,
  soleTexture,
} from './textures';

export const BENNY_DIMS = {
  skin: 0.7,
  fur: 0.115,
  radius: 0.8,
  hatTilt: -0.26, // front of the beanie raised (rad, about X)
  brimBottom: 0.08, // hat-local
};

const FACE_DIR = new THREE.Vector3(0, 0.05, 1).normalize();

function named<T extends THREE.Object3D>(o: T, name: string): T {
  o.name = name;
  return o;
}

function joint(name: string, x = 0, y = 0, z = 0): THREE.Object3D {
  const j = new THREE.Object3D();
  j.name = name;
  j.position.set(x, y, z);
  return j;
}

/** hemisphere dome facing +Z with planar UVs (u,v = x,y mapped to 0..1) */
function domeGeometry(r: number, wSeg = 32, hSeg = 14): THREE.BufferGeometry {
  const g = new THREE.SphereGeometry(r, wSeg, hSeg, 0, Math.PI * 2, 0, Math.PI / 2);
  g.rotateX(Math.PI / 2); // +Y pole → +Z
  const p = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / (2 * r) + 0.5, p.getY(i) / (2 * r) + 0.5);
  return g;
}

/** a rectangular decal draped onto a sphere of radius `radius` around the origin, centred on `dir` */
function sphereDecal(dir: THREE.Vector3, w: number, h: number, radius: number, seg = 10): THREE.BufferGeometry {
  const g = new THREE.PlaneGeometry(w, h, seg, seg);
  const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir.clone().normalize());
  const p = g.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) {
    v.set(p.getX(i), p.getY(i), radius).applyQuaternion(q).setLength(radius);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  g.computeVertexNormals();
  return g;
}

function std(o: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial(o);
}

function furData(o: {
  length: number;
  density: number;
  shells: number;
  root: string;
  tip: string;
  bald?: [number, number, number, number]; // dir (mesh-local) + dot threshold → no fur beyond it
  short?: [number, number, number, number, number, number]; // dir + t0,t1 + min factor
  gravity?: number;
}) {
  return { fur: { gravity: 0.35, ...o } };
}

function lathe(points: [number, number][], segs: number, v0: number, v1: number): THREE.LatheGeometry {
  const g = new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segs);
  // re-map v to height so stripes are linear in height
  const p = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) uv.setY(i, (p.getY(i) - v0) / (v1 - v0));
  return g;
}

function starShape(outer: number, inner: number): THREE.Shape {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const r = i % 2 === 0 ? outer : inner;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

export function buildBenny(): BuiltModel {
  const D = BENNY_DIMS;
  const root = named(new THREE.Group(), 'benny_root');
  const body = joint('body');
  root.add(body);

  // ---------------- body (fur) ----------------
  const hatUp = new THREE.Vector3(0, 1, 0).applyAxisAngle(new THREE.Vector3(1, 0, 0), D.hatTilt);
  const bodyMat = std({ color: C.pinkSkin, roughness: 0.92, metalness: 0 });
  const bodyMesh = named(new THREE.Mesh(new THREE.SphereGeometry(D.skin, 48, 36), bodyMat), 'fur_body');
  bodyMesh.userData = furData({
    length: D.fur,
    density: 66,
    shells: 20,
    root: C.pinkRoot,
    tip: C.pinkTip,
    // bald under the beanie: dot(normal, hatUp) > brimBottom/skin (+ a little overlap)
    bald: [hatUp.x, hatUp.y, hatUp.z, (D.brimBottom + 0.035) / D.skin],
    short: [FACE_DIR.x, FACE_DIR.y, FACE_DIR.z, 0.74, 0.93, 0.28],
    gravity: 0.14,
  });
  body.add(bodyMesh);

  // ---------------- face ----------------
  const eyes = joint('eyes');
  body.add(eyes);
  const eyeR = 0.178;
  const eyeGeo = domeGeometry(eyeR, 32, 12);
  eyeGeo.scale(1, 1.06, 0.55);
  const eyeMatHappy = std({ map: eyeTexture('happy'), roughness: 0.12, metalness: 0 });
  const eyeMatDizzy = std({ map: eyeTexture('dizzy'), roughness: 0.12, metalness: 0 });
  const lashMat = std({ color: '#241036', roughness: 0.5 });
  for (const side of [1, -1] as const) {
    // side +1 = Benny's left (+X), −1 = right (−X)
    const dir = new THREE.Vector3(0.34 * side, -0.005, 0.94).normalize();
    const e = joint(side > 0 ? 'eyeL' : 'eyeR');
    e.position.copy(dir).multiplyScalar(0.665);
    e.lookAt(dir.clone().multiplyScalar(5));
    eyes.add(e);
    const happy = named(new THREE.Mesh(eyeGeo, eyeMatHappy), side > 0 ? 'eyeL_happy' : 'eyeR_happy');
    const dizzy = named(new THREE.Mesh(eyeGeo, eyeMatDizzy), side > 0 ? 'eyeL_dizzy' : 'eyeR_dizzy');
    dizzy.visible = false;
    e.add(happy, dizzy);
    // two little upper lashes on the outer corner
    for (const [a, len] of [[0.5, 0.075], [0.85, 0.065]] as const) {
      // eye-local: +X of the eye frame points to Benny's left when looking from the front
      const ang = side > 0 ? a : Math.PI - a;
      const lash = new THREE.Mesh(new THREE.ConeGeometry(0.014, len, 6), lashMat);
      lash.position.set(Math.cos(ang) * eyeR * 1.0, Math.sin(ang) * eyeR * 1.05, 0.045);
      lash.rotation.z = ang - Math.PI / 2;
      lash.translateY(len * 0.45);
      lash.name = `lash_${side > 0 ? 'L' : 'R'}_${a}`;
      e.add(lash);
    }
  }
  // blush
  const blushMat = std({ map: blushTexture(), transparent: true, depthWrite: false, roughness: 0.8 });
  for (const side of [1, -1]) {
    const m = named(new THREE.Mesh(sphereDecal(new THREE.Vector3(0.6 * side, -0.24, 0.78), 0.3, 0.19, 0.775), blushMat), side > 0 ? 'blushL' : 'blushR');
    m.renderOrder = 2;
    body.add(m);
  }
  // nose
  const nose = named(new THREE.Mesh(new THREE.SphereGeometry(0.03, 12, 8), std({ color: '#7d2550', roughness: 0.35 })), 'nose');
  nose.position.copy(new THREE.Vector3(0, -0.13, 1).normalize().multiplyScalar(0.738));
  nose.scale.set(1.3, 0.9, 0.8);
  body.add(nose);
  // mouth decals (alpha-tested)
  const mouth = joint('mouth');
  body.add(mouth);
  const mouthDir = new THREE.Vector3(0, -0.34, 0.94);
  for (const kind of ['happy', 'dizzy', 'peek'] as const) {
    const w = kind === 'dizzy' ? 0.19 : 0.29;
    const m = named(
      new THREE.Mesh(
        sphereDecal(mouthDir, w, w, 0.752, 8),
        std({ map: mouthTexture(kind), alphaTest: 0.5, roughness: 0.4, side: THREE.DoubleSide }),
      ),
      `mouth_${kind}`,
    );
    m.visible = kind === 'happy';
    mouth.add(m);
  }

  // ---------------- arms ----------------
  const armMat = std({ color: C.pinkSkin, roughness: 0.92 });
  const palmTex = soleTexture('hand');
  for (const side of [1, -1] as const) {
    const a = joint(side > 0 ? 'armL' : 'armR', 0.58 * side, -0.2, 0.08);
    body.add(a);
    const phi = 1.0 * side;
    const dir = new THREE.Vector3(Math.sin(phi), -Math.cos(phi), 0);
    const g = new THREE.SphereGeometry(0.13, 20, 14);
    g.scale(1, 1.45, 1);
    const arm = named(new THREE.Mesh(g, armMat), side > 0 ? 'fur_armL' : 'fur_armR');
    arm.position.copy(dir).multiplyScalar(0.16);
    arm.rotation.z = phi;
    arm.userData = furData({ length: 0.07, density: 90, shells: 12, root: C.pinkRoot, tip: C.pinkTip, gravity: 0.2 });
    a.add(arm);
    const palm = named(
      new THREE.Mesh(new THREE.CircleGeometry(0.07, 24), std({ map: palmTex, roughness: 0.6 })),
      side > 0 ? 'palmL' : 'palmR',
    );
    palm.position.copy(dir).multiplyScalar(0.25).add(new THREE.Vector3(0, -0.01, 0.105));
    palm.rotation.x = -0.25;
    a.add(palm);
  }

  // ---------------- feet ----------------
  const footTex = soleTexture('foot');
  for (const side of [1, -1] as const) {
    const f = joint(side > 0 ? 'footL' : 'footR', 0.3 * side, -0.6, 0.26);
    body.add(f);
    const g = new THREE.SphereGeometry(0.2, 22, 16);
    g.scale(1, 0.82, 1.12);
    const foot = named(new THREE.Mesh(g, armMat), side > 0 ? 'fur_footL' : 'fur_footR');
    foot.position.set(0, -0.03, 0.06);
    foot.userData = furData({
      length: 0.06, density: 70, shells: 8, root: C.pinkRoot, tip: C.pinkTip, gravity: 0.1,
      bald: [0, -0.55, 0.83, 0.55],
    });
    f.add(foot);
    const sole = named(new THREE.Mesh(new THREE.CircleGeometry(0.165, 28), std({ map: footTex, roughness: 0.55 })), side > 0 ? 'soleL' : 'soleR');
    sole.scale.set(1, 1.08, 1);
    sole.position.set(0, -0.085, 0.235);
    // faces forward and a little down (lookAt in foot-local space: sole has no parent yet)
    sole.lookAt(sole.position.clone().add(new THREE.Vector3(0, -0.55, 0.83)));
    f.add(sole);
  }

  // ---------------- knitted beanie ----------------
  const hat = joint('hat');
  hat.rotation.x = D.hatTilt;
  body.add(hat);
  const yb = D.brimBottom;
  const brimTex = ribbedBrimTextures();
  const brimMat = std({ map: brimTex.map, normalMap: brimTex.normalMap, normalScale: new THREE.Vector2(0.9, 0.9), roughness: 0.88 });
  const brim = named(
    new THREE.Mesh(
      lathe(
        [
          [0.69, yb + 0.01],
          [0.735, yb - 0.005],
          [0.765, yb + 0.03],
          [0.778, yb + 0.1],
          [0.778, yb + 0.18],
          [0.765, yb + 0.235],
          [0.735, yb + 0.26],
          [0.69, yb + 0.265],
        ],
        72,
        yb - 0.01,
        yb + 0.27,
      ),
      brimMat,
    ),
    'hat_brim',
  );
  // the brim texture's "v" should run across the band (ribs vertical): lathe u = around ✓
  hat.add(brim);
  const crownTex = knitCrownTextures();
  const crownMat = std({ map: crownTex.map, normalMap: crownTex.normalMap, normalScale: new THREE.Vector2(0.8, 0.8), roughness: 0.9 });
  const crownY0 = yb + 0.24;
  const crownY1 = yb + 0.95;
  const crown = named(
    new THREE.Mesh(
      lathe(
        [
          [0.725, crownY0],
          [0.748, crownY0 + 0.06],
          [0.757, crownY0 + 0.14],
          [0.748, crownY0 + 0.23],
          [0.715, crownY0 + 0.32],
          [0.66, crownY0 + 0.41],
          [0.575, crownY0 + 0.48],
          [0.46, crownY0 + 0.535],
          [0.32, crownY0 + 0.565],
          [0.16, crownY0 + 0.578],
          [0.0, crownY0 + 0.582],
        ],
        72,
        crownY0,
        crownY0 + 0.582,
      ),
      crownMat,
    ),
    'hat_crown',
  );
  hat.add(crown);
  // gold star on Benny's RIGHT side (−X), slightly behind the side
  const starGeo = new THREE.ExtrudeGeometry(starShape(0.19, 0.085), {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 3,
  });
  starGeo.center();
  const star = named(
    new THREE.Mesh(starGeo, std({ color: C.gold, metalness: 0.55, roughness: 0.25, emissive: '#ffb000', emissiveIntensity: 0.38 })),
    'hat_star',
  );
  const sa = THREE.MathUtils.degToRad(132);
  const starPos = new THREE.Vector3(-Math.sin(sa) * 0.785, yb + 0.235, Math.cos(sa) * 0.785);
  star.position.copy(starPos);
  star.lookAt(starPos.clone().multiply(new THREE.Vector3(2, 1, 2)).add(new THREE.Vector3(0, 0.25, 0)));
  star.rotateZ(0.12);
  hat.add(star);
  // pom-pom
  const pom = joint('pom', 0, crownY0 + 0.582 + 0.17, -0.03);
  hat.add(pom);
  const pomMesh = named(new THREE.Mesh(new THREE.SphereGeometry(0.235, 32, 24), std({ color: C.pomRoot, roughness: 0.95 })), 'fur_pom');
  pomMesh.userData = furData({ length: 0.115, density: 80, shells: 16, root: C.pomRoot, tip: C.pomTip, gravity: 0.15 });
  pom.add(pomMesh);

  const animations = buildClips();
  return { scene: root, animations };
}

// ------------------------------------------------------------------ clips
type E3 = [number, number, number];
const q = (e: E3) => new THREE.Quaternion().setFromEuler(new THREE.Euler(e[0], e[1], e[2]));

function qTrack(node: string, times: number[], eulers: E3[]): THREE.QuaternionKeyframeTrack {
  const vals: number[] = [];
  eulers.forEach((e) => vals.push(...q(e).toArray()));
  return new THREE.QuaternionKeyframeTrack(`${node}.quaternion`, times, vals);
}
function vTrack(node: string, prop: 'position' | 'scale', times: number[], vecs: E3[]): THREE.VectorKeyframeTrack {
  return new THREE.VectorKeyframeTrack(`${node}.${prop}`, times, vecs.flat());
}
function loop(n: number, dur: number): number[] {
  return Array.from({ length: n + 1 }, (_, i) => (i / n) * dur);
}

const ARM_L: E3 = [0.58, -0.2, 0.08];
const ARM_R: E3 = [-0.58, -0.2, 0.08];
const FOOT_L: E3 = [0.3, -0.6, 0.26];
const FOOT_R: E3 = [-0.3, -0.6, 0.26];

function buildClips(): THREE.AnimationClip[] {
  const N = 12;
  const tau = Math.PI * 2;
  // idle
  const ti = loop(N, 2.4);
  const idle = new THREE.AnimationClip('idle', 2.4, [
    vTrack('body', 'position', ti, ti.map((t) => [0, Math.sin((t / 2.4) * tau) * 0.015, 0])),
    qTrack('armL', ti, ti.map((t) => [0, 0, Math.sin((t / 2.4) * tau) * 0.08])),
    qTrack('armR', ti, ti.map((t) => [0, 0, -Math.sin((t / 2.4) * tau) * 0.08])),
    qTrack('footL', ti, ti.map(() => [0, 0, 0])),
    qTrack('footR', ti, ti.map(() => [0, 0, 0])),
    qTrack('body', ti, ti.map(() => [0, 0, 0])),
  ]);
  // swim — paws paddle, feet kick, body bobs (0.6 s loop)
  const D = 0.6;
  const ts = loop(N, D);
  const ph = (t: number) => (t / D) * tau;
  const swim = new THREE.AnimationClip('swim', D, [
    vTrack('body', 'position', ts, ts.map((t) => [0, Math.abs(Math.sin(ph(t))) * 0.04 - 0.01, 0])),
    qTrack('body', ts, ts.map((t) => [Math.sin(ph(t) * 2) * 0.03, 0, Math.sin(ph(t)) * 0.05])),
    qTrack('armL', ts, ts.map((t) => [Math.sin(ph(t)) * 0.75, 0, 0.25 + Math.cos(ph(t)) * 0.2])),
    qTrack('armR', ts, ts.map((t) => [Math.sin(ph(t) + Math.PI) * 0.75, 0, -0.25 - Math.cos(ph(t) + Math.PI) * 0.2])),
    qTrack('footL', ts, ts.map((t) => [Math.sin(ph(t) + Math.PI) * 0.5, 0, 0])),
    qTrack('footR', ts, ts.map((t) => [Math.sin(ph(t)) * 0.5, 0, 0])),
  ]);
  // tumble — paws flail up, feet kick fast (caller spins the root)
  const T = 1.0;
  const tt = loop(N, T);
  const pt = (t: number) => (t / T) * tau;
  const tumble = new THREE.AnimationClip('tumble', T, [
    vTrack('body', 'position', tt, tt.map(() => [0, 0, 0])),
    qTrack('body', tt, tt.map((t) => [0, 0, Math.sin(pt(t)) * 0.1])),
    qTrack('armL', tt, tt.map((t) => [Math.sin(pt(t) * 2) * 0.4, 0, 1.25 + Math.sin(pt(t) * 3) * 0.3])),
    qTrack('armR', tt, tt.map((t) => [Math.cos(pt(t) * 2) * 0.4, 0, -1.25 - Math.cos(pt(t) * 3) * 0.3])),
    qTrack('footL', tt, tt.map((t) => [Math.sin(pt(t) * 3) * 0.6, 0, 0.2])),
    qTrack('footR', tt, tt.map((t) => [Math.sin(pt(t) * 3 + Math.PI) * 0.6, 0, -0.2])),
  ]);
  // peek — paws hold the towel edge, gentle sway (scene 01)
  const P = 2.0;
  const tp = loop(N, P);
  const pp = (t: number) => (t / P) * tau;
  const peek = new THREE.AnimationClip('peek', P, [
    vTrack('body', 'position', tp, tp.map((t) => [0, 0.03 + Math.sin(pp(t)) * 0.02, 0])),
    qTrack('body', tp, tp.map((t) => [0.04, 0, Math.sin(pp(t)) * 0.07])),
    qTrack('armL', tp, tp.map((t) => [-1.15 + Math.sin(pp(t) * 2) * 0.05, 0, 0.35])),
    qTrack('armR', tp, tp.map((t) => [-1.15 + Math.cos(pp(t) * 2) * 0.05, 0, -0.35])),
    qTrack('footL', tp, tp.map(() => [0, 0, 0])),
    qTrack('footR', tp, tp.map(() => [0, 0, 0])),
  ]);
  void ARM_L; void ARM_R; void FOOT_L; void FOOT_R;
  return [idle, swim, tumble, peek];
}
