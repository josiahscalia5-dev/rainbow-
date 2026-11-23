// Rainbow Unity - Screen 05 ROUND 3: COMPOSITION-FIRST workflow (written 2026-11-23 for the user's priority order).
// Stages: FRAME (camera + tunnel geometry, alone) -> SHAPE (river+foam | walls+rings+paddles, two lanes) -> BENNY (size,
// position, waterline, splash, coins, HUD) -> INTEGRATE (final cycle + 12 s recording + scores) -> REVIEW (two critics).
// Only ONE Unity test cycle runs at a time (tools/screen05-cycle.ps1 holds a lock).
//
// LAUNCH / CONTINUE (any Claude account): open a session, make sure the Unity Editor is open and `unity status` is ready,
// then call the Workflow tool with
//   { scriptPath: "C:\\RainbowUnity\\staging\\shared\\round3-composition.workflow.js",
//     args: { baseline: { still: "<...ROUND2_FINAL.png>", sbs: "<..._sbs.jpg>" }, context: "<review notes>",
//             skip: [<finished areas>], notes: { <area>: "<what an interrupted attempt left>" } } }
// Areas: frame, river, tunnel, benny. Skipped areas are not re-run (later agents read the handoff / their reports instead).
export const meta = {
  name: 'screen05-round3-composition',
  description: 'Screen 05 round 3: match the approved composition - camera/tunnel, S-river + foam, walls/rings/paddles, Benny/coins/HUD - then verify',
  phases: [
    { title: 'Frame', detail: 'camera framing + tunnel geometry, perspective and depth (alone: everything depends on it)' },
    { title: 'Shape', detail: 'two lanes: narrow S-river + tall narrow foam banks | purple walls, gold rings, larger copper paddles' },
    { title: 'Benny', detail: "Benny's size, position, waterline and splash; coin placement; HUD" },
    { title: 'Integrate', detail: 'final full cycle + moving views + 12 s gameplay recording + both scores' },
    { title: 'Review', detail: 'two independent critics against the approved image and the user priorities' },
  ],
}

const SKIP = (args && Array.isArray(args.skip)) ? args.skip : []
const NOTES = (args && args.notes && typeof args.notes === 'object') ? args.notes : {}
const BASE = (args && args.baseline) || {}
const CONTEXT = (args && typeof args.context === 'string') ? args.context : ''

