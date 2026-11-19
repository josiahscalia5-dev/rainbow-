# Screen 08 Benny — bake + refits (benny-character-artist), rounds 1–3, 2026-11-17

All of this runs ONLY under `?match08=1` (also `?matchall=1`, `?benny08=1`; `?benny05=1&bake08=1`). Default build: 0 px.
Region numbers: `work/regions08.py` (approved `references/08_final_spin_chamber.png`; Benny + splash = box x 220–650,
y 840–1245; scenery = y ≥ 190 outside that box; share of pixels within 20 levels, luminance SSIM).

## What each step does
1. **Bake (round 1, commits `8cb3e72`, `6392658`)** — Benny's maps re-baked from the APPROVED 08 picture at the locked
   08 frame → `assets/textures/benny08/` (`bake_report.json` has the full recipe). Body + arms: approved 08 albedo solved
   through the live light + post chain where the picture shows them, the rest = benny05 map × measured 08/05 fur tone,
   then 2 back-projection refine steps. Crown + cuff: benny05 knit × per-class 08 colour gains (stripes, stitches, ribs
   unchanged; a per-pixel beanie bake was tested and rejected — broken stripes). Pom, star, normals = benny05.
   Tools: `work/probe08.mjs` (+ `work/probe/*.js`), `bake08.py`, `refine08.py`, `classgain08.py`, `parts08.py`, `compare08.py`.
   `?bake08=0` = the previous (benny05) maps.
2. **Round 2 (`b973cca7`, `df1a91f8`, `7c425531`, Game.ts `M08_BENNY`)** — approved splash ring drawn stronger
   (alpha^0.3 × 2; card, size, approved position unchanged); pom-pom moved onto the painted spot; star 1.2× at the painted
   spot; beanie 0.95× seated ≈15 px higher / ≈10 px left, rolled −0.08 rad so the stripes run level like the painting.
   `?b08r2=0` = these off.
3. **Round 3 (`672f991`)** — the body map had a dark muddy strip right under the beanie cuff (the painted cuff's shadow
   baked onto fur texels; exposed since round 2 seats the beanie higher). `work/fixband08.py` lifts map rows 190–236 to
   the fur tone just below, refills them with fur-strand detail from the rows below, and removes whitish splash specks
   baked into the strip → `assets/textures/benny08/body_r3.png` (report `r3/fixband08_report.json`). `?b08r3=0` = round-2 map.
   Tested and REJECTED (measured worse): body fur grown higher under the cuff (bald threshold +0.03…+0.15: no change);
   arm puffs 1.25× / 1.5× (64.8 / 64.5 %), raised +0.12 / +0.24 (64.8 / 64.1 %), 1.15× raised + wider (64.0 %).

