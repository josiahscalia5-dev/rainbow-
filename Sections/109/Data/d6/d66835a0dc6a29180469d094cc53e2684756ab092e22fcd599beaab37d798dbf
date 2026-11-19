# Screen 05 — round 11 progress (small steps, newest last)

Branch `claude/rainbow-s05-match-c11`, started at `bed8253d` (= round-10 tip of `claude/rainbow-s05-match-c10`).
Approved picture (the authority): `/home/user/wt/s05/references/05_flow_into_the_current.png`.
Kept set at start (round 10 end):
`?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1`

BEFORE set (fresh, exactly that query, `tools/match05/r8_shots.mjs` = the lead's motion_audit positions / stepping, real HUD
font): `/home/user/wt/s05/qa/match/05/r11/BEFORE/` — the 12 audit shots plus extra probe positions inside the 05 → 06 kink
(`k81_kink`, `k81_kink_left`, `k81_kink_right`, `t75_through`, `t85_through`, `t90_through`; positions in `shots_extra.json`).

## Item 1 — `&m05unf=1` (round-10 unfinished work: lather bank / rim foam / water not folding at the kink) — NOT KEPT
* Tested by eye at k81_kink, k81_kink_left, k81_kink_right, t75, t85, t66 (BEFORE vs + `m05unf=1`).
* Result: t66, t75, t85 and k81_kink look the same; at k81_kink_right the white folded sheet beside Benny is a little
  narrower (more pink water shows), at k81_kink_left the foam bank lies a little flatter, but the white foam column, the
  angular pale slabs in the middle of the kink and the smeared walls are all still there. Not visibly closer → not kept.
* Saved: `/home/user/wt/s05/qa/match/05/r11/wip_m05unf_not_kept.patch` (apply with `git apply` on this branch to retry);
  source edits reverted. Kink probe positions kept in `tools/match05/r10_probe.mjs` and `tools/match05/r8_shots.mjs` (EXTRA list,
  only when named; `all` = the same 12 audit shots).

## Step 1 — `&m05wtile=1` (B: smeared walls while swimming → crisp painted perforated metal, pink light streaks kept)
* Kept query: `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1&m05far=1&m05coin=1&m05ride=1&m05edge=1&m05seam=1&m05blend=1&m05foam=1&m05berm=1&m05flat=1&m05cloud=1&m05wtile=1`
* Cause (measured with `tools/match05/r10_probe.mjs`): the walls seen while swimming at t33 / t66 / in the kink are the far
  tunnel block (`tube05_far_wall`). It wears the approved picture's far bays (atlas rows BC … GX), which hold only
  128 → 16 texel rows per bay because the painting shows them small; swimming brings them close, so each slot was
  stretched along the tunnel into the horizontal smear.
* Fix (texture mapping only, geometry untouched, world-anchored): where a far bay's own row would be magnified, the
  wall keeps that bay's own painted colour and light (the pink-white streaks along the tunnel are detail round the tube,
  which the atlas holds at full resolution) and takes the slot rows from the approved NEAR bay N1 (256 texel rows: the
  sharpest painted wall), as N1's slot light/dark pattern at the same angle and the same place within the bay.
* WHAT LOOKS CLOSER: the purple tunnel walls are now crisp perforated metal like the painting: rows of dark slots
  between the gold rings, with the pink-white light streaks running toward the warm throat between them (t66, t33,
  inside the kink k81, f20), instead of a blurred streaky purple smear. Inside the kink the whole tunnel now reads as the
  painted slotted drum.
* Locked approved view: 0 px (`scripts/capture.mjs 05`, kept set vs + `m05wtile=1`; the kept set's own two runs differ by
  the known 257 px of the HUD banner outline, the switch adds nothing).
* Still wrong: the slots are a bit larger / darker and less regular than the painted slim dashes, and some bays show a
  faint double pattern (the old smeared slot columns under the new slots); the far-left strip outside the first ring at
  t66 is still soft; the angular pale slab / corner where the far river starts on the left is unchanged (next item).
* APPROVED: `/home/user/wt/s05/qa/match/05/r11/step1_m05wtile/1_APPROVED.png`
* BEFORE: `/home/user/wt/s05/qa/match/05/r11/step1_m05wtile/2_BEFORE_t66_through_screen.png`, `…/2_BEFORE_k81_kink.png`,
  `…/2_BEFORE_t33_through_screen.png`, `…/2_BEFORE_f20_forward20u.png`
* NEW: `/home/user/wt/s05/qa/match/05/r11/step1_m05wtile/3_NEW_t66_through_screen.png`, `…/3_NEW_k81_kink.png`,
  `…/3_NEW_t33_through_screen.png`, `…/3_NEW_f20_forward20u.png`
* Files: `src/vfx/waterRibbon.ts` (M05WTILE), `src/vfx/proj05Tunnel.ts` (M05WTILE_GLSL in withProj05Wall).
