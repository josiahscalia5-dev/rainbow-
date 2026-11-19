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

export async function loadBenny(opts: { furQuality?: 'high' | 'low' } = {}): Promise<BennyRuntime> {
  const src = await loadScene();
  const clips: THREE.AnimationClip[] = src.userData.animations ?? [];
  return createBennyRuntime(src.clone(true), clips, opts);
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

    // steering lean (roll) + slight yaw into the turn
    lean += (THREE.MathUtils.clamp(st.steer, -1, 1) * 0.28 - lean) * Math.min(1, dt * 6);
    qLean.setFromEuler(eAxis.set(0, -lean * 0.6, -lean));
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

  return { root, setExpression, update, radius: 0.8 };
}
