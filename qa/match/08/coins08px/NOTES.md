# Screen 08 — coins on the painted spots (`?match08=1&coins08px=1`) — lead, round 3, 2026-11-17 ~18:00 UTC

Status: **under review** (the user approves; nothing is promoted). Default build and `?match08=1` unchanged.

## What was wrong (found while comparing the Benny pictures)
* The nine picture coins of `?match08=1` landed **3–59 px** away from the painted coins (probe:
  `node tools/match08/coinprobe08.mjs`): the near three ≈0.4 u too low (their height was measured from the painted water
  level, y −113.11, but applied from the river centre line, ≈0.41 u lower), the (383,633) coin 57 px too high.
* Stage 10's own five coins ("straight line into the towel tunnel", s 420–428) showed far down the river in the approved
  08 view as an extra cluster — the painting has no coins there.
* Not a regression: the 14:51 FINISH-round picture `qa/match/08/08_NEW_match08.png` shows the same layout.

## The change (switch-guarded, `src/gameplay/coins.ts`, 18 lines)
* `tools/match08/coins08px.mjs` → `assets/textures/match08/coins08px.json`: for each painted coin (centre + radius px from
  `coins08.json`), the locked approved camera's ray through the painted pixel; on that ray the depth where the coin
  stands ON the water (bottom edge at the painted water level) within pickup reach (|lateral| ≤ 1.05); scale = painted
  size at that depth. 6 coins sit on the water; 3 painted at the river's edge beyond the swim lane stay slightly raised
  (as before) so they remain collectible.
* `coins.ts` (only when `match08` AND `coins08px`): the picture coins use those exact world points (s refined so the point
  lies in the river cross-section); stage 10's five coins move into the inlet before the 08 view (like the 8 coins the
  picture already replaced) → still **91 coins / 2,240**.

## Results (APPROVED | BEFORE `?match08=1` | NEW `?match08=1&coins08px=1`, same Benny)
| measure (within 20 levels) | BEFORE | NEW |
|---|---|---|
| coin positions vs painted | 3–59 px off + 5 extra coins | **1–8 px** (8 px = the coin's gentle bob), no extra coins |
| whole frame (`tools/qa/screen_match.py`) | 83.3 % (SSIM 0.818) | **84.1 %** (SSIM 0.823) |
| below HUD | 90.1 % | **91.0 %** |
| layout (blurred) | 91.8 % | **93.1 %** |
| scenery (regions08.py: no HUD/title, no Benny+splash) | 97.3 % | **98.0 %** |
| middle band (river start, coins) | 90.6 % | **93.5 %** |
| scenery without coins | 99.0 % | 99.3 % |
Pictures: `1_APPROVED_08.png`, `2_BEFORE_match08.png`, `3_NEW_match08_coins08px.png` (+ `_cointrail_2x` close-ups),
moving frames `motion_BEFORE/`, `motion_NEW/`, `motion_sheet_top_BEFORE_bottom_NEW.png` (checkpoint, forward 3/6/10/15 u,
steer left/right — coins ride on the painted trail, no stray far cluster).
Screens 09/10 vs their approved pictures: unchanged within 0.1 % (they are planned as Google Flow videos).

## Proofs
* Gameplay `node scripts/gameplay-test.mjs --q="match08=1&coins08px=1"`: **8/8**, 91 coins (1,330 → 2,240), 07→08 drop
  61.31, errors [] (`gameplay_match08_coins08px.json`). `npx tsc --noEmit -p .` clean.
* Switch OFF = unchanged: code before (`c83b8f1b`, temporary worktree) vs after, captures 07/08/09/10 below the HUD:
  default 0/0/0 px, `?match08=1` 0/0/0 px; screen 10 flips between two capture states run to run (a 2nd run gave 0 px).
  (The temporary worktree drew the HUD text in a fallback font — a worktree artefact, so the HUD band was excluded.)
* With the switch ON, screen 07 changes by 32 px (the 5 moved coins far down the 07 tube) — only under `coins08px`.

## Reproduce
`node tools/match08/coins08px.mjs` (rewrites the json) · `node tools/match08/coinprobe08.mjs --q=coins08px=1` ·
`node scripts/capture.mjs 08 --q="match08=1&coins08px=1"` · `node tools/match08/motion08.mjs <out> "match08=1&coins08px=1"`.
Combines with the Benny specialist's work (different region) once the user approves both; nothing merged.
