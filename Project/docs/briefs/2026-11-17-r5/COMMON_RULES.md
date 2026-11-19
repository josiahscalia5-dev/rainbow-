# RAINBOW — common rules, round 5 (account 5, 2026-11-17 ~20:20 UTC)

**The round-4, round-3 and round-2 rules stay binding word for word:** `docs/briefs/2026-11-17-r4/COMMON_RULES.md`,
`docs/briefs/2026-11-17-r4/USER_DECISIONS.md`, `docs/briefs/2026-11-17-r3/COMMON_RULES.md` and
`docs/briefs/2026-11-17-r2/COMMON_RULES.md`. Read them first. Only these points change:

## What changed
* **Lead coordinator ("Lead Claudia") = session `session_013VHsJ9SbWPe9YXRvtUSngc`** ("Rainbow game restoration",
  account 5), branch **`ccr-f983b317-2vt0zh`** (started from the round-4 lead branch `ccr-067047f0-up5d1m` @ `ffa54f9f`,
  its newest commit). Every `send_message` that older rules address to an earlier lead goes to
  **`session_013VHsJ9SbWPe9YXRvtUSngc`**. Read these briefs with
  `git fetch origin ccr-f983b317-2vt0zh && git show FETCH_HEAD:docs/briefs/2026-11-17-r5/<file>`.
* **Why `-c5` branches:** account 4 ran out of usage at ~19:45 UTC. Its idle sessions can still wake (scheduled
  check-ins, PR events) and autosave transcripts to the `-c4` branches (the Benny session did at 20:12 UTC). Every
  round-5 workstream continues on its OWN **`-c5`** branch, created by the lead at the newest `-c4` commit (table
  below). Push ONLY your `-c5` branch. If the `-c4` branch later receives commits that change game files (not only
  `backups/` transcripts/logs), tell the lead — never merge them.
* Record in your `STATUS.md` the exact commit you started from (`git rev-parse HEAD` at startup, before any change).
* **Keys (account 5, checked 20:05 UTC with free reads only):** this account's `rainbow-` environment holds a World Labs
  key that authenticates (5,190 credits) but belongs to the user's OTHER World Labs account (the one that made the
  Screen 05 pilot worlds `5fd3d7a7…` / `c0c9dc57…`); the Screen 08 world `32b5b2f4…` reads 404 with it. fal.ai is NOT
  connected (no key; `queue.fal.run` not in the network allowlist). None of this blocks round 5: **no paid job of any
  kind** (fal, World Labs / Marble, Meshy, Rodin, video) without the user's explicit OK through the lead. Reuse the
  files already in git (fal plates in `qa/match/0*/fal/`, Marble files under `qa/worldlabs/`).

## Branch mapping (old → new; created by the lead 20:15–20:18 UTC, nothing merged or overwritten)
| Workstream | Old branch @ newest commit | New branch |
|---|---|---|
| Lead | `ccr-067047f0-up5d1m` @ `ffa54f9f` | `ccr-f983b317-2vt0zh` |
| 08 scenery in motion | `claude/rainbow-s08-scenery-c4` @ `5ce044a5` | `claude/rainbow-s08-scenery-c5` |
| 08 Benny | `claude/rainbow-s08-benny08-bake-c4` @ `fb72cc50` | `claude/rainbow-s08-benny08-bake-c5` |
| 08 camera | `claude/rainbow-s08-camclear-c4` @ `18687513` | `claude/rainbow-s08-camclear-c5` |
| 07 | `claude/rainbow-s07-match-c4` @ `835a72db` | `claude/rainbow-s07-match-c5` |
| 06 | `claude/rainbow-s06-match-c4` @ `c088718b` | `claude/rainbow-s06-match-c5` |
| 05 (line B) | `claude/rainbow-s05-match-c4` @ `ebaf6cac` | `claude/rainbow-s05-match-c5` |
| 04 | `claude/rainbow-s04-match-c4` @ `d1e422fa` | `claude/rainbow-s04-match-c5` |

Workstreams without their own r5 brief (camera, 07, 06, 05, 04) use their r4 brief in `docs/briefs/2026-11-17-r4/`
with `-c4` → `-c5` and the lead id/branch above; the next milestone for each is in the TOP section of
`docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md`.

## Startup check (in this order)
1. `git branch --show-current` must print your `-c5` branch; `git log -1` must show the commit in the table above
   (or a newer autosave of your own session). If not, stop and tell the lead.
2. `git push -u origin <your -c5 branch>` once, then verify `git ls-remote origin refs/heads/<branch>` ==
   `git rev-parse HEAD` and `python3 -I scripts/autosave-status.py` → `AUTOSAVE OK … (match)` on your `-c5` branch.
3. `sha256sum -c scripts/reference.sha256` → 13 OK. Never modify the 13 approved images.

## Pace (usage) — the user's rule
Four accounts have now run out of usage. At most TWO specialist sessions run at once. Work lean: one heavy render at a
time, reuse existing tools, no exploratory rewrites, no subagents. Commit + push at every verified sub-step (the
5-minute autosave also runs). Finish ONE milestone, push, verify remote == HEAD, send the lead ONE short status
(full-size picture paths, numbers, commit SHA, open problems — in VISUAL terms), then STOP and wait.

## Pictures for the user
Every milestone: separate, large, full-size portrait files **1 APPROVED ORIGINAL**, **2 BEFORE**, **3 NEW PLAYABLE 3D**
(no collages, no tiny grids) + separately saved moving frames (checkpoint, forward 3 / 6 / 10 / 20 u, steering left,
steering right). Report region numbers honestly (Benny vs scenery vs whole frame). A pixel score is not a quality
guarantee; nothing is approved until the user says so. Never paste the approved image over the screen.
