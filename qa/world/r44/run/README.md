# Round 44 — uninterrupted real-touch gameplay recordings of the ONE connected world (412 × 915, 30 fps, real CDP finger swipes)

| recording | route | frames | swipes detected | Benny on screen | hole pixels | camera max step / turn per frame | scenery moved | water gap max |
|---|---|---|---|---|---|---|---|---|
| `GAMEPLAY_world_04_A_B_GRAY_real_touch.mp4` (plain materials) | 04 start → doorway → Bubble Dash → arch → Sock Rescue tunnel (s 1.35 → 80.5) | 1083 | 17 / 17 (2 leaps) | 1083 / 1083 | 0 in all frames | 0.096 u / 0.67° | 0 of 225 | 0.02 u |
| `GAMEPLAY_world_04_A_B_TEXTURED_real_touch.mp4` | same run, approved pixels baked on the geometry | 1083 | 17 / 17 | 1083 / 1083 | 0 in all frames | 0.096 u / 0.67° | 0 of 225 | 0.02 u |
| `GAMEPLAY_world_SockRescue_to_05_TEXTURED_real_touch.mp4` (first take) | Sock Rescue s 70 → S-curve connector → 05 s 112 | 574 | 10 / 10 | 574 / 574 | 20 frames, ≤ 31 px (crack where the sock tube meets the connector) | 0.106 u / 1.77° (05's tight S-river after its picture view) | 0 of 312 | 0.02 u |
The first B → 05 take showed a hairline crack at the tube seam and a fast camera turn in 05's S-curve: fixed (connector overlaps 0.2 u into both
tubes; camera heading averaged over ±1.6 u) and re-recorded — see the `..._v2` files when present. Immersion: 11–22 % in the water, negative only
during the leaps (out of the water by design). Swipe plans: `swipe_plan.json`, `swipe_plan_B05.json`.
