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
