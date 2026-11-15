# wave 6 · washer-environment-modeler · Screen 05

## Plan (written first, ~23:10 UTC)
1. Rings: analytic band shader (onBeforeCompile on gold05): cross-section coordinate → sharp white-yellow highlight
   line along the band + dark amber lip contours both edges + Fresnel-ish yellow mids; independent of env maps.
2. Walls: kill the swirl (env-map reflection noise) on wall05/perforatedMetal — low/flat env, analytic lengthwise
   streaks toward the VP, clean dark capsule slot rows, violet→magenta base.
3. Lids: copper-gold half-dome/puck with a glossy analytic top highlight (same shader trick), one per bay each side.
4. VP: keep small warm light, damp the ring "target" near the VP (fade ring brightness with depth).
5. Near frame ring corners only if 1–3 clearly improved and a gameplay-safe 3D solution exists.
Captures: qa/pilot05/wave6/environment/itNN (max 8), screen_report each, regression 04/06/07 at the end.

# wave 6b (restart ~23:50 UTC; the 23:10 plan above was never executed — stopped before any capture)
Baseline = `qa/pilot05/wave6/regress0408/now/05.png` (S-curve refit, camera LOCKED). No director REVIEW.md yet.
1. RINGS (materials.ts new `withBandShading`, applied in environment.ts `gold05`): stylised analytic polished-gold
   shading independent of env maps — N·V ramp (copper edge → amber → yellow → white-yellow highlight line), dark
   amber contour where each half-round meets the wall (local lathe radius), strip "marquee" spots kept, far glow kept.
2. WALLS (wall05 only): no corrugation (the bent strip reflections = the "marble swirl"), narrow bevel, faint rim;
   violet base (#992FC2) between straight white-pink lengthwise streaks; dark capsule slots.
3. LIDS (lidMat05 + lid05 placement): same band shading (rim highlight line, darker underside), horizontal
   shelves seen from below, moved to just behind each ring (ref lids at D≈22/38/70, live 13/30/47).
4. VP: far rings fade toward warm copper/glow with depth (no bright yellow "target"), keep small warm core.
5. Captures it01…it08 (max 8), screen_report each vs regress0408/now/05.png; regression 04 06 07 08 at the end.
