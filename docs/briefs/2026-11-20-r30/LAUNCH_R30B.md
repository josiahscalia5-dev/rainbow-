# Round 30b — relaunch of the Screen 06 specialists (lead session `ccr-e490fceb-u85291`, from ~22:25 UTC)

Why: the r30 session (`ccr-2644c3c0-iikckn`) closed at ~22:14 UTC, ~10 min after launching four specialists (`LAUNCH_R30_PARALLEL.md`). Its last save
`b9ca06c` was merged here (`34786f3`, the user: "Continue from the latest saved version"). Worktrees recreated from the 22:14 snapshots with
`setup_r30b.sh` on LOCAL `-c32` branches (s06 candidate + benny06 / water06 / foam06 / scen06).

**Binding target (user, re-sent ~22:20 UTC in this session; verbatim `USER_R30.md` §6, picture `USER_S06_FOUR_VIEWS_TARGET_R30.jpg`): the FOUR
storyboard panels (`USER_S06_STORYBOARD_R30.png`, boxes x0,y0,x1,y1: (16,100,506,724) (520,100,1010,724) (16,790,506,1398) (520,790,1010,1398))
are ALL MANDATORY approved targets**, plus the approved Screen 06 picture `references/06_crest_the_rinse_arch.png`. Judge in motion.

## Split
| who | worktree / LOCAL branch | prefix | ports | task (user's §4 words) |
|---|---|---|---|---|
| lead | /home/user/wt/s06 `claude/rainbow-s06-match-c32` | `m06sb*` | 5360–5369 | route, camera framing per panel, tunnel + gold bands + wall perforations, far end (pale peach disc = 07's far glow), 07 join; takes over scen06's `e30scen06.ts` |
| benny06 | /home/user/wt/benny06 `claude/rainbow-s06-benny06-c32` | `b30` | 5320–5329 | "rounded pink furry body, small arms, purple-and-white knitted beanie, fluffy purple pom-pom, and yellow star … proportions, materials, contact with the water" |
| water06 | /home/user/wt/water06 `claude/rainbow-s06-water06-c32` | `w30` | 5330–5339 | "bright cyan-blue center, vivid pink and rainbow edges, flowing curves, reflective highlights, sense of volume. Correct the long scratch-like streaks and stretched appearance" |
| foam06 | /home/user/wt/foam06 `claude/rainbow-s06-foam06-c32` | `f30` | 5340–5349 | "soft, varied clusters along the water, with the approved bubble detail. Correct the thick rows of separate bead-like balls and oversized foam walls" |

Common rules = `LAUNCH_R30_PARALLEL.md` (edit only your worktree, never push / commit / merge, everything behind your switch, start view unchanged,
renders only through `tools/lead25/render_slot.sh`, no paid jobs, tsc clean, outputs + NOTES.md in `qa/match/06/r30/<x>/`) with `-c32` instead of `-c31`.
Standard shot positions for the four panels: river s 238, 266, 310, 387 (+ start 0, marked 214.86). Each specialist's r30 conversation (what it already
did) is saved in `backups/claude-sessions/2861ab18-7c8b-528d-aa72-c51b8f64525c/subagents/` (benny `agent-a548…`, water `agent-a080…`, foam `agent-a135…`,
scenery `agent-ad7c…`). If this session stops: rerun `setup_r30b.sh` pattern from the newest `backups/wip/*-c32/` (bump to -c33) and relaunch with this brief.
