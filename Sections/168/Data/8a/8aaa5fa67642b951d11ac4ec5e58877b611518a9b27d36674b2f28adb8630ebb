/**
 * Girl lab — close-up identity review renders (face, hair, outfit) for the cartoon-girl specialist.
 *   ?src=build|glb  &anim=<clip>&t=<s>  &layout=identity|poses
 * identity: full front | face front | face 3/4 | back (ponytail) | side
 */
import * as THREE from 'three';
import { createCandyEnvironment, createRenderer } from '../../render/env';
import { buildGirl } from './build';
import { loadGirl } from './runtime';

declare global { interface Window { __done?: boolean; __error?: string; __info?: unknown } }

const q = new URLSearchParams(location.search);

(async () => {
  try {
    const W = 2000, H = 640;
    const canvas = document.getElementById('lab') as HTMLCanvasElement;
    canvas.width = W; canvas.height = H;
    const renderer = createRenderer(canvas, { preserveDrawingBuffer: true });
    renderer.setSize(W, H, false);
    renderer.setScissorTest(true);
    const scene = new THREE.Scene();
    scene.environment = createCandyEnvironment(renderer);
    scene.background = new THREE.Color('#3a1060');
    scene.add(new THREE.HemisphereLight('#fff0ff', '#7a2a9c', 1.1));
    const key = new THREE.DirectionalLight('#fff6ec', 2.4);
    key.position.set(4, 8, 7);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#ff9be6', 1.2);
    rim.position.set(-6, 5, -6);
    scene.add(rim);

    let root: THREE.Object3D;
    let tick: (dt: number) => void;
    const anim = q.get('anim') ?? 'idle';
    if (q.get('src') === 'glb') {
      const g = await loadGirl();
      root = g.root;
      g.play(anim, { fade: 0 });
      tick = g.update;
    } else {
      const b = buildGirl();
      root = b.scene;
      const mixer = new THREE.AnimationMixer(b.scene);
      const clip = b.animations.find((c) => c.name === anim)!;
      const a = mixer.clipAction(clip);
      if (['dropLoad', 'closeDoor', 'leanReachTowel'].includes(anim)) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; }
      a.play();
      tick = (dt) => mixer.update(dt);
    }
    scene.add(root);
    const tReq = Number(q.get('t') ?? 0.4);
    for (let t = 0; t < tReq; t += 1 / 30) tick(1 / 30);
    root.updateMatrixWorld(true);

    const head = root.getObjectByName('headCenter')!;
    const hp = head.getWorldPosition(new THREE.Vector3());
    const box = new THREE.Box3().setFromObject(root);
    const c = box.getCenter(new THREE.Vector3());
    type View = { pos: THREE.Vector3; look: THREE.Vector3; fov: number; w: number };
    const views: View[] = q.get('layout') === 'poses'
      ? [
          { pos: c.clone().add(new THREE.Vector3(0, 2, 46)), look: c, fov: 38, w: 1 },
          { pos: c.clone().add(new THREE.Vector3(32, 4, 32)), look: c, fov: 38, w: 1 },
          { pos: c.clone().add(new THREE.Vector3(46, 2, 0)), look: c, fov: 38, w: 1 },
          { pos: hp.clone().add(new THREE.Vector3(0, -1, 13)), look: hp.clone().add(new THREE.Vector3(0, -1, 0)), fov: 40, w: 1 },
        ]
      : [
          { pos: c.clone().add(new THREE.Vector3(0, 2, 44)), look: c, fov: 38, w: 0.8 },
          { pos: hp.clone().add(new THREE.Vector3(0, 0.6, 11)), look: hp.clone().add(new THREE.Vector3(0, 0.4, 0)), fov: 40, w: 1.1 },
          { pos: hp.clone().add(new THREE.Vector3(8.5, 1.2, 7.5)), look: hp.clone().add(new THREE.Vector3(0, 0.6, -0.5)), fov: 40, w: 1.1 },
          { pos: hp.clone().add(new THREE.Vector3(1.5, 2.5, -13)), look: hp.clone().add(new THREE.Vector3(0, 0.5, -1.5)), fov: 42, w: 1 },
          { pos: c.clone().add(new THREE.Vector3(-44, 2, 0)), look: c, fov: 38, w: 0.8 },
        ];
    const total = views.reduce((s, v) => s + v.w, 0);
    let x = 0;
    for (const v of views) {
      const vw = Math.round((v.w / total) * W);
      const cam = new THREE.PerspectiveCamera(v.fov, vw / H, 0.05, 500);
      cam.position.copy(v.pos);
      cam.lookAt(v.look);
      renderer.setViewport(x, 0, vw, H);
      renderer.setScissor(x, 0, vw, H);
      renderer.render(scene, cam);
      x += vw;
    }
    const hl = root.getObjectByName('handL')!.getWorldPosition(new THREE.Vector3());
    const hr = root.getObjectByName('handR')!.getWorldPosition(new THREE.Vector3());
    let tris = 0, meshes = 0;
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) { meshes++; const g = m.geometry; tris += (g.index ? g.index.count : g.getAttribute('position').count) / 3; }
    });
    window.__info = { box: [box.min.toArray().map((n) => +n.toFixed(2)), box.max.toArray().map((n) => +n.toFixed(2))], head: hp.toArray().map((n) => +n.toFixed(2)), handL: hl.toArray().map((n) => +n.toFixed(2)), handR: hr.toArray().map((n) => +n.toFixed(2)), tris: Math.round(tris), meshes };
  } catch (e) {
    window.__error = String((e as Error)?.stack ?? e);
  }
  window.__done = true;
})();
