# Screen 04 — round 12 (account 12 lead): verdict on the round-11 decisive test `&m04mv=1`

Test (account 11, `d3ea4200`): the user's PROVISIONAL views V04-1 (forward 10 u) / V04-2 (forward 20 u) camera-projected from
their own game cameras onto every mesh of the `match04_projection` group, blended by distance to each view camera
(full within 3 u, gone at 8 u). Query = K + `&m04mv=1`, K = `match04=1&m04ring=1&m04river=1&m04foam=1&m04bub=1&m04mouth=1&m04room=1`.
BEFORE = `qa/match/04/r11/BEFORE/` (+ `BEFORE_extra/` for f15/f25), NEW = `qa/match/04/r12/NEW_m04mv/` (14 shots, fresh render
2026-11-18 ~12:50 UTC, `tools/lead_r6/motion_audit.mjs`, EXTRA_SHOTS f15/f25).

## Verdict: NOT AN IMPROVEMENT (switch not kept)
* By eye at the two view cameras themselves (f10, f20): NEW looks like BEFORE — same white cotton-ball foam rows, same
  thin river with the big white V near the camera, same arrows far away. None of the painted content of V04-1 / V04-2
  (low foam clouds, thick swirling cyan/pink water, five glowing chevrons ahead of Benny) appears. Only V04-1's two
  top bubbles show on the upper tunnel wall.
* NEW adds a defect: a torn column of blocky gold patches at the top centre (f10, f20, f25) — the hole in the overlay where
  the painted coin trail was masked out.
* t66 / t95 / steering shots: no visible change (camera > 8 u from both view cameras).
* Why (measured with the probe's object list at cam10): the river, foam clouds, bubbles and water surfaces that fill the
  middle and bottom of the frame are drawn by objects outside / in front of the overlay (water_system foam banks, the
  animated river surface), so the projected view reaches only the upper tunnel wall, whose rings already looked like the view.
* Method assessment: a projection like this can only hold within a few units of each view camera; covering the ~120 u stage
  would need many more generated views (paid, each needing the user's approval) and still tears between them (f25 top).
  Recommendation: keep V04-1 / V04-2 as by-eye DESIGN REFERENCES for rebuilding the real 3D interior (round-10 finding:
  water channel filling the round floor up to low foam clouds, the five glowing chevrons, glossy gold), not as projected images.
* User-facing pictures: `/home/user/rainbow-/qa/review_c12/04_1_APPROVED.png`, `04_2_BEFORE_forward10u.png`,
  `04_3_NEW_m04mv_forward10u.png`, `04_2_BEFORE_forward20u.png`, `04_3_NEW_m04mv_forward20u.png`, `04_0_PROVISIONAL_V04-1_view.jpg`.

## User order 2026-11-18 ~13:30 UTC: "identify the exact rendering problem, fix it, ONE controlled test"
### Exact diagnosis (`tools/match04/diag04.mjs`, `qa/match/04/r12/diag_mv_r11/`): who draws every visible pixel with `K&m04mv=1`
Method: the real game frame re-rendered with one object group hidden at a time (camera layers; same state, uniforms, post
chain) → which pixels change; plus the overlay's own coverage in debug colours (depth test / image alpha / in frame).
| at the V04-1 camera (f10) | share of frame |
|---|---|
| overlay could supply (in frame, passes its per-view depth test, view image opaque) | 63 % |
| overlay actually controls the final pixel | 38 % (tunnel walls only) |
| game river `m04_river` wins over the overlay | 27 % |
| game foam-ball sprites `m04_foam` in front | 11.5 % |
| Benny 5 %, ring mouth 6 %, coins 1 %, bubbles 1 % | |
(f20 / V04-2: overlay 37 %, river 29 %, foam 10 %.) Causes, exactly:
1. **Depth-offset mismatch**: `m04_river` uses polygonOffset factor −2 / units −4; the overlay copy of the SAME mesh used −2 / −2 →
   every overlay fragment on the river was behind the river's depth → rejected. (No vertex displacement involved.)
2. **Foam sprites** (`m04_foam`, opaque billboards, renderOrder 3) are drawn in front and are not part of the views.
3. **Torn gold column** = the views' masked holes (painted coin trail / bubbles), where the bare game tunnel showed through.
4. **Calibration**: the audit's shots land 0.8–1.1 u past the views' cameras (the audit lets 2 real-time frames run before the
   screenshot). Fixed in the test tool: `EXACT=1` steps to the exact course position and draws without advancing → 0.00 u.
### Corrected controlled test `&m04mv2=1` (fixes 1–3; default and kept set untouched)
Overlay offset −4 / −8; game foam-ball + bubble sprites fade where a view is in charge; small holes filled from the
surrounding painted scenery (`tools/match04/mv04_fill.py` → `mv04_V04-*_fill.png`; the big painted-Benny area stays a soft hole).
Frames: `qa/match/04/r12/mv2_stage1/{BEFORE,NEW}/` (exact view cameras), `qa/match/04/r12/mv2_stage2/{BEFORE,NEW}/`.
| position | by eye vs the approved picture | verdict |
|---|---|---|
| exactly at V04-1 / V04-2 cameras | NEW = the views: glossy gold rings, five glowing chevrons stacked ahead, thick swirling cyan with pink-magenta bands, low foam, bubbles, no torn column. Game water shows as a blob around Benny (the hole). | GOOD at these two points |
| hard steering 12 u (2.7 u past V04-1) | foam walls gone, arrows + glossy rings + painted water; slight ghosting of the top ring arcs | closer |
| steering 6 u (4 u before V04-1) | arrows and glossier rings, ring edges near the mouth start to double | mixed |
| half-way between the views (5 u from each) | DOUBLE EXPOSURE: both views blend, rings doubled, water a blurry mush | NOT AN IMPROVEMENT |
**Overall verdict: NOT YET PROVEN** (works within ≈ 3 u of a view, fails between views) → no 12–14-shot audit (user rule).
**Why it fails between views**: V04-1 / V04-2 were painted over game frames, but the painting moved the geometry (water higher
and wider, arrows on a rising lane, rings closer). Projected pixels land in the right 3D place only from the camera that made
them; elsewhere they land on the wrong surfaces, and two views blended disagree → ghosts.
**Next specific test (free, local)**: rebuild the 04 interior geometry to match the painted views — Depth Anything 3 (already
installed/validated round 11, Apache-2.0 models) on V04-1 + V04-2 + the approved picture with their KNOWN game cameras →
fused depth → fit the water surface (height, width, rising centre lane) and ring radius → then the same projection
(08 method) lands consistently from both views, so the in-between ghosting should disappear.
