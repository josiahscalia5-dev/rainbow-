# Round 22 launch — Screen 06 (cloud session; roles `path-camera-transition-engineer` + `reference-match-director`)

Your full brief is `docs/briefs/2026-11-20-r21/S06_R21.md` (user decision verbatim, rules, tasks, proof). THIS file overrides only what changed:

* You start on **`claude/rainbow-s06-match-c23`**, created from `claude/rainbow-s06-match-c22` @ `c7cac38` (02:50 UTC). Push ONLY
  your own branch; keep your session's five-minute autosave running (CLAUDE.md §2). Never merge / rebase / force-push; never write
  any other branch.
* **Do NOT re-apply the r18 WIP patch** — it is already in `src/world/match06.ts` at `c7cac38`. `tools/lead21/audit_screen.mjs` is
  already on the branch.
* Where the previous 06 session stopped (it never wrote PROGRESS.md; reconstructed by the lead from its transcript
  `backups/claude-sessions/84d7059c-5d5b-59cc-a486-4b20ba5b09b1/transcript.md` on your branch): task 1 `&m06view=1` is BUILT and tuned
  (`src/game/cameraRig.ts`: `M06_VW` default 20,38 hold → hand-over, `M06_VX` default 0.85 max route x; `src/world/match06.ts`);
  BEFORE (K6) and NEW (K6 + `m06view=1`) shots are in `qa/match/06/r21/step1_m06view/{BEFORE,NEW}/` (+ `1_APPROVED.png`). It was
  recording the uninterrupted swim clip (`tools/lead_r13/swim_clip.mjs 06 … "K6&m06view=1"`) when it stopped. NOT YET PROVEN.
* Rebuild the pixel tool if missing (`/home/user/tools-pixelmatch/`, see the brief).

## Next
1. Finish task 1 proof: re-render NEW with the current defaults (to `qa/match/06/r22/step1_m06view/`), start-view 0 px, swim clip
   (straight / left / right, through the whole of 06 into 07) → mp4, `node scripts/gameplay-test.mjs --q="K6&m06view=1"` → 8/8 + 91
   coins, `npm run test:continuity` OK; write `qa/match/06/r22/PROGRESS.md` (start with "(r22) WHERE I STOPPED / NEXT") with a 3–5 line
   verdict in plain visual words (GOOD IMPROVEMENT / NOT AN IMPROVEMENT / NOT YET PROVEN). The user decides whether to keep it.
2. Then r21 tasks 2 (rank-3 start-view flash at +1.1 u) and 3 (big white foam walls → low puffy foam clouds in the lower corners), with
   and without `m06view`.
After each finished step: commit + push your branch, then `send_message` to the lead session **`session_0179kWgNJzw5v4674DNtMpda`**
(step + switch, commit SHA, verdict, folder, next). Continue without waiting. Up to 3 finished steps, then report and stop.
