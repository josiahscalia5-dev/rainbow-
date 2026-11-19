# Paste this into Claude Code on the next Claude account

(Updated 2026-11-16 ~16:00 UTC, during the Screen 05 water-projection experiment.)

## Before you paste (one-time, on the new account — these never travel through GitHub)
1. claude.ai → connect **GitHub** to the new Claude account and install the **Claude GitHub App** on the private repo
   `josiahscalia5-dev/rainbow-` (https://github.com/josiahscalia5-dev/rainbow-).
2. Enable the **playwright** plugin if it is not already on. Optional: Settings → Connectors → **World Labs Atlas**
   (only for new World Labs tasks; the game does not need it).
3. Start a Claude Code cloud session on `josiahscalia5-dev/rainbow-`; pick branch
   **`claude/rainbow-05-water-projection`** if the app lets you choose (any branch works — the repo's SessionStart hook
   merges the newest `ccr-*` / `claude/*` work into the new session's own branch; it never overwrites a branch).

## The prompt
> RAINBOW 3D — continue my EXISTING game. Do NOT start a new game, do NOT recreate anything, do NOT delete or overwrite
> any branch.
> Repository: `josiahscalia5-dev/rainbow-`. Newest work: branch `claude/rainbow-05-water-projection` (it contains my
> working version `ccr-451ea8c7-3nqlis`, which stays protected). Do not merge the `codex/*` branches unless I ask.
> 1. Follow `CLAUDE.md`. The SessionStart hook has already run `scripts/claude-bootstrap.sh`; check
>    `bash scripts/claude-bootstrap.sh --status` (if the hook did not run:
>    `git fetch origin claude/rainbow-05-water-projection && git show FETCH_HEAD:scripts/claude-bootstrap.sh > /tmp/b.sh && bash /tmp/b.sh`).
>    It restores the Git LFS files, Blender 5.3, the Android SDK, npm and the five-minute GitHub autosave.
> 2. Read the top section of `backups/CLAUDE_ACCOUNT_TRANSFER.md`, `backups/AGENTS_STATUS.json` (`assignments_now`),
>    `backups/TOOL_MANIFEST.json` and the folder `qa/pilot05/proj/`.
> 3. Give me the backup report from `CLAUDE.md` §4 ("RAINBOW 3D BACKUP VERIFIED" only if every check passed) and tell me
>    what I must re-connect (GitHub is connected if you can read this repo; my Marble key only through the secure
>    credential form, and only if the free check reports 401 / 403).
> 4. Keep the five-minute autosave running on your own session branch and verify remote SHA == local HEAD.
> 5. Continue Screen 05 exactly where the last account stopped: reproduce my ORIGINAL approved water design by
>    camera-matched texture projection onto the real river mesh, then animate that same design flowing toward the
>    camera. Specialist 1 (the Blender specialist `washer-environment-modeler`) was interrupted by the account switch:
>    relaunch it with `qa/pilot05/proj/BRIEF_SPECIALIST1_VERBATIM.md`, continuing from the files already in
>    `qa/pilot05/proj/` — do not redo finished steps. Specialist 2 (`water-fx-specialist`,
>    `qa/pilot05/proj/BRIEF_SPECIALIST2.md`) starts only after I have seen the static match. No more procedural /
>    saturation / bloom rounds. Show me full-size APPROVED vs NEW from the same camera, then a short clip of the flow.

## What that makes the next session do (details for Claude)
1. The hook (≈ 10 s) merges every newer `ccr-*` / `claude/*` branch into the new session branch (normal merges; a
   conflicting merge is aborted and reported), restores the 26 Git LFS binaries (models, 3 APKs, both Marble worlds:
   splats, PLY, collider GLBs, `.blend` imports), re-arms the autosave and starts the full bootstrap in the background
   (tools only when missing: Blender 5.3.0, Android SDK 34, npm, Python libs, World Labs plugin; tests `tsc` +
   continuity). Read `backups/BOOTSTRAP_REPORT.md`; any FAIL / GAP line goes to the user. `codex/*` is NOT merged.
2. The autosave follows the new session branch by itself (`session_branch_patterns`) and puts the current session in
   the `Claude-Session:` trailer. Update `backups/autosave.config.json` → `branch` and `commit_trailer`
   (Co-Authored-By line from your attribution instructions), and add the previous session's branch
   (`claude/rainbow-05-water-projection`) to `protected_branches` once it is contained.
   `python3 -I scripts/autosave-status.py` must say `AUTOSAVE OK … (match)`.
3. Specialists: `backups/AGENTS_STATUS.json` (10 definitions in `.claude/agents/`, never recreate or rename them).
   `assignments_now` says who was running / queued and how to relaunch. A specialist listed as running is INTERRUPTED in
   a new session. Unfinished wave-9 work = patches in `qa/pilot05/wave9b/not_merged/`.
4. Screen 05: the working game = **T2** (front ring A at 20 u + near tunnel 2 u lower; PROVISIONAL until I approve the
   picture `qa/pilot05/current_default_05.png`). My **BEFORE** stays reproducible: `?ringa=26&nearfloor05=0` ==
   `qa/pilot05/wave9/baseline/05.png` pixel-for-pixel (`bash scripts/claude-bootstrap.sh --full` re-checks it). The oval /
   enlarged tunnel is rejected — never bring it back; no more tunnel-position tests.
   **Current water objective: the projection experiment** (`qa/pilot05/proj/`, switches `?proj05=1`, `?projgeo05=1`,
   `?projflow05=1`; source `references/water/05_water_isolated_original.png`, target
   `references/05_flow_into_the_current.png`). Earlier candidates stay available behind their switches, none merged into
   the default: W2 `?wall05=1`, G1b `?gold05=1`, W10 `?water05=1`, S1 `?fars05=1`, W11 `?river05=1` (too grainy),
   W12 `?silk05=1&puff05=1&glow05=1&flowcam05=1` (`qa/pilot05/wave12/`), Codex's experiment on its own branch.
   Always approved | CURRENT | NEW as separate full-size pictures, kept only when clearly closer.
5. My Google Flow videos are the opening and the ending: do not rebuild screens 01 / 02 / 11 as detailed 3D. No video
   file is in the repo yet — ask me to upload `intro.mp4` / `ending.mp4`, then follow `docs/FLOW_VIDEO.md`.
   After Screen 05 the specialists work on playable screens 03, 04, 06, 07, 08, 09 (one screen at a time).
6. Never claim anything transferred unless you tested it. My Marble World API key goes ONLY into the secure credential
   form (`request_credential`, host `api.worldlabs.ai`, header `WLT-Api-Key`) and only if the free check
   `python3 -I scripts/verify-assets.py worldlabs` reports 401 / 403 — never chat, git or logs. No paid World Labs job
   without my approval (cap US$5 = 6,250 credits; 1,810 spent; balance 5,190 on 2026-11-16;
   `qa/worldlabs/05/pilot/LEDGER.md`). Both Marble worlds and everything generated are already in Git LFS.
7. Backups only run while a cloud environment is open: report gaps honestly (bootstrap "Backup gap" line).
