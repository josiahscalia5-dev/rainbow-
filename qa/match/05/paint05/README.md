# Screen 05 (+ the 05 → 06 → 07 journey) — approved-artwork chain `?paint=1` (round 31, 2026-11-21, branch `ccr-4fcad20e-a6pp8w`)

**User order (2026-11-21, verbatim excerpt):** "continue using the approved-artwork method from Screen 06 for my remaining playable screens … 1. Screen 05 …
95–98% visual likeness … Keep my original approved Benny … scenery must remain visually consistent while Benny swims forward, steers … Keep the game genuinely
playable … Fix visible seams, double images, ghosting, abrupt picture changes, and duplicate characters. Make collected coins disappear correctly … Make Screen
05 → 06 → 07 look and feel like one continuous journey … Do not claim a 98% match just because individual pictures match pixel-for-pixel … Show me APPROVED /
BEFORE / NEW comparisons and uninterrupted gameplay recordings for each completed screen … If this artwork method cannot meet these requirements, tell me exactly why."

## How to see it
`/?paint=1` (default build unchanged; `?paint06=1` = the earlier 06-only candidate, unchanged). QA checkpoints `05k0` (= `05` crest), `06k0`..`06k4`, `05p_in`.
Option `&paintpush=1` = the earlier gentle forward zoom (looks livelier, measures far lower — see below); `&paintpan=1` = scenery shifts when steering.

## What it is (src/world/paint.ts; assets/textures/paint/; tools/paint/)
* One chain of the user's pictures in route order: approved 05 → approved 06 → storyboard panels 1–4 → (3D Screen 07). Each picture = full-screen plate (its own
  pixels, SeedVR detail back-projected so it equals the original at its own size; the painted HUD, Benny and collectible coins taken out; margins continued).
* Scenery holds still; the painted water FLOWS toward the viewer inside the river (two-phase flow of the picture's own water, mask from EVF-SAM).
* Benny = each picture's own painted Benny (steers ±, leans, bobs); the 3D Benny is hidden while he shows — 0 frames with two Bennys in every recording.
* Coins: every collectible painted coin IS a game coin (game coin list re-timed on 05 / 06 under the switch): it starts on its painted spot, flows down the painted
  river, pops up from Benny's pom-pom and disappears when collected; a missed coin passes visibly beside him and fades. 05: 10 coins (7 painted + 3 before the
  crest); 06: 3 per picture (the far tiny painted coins stay scenery). Extra game coins of these stages are removed (never shown, never counted).
* Joins: Screen 04 (3D) → 05 picture, picture → picture, 06 panel 4 → Screen 07 (3D): the next view opens from the tunnel end (soft circle, ~0.4–1 s).

## Results (proof/)
Stills (full size, `proof/CMP_*.jpg` = APPROVED | BEFORE | NEW; QA clock pinned, so the water-flow phase is neutral): pixel match / look match to the approved picture
| moment | BEFORE (game today) | NEW |
|---|---|---|
| 05 start (crest) | 8.7 / 9.5 % | 95.0 / 95.7 % |
| 05 swimming +1.6 s | 5.7 / 6.3 % | 93.7 / 93.8 % |
| 05 swimming +3.4 s | 5.6 / 5.6 % | 93.8 / 93.8 % |
| 06 start | 1.2 / 1.3 % | 95.9 / 97.7 % |
| 06 panel 1–4 (inside the panel) | 1.0–2.1 % | 85.3–91.1 / 96.2–97.5 % |
(panels are only 491 px wide: the strict pixel figure counts the game's added sharpness as difference; at the panel's own size 94.5–97.2 %.)

EVERY frame of uninterrupted gameplay (`proof/NEW_04_05_06_07_*.mp4`, 30 fps, flowing water, moving coins, bobbing Benny; `clip/*_metric.json`), median (min):
| | 05 | 06 approved | 06 panels 1–4 |
|---|---|---|---|
| BEFORE straight (3D game) | 5.2 % px | 1.0 % | 0.8–2.2 % |
| NEW straight — pixel | 82.0 % (70.3) | 85.2 % (46.6) | 74.8–80.2 % (23–58) |
| NEW straight — look | 92.7 % (80.7) | 95.3 % (51.6) | 92.2–94.4 % (29–71) |
| NEW steering — pixel / look | 75.9 / 83.7 % | 78.6 / 85.2 % | 55.9–67.6 / 64.6–75.5 % |
| NEW with the forward zoom (`&paintpush=1&paintpan=1`) straight — pixel / look | 40.9 / 53.5 % | 32.2 / 44.7 % | 43–53 / 61–72 % |
Gameplay checks (all four NEW recordings): continuous travel (max step 0.47 u = normal speed, no jump), 0 frames with two Bennys, coins 1,330 → 1,600 straight (every
coin collected and popped) / 1,500 steering (missed coins pass beside him), hearts lost only when steering into the foam wall.

## Why not 95–98 % in every frame (honest)
* Anything that moves changes pixels: flowing water (≈ 35 % of the screen), coins, Benny's bob. That is the gap between ~93 % (stills) and ~82 % (every frame).
* Steering moves Benny off his painted spot (the river behind him is the erased, continued water) → 76 % / 84 %.
* The low minimums are the ~1 s reveals between pictures (two pictures meet in a soft circle).
* A real forward journey (the tunnel coming toward you) changes the whole picture every frame: with the gentle zoom the same art measures only ~41 % / 54 %.
  So with ONE approved picture per screen the method can keep the approved look throughout only if the scenery holds still while water, coins and Benny move.
* Screen 07 is still the 3D tube (its own picture is next in the order).
