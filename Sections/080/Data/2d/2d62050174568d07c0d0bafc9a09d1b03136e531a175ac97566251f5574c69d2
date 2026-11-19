# Screen 05 — inventory of existing work (2026-11-17, Screen 05 agent, branch `claude/rainbow-s05-match`)

Base: line B `ccr-b0757dec-dj6l1o` @ `99ab17b` (+ autosaves). Line A (`ccr-9c4a8ad6-xovgsx`) read only, nothing taken over.
Measure: `python3 -I tools/match05/metrics.py <capture> <prefix>` (same tool / masks as the 86.9 %; masks
`qa/pilot05/full_reference_match/masks/`, 864 × 1536, pixel statistics, not a perceptual score).

## What exists (all behind switches; default build = T2, unchanged)
| part | switch (on with `?match05=1`) | files | notes |
|---|---|---|---|
| approved water baked on the real river (E exact / N near / T tile / D detail / F far / apron A) | `proj05`, `projfar05`, `projgap05`, `projvp05`, `projnear05`, `projflow05=2`, `projedge05` | `src/vfx/waterRibbon.ts`, `src/vfx/proj05Apron.ts`, `tools/proj05/*`, `assets/textures/water05/**` | `qa/pilot05/proj/NOTES.md`, `../near`, `../flow2`, `full_reference_match/coordinator/NOTES.md` |
| tunnel bake: walls, rings, near gold frame, Blender paddles | `projwall05 projring05 projframe05 projlid05` | `src/vfx/proj05Tunnel.ts`, `tools/proj05/tunnel_bake.py` | `qa/pilot05/proj/tunnel/NOTES.md` |
| env05: warped walls, ring fit (sideways offsets), far tunnel, fittings | `env05` | `src/world/tube.ts`, env05 tools | `full_reference_match/env/NOTES.md` (rings A–G fitted to 0.3–4 px) |
| Benny fur / hat | `benny05` | (Benny — NOT mine) | `full_reference_match/benny/NOTES.md` |
| HUD | `hud05` | (HUD — NOT mine) | `full_reference_match/hud/NOTES.md` |
| coins at painted spots | `coins05` | `src/gameplay/coins.ts` (shared) | `full_reference_match/coins/NOTES.md` (match05 run: 100 coins / 2,330) |
| Benny's wake card + approved bubbles | `splash05m`, `bub05` | `src/vfx/riderSplash.ts`, `src/vfx/bubbles.ts` | `full_reference_match/splash_bubbles/NOTES.md` |
| W12 / W2 / G1b / W10 / S1 / W11 candidates | `silk05 puff05 wall05 gold05 water05 fars05 river05` | | older candidates, not in match05 |

## Scores
* Older reference numbers: STACK 34.1 / 51.6 %; cp3 11.87 / 83.6 %; foam-bubbles' c2 9.58 / **86.9 %** (02:50, walls before
  env05's 02:53 re-bake).
* **Fresh capture of `?match05=1` today (= `02_BEFORE_match05.png`): whole frame mean 8.96, within 20 levels 87.8 %,
  SSIM 0.869.**

| region (px) | mean | ≤20 | SSIM | error share (px × mean) |
|---|---|---|---|---|
| water (480,736) | 5.94 | 92.8 % | 0.933 | 24 % |
| purple walls (312,706) | 6.42 | 92.2 % | 0.897 | 17 % |
| HUD + text (125,488) | 17.20 | 73.7 % | 0.799 | 18 % (not mine) |
| Benny + hat (93,061) | 19.22 | 73.0 % | 0.658 | 15 % (not mine) |
| gold rings + front frame (125,730) | 9.12 | 88.2 % | 0.825 | 10 % |
| wake / splash (83,491) | 11.57 | 82.0 % | 0.811 | 8 % |
| coins (27,437) | 27.24 | 51.9 % | 0.549 | 6 % |
| foam banks / bubbles / fittings / distant | 2.4–3.1 | 96–99 % | | < 2 % |

## Furthest from the approved picture (locked frame, blobs of > 20 levels)
1. **Water around Benny's hat and shoulders** (x 216–711, y 677–1232): 57,916 px of the "water" region that the APPROVED
   picture shows as plain visible water were filled from the isolated artwork in the target (`make_target.py`'s "benny dome"
   = env-mask blob, much larger than Benny): mean 34.7, only 46.5 % within 20, **17 % of all error in the frame**.
   → addressed by Milestone 1 (`tgtvis05`, NOTES.md).
2. HUD strip (rows 0–300) and Benny — owned by others.
3. Coins (mean 27): coin face colour/shape vs painting (`coins05`, shared file).
4. Right wall chunk x 772–861, y 773–904 (mean 57, game darker); lower-left bottom-ring arc x 54–159, y 1329–1533 (mean 51,
   game cyan where approved shows gold/pink); bottom gold frame x 568–741, y 1477–1533 (game pinker/bluer).
5. Wake: approved cyan between filaments vs fill (foam-bubbles REQUEST 2 — partly the same cause as item 1).
