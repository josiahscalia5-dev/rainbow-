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
