# Screen 05 projection — instructions for the next specialist runs (2026-11-16 ~18:45 UTC)

The user (2026-11-16 ~17:30 UTC): "project my ORIGINAL APPROVED Screen 05 water artwork onto my existing playable 3D
river using ?proj05=1 … exact S-curve layout, electric cyan-blue liquid, glossy magenta-pink ribbons, brilliant white
highlights, and fluffy foam edges. Use the existing clean gameplay river mesh, NOT Marble's distorted reconstructed
surface. Keep my camera, Benny, gameplay, coins, and other screens unchanged. First show me a full-size comparison of
APPROVED versus NEW from the exact locked camera. Then test the camera moving forward to confirm the texture doesn't
stretch, tear, or disappear. The water must also animate naturally toward the camera. Do not replace my working
version until I approve the results. Keep the experiment reversible. … Do not spend any additional Marble credits. My
goal is a 95% or better visual match in the real playable 3D game, not just a still image."

Status: DONE by the main session as a first version — read `NOTES.md` (results, switches, limits). The user has NOT
approved it yet: nothing becomes default, `ccr-451ea8c7-3nqlis` stays protected.

## Specialist 1 (`washer-environment-modeler`, projection / bake) — next, only if the user asks
Relaunch prompt: "Rainbow Screen 05, branch <session branch>. Read qa/pilot05/proj/NOTES.md and BRIEF_NEXT.md. Improve
`?proj05=1` one factor at a time, each behind its own URL switch, default build pixel-identical
(qa/pilot05/current_default_05.png), approved | BEFORE | NEW full-size from the locked camera, numbers from
tools/proj05/frame_metrics.py, no 95 % claim without the measurement." Candidate factors (in this order):
1. bubbles: the game's 05 bubbles vs the approved bubbles baked into the texture (hide / reposition on 05 only);
2. `?projgeo05=1`: visual-only bank widening where the approved water reaches past the game river (≈102 k px; course.ts,
   widthAt(), steering, coins, collisions untouched);
3. seams of the artwork fill under Benny (visible when he steers): better registration / feathering in make_target.py.
Tools: `tools/proj05/*`, `scripts/proj05-probe.mjs`, `scripts/proj05-move.mjs`. Blender is optional (the bake uses the
game's own per-pixel river coordinates; if Blender is used for camera projection: its UV Project modifier ignores lens
shift — use the camera projection matrix, see `tools/blender/marble05_projection.py`).

## Specialist 2 (`water-fx-specialist`, animation) — next, only if the user asks
The flow (two-phase advection toward the camera, layout anchored) is in the shader (`uPjFlow`, switches
`projflow05`, `projflowd05`, `projrate05`). Open points: cross-fade softening at mid-phase; detail-tile repetition;
a clip on a real Android device (`VITE_RAINBOW_Q05="proj05=1" npm run android:debug`, not built yet).
