/**
 * RAINBOW game: one connected 3D world, one continuous route.
 *   intro  (01–02)  real-time cinematic: the girl drops the towel bundle (Benny hidden) into Drum A,
 *                   closes the door and walks away; Benny peeks, then the spin tumbles him down the drain.
 *   ride   (03–10)  interactive: auto-propelled along the course, steer left/right, real coin pickups,
 *                   5 hearts (bumping the foam walls costs one), pause/resume.
 *   outro  (11)     real-time victory cinematic: Benny is hidden under the towel; the SAME girl opens the
 *                   door, folds/holds the towel without ever seeing him; FINAL SPIN COMPLETE.
 * window.__rainbow exposes a deterministic QA API used by scripts/capture.mjs.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { Course, StageId, WORLD } from '../world/course';
import { buildEnvironment } from '../world/environment';
import { createCandyEnvironment, createRenderer } from '../render/env';
import { createHud } from '../ui/hud';
import { createCoins, COIN_VALUE } from '../gameplay/coins';
import { createInput } from '../gameplay/input';
import { RideCamera } from './cameraRig';
import { loadBennyRuntime, loadGirlRuntime, loadWater, moduleStatus } from './modules';

type Mode = 'intro' | 'ride' | 'outro' | 'end';
const START_COINS = 1330;
const STAGE_ORDER: StageId[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
const sm = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);
const lerp = THREE.MathUtils.lerp;

/** intro timeline marks (seconds) */
const T = { dropEnd: 1.6, doorClose0: 1.9, doorClose1: 2.8, walk0: 3.0, peek: 4.4, cp01: 5.8, spin: 7.0, cp02: 9.2, drain: 11.0, rideStart: 13.6 };
/** outro timeline marks */
const O = { hide: 0.6, walk0: 0.0, door0: 1.1, door1: 2.1, lean0: 1.9, fold0: 2.7, fold1: 3.7, hold: 3.8, badge: 3.9, cp11: 5.2 };

