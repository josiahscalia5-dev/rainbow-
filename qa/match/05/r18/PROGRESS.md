# Screen 05 — round 18 (account 18) progress log

Worker: water-fx-specialist on branch `claude/rainbow-s05-match-c18` (worktree `/home/user/wt/s05`, dev-server port 5275).
Started from `f033f7cc` (= r17 step 1 `&m05trans=1`, kept). No unfinished code was left.
Binding: `docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md` (VISUALS ONLY), `docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md`,
launch brief `docs/briefs/2026-11-18-r15/S05_LAUNCH.md` read with `-c18` / `r18`, resume notes `docs/briefs/2026-11-19-r18/RESUME_R18.md`.
History: `qa/match/05/r17/PROGRESS.md` (step 1 m05trans kept), `qa/match/05/r14/PROGRESS.md`, `qa/match/05/r13/PROGRESS.md`
(rejected m05slot / m05lump: never repeat).

Kept start set (= r17 step 1, `qa/match/05/r18/KEPT_START.txt`):
`?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1&m05wtile=1&m05end=1&m05fmag=1&m05fpaint=1&m05fcloud=1&m05fcoin=1&m05join=1&m05frim=1&m05vee2=1&m05bank=1&m05trans=1`

Positions: `tN` / `xN` = Benny at N % of Stage 05; `L` / `R` = steering hard left / right on the way there.

* 2026-11-19 round 18 started. Task 2 (lead note): at hard left the whole LEFT wall is a smeared, radially streaked
  projection, a flat cut-off chunk of gold paddle, a hot-pink triangular smear in the bottom-left corner; near the end of 05
  the walls close to the camera are radially smeared → the painted crisp purple slotted wall with glossy gold bands.

## Diagnosis for task 2 (2026-11-19, `tools/match05/r15_probe.mjs` at t12L / t81L / x97L)
* The smeared left wall at hard left (t81L, x97L) and the near walls at the end of 05 are the far block's wall
  (`tube05_far_wall`). Its bays are laid out by the painting's far ring depths (knots: ring C at virtual depth 5.8 u, D 43.8,
  E 107.8, F 168.8, G 268.8 beyond the seam), so bay CD is 38 u deep, DE 64 u, EF 61 u, FG 100 u (the painted near bay AB is
  18 u). The wall picture of each bay (atlas rows BC … FG: 128 → 16 texel rows) and the m05wtile N1 slot pattern are both
  stretched over that whole depth: near the end of 05 the camera is inside bay CD, so each slot row is 2.7 … 4.6× too long
  along the tunnel and every texel is magnified many times → big blurred slots and long streaks pointing to the vanishing point.
* The flat cut-off gold chunk (t81L, x 150–300 y 440–540) is the Blender paddle `lid05_L3` (and `lid05_R3` on the right).
  These two were fitted onto the far block's wall as it is compressed for the locked eye (4.2 … 5.4 u past the seam, i.e.
  virtual depth ≈ 21 … 56). The far block re-fits itself to the live eye every frame, the static trays do not: while
  swimming they float 2 … 3 u inside the tunnel, flattened along it.
* The hot-pink triangle in the bottom-left corner at t81L is also the far wall (its baked row holds river / bank colours
  at those angles, magnified).

## (r19) Step 2 result — left wall while swimming (`&m05wcrisp=1` + `&m05pink=1` KEPT; `&m05lidf=1` REJECTED for now)
Branch `claude/rainbow-s05-match-c19` (continued from `-c18` tip `ef5dd0cd`). Proof folder `qa/match/05/r18/step2_wall/`:
`1_APPROVED.png`, `BEFORE/` (kept start set), `NEW/` (+ `&m05wcrisp=1&m05pink=1`), `new_with_lidf_rejected/` (+ `&m05lidf=1` too),
`clip_new_half.mp4` (real gameplay, half size, 62 % of 05 → into 06, straight / hard left / hard right). 16 positions rendered
(a00, f03, f06, f10, f20, s_left_hard, s_right_hard, t33, t66, k81 left / right, t95, x97, x97L, x97R, t98); 8 key ones committed
per set, the rest stay in the worktree folder.
* `m05wcrisp` + `m05pink` — GOOD IMPROVEMENT. While swimming the middle and end of 05 (t66, t95, x97, t98) and at hard left
  (k81L, x97L), the smeared, radially streaked walls are now a crisp violet-magenta slotted wall with clean dark slots in rows and
  glossy light streaks, close to the painted wall colour. The hot-pink triangular smear in the bottom-left corner at k81L is gone.
  The start of swimming (a00 … f20) and the hard-steer start views look the same as BEFORE. No tears / seams / popping in the clip.
  Locked approved view byte-identical (`scripts/capture.mjs 05`, cmp). Gameplay 8/8, 91 coins, 1,330 → 2,240 (exact kept set;
  `gameplay_step2.json`; the 3-switch run also 8/8 / 91 / 2,240: `gameplay_step2_all3.json`).
