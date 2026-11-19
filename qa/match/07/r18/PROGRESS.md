# Screen 07 · round 18 (account 18) — progress log

Branch `claude/rainbow-s07-match-c18` (worktree `/home/user/wt/s07`), start = `-c17` tip `8651edf9` + the round-17 worker's unfinished
edits (`src/world/match07.ts` +53, `src/vfx/foam.ts` +26, `src/vfx/waterRibbon.ts` +4), restored uncommitted. Briefs:
`docs/briefs/2026-11-19-r18/RESUME_R18.md` (s07) + `docs/briefs/2026-11-18-r15/S07_LAUNCH.md`. VISUALS ONLY. Nothing is approved
until the user says so. Earlier work: `qa/match/07/r17/PROGRESS.md`, `r16/`, `r15/`.

Kept set before this round: `K&m07foam=1&m07coinsz=1&m07nearw=1`, K = `qa/match/07/r16/K.txt`
(`match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1&m07tube=1&m07ring=1`).
APPROVED picture: `qa/match/07/r18/APPROVED_07.png` (= `references/07_dive_the_washer_tube.png`, sha256 75782e38…).
Shots: `tools/match07/audit_r18.mjs` (= audit_r16 + course marks in motion.json + plunge shots t72 / t88). Course marks:
07 247.06, plunge top 312.41, plunge mid end 374.14, plunge bottom 390.07, 08 390.16.

## Step 3 — `&m07foamb=1`: no white lather walls restarting part-way down the drop — finished 02:20–02:50 UTC
* What the unfinished edit was: the r17 step 3 draft. The `m07foam` hide range ended at plunge bottom − 12 (s 378), so further down
  the drop the game's tall white lather walls (with their puff heaps) started again with a visible cut, in the middle of the view.
  With `m07foamb` they stay away down to 5 u before the 08 start, then the bank grows back out of the water over those 5 u (full
  height at the 08 start, so Screen 08 keeps its own bank).
* Fixed in r18 (draft bug): the r17 ramp returned 0 for every point before the last 5 u of 07, so with the switch the lather bank
  would have been flattened over the WHOLE course (04, 05, 06 and the 07 level stretch). The ramp now only acts inside the hidden
  plunge range. Tried first (not kept): the regrown bank without its puffs → a smooth white slab; now the puffs ride on the growing
  bank, smaller while it grows, so it grows back as bubbly foam. The r17 scratch stills (`r17/step3_foamb/`, t95 only, made with
  the buggy ramp, incl. `try_ramp5` / `try_ramp8`) were deleted as superseded.
* Shared code, every change behind the switch: `src/vfx/foam.ts` (`end07`, `ramp07`, berm + puff placement), `src/vfx/waterRibbon.ts`
  (`HIDE07R` end). With the switch off every function returns exactly the old values.
* Query NEW: `K&m07foam=1&m07coinsz=1&m07nearw=1&m07foamb=1`; BEFORE: `K&m07foam=1&m07coinsz=1&m07nearw=1`.
* Pictures (separate, full size, real game):
  - APPROVED `/home/user/wt/s07/qa/match/07/r18/APPROVED_07.png`
  - BEFORE `/home/user/wt/s07/qa/match/07/r18/step3_foamb/BEFORE/` (t66, t72, t80, t88, t95 through the drop)
  - NEW `/home/user/wt/s07/qa/match/07/r18/step3_foamb/NEW/` (same names)
* Checks: approved start view, deterministic `scripts/capture.mjs 07` BEFORE vs NEW: **0 px** (rows 180–1536; 153 draw calls /
  287,709 triangles both). With the switch ON, screens 05, 06 and 08 start views are unchanged too (**0 px** each, whole frame) —
  proves the fixed ramp leaves the other screens' foam alone. Gameplay with the NEW query: **8/8 pass, 91 coins, 1,330 → 2,240**,
  plunge drop 61.14 u (`step3_foamb/gameplay_new.json`). `npx tsc --noEmit` clean.
