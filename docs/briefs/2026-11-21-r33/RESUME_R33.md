# RESUME — round 33 (2026-11-21), session branch `ccr-81d66c17-i0ooo8` (Screen 05 ONLY; no other screens, no credits, no purchases)

## What happened this round
1. Tool evaluation (no installs, no money): Cuberta, SceneSim, Scenario YVO3D, AI Game Developer (ai-game.dev), Thrixel Build World,
   onGame → none adopted. Details + sources: `docs/briefs/2026-11-21-r33/TOOL_EVALUATION_R33.md`.
2. Baseline of the round-32 merged SPLAT build (real touch swipes, stopped at frame ~37 to free the CPU): swipes work, but the tunnel top
   is an orange smear, Benny banks to ~30 deg and slides partly off-screen on a left lane change, lilac smear in the lower water.
   Root cause found: the Marble world's rings and its water plane do NOT line up with the painting (water plane tilted: a tunnel
   parallel to it would put the vanishing point 138 px above the painted core).
3. NEW METHOD — tunnel kit from the ORIGINAL pixels (`tools/kit05/`), user's plan step 3:
   * `kit_model.py`: ONE straight tunnel, evenly spaced gold rings, fitted to the painted rings (ring tops within ~5 px for rings 2,3,5-8,
     8 px ring 4; sides within ~10 px). The painting is not strict perspective: from ring 2 inward each ring is ~1.52x deeper than the
     previous (constant ratio). Every scenery vertex goes through a camera-relative depth curve g() along the tunnel axis: identity up to
     ring 2 (Benny, his water, controls = plain 3D), exponential beyond (the painting's ring ratio from EVERY camera position; like the
     "curved world" shaders of endless runners). Water plane parallel to the axis, camera 0.734 above it (round-32 scale).
   * `bake_kit.py`: wall (periodic ring-to-ring tile), gold ring, water textures = bilinear samples of the APPROVED picture where the
     surface lands in the approved camera view (no AI). Hidden spots: walls → round-32 clean plate (last resort, penalised x4);
     water → the user's ORIGINAL isolated water art (`references/water/05_water_isolated_original.png`, colour-matched).
   * `kitgame.html` (= play3.html-compatible page): kit scenery + the round-32 Benny + UNCHANGED `controls.js` (swipes, lanes, leap, dive,
     coins, splash, camera springs) → runs in the existing acceptance harness `tools/marble05/viewer/final_acceptance.cjs`.