## Round 5b — USER DECISIONS 19:00 UTC (via lead): r3b is the base; rounder FULLER body; soft fur; moving look first
**Current URLs (after 5b):** r2 `?match08=1&b08r3=0` · r3b (BEFORE) `?match08=1&b08full=0` · r4 `?match08=1&b08hi=1&b08pom=1&b08full=0`
· r5 taper `?match08=1&b08hi=1&b08pom=1&b08shape=1` · **NEW (5b) `?match08=1`**. All verified 0 px against their earlier captures.
(The round-5 URLs written further down predate this change: round 4's shoulder highlight and lighter pom are now opt-in `=1`.)
* KEPT `b08full` (default under match08, `b08full=0` = r3b): body fur ×1.04 wider and the beanie ×0.94, so the round body
  is now WIDER than the brim like the approved close-up (approved body ≈1.09× the brim, r3b 0.93×, NEW ≈1.1×); full and round
  down into the splash; stubby arms +0.03 higher, ×1.15 so they show at the sides. Visual choice — numbers LOWER:
  Benny+splash 65.3 (r3b) → 62.2 % (SSIM 0.595 → 0.537); body part 62 %; pom 19 % / star 31 % (the smaller beanie moves
  them a little off the painted spots); scenery 97.3 % unchanged; whole 85.0 %.
* Probes: fuller body without the smaller beanie (×1.06 wide 62.5 %, wider bottom 61.7 %, ×1.08 + taller 62.0 %) looked
  too heavy/big next to the beanie; ×1.06 body + ×0.92 beanie 61.6 %; ×0.92 beanie alone 64.4 % (body not fuller). Rejected.
* The 18:55 taper (slimmer toward the water) went the wrong way per the user: kept only as opt-in `b08shape=1`.
* Fur softer than r3b (uSoft 0.9 / 1.0 + edge 1.6): no visible change, same number — rejected; the painting's soft layered
  clumps need a new fur clump model or bake.
* Final pictures `review_r5/final/`: `1_APPROVED_*`, `2_BEFORE_r3b_*`, `3_NEW_*` (approved view, close-up, forward, steer left, steer right).
* Proofs: tsc clean; default 08 0 px (same container as the verified pre-round-5 default); r3b / r4 / r5-taper URLs 0 px;
  gameplay 8/8 + 91 coins / 2,240 with and without match08 (`r5b/tests/`); 04–07 with match08: NEW == r3b URL 0 px.
  FLAG: with match08 on, 04–07 differ from the default build over much of the frame (04 510k px, 07 560k px) — identical
  with the round-4 settings, so it is not from the Benny work (round 3 recorded only Benny's box); worth a look by the lead.
* APK `builds/rainbow-debug-08benny-2026-11-17-r5b.apk` (match08=1, Git LFS, sha256 f98d4a97…; gradle BUILD SUCCESSFUL), NOT phone-tested.

## Round 5 (account 4, lead review of r4; captures `r5/`, review set `review_r5/` + its README)
Exact URLs: **r2** `?match08=1&b08r3=0` (65.7 %) · **r3b** `?match08=1&b08hi=0&b08pom=0&b08shape=0` (65.3 %) ·
**r4** `?match08=1&b08shape=0` (65.4 %) · **r5 NEW** `?match08=1` (62.0 %).
Files `review_r5/{1_APPROVED,2_r2,3_r3b,4_r4,5_r5_NEW}_*.png`: approved-view frame, close-up (closeup_APPROVED crop), forward / steer left / steer right.
* KEPT (d) body shape (`b08shape`, Game.ts): the body fur geometry tapered — ×1.12 wide at the top right under the brim,
  ×0.92 at the bottom — so the brim sits directly on a body as wide as itself and the body slims toward the water like the
  painting (r4 = a round ball narrower than the brim at the top, widest low down); arms raised 0.04 and ×1.1 so they sit
  high under the brim. Beanie, pom, star, face untouched. **Visual choice, number LOWER:** Benny+splash 65.4 → 62.0 %
  (SSIM 0.594 → 0.544), body part 75 → 58 % (the painted fur texels no longer line up pixel-for-pixel with the new
  outline); whole frame 85.4 → 84.9 %; scenery 97.3 % unchanged.
  Probes (all worse on the number): plain wider body ×1.04–1.08 (62.0–62.5 %, sphere stays widest low down), squashed
  body (60.9–61.4 %, beanie sinks below its painted spot), body fur lifted into the beanie (57.2–59.8 %, fur pokes through
  the cuff), larger arms ×1.2–1.3 pushed outward (60.9–61.5 %, they float off the body with gaps) — rejected.
* REJECTED (c) whiter stripes (`work/white08.py`): on-screen whites already match the painting (bright 255/235 vs 255/231,
  shaded 228/182 vs 223/172 after the change — the shaded part got worse, the change is invisible); not kept.
* REJECTED pale-streak clean-up of the arm / body maps (`work/clean08.py`): it flattened the body's light fur highlights
  and the pale streaks beside the left arm stayed — they come from the lighting on the fur tips, not from the maps.
* REJECTED (a) lighter pom tufts (fur `uHi` 0.7 / 1.5 on the pom): the painted pom is deeper violet (median 126/15/229);
  lighter tips moved it further away (pom 23 → 22 %), invisible otherwise.
* OPEN: (a) pom yarn tufts and (b) the painting's large soft fur clumps — both need a new fur strand/clump model or bake,
  not a parameter (every parameter try in rounds 3–5 measured worse); jagged pale fur tips at the arm edges (lighting).
* Proofs (r5 final): tsc clean; default build 0 px vs the pre-round-5 commit captured in the same container (only the
  animated title banner rows < 205 differ; same build twice = 0 px); `match08=1&b08shape=0` == r4 0 px; scenery 97.3 %;
  gameplay 8/8 + 91 coins / 2,240 with and without match08 (`r5/tests/`); screens 04–07 with match08: 0 px vs round 4
  (the shape applies only on 08; vs default only Benny changes as in round 4). Note: captures made on another machine
  differ by faint coin shading (≤19 levels) and the banner — compare captures from the same container.
* APK `builds/rainbow-debug-08benny-2026-11-17-r5.apk` (`VITE_RAINBOW_Q05="match08=1"`, Git LFS, sha256 906b4f34…),
  NOT phone-tested. Gradle reported a failure in the capacitor library's annotation step (Maven Central 429); the app
  APK itself was packaged, signed (Android Debug) and zip-verified, contains the match08 bundle.

## Round 4 (user order via lead, captures `r4/`)
* KEPT: fur shoulder highlight (`fur.ts uHi` 0.7 on the body: lighter pink tips on the visible upper body, number
  neutral 65.3 %, visibly closer; `?b08hi=0` off); lighter violet pom-pom (material 1.12/1.0/1.06: pom 22 → 23 %,
  Benny+splash 65.3 → 65.4 %; `?b08pom=0` off).
* REJECTED (measured worse, not visibly closer): bigger tufts (`uClumpScale` 0.12 / 0.08: 62.6 %), per-tuft tone
  (`uClumpVar` 0.3: 65.1 %), shinier knit (roughness ×0.6 / ×0.4: 64.8 / 64.7 %), pom tip contrast (65.2–65.3 %),
  hat 1.05× / 1.10× (64.3 / 62.5 %), shorter body (63.4 %), rounder body + larger hat (61.3 %) — the current
  placement is fitted to the painted spots.
* NEW (`r4/NEW_08.png`): Benny+splash 65.4 % (SSIM 0.594), scenery 97.3 %, whole 85.4 %; body 75, star 50, crown 29,
  cuff 28, pom 23 %. Default 0 px; `b08hi=0&b08pom=0` == r3b 0 px; gameplay 8/8, 91 / 2,240; motion `r4/motion/montage_r4.png`;
  04–07 only Benny changes; 360° `r4/views/turntable_NEW.png` (canonical: violet eyes, paw pads, star hat).
* Close-ups 2× (x 110–770, y 820–1320): `r4/closeup2x_APPROVED.png`, `closeup2x_PREVIOUS_r3b.png`, `closeup2x_NEW_r4.png`.
* Remaining: the painted fur's large soft clumps (needs a new fur bake / strand model, not a shader tweak), pom yarn tufts.

## Round 3b (lead review of the 2x close-ups, captures `r3b/`)
* Fur: `fur.ts` uniforms `uSoft` (root occlusion + per-strand variation pulled toward their mean) and `uSoftEdge`
  (shorter fur where the body turns edge-on → softer outline); BENNY05 shader only, 0 = unchanged. Used at 0.6 on
  body + arms, edge 1.0 on body (`?b08soft=0` = off). Probe: 65.3 → 65.6 % (edge neutral, smoother outline).
  Rejected (worse): fur length ×0.7 / ×0.5 (63.5 / 62.4 %), density ×0.7 (61.9 %), more clumping (63.3 %), lighter roots (65.1 %).
  Row-by-row body colour already matches the painting; the difference is graininess (std 45 vs 28 at the shoulders).
* Hat: on-screen colours already match (painted whites are pinkish too: 249/215/242 vs ours 255/219/244); the painted
  knit has more contrast. Cuff ribs sharpened (`work/crisp08.py --amount=1.2` → `brim_r3.png`, `?b08crisp=0` = off):
  visibly crisper vertical ribs like the painting, measured −0.3 pt (kept for the visible match). Crown and pom
  sharpening: not clearly closer, measured worse → not used.
* Splash ring: alpha^0.2 × 2.5 (round 2: ^0.3 × 2) → fuller white foam ring, 65.5 → 65.7 % (Game.ts, `b08r3=0` = round 2).
* Combined NEW (`r3b/NEW_08.png`): Benny + splash 65.3 % (SSIM 0.595), scenery 97.3 %, whole 85.4 %; parts body 75 %,
  star 50 %, crown 29 %, cuff 28 %, pom 22 %. Default 0 px, `b08r3=0` == round 2 0 px, gameplay 8/8 + 91 / 2,240.
  Close-ups (x 110–770, y 820–1320, 2×): `r3b/closeup2x_APPROVED.png`, `closeup2x_CURRENT_round2.png`, `closeup2x_NEW_r3b.png`.

## Numbers (round 3 captures, `r3/`)
| Benny on 08 | URL | Benny + splash ≤20 | SSIM | whole ≤20 | scenery ≤20 |
|---|---|---|---|---|---|
| pre-bake (previous match08) | `match08=1&bake08=0&b08r2=0&b08r3=0` | 49.8 % | 0.458 | 83.3 % | 97.3 % |
| bake only | `match08=1&b08r2=0&b08r3=0` | 57.2 % | 0.553 | 84.2 % | 97.3 % |
| round 2 (CURRENT) | `match08=1&b08r3=0` | **65.7 %** | 0.602 | 85.4 % | 97.3 % |
| round 3 (NEW) | `match08=1` | 65.3 % | 0.592 | 85.4 % | 97.3 % |

Round 3 is 0.4 pt lower on the strict pixel score (new fur strands are not pixel-aligned with the painted ones) but the
colour under the cuff now matches (median 255/87/199 vs approved 248/89/196; before 239/73/178) and the muddy band is
gone — visibly closer (`r3/closeup_*.png`). Scenery identical in all variants (only Benny's box changes). 97.3 vs the
recorded 97.4 % is rounding of the same pixels (pre-bake capture is pixel-identical to `../08_NEW_match08.png`).
Per part (round 3): body 75 % ≤20 (approved median 242/69/172, game 244/71/176), star 50 %, cuff 33 %, crown 29 %, pom 22 %.

## Checks (round 3)
* `npx tsc --noEmit -p .` clean. Default 08 capture == `../08_BEFORE_current_game.png` 0 px (`r3/default_after/`).
* `match08=1&bake08=0&b08r2=0` == `../08_NEW_match08.png` 0 px; `match08=1&b08r3=0` == round-2 capture 0 px.
* Gameplay 8/8, 91 coins / 2,240: default, match08 (before and after round 3) — `r3/tests/`.
* Motion on 08 (forward 3/6/10/15 u, steering left/right): `r3/motion/montage_r3.png` — beanie, pom, star, fur stay on the model.
* Screens 04–07 with match08 vs default (`r3/other_screens/`, `r3/other_default/`): only Benny's box changes
  (04 4.3 %, 05 8.3 %, 06 15.0 %, 07 11.2 % of pixels).

## Reproduce
```
node scripts/capture.mjs 08 --out=DIR --q='match08=1'        # NEW (add &b08r3=0 for round 2, &bake08=0&b08r2=0 for pre-bake)
python3 -I qa/match/08/benny08/work/regions08.py DIR/08.png
python3 -I qa/match/08/benny08/work/parts08.py DIR/08.png
python3 -I qa/match/08/benny08/work/fixband08.py --mode=copy   # regenerates body_r3.png
node tools/match08/motion08.mjs OUTDIR 'match08=1'
```

## Still different from the painting
Pom-pom spikier/bigger and more violet in the painting; arm puffs clearer round shapes; body edge noisier than the
painted soft silhouette (shell-fur aliasing); beanie knit slightly lower contrast.
