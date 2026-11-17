# RAINBOW — new-account handoff (top block 2026-11-17 ~01:25 UTC by session 01Q46SCH)

**Branch to recover: `claude/rainbow-account-transfer-npxahd`** (take its NEWEST commit with `git ls-remote`; it contains all of
`claude/rainbow-restore-env-setup-bxn85h`, now PROTECTED). Same 3 steps as below, with that branch name.
* Cloud environment for a NEW account: personal `rainbow-`, hosts **`download.blender.org`, `dl.google.com`, `lfs.github.com`**
  (the last one is needed to PUSH new Git LFS files: without it the autosave fails with `…/verify: Forbidden`), package managers
  + MCP allowed, setup script = `scripts/cloud-env-setup.sh`. Session 01Q46SCH had to create it (none existed on that account).
* Running at the end of 01Q46SCH: washer-environment-modeler, benny-character-artist, animation-and-gameplay-engineer
  (briefs header "RESUMED RUN #3"); relaunch from brief + NOTES.md "Remaining" if interrupted.
* Careful: `tools/proj05/lid_blender.py` re-saves `<lid_dir>/lids05.blend`; run it on a COPY of `qa/pilot05/proj/tunnel/lid`
  when only testing (01Q46SCH restored the original from `60ed5ff`).

---
# (previous top block) RAINBOW — new-account handoff (rewritten 2026-11-17 ~00:55 UTC by session 01AvQv6S)

**Branch to recover: `claude/rainbow-restore-env-setup-bxn85h`** on `josiahscalia5-dev/rainbow-`. Take its NEWEST commit
(`git ls-remote origin refs/heads/claude/rainbow-restore-env-setup-bxn85h`): the five-minute autosave keeps pushing until
the container closes. It was started from `ccr-694bda6a-x58ntq` @ `4e140fa` (previous account; PROTECTED now).

