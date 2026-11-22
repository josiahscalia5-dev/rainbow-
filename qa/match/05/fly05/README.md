# Screen 05 — `?paint=1&paintfly=1&benny31=1`: follow camera, Benny stays big, the approved picture travels past him (round 32b, 2026-11-21)

**User (verbatim excerpt):** "CORRECT THE CAMERA AND FORWARD MOVEMENT … as he swims forward, he gets smaller and eventually almost disappears … Use a
proper third-person follow-camera, slightly above and behind Benny, so he remains approximately the same size and position on screen while swimming
forward. The river, purple machinery, gold bands and coins must have convincing depth and move past Benny … Do not simply enlarge Benny artificially
while leaving the scenery stationary … Keep both existing versions saved. Show me an uninterrupted normal-speed gameplay clip …"

## What it is
* Benny = the real 3D Benny (`benny31`: swim clip, paddling arms, pom-pom, steering lean) at the painted Benny's own spot and size, seen from behind
  and above exactly like the approved picture; he steers left / right across the river (foam walls cost hearts). Same Benny on the 06 pictures.
* Scenery = the approved Screen 05 picture itself, travelling past him. The painting's tunnel is self-similar: every gold ring is ~1.675 x the next
  one, all centred on the tunnel end. Flying forward by one ring is therefore the picture scaled by 1.675 about the tunnel end: rings, purple
  machinery, paddles, foam and river come toward him and pass out of the frame; the loop closes on the picture itself (a short cross-fade, 20 % of
  each ring, where the river and paddles are not identical from ring to ring). Painted water keeps flowing; coins flow toward him and pop.
* Normal game speed (Screen 05 ~7 s). Tuning: `&flyk= &flycycle= &flyw=`.

## Versions kept
* `?paint=1` — painted version (picture held still, painted Benny). Unchanged.
* `?paint=1&paintswim=1&benny31=1` — previous test (picture still, 3D Benny swims away and gets small): `qa/match/05/swim05/`. Unchanged.
* `?match05=1&projflow05=2&benny31=1&tun05=1` — rejected moving-camera 3D: `qa/match/05/r31_3d/`. Unchanged.
* Default build unchanged.

## Honest limits
* The motion is a forward flight straight down the tunnel (the picture's own perspective); the camera does not swing round the S-bends.
* During the short cross-fade of each ring the river shows two S-shapes at once for a moment.
* Where the painted Benny was removed, the reconstructed water shows behind him as a slightly purple lane.
