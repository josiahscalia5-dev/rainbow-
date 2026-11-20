# Account 10 — fresh evidence audit of the five playable screens (2026-11-18 ~10:20–10:55 UTC)

Read-only. Each screen's NEWEST branch (`-c9` tips) rendered in the real game (same WebGL build the Capacitor APK
wraps; headless Chromium, SwiftShader) with that screen's KEPT switch set. No code changed, no paid jobs.

| Screen | Branch @ commit | Kept query |
|---|---|---|
| 04 | `claude/rainbow-s04-match-c9` @ `05e383c9` | `match04=1&m04ring=1&m04river=1&m04foam=1&m04bub=1&m04mouth=1&m04room=1` |
| 05 | `claude/rainbow-s05-match-c9` @ `de233792` | `match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1` |
| 06 | `claude/rainbow-s06-match-c9` @ `efaf78b7` | `match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1` |
| 07 | `claude/rainbow-s07-match-c9` @ `dbc7678c` | `match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1&m07tube=1&m07ring=1` |
| 08 | `claude/rainbow-s08-scenery-c9` @ `c0d8c97b` | `match08=1&coins08px=1&m08bw=1&m08fill=1&m08arch=1&m08swim=1&m08seam=1&m08sill=1&m08towel=1` |

Files: `<NN>_1_APPROVED` (the user's picture), `_2_GAME_start_painted_viewpoint` (`scripts/capture.mjs <NN> --q=…`, frozen),
`_3/_4/_5` = 33 / 66 / 95 % through the stage (`tools/lead_r6/motion_audit.mjs`). `all_shots/<NN>/motion.json` = positions.

## Measured at the painted viewpoint (`tools/qa/screen_match.py`, whole frame within 20 levels / below HUD / LAYOUT)
04 81.4 / 89.5 / 90.8 % · 05 88.5 / 91.6 / 95.9 % · 06 79.0 / 85.6 / 86.2 % · 07 79.9 / 86.7 / 87.8 % · 08 84.1 / 91.0 / 93.0 %
(= the round-6 numbers: nothing regressed, nothing reached 95 % of the whole frame.)

## Measured while swimming (`tools/lead_r6/motion_metrics.py` PALETTE = do the approved colours / materials survive)
| Screen | fwd 3 u | fwd 10 u | 1/3 | 2/3 | end | hard steer R |
|---|---|---|---|---|---|---|
| 04 | 77.9 | 64.6 | 66.7 | 69.4 | 62.3 | 61.5 |
| 05 | 88.4 | 84.6 | 85.0 | 79.4 | 56.2 | 76.2 |
| 06 | 71.2 | 68.1 | 69.6 | 65.7 | 64.7 | 67.1 |
| 07 | 84.2 | 76.8 | 76.4 | 69.6 | 50.3 | 70.5 |
| 08 | 78.5 | 71.4 | 77.5 | 71.2 | 71.5 | 69.1 |
LAYOUT20 while moving falls to 1–28 % on every screen (expected once the viewpoint moves; not a likeness score by itself).

## Lead's visual judgement (subjective, from looking at the frames)
* 08 — closest: chamber, porthole, towel platform, spout cups, S-river kept through the stage; foreground gold arch mostly
  gone, near water smeared, coins oversized. ≈ 7–7.5/10 while swimming.
* 05 — tunnel, rings, paddles right for 2/3 of the stage; river torn / smeared; last third falls back to the old generic
  world (white foam walls, flat pink). ≈ 6.5/10 mid-stage, ≈ 2.5/10 at the end.
* 04 — washer opening only at the start; then a long orange ring corridor with rows of white foam balls. ≈ 3.5/10.
* 06 — centred ring bullseye + straight ribbon instead of the off-centre bent tunnel and S-loop. ≈ 4.5/10.
* 07 — level stretch fair at the start; one third in the tube wall / plunge fills the frame, river cut off. ≈ 3.5/10.
