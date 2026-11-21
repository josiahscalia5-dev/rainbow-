# Round 9 (account 9) — coordination of the five playable screens (VISUALS ONLY)

Started 2026-11-18 ~02:37 UTC. User order (2026-11-18, account 9): restore account 8 exactly, keep every kept step,
continue all five playable screens 04–08 toward their OWN approved pictures (≥ 8.5/10, ideally 9–9.5) WHILE BENNY SWIMS.
Small steps: each genuine improvement → APPROVED / BEFORE / NEW full-size pictures + what looks better, at once.
Max TWO specialists at a time; rotation 07 → 08 → 06. No paid jobs without approval. No work on 01–03 / 09–11.
Rules for specialists: `docs/briefs/2026-11-18-r8/COMMON_RULES.md` (read "-c8" as "-c9").

## Lead
Session branch `claude/rainbow-restore-c9-40w64b` (this cloud session), contains the newest account-8 lead
`claude/rainbow-lead-c8` @ `dd32bbfd` (merged with the user's order "fetch the newest remote commit before starting";
only autosave/backup files and the 04 review folder differed). All `-c8` branches + `ccr-58dd182e-m48xwk` are now
protected (never written by round 9).

## Workstream map (newest remote tips fetched 2026-11-18 ~02:40 UTC)
| Screen | Round-9 branch | Started at (= newest -c8 tip) | State |
|---|---|---|---|
| 04 | `claude/rainbow-s04-match-c9` | `d217f5466b82626aaa3d83e2b4a44a74cfa4b258` (r8 step 3: foam clumps; steps 1 m04ring, 2 m04river/foam/bub) | **RUNNING** slot A (`washer-environment-modeler`, worktree `/home/user/wt/s04`), log `qa/match/04/r9/PROGRESS.md` |
| 05 | `claude/rainbow-s05-match-c9` | `c676a7c526604fdf7cab5212fb2408b3194d584b` (r8 step 4 m05seam; steps 1–3 m05coin/m05ride/m05edge; r7 m05far) | **RUNNING** slot B (`water-fx-specialist`, worktree `/home/user/wt/s05`), log `qa/match/05/r9/PROGRESS.md` |
| 07 | `claude/rainbow-s07-match-c9` | `dbc7678cd067f7d16e0f30ef6a5d26310043991c` (m07tube + m07ring plunge fix; WIP m07foam + m07coinsz) | READY — next slot, brief `docs/briefs/2026-11-18-r8/S07.md` |
| 08 scenery | `claude/rainbow-s08-scenery-c9` | `c0d8c97b514fe2e93b42eb73950f841c9d6beb3d` (r7 m08seam/m08sill/m08towel + unfinished r8 edits) | READY — after 07, brief `docs/briefs/2026-11-18-r8/S08.md` |
| 06 | `claude/rainbow-s06-match-c9` | `efaf78b7d6549da63276d386884ca09e038a1e86` (m06ring real gold rings, bubbles, foam, splash) | READY — after 08, brief `docs/briefs/2026-11-18-r8/S06.md` |
Preserved, never written: 08 Benny `claude/rainbow-s08-benny08-bake-c5` @ 3133a3ad, 08 camera `-c5` @ 18687513, preview
`claude/rainbow-preview-all-c6` @ 41ea6618, every `-c8` / `-c7` / older branch, `codex/*`.

## Specialist start (verified)
Both specialists acknowledged in-session at ~02:44 UTC ("S04 r9 started … next: gold washer opening + glowing bulb row
`&m04bulbs=1`"; "S05 r9 started … next: near/far seam line at t66"). The lead watches both worktrees' HEADs.
TRAP (from round 8): interrupting the lead's turn can cancel the background specialists — if a specialist stops, commit
its worktree as WIP and relaunch it from its PROGRESS.md / STATUS.md.

## Services verified at start (free reads only, ~02:42–02:46 UTC)
* World Labs key on this environment = the **5,420-credit account** (the ORIGINAL Screen 08 account): Screen 08 world
  `32b5b2f4…` → 200; Screen 05 pilot worlds `5fd3d7a7…` → 404 with this key (their files are complete in Git LFS).
  Atlas connector: `list_projects` OK (1 project, credits available). Not needed for visual work.
* fal.ai = the same purchased account: request `01a1ea70…` → COMPLETED; bogus id → 404 (key accepted). The paid 04 plate
  is in the repo (`qa/match/04/fal/`). fal output CDN hosts `v3b.fal.media` / `v3.fal.media` are BLOCKED by this
  environment's network policy (only matters for a NEW paid job's download).
* Git LFS 59/59 local + on GitHub; 13/13 references byte-identical; 10/10 agent definitions = MANIFEST SHA-256.
* Playwright MCP: live WebGL2 test OK (SwiftShader). Blender 5.3.0 headless OK; Android SDK 34; Node 22; Python QA libs;
  tsc + continuity OK (bootstrap). Image-Blaster rebuilt at `/home/user/neilsonnn/image-blaster` (4acb43b, no paid call).
  context7 MCP failed to connect (optional); Parallax Three.js not attached to this account (optional).

## Update ~03:10 UTC — user order "reconstruct the actual approved designs" (`USER_ORDER_STRUCTURAL.md`)
* Both builders stopped polishing, saved WIP (04 `b4bd3da4`: m04foam3/m04pink/m04arr5 candidates NOT kept; 05 `1eb23e66`:
  m05near tried/not kept, m05wall unfinished) and now do BLUEPRINT → FOUNDATION: 04 `&m04lay=1` (forced-perspective washer
  front, rings = short painted funnel), 05 `&m05geo=1` (river/bank/wall geometry fitted to the painted S).
* Kept before the order (shown to the user): 04 r9 step 1 `m04mouth` (e85a66c2), step 2 `m04room` (d5d4eee3); 05 r9 step 1
  `m05blend` (965b8b86).
* Independent reviewer (reference-match-director) started: blueprints + structural audit for 06/07/08, then reviews every
  04/05 foundation step before it is shown. Worktrees /home/user/wt/s06, s07, s08 created (read-only for the reviewer).

## Update ~03:28 UTC — reviewer blueprints 06/07/08 done (`BLUEPRINT_0{6,7,8}.md` + overlays, `REVIEW_SUMMARY.md`)
Reviewer (judgement, not measurements): 08 approved ≈ 8.5 / swimming ≈ 7, ceiling 8–8.5 FREE (#1: keep the foreground gold
arch framing the scene for the whole 13 u stage — as REAL static geometry under the user's real-3D rule, not a per-frame
recede). 07 ≈ 8 / ≈ 4.5; 68 % of the stage (s 310 → 389) is a vertical plunge the painting never shows → ceiling ≈ 7.5–8
level stretch, 6–6.5 plunge unless the user permits a plunge/movement change. 06 ≈ 8 / ≈ 4.5; from ~6 u the camera looks
straight down a centred ring bullseye, painted bent tunnel + S-loop river + paddle wall gone; ceiling ≈ 6.5–7 unless the
course rides the painted loop (movement change = user's call). Lead proposal to the user: next free slot → 08 (reachable
for free) while the user decides on 07 / 06 movement; reviewer stopped (two builders running).
