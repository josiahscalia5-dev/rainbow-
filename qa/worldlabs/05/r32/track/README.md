# Screen 05 full-length track test (round 32, 2026-11-21) — free, existing assets only
User: "YES, CONTINUE THE FREE SCREEN 05 GAMEPLAY TEST … You may reuse gold rings and compatible tunnel structures, but I DO NOT want an obviously
repeating river pattern every second … FIRST: Finish the full-length Screen 05 test using the existing assets, without spending additional credits."

Built by `tools/marble05/build_track.py` from the full Marble world (`full_500k.spz`, `full_100k.spz`):
* start piece = the world as the approved picture shows it, up to ring B; then copies of the sharp ring A -> ring B section, each placed so its
  gold ring sits exactly on the previous ring (3D ring centres measured from the gold, `rings.json`); walls cut at the ring.
* the river (water + foam only) is mirrored in every other copy about its own centre line, so it bends right, left, right … (walls / rings /
  machinery reused as they are — mirroring the walls showed dark gaps, `CHECK_full_mirror_vs_none.jpg`).
* water cross-faded across each ring; water eased down inside each copy so it meets the next copy without a step.
* sharp copies near Benny, 100k-splat copies further away (phone budget), the world's own tunnel end after the last copy drawn.
* gameplay page `tools/marble05/viewer/play3.html` (three.js 0.180 + Spark 2.4.0): the improved 3D Benny (game mesh / bake / paddling shader),
  follow camera that starts exactly at the approved picture's camera, lean into the bends and his steering, his painted splash travelling with
  him, flowing glints, bubbles, coins.
* recording: `tools/marble05/viewer/track_clip.cjs` (30 fps, normal speed 1.4 units/s, ~7.6 s = the whole level).
