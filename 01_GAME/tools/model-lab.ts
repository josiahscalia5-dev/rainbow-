/**
 * Model lab — used by scripts/export-models.mjs (Playwright) and by hand in the browser.
 *   ?model=benny|girl&mode=export      build procedurally → GLB (window.__glbBase64)
 *   ?model=benny|girl&mode=turntable   load the exported GLB through the runtime loader and render
 *                                      front / side / back / three-quarter views in one strip
 *   &anim=<clip>&t=<seconds>           pose a clip at a time (turntable)
 */
import * as THREE from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { createCandyEnvironment, createRenderer } from '../src/render/env';
import type { BuiltModel } from '../src/characters/types';

declare global {
  interface Window { __glbBase64?: string; __done?: boolean; __error?: string; __info?: unknown }
}

const q = new URLSearchParams(location.search);
const model = q.get('model') ?? 'benny';
const mode = q.get('mode') ?? 'turntable';

const builders: Record<string, () => Promise<BuiltModel>> = {
  benny: async () => (await import('../src/characters/benny/build')).buildBenny(),
  girl: async () => (await import('../src/characters/girl/build')).buildGirl(),
};

async function exportGlb() {
  const built = await builders[model]();
  const exporter = new GLTFExporter();
  const buf = (await exporter.parseAsync(built.scene, {
    binary: true,
    animations: built.animations,
    onlyVisible: false,
    maxTextureSize: 1024,
  })) as ArrayBuffer;
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  window.__glbBase64 = btoa(bin);
  let meshes = 0, nodes = 0;
  built.scene.traverse((o) => { nodes++; if ((o as THREE.Mesh).isMesh) meshes++; });
  window.__info = { bytes: bytes.length, meshes, nodes, clips: built.animations.map((a) => `${a.name}(${a.duration.toFixed(2)}s)`) };
}

async function turntable() {
  const W = 1600, H = 560;
  const canvas = document.getElementById('lab') as HTMLCanvasElement;
  canvas.width = W; canvas.height = H;
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  const renderer = createRenderer(canvas, { preserveDrawingBuffer: true });
  renderer.setSize(W, H, false);
  renderer.setScissorTest(true);
  const scene = new THREE.Scene();
  scene.environment = createCandyEnvironment(renderer);
  scene.background = new THREE.Color('#3a1060');
  scene.add(new THREE.HemisphereLight('#ffe9ff', '#7a2a9c', 1.2));
  const key = new THREE.DirectionalLight('#ffffff', 2.2);
  key.position.set(3, 6, 5);
  scene.add(key);

  let root: THREE.Object3D;
  let height = 2;
  let tick: (dt: number, t: number) => void = () => {};
  if (model === 'benny') {
    const { loadBenny } = await import('../src/characters/benny/runtime');
    const b = await loadBenny();
    root = b.root;
    height = 2.6;
    const expr = q.get('expr') as 'happy' | 'dizzy' | 'peek' | null;
    if (expr) b.setExpression(expr);
    tick = (dt, t) => b.update(dt, { swim: Number(q.get('swim') ?? 0.6), steer: 0, speed: 10, time: t });
  } else {
    const { loadGirl } = await import('../src/characters/girl/runtime');
    const g = await loadGirl();
    root = g.root;
    height = 27;
    g.play(q.get('anim') ?? 'idle', { fade: 0 });
    tick = (dt) => g.update(dt);
  }
  scene.add(root);
  // advance animation to requested time
  const tReq = Number(q.get('t') ?? 0.5);
  for (let t = 0; t < tReq; t += 1 / 30) tick(1 / 30, t);

  const views: [string, number][] = [['front', 0], ['three-quarter', Math.PI / 4], ['side', Math.PI / 2], ['back', Math.PI]];
  const vw = W / views.length;
  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  const dist = height * 1.55;
  views.forEach(([, yaw], i) => {
    const cam = new THREE.PerspectiveCamera(35, vw / H, 0.01, 500);
    cam.position.set(center.x + Math.sin(yaw) * dist, center.y + height * 0.08, center.z + Math.cos(yaw) * dist);
    cam.lookAt(center);
    renderer.setViewport(i * vw, 0, vw, H);
    renderer.setScissor(i * vw, 0, vw, H);
    renderer.render(scene, cam);
  });
  window.__info = { box: { min: box.min.toArray(), max: box.max.toArray() } };
}

(async () => {
  try {
    if (mode === 'export') await exportGlb(); else await turntable();
  } catch (e) {
    window.__error = String((e as Error)?.stack ?? e);
    console.error(e);
  }
  window.__done = true;
})();
