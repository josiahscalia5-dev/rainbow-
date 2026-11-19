/**
 * Builds the whole washer world in absolute coordinates around the master course.
 * Drum A (01–02) → chute → whirlpool basin room (03) → gold ring pipe (04) → perforated current tube
 * (05) → arch hall (06) → washer tube + deep plunge (07) → Final Spin Chamber (08–11).
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Course, WORLD, funnelY } from './course';
import { perforatedMetal, gold, goldRibbed, chrome, glass, painted, canvasTexture, washerTubeEnv, withFarGlow, withTubeStrips, withBandShading, withLidShading, nearFrameMaterial, tunnelEndGlowMaterial, farRiverMaterial, marblePano05, marblePanoRotation05, marblePanoMatrix05, type FarGlow, type TubeStrips } from './materials';
import { buildTubeGeometry, buildRings, buildRingsAt, buildWallLids, courseTubePath, straightTubePath, tubeCenterAt, ForcedTunnel, bandGeometry, wallLidGeometry, wallLidBasis, nearFrameGeometry } from './tube';
import { STAGE_CAM } from '../game/cameraRig';
import { far05Debug, farRiverLayout, farRiverGeometry } from './far05'; // path-camera (05 far tunnel block)
import { FLOW05, FLOWMAP05, PROJ05 } from '../vfx/waterRibbon';
import { createProj05Apron } from '../vfx/proj05Apron'; // Screen 05 test W11 (?flow05=1), advection speed (?flowcam05=1)
import { PROJWALL05, PROJRING05, PROJFRAME05, PT_ROW, withProj05Wall, withProj05Ring, withProj05Frame, type WallSeg } from '../vfx/proj05Tunnel'; // Screen 05 tunnel bake tests
import { flow05Shared, flow05Textures } from '../vfx/flow05';
import { buildLaundryRoom, LaundryRoom } from './laundryRoom';
import { buildTowel, TowelMesh } from './towel';

export interface Environment {
  group: THREE.Group;
  update(time: number, dt: number): void;
  doorA: THREE.Object3D; // hinge pivot (rotation.y opens)
  doorC: THREE.Object3D;
  roomA: LaundryRoom & { anchor: THREE.Object3D };
  roomC: LaundryRoom & { anchor: THREE.Object3D };
  towel: TowelMesh; // on the chamber platform (08–11)
  drumTowel: TowelMesh; // bundle wrapped around Benny in drum A (01–02)
  laundry: { sock: THREE.Object3D; shirt: THREE.Object3D };
  /** groups toggled per scene for performance */
  zones: Record<'drumA' | 'basin' | 'tubes' | 'chamber', THREE.Group>;
  /** straight 05–07 tunnel axis (camera alignment) */
  tubeAxis: { path: import('./tube').TubePath; s0: number; s1: number };
}

