/**
 * Gold $ coins anchored to the course (s, lateral, height). Real pickups: distance test against
 * Benny each frame; collected coins pop + sparkle and the counter increments by COIN_VALUE.
 * Layout follows the coin trails visible in the references (03 spiral trail, 04 left edge,
 * 05/07 snaking centre line, 06 on the arch crest, 08–10 toward the towel).
 */
import * as THREE from 'three';
import type { Course, StageId } from '../world/course';
import { canvasTexture } from '../world/materials';
import { coreLateral, on05, proj05Pending, PROJ05_INVERSE } from '../vfx/waterRibbon';

export const COIN_VALUE = 10;

/** `?coins05=1` / `?match05=1`: Screen 05 reference coins (measured 05 layout C05M + approved coin look, all screens) */
const COINS05 = on05('coins05');
/**
 * coins05 LOOK: the face texture IS the approved nearest coin (qa/pilot05/full_reference_match/coins/coin_bake.py →
 * assets/textures/coins05/coin05_face.png: un-foreshortened to a disc, texel = display colour) and the milled edge uses the
 * approved coin's edge-band colours; both are drawn unlit through the post-chain inverse PROJ05_INVERSE, so the screen
 * shows the approved yellow-gold instead of the tone-mapped orange. The game waits for the texture before `ready`.
 */
/** measured on the approved coins 1-4 (silhouettes, qa/pilot05/full_reference_match/coins/measure_coins.py): face height /
 *  width 0.76 -> 0.66 and edge band / width 0.11-0.13 => thickness ~0.18 u per 1-u coin and ~0.1 rad more lean-back than
 *  C05.tilt (game v1: faces 6-9 px too tall, edges 2-5 px too thin) */
const C05LOOK = { thick: 0.18, tilt: 0.9 };
let face05: THREE.Texture | null = null;
if (COINS05) {
  proj05Pending.push(new Promise<void>((res) => {
    face05 = new THREE.TextureLoader().load(new URL('../../assets/textures/coins05/coin05_face.png', import.meta.url).href, () => res(), undefined, (e) => {
      console.error('[rainbow] coins05: coin05_face.png failed', e); res();
    });
    face05.colorSpace = THREE.NoColorSpace; // the texels ARE display values: the shader undoes the post chain
    face05.anisotropy = 4;
  }));
}
const post05 = { uPjPost: { value: new THREE.Vector4(0.86, 1.36, 1.15, 0.18) }, uPjRes: { value: new THREE.Vector2(864, 1536) } };
const rt05 = new THREE.Vector2();
/** unlit material whose map holds DISPLAY colours: the fragment shows pjInverse(map) (the post chain then restores it) */
function coin05Material(map: THREE.Texture): THREE.MeshBasicMaterial {
  const mat = new THREE.MeshBasicMaterial({ map, fog: false });
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, post05);
    shader.fragmentShader = shader.fragmentShader
      .replace('void main() {', `uniform vec4 uPjPost; uniform vec2 uPjRes;\n${PROJ05_INVERSE}\nvoid main() {`)
      .replace('#include <dithering_fragment>', `#include <dithering_fragment>\ngl_FragColor = vec4(pjInverse(diffuseColor.rgb), 1.0); // coins05`);
  };
  mat.customProgramCacheKey = () => 'coin05';
  mat.onBeforeRender = (renderer) => {
    const rt = renderer.getRenderTarget();
    if (rt) rt05.set(rt.width, rt.height); else renderer.getDrawingBufferSize(rt05);
    post05.uPjRes.value.copy(rt05);
    post05.uPjPost.value.x = renderer.toneMappingExposure;
  };
  return mat;
}
/** approved coin edge band (display colours, measured below the face of approved coin 1: face side → back) + ridges */
function edge05Texture(): THREE.Texture {
  const band = [[231, 164, 29], [215, 139, 35], [195, 118, 43], [175, 103, 48], [165, 99, 53], [161, 99, 54], [157, 98, 53], [155, 97, 52], [153, 97, 52], [147, 96, 53], [135, 96, 60]];
  return canvasTexture(256, band.length, (c, w) => {
    band.forEach(([r, g, b], y) => {
      for (let x = 0; x < w; x++) {
        const k = x % 4; // 64 milled ridges round the coin: a light (water-lit) ridge, a dark groove
        const d = k === 0 ? [30, 38, 48] : k === 2 ? [-14, -12, -10] : [0, 0, 0];
        c.fillStyle = `rgb(${Math.min(255, Math.max(0, r + d[0]))},${Math.min(255, Math.max(0, g + d[1]))},${Math.min(255, Math.max(0, b + d[2]))})`;
        c.fillRect(x, y, 1, 1);
      }
    });
  }, false);
}

