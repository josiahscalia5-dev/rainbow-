# RAINBOW — new Claude account handoff (written 2026-11-17 ~14:30 UTC, session 03b94f36)

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
Scores (`qa/match/08/scenery_metrics_BEFORE_FINAL.json`): scenery 97.4 % (SSIM 0.959), upper 98.9 %, middle 91.0 %,
lower 99.2 %, Benny + splash 64.5 %, whole frame 83.0 % (BEFORE 4.0 %). Gameplay test 8/8 both builds.
Remaining: Benny's body slightly wider + ≈30 px right of the painted one; darker band at the lower-left edge 3–6 u
forward; coins wobble ±3°. APK `builds/rainbow-debug-match08-2026-11-17.apk` (Git LFS, built with
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
