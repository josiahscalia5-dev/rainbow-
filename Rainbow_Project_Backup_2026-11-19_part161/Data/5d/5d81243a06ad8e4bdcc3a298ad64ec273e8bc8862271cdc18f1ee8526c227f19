# Rainbow session — session 5da1976e-e37f-577a-8581-540689c95ad9

### 🧑 User — 2026-11-17T16:40:43.937Z

You are the SCREEN 04 workstream agent (04 · THROUGH THE FIVE ARROWS) of the RAINBOW game — my EXISTING Android game. Do NOT restart, redesign or rebuild anything; never discard earlier work. Lead coordinator = session `session_01VCMXob2ipUeLE1o7yXNSsZ` (branch `ccr-5495e9c4-g0apvl`).

Your branch: **`claude/rainbow-s04-match-c2`**, continued from `claude/rainbow-s04-match` @ `e0bad9c` or newer (line A). Push ONLY `claude/rainbow-s04-match-c2`. Never merge, cherry-pick, force-push, reset or rebase.

FIRST read the binding common rules: `git fetch origin ccr-5495e9c4-g0apvl && git show FETCH_HEAD:docs/briefs/2026-11-17-r2/COMMON_RULES.md`. Then read `CLAUDE.md`, `docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md`, `qa/match/08/NOTES.md` (THE METHOD), and YOUR existing work: `qa/match/04/STATUS.md`, `NOTES.md`, `FAL_PLATE_REQUEST.md`, `SHARED_CHANGES.md`, `src/world/match04.ts`, `tools/match04/`, `assets/textures/match04/`.

## What already exists
* MILESTONE 1 (commit `8c1732b`): `?match04=1` — approved camera solved, real 3D proxies fitted (gold-ring tunnel, mouth ring, room wall, water plane, end cap), my ORIGINAL pixels projected with the inverse post chain + projector depth test + stretch guard, the picture's 5 coins as real pickups (91 / 2,240 kept). Scenery 5.1 % → **97.6 %** within 20 levels (SSIM 0.967), whole frame 6.4 % → 79.9 %, Benny area 16.5 %.
* MILESTONE 2 had started when the previous account stopped: `tools/match04/make_tiles04.py`, `assets/textures/match04/tile_tunnel.png`, `tiles04.json` (ring-structured tunnel tiles) were written and autosaved, its last step unwrapped the tunnel and the water along the depth axis — NOT yet wired in or measured. Read the autosave commits after `c55c4b2` to see exactly what was saved.

## Your milestone (MILESTONE 2)
1. **Smeared gold tunnel surfaces** while moving (10–20 u forward): finish the ring-structured tunnel tiles (reuse what is saved) and wire them into the stretch guard so the deep tunnel shows real gold-ring structure — no smears, no mirrored copies.
2. **Mirrored water under/around Benny** while riding: replace the mirrored tiles with painted water that continues the approved streaks and glowing chevron arrows (match08 / projnear05 near-tile approach), anchored to the world.
3. **Moving-camera distortions**: BEFORE (milestone 1) vs NEW frames at 3/6/10/15/20 u + steering left/right, full size; the approved view itself must not get worse (re-measure).
4. **The ONE fal clean plate** (paid, previously authorised by me): it has NOT run yet (FAL_PLATE_REQUEST.md says PREPARED, NOT RUN). Run it ONLY when ALL hold: (a) the lead has messaged you "FAL READY" (key + download hosts set on the environment); (b) you re-checked that no Screen 04 fal request record exists anywhere (`qa/imageblaster/**`, `qa/match/04/**`, Image-Blaster `worlds/*04*`); (c) exactly ONE `fal-ai/nano-banana-2/edit` 2K call with the prepared prompt (one retry only if the result redraws rings/porthole/towels — say so). Image-Blaster: `bash scripts/setup-image-blaster.sh`, `NODE_USE_ENV_PROXY=1`, `FAL_KEY=proxy-injected`. Save the request record + result under `qa/match/04/fal/` (PNG via Git LFS), composite ONLY inside `plate04_fillmask.png`, re-measure. Without "FAL READY": skip this item; the provisional fill stays.
5. If time allows: the approved splash under Benny as a card (like splash08), cut from the approved picture.
Benny: compare with `?benny08=1` for information only; you never edit Benny.

