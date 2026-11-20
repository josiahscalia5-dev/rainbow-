# Round 22 → next account: where everything stopped (2026-11-20 ~04:00 UTC) — HANDOFF

Lead session `session_0179kWgNJzw5v4674DNtMpda`, branch **`ccr-4742c19f-ez2mrs`** (start the next account's session on THIS
branch). Round 22 = the restore on the new account + four specialists. Nothing was merged into any other branch.
Chat history of this round: `backups/claude-sessions/2d0a4d78-4dbc-50ba-8522-05ed53372fe2/` (transcript + `subagents/`).
Worker map + results log: `docs/briefs/2026-11-20-r22/COORDINATION.md`. Earlier round: `docs/briefs/2026-11-20-r21/RESUME_R21.md`.

## User decisions / authorizations (binding)
* Carried forward (user restated at the start of r22, ~03:05): paid artwork + paid credits whenever they help (report jobs + cost),
  up to FOUR specialists at once, camera-framing TESTS for 06 + 07 (show gameplay before keeping), Screen 08 polish resumed,
  approved Benny on all five screens. Goal: all five playable screens 04–08 look like the approved pictures WHILE Benny swims
  (8.5–9/10), real playable Android game; ORIGINAL APPROVED / BEFORE / NEW + uninterrupted clips; the user's eye decides.
* **~03:42 USER APPROVED the three Screen 04 generated views** ("Yes, approve the Screen 04 proposals, keep going") →
  `qa/review_r21/artwork/04/USER_VERDICT.md`, `accepted/04_gen_{c_middle_p2_v1,d_late_p3_v1,e_end_p2_v1}.png`.
* **~03:58 USER FEEDBACK on Screen 04 (verbatim, top priority):** "when he goes through the water ... he's not going through it
  naturally, the pink character. And ... the pink part where he goes inside the tunnel, through the 5 arrows, there's like pink on the
  left and right side, kind of near the gold part ... I don't want the water to look messy. I want it to look very clean. That's the
  whole point ... like the original approved screen through the 5 arrows, I want it to get more feel like he's going through the
  5 arrows, like he's going naturally." The user asked whether the clip was sped up: NO — clips are real game speed (Screen 04 lasts
  ≈ 2.4 s; the clip squeezes straight / left / right / straight into it).
  Lead diagnosis (clip frames): inside the tunnel the pink water-climb (`m04wup` + `m04wgl` ribbons) rises as tall wavy magenta WALLS on
  both sides, covering the bottom of the gold rings and squeezing the cyan river into a narrow lane; chevrons at Benny's hat height.
  Painting: WIDE clean glossy cyan river, pink as neat swirl bands lying ON the water / low banks, low bubbly foam at the edges, CLEAN
  gold down to the waterline, Benny sitting IN the water (neat splash ring + V wake), the five chevrons clearly ahead of him.
  NEXT (first thing): render K22-2 with `m04wup=0` (pink climb off) vs K22-2 at start / early / middle / late with the pinned tool
  (`qa/match/04/r22/tools/audit_pinned.mjs`) — the lead had started exactly this when the user interrupted (nothing rendered yet) —
  then make the projection (below) deliver the clean look; show APPROVED / BEFORE / NEW + a clip, and a half-speed clip if useful.
* ~04:00 the user stopped the two in-process specialists (s07, s04 projection) and asked to save EVERYTHING for the account switch.

## Pending user verdicts
* Screen 07 generated views `qa/review_r21/artwork/07/FOR_APPROVAL_07_{d_late,e_end}.png` (swatch method; geometry kept; flatter /
  less glossy than the painting; end keeps two white foam columns).
