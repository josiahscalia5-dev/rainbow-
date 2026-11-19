# Screen 07 · round 17 (account 17) — progress log

Branch `claude/rainbow-s07-match-c17` (worktree `/home/user/wt/s07`), start = `-c16` tip `669420af` + the round-16 worker's unfinished
step-2 edit (`src/world/match07.ts` +128, `near07.json`, `near_bank.png`, `near_foam.png`, `tools/match07/near_tiles_r16.py`), restored
uncommitted. Briefs: `docs/briefs/2026-11-18-r17/RESUME_R17.md` (s07) + `docs/briefs/2026-11-18-r15/S07_LAUNCH.md`. VISUALS ONLY.
What was done before: `qa/match/07/r16/PROGRESS.md` (step 1 kept, step 2 design + tuning). Nothing is approved until the user says so.

Kept set K (round 7, M3): `match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1&m07tube=1&m07ring=1` (`qa/match/07/r16/K.txt`).
Kept after r16 step 1: `K&m07foam=1&m07coinsz=1`.
APPROVED picture: `qa/match/07/r16/APPROVED_07.png` (copy of `references/07_dive_the_washer_tube.png`).
Shots: `tools/match07/audit_r16.mjs` (real game, 864×1536, real-time — not pixel-deterministic, so the start-view check uses
`scripts/capture.mjs 07`, which freezes the clock).

## Step 2 — `&m07nearw=1`: the painted NEAR river on the level stretch — finished 20:45–21:10 UTC
The unfinished edit WAS this step (design and tuning in `qa/match/07/r16/PROGRESS.md` step 2): finished as left, no code change;
the NEW stills were re-rendered. The separate draft switch `&m07wfoam=1` (foam clouds on the lowest wall band, task 3) came in the
same unfinished edit; it is committed untested, default off, and is NOT part of this step.
* Query NEW: `K&m07foam=1&m07coinsz=1&m07nearw=1`; BEFORE: `K&m07foam=1&m07coinsz=1` (= r16 step-1 NEW).
* Pictures (separate, full size):
  - APPROVED `/home/user/wt/s07/qa/match/07/r16/APPROVED_07.png`
  - BEFORE `/home/user/wt/s07/qa/match/07/r16/step1/NEW/` (f03, f06, f10, f20, s_left_steer, s_right_steer, s_left_hard, s_right_hard, …)
  - NEW `/home/user/wt/s07/qa/match/07/r17/step2_nearw/NEW/` (same names; a00, f03–f20, steer / hard left / right, t33)
  - clip `/home/user/wt/s07/qa/match/07/r17/step2_nearw/swim_NEW_nearw.mp4` (real gameplay, 3.6 s straight / left / right, half size)
* Checks: approved start view, deterministic `scripts/capture.mjs 07` BEFORE vs NEW: **0 px** differ (rows 180–1536; same 153 draw
  calls / 287,709 triangles). Gameplay with the NEW query: **8/8 pass, 91 coins, 1,330 → 2,240**, plunge drop 61.14 u
  (`step2_nearw/gameplay_new.json`). `npx tsc --noEmit` clean. Default build: `buildMatch07` only runs with `match07=1`.
* **Verdict: GOOD IMPROVEMENT** (clear at forward 10 / 20 u and hard left / right; small at forward 6 u and steering; start view
  and forward 3 u unchanged).
  - f10 / f20: the lower half was a blurry pink / purple smear with the tube-wall perforations lying on the water; now it is crisp
    glossy cyan water with painted white highlights, a magenta satin band with a bubbly white trim on each side — the look of the
    painted river at the bottom of the approved picture.
  - hard left / hard right: the magnified perforated wall smeared across the water is gone; Benny swims on the magenta band with
    cyan water on one side and white foam clouds on the other.
  - f06 / steering: the bottom of the frame is still a blend of the magnified painted water and the new near water (somewhat
    blurry), but less purple wall shows through.
* Still wrong (most visible first): (1) near Benny the magenta bands run as narrow straight ribbons along the lane, while the
  painted bands are thick and sweep across in big S-curves; (2) the foam beside the bands is a flat cloud texture on the floor,
  not the painted puffy mounds; (3) at forward 6 u a soft blurry hand-over zone between the projected picture and the near water.
