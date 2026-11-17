# Screen 06 — STATUS (round 6, 2026-11-17) — PAUSED by the lead (user order: save credits)

* **Branch:** `claude/rainbow-s06-match-c6`, started from `c088718bb9e3374583238f4ee93f25bdee600065` (startup check OK:
  remote == HEAD, autosave OK, 13 reference checksums OK).
* **Approval status:** NOTHING approved — only the user approves. Default build untouched (only `src/world/match06.ts`
  changed; it runs only under `?match06=1`).

## Diagnosis (verified)
* `&m06dbg=1` at the approved view (`r6/debug_BEFORE_m06dbg/a00_approved_view.png`): the water floor covered the whole
  frame below the crest line, including the crest-loop hole, the right tunnel wall and the foam banks.
* Measured through the locked camera, the painted river is only **~4.5 u wide** at Benny (frame edges = lateral ±2.1 u,
  Benny ≈ 2 u). The game river is 7 u, and the old floor was 9 u wide. That is the "oversized flat water".
* The old floor tile was a 1 u × 2 u crop, mirrored across the river, which made the repeated chevrons.

## Done (each behind its own switch; off = M1 exactly)
* `&m06geo=1` — water only |l| ≤ 2.3 u, a slightly raised foam bank out to 3.6 u, and the tunnel's lower walls drawn in
  so they rise from the banks. Painted water on the wall turns into wall texture once the camera leaves the approved
  view. Game river, steering and coins are unchanged.
* `&m06flow=1` (needs m06geo) — the river material is built from the approved painted water just below Benny
  (`tile_river6.png`). One period spans the full width (no mirroring), it is world-anchored, flows downstream, two
  offset copies hide the repeat, and a light gloss is added. The foam banks use the painted foam (`tile_foam6.png`). On
  the river the flowing material takes over sooner from the stretched projection.
* Tools: `tools/match06/fit_water06.py` (footprint analysis; `water06.json` is NOT used by the game),
  `tools/match06/make_river06.py` (tiles + `proj06.json` → `tiles.r6`). The lead's audit tool has been copied to `tools/lead_r6/`.
* Pictures: BEFORE moving = `r6/BEFORE_lead/` (12 lead shots); NEW moving = `r6/NEW_moving/` (12 shots,
  `match06=1&m06geo=1&m06flow=1`); approved view BEFORE `r6/06_BEFORE_M1_approved_view.png`, NEW
  `r6/06_NEW_r6_approved_view.png` (frozen capture).

## Proofs so far
* tsc clean.
* Approved view with the switches vs without: 111 px differ by more than 20 levels (texture filtering only, not visible).
* Default 05/06/07/08 and `?match08=1` 08: differences vs the `c088718b` worktree are only in rows 33–204 (the
  title/HUD banner, known capture noise). `match06=1` with the switches off vs base: the same, rows 33–204 only.
* Protected 05 BEFORE (`?ringa=26&nearfloor05=0`) vs `qa/pilot05/wave9/baseline/05.png`: **128,689 px differ (rows
  0–1121), NOT explained yet**. My code cannot run on 05 (it runs only under match06), so this is probably
  environment/capture drift. It must be re-checked with a base-worktree capture before anyone claims 0 px.

## Honest ratings (mine, not measured)
Approved view ≈ 8/10 (unchanged). Moving: BEFORE ≈ 3/10 → NEW ≈ 6.5/10. No chevrons and no water wall; tunnel walls
and foam banks are visible, and the water looks like the painting.

## Unfinished / remaining defects
* Late in the stage (66 %) the descending river still fills most of the frame (the camera looks down the slope). That
  is a possible minimal 06-only camera step, not started.
* Hard steering puts Benny on the foam bank (the painted river is narrower than the game river), and he is partly cut
  off at the frame edge (camera framing, same as BEFORE).
* Stretched approved pixels are still visible near the camera in the first ~3 u and when steering.
* Not done: numbers (`measure06.py`), gameplay 8/8 + 91/2,240 with the switches, continuity, APK, the NOTES/SHARED_CHANGES update.

## Exact next step
1. Re-check protected 05 against a base-worktree capture.
2. `node scripts/gameplay-test.mjs --q='match06=1&m06geo=1&m06flow=1'` (expect 8/8, 91 / 2,240); `npm run test:continuity`.
3. `python3 -I tools/match06/measure06.py references/06_crest_the_rinse_arch.png BEFORE=qa/match/06/r6/06_BEFORE_M1_approved_view.png NEW=qa/match/06/r6/06_NEW_r6_approved_view.png`.
4. Update NOTES.md, then attempt the APK: `VITE_RAINBOW_Q05="match06=1&m06geo=1&m06flow=1" npm run android:debug`.
