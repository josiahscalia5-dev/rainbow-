# Round 27 — relaunch of four specialists (lead session branch `claude/rainbow-restore-screen-match-ijjdai`, new Claude account, 2026-11-20 from ~15:11 UTC)

Round 26 (lead `ccr-08ece3a6-xcwyls`) stopped at 13:57–14:03 UTC: the old account hit its 5-hour limit and all four workers died mid-step
(NOT a rejection). Its container kept autosaving until 15:03 (`e655f19`, merged here as `e2e1d12`). Every worktree was recreated by
`docs/briefs/2026-11-20-r26/setup_worker_r27.sh` (base commit + the 15:03 snapshot) on NEW LOCAL branches **`-c28`** (same paths and ports);
**tracked edits verified identical (patch-id) and every untracked file byte-identical** to each snapshot. Scratch folders of round 26
(`/home/user/scratch/*`, dev servers, combined builds, probe variants) are GONE — recreate only what is missing; everything under `qa/` survived.
Helper installs rebuilt: `/home/user/tools-pixelmatch/pixeldiff.mjs`, `/home/user/tools-threejs-devtools`, `/home/user/tools-spector`.

## Common (all workers) — read in this order
1. `/home/user/rainbow-/CLAUDE.md`.
2. **`docs/briefs/2026-11-20-r26/USER_VISUAL_BRIEF_R26.md`** — the user's detailed visual brief (binding; §2 moving views, §3 water, §4 scenery,
   §5 Benny, §6 your screen, §8 evidence). Plus `docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md`.
3. `docs/briefs/2026-11-20-r26/LAUNCH_R26.md` (Common rules + your section) — all its rules still apply (render slots, URL switches, proof format,
   verdict words, no git, no paid jobs, economical usage, at most 3 finished steps then stop and report).
