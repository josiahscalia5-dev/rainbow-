// Rainbow Unity - Screen 05 ROUND 3, VISUAL STAGES (written 2026-11-23 21:30 local for the user's newest priorities:
// tunnel geometry; realistic metallic gold rings and paddles; deeper purple reflective walls; natural S-shaped water flow;
// softer foam; floating iridescent bubbles; Benny's natural contact with the water). The round-3 FRAME stage (camera +
// cross-section) is finished; this replaces the old Shape / Benny stages of round3-composition.workflow.js.
// Two lanes per stage (the laptop runs at most 2 agents at a time). Only ONE Unity test cycle runs at a time (the cycle tool
// holds a lock). The coordinator (main session) runs the final integration cycle + gameplay recording itself.
//   args.stage = 'A' -> TUNNEL (geometry, gold rings, paddles, purple walls, throat) | WATER (S-shaped flow, softer foam)
//   args.stage = 'B' -> BENNY (natural contact with the water, splash) | BUBBLES (floating iridescent bubbles)
// LAUNCH / CONTINUE (any Claude account; Unity Editor open and `unity status` ready):
//   Workflow({ scriptPath: "C:\\RainbowUnity\\staging\\shared\\round3-visual.workflow.js",
//              args: { stage: "A", baseline: { still, sbs, overlay, scores }, context: "<coordinator notes>",
//                      notes: { <lane>: "<what an interrupted attempt left>" }, skip: [<lanes with a result>] } })
// If interrupted: read the run's journal.jsonl, put lanes that returned a result into args.skip, describe the interrupted lane's
// newest files + work stills in args.notes.<lane>, and relaunch the same stage. Exact args used: staging/shared/round3-visual-args.json
// 2026-11-24 (coordinator): + stage 'G1' = GEOMETRY (lower tunnel walls meet narrow tall foam banks) | BUBBLES, and stage
// 'G2' = BENNY (water contact / splash) | WATER (natural S flow; foam banks now belong to the geometry lane's result).
export const meta = {
  name: 'screen05-round3-visual',
  description: 'Screen 05 visual stages: A tunnel|water, B benny|bubbles, G1 lower-wall geometry + foam|bubbles, G2 benny|S-water',
  phases: [
    { title: 'Stage A', detail: 'TUNNEL (geometry, metallic gold rings + paddles, deeper purple reflective walls) | WATER (natural S flow, softer foam)' },
    { title: 'Stage B', detail: "BENNY (natural contact with the water) | BUBBLES (floating iridescent bubbles)" },
    { title: 'Stage G1', detail: 'GEOMETRY (lower walls meet narrow, tall foam banks; ring framing kept) | BUBBLES (floating iridescent bubbles)' },
    { title: 'Stage G2', detail: 'BENNY (natural contact with the water) | WATER (natural S-shaped flow on the new geometry)' },
    { title: 'Stage R2', detail: 'ROUND 4: TUNNEL (rings, paddles, reflective purple walls) | RIVER (stronger S-curve, river shape)' },
    { title: 'Stage R3', detail: 'ROUND 4: BENNY (natural contact with the water)' },
  ],
}

// args.stages = ['R2', 'R3'] runs several stages one after the other in ONE run (each stage's lanes in parallel, max 2).
const STAGES = (args && Array.isArray(args.stages)) ? args.stages.filter(s => ['A', 'B', 'G1', 'G2', 'R2', 'R3'].includes(s)) : null
const STAGE = (args && ['A', 'B', 'G1', 'G2', 'R2', 'R3'].includes(args.stage)) ? args.stage : 'A'
const SKIP = (args && Array.isArray(args.skip)) ? args.skip : []
const NOTES = (args && args.notes && typeof args.notes === 'object') ? args.notes : {}
const BASE = (args && args.baseline) || {}
const CONTEXT = (args && typeof args.context === 'string') ? args.context : ''

