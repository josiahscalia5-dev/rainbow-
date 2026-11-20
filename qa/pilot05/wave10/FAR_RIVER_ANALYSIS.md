# Screen 05 far river — does it need geometry or shader work? (2026-11-16 ~12:25 UTC, session `01Kbt6BT`)

User: "The far river still needs to wind in continuous, beautiful S-curves all the way into the golden light.
Determine whether fixing this requires 3D river path or surface geometry changes rather than more shader adjustments."

## How the far river is built
* The real (rideable) 05 river = `course.ts` meander05 (gameplay path: coins, steering, camera follow). It runs only
  ≈54 u ahead of the locked checkpoint eye before the straight flares into the 06 hall.
* Beyond that seam the river is a separate 3D surface: `src/world/far05.ts` lays it in the ForcedTunnel's virtual
  straight tunnel (depth Z) along the designed lateral path `FAR05_CORE` and maps it into the last few real units.
  Visual only — the player never rides it as gameplay geometry.
* `FAR05_CORE` has ONE swing: +0.55 u (Z 8) → +4.45 u (Z 140) → −2.8 u (Z 400). Its comment says the reference's left
  dip at y≈550 was deliberately not chased (it sits where the real course has its exit bend; a wiggle at the seam).

## Measured centreline (cyan-core median per row; back-projected with f 1278 px, VP y 479, eye 3.56 u above the far
## water plane — the numbers documented in far05.ts). Noisy where pink bands split the cyan; trends are what count.
| depth Z | APPROVED lateral u | GAME lateral u |
|---|---|---|
| 130 (y 514) | +4.6 | +3.2 |
| 97–111 (y 520–526) | +3.3 … +3.9 | +3.0 … +3.1 |
| 77–86 (y 532–538) | +0.5 … +0.7 | +1.7 … +2.6 |
| 59–70 (y 544–556) | −0.8 … −2.5 | +1.2 |
| 40–51 (real river, y 568–592) | −1.5 … −3.5 | 0 … −0.5 |
| 22–26 (real river, y 652–688) | +0.9 … +2.1 | −1.3 … −0.1 |
Far section (y < 563): x swing on screen APPROVED 99 px vs GAME 24 px.

## Verdict
**Geometry, not shaders.** The approved far river bends LEFT just past the seam (Z 55–65, ≈ −2.5 u), then swings hard
RIGHT (+4.6 u at Z≈130), then back into the light. The game's far path skips the left bend and only drifts right, so it
reads as one bend into a blob. More shader work cannot add bends.
1. **Far path (`FAR05_CORE`, far05.ts) — visual only, safe for gameplay and the 05→06 join:** add the left dip at
   Z 55–70 and a sharper right swing at Z 85–130, then alternating, shrinking bends into the VP. The seam must still
   land on the real ribbon (continuity at Z≈54) — blend the dip in over Z 54→62 instead of a kink.
2. **Real 05 river end (course.ts MEANDER05 knots) — gameplay path:** the approved river sits further LEFT at Z 40–50.
   Only as its own test, with `npm run test:continuity` + `node scripts/gameplay-test.mjs`, keeping U05_TAIL / the
   tangent 05→06 join and the 06 checkpoint unchanged.
Owner: path-camera-transition-engineer (far05.ts author) or the coordinator, behind a URL switch (default unchanged).
