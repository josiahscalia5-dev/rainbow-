# Screen 04 — painted-ring test `&m04rpaint` (round 16, continues the cut-off round-15 worker)

Brief: `docs/briefs/2026-11-18-r15/S04B_RINGTEX_LAUNCH.md` + round-16 changes (`docs/briefs/2026-11-18-r16/RESUME_R16.md` "s04tex").
Branch `claude/rainbow-s04-ringtex-c16` (from `fc28323a`). History of earlier Screen 04 rounds: `qa/match/04/r15/` and older.

BEFORE query = kept L4 (`docs/briefs/2026-11-18-r15/S04_LAUNCH.md` "Kept set now"); BEFORE frames = `qa/match/04/r14/s11_rimfoam/L4/`
(same build: this branch only adds code that is off by default). NEW = L4 + the switch named below.

## What the switch does
* `tools/match04/ring_paint04.py` (round-15 worker, unchanged here) straightens ONE painted inner ring of the approved picture
  (`plate04_hybrid.png`: Benny / coins filled) into `assets/textures/match04/tile_ring_paint.png` — columns = angle around the tunnel
  (0 = top, + = right), rows = position inside the painted ring (groove -> broad band -> bright lip line at 0.79 -> next groove).
  Bubbles masked and filled from neighbouring angles; the under-water half mirrored from the upper walls. `tile_ring_paint_soft.png`
  = the same with the long light columns softened away from the lip line (`&m04rpsoft=1`).
* `src/world/match04m4.ts` GOLD_FRAG, only with `&m04rpaint=k` (default 0 = unchanged): on every inner ring (not the opening) the band,
  lip and groove take the painted colour at (angle, position inside the 4.6 u ring period) — painted lip line on the modeled lip
  apex, painted groove on the modeled groove; gentle modeled shading (`m04rpsh`, default 0.15) and the moving polished sheen stay;
  the procedural gold ramp, streaks, star glints, lip bulbs and pink-violet tint are replaced. World-anchored (texture coordinates
  from the ring's own angle / depth), so nothing slides while swimming. Sub-switches: `m04rpsoft=1` (soft texture), `m04rpj=x`
  (per-ring random angle offset, radians), `m04rplu`, `m04rpgu`, `m04rpsl` (lip / groove placement).

## Step 1 — first in-game proof, `&m04rpaint=1` (19:16–19:35 UTC)
Pictures (full size, separate files): `1_APPROVED.png`, `2_BEFORE_<shot>.png`, `3_NEW_<shot>.png` for a00 start, f03 entering,
f06 / f10 middle, f20 farther inside, t66 through, t95 end, s_left_hard, s_right_hard. Textures for reference:
`texture_OLD_tile_ring.png` (the old plaid strip) and `texture_NEW_tile_ring_paint.png`. Clip: `clip_BEFORE_swim.mp4`,
`clip_NEW_swim_m04rpaint1.mp4` (3.6 s, straight / left / right / straight). Motion log `new_rp1/motion.json`.

Minimal checks: approved start view unchanged — `scripts/capture.mjs 04` (time frozen) BEFORE vs NEW, Pixelmatch rows 180–1536:
**0 differing pixels** (`start_view_pixeldiff_BEFORE_vs_NEW.png`). Coins, Benny, water, HUD untouched (no code outside the ring
shader path). `references/*` sha256 OK.

Visual verdict: **NOT YET PROVEN** (closer in one way, worse in another).
* Closer: the inner rings are now broad, smooth, rounded copper-gold bands with soft pink-violet patches, like the painted rings; the
  busy plaid of thin bright cuts, white star glints and amber dots on every lip is gone.
* Worse / still wrong: (1) the painted light columns sit at the same angle on every ring, so ring after ring they line up into long
  bright STREAKS running down the tunnel (top and upper right, very visible at f20 / t66 / hard left) — exactly the lead's concern;
  (2) the rings lose their edges: the painted thin bright lip line and dark groove are too faint at game distance, so the interior
  reads as one smooth striped tube instead of a telescope of separate thick rings; (3) the gold is a little deeper orange-red than
  the painting's warm yellow-gold highlights.
* Lead's concern (2), the pale V-smear near the bottom rows: not visible as a repeated mark in these frames (it falls under the
  light columns at upper right); re-check after the streak fix.

Next (polish, one factor at a time): per-ring angle offset + soft texture (`&m04rpsoft=1&m04rpj=0.35`, the round-15 worker's
variant) against the streaks; then stronger painted lip line / groove so each ring reads as a separate thick ring.

