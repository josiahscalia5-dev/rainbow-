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

## it01 (environment.ts 05 section rewritten; tube.ts ForcedTunnel knots/axis/chord/placeInstances; materials.ts farRiverMaterial)
* bay05 6 → 14 (rings05 every 14 back from sF05 = sCam05 + 54), band rings (`band05`), slab lids, far tunnel wired.
* Probe (vite-node, same eye as RideCamera): ring tops on the VP column 191(real) 268(real, sF) 350 390 410 423 432
  439 445 450 → spacing ≈77, 82, 40, 20, 13, 9, 7, 6, 5 px (ref 96, 70, 37, 19, 12, 9). Far VP (500, 477), end glow r 23 px.
* Capture: calls 125, tris 634,089 (budget 130 / 650k). No console errors.
* VP window (180×100 about the VP): warm px 18,000 → 8,056 (ref 2,208, but now mostly ring gold); warm width on the
  VP row 179 → 43 px; core width 46 → 7 px (ref core px 410 vs 171 now: core a bit small).
* Walls non-gold median L #C222B8 R #CE41CC ceil #BE39BE (ref #BF36B4/#CF3DB6/#B2359F); p10 lum 90–104 (ref 77–81).
* Gold median #FFAF4E p90 #FFD17D (ref #FB984D / #FFE280). Rings flat orange with brown blotches; lids edge-on thin plates;
  far river straight striped lanes. → it02: violet F0 + fat slots, 'gold05' env, thicker tilted lids, narrower river.

## it02 (wall05 lavender F0 + slots [0.32,0.12]; materials.ts washerTubeEnv('gold05'); lids thickness 0.42 droop −26; river narrower)
* calls 144 (+19 vs it01, from concurrent benny.glb re-export / foam edits — my pass added no meshes), tris 634,317.
* Walls median L #A326BB R #B742C6 ceil #AF40BA (ref #BF36B4/#CF3DB6/#B2359F); p10 L 46 / R 88 / ceil 79 (ref 77–81);
  dark<60 0.11/0.07/0.06 (ref 0.07/0.07/0.04). Violet now; left slightly too dark.
* Gold median #FFAF65 p90 #FFD58B (ref #FB984D/#FFE280): too pale → it03 saturated F0 + dedicated gold05 env.
* VP: core width 12 px, warm width on VP row 63 px, core px 230 (ref 410). Lids now chunky pucks (salmon, striped).
* Near frame ring at the bottom corners (priority 5): NOT doable as a tube ring with the locked camera — a ring at D≈10
  meets the waterline at x = 500 ± 785 px (off screen); its corner arc lies 2.2 u under the stream. Would need a frame
  standing through the stream at the camera (Benny would clip it). Left for the coordinator.

## it03 (gold05 env saturated + F0 #ffd45c; walls F0 #e49ce8, strips 2.8; lids copper; river chord 0.62 width)
* calls 143, tris 634,205. Gold median #FF9B3A p90 #FFCE6D (ref #FB984D/#FFE280) ✓ hue; brown patches remain on the
  camera-facing slope of near bands (behind-below reflections hit copper) → it04: copper only straight down.
* Walls L #AE20BF R #BE3FCF ceil #BC41BE (ref #BF36B4/#CF3DB6/#B2359F): a bit too blue; p10 84–93 (ref 77–81).
* VP: core width 12 px, warm width 63 px, warm px in VP window 3,416 (ref 2,208), core px 142.
* it04: wall F0 #f29ad6 + mid tint #8a30d2 0.45; lids size 1.9; far river meander 0.3·sin(0.17u), deeper cyan.

## it04 (gold05: copper only straight down; wall F0 #f29ad6, mid tint #8a30d2 0.45; lids 1.9; river meander)
* calls 143, tris 634,205. Walls L #BC1FB5 R #CA3DC8 ceil #C437BE (ref #BF36B4/#CF3DB6/#B2359F); p10 79/95/92.
* Gold median #FFA538 p90 #FFD36B (ref #FB984D/#FFE280); brown patches gone, but bands flat (no highlight line).
* VP: core width 12 px, warm width on VP row 63 px, core px 105.
* it05: gold05 env gets two sharp axis-symmetric light cones (highlight line + lip contour on every band), base a bit
  darker; VP core region 0.6, disc ×1.35; far-river meander 0.09·u.

## it05 (final 05 capture; 5/5 used)
* calls 143, tris 634,205. Walls L #BB1EB6 R #CA3DC8 ceil #C437BF (ref #BF36B4/#CF3DB6/#B2359F); p10 79/95/91 (ref 77–81);
  dark<60 0.09/0.05/0.05 (ref 0.07/0.07/0.04).
* Gold median #FF9F38 p90 #FFCD6B (ref #FB984D/#FFE280). The light cones gave NO visible highlight line (PMREM blur at
  roughness 0.13 / grazing angles) — bands still read as smooth orange-gold without a double contour.
* VP: core width 16 px (lum≥225), core px 183 (ref 410), warm width on VP row 63 px (baseline 179), warm px 3,726.
* Ring tops on x=498: 182–215 (ring 1), 264–285 (ring 2 / far-tunnel seam), 350, 390, 410, 423, 431, 438, 444, 454
  → spacing ≈ 76, 86, 40, 20, 13, 8, 7, 6, 10 px (ref 96, 70, 37, 19, 12, 9); 10 rings visible to the VP.

## Regression + ride check (end of wave 5)
* `regress/04,06,07.png` (calls 154/128/237). screenshots/NN.png are stale (last committed 17:55, before waves 3–4;
  their 21:41 mtime is only the checkout), so I A/B'd in a temp worktree = current HEAD with ONLY my three files
  reverted to 1764258: 06 and 07 scene pixels identical (mean abs diff 1.6; every changed pixel is in the top 190 px
  HUD band, fonts 403 in the worktree). 04: the pipe end shows only the (water-specialist) stream, no far-tunnel artefact.
* Ride 05→06 (`ride/ride_150…182.png`, real sim steps): far section closed at s 150, iris-opening at s 158 (visible
  warp: walls stretch radially, rings swell, ≈1.4 s of ride), fully folded away from s 164; the 06 climb is as before.
* tsc --noEmit passes.

## Left / known limits
* Rings: hue/median now right (#FF9F38 vs ref #FB984D) but no visible double-contour highlight line (p90 #FFCD6B vs
  #FFE280); the env light cones did not show at roughness 0.13 — next step: a view-space rim term in the ring shader.
* Lids: chunky copper pucks, one pair per bay, symmetric; still banded by the strip lights; colour more orange than ref.
* Far river (chord) reads as a narrow candy-striped strip; real coins beyond depth ≈60 are hidden by the far section
  (the ref shows ≈9–10 coins to the VP; we show ≈5).
* Near frame ring in the bottom corners: not built (see it02 note: impossible as a wall ring with the locked camera).
* Opening warp during the ride (above). A per-frame recalibrated far section (eye = live camera) would remove it.
