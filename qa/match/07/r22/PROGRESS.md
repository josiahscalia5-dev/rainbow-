# Screen 07 · round 22 (water-fx-specialist) — progress log

## (r22) WHERE I STOPPED / NEXT
* DONE: Step 0 — restore reproduces the saved r21 step-1 result. Step 1 `&m07cloud=1` puffy 3D foam clouds — GOOD IMPROVEMENT.
* Candidate query now: `K7&m07end=1&m07cloud=1` (K7 = `qa/match/07/r21/K7.txt`). Code = uncommitted worktree edits; `s1_cloud/code.patch`.
* NOW: step 2 = rest of r21 task 2 (the smeared magenta sheet in the foreground at hard left / right).
* NEXT: step 3 = task 3 (the middle: the view faces a close purple wall), `&m07view=1` framing test only if scenery cannot get there.

Worktree `/home/user/wt/s07`, LOCAL branch `claude/rainbow-s07-match-c23` (base `8accdad0` + r21 code incl. `m07end`). No commits,
no pushes; the lead autosave snapshots the worktree edits. Port 5277. Brief: `docs/briefs/2026-11-20-r22/LAUNCH_S07.md` +
`docs/briefs/2026-11-20-r21/S07_R21.md`. VISUALS ONLY. Nothing is approved until the user says so.

* APPROVED: `/home/user/rainbow-/qa/match/07/r21/APPROVED_07.png` (= `references/07_dive_the_washer_tube.png`)
* Candidate set at the start of r22, K7e = `K7&m07end=1` (K7 = `qa/match/07/r21/K7.txt`).

## Step 0 — restore check (03:20 UTC): restore reproduces the saved step-1 result
K7e rendered with `tools/lead21/audit_screen.mjs` (+ `AUDIT_SHOTS` e1 0.75 / e2 0.92) into
`/home/user/rainbow-/qa/match/07/r22/s0_verify/` and compared FULL FRAME (rows 0–1536, pixeldiff threshold 0.1) with
`qa/match/07/r21/step1_end/NEW/`: all 9 shots **0 px** (`s0_verify/pixeldiff_fullframe.txt`). 8 of 9 PNGs are byte-identical;
c_middle differs in 2 pixels by 1 colour level (software-GPU rounding, invisible).

## Step 1 — `&m07cloud=1`: puffy 3D foam clouds on both banks instead of flat pale foam sheets (finished 03:55 UTC) — GOOD IMPROVEMENT

What was wrong: beyond the magenta bands both banks were FLAT pale foam — down the whole drop (d_late, e1, e_end, e2) a wide flat
whitish sheet along both walls; in the level stretch, when steering hard left / right, the game's own flat lather sheet
(`foam_berm`, never hidden before 9 u past the plunge top) stood beside the river as a flat pale / grey slab (clip frames).
The painting: separate soft cumulus foam clouds on both banks (periwinkle-blue bodies, white tops, lumpy outlines).

Change (all behind `&m07cloud=1`; needs m07nearw + m07band, the drop part + the lather hide need m07end; default build and K7e unchanged):
* `src/world/match07.ts`: real 3D foam clouds on both banks beyond the magenta band edge (lane ± 2.95 u) to the wall foot, from
  6 u behind the checkpoint to the 08 inlet. Each mound = 2–4 big domes sunk into the water, softer lobes heaped on top, small
  bumps half out of every lobe (lumpy cauliflower outline), loose bubbles at the river edge; mound size 0.8–1.8 and spacing vary
  (now and then a gap); a continuous low lumpy foam line right beyond the band. Every lobe = a sphere impostor (camera-facing quad,
  ray-traced round silhouette, sphere normal + sphere depth, so lobes merge and sit IN the water): 1,176 lobes level stretch +
  2,250 drop, two instanced draws (+2 draw calls, ≈6,850 triangles). Shading = the painted foam tones (periwinkle shadow
  150,155,238 → blue-lilac → pale lilac → white tops; a lilac crease only under each lobe; a soft glint; a small bubbly relief
  fixed to each lobe). Level stretch: a lobe heaps up out of the water only where the moving view magnifies the water past what
  the approved view showed (same guard as the projected water) → none in the approved view. The flat painted foam left between
  the mounds takes the mounds' periwinkle shade (`uCloudSh`, tunable `?m07cSh=`). The unreported r21 draft of this switch (rows
  of equal smooth white balls) was replaced.
