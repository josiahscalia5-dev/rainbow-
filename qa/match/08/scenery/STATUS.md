# Screen 08 scenery-in-motion — STATUS (round 7, account 7) — MILESTONE DONE, stopped

* Branch `claude/rainbow-s08-scenery-c7` (started at `-c6` @ `cf2e092b`). Final SHA: `git log -1`.
* Every change is behind its own `?match08=1` sub-switch; nothing runs without `match08`.

## Kept switch set (round 7)
`B7='match08=1&coins08px=1&m08bw=1&m08fill=1&m08arch=1&m08swim=1&m08seam=1&m08sill=1&m08towel=1'`
(`m08lane` stays OFF.)

## Done (round 7)
1. **`&m08seam=1` — KEEP at ×1.6 (default `m08seamk`).** f10 / t95 frames `r7/seam/{base,k16,k22}/`. Without it the
   generated ceiling fill is a dense fine mesh, visibly smaller than the painted chamber-wall slots it meets. ×1.6 matches
   the painted slot size best; ×2.2 is slightly coarse. Approved view: 0 px (frozen capture, `r7/proof/seam`).
2. **`m08swim` proven 0 px at the approved view** (frozen `scripts/capture.mjs`: `r7/proof/noswim` vs `swim` vs `swim2`:
   0 changed pixels; the capture is deterministic, swim vs swim2 = 0).
3. **`&m08sill=1` — NEW, KEEP.** Riding 3 u forward, the frame bottom showed torn gold / blue slabs. `m08dbg` showed
   they were the gold arch's unpushed water-level band (2.6× nearer than the rest of the ring). Fix: the whole ring is
   pushed along the projector rays; the part below the water is hidden by the floor. f03 bottom is now clean water
   (`r7/sill/` vs `r7/A1/`). Approved view: 22,799 px change, 600 > 20 levels, all in the bottom strip (rows 1137–1535);
   the changed pixels are slightly further from the approved picture (mean error 6.78 → 7.99); whole frame within 20
   levels 81.05 % → 81.04 %. Side by side the crops look the same.
4. **`&m08towel=1` — NEW, KEEP.** In both hard-steer shots a rectangular slab of door-window pixels sat on the towel
   (the box's top and sides carried the door painted above and beside it). Fix: towel = frustum whose back corners
   lie on the projector rays through the front corners. Hard-steer frames `r7/towel/`: the slab is gone and the window
   runs cleanly behind the towel. Approved view: 6,328 px change (52 > 20), CLOSER to the approved picture (mean error
   5.30 → 4.84); whole frame 81.05 %.
5. The right hard-steer "second river" is the painted S-river's own near left bend (the coins follow it), not a
   projection copy. Not changed.

## Proofs
* `npx tsc --noEmit`: pass.
* Gameplay `node scripts/gameplay-test.mjs --q=$B7`: **8/8 pass, 91 coins collected, 1,330 → 2,240**, 07→08 drop
  61.31 u (`r7/proof/gameplay.json`).
* `npm run test:continuity`: ok, 07→08 vertical drop 61.19 u, all boundary gaps 0.
* Default build (no query), all 11 screens, current code vs untouched copy of the start code: PROOF_DEFAULT
* 04–07 with `$B7` vs round-6 base set (parts I own this round): PROOF_LEAK
* Approved-view whole frame within 20 levels (frozen capture, incl. Benny / HUD / coins): r6 set 81.05 % → B7 81.05 %.

## Pictures (separate full-size files)
APPROVED `references/08_final_spin_chamber.png` · BEFORE `qa/match/08/scenery/r6/R1_restored/` · NEW
`qa/match/08/scenery/r7/NEW/` (12-shot `tools/lead_r6/motion_audit.mjs` with `$B7`).

## Honest moving rating (subjective, separate from the pixel numbers)
* Approved view: unchanged (same as round 6).
* Straight ahead (f03 / f06 / f10 / t33–t95): **about 7.5 / 10**. Chamber, door, platform, spouts and river read as
  the approved picture; remaining: a faint slot-pattern change where the fill meets the painted wall, slightly soft
  near water.
* Steering (s_left / s_right): about 7 / 10. Hard steering (s_*_hard): **about 6 / 10**. The water near the camera
  stretches and blurs, near spouts are cut at the frame edge, and the frame is tinted pink by the HUD hurt flash
  (the foam-wall rule in `Game.ts`, not mine).
* Overall while swimming: **≈ 7 / 10, NOT yet the 8.5 goal.**

## Exact next step
Near-camera water when steering hard (stretched, blurred painted pixels on the floor close to the camera): give the
floor a world-anchored near-water layer made from the approved river (as `projnear05` did for Screen 05), fading in
only away from the approved viewpoint; then the near spouts' flat undersides (horizontal slab edges at s_*_hard).
