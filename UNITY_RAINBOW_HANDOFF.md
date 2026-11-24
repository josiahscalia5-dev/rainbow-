# Rainbow Unity — handoff (latest verified state)

Last verified: **2026-11-24 13:55 UTC** (08:55 local), Claude session 018893e6 (new account) on the user's laptop. Unity is OPEN; Round 4b is DONE (80.5 / 66.6, tagged); Round 5 is next.
Read this first in any new Claude account or session. **This is an existing project — never start over.**
Project rules for Claude: `CLAUDE.md` (loaded automatically when a session is opened in `C:\RainbowUnity`).

<!-- NEXT-TASK:START -->
## NOW - read this first (concise; rewritten after every finished step; the DETAILED LOG below is history)
Updated 2026-11-24 08:55 local (session 018893e6, new account; the previous account ran out of credits at 08:28 local). Cross-account rules: CLAUDE.md "PERMANENT RULE".
- **USER (2026-11-24 ~08:33 local, binding):** resume Round 4 with at most TWO specialists, conserve credits, reuse the existing tools (cycle tool, automatic fitter
  `Screen05AutoFit`, geometry tools, Blender tools) instead of building new ones; at least 70 now, preferably 75+, final goal 90-95 %; preserve the best version;
  priority: reflective purple walls, copper-gold rings, half-moon paddles, foreground frame, S-river, natural foam, bubbles, realistic water reflections, Benny's
  water contact. Show the real Game View beside the approved image with honest visual + layout scores. No Screen 06 without approval.
- **USER'S CORRECTION GUIDES (binding):** `references/correction-guides-2026-11-24/` (README.md = per-area instructions + 3 images; full-resolution copies in
  `full-resolution/`, added 08:50). Every specialist / Blender / Unity job reads them first. Their Unity side is an OLD mid-edit still (white walls): judge against the newest still.
- **ROUND 4b RESULT (recovered by this account):** run `wf_54c15c25-7a2` (TUNNEL | RIVER) was cut at 08:28:41 when the credits ran out, AFTER both lanes' edits were
  saved; the river lane's last cycle `river_final` (08:29) finished on its own. Coordinator integration `ROUND4_FINAL` (08:42, full rebuild from code) =
  **visual 80.5 / layout 66.6** (from 67.0 / 47.5; measure tool unchanged since 11-23 18:04, the old baseline still re-measures 67.0 / 47.5). Gameplay check passed
  (steer L -4.20 / R -0.24, jump 1.20 + landing, coins 1420 -> 1440, hearts 5/5, Swimming). Evidence `evidence/screen05/round4/20261124_084215_ROUND4_FINAL*`
  (+ errormap heat), 12 s recording `UnityProject/Recordings/Screen05/gameplay_20261124_084559.mp4`.
- ERROR MAP of ROUND4_FINAL (`tools/diag/errormap.ps1 -Oracle`): biggest remaining gap = near water / Benny's splash y 1100-1536 (+4.5 visual / +8.1 layout if
  perfect), then upper walls + rings (+2.4), HUD (+2.3), mid river (+2.3), Benny box (+2.1), water right / left (+1.8 / +1.6), left wall + foam (+1.4).
- NEXT (in order): (1) coordinator FITTER, GLOBAL look only (bloom, exposure, contrast, saturation, hue, vignette, light intensities): params
  `staging/shared/autofit_round5_global_params.txt` (= `Recordings/Screen05/work/autofit_params.txt`, budget `autofit_seconds.txt` 240), run
  `screen05-cycle.ps1 -Tag R5_prefit -Areas all -NoRebuild -EvalAtHold AgentScripts/screen05_autofit.cs`; winners (`work/autofit_result.txt`) -> append to
  `Assets/Rainbow/Tuning/screen05_tuning.txt`; confirm with a full cycle; keep only if the score rises. (2) ROUND 5 = `staging/shared/round5-visual.workflow.js`:
  two lanes RIVER (near water / contact / splash, then mid water, foam rims) | TUNNEL (upper walls, rings, corners, paddles, near frame + BUBBLES); args.baseline =
  the newest confirmed still. If the run dies: journal -> `skip` + `notes`, relaunch the same script. (3) Integration cycle `-Tag ROUND5_FINAL -Areas all -Series` +
  `screen05_playtest_check.cs`; tag `validated/r5-final-<visual>` if higher; side-by-side + both scores to the user. (4) Fitter again on the lanes' material values.
- VALIDATED VERSIONS (safe fallbacks; every autosave commit after the newest one may hold EXPERIMENTAL work):
  | git tag | commit | visual / layout | what | evidence |
  |---|---|---|---|---|
  | validated/r4b-final-80.5 | a3f7d54 | 80.5 / 66.6 | Round 4b: data-driven S-river, glints, foam ropes, copper tunnel, half-moon paddles, coins | evidence/screen05/round4/20261124_084215_ROUND4_FINAL* |
  | validated/r4-baseline-58.0 | aa2a2e1 | 58.0 / 36.8 | coordinator look tuning: walls, paddle tilt -15, azure water grade, darker HUD | evidence/screen05/round3/20261124_051325_G_BASELINE* |
- BLENDER: approved by the user (after Round 4, storage checks); NOT installed yet. C: 6.7 GB free at 08:34 (setup needs >= 6.5 GB, leaves ~5.3 GB). The biggest
  measured gaps are water / splash / wall-pattern SHADER work where Blender does not help, so it is installed when a mesh job needs it (paddle / ring shape),
  preferably after the user OKs freeing old regenerable work stills (git-ignored `UnityProject/Recordings/Screen05/work`, ~1.5 GB; ask before deleting).
- UNITY NOTES: the previous session's end killed the Editor (no clean exit); on reopen Unity showed "Recovering Scene Backups" and saved
  `Assets/_Recovery/0 (3).unity` (0..3 = harmless recovered copies; ask the user before deleting). Windows Security blocked a Burst DLL in Library (the game does not need Burst).
- WAITING ON THE USER: (a) permission rules v2 in `tools/claude-permissions/` - the user applies them; (b) the GitHub repo is PUBLIC although the user called it private.
<!-- NEXT-TASK:END -->

## DETAILED LOG (older entries, newest first; the NOW block above wins where they disagree)

