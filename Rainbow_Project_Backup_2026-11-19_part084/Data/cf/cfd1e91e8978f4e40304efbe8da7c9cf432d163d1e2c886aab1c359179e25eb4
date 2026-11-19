import { MathUtils } from 'three';
import type { Course } from '../world/course';

export type OutletRange = readonly [number, number];

/** First twelve units of the chamber seen through the Screen 07 outlet. */
export function outletRange(course: Course): OutletRange | null {
  if (typeof location === 'undefined') return null;
  const options = new URLSearchParams(location.search);
  if (['match07', 'm07foam', 'cx07ShoreJoin'].some(key => options.get(key) !== '1')) return null;
  const chamber = course.stage('08');
  return [chamber.s0, Math.min(chamber.s0 + 12, chamber.s1)];
}

export function outletWeight(s: number, range: OutletRange | null): number {
  if (!range || s <= range[0] || s >= range[1]) return 0;
  return MathUtils.smoothstep(s, range[0], range[0] + 1.4)
    * (1 - MathUtils.smoothstep(s, range[1] - 2.2, range[1]));
}

/** Course-local distance beyond the ribbon edge, shared by the satin bank and the foam. */
export function outletWidth(s: number, side: number): number {
  return 0.54 + 0.15 * Math.sin(s * 0.67 + side * 1.1) + 0.08 * Math.sin(s * 1.29 - side);
}

export const OUTLET_CONTACT_HEIGHT = 0.12;

/** Rounded foam rests on the outer bank with a small overlap under the wet edge. */
export function outletFoam(s: number, side: number, q: number, lump: number) {
  const u = MathUtils.clamp(q, 0, 1);
  const bulge = 4 * u * (1 - u);
  return {
    offset: outletWidth(s, side) - 0.045 + u * (0.48 + 0.16 * lump),
    height: OUTLET_CONTACT_HEIGHT - 0.035 + (0.075 + 0.21 * lump) * bulge - 0.065 * u * u,
  };
}
