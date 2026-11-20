# Screen 05 — rounds 27 / 28 progress log (water-fx-specialist, slug s05)

Worktree `/home/user/wt/s05`, LOCAL branch `claude/rainbow-s05-match-c29` (base `eb7233e`, clean at start), port 5275,
temp `/home/user/scratch/s05/`. Old notes: `/home/user/wt/s05/qa/match/05/r18/PROGRESS.md`. Kept candidate (BEFORE for every
step): `/home/user/wt/s05/qa/match/05/r18/KEPT_STEP2.txt`. Lead preview of that candidate: `qa/review_r27/05/`.

## (r28) WHERE I STOPPED / NEXT
* 17:10 UTC — started r28. Diagnosis of the end section done (below); writing step 1 `&m05endr=1`.

## Diagnosis — end section (85 %, s 180.47) — r28 probe (`/home/user/scratch/s05/tools/probe_end.mjs`)
* Far block seam is capped at s 186.52 (zCap 6.49 u past sF05 = 180.04) from ≈ 12 % of the stage on; at 85 % the eye is ≈ 14 u
  from it, so everything above screen y ≈ 770 is the far block's river (hiding it in a debug render leaves a hole there).
* That far river is drawn from the far layout (`far05.ts farRiverLayout`): right behind the seam it is the real ribbon's layout,
  wall to wall (hw 5.2 of the 6.53 floor half chord, Z 6–14), and only past Z ≈ 30 it narrows. At the locked view this region is
  covered by the baked approved far picture F (a narrow S-channel with foam banks); once swimming magnifies F, `m05fmag/m05fpaint`
  draw the layout's own continuation — so the narrow painted channel seen from afar turns into a wide pool up close (the defect).
* Coins: the 05 coins between the seam and the 06 start (s 186.5–188.9) stay on the real course, which swings LEFT into 06, so they
  leave the river toward the left wall, while the 06 coins are drawn on the far core (right) — the trail breaks ("scattered coins").
