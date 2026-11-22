# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ NEWEST — ROUND 42 (2026-11-22 ~12:25 UTC, branch `ccr-50ff6f57-q5me82`)
Resume file: **`docs/briefs/2026-11-22-r42/RESUME_R42.md`** (user's newest orders, the 13-image list + gameplay order, what was done, what is NOT
verified yet, next steps). Screen 06: swipe lanes 11/11 real touch, on-screen guard (Benny off-screen 39 → 0 frames), root cause of the gold bars
across the 06 descent fixed (06/07 rings were built with a mirrored basis → `RingOpts.trueFrame`); the full 06 recording after that fix still has
to be re-run. Chat history: `backups/claude-sessions/66fa0664-24cd-5101-b8d0-4255365ce070/`.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ NEWEST — ROUND 41 (2026-11-22 ~11:50 UTC, branch `ccr-50ff6f57-q5me82`)
User's prioritised list (controls -> Benny -> continuous scenery -> likeness -> integration). Done + evidence in `qa/reflock/r40/RESULT_R40.md`
("Round 41"): ONE swipe-lane control in the main game (`src/gameplay/input.ts`, `Game.ts`) and the section, real-touch tested
(`tools/reflock/touch_main.cjs` main game, `TOUCH=1 tools/reflock/section_run.cjs` section); Screen 06 camera + ring passage / occlusion fixes;
Benny's splash no longer covers his body; the Sock Rescue tube continues (no plain room); per-picture HUD + Bubble Blast / Turbo Spin. Open:
Screen 06 tunnel rebuild, seamless (single-scene) hand-over, duplicated "05" title decision, real-device test.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ NEWEST — ROUND 40 (2026-11-22 ~03:45 UTC, branch `ccr-50ff6f57-q5me82`)
User's orders verbatim: **`docs/briefs/2026-11-22-r40/USER_R40.md`** (real connected 3D scenery, no pictures / projections / forced perspective;
the user's two pictures `references/candidates/bonus_bubble_dash_chamber.webp` + `bonus_sock_rescue_laundry_tunnel.webp` as blueprints; Blender;
recordings; Android build; integrated into the game; never call a screen finished without continuous gameplay proof).
Built: **`tools/reflock/`** (README there) = Reference-Locked 3D Scene Builder: both pictures' cameras fitted into ONE world (`fit_section.py`),
Blender 5.3 builds 97+ connected meshes -> `section.glb` (`blender_section.py`), the pictures baked once onto the meshes from their fitted
cameras (depth-tested, masked, clean plates, sharpness guard), Benny 31 + `tools/kit05/controls.js` swipes, chase camera blended between the two
fitted cameras + on-screen guard, QA `section_run.cjs` (green-background hole count, Benny box, static-world audit), `compare_section.py`.
In the game: `public/section/` (`build_section_app.sh`, pre-baked) + `src/game/bonusRoute.ts`: the game hands over at the end of 04 and resumes at
05 ONLY with `VITE_RAINBOW_BONUS=1` / `?bonus=1` (default game unchanged). Evidence + numbers: **`qa/reflock/r40/`** (RESULT_R40.md).
ChatGPT's `chatgpt/rainbow-physical-tunnel-test-20261121` = an older-code A/B diagnostic (patches do not apply to today's src); not merged.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ NEWEST — ROUNDS 38-39 (2026-11-22 ~01:40 UTC, branch `ccr-1a97503a-p221vc`)
Two NEW candidate bonus areas (NOT in the 11-screen route; approved screens untouched): Sock Rescue (between 06 and 07) and Bubble Dash Chamber
(between 04 and 05), as isolated test switches on `tools/bonus/bonus.html` (`?area=sock` / `?area=bubble`; `bash tools/bonus/setup_bonus.sh <ws>`).
Round 39 (user-approved, free tools only): Sock Rescue camera + tunnel FITTED to the picture (`tools/bonus/fit_sock.py`), the picture's own
pixels projected + BAKED onto walls / rings / towels / paddles (`tools/bonus/plate_sock.py`), start view 9.8 % -> 68.3 % of scenery within 20
levels (colour look 0.55 -> 0.95); then the user's reference-video MOVEMENT (camera glides to the tunnel centre behind Benny, normal perspective,
speed 1.9, Benny crosses the river on swipes). Water tuned by measurement (`tools/bonus/water_stats.py`). Phone test (private):
https://claude.ai/artifact/FXY6sg3BMqBdb3yiNieaUN (Sock) · https://claude.ai/artifact/4uc39tWfZ3UykRLXoBE1hu (Bubble, round 38).
Everything + numbers + honest limits: **`docs/briefs/2026-11-21-r38/BONUS_INTEGRATION_PLAN_R38.md`**; evidence `qa/bonus/r38/`, `qa/bonus/r39/`.
Open: Benny back-projection fix; upscaled close-up art; Bubble Dash fit (same method); Screen 05 A/B/C still the user's choice.
Atlas connector: no active Atlas account (user must sign up at atlas.worldlabs.ai); no paid credits spent in rounds 37-39.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ NEWEST — ROUND 37 (2026-11-21 ~23:40 UTC, branch `ccr-1a97503a-p221vc`)
Screen 05 ONLY. User asked for THREE buildable options before any more rebuilding (A max artwork fidelity / B natural 3D water / C arcade),
same Benny + swipes + camera + coins in all three, real engine renders, then THE USER CHOOSES. Built as URL switches on the kit test page
(`tools/kit05/kitgame.html` `?opt=a|b|c`; default unchanged). Recommended: **B** (painted tunnel + river drawn live from the measured water
design). Everything, links, evidence and honest limits: **`docs/briefs/2026-11-21-r37/OPTIONS_R37.md`**; pictures + clips `qa/kit05/r37/`.
WAITING FOR THE USER'S CHOICE — build nothing further on Screen 05 until then. No specialists running; no credits spent.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ NEWEST — ROUND 35 (2026-11-21 ~19:40 UTC, branch `claude/character-swimming-mechanics-jo0h6s`)
Screen 05 ONLY. User: "look exactly like the approved screens where the pink character can swim naturally" (`docs/briefs/2026-11-21-r35/USER_R35.md`).
Integrated the five round-34 specialists' unsaved work (from `backups/wip/*-c34`), then: the river = the user's OWN painted river in its world place,
repeating every 3 ring sections (`tools/kit05/bake_river35.py`), live painted streak detail, painted foam domes + bubbles (`bake_puffs.py`), gameplay
fixes (S4 suite: items 1-7 + 10 PASS, phone live mode PASS), phone build `build_phone.sh` published privately at
https://claude.ai/artifact/Jpq74VraeFhXnU2hXLQeHD. Everything + numbers + honest limits: **`docs/briefs/2026-11-21-r35/RESUME_R35.md`**; pictures
`qa/kit05/r35/compare/`. No specialists running; no credits spent. Not approved yet.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ NEWEST — ROUND 34 (2026-11-21 ~18:00 UTC, lead branch `ccr-3830a7b8-af3hrd`)
Screen 05 ONLY: Benny's real 3D swimming + Subway-Surfers-style swipes through the ORIGINAL approved Screen 05, then a phone-playable build.
Base = the round-33 tunnel kit (`tools/kit05/`). New shared foundation (`9a46d34`): `controls.js` now lives in `tools/kit05/`, `setup_kit.sh`
(runnable game folder from any worktree), `render_slot.sh` (2-slot CPU lock for all Chromium renders), `live.js` + `?live=1` (REAL-TIME phone
mode: tap to start, fps + swipe-response meter; `live_check.cjs`). FIVE specialists in parallel, each in a sparse worktree under `/home/user/wt/`
with strict file ownership: S1 visual (winding world-anchored river, `kit.json` `river_center`), S2 Benny swimming + controls, S3 camera / path /
coins, S4 QA (`tools/kit05/qa/run_acceptance.sh`), S5 the reusable skill `.claude/skills/rainbow-screen-builder/`. Map + rules + relaunch:
**`docs/briefs/2026-11-21-r34/COORDINATION_R34.md`**; user's orders verbatim **`USER_R34.md`**; workers' notes `docs/briefs/2026-11-21-r34/notes/`
(inside each worktree, snapshotted to `backups/wip/<branch>/`); status `backups/AGENTS_STATUS.json` → `round34`. Nothing approved yet; no credits spent.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ NEWEST — ROUND 32c (2026-11-21 ~12:45 UTC, branch `claude/screen-05-3d-geometry-9yu7pu`)
Screen 05 real 3D swimming test in progress: Marble splat world of the approved picture → full-length ring-to-ring track (river mirrored in alternate
sections), real 3D Benny, follow camera; two specialists (swipe controls; water flow + dark-gap cleanup) were running. Everything to continue:
**`docs/briefs/2026-11-21-r32/RESUME_R32.md`** (state + next steps), `USER_R32.md` (binding orders: no video until every acceptance test passes;
no other screens / credits until Screen 05 is approved), `setup_r32.sh` (one-command workspace), `AGENT_A_CONTROLS.md`, `AGENT_B_WATER.md`;
specialists' saved work `backups/wip/screen05-agents/`. New-account steps: TOP of `backups/START_NEW_CLAUDE_ACCOUNT.md`.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ NEWEST — ROUND 32 (2026-11-21 ~03:00 UTC, branch `claude/screen-05-3d-geometry-9yu7pu`)

User (verbatim): "THE NEW REAL 3D SCREEN 05 IS NOT APPROVED … preserve BOTH versions … Stop changing my artwork … I just want the goddamn pink
character to swim around my approved screen … I want my exact approved screen. You had it before. Stop changing it." → built
**`?paint=1&paintswim=1&benny31=1`**: the approved Screen 05 picture EXACTLY as `?paint=1` (unchanged plate, held still), the REAL 3D Benny (game
runtime, paddling, steering) drawn into it and swimming along the painted S-river through the gold bands into the tunnel end; coins sit on the
painted river and he collects them. Everything: **`qa/match/05/swim05/README.md`** (+ 10 s gameplay clip in `clip/`). Both earlier versions
preserved (`?paint=1` = the painted version; `?match05=1&projflow05=2&benny31=1&tun05=1` = the rejected moving-camera 3D, `qa/match/05/r31_3d/`).
RULE from this round: do NOT change the approved artwork; no broad changes; no paid credits. Waiting for the user's verdict.
User then (verbatim excerpt): "Benny … gets smaller and eventually almost disappears … THAT IS NOT WHAT I WANT … proper third-person follow-camera
… he remains approximately the same size and position … scenery must … move past Benny" → **`?paint=1&paintfly=1&benny31=1`**: 3D Benny fixed at
the painted spot/size, the approved picture flies past him (self-similar tunnel zoom, 1.675 per ring, loop closes on the picture), normal speed:
**`qa/match/05/fly05/README.md`** + clip. All earlier versions kept.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ NEWEST — ROUND 31 (2026-11-21, lead branch `ccr-4fcad20e-a6pp8w`, from ~23:50 UTC 11-20)

