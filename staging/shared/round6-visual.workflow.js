// Rainbow Unity - Screen 05 ROUND 6 (written 2026-11-24 ~09:55 local by the coordinator of session 018893e6, after Round 5 ended at 82.5 / 68.1,
// git tag validated/r5-final-82.5). Exactly TWO specialists (user rule): SPLASH (Benny's water contact + starburst splash + near water) |
// SHAPE (foam rims, far S-river into the throat, ring N's right side). The coordinator does the global look / material polish (automatic fitter ->
// Assets/Rainbow/Tuning/screen05_tuning.txt), HUD, integration and the report. Same proven tools and rules as round5-visual.workflow.js.
// LAUNCH / CONTINUE (Unity open + `unity status` ready): Workflow({ scriptPath: "C:\\RainbowUnity\\staging\\shared\\round6-visual.workflow.js",
//   args: { baseline: { still, sbs, scores }, skip: [...], notes: { splash: "...", shape: "..." } } })
// If interrupted: read the run's journal.jsonl; a lane with a "result" goes into skip; describe the other lane's newest files in notes.
export const meta = {
  name: 'screen05-round6',
  description: 'Screen 05 round 6: SPLASH (Benny contact, starburst splash, near water) and SHAPE (foam rims, far S-river, ring N) - two specialists',
  phases: [{ title: 'Round 6', detail: 'two lanes in parallel: SPLASH | SHAPE' }],
}

const SKIP = (args && Array.isArray(args.skip)) ? args.skip : []
const NOTES = (args && args.notes && typeof args.notes === 'object') ? args.notes : {}
const BASE = (args && args.baseline) || {}