const COMMON = `
You are a subagent improving the user's EXISTING Unity port of their Rainbow game, Screen 05 "Flow Into the Current" (Unity
6000.3.29f1, URP 17.3, project C:\\RainbowUnity\\UnityProject, Editor already OPEN). Do the task; do not talk to the user, do not
suggest new sessions. First read C:\\RainbowUnity\\CLAUDE.md (binding project rules; it was NOT loaded for you).

THE GROUND TRUTH: only the user's ORIGINAL approved image C:\\RainbowUnity\\references\\05_flow_into_the_current.png (864x1536).
Look at it with the Read tool. The user's priority is to recreate its COMPOSITION in the real playable scene - not to make parts
pretty on their own. Their order: (1) tunnel geometry, perspective, depth, camera framing; (2) the narrow winding S-shaped river
and its exact proportions; (3) purple walls, gold rings, LARGER copper paddles; (4) narrow, TALLER foam banks; (5) Benny's size,
position, waterline, splash; (6) coin placement and HUD. Target: 90-95 % visual similarity. Match shapes, proportions, positions,
materials - not just colours.

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
  anything; close/reopen/restart Unity or the laptop; touch ~\\.claude.
- BACKUP before your first edit of any existing file: copy it to C:\\RainbowUnity\\UnityProject\\Recordings\\Screen05\\work\\backup_round3\\<area>\\
  (git-ignored) so you can restore it if an idea makes things worse.
- Final values must live in code (builders Assets/Rainbow/*/Editor/*Builder.cs, shaders, runtime scripts) so they SURVIVE a full scene
  rebuild; the scene and .mat files are regenerated by the builders on every cycle.
- Keep the game playable (swim, steer, jump, collect coins, finish) and compile-clean; scenery must stay consistent while Benny swims,
  steers and jumps. Laptop = Intel N150 iGPU, 8 GB RAM: mobile budget (cheap shaders/meshes, no extra full-screen passes).
- KEEP ONLY IMPROVEMENTS: a change stays only if the real Game view gets visibly closer to the approved image (SBS + overlay) AND the
  scores of your areas do not drop; otherwise restore from your backup.

MEASURING (read-only, offline; run it after every cycle on the new still):
  powershell -NoProfile -ExecutionPolicy Bypass -File C:\\RainbowUnity\\tools\\screen05-measure.ps1 -Overlay <work>\\<name>_overlay.jpg <still.png>
  It compares approved and Unity at IDENTICAL pixel positions (no shifting/cropping) and prints, for OVERALL and fixed areas (hud, walls,
  throat, water_mid, water_near, foam_left, foam_right, bubbles_left, bubbles_right, splash, benny):
  visual = mean of v_shape (SSIM of brightness after an 8 px blur at 1/16 size), v_dE (1 - mean CIELAB deltaE/50 at 1/32 size) and
  v_colours (overlap of the area's colour histograms); layout = mean of l_shape (SSIM at 1/8 size), l_dE (1 - deltaE/50 at 1/16 size)
  and l_edges (correlation of blurred edge maps). Calibration: the approved image shifted 8 px scores visual 91 / layout 73; shifted
  24 px 65 / 39; 15 % brighter 90 / 94; mirrored 64 / 39. So visual >= 90 means near-exact placement. The -Overlay picture shows the
  APPROVED outlines (yellow) on the Unity still and the UNITY outlines (cyan) on the approved image at the same pixels: use it to see
  exactly where shapes are misplaced. Never optimise a number at the cost of what the picture shows.

TEST CYCLE (the only way you drive Unity):
  powershell -NoProfile -ExecutionPolicy Bypass -File C:\\RainbowUnity\\tools\\screen05-cycle.ps1 -Tag <area>_t<N> -Areas <areas>
  It recompiles (prints compile errors and stops), rebuilds the whole scene from the builders, enters Play, holds Benny at the approved
  view (s = 14.00, paused), saves an exact 864x1536 still (line STILL), an APPROVED|UNITY side-by-side (*_sbs.jpg) and zoomed area crops
  (CROP lines), then lists console warnings/errors (it may also print the scores and an overlay path). About 75-100 s. Exit 0 = OK.
  -Areas: water, foam, bubbles, splash, light, all.  -Series: also stills at s = 10/14/20.  -NoRebuild: skip recompile + rebuild.
  -EvalBeforePlay AgentScripts/<x>.cs (Edit-mode C# after the rebuild), -EvalAtHold AgentScripts/<x>.cs (C# while paused at s = 14).
  Check the "paused at frame ... S=" line: compare only stills at S = 14.00. Quirk: the first rebuild after a recompile can fail with
  "No Pipeline instance found" (exit 3) or EDITOR NOT READY (exit 4) during a domain reload - wait 25-30 s and run it again. If Unity
  stays unreachable for minutes, stop and report it (never open/restart Unity yourself).
  Extra crops: powershell -NoProfile -File C:\\RainbowUnity\\tools\\make-crop-compare.ps1 -Unity <still.png> -X <x> -Y <y> -W <w> -H <h>
  -Zoom 2 -Out C:\\RainbowUnity\\UnityProject\\Recordings\\Screen05\\work\\<name>.jpg
BASELINE for this round (same deterministic view): ${BASE.still || 'the newest ROUND2_FINAL still in UnityProject\\Recordings\\Screen05\\work'}
${BASE.sbs ? '(side-by-side: ' + BASE.sbs + ')' : ''}. Measure it first so you know your starting scores.

TEAMWORK: edit only the files / sections your area owns; if you truly need a change elsewhere keep it minimal and report it in
shared_changes. Use the Edit tool (never Write over an existing shared file) and re-read a file right before editing it; every edit must
leave C# / HLSL compiling. If a cycle shows compile errors or a broken look in files you did not touch, another agent is mid-edit: wait
~90 s and run the cycle again - never "fix" their files.

HOW TO WORK: (1) look at the approved image, the baseline SBS, the overlay and your crops; MEASURE the approved geometry you must match
(pixel positions of edges, radii, widths at several heights - small PowerShell/System.Drawing scripts in your scratchpad are fine);
(2) read the Unity code of your area and the matching Three.js source; find the ROOT CAUSES (file:line); (3) change the code; (4) run a
cycle, measure, look, iterate. Budget: about 40-50 minutes and at most ~10 cycles; a clear, measured, visible improvement that holds up in
gameplay beats an unfinished perfect attempt. Finish with one cycle tagged <area>_final with -Series that exits 0; check its s = 10 and
s = 20 stills (nothing broken while moving). Return the structured result honestly: scores before/after, what improved, what still
differs, every file you changed.
${CONTEXT ? '\nNOTES FROM THE COORDINATOR AND THE PREVIOUS ROUND\'S REVIEWERS:\n' + CONTEXT + '\n' : ''}`

