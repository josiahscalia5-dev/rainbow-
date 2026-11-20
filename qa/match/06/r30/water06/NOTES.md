# Screen 06 water in motion: water06 r30b (`&w30=1`)

Worktree `/home/user/wt/water06`, LOCAL branch `claude/rainbow-s06-water06-c32`. Nothing is committed or pushed. This continues the r30 work
that stopped at ~22:14 (the third shader iteration had been written but never rendered).

## Query addition
`&w30=1` added to `qa/match/06/r30/QUERY_NEW_v2.txt` gives NEW. It needs `match06=1&m06geo=1&m06flow=1`, which v2 already has.
Optional tuning switches: `w30f` flow speed u/s (2.2) · `w30v` vein strength (1) · `w30rb` rainbow (1) · `w30rk` rainbow-strip strength (0.8) ·
`w30e` |l|/Wc where the pink side starts (0.62) · `w30sp` glints (1) · `w30t=a,b` vein tile u (2.2,3.8) · `w30rip` swirl rings round Benny
(0.55) · `w30old` share of the old streak strip kept (0) · `w30st=a,b` start hand-over by camera distance (0.02,0.6).

## Files (all new code sits behind `w30`)
* `src/world/m06water30.ts` (new): the GLSL `w30Water()` (compiled only under `#define W30`) and `setupW30()`, which loads the texture, sets the uniforms and the define.
* `src/world/match06.ts`: 4 hook points (import, `${W30_GLSL}` before `main()`, `#ifdef W30` call in the river (`riv`) branch, `await setupW30(floorMat, qs, FLOW)`).
* `assets/textures/match06/tile_w30veins.png` (new, 512², 241 KB, tileable: R = jagged electric veins, G = branching caustic net, B = star glints).
* `tools/match06/w30_make_veins.py` (generator, free, local, seed 30), `tools/match06/w30_flowfix.mjs` (QA: fixed camera, shader clock advancing).
* Self-contained patch of only these changes: `w30_water06.patch`. It reverse-applies cleanly to the worktree.

## What the shader does (river floor `m06_floor` + the `m06leg` ribbon; it follows the route, using lateral l × course s)
Azure core lit by bright-cyan glow zones (volume) → blue-violet → saturated magenta → hot pink → lavender at the foam. The colours were
measured on the storyboard panels; the pinks are set deeper to make up for the bloom. A thin iridescent rainbow strip (cyan, mint, yellow,
peach, pink) sits between the cyan and the pink. It comes and goes along the river, separately on each side. The colour bands meander and
drift with the flow. There are white electric veins and a crackle net (two texture reads, different scales and speeds, flickering), soft
glossy curved light lines on the pink, drifting sheen patches, a grazing-angle reflection, twinkling glints and swirl rings spreading round
Benny. Everything is anchored to the world and flows downstream (+s) at 2.2 u/s, the same convention as the existing m06flow river. While
Benny swims (about 13 u/s) the pattern therefore streams toward the camera. `w30f` < 0 would reverse it.
Mobile cost per floor pixel: +4 texture reads of one 512² texture (2 of them mip-biased) and about 90 ALU, no loops. The old strip reads still run (needed for the start hand-over).

## Measured (`compare/`, `new/`, `before_v2/`, real game captures 864×1536, shader clock pinned)
* Start view (s 198.91): 0 of 1,327,104 pixels differ from BEFORE. With w30 off, BEFORE v2 is pixel-identical to the r30 baseline rendered before the hook existed.
* Streakiness of the lower water beside Benny (median structure-tensor coherence: 1 = parallel streaks, lower = isotropic):
  panels 1–4: 0.47 / 0.47 / 0.51 / 0.46 · BEFORE: 0.91 / 0.87 / 0.87 / 0.82 / 0.90 (s 214.86 / 238 / 266 / 310 / 387) ·
  **NEW: 0.49 / 0.51 / 0.60 / 0.51 / 0.48**.
* Hue share in the same regions (cyan / blue-violet / pink): panels 37–48 / 22–30 / 12–21 % · BEFORE 51–74 / 14–20 / 6–10 % · NEW 38–67 / 16–34 / 5–22 %.
  (The "warm" share at s 266 is the near coin. The white share is low in both game versions because there is less foam in these regions than in the panels.)
* Flow: `W30_clip_2s_1x.mp4` (48 frames of real gameplay from the checkpoint, `clip_frames/`, strip `W30_clip_frames_0_3_6_12_24_47.jpg`):
  approved start → 3D water by about frame 6, then it streams while swimming. `flow_fixedcam/t00–t05`: camera fixed at s 266, clock +0.25 s per frame. The pattern moves and flickers, and 34 % of water pixels change between t00 and t05 (2.6 % in the tunnel).

## Honest verdict
The long scratch-like speed streaks and the stretched look are gone: coherence is down to the panels' level. The river now reads like the
panels: a bright cyan-blue centre with sparkly veins, vivid pink/magenta sides with glossy lines, and rainbow strips appearing now and then.
It flows and is not static. It is closer, not identical.

## What still differs
* The painted water has more large swooping curved light streams (especially the approved picture's lower water and the hand-over at frames 3–6). Mine has more jagged lightning-like veins and finer detail.
* The pink sides at mid distance are still a fairly regular band. The panels show wider, more varied lavender-pink zones and more rainbow on the left sides (panels 1–2).
* The river's on-screen width and curvature come from the lead's camera/route (the game river looks wider near Benny than in the panels). The foam banks and the splash ring are other workers' tasks.
* Not tested: steering, gameplay or Android performance (the lead runs those on the combined build).
