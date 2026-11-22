# Frozen checkpoint — Screen 06 candidate v2 (round 30, 2026-11-20 22:09 UTC), before the user's "four approved views" brief
Base commit e162aec2bfdc631913c41daa435f9d449439af4f (on GitHub, branch claude/rainbow-s06-match-c23 history) + `tracked.patch` + `untracked/`.
Restore: `git worktree add --no-checkout -b <new-branch> <dir> e162aec2bf…; (sparse checkout as in docs/briefs/2026-11-20-r30/setup_r30_parallel.sh);
git -C <dir> read-tree -mu HEAD; git -C <dir> apply --binary tracked.patch; cp -r untracked/. <dir>/`. Queries: QUERY_NEW_v1.txt, QUERY_NEW_v2.txt.
Proof of this state: qa/match/06/r30/proof/ (v1) and qa/match/06/r30/proof_v2/ (v2).
