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
