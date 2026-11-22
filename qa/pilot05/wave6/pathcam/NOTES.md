# wave 6 · path-camera-transition-engineer · Screen 05 far section

## Plan (written first, ~23:20 UTC)
1. Re-fit: ForcedTunnel positions computed in the VERTEX SHADER from per-vertex virtual (Z, in-plane offset) +
   eye uniforms updated every frame from the live camera (rings/lids/coins: CPU instance matrices) → the far
   section always projects like a long straight tunnel; drop the iris "open" morph; alpha-hash dissolve 27→20 u before sF05.
2. Far river: new `src/world/far05.ts` shader on a full-width chord: winding river (core #029AF3 + two #F739E5
   bands + glints + low lavender foam rims, discard outside → violet wall), seeded from the near ribbon's core/band
   lateral at sF05 so the seam is continuous, 1–2 more S-bends shrinking to the VP, flow scrolling with time.
3. Far coins: visual-only InstancedMesh (coins.ts geometry/material reused read-only) on the far core so ≈10 coins
   line the winding core to the VP; hidden with the far section.
4. Culling: far parts visible only while the camera is on the 05 straight before the dissolve end.
5. Verify: capture 05 (≤8 its) + screen_report each, ride frames s 140/150/158/164/170, tsc, continuity, regress 04/06.
