/**
 * Runtime loader for the ONE official cartoon girl (assets/models/rainbow_girl.glb).
 * Same model/rig is used in scene 01 (walk away), 10 (seen through the door) and 11 (leans in, holds towel).
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GirlRuntime } from '../types';

const ONCE = new Set(['dropLoad', 'closeDoor', 'leanReachTowel', 'blink']);
const EYELID_CLOSED_X = THREE.MathUtils.degToRad(84);

export async function loadGirl(url = new URL('../../../assets/models/rainbow_girl.glb', import.meta.url).href): Promise<GirlRuntime> {
  const gltf = await new GLTFLoader().loadAsync(url);
  const model = gltf.scene;
  const root = new THREE.Group();
  root.name = 'girl';
  root.add(model);

  model.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    m.castShadow = false;
    m.receiveShadow = false;
    m.frustumCulled = false; // rigid parts move a lot under joints; tiny cost for one character
    const mat = m.material as THREE.MeshStandardMaterial;
    if (m.name.startsWith('eyeball')) {
      // glossy wet eyes
      const phys = new THREE.MeshPhysicalMaterial({ map: mat.map, roughness: 0.05, clearcoat: 1, clearcoatRoughness: 0.03 });
      m.material = phys;
    } else if (m.name === 'face_decal') {
      mat.depthWrite = false;
      mat.polygonOffset = true;
      mat.polygonOffsetFactor = -2;
      m.renderOrder = 2;
    } else if (mat && mat.name === '' && mat.metalness > 0.8) {
      mat.envMapIntensity = 1.4;
    }
  });

  const mixer = new THREE.AnimationMixer(model);
  const actions = new Map<string, THREE.AnimationAction>();
  for (const clip of gltf.animations) actions.set(clip.name, mixer.clipAction(clip));
  let current: THREE.AnimationAction | null = null;

  const lidL = model.getObjectByName('eyelidL')!;
  const lidR = model.getObjectByName('eyelidR')!;
  const restL = lidL.rotation.x;
  const restR = lidR.rotation.x;
  let t = 0;
  let nextBlink = 1.2 + Math.random() * 2;
  let blinkStart = -10;

  const play: GirlRuntime['play'] = (name, opts = {}) => {
    const a = actions.get(name);
    if (!a) {
      console.warn(`girl: unknown clip ${name}`);
      return;
    }
    const fade = opts.fade ?? 0.35;
    const once = opts.loop === false || (opts.loop === undefined && ONCE.has(name));
    a.reset();
    a.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    a.clampWhenFinished = once;
    a.timeScale = opts.timeScale ?? 1;
    a.enabled = true;
    a.setEffectiveWeight(1);
    if (current && current !== a && fade > 0) {
      a.play();
      current.crossFadeTo(a, fade, false);
    } else {
      if (current && current !== a) current.stop();
      a.play();
    }
    current = a;
  };

  const update = (dt: number) => {
    t += dt;
    mixer.update(dt);
    // procedural blink (eyelids are not driven by the body clips)
    if (t > nextBlink) {
      blinkStart = t;
      nextBlink = t + 2.2 + Math.random() * 3.2;
      if (Math.random() < 0.18) nextBlink = t + 0.32; // occasional double blink
    }
    const b = (t - blinkStart) / 0.2;
    const k = b >= 0 && b <= 1 ? Math.sin(Math.PI * b) : 0;
    lidL.rotation.x = restL + (EYELID_CLOSED_X - restL) * k;
    lidR.rotation.x = restR + (EYELID_CLOSED_X - restR) * k;
  };

  return {
    root,
    mixer,
    play,
    update,
    handL: model.getObjectByName('handL')!,
    handR: model.getObjectByName('handR')!,
  };
}
