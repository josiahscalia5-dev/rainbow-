/**
 * Screen 05 FULL REFERENCE MATCH — Benny (`?benny05=1`, or the master `?match05=1`; qa/pilot05/full_reference_match/benny/).
 *
 * Applied to Benny HIMSELF (every screen sees the same corrected character while the switch is on), on top of the
 * unchanged canonical assets/models/benny.glb, rig and clips. Off (default): nothing in this file runs, every material,
 * geometry and shader program is the previous one.
 *
 *  1. Beanie geometry (visual only, hat-local): cuff band thinner and the whole beanie a little lower on the head, pom-pom
 *     lower and slightly toward his right, star re-seated — measured against the approved picture at the locked 05 frame.
 *  2. Swim-clip body roll damped (the clip's ±0.05 rad side wobble tipped the beanie ~13 px sideways at the pom; the
 *     approved Benny rides upright). Pitch bob, paddling, feet, steering lean and every gameplay transform are unchanged.
 *  3. Albedo maps baked from the APPROVED pixels into each part's own UV space (tools: benny/work/bake.py): the beanie's
 *     knit stitches / stripes / ribbed cuff, the pom-pom yarn, the cotton-candy fur colour and its shading. The maps are
 *     solved through the live lighting and post chain (two calibration renders: display → linear radiance = albedo·E + S),
 *     so the screen shows the approved colours at the locked frame and they stay glued to the 3D surfaces while he moves.
 *     Texels the 05 camera never sees (his front, the cuff's far side) are filled from the seen knit / fur.
 *  4. Finer, denser, more clumped shell fur (soft tufts instead of coarse straight spikes).
 */
import * as THREE from 'three';
import { on05 } from '../../vfx/waterRibbon';
import type { FurHandle, FurParams } from './fur';

export const BENNY05: boolean = on05('benny05');

/** shell-fur overrides (merged over the GLB's userData.fur) */
export const FUR05: Record<string, Partial<FurParams>> = {
  fur_body: { density: 96, shells: 24, length: 0.11, gravity: 0.16 },
  fur_armL: { density: 120, shells: 12, length: 0.05 },
  fur_armR: { density: 120, shells: 12, length: 0.05 },
  fur_pom: { density: 64, shells: 18, length: 0.12, gravity: 0.03 },
};
/** strand clumping toward tuft centres (fur.ts default 0.42) */
const CLUMP05: Record<string, number> = { fur_body: 0.55, fur_pom: 0.6 };

/** beanie geometry (hat-local units; GLB build: brimBottom 0.22, cuffH 0.265, pom 0.12 above the crown apex) */
export const HAT05 = {
  /** whole beanie lowered along the body's up axis */
  drop: 0.028,
  /** whole beanie shifted toward his right (−X): the approved beanie sits ≈5 px further image-right on the body */
  shiftX: -0.028,
  /** extra backward tilt of the beanie (rad, about X; − = top toward his back) */
  tilt: 0,
  /** crown dome shoulder taper (GLB build 0.18: r ∝ (1 − taper·t)); the approved dome is fuller near the top */
  crownTaper: 0.0,
  /** folded cuff band height */
  cuffH: 0.226,
  /** pom-pom core: extra offset (x = toward his LEFT, + y up) and scale */
  pomDX: -0.057,
  pomDY: -0.016,
  /** toward his back (−Z ≈ toward the rear chase camera): the approved pom-pom overhangs the crown's back slope */
  pomDZ: -0.16,
  pomScale: 0.97,
  /** star: extra offset in hat-local units after following the cuff top */
  starDY: 0.069,
  starDX: 0.0,
  /** star face scale (its own x, y) */
  starScale: [0.96, 0.89] as [number, number],
  /** cuff outer radius factor (approved cuff ≈ 297 px wide vs 291) */
  brimW: 1.02,
  /** crown dome height (GLB 0.53) */
  crownH: 0.58,
};

/** swim clip: factor on the body's side roll (z) */
export const ROLL05 = 0.3;

const D = { skin: 0.7, brimBottom: 0.22, cuffH: 0.265, brimR: 0.8, crownH: 0.53 };

function lathe(points: [number, number][], segs: number, v0: number, v1: number): THREE.LatheGeometry {
  const g = new THREE.LatheGeometry(points.map(([r, y]) => new THREE.Vector2(r, y)), segs);
  const p = g.attributes.position as THREE.BufferAttribute;
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) uv.setXY(i, uv.getX(i), (p.getY(i) - v0) / (v1 - v0));
  return g;
}

