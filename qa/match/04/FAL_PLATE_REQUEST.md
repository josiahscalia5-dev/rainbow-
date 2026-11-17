# Screen 04 — fal clean-plate request — RUN ONCE 2026-11-17 16:56 UTC (request 01a1ea70-42d8-7943-b035-7bb5f129d872; result + record in `fal/`, see NOTES.md milestone 2 §5). No further fal call is authorised.

Purpose: replace the PROVISIONAL local fill (OpenCV inpainting + mirrored artwork texture, 23.4 % of the frame:
HUD bar, title banner, Benny, the five coins) in `assets/textures/match04/plate04_hybrid.png` with a clean
environment-only plate, exactly as Screen 08 did (`qa/imageblaster/08/`). The final texture stays a HYBRID: the user's
original pixels everywhere they show scenery + the fal plate only inside `assets/textures/match04/plate04_fillmask.png`.

* Model: `fal-ai/nano-banana-2/edit`, 1 image, 2K, aspect 9:16 (as 08; cost: one edit, cents — confirm the price first).
* Input: `references/04_through_the_five_arrows.png` (sha256 in `scripts/reference.sha256`, never modified; staged as a copy).
* Prompt (exact):
  > remove the following from the image: the game HUD bar at the top (heart counter, coin counter and pause button), the
  > purple title banner reading 04 · THROUGH THE FIVE ARROWS, the pink fluffy character in the knitted purple-and-white
  > hat and its white splash, all five gold dollar coins. Continue the swirling cyan and pink water, the glowing chevron
  > arrows on the water and the room behind (porthole, towels, control panel) naturally where they were hidden. Keep
  > everything else exactly as it is: the gold ring tunnel, its rings, colours, lighting, foam and bubbles.
* Command (Image-Blaster setup as in `qa/imageblaster/08/NOTES.md`, separate folder, keys only as proxy-injected
  network secrets — NOT configured on this account yet):
  ```
  node .claude/scripts/image-edit/generate-edit.mjs \
    --image worlds/rainbow-04-five-arrows/source/0-04-through-the-five-arrows.png \
    --prompt "<prompt above>" --output-dir worlds/rainbow-04-five-arrows/source --role plate \
    --output-slug 04-five-arrows-plate --aspect-ratio 9:16 --resolution 2K
  ```
* After: align the plate to 864×1536 (as `08_plate_alignment.json`), composite into the fill mask only, re-run
  `tools/match04/make_plate04.py`-style composite, re-capture, re-measure; reject the plate if it redraws the rings,
  porthole or towels (retry once).
