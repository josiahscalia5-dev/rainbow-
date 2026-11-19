/**
 * `?match06=1` — Screen 06 approved-picture test (2026-11-17, qa/match/06/NOTES.md), the Screen 08 method.
 * REAL 3D proxy geometry of "Crest the Rinse Arch", built around the game's own 06 river (which under the switch follows
 * the painted river: course.ts + assets/textures/match06/path06.json) and seen from the locked approved-view camera
 * (tools/match06/fit_river06.py → cam06_locked.json; layout tools/match06/make_tiles06.py → proj06.json):
 *   * the perforated tunnel = a tube of radius R around the river (centre hA above the water) from behind the camera
 *     into 07, continued straight along the river's heading so the painted far rings stay concentric
 *   * the river floor = the water surface across the tube (|lateral| <= Lfloor, meets the wall)
 *   * a dark end cap far down the tunnel
 * Every surface is textured by camera projection of the user's ORIGINAL approved pixels (HUD, title, Benny and coins
 * provisionally filled locally: plate06_hybrid.png) from the locked camera, so the locked view shows the approved scenery
 * and a moving camera sees it on geometry (parallax). Surfaces the picture never showed (or showed edge-on / far smaller)
 * get RING-STRUCTURED tiles unwrapped from the artwork in the surface's own coordinates (tube: wall angle x s, the
 * painted gold rings + slotted metal; floor: lateral x s, the painted water) — stretch x magnification guard + projector
 * depth test. The shader undoes the game's post chain (PROJ05_INVERSE) and takes no fog.
 * Without the switch nothing in this file runs and the game is unchanged.
 */
import * as THREE from 'three';
import { PROJ05_INVERSE } from '../vfx/waterRibbon';
import type { Course } from './course';

interface Layout06 {
  camera: { matrixWorld: number[]; fov: number; size: [number, number]; pos: number[] };
  R: number;
  hA: number;
  ext: number;
  s0: number;
  s1: number;
  Lfloor: number;
  tiles: {
    tube: { wallAngle: [number, number]; period: number; anglePeriod: number };
    floor: { lateralPeriod: number; period: number };
  };
}

export interface Match06 {
  group: THREE.Group;
  bakeDepth(renderer: THREE.WebGLRenderer): void;
  sync(renderer: THREE.WebGLRenderer, w: number, h: number): void;
}

const VERT = /* glsl */ `
uniform mat4 uProjVP;
attribute vec2 aTile;
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
varying vec2 vTile;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vProj = uProjVP * wp;
  vW = wp.xyz;
  vTile = aTile;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */ `
