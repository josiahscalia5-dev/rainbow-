/**
 * Rainbow water system (water-fx-specialist + foam-bubbles-particles).
 *
 *   const water = createWater(course, { quality: 'high' });
 *   scene.add(water.group);
 *   // per frame:
 *   water.update(time, dt, bennyS, camera);
 *   water.wake(bennyPos, forward, right, speed, dt);
 *   // cinematic controls (0..1): water.controls.drumSwirl / drumAgitation / outro
 *
 * Benny rides ON the water: place his body centre at
 *   course.pointAt(s, lateral, water.surfaceHeight(s, lateral, time) + BENNY_RIDE_OFFSET)
 * (BENNY_RIDE_OFFSET ≈ 0.55 for a 0.8-radius body: bottom third in the water, splash visible).
 */
import * as THREE from 'three';
import { type Course, WORLD, funnelY } from '../world/course';
import { createRibbon } from './waterRibbon';
import { createWhirlpool, whirlpoolHeight, FUNNEL_LIFT } from './whirlpool';
import { createDrumWater } from './drumWater';
import { createFinalWave } from './finalWave';
import { createPuddles } from './puddles';
import { createFoam } from './foam';
import { createBubbles } from './bubbles';
import { createSpray } from './spray';

export { PALETTE } from './glsl';
export const BENNY_RIDE_OFFSET = 0.55;

export interface WaterControls {
  /** 02 tumble: spinning water shell on the Drum A wall (0..1) */
  drumSwirl: number;
  /** Drum A swell size: 0 calm (01) .. 1 spin cycle (02) */
  drumAgitation: number;
  /** 11 outro: stream drains away (0..1) and leftover puddles appear */
  outro: number;
}

