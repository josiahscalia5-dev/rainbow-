# wave 9 · washer-environment-modeler · Screen 05 (continues wave 8 it02 = wave-9 baseline)

## Plan (written first, before any change)
Baseline = `qa/pilot05/wave9/baseline/05.png` (86 calls / 567,415 tris); my windows (wave-8 `measure05.py`) are identical to wave-8 it02:
lid L1 V std 0.188 (ref 0.216), upper-wall violet share 25.4 % (ref 40.0), left wall 4.0 % (ref 50.9), VP core px 723 (ref 1306),
ring #1 gold-pixel mean (239,156,113) (ref (242,142,83)).
1. LIDS (biggest mismatch): the live lids read as copper planks jutting out. Ref L1/L2/R1/R2 (3x zooms): D-shaped half-disc
   SHELVES seen from below — near rim band on top (bright, vertical strip-light streaks), broad flat underside face below it with a
   thin light inner contour, rounded near end tucked into the wall, no visible cut end. Fix the SHAPE/orientation first (plate closer
   to horizontal so the underside reads as a broad D; no open cut face visible; rounded rim + domed top), shading second.
   Probe orientation with scratch renders (`scratchpad/w9/tools/probe.mjs`, ~14 s, NOT iterations), then one capture.
2. RINGS: ref ring #1 = bright yellow-gold with orange edges, thinner, dense bright bulbs + halo; live = thick salmon-copper.
   Ref rings are OVALS (aspect ≈1.7–1.8, coordinator 2026-11-16): test a 05-only lateral stretch (`oval` option already in tube.ts)
   for walls/rings/lids, blended back to round before the 04 and 06 joins; request the same aspect for the far ForcedTunnel from
   path-camera (REQUESTS.md `wave9`). If kept: gameplay-test + ride check 04→06.
3. WALLS: luminous magenta-pink with fine dense perforations + strong white-pink lengthwise streaks (violet share 29–46 %, spec-white
   ≈5–6 %). Consider the Marble `wall_unrolled.png` only if it genuinely looks closer.
4. VP glow: larger warm white-gold core (ref core px 1306 vs 723).
Max 6 captures (it01–it06) with screen_report + side-by-side; revert what does not look closer; ≤130 calls / ≤650k tris; tsc;
regression 03 04 06 07 08 vs `qa/pilot05/wave9/baseline`.

## Log
