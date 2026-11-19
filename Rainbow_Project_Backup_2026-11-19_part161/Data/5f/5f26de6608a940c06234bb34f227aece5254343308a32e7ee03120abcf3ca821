/**
 * Rainbow water system (water-fx-specialist + foam-bubbles-particles).
 *
 *   const water = createWater(course, { quality: 'high' });
 *   scene.add(water.group);
 *   // per frame:
 *   water.update(time, dt, bennyS, camera);
 *   water.wake(bennyBodyCentre, forward, right, speed, dt);   // centre of the (lifted) body, not the root
 *   // cinematic controls (0..1): water.controls.drumSwirl / drumAgitation / outro
 *
 * Benny rides ON the water: place his body centre at
 *   course.pointAt(s, lateral, water.surfaceHeight(s, lateral, time) + BENNY_RIDE_OFFSET)
 * (BENNY_RIDE_OFFSET ≈ 0.55 for a 0.8-radius body: bottom third in the water, splash visible).
 */
import * as THREE from 'three';
import { type Course, WORLD, funnelY } from '../world/course';
import { createRibbon, PROJ05, flag05 } from './waterRibbon';
import { createWhirlpool, whirlpoolHeight, FUNNEL_LIFT } from './whirlpool';
import { createDrumWater } from './drumWater';
import { createFinalWave } from './finalWave';
import { createPuddles } from './puddles';
import { createFoam } from './foam';
import { createBubbles } from './bubbles';
import { createSpray } from './spray';
import { createRiderSplash, createRiderSplash05, FAN } from './riderSplash';

