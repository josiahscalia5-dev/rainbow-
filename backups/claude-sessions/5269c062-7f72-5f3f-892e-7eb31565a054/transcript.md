# Rainbow session — session 5269c062-7f72-5f3f-892e-7eb31565a054

### 🧑 User — 2026-11-17T19:18:43.006Z

Your full brief is below and is also saved at docs/briefs/2026-11-17-r4/S07.md on the lead branch (git fetch origin ccr-067047f0-up5d1m && git show FETCH_HEAD:docs/briefs/2026-11-17-r4/S07.md). Read docs/briefs/2026-11-17-r4/COMMON_RULES.md and docs/briefs/2026-11-17-r4/USER_DECISIONS.md from the lead branch first — startup check, usage rules and the user's decisions.

You are the SCREEN 07 workstream agent (07 · DIVE THE WASHER TUBE) of the RAINBOW game — the user's EXISTING Android game. Do NOT restart, redesign or rebuild anything; never discard earlier work. Lead = session `session_01Kbt6BTTnCGMUULjZoCLDTo` (branch `ccr-067047f0-up5d1m`).

Your branch: `claude/rainbow-s07-match-c4`, continued from `claude/rainbow-s07-match-c3` @ `72fb6129` (line A). Push ONLY your `-c4` branch. Startup check per COMMON_RULES (branch, push -u, remote == HEAD, autosave OK, 13 refs OK; record the start SHA in STATUS.md).

The user's words (19:00 UTC): finish Screen 07's water, foam, gold rings, coin positions and moving-view problems; preserve the 07→08 transition. Final quality = how it looks while Benny swims forward and steers, not only the still approved view.

Then read the r3 and r2 COMMON_RULES and `docs/briefs/2026-11-17-r3/S07.md` (same lead branch), `CLAUDE.md`, `qa/match/08/NOTES.md` (THE METHOD) and your saved work: `qa/match/07/STATUS.md` (M1), `qa/match/07/m2/`, `src/world/match07.ts`, `tools/match07/`, `assets/textures/match07/`, and the round-3 milestone-2 commits `b0941b3b` (switches `m07fill` / `m07ang` + coin probe tool) and `a5d2b392` (`m07fill` river tile instead of mirrored fill on the water, `m07ang` picture only near the approved view direction, `m07gold` solid rounded gold paddles — moving frames + metrics) and autosave `72fb6129` (`qa/match/07/m2/coins/probe_m1.json`).

Where round 3 stopped (account 3 ran out at ~18:13 UTC, MILESTONE 2 half done):
* M1 verified: whole 6.7 → 80.1 %, scenery 6.0 → 95.5 % within 20, 07→08 drop intact, 8/8, 91 / 2,240, APK r3.
* M2: three switches written with moving frames + metrics (`a5d2b392`); the coin step had just started (probe of the M1 coins vs the painted spots). `STATUS.md` still describes M1 ("M2 not started") — stale.
* Camera specialist r4 (19:13 UTC) measured that the gold bands crossing the upper screen while riding 07 are the 07 tube's own big rings 14–45 u ahead — i.e. Screen 07 scenery, yours to judge against the approved picture (`qa/gameplay_video/r07_band_distances_r4.json` on `claude/rainbow-s08-camclear-c4`, read-only).