User (verbatim, ~00:05): "Yes, do Screen 06 first … I want these exact … all these four images … 100%, or at least 95%" + "add any plugin or anything you
need. I don't care how much it costs." → built **`?paint06=1`**: Screen 06 = the user's OWN five pictures (approved 06 + the four storyboard panels) as
full-screen depth plates, painted-Benny layer that steers, reveal transitions; live captures 97.7–98.3 % of pixels within 20 levels of each panel (at
the panel's size), 97.9 % of the approved picture below the HUD. Default build pixel-identical. Everything: **`qa/match/06/paint06/README.md`**
(proof pictures + clips in `proof/`, paid-job ledger `LEDGER.md`, rebuild steps `tools/paint06/`). Waiting for the user's verdict; if approved, the
same method for 04, 05, 07, 08, 09, 10 (user asked for "all of them").

Then (same round, user: "DO NOT remove or redesign my original approved pink Benny … improve the existing 3D model … APPROVED / CURRENT 3D /
IMPROVED 3D at the same rear angle and size … Do not silently switch characters"): improved 3D Benny candidate = Hunyuan3D 2 mesh + the approved
Benny's pixels baked through the game's colour chain — rear outline 0.902 → 0.956, structure 0.49 → 0.81; sides / front still plain. NOT wired into the
game; painted Benny stays in `?paint06=1`. Everything: **`qa/benny/r31/README.md`**.

Then (same round, user's order "05, 07, 04, 08, 09, 10 … start with Screen 05 now"): built **`?paint=1`** = the approved-artwork CHAIN 05 → 06 (src/world/paint.ts,
assets/textures/paint/, tools/paint/): scenery holds still, painted water flows, painted coins are real coins (flow to Benny, pop, vanish), painted Benny steers,
reveals between pictures, 3D at the 04→05 and 06→07 joins. Every-frame likeness straight 05: 82 % px / 93 % look (BEFORE 5 %); proof + honest limits:
**`qa/match/05/paint05/README.md`**. Next in the user's order: Screen 07, then 04, 08, 09, 10.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ NEWEST — ROUND 30b (2026-11-20, lead branch `ccr-e490fceb-u85291`, from ~22:20 UTC)

The r30 session closed ~22:14; this one merged its last save `b9ca06c` (user: "Continue from the latest saved version") and recreated the
worktrees on LOCAL `-c32` (`docs/briefs/2026-11-20-r30/setup_r30b.sh`). **User's binding brief: `docs/briefs/2026-11-20-r30/USER_R30.md` §6 — all FOUR
storyboard panels of Screen 06 are mandatory approved targets.** Built `&m06sb=1` + specialists' `w30` / `f30` / `b30` (map: `docs/briefs/2026-11-20-r30/COORDINATION.md`
"Round 30b"; launch brief `LAUNCH_R30B.md`). Candidate commit `cf1a660` (LOCAL), patch + proof on GitHub: `qa/match/06/r30b/proof/`. Not approved yet.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ NEWEST — ROUND 30 (2026-11-20, lead branch `ccr-2644c3c0-iikckn`, from ~20:05 UTC)

New session/account; started at `8abed78`, merged the r29 lead's last two saves (`f090393`, 20:02) on the user's "continue exactly where we
left off" (`1d1f359`). Worktrees recreated on LOCAL `-c31` (all 12 byte-identical to the 20:02 snapshots). This environment ("Default"): World Labs key
re-entered via the secure form ~21:22 (verified, 5,420 credits), fal not set, Atlas connector needs the atlas.worldlabs.ai sign-up; plugins
playwright + claude-code-setup not enabled (card shown). **User's r30 Screen 06 orders verbatim: `docs/briefs/2026-11-20-r30/USER_R30.md`** (ring
"target" diagnosis first → done; storyboard route: crest → curl right + descend → gold bands → S-bend → 07). Built `&m06curl=1` (map + checks:
**`docs/briefs/2026-11-20-r30/COORDINATION.md`**; proof `qa/match/06/r30/`). Not approved yet. No specialist workers running.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ ROUND 29 (2026-11-20, lead branch `ccr-ac160b4c-3hdecw`, from ~18:21 UTC)

New account; session branch started at **`31d3a8c`** = the r28 lead `ccr-9652868f-lkw0w0`'s last save (18:12 UTC; verified with `git ls-remote` after
the hook's fetch failed — nothing newer, nothing merged). Round 28 stopped 17:30–17:36 UTC (old account 5-hour limit, HTTP 429). Worktrees recreated on
LOCAL `-c30` (`setup_worker_r29.sh`, all 12 incl. trial07 + view04/06/07) — **all 12 byte-identical to the 18:12 snapshots**. On THIS account: World
Labs key (5,420 credits), fal, Hugging Face, Context7 connector and GitHub WORK; the World Labs **Atlas** connector needs the user's sign-up
(atlas.worldlabs.ai); 7 inventory plugins not enabled (not needed). Four workers relaunched (**s06 route test = priority**, s07, s05, Benny).
Map + services: **`docs/briefs/2026-11-20-r29/COORDINATION.md`**; briefs `LAUNCH_R29.md`; next-account recipe **`setup_worker_r30.sh`** (`-c31` from
the newest `backups/wip/*-c30/`). Binding user decisions unchanged: `docs/briefs/2026-11-20-r28/USER_CLARIFICATIONS_R28.md` (04–10 playable incl. 09 / 10),
`S06_ROUTE_R28.md` (06 route test authorized), `docs/briefs/2026-11-20-r26/USER_VISUAL_BRIEF_R26.md`.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ ROUND 28 (2026-11-20, lead branch `ccr-9652868f-lkw0w0`, from ~16:36 UTC)

New account; session branch started at **`7d3ba10`** = the r27 lead `claude/rainbow-restore-screen-match-ijjdai`'s last save (16:15 UTC; verified with
`git ls-remote` after the hook's fetch failed — nothing newer, nothing merged). Round 27 stopped 16:09–16:13 UTC (old account 5-hour limit, HTTP 429).
Worktrees recreated on LOCAL `-c29` (`setup_worker_r28.sh`) + the lead's `view04/06/07` clean-frame worktrees — **all 12 byte-identical to the 16:15
snapshots**. On THIS account: World Labs key (5,420 credits), Atlas connector, fal, Hugging Face, Context7 connector, GitHub and all 14 account
plugins WORK. Four workers relaunched (s07, s04, s05, Benny); s06 waits for the user's route answer. Map + services:
**`docs/briefs/2026-11-20-r28/COORDINATION.md`**; briefs `LAUNCH_R28.md`; next-account recipe **`setup_worker_r29.sh`** (`-c30` from the newest
`backups/wip/*-c29/`, trial07 + view04/06/07 included). Open user questions (r27): extra-view approvals, 06 route, 09/10 playable or Flow video. Review page on this account: https://claude.ai/artifact/S7TMhvuzJVvKirMBM88pjX (source `qa/review_r28/`). Draft PR #25 (DO NOT MERGE).
**USER SCOPE DECISION (r28, ~17:25 UTC, permanent): 01, 02, 03, 11 = Google Flow videos; 04–10 INCLUDING 09 AND 10 = real playable 3D.** Verbatim + per-screen clarifications (04 / 06 / 09 / 10): `docs/briefs/2026-11-20-r28/USER_CLARIFICATIONS_R28.md`. **Screen 06 route test AUTHORIZED (r28 ~17:05)** — brief `docs/briefs/2026-11-20-r28/S06_ROUTE_R28.md`.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ ROUND 27 (2026-11-20, lead branch `claude/rainbow-restore-screen-match-ijjdai`, from ~15:11 UTC)

New account; session branch = r26 lead `ccr-08ece3a6-xcwyls` merged up to its last save **`e655f19`** (15:03 UTC) → `e2e1d12`. Nothing else merged.
Worktrees recreated on LOCAL `-c28` branches (`setup_worker_r27.sh`) + `trial07` separately — all byte-identical to the 15:03 snapshots. DevTools /
Spector trial scripts + results recovered from the saved conversation (`tools/lead26/trial07_recovered/NOTES.md`). On THIS account the World Labs
key, the Atlas connector and fal all WORK; Hugging Face not connected; 11 account plugins not enabled (install card shown). Four workers relaunched
(s07, s06, s04, Benny). Map + services: **`docs/briefs/2026-11-20-r27/COORDINATION.md`**; briefs `LAUNCH_R27.md`; next-account recipe
**`setup_worker_r28.sh`** (`-c29` from the newest `backups/wip/*-c28/`, trial07 included). User's new r27 request: preview + honest 1–10 rating of
every screen in motion + fix plan → `qa/review_r27/`.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ ROUND 26 (2026-11-20, lead branch `ccr-08ece3a6-xcwyls`, from ~13:00 UTC)

New account; session branch started at `a2261d5` = the latest of the r25 lead `ccr-a9235d04-90cw28` (its last daemon save 12:51 UTC).
Round 25 ended 12:36–12:45 UTC when the old account hit its 5-hour limit (all four workers stopped mid-step). Nothing merged. Worktrees
recreated from the 12:52:06 snapshots on LOCAL `-c27` branches (`docs/briefs/2026-11-20-r25/setup_worker_r26.sh`, content identical).
**The user's detailed visual brief for every screen (binding): `docs/briefs/2026-11-20-r26/USER_VISUAL_BRIEF_R26.md`.** Four workers relaunched
(s07, s06, s04, Benny). Map + services: **`docs/briefs/2026-11-20-r26/COORDINATION.md`**; briefs `LAUNCH_R26.md`; next-account recipe
`setup_worker_r27.sh` (`-c28` from the newest `backups/wip/*-c27/`). On this account: World Labs API key and fal key are NOT on the
environment (World Labs check HTTP 401 → secure form); Atlas connector still "no active Atlas account" (user: atlas.worldlabs.ai sign-up).

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ NEWEST — ROUND 25 (2026-11-20, lead branch `ccr-a9235d04-90cw28`, from ~11:54 UTC)

New account; session branch started at `36bc533` = the latest of the r24 lead `ccr-5be1062a-0ffyej` (its last daemon save 11:43 UTC).
Nothing merged. Saved r24 conversation recovered to 11:17:57 UTC (workers to 11:12, the user's interrupt). Worktrees recreated from the
11:43:21 snapshots on LOCAL `-c26` branches (`docs/briefs/2026-11-20-r24/setup_worker_r25.sh`, counts identical). Four workers relaunched
(s07 → S-bends / steering view / 07→08 join with K23-3; s06 → the opening blue cone + owed comparison, then crest / river / coin trail;
s04 → labelled K23-S3 clip + glints / ribbons / far foam / projection; Benny → felt star verdict, silky fur). Map + services:
**`docs/briefs/2026-11-20-r25/COORDINATION.md`**; briefs `LAUNCH_R25.md`; next-account recipe `setup_worker_r26.sh` (`-c27` from the
newest `backups/wip/*-c26/`). Heavy renders share 2 slots (`tools/lead25/render_slot.sh`). Account services on this account: the
Marble/Atlas connector needs the user to finish the Atlas sign-up (atlas.worldlabs.ai); 7 plugins of the old account were not yet enabled
(install card shown). Review package ZIPs: regenerated in this session from `bf01adf` (not in git).

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ ROUND 24 (2026-11-20, lead branch `ccr-5be1062a-0ffyej`, from ~10:30 UTC)

New account; started from the r23 lead `claude/rainbow-r22-restore-ut3m39` and merged its final save `a735ec7` (10:25). Round 23
stopped at 10:19 UTC (5-hour limit) right after sending the complete labelled Screen 07 clip. **The user reviewed it (~10:35): Screen 07
NOT approved — (1) whole river in broad S-bends, (2) route ahead visible while steering, (3) clean 07→08 water / foam join with the
latest 08; keep the fuller foam; then the same labelled clip.** Screen 06 opening ripple ("raised blue cone") comparison still owed;
06 crest / winding river / curved coin trail stay open. Four workers relaunched on LOCAL `-c25` branches (s07, s04, s08, Benny).
Map + services: **`docs/briefs/2026-11-20-r24/COORDINATION.md`**; briefs `LAUNCH_R24.md`; recipe `setup_worker_r24.sh`; open items
`docs/briefs/2026-11-20-r23/OPEN_ITEMS.md`. Nothing else merged.
**~11:20 state:** s08 FINISHED (candidate K23-3 = `qa/match/08/r23/QUERY_CANDIDATE_K23-3.txt`); s07 / s04 / Benny were STOPPED mid-step
by the user's interrupt (their unfinished edits = `backups/wip/*-c25/`, refreshed every 5 min; recreate with
`docs/briefs/2026-11-20-r24/setup_worker_r25.sh`); Screen 06 cone diagnosed (`qa/match/06/r24/lead_rip/NOTES.md`), fix not done.
Review package for ChatGPT built (`docs/review_package/2026-11-20/`, ZIPs not in git). **Next account: follow the TOP of
`backups/START_NEW_CLAUDE_ACCOUNT.md` — start on THIS branch; the five-minute autosave (incl. chat history, tools, plugins,
agents) then starts by itself; verify with `python3 -I scripts/autosave-status.py`.**

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ ROUND 23 (2026-11-20, lead branch `claude/rainbow-r22-restore-ut3m39`, ~04:08–10:19 UTC)

