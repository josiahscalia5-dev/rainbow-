# Lead round 6 (account 6) — visual-accuracy audit of playable screens 04–08 while MOVING (2026-11-17 ~22:00–22:40 UTC)

Lead session `session_01VCMXoaUqBCxDq8BntT19BU`, branch `ccr-4bd35b15-7z45t0`. Read-only audit of each screen's NEWEST
version (04 / 05 / 06 / 07 on `claude/rainbow-preview-all-c5` @ `965e4ef9` with their OWN switches = pixel-identical to
their branches; 08 on `claude/rainbow-s08-scenery-c5` @ `700f09e1` with the kept round-1 set).

| Screen | Switches audited |
|---|---|
| 04 | `match04=1` (M3) |
| 05 | `match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1` (M2, line B) |
| 06 | `match06=1` (M1) |
| 07 | `match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1` (M2) |
| 08 | `match08=1&coins08px=1&m08bw=1&m08fill=1` (scenery r1; Benny r5b) |

**CAVEAT 08:** at `700f09e1` (and at the r5 "final" `60e7ffe8`) the `m08fill` code and the 08-only course guard were
missing — a 20:52 autosave on `-c5` had committed older copies of `match08.ts` / `course.ts`; the 08 specialist restored
them on `claude/rainbow-s08-scenery-c6` (`c43783a7`, `8e555fdb`). So the lead's 08 frames show the round-1 set WITHOUT
`m08fill` (switch was a no-op).

## Files
* `approved_view_exact/<nn>_NOW_newest_version.png` — frozen approved-view capture (`scripts/capture.mjs`), full size.
  `<nn>_normal_game_no_switches.jpg` — the normal game (unchanged default build) at the same checkpoint.
* `audit/<nn>/*.jpg` + `motion.json` — 12 moving shots per screen (`tools/lead_r6/motion_audit.mjs`): approved view
  (approximate — 2 real frames run), forward 3/6/10/20 u, steer left/right, hard left/right, 33/66/95 % through the rest
  of the stage. JPEG q92 (lean repo). NOTE 08 `f20` is already in stage 09 (08 is only 12.4 u from its approved view to
  the 09 / ending-video hand-over).
* `metrics/moving_<nn>.txt` (`tools/lead_r6/motion_metrics.py`): below the HUD, vs the approved picture — LAYOUT20
  (sigma-8 blurred, within 20 levels; falls naturally when the viewpoint moves) and PALETTE (hue×saturation histogram
  overlap: does the approved colour/material look survive?). `metrics/m_new<nn>.json` = `tools/qa/screen_match.py`.
* `preview_c6/` — the combined-preview Screen 08 conflict: bisect before/after, ALL-switch captures, gameplay, continuity.

## Measured (whole frame within 20 levels at the approved view = reproduces round 5 exactly)
| Screen | Normal game | Newest version | Scenery only (specialist's mask, r5) | PALETTE approved view | PALETTE moving mean (min) |
|---|---|---|---|---|---|
| 04 | 6.4 % | 81.8 % | 98.2 % | 95.0 % | 67.9 % (55.4) |
| 05 | 18.5 % | 89.4 % | 93.7 % | 95.3 % | 79.3 % (57.6) |
| 06 | 5.0 % | 79.1 % | 98.8 % | 91.2 % | 67.7 % (61.8) |
| 07 | 6.7 % | 80.1 % | 95.5 % | 92.8 % | 65.6 % (24.6) |
| 08 | 4.0 % | 84.1 % | 97.3 % | 96.0 % | 76.2 % (42.2) |
Normal game PALETTE: 04 48.8 · 05 59.2 · 06 41.6 · 07 55.2 · 08 48.0 %.

## Lead's visual ratings (SUBJECTIVE, 1–10, honest; not pixel scores)
| Screen | Approved view | While riding | Biggest moving defect → technical cause |
|---|---|---|---|
| 04 | 8 | 4 | From ~6 u the gold tunnel turns into a blurred orange smear and the water into a flat narrow ramp with hard straight edges floating in the tube; the blue arrows, pink swirl water and foam banks fade after ~10 u → the approved pixels are only valid near the locked viewpoint; further on they are stretched along the tunnel (no world-anchored ring / bulb / swirl-water materials, no foam-bank geometry). |
| 05 | 8.5 | 6 | First ~20 u keep the approved look; from ~66 % of the stage the OLD default 05 world shows (pink walls, orange band, white foam pillars); the river spreads into a wide sheet when steering; very large near coins → matched geometry/textures only cover the stretch around the approved view. |
| 06 | 7.5 | 3 | From 3 u a huge flat wall of repeated pink-chevron water fills 70–80 % of the frame, tunnel only above a hard horizontal edge → the fitted river floor is much wider than the painted river and climbs as a hump; from the approved camera it carries painted TUNNEL pixels, after moving the mask swaps them for one mirrored repeating water tile. |
| 07 | 7.5 | 3.5 | First ~10 u fine except smeared near water when steering; the matched tunnel ends ~8 u before the plunge top, then the old default tube shows and during the 07→08 plunge a gold band fills the whole screen (camera inside the ring geometry) → match07 coverage = [07 start+14 u, plunge top−8 u]; plunge geometry/camera never matched. |
| 08 | 8.5 | 7 | Holds the approved look at 3–10 u; gold arch slivers enter the frame edges when steering; hard steering puts Benny on the purple floor beside the painted S-river (swim lane wider than the painted water) and costs a heart at s≈404 → chamber surfaces hidden from the approved view + river material only on the painted S. |
**No playable screen reaches 8.5/10 during gameplay yet.** Screen 08 and the first part of 05 come closest.

## Combined preview: Screen 08 at 29.5 % with ALL switches — FIXED on `claude/rainbow-preview-all-c6` @ `41ea6618`
* Bisect (`tools/lead_r6/bisect_preview08.mjs`): 04 / 05 / 06 switches harmless (r5 partial bisect + this one); **`match07=1`
  alone** moved the 08 approved-view camera 0.49 u sideways (x 12.848 → 13.335, target fixed) → 08 25.2 %.
* Cause: `src/world/course.ts` `x07` (the match07 river following the painted 07 S-river) eased out at the END OF THE
  PAINTED RIVER DATA, which lies at the plunge top, so the ease-out never finished; every later point (plunge, 08) is built
  relative to the plunge top → whole 08 path shifted vs the world-fixed projected 08 chamber.
* Fix (match07-guarded): also fade to the default path over the last 4 u before the plunge top.
* Proofs: tsc clean; default build 04–08 **0 px**; 08 camera with `match07` identical to without; **08 with ALL switches
  87.7 %** (was 29.5 %; own switches 85.8 %, the 05 top bar helps); 07 own view 80.1 % unchanged (3,099 px > 20 levels from
  the slightly shorter course's re-sampled frames; same build twice = 0 px); gameplay ALL switches pass, stages 03–10,
  coins 2,240; continuity ok, gaps 0, 07→08 drop 61.19 u.
* Still open on the preview (ALL switches): 05 83.0 % (own 89.4) and 07 74.4 % (own 80.1) — r5 found the Screen 05 Benny
  look switching on everywhere (07 Benny changed); 08 residual 85.8 → 83.5 % with match07: Benny's bob/splash use the
  water height at ABSOLUTE s (`water.surfaceHeight(s,…)`) and match07 makes 07 longer → different wave phase at the 08
  checkpoint (shared water code — not changed). The same course fix must go onto the 07 branch when it resumes.
