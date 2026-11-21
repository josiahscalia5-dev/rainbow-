# Round 28 — relaunch of four specialists (lead session branch `ccr-9652868f-lkw0w0`, new Claude account, 2026-11-20 from ~16:36 UTC)

Round 27 (lead `claude/rainbow-restore-screen-match-ijjdai`) stopped at 16:09–16:13 UTC: the old account hit its 5-hour limit and the four
workers died mid-step (NOT a rejection). Its last autosave was 16:15 (`7d3ba10`) = this session's start. Every worktree was recreated by
`docs/briefs/2026-11-20-r27/setup_worker_r28.sh` (base commit + the 16:15 snapshot) on NEW LOCAL branches **`-c29`** (same paths and ports);
**tracked edits verified identical (patch-id) and every untracked file byte-identical** to each snapshot. Scratch folders of round 27
(`/home/user/scratch/*`, dev servers, combined builds, probe variants, queued render scripts) are GONE — recreate only what is missing;
everything under `qa/` survived. Helper installs rebuilt: `/home/user/tools-pixelmatch/pixeldiff.mjs` (pixelmatch 5.3.0),
`/home/user/tools-threejs-devtools`, `/home/user/tools-spector`.

## Common (all workers)
* ALL rules of `docs/briefs/2026-11-20-r27/LAUNCH_R27.md` "Common" still apply (read order: CLAUDE.md → `USER_VISUAL_BRIEF_R26.md` (binding) +
  `USER_VISUAL_GOAL_R13.md` → `LAUNCH_R26.md` Common rules → your section of `LAUNCH_R27.md` → the "(r27) WHERE I STOPPED / NEXT" block of your
  PROGRESS.md). Add a **"(r28) WHERE I STOPPED / NEXT"** block ABOVE the r27 one and keep it current after every finished sub-step.
* Only the branch names changed: `-c28` → **`-c29`**. Same worktrees, ports, PROGRESS.md paths, proof folders.
* Heavy renders: `bash /home/user/rainbow-/tools/lead25/render_slot.sh <cmd…>` (2 machine-wide slots; 4 CPUs, no GPU). Temp files only in
  `/home/user/scratch/<slug>/`. No git in `/home/user/rainbow-`, no commits/pushes, no paid jobs. Every change behind its own URL switch;
  default build unchanged; start view 0 px. Proof = ORIGINAL APPROVED / BEFORE / NEW separate full-size pictures + uninterrupted clip
  1.0x then 0.5x + gameplay 8/8 and 91 coins + `npx tsc --noEmit`. Verdict words GOOD IMPROVEMENT / NOT AN IMPROVEMENT / NOT YET PROVEN.
  Never claim an unmeasured likeness percentage. Nothing is approved until the USER says so. After at most 3 finished steps stop and report.
* Generated extra views (`qa/review_r27/artwork/NN/proposals/*_v1.png`) are UNAPPROVED proposals: a look target at most, never a reference.

## Resume points (from each worker's own r27 block)
* **s07** (water-fx-specialist, `/home/user/wt/s07`, port 5277; PROGRESS `qa/match/07/r24/PROGRESS.md`): r27 step 1 DONE (full candidate
  gameplay 8/8 + 91, landmark stills `qa/match/07/r26/final/landmarks/`, GOOD IMPROVEMENT). Step 2 `&m07fsoft=1` written: v1 quick check =
  bead row gone, clouds off Benny at t 5.0, but drop banks still big ball piles → v2 (drop clouds ×0.82, max scale 1.0, domes sunk, fewer top
  lobes, irregular skirt) was rendering (`/home/user/scratch/s07/v2.sh` → `aud_new2`, `q2_new` — LOST with the scratch; the combo build
  `/home/user/scratch/s07/combo` must be rebuilt with `qa/match/07/r24/combo/mkcombo.py` from `/home/user/wt/s08` READ-ONLY, hashes vs
  `combo/s08snap_SHA256SUMS_r25.txt`). Next: check the v2 code is in the worktree, re-render v2 quick check, judge vs BEFORE landmarks +
  approved → full-size proof `qa/match/07/r27/s2_fsoft/` + NEW full clip 1.0x + 0.5x (BEFORE = `r26/final/SCREEN07_NEW_full_K23-3_*`).
  Step 3 if time: stacked coin column down the drop. Known pre-existing item (not 07 code): the magenta panel at the end of the 07 drop =
  the K23-3 08 inlet pipe mesh (`m08_pipe`) poking into 07 — a 07-side hide/clip switch only after checking what shows behind it.
* **s04** (washer-environment-modeler, `/home/user/wt/s04`, port 5273; PROGRESS `qa/match/04/r23/PROGRESS.md`): r27 variants V0/V4–V7 + C1–C3
  were rendered into the LOST scratch; new code `&m04lgcg` (clustered crescents, + `m04lgcgx/z`, `m04lgch`) and `&m04a5v=1` (chevrons slide
  under Benny) are in the worktree (tsc 0). C3_cloud_full (`m04bbdc=1&m04ry=0.35&m04bbdcb=1.6&m04bbdcl=1.3&m04bbdcw=0.45`) = step-2 pick so far.
  Next: step 1 verdict (V11/V12 denser clusters were queued — render only what's needed) → `qa/match/04/r27/s1_glint/`; step 2 →
  `qa/match/04/r27/s2_cloud/`; step 3 `m04a5v` probe + gameplay + combined whole-04 clip → `qa/match/04/r27/s3_combined/`.
* **s05** (water-fx-specialist, `/home/user/wt/s05`, port 5275; write a NEW `qa/match/05/r27/PROGRESS.md` in the MAIN repo): r27 started 16:10
  and only ran one raycast probe at t85 (result in the r27 transcript: the far view there is `foam_berm` / `foam_far05_clouds` / `tube05_far_river`
  / `tube05_far_wall`). No edits. Old notes `/home/user/wt/s05/qa/match/05/r18/PROGRESS.md`, kept candidate `.../r18/KEPT_STEP2.txt`; lead preview
  `qa/review_r27/05/`. Steps: (1) end section (85 %: wide pink/cyan pool + scattered coins) → painted winding river, pink edges, coin trail to the
  end; (2) hard left (bead-foam wall over Benny's side; flat cut-off gold paddle chunk in the kink) and check hard right stays good; (3) soft foam
  clusters instead of bead rows if time.
* **Benny** (benny-character-artist, `/home/user/wt/benny`, port 5279; PROGRESS `qa/benny/r23/PROGRESS.md`): silk `&b20silk=2` = NOT AN
  IMPROVEMENT (done, keep switch off). Step 2 `&b20crown=1` implemented (steep superellipse crown, five thinner bands, pompom lifted; tsc OK);
  its proof was running (`/home/user/scratch/benny/crown/proof.sh` — LOST) → `qa/benny/r27/s5_crown/0N/new/` (check what exists first), BEFORE
  = `qa/benny/r23/s3_star/0N/new/`, NEW crops with BEFORE's Benny boxes, clip 04, gameplay `gameplay_crown.json`. Then step 3: 06 start star
  amber vs the approved lighter yellow. Do NOT scale Benny. Best query `&benny20=1&b20expo=1&b20ppw=0.45&b20tuft=1&b20knit=1&b20star=1` (unapproved).
* **s06** — NOT relaunched: steps 1 + 2 done (GOOD IMPROVEMENT); step 3 waits for the user's answer on the 06 route (river curving left).
