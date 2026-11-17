# RAINBOW — parallel workstreams: lead progress report

# ROUND 3 (account 3) — CURRENT
**Lead coordinator ("Lead Claudia") — round 3, account 3:** session `session_01Q46SCLi5xPVn25aRuxkVwK` ("Rainbow game
restoration"), branch **`ccr-c0235034-ks6sx3`**, started from the round-2 lead branch `ccr-5495e9c4-g0apvl` @ `7db2982`
(newer than the user's checkpoint `ef591fd`: autosaves 17:14 + 17:15 UTC). Briefs: `docs/briefs/2026-11-17-r3/`
(`COMMON_RULES.md` = round-2 rules + changes, one brief per workstream). Updated: 2026-11-17 ~17:40 UTC.

## Why round 3
Account 2 (round 2, lead `session_01VCMXob2ipUeLE1o7yXNSsZ`) ran out of usage at ~17:07–17:12 UTC. Everything its six
sessions pushed is on the `…-c2` branches (verified below). Their containers may keep autosaving and the sessions may
wake when account 2 resets, so round 3 continues on NEW **`…-c3`** branches created from each `-c2` head. Nothing is
merged or overwritten. Recommended for the user: on account 2 (and account 1) stop/archive the old sessions.

## Round-3 sessions (all in their own cloud container, environment `rainbow-`, created 17:25 UTC)
| Workstream | Session | Branch (continued from) | Next milestone (brief) |
|---|---|---|---|
| 08 Benny | `session_01Q46SCJxXZNaUL12aCQ6mX4` | `claude/rainbow-s08-benny08-bake-c3` (from `-c2` @ `a4c6a5cc`) | verify + NOTES, keep whichever Benny is closer to the approved 08, fur / beanie / cuff / pom / star / splash one factor at a time, motion, APK (`S08_BENNY.md`) |
| 08 camera | `session_01Q46SCJbynvN5AdSwQ6tynz` | `claude/rainbow-s08-camclear-c3` (from `-c2` @ `57b6eb8a`) | video-moment comparisons, remaining obstruction fixes under `?camclear=1`, moving check 07→08→09, APK (`S08_CAMERA.md`) |
| 04 Five Arrows | `session_01Q46SCGVVo94Weug9VM7yDG` | `claude/rainbow-s04-match-c3` (from `-c2` @ `255ec5e6`) | M3: verify fal04 default, approved river colours while riding, sharper far rings, splash card, coins on the water (`S04.md`) |
| 05 Flow | `session_01Q46SCKjcx6k2Jb2JrspXSJ` | `claude/rainbow-s05-match-c3` (from `-c2` @ `fd94023f`, line B) | finish M2: teal patch, right wall, bottom-left ring arc, moving water; keep tgtvis05 + 91 / 2,240 (`S05.md`) |
| 06 Rinse Arch | `session_01Q46SCL2DLgtfbmDySmRvhY` | `claude/rainbow-s06-match-c3` (from `-c2` @ `2570f3ac`) | finish M1 `?match06=1`: measure, proofs, moving frames, prepared fal request, NOTES / STATUS, APK (`S06.md`) |
| 07 Washer Tube | `session_01Q46SCJx6kKaxMCCbLLqta3` | `claude/rainbow-s07-match-c3` (from `-c2` @ `21a1fdd5`) | finish M1 `?match07=1` docs + proofs + APK, then M2 rings / water / foam / coins; 07→08 drop intact (`S07.md`) |

The initial prompts of all six were not delivered by the session service (sessions idle after container setup); the lead
re-sent each task with `send_message` at ~17:38 UTC.

## Restore verification (round 3, 2026-11-17 ~17:20–17:40 UTC, account 3)
* Newest remote commits: lead `ccr-5495e9c4-g0apvl` `7db2982` (17:15) · 04-c2 `255ec5e6` · 05-c2 `fd94023f` · 06-c2
  `2570f3ac` · 07-c2 `21a1fdd5` · 08 Benny-c2 **`a4c6a5cc`** (17:12, autosave after the user's `d855287d`: transcripts +
  capture log only) · 08 camera-c2 `57b6eb8a`. No `-c2` branch changed after 17:12.
* 13/13 approved images byte-identical (`sha256sum -c scripts/reference.sha256`); 10/10 agent definitions present.
* Git LFS: 45/45 on the lead branch real files; all **50** distinct LFS objects of the lead + six `-c2` branches downloaded
  from GitHub and `git lfs fsck` OK on every branch (checksums verified, not just pointers).
* Tools (bootstrap): Blender 5.3.0, Android SDK 34 + build-tools 34.0.0 + Java 21, Node 22, Playwright Chromium (WebGL2),
  ffmpeg, ImageMagick, Python QA libs — OK. tsc OK; continuity OK (07→08 drop 61.19–61.41 u, joins gap 0).
* Gameplay `node scripts/gameplay-test.mjs` on the lead branch: **8/8**. Coins defined: **91** (default) and 91
  (`?match08=1`); run total 1,330 + 91 × 10 = 2,240.
* World Labs: key works (free read **5,420 credits**, same account); the two old Screen 05 pilot worlds return 404 from
  the API, their files are complete in Git LFS. fal.ai: key accepted (free status read HTTP 404 = authenticated); balance
  is not readable through the API (fal dashboard only). Screen 04's ONE fal edit was already run in round 2 (request
  `01a1ea70`, `qa/match/04/fal/` on the 04 branches) — reused, not repeated. No paid job in round 3.
* Atlas connector (claude.ai connector `World_Labs_Atlas`) is NOT connected on this account (optional; the API key
  covers Marble). context7 MCP needs sign-in (optional).
* Autosave: daemon running on `ccr-c0235034-ks6sx3`, remote SHA == local HEAD.

---
# ROUND 2 (account 2) — history

**Lead coordinator ("Lead Claudia") — round 2, account 2:** session `session_01VCMXob2ipUeLE1o7yXNSsZ` ("Rainbow Android
game parallel restoration"), branch `ccr-5495e9c4-g0apvl` = continuation of the lead branch `ccr-d4240b15-rl1i72`
(started from its newest commit `4156164`). Briefs for every workstream: `docs/briefs/2026-11-17-r2/`
(`COMMON_RULES.md` + one file per workstream).
Updated: 2026-11-17 ~17:06 UTC.

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
| 04 Five Arrows | screen-04 workstream — session `session_01VCMXoZnQahSncyyVnBsDQS` | `claude/rainbow-s04-match-c2` (from `claude/rainbow-s04-match` @ `e0bad9c`) | RUNNING milestone 3 (since 17:05) | **`0ae0799`** milestone 2 (verified by the lead 17:05) | M1: camera solve, fitted proxies, original pixels projected, 5 painted coins. **M2: deep tunnel = one painted gold ring repeating, world-anchored (no smears, no mirrored copies); painted river with chevrons under Benny while riding; the ONE paid fal clean plate (request `01a1ea70`, no retry) composited inside the fill mask only (`&fal04=1`)** | approved view: scenery **97.6 → 98.1 %** within 20 (SSIM 0.973), whole 79.9 → **81.3 %**, middle 95.7 → 96.9 %, Benny area 16.5 → 21.1 % (with fal04) | river turns almost plain cyan while riding (approved pink swirl ribbons + foam banks missing); far tunnel soft/glowy at 15–20 u; splash under Benny missing; coins float when seen from the side; Benny's look (08 Benny specialist) | lead re-check: default 04/05/07/08 + `?match08=1` 0 px (06 title-banner noise identical in the unchanged base build); gameplay 8/8 with/without, 91 / 2,240; tsc clean; APK `builds/rainbow-debug-04-2026-11-17-r2.apk` NOT phone-tested | MILESTONE 3: fal plate inside match04 (`fal04=0` = M2), approved river colours while riding, sharper far rings, splash card, coins on the water | NOT approved — pictures shown to the user 17:06 |
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
