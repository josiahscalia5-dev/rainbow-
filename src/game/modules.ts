/**
 * Loads the specialist modules (water, Benny, girl) when present; otherwise returns simple stand-ins
 * so the world/gameplay can be developed and tested independently. Stand-ins are logged loudly and
 * reported in window.__rainbow.stats().modules so QA never mistakes them for final assets.
 */
import * as THREE from 'three';
import type { Course } from '../world/course';
import type { BennyRuntime, GirlRuntime } from '../characters/types';

export interface WaterLike {
  group: THREE.Group;
  update(time: number, dt: number, focusS: number, camera: THREE.Camera): void;
  surfaceHeight(s: number, lateral: number, time: number): number;
  wake(pos: THREE.Vector3, forward: THREE.Vector3, right: THREE.Vector3, speed: number, dt: number): void;
  splash(pos: THREE.Vector3, up: THREE.Vector3, strength: number): void;
}

const vfxMods = import.meta.glob('../vfx/index.ts');
const bennyMods = import.meta.glob('../characters/benny/runtime.ts');
const girlMods = import.meta.glob('../characters/girl/runtime.ts');

export const moduleStatus: Record<string, string> = {};

export async function loadWater(course: Course): Promise<WaterLike> {
  const f = Object.values(vfxMods)[0];
  if (f) {
    try {
      const m = (await f()) as { createWater: (c: Course, o?: { quality?: 'high' | 'low' }) => WaterLike };
      // Android/mobile defaults to the low tier (measured budgets: see qa/performance.md); ?quality= overrides
      const qp = new URLSearchParams(location.search).get('quality');
      const mobile = /Android|iPhone|iPad/i.test(navigator.userAgent);
      const q = qp === 'low' || (qp !== 'high' && mobile) ? 'low' : 'high';
      const w = m.createWater(course, { quality: q });
      // `?proj05=1` only: wait for the baked approved-water textures (undefined → nothing to wait for)
      const ready = (w as { ready?: Promise<void> }).ready;
      if (ready) await ready;
      moduleStatus.water = 'vfx/index.ts';
      return w;
    } catch (e) {
      console.error('[rainbow] water module failed, using stand-in', e);
    }
  }
  moduleStatus.water = 'STAND-IN';
  return standInWater(course);
}

export async function loadBennyRuntime(): Promise<BennyRuntime> {
  const f = Object.values(bennyMods)[0];
  if (f) {
    try {
      const m = (await f()) as { loadBenny: () => Promise<BennyRuntime> };
      const b = await m.loadBenny();
      moduleStatus.benny = 'assets/models/benny.glb';
      return b;
    } catch (e) {
      console.error('[rainbow] Benny module failed, using stand-in', e);
    }
  }
  moduleStatus.benny = 'STAND-IN';
  return standInBenny();
}

export async function loadGirlRuntime(): Promise<GirlRuntime> {
  const f = Object.values(girlMods)[0];
  if (f) {
    try {
      const m = (await f()) as { loadGirl: () => Promise<GirlRuntime> };
      const g = await m.loadGirl();
      moduleStatus.girl = 'assets/models/rainbow_girl.glb';
      return g;
    } catch (e) {
      console.error('[rainbow] girl module failed, using stand-in', e);
    }
  }
  moduleStatus.girl = 'STAND-IN';
  return standInGirl();
}

// ---------------------------------------------------------------------------------------
function standInWater(course: Course): WaterLike {
  const s0 = course.stage('03').s0 - 2, s1 = course.length;
  const n = Math.ceil((s1 - s0) / 0.5);
  const pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= n; i++) {
    const s = s0 + ((s1 - s0) * i) / n;
    const f = course.sample(s);
    const w = course.widthAt(s) / 2;
    for (const k of [-1, 1]) {
      const p = f.pos.clone().addScaledVector(f.right, k * w);
      pos.push(p.x, p.y, p.z);
    }
    if (i < n) idx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: '#29d6ff', emissive: '#19a6ff', emissiveIntensity: 0.5, roughness: 0.1, metalness: 0.1, side: THREE.DoubleSide }));
  const group = new THREE.Group();
  group.add(mesh);
  return { group, update() {}, surfaceHeight: () => 0, wake() {}, splash() {} };
}

function standInBenny(): BennyRuntime {
  const root = new THREE.Group();
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 24), new THREE.MeshStandardMaterial({ color: '#ff7ec4', roughness: 0.9 }));
  const hat = new THREE.Mesh(new THREE.SphereGeometry(0.84, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#7d3ff0' }));
  hat.position.y = 0.12;
  const pom = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 16), new THREE.MeshStandardMaterial({ color: '#7a2de0' }));
  pom.position.y = 1.15;
  root.add(body, hat, pom);
  return { root, radius: 0.8, setExpression() {}, update() {} };
}

function standInGirl(): GirlRuntime {
  const root = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({ color: '#c9a6f0' });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(3.2, 13, 8, 16), mat);
  body.position.y = 9.6;
  const head = new THREE.Mesh(new THREE.SphereGeometry(3.4, 24, 16), new THREE.MeshStandardMaterial({ color: '#f2b48a' }));
  head.position.y = 21.5;
  root.add(body, head);
  const handL = new THREE.Object3D(), handR = new THREE.Object3D();
  handL.position.set(2.5, 12, 3);
  handR.position.set(-2.5, 12, 3);
  root.add(handL, handR);
  const mixer = new THREE.AnimationMixer(root);
  return { root, mixer, play() {}, update(dt) { mixer.update(dt); }, handL, handR };
}
