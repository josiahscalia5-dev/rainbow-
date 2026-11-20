# Round 29 — relaunch of four specialists (lead session branch `ccr-ac160b4c-3hdecw`, new Claude account, 2026-11-20 from ~18:21 UTC)

Round 28 (lead `ccr-9652868f-lkw0w0`) stopped at 17:30–17:36 UTC: the old account hit its 5-hour limit (HTTP 429) and the four workers
(s06 route, s07, s05, Benny) died mid-step — NOT a rejection. Its last autosave was 18:12 (`31d3a8c`) = this session's start; the worker
snapshots in `backups/wip/*-c29/` are from 18:12:48. Every worktree was recreated by `docs/briefs/2026-11-20-r28/setup_worker_r29.sh` on NEW
LOCAL branches **`-c30`** (same paths, same ports); **all 12 work copies verified: tracked patch-id MATCH and every untracked file
byte-identical** to the 18:12 snapshots. Scratch folders of round 28 (`/home/user/scratch/*`: quick-shot scripts, combo builds, probe
renders, queued proof jobs) are GONE (recreated empty) — recreate only what is missing; everything under `qa/` and in the worktrees survived.
Helper installs rebuilt: `/home/user/tools-pixelmatch/pixeldiff.mjs` (pixelmatch 5.3.0 + pngjs 7), `/home/user/tools-threejs-devtools`
(threejs-devtools-mcp 0.5.0), `/home/user/tools-spector` (spectorjs 0.9.33).

