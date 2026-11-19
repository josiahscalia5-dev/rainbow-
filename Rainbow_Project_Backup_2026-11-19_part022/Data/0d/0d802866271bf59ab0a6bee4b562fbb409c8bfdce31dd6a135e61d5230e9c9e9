/**
 * Benny lab (benny-character-artist QA page).
 *   /src/characters/benny/benny-lab.html?src=build|glb&views=refs|turntable|game[&quality=low]
 * views=refs      → 3 portrait panels framed like the references: 05 rear (gameplay), 03 front 3/4, 02 dizzy
 * views=turntable → front / three-quarter / side / back / rear-high with full framing
 * views=game      → the stage-05 ride camera exactly as in Game/cameraRig (back 6.4, up 4.1, look 18 ahead
 *                   1.8 up, fov 62, 9:16) + a lower reference-like rear camera + rear 3/4 + front, with an
 *                   opaque water plane at the game's ride height (root = water + radius·0.55)
 */
import * as THREE from 'three';
import { createCandyEnvironment, createRenderer } from '../../render/env';
import { buildBenny } from './build';
import { BENNY_RIDE_LIFT, createBennyRuntime, loadBenny } from './runtime';
import type { BennyRuntime } from '../types';

declare global { interface Window { __done?: boolean; __error?: string; __info?: unknown } }

const q = new URLSearchParams(location.search);
const furQuality = q.get('quality') === 'low' ? 'low' : 'high';

async function make(): Promise<BennyRuntime> {
  if (q.get('src') === 'glb') return loadBenny({ furQuality });
  const b = buildBenny();
  return createBennyRuntime(b.scene, b.animations, { furQuality });
}

interface Panel {
  name: string;
  yaw: number;
  pitch: number;
  dist: number;
  expr: string;
  swim: number;
  fov: number;
  tumble: boolean;
  /** explicit camera (Benny root at origin, faces +Z); overrides yaw/pitch/dist */
  cam?: { pos: [number, number, number]; target: [number, number, number] };
}