const AREAS = {
  frame: `
YOUR AREA: TUNNEL GEOMETRY, PERSPECTIVE, DEPTH AND CAMERA FRAMING (user priority 1 - everything else is fitted after you). Tag prefix: frame.
Owns: the gameplay camera (Assets/Rainbow/Gameplay/Scripts/Screen05CameraRig.cs and the camera values in Gameplay/Editor/GameplayBuilder.cs:
height, distance behind Benny, pitch, yaw, field of view, follow lag); the tunnel geometry (Environment/Editor/EnvironmentBuilder.cs,
Environment/Scripts/DrumLayout05.cs, DrumMeshes05.cs, NearFrame05.cs: tunnel radius, the height of the tunnel axis above the water, ring
spacing / count / ring sizes, throat distance, near gold frame pieces); and AgentScripts/screen05_hold_approved.cs (only to make the hold
land on s = 14.00 every time - it sometimes lands on 13.63 / 14.37).
Do NOT touch: water / foam / bubble / splash files, wall/gold/glow SHADER looks (the tunnel lane works on those after you), Benny's look,
coins, HUD. Keep RiverPath and the water height unchanged unless essential (if you move the tunnel relative to the water, say so).
What to match (measure it yourself in the approved image): the vanishing point where river, rings and walls converge (about x 490,
y 545); MANY concentric gold rings converging tightly into a SMALL bright point - measure the approved ring radii along lines from the
vanishing point and fit ring spacing / count / tunnel radius / camera distance to them; the near ring arcs at the frame edges; the
purple walls come down STEEPLY right behind the foam banks, i.e. the water/floor is much narrower relative to the tunnel than in Unity
now (the walls meet the floor at x = +-6.25 m in Unity - far too wide; in the approved image the open river + foam fill only the
bottom of the drum); Benny's on-screen size and place (pompom top about y 840, body bottom about y 1250, centre x about 420); the
near gold frame pieces in the bottom corners. Earlier notes: the camera at s = 14 is (-0.06, 3.32, 7.07) with euler (12.02, 357.04, 0),
fov 62; a reviewer estimated ~0.5 m too far back and the vanishing point ~9 px right - verify with measurements, do not trust them.
Fit with the overlay + measure (OVERALL, walls, throat, benny), not by eye alone. Then check gameplay: s = 10 / 20 stills and a hard
left/right steer + a jump (e.g. -EvalAtHold AgentScripts/screen05_splash_steerjump.cs) - the camera must still follow Benny well.
In notes_for_next_agents give the NEW cross-section numbers (tunnel radius, axis height above the water, floor half-width at several
distances, ring spacing) and the approved river/foam pixel positions you measured, for the river and tunnel lanes.`,

  river: `
YOUR AREA: THE NARROW, WINDING S-SHAPED RIVER AND ITS EXACT PROPORTIONS + NARROW, TALLER FOAM BANKS (user priorities 2 and 4). Tag prefix: river.
Owns: Water/Scripts/RiverMeshGenerator.cs, RiverSurface.cs (keep HeightAt consistent with the shader's vertex wave), FoamBank.cs,
Water/Shaders/RainbowRiver.hlsl (band layout + the W11/W12 foam-shelf section; do NOT touch the "Benny's wake at the waterline" section),
RainbowWaterCommon.hlsl, RainbowFoam.hlsl/.shader, RainbowFoamBank.hlsl (RBW_BankEdges must stay line-by-line identical to
FoamBank.BankEdges), WaterBuilder.BuildRiver / BuildFoam. Shared/RiverPath.cs (the gameplay course that Benny, coins and bubbles follow)
ONLY if the visible course itself must bend differently - then keep steering (ClampLateral), coins and bubbles working.
Do NOT touch: camera, tunnel geometry, wall/ring/paddle looks, Benny, splash, coins, HUD.
What to match: in the approved image the OPEN WATER is a narrow ribbon that winds in a clear S from the bottom to the vanishing point,
with broad pink satin bands following the bends; the FOAM BANKS are narrow, TALL piles of soap bubbles (roughly 0.4-1 m) hugging both
banks all the way, rising against the walls - the purple walls come down right behind them. Unity now: open water about twice too
wide at mid distance and the foam lies in wide FLAT fields. Measure the approved open-water edges and foam extents row by row (y 560,
600, 650, 700, 800, 900, 1000, 1100, 1250 - a colour-classification script is fine) and the same in your stills; fit the visible
river width profile (the Three.js W11 channel05 narrowing / far foam shelves were never ported - see waterRibbon.ts channel05, sbend05),
the S-phase of the bands, the foam bank edges and the foam height / density to them. Keep coins on open water and Benny's steering range.`,

  tunnel: `
YOUR AREA: PURPLE TUNNEL WALLS, GOLD RINGS AND LARGER COPPER PADDLES (user priority 3). Tag prefix: tunnel.
Owns: the environment SHADER looks (Environment/Shaders: RainbowDrumWall, RainbowGoldMetal, RainbowThroatGlow, RainbowEnvLighting,
RainbowEnvCommon, RainbowFarRiver), the paddle and ring MESH SHAPES (Environment/Scripts/DrumMeshes05.cs) and paddle placement
(EnvironmentBuilder: paddles, SetupWall / SetupGold). Keep the FRAME agent's camera, tunnel radius, axis height, ring spacing / count
(report it if they must change). Do NOT touch water, foam, bubbles, splash, Benny, coins, HUD, camera.
What to match: walls = purple / magenta / lavender polished metal with NEAT CONCENTRIC ROWS of small dark oval perforations and pink-white
specular streaks that follow the drum (no radial spokes); rings = chunky, ROUNDED, polished copper-gold (orange-amber body, bright warm
highlights, darker warm edges), evenly spaced; paddles = LARGE copper-gold D-shaped trays with a thick rounded polished rim and the inner
face visible - big ones at the upper left (about x 60-240, y 380-470) and right (about x 720-860, y 480-590), smaller ones further in
(measure them in the approved image); far glow = a SMALL bright warm point with a golden halo and purple gaps between the rings, not one
over-saturated orange disc. Measure the approved paddle boxes and ring band widths and fit to them.`,

  benny: `
YOUR AREA: BENNY'S SIZE, POSITION, WATERLINE AND SPLASH + COIN PLACEMENT + HUD (user priorities 5 and 6). Tag prefix: benny.
Owns: Benny's scale and ride numbers (Benny/Scripts/BennyController.cs BodyRadius / RootRide / rideLift / ridePitchRad, the Benny rig builder
scale - swim / steer / jump must keep working exactly), the splash (Water/Scripts/SplashWake.cs, Water/Shaders/RainbowSplash.shader,
RainbowSpray.*, the "Benny's wake at the waterline" section of RainbowRiver.hlsl, WaterBuilder.PrepareSprayMaterial), the coin layout
(find where coins are placed along the course) and the HUD (find the HUD / UI builder). Keep the camera and tunnel values of the FRAME
agent; do NOT touch walls, rings, paddles, foam banks, river bands.
What to match: Benny on screen - measure the approved silhouette (pompom top about y 840, hat band about y 960-1060, body bottom about
y 1250, centre about x 420, widest body about x 255-585) and fit his scale / ride height (not the camera). WATERLINE: his round bottom
must curve INTO the water with a soft dark contact and a thin bubbly contact line - test a water-contact effect computed analytically
from _RainbowBenny in the wake section (a "see-into-the-water" tint of the submerged bottom + a thin contact foam line around his
footprint); keep it only if the splash / benny crops get closer. SPLASH: white bubbly spray fans from both sides of his lower body
backwards toward the bottom corners, bubble piles lower and further out than now, a soft V wake. COINS: approved coin centres about
(470,785), (545,718), (480,673), (430,636), (464,608), (493,595), (519,585) - a trail following the S-curve, sizes shrinking with
distance - measure them precisely. HUD: compare the bar, heart, '5/5 +', coin, '1,420', pause button and the title banner pixel by
pixel (colours, sizes, positions, fonts, rims) and match them in the UI (no images cut from the approved picture).`,
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
    improved: { type: 'array', items: { type: 'string' } },
    still_different: { type: 'array', items: { type: 'string' } },
    shared_changes: { type: 'string' },
    notes_for_next_agents: { type: 'string' },
  },
  required: ['area', 'status', 'scores_before', 'scores_after', 'files_changed', 'changes', 'final_cycle_exit', 'final_still', 'final_sbs', 'improved', 'still_different', 'notes_for_next_agents'],
}