**MOVED FROM NOW (08:05 local block of session b41bab30, superseded 08:55 local):** Round 4b launched 08:00 as run `wf_54c15c25-7a2` (TUNNEL | RIVER; script
`staging/shared/round4b-visual.workflow.js`, baseline still `20261124_075315_R4_barrel` 67.0 / 47.5; journal under session b41bab30-da85-4ac4-a946-62f3f4cd4aef).
Before it (session b41bab30): the old account's run `wf_ab41a260-945` died at 07:24 (62.7 / 41.2); coordinator GEOMETRY FIT of the drum with the real camera
(`tools/diag/fit-rings.ps1`; DrumLayout05 AxisS / AxisXs / AxisYs / AxisRs; rings 25.6 / 46 / 82 / 105.8 / 159.4, all visible rings within 0.5-2.6 px) + HUD rebuilt from
measurements (HudGlyphs.cs, HudGlyphText.cs) = 67.0 / 47.5; river targets traced + unprojected (`staging/round4-river/river_targets.csv`, `tools/diag/unproject-river.ps1`);
diagnostics `tools/diag/errormap.ps1`, `gridshapes.ps1`. 08:00-08:10 coordinator: coins on the approved centres (CoinTrail.ApprovedCoins), bubble start composition
(BubbleField.StartBig / StartSmall), Benny's arms / pose (BennyRigBuilder SwimPhase / ArmPhase / ArmScale / ArmRest, BennyController.VisualShiftX), HUD glyphs; NEW
automatic look fitter `Assets/Rainbow/Testing/Editor/Screen05AutoFit.cs` + `AgentScripts/screen05_autofit.cs` + `Assets/Rainbow/Editor/Screen05Tuning.cs` +
`Assets/Rainbow/Tuning/screen05_tuning.txt` (never run before 08:55). The user's correction guides arrived ~08:25 and were saved to
`references/correction-guides-2026-11-24/`; the running lanes read them at 08:27, then the account ran out of credits at 08:28:41.

**MOVED FROM NOW (06:33 local block of session d7b2bd77, superseded 08:05 local):** run `wf_ab41a260-945` (stage R4, TUNNEL | WATER4) died at 07:24 local with the old account, mid-test; lane edits kept (62.7 / 41.2). Baseline before it: stage G1 57.8 / 36.3 (`work/20261124_055442_bubbles_final*`). The first R4 run `wf_3142dea6-d2c` died before any edit (helpers in `staging/round4-recovery/`).

**UPDATE 2026-11-24 06:33 local (moved from NOW):** DONE 06:00: stage G1 (run `wf_625572df-94a`): left foam carpet -> narrow rope of
big puffs, ~50 iridescent bubbles; combined still `work/20261124_055442_bubbles_final*` = 57.8 / 36.3 (flat vs 58.0, kept for the visibly
closer foam + bubbles; experimental). Then run `wf_3142dea6-d2c` (stages R2 TUNNEL | RIVER -> R3 BENNY, args
`staging/shared/round3-visual-R2R3-args.json`, session ded4464c) started 06:07 and died 06:16 at the old account's 5-hour limit; both lanes
had only measured (no project edits). The new account (session d7b2bd77) reopened Unity (06:26; the CLI first reported the "Recovering
Scene Backups" dialog, then the Editor came up ready with Screen05 loaded, not dirty) and relaunched Round 4 as stage R4 with two lanes.

**UPDATE 2026-11-24 10:20 UTC (05:20 local) - ROUND 3 STAGE G1 IS RUNNING (Workflow run `wf_625572df-94a`, session
`ded4464c-608a-4332-9b1b-b33e5222d645`, at most 2 agents):** GEOMETRY (lower tunnel walls meet narrow, tall foam banks; ring
framing kept) | BUBBLES (large iridescent bubbles). Script `staging/shared/round3-visual.workflow.js` (new stages G1 / G2 + notes
on live variants), exact args `staging/shared/round3-visual-G1-args.json`, journal
`%USERPROFILE%\.claude\projects\C--Users-josia--unity\ded4464c-608a-4332-9b1b-b33e5222d645\subagents\workflows\wf_625572df-94a\journal.jsonl`.
- Done 05:04-05:15 local: confirm cycle `coord_e3` = 57.2 / 36.4 -> the foam width cap was REJECTED (it widened the open water
  almost wall to wall; FoamRimCap / RBW_FOAM_CAP = 99 = off, foam values restored). Baseline `work/20261124_051325_G_BASELINE*` =
  **visual 58.0 / layout 36.8** (exactly the e2_c1 variant, rebuilt from code, console clean) - sent to the user. Diagnostics now in
  `tools/diag/` (colorgrid, cropstack, measure-compact).
**USER, ~05:40 local - PERMISSIONS:** narrow allow rules for routine work were PREPARED (not applied by Claude):
`tools/claude-permissions/` (rules JSON + apply script, dry-run tested on a copy). The user applies them once with
`powershell -NoProfile -ExecutionPolicy Bypass -File C:\RainbowUnity\tools\claude-permissions\apply-rainbow-permissions.ps1`
(merges into `~/.claude/settings.json`, backup first; works across folders and account switches). Use literal command paths (CLAUDE.md, Tools).
**USER, ~05:30 local - STRATEGY CHANGE ("ROUND 4"):** ONE strong improvement round from visual ~58 toward 75 (not many tiny steps),
biggest differences first: gold rings (thickness, spacing, size, placement), gold paddles (shape, size, angle, position), reflective
purple metallic walls, stronger river S-curve, narrower natural foam, Benny's water contact, larger iridescent edge bubbles. Keep the
58.0 baseline safe (= git commit `aa2a2e1`, stills in `evidence/screen05/round3/20261124_051325_G_BASELINE*`), keep gameplay intact,
no excessive testing; show ONE new Game-view side-by-side after the round.
**NEXT (replaces the G2 plan below):** (1) when G1 ends: coordinator cycle `-Tag G1_done -Areas all` (no side-by-side to the user yet).
(2) ONE run `Workflow({scriptPath: round3-visual.workflow.js, args: {stages: ["R2", "R3"], baseline: <G1_done>, context: <G1 results>}})`
= TUNNEL (rings / paddles / walls) | RIVER (S-curve), then BENNY alone (the script passes R2's results on; ROUND4 brief text only in R
stages). (3) Coordinator integration below, then the side-by-side to the user. OLD plan: (2) Launch
G2 (`stage: "G2"` = BENNY water contact | WATER S-flow) with that still as baseline + notes from G1. (3) Integration
`-Tag ROUND3_FINAL -Areas all -Series`, `AgentScripts/screen05_playtest_check.cs`, a 12 s recording; send all to the user; update
this handoff. If a run is interrupted: read its journal, put lanes with a result into `skip`, write `notes.<lane>` for the
interrupted lane (its newest files + work stills), relaunch the same stage. No Screen 06 until the user approves Screen 05.

**UPDATE 2026-11-24 03:33 UTC (22:33 local) - SAFELY PAUSED FOR THE NIGHT (user request). Nothing running, Unity closed
gracefully (`unity close --if-saved`), GitHub = laptop. When the user says "Resume Rainbow": continue at NEXT below.**
- The old account's stage-A run `wf_1d23ecb6-d86` died at 21:53 local (limit). Its lane edits are saved (tunnel: 3-strand
  rings, dense slot-row walls, new thick-rim paddle profile; water: low lumpy foam) but scored LOWER than the stage start
  (water_t2 52.1 / 34.7 vs 54.8 / 36.2: pastel walls too bright, paddles turned into "horns"). It was NOT relaunched.