* Screen 05 generated views `qa/review_r21/artwork/05/FOR_APPROVAL_05_{d_late,e_end}.png` (crisp instead of smeared end walls; does not
  add the painting's many close gold rings — a scenery task).
* Screen 06 framing test `&m06view=1` (clips `qa/review_r22/s06_t1/swim_06_{BEFORE,NEW}.mp4`; lead + worker: NOT YET PROVEN).

## Paid artwork ledger — `qa/review_r21/artwork/LEDGER.md`: 11 jobs, $1.32 (r21 5 × $0.12; r22 6 × $0.12: 07 ×4, 05 ×2).
Method that keeps the game's geometry: IMAGE 1 = clean game frame (`tools/lead21/clean_frame.mjs`), IMAGES 2.. = small material swatches
cut from the original (never the whole original — the model copies its layout). Sheets: `tools/lead22/approval_sheet.py`.

## Workers — where each stopped and how to resume
| Worker | State | Code | Next |
|---|---|---|---|
| s04 foam (foam-bubbles-particles) | STOPPED (lead asked) after step 2 `m04bbd` 3D foam heaps (worker GOOD; lead: small improvement, patchy) | K22-2 = `qa/match/04/r22/s2_bbd/QUERY_K22-2.txt`; code `qa/match/04/r22/s2_bbd/code.patch` (base `34cb4941`); unfinished `m04a3sc` (chevrons vs hat) `qa/match/04/r22/s3_unfinished/` | — (projection took over the worktree) |
| s04 projection (washer-environment-modeler) | STOPPED by the user during step 0 (plate cameras); NO code changes yet (worktree == K22-2) | camera work `qa/match/04/r22_proj/{s0_cams,tools}/`, log `qa/match/04/r22_proj/PROGRESS.md` | relaunch with `LAUNCH_S04_PROJ.md` (+ its Hand-over section) and the user's 03:58 feedback FIRST |
| s07 (water-fx-specialist) | STOPPED by the user after step 1 `&m07cloud=1` puffy 3D foam clouds (worker: GOOD IMPROVEMENT; **lead has NOT reviewed it yet**) | base `8accdad0` + `backups/wip/claude__rainbow-s07-match-c23/` (or `qa/match/07/r22/s1_cloud/code.patch`); candidate `K7&m07end=1&m07cloud=1` | lead review of `qa/match/07/r22/s1_cloud/`, then step 2 hard left / right magenta sheet — **already STARTED, untested: `&m07satin=1`** (crisp lens-shaped satin streaks on the magenta bands, in the WIP snapshot = worktree at stop; `s1_cloud/code.patch` = step 1 only) — then step 3 the middle (`m07view` test) — `LAUNCH_S07.md` |
| s06 (cloud session `session_0179kWgNZhiYHyDdV12Eaw6e`) | step 1 `m06view` NOT YET PROVEN (shown to the user); step 2 `&m06st=1` start-view flash fix @ `f7b3b22` (worker: small GOOD, lead review pending); asked to do task 3 (foam walls → low puffy clouds) next; may still be running on the OLD account | pushes `claude/rainbow-s06-match-c23` (fetch the tip) | its `qa/match/06/r22/PROGRESS.md` top block |
| Benny (cloud session `session_0179kWgM7wtBDT3n5KLuLz7o`) | r22: plush pile (shape closer, fur flat velvet), exposure GOOD (colour), pompom `b20ppw=0.45` GOOD, knit NOT YET; round-23 batch: step 1 `&b20tuft=1` @ `b9c91d0` (worker GOOD partial, lead review pending), next cream stripes, felt star; may still be running on the OLD account | pushes `claude/rainbow-benny-c23`; best `&benny20=1&b20expo=1&b20ppw=0.45` | its `qa/benny/r23/PROGRESS.md` (or r22) top block |
| s08 polish / s05 polish | QUEUED | `claude/rainbow-s08-scenery-c17` @ `3c0fa970`; `claude/rainbow-s05-match-c19` @ `eb7233e3` | coins size / `m08gl` / towel double; end of 05 + hard left (+ the close gold rings) |

## How to resume on the next account (step by step)
1. Start a Claude Code cloud session on `josiahscalia5-dev/rainbow-`, branch **`ccr-4742c19f-ez2mrs`**. The SessionStart bootstrap runs;
   check `python3 -I scripts/autosave-status.py` → AUTOSAVE OK, LFS (89+ files) restored. Reconnect (user, claude.ai): GitHub + Claude
   GitHub App, connectors World Labs Atlas (needs a finished Atlas sign-up at atlas.worldlabs.ai) and Hugging Face. Keys World Labs
   (`api.worldlabs.ai`, header `WLT-Api-Key`) and fal (`queue.fal.run`, `Authorization: Key`) — free checks first
   (`python3 -I scripts/verify-assets.py worldlabs`; fal = status read of a ledger request id), secure form only if they fail.
2. Fetch `claude/rainbow-s06-match-c23` and `claude/rainbow-benny-c23` tips (they may have moved after this file); check whether those
   OLD-account cloud sessions are still pushing (never write `-c23` branches from the new account).
3. Recreate worktrees: `bash docs/briefs/2026-11-20-r22/setup_worker_r23.sh` (s04 / s07 from the WIP snapshots on `-c24`; s06 / Benny /
   08 / 05 from their tips).
4. Lead first: the user's 03:58 Screen 04 feedback (clean water, no messy pink walls by the gold, natural swim through the 5 arrows) +
   review s07 step 1; then relaunch up to four specialists (04 projection with the feedback, 07, 06, Benny; 08 / 05 when a slot frees).
