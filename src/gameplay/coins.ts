/**
 * Gold $ coins anchored to the course (s, lateral, height). Real pickups: distance test against
 * Benny each frame; collected coins pop + sparkle and the counter increments by COIN_VALUE.
 * Layout follows the coin trails visible in the references (03 spiral trail, 04 left edge,
 * 05/07 snaking centre line, 06 on the arch crest, 08–10 toward the towel).
 */
import * as THREE from 'three';
import type { Course, StageId } from '../world/course';
import { canvasTexture } from '../world/materials';
import { coreLateral, flag05 } from '../vfx/waterRibbon';
import coins08 from '../../assets/textures/match08/coins08.json';
import coins07 from '../../assets/textures/match07/coins07.json';

export const COIN_VALUE = 10;

/** scale: coin size factor (1 = 1.0 u diameter); tilt: radians the coin leans back (top away from the camera) */
export interface CoinDef { s: number; lat: number; h: number; stage: StageId; scale?: number; tilt?: number; faceTo?: [number, number, number] }

/**
 * 05 (ref 05, measured): ≈10 coins on the electric-cyan core winding to the VP. The nearest one is
 * ≈95 px wide just above Benny's pom (474, 726), then 64 → 55 → 42 → 28 → 19 px: the spacing in depth
 * grows with distance, so the gaps here grow too (C05.gap0 + k·C05.gapGrow). Coins lean back by C05.tilt
 * so their face reads as a slightly flattened disc with the rim visible underneath, as in the ref.
 * Before the 05 checkpoint the trail keeps a plain C05.gap0 spacing (gameplay only, never in frame).
 */
export const C05 = { first: 5.7, gap0: 5.0, gapGrow: 1.5, gapMax: 8, scale: 0.9, h: 1.2, tilt: 0.8, preGap: 3.6, latK: 0.7 };

function coins05(course: Course, add: (stage: StageId, s: number, lat: number, h?: number, extra?: Partial<CoinDef>) => void) {
  const a = course.stage('05');
  const sCp = course.marks['05_crest'];
  const extra = { scale: C05.scale, tilt: C05.tilt };
  const ss: number[] = [];
  // gameplay trail before the checkpoint ends 1 u behind Benny's checkpoint spot (never between him and the camera view)
  for (let s = sCp - 1; s > a.s0 + 6; s -= C05.preGap) ss.unshift(s);
  for (let k = 0, s = sCp + C05.first; s < a.s1 - 3; k++) { ss.push(s); s += Math.min(C05.gapMax, C05.gap0 + k * C05.gapGrow); }
  // latK < 1: the trail winds with the cyan core but stays inside its middle (the core half width is
  // ≥ 2 u), so the far coins converge on the VP like the ref instead of swinging out to the pink bands
  for (const s of ss) add('05', s, C05.latK * coreLateral(course, s), C05.h, extra);
}