const COMMON = `
You are a subagent improving the user's EXISTING Unity port of their Rainbow game, Screen 05 "Flow Into the Current" (Unity
6000.3.29f1, URP 17.3, project C:\\RainbowUnity\\UnityProject, Editor already OPEN). Do the task; do not talk to the user, do not
suggest new sessions. First read C:\\RainbowUnity\\CLAUDE.md (binding project rules; it was NOT loaded for you).

THE GROUND TRUTH: only the user's ORIGINAL approved image C:\\RainbowUnity\\references\\05_flow_into_the_current.png (864x1536).
Look at it with the Read tool (and at zoomed crops). THE USER'S NEWEST PRIORITIES (2026-11-23 21:25 local), in order: tunnel geometry;
realistic metallic gold rings and paddles; deeper purple reflective walls; natural S-shaped water flow; softer foam; floating iridescent
bubbles; Benny's natural contact with the water. The user wants SUBSTANTIAL, clearly visible improvements toward the approved image - not
credits spent chasing tiny score changes. Judge by the picture (side-by-side, overlay, zoomed crops); the scores are a guard rail against
regressions, not the goal. Match shapes, proportions, positions, materials and richness - not just colours. No creative redesign: recreate
what the approved image shows.

USER'S BINDING RULES (never break):
- The playable scene must resemble the image: NO stationary background images, NO projection of the reference picture or any
  screenshot onto geometry, no image pasted over the game. The original game's baked projection assets (assets\\textures\\water05\\proj05_*,
  assets\\textures\\tunnel05\\*, assets\\textures\\paint\\05k0_*, camera-projected UVs of models\\lids05.glb, ?proj05 / ?projwall05 /
  ?projring05 / ?projlid05) are OFF LIMITS as pixel sources. You may LOOK at images to understand shapes and colours.
- HONEST COMPARISONS: judge only real Game-view stills from the cycle tool: 864x1536, Benny at s = 14.00, the NORMAL gameplay
  camera. Never shift, crop, rescale or retouch a still, never give the capture its own camera pose or hide/move things only for the
  capture. What the still shows must be exactly what a player sees at that moment.
- Numbers / shapes / timing from the original Three.js game (READ-ONLY): C:\\Users\\josia\\claude yes\\Rainbow_Screen05_Source\\src (big files:
  Grep for '05' then Read with offset/limit). Where the approved image and the Three.js numbers disagree, the APPROVED IMAGE wins.
- The Three.js game, its folders and every git branch stay untouched. Unity work only inside UnityProject\\Assets\\Rainbow (plus your own
  small eval files UnityProject\\AgentScripts\\screen05_<area>_*.cs).
- NEVER: delete files; run git commands that change anything (a Windows task autosaves to GitHub every 5 minutes); install or download
  anything; close/reopen/restart Unity or the laptop; change Unity project or editor settings; touch ~\\.claude.
- BACKUP before your first edit of any existing file: copy it to C:\\RainbowUnity\\UnityProject\\Recordings\\Screen05\\work\\backup_round3v\\<area>\\
  (git-ignored) so you can restore it if an idea makes things worse.
- Final values must live in code (builders Assets/Rainbow/*/Editor/*Builder.cs, shaders, runtime scripts) so they SURVIVE a full scene
  rebuild; the scene and .mat files are regenerated by the builders on every cycle.
- Keep the game playable and every existing function working (swim, steer, jump, collect coins, hearts, HUD, pause, finish, restart) and
  compile-clean; scenery must stay consistent while Benny swims, steers and jumps. Laptop = Intel N150 iGPU, 8 GB RAM: mobile budget
  (cheap shaders and meshes, no extra full-screen passes, no big textures).
- KEEP ONLY IMPROVEMENTS: a change stays only if the real Game view is visibly closer to the approved image. If your area's visual score
  drops by more than ~1.5 points you need a clear visual reason (state it in the result), otherwise restore from your backup.

NEW SINCE THE LAST ROUND (coordinator, 21:20 local):
- Enter Play Mode is now "Reload Scene only" (no domain reload): a full cycle takes ~70 s, a -NoRebuild cycle ~30 s. Static fields KEEP
  their values from one Play session to the next: any static state you add must be reset in a
  [RuntimeInitializeOnLoadMethod(RuntimeInitializeLoadType.SubsystemRegistration)] method.
- Stills are now EXACTLY repeatable: the shared animation clock Rainbow.Screen05.Screen05Clock (C#: Screen05Clock.Time; shaders: the global
  float _RainbowTime, declared after each shader's CBUFFER) is reset by the hold. Water, foam, bubbles, splash, walls, glow and coins use
  it. NEVER use _Time.y, Time.time or Time.timeSinceLevelLoad for anything visible - use the clock. So any score change between two of your
  cycles comes from the edits made in between (yours or the other lane's).
- After editing any file run a NORMAL cycle (its recompile step imports edited shaders); -NoRebuild only re-captures the same build (e.g.
  with another -EvalAtHold). Live material tuning: an -EvalAtHold AgentScripts/<x>.cs file can set material / shader-global values while
  paused at the hold; copy the winning values into the builder afterwards.

NEW SINCE 2026-11-24 (coordinator):
- LIVE VARIANTS = the cheap way to decide looks: AgentScripts/screen05_coord_tune.cs (read its header). Write variant lines
  "name|target|prop|x,y,z,w[|color|float]" (target wall | ring | pad | river | foam | padtilt) into
  Recordings/Screen05/work/coord_variants.txt and a one-word tag into coord_tag.txt (other lane active? copy the script to
  AgentScripts/screen05_<area>_tune.cs with its own file names so the two lanes never share variant files), run ONE cycle with
  -EvalAtHold, then measure all stills in one call: screen05-measure.ps1 -Json <out.json> <still1> <still2> ... One cycle tests ~10 looks.
  Last night this found +5.9 visual in two cycles; the old one-value-per-cycle lanes made things WORSE in 26 minutes.
- ALREADY DONE by the coordinator (measured, keep unless you measure better): walls darker saturated violet-magenta
  (EnvironmentBuilder WallBase / WallGlow / _EnvIntensity 0.75 / _StripIntensity 2.2 / WallLipGlow 0.8 / _Exposure 0.85), paddle dish tilt
  PaddleFaceTiltDeg -15 (the +32 "horns" are gone), deeper azure water (_RiverGrade in RainbowRiver.shader, WaterBuilder.RiverGrade),
  darker HUD bar. Foam: FoamBank.FoamRimCap / RBW_FOAM_CAP (RainbowFoamBank.hlsl, keep equal) caps the foam band in front of the wall,
  plus a taller rope (GeneratePuffs hW) - see the coordinator notes for whether it was kept.
- Saved diagnostics: C:\\RainbowUnity\\tools\\diag\\ (colorgrid.ps1 = deltaE grid + box colours vs the approved; cropstack.ps1 =
  approved|Unity crop of the same box; measure-compact.ps1 = one score line per still). Use them freely (read-only).

MEASURING (read-only; the cycle tool already prints it after every cycle):
  powershell -NoProfile -ExecutionPolicy Bypass -File C:\\RainbowUnity\\tools\\screen05-measure.ps1 -Overlay <work>\\<name>_overlay.jpg <still.png>
  It compares approved and Unity at IDENTICAL pixel positions (no shifting) for OVERALL and fixed areas (hud, walls, throat, water_mid,
  water_near, foam_left, foam_right, bubbles_left, bubbles_right, splash, benny): visual = mean of v_shape (blurred SSIM), v_dE (colour
  difference) and v_colours (histogram overlap); layout = l_shape, l_dE, l_edges. Calibration: the approved image shifted 8 px scores
  visual 91 / layout 73. The overlay shows APPROVED outlines (yellow) on the Unity still and UNITY outlines (cyan) on the approved image.

TEST CYCLE (the only way you drive Unity):
  powershell -NoProfile -ExecutionPolicy Bypass -File C:\\RainbowUnity\\tools\\screen05-cycle.ps1 -Tag <area>_t<N> -Areas <areas>
  recompile (prints compile errors and stops) -> full scene rebuild from the builders -> Play -> hold Benny at the approved view (s = 14.00,
  paused) -> exact 864x1536 still (line STILL), APPROVED|UNITY side-by-side (*_sbs.jpg), area crops (CROP lines), scores + overlay, console
  warnings/errors. Exit 0 = OK. -Areas: water, foam, bubbles, splash, light, all. -Series: also stills at s = 10 / 14 / 20.
  -EvalBeforePlay AgentScripts/<x>.cs (Edit mode, after the rebuild); -EvalAtHold AgentScripts/<x>.cs (while paused at s = 14).
  Compare only stills whose "paused at frame ..." line says S=14.00. Quirk: right after a recompile the first Play entry can fail
  ("No Pipeline instance found" / "the Editor closed the connection", exit 3 / 4 / 6) - wait 25 s and run the cycle again. If Unity stays
  unreachable for minutes, stop and report it (never open/restart Unity yourself). Exit 5 (BUSY) = the other lane's cycle held the lock too
  long: wait and retry.
  Extra crops: powershell -NoProfile -File C:\\RainbowUnity\\tools\\make-crop-compare.ps1 -Unity <still.png> -X <x> -Y <y> -W <w> -H <h>
  -Zoom 2 -Out C:\\RainbowUnity\\UnityProject\\Recordings\\Screen05\\work\\<name>.jpg
  Gameplay check (after your final cycle, Editor paused at the hold; run from C:\\RainbowUnity\\UnityProject):
  C:\\Users\\josia\\AppData\\Local\\Unity\\bin\\unity.exe command script eval --project-path C:\\RainbowUnity\\UnityProject --timeout 150 -- --file AgentScripts/screen05_playtest_check.cs --timeout 120
  It steers hard left / right, jumps and swims 2 s. Baseline result: "steer L x -4.20 | steer R x -0.15 | ... landed at S 37.7 | S 14.0 ->
  59.4 | score 1420 -> 1430 | hearts 5 -> 5 | state Swimming" (a one-frame timing slip can rarely move the numbers slightly). Steering,
  jumping, landing and coin pickup must keep working.

BASELINE for this round (deterministic; coordinator 21:15 local): ${BASE.still || '(see the context)'}
side-by-side ${BASE.sbs || ''} ; overlay ${BASE.overlay || ''}
Scores (visual / layout): ${BASE.scores || ''}

THE TARGET SHEET (approved image, 864x1536 pixels, hand-measured by the round-3 FRAME agent; verify on zoomed crops):
- Vanishing point (496, 478). Ring crowns straight up from it: y 210, 308, 378, 415, 434, 448, 456, 461 (r 268 / 170 / 100 / 63 / 44 /
  30 / 22 / 17); crowns at y ~470: ring A x 219 / 712, B 338 / 632, C 402 / 580, D ~443 / 552 (the approved drum is wider on the left).
  Ring band thickness: ring A y 190-230 (~40 px), ring B 296-318 (~22 px). Near ring: centre ~(425, 475), r ~415, left crown (10, 480),
  foot on the foam ~(90, 700).
- Wall / foam junction: left (330, 540), (220, 600), (120, 700), (30, 760); right (690, 600), (~800, 650), (850, 700), (>=864, 760).
- Open river at y 600: x ~250-650. Foam rims: y 600 left 198-250, right 650-690; y 700 left 138-290, right foam only at x > 846.
- Paddle tray centres: big (150, 425) / (790, 460), mid (290, 445) / (665, 425), small (385, 462) / (600, 450), tiny (438, 466) / (553, 457).
- Benny: pompom top y 772, pink body 1040-1136 at x 422, body x 275-570, body bottom / waterline about y 1250, centre x about 420.
- Coin centres: about (470,785), (545,718), (480,673), (430,636), (464,608), (493,595), (519,585).
- Camera (fixed by the frame stage - do not change it): position (-0.06, 3.40, 7.48), euler (12.78, 357.20, 0), vertical fov 62,
  f = 1278 px at 864x1536. Row -> s on the water (x -0.45): y600 -> 44.1, 650 -> 33.3, 700 -> 27.3, 760 -> 22.9, 800 -> 20.9,
  900 -> 17.5, 1000 -> 15.5, 1100 -> 14.0, 1200 -> 13.0, 1300 -> 12.3, 1400 -> 11.7. Read-only probe of projected tunnel landmarks:
  AgentScripts/screen05_frame_probe.cs (use it as -EvalAtHold, or run it while paused after a cycle).
- Tunnel cross-section (DrumLayout05, frame stage): radius 6.8 m, axis 4.25 m above the water (near drop to 3.25 m for s < 35.5); walls
  meet the water at +-5.31 m far / +-5.97 m near; rings at s 5.6, 24.3, 45.5, 66.4, 106.5, 163.6, 230.1, 333.0, 450.4; throat cap s 470;
  paddles (s, side, mount height m): L 29.5/5.2, 44/5.2, 75/5.1, 125/5.3, 190/5.3; R 34/4.7, 55/6.0, 82/5.8, 118/5.5, 180/5.5.
- An unfinished automatic measuring script exists (C:\\RainbowUnity\\staging\\round3-fit\\measure-targets.ps1 + Targets05.cs, never
  completed or verified): use it only if it helps; the numbers above are the reference.

TEAMWORK: edit only the files / sections your area owns; if you truly need a change elsewhere keep it minimal and report it in
shared_changes. Use the Edit tool (never Write over an existing shared file) and re-read a file right before editing it; every edit must
leave C# / HLSL compiling. If a cycle shows compile errors or a broken look in files you did not touch, the other lane is mid-edit: wait
~90 s and run the cycle again - never "fix" their files.

HOW TO WORK: (1) look hard at the approved image vs the baseline side-by-side, overlay and crops of your area, and MEASURE the approved
shapes you must match; (2) read the Unity code of your area (and the matching Three.js source where useful) and find the ROOT CAUSES
(file:line) of the biggest visible differences; (3) make bold, coherent changes that fix them; (4) run a cycle, look at the SBS and zoomed
crops, check the numbers, iterate. Budget: about 45-55 minutes and at most ~8 cycles. Finish with ONE cycle tagged <area>_final with
-Series that exits 0, check its s = 10 and s = 20 stills (nothing broken while moving) and run the gameplay check. Return the structured
result honestly: scores before/after, what visibly improved, what still differs, every file you changed.
${CONTEXT ? '\nNOTES FROM THE COORDINATOR:\n' + CONTEXT + '\n' : ''}`