## Common (all workers)
* ALL rules of `docs/briefs/2026-11-20-r28/LAUNCH_R28.md` "Common" (which carries r27 / r26) still apply. Read order: `CLAUDE.md` →
  `docs/briefs/2026-11-20-r28/USER_CLARIFICATIONS_R28.md` (binding, newest) → `docs/briefs/2026-11-20-r26/USER_VISUAL_BRIEF_R26.md` (binding) →
  `docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md` → `LAUNCH_R28.md` Common → your section below → the "(r28) WHERE I STOPPED / NEXT"
  block of your PROGRESS.md. Add a **"(r29) WHERE I STOPPED / NEXT"** block ABOVE the r28 one and keep it current after every finished
  sub-step (the lead's autosave snapshots it every 5 minutes; if the account stops, that block is all the next worker has).
* Only the branch names changed: `-c29` → **`-c30`**. Same worktrees, ports, PROGRESS.md paths, proof folders.
* Heavy renders: `bash /home/user/rainbow-/tools/lead25/render_slot.sh <cmd…>` (2 machine-wide slots; 4 CPUs, 15 GB, no GPU — SwiftShader).
  **Screen 06 route test has render priority** (it is the user's next checkpoint): other workers keep jobs short (quick 432×768 checks before
  full-size), and never hold both slots. Temp files only in `/home/user/scratch/<slug>/`. No git in `/home/user/rainbow-`, no commits / pushes,
  no paid jobs. Every change behind its own URL switch; default build unchanged; start view 0 px. Proof = ORIGINAL APPROVED / BEFORE / NEW
  separate full-size pictures + uninterrupted clip 1.0x then 0.5x + gameplay 8/8 and 91 coins + `npx tsc --noEmit`. Verdict words GOOD
  IMPROVEMENT / NOT AN IMPROVEMENT / NOT YET PROVEN. Never claim an unmeasured likeness percentage. Nothing is approved until the USER says so.
  After at most 3 finished steps stop and report.
* Usage: the previous account ran out ~55 min after four workers started. Work economically: no exploratory re-reading of files you already
  summarised in your PROGRESS block, no duplicate renders, short probe scripts, and write the PROGRESS block BEFORE each long render.
* Generated extra views (`qa/review_r27/artwork/NN/proposals/*_v1.png`) are UNAPPROVED proposals: a look target at most, never a reference.
  Screen 04 K27-B and Screen 08 K23-3 = saved candidates, NOT approved.

## Resume points (from each worker's own r28 block)
* **s06 — ROUTE TEST (priority)** (path-camera-transition-engineer, `/home/user/wt/s06` `claude/rainbow-s06-match-c30`, port 5276; PROGRESS
  `qa/match/06/r25/PROGRESS.md` → its "(r28)" block; brief `docs/briefs/2026-11-20-r28/S06_ROUTE_R28.md` = the user's authorization +
  required proof). State: `&m06route=1` CODED (match06.ts far tunnel axis sheared between axial 12..46 u so the 07 start sits inside the ring
  interior, tunables `&m06rsh=a,b` `&m06rtg=x,y`, rings keep their facing; coins.ts `grow` + Game.ts `setGrow(away)`; tsc 0). Route stretch
  `m06rk` tried and DROPPED (folds the river). Course unchanged (07 start / tangent / every s exact). Next: recreate the quick-shot tool
  (copy of `tools/match06/r23_audit.mjs` / `r28_quick.mjs` with a 432×768 viewport) → quick BEFORE (`qa/match/06/r25/step2/QUERY_NEW2.txt`) vs
  NEW (+`&m06route=1`) at start / 3 / 12 / approach / entry / inside / 50 / 70 / 85 % / exit / first 07 frames → tune → full proof in
  `qa/match/06/r28/route/` exactly as `S06_ROUTE_R28.md` lists (labelled stills, 1.0x + 0.5x continuous clips BEFORE and NEW from the 06 start
  through the actual exit and the complete hand-over into 07, strong LEFT / RIGHT stills, gameplay 8/8 + 91, tsc, `npm run test:continuity`)
  and an honest verdict. Do NOT edit 07 files used by s07. If the route cannot pass the rings cleanly, say exactly why before trying a variant.
* **s07** (water-fx-specialist, `/home/user/wt/s07` `claude/rainbow-s07-match-c30`, port 5277; PROGRESS `qa/match/07/r24/PROGRESS.md`):
  step 2 `&m07fsoft=1` **v5** = the candidate (in `src/world/match07.ts`); start view vs the full candidate = 0 px (pixelmatch). Its full proof
  (clip `qa/match/07/r27/s2_fsoft/SCREEN07_NEW_fsoft_K23-3_{1x,0.5x}.mp4`, gameplay `gameplay_NEW_fsoft.json`, landmark stills) was rendering
  in the LOST scratch → rebuild the combo (`qa/match/07/r24/combo/mkcombo.py`, `/home/user/wt/s08` READ-ONLY, hashes vs
  `combo/s08snap_SHA256SUMS_r25.txt`), recover `Q_FULL.txt` from `qa/match/07/r26/final/NEW_full_frames.json`, re-run the proof (check what
  exists in `qa/match/07/r27/s2_fsoft/` first), then verdict. Step 3 `&m07coinw=1` (coins.ts, snaking coin trail down the plunge) is coded,
  not rendered — only after the step-2 proof.
* **s05** (water-fx-specialist, `/home/user/wt/s05` `claude/rainbow-s05-match-c30`, port 5275; PROGRESS `qa/match/05/r27/PROGRESS.md`):
  step 1 `&m05endr=1` coded (match05far.ts live far rows, foam.ts `createFarCloud05`, environment.ts; tsc 0). Quick checks v1 (barely
  visible) → v2 (banks too bulky) → v3 (smaller, lower fill lumps) was rendering (LOST) → re-render v3 quick check at 70 / 85 / 95 % +
  hard left / right, judge, then full proof (BEFORE = the r18 kept candidate `.../r18/KEPT_STEP2.txt` / lead preview `qa/review_r27/05/`).
  Remember: the audit tool freezes the clock (collected coins stay in their pop pose in stills — artefact, BEFORE and NEW alike).
  Step 2 = hard left bead-foam wall / paddle chunk (check hard right stays good).
* **Benny** (benny-character-artist, `/home/user/wt/benny` `claude/rainbow-benny-c30`, port 5279; PROGRESS `qa/benny/r23/PROGRESS.md`):
  step 3 `&b20s06a=1` (06 start star from amber to the approved lighter yellow) — defaults set (STARX06A 1.0,2.05,0.6; fade .27→.42) and the
  τ ≈ 0.12 s star easing fix in 06 written (tsc OK); the proof re-run (`/home/user/scratch/benny/star06/proof.sh`) was LOST → recreate it:
  `qa/benny/r28/s6_star06/06/new/` (a_start, c_middle, f_hard_left; BEFORE = `qa/benny/r27/s5_crown/06/new/`), clips 3 s BEFORE + NEW from the
  06 checkpoint, gameplay `gameplay_s06a.json`, COMPARE crops + verdict (check `qa/benny/r28/s6_star06/` for what survived). Later: crown taper
  + pompom higher. Do NOT scale Benny. Best query (unapproved) `&benny20=1&b20expo=1&b20ppw=0.45&b20tuft=1&b20knit=1&b20star=1&b20crown=1`.
* **s04** — FINISHED (K27-B). Its next items (arrows readable late in 04, glint crescents, fused cloud banks, painted swirls) wait for a slot.
* **09 / 10** — new playable workstreams (user r28 ~17:25), queued for the next free slot; brief `docs/briefs/2026-11-20-r28/S0910_R28.md`.
