# Screen 08 scenery-in-motion — STATUS (round 6 = my round 2, PAUSED by lead order 2026-11-17 ~22:50 UTC)

* Branch `claude/rainbow-s08-scenery-c6`. **Start SHA `9a2a531a`** (lead's `700f09e1` + 2 transcript autosaves). Final SHA: `git log -1`.
* Every change is behind its own `?match08=1` sub-switch; default build code paths untouched (nothing runs without `match08`).

## Done (round 6)
1. **RESTORED lost code.** The round-5 autosave `48af969b` (20:52 UTC) captured a temporarily reverted working tree, so
   `m08fill` (`src/world/match08.ts`) and the 08-only sample-spacing guard (`src/world/course.ts`) were MISSING from the
   "final" round-1 commit `60e7ffe8` — the lead's r6 BEFORE audit therefore ran WITHOUT m08fill and WITH the 04–07 leak.
   Restored from my own commits `471d2e57` (match08.ts) and `8987a305` (course.ts). Frames of the real round-1 set:
   `qa/match/08/scenery/r6/R1_restored/` (lead's frames copied to `r6/lead_BEFORE/`, reproduced in `r6/BEFORE/`).
2. **`&m08arch=1` (gold-band clipping) — KEEP.** Inlet pipe, gold arch and entrance wall pushed ×2.6 (`&m08archk=`) away
   from the approved viewpoint along the projector's own rays (same picture from the approved view); arch + entrance wall
   rebuilt as fine grids; the arch's water-level sill stays as fitted. Moving frames `r6/arch/`: the gold ring now sweeps
   past whole (no corner slivers / smeared pink arcs at forward 3/6/10 u and steering). Approved view (frozen
   `scripts/capture.mjs`, `r6/proof/`): 167,610 px change, almost all by 1 level (sampling precision), 448 px > 20 levels on
   rim edges; changed pixels slightly closer to the approved picture (mean error 12.2 → 11.4 in a test before the final tweak).
3. **`&m08swim=1` (Benny on the purple floor when steering hard) — KEEP (looks right, not fully proven).** Floor shader
   spreads the painted river's banks over the whole reachable lane (half-width 2.95 u = lat 2.22 + body, `&m08swimw=`),
   centre of the river as painted, world-anchored, fades in only as the camera leaves the approved viewpoint (should be 0 px
   at the approved view — NOT yet proven with the frozen tool). Frames `r6/swim/` (full 12-shot audit with
   `match08=1&coins08px=1&m08bw=1&m08fill=1&m08arch=1&m08swim=1`): Benny rides on water at hard right / hard left.
4. Heart lost at s ≈ 404 in both hard-steer shots = the foam-wall rule (`Game.ts` rideUpdate: |lat| > halfW − 0.75 for
   > 0.6 s), not an obstacle; the pink tint in those frames is the HUD hurt flash. Gameplay rules unchanged.

## Unfinished
* `&m08seam=1` (ceiling slot-size change): code added (fill tile scaled ×`m08seamk`, default 1.6), NOT rendered/judged yet.
* Not done: 04–07 leak re-proof (course guard restored — must re-prove 0 px for my parts; Benny/coins/bubbles = other
  owners, see SHARED_CHANGES.md), duplicated-river check on all steer shots, default build 0 px, approved-view proofs for
  m08swim, gameplay 8/8 + 91 / 2,240, 07→08 drop, continuity, APPROVED/BEFORE/NEW pictures, ratings, APK.

## Exact next step
`B='match08=1&coins08px=1&m08bw=1&m08fill=1&m08arch=1&m08swim=1'`: render `f10`/`t95` with `$B` vs `$B&m08seam=1&m08seamk=1.6`
and `2.2`, keep only if the slot size matches the painted chamber wall; then proofs (item list above) and the 12-shot
audit `node tools/lead_r6/motion_audit.mjs 08 qa/match/08/scenery/r6/NEW "$B[&m08seam=1]"`.
