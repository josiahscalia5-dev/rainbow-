# Subagent agent-a27bc2af86f8cdd32 — session 8bb9eeab-1f60-5900-884e-9151051fb861

### 🧑 User — 2026-11-19T02:28:24.982Z

You are the Rainbow project's `water-fx-specialist`, acting as the Screen 07 "Dive the Washer Tube" visual worker ("s07"), round 18, VISUALS ONLY. The previous session's environment closed at ~21:11 UTC 2026-11-18 while you were mid-step; you continue exactly where you stopped.

WHERE YOU WORK
* Git worktree `/home/user/wt/s07`, branch `claude/rainbow-s07-match-c18` (already pushed; = the newest `-c17` tip `8651edf9` + your unfinished account-17 edits restored UNCOMMITTED: `src/world/match07.ts` +53, `src/vfx/foam.ts` +26, `src/vfx/waterRibbon.ts` +4; BEFORE / NEW / try_ramp5 / try_ramp8 t95 stills in `qa/match/07/r17/step3_foamb/`, step-4 `motion.json` in `qa/match/07/r17/step4_nearf/NEW/`). Dev-server / tool port 5277.
* Commit and `git push -u origin claude/rainbow-s07-match-c18` after every step and at each safe milestone. Push ONLY that branch; never force-push / rebase / merge; never write any `-c17` or older branch. Never touch other worktrees under `/home/user/wt/`. `/home/user/rainbow-` is the lead checkout: read-only for you.

READ FIRST, in this order (absolute paths, the lead checkout):
1. `/home/user/rainbow-/docs/briefs/2026-11-19-r18/RESUME_R18.md` — common part + section "s07": kept set `K&m07foam=1&m07coinsz=1&m07nearw=1`. Your unfinished edit is step 3 `&m07foamb=1` (the white lather walls that restart further down the drop with a visible cut; ramp tuning was being tried) plus the start of step 4 `&m07nearf`. Lead note: at hard left a wide flat pale lilac-white foam sheet fills the lower-left quarter (painted: separate puffy foam clouds); near Benny the magenta bands are narrow straight ribbons (painted: thick, big S-curve sweeps).
2. Your launch brief `/home/user/rainbow-/docs/briefs/2026-11-18-r15/S07_LAUNCH.md` — read every `-c15` as `-c18` and the log folder as `qa/match/07/r18/`, but keep reading `qa/match/07/r17/PROGRESS.md`, `r16/` and r15 for what was already done. Deterministic start check: `node scripts/capture.mjs 07`.
3. The binding rules it names (`/home/user/rainbow-/docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md`, `.../2026-11-18-r15/USER_ORDER_R15_VISUAL.md`, `.../r10/RULES_R10.md`, `.../r8/COMMON_RULES.md`).
Then `git diff` + `git status` in your worktree, confirm the unfinished edits, finish step 3 (or discard it explicitly with a note), prove it, commit + push; `foam.ts` / `waterRibbon.ts` are shared code — every change there must be behind your switch and leave every other screen byte-identical.

RULES: every change is a URL switch, default build unchanged; approved start view unchanged (0 px; Pixelmatch on game screenshots: `node /home/user/tools-pixelmatch/pixeldiff.mjs A.png B.png diff.png 0.1 180 1536`); never change Benny, coins (91 / 2,240, gameplay 8/8), physics, input, HUD, camera framing, the 07→08 drop or other screens; `references/*.png` unchanged; no paid jobs; do not reinstall tools (never `playwright install`); never commit or print secrets. Five workers share 4 CPU cores: render only the shots you need, clips at half size.

PROOF + REPORTING: separate full-size APPROVED / BEFORE / NEW pictures from the real game (no collages), plain visual words, verdict GOOD IMPROVEMENT / NOT AN IMPROVEMENT / NOT YET PROVEN. Log in `qa/match/07/r18/PROGRESS.md`. After each finished step: commit + push, then SendMessage to "main" with: step + URL switch, commit SHA, verdict, absolute folder of the NEW pictures, and the single most visible remaining difference. Keep it short, then continue with the next task without waiting. If blocked, tell "main" and continue with something else.

### 🤖 Claude — 2026-11-19T02:28:26.727Z

> 🔧 **Bash** `{"command": "cd /home/user/wt/s07 && git status --short | head -50 && git log --oneline -5 && git branch --show-current && git diff --stat", "description": "Show worktree status, recent log and diff stats"}`

### 🧑 User — 2026-11-19T02:28:26.933Z

> ↩︎ result: M src/vfx/foam.ts
>  M src/vfx/waterRibbon.ts
>  M src/world/match07.ts
> ?? node_modules
> ?? qa/match/07/r17/step3_foamb/
> ?? qa/match/07/r17/step4_nearf/
> 8651edf Screen 07 r17 step 2: real-gameplay swim clip for &m07nearw=1 (half size, straight / left / right)
> claude/rainbow-s07-match-c18
>  src/vfx/foam.ts        | 26 +++++++++++++++++++++----
>  src/vfx/waterRibbon.ts |  4 +++-
>  src/world/match07.ts   | 53 +++++++++++++++++++++++++++++++++++++++++++++++++-
>  3 files changed, 77 insertions(+), 6 deletions(-)

### 🤖 Claude — 2026-11-19T02:28:27.436Z

> 🔧 **Bash** `{"command": "sed -n '1,400p' /home/user/rainbow-/docs/briefs/2026-11-19-r18/RESUME_R18.md", "description": "Read the r18 resume brief"}`

### 🧑 User — 2026-11-19T02:28:27.463Z