Map, results log, user notes verbatim: `docs/briefs/2026-11-20-r23/COORDINATION.md` + `OPEN_ITEMS.md`. Done: 04 K23-1 (pink walls
off, clear blue water), 07 `m07satin`, 06 `m06fcl` / `m06view&m06vs=0` / `m06rip`, 08 `m08gl`, Benny star work; the labelled 07 clip.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ ROUND 22 (2026-11-20, lead branch `ccr-4742c19f-ez2mrs`) — HANDOFF READY (~04:00 UTC)

The user is moving to another Claude account again. Start the next session on **`ccr-4742c19f-ez2mrs`**. Everything is in
**`docs/briefs/2026-11-20-r22/RESUME_R22.md`** (+ `COORDINATION.md`, launch briefs `LAUNCH_S04.md`, `LAUNCH_S04_PROJ.md`,
`LAUNCH_S07.md`, `LAUNCH_S06.md`, `LAUNCH_BENNY.md`, recipe `setup_worker_r23.sh`). Round 22: restore verified (checkpoint `47bfbf8` +
newer saves; 89 LFS files / 577 MB on GitHub LFS); keys re-entered (World Labs, fal); **the user APPROVED the three Screen 04 generated
views** (`qa/review_r21/artwork/04/USER_VERDICT.md`); 04 foam heaps `m04bbd` (K22-2, small improvement); 07 `m07cloud` (worker GOOD, lead
review pending); 06 `m06view` NOT YET PROVEN; Benny plush pile + exposure + pompom (`&benny20=1&b20expo=1&b20ppw=0.45`); 07 + 05
generated proposals await the user ($1.32 total artwork). **The user's newest Screen 04 feedback (clean water, no messy pink walls near
the gold, Benny swimming naturally through the five arrows) is the first task** — verbatim + diagnosis in RESUME_R22.md. Nothing merged.

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ ROUND 21 (2026-11-20, lead branch `ccr-68d26c2d-gwegce`) — HANDOFF READY (~02:50 UTC)

The user is moving to another Claude account (credits). Start the next session on **`ccr-68d26c2d-gwegce`**. Everything —
where each worker stopped, the user's new authorizations (paid artwork, up to four specialists, 06 / 07 framing tests, Screen 08
resumed, consistent approved Benny), how to recreate the worktrees and relaunch — is in **`docs/briefs/2026-11-20-r21/RESUME_R21.md`**
(+ `COORDINATION.md`, briefs `S04_R21.md`, `S07_R21.md`, `S06_R21.md`, `BENNY_R21.md`, recipe `setup_worker_r22.sh`). Done: Screen 04
rings `m04rsoft` + `msaa` (`qa/match/04/r21_rings/NOTES.md`); audit of 04–08 in motion (`qa/review_r21/audit/`); 04 step `m04wgl`
and 07 step `m07end` (both GOOD IMPROVEMENT, code saved as patches in `qa/match/0N/r21/`); first paid continuation views for Screen 04
(`qa/review_r21/artwork/`, $0.60, awaiting the user's approval). Cloud sessions of the OLD account: s06 → `claude/rainbow-s06-match-c22`,
Benny → `claude/rainbow-benny-c22` (their own autosave). Services verified: GitHub, Hugging Face (`josdois`), World Labs Atlas + key
(5,420 credits), fal, Playwright; Context7 needs a sign-in. Nothing merged.

---

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ ROUND 20 STATE (2026-11-19 ~23:40 UTC, lead branch `ccr-681a37bb-5jqfbu`)

Session opened on the r19 lead `ccr-d00ac5ec-gabdsh` @ `0bd0ab5` (nothing merged; its 23:17 save `f49bc7f` = bookkeeping only).
User: "Continue exactly where we left off". Round 19b (Benny's approved look + Screen 04 ≥ 8/10 WHILE SWIMMING) had been cut off
after ~14 min by the r19 account's 5-hour limit (~20:56 UTC); its three workers' unfinished edits (21:52 `backups/wip/*-c20/`) are
restored on new `-c21` branches and the same three workers RELAUNCHED: Benny `claude/rainbow-benny-c21`, s04 water / foam
`claude/rainbow-s04-match-c21`, s04 rings `claude/rainbow-s04-ringtex-c21`. Map + verified services:
**`docs/briefs/2026-11-19-r20/COORDINATION.md`**; recipe `docs/briefs/2026-11-19-r20/setup_worker.sh`. 05 / 06 / 07 not restarted;
08 PAUSED. This account: World Labs Atlas connector connected, keys (World Labs 5,420 credits, fal) injected and verified; NO
Thrixel connector. If this account runs out: `-c22` branches from each newest `-c21` tip; never write `-c21` from another account.

---

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ ROUND 19 STATE (2026-11-19 ~20:15 UTC, lead branch `ccr-d00ac5ec-gabdsh`) — HANDOFF READY

New account, started 19:05 UTC from the r18 lead's 18:56 save (r18 stopped at the usage limit; nothing merged). The r18 04 / 05
workers were relaunched on `-c19` branches, each finished its step and stopped cleanly for a fresh session (user order ~19:40):
s04 `claude/rainbow-s04-match-c19` @ `97fcb8b6` (K18-5 steering-smear fix), s04tex `claude/rainbow-s04-ringtex-c19` @ `1cff16f2`
(K9 crisp ring lines), s05 `claude/rainbow-s05-match-c19` @ `eb7233e3` (crisp slotted left wall). 06 / 07 still on their `-c18` tips;
08 PAUSED. Thrixel connector (user's sign-in) tested once on Screen 04 foam: NOT AN IMPROVEMENT (8 cubes, 1 free sculpt run;
`qa/match/04/r19_thrixel/NOTES.md`). Where everyone stopped + next tasks: **`docs/briefs/2026-11-19-r19/RESUME_R19.md`**; map
`docs/briefs/2026-11-19-r19/COORDINATION.md`; recipe `docs/briefs/2026-11-19-r19/setup_worker.sh`. Next round: `-c20` branches
from each newest `-c19` tip. Open lead task: the combined Screen 04 preview v3.

---

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶▶ ROUND 18 STATE (2026-11-19 ~02:45 UTC, lead branch `ccr-ae71d3a5-80naq2`)

Started 02:15 UTC from the r17 lead `ccr-bbe2b27e-oxfh1w` @ `d22ec46` (its last save, 2026-11-18 21:11 UTC; nothing merged). The r17
environment closed after that save; its five 04–07 workers were mid-step — their 21:11 WIP is restored UNCOMMITTED on new `-c18`
branches. Screen 08 stays PAUSED (user, 21:02 UTC). Branch map, services: **`docs/briefs/2026-11-19-r18/COORDINATION.md`**; where each
worker stopped: **`docs/briefs/2026-11-19-r18/RESUME_R18.md`**; worktree recipe `docs/briefs/2026-11-19-r18/setup_worker.sh`.
Connectors: World Labs Atlas connected; keys (World Labs 5,420 credits, fal) injected and verified. If this account runs out:
`-c19` branches from each NEWEST `-c18` tip; never write `-c18` from another account.

---

# ▶▶▶▶▶▶▶▶▶▶▶▶▶▶ ACCOUNT 17 (round 17) STATE (2026-11-18 ~20:50 UTC, lead branch `ccr-bbe2b27e-oxfh1w`)

The cloud session opened on the OLD lead `ccr-5495e9c4-g0apvl` (2026-11-17 22:44 UTC); at the user's "do exactly where we left off"
the account-16 lead `ccr-e42bb3c0-jpif8d` @ `e057fe80` (its last save, 20:14 UTC) was merged into this fresh session branch
(`9eea720d`; the old branch added only backup / transcript autosaves). Account 16 stopped at ~20:14 UTC with all six workers mid-step;
their unfinished edits (20:14 `backups/wip/*-c16/`) are restored UNCOMMITTED on new `-c17` branches. Branch map, services, verdicts:
**`docs/briefs/2026-11-18-r17/COORDINATION.md`**; where each worker stopped: **`docs/briefs/2026-11-18-r17/RESUME_R17.md`**; worktree
recipe `docs/briefs/2026-11-18-r17/setup_worker.sh`. Connectors: World Labs Atlas connected; keys (World Labs 5,420 credits, fal)
injected and verified; network now also allows `cdn.marble.worldlabs.ai` + `mcp.context7.com` (user-approved). If account 17 runs
out: `-c18` branches from each NEWEST `-c17` tip; never write `-c17` from another account.

---

# ▶▶▶▶▶▶▶▶▶▶▶▶▶ ACCOUNT 16 (round 16) STATE (2026-11-18 ~19:15 UTC, lead branch `ccr-e42bb3c0-jpif8d`)

Started 18:51 UTC from the account-15 lead `ccr-47b10cec-03c7co` @ `0aeee2e` (nothing merged). Account 15 hit its **5-hour usage
limit at 18:49 UTC** (resets 23:10 UTC) after ~37 min of six parallel workers; all six were cut off mid-step; their unfinished edits
are in the 19:00 UTC `backups/wip/` snapshot on `origin/ccr-47b10cec-03c7co` (`90528de`, backup-only commits, never merged).
Branch map, services, verdicts: **`docs/briefs/2026-11-18-r16/COORDINATION.md`**; where each worker stopped + what to do first:
**`docs/briefs/2026-11-18-r16/RESUME_R16.md`**; worktree recipe `docs/briefs/2026-11-18-r16/setup_worker.sh`. Six workers relaunched
on `-c16` branches (04, 04 ring test, 05, 06, 07, 08) from the r15 launch briefs. Open user request: "show me the painted ring test
results" (04 `&m04rpaint`). Connectors: NO claude.ai connectors on this account (Atlas, Hugging Face = user action); keys (World
Labs 5,420 credits, fal) injected and verified. If account 16 runs out: `-c17` branches from each NEWEST `-c16` tip; never write
`-c16` from another account.

---

# ▶▶▶▶▶▶▶▶▶▶▶▶ ACCOUNT 15 (round 15) STATE (2026-11-18 ~18:25 UTC, lead branch `ccr-47b10cec-03c7co`)

Started from the account-14 lead `ccr-6c7564b1-fmlt1w` @ `58b94d9` (nothing merged; account 14 hit its usage limit at ~17:46 UTC,
no unfinished code edits lost). Binding visual goal unchanged: `docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md`. Branch map,
services, verdicts: **`docs/briefs/2026-11-18-r15/COORDINATION.md`**; complete reusable launch briefs `S04_LAUNCH.md`,
`S05_LAUNCH.md`, `S08_LAUNCH.md` there; four GitHub 3D tools (Atlas skills, fSpy, TRELLIS.2, glTF Transform): `GITHUB_3D_TOOLS.md`.
RUNNING (background agents in the lead container): 04 `claude/rainbow-s04-match-c15` (foam-bubbles-particles, `/home/user/wt/s04`),
05 `claude/rainbow-s05-match-c15` (water-fx-specialist, `/home/user/wt/s05`), 08 `claude/rainbow-s08-scenery-c15`
(washer-environment-modeler, `/home/user/wt/s08`), 04 ring test `claude/rainbow-s04-ringtex-c15` (`/home/user/wt/s04b`), 07 `claude/rainbow-s07-match-c15` (water-fx-specialist, `/home/user/wt/s07`), 06 `claude/rainbow-s06-match-c15` (reference-match-director, `/home/user/wt/s06`). DISK TRAP: worker worktrees must use sparse checkout (COORDINATION.md). Keys: this account's environment injects World Labs (5,420
credits, 08 world 200) and fal (01a1ea70 COMPLETED) — no form needed. Atlas connector NOT connected on account 15 (user action).
If account 15 runs out: `-c16` branches from each NEWEST `-c15` tip; never write `-c15` from another account.

