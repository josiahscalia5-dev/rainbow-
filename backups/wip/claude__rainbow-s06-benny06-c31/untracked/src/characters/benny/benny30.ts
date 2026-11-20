/**
 * Round 30 Benny — `?b30=1` (benny-character-artist, qa/match/06/r30/benny06/NOTES.md). Off (default): nothing in this file
 * runs, every material, geometry and shader program is the previous one.
 *
 * Builds ON benny05 (benny05.ts runs whenever b30 is on: knit / fur / pompom maps baked from approved pixels, beanie seat,
 * damped roll) and moves Benny toward the PAINTED Benny of the approved Screen 06 (references/06_crest_the_rinse_arch.png)
 * and the r30 storyboard (docs/briefs/2026-11-20-r30/USER_S06_STORYBOARD_R30.png):
 *  1. PROPORTIONS: the beanie is about as wide as the upper body (not wider), shorter and sits HIGHER on a taller plush
 *     body, so the upper half of the dusty-pink body shows below the thick ribbed cuff (beanie scale about the cuff's
 *     bottom centre + raise; body scaled about its bottom so it stays seated in the water).
 *  2. FUR UNDER THE CUFF: the shell fur's bald cap (fur.ts uBald) follows the raised cuff, so no bare skin band appears.
 *  3. VIEW: a little more forward ride lean, so the rear chase camera sees the knit stripes as level bands and the pompom
 *     ON TOP of the beanie (the painting's near-level view) instead of the dome from above.
 *  4. FUR LOOK: dusty rose (mean ≈ 230, 90, 175 in the painting) instead of hot pink; shorter, denser, more clumped
 *     shells = soft plush, not spiky.
 *  5. ARMS: small round fluffy arms at both sides, a little higher / further out like the painting.
 * Rig, clips, collision, steering and the game's placement of Benny are unchanged: only meshes / joints inside his own
 * scene graph move. Every number can be overridden for QA with `?b30<key>=<value>` (e.g. `&b30hs=0.85`); in `?qa` pages
 * `window.__b30.set({...})` re-applies live (tools: qa/match/06/r30/benny06/).
 */
import * as THREE from 'three';
import { flag05 } from '../../vfx/waterRibbon';
import type { FurHandle } from './fur';

export const BENNY30: boolean = flag05('b30');

export interface B30Params {
  /** ride lean (deg, + = top forward), replaces the runtime's BENNY_RIDE_PITCH (12.6°) */
  pitch: number;
  /** beanie: uniform scale about the cuff's bottom centre, extra vertical factor, raise along the body's up (body units) */
  hs: number;
  hsy: number;
  hy: number;
  /** beanie: shift toward his back (body units, + = toward the rear camera) */
  hz: number;
  /** body: width (x, z) and height scale about the body's bottom, extra raise (body units) */
  bsx: number;
  bsy: number;
  by: number;
  /** fur reaches this far ABOVE the cuff's bottom edge, hidden under the cuff (body units) */
  tuck: number;
  /** arms: scale, raise, out (body units) */
  as: number;
  ay: number;
  ax: number;
  /** body / arm fur: shell length, strand density, clumping (fur.ts uniforms) */
  fl: number;
  fd: number;
  fk: number;
  /** body / arm fur colour factor (linear multipliers on the baked albedo) */
  fr: number;
  fg: number;
  fb: number;
  /** pompom: scale, colour factor (uniform) */
  ps: number;
  pk: number;
}

const DEF: B30Params = {
  pitch: 12.6,
  hs: 1, hsy: 1, hy: 0, hz: 0,
  bsx: 1, bsy: 1, by: 0,
  tuck: 0.07,
  as: 1, ay: 0, ax: 0,
  fl: 0.11, fd: 96, fk: 0.55,
  fr: 1, fg: 1, fb: 1,
  ps: 1, pk: 1,
};

/** the chosen look (measured, qa/match/06/r30/benny06/NOTES.md); DEF = benny05 unchanged */
const TUNED: Partial<B30Params> = {};

const QS: URLSearchParams | null = (() => {
  try { return typeof location !== 'undefined' ? new URLSearchParams(location.search) : null; } catch { return null; }
})();

function initialParams(): B30Params {
  const p: B30Params = { ...DEF, ...TUNED };
  for (const k of Object.keys(p) as (keyof B30Params)[]) {
    const v = parseFloat(QS?.get(`b30${k}`) ?? '');
    if (Number.isFinite(v)) p[k] = v;
  }
  return p;
}

export interface Benny30Handle {
  params: B30Params;
  set(p: Partial<B30Params>): B30Params;
}