(async () => {
  try {
    const views = q.get('views') ?? 'refs';
    const RIDE = 0.8 * 0.55; // Game.ts: root = water surface + benny.radius * 0.55
    const panels: Panel[] =
      views === 'refs'
        ? [
            { name: '05-rear', yaw: Math.PI, pitch: 0.24, dist: 4.4, expr: 'happy', swim: 0.8, fov: 40, tumble: false },
            { name: '03-front', yaw: 0.55, pitch: 0.12, dist: 4.2, expr: 'happy', swim: 0.3, fov: 40, tumble: false },
            { name: '02-dizzy', yaw: 0.0, pitch: 0.05, dist: 4.2, expr: 'dizzy', swim: 0, fov: 40, tumble: true },
          ]
        : views === 'measure'
          ? // proportion check: rear views at the ride height (lifted) at 12° / 18° / 24° / 28° camera elevation,
            // chroma-green background + water so a colour mask separates Benny (qa/pilot05/benny measure script)
            [12, 18, 24, 28].map((deg) => ({ name: `rear-${deg}`, yaw: Math.PI, pitch: THREE.MathUtils.degToRad(deg), dist: 6.4, expr: 'happy', swim: 1, fov: 36, tumble: false }))
        : views === 'game'
          ? [
              // stage 05 ride camera (cameraRig STAGE_CAM['05'])
              { name: 'game05', yaw: 0, pitch: 0, dist: 0, expr: 'happy', swim: 1, fov: 62, tumble: false, cam: { pos: [0, 4.1 - RIDE, -6.4], target: [0, 1.8 - RIDE, 18] } },
              // reference-like rear camera (ref 05/07/10: ~15–20° above Benny)
              { name: 'ref-rear', yaw: Math.PI, pitch: 0.3, dist: 6.0, expr: 'happy', swim: 1, fov: 45, tumble: false },
              { name: 'rear-3q', yaw: Math.PI * 0.78, pitch: 0.22, dist: 6.0, expr: 'happy', swim: 1, fov: 45, tumble: false },
              { name: 'front', yaw: 0.35, pitch: 0.1, dist: 6.0, expr: 'happy', swim: 0.3, fov: 45, tumble: false },
            ]
          : [
              { name: 'front', yaw: 0, pitch: 0.08, dist: 5.4, expr: 'happy', swim: 0, fov: 35, tumble: false },
              { name: '3q', yaw: Math.PI / 4, pitch: 0.08, dist: 5.4, expr: 'happy', swim: 0, fov: 35, tumble: false },
              { name: 'side', yaw: -Math.PI / 2, pitch: 0.08, dist: 5.4, expr: 'happy', swim: 0, fov: 35, tumble: false },
              { name: 'back', yaw: Math.PI, pitch: 0.08, dist: 5.4, expr: 'happy', swim: 0, fov: 35, tumble: false },
              { name: 'rear-high', yaw: Math.PI * 0.92, pitch: 0.5, dist: 5.4, expr: 'happy', swim: 0.8, fov: 35, tumble: false },
            ];
    const measure = views === 'measure';
    const PW = views === 'refs' || views === 'game' || measure ? 432 : 360;
    const PH = views === 'refs' || views === 'game' || measure ? 768 : 520;
    const W = PW * panels.length, H = PH;
    const canvas = document.getElementById('lab') as HTMLCanvasElement;
    const renderer = createRenderer(canvas, { preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H);
    renderer.setScissorTest(true);
    const scene = new THREE.Scene();
    scene.environment = createCandyEnvironment(renderer);
    scene.background = new THREE.Color(views === 'turntable' ? '#3a1060' : measure ? '#00ff00' : '#c0369c');
    scene.add(new THREE.HemisphereLight('#ffe9ff', '#7a2a9c', 1.1));
    const key = new THREE.DirectionalLight('#ffffff', 2.2);
    key.position.set(3, 6, 5);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#9ff6ff', 1.2);
    rim.position.set(-4, 2, -5);
    scene.add(rim);
    // an opaque cyan "water" plane at the game's ride height (refs / game views)
    if (views !== 'turntable') {
      const water = new THREE.Mesh(
        new THREE.CircleGeometry(40, 64),
        measure
          ? new THREE.MeshBasicMaterial({ color: '#00ff00' })
          : new THREE.MeshStandardMaterial({ color: '#29d8ff', roughness: 0.1, metalness: 0.1, emissive: '#0a6f9a', emissiveIntensity: 0.6 }),
      );
      water.rotation.x = -Math.PI / 2;
      // game view: exact game placement (the runtime lifts him while swimming); refs view: lifted ride height
      // (measure: the game's real placement, root = water + RIDE; the runtime adds the ride lift itself)
      water.position.y = views === 'game' || measure ? -RIDE : -(RIDE + BENNY_RIDE_LIFT);
      scene.add(water);
    }
    let i = 0;
    for (const p of panels) {
      const b = await make();
      b.setExpression(p.expr as 'happy' | 'dizzy' | 'peek');
      scene.add(b.root);
      for (let t = 0; t < 0.9; t += 1 / 30) b.update(1 / 30, { swim: p.swim, steer: 0, speed: 10, time: t, tumble: p.tumble });
      if (p.tumble) b.root.rotation.set(-0.25, 0.15, 0.35);
      const cam = new THREE.PerspectiveCamera(p.fov, PW / PH, 0.01, 200);
      if (p.cam) {
        cam.position.set(...p.cam.pos);
        cam.lookAt(new THREE.Vector3(...p.cam.target));
      } else {
        const target = new THREE.Vector3(0, 0.35, 0);
        cam.position.set(Math.sin(p.yaw) * Math.cos(p.pitch) * p.dist, target.y + Math.sin(p.pitch) * p.dist, Math.cos(p.yaw) * Math.cos(p.pitch) * p.dist);
        cam.lookAt(target);
      }
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
    window.__info = { baseTriangles: Math.round(tris), furQuality };
  } catch (e) {
    window.__error = String((e as Error)?.stack ?? e);
  }
  window.__done = true;
})();
