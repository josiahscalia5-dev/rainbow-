/**
 * Shared image-based lighting for the candy-laundry look: a procedural "studio" of glowing
 * pink / magenta / gold / white panels baked into a PMREM environment once at load time.
 * Gold rings, chrome door, coins, star badges and glossy water all reflect it.
 */
import * as THREE from 'three';

export function createCandyEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#a8338f');
  const box = new THREE.BoxGeometry(1, 1, 1);
  const panel = (color: string, intensity: number, pos: [number, number, number], scale: [number, number, number]) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity), side: THREE.BackSide });
    const mesh = new THREE.Mesh(box, m);
    mesh.position.set(...pos);
    mesh.scale.set(...scale);
    scene.add(mesh);
  };
  // room shell (inside of a big box): magenta-violet
  const shell = new THREE.Mesh(new THREE.BoxGeometry(40, 30, 40), new THREE.MeshBasicMaterial({ color: '#7a2a9c', side: THREE.BackSide }));
  scene.add(shell);
  const p = (color: string, intensity: number, pos: [number, number, number], scale: [number, number, number]) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(intensity) });
    const mesh = new THREE.Mesh(box, m);
    mesh.position.set(...pos);
    mesh.scale.set(...scale);
    scene.add(mesh);
  };
  p('#ffffff', 6, [0, 14, 0], [18, 0.5, 18]); // big soft key from above
  p('#ffd27a', 4, [-19, 4, 0], [0.5, 10, 26]); // warm gold bounce left
  p('#ff5fd2', 3.5, [19, 2, 0], [0.5, 12, 26]); // hot pink right
  p('#6ff4ff', 2.6, [0, -2, -19], [24, 8, 0.5]); // cyan water glow from the front
  p('#ffffff', 5, [6, 6, 19], [6, 6, 0.5]); // small hard highlight behind camera
  p('#c76bff', 2, [0, -14, 0], [30, 0.5, 30]); // violet floor
  void panel;
  const pmrem = new THREE.PMREMGenerator(renderer);
  const rt = pmrem.fromScene(scene, 0.035);
  pmrem.dispose();
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.isMesh) (m.material as THREE.Material).dispose();
  });
  box.dispose();
  return rt.texture;
}

/** Standard renderer setup used by the game and the tools. */
export function createRenderer(canvas: HTMLCanvasElement, opts: { preserveDrawingBuffer?: boolean } = {}): THREE.WebGLRenderer {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: !!opts.preserveDrawingBuffer,
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 0.86;
  return renderer;
}
