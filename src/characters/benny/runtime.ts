/**
 * Runtime Benny: loads the canonical assets/models/benny.glb, upgrades fur_* meshes to shell fur,
 * and drives expressions + procedural secondary motion on top of the GLB clips.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { BennyRuntime } from '../types';
import { makeFur, type FurHandle, type FurParams } from './fur';

const BENNY_URL = new URL('../../../assets/models/benny.glb', import.meta.url).href;

let cached: Promise<THREE.Group> | null = null;

function loadScene(): Promise<THREE.Group> {
  if (!cached) cached = new GLTFLoader().loadAsync(BENNY_URL).then((g) => {
    const s = g.scene as THREE.Group;
    s.userData.animations = g.animations;
    return s;
  });
  return cached;
}

/** fur tier: explicit option, else `?quality=low|high`, else low on Android/iOS (same rule as the water) */
function defaultFurQuality(): 'high' | 'low' {
  if (typeof location === 'undefined') return 'high';
  const qp = new URLSearchParams(location.search).get('quality');
  const mobile = typeof navigator !== 'undefined' && /Android|iPhone|iPad/i.test(navigator.userAgent);
  return qp === 'low' || (qp !== 'high' && mobile) ? 'low' : 'high';
}

export async function loadBenny(opts: { furQuality?: 'high' | 'low' } = {}): Promise<BennyRuntime> {
  const src = await loadScene();
  const clips: THREE.AnimationClip[] = src.userData.animations ?? [];
  return createBennyRuntime(src.clone(true), clips, { furQuality: opts.furQuality ?? defaultFurQuality() });
}

/**
 * Ride height. The game places the root at water surface + radius·0.55 (≈ 0.44), which buried the lower
 * third of the plush ball in the opaque stream. While riding (swim ≥ 0.5, not tumbling) the model is
 * lifted inside the root so he sits ON the water like refs 04–10: only the bottom of the fur and the
 * kicking feet are under the surface. Cinematics (01 peek, 02 tumble, 11 hide) keep the root as placed.
 * Wave 4: 0.30 → 0.22 together with the ride lean, which shows more of his back: keeps the pom-pom top at the
 * ref-05 height (≈ 765 px, under the first coin) and the cuff bottom where the ref has it.
 */
export const BENNY_RIDE_LIFT = 0.22;
/** QA A/B hook: `?bennyLift=<units>` overrides the ride lift (e.g. 0 = the game's raw placement) */
function rideLift(): number {
  if (typeof location === 'undefined') return BENNY_RIDE_LIFT;
  const v = parseFloat(new URLSearchParams(location.search).get('bennyLift') ?? '');
  return Number.isFinite(v) ? THREE.MathUtils.clamp(v, 0, 0.6) : BENNY_RIDE_LIFT;
}

/**
 * Ride lean (rad, about his X axis, + = top forward). While riding he leans into the current like a swimmer, so the
 * rear chase cameras (04–10: ≈ 25° above him) see the beanie and the plush back the way the references paint
 * them (≈ 10–12° above: knit stripes and cuff read as level bands, the dome as a tall cap, not a flat disc).
 * Eased in with the ride lift; cinematics (01 peek, 02 tumble, 11 hide) keep him upright. The game can scale it
 * per shot with `benny.root.userData.ridePitch` (0…1, default 1), e.g. 0 in the 03 twirl where he faces the camera.
 */
export const BENNY_RIDE_PITCH = 0.22;
function ridePitch(): number {
  if (typeof location === 'undefined') return BENNY_RIDE_PITCH;
  const v = parseFloat(new URLSearchParams(location.search).get('bennyPitch') ?? '');
  return Number.isFinite(v) ? THREE.MathUtils.clamp(THREE.MathUtils.degToRad(v), -0.5, 0.5) : BENNY_RIDE_PITCH;
}

