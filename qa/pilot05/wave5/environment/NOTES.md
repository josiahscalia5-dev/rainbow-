# wave 5 · washer-environment-modeler · Screen 05

## Plan (written first, 22:0x UTC)
1. VP glow: shrink `tunnelEndGlowMaterial` disc to a small warm core (≲40 px) + halo (≲120 px); extend the
   visible tunnel with the wave-4 forced-perspective far-tunnel helper (tube.ts) so ≥8 rings recede into it.
2. Walls: darker metallic violet/magenta (environment.ts `wallBase`, materials.ts `perforatedMetal`), black
   capsule slots, white-pink lengthwise strip streaks; less emissive/pastel.
3. Rings: wire `band` (rounded double-lip) in environment.ts; yellow-gold material (#FCE082/#F4B70F), copper in shadow.
4. Lids: wire `shape: 'slab'` (flat round copper-gold lid) one per bay on both walls.
5. Near frame ring at the bottom corners (lower priority).
Captures go to qa/pilot05/wave5/environment/itNN (max 5), regression at the end (04 06 07).

## State found at start
* tsc passes. Wave-4 helpers present but NOT wired: `bandGeometry`/`band` opt, `wallLidGeometry('slab')`,
  `withFarGlow(..., virtualDepth)`, `perforatedMetal({virtualDepth, river})`.

## Measured baseline (qa/pilot05/wave5/baseline/05.png vs ref), my script measure.py
* Locked 05 camera (vite-node probe of RideCamera at 05_crest): eye s≈126, VP (500, 479), f≈1278 px.
  Real 05 rings (bay 6) at depth D 37.7/43.6/49.3/55.0 → tops y 174/218/250/275; the straight ends at
  D≈56 (sGlow05 = s06 − 5.9), so the end-glow disc filled the whole cross-section (radius ≈190 px).
* Warm px (r>245,g>200,b>120): ref 2,480 · live 85,233. Core (min ch >230) px: ref 346 · live 14,398.
* Ref ring radii about the VP (505,500): 288,192,122,85,66,54,45 → tops spacing 96,70,37,19,12,9 px.
  As depths: 36, 55, 86, 123, 159, 194, 233 → bays ≈19 near, ≈37 far.
* Walls (non-gold px median): ref L #BF36B4 / R #CF3DB6 / ceil #B2359F, p10 lum 77–81;
  live L #EB4BE6 / R #EB64ED / ceil #E456E2, p10 lum 118–128 (too bright, no dark).
* Gold px median: ref #FB984D (p90 #FFE280) · live #FFB654 (p90 #FFD988): live too uniform.

## Design (wave 5)
* 05 real bay 6 → 17 (rings at D≈3/20/37/54 from the checkpoint eye; ref ring 1/2 at D 36/55).
* `ForcedTunnel` (tube.ts) wired at sF = ring at D≈54, L = 6: virtual rings at D_v ≈ 86,124,160,196,234,
  276,322,374,434 (piecewise-linear u→Z knots, 7 slot rows + 1 lid pair per bay), virtual water chord
  with a painted far river, tiny end glow at D_v≈540 (≈18 px radius). Opens (morph) when the camera
  gets within 34→18 u of sF, so the ride into 06 is unchanged.