const COMMON = `
You are one of exactly TWO specialists improving the user's EXISTING Unity port of their Rainbow game, Screen 05 "Flow Into the Current"
(Unity 6000.3.29f1, URP 17.3, project C:\\RainbowUnity\\UnityProject, Editor already OPEN). Do the task; do not talk to the user, do not start
other agents, do not suggest new sessions. Skim C:\\RainbowUnity\\CLAUDE.md first (binding project rules).

GROUND TRUTH: only the ORIGINAL approved image C:\\RainbowUnity\\references\\05_flow_into_the_current.png (864x1536). Look at it (Read) and at zoomed
crops of it. THE USER'S CORRECTION GUIDES ARE BINDING VISUAL DIRECTION: C:\\RainbowUnity\\references\\correction-guides-2026-11-24\\README.md (table per area)
+ the three guide images (full-resolution copies in its full-resolution\\ folder). Read README.md and look at the guide image(s) for YOUR areas before you
start. Their Unity side is an OLD mid-edit still that is already fixed: judge against the CURRENT baseline below, use the guides for WHAT the user wants.
Goal: substantial visible improvements toward the final 90-95 % likeness; GEOMETRY / SHAPE / BRIGHTNESS PATTERN first, materials second. Reference overlays
are for measuring only, never part of the game. Keep real playable 3D, camera, controls, animations. CONSERVE CREDITS: no long explorations, no reports
in the middle, batch your tool calls, at most ~8 Unity cycles, stop when the next step would gain less than ~0.2 points.

BINDING RULES: no stationary background pictures, no projecting the reference (or any screenshot) onto geometry, no baked projection textures
(assets\\textures\\water05\\proj05_*, tunnel05\\*, paint\\05k0_*). Honest stills only: the cycle tool's 864x1536 Game view at Benny s = 14.00 with the
normal gameplay camera; never move/hide things only for the capture, never change the capture or measure tools. Edit only files you own, inside
UnityProject\\Assets\\Rainbow (plus your own small eval files UnityProject\\AgentScripts\\screen05_<lane>_*.cs). NEVER delete files, run git commands that
change anything (a Windows task autosaves every 5 minutes), install or download anything, run Blender, close / reopen / restart Unity, change project or
editor settings, or touch ~\\.claude. BACK UP every existing file before your first edit (copy to
C:\\RainbowUnity\\UnityProject\\Recordings\\Screen05\\work\\backup_round6\\<lane>\\). Final values must live in code (builders / shaders / scripts): the
scene and .mat files are regenerated on every cycle. Animation uses the shared clock only (C# Screen05Clock.Time, shader global _RainbowTime).
Keep steering, jumping, coins, hearts, HUD, pause, finish, restart working; scenery must stay consistent while Benny moves; mobile budget
(Intel N150 iGPU, 8 GB RAM: cheap shaders / meshes, no extra full-screen passes, no big textures). KEEP ONLY IMPROVEMENTS (restore from your backup
otherwise). Disk is tight (~5.5 GB free): at most 6 variant stills per cycle, reuse the same variant file names / tag so old ones are overwritten.
TUNING FILE: Assets\\Rainbow\\Tuning\\screen05_tuning.txt (31 fitted values: post-processing, light intensities, and material values of DrumWall05, Ring05_Near/Far,
Paddle05, NearFrame05, RainbowRiver05 _RiverGrade / _EnvStrength, RainbowFoam05 / RainbowWakeFoam05 _Brightness, RainbowBubble05 _Intensity, RainbowRiverGlints05
_Streak, RainbowSplash05 _Intensity / _RopeAlpha) is applied at the END of every scene build and OVERRIDES builder values for those keys. Never edit it; change
shapes, patterns and other properties; if one of those exact values blocks you, say so in notes_for_next_agents.

STATE (coordinator, 09:55 local): ROUND5_FINAL = visual 82.5 / layout 68.1 (full rebuild, gameplay check passed; Round 4b 80.5 -> fitter global look 81.7 ->
Round 5 lanes 82.3 -> fitter polish 82.5). Round 5 did: pink wake sweeps moved outward + ~15 % wider and lighter glossy pinks (RainbowRiver.hlsl), lacier crown
droplets (_JetAlpha 0.6), wall grooves + 8 slot rows in the near bay (walls 87.1). Paddles project within ~2 px of the approved; bubbles match - leave both.
FINAL, do not change: DrumLayout05 AxisS / AxisXs / AxisYs / AxisRs and rings A-D, the camera, the HUD, the coin centres, RiverLayout05's traced tables for s < 25.
BASELINE for you: ${BASE.still || ''} ; side-by-side ${BASE.sbs || ''} ; scores (visual / layout): ${BASE.scores || ''}
WHERE THE POINTS ARE LOST (tools\\diag\\errormap.ps1 -Oracle on ROUND5_FINAL: structure 9.8, colour 5.5, histogram 2.2 points; oracle = OVERALL if only that region
were perfect): splash + near water y 1100-1536 +3.9 visual / +7.8 layout (biggest); HUD +2.1 (coordinator); river mid y 480-800 +2.1 / +3.3; Benny box +2.0 / +3.9;
upper walls + rings +1.8; water left / right y 800-1200 +1.5 / +1.6; left wall + foam y 480-800 +1.5 / +2.5; right wall + foam +0.9; bottom corners +0.8.
Worst 96 px blocks (structure / colour x100): (192,1152) 21/5, (672,576) 15/4, (0,672) 15/9, (480,1344) 15/3, (96,1344) 13/2, (192,1344) 13/2, (576,1152) 13/5,
(480,1248) 13/2, (192,768) 13/2, (288,672) 13/4, (672,672) 13/6, (0,1440) 13/6, (192,1440) 13/3, (576,1344) 13/2, (192,576) 10/4, (96,576) 12/3, (288,768) 12/2.
The score rewards big bright / dark shapes in the right place: MATCH THE BRIGHTNESS PATTERN at 16-64 px scale first.

TOOLS (read-only, use them freely):
- tools\\diag\\errormap.ps1 -Still <png> [-Oracle] [-BlockX 48 -BlockY 48] [-Heat <jpg>]: where the OVERALL score loses points.
- tools\\diag\\gridshapes.ps1 -X -Y -W -H -Zoom -Step -Out <jpg> [-Img <png>] [-Shapes "c:cx,cy,r;p:x,y,x,y"]: zoomed crop with pixel grid + test outlines.
- tools\\diag\\cropstack.ps1 -Unity <png> -X -Y -W -H -Scale -Out <jpg>: approved | Unity crop pair. tools\\diag\\colorgrid.ps1: mean colours per box.
- tools\\diag\\measure-compact.ps1 <png> ...: one score line per still. staging\\round4-recovery\\rowclass.ps1: colour-class runs per row. tools\\diag\\fit-rings.ps1: ring fit.
TEST CYCLE (the only way you drive Unity; one at a time, it waits for the other lane's lock):
  powershell -NoProfile -ExecutionPolicy Bypass -File C:\\RainbowUnity\\tools\\screen05-cycle.ps1 -Tag <lane>6_t<N> -Areas <light|water|foam|splash|bubbles|all> [-NoRebuild]
  [-EvalAtHold AgentScripts/<x>.cs] [-Series]   (timeout 600000). It recompiles, waits for the domain reload, rebuilds the scene from the builders, plays, holds at
  s = 14.00, captures, scores, prints compile errors / console. Exit 3 / 4 / 6 right after a C# edit = wait 25 s and rerun. If compile errors are in the OTHER lane's
  files, wait ~90 s and rerun. The first cycle after a C# edit can still use the OLD assembly ("Editor closed the connection", still unchanged, exit 0): rerun.
  Pipe the output through Select-String to keep only STILL / SBS / area / exit / error lines (saves credits). The other lane's edits land in your stills too:
  judge your work by YOUR area columns and same-hold variant comparisons, not only OVERALL.
- LIVE VARIANTS (decide looks cheaply): AgentScripts/screen05_river_tune.cs (variants file Recordings/Screen05/work/water4_variants.txt; hooks listed in its header and
  in Round 5's notes: river globals _R5Tune / _R5Arc / _R5Sw / _W4Tune, glints _R5Glint, splash material floats _JetAlpha / _StrandBack / _RootBack / _RopeAlpha / _Spread /
  _Len) and AgentScripts/screen05_tunnel_r4tune.cs (material / float variants) save one still per variant at the hold; then measure-compact.ps1 on all of them.
- Gameplay check after your final cycle (Editor paused at the hold, run from C:\\RainbowUnity\\UnityProject): C:\\Users\\josia\\AppData\\Local\\Unity\\bin\\unity.exe command script eval
  --project-path C:\\RainbowUnity\\UnityProject --timeout 150 -- --file AgentScripts/screen05_playtest_check.cs --timeout 120  (09:50 result: steer L x -4.20, R x -0.15, jump h 1.17
  + landing, score 1420 -> 1440, hearts 5 -> 5, state Swimming).
FINISH with ONE cycle tagged <lane>6_final -Series (exit 0), look at its s = 10 / 20 stills, run the gameplay check, and return the structured result honestly
(scores before / after, what improved, what still differs, files changed).
`