function prior(list) {
  const done = list.filter(Boolean)
  if (!done.length) return ''
  return '\nWHAT EARLIER AGENTS OF THIS ROUND CHANGED (verify in the files; their final stills show the current state):\n' +
    done.map(r => `- ${r.area} (${r.status}; scores ${r.scores_before || '?'} -> ${r.scores_after || '?'}): files ${JSON.stringify(r.files_changed)}; ` +
      `final still ${r.final_still}; shared changes: ${r.shared_changes || 'none'}; notes: ${r.notes_for_next_agents}`).join('\n')
}

function fix(key, phaseName, extra) {
  if (SKIP.includes(key)) {
    log('skipping ' + key + ' (finished in an earlier run)')
    return Promise.resolve({
      area: key, status: 'finished in an earlier run', scores_before: '', scores_after: '', files_changed: [], changes: [],
      final_cycle_exit: 0, final_still: '', final_sbs: '', improved: [], still_different: [], shared_changes: 'see the handoff',
      notes_for_next_agents: 'Finished in an earlier run: see C:\\RainbowUnity\\UNITY_RAINBOW_HANDOFF.md and the newest work stills.',
    })
  }
  const prompt = COMMON + '\n' + AREAS[key] + (extra || '') + (NOTES[key] ? '\n\n' + NOTES[key] : '')
  return agent(prompt, { label: 'fix:' + key, phase: phaseName, schema: IMPL_SCHEMA })
}

