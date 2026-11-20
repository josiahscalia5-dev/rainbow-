# Screen 08 — approved scenery on real 3D geometry (`?match08=1`, 2026-11-17, session 03b94f36)

User order (2026-11-17): apply the cleaned environment-only Screen 08 artwork to the actual 3D game environment behind a
test switch; real geometry + texture projection (not a flat picture); match camera, proportions, architecture,
waterway, colours, lighting; correct mismatched geometry; APPROVED | BEFORE | NEW as separate full-size pictures;
measure; check that it can work with a moving camera on Android. **Default build unchanged (0 px, verified).**

## What `?match08=1` does (all behind the switch; files)
1. **Camera** (`src/game/match.ts` MATCH_CAM['08'], `src/game/cameraRig.ts` off08/aim08): solved in the live game so
   Benny's box, the door and the platform land on the approved picture at the game's own 62° FOV (Benny box
   266,843–594,1216 vs approved 260,850–600,1210; door 489,399 vs 490,400; platform 483,565 vs 480,560). The game's
   chamber proportions already agree with the picture — only the camera was off. Camera: Benny + offset, aimed at the
   door, level (no bank roll); blended in before the checkpoint, out before 09.
2. **Waterway** (`src/world/course.ts`, `assets/textures/match08/river08.json`): the 08–10 river path follows the
   APPROVED painted S-river — its centre line traced from the artwork (`tools/match08/river_centre_px_approved08.json`)
   and projected onto the chamber floor from the locked camera (`tools/match08/river_proj.py`); camera ↔ path iterated
   to convergence (5 rounds, Benny x 12.95 → 12.21). Benny and the coins now ride IN the painted river.
3. **Geometry** (`src/world/match08.ts`, layout `assets/textures/match08/proj08.json` from
   `tools/match08/fit_proxies.py <cam08_locked.json> <proj08.json>`): inlet pipe around the camera (the picture's near
   walls), gold arch (annulus at the chamber entrance, feet on the floor → depth 6.4 u), chamber cylinder (r 13.5) +
   door wall (z −332) — the game's real dimensions, floor plane at the chamber floor (y −113.6), platform at the game's
   z −325 sized from the picture (r 8.5; top tilted 4.9° toward the camera because the picture shows its top from above
   while the game eye is level with it), rim, leg skirt, towel box, four half-dome spouts (upper pair in front of the door
   wall, lower pair on the side walls), back wall placed behind Benny.
4. **Texture** (`assets/textures/match08/plate08_hybrid.png`, 1536×2731): the user's ORIGINAL approved pixels
   everywhere they show scenery (79 % of the frame) + the fal clean plate only where Benny, HUD/title and coins were
   removed (20.8 %). (`plate08_clean.png` = the fal-only plate, kept for A/B.) Camera projection from the locked camera
   with a projector depth test (surfaces the picture never showed get a plain fallback colour instead of a smeared copy);
   the shader undoes the post chain (PROJ05_INVERSE: grade → sRGB → Neutral → exposure), no fog; bloom 0 on 08 under the
   switch (the artwork carries its own glow). Old 08 chamber decor, river ribbon, foam, bubbles hidden on 08 only.

## Measured (approved vs capture, `tools/qa/screen_match.py` measures; `scenery_metrics_BEFORE_NEW.json`, `08_NEW_screen_match.json`)
| | BEFORE (current game) | NEW (fal-only texture) | **NEW (hybrid texture)** |
|---|---|---|---|
| whole frame within 20 levels | 4.0 % | 76.6 % | **80.6 %** |
| below HUD within 20 | 3.4 % | 82.6 % | **87.1 %** |
| whole-frame SSIM | 0.20 | 0.73 | **0.78** |
| SCENERY (no HUD strip, no Benny) within 20 | 3.3 % | 90.5 % | **95.4 %** (SSIM 0.935) |
| upper chamber (door, towel, rings, upper spouts) | 2.1 % | 91.8 % | **98.5 %** |
| middle y600–840 (river start, lower spouts, COINS) | 3.0 % | 75.9 % | **83.5 %** |
| lower river, foam, walls (no Benny) | 4.4 % | 96.1 % | **98.5 %** |

