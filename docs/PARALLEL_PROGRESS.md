# RAINBOW — parallel workstreams: lead progress report

Lead coordinator: session `session_01AvQv6UXiBngewM8kSBwFfZ` ("Rainbow game restoration and parallel agents"), lead
branch `ccr-d4240b15-rl1i72` (contains `ccr-9c4a8ad6-xovgsx` @ `752d6d8`).
**User order 2026-11-17 ~15:46 UTC (supersedes the earlier "save to ccr-9c4a8ad6-xovgsx"):** new session work goes to
`ccr-d4240b15-rl1i72` and each specialist's own branch until the user has reviewed it; nothing unfinished is merged into
the original project branch `ccr-9c4a8ad6-xovgsx`.
Updated: 2026-11-17 ~16:00 UTC.

## User gameplay recording (received 15:45 UTC)
`qa/gameplay_video/source/rainbow_gameplay_for_claudia-1_0-48.9s.mp4` (trimmed: the last second showed the phone's
notification shade; original 49.8 s, 720×1602, 30 fps, sha256 `8501d078…`, kept out of git) + 1 fps sheets
`user_video_1fps_00-23s.png`, `user_video_1fps_24-48s.png`. Lead's first read: 03 at 4–6 s (white sheet over the view),
04 at 7–10 s (white sheet, then the whole frame inside a pink wall at 8 s), 05 11–16 s, 06 17–25 s (drum wall + gold
band fill the view 18–20 s), 07 26–37 s (gold ring band fills the frame 33–36 s), **08 38–39 s = the match08
reconstruction** (so the recording is from a match08 APK), 09 40 s, 10 41–43 s, 11 44–48 s (girl + towel,
FINAL SPIN COMPLETE). Analysis: camera specialist, `qa/gameplay_video/NOTES.md` on `claude/rainbow-s08-camclear`.

## Rules for every workstream
* Own branch, own worktree / own cloud container. No merges or cherry-picks between line A (`ccr-9c4a8ad6-xovgsx`) and
  line B (`ccr-b0757dec-dj6l1o`); no pushes to protected branches (`backups/autosave.config.json`).
* Shared systems (Benny `src/characters/benny/*`, gameplay, camera `cameraRig.ts`/`match.ts`, `course.ts`, `Game.ts`,
  coins, HUD `src/ui/*`, the 13 approved images) — only minimal, switch-guarded edits, each listed in the agent's
  SHARED_CHANGES / NOTES for the lead's approval. Benny belongs to the Screen 08 Benny specialist only.
* Default build stays 0 px different; Screen 08 under `?match08=1` stays unchanged for 04–07 agents; 91 coins / 2,240.
* No paid World Labs / fal job without the user's explicit OK (job + cost named first). Keys are on the environment
  (secure form, 2026-11-17 ~15:42 UTC): World Labs 5,420 credits (free read), fal key accepted (free 404 check).
* Nothing is "approved" until the user says so. Screens 04–07 are integrated only after the user approves Screen 08
  and that screen.

