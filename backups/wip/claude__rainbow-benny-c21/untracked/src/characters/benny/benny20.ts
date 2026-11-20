/**
 * Round 20 Benny — `?benny20=1` (benny-character-artist, qa/benny/r19b/PROGRESS.md). Off (default): nothing in this file
 * runs, every material, geometry and shader program is the previous one.
 *
 * Builds ON benny05 (benny05.ts also runs whenever benny20 is on: approved-pixel maps, beanie seat, damped roll) and then
 * moves Benny toward the APPROVED Screen 04 Benny (references/04_through_the_five_arrows.png, the largest, sharpest view):
 *  1. Fur: soft plush LOCKS instead of single needles (fur.ts `#ifdef BENNY20`): long, clumped, combed-down tufts with
 *     darker roots / creases and lighter tips, in dusty rose / mauve instead of neon pink (flat albedo, colour solved
 *     against the approved fur in the real 04 frame).
 *  2. Beanie: bigger and seated lower over the body (approved: ≈ 10 % wider, cuff bottom far lower), chunky hand-knit
 *     maps (tools/benny20/knit.py: V-stitch columns, cream-white / violet stripes, thick ribbed violet cuff).
 *  3. Pompom: bigger, lighter violet, chunky yarn locks (same lock shader, radial).
 *  4. Star: flat stitched felt patch (thin, matte, soft gold, stitched rim) instead of a glossy 3D plastic star.
 * Gameplay size / collision / clips / ride placement are untouched: only the look of the meshes changes.
 * Every number below can be overridden for QA with `?b20<key>=<value>` (e.g. `&b20hs=1.12`).
 */
import * as THREE from 'three';
import { flag05 } from '../../vfx/waterRibbon';
import type { FurHandle, FurParams } from './fur';

export const BENNY20: boolean = flag05('benny20');

const QS: URLSearchParams | null = (() => {
  try { return typeof location !== 'undefined' ? new URLSearchParams(location.search) : null; } catch { return null; }
})();
/** numeric QA override `?b20<key>=v` */
function n(key: string, def: number): number {
  const v = parseFloat(QS?.get(`b20${key}`) ?? '');
  return Number.isFinite(v) ? v : def;
}
/** linear RGB QA override `?b20<key>=r,g,b` */
function lin(key: string, def: [number, number, number]): [number, number, number] {
  const v = (QS?.get(`b20${key}`) ?? '').split(',').map(Number);
  return v.length === 3 && v.every(Number.isFinite) ? (v as [number, number, number]) : def;
}

/** shell-fur overrides (merged over the GLB's userData.fur and benny05's FUR05) */
export const FUR20: Record<string, Partial<FurParams>> = {
  fur_body: { shells: n('bsh', 28), length: n('blen', 0.13), gravity: n('bgr', 0.1) },
  fur_armL: { shells: n('ash', 16), length: n('alen', 0.07), gravity: n('agr', 0.1) },
  fur_armR: { shells: n('ash', 16), length: n('alen', 0.07), gravity: n('agr', 0.1) },
  fur_pom: { shells: n('psh', 20), length: n('plen', 0.12), gravity: n('pgr', 0.04) },
};

type V4 = [number, number, number, number];
/** lock shader parameters per part (fur.ts uLock / uShade / uComb) and flat albedo (LINEAR rgb). Albedos solved from a
 *  grey calibration sweep through the live 04 lighting + post chain (tools/benny20/calfit.py, qa/benny/r20/probe/c) for
 *  the approved means: fur (207, 74, 151), pompom (133, 30, 229) */