* **Verdict: GOOD IMPROVEMENT** (small to moderate, only in the drop).
  - t72 / t80 / t88: the two tall white foam walls that started again half-way down the drop (with a heap of puffs piled at their
    cut-off ends) are gone from the lower and middle part of the view: there you now see the purple slotted tube with its gold rings
    and the painted pink / cyan river banks, like the approved picture. The walls only rise softly, as bubbly foam, right before
    the 08 inlet at the top of the frame.
  - t66: the far white walls in the tube throat are much shorter.
  - t95 (08 inlet, Screen 08's own bank) looks the same.
* Still wrong (most visible first): (1) at the very end of the drop (t88 top, t95) the tall white lather walls of the Screen 08 bank
  still fill both sides — they belong to 08 (paused), the approved 07 picture has low foam clouds there; (2) a straight horizontal
  seam line crosses the river and walls at about y 930–1090 in t66 / t80 / t88 (was there before, BEFORE has it too); (3) on the level stretch: thin
  straight magenta bands near Benny and the flat pale foam sheet at hard left (step 4).

## Step 4 — `&m07band=1`: thick magenta bands sweeping in S-curves beside Benny (level stretch) — finished 02:45–03:00 UTC
* The r17 step-4 draft `&m07nearf=1` (a magenta bank widened outward + round "foam clouds" drawn in the floor shader) was rendered
  once and **rejected (NOT AN IMPROVEMENT)**: at hard left the clouds read as flat oval stickers with a sky-photo texture on a
  magenta floor, and at forward 10 u nothing changed near Benny. Record: `r18/step4_nearf_rejected/s_left_hard.png`. Its code was
  removed (it was only behind its own switch); the r17 `motion.json` of that draft was deleted.
* Problem (r17 step-2 NEW f10 / f20): below Benny the whole bottom of the frame was glossy cyan; the magenta bands ran as thin
  straight ribbons at the very edges of the frame, parallel to Benny's path. In the approved picture the cyan core is narrow
  (about 1.5 × Benny's width) and thick magenta satin bands sweep in big curves right beside him (lower left of the picture).
* Change (`src/world/match07.ts`, `nearWater()`, only with `m07nearw` + `m07band`): cyan core ±1.1 u (was ±1.85), the river centre
  sweeps in a world-anchored S off Benny's lane (±0.6 u, every 14 u, so the bands curve across the view as he swims), the band
  is at least 0.95 u wide and on the outside of each bend widens to cover everywhere Benny can steer (lane ± 2.25 u + body), so he
  never swims on the foam; the painted band tile is spread across the band (no mirrored repeats: those read as a diamond lattice in
  a first try), and the band → foam edge is scalloped instead of a straight cut. Tunables `m07bA`, `m07bL`, `m07bC` (QA only).
* Query NEW: `K&m07foam=1&m07coinsz=1&m07nearw=1&m07foamb=1&m07band=1`; BEFORE: the same without `m07band`.
* Pictures (separate, full size, real game):
  - APPROVED `/home/user/wt/s07/qa/match/07/r18/APPROVED_07.png`
  - BEFORE `/home/user/wt/s07/qa/match/07/r17/step2_nearw/NEW/` (identical code at these level-stretch positions: `m07foamb` acts
    only in the drop; not re-rendered to save CPU)
  - NEW `/home/user/wt/s07/qa/match/07/r18/step4_band/NEW/` (a00, f03, f06, f10, f20, steer + hard left / right)
  - clip `/home/user/wt/s07/qa/match/07/r18/step4_band/swim_NEW_band.mp4` (real gameplay, 3.6 s straight / left / right, half size)
* Checks: approved start view, deterministic `scripts/capture.mjs 07` BEFORE vs NEW: **0 px** (rows 180–1536; 153 calls / 287,709
  triangles both). Gameplay with the NEW query: **8/8 pass, 91 coins, 1,330 → 2,240** (`step4_band/gameplay_new.json`).
  Shader-only change in Screen 07's own file; no shared code touched.
* **Verdict: GOOD IMPROVEMENT** (clear at forward 10 / 20 u, small at forward 6 u and steering; start view and forward 3 u unchanged).
  - f10: below Benny a narrow winding glossy cyan core with the bubbly white trim, and thick magenta satin bands curving in from
    both sides — the lower-left magenta sweep of the approved picture; before, the whole bottom was cyan.
  - f20: the cyan core bends past Benny with a wide magenta band filling the lower left and another curving in on the right.
  - hard left / right: Benny swims on a wider magenta band with a scalloped foam edge.
* Still wrong (most visible first): (1) at hard left / right the bank beyond the band is still a flat pale lilac-white foam
  sheet lying on the floor (painted: separate puffy foam clouds standing up); (2) at the plunge top (clip frame ≈80) the game's
  tall white lather wall shows on the right before the drop's hidden range starts; (3) the soft blurry hand-over zone at forward
  6 u / steering between the projected picture and the near water.