/** scale: coin size factor (1 = 1.0 u diameter); tilt: radians the coin leans back (top away from the camera) */
export interface CoinDef {
  s: number; lat: number; h: number; stage: StageId; scale?: number; tilt?: number;
  /** coins05 only: bob / wobble phase (default: the coin's index, as before) */
  phase?: number;
  /** coins05 only: [scale at the 05 checkpoint, distance ahead of Benny at the checkpoint] — the coin shows `scale` from
   *  15 u closer on (see C05M) */
  far?: [number, number];
}

/**
 * 05 (ref 05, measured): ≈10 coins on the electric-cyan core winding to the VP. The nearest one is
 * ≈95 px wide just above Benny's pom (474, 726), then 64 → 55 → 42 → 28 → 19 px: the spacing in depth
 * grows with distance, so the gaps here grow too (C05.gap0 + k·C05.gapGrow). Coins lean back by C05.tilt
 * so their face reads as a slightly flattened disc with the rim visible underneath, as in the ref.
 * Before the 05 checkpoint the trail keeps a plain C05.gap0 spacing (gameplay only, never in frame).
 */
export const C05 = { first: 5.7, gap0: 5.0, gapGrow: 1.5, gapMax: 8, scale: 0.9, h: 1.2, tilt: 0.8, preGap: 3.6, latK: 0.7 };

/**
 * `?coins05=1` (or `?match05=1`), Screen 05 full reference match (qa/pilot05/full_reference_match/coins/NOTES.md):
 * the visible coins at the locked 05 checkpoint, MEASURED on the approved picture (centre x, y and face width w, px) and
 * solved back onto the course with the live render camera (qa/pilot05/full_reference_match/hud/probe05.mjs --solve:
 * course point (s, lat) at the coins' height whose coin centre — same bob as below, clock 12 — projects onto the
 * approved centre; scale = approved width / projected width of a 1-u coin). Rows: [ds = s − 05_crest, lat, scale].
 * approved (x, y, w): 1 (473.5, 725, 96) 2 (548.5, 658.5, 70) 3 (481.5, 612, 56) 4 (431, 575, 43) 5 (465.5, 545, 28)
 * 6 (495.5, 532.5, 20) 7 (518, 524, 17) 8 (532, 516.5, 12.5) 9 (537, 509, 10) 10 (534, 502, 8) 11 (526, 497, 7)
 * 12 (516, 492, 6) 13 (507.5, 489, 5) 14 (498, 487, 5) 15 (490.5, 485.5, 4) — the far line winds up into the light.
 * The game's straight 05 tube is shorter than the painted one, so coins 8–15 sit where the course starts to climb
 * (ds 56–60) and the approved sizes need scales < 1 there; those coins grow to C05M_NEAR (capped so neighbours do not
 * overlap) as Benny closes in, so they are small only while far away. The pre-checkpoint trail and every other screen's
 * coins are unchanged (their bob phase is kept: CoinDef.phase).
 */