export async function startGame(canvas: HTMLCanvasElement) {
  const qs = new URLSearchParams(location.search);
  const qaMode = qs.has('qa');
  const renderer = createRenderer(canvas, { preserveDrawingBuffer: qaMode });
  const dpr = qs.has('dpr') ? Number(qs.get('dpr')) : Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  const scene = new THREE.Scene();
  scene.environment = createCandyEnvironment(renderer);
  scene.background = new THREE.Color('#b23fb4');
  const fog = new THREE.FogExp2('#ffd6f2', 0.006);
  scene.fog = fog;
  scene.add(new THREE.HemisphereLight('#fff0ff', '#a33bb8', 1.15));
  const sun = new THREE.DirectionalLight('#fff4e6', 1.6);
  sun.position.set(0.3, 1, 0.45);
  scene.add(sun);
  scene.add(sun.target);
  const fill = new THREE.PointLight('#ffd8ff', 30, 30, 1.6);
  scene.add(fill);

  const camera = new THREE.PerspectiveCamera(66, 9 / 16, 0.05, 1200);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.55, 0.55, 0.82);
  const useBloom = qs.get('bloom') !== '0';
  if (useBloom) composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const resize = () => {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    composer.setSize(w, h);
    bloom.resolution.set(w / 2, h / 2);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  window.addEventListener('resize', resize);
  resize();

  // ---------------------------------------------------------------- world
  const course = new Course();
  const env = buildEnvironment(course);
  scene.add(env.group);
  const water = await loadWater(course);
  scene.add(water.group);
  const benny = await loadBennyRuntime();
  scene.add(benny.root);
  const girl = await loadGirlRuntime();
  const coins = createCoins(course);
  scene.add(coins.group);
  // debug: ?hide=water,benny,coins,drumA,basin,tubes,chamber
  const hidden = new Set((qs.get('hide') ?? '').split(',').filter(Boolean));
  if (hidden.has('water')) water.group.visible = false;
  if (hidden.has('coins')) coins.group.visible = false;
  const zoneHidden = (k: string) => hidden.has(k);
  const hud = createHud();
  const input = createInput(canvas);
  const rideCam = new RideCamera(course);

  // ---------------------------------------------------------------- state
  const st = {
    mode: 'intro' as Mode,
    t: 0, // time within the current mode
    clock: 0, // global animation time (shaders)
    frozen: null as number | null, // QA: freeze shader time
    s: 0,
    lat: 0,
    vlat: 0,
    coins: START_COINS,
    hearts: 5,
    paused: false,
    stage: '01' as StageId,
    bumpCooldown: 0,
    edgeTime: 0,
    twirl: 0,
    log: [] as { t: number; s: number; y: number; stage: StageId }[],
  };

  const stageOf = (s: number): StageId => course.stageAtS(s).id;

  const setStage = (id: StageId) => {
    if (st.stage === id) return;
    st.stage = id;
    hud.setStage(id);
    updateZones();
  };

  const zoneRanges: Record<keyof typeof env.zones, [StageId, StageId]> = {
    drumA: ['01', '03'],
    basin: ['02', '05'],
    tubes: ['03', '09'],
    chamber: ['07', '11'],
  };
  const updateZones = () => {
    const i = STAGE_ORDER.indexOf(st.stage);
    for (const [k, [a, b]] of Object.entries(zoneRanges)) {
      env.zones[k as keyof typeof env.zones].visible = !zoneHidden(k) && i >= STAGE_ORDER.indexOf(a) && i <= STAGE_ORDER.indexOf(b);
    }
    const inDrum = i <= 1;
    fog.density = inDrum ? 0.0025 : i >= 7 ? 0.004 : 0.006;
  };

  // girl placement helpers (she lives in laundry-room local frames)
  const placeGirl = (room: 'A' | 'C', local: THREE.Vector3, yaw: number) => {
    const anchor = room === 'A' ? env.roomA.anchor : env.roomC.anchor;
    if (girl.root.parent !== anchor) anchor.add(girl.root);
    girl.root.position.copy(local);
    girl.root.rotation.set(0, yaw, 0);
  };

  const bennyPose = (s: number, lat: number, time: number, out: { pos: THREE.Vector3; quat: THREE.Quaternion }) => {
    const f = course.sample(s);
    const h = water.surfaceHeight(s, lat, time);
    out.pos.copy(f.pos).addScaledVector(f.right, lat).addScaledVector(f.up, h + benny.radius * 0.55);
    const m = new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(f.up, f.tan).normalize(), f.up, f.tan);
    out.quat.setFromRotationMatrix(m);
    return f;
  };

  const pose = { pos: new THREE.Vector3(), quat: new THREE.Quaternion() };
  const tmpV = new THREE.Vector3();
  const doorAOpen = -1.9, doorCOpen = -1.75;

  // ---------------------------------------------------------------- intro (01–02)
  const introUpdate = (dt: number) => {
    const t = st.t;
    const dA = WORLD.drumA;
    const start = course.sample(0).pos;
    // --- girl: drop the load, close the door, walk away at normal pace (never looks back)
    const spots = env.roomA.spots;
    if (t < T.walk0) {
      placeGirl('A', new THREE.Vector3(1.2, spots.nearDoor.y, 7.6), Math.PI);
      girl.play(t < T.dropEnd ? 'dropLoad' : 'closeDoor', { fade: 0.25 });
    } else {
      const k = THREE.MathUtils.clamp((t - T.walk0 - 0.35) / 3.3, 0, 1);
      const from = new THREE.Vector3(1.2, spots.nearDoor.y, 7.6);
      const p = from.clone().lerp(spots.exitRight, k);
      const dir = spots.exitRight.clone().sub(from);
      const yawWalk = Math.atan2(dir.x, dir.z);
      const turn = sm(T.walk0, T.walk0 + 0.6, t);
      placeGirl('A', p, lerp(Math.PI, yawWalk, turn));
      girl.play('walk', { fade: 0.3 });
    }
    // --- door A
    env.doorA.rotation.y = lerp(doorAOpen, 0, sm(T.doorClose0, T.doorClose1, t));
    // --- towel bundle flies from her hands into the drum, Benny hidden inside
    const handW = girl.handR.getWorldPosition(tmpV).clone();
    const k = sm(0.35, T.dropEnd, t);
    const towelRest = start.clone().add(new THREE.Vector3(0.1, -0.85, 0.15));
    const arc = handW.clone().lerp(towelRest, k);
    arc.y += Math.sin(k * Math.PI) * 1.2;
    let sB = 0;
    if (t < T.spin) {
      env.drumTowel.mesh.position.copy(t < 0.35 ? handW : arc);
      env.drumTowel.mesh.rotation.set(0, 0.4, 0);
      env.drumTowel.setBundle(1);
      env.drumTowel.mesh.scale.setScalar(0.62);
      // Benny inside the bundle; peeks out only once she has turned away
      const peek = sm(T.peek, T.peek + 0.7, t);
      benny.root.visible = peek > 0.02;
      benny.setExpression('peek');
      bennyPose(0, 0, st.clock, pose);
      benny.root.position.copy(start).add(new THREE.Vector3(0, -1.0 + 0.95 * peek, 0));
      benny.root.quaternion.setFromEuler(new THREE.Euler(0, Math.PI + 0.25, 0)); // facing the camera (inside drum)
      benny.update(dt, { swim: 0, steer: 0, speed: 0, time: st.clock });
    } else {
      // spin: tumble along the 02 helix, then the chute
      const u = sm(T.spin, T.rideStart, t);
      const s03 = course.stage('03').s0;
      sB = s03 * (t < T.drain ? 0.55 * sm(T.spin, T.drain, t) : 0.55 + 0.45 * sm(T.drain, T.rideStart, t));
      void u;
      benny.root.visible = true;
      benny.setExpression(t < T.drain + 1.2 ? 'dizzy' : 'happy');
      const f = bennyPose(sB, 0, st.clock, pose);
      benny.root.position.copy(pose.pos);
      const tumble = sm(T.rideStart - 1.0, T.rideStart, t);
      const spinQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(t * 5.1, t * 3.3, t * 4.2));
      benny.root.quaternion.copy(spinQ).slerp(pose.quat, tumble);
      benny.update(dt, { swim: 0.4, steer: 0, speed: 8, time: st.clock, tumble: tumble < 0.99 });
      // towel lags behind and unravels in the drum
      const sT = Math.max(0, sB - 2.6);
      const ft = course.sample(Math.min(sT, course.marks['02_drain'] - 1));
      env.drumTowel.mesh.position.copy(ft.pos).addScaledVector(ft.up, -0.4);
      env.drumTowel.mesh.rotation.set(t * 0.8, t * 0.5, 0.3);
      env.drumTowel.setBundle(lerp(1, 0.45, sm(T.spin, T.cp02, t)));
      env.drumTowel.mesh.scale.setScalar(lerp(0.62, 0.8, sm(T.spin, T.cp02, t)));
      void f;
    }
    st.s = sB;
    // --- floating laundry
    const sw = t < T.spin ? 0 : (t - T.spin) * 1.6;
    env.laundry.sock.position.set(Math.cos(2.3 + sw) * 2.2 - 0.6, -1.5 + Math.sin(st.clock * 1.3) * 0.15 + Math.sin(2.3 + sw) * (t < T.spin ? 0 : 1.6), 0.6 - sw * 0.25);
    env.laundry.sock.rotation.set(0.3 + sw, 0.6, 0.9 + st.clock * 0.3);
    env.laundry.shirt.position.set(-2.0 + Math.cos(0.4 + sw) * (t < T.spin ? 0 : 2.0), -1.6 + Math.sin(st.clock * 1.1 + 1) * 0.15 + (t < T.spin ? 0 : Math.sin(0.4 + sw) * 2.2), 0.9 - sw * 0.2);
    env.laundry.shirt.rotation.set(-1.15 + sw * 0.7, 0.2 + sw, 0.15);
    env.laundry.shirt.scale.setScalar(0.62);
    env.laundry.sock.scale.setScalar(0.62);
    // --- cameras
    if (t < T.spin + 0.6) {
      // 01: inside the drum looking out through the door, Benny peeking in the foreground
      camera.position.set(-0.55, -0.95, -5.7);
      camera.up.set(0, 1, 0);
      camera.lookAt(0.25, -0.35, dA.zDoor);
      setFov(62);
    } else if (t < T.drain) {
      // 02: tumbling with the swirl; the door ring above
      const b = benny.root.position;
      const want = new THREE.Vector3(b.x * 0.35, b.y - 1.6, Math.max(dA.zBack + 0.6, b.z - 3.2));
      const k2 = sm(T.spin + 0.6, T.spin + 1.6, t);
      camera.position.lerp(want, k2 < 1 ? 0.12 : 0.2);
      const look = b.clone().lerp(new THREE.Vector3(0, 0.6, dA.zDoor), 0.45);
      camera.up.set(0, 1, 0);
      camera.lookAt(look);
      setFov(66);
    } else {
      // chute chase cam, blending into the ride camera framing for 03
      const kk = sm(T.drain, T.rideStart, t);
      const back = course.pointAt(Math.max(0, sB - 3.6), 0, 1.7);
      const look = course.pointAt(sB + 4, 0, 0.2);
      const rp = new THREE.Vector3(), rt = new THREE.Vector3(), ru = new THREE.Vector3();
      rideCam.desired(Math.max(course.stage('03').s0, sB), 0, rp, rt, ru);
      camera.position.lerp(back.lerp(rp, kk * kk), 0.15);
      camera.up.set(0, 1, 0);
      camera.lookAt(look.lerp(rt, kk * kk));
      setFov(lerp(66, 64, kk));
    }
    if (t >= T.rideStart) startRide();
  };

  const setFov = (f: number) => {
    if (Math.abs(camera.fov - f) > 0.01) { camera.fov = f; camera.updateProjectionMatrix(); }
  };

  const startRide = () => {
    st.mode = 'ride';
    st.t = 0;
    st.s = course.stage('03').s0;
    st.lat = 0;
    hud.setVisible(true);
    setStage('03');
    rideCam.pos.copy(camera.position);
    rideCam.target.copy(camera.position).add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(10));
    rideCam.fov = camera.fov;
    hud.showHint('Drag or hold left / right to steer');
    setTimeout(() => hud.showHint(null), 3500);
  };

  // ---------------------------------------------------------------- ride (03–10)
  const rideUpdate = (dt: number) => {
    input.update(dt);
    const stg = course.stageAtS(st.s);
    const speed = course.prop('speed', st.s);
    st.s = Math.min(course.stage('11').s0, st.s + speed * dt);
    const halfW = course.widthAt(st.s) / 2;
    const safe = halfW - 1.0;
    st.vlat += (input.steer * 7.5 - st.vlat) * Math.min(1, dt * 8);
    st.lat = THREE.MathUtils.clamp(st.lat + st.vlat * dt, -halfW + 0.55, halfW - 0.55);
    // foam-wall bump → lose a heart (with cooldown), bounce back toward the centre
    st.bumpCooldown = Math.max(0, st.bumpCooldown - dt);
    if (Math.abs(st.lat) > safe) st.edgeTime += dt; else st.edgeTime = 0;
    if (st.edgeTime > 0.35 && st.bumpCooldown <= 0) {
      st.hearts = Math.max(0, st.hearts - 1);
      hud.setHearts(st.hearts);
      hud.flashHurt();
      st.bumpCooldown = 1.6;
      st.vlat = -Math.sign(st.lat) * 9;
      water.splash(benny.root.position, course.sample(st.s).up, 1);
      if (st.hearts === 0) {
        // restart this stage with full hearts (checkpoint), coins kept
        st.hearts = 5;
        hud.setHearts(5);
        st.s = stg.s0;
        st.lat = 0;
      }
    }
    // coins
    const got = coins.update(st.clock, dt, st.s, st.lat);
    if (got) { st.coins += got * COIN_VALUE; hud.setCoins(st.coins); }
    setStage(stageOf(st.s));
    // Benny
    const f = bennyPose(st.s, st.lat, st.clock, pose);
    benny.root.position.copy(pose.pos);
    const lean = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -input.steer * 0.25);
    // 03 whirlpool twirl: Benny spins around his up axis while riding the vortex
    st.twirl = st.stage === '03' ? st.twirl + dt * 2.2 : st.twirl * Math.max(0, 1 - dt * 3);
    const tw = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), st.stage === '03' ? Math.PI + Math.sin(st.twirl) * 0.9 : 0);
    benny.root.quaternion.copy(pose.quat).multiply(tw).multiply(lean);
    benny.root.visible = true;
    benny.setExpression('happy');
    benny.update(dt, { swim: 1, steer: input.steer, speed, time: st.clock });
    water.wake(pose.pos, f.tan, f.right, speed, dt);
    // camera
    rideCam.update(dt, st.s, st.lat, camera);
    // towel: folded in 08/09, lifted into a tent as the stream reaches it (late 09 → 10)
    env.towel.setTent(sm(course.stage('09').s1 - 6, course.stage('10').s0 + 2, st.s));
    // girl at the counter behind the door glass in 10 (back turned — never sees Benny)
    if (st.stage === '09' || st.stage === '10') {
      placeGirl('C', env.roomC.spots.counter.clone().add(new THREE.Vector3(-14, 0, 6)), 0.15);
      girl.play('laundryCounter', { fade: 0.3 });
    }
    env.doorC.rotation.y = 0;
    st.log.push({ t: st.clock, s: st.s, y: benny.root.position.y, stage: st.stage });
    if (st.log.length > 20000) st.log.shift();
    if (st.s >= course.stage('11').s0 - 0.01) startOutro();
  };

  // ---------------------------------------------------------------- outro (11)
  let girlLeanOffset: THREE.Vector3 | null = null;
  const startOutro = () => {
    st.mode = 'outro';
    st.t = 0;
    setStage('11');
    girlLeanOffset = null;
  };
  const outroUpdate = (dt: number) => {
    const t = st.t;
    const sEnd = course.stage('11').s0;
    // Benny finishes sliding under the tent and is hidden (still there, just unseen)
    bennyPose(sEnd, 0, st.clock, pose);
    benny.root.position.copy(pose.pos).addScaledVector(course.sample(sEnd).tan, 0.6 * sm(0, O.hide, t));
    benny.root.quaternion.copy(pose.quat);
    benny.root.visible = t < O.hide;
    benny.update(dt, { swim: 0.2, steer: 0, speed: 2, time: st.clock });
    // door opens outward
    env.doorC.rotation.y = lerp(0, doorCOpen, sm(O.door0, O.door1, t));
    // girl: from the counter to the door, leans in, hands on the towel, folds/holds it
    const doorSpot = new THREE.Vector3(0, env.roomC.spots.nearDoor.y, 4.2);
    if (t < O.lean0) {
      const from = env.roomC.spots.counter.clone().add(new THREE.Vector3(-14, 0, 6));
      const k = sm(0.0, O.lean0 - 0.2, t);
      placeGirl('C', from.lerp(doorSpot, k), lerp(0.15, Math.PI, sm(0, 0.6, t)));
      girl.play(k < 0.98 ? 'walk' : 'idle', { fade: 0.3 });
    } else {
      placeGirl('C', doorSpot, Math.PI);
      girl.play(t < O.hold ? 'leanReachTowel' : 'holdTowel', { fade: 0.35, loop: t >= O.hold });
      // align her hands onto the towel once the lean pose is reached
      if (!girlLeanOffset && t > O.lean0 + 0.9) {
        girl.root.updateMatrixWorld(true);
        const hl = girl.handL.getWorldPosition(new THREE.Vector3());
        const hr = girl.handR.getWorldPosition(new THREE.Vector3());
        const mid = hl.add(hr).multiplyScalar(0.5);
        const towelTop = env.towel.mesh.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 2.4, 1.2));
        const delta = towelTop.sub(mid);
        const inv = env.roomC.anchor.getWorldQuaternion(new THREE.Quaternion()).invert();
        girlLeanOffset = delta.applyQuaternion(inv);
        girlLeanOffset.y = 0;
        girlLeanOffset.clampLength(0, 6);
      }
      if (girlLeanOffset) girl.root.position.add(girlLeanOffset.clone().multiplyScalar(sm(O.lean0 + 0.9, O.lean0 + 1.6, t)));
    }
    env.towel.setTent(1 - sm(O.fold0, O.fold1, t));
    // camera: the 11 composition — inside the drum, platform & towel centre, open door upper-right
    const P = WORLD.platform;
    const camPos = new THREE.Vector3(P.center.x - 1.2, P.topY + 6.2, P.center.z + 15.5);
    const camLook = new THREE.Vector3(P.center.x + 1.2, P.topY + 1.2, P.center.z - 3.2);
    const k = sm(0, 1.4, t);
    const rp = new THREE.Vector3(), rt = new THREE.Vector3(), ru = new THREE.Vector3();
    rideCam.desired(sEnd, 0, rp, rt, ru);
    camera.position.copy(rp.lerp(camPos, k));
    camera.up.set(0, 1, 0);
    camera.lookAt(rt.lerp(camLook, k));
    setFov(lerp(70, 60, k));
    if (t >= O.badge && st.mode === 'outro') {
      hud.showVictory(true, true);
      st.mode = 'end';
    }
  };

  // ---------------------------------------------------------------- loop
  hud.setVisible(false);
  hud.setCoins(st.coins);
  hud.setHearts(st.hearts);
  hud.setStage('03');
  updateZones();
  hud.onPause(() => togglePause());
  hud.onReplay(() => resetToIntro());
  input.onKey((k) => { if (k === 'p' || k === 'P' || k === 'Escape') togglePause(); });
  input.onTap(() => {
    if (st.mode === 'intro' && st.t > 0.5 && !qs.has('qa')) { st.t = Math.max(st.t, T.rideStart - 2.0); }
  });
  const togglePause = () => {
    if (st.mode !== 'ride') return;
    st.paused = !st.paused;
    hud.showPaused(st.paused);
  };
  const resetToIntro = () => {
    st.mode = 'intro'; st.t = 0; st.s = 0; st.lat = 0; st.coins = START_COINS; st.hearts = 5; st.paused = false;
    coins.resetUntil(-1);
    hud.setCoins(st.coins); hud.setHearts(5); hud.setVisible(false); hud.showVictory(false); hud.showPaused(false);
    st.stage = '01'; updateZones();
    env.towel.setTent(0);
    env.doorC.rotation.y = 0;
    benny.root.visible = true;
  };

  const stepSim = (dt: number) => {
    if (st.paused) return;
    st.t += dt;
    if (st.frozen === null) st.clock += dt;
    if (st.mode === 'intro') introUpdate(dt);
    else if (st.mode === 'ride') rideUpdate(dt);
    else if (st.mode === 'outro' || st.mode === 'end') {
      outroUpdate(dt);
    }
    girl.update(dt);
    const time = st.frozen ?? st.clock;
    env.update(time, dt);
    water.update(time, dt, st.s, camera);
    fill.position.copy(camera.position);
    sun.target.position.copy(camera.position).add(new THREE.Vector3(0, -10, -10));
  };

  let last = performance.now();
  let fps = 60;
  let running = !qaMode;
  let dirty = true;
  const render = () => { if (useBloom) composer.render(); else renderer.render(scene, camera); };
  const frame = () => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    fps += (1 / Math.max(dt, 1e-3) - fps) * 0.05;
    if (running) stepSim(dt);
    // QA mode renders on demand only (software WebGL is slow; frames are deterministic)
    if (!qaMode || running || dirty) { render(); dirty = false; }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  // ---------------------------------------------------------------- QA API
  const CHECKPOINTS: Record<string, { mode: Mode; t?: number; s?: number; lat?: number }> = {
    '01': { mode: 'intro', t: T.cp01 },
    '02': { mode: 'intro', t: T.cp02 },
    '03': { mode: 'ride', s: course.stage('03').s0 + 4.5, lat: 0.3 },
    '04': { mode: 'ride', s: course.stage('04').s0 + 3.5 },
    '05': { mode: 'ride', s: course.stage('05').s0 + 12 },
    '06': { mode: 'ride', s: course.stage('06').s0 + 10 },
    '07': { mode: 'ride', s: course.stage('07').s0 + 9 },
    '08': { mode: 'ride', s: course.stage('08').s0 + 2.0 },
    '09': { mode: 'ride', s: course.stage('09').s0 + 2.5 },
    '10': { mode: 'ride', s: course.stage('10').s0 + 3.0 },
    '11': { mode: 'outro', t: O.cp11 },
    '07a_plunge_top': { mode: 'ride', s: course.marks['07_plunge_top'] - 1 },
    '07b_plunge_mid': { mode: 'ride', s: (course.marks['07_plunge_top'] + course.marks['07_plunge_bottom']) / 2 },
    '07c_plunge_bottom': { mode: 'ride', s: course.marks['07_plunge_bottom'] - 3 },
    '07d_entering_08': { mode: 'ride', s: course.stage('08').s0 + 0.2 },
  };

  const gotoCheckpoint = (id: string, time = 12.0) => {
    const cp = CHECKPOINTS[id];
    if (!cp) throw new Error('unknown checkpoint ' + id);
    resetToIntro();
    st.frozen = time;
    st.clock = time;
    input.override = 0;
    const settle = (n: number, dt: number) => { for (let i = 0; i < n; i++) stepSim(dt); };
    if (cp.mode === 'intro') {
      // replay the cinematic deterministically up to the checkpoint time
      const steps = Math.round((cp.t ?? 0) / (1 / 30));
      settle(steps, 1 / 30);
    } else {
      startRide();
      hud.showHint(null);
      const sTarget = cp.s ?? course.stage('11').s0;
      st.s = sTarget;
      st.lat = cp.lat ?? 0;
      coins.resetUntil(sTarget + 0.5);
      setStage(stageOf(sTarget));
      if (cp.mode === 'outro') {
        startOutro();
        settle(Math.round((cp.t ?? 0) / (1 / 30)), 1 / 30);
      } else {
        // settle camera springs without moving Benny: run with speed frozen
        const s0 = st.s;
        for (let i = 0; i < 40; i++) { stepSim(1 / 60); st.s = s0; st.lat = cp.lat ?? 0; }
        rideCam.update(0, st.s, st.lat, camera, true);
      }
    }
    // deterministic reference counter for this checkpoint (see docs: live play counts real pickups)
    const refId = (id.slice(0, 2) as StageId);
    st.coins = course.stage(refId).refCoins || START_COINS;
    hud.setCoins(st.coins);
    hud.setHearts(5);
    render();
    dirty = false;
    return { stage: st.stage, s: st.s, y: benny.root.position.y };
  };

  const api = {
    ready: true,
    checkpoints: Object.keys(CHECKPOINTS),
    goto: gotoCheckpoint,
    run(v = true) { running = v; last = performance.now(); },
    unfreeze() { st.frozen = null; input.override = null; },
    setSteer(v: number | null) { input.override = v; },
    /** deterministic simulation: advance n steps of dt (no rendering needed) */
    step(n: number, dt = 1 / 60) { for (let i = 0; i < n; i++) stepSim(dt); return api.state(); },
    startRideAt(id: StageId = '03') {
      resetToIntro(); startRide(); st.s = course.stage(id).s0; coins.resetUntil(-1); st.coins = START_COINS; hud.setCoins(st.coins); st.log = [];
      return api.state();
    },
    state() {
      return { mode: st.mode, stage: st.stage, s: +st.s.toFixed(3), lat: +st.lat.toFixed(3), coins: st.coins, hearts: st.hearts, paused: st.paused, bennyY: +benny.root.position.y.toFixed(3), bennyVisible: benny.root.visible, cam: camera.position.toArray().map((x) => +x.toFixed(2)) };
    },
    log() { return st.log; },
    togglePause,
    stats() {
      const i = renderer.info;
      return { fps: +fps.toFixed(1), calls: i.render.calls, triangles: i.render.triangles, geometries: i.memory.geometries, textures: i.memory.textures, modules: { ...moduleStatus }, courseLength: course.length };
    },
    course,
  };
  (window as unknown as { __rainbow: typeof api }).__rainbow = api;
  return api;
}
