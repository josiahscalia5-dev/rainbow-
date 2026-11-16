# water-fx-specialist, wave 7 (Screen 05) — executes the wave-6b plan (qa/pilot05/wave6/water/NOTES.md)

Owns only `src/vfx/waterRibbon.ts`, `src/vfx/glsl.ts`, `docs/vfx/*` (Edit tool only). Camera + course LOCKED.
Keep: `coreLateral` export (signature + values), clear cyan contact under Benny, pink-free water behind Benny,
coins on the core. Baseline/PREV = `qa/pilot05/wave7/baseline/05.png`.

## Plan (5 lines, biggest area first)
1. Near field y 1000–1536: replace the two wide flat vertical pink sheets by DIAGONAL pink sweeps that leave
   Benny's sides and fan out toward the bottom corners (ref runs y1300 x 124–206 / 613–698), narrower, satin + silk.
2. Near field: remove the "∩" pool-ripple crest arcs; flow-aligned long white speed streaks, glossy thick cyan
   body (#02A2F7 / #0199F0), bright cyan-white highlights, many small 4-point star glints.
3. Mid field y 560–1000: pull the pink band centres toward the ref (L ≈350/120/27 at y700/800/900, R ≈780/670/650/790
   at y700/820/900/980); core crests/troughs + flowing highlights so the river reads thick, S-bending to the VP.
4. All changes gated to 05 (sw / near5 / vStyle.x); 04/06/07 strand path untouched.
5. Max 6 captures qa/pilot05/wave7/water/itNN, revert anything not closer as a whole frame; ride check 05→06 if
   anything distance-dependent moves; then tsc + ONE regression capture 03 04 06 07.

## Log
(updated after every capture)

### Facts measured before editing (scratch probe of the locked 05 camera + scratch metric script m05.py)
* Rows: y 1150 ≈ s 132.44 (Benny's waterline), y 1240/1280/1320/1360 = 0.87/1.19/1.48/1.74 u behind him at
  205/218/228/239 px/u; visible lateral y 1000 −3.15…+2.95, y 1300 −1.8…+2.0, y 1500 −1.35…+1.7.
* Ref near sweeps → centre ±(0.4 + 0.52·back) u, half width ≈ 0.2 u. Ref mid bands EXIT the frame: left by y≈930,
  right by y≈1090. Live: wave-5 `near05` (0.8× offset) + `nb` glide (to Benny ±1.42 u) pulled them back in =
  the two vertical sheets.
* Ref | baseline: pink behind Benny (x245–600 y1200–1360) 1.84 | 0.0 %; near lumStd/p5/p95 40.0/105.7/247 |
  35.8/100.3/216.7; cyan median y1300 #01ACF8 | #18A1FF, y1400 #019AF2 | #1A9EFE; glints y1200–1536 166 | 62,
  y700–1200 352 | 256.

### it01 — tsc ok, 0 console errors, 86 calls, 633,521 tris (unchanged)
Changes (`waterRibbon.ts` FRAG): `nb` glide DELETED; new exit push (offL += 2.0·ss(7,2.5,db), offR += 1.6·ss(2.6,0.4,db),
before the bank clamp); new wake sweeps `pW` (diagonal, centre from Benny's track, satin rel/rims); near field "∩"
crests (phN) DELETED → fanning flow lanes (kN = lat/(1+0.7·back)) + long speed streaks; 05 ripple rings + V-wake
gated off (×(1−sw)). Seen: sweeps diagonal ✓, arcs gone ✓, mid bands exit at the sides ✓; but sweeps flat solid tubes,
≈50 px too far out (Benny's real waterline s ≈ 0.3 u ahead of the row I assumed), near body flat.
Measured: screen_report mad 59.0 → 55.0 (near band 63.8 → 59.6, mid 53.0 → 49.1; tunnel band also changed by the
environment specialist's concurrent edit). Sweeps y1280 119–219 / 629–736 (ref 134–238 / 586–669), y1320 68–174 /
680–795 (ref 91–202 / 626–738). Near lumStd/p5/p95 17.6/136/188 (flat!), cyan y1300 #00A4FF, glints near 64, mid 330.

### it02 — 0 console errors, 86 calls, 634,673 tris (tri change = other specialists)
Changes: sweep fit cW = 0.2 + 0.55·back, taper 0.7→1.4 u; sweep satin (deep-magenta edges + braided light silk
streaks `stW`); near body: domain-warped flow (kNw), deeper lanes, glossy ridges, denser small stars.
Measured: sweeps y1280 154–252 / 593–697 (ref 134–238 / 586–669), y1320 101–208 / 643–760 (ref 91–202 / 626–738);
near lumStd/p5/p95 26.1/129.7/216.3; cyan y1300 #00A6FF, y1400 #009EFD; glints near 106 / mid 338; pink behind
Benny 5.08 % (ref 1.84: sweep tips at y1240–1280). report mad 55.9 (near 57.6, mid 48.6).
Seen: satin diagonals like the ref ✓; near body busy hair lines; small stars in a visible dot GRID; no big flares.
Mid field, band centres back-projected (scratch inv.py, lateral from core): left ✓ within ≈0.3 u at s 135–141;
right +0.3 u too far out at s 136–139, 0.7 u too far in at s 148–150, 1.9 u too far in at s 152–156 (the ref band
runs along the right bank); left 0.5–0.7 u too far out at s 145–152, 1.0 u too far in at s 158–164.

### it03 — 0 console errors, 86 calls, 632,561 tris
Changes: stationary 05 channel shape fL/fR(s) (fitted from the numbers above, 0 beyond s 180); near stars rows bent
by a smooth warp; two flare sets (flB) along the warped flow; fine streak set ×0.35.
Measured: right band s 136–139 now +1.21…+1.86 (ref +1.17…+2.0), widths 108–123 px (ref 117–156); left s 149–152
−2.0/−2.18 (ref −1.47…−2.05); right s 150–154 +4.44…+5.26 (ref +5.11…+5.79). report mad 55.5 (mid 48.2, near 57.6).
Near lumStd/p5/p95 27.6/130/220; glints near 73 / mid 294 (fewer counted blobs). Seen: S-river shape visibly closer
(right band along the right bank in the distance, bends in at y 800–900). Zoom vs ref: ref near highlights are big
lens-shaped white flares on smooth glossy blue; ours round "snow dots" + hair lines; ref pink bands carry
bright white-pink streaks.

### it04 — 0 console errors, 86 calls, 632,561 tris
Changes: `glsl.ts` flowGlint core exp(−r²·0.06)·1.5 → exp(−r²·0.22)·1.4 (05-only function); new `lensFlare()` in
FRAG_FX_GLSL; near: ridges pow 7 → 3, speed streaks ×0.5, small stars density 0.85 → 0.55, lens flares added; pink
streak contrast (0.62 + 0.55·H5 → 0.42 + 0.8·H5). Measured: report mad 55.6 (mid 47.6, near 57.3); near lumStd/p5/p95
26.9/131.7/218.3; glints near 63 / mid 322. Seen: snow dots gone (crisp 4-point crosses) ✓ cleaner; only 2 small
lens flares (cell clamp limited them to ≈60 px); near body still too uniform/light (p5 132 vs ref 106).

### it05 — 0 console errors, 86 calls, 632,561 tris
Changes: lens cells wider (kNw·1.8, density 0.8, 90 px) + 2nd set (kNw·3.1, 0.5, 50 px); deeper near lanes
(troughN 0.6→0.12, ×0.55); glints also on pink (pink-white, ×(1−0.2·pink)); silk white boost ×0.9 on pink.
Measured: report mad 55.8 (mid 47.6, near 57.6); near lumStd/p5/p95 28.8/131.3/222.3; cyan y1300 #06A9FF;
glints near 61 / mid 309. Seen: ≈8 lens flares now in the near field but thin dim slivers (ref: thick bright
haloed flares); darker lanes visible.

### it06 (FINAL, kept) — 0 console errors, 86 calls, 632,561 tris; LOW_Q 05 capture ok (it06_low, 0 errors)
Changes: lensFlare thicker core (th·0.6) + wider glow ×0.7; near lenses ×1.6; mid-field lens sparkles `lzM`
(wq·1.2 × v5·0.5, 30 px) on core and pink, faded by fwidth(s). Measured: report mad 55.4 / hue 0.868 / edge 0.171
(best of all iterations; mid 47.2, near 56.9); near lumStd/p5/p95 29.6/132.3/225.0; cyan y1300 #12B0FF,
y1400 #02A3FF; glints near 88 / mid 318. Seen: near water now glossy with ≈10 thick white lens flares, mid core glitters.

| metric (864×1536) | baseline | it06 | ref |
|---|---|---|---|
| screen_report mad / hue_corr / edge_corr | 59.0 / 0.809 / 0.117 | 55.4 / 0.868 / 0.171 | — |
| mad river mid / Benny+near water | 53.0 / 63.8 | 47.2 / 56.9 | — |
| pink runs y1280 | 61–146, 661–791 (sheets) | ≈154–252, 593–697 (diagonal) | 134–238, 586–669 |
| pink runs y1440 / y1500 | 0–63, 698–852 / 0–24, 717–863 | sweeps leave the frame at the corners | (gold ring) |
| pink y1000–1200 beside Benny (left) | x 85–210 (in-glide) | none (bands exit) | none |
| pink near y1000–1536 | 34.1 % | 19.7 % | 15.1 % |
| pink behind Benny x245–600 y1200–1360 | 0.0 % | 5.0 % (sweep roots) | 1.84 % |
| near lumStd / p5 / p95 | 35.8 / 100.3 / 216.7 | 29.6 / 132.3 / 225.0 | 40.0 / 105.7 / 247 |
| cyan median y1300 / y1400 | #18A1FF / #1A9EFE | #12B0FF / #02A3FF | #01ACF8 / #019AF2 |
| white glints y1200–1536 / y700–1200 | 62 / 256 | 88 / 318 | 166 / 352 |
(the tunnel/HUD bands of the report also move with the environment specialist's concurrent edits)

### Ride check 05→06 (scratch ride.mjs, steer 0, frames at s 134/145/160/175/184/187/190/194 + 1-frame pairs)
`qa/pilot05/wave7/water/ride/` — 0 errors; wake sweeps follow Benny in every 05 frame; 05→06 hand-over continuous;
pairs at 187/190 show only motion edges (ride_pairs_187_190.png), no layout pop or warp.

### Regression 03 04 06 07 (`qa/pilot05/wave7/water/regress`, 0 console errors)
vs `qa/pilot05/wave6/regress0408/now`: 06 and 07 pixel-identical below the HUD (0.00 %); 04 1.11 % inside x 303–550,
y 445–672 = the 05 river seen in the distance through the drum exit (05-gated change, intended: crisper star crosses,
band shift); 03 (ribbon hidden in the whirlpool) looks normal (contact_03_04_06_07.png). tsc OK.
Open: near p95 225 vs 247 and glints 88 vs 166 (ref has more/bigger flares); pink-behind-Benny 5.0 % vs 1.84 %
(sweep roots at y 1240–1280 sit ≈20 px inside the box); far river at the VP (y≈470–560) is the 06 section
(path-camera owner); gold ring corners (environment).
