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
import { PROJ05_INVERSE, flag05 } from '../vfx/waterRibbon';

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
  /** the approved picture's splash ring around Benny (camera-facing card; Game places it at Benny + splashOffset) */
  splash: THREE.Mesh;
  splashOffset: THREE.Vector3;
  /** render the projector depth map once (needs the renderer); call after the group is in the scene */
  bakeDepth(renderer: THREE.WebGLRenderer): void;
  /** live post values for the inverse (exposure from the renderer, render size for the vignette inverse) */
  sync(renderer: THREE.WebGLRenderer, w: number, h: number): void;
}

const VERT = /* glsl */ `
uniform mat4 uProjVP;
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vProj = uProjVP * wp;
  vW = wp.xyz;
  vN = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * viewMatrix * wp;
}`;

const FRAG = /* glsl */ `
uniform sampler2D uPlate;
uniform sampler2D uDepth;
uniform float uUseDepth;
uniform vec2 uNearFar;
uniform vec3 uFallback;
uniform sampler2D uPatch;   // material patch cut from the approved artwork (wall slots / gold band / towel)
uniform float uPatchK;      // patch repeats per world unit
uniform vec3 uProjPos;      // projector (approved view) position
uniform vec4 uPjPost;
uniform vec2 uPjRes;
uniform sampler2D uFill;    // m08fill: world-anchored wall tile cut from the picture's near pipe wall (unwrap08.py)
uniform float uFillMode;    // 0 off (triplanar patch), 1 drum wall (around the chamber axis), 2 flat disc (x/y)
uniform vec2 uFillSize;     // tile size in world units (around, along)
uniform vec3 uDrum;         // chamber axis x, y and radius
varying vec4 vProj;
varying vec3 vW;
varying vec3 vN;
${PROJ05_INVERSE}
// triplanar, mirrored-repeat sampling of the patch: surfaces the approved picture never showed (or showed edge-on)
vec3 patchColor() {
  vec3 n = abs(normalize(vN)); n /= max(n.x + n.y + n.z, 1e-4);
  vec3 p = vW * uPatchK;
  return texture2D(uPatch, p.zy).rgb * n.x + texture2D(uPatch, p.xz).rgb * n.y + texture2D(uPatch, p.xy).rgb * n.z;
}
float linZ(float d) { float n = uNearFar.x, f = uNearFar.y; float z = d * 2.0 - 1.0; return 2.0 * n * f / (f + n - z * (f - n)); }
vec3 fillColor() {
  vec2 q;
  if (uFillMode < 1.5) {
    // angle from straight down: the wrap of atan lies under the floor, never seen
    float a = atan(vW.x - uDrum.x, -(vW.y - uDrum.y));
    float n = floor(6.2831853 * uDrum.z / uFillSize.x + 0.5);  // whole tiles around the drum: no seam
    q = vec2(a / 6.2831853 * n, vW.z / uFillSize.y);
  } else q = vW.xy / uFillSize;
  return texture2D(uFill, q).rgb;
}
void main() {
  // m08fill fades in as the camera leaves the approved viewpoint (the approved view keeps its exact old pixels)
  vec3 pc = patchColor();
  if (uFillMode > 0.5) pc = mix(pc, fillColor(), smoothstep(0.2, 1.5, distance(cameraPosition, uProjPos)));
  vec3 t = pc;
  // stretch guard: the projection is used where the current view sees the surface no more face-on than the approved
  // view did (ratio of the two incidence cosines); in the approved view itself the ratio is 1 -> pure projection
  vec3 nn = normalize(vN);
  float cp = abs(dot(nn, normalize(uProjPos - vW))), cc = abs(dot(nn, normalize(cameraPosition - vW)));
  float keep = 1.0 - smoothstep(2.5, 6.0, cc / max(cp, 1e-3));
  if (vProj.w > 0.0) {
    vec3 ndc = vProj.xyz / vProj.w;
    vec2 uv = ndc.xy * 0.5 + 0.5;
    if (uv.x >= 0.0 && uv.x <= 1.0 && uv.y >= 0.0 && uv.y <= 1.0) {
      float vis = 1.0;
      if (uUseDepth > 0.5) {
        float zf = linZ(ndc.z * 0.5 + 0.5);
        float zs = linZ(texture2D(uDepth, uv).r);
        vis = 1.0 - smoothstep(0.015 * zs, 0.04 * zs + 0.05, zf - zs);
        // m08fill: once the camera has left the approved viewpoint, a soft hand-over to the fill (5 x 5 taps over ~3 %
        // of the frame) instead of a hard shadow line; at the viewpoint itself the exact single-tap test (view unchanged)
        float mv = uFillMode > 0.5 ? smoothstep(0.2, 1.5, distance(cameraPosition, uProjPos)) : 0.0;
        if (mv > 0.0) {
          float sv = 0.0;
          for (int i = -2; i <= 2; i++) for (int j = -2; j <= 2; j++) {
            float zt = linZ(texture2D(uDepth, uv + vec2(float(i), float(j) * 0.5625) * 0.007).r);
            sv += 1.0 - smoothstep(0.015 * zt, 0.04 * zt + 0.05, zf - zt);
          }
          vis = mix(vis, smoothstep(0.0, 1.0, sv / 25.0), mv);
        }
      }
      t = mix(pc, texture2D(uPlate, uv).rgb, vis * keep);
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
    uProjPos: { value: proj.position.clone() },
  };
  // material patches cut from the approved artwork (tools: qa/match/08/NOTES.md), mirrored so the tiling has no seams
  const loadPatch = async (name: string) => {
    const t = await new THREE.TextureLoader().loadAsync(new URL(`../../assets/textures/match08/patch_${name}.png`, import.meta.url).href);
    t.colorSpace = THREE.NoColorSpace; t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.anisotropy = 4; return t;
  };
  const [pWall, pGold, pTowel] = await Promise.all([loadPatch('wall'), loadPatch('gold'), loadPatch('towel')]);
  // `&m08fill=1` (scenery round): chamber surfaces the picture never showed get a world-anchored tile of the picture's
  // own wall (no mirrored kaleidoscope); see tools/match08/unwrap08.py and qa/match/08/scenery/NOTES.md
  const fill = flag05('m08fill');
  let fillTex: THREE.Texture | null = null, fillSize = new THREE.Vector2(1, 1);
  if (fill) {
    const FJ: { w: number; h: number } = await fetch(new URL('../../assets/textures/match08/fill_drum.json', import.meta.url).href).then((r) => r.json());
    fillTex = await new THREE.TextureLoader().loadAsync(new URL('../../assets/textures/match08/fill_drum.png', import.meta.url).href);
    fillTex.colorSpace = THREE.NoColorSpace; fillTex.wrapS = fillTex.wrapT = THREE.RepeatWrapping; fillTex.anisotropy = 8;
    fillSize = new THREE.Vector2(FJ.w, FJ.h);
  }
  const mat = (fallback: string, patch: THREE.Texture, k: number, fillMode = 0) => new THREE.ShaderMaterial({
    vertexShader: VERT, fragmentShader: FRAG, side: THREE.DoubleSide, fog: false,
    uniforms: { ...shared, uFallback: { value: new THREE.Color(fallback) }, uPatch: { value: patch }, uPatchK: { value: k },
      uFill: { value: fillTex ?? patch }, uFillMode: { value: fill ? fillMode : 0 }, uFillSize: { value: fillSize },
      uDrum: { value: new THREE.Vector3(L.chamber.cx, L.chamber.cy, L.chamber.r) } },
  });
  // patch scale: wall slots ≈ 2.4 u per patch, gold band ≈ 1.2 u, towel ≈ 1 u
  const M = { wall: mat('#c25bd0', pWall, 1 / 2.4), drum: mat('#c25bd0', pWall, 1 / 2.4, 1), disc: mat('#c25bd0', pWall, 1 / 2.4, 2), floor: mat('#9c55c8', pWall, 1 / 2.4), gold: mat('#e8a24a', pGold, 1 / 1.2), plat: mat('#b78ad6', pWall, 1 / 2.4), towel: mat('#6c3bc4', pTowel, 1 / 1.0) };

  const group = new THREE.Group();
  group.name = 'match08_projection';
  const add = (g: THREE.BufferGeometry, m: THREE.Material, name: string) => { const o = new THREE.Mesh(g, m); o.name = 'm08_' + name; group.add(o); return o; };
  const C = L.chamber;

  // Scenery-in-motion round (2026-11-17, qa/match/08/scenery/NOTES.md). Every proxy surface shows exactly the approved
  // picture from the approved view (projection), so the near proxies can be reshaped / enlarged ABOUT THE APPROVED
  // VIEWPOINT without changing that view; only what a moving camera sees changes.
  //  `&m08lane=1`: inlet pipe + gold arch scaled ×LANE_K about the approved viewpoint (same picture, a wider swim lane:
  //   the fitted pipe left only ±1.35 u of water at the waterline, Benny steers to ±1.85 u + his body) and the pipe's
  //   lower half squared off (walls rise from the water at the lane edge instead of curving into it).
  //  `&m08bw=1`: the chamber's entrance wall sits flush behind the gold arch (was 3.6 u further in, where it rose out
  //   of the painted river and showed a stretched second copy of river / wall when riding forward).
  const fixLane = flag05('m08lane'), fixBw = flag05('m08bw') || fixLane;
  const LANE_K = 1.45;
  const toView = new THREE.Matrix4();
  if (fixLane) {
    const P = proj.position;
    toView.makeTranslation(P.x, P.y, P.z).multiply(new THREE.Matrix4().makeScale(LANE_K, LANE_K, LANE_K)).multiply(new THREE.Matrix4().makeTranslation(-P.x, -P.y, -P.z));
  }
  // inlet pipe around the camera, ending at the arch (the picture's near walls outside the arch)
  const pipeLen = L.pipe.z0 - L.pipe.z1;
  let pipe: THREE.BufferGeometry;
  if (fixLane) {
    // open tube, circular top half, superellipse (n = 6) lower half: squared-off walls down to the water
    const NA = 128, NZ = 8, pos: number[] = [], uv: number[] = [], idx: number[] = [];
    for (let j = 0; j <= NZ; j++) {
      const z = L.pipe.z0 - (pipeLen * j) / NZ;
      for (let i = 0; i <= NA; i++) {
        const a = (i / NA) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
        const e = sn < 0 ? 1 / 3 : 1; // |c|^(2/n), n = 6
        const x = L.pipe.r * Math.sign(c) * Math.pow(Math.abs(c), e), y = L.pipe.r * Math.sign(sn) * Math.pow(Math.abs(sn), e);
        pos.push(L.pipe.cx + x, L.pipe.cy + y, z); uv.push(i / NA, j / NZ);
      }
    }
    for (let j = 0; j < NZ; j++) for (let i = 0; i < NA; i++) { const a = j * (NA + 1) + i, b = a + NA + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    pipe = new THREE.BufferGeometry();
    pipe.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); pipe.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    pipe.setIndex(idx); pipe.computeVertexNormals(); pipe.applyMatrix4(toView);
  } else {
    pipe = new THREE.CylinderGeometry(L.pipe.r, L.pipe.r, pipeLen, 128, 8, true);
    pipe.rotateX(Math.PI / 2).translate(L.pipe.cx, L.pipe.cy, (L.pipe.z0 + L.pipe.z1) / 2);
  }
  add(pipe, M.wall, 'pipe');
  // gold arch: annulus at the chamber entrance, extruded toward the door
  const ring = new THREE.Shape(); ring.absarc(0, 0, L.arch.outer.r, 0, Math.PI * 2, false);
  const hole = new THREE.Path(); hole.absarc(L.arch.inner.cx - L.arch.outer.cx, L.arch.inner.cy - L.arch.outer.cy, L.arch.inner.r, 0, Math.PI * 2, true);
  ring.holes.push(hole);
  const archG = new THREE.ExtrudeGeometry(ring, { depth: L.arch.depth, bevelEnabled: false, curveSegments: 96 });
  archG.translate(L.arch.outer.cx, L.arch.outer.cy, L.arch.z - L.arch.depth);
  if (fixLane) archG.applyMatrix4(toView);
  add(archG, M.gold, 'arch');
  // the arch's back face (where the chamber starts) and its outer ring, after the optional lane scaling
  const archC = new THREE.Vector3(L.arch.outer.cx, L.arch.outer.cy, L.arch.z - L.arch.depth).applyMatrix4(toView);
  const archR = L.arch.outer.r * (fixLane ? LANE_K : 1);
  // back wall around the pipe mouth (closes the gap between pipe and chamber; seen only when moving in)
  // (m08bw: outer edge 3 u beyond the chamber wall so the bigger opening stays inside the outline — the rim is hidden
  // behind the chamber wall / under the floor)
  const bw = new THREE.Shape(); bw.absarc(C.cx, C.cy, C.r + (fixBw ? 3 : 0), 0, Math.PI * 2, false);
  const bh = new THREE.Path();
  if (fixBw) bh.absarc(archC.x, archC.y, archR * 0.985, 0, Math.PI * 2, true);
  else bh.absarc(L.pipe.cx, L.pipe.cy, L.backwall.holeR, 0, Math.PI * 2, true);
  bw.holes.push(bh);
  add(new THREE.ShapeGeometry(bw, 64).translate(0, 0, fixBw ? archC.z - 0.02 : L.backwall.z), M.disc, 'backwall');
  // chamber walls (from the arch to the door wall) + the door wall
  const chLen = archC.z - C.zDoor;
  const ch = new THREE.CylinderGeometry(C.r, C.r, chLen, 160, 24, true);
  ch.rotateX(Math.PI / 2).translate(C.cx, C.cy, C.zDoor + chLen / 2);
  add(ch, M.drum, 'chamber');
  add(new THREE.CircleGeometry(C.r, 96).translate(C.cx, C.cy, C.zDoor), M.disc, 'doorwall');
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

  // QA only `&m08dbg=1`: every fitted surface in its own flat colour (which proxy carries which part of the frame)
  if (flag05('m08dbg')) {
    const pal = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff', '#ffffff', '#ff8000', '#8000ff', '#008040', '#804000', '#808080'];
    group.children.forEach((o, i) => { (o as THREE.Mesh).material = new THREE.MeshBasicMaterial({ color: pal[i % pal.length], side: THREE.DoubleSide }); });
    console.log('m08dbg', group.children.map((o, i) => `${o.name}=${pal[i % pal.length]}`).join(' '));
  }

  // Benny's splash ring, cut from the ORIGINAL approved picture (white crest + droplets around his base; alpha = white,
  // low saturation): a card that rides with him, facing the camera, 1.3 u in front of his centre
  const SP: { offset: [number, number, number]; w: number; h: number } = await fetch(new URL('../../assets/textures/match08/splash08.json', import.meta.url).href).then((r) => r.json());
  const spTex = await new THREE.TextureLoader().loadAsync(new URL('../../assets/textures/match08/splash08.png', import.meta.url).href);
  spTex.colorSpace = THREE.NoColorSpace;
  const splash = new THREE.Mesh(new THREE.PlaneGeometry(SP.w, SP.h), new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, fog: false,
    uniforms: { uTex: { value: spTex }, uPjPost: shared.uPjPost, uPjRes: shared.uPjRes },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform sampler2D uTex; uniform vec4 uPjPost; uniform vec2 uPjRes; varying vec2 vUv;\n${PROJ05_INVERSE}
void main() { vec4 c = texture2D(uTex, vUv); if (c.a < 0.02) discard; gl_FragColor = vec4(pjInverse(c.rgb), c.a); }`,
  }));
  splash.name = 'm08_splash';
  splash.visible = false;
  splash.renderOrder = 5;

  return {
    group,
    splash,
    splashOffset: new THREE.Vector3(...SP.offset),
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