## Coordination
Your files: `src/world/match04.ts`, `assets/textures/match04/`, `tools/match04/`, `qa/match/04/`. Shared files only switch-guarded and listed in `SHARED_CHANGES.md`. The Screen 08 camera specialist (`claude/rainbow-s08-camclear-c2`) owns view obstructions under `?camclear=1` (my video: 04 at 7–10 s white sheet / pink wall) — don't duplicate it; make sure your geometry never puts rings/walls between the view and Benny while riding 04. When done: push, verify, send the lead ONE short status with `send_message` (session_id `session_01VCMXob2ipUeLE1o7yXNSsZ`) and stop and wait.

### 🤖 Claude — 2026-11-17T16:40:48.006Z

> 🔧 **Bash** `{"command": "git fetch -q origin ccr-5495e9c4-g0apvl && git show FETCH_HEAD:docs/briefs/2026-11-17-r2/COMMON_RULES.md; git log --oneline -15; git status --short | head", "description": "Read common rules and recent history"}`

### 🧑 User — 2026-11-17T16:40:48.546Z

> ↩︎ result: # RAINBOW — common rules for every parallel workstream (round 2, account 2, 2026-11-17 ~16:35 UTC)
> 
> Lead coordinator ("Lead Claudia"): session `session_01VCMXob2ipUeLE1o7yXNSsZ` ("Rainbow Android game parallel
> restoration"), branch `ccr-5495e9c4-g0apvl` (continuation of the lead branch `ccr-d4240b15-rl1i72`). It owns
> integration, shared systems, credentials, paid-job gating and `docs/PARALLEL_PROGRESS.md`.
> 
> ## Why continuation branches (`…-c2`)
> The previous Claude account stopped at ~16:01 UTC ("5-hour limit, resets 8:20pm UTC"). Its sessions (lead
> `session_01AvQv6UXiBngewM8kSBwFfZ`, 04 `…UQ9kzB2yfcESLZjUB`, 05 `…ShfugNq5opq6Bd1MX`, 06 `…SAwTuXwWRiSwgKaoH`,
> 07 `…SiGdDhWH1exHdH8xX`) may wake up after 20:20 UTC and their containers still autosave to the OLD branches. Every new
> workstream therefore continues on its OWN continuation branch, created from the newest remote commit of its old branch
> (which already contains every earlier checkpoint). Push ONLY your continuation branch. If the old branch receives newer
> commits later, report it to the lead — never merge them.
> 
> ## Startup
> 1. Follow `CLAUDE.md`. The SessionStart bootstrap already ran: `bash scripts/claude-bootstrap.sh --status` …[+5873 chars]

### 🤖 Claude — 2026-11-17T16:40:51.412Z

> 🔧 **Bash** `{"command": "git branch --show-current; git ls-remote origin refs/heads/claude/rainbow-s04-match-c2 refs/heads/claude/rainbow-s04-match; git rev-parse HEAD; python3 -I scripts/autosave-status.py | tail -3; sha256sum -c scripts/reference.sha256 | grep -c OK; git show --stat 359e324 | head -20; bash scripts/claude-bootstrap.sh --status 2>&1 | tail -15", "description": "Verify branch, autosave, references, bootstrap status"}`

### 🧑 User — 2026-11-17T16:40:54.048Z

> ↩︎ result: claude/rainbow-s04-match-c2
> e0bad9cc1bacf81c0d9a78d02a8e587689bb0652	refs/heads/claude/rainbow-s04-match
> 359e3247e7a80b548a702ffdf44e8cf61fca1b11	refs/heads/claude/rainbow-s04-match-c2
> 359e3247e7a80b548a702ffdf44e8cf61fca1b11
> AUTOSAVE OK | branch claude/rainbow-s04-match-c2 | scheduler daemon | last verified backup 2026-11-17T16:40:43+00:00 (0.1 min ago) | local 359e324 remote 359e324 (match) | uncommitted 0
> 13
> commit 359e3247e7a80b548a702ffdf44e8cf61fca1b11
> Author: Claude <noreply@anthropic.com>
> Date:   Tue Nov 17 16:40:47 2026 +0000
> 
>     autosave: Rainbow 2026-11-17 16:40 UTC
>     
>     Automated Rainbow backup (daemon). 4 file(s) changed.
>     Transcripts: refreshed (repo verified private)
>     
>     Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
>     Claude-Session: https://claude.ai/code/session_01VCMXoZnQahSncyyVnBsDQS
> 
>  backups/CONVERSATION_INDEX.md                                         | 1 +
>  backups/MANIFEST.json                                                 | 4 ++--
>  .../5da1976e-e37f-577a-8581-540689c95ad9/transcript.md                | 2 ++
>  .../5da1976e-e37f-577a-8581-540689c95ad9/transcript.sanitized.jsonl   | 1 +
>  4 files changed, 6 insertions(+), 2 deletions( …[+2204 chars]

### 🤖 Claude — 2026-11-17T16:40:54.855Z

Setup is good. Now my existing work.

### 🤖 Claude — 2026-11-17T16:40:56.506Z

> 🔧 **Bash** `{"command": "ls qa/match/04 tools/match04 assets/textures/match04; cat qa/match/04/STATUS.md; cat qa/match/04/SHARED_CHANGES.md; wc -l src/world/match04.ts tools/match04/*; git log --stat --format='%h %s' c55c4b2..e0bad9c -- tools/match04 assets/textures/match04 src qa/match/04 | head -60", "description": "Inspect existing Screen 04 work"}`

### 🧑 User — 2026-11-17T16:40:56.560Z

> ↩︎ result: assets/textures/match04:
> cam04_locked.json
> coins04.json
> patch_gold.png
> patch_wall.png
> patch_water.png
> plate04.json
> plate04_fillmask.png
> plate04_hybrid.png
> proj04.json
> tile_river.png
> tile_tunnel.png
> tiles04.json
> 
> qa/match/04:
> 04_APPROVED.png
> 04_BEFORE_current_game.png
> 04_BEFORE_current_game_864x1536.png
> 04_NEW_match04.png
> 04_NEW_match04_864x1536.png
> 04_NEW_screen_match.json
> FAL_PLATE_REQUEST.md
> NOTES.md
> SHARED_CHANGES.md
> STATUS.md
> gameplay_test_match04.json
> motion
> scenery_metrics_BEFORE_NEW.json
> 
> tools/match04:
> bennypts04.mjs
> coins04.py
> fit_proxies04.py
> make_plate04.py
> make_tiles04.py
> metrics04.py
> motion04.mjs
> probe04.mjs
> solve_cam04.py
> # Screen 04 — STATUS
> 
> * **Assigned screen:** 04 · Through the Five Arrows (`?match04=1`)
> * **Active agent:** Screen 04 workstream session (Claude Code, branch below); lead = session_01AvQv6UXiBngewM8kSBwFfZ
> * **Git branch:** `claude/rainbow-s04-match` (from `ccr-9c4a8ad6-xovgsx` @ 752d6d8, line A; nothing merged)
> * **Completed work (milestone 1):** approved camera solved at FOV 62 (Benny box + vanishing point, < 0.2 px); real 3D
>   proxy geometry fitted to the picture (gold-ring tunnel, mouth ring, room wall, water plane, end cap); the user's
>   ORIGIN …[+4165 chars]