const SPLASH = `
YOUR LANE: SPLASH (tag prefix: splash6; cycle areas: splash,water). Owns Water/Shaders/RainbowSplash.*, RainbowSpray.*, Water/Scripts/SplashWake.cs,
Water/Shaders/RainbowRiver.hlsl + RainbowRiver.shader (the ONLY lane that edits them), RiverGlints.cs + RainbowRiverGlints.shader, WaterBuilder.cs (splash / river /
glint material values only, NOT BuildLights / BuildPostFX), and ONE narrow Benny item: a soft underside / waterline shade term on Benny's body (find Benny's
fur shader / material builder under Assets\\Rainbow\\Benny; add a new property, default off, set by the builder) - never change his shape, beanie, pompom,
star, face, colours above the belly, rig or controller. Do NOT touch foam banks (FoamBank / RainbowFoamBank), RiverLayout05 tables, the far river,
walls / rings / paddles / frame, bubbles, coins, HUD, the camera.
User's guides for you: #6 Benny + water contact (natural waterline, a small BUBBLY wake with FINE droplets / spray, no artificial dark floating gap), #4 water
(broad smooth directional cyan / pink flowing highlights and depth; subtle moving glints instead of big white stars).
Do this in order:
(1) STARBURST SPLASH (blocks (192,1152) 21/5, (576,1152) 13/5, (480,1248) 13/2, (192,1344) 13/2, (480,1344) 15/3): approved = a starburst of FINE white
  streams lying ON the water, rooted ALONG Benny's bottom contact line (x 300-560, y 1180-1290), radiating outward / downward like spokes: e.g. (300,1190)->(215,1290),
  (330,1200)->(270,1320), (420,1210)->(400,1330), (500,1205)->(530,1320), (530,1190)->(600,1290), plus longer thin rays out to (120,1300) and (740,1300); each ray is a
  thin bright core with lacy droplets, the water between them stays saturated cyan; bubbly foam clumps (130-290, 1130-1230) and (570-690, 1110-1230). Unity now: strands
  start on his FLANKS and read as spray beads; varying _RootBack / _StrandBack by parameter scored worse in Round 5, so RESHAPE the strand layout in
  RainbowSplash.shader SPL_Rope (and SplashWake.cs strand placement): roots spread along the contact line, short + long streaks radiating down and outward, lying on
  the water plane (follow RiverSurface.HeightAt), fading with distance. Keep it attached to Benny while he steers / jumps (-EvalAtHold AgentScripts/screen05_splash_steerjump.cs:
  nothing may hang in the air during a jump).
(2) NEAR WATER y 1250-1536: approved = broad luminous cyan arcs ~0.3 m apart bowed over Benny's track with flared white streaks on them and a dense vertical satin
  texture; Unity has thin arcs on smoother, darker azure (brightness / period alone did not score - change the arc SHAPE and width). White flares at about (345,1345),
  (500,1340), (230,1395), (635,1405), (510,1480).
(3) BENNY'S UNDERSIDE y 1168-1200 is 30-90 luma brighter than the approved darker fur underside where he sits in the water: a soft underside shade (and a thin
  azure see-through waterline band) so he sits IN the water with no hard edge and no dark floating gap.`

