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

---
# Milestone 2 continued (round 3, account 3, branch `claude/rainbow-s05-match-c3`, started from `fd94023f`)

## 2.2 Soft green-teal patches beside Benny while riding — `?tgtfill05=3` (needs `match05=1&tgtvis05=1`)
Cause (seen in `target_05.png`): the pyramid blend that fills the target's holes used the APPROVED picture as its
"outside" side, so the coarse levels carried the occluders' colours (yellow coins, pink Benny) into each small hole →
dull green-teal discs where the painted coins sit. In the locked view the game coins cover them; as soon as Benny steers
the discs show on the water (`move/new/steer_L_050.png`).
Tool: `tools/match05/make_target_vis.py` env `TGTFILL05` (default unset reproduces the tgtvis05 target byte-identical;
re-bake `python3 -I tools/proj05/bake.py <probe> <target dir + qa/pilot05/proj/target/correction.npz> <out> far gapfill`
reproduces `assets/textures/match05/tgtvis05/proj05_E.png` byte-identical — verified first). E **and** F are re-baked
(F carries the far coin holes). Textures: `assets/textures/match05/tgtfill05_3/`.

| option (one at a time) | locked whole mean / ≤20 / SSIM | water ≤20 | riding / steering by eye | decision |
|---|---|---|---|---|
| M1 (tgtvis05) | 8.09 / 89.15 % / 0.877 | 96.5 % | green-teal discs beside Benny | BEFORE |
| 1: fill as the blend's outside side in every hole | 8.71 / 88.72 % / 0.868 | 96.0 % | discs gone, hard seams | rejected |
| 2: visible water spread into every hole (normalised convolution) | 8.46 / 88.88 % / 0.870 | 96.3 % | discs gone, but a hard flat edge around the big Benny patch | rejected |
| **3: option 2 only inside the coin holes, Benny patch + bottom ring as M1** | **8.16 / 89.08 % / 0.875** | **96.5 %** (3.55) | discs gone, Benny patch as M1 | **kept as switch** |

Option 3's locked loss (−0.07 pt) lies only in the coin region (mean 27.1 → 30.5): the painted coin rims around the game
coins were partly coin-coloured fill before — a coin "ghost" while riding. Same rule as M1's margin choice: the moving
test decides. Pictures: `r3_teal/03_NEW_tgtfill05_3.png`, `r3_teal/riding_BEFORE_M1/`, `r3_teal/riding_NEW/`
(forward 3 / 6 u, steering L / R 0.5 / 0.8 s), `r3_teal/side_by_side_steer_L_050_M1_left_NEW_right.png` (crop only).
Proofs: default 05 == `current_default_05.png` 0 px; `match05=1` == `02_BEFORE_match05.png` 0 px;
`match05=1&tgtvis05=1` == `03_NEW_match05_tgtvis05.png` 0 px; tsc clean.

## 2.3 Right wall chunk — `?tgtwall05=1` (needs `tgtfill05=3`)
Cause (`tools/match05/pixel_probe.mjs`): at x 748–863 y 771–904 the front surface is the near **water ribbon** (d 12–17),
not the wall (d 21–25); the approved picture shows the purple wall with dark slots there, the bake had no data for
ribbon texels outside the approved water footprint → stretched pink water ("lighter, no slots": signed +15/+18/+16).
Hiding the ribbon is no option (another water layer lies under it). Fix: `tools/proj05/bake.py` opt-in env
`BAKE05_EXTRA_REGIONS=purple_walls` (unset = byte-identical, verified) — E also carries the approved pixels where the
near ribbon covers wall in the locked view (7,920 texels; 6,663 in the right chunk, the rest small left pieces). E height
and its LUT change with it → `assets/textures/match05/tgtwall05/proj05_E.png` + `proj05_lut.json` (F unchanged).

| locked view | BEFORE (tgtfill05=3) | NEW (+tgtwall05) |
|---|---|---|
| whole mean / ≤20 / SSIM | 8.16 / 89.08 % / 0.875 | **7.93 / 89.44 % / 0.879** |
| purple walls mean / ≤20 | 6.42 / 92.2 % | **5.27 / 94.2 %** |
| water | 3.55 / 96.5 % | 3.55 / 96.5 % |
| bubbles mean / ≤20 | 3.09 / 97.4 % | 5.02 / 93.4 % (the big transparent 3D bubble now shows the dark wall through it, the approved bubble is brighter) |
Variant walls + bubbles (paint the approved bubble on the ribbon too): bubbles 5.35 / 92.4 %, rejected.
Riding / steering (`r3_wall/riding_NEW/`, crops `r3_wall/crop_riding_top_BEFORE_bottom_NEW.png`): the wall slots stay
readable where the smear was, no sliding artefacts seen. Open: the bubble looks dimmer than approved.