4. Short-section test (first 7.6 s of the level, fixed swipe plan L L R U R R D L U L, real CDP touch, 412x915 Android portrait):
   10/10 swipes ok, lanes -1/0/+1, no teleports (max 0.041/frame), up/down smooth (max 0.067/frame), camera smooth, 0 errors,
   2.5 s/frame in SwiftShader (splat build: ~25 s/frame). Evidence: `qa/kit05/r33/` (runs/kit_v2 test_results.json + mp4 + frames,
   compare/APPROVED_CURRENT_KIT_f0000|0015|0030.jpg, compare_r33.json).
   | scenery (HUD + Benny box excluded) | CURRENT splat | KIT |
   |---|---|---|
   | frame 0 share within 20 levels of approved | 12.7 % | 64.5 % |
   | frame 0 mean abs diff | 60.5 | 24.3 |
   | frame 0 SSIM | 0.19 | 0.61 |
   | frame 0 colour-look corr | 0.55 | 0.98 |
   | frame 0 sharpness vs approved | 0.30 | 0.72 |
   | frames 15 / 30 colour-look corr | 0.36 / 0.25 | 0.71 / 0.73 |
   | frames 15 / 30 sharpness | 0.34 / 0.36 | 0.60 / 0.64 |
   => the kit is the stronger approach (user's rule: extend only if demonstrably better without damaging gameplay: met).

## Round 33b progress (same session, ~15:40 UTC)
* Own-pixel LOD: first 8 wall sections + 9 rings carry their OWN painted pixels (atlases `wall_own.png`, `ring_own.png`), cross-faded
  to the sharp shared section as Benny approaches (ratio distance-now / distance-at-start 0.85 -> 0.55). BUG FOUND + FIXED: three.js keyed
  all kit shader programs on the same onBeforeCompile source, so the own-pixel materials silently used the plain program
  (`customProgramCacheKey`). Texture mip bias -0.7 (`?kbias=`). Start frame scenery: 80.0 % within 20 levels (was 64.5), mean diff 14.6
  (24.3), SSIM 0.76 (0.61), colour 0.992, sharpness 0.75 (`qa/kit05/r33/compare/compare_own_pixels_frame0.json`).
* Whole-level kit (32.16 u, round-32 coin layout, ending = warm golden light like round 32b): stills `qa/kit05/r33/level_v3/`.
  Tunnel consistent to the end. RIVER NOT GOOD YET: the flowing tile (`river_tile.png`, water art t 0.95-5.45, period 4.5 u, seam
  cross-fade 0.9 u) shows blocky pink/red bars + a repeating grid in the mid / far distance and a horizontal seam where painted -> tile.
  Cause: tile columns outside the water art's river were filled with flow-stretched texels; far distance squeezes many periods.
  Next: river ribbon + foam banks architecture (river width/S from the painting, banks textured from the painted foam), or a two-phase
  flow-map water shader (no seam), far-distance mip bias >= 0; then the whole-level acceptance.

## Round 33c-k progress (same session, up to ~17:15 UTC) — kit game page `tools/kit05/kitgame.html` (= play3.html in /tmp/rainbow_r33/kitgame)
* Water: the PAINTED water at the same distance ahead as in the approved view (camera-relative: the near water keeps the painting's
  look at every moment, incl. its gold bottom rim), streaming toward the camera with a two-phase flow map (`flowl` 0.10) + the round-32
  flowing glints; a Lab colour match tried on the flowing tile made the cyan greener (colour look 0.70 -> 0.41) and was replaced.
* Walls: own painted pixels cross-fade to the shared section at distance ratio 0.62 -> 0.42 (was 0.85 -> 0.55: washed-out blends).
  Foam band strips (the painting's own foam) along both wall bases where the shared section shows.
* Coins: run 1 = the APPROVED picture's coins (`painted_coins.py`), run 2 moved after the leap arc; controls' extra coin shrink
  undone (the depth curve already gives painted sizes); on-screen declutter; coinScreen()/coinLayout() report what is DRAWN.
  Start coins vs painted (x, y, r): 231,433,24.5 / 273,394,18.2 / 236,365,13.5 / 218,343,9.8 / 226,325,6.9 / 244,317,5.4 vs
  227,434,25 / 274,390,18.4 / 234,357,14.5 / 206,342,11.4 / 227,325,7.5 / 244,317,5.4.
* Benny: scaled to the painted outline (0.76, 0.82, 0.8) and moved to the painted place (+0.085 up, -0.04 side): 229 x 275 px at
  x 82-311 vs painted 226 x 250 at 86-312. Camera follows lanes 75 % (c_CAM_LAT_K 0.75, MAX 0.2), bank c_LEAN_K 0.09 (controls.js unchanged).
* BUGS FOUND + FIXED (all mine this round): a `//` comment placed mid-line swallowed code three times (return line, Benny scale,
  scene.add(splash) — the white splash was never in the scene); a uniform nested inside another (hard river seam); three.js program
  cache key shared between kit materials. Scan for code after `//` is clean.
* Harness (`tools/marble05/viewer/final_acceptance.cjs`, stricter only): extra leaps / dives balanced so every direction is used >= 4x.
* Full-level verdict before the Benny / splash fixes (kit_full7): 18 / 19 PASS (G6 test plan only). True start frame now: scenery
  80.0 % within 20 levels, SSIM 0.76, colour 0.993; whole frame incl. Benny / splash / coins 67.1 %.

## Open items before the FULL Screen 05 (in order)
1. Start view → ~90 %: per-section "own pixels" textures for the first ~6 sections (exact painting at frame 0), cross-faded to the
   sharper periodic tile as the camera approaches (LOD cross-fade). Same for rings.
2. River for the whole level (32.16 u): the painted river only covers ~20 u; build a periodic flowing river (seamless, mirrored, flow
   scroll) from the painting's best near water + the isolated water art, blended in where the painted river ends / near the camera.
   Remove the far pink fragments (fill boundaries). The painting's gold bottom frame is baked on the near water (slides under the
   camera in the first ~0.3 s): replace by ring-0 geometry or crop it from the water bake.
3. Paddles (gold lids) are baked flat on the walls → model them as 3D lids (Blender) textured from the painting.
4. Controls tuning (no code change): bank onset 5 deg/frame (limit 3) → try `?c_LEAN_K=0.13`; coins: up to 4 overlapping pairs in 130
   frames → check the far-coin fade (6.5-9 u) and the coin layout on the straight kit river.
5. Benny model is ~28 % wider than the painted Benny (character, not scenery) → `benny-character-artist` if the user wants it.
6. Then: whole-level acceptance (`final_acceptance.cjs` without PLAN=fixed) + `visual_check.py` + `acceptance_verdict.py`, fix until
   everything passes; only then the gameplay recording for the user.

## How to resume
```
bash docs/briefs/2026-11-21-r32/setup_r32.sh /tmp/rainbow_r32          # round-32 workspace (Benny assets, controls.js, three.js)
mkdir -p /tmp/rainbow_r33/kit /tmp/rainbow_r33/kitgame
python3 -I tools/kit05/bake_kit.py /tmp/rainbow_r33/kit                  # ~15 s, free
cd /tmp/rainbow_r33/kitgame && for f in wall.png ring.png river.png kit.json; do ln -sf ../kit/$f $f; done
for f in node_modules benny31.glb bake.png splash.png coin.png bubble.png glint.png controls.js; do ln -sf /tmp/rainbow_r32/merged/$f $f; done
cp /home/user/rainbow-/tools/kit05/kitgame.html play3.html
PLAN=fixed NODE_PATH=$(npm root -g) node /home/user/rainbow-/tools/marble05/viewer/final_acceptance.cjs /tmp/rainbow_r33/kitgame /tmp/rainbow_r33/runs/kit_vN 7.6 1.4
python3 -I tools/kit05/compare_r33.py /tmp/rainbow_r32/runs/merged_short /tmp/rainbow_r33/runs/kit_vN /tmp/rainbow_r33/compare 0,15,30
```
