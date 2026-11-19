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
