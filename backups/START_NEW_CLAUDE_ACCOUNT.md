# Paste this into Claude Code on the next Claude account

## Before you paste (one-time, on the new account — these never travel through GitHub)
1. claude.ai → connect **GitHub** to the new Claude account and install the **Claude GitHub App** on
   `josiahscalia5-dev/rainbow-`.
2. claude.ai → Settings → Connectors: add **World Labs Atlas** and sign in (only needed for new World Labs tasks).
   Enable the **playwright** plugin if it is not already on.
3. Optional, makes every session start faster: Claude Code → environment settings → create a personal environment
   for `josiahscalia5-dev/rainbow-` and paste `scripts/cloud-env-setup.sh` as its setup script (network: unrestricted,
   or limited + package managers + MCP servers + the hosts in `backups/TOOL_MANIFEST.json` → `network_hosts`).
4. Start a Claude Code cloud session on `josiahscalia5-dev/rainbow-`; pick branch **`ccr-451ea8c7-3nqlis`** if the app
   lets you choose (any branch works — the bootstrap merges the newest work).

## Short prompt
> Continue my EXISTING Rainbow 3D game — do not start over, do not delete anything. Repository
> `josiahscalia5-dev/rainbow-`. Follow `CLAUDE.md`: the SessionStart hook has already run
> `scripts/claude-bootstrap.sh`; check `bash scripts/claude-bootstrap.sh --status` (if the hook did not run:
> `git fetch origin ccr-451ea8c7-3nqlis && git show FETCH_HEAD:scripts/claude-bootstrap.sh > /tmp/b.sh && bash /tmp/b.sh`).
> Keep the five-minute GitHub autosave running on your own branch, give me the backup report from `CLAUDE.md` §4
> ("RAINBOW 3D BACKUP VERIFIED" only if everything passed), tell me what I must re-connect, then continue Screen 05
> exactly where the last account stopped: newest brief `qa/pilot05/wave12/NOTES.md` (water test W12 `?silk05=1&puff05=1`),
> tunnel brief `qa/pilot05/COORDINATION_WAVE9B.md`. Controlled tests only, default T2 and my BEFORE stay protected.

## What that makes the next session do (details for Claude)
1. The hook (≈ 10 s) merged every newer `ccr-*` / `claude/*` branch, restored the 24 Git LFS binaries (models, APK,
   both Marble worlds: splats, PLY, collider GLBs, `.blend` imports), re-armed the autosave and started the full
   bootstrap in the background (tools only when missing: Blender 5.3.0, Android SDK 34, npm, Python libs, World Labs
   plugin; tests `tsc` + continuity). Read `backups/BOOTSTRAP_REPORT.md`; any FAIL / GAP line goes to the user.
2. The autosave follows the new session branch by itself (`session_branch_patterns`) and puts the current session in
   the `Claude-Session:` trailer. Update `backups/autosave.config.json` → `branch` and `commit_trailer`
   (Co-Authored-By line from your attribution instructions), and add the previous session's branch to
   `protected_branches` once it is contained. `python3 -I scripts/autosave-status.py` must say `AUTOSAVE OK … (match)`.
3. Specialists: `backups/AGENTS_STATUS.json` (10 definitions in `.claude/agents/`, never recreate them). None runs at
   hand-over (each entry has notes + unfinished work + next task); unfinished wave-9 work = patches in
   `qa/pilot05/wave9b/not_merged/` (README says what may be reused). Relaunch only the ones a task needs.
4. Screen 05: the working game = **T2** (front ring A at 20 u + near tunnel 2 u lower; PROVISIONAL until I approve
   the picture `qa/pilot05/current_default_05.png`). My **BEFORE** stays reproducible: `?ringa=26&nearfloor05=0` ==
   `qa/pilot05/wave9/baseline/05.png` pixel-for-pixel (`bash scripts/claude-bootstrap.sh --full` re-checks it). The oval /
   enlarged tunnel is rejected — never bring it back; no more tunnel-position tests. Candidates waiting for my yes/no
   (URL switches, default untouched): W2 `?wall05=1` (violet walls), G1b `?gold05=1` (ring gold), W10 `?water05=1`,
   S1 `?fars05=1`, W11 `?river05=1` (I found it too grainy), **W12 `?silk05=1&puff05=1`** (smooth long streaks, deep
   cyan, bubbly foam banks — newest; `qa/pilot05/wave12/`). Experiment APK: `builds/rainbow-debug-w12-water.apk`
   (switches baked in with `VITE_RAINBOW_Q05`). One factor per test, always approved | CURRENT | NEW as separate
   full-size pictures, kept only when clearly closer.
5. My Google Flow videos are the opening and the ending: do not rebuild screens 01 / 02 / 11 as detailed 3D. No video
   file is in the repo yet — ask me to upload `intro.mp4` / `ending.mp4`, then follow `docs/FLOW_VIDEO.md`.
   After Screen 05 the specialists work on playable screens 03, 04, 06, 07, 08, 09 (one screen at a time).
6. Never claim anything transferred unless you tested it. My Marble World API key goes ONLY into the secure credential
   form (`request_credential`, host `api.worldlabs.ai`, header `WLT-Api-Key`) and only if new API calls are needed —
   never chat, git or logs (re-entered on the `rainbow-` environment 2026-11-16 ~14:00 UTC after a 401; free read OK). No paid
   World Labs job without my approval (cap US$5 = 6,250 credits; 1,810 spent; balance 5,190 on 2026-11-16; `qa/worldlabs/05/pilot/LEDGER.md`). Everything generated is already in Git LFS.
