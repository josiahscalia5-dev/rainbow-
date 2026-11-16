# Paste this into Claude Code on the next Claude account

Start a Claude Code cloud session on repository `josiahscalia5-dev/rainbow-` (pick branch `ccr-937c7fbb-htsrgt`
if the app lets you choose), then paste:

> Continue my EXISTING Rainbow 3D Android game. Do NOT start over and do not delete anything.
>
> Repository `josiahscalia5-dev/rainbow-`. Newest saved work: branch `ccr-937c7fbb-htsrgt`, plus anything newer
> on `ccr-4f6c3e0e-5kxgr0` (two sessions were saving in parallel). The GitHub default branch is an OLD version.
> 1. In the repo folder run:
>    `git fetch origin ccr-937c7fbb-htsrgt && git show FETCH_HEAD:scripts/resume-newest-work.sh > /tmp/r.sh && bash /tmp/r.sh --tools`
>    It merges every newer `ccr-*`/`claude/*` branch, restores Git LFS (24 files incl. Marble splats/PLY/collider
>    GLBs/.blend), checks the 12 references, the 10 agents, tsc and continuity, and installs Blender 5.3, Android
>    SDK 34 and the World Labs plugin. It never resets or force-pushes. Push your session branch; protect
>    `ccr-937c7fbb-htsrgt` and point `backups/autosave.config.json` at your branch.
> 2. Read `CLAUDE.md`, then `backups/CLAUDE_ACCOUNT_TRANSFER.md` (§0 first) and `backups/AGENTS_STATUS.md`.
> 3. Keep all ten specialists in `.claude/agents/` (do not recreate them); relaunch the unfinished ones listed in
>    the guide §3 (path-camera-transition-engineer next; wave-7 water, foam and environment are DONE).
> 4. Run `node scripts/gameplay-test.mjs` and `python3 -I scripts/autosave-status.py`; keep the verified
>    five-minute GitHub autosave running on your session branch; run the status check after every major task.
> 5. Tell me which connectors I must sign in to again (GitHub, World Labs Atlas, Playwright, context7). Never
>    claim anything transferred unless you tested it. My Marble World API key goes ONLY into the secure
>    credential form (host `api.worldlabs.ai`, header `WLT-Api-Key`) — never chat, git or logs. No paid World Labs
>    job without my approval (pilot budget US$5; 1,810 credits spent; `qa/worldlabs/05/pilot/LEDGER.md`).
> 6. Use the Marble results in `qa/worldlabs/05/pilot/{draft,full}/` as Screen 05 references only — my approved
>    `references/05_flow_into_the_current.png` always wins.
> 7. Give me a short recovery report, then resume at "§12 Exact next tasks": Screen 05 toward my approved image,
>    keeping the locked camera, S-curve, Benny, gameplay, the 05→06 join and the deep 07→08 descent.