> ↩︎ result: # Round 18 resume notes — where each round-17 worker stopped (the account-17 environment closed after its 21:11 UTC save)
> 
> Every worker below was cut off mid-step at ~21:11 UTC 2026-11-18. Its committed work is on its `-c17` tip; its UNFINISHED edits
> (tracked diff + new files) were captured by the 21:11 autosave in `backups/wip/<branch>-c17/` on the r17 lead
> `ccr-bbe2b27e-oxfh1w` @ `d22ec46` and are applied, UNCOMMITTED, in the worker's `-c18` worktree exactly as the worker left them
> (`setup_worker.sh` in this folder). Large renders listed under `untracked_skipped` in each `INFO.json` were not saved: re-render.
> 
> Common to all: user order 2026-11-18 ~18:55 UTC (`docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md`) — VISUALS ONLY, biggest
> visible difference first, APPROVED / BEFORE / NEW pictures from the real game, plain visual words, minimal checks (approved start
> view unchanged, coins unchanged: 91 coins / 2,240). User order ~21:02 UTC: **Screen 08 PAUSED** (no approval decision; work on the
> other screens). Your launch brief is the r15 one named below; read every `-c15` as `-c18` and every `r15` log folder as `r18`
> (`qa/match/<NN>/r18/`), but keep reading `r15/`, `r16/`, `r17/` f …[+4489 chars]

### 🤖 Claude — 2026-11-19T02:28:28.809Z

> 🔧 **Bash** `{"command": "sed -n '1,300p' /home/user/rainbow-/docs/briefs/2026-11-18-r15/S07_LAUNCH.md", "description": "Read the s07 launch brief"}`

### 🧑 User — 2026-11-19T02:28:28.834Z

> ↩︎ result: # Round 15 (account 15) — Screen 07 specialist launch prompt (water-fx-specialist)
> 
> You are the Rainbow project's `water-fx-specialist`, working ONLY on playable Screen 07 "Dive the Washer Tube", VISUALS ONLY.
> (07 last ran in round 8, account 8; it waited for a free slot since. The user asked on 2026-11-18 ~18:45 UTC to work on the other screens too.)
> 
> ## Where you work
> * Git worktree `/home/user/wt/s07` on branch `claude/rainbow-s07-match-c15` (created from `claude/rainbow-s07-match-c11` = `-c9` =
>   `-c8` @ `dbc7678c`, the newest 07 tip). Sparse checkout: `qa/pilot05`, `qa/worldlabs`, `qa/imageblaster`, `builds/`, `backups/` are
>   left out to save disk (do not need them; never `git sparse-checkout disable`). `node_modules` is a symlink to the lead checkout.
>   `tools/lead_r13/` (swim clip tool) was copied in untracked — commit it with your first step.
> * Commit and `git push -u origin claude/rainbow-s07-match-c15` after every step (kept or rejected). Push ONLY that branch. Never
>   force-push, rebase, reset, merge, or write any other branch. Disk is limited: delete your own temporary captures you do not keep.
> * Five other workers run in this container (04 ×2, 05, 06, 08) on 4 CPU cor …[+3632 chars]

### 🤖 Claude — 2026-11-19T02:28:29.811Z

> 🔧 **Bash** `{"command": "cd /home/user/wt/s07 && cat qa/match/07/r17/PROGRESS.md; ls qa/match/07/r17/ qa/match/07/r17/step3_foamb qa/match/07/r17/step4_nearf -R | head -80", "description": "Read r17 progress log and list step folders"}`

### 🧑 User — 2026-11-19T02:28:29.877Z

