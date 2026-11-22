# Rainbow Screen Builder — LESSONS (read before building; append one line per new lesson: symptom → cause → fix → check)

## Code bugs already paid for
| # | Symptom | Cause | Fix | Check |
|---|---|---|---|---|
| L1 | Own-pixel kit materials silently rendered with the plain shader (r33b) | three.js keys shader programs on the `onBeforeCompile` SOURCE; two variants with identical source share one program | `material.customProgramCacheKey = () => 'kit-own'` (a different key per variant), as in `kitgame.html` `kitMat()` | render the variant alone; diff the start frame vs the plain variant |
| L2 | Code silently missing three times: a `return`, Benny's scale, `scene.add(splash)` (the white splash was never in the scene) | a `//` comment inserted MID-LINE in a long one-line statement swallowed the code after it | put comments at the END of a statement or on their own line; one statement per edit | `grep -nE '//.*(;\|\b(const\|let\|return\|scene\.add\|window\.)\b)' <page>` and read every hit |
| L3 | Hard seam in the river | a uniform object nested inside another uniform's `{ value }` | keep every uniform flat: `{ uName: { value: x } }` | log `material.uniforms` keys once |
| L4 | `benny31.glb` loads as garbage / page never `ready` in a fresh clone or worktree | Git-LFS pointer file (~130 bytes, "version https://git-lfs") because worktrees are created with `GIT_LFS_SKIP_SMUDGE=1` | link LFS binaries from the main checkout (`setup_kit.sh <ws> <asset repo>`); never commit a pointer over a real file | `head -c 200 benny31.glb \| grep git-lfs` (acceptance.sh / setup_kit.sh refuse) |
| L5 | A test browser silently loaded ANOTHER specialist's game | a busy / reused port served a different folder | bind `127.0.0.1`, random port, byte-compare the served `play3.html` with the file on disk before testing (final_acceptance.cjs, live_check.cjs do) | the harness throws "could not start a server that verifiably serves" |
| L6 | Likeness numbers distorted | the approved 864x1536 picture squashed to 412x915 | scale to the frame HEIGHT, centre-crop the width (the game keeps the vertical fov) — `reference_in_phone_frame()` | `validate_05.sh` regression step |
| L7 | mp4 encode fails on every 412x915 run | yuv420p needs even sizes | crop to 412x914 (`crop=trunc(iw/2)*2:trunc(ih/2)*2`) | final_acceptance.cjs writes the results BEFORE encoding |
| L8 | `HoughLinesP` result indexing crashes | OpenCV 5 returns (N, 4), older (N, 1, 4) | `np.asarray(L).reshape(-1, 4)` | analyze_reference.py on all 11 references |
| L9 | `ImportError` for a sibling script under `python3 -I` | isolated mode drops the script's folder from `sys.path` | `sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))` (the kit tools and these scripts do) | run with `-I` |
| L10 | References look like JPEGs | `references/*.png` are JPEG data with .png names, sha256-locked | read them with PIL / OpenCV as they are; NEVER rename or re-save | `sha256sum -c scripts/reference.sha256` |

## Look / method lessons
| # | Lesson |
|---|---|
| M1 | The painting is not strict perspective: from ring 2 inward each gold ring is ~1.52x deeper (constant ratio). A straight 3D tunnel matches it only through a camera-relative depth curve g() (identity up to ring 2, exponential beyond — the endless-runner "curved world" trick). Measure the ratio on each new picture (analyze_reference `rings.median_ratio`). |
| M2 | Generated worlds do not line up with the painting (05 Marble water plane tilted: a tunnel parallel to it puts the VP 138 px above the painted core) and blur after ~2-3 s of swimming. Fit your own geometry to the picture instead. |
| M3 | Live camera projection of the picture tears as soon as Benny moves; BAKE the picture into per-surface textures (each texel = the approved pixel where that surface lands in the approved view; nearest copy wins; clean plate x4 penalty). |
| M4 | Own-pixel → shared-section cross-fade at distance ratio 0.62 → 0.42 (0.85 → 0.55 looked washed out); texture mip bias -0.7 near, >= 0 far. |
| M5 | A flowing river tile with columns outside the painted river filled by flow-stretched texels → blocky pink bars + a repeating grid far away; far distance squeezes many periods. Keep the painted water at the same distance ahead (camera-relative) + a two-phase flow map; no tile seam. |
| M6 | A Lab colour match on the flowing tile turned the cyan greener (colour look 0.70 → 0.41): measure colour look after EVERY colour transform; prefer the painting's own pixels. |
| M7 | Painted pink river edges and Benny's dusty-rose fur share hue and saturation; local texture (grey std 9x9: fur ~21, water ~9-13) separates them (analyze_reference `benny`). |
| M8 | The approved picture's own dark details are <= ~30 px at 412x915 (05: 11 px); the dark-patch rule counts only connected near-black areas >= 150 px, so intentional dark areas are never errors. Check `dark.artwork_dark_below_limit` for every new screen. |
| M9 | Coins: draw the painted coin trail where the picture has it (`painted_coins.py`: 6 coins within ~1-8 px); a coin layout that ignores the painting is a top mismatch region (`compare.json → regions.coins`). |
| M10 | Benny model ~28 % wider than the painted Benny: scale / place him to the PAINTED outline (05: 0.76 / 0.82 / 0.8, +0.085 up, -0.04 side); his look is `benny-character-artist` work, not scenery. |
| M11 | This machine: 4 CPUs, SwiftShader WebGL. Kit ~1.5-2.5 s per frame, splat ~25 s. Two render slots (`render_slot.sh`), whole-level runs on slot 2. fps here is NOT a phone measurement — the phone build shows its own meter. |

