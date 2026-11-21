# All screens — APPROVED vs NOW (lead account 5, 2026-11-17 ~21:00 UTC)

Video: `rainbow_all_screens_APPROVED_vs_NOW.mp4` (84 s, 540x1040, 30 fps). For each screen: the approved picture (3 s),
then the game NOW from the approved camera checkpoint (frame-exact recorder `tools/lead_r4/rec_tour.mjs`, assembly
`tools/lead_r4/assemble_tour.py`). 04–08 clips are trimmed to their own screen (a single-screen branch shows the next
screen in its old default look). Each version = the newest FINISHED saved checkpoint (read-only worktrees, nothing merged):
| Screen | Shown version | Commit |
|---|---|---|
| 01 02 03 09 10 11 | default game = temporary 3D stand-ins (the user's Google Flow videos replace them) | lead `ccr-f983b317-2vt0zh` |
| 04 | `?match04=1` (M3) | `claude/rainbow-s04-match-c5` @ `d1e422fa` |
| 05 | `?match05=1&tgtvis05=1&tgtfill05=3&tgtwall05=1` (M2, line B) | `claude/rainbow-s05-match-c5` @ `ebaf6cac` |
| 06 | `?match06=1` (M1) | `claude/rainbow-s06-match-c5` @ `c088718b` |
| 07 | `?match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1` (M2) | `claude/rainbow-s07-match-c5` @ `835a72db` |
| 08 | `?match08=1` = Benny r5b (old coin trail; the preferred `coins08px` is on the lead line only) | `claude/rainbow-s08-benny08-bake-c5` @ `fb72cc50` |

## Numbers at the approved camera view (`tools/qa/screen_match.py`, share of pixels within 20 colour levels)
| Screen | NORMAL game (default) | NEWEST test version: whole frame | below HUD | overall look (blurred) | whole if the HUD matched (upper bound) |
|---|---|---|---|---|---|
| 01 / 02 / 03 | 7.4 / 5.0 / 8.8 % | — (Flow video) | | | |
| 04 | 6.4 % | **81.8 %** | 89.5 % | 90.7 % | 90.8 % |
| 05 | 18.5 % | **89.4 %** | 91.6 % | 95.9 % | 92.7 % |
| 06 | 5.0 % | **79.1 %** | 85.6 % | 86.2 % | 87.4 % |
| 07 | 6.7 % | **80.1 %** | 86.7 % | 87.8 % | 88.4 % |
| 08 | 4.0 % | **85.0 %** | 92.0 % | 94.1 % | 93.1 % |
| 09 / 10 / 11 | 7.3 / 7.4 / 4.9 % | — (Flow video) | | | |
Scenery alone (specialists' masks): 04 98.2 %, 05 93.7 %, 06 98.8 %, 07 95.5 %, 08 97.3 %.

## Where the missing points are (visual review of approved | now | difference map)
1. **HUD** (top bar + title pill): 31–54 % of all mismatched pixels. The approved HUD is the same on 05–08 (04 slightly
   different); the game's HUD is smaller and placed differently. Screen 05's line-B `hud05` already matches it.
2. **Benny**: 04–07 still use the OLDER Benny (flat-striped beanie, smooth pom, different body; on 06/07 too large and
   too far right). The newer Benny work (knit beanie, ribbed cuff, fuller body) exists only on Screen 08 (Benny branch)
   and Screen 05 line B (`benny05`). Benny area: 04 ≈25 %, 06 ≈55 %, 07 ≈16 %, 08 ≈62 %.
3. **Coins**: sizes / positions differ from the painted coins on 04, 06, 07 (08's preferred `coins08px` fixes 08).
4. **While moving** (the user's #1 rule): the matched look holds only near the approved camera spot. After ~2–3 s of
   riding, 05 and 07 fall back to the plain original 3D world, 06 becomes a repeating water tile, 08 shows the lower-left
   tear. 04 and 08 have only ~2.7 s / ~1.3 s of ride left in their screen after the approved view.
5. The NORMAL game shows none of this work yet (4–19 %): every match version is a test switch awaiting the user's approval.
