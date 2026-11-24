// Rainbow Unity - Screen 05 ROUND 4b (written 2026-11-24 ~08:00 local by the coordinator of session b41bab30, after the account switch that
// ended run wf_ab41a260-945). Exactly TWO specialists (user rule): TUNNEL (paddles, rings, walls, near frame, throat, lighting) |
// RIVER (data-driven S-river + foam banks, then near water / Benny's water contact / splash). The coordinator itself does HUD, coins, bubbles,
// Benny's arms, integration and the report.
// LAUNCH / CONTINUE (Unity open + `unity status` ready): Workflow({ scriptPath: "C:\\RainbowUnity\\staging\\shared\\round4b-visual.workflow.js",
//   args: { baseline: { still, sbs, scores }, skip: [...], notes: { tunnel: "...", river: "..." } } })
// If interrupted: read the run's journal.jsonl; a lane with a "result" goes into skip; describe the other lane's newest files in notes.
export const meta = {
  name: 'screen05-round4b',
  description: 'Screen 05 round 4b: TUNNEL (paddles, rings, walls, frame, lighting) and RIVER (S-river, foam, splash) - two specialists',
  phases: [{ title: 'Round 4b', detail: 'two lanes in parallel: TUNNEL | RIVER' }],
}

const SKIP = (args && Array.isArray(args.skip)) ? args.skip : []
const NOTES = (args && args.notes && typeof args.notes === 'object') ? args.notes : {}
const BASE = (args && args.baseline) || {}

