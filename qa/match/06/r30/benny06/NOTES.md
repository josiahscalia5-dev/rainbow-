# r30b benny06 — painted Screen 06 Benny (`b30`)

Worker: benny-character-artist, worktree `/home/user/wt/benny06` (LOCAL `claude/rainbow-s06-benny06-c32`, uncommitted), 2026-11-20 22:29–23:05 UTC
(relaunch; continues the r30 session's `benny30.ts` start).

## Query addition
`&b30=1` (added to `qa/match/06/r30/QUERY_NEW_v2.txt`). It also switches on the benny05 base (knit / fur / pompom albedo maps baked from approved pixels).
Without `b30` nothing changes (benny30.ts never runs; the runtime ride pitch is the old constant). Every number can be overridden for QA with
`&b30<key>=<value>`; in `?qa` pages `window.__b30.set({...})` re-applies live.
Size knob: `&b30sc=` (default 0.92 = the painted Benny's on-screen size at the v2 start framing). If the lead's new camera framing already makes
Benny smaller, use `&b30sc=1` — the proportions inside Benny do not depend on it.

## Files changed (worktree)
* `src/characters/benny/benny30.ts` (new): the b30 look. Defaults = sweep config K3:
  whole Benny 0.92 (his own `benny_root`, visual only) and 0.07 lower; ride lean 32° (was 12.6°); beanie 0.9× about the cuff's bottom centre;
  body 0.85× narrower, lower half reshaped to a fuller round gumdrop base (superellipse 3.5, +25 % width toward the base); arms 1.25×, 0.28 lower,
  0.10 further in; fur shells shorter / clumpier (length 0.095, density 90, clump 0.85); fur bald cap follows the cuff.
* `src/characters/benny/runtime.ts`: calls `applyBenny30` after benny05; uses the b30 pitch only when b30 is on.
* `src/characters/benny/benny05.ts`: `b30` also switches on the benny05 base; the lead's temporary `b30hs/b30hy` block replaced by benny30.ts.
* `tools/benny30/` (new): `sweep.mjs` (one page load, many live configs × shots, optional flat-ID masks), `parts.py` (Benny box metric + part
  extents), `panels.py` (close-up sheet vs storyboard), `stills.py` (labelled stills).
Rig, clips, collision, steering, coins, scenery: untouched. Same draw calls and fur shell counts (mobile cost unchanged; one body-geometry copy per Benny).
`npx tsc --noEmit -p .` clean.

## Measured (pixel statistics, not a likeness score)
Benny box x200–700, y600–1260 of the 864×1536 start frame vs `references/06_crest_the_rinse_arch.png`, share of pixels with max channel |dRGB| ≤ 20:
* BEFORE (v2): **49.4 %** (mean |d| 37.7) → NEW (v2 + b30=1): **56.8 %** (mean |d| 22.4). Identical re-renders vary ±0.2.
* Start frame outside the Benny box: 100.0 % pixels identical (scenery untouched).
* Painted vs game, start frame: hat width 287 vs 290 px (BEFORE 359); cuff bottom 995 vs 1019 px (BEFORE 1085); body rows y1120/1140/1160:
  289–539 / 292–527 / 313–496 painted vs 290–541 / 302–521 / 327–502 NEW; fur core mean RGB painted 234,86,180 vs NEW 232,75,181 (BEFORE 215,51,171).
* Storyboard panels (`BENNY_CLOSEUP_SHEET.png`): game crop aligned on pompom top / waterline / body centre (one uniform scale; painted features
  read by eye), share ≤ 20 inside his box: P1/s238 5.1 → 5.5 %, P2/s266 4.9 → 5.5 %, P3/s310 6.1 → 6.8 %, P4/s387 6.0 → 6.7 %. Low for both (different
  viewpoint and background); NEW is only marginally higher. Numbers: `benny_numbers.json`.
* Steering (hard left / right to s 266): Benny holds together at full lean (`NEW_steer/`); s / lateral / coins identical to BEFORE (`BEFORE_steer/`).
  Note for the lead: held hard-left toward s 310 stops at s 227 with hearts lost in BEFORE too (v2 baseline, not b30).

## Rejected (measured or visibly worse)
Beanie raise `hy` (55.4–56.0 %, bare band under the cuff while swimming); beanie tilt `hp` (smooth bare "hood" under the cuff); colour multipliers
(the leaned fur already has the painted mean colour; the shift went greenish); more lean 38–40° (55.2–55.9 %); sinking deeper / longer body (the water
surface never cuts Benny, he just moves down: 54.0–55.5 %).

## Honest verdict
Clearly closer at the start: beanie as wide as the upper body with a thick violet cuff and cream / violet stripes, pink plush body visible below it,
round arms at both sides, dusty-pink softer fur, star on the cuff's right. While swimming he is the same character but still not the painted one.

## What still differs
1. Viewpoint while swimming: the chase camera looks down more steeply than the panels, so the beanie looks foreshortened (hat + pompom ≈ 45 % of
   his height vs ≈ 60 % painted) and more of his back shows. That needs the lead's framing, not Benny.
2. Water contact: the painted Benny sits sunk in a white foam ring; the game Benny floats with his rounded underside visible (the water does not
   occlude him). That needs the water / foam side (a contact ring or a depth-tested waterline).
3. Fur: fine noisy strands instead of the painting's shaggy plush locks with light tips; the silhouette fringe is still slightly spiky.
4. Size while swimming: smaller than in the panels (camera distance, plus `b30sc` 0.92).