phase('Frame')
const fr = await fix('frame', 'Frame')
log('frame finished: ' + (fr ? fr.status + ' ' + (fr.scores_after || '') : 'no result'))

phase('Shape')
const [rv, tn] = await Promise.all([
  fix('river', 'Shape', prior([fr]) + '\nOther active area: TUNNEL (walls / rings / paddles) works in parallel with you.'),
  fix('tunnel', 'Shape', prior([fr]) + '\nOther active area: RIVER (river bands / mesh / foam banks) works in parallel with you.'),
])
log('river finished: ' + (rv ? rv.status : 'no result') + ' | tunnel finished: ' + (tn ? tn.status : 'no result'))

phase('Benny')
const bn = await fix('benny', 'Benny', prior([fr, rv, tn]))
log('benny finished: ' + (bn ? bn.status : 'no result'))

const results = { frame: fr, river: rv, tunnel: tn, benny: bn }
const all = [fr, rv, tn, bn]

phase('Integrate')
const INTEG_SCHEMA = {
  type: 'object',
  properties: {
    cycle_exit: { type: 'integer' },
    hold_s: { type: 'string' },
    still: { type: 'string' }, sbs: { type: 'string' }, overlay: { type: 'string' },
    crops: { type: 'array', items: { type: 'string' } },
    series: { type: 'array', items: { type: 'string' } },
    scores_table: { type: 'string' },
    mp4: { type: 'string' }, recording_json: { type: 'string' }, recording_summary: { type: 'string' },
    first_png: { type: 'string' }, last_png: { type: 'string' },
    console: { type: 'string' },
    problems: { type: 'array', items: { type: 'string' } },
  },
  required: ['cycle_exit', 'hold_s', 'still', 'sbs', 'scores_table', 'mp4', 'recording_summary', 'problems'],
}
const integ = await agent(`
You are a subagent doing the FINAL INTEGRATION CHECK of round 3 for the user's Rainbow Screen 05 (all fix agents are done; you are the
only one driving Unity now). Read C:\\RainbowUnity\\CLAUDE.md first. Do NOT edit code, delete files, use git, or open/close Unity.
unity = C:\\Users\\josia\\AppData\\Local\\Unity\\bin\\unity.exe ; run unity commands from C:\\RainbowUnity\\UnityProject.
1. Run: powershell -NoProfile -ExecutionPolicy Bypass -File C:\\RainbowUnity\\tools\\screen05-cycle.ps1 -Tag ROUND3_FINAL -Areas all -Series
   It must exit 0 with the hold at S = 14.00 (rerun once if S differs or a domain-reload quirk hits). Note STILL, SBS, CROP, SERIES paths.
2. Measure it: powershell -NoProfile -ExecutionPolicy Bypass -File C:\\RainbowUnity\\tools\\screen05-measure.ps1 -Overlay
   C:\\RainbowUnity\\UnityProject\\Recordings\\Screen05\\work\\ROUND3_FINAL_overlay.jpg <still> ${BASE.still || ''}
   and put the full printed tables (final and baseline) in scores_table.
3. Record 12 s of real gameplay (autopilot steering both ways, jumps, coins) - Play mode is on and paused after step 1:
   unity command editor.playmode pause --project-path C:\\RainbowUnity\\UnityProject      (toggles to UNPAUSED)
   unity command script eval --project-path C:\\RainbowUnity\\UnityProject -- --file AgentScripts/screen05_status.cs   (must say paused=False)
   unity command script eval --project-path C:\\RainbowUnity\\UnityProject --timeout 120 -- --file AgentScripts/screen05_reset_run.cs
   unity command script eval --project-path C:\\RainbowUnity\\UnityProject --timeout 120 -- --file AgentScripts/screen05_record_gameplay.cs
   unity command script eval --project-path C:\\RainbowUnity\\UnityProject --timeout 960 -- --file AgentScripts/screen05_wait_capture.cs --timeout 900
   It writes C:\\RainbowUnity\\UnityProject\\Recordings\\Screen05\\gameplay_<time>.mp4 + .json + _first.png + _last.png. Read the json and look
   at _first.png and _last.png.
4. Look at the final SBS, the overlay and the 3 series stills. List anything broken (pink/missing materials, seams, popping, floating
   objects, Benny clipping, camera problems while steering, HUD problems, console errors) in problems - only things you see or read.
Return the structured result with exact paths.
Fix agents' reports (context only):
${prior(all)}`, { label: 'integrate', phase: 'Integrate', schema: INTEG_SCHEMA })

