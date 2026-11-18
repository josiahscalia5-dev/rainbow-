/**
 * `&m05fold=1` (Screen 05 round 10, branch claude/rainbow-s05-match-c10, qa/match/05/r10/PROGRESS.md; needs m05ride):
 * NO FOLDED RIVER AT THE 05 → 06 KINK. The course makes a tight S just before Screen 06 (s ≈ 172–183: bend radius
 * 3.6–5.7 u while the river is 4.3–5.6 u wide each side, measured with course.sample). The water ribbon builds every row
 * straight across the course (pos ± right · half width), so on the inner side of each bend the rows cross: the right
 * edge folds back at s 173.5–174.7, the left edge at s 177.5–181.1. The folded sheet carries the painted design three
 * times over itself (forward, backward, forward) — the jagged, broken, overlapping patches and the warped sheet on the
 * left half of the river while swimming (lead's t33 / t66). Under the switch the ribbon's vertices in those bends are
 * smoothed along the river (Gaussian along s, horizontal only — heights are kept, so Benny never sinks), more toward
 * the banks (∝ |u|³, ≈ 0 in Benny's lane), only where the bend is tighter than the river is wide. The rows no longer
 * cross: one continuous water surface with the painted design laid out once. Visual only: course, steering, Benny's
 * height, coins unchanged. Engaged only while riding (the ribbon's pjNearK ramp): the locked approved view is unchanged.
 */
import type { Course } from '../world/course';

/** Gaussian width (units of s) at the banks where the bend is tightest */
const SIG = 2.5;

/**
 * Horizontal (world x / z) displacement per vertex that removes the folds. `latN` = |lateral| / half width per vertex
 * (≥ 1 beyond the edge), `rowS` = arc length of each row, `stride` = vertices per row (rows are consecutive).
 */
export function unfoldDelta05(course: Course, pos: Float32Array, rowS: ArrayLike<number>, stride: number, latN: Float32Array): Float32Array {
  const rows = rowS.length;
  const out = new Float32Array(pos.length);
  const st = course.stage('05');
  // bend tightness per row: half width / bend radius, dilated ±4 u, only on 05 (fades out over the 06 hand-over)
  const ds = rows > 1 ? Math.max(1e-3, rowS[1] - rowS[0]) : 0.4;
  const tight = new Float32Array(rows);
  for (let i = 0; i < rows; i++) {
    const s = rowS[i];
    if (s < st.s0 - 2 || s > st.s1 + 4) continue;
    const a = course.sample(Math.max(0, s - 0.4)), b = course.sample(s + 0.4);
    const ang = Math.acos(Math.min(1, a.tan.dot(b.tan))) / 0.8;
    const hw = course.widthAt(s) / 2;
    const t = hw * ang;                                    // hw / R
    const x = Math.min(1, Math.max(0, (t - 0.45) / (0.8 - 0.45)));
    tight[i] = x * x * (3 - 2 * x);
  }
  const K4 = Math.ceil(4 / ds);
  const sig = new Float32Array(rows);
  for (let i = 0; i < rows; i++) {
    let m = 0;
    for (let k = -K4; k <= K4; k++) { const j = i + k; if (j >= 0 && j < rows) m = Math.max(m, tight[j] * (1 - Math.abs(k) / (K4 + 1))); }
    sig[i] = SIG * m;
  }
  for (let i = 0; i < rows; i++) {
    if (sig[i] < 0.02) continue;
    for (let c = 0; c < stride; c++) {
      const v = i * stride + c;
      const l = Math.min(1, latN[v]);
      const sg = sig[i] * l * l * l;
      if (sg < 0.02) continue;
      const K = Math.ceil((3 * sg) / ds);
      let ax = 0, az = 0, w = 0;
      for (let k = -K; k <= K; k++) {
        const j = Math.min(rows - 1, Math.max(0, i + k));
        const d = (rowS[j] - rowS[i]) / sg;
        const ww = Math.exp(-0.5 * d * d);
        const q = j * stride + c;
        ax += pos[q * 3] * ww; az += pos[q * 3 + 2] * ww; w += ww;
      }
      out[v * 3] = ax / w - pos[v * 3];
      out[v * 3 + 2] = az / w - pos[v * 3 + 2];
    }
  }
  return out;
}

/**
 * `&m05flat=1` (waterRibbon.ts M05FLAT): world-height change that removes the bank tilt of the 05 → 06 kink at (s,
 * lateral) — 0 outside the window s1 − 20 … s1 − 3.4 (smooth ends; nothing changes at the 05 checkpoint, at the far
 * tunnel's seam or on 06). Shared by the ribbon (vertices + heightAt, so Benny rides the level water and never sinks),
 * the lather bank and the rim foam, so everything on the river keeps its place on the level surface.
 */
let flatTab: { a: number; ds: number; ry: Float32Array; uy: Float32Array; s0: number; s1: number } | null = null;
const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function flatInit(course: Course) {
  if (flatTab) return flatTab;
  const st = course.stage('05');
  const s0 = st.s1 - 20, s1 = st.s1 - 3.4, ds = 0.1;
  const n = Math.ceil((s1 - s0) / ds) + 1;
  const ry = new Float32Array(n), uy = new Float32Array(n);
  for (let i = 0; i < n; i++) { const f = course.sample(s0 + i * ds); ry[i] = f.right.y; uy[i] = f.up.y; }
  flatTab = { a: s0, ds, ry, uy, s0, s1 };
  return flatTab;
}
/** world-Y displacement (units) that levels the kink at (s, lateral) */
export function flat05Dy(course: Course, s: number, lat: number): number {
  const t = flatInit(course);
  if (s <= t.s0 || s >= t.s1) return 0;
  const k = sm(t.s0, t.s0 + 3, s) * (1 - sm(t.s1 - 3, t.s1, s));
  const x = (s - t.a) / t.ds, i = Math.min(t.ry.length - 2, Math.floor(x)), w = x - i;
  return -(t.ry[i] * (1 - w) + t.ry[i + 1] * w) * lat * k;
}
/** the same along the course's up vector (for heights measured along up, e.g. ribbon.heightAt) */
export function flat05Up(course: Course, s: number, lat: number): number {
  const dy = flat05Dy(course, s, lat);
  if (dy === 0) return 0;
  const t = flatTab!;
  const x = (s - t.a) / t.ds, i = Math.min(t.uy.length - 2, Math.floor(x)), w = x - i;
  return dy / Math.max(0.5, t.uy[i] * (1 - w) + t.uy[i + 1] * w);
}