- Coordinator live tuning (new `AgentScripts/screen05_coord_tune.cs`; variants `Recordings/Screen05/work/coord_variants.txt`,
  tag in `coord_tag.txt`; run with `screen05-cycle.ps1 -EvalAtHold AgentScripts/screen05_coord_tune.cs`): best combination
  `work/coord_var_e2_c1.png` = **visual 58.0 / layout 36.8** (from 52.1 / 34.7; water_near 48 -> 56.7, walls 50 -> 54.6,
  throat 60.3 -> 65.8, splash 60.4 -> 67.9, bubbles 48.4 / 39.3 -> 59.0 / 48.2). BAKED into the builders, but NOT yet
  confirmed by a rebuild cycle: walls (EnvironmentBuilder: WallBase 0.70,0.28,0.92; WallGlow 0.40,0.03,0.50,0.45;
  _EnvIntensity 0.75; _StripIntensity 2.2; WallLipGlow 0.8; _Exposure 0.85), PaddleFaceTiltDeg -15 (was +32), deeper azure
  water (new `_RiverGrade` in RainbowRiver.shader, set from WaterBuilder.RiverGrade = 0.55,0.70,0.93,1), darker HUD bar
  (Screen05Hud.BarTexture; measured hud 46.5 -> 48.6).
- WRITTEN BUT NEVER TESTED: narrow, taller foam banks = FoamBank.FoamRimCap 1.3 + RBW_FOAM_CAP 1.3 in RainbowFoamBank.hlsl
  (keep equal; caps the foam to 1.3 m in front of the wall, the open water widens to meet it) + taller hW / bigger puffs in
  FoamBank.GeneratePuffs.
**NEXT (in order):** (1) `unity open C:\RainbowUnity\UnityProject --until-ready`. (2) ONE cycle `-Tag coord_e3 -Areas all`
(if "No Pipeline instance found": wait 25 s, rerun). Expect about 58 / 36.8 from the baked look; it also tests the foam cap.
If OVERALL or foam_left / foam_right drop, revert ONLY the foam-cap edits and rerun. (3) Send the user that side-by-side + both
scores. (4) Root cause of the wide flat foam: Unity's drum is wider at the waterline than the approved (fitted left rim 2-3 m
at s 20-31), so the next big step is narrowing the lower tunnel walls toward the foam (DrumMeshes05 / DrumLayout05, keep the
ring framing), then the S-curve river, Benny's water contact and bubbles (round3-visual workflow stage B, at most 2 lanes,
notes from this entry). No Screen 06 until the user approves Screen 05.

