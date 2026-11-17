# Screen 05 HUD (`hud05`): animation-and-gameplay-engineer, CHECKPOINT NOTES (work in progress)

Status at checkpoint (2026-11-17 ~00:50 UTC): HUD code is written and typechecks (`npx tsc --noEmit` clean). It has
NOT been measured in a real game capture yet. The default build is untouched: every change is behind
`on05('hud05')` (true for `?hud05=1` or `?match05=1`).

## Files changed / created
| file | what | gated? |
|---|---|---|
| `src/ui/hud.ts` | `HUD05 = on05('hud05')`; adds class `m05` on `#hud`, appends `CSS05()` rules (`#hud.m05 …`) and, only when HUD05, a different bar markup (capsule `.pill05`, dividers `.div05`, icon `<img>` sprites, live `data-k="hearts"` / `data-k="coins"` spans, `.pbtn.p05` pause button keeps `data-k="pause"` + the click handler). Default CSS string and default markup are unchanged (same text). Tunables are in `H05` (bar box, number font size/weight/left/top, banner centre/top/height/min-width/font size/skew). | yes |
| `assets/textures/hud05/{heart05,plus05,coin05,pause05}.png` + `hud05_icons.json` | static icon sprites cut from the approved picture (feathered rect/circle crops) | only loaded when HUD05 |
| `qa/pilot05/full_reference_match/hud/icon_bake.py` | makes the sprites (`python3 -I qa/pilot05/full_reference_match/hud/icon_bake.py`) | tool |
| `qa/pilot05/full_reference_match/hud/probe05.mjs` | real game probe: locked 05 frame (= capture.mjs), screenshots with and without the HUD, HUD rects, coinScreen, camera, coin (s, lat) solver `--solve=targets.json` | tool |
| `qa/pilot05/full_reference_match/hud/harness.html` + `harness.mjs` | HUD-only harness: the real hud.ts over `harness_bg_stack_nohud.png` (no-HUD STACK capture of the same frame), no WebGL, no render slot; for fast CSS tuning only. Final numbers must come from real captures. | tool |

The counter is still live: `setCoins(n)` writes `n.toLocaleString('en-US')` into `data-k="coins"`; 1,420 comes from
`course.stage('05').refCoins` at the checkpoint (Game.ts, unchanged). Nothing is hard-coded.

## Measured: approved vs game (STACK capture `stack_2340/05_match05.png` = my probe `p1/stack.png`, 0 px differ)
All values in frame px (864 × 1536).
| element | approved | game today (STACK) | difference |
|---|---|---|---|
| bar outer box | x 33–825, y 13–100 (h 87), full-round ends r ≈ 43 | x 35.3–828.7, y 17.7–108.2 (h 90.5), r 43 | game 4–8 px low, 3.5 px taller |
| bar fill | flat opaque purple, mean (86–92, 2, 125–129), std ≈ 5 | translucent (150, 55, 170) ± lots, tunnel shows through | ~50 levels per pixel: the main HUD error |
| bar rim | 2–4 px light line top (255,186,255 at y 14) and bottom (246,193,255 at y 98) | 3.4 px rgba(255,220,255,.55) border + outer shadow | |
| heart-section capsule | own glassy lavender outline x 33–331 | none | missing |
| divider 1 / 2 | x 344 / 707, y 27–86, ~2 px lavender (≈ 130, 40, 162 over the fill) | x 363 / 716, full height, 1.8 px white .25 | 19 / 9 px off |
| heart | bbox x 68–145, y 27–88 (77 × 61), wide glossy pink-red | icon box 72–134 × 32–94, drawn heart ≈ 54 × 50 | smaller, narrower, lower |
| "5/5" | digits x 165–235, y 36–68 (33 px tall), slash 33–73 | x 154–210, y 49–75 (27 px) | game 13 px low, 18 % smaller |
| plus | x 261–302, y 35–68 (41 × 34), thick rounded white/lavender | glyph x 243–267, y 49–74 | far smaller, lower |
| coin icon | circle centre (419.5, 57), Ø ≈ 82 × 80, beaded gold rim, embossed $ | Ø 55.7, centre ≈ (470, 63) | 50 px right, 26 px smaller |
| counter "1,420" | x 498–617, digits y 36–68 (33 px) | x 538–636, y 49–74 (26 px) | 40 px right, 13 px low, smaller |
| pause button | white ring x 730–819, y 17–97 (slightly oval), dark purple glass inside; bars x 756–766 and 780–790, y 36–73 | ring Ø 78.6 at 731–810 × 24–102; bars 754–765 / 775–786, y 48–77 | game ring smaller and lower, bars shorter |
| banner box | x 120–746, y 113–181 (626 × 68), full round, cream-white + gold rim ~3 px | x 123–741, y 116–185 (618 × 69) | 3–4 px low |
| banner fill | (94–105, 3, 136–146) | (122–80, 43–20, 176–137) gradient | lighter |
| banner text | x 148–722 (574 px), caps y 133–159 (26–27 px), cream → gold, dark outline | x 175–692 (518 px), caps 138–160 (23 px) | game text 10 % narrower, 15 % shorter, 4 px low |