const COMMON = `
You are one of exactly TWO specialists improving the user's EXISTING Unity port of their Rainbow game, Screen 05 "Flow Into the Current"
(Unity 6000.3.29f1, URP 17.3, project C:\\RainbowUnity\\UnityProject, Editor already OPEN). Do the task; do not talk to the user, do not start
other agents, do not suggest new sessions. Skim C:\\RainbowUnity\\CLAUDE.md first (binding project rules).

GROUND TRUTH: only the ORIGINAL approved image C:\\RainbowUnity\\references\\05_flow_into_the_current.png (864x1536). Look at it (Read) and at zoomed
crops of it. THE USER'S NEWEST DIRECTION (2026-11-24 07:40 local): reach at least 70/100, preferably 75+, through SUBSTANTIAL visual improvements
instead of small adjustments; use the approved image as the master visual blueprint; compare projected outlines, sizes, angles, spacing and
positions of every major object with the real Game View; GEOMETRY first, MATERIALS second, LIGHTING third; prioritise the environment round
Benny: gold rings, half-moon paddles, reflective purple tunnel walls, foreground copper frame, S-shaped river, foam, bubbles, cinematic
lighting. Reference overlays are for measuring only, never part of the game. Keep real playable 3D, camera, controls, animations.
CONSERVE CREDITS: no long explorations, no reports in the middle, batch your tool calls, at most ~8 Unity cycles, stop when the next step would
gain less than ~0.2 points.

BINDING RULES: no stationary background pictures, no projecting the reference (or any screenshot) onto geometry, no baked projection textures
(assets\\textures\\water05\\proj05_*, tunnel05\\*, paint\\05k0_*). Honest stills only: the cycle tool's 864x1536 Game view at Benny s = 14.00 with the
normal gameplay camera; never move/hide things only for the capture, never change the capture or measure tools. Edit only files you own, inside
UnityProject\\Assets\\Rainbow (plus your own small eval files UnityProject\\AgentScripts\\screen05_<lane>_*.cs). NEVER delete files, run git commands that
change anything (a Windows task autosaves every 5 minutes), install or download anything, close / reopen / restart Unity, change project or editor
settings, or touch ~\\.claude. BACK UP every existing file before your first edit (copy to
C:\\RainbowUnity\\UnityProject\\Recordings\\Screen05\\work\\backup_round3v\\<lane>_r4b\\). Final values must live in code (builders / shaders / scripts): the
scene and .mat files are regenerated on every cycle. Animation uses the shared clock only (C# Screen05Clock.Time, shader global _RainbowTime).
Keep steering, jumping, coins, hearts, HUD, pause, finish, restart working; scenery must stay consistent while Benny moves; mobile budget
(Intel N150 iGPU, 8 GB RAM: cheap shaders / meshes, no extra full-screen passes, no big textures). KEEP ONLY IMPROVEMENTS (restore from your backup
otherwise). Disk is tight (~6.9 GB): at most 6 variant stills per cycle, reuse the same variant file names / tag so old ones are overwritten.

STATE (coordinator, 07:54 local): the geometry of the drum was just re-solved with the real camera (tools/diag/fit-rings.ps1) and is FINAL - do not
change DrumLayout05 AxisS / AxisXs / AxisYs / AxisRs / ApprovedRingS, the camera, or the HUD: rings N / A / B / C / D now project onto the approved circles within
0.5-2.6 px (N centre (453,485) r 492 wall / 424 crest; A (468,455) 265 / 225; B (486,453) 153.5 / 133; C (490,460) 92 / 80; D (496.5,469) 59.5 / 51).
The drum axis runs ~0.8 m left of the course line near the camera (DrumLayout05.AxisXAt(s), CentreY(s), RadiusAt(s) = barrel 6.8 -> 7.7 (ring A) -> 8.6 (ring B) ->
6.8 m; wall at height y: DrumLayout05.WallXAt(s, side, y)). The HUD was rebuilt (hud area 52 -> 74). Result: OVERALL 62.7 / 41.4 -> 67.0 / 47.5.
BASELINE for you: ${BASE.still || ''} ; side-by-side ${BASE.sbs || ''} ; scores (visual / layout): ${BASE.scores || ''}

TOOLS (read-only, use them freely):
- tools\\diag\\errormap.ps1 -Still <png> [-Oracle] [-BlockX 48 -BlockY 48] [-Heat <jpg>]: where the OVERALL score loses points (structure = SSIM of blurred
  brightness at ~16-24 px scale, colour = deltaE). The score rewards big bright / dark shapes in the right place: bright rings, highlights, foam,
  paddles, sparkles - so MATCH THE BRIGHTNESS PATTERN at 16-64 px scale first, fine texture last.
- tools\\diag\\gridshapes.ps1 -X -Y -W -H -Zoom -Step -Out <jpg> [-Img <png>] [-Shapes "c:cx,cy,r;p:x,y,x,y"]: zoomed crop with pixel grid + test outlines.
- tools\\diag\\cropstack.ps1 -Unity <png> -X -Y -W -H -Scale -Out <jpg>: approved | Unity crop pair. tools\\diag\\colorgrid.ps1: mean colours per box.
- tools\\diag\\measure-compact.ps1 <png> ...: one score line per still. staging\\round4-recovery\\rowclass.ps1: colour-class runs per row.
TEST CYCLE (the only way you drive Unity; one at a time, it waits for the other lane's lock):
  powershell -NoProfile -ExecutionPolicy Bypass -File C:\\RainbowUnity\\tools\\screen05-cycle.ps1 -Tag <lane>_t<N> -Areas <light|water|foam|splash|all> [-NoRebuild]
  [-EvalAtHold AgentScripts/<x>.cs] [-Series]   (timeout 600000). It recompiles, waits for the domain reload, rebuilds the scene from the builders, plays, holds at
  s = 14.00, captures, scores, prints compile errors / console. Exit 3 / 4 / 6 right after a C# edit = wait 25 s and rerun. If compile errors are in the OTHER lane's
  files, wait ~90 s and rerun. Pipe the output through Select-String to keep only STILL / SBS / area / exit / error lines (saves credits).
- LIVE VARIANTS (decide looks cheaply): AgentScripts/screen05_tunnel_r4tune.cs / screen05_water4_tune.cs read a variants text file and save one still per variant at
  the hold (see their headers); then measure-compact.ps1 on all of them. Copy winning values into the builders.
- Gameplay check after your final cycle (Editor paused at the hold, run from C:\\RainbowUnity\\UnityProject): C:\\Users\\josia\\AppData\\Local\\Unity\\bin\\unity.exe command script eval
  --project-path C:\\RainbowUnity\\UnityProject --timeout 150 -- --file AgentScripts/screen05_playtest_check.cs --timeout 120  (expect steer L x -4.20, R x -0.15, jump + landing, score
  1420 -> 1430, hearts 5 -> 5, state Swimming; coins are being re-placed by the coordinator, so the coin number may differ).
FINISH with ONE cycle tagged <lane>_final -Series (exit 0), look at its s = 10 / 20 stills, run the gameplay check, and return the structured result honestly
(scores before / after, what improved, what still differs, files changed).
`