const SHAPE = `
YOUR LANE: SHAPE (tag prefix: shape6; cycle areas: foam,water,light). Owns Water/Scripts/FoamBank.cs, Water/Shaders/RainbowFoamBank.hlsl, RainbowFoam.*,
Water/Scripts/RiverLayout05.cs (ONLY rows / table points with s >= 25 - the near tables are final), RiverMeshGenerator.cs, Environment/Shaders/RainbowFarRiver.*,
and for item (3) only ring N in Environment/Scripts/DrumLayout05.cs + DrumMeshes05.cs (+ EnvironmentBuilder.cs ring N lines). Do NOT touch RainbowRiver.hlsl /
.shader (the SPLASH lane owns them; if you need a river-shader change, describe it in notes_for_next_agents), splash, glints, bubbles, coins, Benny, HUD, camera,
walls' material, paddles, rings A-D, lights / post.
User's guides for you: #5 foam (a NARROW, IRREGULAR rim of soft clustered foam with MIXED puff sizes), #4 S-current (keep the traced S; the river keeps winding
into the distance under the coin trail), #1 rings (keep the measured ring placement; broad polished copper faces).
Do this in order:
(1) FOAM RIMS y 480-960 (blocks (0,672) 15/9, (288,672) 13/4, (192,768) 13/2, (288,768) 12/2, (96,576) 12/3, (672,576) 15/4, (672,672) 13/6): the LEFT mid rim is a
  stair-stepped zig-zag wall / flat white terrace of puffs reaching x ~300 at y 750; approved = a soft, irregular, clustered rim with MIXED puff sizes hugging the
  waterline smoothly: top edge (425,505) (385,525) (340,540) (300,555) (270,570) (240,590) (200,600) (170,625) (140,640), the bay lobe (150-290, 640-720) with bluish
  open water at (200-240, 640-680) behind it, then (90,725) (40,755) (0,785); the wall shows above / behind the rim. Smooth WaterlineX / rope width in
  FoamBank.GenerateRopePuffs for s ~20-40 and mix puff sizes. RIGHT: rope top (600,545) (560,548) (600,575) (640,585) (700,600) (760,620) (800,640) (830,665), the curl
  (700-860, 760-950) with the purple wall visible behind it at (780-864, 830-960); keep that rope narrow (~60-90 px).
(2) FAR S-RIVER y 520-660 (blocks (480,576) 9/5, (384,576) 5/5): Unity's far river is a straight, wide striped ramp running up into the throat; approved = the narrow
  river keeps WINDING (S-curves) into the distance under the coin trail (coin centres are fixed and correct: follow them) and narrows into the bright vanishing
  point at (497,470); pink bands curve with it. Fix the far table points (s >= 25 in RiverLayout05) and / or RainbowFarRiver so the far bands / banks land on the approved.
(3) RING N RIGHT SIDE (blocks (768,0) 11/4, (768,96) 5/8, (768,288) 8/4): in the approved, ring N's copper band runs down the RIGHT edge at x ~810-860 from y ~100
  to ~330 (crop x 560-864, y 60-580: tools\\diag\\cropstack.ps1); in Unity it leaves the frame at the top right at y ~160-190. Coordinator decision: you MAY change
  ring N only (radius / centre offset / a slight ellipse or right-side squash in DrumLayout05 / DrumMeshes05) so its right side follows the approved, while its LEFT and
  TOP stay within ~2 px of today (verify with tools\\diag\\fit-rings.ps1 and cropstack); keep rings A-D, the axis, the camera and the HUD unchanged. Skip it if it
  cannot be done without moving the left / top.`

