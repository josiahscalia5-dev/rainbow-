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

## Still to correct (visual)
1. **Coins** — the game's coins (gameplay) sit along the new path but not on the painted coins' places/count → the
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
