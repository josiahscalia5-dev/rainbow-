# RAINBOW — common rules, round 4 (account 4, 2026-11-17 ~18:35 UTC)

**The round-3 and round-2 rules stay binding word for word:** `docs/briefs/2026-11-17-r3/COMMON_RULES.md` and
`docs/briefs/2026-11-17-r2/COMMON_RULES.md` (startup, git, visual goal, protected behaviour, money and secrets,
reporting, saving, pace). Read both first. Only these points change:

## What changed
* **Lead coordinator ("Lead Claudia") = session `session_01Kbt6BTTnCGMUULjZoCLDTo`** ("Rainbow game restoration",
  account 4), branch **`ccr-067047f0-up5d1m`** (started from the round-3 lead branch `ccr-c0235034-ks6sx3` @ `ed23f9e5`).
  Every `send_message` that older rules address to an earlier lead goes to **`session_01Kbt6BTTnCGMUULjZoCLDTo`**.
  Read these briefs with `git fetch origin ccr-067047f0-up5d1m && git show FETCH_HEAD:docs/briefs/2026-11-17-r4/<file>`.
* **Why `-c4` branches:** account 3 (round 3) ran out of usage at ~18:13 UTC. Its sessions' containers may keep
  autosaving to the `…-c3` branches, and they may wake when that account resets. Every round-4 workstream continues on
  its OWN **`…-c4`** branch, created by the lead from the newest remote `-c3` commit (mapping below). Push ONLY your
  `-c4` branch. If the `-c3` branch receives newer commits than your start commit, tell the lead — never merge them.
* Record in your `STATUS.md` the exact commit you started from (`git rev-parse HEAD` at startup, before any change).
* Keys: the World Labs and fal.ai keys were re-entered by the user (secure form, 18:27 / 18:31 UTC) as network
  secrets of this account's `rainbow-` environment. Free reads verified the SAME accounts: World Labs 5,420 credits
  (Screen 08 world `32b5b2f4…` reads back 200); fal request `01a1ea70` (Screen 04, DONE) reads back COMPLETED.
  **No paid job of any kind** (fal, World Labs / Marble, Meshy, Rodin, video) without the user's explicit OK through
  the lead. The Screen 06 and 07 fal clean plates are PREPARED, NOT approved, NOT run.

## Branch mapping (old → new; created by the lead, nothing merged or overwritten)
| Workstream | Old branch @ newest commit (18:29 UTC) | New branch |
|---|---|---|
| Lead | `ccr-c0235034-ks6sx3` @ `ed23f9e5` | `ccr-067047f0-up5d1m` |
| 04 | `claude/rainbow-s04-match-c3` @ `d1e422fa` | `claude/rainbow-s04-match-c4` |
| 05 (line B) | `claude/rainbow-s05-match-c3` @ `ebaf6cac` | `claude/rainbow-s05-match-c4` |
| 06 | `claude/rainbow-s06-match-c3` @ `c088718b` | `claude/rainbow-s06-match-c4` |
| 07 | `claude/rainbow-s07-match-c3` @ `72fb6129` | `claude/rainbow-s07-match-c4` |
| 08 Benny | `claude/rainbow-s08-benny08-bake-c3` @ `c64ff28b` | `claude/rainbow-s08-benny08-bake-c4` |
| 08 camera | `claude/rainbow-s08-camclear-c3` @ `c03f391c` | `claude/rainbow-s08-camclear-c4` |

## Startup check (in this order)
1. `git branch --show-current` must print your `-c4` branch; `git log -1` must show the commit in the table above.
   If not, stop and tell the lead.
2. `git push -u origin <your -c4 branch>` once, then verify `git ls-remote origin refs/heads/<branch>` ==
   `git rev-parse HEAD` and `python3 -I scripts/autosave-status.py` → `AUTOSAVE OK … (match)` on your `-c4` branch.
3. `sha256sum -c scripts/reference.sha256` → 13 OK. Never modify the 13 approved images.

## Pace (usage) — the user's rule
Three earlier accounts ran out of usage running six sessions at once. Work lean: one heavy render at a time, reuse
the existing tools, no exploratory rewrites, no project-specialist subagents unless the lead asks. Commit + push at
every verified sub-step. Finish ONE milestone, push, verify, send the lead ONE short status (full-size picture paths,
numbers, commit SHA, open problems — in VISUAL terms, the user does not want camera/movement jargon), then STOP and
wait. If the lead tells you to stop to save usage: update `STATUS.md`, commit, push, verify, stop.

## Pictures for the user
Every milestone: separate, large, full-size portrait files **1 APPROVED ORIGINAL**, **2 BEFORE**, **3 NEW PLAYABLE
3D** (no collages, no tiny grids) + separately saved moving frames (forward, steering left, steering right,
junctions). Report region numbers honestly (Benny vs scenery vs whole frame). A pixel score is not a quality
guarantee; nothing is approved until the user says so.
