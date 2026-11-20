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
  uniforms: {
    uTime: { value: number };
    uWind: { value: THREE.Vector3 };
    uMaskCol: { value: THREE.Color };
    uRoot: { value: THREE.Color };
    uTip: { value: THREE.Color };
    uClump: { value: number };
    uLock: { value: THREE.Vector4 };
    uShade: { value: THREE.Vector4 };
    uTint: { value: THREE.Color };
    uComb: { value: THREE.Vector4 };
  };
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
    /** `?benny05=1` only (material.defines.BENNY05, benny05.ts): strand clumping toward tuft centres */
    uClump: { value: 0.42 },
    /** `?benny20=1` only (material.defines.BENNY20, benny20.ts): soft plush LOCKS instead of single needles —
     *  x = lock cells per unit, y = lock base radius (cell units), z = vertical lock stretch (< 1: combed, elongated
     *  downward), w = fine strand cells per unit inside a lock */
    uLock: { value: new THREE.Vector4(8, 0.72, 0.62, 110) },
    /** `?benny20=1`: x = colour at the roots / in the creases (fraction), y = extra lightness at the lock tips,
     *  z = crease darkening between locks, w = lock length variation */
    uShade: { value: new THREE.Vector4(0.42, 0.22, 0.4, 0.4) },
    /** `?benny20=1`: colour factor on the baked albedo (dusty rose / mauve calibration) */
    uTint: { value: new THREE.Color(1, 1, 1) },
    /** `?benny20=1`: x = comb ALONG the surface toward his feet (fraction of the fur length), y = lift off the surface
     *  (normal push factor, < 1: strands lie flatter), z = strand-to-strand brightness variation, w = tuft roundness shading (bright axis, darker rim) */
    uComb: { value: new THREE.Vector4(0, 1, 0.14, 0) },
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
        varying float vLayer; varying vec3 vBase; varying float vLenMask;
        #ifdef BENNY05
        varying vec2 vB05Uv;
        #endif
        #ifdef BENNY20
        uniform vec4 uComb;
        #endif`,
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
        #ifdef BENNY05
        vB05Uv = uv;
        #endif
        float h = uFurLen * vLayer * vLenMask;
        #ifdef BENNY20
        // benny20.ts: strands combed DOWN ALONG the surface (gravity projected onto the tangent plane) and lying flatter,
        // so they overlap in soft layers like the approved plush instead of hanging off the underside as spikes
        vec3 dn = vec3(0.0, -1.0, 0.0);
        vec3 tg = dn - nrm * dot(dn, nrm);
        transformed += nrm * h * uComb.y;
        transformed += tg * uFurLen * uComb.x * pow(vLayer, 1.3) * vLenMask;
        vec3 g = uWind + vec3(0.0, -1.0, 0.0) * uGravity;
        #else
        transformed += nrm * h;
        // gravity droop + gentle wind sway grows with layer height
        vec3 g = vec3(0.0, -1.0, 0.0) * uGravity + uWind;
        #endif
        g += vec3(sin(uTime * 3.0 + position.y * 9.0), 0.0, cos(uTime * 2.3 + position.x * 7.0)) * 0.06;
        transformed += g * uFurLen * vLayer * vLayer * vLenMask;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
        uniform float uDensity; uniform vec3 uRoot; uniform vec3 uTip;
        varying float vLayer; varying vec3 vBase; varying float vLenMask;
        #ifdef BENNY05
        varying vec2 vB05Uv;
        uniform float uClump;
        #endif
        #ifdef BENNY20
        uniform vec4 uLock; uniform vec4 uShade; uniform vec3 uTint; uniform vec4 uComb;
        #endif
        float fhash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        vec3 fhash3(vec3 p) { return vec3(fhash(p), fhash(p + 17.31), fhash(p + 41.7)); }`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        #ifdef BENNY20
        {
          // benny20.ts: plush LOCKS. Each lock = a cone of fine strands that converge toward the lock's axis and end in a
          // soft point; neighbouring locks overlap at the roots (no bald gaps); darker roots / creases, lighter tips.
          float layer = vLayer;
          vec3 qt = vec3(vBase.x, vBase.y * uLock.z, vBase.z) * uLock.x;
          float td = 10.0; float th = 0.0; vec3 tc = vec3(0.0);
          for (int k = 0; k < 8; k++) {
            vec3 o = vec3(float(k & 1), float((k >> 1) & 1), float((k >> 2) & 1));
            vec3 c = floor(qt - 0.5) + o;
            vec3 jp = c + 0.5 + (fhash3(c) - 0.5) * 0.85;
            float d = length(qt - jp);
            if (d < td) { td = d; th = fhash(c * 2.31 + 0.7); tc = jp; }
          }
          float lh = 1.0 - uShade.w * th;                       // this lock's length (fraction of the fur length)
          float lt = clamp(layer / lh, 0.0, 1.0);
          float rl = uLock.y * pow(max(0.0, 1.0 - lt), 0.4);    // lock cross-section radius at this height (leaf-shaped)
          float rr = td / max(rl, 1e-3);
          // fine strands, clumped toward the lock axis as they rise (q' = c + (q - c) / (1 - h k))
          vec3 qs = vBase * uLock.w;
          vec3 cs = vec3(tc.x / uLock.x, tc.y / (uLock.x * uLock.z), tc.z / uLock.x) * uLock.w;
          qs = cs + (qs - cs) / max(0.15, 1.0 - 0.8 * lt);
          vec3 sc = floor(qs);
          vec3 sp = sc + 0.5 + (fhash3(sc) - 0.5) * 0.7;
          float sd = length(qs - sp);
          float sh = fhash(sc * 1.37 + 5.1);
          if (layer > 0.001) {
            if (vLenMask < 0.05) discard;
            if (layer > lh || rr > 1.0) discard;
            // dense lock core; wispy, separated strands only toward the lock's rim and tip
            if (lt > 0.3 && rr > 0.5 && sd > mix(0.95, 0.45, smoothstep(0.5, 1.0, rr) * smoothstep(0.3, 1.0, lt))) discard;
          }
          // rounded tuft: brighter along the lock's axis, darker toward its rim (uComb.w = amount)
          float rnd = mix(1.0 - uComb.w, 1.0 + 0.4 * uComb.w, 1.0 - smoothstep(0.0, 1.0, rr));
          float ao = mix(uShade.x, 1.0, smoothstep(0.0, 0.8, lt));
          float crease = 1.0 - uShade.z * smoothstep(0.45, 1.0, td / uLock.y) * (1.0 - smoothstep(0.0, 0.6, lt));
          float tip = 1.0 + uShade.y * smoothstep(0.45, 1.0, lt);
          diffuseColor.rgb *= uTint * ao * crease * tip * rnd * (0.9 + 0.12 * th) * (1.0 - uComb.z + 2.0 * uComb.z * sh);
        }
        #else
        {
          vec3 q = vBase * uDensity;
          // clumping: strands lean toward low-frequency tuft centres as they rise → plush tufts
          vec3 qc = q * 0.2;
          vec3 cc = (floor(qc) + 0.5 + (fhash3(floor(qc)) - 0.5) * 0.7) / 0.2;
          #ifdef BENNY05
          q = mix(q, cc, vLayer * uClump);
          #else
          q = mix(q, cc, vLayer * 0.42);
          #endif
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
          #ifdef BENNY05
          // benny05.ts: colour = material colour x baked albedo map (map_fragment above); the shells only add the
          // root-to-tip occlusion and the per-strand variation on top of it
          diffuseColor.rgb *= mix(uRoot, uTip, smoothstep(0.0, 1.0, layer)) * ao * (0.92 + 0.16 * hgt);
          #else
          diffuseColor.rgb = mix(uRoot, uTip, smoothstep(0.0, 1.0, layer)) * ao * (0.92 + 0.16 * hgt);
          #endif
        }
        #endif`,
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
        #endif
        #if defined(BENNY_UV) && defined(BENNY05)
        gl_FragColor = vec4(vB05Uv, uMaskCol.r, vLayer); // QA bake pass (benny05.ts): uv, part id, shell layer
        #endif`,
      );
    shader.fragmentShader = shader.fragmentShader.replace('uniform vec3 uTip;', 'uniform vec3 uTip; uniform vec3 uMaskCol;');
  };
  material.customProgramCacheKey = () =>
    `benny-fur-${shells}${material.defines?.BENNY_MASK !== undefined ? '-mask' : ''}` +
    `${material.defines?.BENNY05 !== undefined ? '-b05' : ''}${material.defines?.BENNY20 !== undefined ? '-b20' : ''}` +
    `${material.defines?.BENNY_UV !== undefined ? '-uv' : ''}`;

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
