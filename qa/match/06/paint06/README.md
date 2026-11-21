# Screen 06 — `?paint06=1`: the user's OWN pictures as the scenery (round 31, 2026-11-21, session branch `ccr-4fcad20e-a6pp8w`)

**User decision (2026-11-21 ~00:05 UTC, verbatim):** "Yes, do Screen 06 first … I want these exact. See these all these four images? I want exactly
those. Okay, 100%, or at least 95%." + "add any plugin or anything you need. I don't care how much it costs." (paid fal jobs authorised; ledger below).
This replaces the earlier rule "never paste the approved picture over the screen" FOR THIS TEST ONLY, on the user's explicit yes.
Targets: `references/06_crest_the_rinse_arch.png` (k0) + the four storyboard panels of `docs/briefs/2026-11-20-r30/USER_S06_STORYBOARD_R30.png` (k1..k4).

## How to see it
`/?paint06=1` (dev server) — play normally; Screen 06 shows the five pictures in order. QA checkpoints: `06p0` (= `06`, approved picture), `06p1`..`06p4`
(the four panels), `06p_in` (8 u before 06). Default build (switch off) = **pixel-identical** to before for 05 / 06 / 07 (verified 2026-11-21 ~00:45,
same checkout with / without the change, fonts served from a real node_modules copy).

## What it is (src/world/paint06.ts, hooks in src/game/Game.ts — all behind the switch)
* Five full-screen plates (1440×2400 = the 864×1536 frame ×1.25 + margins). Inside each panel's own window (registered onto the approved frame through the
  painted Benny every panel shares: SIFT, ≤1.6 px median error, `work/register.json`) the plate IS the panel: SeedVR2 ×4 detail, back-projected so its
  downscale equals the panel. Outside the panel (a phone frame is taller than a panel) + under Benny: fal flux-pro fill continuation, invented coins
  auto-detected and erased (bria eraser), colour-matched to the panel edge (no seam), panel edge pixels dropped (they mix with the sheet's white gutter).
* Each plate sits on a depth grid (Depth Anything v2): at its rest moment the view is the picture exactly; as Benny swims the view pushes toward that
  picture's tunnel end (near water grows faster than the far tunnel = real parallax).
* Benny = that picture's own painted Benny pixels (BiRefNet matte + splash ring) as a layer: steers left/right (60 px per unit), leans, bobs 2.5 px
  (zero at whole seconds). The 3D Benny is hidden while the painted one shows.
* Picture → picture: the next picture opens from its tunnel's far end as a growing circle with a soft 150 px edge (~0.95 s); no full-frame double image.
  05 → 06 and 06 → 07 joins: the same reveal between the live 3D game and the pictures.
* Speed through 06 × 0.33 (11 → 3.6 u/s): 06 lasts ~16 s instead of ~5 s, ~3 s per picture. Coins: the painted coins are scenery; the game's own
  (hidden) coins still count in the HUD as Benny passes them. Hearts / foam-wall bumps unchanged.
* Colours: raw bytes in → raw bytes out (no tone mapping, no grade, no bloom on the pictures).

## Numbers (live game captures, `shots/metrics.json`; pixels within 20 colour levels, the project's usual measure)
| moment | vs | result |
|---|---|---|
| k0 (`06p0`) | approved Screen 06 | 97.9 % below the HUD strip (the live HUD covers the painted one; whole frame 88.7 %) |
| k1 (`06p1`) | panel 1 | 97.7 % at the panel's own size |
| k2 (`06p2`) | panel 2 | 98.2 % |
| k3 (`06p3`) | panel 3 | 97.9 % |
| k4 (`06p4`) | panel 4 | 98.3 % |
"At the panel's own size" = the game frame downscaled onto the panel (the panels are only 491 px wide; at phone size the game is sharper than the
panel, so a bigger-size comparison would count added sharpness as difference). The panel covers 56–60 % of the phone screen; the rest is continuation.

## Proof (`proof/`)
`0_APPROVED06_vs_GAME.jpg`, `1..4_PANELk_vs_GAME.jpg` (your picture | game, full size), `SCREEN06_paint06_straight_1x.mp4` (one uninterrupted run
05 → all of 06 → into 07, 30 fps), `SCREEN06_paint06_steer_1x.mp4` (same with left/right steering).

## Honest differences
* Outside each panel's own area (the top ~17 % and bottom ~18 % of the phone screen, thin side strips) the scenery is a continuation in the same style,
  not the user's pixels (k0 = the approved picture covers the whole frame).
* Between the rest moments the picture is pushed forward (sharper near water, slight stretching at strong depth edges); the reveal edge mixes two
  pictures for under a second per change.
* The painted coins are not collected visually (no pop); the HUD counts the game's own coins.
* The 05 → 06 and 06 → 07 joins reveal the 3D Screens 05 / 07 as they are now (their own work is separate).

## Rebuild
`tools/paint06/`: `register_panels.py` → `step2_upscale_matte.py` (fal) → `step3_plates.py prep|fill|erase|up|comp 0 1 2 3 4` (fal for fill/erase/up)
→ fal depth (see LEDGER) → `step4_export.py` → `assets/textures/paint06/`. Captures: `node scripts/capture.mjs 06p0 06p1 06p2 06p3 06p4 --q=paint06=1
--out=qa/match/06/paint06/shots`, `python3 -I tools/paint06/measure.py qa/match/06/paint06/shots`, clips `node tools/paint06/clip.mjs [--weave]`.
Paid jobs: `LEDGER.md` (31 fal jobs, ≈ US$1.76 estimated).
