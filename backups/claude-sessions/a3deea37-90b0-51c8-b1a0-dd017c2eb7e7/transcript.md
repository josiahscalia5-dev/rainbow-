# Rainbow session — session a3deea37-90b0-51c8-b1a0-dd017c2eb7e7

### 🧑 User — 2026-11-17T16:41:23.986Z

You are the SCREEN 07 workstream agent (07 · DIVE THE WASHER TUBE) of the RAINBOW game — my EXISTING Android game. Do NOT restart, redesign or rebuild anything; never discard earlier work. Lead coordinator = session `session_01VCMXob2ipUeLE1o7yXNSsZ` (branch `ccr-5495e9c4-g0apvl`).

Your branch: **`claude/rainbow-s07-match-c2`**, continued from `claude/rainbow-s07-match` @ `49cf414` or newer (line A = `ccr-9c4a8ad6-xovgsx` @ `752d6d8` + autosaves; the previous account's Screen 07 session stopped right after reading its brief — no new Screen 07 game work exists yet). Push ONLY `claude/rainbow-s07-match-c2`. Never merge, cherry-pick, force-push, reset or rebase.

FIRST read the binding common rules: `git fetch origin ccr-5495e9c4-g0apvl && git show FETCH_HEAD:docs/briefs/2026-11-17-r2/COMMON_RULES.md`. Then read `CLAUDE.md`, `docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md`, `qa/match/NOTES.md` (per-screen switch rules, MATCH_CAM table; audit: 07 today 6.7 %, "purple tunnel with gold rings, tall white foam walls, close big Benny"), the EXISTING Screen 07 measurements in `qa/match/07/` (`cam/` best-fit render + Benny boxes, `rings/` approved ring fits, `geo_match07.json` — reuse them, don't redo them), `qa/match/08/NOTES.md` (THE METHOD), `qa/imageblaster/08/NOTES.md`, `src/world/match08.ts`, `src/game/match.ts`, `tools/match08/*`, `tools/qa/screen_match.py`. Screen 04's milestone-1 implementation (read-only: `git show origin/claude/rainbow-s04-match:src/world/match04.ts`) is a second worked example.

## Your milestone (MILESTONE 1)
`?match07=1`: my approved picture `references/07_dive_the_washer_tube.png` reproduced in the REAL playable 3D game with the Screen 08 method: exact camera solve at the game's FOV → real 3D proxy geometry fitted to the picture (purple tunnel, gold rings to a bright end, paddles upper-left, tall white foam walls, the S-river) → my ORIGINAL pixels camera-projected (post-chain inverse as in match08) → unseen surfaces from tiles cut from the artwork + stretch guard (build ring-structured tiles from the start — Screen 04 found smeared tunnel interiors at 10–20 u forward) → river path following the painted water → the picture's coins at the painted spots (real pickups; run total exactly 91 / 2,240) → moving-camera + steering check. **Screen 07 ends in the huge 07→08 downward tube drop into Screen 08 (verticalDrop ≈ 61 u; continuity test all joins gap 0): never break that transition and never change Screen 08 under `?match08=1`** — show frames of the start of the drop with and without `match07=1`. Where Benny / HUD / title / coins must be removed from the texture, use a PROVISIONAL local fill and prepare — but DO NOT run — one fal `nano-banana-2/edit` clean-plate request in `qa/match/07/FAL_PLATE_REQUEST.md`. No Marble for gameplay views.
Deliver APPROVED | BEFORE | NEW full size, numbers (whole frame, scenery without HUD/Benny, bands, SSIM), moving frames (3/6/10/20 u + steering + start of the 07→08 drop), `qa/match/07/NOTES.md`, `STATUS.md`, `SHARED_CHANGES.md`, APK with `match07=1` if clearly closer.

## Coordination
Your files: `src/world/match07.ts`, `assets/textures/match07/`, `tools/match07/`, `qa/match/07/` (keep the existing files). Shared files (`src/game/match.ts` — ONE MATCH_CAM line, `cameraRig.ts`, `course.ts`, `Game.ts`, `coins.ts`): minimal edits that run only when `match07` is on, listed in `SHARED_CHANGES.md`. NEVER touch Benny (use `?benny08=1` only to view the ported look), HUD, gameplay rules, Screen 05/08 files, references, protected branches. The Screen 08 camera specialist (`claude/rainbow-s08-camclear-c2`) fixes the view obstructions from my video (07 at 33–36 s: a gold ring band filling the frame; the 07→08 transition) under `?camclear=1` — don't duplicate it; make sure your fitted geometry never puts rings/walls/foam between the view and Benny while riding 07, and report conflicts to the lead. Proofs: default 0 px (captures 06, 07, 08), `?match08=1` on 08 0 px, `?ringa=26&nearfloor05=0` vs `qa/pilot05/wave9/baseline/05.png` 0 px, continuity unchanged, gameplay 8/8 with and without `match07=1`, tsc clean. When done: push, verify, send the lead ONE short status with `send_message` (session_id `session_01VCMXob2ipUeLE1o7yXNSsZ`) and stop and wait.

### 🤖 Claude — 2026-11-17T16:41:26.675Z

> 🔧 **Bash** `{"command": "git log --oneline -3 && git status --short | head && git fetch origin ccr-5495e9c4-g0apvl 2>&1 | tail -1 && git show FETCH_HEAD:docs/briefs/2026-11-17-r2/COMMON_RULES.md", "description": "Show git state and read common rules"}`

### 🧑 User — 2026-11-17T16:41:27.402Z

> ↩︎ result: 49cf414 autosave: Rainbow 2026-11-17 16:22 UTC
> 5e0c0c8 autosave: Rainbow 2026-11-17 16:18 UTC
> f9c0c22 autosave: Rainbow 2026-11-17 16:11 UTC
>  M backups/CONVERSATION_INDEX.md
> ?? backups/claude-sessions/a3deea37-90b0-51c8-b1a0-dd017c2eb7e7/
>    4522ba2..589f074  ccr-5495e9c4-g0apvl -> origin/ccr-5495e9c4-g0apvl
> # RAINBOW — common rules for every parallel workstream (round 2, account 2, 2026-11-17 ~16:35 UTC)
> 
> Lead coordinator ("Lead Claudia"): session `session_01VCMXob2ipUeLE1o7yXNSsZ` ("Rainbow Android game parallel
> restoration"), branch `ccr-5495e9c4-g0apvl` (continuation of the lead branch `ccr-d4240b15-rl1i72`). It owns
> integration, shared systems, credentials, paid-job gating and `docs/PARALLEL_PROGRESS.md`.
> 
> ## Why continuation branches (`…-c2`)
> The previous Claude account stopped at ~16:01 UTC ("5-hour limit, resets 8:20pm UTC"). Its sessions (lead
> `session_01AvQv6UXiBngewM8kSBwFfZ`, 04 `…UQ9kzB2yfcESLZjUB`, 05 `…ShfugNq5opq6Bd1MX`, 06 `…SAwTuXwWRiSwgKaoH`,
> 07 `…SiGdDhWH1exHdH8xX`) may wake up after 20:20 UTC and their containers still autosave to the OLD branches. Every new
> workstream therefore continues on its OWN continuation branch, created from the newest remote commit of  …[+5455 chars]

### 🤖 Claude — 2026-11-17T16:41:29.252Z

> 🔧 **Bash** `{"command": "git branch --show-current && git ls-remote origin refs/heads/claude/rainbow-s07-match-c2 refs/heads/claude/rainbow-s07-match; bash scripts/claude-bootstrap.sh --status 2>&1 | tail -30; sha256sum -c scripts/reference.sha256 2>&1 | grep -c OK", "description": "Check branch, bootstrap status, reference hashes"}`

### 🧑 User — 2026-11-17T16:41:30.120Z

> ↩︎ result: claude/rainbow-s07-match-c2
> 49cf4149f55d3a82000c4390676b28bc0e96270b	refs/heads/claude/rainbow-s07-match
> Generated 2026-11-17 16:04 UTC by `scripts/claude-bootstrap.sh` (mode `background`) on branch `claude/rainbow-s07-match`.
> The commit that contains this file is the backup itself, so its SHA is not written here; use `git log -1 -- backups/BOOTSTRAP_REPORT.md`.
> 
> | Step | Result | Details | s |
> |---|---|---|---|
> | Repository + branch | OK | josiahscalia5-dev/rainbow- on claude/rainbow-s07-match @ 752d6d8 (session started from ccr-9c4a8ad6-xovgsx) | 0 |
> | Resume newest work | WARN | 19/32 remote ccr-*/claude/* branches contained in HEAD 752d6d8; not merged (automatic merge disabled (use --resume only with the user's OK)): run bash scripts/claude-bootstrap.sh | 109 |
> | Backup gap since last session | OK | previous save on GitHub: c75346f 2026-11-17 16:01 UTC (daemon) on claude/rainbow-s06-match; previous session ended WITHOUT an end-of-session backup (its environment closed after an automatic save); 18 gap(s) > 10 min in the last 72 h of the autosave log, longest 11-16 03:22-09:28 UTC (6.1 h) | 0 |
> | Git LFS binaries (local) | OK | 44/44 real files (models, APK, kit ZIP, Marble splat …[+3133 chars]

### 🤖 Claude — 2026-11-17T16:41:31.933Z

> 🔧 **Bash** `{"command": "git log --oneline -2 && git push -u origin claude/rainbow-s07-match-c2 2>&1 | tail -2 && git ls-remote origin refs/heads/claude/rainbow-s07-match-c2 && git rev-parse HEAD", "description": "Push continuation branch and verify"}`

### 🧑 User — 2026-11-17T16:41:33.013Z

> ↩︎ result: 3c7fca9 autosave: Rainbow 2026-11-17 16:41 UTC
> 49cf414 autosave: Rainbow 2026-11-17 16:22 UTC
> Everything up-to-date
> branch 'claude/rainbow-s07-match-c2' set up to track 'origin/claude/rainbow-s07-match-c2'.
> 3c7fca9921f699f2862b31b6ac25961fa7c7bd5f	refs/heads/claude/rainbow-s07-match-c2
> 3c7fca9921f699f2862b31b6ac25961fa7c7bd5f

### 🤖 Claude — 2026-11-17T16:41:33.919Z

Branch is live. Now reading the method docs and existing Screen 07 data.

### 🤖 Claude — 2026-11-17T16:41:35.322Z

> 🔧 **Bash** `{"command": "ls qa/match/ qa/match/07 qa/match/07/* | head -60; wc -l qa/match/NOTES.md qa/match/08/NOTES.md qa/imageblaster/08/NOTES.md src/world/match08.ts src/game/match.ts tools/match08/* tools/qa/screen_match.py docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md", "description": "List match folders and file sizes"}`

### 🧑 User — 2026-11-17T16:41:35.361Z

> ↩︎ result: qa/match/07/geo_match07.json
> 
> qa/match/:
> 06
> 07
> 08
> NOTES.md
> audit
> 
> qa/match/07:
> cam
> geo_match07.json
> rings
> 
> qa/match/07/cam:
> approved_before_bestfit_halfres.png
> benny_boxes_v1.txt
> benny_mask_debug.png
> best_fit_render.png
> bmask_debug.mjs
> fit_largest_blob.json
> 
> qa/match/07/rings:
> approved.json
> approved.png
> guess_approved.json
>    55 qa/match/NOTES.md
>   160 qa/match/08/NOTES.md
>   162 qa/imageblaster/08/NOTES.md
>   230 src/world/match08.ts
>    38 src/game/match.ts
>    14 tools/match08/bennytree.mjs
>     7 tools/match08/coinlat.mjs
>    10 tools/match08/cointake.mjs
>   102 tools/match08/fit_proxies.py
>    28 tools/match08/motion08.mjs
>    26 tools/match08/probe08b.mjs
>     0 tools/match08/river_centre_px_approved08.json
>    11 tools/match08/river_proj.py
>    61 tools/match08/solve08.mjs
>    55 tools/qa/screen_match.py
>   142 docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md
>  1101 total