const TUNNEL = `
YOUR LANE: TUNNEL (tag prefix: tunnel; cycle areas: light). Owns Environment/Shaders/*, Environment/Scripts/DrumMeshes05.cs, DrumLayout05.cs ONLY the paddle
table / paddle constants and band profiles, NearFrame05.cs, Environment/Editor/EnvironmentBuilder.cs, and the scene's lighting / post-processing (find the URP
Volume / lights in the builders: bloom, tone, fill light - judge every global change by the WHOLE picture incl. Benny and the water). Do NOT touch water,
foam, splash, bubbles, coins, HUD, Benny, the camera.
Do this in order (geometry -> materials -> lighting):
(1) HALF-MOON PADDLES (geometry). The approved paddles are THICK D-shaped copper trays: the tall curved outer BAND faces the rider (about 2/3 of the visible
  height, polished orange-gold with one or two bright vertical highlight stripes and thin bright rim lines top and bottom), and only a thin sliver of the rose-brown
  UNDERSIDE shows below it (1/3). Unity shows the opposite: a huge flat salmon underside with a thin band on top. Traced approved outlines (px): BIG LEFT band top edge
  (65,355) (76,338) (100,316) (120,314) (145,323) (180,346) (204,374) (213,400), band bottom edge (65,358) (90,362) (130,374) (170,392) (200,410) (214,416),
  underside below it down to (110,378) (160,402) (205,419); bright stripe at x ~140-160. MID LEFT: x 250-333, y 419-472 (top (262,420) .. (290,421), band ~28 px,
  right tip (333,468)). SMALL LEFT: (373-402, 460-478); TINY LEFT (415-440, 458-474). BIG RIGHT: left tip (720,512), top edge (735,487) (760,460) (800,430) (850,402)
  (864,399), band bottom edge (722,515) (760,495) (800,483) (864,477), dark plum underside down to (745,525) (800,515) (864,500). MID RIGHT: (631-696, 394-452): left
  tip (631,447), top (645,425) (670,405) (692,394), bottom (640,452) (694,432). SMALL RIGHT (585-622, 434-458); TINY RIGHT (553, 455).
  Give each paddle its own s / side / mount height / tilt / scale so its projected outline (probe: project the mesh with the hold camera, see
  screen05_tunnel_r4tune.cs) lands on these outlines within ~5 px; the paddles hang on the drum wall (PaddlePose uses the new axis / RadiusAt). Thicker band, less
  underside (tilt), rounded polished rims.
(2) RINGS (materials + profile): chunky polished copper-gold bands exactly like the zoomed approved crops: thin dark red-brown outer edge, a bright hair line, the wide
  polished main band, an inner lip; body orange (255,150,75) .. (255,190,115), darker (200,90,35) between lamps, and at every lamp azimuth a white-yellow hot
  highlight across the whole band (about 22 px wide on ring A) with a soft glow. Lamps: 20 per turn, phase +4.4 deg clockwise from 12 o'clock as seen by the rider
  (approved ring A hot spots at (410,215), (487,205), (565,215), (640,252), (330,265), (265,340), (715,385); ring N (100,215), (8,362), (20,602), (800,180)).
  Check ring N, A, B, C, D colours and brightness at several azimuths against the approved.
(3) REFLECTIVE PURPLE WALLS: polished violet metal (between the light lines about (110,20,165) .. (150,30,185) deep violet, (225,60,220) hot pink near them) with
  bright pink-white LIGHT LINES running lengthwise along the wall from every lamp azimuth of the rings (same 20 per turn + phase), about 18-26 px wide between rings N
  and A, narrower deeper, broken by the slot rows, brightest next to the rings (approved: (415,240)->(455,310), (490,235)->(492,300), (565,245)->(545,300),
  (640,300)->(590,335), (340,300)->(405,345); between N and A: streaks at (120,265)->(210,345), (190,190)->(245,260), (560,120)->(570,190), (750,255)->(660,310)).
  Small dark rounded slots with a glowing magenta lip in neat rows: near left wall (y 400-600, x 40-200) 7 columns ~25 px apart, slots ~12x38 px with ~22 px gaps;
  between rings A and B thin dashes. The measured brightness pattern (errormap structure loss) decides. Top corners beyond ring N (y 0-200, x 0-110 and 820-864) are
  bright magenta walls with diagonal light streaks.
(4) FOREGROUND COPPER FRAME (bottom-left / bottom-right corners + bottom arc): approved = bright polished gold-copper (orange body (245,140,50), pale-gold highlight zones,
  white-hot glints e.g. near (25,1370), (840,1330), thin parallel bright lines along the bands; arc top edge from (110,1536) over (430,1456) to (760,1536) with bright gold
  highlights around (350,1480) and (560,1490)). Unity = flat brown-orange with grey-yellow bars. Fix outline first (gridshapes), then the metal.
(5) THROAT + CINEMATIC LIGHTING: small white-gold core at (497,470), golden rings / halo out to r ~45 px, warm light on the nearest deep rings; gentle bloom on hot spots
  (approved highlights glow), richer contrast (deep violets, saturated pinks, luminous golds) without greying Benny or the water.`