/** the GLB's beanie profiles (build.ts) with the HAT05 cuff height; u = once around (+Z front = 0, back = 0.5) */
function hatGeometries(cuffH: number, taper: number, crownH: number): { brim: THREE.BufferGeometry; crown: THREE.BufferGeometry; yt: number; crownTop: number } {
  const yb = D.brimBottom;
  const yt = yb + cuffH;
  const bk = D.brimR / 0.778;
  const bw = bk * HAT05.brimW;
  const lip = Math.sqrt(D.skin * D.skin - yb * yb) + 0.012;
  const brim = lathe(
    [
      [lip, yb + 0.01],
      [0.725 * bw, yb - 0.008],
      [0.758 * bw, yb + 0.02],
      [0.776 * bw, yb + 0.07],
      [0.781 * bw, yb + 0.5 * cuffH],
      // fuller rolled top edge (approved: the cuff's upper corners stand higher at the sides)
      [0.781 * bw, yt - 0.06],
      [0.772 * bw, yt - 0.022],
      [0.745 * bw, yt - 0.004],
      [0.69 * bk, yt],
    ],
    96,
    yb - 0.01,
    yt + 0.005,
  );
  const crownY0 = yt - 0.045;
  const R0 = 0.705 * bk;
  const prof: [number, number][] = [];
  for (const t of [0, 0.08, 0.16, 0.25, 0.34, 0.43, 0.52, 0.6, 0.68, 0.75, 0.81, 0.86, 0.9, 0.935, 0.96, 0.98, 0.993, 1]) {
    prof.push([R0 * Math.sqrt(Math.max(0, 1 - t * t)) * (1 - taper * t), crownY0 + t * crownH]);
  }
  const crown = lathe(prof, 96, crownY0, crownY0 + crownH);
  return { brim, crown, yt, crownTop: crownY0 + crownH };
}

/** a copy of the swim clip whose body side roll is scaled by ROLL05 (the cached GLB clips stay untouched) */
export function dampedClips(clips: THREE.AnimationClip[]): THREE.AnimationClip[] {
  return clips.map((c) => {
    if (c.name !== 'swim') return c;
    const k = c.clone();
    for (const t of k.tracks) {
      if (t.name !== 'body.quaternion') continue;
      const q = new THREE.Quaternion(), e = new THREE.Euler();
      for (let i = 0; i < t.values.length; i += 4) {
        q.fromArray(t.values, i);
        e.setFromQuaternion(q, 'XYZ');
        e.z *= ROLL05;
        q.setFromEuler(e).toArray(t.values, i);
      }
    }
    return k;
  });
}

// ------------------------------------------------------------------ baked maps
const T = (f: string) => new URL(`../../../assets/textures/benny05/${f}`, import.meta.url).href;
/** part → baked albedo (sRGB PNG) + colour factor (the map stores albedo / factor so it fits 0..1) + optional normal map */
export const MAPS05: Record<string, { map: string; scale: number; normal?: string; normalScale?: number }> = {
  fur_body: { map: 'body.png', scale: 1 },
  fur_armL: { map: 'armL.png', scale: 1 },
  fur_armR: { map: 'armR.png', scale: 1 },
  fur_pom: { map: 'pom.png', scale: 1 },
  hat_crown: { map: 'crown.png', scale: 1, normal: 'crown_n.png', normalScale: 0.8 },
  hat_brim: { map: 'brim.png', scale: 1, normal: 'brim_n.png', normalScale: 0.8 },
};
/** star: solved base colour (linear) */
export const STAR05 = { color: [1, 0.62, 0.03] as [number, number, number] };

let loaded: Promise<Record<string, THREE.Texture | null>> | null = null;
/** load every baked map once (missing files → null: that part keeps its GLB look) */
export function loadBenny05Maps(): Promise<Record<string, THREE.Texture | null>> {
  if (loaded) return loaded;
  const files = new Set<string>();
  for (const m of Object.values(MAPS05)) { files.add(m.map); if (m.normal) files.add(m.normal); }
  const tl = new THREE.TextureLoader();
  loaded = Promise.all(
    [...files].map(async (f) => {
      try {
        const t = await tl.loadAsync(T(f));
        t.colorSpace = f.endsWith('_n.png') ? THREE.NoColorSpace : THREE.SRGBColorSpace;
        t.wrapS = THREE.RepeatWrapping;
        t.anisotropy = 4;
        t.needsUpdate = true;
        return [f, t] as const;
      } catch {
        console.warn('[benny05] missing baked map', f);
        return [f, null] as const;
      }
    }),
  ).then((e) => Object.fromEntries(e));
  return loaded;
}

