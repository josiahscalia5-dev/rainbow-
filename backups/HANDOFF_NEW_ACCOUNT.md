# RAINBOW — new-account handoff (written 2026-11-17 ~00:55 UTC by session 018Sg3AU)

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
* Protected: default build capture == `qa/pilot05/current_default_05.png` (0 px, re-checked 00:50 UTC with all
  in-progress specialist code present); BEFORE `?ringa=26&nearfloor05=0` == `qa/pilot05/wave9/baseline/05.png`.
* Experimental master switch `?match05=1` = STACK + coordinator water parts + every specialist part.
  STACK = `proj05=1&projwall05=1&projring05=1&projframe05=1&projlid05=1&projflow05=2&projnear05=1&projfar05=1`.
  Whole frame at the locked camera (STACK): mean |ΔRGB| 34.1, 51.6 % of pixels within 20 levels — NOT a 95 % match.
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
