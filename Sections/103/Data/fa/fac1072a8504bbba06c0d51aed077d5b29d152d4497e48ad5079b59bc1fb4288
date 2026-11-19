/**
 * Gold $ coins anchored to the course (s, lateral, height). Real pickups: distance test against
 * Benny each frame; collected coins pop + sparkle and the counter increments by COIN_VALUE.
 * Layout follows the coin trails visible in the references (03 spiral trail, 04 left edge,
 * 05/07 snaking centre line, 06 on the arch crest, 08–10 toward the towel).
 */
import * as THREE from 'three';
import type { Course, StageId } from '../world/course';
import { canvasTexture } from '../world/materials';
import { coreLateral } from '../vfx/waterRibbon';

export const COIN_VALUE = 10;

/** scale: coin size factor (1 = 1.0 u diameter); tilt: radians the coin leans back (top away from the camera) */
export interface CoinDef { s: number; lat: number; h: number; stage: StageId; scale?: number; tilt?: number }

/**
 * 05 (ref 05, measured): ≈10 coins on the electric-cyan core winding to the VP. The nearest one is
 * ≈95 px wide just above Benny's pom (474, 726), then 64 → 55 → 42 → 28 → 19 px: the spacing in depth
 * grows with distance, so the gaps here grow too (C05.gap0 + k·C05.gapGrow). Coins lean back by C05.tilt
 * so their face reads as a slightly flattened disc with the rim visible underneath, as in the ref.
 * Before the 05 checkpoint the trail keeps a plain C05.gap0 spacing (gameplay only, never in frame).
 */
export const C05 = { first: 5.7, gap0: 3.6, gapGrow: 1.0, gapMax: 9, scale: 0.9, h: 0.75, tilt: 0.55 };

function coins05(course: Course, add: (stage: StageId, s: number, lat: number, h?: number, extra?: Partial<CoinDef>) => void) {
  const a = course.stage('05');
  const sCp = course.marks['05_crest'];
  const extra = { scale: C05.scale, tilt: C05.tilt };
  const ss: number[] = [];
  for (let s = sCp + C05.first - C05.gap0; s > a.s0 + 6; s -= C05.gap0) ss.unshift(s);
  for (let k = 0, s = sCp + C05.first; s < a.s1 - 3; k++) { ss.push(s); s += Math.min(C05.gapMax, C05.gap0 + k * C05.gapGrow); }
  for (const s of ss) add('05', s, coreLateral(course, s), C05.h, extra);
}

export function coinLayout(course: Course): CoinDef[] {
  const out: CoinDef[] = [];
  const add = (stage: StageId, s: number, lat: number, h = 0.9, extra: Partial<CoinDef> = {}) => out.push({ s, lat, h, stage, ...extra });
  const st = (id: StageId) => course.stage(id);
  // 03 — spiral trail ahead of Benny toward the drain
  { const a = st('03'); for (let i = 0; i < 9; i++) add('03', a.s0 + 6 + i * 2.7, 0.9 - i * 0.12); }
  // 04 — along the left edge of the slide
  { const a = st('04'); for (let i = 0; i < 8; i++) add('04', a.s0 + 9 + i * 3.6, -1.35); }
  // 05 — on the winding cyan core (see C05)
  coins05(course, add);
  // 06 — up and over the crest (left of centre like the ref)
  { const a = st('06'); const n = 18; for (let i = 0; i < n; i++) { const s = a.s0 + 4 + i * ((a.s1 - a.s0 - 6) / n); add('06', s, -1.3 + 0.7 * Math.sin(i * 0.4)); } }
  // 07 — winding trail, continuing down the plunge
  { const a = st('07'); const n = 24; for (let i = 0; i < n; i++) { const s = a.s0 + 6 + i * ((a.s1 - a.s0 - 10) / n); add('07', s, 1.0 * Math.sin(i * 0.5 + 1)); } }
  // 08 — S toward the platform
  { const a = st('08'); for (let i = 0; i < 8; i++) add('08', a.s0 + 3 + i * 1.9, -0.6 + 0.9 * Math.sin(i * 0.8)); }
  // 09 — arc along the left (inside of the bend, under the wave)
  { const a = st('09'); for (let i = 0; i < 9; i++) add('09', a.s0 + 1.5 + i * 1.7, -1.7 + i * 0.12); }
  // 10 — straight line into the towel tunnel
  { const a = st('10'); for (let i = 0; i < 5; i++) add('10', a.s0 + 1.5 + i * 2.0, -0.15); }
  return out;
}

export interface CoinSystem {
  group: THREE.Group;
  defs: CoinDef[];
  collected: Uint8Array;
  /** returns number of coins picked up this frame */
  update(time: number, dt: number, bennyS: number, bennyLat: number): number;
  /** mark coins before s as collected (deterministic QA checkpoint state) or reset all */
  resetUntil(s: number): void;
}

