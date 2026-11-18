# Screen 07 · DIVE THE WASHER TUBE — status (round 7 / account 7, 2026-11-18 ~01:30 UTC)

Branch `claude/rainbow-s07-match-c7`, started from `835a72db` (= `claude/rainbow-s07-match-c5` tip). Nothing is approved
until the user says so. Brief: `docs/briefs/2026-11-17-r7/S07.md` (lead branch).

## MILESTONE 3 — done (round 7): the matched tube look over the whole stage incl. the plunge
**New kept set (proposal):** `?match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1&m07tube=1&m07ring=1`
(= round-4 set K + `m07tube` + `m07ring`). Default build untouched (0 px).

### Structural check first (the two Screen 06 causes) — `r7/probe_before.json`, `tools/match07/probe_r7.mjs`
| along from the checkpoint | 0 u | 3 u | 6 u | 10 u | 20 u | 30 u |
|---|---|---|---|---|---|---|
| camera pitch | −13.2° | −13.0° | −12.9° | −12.9° | −12.9° | −10.0° (blending out) |
| far ring R5 on screen (painted VP 612,548) | 603,546 | 586,552 | 591,553 | 612,554 | 633,555 | 363,628 |
1. Camera pitch does NOT follow the river slope on the level 07 stretch (river slope −3°, camera level at −13° look-down
   as solved) → cause 1 of 06 is not present.
2. The fitted proxy tube is ALREADY one straight cylinder along the painted vanishing-point axis (not built around the
   river path); the far rings stay within ±25 px of the painted VP from 0 to 20 u → cause 2 of 06 is not present.
3. The real structural gap on 07: stage 07 runs s 247 → 390, the matched look only covered s 261 → 304, while the
   PLUNGE (s 312 → 390) is two thirds of the stage and showed the old default world; mid-plunge the camera (8 u behind,
   4.1 u above Benny) passed within 0.6–1.0 u of the default tube's gold rings → a flat orange band filled the lower
   half of the screen and hid Benny (`r7/BEFORE/t66_through_screen.png`).

### Switches tested this round (each alone on top of K)
| switch | what it does | verdict |
|---|---|---|
| `m07tube` | the matched tube continues as REAL geometry along the course from 4 u before the plunge top down the whole plunge to the 08 inlet: same radius (5.84 u) and axis height (3.10 u) as the fitted tube, the same ring-bay wall tile anchored to arc length (rings every 8.55 u, phase continuous), a river ribbon with the same river tile (fades into the game's own water over the last 14→3 u so 08's river continues). The fitted proxy now ends at that depth (it ran on straight through the plunge). Hand-over at 8 u before the plunge top = where the old build switched to the default world, so the still view and the first 30 u are unchanged. The game's 07 tube (rings that blocked the camera) is hidden until 08 starts. | **KEPT** |
| `m07ring` | wall tile with the painted gold rings straightened (`tools/match07/straighten_wall07.py` → `tile_wall_ring.png`): in the unwrap the band drifted ≈43 % of a bay across the rows, so deep in the tube and in the plunge the rings rendered as twisted diagonal orange bands; now each row is shifted so the band sits on the ring depth → round rings | **KEPT** |
| `m07near` | tighter stretch guard (projected picture → river tile at 1.35–2.3× magnification instead of 2.2–4.5×) for the stretched near water when steering | NOT kept — no visible change (the smear is the river tile itself magnified ~10× right in front of the camera) |

### Numbers (lead's `tools/lead_r6/motion_metrics.py`, below the HUD; LAYOUT20 = pixels within 20 levels after blur, PALETTE = hue×sat histogram overlap)
| shot | BEFORE (K) LAYOUT20 / PALETTE | NEW LAYOUT20 / PALETTE |
|---|---|---|
| a00 approved view | 41.1 / 90.2 % | 41.7 / 90.2 % |
| forward 3 / 6 / 10 / 20 u | 8.2 / 84.3 · 6.2 / 76.8 · 7.7 / 76.8 · 4.2 / 71.2 | 8.0 / 84.2 · 6.2 / 76.8 · 7.6 / 76.8 · 4.2 / 71.7 |
| steer L / R (6 u), hard L / R (12 u) | 8.3/74.4 · 3.6/77.7 · 4.0/76.0 · 4.2/70.4 | 8.5/74.5 · 3.4/77.2 · 4.1/76.4 · 4.2/70.5 |
| t33 (plunge top, s 312) | 2.4 / **46.6 %** | 2.9 / **76.4 %** |
| t66 (mid-plunge, s 351) | 0.7 / **24.6 %** | 2.0 / **69.6 %** |
| t95 (plunge bottom, s 385) | 0.8 / 42.2 % | 1.1 / 50.2 % |
Moving frames are seen from other viewpoints, so LAYOUT naturally falls; PALETTE shows whether the approved colours and
materials survive. These are pixel statistics, not a fidelity score.

