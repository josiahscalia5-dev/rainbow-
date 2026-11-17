# Screen 07 — fal clean-plate request (PREPARED, NOT RUN)

Status: **not run.** No paid job without the lead's go message and the user's OK (fal.ai credits).

Why: under `?match07=1` the texture is the user's ORIGINAL approved pixels everywhere except where the game draws its own
objects (HUD bar, title banner, Benny, the eight picture coins = 22.1 % of the frame,
`assets/textures/match07/plate07_fillmask.png`). Those areas currently carry a PROVISIONAL local fill
(`tools/match07/make_plate07.py`: smooth colour from the surrounding pixels + mirrored water texture). The fill is hidden
by Benny in the start view, but becomes visible as a mirrored "kaleidoscope" patch on the water left/in front of Benny
when the camera moves forward 3–6 u (`qa/match/07/motion/f03_forward3u.png`). A clean environment plate fixes that.

## Request (one call)
* Model: `fal-ai/nano-banana-2/edit` (same as Screen 08's plate, `qa/imageblaster/08/`)
* Input image: `references/07_dive_the_washer_tube.png` (864×1536, unchanged; upload the file, never modify the reference)
* Prompt:
  > Remove the pink fluffy creature with the knitted purple-and-white beanie and its splash, all gold coins, the top
  > status bar (hearts, coin counter, pause button) and the title banner "07 · DIVE THE WASHER TUBE". Fill those areas with
  > the surrounding scenery exactly as painted: the swirling cyan and magenta S-river with its white foam banks and
  > bubbles where the creature and coins were, the purple perforated tunnel wall with gold rings where the bar and banner
  > were. Keep everything else pixel-identical: same framing, same perspective, same colours, same lighting, same style.
* Output: 1 image, same aspect 9:16, PNG.
* Expected cost: one image edit (cents).

## After it runs (free, local)
1. Save as `assets/textures/match07/plate07_clean.png`; resize to 864×1536 if needed.
2. Hybrid as on 08: original pixels outside the fill mask, clean plate inside (feathered 3 px):
   edit `tools/match07/make_plate07.py` to take the clean plate for the masked area, re-run it (also rebuilds the tiles).
3. Re-measure (`tools/match07/metrics07.py`) and re-run `tools/match07/motion07.mjs`.
