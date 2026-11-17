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
