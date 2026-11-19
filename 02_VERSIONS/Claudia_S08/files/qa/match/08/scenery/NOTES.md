# Screen 08 scenery-in-motion — NOTES (round 1, interrupted 2026-11-17 by lead: usage)

## Key fact
Every fitted proxy shows exactly the approved picture from the approved viewpoint (camera projection), so proxies may
be reshaped or scaled ABOUT THE APPROVED VIEWPOINT without changing the approved view — only Benny/coin occlusion and the
moving views change. (At the checkpoint the projector = the game camera.)

## What causes each problem (found with `&m08dbg=1`, frames `dbg_ids/`, `dbg_lane/`)
1. **Lower-left jagged tear + second displaced river/wall copy (6 u forward, steering left)** = `m08_backwall`. It stood
   3.6 u beyond the arch (z −284.8, opening r 4.3) and rose out of the floor right where the picture paints river; the
   projector sees that strip through the arch, so a vertical wall carried the painted river → stretched copy when the
   camera approaches. FIX `&m08bw=1` (wall flush behind the arch, opening = arch outline). Frames `motion_bw/` vs
   `motion_BEFORE/`: tear gone in f03/f06/s_left/s_right/s_right_hard6u.
2. **Hard curved seam across the upper chamber ceiling + gold band fragments at the edges** = chamber wall/ceiling areas
   the gold arch hides from the approved viewpoint (projector shadow) → they fall back to the mirrored triplanar
   `patch_wall.png` (different scale/brightness, kaleidoscope). Gold fragments at frame edges (f03, s_left) = the arch
   seen from inside/at a steep angle. NOT fixed yet.
3. **Benny rides into the right pipe/arch (camclear steer1 ~44.5 s)** = the fitted inlet pipe (r 2.92 around an axis
   2.6 u above the water) leaves only ±1.35 u of water at the waterline and the arch opening ±0.85 u at the waterline,
   but Benny steers to ±1.85…2.28 u (+≈0.7 u body). `lane08.mjs` output: Benny at checkpoint z −282.09 (already at the
   arch back face), steering right x up to 13.8 at z −287. FIX `&m08lane=1`: pipe + arch scaled ×1.45 about the
   approved viewpoint (arch now ≈9.3 u away, opening ±3.07 u at the waterline) + pipe lower half superellipse (n 6).
   First try covered Benny (entrance-wall opening fell outside its outline → filled); fixed (outline +3 u). Debug
   frames `dbg_lane/` now show Benny clear at checkpoint, forward 3/6/10 u, steering left/right.
   Side effect to check: the arch's lowest painted gold (below ~row 1050 at the arch sides) now lands flat on the floor.
4. **match08 effect on 04–07** — NOT investigated yet (check `m08.group.visible` is only true on 08 — Game.ts:168 sets
   it per stage; check the hidden `M08_HIDE` water parts / bloom / chamber zone are restored when leaving 08).

## Numbers so far
Chamber slot period along the wall measured from the picture ≈0.41 u (autocorrelation; ambiguous, 1.3–2.0 u on some
angles) — intended for a world-anchored wall fill.