// Round 4 (stages R2 / R3 only; kept out of COMMON so the stage-G1 prompts stay identical for resume)
const ROUND4 = `
ROUND 4 STRATEGY (user, 2026-11-24 morning - this overrides "small steps" and the 45-55 minute / 8 cycle budget above): ONE strong
improvement round that moves the OVERALL visual score from ~58 toward 75, instead of many tiny adjustments. Biggest differences first.
So: SOLVE FIRST - measure the approved target (target sheet + zoomed crops) and project Unity's real geometry with a read-only probe
(AgentScripts/screen05_frame_probe.cs, AgentScripts/screen05_geometry_probe.cs) BEFORE the first cycle; compute the parameter / mesh
changes that put your shapes on the approved pixels; apply them boldly in one go; then verify. At most ~6 cycles per lane (use -EvalAtHold
live variants to test many looks in one cycle). Positions, sizes and shapes of big bright structures (rings, paddles, river S, foam,
Benny's splash) move the score far more than small colour tweaks. Keep gameplay intact. The 58.0 baseline is safe in git commit aa2a2e1
(never reset; restore single files from your backups if an idea fails).
`

const AREAS = {
  geometry: `
YOUR AREA: LOWER TUNNEL GEOMETRY + NARROW TALL FOAM BANKS (user priorities 1, 2 and 4: tunnel geometry / perspective / depth; narrow,
TALLER foam banks). Tag prefix: geometry. Cycle areas: foam,water (look at the whole side-by-side too).
Owns: the drum cross-section BELOW the axis and where the wall meets the water (Environment/Scripts/DrumLayout05.cs cross-section
functions such as WaterChord / CentreY / FloorExtra, Environment/Scripts/DrumMeshes05.cs wall + ring meshes, the wall UV mapping in
Environment/Shaders/RainbowDrumWall.hlsl if the profile changes), the foam banks (Water/Scripts/FoamBank.cs, Water/Shaders/RainbowFoamBank.hlsl
- RBW_BankEdges must stay line-by-line identical to FoamBank.BankEdges -, RainbowFoam.hlsl / .shader, WaterBuilder.BuildFoam), the wall chord
the river mesh carries (RiverMeshGenerator UV1.w) and the shelf rise (RiverSurface.BaseHeight). Do NOT touch: the camera, the ring s list,
the ring / paddle / wall LOOK values the coordinator just tuned, the river band colours / flow lines, Benny, splash, bubbles, coins, HUD.
THE PROBLEM (biggest composition gap): approved = the purple slotted wall comes right down behind NARROW, TALL, puffy white soap-foam
rims that hug the open river on both sides (a rope of big rounded puffs, white with soft lavender / blue shading, ~40-60 px high in the
middle distance), so the river + foam + wall read as a narrow winding channel inside a round drum. Unity = a WIDE FLAT carpet of small
lavender beads (or bare floor) between the river and the wall, especially left at y 560-800 and right at y 620-1000, and the wall base
sits too far out. Target sheet: wall / foam junction left (330, 540), (220, 600), (120, 700), (30, 760); right (690, 600), (~800, 650),
(850, 700), (>=864, 760); foam rims at y 600 left 198-250 / right 650-690, at y 700 left 138-290 / right foam only at x > 846; open
river at y 600 x ~250-650.
HOW: (1) project the real geometry (AgentScripts/screen05_frame_probe.cs as -EvalAtHold, or your own read-only probe) and find where
Unity's wall base, foam waterline and foam outer edge land on screen vs the targets, side by side, row by row (y 540-1000). (2) Fix the
ROOT cause: if the wall base is too far out, bring the LOWER wall inward toward the foam (e.g. a non-circular lower profile that blends
from the circle above the axis into a narrower chord at the water, or an inner lower skirt with the same wall material and continuous
slot rows) WITHOUT moving the ring crowns / vanishing point / upper framing; rings must still look continuous where they meet the foam
(follow the same lower profile or disappear behind the foam rope). If the foam waterline is wrong, refit BankEdges / the rims to the
target rows. (3) Make the foam a soft, puffy, TALL rope (bigger rounded puffs, soft lavender shading and AO between puffs, a lacy edge
toward the water) instead of a flat bead carpet; keep coins on open water (>= 1.25 m from the foam waterline), Benny's steering range,
the bubbles' foam queries (FoamBank.InChannel) and the mobile budget (watch the puff count). Check s = 10 / 20 stills: the walls and
foam must stay consistent while Benny moves.`,

  river: `
YOUR AREA: THE RIVER - STRONGER S-CURVE AND BETTER RIVER SHAPE (user, round 4). Tag prefix: river. Cycle areas: water.
Owns: the visible course and band layout of the open water: Shared/RiverPath.cs (Meander / course - keep steering ClampLateral, coins
(CoinTrail places them at 0.63 x the meander) and bubbles working), Water/Scripts/RiverSurface.cs (keep HeightAt identical to the shader's
vertex wave), RiverMeshGenerator.cs, Water/Shaders/RainbowRiver.hlsl band layout / flow lines / sparkles (NOT the "Benny's wake at the
waterline" section), RainbowWaterCommon.hlsl, RainbowRiver.shader. The FOAM BANKS were just reworked by the GEOMETRY lane (stage G1, see
the coordinator notes): build on its result; if the S needs the bank waterlines to follow, change FoamBank.BankEdges AND RBW_BankEdges
(RainbowFoamBank.hlsl) line-by-line identically and keep the geometry lane's foam look. Do NOT touch the camera, walls, rings, paddles,
Benny, splash, bubbles, HUD.
What to deliver: approved = the open water is a narrowing ribbon that winds in a clear, strong S from Benny to the vanishing point
(bends at mid distance swing left and right by roughly a third of the visible floor width), with broad glossy pink / magenta satin bands
that follow the bends and cross the stream, thin white flow lines and sparkles along the current, the coins sitting on the curve (target
coin centres in the target sheet). Unity = a wide, fairly straight river whose bands mostly run along the edges. Measure the approved
river centreline and both waterlines row by row (y 480-1100), project Unity's (RiverPath / BankEdges with the hold camera), and reshape
the course / bands to land on them. Benny's own position at s = 14 and the camera must not change.`,

  tunnel: `
ROUND 4 FOCUS (user, 2026-11-24): (a) GOLD RINGS - thickness, spacing, size and placement exactly as the approved: chunky polished
copper-gold rings converging tightly into the throat (ring crowns from the target sheet, ring A band ~40 px, ring B ~22 px; compare
every ring's screen radius / band width / crown y with a probe); (b) GOLD PADDLES - shape, size, angle and position: big half-moon
copper shelves with a thick polished rounded rim, seen from below, on the target-sheet tray centres (the dish tilt is now -15 deg; the
rest of the shape is yours); (c) TUNNEL WALLS - a reflective purple metallic look: the coordinator already made them darker and
saturated (keep that palette unless you measure better); add the approved's polished reflections - bright pink-white specular streaks
running round the drum between the slot rows - without going back to pastel. The lower wall / foam junction belongs to the stage-G1
GEOMETRY result (do not undo it). The "Unity now" lines below are OLD (written before the coordinator's look tuning); trust the baseline.
YOUR AREA: TUNNEL GEOMETRY + REALISTIC METALLIC GOLD RINGS AND PADDLES + DEEPER PURPLE REFLECTIVE WALLS (user priorities 1-3).
Tag prefix: tunnel. Cycle areas: light (crops walls + throat) - look at the whole side-by-side too.
Owns: Environment/Shaders (RainbowDrumWall, RainbowGoldMetal, RainbowThroatGlow, RainbowEnvLighting, RainbowEnvCommon, RainbowFarRiver),
Environment/Scripts/DrumMeshes05.cs (ring + paddle mesh shapes), Environment/Scripts/DrumLayout05.cs ONLY its ring list, ring band
profiles and paddle slots / size (do NOT change Radius, the axis heights, the near drop or AxisX: water, foam and bubbles are fitted to that
cross-section), Environment/Editor/EnvironmentBuilder.cs (materials, rings, paddles, glow). Do NOT touch the camera, water, foam, bubbles,
splash, Benny, coins, HUD.
What to deliver, biggest first:
(1) DEEPER PURPLE REFLECTIVE WALLS. Approved: deep violet / purple polished metal with a lavender-pink reflective sheen, covered in MANY
small dark oval perforations in tight, neat CONCENTRIC rows that follow the drum into the distance, with pink-white specular streaks running
around the drum. Unity now: hot magenta walls with LARGE black ovals in loose rows (the previous attempt's "brighter magenta lands" went the
wrong way - the user wants DEEPER purple and reflective).
(2) REALISTIC METALLIC GOLD RINGS. Approved: many chunky, rounded, polished gold / copper-gold rings (orange-amber body, a bright warm
specular line along the crown, darker warm edges, reflections of the purple walls) converging tightly into the throat; the near rings much
chunkier than now (ring A band ~40 px, ring B ~22 px; Unity ~24 px). Unity now: few, thin, flat-looking rings.
(3) PADDLES. Approved: large copper-gold D-shaped trays with a thick, rounded, polished rim and the inner face visible (big ones upper left
and right, smaller ones deeper in). Unity now: flat orange slabs / blocks. Reshape the paddle mesh (rounded rim tube + dished tray) and give
it the same polished metal as the rings.
(4) THROAT / FAR GLOW. Approved: a SMALL bright white point with thin rings and a golden halo, purple gaps between the rings. Unity: one large
orange glow disc that hides the deep rings (_FarGlowRange 95..330 m paints everything beyond ~330 m; consider starting it later, ~180 m, now
that real rings exist at 230 / 333 / 450).
Keep the tunnel consistent while Benny moves (s = 10 / 20 stills) and keep the shaders cheap.`,

  water: `
YOUR AREA: NATURAL S-SHAPED WATER FLOW + SOFTER FOAM (user priorities 4-5). Tag prefix: water. Cycle areas: water,foam.
Owns: Water/Scripts/RiverMeshGenerator.cs, RiverSurface.cs (keep HeightAt identical to the shader's vertex wave), FoamBank.cs,
Water/Shaders/RainbowRiver.hlsl (band layout, flow lines, sparkles, foam-shelf section; do NOT touch the "Benny's wake at the waterline"
section - the benny lane owns it in the next stage), RainbowWaterCommon.hlsl, RainbowRiver.shader, RainbowFoam.hlsl / .shader,
RainbowFoamBank.hlsl (RBW_BankEdges must stay line-by-line identical to FoamBank.BankEdges), WaterBuilder.BuildRiver / BuildFoam.
Shared/RiverPath.cs ONLY if the visible course itself must bend differently - then keep steering (ClampLateral), coins and bubbles working.
Do NOT touch the camera, tunnel geometry, wall / ring / paddle looks, Benny, splash, bubbles, coin placement, HUD.
What to deliver, biggest first:
(1) NATURAL S-SHAPED FLOW. Approved: the open water is a narrow cyan / turquoise ribbon winding in a clear S from Benny to the vanishing
point; broad, glossy pink / magenta satin bands swirl along and across the S (they follow the bends, cross the stream and thin out with
distance), with thin white flow lines and sparkles following the current. Unity now: water too wide at mid distance, the bands mostly run
straight along the edges, the S is barely readable.
(2) SOFTER FOAM. Approved: soft, fine, clustered soap suds - many small bubbles, pearly white with faint lavender / blue shading and soft
edges - in narrow rims that hug both banks and rise against the walls. Unity now: big hard-edged sphere blobs in wide fields. Make it soft
(smaller and more puffs, softer shading and rim light, ambient occlusion between puffs, soft edges toward the water), narrower and taller as
in the approved (foam rim targets above). Keep coins on open water (>= 1.25 m from the foam waterline) and Benny's steering range.`,

  benny: `
YOUR AREA: BENNY'S NATURAL CONTACT WITH THE WATER + SPLASH (user priority 7). Tag prefix: benny. Cycle areas: splash.
Owns: Benny's ride numbers (Benny/Scripts/BennyController.cs BodyRadius / RootRide / rideLift / ridePitchRad - swim / steer / jump must keep
working exactly), the splash (Water/Scripts/SplashWake.cs, Water/Shaders/RainbowSplash.shader, RainbowSpray.*, the "Benny's wake at the
waterline" section of RainbowRiver.hlsl, WaterBuilder.PrepareSprayMaterial). Do NOT touch walls, rings, paddles, river bands, foam banks,
bubbles, camera, coins, HUD. Benny's own look (round pink fluffy body, purple-and-white striped knitted beanie, purple pompom, yellow star)
stays exactly as it is.
What to deliver: Benny must look naturally supported by the water. Approved: his round fluffy bottom sits IN the water - the surface meets
the fur in a soft waterline with a slight bulge / ripple ring and a soft see-into-the-water tint of the submerged part (no black shadow);
bright white spray droplets and bubbly foam fan backwards from both sides of his lower body toward the bottom corners (thin streams of
droplets, not solid straight streaks); small bubbles around him; a soft V wake behind. Unity now: a hard dark navy shadow behind him,
straight white streak fans and a flat-cut bottom. Splash mapping for the current camera: water points 0 / 0.6 / 1.0 / 1.5 / 2.0 m behind
Benny's centre project to y 1104 / 1160 / 1203 / 1265 / 1339. Check steering and jumping (-EvalAtHold AgentScripts/screen05_splash_steerjump.cs):
the contact follows him, fades while airborne and makes a landing splash.`,

  bubbles: `
YOUR AREA: FLOATING IRIDESCENT BUBBLES (user priority 6). Tag prefix: bubbles. Cycle areas: bubbles.
Owns: Water/Scripts/BubbleField.cs, Water/Shaders/RainbowBubble.hlsl / .shader, WaterBuilder.BuildBubbles. Do NOT touch anything else.
What to deliver: approved = about 25-35 soap bubbles floating above the water along both sides: several LARGE ones (about 50-90 px across)
near the frame edges, e.g. left ~(85, 970), right ~(745, 1255) and ~(800, 925), plus medium and small ones along the foam banks and at mid
distance; each a clear thin-film sphere - transparent centre, a thin rainbow-iridescent rim (magenta / cyan / gold interference colours), a
bright specular highlight and a small secondary glint, faint reflections. None over Benny or the coin line. Unity now: few, small, faint
bubbles. Measure the approved bubble positions and sizes (zoomed crops of both sides) and match count, size distribution, placement and look.
They must stay stable and natural while Benny swims, steers and jumps (s = 10 / 20 stills and -EvalAtHold AgentScripts/screen05_bubbles_steerjump.cs;
compare only S = 14.00 stills).`,
}