const RIVER = `
YOUR LANE: RIVER (tag prefix: river; cycle areas: water,foam,splash as needed). Owns Shared/RiverPath.cs (keep the API: Meander, ClampLateral, ...),
Water/Scripts/RiverSurface.cs, RiverMeshGenerator.cs, FoamBank.cs, SplashWake.cs, Water/Shaders/RainbowRiver.*, RainbowFoamBank.hlsl, RainbowFoam.*, RainbowWaterCommon.hlsl,
RainbowSplash.*, RainbowSpray.*, RainbowFarRiver.* (Environment/Shaders), WaterBuilder.cs (river / foam / splash parts). Do NOT touch walls, rings, paddles, frame,
bubbles (BubbleField), coins (CoinTrail), HUD, Benny's body, the camera.
PROBLEM: the river layout is a patchwork of hand-fitted smoothstep terms mirrored in HLSL and C#; its banks / bands sit 30-90 px off the approved curves, and the drum walls
just moved (left wall at the water about -7.0 m at s 25, -7.7 m at s 46, -8.0 m at s 82, -5.6 m at s 106; use DrumLayout05.WallXAt(s, side)), so a flat lather sheet now shows on the left.
(1) DATA-DRIVEN S-RIVER (geometry first - the biggest win). The coordinator traced the approved river row by row and unprojected it with the real camera:
  C:\\RainbowUnity\\staging\\round4-river\\river_targets.csv (curve,py,px,s,x): wl / wr = left / right foam waterlines, lo / li = outer / inner edge of the left pink band, ri / ro = inner /
  outer edge of the right pink band (tool tools/diag/unproject-river.ps1 holds the pixel traces). Replace the formula layout by ONE table class (e.g. Shared or Water/Scripts/RiverLayout05.cs:
  smooth monotone-cubic x(s) tables built from these points, sensible continuation before s 14 and beyond s 145, where the river narrows into the throat) used by C# (FoamBank.BankEdges /
  WaterlineX / InChannel, foam puffs, coins' safe side, splash) AND by the shader through mesh vertex channels (UV2 / UV3 per row) or a small 1-D float texture (_RiverLut sampled by
  s) - no more mirrored formulas. The shader's band centres / half widths, streamline coordinate and foam shelf must come from the table, so the pink S-bands, waterlines and flow
  lines land on the approved pixels within ~6 px at the hold (verify with rowclass on your still). Near Benny (s 12-17): the approved left side is open blue water with the
  separate foam clump at px x 0-130 / y 1010-1120; the right pink band runs off the right edge (ri / ro tables to y 1100). Waterline left of the frame (s < 20): keep it outside the
  picture, then the clump. Keep Benny's steering range, RiverSurface.HeightAt = shader wave, coins on open water.
  Foam rope in front of the new walls: rope of big rounded puffs 0.4-0.9 m tall hugging each waterline, wall directly behind it (no flat lather sheet): approved foam top edge left
  (425,505) (385,525) (340,540) (300,555) (270,570) (240,590) (200,600) (170,625) (140,640), the bay lobe (150-290, 640-720) with bluish open water at (200-240, 640-680) behind it, then
  (90,725) (40,755) (0,785); right rope top (600,545) -> (560,548) -> (600,575) (640,585) (700,600) (760,620) (800,640) (830,665), the curl (700-860, 760-950) with the purple wall visible
  BEHIND it at (780-864, 830-960): the right wall there needs no foam heap - keep that rope narrow (~60-90 px).
(2) WATER LOOK (materials): glossy satin: saturated azure (0,150,240) .. cyan (0,200,250) core, hot magenta bands (235,45,200) .. (250,90,230) with soft violet edges, broad soft light
  streaks along the flow, white 4-point sparkles at approved spots. REMOVE the dark corrugated parallel lines beside Benny (left x 0-250 / right x 560-860, y 900-1200) and the dark
  zig-zag ripples at mid distance: the approved water there is smooth with broad bright highlights (measure the brightness pattern with errormap).
(3) NEAR WATER + BENNY'S CONTACT + SPLASH (y 1100-1536): approved = broad cyan arcs bowed over Benny's track with white flares at about (345,1345), (500,1340), (230,1395), (635,1405),
  (510,1480), (340,1345); pink wake sweeps left from (265,1235) to (110,1385) and right from (575,1235) to (715,1385) (~55-90 px wide, violet edges); a foam rope along the OUTER edge of each sweep:
  left from (205,1195) to (60,1310), right from (600,1195) to (795,1310), white puffs 20-40 px, small lather at (150-200,1370-1420) and (630-690,1340-1410). Benny's bottom sits IN the water
  (waterline y ~1185-1195 at x 300-560, soft azure see-through shade, no hard edge) and from both lower flanks (x 240-300 and 560-620, y 1090-1200) fans of fine white droplets and lacy foam spray
  outward / downward (splash streams (300,1190)->(215,1290), (530,1190)->(600,1290), plus bubbly foam (130-290, 1130-1230) and (570-690, 1110-1230)). Unity = two big smooth white
  blobs with thin straight hairs. Small bubbles around him. Check steering / jumping (-EvalAtHold AgentScripts/screen05_splash_steerjump.cs).`

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

const LANES = { tunnel: TUNNEL, river: RIVER }
phase('Round 4b')
const keys = ['tunnel', 'river'].filter(k => !SKIP.includes(k))
const res = await parallel(keys.map(k => () => agent(COMMON + '\n' + LANES[k] + (NOTES[k] ? '\n\nNOTES FOR YOUR LANE:\n' + NOTES[k] : ''),
  { label: 'lane:' + k, phase: 'Round 4b', schema: SCHEMA, effort: 'high' })))
res.forEach((r, i) => log(keys[i] + ': ' + (r ? r.status + ' ' + r.scores_after : 'no result')))
return { lanes: keys, results: res }
