# Screen 05 — Milestone 1: `?tgtvis05=1` (visible approved water around Benny keeps the APPROVED pixels)

Session: Screen 05 agent, 2026-11-17 ~15:40–16:40 UTC, branch `claude/rainbow-s05-match`. One factor, one switch.
Test URL: `?match05=1&tgtvis05=1` (the switch is explicit and NOT inside `match05`; the user decides).

## Finding (measured)
`tools/proj05/make_target.py` builds the water target = approved pixels where the approved water is visible, the user's
isolated original artwork (registered) where Benny + splash hide it. Its "Benny" hole is the env-mask blob from row 760
down — a dome much larger than Benny. 57,916 px of the region the masks call **water** (approved shows plain water,
around the hat and shoulders) therefore came from the artwork: mean |ΔRGB| 34.7, 46.5 % within 20 levels; 2.0 M of the
frame's 11.9 M error sum (17 %). Every other water pixel is at 2.0 mean / 99.2 %.

## Change
* `tools/match05/make_target_vis.py` (copy of make_target.py + one block): visible approved water (region "water",
  rows 700–1100, eroded 3 px) farther than **16 px** from Benny / wake / bubbles / coins is removed from the hole used for
  the final composite → those pixels stay APPROVED. Registration, colour match and water mask use the ORIGINAL hole
  (fill elsewhere identical); 28,620 px returned to approved.
* Re-bake: `python3 -I tools/proj05/bake.py <probe> <target> <out> far gapfill` (probe: `node scripts/proj05-probe.mjs
  --q='proj05=1' --raw=<dir>`). Verified first: the same command with the committed target reproduces
  `water05/far2/proj05_E.png` **byte-identical**; LUT + F identical to far1 for the new target too → only E is swapped.
* `assets/textures/match05/tgtvis05/proj05_E.png` (+ `target_05.png`, `fill_mask.png` for reference).
* `src/vfx/waterRibbon.ts`: `TGTVIS05 = PROJGAP05 && q05('tgtvis05')`; E url chosen under it. Nothing else.

## Margin choice (moving test decided it, not the locked score)
| margin | px returned | whole mean / ≤20 / SSIM (locked) | steering L/R 0.5 s |
|---|---|---|---|
| 3 px | 39,360 | 7.79 / 89.5 % / 0.882 | **rejected**: a bright spiky outline of Benny's silhouette (fur fringe in the approved pixels) stays painted on the water when he steers aside |
| **16 px** | 28,620 | **8.09 / 89.2 % / 0.877** | clean: no ghost outline; seams no worse than BEFORE (`move/`) |
| 32 px | 18,486 | 8.38 / 88.7 % / 0.874 | clean, smaller gain |

## Measured — locked frame (APPROVED `01_APPROVED.png` | BEFORE `02_BEFORE_match05.png` | NEW `03_NEW_match05_tgtvis05.png`)
| | BEFORE `?match05=1` | NEW `?match05=1&tgtvis05=1` |
|---|---|---|
| whole frame mean / ≤10 / ≤20 / SSIM | 8.96 / 79.4 % / **87.8 %** / 0.869 | **8.09 / 81.0 % / 89.2 % / 0.877** |
| scenery (frame minus Benny, HUD, coins) mean / ≤20 | 6.66 / 91.6 % | **5.60 / 93.3 %** |
| water region mean / ≤20 / SSIM | 5.94 / 92.8 % / 0.933 | **3.55 / 96.5 % / 0.958** |
| band rows 768–960 ≤20 | 79.3 % | **87.2 %** |
| band rows 960–1152 ≤20 | 85.9 % | **88.5 %** |
| every other region | — | unchanged (±0.1) |
Files: `before_*METRICS.json`, `new_*METRICS.json`, `scenery_bands.txt`.

## Moving camera + steering
`move/before/` and `move/new/` (`node scripts/proj05-move.mjs --q=… --d=0,3,6,12 --steer=-1,1`, clock frozen = layout).
Changed px (> 8 levels) per frame: `move/changed_px_gt8.json` (riding 3 u: 46,535; steer 0.5 s: 62–74 k; 12 u ahead: 0).
By eye at full size: the water beside Benny now shows the approved streaks instead of the artwork fill; no Benny outline;
the old soft-edged teal patch right of Benny (present in BEFORE) remains — next candidate.

