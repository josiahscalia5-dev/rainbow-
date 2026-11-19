/**
 * Foam banks: instanced puffy white/lavender soap-foam clusters.
 *  - a dense fringe of small puffs along both ribbon edges + bigger cloud clusters (refs 03–10)
 *  - foam rings on the whirlpool rim and along its spiral bands (rotating with the swirl)
 * Puffs are grouped into ~40-unit chunks (separate InstancedMeshes) so only chunks near Benny
 * are drawn; quality 'low' halves density and uses 20-tri puffs.
 */
import * as THREE from 'three';
import { type Course, WORLD, funnelY } from '../world/course';
import { EDGE_LIFT } from './waterRibbon';
import { SPIRAL_C, FUNNEL_LIFT } from './whirlpool';

interface Puff { p: THREE.Vector3; r: number; c: number }

function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FOAM_COLORS = ['#ffffff', '#f6f0ff', '#efe4ff', '#fff2fb', '#e9f6ff'].map((c) => new THREE.Color(c));

function makeMaterial() {
  const m = new THREE.MeshStandardMaterial({
    color: '#ffffff',
    roughness: 0.32,
    metalness: 0.0,
    emissive: new THREE.Color('#d8c8ff'),
    emissiveIntensity: 0.42,
    envMapIntensity: 1.1,
  });
  // subtle soap-film rim tint
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
       float rimF = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0), 2.5);
       totalEmissiveRadiance += vec3(0.55, 0.35, 0.75) * rimF * 0.35;`,
    );
  };
  return m;
}

export interface FoamSystem {
  group: THREE.Group;
  whirlGroup: THREE.Group;
  update(time: number, focusS: number): void;
  instanceCount: number;
}

export function createFoam(course: Course, opts: { s0: number; s1: number; quality: 'high' | 'low' }): FoamSystem {
  const { s0, s1, quality } = opts;
  const rand = rng(1337);
  const density = quality === 'high' ? 1 : 0.5;
  const geo = new THREE.IcosahedronGeometry(1, quality === 'high' ? 1 : 0);
  const mat = makeMaterial();
  const group = new THREE.Group();
  group.name = 'foam_banks';
  const st03 = course.stage('03'), st04 = course.stage('04');
  const chunkLen = 40;
  const chunks: { mesh: THREE.InstancedMesh; sa: number; sb: number }[] = [];
  let total = 0;
  const tmpM = new THREE.Matrix4();
  const tmpQ = new THREE.Quaternion();
  const tmpS = new THREE.Vector3();

  const build = (list: Puff[], parent: THREE.Object3D, sa: number, sb: number) => {
    if (!list.length) return;
    const mesh = new THREE.InstancedMesh(geo, mat, list.length);
    list.forEach((pf, i) => {
      tmpQ.setFromEuler(new THREE.Euler(rand() * 6, rand() * 6, rand() * 6));
      tmpS.set(pf.r, pf.r * (0.75 + rand() * 0.25), pf.r);
      tmpM.compose(pf.p, tmpQ, tmpS);
      mesh.setMatrixAt(i, tmpM);
      mesh.setColorAt(i, FOAM_COLORS[pf.c % FOAM_COLORS.length]);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
    parent.add(mesh);
    chunks.push({ mesh, sa, sb });
    total += list.length;
  };

  // ---- ribbon edges ----
  for (let sa = s0; sa < s1; sa += chunkLen) {
    const sb = Math.min(s1, sa + chunkLen);
    const list: Puff[] = [];
    // skip most of 03 (the whirlpool has its own foam), keep the chute→rim hand-over
    for (let s = sa; s < sb; s += 0.55 / density) {
      if (s > st03.s0 + 4 && s < st04.s0 - 6) continue;
      const f = course.sample(s);
      const hw = course.widthAt(s) / 2;
      const tube = course.prop(s, 'tube');
      for (const side of [-1, 1]) {
        if (rand() < 0.15) continue;
        const lat = side * (hw - 0.12 + rand() * 0.55);
        const r = 0.14 + rand() * 0.22;
        const p = f.pos.clone().addScaledVector(f.right, lat).addScaledVector(f.up, EDGE_LIFT + r * 0.25 + rand() * 0.1);
        list.push({ p, r, c: (rand() * 5) | 0 });
      }
      // cloud clusters
      if (rand() < 0.07 * density) {
        const side = rand() < 0.5 ? -1 : 1;
        const maxOut = tube > 0 ? Math.max(0.6, tube * 0.85 - hw) : 2.4;
        const cl = side * (hw + 0.4 + rand() * Math.min(1.4, maxOut));
        const n = 7 + ((rand() * 12) | 0);
        for (let k = 0; k < n; k++) {
          const ds = (rand() - 0.5) * 3.2;
          const f2 = course.sample(Math.min(s1, Math.max(s0, s + ds)));
          const lat = cl + (rand() - 0.5) * 1.8;
          const r = 0.25 + rand() * 0.55;
          const h = EDGE_LIFT * 0.6 + rand() * 0.9 * (1 - Math.abs(ds) / 2);
          const p = f2.pos.clone().addScaledVector(f2.right, lat).addScaledVector(f2.up, h);
          list.push({ p, r, c: (rand() * 5) | 0 });
        }
      }
    }
    build(list, group, sa - 6, sb + 6);
  }

  // ---- whirlpool: rim ring + spiral band foam (rotates with the swirl) ----
  const whirlGroup = new THREE.Group();
  whirlGroup.name = 'foam_whirlpool';
  const b = WORLD.basin;
  whirlGroup.position.set(b.center.x, 0, b.center.z);
  const wl: Puff[] = [];
  const nRim = Math.round(170 * density);
  for (let i = 0; i < nRim; i++) {
    const th = rand() * Math.PI * 2;
    const r = b.rimRadius - 0.6 + (rand() - 0.3) * 1.2;
    const sz = 0.3 + rand() * 0.6;
    wl.push({ p: new THREE.Vector3(r * Math.sin(th), funnelY(r) + FUNNEL_LIFT + sz * 0.3 + rand() * 0.4, r * Math.cos(th)), r: sz, c: (rand() * 5) | 0 });
  }
  // along 3 spiral flow lines (constant th - C ln r) to echo the white foam bands
  const nBand = Math.round(150 * density);
  for (let i = 0; i < nBand; i++) {
    const band = ((i % 3) * Math.PI * 2) / 3 + 0.4;
    const r = 3.0 + rand() * (b.rimRadius - 3.6);
    const th = band + SPIRAL_C * Math.log(r) + (rand() - 0.5) * 0.12;
    const sz = 0.12 + rand() * 0.25;
    wl.push({ p: new THREE.Vector3(r * Math.sin(th), funnelY(r) + FUNNEL_LIFT + sz * 0.3, r * Math.cos(th)), r: sz, c: (rand() * 5) | 0 });
  }
  const whirlStart = chunks.length;
  build(wl, whirlGroup, st03.s0 - 30, st04.s0 + 25);
  group.add(whirlGroup);

  return {
    group,
    whirlGroup,
    instanceCount: total,
    update(time, focusS) {
      for (let i = 0; i < chunks.length; i++) {
        const c = chunks[i];
        c.mesh.visible = c.sb > focusS - 25 && c.sa < focusS + 140;
      }
      // rotate whirlpool foam about the basin axis with the swirl (θ decreasing = course direction)
      whirlGroup.rotation.y = -time * 0.45 * ((Math.PI * 2) / 3);
      void whirlStart;
    },
  };
}