export { PALETTE } from './glsl';
export const BENNY_RIDE_OFFSET = 0.55;
/** Benny's outer (fur) radius near the waterline: skin 0.7 + fur 0.12 + lower-body bulge (benny/build.ts BENNY_DIMS) */
const BENNY_OUTER_R = 0.86;

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
  /** `?proj05=1`: resolves when the projection textures are loaded (undefined otherwise) */
  ready?: Promise<void>;
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
  const foam = createFoam(course, { s0: ribbonS0, s1: course.length, quality, height: (s, lat, t) => ribbon.heightAt(s, lat, t) });
  const bubbles = createBubbles(course, { quality, sStart: ribbonS0 });
  const spray = createSpray(quality);
  const crown = createRiderSplash(quality);
  // wave 8: 05 has its own splash (whitewater ropes + froth collar + low crown), cross-faded by w05 below
  const crown05 = createRiderSplash05(quality);
  const st05 = course.stage('05');
  const w05At = (s: number) => smooth(st05.s0 + 2, st05.s0 + 5, s) * (1 - smooth(st05.s1 - 5, st05.s1 - 2, s));
  group.add(ribbon.mesh, whirl.mesh, drum.group, wave.mesh, puddles.group, foam.group, bubbles.group, spray.points, crown.mesh, crown05.mesh);

  const parts: Record<string, THREE.Object3D> = { ribbon: ribbon.mesh, whirlpool: whirl.mesh, drum: drum.group, drumSwirl: drum.swirl, finalWave: wave.mesh, puddles: puddles.group, foam: foam.group, foamBerm: foam.berm, foamRafts: foam.rafts, foamRim05: foam.rim05, foamFlank: foam.flank, bubbles: bubbles.group, bubblesSmall: bubbles.small, bubblesBig: bubbles.big, spray: spray.points, splashCrown: crown.mesh, splash05: crown05.mesh };
  const controls: WaterControls = { drumSwirl: 0, drumAgitation: 0, outro: 0 };
  // QA: ?waterhide=crown,spray,bubbles,foam,foamBerm,ribbon … hides water parts (isolation captures)
  const qaHide = typeof location !== 'undefined' ? (new URLSearchParams(location.search).get('waterhide') ?? '').split(',').filter(Boolean) : [];
  // `?proj05=1`: the approved picture's own fluffy foam is baked into the river texture, so the three Screen-05-only foam
  // parts (rim puffs, flank sheet, flank puffs) step aside; `?projfoam05=1` keeps them. No other screen's foam changes.
  if (PROJ05 && !flag05('projfoam05')) qaHide.push('foamRim05', 'foamFlank', 'foamRafts');
  /** `waterhide=ribbonWake`: keep the ribbon but switch off its Benny contact/wake block */
  const qaNoRibbonWake = qaHide.includes('ribbonWake');
  let focus = 0;
  let curTime = 0;
  const tmpV = new THREE.Vector3();
  const tmpV2 = new THREE.Vector3();
  const tmpV3 = new THREE.Vector3();
  // spray fan scratch (no per-frame allocation)
  const sprP = new THREE.Vector3();
  const sprV = new THREE.Vector3();
  const back = new THREE.Vector3();
  const lastWake = new THREE.Vector3();
  const riderVel = new THREE.Vector3();
  let lastWakeT = -1;
  // seeded RNG for the spray: re-seeded whenever Benny jumps (checkpoint / respawn), so QA frames are
  // deterministic and comparable between runs
  let seed = 0x5eed;
  const rand = () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const rnd = (a: number, b: number) => a + rand() * (b - a);
  let lastFocusSeed = -1e9;
  let qaCamera: THREE.Camera | null = null;

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

  // QA (?qa=1): window.__waterQA() reports what the VFX put on screen (bubble sizes/positions, foam
  // rafts) for the capture scripts; read-only, nothing is allocated unless it is called
  if (typeof window !== 'undefined' && new URLSearchParams(location.search).has('qa')) {
    (window as unknown as { __waterQA: () => unknown }).__waterQA = () => {
      const cam = qaCamera as THREE.PerspectiveCamera | null;
      if (!cam) return null;
      const w = window.innerWidth, h = window.innerHeight;
      return { bubbles: bubbles.qaScreen(cam, w, h), rafts: foam.qaRafts(), fanStrength: crown.uniforms.uStrength.value, waterlineR: ribbon.uniforms.uBennyR.value };
    };
  }

  return {
    group,
    controls,
    parts,
    ...(ribbon.ready ? { ready: ribbon.ready } : {}),
    surfaceHeight,
    stats: () => ({ instances: foam.instanceCount, bubbles: bubbles.counts.big, smallBubbles: bubbles.counts.small, sprayCapacity: spray.capacity }),
    update(time, dt, focusS, camera) {
      if (Math.abs(focusS - lastFocusSeed) > 25) seed = 0x5eed ^ Math.round(focusS * 16);
      lastFocusSeed = focusS;
      qaCamera = camera;
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
      foam.update(time, dt, focusS, controls.outro, camera);
      // `?proj05=1`: the approved picture's bubbles are part of the baked 05 water, so the game's own bubbles thin out
      // to none while Benny is on 05 (ramped over 3 u at both joins); `?projbub05=1` keeps them. Elsewhere unchanged.
      const bub05 = PROJ05 && !flag05('projbub05') ? 1 - w05At(focusS) : 1;
      bubbles.update(time, dt, focusS, camera, (1 - 0.7 * controls.outro) * bub05);
      // crest spray off the final wave
      if (wave.mesh.visible && focusS > st09.s0 - 20 && focusS < st09.s1 + 20 && controls.outro < 0.5) {
        const n = quality === 'high' ? 3 : 1;
        for (let i = 0; i < n; i++) {
          const c = wave.crest[(rand() * wave.crest.length) | 0];
          if (!c) break;
          const f = course.sample(Math.min(course.length, Math.max(0, focusS)));
          tmpV2.copy(f.right).multiplyScalar(rnd(1, 3.5)).addScaledVector(f.up, rnd(1.5, 4)).addScaledVector(f.tan, rnd(-1, 2));
          spray.emit(c, tmpV2, rnd(0.08, 0.2), rnd(0.5, 1.0));
        }
      }
      spray.update(dt, camera);
      crown.update(time, dt);
      crown05.update(time, dt);
      for (const k of qaHide) { const o = parts[k]; if (o) o.visible = false; }
    },
    wake(pos, forward, right, speed, dt) {
      // Benny's arc length / lateral from his actual position (focus lags one frame)
      const f0 = course.sample(Math.max(0, focus));
      const d = tmpV3.copy(pos).sub(f0.pos);
      const s = Math.min(course.length, Math.max(0, focus + d.dot(f0.tan)));
      const f = course.sample(s);
      d.copy(pos).sub(f.pos);
      const lateral = d.dot(f.right);
      // pos = Benny's real body centre (Game.ts passes it AFTER the runtime's ride lift). The waterline
      // radius is the chord of the fluffy ball at the water surface, so the contact foam, the crown and
      // the ribbon wake hug his actual footprint. (Deriving the radius from `above / BENNY_RIDE_OFFSET`
      // made it grow with the lift and drew a white contact band ~2x wider than the body.)
      const above = d.dot(f.up) - surfaceHeight(s, lateral, curTime);
      const waterlineR = Math.sqrt(Math.max(BENNY_OUTER_R * BENNY_OUTER_R - above * above, (0.35 * BENNY_OUTER_R) ** 2));
      const strength = Math.min(1, speed / 8);
      if (s >= ribbonS0 && whirlBlend(s) < 0.5 && !qaNoRibbonWake) {
        (ribbon.uniforms.uBenny.value as THREE.Vector3).set(s, lateral, strength);
        ribbon.uniforms.uBennyR.value = waterlineR;
      }
      // 3D V spray fans thrown back and outward from the waterline (ref 05)
      const center = tmpV.copy(pos).addScaledVector(f.up, -above);
      // wave 8: inside 05 the 05 splash takes over (w05 = 0 elsewhere: the shared fan is unchanged there)
      const w05 = w05At(s);
      crown.place(center, forward, f.up, waterlineR, w05 > 0 ? strength * (1 - w05) : strength);
      if (w05 > 0) crown05.place(center, forward, f.up, waterlineR, strength * w05);
      // Benny's measured velocity: droplets inherit it so the fan stays attached to him instead of
      // trailing 4-6 units back toward the chase camera (the old white spots at the frame bottom).
      // QA checkpoints hold him still, so the measured velocity is 0 there as well.
      if (lastWakeT >= 0 && dt > 1e-4 && lastWake.distanceToSquared(pos) < 9) riderVel.copy(pos).sub(lastWake).divideScalar(dt);
      else riderVel.set(0, 0, 0);
      lastWake.copy(pos);
      lastWakeT = curTime;
      // droplets thrown off the two streak fans: rooted on the flanks at the waterline and flying
      // back-outward along the same jet directions as riderSplash.ts (FAN), a short hop above the water
      // (ref 05: fine 3–12 px droplets all round the fans, a few flung up beside the body)
      // wave 8: in 05 (w05 > 0) more and finer droplets along the 05 rope fans (riderSplash.ts createRiderSplash05:
      // roots 1.5 -> 0.6 rad, directions 0.8 -> 0.2 rad); elsewhere the exact same numbers and rand() calls as before
      const rate = (quality === 'high' ? 150 : 55) * strength * (w05 > 0 ? 1 + 1.4 * w05 : 1);
      const n = Math.min(w05 > 0 ? 26 : 14, Math.floor(rate * dt + rand()));
      const up = tmpV2.copy(f.up);
      back.copy(forward).multiplyScalar(-1);
      for (let i = 0; i < n; i++) {
        const side = rand() < 0.5 ? -1 : 1;
        const a = rand();
        const thR = w05 > 0 ? 1.5 - 0.9 * a : FAN.root0 + (FAN.root1 - FAN.root0) * a;
        const phi = (w05 > 0 ? 0.8 - 0.6 * a : FAN.dir0 + (FAN.dir1 - FAN.dir0) * a) + rnd(-0.12, 0.12);
        const t0 = rnd(0.1, 0.55); // leave the jet part-way along it
        const rootR = Math.max(waterlineR, FAN.rootMin) * 0.95;
        sprP.copy(center)
          .addScaledVector(right, side * (Math.sin(thR) * rootR + Math.sin(phi) * t0 * 0.9))
          .addScaledVector(back, Math.cos(thR) * rootR + Math.cos(phi) * t0 * 0.9)
          .addScaledVector(up, rnd(0.04, 0.16));
        const sp = rnd(1.1, 2.6);
        sprV.copy(riderVel).addScaledVector(right, side * Math.sin(phi) * sp).addScaledVector(back, Math.cos(phi) * sp).addScaledVector(up, rnd(1.2, 3.0));
        spray.emit(sprP, sprV, w05 > 0 ? rnd(0.012, 0.04) : rnd(0.018, 0.05), rnd(0.3, 0.6));
      }
      // the 05 flank banks (foam.ts) keep clear of Benny's real waterline position
      foam.rider(s, lateral, strength);
    },
    splash(pos, up, strength) {
      const n = Math.round(30 * strength * (quality === 'high' ? 1 : 0.5));
      for (let i = 0; i < n; i++) {
        const dir = sprV.set(rnd(-1, 1), 0, rnd(-1, 1)).normalize().multiplyScalar(rnd(1, 4) * strength);
        dir.addScaledVector(up, rnd(3, 7) * strength);
        spray.emit(pos, dir, rnd(0.06, 0.16), rnd(0.5, 1.1));
      }
    },
  };
}
