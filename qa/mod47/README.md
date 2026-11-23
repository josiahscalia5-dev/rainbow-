# Round 47 — MODULAR Screen 05: a short playable section (2026-11-23, branch `ccr-6deca498-03lhkc`)

User's order (verbatim, `docs/briefs/2026-11-23-r47/USER_R47.md`): keep the visual design of the approved Screen 05; use the new preview
(`docs/briefs/2026-11-23-r47/USER_PREVIEW_R47_05_layout.png`) for a small layout adjustment; one gentle river route, reusable tunnel sections,
repeated gold rings and paddles, a small set of foam clusters, repeating wall textures, one continuous water material; reuse Benny and the
gameplay; build a short playable section first, show it while Benny swims and steers, explain the visual compromises before extending.

## What was built (free tools only; no credits; the default game and every earlier version untouched)
| part | how it is made | count |
|---|---|---|
| tunnel section | ONE module = wall piece (2.6 u) + gold ring + two paddles, cloned along the drum; only the paddle angles alternate | 21 clones |
| wall detail | `wall_tile.png` (1024 x 2048), repeats 16 x around and 2 x along each piece: pill-shaped holes in rings, brushed sheen, light streaks | 1 texture |
| gold rings | lathe profile with three raised bands + two grooves on the face toward the camera; `ring_tile.png` (1024 x 256) + metallic reflections | 1 shape |
| paddles | D-shaped gold slab (straight edge on the wall, round edge reaching in), bevelled rim, gold gradient | 1 shape |
| river | ONE gentle S (amplitude 0.3 u, wavelength 10.4 u); Benny's path and the river's centre line are the same curve | 1 curve |
| water | ONE material over the whole floor: cyan silk ribbons, magenta bands and pink ribbons toward the banks, white glints, star sparkles, flowing toward the camera; colours = the earlier measurements of the user's own water art | 1 material |
| foam | FOUR heap shapes (soap bubbles of two sizes) placed along both banks and the wall bases, with a lighter far version (THREE.LOD) | 4 shapes, 642 heaps |
| bubbles | one iridescent sphere, instanced | 220 |
| far core | warm white-gold glow at the end of the tunnel, constant size on screen; distance fade toward the far-tunnel magenta measured on the approved picture | — |
| Benny, swipes, coins, splash, HUD | unchanged shared game code (Benny 31, `tools/kit05/controls.js`, `swimfx.js`); the white spray is the one cut from the approved picture (`tools/screenkit/splash_cut.py`) | reused |

Colours: the wall tile uses only the colours measured on the approved picture's walls (violet 152,51,209 · purple 172,48,192 · magenta 214,50,191 ·
pink-magenta 196,39,141 · streak 255,238,250 · slots 35,0,34..120,18,110; `tools/mod05/make_tiles.py` docstring); the gold uses the measured gold
percentiles. Camera, drum size, Benny's size and the coin size = the measured fit of the approved picture (`tools/screenkit/screens/05/fit05.py`).

Files: `tools/mod05/` — `mod05.html` (the page), `mod05.json` (every layout and look value; `?L_<key>=` overrides any look value for A/B tests),
`make_tiles.py`, `setup_mod05.sh` (runnable folder), `build_phone.sh` (phone build). Rebuild: `bash tools/mod05/setup_mod05.sh <ws>` (~30 s the
first time, then ~1 s); page load ~4 s. Switches: `?gray=1` (geometry test), `?sentinel=1` (holes show green), `?play=1` (real-time play).
Size: ~780 k triangles, ~210 draw calls (the first try had 2.2 M; rings and foam were lightened without a visible change).

## Pictures (412 x 915, the phone frame; APPROVED = the approved picture as the game frame shows it)
* `A_START_APPROVED_BEFORE_NEW.jpg` — approved | BEFORE (round 46, picture-baked) | NEW (modular) at the start
* `B_SWIMMING_NEW.jpg` — approved | NEW while swimming at s = 8 and s = 16
* `C_STEERING_NEW.jpg` — NEW with Benny steered into the left / right lane at s = 5 and s = 11
* `D_INMOTION_BEFORE_vs_NEW.jpg` — approved | BEFORE mid-river | NEW mid-river
* `stills/` — every picture above as a separate full-size frame
* `GAMEPLAY_*` — the whole section in one run with real touch swipes (see "Run" below)
Playable phone build (private): https://claude.ai/artifact/SqRksN3PVEvvYHpmkav7wa

## Measured (same checker as every earlier round: `.claude/skills/rainbow-screen-builder/scripts/compare_to_approved.py`, scenery mask from SAM 2)
| | BEFORE r46 (picture-baked) | NEW r47 (modular) |
|---|---|---|
| start view: scenery pixels within 20 levels of the approved picture | 83.6 % (r46 README) | 10.4 % |
| start view: colour look (hue / saturation histogram correlation) | — | 0.50 |
| in motion: colour look, mean of 1 frame per second over the first 14 s of real-touch play | 0.36 (range 0.22–0.54) | see "Run" |
| upper half (walls / rings): gold share / magenta share / mean brightness | approved: 14 % / 58 % / 114 | 34 % / 58 % / 143 |
| lower half (water / foam): cyan share / pink share / mean brightness | approved: 57 % / 17 % / 146 | 53 % / 24 % / 133 |

How to read them: a pixel-by-pixel score can only be high when the painting's own pixels are placed on the geometry (round 46 does that at the
start view). The modular build draws everything from repeated parts and has a gentler S than the painting, so its water and rings are not in the
painted places; its pixel score is low by design. The colour look and the colour shares show how close the PALETTE and BALANCE are.

## Visual compromises (to decide before the method goes to other screens)
1. Not the painted pixels. Everything is redrawn from repeating parts in the measured colours. The start view no longer reproduces the painting's
   exact composition (strong S, exact coin positions, painted brush strokes); in exchange the look is the same everywhere along the river, while
   swimming and steering, with no stretched painted water and no hand-over seams.
2. The gold frame at the bottom corners / bottom edge of the approved picture is not there. In a real round tunnel the nearest ring is wider
   than the screen; the corners show gold only for a moment as Benny passes each ring.
3. One gentle S (from the preview) instead of the painting's stronger S; the first coins line up straighter.
4. Rings: true perspective packs far rings close together; a distance fade toward the measured far-tunnel magenta keeps far rings thin as painted,
   but the upper half still has more gold (34 % vs 14 %) and is brighter than the painting.
5. Walls: the repeating tile is cleaner and more regular than the painted walls (smaller, evenly spaced holes; simpler light streaks).
6. Water: the painted design rules (cyan silk, magenta bands, white glints, star sparkles) are drawn live; pink placement follows a rule, not the
   painted strokes; close to the camera the ribbons are straighter than the painted swirls.
7. Foam: four heap shapes repeat (by design); they read cleaner and whiter than the painted soap foam.
8. Paddles: D-shaped gold shelves with simpler shading than the painted ones.
9. Kept from the shared gameplay code: the wake ribbons and kick-foam puffs of `swimfx.js` (they appear as soft white shapes behind Benny).
10. Not measured: real phone frame rate (this machine renders in software); the phone link lets the user check it.