const IMPL_SCHEMA = {
  type: 'object',
  properties: {
    area: { type: 'string' },
    status: { type: 'string', enum: ['improved', 'partly_improved', 'no_visible_change', 'reverted', 'blocked'] },
    scores_before: { type: 'string' },
    scores_after: { type: 'string' },
    root_causes: { type: 'array', items: { type: 'string' } },
    files_changed: { type: 'array', items: { type: 'string' } },
    changes: { type: 'array', items: { type: 'string' } },
    final_cycle_exit: { type: 'integer' },
    final_still: { type: 'string' },
    final_sbs: { type: 'string' },
    final_overlay: { type: 'string' },
    series_stills: { type: 'array', items: { type: 'string' } },
    gameplay_check: { type: 'string' },
    improved: { type: 'array', items: { type: 'string' } },
    still_different: { type: 'array', items: { type: 'string' } },
    shared_changes: { type: 'string' },
    notes_for_next_agents: { type: 'string' },
  },
  required: ['area', 'status', 'scores_before', 'scores_after', 'files_changed', 'changes', 'final_cycle_exit', 'final_still', 'final_sbs', 'gameplay_check', 'improved', 'still_different', 'notes_for_next_agents'],
}

const PAIRS = { A: ['tunnel', 'water'], B: ['benny', 'bubbles'], G1: ['geometry', 'bubbles'], G2: ['benny', 'water'], R2: ['tunnel', 'river'], R3: ['benny'] }
const WHAT = { geometry: 'GEOMETRY (lower walls / foam banks / wall chord)', tunnel: 'TUNNEL (walls / gold rings / paddles / throat)', water: 'WATER (river bands / mesh; in stage G2 NOT the foam banks)', river: 'RIVER (S-curve course, band layout, coins on the curve)', benny: "BENNY (water contact / splash)", bubbles: 'BUBBLES (floating iridescent bubbles)' }

