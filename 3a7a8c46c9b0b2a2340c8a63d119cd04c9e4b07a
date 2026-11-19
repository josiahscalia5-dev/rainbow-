import type * as THREE from 'three';

/** What a procedural character builder returns; exported 1:1 to GLB by tools/model-lab. */
export interface BuiltModel {
  /** root group; origin + orientation contract documented per character */
  scene: THREE.Group;
  /** named animation clips targeting joint nodes by name (exported into the GLB) */
  animations: THREE.AnimationClip[];
}

/** Runtime handle for Benny (loaded from assets/models/benny.glb). */
export interface BennyRuntime {
  /** origin = centre of the round body; faces +Z (camera behind him looks toward -Z… see docs) */
  root: THREE.Group;
  /** 'happy' (default, open smile), 'dizzy' (spiral eyes, scene 02), 'peek' (01, wide eyes) */
  setExpression(e: 'happy' | 'dizzy' | 'peek'): void;
  /**
   * per-frame animation; swim 0..1 drives paddling paws/kicks, steer −1..1 leans, speed for
   * splash/pom bounce, tumble=true lets the caller spin root freely (scene 02)
   */
  update(dt: number, state: { swim: number; steer: number; speed: number; time: number; tumble?: boolean }): void;
  /** world-space radius of the body (for collisions/coin pickup and water contact) */
  radius: number;
}

/** Runtime handle for the ONE official cartoon girl (assets/models/rainbow_girl.glb). */
export interface GirlRuntime {
  /** origin = between the feet on the floor; faces +Z; height ≈ 26 units */
  root: THREE.Group;
  mixer: THREE.AnimationMixer;
  /** clip names: idle, walk, carryTowel, dropLoad, closeDoor, laundryCounter, leanReachTowel, holdTowel */
  play(name: string, opts?: { fade?: number; loop?: boolean; timeScale?: number }): void;
  update(dt: number): void;
  /** the right/left hand joints for attaching the carried towel */
  handL: THREE.Object3D;
  handR: THREE.Object3D;
}
