# Screen 05 wave 7: foam-bubbles-particles (executes the wave-6b plan)

Started 2026-11-16 (account 8, branch ccr-4f6c3e0e-5kxgr0). Baseline `qa/pilot05/wave7/baseline/05.png` (86 calls,
633,521 tris). Files: src/vfx/foam.ts, bubbles.ts, riderSplash.ts, spray.ts, index.ts only (Edit tool).
Tools: `qa/pilot05/wave6/foam/tools/{foamcol,rowprof}.py` (measurements), ref foam ramp in `../../wave6/foam/NOTES.md`.

## Plan (5 lines)
1. Soap ramp (05-gated, set uniform/constant, NOT the unwired wave-6a patch): lavender-white tops -> periwinkle -> blue
   -> blue-violet crevices on the berm, berm puffs and flank impostor bubbles; white only on top caps.
2. Right heap (x 680-864, y 770-950): fewer/lower/smaller bubbles (find which system draws it first: isolation capture).
3. VP rims: low small-bubble band hugging both river edges, purple wall visible above it.
4. Near clumps: left y 980-1100 / 1200-1330, small lower-right clump x 610-790 y 1217-1300.
5. Keep spray fan + iridescent bubbles (a few more small ones near the banks); <= 6 captures; tsc; regress 03 04 06 07 08.

## Log
* iso (`iso_norafts`, waterhide=foamRafts): the right heap x 680-864 y 770-950 and all near clumps are the flank
  impostor bubbles (rafts); the VP rims are the berm + berm puffs. Baseline rowprof: right heap 124-179 px/row at
  y 780-900 (ref rim 19-66 px/row, inner edge 30 -> 158 -> 70 px from the frame edge over y 700-940).