const sm = (a: number, b: number, x: number) => {
  const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export function buildEnvironment(course: Course): Environment {
  const root = new THREE.Group();
  root.name = 'washer_world';
  const zones = {
    drumA: new THREE.Group(),
    basin: new THREE.Group(),
    tubes: new THREE.Group(),
    chamber: new THREE.Group(),
  };
  Object.entries(zones).forEach(([k, g]) => { g.name = 'zone_' + k; root.add(g); });
  const goldMat = gold();
  const goldSoft = gold({ roughness: 0.3, emissive: 0.3 });
  const chromeMat = chrome();
  const animated: ((t: number, dt: number) => void)[] = [];

  // =====================================================================================
  // Drum A (01–02)
  // =====================================================================================
  const dA = WORLD.drumA;
  const drumLen = dA.zDoor - dA.zBack;
  const drumGeo = new THREE.CylinderGeometry(dA.radius, dA.radius, drumLen, 96, 24, true);
  drumGeo.rotateX(Math.PI / 2);
  drumGeo.translate(0, 0, (dA.zDoor + dA.zBack) / 2);
  const drumMat = perforatedMetal({ color: '#f04fc8', emissive: '#c22aa6', emissiveIntensity: 0.3, slot: 0, repeatU: 54, repeatV: 15, holeSize: 0.44, streaks: 0.15 });
  zones.drumA.add(new THREE.Mesh(drumGeo, drumMat));
  // back wall with the drain opening
  const backShape = new THREE.Shape();
  backShape.absarc(0, 0, dA.radius, 0, Math.PI * 2, false);
  const drainHole = new THREE.Path();
  drainHole.absarc(-0.3, -3.05, 1.85, 0, Math.PI * 2, true);
  backShape.holes.push(drainHole);
  const backGeo = new THREE.ShapeGeometry(backShape, 48);
  backGeo.translate(0, 0, dA.zBack);
  const backMat = perforatedMetal({ color: '#e544c4', slot: 0, repeatU: 9, repeatV: 9, holeSize: 0.4, side: THREE.DoubleSide, streaks: 0 });
  zones.drumA.add(new THREE.Mesh(backGeo, backMat));
  // front wall annulus
  const frontShape = new THREE.Shape();
  frontShape.absarc(0, 0, dA.radius, 0, Math.PI * 2, false);
  const doorHole = new THREE.Path();
  doorHole.absarc(0, 0, dA.doorRadius, 0, Math.PI * 2, true);
  frontShape.holes.push(doorHole);
  const frontGeo = new THREE.ShapeGeometry(frontShape, 64);
  frontGeo.translate(0, 0, dA.zDoor);
  zones.drumA.add(new THREE.Mesh(frontGeo, perforatedMetal({ color: '#f15ccd', slot: 0, repeatU: 8, repeatV: 8, holeSize: 0.0, side: THREE.DoubleSide, streaks: 0, metalness: 0.85, roughness: 0.18 })));
  // gold door ring (thick) + chrome inner lip
  const ringA = new THREE.Mesh(new THREE.TorusGeometry(dA.doorRadius + 0.35, 0.48, 24, 96), goldMat);
  ringA.position.set(0, 0, dA.zDoor - 0.1);
  zones.drumA.add(ringA);
  const ringA2 = new THREE.Mesh(new THREE.TorusGeometry(dA.doorRadius + 1.15, 0.22, 16, 96), goldSoft);
  ringA2.position.set(0, 0, dA.zDoor - 0.15);
  zones.drumA.add(ringA2);
  // lifters (gold baffles)
  for (const ang of [52, 128, 270]) {
    const a = THREE.MathUtils.degToRad(ang);
    const lifter = new THREE.Mesh(new RoundedBoxGeometry(1.5, 1.1, drumLen - 1.6, 4, 0.5), goldMat);
    lifter.position.set(Math.cos(a) * (dA.radius - 0.45), Math.sin(a) * (dA.radius - 0.45), (dA.zDoor + dA.zBack) / 2 - 0.3);
    lifter.rotation.z = a + Math.PI / 2;
    zones.drumA.add(lifter);
  }
  // washer door A (hinged on the left seen from the room: pivot at x=-r)
  const doorA = new THREE.Group();
  doorA.name = 'doorA_pivot';
  doorA.position.set(-(dA.doorRadius + 0.6), 0, dA.zDoor + 0.55);
  const doorAInner = new THREE.Group();
  doorAInner.position.set(dA.doorRadius + 0.6, 0, 0);
  const doorRingA = new THREE.Mesh(new THREE.TorusGeometry(dA.doorRadius + 0.2, 0.42, 20, 80), chromeMat);
  const doorGlassA = new THREE.Mesh(new THREE.CircleGeometry(dA.doorRadius + 0.05, 48), glass('#e8f0ff', 0.1));
  doorAInner.add(doorRingA, doorGlassA);
  doorA.add(doorAInner);
  zones.drumA.add(doorA);
  // laundry room A outside the door
  const roomA = buildLaundryRoom({ floorDrop: 11, palette: 'warm' });
  const anchorA = new THREE.Group();
  anchorA.position.set(0, 0, dA.zDoor + 0.8);
  anchorA.add(roomA.group);
  zones.drumA.add(anchorA);
  // floating laundry: blue striped sock + pink star T-shirt
  const sock = buildSock();
  const shirt = buildShirt();
  zones.drumA.add(sock, shirt);
  // towel bundle around Benny
  const drumTowel = buildTowel();
  drumTowel.setBundle(1);
  zones.drumA.add(drumTowel.mesh);
  // chute from drum A drain to the basin rim
  // the chute begins exactly where the course passes through the drum's back wall
  let sChute0 = course.marks['02_drain'] - 3;
  while (course.sample(sChute0).pos.z > dA.zBack + 0.3 && sChute0 < course.stage('03').s0) sChute0 += 0.1;
  const sChute1 = course.stage('03').s0 + 0.3;
  const chutePath = courseTubePath(course, () => 2.25, 0.55);
  const chute = new THREE.Mesh(
    buildTubeGeometry(chutePath, sChute0, sChute1, { radial: 36, step: 0.5, vScale: 1 }),
    perforatedMetal({ color: '#e94ad0', slot: 0, repeatU: 22, repeatV: 1.6, holeSize: 0.38 }),
  );
  zones.drumA.add(chute);
  zones.drumA.add(buildRings(chutePath, sChute0 + 1.5, sChute1 - 1, 3.2, goldMat, { tube: 0.09 }));

  // =====================================================================================
  // Whirlpool basin room (03) + backdrop shared with 04
  // =====================================================================================
  const B = WORLD.basin;
  const prof: THREE.Vector2[] = [];
  for (let i = 0; i <= 40; i++) {
    const r = B.drainRadius * 1.04 + (B.rimRadius + 0.4 - B.drainRadius * 1.04) * (i / 40);
    prof.push(new THREE.Vector2(r, funnelY(r) - 0.45));
  }
  const funnelGeo = new THREE.LatheGeometry(prof, 96);
  funnelGeo.translate(B.center.x, 0, B.center.z);
  zones.basin.add(new THREE.Mesh(funnelGeo, perforatedMetal({ color: '#e04fd0', slot: 0, repeatU: 60, repeatV: 22, holeSize: 0.3, side: THREE.DoubleSide, streaks: 0 })));
  // thick gold drain lip + inner ring (ref 03: concentric gold rings inside the drain)
  for (const [rr, tt, dy] of [[B.drainRadius + 0.15, 0.42, 0.1], [B.drainRadius - 0.55, 0.22, -0.9]] as const) {
    const lip = new THREE.Mesh(new THREE.TorusGeometry(rr, tt, 18, 96), goldMat);
    lip.rotation.x = Math.PI / 2;
    lip.position.set(B.center.x, funnelY(B.drainRadius) + dy, B.center.z);
    zones.basin.add(lip);
  }
  const rim = new THREE.Mesh(new THREE.TorusGeometry(B.rimRadius + 0.5, 0.75, 24, 128), goldMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.set(B.center.x, B.rimY + 0.25, B.center.z);
  zones.basin.add(rim);
  const rim2 = new THREE.Mesh(new THREE.TorusGeometry(B.rimRadius + 2.1, 0.35, 16, 128), goldSoft);
  rim2.rotation.x = Math.PI / 2;
  rim2.position.set(B.center.x, B.rimY + 0.35, B.center.z);
  zones.basin.add(rim2);
  // glossy pink deck around the basin
  const deckShape = new THREE.Shape();
  deckShape.moveTo(-34, -34); deckShape.lineTo(34, -34); deckShape.lineTo(34, 30); deckShape.lineTo(-34, 30); deckShape.lineTo(-34, -34);
  const deckHole = new THREE.Path();
  deckHole.absarc(0, 0, B.rimRadius + 0.4, 0, Math.PI * 2, true);
  deckShape.holes.push(deckHole);
  const deck = new THREE.Mesh(new THREE.ShapeGeometry(deckShape, 64), new THREE.MeshStandardMaterial({ color: '#f36fd6', metalness: 0.5, roughness: 0.2, emissive: '#c43bb0', emissiveIntensity: 0.35, side: THREE.DoubleSide }));
  deck.rotation.x = -Math.PI / 2;
  deck.position.set(B.center.x, B.rimY + 0.3, B.center.z);
  zones.basin.add(deck);
  buildBasinBackdrop(zones.basin, goldMat, chromeMat);

  // =====================================================================================
  // 04 gold ring pipe
  // =====================================================================================
  const s04 = course.stage('04').s0, s05 = course.stage('05').s0;
  const tubeR = (s: number) => course.prop('tube', s);
  // the pipe mouth is the drain hole itself: narrow at the lip, opening up as it dives
  // the ring tunnel starts just ahead of Benny on the open slide (ref 04), with a flared mouth
  const g0 = s04 + 5.0;
  const r04 = (s: number) => tubeR(s) + 1.8 * (1 - sm(g0, g0 + 6, s));
  const goldPath = courseTubePath(course, r04, 0.9);
  const goldPipe = new THREE.Mesh(buildTubeGeometry(goldPath, g0, s05, { radial: 56, step: 0.4 }), goldRibbed(1.25));
  zones.tubes.add(goldPipe);
  zones.tubes.add(buildRings(goldPath, g0 + 0.2, s05 - 1, 1.6, goldMat, { tube: 0.05, inset: 0.02 }));
  // big mouth rings at the drain
  for (let i = 0; i < 4; i++) {
    const s = g0 + 0.05 + i * 0.3;
    zones.tubes.add(buildRings(goldPath, s, s + 0.01, 1, goldMat, { tube: 0.07, extra: 0.4 + i * 0.22 }));
  }

  // =====================================================================================
  // 05–07 perforated tubes (incl. the 06 arch hall and the full 07 plunge)
  // =====================================================================================
  const s08 = course.stage('08').s0;
  const pinkFlow = pinkFlowMaterial();
  // refs 05–07: rich saturated magenta→violet glossy pressed metal, dense glowing slot rows, warm light
  // far down the tunnel. Own reflection environment (no cyan studio panel) + correct inward normals.
  // hot magenta near → violet mid-tunnel → warm yellow-white core at the vanishing point
  const tubeGlow: FarGlow = { color: '#ffd08a', near: 48, far: 105, strength: 1.5 };
  const wallGlow: FarGlow = { ...tubeGlow, mid: { color: '#8a3cf0', near: 10, far: 42, amount: 0.55 } };
  const tubeEnv = washerTubeEnv('wall');
  const goldEnv = washerTubeEnv('gold');
  // 06/07 ring bays (unchanged): gold bands every 9 units, 4 circumferential slot rows per bay
  const ringSpacing = 9.0;
  const slotRowsPerBay = 4;
  // analytic strip lights along the tunnel (28 around: ref 05 shows ≈12–16 marquee spots per half-ring)
  const strips: TubeStrips = { count: 28, width: 0.022, intensity: 2.6, color: '#ffd9f6', alt: 0.65 };
  // glossy (low roughness → the strips stay crisp lengthwise streaks instead of a flat clipped sheen)
  const wallBase = {
    // pale pink F0: the saturation comes from the magenta/violet tube environment, so white strip lights
    // reflect as white-pink streaks (a saturated F0 turned them into clipped flat magenta)
    color: '#ffa8e8', emissive: '#3a0656', emissiveIntensity: 0.3, holeColor: '#0c0014',
    slot: 1, repeatU: 48, stagger: false,
    streaks: 0, metalness: 0.92, roughness: 0.1,
    relief: { corrugation: 0.05, bevel: 0.05, bevelWidth: 0.12 }, rimColor: '#ff5fe0', rimStrength: 0.9,
    envMap: tubeEnv, envMapIntensity: 1.0, farGlow: wallGlow,
  } as const;
  // STAGE ANCHORS (wave 6): the 06/07 ring bays, hood lids and slot rows are laid out from the 06 STAGE
  // START, not from the 05 start, so reshaping the 05 river (which changes its arc length) never slides the
  // 06/07 rings, lids or slot rows along the tube. The phases reproduce the pre-wave-6 layout exactly
  // (measured on that course: first 06/07 ring 5.5644 u after the 06 start; slot-row phase 0.96618 there).
  const s06 = course.stage('06').s0;
  const RING06_PHASE = 5.5643876;
  const ROW06_PHASE = 0.9661842;
  const rowRepeat0607 = slotRowsPerBay / ringSpacing;
  const rowOffset0607 = (((ROW06_PHASE - s06 * rowRepeat0607) % 1) + 1) % 1;
  const perfTubeMat = perforatedMetal({ ...wallBase, repeatV: rowRepeat0607, offsetV: rowOffset0607, slotHalf: [0.36, 0.12] });
  withTubeStrips(perfTubeMat, strips, 'attribute', 'wall');
  // straight-axis tunnel (05 → 07 incl. arch + plunge); the stream winds inside it
  // wave 9b controlled test T2 (user-directed 2026-11-16: BEFORE is the baseline, ONE geometric factor per test):
  // the HEIGHT of the NEAR 05 tunnel around the front ring A. Measured (tools/qa/ring_fit05.py, tools/qa/axis05.ts,
  // qa/pilot05/wave9b/T2/): the approved ring A centre is 59 px BELOW the vanishing point, BEFORE's 44 px ABOVE,
  // while rings B, C, D already sit like the approved (slightly above). Lowering the WHOLE tunnel moved B–D
  // away from the approved (rejected). T2 lowers only the tunnel up to ring A (26 u ahead of the eye) by
  // ?nearfloor05=<d> units and blends back to BEFORE before ring B (40 u): radius 7.6, ring depths and spacing,
  // ring B onward, the far block, camera, river and gameplay are untouched.
  // PROMOTED 2026-11-16 ~11:45 UTC together with T1 (user: "only promote T2 if it is genuinely closer"): default 2.0 u
  // with ring A at 20 u = ring A centre (502,478) r 433 vs approved (474,529) r 492 (BEFORE (505,426) r 374), its arc
  // meets the right edge at y 241 (approved 229, BEFORE 321); B, C, D, 06, 07 pixel-identical (qa/pilot05/wave9b/T2b/).
  // BEFORE = ?ringa=26&nearfloor05=0 (pixel-identical to qa/pilot05/wave9/baseline/05.png).
  const qaNear05 = typeof location !== 'undefined' ? Number(new URLSearchParams(location.search).get('nearfloor05') ?? 2) : 2;
  const NEAR_FLOOR05 = Number.isFinite(qaNear05) ? qaNear05 : 0;
  const sEye05 = course.marks['05_crest'] - (STAGE_CAM['05']?.back ?? 6.4);
  const floorExtra05 = NEAR_FLOOR05 === 0 ? undefined
    : (s: number) => NEAR_FLOOR05 * (1 - THREE.MathUtils.smootherstep(s, sEye05 + 28, sEye05 + 38)) * THREE.MathUtils.smoothstep(s, s05 + 2, s05 + 10);
  const perfPath = straightTubePath(course, s05, s08, { window: 30, taper: 14, baseRadius: tubeR, floorExtra: floorExtra05 });

  // ---- 05 current (ref 05): long ring bays + forced-perspective far tunnel, anchored to the 05 camera ----
  // Ref 05 ring radii about the VP: 288,192,122,85,66,54,45 px → from the locked checkpoint eye the rings sit
  // at depth ≈36/55 (near bays ≈17–19 units) and then recede in ever longer bays to a small warm light.
  // The straight only runs ≈56 units ahead of that eye before it flares into the 06 hall, so the real bays
  // end with a ring at depth ≈54 (sF05) and a ForcedTunnel (tube.ts) continues the same tunnel — walls,
  // slot rows, rings, lid pairs, water — to a virtual depth ≈430, compressed along the eye rays into the
  // last ≈6 real units. If path-camera moves the checkpoint, the bays and the far section follow.
  const sCam05 = course.marks['05_crest'] - (STAGE_CAM['05']?.back ?? 6.4);
  const bay05 = 14;
  const sGlow05 = course.stage('06').s0 - 5.9; // the straight flares into the 06 hall after this
  const sF05 = Math.min(sCam05 + 54, sGlow05 - 2.5);
  // ring slots every bay, ending at sF05; wave 8 (path-camera request, REQUESTS.md): the real ring AT sF05 is
  // dropped (depth 53 → r≈189 px, ref ring #2 is r≈170) — the far block's ring at virtual depth ≈59 replaces it.
  // The slot list still places the lid pair camera-side of that slot and the slot-row phase.
  const ringSlots05: number[] = [];
  for (let s = sF05; s >= s05 + 2; s -= bay05) ringSlots05.unshift(s);
  // wave 9b — controlled geometry test T1 (user-directed 2026-11-16: BEFORE is the baseline, one factor at a time).
  // Measured with tools/qa/ring_fit05.py (qa/pilot05/wave9b/rings): the approved rings are ROUND — A r 492 px,
  // B 240, C 150, D 88 — and BEFORE draws B 228, C 153, D 96 (within −5…+9 %) but the front ring A only 374 (−24 %):
  // its bay slot sits 26 u ahead of the checkpoint eye (r ≈ 9724 / depth). T1 moves ONLY that ring to RING_A05_DEPTH
  // (20 u → r ≈ 490); tunnel radius, cross-section, camera, every other ring, the lids and the far block are untouched.
  // Default 20 since the T2 promotion (2026-11-16); ?ringa=26 = BEFORE. (The wave-9 oval / "big tunnel" tests are NOT in this code:
  // qa/pilot05/wave9b/not_merged/.)
  const qaNum05 = (key: string, d: number) => {
    const v = typeof location !== 'undefined' ? new URLSearchParams(location.search).get(key) : null;
    return v !== null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : d;
  };
  const RING_A05_DEPTH = qaNum05('ringa', 20);
  // wave 9b controlled test W1 (user priority 1, 2026-11-16: glossy purple-metallic tunnel): tools/qa/diff05.py measured
  // the BEFORE walls too PINK (tunnel band pink 50 % vs approved 37 %) and too dull (white light streaks 0.9 % vs
  // 3.8 %). ?wall05=1 = ONE material factor: cooler violet wall F0 + emissive, brighter/wider/whiter lengthwise light
  // streaks. Geometry, rings, lids, Marble reflection map, river, camera untouched. Default 0 = BEFORE.
  const WALL05 = qaNum05('wall05', 0) === 1;
  // wave 9b controlled test G1 (user goal: polished gold rings): tools measured the ring gold (gold-mask pixels,
  // tunnel area) APPROVED mean (231,125,85), G/R 0.48, sat 0.66, shadow V p10 0.75 vs the game (239,154,112), 0.64,
  // 0.55, 0.82 = pale peach. ?gold05=1 = ONE material factor: a tone curve on the 05 ring band colour that deepens
  // the mid-tones toward saturated orange-gold while highlights stay bright. Default 0 = shader unchanged.
  const GOLD05 = qaNum05('gold05', 0) === 1;
  const TONE05: [number, number, number] = [1.35, 1.75, 1.3];
  const rings05 = ringSlots05.filter((s) => Math.abs(s - sF05) > 0.5).map((s) => (Math.abs(s - sCam05 - 26) < 3 ? sCam05 + RING_A05_DEPTH : s));
  // 05 walls: 7 dark capsule-slot rows per 14-unit bay, centred between the bands (rows 2 apart),
  // slots ≈0.6 × 0.24 units laid along the circumference (ref 05 near slots ≈10 × 28 px)
  // wave 7: 10 rows per bay (ref near walls show dense capsule rows, ≈25 px apart at the left edge; live had ≈45)
  const slotPitch05 = bay05 / 10;
  // ref 05 walls: deep metallic magenta/violet (#CD32AA / #992FC2), black slots, white-pink lengthwise
  // streaks; the warm light only at the very end (virtual depth ≳160 → halo ≲60 px about the VP)
  const glow05: FarGlow = { color: '#ffd796', near: 160, far: 470, strength: 1.6, mid: { color: '#8a30d2', near: 4, far: 48, amount: 0.45 } };
  // wave 7, tunnel surfaces only (walls, rings, lids; the far river keeps glow05): orange and earlier — the
  // reference throat inside the 4th ring (r < 50 px ≈ virtual depth > 200) is one continuous warm orange well
  // ((229,111,81) at r 32–48, (248,169,89) at r 16–24), no purple gaps between the rings
  const glowT05: FarGlow = { ...glow05, color: '#ff9c5a', near: 95, far: 330, strength: 1.5 };
  const wall05 = {
    // lavender F0 × the magenta tube environment → violet-magenta metal (ref #992FC2 / #CD32AA)
    // wave 7: no pressed-metal corrugation (its bent normals turned the strip reflections into the "marbled
    // swirl"), only a faint bevel; shaded slot lips instead of the bright pink dotted outline; shorter, plumper
    // capsules (ref median slot 25 px², elongation 4.3; live was 40 px², 8.8); bluer violet F0 (ref wall
    // medians (171,44,177) / (188,51,205) / (154,46,166))
    // wave 8: luminous magenta-pink instead of violet (ref left wall mean (192,76,167), violet share of
    // violet+magenta 40–51 %; it06 (159,47,178), 91–93 %): warmer F0 between '#d49cf4' and '#f29ad6', softer
    // and later violet mid tint, no slot bevel (its aliased highlight drew a jagged pink outline round every slot),
    // and the Marble 05 panorama as the reflection source (marblePano05: pink walls, warm ring lights, VP glow)
    // (it02: Marble env pre-blurred 6 px — its sharp ring arcs smeared into red-orange blotches on the near walls
    // in it01 — and violet back with depth: bluer F0, mid tint '#8a30d2' 0.45 @8–50; it01 overshot to 14–22 %)
    ...wallBase, color: WALL05 ? '#a878ff' : '#dc9ef0', emissive: WALL05 ? '#300a66' : '#3c0848', emissiveIntensity: 0.16, envMapIntensity: 0.9, roughness: 0.07,
    relief: { corrugation: 0, bevel: 0, bevelWidth: 0.08 },
    rimColor: '#b02a9a', rimStrength: 0.0, farGlow: { ...glowT05, mid: { color: '#8a30d2', near: 8, far: 50, amount: 0.45 } },
    envMap: marblePano05(), envMapRotation: marblePanoRotation05(perfPath.frame(sCam05).tan),
    repeatU: 64, repeatV: 1 / slotPitch05, slotHalf: [0.3, 0.16] as [number, number],
    offsetV: 0.5 - ((((ringSlots05[0] + slotPitch05 / 2) / slotPitch05) % 1) + 1) % 1,
  };
  if (FLOWMAP05) {
    // W11: the river mirrors the same Marble panorama as the tunnel metal (waterRibbon.ts, direct equirect lookup)
    flow05Shared.uPano.value = marblePano05();
    flow05Shared.uPanoRot.value.copy(marblePanoMatrix05(perfPath.frame(sCam05).tan));
  }
  // straight white-pink lengthwise streaks (ref specular-white share 5.6 % of the wall, live 0.5–2 %)
  const strips05: TubeStrips = WALL05
    ? { ...strips, intensity: 5.6, width: 0.02, alt: 0.8 }
    : { ...strips, intensity: 4.4, width: 0.017, alt: 0.8 };
  const perf05Mat = withTubeStrips(perforatedMetal(wall05), strips05, 'attribute', 'wall05');
  const chunk = 40;
  const addWall = (a0: number, a1: number, mat: THREE.Material) => {
    for (let a = a0; a < a1 - 0.01; a += chunk) {
      const b = Math.min(a1, a + chunk + 0.6);
      zones.tubes.add(new THREE.Mesh(buildTubeGeometry(perfPath, a, b, { radial: 72, step: 0.6, frontNormals: true, axisAttr: true }), mat));
      // glossy magenta flow sheet lining the tube floor under the stream (refs 05/07 pink banks)
      zones.tubes.add(new THREE.Mesh(buildTubeGeometry(perfPath, a, b, { radial: 24, step: 0.8, arc: 1.9, inset: -0.12, vScale: 6, frontNormals: true }), pinkFlow.material));
    }
  };
  addWall(s05, sGlow05, perf05Mat);
  addWall(sGlow05, s08, perfTubeMat);
  // 06/07 rings and the 04→05 junction collar (unchanged look)
  const ringMat = withTubeStrips(withFarGlow(gold({ color: '#ffc890', roughness: 0.12, emissive: 0.16 }), tubeGlow, 'ring'), { ...strips, color: '#fff0c8', intensity: 3.2 }, 'instance', 'ring');
  ringMat.envMap = goldEnv;
  ringMat.envMapIntensity = 1.3;
  // ref 05 rings: polished YELLOW gold — pale-yellow highlights (#FCE082), gold mids (#F4B70F…#F9A640),
  // copper only on the shadowed side — from a yellow F0, little flat emissive (it flattened the band to
  // one orange) and the rounded double-lip band (bandGeometry) whose crown, groove and lip catch the
  // strip lights as marquee spots
  const goldEnv05 = washerTubeEnv('gold05');
  const band05 = { height: 0.095, width: 0.78, lipHeight: 0.045, lipWidth: 0.26, groove: 0.07 };
  // wave 7: the band colour is the stylised cross-section of withBandShading (materials.ts); the PBR/env
  // result underneath only feeds the depth buffer now
  // wave 8: the real (near) ring is thicker — ref ring #1 top spans y 188–230 (lip 8 px · groove 3 · body 17 ·
  // turned-away flank 7 · contour) where it06 drew 31 px; the far rings (path-camera block) keep band05, the
  // reference's deeper rings are thin (ring #2 top ≈12 px)
  const band05near = { height: 0.13, width: 0.8, lipHeight: 0.065, lipWidth: 0.32, groove: 0.1 };
  const gold05 = (key: string, virtual: boolean, band: typeof band05 = band05) => {
    const m = withBandShading(withFarGlow(gold({ color: '#ffd45c', roughness: 0.13, emissive: 0.1 }), glowT05, key, virtual), GOLD05 ? { ...band, tone: TONE05 } : band, key);
    m.emissive.set('#e08a10');
    m.envMap = goldEnv05;
    m.envMapIntensity = 1.15;
    return m;
  };
  // `?projring05=1` (qa/pilot05/proj/tunnel/NOTES.md): the approved gold band baked onto the 05 rings; off = unchanged
  const ringMat05 = PROJRING05 ? withProj05Ring(gold05('ring05', false, band05near), true, band05near.height, 'real') : gold05('ring05', false, band05near);
  // `?projwall05=1`: the approved purple wall, one baked texture row per bay between two rings (src/vfx/proj05Tunnel.ts).
  // Depths are measured from the locked checkpoint eye; the BC bay runs from the real ring B across the seam to the far
  // block's first ring (virtual depth ringDv[0]), so both walls share its row (split at tSeam05, linear in depth).
  const ptHw05 = (band05near.width + band05near.groove + band05near.lipWidth) / 2;
  const ptA05 = sCam05 + RING_A05_DEPTH;
  const ptB05 = rings05.find((s) => s > ptA05 + 1) ?? ptA05 + 20;
  const ptSeam05 = (dC: number, d0: number) => (d0 - (d0 - (sF05 - ptB05) + ptHw05)) / (dC - (band05.width + band05.groove + band05.lipWidth) / 2 - (d0 - (sF05 - ptB05) + ptHw05));
  if (PROJWALL05) {
    const segs: WallSeg[] = [];
    const before = rings05.filter((s) => s < ptA05 - 1);
    const list = [(before[0] ?? ptA05) - bay05, ...before, ptA05];
    for (let i = 0; i + 1 < list.length; i++) segs.push({ v0: list[i] + ptHw05, v1: list[i + 1] - ptHw05, row: PT_ROW.AB, t0: 0, t1: 1 });
    segs.push({ v0: ptA05 + ptHw05, v1: ptB05 - ptHw05, row: PT_ROW.AB, t0: 0, t1: 1 });
    // D0 of the far block is known further down; the eye sits (STAGE_CAM back) behind the crest, so depth(sF05) ≈ sF05 − sCam05 − 0.75
    segs.push({ v0: ptB05 + ptHw05, v1: sF05, row: PT_ROW.BC, t0: 0, t1: ptSeam05(59, sF05 - sCam05 - 0.75) });
    withProj05Wall(perf05Mat, segs.slice(-8), { anchor: sF05, period: bay05 }, 'real');
  }
  const collar = { depth: 0.022, lip: 0.012, width: 1.1 };
  // gold junction collar 04→05 (slightly heavier)
  zones.tubes.add(buildRings(perfPath, s05 + 0.3, s05 + 0.31, 1, ringMat, { inset: 0.02, collar: { depth: 0.03, lip: 0.014, width: 1.3 } }));
  zones.tubes.add(buildRingsAt(perfPath, rings05, ringMat05, { inset: 0.02, band: band05near }));
  const rings0607: number[] = [];
  for (let s = s06 + RING06_PHASE - 2 * ringSpacing; s <= s08 - 1 + 1e-6; s += ringSpacing) if (s >= sGlow05 + 4) rings0607.push(s);
  zones.tubes.add(buildRingsAt(perfPath, rings0607, ringMat, { inset: 0.02, collar }));
  // copper nozzle lids: one symmetric pair per bay on the side walls a little above eye level,
  // skipped where the stream climbs the wall (06 arch) so a lid never blocks the ride
  const lidMat = withTubeStrips(withFarGlow(gold({ color: '#ffb27a', roughness: 0.16, emissive: 0.2 }), tubeGlow, 'lid'), { ...strips, color: '#fff0c8', intensity: 2.4 }, 'instance', 'lid');
  lidMat.envMap = goldEnv;
  lidMat.envMapIntensity = 1.25;
  const lidClear = (s: number, centre: THREE.Vector3, size: number) => {
    for (let ds = -6; ds <= 6; ds += 1.5) {
      const ss = THREE.MathUtils.clamp(s + ds, 0, course.length);
      if (course.sample(ss).pos.distanceTo(centre) < size * 1.2 + course.widthAt(ss) / 2 + 1.0) return true;
    }
    return false;
  };
  // 05 (ref §5.5): flat round copper-gold lids ('slab' half-disc pucks standing out of the wall, seen from
  // below at an angle), one symmetric pair per bay at mid-bay, ≈12° above the axis on both walls
  // wave 7: rose-copper pucks (withLidShading), thicker rim band, just camera-side of each ring (ref L1/L2/R1/R2
  // end right where a ring band starts)
  const lid05 = { shape: 'slab' as const, angleDeg: 8, droopDeg: -34, size: 2.2, thickness: 0.36, stretch: 1.0, sink: 0.1 };
  const lidMat05 = (key: string, virtual: boolean) => {
    const m = withLidShading(withFarGlow(gold({ color: '#ffb866', roughness: 0.22, emissive: 0.08 }), glowT05, key, virtual), key);
    m.emissive.set('#c86a18');
    m.envMap = goldEnv05;
    m.envMapIntensity = 1.35;
    return m;
  };
  const lids05 = ringSlots05.map((s) => s - band05.width / 2 - lid05.size * 1.05).filter((s) => s > s05 + 4);
  zones.tubes.add(buildWallLids(perfPath, 0, 0, bay05, lidMat05('lid05', false), { positions: lids05, ...lid05 }));
  // 06/07: legacy hoods, unchanged
  const lids0607: number[] = [];
  for (let s = s06 + RING06_PHASE + ringSpacing * 0.5 - 2 * ringSpacing; s <= s08 - 6 + 1e-6; s += ringSpacing) if (s >= sGlow05 + 4) lids0607.push(s);
  zones.tubes.add(buildWallLids(perfPath, 0, 0, ringSpacing, lidMat, { positions: lids0607, angleDeg: 18, droopDeg: 20, size: 1.7, thickness: 0.42, stretch: 1.3, sink: 0.12, skip: lidClear }));

  // ---- 05 far tunnel (forced perspective, calibrated for the locked 05 checkpoint eye) ----
  {
    // the checkpoint eye, exactly as RideCamera places it on the straight (cameraRig.ts, '05' block, lat 0)
    const sC = course.marks['05_crest'];
    const p5 = STAGE_CAM['05']!;
    const af = perfPath.frame(sC);
    const T = af.tan.clone();
    const U = new THREE.Vector3(0, 1, 0).addScaledVector(T, -T.y).normalize();
    const Rt = new THREE.Vector3().crossVectors(T, U).normalize();
    const water = course.sample(sC).pos.clone();
    const off = water.clone().sub(af.pos).dot(Rt);
    const dz = p5.deadZone ?? 1;
    const follow = p5.latFollow * (1 - Math.exp(-(off * off) / (dz * dz)));
    const eye = water.addScaledVector(T, -p5.back).addScaledVector(U, p5.up).addScaledVector(Rt, -off * (1 - follow));
    // wave 8: far rings at the reference radii 170 / 104 / 62 / 45 / 31 px about the VP (rays at 90/120/150°;
    // live calibration r ≈ 10000/D) → virtual depth ≈ 59 / 97 / 161 / 222 / 322, then the warm throat. Ring n sits
    // at tunnel coordinate u = bay05·(n + ½) (half a bay after the seam, then one bay each, so every far bay keeps
    // its slot rows and lid pair). The D≈59 ring replaces the real ring at sF05 (r≈189, "ring #2 too big"): it only
    // shows once the environment owner has removed that ring from rings05, so there is never a double ring.
    const D0 = tubeCenterAt(perfPath, sF05).sub(eye).dot(T);
    const realSeamRing = rings05.some((s) => Math.abs(s - sF05) < 0.5);
    const ringDv = [59, 97, 161, 222, 322];
    const knots: [number, number][] = [[0, 0]];
    ringDv.forEach((d, i) => knots.push([bay05 * (i + 0.5), Math.max(d - D0, knots[i][1] + 1)]));
    const zEnd = 430 - D0;
    const ft = new ForcedTunnel(perfPath, sF05, eye, 6, zEnd, knots, T);
    // walls: same pressed metal, slot rows continue (uv.y = sF + u), distance glow by virtual depth
    const farWallMat = withTubeStrips(perforatedMetal({ ...wall05, virtualDepth: true }), strips05, 'attribute', 'wall05v');
    if (PROJWALL05) {
      // far bays in the wall's own coordinate v = sF05 + u (knots: u → virtual depth Z, piecewise linear)
      const hwF = (band05.width + band05.groove + band05.lipWidth) / 2;
      const slope = (i: number) => (knots[Math.min(i + 1, knots.length - 1)][1] - knots[Math.min(i + 1, knots.length - 1) - 1][1]) / (knots[Math.min(i + 1, knots.length - 1)][0] - knots[Math.min(i + 1, knots.length - 1) - 1][0]);
      const nearEdge = (n: number) => sF05 + knots[n + 1][0] - hwF / slope(n);          // camera side of far ring n
      const farEdge = (n: number) => sF05 + knots[n + 1][0] + hwF / slope(n + 1);       // far side of far ring n
      const rows = [PT_ROW.CD, PT_ROW.DE, PT_ROW.EF, PT_ROW.FG];
      const segs: WallSeg[] = [{ v0: sF05 - 1, v1: nearEdge(0), row: PT_ROW.BC, t0: ptSeam05(ringDv[0], D0), t1: 1 }];
      rows.forEach((row, n) => segs.push({ v0: farEdge(n), v1: nearEdge(n + 1), row, t0: 0, t1: 1 }));
      const uEnd = sF05 + knots[knots.length - 1][0] + (zEnd - knots[knots.length - 1][1]) / slope(knots.length - 1);
      segs.push({ v0: farEdge(rows.length), v1: uEnd, row: PT_ROW.GX, t0: 0, t1: 0.07 });
      segs.push({ v0: uEnd, v1: 1e9, row: PT_ROW.GX, t0: 0.07, t1: 0.07 });
      withProj05Wall(farWallMat, segs, { anchor: sF05, period: bay05 }, 'far');
    }
    const farWall = new THREE.Mesh(ft.geometry(64, 80), farWallMat);
    // the far stream (wave 8, far05.ts): the real ribbon's band layout continued past the seam, winding into the VP
    const level = -(perfPath.radius(sF05) - perfPath.depth(sF05)) + 0.04;
    const farLay = farRiverLayout(course, ft, level);
    const farRiver = new THREE.Mesh(farRiverGeometry(ft, farLay, level, 16, 120), farRiverMaterial(glow05, ft.D0, FLOWMAP05 ? { ripple: flow05Textures(course).ripple, time: flow05Shared.uTime, speed: course.stage('05').speed * FLOW05 } : undefined));
    Object.assign(far05Debug, { ft, eye, sF05, bay05, ringDv, knots, realSeamRing, perfPath, level, farLay, sCam05, s05, sGlow05, rings05, band05, band05near });
    // rings (one per knot) and a lid pair just in front of each ring (as the real 05 lids), low-poly: small on screen
    const ringItems: Parameters<ForcedTunnel['placeInstances']>[1] = [];
    const lidItems: Parameters<ForcedTunnel['placeInstances']>[1] = [];
    const fr0 = { pos: ft.c0, tan: ft.T, up: ft.U, right: ft.Rt };
    const ringBasis = new THREE.Matrix4().makeBasis(ft.Rt, ft.U, ft.T);
    const rRing = perfPath.radius(sF05) - 0.02;
    const openAt = (u: number) => {
      const sReal = sF05 + ft.zOf(ft.zOfU(u));
      return { c: tubeCenterAt(perfPath, sReal), r: perfPath.radius(sReal) * 1.1 + 0.4, f: perfPath.frame(sReal) };
    };
    const lidSz = lid05.size * Math.min(1.4, perfPath.radius(sF05) / 7.6);
    const lidUs: number[] = [];
    for (let n = 0; n < ringDv.length; n++) {
      if (n === 0 && realSeamRing) continue;
      const u = knots[n + 1][0];
      const op = openAt(u);
      ringItems.push({ u, o: new THREE.Vector3(), basis: ringBasis, s: new THREE.Vector3(rRing, rRing, 1), openPos: op.c, openScale: op.r / rRing });
      lidUs.push(ft.uOfZ(Math.max(0.5, knots[n + 1][1] - band05.width / 2 - lidSz * 1.05)));
    }
    for (const u of lidUs) {
      for (const side of [1, -1]) {
        const b = wallLidBasis(fr0, side, lid05.angleDeg, lid05.droopDeg);
        const op = openAt(u);
        const o = b.dir.clone().multiplyScalar(perfPath.radius(sF05) - lidSz * lid05.sink);
        const dirOpen = op.f.right.clone().multiplyScalar(Math.cos(THREE.MathUtils.degToRad(lid05.angleDeg)) * side).addScaledVector(op.f.up, Math.sin(THREE.MathUtils.degToRad(lid05.angleDeg)));
        lidItems.push({ u, o, basis: new THREE.Matrix4().makeBasis(b.X, b.Y, b.Z), s: new THREE.Vector3(lidSz, lidSz, lidSz * lid05.stretch), openPos: op.c.clone().addScaledVector(dirOpen, op.r + lidSz * 1.5), openScale: 1 });
      }
    }
    const farRings = new THREE.InstancedMesh(bandGeometry({ ...band05, segments: 48 }), PROJRING05 ? withProj05Ring(gold05('ring05v', true), false, band05.height, 'far') : gold05('ring05v', true), ringItems.length);
    const farLids = new THREE.InstancedMesh(wallLidGeometry('slab', lid05.thickness, 16), lidMat05('lid05v', true), lidItems.length);
    // warm light at the very end (ref 05 VP: core ≲40 px, halo ≲120 px)
    const glowMat = tunnelEndGlowMaterial(new THREE.Vector4(0, 0.001, 400, 420));
    const glow = new THREE.Mesh(new THREE.CircleGeometry(1, 48), glowMat);
    glow.name = 'tube05_end_glow';
    glow.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(fr0.right, fr0.up, fr0.tan.clone().negate()));
    glow.position.copy(ft.point(zEnd, new THREE.Vector3()));
    glow.scale.setScalar(perfPath.radius(sF05) * ft.kOf(zEnd) * 1.35);
    const parts = [farWall, farRiver, farRings, farLids, glow];
    for (const p of parts) { p.frustumCulled = false; p.name ||= 'tube05_far'; }
    farWall.name = 'tube05_far_wall'; farRiver.name = 'tube05_far_river';
    // `?proj05=1` only: visual-only strip on the lower wall carrying the approved foam banks beyond the river edge at the
    // far bends (src/vfx/proj05Apron.ts); `?projbank05=0` leaves it out. No collisions; nothing else changes.
    if (PROJ05 && (typeof location === 'undefined' || new URLSearchParams(location.search).get('projbank05') !== '0')) {
      root.add(createProj05Apron(course, perfPath, sCam05 + 4, sF05));
    }
    // open/close with the rider camera (closed at the 05 checkpoint, folded away from ≈18 units before sF)
    let openNow = -1;
    const camPos = new THREE.Vector3();
    const sync = (cam: THREE.Camera) => {
      const o = ft.openFor(camPos.setFromMatrixPosition(cam.matrixWorld));
      if (Math.abs(o - openNow) < 1e-4) return;
      openNow = o;
      ft.placeInstances(farRings, ringItems, o);
      ft.placeInstances(farLids, lidItems, o);
    };
    sync(new THREE.PerspectiveCamera().translateOnAxis(T, -1e4)); // initial: closed
    farWall.onBeforeRender = (_r, _s, cam) => { sync(cam); farWall.morphTargetInfluences![0] = openNow; };
    farRiver.onBeforeRender = (_r, _s, cam) => { sync(cam); farRiver.morphTargetInfluences![0] = openNow; };
    farRings.onBeforeRender = (_r, _s, cam) => sync(cam);
    farLids.onBeforeRender = (_r, _s, cam) => sync(cam);
    glow.onBeforeRender = (_r, _s, cam) => { sync(cam); glowMat.uniforms.uOpacity.value = 1 - openNow; };
    zones.tubes.add(...parts);
  }
  animated.push(pinkFlow.update);

  // =====================================================================================
  // Final Spin Chamber (08–11)
  // =====================================================================================
  const C = WORLD.chamber;
  const cLen = C.zBack - C.zDoor;
  const chamberGeo = new THREE.CylinderGeometry(C.radius, C.radius, cLen, 120, 30, true);
  chamberGeo.rotateX(Math.PI / 2);
  chamberGeo.translate(C.center.x, C.center.y, (C.zBack + C.zDoor) / 2);
  const chamberMat = perforatedMetal({ color: '#cf45dc', emissive: '#9a24b8', emissiveIntensity: 0.3, slot: 1, repeatU: 92, repeatV: 22, holeSize: 0.46, streaks: 0.45 });
  zones.chamber.add(new THREE.Mesh(chamberGeo, chamberMat));
  // back wall with the 07 inlet hole
  const inletC = tubeCenterAt(perfPath, s08 - 0.05);
  const inletR = perfPath.radius(s08 - 0.05);
  const cb = new THREE.Shape();
  cb.absarc(C.center.x, C.center.y, C.radius, 0, Math.PI * 2, false);
  const inHole = new THREE.Path();
  inHole.absarc(inletC.x, Math.max(inletC.y, C.center.y - C.radius + inletR + 0.15), inletR - 0.05, 0, Math.PI * 2, true);
  cb.holes.push(inHole);
  const cbGeo = new THREE.ShapeGeometry(cb, 64);
  cbGeo.translate(0, 0, C.zBack);
  zones.chamber.add(new THREE.Mesh(cbGeo, perforatedMetal({ color: '#cf45dc', slot: 1, repeatU: 12, repeatV: 12, holeSize: 0.4, side: THREE.DoubleSide })));
  for (const [rr, tt, dz] of [[inletR + 0.35, 0.85, -0.3], [inletR + 1.7, 0.4, -0.2], [inletR + 2.6, 0.25, -0.1]] as const) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, tt, 24, 120), goldMat);
    ring.position.set(inletC.x, inletC.y, C.zBack + dz);
    zones.chamber.add(ring);
  }
  // front wall with the round door
  const doorCenterC = new THREE.Vector3(C.center.x, WORLD.platform.topY + 7.0, C.zDoor);
  const cf = new THREE.Shape();
  cf.absarc(C.center.x, C.center.y, C.radius, 0, Math.PI * 2, false);
  const dHole = new THREE.Path();
  dHole.absarc(doorCenterC.x, doorCenterC.y, C.doorRadius, 0, Math.PI * 2, true);
  cf.holes.push(dHole);
  const cfGeo = new THREE.ShapeGeometry(cf, 64);
  cfGeo.translate(0, 0, C.zDoor);
  zones.chamber.add(new THREE.Mesh(cfGeo, perforatedMetal({ color: '#cf45dc', slot: 1, repeatU: 12, repeatV: 12, holeSize: 0.4, side: THREE.DoubleSide })));
  const doorFrame = new THREE.Mesh(new THREE.TorusGeometry(C.doorRadius + 0.55, 0.85, 24, 120), chromeMat);
  doorFrame.position.copy(doorCenterC).add(new THREE.Vector3(0, 0, 0.3));
  zones.chamber.add(doorFrame);
  for (const [rr, tt] of [[C.doorRadius + 2.0, 0.55], [C.doorRadius + 3.1, 0.3]] as const) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(rr, tt, 20, 120), goldMat);
    ring.position.copy(doorCenterC).add(new THREE.Vector3(0, 0, 0.5));
    zones.chamber.add(ring);
  }
  // door C (hinge on the right seen from inside = +X), swings outward (-Z)
  const doorC = new THREE.Group();
  doorC.name = 'doorC_pivot';
  doorC.position.set(doorCenterC.x + C.doorRadius + 0.9, doorCenterC.y, C.zDoor - 0.6);
  const doorCInner = new THREE.Group();
  doorCInner.position.set(-(C.doorRadius + 0.9), 0, 0);
  doorCInner.add(new THREE.Mesh(new THREE.TorusGeometry(C.doorRadius + 0.35, 0.75, 22, 100), chromeMat));
  doorCInner.add(new THREE.Mesh(new THREE.CircleGeometry(C.doorRadius + 0.2, 64), glass('#e6efff', 0.12)));
  const handle = new THREE.Mesh(new RoundedBoxGeometry(1.0, 2.6, 0.8, 3, 0.3), chromeMat);
  handle.position.set(-(C.doorRadius + 0.6), 0, -0.4);
  doorCInner.add(handle);
  doorC.add(doorCInner);
  const hinge = new THREE.Mesh(new RoundedBoxGeometry(1.2, 3.2, 1.2, 3, 0.3), chromeMat);
  hinge.position.set(doorCenterC.x + C.doorRadius + 0.9, doorCenterC.y + 2.4, C.zDoor - 0.2);
  const hinge2 = hinge.clone();
  hinge2.position.y -= 4.8;
  zones.chamber.add(doorC, hinge, hinge2);
  // laundry room C (beyond the door, toward -Z)
  const roomC = buildLaundryRoom({ floorDrop: 14.25, palette: 'soft', foldingTable: true });
  const anchorC = new THREE.Group();
  anchorC.position.set(doorCenterC.x, doorCenterC.y, C.zDoor - 1.0);
  anchorC.rotation.y = Math.PI;
  anchorC.add(roomC.group);
  zones.chamber.add(anchorC);
  // platform
  const P = WORLD.platform;
  const platTopMat = perforatedMetal({ color: '#d556df', emissive: '#a02cb8', emissiveIntensity: 0.3, slot: 0, repeatU: 70, repeatV: 9, holeSize: 0.42, side: THREE.DoubleSide, metalness: 0.8 });
  const platTop = new THREE.Mesh(new THREE.CylinderGeometry(P.radius, P.radius, 0.35, 72, 1, false), platTopMat);
  platTop.position.set(P.center.x, P.topY - 0.18, P.center.z);
  zones.chamber.add(platTop);
  const platRim = new THREE.Mesh(new THREE.TorusGeometry(P.radius, 0.28, 14, 96), goldMat);
  platRim.rotation.x = Math.PI / 2;
  platRim.position.set(P.center.x, P.topY - 0.15, P.center.z);
  zones.chamber.add(platRim);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const top = new THREE.Vector3(P.center.x + Math.cos(a) * P.radius * 0.72, P.topY - 0.3, P.center.z + Math.sin(a) * P.radius * 0.72);
    const bot = new THREE.Vector3(P.center.x + Math.cos(a) * P.radius * 0.95, C.center.y - Math.sqrt(C.radius ** 2 - (Math.cos(a) * P.radius * 0.95) ** 2) + 0.2, P.center.z + Math.sin(a) * P.radius * 0.95);
    const mid = top.clone().lerp(bot, 0.5).add(new THREE.Vector3(Math.cos(a) * -0.8, 0, Math.sin(a) * -0.8));
    const leg = new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(top, mid, bot), 12, 0.28, 10), goldMat);
    zones.chamber.add(leg);
  }
  // towel on the platform
  const towel = buildTowel();
  towel.mesh.position.set(P.center.x, P.topY, P.center.z - 1.0);
  zones.chamber.add(towel.mesh);
  // spray spouts on the side walls with pouring water
  const spoutDome = perforatedMetal({ color: '#e05ad8', slot: 0, repeatU: 26, repeatV: 10, holeSize: 0.4, side: THREE.DoubleSide, emissiveIntensity: 0.3 });
  const spoutPositions: [number, number, number][] = [[-1, -287, 1.3], [1, -292, 1.1], [-1, -306, 1.0], [1, -311, 1.15], [1, -320, 1.0]];
  for (const [side, z, scale] of spoutPositions) {
    const ang = THREE.MathUtils.degToRad(side > 0 ? 18 : 162);
    const wall = new THREE.Vector3(C.center.x + Math.cos(ang) * (C.radius - 0.2), C.center.y + Math.sin(ang) * (C.radius - 0.2), z);
    const s = buildSpout(spoutDome, goldMat, scale * 2.4);
    s.position.copy(wall);
    s.lookAt(new THREE.Vector3(C.center.x, wall.y - 2, z));
    zones.chamber.add(s);
    const stream = buildPourStream(wall.clone().add(new THREE.Vector3(-side * 2.0 * scale, -1.6 * scale, 0)), C.center.y - C.radius + 1.2 + Math.abs(Math.cos(ang)) * 1.5, -side);
    zones.chamber.add(stream.mesh);
    animated.push(stream.update);
  }

  // 05 near gold frame (wave 7, ref bottom corners + bottom lip), built LAST: three's UUIDs draw on Math.random,
  // so creating it earlier shifted the random canvas textures of the 08 laundry room / pour streams.
  // Real 3D bands held in front of the rider
  // camera (nearFrameGeometry, reference-pixel units → camera space at depth 0.8, scaled by the camera FOV).
  // Shown only while the camera rides the straight 05 current; it slides down out of the frame over ≈6 units
  // when entering from 04 and before the 06 hall, and is collapsed (zero scale) everywhere else, so 01–04 and
  // 06–11 never see it. It covers only the frame's bottom corners/edge (below Benny), never the course ahead.
  {
    // `?projframe05=1` (src/vfx/proj05Tunnel.ts): the approved gold band on the same frame; default unchanged
    const frame = new THREE.Mesh(nearFrameGeometry(), PROJFRAME05 ? withProj05Frame(nearFrameMaterial()) : nearFrameMaterial());
    frame.name = 'tube05_near_frame';
    frame.frustumCulled = false;
    frame.matrixAutoUpdate = false;
    frame.matrixWorldAutoUpdate = false;
    frame.renderOrder = 2;
    const P05 = tubeCenterAt(perfPath, sCam05);
    const T05 = perfPath.frame(sCam05).tan.clone();
    const axialOf = (s: number) => tubeCenterAt(perfPath, s).sub(P05).dot(T05);
    const aIn0 = axialOf(s05), aIn1 = axialOf(s05 + 6), aOut0 = axialOf(sGlow05 - 30), aOut1 = axialOf(sGlow05 - 23);
    const rLat = perfPath.radius(sCam05) * 1.2;
    const camP = new THREE.Vector3(), rel = new THREE.Vector3(), slide = new THREE.Matrix4(), place = new THREE.Matrix4();
    const zero = new THREE.Matrix4().makeScale(0, 0, 0), scl = new THREE.Matrix4();
    frame.onBeforeRender = (_r, _s, cam) => {
      camP.setFromMatrixPosition(cam.matrixWorld);
      rel.copy(camP).sub(P05);
      const a = rel.dot(T05);
      const lat = rel.addScaledVector(T05, -a).length();
      const k = THREE.MathUtils.smoothstep(a, aIn0, aIn1) * (1 - THREE.MathUtils.smoothstep(a, aOut0, aOut1)) * (lat < rLat ? 1 : 0);
      const pc = cam as THREE.PerspectiveCamera;
      if (k <= 1e-3 || !pc.isPerspectiveCamera) { frame.matrixWorld.copy(zero); return; }
      const d = 0.8;
      const px = (d * Math.tan(THREE.MathUtils.degToRad(pc.fov) / 2)) / 768;
      slide.makeTranslation(0, -(1 - k) * 420, 0);
      place.makeTranslation(0, 0, -d).multiply(scl.makeScale(px, px, px)).multiply(slide);
      frame.matrixWorld.multiplyMatrices(cam.matrixWorld, place);
    };
    zones.tubes.add(frame);
  }
  return {
    group: root,
    update: (t, dt) => animated.forEach((f) => f(t, dt)),
    doorA,
    doorC,
    roomA: { ...roomA, anchor: anchorA },
    roomC: { ...roomC, anchor: anchorC },
    towel,
    drumTowel,
    laundry: { sock, shirt },
    zones,
    tubeAxis: { path: perfPath, s0: s05, s1: course.marks['07_plunge_top'] },
  };
}

