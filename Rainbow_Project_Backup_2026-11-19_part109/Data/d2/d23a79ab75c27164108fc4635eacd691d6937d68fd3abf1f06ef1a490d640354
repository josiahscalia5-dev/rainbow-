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
import { createGradePass } from '../render/grade';
import { createHud } from '../ui/hud';
import { findCinematic, playCinematic } from '../ui/cinematicVideo';
import { createCoins, COIN_VALUE } from '../gameplay/coins';
import { createInput } from '../gameplay/input';
import { RideCamera } from './cameraRig';
import { flag05 } from '../vfx/waterRibbon';
import { MATCH } from './match';
import { buildMatch08 } from '../world/match08';
import { buildMatch04 } from '../world/match04';
import { buildMatch06 } from '../world/match06';
import { buildMatch07 } from '../world/match07';
import { CAMCLEAR, createCamClear } from './camClear';
import { loadBennyRuntime, loadGirlRuntime, loadWater, moduleStatus } from './modules';

type Mode = 'intro' | 'ride' | 'outro' | 'end';
const START_COINS = 1330;
const STAGE_ORDER: StageId[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11'];
const sm = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);
const lerp = THREE.MathUtils.lerp;

/** intro timeline marks (seconds) */
const T = { dropEnd: 1.6, doorClose0: 1.9, doorClose1: 2.8, walk0: 3.0, peek: 4.4, cp01: 6.6, spin: 7.4, cp02: 9.1, drain: 11.4, rideStart: 14.0 };
/** outro timeline marks */
const O = { hide: 0.6, walk0: 0.0, door0: 1.1, door1: 2.1, lean0: 1.9, fold0: 2.7, fold1: 3.7, hold: 6.4, badge: 3.9, cp11: 5.2 };