Your milestone (finish MILESTONE 2), one factor at a time, keep only what is VISIBLY closer:
1. Re-verify `m07fill`, `m07ang`, `m07gold` from the saved frames/metrics (re-render only what is missing): are the doubled ring layer upper-left at 20 u and the mirrored diamond in the near water at 3 u gone? Keep each switch only if visibly closer; say which are kept.
2. Coins at the painted spots (finish the probe like `tools/match08/coinprobe08.mjs`): position only, switch-guarded; total stays 91 / 2,240.
3. Rings / pink-blue water / bubbles / tall white foam walls consistent while moving (3/6/10/20 u + steering left/right): no smears, no mirrored tiles; the gold rings ahead should look like the approved picture's rings, not bands filling the upper screen.
4. Proofs: default 06/07/08 0 px (note: the title banner ~rows 31–166 and the animated 01/11 areas differ between two captures of the SAME build — compare outside them or capture twice), `?match08=1` 08 0 px, protected 05 BEFORE 0 px, gameplay 8/8 + 91 / 2,240 with and without match07, continuity (huge 07→08 drop ≈ 61 u, joins gap 0), tsc clean.
5. Separate full-size 1 APPROVED · 2 BEFORE (M1) · 3 NEW + moving frames (no collages), `STATUS.md` (rewrite), `NOTES.md`, `SHARED_CHANGES.md`; APK with `match07=1` + kept switches if closer (`builds/rainbow-debug-07-2026-11-17-r4.apk`, NOT phone-tested). The fal clean plate stays PREPARED, NOT run.

Coordination: your files `src/world/match07.ts`, `assets/textures/match07/`, `tools/match07/`, `qa/match/07/`. Shared files: minimal, `match07`-guarded, listed in `SHARED_CHANGES.md`. NEVER touch Benny, HUD, gameplay rules, Screen 05/08 files, references, protected branches. The Screen 08 camera specialist owns the 07 view obstructions and the 07→08 transition view under `?camclear=1`. NO paid jobs of any kind. Work lean — three earlier accounts ran out of usage; no subagents. When done: push, verify remote SHA == HEAD, ONE send_message to session_01Kbt6BTTnCGMUULjZoCLDTo (picture paths, numbers, SHA, open problems, in visual terms), then stop and wait.

### 🤖 Claude — 2026-11-17T19:18:45.889Z

> 🔧 **Bash** `{"command": "git status -sb | head -5 && git log --oneline -5 && git fetch -q origin ccr-067047f0-up5d1m && for f in COMMON_RULES USER_DECISIONS S07; do echo \"=== $f\"; git show FETCH_HEAD:docs/briefs/2026-11-17-r4/$f.md | head -80; done", "description": "Check branch state and read r4 briefs"}`

### 🧑 User — 2026-11-17T19:18:47.583Z

