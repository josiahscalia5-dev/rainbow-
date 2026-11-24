// Rainbow Unity - Screen 05 ROUND 5 (written 2026-11-24 ~08:55 local by the coordinator of session 018893e6, new account, after Round 4b ended at
// 80.5 / 66.6). Exactly TWO specialists (user rule): RIVER (near water / Benny's contact / splash first, then mid water + foam rims) |
// TUNNEL (upper walls + rings + corners + paddles + near frame, plus the iridescent BUBBLES). The coordinator does the global look (automatic fitter
// -> Assets/Rainbow/Tuning/screen05_tuning.txt), HUD, integration and the report. Same proven tools and rules as round4b-visual.workflow.js.
// LAUNCH / CONTINUE (Unity open + `unity status` ready): Workflow({ scriptPath: "C:\\RainbowUnity\\staging\\shared\\round5-visual.workflow.js",
//   args: { baseline: { still, sbs, scores }, skip: [...], notes: { river: "...", tunnel: "..." } } })
// If interrupted: read the run's journal.jsonl; a lane with a "result" goes into skip; describe the other lane's newest files in notes.
export const meta = {
  name: 'screen05-round5',
  description: 'Screen 05 round 5: RIVER (near water, Benny contact, splash, foam) and TUNNEL (walls, rings, paddles, frame, bubbles) - two specialists',
  phases: [{ title: 'Round 5', detail: 'two lanes in parallel: RIVER | TUNNEL' }],
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
start. Their Unity side is an OLD mid-edit still (white walls, wedge paddles) that is already fixed: judge against the CURRENT baseline below, use the guides
for WHAT the user wants. Goal: at least 85 now, final target 90-95 % likeness; SUBSTANTIAL visible improvements, not tiny adjustments; GEOMETRY / SHAPE /
BRIGHTNESS PATTERN first, materials second. Reference overlays are for measuring only, never part of the game. Keep real playable 3D, camera, controls,
animations. CONSERVE CREDITS: no long explorations, no reports in the middle, batch your tool calls, at most ~8 Unity cycles, stop when the next step would
gain less than ~0.2 points.

BINDING RULES: no stationary background pictures, no projecting the reference (or any screenshot) onto geometry, no baked projection textures
(assets\\textures\\water05\\proj05_*, tunnel05\\*, paint\\05k0_*). Honest stills only: the cycle tool's 864x1536 Game view at Benny s = 14.00 with the
normal gameplay camera; never move/hide things only for the capture, never change the capture or measure tools. Edit only files you own, inside
UnityProject\\Assets\\Rainbow (plus your own small eval files UnityProject\\AgentScripts\\screen05_<lane>_*.cs). NEVER delete files, run git commands that
change anything (a Windows task autosaves every 5 minutes), install or download anything, close / reopen / restart Unity, change project or editor
settings, or touch ~\\.claude. BACK UP every existing file before your first edit (copy to
C:\\RainbowUnity\\UnityProject\\Recordings\\Screen05\\work\\backup_round5\\<lane>\\). Final values must live in code (builders / shaders / scripts): the
scene and .mat files are regenerated on every cycle. Animation uses the shared clock only (C# Screen05Clock.Time, shader global _RainbowTime).
Keep steering, jumping, coins, hearts, HUD, pause, finish, restart working; scenery must stay consistent while Benny moves; mobile budget
(Intel N150 iGPU, 8 GB RAM: cheap shaders / meshes, no extra full-screen passes, no big textures). KEEP ONLY IMPROVEMENTS (restore from your backup
otherwise). Disk is tight (~6.5 GB): at most 6 variant stills per cycle, reuse the same variant file names / tag so old ones are overwritten.
GLOBAL LOOK IS FITTED BY THE COORDINATOR: post-processing (Bloom, ColorAdjustments, Vignette, tonemapping) and the light intensities (KeySun05, ThroatWarm05,
CameraFill05) come from Assets\\Rainbow\\Tuning\\screen05_tuning.txt, applied at the END of every scene build (it overrides builder values). Do not change
those; fix shapes, patterns and your own materials instead. Never edit the tuning file.

STATE (coordinator, 08:55 local): Round 4b raised the honest score from 67.0 / 47.5 to 80.5 / 66.6 (ROUND4_FINAL = a full rebuild, gameplay check passed):
data-driven S-river (Water/Scripts/RiverLayout05.cs table + _RiverLut texture), river glints (RiverGlints.cs + RainbowRiverGlints.shader), foam ropes
(FoamBank.cs + RainbowFoamBank.hlsl), wake / splash (SplashWake.cs, RainbowSplash.shader, RainbowWakeFoam05), copper tunnel look (EnvironmentBuilder round-4
values, DrumMeshes05 half-moon paddles, RainbowGoldMetal / RainbowDrumWall / RainbowPolish05 / DrumPolish05), coins on the approved centres. FINAL, do not
change: DrumLayout05 AxisS / AxisXs / AxisYs / AxisRs / ApprovedRingS (rings within 0.5-2.6 px of the approved circles), the camera, the HUD, the coin
centres, RiverLayout05's traced waterline / band tables (refine only where a measured edge is >6 px off).
BASELINE for you: ${BASE.still || ''} ; side-by-side ${BASE.sbs || ''} ; scores (visual / layout): ${BASE.scores || ''}
WHERE THE POINTS ARE LOST (tools\\diag\\errormap.ps1 on ROUND4_FINAL: structure 10.1, colour 6.2, histogram 3.2 points; -Oracle = OVERALL if only that region
were perfect): splash + near water y 1100-1536 +4.5 visual / +8.1 layout (by far the biggest); upper walls + rings y 190-480 +2.4 / +4.3; HUD +2.3 (coordinator);
river mid y 480-800 +2.3 / +3.6; Benny box +2.1 / +4.1; water right y 800-1200 +1.8; water left +1.6; left wall + foam y 480-800 +1.4; bottom corners + arc +1.0;
right wall + foam +0.9. Worst 96 px blocks (structure / colour x100): (192,1152) 19/7, (192,1248) 17/6, (672,576) 17/6, (0,672) 15/10, (480,1344) 15/3,
(576,1344) 15/5, (96,1248) 14/5, (0,384) 13/5, (192,768) 13/2, (288,768) 13/2, (288,672) 13/5, (672,672) 13/7, (0,1440) 13/7, (192,1344) 13/2, (480,1152) 12/8,
(576,1152) 12/6, (0,0) 12/3, (768,0) 12/5. The score rewards big bright / dark shapes in the right place: MATCH THE BRIGHTNESS PATTERN at 16-64 px scale first.

TOOLS (read-only, use them freely):
- tools\\diag\\errormap.ps1 -Still <png> [-Oracle] [-BlockX 48 -BlockY 48] [-Heat <jpg>]: where the OVERALL score loses points.
- tools\\diag\\gridshapes.ps1 -X -Y -W -H -Zoom -Step -Out <jpg> [-Img <png>] [-Shapes "c:cx,cy,r;p:x,y,x,y"]: zoomed crop with pixel grid + test outlines.
- tools\\diag\\cropstack.ps1 -Unity <png> -X -Y -W -H -Scale -Out <jpg>: approved | Unity crop pair. tools\\diag\\colorgrid.ps1: mean colours per box.
- tools\\diag\\measure-compact.ps1 <png> ...: one score line per still. staging\\round4-recovery\\rowclass.ps1: colour-class runs per row.
TEST CYCLE (the only way you drive Unity; one at a time, it waits for the other lane's lock):
  powershell -NoProfile -ExecutionPolicy Bypass -File C:\\RainbowUnity\\tools\\screen05-cycle.ps1 -Tag <lane>5_t<N> -Areas <light|water|foam|splash|all> [-NoRebuild]
  [-EvalAtHold AgentScripts/<x>.cs] [-Series]   (timeout 600000). It recompiles, waits for the domain reload, rebuilds the scene from the builders, plays, holds at
  s = 14.00, captures, scores, prints compile errors / console. Exit 3 / 4 / 6 right after a C# edit = wait 25 s and rerun. If compile errors are in the OTHER lane's
  files, wait ~90 s and rerun. Pipe the output through Select-String to keep only STILL / SBS / area / exit / error lines (saves credits).
- LIVE VARIANTS (decide looks cheaply): AgentScripts/screen05_tunnel_r4tune.cs / screen05_water4_tune.cs read a variants text file and save one still per variant at
  the hold (see their headers); then measure-compact.ps1 on all of them. Copy winning values into the builders / shaders.
- Gameplay check after your final cycle (Editor paused at the hold, run from C:\\RainbowUnity\\UnityProject): C:\\Users\\josia\\AppData\\Local\\Unity\\bin\\unity.exe command script eval
  --project-path C:\\RainbowUnity\\UnityProject --timeout 150 -- --file AgentScripts/screen05_playtest_check.cs --timeout 120  (08:45 result: steer L x -4.20, R x -0.24, jump h 1.20 +
  landing, score 1420 -> 1440, hearts 5 -> 5, state Swimming).
FINISH with ONE cycle tagged <lane>5_final -Series (exit 0), look at its s = 10 / 20 stills, run the gameplay check, and return the structured result honestly
(scores before / after, what improved, what still differs, files changed).
`

const RIVER = `
YOUR LANE: RIVER (tag prefix: river5; cycle areas: water,foam,splash as needed). Owns Shared/RiverPath.cs (keep the API), Water/Scripts/RiverLayout05.cs,
RiverSurface.cs, RiverMeshGenerator.cs, FoamBank.cs, SplashWake.cs, RiverGlints.cs, Water/Shaders/RainbowRiver.*, RainbowRiverGlints.shader, RainbowFoamBank.hlsl,
RainbowFoam.*, RainbowWaterCommon.hlsl, RainbowSplash.*, RainbowSpray.*, RainbowFarRiver.* (Environment/Shaders), WaterBuilder.cs (river / foam / splash parts only,
NOT BuildLights / BuildPostFX). Do NOT touch walls, rings, paddles, frame, bubbles (BubbleField / RainbowBubble), coins (CoinTrail), HUD, Benny's body, the camera.
User's guides for you: #4 S-current (keep the traced S; BROAD smooth directional cyan and pink flowing highlights and depth; SHRINK the large white star sprites
into subtle moving glints), #5 foam (a NARROW, IRREGULAR rim of soft clustered foam with MIXED puff sizes), #6 Benny + water contact (natural waterline, a small
BUBBLY wake with FINE droplets / spray, no artificial dark floating gap).
Do this in order (biggest measured gain first):
(1) NEAR WATER + BENNY'S CONTACT + SPLASH, y 1100-1536 (oracle +4.5 / +8.1). Approved: the water below / beside Benny is open saturated azure-cyan with BROAD bright
  arcs bowed over his track and white flares at about (345,1345), (500,1340), (230,1395), (635,1405), (510,1480); the two PINK wake sweeps SPLAY OUTWARD: left from
  (265,1235) to (110,1385), right from (575,1235) to (715,1385) (~55-90 px wide, violet edges), with a foam rope along the OUTER edge of each sweep (left (205,1195) ->
  (60,1310), right (600,1195) -> (795,1310), white puffs 20-40 px) and small lather at (150-200,1370-1420), (630-690,1340-1410). Current Unity (baseline sbs): the pink
  sweeps run almost straight DOWN close under Benny (left ~(350,1250)->(270,1440), right ~(560,1250)->(650,1440)), the centre below him is busy, and the spray is two
  heavy white fans. Benny's bottom must sit IN the water (waterline y ~1185-1195 at x 300-560, soft azure see-through shade, no hard edge); from both lower flanks
  (x 240-300 and 560-620, y 1090-1200) fans of FINE white droplet streams radiate outward / downward ((300,1190)->(215,1290), (530,1190)->(600,1290)) - a starburst of
  thin streaks, lacy, not solid blobs - plus bubbly foam (130-290, 1130-1230) and (570-690, 1110-1230). Check steering / jumping with
  -EvalAtHold AgentScripts/screen05_splash_steerjump.cs (the wake must follow Benny; nothing may hang in the air while he jumps).
(2) MID RIVER LOOK y 480-1100 (+2.3 / +3.6, plus water left / right +1.6 / +1.8): glossy satin, not flat paint: saturated azure (0,150,240) .. cyan (0,200,250) core
  with BROAD soft white-cyan light streaks along the flow; hot magenta bands (235,45,200) .. (250,90,230) with SOFT violet edges and their own long glossy highlights;
  small white 4-point glints with short streaks where the approved has them (no big ~40 px stars on the near water). Measure the 16-64 px brightness pattern.
(3) FOAM RIMS (left y 480-800 +1.4, right +0.9): the left mid rim is a stair-stepped zig-zag wall of puffs in Unity; approved = a soft irregular clustered rim with
  mixed puff sizes hugging the waterline smoothly: top edge (425,505) (385,525) (340,540) (300,555) (270,570) (240,590) (200,600) (170,625) (140,640), the bay lobe
  (150-290, 640-720) with bluish open water at (200-240, 640-680) behind it, then (90,725) (40,755) (0,785); right rope top (600,545) (560,548) (600,575) (640,585)
  (700,600) (760,620) (800,640) (830,665), the curl (700-860, 760-950) with the purple wall visible behind it at (780-864, 830-960); keep that rope narrow (~60-90 px).`

const TUNNEL = `
YOUR LANE: TUNNEL + BUBBLES (tag prefix: tunnel5; cycle areas: light,bubbles). Owns Environment/Shaders/*, Environment/Scripts/DrumMeshes05.cs, DrumPolish05.cs,
NearFrame05.cs, DrumLayout05.cs ONLY the paddle table / paddle constants and band profiles, Environment/Editor/EnvironmentBuilder.cs (materials, NOT lights / post),
and the bubbles: Water/Scripts/BubbleField.cs + its shader / RainbowBubble05 material values in the builders. Do NOT touch water, foam, splash, glints, coins,
HUD, Benny, the camera, BuildLights / BuildPostFX.
User's guides for you: #1 rings (keep the measured ring centres; match band width, bevel profile and depth spacing; BROAD polished COPPER faces with defined
bevels, not glowing tubes), #2 paddles (WIDE, SHALLOW half-moon trays: a shallow wide curved block, rounded rim, flat visible underside; fit EACH paddle separately
- angle + underside to the wall; no pointed / hanging wedges), #3 walls (reflective saturated MAGENTA-VIOLET metal, elongated DARK recessed slots, narrow bright
reflections / streaks, depth; no white stripes, no flat colour), #8 foreground frame (rich copper-gold band, visible edges, directional reflections, no white
clipping), #5 bubbles (CLEAR, transparent blue-pink iridescent bubbles of VARIED size floating ABOVE the foam rims, not opaque beads across the water).
Do this in order (biggest measured gain first):
(1) UPPER WALLS + RINGS y 190-480 (oracle +2.4 / +4.3) and the TOP CORNERS (blocks (0,0) 12/3, (768,0) 12/5): between ring N and ring A the Unity walls show rows of
  short BRIGHT WHITE dashes; approved = DARK elongated recessed slots (dark plum, ~12x38 px near the left wall, neat rows ~25 px apart, thin dashes deeper between
  rings A and B) with a glowing magenta lip, on polished violet metal ((110,20,165) .. (150,30,185) between light lines, (225,60,220) hot pink near them) with bright
  pink-white LIGHT LINES running lengthwise from every lamp azimuth of the rings (20 per turn; e.g. (415,240)->(455,310), (490,235)->(492,300), (565,245)->(545,300),
  (640,300)->(590,335), (340,300)->(405,345); between N and A: (120,265)->(210,345), (190,190)->(245,260), (560,120)->(570,190), (750,255)->(660,310)). Top corners
  beyond ring N (y 0-200, x 0-110 and 820-864) = bright magenta walls with diagonal light streaks. Then ring faces: chunky polished copper-gold bands (thin dark
  red-brown outer edge, a bright hair line, the wide polished main band, an inner lip; body (255,150,75) .. (255,190,115), darker (200,90,35) between lamps, white-yellow
  hot highlight across the band at every lamp, ~22 px wide on ring A).
(2) LEFT WALL x 0-100, y 384-800 (blocks (0,384) 13/5, (0,672) 15/10) and the right wall block (672,576) 17/6, (672,672) 13/7: compare crops, fix the bright / dark
  pattern (slots, streaks, paddle bodies). PADDLES: check each projected outline against the approved within ~5 px (BIG LEFT band top edge (65,355) (76,338)
  (100,316) (120,314) (145,323) (180,346) (204,374) (213,400); BIG RIGHT left tip (720,512), top edge (735,487) (760,460) (800,430) (850,402) (864,399); MID LEFT
  x 250-333 y 419-472; MID RIGHT (631-696, 394-452); small / tiny ones near (373-440, 458-478) and (553-622, 434-458)); thick polished band facing the rider, thin
  rose-brown underside sliver.
(3) BUBBLES: approved ~25-35 clear iridescent bubbles, the biggest (40-70 px) beside the foam rims and near the frame - e.g. near (95,860), (130,1050), (75,1310),
  (735,1255), (790,925), (175,628), (800,690), (640,1395), (95,1000) - thin bright rim, transparent centre showing the water, pink / blue / gold rim tint, a small
  white highlight; small ones (6-15 px) scattered over the foam. Measure bubbles_left / bubbles_right areas; keep them away from Benny and the coins.
(4) NEAR FRAME + BOTTOM ARC (+1.0): rich copper-gold with white-hot glints near (25,1370), (840,1330); arc top edge (110,1536) over (430,1456) to (760,1536) with gold
  highlights around (350,1480) and (560,1490).`

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

const LANES = { river: RIVER, tunnel: TUNNEL }
phase('Round 5')
const keys = ['river', 'tunnel'].filter(k => !SKIP.includes(k))
const res = await parallel(keys.map(k => () => agent(COMMON + '\n' + LANES[k] + (NOTES[k] ? '\n\nNOTES FOR YOUR LANE:\n' + NOTES[k] : ''),
  { label: 'lane:' + k, phase: 'Round 5', schema: SCHEMA, effort: 'high' })))
res.forEach((r, i) => log(keys[i] + ': ' + (r ? r.status + ' ' + r.scores_after : 'no result')))
return { lanes: keys, results: res }