---

# ▶▶▶▶▶▶▶▶▶▶▶ ACCOUNT 14 (round 14) STATE (2026-11-18 ~16:40 UTC, lead branch `ccr-6c7564b1-fmlt1w`)

Started from the account-13 lead `claude/rainbow-restore-autosave-1mgga0` (nothing merged; account 13 hit its usage limit at ~15:48
UTC). Binding visual goal unchanged: `docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md`. Branch map, services, verdicts:
**`docs/briefs/2026-11-18-r14/COORDINATION.md`**. RUNNING: 05 `claude/rainbow-s05-match-c14` (water-fx-specialist, `/home/user/wt/s05`),
08 `claude/rainbow-s08-scenery-c14` (washer-environment-modeler, `/home/user/wt/s08`); lead continues 04 on
`claude/rainbow-s04-match-c14` (`/home/user/wt/s04`). Keys: this account's environment injects World Labs (5,420 credits, 08 world
200) and fal (01a1ea70 COMPLETED) — no form needed. Shallow clone: fetch branch tips one at a time with `--depth=1`.
If account 14 runs out: `-c15` branches from each NEWEST `-c14` tip; never write `-c14` from another account.

---

# ▶▶▶▶▶▶▶▶▶▶ ACCOUNT 13 (round 13) STATE (2026-11-18 ~15:00 UTC, lead branch `claude/rainbow-restore-autosave-1mgga0`)

Started from the account-12 lead `ccr-e908f8da-cy4yc1` @ `d256bc4` (nothing merged). **The user APPROVED the visual-first plan
(~15:00 UTC): `docs/briefs/2026-11-18-r13/USER_VISUAL_GOAL_R13.md` is binding for every specialist and every future account.**
Branch map, services, verdicts: `docs/briefs/2026-11-18-r13/COORDINATION.md`. RUNNING: 05 `claude/rainbow-s05-match-c13`
(water-fx-specialist, `/home/user/wt/s05`), 08 `claude/rainbow-s08-scenery-c13` (washer-environment-modeler, `/home/user/wt/s08`);
lead rebuilds 04 on `claude/rainbow-s04-match-c13` (`/home/user/wt/s04`). Keys: this NEW account's environment had none — the user
re-entered World Labs (5,420 credits, 08 world 200) and fal (01a1ea70 COMPLETED) via the secure forms. Shallow clone: fetch branch
tips with `--depth=1`. TRAP fixed: `backups/autosave.config.json` → `branch` must name the CURRENT lead branch (it named the
previous account's branch; protecting that branch then blocked every save). If account 13 runs out: `-c14` branches from each
NEWEST `-c13` tip; never write `-c13` from another account.

---

# ▶▶▶▶▶▶▶▶▶ ACCOUNT 12 (round 12) STATE (2026-11-18 ~12:45 UTC, lead branch `ccr-e908f8da-cy4yc1`)

Started from the account-11 lead `ccr-3b139b48-0qqkkz` @ `f06a53e` (nothing merged). Branch map + verified services:
**`docs/briefs/2026-11-18-r12/COORDINATION.md`**. RUNNING: 05 `claude/rainbow-s05-match-c12` (water-fx-specialist,
`/home/user/wt/s05`), 08 `claude/rainbow-s08-scenery-c12` (washer-environment-modeler, `/home/user/wt/s08`); lead finishes the
04 multi-view test on `claude/rainbow-s04-match-c12`. Keys: this account's environment injects World Labs (5,420 credits,
08 world 200) and fal (01a1ea70 COMPLETED) — no form was needed. If account 12 runs out: `-c13` branches from each NEWEST
`-c12` tip (or `-c11`); never write `-c12` from another account.

---

# ▶▶▶▶▶▶▶▶ NEWEST — ACCOUNT 11 (round 11) STATE (2026-11-18 ~11:38 UTC, lead session `session_018Sg3ASTRokNr5EKngTj33B`)

Lead branch **`ccr-3b139b48-0qqkkz`** (contains the account-10 lead `ccr-c526614d-tw0yro` @ `e673ef4` + autosaves; nothing
merged). Branch map, start SHAs, services: **`docs/briefs/2026-11-18-r11/COORDINATION.md`**. Rules unchanged
(`docs/briefs/2026-11-18-r8/COMMON_RULES.md` + `docs/briefs/2026-11-18-r10/RULES_R10.md`). Every screen continues on a NEW
`-c11` branch from its newest tip: 05 `claude/rainbow-s05-match-c11` (from `-c10` `bed8253d` + the account-10 WIP
`&m05unf=1`, RUNNING slot B, water-fx-specialist, worktree `/home/user/wt/s05`), 08 `claude/rainbow-s08-scenery-c11`
(from `-c10` `e1c7d0b7`, RUNNING slot A, washer-environment-modeler, worktree `/home/user/wt/s08`), 04
`claude/rainbow-s04-match-c11` (from `-c10` `a24d289c`, READY next, brief `docs/briefs/2026-11-18-r10/S04_R10.md`), 07
`claude/rainbow-s07-match-c11` (from `-c9` `dbc7678c`), 06 `claude/rainbow-s06-match-c11` (from `-c9` `efaf78b7`). Logs:
`qa/match/<NN>/r11/PROGRESS.md`. All `-c10` / `-c9` branches and `ccr-c526614d-tw0yro` are now in the autosave's
`protected_branches`.
**Keys on a new account:** this account's cloud environment is "Default" (unrestricted network). Both keys had to be
re-entered with the secure form (World Labs `api.worldlabs.ai` header `WLT-Api-Key` → 5,420 credits, Screen 08 world 200;
fal `queue.fal.run` `Authorization: Key …` → request `01a1ea70` COMPLETED). A new account will need the same two forms.
If account 11 runs out: `-c12` branches from each NEWEST `-c11` tip (or `-c10`/`-c9` where no `-c11` commit was added);
never write `-c11` from another account.

---

# ▶▶▶▶▶▶▶ ACCOUNT 10 (round 10) STATE (2026-11-18 ~10:45 UTC, lead session `session_01AvQv6SpZeUhzBcjgGW7HAA`)

Lead branch `ccr-c526614d-tw0yro` (= `claude/rainbow-restore-c9-40w64b` @ `4e0f94e` + autosaves). Branch map + slots:
**`docs/briefs/2026-11-18-r10/COORDINATION.md`**; new user standards (judge by eye, not colour numbers; faithful
continuation; preserve working projection): `RULES_R10.md`; tool research (DA3, MoGe-3, TRELLIS.2, Scenario YVO3D,
Substance Sampler, ControlNet, differentiable rendering, HF connector): `TOOL_EVALUATION.md`; fresh audit of all -c9 tips
with full-size APPROVED / game frames: `qa/review_c10/2026-11-18/`. RUNNING: 08 `claude/rainbow-s08-scenery-c10`, 05
`claude/rainbow-s05-match-c10`. **Pending free network permission** (Hugging Face + PyTorch CPU hosts for Depth Anything 3):
`PENDING_ENVIRONMENT_REQUEST.md` — re-submit only when the user says they are on a computer. Keys: World Labs 5,420 credits
(08 world readable), fal = same purchased account; both proxy-injected on env `rainbow-`. If account 10 runs out: `-c11`
branches from each newest `-c10` (or `-c9`) tip.

---

# ▶▶▶▶▶▶ ACCOUNT 9 (round 9) STATE (2026-11-18 ~02:50 UTC, lead session `session_01Kbt6BXRtCe7mvFtZdouetF`)

**Lead branch: `claude/rainbow-restore-c9-40w64b`** (contains the newest account-8 lead `claude/rainbow-lead-c8` @ `dd32bbfd`).
Branch map, running specialists, verified services: **`docs/briefs/2026-11-18-r9/COORDINATION.md`**. Each screen continues
on its own `-c9` branch from the newest `-c8` tip: 04 `claude/rainbow-s04-match-c9` (from `d217f546`, RUNNING), 05
`claude/rainbow-s05-match-c9` (from `c676a7c5`, RUNNING), 07 / 08 scenery / 06 `-c9` READY (rotation 07 → 08 → 06).
Logs: `qa/match/<NN>/r9/PROGRESS.md`. Keys: World Labs = 5,420-credit account (Screen 08 world 200); fal = same paid
account (01a1ea70 COMPLETED). If account 9 runs out: `-c10` branches from each NEWEST `-c9` tip; never write `-c9` from
another account. The account-8 section below stays valid background.

---

# ▶▶▶▶▶ NEWEST — ACCOUNT 8 (round 8) STATE (2026-11-18 ~02:25 UTC, lead session `session_013VHsJ9KrSuiLBqJwtdwa8n`)

**START THE NEXT ACCOUNT'S SESSION ON BRANCH `claude/rainbow-lead-c8`** (= this lead's state; the lead also autosaved
to its own session branch `ccr-58dd182e-m48xwk` — if that one is newer, it only adds transcripts/backup files).
Then paste the prompt at the top of `backups/START_NEW_CLAUDE_ACCOUNT.md`.

User order (round 8, binding, newest): "I ALREADY DESIGNED IT — the approved artwork is your blueprint." ALL FIVE
playable screens 04–08 must look like their OWN approved pictures (≥ 8.5/10, ideally 9–9.5) WHILE BENNY SWIMS. Visuals
only, no redesign, no generic tunnels or substitute water, no paid jobs without approval, two specialists at a time,
rotate the rest. **Show every genuine improvement at once** (separate full-size APPROVED / BEFORE / NEW pictures, in
words of WHAT LOOKS BETTER), not after a 2-hour milestone; reject experiments that do not look better. Do not bother the
user with servers, cameras or scripts. Nothing is approved until the user says so. 01–03 / 09–11 = Google Flow videos.
Rules for every specialist: `docs/briefs/2026-11-18-r8/COMMON_RULES.md`. Coordination log:
`docs/briefs/2026-11-18-r8/COORDINATION.md`.

