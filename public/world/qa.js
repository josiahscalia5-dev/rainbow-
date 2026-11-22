// Rainbow screen kit - QA views for the automated preview check (round 45), shared by the screen page and the world page.
//   window.qaRepeatView(k, area) : the approved picture's camera moved k ring spacings further down the drum (same height, same direction,
//                                  same framing), Benny / coins / splash / effects hidden -> the frame is scored against the approved picture:
//                                  "does the scenery further down the level still look like the approved screen?" (k = 0 = the picture itself)
//   window.qaIdPass(true|false)  : every surface drawn in a flat colour per family (wall, ring, water, foam, trays, other) -> which pixel of a
//                                  swimming frame is which surface, so each surface can be compared with the same surface in the picture
//   window.qaRestore()           : back to the game (visibility + materials); the next step() / qaGoto() puts the chase camera back
export const ID_COL = { wall: [200, 0, 0], ring: [0, 0, 220], water: [0, 190, 190], foam: [230, 230, 0], trays: [220, 0, 220], other: [110, 110, 110] };
export const FAM_GROUP = (f) => ({ tunnel: 'wall', tunnelS: 'wall', wall: 'wall', pink: 'wall', ring: 'ring', arch: 'ring', gold: 'ring', water: 'water', pool: 'water', flume: 'water', funnel: 'water',
  foam: 'foam', foam3d: 'foam', copper: 'trays' }[f] ?? 'other');
export function installQA({ THREE, scene, world, camera, renderer, repeatPose }) {
  const saved = new Map(); let idOn = false;
  const gameDrawn = (o) => { let p = o; while (p) { if (p === world) return false; p = p.parent; } return true; };   // Benny, coins, splash, swim effects live outside the world group
  const hide = () => scene.traverse((o) => { if ((o.isMesh || o.isSprite || o.isPoints) && gameDrawn(o)) { if (!saved.has(o)) saved.set(o, { v: o.visible, m: o.material }); o.visible = false; } });
  window.qaRestore = () => { for (const [o, s] of saved) { o.visible = s.v; o.material = s.m; } saved.clear(); idOn = false; scene.background = window.__qaBg ?? scene.background; return true; };
  window.qaRepeatView = (k, area) => { const p = repeatPose(k, area); if (!p) return null; hide(); camera.position.copy(p.pos); camera.quaternion.copy(p.quat); camera.updateMatrixWorld(); renderer.render(scene, camera);
    return { k, pos: p.pos.toArray().map((x) => +x.toFixed(3)), note: p.note ?? '' }; };
  window.qaIdPass = (on) => {
    if (!on) return window.qaRestore();
    if (idOn) return true; idOn = true; window.__qaBg = scene.background; scene.background = new THREE.Color(0, 0, 0); const mats = {};
    scene.traverse((o) => { if (!(o.isMesh || o.isSprite || o.isPoints)) return; if (!saved.has(o)) saved.set(o, { v: o.visible, m: o.material });
      if (gameDrawn(o) || o.userData.fam === 'bubble3d' || o.name === 'bubbles') { o.visible = false; return; }
      const g = FAM_GROUP(o.userData.fam), c = ID_COL[g]; o.material = (mats[g] ??= new THREE.MeshBasicMaterial({ color: new THREE.Color(c[0] / 255, c[1] / 255, c[2] / 255), side: THREE.DoubleSide, toneMapped: false })); });
    renderer.render(scene, camera); return true; };
}
