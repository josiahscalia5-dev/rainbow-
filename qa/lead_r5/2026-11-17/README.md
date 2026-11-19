# Lead round 5 (account 5) evidence — 2026-11-17 ~20:00–21:30 UTC

Everything the lead session `session_013VHsJ9SbWPe9YXRvtUSngc` measured or recorded, saved at the user's order ("save
everything"). Tools that made these files: `tools/lead_r5/` (+ `tools/lead_r4/rec_tour.mjs`, `assemble_tour.py`).

| Folder / file | What it is |
|---|---|
| `captures_approved_view/default_game/01–11.png` | NORMAL game (lead `ccr-f983b317-2vt0zh`, no switches) at each approved camera checkpoint (`scripts/capture.mjs`) |
| `captures_approved_view/newest_s04 … newest_s08b/` | newest finished version of 04–08 on its own branch (switches in `qa/screen_videos/2026-11-17/COMPARISON.md`) |
| `metrics_screen_match/*.json` | `tools/qa/screen_match.py` results vs the approved pictures (FULL / BELOWHUD / LAYOUT, within 20 levels) |
| `inspection_sheets/` | lead's visual-review sheets (approved / now / difference map; HUD strips; clip checks) — QA only, not for the user |
| `tour_clips/clip_01–11.mp4` + `_rec.json` | the 11 frame-exact clips of the all-screens video (one per screen, every frame; rec.json = game state per frame) |
| `flowplan_test_runs/run1, run2` | `flowplan-test.mjs` A + D FAILED (test-harness race: 2.5 s clip ended before the first read; 20 s clip fix `227f319e`) |
| `flowplan_test_runs/run3` | after the fix: A–E pass, E = 91 / 2,240 |
| `gameplay_default.json`, `gameplay_m08.json` | baseline gameplay 8/8, 91 coins, 1,330 → 2,240 (default and `match08=1&coins08px=1`) |
| `preview_verification/` | the combined preview branch `claude/rainbow-preview-all-c5`: continuity, gameplay default / all switches (before and after the coin fix), default captures, each screen with its own switches (`own04–08`), all switches (`all`, `all_fix`), recaptures, partial Screen 08 bisect captures (`bis_*`, interrupted by the user) |

## Results in one place
* Normal game vs approved (whole frame within 20 levels): 01 7.4 · 02 5.0 · 03 8.8 · 04 6.4 · 05 18.5 · 06 5.0 · 07 6.7 · 08 4.0 · 09 7.3 · 10 7.4 · 11 4.9 %.
* Newest test versions (own branch): 04 81.8 · 05 89.4 · 06 79.1 · 07 80.1 · 08 85.0 % (scenery alone 93.7–98.8 %).
* Preview branch, each screen with its OWN switches: 04 / 05 / 07 / 08 pixel-identical to their branches; 06 identical
  except 1,098 faint px inside the translucent top bar. Default game identical to the lead (01/10/11 = capture noise).
* Preview branch, ALL switches together (`match04=1&match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&match06=1&match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1&match08=1&coins08px=1`):
  coins fixed to 91 / 2,240 (`69a1d474`); likeness 04 81.8 · 05 83.0 · 06 84.3 · 07 74.4 · **08 29.5 %** — the switches
  interact: Screen 08's projected scene is shifted against the camera (cause NOT found yet — bisect interrupted), Screen
  05's Benny look turns on everywhere (07 Benny changed), the 05 top bar (hud05) helps 06/07/08 but not 04 (its approved
  bar layout differs). NOT usable as one build yet.
