# Round 7 (account 7) — SCREEN 08 SCENERY-IN-MOTION — one milestone, then stop

You are the SCREEN 08 SCENERY-IN-MOTION specialist (`washer-environment-modeler` role, `.claude/agents/`) of the user's
EXISTING Rainbow Android game. Do NOT restart, redesign, rebuild or discard anything. Lead = account-7 session on branch
`claude/rainbow-lead-c7` (started from the account-6 lead `ccr-4bd35b15-7z45t0` @ `dde3e9afd25cf3fb4ebff45359d3a72eb2f31363`).

## Your branch: `claude/rainbow-s08-scenery-c7`
Created by the lead at `claude/rainbow-s08-scenery-c6` @ `cf2e092b1ea0c63984d414b14c4bcdfeed8eec3b` (its newest tip).
Push ONLY this branch (`git push -u origin claude/rainbow-s08-scenery-c7`; never force). Never write `-c6`/`-c5` or older
branches, never merge or rebase anything, never open/merge/close PRs.

## Read first
1. `CLAUDE.md`; `docs/briefs/2026-11-17-r6/S08_SCENERY.md` (your full round-6 brief — still binding),
   `docs/briefs/2026-11-17-r6/USER_DECISIONS.md` + `COMMON_RULES.md` (from the lead branch:
   `git fetch origin claude/rainbow-lead-c7 && git show FETCH_HEAD:<file>`).
2. On your branch: `qa/match/08/scenery/STATUS.md` (your own round-6 state + "Exact next step"), `NOTES.md`,
   `SHARED_CHANGES.md`, `src/world/match08.ts`.

## The user's goal (2026-11-17, account 7)
≥ 8.5/10 visual likeness to the APPROVED picture `references/08_final_spin_chamber.png` **while Benny is swimming**, not
just at the frozen approved view. Keep the successful fixed-camera approved view unchanged and real 3D movement intact.
Report objective pixel numbers and your subjective moving rating as SEPARATE measures; be honest (the lead will check
your pictures). The user is tired of over-optimistic ratings.

## Milestone (one factor at a time, each behind its own `&m08…=1` sub-switch of `?match08=1`, default build untouched)
Base set: `B='match08=1&coins08px=1&m08bw=1&m08fill=1&m08arch=1&m08swim=1'` (`m08lane` stays OFF — the user rejected it).
1. Finish your saved next step: judge `&m08seam=1` (`m08seamk` 1.6 / 2.2) on `f10`/`t95`; keep only if the slot size
   matches the painted chamber wall.
2. Prove `m08swim` changes 0 px at the approved view (frozen `scripts/capture.mjs` method).
3. Remaining moving defects you can see in `node tools/lead_r6/motion_audit.mjs 08 <out> "$B…"` (duplicated river on
   steer shots, seams, gold fragments). Fix in geometry / world-anchored materials, not by hiding or by a flat image.
4. Proofs: `npx tsc --noEmit`; default build 0 px vs base; `?match08=1` changes nothing on 04–07 for the parts you own
   (list the rest in `SHARED_CHANGES.md`); `node scripts/gameplay-test.mjs` with `$B` = 8/8, 91 coins / 2,240;
   `npm run test:continuity` (07→08 drop ≈ 61 u).
5. Pictures (separate full-size portrait files, no collage): APPROVED = `references/08_final_spin_chamber.png`,
   BEFORE = `qa/match/08/scenery/r6/R1_restored/` (or re-render with the r6 base set), NEW = the 12-shot audit with your
   kept switches in `qa/match/08/scenery/r7/NEW/`.
6. Update `qa/match/08/scenery/STATUS.md` + `NOTES.md` (what changed, kept switches, numbers, honest moving rating,
   exact next step), commit, push, verify `git ls-remote origin refs/heads/claude/rainbow-s08-scenery-c7` == HEAD.
   Then STOP (usage safety: one milestone per session).

## Hard rules
No paid World Labs / fal.ai / video jobs (none approved). No coin-count or coin-rule change (91 / 2,240; `coins08px.json`
is lead-owned: measure and report only). Do not edit Benny files (Benny workstream) or the camera rig (camera workstream).
Do not touch the Screen 06 files (the lead is working on 06 in `claude/rainbow-s06-match-c7`). Never print secrets.
Run the autosave status `python3 -I scripts/autosave-status.py` at start and end; the five-minute autosave pushes your branch.
