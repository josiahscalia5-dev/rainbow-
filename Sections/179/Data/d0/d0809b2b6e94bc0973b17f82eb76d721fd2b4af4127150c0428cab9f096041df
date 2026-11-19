# Rainbow session — session ac6541a2-ca01-5d9d-9e41-14d7735c9511

### 🧑 User — 2026-11-17T16:01:17.927Z

You are the SCREEN 06 workstream agent of the RAINBOW game (my existing project — do NOT restart or redesign anything). The lead coordinator is the session "Rainbow game restoration and parallel agents" (session_01AvQv6UXiBngewM8kSBwFfZ); it owns integration, shared systems and Screen 08. You work ONLY on Screen 06 · CREST THE RINSE ARCH, isolated, on branch `claude/rainbow-s06-match` (created from `ccr-9c4a8ad6-xovgsx` @ 752d6d8 = line A, which has the successful Screen 08 method).

## Startup (short)
1. Follow CLAUDE.md. The SessionStart bootstrap already ran; check `bash scripts/claude-bootstrap.sh --status` once. NEVER merge, cherry-pick, force-push, reset or rebase; push only `claude/rainbow-s06-match`. Confirm `git branch --show-current`.
2. Read: docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md, qa/match/NOTES.md (per-screen switch rules, MATCH_CAM table, audit: 06 today 5.0 %, "low camera looking up at the slotted arch hall ribs"), qa/match/06/ (relaunch notes, if any), qa/match/08/NOTES.md (THE METHOD), qa/imageblaster/08/NOTES.md, src/world/match08.ts, src/game/match.ts, tools/match08/*, tools/qa/screen_match.py.
3. Do NOT call World Labs or fal (no paid jobs without my explicit OK through the lead).

## Goal
`?match06=1`: my approved picture `references/06_crest_the_rinse_arch.png` (never modify it; `sha256sum -c scripts/reference.sha256` stays 13 OK) reproduced in the REAL playable 3D game with the Screen 08 method: exact camera solve at the game's FOV → real 3D proxy geometry fitted to the picture (purple perforated tunnel, gold rings, the S-river into the tunnel, ripples round Benny) → texture = my ORIGINAL pixels camera-projected (post-chain inverse as in match08) → unseen surfaces from tiles cut from the artwork + stretch guard (no stretched textures while moving) → river path following the painted water → the picture's coins at the painted spots (real pickups; run total stays 91 / 2,240 exactly, as match08 does) → moving-camera + steering test. Where Benny / HUD / title / coins must be removed from the texture, use a PROVISIONAL local fill (OpenCV inpainting / continuing the scenery) and prepare — but DO NOT run — one fal `nano-banana-2/edit` clean-plate request in qa/match/06/FAL_PLATE_REQUEST.md. Do not use Marble for gameplay views.

## Coordination
* A camera specialist in the lead session is fixing camera obstructions seen in my gameplay video (Screen 06 at 18–20 s: purple drum wall + gold band filling the view) behind `camclear=1` on `claude/rainbow-s08-camclear`. Don't duplicate that: you own the LOOK of the approved 06 view under `match06`; make sure your fitted geometry never puts walls/rings between the camera and Benny while riding 06, and report anything that would conflict.
* Your files: `src/world/match06.ts`, `assets/textures/match06/`, `tools/match06/`, `qa/match/06/`. Shared files (src/game/match.ts — ONE MATCH_CAM line, cameraRig.ts, course.ts, Game.ts, coins.ts): minimal edits that run only when `match06` is on; list each in `qa/match/06/SHARED_CHANGES.md`.
* NEVER touch Benny (src/characters/benny/*, assets/textures/benny0*/), HUD (src/ui/*), gameplay rules, Screen 05/08 files, references, protected branches.
* Proofs: default build 0 px different (captures of 05, 06, 07, 08); `?match08=1` on 08 0 px different; `?ringa=26&nearfloor05=0` vs `qa/pilot05/wave9/baseline/05.png` 0 px; gameplay `node scripts/gameplay-test.mjs` 8/8 with and without `match06=1`, 91 / 2,240; `npx tsc --noEmit -p .` clean.

## Deliverables
APPROVED | BEFORE | NEW as SEPARATE full-size pictures in `qa/match/06/` (no grids as the main result), screen_match numbers (whole frame, scenery without HUD/Benny, bands, SSIM), moving-camera frames (forward 3/6/10 u + steering left/right), `qa/match/06/NOTES.md`, and `qa/match/06/STATUS.md` with exactly: Assigned screen · Active agent · Git branch · Completed work · Visual accuracy measurements · Remaining issues · Latest saved commit · Next task · Status (in development / under review — NEVER "approved": only I approve).

## Saving + reporting + pace
Five-minute autosave pushes this branch; also commit + push at each milestone and verify `git ls-remote origin refs/heads/claude/rainbow-s06-match` == HEAD (Git LFS uploads work). The usage limit is shared by all parallel sessions and Screen 08 has priority: work efficiently, one heavy render at a time, reuse the match08 tools. MILESTONE 1 = first NEW 06 at the approved view with numbers + a moving-camera check + STATUS.md pushed; then send the lead a short status with send_message (session_01AvQv6UXiBngewM8kSBwFfZ) and stop and wait. You may use the project specialists in .claude/agents/ (washer-environment-modeler, playwright-visual-qa, reference-match-director) as subagents inside your own session.