| Screen | Round-8 branch (newest tip at hand-over) | State at hand-over | Next (in order) |
|---|---|---|---|
| 04 | `claude/rainbow-s04-match-c8` (from `d1e422fa`) | specialist RUNNING; kept (tip `d433f6f5`): step 1 `&m04ring=1` crisp modeled ring tunnel, step 2 `&m04river=1&m04foam=1&m04bub=1` wide swirling painted river + foam piles + bubbles + crisp arrows — shown to the user. Lead feedback sent: foam = soft irregular clusters (not even rows), then polished yellow-gold rings, then the painted five arrows | `docs/briefs/2026-11-17-r7/S04.md` M4 + `qa/match/04/r8/PROGRESS.md` |
| 05 | `claude/rainbow-s05-match-c8` (from `a34fb925`; WIP `2b178d94`) | specialist RUNNING; kept so far (tip `8d8f00f5`): step 1 `&m05coin=1` (giant coin no longer over Benny), step 2 `&m05ride=1` (painted water design around Benny while swimming), step 3 `&m05edge=1` (far river one continuous S into the throat, slab + orange tray gone) — all shown to the user; log `qa/match/05/r8/PROGRESS.md` | `docs/briefs/2026-11-17-r7/S05_ROUND2.md`: patch outline at the sides, far slab edge + orange piece (t66), pale bank shelves, blurry near walls |
| 07 | `claude/rainbow-s07-match-c8` @ `dbc7678c` | READY (next slot). Lead WIP: `&m07foam=1` (plunge white walls → painted banks, visibly closer, shown to the user) + `&m07coinsz=1`; proofs owed (STATUS top) | `docs/briefs/2026-11-18-r8/S07.md` |
| 08 | `claude/rainbow-s08-scenery-c8` @ `c0d8c97b` (incl. the unfinished r8 edits of account 7) | READY (after 07) | `docs/briefs/2026-11-18-r8/S08.md` |
| 06 | `claude/rainbow-s06-match-c8` @ `efaf78b7` | READY (after 08) | `docs/briefs/2026-11-18-r8/S06.md` |
Preserved, never written: all `-c7` / `-c5` branches (08 Benny `-c5` @ 3133a3ad, 08 camera `-c5` @ 18687513, preview `-c6`).
Honest moving ratings at hand-over: 04 ≈ 3.5 · 05 ≈ 6.5–7 · 06 ≈ 7 · 07 ≈ 4.5 (plunge fixed) · 08 ≈ 7. None at 8.5 yet.
Pictures shown to the user: `qa/review_r8/` (04_BEFORE, 05_BEFORE, 05_step1_coin, 05_step2_water, 07_plunge_fix_r7,
07_r8_foam_walls_WIP).

**How round 8 ran the specialists (worked well):** background specialist agents INSIDE the lead's container (Agent tool,
`subagent_type` = the project agent, e.g. washer-environment-modeler / water-fx-specialist), each in its own git worktree
(`git worktree add /home/user/wt/s0N <branch>`; `ln -sfn <checkout>/node_modules node_modules`; copy `tools/lead_r6/`
if missing; add `node_modules` to `.git/info/exclude`), prompt = COMMON_RULES + the screen brief + "resume from
PROGRESS.md / STATUS.md / git log". They push their own branch and send short SendMessage notes to "main"; the lead
watches the branches (Monitor on `git rev-parse HEAD` of each worktree) and shows each step to the user. TRAP: pressing
Stop on the lead's turn cancelled the background specialists once (01:57 UTC) — save their worktrees, restart them.
**On a new account:** if this account's specialists may still be pushing to the `-c8` branches, continue on NEW `-c9`
branches from each newest `-c8` tip (never two accounts on one branch). Merge nothing without the user's OK.

Services (free reads, this account): World Labs key = **Account B, 5,190 credits** (Screen 05 pilot worlds 200; Screen 08
world 32b5b2f4 → 404 with this key; its files are in Git LFS). fal.ai = the same purchased account (request 01a1ea70 →
COMPLETED; the paid 04 plate is in the repo). This account's environment `rainbow-` allows cdn.marble.worldlabs.ai,
v3b.fal.media, v3.fal.media (added with the user's approval). A NEW account has its own environment: keys and hosts
must be re-entered there (secure credential form only, host `api.worldlabs.ai` header `WLT-Api-Key`; `queue.fal.run`
header `Authorization: Key …`). Atlas connector not needed for visual work. Parallax Three.js: optional plugin.

---

# ▶▶▶▶ NEWEST — ACCOUNT 7 (round 7) STATE (2026-11-18 ~00:40 UTC, lead session `session_01KS3bZsVTaecBXyvFd9EQGg`)

**Lead branch now: `claude/rainbow-lead-c7`** (from the account-6 lead `ccr-4bd35b15-7z45t0` @ `dde3e9af`; the session
started on the OLD line `ccr-5495e9c4-g0apvl` — only transcripts there — and moved to a fresh branch, nothing merged).
User order (round 7): VISUALS ONLY on the five playable screens 04–08, ≥ 8.5/10 while Benny swims, each screen keeps ITS
OWN approved design, max two specialists at a time, no paid jobs, nothing approved until the user says so.
Coordination + rotation: `docs/briefs/2026-11-17-r7/COORDINATION.md`; briefs `S04.md S05.md S07.md S08_SCENERY.md`.

| Screen | Branch (from) | State |
|---|---|---|
| 06 (lead) | `claude/rainbow-s06-match-c7` (`-c6` @ 1e7b1112) | kept set `match06=1&m06geo=1&m06flow=1&m06cam=1&m06la=25&m06tun=1&m06ring=1&m06bub=1&m06foam=1`: straight ring tunnel, REAL modeled gold rings, bubbles, foam clusters, splash; ≈ 7/10 swimming (was 3.5–4); approved view unchanged. Notes `qa/match/06/r7/NOTES.md` |
| 08 scenery | `claude/rainbow-s08-scenery-c7` (`-c6` @ cf2e092b) | round 7 DONE (m08seam, m08sill, m08towel kept), ≈ 7.5/10; session idle |
| 07 | `claude/rainbow-s07-match-c7` (`-c5` @ 835a72db) | specialist session `session_01KS3bZthTRh6CTfK1fvM3r6` working on M3 (plunge) |
| 05 (line B) | `claude/rainbow-s05-match-c7` (`-c5` @ ebaf6cac) | specialist session `session_01KS3bZvfAKmzbAswSRdAaqD` working on M3 (whole-stage tunnel) |
| 04 | `claude/rainbow-s04-match-c7` (= `-c5` @ d1e422fa) | brief ready, NOT started (next free slot) |

Keys (free reads, ~23:45 UTC): World Labs = the 5,420-credit Screen 08 account (world 32b5b2f4 → 200; Screen 05 pilot
worlds now 404, outputs in Git LFS); fal.ai reconnected (request 01a1ea70 → COMPLETED); Marble CDN reachable; Atlas
connector responds. Git LFS 75 objects / 9 tips, fsck OK. APK build: intermittent Maven failures (user: not now).
Specialist launch traps: the first prompt is sometimes dropped (re-send with send_message); specialists must NOT use
send_message themselves (permission prompt blocks the session) — they report via STATUS.md commits.
User-facing pictures: `qa/review_r7/` (APPROVED / BEFORE / NEW) and `qa/review_r7/now/` (current versions).

---

# ▶▶▶ NEWEST — ACCOUNT 6 (round 6) STATE (2026-11-17 ~22:40 UTC, lead session `session_01VCMXoaUqBCxDq8BntT19BU`)

**Lead branch now: `ccr-4bd35b15-7z45t0`** (started from the r5 lead `ccr-f983b317-2vt0zh` @ `cbc571356d261144c2ac3b4092de4fc4a9d5ffe6`,
its newest commit; `ccr-067047f0-up5d1m` @ `7d1318ec` = r4 lead, its last commit is a transcript autosave only). User's
round-6 order: `docs/briefs/2026-11-17-r6/USER_DECISIONS.md` (≥ 8.5/10 THROUGHOUT GAMEPLAY; 06 major priority, then 08).
If account 6 runs out: `-c7` branches from each NEWEST `-c6` tip (or `-c5` tip where no `-c6` exists).

## PAUSED BY THE USER ~22:30 UTC (save credits)
Both specialists were told to checkpoint, push and stop (take the NEWEST commit of each `-c6` branch). Marble CDN host
still blocked (the allowlist request was denied at the prompt); APK builds still fail on intermittent Maven Central 404s
through this network (details: `backups/AGENTS_STATUS.json` → `round6_account6.paused_by_user_2026_11_17_2230`).

## Branch map (round 6; nothing merged into production, no -c5 or older branch written)
| Role | Branch | Started at | State |
|---|---|---|---|
| Lead | `ccr-4bd35b15-7z45t0` | `ccr-f983b317-2vt0zh` @ `cbc57135` | this session |
| 06 (MAJOR PRIORITY) | `claude/rainbow-s06-match-c6` | `c088718bb9e3374583238f4ee93f25bdee600065` | session `session_01VCMXobyXNaU99Bgt9q6WBM`, brief `docs/briefs/2026-11-17-r6/S06.md` |
| 08 scenery in motion r2 | `claude/rainbow-s08-scenery-c6` | `700f09e16ca0e44394a9926cd6a261541a645cad` | session `session_01VCMXobk8x9PXbYb8rpUaPP`, brief `S08_SCENERY.md` |
| Combined preview (test only) | `claude/rainbow-preview-all-c6` | preview-c5 `965e4ef9` + lead fix `41ea6618` | 08 ALL-switch conflict fixed (29.5 → 87.7 %) |
| 08 Benny | `claude/rainbow-s08-benny08-bake-c5` @ `ae7abe5b` | — | paused: r6 (`c6892676`) awaits the user's VISUAL verdict |
| 08 camera | `claude/rainbow-s08-camclear-c5` @ `18687513` | — | paused (phone verdict) |
| 07 / 05 / 04 | `-c5` @ `835a72db` / `ebaf6cac` / `d1e422fa` | — | paused; next tasks below |

## Restore audit (account 6, 21:50–22:10 UTC)
* 13/13 approved images byte-identical; 10/10 agent definitions, SHA-256 = `backups/AGENTS_STATUS.json`.
* Git LFS: **75 distinct objects, 921 MB** across the 9 tips (lead, 7 workstreams, preview), all local, `git lfs fsck` OK on all 9.
* Keys (free reads only): World Labs key = the user's **ORIGINAL Screen 08 account** (5,420 credits; world `32b5b2f4…` 200;
  05 pilot worlds 404). fal.ai = the SAME paid account (request `01a1ea70` → COMPLETED). No paid job started.
* MCP: GitHub + Playwright MCP + parallax-threejs (playwright / chrome-devtools / threejs-devtools) connected; context7 and
  spector failed to connect (optional). World Labs Atlas connector tools are listed (optional, not used).
* **Usage: this account shows `seven_day` / `allowed_warning` (resets ≈ 2026-11-23)** → only the two specialists above.