## 2.4 Bottom-left gold ring arc (near frame, left corner piece) — investigated, nothing kept
`pixel_probe`: the front surface is the camera-held near frame (`tube05_near_frame`, env05 pieces). Error map
(`r3_final` crops in the session): the outline matches the approved frame within a few px except the straight radial cut
of the left piece; the remaining difference is the approved frame's dark steel inner bevel + blue reflections, which the
along-arc-smoothed band texture (`tools/proj05/frame_bake.py`, sigma_u) cannot carry. One factor tried: a slanted cut
(`tools/match05/frame_cut_fit.py`: separate end angles at the inner / outer band edge) — best fit −127.75° / −126.0°
improves the mask objective by only 478 of 15,392 px (3 %), below what the region masks can resolve (they label parts of
the gold as water). Not implemented: no measurable gain. Next idea (not started): bake the cut end of the left piece
without along-arc smoothing (bevel detail), behind its own switch.

## 2.5 Coin faces — proposal for the lead (shared `coins.ts`, nothing changed): see SHARED_CHANGES.md

## 2.6 Wake water between the filaments — not started (time / usage).

## Round-3 result (APPROVED `01_APPROVED.png` | BEFORE M1 `03_NEW_match05_tgtvis05.png` | NEW `r3_final/03_NEW_match05_tgtvis05_tgtfill05_tgtwall05.png`)
Switches: `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1` (explicit, NOT inside match05; the user decides).
| | BEFORE M1 | NEW |
|---|---|---|
| whole frame mean / ≤10 / ≤20 / SSIM (metrics.py) | 8.09 / 81.0 % / 89.15 % / 0.877 | **7.93 / 81.4 % / 89.44 % / 0.879** |
| screen_match.py FULL / BELOWHUD / LAYOUT ≤20 | 89.1 % / 91.3 % / 95.6 % | **89.4 % / 91.6 % / 95.9 %** |
| scenery (no Benny / HUD / coins) mean / ≤20 | 5.60 / 93.3 % | **5.32 / 93.7 %** |
| water / purple walls ≤20 | 96.5 % / 92.2 % | 96.5 % / **94.2 %** |
| coins / bubbles ≤20 | 52.0 % / 97.4 % | 48.6 % / 93.4 % (coin-hole rims; the big bubble shows the dark wall through it) |
Riding / steering: `r3_final/riding_BEFORE_M1/` vs `r3_final/riding_NEW/` (forward 3 / 6 / 10 / 15 / 20 u, steering L/R
0.25 / 0.5 / 0.8 s); changed px per frame `r3_final/riding_changed_px_gt8.json`. By eye: the green-teal blobs of BEFORE
(clearly at 10 u, 20 u and steering) are gone; wall slots instead of the pink smear on the right.
Proofs: default 05 == `qa/pilot05/current_default_05.png` 0 px; `?match05=1` == `02_BEFORE_match05.png` 0 px;
`?match05=1&tgtvis05=1` == `03_NEW_match05_tgtvis05.png` 0 px; line-A protected `?ringa=26&nearfloor05=0` ==
`qa/pilot05/wave9/baseline/05.png` 0 px; gameplay 8/8 default / match05 / NEW, each 91 coins 1,330 → 2,240
(`r3_final/gameplay_*.json`); continuity ok; tsc clean; references 13/13. (No `match08` exists on line B.)
`tools/match05/screen_match.py` = unchanged copy of line A's `tools/qa/screen_match.py` (read with `git show`).
APK: `builds/rainbow-debug-05-2026-11-17-r3.apk` (+ `.md`), packaged bundle == NEW 0 px, NOT phone-tested.

---
# Round 7 (account 7, line B, branch `claude/rainbow-s05-match-c7` from `-c5` @ `ebaf6cac`) — milestone M3, step 2
Brief: `claude/rainbow-lead-c7:docs/briefs/2026-11-17-r7/S05.md`. VISUALS ONLY: Screen 05's own matched tunnel + S-river
over the whole stage. Audit tool `tools/lead_r6/` copied unchanged from the lead branch.

## Cause (measured, not the two 06 causes)
* Camera pitch: NOT a cause on 05 — the 05 camera is already aimed along the straight tunnel axis with a constant pitch
  (`cameraRig.ts`, '05' block) for the whole stage up to `s1 − 9`.