function lane(key, other, phaseName) {
  if (SKIP.includes(key)) {
    log('skipping ' + key + ' (finished in an earlier run)')
    return Promise.resolve({ area: key, status: 'finished in an earlier run', files_changed: [], changes: [], improved: [], still_different: [], notes_for_next_agents: 'see the handoff' })
  }
  const others = other ? '\nOther active lane: ' + WHAT[other] + ' works in parallel with you (its own files; one Unity cycle at a time).'
    : '\nNo other lane runs during your stage: you have Unity to yourself.'
  const prompt = COMMON + (/Stage R\d/.test(phaseName) ? ROUND4 : '') + '\n' + AREAS[key] + others + (EARLIER ? '\n\nRESULTS OF THE EARLIER STAGE IN THIS RUN (build on them, do not undo them):\n' + EARLIER : '') +
    (NOTES[key] ? '\n\nNOTES FOR YOUR LANE:\n' + NOTES[key] : '')
  return agent(prompt, { label: 'lane:' + key, phase: phaseName, schema: IMPL_SCHEMA })
}

let EARLIER = ''
const allResults = {}
for (const st of (STAGES && STAGES.length ? STAGES : [STAGE])) {
  const pair = PAIRS[st]
  const ph = 'Stage ' + st
  phase(ph)
  const res = await parallel(pair.map((k, i) => () => lane(k, pair.length > 1 ? pair[1 - i] : null, ph)))
  res.forEach((r, i) => log(pair[i] + ' finished: ' + (r ? r.status + ' ' + (r.scores_after || '') : 'no result')))
  allResults[st] = res
  EARLIER += res.filter(Boolean).map(r => '- ' + r.area + ' (' + r.status + ', ' + r.scores_before + ' -> ' + r.scores_after + '): changed ' +
    (r.files_changed || []).join(', ') + '. Improved: ' + (r.improved || []).join('; ') + '. Still different: ' + (r.still_different || []).join('; ') +
    '. Final still: ' + r.final_still + '. Notes: ' + (r.notes_for_next_agents || '')).join('\n') + '\n'
}
return { stages: STAGES && STAGES.length ? STAGES : [STAGE], results: allResults }
