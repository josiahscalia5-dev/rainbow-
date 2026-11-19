# Screen 06 — fal clean-plate request — PREPARED ONLY, NOT RUN (2026-11-17, round 3)

**Status: NOT run. No fal / World Labs / Meshy / Rodin job may run without the user's explicit OK through the lead**
(round-3 rules: the Screen 04 authorisation covered exactly one edit, already used). Nothing in this file has been sent.

Purpose: replace the PROVISIONAL local fill (OpenCV Telea inpainting + mirrored artwork texture, `make_plate06.py`;
23.9 % of the frame: HUD bar, title banner, Benny above his ripples, the 15 painted coins) in
`assets/textures/match06/plate06_hybrid.png` with a clean environment-only plate, exactly as Screen 08 did
(`qa/imageblaster/08/`) and Screen 04 (`qa/match/04/fal/` on `claude/rainbow-s04-match-c2`). The final texture stays a
HYBRID: the user's original pixels everywhere they show scenery + the fal plate only inside
`assets/textures/match06/plate06_fillmask.png`.

Why it matters (measured / seen): in the approved view the fill is hidden by the game's own HUD, Benny and coins
(scenery 98.8 % within 20 levels). It shows only when the camera moves: the blurry Benny fill was a white smear on the
water at 3 u forward (round 3 now hides it with the painted-water tile, `mask06.png` R channel), and the coin fills
are soft patches on the water/walls while riding. A clean plate would give real painted water + walls there.

* Model: `fal-ai/nano-banana-2/edit`, 1 image, 2K, aspect 9:16 (as 04/08; one edit — confirm the price first).
* Input: `references/06_crest_the_rinse_arch.png` (sha256 in `scripts/reference.sha256`, never modified; staged as a copy).
* Prompt (exact):
  > remove the following from the image: the game HUD bar at the top (heart counter, coin counter and pause button), the
  > purple title banner reading 06 · CREST THE RINSE ARCH, the pink fluffy character in the knitted purple-and-white
  > hat with the yellow star (keep the circular water ripples and splash ring around where it sat), and all fifteen gold
  > dollar coins, including the small ones running along the river into the tunnel. Continue the cyan, blue, pink and
  > rainbow river streaks, the foam banks and the purple perforated tunnel wall naturally where they were hidden. Keep
  > everything else exactly as it is: the gold rings, the tunnel and its vanishing point, the river's curl over the
  > crest, the bubbles, colours and lighting.
* Command (Image-Blaster setup as in `qa/imageblaster/08/NOTES.md`, separate folder, keys only as proxy-injected
  network secrets):
  ```
  node .claude/scripts/image-edit/generate-edit.mjs \
    --image worlds/rainbow-06-crest/source/0-06-crest-the-rinse-arch.png \
    --prompt "<prompt above>" --output-dir worlds/rainbow-06-crest/source --role plate \
    --output-slug 06-crest-plate --aspect-ratio 9:16 --resolution 2K
  ```
* After (if the user approves and it runs): align the plate to 864×1536 (as `qa/imageblaster/08/08_plate_alignment.json`),
  composite into `plate06_fillmask.png` only (feathered), write `plate06_hybrid_fal.png` (new file — the provisional
  plate stays reproducible), switch it in behind a new sub-switch, re-capture, re-measure (`tools/match06/measure06.py`),
  re-run the moving frames (`tools/match06/motion06.mjs`); reject the plate if it redraws the rings, the tunnel or the
  river's curl. No automatic retry.
