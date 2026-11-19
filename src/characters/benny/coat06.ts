import * as THREE from 'three';

/** Read the photographed locks in body-local longitude and latitude. Adjacent
 * levels use the original fur material. The vertex and animation paths are shared. */
export const coatSurface06 = `
  #ifdef RAINBOW_COAT06
  uniform sampler2D uCoatLocks06;
  #ifdef RAINBOW_REFERENCE_PINK
  uniform vec2 uReferenceLoops;
  uniform float uReferenceRelief;
  uniform vec3 uDyeLower, uDyeMiddle, uDyeUpper;
  #endif
  vec4 coatSurface(vec3 point) {
    vec3 n = normalize(point);
    float longitude = atan(n.x, n.z);
    float latitude = asin(clamp(n.y, -1.0, 1.0));
    #ifdef RAINBOW_REFERENCE_PINK
    vec2 uv = vec2(longitude * uReferenceLoops.x / 6.2831853, latitude * uReferenceLoops.y / 3.14159265);
    // Small continuous offsets break up rows of locks around the body. The phase is periodic
    // around the longitudinal seam and stays attached to the real mesh through animation.
    uv.y += .16 * sin(5.*longitude + 3.*latitude) + .10 * sin(8.*longitude - 1.7*latitude);
    #else
    vec2 uv = vec2(longitude * (12.0 / 6.2831853), latitude * (5.2 / 3.14159265));
    #endif
    // The locked fur swatch follows gravity. These continuous offsets comb the
    // locks toward the flanks with no screen-space or camera input.
    uv.x += 0.19 * sin(longitude * 2.0) * sin(latitude + 0.6);
    uv.y += 0.14 * cos(longitude * 3.0) * cos(latitude);
    return texture2D(uCoatLocks06, uv);
  }
  #endif
`;

export async function prepareCoat06(root: THREE.Object3D) {
  const body = root.getObjectByName('fur_body');
  if (!(body instanceof THREE.InstancedMesh) || !(body.material instanceof THREE.MeshStandardMaterial)) {
    throw new Error('Screen 06 coat requires the existing instanced fur body');
  }
  const original = body.material;
  const texture = await new THREE.TextureLoader().loadAsync(
    new URL('../../../assets/textures/match06/coat-locks.png', import.meta.url).href,
  );
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.NoColorSpace; // RGB is calibrated linear albedo, alpha is lock relief.
  texture.anisotropy = 4;
  const coat = original.clone();
  coat.defines = { ...original.defines, RAINBOW_COAT06: 1 };
  coat.onBeforeCompile = (shader, renderer) => {
    original.onBeforeCompile(shader, renderer);
    shader.uniforms.uCoatLocks06 = { value: texture };
  };
  coat.customProgramCacheKey = () => original.customProgramCacheKey() + '-photo-locks-06';
  return (active: boolean) => { body.material = active ? coat : original; };
}
