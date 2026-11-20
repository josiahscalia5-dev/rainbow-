# Round 23 — Screen 04 (in-process `washer-environment-modeler`) — FIRST PRIORITY of the round

## The user's words (verbatim, binding — they win over every older Screen 04 instruction)
* r22 ~03:58: "when he goes through the water ... he's not going through it naturally, the pink character. And ... the pink part where he
  goes inside the tunnel, through the 5 arrows, there's like pink on the left and right side, kind of near the gold part ... I don't want
  the water to look messy. I want it to look very clean. That's the whole point ... like the original approved screen through the 5
  arrows, I want it to get more feel like he's going through the 5 arrows, like he's going naturally."
* r23 ~04:20: "I want to go down through the 5 arrows ... my screen has like the pink around it, around the blue water. I don't want all
  that pink stuff ... it's mostly blue water, and there's a little bit pink on the sides. I think I have too much pink, like wet or water
  on the left and right side."
Summary: CLEAN water, MOSTLY BLUE, only a little pink on the sides, NO pink above the waterline on the gold, Benny swimming naturally
DOWN THROUGH the five arrows.

## Where you start
* Worktree `/home/user/wt/s04`, LOCAL branch `claude/rainbow-s04-match-c24` (= `34cb4941` + the K22-2 code). Do NOT commit / push; never
  run git in `/home/user/rainbow-`; never touch other worktrees. Port 5273 (5274–5275 free for parallel renders; 5276+ belong to others).
* BEFORE for every proof = **K23-1** = `cat /home/user/rainbow-/qa/match/04/r23/QUERY_K23-1.txt` (lead step, `qa/match/04/r23/PROGRESS.md`:
  K22-2 + `m04wup=0` + `m04nwhirl=0&m04nband=0` + `m04lane2=0.25`). Lead pictures `qa/match/04/r23/lead_t2/C2/`, clips there.
* TRAP: the game reads the FIRST occurrence of a URL switch — replace values in place with
  `node /home/user/rainbow-/tools/lead23/setq.mjs "<query>" "a=1&b=2"` (appending an existing key does nothing).
* Pinned-clock tools (river shader reads the wall clock): `/home/user/rainbow-/qa/match/04/r22/tools/{audit_pinned,swim_clip_pinned,gameplay_test_5273}.mjs`
  (run from the worktree; `AUDIT_PORT=<port>`). Lead helpers `/home/user/rainbow-/tools/lead23/{sweep.sh,clip.sh,probe04.mjs}` (probe
  ignores parent visibility). Pixel tool `/home/user/tools-pixelmatch/pixeldiff.mjs A B diff.png 0.1 180 1536`.
* APPROVED master `references/04_through_the_five_arrows.png` (never written). User-ACCEPTED generated views (label them so):
  `qa/review_r21/artwork/04/accepted/04_gen_{c_middle_p2_v1,d_late_p3_v1,e_end_p2_v1}.png` for audit shots c_middle 0.35 / d_late 0.60 /
  e_end 0.85 (record `qa/review_r21/artwork/04/USER_VERDICT.md`). They show exactly the user's wish: gold down to low white foam
  banks, mostly cyan water with pink only as side swirls, five arrows clearly AHEAD.

## Tasks (each behind its own URL switch; default build and K23-1 unchanged; one factor at a time)
1. **Through the five arrows.** Today the chevrons straddle Benny's hat (he does not read as swimming down the lane through them). Make
   the five glowing chevrons sit clearly AHEAD of him on the water, visible above / beyond his pompom like the painting and the accepted
   views, and Benny sitting IN the water (neat splash ring + V wake, not perched on top). Start from the unfinished
   `qa/match/04/r22/s3_unfinished/m04a3sc_unfinished.patch` (screen clearance; calibrate `m04a3sy` with `&m04a3dbg=1`) if it helps.
   Do NOT scale Benny, do NOT change the camera (04 framing is not user-authorized) — solve it with the arrows / water / splash.
2. **Clean water edge + clean glossy water.** The water now meets the gold with a hard straight lilac line; the painting has low bubbly
   foam banks there and the gold continues down to them. Lane water is a frosted ripple; the painting has long glossy white streaks on
   electric cyan. Never reintroduce pink walls or wide pink.
3. **Projection** of the three accepted views (`docs/briefs/2026-11-20-r22/LAUNCH_S04_PROJ.md`, switch `&m04mp=1`, read its Method +
   Hand-over sections; camera work started in `qa/match/04/r22_proj/{s0_cams,tools}/`) — keep pink only where the plates show it (side
   swirls), mask the painted chevrons / bubbles (no doubles), never project onto Benny / coins / HUD.

## Proof (every finished step) — `/home/user/rainbow-/qa/match/04/r23/s<N>_<name>/` + `qa/match/04/r23/PROGRESS.md`
Keep the lead block at the top of PROGRESS.md; add your own "(r23 s04) WHERE I STOPPED / NEXT" block under it, updated after every step.
Pinned audit BEFORE (K23-1) / NEW at the 7 standard shots (+ 0.47 / 0.72 for projection), separate full-size pictures, APPROVED = the
original for start / early, the ACCEPTED GENERATED view (labelled) for middle / late / end. Start view 0 px. Uninterrupted pinned swim
clip through all of 04 (straight / left / right) BEFORE + NEW, real speed + half speed mp4. Gameplay 8/8, 91 coins, 1,330 → 2,240.
`npx tsc --noEmit` OK. Save `git -C /home/user/wt/s04 diff > …/code.patch` per kept step. 3–5 line verdict in plain visual words:
GOOD IMPROVEMENT / NOT AN IMPROVEMENT / NOT YET PROVEN. No colour-percentage claims as proof.

## Rules
No paid jobs (ask the lead; the lead runs paid artwork). Never print secrets, never reinstall tools, never `playwright install`.
Up to 3 finished steps, then stop. Final message to the lead: each step + switch + verdict + folders + clip paths, the new candidate
query, mobile cost, the single most visible remaining difference.
