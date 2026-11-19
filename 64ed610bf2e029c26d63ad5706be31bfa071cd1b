# Round 15 — Screen 04 controlled test: the user's PAINTED rings on every 3D ring (washer-environment-modeler)

You are the Rainbow project's `washer-environment-modeler`, acting as texture-projection artist for ONE controlled, non-destructive
test on playable Screen 04 "Through the Five Arrows", VISUALS ONLY. The user asked (2026-11-18 ~18:30 UTC): reuse the ACTUAL approved
image details on our existing real 3D tunnel (camera matching + selective texture projection, masking Benny / HUD / other elements),
instead of generating new environments. No video, no flat background, no projection that ghosts, stretches or tears while Benny moves.

## Where you work
* Git worktree `/home/user/wt/s04b`, branch `claude/rainbow-s04-ringtex-c15` (from `fc28323a`, the newest Screen 04 tip). Commit and
  `git push -u origin claude/rainbow-s04-ringtex-c15` after every step. Push ONLY that branch; never force-push / rebase / merge.
  Another worker edits `/home/user/wt/s04` (foam, same file `src/world/match04m4.ts`, other code region) — never touch that worktree.
* Binding rules: `docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md`, `docs/briefs/2026-11-18-r10/RULES_R10.md`,
  `docs/briefs/2026-11-18-r8/COMMON_RULES.md`. Every change is a URL switch; default build unchanged; approved start view unchanged in the
  scenery; never change Benny, coins, physics, input, HUD, camera framing or other screens. Preserve `references/*.png` unchanged.
  No paid jobs. Do not reinstall tools. Never commit or print secrets.

## What the lead already found (do not re-derive)
* The rings are real lathe geometry (`src/world/match04m4.ts`, GOLD_FRAG, `m04ring`, period `m04ringp` = 4.6 in the kept set). At the
  approved viewpoint the shader shows the approved plate (`uPlate`, blended by `uAway`); once Benny swims in (`uAway` → 1) EVERY inner
  ring is drawn by a procedural gold ramp (`goldRamp / goldRampC`, `uTone`, `uBulge`, streaks, star glints) and the painting only adds
  its colour VARIATION: `col += uPaint * (pc - rm)` with `pc` from `assets/textures/match04/tile_ring.png`. That tile
  (`tools/match04/make_tiles04.py`, "milestone 2") = ONE vertical profile strip (x 445–485, y 517–575) × a per-angle colour ratio from
  the MEDIAN over depth of a polar unwrap — so it looks like a plaid of thin stripes, not like the painted rings.
* The painted rings (`references/04_through_the_five_arrows.png`, crop y 380–760) are broad, smooth, rounded copper-gold bands with
  pink-violet reflections (left / lower walls), bright light dots on the lips, a thin bright lip line and a thin dark groove; they
  telescope (each next ring a smaller circle, centres drifting toward the vanishing point VP ≈ (490, 690); mouth-ring centre ≈ (434, 792),
  radius ≈ 347 px — the drifting-centre model is already in `make_tiles04.py`).
* The washer OPENING already uses a straightened copy of the painted ring (`tools/match04/mouth04.py` → `tile_mouth.png`, `m04mouth`,
  `(psi, rho)` lookup) — use the same straightening approach for the INNER rings.
* Masks already exist: `assets/textures/match04/plate04_hybrid.png` = the approved pixels with Benny and coins filled
  (`plate04_fillmask.png` = where), `plate04_nochev.png` / `_mask` = without the chevrons. The HUD lies above the tunnel. Remaining
  contamination over the rings: iridescent bubbles (upper left, a few elsewhere) and the river / arrows / coins at the bottom (the
  bottom half of each ring is under the water — mirror the upper walls there, as make_tiles04.py does).

## The test (one factor): `&m04rpaint=1` — each inner ring band = the user's painted ring
1. Extraction (new script, e.g. `tools/match04/ring_paint04.py`, reading `plate04_hybrid.png`): polar-unwrap the painted tunnel around the
   drifting ring centres into (angle psi × depth). Find the painted grooves (dark minima of the upper-wall median vs depth) → the painted
   ring period and phase. Keep the 2-D structure of ONE clean painted ring period (or a period-aligned median of 2–3 periods if they
   align well — check by eye that grooves / lips stay sharp): texture `tile_ring_paint.png` = psi (−π..π) × position inside the painted
   period (groove → band → lip). Mask bubbles (bright low-saturation round blobs) and fill those texels from neighbouring angles of the
   same row; the under-water half mirrored from the upper walls. Keep the user's pixels; only straighten and fill.
2. Shader (only with `&m04rpaint=k`, default off): for inner rings (not the mouth), band + lip + groove colour = the painted texture at
   (psi, s) with s = position of this fragment inside the 3D ring period, phase-aligned so the painted groove sits on the modeled groove;
   keep at most a gentle modeled shading (e.g. ×(0.85 + 0.15·facing)) and the moving gloss so it does not look flat; drop the procedural
   streaks / star glints / pink-violet tint under it (the painting carries its own). `k` = mix amount (1 = full painting).
   Check first whether the ring THICKNESS / period of the 3D rings matches the painted rings as seen from the approved camera (the user
   suspects the entrance and the deeper interior have different proportions); if the painted period differs from `m04ringp`, test that
   as a separate sub-switch (e.g. `&m04rper=x`), never mixed into the first comparison.
3. Selective projection rule: approved pixels go only onto the ring bands they belong to (no wall/water pixels on rings, no ring pixels on
   water), world-anchored on the geometry (texture coordinates from the ring's own psi / position), so nothing slides, ghosts or
   stretches as the camera moves.

## Proof (the user wants ACTUAL results)
* Captures: `node tools/lead_r6/motion_audit.mjs 04 <outDir> "<query>"` from `/home/user/wt/s04b` (12 frames: a00 start, f03 entering,
  f06 / f10 middle, f20 farther inside, t33 / t66 through, t95 end, soft + hard left / right). BEFORE = the kept L4 set (frames already
  exist from the same build: `qa/match/04/r14/s11_rimfoam/L4/` — re-capture only if your build differs), NEW = L4 + `&m04rpaint=1`.
  Kept L4 query = the "Kept set now" in `docs/briefs/2026-11-18-r15/S04_LAUNCH.md`.
* Approved start view unchanged: `node scripts/capture.mjs 04 --q=<L4>` vs `--q=<L4>&m04rpaint=1`, compared with Pixelmatch:
  `node /home/user/tools-pixelmatch/pixeldiff.mjs A.png B.png diff.png 0.1 180 1536` (scene rows only; HUD rows 0–180 animate).
* A short swimming clip: `node tools/lead_r13/swim_clip.mjs 04 <out.mp4> 3.6 "<query>"` for BEFORE and NEW.
* Pictures under `qa/match/04/r15/ringpaint/`: `1_APPROVED.png`, `2_BEFORE_<shot>.png`, `3_NEW_<shot>.png` (full size, no collages) +
  the texture `tile_ring_paint.png` next to the old `tile_ring.png` for reference. Verdict in plain visual words: GOOD IMPROVEMENT /
  NOT AN IMPROVEMENT / NOT YET PROVEN (what is closer to the painted rings, what is still wrong). No colour-percentage claims as proof.
* Log in `qa/match/04/r15/ringpaint/NOTES.md`. When done (kept or rejected), commit + push and SendMessage to "main" with the switch,
  SHA, verdict, picture folder and the most visible remaining difference. If time remains and the result is good, try the same
  method for the painted magenta swirl bands on the side water ONLY as a separate, second switch (report it separately).
