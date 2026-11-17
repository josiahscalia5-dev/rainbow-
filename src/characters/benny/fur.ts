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
    uSoft: { value: number };
    uSoftEdge: { value: number };
    uClumpScale: { value: number };
    uClumpVar: { value: number };
    uHi: { value: number };
    uTuft: { value: THREE.Vector4 };
    uTuft2: { value: THREE.Vector4 };
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
    /** benny08 round 3 (BENNY05 shader only): 0 = unchanged; >0 softer strands (less root occlusion + per-strand variation) */
    uSoft: { value: 0 },
    /** benny08 round 3 (BENNY05 shader only): 0 = unchanged; >0 shorter fur at the silhouette */
    uSoftEdge: { value: 0 },
    /** benny08 round 4 (BENNY05 shader only): tuft size (0.2 = unchanged), per-tuft tone, top-tip highlight (0 = off) */
    uClumpScale: { value: 0.2 },
    uClumpVar: { value: 0 },
    uHi: { value: 0 },
    /** benny08 round 6 (BENNY05 shader only; x = 0 → unchanged): soft layered fur CLUMPS instead of thin strands.
     *  x on (1), y clump cells per strand cell (smaller = bigger clumps), z comb (clump tips drawn downward / outward),
     *  w clump shading (dark gaps between clumps, lighter rounded clump bodies) */
    uTuft: { value: new THREE.Vector4(0, 0.33, 0.6, 0.35) },
    /** x dome power (<1 rounded clumps, >1 pointed yarn tufts), y fine-strand texture inside a clump, z tip lift toward
     *  white-pink / light violet, w comb direction (0 = down like shingles, 1 = straight out along the normal) */
    uTuft2: { value: new THREE.Vector4(0.6, 0.06, 0.12, 0) },
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
        varying vec2 vB05Uv; uniform float uSoftEdge;
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
        // uSoftEdge (benny08 round 3, 0 = unchanged): shorter fur where the surface turns edge-on to the camera
        // → a softer silhouette instead of a jagged strand fringe
        if (uSoftEdge > 0.0) {
          vec3 vn = normalize(normalMatrix * nrm);
          vec3 vp = normalize(-(modelViewMatrix * vec4(position, 1.0)).xyz);
          vLenMask *= mix(1.0, smoothstep(0.0, 0.55, abs(dot(vn, vp))), uSoftEdge);
        }
        #endif
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
        #ifdef BENNY05
        varying vec2 vB05Uv;
        uniform float uClump; uniform float uSoft; uniform float uClumpScale; uniform float uClumpVar; uniform float uHi;
        uniform vec4 uTuft; uniform vec4 uTuft2;
        #endif
        float fhash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
        vec3 fhash3(vec3 p) { return vec3(fhash(p), fhash(p + 17.31), fhash(p + 41.7)); }`,
      )
      .replace(
        '#include <color_fragment>',
        `#include <color_fragment>
        #ifdef BENNY05
        if (uTuft.x > 0.0) {
          // benny08 round 6: soft layered clumps (painted fur): big jittered cells, each a rounded dome whose outer
          // layers shrink toward the clump's core and are combed down, so neighbouring clumps overlap like shingles
          vec3 nb = normalize(vBase);
          vec3 comb = normalize(mix(vec3(0.0, -1.0, 0.0) - nb * dot(vec3(0.0, -1.0, 0.0), nb) + nb * 0.001, nb, uTuft2.w));
          vec3 q = vBase * uDensity * uTuft.y - comb * vLayer * uTuft.z;
          float best = 10.0, second = 10.0; vec3 bc = vec3(0.0);
          for (int k = 0; k < 8; k++) {
            vec3 o = vec3(float(k & 1), float((k >> 1) & 1), float((k >> 2) & 1));
            vec3 c = floor(q - 0.5) + o;
            vec3 jp = c + 0.5 + (fhash3(c) - 0.5) * 0.9;
            float d = length(q - jp);
            if (d < best) { second = best; best = d; bc = c; } else if (d < second) second = d;
          }
          float th = fhash(bc * 1.7 + 3.1);
          float layer = vLayer;
          float edge = second - best; // 0 on the border between two clumps
          if (layer > 0.001) {
            if (vLenMask < 0.05) discard;
            float clumpH = 0.7 + 0.3 * th;
            float u = clamp(layer / clumpH, 0.0, 1.0);
            float radius = 0.95 * pow(max(1.0 - u, 0.0), uTuft2.x);
            if (layer > clumpH || best > radius) discard;
          }
          // gentle shading: darker in the gaps between clumps and at the roots, lighter on the rounded clump bodies
          float body = smoothstep(0.0, 0.45, edge);
          float ao = mix(0.62, 1.0, smoothstep(0.0, 0.8, layer));
          float sh = mix(1.0 - uTuft.w, 1.0, body) * ao * (0.95 + 0.1 * th);
          // fine strand texture inside a clump (along the comb direction), no discards → soft, not grainy
          vec3 fq = vBase * uDensity * 2.0;
          sh *= 1.0 - uTuft2.y + uTuft2.y * 2.0 * fhash(floor(fq - comb * dot(fq, comb)));
          diffuseColor.rgb *= mix(uRoot, uTip, smoothstep(0.0, 1.0, layer)) * sh;
          diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.2 + vec3(0.05, 0.04, 0.06), uTuft2.z * smoothstep(0.5, 1.0, layer));
        } else
        #endif
        {
          vec3 q = vBase * uDensity;
          // clumping: strands lean toward low-frequency tuft centres as they rise → plush tufts
          #ifdef BENNY05
          // uClumpScale (benny08 round 4; 0.2 = unchanged): smaller = bigger tufts
          vec3 qc = q * uClumpScale;
          vec3 cc = (floor(qc) + 0.5 + (fhash3(floor(qc)) - 0.5) * 0.7) / uClumpScale;
          #else
          vec3 qc = q * 0.2;
          vec3 cc = (floor(qc) + 0.5 + (fhash3(floor(qc)) - 0.5) * 0.7) / 0.2;
          #endif
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
          // uSoft (benny08 round 3, 0 = unchanged): root occlusion and per-strand variation pulled toward their mean
          // → softer, less grainy fur at the same average tone
          if (uSoft > 0.0) { ao = mix(ao, 0.8, 0.6 * uSoft); hgt = mix(hgt, 0.5, uSoft); }
          diffuseColor.rgb *= mix(uRoot, uTip, smoothstep(0.0, 1.0, layer)) * ao * (0.92 + 0.16 * hgt);
          // benny08 round 4 (0 = unchanged): per-tuft tone (clump-scale light/dark like painted fur) and a soft
          // highlight on the upward-facing tuft tips (crown / shoulders), lifted toward white-pink
          if (uClumpVar > 0.0) diffuseColor.rgb *= 1.0 + uClumpVar * (fhash(floor(qc) * 1.31 + 7.7) - 0.5);
          if (uHi > 0.0) {
            float up = smoothstep(-0.1, 0.35, normalize(vBase).y) * smoothstep(0.3, 1.0, layer);
            diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.25 + vec3(0.06, 0.04, 0.05), uHi * up);
          }
          #else
          diffuseColor.rgb = mix(uRoot, uTip, smoothstep(0.0, 1.0, layer)) * ao * (0.92 + 0.16 * hgt);
          #endif
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
        #endif
        #if defined(BENNY_UV) && defined(BENNY05)
        gl_FragColor = vec4(vB05Uv, uMaskCol.r, vLayer); // QA bake pass (benny05.ts): uv, part id, shell layer
        #endif`,
      );
    shader.fragmentShader = shader.fragmentShader.replace('uniform vec3 uTip;', 'uniform vec3 uTip; uniform vec3 uMaskCol;');
  };
  material.customProgramCacheKey = () =>
    `benny-fur-${shells}${material.defines?.BENNY_MASK !== undefined ? '-mask' : ''}` +
    `${material.defines?.BENNY05 !== undefined ? '-b05' : ''}${material.defines?.BENNY_UV !== undefined ? '-uv' : ''}`;

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
