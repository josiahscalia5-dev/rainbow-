# RAINBOW round 3 — next milestones (lead, 2026-11-17 ~18:05 UTC)

Usage: the account reported `allowed_warning` on its 7-day limit at ~17:55 UTC. Per the user ("prioritise Screen 08;
do not exhaust usage just to keep all six active"), three workstreams run, three are paused with work saved.
Every branch below is the newest remote tip at ~18:00 UTC; the user's listed checkpoints are all contained in them.

| Workstream | Session | Branch @ tip (18:00) | State | Next milestone |
|---|---|---|---|---|
| 08 Benny | `session_01Q46SCJxXZNaUL12aCQ6mX4` | `claude/rainbow-s08-benny08-bake-c3` @ `e66a5d05` (r3b `e94541c2`) | **RUNNING round 4** | fur clumps + crown/shoulder highlights; hat crown/cuff/pom highlights + knit contrast (keep crisp cuff ribs); lighter violet pom tufts; proportions (rounder body, relatively larger hat) via switch-guarded M08 placement only; motion + 04–07; APPROVED \| r3b \| NEW; APK. Keep whichever version best matches the approved Benny — visible quality over the number. |
| 08 camera | `session_01Q46SCLvd1Cb5N4WHTHcHB4` | `claude/rainbow-s08-camclear-c3` @ `6282ce70` | **RUNNING** (round-2 steps 2–4) | video \| build \| camclear frames, remaining obstructions, stable world-up near the drain lip (the water's changing "up" can flip the view), moving check 07→08→09, APK. |
| 07 | `session_01Q46SCJx6kKaxMCCbLLqta3` | `claude/rainbow-s07-match-c3` @ `a5e69a79` (M1 `412297e5`) | **RUNNING milestone 2** | doubled ring layer upper-left at 20 u; mirrored diamond in the near water at 3 u; rings / pink-blue water / bubbles / foam walls consistent while moving; picture coins vs painted spots (probe like `tools/match08/coinprobe08.mjs`); 07→08 drop intact; fal plate NOT run. |
| 04 | `session_01Q46SCGVVo94Weug9VM7yDG` | `claude/rainbow-s04-match-c3` @ `d1e422fa` (M3 `a4644789`) | paused (milestone 3 done) | M4: hard straight water/tunnel-wall edge near the camera at 15–20 u; gentle water flow along the painted streaks; hide the ~4.7 u swirl-tile repeat; coins at the painted spots (perspective 7–55 px). |
| 05 | `session_01Q46SCKjcx6k2Jb2JrspXSJ` | `claude/rainbow-s05-match-c3` @ `15a9d9fb` (M2 `a96bfdf4`) | paused (milestone 2 done) | M3: faint cyan rings around coins (hole fill); dimmer bubble at the right wall; gold frame bevel / lower-left frame outline; wake water between the filaments; coin edge look (shared `coins.ts` — lead approval). Line B: never merge with line A. |
| 06 | `session_01Q46SCL2DLgtfbmDySmRvhY` | `claude/rainbow-s06-match-c3` @ `c088718b` (M1 `b993f6d5`) | paused (milestone 1 done) | retry the APK (`VITE_RAINBOW_Q05="match06=1" npm run android:debug`, Maven 429 earlier); M2: visible floor-tile repetition (soft chevrons), tile-only river from ~10 u, far trail coins facing the approved camera, camclear + match06 together. |
| 08 coins (lead) | this session | `ccr-c0235034-ks6sx3` (`2f87fa69`) | done, under review | `?match08=1&coins08px=1` — waits for the user's verdict. |

Waiting for the user: keep `coins08px`? Benny r3b vs round 2? fal clean plates for 06 / 07 (one paid edit each, prepared,
not run)? Which paused screens to resume?

To resume a paused workstream: `send_message` to its session (same account), or — on a NEW account — create a session
from its `-c3` tip with a NEW `-c4` branch (never write to `-c3` from two accounts), brief = this file + the screen's
`docs/briefs/2026-11-17-r3/S0x.md` + its own STATUS/NOTES.
