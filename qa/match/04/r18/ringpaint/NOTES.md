# Screen 04 — painted-ring test `&m04rpaint` (round 18, continues the cut-off round-17 worker)

Brief: `docs/briefs/2026-11-18-r15/S04B_RINGTEX_LAUNCH.md` + `docs/briefs/2026-11-19-r18/RESUME_R18.md` ("s04tex").
Branch `claude/rainbow-s04-ringtex-c18` (= `-c17` tip `0f275af1` + the account-17 unfinished step-6 edit). Steps 1–4:
`qa/match/04/r16/ringpaint/NOTES.md`; step 5: `qa/match/04/r17/ringpaint/NOTES.md`.

Kept set K5 = L4 (`docs/briefs/2026-11-18-r15/S04_LAUNCH.md` "Kept set now") +
`&m04rpaint=1&m04rpsoft=1&m04rpj=0.35&m04rplu=3.95&m04rpgu=4.28&m04rpdots=1` (full query in `step6_var/motion.json` minus
`&m04rpvar=1`). BEFORE for r18 steps = K5 = `qa/match/04/r17/ringpaint/step5_dots/3_NEW_<shot>.png` (same build: r18 code is
off by default). `1_APPROVED.png` (this folder) = `references/04_through_the_five_arrows.png`, byte copy.

## Step 6 — three painted rings instead of one: K5 + `&m04rpvar=1` (account-17 edit finished, 02:25–02:50 UTC)
The unfinished account-17 edit WAS this step; finished and kept, not discarded.
What it does: until now every 3D ring wore ONE straightened painted ring (painted ring 1, the plain copper one). The painting's
inner rings differ: ring 0 (first inside the opening) carries a pink-violet sheen with violet glints on the lower-left and
lower-right walls, ring 1 is plain copper-gold with yellow light columns, ring 2 copper with pink-violet patches on the left
and violet glints on the right. `tools/match04/ring_paint04_var.py` straightens all three with the same method
(`ring_paint04.py`, same bubble fill / under-water mirror, arc override for rings 0 and 2 whose sheen fails the "warm" test)
and stacks them into `assets/textures/match04/tile_ring_paint_var(_soft).png`; the shader (`uRVar`, only with `m04rpvar=1`)
gives the first three 3D rings the painted order 0, 1, 2 and every deeper ring one of the three at random (world-anchored).
r18 fix inside this step: painted ring 0's bright lip line still rose into ~6 hump-shaped bulges (lip glints smeared by the
straightening) that showed on the 3D lip as notches / kinks (seen at f10); `dehump()` refills those columns from the
neighbouring angles of the same rows (lip line to groove only; the bands above and rings 1 / 2 keep their texels). After
the fix the lips are smooth again.

Pictures (full size, real game): NEW `step6_var/3_NEW_<shot>.png` (all 12 shots, motion log `step6_var/motion.json`);
BEFORE = `../r17/ringpaint/step5_dots/3_NEW_<shot>.png` (a00, f03, f06, f10, f20, t66, t95, s_left_hard, s_right_hard);
APPROVED = `1_APPROVED.png`. Texture: `step6_var/texture_NEW_tile_ring_paint_var_soft.png` (rows: painted ring 0 / 1 / 2).
Check: approved start view unchanged — frozen `scripts/capture.mjs 04` K5 vs K5 + `m04rpvar=1`, Pixelmatch rows 180–1536:
**0 differing pixels** (`step6_var/start_view_pixeldiff_BEFORE_vs_NEW.png`). Coins at every shot identical to BEFORE
(e.g. hard left 1,360 both); no code outside the ring shader's painted-ring branch; `references/*` sha256 OK; tsc clean.

Verdict: **GOOD IMPROVEMENT (small to moderate, ring colour)** — the inner rings are no longer all the same plain copper:
the first ring inside the opening and every few rings deeper now carry the painting's soft pink-violet sheen and violet
glints on the lower-left and lower-right walls next to the water, as in the approved picture (clearest at f03, f06, t66,
t95); the other rings stay the polished copper-gold with yellow light columns. The rings still read as separate thick rings
with smooth lips and light dots.
Still different: (1) at hard left the nearest ring's upper-left wall becomes a soft hazy pink-mauve sheet (that is the
painted ring 0's left side, but up close it looks less polished than the painted gold); (2) the painted rings are brighter
and more contrasty overall (white-hot yellow highlights on the upper rings, deeper shadows in the grooves); the game rings
are a slightly flatter, mid-tone copper.

## Step 7 — ring STRUCTURE: few, thick rings telescoping into the warm light: K6 + `&m04rfew=1&m04rfg=1.2` (lead redirect)
K6 = K5 + `&m04rpvar=1` (step 6 kept). BEFORE = `step6_var/3_NEW_<shot>.png` (K6, same build: step-7 code is off by default).
Why: measured on the approved picture (upper-left walls, the cleanest), every painted groove circle is ~0.76 x the previous one
over 11 rings (338, 254, 194, 149, 114, 87, 65, 50, 35, 27, 22 px): a quick telescope into the light. The game's constant
4.6 u cylinder gives 0.75 rising to 0.9 — a long corridor of many thin rings to a small orange ball at 90 u.
What it does (`src/world/match04m4.ts`, ring block + GOLD_FRAG under `#define RFEW`, default off; default build untouched):
* corridor (where Benny swims, to ~30 u inside the opening; the 04 scenery is hidden once stage 04 ends at ~30.4 u): ring 0
  keeps the kept 4.6 u period, each next period 1.2x longer (`m04rfg`) -> 5 broad rings (0, 4.6, 10.1, 16.7, 24.7 u);