// ---------------------------------------------------------------------------------------
function buildBasinBackdrop(g: THREE.Group, goldMat: THREE.Material, chromeMat: THREE.Material) {
  const B = WORLD.basin;
  const wallZ = B.center.z - 17;
  const pinkWall = new THREE.MeshStandardMaterial({ color: '#f070d0', metalness: 0.35, roughness: 0.3, emissive: '#d04ab8', emissiveIntensity: 0.3 });
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(80, 60), pinkWall);
  wall.position.set(B.center.x, B.rimY + 26, wallZ);
  g.add(wall);
  for (const sx of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), pinkWall);
    side.position.set(B.center.x + sx * 34, B.rimY + 26, B.center.z);
    side.rotation.y = -sx * Math.PI / 2;
    g.add(side);
  }
  // porthole window with sky + clouds
  const port = new THREE.Vector3(B.center.x, B.rimY + 14, wallZ + 0.3);
  const skyTex = canvasTexture(256, 256, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#7fd6ff');
    gr.addColorStop(1, '#d6f3ff');
    c.fillStyle = gr;
    c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.95)';
    for (let i = 0; i < 26; i++) {
      c.beginPath();
      c.arc(20 + Math.random() * 216, 150 + Math.random() * 90, 14 + Math.random() * 22, 0, Math.PI * 2);
      c.fill();
    }
  });
  const sky = new THREE.Mesh(new THREE.CircleGeometry(6.2, 48), new THREE.MeshBasicMaterial({ map: skyTex, toneMapped: false }));
  sky.position.copy(port);
  g.add(sky);
  const pr = new THREE.Mesh(new THREE.TorusGeometry(6.5, 0.8, 20, 72), goldMat);
  pr.position.copy(port).add(new THREE.Vector3(0, 0, 0.3));
  g.add(pr);
  const barMat = gold({ roughness: 0.3 });
  const vbar = new THREE.Mesh(new THREE.BoxGeometry(0.35, 12.4, 0.3), barMat);
  vbar.position.copy(port).add(new THREE.Vector3(0, 0, 0.2));
  const hbar = new THREE.Mesh(new THREE.BoxGeometry(12.4, 0.35, 0.3), barMat);
  hbar.position.copy(port).add(new THREE.Vector3(0, 0.6, 0.2));
  g.add(vbar, hbar);
  // control panel (left) with neon tee-shirt screen + buttons
  const panel = new THREE.Mesh(new RoundedBoxGeometry(18, 10, 8, 4, 2.2), new THREE.MeshStandardMaterial({ color: '#f689dc', metalness: 0.4, roughness: 0.25, emissive: '#e060c0', emissiveIntensity: 0.3 }));
  panel.position.set(B.center.x - 21, B.rimY + 5.5, wallZ + 7);
  panel.rotation.y = 0.35;
  g.add(panel);
  const screenTex = canvasTexture(256, 160, (c, w, h) => {
    c.fillStyle = '#20307a';
    c.fillRect(0, 0, w, h);
    c.strokeStyle = '#7ff6ff';
    c.lineWidth = 9;
    c.shadowColor = '#7ff6ff';
    c.shadowBlur = 18;
    c.beginPath();
    c.moveTo(90, 40); c.lineTo(60, 60); c.lineTo(72, 82); c.lineTo(88, 74); c.lineTo(88, 128); c.lineTo(168, 128); c.lineTo(168, 74); c.lineTo(184, 82); c.lineTo(196, 60); c.lineTo(166, 40); c.quadraticCurveTo(128, 64, 90, 40);
    c.stroke();
  });
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(6.6, 4.2), new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
  const screenFrame = new THREE.Mesh(new RoundedBoxGeometry(7.6, 5.2, 0.6, 3, 0.4), goldMat);
  screenFrame.position.set(-3.6, 1.4, 4.0);
  screen.position.set(-3.6, 1.4, 4.35);
  panel.add(screenFrame, screen);
  for (const [x, col] of [[2.6, '#ffd23a'], [5.4, '#3ad8ff']] as const) {
    const btn = new THREE.Mesh(new THREE.SphereGeometry(1.0, 20, 14), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.2 }));
    btn.scale.z = 0.6;
    btn.position.set(x, 0.8, 4.1);
    const bez = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.2, 10, 30), goldMat);
    bez.position.set(x, 0.8, 4.05);
    panel.add(btn, bez);
  }
  // towel shelf (right) with striped folded towels
  const shelf = new THREE.Group();
  shelf.position.set(B.center.x + 22, B.rimY + 7, wallZ + 6);
  shelf.rotation.y = -0.35;
  const board = new THREE.Mesh(new RoundedBoxGeometry(16, 0.8, 7, 2, 0.3), goldMat);
  shelf.add(board);
  for (const x of [-7.2, 7.2]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 7, 12), goldMat);
    post.position.set(x, -3.5, 2.8);
    shelf.add(post);
  }
  const stripeTex = (a: string, b: string) => canvasTexture(128, 128, (c, w, h) => {
    for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? b : a; c.fillRect((i * w) / 8, 0, w / 8 + 1, h); }
  });
  const tPink = new THREE.MeshStandardMaterial({ map: stripeTex('#ff5fae', '#ffffff'), roughness: 0.9, emissive: '#ff7fc0', emissiveIntensity: 0.25 });
  const tCyan = new THREE.MeshStandardMaterial({ map: stripeTex('#3fc7e8', '#ffffff'), roughness: 0.9, emissive: '#60d0f0', emissiveIntensity: 0.25 });
  const t1 = new THREE.Mesh(new RoundedBoxGeometry(13, 2.4, 6, 3, 1.1), tCyan);
  t1.position.set(0, 1.6, 0);
  const t2 = new THREE.Mesh(new RoundedBoxGeometry(12.5, 2.4, 5.8, 3, 1.1), tPink);
  t2.position.set(0.3, 4.0, 0);
  shelf.add(t1, t2);
  g.add(shelf);
  // gold pipes
  for (const x of [-30, 31]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 50, 20), goldMat);
    pipe.position.set(B.center.x + x, B.rimY + 22, wallZ + 3);
    g.add(pipe);
    for (let k = 0; k < 3; k++) {
      const collar = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.3, 10, 24), chromeMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.set(B.center.x + x, B.rimY + 4 + k * 12, wallZ + 3);
      g.add(collar);
    }
  }
}

