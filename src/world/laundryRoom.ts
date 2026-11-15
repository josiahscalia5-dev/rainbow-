/**
 * The bright laundry room seen through a washer door (01, 09–11). Human scale: 1 unit ≈ 5 cm, so the
 * room is ~48 units tall. Local origin = washer door centre; the room extends toward local +Z,
 * floor at y = -floorDrop.
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { canvasTexture, painted } from './materials';

export interface LaundryRoomOptions {
  floorDrop: number;
  /** 'warm' = ref 01 (orange towels, white basket), 'soft' = refs 09–11 (lavender towels, wicker) */
  palette: 'warm' | 'soft';
  /** small folding table mid-room (room C: the girl folds laundry here in 09/10) */
  foldingTable?: boolean;
}

export interface LaundryRoom {
  group: THREE.Group;
  /** a good place for the girl to stand/walk (local coords) */
  spots: Record<'nearDoor' | 'counter' | 'exitRight' | 'exitLeft' | 'table', THREE.Vector3>;
}

export function buildLaundryRoom(o: LaundryRoomOptions): LaundryRoom {
  const g = new THREE.Group();
  g.name = 'laundry_room';
  const F = -o.floorDrop;
  const D = 92; // depth of the room
  const Wd = 120; // width
  const Ht = 50;

  const wallTex = canvasTexture(256, 256, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#fbf3ff');
    gr.addColorStop(1, '#efe0f6');
    c.fillStyle = gr;
    c.fillRect(0, 0, w, h);
  });
  const wallMat = new THREE.MeshStandardMaterial({ map: wallTex, roughness: 0.9, emissive: '#f4e6fb', emissiveIntensity: 0.25 });
  const floorTex = canvasTexture(512, 512, (c, w, h) => {
    c.fillStyle = '#e9d6ea';
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 8; i++) {
      c.fillStyle = i % 2 ? '#e2cde4' : '#eedcef';
      c.fillRect(0, (i * h) / 8, w, h / 8 - 3);
    }
  });
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
  floorTex.repeat.set(3, 3);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(Wd, D), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.35, metalness: 0.05, emissive: '#d9c4dc', emissiveIntensity: 0.35 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(0, F, D / 2);
  g.add(floor);
  const back = new THREE.Mesh(new THREE.PlaneGeometry(Wd, Ht), wallMat);
  back.position.set(0, F + Ht / 2, D);
  back.rotation.y = Math.PI;
  g.add(back);
  for (const sx of [-1, 1]) {
    const side = new THREE.Mesh(new THREE.PlaneGeometry(D, Ht), wallMat);
    side.position.set((sx * Wd) / 2, F + Ht / 2, D / 2);
    side.rotation.y = -sx * Math.PI / 2;
    g.add(side);
  }
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(Wd, D), painted('#fff7ff', 0.6));
  ceil.rotation.x = Math.PI / 2;
  ceil.position.set(0, F + Ht, D / 2);
  g.add(ceil);

  // --- window on the back wall (bright garden light), slightly right of centre ---
  const winX = 16, winY = F + 30, winW = 30, winH = 24;
  const skyTex = canvasTexture(256, 256, (c, w, h) => {
    const gr = c.createLinearGradient(0, 0, 0, h);
    gr.addColorStop(0, '#fffef2');
    gr.addColorStop(0.55, '#e9fbe2');
    gr.addColorStop(1, '#a9dc8f');
    c.fillStyle = gr;
    c.fillRect(0, 0, w, h);
    c.fillStyle = 'rgba(120,190,110,0.55)';
    for (let i = 0; i < 40; i++) {
      c.beginPath();
      c.arc(Math.random() * w, h * 0.65 + Math.random() * h * 0.35, 8 + Math.random() * 22, 0, Math.PI * 2);
      c.fill();
    }
  });
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), new THREE.MeshBasicMaterial({ map: skyTex, toneMapped: false, fog: false }));
  sky.position.set(winX, winY, D - 0.2);
  sky.rotation.y = Math.PI;
  g.add(sky);
  const frameMat = painted('#ffffff', 0.6, 0.5);
  const bar = (w: number, h: number, x: number, y: number) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.2), frameMat);
    m.position.set(x, y, D - 0.6);
    g.add(m);
  };
  bar(winW + 2, 1.4, winX, winY + winH / 2);
  bar(winW + 2, 1.4, winX, winY - winH / 2);
  bar(1.4, winH, winX - winW / 2, winY);
  bar(1.4, winH, winX + winW / 2, winY);
  bar(1.0, winH, winX, winY);
  bar(winW, 1.0, winX, winY + 2);
  // light shafts: soft additive planes
  const shaftMat = new THREE.MeshBasicMaterial({ color: '#fff4d8', transparent: true, opacity: 0.12, blending: THREE.AdditiveBlending, depthWrite: false, fog: false });
  const shaft = new THREE.Mesh(new THREE.PlaneGeometry(26, 60), shaftMat);
  shaft.position.set(winX - 6, F + 20, D - 24);
  shaft.rotation.set(-0.5, Math.PI, 0.25);
  g.add(shaft);

  // --- counter + cabinets under the window ---
  const cab = new THREE.Mesh(new RoundedBoxGeometry(56, 18, 12, 3, 0.8), painted('#fbf6ff', 0.45, 0.6));
  cab.position.set(winX - 2, F + 9, D - 7);
  g.add(cab);
  const top = new THREE.Mesh(new RoundedBoxGeometry(58, 1.4, 13, 2, 0.5), painted('#e8dcef', 0.45, 0.4));
  top.position.set(winX - 2, F + 18.6, D - 7);
  g.add(top);
  for (let i = 0; i < 3; i++) {
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.5, 10, 8), painted('#c9a64a', 0.3, 0.3));
    knob.position.set(winX - 20 + i * 18, F + 14, D - 13.2);
    g.add(knob);
  }
  // plant on the sill / counter
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 1.7, 3.6, 18), painted(o.palette === 'warm' ? '#ffffff' : '#f6efe6', 0.4));
  pot.position.set(winX + 6, F + 21.2, D - 8);
  g.add(pot);
  const leafMat = painted('#5fb35a', 0.25, 0.6);
  for (let i = 0; i < 9; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(1.5, 10, 8), leafMat);
    leaf.scale.set(0.6, 1.6, 0.35);
    const a = (i / 9) * Math.PI * 2;
    leaf.position.set(winX + 6 + Math.cos(a) * 1.4, F + 25 + Math.sin(i * 2.1) * 1.2, D - 8 + Math.sin(a) * 1.4);
    leaf.rotation.set(Math.sin(a) * 0.6, a, Math.cos(a) * 0.6);
    g.add(leaf);
  }

  // --- shelves with detergent bottles / jars (left) ---
  const shelfMat = painted('#ffffff', 0.5, 0.5);
  for (let k = 0; k < 2; k++) {
    const shelf = new THREE.Mesh(new RoundedBoxGeometry(30, 1.2, 8, 2, 0.4), shelfMat);
    shelf.position.set(-28, F + 26 + k * 11, D - 5);
    g.add(shelf);
    const colors = o.palette === 'warm' ? ['#ffb3d9', '#9fd8ff', '#ffffff', '#c9b6ff', '#7fd0ff'] : ['#ffffff', '#f2eadf', '#ffffff', '#e8e0f5', '#ffffff'];
    for (let i = 0; i < 5; i++) {
      const h = 5 + ((i * 7) % 4);
      const bottle = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.6, h, 16), painted(colors[i], 0.45, 0.35));
      bottle.position.set(-38 + i * 5, F + 26.6 + k * 11 + h / 2, D - 5);
      g.add(bottle);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 1.2, 12), painted(i % 2 ? '#ff6fb5' : '#4fb8ff', 0.4));
      cap.position.set(-38 + i * 5, F + 26.6 + k * 11 + h + 0.6, D - 5);
      g.add(cap);
    }
  }

  // --- laundry basket with folded towels ---
  const basketMat = o.palette === 'warm'
    ? painted('#ffffff', 0.5, 0.4)
    : new THREE.MeshStandardMaterial({ color: '#d8b07a', roughness: 0.8, emissive: '#b88a52', emissiveIntensity: 0.3 });
  const basket = new THREE.Mesh(new RoundedBoxGeometry(22, 12, 15, 3, 1.5), basketMat);
  basket.position.set(-22, F + 6, 34);
  g.add(basket);
  const towelColors = o.palette === 'warm' ? ['#ff9c5a', '#ffb07a', '#ff8f4a'] : ['#c7a6f2', '#d9c2f7', '#ffffff'];
  towelColors.forEach((col, i) => {
    const t = new THREE.Mesh(new RoundedBoxGeometry(18, 2.4, 11, 3, 1.0), painted(col, 0.45, 0.9));
    t.position.set(-22, F + 12.6 + i * 2.3, 34);
    t.rotation.y = (i - 1) * 0.06;
    g.add(t);
  });

  if (o.foldingTable) {
    const tbl = new THREE.Mesh(new RoundedBoxGeometry(18, 1.2, 9, 2, 0.4), painted('#fbf6ff', 0.3, 0.5));
    tbl.position.set(-3, F + 13.2, 36.5);
    g.add(tbl);
    for (const [lx, lz] of [[-11, 33], [5, 33], [-11, 40], [5, 40]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 13, 8), painted('#e6dcef', 0.25));
      leg.position.set(lx, F + 6.5, lz);
      g.add(leg);
    }
    const pile = new THREE.Mesh(new RoundedBoxGeometry(8, 2.2, 6, 3, 0.9), painted('#d9c2f7', 0.3, 0.9));
    pile.position.set(-6, F + 14.9, 36.5);
    g.add(pile);
  }
  return {
    group: g,
    spots: {
      nearDoor: new THREE.Vector3(2, F, 9),
      counter: new THREE.Vector3(winX - 4, F, D - 22),
      exitRight: new THREE.Vector3(34, F, 58),
      exitLeft: new THREE.Vector3(-26, F, 62),
      table: new THREE.Vector3(-3, F, 30),
    },
  };
}
