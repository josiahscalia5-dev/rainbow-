# Screen 05 — `?paint=1&paintswim=1&benny31=1`: the real 3D Benny swims through the UNCHANGED approved picture (round 32, 2026-11-21)

**User (2026-11-21, verbatim):** "Stop changing my artwork. Why are you doing this? You had my approved screen. Please keep it. I just want the goddamn
pink character to swim around my approved screen. 3D artwork or world. I want my exact approved screen. You had it before. Stop changing it."
+ "Show me 10 seconds of actual gameplay where Benny swims through a gold band and the surrounding scenery still closely resembles my approved Screen 05.
If you cannot achieve this with the current approach, tell me directly."

## What it is
* Scenery = EXACTLY the `?paint=1` Screen 05 picture (the approved artwork's own pixels, same plate file `assets/textures/paint/05k0_plate.jpg`,
  same flowing painted water). Nothing in the artwork was changed. The camera is the picture's own and holds still (classic painted-background game).
* Benny = the REAL 3D Benny of the game (`benny31` improved model: swim clip, paddling arms, pom-pom spring, steering lean), rendered through the
  game's own colour chain and drawn INTO the picture. He sets off from the painted Benny's exact spot and swims along the painted S-river,
  through the gold bands, into the tunnel end, getting smaller with the painting's own perspective; steering moves him left / right on the river
  (foam walls still cost hearts). The painted white splash travels with him.
* Coins sit still on the painted river; he swims into them, they pop from his pom-pom and the counter goes up.
* When he reaches the tunnel end, Screen 06 opens from there (as in `?paint=1`).
* Screen 05 travel speed under this switch: 0.75 x (so Screen 05 lasts ~9 s). Tuning: `&swimspeed= &swimease= &swimh= &swimpitch= &swimsplash=0`.

## Preserved, unchanged
* `?paint=1` (the painted version the user called beautiful) — identical without `&paintswim=1`.
* The rejected 3D attempt `?match05=1&projflow05=2&benny31=1&tun05=1` (`qa/match/05/r31_3d/`) — kept, not used.
* Default build — unchanged.

## Honest limits
* A single painting is ONE viewpoint. Making the camera fly forward through it means every wall, ring and paddle must exist as real 3D geometry
  painted for all angles — that is why every moving-camera 3D attempt drifted away from the approved look. Doing that at approved quality needs a
  dedicated 3D environment artist (or a multi-view generated world), not more rounds of tweaks.
* Visible flaw: where the painted Benny was removed from the picture, the river behind him is reconstructed water (a slightly purple lane down the
  middle); it shows once he swims away.
