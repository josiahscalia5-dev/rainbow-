/**
 * Round 31 Benny lab (QA only, not part of the game): renders ONE Benny model from behind with the game's lighting and
 * colour chain (candy environment, hemisphere + sun + fill, Neutral tone mapping 0.86, the game's grade pass), on a
 * transparent background, so it can be fitted to the approved Screen 06 Benny at the same rear angle and size.
 *   /src/characters/benny/benny31-lab.html?model=current            the game's default 3D Benny (benny.glb + shell fur)
 *   /src/characters/benny/benny31-lab.html?model=current&benny05=1  the same with the approved-05 maps switch
 *   /src/characters/benny/benny31-lab.html?model=<url of a .glb>    any generated model
 * window.__lab.render({ yaw, pitch, w, h }) -> PNG data URL (yaw 0 = camera on +Z looking at -Z; pitch = degrees above)
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { createCandyEnvironment } from '../../render/env';
import { createGradePass } from '../../render/grade';
import { loadBenny } from './runtime';

declare global { interface Window { __lab?: unknown; __error?: string } }
const q = new URLSearchParams(location.search);
const canvas = document.getElementById('lab') as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 0.86;
renderer.setPixelRatio(1);
renderer.setClearColor(0x000000, 0);
const scene = new THREE.Scene();
scene.environment = createCandyEnvironment(renderer);
scene.add(new THREE.HemisphereLight('#fff0ff', '#a33bb8', 1.15));
const sun = new THREE.DirectionalLight('#fff4e6', 1.6);
scene.add(sun, sun.target);
const fill = new THREE.PointLight('#ffd8ff', 30, 30, 1.6);
scene.add(fill);
const cam = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
const composer = new EffectComposer(renderer);
const rp = new RenderPass(scene, cam); rp.clearAlpha = 0;
composer.addPass(rp); composer.addPass(new OutputPass()); composer.addPass(createGradePass());
const holder = new THREE.Group(); scene.add(holder);
const center = new THREE.Vector3(); let radius = 1;
let tick: ((t: number) => void) | null = null;

async function load() {
  const m = q.get('model') ?? 'current';
  if (m === 'current') {
    const b = await loadBenny({ furQuality: 'high' });
    holder.add(b.root);
    // ride pose as in the game (swim 1, no steering): settle the springs, then hold the clip at t
    tick = (t) => { for (let i = 0; i < 30; i++) b.update(1 / 60, { swim: 1, steer: 0, speed: 11, time: t }); };
    tick(12);
    // the root faces +Z and the game camera is behind him (on -Z): yaw 180 = his back
  } else {
    const g = await new GLTFLoader().loadAsync(m);
    holder.add(g.scene);
    // `&bake=<png>&K=<n>`: unlit material = the baked approved colours (texture x K, linear), as the game will use it
    const bake = q.get('bake');
    if (bake) {
      const t = await new THREE.TextureLoader().loadAsync(bake);
      t.colorSpace = THREE.SRGBColorSpace; t.flipY = false; t.anisotropy = 8;
      const K = Number(q.get('K') ?? 4);
      g.scene.traverse((o) => { const me = o as THREE.Mesh; if (me.isMesh) me.material = new THREE.MeshBasicMaterial({ map: t, color: new THREE.Color(K, K, K), fog: false }); });
    }
  }
  holder.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(holder);
  box.getCenter(center); radius = box.getSize(new THREE.Vector3()).length() / 2;
}

function render(o: { yaw: number; pitch: number; w?: number; h?: number; fov?: number; black?: boolean }) {
  const w = o.w ?? 768, h = o.h ?? 768;
  renderer.setSize(w, h, false); composer.setSize(w, h);
  cam.aspect = w / h; cam.fov = o.fov ?? 30; cam.updateProjectionMatrix();
  const yaw = THREE.MathUtils.degToRad(o.yaw), pitch = THREE.MathUtils.degToRad(o.pitch);
  const dist = radius / Math.sin(THREE.MathUtils.degToRad(cam.fov / 2)) * 1.05;
  cam.position.set(center.x + Math.sin(yaw) * Math.cos(pitch) * dist, center.y + Math.sin(pitch) * dist, center.z + Math.cos(yaw) * Math.cos(pitch) * dist);
  cam.lookAt(center);
  // game lighting relation: sun high and slightly in front of the camera's view direction, fill at the camera
  const fwd = center.clone().sub(cam.position).normalize();
  sun.position.copy(center).add(new THREE.Vector3(0.3, 1, 0.45).multiplyScalar(10));
  sun.target.position.copy(cam.position).add(new THREE.Vector3(0, -10, -10).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw + Math.PI).add(fwd.multiplyScalar(0)));
  fill.position.copy(cam.position);
  // black = opaque black background through the same chain (post(0) = 0): edge pixels come out as display colour x coverage,
  // free of the brightening that the transparent path gives premultiplied edge pixels
  renderer.setClearColor(0x000000, o.black ? 1 : 0); rp.clearAlpha = o.black ? 1 : 0;
  composer.render();
  return canvas.toDataURL('image/png');
}
/** UV pass: per pixel (u, v, facing = view-space normal z, 1) of the front-most surface, Float32 RGBA as base64 */
const uvMat = new THREE.ShaderMaterial({
  vertexShader: 'varying vec2 vUv; varying vec3 vN; void main(){ vUv = uv; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'varying vec2 vUv; varying vec3 vN; void main(){ gl_FragColor = vec4(vUv, abs(normalize(vN).z), 1.0); }',
  side: THREE.DoubleSide,
});
function uv(o: { yaw: number; pitch: number; w: number; h: number }) {
  render({ ...o }); // sets the camera exactly as render()
  const rt = new THREE.WebGLRenderTarget(o.w, o.h, { type: THREE.FloatType, depthBuffer: true });
  const saved = new Map<THREE.Mesh, THREE.Material | THREE.Material[]>();
  holder.traverse((x) => { const me = x as THREE.Mesh; if (me.isMesh) { saved.set(me, me.material); me.material = uvMat; } });
  const env = scene.environment; scene.environment = null;
  renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, cam); renderer.setRenderTarget(null);
  scene.environment = env;
  for (const [me, mt] of saved) me.material = mt;
  const buf = new Float32Array(o.w * o.h * 4); renderer.readRenderTargetPixels(rt, 0, 0, o.w, o.h, buf); rt.dispose();
  const u8 = new Uint8Array(buf.buffer); let bin = ''; for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode(...u8.subarray(i, i + 0x8000));
  return btoa(bin);
}
load().then(() => { window.__lab = { render, uv, ready: true }; }).catch((e) => { window.__error = String(e); });