## Round-6 audit result (`qa/lead_r6/2026-11-17/README.md`) — NO screen is 8.5/10 while riding yet
Approved view / riding (lead's subjective rating): 04 8 / 4 · 05 8.5 / 6 · 06 7.5 / 3 · 07 7.5 / 3.5 · 08 8.5 / 7. Measured:
whole frame at the approved view 81.8 / 89.4 / 79.1 / 80.1 / 84.1 %; colour-palette overlap while moving 67.9 / 79.3 /
67.7 / 65.6 / 76.2 % (approved view 91–96 %, normal game 42–59 %). Common cause: matched look only valid near each locked
viewpoint; later parts of 05 and 07 (incl. the 07→08 plunge) still show the old default worlds.

## Next tasks after the two running milestones (user's order: 06 + 08 first, then 07, 05, 04)
* 07 M3: extend the matched tube over the whole 07 stretch + the plunge (gold band fills the screen mid-plunge); apply the
  `x07` plunge-top fade from preview-c6 `41ea6618` on the 07 branch; stretched near water when steering.
* 05 M3: matched geometry beyond ~20 u (old 05 world from ~66 % of the stage), river sheet when steering, near coin size.
* 04 M4: world-anchored gold ring / bulb wall material + swirl water + foam banks beyond ~6 u (now a blurred smear and a
  flat floating ramp), blue arrows while travelling.
* Preview: per-screen Benny (05 look only on 05), 04 top bar layout, 08 Benny wave phase (`water.surfaceHeight(s,…)`).

---

# ▶▶ NEWEST — ACCOUNT 5 (round 5) STATE (2026-11-17 ~20:35 UTC, lead session `session_013VHsJ9SbWPe9YXRvtUSngc`)

Account 5 restored account 4's work without rebuilding or merging anything. **Lead branch now: `ccr-f983b317-2vt0zh`**
(started from `ccr-067047f0-up5d1m` @ `ffa54f9f`, its newest commit). If account 5 runs out, the next account repeats the
procedure below with `-c6` branches made from each `-c5` tip (take the NEWEST remote commit of every branch).

## Branch map (round 5; nothing merged, no -c4 or older branch written)
| Role | Branch | Started at (= newest -c4 tip, 20:15 UTC) | State |
|---|---|---|---|
| Lead | `ccr-f983b317-2vt0zh` | `ccr-067047f0-up5d1m` @ `ffa54f9fb514f92a7d6353767e2952df9145bc25` | this session |
| 08 scenery in motion | `claude/rainbow-s08-scenery-c5` | `5ce044a52d53c5dd6cfb71fd994a82e8647381a4` | RUNNING `session_013VHsJAQsMA73qb7GCXdQ12` (finish round 1, `docs/briefs/2026-11-17-r5/S08_SCENERY.md`) |
| 08 Benny | `claude/rainbow-s08-benny08-bake-c5` | `fb72cc5052df908b994afeb41e7f598abc24e18d` | RUNNING `session_013VHsJAoze5D4wh6tk7r1hj` (round 6 fur clumps + pom tufts, `S08_BENNY.md`) |
| 08 camera | `claude/rainbow-s08-camclear-c5` | `18687513e3a35e553472a05ae7fb626c2f8108ce` | paused (r4 done; phone verdict pending) |
| 07 | `claude/rainbow-s07-match-c5` | `835a72dbb5abad1067b538c79b1f759b06e2cbeb` | paused (next: M3) |
| 06 | `claude/rainbow-s06-match-c5` | `c088718bb9e3374583238f4ee93f25bdee600065` | paused (next: M2) |
| 05 (line B) | `claude/rainbow-s05-match-c5` | `ebaf6cac71812ad5c00a9088ba48b6febdb42b2b` | paused (next: M3) |
| 04 | `claude/rainbow-s04-match-c5` | `d1e422faff67a37f837566301fb8abff0bac98db` | paused (next: M4) |
The commits on the `-c4` tips after the account-4 handoff snapshot are transcript/backup files only (checked with
`git diff --stat`); no game file changed. Account 4's idle Benny session woke once (20:12 UTC, PR #17 check-in) and
stopped its check-ins. Per-workstream next tasks: unchanged from the ACCOUNT 4 section below.

## Restore audit (account 5, 20:05–20:35 UTC)
* 13/13 approved images byte-identical; 10/10 agent definitions present, SHA-256 unchanged.
* Git LFS: 63 distinct objects across the 8 tips (812 MB), all downloaded, `git lfs fsck` OK on all 8, 0 missing.
* Lead code: tsc clean; continuity joins gap 0; gameplay **8/8, 91 coins, 1,330 → 2,240**, 07→08 drop 61.4 u (default and
  `match08=1&coins08px=1`).
* `flowplan-test.mjs`: A and D FAILED twice in this container — test-harness race, not a game bug (Chromium 157 +
  SwiftShader: the page main thread is busy 8–11 s after `ready`, so the 2.5 s clip ended before the first read; probe:
  hold correct). Fix `227f319e`: A/D use a 20 s clip, assertions unchanged → **A–E pass, E = 91 / 2,240**.
* Tools: Node 22, Blender 5.3.0, Android SDK 34 + Java 21 + Gradle 8.2.1, Playwright Chromium **157** (account 4: 153),
  ffmpeg, ImageMagick, Python QA libs — all OK (bootstrap). context7 + design MCP servers fail to connect (optional).
* **Keys:** this account's `rainbow-` environment has a World Labs key that authenticates (free read **5,190** credits)
  but it is the user's OTHER World Labs account (it sees the Screen 05 pilot worlds; the Screen 08 world `32b5b2f4…` reads
  404). Account 4's key (5,420 credits, Screen 08 world) is NOT on this environment. fal.ai: RECONNECTED 20:40 UTC by the user via the secure form (host `queue.fal.run`, `Authorization: Key …`); free read of request `01a1ea70` → 200 COMPLETED = the SAME fal account. (Before that: no key
  and `queue.fal.run` blocked.) Neither blocks current work (no paid jobs approved).
* Launch trap seen again: both new sessions sat idle with no task until the brief was re-sent with `send_message`.

## Round 5 progress (~21:20 UTC) — the user's goal: every playable screen >= 95 % like its approved picture
* Evidence of the state: `qa/screen_videos/2026-11-17/COMPARISON.md` + `rainbow_all_screens_APPROVED_vs_NOW.mp4` (normal game
  4–19 %; newest test versions 79–89 % at the approved view; gaps = top bar, Benny on 04–07, coins, look lost while riding).
* User decisions 21:05 (`docs/briefs/2026-11-17-r5/USER_DECISIONS.md`): hud05 top bar to all screens; ONE combined preview
  branch **`claude/rainbow-preview-all-c5`** (line A + B allowed there only); focus 04–08; two sessions max.
* Preview branch built (7 merges, conflicts resolved by keeping both switch-guarded sides; water shader = line B's file
  whole — a hunk-wise merge made a broken GLSL hybrid). Verification and next steps: `backups/AGENTS_STATUS.json` →
  `round5_account5.preview_branch`. NOTE: this cloud checkout was shallow (72 commits): `git fetch --unshallow` before merging.
* Done on -c5: 08 scenery r1 `60e7ffe8` (kept `m08bw` + `m08fill`), 08 Benny r6 `c6892676` (`b08clump` + `b08yarn`).
  APK builds blocked in this environment (Maven Central 429 / 404).

## STATE AT THE USER'S "SAVE EVERYTHING" ORDER (2026-11-17 ~21:35 UTC) — read this first
* Lead `ccr-f983b317-2vt0zh` (this session) · combined preview `claude/rainbow-preview-all-c5` @ `69a1d474`+ · 08 scenery
  `claude/rainbow-s08-scenery-c5` @ `60e7ffe8` (round 1 DONE) · 08 Benny `claude/rainbow-s08-benny08-bake-c5` @ `c6892676`
  (round 6 DONE) · 07 / 06 / 05 / 04 / 08 camera `-c5` = their `-c4` tips (paused). No session running.
* Specialists' final reports: `docs/briefs/2026-11-17-r5/REPORTS_ROUND5.md`. All lead evidence (captures, metrics, clips,
  test runs, preview verification): `qa/lead_r5/2026-11-17/README.md`. All-screens video + comparison:
  `qa/screen_videos/2026-11-17/`.
* Preview branch: correct with each screen's own switches; NOT usable with all switches together (Screen 08 drops to
  29.5 %: its projected scene is shifted against the camera — cause not found; the user interrupted the bisect at 21:23
  and said stop). Exact next steps: `backups/AGENTS_STATUS.json` → `round5_account5.preview_branch.next`.
* APKs cannot be built in this environment right now (Maven Central 429 / 404 through the network proxy).

## Open lead question for the user — Screen 08 coins vs the ending video (`?flowplan=1`)
Under `?match08=1&coins08px=1` the 9 painted coins lie at s 396.1 / 400.1 (in 08) and 405.2 / 407.7 / 410.6 / 412.7 (09
stretch) + 3 more beyond s 418.5; the ending video starts at s 404.37 (start of 09). So Benny swims through 2 and the
video credits 7 (total stays 91 / 2,240). Do not change the hand-over rule without the user's approval.

---

# ACCOUNT 4 → NEXT ACCOUNT HANDOFF (2026-11-17 ~19:45 UTC, lead session `session_01Kbt6BTTnCGMUULjZoCLDTo`)

Written at the user's urgent backup order (account 4 near its usage limit). Everything below this section is OLDER
history. Repository **https://github.com/josiahscalia5-dev/rainbow-** (ONE repo, all branches). The SHAs below were
verified on GitHub at writing time; sessions of account 4 may still autosave transcripts afterwards — always take the
**newest** remote commit (`git ls-remote origin refs/heads/<branch>`), never an older one.

## ▶ PASTE THIS INTO THE NEXT CLAUDE ACCOUNT (one message)
> CLAUDIA — continue my EXISTING Rainbow game from GitHub (`josiahscalia5-dev/rainbow-`). Do NOT restart, redesign,
> rebuild, merge, force-push or delete anything. Lead branch to continue from: `ccr-067047f0-up5d1m` (newest commit).
> Read `CLAUDE.md`, then the TOP section of `docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md`, `docs/PARALLEL_PROGRESS.md` (ROUND 4),
> `docs/briefs/2026-11-17-r4/` (COMMON_RULES, USER_DECISIONS, one brief per workstream) and `docs/FLOW_VIDEO.md`.
> Do a read-only restore audit first (branch tips, 13 reference checksums, 10 agents, Git LFS fetch + fsck, tsc,
> gameplay 8/8, `node scripts/flowplan-test.mjs` A–E), reconnect my SAME World Labs + fal.ai keys only through the
> secure credential form if the free reads fail, then continue the seven specialist workstreams on NEW `-c5` branches
> (one per workstream, from each `-c4` tip), at most two sessions at a time. No paid jobs, no Google Flow generation.

## Branch map (8 branches to preserve; nothing merged)
| Role | Branch | Last verified full SHA (≈19:41 UTC) | State | Latest milestone |
|---|---|---|---|---|
| Lead (Claudia) | `ccr-067047f0-up5d1m` | see `docs/PARALLEL_PROGRESS.md` "Backup verification" (final) | this session | restore r4, flowplan test E + race fixes, decisions, briefs, coins08px verified, Screen 06 APK |
| 08 Benny | `claude/rainbow-s08-benny08-bake-c4` | `b619d701ff97964e7bc54082624dab32f08fee67` | idle, done | round 5b `0067fc7b`: r3b + fuller rounder body (user decision) |
| 08 camera | `claude/rainbow-s08-camclear-c4` | `a42140304915ea57d2d2c02493b066316207033b` | idle, done | round 4 `aa10fdbb`: drain-lip tilt 16°→1°, Benny hidden 44→25 %, missed coins fade |
| 08 scenery in motion | `claude/rainbow-s08-scenery-c4` | `a3f2a7065b8377bce15c06565c0290ef1c47149d` | stopped mid-round 1 (safe checkpoint) | `&m08bw=1` (visibly removes the lower-left tear / second river copy); `&m08lane=1` WIP |
| 07 Washer Tube | `claude/rainbow-s07-match-c4` | `133d06f3c6359530e5745d16abcea758215238e3` | idle, done | M2 `fd703ee1` |
| 04 Five Arrows | `claude/rainbow-s04-match-c4` | `d1e422faff67a37f837566301fb8abff0bac98db` | paused | M3 `a4644789` |
| 05 Flow (LINE B) | `claude/rainbow-s05-match-c4` | `ebaf6cac71812ad5c00a9088ba48b6febdb42b2b` | paused | M2 `a96bfdf4` |
| 06 Rinse Arch | `claude/rainbow-s06-match-c4` | `c088718bb9e3374583238f4ee93f25bdee600065` | paused | M1 `b993f6d5` |
Older protected branches (never write): every `-c3`, `-c2` and original workstream branch, `ccr-c0235034-ks6sx3`,
`ccr-5495e9c4-g0apvl`, `ccr-d4240b15-rl1i72`, `ccr-9c4a8ad6-xovgsx` (line A), `ccr-b0757dec-dj6l1o` (line B),
`codex/*`, `ccr-6f431adf-7h0m8y` (original). Draft PRs #16 (lead), #17 (Benny), #18 (07) and #2–#15: review only,
NEVER merge or close without the user.