## Status
| Screen | Active agent | Where | Git branch | Completed work | Visual accuracy | Remaining issues | Latest saved commit | Next task | Status |
|---|---|---|---|---|---|---|---|---|---|
| 08 Benny | benny-character-artist (subagent, own worktree) | lead container | `claude/rainbow-s08-benny08-bake` | started 15:33 UTC: re-bake Benny's maps from the APPROVED 08 picture | before: Benny+splash 65.8 %, scenery 97.4 %, whole 83.3 % | fur/knit/pom/star surface detail | – | CURRENT vs NEW bake comparison, keep the closer | in development |
| 08 camera / video | path-camera-transition-engineer (subagent, own worktree) | lead container | `claude/rainbow-s08-camclear` | started 15:34 UTC: reproduce the user's gameplay-video windows (7–9, 18–20, 34–37, 38–40, 40–47 s) | – | foam / washer geometry / gold structures obstructing the view (user video) | – | timeline per build, fix only what newer builds still show (`camclear=1`) | in development |
| 08 integration | lead | lead container | `ccr-d4240b15-rl1i72` → `ccr-9c4a8ad6-xovgsx` | restore verified (see below) | 97.4 % scenery (method approved, screen NOT approved) | waits for the two 08 specialists | `1663b59` (autosave) | integrate, gameplay + steering, 91 coins, APK, full-size previews, motion comparisons | in development |
| 04 Five Arrows | screen-04 cloud session `session_01AvQv6UQ9kzB2yfcESLZjUB` | own container | `claude/rainbow-s04-match` (from line A `752d6d8`) | MILESTONE 1 (15:57 UTC, `8c1732b`, verified by the lead): camera solve, fitted proxies, original pixels projected, picture's 5 coins (total 91 / 2,240 kept) | scenery 5.1 % → **97.6 %** within 20 (SSIM 0.967); whole 6.4 → 79.9 %; Benny area 16.5 % | moving 10–20 u: tunnel interior smeared, water under Benny mirrored tiles; Benny look (use `benny08=1`); provisional fill (23.4 %) until a fal plate is approved | `8b0bf4c` | MILESTONE 2: moving quality (ring-structured tunnel tiles, painted water while riding), splash card | in development (milestone 1 under review) |
| 05 Flow Into the Current | screen-05 cloud session `session_01AvQv6ShfugNq5opq6Bd1MX` | own container | `claude/rainbow-s05-match` (from line B `99ab17b`) | MILESTONE 1 (15:56 UTC, `d979028`, verified by the lead): INVENTORY + `?tgtvis05=1` (approved water kept around Benny's hat/shoulders) | whole frame 87.8 % → **89.2 %** within 20 (SSIM 0.869 → 0.877), scenery 91.6 → 93.3 %, water 92.8 → 96.5 % | **match05 run has 100 coins / 2,330 — must become 91 / 2,240 before any integration**; teal patch beside Benny while riding; right wall chunk; bottom-left ring arc | `7336e72` | MILESTONE 2: coin total 91 / 2,240, moving quality, then wall/ring | in development (milestone 1 under review) |
| 06 Rinse Arch | screen-06 cloud session `session_01AvQv6SAwTuXwWRiSwgKaoH` | own container | `claude/rainbow-s06-match` (from line A `752d6d8`) | started 15:57 UTC (after 05 reached milestone 1) | audit 5.0 % | everything (Phase 2); obstruction fixes stay with the camera specialist (`camclear`) | – | MILESTONE 1: first `?match06=1` at the approved view + numbers + motion check | in development |
| 07 Washer Tube | screen-07 cloud session `session_01AvQv6SiGdDhWH1exHdH8xX` | own container | `claude/rainbow-s07-match` (from line A `752d6d8`) | started 15:59 UTC (after 04 reached milestone 1); reuses `qa/match/07/` camera + ring measurements | audit 6.7 % | everything (Phase 2); 07→08 drop must stay intact; obstruction fixes stay with `camclear` | – | MILESTONE 1: first `?match07=1` + numbers + motion check | in development |

## Restore verification (2026-11-17 ~15:25 UTC, this account)
* Repository `josiahscalia5-dev/rainbow-`, branch `ccr-9c4a8ad6-xovgsx` @ `752d6d8` (contains `7694d2f` and the later
  Benny-check + full-save commits); session branch `ccr-d4240b15-rl1i72` = the same + autosaves.
* 13/13 approved images byte-identical (`sha256sum -c scripts/reference.sha256`); 10/10 specialists present.
* Git LFS: 44/44 files real locally (APKs, Marble splats/collider/pano, match08 + benny05 textures, models).
* Autosave: daemon running, remote SHA == local HEAD.
* World Labs: key re-entered via the secure form; free read 5,420 credits (same account). fal: key accepted (free 404).
  Image-Blaster restored (`/home/user/neilsonnn/image-blaster` @ 4acb43b, 08 world restored). Download hosts
  `cdn.marble.worldlabs.ai`, `v3.fal.media`, `v3b.fal.media` are not on this environment's allowlist yet (only needed
  after an approved paid job). World Labs plugin MCP server: not connected (proxy refused its host).

## Waiting for the user
* Paid: ONE fal `nano-banana-2/edit` clean plate for Screen 04 (`qa/match/04/FAL_PLATE_REQUEST.md` on `claude/rainbow-s04-match`), replacing the provisional local fill (23.4 % of the frame). Not run. Needs the fal download hosts `v3.fal.media`, `v3b.fal.media` allowed when approved.