export interface WaterSystem {
  group: THREE.Group;
  /** call every frame; focusS = Benny's arc-length (for pooling/LOD of bubbles & foam) */
  update(time: number, dt: number, focusS: number, camera: THREE.Camera): void;
  /** height of the animated water surface above the course centreline frame at (s, lateral) */
  surfaceHeight(s: number, lateral: number, time: number): number;
  /** spray/wake at Benny: call each frame while riding */
  wake(pos: THREE.Vector3, forward: THREE.Vector3, right: THREE.Vector3, speed: number, dt: number): void;
  splash(pos: THREE.Vector3, up: THREE.Vector3, strength: number): void;
  /** cinematic controls */
  controls: WaterControls;
  /** sub-systems (for visibility overrides / debugging) */
  parts: Record<string, THREE.Object3D>;
  /** live stats for perf reporting */
  stats(): { instances: number; bubbles: number; smallBubbles: number; sprayCapacity: number };
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function createWater(course: Course, opts: { quality?: 'high' | 'low' } = {}): WaterSystem {
  const quality = opts.quality ?? 'high';
  const group = new THREE.Group();
  group.name = 'water_system';

  const drainMark = course.marks['02_drain'] ?? course.stage('02').s1 - 2;
  const st03 = course.stage('03'), st04 = course.stage('04'), st08 = course.stage('08'), st09 = course.stage('09');
  const ribbonS0 = drainMark - 1;
  const ribbon = createRibbon(course, { s0: ribbonS0, s1: course.length, quality });
  // open the funnel where the 04 slide tube leaves the basin (the course exits the spiral at
  // r≈2.8, just outside the drain hole, and the slide then runs beneath the funnel surface)
  const cutPts: THREE.Vector3[] = [];
  for (let i = 0; i < 8; i++) {
    const s = st04.s0 - 3 + (i / 7) * 34;
    const f = course.sample(s);
    cutPts.push(f.pos.clone().addScaledVector(f.up, 1.2));
  }
  const whirl = createWhirlpool(quality, { points: cutPts, radius: Math.max(3.6, course.stage('04').tube * 0.85) });
  const drum = createDrumWater(quality);
  const wave = createFinalWave(course, quality);
  const puddles = createPuddles();
  const foam = createFoam(course, { s0: ribbonS0, s1: course.length, quality });
  const bubbles = createBubbles(course, { quality, sStart: ribbonS0 });
  const spray = createSpray(quality);
  group.add(ribbon.mesh, whirl.mesh, drum.group, wave.mesh, puddles.group, foam.group, bubbles.group, spray.points);

  const controls: WaterControls = { drumSwirl: 0, drumAgitation: 0, outro: 0 };
  let focus = 0;
  let curTime = 0;
  const tmpV = new THREE.Vector3();
  const tmpV2 = new THREE.Vector3();
  const rnd = (a: number, b: number) => a + Math.random() * (b - a);

  /** 0 = ribbon fully shown, 1 = whirlpool surface takes over (mirrors the ribbon vertex shader) */
  const whirlBlend = (s: number) => smooth(st03.s0 + 0.5, st03.s0 + 3.5, s) * (1 - smooth(st04.s0 - 9, st04.s0 - 1.5, s));

  const surfaceHeight = (s: number, lateral: number, t: number): number => {
    if (s < ribbonS0) {
      // Drum A: absolute swell height relative to the course point
      const p = course.pointAt(s, lateral, 0, tmpV);
      const up = course.sample(s).up;
      return (drum.heightAt(p.x, p.z, t) - p.y) / Math.max(0.3, up.y);
    }
    const hr = ribbon.heightAt(s, lateral, t);
    const k = whirlBlend(s);
    if (k <= 0) return hr;
    const f = course.sample(s);
    const p = tmpV.copy(f.pos).addScaledVector(f.right, lateral);
    const b = WORLD.basin;
    const r = Math.hypot(p.x - b.center.x, p.z - b.center.z);
    const yW = funnelY(r) + FUNNEL_LIFT + whirlpoolHeight(p.x, p.z, t);
    const hw = (yW - p.y) / Math.max(0.3, f.up.y);
    return hr * (1 - k) + hw * k;
  };

  return {
    group,
    controls,
    parts: { ribbon: ribbon.mesh, whirlpool: whirl.mesh, drum: drum.group, drumSwirl: drum.swirl, finalWave: wave.mesh, puddles: puddles.group, foam: foam.group, bubbles: bubbles.group, spray: spray.points },
    surfaceHeight,
    stats: () => ({ instances: foam.instanceCount, bubbles: bubbles.counts.big, smallBubbles: bubbles.counts.small, sprayCapacity: spray.capacity }),
    update(time, dt, focusS, camera) {
      focus = focusS;
      curTime = time;
      ribbon.uniforms.uTime.value = time;
      whirl.uniforms.uTime.value = time;
      drum.uniforms.uTime.value = time;
      drum.uniforms.uAgitation.value = controls.drumAgitation;
      drum.swirlUniforms.uSwirl.value = controls.drumSwirl;
      drum.swirl.visible = controls.drumSwirl > 0.001;
      wave.uniforms.uTime.value = time;
      puddles.uniforms.uTime.value = time;
      puddles.uniforms.uAmount.value = controls.outro;
      (ribbon.uniforms.uOutro.value as THREE.Vector2).x = controls.outro;
      puddles.group.visible = controls.outro > 0.001;
      // region visibility (perf): only what the camera around focusS can see
      drum.group.visible = focusS < st03.s0 + 12;
      whirl.mesh.visible = focusS > drainMark - 8 && focusS < st04.s0 + 45;
      wave.mesh.visible = focusS > st08.s0 - 25;
      // when Benny is off the ribbon (drum / whirlpool), no ribbon wake
      if (focusS < ribbonS0 || whirlBlend(focusS) > 0.5) (ribbon.uniforms.uBenny.value as THREE.Vector3).z = 0;
      foam.update(time, focusS);
      bubbles.update(time, dt, focusS, camera);
      // crest spray off the final wave
      if (wave.mesh.visible && focusS > st09.s0 - 20 && focusS < st09.s1 + 20 && controls.outro < 0.5) {
        const n = quality === 'high' ? 3 : 1;
        for (let i = 0; i < n; i++) {
          const c = wave.crest[(Math.random() * wave.crest.length) | 0];
          if (!c) break;
          const f = course.sample(Math.min(course.length, Math.max(0, focusS)));
          tmpV2.copy(f.right).multiplyScalar(rnd(1, 3.5)).addScaledVector(f.up, rnd(1.5, 4)).addScaledVector(f.tan, rnd(-1, 2));
          spray.emit(c, tmpV2, rnd(0.08, 0.2), rnd(0.5, 1.0));
        }
      }
      spray.update(dt, camera);
    },
    wake(pos, forward, right, speed, dt) {
      const s = focus;
      if (s >= ribbonS0 && whirlBlend(s) < 0.5) {
        const f = course.sample(s);
        const lateral = tmpV.copy(pos).sub(f.pos).dot(f.right);
        (ribbon.uniforms.uBenny.value as THREE.Vector3).set(s, lateral, Math.min(1, speed / 8));
      }
      // side fans of droplets (refs 05/07/08/10)
      const rate = speed * (quality === 'high' ? 5 : 2);
      const n = Math.floor(rate * dt + Math.random());
      const up = tmpV2.crossVectors(right, forward).normalize();
      for (let i = 0; i < n; i++) {
        const side = Math.random() < 0.5 ? -1 : 1;
        const p = pos.clone().addScaledVector(right, side * rnd(0.55, 0.85)).addScaledVector(forward, rnd(-0.4, 0.2)).addScaledVector(up, rnd(-0.45, -0.2));
        const v = right.clone().multiplyScalar(side * rnd(1.2, 3.2)).addScaledVector(up, rnd(2.0, 4.5)).addScaledVector(forward, rnd(-1.5, 1.0));
        spray.emit(p, v, rnd(0.06, 0.16), rnd(0.35, 0.7));
      }
      void curTime;
    },
    splash(pos, up, strength) {
      const n = Math.round(30 * strength * (quality === 'high' ? 1 : 0.5));
      for (let i = 0; i < n; i++) {
        const dir = new THREE.Vector3(rnd(-1, 1), 0, rnd(-1, 1)).normalize().multiplyScalar(rnd(1, 4) * strength);
        dir.addScaledVector(up, rnd(3, 7) * strength);
        spray.emit(pos, dir, rnd(0.08, 0.22), rnd(0.5, 1.1));
      }
    },
  };
}
