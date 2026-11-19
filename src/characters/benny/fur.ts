/**
 * Real-time shell-texturing fur for Benny (mobile-safe, one draw call per furry part).
 *
 * Each fur_* mesh becomes an InstancedMesh with `shells` instances; gl_InstanceID selects the
 * shell layer, which is pushed out along the normal (plus a little gravity droop). A hashed 3-D
 * strand grid decides per-fragment whether a strand still exists at that height (tapering strands),
 * so the fur keeps a fluffy silhouette from every angle. Built on MeshStandardMaterial via
 * onBeforeCompile so scene lighting, IBL and fog all still apply.
 */
import * as THREE from 'three';

export interface FurParams {
  length: number;
  density: number;
  shells: number;
  root: string;
  tip: string;
  gravity?: number;
  bald?: [number, number, number, number];
  short?: [number, number, number, number, number, number];
}

export interface FurHandle {
  mesh: THREE.InstancedMesh;
  material: THREE.MeshStandardMaterial;
  uniforms: { uTime: { value: number }; uWind: { value: THREE.Vector3 }; uMaskCol: { value: THREE.Color } };
}

export function makeFur(src: THREE.Mesh, p: FurParams): FurHandle {
  const shells = Math.max(2, Math.round(p.shells));
  const uniforms = {
    uFurLen: { value: p.length },
    uDensity: { value: p.density },
    uRoot: { value: new THREE.Color(p.root) },
    uTip: { value: new THREE.Color(p.tip) },
    uGravity: { value: p.gravity ?? 0.3 },
    uBald: { value: new THREE.Vector4(...(p.bald ?? [0, 1, 0, 2])) },
    uShortDir: { value: new THREE.Vector3(...((p.short?.slice(0, 3) as [number, number, number]) ?? [0, 0, 1])) },
    uShort: { value: new THREE.Vector3(p.short?.[3] ?? 2, p.short?.[4] ?? 3, p.short?.[5] ?? 1) },
    uTime: { value: 0 },
    uWind: { value: new THREE.Vector3() },
    /** QA segmentation colour (only compiled in when material.defines.BENNY_MASK is set, see runtime.ts) */
    uMaskCol: { value: new THREE.Color(1, 0, 0) },
  };
  const material = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, metalness: 0 });
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uFurLen; uniform float uGravity; uniform vec4 uBald;
        uniform vec3 uShortDir; uniform vec3 uShort; uniform float uTime; uniform vec3 uWind;
        varying float vLayer; varying vec3 vBase; varying float vLenMask;`,
      )
      .replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        vLayer = float(gl_InstanceID) / float(${shells - 1});
        vec3 nrm = normalize(objectNormal);
        float bald = 1.0 - smoothstep(uBald.w - 0.04, uBald.w + 0.01, dot(nrm, normalize(uBald.xyz)));
        float sh = mix(1.0, uShort.z, smoothstep(uShort.x, uShort.y, dot(nrm, normalize(uShortDir))));
        vLenMask = bald * sh;
        vBase = position;
        float h = uFurLen * vLayer * vLenMask;
        transformed += nrm * h;
        // gravity droop + gentle wind sway grows with layer height
        vec3 g = vec3(0.0, -1.0, 0.0) * uGravity + uWind;
        g += vec3(sin(uTime * 3.0 + position.y * 9.0), 0.0, cos(uTime * 2.3 + position.x * 7.0)) * 0.06;
        transformed += g * uFurLen * vLayer * vLayer * vLenMask;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uDensity; uniform vec3 uRoot; uniform vec3 uTip;
        varying float vLayer; varying vec3 vBase; varying float vLenMask;
        float fhash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        vec3 fhash3(vec3 p) { return vec3(fhash(p), fhash(p + 17.31), fhash(p + 41.7)); }`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        {
          vec3 q = vBase * uDensity;
          // clumping: strands lean toward low-frequency tuft centres as they rise → plush tufts
          vec3 qc = q * 0.2;
          vec3 cc = (floor(qc) + 0.5 + (fhash3(floor(qc)) - 0.5) * 0.7) / 0.2;
          q = mix(q, cc, vLayer * 0.42);
          vec3 cell = floor(q);
          float best = 10.0; float hgt = 0.0;
          // nearest strand among this + neighbouring cells (gives round, jittered strands)
          for (int k = 0; k < 8; k++) {
            vec3 o = vec3(float(k & 1), float((k >> 1) & 1), float((k >> 2) & 1));
            vec3 c = floor(q - 0.5) + o;
            vec3 jp = c + 0.5 + (fhash3(c) - 0.5) * 0.8;
            float d = length(q - jp);
            if (d < best) { best = d; hgt = fhash(c * 1.7 + 3.1); }
          }
          float layer = vLayer;
          if (layer > 0.001) {
            if (vLenMask < 0.05) discard;
            float strandH = 0.55 + 0.45 * hgt;
            float radius = 0.78 * (1.0 - 0.85 * layer / strandH);
            if (layer > strandH || best > radius) discard;
          }
          float ao = mix(0.55, 1.0, smoothstep(0.0, 0.9, layer));
          diffuseColor.rgb = mix(uRoot, uTip, smoothstep(0.0, 1.0, layer)) * ao * (0.92 + 0.16 * hgt);
        }`,
      )
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        totalEmissiveRadiance += diffuseColor.rgb * 0.10 * vLayer;`,
      )
      .replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
        #ifdef BENNY_MASK
        gl_FragColor = vec4(uMaskCol, 1.0);
        #endif`,
      );
    shader.fragmentShader = shader.fragmentShader.replace('uniform vec3 uTip;', 'uniform vec3 uTip; uniform vec3 uMaskCol;');
  };
  material.customProgramCacheKey = () => `benny-fur-${shells}${material.defines?.BENNY_MASK !== undefined ? '-mask' : ''}`;

  const mesh = new THREE.InstancedMesh(src.geometry, material, shells);
  const I = new THREE.Matrix4();
  for (let i = 0; i < shells; i++) mesh.setMatrixAt(i, I);
  mesh.instanceMatrix.needsUpdate = true;
  mesh.name = src.name;
  mesh.position.copy(src.position);
  mesh.quaternion.copy(src.quaternion);
  mesh.scale.copy(src.scale);
  mesh.frustumCulled = false;
  return { mesh, material, uniforms };
}