> ↩︎ result: ## claude/rainbow-s07-match-c4...origin/claude/rainbow-s07-match-c4
>  M backups/CONVERSATION_INDEX.md
> ?? backups/claude-sessions/5269c062-7f72-5f3f-892e-7eb31565a054/
> 72fb6129 autosave: Rainbow 2026-11-17 18:13 UTC
> a5d2b392 Screen 07 M2: m07fill (river tile instead of mirrored fill on the water), m07ang (picture only near the approved view direction), m07gold (solid rounded gold paddles) — moving frames + metrics
> f6eab415 autosave: Rainbow 2026-11-17 18:07 UTC
> 1c8487ea autosave: Rainbow 2026-11-17 18:02 UTC
> f91dddba autosave: Rainbow 2026-11-17 18:02 UTC
> === COMMON_RULES
> # RAINBOW — common rules, round 4 (account 4, 2026-11-17 ~18:35 UTC)
> 
> **The round-3 and round-2 rules stay binding word for word:** `docs/briefs/2026-11-17-r3/COMMON_RULES.md` and
> `docs/briefs/2026-11-17-r2/COMMON_RULES.md` (startup, git, visual goal, protected behaviour, money and secrets,
> reporting, saving, pace). Read both first. Only these points change:
> 
> ## What changed
> * **Lead coordinator ("Lead Claudia") = session `session_01Kbt6BTTnCGMUULjZoCLDTo`** ("Rainbow game restoration",
>   account 4), branch **`ccr-067047f0-up5d1m`** (started from the round-3 lead branch `ccr-c0235034-ks6sx3` @ `ed23f9e5`).
>   Every ` …[+10847 chars]

### 🤖 Claude — 2026-11-17T19:18:50.412Z

> 🔧 **Bash** `{"command": "git push -u origin claude/rainbow-s07-match-c4 2>&1 | tail -2; echo \"remote $(git ls-remote origin refs/heads/claude/rainbow-s07-match-c4 | cut -f1) local $(git rev-parse HEAD)\"; git ls-remote origin refs/heads/claude/rainbow-s07-match-c3; python3 -I scripts/autosave-status.py | tail -2; sha256sum -c scripts/reference.sha256 | grep -c OK; ls qa/match/07/m2/ tools/match07/; cat qa/match/07/m2/*.md 2>/dev/null | head -100", "description": "Startup check and list M2 work"}`

### 🧑 User — 2026-11-17T19:18:53.114Z

> ↩︎ result: Everything up-to-date
> branch 'claude/rainbow-s07-match-c4' set up to track 'origin/claude/rainbow-s07-match-c4'.
> remote 0a46dd702cbc620027aacb0425c5f6e07eac3d6f local 0a46dd702cbc620027aacb0425c5f6e07eac3d6f
> 72fb6129f9bb59dbe07f0ed9387ce312ae618a11	refs/heads/claude/rainbow-s07-match-c3
> AUTOSAVE OK | branch claude/rainbow-s07-match-c4 | scheduler daemon | last verified backup 2026-11-17T19:18:41+00:00 (0.2 min ago) | local 0a46dd7 remote 0a46dd7 (match) | uncommitted 0
> 13
> qa/match/07/m2/:
> cap_ang
> cap_fag
> cap_fill
> coins
> metrics_ang.json
> metrics_fag.json
> metrics_fill.json
> motion_ang
> motion_fag
> motion_fill
> 
> tools/match07/:
> axis07.py
> coinprobe07.mjs
> fit_proxies07.py
> lock_projector07.py
> make_plate07.py
> metrics07.py
> motion07.mjs
> probe07.mjs
> river_coins07.py
> river_iter07.py
> solve_cam07.py

### 🤖 Claude — 2026-11-17T19:18:55.398Z

> 🔧 **Bash** `{"command": "git show --stat HEAD | head -20; for f in qa/match/07/m2/metrics_*.json; do echo \"== $f\"; head -c 1500 $f; echo; done; ls qa/match/07/m2/motion_fag qa/match/07/m2/cap_fag qa/match/07/m2/coins; ls qa/match/07/", "description": "Read M2 metrics and frame lists"}`

### 🧑 User — 2026-11-17T19:18:55.460Z

> ↩︎ result: commit 0a46dd702cbc620027aacb0425c5f6e07eac3d6f
> Author: Claude <noreply@anthropic.com>
> Date:   Tue Nov 17 19:18:47 2026 +0000
> 
>     autosave: Rainbow 2026-11-17 19:18 UTC
>     
>     Automated Rainbow backup (daemon). 4 file(s) changed.
>     Transcripts: refreshed (repo verified private)
>     
>     Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
>     Claude-Session: https://claude.ai/code/session_01Kbt6BT7VJEKLkAskyb5T9U
> 
>  backups/CONVERSATION_INDEX.md                                         | 1 +
>  backups/MANIFEST.json                                                 | 4 ++--
>  .../5269c062-7f72-5f3f-892e-7eb31565a054/transcript.md                | 2 ++
>  .../5269c062-7f72-5f3f-892e-7eb31565a054/transcript.sanitized.jsonl   | 1 +
>  4 files changed, 6 insertions(+), 2 deletions(-)
> == qa/match/07/m2/metrics_ang.json
> {
>  "BEFORE": {
>   "FULL": {
>    "within_20": 0.8006,
>    "mean_abs": 15.0,
>    "ssim": 0.7896
>   },
>   "BELOWHUD": {
>    "within_20": 0.8672,
>    "mean_abs": 10.4,
>    "ssim": 0.8536
>   },
>   "SCENERY": {
>    "within_20": 0.9554,
>    "mean_abs": 3.83,
>    "ssim": 0.9498
>   },
>   "upper_tunnel_rings_paddles_y200_560": {
>    "within_20": 0.9996,
>    "mean_abs": 0.15,
>    "ssim": 0.9978
>   },
>   "m …[+4252 chars]