function buildSpout(domeMat: THREE.Material, rimMat: THREE.Material, size: number): THREE.Group {
  const g = new THREE.Group();
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2), domeMat);
  dome.rotation.x = Math.PI / 2;
  dome.scale.set(1.2, 1.2, 0.7);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.16, 12, 48), rimMat);
  g.add(dome, rim);
  g.scale.setScalar(size);
  return g;
}

function buildPourStream(from: THREE.Vector3, floorY: number, dirX: number) {
  const pts: THREE.Vector3[] = [];
  const h = from.y - floorY;
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    pts.push(new THREE.Vector3(from.x + dirX * 2.2 * t, from.y - h * t * t, from.z));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const tex = canvasTexture(64, 256, (c, w, h2) => {
    const gr = c.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, 'rgba(160,240,255,0.15)');
    gr.addColorStop(0.5, 'rgba(255,255,255,0.95)');
    gr.addColorStop(1, 'rgba(160,240,255,0.15)');
    c.fillStyle = gr;
    c.fillRect(0, 0, w, h2);
    for (let i = 0; i < 40; i++) {
      c.fillStyle = 'rgba(255,255,255,0.8)';
      c.fillRect(Math.random() * w, Math.random() * h2, 2, 10 + Math.random() * 20);
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const mat = new THREE.MeshBasicMaterial({ map: tex, color: '#bff6ff', transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide, toneMapped: false });
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 24, 0.32, 8), mat);
  return { mesh, update: (t: number) => { tex.offset.y = -t * 2.2; } };
}

