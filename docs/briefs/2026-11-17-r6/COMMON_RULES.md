# RAINBOW — common rules, round 6 (account 6, 2026-11-17 ~22:20 UTC)

**The r5, r4, r3 and r2 rules stay binding word for word** (`docs/briefs/2026-11-17-r5/COMMON_RULES.md`,
`docs/briefs/2026-11-17-r5/USER_DECISIONS.md`, `docs/briefs/2026-11-17-r4/COMMON_RULES.md`,
`docs/briefs/2026-11-17-r4/USER_DECISIONS.md`, r3, r2). Read them first. Only these points change:

## What changed
* **Lead coordinator ("Lead Claudia") = session `session_01VCMXoaUqBCxDq8BntT19BU`**, branch **`ccr-4bd35b15-7z45t0`**
  (started from the round-5 lead `ccr-f983b317-2vt0zh` @ `cbc571356d261144c2ac3b4092de4fc4a9d5ffe6`, its newest commit).
  Every `send_message` that older rules address to an earlier lead goes to **`session_01VCMXoaUqBCxDq8BntT19BU`**. Read the
  r6 briefs with `git fetch origin ccr-4bd35b15-7z45t0 && git show FETCH_HEAD:docs/briefs/2026-11-17-r6/<file>`.
* **Why `-c6` branches:** account 5 ran out of usage. Its sessions may still autosave transcripts to the `-c5` branches.
  Every round-6 workstream continues on its OWN `-c6` branch, created by the lead at the newest `-c5` commit. Push ONLY
  your `-c6` branch; never write `-c5` or older. If a `-c5` branch later gets commits that change game files (not only
  `backups/` transcripts/logs), tell the lead — never merge them.
* **Keys (checked 21:55 UTC with free reads only):** World Labs key on this environment = the user's ORIGINAL Screen 08
  account (5,420 credits; world `32b5b2f4…` reads 200; the Screen 05 pilot worlds read 404). fal.ai = the user's SAME paid
  account (old request `01a1ea70` → COMPLETED). **No paid job of any kind** (fal, World Labs / Marble, Meshy, Rodin,
  video) without the user's explicit OK through the lead. Reuse files already in git (`qa/match/0*/fal/`, `qa/worldlabs/`).

## The user's round-6 order (2026-11-17 ~21:45 UTC, full text in `USER_DECISIONS.md` of this folder)
* Minimum **8.5/10 visual quality THROUGHOUT GAMEPLAY**, ideally 9–9.5 — not only in the still approved view.
  "A 98 % fixed-camera colour match does not mean the whole playable screen is 98 % visually accurate."
* Fix what breaks while Benny swims forward or turns: stretched / smeared water, repeated or mirrored scenery, jagged
  seams, duplicated river surfaces, flat-looking water, gold rings or walls blocking the camera, wrong tunnel curvature,
  missing scenery, floating / overlapping geometry, camera clipping, inconsistent lighting, misplaced foam / bubbles.
* **Not** by putting a flat picture in front of the camera: real fitted 3D geometry, UV-mapped / world-anchored textures,
  depth-aware materials, camera-consistent projection, and matching textures for surfaces that become visible while moving.
* No redesign, no invented decorations, approved originals unchanged, nothing approved until the user says so.

## One moving-gameplay QA method for every screen (use it; the lead's audit used exactly this)
`node tools/lead_r6/motion_audit.mjs <screen> <outDir> '<your switches>'` (run from your checkout; copy the file from the
lead branch if your branch lacks it). Shots: approved view, forward 3 / 6 / 10 / 20 u, steer left / right, hard left /
right, and 33 / 66 / 95 % through the rest of the stage. Its first frame is NOT exact (two real frames run) — prove the
approved view with the frozen `node scripts/capture.mjs <screen> --q=… --out=…` only. Lead's BEFORE frames for your
screen: `qa/lead_r6/2026-11-17/audit/<screen>/`.

## Report in VISUAL terms, honestly
Every milestone: separate full-size **1 APPROVED · 2 BEFORE · 3 NEW** at the approved view + separately saved BEFORE / NEW
moving frames (all 12 audit shots). Numbers: scenery-only, Benny+effects, whole frame (`tools/qa/screen_match.py`). Give
your own **honest 1–10 visual rating for the approved view AND for the moving ride** and say which defects remain. A
pixel score is not a quality guarantee.

## Pace (usage) — unchanged
At most TWO specialist sessions at once. Work lean: one heavy render at a time, no subagents, no exploratory rewrites.
Commit + push at every verified sub-step. Finish ONE milestone, push, verify `git ls-remote` == HEAD, send the lead ONE
short status (picture paths, numbers, SHA, remaining defects), then STOP.
