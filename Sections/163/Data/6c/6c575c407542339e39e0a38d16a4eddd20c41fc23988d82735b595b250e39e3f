# Screen 05 — round 10 progress (small steps, newest last)

Branch `claude/rainbow-s05-match-c10`, started at `de233792` (= newest `-c9` tip). Approved picture (the authority):
`/home/user/wt/s05/references/05_flow_into_the_current.png`.
Base set (BEFORE): `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1`
— BEFORE pictures = the lead's fresh audit (12 positions, exactly that query):
`/tmp/claude-0/-home-user-rainbow-/0bf13d71-0f08-5420-86ab-4dcca5bc306c/scratchpad/audit_c10/05/` (copied into each step
folder as `2_BEFORE_<shot>.png`). Note: the lead's audit tool draws the HUD banner in the fallback font; my frames
(`tools/match05/r8_shots.mjs`, same positions / stepping) show the real HUD font — ignore that difference.
Each step = one sub-switch on top (default build untouched); judged by eye against the approved picture.

## Diagnosis (measured, before any change) — `tools/match05/r10_probe.mjs`
* What lies where at t33 / t66 (object-ID renders): the jagged left half at t66 is the water ribbon's left part in the
  tight S-kink just before Screen 06 (s 172–183), a raised strip of the painted design, with the far river's left corner
  and the lower far wall (lilac slab) behind it; at t33 the left bank is the dithered bank strip (`proj05_apron`) over
  the ribbon edge.
* The course itself (course.ts, untouched) makes that kink: bend radius 3.6–5.7 u while the river is 4.3–5.6 u wide
  each side, banked ±9–15°. The ribbon rows cross on the inner side of each bend (right edge s 173.5–174.7, left edge
  s 177.5–181.1) — the water sheet folds over itself there.
* The 05 rim foam (fine-foam lumps along both banks, built for the approved 05 look) is switched off under `proj05`
  (the approved foam is baked into the water), so while swimming the banks are bare except where the painted foam
  happens to land.

## Step 1 — `&m05foam=1` (C: foam banks along both river edges while swimming)
* Kept query: `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1`
* WHAT LOOKS CLOSER: as in the approved picture, both edges of the river are now lined by soft white-lavender foam
  clusters with small bubbles all the way from Benny toward the warm throat — the S-shaped river reads as a channel
  framed by two foam banks (f10, t33), instead of water running bare into the walls. At t66 the foam row runs along the
  left bank over part of the torn strip and frames the far river on the right. On hard steering Benny swims beside a
  foam bank as the approved picture's corners show foam piles.
* Locked approved view: 0 px changed (`node scripts/capture.mjs 05`, base set vs + `m05foam=1`). The foam grows in over
  the first 0.5–2 u of riding.
* Still wrong: up close (hard steering, t66 left) the nearest lumps read as separate glossy balls rather than the
  approved soft piles; the torn strip on the left at t66 (the folded / banked ribbon at the kink) is only partly hidden;
  the far river still starts with an angular corner on the left; the near water around Benny is a broad cyan sheet
  without the painted magenta banks at the bottom of the frame.
* Order note: the lead's item 1 (one continuous river) is being worked on (first try `&m05fold=1` below); this foam step
  was ready first and is independent of it.
* APPROVED: `/home/user/wt/s05/qa/match/05/r10/step1_m05foam/1_APPROVED.png`
* BEFORE: `/home/user/wt/s05/qa/match/05/r10/step1_m05foam/2_BEFORE_f10_forward10u.png`, `…/2_BEFORE_t33_through_screen.png`,
  `…/2_BEFORE_t66_through_screen.png`, `…/2_BEFORE_s_left_hard.png`
* NEW: `/home/user/wt/s05/qa/match/05/r10/step1_m05foam/3_NEW_f10_forward10u.png`, `…/3_NEW_t33_through_screen.png`,
  `…/3_NEW_t66_through_screen.png`, `…/3_NEW_s_left_hard.png`
* Files: `src/vfx/waterRibbon.ts` (M05FOAM, m05foamK), `src/vfx/foam.ts` (rim lump size × m05foamK under the switch),
  `src/vfx/index.ts` (rim foam not hidden under the switch; m05foamK from the ride distance).

