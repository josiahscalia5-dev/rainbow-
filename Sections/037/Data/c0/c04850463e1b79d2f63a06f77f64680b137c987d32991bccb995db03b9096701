# RAINBOW — parallel workstreams: lead progress report

**Lead coordinator ("Lead Claudia") — round 2, account 2:** session `session_01VCMXob2ipUeLE1o7yXNSsZ` ("Rainbow Android
game parallel restoration"), branch `ccr-5495e9c4-g0apvl` = continuation of the lead branch `ccr-d4240b15-rl1i72`
(started from its newest commit `4156164`). Briefs for every workstream: `docs/briefs/2026-11-17-r2/`
(`COMMON_RULES.md` + one file per workstream).
Updated: 2026-11-17 ~16:48 UTC.

## What happened to round 1 (previous account)
Round 1 (lead `session_01AvQv6UXiBngewM8kSBwFfZ` on the previous Claude account) launched four cloud sessions (04, 05,
06, 07) and two Screen 08 subagents between 15:33 and 16:03 UTC. **All of them stopped at ~16:01 UTC: "You've hit your
5-hour limit · resets 8:20pm (UTC)"** (read from their saved transcripts). Their containers kept autosaving to the old
branches (last: 04 at 16:27). Everything they wrote is on GitHub. Because they may wake up after 20:20 UTC, round 2
continues on separate **`…-c2` continuation branches** created from each old branch's newest commit — nothing is merged
or overwritten. Recommended: on the previous account, archive or stop those five sessions so they cannot duplicate work.

## Rules for every workstream (full text: `docs/briefs/2026-11-17-r2/COMMON_RULES.md`)
* Own branch, own cloud container. No merges / cherry-picks between line A (`ccr-9c4a8ad6-xovgsx` and its descendants)
  and line B (`ccr-b0757dec-dj6l1o`, the 05 branches); no pushes to protected branches; `codex/*` never.
* Shared systems (Benny = Screen 08 Benny specialist only; HUD; gameplay; camera; `course.ts`; `Game.ts`; coins; the 13
  approved images): only minimal, switch-guarded edits listed in each agent's `SHARED_CHANGES.md` for the lead.
* Default build 0 px; `?match08=1` unchanged for the 04–07 agents; 91 coins / 2,240; gameplay 8/8; continuity gap 0.
* No paid job without the user's OK. The only authorised paid job: ONE fal clean-plate edit for Screen 04 (not run yet;
  gated by the lead's "FAL READY" message).
* Nothing is "approved" until the user says so. Integration only after the user approves Screen 08 and that screen.
* Each session does ONE milestone, pushes, reports to the lead with `send_message`, then stops and waits (usage budget).

## Status per screen
| Screen | Assigned specialist | Working branch (continued from) | Running-session status | Latest verified commit | Completed improvements | Latest visual measurements | Unfinished problems | Test results | Next task | Approval status |
|---|---|---|---|---|---|---|---|---|---|---|
| 08 Benny | benny-character-artist — session `session_01VCMXoYuzD1BetvXyVLKxre` | `claude/rainbow-s08-benny08-bake-c2` (from `claude/rainbow-s08-benny08-bake` @ `6392658`) | see "Verified at" below | `6392658` (round 1 WIP) | ported benny05 look (knit beanie, pom, star, shell fur); Benny maps re-baked from the APPROVED 08 picture (`?bake08=1`; match08 now uses them) | whole frame 83.3 → **84.3 %** within 20 levels, below HUD 90.1 → 91.2 % (CURRENT → NEW bake); scenery 97.4 % | fur shading, knit/cuff/stripes, pom yarn, star shape, splash look; NOTES.md missing | round 1: gameplay 8/8, 91 / 2,240 (before the bake) | verify bake, NOTES, one-factor look rounds, motion + 04–07 check | NOT approved |
| 08 camera / video | path-camera-transition-engineer — session `session_01VCMXobqY9gmdQoEnarNz81` | `claude/rainbow-s08-camclear-c2` (from `claude/rainbow-s08-camclear` @ `5547670`) | see below | `5547670` (round 1 WIP) | `?camclear=1` obstruction fixes for 04/06/07/08 (`camClear.ts`), timelines of source + both APKs, probe scans | – (not measured yet) | white sheet 03/04, pink wall 04, drum wall 06, gold band 07, 08 view engagement; NOTES.md missing | not yet run on the WIP | verify WIP, video-moment comparisons, moving check 07→08→09 | NOT approved |
| 08 integration | lead | `ccr-5495e9c4-g0apvl` | running (this session) | see `git log` | restore verified; keys reconnected; round 2 launched | scenery 97.4 %, whole 83.4 % (method approved, screen NOT approved) | waits for the two 08 specialists | bootstrap OK; tsc + continuity OK | integrate 08 specialists after review, APK, full-size previews | NOT approved |
| 04 Five Arrows | screen-04 workstream — session `session_01VCMXoZnQahSncyyVnBsDQS` | `claude/rainbow-s04-match-c2` (from `claude/rainbow-s04-match` @ `e0bad9c`) | see below | `8c1732b` milestone 1 (+ autosaves to `e0bad9c`) | milestone 1: camera solve, fitted proxies, original pixels projected, picture's 5 coins (91 / 2,240 kept); ring-structured tunnel tiles written (not wired) | scenery 5.1 → **97.6 %** within 20 (SSIM 0.967); whole 6.4 → 79.9 %; Benny area 16.5 % | smeared gold tunnel at 10–20 u; mirrored water under Benny; provisional fill (23.4 %) until the fal plate | milestone 1: gameplay 8/8, default 0 px | MILESTONE 2 (tiles, water, motion, the one fal plate when "FAL READY") | NOT approved |
| 05 Flow Into the Current | screen-05 workstream (line B) — session `session_01VCMXoYy3mTRHhDGP8mZcTw` | `claude/rainbow-s05-match-c2` (from `claude/rainbow-s05-match` @ `90129c8`) | see below | `d979028` milestone 1 (+ autosaves to `90129c8`) | milestone 1 `?tgtvis05=1` (approved water around Benny); coin-total fix `coins05tot` written (audit 91 coins, all collected) | whole 87.8 → **89.2 %**, scenery 91.6 → **93.3 %**, water 92.8 → **96.5 %** within 20 | coin fix changes 2,296 px on 04 + 17 px on 05 (unexplained); teal patch beside Benny; right wall chunk; bottom-left ring arc | coin audit 91 / 91 collected; gameplay re-test pending | MILESTONE 2 (91 / 2,240 verified, keep tgtvis05, scenery fixes) | NOT approved |
| 06 Rinse Arch | screen-06 workstream — session `session_01VCMXocCdACTagSAjpsaqHT` | `claude/rainbow-s06-match-c2` (from `claude/rainbow-s06-match` @ `42c9b29`) | see below | `752d6d8` (no 06 work saved in round 1) | – | audit 5.0 % (current game) | everything (milestone 1) | – | MILESTONE 1 `?match06=1` | NOT approved |
| 07 Washer Tube | screen-07 workstream — session `session_01VCMXoZAmTEuSmtFMN8ca5t` | `claude/rainbow-s07-match-c2` (from `claude/rainbow-s07-match` @ `49cf414`) | see below | `752d6d8` (+ earlier `qa/match/07/` camera + ring measurements) | approved-07 measurements (Benny box, 5 rings, best-fit render) | audit 6.7 % | everything (milestone 1); 07→08 drop must stay intact | – | MILESTONE 1 `?match07=1` | NOT approved |

### Verified at 16:48 UTC (list_sessions + `git ls-remote`)
* 04: RUNNING — unwrapping the gold-ring tunnel texture; branch `claude/rainbow-s04-match-c2` @ `9e8948f`.
* 06: RUNNING — Screen 06 baseline captured, next the Screen 08 baseline and the camera probe; `…-s06-match-c2` @ `b7d85b2`.
* 07: RUNNING — measuring Benny's fur extent in the approved 07 picture; `…-s07-match-c2` @ `81bbc73`.
* 08 camera: RUNNING — gameplay 8/8 with the camclear WIP, pixel-identity checks in progress; `…-s08-camclear-c2` @ `c006334`.
* 08 Benny: RUNNING (verified 16:47) — checking its saved bake work; `…-s08-benny08-bake-c2` @ `edc89be`.
* 05: RUNNING (verified 16:48) — checking branch state and reading the common rules; `…-s05-match-c2` @ `e98a706`.
* **All six workstreams verified running at 16:48 UTC**, each in its own cloud container on its own `-c2` branch, and
  each has received the user orders of 16:45 UTC (direct message + `COMMON_RULES.md`).

### User orders 2026-11-17 ~16:45 UTC (sent to every running session; in `COMMON_RULES.md` @ `3dba412`)
* Usage warning on the account: every specialist commits AND pushes at every safe checkpoint, and before stopping.
* Screen 04 fal: exactly ONE paid edit; no retry — any additional paid attempt needs the user's approval.
* No merges of unfinished work; the 13 approved images unchanged; never overwrite a successful reconstruction.
* Screen 08 stays the highest priority for final approval.
* APPROVED / BEFORE / NEW as separate full-size pictures as each screen improves.

## Restore verification (round 2, 2026-11-17 ~16:40 UTC, account 2)
* Lead branch restored: this session started from `ccr-d4240b15-rl1i72` @ `4156164`; work continues on `ccr-5495e9c4-g0apvl`.
* Newest remote commits found: lead `4156164` (16:18) · `claude/rainbow-s04-match` `e0bad9c` (16:27, autosave after
  `8c1732b` milestone 1 + tunnel tiles) · `claude/rainbow-s05-match` `90129c8` (16:23, after `d979028` milestone 1 +
  coin-total fix) · `claude/rainbow-s06-match` `42c9b29` (16:22, transcripts only) · `claude/rainbow-s07-match` `49cf414`
  (16:23, transcripts only) · `claude/rainbow-s08-benny08-bake` `6392658` (16:00, bake WIP) · `claude/rainbow-s08-camclear`
  `5547670` (16:01, camclear WIP) · `ccr-9c4a8ad6-xovgsx` `752d6d8` (15:18).
* 13/13 approved images byte-identical; 10/10 specialist definitions present with unchanged SHA-256.
* Git LFS: 45/45 real files locally, 45/45 confirmed on GitHub LFS (368 MB; includes the user's gameplay video).
* Tools: Blender 5.3.0, Android SDK 34 + build-tools 34.0.0 + Java 21, Node 22, Playwright Chromium (WebGL2), ffmpeg,
  ImageMagick, Python QA libs — all OK. tsc OK; continuity OK (07→08 drop 61.19).
* World Labs: key saved via the secure form on the `rainbow-` environment; free read **5,420 credits** (same account).
  The two old Screen 05 pilot world records return 404 from the API; their files are complete in Git LFS.
* fal.ai: key saved via the secure form; free check HTTP 404 = key accepted. Download hosts `v3.fal.media`,
  `v3b.fal.media` added to the environment (for the one authorised Screen 04 edit). No paid job run.
* Autosave: daemon running on `ccr-5495e9c4-g0apvl`, remote SHA == local HEAD.
* Bootstrap "Specialist agents" check crashed on the round-1 roster format (objects instead of names) — fixed in
  `scripts/verify-assets.py`; now OK.

## Waiting for the user
* Screen 08: approval of the whole screen (method approved; screen NOT approved).
* Previous account: archive/stop its five old sessions so they don't wake at 20:20 UTC and duplicate work.
