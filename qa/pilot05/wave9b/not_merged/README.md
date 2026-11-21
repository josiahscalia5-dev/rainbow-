# Screen 05 work that is NOT in the working game (kept so nothing is lost and nothing has to be redone)

The working game is the user's accepted **BEFORE** baseline (`src/` = commit `aa35c8a`; fresh capture pixel-identical
to `qa/pilot05/wave9/baseline/05.png`) plus the switchable test T1 (`?ringa=20`, default off).
Everything below was made on top of BEFORE and was taken out on 2026-11-16 ~10:25 UTC at the user's direction.
It may come back ONLY as its own controlled test (one factor, URL switch, approved | BEFORE | NEW picture).

| File here | What it is | Owner | State when stopped | Reuse? |
|---|---|---|---|---|
| `wave9_foam_it06.patch` | `src/vfx/foam.ts`, `riderSplash.ts`: bank05 ramp, wake bands outside the splash, lacy splash ropes | foam-bubbles-particles | **finished** (it06 kept, end checks passed; `qa/pilot05/wave9/foam/NOTES.md`) | candidate test — apply the patch as is |
| `wave9_pathcamera_it01_far05_coins.patch` | `src/world/far05.ts`, `src/gameplay/coins.ts`: far coin trail into the light (`farCoins05`, `coinVisuals()`), seam coin on the trail, own far-river material | path-camera-transition-engineer | it01 kept; it02 (far river look) not started (`qa/pilot05/wave9/path-camera/NOTES.md`) | candidate test — needs the matching far-block lines of the environment patch, WITHOUT the oval (`aspect` 1, no `floorY`) |
| `wave9_water_it02.patch` | `src/vfx/waterRibbon.ts`, `glsl.ts`: satin streak layers, tone ladders, `boltFlare`, curved sweeps | water-fx-specialist | mid-iteration; its own metric was WORSE than baseline (`qa/pilot05/wave9/water/NOTES.md`) | do not reuse as is; only the curved sweep geometry was judged good |
| `wave9_environment_oval_plus_pathcamera_far_block.patch` | `materials.ts`, `environment.ts`, `tube.ts`: oval K 1.7 tunnel, level bank floor, lateral shift, oval lids, warmer ring palette; ForcedTunnel `{aspect, floorY}` | washer-environment-modeler (+ path-camera's far block) | plan only, no logged capture | **oval REJECTED by the user** — never reuse the oval / floor / enlarged tunnel. The ring palette change is a possible colour test later |
| `coordinator_tests_0950-1020_bigtunnel_round_walltint.patch` | the coordinator's tests of 09:50–10:20 UTC on top of wave 9: "big tunnel" (b 10 / hc 8.6), round + front ring, wall tint | coordinator | tests only | **big tunnel REJECTED by the user.** The front-ring idea became test T1 (clean, on BEFORE) |
| `wave9_partial_and_coordinator_tests_vs_BEFORE.patch` | all of the above in one diff (`aa35c8a` → `ffcd7be`, `src/` only) | — | — | reference |

The same code is in git history: commit `f6de5c7` = the wave-9 specialists' full state (`git show f6de5c7:src/vfx/foam.ts`),
commit `ffcd7be` = with the coordinator's tests; both are on branch `ccr-44f84024-ii5iih`, and `f6de5c7` also on the
protected branch `claude/rainbow-3d-account-recovery-xex5hc`.
Apply one piece for a test: `git apply --3way qa/pilot05/wave9b/not_merged/wave9_foam_it06.patch`, capture, compare,
and take it out again (`git checkout aa35c8a -- <files>` + re-apply T1) unless the user accepts it.
