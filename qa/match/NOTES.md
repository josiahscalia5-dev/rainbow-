# Match every gameplay screen to its approved picture (started 2026-11-17)

User order (2026-11-17): match Screens 02, 03, 04, 06, 07, 08, 09, 10 to their own approved pictures
(`references/NN_*.png`), at least 9/10 each, real playable 3D, continuous story; do NOT rebuild the opening / ending
videos (01, 11) and do NOT rebuild Screen 05 (its work stays as is; `?match05=1` = all its switches). Order: audit all
eight, then 04 and 06 (they touch 05), then 02, 03, 07, 08, 09, 10; batches, commit as you go.

## Rules for everyone working on this
* One switch per screen: `?matchNN=1` (`src/game/match.ts`; `?matchall=1` = all). With no switch the game is
  byte-for-byte the default build — verify with a pixel comparison after every change (0 differing pixels on the
  default captures and on `?ringa=26&nearfloor05=0` vs `qa/pilot05/wave9/baseline/05.png`).
* Screen 05 is finished work: never edit its switches' behaviour, its textures (`assets/textures/water05/`,
  `assets/textures/tunnel05/`, `assets/models/lids05.glb`) or `src/vfx/proj05Tunnel.ts`.
* Never paste the approved image over the screen. Projection / baking onto real 3D geometry is allowed (the user
  allowed it explicitly) when the scene still works while moving.
* Each screen: approved | BEFORE | NEW as separate full-size captures (`node scripts/capture.mjs NN --q=matchNN=1`),
  `python3 -I tools/qa/screen_match.py <approved> <capture>` numbers AND an honest visual score, moving frames
  (`node scripts/proj05-move.mjs --q=... --d=...` works on any stage's checkpoint with `--id`… see below),
  `node scripts/gameplay-test.mjs --q=matchNN=1 --out=qa/match/NN/tests/gameplay.json` 8/8, continuity at both joins.
* Camera framing per screen: `MATCH_CAM` in `src/game/match.ts` (one line per screen), tried with
  `node scripts/match-cam-try.mjs --id=NN --cands='[...]'` (no source change needed for trying).

## File ownership while workers run in parallel
| Owner | Files |
|---|---|
| main session | `src/game/match.ts` (shared table — others add ONE line for their screen), `src/vfx/matchProj.ts` (generic projector), `scripts/match-*.mjs`, `tools/match/`, `tools/qa/screen_match.py`, Screen 07 |
| path-camera-transition-engineer (worktree) | Screen 06 structure: `src/world/course.ts` (06 section, behind `match06`), the 06 part of `src/world/environment.ts` (behind `match06`), its `MATCH_CAM['06']` line, `qa/match/06/` |

## Audit 2026-11-17 (default build, real captures at each checkpoint, `qa/match/audit/`)
Numbers: `tools/qa/screen_match.py` — FULL (all pixels), LAYOUT (both blurred σ 8 px: composition + colour).
Visual score = honest judgement of how close the screen looks to the approved picture (not derived from the numbers).

| Screen | approved shows | game shows now | FULL mean / ≤20 | LAYOUT ≤20 | visual |
|---|---|---|---|---|---|
| 02 tumbles | Benny with spiral eyes tumbling in a pink/cyan whirlpool, sock + star shirt floating, porthole above, purple towel | extreme close-up of Benny's face in a rainbow ring | 75.1 / 5.0 % | 5.9 % | 2/10 |
| 03 twirl | happy Benny left, coins spiralling into a whirlpool tunnel, porthole + laundry room above, framed | orange tubes, pink/white water, small Benny | 68.0 / 8.8 % | 6.9 % | 1.5/10 |
| 04 arrows | river with 5 white chevrons into a gold-ringed tunnel mouth, coins left, laundry room above | orange tube arcs, white foam wall, Benny far away | 74.0 / 6.4 % | 4.7 % | 2/10 |
| 06 arch | purple perforated tunnel + gold rings (like 05), S-river into the tunnel, ripples round Benny | low camera looking up at the slotted "arch hall" ribs | 81.6 / 5.0 % | 5.9 % | 2.5/10 |
| 07 tube | purple tunnel, gold rings to a bright end, paddles, S-river | purple tunnel with gold rings, tall white foam walls, close big Benny | 74.3 / 6.7 % | 8.5 % | 3.5/10 |
| 08 chamber | gold-ringed tunnel ending at a porthole with a towel on a round table, waterfalls | pink room, porthole top-left, foam walls | 84.2 / 4.0 % | 2.2 % | 2/10 |
| 09 wave | S-river to a porthole with a laundry room, towel on a platform, waterfalls | porthole with the girl, big pink/white wave | 78.3 / 7.3 % | 7.0 % | 2.5/10 |
| 10 hiding | porthole with the girl, big purple knitted towel over a platform, river into it | porthole with the girl, purple arch, foam walls | 79.6 / 7.4 % | 7.2 % | 2.5/10 |

Findings that decide the order of work:
* Camera framing alone cannot fix 04 or 06: their GEOMETRY differs from the approved pictures (04 = orange tube
  structure vs a gold-ringed tunnel mouth under the laundry room; 06 = the flared "arch hall" where the river climbs the
  wall vs the 05-style perforated tunnel). Both need the environment (and for 06 the river path) rebuilt.
* 07 already has the approved structure (purple perforated tunnel, gold rings, paddles): camera framing
  (`MATCH_CAM['07']`) + the generic projector + foam walls lowered should give the fastest real gain.
* 06–10 approved pictures share Screen 05's scenery (purple perforated tunnel, gold rings, paddles, cyan/pink S-river),
  so the 05 tools (projection bakes, Blender trays, sharp water tile) apply to them legitimately.
* Opening / ending videos: NOT in the repository (`public/video/` holds only `PUT_FLOW_VIDEOS_HERE.txt`). The game is
  already wired for them (docs/FLOW_VIDEO.md): `public/video/intro.mp4` plays at launch and hands over to the real-time
  02 → 03; `public/video/ending.mp4` plays before the 11 frame. Upload the two files there (or send them) — no code
  change needed; until then the real-time 3D 01 / 11 cinematics play.
