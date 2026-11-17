# RAINBOW — parallel workstreams: lead progress report

Lead coordinator: session `session_01AvQv6UXiBngewM8kSBwFfZ` ("Rainbow game restoration and parallel agents"), lead
branch `ccr-d4240b15-rl1i72` (contains `ccr-9c4a8ad6-xovgsx` @ `752d6d8`; the user's verified branch
`ccr-9c4a8ad6-xovgsx` receives the integrated Screen 08 result at the end of each round, user order 2026-11-17).
Updated: 2026-11-17 ~15:45 UTC.

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
| 04 Five Arrows | screen-04 cloud session `session_01AvQv6UQ9kzB2yfcESLZjUB` | own container | `claude/rainbow-s04-match` (from line A `752d6d8`) | started 15:37 UTC | audit today 6.4 % | everything (Phase 2) | – | MILESTONE 1: first `?match04=1` at the approved view + numbers + motion check | in development |
| 05 Flow Into the Current | screen-05 cloud session `session_01AvQv6ShfugNq5opq6Bd1MX` | own container | `claude/rainbow-s05-match` (from line B `99ab17b`) | started 15:37 UTC | line B `?match05=1` 86.9 % whole frame | inventory of all 05 work first | – | MILESTONE 1: INVENTORY + one measured improvement | in development |
| 06 Rinse Arch | not launched yet | – | – | – | audit 5.0 % | – | – | launch when 04/05 reach milestone 1 (shared usage limit; 08 has priority) | queued |
| 07 Washer Tube | not launched yet | – | – | camera/ring measurements in `qa/match/07/` | audit 6.7 % | – | – | launch when 04/05 reach milestone 1 | queued |

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