export const C05M: [number, number, number][] = [
  [6.356, -0.311, 0.976], [10.95, 0.161, 0.95], [16.614, -0.144, 1.001], [26.225, -0.665, 1.085], [43.262, -1.754, 1.085],
  [48.928, -1.967, 0.832], [55.075, 0.919, 0.788], [56.475, 1.629, 0.591], [57.469, 1.947, 0.479], [58.306, 1.9, 0.387],
  [58.889, 1.599, 0.341], [59.411, 1.195, 0.294], [59.653, 0.806, 0.245], [59.695, 0.325, 0.245], [59.687, -0.063, 0.195],
];
/** near size of the measured coins (C05.scale = the default 05 coin size), capped by the gap to the next coin */
const C05M_NEAR = (k: number): number => {
  const [ds, lat] = C05M[k];
  const nb = [C05M[k - 1], C05M[k + 1]].filter(Boolean).map(([d2, l2]) => Math.hypot(d2 - ds, l2 - lat));
  return Math.max(C05M[k][2], Math.min(C05.scale, 0.85 * Math.min(...nb)));
};

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
  if (!COINS05) return out;
  // coins05: keep every coin's bob phase, swap the 05 coins after the checkpoint for the measured arrangement (C05M)
  out.forEach((d, i) => { d.phase = i; });
  const sCp = course.marks['05_crest'];
  const first = out.findIndex((d) => d.stage === '05' && d.s > sCp);
  const kept = out.filter((d) => !(d.stage === '05' && d.s > sCp));
  const a5 = st('05');
  const meas: CoinDef[] = C05M.map(([ds, lat, scale], k) => ({
    s: sCp + ds, lat, h: C05.h, stage: sCp + ds < a5.s1 ? '05' : '06', scale: C05M_NEAR(k), tilt: C05.tilt, phase: first + k,
    far: [scale, ds],
  }));
  kept.splice(first, 0, ...meas);
  return kept;
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
  const geo = new THREE.CylinderGeometry(0.5, 0.5, COINS05 ? C05LOOK.thick : 0.2, 48, 1);
  geo.rotateX(Math.PI / 2); // faces along ±Z
  // Gold is carried mostly by EMISSIVE art (blue ≈ 0) so the pink-white candy environment and the
  // Neutral tone mapping cannot wash it to pale peach (ref face ≈ #F4C400); a dark-gold metal base
  // keeps a reflective sheen on top.
  const side = new THREE.MeshStandardMaterial({ color: '#6a4a00', metalness: 0.75, roughness: 0.3, emissive: '#ffffff', emissiveMap: edgeTex, emissiveIntensity: 1.0 });
  const face = new THREE.MeshStandardMaterial({ map: faceTex, color: '#7a5200', metalness: 0.7, roughness: 0.3, emissive: '#ffffff', emissiveMap: faceTex, emissiveIntensity: 1.15 });
  let mats: THREE.Material[] = [side, face, face];
  if (COINS05 && face05) {
    const f05 = face05 as THREE.Texture;
    f05.center.set(0.5, 0.5);
    f05.rotation = faceTex.rotation; // same cap orientation as the default art
    const face5 = coin05Material(f05);
    mats = [coin05Material(edge05Texture()), face5, face5];
  }
  const mesh = new THREE.InstancedMesh(geo, mats, defs.length);
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

  let lastS = -1e9; // Benny's s at the last update (coins05 far-scale)
  const place = (time: number) => {
    defs.forEach((d, i) => {
      const f = course.sample(d.s);
      const ph = d.phase ?? i;
      let scale = 1;
      if (collected[i]) {
        if (popT[i] < 0) { sc.setScalar(0); m.compose(p.set(0, -9999, 0), q.identity(), sc); mesh.setMatrixAt(i, m); return; }
        const k = THREE.MathUtils.clamp((time - popT[i]) / 0.35, 0, 1);
        if (k >= 1) { popT[i] = -1; sc.setScalar(0); m.compose(p.set(0, -9999, 0), q.identity(), sc); mesh.setMatrixAt(i, m); return; }
        scale = 1 + k * 0.8;
        p.copy(f.pos).addScaledVector(f.right, d.lat).addScaledVector(f.up, d.h + k * 1.6);
      } else {
        p.copy(f.pos).addScaledVector(f.right, d.lat).addScaledVector(f.up, d.h + 0.08 * Math.sin(time * 3 + ph));
      }
      back.copy(f.tan).negate();
      const right = new THREE.Vector3().crossVectors(f.up, back).normalize();
      basis.makeBasis(right, f.up, back);
      q.setFromRotationMatrix(basis);
      // tilted coins (05) only wobble a little so the face stays toward the camera
      spin.setFromAxisAngle(axis.set(0, 1, 0), (d.tilt ? 0.18 : 0.35) * Math.sin(time * 2.2 + ph * 0.7));
      q.multiply(spin);
      if (d.tilt) q.multiply(tiltQ.setFromAxisAngle(xAxis, -d.tilt));
      let base = d.scale ?? 1;
      if (d.far) {
        // coins05: the measured checkpoint size while at least (checkpoint distance − 1) ahead, full size 15 u closer
        const k = THREE.MathUtils.clamp((d.far[1] - 1 - (d.s - lastS)) / 15, 0, 1);
        base = d.far[0] + (base - d.far[0]) * k;
      }
      m.compose(p, q, sc.setScalar(base * scale * (collected[i] ? 1 - (time - popT[i]) / 0.35 : 1)));
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
      lastS = s;
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
      lastS = s - 0.5;
      for (let i = 0; i < defs.length; i++) { collected[i] = defs[i].s < s ? 1 : 0; popT[i] = -1; }
      place(0);
    },
  };
}
