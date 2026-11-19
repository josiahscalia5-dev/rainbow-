# RAINBOW — common rules, round 3 (account 3, 2026-11-17 ~17:30 UTC)

**The round-2 rules stay binding word for word:** `docs/briefs/2026-11-17-r2/COMMON_RULES.md` (startup, git, visual goal,
protected behaviour, money and secrets, reporting, saving, pace). Read it first. Only these points change:

## What changed
* **Lead coordinator ("Lead Claudia") = session `session_01Q46SCLi5xPVn25aRuxkVwK`** ("Rainbow game restoration",
  account 3), branch **`ccr-c0235034-ks6sx3`** (started from the round-2 lead branch `ccr-5495e9c4-g0apvl` @ `7db2982`).
  Every `send_message` that the round-2 rules address to `session_01VCMXob2ipUeLE1o7yXNSsZ` goes to
  **`session_01Q46SCLi5xPVn25aRuxkVwK`** instead. Read these briefs with
  `git fetch origin ccr-c0235034-ks6sx3 && git show FETCH_HEAD:docs/briefs/2026-11-17-r3/<file>`.
* **Why `-c3` branches:** account 2 (round 2) ran out of usage at ~17:07–17:12 UTC. Its six sessions and their
  containers may still autosave to the `…-c2` branches, and they may wake when that account resets. Every round-3
  workstream continues on its OWN **`…-c3`** branch, created from the newest remote commit of its `…-c2` branch (which
  contains every earlier checkpoint). Push ONLY your `-c3` branch. If the `-c2` branch receives newer commits than the one
  you started from, tell the lead — never merge them.
* Record in your `STATUS.md` the exact commit you started from (`git rev-parse HEAD` at startup, before any change).
* The Screen 04 fal edit (request `01a1ea70-42d8-7943-b035-7bb5f129d872`, `qa/match/04/fal/`) is DONE. Reuse it. No fal,
  World Labs / Marble, Meshy or Rodin job of any kind in round 3 without the user's explicit OK through the lead.

## Startup check (in this order)
1. `git branch --show-current` must print your `-c3` branch; `git log -1` must show the `-c2` head named in your brief
   (or a newer `-c2` commit). If the branch is wrong, stop and tell the lead.
2. `git push -u origin <your -c3 branch>` once, then verify `git ls-remote origin refs/heads/<branch>` == `git rev-parse HEAD`
   and `python3 -I scripts/autosave-status.py` → `AUTOSAVE OK … (match)` on your `-c3` branch.
3. `sha256sum -c scripts/reference.sha256` → 13 OK. Never modify the 13 approved images.

## Pace (usage)
This account is shared by seven sessions. Work efficiently: one heavy render at a time, reuse existing tools, no
exploratory rewrites, at most one project-specialist subagent at a time. Commit + push at every verified sub-step. Finish
ONE milestone, push, verify, send the lead ONE short status (picture paths, numbers, commit SHA, open problems), then STOP
and wait. If the lead tells you to stop to save usage: update `STATUS.md`, commit, push, verify, stop.