function buildSock(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'blue_sock';
  const tex = canvasTexture(128, 256, (c, w, h) => {
    c.fillStyle = '#2f6bff';
    c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffffff';
    c.fillRect(0, 22, w, 16);
    c.fillRect(0, 52, w, 16);
    c.fillStyle = 'rgba(255,255,255,0.15)';
    for (let i = 0; i < 400; i++) c.fillRect(Math.random() * w, Math.random() * h, 2, 4);
  });
  const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, emissive: '#2050d0', emissiveIntensity: 0.3 });
  const leg = new THREE.Mesh(new THREE.CapsuleGeometry(0.45, 1.6, 8, 16), mat);
  leg.position.y = 0.9;
  const foot = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 0.9, 8, 16), mat);
  foot.rotation.z = Math.PI / 2;
  foot.position.set(0.55, 0.0, 0);
  const heel = new THREE.Mesh(new THREE.SphereGeometry(0.4, 12, 10), new THREE.MeshStandardMaterial({ color: '#dfe8ff', roughness: 0.9 }));
  heel.position.set(0.05, -0.05, 0);
  g.add(leg, foot, heel);
  return g;
}

function buildShirt(): THREE.Group {
  const g = new THREE.Group();
  g.name = 'pink_star_shirt';
  const tex = canvasTexture(256, 256, (c, w, h) => {
    c.fillStyle = '#ff4fae';
    c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 1500; i++) c.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    // gold star
    c.fillStyle = '#ffc93c';
    c.beginPath();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 18 : 42;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      c.lineTo(150 + Math.cos(a) * r, 120 + Math.sin(a) * r);
    }
    c.closePath();
    c.fill();
  });
  const shape = new THREE.Shape();
  shape.moveTo(-1.2, -1.6); shape.lineTo(1.2, -1.6); shape.lineTo(1.2, 0.7); shape.lineTo(2.1, 0.2); shape.lineTo(2.6, 1.1);
  shape.lineTo(1.4, 1.75); shape.quadraticCurveTo(0, 1.2, -1.4, 1.75); shape.lineTo(-2.6, 1.1); shape.lineTo(-2.1, 0.2); shape.lineTo(-1.2, 0.7); shape.lineTo(-1.2, -1.6);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.15, bevelSegments: 3, curveSegments: 8 });
  // planar UVs
  const p = geo.getAttribute('position');
  const uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) { uv[i * 2] = (p.getX(i) + 2.6) / 5.2; uv[i * 2 + 1] = (p.getY(i) + 1.8) / 3.6; }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85, emissive: '#e03a98', emissiveIntensity: 0.3 }));
  g.add(mesh);
  return g;
}

/** glossy hot-pink flowing water sheet (scrolling streak texture) for tube floors */
function pinkFlowMaterial() {
  const tex = canvasTexture(256, 512, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, '#c81f9c'); g.addColorStop(0.5, '#ff4fc0'); g.addColorStop(1, '#c81f9c');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const x = Math.random() * w, y = Math.random() * h, l = 20 + Math.random() * 90;
      c.strokeStyle = Math.random() > 0.35 ? 'rgba(255,190,240,0.55)' : 'rgba(120,230,255,0.45)';
      c.lineWidth = 1 + Math.random() * 3;
      c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 8, y + l * 0.3, x - 8, y + l * 0.6, x + 3, y + l); c.stroke();
    }
  });
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  const material = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: '#ff3fb8', emissiveIntensity: 0.35, metalness: 0.2, roughness: 0.12, envMapIntensity: 1.4, side: THREE.DoubleSide });
  return { material, update: (t: number) => { tex.offset.y = -t * 0.9; } };
}
