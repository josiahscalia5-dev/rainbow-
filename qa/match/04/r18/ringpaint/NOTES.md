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
