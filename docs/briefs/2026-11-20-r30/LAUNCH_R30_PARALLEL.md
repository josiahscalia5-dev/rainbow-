# Round 30 — four parallel Screen 06 specialists (lead `ccr-2644c3c0-iikckn`, launched ~22:05 UTC, user: "do multiple agents do different tasks at the same time")

User goal (verbatim, `USER_R30.md` §5): "I just want it to look exactly like exactly 100% or very close to my approved screen ... The background,
the pink character and the rainbow water thing he goes on, the slides it goes on". Visual references, binding:
`references/06_crest_the_rinse_arch.png` (approved, 864×1536) and the storyboard `docs/briefs/2026-11-20-r30/USER_S06_STORYBOARD_R30.png`
(panel boxes x0,y0,x1,y1: (16,100,506,724) (520,100,1010,724) (16,790,506,1398) (520,790,1010,1398)). Judge WHILE Benny swims, not only the start.

## Common rules (every worker)
* Your worktree `/home/user/wt/<x>` on LOCAL branch `claude/rainbow-s06-<x>-c31` = the current Screen 06 v2 candidate. Edit ONLY there. Never
  push, never commit to another branch, never merge, never rewrite history, never touch another worktree or `/home/user/rainbow-/src`.
  Leave your edits uncommitted (the five-minute autosave snapshots them to `backups/wip/`).
* Every change behind YOUR new URL switch (prefix below); with it off, the game and every existing query are byte-for-byte unchanged.
* BEFORE query = `qa/match/06/r30/QUERY_NEW_v2.txt` (read it from `/home/user/rainbow-`). NEW = BEFORE + your switch(es).
* The approved START view (river s 198.91) must stay as it is (it is the approved picture projected; ≥ 99.8 % of pixels unchanged).
* Renders ONLY through the slot lock: `cd /home/user/wt/<x> && AUDIT_W=864 AUDIT_H=1536 AUDIT_PORT=<port> AUDIT_SHOTS='[["b_marked",214.86,null],…]'
  bash /home/user/rainbow-/tools/lead25/render_slot.sh node tools/match06/r30_shots.mjs <outDir> 06 "<query>"` (a shot value > 1 = absolute
  river s; standard positions: start 0, marked 214.86, 238, 266, 310, 350, 387; use AUDIT_W=432 AUDIT_H=768 for quick looks). One page load
  costs ~1 min, each extra shot ~10–20 s: batch shots. Never run several renders at once yourself. No clip renders, no gameplay test (the
  lead runs those on the combined result).
* Typecheck: `npx tsc --noEmit -p .` in your worktree must stay clean.
* No paid jobs (fal, World Labs, Meshy, Rodin, …), no new Marble worlds. Free local tools (Python/PIL/numpy/OpenCV, Blender 5.3 headless) OK.
* Output: `/home/user/rainbow-/qa/match/06/r30/<x>/` — `NOTES.md` (switch, exact query addition, files changed, measured results, honest
  verdict, what still differs), full-size labelled APPROVED | BEFORE | NEW stills at the standard positions (separate pictures + one
  overview sheet). Do not claim likeness percentages you did not measure.
* Time box ~60–90 min; stop at a clean, working checkpoint. Final reply to the lead: ≤ 300 words.

## Workers
| x | agent | prefix | ports | task |
|---|---|---|---|---|
| benny06 | benny-character-artist | `b30` | 5320–5329 | Benny = the painted Benny (proportions, knit hat, dusty-pink plush fur) |
| water06 | water-fx-specialist | `w30` | 5330–5339 | the rainbow water in motion (sparkly veins, rainbow edges, ripples) |
| foam06 | foam-bubbles-particles | `f30` | 5340–5349 | bubbly foam banks + large iridescent floating bubbles + splash ring |
| scen06 | washer-environment-modeler | `e30` | 5350–5359 | broad smooth copper bands, purple drum walls, purple far tunnel (no peach glow) |
Details of each task: the Agent prompts (saved in the lead's chat history, `backups/claude-sessions/`). Recreate the worktrees with
`docs/briefs/2026-11-20-r30/setup_r30_parallel.sh`.
