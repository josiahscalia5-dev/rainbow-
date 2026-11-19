/**
 * Builds the whole washer world in absolute coordinates around the master course.
 * Drum A (01–02) → chute → whirlpool basin room (03) → gold ring pipe (04) → perforated current tube
 * (05) → arch hall (06) → washer tube + deep plunge (07) → Final Spin Chamber (08–11).
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Course, WORLD, funnelY } from './course';
import { perforatedMetal, gold, goldRibbed, chrome, glass, painted, canvasTexture } from './materials';
import { buildTubeGeometry, buildRings, buildNozzles, courseTubePath, straightTubePath, tubeCenterAt } from './tube';
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
  const sChute1 = course.stage('03').s0 + 3;
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
    const r = B.drainRadius * 0.92 + (B.rimRadius + 0.4 - B.drainRadius * 0.92) * (i / 40);
    prof.push(new THREE.Vector2(r, funnelY(r) - 0.45));
  }
  const funnelGeo = new THREE.LatheGeometry(prof, 96);
  funnelGeo.translate(B.center.x, 0, B.center.z);
  zones.basin.add(new THREE.Mesh(funnelGeo, perforatedMetal({ color: '#e04fd0', slot: 0, repeatU: 60, repeatV: 22, holeSize: 0.3, side: THREE.DoubleSide, streaks: 0 })));
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
  const r04 = (s: number) => THREE.MathUtils.lerp(WORLD.basin.drainRadius + 0.2, tubeR(s), sm(s04 - 1, s04 + 9, s));
  const goldPath = courseTubePath(course, r04, (s) => THREE.MathUtils.lerp(WORLD.basin.drainRadius * 0.75, 0.9, sm(s04, s04 + 9, s)));
  const goldPipe = new THREE.Mesh(buildTubeGeometry(goldPath, s04 - 0.6, s05, { radial: 56, step: 0.4 }), goldRibbed(1.25));
  zones.tubes.add(goldPipe);
  zones.tubes.add(buildRings(goldPath, s04 - 0.4, s05 - 1, 1.6, goldMat, { tube: 0.05, inset: 0.02 }));
  // big mouth rings at the drain
  for (let i = 0; i < 4; i++) {
    const s = s04 - 0.5 + i * 0.35;
    zones.tubes.add(buildRings(goldPath, s, s + 0.01, 1, goldMat, { tube: 0.07, extra: 0.4 + i * 0.22 }));
  }

  // =====================================================================================
  // 05–07 perforated tubes (incl. the 06 arch hall and the full 07 plunge)
  // =====================================================================================
  const s08 = course.stage('08').s0;
  const pinkFlow = pinkFlowMaterial();
  const perfTubeMat = perforatedMetal({ color: '#c73fd9', emissive: '#8a1fb0', emissiveIntensity: 0.3, slot: 1, repeatU: 70, repeatV: 1.05, holeSize: 0.46, streaks: 0.5 });
  // straight-axis tunnel (05 → 07 incl. arch + plunge); the stream winds inside it
  const perfPath = straightTubePath(course, s05, s08, { window: 30, taper: 14, baseRadius: tubeR });
  const chunk = 40;
  for (let a = s05; a < s08; a += chunk) {
    const b = Math.min(s08 + 0.0, a + chunk + 0.6);
    zones.tubes.add(new THREE.Mesh(buildTubeGeometry(perfPath, a, b, { radial: 72, step: 0.6 }), perfTubeMat));
    // glossy magenta flow sheet lining the tube floor under the stream (refs 05/07 pink banks)
    zones.tubes.add(new THREE.Mesh(buildTubeGeometry(perfPath, a, b, { radial: 24, step: 0.8, arc: 1.9, inset: -0.12, vScale: 6 }), pinkFlow.material));
  }
  // gold junction ring 04→05
  zones.tubes.add(buildRings(perfPath, s05 + 0.3, s05 + 0.31, 1, goldMat, { tube: 0.08, inset: 0.2 }));
  // thick double gold ribs
  zones.tubes.add(buildRings(perfPath, s05 + 3, s08 - 1, 6, goldMat, { tube: 0.055, double: true }));
  // wall lids / nozzles
  const lidMat = gold({ color: '#f0a040', roughness: 0.25, emissive: 0.35 });
  zones.tubes.add(buildNozzles(perfPath, s05 + 6, s08 - 6, 8.5, lidMat, goldMat, { angleDeg: 34, size: 1.9 }));
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
  const doorCenterC = new THREE.Vector3(C.center.x, WORLD.platform.topY + 4.2, C.zDoor);
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
  const roomC = buildLaundryRoom({ floorDrop: 11.8, palette: 'soft' });
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
  towel.mesh.position.set(P.center.x, P.topY, P.center.z - 0.4);
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
