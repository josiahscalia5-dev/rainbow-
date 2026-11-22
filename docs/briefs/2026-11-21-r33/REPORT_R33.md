# Round 33 report — Screen 05: tools evaluated, new tunnel-kit method tested and adopted for the full level (2026-11-21)

Session branch `ccr-81d66c17-i0ooo8`. Nothing installed, no account created, no credits or money spent, approved artwork unchanged
(`sha256sum -c scripts/reference.sha256`). Experimental work only in `/tmp/rainbow_r33` + `tools/kit05/` (new files); the round-32
build, `controls.js`, Benny and every protected branch are untouched.

## 1. Tools the user asked about — none adopted
`TOOL_EVALUATION_R33.md`: Cuberta (Windows/macOS kit-piece city builder; free outputs owned by Wandy3D), Scenario YVO3D (AI re-texturing,
single objects, may train on uploads), SceneSim / onGame (not found), AI Game Developer (Three.js support only for new projects from its
own starters, same Claude agent underneath, its screenshot / touch / playtest features already exist here), Thrixel Build World
(generative; tested in round 19: not an improvement). None can reproduce the ORIGINAL pixels; none was installed.

## 2. Why the round-32 splat world could not reach the approved look
* Its rings do not sit on the painted rings, and its water plane is tilted against the painted tunnel (a tunnel parallel to it puts the
  vanishing point 138 px above the painted core). Splats from one picture also blur within ~2-3 s of swimming.
* The painting itself is not drawn in strict perspective: from ring 2 inward every gold ring is ~1.52x deeper than the previous one.

## 3. The tunnel kit (user's plan step 3) — `tools/kit05/`
* ONE straight 3D tunnel with evenly spaced gold rings fitted to the painted rings (ring tops within ~5 px for rings 2, 3, 5-8).
* A camera-relative depth curve (identity up to ring 2, then the painting's ring ratio) applied to every scenery vertex, so the far
  tunnel keeps the painted perspective from every position (the "curved world" technique of endless-runner games).
* Textures = the APPROVED pixels themselves (bilinear samples where each surface lands in the approved camera view):
  per-section own pixels for the first 8 wall sections + 9 rings (exact painting at the start), cross-faded to a sharp shared section
  as Benny approaches; water = the approved water, flowing into a seamless current made from the user's isolated water art + the
  approved near water; foam banks = the painting's own foam. AI-made pixels (round-32 clean plate) only as a last resort on walls.
* Gameplay = the round-32 Benny + UNCHANGED `controls.js` (lanes, leap, dive, coins, splash, camera springs); bank softened through
  its own tuning switch (`c_LEAN_K` 0.20 -> 0.11).

## 4. Short-section test (first 7.6 s, fixed swipe plan L L R U R R D L U L, real touch, 412 x 915 Android portrait)
| scenery (HUD + Benny box excluded) | CURRENT splat | KIT (own pixels) |
|---|---|---|
| frame 0: share within 20 levels of approved | 12.7 % | **80.0 %** |
| frame 0: mean abs difference | 60.5 | **14.6** |
| frame 0: SSIM | 0.19 | **0.76** |
| frame 0: colour-look correlation | 0.55 | **0.99** |
| frame 0: sharpness vs approved | 0.30 | **0.75** |
| frames 15 / 30 (swimming, steering): colour look | 0.36 / 0.25 | **0.71 / 0.73** |
| frames 15 / 30: sharpness | 0.34 / 0.36 | **0.60 / 0.64** |
| render time per frame (software WebGL) | ~25 s | **~2.5 s** |
Gameplay in the same test: 10/10 swipes answered (4 left, 3 right, 2 up, 1 down), lanes -1 / 0 / +1, no teleports (max 0.041 per
frame), up / down smooth (max 0.067 per frame), camera smooth, 0 errors. Evidence: `qa/kit05/r33/`.
=> Meaningfully better than the current version without damaging gameplay → extended to the full Screen 05 (user's rule).

## 5. Honest limits (not yet solved)
* 80 % of scenery pixels within 20 levels at the start, not 90-95 %: remaining differences are mostly coin positions (the controls'
  coin layout vs the painted coins), the far river, and Benny (the 3D Benny model is ~28 % wider than the painted Benny — character
  work, not scenery).
* While swimming, the river beyond the painted stretch runs straight between foam banks; the painting's winding S-shape is only in the
  painted stretch. Paddles (gold lids) are flat on the walls, not 3D.
* No physical Android device or emulator here: tests use Chromium's Android-portrait emulation with real touch events; frame rate on a
  phone cannot be measured here (the kit is ~10x lighter to render than the splat world, a good sign, not a measurement).

## 6. Commissioning a specialist instead?
Not needed for the tunnel itself: the kit already reproduces the approved tunnel from its own pixels. A human 3D artist would only be
worth it (paid, user's decision) for: real 3D paddles, a hand-authored winding river surface, and a Benny model matching the painted
proportions. Our own Blender specialist can attempt the paddles and the river shape for free first.