**UPDATE 2026-11-24 02:35 UTC (21:35 local) - ROUND 3 VISUAL STAGE A IS RUNNING (Workflow run `wf_1d23ecb6-d86`):**
**User, 21:25 local:** save the working configuration and stop optional setup / optimization. Spend the remaining credits on real
Screen 05 development: tunnel geometry, realistic metallic gold rings and paddles, deeper purple reflective walls, natural S-shaped
water flow, softer foam, floating iridescent bubbles, Benny's natural contact with the water. Make substantial visible improvements, not
tiny score gains. Keep real playable 3D and every existing function. Show a new Unity Game-view side-by-side after meaningful
improvements. No Screen 06 until the user approves Screen 05.
**Done 20:50-21:35 local (all saved; GitHub = laptop at `ac9e1c5` when the round started):**
- After the restart: C: 7.9 GB free (page file 7.4 GB). The safe cleanup candidates are small (~1 GB: browser caches 0.6 GB, Unity
  download cache 0.26 GB, Temp 0.1 GB), so nothing was deleted. Downloads (16.8 GB, the user's Meshy files) was not touched.
- Play Mode = "Reload Scene only" (`EditorSettings m_EnterPlayModeOptions: 1`). KEPT after the A/B test: the same stills (54.8 / 36.2
  vs 54.8 / 36.1 with reload), the same steer / jump / coin numbers, a clean console, and 2 x 120/120-frame recordings in a row. A full
  cycle takes 69 s instead of 113 s; `-NoRebuild` takes 31 s. Revert: `AgentScripts/screen05_playmode_reload.cs` (fast:
  `screen05_playmode_fast.cs`). New checks: `AgentScripts/screen05_playtest_check.cs` (steer / jump / coins / hearts),
  `screen05_record_short.cs` (4 s clip).
- Repeatable stills: new `Assets/Rainbow/Shared/Screen05Clock.cs` (shared animation clock). Shaders use `_RainbowTime` instead of
  `_Time.y`; C# uses `Screen05Clock.Time` (CoinTrail, BubbleField, RiverSurface.HeightAt, Benny's wobble). The hold resets it, so two
  identical cycles now give identical scores (before, the animation phase alone moved the water areas by up to 4 points).
- Honest starting point of this stage: `evidence/screen05/round3/stage2_start_r3_clock_D*` = visual 54.8 / layout 36.2 (the saved
  lane edits added +2.0 / +2.4 to the frame stage's 52.8 / 33.8).
- Target sheet: the measuring agent was stopped at the user's request. The partial `staging/round3-fit/measure-targets.ps1` +
  `Targets05.cs` are unverified. The frame agent's hand-measured numbers are the target sheet (written into the workflow brief).
**RUNNING NOW:** `staging/shared/round3-visual.workflow.js` stage A (exact args: `staging/shared/round3-visual-args.json`): lanes
TUNNEL (walls, gold rings, paddles, throat) | WATER (S flow, softer foam). Session `fe5f24d5-f330-4fca-9c63-b893aefbb03f`; journal
`%USERPROFILE%\.claude\projects\C--Users-josia--unity\fe5f24d5-f330-4fca-9c63-b893aefbb03f\subagents\workflows\wf_1d23ecb6-d86\journal.jsonl`.
**NEXT:** (1) when stage A ends: one coordinator cycle `-Tag r3v_stageA -Areas all`; send the user the side-by-side + both scores.
(2) Launch stage B (`stage: "B"`: BENNY water contact / splash | BUBBLES) with that still as the new baseline and notes from stage A's
results. (3) Coordinator integration: `-Tag ROUND3_FINAL -Areas all -Series`, `screen05_playtest_check.cs`, a 12 s recording; send the
user the side-by-side + scores + recording; update this handoff. If a run is interrupted: read its journal, put lanes with a result into
`skip`, write `notes.<lane>` for the interrupted lane (its newest files + work stills), relaunch the same stage.

**UPDATE 2026-11-24 01:45 UTC (READY FOR A LAPTOP RESTART; nothing running; Unity closed):**
**User request, 20:29 local:**
- They approved the faster Play Mode ("Reload Scene only"), subject to safety testing. Revert it if gameplay breaks or test results become unreliable.
- Fix the low disk FIRST: verify everything is saved and nothing is running, then recommend a safe restart. Never delete Unity project files, assets, packages or Claude settings.
- Restore the official Unity plugin (33 skills) on this account.
- Keep the Unity CLI. Never connect `unity mcp`, and never rerun its benchmark.
- Continue the faster methods where they help: approved-image target sheet, automatic geometry fitting, live Editor tuning, Cinemachine framing, Splines and reusable 3D systems.
- Then resume round 3 stage 2 from the saved lane edits without redoing finished work. No Screen 06.

**Done 20:29-20:45 local:**
- Verified again: GitHub = laptop, 0 uncommitted, autosave OK, and no other Claude session, cycle or lock holder.
- Added the 4 Play Mode safety resets. They change nothing while the domain still reloads:
  - `[InitializeOnEnterPlayMode]` in Screen05Capture (Status/LastOutput).
  - `[InitializeOnEnterPlayMode]` in Screen05GameplayRecorder (a stale Active gets Cleanup()).
  - `[InitializeOnEnterPlayMode]` in Screen05SeriesRun (a stale Active gets unsubscribed).
  - `[RuntimeInitializeOnLoadMethod(SubsystemRegistration)]` in Screen05CaptureFrameHook (LateFrame = null).
- Recompile completed with 0 C# errors. This also compiled both lanes' saved C# edits; their shader edits have not been seen on screen yet.
- Unity was closed gracefully with `unity close` at 20:40, so the restart is clean.
- The Play Mode setting is UNCHANGED (still reload domain + scene).

**Disk:** 2.7 GB free. The page file is 12.3 GB and shrinks on restart. `~\Downloads` holds 16.8 GB in 1,080 items (mostly Meshy/.glb models, zips and `Rainbow_Screen06_Candidate`). Those are the user's files: never delete them; only list exact duplicates if the user asks.

**Unity plugin:** still NOT enabled. The install card was shown; the user must click Install, and the skills appear in the next new session.

**AFTER THE RESTART (next session, in this order):**
1. Read the status hook. Check free disk (expect ~9-11 GB), GitHub sync and autosave. Check that the 33 `unity:*` skills are loaded; if not, ask the user to install via + → Add plugins → "Unity".
2. Open Unity: `unity open C:\RainbowUnity\UnityProject --until-ready`.
3. Play Mode A/B safety test:
   - Cycle A: `-Tag r3_resume_A -Areas all` with reload ON. This is also the first test of both lanes' saved edits and the honest stage-2 starting score. Send the user its side-by-side + scores.
   - Switch the setting via script eval: `EditorSettings.enterPlayModeOptionsEnabled = true; EditorSettings.enterPlayModeOptions = EnterPlayModeOptions.DisableDomainReload; AssetDatabase.SaveAssets();`
   - Cycle B: same tag style with reload OFF (full cycle; compare the step timings).
   - Cycle C: `-NoRebuild`, a second Play session in the same domain (stale-state check).
   - Then a steer/jump/coins eval at hold, and a short (3-5 s) gameplay recording twice in a row (checks the LateFrame reset).
   - KEEP the setting only if the A/B/C scores match within 0.2, the console stays clean, gameplay works and the recordings have the right frame counts. Otherwise set `enterPlayModeOptions = None` again and report.
4. Build the target sheet + fitter, reusing `staging/round3-recovery`, `AgentScripts/screen05_frame_probe.cs` and the frame result's measured numbers. Output: one JSON of approved targets, plus one projection tool that predicts screen positions from the code-built geometry. Every lane uses it before rendering.
5. Relaunch round 3:
   - `skip: ["frame"]`; notes per lane from their transcript tails + cycle A.
   - At most 3 cycles per lane, numbers first, live tuning at hold, `reviewers: 0`.
   - The user approved cheaper models for mechanical steps (e.g. integration/recording on Sonnet); keep Opus for the visual lanes.

**UPDATE 2026-11-24 01:25 UTC (new Claude account; transfer verified; NOTHING IS RUNNING):** the previous account hit its 5-hour
limit at 01:02 UTC (20:02 local), and the account switch ended its session. So round-3 run `wf_9320b9e1-c74` is dead and must be
relaunched as described below. Verified read-only: Git `unity/screen05-dev` @ `3207178` = GitHub, 0 uncommitted; autosave task
Ready (last pass OK 20:04); Editor 6000.3.29f1 open, `unity status` ready, CLI 1.0.1, all 16 checked packages at the expected
versions in PackageCache. The Editor sits in Play mode PAUSED (the cycle tool stops Play mode itself). The lanes' newest edits
are NOT compiled yet. **Round 3:** FRAME finished (52.8 / 33.8, `evidence/screen05/round3/stage1_frame_final_sbs.jpg`). SHAPE:
the river lane (agent a48fd...) edited RainbowFoamBank.hlsl, RainbowRiver.hlsl, FoamBank.cs and RiverMeshGenerator.cs. The
tunnel lane (a041b...) edited EnvironmentBuilder.cs, RainbowDrumWall.hlsl/.shader, RainbowGoldMetal.hlsl and
RainbowThroatGlow.hlsl. Both sets are in commits `1601007` and `9e132fe`, but NEITHER lane ran a test cycle. From ~19:53 local
their cycles waited for `Temp\screen05-cycle.lock`, which the coordinator's CLI-vs-MCP test held after its first MCP tool call
hung (19:35 until it was killed at 20:02). Their temp helper tools are now in `staging/round3-recovery/` (see its README).
**CLI vs MCP (recovered, not rerun):** CLI: `unity status` median 1.77 s, `script eval` median 0.21 s, 0 failures. MCP: start
0.25 s, tools/list 0.27 s, but 187 tools (~37,400 tokens of definitions), and its first tool call never answered (>25 min). Result:
no advantage. The Unity CLI stays the only method, `unity mcp` stays unconnected, and the test is closed. LESSON: every helper
that takes the cycle lock needs a hard timeout. **Play Mode speed-up audit (read-only):** the game code is ready for "Reload
Scene only". Screen05Events and SwimInputOverride reset their statics, the singletons clear in OnDisable, and the HUD font is
null-checked. Four editor test-tool statics need a reset on entering Play mode first: Screen05Capture.Status/LastOutput,
Screen05GameplayRecorder.Active, Screen05SeriesRun.Active and Screen05CaptureFrameHook.LateFrame. The setting is still "reload
domain + scene"; change it ONLY with the user's approval. **This account:** the Unity plugin is NOT enabled (install card offered
to the user). Playwright and TypeScript are not added (they need Node.js, which the user said not to install). The World Labs
connector is absent (not needed). Connected: Claude Docs, Hugging Face, the Blender extension (Blender not installed) and
scheduled-tasks (0 tasks). **Laptop:** C: has only 2.8 GB free (8.2 GB at 19:10). The Windows page file is 12.3 GB and RAM has
0.7 GB free; this morning's restart freed ~8 GB. Suggest a restart between rounds, never while specialists run. **NEXT (after
the user's go-ahead):** if approved, add the 4 resets and switch Play Mode. Then run ONE coordinator cycle
`-Tag r3_resume -Areas all` (compile check plus an honest still and scores of the combined untested edits). Then relaunch round 3
with `skip: ["frame"]`, `notes.river` / `notes.tunnel` (their edits, that cycle's result, `staging/round3-recovery`), and the
faster rules: offline projection before cycles, at most 3 cycles per lane, numbers first, live tuning while paused. Keep
`reviewers: 0`.

**UPDATE 2026-11-23 23:30 UTC (third Claude account; ROUND 3 RUNNING):** the second account hit its 5-hour limit at 23:07 UTC
while the round-2 BUBBLES agent was starting its final check. The new account verified everything (Git = GitHub `f67c5f1`,
one autosave task, Editor open + ready, nothing running) and finished round 2 itself: `bubbles_final` cycle 18:25 local exit 0,
compile-clean, 0 warnings, gameplay check 33-50 visible bubbles and none over Benny while steering/jumping. Round 2's separate
integration/review was SKIPPED to save credits (round 3's own Integrate/Review cover it). Honest round-3 baseline (S = 14.00,
normal camera): `evidence/screen05/ROUND3_BASELINE.png` + `_sbs.jpg`, scores **visual 52.4 / layout 32.7** (round-2 start
51.1 / 32.1). `tools/screen05-cycle.ps1` now prints the measure table + writes `<still>_overlay.jpg` after every cycle.
The user (18:15 local) read and APPROVED skipping all three tools in `docs/tool-evaluation-2026-11-23.md` (install nothing).
The water-contact test is NOT started yet: it is part of round 3's BENNY stage (the splash agent's contact shadow behind Benny
already exists - build on it). **Round 3 = Workflow run `wf_9320b9e1-c74`** (launched 23:28 UTC, session
`df1b2c26-91e9-4240-8bd4-29c06e5960e0`; journal: `%USERPROFILE%\.claude\projects\C--Users-josia--unity\df1b2c26-91e9-4240-8bd4-29c06e5960e0\subagents\workflows\wf_9320b9e1-c74\journal.jsonl`):
frame -> river | tunnel -> benny -> integrate -> 2 reviewers. **FRAME finished 19:35 local** (partly improved; OVERALL
52.4/32.7 -> 52.8/33.8, walls 49.5 -> 54.1, throat 65.6 -> 67.9; still `work/20261123_192653_frame_final.png`): DrumLayout05
Radius 6.8, axis 4.25 m above water (near drop to 3.25 for s < 35.5), rings at s 5.6/24.3/45.5/66.4/106.5/163.6/230.1/333/450.4,
throat cap s 470, camera at s 14 (-0.06, 3.40, 7.48) euler (12.78, 357.20, 0) fov 62, vanishing point (496, 478); the hold is now
deterministic (whole frames, always S = 14.00). River | tunnel lanes started 19:35. **If interrupted:** read that journal, put every area with a
"result" line into `args.skip`, write `args.notes.<area>` for the interrupted one (its newest files + work stills), and relaunch
`staging/shared/round3-composition.workflow.js` with the same `baseline` + `context` args, saved exactly in
`staging/shared/round3-args.json`. After round 3: send the user the ROUND3_FINAL side-by-side + both scores + the recording.
**User 18:35 local:** after EACH stage (Frame, Shape, Benny, Integrate) send the stage agent's existing final side-by-side +
its scores (no extra tests just for previews); at the next safe checkpoint evaluate whether procedural geometry / live Editor
tuning / stronger compatible Unity tools could speed things up (install nothing without approval); AVOID REDUNDANT AI REVIEWERS:
the running run still has 2 critics after Integrate, so the coordinator stops it (TaskStop) right after the integration result
and reviews the final evidence itself; relaunches use `round3-args.json` (`reviewers: 0`, supported by the script since 18:45).
**User 19:05 local (read-only, nothing installed):** full tool inventory + speed-up options in `docs/tool-inventory-2026-11-23.md`
(keep Unity; no engine switch). Not working but harmless: Playwright + TypeScript LSP plugins (need Node.js), Blender MCP (Blender not
installed), old Unity AI Assistant relay in `~\.unity\relay`, empty `Hub\Editor\6000.6.0f1` stub. Proposed for after round 3 (free):
approved-screen TARGET SHEET, solve-first FITTER (extend `screen05_frame_probe.cs`), live tuning while paused, numbers-first agents;
needs the user's OK: cheaper Claude model for mechanical steps, connecting the CLI's `unity mcp` server.
**User 19:20 local:** interested in the CLI's `unity mcp`, but only if it brings a real benefit (Unity's own unity-cli skill says:
with a shell, use `unity command`, not MCP - the CLI reaches more). A read-only CLI-vs-MCP speed/token test (temporary `unity mcp`
child process, nothing registered; takes the cycle lock) runs at the Frame->Shape stage boundary; result goes here. Also found
(read-only, for after round 3, each needs the user's OK where it changes settings): Enter Play Mode is set to RELOAD the domain
(`EditorSettings m_EnterPlayModeOptions: 0`) - ~30 s of every ~65-100 s cycle is that reload ("Reload Scene only" + static resets
would cut it); Pipeline `script.methodreload` (hot-reload `[MethodReload]` methods in Play mode); Splines `SplineExtrude` (round
tube along a D-shaped spline = thick paddle rims); Cinemachine 3 `CinemachinePositionComposer` / `RotationComposer` (screen-space
framing: Benny's screen spot, dead zones); unity:urp-postprocessing skill for bloom/tonemapping; craft-game-floors references
(camera-rigs, scene-lighting, vfx). ProBuilder: little value for code-built meshes.

**UPDATE 2026-11-23 23:05 UTC (USER PRIORITY = COMPOSITION):** the user wants the approved Screen 05 COMPOSITION recreated in
the playable scene, in this order: (1) tunnel geometry, perspective, depth, camera framing; (2) narrow winding S-shaped river
and its proportions; (3) purple walls, gold rings, larger copper paddles; (4) narrow, taller foam banks; (5) Benny's size,
position, waterline, splash; (6) coins and HUD. Target 90–95 % VISUAL similarity; report visual AND layout similarity with
how they are calculated; no score manipulation by alignment/cropping (the measure tool now compares at identical positions,
no shift search); identical 864×1536 resolution and the normal gameplay camera at s = 14.00. Round 3 = composition-first
workflow `staging/shared/round3-composition.workflow.js` (launch after round 2 finishes). The water-contact test from the
tool evaluation is folded into round 3's Benny stage. Never declare Screen 05 approved; no Screen 06.

**UPDATE 2026-11-23 23:00 UTC (tool evaluation):** see `docs/tool-evaluation-2026-11-23.md`. Unity AI Material Generator: not
now (credits unknown - the user must sign in to Unity in the browser pane to check; needs package/Cloud link or the beta CLI
`ai` plugin; adds surface detail, not the shapes that dominate the gap). ShoreLine: do not import (v1.0, no docs/ratings,
Asset Store EULA blocks pushing it to the public GitHub branch); borrow its water-contact idea natively. Material Maker: skip.
**Next small test after round 2:** analytic water-contact at Benny's waterline (absorption + contact foam line in the wake
section of `RainbowRiver.hlsl`), judged on splash/benny crops + `tools/screen05-measure.ps1` + steer/jump; keep only if closer.

**UPDATE 2026-11-23 22:45 UTC (likeness measuring + round-3 plan):** new read-only tool `tools/screen05-measure.ps1 <still.png> ...`
prints two calibrated scores vs the approved image (100 = same picture), overall and per crop area: **look** (at a glance:
coarse shapes/colour layout within ±48–64 px + colour distribution) and **exact** (strict layout within ±16 px). `-Calibrate`:
the approved image shifted 8–48 px or 15 % brighter scores look ≈ 90–91, mirrored 65, upside down 37 → use look ≥ 90 as the
measured meaning of the user's 90–95 % target, always with the side-by-side. Scores: round-2 BASELINE look 51.2 / exact 32.3;
`bubbles_t2` (17:34 local) look 52.3 / exact 32.6. Round 2: splash ✔ and foam ✔ finished (reports in the run journal),
bubbles running, then integration + 2 critics. **Round 3 plan (biggest differences first):** (1) camera framing + tunnel
cross-section/depth: walls must rise right behind narrow foam rims (Unity floor too wide, walls at x = ±6.25), many tightly
spaced concentric rings into a small bright vanishing point, big copper D-tray paddles, wall slot rows; (2) river course
composition (narrower open river, stronger S-curves at mid distance, foam rims following, coins on the curve); (3) Benny +
splash + HUD polish (flat-cut bottom at the waterline, suds too high, HUD bar colours). Add the measure to the cycle tool
after round 2 (not while its agents run cycles).

**UPDATE 2026-11-23 21:47 UTC (new Claude account, round 2 RESUMED):** the previous account hit its 5-hour limit at 21:21 UTC
while the round-2 splash + foam agents were working (checkpoint `759d746`). The new account re-verified everything (Unity
6000.3.29f1 + Unity Personal active, Editor open, `unity status` ready on port 7800, all packages in `Library/PackageCache`,
GitHub in sync + push dry-run OK, exactly one autosave task) and recompiled (0 errors). Note: the Claude Code sessions are
opened in `C:\Users\josia\.unity` (the user calls it their workspace; it only holds Unity's MCP relay + Claude settings); the
project itself is here in `C:\RainbowUnity`. The optional "Unity" Claude plugin is not added to the new account (not needed).
Round 2 relaunched as Workflow run `wf_14866b3f-a9e` with `args.skip = ["water","scenery"]` and `args.notes` (new: per-area
text appended to the brief) telling splash/foam what their interrupted attempt left: splash = new `RainbowSplash.shader`,
rewritten `SplashWake.cs`, first result `work/20261123_162048_splash_t1_*`; foam = new `RainbowFoamBank.hlsl` + rewritten
`FoamBank.cs` (sphere impostors), never tested. If interrupted AGAIN: look at the run's `journal.jsonl`
(`%USERPROFILE%\.claude\projects\C--Users-josia--unity\394c2944-483b-4b91-b420-f0503d3c2477\subagents\workflows\wf_14866b3f-a9e`)
to see which areas returned a result, add those to `skip`, and relaunch
`staging/shared/round2-fixes.workflow.js` with `notes` describing the unfinished areas' newest files and work images.

**UPDATE 2026-11-23 20:30 UTC (round 2 started):** the tuned wall / gold / Benny-fur / bubble values are now IN the builders
(EnvironmentBuilder.SetupWall/SetupGold, BennyRigBuilder.BennyMaterial, WaterBuilder.BuildBubbles, camera depth in
GameplayBuilder) — verified: a full rebuild leaves all 141 material values identical (commit `c1a3217`, pushed).
New test tool: `tools/screen05-cycle.ps1 -Tag <name> -Areas water|foam|bubbles|splash|light|all [-Series] [-NoRebuild]`
(recompile → rebuild → Play → hold at s = 14 → 864×1536 still + side-by-side + area crops; one cycle at a time via a lock;
work images in `UnityProject/Recordings/Screen05/work`, git-ignored). `AgentScripts/screen05_hold_approved.cs` is now
deterministic (Benny exactly s = 14.00, camera (-0.06, 3.32, 7.07) every run). Baseline: `work/20261123_152447_BASELINE*`.
Round-2 fix workflow running (water → splash | scenery → foam → bubbles, then final capture + recording + 2 critics).
If it was interrupted: check `git log`, rerun the cycle with `-Areas all -Series`, compare with the baseline, continue.

**UPDATE 2026-11-23 19:20 UTC:** all 4 specialists are DONE and integrated; the full scene builds and plays
(`Assets/Rainbow/Scenes/Screen05.unity`, Rainbow → Build Screen 05 Scene). ProBuilder 6.1.4 + Animation Rigging 1.4.1 added.
Round 1 evidence: `evidence/screen05/round1_*.jpg`. Five biggest differences found: (1) foam banks too thin/flat,
(2) bubbles invisible (they spawn 11–30 u ahead over the white foam), (3) water = many thin outlined stripes instead of
broad satin pink bands, (4) walls: holes too sparse + white "spoke" streaks, (5) Benny's white splash wake missing.
Walls/gold/Benny fur were tuned live in `UnityProject/AgentScripts/screen05_tune_look.cs` (materials saved; SSAO turned off)
— these values must still be copied into `EnvironmentBuilder.SetupWall/SetupGold` or a rebuild resets them. The round-2 fix
workflow (river+wake, foam, bubbles) was stopped by the user mid-way: check `git diff` in Assets/Rainbow/Water before rebuilding.
Useful scripts: `AgentScripts/screen05_hold_approved.cs` (pause at the approved view), `screen05_series_approved.cs`
(before/at/after stills), `screen05_framedebug.cs` (Frame Debugger list), `screen05_record_gameplay.cs` (run reset first).
Original plan below (steps 1–3 are done):
**Next unfinished task: finish the short playable Screen 05 test (original approved reference only).**
1. Open the Unity Editor if it is closed: `unity open C:\RainbowUnity\UnityProject --until-ready`, then check
   `unity status --project-path C:\RainbowUnity\UnityProject` (state must be ready).
2. Finish the 3 unfinished specialists from their saved briefs, KEEPING the files they already wrote
   (a staging folder without README.md is unfinished). At most 2 at a time on this laptop:
   * Agent 2 environment (purple washer tunnel, gold rings, copper-gold paddles, far glow): 16 files in `staging/agent2-environment`
   * Agent 3 water, foam, bubbles, lighting: 12 files in `staging/agent3-water-vfx`
   * Agent 4 Benny, swim/steer/jump, camera, coins, HUD: 19 files in `staging/agent4-benny-gameplay`
   Prompt: "Read COMMON and AGENTn in C:\RainbowUnity\staging\shared\specialists.workflow.js and follow them. Continue from
   the files already in your staging folder; do not rewrite finished files; write README.md when done."
3. Coordinator only: copy the finished outputs into `UnityProject/Assets/Rainbow`, run menu Rainbow → Build Screen 05 Scene
   (`UnityProject/AgentScripts/screen05_build_scene.cs`), fix compile errors.
4. Play-test about 10 s, then evidence with the test tools: approved vs Unity Game view at 864×1536 side by side, a continuous
   gameplay recording, a moving-view series, and an explicit list of remaining differences (no likeness % without measurements).
5. Update this handoff (keep these NEXT-TASK markers). Autosave pushes to GitHub every 5 minutes.


## ✅ CURRENT STATE (2026-11-23 21:55 UTC) — verified by the new Claude account
**Newest (2026-11-24 01:45 UTC):** see the first two NEXT-TASK entries. Transfer verified. Round 3's Shape stage was
interrupted; its edits compile but are untested. Nothing is running, and Unity was closed for a laptop restart.
**Newer (23:30 UTC, third account):** round 2 is COMPLETE (water, lighting/scenery, splash, foam, bubbles); round 3
(composition-first) is RUNNING as run `wf_9320b9e1-c74` (see the first NEXT-TASK entry). Newest honest still:
`evidence/screen05/ROUND3_BASELINE.png` (visual 52.4 / layout 32.7). The bullets below are older where they disagree.
This also completes the user's 16:13 local request "SAVE EVERYTHING TO MY GITHUB NOW" (the old account made and pushed the
checkpoint commit but hit its limit before updating this file and confirming).
* **Git / GitHub**: branch `unity/screen05-dev`. The user's requested checkpoint = `759d746` (16:21 local, "Screen 05 round 2 in
  progress"); newer autosave commits follow it. Every check today: local HEAD = GitHub (`git ls-remote`), push dry-run OK.
  Git LFS: 2 objects (`benny31.glb` 5.2 MB, stored once and used twice; round-1 gameplay mp4 7.2 MB) confirmed STORED on GitHub
  via the LFS batch API. Library/Temp/Logs/UserSettings and `Recordings/Screen05/work` are git-ignored (regenerable).
* **Five-minute autosave = Windows Task Scheduler task "Rainbow Unity Autosave"** (the only one; no Claude scheduled tasks or
  shell loops). Every 5 min, hidden, runs as the user while signed in: `tools/autosave.ps1` (one pass: commit + push only when
  something changed or a push is pending; never force-push/merge/reset/delete; leaves out likely secrets and >50 MB non-LFS
  files). Log `.git/autosave.log`, last pass `.git/autosave.status`. Needs no Claude session, so it survives account switches
  and restarts. Repair (safe to re-run, never duplicates): `tools/setup-resume-system.ps1`.
* **Unity**: 6000.3.29f1 + Unity Personal (and Asset Store) licenses active; Editor OPEN with this project since 13:23 local;
  `unity status` = ready (port 7800); CLI 1.0.1; the Pipeline 1.0.1 bridge answers commands. Packages (all already in
  `Library/PackageCache`, no reinstall): URP 17.3.0, Input System 1.20.1, Cinemachine 3.1.7, Pipeline 1.0.1, glTFast 6.21.0,
  Splines 2.9.2, ProBuilder 6.1.4, Animation Rigging 1.4.1, Timeline 1.8.13, Test Framework 1.6.0, uGUI 2.0.0. Recompile at
  21:45 UTC: 0 errors.
* **Screen 05**: `Assets/Rainbow/Scenes/Screen05.unity` is built from code (menu Rainbow → Build Screen 05 Scene) and plays
  (swim, steer, jump, coins, HUD). Target: the approved `references/05_flow_into_the_current.png` only (binding rules below).
* **Specialists**: all 4 original specialists FINISHED (README.md in each staging folder) and integrated. Round 2 fix workflow
  (`staging/shared/round2-fixes.workflow.js`): water bands ✔ and lighting/scenery ✔ (`evidence/screen05/round2_progress/NOTES.md`);
  splash/water contact and foam banks were interrupted at 21:21 UTC and are RUNNING again (run `wf_14866b3f-a9e`, 21:44 UTC);
  bubbles, the final integration (full cycle + 12 s gameplay recording) and two reviewers are queued after them.
* **Remaining visual differences** vs the approved image (newest still: `work/20261123_162048_splash_t1_sbs.jpg`):
  1. Foam banks: a flat snowy strip on the far banks only, nothing in the lower half (approved: thick pearly clustered soap foam
     along both banks down to the near corners) — foam agent running.
  2. Bubbles: none visible (approved: about 25–35 iridescent bubbles) — bubbles agent queued.
  3. Benny's splash: he now sits in the water with a collar and two spray fans, but the fans are straight white streaks and a hard
     ring shows under him (approved: bubbly foam spray, droplets, soft V wake) — splash agent running.
  4. The open river reads ~1.5× too wide at mid/far distance (Three.js `channel05` narrowing + far foam shelves not ported).
  5. Scenery: deep walls lack the concentric dark slot rows; paddles smaller, higher and tilted (approved: big D-trays with a thick
     polished rim near the horizon); rings less polished; far glow merges into one over-saturated orange disc.
  6. Camera: about 0.5 m too far back (near ring ~4 % small), vanishing point ~9 px right, Benny ~30–40 px lower than approved.
* **Resume helpers** (read-only): `CLAUDE.md`; `.claude/settings.json` SessionStart hook → `tools/session-start.ps1`;
  `/resume-rainbow` skill; desktop shortcut "Resume Rainbow"; a short pointer in `%USERPROFILE%\.claude\CLAUDE.md`.
* Laptop: C: 8.5 GB free, RAM ~1.6 GB free. Errors today: two 5-hour usage limits (17:39 and 21:21 UTC); nothing was lost.

## Switching Claude accounts (what the user does)
1. Wait until the newest autosave is pushed (or ask Claude "save now"). Everything is in `C:\RainbowUnity` and on GitHub.
2. In the Claude app: click your name/initials at the bottom left → **Log out** → sign in with the other account.
3. Click **Code** → start a new session → choose the folder **`C:\RainbowUnity`** → type **Resume Rainbow** → Enter.
   (The user's sessions so far were opened in `C:\Users\josia\.unity`; that works too — Claude then reads this file and
   `CLAUDE.md` by hand, because the automatic status check only runs for sessions opened in `C:\RainbowUnity`.)
   (If the "Unity" plugin is missing in that account, it is optional: + → Add plugins → search "Unity" → Install.)

---
# History (older notes; the sections above win where they disagree)

## Earlier state (2026-11-23 18:25 UTC, superseded)
* Autosave was moved from a loop in a Claude background shell (it died with that session; last loop autosave 12:46 local,
  `42af05a`) to the Windows task; its first run 13:19 committed `4fc8139` and pushed it.
* The Editor was closed at that time; Agent 1 (setup runbook + 15 test-tool files) was finished and its tools compiled
  (`610a16e`); Agents 2, 3, 4 had stopped at 17:40 UTC at the previous account's 5-hour limit (files kept, autosaves up to
  `42af05a`) and were finished later; the Screen 05 scene was not built yet then.