/** body bottom (body-local y) of the GLB's pear ball incl. the lower-half stretch (build.ts: skin 0.7, stretch 0.03) */
const BODY_BOTTOM = -0.7 * 1.03;
/** hat-local cuff bottom (build.ts brimBottom) */
const CUFF_Y = 0.22;
const SKIN = 0.7;

/** Apply to a freshly cloned Benny scene AFTER applyBenny05 (its hat seat / maps / fur are the base). */
export function applyBenny30(scene: THREE.Object3D, furs: FurHandle[]): Benny30Handle {
  const get = (n: string) => scene.getObjectByName(n);
  const hat = get('hat')!;
  const pom = get('pom')!;
  const armL = get('armL')!, armR = get('armR')!;
  const base = {
    hatPos: hat.position.clone(), hatScale: hat.scale.clone(),
    pomScale: pom.scale.clone(),
    armL: armL.position.clone(), armR: armR.position.clone(), armS: armL.scale.clone(),
  };
  const body = furs.find((f) => f.mesh.name === 'fur_body');
  const arms = furs.filter((f) => /^fur_arm/.test(f.mesh.name));
  const pomFur = furs.find((f) => f.mesh.name === 'fur_pom');
  type U = FurHandle['uniforms'] & { uFurLen: { value: number }; uDensity: { value: number }; uBald: { value: THREE.Vector4 } };
  const furCol = new Map<FurHandle, THREE.Color>();
  for (const f of [...(body ? [body] : []), ...arms, ...(pomFur ? [pomFur] : [])]) furCol.set(f, f.material.color.clone());
  const bald0 = body ? (body.uniforms as U).uBald.value.clone() : null;
  const hatUp = bald0 ? new THREE.Vector3(bald0.x, bald0.y, bald0.z).normalize() : new THREE.Vector3(0, 1, 0);

  const params = initialParams();
  const apply = () => {
    const P = params;
    // ---- beanie: scale about the cuff's bottom centre, then raise / shift back ----
    const s = P.hs;
    hat.scale.set(base.hatScale.x * s, base.hatScale.y * s * P.hsy, base.hatScale.z * s);
    const c = new THREE.Vector3(0, CUFF_Y, 0);
    const keep = c.clone().sub(c.clone().multiply(new THREE.Vector3(s, s * P.hsy, s))).applyQuaternion(hat.quaternion);
    hat.position.copy(base.hatPos).add(keep);
    hat.position.y += P.hy;
    hat.position.z -= P.hz;
    pom.scale.copy(base.pomScale).multiplyScalar(P.ps);
    // ---- body: scaled about its bottom, raised ----
    if (body) {
      body.mesh.scale.set(P.bsx, P.bsy, P.bsx);
      body.mesh.position.set(0, BODY_BOTTOM * (1 - P.bsy) + P.by, 0);
      // fur tucks under the raised cuff: cuff bottom (body-local, along the body's up) → unscaled skin height → bald dot
      const cuffBody = c.clone().multiply(hat.scale).applyQuaternion(hat.quaternion).add(hat.position);
      const yUnscaled = (cuffBody.y + P.tuck - body.mesh.position.y) / P.bsy;
      const u = body.uniforms as U;
      u.uBald.value.w = THREE.MathUtils.clamp(yUnscaled / SKIN, -1, 1.5);
      u.uFurLen.value = P.fl;
      u.uDensity.value = P.fd;
      body.uniforms.uClump.value = P.fk;
    }
    for (const f of arms) {
      const u = f.uniforms as U;
      u.uFurLen.value = P.fl * (0.05 / 0.11);
      f.uniforms.uClump.value = P.fk;
    }
    for (const [f, c0] of furCol) {
      if (f === pomFur) f.material.color.copy(c0).multiplyScalar(P.pk);
      else f.material.color.setRGB(c0.r * P.fr, c0.g * P.fg, c0.b * P.fb);
    }
    // ---- arms ----
    armL.position.copy(base.armL).add(new THREE.Vector3(P.ax, P.ay, 0));
    armR.position.copy(base.armR).add(new THREE.Vector3(-P.ax, P.ay, 0));
    armL.scale.copy(base.armS).multiplyScalar(P.as);
    armR.scale.copy(base.armS).multiplyScalar(P.as);
  };
  apply();
  void hatUp;
  const handle: Benny30Handle = {
    params,
    set(p) { Object.assign(params, p); apply(); return { ...params }; },
  };
  if (QS && QS.has('qa')) (window as unknown as { __b30?: Benny30Handle }).__b30 = handle;
  return handle;
}