const LOCK20: Record<string, { lock: V4; shade: V4; comb: V4; color: [number, number, number] }> = {
  fur_body: {
    lock: [n('blx', 24), n('bly', 1.0), n('blz', 1.0), n('blw', 180)],
    shade: [n('bsx', 0.3), n('bsy', 0.3), n('bsz', 0.5), n('bsw', 0.3)],
    comb: [n('bcx', 0.8), n('bcy', 0.85), n('bcz', 0.1), n('bcw', 0.4)],
    color: lin('bcol', [0.305, 0.108, 0.18]),
  },
  fur_armL: {
    lock: [n('alx', 50), 0.95, n('alz', 0.9), 320],
    shade: [0.45, 0.25, 0.3, 0.3],
    comb: [n('acx', 0.4), 0.9, 0.08, 0.15],
    color: lin('acol', [0.305, 0.108, 0.18]),
  },
  fur_armR: {
    lock: [n('alx', 50), 0.95, n('alz', 0.9), 320],
    shade: [0.45, 0.25, 0.3, 0.3],
    comb: [n('acx', 0.4), 0.9, 0.08, 0.15],
    color: lin('acol', [0.305, 0.108, 0.18]),
  },
  fur_pom: {
    lock: [n('plx', 40), n('ply', 0.8), n('plz', 1.0), n('plw', 220)],
    shade: [n('psx', 0.45), n('psy', 0.3), n('psz', 0.35), n('psw', 0.3)],
    comb: [0, 1, n('pcz', 0.12), n('pcw', 0.3)],
    color: lin('pcol', [0.1016, 0.0067, 0.4425]),
  },
};

/** beanie geometry on top of benny05's HAT05 (hat-local). Measured at the 04 start view against the approved silhouette
 *  (tools/benny20/score.py): cuff bottom on the centre column 1276 → 1271 px target, pompom 168 px wide like the approved */
export const HAT20 = {
  /** uniform scale of the whole beanie (cuff, crown, star, pompom) about the head centre */
  scale: n('hs', 1.1),
  /** extra drop along the body's up axis (units) */
  drop: n('hd', 0.02),
  /** backward tilt about the hat's X axis (rad, − = top toward his back): the BACK of the cuff (what the rear chase
   *  cameras see) comes down to the approved seat while the FRONT stays above his eyes (eye tops ≈ +0.18) */
  tilt: n('ht', -0.23),
  /** body-fur bald zone under the cuff: cos of the cone angle around the (tilted) hat up axis (GLB 0.414) */
  baldW: n('bw', 0.38),
  /** pompom: extra scale and lift (hat-local, after the beanie scale) */
  pomScale: n('ps', 1.03),
  pomDY: n('pdy', 0.0),
  /** star felt patch: thickness factor (GLB bevelled star ≈ 0.11 thick) */
  starFlat: n('sf', 0.3),
};

/** colour factors (LINEAR multipliers on the knit / felt maps, solved like the fur) + knit normal strength */
const MAT20 = {
  crown: lin('ccol', [0.82, 0.82, 0.78]),
  brim: lin('rcol', [0.34, 0.34, 0.31]),
  star: lin('scol', [0.34, 0.75, 1.0]),
  crownN: n('kcn', 2.0),
  brimN: n('kbn', 2.5),
};

const T = (f: string) => new URL(`../../../assets/textures/benny20/${f}`, import.meta.url).href;
const FILES = ['crown.png', 'crown_n.png', 'brim.png', 'brim_n.png', 'star.png', 'star_n.png'];
let loaded: Promise<Record<string, THREE.Texture | null>> | null = null;
/** load the knit / felt maps once (missing file → null: that part keeps its benny05 look) */
export function loadBenny20Maps(): Promise<Record<string, THREE.Texture | null>> {
  if (loaded) return loaded;
  const tl = new THREE.TextureLoader();
  loaded = Promise.all(
    FILES.map(async (f) => {
      try {
        const t = await tl.loadAsync(T(f));
        t.colorSpace = f.endsWith('_n.png') ? THREE.NoColorSpace : THREE.SRGBColorSpace;
        t.wrapS = f.startsWith('star') ? THREE.ClampToEdgeWrapping : THREE.RepeatWrapping;
        t.wrapT = THREE.ClampToEdgeWrapping;
        t.anisotropy = 4;
        t.needsUpdate = true;
        return [f, t] as const;
      } catch {
        console.warn('[benny20] missing map', f);
        return [f, null] as const;
      }
    }),
  ).then((e) => Object.fromEntries(e));
  return loaded;
}