## Start of a new session / account — 3 steps
1. **Check where you are.** `git branch --show-current; git log --oneline -1`. The SessionStart summary
   ("RAINBOW SESSION START") is in your context. Since 2026-11-17 the hook **never merges**; it lists newer branches.
   * It says `nothing newer on GitHub` → you are on the newest work. Go to step 2.
   * It says `THIS CHECKOUT IS BEHIND <branch>` or you see no summary at all (the GitHub default branch
     `ccr-6f431adf-7h0m8y` is the first account's OLD version without any bootstrap) → move the session branch to the
     newest work (the session branch then holds only commits that are already on GitHub, so nothing is lost):
     ```bash
     cd /home/user/rainbow-
     git status --short                                   # must be empty; if not, stop and look first
     git fetch origin claude/rainbow-restore-env-setup-bxn85h
     git checkout -B "$(git branch --show-current)" FETCH_HEAD
     ```
   Tip for the user: start the cloud session ON the newest branch (branch picker), or make it the GitHub default branch
   (GitHub → Settings → Branches) — then this step is never needed.
2. `bash scripts/claude-bootstrap.sh --skip-resume` (≈ 25 s when the tools exist; installs what is missing): LFS, 13
   references, 10 specialists, npm, Python libs, Playwright + WebGL2, Blender 5.3.0 + real render / GLB check
   (`scripts/verify-blender.py`), Android SDK 34, MCP list, tests, autosave. Report: `backups/BOOTSTRAP_REPORT.md`.
3. Edit `backups/autosave.config.json`: `branch` = the new session branch, `commit_trailer` = your attribution lines,
   add the previous session branch to `protected_branches`, extend `branch_history_note`. Then
   `python3 scripts/rainbow-autosave.py --reason manual:start` and confirm `git ls-remote` == `git rev-parse HEAD`.
Never merge `codex/*` or other branches unless the user asks (`bash scripts/claude-bootstrap.sh --resume` is the only
merge path and is on request only). Never force-push, reset or delete.

## What a new ACCOUNT must reconnect (nothing of this travels through GitHub)
* GitHub connection + Claude GitHub App on the repository (required; if you can read the repo it works).
* `playwright` plugin (required; `claude mcp list` → connected).
* **Cloud environment.** On the account of session 01AvQv6S a personal environment `rainbow-` exists: hosts
  `download.blender.org`, `dl.google.com`, `api.atlas.worldlabs.ai`, package managers + MCP servers allowed, and a setup
  script that installs Blender 5.3.0 + Android SDK 34 before Claude starts (so Blender is "present" at session start).
  A NEW account has no such environment: without `download.blender.org` the Blender install fails. Then propose one
  (`create_environment`, personal, those hosts, setup script = `scripts/cloud-env-setup.sh`; the user approves a card).
* Optional, NOT needed for Screen 05: World Labs Atlas connector sign-in; Marble API key (host `api.worldlabs.ai` is not
  allowed on this environment → the free check reports a NETWORK error, which is not a key problem; ask with
  `request_credential` only if the user wants new World Labs work). Blender MCP needs a desktop Blender: not possible in
  the cloud container, never report it as connected — Blender CLI + Python is the tested integration.

## Verified in session 01AvQv6S (2026-11-17 00:40–00:50 UTC, all actually run)
Blender 5.3.0: bpy, Workbench / EEVEE / Cycles renders, 7/7 `.blend`, `benny.glb` 27 meshes, `rainbow_girl.glb` 165,
`lids05.glb` 6 paddles, GLB export → import 6/6 geometry-identical (`qa/tools_check/blender_restore_s01Av/`);
`tools/proj05/lid_blender.py` rebuilt `lids05.glb` byte-identically; `tools/blender/camera_lock_05.py` and
`tools/proj05/tunnel_bake.py` ran. GitHub MCP `list_branches` (26 branches) + verified pushes; Playwright MCP navigate +
WebGL2 (ANGLE / SwiftShader, Chromium 153); Node 22.23.4, npm 10.9.9, TypeScript 5.9.3, Vite 5.4.21, Three.js 0.170.0,
Capacitor 6.2.3, Android SDK 34 + build-tools 34.0.0 + adb, Java 21, Git LFS 3.4.1 (34/34 real + on GitHub LFS), Python
3.13 numpy 2.5.3 / Pillow 12.3.0 / OpenCV 5.0.0 / SciPy 1.18.1, ffmpeg 6.1.1; tsc + continuity OK. Not built this
session: the Android APK (last step of Screen 05).

## Screen 05 — where everything stands
`qa/pilot05/full_reference_match/COORDINATION.md`, NEWEST section ("RESUMED 2026-11-17 ~01:00 UTC — NEW ACCOUNT"):
recovery numbers, who is running, what is next. Specialists never survive a session: relaunch the ones in
`backups/AGENTS_STATUS.json` → `running_now` from `qa/pilot05/full_reference_match/briefs/<agent>.md` + their `NOTES.md`
("Remaining"), never from scratch. Target = `references/05_flow_into_the_current.png` (the user uploaded it again on
2026-11-17: pixel-identical; words in `qa/pilot05/full_reference_match/ORDER_USER_2026-11-17.md`). Nothing is promoted to
the default build until the user approves the picture; default and the protected BEFORE must stay pixel-identical.

---
# OLDER HANDOFF (session 018Sg3AU, 2026-11-17 ~00:25 UTC) — kept for history; its branch is now protected

**Branch to recover: `ccr-694bda6a-x58ntq`** on `josiahscalia5-dev/rainbow-`. Take its NEWEST commit
(`git ls-remote origin refs/heads/ccr-694bda6a-x58ntq`): the five-minute autosave kept pushing until this session's
container closed. Last verified commit when this file was written: `f600e41c7237890e7bd1d4b47be49c133c22ca25`
(the final SHA of the transfer backup is reported to the user in chat and in `backups/BACKUP_LOG.md`).

## ⚠ The trap that cost time at the start of this session
A new cloud session checks out the **GitHub default branch** = the first account's OLD version (`81e639e`, branch
`ccr-6f431adf-7h0m8y`). It has no bootstrap, no Blender setup; its SessionStart hook only starts an old autosave that
(correctly) refuses to push. So in a new session, FIRST do:

```bash
cd /home/user/rainbow-
git fetch origin ccr-694bda6a-x58ntq
git ls-remote origin refs/heads/ccr-694bda6a-x58ntq          # newest SHA
# the session's own branch (e.g. ccr-xxxxxxxx-yyyyyy) holds only the old default commit, already on GitHub:
git checkout -B "$(git branch --show-current)" FETCH_HEAD     # session branch now = newest work (nothing lost)
bash scripts/claude-bootstrap.sh --skip-resume                # LFS, Blender 5.3.0, Android SDK, npm, tests, autosave
```
Then edit `backups/autosave.config.json`: `branch` = the new session branch, `commit_trailer` = your attribution lines,
add `ccr-694bda6a-x58ntq` to `protected_branches`. (Permanent fix, user's choice: GitHub → Settings → Branches →
default branch = the newest working branch.) Do NOT merge `codex/*` or other experiment branches.

