# Round 37 (2026-11-21 ~23:00 UTC) — Screen 05: three buildable options for the user to choose (A / B / C)

User's order (verbatim excerpts): "SHOW ME THREE REALISTIC, BUILDABLE VERSIONS OF MY APPROVED SCREEN 05 BEFORE WE CONTINUE … OPTION A —
MAXIMUM ORIGINAL ARTWORK FIDELITY … OPTION B — NATURAL, HIGH-QUALITY 3D WATER … OPTION C — POLISHED, GAME-READY ARCADE VERSION … KEEP
BENNY'S GAMEPLAY THE SAME IN ALL THREE OPTIONS … For each option, show an actual game-engine render of the starting view and at least one
view after moving forward through a river bend … Do not invent visual similarity percentages … Do not spend additional credits or rebuild
the full level before I choose … let ME choose before you proceed." Earlier in the same session: a phone video of another Screen 05 build
(Lovable remix) = the MOVEMENT the user wants (Benny crossing the screen on lane changes, coins approaching, bends travelling toward him),
NOT its scenery.

## Built (test page only: `tools/kit05/kitgame.html`; no `?opt` = the round-36 default, unchanged; default game untouched)
| switch | what it is |
|---|---|
| `?opt=a` | = `ownoff=1&move=1`: the approved picture's own pixels on the 3D tunnel AND the river (round-35 painted river), reference-video movement |
| `?opt=b` | = `ownoff=1&move=1&w37=1`: tunnel / rings / paddles keep the painted pixels; the river is DRAWN LIVE in river space (`w37()` in the river shader): flow-aligned silk ribbons, magenta bands on both sides (wider on the outside of each bend), white highlight dashes (2 scales), four-point star sparkles, lavender-white foam domes beyond the river's winding banks; colours measured from `references/water/05_water_isolated_original.png` (near half, by luminance: blue 5/50/95 % = (1,124,234) (0,164,251) (57,238,252); pink (164,43,212) (251,34,217) (252,134,251); shares blue 83 % / pink 18 % / white 4 %). Every detail is anti-aliased by its own pixel footprint (fades to its average instead of flickering). Painted foam domes (puffs.png) stand along the river's banks, not the wall bases. Tuning: `w37rw` (river half-width, 0.6), `w37ck` (S swing x Benny's path, 1.2), `w37flow` (1.0) |
| `?opt=c` | = `ownoff=1&move=1&w37=2&clean37=1`: everything redrawn clean by code at load (canvas textures: violet slotted walls with pink light bands, gold rings with ridges and light spots, 3D gold paddle ribs) + the simpler river (fewer ribbons / sparkles) |

## Evidence (all real engine frames, 412 x 915, same camera / Benny / coins / controls)
* Stills `qa/kit05/r37/`: `APPROVED_phone_frame.jpg`, `OPTION_{A,B,C}_s0.0_l0.jpg` (start), `_s4.5_l0` (right bend, ~3.2 s), `_s8.5_l0`
  (left bend, ~6 s), `_s4.5_l-1` (after one swipe left).
* Clips `qa/kit05/r37/CLIP_{A,B,C}_7.6s_real_swipes.mp4` (swim_check.cjs PLAN=fixed: L L R leap R R dive L leap L, real CDP touch).
* Playable phone builds (private artifacts, tap to swim, fps meter): A https://claude.ai/artifact/WpTr9WD5EWMv8pxThWjQjb ·
  B https://claude.ai/artifact/Jwb1UmbXW74kmDYyXnY7KH · C https://claude.ai/artifact/9DofNKfK9BApxZLBLXB67n
* Comparison page for the user: see the end-of-round report in the handoff (artifact link).

## Honest assessment given to the user
* A: start view = the approved picture (round 35: 80 % of scenery px within 20 levels); in motion the near water is the painting's far water
  blown up (round 36: by 4.5 u, 83 % of on-screen water stretched > 4x) -> smeared streaks. Ceiling already reached.
* B (RECOMMENDED): tunnel as A; river sharp at every distance, streams along every bend. Unavoidable: the water is the user's DESIGN redrawn,
  not the painted strokes; pink band placement by rule; no gold frame at the bottom edge; foam flatter than the painted puffs.
* C: same world, plainer; easiest + lightest; furthest from the picture.
* NOT measured: real Android frame rate (no GPU here; SwiftShader only).

## Next (only after the user chooses)
B: tune band layout / foam / near-camera arcs against the picture with the user, whole-level acceptance (`tools/kit05/qa/run_acceptance.sh`
with `URLQ`/preset `opt=b`), phone fps check by the user, then decide on the default.
Rebuild the workspace: `bash tools/kit05/setup_kit.sh <ws>`; stills: `node tools/kit05/s1_stills.cjs <ws>/game <out> 0,4.5,8.5 0,-1 "opt=b"`;
phone build: `PRESET="opt=b" bash tools/kit05/build_phone.sh <ws>/game <out>`.