* `src/game/Game.ts`: while 07 shows, the game's flat lather sheet + its puffs (`foam_berm`, existing `uHide07` uniform) also
  step aside over the visible 07 level stretch (from 07 s0 + 8, dithered over 3 u) — the clouds stand there instead. Restored as
  soon as 07 is not shown (06 / 08 unchanged; 08 start 0 px).

Query NEW: `K7&m07end=1&m07cloud=1` · BEFORE: K7e = `K7&m07end=1`

Pictures (separate, full size, real game, deterministic `tools/lead21/audit_screen.mjs` + e1 / e2):
* APPROVED `/home/user/rainbow-/qa/match/07/r21/APPROVED_07.png`
* BEFORE `/home/user/rainbow-/qa/match/07/r22/s0_verify/*.png` (K7e; = r21 step-1 NEW, 0 px)
* NEW `/home/user/rainbow-/qa/match/07/r22/s1_cloud/NEW/*.png` (a_start, b_early, c_middle, d_late, e1_075, e_end, e2_092,
  f_hard_left, g_hard_right)
* clips (real gameplay, half size, straight / left / right / straight, 3.6 s):
  level stretch from 0.03 of the stage `/home/user/rainbow-/qa/match/07/r22/s1_cloud/swim_level_NEW.mp4` vs `swim_level_BEFORE.mp4`;
  end of 07 from 0.55 through the drop into 08 `/home/user/rainbow-/qa/match/07/r22/s1_cloud/swim_end_NEW.mp4` vs `swim_end_BEFORE.mp4`

Checks:
* Start view a_start **0 px** (`s1_cloud/diff_a_start.png`). Deterministic capture K7e vs NEW (`proof_0px.json`): 07 start **0 px**,
  08 start **0 px**, 07d entering 08 **0 px** (07a / 07b / 07c differ = the clouds in the drop, intended).
* Gameplay `K7&m07end=1&m07cloud=1`: **8/8 pass, 91 coins, 1,330 → 2,240**, plunge drop 61.14 u (`gameplay_new.json`).
  `npm run test:continuity`: ok, all joins gap 0, 07→08 drop 61.19 u — output identical to r21 (`continuity.txt`). `tsc` clean.
* Port: the stock gameplay / capture scripts hard-code ports 5213 / 5201, so they ran as port-5277 copies with identical logic
  (`tools/match07/gameplay_test_5277.mjs`, `capture_5277.mjs`; copies in `s1_cloud/tools/`).

**Verdict: GOOD IMPROVEMENT** (clear on the second half of 07 and at hard left / right; nothing at the start view).
* d_late / e1 / e_end / e2: instead of a flat pale sheet along both walls, lumpy puffy foam clouds line both banks beyond the
  thick magenta bands — periwinkle-shaded with white tops, like the painted foam; the drop now reads as the painted river with
  foam clouds.
* hard left / right, middle, early: puffy foam clouds beside the river instead of the flat painted foam / the game's flat grey
  lather slab (clip frames while steering right: the grey slab is gone).
* Still wrong (most visible first): (1) middle: the view faces a close purple wall with one gold ring (task 3); (2) hard left /
  right: the near magenta band in the foreground is a soft, smeared sheet (painted: glossy satin with crisp white streaks);
  (3) the clouds are made of more, smaller lobes than the painted cumulus (bubblier) and are still a little lighter in the
  shadows than the painted foam; (4) the last ~10 % of 07 shows Screen 08's own tall white bank at the top (08 = not this stream).