Pictures: `08_BEFORE_current_game.png`, `08_NEW_match08.png` (approved = `references/08_final_spin_chamber.png`).
Gameplay test 8/8 both builds (`qa/gameplay_test.json` unchanged; `gameplay_test_match08.json`), tsc clean.

## Update 2026-11-17 ~14:05 UTC — the approved picture's coins (`?match08=1` only)
The game's 08 + 09 coin rows are replaced by the picture's nine coins where the picture shows them
(`assets/textures/match08/coins08.json`: near five stand on the water from their bottom edge; the far four — beyond the
platform front in 3D — pinned at the river end z −311…−315.5 with height from the picture; size from the picture;
`src/gameplay/coins.ts` converts them to river s/lateral, still real pickups). Result (hybrid texture):
SCENERY 95.4 % → **96.8 %** within 20 levels (SSIM 0.947), middle band 83.5 % → **90.1 %**, whole frame 80.6 % →
**82.0 %** (SSIM 0.796). Gameplay 8/8; a full run now collects 82 coins instead of 91 (9 picture coins replace the 17
of 08 + 09 under the switch). Default build 0 px. Coins still spin (seen at an angle), Benny's bigger hat covers the
nearest one.

## Still to correct (visual)
1. **Coins** (done above, except spin/facing) — the game's coins (gameplay) sit along the new path but not on the painted coins' places/count → the
   middle band (83.5 %). Next: a measured 08 coin layout from the approved picture (like line B's `coins05`).
2. **Benny's look** — the game Benny's hat is larger and his fur/pose differ from the painted Benny (Benny specialist
   work; line B has `benny05` for Screen 05 to reuse). Splash ring around him differs.
3. **Moving camera** (`motion/`, real sim, 3/6/10/15 u forward + steering ±1.85): the chamber interior (door, porthole,
   towel, platform, spouts, streams, wall slots, S-river) holds with correct parallax; Benny + coins stay in the
   painted river. Breaks: when the camera passes the near gold arch (≥ 3 u forward) the inside of the arch/pipe — never
   seen in the picture — shows flat fallback purple and stretched gold at the frame edges; texture gets softer as the
   camera approaches the door. Fixes: a second projection / outpainted wider artwork for the arch's inner faces and
   the near walls (a fal outpaint of the clean plate, cents), a perforated-metal material instead of the flat fallback,
   and a sharper near-tile for the door/platform (as `projnear05` did for 05).
4. At 15 u the ride enters 09, which still shows the old chamber (09/10 are videos in the user's plan).

## Android readiness (not yet run on a device — headless SwiftShader only)
* Draw calls 81 vs 160 default; triangles 384,690 vs 610,707 (old 08 decor hidden).
* Shader: 2 texture reads + ~40 ALU ops per fragment — cheap on mobile GPUs. No per-frame CPU work except two uniforms.
* Memory: hybrid texture 1536×2731 RGBA ≈ 16.8 MB (+ mips ≈ 22 MB) + projector depth map 1024×1820 ≈ 7.5 MB.
  For Android: KTX2/ASTC-compress the texture (≈ 2–4 MB), 512-wide depth map (≈ 1.9 MB) or bake visibility into
  the texture, 1024-wide texture on low-end devices. PNG download 6.1 MB.
* Next: `npm run android:debug` with `VITE_RAINBOW_Q05=match08=1` (the APK reads the same keys) and a device FPS run.

## Reproduce
```
node tools/match08/probe08b.mjs 'match08=1' > cam.txt; tail -1 cam.txt > cam08.json   # locked camera
python3 -I tools/match08/river_proj.py cam08.json tools/match08/river_centre_px_approved08.json assets/textures/match08/river08.json
# (repeat the two lines until the camera stops moving), then:
python3 -I tools/match08/fit_proxies.py cam08.json assets/textures/match08/proj08.json
node scripts/capture.mjs 08 --q=match08=1 --out=<dir>; node tools/match08/motion08.mjs <dir>
```

## FINISH ROUND (user order "finish Screen 08 before Phase 2", 2026-11-17 ~14:15 UTC) — all behind `?match08=1`
1. **Arch / unseen surfaces when moving**: no more flat fallback colour. Surfaces the approved picture never showed get
   triplanar, mirrored tiles of material patches CUT FROM THE ARTWORK (`assets/textures/match08/patch_wall|gold|towel.png`:
   slotted purple metal, gold band, terry towel); a stretch guard switches a surface to its patch where the moving camera
   sees it ≥ 2.5–6× more face-on than the approved view did (ratio of incidence cosines = 1 in the approved view → that
   view unchanged). Remaining: a darker purple band at the lower-left edge 3–6 u forward (near pipe at a steep angle).
2. **Benny on 08** (Game.ts M08_BENNY, restored when leaving 08): beanie 0.86×, body 0.16 u higher out of the water,
   white-and-purple knit stripes (crown tint), the approved picture's SPLASH RING cut from the original image
   (`splash08.png|json`, white/low-saturation alpha, gold + fur excluded) as a camera-facing card riding with Benny 1.3 u in
   front of him; the game's thin splash fans + spray hidden on 08. Benny + splash area 61.0 % → 64.5 % within 20 levels.
   Not yet: his body is a little wider than painted and sits ≈30 px right; fur/face are the game model's. No files were
   taken from line B (`ccr-b0757dec-dj6l1o` untouched); its `benny05` bake is Screen-05-specific.
3. **Coins**: the nine picture coins face the approved camera (upright, ±3° wobble) at the painted size; any coin beyond
   pickup reach slides along its own view ray (same pixel in the approved view) to the nearest depth within reach
   (|lateral| ≤ 1.0, ≥ 0.3 above water) — fixes a search-range bug that had pinned five coins to one point.
4. **Coin total preserved**: 91 coins (run total 2,240) exactly as the default game — the 8 coins the picture's 9 replace
   go into the inlet just before the 08 view; coins sorted in river order under the switch. Gameplay 8/8 with the switch
   and without (default test output byte-identical).
5. **Measured FINAL** (`scenery_metrics_BEFORE_FINAL.json`): scenery 97.4 % within 20 levels (SSIM 0.959; upper 98.9 %,
   middle 91.0 %, lower 99.2 %), Benny + splash 64.5 %, whole frame 83.0 % (SSIM 0.815), below HUD 89.8 %, layout 90.9 %.
   BEFORE (current game): 3.3 / 2.9 / 4.0 %.
6. **Android**: `builds/rainbow-debug-match08-2026-11-17.apk` (21.3 MB, `VITE_RAINBOW_Q05="match08=1" npm run
   android:debug`, Git LFS) — the whole APK runs with the 08 switch on. NOT run on a phone: this cloud session has no
   device or emulator (no adb device). Phone-size render (1080×1920, same 9:16) `08_NEW_match08_android1080x1920.png`.
   Install: `adb install -r builds/rainbow-debug-match08-2026-11-17.apk` (or copy to the phone and open it).

## BENNY ROUND (user, 2026-11-17 ~14:40 UTC: "method approved, Screen 08 NOT finished — finish Benny") — `?match08=1` only
* Placement measured on the pink-fur component (approved vs game): centre x 428 vs 432, box x 263–593 vs 265–587, top
  1049 vs 1050 (before: centre 393 — he was ≈23–35 px LEFT, not right as I had written earlier). Game.ts M08_BENNY:
  `dx 0.22` (world, visual offset of AuxScene only — gameplay position, pickups and camera unchanged), `lift 0.06`,
  body scale (0.94, 1.0, 0.94) with the beanie counter-scaled (beanie 0.86×), white knit stripes; splash card alpha
  strengthened (×1.7, γ 0.85) and kept at its approved-picture position (not moved with dx).
* Result: Benny + splash 64.5 % → **66.2 %** (SSIM 0.636); scenery unchanged **97.4 %**; whole frame **83.4 %**
  (SSIM 0.819), below HUD 90.2 %. Gameplay 8/8, **91 coins / 2,240** (same as the default game). Default 0 px.
* STILL DIFFERENT (needs the next step): surface detail — the painting's soft shaded magenta fur, the beanie's visible knit
  stitches / ribbed cuff / thicker white stripes, the pom-pom yarn, the star's shape.
* NEXT (plan for the next session — do NOT merge line B): port line B's `benny05` work as an 08 variant.
  Line B (`ccr-b0757dec-dj6l1o`, read-only) has `src/characters/benny/benny05.ts` (beanie geometry fixes, swim-roll
  damping, finer shell fur FUR05, albedo maps baked from the APPROVED pixels into each part's UV space via
  `qa/pilot05/full_reference_match/benny/work/bake.py`, calibration renders through the live post chain) + hooks in
  `runtime.ts` and `fur.ts` (`#ifdef BENNY05`). Steps: (1) back up both branches (they are on GitHub; note SHAs);
  (2) `git show origin/ccr-b0757dec-dj6l1o:<file>` the three source files + `tools`/bake scripts into a NEW branch
  from this one; (3) adapt the flag to `match08` (or a new `benny08`) and replace `on05` with this branch's `flag05`;
  (4) re-run the bake with the 08 approved picture and the locked 08 camera (`assets/textures/match08/cam08_locked.json`)
  → `assets/textures/benny08/*.png`; (5) verify default 0 px, 05/07 unchanged, Benny+splash score, gameplay 8/8, motion.
* Android: `builds/rainbow-debug-match08-2026-11-17b.apk` (this round; the earlier `…-17.apk` kept). NOT phone-tested.

## BENNY PORT (2026-11-17 ~15:00 UTC) — line B's benny05 transferred WITHOUT a merge
* Backups: line A was at `25703fa`, line B `ccr-b0757dec-dj6l1o` at `99ab17b` (untouched). Copied only
  `src/characters/benny/{benny05.ts,runtime.ts,fur.ts}` (this branch's copies were unchanged since the split, so line B's
  are clean supersets) + `assets/textures/benny05/*.png` (9 maps baked from the APPROVED 05 pixels into Benny's UVs).
  `benny05.ts` flag adapted: runs under `?benny05=1`, `?benny08=1`, `?match08=1`, `?matchall=1` (this branch's flag05) —
  on every screen while the switch is on, so Benny stays consistent; default build 0 px (verified).
* Effect: knitted beanie with stitches + white/purple stripes + ribbed cuff, yarn pom-pom, approved gold star, softer
  denser shell fur, damped swim roll. The 08 crown tint was removed (maps carry the colours); placement re-measured
  (fur centre 422 → nudged dx 0.26).
* Measured: Benny + splash 65.8 % within 20 levels (SSIM 0.632; 66.2 % before the port — pixel tolerance does not
  reward the new fine knit/fur detail, visual match is clearly closer), scenery 97.4 % unchanged, whole 83.3 %.
  Gameplay 8/8, 91 coins / 2,240. NOT yet re-checked: Benny in motion on the other screens; APK not rebuilt with the port.
* Still to do before asking for approval: user's gameplay-video findings (camera obstructions by washer parts/foam,
  34–37 s gold structure + dark region at a transition, 38–40 s whether the 08 camera engages) — needs the recording
  (not received in this session); optional re-bake of the maps from the 08 picture with the locked 08 camera.

## BENNY CHECK ROUND (2026-11-17 ~15:20 UTC)
* Moving (real sim, ported Benny): `motion/montage_ported_benny.png`, `*_ported_benny.png` — beanie knit, pom, star and fur
  stay on the 3D model while swimming / steering (maps are baked into his UVs, not projected).
* Screens 04–07 with `?match08=1` vs default (`other_screens/`): the scenery is unchanged; the only changed regions are
  Benny + his wake (new beanie/pom/fur, damped swim roll) and a few coin-sized spots (coin pose). 04 3.5 %, 05 8.0 %,
  06 14.7 %, 07 10.3 % of pixels — the largest connected change on every screen is Benny's own box.
* Re-bake of the maps from the 08 picture: NOT done this round (needs line B's bake pipeline + calibration renders at the
  locked 08 camera; plan in BENNY ROUND → NEXT). Current maps = line B's, baked from the approved 05 Benny.
* APK with the ported Benny: `builds/rainbow-debug-match08-2026-11-17c-benny.apk` (earlier `…17.apk`, `…17b.apk` kept).
  Not phone-tested. Gameplay 8/8, 91 coins / 2,240 (previous round, code since then unchanged except docs).
* Gameplay video from the user: not received in this session yet.