## The user's acceptance rules (verbatim sources: USER_R32, USER_R34, USER_VISUAL_BRIEF_R26, USER_CLARIFICATIONS_R28)
* "My approved screen" = the same look WHILE Benny swims / steers, not only the start view (R19). Target 90-95 % (95 % preferred) — never
  claimed without evidence; report measured numbers and show the remaining differences.
* Evidence = ORIGINAL APPROVED | BEFORE | NEW as separate full-size labelled pictures (no grids) + a continuous clip, same position /
  steering / speed for BEFORE and NEW, normal speed first; start, middle, end, hard left, hard right, transitions.
* Real playable 3D: no video, no moving background, no scripted path; swipes drive Benny's real 3D position; no automatic jumps / dives
  to pass a test. Do not redesign the art to make movement easier.
* Testing: the WHOLE level with real touch swipes on an Android-portrait device / emulation, every direction repeatedly, coins by real
  collisions; thresholds fixed BEFORE the run and never loosened (acceptance_verdict.py history).
* "DO NOT SHOW ME A BROKEN RESULT AS FINISHED": the video / preview only after every check passes; if a requirement cannot be met, say
  exactly what blocks it. Then a phone-playable build so the user can feel the controls.
* Rings and structures may repeat; an obviously repeating river pattern every second may not.
* The visual checker must not mistake the artwork's intentional dark areas for errors.
* Screens 01, 02, 03, 11 = the user's Google Flow videos; 04-10 = playable 3D. One screen (05) until approved, then batches of two in
  isolated worktrees, the next batch only after the user's approval. No paid credits / plugins / purchases without the user's OK.
* r46 Benny "clipped 8 px" was really ~21 px: `bennyBox()` used the REST pose (every 3rd vertex) while the paddling arms / pompom are moved on the GPU
  -> the box now runs the same maths as VERT_BODY (world.html `bDef`); any framing guard must use it. Check: section_run `benny_offscreen_frames` = 0.
* r46 a camera guard placed BEFORE the wall clamp (CLAMPS) / water-height clamp is undone by them -> the last safety goes after every clamp, and is
  optical (lens shift `filmOffset`), not positional. Reset `filmOffset` wherever the camera pose is set directly (qa.js `qaRepeatView`: a stale
  shift dropped the repeat score 72 % -> 37 % at k = 0).
* r46 a yaw / framing guard tuned on the deformed box wobbles with every stroke and fired at the picture view (picture 83 % -> 33 %): guards use the
  rest-pose box with a margin; ALWAYS re-check the picture-view number after any camera change.
* r46 the route fitted through far painted coins (radius <= 10 px, depth spread +1.2 u) swung 0.84 u off the drum axis: Benny swam at the floor edge,
  into the foam bank, camera 0.3 u from the wall -> soft-cap the route's distance from the axis (fit05 `RC_L`), keep foam banks outside the river
  (`foam_pool_clear`). Probe exact frames with tools/world/probe_frames.cjs (qaPickScenery names the real mesh under a pixel).
* r46 GLSL `pow(x, 2.0)` with x < 0 is UNDEFINED (NaN on many GPUs -> black / missing pixels; likely the r45 'ribbon06' "pool stopped drawing") ->
  write x * x (water_ribbon.js `rbSq`).
* r46 more shader "richness" is not automatically closer: the deep-blue troughs / violet halo measured WORSE (water 61 -> 53) with the same camera
  (`?rich=0` A/B). Always A/B a look change with the same camera before keeping it.
* r46 the artwork-sampled wall period fused water / bubble / tray pixels (pale shards in 06, orange smears in 05): layout `tpl_wall_gate: 'strict'`
  rejects g >= 1.02 r (cyan / pale blue) and r >= 1.8 b (copper / brown). Cost: wall colour-histogram score 86.1 -> 83.3 on 05 (the smears added
  orange the painting has near the rings) - reported, not hidden.
* r46 the last area of the world (07) is open toward the game's 08 hand-over: its tube end showed the background (green hole, r45b frames 1362-1379)
  -> the last area gets the glowing far-end cap.
