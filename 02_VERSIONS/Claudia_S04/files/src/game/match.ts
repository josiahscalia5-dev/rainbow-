/**
 * "Match my approved picture" test switches for the gameplay screens (2026-11-17, qa/match/NOTES.md).
 *   `?match02=1` … `?match10=1`  one screen each (05 has its own set; `?match05=1` turns all of those on — see
 *   src/vfx/waterRibbon.ts q05). `?matchall=1` = every screen switch below at once.
 * Every change a screen makes lives behind its switch: with no switch the game is byte-for-byte the default build
 * (verified by pixel comparison after every change). Packaged experiment builds read the same keys from
 * VITE_RAINBOW_Q05 (flag05).
 * File ownership (one owner per screen while work runs in parallel): see qa/match/NOTES.md.
 */
import type { CamParams } from './cameraRig';
import { flag05 } from '../vfx/waterRibbon';

export type MatchId = '02' | '03' | '04' | '06' | '07' | '08' | '09' | '10';
export const MATCH_IDS: MatchId[] = ['02', '03', '04', '06', '07', '08', '09', '10'];
const ALL = flag05('matchall');
export const MATCH: Record<MatchId, boolean> = Object.fromEntries(MATCH_IDS.map((id) => [id, ALL || flag05('match' + id)])) as Record<MatchId, boolean>;
export const matchOn = (id: string): boolean => (MATCH as Record<string, boolean>)[id] === true;

/**
 * Camera framing per screen under its switch (merged over cameraRig STAGE_CAM by applyMatchCam): the checkpoint
 * camera is the approved picture's camera — Benny's size and place, the vanishing point and the horizon.
 * Measured with scripts/match-cam-try.mjs; one line per screen (owner: that screen's worker).
 */
export const MATCH_CAM: Partial<Record<MatchId, Partial<CamParams>>> = {
  // 04 (2026-11-17, qa/match/04/NOTES.md): solved offline (tools/match04/solve_cam04.py) so Benny's box lands on the
  // approved picture (195,965-590,1400) and the tunnel's vanishing point on (490,690); camera = Benny's water point + off04
  '04': { fov: 62, roll: 0, off04: [0.4015, 6.2009, 3.5184], dir04: [-0.04342, -0.58119, -0.81261] },
  '07': { back: 9, up: 5.4, ahead: 22, lookUp: -1.8, fov: 62 },
  // 08 (2026-11-17, qa/match/08/NOTES.md): solved in the live game so Benny's box, the door centre and the platform land
  // on the approved picture (266,843-594,1216 vs 260,850-600,1210; door 489,399 vs 490,400; platform 483,565 vs 480,560)
  '08': { fov: 62, roll: 0, off08: [0.686, 3.697, 7.115], aim08: [9.812, -119.291, -332.288] },
};

/** called once by cameraRig after STAGE_CAM is defined */
export function applyMatchCam(stageCam: Partial<Record<string, CamParams>>): void {
  for (const id of MATCH_IDS) {
    const o = MATCH_CAM[id];
    if (!MATCH[id] || !o || !stageCam[id]) continue;
    stageCam[id] = { ...(stageCam[id] as CamParams), ...o };
  }
}