phase('Review')
const CRITIC_SCHEMA = {
  type: 'object',
  properties: {
    lens: { type: 'string' },
    priorities: {
      type: 'array', items: {
        type: 'object',
        properties: {
          priority: { type: 'string' },
          verdict: { type: 'string', enum: ['matches', 'close', 'better_but_off', 'about_the_same', 'still_far', 'regressed'] },
          remaining: { type: 'array', items: { type: 'string' } },
          regressions: { type: 'array', items: { type: 'string' } },
        },
        required: ['priority', 'verdict', 'remaining'],
      },
    },
    top_fixes: {
      type: 'array', items: {
        type: 'object',
        properties: {
          fix: { type: 'string' }, priority: { type: 'string' },
          impact: { type: 'string', enum: ['high', 'medium', 'low'] }, where: { type: 'string' },
        },
        required: ['fix', 'priority', 'impact'],
      },
    },
    capture_honesty_problems: { type: 'array', items: { type: 'string' } },
    agent_claims_not_supported: { type: 'array', items: { type: 'string' } },
    gameplay_problems: { type: 'array', items: { type: 'string' } },
  },
  required: ['lens', 'priorities', 'top_fixes'],
}
const LENSES = [
  { key: 'composition', text: 'PRIORITIES 1-4: tunnel geometry / perspective / depth / camera framing; the narrow S-river and its proportions; walls, gold rings, larger copper paddles; narrow taller foam banks' },
  { key: 'benny-gameplay', text: 'PRIORITIES 5-6 and PLAY: Benny size / position / waterline / splash, coins, HUD, bubbles, and the moving view and recording (s = 10 / 20 stills, recording first/last frames + json): consistency while swimming, steering and jumping' },
]
const integText = integ ? JSON.stringify(integ) : 'integration agent returned nothing'
// args.reviewers = how many AI critics to run (default: all lenses). The user (2026-11-23 18:35 local) asked to avoid redundant AI
// reviewers: round3-args.json sets 0 - the integration agent's gameplay check stays, the coordinator reviews the final evidence.
const REVIEWERS = (args && Number.isInteger(args.reviewers)) ? Math.max(0, Math.min(LENSES.length, args.reviewers)) : LENSES.length
if (REVIEWERS < LENSES.length) log('AI reviewers: ' + REVIEWERS + ' of ' + LENSES.length + ' (args.reviewers)')
const critics = await parallel(LENSES.slice(0, REVIEWERS).map(l => () => agent(`
You are an independent, SKEPTICAL reviewer of the user's Unity port of their approved Rainbow Screen 05 image. Read-only: do NOT edit files,
use git, or drive Unity. Read C:\\RainbowUnity\\CLAUDE.md for the rules (no projection / pasted images; honest captures: real Game view,
864x1536, Benny at s = 14.00, normal gameplay camera, no shifting/cropping/retouching).
Approved image: C:\\RainbowUnity\\references\\05_flow_into_the_current.png (864x1536). BEFORE this round: ${BASE.sbs || 'the ROUND2_FINAL side-by-side in UnityProject\\Recordings\\Screen05\\work'}
AFTER this round (final integration): ${integText}
Scores tool (read-only): powershell -NoProfile -ExecutionPolicy Bypass -File C:\\RainbowUnity\\tools\\screen05-measure.ps1 -Overlay <out.jpg> <still.png>
(visual / layout similarity at identical pixel positions; calibration: approved shifted 8 px = visual 91 / layout 73).
YOUR LENS: ${l.text}.
Look at the images yourself with the Read tool (extra crops: powershell -NoProfile -File C:\\RainbowUnity\\tools\\make-crop-compare.ps1 -Unity <still.png>
-X -Y -W -H -Zoom 2 -Out C:\\RainbowUnity\\UnityProject\\Recordings\\Screen05\\work\\review3_<name>.jpg). For each user priority in your lens give a verdict
against the APPROVED image, the concrete remaining differences (most visible first, with pixel locations), and regressions vs BEFORE. Check the
capture is honest (normal gameplay camera, nothing moved or hidden only for the capture, no post-processing). Then the TOP fixes for the next
round, highest visual impact first. Verify the fix agents' claims against the pictures and list claims the pictures do not support.
Fix agents' reports:
${prior(all)}`, { label: 'review:' + l.key, phase: 'Review', schema: CRITIC_SCHEMA })))

return { results, integration: integ, critics: critics.filter(Boolean) }