## Proofs
* Default `node scripts/capture.mjs 05` == `qa/pilot05/current_default_05.png`: **0 px**.
* Protected BEFORE `?ringa=26&nearfloor05=0` == `qa/pilot05/wave9/baseline/05.png`: **0 px** (2 of 3 runs; one run had
  155 px in the HUD rows 21–104 only, also with the unmodified code → a capture-timing glitch, not this change).
* `?match05=1` without the switch == my BEFORE capture: 0 px. 06 with switch: 0 px. 04 with switch: 1,923 px in its far
  window onto the 05 river (x 242–444, y 391–713; distance to approved 04 117.9 → 120.5 on those px, i.e. both unrelated
  to 04's painting) — only with the switch; default 04 untouched.
* Gameplay `node scripts/gameplay-test.mjs`: default 8/8, 91 coins / 2,240; `match05=1` 8/8 and `match05=1&tgtvis05=1`
  8/8, both 100 coins / 2,330 (coins05 layout, identical with/without the switch). `npx tsc --noEmit -p .` clean.
  References 13/13 OK.

## Next (plan, one factor each)
1. The teal soft patch right of Benny while riding (E ↔ tile hand-over edge of the old dome fill).
2. Right wall chunk x 772–861 y 773–904 and the bottom-left ring arc (env05 bake) — gold rings / purple walls priority.
3. Coins face colour (shared `coins.ts`: lead approval needed).

---
# Milestone 2 (account 2, branch `claude/rainbow-s05-match-c2`, 2026-11-17 ~16:50–17:40 UTC)

## 2.1 Coin total under `?match05=1` — `coins05tot` (on with match05 / coins05; `coins05tot=0` = old layout)
Problem: the measured 05 arrangement C05M (18 painted coins) replaced 7 default 05 coins → 102 coins, of which 2 were never
collectable → gameplay 100 coins / 2,330 instead of the default game's **91 / 2,240**.

Why the 2 were missed (trace `qa/match/05` audit, coin-seeking steering): C05M rows 17 + 18 end the painted arc that swings
from lat +1.0 to −1.3 within 3 u; Benny is at lat +0.8 … +0.2 there and cannot steer across in time.

Fix (`src/gameplay/coins.ts`, switch-guarded, listed in SHARED_CHANGES.md):
* rows 17 + 18 stay **drawn** exactly where the approved picture paints them; their pickup uses the stream centre line
  (`pickLat = 0`, new optional CoinDef field; every other coin uses `lat` as before);
* 11 coins are removed where **no locked view** shows them: 3 behind the 06 checkpoint camera, 4 behind the 07 checkpoint
  camera (both already "collected" in those views) and the last 4 coins of 06 behind its crest.

Rejected by pixel test (one candidate at a time, `node tools/match05/coin_cp_count.mjs` lists coins behind each camera):
| candidate | why rejected |
|---|---|
| the previous account's version: drop rows 17 + 18 | 17 px at the vanishing point — the approved picture shows them; mean distance to approved on those px 20.8 → 44.8 |
| 05 trail before the 05 checkpoint (3) | the locked **04** view shows them far down its slide (the 2,296 px box x121–189 y827–1019) |
| coin behind the 03 camera / behind the 10 camera | 10's coin shows far ahead in the 08 and 09 views (3,817 / 13,601 px incl. bloom) |

Verified (final code, commit after 75ec501):
* `match05=1` vs `match05=1&coins05tot=0`, screens 02–09: **0 px** each. 01, 10, 11 flip between two capture states run to
  run with the switch on AND off (01: 745 px, 10: 1,244 px, 11: 52 k px between two identical-URL runs) — pre-existing
  capture timing, not this change (10's coins are untouched).
* Coin audit `node tools/match05/coin_audit.mjs --q='match05=1'`: 91 coins, 91 collected, none missed.
* Gameplay `node scripts/gameplay-test.mjs`: default 8/8, `match05=1` 8/8, `match05=1&tgtvis05=1` 8/8 — all **91 coins,
  1,330 → 2,240** (`gameplay_m2_*.json`). Continuity test ok. `npx tsc --noEmit -p .` clean.
* Default `capture.mjs 05` == `qa/pilot05/current_default_05.png` 0 px; protected `?ringa=26&nearfloor05=0` ==
  `qa/pilot05/wave9/baseline/05.png` 0 px; `match05=1` == `02_BEFORE_match05.png` 0 px; `match05=1&tgtvis05=1` ==
  `03_NEW_match05_tgtvis05.png` 0 px (milestone-1 water around Benny preserved).
