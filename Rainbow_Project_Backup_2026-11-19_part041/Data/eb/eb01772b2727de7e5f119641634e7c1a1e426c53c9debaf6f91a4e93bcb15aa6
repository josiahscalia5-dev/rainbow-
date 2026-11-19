/**
 * The plush purple towel. One mesh with morph targets:
 *   base     = folded loaf (08, 09, 11 — Benny hidden inside in 11)
 *   morph 0  = tent draped over the platform with an arched opening facing the incoming stream (10)
 *   morph 1  = loose bundle (01/02 — wrapped around Benny in the drum)
 * Local frame: centre of the platform top, the stream arrives from +Z, the washer door is at -Z.
 */
import * as THREE from 'three';
import { canvasTexture } from './materials';

const NU = 48, NV = 36;

function terryTexture(): THREE.CanvasTexture {
  return canvasTexture(512, 512, (c, w, h) => {
    c.fillStyle = '#7a2fe6';
    c.fillRect(0, 0, w, h);
    // terry loops
    for (let i = 0; i < 9000; i++) {
      const x = Math.random() * w, y = Math.random() * h;
      const l = Math.random();
      c.fillStyle = l > 0.6 ? 'rgba(170,110,255,0.55)' : l > 0.3 ? 'rgba(90,20,190,0.5)' : 'rgba(205,160,255,0.35)';
      c.beginPath();
      c.arc(x, y, 1.2 + Math.random() * 2.2, 0, Math.PI * 2);
      c.fill();
    }
    // lavender woven borders along both u-edges
    for (const y0 of [0, h - 46]) {
      c.fillStyle = '#c9a4ff';
      c.fillRect(0, y0, w, 46);
      for (let i = 0; i < 1600; i++) {
        c.fillStyle = Math.random() > 0.5 ? 'rgba(235,215,255,0.8)' : 'rgba(160,110,240,0.6)';
        c.fillRect(Math.random() * w, y0 + Math.random() * 46, 2.5, 2.5);
      }
    }
  });
}

function bumpTexture(): THREE.CanvasTexture {
  return canvasTexture(256, 256, (c, w, h) => {
    c.fillStyle = '#808080';
    c.fillRect(0, 0, w, h);
    for (let i = 0; i < 6000; i++) {
      const v = 90 + Math.random() * 120;
      c.fillStyle = `rgb(${v},${v},${v})`;
      c.beginPath();
      c.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 1.6, 0, Math.PI * 2);
      c.fill();
    }
  }, false);
}

/** stadium-ish closed loop for the folded loaf cross-section (x across, y up) */
function loafSection(t: number, W: number, H: number): [number, number] {
  // t in [0,1): parametrize a superellipse, opening slightly at the bottom
  const a = Math.PI * 2 * (0.03 + 0.94 * t) - Math.PI / 2;
  const c = Math.cos(a), s = Math.sin(a);
  const p = 0.45;
  const x = Math.sign(c) * Math.pow(Math.abs(c), p) * W * 0.5;
  const y = Math.sign(s) * Math.pow(Math.abs(s), 0.8) * H * 0.5 + H * 0.5;
  return [x, Math.max(0.05, y)];
}

export interface TowelMesh {
  mesh: THREE.Mesh;
  /** 0 folded, 1 tent */
  setTent(v: number): void;
  setBundle(v: number): void;
}

export function buildTowel(): TowelMesh {
  const W = 7.6, H = 2.7, DEPTH = 3.6; // folded loaf
  const tentLen = 7.5, tentW = 11.5, archR = 2.1;
  const base: number[] = [], tent: number[] = [], bundle: number[] = [], uvs: number[] = [];
  for (let j = 0; j <= NV; j++) {
    const v = j / NV; // along depth (z)
    for (let i = 0; i <= NU; i++) {
      const u = i / NU; // around the section / across the sheet
      // folded loaf
      const [lx, ly] = loafSection(u, W, H);
      const bulge = 1 + 0.06 * Math.sin(Math.PI * v);
      base.push(lx * bulge, ly * (0.94 + 0.08 * Math.sin(Math.PI * v)), (v - 0.5) * DEPTH * (1 + 0.08 * Math.sin(Math.PI * u * 2)));
      // tent: sheet across x, draped over an arch whose axis is along z
      const x = (u - 0.5) * tentW;
      const ax = Math.abs(x);
      let y: number;
      if (ax < archR) y = Math.sqrt(archR * archR - ax * ax) * 1.05 + 0.25;
      else y = Math.max(0.1, 0.25 + 0.9 * Math.exp(-(ax - archR) * 1.4));
      const front = 1 - v; // v=0 front (toward stream, +z)
      const sag = 0.25 * Math.sin(Math.PI * v) * (ax < archR ? 1 : 0.2);
      const curl = front < 0.08 ? (0.08 - front) * 6 : 0; // rolled front lip
      tent.push(x * (1 + 0.04 * Math.sin(v * 9 + u * 7)), y - sag + curl * 0.6, (0.5 - v) * tentLen + curl * 0.4);
      // bundle: loose ball-ish wrap
      const th = u * Math.PI * 2, ph = v * Math.PI;
      const rb = 1.55 * (1 + 0.12 * Math.sin(th * 3 + ph * 4));
      bundle.push(Math.cos(th) * Math.sin(ph) * rb * 1.35, Math.cos(ph) * rb * 0.9 + 1.1, Math.sin(th) * Math.sin(ph) * rb * 1.1);
      uvs.push(v * 2.0, u);
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < NV; j++) for (let i = 0; i < NU; i++) {
    const a = j * (NU + 1) + i, b = a + NU + 1;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(base, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const mk = (arr: number[]) => {
    const gg = new THREE.BufferGeometry();
    gg.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    gg.setIndex(idx);
    gg.computeVertexNormals();
    return gg;
  };
  const gt = mk(tent), gb = mk(bundle);
  g.morphAttributes.position = [
    new THREE.Float32BufferAttribute(tent.map((x, k) => x - base[k]), 3),
    new THREE.Float32BufferAttribute(bundle.map((x, k) => x - base[k]), 3),
  ];
  g.morphAttributes.normal = [
    new THREE.Float32BufferAttribute(Array.from(gt.getAttribute('normal').array as Float32Array).map((x, k) => x - (g.getAttribute('normal').array as Float32Array)[k]), 3),
    new THREE.Float32BufferAttribute(Array.from(gb.getAttribute('normal').array as Float32Array).map((x, k) => x - (g.getAttribute('normal').array as Float32Array)[k]), 3),
  ];
  g.morphTargetsRelative = true;
  const map = terryTexture();
  map.wrapS = map.wrapT = THREE.RepeatWrapping;
  const bump = bumpTexture();
  bump.wrapS = bump.wrapT = THREE.RepeatWrapping;
  bump.repeat.set(3, 3);
  const mat = new THREE.MeshStandardMaterial({
    map,
    bumpMap: bump,
    bumpScale: 2.5,
    roughness: 0.95,
    metalness: 0,
    color: '#ffffff',
    emissive: '#4a14a0',
    emissiveIntensity: 0.35,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(g, mat);
  mesh.name = 'purple_towel';
  mesh.morphTargetInfluences = [0, 0];
  return {
    mesh,
    setTent: (v) => { mesh.morphTargetInfluences![0] = v; },
    setBundle: (v) => { mesh.morphTargetInfluences![1] = v; },
  };
}