4. The "(r26) WHERE I STOPPED / NEXT" block at the TOP of your PROGRESS.md (paths below). Add a "(r27) WHERE I STOPPED / NEXT" block ABOVE it
   and keep it current after every finished sub-step (the account can stop at any moment; the lead's autosave saves your worktree + qa every 5 min).
* The user's standing order (r26 brief §8): ORIGINAL APPROVED / BEFORE / NEW as separate full-size labelled pictures + an uninterrupted clip at
  1.0x first, then 0.5x; BEFORE and NEW under the same conditions. Never claim an unmeasured likeness percentage. Nothing is approved until the USER says so.
* Machine: 4 CPUs shared by four workers + the lead → EVERY heavy job through `bash /home/user/rainbow-/tools/lead25/render_slot.sh <cmd…>`.
  Temp files ONLY in `/home/user/scratch/<slug>/` (create it). Usage is limited: re-use existing evidence, don't re-render what exists.

| Worker | Agent | Worktree / LOCAL branch | Port(s) | Your PROGRESS.md (main repo `qa/`, the lead's autosave syncs it) |
|---|---|---|---|---|
| s07 | water-fx-specialist | `/home/user/wt/s07` `claude/rainbow-s07-match-c28` | 5277 (+5280/5281) | `qa/match/07/r24/PROGRESS.md` |
| s06 | path-camera-transition-engineer | `/home/user/wt/s06` `claude/rainbow-s06-match-c28` | 5276 (+5282/5283) | `qa/match/06/r25/PROGRESS.md` |
| s04 | washer-environment-modeler | `/home/user/wt/s04` `claude/rainbow-s04-match-c28` | 5273 (+5274) | `qa/match/04/r23/PROGRESS.md` |
| Benny | benny-character-artist | `/home/user/wt/benny` `claude/rainbow-benny-c28` | 5279 | `qa/benny/r23/PROGRESS.md` |
| s08 | — FINISHED (K23-3 = `qa/match/08/r23/QUERY_CANDIDATE_K23-3.txt`, unapproved) | `/home/user/wt/s08` `claude/rainbow-s08-scenery-c28` | — | read-only source for s07 |
| s05 | — queued (end section + hard-left; check right steering too) | `/home/user/wt/s05` `claude/rainbow-s05-match-c28` | 5275 | — |

Where to write qa files: the proof folders live in the MAIN repo `/home/user/rainbow-/qa/...` (as in r26) — write proofs and PROGRESS.md there,
code only in your worktree.

---

## s07 — Screen 07 — resume (r26 steps 1–3 all GOOD IMPROVEMENT, not approved)
Survived: `qa/match/07/r26/{s1_verdict,s2_look,s3_join}/` and the full NEW clip `qa/match/07/r26/final/SCREEN07_NEW_full_K23-3_{1x,0.5x}.mp4`
(+ `NEW_full_frames.json`). Lost: combined build `/home/user/scratch/s07/combo` (rebuild with `qa/match/07/r24/combo/mkcombo.py` from
`/home/user/wt/s08` READ-ONLY; hashes must match `combo/s08snap_SHA256SUMS_r25.txt`), `Q_FULL.txt`, `final.sh`, the gameplay run.
Steps: (1) gameplay 8/8 + 91 coins with the full candidate (step-1 & m07look & m07join & K23-3) → `qa/match/07/r26/final/gameplay_NEW_full.json`;
landmark stills BEFORE vs NEW (lip, bend apexes, inlet). (2) **The user's NEW foam clarification (r27, verbatim):** "Keep the outer-bank foam
present in the approved image. Match its soft, varied clusters and appropriate fullness. Refine bulky, uniformly packed banks and the overly
regular white bead-like lines between cyan water and pink edges. Check the newest candidate first so an already-corrected issue is not
repeated." Plus your own r26 small problem: inside-of-bend foam clouds overlapping Benny at the right steering limit (t 5.0 s). Behind a new
switch, proof + clip. (3) If time: coins crowding into a stacked column down the drop (keep 91 total, same route).

## s06 — Screen 06 — resume (the opening comparison is STILL OWED to the user)
Survived: `qa/match/06/r25/step1_hole/{CURRENT,NEW,NEW2,NEW3,COMPARE}/` + `CURRENT_opening_{1x,0.5x}.mp4` + `NEW3_opening_{1x,0.5x}.mp4`.
NEW3 query = the step-1 candidate with `&m06hole=2&m06fade=1&m06spl=1`. Lost: `chain_new3.sh`, NEW3 gameplay, `step2/` renders (`m06fcn=3`).
Steps: (1) gameplay 8/8 + 91 with NEW3, then WRITE the step-1 verdict and assemble the owed comparison per shot in
`qa/match/06/r25/step1_hole/COMPARE/<shot>/` as `1_ORIGINAL_APPROVED.png`, `2_WHAT_YOU_SAW.png`, `3_NEW.png` (full size) + the two opening
clips. (2) Foam height (user: "keep the foam at an appropriate height so the water and scenery remain visible") — `&m06fcn=3` BEFORE/NEW at
22/35/47/60/85 % + hard L/R. (3) Then the crest / winding river / curved coin trail (biggest visible difference first). Keep `m06view=1&m06vs=0`
as the user's unapproved camera candidate.

## s04 — Screen 04 — resume
Survived: `qa/match/04/r26/s0_five/` (`&m04a5=2`: exactly five chevrons, all crossed inside 04 — GOOD IMPROVEMENT; trade-off: all five gone by 1.2 s,
empty lane in the second half). Lost: step-1 variants V0..V5 and step-2 C1/C2 renders (`/home/user/scratch/s04/`).
Steps: (1) `&m04lgc=1` short curved crescent glints — finer variants (V1/V2 were right length but too fat / C-shaped "white confetti", V3 busier),
pick one, proof + verdict; (2) `&m04bbdc=1` far foam → soft cloud banks (not bead rows) + lower clean pink `m04ry` with the gold visible;
(3) consider the five-arrow trade-off (keep them readable longer / slide under him rather than vanish) — behind a switch; then gameplay 8/8 + 91
with the combined query, and one labelled whole-04 clip of the combined candidate (1.0x + 0.5x).

## Benny — resume (star step = GOOD IMPROVEMENT; silk proof rendered, verdict not written)
Survived: star proof + clips `qa/benny/r23/s3_star/`; silk `&b20silk=2` proof shots `qa/benny/r25/s4_silk/0N/new/` for 04–08 + `QUERY_*` +
`gameplay_silk.json`. Lost: the hat-crown probe sheet (ph04 / ph06m variants, `/home/user/scratch/benny/silk/`).
Steps: (1) check `gameplay_silk.json`, then the silk verdict (APPROVED / BEFORE = `qa/benny/r23/s3_star/0N/new/` / NEW crops at phone size +
one short swim clip 1.0x + 0.5x) — soft, fluffy, not grainy or spiky, colour unchanged dusty rose; (2) hat crown vs the approved taller beanie
(redo only the probe you need); (3) if time, 06 start star leaning amber vs approved lighter yellow. Do NOT scale Benny.
Best query so far `&benny20=1&b20expo=1&b20ppw=0.45&b20tuft=1&b20knit=1&b20star=1` (+ `&b20silk=2` pending) — not approved.