/** Build the runtime around an already-loaded (or freshly built) Benny scene graph. */
export function createBennyRuntime(
  scene: THREE.Object3D,
  clips: THREE.AnimationClip[],
  opts: { furQuality?: 'high' | 'low' } = {},
): BennyRuntime {
  const root = new THREE.Group();
  root.name = 'Benny';
  root.add(scene);

  // ---- fur upgrade ----
  const furs: FurHandle[] = [];
  const toReplace: THREE.Mesh[] = [];
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh && m.name.startsWith('fur_') && m.userData?.fur) toReplace.push(m);
  });
  for (const m of toReplace) {
    const p = { ...(m.userData.fur as FurParams) };
    if (opts.furQuality === 'low') p.shells = Math.max(6, Math.round(p.shells * 0.6));
    const h = makeFur(m, p);
    m.parent!.add(h.mesh);
    m.parent!.remove(m);
    furs.push(h);
  }

  const get = (n: string) => scene.getObjectByName(n)!;
  const body = get('body');
  const pom = get('pom');
  const eyeL = get('eyeL');
  const eyeR = get('eyeR');
  const eyesGroup = get('eyes');
  const pomRest = pom.quaternion.clone();

  // ---- animation mixer: idle ↔ swim blend, tumble / peek on demand ----
  const mixer = new THREE.AnimationMixer(scene);
  const act = (name: string) => {
    const c = clips.find((k) => k.name === name);
    return c ? mixer.clipAction(c) : null;
  };
  const aIdle = act('idle'), aSwim = act('swim'), aTumble = act('tumble'), aPeek = act('peek');
  for (const a of [aIdle, aSwim, aTumble, aPeek]) a?.play();
  const setW = (a: THREE.AnimationAction | null, w: number) => a && a.setEffectiveWeight(w);

  let expression: 'happy' | 'dizzy' | 'peek' = 'happy';
  const setExpression = (e: 'happy' | 'dizzy' | 'peek') => {
    expression = e;
    for (const s of ['L', 'R']) {
      const h = scene.getObjectByName(`eye${s}_happy`);
      const d = scene.getObjectByName(`eye${s}_dizzy`);
      if (h) h.visible = e !== 'dizzy';
      if (d) d.visible = e === 'dizzy';
    }
    for (const k of ['happy', 'dizzy', 'peek']) {
      const m = scene.getObjectByName(`mouth_${k}`);
      if (m) m.visible = k === e;
    }
    eyesGroup.scale.setScalar(e === 'peek' ? 1.06 : 1);
  };
  setExpression('happy');

  // ---- secondary motion state ----
  let pomAngX = 0, pomVelX = 0, pomAngZ = 0, pomVelZ = 0;
  let lastY = 0, lastVy = 0;
  let blinkT = 1.7;
  let lean = 0;
  let lift = 0;
  const liftMax = rideLift();
  let pitch = 0;
  const pitchMax = ridePitch();
  const tmp = new THREE.Vector3();
  const qLean = new THREE.Quaternion();
  const qPom = new THREE.Quaternion();
  const eAxis = new THREE.Euler();

  const update: BennyRuntime['update'] = (dt, st) => {
    dt = Math.min(dt, 1 / 20);
    // clip weights
    const tumble = !!st.tumble;
    const swim = tumble ? 0 : THREE.MathUtils.clamp(st.swim, 0, 1);
    const peek = expression === 'peek' && !tumble ? 1 : 0;
    setW(aTumble, tumble ? 1 : 0);
    setW(aPeek, peek);
    setW(aSwim, peek ? 0 : swim);
    setW(aIdle, tumble || peek ? 0 : 1 - swim);
    if (aSwim) aSwim.timeScale = 0.8 + Math.min(1.2, st.speed / 14);
    mixer.update(dt);

    // ride height (see BENNY_RIDE_LIFT): eased so mode switches never pop
    const liftTarget = tumble || peek ? 0 : liftMax * THREE.MathUtils.smoothstep(swim, 0.5, 0.9);
    lift += (liftTarget - lift) * (1 - Math.exp(-dt * 7));
    scene.position.y = lift;
    // ride lean into the current (see BENNY_RIDE_PITCH), on the same ease as the lift
    const pitchScale = typeof root.userData.ridePitch === 'number' ? THREE.MathUtils.clamp(root.userData.ridePitch, 0, 1) : 1;
    const pitchTarget = tumble || peek ? 0 : pitchMax * pitchScale * THREE.MathUtils.smoothstep(swim, 0.5, 0.9);
    pitch += (pitchTarget - pitch) * (1 - Math.exp(-dt * 7));

    // steering lean (roll) + slight yaw into the turn
    lean += (THREE.MathUtils.clamp(st.steer, -1, 1) * 0.28 - lean) * Math.min(1, dt * 6);
    qLean.setFromEuler(eAxis.set(pitch, -lean * 0.6, -lean));
    body.quaternion.multiply(qLean);

    // pom-pom spring: driven by vertical acceleration, steering and speed jitter
    root.getWorldPosition(tmp);
    const vy = (tmp.y - lastY) / Math.max(dt, 1e-3);
    const ay = THREE.MathUtils.clamp((vy - lastVy) / Math.max(dt, 1e-3), -80, 80);
    lastY = tmp.y; lastVy = vy;
    const k = 120, c = 9;
    const targetX = -ay * 0.004 + Math.sin(st.time * 11) * 0.03 * Math.min(1, st.speed / 12);
    const targetZ = lean * 0.9;
    pomVelX += (k * (targetX - pomAngX) - c * pomVelX) * dt;
    pomAngX += pomVelX * dt;
    pomVelZ += (k * (targetZ - pomAngZ) - c * pomVelZ) * dt;
    pomAngZ += pomVelZ * dt;
    qPom.setFromEuler(eAxis.set(THREE.MathUtils.clamp(pomAngX, -0.6, 0.6), 0, THREE.MathUtils.clamp(pomAngZ, -0.6, 0.6)));
    pom.quaternion.copy(pomRest).multiply(qPom);

    // blink (cartoon squash of the eyes); no blinking while dizzy
    blinkT -= dt;
    let blink = 1;
    if (expression !== 'dizzy') {
      if (blinkT < 0.14) blink = Math.abs(blinkT - 0.07) / 0.07;
      if (blinkT <= 0) blinkT = 2.2 + Math.random() * 2.6;
    }
    eyeL.scale.y = eyeR.scale.y = Math.max(0.08, blink);

    for (const f of furs) {
      f.uniforms.uTime.value = st.time;
      f.uniforms.uWind.value.set(0, 0, -Math.min(0.6, st.speed / 25));
    }
  };

  // ---- QA segmentation mask (`?bennyMask`, or window.__bennyQA.mask(true) in ?qa pages) ----
  if (typeof location !== 'undefined') {
    const qs = new URLSearchParams(location.search);
    const qa = { mask: (on: boolean) => setMask(scene, furs, on), info: () => qaInfo(root, body) };
    if (qs.has('qa') || qs.has('bennyMask')) (window as unknown as { __bennyQA?: typeof qa }).__bennyQA = qa;
    if (qs.has('bennyMask')) qa.mask(true);
  }

  return { root, setExpression, update, radius: 0.8 };
}

