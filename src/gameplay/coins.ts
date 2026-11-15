/**
 * Gold $ coins anchored to the course (s, lateral, height). Real pickups: distance test against
 * Benny each frame; collected coins pop + sparkle and the counter increments by COIN_VALUE.
 * Layout follows the coin trails visible in the references (03 spiral trail, 04 left edge,
 * 05/07 snaking centre line, 06 on the arch crest, 08–10 toward the towel).
 */
import * as THREE from 'three';
import type { Course, StageId } from '../world/course';
import { canvasTexture } from '../world/materials';

export const COIN_VALUE = 10;

export interface CoinDef { s: number; lat: number; h: number; stage: StageId }

export function coinLayout(course: Course): CoinDef[] {
  const out: CoinDef[] = [];
  const add = (stage: StageId, s: number, lat: number, h = 0.9) => out.push({ s, lat, h, stage });
  const st = (id: StageId) => course.stage(id);
  // 03 — spiral trail ahead of Benny toward the drain
  { const a = st('03'); for (let i = 0; i < 9; i++) add('03', a.s0 + 6 + i * 2.7, 0.9 - i * 0.12); }
  // 04 — along the left edge of the slide
  { const a = st('04'); for (let i = 0; i < 8; i++) add('04', a.s0 + 9 + i * 3.6, -1.35); }
  // 05 — snaking centre line
  { const a = st('05'); const n = 18; for (let i = 0; i < n; i++) { const s = a.s0 + 8 + i * ((a.s1 - a.s0 - 12) / n); add('05', s, 1.2 * Math.sin(i * 0.55)); } }
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
    g.addColorStop(0, '#fff6c0');
    g.addColorStop(0.5, '#ffc21f');
    g.addColorStop(1, '#d98200');
    c.fillStyle = g;
    c.beginPath(); c.arc(w / 2, h / 2, w / 2, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#ffe680'; c.lineWidth = 10;
    c.beginPath(); c.arc(w / 2, h / 2, w * 0.38, 0, Math.PI * 2); c.stroke();
    c.font = '800 170px "Baloo 2", Arial Black, sans-serif';
    c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = '#b86400';
    c.fillText('$', w / 2 + 4, h / 2 + 12);
    c.fillStyle = '#ffe58a';
    c.fillText('$', w / 2 - 2, h / 2 + 6);
  });
  const geo = new THREE.CylinderGeometry(0.62, 0.62, 0.16, 40, 1);
  geo.rotateX(Math.PI / 2); // faces along ±Z
  const side = new THREE.MeshStandardMaterial({ color: '#ffb52a', metalness: 1, roughness: 0.25, emissive: '#a85a00', emissiveIntensity: 0.45 });
  const face = new THREE.MeshStandardMaterial({ map: faceTex, metalness: 0.75, roughness: 0.28, emissive: '#c07000', emissiveIntensity: 0.3, emissiveMap: faceTex });
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
      spin.setFromAxisAngle(axis.set(0, 1, 0), 0.35 * Math.sin(time * 2.2 + i * 0.7));
      q.multiply(spin);
      m.compose(p, q, sc.setScalar(scale * (collected[i] ? 1 - (time - popT[i]) / 0.35 : 1)));
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