const PART_ID: [RegExp, number][] = [
  [/^fur_body/, 1], [/^hat_crown/, 2], [/^hat_brim/, 3], [/^fur_pom/, 4], [/^hat_star/, 5],
  [/^fur_armL/, 6], [/^fur_armR/, 7], [/^fur_footL/, 8], [/^fur_footR/, 9],
];
const partId = (n: string) => PART_ID.find(([re]) => re.test(n))?.[1] ?? 10;

export interface Benny05Handle {
  /** QA: render Benny's (u, v, part id, shell layer) into a float target; returns base64 Float32 RGBA of rect */
  uvPass(renderer: THREE.WebGLRenderer, world: THREE.Scene, camera: THREE.Camera, rect: [number, number, number, number]): string;
  /** QA: constant linear albedo k on every baked part (+ star), or null = back to the baked maps */
  calib(k: number | null): void;
}

/**
 * Apply the corrected look to a freshly cloned Benny scene (after the fur upgrade). `maps` from loadBenny05Maps().
 */
export function applyBenny05(scene: THREE.Object3D, furs: FurHandle[], maps: Record<string, THREE.Texture | null>): Benny05Handle {
  const get = (n: string) => scene.getObjectByName(n);
  // ---- beanie geometry ----
  const hat = get('hat')!;
  hat.position.y -= HAT05.drop;
  hat.position.x += HAT05.shiftX;
  hat.rotation.x += HAT05.tilt;
  const g = hatGeometries(HAT05.cuffH, HAT05.crownTaper, HAT05.crownH);
  const brim = get('hat_brim') as THREE.Mesh;
  const crown = get('hat_crown') as THREE.Mesh;
  brim.geometry = g.brim;
  crown.geometry = g.crown;
  const dCuff = HAT05.cuffH - D.cuffH;
  const star = get('hat_star') as THREE.Mesh;
  star.position.y += dCuff + HAT05.starDY;
  star.position.x += HAT05.starDX;
  star.scale.set(HAT05.starScale[0], HAT05.starScale[1], 1);
  const pom = get('pom')!;
  pom.position.y += dCuff + (HAT05.crownH - D.crownH) + HAT05.pomDY;
  pom.position.x += HAT05.pomDX;
  pom.position.z += HAT05.pomDZ;
  pom.scale.setScalar(HAT05.pomScale);

  // ---- fur clumping ----
  for (const f of furs) {
    const c = CLUMP05[f.mesh.name];
    if (c !== undefined) f.uniforms.uClump.value = c;
  }

  // ---- materials (own copies: the cached GLB materials are shared by every clone) ----
  const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  white.needsUpdate = true;
  type St = { mesh: THREE.Mesh; mat: THREE.MeshStandardMaterial; map: THREE.Texture | null; color: THREE.Color; fur?: FurHandle; root?: THREE.Color; tip?: THREE.Color };
  const baked: St[] = [];
  scene.traverse((o) => {
    const m = o as THREE.Mesh;
    if (!m.isMesh) return;
    const spec = MAPS05[m.name];
    if (!spec) return;
    const fur = furs.find((f) => f.mesh === m);
    const mat = fur ? fur.material : (m.material as THREE.MeshStandardMaterial).clone();
    if (!fur) m.material = mat;
    const tex = maps[spec.map];
    if (fur) {
      const d = mat.defines ?? (mat.defines = {});
      d.BENNY05 = '';
    }
    if (tex) {
      if (fur) {
        // root → tip shading only as a relative factor on the baked colour
        fur.uniforms.uRoot.value.setRGB(0.86, 0.86, 0.86);
        fur.uniforms.uTip.value.setRGB(1, 1, 1);
      }
      mat.map = tex;
      mat.color.setScalar(spec.scale);
      if (!fur) {
        const n = spec.normal ? maps[spec.normal] : null;
        mat.normalMap = n;
        if (n) mat.normalScale.setScalar(spec.normalScale ?? 1);
      }
    } else if (fur) {
      // no bake yet: keep the GLB root / tip colours through the multiply path
      mat.map = white;
    } else if (m.name === 'hat_crown' && mat.map) {
      mat.map = mat.map.clone();
      mat.map.repeat.x = 4; // GLB crown texture was authored for a 4× u repeat
      mat.map.needsUpdate = true;
      if (mat.normalMap) { mat.normalMap = mat.normalMap.clone(); mat.normalMap.repeat.x = 4; mat.normalMap.needsUpdate = true; }
    }
    mat.needsUpdate = true;
    baked.push({ mesh: m, mat, map: mat.map, color: mat.color.clone(), fur, root: fur?.uniforms.uRoot.value.clone(), tip: fur?.uniforms.uTip.value.clone() });
  });
  const starMat = (star.material as THREE.MeshStandardMaterial).clone();
  starMat.color.setRGB(...STAR05.color);
  star.material = starMat;
  const starCol = starMat.color.clone();

  // ---- QA hooks ----
  const uvPass: Benny05Handle['uvPass'] = (renderer, world, camera, rect) => {
    const size = renderer.getDrawingBufferSize(new THREE.Vector2());
    const rt = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.FloatType, depthBuffer: true });
    const root = scene.parent!;
    const vis: [THREE.Object3D, boolean][] = [];
    for (const c of world.children) { vis.push([c, c.visible]); if (c !== root) c.visible = false; }
    const bg = world.background;
    world.background = null;
    const saved: [THREE.Mesh, THREE.Material | THREE.Material[]][] = [];
    const tmp: THREE.Material[] = [];
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!m.isMesh) return;
      const id = partId(m.name);
      const fur = furs.find((f) => f.mesh === m);
      if (fur) {
        const d = fur.material.defines ?? (fur.material.defines = {});
        if (d.BENNY05 === undefined) { d.BENNY05 = ''; d.B05_TMP = ''; }
        d.BENNY_UV = '';
        fur.uniforms.uMaskCol.value.setRGB(id, 0, 0);
        fur.material.needsUpdate = true;
        return;
      }
      saved.push([m, m.material]);
      const side = (m.material as THREE.Material).side;
      const sm = new THREE.ShaderMaterial({
        uniforms: { uId: { value: id } },
        vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
        fragmentShader: 'uniform float uId; varying vec2 vUv; void main(){ gl_FragColor = vec4(vUv, uId, 0.0); }',
        side,
      });
      tmp.push(sm);
      m.material = sm;
    });
    const prevTarget = renderer.getRenderTarget();
    const prevClear = renderer.getClearColor(new THREE.Color());
    const prevAlpha = renderer.getClearAlpha();
    renderer.setRenderTarget(rt);
    renderer.setClearColor(0x000000, 0);
    renderer.clear();
    renderer.render(world, camera);
    const [x, y, w, h] = rect;
    const buf = new Float32Array(w * h * 4);
    renderer.readRenderTargetPixels(rt, x, size.y - y - h, w, h, buf);
    renderer.setRenderTarget(prevTarget);
    renderer.setClearColor(prevClear, prevAlpha);
    for (const [m, mat] of saved) m.material = mat;
    for (const t of tmp) t.dispose();
    for (const f of furs) {
      const d = f.material.defines;
      if (d?.BENNY_UV !== undefined) { delete d.BENNY_UV; f.material.needsUpdate = true; }
      if (d?.B05_TMP !== undefined) { delete d.B05_TMP; delete d.BENNY05; }
    }
    for (const [c, v] of vis) c.visible = v;
    world.background = bg;
    rt.dispose();
    const bytes = new Uint8Array(buf.buffer);
    let s = '';
    for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
    return btoa(s);
  };
  const calib: Benny05Handle['calib'] = (k) => {
    for (const b of baked) {
      b.mat.map = k === null ? b.map : white;
      if (k === null) b.mat.color.copy(b.color); else b.mat.color.setScalar(k);
      if (b.fur) {
        // calibration always sees the baked-mode relative root → tip factor
        if (k === null) { b.fur.uniforms.uRoot.value.copy(b.root!); b.fur.uniforms.uTip.value.copy(b.tip!); }
        else { b.fur.uniforms.uRoot.value.setRGB(0.86, 0.86, 0.86); b.fur.uniforms.uTip.value.setRGB(1, 1, 1); }
      }
      b.mat.needsUpdate = true;
    }
    if (k === null) starMat.color.copy(starCol); else starMat.color.setScalar(k);
  };
  return { uvPass, calib };
}
