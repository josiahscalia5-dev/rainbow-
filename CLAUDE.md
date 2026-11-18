# RAINBOW — permanent rules for Claude Code

This is an EXISTING, playable 11-screen 3D game. **Never restart it, never start from scratch, never delete work.**

## 1. Every new session or new Claude account — recovery is automatic
The SessionStart hook (`.claude/settings.json` → `scripts/autosave-hook.sh` → **`scripts/claude-bootstrap.sh --hook`**)
already ran before your first turn: it fetched every branch (since 2026-11-17 it merges NOTHING automatically — merging
any branch needs the user's OK; `--resume` re-enables the old merge only then), restored the Git LFS binaries, re-armed the five-minute autosave and
started the full bootstrap in the background. Its summary ("RAINBOW SESSION START") is in your context.
1. `bash scripts/claude-bootstrap.sh --status` → `backups/BOOTSTRAP_REPORT.md` (re-run when it says "still in progress").
   No summary in context, or an old checkout? Run `bash scripts/claude-bootstrap.sh --skip-resume` yourself; from a branch without it:
   `git fetch origin ccr-9c4a8ad6-xovgsx && git show FETCH_HEAD:scripts/claude-bootstrap.sh > /tmp/b.sh && bash /tmp/b.sh --skip-resume`.
   (Legacy prompts call `scripts/resume-newest-work.sh --tools`; it runs the bootstrap.)
2. **BINDING, user-approved 2026-11-18 ~15:00 UTC: `docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md`** (the exact approved
   scenery of 04–08 THROUGHOUT Benny's swimming; read it before any screen work). Read the TOP section of
   **`docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md`** — NEWEST: "ACCOUNT 16" (lead `ccr-e42bb3c0-jpif8d`, `-c16` map + where every worker
   stopped: `docs/briefs/2026-11-18-r16/COORDINATION.md`, `RESUME_R16.md`); before it "ACCOUNT 15" (lead `ccr-47b10cec-03c7co`, `-c15` map + reusable
   launch briefs + four GitHub 3D tools in `docs/briefs/2026-11-18-r15/`); before it "ACCOUNT 14" (lead `ccr-6c7564b1-fmlt1w`, `-c14` map
   `docs/briefs/2026-11-18-r14/COORDINATION.md`); before it "ACCOUNT 13" (lead `claude/rainbow-restore-autosave-1mgga0`, `-c13` map
   `docs/briefs/2026-11-18-r13/COORDINATION.md`), then "ACCOUNT 12", then "ACCOUNT 11 (round 11) STATE" (2026-11-18,
   lead `ccr-3b139b48-0qqkkz`, `-c11` branch map `docs/briefs/2026-11-18-r11/COORDINATION.md`; a new account must re-enter
   the World Labs + fal keys via the secure form); before it "ACCOUNT 10" (lead `ccr-c526614d-tw0yro`); then "ACCOUNT 9 (round 9) STATE" (2026-11-18,
   lead `claude/rainbow-restore-c9-40w64b`, `-c9` branch map `docs/briefs/2026-11-18-r9/COORDINATION.md`); before it: "ACCOUNT 8 (round 8) STATE" (2026-11-18,
   lead branch `claude/rainbow-lead-c8`, `-c8` branch map, rules `docs/briefs/2026-11-18-r8/COMMON_RULES.md`); older: ("ACCOUNT 6 (round 6) STATE", 2026-11-17 ~22:40 UTC:
   lead branch **`ccr-4bd35b15-7z45t0`**, the `-c6` branch map, moving-gameplay audit `qa/lead_r6/2026-11-17/README.md`,
   user order `docs/briefs/2026-11-17-r6/USER_DECISIONS.md`), then "ACCOUNT 5 (round 5) STATE" (r5 lead
   `ccr-f983b317-2vt0zh`, the `-c5` branch map with SHAs, restore audit, keys), then its "ACCOUNT 4 → NEXT
   ACCOUNT" section (every workstream's next task, how to restart them on new branches, key reconnection),
   `docs/PARALLEL_PROGRESS.md` (ROUND 5 + ROUND 4), `docs/briefs/2026-11-17-r5/` and `docs/briefs/2026-11-17-r4/`; the older
   parts of that handoff (Screen 08 method, keys, Image-Blaster, ~14:30 UTC) remain valid background. Then **`backups/HANDOFF_2026-11-17_NEW_ACCOUNT.md`**, `backups/CLAUDE_ACCOUNT_TRANSFER.md` (top section only), `backups/AGENTS_STATUS.json`,
   `backups/TOOL_MANIFEST.json` and the current briefs: **`qa/pilot05/proj/`** (water texture projection — `NOTES.md` when it
   exists, `BRIEF_SPECIALIST1_VERBATIM.md`, `BRIEF_SPECIALIST2.md`), `qa/pilot05/wave12/NOTES.md`, `qa/pilot05/COORDINATION_WAVE9B.md`.
3. Check connectors yourself (ToolSearch `World_Labs_Atlas`, `github`, `playwright`) and give the user the backup
   report of §4. Tell the user plainly about every failure and every backup GAP the bootstrap reports.
The GitHub default branch is an OLD version. **As of 2026-11-17 ~11:50 UTC there are TWO unmerged lines of game work**
(details, differences and the safe merge procedure: `backups/HANDOFF_2026-11-17_NEW_ACCOUNT.md` §1):
**line A** = `ccr-9c4a8ad6-xovgsx` (= `ccr-61131b9d-uj0oqb` + backup commits; Screen 07 measurements/camera, `?matchNN=1`
audit 02–10, projection-water switches) and **line B** = `ccr-b0757dec-dj6l1o` (`a8c03f0`, then `65f3a89` 11:48 UTC from its still-running session `01VCMXob`; the big Screen 05 full-reference
match `?match05=1` with env05 / benny05 / hud05 / coins05 / splash05m / bub05 — measured 86.9 % of the whole frame within
20 levels). **Never merge or cherry-pick between them without the user's explicit OK.** `ccr-451ea8c7-3nqlis` (`97dda28`)
= older protected working version. `codex/*` branches hold Codex's separate water experiment: preserved, protected,
**never merge them**. Ready-to-paste prompt for a new account: `backups/START_NEW_CLAUDE_ACCOUNT.md`. The bootstrap checks before installing (Blender 5.3.0, Android SDK
34, npm, Python libs, World Labs plugin): never reinstall a working tool by hand, never run `playwright install`.

## 2. Five-minute GitHub autosave — the user's standing order (2026-11-15/16), never ask about routine saves
* `scripts/rainbow-autosave.py` runs every 5 minutes while the cloud environment is active (loop daemon
  `scripts/autosave-daemon.sh`, re-armed by the SessionStart and Stop hooks) plus on PreCompact / Stop / SessionEnd.
  It commits all allow-listed project files (code, unfinished specialist edits, screenshots, Marble and Blender files,
  docs), pushes to THIS session's own `ccr-*`/`claude/*` branch, verifies remote SHA == local HEAD and logs every run
  in `backups/BACKUP_LOG.md` (+ `backups/.live/`). A lock prevents simultaneous saves and races with merges / LFS.
* NEVER force-push, reset, rebase, rewrite history or push to `protected_branches` in `backups/autosave.config.json`
  (`ccr-6f431adf-7h0m8y` original, `claude/rainbow-3d-recovery-m4v347` recovery, and every finished earlier session
  branch). Keep unfinished experiments as URL-switch tests or patches on the session branch, never on protected ones.
* At session start and after every major task: `python3 -I scripts/autosave-status.py` (expect `AUTOSAVE OK … (match)`).
  Before ending a session: `python3 scripts/rainbow-autosave.py --reason manual:end`, then confirm
  `git ls-remote origin refs/heads/<branch>` == `git rev-parse HEAD`.
* **User order restated 2026-11-18 (permanent, every account):** at the START of every session restore and verify the
  five-minute GitHub autosave (`python3 -I scripts/autosave-status.py` → `AUTOSAVE OK … (match)`), save immediately after
  every kept visual improvement and before ending, verify remote SHA == local HEAD. Since 2026-11-18 every autosave also
  snapshots each specialist worktree's UNFINISHED edits (read-only) into `backups/wip/<branch>/` (`tracked.patch`, small new
  files, `INFO.json` with restore steps). Never commit secrets; never claim running agents or logins transfer (save their
  definitions, work and restart instructions); never merge or overwrite specialist branches without the user's OK.
  TRAP: the GitHub DEFAULT branch (`ccr-6f431adf-7h0m8y`, protected original 11-15) has an OLD hook that does NOT restore
  newer work — a new account must start its session on the branch named at the top of `backups/START_NEW_CLAUDE_ACCOUNT.md`.
* Backups cannot run while an environment is closed: never claim they did. Report gaps from the bootstrap's
  "Backup gap" line (previous save, missing end-of-session backup, long gaps in the log).

## 3. Security
* NEVER commit, print, log or paste API keys, passwords or tokens. The Marble World API key exists only as a
  Claude-environment network secret (host `api.worldlabs.ai`, header `WLT-Api-Key`; on the current account: the personal
  `rainbow-` environment, re-entered by the user 2026-11-16). Check it with the free read `python3 -I scripts/verify-assets.py worldlabs` (the bootstrap does).
  **Do not ask the user for a key unless that check reports HTTP 401/403** (authentication failed); a network error
  or timeout is NOT a key problem. Only then call `request_credential` (host `api.worldlabs.ai`, header
  `WLT-Api-Key`); the user types the key only into that secure form. The autosave scans staged text for secrets.
* Ask the user ONLY for real approvals: paid credits (World Labs / Marble jobs, Meshy, Rodin — name the job and its
  credits first) or changes that could lose existing work. No new Marble worlds without the user's OK
  (ledger `qa/worldlabs/05/pilot/LEDGER.md`; free reads such as the credit balance are fine).

## 4. Backup report — at session start, after major changes and before ending
When every bootstrap/autosave check passed and remote SHA == local HEAD, start with the exact line
**`RAINBOW 3D BACKUP VERIFIED`**, then list: GitHub branch; full commit SHA; remote verification
(`git ls-remote` == HEAD); Git LFS (local real files + "confirmed on GitHub LFS"); the ten specialists' status
(`backups/AGENTS_STATUS.json`); Marble World Labs assets + integration (key, plugin, Atlas connector, credits);
Blender / Android / Playwright / MCP readiness; five-minute autosave status; anything that could not be transferred.
If anything failed, do NOT print that line — say exactly what failed and what you are doing about it.

## 5. Specialists and tools
Ten project specialists live in `.claude/agents/` (water-fx-specialist, cartoon-girl-character-artist,
washer-environment-modeler, path-camera-transition-engineer, foam-bubbles-particles, reference-match-director,
playwright-visual-qa, benny-character-artist, animation-and-gameplay-engineer, android-build-performance). Reuse them;
never recreate or rename them; do not claim fictional official plugins. A running specialist does not survive a new
session: relaunch it from its notes + unfinished patch (`backups/AGENTS_STATUS.json` → `notes`, `unfinished_work`) and
update that file when its state changes. Tool versions, plugins, MCP servers, hooks, hosts and Marble world IDs:
`backups/TOOL_MANIFEST.json`. Don't expose secrets or spend paid credits without approval. Do not claim repo creation,
pushes or tests unless verified.

## 6. The game (authoritative brief `Rainbow_Claude_Code_Master_Prompt_11_Screens.md`)
**USER DECISIONS 2026-11-17 ~19:00 UTC (account 4) — full text `docs/briefs/2026-11-17-r4/USER_DECISIONS.md`:**
Benny: round 3b = preferred base, compare with r2 / r4 / approved; body rounder and fuller, fur soft (not spiky).
`?match08=1&coins08px=1` = preferred coin version (lead verified in gameplay 19:05: 8/8, 91 / 2,240, all 9 painted
coins picked up). Order: 08 Benny + camera → 07 → 08 scenery-in-motion (`S08_SCENERY.md`: the projected 08 scenery tears
when Benny moves/steers) → 05 → 06 → 04, at most two sessions at once (usage). Final approval only after full-size APPROVED /
BEFORE / NEW + moving-view comparisons. Never merge PR #16 or unfinished branches without the user's OK.

**NEWEST USER ORDERS (2026-11-17) — win over everything older in this section:**
* **Structure.** VIDEOS: 01 existing opening · 02 whirlpool tumble · 03 Whirlpool Twirl · 09 final wave · 10 return to
  hiding · 11 existing ending. REAL PLAYABLE 3D: 04 Five Arrows · 05 Flow Into the Current · 06 Rinse Arch · 07 Washer
  Tube · 08 Final Spin Chamber. Goal ≥ 9/10 (≥ 90 %) visual likeness of each playable screen to ITS approved picture.
  Never regenerate a video, never spend paid-generation credits.
* **Opening + ending = Google Flow videos made by the user** (girl loads the towel with hidden Benny / Benny hides back in
  the towel and she grabs it — story and hand-over rules: `docs/FLOW_VIDEO.md`). Never rebuild them as 3D scenes.
* **Work on the VISUAL part only** (user's words: "I just want to work on the visual part of my approved screens,
  nothing else … I want the scenery, just the look to match my exact approved screens"; "I don't like hear much about the
  camera or the movements"). Spend effort on scenery, walls, rings, water, foam, colours, lighting, props, Benny's look.
  Change camera framing only where the scenery cannot line up otherwise, and report results to the user in visual terms
  (APPROVED | BEFORE | NEW full-size pictures + whole-frame numbers), not camera or movement details.
* **Screen 08 method (2026-11-17, `qa/match/08/NOTES.md`): `?match08=1`** = fal clean environment plate + the user's ORIGINAL
  pixels (hybrid texture) camera-projected onto real 3D geometry fitted to the approved picture (tools/match08/), river path
  following the painted S-river. Scenery 95.4 % within 20 levels (BEFORE 3.3 %). Waiting for the user's verdict; then the
  same method for 04, 05, 06, 07 (fal clean plates approved by the user; no new Marble worlds without discussing why).

Fresh isolated game: do not import anything from prior games. Preserve `references/*.png`,
`references/water/05_water_isolated_original.png` (the user's original isolated Screen 05 water artwork) and
`character_references/official_cartoon_girl_original.jpg` unchanged (`sha256sum -c scripts/reference.sha256`, 13 files).
Locked target = 11 stages, 01–11, plus one separate cartoon-girl reference. Character identity override = the new
cartoon girl (same rig/model/style) in opening, scene 10 and scene 11; legacy photo girls are framing references only.
Benny's pink fluff, violet eyes, knitted star hat and paw pads stay consistent. Ending is **11 · SAFELY HOME**,
real-time victory, with `FINAL SPIN COMPLETE`, girl lifts/holds towel while Benny hides.

**User priorities (2026-11-16):** the user's Google Flow videos are the opening (girl loads the washer with hidden
Benny) and the ending (girl retrieves the towel) — preserve the video hand-over (`docs/FLOW_VIDEO.md`), make
intro → gameplay and gameplay → ending seamless, and do NOT spend credits rebuilding 01 / 02 / 11 as detailed 3D
artwork. Specialists work on the PLAYABLE screens 03–09: Screen 05 first (approved artwork as closely as possible,
ideally 90–95 %), then 03, 04, 06, 07, 08, 09. Screen 05 visual changes are controlled tests — one factor at a
time, a URL switch, default build unchanged, shown approved | BEFORE | NEW as separate full-size pictures (no grid),
kept only when clearly closer; never the oval / enlarged "big tunnel" (`qa/pilot05/COORDINATION_WAVE9B.md`).
Current default = **T2** (front ring A at 20 u + near tunnel 2 u lower, promoted 2026-11-16 under the user's rule
"only if genuinely closer"; picture `qa/pilot05/current_default_05.png`) — **PROVISIONAL until the user approves the
visual result** (user, 2026-11-16 ~11:50). Candidates waiting for the user: W2 `?wall05=1`, G1b `?gold05=1`, W10 `?water05=1`, S1 `?fars05=1`, W11 `?river05=1`
(user: "too grainy"), **tunnel bake `?projwall05=1&projring05=1&projframe05=1&projlid05=1`** (walls, rings, near gold frame, Blender paddles; with `proj05=1`;
`qa/pilot05/proj/tunnel/NOTES.md`, 2026-11-16 ~20:50; paddles approved by the user ~21:45, NOT promoted), **water flow `&projflow05=2`** (flow along the
approved streaks, design stays crisp: `qa/pilot05/proj/flow2/NOTES.md`), **sharp riding water `&projnear05=1`** (approved
near tile + near flares where the camera has approached; 2–3× crisper while riding, start view unchanged:
`qa/pilot05/proj/near/NOTES.md`, 2026-11-17), **P1 `?proj05=1`** (the approved water itself baked onto the game river; `qa/pilot05/proj/NOTES.md`, 2026-11-16 ~18:45), **W12 `?silk05=1&puff05=1`** (newest water: smooth long streaks, deep cyan, bubbly foam banks;
`qa/pilot05/wave12/NOTES.md`; experiment APK via `VITE_RAINBOW_Q05`). The user's **BEFORE stays protected**:
`?ringa=26&nearfloor05=0` reproduces `qa/pilot05/wave9/baseline/05.png` pixel-for-pixel (`claude-bootstrap.sh --full`
checks both). No more tunnel-position experiments (user, 2026-11-16): next are the rings' polished gold, the purple
metal walls, the thick cyan-and-pink S-river and premium lighting. Report branch + commit SHA at major checkpoints.

**Screen 05 water — CURRENT OBJECTIVE (user, 2026-11-16 ~15:40): reproduce the ACTUAL approved water DESIGN first, then
make it move.** No more procedural-pattern / saturation / bloom / white-line rounds. Specialist 1
(`washer-environment-modeler` as Blender texture-projection artist) camera-projects / bakes the user's original artwork
(`references/water/05_water_isolated_original.png`, target `references/05_flow_into_the_current.png`) onto the real river
mesh, feasibility test first (`?proj05=1`, corrected visual geometry `?projgeo05=1` if needed); after the user has seen
the static match, Specialist 2 (`water-fx-specialist`) animates the SAME design flowing down the S-curves toward the
camera (`?projflow05=1`), layout anchored to the world, plus a short clip proving the direction. Branch
`claude/rainbow-05-water-projection`; status and relaunch instructions: `backups/AGENTS_STATUS.json` →
`assignments_now`. Benny, camera, coins, steering, gameplay and transitions stay untouched; never paste the approved
image over the screen; no 100 % claims without evidence.

Real 3D interactive mobile portrait gameplay; 01–02 real-time cinematics; 03–10 interactive ride; 11 victory
cinematic. No wallpaper/collage/slideshow/video as interactive substitute. Water must run along contiguous spline
geometry, with actual huge 07→08 downward tube transition. Include depth and continuity tests and per-scene Playwright
screenshots; compare each original and live result. Use established Blender/PBR/glTF models and efficient Three.js
shaders. Strive for similarity, disclose differences, do not invent fidelity scores.
