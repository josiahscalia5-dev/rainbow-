# Specialist brief — water-fx-specialist: Screen 05 water flow + visual cleanup (round 32)
Relaunch with subagent_type `water-fx-specialist`, workdir = `<workspace>/agentB` from `setup_r32.sh` (contains its newest saved work: `waterflow.js`,
hooks `// [waterflow]` in `play3.html`, rebuilt track in `track_w/`, tools in `tools/`, `out_water/before|after|diag`, `WATER_NOTES.md` when written).
Tell it to READ its notes / folder first and continue.

Task (unchanged):
1. water flow on the river's own splats without changing the approved colours (Spark modifier/dyno on water splats: gentle moving brightness /
   specular ripple along the river + slight shimmer), or semi-transparent flowing highlight layers if the modifier API is impractical; module
   `waterflow.js`;
2. cleanup: (a) BLACK PATCHES where water meets walls in the copied sections — acceptance rule (calibrated on the approved picture): a dark patch =
   connected near-black area (max channel < 22) ≥ 150 px at 412×915 below the HUD (approved picture's darkest spots ≤ 8 px = wall slots, never
   counted); target 0 patches in every frame; checker `tools/marble05/viewer/visual_check.py`; (b) the far end's narrower "tube inside the tube" →
   continue convincingly to the golden end; (c) floaters / smears. Free SplatTransform CLI allowed (`npx -y @playcanvas/splat-transform@3.12.0`),
   builder `tools/marble05/build_track.py` parameters; visible splats ≤ ~1 M;
3. BEFORE/AFTER stills at s = 0, 2.3, 4.4, 6.4 with checker numbers in `WATER_NOTES.md`.
Never change the approved scenery, colours, tunnel structure or Benny.
