# Screen 07 · round 16 (account 16) — progress log

Branch `claude/rainbow-s07-match-c16` (worktree `/home/user/wt/s07`), start `dbc7678c` + the round-15 worker's unfinished files
(`qa/match/07/r15/step1/` t95 shots, `tools/match07/audit_r15.mjs`, `tools/lead_r13/swim_clip.mjs`, `tools/match07/near_tiles_r15.py`).
Brief: `docs/briefs/2026-11-18-r15/S07_LAUNCH.md` + `docs/briefs/2026-11-18-r16/RESUME_R16.md` (s07). User order: VISUALS ONLY
(`docs/briefs/2026-11-18-r15/USER_ORDER_R15_VISUAL.md`). Nothing is approved until the user says so.

Kept set K (round 7, M3): `match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1&m07tube=1&m07ring=1` (`K.txt`).
APPROVED picture (copy of `references/07_dive_the_washer_tube.png`, sha256 75782e38…): `APPROVED_07.png`.
Shots: `tools/match07/audit_r15.mjs` / `audit_r16.mjs` (the lead's 12-shot motion audit + plunge t50 / t80), real game, 864×1536.
The real-time audit is NOT pixel-deterministic (two runs of the same set differ over most of the frame by animation timing);
the "start view unchanged" check uses the deterministic `scripts/capture.mjs 07`.

## Step 1 — round-8 lead work `&m07foam=1&m07coinsz=1` (owed proofs) — 19:15–19:40 UTC
* `m07foam`: down the plunge the game's tall grey-white lather walls (berm + puffs) and the sheet's lifted white edges step aside,
  so the matched tube's river with its painted pink / cyan banks shows. `m07coinsz`: coins never draw larger than the painted coin
  size on screen (the huge near coin at the bottom of the frame).
* Pictures: `step1/BEFORE/` (K) and `step1/NEW/` (K + m07foam + m07coinsz), 14 shots each: a00 start, f03 / f06 / f10 / f20
  forward, steer left / right, hard left / right, plunge t33 / t50 / t66 / t80 / t95.
* Checks: approved start view, deterministic capture K vs NEW: **0 px** differ (rows 180–1536).
* Gameplay with K + m07foam + m07coinsz: **8/8 pass, 91 coins, 1,330 → 2,240**, plunge drop 61.14 u (`step1/gameplay_new.json`).
* **Verdict: GOOD IMPROVEMENT** (moderate, in the plunge and wherever a coin comes close).
  - Plunge t50 / t66 / t80: the two tall grey-white lather walls that lined the drop are gone near Benny; the river now has
    the painted hot-pink and cyan banks like the approved picture. Further down the drop (top of the t80 frame) the white
    walls still start again, with a visible cut where they begin.
  - f10 / f20 / t50 / t66 / t80: the giant gold coin that filled the bottom of the frame is now about the painted coin size.
  - t33 (plunge top) and t95 (08 inlet, owned by 08) look the same; start view unchanged.
* Most visible remaining difference: on the level stretch (f10 / f20, steering) the water in the lower half of the frame is a
  smeared pink / cyan / purple streak pattern with tube-wall perforations lying on it, instead of the painted winding cyan river
  with thick magenta banks and foam clouds → step 2 `m07nearw`.
* Round-15 leftovers kept as history: `qa/match/07/r15/step1/` (t95 BEFORE / NEW of the cut-off run), `tools/match07/near_tiles_r15.py`
  (draft, superseded by `near_tiles_r16.py`).

## Step 2 — `&m07nearw=1`: the painted NEAR river on the level stretch — 19:40–20:10 UTC
* Problem (step-1 NEW f10 / f20 / steering): the moving camera sees the level-stretch water through `tile_river_clean.png` = the
  painted 6–16 u river unwrapped over the whole tube floor and magnified 4–10× → long flat pink / cyan / purple smears, and the
  tube-wall perforations painted beside the far river lie on the water near the walls.
* `tools/match07/near_tiles_r16.py` (reads only the approved picture) → `assets/textures/match07/near_bank.png` = the lower-left
  painted magenta satin band + its bubbly white trim + the glossy cyan water beside it, straightened along the band's inner edge
  (edge measured from the picture's colours, robust 4th-order fit, 3 px rms; the big bubble on the band painted over), periodic
  along the flow; `near_foam.png` = the big puffy foam clouds of the lower-right bank (gold-ring corner painted over).
* Shader (`src/world/match07.ts`, `nearWater()`, only with `m07nearw`): across a winding centre line the water reads
  [foam clouds | magenta band | trim | cyan | cyan | trim | magenta band | foam clouds], world-anchored. Centre line = the lane
  Benny swims (the course already follows the painted S-river) + the painted river's residual winding (±0.3 u), smoothed;
  river half-width 2.6 u incl. a 0.75 u magenta band (≈ the painted band at the bottom of the picture) so Benny stays on the
  water even steering hard (lane ± 2.25 u); the right bank reads another stretch of the strip (no mirror image); the foam tile
  is read twice with offsets and mixed by a slow world mask (no wallpaper grid). Where the approved view itself looks (no
  magnification) the provisional fill under the painted Benny keeps the old river tile → approved start view unchanged.
  The plunge river (m07tube) is NOT changed in this step.
* Tuning (scratch renders, not kept): first try river half-width 1.75 u — at hard left Benny sat on the foam bank → 2.4 u,
  then 2.6 u with the painted winding limited to ±0.3 u; the centre line was sampled every 3 u → visible kinks → 1.5 u + smoothing.

* Continued and finished in round 17: `qa/match/07/r17/PROGRESS.md` (step 2 NEW stills re-rendered there).
