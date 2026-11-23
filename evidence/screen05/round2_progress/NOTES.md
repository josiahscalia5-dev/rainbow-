# Screen 05 — round 2 fix progress (checkpoint 2026-11-23 ~21:20 UTC)

Round 2 = the workflow `staging/shared/round2-fixes.workflow.js` (launched 20:29 UTC). Lanes: water → splash | scenery → foam
(after water) → bubbles; then a final integration capture + 12 s recording and two independent reviewers.
All code changes are saved by the five-minute autosave; this file summarises what the finished agents reported.
Baseline before round 2 (deterministic view, Benny at s = 14.00): `evidence/screen05/round2_baseline/BASELINE_*`.

## Finished

### Water bands (status: improved) — final `round2_progress/water_final_sbs.jpg`
Files: `Water/Shaders/RainbowRiver.hlsl`, `Water/Shaders/RainbowWaterCommon.hlsl`, new read-only `AgentScripts/screen05_water_bands.cs`.
* Thin white contour lines along band edges are gone; bands have soft pink → violet → periwinkle → cyan edges with fine, soft,
  flow-aligned satin streaks and glitter.
* Near water behind Benny is bright azure with glossy arcs and 4-point flares; the "seagull" squiggles are gone; pink wake
  sweeps are curved and shorter. Far river cleaner. Moving views s = 10 / 20: continuous, no seams.
* Still different: far river ~1.5× too wide (the Three.js W11 `channel05` narrowing / far foam shelves are not ported — needs
  channel data in the river mesh UV1.w + foam shelf work); water beside Benny lighter aqua and busier than the approved azure;
  fewer big white flares at the bottom; pink sweeps flatter magenta than the approved plumes with spray; S-band phase at mid
  distance differs a little; blotchy light cells behind Benny come from the wake "trail" term (splash area).

### Lighting & scenery (status: improved) — final `round2_progress/scenery_final_sbs.jpg`
Files: `Environment/Editor/EnvironmentBuilder.cs`, `Environment/Scripts/DrumLayout05.cs`, `DrumMeshes05.cs`,
`Environment/Shaders/RainbowThroatGlow.hlsl`, `RainbowEnvLighting.hlsl`, `RainbowDrumWall.shader/.hlsl`, `RainbowGoldMetal.shader/.hlsl`.
* White starburst sun → warm white-gold core with golden-orange glow; 7 rings now visible converging into it (ring sizes
  measured within a few px of the approved); no more pale pink fog haze on deep rings/walls; radial wall spokes mostly gone.
* Rings: orange-gold with warm bulbs, dark contour and bright crown line (were flat tan bands with white dashes).
* Paddles: copper-orange trays with reflections (were brown wood). Near frame corners orange-gold.
* `ThroatS` is now 290 m (camera far clip 300). New params: DrumWall `_WallFar`, `_MidRange.w`; GoldMetal `_GoldTone`;
  `RB_FOG_MAX_DEPTH 60`. The user's tuned wall/gold values in `SetupWall/SetupGold` were kept.
* Still different: deep walls lack the concentric dark slot rows; near slots smaller/denser than approved (try pitch 0.72/1.15,
  size 0.26/0.11); paddles smaller, higher and tilted (approved: bigger D-trays near the horizon with a thick polished rim);
  rings less polished (fewer bright highlights); far glow merges into one over-saturated orange disc (try `#ffa070`, keep purple
  gaps); wavy strip reflections on the left wall at s ≈ 20 (near-floor blend, pre-existing).
* Camera check (not changed — camera belongs to gameplay): moving the camera ~0.5 m forward (6.93 → ~6.4 back, remove the
  follow lag) would fix the ~4 % small near ring; keep height ~3.3–3.4; yaw 2.96° → ~2.55° would centre the vanishing point
  (now ~9 px right); Benny sits ~30–40 px lower than approved.

## Running at this checkpoint
* **Splash & water contact** (started 21:04 UTC) — `SplashWake.cs`, `RainbowSpray.*`, wake section of `RainbowRiver.hlsl`, ride height.
* **Foam banks** (started 21:04 UTC) — `FoamBank.cs`, `RainbowFoam.*`, foam-shelf section of `RainbowRiver.hlsl`.

## Not started yet at this checkpoint
* **Bubbles** (after foam) — `BubbleField.cs`, `RainbowBubble.*`, `WaterBuilder.BuildBubbles`.
* **Final integration** (full cycle with `-Series` + 12 s gameplay recording) and **two reviewers**.

## Known tooling quirks
* The first rebuild right after a recompile can fail with "No Pipeline instance found" (exit 3) or "EDITOR NOT READY" (exit 4)
  during a domain reload — wait ~10–30 s and run the cycle again.
* `screen05_hold_approved.cs` usually lands Benny at s = 14.00, but sometimes at 13.63 or 14.37 (one frame of frame-phase
  difference); compare stills from the same kind of run, and check the "paused at frame … S=" line.
