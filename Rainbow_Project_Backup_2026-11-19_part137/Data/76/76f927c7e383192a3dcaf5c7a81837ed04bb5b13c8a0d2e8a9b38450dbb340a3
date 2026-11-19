# Screen 05 wave 5: foam-bubbles-particles (foam banks too wide)

Started 2026-11-15 ~22:10 UTC on top of the wave-4 tree (spray fan FAN.rootMin, flank banks BANK_PX,
impostor bank bubbles, 19 large + 12 small bubbles). Nothing from wave 4 is reverted.

## Plan
1. Define a reproducible bank-width / bank-height metric (script below), measure ref + baseline.
2. foam.ts `createFoam` → 05 flank bank (`updateRafts`, `BANK_PX`, `bankLump`, `KIND`, `bankProf`):
   cut the continuous frame-edge strip (reads as a white WALL x 0–90 / 740–864, y 700–1300) into a LOW
   lumpy rim of separate clumps with water gaps, narrower inner edge, fewer stacked/heaped puffs.
3. foam.ts berm puffs near the VP (heaps y 600–700): fewer/lower heaps in 05 so the purple wall shows.
4. Keep riderSplash.ts (soft fan) and bubbles.ts (≈19 large / ≈12 small, coin-path exclusion) unchanged
   unless a capture shows a regression.
5. ≤ 5 captures (it01…), tsc, one regression capture of 03/04/06/07 at the end.

## Measurement (scratch script, reproduced here so anyone can rerun it)
(filled in below after the first measurement)
