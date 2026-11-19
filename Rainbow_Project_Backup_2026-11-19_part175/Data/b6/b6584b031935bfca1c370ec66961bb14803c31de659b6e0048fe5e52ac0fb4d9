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
