# Screen 05: wave 8 (transfer session `94cf04e3`, branch `ccr-937c7fbb-htsrgt`)

Started 2026-11-16 ~01:45 UTC. Branch contains every earlier branch (incl. account 8's `ccr-4f6c3e0e-5kxgr0` to
`0fe0b0c`). Wave 7 (water, foam, environment) is DONE and kept. All owners/rules of `COORDINATION_WAVE6.md` still
apply (strict file ownership, Edit tool only, NOTES first, no commits, no paid generation, no invented %).

## Verified at start
* LFS 24/24 (fresh-clone download test), refs 12/12, 10 agents, `tsc` OK, continuity ok (gaps 0, drop 61.19),
  gameplay test pass (8/8 checks, plunge 61.41, errors []).
* Baseline: `qa/pilot05/wave8/baseline/{04,05,06,07,08}.png` (05: 87 calls, 634,961 tris; budget ≤130 / ≤650k).
  Captures render with the game's default bloom (UnrealBloom 0.2 / threshold 0.94 — weak; coordinator-owned, not
  changed this wave).

## Coordinator's whole-frame read (approved vs baseline, ranked)
| # | Element | Live (baseline) | Approved | Owner |
|---|---|---|---|---|
| 1 | Far river y≈420–560 | straight pink/blue/violet striped WEDGE into the VP (reads as 06) | narrow cyan core with pink bands still winding in S-bends right into the VP | path-camera |
| 2 | Coins to the VP | ≈6 visible, trail stops early | ≈10 coins on the winding core, shrinking into the VP | path-camera (far) |
| 3 | Rings | dim salmon/copper bands; read as matte | read as bright, glowing yellow-gold with dense bright bulbs and a halo | environment (+ far ring depths: path-camera) |
| 4 | Walls | deep VIOLET metal, dark slots (violet share 70–80 %) | luminous magenta-pink metal (violet 29–46 %), strong white-pink streaks (5.1 %) | environment |
| 5 | Lids | flat plank-like slabs | glossy rounded copper-gold half-dome pucks seen at an angle | environment |
| 6 | VP | small orange core | warm white-gold light, rings recede evenly into it | environment (+ path-camera far block) |
| 7 | Foam | big white sphere heaps at the sides | fine lavender/blue small-bubble rims | foam — NEXT wave |
| 8 | Near water / bloom | — | — | water / coordinator — later |

## Wave-8 assignments (run in parallel; owners as in wave 6)
* **path-camera-transition-engineer**: rows 1, 2, far part of 3 (far ring depths: reference rings at r ≈ 273/170/100/64
  px about the VP ≈ virtual depth 38/61/103/161; live 273/198 + far rings at 86/124/160… — see
  `qa/pilot05/REQUESTS.md`, wave7 line), far foam rims, far part of 6.
* **washer-environment-modeler**: rows 3 (materials + near rings), 4, 5, 6 (its own section), near-frame gold share
  (32/33/43 % vs ref 43/50/45 %). Its "Left undone" list: `qa/pilot05/wave7/environment/NOTES.md`.
* Cross-owner needs → one line in `qa/pilot05/REQUESTS.md` prefixed `wave8`; both read it between iterations.

## Rules (wave 8)
* NOTES in `qa/pilot05/wave8/<you>/NOTES.md` (plan first, log after every capture); evidence `qa/pilot05/wave8/<you>/itNN`.
* Capture: `timeout 600 node scripts/capture.mjs 05 --out=qa/pilot05/wave8/<you>/itNN`; report:
  `python3 -I scripts/screen_report.py 05 qa/pilot05/wave8/<you>/itNN PREV=qa/pilot05/wave8/baseline/05.png NOW=qa/pilot05/wave8/<you>/itNN/05.png`.
  LOOK at the side-by-side every time. At most 6 iterations. Revert what does not look closer.
* End: `npx tsc --noEmit`; regression capture `04 06 07 08` → `qa/pilot05/wave8/<you>/regress`: 04/07/08 pixel-identical
  below the HUD to `qa/pilot05/wave8/baseline/NN.png` unless intended (say so); 06 keeps its stage anchors.
* path-camera: ride check 04 start → 06 (no warps/pops) and `node scripts/gameplay-test.mjs` must still pass.
