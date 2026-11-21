/**
 * `?benny31=1` — the IMPROVED 3D Benny (round 31, qa/benny/r31/README.md): a real 3D mesh rebuilt from the user's approved
 * Screen 06 Benny (Hunyuan3D 2, 40 k triangles) wearing the approved Benny's own colours (baked through the game's colour
 * chain: unlit texture x 4 shows the approved pixels after tone mapping + grade). It replaces the old model's visible parts
 * inside the SAME runtime, so the game moves him exactly as before (swim clip bob, ride lift / pitch, steering lean + yaw,
 * root placement on the river, wake / splashes). On top of that, motion the single-piece mesh does in its vertex shader:
 *   - paddling: both side arms stroke (fore/aft + up/down), alternating left / right, with the swim weight;
 *   - pom-pom: follows the runtime's pom spring (vertical acceleration, steering, speed jitter);
 *   - squash-and-stretch with each stroke.
 * Off (default): nothing here loads or runs; the old Benny is untouched.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { flag05 } from '../../vfx/waterRibbon';

export const BENNY31: boolean = flag05('benny31');
const GLB = new URL('../../../assets/models/benny31.glb', import.meta.url).href;
const BAKE = new URL('../../../assets/textures/benny31/bake.png', import.meta.url).href;
const K = 4; // bake.py: texture holds linear radiance / 4

export interface Benny31Assets { geometry: THREE.BufferGeometry; map: THREE.Texture }

export async function loadBenny31(): Promise<Benny31Assets> {
  const [gltf, map] = await Promise.all([new GLTFLoader().loadAsync(GLB), new THREE.TextureLoader().loadAsync(BAKE)]);
  map.colorSpace = THREE.SRGBColorSpace; map.flipY = false; map.anisotropy = 8;
  let geometry: THREE.BufferGeometry | null = null;
  gltf.scene.traverse((o) => { const m = o as THREE.Mesh; if (m.isMesh && !geometry) geometry = m.geometry; });
  return { geometry: geometry!, map };
}

/** mesh-local regions (model units, height ≈ 0.99, rear design on +Z): arms = side lumps, pom-pom = top */
const VERT_HEAD = /* glsl */ `
uniform float uT; uniform float uSwim; uniform vec2 uPom;
vec3 b31rot(vec3 r, vec3 ax, float a){ float c = cos(a), s = sin(a); return r * c + cross(ax, r) * s + ax * dot(ax, r) * (1.0 - c); }
`;
const VERT_BODY = /* glsl */ `
vec3 p = position;
// arms: alternating doggy-paddle stroke around each shoulder
float side = p.x >= 0.0 ? 1.0 : -1.0;
float wa = smoothstep(0.29, 0.36, abs(p.x)) * (1.0 - smoothstep(0.10, 0.18, abs(p.y + 0.19)));
float ph = uT * 6.5 + (side > 0.0 ? 0.0 : 3.14159);
vec3 piv = vec3(side * 0.30, -0.19, 0.0);
vec3 q = p - piv;
// a big visible stroke: the paw sweeps up out of the water and back down (seen from behind), plus fore / aft
q = b31rot(q, vec3(0.0, 0.0, 1.0), side * uSwim * wa * (0.25 + 0.75 * sin(ph)));
q = b31rot(q, vec3(0.0, 1.0, 0.0), side * uSwim * wa * 0.6 * cos(ph));
p = piv + q;
p.y += uSwim * wa * 0.05 * max(0.0, sin(ph));
// pom-pom on the runtime's spring
float wp = smoothstep(0.17, 0.27, p.y);
vec3 pp = vec3(0.0, 0.19, 0.05);
vec3 r = p - pp;
r = b31rot(r, vec3(1.0, 0.0, 0.0), uPom.x * wp);
r = b31rot(r, vec3(0.0, 0.0, 1.0), uPom.y * wp);
p = pp + r;
// squash with the stroke (bottom stays on the water)
float sq = 1.0 + 0.03 * uSwim * sin(uT * 15.0);
p.y = (p.y + 0.5) * sq - 0.5; p.xz /= sqrt(sq);
vec3 transformed = p;
`;

export function attachBenny31(body: THREE.Object3D, scene: THREE.Object3D, A: Benny31Assets) {
  const mat = new THREE.MeshBasicMaterial({ map: A.map, color: new THREE.Color(K, K, K), fog: false });
  const uniforms = { uT: { value: 0 }, uSwim: { value: 0 }, uPom: { value: new THREE.Vector2() } };
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\n' + VERT_HEAD).replace('#include <begin_vertex>', VERT_BODY);
  };
  mat.customProgramCacheKey = () => 'benny31';
  // fit: the old Benny's visible extent in body-local space (fur included) -> same height, same bottom, centred
  scene.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(body.matrixWorld).invert();
  const box = new THREE.Box3(); const tmp = new THREE.Box3();
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh || !m.visible || !m.geometry) return;
    m.geometry.computeBoundingBox(); tmp.copy(m.geometry.boundingBox!).applyMatrix4(new THREE.Matrix4().multiplyMatrices(inv, m.matrixWorld));
    box.union(tmp);
  });
  const size = box.getSize(new THREE.Vector3()), centre = box.getCenter(new THREE.Vector3());
  const mesh = new THREE.Mesh(A.geometry, mat); mesh.name = 'benny31'; mesh.frustumCulled = false;
  const holder = new THREE.Group(); holder.name = 'benny31_holder';
  const k = size.y / 0.99;                         // mesh height 0.99 (bbox -0.496 .. 0.492)
  holder.scale.setScalar(k);
  holder.rotation.y = Math.PI;                     // the approved rear view faces the camera behind him
  holder.position.set(centre.x, box.min.y + 0.496 * k, centre.z);
  holder.add(mesh); body.add(holder);
  const hideOld = () => scene.traverse((o) => { if ((o as THREE.Mesh).isMesh && o !== mesh) o.visible = false; });
  hideOld();
  return {
    hideOld,
    update(time: number, swim: number, pomX: number, pomZ: number) {
      uniforms.uT.value = time; uniforms.uSwim.value = swim; uniforms.uPom.value.set(pomX * 2.2, pomZ * 2.2);
    },
  };
}