> ↩︎ result: # Screen 07 · round 17 (account 17) — progress log
> 
> Branch `claude/rainbow-s07-match-c17` (worktree `/home/user/wt/s07`), start = `-c16` tip `669420af` + the round-16 worker's unfinished
> step-2 edit (`src/world/match07.ts` +128, `near07.json`, `near_bank.png`, `near_foam.png`, `tools/match07/near_tiles_r16.py`), restored
> uncommitted. Briefs: `docs/briefs/2026-11-18-r17/RESUME_R17.md` (s07) + `docs/briefs/2026-11-18-r15/S07_LAUNCH.md`. VISUALS ONLY.
> What was done before: `qa/match/07/r16/PROGRESS.md` (step 1 kept, step 2 design + tuning). Nothing is approved until the user says so.
> 
> Kept set K (round 7, M3): `match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1&m07tube=1&m07ring=1` (`qa/match/07/r16/K.txt`).
> Kept after r16 step 1: `K&m07foam=1&m07coinsz=1`.
> APPROVED picture: `qa/match/07/r16/APPROVED_07.png` (copy of `references/07_dive_the_washer_tube.png`).
> Shots: `tools/match07/audit_r16.mjs` (real game, 864×1536, real-time — not pixel-deterministic, so the start-view check uses
> `scripts/capture.mjs 07`, which freezes the clock).
> 
> ## Step 2 — `&m07nearw=1`: the painted NEAR river on the level stretch — finished 20:45–21:10 UTC
> The unfinished edit WAS this step (design an …[+3733 chars]

### 🤖 Claude — 2026-11-19T02:28:31.103Z

> 🔧 **Bash** `{"command": "cd /home/user/wt/s07 && git diff", "description": "Show the unfinished diff"}`

### 🧑 User — 2026-11-19T02:28:31.135Z

> ↩︎ result: diff --git a/src/vfx/foam.ts b/src/vfx/foam.ts
> index fe11b33..7821e44 100644
> --- a/src/vfx/foam.ts
> +++ b/src/vfx/foam.ts
> @@ -556,12 +556,29 @@ const squashBerm = (h: number, k: number) => (k < 1 && h > EDGE_LIFT ? EDGE_LIFT
>  /** r8 '?match07=1&m07foam=1': arc range of the 07 plunge where the berm + its puffs step aside (null = off) */
>  function hide07(course: Course): [number, number] | null {
>    if (!flag05('match07') || !flag05('m07foam')) return null;
> -  return [course.marks['07_plunge_top'] + 9, course.marks['07_plunge_bottom'] - 12];
> +  // r17 '&m07foamb=1': the walls stay away to near the end of 07 (they no longer start again partway down the drop with a
> +  // cut); over the last 5 u of 07 the bank grows back out of the water (ramp07), full height at the 08 start, so 08 keeps
> +  // its berm
> +  const r = end07(course);
> +  return [course.marks['07_plunge_top'] + 9, r !== null ? r - 5 : course.marks['07_plunge_bottom'] - 12];
> +}
> +/** r17 '&m07foamb=1': arc length of the 08 start (end of 07) or null = off */
> +function end07(course: Course): number | null {
> +  if (!flag05('match07') || !flag05('m07foam') || !flag05('m07foamb')) return null;
> +  return course.marks['08'] ?? course.m …[+9164 chars]

### 🤖 Claude — 2026-11-19T02:28:32.104Z

> 🔧 **Bash** `{"command": "cd /home/user/wt/s07 && for f in qa/match/07/r17/step3_foamb/*/motion.json qa/match/07/r17/step4_nearf/NEW/motion.json; do echo \"== $f\"; head -c 1500 $f; echo; done", "description": "Show motion.json files for step 3 and 4"}`

### 🧑 User — 2026-11-19T02:28:32.135Z

> ↩︎ result: == qa/match/07/r17/step3_foamb/BEFORE/motion.json
> {
>  "screen": "07",
>  "query": "match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1&m07tube=1&m07ring=1&m07foam=1&m07coinsz=1&m07nearw=1",
>  "shots": [
>   {
>    "name": "t50_through_screen",
>    "dist": "t0.5",
>    "steer": null,
>    "mode": "ride",
>    "stage": "07",
>    "s": 332.686,
>    "lat": 0,
>    "coins": 2060,
>    "hearts": 5,
>    "paused": false,
>    "bennyY": -66.473,
>    "bennyVisible": true,
>    "cam": [
>     12.91,
>     -57.11,
>     -252.18
>    ],
>    "frames": 293,
>    "s0": 273.056,
>    "s1": 390.1617102628636,
>    "target": 331.6088551314318
>   },
>   {
>    "name": "t66_through_screen",
>    "dist": "t0.66",
>    "steer": null,
>    "mode": "ride",
>    "stage": "07",
>    "s": 351.063,
>    "lat": 0,
>    "coins": 2090,
>    "hearts": 5,
>    "paused": false,
>    "bennyY": -83.754,
>    "bennyVisible": true,
>    "cam": [
>     12.91,
>     -74.78,
>     -259.41
>    ],
>    "frames": 387,
>    "s0": 273.056,
>    "s1": 390.1617102628636,
>    "target": 350.34576877348997
>   },
>   {
>    "name": "t80_through_screen",
>    "dist": "t0.8",
>    "steer": null,
>    "mode": "ride",
>    "stage": "07",
>    "s": 367.465,
>    "lat": 0,
>    "coins": 2120,
>    "hearts": 5,
>    "paused": false,
>    " …[+6554 chars]

### 🤖 Claude — 2026-11-19T02:28:36.123Z

> 🔧 **Bash** `{"command": "wc -l /home/user/rainbow-/docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md /home/user/rainbow-/docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md /home/user/rainbow-/docs/briefs/2026-11-18-r10/RULES_R10.md /home/user/rainbow-/docs/briefs/2026-11-18-r8/COMMON_RULES.md; cat /home/user/rainbow-/docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md; cat /home/user/rainbow-/docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md", "description": "Read the binding user visual rules"}`

### 🧑 User — 2026-11-19T02:28:36.161Z

> ↩︎ result: 55 /home/user/rainbow-/docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md
>    12 /home/user/rainbow-/docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md
>    32 /home/user/rainbow-/docs/briefs/2026-11-18-r10/RULES_R10.md
>    44 /home/user/rainbow-/docs/briefs/2026-11-18-r8/COMMON_RULES.md
>   143 total
> # User order — 2026-11-18 ~18:55 UTC (account 15) — BINDING for every worker and every future account
> 
> User's words: "To make them exactly or very close to my approved screens — work on the visual part … not all technical problems. Make
> sure it looks like the visual part, like scenery and all the stuff that looks like my approved screens. When a pink character goes
> through my screens, it looks like it would have for my approved screens."
> 
> Meaning (adds to `docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md`, never replaces it):
> * Work ONLY on what can be SEEN: scenery, rings, walls, water, foam, bubbles, paddles / cups / props, colours, lighting — on all five
>   playable screens 04–08 — so that while Benny (the pink character) swims through, every view looks like the approved picture.
> * No technical clean-up, refactors, metrics or tool projects unless a visual step needs them. Checks stay m …[+5393 chars]

### 🤖 Claude — 2026-11-19T02:28:37.534Z

> 🔧 **Bash** `{"command": "cat /home/user/rainbow-/docs/briefs/2026-11-18-r10/RULES_R10.md /home/user/rainbow-/docs/briefs/2026-11-18-r8/COMMON_RULES.md", "description": "Read r10 and r8 rule files"}`

### 🧑 User — 2026-11-19T02:28:37.572Z

> ↩︎ result: # Round 10 (account 10) — rules added to `docs/briefs/2026-11-18-r8/COMMON_RULES.md` (binding; read "-c8"/"r8" as "-c10"/"r10")
> 
> User, 2026-11-18 ~10:30 UTC (verbatim core):
> "PLEASE STOP TREATING MATCHING COLORS AS MATCHING MY APPROVED SCREENS. A screen can have 90% similar colors and STILL look
> completely different from my approved image. The exact visual design matters: the scenery, tunnel structures, water
> formations, shapes, proportions, backgrounds, lighting, materials, and Benny." "Use my original approved image as the
> visual authority. Where it doesn't show the rest of the level, build a FAITHFUL CONTINUATION of that design rather than
> inventing a different environment." "I want to see actual visual improvements, not just measurements."
> "DO NOT REMOVE SUCCESSFUL EXISTING WORK JUST BECAUSE IT USES ARTWORK PROJECTION OR AN IMAGE BACKDROP." "I do not want
> flat-image tricks that visibly break or distort when Benny moves." "No redesigns. No paid jobs without approval."
> 
> ## What this changes for every specialist
> 1. **Judge by eye against the approved picture, not by numbers.** PALETTE / LAYOUT / within-20-levels numbers may be logged,
>    but never as evidence that a frame "looks l …[+6158 chars]

### 🤖 Claude — 2026-11-19T02:28:38.319Z

Now let me look at the approved picture and the step-3 stills.

### 🤖 Claude — 2026-11-19T02:28:38.779Z

> 🔧 **Read** `{"file_path": "/home/user/wt/s07/qa/match/07/r16/APPROVED_07.png"}`

### 🧑 User — 2026-11-19T02:28:38.802Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-19T02:28:39.327Z

> 🔧 **Read** `{"file_path": "/home/user/wt/s07/qa/match/07/r17/step3_foamb/BEFORE/t95_through_screen.png"}`

### 🧑 User — 2026-11-19T02:28:39.370Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-19T02:28:39.774Z

> 🔧 **Read** `{"file_path": "/home/user/wt/s07/qa/match/07/r17/step3_foamb/NEW/t95_through_screen.png"}`

### 🧑 User — 2026-11-19T02:28:39.852Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-19T02:28:43.710Z

> 🔧 **Read** `{"file_path": "/home/user/wt/s07/qa/match/07/r17/step3_foamb/try_ramp5/t95_through_screen.png"}`

### 🧑 User — 2026-11-19T02:28:43.767Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-19T02:28:44.221Z

> 🔧 **Read** `{"file_path": "/home/user/wt/s07/qa/match/07/r17/step3_foamb/try_ramp8/t95_through_screen.png"}`

### 🧑 User — 2026-11-19T02:28:44.284Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-19T02:28:50.846Z

> 🔧 **Bash** `{"command": "cd /home/user/wt/s07 && grep -n \"07_plunge_top\\|07_plunge_bottom\\|marks\\['08'\\]\\|marks\\[.08.\\]\" -r src | head -40; grep -n \"marks\" src/world/course.ts | head -30", "description": "Find course marks for the 07 plunge and 08 start"}`

### 🧑 User — 2026-11-19T02:28:50.890Z

> ↩︎ result: src/world/environment.ts:695:    tubeAxis: { path: perfPath, s0: s05, s1: course.marks['07_plunge_top'] },
> src/world/course.ts:302:  mark('07_plunge_top');
> src/world/course.ts:323:  mark('07_plunge_bottom');
> src/world/course.ts:639:    if (s > c.marks['07_plunge_top'] && s < c.marks['08']) minPitch = Math.min(minPitch, THREE.MathUtils.radToDeg(Math.asin(cur.tan.y)));
> src/world/course.ts:643:  const top = c.marks['07_plunge_top'];
> src/world/course.ts:644:  const bottom = c.marks['07_plunge_bottom'];
> src/world/course.ts:646:  const inlet = c.marks['08'];
> src/vfx/foam.ts:563:  return [course.marks['07_plunge_top'] + 9, r !== null ? r - 5 : course.marks['07_plunge_bottom'] - 12];
> src/vfx/foam.ts:568:  return course.marks['08'] ?? course.marks['07_plunge_bottom'] + 4;
> src/vfx/waterRibbon.ts:231:  const end = flag05('m07foamb') ? course.marks['08'] ?? course.marks['07_plunge_bottom'] + 4 : course.marks['07_plunge_bottom'] - 12;
> src/vfx/waterRibbon.ts:232:  return [course.marks['07_plunge_top'] + 9, end];
> src/vfx/waterRibbon.ts:256:  const pt = course.marks['07_plunge_top'], pb = course.marks['07_plunge_bottom'];
> src/game/cameraRig.ts:122:      const sTop = this.course.marks['07_plunge_to …[+2075 chars]

### 🤖 Claude — 2026-11-19T02:28:53.974Z

> 🔧 **Bash** `{"command": "cd /home/user/wt/s07 && grep -rn \"plunge_top\\|plunge_bottom\" qa/match/07/*.md qa/match/07/r1*/PROGRESS.md 2>/dev/null | head -20; ls qa/match/07/; ls tools/match07 tools/lead_r6 tools/lead_r13 2>/dev/null", "description": "Look up plunge mark values and tool folders"}`

### 🧑 User — 2026-11-19T02:28:54.065Z

> ↩︎ result: qa/match/07/NOTES.md:85:  `course.sample` every 0.4 u from `07_plunge_top − 4` to `07_plunge_bottom`; centre = path + up·3.10 (+ an offset that
> qa/match/07/STATUS.md:10:  (s plunge_top+9 → plunge_bottom−12, dithered 3 u at both ends) the game's tall white lather walls (berm + puffs) and the
> 07_APPROVED.png
> 07_BEFORE_current_game.png
> 07_NEW_match07.png
> FAL_PLATE_REQUEST.md
> NOTES.md
> SHARED_CHANGES.md
> STATUS.md
> cam
> geo_match07.json
> m1
> m2
> m2r4
> m3
> metrics_BEFORE_NEW.json
> r15
> r16
> r17
> r7
> r8
> rings
> tools/lead_r13:
> swim_clip.mjs
> 
> tools/lead_r6:
> motion_audit.mjs
> motion_metrics.py
> 
> tools/match07:
> audit_r15.mjs
> audit_r16.mjs
> axis07.py
> coinprobe07.mjs
> diff0px_r7.py
> fit_proxies07.py
> lock_projector07.py
> make_plate07.py
> metrics07.py
> motion07.mjs
> near_tiles_r15.py
> near_tiles_r16.py
> plunge_audit_r8.mjs
> probe07.mjs
> probe_r7.mjs
> proof0px_r7.mjs
> river_coins07.py
> river_iter07.py
> solve_cam07.py
> straighten_wall07.py
> swim_clip_half.mjs

### 🤖 Claude — 2026-11-19T02:28:55.632Z

> 🔧 **Bash** `{"command": "cd /home/user/wt/s07 && sed -n 1,60p qa/match/07/STATUS.md; cat qa/match/07/r16/PROGRESS.md | head -120", "description": "Read 07 STATUS and r16 progress"}`

### 🧑 User — 2026-11-19T02:28:55.687Z

> ↩︎ result: # Screen 07 · DIVE THE WASHER TUBE — status (round 8 / account 8, 2026-11-18 ~01:50 UTC)
> 
> Branch `claude/rainbow-s07-match-c8`, started from `3afaa7e9` (= `claude/rainbow-s07-match-c7` tip, M3 done). Nothing is
> approved until the user says so. **State: WORK IN PROGRESS, paused by the lead (user order: 07 resumes in the next free
> specialist slot).**
> 
> ## Round 8 so far (lead, two look-only switches on top of the M3 kept set K)
> K = `match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1&m07tube=1&m07ring=1`
> * `&m07foam=1` (NEW, `src/vfx/foam.ts` + `src/vfx/waterRibbon.ts`, `#ifdef HIDE07` / `HIDE07R`): down the plunge
>   (s plunge_top+9 → plunge_bottom−12, dithered 3 u at both ends) the game's tall white lather walls (berm + puffs) and the
>   lifted white outer edges of the game's water sheet step aside, so the matched tube's river tile with its painted
>   pink/cyan banks and soft blue foam shows instead. Visual verdict: **clearly closer at t50 / t66 / t80**
>   (`r8/plunge_K/` vs `r8/plunge_foam2/`); t33 unchanged (animation timing only); t95 = the 08 inlet (unchanged, 08 owns it).
> * `&m07coinsz=1` (existed since the 00:52 autosave, untested before): coins sized against the live ca …[+9831 chars]

### 🤖 Claude — 2026-11-19T02:28:58.495Z

> 🔧 **Bash** `{"command": "cd /home/user/wt/s07 && ls qa/match/07/r16/step1/NEW qa/match/07/r16/step1/BEFORE; cat tools/match07/audit_r16.mjs | head -80", "description": "List r16 step1 shots and read audit tool"}`

### 🧑 User — 2026-11-19T02:28:58.537Z

> ↩︎ result: qa/match/07/r16/step1/BEFORE:
> a00_approved_view.png
> f03_forward3u.png
> f06_forward6u.png
> f10_forward10u.png
> f20_forward20u.png
> motion.json
> s_left_hard.png
> s_left_steer.png
> s_right_hard.png
> s_right_steer.png
> t33_through_screen.png
> t50_through_screen.png
> t66_through_screen.png
> t80_through_screen.png
> t95_through_screen.png
> 
> qa/match/07/r16/step1/NEW:
> a00_approved_view.png
> f03_forward3u.png
> f06_forward6u.png
> f10_forward10u.png
> f20_forward20u.png
> motion.json
> s_left_hard.png
> s_left_steer.png
> s_right_hard.png
> s_right_steer.png
> t33_through_screen.png
> t50_through_screen.png
> t66_through_screen.png
> t80_through_screen.png
> t95_through_screen.png
> // r16: tools/match07/audit_r15.mjs + an optional 4th argument = comma list of shot names to render (CPU is shared) and the
> // page's console.info lines logged into motion.json.
> // r15 (account 15): tools/lead_r6/motion_audit.mjs + the two extra plunge shots t50 / t80 of tools/match07/plunge_audit_r8.mjs (one load).
> // Lead r6 (2026-11-17): ONE moving-gameplay audit method for every playable screen 04–08 (read-only).
> // From the screen's approved-view checkpoint it rides the real game simulation forward / steers and screenshots what
> // the live camera se …[+3127 chars]

### 🤖 Claude — 2026-11-19T02:28:59.568Z

> 🔧 **Read** `{"file_path": "/home/user/wt/s07/qa/match/07/r16/step1/NEW/t80_through_screen.png"}`

### 🧑 User — 2026-11-19T02:28:59.619Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-19T02:29:00.021Z

> 🔧 **Read** `{"file_path": "/home/user/wt/s07/qa/match/07/r16/step1/NEW/t66_through_screen.png"}`

### 🧑 User — 2026-11-19T02:29:00.094Z

> ↩︎ result: [image]

### 🤖 Claude — 2026-11-19T02:29:10.240Z

> 🔧 **Bash** `{"command": "cd /home/user/wt/s07 && grep -n \"HIDE07\\|h07\\|hide07\\|end07\\|ramp07\" src/vfx/foam.ts src/vfx/waterRibbon.ts", "description": "Find HIDE07 usage in foam and water ribbon"}`

### 🧑 User — 2026-11-19T02:29:10.279Z

> ↩︎ result: src/vfx/foam.ts:137:  #ifdef HIDE07
> src/vfx/foam.ts:138:  // r8 '?match07=1&m07foam=1': the tall white lather walls step aside down the 07 plunge so the matched tube's river
> src/vfx/foam.ts:556:/** r8 '?match07=1&m07foam=1': arc range of the 07 plunge where the berm + its puffs step aside (null = off) */
> src/vfx/foam.ts:557:function hide07(course: Course): [number, number] | null {
> src/vfx/foam.ts:558:  if (!flag05('match07') || !flag05('m07foam')) return null;
> src/vfx/foam.ts:560:  // cut); over the last 5 u of 07 the bank grows back out of the water (ramp07), full height at the 08 start, so 08 keeps
> src/vfx/foam.ts:562:  const r = end07(course);
> src/vfx/foam.ts:566:function end07(course: Course): number | null {
> src/vfx/foam.ts:567:  if (!flag05('match07') || !flag05('m07foam') || !flag05('m07foamb')) return null;
> src/vfx/foam.ts:571:function ramp07(course: Course): (s: number) => number {
> src/vfx/foam.ts:572:  const e = end07(course);
> src/vfx/foam.ts:580:  const r07 = ramp07(course);
> src/vfx/foam.ts:641:    uHide07: { value: new THREE.Vector2(...(hide07(course) ?? [0, 0])) },
> src/vfx/foam.ts:649:    defines: { ...(quality === 'low' ? { LOW_Q: 1 } : {}), ...(PROJ05 && !flag05('pr …[+1495 chars]

### 🤖 Claude — 2026-11-19T02:29:12.102Z

> 🔧 **Bash** `{"command": "cd /home/user/wt/s07 && sed -n 125,160p src/vfx/foam.ts; sed -n 710,740p src/vfx/waterRibbon.ts; sed -n 1610,1625p src/vfx/waterRibbon.ts; sed -n 576,640p src/vfx/foam.ts", "description": "Read HIDE07 shader code and berm builder"}`

### 🧑 User — 2026-11-19T02:29:12.165Z

> ↩︎ result: #include <fog_pars_fragment>
> ${NOISE_GLSL}
> ${FRAG_FX_GLSL}
> ${SOAP05_GLSL}
> void main() {
>   float s = vFoam.y;
>   #ifdef PROJ05
>   // ?proj05=1: the approved picture's foam is baked into the 05 river texture, so the lather sheet steps aside on 05
>   // (dithered over 3 u at both joins; 04 / 06 keep their berm)
>   float pjIn = smoothstep(uSt05.y, uSt05.y + 3.0, s) * (1.0 - smoothstep(uSt05.z - 3.0, uSt05.z, s));
>   if (pjIn > 0.999 || fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453) < pjIn) discard;
>   #endif
>   #ifdef HIDE07
>   // r8 '?match07=1&m07foam=1': the tall white lather walls step aside down the 07 plunge so the matched tube's river
>   // tile (with its painted soft foam banks) shows instead; dithered over 3 u at both ends, 07 level stretch and 08 keep
>   // their berm
>   float h7 = smoothstep(uHide07.x, uHide07.x + 3.0, s) * (1.0 - smoothstep(uHide07.y - 3.0, uHide07.y, s));
>   if (h7 > 0.999 || fract(sin(dot(floor(gl_FragCoord.xy), vec2(12.9898, 78.233))) * 43758.5453) < h7) discard;
>   #endif
>   if (uOutro.x > 0.0 && s > uOutro.y - 2.0) {
>     float n = vnoise(vec2(vFoam.x * 3.0, s * 0.35)) * 0.7 + 0.3;
>     if (n < uOutro.x * 1.15) discard;
>   }
>   vec2 p = vec2 …[+5739 chars]

### 🤖 Claude — 2026-11-19T02:29:21.385Z

> 🔧 **Bash** `{"command": "cd /home/user/wt/s07 && sed -n 520,556p src/vfx/foam.ts", "description": "Read bermScale05 and squashBerm"}`

### 🧑 User — 2026-11-19T02:29:21.429Z

> ↩︎ result: const BANK_ENV: [number, number, number][] = [[58.457, 0.835, 0.581], [607.242, 0.459, 0.357], [267.601, 1.094, 0.563]];
> /**
>  * wave 7 (ref 05 rows, qa/pilot05/wave7/foam): the bank row's inner edge (px in from the frame edge) and lateral size
>  * (px) by row ds. The right bank ahead of Benny is a NARROW rim hugging the river edge (ref y 700-940: inner edge
>  * 30 -> 158 -> 70 px, 20-66 px per row), not the wave-5 heap (124-179 px per row). The ref's near clumps: left x 0-130
>  * y 1020-1110 (ds 0.5-1.5), lower left x 60-230 y 1220-1300 and lower right x 650-800 y 1260-1330 (behind Benny,
>  * ds -1.1..-1.7). The envelope seeds
>  * (BANK_ENV, searched; [2] = right side beside / behind Benny) open/close the clumps at those rows of the QA frame.
>  */
> const RIM_R: [number, number][] = [[2.6, 60], [3.4, 70], [4.4, 105], [5.5, 140], [6.6, 158], [7.8, 153], [9.0, 135], [10.3, 104], [11.6, 70], [12.9, 30]];
> const RIM_R_PX = 80;
> function rimR(ds: number): number {
>   if (ds <= RIM_R[0][0]) return RIM_R[0][1];
>   for (let i = 1; i < RIM_R.length; i++) {
>     if (ds <= RIM_R[i][0]) {
>       const [a, pa] = RIM_R[i - 1], [b, pb] = RIM_R[i];
>       return pa + ((pb - pa) * (ds - a)) / (b - a);
>     }
>   }
>   …[+955 chars]

### 🤖 Claude — 2026-11-19T02:29:35.273Z

> 🔧 **Bash** `{"command": "cd /home/user/wt/s07 && python3 -c \"\nimport json\nd=json.load(open('qa/match/07/r17/step3_foamb/NEW/motion.json'))\nprint(d.get('console'))\nfor s in d['shots']: print(s['name'], s['s'], s['cam'], s.get('bennyY'))\n\"; grep -n \"console.info\" src/world/match07.ts src/game/Game.ts | head", "description": "Inspect step-3 motion console lines and shot positions"}`

### 🧑 User — 2026-11-19T02:29:35.424Z

> ↩︎ result: ['[m07nearw] checkpoint s 273.26 centre line 1.10 0.53 0.09 -0.16 -0.19 -0.07 0.11 0.29 0.41 0.40 0.24 -0.05 -0.38 -0.68 -0.94 -1.17 -1.37 -1.55 -1.68 -1.71 -1.60 -1.30 -0.80 -0.14 0.56 1.19 1.69 2.04 2.26 2.35 2.31 2.15 1.90 1.59 1.28 1.03 0.88 0.86 0.96 1.14 1.34 1.50 1.57 1.52 1.35 1.11 0.84 0.61 0.48 0.47 0.57 0.75 0.95 1.10 1.15 1.09 0.92 0.70 0.49 0.37 0.40 0.58 0.85 1.16']
> t50_through_screen 332.293 [12.91, -56.66, -251.87] -66.106
> t66_through_screen 351.063 [12.91, -74.78, -259.41] -83.754
> t80_through_screen 367.468 [12.91, -90.19, -265.01] -99.149
> t95_through_screen 385.064 [12.91, -104.71, -270.93] -111.885
> src/world/match07.ts:409:    console.info('[m07nearw] checkpoint s', sCk.toFixed(2), 'centre line', ctr.map((v) => v.toFixed(2)).join(' '));

### 🤖 Claude — 2026-11-19T02:29:38.439Z

> 🔧 **Bash** `{"command": "cd /home/user/wt/s07 && ls -la node_modules | head -2; ps aux | grep -c \"[c]hrom\"; ps aux | grep \"[v]ite\" | head; nproc; uptime; df -h /home/user | tail -1", "description": "Check node_modules link, running processes, load and disk"}`

### 🧑 User — 2026-11-19T02:29:38.746Z

> ↩︎ result: lrwxrwxrwx 1 root root 32 Nov 19 02:25 node_modules -> /home/user/rainbow-/node_modules
> 18
> 4
>  02:29:38 up 22 min,  0 user,  load average: 5.16, 1.72, 0.72
> /dev/vda        252G   26G   44G  38% /

### 🤖 Claude — 2026-11-19T02:29:40.447Z

> 🔧 **Bash** `{"command": "cd /home/user/wt/s07 && sed -n 1,80p scripts/lib/pw.mjs", "description": "Read Playwright helper library"}`

### 🧑 User — 2026-11-19T02:29:40.495Z

> ↩︎ result: // Resolve the Playwright that is pre-installed in this environment (global node_modules),
> // falling back to a local install. Chromium launch flags give WebGL2 via SwiftShader headless.
> import { createRequire } from 'node:module';
> import { execSync } from 'node:child_process';
> import { join } from 'node:path';
> 
> export function loadPlaywright() {
>   try {
>     return createRequire(import.meta.url)('playwright');
>   } catch {
>     const root = execSync('npm root -g').toString().trim();
>     return createRequire(join(root, 'noop.js'))('playwright');
>   }
> }
> 
> export const CHROMIUM_ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
> 
> /** start a Vite dev server for the project and return { url, close } */
> export async function startVite(port = 5199) {
>   const { createServer } = await import('vite');
>   const server = await createServer({ server: { port, strictPort: false, host: '127.0.0.1', hmr: false, watch: { ignored: ['**/*'] } }, logLevel: 'error' });
>   await server.listen();
>   const addr = server.resolvedUrls?.local?.[0] ?? `http://127.0.0.1:${port}/`;
>   return { url: addr.replace(/\/$/, ''), close: () => server.close() };
> }
> 
> export async function  …[+218 chars]

### 🤖 Claude — 2026-11-19T02:30:05.072Z

> 🔧 **Edit** `{"replace_all": false, "file_path": "/home/user/wt/s07/src/vfx/foam.ts", "old_string": "/** r17 '&m07foamb=1': berm height / outer width factor, 0 (flat at the water line) 5 u before the 08 start → 1 at it */\nfunction ramp07(course: Course): (s: number) => number {\n  const e = end07(course);\n  if (e === null) return () => 1;\n  return (s) => { const u = Math.min(1, Math.max(0, (s - (e - 5)) / 5)); return s >= e ? 1 : u * u * (3 - 2 * u); };\n}", "new_string": "/** r17 '&m07foamb=1': berm height / outer width factor, 0 (flat at the water line) 5 u before the 08 start → 1 at it.\n *  r18: ONL …[+532 chars]`

### 🧑 User — 2026-11-19T02:30:05.087Z

> ↩︎ result: <tool_use_error>File has not been read yet. Read it first before writing to it.</tool_use_error>

### 🤖 Claude — 2026-11-19T02:30:06.318Z

> 🔧 **Read** `{"file_path": "/home/user/wt/s07/src/vfx/foam.ts", "offset": 555, "limit": 25}`

### 🧑 User — 2026-11-19T02:30:06.340Z

> ↩︎ result: 555	
> 556	/** r8 '?match07=1&m07foam=1': arc range of the 07 plunge where the berm + its puffs step aside (null = off) */
> 557	function hide07(course: Course): [number, number] | null {
> 558	  if (!flag05('match07') || !flag05('m07foam')) return null;
> 559	  // r17 '&m07foamb=1': the walls stay away to near the end of 07 (they no longer start again partway down the drop with a
> 560	  // cut); over the last 5 u of 07 the bank grows back out of the water (ramp07), full height at the 08 start, so 08 keeps
> 561	  // its berm
> 562	  const r = end07(course);
> 563	  return [course.marks['07_plunge_top'] + 9, r !== null ? r - 5 : course.marks['07_plunge_bottom'] - 12];
> 564	}
> 565	/** r17 '&m07foamb=1': arc length of the 08 start (end of 07) or null = off */
> 566	function end07(course: Course): number | null {
> 567	  if (!flag05('match07') || !flag05('m07foam') || !flag05('m07foamb')) return null;
> 568	  return course.marks['08'] ?? course.marks['07_plunge_bottom'] + 4;
> 569	}
> 570	/** r17 '&m07foamb=1': berm height / outer width factor, 0 (flat at the water line) 5 u before the 08 start → 1 at it */
> 571	function ramp07(course: Course): (s: number) => number {
> 572	  const e = end07(course);
> 573	  if (e = …[+402 chars]

### 🤖 Claude — 2026-11-19T02:30:10.973Z

> 🔧 **Edit** `{"replace_all": false, "file_path": "/home/user/wt/s07/src/vfx/foam.ts", "old_string": "/** r17 '&m07foamb=1': berm height / outer width factor, 0 (flat at the water line) 5 u before the 08 start → 1 at it */\nfunction ramp07(course: Course): (s: number) => number {\n  const e = end07(course);\n  if (e === null) return () => 1;\n  return (s) => { const u = Math.min(1, Math.max(0, (s - (e - 5)) / 5)); return s >= e ? 1 : u * u * (3 - 2 * u); };\n}", "new_string": "/** r17 '&m07foamb=1': berm height / outer width factor, 0 (flat at the water line) 5 u before the 08 start → 1 at it.\n *  r18 fix: …[+614 chars]`

### 🧑 User — 2026-11-19T02:30:11.068Z

> ↩︎ result: The file /home/user/wt/s07/src/vfx/foam.ts has been updated successfully.

### 🤖 Claude — 2026-11-19T02:30:11.672Z

> 🔧 **Read** `{"file_path": "/home/user/wt/s07/src/vfx/foam.ts", "offset": 688, "limit": 20}`

### 🧑 User — 2026-11-19T02:30:11.717Z

> ↩︎ result: 688	  const tmpC = new THREE.Color();
> 689	
> 690	  /** wave 8: the 05 berm puffs (Puff.imp) go to one impostor list (fine-foam shader, 2 tris each), see imp05 below */
> 691	  const imp05: { p: THREE.Vector3; r: number; c: [number, number, number] }[] = [];
> 692	  const h07 = hide07(course);
> 693	  const e07 = end07(course); // r17 m07foamb: puffs stay away to the 08 start (the bank grows back without them)
> 694	  const build =(list: Puff[], parent: THREE.Object3D, sa: number, sb: number) => {
> 695	    if (!list.length) return;
> 696	    const nMesh = list.reduce((n, pf) => n + (pf.imp ? 0 : 1), 0);
> 697	    const mesh = nMesh ? new THREE.InstancedMesh(geoHi, mat, nMesh) : null;
> 698	    let i = 0;
> 699	    // the same rand() calls per puff whichever list it lands in, so every other stage's foam stays identical
> 700	    for (const pf of list) {
> 701	      tmpQ.setFromEuler(tmpE.set(rand() * 6, rand() * 6, rand() * 6));
> 702	      tmpS.set(pf.r, pf.r * (0.78 + rand() * 0.22), pf.r);
> 703	      const seed = rand();
> 704	      if (pf.imp) { imp05.push({ p: pf.p, r: pf.r, c: [pf.ao, seed, pf.tint] }); continue; }
> 705	      if (h07 && pf.s !== undefined && pf.s > h07[0] + 1.5 && pf.s < (e07 ?? h07[1] - 1 …[+117 chars]

### 🤖 Claude — 2026-11-19T02:30:12.715Z

Restoring the stray formatting change (`build =(`) so the shared file only differs where it must.

### 🤖 Claude — 2026-11-19T02:30:13.771Z

> 🔧 **Edit** `{"replace_all": false, "file_path": "/home/user/wt/s07/src/vfx/foam.ts", "old_string": "  const build =(list: Puff[], parent: THREE.Object3D, sa: number, sb: number) => {", "new_string": "  const build = (list: Puff[], parent: THREE.Object3D, sa: number, sb: number) => {"}`

### 🧑 User — 2026-11-19T02:30:14.020Z

> ↩︎ result: The file /home/user/wt/s07/src/vfx/foam.ts has been updated successfully.

### 🤖 Claude — 2026-11-19T02:30:18.059Z

> 🔧 **Read** `{"file_path": "/home/user/wt/s07/src/world/match07.ts", "offset": 290, "limit": 130}`

### 🧑 User — 2026-11-19T02:30:18.101Z

> ↩︎ result: 290	  const fixGold = flag05('m07gold');
> 291	  const fixWall = flag05('m07wall'); // the ring-bay wall tile without the painted paddle (it repeated in every bay deep in the tube)
> 292	  const fixRiver = flag05('m07river'); // the river tile without the slice of painted gold ring (orange smears on the near water)
> 293	  // M3: the clean wall tile with its painted gold rings straightened (tools/match07/straighten_wall07.py) — in the unwrap
> 294	  // the ring band drifted ~43 % of a bay across the rows, so deep in the tube the rings rendered as twisted diagonal bands
> 295	  const fixRing = flag05('m07ring');
> 296	  const fixNear = flag05('m07near'); // M3: tighter stretch guard — magnified projected near water gives way to the river tile sooner
> 297	  // r16: the level-stretch water tile = the painted NEAR river (magenta satin bands, bubbly trim, glossy cyan) winding along the
> 298	  // lane at about the painted near scale, painted foam clouds on the banks (tools/match07/near_tiles_r16.py)
> 299	  const nearW = flag05('m07nearw');
> 300	  const wallFoamOn = flag05('m07wfoam');
> 301	  // r17: on top of m07nearw, a thick magenta bank + separate puffy foam clouds beyond the band (no flat pale foam s …[+7830 chars]

### 🤖 Claude — 2026-11-19T02:30:21.091Z

> 🔧 **Edit** `{"replace_all": false, "file_path": "/home/user/wt/s07/src/world/match07.ts", "old_string": "  const wallFoamOn = flag05('m07wfoam');\n  // r17: on top of m07nearw, a thick magenta bank + separate puffy foam clouds beyond the band (no flat pale foam sheet at\n  // hard left / right)\n  const nearF = flag05('m07nearf'); // r16: painted foam clouds on the lowest wall band (no hard wall / floor edge when steering hard)", "new_string": "  const wallFoamOn = flag05('m07wfoam'); // r16: painted foam clouds on the lowest wall band (no hard wall / floor edge when steering hard)\n  // r17: on top of m0 …[+165 chars]`

### 🧑 User — 2026-11-19T02:30:21.145Z

> ↩︎ result: The file /home/user/wt/s07/src/world/match07.ts has been updated successfully.

### 🤖 Claude — 2026-11-19T02:30:21.831Z

> 🔧 **Bash** `{"command": "cd /home/user/wt/s07 && timeout 600 npx tsc --noEmit -p . 2>&1 | tail -5; echo tsc_exit=$?", "description": "Type-check the project"}`

