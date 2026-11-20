# Round 22 launch — Benny (cloud session; role `benny-character-artist`)

Your full brief is `docs/briefs/2026-11-20-r21/BENNY_R21.md` (user orders, target, tasks, proof). THIS file overrides only what changed:

* You start on **`claude/rainbow-benny-c23`**, created from `claude/rainbow-benny-c22` @ `70d3b83b`. Push ONLY your own branch; keep
  your session's five-minute autosave running (CLAUDE.md §2). Never merge / rebase / force-push; never write any other branch.
* The round-20 unfinished edits are ALREADY restored and committed on your branch (`benny20.ts`, `fur.ts`, `furstat.py`, `knit.py`,
  `tools/lead21/audit_screen.mjs`) — do NOT apply `backups/wip/claude__rainbow-benny-c21/tracked.patch` again.
* Resume exactly from "(r21) WHERE I STOPPED / NEXT" at the top of `qa/benny/r21/PROGRESS.md`: typecheck the `uPile` code, re-run
  `knit.py` (scipy), then task 1 shots on 04–08 BEFORE (`bade594` = r20 step 1) vs NEW. Each screen's kept query:
  `git fetch --depth=5 origin ccr-4742c19f-ez2mrs && git show FETCH_HEAD:qa/review_r21/audit/QUERY_0N.txt` (N = 4..8); if a screen's
  code is not on your branch, use that screen's default build for the Benny proof and say so.
* Write round-22 proof to `qa/benny/r22/<step>/` and `qa/benny/r22/PROGRESS.md` (start it with "(r22) WHERE I STOPPED / NEXT").

After each finished step: commit + push your branch, then `send_message` to the lead session **`session_0179kWgNJzw5v4674DNtMpda`**
(step + switch, commit SHA, verdict, folder, next). Continue without waiting. Up to 3 finished steps, then report and stop.
