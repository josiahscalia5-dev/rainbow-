/**
 * Screen 05 projection test (`?proj05=1`, qa/pilot05/proj/NOTES.md): a thin VISUAL-ONLY strip that hugs the tunnel wall
 * from the river's edge up ≈ 2.5 u, on 05 only. At the far bends the approved picture's fluffy foam banks lie beyond the
 * game river's edge (on the lower wall); this strip carries them (baked from the approved picture through the locked
 * camera: assets/textures/water05/proj05_A.png, tools/proj05/bake.py). No collisions, no gameplay: steering, coins and the
 * camera are untouched. Where it would be magnified (camera close) or where the approved picture shows no foam/water,
 * it dithers away and the wall shows as before. `?projbank05=0` leaves it out.
 * attribute aPj = (t · side, s): t 0 at the river edge → 1 at the top of the strip, side −1 left / +1 right.
 */
import * as THREE from 'three';
import type { Course } from '../world/course';
import type { TubePath } from '../world/tube';
import { tubeCenterAt } from '../world/tube';
import { EDGE_LIFT, PROJ05_INVERSE, proj05Pending } from './waterRibbon';

/** s range covered by proj05_A.png (must match tools/proj05/bake.py: A_S0, A_S1) */
export const PJ_A_S0 = 126, PJ_A_S1 = 190;

const VERT = /* glsl */ `
attribute vec2 aPj;
varying vec2 vPj;
void main() {
  vPj = aPj;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;
const FRAG = /* glsl */ `
uniform sampler2D uPjA;
uniform vec4 uPjAS;        // s0, s1, texels x, texels y
uniform vec4 uPjPost;
uniform vec2 uPjRes;
varying vec2 vPj;
${PROJ05_INVERSE}
void main() {
  vec2 uv = vec2(0.5 + 0.5 * vPj.x, (vPj.y - uPjAS.x) / (uPjAS.y - uPjAS.x));
  vec4 a = texture2D(uPjA, uv);
  vec2 tp = uv * uPjAS.zw;
  vec2 ja = dFdx(tp), jb = dFdy(tp);
  float m = abs(ja.x * jb.y - ja.y * jb.x) / max(max(length(ja), length(jb)), 1e-5);
  float w = a.a * smoothstep(0.2, 0.45, m);
  float h = fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453);
  if (w < 0.02 || h > w) discard;
  gl_FragColor = vec4(pjInverse(a.rgb), 1.0);
}`;

export function createProj05Apron(course: Course, path: TubePath, s0: number, s1: number, opts: { cols?: number; ds?: number; arc?: number } = {}) {
  const cols = opts.cols ?? 7, ds = opts.ds ?? 0.5, arc = opts.arc ?? 0.36;
  const rows = Math.ceil((s1 - s0) / ds) + 1;
  const pos: number[] = [], pj: number[] = [], idx: number[] = [];
  const C = new THREE.Vector3(), P = new THREE.Vector3(), d = new THREE.Vector3(), q = new THREE.Quaternion(), W = new THREE.Vector3();
  for (const side of [-1, 1]) {
    const base = pos.length / 3;
    for (let i = 0; i < rows; i++) {
      const s = Math.min(s1, s0 + i * ds);
      const f = course.sample(s);
      const hw = course.widthAt(s) / 2;
      P.copy(f.pos).addScaledVector(f.right, side * hw).addScaledVector(f.up, EDGE_LIFT + 0.02);   // river edge
      const tf = path.frame(s);
      tubeCenterAt(path, s, C);
      const R = path.radius(s) - 0.06;                                                            // just inside the wall
      d.copy(P).sub(C); d.addScaledVector(tf.tan, -d.dot(tf.tan)).normalize();
      for (let j = 0; j < cols; j++) {
        const t = j / (cols - 1);
        if (j === 0) { pos.push(P.x, P.y, P.z); }
        else {
          // rotate the edge direction up the wall about the tube axis (toward the tunnel's up side)
          const ang = -side * arc * ((j - 1) / (cols - 2));
          q.setFromAxisAngle(tf.tan, ang);
          W.copy(d).applyQuaternion(q).multiplyScalar(R).add(C);
          pos.push(W.x, W.y, W.z);
        }
        pj.push(side * t, s);
      }
    }
    for (let i = 0; i < rows - 1; i++) for (let j = 0; j < cols - 1; j++) {
      const a = base + i * cols + j, b = a + 1, c = a + cols, e = c + 1;
      idx.push(a, c, b, b, c, e);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setAttribute('aPj', new THREE.Float32BufferAttribute(pj, 2));
  geo.setIndex(idx);
  geo.computeBoundingSphere();
  const uniforms: Record<string, THREE.IUniform> = {
    uPjA: { value: null }, uPjAS: { value: new THREE.Vector4(PJ_A_S0, PJ_A_S1, 1, 1) },
    uPjPost: { value: new THREE.Vector4(0.86, 1.36, 1.15, 0.18) }, uPjRes: { value: new THREE.Vector2(864, 1536) },
  };
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide, fog: false });
  mat.polygonOffset = true; mat.polygonOffsetFactor = -1; mat.polygonOffsetUnits = -2;
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = 'proj05_apron';
  mesh.frustumCulled = false;
  const size = new THREE.Vector2();
  mesh.onBeforeRender = (renderer) => {
    const rt = renderer.getRenderTarget();
    if (rt) size.set(rt.width, rt.height); else renderer.getDrawingBufferSize(size);
    (uniforms.uPjRes.value as THREE.Vector2).copy(size);
    (uniforms.uPjPost.value as THREE.Vector4).x = renderer.toneMappingExposure;
  };
  // texture (absent until bake.py has produced it: then the strip simply draws nothing)
  proj05Pending.push(new Promise<void>((res) => {
    new THREE.TextureLoader().load(new URL('../../assets/textures/water05/proj05_A.png', import.meta.url).href, (t) => {
      t.flipY = false; t.colorSpace = THREE.NoColorSpace; t.generateMipmaps = false; t.minFilter = THREE.LinearFilter;
      t.needsUpdate = true;
      uniforms.uPjA.value = t;
      (uniforms.uPjAS.value as THREE.Vector4).set(PJ_A_S0, PJ_A_S1, t.image.width, t.image.height);
      res();
    }, undefined, () => res());
  }));
  mesh.visible = true;
  return mesh;
}