/** apply after applyBenny05 (same freshly cloned scene + fur handles) */
export function applyBenny20(scene: THREE.Object3D, furs: FurHandle[], maps: Record<string, THREE.Texture | null>): void {
  const get = (nm: string) => scene.getObjectByName(nm);
  const white = new THREE.DataTexture(new Uint8Array([255, 255, 255, 255]), 1, 1);
  white.needsUpdate = true;

  // ---- fur: plush locks, flat dusty-rose albedo ----
  for (const f of furs) {
    const spec = LOCK20[f.mesh.name];
    if (!spec) continue;
    const mat = f.material;
    const d = mat.defines ?? (mat.defines = {});
    d.BENNY20 = '';
    if (d.BENNY05 === undefined) d.BENNY05 = '';
    mat.map = white;
    mat.color.setRGB(...spec.color);
    f.uniforms.uRoot.value.setRGB(1, 1, 1);
    f.uniforms.uTip.value.setRGB(1, 1, 1);
    f.uniforms.uLock.value.set(...spec.lock);
    f.uniforms.uShade.value.set(...spec.shade);
    f.uniforms.uComb.value.set(...spec.comb);
    mat.needsUpdate = true;
  }

  // ---- beanie: bigger, lower ----
  const hat = get('hat');
  if (hat) {
    hat.userData.b20rest = { y: hat.position.y, rx: hat.rotation.x, s: hat.scale.x };
    hat.scale.multiplyScalar(HAT20.scale);
    hat.position.y -= HAT20.drop;
    hat.rotation.x += HAT20.tilt;
    // body fur stays bald under the (now lower, tilted) cuff: cone axis follows the tilt (fur.ts uBald: xyz axis, w = cos)
    const body = furs.find((f) => f.mesh.name === 'fur_body');
    const ub = (body?.uniforms as unknown as { uBald?: { value: THREE.Vector4 } } | undefined)?.uBald;
    if (ub) {
      ub.value.w = HAT20.baldW;
      const ax = new THREE.Vector3(ub.value.x, ub.value.y, ub.value.z).applyAxisAngle(new THREE.Vector3(1, 0, 0), HAT20.tilt);
      ub.value.set(ax.x, ax.y, ax.z, HAT20.baldW);
    }
  }
  const pom = get('pom');
  if (pom) {
    pom.scale.multiplyScalar(HAT20.pomScale);
    pom.position.y += HAT20.pomDY;
  }

  // ---- knit maps on the crown / cuff ----
  const knit = (name: string, map: string, nmap: string, factor: [number, number, number], ns: number) => {
    const m = get(name) as THREE.Mesh | undefined;
    const tex = maps[map];
    if (!m || !tex) return;
    const mat = (m.material as THREE.MeshStandardMaterial).clone();
    mat.map = tex;
    mat.color.setRGB(...factor);
    const nt = maps[nmap];
    mat.normalMap = nt;
    if (nt) mat.normalScale.setScalar(ns);
    mat.roughness = 0.92;
    mat.metalness = 0;
    mat.needsUpdate = true;
    m.material = mat;
  };
  knit('hat_crown', 'crown.png', 'crown_n.png', MAT20.crown, MAT20.crownN);
  knit('hat_brim', 'brim.png', 'brim_n.png', MAT20.brim, MAT20.brimN);

  // ---- star: flat stitched felt patch ----
  const star = get('hat_star') as THREE.Mesh | undefined;
  if (star && maps['star.png']) {
    star.scale.z *= HAT20.starFlat;
    const mat = (star.material as THREE.MeshStandardMaterial).clone();
    mat.map = maps['star.png'];
    mat.normalMap = maps['star_n.png'];
    mat.normalScale.setScalar(1);
    mat.color.setRGB(...MAT20.star);
    mat.roughness = 0.97;
    mat.metalness = 0;
    mat.emissive.setRGB(1, 0.72, 0.2);
    mat.emissiveIntensity = n('se', 0.08);
    mat.needsUpdate = true;
    star.material = mat;
  }

  // QA only (`?qa` pages, read by tools/benny20/probe.mjs): live handles for tuning without a reload
  if (QS?.has('qa') && typeof window !== 'undefined') {
    (window as unknown as { __b20?: unknown }).__b20 = { scene, furs, hat, pom, star, HAT20, LOCK20 };
  }
}