## Step 2 — `&m05berm=1` (B/C: the strip beyond the water's edge becomes a white foam bank)
* Kept query: `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1`
* WHAT LOOKS CLOSER: the torn left strip at t66 (stretched pink / white paint, the pink zig-zag layer and loose patches
  beyond the river's left edge) is now one soft white-lavender foam bank with bubble domes running from Benny's side up
  toward the far river — the left half reads as river → foam bank → purple wall, as in the approved picture. At t33 and
  f10 both banks are now broad foam banks (wider than step 1's bead line, closer to the painted foam clouds on both
  banks) instead of bare edges and dithered speckles. On hard left steering Benny swims beside a foam bank. Cause: the
  game's continuous lather bank between the water's edge and the wall was switched off on Screen 05 under the
  projection (the approved foam is baked into the water); it now comes back while swimming (ride factor, 0 at the
  locked checkpoint).
* Locked approved view: scenery 0 px changed (`scripts/capture.mjs 05`, step-1 set vs + `m05berm=1`, two runs); 257 px
  differ only on the outline of the HUD stage banner (rows 100–179, ≤ 20 levels) — the documented capture-timing glitch
  of the HUD, not the scene.
* Still wrong: the bank is a smooth lather sheet with small domes, not yet the approved big irregular foam clouds; the
  nearest rim lumps still read as separate balls; the far river at t66 still starts with an angular left corner and the
  wall above the left bank is smeared; the water around Benny is a broad cyan sheet (no painted magenta banks at the
  bottom of the frame).
* APPROVED: `/home/user/wt/s05/qa/match/05/r10/step2_m05berm/1_APPROVED.png`
* BEFORE (round start): `/home/user/wt/s05/qa/match/05/r10/step2_m05berm/2_BEFORE_t66_through_screen.png`, `…/2_BEFORE_t33_through_screen.png`,
  `…/2_BEFORE_f10_forward10u.png`, `…/2_BEFORE_s_left_hard.png` (step 1 frames: `…/step1_m05foam/3_NEW_*.png`)
* NEW: `/home/user/wt/s05/qa/match/05/r10/step2_m05berm/3_NEW_t66_through_screen.png`, `…/3_NEW_t33_through_screen.png`,
  `…/3_NEW_f10_forward10u.png`, `…/3_NEW_s_left_hard.png`
* Files: `src/vfx/waterRibbon.ts` (M05BERM), `src/vfx/foam.ts` (berm discard × (1 − ride factor) under the switch),
  `src/vfx/index.ts` (ride factor also for m05berm).

## Step 3 — `&m05flat=1` (A, look only: the banked S just before Screen 06 drawn level)
* Kept query: `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1`
* WHAT LOOKS CLOSER: at t66 the raised, tilted ramp of water on the left (the course banks +9° … −15° in the tight S at
  s 172–183, so the water there tilted up toward the left wall and broke against it) is gone: the river now runs LEVEL
  like the painted one — magenta bank band, foam bank and cyan lane continue from Benny along the S into the far river
  as one surface, the foam bank lies along the left edge at water level, and the right bank shows magenta water with foam
  piles. At t33 the mid-distance pink creases where the river entered the kink are smoother. Only the drawn height of
  the water, the lather bank and the rim foam changes inside that window (smooth ends; zero at the 05 checkpoint, at the
  far tunnel's seam and on 06); Benny's drawn height follows the same level water (ribbon.heightAt), so he never sinks;
  course, steering, coins, pickups unchanged.
* Locked approved view: 0 px vs step 2 (`scripts/capture.mjs 05`); vs the round-start set only the HUD banner outline
  (257 px, rows 100–179, see step 2), scenery 0 px.
* Inside the kink (Benny at s ≈ 178.9, straight / steered to both banks: `k81_kink*`): about as before — Benny rides on
  the water at both banks (no sinking); the lather bank still folds into white columns on the inner side of the bends
  and the camera rolls with the course there (both already in step 2).
* Still wrong: the far river still starts with an angular corner on the left at the seam; the far water is soft; the
  near water around Benny is a broad cyan sheet; walls above the left bank are smeared.
* APPROVED: `/home/user/wt/s05/qa/match/05/r10/step3_m05flat/1_APPROVED.png`
* BEFORE (round start): `/home/user/wt/s05/qa/match/05/r10/step3_m05flat/2_BEFORE_t66_through_screen.png`, `…/2_BEFORE_t33_through_screen.png`;
  step-2 kink frames `…/2_BEFORE_step2_k81_kink.png`, `…/2_BEFORE_step2_k81_kink_left.png`, `…/2_BEFORE_step2_k81_kink_right.png`
* NEW: `/home/user/wt/s05/qa/match/05/r10/step3_m05flat/3_NEW_t66_through_screen.png`, `…/3_NEW_t33_through_screen.png`,
  `…/3_NEW_k81_kink.png`, `…/3_NEW_k81_kink_left.png`, `…/3_NEW_k81_kink_right.png`
* Files: `src/vfx/unfold05.ts` (flat05Dy / flat05Up), `src/vfx/waterRibbon.ts` (M05FLAT: aUnf height + heightAt),
  `src/vfx/foam.ts` (berm vertices + rim foam points levelled under the switch). Kink frames: `tools/match05/r10_probe.mjs k81_kink…`.

## Tried, not kept
* `&m05wall=1` (round-9 WIP, crisp procedural slotted metal where the wall picture is magnified) on top of step 2 at
  t66: walls crisp but pale lilac with big regular square slots, and the painted pink light streaks between the rings
  are lost — less like the approved walls than the soft BEFORE. Not kept (needs a detail-only version that keeps the
  painted light).
* `&m05fold=1` (B/A: the folded ribbon at the kink; `src/vfx/unfold05.ts`): the ribbon's vertices in the kink are
  smoothed along the river toward the banks (horizontal only, so Benny never sinks) — the rows no longer cross
  (measured: 17 crossing cells → 0). By eye at t33 / t66 / f20 almost nothing changes: the strip on the left is the
  banked (tilted) water surface with stretched paint, not mainly the fold. Not kept; code stays switch-guarded.