* `m05lidf` — NOT AN IMPROVEMENT as it stands: it removes the flat cut-off gold chunk at hard left in the kink, but from the very
  start of swimming (a00, f03, f10) the far block's own paddle pair at EVERY far ring appears next to the painted far paddles —
  extra floating gold bars, i.e. doubled paddles the approved picture does not have. Code stays committed behind its switch only.
* Still visible (not fixed by this step): the flat cut-off gold chunk (Blender far paddle `lid05_L3` / `R3`, static while the far
  block re-fits) at hard left in the kink (k81L x 150–300 y 440–540) and a small gold sliver at the left edge at x97L; the near
  tunnel wall just behind the near gold ring (top-left at k81L) is still radially smeared; inside the long far bays the wall has
  no gold bands (the painting shows one per bay).

Kept set after step 2 (`qa/match/05/r18/KEPT_STEP2.txt`):
`?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1&m05wtile=1&m05end=1&m05fmag=1&m05fpaint=1&m05fcloud=1&m05fcoin=1&m05join=1&m05frim=1&m05vee2=1&m05bank=1&m05trans=1&m05wcrisp=1&m05pink=1`

## (r19) WHERE I STOPPED / NEXT (handoff, lead order 2026-11-19 ~19:45 UTC: finish the current step, then stop)
Stopped after step 2 (above), nothing unfinished, no uncommitted code. Kept set = `KEPT_STEP2.txt` (full query just above).
Next tasks, in order (one URL switch per step, BEFORE = kept set, same 16 positions, locked view 0 px, gameplay 8/8 / 91 / 2,240):
1. The flat cut-off gold chunk at hard left in the kink (Blender far paddles `lid05_L3` / `R3` stay where they were fitted for the
   locked eye while the far block re-fits to the live eye). `m05lidf` swapped them for the far block's own paddle pair at every far
   ring → doubled paddles from the start. Try instead: keep L3 / R3 while they still sit on the painted paddles (start … ≈ f20),
   then hand over to ONE live paddle pair at the same ring (only where L3 / R3 were) with no visible pop; check a00 / f03 / f10 /
   f20 / t33 / k81L / x97L.
2. Near the end of 05 (t95, x97, t98) the near water round Benny is a plain glossy cyan sheet → the painted near water (cyan with
   hot-pink satin bands and the crisp four-point white glints).
3. Walls near the camera: the near tunnel wall behind the near gold ring (top-left at k81L, both edges at x97 / t98) is still
   radially smeared → the same crisp purple slotted wall; inside the long far bays add the painted gold band per bay if missing.
4. Brief (`docs/briefs/2026-11-18-r15/S05_LAUNCH.md`) tasks 2–4: at the kink (k81L) the left bank foam still stands as a tall
   narrow bubble column → low rounded foam clouds; painted V leftover (crisper outer band ends, four-point glints); then the next
   biggest difference at all views.
Tools: `tools/match05/r8_shots.mjs <out> "<query>" <names> 5275`, `scripts/capture.mjs 05 --q=...`, `scripts/gameplay-test.mjs
--q=... --out=...`, `tools/match05/r18_clip.mjs <out> <startFrac> <secs> <fps> "<query>" 5275` (its HUD uses a fallback font: the
clip server lacks the font allow-list; game unchanged), `tools/match05/r15_probe.mjs` (which mesh is under a screen point).
