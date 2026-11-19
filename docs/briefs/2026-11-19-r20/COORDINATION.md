# Round 20 — coordination (lead `ccr-681a37bb-5jqfbu`, started 2026-11-19 23:25 UTC)

Session opened on the r19 lead `ccr-d00ac5ec-gabdsh` @ `0bd0ab5` (21:52 UTC save). User: "Continue exactly where we left off".
Where we left off: Round 19b (~20:42 UTC) — user: "start with Benny" + "make Screen 04 an 8 out of 10 while swimming". Its three
workers ran ~14 min, then the r19 account hit its 5-hour usage limit (~20:56 UTC, resets 00:10 UTC); nothing was committed on the
`-c20` branches (all = preview v3 `09459079`); their unfinished edits survive in the 21:52 `backups/wip/*-c20/` snapshots.
The lead's last save `f49bc7f` (23:17 UTC) holds only backup bookkeeping (INFO timestamps, log, transcript) — not merged.
Nothing merged. r19 lead + every `-c19` / `-c20` branch added to `protected_branches`; `autosave.config.json` branch = this lead.

## Services verified at start (free reads only, 23:25–23:35 UTC)
Autosave OK (remote == HEAD) · GitHub MCP `get_me` OK + named fetch / push / ls-remote OK (the startup fetch failed once —
transient) · World Labs Atlas connector connected (`list_projects` "My project", credits available) · Marble key authenticated
(5,420 credits; old worlds 404 = earlier account, files in Git LFS) · fal `01a1ea70` → 200 COMPLETED (same fal account) ·
Playwright MCP connected · bootstrap: Blender 5.3.0, Android SDK 34, Node 22, Python QA libs, Chromium WebGL2, ffmpeg /
ImageMagick, tsc + continuity OK; LFS 83/83 local + on GitHub; 13/13 references identical. Pixelmatch rebuilt at
`/home/user/tools-pixelmatch/pixeldiff.mjs`. Account-level plugins synced on THIS account: playwright, typescript-lsp
(+ repo plugin worldlabs@worldlabs). NOT on this account: the Thrixel connector, superpowers / frontend-design / feature-dev /
code-review plugins (account-level, enable in claude.ai if wanted; not needed by the game).
Commit `1b813c8` (Screen 05 Benny bake notes) fetched and pinned as `refs/keep/benny05-bake`.

## Workers (in-process background agents; `setup_worker.sh` in this folder restored the -c20 WIP onto -c21)
| Worker | Round-20 branch | Started at | Agent | Worktree | Port |
|---|---|---|---|---|---|
| Benny | `claude/rainbow-benny-c21` | `09459079` + WIP: `fur.ts` BENNY20 plush-lock shader, `assets/textures/benny20/*` (crown_n.png not snapshotted: regenerate with `tools/benny20/knit.py`), `tools/benny20/*`, task-1 shots `qa/benny/r19b/t1*` (partial) | benny-character-artist | `/home/user/wt/benny` | 5278 |
| s04 water / foam | `claude/rainbow-s04-match-c21` | `09459079` + WIP `m04wup` family (river curving up the walls, unproven) in `match04m4.ts` | foam-bubbles-particles | `/home/user/wt/s04` | 5273 |
| s04tex rings | `claude/rainbow-s04-ringtex-c21` | `09459079` + WIP `m04rnear` (near band → polished sub-band tubes, bulbs, reflections; last note: "bands still look flat, bulbs / reflections too weak → polished-tube reflection model") in `match04m4.ts` | washer-environment-modeler | `/home/user/wt/s04b` | 5274 |
| s05 | stopped at `claude/rainbow-s05-match-c19` @ `eb7233e3` | not restarted (user's focus: Benny + 04) | — | — | — |
| s06 / s07 | stopped at their `-c18` tips | not restarted | — | — | — |
| s08 | PAUSED by the user | `claude/rainbow-s08-scenery-c17` @ `3c0fa970` | — | — | — |

Logs continue in the r19b files (`qa/benny/r19b/PROGRESS.md`, `qa/match/04/r18/PROGRESS.md`, `qa/match/04/r18/ringpaint/NOTES.md`),
entries marked (r20). Lead merges kept steps into Screen 04 preview v4 (`claude/rainbow-s04-preview-c21`) and shows APPROVED /
BEFORE (v3) / NOW in motion. If this account runs out: `-c22` branches from each newest `-c21` tip + `backups/wip/` snapshot.

## Progress shown to the user
| # | Screen / step | Verdict |
|---|---|---|

## ~23:50 UTC user: Benny must be a "100%" match of the approved Benny — fur texture + pink colour first, in EVERY state
User: "Make sure Benny looks a lot more like the approved screen's Benny pink character ... Like the fur, the pink texture, like
the color of the texture ... I want it to look like the 100% everything about the pink character from my approved screen ...
All of this states as well." (= start, swimming, steering, every screen). Relayed to the Benny worker with the lead's fur
measurement (04 start close-up, body below the cuff, HSV): APPROVED mean RGB (200,70,146), hue ~324°, sat median 0.66,
brightness p10/50/90 0.57/0.80/0.98 · GAME v3 (255,92,179), hue 328°, brightness 1.00/1.00/1.00 (clipped, no shadow) · benny05
(247,107,194), brightness 0.89/1.00/1.00 · worker probe b3 too saturated (sat median 0.79). Hue is right; the neon look = flat
clipped brightness. Target: the approved brightness spread (deep rose creases / underside → bright tips), saturation ≤ approved;
very fine dense silky strands combed downward in soft overlapping layers (worker probes b3/b4 read as stiff petals: rejected
direction). Fur first, then hat / pompom / star.