## CURRENT STATE (2026-11-23 ~14:00 UTC) — Unity is installed, licensed and connected
* Windows restarted 2026-11-23 07:54 local → C: free went 8.2 → 16.6 GB.
* **Unity 6000.3.29f1 installed** (official installer, silent, user approved the Windows prompt) at
  `C:\Program Files\Unity\Hub\Editor\6000.3.29f1`; default Editor in the Unity CLI. Lowest free space during install: 2.2 GB.
* User signed in (`unity auth login`, browser) and **Unity Personal is active** (`unity license activate --personal`).
  The user accepted the Unity Editor Software Terms (recorded with `unity terms accept 6000.3.29f1 --yes` at their request).
* **Project created**: `C:\RainbowUnity\UnityProject` (URP blank template, `--no-cloud`): URP 17.3.0, Input System 1.20.1,
  Cinemachine 3.1.7, Pipeline 1.0.1 (CLI ↔ Editor bridge), glTFast 6.21.0, Splines 2.9.2. Removed template extras
  (Visual Scripting, Collab, Multiplayer Center, AI Navigation, Rider) to speed up compiles on this laptop.
* **Editor ↔ CLI connection verified**: `unity status` = ready; `unity command script eval --file <cs>` runs C# in the live Editor
  (PowerShell 5.1 mangles inline quotes → always pass code with `--file`). Pipeline asset in use: `PC_RPAsset`, GPU "Intel(R) Graphics".
