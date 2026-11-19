# Screen 05 water while RIDING — `?proj05=1&projnear05=1` (2026-11-16 ~22:25 → 23:20 UTC, WORK IN PROGRESS)

Session `01KS3bZt…` (new Claude account), branch `ccr-8c4acadc-iybw0n`, started from `ccr-61131b9d-uj0oqb` @ `aea7e77`.
Continues part 2 of `../flow2/NOTES.md` (the riding blur). Nothing here is the default: every line of game code is behind
`?proj05=1` **and** `&projnear05=1`. The user has NOT approved the look yet — do not promote.

Full test URL (the user's stack + this experiment):
`?proj05=1&projwall05=1&projring05=1&projframe05=1&projlid05=1&projflow05=2&projnear05=1`

## The problem (measured, `scripts/proj05-ride-probe.mjs`)
While Benny rides forward the camera follows him, so the screen always needs about the same texture density at the same
distance from Benny: 100–200 screen px per world unit along the river 1–3 u behind him (bottom of the screen), 55–100
beside him, 25–50 two to six units ahead; ACROSS the river 220–300 px per unit at the bottom. The exact layer E has that
only from the locked camera; from 2 u of riding on the near field fell back to the near / tile layers at 24 texels per
unit → the pastel smear the user saw 8–17 u into the ride.

## What `projnear05=1` does
* **New texture `assets/textures/water05/proj05_T2.png`** (`tools/proj05/near_bake.py`, 1024 × 768, ≈117 texels per unit
  along, 107 across; flow map `proj05_WT2.png`, extents `proj05_near.json`): the NEAREST water of the approved locked view
  (source s 132 → 138, where E holds 125 → 50 rows per unit), resampled out of E through its LUT. No new artwork.
  * each column reads REAL visible water: the centre lane from s 132 on, the sides from the first s where the locked view
    sees them (smooth per-column shift along s);
  * the approved bubbles and Benny's splash foam (`tools/proj05/near_bubbles.json`, 15 marks in source river coordinates)
    are removed and refilled with water from further along the same columns (gradient-domain clone), so no bubble repeats
    down the river — the game's own bubbles / splash stay separate 3D objects;
  * the colour seam along the approved Benny's footprint (inside it the proj05 water is the user's isolated artwork) is
    healed (`tools/proj05/near_fillmask.py` → `near_fillmask_src.png`; explicit colour matching + 10-texel cross-fade);
  * repeated with `MirroredRepeatWrapping` along s (period 13.1 u); near both mirror lines the tile advances through the
    source more slowly, so slanted ribbons BEND back instead of kinking into a "V".
* **Shader** (`src/vfx/waterRibbon.ts`, inside `#ifdef PROJ05`, uniforms `uPjNear`, `uPjT2`, `uPjWT2`, `uPjT2S`; one guarded
  line in `src/vfx/index.ts` feeds the ride position):
  * within 0.5 u of the locked checkpoint NOTHING changes (`pjNearK() = 0`): the locked picture is the previous one
    pixel for pixel; from 0.5 to 2 u of riding the experiment fades in;
  * hand-over E → T2 by ride distance: a point d units past the locked checkpoint is compared with the density the locked
    view stored at the same distance from Benny (both straight from the LUT), not by the per-pixel Jacobian (which swings
    with every wave crest);
  * `projflow05=2` uses T2's own streak directions (`uPjWT2`), slope flipped on mirrored periods;
  * `&projneardetail05=` share of the fine-streak detail layer kept on T2, default 1 (0 / 0.5 for comparison).

## What went wrong on the way (kept as evidence, `first_attempts/`, `tile_history/`)
1. First tile bounced the narrow visible strip back and forth across the river → kaleidoscope
   (`tile_history/0_…kaleidoscope…png`). Replaced by the per-column shift.
2. Bubble holes filled with straight interpolation → flat bars (`2_…bar_fill_rejected.png`). Replaced by cloned water.
3. E → tile hand-over by the per-pixel Jacobian flickered into horizontal stripes on the waves
   (`first_attempts/8u_striped_handover_bug.png`, layer map next to it). Replaced by the ride-distance test.
4. That first ride-distance version changed 12–47 k pixels of the LOCKED view (far river handed to the tile). Fixed with
   the separate sampler + `pjNearK()`; locked view now 0 px different (see Checks).
5. A torn dark edge beside Benny 17 u into the ride = the artwork-fill seam, exposed by the repeating tile
   (`tile_history/artwork_fill_outline_on_tile.png`, `seam_before_left_healed_right_2x.png`). `cv2.seamlessClone` left the
   interior unchanged; replaced by explicit colour matching.
