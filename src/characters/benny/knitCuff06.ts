import * as THREE from 'three';

/** Source yarn swatch fitted to the physical circumference of the Screen 06 cuff. */
export async function loadFittedCuff06(): Promise<THREE.Texture | undefined> {
  if (typeof location === 'undefined') return undefined;
  const query = new URLSearchParams(location.search);
  if (query.get('match06') !== '1' || query.get('cx06BennyFittedCuff') !== '1') return undefined;
  const texture = await new THREE.TextureLoader().loadAsync(
    new URL('../../../assets/textures/match06/benny06_cuff.png', import.meta.url).href,
  );
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.repeat.x = 7;
  texture.anisotropy = 4;
  return texture;
}

export function applyFittedCuff06(scene: THREE.Object3D, yarn: THREE.Texture): void {
  const cuff = scene.getObjectByName('hat_brim');
  if (!(cuff instanceof THREE.Mesh) || !(cuff.material instanceof THREE.MeshStandardMaterial)) return;
  const material = cuff.material.clone();
  material.color.setScalar(1);
  material.map = yarn;
  // The same measured stitches provide local relief on the curved, rough cloth.
  material.normalMap = null;
  material.bumpMap = yarn;
  material.bumpScale = 0.018;
  cuff.material = material;
}
