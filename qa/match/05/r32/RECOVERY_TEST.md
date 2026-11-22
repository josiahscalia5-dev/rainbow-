# Restart / recovery test — round 32 (2026-11-21 ~13:10–13:20 UTC, lead session `ccr-c0679182-krbfci`)

User order: "verify the GitHub autosave and recovery process works reliably after a restart."

## A. Fresh-account recovery from GitHub alone
1. `GIT_LFS_SKIP_SMUDGE=1 git clone --depth 1 --branch ccr-c0679182-krbfci https://github.com/josiahscalia5-dev/rainbow-` (commit `4850e31`, autosave 13:06 UTC)
   into an empty folder (what a new Claude account / new container gets), then `bash docs/briefs/2026-11-21-r32/setup_r32.sh <ws>`.
2. **BUG FOUND + FIXED:** the specialists' rebuilt 3D track pieces (`backups/wip/screen05-agents/**/*.ply`, 1–26 MB each) are Git LFS
   objects, but `setup_r32.sh` only downloaded the worlds and Benny. A fresh clone therefore copied **133-byte LFS pointer files** into the
   workspace instead of the track, and still printed "workspace ready" — the recovered level could not have loaded. Fix: `setup_r32.sh` now
   pulls `backups/wip/screen05-agents/**` (+ `qa/spaitial/05/echo2.spz`) from LFS and **refuses to report "ready" while any file in the
   workspace is still an LFS pointer** (it caught the second missing file, echo2.spz, on the next run).
3. After the fix: every specialist file saved at 13:06 came back **byte-identical** — controls specialist 56/56, water specialist 112/112
   (0 different, 0 missing; files they edited after 13:06 are newer than that save and were not compared).
4. The recovered, re-merged level played with the acceptance test's real touch swipes (logic run + frame 0 rendered): 0 errors,
   10/10 swipes correct, lanes −1/0/+1, leap +0.28 / dive −0.27, coins 1,420 → 1,590, camera pose logged every frame.
5. New since this test: `setup_r32.sh` also rebuilds the merged page (`tools/marble05/merge_r32.py`), links the acceptance tools and writes
   `backups/wip/screen05-agents/WORKSPACE`, so the five-minute autosave itself copies the new workspace's specialist work to GitHub
   (`scripts/rainbow-autosave.py` → `tools/marble05/sync_agents_wip.sh`; no separate loop that dies with a session).

## B. Five-minute autosave after a restart (process killed)
1. Killed the autosave daemon. **BUG FOUND + FIXED:** `scripts/autosave-status.py` still printed `AUTOSAVE OK … scheduler daemon`, because
   its `pgrep -f scripts/autosave-daemon.sh` matched its own `bash -c` command line. Now `pgrep -f 'scripts/autosave-[d]aemon.sh'`.
2. Re-test: daemon killed → `AUTOSAVE PROBLEM | scheduler NONE | no scheduler running` (correct) → the Stop hook (runs after every
   Claude turn; SessionStart does the same on a new session) → daemon re-armed (new pid) → `AUTOSAVE OK | scheduler daemon | local 4a03c34
   remote 4a03c34 (match) | uncommitted 0`.

## Limits (honest)
* A real NEW Claude account cannot be simulated from inside this session: the account login, GitHub connection, World Labs connector and
  network secrets (Marble / SpAItial keys) are account settings, not repository files (see `backups/START_NEW_CLAUDE_ACCOUNT.md`).
  On this account the SpAItial key is not present (free check: HTTP 401) — not needed unless the user approves a SpAItial job.
* Running specialists never survive a restart; they are relaunched from their saved notes + work (both did this round).