Region numbers BEFORE (STACK, `python3 -I tools/match05/metrics.py`): HUD + text 125,488 px, mean |ΔRGB| 62.2,
within 20 levels 13 %; whole frame 34.1 / 51.6 %.

## Design of the change (hud05)
* Bar: opaque flat purple gradient (97,3,141 → 86,2,124), 2 px rim rgb(238,180,252) + inset glow; box x 33–825, y 13–100.
* Capsule outline x 33–331, dividers at x 343 / 706 (2 px, y 27–86).
* Icons: approved sprites at their measured boxes (heart 60,21 94×74; plus 254,28 56×49; coin 375,13 90×89; pause 727,9 96×96).
* Numbers: Baloo 2 800, 51.6 px (target digit height 33 px), left at x 165 (hearts) and 498 (counter), `top` tunable.
* Banner: centre x 433, y 113, h 68, min-width 626, 2.5 px cream rim + 1 px inner gold line, fill (99,3,147 → 94,3,140); text
  Baloo 2 800 italic + skewX(−8°), 44 px, cream → gold gradient, dark drop shadow. Only font in the project: Baloo 2
  (400–800, no real italic: the browser slants it synthetically).

## In progress right now
Running the HUD harness (default vs hud05) to measure glyph boxes and tune `H05.num.top`, `H05.num.size`,
`H05.banner.size/track/skew` against the approved glyph boxes above.

## Remaining, step by step
1. Harness: `node qa/pilot05/full_reference_match/hud/harness.mjs --out=/tmp/…/h.png` (hud05) and `--q=x=1` (default);
   measure with `/tmp/claude-0/hc05/hudmeasure.py` logic (colour boxes: white digits in bar, cream banner glyphs) and the
   HUD-mask metric; tune H05 numbers/banner until glyph boxes match the table; keep only what lowers the HUD-region error.
2. Real captures (one at a time): `node qa/pilot05/full_reference_match/hud/probe05.mjs --out=DIR before='<STACK>' new='<STACK>&hud05=1'`
   → copy to `hud/before.png`, `hud/new.png`; `python3 -I tools/match05/metrics.py hud/new.png hud/new_` (and before).
3. Default identity: `node scripts/capture.mjs 05 --out=<scratch>` must equal `qa/pilot05/current_default_05.png` (0 px);
   then `git checkout -q qa/capture_log.json` (allowed by COORDINATION rule 1).
4. Other screens with the switch on: capture 04 and 06 with `hud05=1` vs without; describe (global layout change).
5. Fill this file's final tables (approved | game | difference | cause | change | measured result).

## REQUESTS
None so far.
