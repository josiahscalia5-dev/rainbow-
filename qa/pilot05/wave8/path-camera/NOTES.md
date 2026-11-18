# Screen 05 wave 8 — path-camera-transition-engineer

## Plan (written before any edit)
1. Far river: replace the straight striped chord with a winding far stream — the chord's centre (and the cyan core / pink bands)
   follows an S-bend lateral offset that continues the real near/mid core (coreLateral) at the seam and narrows into the VP.
2. Far coins: only if they can be placed through ft.point and hand over to the real coins with no pop; else omit (gameplay count unchanged).
3. Far ring depths: ringDv → ≈61/103/161/255 virtual depth (+ throat); request the env specialist to flatten/drop the real ring at sF05 if needed.
4. Far foam rims (fine lavender/blue edges) on the far river + warm white-gold far VP (my glow), rings receding evenly into it.
5. Each step: capture itNN, screen_report vs baseline, Read the side-by-side, keep only what looks closer; finish with tsc, ride check, gameplay test, regression.

## Log
* **it01 / it02 — RECOVERED entry (written in wave 9, session 01Kbt6BV, from the evidence only; the wave-8 account ran out of
  credits before logging).** Code state = `src/world/far05.ts` (240 lines: `FAR05_CORE` designed far core path,
  `bandLayout`/`farRiverLayout` real-ribbon continuation blended Z 2→10 into the design, `farRiverGeometry` per-row
  aRivA/aRivB attributes) + `farRiverMaterial` (materials.ts, winding core/bands, foam rims, glow) + far block
  `ringDv = [59, 97, 161, 222, 322]` with the D≈59 ring gated on `realSeamRing` (env dropped the real sF05 ring at 02:58).
  - it01 vs wave-8 baseline: mad 51.2 → 50.9, hue_corr 0.856 → 0.881, edge_corr 0.177 → 0.178, tunnel+VP 61.0 → 58.7,
    river mid 47.2 → 48.4 (worse), Benny+near 46.7 → 46.7. Side-by-side: the straight candy-striped wedge is gone; the far
    stream bends right and back toward the VP, but reads as a broad pale blue/white wedge with lavender flats.
  - it02: mad 50.7, hue_corr 0.879, edge_corr 0.192, tunnel+VP 58.6, river mid 47.7, Benny+near 46.8. Far stream narrower
    and more clearly winding (cyan with pink on the right); far coin trail still stops at y≈540 (6 coins vs ≈10 in the ref).
  - NB: walls/rings/water of other owners changed in parallel between these captures, so the deltas are not mine alone.
  - Kept: it02 state (it is the code as recovered). Not done in wave 8: far coins, far-river seam colours (water-fx 03:10),
    far foam rim look (foam 03:20). Continued in `qa/pilot05/wave9/path-camera/NOTES.md`.