* it01 (05 frame: 86 calls, 634,673 tris): foam.ts SOAP05_GLSL (soap05 ramp + soapT view-space top light) used by
  BERM_FRAG (uSt05 ramp, set in createBerm), PUFF_VERT/FRAG (instanceColor.x = ao + 2q, q = 05 weight x 8, set in
  build()/addPuff), BANK_BUB_FRAG (rafts, 05-only). updateRafts: RIM_R ref-measured inner-edge profile for the right
  rim (80 px wide band, heap/outer kinds skipped, lift x0.5, r x0.85), BANK_ENV seeds searched to the ref's clump
  rows, BANK_PX L 180 -> 150. Seen: right heap gone, narrow diagonal right rim; foam reads lavender-grey (too flat,
  R > G), lower-right clump too big (x 640-864, y 1110-1300: right env 0.48 at ds -0.26), lower-left clump squeezed
  to the frame edge by the rider clearance (k = 0.22). Measured (foamcol): Rfar 24.4k px WHITE 35 % SHADE 27 %,
  heapR 21.6 % / max run 132 (baseline 35.1 % / 160; ref 14.0 % / 65). screen_report mad 59.0 -> 56.9 (includes
  other specialists' concurrent env/water edits).
* it02 (86 calls, 632,561 tris): soap05 stops shifted azure (G >= R mid-tones, ref near clumps 70 % (222,230,253)),
  stronger silhouette crevice term (0.3 + 0.45 low); right near clumps get their own envelope BANK_ENV[2] (searched:
  0 for ds -0.4..2.6, 1 for -1.45..-0.75), blended into the rim envelope over ds 1.4-2.6; behind-Benny clearances
  relaxed (rider x0.5, core x0.4 at ds <= -1.2); 22 % of body bubbles are big bumps (r x1.55, lift x0.45). Seen:
  foam now blue-white shaded like the ref; lower-right clump in place (inner x 640) but spread to the frame edge;
  near clumps read as loose grape scatter; lower-left inner edge x 160 (ref 214, rider clearance). foamcol: Lfar
  WHITE 30.5 % SHADE 43.2 %, Rfar 31.6 / 43.1, Lnear 12.7 / 45.1, Rnear 15.2 / 43.4 (ref 22.6/48.1, 22.8/44.2,
  29.9/47.7, 33.5/48.1); heapR 21.5 % / 129 px. mad 59.0 -> 55.5.
* it03 (86 calls, 632,561 tris): near clumps (ds < 2.5): r x1.25, drawn 25 % toward the clump middle, mound lift
  +0.7 r sin(pi f); big on-screen raft bubbles (vBig, >= ~40 px) +0.1 t (whiter caps); behind-Benny rider clearance
  x0.32 at ds <= -1.2; right near clump inner 226 px / 145 px wide; bubbles.ts RIDE.small05 = 22 (high) / 12 (low),
  used only while focusS is inside 05 (other stages keep 12 / 8). Seen: near clumps became tall cauliflower columns
  (left x 0-90 y 940-1110, right y 1130-1300; ref mounds are low, ~100 px), too white (Lnear WHITE 47.5 %). NOTE: the
  environment's concurrent ring change (white rings) now passes the foam colour mask, so foamcol Lfar/Rfar are
  contaminated from it03 on; judge far foam on the crops.
* it04 (86 calls, 632,561 tris): near mound lift 0.7 -> 0.3, near r x1.25 -> x1.15, vBig +0.1 -> +0.05, core
  clearance behind Benny x0.25. Seen: lower-left clump now reaches x 199 (ref 57-214); near clumps still too high
  and tall vs the ref (gridded crop: ref left near x 0-130 y 1020-1110, lower left x 60-230 y 1220-1300, lower
  right x 650-800 y 1260-1330; live it04 left near y 960-1110, lower clumps y 1140/1170-1340). foamcol Lnear WHITE
  32.8 % SHADE 33.9 %, Rnear 31.2 / 34.9 (ref 29.9/47.7, 33.5/48.1). mad 55.3 (it02 55.5).
* it05 (86 calls, 632,561 tris): BANK_ENV re-searched on the gridded ref clump rows (L [58.457, 0.835, 0.581]: 1 for
  ds -1.45..-0.95 and 0.5..1.5; right near [267.601, 1.094, 0.563]: 1 for ds -1.6..-1.15), right near clump inner
  214 px / 150 px wide, BANK_PX L 170, near r x1.05, mound lift 0.12. Seen: left near clump x 0-130 y 1010-1110 (ref
  0-130 / 1020-1110), lower right x 660-820 y 1210-1340 (ref 650-800 / 1260-1330), lower left x 0-170 y 1230-1340
  (ref 60-230 / 1220-1300; row env 0.76). Best so far. foamcol Lfar WHITE 24.9 % SHADE 48.1 % (ref 22.6/48.1), Rfar
  39.5 / 37.2 (ref 22.8/44.2), Lnear 24.5 / 35.5, Rnear 19.8 / 34.4; mad 55.2. Probe: 672 raft puffs shown, 22 small
  + 19 big bubbles. iso_noberm (waterhide=foamBerm): the pale lavender slope between the right rim puffs and the
  wall (and the wedge at the far end, x 600-650 y 540-600) is the berm's outer slope.
* it06 (86 calls, 632,561 tris) = FINAL: BERM_FRAG in 05 discards the bank beyond a scalloped cell edge just past
  its crest (raw e > 0.3 + 0.45 (1 - c1); threshold 9.0 = never outside 05), so the wall shows right above the rim
  instead of the berm's pale outer slope. Seen: right rim band narrower, purple wall directly above it (x 760-864,
  y 640-690); left rim unchanged; everything else as it05. foamcol Lfar WHITE 24.5 % SHADE 48.6 %, Rfar 39.5 / 35.0,
  Lnear 24.6 / 35.7, Rnear 19.8 / 35.7; heapR 21.3 % / max run 129 px (baseline 35.1 % / 160, ref 14.0 % / 65).
  screen_report mad 59.0 (baseline) -> 54.8 (whole frame; includes the other specialists' concurrent edits).