export async function startGame(canvas: HTMLCanvasElement) {
  const qs = new URLSearchParams(location.search);
  const qaMode = qs.has('qa');
  const renderer = createRenderer(canvas, { preserveDrawingBuffer: qaMode });
  const dpr = qs.has('dpr') ? Number(qs.get('dpr')) : Math.min(window.devicePixelRatio || 1, 2);
  renderer.setPixelRatio(dpr);
  const scene = new THREE.Scene();
  scene.environment = createCandyEnvironment(renderer);
  scene.background = new THREE.Color('#b23fb4');
  const fog = new THREE.FogExp2('#ffbde9', 0.0035);
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
  // Screen 05 test GL1 (user 2026-11-16: "the glow on the highlights is most of what makes the approved version look so
  // shiny"): `?glow05=1` = a stronger UnrealBloom with a HIGH threshold, so only the bright highlights (streak cores,
  // flares, lamps) glow. Tuning without a rebuild: ?bloomS= (strength) ?bloomR= (radius) ?bloomT= (threshold, linear
  // HDR luminance). Switch off: 0.2 / 0.35 / 0.94 exactly as before (pixel-identical default build).
  const glow05 = flag05('glow05');
  const flowPlan = flag05('flowplan'); // user's Google Flow plan: videos 01–03 + 09–11, playable 04–08 (see startFlowEnding)
  const qn = (k: string, d: number) => { const v = qs.get(k); return v !== null && v !== '' && isFinite(+v) ? +v : d; };
  // (measured 2026-11-16, qa/pilot05/wave12/glow/: threshold 1.0–1.3 washed the whole river toward white — the scene's
  // linear HDR body colours pass it; 2.6 keeps only streak cores, flares and lamps → water saturation UP, 0.92 → 0.97)
  const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), qn('bloomS', glow05 ? 1.0 : 0.2), qn('bloomR', glow05 ? 0.4 : 0.35), qn('bloomT', glow05 ? 2.6 : 0.94));
  // Tone-mapping test TM1 (same message: "use NoToneMapping or lower the exposure"): `?tone05=none` → NoToneMapping,
  // `?tone05=0.75` → Neutral at that exposure. The OutputPass tone-maps the whole frame (not per material), so this is
  // global by nature. Off: Neutral 0.86 (src/render/env.ts), unchanged.
  const tone05 = qs.get('tone05');
  if (tone05 === 'none') renderer.toneMapping = THREE.NoToneMapping;
  else if (tone05 !== null && tone05 !== '' && isFinite(+tone05) && +tone05 > 0) renderer.toneMappingExposure = +tone05;
  const useBloom = qs.get('bloom') !== '0';
  if (useBloom) composer.addPass(bloom);
  composer.addPass(new OutputPass());
  composer.addPass(createGradePass());

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
  // `?match08=1`: the approved Screen 08 scenery on fitted 3D geometry (src/world/match08.ts); off: nothing is built
  const m08 = MATCH['08'] ? await buildMatch08() : null;
  if (m08) { m08.group.visible = false; scene.add(m08.group); m08.bakeDepth(renderer); scene.add(m08.splash); }
  const M08_HIDE = ['ribbon', 'foam', 'bubbles', 'splashCrown', 'spray'];
  // `?match08=1` Benny on Screen 08 toward the approved picture: smaller beanie, body a little higher out of the water,
  // white-and-purple knit stripes (crown tint); everything restored when leaving 08 (qa/match/08/NOTES.md)
  // `b08r2=0` (A/B): the benny08 round-2 look tweaks off -> the previous match08 Benny (with `bake08=0`: pixel-identical to 5965a01)
  const B08R2 = qs.get('b08r2') !== '0';
  const M08_BENNY = { hat: B08R2 ? 0.95 : 0.86, hatOff: (B08R2 ? [0.074, 0.083, -0.009] : [0, 0, 0]) as readonly [number, number, number], hatRoll: B08R2 ? -0.08 : 0, lift: 0.06, dx: 0.26, body: [0.94, 1.0, 0.94] as const,
    // round 2: pom-pom ≈30 px left onto the painted one; star 1.2x, ≈13 px left / 10 px up (parent-local offsets)
    // beanie roll −0.08 rad (painted stripes run level); pom/star re-fitted after the roll (star counter-rolled)
    parts: (B08R2 ? { pom: { k: 1, off: [0.1048, -0.0195, -0.0026], rz: 0 }, hat_star: { k: 1.2, off: [0.0371, 0.0076, -0.0015], rz: 0.08 } } : {}) as Record<string, { k: number; off: [number, number, number]; rz: number }>, crown: new THREE.Color().setRGB(0.86, 1.04, 1.0) };
  // benny08 round 2 (qa/match/08/benny08/NOTES.md): the approved splash ring around Benny drawn stronger (alpha^0.3 x2,
  // capped at 1) — measured closer to the painted white crest; card texture, size and approved position unchanged
  if (m08 && B08R2) {
    const sm = m08.splash.material as THREE.ShaderMaterial;
    // round 3 (`b08r3=0` = round 2): alpha^0.2 x2.5 — fuller white foam ring (Benny+splash 65.5 -> 65.7 %)
    const sa = qs.get('b08r3') !== '0' ? 'pow(c.a, 0.2) * 2.5' : 'pow(c.a, 0.3) * 2.0';
    sm.fragmentShader = sm.fragmentShader.replace('if (c.a < 0.02) discard;', `if (c.a < 0.02) discard; c.a = min(1.0, ${sa});`);
    sm.needsUpdate = true;
  }
  const b08 = m08 ? { hat: benny.root.getObjectByName('hat'), body: benny.root.getObjectByName('body'), aux: benny.root.getObjectByName('AuxScene'), crown: benny.root.getObjectByName('hat_crown') as THREE.Mesh | undefined } : null;
  // benny08 round 5 body shape (qa/match/08/benny08/NOTES.md), two presets on the same machinery:
  //  `?b08shape=1` = the 18:55 taper (body fur x1.12 at the top -> x0.92 at the bottom, arms raised; user: wrong way, OFF by default)
  //  `b08full` (DEFAULT under match08, user 19:00: "rounder and fuller like the approved picture"): body fur x1.04 wider,
  //  beanie x0.94 so the body is wider than the brim, arms +0.03 up and x1.15 (stubby, high); `?b08full=0` = off
  // Tuning (QA only): b08tt/b08tb taper top/bottom, b08bw/b08bh body fur width/height, b08ly fur lift, b08ay/b08ax/b08ak arms.
  const B08TAPER = qs.get('b08shape') === '1';
  const B08FULL = !B08TAPER && qs.get('b08full') !== '0';
  const B08SHAPE = !!b08 && B08R2 && qs.get('b08r3') !== '0' && (B08TAPER || B08FULL);
  const b08P = B08TAPER ? { bw: 1, ay: 0.04, ax: 0, ak: 1.1, bh: 1, ly: 0, tt: 1.12, tb: 0.92, hk: 1 } : { bw: 1.04, ay: 0.03, ax: 0, ak: 1.15, bh: 1, ly: 0, tt: 1, tb: 1, hk: 0.94 };
  const b08Shape = B08SHAPE ? { bw: qn('b08bw', b08P.bw), ay: qn('b08ay', b08P.ay), ax: qn('b08ax', b08P.ax), ak: qn('b08ak', b08P.ak), bh: qn('b08bh', b08P.bh), ly: qn('b08ly', b08P.ly), tt: qn('b08tt', b08P.tt), tb: qn('b08tb', b08P.tb), hk: qn('b08hk', b08P.hk) } : null;
  // the body fur mesh only (beanie, face and arms are separate children of the body joint and stay put)
  const b08FurO = b08Shape ? benny.root.getObjectByName('fur_body') : undefined;
  const b08Fur = b08FurO ? { o: b08FurO, p: b08FurO.position.clone(), s: b08FurO.scale.clone() } : null;
  // taper: body fur geometry widened toward the brim (x tt at the top) and slimmed toward the water (x tb at the bottom);
  // a second position buffer, swapped in only while Screen 08 is shown (the shared geometry is otherwise untouched)
  const b08Taper = (() => {
    const g = (b08FurO as THREE.Mesh | undefined)?.geometry;
    if (!g || !b08Shape || (b08Shape.tt === 1 && b08Shape.tb === 1)) return null;
    const orig = g.getAttribute('position') as THREE.BufferAttribute;
    const t = orig.clone();
    g.computeBoundingBox(); const y0 = g.boundingBox!.min.y, y1 = g.boundingBox!.max.y;
    for (let i = 0; i < t.count; i++) {
      const u = THREE.MathUtils.smoothstep(t.getY(i), y0, y1); const k = b08Shape.tb + (b08Shape.tt - b08Shape.tb) * u;
      t.setX(i, t.getX(i) * k); t.setZ(i, t.getZ(i) * k);
    }
    return { g, orig, t };
  })();
  const b08Arms = b08Shape ? ['armL', 'armR'].map((n) => { const o = benny.root.getObjectByName(n); return o ? { o, p: o.position.clone(), s: o.scale.clone(), side: n === 'armL' ? 1 : -1 } : null; }).filter((v) => v !== null) : [];
  const b08Parts = b08 ? Object.keys(M08_BENNY.parts).map((n) => { const o = benny.root.getObjectByName(n); return o ? { n, o, s: o.scale.clone(), p: o.position.clone(), rz: o.rotation.z } : null; }).filter((v) => v !== null) : [];
  const b08Rest = b08 ? { hat: b08.hat?.scale.x ?? 1, hatPos: (b08.hat?.position ?? new THREE.Vector3()).clone(), hatRz: b08.hat?.rotation.z ?? 0, body: (b08.body?.scale ?? new THREE.Vector3(1, 1, 1)).clone(), pos: (b08.aux?.position ?? new THREE.Vector3()).clone(), y: b08.aux?.position.y ?? 0, crown: ((b08.crown?.material as THREE.MeshStandardMaterial | undefined)?.color ?? new THREE.Color()).clone() } : null;
  let m08On = false;
  // `?match04=1`: the approved Screen 04 scenery on fitted 3D geometry (src/world/match04.ts); off: nothing is built
  const m04 = MATCH['04'] ? await buildMatch04() : null;
  if (m04) { m04.group.visible = false; scene.add(m04.group); m04.bakeDepth(renderer); if (m04.splash) scene.add(m04.splash); }
  let m04On = false;
  let m04Applied = false;
  let m08Applied = false;
  // `?match06=1`: the approved Screen 06 scenery on fitted 3D geometry (src/world/match06.ts); off: nothing is built
  const m06 = MATCH['06'] ? await buildMatch06(course) : null;
  if (m06) { m06.group.visible = false; scene.add(m06.group); m06.bakeDepth(renderer); }
  let m06On = false;
  let m06Applied = false;
  // `?match07=1`: the approved Screen 07 scenery on fitted 3D geometry (src/world/match07.ts), shown from 12 u before the
  // 07 checkpoint until 8 u before the plunge top (the 07→08 drop keeps the game's own tube); off: nothing is built
  const m07 = MATCH['07'] ? await buildMatch07() : null;
  if (m07) { m07.group.visible = false; scene.add(m07.group); m07.bakeDepth(renderer); }
  const M07_HIDE = ['ribbon', 'foam', 'bubbles'];
  const m07Range = [course.stage('07').s0 + 14, course.marks['07_plunge_top'] - 8];
  let m07On = false;
  let m07Applied = false;
  // `?camclear=1` (src/game/camClear.ts): rings / lids / gold lips / foam banks never hide Benny or fill the lens while
  // riding; respawn re-frames the camera at once instead of flying it back through the tube. Off: nothing is created.
  const camClear = CAMCLEAR ? createCamClear({ env: env.group, foam: water.parts?.foam, coins: coins.group }) : null;
  let camSnap = false;
  // debug: ?hide=water,benny,coins,drumA,basin,tubes,chamber
  const hidden = new Set((qs.get('hide') ?? '').split(',').filter(Boolean));
  if (hidden.has('water')) water.group.visible = false;
  if (hidden.has('coins')) coins.group.visible = false;
  const zoneHidden = (k: string) => hidden.has(k);
  const hud = createHud();
  const input = createInput(canvas);
  const rideCam = new RideCamera(course);
  rideCam.axis = env.tubeAxis;

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
    respawns: 0,
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
    drumA: ['01', '02'],
    basin: ['02', '05'],
    tubes: ['03', '09'],
    chamber: ['07', '11'],
  };
  const updateZones = () => {
    const i = STAGE_ORDER.indexOf(st.stage);
    for (const [k, [a, b]] of Object.entries(zoneRanges)) {
      env.zones[k as keyof typeof env.zones].visible = !zoneHidden(k) && i >= STAGE_ORDER.indexOf(a) && i <= STAGE_ORDER.indexOf(b);
    }
    if (m08) { m08On = st.stage === '08'; m08.group.visible = m08On; if (m08On) env.zones.chamber.visible = false; }
    if (m04) { m04On = st.stage === '04'; m04.group.visible = m04On; if (m04On) { env.zones.basin.visible = false; env.zones.tubes.visible = false; } }
    if (m06) { m06On = st.stage === '06'; m06.group.visible = m06On; if (m06On) env.zones.tubes.visible = false; }
    const inDrum = i <= 1;
    fog.density = inDrum ? 0.0015 : i >= 7 ? 0.0025 : 0.0035;
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
  const wakeAnchor = new THREE.Vector3(); // VFX: Benny's lifted body centre fed to water.wake()
  const doorAOpen = -1.9, doorCOpen = -1.95;

  // ---------------------------------------------------------------- intro (01–02)
  const introUpdate = (dt: number) => {
    const t = st.t;
    const wc = (water as unknown as { controls?: { drumSwirl: number; drumAgitation: number; outro: number } }).controls;
    if (wc) {
      wc.drumAgitation = 0.35 + 0.65 * sm(T.spin - 0.5, T.spin + 0.8, t);
      wc.drumSwirl = sm(T.spin, T.spin + 1.2, t) * (1 - sm(T.drain + 0.5, T.rideStart, t));
      wc.outro = 0;
    }
    const dA = WORLD.drumA;
    const start = course.sample(0).pos;
    // --- girl: drop the load, close the door, walk away at normal pace (never looks back)
    const spots = env.roomA.spots;
    if (t < T.walk0) {
      placeGirl('A', new THREE.Vector3(1.2, spots.nearDoor.y, 7.6), Math.PI);
      girl.play(t < T.dropEnd ? 'dropLoad' : 'closeDoor', { fade: 0.25 });
    } else {
      const k = THREE.MathUtils.clamp((t - T.walk0 - 0.35) / 4.6, 0, 1);
      const from = new THREE.Vector3(1.2, spots.nearDoor.y, 7.6);
      const p = from.clone().lerp(spots.exitLeft, k);
      const dir = spots.exitLeft.clone().sub(from);
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
    const towelRest = start.clone().add(new THREE.Vector3(0.15, -1.25, 0.05));
    const arc = handW.clone().lerp(towelRest, k);
    arc.y += Math.sin(k * Math.PI) * 1.2;
    let sB = 0;
    if (t >= T.spin && st.stage === '01') { st.stage = '02'; hud.setStage('02'); }
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
      benny.root.position.copy(start).add(new THREE.Vector3(0, -1.0 + 1.35 * peek, 0));
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
      // inside Drum A the swirl carries him along the helix itself (no ribbon surface there yet)
      const inDrum = 1 - sm(T.drain - 0.4, T.drain + 0.6, t);
      // the swirl lifts him toward the middle of the drum while he tumbles (ref 02), then he drops to the drain
      const hp = course.sample(sB).pos;
      const toAxis = sm(T.spin, T.spin + 1.0, t) * (1 - sm(T.drain - 1.6, T.drain - 0.2, t)) * 0.45;
      hp.x *= 1 - toAxis; hp.y = hp.y + (0.2 - hp.y) * toAxis;
      benny.root.position.copy(pose.pos).lerp(hp, inDrum);
      const tumble = sm(T.rideStart - 1.0, T.rideStart, t);
      // tumble = rolling cartwheels seen by the camera: face the lens, roll around the view axis
      const toCam = cam02(benny.root.position).pos.clone().sub(benny.root.position).normalize();
      const face = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), toCam);
      const roll = new THREE.Quaternion().setFromAxisAngle(toCam, Math.sin(t * 1.7) * 0.9 + t * 1.1);
      const wobble = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.sin(t * 2.3) * 0.35, Math.sin(t * 1.9) * 0.4, 0));
      const spinQ = roll.multiply(face).multiply(wobble);
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
      camera.position.set(0.85, -1.05, -6.05);
      camera.up.set(0, 1, 0);
      camera.lookAt(-0.05, -0.2, dA.zDoor);
      setFov(64);
    } else if (t < T.drain) {
      // 02: tumbling with the swirl; the door ring above (deterministic blend from the 01 shot)
      const c2 = cam02(benny.root.position);
      const k2 = sm(T.spin + 0.6, T.spin + 1.6, t);
      const p01 = new THREE.Vector3(0.85, -1.05, -6.05), l01 = new THREE.Vector3(-0.05, -0.2, dA.zDoor);
      camera.position.copy(p01.lerp(c2.pos, k2));
      camera.up.set(0, 1, 0);
      camera.lookAt(l01.lerp(c2.look, k2));
      setFov(lerp(64, 68, k2));
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

  /** 02 camera: between Benny and the drum's back wall, looking past him to the door ring */
  const cam02 = (b: THREE.Vector3) => {
    const dA = WORLD.drumA;
    const door = new THREE.Vector3(0, 0.3, dA.zDoor);
    const away = b.clone().sub(door).normalize();
    const pos = b.clone().addScaledVector(away, 3.0).add(new THREE.Vector3(0, 0.35, 0));
    const rr = Math.hypot(pos.x, pos.y);
    if (rr > 2.7) { pos.x *= 2.7 / rr; pos.y *= 2.7 / rr; }
    pos.y = Math.max(pos.y, dA.waterY + 1.0);
    pos.z = THREE.MathUtils.clamp(pos.z, dA.zBack + 0.4, dA.zDoor - 1);
    const look = b.clone().lerp(door, 0.22).add(new THREE.Vector3(0, 0.45, 0));
    return { pos, look };
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
    const safe = halfW - 0.75;
    st.vlat += (input.steer * 7.5 - st.vlat) * Math.min(1, dt * 8);
    st.lat = THREE.MathUtils.clamp(st.lat + st.vlat * dt, -halfW + 0.55, halfW - 0.55);
    // foam-wall bump → lose a heart (with cooldown), bounce back toward the centre
    st.bumpCooldown = Math.max(0, st.bumpCooldown - dt);
    if (Math.abs(st.lat) > safe) st.edgeTime += dt; else st.edgeTime = 0;
    if (st.edgeTime > 0.6 && st.bumpCooldown <= 0) {
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
        st.respawns++;
        if (camClear) camSnap = true;
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
    // VFX anchor = the body centre AFTER the runtime's ride lift (the model is raised inside the root),
    // so the wake/splash footprint matches the real waterline instead of the unlifted root
    water.wake((benny.root.children[0] ?? benny.root).getWorldPosition(wakeAnchor), f.tan, f.right, speed, dt);
    // camera
    rideCam.update(dt, st.s, st.lat, camera, camSnap);
    camSnap = false;
    // towel: folded in 08/09, lifted into a tent as the stream reaches it (late 09 → 10)
    env.towel.setTent(sm(course.stage('09').s1 - 6, course.stage('10').s0 + 2, st.s));
    // girl at the counter behind the door glass in 10 (back turned — never sees Benny)
    if (st.stage === '09' || st.stage === '10') {
      placeGirl('C', env.roomC.spots.table.clone(), 0.25);
      girl.play('laundryCounter', { fade: 0.3 });
    }
    env.doorC.rotation.y = 0;
    st.log.push({ t: st.clock, s: st.s, y: benny.root.position.y, stage: st.stage });
    if (st.log.length > 20000) st.log.shift();
    // `?flowplan=1` + an ending video: the playable game ends with 08; the Flow video covers 09–11
    if (flowPlan && cinematic.ending && st.mode === 'ride' && st.s >= course.stage('09').s0) { startFlowEnding(); return; }
    if (st.s >= course.stage('11').s0 - 0.01) startOutro();
  };

  // ---------------------------------------------------------------- outro (11)
  const cinematic = { ending: null as string | null };
  const startOutro = () => {
    st.mode = 'outro';
    st.t = 0;
    setStage('11');
    if (cinematic.ending) {
      // optional Flow ending video; the real-time 11 frame (girl holds towel, FINAL SPIN COMPLETE) follows
      st.paused = true;
      void playCinematic(cinematic.ending, { onEnding: () => { st.t = Math.max(st.t, O.badge - 0.4); st.paused = false; } });
    }
  };
  // `?flowplan=1` (the user's production plan, lead r3 2026-11-17): 01–03 and 09–11 are Google Flow videos, 04–08 is the
  // playable 3D game. It only acts when a video file exists; without videos the real-time scenes play exactly as before.
  // Coins in the stretches a video covers (03 / 09–10) are credited so a run still ends with 91 coins / 2,240.
  const creditCoins = (pred: (s: number) => boolean) => {
    let n = 0;
    coins.defs.forEach((d, i) => { if (!coins.collected[i] && pred(d.s)) { coins.collected[i] = 1; n++; } });
    st.coins += n * COIN_VALUE;
    hud.setCoins(st.coins);
    return n;
  };
  const startFlowEnding = () => {
    creditCoins((s) => s >= course.stage('09').s0);
    st.mode = 'outro';
    st.t = 0;
    setStage('11');
    st.paused = true;
    // reveal: the real-time 11 frame (girl holds the towel, Benny hidden, FINAL SPIN COMPLETE)
    void playCinematic(cinematic.ending as string, { onEnding: () => { st.t = O.badge - 0.4; outroUpdate(0); st.paused = false; } });
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
    // girl: from the folding table to the door, leans in through it with her palms on the towel,
    // folds it over Benny and draws it toward herself (never sees him — he is inside the fold)
    const P0 = WORLD.platform;
    const towelZ = lerp(P0.center.z - 1.0, P0.center.z - 3.4, sm(O.fold0, O.fold1, t));
    env.towel.mesh.position.set(P0.center.x, P0.topY, towelZ);
    // palms of 'leanReachTowel' are at (±3.64, 9.8, 4.87) in her frame → feet 4.87 behind the towel
    const feetW = new THREE.Vector3(P0.center.x, P0.topY + 2.55 - 9.8, P0.center.z - 3.4 - 4.87);
    const feetL = env.roomC.anchor.worldToLocal(feetW.clone());
    if (t < O.lean0) {
      const from = env.roomC.spots.table.clone();
      const k = sm(0.0, O.lean0 - 0.15, t);
      placeGirl('C', from.lerp(feetL, k), lerp(0.25, Math.PI, sm(0, 0.7, t)));
      girl.play(k < 0.97 ? 'walk' : 'idle', { fade: 0.3 });
    } else {
      placeGirl('C', feetL, Math.PI);
      girl.play(t < O.hold ? 'leanReachTowel' : 'holdTowel', { fade: 0.35, loop: t >= O.hold });
    }
    const wco = (water as unknown as { controls?: { drumSwirl: number; drumAgitation: number; outro: number } }).controls;
    if (wco) { wco.outro = sm(0.3, 3.0, t); wco.drumSwirl = 0; }
    env.towel.setTent(1 - sm(O.fold0, O.fold1, t));
    // camera: the 11 composition — inside the drum, platform & towel centre, open door upper-right
    const P = WORLD.platform;
    const camPos = new THREE.Vector3(P.center.x - 0.8, P.topY + 11.5, P.center.z + 21.0);
    const camLook = new THREE.Vector3(P.center.x + 0.9, P.topY + 3.6, P.center.z - 5.0);
    const k = sm(0, 1.4, t);
    const rp = new THREE.Vector3(), rt = new THREE.Vector3(), ru = new THREE.Vector3();
    rideCam.desired(sEnd, 0, rp, rt, ru);
    camera.position.copy(rp.lerp(camPos, k));
    camera.up.set(0, 1, 0);
    camera.lookAt(rt.lerp(camLook, k));
    setFov(lerp(66, 58, k));
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

  // ---------------------------------------------------------------- optional Google Flow cinematics
  // public/video/intro.mp4 shows 01 (towel loaded, door closed, girl walks away). While it plays, the live
  // 3D intro is held on that same moment underneath, then revealed by a cross-fade and continued in real
  // time (02 tumble -> 03 ride). Without a video the real-time 01 cinematic plays. See src/ui/cinematicVideo.ts.
  const [introVideo, endingVideo] = await Promise.all([findCinematic('intro'), findCinematic('ending')]);
  cinematic.ending = endingVideo;
  const playIntroVideo = () => {
    if (!introVideo) return;
    if (flowPlan) {
      // `?flowplan=1`: the Flow video covers 01–03; underneath, the ride is held on the APPROVED 04 view (the 04
      // checkpoint, 7 u into 04 — the very start of 04 is the drain drop, whose view is still obstructed) and revealed by
      // the cross-fade (coins before it — 03's — are credited: the video replaces that stretch)
      startRide();
      const s04 = course.stage('04').s0 + 7.0;
      st.s = s04; st.lat = 0;
      setStage('04');
      creditCoins((s) => s < s04);
      for (let i = 0; i < 40; i++) { rideUpdate(1 / 60); st.s = s04; st.lat = 0; }
      rideCam.update(0, st.s, st.lat, camera, true);
      st.paused = true;
      void playCinematic(introVideo, { onEnding: () => { st.paused = false; } });
      return;
    }
    st.t = T.cp01;
    introUpdate(0);
    st.paused = true;
    void playCinematic(introVideo, { onEnding: () => { st.paused = false; } });
  };
  playIntroVideo();
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
    env.towel.mesh.position.set(WORLD.platform.center.x, WORLD.platform.topY, WORLD.platform.center.z - 1.0);
    env.doorC.rotation.y = 0;
    benny.root.visible = true;
    playIntroVideo();
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
    // `?match08=1` on Screen 08: the projected scenery carries the approved river, foam and bubbles
    if (m08 && (m08On || m08Applied)) {
      for (const k of M08_HIDE) { const o = water.parts?.[k]; if (o) o.visible = !m08On; }
      m08Applied = m08On;
    }
    // `?match04=1` on Screen 04: the projected scenery carries the approved river, arrows, foam and bubbles
    if (m04 && (m04On || m04Applied) && !(m08 && m08On)) {
      for (const k of M08_HIDE) { const o = water.parts?.[k]; if (o) o.visible = !m04On; }
      m04Applied = m04On;
    }
    // `?match06=1` on Screen 06: the projected scenery carries the approved river, ripples, foam and bubbles
    if (m06 && (m06On || m06Applied) && !(m08 && m08On)) {
      for (const k of M08_HIDE) { const o = water.parts?.[k]; if (o) o.visible = !m06On; }
      m06Applied = m06On;
    }
    if (m08 && m08On) for (const k of ['puddles', 'finalWave']) { const o = water.parts?.[k]; if (o) o.visible = false; }
    // `?match07=1` on the visible 07 stretch: the projected scenery carries the approved tube, rings, paddles, river,
    // foam and bubbles (the game's tube zone and river are hidden there and restored outside it)
    if (m07) {
      const on = st.stage === '07' && st.s >= m07Range[0] && st.s < m07Range[1];
      m07.group.visible = on;
      if (on || m07Applied) {
        for (const k of M07_HIDE) { const o = water.parts?.[k]; if (o) o.visible = !on; }
        env.zones.tubes.visible = on ? false : !zoneHidden('tubes') && STAGE_ORDER.indexOf(st.stage) >= STAGE_ORDER.indexOf('03') && STAGE_ORDER.indexOf(st.stage) <= STAGE_ORDER.indexOf('09');
      }
      m07On = on; m07Applied = on;
    }
    if (m08 && b08 && b08Rest) {
      // rounder body (narrower, taller) with the beanie counter-scaled to keep its size; ≈23 px right (world +x, measured fur centroid), lifted
      const [bx, by, bz] = m08On ? M08_BENNY.body : [1, 1, 1];
      if (b08Fur) {
        b08Fur.o.position.copy(b08Fur.p); b08Fur.o.scale.copy(b08Fur.s);
        if (b08Taper) b08Taper.g.setAttribute('position', m08On ? b08Taper.t : b08Taper.orig);
        if (m08On && b08Shape) { b08Fur.o.position.y += b08Shape.ly; b08Fur.o.scale.multiply(new THREE.Vector3(b08Shape.bw, b08Shape.bh, b08Shape.bw)); }
      }
      for (const r of b08Arms) {
        r.o.position.copy(r.p);
        r.o.scale.copy(r.s);
        if (m08On && b08Shape) { r.o.position.x -= r.side * b08Shape.ax; r.o.position.y += b08Shape.ay; r.o.scale.multiplyScalar(b08Shape.ak); }
      }
      b08.body?.scale.set(b08Rest.body.x * bx, b08Rest.body.y * by, b08Rest.body.z * bz);
      const hk = m08On ? M08_BENNY.hat * (b08Shape ? b08Shape.hk : 1) : 1;
      b08.hat?.scale.set(b08Rest.hat * hk / bx, b08Rest.hat * hk / by, b08Rest.hat * hk / bz);
      // benny08 round 2 (qa/match/08/benny08/NOTES.md): beanie 0.95x and seated ≈15 px higher / ≈10 px further left (body-local offset)
      if (b08.hat) { const [ox, oy, oz] = m08On ? M08_BENNY.hatOff : [0, 0, 0]; b08.hat.position.set(b08Rest.hatPos.x + ox, b08Rest.hatPos.y + oy, b08Rest.hatPos.z + oz); b08.hat.rotation.z = b08Rest.hatRz + (m08On ? M08_BENNY.hatRoll : 0); }
      if (b08.aux) {
        const off = new THREE.Vector3(m08On ? M08_BENNY.dx : 0, m08On ? M08_BENNY.lift : 0, 0).applyQuaternion(benny.root.quaternion.clone().invert());
        b08.aux.position.copy(b08Rest.pos).add(off);
      }
      for (const r of b08Parts) {
        const t = M08_BENNY.parts[r.n];
        r.o.scale.copy(r.s).multiplyScalar(m08On ? t.k : 1);
        r.o.position.copy(r.p);
        if (m08On) r.o.position.add(new THREE.Vector3(...t.off));
        r.o.rotation.z = r.rz + (m08On ? t.rz : 0);
      }
      const cm = b08.crown?.material as THREE.MeshStandardMaterial | undefined;
      // (the ported benny05 maps carry the approved knit colours: no crown tint any more, the rest colour is kept)
      cm?.color.copy(b08Rest.crown);
      m08.splash.visible = m08On;
      if (m08On) { m08.splash.position.copy(benny.root.position).add(m08.splashOffset); m08.splash.quaternion.copy(camera.quaternion); }
    }
    if (m04?.splash) {
      m04.splash.visible = m04On;
      if (m04On) { m04.splash.position.copy(benny.root.position).add(m04.splashOffset); m04.splash.quaternion.copy(camera.quaternion); }
    }
    fill.position.copy(camera.position);
    sun.target.position.copy(camera.position).add(new THREE.Vector3(0, -10, -10));
  };

  let last = performance.now();
  let fps = 60;
  let running = !qaMode;
  let dirty = true;
  renderer.info.autoReset = false;
  // glow05: the strong highlight bloom belongs to Screen 05 only — blended in over the last 6 u of 04 and out over the
  // first 6 u of 06, so 04 / 06 / 07 keep their look and there is no pop at the joins
  const bloomBase = { s: 0.2, r: 0.35, t: 0.94 };
  const bloom05 = { s: bloom.strength, r: bloom.radius, t: bloom.threshold };
  const bloomS0 = bloom.strength;
  const dbs = new THREE.Vector2();
  const st05 = course.stage('05');
  const render = () => {
    if (glow05) {
      const w = sm(st05.s0 - 6, st05.s0, st.s) * (1 - sm(st05.s1, st05.s1 + 6, st.s));
      bloom.strength = bloomBase.s + (bloom05.s - bloomBase.s) * w;
      bloom.radius = bloomBase.r + (bloom05.r - bloomBase.r) * w;
      bloom.threshold = bloomBase.t + (bloom05.t - bloomBase.t) * w;
    }
    // `?match08=1`: the approved artwork already carries its glow — no bloom on Screen 08 under the switch
    if (m08) {
      if (!glow05) bloom.strength = bloomS0;
      if (m08On) bloom.strength = 0;
      renderer.getDrawingBufferSize(dbs);
      m08.sync(renderer, dbs.x, dbs.y);
    }
    // `?match04=1`: no bloom on Screen 04 under the switch (the artwork carries its own glow)
    if (m04) {
      if (!glow05 && !m08) bloom.strength = bloomS0;
      if (m04On) bloom.strength = 0;
      renderer.getDrawingBufferSize(dbs);
      m04.sync(renderer, dbs.x, dbs.y, camera);
    }
    // `?match06=1`: no bloom on Screen 06 under the switch (the artwork carries its own glow)
    if (m06) {
      if (!glow05 && !m08 && !(m04 && m04On)) bloom.strength = bloomS0; // preview: never undo 04's 'no bloom'
      if (m06On) bloom.strength = 0;
      renderer.getDrawingBufferSize(dbs);
      m06.sync(renderer, dbs.x, dbs.y);
    }
    // `?match07=1`: no bloom on the visible 07 stretch under the switch (the artwork carries its own glow)
    if (m07) {
      if (!glow05 && !m08 && !(m04 && m04On) && !(m06 && m06On)) bloom.strength = bloomS0; // preview: never undo 04/06
      if (m07On) bloom.strength = 0;
      renderer.getDrawingBufferSize(dbs);
      m07.sync(renderer, dbs.x, dbs.y);
    }
    camClear?.update(camera, benny.root, st.mode === 'ride');
    renderer.info.reset();
    composer.render();
  };
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
    '03': { mode: 'ride', s: course.stage('03').s0 + 7.5, lat: 0.3 },
    '04': { mode: 'ride', s: course.stage('04').s0 + 7.0 },
    '05': { mode: 'ride', s: course.marks['05_crest'] }, // first meander crest (course.ts S05): Benny on the stream's left crest, facing the VP down the straight tube
    '06': { mode: 'ride', s: course.stage('06').s0 + 10 },
    '07': { mode: 'ride', s: course.stage('07').s0 + 26 },
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
    /** QA: freeze the shader clock at t (frame-by-frame clips of animated water); rendering is otherwise unchanged */
    freezeAt(t: number) { st.frozen = t; st.clock = t; },
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
    coinDefs() { return coins.defs.map((d, i) => ({ s: d.s, lat: d.lat, taken: coins.collected[i] === 1 })); },
    /** QA: on-screen centre (px) and diameter (px) of every untaken coin in front of the camera */
    coinScreen() {
      const mesh = coins.group.children[0] as THREE.InstancedMesh;
      const m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3();
      const W = renderer.domElement.clientWidth, H = renderer.domElement.clientHeight;
      camera.updateMatrixWorld();
      const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
      const out: { i: number; x: number; y: number; d: number }[] = [];
      coins.defs.forEach((_, i) => {
        if (coins.collected[i]) return;
        mesh.getMatrixAt(i, m); m.decompose(p, q, sc);
        const c = p.clone().project(camera);
        if (c.z > 1 || c.z < -1) return;
        const e = p.clone().addScaledVector(right, 0.5 * sc.x).project(camera);
        const x = ((c.x + 1) / 2) * W, y = ((1 - c.y) / 2) * H;
        if (x < -50 || x > W + 50 || y < -50 || y > H + 50) return;
        out.push({ i, x: Math.round(x), y: Math.round(y), d: Math.round((e.x - c.x) * W) });
      });
      return out;
    },
    respawns() { return st.respawns; },
    /** QA: `?camclear=1` patched occluders (null = switch off) */
    camClear() { return camClear?.patched ?? null; },
    /** QA (camera lock): the live render camera — world matrix (column-major), vertical fov, aspect, near/far */
    camera() {
      camera.updateMatrixWorld();
      const W = renderer.domElement.clientWidth, H = renderer.domElement.clientHeight;
      return { matrixWorld: camera.matrixWorld.toArray(), fov: camera.fov, aspect: camera.aspect, near: camera.near, far: camera.far, width: W, height: H, position: camera.position.toArray(), target: rideCam.target.toArray() };
    },
    /** debug: Benny's projected screen position (NDC -1..1, z<1 = in front of camera) */
    bennyScreen() {
      const v = benny.root.getWorldPosition(new THREE.Vector3()).project(camera);
      return { x: +v.x.toFixed(2), y: +v.y.toFixed(2), z: +v.z.toFixed(3), visible: benny.root.visible, cam: camera.position.toArray().map((q) => +q.toFixed(2)), benny: benny.root.position.toArray().map((q) => +q.toFixed(2)) };
    },
    /** debug: what does a ray from the camera through NDC (x,y) hit first? */
    probe(x = 0, y = 0) {
      const rc = new THREE.Raycaster();
      rc.setFromCamera(new THREE.Vector2(x, y), camera);
      const hits = rc.intersectObjects(scene.children, true).filter((h) => (h.object as THREE.Mesh).isMesh && h.object.visible);
      const path = (o: THREE.Object3D) => { const a: string[] = []; let c: THREE.Object3D | null = o; while (c) { a.push(c.name || c.type); c = c.parent; } return a.slice(0, 5).join('<'); };
      return hits.slice(0, 4).map((h) => ({ d: +h.distance.toFixed(2), obj: path(h.object), p: h.point.toArray().map((v) => +v.toFixed(2)) }));
    },
    /** QA: which scene objects issue draw calls in one render ("parent/name" → calls), most first */
    drawList() {
      const hits = new Map<string, number>();
      const hooked: [THREE.Object3D, THREE.Object3D['onAfterRender']][] = [];
      scene.traverse((o) => {
        if (!(o as THREE.Mesh).isMesh && !(o as THREE.Points).isPoints && !(o as THREE.Line).isLine && !(o as THREE.Sprite).isSprite) return;
        const prev = o.onAfterRender;
        const key = (o.parent?.name ? o.parent.name + '/' : '') + (o.name || o.type);
        hooked.push([o, prev]);
        o.onAfterRender = (...a: Parameters<THREE.Object3D['onAfterRender']>) => { hits.set(key, (hits.get(key) ?? 0) + 1); prev.apply(o, a); };
      });
      render();
      for (const [o, prev] of hooked) o.onAfterRender = prev;
      return [...hits.entries()].sort((a, b) => b[1] - a[1]);
    },
    togglePause,
    /** QA only (read-only use by scripts/proj05-probe.mjs): the live scene, render camera and renderer, for exact
     *  per-pixel river UV / footprint renders. Nothing calls it in the game; rendering is unchanged. */
    qa3d() { return { scene, camera, renderer, composer }; },
    stats() {
      const i = renderer.info;
      return { fps: +fps.toFixed(1), calls: i.render.calls, triangles: i.render.triangles, geometries: i.memory.geometries, textures: i.memory.textures, modules: { ...moduleStatus }, courseLength: course.length };
    },
    course,
  };
  (window as unknown as { __rainbow: typeof api }).__rainbow = api;
  return api;
}