## Paste-ready prompt for the new account
> This is my EXISTING Rainbow 3D Android game — do not start over. Repository `josiahscalia5-dev/rainbow-`. Recover
> branch `ccr-694bda6a-x58ntq` (newest commit by `git ls-remote`) exactly as `backups/HANDOFF_NEW_ACCOUNT.md` says —
> the session starts on an OLD default branch, so follow that file's first block before anything else, with
> `--skip-resume`. Verify Blender 5.3.0 (`qa/tools_check/blender_transfer_s018/verify_blender.py`), Playwright, GitHub,
> LFS, the 13 approved references and the 10 specialists; restart the five-minute autosave on the new session branch
> and verify remote SHA == local HEAD. Then continue Screen 05 from `qa/pilot05/full_reference_match/COORDINATION.md`
> (section "STATE AT ACCOUNT TRANSFER 2026-11-17") — relaunch the three interrupted specialists from their briefs +
> NOTES.md, never from scratch. Don't promote experiments; don't spend credits.

## Verified in session 018Sg3AU (all actually run)
Blender 5.3.0 headless: bpy, Workbench / EEVEE / Cycles renders, 7/7 `.blend` open, `benny.glb` (27 meshes),
`rainbow_girl.glb` (165), `lids05.glb` (6 paddles `lid05_L1–L3`, `lid05_R1–R3`), GLB round trip geometry-identical
(`qa/tools_check/blender_transfer_s018/REPORT.md`). Blender MCP: not possible headless (needs the desktop add-on
socket); CLI + Python is the working integration. GitHub MCP + git push OK; Playwright MCP OK (WebGL2, SwiftShader);
Node 22, TypeScript 5.9.3, Vite 5.4.21, Three.js 0.170, Capacitor 6.2.3, Android SDK 34 + build-tools 34 + Java 21,
Python numpy / Pillow / OpenCV / SciPy, ffmpeg, Git LFS 34/34 (+ confirmed on GitHub LFS). NOT transferable: the
Marble API key (401 — only needed for new World Labs work, ask with `request_credential` only then), World Labs Atlas
and context7 connector sign-ins.

## Screen 05 — where everything stands (details: COORDINATION.md, last section)
* Protected: default build capture == `qa/pilot05/current_default_05.png` (0 px, re-checked ~00:23 UTC with all
  in-progress specialist code present); BEFORE `?ringa=26&nearfloor05=0` == `qa/pilot05/wave9/baseline/05.png`.
* Experimental master switch `?match05=1` = STACK + coordinator water parts + every specialist part.
  STACK = `proj05=1&projwall05=1&projring05=1&projframe05=1&projlid05=1&projflow05=2&projnear05=1&projfar05=1`.
  Whole frame at the locked camera (STACK): mean |ΔRGB| 34.1, 51.6 % of pixels within 20 levels — NOT a 95 % match.
  ⚠ `assets/textures/env05/` (env specialist step a, + `tools/env05/proj_bake.py` step c) appeared at ~00:24 UTC, just
  before the transfer, and was NOT yet checked in a real capture: before relying on `?match05=1`, capture it once; if
  the env05 part fails, A/B with STACK + the individual switches (`projvp05`, `projgap05`, `benny05`, `hud05`, `coins05`).
* Coordinator (main session) — the task worked on last: **dark torn water streaks / E-layer gaps / blending**:
  DONE + measured, behind switches, on with match05: `projvp05` (variance-preserving E ↔ tile hand-over while riding,
  `src/vfx/waterRibbon.ts` `pjMixVP`) and `projgap05` (mirror-filled wave-back-slope gaps,
  `tools/proj05/bake.py … far gapfill` → `assets/textures/water05/far2/proj05_E.png`). Numbers + files:
  `qa/pilot05/full_reference_match/coordinator/NOTES.md`. Remaining there: gaps > 100 rows (10 gaps) still show the
  tile; riding contrast still below the approved 17.7 in most bands (E magnified + T2 repeating).
* Specialists (INTERRUPTED at the transfer — a running specialist never survives a session):
  relaunch each with its brief `qa/pilot05/full_reference_match/briefs/<agent>.md` PLUS "read your NOTES.md first and
  continue from 'Remaining', do not redo finished steps":
  - washer-environment-modeler (`env05`): notes `env/NOTES.md` (see COORDINATION for its state at the transfer)
  - benny-character-artist (`benny05`): notes `benny/NOTES.md`
  - animation-and-gameplay-engineer (`hud05`, `coins05`): notes `hud/NOTES.md`, `coins/NOTES.md`
* Then: integrate (combined `match05` capture, `tools/match05/metrics.py`, the order's deliverables 03_NEW,
  04_DIFFERENCE, 05_OVERLAY, VISUAL_AUDIT.md …), wave 2 = foam-bubbles-particles (`splash05m`, `bub05`), last =
  android-build-performance (APK + perf). Nothing is promoted until the user approves the picture.