export function createCoins(course: Course): CoinSystem {
  const defs = coinLayout(course);
  const faceTex = canvasTexture(256, 256, (c, w, h) => {
    const g = c.createRadialGradient(w * 0.38, h * 0.32, 10, w / 2, h / 2, w * 0.55);
    g.addColorStop(0, '#fffbd8');
    g.addColorStop(0.5, '#ffdc3a');
    g.addColorStop(1, '#f0a400');
    c.fillStyle = g;
    c.beginPath(); c.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); c.fill();
    // raised inner rim: dark groove + bright lip
    c.lineWidth = 9;
    c.strokeStyle = '#c98200'; c.beginPath(); c.arc(w / 2 + 2, h / 2 + 2, w * 0.4, 0, Math.PI * 2); c.stroke();
    c.strokeStyle = '#fff0a0'; c.beginPath(); c.arc(w / 2 - 1, h / 2 - 1, w * 0.4, 0, Math.PI * 2); c.stroke();
    // embossed "$" drawn as vector strokes (font-independent: identical on every Android device):
    // light bevel up-left, dark bevel down-right, deep-gold glyph on top
    const dollar = (dx: number, dy: number, col: string, lw: number) => {
      c.save(); c.translate(dx, dy);
      c.strokeStyle = col; c.lineCap = 'round'; c.lineJoin = 'round';
      c.lineWidth = lw;
      c.beginPath();
      c.moveTo(166, 90);
      c.bezierCurveTo(150, 66, 90, 64, 90, 98);
      c.bezierCurveTo(90, 128, 166, 124, 166, 160);
      c.bezierCurveTo(166, 196, 104, 198, 88, 168);
      c.stroke();
      c.lineWidth = lw * 0.62;
      c.beginPath(); c.moveTo(128, 50); c.lineTo(128, 206); c.stroke();
      c.restore();
    };
    dollar(-3, -3, '#fff6c8', 28);
    dollar(4, 4, '#9a5a00', 28);
    dollar(0, 0, '#e39a00', 24);
  });
  const geo = new THREE.CylinderGeometry(0.5, 0.5, 0.14, 40, 1);
  geo.rotateX(Math.PI / 2); // faces along ±Z
  const side = new THREE.MeshStandardMaterial({ color: '#ffd23c', metalness: 0.9, roughness: 0.22, emissive: '#d08a00', emissiveIntensity: 0.55 });
  const face = new THREE.MeshStandardMaterial({ map: faceTex, metalness: 0.55, roughness: 0.3, emissive: '#ffffff', emissiveIntensity: 0.55, emissiveMap: faceTex });
  const mesh = new THREE.InstancedMesh(geo, [side, face, face], defs.length);
  mesh.frustumCulled = false;
  const group = new THREE.Group();
  group.name = 'coins';
  group.add(mesh);
  const collected = new Uint8Array(defs.length);
  const popT = new Float32Array(defs.length).fill(-1);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), basis = new THREE.Matrix4();
  const p = new THREE.Vector3(), sc = new THREE.Vector3();
  const spin = new THREE.Quaternion(), axis = new THREE.Vector3();
  const tiltQ = new THREE.Quaternion(), xAxis = new THREE.Vector3(1, 0, 0);
  const back = new THREE.Vector3();

  const place = (time: number) => {
    defs.forEach((d, i) => {
      const f = course.sample(d.s);
      let scale = 1;
      if (collected[i]) {
        if (popT[i] < 0) { sc.setScalar(0); m.compose(p.set(0, -9999, 0), q.identity(), sc); mesh.setMatrixAt(i, m); return; }
        const k = THREE.MathUtils.clamp((time - popT[i]) / 0.35, 0, 1);
        if (k >= 1) { popT[i] = -1; sc.setScalar(0); m.compose(p.set(0, -9999, 0), q.identity(), sc); mesh.setMatrixAt(i, m); return; }
        scale = 1 + k * 0.8;
        p.copy(f.pos).addScaledVector(f.right, d.lat).addScaledVector(f.up, d.h + k * 1.6);
      } else {
        p.copy(f.pos).addScaledVector(f.right, d.lat).addScaledVector(f.up, d.h + 0.08 * Math.sin(time * 3 + i));
      }
      back.copy(f.tan).negate();
      const right = new THREE.Vector3().crossVectors(f.up, back).normalize();
      basis.makeBasis(right, f.up, back);
      q.setFromRotationMatrix(basis);
      // tilted coins (05) only wobble a little so the face stays toward the camera
      spin.setFromAxisAngle(axis.set(0, 1, 0), (d.tilt ? 0.18 : 0.35) * Math.sin(time * 2.2 + i * 0.7));
      q.multiply(spin);
      if (d.tilt) q.multiply(tiltQ.setFromAxisAngle(xAxis, -d.tilt));
      m.compose(p, q, sc.setScalar((d.scale ?? 1) * scale * (collected[i] ? 1 - (time - popT[i]) / 0.35 : 1)));
      mesh.setMatrixAt(i, m);
    });
    mesh.instanceMatrix.needsUpdate = true;
  };
  place(0);

  return {
    group,
    defs,
    collected,
    update(time, _dt, s, lat) {
      let picked = 0;
      for (let i = 0; i < defs.length; i++) {
        if (collected[i]) continue;
        const d = defs[i];
        const ds = d.s - s;
        if (ds < -2 || ds > 2) continue;
        if (Math.abs(ds) < 1.0 && Math.abs(d.lat - lat) < 1.25) {
          collected[i] = 1;
          popT[i] = time;
          picked++;
        }
      }
      place(time);
      return picked;
    },
    resetUntil(s) {
      for (let i = 0; i < defs.length; i++) { collected[i] = defs[i].s < s ? 1 : 0; popT[i] = -1; }
      place(0);
    },
  };
}
