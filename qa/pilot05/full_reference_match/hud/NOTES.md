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

## UPDATE after checkpoint (run stopped for the account transfer, ~01:05 UTC)
Harness tuning is DONE (HUD-only harness, i.e. the real hud.ts over the no-HUD STACK capture; NOT yet a real game capture).
The harness composite with the default HUD gives exactly the real STACK HUD number (62.23), so the harness is faithful.
HUD-region numbers in the harness (mask `hud_and_text`, 125,488 px; mean |ΔRGB|, share within 20 levels):
| step | HUD mean | ≤20 | bar part | banner part | whole frame |
|---|---:|---:|---:|---:|---:|
| default HUD (= STACK) | 62.23 | 13.3 % | 64.57 | 58.60 | 34.10 |
| hud05 first layout (Baloo 800, 1-px border bug) | 32.75 | 58.7 % | 30.01 | 37.00 | 31.31 |
| + digits 53 px / top 28.5, banner padding 12 | 27.56 | 64.3 % | 21.91 | 36.32 | 30.82 |
| + numbers weight 700, x/y aligned to approved glyphs | 27.02 | | 21.03 | 36.32 | |
| + banner weight 700, skew −4° | 26.65 | 64.9 % | 20.96 | 35.48 | 30.74 |
| + bar rim glow (top 3 px + 8 px inset glow), per-side rim colours, bar drop shadow | 25.00 | 65.7 % | 18.22 | 35.51 | 30.58 |
| + flatter banner text colour (measured approved fill ≈ (248, 216, 168)) | 24.88 | | 18.22 | 35.21 | |
| + banner text dy 0 (FINAL in hud.ts now) | **24.76** | | 18.22 | 34.91 | ≈30.6 |
Tried and REJECTED (worse, measured): Baloo 600 (banner 38.10, numbers 19.75 bar), −webkit-text-stroke 1.5 px (36.64),
banner size 43/45 with tracking ±0.4 (36.31 / 37.84), no italic + skew −12° (43.50), bar without drop shadow (19.24).
The 600 weight import was removed again (no extra font load).

Glyph boxes now (harness) vs approved: "5" 165–187 × 36–68 (approved 165–187 × 36–68, exact); counter "1" 498–513 ×
36–67 (approved 498–511 × 36–68), counter end x 617 (approved 617); banner text x 150–735 incl. rim pixels, first glyph
"0" 150–174 × 132–158 (approved 148–171 × 133–159): Baloo 2 700 strokes are heavier / wider than the approved lettering,
the remaining banner error is mostly glyph-shape edges (font limit: only Baloo 2 is in the project).
Remaining error split (harness, before the last two steps): scene pixels outside the pill shapes but inside the HUD mask
rectangles = 29 % of the HUD error (bar corners 62.3, banner corners 62.1; that is the 3D scene, not the HUD); bar
pill interior 15.9; banner pill 31.0 (rim 59.8, text edges 41.6, fill 24.7).

Current tunables in `src/ui/hud.ts` (`H05`): bar x0 33 y0 13 x1 825 y1 100 border 2 shadow on; num size 53 weight 700
hX 162 cX 497.5 top 26.5; banner cx 433 y0 113 h 68 minW 626 size 44 weight 700 skew −4 italic dy 0 stroke 0.
`npx tsc --noEmit` clean after the last edit.

## RUN #3 (session 01Q46SCH, 2026-11-17 ~01:20 UTC) — progress
* `probe05.mjs` still runs (edited in the 01:00 run: `--vis` coin visibility; extended now with occlusion-aware coin
  solving, see coins/NOTES.md). First REAL capture of hud05 (`STACK&hud05=1&coins05=1`, probe /tmp/claude-0/hc05/r3/p2):
  HUD + text 24.76 / 65.6 % = exactly the harness number (harness vs real capture: max 2 levels in the HUD mask).
* New tool `hud/hud_split.py`: splits the HUD error into icons / numbers / bar rim / bar fill / banner text / rim / fill /
  outside (HUD-mask pixels outside both pills). At 24.76: outside 58.7 (31 % of the HUD error), banner text 31.2 (25 %),
  banner rim 51.7 (11 %), bar fill 10.2 (9 %), bar rim 41.9 (7 %), numbers 31.8 / 34.0 (10 %), icons 1–7.
* `harness.mjs --css=FILE`: trial CSS appended in the harness page only (trial values never touch hud.ts / other
  agents' captures). Measured trials (HUD mask mean, harness):
  | step | HUD mean | ≤20 | what |
  |---|---:|---:|---|
  | start (= real capture) | 24.76 | 65.6 % | |
  | + dark halo round both pills (approved: light pink 0–2 px, dark purple (139–147, 25–32, 114–118) 3–6 px, gone by 8 px) | 22.29 | 67.0 % | a1 → a8 (a4 single dark ring 22.99; a8 light + dark ring best) |
  | + banner rim from measured rows (1-px border + inset bands; pill 69 px tall: approved 113–181) | 20.43 | 70.1 % | banner rim 51.7 → 20.7 |
  | + bar rim from measured rows (1-px border + 9 top / 5 bottom bands, fill gradient by row) | 19.68 | 70.7 % | bar rim 41.9 → 29.1 |
  | + digits: lavender-white gradient fill (approved (250,235,250), pink bottom (246,200,245)) | 19.56 | 70.8 % | weight 600 REJECTED: counter 31.4 → 50.0 |
  | + banner text 1 px up (approved caps start at row 132, game 133) | 19.45 | 70.7 % | measured row gradient / thin brown outline: no gain (31.19 / 31.43), not kept |
  | + banner word-spacing 3 px, letter-spacing −0.6 px (approved word gaps 13–14 px vs 8–11) | **18.21** | **71.8 %** | sweep of 14 pairs; sensitive to sub-pixel position (24.9–37.0); kept the best, letters moved 1–3 px toward approved |
  Ported to `src/ui/hud.ts` (H05 border 1 / banner h 69, track −0.6, word 3, dy −1; `RIM05` rows, `bands05()`, `HALO05`;
  digits gradient + drop-shadow): harness 18.20 / 71.8 %. Real captures: in progress.

## Remaining, step by step
1. (done in harness, see table) — optional: only further fine passes on the banner rim profile (approved top rim
   113–118 soft 5-px ramp peaking at 114, bottom 172–182 with a lavender inner glow) if measured closer.
2. Real captures (one at a time): `node qa/pilot05/full_reference_match/hud/probe05.mjs --out=DIR before='<STACK>' new='<STACK>&hud05=1'`
   → copy to `hud/before.png`, `hud/new.png`; `python3 -I tools/match05/metrics.py hud/new.png hud/new_` (and before).
3. Default identity: `node scripts/capture.mjs 05 --out=<scratch>` must equal `qa/pilot05/current_default_05.png` (0 px);
   then `git checkout -q qa/capture_log.json` (allowed by COORDINATION rule 1).
4. Other screens with the switch on: capture 04 and 06 with `hud05=1` vs without; describe (global layout change).
5. Fill this file's final tables (approved | game | difference | cause | change | measured result).

## REQUESTS
None so far.
