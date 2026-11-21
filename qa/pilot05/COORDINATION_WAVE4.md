# Screen 05: wave 4 (account 5, session branch `ccr-e033f912-8b40f5`)

Started 2026-11-15 ~21:05 UTC. Waves 1–3 were each cut off by usage limits; every edit they saved is in the
tree and is **kept** (wave 3's resumed agents never ran: the account hit its limit at 20:17 UTC).
`COORDINATION_WAVE3.md` still holds: targets 1–10, strict file ownership, rules. This file only adds:

## Baseline for wave 4
* Approved target: `references/05_flow_into_the_current.png` (immutable).
* Live game at wave-4 start: `qa/pilot05/wave4/baseline/05.png` (stage 05, s 132.44, 120 calls, 629k tris).
* 50 % overlay with the ref landmarks (VP + Benny box): measured VP and Benny's bbox are already within
  ≈25 px of the ref, so **the camera is LOCKED** at the current `STAGE_CAM['05']` values (back 6.4, up 3.6,
  ahead 18, lookUp −1.92, fov 62, yaw 2.96). Do not ask for camera changes; fix your own element instead.

## Owners (wave 4)
| Area | Owner | Files |
|---|---|---|
| Camera, path, coins ($ glyph, size, on the cyan core), checkpoints, bloom strength in `Game.ts` | coordinator (main session) | `src/game/cameraRig.ts`, `src/world/course.ts`, `src/gameplay/coins.ts`, `CHECKPOINTS` + bloom lines in `src/game/Game.ts` |
| Walls, perforations, gold rings, lids, VP glow, grade | washer-environment-modeler | as in wave 3 |
| River surface | water-fx-specialist | as in wave 3 |
| Foam banks, bubbles, splash under Benny | foam-bubbles-particles | as in wave 3 |
| Benny model | benny-character-artist | as in wave 3 |

## Limits (to finish inside this account's usage)
* At most **6 capture iterations** each (`timeout 600 node scripts/capture.mjs 05 --out=qa/pilot05/wave4/<you>/itNN`).
* One regression capture of 04 06 07 at the end only if your file is shared with those screens.
* `npx tsc --noEmit` must pass. Write `qa/pilot05/wave4/<you>/NOTES.md` (what changed, measured numbers, what is left).
* Requests to another owner: one line in `qa/pilot05/REQUESTS.md` prefixed `wave4`.
