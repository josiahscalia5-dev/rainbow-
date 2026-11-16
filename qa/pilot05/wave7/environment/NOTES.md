# wave 7 · washer-environment-modeler · Screen 05 (executes the wave-6b plan)

## Plan (written first, before any capture)
1. RINGS: new `withBandShading` (materials.ts) on `gold05` (environment.ts, real + far rings): stylised cross-section from the
   band's object-space axial/radial coordinate — dark copper-rose lip contours, unclipped orange-gold body, pale white-yellow
   highlight line on the crown, dark groove, bright lip line, analytic marquee spots (28/turn); far rings blend warm (no pale-yellow "target").
2. WALLS (`wall05` only): drop the corrugation/bevel relief that bends the strip reflections into the "marble swirl", faint shaded slot lips
   (no pink dotted outline), plumper shorter capsule slots, more violet base, brighter straight white-pink lengthwise streaks.
3. LIDS (`lidMat05` + `lid05`): rose-copper half-disc pucks with `withLidShading` (white highlight on the rim's top edge, thin orange edge
   lines, lighter underside), bigger/more tilted, placed just camera-side of each ring like the reference.
4. VP: `glow05` orange and earlier (warm throat r<50 px, no purple gaps), `tunnelEndGlowMaterial` smaller pale core + orange halo.
5. Only if 1–3 look clearly closer: near gold frame ring corners as real 3D geometry. Max 6 captures (itNN), screen_report each, regress 04 06 07 08.

## Log (all captures 864×1536, locked 05 checkpoint; report vs PREV = qa/pilot05/wave7/baseline/05.png)
Whole-frame mad / tunnel+VP band mad (screen_report; the river/near bands also move with water+foam edits running in parallel):
baseline 59.0 / 62.6 · it01 56.8 / 62.7 · it02 55.5 / 61.9 · it03 55.7 / 63.6 · it04 54.8 / 61.0 · it05 51.5 / 61.0 · **it06 51.2 / 61.0**
(near band "Benny+near water": 63.8 → it04 56.9 → it06 46.7 — the near gold frame). 86 → 87 draw calls, 633,521 → 634,961 tris.
* it01 — rings `withBandShading` v1 (axial ramp), lids `withLidShading`, wall05 relief/rim/slots/streaks. Walls: swirl GONE (kept).
  Rings came out dull rose: the grazing view sees mostly each band's camera-facing flank, which the axial ramp painted as contour.
* it02 — band ramp by view normal; lids thinner/bigger + crisper 'slab' profile (tube.ts); walls 10 slot rows/bay, repeatU 64,
  slotHalf [0.3,0.16], no pink rim, streak width 0.017; `glowT05` (orange, near 95/far 330) for walls/rings/lids only (far river
  keeps glow05); VP disc smaller core + orange halo. Throat now warm. Rings pale peach, no spots visible.
* diagnostics (scratchpad, not iterations): `buildRingsAt` builds its quaternion from the LEFT-handed (right, up, tan) basis → band
  rings mirrored (lip on the far side); fixed for `band` rings only (−right). Forced-tunnel rings (path-camera block) use the same
  left-handed basis as a raw matrix → inverted winding; the band shader is now sign-robust (|N·V|, axis oriented away from the camera).
* it03 — sign-robust shading, spots visible, double contour on ring #2. Body still too orange (measured colour was mixed with spots).
* it04 — measured ref ring #1 between spots (215–230, 90–100, 80–95), spot pitch ≈85 px (≈20/turn), white core ≈12 px in a yellow
  halo → body (222,98,88), 20 spots, core+halo; lid palette rose-copper. Best tunnel band so far (61.0).
* it05 — near gold frame (item 5): `nearFrameGeometry` (tube.ts) + `nearFrameMaterial` (materials.ts), camera-held real 3D bands
  (two corner segments cut at the water + ∩ lip), gated to the 05 straight. Lip top edge at y≈1468 (ref 1466). Corners too thin.
* it06 — corners refit to a circle through the reference edge (0,1210)…cut (150,1420), narrower white bevel highlight. KEPT (final).
* Ride check (scratchpad ride_check.mjs, 04 start → 06): frame absent in 04, slides in s≈120–125, full at the checkpoint, slides out
  s≈161–166 (moved 7 u earlier after the first check showed it over the 06 hall view), absent in 06. No pops. Errors none.
* Regression 04 05 06 07 08 (`regress/`): 06, 07, 08 pixel-identical below the HUD to wave6 regress0408/now (08 first differed 0.67 %:
  three's UUIDs use Math.random, so creating the frame mid-function shifted the 08 laundry-room/pour-stream canvas textures → the frame
  is now built last). 04 differs 6.81 %, but a scratch copy with ONLY my three files reverted differs 6.88 % (other specialists'
  concurrent edits); my share in 04 is 0.091 % (the 05 tunnel seen through the end of the 04 pipe — intended).

## Measured (same windows/classes for all three; crude indicators, not a fidelity %)
| | REF | BASE | IT06 |
|---|---|---|---|
| ring #1 top between spots, mean RGB | (197,79,77) | (252,135,20) | (209,98,113) |
| upper wall x300–700 y190–300: violet of (violet+magenta) / spec-white / gold | 29 % / 5.2 % / 29.5 % | 25 % / 0.2 % / 38.8 % | **79 %** / 3.6 % / 29.7 % |
| left wall x0–130 y420–620: violet / spec-white | 34 % / 5.1 % | 2 % / 1.5 % | **70 %** / 2.0 % |
| VP r32–48 warm share · mean r16–24 | 66 % · (239,181,139) | 48 % · (232,199,164) | 61 % · (227,147,121) |
| warm runs up from the VP (px) | 7–50, 60–68, 164–178, 256–290 | 18–25, 27–29, 31–33, 36–38, 42–46, 50–55, 62–67, 79–87, 115–125, 188–209, 258–289 | 8–46, 50–55, 65–67, 84–87, 121–124, 254–286 |
| lid L1 window x62–215 y318–420 mean / V std | (196,84,115) / 0.216 | (226,109,100) / 0.191 | (214,105,136) / 0.152 |
| near frame gold share BL / BR / bottom arc | 43 / 50 / 45 % | 0 / 0 / 0 % | 32 / 33 / 43 % |

## Left undone / for the next wave
* Walls overshoot to violet (70–80 % vs ref 29–46 %): next step a warmer F0 between '#d49cf4' and the old '#f29ad6', or magenta lit panels.
* VP hot core now small/orange (r16–24 more orange than the ref); far rings still sit at virtual depths 86/124/160/… (ringDv in the
  path-camera block) → ring #2 r≈198 vs ref 170, extra ring at r≈84. Request filed in REQUESTS.md.
* Lids: shading flatter than the ref (V std 0.15 vs 0.22); far lids (path-camera block) stay mid-bay.
* Marble pilot cue "ring spacing ≈ 0.87 R" not adopted: the approved image shows ≈6 slot rows between rings #1 and #2 (live real bays
  14 u ≈ 1.75 R reproduce ring #1 at r 273 exactly); approved image has priority.
