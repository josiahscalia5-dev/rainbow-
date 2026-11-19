# RAINBOW — common rules for every parallel workstream (round 2, account 2, 2026-11-17 ~16:35 UTC)

Lead coordinator ("Lead Claudia"): session `session_01VCMXob2ipUeLE1o7yXNSsZ` ("Rainbow Android game parallel
restoration"), branch `ccr-5495e9c4-g0apvl` (continuation of the lead branch `ccr-d4240b15-rl1i72`). It owns
integration, shared systems, credentials, paid-job gating and `docs/PARALLEL_PROGRESS.md`.

## Why continuation branches (`…-c2`)
The previous Claude account stopped at ~16:01 UTC ("5-hour limit, resets 8:20pm UTC"). Its sessions (lead
`session_01AvQv6UXiBngewM8kSBwFfZ`, 04 `…UQ9kzB2yfcESLZjUB`, 05 `…ShfugNq5opq6Bd1MX`, 06 `…SAwTuXwWRiSwgKaoH`,
07 `…SiGdDhWH1exHdH8xX`) may wake up after 20:20 UTC and their containers still autosave to the OLD branches. Every new
workstream therefore continues on its OWN continuation branch, created from the newest remote commit of its old branch
(which already contains every earlier checkpoint). Push ONLY your continuation branch. If the old branch receives newer
commits later, report it to the lead — never merge them.

## Startup
1. Follow `CLAUDE.md`. The SessionStart bootstrap already ran: `bash scripts/claude-bootstrap.sh --status` once; never
   reinstall a working tool, never run `playwright install`.
2. `git branch --show-current` must print your continuation branch. If not: `git fetch origin <old branch>` then
   `git checkout -b <continuation> FETCH_HEAD` (or, if the continuation already exists on origin,
   `git fetch origin <continuation> && git checkout -B <continuation> FETCH_HEAD`), then `git push -u origin <continuation>`.
   Verify `git ls-remote origin refs/heads/<continuation>` == `git rev-parse HEAD` and
   `python3 -I scripts/autosave-status.py` → AUTOSAVE OK on the continuation branch.
3. `sha256sum -c scripts/reference.sha256` → 13 OK. Never modify the 13 approved images.

## Git
Never merge, cherry-pick, force-push, reset, rebase or rewrite history; never push to another branch or to
`protected_branches` (`backups/autosave.config.json`). Line A (`ccr-9c4a8ad6-xovgsx`, `ccr-d4240b15-rl1i72`,
`ccr-5495e9c4-g0apvl`, the 04/06/07/08 branches) and line B (`ccr-b0757dec-dj6l1o`, the 05 branches) are never mixed;
`codex/*` never. Reading another branch with `git show <ref>:<path>` is fine; adapted copies go into YOUR folders and are
listed in your NOTES.

## Visual goal (the user's words: "my ORIGINAL APPROVED SCREENS are the source of truth")
Match the approved picture in REAL playable 3D, also while moving: scenery and background, framing and perspective,
washer architecture, metal and gold rings, blue/pink water, foam/bubbles/splashes, colours, lighting, highlights,
reflections, Benny's look and position, coins, HUD. Method = Screen 08's (`qa/match/08/NOTES.md`): camera solve at the
game FOV → real 3D geometry fitted to the picture → the user's ORIGINAL pixels camera-projected (post-chain inverse) →
unseen surfaces from tiles cut from the artwork + stretch guard → river along the painted water → the picture's coins at
the painted spots as real pickups. Never paste the approved image over the screen; no Marble scenery for gameplay
views; one factor at a time, keep only what is measurably or visibly closer.

## Protected behaviour (proofs required at your milestone)
* Default build 0 px different (captures with no switch), and Screen 08 under `?match08=1` 0 px different unless you
  are a Screen 08 specialist. Line A: `?ringa=26&nearfloor05=0` vs `qa/pilot05/wave9/baseline/05.png` 0 px.
* Gameplay `node scripts/gameplay-test.mjs` 8/8 with and without your switch; coin total exactly **91 coins / 2,240**;
  continuity test (07→08 drop) unchanged; `npx tsc --noEmit -p .` clean. Never change gameplay mechanics to get a
  better screenshot.
* Shared systems — Benny `src/characters/benny/*` + `assets/textures/benny0*/` (Screen 08 Benny specialist ONLY), HUD
  `src/ui/*`, gameplay rules, camera `cameraRig.ts` / `match.ts`, `course.ts`, `Game.ts`, `src/gameplay/coins.ts`:
  only minimal, additive edits that run ONLY under your own switch, each listed in your `SHARED_CHANGES.md`. The lead
  integrates shared code only after checking conflicts and after the user approves.

## Money and secrets
No paid job (World Labs / Marble, fal.ai, Meshy, Rodin, …) unless your brief explicitly allows one AND the lead has sent
you the go message. Never request credentials yourself, never print, log or commit a key.

## Reporting (visual terms — the user does not want camera/movement jargon)
* APPROVED | BEFORE | NEW as SEPARATE full-size pictures (no grid as the main result) + numbers from
  `tools/qa/screen_match.py` (whole frame, scenery without HUD/Benny, bands, SSIM — pixel statistics, never invented
  "fidelity scores") + moving-camera frames (forward 3/6/10/15/20 u, steering left/right). A high fixed-view number alone
  does not approve the moving 3D screen.
* `STATUS.md` in your folder with exactly these fields: Assigned screen · Assigned specialist · Working branch ·
  Running-session status · Latest verified commit · Completed improvements · Latest visual measurements · Unfinished
  problems · Test results · Next task · Approval status ("in development" or "under review" — NEVER "approved"; only the
  user approves).
* Android: if the milestone result is closer, build ONE debug APK with your switch
  (`VITE_RAINBOW_Q05="<switch>" npm run android:debug`, copy to `builds/rainbow-debug-<screen>-2026-11-17-r2.apk`,
  Git LFS) and say plainly that it is NOT phone-tested (no device in the cloud).

## Saving
The five-minute autosave pushes your continuation branch. Also commit + push at each milestone with a clear message and
verify `git ls-remote origin refs/heads/<continuation>` == HEAD (Git LFS for binaries).

## Pace (this account is already near its weekly usage limit; six sessions share it)
Work efficiently: one heavy render at a time, reuse existing tools, no exploratory rewrites, at most one project
specialist subagent (`.claude/agents/`) at a time inside your session. Do exactly ONE milestone, then: push, verify, send
the lead ONE short status with `send_message` (session_id `session_01VCMXob2ipUeLE1o7yXNSsZ`: picture paths, numbers,
commit SHA, open problems), and STOP and wait for the lead. If the usage limit stops you, your autosave keeps your work —
do not retry in a loop.
