/**
 * Water lab — preview the Rainbow water system on the master course.
 *   ?preset=01..11|07mid      camera presets per scene
 *   ?s=<arc-length>&back=4&up=2.5&ahead=10&lookUp=0.6&fov=60   manual chase camera
 *   &t=<seconds> &q=high|low &w=432&h=768 &benny=0|1
 * Sets window.__done / window.__info (draw calls, triangles, avg frame ms) for scripts/water-lab.mjs.
 */
import * as THREE from 'three';
import { Course, WORLD } from '../src/world/course';
import { createCandyEnvironment, createRenderer } from '../src/render/env';
import { createWater, BENNY_RIDE_OFFSET } from '../src/vfx';

declare global {
  interface Window { __done?: boolean; __error?: string; __info?: unknown }
}

const q = new URLSearchParams(location.search);
const W = Number(q.get('w') ?? 432), H = Number(q.get('h') ?? 768);
const quality = (q.get('q') ?? 'high') as 'high' | 'low';

(async () => {
  try {
    const canvas = document.getElementById('lab') as HTMLCanvasElement;
    const renderer = createRenderer(canvas, { preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(W, H, true);
    const scene = new THREE.Scene();
    scene.environment = createCandyEnvironment(renderer);
    scene.fog = new THREE.FogExp2('#ffd9f0', 0.006);
    scene.add(new THREE.HemisphereLight('#ffe9ff', '#7a2a9c', 1.0));
    const key = new THREE.DirectionalLight('#ffffff', 1.6);
    key.position.set(3, 8, 4);
    scene.add(key);

    const course = new Course();
    const water = createWater(course, { quality });
    scene.add(water.group);

    const camera = new THREE.PerspectiveCamera(Number(q.get('fov') ?? 62), W / H, 0.05, 900);
    const preset = q.get('preset');
    const st = (id: string) => course.stage(id as never);
    let s = Number(q.get('s') ?? st('05').s0 + 20);
    let back = Number(q.get('back') ?? 4.2), up = Number(q.get('up') ?? 2.4), ahead = Number(q.get('ahead') ?? 10), lookUp = Number(q.get('lookUp') ?? 0.4);
    let custom: { pos: THREE.Vector3; look: THREE.Vector3 } | null = null;
    const pl = WORLD.platform;
    switch (preset) {
      case '01': s = 0; custom = { pos: new THREE.Vector3(0.7, -1.3, -4.8), look: new THREE.Vector3(-0.3, -0.9, 3.5) }; water.controls.drumAgitation = 0.15; break;
      case '02': s = 12; custom = { pos: new THREE.Vector3(0.2, -1.8, -5.4), look: new THREE.Vector3(0, 0.9, 3.5) }; water.controls.drumSwirl = 1; water.controls.drumAgitation = 1; break;
      case '03': s = st('03').s0 + 4; back = 6.5; up = 6.5; ahead = 9; lookUp = -1; break;
      case '04': s = st('04').s0 + 1.5; back = 4.6; up = 3.4; ahead = 14; lookUp = -1.5; break;
      case '05': s = st('05').s0 + 25; break;
      case '06': s = st('06').s0 + 6; ahead = 14; lookUp = 1.5; break;
      case '07': s = st('07').s0 + 12; break;
      case '07mid': s = (course.marks['07_plunge_top'] + course.marks['07_plunge_bottom']) / 2; back = 4.5; up = 2.2; break;
      case '08': s = st('08').s0 + 2; ahead = 12; break;
      case '09': s = st('09').s0 + 5; ahead = 12; break;
      case '10': s = st('10').s0 + 5; back = 3.8; up = 2.0; ahead = 8; break;
      case '11': s = course.length; custom = { pos: new THREE.Vector3(pl.center.x - 1.5, pl.topY + 3.0, pl.center.z + 15), look: new THREE.Vector3(pl.center.x + 1.5, pl.topY - 1.0, pl.center.z) }; water.controls.outro = 1; break;
    }
    const f = course.sample(s);
    if (custom) {
      camera.position.copy(custom.pos);
      camera.lookAt(custom.look);
    } else {
      camera.position.copy(f.pos).addScaledVector(f.tan, -back).addScaledVector(f.up, up);
      camera.up.copy(f.up);
      camera.lookAt(f.pos.clone().addScaledVector(f.tan, ahead).addScaledVector(f.up, lookUp));
    }
    camera.updateMatrixWorld();

    // backdrop: big magenta gradient shell (no environment geometry exists in the lab)
    const bg = new THREE.Mesh(
      new THREE.SphereGeometry(600, 32, 16),
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader: 'varying vec3 vP; void main(){ float t = vP.y*0.5+0.5; vec3 c = mix(vec3(0.45,0.08,0.45), vec3(0.95,0.45,0.85), t); gl_FragColor = vec4(c,1.0); #include <colorspace_fragment> }',
      }),
    );
    bg.position.copy(camera.position);
    bg.renderOrder = -10;
    scene.add(bg);

    // placeholder Benny (scale/ride-height check only — the real model comes from the character artist)
    if (q.get('benny') !== '0' && !custom) {
      const lat = Number(q.get('lat') ?? 0);
      const t = Number(q.get('t') ?? 3);
      const bp = course.pointAt(s, lat, water.surfaceHeight(s, lat, t) + BENNY_RIDE_OFFSET);
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.8, 32, 20), new THREE.MeshStandardMaterial({ color: '#ff7fc8', roughness: 0.9 }));
      const hat = new THREE.Mesh(new THREE.SphereGeometry(0.84, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5), new THREE.MeshStandardMaterial({ color: '#8a4dff', roughness: 0.8 }));
      hat.position.y = 0.05;
      const pom = new THREE.Mesh(new THREE.SphereGeometry(0.36, 20, 12), new THREE.MeshStandardMaterial({ color: '#8a3cf0', roughness: 0.9 }));
      pom.position.y = 0.95;
      g.add(body, hat, pom);
      g.position.copy(bp);
      g.up.copy(f.up);
      g.lookAt(bp.clone().add(f.tan));
      scene.add(g);
      const fwd = f.tan.clone();
      for (let i = 0; i < 40; i++) water.wake(bp, fwd, f.right, course.prop(s, 'speed'), 1 / 30);
    }

    // simulate to time t so bubbles/spray populate
    const T = Number(q.get('t') ?? 3);
    const dt = 1 / 30;
    let time = 0;
    for (; time < T; time += dt) water.update(time, dt, s, camera);
    renderer.render(scene, camera);
    // perf sample (software GL here — relative numbers only)
    const t0 = performance.now();
    const N = 6;
    for (let i = 0; i < N; i++) { water.update(time, dt, s, camera); renderer.render(scene, camera); }
    const gl = renderer.getContext();
    gl.finish();
    const ms = (performance.now() - t0) / N;
    water.update(T, 0, s, camera);
    renderer.render(scene, camera);
    window.__info = {
      preset, s: +s.toFixed(2), stage: course.stageAtS(s).id,
      calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, points: renderer.info.render.points,
      avgFrameMsSwiftShader: +ms.toFixed(1), ...water.stats(),
    };
  } catch (e) {
    window.__error = String((e as Error)?.stack ?? e);
    console.error(e);
  }
  window.__done = true;
})();