### Honest moving rating (subjective, separate from the numbers)
* Level stretch (checkpoint → 30 u, steering): **≈ 4/10**, unchanged this round — the tube, rings and paddles hold, but
  the near water smears into long pink/cyan streaks when moving or steering, and steering hard left shows the tube wall
  as a hard diagonal edge where the approved picture has foam bank.
* Plunge (s 304 → 390): **≈ 2/10 → ≈ 5/10** — the same purple perforated tube with round gold rings now runs down the
  whole drop, Benny is visible, no gold band blocks the camera; still the game's tall white foam walls line the plunge
  river (not the approved soft foam), the plunge river is a static tile, and the plunge-top lip is a straight edge.
* Whole stage while riding: **≈ 4.5/10** (lead r6: ≈ 3.5/10). Not the 8.5 target.

### Proofs (round 7)
* `npx tsc --noEmit -p .` clean.
* Default build 0 px vs start commit `835a72db` at 06, 07, 07a plunge top, 07b plunge mid, 07c plunge bottom, 07d
  entering 08 and 08 (deterministic checkpoint captures, worktree of the start commit) — `r7/proof_default_0px.json`.
* New set + `match08=1` vs start-commit K + `match08=1`: 06, 07d entering 08 and 08 **0 px** (08's start exactly
  kept); approved 07 still view 100 px (straightened tile, a few spots); the plunge checkpoints differ as intended —
  `r7/proof_newset_vs_K_match08.json`.
* Gameplay with the new set: **8/8 pass, 91 coins, 1,330 → 2,240**, plunge drop 61.14 u (`r7/gameplay_new.json`).
* Continuity: all joins gap 0, plunge drop 61.19 u, min pitch −70° (`r7/continuity_default.json`; `course.ts` untouched).
* APK: one attempt FAILED in Gradle dependency resolution (Maven: httpmime 4.5.6 / grpc-api 1.45.1 not found) — not retried; details in NOTES.md.

### Pictures (separate full-size portrait files, same 12 audit positions, `node tools/lead_r6/motion_audit.mjs 07 …`)
APPROVED `r7/APPROVED_07.png` · BEFORE (K) `r7/BEFORE/*.png` · NEW (new set) `r7/NEW/*.png`.
Best ones to look at: `t66_through_screen.png` (mid-plunge), `t33_through_screen.png` (plunge top), `f20_forward20u.png`.

### Exact next step
1. Plunge foam: the game's berm/puff foam is one mesh for the whole course; a `&m07foam=1` hook in `src/vfx/foam.ts`
   (hide the berm + puff chunks on s plunge-top+9 → plunge-bottom−12, uniform/visibility only) so the matched river
   tile's painted banks show instead of the tall white walls.
2. Near water while moving: a higher-detail river tile unwrapped from the NEAR painted water (2–6 u, least magnified)
   instead of the 6–16 u band, plus foam-bank colour on the lowest wall band (no hard wall edge when steering hard).
3. The `x07` path fix from the preview branch (below) needs the user's OK before anyone ports it.

---

# Screen 07 · DIVE THE WASHER TUBE — status (round 4, 2026-11-17 ~20:30 UTC)

Branch `claude/rainbow-s07-match-c4`, **started from `72fb6129`** (= `claude/rainbow-s07-match-c3` head, line A; the
autosave `0a46dd70` on top held only backup files). Nothing is approved until the user says so.

