/**
 * `?match08=1` — Screen 08 approved-picture test (2026-11-17, qa/match/08/NOTES.md).
 * REAL 3D proxy geometry of the Final Spin Chamber, solved from the user's approved Screen 08 and the locked game
 * camera (tools/match08/fit_proxies.py → assets/textures/match08/proj08.json): inlet pipe, gold arch, chamber walls,
 * door wall, floor/river plane, platform (top tilted toward the camera as painted), towel and the four half-dome spouts.
 * Every surface is textured by camera projection of the CLEAN environment-only artwork (Benny, HUD, coins removed;
 * qa/imageblaster/08/) from that locked camera, so the locked view shows the approved scenery and a moving camera sees
 * it on geometry (parallax). Surfaces the projector cannot see (behind props) get a plain fallback colour instead of
 * a smeared copy (projector depth test). The shader undoes the game's post chain (PROJ05_INVERSE) and takes no fog.
 * Without the switch nothing in this file runs and the game is unchanged.
 */
import * as THREE from 'three';
import { PROJ05_INVERSE } from '../vfx/waterRibbon';

interface Layout {
  camera: { matrixWorld: number[]; fov: number; size: [number, number] };
  floorY: number;
  chamber: { cx: number; cy: number; r: number; zBack: number; zDoor: number };
  arch: { z: number; outer: { cx: number; cy: number; r: number }; inner: { cx: number; cy: number; r: number }; depth: number };
  pipe: { cx: number; cy: number; r: number; z0: number; z1: number };
  backwall: { z: number; holeR: number };
  platform: { cx: number; cz: number; r: number; topY: number; rimBottomY: number; floorY: number; tiltDeg: number };
  towel: { cx: number; cz: number; w: number; h: number; y0: number; d: number };
  spouts: Record<string, { c: [number, number, number]; rx: number; ry: number }>;
}

export interface Match08 {
  group: THREE.Group;
  /** render the projector depth map once (needs the renderer); call after the group is in the scene */
  bakeDepth(renderer: THREE.WebGLRenderer): void;
  /** live post values for the inverse (exposure from the renderer, render size for the vignette inverse) */
  sync(renderer: THREE.WebGLRenderer, w: number, h: number): void;
}

