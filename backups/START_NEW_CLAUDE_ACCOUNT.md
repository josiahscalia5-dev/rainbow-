# Paste this into Claude Code on the next Claude account

Start a Claude Code cloud session on repository `josiahscalia5-dev/rainbow-` (pick branch `ccr-44f84024-ii5iih` if
the app lets you choose). Connect GitHub to the new Claude account first (and install the Claude GitHub App on the
repository). Then paste the short prompt.

## Short prompt
> Continue my EXISTING Rainbow 3D Android game — do not start over, do not delete anything. Repository
> `josiahscalia5-dev/rainbow-`, newest saved work on branch `ccr-44f84024-ii5iih` (the GitHub default branch is an
> OLD version). First run
> `git fetch origin ccr-44f84024-ii5iih && git show FETCH_HEAD:scripts/resume-newest-work.sh > /tmp/r.sh && bash /tmp/r.sh --tools`,
> then read `CLAUDE.md`, `backups/CLAUDE_ACCOUNT_TRANSFER.md` (top section) and `qa/pilot05/COORDINATION_WAVE9B.md`,
> keep the five-minute GitHub autosave running on your own branch, give me a short recovery report, and continue
> Screen 05 with controlled tests against my BEFORE baseline.

## What that prompt makes the next session do (details for Claude)
1. `resume-newest-work.sh --tools` merges every newer `ccr-*` / `claude/*` branch (never resets or force-pushes),
   downloads the 24 Git LFS binaries (models, APK, both Marble worlds: splats, PLY, collider GLBs, `.blend` imports),
   checks the 12 approved references, the 10 specialists, `tsc` and continuity, and installs Blender 5.3, Android
   SDK 34 and the World Labs plugin. Expect `RESUME CHECK: OK`.
2. Push the new session branch; add `ccr-44f84024-ii5iih` to `protected_branches` and point `branch` +
   `commit_trailer` in `backups/autosave.config.json` at the new branch. `python3 -I scripts/autosave-status.py`
   must say `AUTOSAVE OK … (match)`.
3. Read `backups/AGENTS_STATUS.md` (top section): no specialist was running at hand-over; all ten definitions are in
   `.claude/agents/` — do not recreate them. Unfinished wave-9 specialist work is NOT in the game; it is saved as
   labelled patches in `qa/pilot05/wave9b/not_merged/` (README there says what is finished and what may be reused).
4. Screen 05 state: the working game is my accepted **BEFORE** baseline (fresh capture pixel-identical to
   `qa/pilot05/wave9/baseline/05.png`). The oval / enlarged tunnel is rejected — never bring it back. Test T1
   (front ring closer, `?ringa=20`) is waiting for my yes/no; next single-factor tests are listed in
   `qa/pilot05/COORDINATION_WAVE9B.md`. One factor per test, always show approved | BEFORE | NEW full size.
5. My Google Flow videos are the opening and the ending: do not rebuild screens 01 / 02 / 11 as detailed 3D. No video
   file is in the repo yet — ask me to upload `intro.mp4` / `ending.mp4`, then follow `docs/FLOW_VIDEO.md`.
   After Screen 05 the specialists work on playable screens 03, 04, 06, 07, 08, 09 (one screen at a time).
6. Run `node scripts/gameplay-test.mjs` (expect pass, 07→08 drop 61.41). Keep all gameplay mechanics.
7. Tell me which connectors I must sign in to again (GitHub, World Labs Atlas; Playwright plugin; context7 is not
   needed). Never claim anything transferred unless you tested it. My Marble World API key goes ONLY into the secure
   credential form (host `api.worldlabs.ai`, header `WLT-Api-Key`) — never chat, git or logs. No paid World Labs job
   without my approval (pilot budget US$5; 1,810 credits spent; balance 5,190 on 2026-11-16;
   `qa/worldlabs/05/pilot/LEDGER.md`). Everything already generated is in Git LFS — nothing needs re-buying.