const SCHEMA = {
  type: 'object',
  properties: {
    area: { type: 'string' },
    status: { type: 'string', enum: ['improved', 'partly_improved', 'no_visible_change', 'reverted', 'blocked'] },
    scores_before: { type: 'string' }, scores_after: { type: 'string' },
    files_changed: { type: 'array', items: { type: 'string' } },
    changes: { type: 'array', items: { type: 'string' } },
    final_cycle_exit: { type: 'integer' }, final_still: { type: 'string' }, final_sbs: { type: 'string' },
    gameplay_check: { type: 'string' },
    improved: { type: 'array', items: { type: 'string' } }, still_different: { type: 'array', items: { type: 'string' } },
    notes_for_next_agents: { type: 'string' },
  },
  required: ['area', 'status', 'scores_before', 'scores_after', 'files_changed', 'changes', 'final_cycle_exit', 'final_still', 'final_sbs', 'gameplay_check', 'improved', 'still_different', 'notes_for_next_agents'],
}

const LANES = { splash: SPLASH, shape: SHAPE }
phase('Round 6')
const keys = ['splash', 'shape'].filter(k => !SKIP.includes(k))
const res = await parallel(keys.map(k => () => agent(COMMON + '\n' + LANES[k] + (NOTES[k] ? '\n\nNOTES FOR YOUR LANE:\n' + NOTES[k] : ''),
  { label: 'lane:' + k, phase: 'Round 6', schema: SCHEMA, effort: 'high' })))
res.forEach((r, i) => log(keys[i] + ': ' + (r ? r.status + ' ' + r.scores_after : 'no result')))
return { lanes: keys, results: res }
