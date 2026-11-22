# Screen 06 — route candidate (round 28, USER-AUTHORIZED 2026-11-20 ~17:05 UTC)

## The user's decision (verbatim excerpts, r28)
> "Yes, I authorize you to implement and test that as a separate saved candidate." — "I authorize the separate Screen 06 route test you
> proposed, including the river's curve after the opening and the necessary adjustments to the tunnel, camera and connection into Screen 07.
> Build it as a separate, recoverable candidate. Keep the existing version available for comparison. Use our existing models, textures,
> approved artwork and other saved assets first. Establish and test the route before commissioning additional artwork for this route."
> Benny must visibly: "Approach the purple-and-gold tunnel. Follow the curling river toward its intended opening. Enter the tunnel. Swim
> through its interior and pass its gold rings. Continue beyond those rings and into Screen 07."
> "Preserve the approved Screen 06 opening, its distinctive curling crest, sweeping river and relationship to the off-centre tunnel."
> "Coordinate the river geometry, cyan water, pink edges, foam banks, coin trail, Benny's movement, steering limits, collisions and camera
> so they all belong to the same route." "Keep the successful water-contact and lower-foam corrections wherever they remain compatible."
> "The camera should preserve a useful view of Benny and the upcoming river while the scenery changes perspective naturally. Nearby rings
> should pass him, and the entrance should eventually be behind him."
> "Keep the water clean and continuous. Correct stretched textures, visible joins, oversized highlights, bulky foam and surfaces that obscure
> the route." Final approval only after the user sees the gameplay comparison; every other approval stays at its recorded status.

## What is different from the rejected `m06bend` (r11, NOT AN IMPROVEMENT twice — never repeat)
`m06bend` bent the TUBE along the old river turn → creased slab + edge-on rings. This candidate moves the RIVER / ROUTE instead: after the
opening the river curves up to the LEFT (as in the painting) into the off-centre tunnel opening where the picture shows it; the tunnel's
3D rings stay round and face the route; Benny's path, camera, coins, foam banks, steering limits and collisions follow the new river.

## Requirements (all behind ONE new URL switch, e.g. `&m06route=1`; default build and the step-1/2 candidate unchanged)
1. Opening (start view and the first ~3–7 %): keep it as the approved picture (start view 0 px vs the BEFORE candidate unless a change is
   unavoidable — then say exactly what and why) and keep step 1 (`&m06hole=2&m06fade=1&m06spl=1`) + step 2 (`&m06fcn=3&m06fcg=1`).
2. Route: from the crest the river sweeps up-left toward the painted off-centre tunnel opening, enters it, runs through the ring interior
   (rings pass Benny, round, not edge-on), continues beyond the last ring and hands over to Screen 07.
3. 06→07 join: PREFERRED = rejoin the existing 07 start point and tangent exactly, so Screen 07 and its running candidate (s07, port 5277,
   `/home/user/wt/s07`) stay valid. If that is impossible, change only the 06 side, keep `npm run test:continuity` (all stage joins gap 0)
   passing, and report exactly what moved. Do NOT edit 07 files used by s07.
4. One channel: cyan water, pink edges, both foam banks, coin trail (91 coins total in a full run, coins on the new river), Benny's movement,
   steering limits and collisions all on the same new curve. No water seams, no stretched texture, no oversized highlights, no bulky foam,
   no surface blocking the route.
5. Camera: keeps Benny and the river ahead readable; scenery changes perspective naturally; the entrance ends up behind him. The user's
   unapproved camera test `m06view=1&m06vs=0` may be used or adapted.
6. Existing assets only (approved reference `references/06_crest_the_rinse_arch.png`, the match06 projection / tiles / ring models, saved
   Blender files). No paid jobs. The r27 fal extra views for 06 (`qa/review_r27/artwork/06/`) are UNAPPROVED proposals — at most a look target.

## Proof the user asked for (folder `qa/match/06/r28/route/`)
* BEFORE = the step-2 candidate `qa/match/06/r25/step2/QUERY_NEW2.txt` (the latest version the user saw); NEW = BEFORE + `&m06route=1`
  (+ any camera switch). Same portrait size (864×1536), normal speed, same steering schedule for both (straight, then strong LEFT, then
  strong RIGHT, then straight), equivalent stage positions.
* Full-size labelled stills `1_ORIGINAL_APPROVED.png`, `2_BEFORE.png`, `3_NEW_CANDIDATE.png` per checkpoint: start, opening (~3 %), early
  (~12 %), approach to the opening, tunnel entry, inside passing the rings, middle (~50 %), late (~70 %), past 85 %, the actual exit, first
  frames of 07; plus strong-left and strong-right stills.
* One continuous clip at 1.0x for BEFORE and NEW from the 06 start through the actual exit and the complete hand-over into 07
  (labelled; title not cut off), then 0.5x versions. Say it is an individual playable candidate (not a combined build, not Android).
* Gameplay 8/8 + 91 coins with the NEW query; `npx tsc --noEmit`; `npm run test:continuity`.
* Honest verdict in the user's terms: curling river shape closer?; does Benny clearly travel into and through the tunnel?; do walls, rings,
  water, foam and lighting keep the approved look while passing?; clean while steering?; 07 join visually + in play?; what still differs;
  any new problem. No unmeasured percentages.
* If it is NOT a clear improvement: say what prevented it and what a different next attempt would change — do not run a near-copy.