/**
 * Flat ID colours for pixel measurement in real game captures (no lighting, fog or textures):
 * body fur / arms / feet / face = red, beanie crown = cyan, ribbed cuff = blue, pom-pom = green, star = black.
 * Classify the frame with  R>150,G<60,B<60 (body) · G>150,R<60,B<60 (pom) · B>150,R<60,G<60 (cuff) ·
 * R<60,G>150,B>150,|G−B|<40 (crown) · all<40 inside the hat (star).
 */
const MASK_COLS: [RegExp, string][] = [
  [/^fur_pom/, '#00ff00'],
  [/^hat_crown/, '#00ffff'],
  [/^hat_brim/, '#0000ff'],
  [/^hat_star/, '#000000'],
];
function maskColour(name: string): string {
  for (const [re, c] of MASK_COLS) if (re.test(name)) return c;
  return '#ff0000';
}
function setMask(scene: THREE.Object3D, furs: FurHandle[], on: boolean): void {
  for (const f of furs) {
    f.uniforms.uMaskCol.value.set(maskColour(f.mesh.name));
    const d = f.material.defines ?? (f.material.defines = {});
    if (on) d.BENNY_MASK = ''; else delete d.BENNY_MASK;
    f.material.needsUpdate = true;
  }
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || (m as unknown as THREE.InstancedMesh).isInstancedMesh) return;
    const ud = m.userData as { qaOrig?: THREE.Material | THREE.Material[]; qaVis?: boolean };
    if (on && !ud.qaOrig) {
      ud.qaOrig = m.material;
      ud.qaVis = m.visible;
      // face decals sit on the red body: hide them so their alpha edges do not leak texture colours
      if (/^(blush|mouth_)/.test(m.name)) m.visible = false;
      m.material = new THREE.MeshBasicMaterial({ color: maskColour(m.name), fog: false });
    } else if (!on && ud.qaOrig) {
      (m.material as THREE.Material).dispose();
      m.material = ud.qaOrig;
      m.visible = ud.qaVis ?? true;
      delete ud.qaOrig;
    }
  });
}
function qaInfo(root: THREE.Object3D, body: THREE.Object3D) {
  const p = body.getWorldPosition(new THREE.Vector3());
  const up = new THREE.Vector3(0, 1, 0).applyQuaternion(root.getWorldQuaternion(new THREE.Quaternion()));
  const fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(root.getWorldQuaternion(new THREE.Quaternion()));
  const r3 = (v: THREE.Vector3) => v.toArray().map((x) => +x.toFixed(3));
  return { body: r3(p), up: r3(up), fwd: r3(fwd), scale: +root.scale.x.toFixed(3) };
}