/** `?m07coins=1`: lateral offsets of the two far trail coins continuing the painted coin line (tools/match07/coinprobe07.mjs) */
const M07_FAR_LAT = [0.42, 1.82];

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
  // `?match07=1` (qa/match/07/NOTES.md): the approved picture's eight coins where the picture shows them (world positions from
  // the locked 07 camera, assets/textures/match07/coins07.json) replace the first eight trail coins from 12 u before the 07
  // checkpoint on (the run's coin total is unchanged); off: the trail as before
  const m07 = flag05('match07') || flag05('matchall');
  // `?match07=1&m07coins=1` (qa/match/07/m2/NOTES.md, position only): the two trail coins right behind the painted far coins
  // (which otherwise pile up on the painted cluster) continue the painted line to the right of it, at the painted coins' size for that distance (0.45)
  const m07c = m07 && flag05('m07coins'); let m07k = 0;
  { const a = st('07'); const n = 24; let skip = m07 ? coins07.coins.length : 0; for (let i = 0; i < n; i++) { const s = a.s0 + 6 + i * ((a.s1 - a.s0 - 10) / n); if (skip > 0 && s >= a.s0 + 14) { skip--; continue; } const far = m07c && skip === 0 && s >= a.s0 + 30 && m07k < 2; if (far) add('07', s, M07_FAR_LAT[m07k++], 0.9, { scale: 0.45 }); else add('07', s, 1.0 * Math.sin(i * 0.5 + 1)); } }
  if (m07) {
    const a = st('07');
    for (const c of coins07.coins) {
      const P = new THREE.Vector3(...(c.pos as [number, number, number]));
      let sb = a.s0, bd = Infinity;
      for (let s = a.s0 + 10; s <= a.s0 + 75; s += 0.02) { const f = course.sample(s); const d = Math.abs(P.clone().sub(f.pos).dot(f.tan)); if (d < bd) { bd = d; sb = s; } }
      const f = course.sample(sb), r = P.clone().sub(f.pos);
      add('07', sb, r.dot(f.right), r.dot(f.up), { scale: c.scale, faceTo: coins07.faceTo as [number, number, number] });
    }
  }
  // 08 — S toward the platform
  const m08 = flag05('match08') || flag05('matchall');
  if (!m08) { const a = st('08'); for (let i = 0; i < 8; i++) add('08', a.s0 + 3 + i * 1.9, -0.6 + 0.9 * Math.sin(i * 0.8)); }
  // 09 — arc along the left (inside of the bend, under the wave)
  if (!m08) { const a = st('09'); for (let i = 0; i < 9; i++) add('09', a.s0 + 1.5 + i * 1.7, -1.7 + i * 0.12); }
  // `?match08=1` (qa/match/08/NOTES.md): the approved picture's nine coins where the picture shows them
  // (assets/textures/match08/coins08.json, from the locked 08 camera), instead of the 08 + 09 rows above
  if (m08) {
    const s0 = st('08').s0, s1 = st('11').s0;
    const cam = coins08.faceTo as [number, number, number];
    const toRiver = (x: number, z: number) => {
      let best = s0, bd = Infinity;
      for (let s = s0; s <= s1; s += 0.05) { const p = course.sample(s).pos; const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; best = s; } }
      const f = course.sample(best);
      return { s: best, lat: (x - f.pos.x) * f.right.x + (z - f.pos.z) * f.right.z, y: f.pos.y };
    };
    for (const c of coins08.coins) {
      let r = toRiver(c.x, c.z), h = c.h, scale = c.scale;
      // keep every picture coin collectible: if it lies beyond pickup reach (|lateral| > 1.1), slide it along its own view
      // ray from the approved camera (same pixel in the approved view) to the nearest depth within reach, above the water;
      // its size scales with the depth so it still covers the painted coin
      if (Math.abs(r.lat) > 1.1) {
        const P = [c.x, r.y + c.h, c.z], D = [P[0] - cam[0], P[1] - cam[1], P[2] - cam[2]];
        let pick: { k: number; r: typeof r; h: number } | null = null;
        for (let k = 0.2; k <= 1.8; k += 0.01) {
          const q = [cam[0] + D[0] * k, cam[1] + D[1] * k, cam[2] + D[2] * k], rq = toRiver(q[0], q[2]), hq = q[1] - rq.y;
          if (Math.abs(rq.lat) <= 1.0 && hq >= 0.3 && (!pick || Math.abs(k - 1) < Math.abs(pick.k - 1))) pick = { k, r: rq, h: hq };
        }
        if (pick) { r = pick.r; h = pick.h; scale = c.scale * pick.k; }
      }
      add(course.stageAtS(r.s).id, r.s, r.lat, h, { scale, faceTo: cam });
    }
    // keep the run's coin total (the picture's 9 replace the 17 of 08 + 09): the other 8 go into the inlet just before the
    // 08 view — collected on the way in, never in the approved view
    const sIn = st('08').s0;
    for (let i = 0; i < 8; i++) { const s = sIn - 4 + i * 0.8; add(course.stageAtS(s).id, s, 0.35 * Math.sin(i * 1.3)); }
  }
  // `?match08=1`: river order (the coins above were appended out of order)
  if (m08 || m07) out.sort((a, b) => a.s - b.s);
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
  /** `?match07=1&m07coinsz=1` (look only): the live camera + Benny's centre, so Screen 07 coins can keep a painted on-screen
   *  size and step aside from Benny's screen box. Absent / null = unchanged. */
  setView?(camera: THREE.PerspectiveCamera | null, benny: THREE.Vector3 | null, viewH: number): void;
}

