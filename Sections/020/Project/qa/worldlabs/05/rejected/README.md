# Rejected Screen 05 environment plates: do NOT upload these to Marble or Atlas

* `v1_*` (tools/make_env_plate.py): copied real water/wall pieces into the masked areas.
  **Rejected by the user (2026-11-15 ~20:05 UTC)**: rectangular patches, repeated textures, distorted geometry,
  grey smear in the river; risk that Marble rebuilds the artifacts as real 3D objects.
* `v2_*` (tools/make_env_plate_v2.py): procedural repaint of the whole Benny area (harmonic band field +
  synthetic streaks). Not shown to the user; judged failed by the coordinator: the 450 px hole reads as a flat
  pale-cyan blob with hair-like streaks, and a pink band ends in a blob.

Kept only as a record of what was tried. The current candidate is `../plate_v3/` (geometry-focused crop).
* `v3_*` (tools/make_env_plate_v3.py): geometry crop + coin-hole fills. Three fill methods tried on the coin holes
  only, all judged failed by the coordinator: harmonic colour solve (hazy discs), OpenCV FSR (blurry dark-green
  ghosts), exemplar/Criminisi (blocky patch tiles and a wall patch copied into the river near the VP). The saved
  `v3_*` images are from the last (exemplar) run. Following the user's instruction, pixel filling was stopped here:
  the deliverable is `../geometry_ref/` (real pixels only, coins flagged, nothing invented).