## EXACT next task (new account)
1. Render real-texture frames for `&m08lane=1` (`M08_SHOTS=full node tools/match08/motion08.mjs qa/match/08/scenery/motion_lane 'match08=1&coins08px=1&m08lane=1'`) — the existing `motion_lane/` frames are from the BROKEN first try; compare with `motion_BEFORE/` and `motion_bw/`.
2. Prove the approved view is unchanged with the frozen tool: `node scripts/capture.mjs 08 --q=match08=1&coins08px=1[&m08bw=1|&m08lane=1] --out=…` (motion08 f00 frames are NOT deterministic — don't use them for 0 px).
3. Ceiling seam fix (`&m08fill=1`): replace the mirrored triplanar fallback on chamber walls by a world-anchored fill made from the picture (e.g. resample the visible wall at the same angle shifted along the drum by a whole slot period, brightness matched), soft blend.
4. 04–07 check, gameplay 8/8 + 91 / 2,240, default 0 px, 07→08 drop, APPROVED/BEFORE/NEW pictures, APK.

## Round 5 results (account 5, 2026-11-17)
1. **Real-texture frames** `motion_bw_r5/`, `motion_lane_r5/` (vs `motion_BEFORE/`). `m08bw`: the lower-left tear / second
   river copy stays gone. `m08lane`: NOT visibly better — Benny was already clear of the pipe in these frames, and it adds
   a gold arch sliver in the top-right corner when steering hard right → not kept.
2. **Approved view (frozen `scripts/capture.mjs`)**: base deterministic (0 px between two captures). `m08bw` 13,374 px, all
   on the gold arch's outer rim (1 px; 249 px > 20 levels; those rim pixels are marginally closer to the approved picture:
   mean error 10.3 → 10.0). `m08lane` 117,694 px (not kept).
3. **Ceiling seam `m08fill`.** Finding: the chamber ceiling is NEVER visible through the arch from the approved viewpoint
   (it would need > 55 u of depth; the picture's top inside the arch is the door wall) and the deep drum is too
   foreshortened to be a sharp source. So the fill comes from the picture's crisp near pipe wall: `tools/match08/unwrap08.py`
   unrolls it at 1 cm/cell, measures the slot rows (0.49 u along the axis, autocorrelation), cuts a seamless 2.19 × 1.47 u
   tile (best-matching wrap width, feathered joins), colour-matched to the visible chamber wall (mean RGB 182/79/184, gold
   excluded) → `assets/textures/match08/fill_drum.png`. Shader: drum wall mapped around the chamber axis (whole tiles around,
   atan wrap under the floor), door/entrance wall flat; soft 5×5-tap hand-over at the arch shadow line. Both the fill and the
   soft hand-over fade in only as the camera leaves the approved viewpoint (0.2 → 1.5 u), so the approved view is 0 px.
   Result `motion_fill_r5/`: the mirrored hearts/X kaleidoscope on the ceiling is gone; continuous slotted wall, softer seam.
   Still visible: a mild change of slot pattern where the fill meets the painted wall; a faint corner line where drum
   ceiling meets door wall (f03); the gold arch itself at the frame edges when steering hard (real geometry).
4. **04–07 under `match08`**: cause 1 (fixed, `course.ts`, guarded): total-length-dependent sample spacing. Remaining (other
   owners): Benny differs on every screen under match08 (benny05 port + match08 Benny path); 07 coins; a few 04 bubbles.
5. Proofs: see STATUS.md. APK blocked by a Maven 404 (STATUS.md).

## Round 7 results (account 7, branch claude/rainbow-s08-scenery-c7) — details + numbers in STATUS.md
* Kept: `m08seam` (×1.6: fill slots now the size of the painted chamber-wall slots), `m08sill` (whole arch pushed along
  projector rays: no torn gold/blue slabs at the frame bottom at forward 3 u), `m08towel` (towel frustum along projector
  rays: no door-window slab on the towel when steering hard). `m08swim` and `m08seam` = 0 px at the approved view.
* Method reminder: anything that must stay identical at the approved view can be moved/reshaped ALONG PROJECTOR RAYS
  (VP + k·(p − VP)); surfaces that the projector sees edge-on carry no foreign pixels. Debug with `&m08dbg=1`
  (colour order = order of `add()` calls in match08.ts: pipe red, arch green, backwall blue, chamber yellow, doorwall
  cyan, floor magenta, …).
* Do NOT revert a source file in the working tree to capture "old" frames (the 5-min autosave can commit it — that is
  how round-5 code was lost). Use a scratch copy (src/assets/scripts + symlinked node_modules) instead.
* Honest moving rating ≈ 7/10 (hard steering ≈ 6/10). Next: near-camera water while steering hard.