* Coordinator files in the project: `Assets/Rainbow/Shared/RiverPath.cs`, `Assets/Rainbow/Editor/Screen05SceneBuilder.cs`
  (menu **Rainbow → Build Screen 05 Scene**, finds the specialists' builders by reflection).
* Specialists were launched as parallel background agents (the Workflow runner only allows 2 at a time on this 4-core laptop).
  Briefs: constants COMMON + AGENT1..4 in `staging/shared/specialists.workflow.js`; outputs land in `staging/agent1..4`
  (each writes a README.md when done).
* Evidence tool: `tools/make-side-by-side.ps1` (APPROVED vs UNITY image, no percentage claims).
* **Git**: portable Git 2.56.1 + git-lfs 3.8.1 at `C:\Users\josia\PortableGit` (user approved; SHA-256 verified). Local repo in
  `C:\RainbowUnity`, branch **`unity/screen05-dev`** (orphan, nothing from the 22 GB repo downloaded), remote `origin` =
  the Rainbow repo. Neutral commit author "Rainbow Unity" (no personal email). GitHub sign-in stored by Git Credential Manager.

## User's binding rules
* Target = the ORIGINAL approved Screen 05 **"Flow Into the Current"**: `references/05_flow_into_the_current.png`
  (864×1536, SHA-256 `d3f339d49199598e03541c15a3ec6f7fa6342f40de650361c44ab4301bfb44dd`, matches `REFERENCE_ORDER.md`).
  **Confirmed by the user on 2026-11-23.** Never use simplified / redesigned candidate images. No creative redesign.
* Must stay: Benny's original look (round pink fluffy body, purple-and-white striped knitted beanie, purple pompom, yellow star),
  purple/lavender metallic washer tunnel, rounded polished gold rings, copper-gold paddles, cyan water with pink currents,
  white foam, bubbles, gold coin trail, portrait camera behind Benny. Real playable 3D (swim, steer, jump, collect coins).
* Keep the original Three.js game and every existing branch untouched. Separate Unity project + separate branch.
* Free tools only (Unity Personal, existing assets). No purchases, paid services or GPU rental without asking.
* Ask before deleting files. Never commit passwords, tokens or Unity license files.
* Likeness target 90–95 % — only claim a number with real measurements + visual evidence.
* **User, 2026-11-23 17:15 local:** keep targeting ~90–95 % likeness to the approved image, matching shapes, proportions,
  composition, materials and richness (river curves, tunnel depth, gold ring spacing, metallic reflections, water, foam,
  bubbles, HUD, Benny's natural swimming) — not just colours. Scenery must stay consistent while Benny swims, steers and
  jumps, and he must look naturally supported by the water. Save successful changes permanently (code/builders, pushed),
  compare the real Game view after each major improvement, fix the biggest visible differences first, conserve credits.
  **Do not start Screen 06 until the user approves Screen 05.**

## Machine (user's laptop)
* HP 14", Windows 11 Home, Intel N150, 8 GB RAM, Intel integrated GPU, **one drive C:** (~118 GB).
* Unity CLI **1.0.1**: `C:\Users\josia\AppData\Local\Unity\bin\unity.exe`. Unity Hub app: **not installed**.
* Android Build Support: **deferred** (needs ~7–10 GB more disk).

## Files on the laptop
* `C:\Users\josia\claude yes\Rainbow_Screen05_Source\` — 111 files (30 MB) downloaded from GitHub branch
  `ccr-6deca498-03lhkc`: reference + hi-res reference, Three.js source (`src/`), models `benny31.glb`, `benny.glb`, `lids05.glb`
  (all three SHA-256-verified identical to the GitHub LFS objects on 2026-11-23), textures (`tunnel05`, `water05`, `benny05`,
  `benny31`, `paint`), docs.
* `C:\RainbowUnity\` — the Unity work folder and git working tree of the Unity branch:
  * `references/05_flow_into_the_current.png` — verified copy of the approved reference.
  * `staging/shared/CONTRACT.md` + `staging/shared/Assets/Rainbow/Shared/RiverPath.cs` — integration contract and the shared
    course API (port of `course.ts` S05 / `meander05`).
  * `staging/shared/specialists.workflow.js` — the saved briefs for the 4 specialists.
  * `staging/agent1-unity-setup`, `agent2-environment`, `agent3-water-vfx`, `agent4-benny-gameplay` — specialist outputs.
  * `UnityProject/` — the Unity URP project.

## GitHub
* Repo `https://github.com/josiahscalia5-dev/rainbow-` (public, ~22 GB — never clone it whole on this laptop).
* Source branch `ccr-6deca498-03lhkc` @ `856ef9d` (autosave 2026-11-23 11:03 UTC); the user's checkpoint `544bc51` is an
  ancestor — nothing lost. `CLAUDE.md` and `docs/briefs/2026-11-23-r48/UNITY_EVAL_R48.md` exist there.
* Unity branch `unity/screen05-dev` (orphan) pushed from `C:\RainbowUnity`; Git LFS for `*.glb *.fbx *.psd *.exr *.mp4 *.apk` etc.
  like the repo's `.gitattributes`; the approved reference PNG stays in plain git (byte-identical).