6. Tile cut from s 130.5 put Benny's splash rings on the mirror line → a "bullseye" every 15 u
   (`tile_history/repeat_preview_start130_5_left_start132_right.png`). Cut moved to s 132.
7. Capture runs started in parallel changed ~150 HUD pixels (timing under load) and looked like a regression: run the
   regression captures ONE AT A TIME.

## Overlay settings compared (`overlay_compare/`, tile cut of that moment: start 130.5, before the seam heal)
`metrics_overlay_settings.json` (`tools/proj05/near_metrics.py`: mean Sobel gradient of luminance in three screen bands,
river pixels only, Benny's box left out; higher = sharper; these are sharpness measurements, NOT match percentages):

| mean gradient | BEFORE (`projflow05=2`) | NEW detail 0 | NEW detail 0.5 | NEW detail 1 |
|---|---:|---:|---:|---:|
| 8 u — bottom / beside Benny / ahead | 15.2 / 26.7 / 40.7 | 13.7 / 23.9 / 42.7 | 15.2 / 25.5 / 43.2 | **17.5 / 27.7 / 44.0** |
| 17 u | 12.2 / 18.1 / 30.8 | 16.6 / 37.7 / 39.7 | 18.0 / 39.4 / 42.0 | **20.1 / 42.1 / 45.7** |
| 35 u | 8.8 / 24.6 / 39.0 | 16.4 / 38.4 / 71.0 | 17.0 / 40.3 / 72.1 | **18.0 / 43.4 / 74.4** |

Detail 0 was softer than BEFORE at 8 u (there the tile shows the stretch of the source that is itself only 50–60 rows per
unit); detail 1 is sharper than BEFORE in all nine cells and showed no grain in the full-size crops
(`crop_08u_BEFORE_det0_det1.png`, `crop_17u_…`). → default 1. At the locked view (0 u) all versions are identical; the
APPROVED picture measures 62.6 / 53.2 / 78.9 in the same bands (locked game 51.2 / 48.2 / 63.3).
**These numbers are for the earlier tile cut. Re-measure with the final tile (below: "Still to do").**

## Checks so far
* Locked view, captures run one at a time (`regression/`): default game 05 = `qa/pilot05/current_default_05.png` 0 px;
  protected BEFORE (`?ringa=26&nearfloor05=0`) = `qa/pilot05/wave9/baseline/05.png` 0 px; full stack + `projflow05=2`
  0 px vs before this work; full stack + `projflow05=2&projnear05=1` vs the same without `projnear05`: **0 px**.
  (Shader state at that check: separate sampler + `pjNearK`; the later changes were the tile cut, the seam heal and the
  overlay default — the locked view cannot see them, re-check anyway.)
* Recovered game before any change: gameplay test on the full stack + `projflow05=2` 8 / 8, plunge 61.41, errors []
  (`tests/gameplay_recovered_full_flow2.json`); `tsc` OK; continuity OK.

## Still to do (in this order)
1. Ride frames 0 / 8 / 17 / 26 / 35 u + layer map with the FINAL tile (cut 132, healed, eased) — look at them full size.
2. Decide on the 2048-wide tile (`tile_history/candidate_1024_left_2048_right_same_patch.png`: 213 texels per unit across,
   PNG 1.4 MB instead of 0.7 MB): the screen bottom shows 220–300 px per unit across and the source has it.
3. Re-measure (`near_metrics.py`), ride clips BEFORE / NEW (`scripts/proj05-move.mjs --clip=4`), flow direction check.
4. Gameplay test 8 / 8 with the full URL, continuity, `tsc`, default + BEFORE + locked-view pixel checks again.
5. Show the user: approved | recovered | NEW as separate full-size pictures, the clip, and what still differs.

## Reproduce
```
node scripts/proj05-ride-probe.mjs --q='proj05=1' --out=<scratch> --d=0,8,17,35     # or use probe/ride_XX.npz (in git)
python3 -I tools/proj05/near_fillmask.py qa/pilot05/proj/near/probe/ride_00.npz
python3 -I tools/proj05/near_bake.py assets/textures/water05                       # T2 + WT2 + proj05_near.json
node scripts/proj05-move.mjs --q='<full URL>' --out=<dir> --d=0,8,17,35 [--clip=4 --fps=24]
python3 -I tools/proj05/near_metrics.py qa/pilot05/proj/near/probe out.json BEFORE=<dir> NEW=<dir>
```
Folders: `ride_before/` BEFORE ride frames (full size) · `overlay_compare/` the three settings · `tile_history/` every
tile version · `first_attempts/` the failed versions · `regression/` locked-view captures · `probe/` river coordinates per
screen pixel at 0 / 8 / 17 / 35 u (compressed) · `tests/` gameplay · `tools/` one-off check scripts.