const VERT = /* glsl */ `
uniform mat4 uProjVP;
varying vec4 vProj;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vProj = uProjVP * wp;
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */ `
uniform sampler2D uPlate;
uniform sampler2D uDepth;
uniform float uUseDepth;
uniform vec2 uNearFar;
uniform vec3 uFallback;
uniform vec4 uPjPost;
uniform vec2 uPjRes;
varying vec4 vProj;
${PROJ05_INVERSE}
float linZ(float d) { float n = uNearFar.x, f = uNearFar.y; float z = d * 2.0 - 1.0; return 2.0 * n * f / (f + n - z * (f - n)); }
void main() {
  vec3 t = uFallback;
  if (vProj.w > 0.0) {
    vec3 ndc = vProj.xyz / vProj.w;
    vec2 uv = ndc.xy * 0.5 + 0.5;
    if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
      float vis = 1.0;
      if (uUseDepth > 0.5) {
        float zs = linZ(texture2D(uDepth, uv).r), zf = linZ(ndc.z * 0.5 + 0.5);
        vis = 1.0 - smoothstep(0.015 * zs, 0.04 * zs + 0.05, zf - zs);
      }
      t = mix(uFallback, texture2D(uPlate, uv).rgb, vis);
    }
  }
  gl_FragColor = vec4(pjInverse(t), 1.0);
}`;

export async function buildMatch08(): Promise<Match08> {
  const L: Layout = await fetch(new URL('../../assets/textures/match08/proj08.json', import.meta.url).href).then((r) => r.json());
  const plate = await new THREE.TextureLoader().loadAsync(new URL('../../assets/textures/match08/plate08_hybrid.png', import.meta.url).href);
  plate.colorSpace = THREE.NoColorSpace; // raw display values: the shader inverts the post chain itself
  plate.minFilter = THREE.LinearMipmapLinearFilter;
  plate.anisotropy = 8;

  // the projector = the locked game camera the picture was matched to
  const [W, H] = L.camera.size;
  const proj = new THREE.PerspectiveCamera(L.camera.fov, W / H, 0.2, 160);
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
  };
  const mat = (fallback: string) => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide, fog: false,
    uniforms: { ...shared, uFallback: { value: new THREE.Color(fallback) } },
  });
  // fallbacks (display colours sampled from the clean artwork): wall purple, floor violet, gold, platform, towel
  const M = { wall: mat('#c25bd0'), floor: mat('#9c55c8'), gold: mat('#e8a24a'), plat: mat('#b78ad6'), towel: mat('#6c3bc4') };

  const group = new THREE.Group();
  group.name = 'match08_projection';
  const add = (g: THREE.BufferGeometry, m: THREE.Material, name: string) => { const o = new THREE.Mesh(g, m); o.name = 'm08_' + name; group.add(o); return o; };
  const C = L.chamber;

  // inlet pipe around the camera, ending at the arch (the picture's near walls outside the arch)
  const pipeLen = L.pipe.z0 - L.pipe.z1;
  const pipe = new THREE.CylinderGeometry(L.pipe.r, L.pipe.r, pipeLen, 128, 8, true);
  pipe.rotateX(Math.PI / 2).translate(L.pipe.cx, L.pipe.cy, (L.pipe.z0 + L.pipe.z1) / 2);
  add(pipe, M.wall, 'pipe');
  // gold arch: annulus at the chamber entrance, extruded toward the door
  const ring = new THREE.Shape(); ring.absarc(0, 0, L.arch.outer.r, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(L.arch.inner.cx - L.arch.outer.cx, L.arch.inner.cy - L.arch.outer.cy, L.arch.inner.r, 0, Math.PI * 2, true);
  ring.holes.push(hole);
  const archG = new THREE.ExtrudeGeometry(ring, { depth: L.arch.depth, bevelEnabled: false, curveSegments: 96 });
  archG.translate(L.arch.outer.cx, L.arch.outer.cy, L.arch.z - L.arch.depth);
  add(archG, M.gold, 'arch');
  // back wall around the pipe mouth (closes the gap between pipe and chamber; seen only when moving in)
  const bw = new THREE.Shape(); bw.absarc(C.cx, C.cy, C.r, 0, Math.PI * 2, false);
  const bh = new THREE.Path(); bh.absarc(L.pipe.cx, L.pipe.cy, L.backwall.holeR, 0, Math.PI * 2, true); bw.holes.push(bh);
  add(new THREE.ShapeGeometry(bw, 64).translate(0, 0, L.backwall.z), M.wall, 'backwall');
  // chamber walls (from the arch to the door wall) + the door wall
  const chLen = (L.arch.z - L.arch.depth) - C.zDoor;
  const ch = new THREE.CylinderGeometry(C.r, C.r, chLen, 160, 24, true);
  ch.rotateX(Math.PI / 2).translate(C.cx, C.cy, C.zDoor + chLen / 2);
  add(ch, M.wall, 'chamber');
  add(new THREE.CircleGeometry(C.r, 96).translate(C.cx, C.cy, C.zDoor), M.wall, 'doorwall');
  // floor / river plane at Benny's water level, from behind the camera to the door wall
  const fl = new THREE.PlaneGeometry(2 * C.r, L.pipe.z0 - C.zDoor, 32, 64);
  fl.rotateX(-Math.PI / 2).translate(C.cx, L.floorY, (L.pipe.z0 + C.zDoor) / 2);
  add(fl, M.floor, 'floor');
  // platform: top disc tilted toward the camera as painted, rim, leg skirt to the floor
  const P = L.platform;
  const top = new THREE.CircleGeometry(P.r, 96);
  const topM = add(top, M.plat, 'platform_top');
  topM.rotation.x = -Math.PI / 2 + THREE.MathUtils.degToRad(P.tiltDeg);
  topM.position.set(P.cx, P.topY, P.cz);
  const rimH = P.topY - P.rimBottomY;
  add(new THREE.CylinderGeometry(P.r, P.r, rimH, 96, 1, true).translate(P.cx, P.topY - rimH / 2, P.cz), M.gold, 'platform_rim');
  const skH = P.rimBottomY - P.floorY;
  add(new THREE.CylinderGeometry(P.r * 0.85, P.r * 0.85, skH, 96, 1, true).translate(P.cx, P.rimBottomY - skH / 2, P.cz), M.plat, 'platform_legs');
  // towel on the platform
  const T = L.towel;
  add(new THREE.BoxGeometry(T.w, T.h, T.d, 4, 4, 4).translate(T.cx, T.y0 + T.h / 2, T.cz), M.towel, 'towel');
  // four half-dome spouts (flat perforated underside down)
  for (const [k, s] of Object.entries(L.spouts)) {
    const dome = new THREE.SphereGeometry(1, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const cap = new THREE.CircleGeometry(1, 48).rotateX(Math.PI / 2);
    for (const [g, nm] of [[dome, 'dome'], [cap, 'under']] as const) {
      const o = add(g, M.gold, `spout_${k}_${nm}`);
      o.scale.set(s.rx, s.ry, s.rx);
      o.position.set(...s.c);
    }
  }

  return {
    group,
    bakeDepth(renderer) {
      const prevRT = renderer.getRenderTarget();
      const scene = new THREE.Scene();
      const clone = group.clone(true);
      clone.visible = true;
      clone.traverse((o) => { if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide }); });
      scene.add(clone);
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