uniform sampler2D uPlate;
uniform sampler2D uDepth;
uniform float uUseDepth;
uniform vec2 uNearFar;
uniform sampler2D uTile;
uniform vec3 uProjPos;
uniform vec4 uPjPost;
uniform vec2 uPjRes;
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
varying vec2 vTile;
${PROJ05_INVERSE}
float linZ(float d) { float n = uNearFar.x, f = uNearFar.y; float z = d * 2.0 - 1.0; return 2.0 * n * f / (f + n - z * (f - n)); }
void main() {
  // ring-structured tile in the surface's own coordinates (mirrored repeat: no seams)
  vec3 pc = texture2D(uTile, vTile).rgb;
  vec3 t = pc;
  vec3 nn = normalize(vN);
  float cp = abs(dot(nn, normalize(uProjPos - vW))), cc = abs(dot(nn, normalize(cameraPosition - vW)));
  // stretch + magnification guard: the projection is used where the current view sees the surface no more face-on and
  // no more magnified than the approved view did (incidence-cosine ratio x distance ratio = 1 in the approved view)
  float mag = (cc / max(cp, 1e-3)) * (distance(uProjPos, vW) / max(distance(cameraPosition, vW), 1e-3));
  float keep = 1.0 - smoothstep(2.5, 6.0, mag);
  if (vProj.w > 0.0) {
    vec3 ndc = vProj.xyz / vProj.w;
    vec2 uv = ndc.xy * 0.5 + 0.5;
    if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
      float vis = 1.0;
      if (uUseDepth > 0.5) {
        float zs = linZ(texture2D(uDepth, uv).r), zf = linZ(ndc.z * 0.5 + 0.5);
        vis = 1.0 - smoothstep(0.015 * zs, 0.04 * zs + 0.05, zf - zs);
      }
      t = mix(pc, texture2D(uPlate, uv).rgb, vis * keep);
    }
  }
  gl_FragColor = vec4(pjInverse(t), 1.0);
}`;

const tex = (f: string) => new URL(`../../assets/textures/match06/${f}`, import.meta.url).href;

export async function buildMatch06(course: Course): Promise<Match06> {
  const L: Layout06 = await fetch(tex('proj06.json')).then((r) => r.json());
  const loader = new THREE.TextureLoader();
  const plate = await loader.loadAsync(tex('plate06_hybrid.png'));
  plate.colorSpace = THREE.NoColorSpace; // raw display values: the shader inverts the post chain itself
  plate.minFilter = THREE.LinearMipmapLinearFilter;
  plate.anisotropy = 8;

  // the projector = the locked game camera the picture was matched to (far enough for the deep painted tunnel)
  const [W, H] = L.camera.size;
  const proj = new THREE.PerspectiveCamera(L.camera.fov, W / H, 0.3, L.ext + 160);
  proj.matrixWorld.fromArray(L.camera.matrixWorld);
  proj.matrixWorld.decompose(proj.position, proj.quaternion, proj.scale);
  proj.matrixWorldInverse.copy(proj.matrixWorld).invert();
  proj.updateProjectionMatrix();
  const projVP = new THREE.Matrix4().multiplyMatrices(proj.projectionMatrix, proj.matrixWorldInverse);

  const depthRT = new THREE.WebGLRenderTarget(1024, Math.round((1024 * H) / W), { depthBuffer: true });
  depthRT.depthTexture = new THREE.DepthTexture(depthRT.width, depthRT.height, THREE.UnsignedIntType);
  const shared = {
    uPlate: { value: plate },
    uDepth: { value: depthRT.depthTexture as THREE.Texture },
    uUseDepth: { value: 0 },
    uNearFar: { value: new THREE.Vector2(proj.near, proj.far) },
    uProjVP: { value: projVP },
    uPjPost: { value: new THREE.Vector4(0.86, 1.36, 1.15, 0.18) },
    uPjRes: { value: new THREE.Vector2(W, H) },
    uProjPos: { value: proj.position.clone() },
  };
  const loadTile = async (name: string) => {
    const t = await loader.loadAsync(tex(`tile_${name}.png`));
    t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.anisotropy = 8;
    t.minFilter = THREE.LinearMipmapLinearFilter; return t;
  };
  const [tTube, tFloor] = await Promise.all([loadTile('tube'), loadTile('floor')]);
  const mat = (tile: THREE.Texture) => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide, fog: false,
    uniforms: { ...shared, uTile: { value: tile } },
  });

  // river frames from the course (beyond s1: straight along the heading at s1, as tools/match06/geo06.py)
  const f1 = course.sample(L.s1);
  const T1 = f1.tan.clone().normalize(), P1 = f1.pos.clone(), U1 = f1.up.clone(), R1 = f1.right.clone();
  const frame = (s: number) => {
    if (s <= L.s1) { const f = course.sample(s); return { pos: f.pos.clone(), up: f.up.clone(), right: f.right.clone() }; }
    return { pos: P1.clone().addScaledVector(T1, s - L.s1), up: U1.clone(), right: R1.clone() };
  };
  const sList: number[] = [];
  for (let s = L.s0; s < L.s1; s += 0.5) sList.push(s);
  for (let s = L.s1; s <= L.s1 + L.ext + 1e-6; s += 2) sList.push(s);

  // grid helper: rows along s, columns across (closed ring for the tube)
  const grid = (cols: number, vert: (s: number, j: number, fr: ReturnType<typeof frame>) => [THREE.Vector3, number], sK: number) => {
    const pos: number[] = [], tile: number[] = [], idx: number[] = [];
    for (const s of sList) {
      const fr = frame(s);
      for (let j = 0; j <= cols; j++) { const [p, a] = vert(s, j, fr); pos.push(p.x, p.y, p.z); tile.push(a, s / sK); }
    }
    const n = cols + 1;
    for (let i = 0; i < sList.length - 1; i++) for (let j = 0; j < cols; j++) {
      const a = i * n + j, b = a + 1, c = a + n, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('aTile', new THREE.Float32BufferAttribute(tile, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  };

  const group = new THREE.Group();
  group.name = 'match06_projection';
  const add = (g: THREE.BufferGeometry, m: THREE.Material, name: string) => { const o = new THREE.Mesh(g, m); o.name = 'm06_' + name; o.frustumCulled = false; group.add(o); return o; };
  const TT = L.tiles.tube, TF = L.tiles.floor;
  const RAD = 128;
  // tunnel tube around the river: angle 0 = right, pi/2 = up; tile angle coordinate starts at the right bank
  add(grid(RAD, (_s, j, fr) => {
    const th = (j / RAD) * Math.PI * 2;
    const p = fr.pos.clone().addScaledVector(fr.up, L.hA).addScaledVector(fr.right, L.R * Math.cos(th)).addScaledVector(fr.up, L.R * Math.sin(th));
    let a = th; if (a > TT.wallAngle[1]) a -= Math.PI * 2; // continuous over the wall (the part under the water is never seen)
    return [p, (a - TT.wallAngle[0]) / TT.anglePeriod];
  }, TT.period), mat(tTube), 'tube');
  // river floor across the tube
  const FC = 32;
  add(grid(FC, (_s, j, fr) => {
    const l = -L.Lfloor + (2 * L.Lfloor * j) / FC;
    return [fr.pos.clone().addScaledVector(fr.right, l), l / TF.lateralPeriod];
  }, TF.period), mat(tFloor), 'floor');
  // far end cap of the tunnel (the glowing vanishing point)
  const fe = frame(L.s1 + L.ext);
  const cap = new THREE.Mesh(new THREE.CircleGeometry(L.R, 64), mat(tTube));
  cap.geometry.setAttribute('aTile', new THREE.Float32BufferAttribute(new Float32Array(cap.geometry.attributes.position.count * 2), 2));
  cap.position.copy(fe.pos).addScaledVector(fe.up, L.hA);
  cap.lookAt(cap.position.clone().sub(T1));
  cap.name = 'm06_end'; cap.frustumCulled = false;
  group.add(cap);

  return {
    group,
    bakeDepth(renderer) {
      const prevRT = renderer.getRenderTarget();
      const scene = new THREE.Scene();
      const clone = group.clone(true);
      clone.visible = true;
      clone.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide }); });
      scene.add(clone);
      clone.updateMatrixWorld(true);
      renderer.setRenderTarget(depthRT);
      renderer.clear();
      renderer.render(scene, proj);
      renderer.setRenderTarget(prevRT);
      shared.uUseDepth.value = 1;
    },
    sync(renderer, w, h) {
      shared.uPjPost.value.x = renderer.toneMappingExposure;
      shared.uPjRes.value.set(w, h);
    },
  };
}