* from 30 u (`m04rfa`) every ring is a smaller copy of the ring before it (x0.75 per ring, `m04rfq`), scaled about a point on
  the water line, its band a broad cone narrowing to its lip (faces the viewer like the painted bands), ending at ~55 u in
  a small end disc; painted texture, lip line, groove and light dots keep their painted proportions on every ring;
* the deep rings take on the painting's warm light (copper -> orange -> yellow -> warm white, the gains measured ring by ring
  on the painting in step 4, graded by ring size, `m04rfw`/`m04rfk`) and a warm-white light with a yellow-orange glow sits
  at the end (`m04rfl`, `m04rfc`, `m04rfo`; drawn on rings / end disc only, never over Benny, coins or water);
* the river trough is narrowed with the telescope (same centre), so its cyan lane and pink banks converge into the light
  instead of being cut by straight diagonal edges at the narrowing walls (first try without this showed those cuts). Done
  from the ring block when the river mesh is added (no edit in the river code; `m04rfriv=0` switches it off).
Pictures (full size, real game): NEW `step7_rfew/3_NEW_<shot>.png` (12 shots, `step7_rfew/motion.json`); BEFORE
`step6_var/3_NEW_<shot>.png`; APPROVED `1_APPROVED.png`. Clips (half size 432x768, 3.6 s straight / left / right / straight,
real gameplay; Screen 04 fills the first ~1.9 s, then 05 which is identical in both): `step7_rfew/clip_BEFORE_swim.mp4`,
`step7_rfew/clip_NEW_swim.mp4`.
Checks: approved start view unchanged — frozen `scripts/capture.mjs 04` K6 vs K6 + switch, Pixelmatch rows 180–1536:
**0 differing pixels**. Coins at all 12 shots identical to BEFORE (1,330 / 1,350 / 1,360 where picked up). Hearts, Benny,
camera, HUD untouched. tsc clean. Frame-by-frame check of the clip around the telescope: no popping, seams or flicker.
Verdict: **GOOD IMPROVEMENT (big, ring structure)** — from forward 3 u to the end and at hard left / right the tunnel is now a
handful of broad, thick polished rings that telescope quickly into a warm yellow-white light, with the river converging into
it, like the painted tunnel; before, a long straight corridor of ~20 thin copper rings ran to a small orange ball.
Still different: (1) the rings are a deeper copper-orange than the painting's brighter, more polished yellow-gold with
white-hot highlights (step 8 = brightness / polish, as planned); (2) the painted light at the end is a little larger and
whiter; (3) for the s04 worker / lead: with `m04rfew` the end disc moves to the telescope's end and shrinks to its last ring,
so `m04end` (s04's painted far opening on that disc) would need refitting if both are combined.

## Step 7 fix — seam at the top of every ring (found while doing step 8)
With `m04rfew` the lathe's first and last vertex columns (they coincide at the tunnel top) got different normals, so a thin
vertical line ran through each band at the top and the lip edge showed a small step there (visible at t66 when zoomed). The
seam normals are now welded (telescope path only). K7 BEFORE frames for step 8 were re-rendered with the fix
(`step8_pol/2_BEFORE_<shot>.png`); start view K6 vs fixed K7: 0 differing pixels.

## Step 8 — bright polished gold: K7 + `&m04rpol=1` (K7 = K6 + `&m04rfew=1&m04rfg=1.2`)
Measured on ring pixels: while swimming (f10 / f20 / t66) the rings were flatter than the painted ring area: luma p50 111,
p75 130, p95 165 against the painting's 120 / 148 / 195 (darks equal). The straightened textures match the painted inner-ring
pixels (the painted bright parts — lip lines, highlight streaks — shrink to a few pixels up close), so the fix is the polish,
not a recolour. What it does (painted-ring path, default off): the painted ring's own highlights lifted above a pivot
(`m04rpp` 0.42, gain `m04rpgh` 0.5; darks slightly deeper `m04rpgl` 0.15) and a sharp warm-white sheen that mirrors the bright
end of the tunnel and moves with the view (`m04rpsp` 0.25; grazing brightening `m04rpfr`, 0 by default).
After: f10 p50 123 / p75 149 / p95 186, t66 130 / 153 / 187, hard left 136 / 159 / 190.
Pictures: `step8_pol/2_BEFORE_<shot>.png` (K7 with the seam fix) and `step8_pol/3_NEW_<shot>.png`, 12 shots each; APPROVED
`1_APPROVED.png`. Clip (half size, real gameplay): `step8_pol/clip_NEW_swim.mp4`; BEFORE clip `step7_rfew/clip_NEW_swim.mp4`.
Checks: start view K7 vs K7 + `m04rpol=1`: **0 differing pixels** (`step8_pol/start_view_pixeldiff_BEFORE_vs_NEW.png`); coins
identical at all 12 shots; frame-by-frame clip check: no sparkle noise, seams or flicker.
Verdict: **GOOD IMPROVEMENT (moderate, ring look)** — the rings read as brighter, polished yellow-gold with strong warm
highlight streaks on every band, instead of a duller brownish copper; ring edges, grooves and light dots stay crisp.
Still different: (1) at f10 / t66 the top third of the frame is the near ring band seen from inside, one broad smooth copper
surface (the painting shows the big gold washer rim and the pink room there — lead note; next); (2) the nearest ring's
upper-left wall at hard left is a soft pink haze (painted ring 0's sheen).
