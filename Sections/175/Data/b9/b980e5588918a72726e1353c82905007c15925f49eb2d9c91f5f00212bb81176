# Screen 08 camera / gameplay-video check (`?camclear=1`) — NOTES

Branch `claude/rainbow-s08-camclear-c2` (continued from `claude/rainbow-s08-camclear` @ `5547670`).
Source: the user's phone recording of the match08 APK (`qa/gameplay_video/source/…mp4` on the lead branch
`ccr-5495e9c4-g0apvl`, read with `git show`, not copied).

## What `?camclear=1` does (code from the previous session, `src/game/camClear.ts`, verified here)
* Gold rings, lids/hoods, gold lips, the 03 drain funnel and foam banks become see-through (fine dither) only where they
  sit between the view and Benny, or right against the lens. Walls, water, Benny, coins and the 08 picture are never touched.
* 06: the view stays inside the tube instead of pressing against the drum wall, and looks down the tunnel.
* 08: the view stops at the approved 08 spot and holds there while Benny rides into the picture; it leaves for 09 only
  in the last 3 u of 08. Respawn re-frames at once.
* OFF by default — nothing is created without the switch.

## Step 1 — verification (2026-11-17 ~17:00 UTC)
| Check | Result |
|---|---|
| `npx tsc --noEmit -p .` | clean |
| Continuity (`npm run test:continuity`) | ok, all joins gap 0, 07→08 drop 61.19 u (unchanged) |
| Gameplay default | 8/8, 91 coins, 2,240 (`tests/gameplay_default.json`) |
| Gameplay `camclear=1` | 8/8, 91 coins, 2,240 (`tests/gameplay_camclear.json`) |
| Gameplay `match08=1&camclear=1` | 8/8, 91 coins, 2,240, drop 61.31 u (`tests/gameplay_match08_camclear.json`) |
| Default build vs commit `5965a01` (before camclear), 11 screens | 02–06, 08, 09: **0 px**. 01, 07, 10, 11 differ by the same amounts between two captures of the OLD build itself (capture noise: 689 / 43 / ≤3,645 / ≤52,298 px), so 0 px attributable to camclear |
| `match08=1` 08 view vs `5965a01` | **0 px** |
| `match08=1&camclear=1` 08 view vs `5965a01` | camera matrix bit-identical, scenery 0 px; 55,668 px differ by ≤12 colour levels (14 px > 5) on Benny, his splash card and the coins |

Cause of the last row (proved): the soft fill light and the splash card follow the view and are placed one simulated
frame late. The capture tool's checkpoint runs 40 lead-in frames; without camclear the view creeps forward in them,
with camclear it already holds at the approved spot, so the light sits ~0.2 u differently in the single still frame.
With the light + splash card placed from the final view (temporary local test, not kept) the two pictures are **0 px**
different. In live play both are updated every frame, so nothing differs once riding. The approved framing does not move.

Other still views with `camclear=1` (no match switch): 03, 05, 07, 09 0 px; 04 and 06 change on purpose (04: foam/ring
pieces in front of Benny thinned; 06: view inside the tube, Benny large and central).

Tools: `tools/camclear/*` (probe.mjs = real-time frames from app start, timeline.mjs, camtrace.mjs).
