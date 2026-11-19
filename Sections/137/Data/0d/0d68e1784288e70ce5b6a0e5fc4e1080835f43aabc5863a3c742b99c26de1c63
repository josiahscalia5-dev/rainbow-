# rainbow-full-game-match05-2026-11-17.mp4 — full playthrough video (01 → 11)

* Recorded 2026-11-17 (session 01VCMXob) from the SAME web bundle that is inside `rainbow-debug-match05-2026-11-17.apk`
  (commit `aefa92b`, `VITE_RAINBOW_Q05="match05=1"` baked in; no URL switches), headless Chromium + SwiftShader WebGL2.
* Deterministic: the real game simulation advanced in 1/60 s steps, one frame rendered every 1/30 s, so the video plays at
  true game speed. Steering = the coin-seeking policy of `scripts/gameplay-test.mjs` (autopilot, not a human player).
* H.264 High, 720 × 1280, 30 fps, 1,735 frames, 57.83 s, no audio (the game has no sound yet), 0 console errors.
* Timeline: 0 s intro 01 (real-time 3D; the Google Flow clips are not in the repo), 7.4 s 02, 14.0 s ride 03, 17.2 s 04,
  20.4 s 05, 27.1 s 06, 32.4 s 07, 44.3 s 08, 45.9 s 09, 47.5 s 10, 49.6 s outro 11, 53.6 s FINAL SPIN COMPLETE (held 3 s).
  Coins 1,330 → 2,330, hearts 5/5 throughout.
* Recorder: `node record_full.mjs <build_root_with_dist> <out_dir> --w=720 --h=1280 --fps=30 --hold=3` (scratch script,
  copied to `tools/video/record_full.mjs`), then `ffmpeg -framerate 30 -i frames/%05d.jpg -c:v libx264 -preset slow -crf 20
  -pix_fmt yuv420p -movflags +faststart`.
