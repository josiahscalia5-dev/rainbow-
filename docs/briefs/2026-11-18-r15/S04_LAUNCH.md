# Round 15 (account 15) — Screen 04 worker launch prompt (lead-directed; agent foam-bubbles-particles)

You are the Rainbow project's `foam-bubbles-particles` specialist, working for the LEAD on playable Screen 04 "Through the Five Arrows",
VISUALS ONLY. (Account 14's lead ran 04 itself and ran out of usage at ~17:46 UTC; you continue on a NEW branch. Nothing was lost.)

## Where you work
* Git worktree `/home/user/wt/s04` on branch `claude/rainbow-s04-match-c15` (created from `claude/rainbow-s04-match-c14` @ `fc28323a`,
  the newest account-14 tip; no unfinished edits were left). `node_modules` is a symlink to the lead checkout.
* Commit and `git push -u origin claude/rainbow-s04-match-c15` after every step (kept or rejected). Push ONLY that branch. Never
  force-push, rebase, reset, merge, or write any other branch (every `-c14` / `-c13` / older branch is protected).
* Captures: `node tools/lead_r6/motion_audit.mjs 04 <outDir> "<query>"` (12 frames: a00 approved view, f03/f06/f10/f20 forward,
  t33/t66/t95 through the screen, hard / soft left + right) — its a00 is NOT deterministic (bubbles / shader clock), so check the
  start view with `node scripts/capture.mjs 04 --q=<query>` (must stay unchanged in the scenery). Swimming clip:
  `node tools/lead_r13/swim_clip.mjs 04 <out.mp4> 3.6 "<query>"`. Screen 05 uses port 5275 and Screen 08 port 5278 — if a tool
  takes a port, use 5273/5274. Never commit or print secrets. No paid jobs. Do not reinstall tools.

## Binding rules — read FIRST
`docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md` (BINDING, user-approved), `docs/briefs/2026-11-18-r11/USER_ORDER_R11_STRICT.md`,
`docs/briefs/2026-11-18-r10/RULES_R10.md`, `docs/briefs/2026-11-18-r8/COMMON_RULES.md` (read older round numbers as r15 / -c15).
`references/04_through_the_five_arrows.png` is the BLUEPRINT: pink laundry-room opening (porthole window, control panel with shirt icon,
striped towels, gold washer rim, big bubbles), then a deep telescoping tunnel of FEW, THICK, rounded, polished yellow-gold rings with
light dots and pink-purple reflections; a thick glossy cyan river with magenta / pink swirls curving up the sides; FIVE glowing
white-cyan chevrons down the lane AHEAD of Benny (clearly visible, never overlapping him); gold coins to the left of the lane; soft LOW
foam = clusters of many small shiny lilac-white bubbles round the entrance and along the water edges; iridescent bubbles; a bright
glowing distant opening. Entrance and deeper tunnel must read as ONE continuous environment while Benny swims (start, forward
3/6/10/20 u, middle, end, hard left / right). No redesign, no generic orange ring corridor, no giant foam walls, no stretching / tearing.
Never change Benny, coins logic (91 coins / score continuity), physics, input, HUD, camera framing at the approved view, or other
screens. Every change is a URL switch (`&m04xxx=1`); the default build stays unchanged. Keep ONLY what clearly looks closer by eye.
Do NOT undo kept steps (luminous arrows G5, entrance-rim foam L4, rings, river, bubbles) to fix a small detail.

## Resume, do not repeat
Read `qa/match/04/r14/PROGRESS.md` (steps 6 G5 arrows KEPT, 7 deeper-blue lane REJECTED, 8 pink side re-colour REJECTED — the painted
satin bands are not in the tile at the lateral positions the side banks sample, so a re-colour cannot work —, 9 L4 entrance foam KEPT)
and `qa/match/04/r13/PROGRESS.md`, `git log -15`. Log everything in `qa/match/04/r15/PROGRESS.md`.
Kept set now (= r14 L4):
`match04=1&m04ring=1&m04river=1&m04bub=1&m04mouth=1&m04room=1&m04ry=0.8&m04rk=0.82&m04arr3d=1&m04a3k=66&m04a3w2=1&m04a3g=1.6&m04a3o=0.38&m04a3b=1&m04a3b0=3.0&m04a3b1=4.4&m04a3f0=25&m04a3f1=31&m04a3p=4.0&m04a3w=1.15&m04a3t=0.32&m04a3d=0.55&m04a3f=4&m04a3y=0.1&m04ringp=4.6&m04ringgw=1.2&m04tb=0.2&m04ts=0.22&m04paint=0.9&m04pink=1&m04pkl=2.15&m04pkw=0.9&m04a3hb=1&m04xf=2.6&m04lane=1&m04lanew=2.3&m04lanes=0.85&m04a3co=1.0&m04lane2=0.55&m04lgl=1.3&m04lsp=0.9&m04copper=1.3&m04edge=1&m04rf0=1.25&m04rf1=0.8&m04lbr=0.14&m04a3tex=1&m04bulge=0.18&m04lcd=1.0&m04lcw=1.7&m04a3fa=1.0&m04a3gb=0.16&m04a3tm=0.45&m04a3lum=1.1&m04a3rw=0.03&m04foam=1&m04foamr=2.5&m04foamn0=4.5&m04foamn1=6.5`

## Your tasks (in order; biggest visible difference first)
1. FOAM LOOK (`src/world/match04m4.ts`, the m04foam puffs): the kept entrance foam reads as big smooth white balls. Make it the painted
   foam: soft clusters of MANY small shiny bubbles (lilac-white, small highlights, slightly see-through edges, varied sizes, low heaps),
   world-anchored and still while Benny swims; no pale puff across the bottom-left corner at hard left. New switch, e.g. `&m04fclu=1`.
2. INTERIOR RINGS (environment work; read `references/04_…png` closely first): forward 3 u onward shows MANY thin gold rings with dark
   gaps (a generic ring corridor) whereas the painted tunnel is a telescoping series of FEW, THICK, rounded, polished rings — yellow-gold
   with pink-purple reflections and light dots — continuing the entrance rim. BEFORE changing geometry, measure in the approved picture
   the ring count, the ratio of band thickness to gap, and the radius step per ring; compare with the game at the approved view and at
   forward 3 / 6 / 10 u (is the mismatch spacing, thickness, flat shading, or field of view?). Fix the cause with a new switch
   (e.g. `&m04thick=1`), keeping the approved start view unchanged.
3. PINK-MAGENTA SWIRLS on the side water (r14 step 8 showed a re-colour cannot work): sample the painted band region of the approved
   picture (the swirl bands curving up the sides) for the side banks, world-anchored, no stretching while steering.
4. Then the next biggest visible difference you find (gold too orange / flat, distant glowing opening, arrows overlapping Benny at f03).

## Proof for every finished step (the user only accepts pictures from the REAL playable game)
Separate full-size portrait renders (no collages) under `qa/match/04/r15/<step>/`: APPROVED (`references/04_through_the_five_arrows.png`),
BEFORE (kept set without this step), NEW (with it) — all motion_audit frames (approaching / start, entering f03, middle f06–f10, farther
inside f20 / t33, t66, end t95, hard left, hard right) + a swimming clip when the change shows in motion. 3–5 line verdict in plain visual
words with GOOD IMPROVEMENT / NOT AN IMPROVEMENT / NOT YET PROVEN. No colour-percentage claims as proof.

## Reporting
After each finished step: commit + push, then SendMessage to "main" with: step name + URL switch, commit SHA, verdict, the folder of the
NEW pictures, and the single most visible remaining difference. Keep it short. Then continue with the next task without waiting. If
blocked, tell "main" and continue with the next task. Keep working through the task list until you run out of tasks or are stopped.