## Step 2 — `&m04rpaint=1&m04rpsoft=1&m04rpj=0.35` (soft light columns + per-ring angle offset), 19:30–19:40 UTC
Pictures `step2_softj/3_NEW_<shot>.png` for f06, f20, t66, s_left_hard (BEFORE = `2_BEFORE_<shot>.png` one folder up; step-1 NEW =
`3_NEW_<shot>.png`). Rendered on four shots only (CPU shared by six workers): the shots where the streaks were clearest.
Verdict: **NOT YET PROVEN** — the long streaks down the tunnel are gone (each ring now has its own short glows at different
angles), but the rings still do not read as separate thick rings: no clear dark groove / bright lip line between them.
Cause found (geometry check): the modeled ring is a long, nearly cylindrical band + a lip bead; looking down the tunnel the lip
of each ring hides the start of the next band (at 20 u ahead about half of it), and the painted texture placed its lip line on the
lip apex and its dark groove rows on the hidden back of the lip and the hidden band start -> the painted edges were never seen.
Next = step 3: painted lip line on the start of the lip FRONT, painted darker strip + dark groove on the lip front ending at the
apex silhouette (`&m04rplu=3.95&m04rpgu=4.28`, existing sub-switches, no new code).

## Step 3 — painted lip line + groove on the visible lip front: `&m04rpaint=1&m04rpsoft=1&m04rpj=0.35&m04rplu=3.95&m04rpgu=4.28`
(19:42–20:00 UTC). Full set `step3_lip/3_NEW_<shot>.png` (a00, f03, f06, f10, f20, t66, t95, s_left_hard, s_right_hard; BEFORE =
`2_BEFORE_<shot>.png` one folder up). Approved start view unchanged: frozen capture BEFORE vs this query, rows 180–1536,
**0 differing pixels** (`step3_lip/start_view_pixeldiff_BEFORE_vs_NEW.png`). Clip (half size 432×768, same framing, CPU):
`step3_lip/clip_BEFORE_swim.mp4`, `step3_lip/clip_NEW_swim.mp4` (added when rendered).
Placement: painted row s 0.79 (bright lip line) at 3.95 u inside the 4.6 u period = where the lip bead starts to curve inward;
painted rows 0.79 -> 1 (lip line, darker copper strip, dark groove) over the lip front, the dark groove at the lip apex = the inner
edge every ring shows to the camera; beyond the apex (hidden back of the lip) held dark.
Verdict: **GOOD IMPROVEMENT (rings' shape and surface)** — the interior is again a telescope of separate THICK rounded rings: broad,
smooth, polished copper-gold bands, each ending in a dark groove line with small glows on the lip, like the painted rings; no plaid
of thin bright cuts, no white star glints, no long streaks down the tunnel. Lead's V-smear concern: no repeated mark seen.
Most visible remaining difference: COLOUR — the game rings are a uniform deeper copper-orange everywhere, whereas the painting's
rings turn brighter, warmer YELLOW-gold toward the glowing centre and carry more pink-violet on the lower-left walls; the painted
bright lip line is softer than in the painting.

Step-3 clips added (19:43): `step3_lip/clip_BEFORE_swim.mp4`, `step3_lip/clip_NEW_swim.mp4` (432×768, 3.6 s straight / left / right /
straight, real gameplay; rendered at half size because a full-size clip took ~45 min at the current machine load).

## Step 4 — warmer yellow-gold toward the glowing centre: step 3 + `&m04rwarm=1` (new code, off by default), 19:45–20:05 UTC
Measured on the approved picture (band median per painted ring, upper walls): the painted rings keep the SAME copper
(≈ RGB 175–195 / 75–85 / 40–50) from the opening down to ~100 px from the vanishing point; only the last rings inside ~80 px turn
orange -> yellow -> warm white (R 48 px: 234/118/86, R 24 px: 253/202/123). `m04rwarm` multiplies the painted ring colour by these
measured gains over the last part of the camera -> end-glow distance (`m04rww`, default 0.45). (A first version graded by screen
distance from the vanishing point; same result.) Pictures `step4_warm/3_NEW_<shot>.png` for f06, f20, t66, t95.
Verdict: **NOT AN IMPROVEMENT** (no visible change) — the game tunnel is 90 u long, so the rings that fall in the painting's warm
zone are tiny around the end glow; at the distances seen while swimming, the painted rings are the same copper as step 3 already.
A zoom on the centre (approved vs step 3) shows that the real difference there is the many small bright orange-yellow LIGHT DOTS on
every painted ring lip (and a pinker sheen), which the painted-ring switch removed with the procedural lip bulbs. Not kept.
Next = step 5: painted-style light dots on the lips (separate factor).