export function createCoins(course: Course): CoinSystem {
  const defs = coinLayout(course);
  const faceTex = canvasTexture(256, 256, (c, w, h) => {
    const g = c.createRadialGradient(w * 0.38, h * 0.32, 10, w / 2, h / 2, w * 0.55);
    g.addColorStop(0, '#ffe680');
    g.addColorStop(0.45, '#ffcf2a');
    g.addColorStop(1, '#e89200');
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
    dollar(3, 4, '#7a3c00', 32); // drop shadow
    dollar(0, 0, '#b86400', 30); // dark outline
    dollar(0, 0, '#ffe55a', 18); // bright raised glyph
    dollar(-3, -3, '#fff8d0', 6); // top-left bevel highlight
  });
  // the cylinder cap's UVs run sideways once the coin is stood up (rotateX): turn the face art upright
  faceTex.center.set(0.5, 0.5);
  faceTex.rotation = -Math.PI / 2;
  // milled (ridged) gold edge, as on the ref coins
  const edgeTex = canvasTexture(256, 8, (c, w, h) => {
    for (let x = 0; x < w; x += 4) { c.fillStyle = (x / 4) % 2 ? '#c08000' : '#ffe070'; c.fillRect(x, 0, 4, h); }
  });
  const geo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 48, 1);
  geo.rotateX(Math.PI / 2); // faces along ±Z
  // Gold is carried mostly by EMISSIVE art (blue ≈ 0) so the pink-white candy environment and the
  // Neutral tone mapping cannot wash it to pale peach (ref face ≈ #F4C400); a dark-gold metal base
  // keeps a reflective sheen on top.
  const side = new THREE.MeshStandardMaterial({ color: '#6a4a00', metalness: 0.75, roughness: 0.3, emissive: '#ffffff', emissiveMap: edgeTex, emissiveIntensity: 1.0 });
  const face = new THREE.MeshStandardMaterial({ map: faceTex, color: '#7a5200', metalness: 0.7, roughness: 0.3, emissive: '#ffffff', emissiveMap: faceTex, emissiveIntensity: 1.15 });
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
  // `?match07=1&m07coinsz=1` (round 7, user feedback "oversized coins"): LOOK only — Screen 07 coins never draw larger
  // on screen than the painted near coin (≈105 px of a 1536-px-high frame), and a coin between the camera and Benny that
  // overlaps his screen box shrinks away. Count, positions along the path, pickups and score are unchanged.
  const look07 = flag05('m07coinsz') && (flag05('match07') || flag05('matchall'));
  let vCam: THREE.PerspectiveCamera | null = null; let vBenny: THREE.Vector3 | null = null; let vH = 1536;
  const cp = new THREE.Vector3(), bp = new THREE.Vector3();
  const lookScale = (d: CoinDef, pos: THREE.Vector3, size: number): number => {
    if (!look07 || !vCam || d.stage !== '07') return 1;
    const dist = pos.distanceTo(vCam.position);
    const focal = (vH / 2) / Math.tan(THREE.MathUtils.degToRad(vCam.fov / 2));
    const px = (size * focal) / Math.max(dist, 1e-3); // on-screen diameter at this size
    const cap = (105 / 1536) * vH;
    let k = Math.min(1, cap / Math.max(px, 1e-3));
    if (vBenny) {
      const dc = dist, db = vBenny.distanceTo(vCam.position);
      if (dc < db) {
        cp.copy(pos).project(vCam); bp.copy(vBenny).project(vCam);
        const r = Math.hypot((cp.x - bp.x) * vCam.aspect, cp.y - bp.y); // NDC distance, aspect-corrected
        k *= 0.25 + 0.75 * THREE.MathUtils.smoothstep(r, 0.18, 0.38);
      }
    }
    return k;
  };

  let lastT = 0;
  const place = (time: number) => {
    lastT = time;
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
      // `?match08=1` picture coins: the face turns toward the approved view's camera (upright, faced like the painted coins)
      if (d.faceTo) back.set(d.faceTo[0] - p.x, 0, d.faceTo[2] - p.z).normalize();
      const upV = d.faceTo ? new THREE.Vector3(0, 1, 0) : f.up;
      const right = new THREE.Vector3().crossVectors(upV, back).normalize();
      basis.makeBasis(right, upV, back);
      q.setFromRotationMatrix(basis);
      // tilted coins (05) only wobble a little so the face stays toward the camera; picture coins (08) barely
      spin.setFromAxisAngle(axis.set(0, 1, 0), (d.faceTo ? 0.06 : d.tilt ? 0.18 : 0.35) * Math.sin(time * 2.2 + i * 0.7));
      q.multiply(spin);
      if (d.tilt) q.multiply(tiltQ.setFromAxisAngle(xAxis, -d.tilt));
      const size = (d.scale ?? 1) * scale * (collected[i] ? 1 - (time - popT[i]) / 0.35 : 1);
      m.compose(p, q, sc.setScalar(size * lookScale(d, p, size)));
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
    setView(camera, benny, viewH) { vCam = camera; vBenny = benny; vH = viewH; place(lastT); },
    resetUntil(s) {
      for (let i = 0; i < defs.length; i++) { collected[i] = defs[i].s < s ? 1 : 0; popT[i] = -1; }
      place(0);
    },
  };
}