## MILESTONE 1 — done (rounds 2/3)
`?match07=1`: whole frame 6.7 → 80.1 %, scenery 6.0 → 95.5 % within 20 levels, 07→08 drop intact, 8/8, 91 / 2,240.

## MILESTONE 2 — done (round 4), moving-view fixes, all URL switches on top of `match07=1`
Kept set (all visibly closer while moving, still view unchanged):
**`?match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1`**

| switch | what it fixes while Benny swims / steers | verdict |
|---|---|---|
| `m07fill` | near water at 3 u: the mirrored "diamond" (provisional fill under the painted Benny) → the river tile, feathered edge (round 4) so no hard-edged patch | KEPT |
| `m07gold` | the five paddles upper-left: solid, rounded, polished gold blocks; seen from beside/below while passing they are pure gold instead of a flat picture of the wall smeared over them (round 4) | KEPT |
| `m07wall` (new) | the doubled orange band upper-left at 10–20 u: the wall tile carried one painted paddle that repeated in every ring bay deep in the tube → tile without it | KEPT |
| `m07river` (new) | steering right: big orange/yellow smear on the near water → the river tile without its slice of painted gold ring (pink bank instead) | KEPT |
| `m07coins` (new) | the far coins: two big trail coins piled on the painted far coins → two small coins continuing the painted line (position + painted size only) | KEPT |
| `m07ang` | meant to remove the doubled layer by view direction; no visible change at 3 u or 20 u (the doubling came from the wall tile, fixed by `m07wall`) | NOT kept |

Numbers, still approved view (`m2r4/metrics_k5.json`, M1 → M2): whole 80.06 → 80.06 %, scenery 95.54 → 95.55 %,
river/coins band 90.35 → 90.40 %, upper tube 99.96 → 99.97 %, lower water 95.64 → 95.63 %, Benny 16.6 → 16.4 % (game model).

Pictures (separate, full size): `m2r4/pictures/1_APPROVED_07.png`, `2_BEFORE_M1_07.png`, `3_NEW_M2_07.png`.
Moving NEW: `m2r4/motion_k5/` (forward 0/3/6/10/20 u, steering left/right, before the drop, drop start, drop +4 u, drop
middle); moving BEFORE (M1): `m1/motion/`; intermediate (without `m07river`): `m2r4/motion_k4/`.

Proofs (round 4): default 06/07/08, `?match08=1` 08 and `?match07=1` 07 = start commit pixel-for-pixel outside the
title banner rows 33–204 (the banner differs between any two captures) — `m2r4/proofs_0px_r4.json`. Protected 05
BEFORE (`?ringa=26&nearfloor05=0`): current = start commit (0 px outside the banner; two current captures 0 px), but
BOTH differ from `qa/pilot05/wave9/baseline/05.png` by 32,280 px (max 72 levels) outside the banner in this container —
pre-existing, not from this work (round 3 measured 0). Gameplay 8/8 default, `match07=1` and the kept set; 91 coins,
1,330 → 2,240 in all three (`m2r4/gameplay_*.json`); 07→08 drop 61.4 / 61.1 / 61.1 u. Continuity all joins gap 0,
drop 61.19 u (`m2r4/continuity_default.json`; `course.ts` untouched this round). `tsc` clean.

APK: `builds/rainbow-debug-07-2026-11-17-r4.apk` (debug, `VITE_RAINBOW_Q05` = the kept set, sha256 5a918a8c45f0d634…)
— NOT phone-tested. fal clean plate: PREPARED, NOT run (`FAL_PLATE_REQUEST.md`). No paid jobs.

## Open (honest)
* Benny is the game's model (not this workstream). The far coins now run in a tidy row but flatter than the painted
  line, which climbs a little toward the light.
* While steering hard, the near water is the repeating river tile (pink/blue streaks, no smears) — less detail than the
  painting; the far end still has a few purple perforated patches from the tile.
* At 10 u thin slivers of the side faces of the far paddles carry picture pixels; at 20 u the passing paddle's lower
  face still shows some purple.
* The gold rings deep in the tube come from the ring-bay tile (rings stay rings, not bands); round 4 did not change ring
  geometry. The bands across the upper screen at 14–45 u are these rings passing overhead (camera specialist's r4 note).
