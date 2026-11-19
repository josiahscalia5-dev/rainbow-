import * as THREE from 'three';

export async function loadOriginalFibers06(): Promise<THREE.Texture | undefined> {
  if (typeof location === 'undefined') return undefined;
  const query = new URLSearchParams(location.search);
  if (query.get('match06') !== '1' || query.get('cx06BennyOriginalFibers') !== '1') return undefined;
  const atlas = await new THREE.TextureLoader().loadAsync(
    new URL('../../../assets/textures/match06/benny06_fibers.png', import.meta.url).href,
  );
  atlas.colorSpace = THREE.NoColorSpace;
  atlas.wrapS = atlas.wrapT = THREE.RepeatWrapping;
  atlas.minFilter = THREE.LinearMipmapLinearFilter;
  atlas.anisotropy = 4;
  return atlas;
}

export function applyOriginalFibers06(scene: THREE.Object3D, atlas: THREE.Texture): void {
  // Repeats are in the existing part's UV space. The source patches measure
  // 80 × 80 native pixels for the pink fur, 64 × 32 for knit and 56 × 56 for the pom.
  const parts = [
    { name: 'fur_body', repeat: [12, 6], channel: [1, 0, 0], strength: 0.76 },
    { name: 'fur_armL', repeat: [5, 3], channel: [1, 0, 0], strength: 0.64 },
    { name: 'fur_armR', repeat: [5, 3], channel: [1, 0, 0], strength: 0.64 },
    { name: 'hat_crown', repeat: [16, 4], channel: [0, 1, 0], strength: 1.10 },
    { name: 'hat_brim', repeat: [16, 2], channel: [0, 1, 0], strength: 0.90 },
    { name: 'fur_pom', repeat: [8, 4], channel: [0, 0, 1], strength: 0.71 },
  ];

  for (const part of parts) {
    const mesh = scene.getObjectByName(part.name) as THREE.Mesh | undefined;
    if (!mesh || !(mesh.material instanceof THREE.MeshStandardMaterial)) continue;
    // The shell materials are already private per actor and have a custom discard shader.
    // Copy the regular hat material so that other GLB instances keep their own material.
    const material = mesh instanceof THREE.InstancedMesh ? mesh.material : mesh.material.clone();
    const previous = material.onBeforeCompile;
    const cacheKey = material.customProgramCacheKey();
    material.customProgramCacheKey = () => cacheKey + '-screen06-original-fibers';
    material.onBeforeCompile = (shader, renderer) => {
      previous.call(material, shader, renderer);
      shader.uniforms.uOriginalFibers06 = { value: atlas };
      shader.uniforms.uFiberRepeat06 = { value: new THREE.Vector2(part.repeat[0], part.repeat[1]) };
      shader.uniforms.uFiberChannel06 = { value: new THREE.Vector3(part.channel[0], part.channel[1], part.channel[2]) };
      shader.uniforms.uFiberStrength06 = { value: part.strength };
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec2 vOriginalFiberUV06;')
        .replace('#include <uv_vertex>', '#include <uv_vertex>\nvOriginalFiberUV06 = uv;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
          uniform sampler2D uOriginalFibers06;
          uniform vec2 uFiberRepeat06;
          uniform vec3 uFiberChannel06;
          uniform float uFiberStrength06;
          varying vec2 vOriginalFiberUV06;`)
        .replace('#include <roughnessmap_fragment>', `
          float detail06 = dot(texture2D(uOriginalFibers06, vOriginalFiberUV06 * uFiberRepeat06).rgb, uFiberChannel06) - 0.5;
          diffuseColor.rgb *= exp2(2.0 * detail06 * uFiberStrength06);
          #include <roughnessmap_fragment>`);
    };
    material.needsUpdate = true;
    mesh.material = material;
  }
}
