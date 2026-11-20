# Screen 08 · Final Spin Chamber — round 23/24 progress (worktree `/home/user/wt/s08`, local branch `claude/rainbow-s08-scenery-c25`)

## (r24) WHERE I STOPPED / NEXT
* 2026-11-20 ~10:42 UTC: round 24 resumed (brief `docs/briefs/2026-11-20-r24/LAUNCH_R24.md`, s08 section). Worktree =
  `3c0fa970` + my 10:25 edits (step 2 code in `src/gameplay/coins.ts`, QA tools); nothing re-applied. The machine was
  rebooted: the r23 scratchpad (step 3 render, helper scripts) is gone; proof already in `qa/match/08/r23/` is intact.
* Checked: step 1 clips complete and labelled (`step1_m08gl/clip/`, 40 frames each = 26 frames of 08 + 14 into 09; 1.0x =
  24 fps real game speed, 0.5x = 12 fps). Step 2 12-shot BEFORE / NEW complete (verdict pending a coin-size table).
* ~10:45 UTC rendering: step 2 NEW clip + step 3 NEW clip (port 5286); step 3 NEW 12 shots + K23-1 coin-log re-render
  (port 5287; also checks that today's renders equal the r23 ones pixel for pixel).
* NEXT: step 2 verdict + clip; step 3 proof + verdict; gameplay 8/8 + 91 coins; `npx tsc --noEmit`; report.

## (r23) WHERE I STOPPED / NEXT
* 2026-11-20 ~09:52 UTC: round 23 started (washer-environment-modeler, in-process). Brief
  `docs/briefs/2026-11-20-r23/LAUNCH_S08_R23.md`. `m08gl` code is already in the worktree (commit `3c0fa970`, `grep m08gl
  src/world/match08.ts` -> line 433); nothing re-applied.
* ~10:20 UTC: step 1 (`m08gl`) 12-shot BEFORE / NEW done (verdict below, GOOD IMPROVEMENT small); its swim clips rendering.
  Step 2 (`&m08coinsz=1`, coin sizing) code written (uncommitted in the worktree, `npx tsc` clean); its NEW set rendering.
* NEXT: step 2 verdict; step 3 towel double exposure (`m08towelm`).

Kept set at start: `K16` = `qa/review_r21/audit/QUERY_08.txt` =
`match08=1&coins08px=1&m08bw=1&m08fill=1&m08arch=1&m08swim=1&m08seam=1&m08sill=1&m08towel=1&m08far=1&m08coinv=1&m08ceil=1&m08near=1&m08cup=1&m08rw=1&m08drum=1&m08ring=1&m08cupg=1&m08bore=1&m08flange=1&m08cupw=1&m08nq=1&m08sr=1&m08vh=1`
Rejected, never repeat: `m08urcup` (invented upper-right cup front).

QA notes (r23): renders use `M08_FONTS=1` (QA-only dev server that serves the symlinked node_modules, so the HUD fonts load
as in r17; `tools/match08/r23_vite.mjs`), `M08_DET=1`. All BEFORE and NEW shots of a step are rendered in the same session.
The r17 raw renders differ from today's only in the HUD banner font and faint Benny fur shading; the scenery is identical.

## Step 1 — `&m08gl=1` (r17 step 2 finished: near-water glints with their painted glow) — KEPT (GOOD IMPROVEMENT, small)
Kept query: `K23-1 = K16&m08gl=1` (`step1_m08gl/QUERY_NEW.txt`).
* What changed (only with `m08near` + `m08nq`): the near-water tile under Benny uses `nq08g` (nq08.py v7, `NQ08_GLOW=1`):
  the same seven painted glints, cut from the rectified band WITH their cyan glow, lying along the streaks.
* Approved start view 0 px changed; f20 (stage 09) 0 px; f03 22 px. Other shots: only the near water below / beside Benny.
* Closer by eye: the bare white "lightning" shapes lying ~30 deg across the streaks (clearest at hard left, hard right,
  forward 6 / 10 u, 95 % through) become white glints running ALONG the streaks inside a bright cyan glow, as painted.
* Still wrong: the glints still read as small spiky white sparkles; the painted ones are larger, softer sheen bands
  stretched along the curved streaks. The jagged glints right below Benny's splash come from the projected plate (separate).
* Pictures: `qa/match/08/r23/step1_m08gl/1_APPROVED.png`, `2_BEFORE_<shot>.png` (K16), `3_NEW_<shot>.png` (all 12 shots),
  `pixel_changes.json`, `code.patch` (commit `3c0fa970`: `src/world/match08.ts`, `tools/match08/nq08.py`, `nq08g.json`).
* Clips (r23, labelled 10:20; checked complete in r24): `step1_m08gl/clip/08_BEFORE_K16_{1x,0.5x}.mp4`,
  `08_NEW_m08gl_{1x,0.5x}.mp4` — uninterrupted run through all of 08 (26 frames = 1.08 s at real speed) + 0.6 s of 09;
  1x = real game speed (24 fps), 0.5x = half speed; speed + phase printed on every frame.

## Step 2 — `&m08coinsz=1` (coins no larger than painted while swimming) — KEPT (GOOD IMPROVEMENT, small)
Kept query: `K23-2 = K23-1&m08coinsz=1` (`step2_m08coinsz/QUERY_NEW.txt`). BEFORE = K23-1.
* What changed (only with `m08coinv` + `coins08px`; count, score, pickup rules and positions unchanged): the on-screen cap
  for a picture coin now follows the painted coin line (at each screen height at most the painted coin there, +6 %); below
  the nearest painted coin the old cap (5.6 % of the frame height) holds. Code: `src/gameplay/coins.ts` (`code.patch`).
* Start view 0 px (the painted coins stay exactly as they are). Other shots: only coins change (0.45–1.3 % of the frame).
* Measured (`coin_sizes.json`, 80 coin sightings above the nearest painted coin, 12 shots): BEFORE coins were on average
  14.8 % larger than the painted coin at the same height (worst 59 %: 71 px where 45 px is painted, at hard left);
  NEW 4.7 % (worst 7.4 %).
* By eye: while swimming, the far coins by the platform no longer look as big as the middle ones; the trail tapers from
  tiny coins at the platform to bigger coins near Benny, like the painted trail. The coin beside / above Benny is unchanged.
* Still wrong: the nearest coin (beside Benny's hat) stays at the 5.6 % cap (painted nearest coin), so the step from it
  to the next coin is a little abrupt in the middle of the screen.
* Pictures: `step2_m08coinsz/1_APPROVED.png`, `2_BEFORE_<shot>.png` (K23-1), `3_NEW_<shot>.png` (12 shots),
  `pixel_changes.json`, `coin_sizes.json`, `code.patch`, `qa_tools.patch` (QA coin log + HUD-font server).
  Clips `step2_m08coinsz/clip/08_NEW_m08coinsz_{1x,0.5x}.mp4`, BEFORE `08_BEFORE_K23-1_{1x,0.5x}.mp4` (see `CLIPS.txt`).
