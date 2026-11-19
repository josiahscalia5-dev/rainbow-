# Screen 07 — PREPARED fal clean-plate request (NOT RUN, nothing charged)

Status: **prepared only.** Round-3 rule: no fal / World Labs / Meshy / Rodin job without the user's explicit OK through the
lead. This file is the exact request to send if the user approves ONE paid edit for Screen 07. Nothing was submitted.

## Why
`?match07=1` projects the user's ORIGINAL approved pixels (`references/07_dive_the_washer_tube.png`) onto fitted 3D
geometry. The game draws its own HUD bar, title banner, Benny and coins, so those must be removed from the texture. Today
that is a PROVISIONAL local fill (`tools/match07/make_plate07.py` → `assets/textures/match07/plate07_hybrid.png`,
mask `plate07_fillmask.png`, 22.1 % of the frame): smooth colour from the surrounding pixels + texture from a mirrored
artwork patch. It is acceptable where the game covers it (Benny, HUD) but shows a soft/blurred patch of river and wall
where coins were picked up or when Benny steers aside. A clean plate from the same image would replace only the masked
pixels (hybrid texture, exactly as Screen 08: original pixels everywhere else).

## Request (same form as the Screen 08 edit `qa/imageblaster/08/fal_requests/fal_edit1_plate_request.json`)
* Endpoint: `fal-ai/nano-banana-2/edit` (queue `queue.fal.run`, key = environment network secret, never in files)
* Input image: `references/07_dive_the_washer_tube.png` (864×1536, unchanged; sha256 in `scripts/reference.sha256`)
* Outputs: 1 image
* Prompt:

> remove the following from the image: the game HUD bar at the top (the heart counter showing 5/5 with a plus sign, the
> coin counter showing 1,940 and the round pause button); the purple title banner reading 07 · DIVE THE WASHER TUBE; the
> pink fluffy character wearing the purple-and-white striped knitted hat with a pom-pom and gold star, together with the
> white splash directly around its body; all gold dollar coins on the water. Keep everything else exactly as it is, with
> the same composition, camera perspective, framing, colors and lighting: the purple perforated washer tube walls, the
> gold rings leading to the bright glowing end, the gold paddles on the upper left, the winding cyan and pink water river,
> the tall white foam banks and all soap bubbles. Where the removed items were, continue the surrounding tube wall, gold
> ring, water and foam seamlessly.

## After it returns (free, local)
1. Save as `assets/textures/match07/fal/plate07_fal.png` (+ the request/response JSON next to it, no key).
2. Resize to 864×1536 and use it ONLY inside the fill mask (`plate07_fillmask.png`, feathered 6 px): original pixels stay
   everywhere else → `plate07_hybrid_fal.png`, behind a new switch value (e.g. `?match07=2`); the current
   `plate07_hybrid.png` stays reproducible with `?match07=1`.
3. Re-measure with `tools/match07/metrics07.py` and the moving frames (`tools/match07/motion07.mjs`).

Cost: one `nano-banana-2/edit` image (the price could not be read from this session; the Screen 08 edit of the same kind
was the user-approved reference). No automatic retry.