## Per workstream: result → exact next task (briefs: `docs/briefs/2026-11-17-r4/S*.md`, user rules: `USER_DECISIONS.md`)
* **08 Benny** — r5b (`?match08=1` default): r3b + body ≈1.1× the brim width (approved ≈1.09×; body fur ×1.04, beanie
  ×0.94). Benny+splash 65.3 → 62.2 % (visual choice), scenery 97.3 %. Switches: r3b `b08full=0`, r4
  `b08hi=1&b08pom=1&b08full=0`, taper `b08shape=1` (opt-in, wrong direction), r2 `b08r3=0`. Pictures
  `qa/match/08/benny08/review_r5/final/` (1_APPROVED / 2_BEFORE_r3b / 3_NEW + moving). APK
  `builds/rainbow-debug-08benny-2026-11-17-r5b.apk`. **Next:** the painting's soft layered fur clumps + pom-pom yarn
  tufts (needs a new fur clump model or bake — parameter tweaks all measured worse); pale streaks by the left arm.
* **08 camera** — r4 (`?camclear=1`): see branch `qa/gameplay_video/STATUS.md`, frames `lip_r4/`, `moving_r4/`. APK
  `builds/rainbow-debug-08camclear-2026-11-17-r4.apk`. **Next:** wait for the user's phone verdict; the 07 bands are
  Screen 07 scenery; the right pipe/arch block belongs to the 08 scenery workstream.
* **08 scenery in motion** — stopped on the backup order with all new code behind switches (`src/world/match08.ts`):
  `&m08bw=1` = chamber entrance wall flush behind the gold arch, **visibly better** (removes the lower-left tear / second
  river copy at 6 u and when steering); `&m08lane=1` (implies m08bw) = near pipe + gold arch ×1.45 about the approved
  viewpoint, squared lower pipe → wider swim lane (geometry correct in debug colours, real-texture frames NOT rendered
  yet); `&m08dbg=1` = flat debug colours. Not yet proven 0 px. Its `qa/match/08/scenery/STATUS.md` + `NOTES.md` hold
  the exact next task. **Next:** render m08bw / m08lane with real textures, prove the approved view 0 px, then the
  remaining items: finish round 1 of `S08_SCENERY.md`: the projected picture tears /
  duplicates the river + wall at 6 u forward and when steering, a gold band fragment top-left, Benny rides into the right
  pipe/arch steering hard right, and `?match08=1` changes screens 04–07 over much of the frame (04 ≈510k px, 07 ≈560k
  px — must be 08-only). Fix with THE METHOD (projection only where valid + world-anchored tiles from the approved
  picture), approved fixed view unchanged.
* **08 coins (lead)** — `?match08=1&coins08px=1` = the USER-PREFERRED coin version (lives on the lead branch only).
  Verified: 8/8, 91 / 2,240, all 9 painted coins physically picked up even riding straight. Under `?flowplan=1` 7 of the
  9 lie past the 08→video hand-over (credited, not swum through).
* **07** — M2 kept `?match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1` (mirrored near-water diamond gone,
  doubled upper-left band gone, solid gold paddles, no gold smear steering right, far trail coins tidy); still view
  unchanged (scenery 95.55 %, whole 80.06 %). Pictures `qa/match/07/m2r4/pictures/`, moving `qa/match/07/m2r4/motion_k5/`.
  APK `builds/rainbow-debug-07-2026-11-17-r4.apk`. **Next (M3):** far coin row flatter than the painted line; near water
  while steering = repeating stream tile, less detail; purple perforated patches far off; thin slivers on far paddle
  sides at 10 u; passing paddle lower face purple at 20 u. Flag to re-check: protected 05 BEFORE differed from
  `qa/pilot05/wave9/baseline/05.png` by 32,280 px in the 07 container at its UNCHANGED start commit (pre-existing,
  probably machine rendering differences — verify in the lead container).
* **05 (line B, never merge with line A)** — M2: whole 89.44 %, scenery 93.7 %, water 96.5 %. APK
  `builds/rainbow-debug-05-2026-11-17-r3.apk`. **Next:** M3 per `S05.md` (coin-hole rings, right-wall bubble, lower-left
  gold frame bevel, wake water, moving checks). User priority among 04/05/06: **05 first**.
* **06** — M1: scenery 98.8 %, whole 79.1 %. APK built by the lead: `builds/rainbow-debug-06-2026-11-17-r3.apk` (lead
  branch). **Next:** M2 per `S06.md` (floor/river tile repetition while moving, tile-only river from ~10 u, far coin trail).
* **04** — M3: scenery 98.2 %, whole 81.8 %. APK `builds/rainbow-debug-04-2026-11-17-r3.apk`. **Next:** M4 per `S04.md`
  (hard water/wall edge at 15–20 u, ~4.7 u swirl-tile repeat, water flow along the painted streaks, coins at painted spots).
* **User's order of work:** 08 (Benny, camera, scenery) → 07 → 05 → 06 → 04, at most two sessions at once (usage).
  Nothing is approved; final approval only after full-size APPROVED / BEFORE / NEW + moving-view comparisons.

## How to restart the workstreams on the next account (exact procedure)
1. For each workstream create a NEW branch `<old>-c5` from the newest `-c4` tip (`git push origin <sha>:refs/heads/<new>`)
   — account 4's containers may keep autosaving to `-c4`; never write to the same branch from two accounts. Lead: the
   new session's own branch, started from the newest `ccr-067047f0-up5d1m` commit.
