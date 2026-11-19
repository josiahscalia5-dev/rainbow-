import * as THREE from 'three';

const swatches = {
  body: new URL('../../../assets/textures/match06/benny-reference-pink.png', import.meta.url).href,
  pom: new URL('../../../assets/textures/match06/benny-reference-pom.png', import.meta.url).href,
  cuff: new URL('../../../assets/textures/match06/benny-reference-cuff.png', import.meta.url).href,
  stitches: new URL('../../../assets/textures/match06/benny-reference-stitches.png', import.meta.url).href
};

function mesh(root: THREE.Object3D, name: string): THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial> {
  const object = root.getObjectByName(name);
  if (!(object instanceof THREE.Mesh) || !(object.material instanceof THREE.MeshStandardMaterial)) {
    throw new Error('Missing Benny cloth or fur mesh ' + name);
  }
  return object;
}

export async function prepareReferencePink06(root: THREE.Object3D) {
  const loader = new THREE.TextureLoader();
  const [pink, pomYarn, cuffYarn, stitches] = await Promise.all(Object.values(swatches).map(url => loader.loadAsync(url)));
  for (const texture of [pink,pomYarn,cuffYarn,stitches]) {
    texture.colorSpace = THREE.NoColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 4;
  }
  cuffYarn.colorSpace = THREE.SRGBColorSpace;
  cuffYarn.repeat.x = 7;
  const swaps: { mesh: THREE.Mesh; retained: THREE.MeshStandardMaterial; trial: THREE.MeshStandardMaterial }[] = [];
  const furParts = [
    { name: 'fur_body', skin: pink, repeats: [12.,5.2], relief: .009 },
    { name: 'fur_armL', skin: pink, repeats: [3.5,1.85], relief: .006 },
    { name: 'fur_armR', skin: pink, repeats: [3.5,1.85], relief: .006 },
    { name: 'fur_pom', skin: pomYarn, repeats: [5.1,2.6], relief: .011 }
  ];
  for (const part of furParts) {
    const partMesh = mesh(root,part.name);
    const retained = partMesh.material;
    const trial = retained.clone();
    trial.defines = { ...retained.defines, RAINBOW_COAT06: 1, RAINBOW_REFERENCE_PINK: 1 };
    trial.onBeforeCompile = (shader, renderer) => {
      retained.onBeforeCompile(shader,renderer);
      shader.uniforms.uCoatLocks06 = { value: part.skin };
      shader.uniforms.uReferenceLoops = { value: new THREE.Vector2(...part.repeats as [number,number]) };
      shader.uniforms.uReferenceRelief = { value: part.relief };
      const purple = part.name === 'fur_pom';
      shader.uniforms.uDyeLower = { value: purple ? new THREE.Vector3(.49,.50,.63) : new THREE.Vector3(.72,1.13,.73) };
      shader.uniforms.uDyeMiddle = { value: purple ? new THREE.Vector3(.54,.51,.69) : new THREE.Vector3(.89,1.08,.84) };
      shader.uniforms.uDyeUpper = { value: purple ? new THREE.Vector3(.63,.65,.74) : new THREE.Vector3(.97,1.94,1.30) };
    };
    trial.customProgramCacheKey = () => retained.customProgramCacheKey() + '-s06-reference-yarn';
    swaps.push({ mesh: partMesh, retained, trial });
  }

  const cuff = mesh(root,'hat_brim');
  const rib = cuff.material.clone();
  rib.color.setScalar(1);
  rib.map = cuffYarn;
  rib.normalMap = null;
  rib.bumpMap = cuffYarn;
  rib.bumpScale = .016;
  swaps.push({ mesh: cuff, retained: cuff.material, trial: rib });

  const crown = mesh(root,'hat_crown');
  const knit = crown.material.clone();
  knit.onBeforeCompile = shader => {
    shader.uniforms.uKnit = { value: stitches };
    shader.fragmentShader = 'uniform sampler2D uKnit;\n' + shader.fragmentShader
      .replace('#include <map_fragment>', `#include <map_fragment>
        float knitHeight = texture2D(uKnit, vMapUv * vec2(1.65,3.8)).r;
        float paleYarn = smoothstep(.32,.72,diffuseColor.g);
        diffuseColor.rgb *= (.40 + .98*knitHeight) * mix(vec3(1.02,.97,.98),vec3(.90,1.46,1.04),paleYarn);
        diffuseColor.rgb += (1.-paleYarn)*vec3(.013,.008,0.);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        vec3 sx = dFdx(-vViewPosition), sy = dFdy(-vViewPosition);
        vec3 rx = cross(sy,normal), ry = cross(normal,sx);
        float determinant = dot(sx,rx);
        normal = normalize(abs(determinant)*normal -
          sign(determinant)*.0035*(dFdx(knitHeight)*rx+dFdy(knitHeight)*ry));`);
  };
  knit.customProgramCacheKey = () => 's06-camera-fitted-knit';
  swaps.push({ mesh: crown, retained: crown.material, trial: knit });

  const star = mesh(root,'hat_star');
  const enamel = star.material.clone();
  enamel.color.setRGB(1.,.89,.008);
  enamel.emissive.setRGB(.76,.53,.006);
  enamel.emissiveIntensity = .085;
  enamel.metalness = .23;
  enamel.roughness = .26;
  enamel.onBeforeCompile = shader => {
    shader.vertexShader = 'varying float starFace;\n' + shader.vertexShader
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nstarFace=abs(objectNormal.z);');
    shader.fragmentShader = 'varying float starFace;\n' + shader.fragmentShader
      .replace('#include <color_fragment>', '#include <color_fragment>\ndiffuseColor.rgb *= mix(vec3(.88,.48,.70),vec3(1.),smoothstep(.25,.95,starFace));');
  };
  enamel.customProgramCacheKey = () => 's06-yellow-star-bevel';
  swaps.push({ mesh: star, retained: star.material, trial: enamel });

  const hat = root.getObjectByName('hat')!;
  const pom = root.getObjectByName('fur_pom')!;
  const rest = { position: hat.position.clone(), quaternion: hat.quaternion.clone(), scale: hat.scale.clone(), pom: pom.scale.clone() };
  // Fit only the removable garment to the approved photograph. Move in the original hat's
  // own coordinates so the player's animation, swim lean and pom spring still drive it.
  const offset = new THREE.Vector3(-.04387,-.06257,.00123).applyQuaternion(rest.quaternion);
  const orientation = rest.quaternion.clone().multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(.33189,0.,-.00456,'ZXY')));
  const trialScale = rest.scale.clone().multiplyScalar(.90840);
  let previous: boolean | undefined;
  return (active: boolean) => {
    if (active === previous) return;
    previous = active;
    for (const swap of swaps) swap.mesh.material = active ? swap.trial : swap.retained;
    hat.position.copy(rest.position);
    if (active) hat.position.add(offset);
    hat.quaternion.copy(active ? orientation : rest.quaternion);
    hat.scale.copy(active ? trialScale : rest.scale);
    pom.scale.copy(rest.pom);
    if (active) pom.scale.y *= .83571;
  };
}
