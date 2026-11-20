# Screen 05 — rounds 27 / 28 progress log (water-fx-specialist, slug s05)

Worktree `/home/user/wt/s05`, LOCAL branch `claude/rainbow-s05-match-c29` (base `eb7233e`, clean at start), port 5275,
temp `/home/user/scratch/s05/`. Old notes: `/home/user/wt/s05/qa/match/05/r18/PROGRESS.md`. Kept candidate (BEFORE for every
step): `/home/user/wt/s05/qa/match/05/r18/KEPT_STEP2.txt`. Lead preview of that candidate: `qa/review_r27/05/`.

## (r29) WHERE I STOPPED / NEXT
* ~18:35 UTC — relaunched on `claude/rainbow-s05-match-c30` (worktree restored byte-identical; step-1 code = 3 files, tsc 0).
  Quick-shot tool recreated: `/home/user/scratch/s05/quick.mjs` (= `tools/match05/r8_shots.mjs` with `VW`/`VH` viewport env).
  NOW: quick 432×768 v3 check BEFORE (KEPT_STEP2) vs NEW (+`&m05endr=1`) at a00 / x70 / x85 / x95 / x85L / x85R / x95L / x95R
  → `/home/user/scratch/s05/q_v3/{before,new}/`. Then judge vs approved, tune ≤ 2×, full proof in `qa/match/05/r28/s1_endr/`.

## (r28) WHERE I STOPPED / NEXT
* 17:10 UTC — started r28. Diagnosis of the end section done (below).
* ~17:45 UTC — step 1 `&m05endr=1` code written in the worktree (tsc 0; uncommitted, the lead's autosave snapshots it):
  `src/world/match05far.ts` (live far rows `rowLive`: channel half width 3.35 u (`m05endhw` tunable), core swinging −0.6 / −1.5 /
  −0.9 / +0.8 / +2.2 / +2.6 at Z 10.5 … 62, taper Z zCap … zCap+4, back to the original rows by Z 95, weight = F-magnification),
  `src/vfx/foam.ts` (`createFarCloud05(zMax, bankFill)`: bank-fill foam lumps, own random stream), `src/world/environment.ts`
  (passes the flag). Quick checks v1 (taper 7 u: barely visible) → v2 (taper 4 u + bank fill: channel + foam banks, banks too bulky)
  → v3 (smaller, lower fill lumps) rendering. A coins.ts change was tried and reverted (no 05 coins exist past the seam: the trail
  break is the 05 coin weave swinging left before the seam vs the 06 coins on the far core; with m05endr the far core swings left,
  so the trail now continues: first far coin x 521 → 411 px at 85 %). NOTE: the audit tool freezes the clock, so coins collected
  just before a shot stay drawn in their pop pose (the "scattered" coins beside Benny at 85 % / 95 %): capture artefact, BEFORE and NEW alike.

## Diagnosis — end section (85 %, s 180.47) — r28 probe (`/home/user/scratch/s05/tools/probe_end.mjs`)
* Far block seam is capped at s 186.52 (zCap 6.49 u past sF05 = 180.04) from ≈ 12 % of the stage on; at 85 % the eye is ≈ 14 u
  from it, so everything above screen y ≈ 770 is the far block's river (hiding it in a debug render leaves a hole there).
* That far river is drawn from the far layout (`far05.ts farRiverLayout`): right behind the seam it is the real ribbon's layout,
  wall to wall (hw 5.2 of the 6.53 floor half chord, Z 6–14), and only past Z ≈ 30 it narrows. At the locked view this region is
  covered by the baked approved far picture F (a narrow S-channel with foam banks); once swimming magnifies F, `m05fmag/m05fpaint`
  draw the layout's own continuation — so the narrow painted channel seen from afar turns into a wide pool up close (the defect).
* Coins: the 05 coins between the seam and the 06 start (s 186.5–188.9) stay on the real course, which swings LEFT into 06, so they
  leave the river toward the left wall, while the 06 coins are drawn on the far core (right) — the trail breaks ("scattered coins").
