# Screen 07 · round 23 (water-fx-specialist) — progress log

## (r23) WHERE I STOPPED / NEXT
* DONE: step 1 `&m07satin=1` (painted satin ribbons + white flares on the magenta bands) — GOOD IMPROVEMENT (s1_satin/).
* Candidate query now: `K7c&m07satin=1` (`s1_satin/query_NEW.txt`).
* NOW (resumed after the container restart ~05:15 UTC): step 2 = lower the tall foam walls along the drop into low soft clouds
  (own switch `&m07low=1`: the drop's purple slotted wall comes down to the water just behind a narrow, low foam fringe).
* NEXT: step 3 = the middle (close purple wall), `&m07view=1` framing test only if scenery cannot get there.

Worktree `/home/user/wt/s07`, LOCAL branch `claude/rainbow-s07-match-c24` (= `8accdad0` + r22 WIP: r21 code + `m07cloud` + the
started `m07satin`). No commits, no pushes. Port 5277 (5280–5281 for parallel renders). VISUALS ONLY. Nothing is approved until
the user says so.

* APPROVED: `/home/user/rainbow-/qa/match/07/r21/APPROVED_07.png` (= `references/07_dive_the_washer_tube.png`)
* Candidate set at the start of r23, K7c = `K7&m07end=1&m07cloud=1` (`qa/match/07/r23/K7c.txt`).

## Step 0 — restore check (04:30 UTC): restore reproduces the saved r22 step-1 result
K7c rendered (9 shots incl. e1 0.75 / e2 0.92) into `s1_satin/BEFORE/` and compared full frame with `qa/match/07/r22/s1_cloud/NEW/`:
all 9 shots **0 px** (pixeldiff 0.1; `s1_satin/diffs/restore_*.png`).

## Step 1 — `&m07satin=1`: painted satin on the magenta bands (finished 05:05 UTC) — GOOD IMPROVEMENT

What was wrong: wherever the view comes close to a magenta band (hard left / right, the foreground of early / late / the drop) the band
was the band tile magnified into a soft blotchy pink smear (BEFORE `f_hard_left`, `g_hard_right`, `b_early`). The painting: glossy
satin — flowing light-pink / hot-pink / deep-magenta tone ribbons following the band's curve (3–4 light ribbons across the near
band) with bright pointed white flares (pink glow) riding the light ribbons.

Change (`src/world/match07.ts`, fragment shader `nearWater`, only with `&m07satin=1`, needs m07nearw + m07band; the r22 draft of this
switch — thin hairline streaks over a flat sheet, never reported — was reworked):
* `satinBase`: world-anchored tone ribbons across the band (period ≈ 0.3 u, at most ~4 across a wide band), meandering with the flow,
  stronger / calmer in places; colours = the painted band's measured tones (deep 181,25,152 → hot pink → light 246,107,242).
* `satinFlare`: pointed lens-shaped white flares with a soft pink glow on the light ribbons' crests (segment 0.8–1.8 u, ~60 % lit),
  a few small sparkles between them; anti-aliased (fwidth) and faded out where they get thinner than a few pixels.
* Procedural satin only where the band is magnified (≥ ~60 px per unit); farther away the band tile shows as before. Cost: a few
  ALU ops on the water fragments that are inside a band; no new textures, no draw calls.

Query NEW: `K7c&m07satin=1` (`s1_satin/query_NEW.txt`) · BEFORE: K7c (`K7c.txt`)

Pictures (separate, full size, real game, deterministic `tools/lead21/audit_screen.mjs` + e1 / e2):
* APPROVED `/home/user/rainbow-/qa/match/07/r21/APPROVED_07.png`
* BEFORE `/home/user/rainbow-/qa/match/07/r23/s1_satin/BEFORE/*.png` · NEW `/home/user/rainbow-/qa/match/07/r23/s1_satin/NEW/*.png`
  (a_start, b_early, c_middle, d_late, e1_075, e_end, e2_092, f_hard_left, g_hard_right)
* close-ups `s1_satin/crops/` (approved band left / right, BEFORE / NEW hard-right band, BEFORE / NEW early bands)
* clip (real gameplay, half size, from 0.03 of the stage, straight / left / right / straight, 3.6 s):
  `s1_satin/swim_level_NEW.mp4` vs `s1_satin/swim_level_BEFORE.mp4` (= r22 step-1 NEW clip)

Checks:
* Start view a_start **0 px** (rows 180–1536 and full frame). Deterministic capture K7c vs NEW (`proof_0px.json`): 07 start **0 px**,
  08 start **0 px**, 07d entering 08 **0 px** (07a / 07b / 07c differ = the bands down the drop, intended).
* Gameplay `K7c&m07satin=1`: **8/8 pass, 91 coins, 1,330 → 2,240**, plunge drop 61.14 u (`gameplay_new.json`).
  `npm run test:continuity`: ok, all joins gap 0, 07→08 drop 61.19 u — identical to r22 (`s1_satin/continuity.txt`). `tsc` clean.
* Code: `s1_satin/code.patch` (= full worktree diff vs `8accdad0`). QA tools now take `QA_PORT` (copies in `s1_satin/tools/`).

**Verdict: GOOD IMPROVEMENT** (moderate; visible at hard left / right and in the foreground all through 07 incl. the drop; nothing
at the start view).
* Hard left / right: the near magenta band is glossy satin — flowing light / dark pink ribbons following the band with long white
  flares — instead of a soft blotchy pink smear.
* Early / late / end: both bands read as the painted satin S-bands with white flares, like the painting's lower half.
* Still wrong (most visible first): (1) the drop: TALL white foam-cloud walls on both banks (next step); (2) the middle: the view faces
  a close purple wall with one gold ring; (3) seen edge-on from far right / left the flares look a little like thin needles (the
  painting sees the band from above).