* Proxy tube: NOT a cause — the 05 tube is already the straight ring cylinder (`straightTubePath`), the river winds inside.
* **Real cause:** the far block (rings C … G, far S-river, warm throat; `environment.ts` `// ---- 05 far tunnel`,
  `tube.ts` ForcedTunnel) is a depth compression along the rays of the LOCKED checkpoint eye and **folded away**
  (`openFor(cam, 18, 34)`) as soon as the camera came within 34 u of its seam (sF05 ≈ 180.0), i.e. from Benny s ≈ 152
  (~35 % of the stage). The fold morph drops the far river and blows the far rings up (the "orange rings seen from
  above" / waterfall in the lead's t66) and opens the view into the 06 arch hall (pink walls, white foam towers).

## Change — `?m05far=1` (needs `match05=1`; explicit, NOT inside match05) — `src/world/match05far.ts`, `src/vfx/clip05.ts`
* The compression is exact for ANY eye once its two eye constants follow the eye (D0 = eye depth of the seam, q = eye
  offset from the axis). Under the switch the far block is re-laid every frame for the live camera: the VIRTUAL tunnel
  (virtual depth Z beyond sF05; wall rows / ring atlas / baked far water F / far-river layout all keyed to it) stays
  world-anchored, so rings, wall rows and the S-river approach like real geometry.
* The seam slides ahead so it is never nearer than in the locked view (53 u): the part between sF05 and the seam is
  drawn at real scale on the same straight axis (covers the 05 → 06 flare), capped at `sGlow05 + 3.5` (≈186.5, just
  before the first 06 ring at ≥187, which otherwise crossed the tube as an orange band).
* The far river starts AT the seam (the real ribbon carries course, coins and Benny before it) and is lifted by the real
  river's rise at the seam (+0.26 u at the cap, measured: the 06 climb begins), so the two water surfaces meet.
* Foam puffs + berm behind the seam (the rising 06 banks, white columns inside the tunnel) are discarded by a clip plane
  (`clip05.ts`, only inside the tube, only while the block is live; programs untouched without the switch).
* At the locked checkpoint eye the build-time geometry is restored → locked view bit-identical.
* Fold only at the very end: eye → seam 10 → 6.5 u (Benny ≈ 183 → 186.5), into 06's own design.

## Numbers (`tools/lead_r6/motion_metrics.py`, below the HUD; `qa/match/05/r7/motion_metrics.txt`)
| frame | BEFORE LAYOUT20 / PALETTE | NEW LAYOUT20 / PALETTE |
|---|---|---|
| a00 approved view* | 63.4 / 94.7 | 66.3 / 94.8 |
| f03 / f06 / f10 / f20 | 24.2/87.9 · 16.9/83.4 · 12.9/83.5 · 13.1/81.2 | 24.4/87.9 · 17.7/83.4 · 13.7/83.7 · 12.9/81.4 |
| steer L / R, hard L / R | 13.1/83.3 · 12.5/84.6 · 10.2/80.6 · 8.7/75.5 | 13.2/83.4 · 12.5/84.6 · 10.8/81.0 · 9.1/75.9 |
| t33 | 15.2 / 83.9 | 15.4 / 84.1 |
| **t66** | **5.8 / 71.0** | **9.0 / 81.4** |
| t95 (Benny 186.7, 2 u before 06) | 5.5 / 57.6 | 5.5 / 57.7 (folded: 06) |
*the audit's a00 is not deterministic between runs (goto lands at s 133.146 vs 133.104, animated water); the
deterministic proof is `scripts/capture.mjs 05`: BEFORE set vs NEW set **0 px**.

## Honest moving rating (subjective, separate from the pixel numbers)
Approved view ~8.5 (unchanged, 0 px). Early swim f3–f20 / steering ~6.5 (unchanged look; the far rings now approach
instead of hanging still). **t66: ~4 → ~6** — purple slotted tunnel, gold rings to the warm throat and the winding
cyan/pink river with the coin trail continue instead of the pink 06 hall. t95: ~4 (unchanged, the 06 hand-over).
Still wrong: near walls / far rings seen up close are blurry (baked from small distant pixels); a faint texture edge
and paler flat water where the far river begins at the seam; pale bank shelves along the far river; the river beyond
the seam is less bubbly than approved; the near coin while riding is ≈190–230 px wide vs ≤ ≈96 px in the approved
picture (lead-owned coin positions: reported, not changed).

## Proofs
* `npx tsc --noEmit -p .` clean.
* Default `capture.mjs 05`: start commit `ebaf6ca` (separate worktree) vs + my files: **0 px** (a second run had 28 px
  in HUD rows 51–114 only = the documented capture-timing glitch). Protected `?ringa=26&nearfloor05=0`: start vs + my
  files **0 px**. (Both differ from the stored 2026-11-16 baselines by ~128 k px already at the start commit in this
  container — renderer drift that predates this round; the lead noted the same on 06.)
* Locked view BEFORE set `match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1` vs + `m05far=1`: **0 px**.
* Gameplay `scripts/gameplay-test.mjs`: default 8/8, NEW 8/8, each **91 coins, 1,330 → 2,240**
  (`r7/gameplay_default.json`, `r7/gameplay_NEW_m05far.json`). `npm run test:continuity` ok (exit 0).
* Pictures (separate full-size 864×1536 portrait files): `r7/APPROVED_05_flow_into_the_current.png`,
  `r7/BEFORE/*.png` (current set), `r7/NEW/*.png` (+ `m05far=1`), 12 audit positions each.

## Not done this round (exact next step)
Step 3 materials: (a) crisp purple slotted wall — a rectified high-resolution tile from the approved near-wall pixels
for the far wall's real-scale part and the near bays (behind `?m05wall=1`); (b) modeled gold rings for the far block
at real scale (behind `?m05ring=1`); (c) remove the seam edge (blend the far-river F texture into the real ribbon's E
over the first 2 u after the seam). Keep the fold at the stage end unless the 06 owner wants the hand-over later.