2. `create_session` per workstream (source_revision = outcome_branch = its `-c5` branch, same `rainbow-` style
   environment) with the text of its brief from `docs/briefs/2026-11-17-r4/` (replace `-c4` by `-c5` and the lead session
   id by the new lead's id). **Initial prompts were dropped twice on account 4:** check `list_events` (kinds user/assistant)
   after setup and re-send the task with `send_message` if the session sits idle with no conversation.
3. Max two sessions at a time; each finishes ONE milestone, pushes, verifies remote == HEAD, reports once, stops.

## Keys and paid services (never in git, chat or APKs)
* Secrets do NOT transfer between Claude accounts. On account 4 the `rainbow-` environment started with NO secrets
  (World Labs free read = HTTP 401); the user re-entered both through `request_credential`:
  - World Labs Marble: host `api.worldlabs.ai`, header `WLT-Api-Key`, no prefix.
  - fal.ai: host `queue.fal.run`, header `Authorization`, prefix `Key`. Downloads of fal results come from
    `v3.fal.media` / `v3b.fal.media` (add to the environment's allowed hosts only when a user-approved job needs them).
* Free verification reads (no credits): `python3 -I scripts/verify-assets.py worldlabs` (expect **5,420** credits; the two
  old Screen 05 pilot worlds return 404 — files are in Git LFS); `curl https://api.worldlabs.ai/marble/v1/worlds/32b5b2f4-32bc-4fa5-80a5-861129a528c8`
  → 200 (Screen 08 world = same account); `curl https://queue.fal.run/fal-ai/nano-banana-2/requests/01a1ea70-42d8-7943-b035-7bb5f129d872/status`
  → 200 COMPLETED (same fal account; the dollar balance is dashboard-only; the user bought $10).
* Scripts that read keys from variables: placeholders only — `WORLD_LABS_API_KEY=proxy-injected`, `FAL_KEY=proxy-injected`,
  `NODE_USE_ENV_PROXY=1`; the proxy injects the real header. Image-Blaster: `bash scripts/setup-image-blaster.sh`
  (+ `tools/imageblaster/image-blaster-local.patch`; not installed in account 4's lead container, only needed for paid jobs).
* Paid ledger: World Labs 7,000 → 5,420 (Screen 08 world, 1,580); fal: two Screen 08 edits + ONE Screen 04 clean plate
  (request `01a1ea70`, DONE — reuse `qa/match/04/fal/`). Screen 06 / 07 fal plates PREPARED, NOT approved, NOT run.
  No paid job ran on account 4.

## Google Flow plan (`docs/FLOW_VIDEO.md`)
01–03 opening video · 04–08 playable 3D · 09–11 ending video, behind `?flowplan=1` (default build unchanged; real-time
fallback scenes kept). `node scripts/flowplan-test.mjs` → A–E pass (E = full run with both videos = exactly 91 coins /
2,240). The user's real `public/video/intro.mp4` / `ending.mp4` are NOT in the repo yet; never generate videos.

## What could NOT be transferred (state it to the user)
Claude login and chat history (sanitized transcripts are autosaved under `backups/claude-sessions/`; this section is the
summary), live sessions and their containers (account 4's lead + 5 specialist sessions stay on account 4), environment
secrets and settings (re-enter keys; environment setup script = `scripts/cloud-env-setup.sh`), the optional World Labs
Atlas connector and context7 MCP (not needed). No APK has been tested on a real phone. Uncommitted edits inside account 4
containers after their last autosave (if any) are not recoverable.

---
# OLDER: RAINBOW — new Claude account handoff (written 2026-11-17 ~14:30 UTC, session 03b94f36)

Repository **https://github.com/josiahscalia5-dev/rainbow-** · branch **`ccr-9c4a8ad6-xovgsx`** · backup tag
**`backup/2026-11-17-screen08-transfer`** (checkpoint branch; GitHub tags are blocked from this session) (the verified commit; the branch may carry newer autosaves of this session's transcript).

## ▶ PASTE THIS INTO THE NEW CLAUDE ACCOUNT (one message)
> RAINBOW — continue my EXISTING game. Do NOT restart, redesign or rebuild it; do NOT merge or cherry-pick branches
> without asking me; never spend World Labs or fal.ai credits without naming the job + cost and getting my OK.
> 1. Repository `josiahscalia5-dev/rainbow-`: check out branch `ccr-9c4a8ad6-xovgsx` (checkpoint branch `backup/2026-11-17-screen08-transfer`
>    = last verified save) and work on your own session branch created from it.
> 2. Follow `CLAUDE.md`. Run `bash scripts/claude-bootstrap.sh --skip-resume`, then `bash scripts/setup-image-blaster.sh`,
>    then `sha256sum -c scripts/reference.sha256` (13 OK) and `python3 -I scripts/autosave-status.py`.
> 3. Read `docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md` (this file) fully, then `qa/match/08/NOTES.md`,
>    `qa/imageblaster/08/NOTES.md`, `backups/HANDOFF_2026-11-17_NEW_ACCOUNT.md`, `docs/FLOW_VIDEO.md`.
> 4. Set up the cloud environment and my two API keys exactly as section 5 of the handoff says (secure forms only — I
>    type the keys there, never in chat). Verify both with the free checks.
> 5. Give me the backup report of `CLAUDE.md` §4, then continue: Screen 08 is waiting for MY approval (do not mark it
>    approved); after I approve it, Phase 2 = the same method for Screens 04, 05, 06, 07 (fal clean plates approved,
>    one edit each, shown to me full-size first). Work on the VISUAL match of my approved screens; report in pictures
>    (APPROVED | BEFORE | NEW, separate full-size) + numbers.

## 1. The game (do not change without asking)
Benny (pink, fluffy, violet eyes, knitted purple-and-white star beanie) rides a magical washing-machine water course.
* **VIDEOS (Google Flow, made by the user):** 01 opening (girl carries laundry with Benny secretly hidden in the purple
  towel, loads it, closes the washer, walks away) · 02 whirlpool tumble · 03 Whirlpool Twirl · 09 final wave · 10 return
  to hiding · 11 ending (Benny hides back in the towel, the girl grabs it, unaware; loops to the opening).
  `docs/FLOW_VIDEO.md` has the story, rules and the existing video hand-off (`public/video/intro.mp4`, `ending.mp4` —
  not in the repo yet). Never rebuild videos as 3D, never generate video.
* **REAL PLAYABLE 3D (Android):** 04 Five Arrows · 05 Flow Into the Current · 06 Rinse Arch · 07 Washer Tube ·
  08 Final Spin Chamber. Goal: each looks like ITS approved picture (≥ 90 %, user hopes 95–100 %).
* Stack: Three.js r170 + TypeScript + Vite, Capacitor Android (`npm run android:debug`), Blender 5.3.0, Playwright.

## 2. The 13 approved images (never modify; `sha256sum -c scripts/reference.sha256`)
| # | File | Role | Status / latest measured likeness (share of pixels within 20 colour levels) |
|---|---|---|---|
| 1 | `references/01_inside_washer_girl_and_towel.png` | video (opening) | Flow video by the user |
| 2 | `references/02_mascot_tumbles_in_whirlpool.png` | video | game today 5.0 % (audit) |
| 3 | `references/03_whirlpool_twirl.png` | video | game today 8.8 % |
| 4 | `references/04_through_the_five_arrows.png` | **playable** | 6.4 % — Phase 2 |
| 5 | `references/05_flow_into_the_current.png` | **playable** | line B `?match05=1` 86.9 % whole frame (other branch, unmerged) — Phase 2 |
| 6 | `references/06_crest_the_rinse_arch.png` | **playable** | 5.0 % — Phase 2 |
| 7 | `references/07_dive_the_washer_tube.png` | **playable** | 6.7 % (camera/ring measurements exist, `qa/match/07/`) — Phase 2 |
| 8 | `references/08_final_spin_chamber.png` | **playable** | **`?match08=1`: scenery 97.4 %, whole frame 83.0 %** — WAITING FOR USER APPROVAL |
| 9 | `references/09_ride_the_final_wave.png` | video | 7.3 % |
| 10 | `references/10_slide_into_hiding.png` | video | 7.4 % |
| 11 | `references/11_safely_home_final_victory.png` | video (ending) | Flow video by the user |
| 12 | `character_references/official_cartoon_girl_original.jpg` | girl identity (videos) | reference only |
| 13 | `references/water/05_water_isolated_original.png` | 05 water artwork | used by the 05 projection |
Audit numbers: `qa/match/audit/*_metrics.json` (the current default game vs each picture).

## 3. Screen 08 — the successful method (keep it exactly)
`?match08=1` (default game unchanged, verified 0 px): camera solved to the approved view (`src/game/match.ts`,
`cameraRig.ts` off08/aim08) · river path follows the painted S-river (`course.ts`, `river08.json`) · real 3D proxy
geometry fitted to the picture (`src/world/match08.ts`, `tools/match08/fit_proxies.py` → `proj08.json`) · texture =
the user's ORIGINAL pixels + fal clean plate only where Benny/HUD/coins were removed (`plate08_hybrid.png`), camera-
projected with a post-chain inverse · unseen surfaces = tiles cut from the artwork (`patch_*.png`) + stretch guard ·
Benny: beanie 0.86×, white stripes, lifted 0.16 u, approved splash ring card (`splash08.*`) · the picture's 9 coins at
the painted spots, facing the camera, all collectible; coin total kept at 91 (2,240) · bloom off on 08.
Scores: scenery 97.4 % (SSIM 0.959), upper 98.9 %, middle 91.0 %, lower 99.2 %, Benny + splash **66.2 %** (Benny round,
2026-11-17 ~14:45: placed on the painted Benny, rounder body, stronger approved splash), whole frame **83.4 %** (BEFORE 4.0 %).
**User status: the METHOD is approved; Screen 08 itself is NOT approved — finish Benny's fur/knit detail first
(plan: `qa/match/08/NOTES.md` → BENNY ROUND → NEXT, port line B's benny05 bake as an 08 variant, never merge).** Gameplay test 8/8 both builds.
Remaining: Benny's fur/knit/pom surface detail (position + size now match); darker band at the lower-left edge 3–6 u
forward; coins wobble ±3°. APK `builds/rainbow-debug-match08-2026-11-17b.apk` (newest; `…-17.apk` = previous; Git LFS, built with
`VITE_RAINBOW_Q05="match08=1" npm run android:debug`) — **built, NOT yet tested on a real phone.** Details and
reproduction: `qa/match/08/NOTES.md`. **Not approved by the user yet.**

## 4. Image-Blaster, World Labs Marble, fal.ai — what was tried
* Image-Blaster (github.com/neilsonnn/image-blaster @ `4acb43ba`), rebuilt by `scripts/setup-image-blaster.sh`
  (clone, local patch `tools/imageblaster/image-blaster-local.patch`, bun install, placeholder `.env`, restores the 08
  project from `qa/imageblaster/08/`). Run its scripts with `NODE_USE_ENV_PROXY=1`.
* fal.ai: 2 paid edits (`nano-banana-2/edit`, 2K): clean plate (request `01a1e977-…`) and splash-crest cleanup
  (`01a1e98f-…`); records `qa/imageblaster/08/fal_requests/`, images + comparisons in `qa/imageblaster/08/`.
* Marble: world `32b5b2f4-32bc-4fa5-80a5-861129a528c8` (marble-1.1, op `0de603c2-…`, 1,580 credits, 2026-11-17) from the
  clean plate — all assets in `qa/imageblaster/08/world/` (splats 100k/150k/500k/full_res, collider GLB, pano,
  thumbnail, JSON; Git LFS). RESULT: wrong layout (long tunnel, 6.4 % match) → **do not use Marble for the gameplay
  views**; earlier 05 worlds in `qa/worldlabs/05/`. Credit ledger `qa/worldlabs/05/pilot/LEDGER.md`; balance at
  handoff **5,420** World Labs credits (free read); fal balance: see the user's fal dashboard (≈ $10 top-up minus 2 edits).

## 5. Credentials and network (never in files; per Claude account)
Claude-environment network secrets are stored per environment of ONE Claude account; there is no supported way for
this session to share an encrypted secret store across two Claude accounts. On the new account:
1. claude.ai → connect GitHub + install the Claude GitHub App on `josiahscalia5-dev/rainbow-`.
2. Create a personal cloud environment (name e.g. `rainbow-`): network limited, package managers + MCP servers allowed,
   allowed hosts `download.blender.org`, `dl.google.com`, `lfs.github.com`, `cdn.marble.worldlabs.ai`, `v3.fal.media`,
   `v3b.fal.media`; setup script = contents of `scripts/cloud-env-setup.sh` (Claude can propose this; you approve).
3. Keys through the secure credential form only (Claude calls `request_credential`): host `api.worldlabs.ai`, header
   `WLT-Api-Key` (no prefix); host `queue.fal.run`, header `Authorization`, prefix `Key`. Use the SAME World Labs and
   fal accounts' keys (same balances). Saving a key also allows its host. No auto top-up.
4. Free checks: `curl -sS https://api.worldlabs.ai/marble/v1/credits` (expect remaining_credits) ·
   `curl -sS -o /dev/null -w '%{http_code}' https://queue.fal.run/fal-ai/nano-banana-2/requests/00000000-0000-0000-0000-000000000000/status` (404 = accepted, 401/403 = key problem).
5. Node scripts that call these APIs need `NODE_USE_ENV_PROXY=1`; placeholder env vars `WORLD_LABS_API_KEY`/`FAL_KEY` =
   `proxy-injected` (the proxy overwrites the header).

## 6. Branches
`ccr-9c4a8ad6-xovgsx` (this, line A, newest: Screen 08 method, Screen 07 measurements, audit) · `ccr-61131b9d-uj0oqb`
(older state of line A, protected) · **line B `ccr-b0757dec-dj6l1o`** (big Screen 05 full-reference match, 86.9 %; was
still being extended by its own session) — never merged; the user decides (procedure in
`backups/HANDOFF_2026-11-17_NEW_ACCOUNT.md` §1) · `codex/*` never merge.

## 7. Agents, tools, autosave
* 10 specialists in `.claude/agents/` (android-build-performance, animation-and-gameplay-engineer,
  benny-character-artist, cartoon-girl-character-artist, foam-bubbles-particles, path-camera-transition-engineer,
  playwright-visual-qa, reference-match-director, washer-environment-modeler, water-fx-specialist); none running; states
  in `backups/AGENTS_STATUS.json`. No project-level skills (`.claude/skills/` not used); plugins listed in
  `backups/TOOL_MANIFEST.json` (superpowers, playwright, worldlabs, …) are installed per account.
* Tools: `scripts/claude-bootstrap.sh` (Blender 5.3.0, Android SDK 34, npm, Python libs, Playwright check, LFS, tests,
  autosave), `scripts/setup-image-blaster.sh`, `tools/match08/` (camera probe/solve, proxy fit, river/coin projection,
  motion test), `tools/imageblaster/` (pano fit, Spark splat renderer, plate comparison), `tools/qa/screen_match.py`.
* Five-minute autosave: `scripts/rainbow-autosave.py` + daemon, re-armed by the SessionStart/Stop hooks of the repo
  (`.claude/settings.json`). It does NOT run while no session is open. Check `python3 -I scripts/autosave-status.py`.

## 8. What transfers / what does not
* Fully backed up on GitHub (+ Git LFS): code, assets, APKs, Marble worlds, fal images, QA pictures/metrics, docs,
  agents, scripts, sanitized transcripts of every session (`backups/claude-sessions/`, index
  `backups/CONVERSATION_INDEX.md`).
* Restored automatically by scripts: tools (bootstrap), Image-Blaster workspace, autosave.
* Cannot transfer: Claude login and chat history (export it from claude.ai → Settings → Privacy → Export data; the
  sanitized transcripts above are the in-repo record), GitHub connection, cloud environment + its network secrets (API
  keys), running processes, connectors (World Labs Atlas), plugins.

## 9. Next steps (in order)
1. Restore + backup report (prompt above). 2. User reviews Screen 08 (and the APK on a phone). 3. If asked: Benny body
width/position, lower-left band. 4. Phase 2: fal clean plates for 04, 05, 06, 07 (one edit each, approved), then the
Screen 08 method per screen (camera solve → geometry fit → hybrid texture → coins → Benny → motion test → APK).
5. Line B merge decision for 05 (user).

## 10. Restore test (2026-11-17 ~14:25 UTC, fresh clone from GitHub into an empty folder)
Clone of `ccr-9c4a8ad6-xovgsx` OK · Git LFS pull of the APK, the Screen 08 Marble world (4 splats, collider GLB, pano,
thumbnail), the match08 textures and the 05 full-world splats: 10/10 files byte-identical to their LFS records ·
13/13 approved images OK · 10 agents present · `scripts/setup-image-blaster.sh` rebuilt Image-Blaster (pinned commit,
patch, bun install) and restored the 08 world files · `npm ci` + `tsc` clean · no API key text in any tracked file.
Not tested here: a different Claude account (needs the manual steps of §5) and a real Android phone.

## 11. Install + test the APK on an Android phone (not done yet — no phone in the cloud)
1. On GitHub open `builds/rainbow-debug-match08-2026-11-17b.apk` on branch `ccr-9c4a8ad6-xovgsx` → **Download** (LFS
   file, ~21 MB). Or with a computer: `git lfs pull --include=builds/rainbow-debug-match08-2026-11-17b.apk`.
2. Phone: Settings → Security/Apps → allow "Install unknown apps" for your browser/files app; open the APK → Install.
   (Computer + USB debugging: `adb install -r builds/rainbow-debug-match08-2026-11-17b.apk`.)
3. Play through to 08 · FINAL SPIN CHAMBER (this APK has the Screen 08 switch built in). Check: the chamber looks like
   the approved picture, Benny rides the S-river, coins collect, frame rate feels smooth, no crash.
4. Report back (screenshot from the phone helps). Only then may the Android test be called passed.
