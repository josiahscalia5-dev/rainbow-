# water-fx-specialist, wave 6 (Screen 05)

Owns only `src/vfx/waterRibbon.ts`, `src/vfx/glsl.ts`, `docs/vfx/*`. Camera LOCKED. `coreLateral` export kept
(signature + values). Kept from wave 5: no pink fins behind Benny, S-band phase, smooth band clamp (`smin`).

## Plan (5 lines, biggest area first)
1. Near field y 1000–1536: replace the vertical pink side sheets by DIAGONAL sweeps that leave Benny's sides
   and fan out toward the bottom corners (ref runs y1300 x 124–206 / 613–698), narrower, satin + silk streaks.
2. Near field: remove the "∩" pool-ripple crest arcs; instead flow-aligned long white speed streaks, glossy
   cyan body (#02A2F7 / #0199F0), bright cyan-white highlights, many small 4-point star glints.
3. Mid field y 560–1000: pull the band centres toward the ref (L reaches x≈27 at y900 and leaves the frame;
   R ≈780/670/650/790 at y700/820/900/980); give the core crests/troughs + flowing highlights (thick river).
4. Keep: clear cyan contact under Benny, pink-free water behind Benny, coins on the core (coreLateral).
5. Max 8 captures qa/pilot05/wave6/water/itNN, revert anything not closer as a whole frame; then ONE
   regression capture 03 04 06 07, low-quality compile check, tsc.

## Log
(updated after every capture)
