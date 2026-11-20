# Round 22 — Screen 04 MULTI-PLATE PROJECTION of the user-approved generated views (in-process `washer-environment-modeler`)

## User decision (verbatim, 2026-11-20 ~03:42 UTC)
"Yes, approve the Screen 04 proposals, keep going". Record: `qa/review_r21/artwork/04/USER_VERDICT.md`. Goal (binding,
`docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md` + round 21): Screen 04 must look like the approved picture WHILE Benny swims —
start, middle, late, end, hard left / right. The user's original `references/04_through_the_five_arrows.png` stays the master
(never written). The three ACCEPTED GENERATED views extend it deeper into the tunnel:

| View | Accepted plate | Exact game camera it was painted over |
|---|---|---|
| middle | `qa/review_r21/artwork/04/accepted/04_gen_c_middle_p2_v1.png` | audit shot `c_middle`: frac 0.35, s = 90.48 u, lat 0, no steer |
| late | `qa/review_r21/artwork/04/accepted/04_gen_d_late_p3_v1.png` | `d_late`: frac 0.60, s = 99.813 u |
| end | `qa/review_r21/artwork/04/accepted/04_gen_e_end_p2_v1.png` | `e_end`: frac 0.85, s = 109.146 u |
Structure frames (what the game showed from those cameras, query V4 = `qa/review_r21/audit/QUERY_04.txt`):
`qa/review_r21/artwork/04/game_frames/{c_middle,d_late,e_end}.png`. Plates are 1536 × 2752 (9:16) = the 864 × 1536 frames ×1.78.

## Where you work
* Worktree `/home/user/wt/s04`, LOCAL branch `claude/rainbow-s04-match-c23` (= `34cb4941` + r21 code incl. `m04wgl` + whatever the
  r22 foam specialist kept — read `/home/user/rainbow-/qa/match/04/r22/PROGRESS.md` first). Do NOT commit / push; never run git in
  `/home/user/rainbow-`; never touch `/home/user/wt/s07`. Port 5273. The lead's autosave snapshots your edits.
* Proof / logs: `/home/user/rainbow-/qa/match/04/r22_proj/<step>/`, `/home/user/rainbow-/qa/match/04/r22_proj/PROGRESS.md` (top block
  "(r22) WHERE I STOPPED / NEXT", updated after every step). Per kept step: `git -C /home/user/wt/s04 diff > …/<step>/code.patch`.
* Copy the plates into the worktree (e.g. `assets/textures/match04/gen/`), downscaled for mobile (≤ 1080 × 1920, keep 9:16).
* No paid jobs, never print secrets, never reinstall tools, never `playwright install`.

## Method (one URL switch `&m04mp=1`, default build unchanged)
`src/world/match04m4.ts` already projects the ORIGINAL picture from the approved start camera (`uProjVP`, `uProjPos`, `uPlate`, depth
bake, `PROJ05_INVERSE`). Add three more projectors — one per accepted plate — each with:
1. its camera = the game's own camera at that shot. Reproduce it EXACTLY (same query, s, lat, steer, settle time as
   `tools/lead21/audit_screen.mjs`) and record view/projection matrices; verify by rendering the structure frame and comparing with
   `game_frames/<shot>.png` (should be pixel-identical or nearly).
2. its own depth bake (occlusion) so a plate only paints surfaces it actually saw;
3. a blend weight by the CAMERA's route position s: original plate dominant at the start, then middle → late → end, smooth
   cross-fades (no pops), plus per-fragment visibility / facing falloff; where no plate covers a fragment keep today's material.
World-anchored (fixed projector cameras), so nothing slides when Benny steers; only geometry mismatch gives parallax — check hard left /
right. Apply it to ENVIRONMENT meshes only (walls, rings, mouth, foam banks, river surface) — never Benny, coins, HUD.
**Doubles:** the plates contain painted chevrons, bubbles and light flares. The game also draws real 3D chevrons and bubbles → mask the
painted chevrons / big bubbles out of the plates (per-plate masks; inpaint from neighbours) before projecting, or exclude those regions.
Suggested order: (A) walls + rings + foam banks first (today's biggest differences: hazy pink blur inside, foam banks vanish), (B) the
river surface with the chevrons masked, keeping the flowing-water motion of the existing shader (blend, do not freeze it).

## Proof (every finished step)
Deterministic shots `AUDIT_PORT=5273 node /home/user/rainbow-/tools/lead21/audit_screen.mjs <out> 04 "<query>"` for BEFORE (the current
candidate set, see the r22 foam PROGRESS) and NEW (+ `&m04mp=1`), plus `AUDIT_SHOTS` at the three plate positions and half-way
between them (e.g. 0.47, 0.72). Separate full-size pictures; APPROVED = the original for the start, the ACCEPTED GENERATED view
(label it so) for middle / late / end. Start view 0 px (`/home/user/tools-pixelmatch/pixeldiff.mjs … 0.1 180 1536`). Uninterrupted
swim clip through all of 04 (straight / left / right) BEFORE + NEW → mp4 (`tools/lead_r13/swim_clip.mjs`). Gameplay
`node scripts/gameplay-test.mjs --q="<query>"` → 8/8, 91 coins, 1,330 → 2,240. Mobile cost: note texture memory + frame time.
3–5 line verdict in plain visual words: GOOD IMPROVEMENT / NOT AN IMPROVEMENT / NOT YET PROVEN. No colour-percentage proof.

## Reporting
Up to 3 finished steps, then stop. Final message to the lead: each step + switch + verdict + folders + clip paths, the new candidate
query, mobile cost, the single most visible remaining difference.

## Hand-over from the r22 foam specialist (~03:50 UTC) — read before you start
* BEFORE for your proofs = **K22-2** = `cat /home/user/rainbow-/qa/match/04/r22/s2_bbd/QUERY_K22-2.txt` (K21-1 + 3D foam heaps
  `m04bbd…&m04bbx=1`; lead verdict: small improvement, patchy / sometimes one-sided, smaller than the painted banks).
* **Use the pinned-clock tools** (the river shader reads `performance.now()`, so the water differs run to run otherwise):
  `qa/match/04/r22/tools/audit_pinned.mjs` (same arguments as `audit_screen.mjs`), pinned swim clip + gameplay test on port 5273 in
  the same folder. Two runs of the pinned audit = 0 px.
* Doubles to avoid: the plates' painted foam banks vs the 3D foam heaps (`m04bbd`) — decide which reads closer by eye where they
  overlap (e.g. project painted foam on the bank geometry and keep 3D heaps only where no plate covers, or the reverse); never both
  stacked.
* Unfinished, unrelated: `qa/match/04/r22/s3_unfinished/m04a3sc_unfinished.patch` (chevrons straddle Benny's hat; off by default).
  Leave it alone unless the projection makes it worse.
