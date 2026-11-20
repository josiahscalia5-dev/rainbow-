# Benny — round 19b / 20 progress (benny-character-artist, branch `claude/rainbow-benny-c21`, worktree `/home/user/wt/benny`)

Target: the APPROVED Benny (`references/04_through_the_five_arrows.png`, largest view; also 05 / 06 / 07) on every screen,
in motion. BEFORE = Screen 04 preview v3 (`qa/match/04/r19/PREVIEW_QUERY_v3.txt`, commit `09459079`).
Close-up crop = lead's box x 170–620, y 900–1440 of the 864×1536 frame, ×1.5 (`tools/benny20/crop.py`).

## (r20) 0. Restored r19b WIP — commit `8fb1b91`
`fur.ts` BENNY20 lock shader path, `assets/textures/benny20/*` (crown_n.png regenerated with `tools/benny20/knit.py`;
the generator reproduces the other five maps byte-identically), `tools/benny20/*`, partial r19b shots. tsc OK.

## (r20) Task 1 — `&benny05=1` on the 04 v3 query: GOOD IMPROVEMENT on the beanie only; fur NOT an improvement on 04
Pictures (real game, full size): BEFORE `qa/benny/r20/t1/before/`, NEW `qa/benny/r20/t1/benny05/` — `closeup_f00.png`,
`f00_start / f03_forward3u / f06_forward6u / s_left_steer / s_right_steer.png` (+ `closeup_*`), `s05/s06/s07_start` and
`_swim3u`; clip `qa/benny/r20/t1/benny05/swim_clip_half.mp4` (BEFORE clip: `qa/match/04/r19/preview_v3/swim_clip_half.mp4`).
* Beanie: real knit stitches, cream-white / violet stripes and a ribbed cuff instead of the smooth two-stripe cap — on 04
  start, steering and on 05 / 06 / 07. Clearly closer.
* Fur: still neon hot pink, needle strands, on 04 (lead's HSV: brightness 0.89 / 1.00 / 1.00 vs approved 0.57 / 0.80 / 0.98);
  on 06 / 07 it reads more mauve. Star: glossier lemon yellow (further from the approved felt star).
* Beanie still ~10 % too small and too high on 04 (it was fitted to the 05 frame only).
→ benny20 builds on benny05 (its beanie maps are kept by default) and replaces fur / seat / pompom / star.

## (r20) Step 1 — `&benny20=1` fur colour + texture (+ beanie seat): method
New `src/characters/benny/benny20.ts` (switch `benny20`, default off; benny05 also runs under it; QA overrides `?b20<key>=`),
`fur.ts` `#ifdef BENNY20` (default / benny05 programs unchanged), `runtime.ts` (B05 = benny05 || benny20).
Tools: `tools/benny20/probe.mjs` (one game load, many look variants at the same frame + flat part masks),
`score.py` (silhouette IoU vs the approved GrabCut mask `approved_mask04.png`, shift-invariant; cuff height fraction;
fur HSV p10/50/90 like the lead's measure), `calfit.py` (grey sweep → albedo), `landmarks.py`, `runs.py`, `widths.py`.
* Fur colour: the GLB / benny05 colours are burned out by the 04 light + post chain (brightness 1.0 everywhere). Albedo
  solved in steps (grey sweep `probe/c`, scale scan `probe/e`, `probe/h`, `probe/j`): linear (0.29, 0.092, 0.172) —
  about half the old red. j0 (one step before the final nudge): mean (216, 84, 148), saturation .55/.60/.72, brightness
  .69/.86/1.00; approved (same region) (207, 74, 151), .53/.65/.77, .61/.84/.99.
* Fur texture: plush LOCKS (24 per unit, leaf-shaped, dense core, wisps only at rim / tip, rounded tuft shading: lighter
  axis + tips, darker rim / roots / creases), combed DOWN ALONG the surface (projected gravity, `uComb`) so they overlap in
  layers; no world-down droop (that made icicles under the body). Rejected on the way: 12-cell locks (cartoon petals, `probe/a`),
  gravity 0.55 (spike curtain, `probe/b`), 44-cell + strong stretch (vertical streaks, `probe/d`), reduced lift 0.6
  (silhouette shrank, fur IoU 0.48 → 0.28).
* Beanie seat: ×1.1 and tilted back 0.23 rad (back of the cuff down, front stays above the eyes — a straight 0.35 drop
  would have covered his eyes), drop 0.02, bald cone follows the tilt (a mismatch made a hard ledge, `probe/g`).
  Shift-invariant silhouette IoU vs approved: all 0.89, hat 0.83, fur 0.76 (b1 uniform drop: 0.82 / 0.71 / 0.64).
  Pompom ×1.03 (approved width 168 px, matched).
