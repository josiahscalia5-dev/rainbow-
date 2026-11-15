/**
 * Benny lab (benny-character-artist QA page).
 *   /src/characters/benny/benny-lab.html?src=build|glb&views=refs|turntable
 * views=refs      → 3 portrait panels framed like the references: 05 rear (gameplay), 03 front 3/4, 02 dizzy
 * views=turntable → front / three-quarter / side / back / rear-high with full framing
 */
import * as THREE from 'three';
import { createCandyEnvironment, createRenderer } from '../../render/env';
import { buildBenny } from './build';
import { createBennyRuntime, loadBenny } from './runtime';
import type { BennyRuntime } from '../types';

declare global { interface Window { __done?: boolean; __error?: string; __info?: unknown } }

const q = new URLSearchParams(location.search);

async function make(): Promise<BennyRuntime> {
  if (q.get('src') === 'glb') return loadBenny();
  const b = buildBenny();
  return createBennyRuntime(b.scene, b.animations);
}

(async () => {
  try {
    const views = q.get('views') ?? 'refs';
    const panels =
      views === 'refs'
        ? [
            { name: '05-rear', yaw: Math.PI, pitch: 0.24, dist: 4.4, expr: 'happy', swim: 0.8, fov: 40, tumble: false },
            { name: '03-front', yaw: 0.55, pitch: 0.12, dist: 4.2, expr: 'happy', swim: 0.3, fov: 40, tumble: false },
            { name: '02-dizzy', yaw: 0.0, pitch: 0.05, dist: 4.2, expr: 'dizzy', swim: 0, fov: 40, tumble: true },
          ]
        : [
            { name: 'front', yaw: 0, pitch: 0.08, dist: 5.4, expr: 'happy', swim: 0, fov: 35, tumble: false },
            { name: '3q', yaw: Math.PI / 4, pitch: 0.08, dist: 5.4, expr: 'happy', swim: 0, fov: 35, tumble: false },
            { name: 'side', yaw: -Math.PI / 2, pitch: 0.08, dist: 5.4, expr: 'happy', swim: 0, fov: 35, tumble: false },
            { name: 'back', yaw: Math.PI, pitch: 0.08, dist: 5.4, expr: 'happy', swim: 0, fov: 35, tumble: false },
            { name: 'rear-high', yaw: Math.PI * 0.92, pitch: 0.5, dist: 5.4, expr: 'happy', swim: 0.8, fov: 35, tumble: false },
          ];
    const PW = views === 'refs' ? 432 : 360;
    const PH = views === 'refs' ? 768 : 520;
    const W = PW * panels.length, H = PH;
    const canvas = document.getElementById('lab') as HTMLCanvasElement;
    const renderer = createRenderer(canvas, { preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H);
    renderer.setScissorTest(true);
    const scene = new THREE.Scene();
    scene.environment = createCandyEnvironment(renderer);
    scene.background = new THREE.Color(views === 'refs' ? '#c0369c' : '#3a1060');
    scene.add(new THREE.HemisphereLight('#ffe9ff', '#7a2a9c', 1.1));
    const key = new THREE.DirectionalLight('#ffffff', 2.2);
    key.position.set(3, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#9ff6ff', 1.2);
    rim.position.set(-4, 2, -5);
    scene.add(rim);
    // a cyan "water" disc under Benny for colour context in ref views
    if (views === 'refs') {
      const water = new THREE.Mesh(new THREE.CircleGeometry(6, 48), new THREE.MeshStandardMaterial({ color: '#29d8ff', roughness: 0.1, metalness: 0.1, emissive: '#0a6f9a', emissiveIntensity: 0.6 }));
      water.rotation.x = -Math.PI / 2;
      water.position.y = -0.8;
      scene.add(water);
    }
    let i = 0;
    for (const p of panels) {
      const b = await make();
      b.setExpression(p.expr as 'happy' | 'dizzy' | 'peek');
      scene.add(b.root);
      for (let t = 0; t < 0.9; t += 1 / 30) b.update(1 / 30, { swim: p.swim, steer: 0, speed: 10, time: t, tumble: p.tumble });
      if (p.tumble) b.root.rotation.set(-0.25, 0.15, 0.35);
      const target = new THREE.Vector3(0, 0.35, 0);
      const cam = new THREE.PerspectiveCamera(p.fov, PW / PH, 0.01, 100);
      cam.position.set(Math.sin(p.yaw) * Math.cos(p.pitch) * p.dist, target.y + Math.sin(p.pitch) * p.dist, Math.cos(p.yaw) * Math.cos(p.pitch) * p.dist);
      cam.lookAt(target);
      renderer.setViewport(i * PW, 0, PW, PH);
      renderer.setScissor(i * PW, 0, PW, PH);
      renderer.render(scene, cam);
      scene.remove(b.root);
      i++;
    }
    let tris = 0;
    const b = buildBenny();
    b.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) tris += (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3;
    });
    window.__info = { baseTriangles: Math.round(tris) };
  } catch (e) {
    window.__error = String((e as Error)?.stack ?? e);
  }
  window.__done = true;
})();
