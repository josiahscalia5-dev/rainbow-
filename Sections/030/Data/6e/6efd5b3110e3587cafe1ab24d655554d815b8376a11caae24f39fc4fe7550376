# ▶▶ NEWEST — ACCOUNT 5 (round 5) STATE (2026-11-17 ~20:35 UTC, lead session `session_013VHsJ9SbWPe9YXRvtUSngc`)

Account 5 restored account 4's work without rebuilding or merging anything. **Lead branch now: `ccr-f983b317-2vt0zh`**
(started from `ccr-067047f0-up5d1m` @ `ffa54f9f`, its newest commit). If account 5 runs out, the next account repeats the
procedure below with `-c6` branches made from each `-c5` tip (take the NEWEST remote commit of every branch).

## Branch map (round 5; nothing merged, no -c4 or older branch written)
| Role | Branch | Started at (= newest -c4 tip, 20:15 UTC) | State |
|---|---|---|---|
| Lead | `ccr-f983b317-2vt0zh` | `ccr-067047f0-up5d1m` @ `ffa54f9fb514f92a7d6353767e2952df9145bc25` | this session |
| 08 scenery in motion | `claude/rainbow-s08-scenery-c5` | `5ce044a52d53c5dd6cfb71fd994a82e8647381a4` | RUNNING `session_013VHsJAQsMA73qb7GCXdQ12` (finish round 1, `docs/briefs/2026-11-17-r5/S08_SCENERY.md`) |
| 08 Benny | `claude/rainbow-s08-benny08-bake-c5` | `fb72cc5052df908b994afeb41e7f598abc24e18d` | RUNNING `session_013VHsJAoze5D4wh6tk7r1hj` (round 6 fur clumps + pom tufts, `S08_BENNY.md`) |
| 08 camera | `claude/rainbow-s08-camclear-c5` | `18687513e3a35e553472a05ae7fb626c2f8108ce` | paused (r4 done; phone verdict pending) |
| 07 | `claude/rainbow-s07-match-c5` | `835a72dbb5abad1067b538c79b1f759b06e2cbeb` | paused (next: M3) |
| 06 | `claude/rainbow-s06-match-c5` | `c088718bb9e3374583238f4ee93f25bdee600065` | paused (next: M2) |
| 05 (line B) | `claude/rainbow-s05-match-c5` | `ebaf6cac71812ad5c00a9088ba48b6febdb42b2b` | paused (next: M3) |
| 04 | `claude/rainbow-s04-match-c5` | `d1e422faff67a37f837566301fb8abff0bac98db` | paused (next: M4) |
The commits on the `-c4` tips after the account-4 handoff snapshot are transcript/backup files only (checked with
`git diff --stat`); no game file changed. Account 4's idle Benny session woke once (20:12 UTC, PR #17 check-in) and
stopped its check-ins. Per-workstream next tasks: unchanged from the ACCOUNT 4 section below.

## Restore audit (account 5, 20:05–20:35 UTC)
* 13/13 approved images byte-identical; 10/10 agent definitions present, SHA-256 unchanged.
* Git LFS: 63 distinct objects across the 8 tips (812 MB), all downloaded, `git lfs fsck` OK on all 8, 0 missing.
* Lead code: tsc clean; continuity joins gap 0; gameplay **8/8, 91 coins, 1,330 → 2,240**, 07→08 drop 61.4 u (default and
  `match08=1&coins08px=1`).
* `flowplan-test.mjs`: A and D FAILED twice in this container — test-harness race, not a game bug (Chromium 157 +
  SwiftShader: the page main thread is busy 8–11 s after `ready`, so the 2.5 s clip ended before the first read; probe:
  hold correct). Fix `227f319e`: A/D use a 20 s clip, assertions unchanged → **A–E pass, E = 91 / 2,240**.
* Tools: Node 22, Blender 5.3.0, Android SDK 34 + Java 21 + Gradle 8.2.1, Playwright Chromium **157** (account 4: 153),
  ffmpeg, ImageMagick, Python QA libs — all OK (bootstrap). context7 + design MCP servers fail to connect (optional).
* **Keys:** this account's `rainbow-` environment has a World Labs key that authenticates (free read **5,190** credits)
  but it is the user's OTHER World Labs account (it sees the Screen 05 pilot worlds; the Screen 08 world `32b5b2f4…` reads
  404). Account 4's key (5,420 credits, Screen 08 world) is NOT on this environment. fal.ai: RECONNECTED 20:40 UTC by the user via the secure form (host `queue.fal.run`, `Authorization: Key …`); free read of request `01a1ea70` → 200 COMPLETED = the SAME fal account. (Before that: no key
  and `queue.fal.run` blocked.) Neither blocks current work (no paid jobs approved).
* Launch trap seen again: both new sessions sat idle with no task until the brief was re-sent with `send_message`.

## Open lead question for the user — Screen 08 coins vs the ending video (`?flowplan=1`)
Under `?match08=1&coins08px=1` the 9 painted coins lie at s 396.1 / 400.1 (in 08) and 405.2 / 407.7 / 410.6 / 412.7 (09
stretch) + 3 more beyond s 418.5; the ending video starts at s 404.37 (start of 09). So Benny swims through 2 and the
video credits 7 (total stays 91 / 2,240). Do not change the hand-over rule without the user's approval.

---

# ACCOUNT 4 → NEXT ACCOUNT HANDOFF (2026-11-17 ~19:45 UTC, lead session `session_01Kbt6BTTnCGMUULjZoCLDTo`)

Written at the user's urgent backup order (account 4 near its usage limit). Everything below this section is OLDER
history. Repository **https://github.com/josiahscalia5-dev/rainbow-** (ONE repo, all branches). The SHAs below were
verified on GitHub at writing time; sessions of account 4 may still autosave transcripts afterwards — always take the
**newest** remote commit (`git ls-remote origin refs/heads/<branch>`), never an older one.

## ▶ PASTE THIS INTO THE NEXT CLAUDE ACCOUNT (one message)
> CLAUDIA — continue my EXISTING Rainbow game from GitHub (`josiahscalia5-dev/rainbow-`). Do NOT restart, redesign,
> rebuild, merge, force-push or delete anything. Lead branch to continue from: `ccr-067047f0-up5d1m` (newest commit).
> Read `CLAUDE.md`, then the TOP section of `docs/NEW_CLAUDE_ACCOUNT_HANDOFF.md`, `docs/PARALLEL_PROGRESS.md` (ROUND 4),
> `docs/briefs/2026-11-17-r4/` (COMMON_RULES, USER_DECISIONS, one brief per workstream) and `docs/FLOW_VIDEO.md`.
> Do a read-only restore audit first (branch tips, 13 reference checksums, 10 agents, Git LFS fetch + fsck, tsc,
> gameplay 8/8, `node scripts/flowplan-test.mjs` A–E), reconnect my SAME World Labs + fal.ai keys only through the
> secure credential form if the free reads fail, then continue the seven specialist workstreams on NEW `-c5` branches
> (one per workstream, from each `-c4` tip), at most two sessions at a time. No paid jobs, no Google Flow generation.

## Branch map (8 branches to preserve; nothing merged)
| Role | Branch | Last verified full SHA (≈19:41 UTC) | State | Latest milestone |
|---|---|---|---|---|
| Lead (Claudia) | `ccr-067047f0-up5d1m` | see `docs/PARALLEL_PROGRESS.md` "Backup verification" (final) | this session | restore r4, flowplan test E + race fixes, decisions, briefs, coins08px verified, Screen 06 APK |
| 08 Benny | `claude/rainbow-s08-benny08-bake-c4` | `b619d701ff97964e7bc54082624dab32f08fee67` | idle, done | round 5b `0067fc7b`: r3b + fuller rounder body (user decision) |
| 08 camera | `claude/rainbow-s08-camclear-c4` | `a42140304915ea57d2d2c02493b066316207033b` | idle, done | round 4 `aa10fdbb`: drain-lip tilt 16°→1°, Benny hidden 44→25 %, missed coins fade |
| 08 scenery in motion | `claude/rainbow-s08-scenery-c4` | `a3f2a7065b8377bce15c06565c0290ef1c47149d` | stopped mid-round 1 (safe checkpoint) | `&m08bw=1` (visibly removes the lower-left tear / second river copy); `&m08lane=1` WIP |
| 07 Washer Tube | `claude/rainbow-s07-match-c4` | `133d06f3c6359530e5745d16abcea758215238e3` | idle, done | M2 `fd703ee1` |
| 04 Five Arrows | `claude/rainbow-s04-match-c4` | `d1e422faff67a37f837566301fb8abff0bac98db` | paused | M3 `a4644789` |
| 05 Flow (LINE B) | `claude/rainbow-s05-match-c4` | `ebaf6cac71812ad5c00a9088ba48b6febdb42b2b` | paused | M2 `a96bfdf4` |
| 06 Rinse Arch | `claude/rainbow-s06-match-c4` | `c088718bb9e3374583238f4ee93f25bdee600065` | paused | M1 `b993f6d5` |
Older protected branches (never write): every `-c3`, `-c2` and original workstream branch, `ccr-c0235034-ks6sx3`,
`ccr-5495e9c4-g0apvl`, `ccr-d4240b15-rl1i72`, `ccr-9c4a8ad6-xovgsx` (line A), `ccr-b0757dec-dj6l1o` (line B),
`codex/*`, `ccr-6f431adf-7h0m8y` (original). Draft PRs #16 (lead), #17 (Benny), #18 (07) and #2–#15: review only,
NEVER merge or close without the user.

## Per workstream: result → exact next task (briefs: `docs/briefs/2026-11-17-r4/S*.md`, user rules: `USER_DECISIONS.md`)
* **08 Benny** — r5b (`?match08=1` default): r3b + body ≈1.1× the brim width (approved ≈1.09×; body fur ×1.04, beanie
  ×0.94). Benny+splash 65.3 → 62.2 % (visual choice), scenery 97.3 %. Switches: r3b `b08full=0`, r4
  `b08hi=1&b08pom=1&b08full=0`, taper `b08shape=1` (opt-in, wrong direction), r2 `b08r3=0`. Pictures
  `qa/match/08/benny08/review_r5/final/` (1_APPROVED / 2_BEFORE_r3b / 3_NEW + moving). APK
  `builds/rainbow-debug-08benny-2026-11-17-r5b.apk`. **Next:** the painting's soft layered fur clumps + pom-pom yarn
  tufts (needs a new fur clump model or bake — parameter tweaks all measured worse); pale streaks by the left arm.
* **08 camera** — r4 (`?camclear=1`): see branch `qa/gameplay_video/STATUS.md`, frames `lip_r4/`, `moving_r4/`. APK
  `builds/rainbow-debug-08camclear-2026-11-17-r4.apk`. **Next:** wait for the user's phone verdict; the 07 bands are
  Screen 07 scenery; the right pipe/arch block belongs to the 08 scenery workstream.
* **08 scenery in motion** — stopped on the backup order with all new code behind switches (`src/world/match08.ts`):
  `&m08bw=1` = chamber entrance wall flush behind the gold arch, **visibly better** (removes the lower-left tear / second
  river copy at 6 u and when steering); `&m08lane=1` (implies m08bw) = near pipe + gold arch ×1.45 about the approved
  viewpoint, squared lower pipe → wider swim lane (geometry correct in debug colours, real-texture frames NOT rendered
  yet); `&m08dbg=1` = flat debug colours. Not yet proven 0 px. Its `qa/match/08/scenery/STATUS.md` + `NOTES.md` hold
  the exact next task. **Next:** render m08bw / m08lane with real textures, prove the approved view 0 px, then the
  remaining items: finish round 1 of `S08_SCENERY.md`: the projected picture tears /
  duplicates the river + wall at 6 u forward and when steering, a gold band fragment top-left, Benny rides into the right
  pipe/arch steering hard right, and `?match08=1` changes screens 04–07 over much of the frame (04 ≈510k px, 07 ≈560k
  px — must be 08-only). Fix with THE METHOD (projection only where valid + world-anchored tiles from the approved
  picture), approved fixed view unchanged.
* **08 coins (lead)** — `?match08=1&coins08px=1` = the USER-PREFERRED coin version (lives on the lead branch only).
  Verified: 8/8, 91 / 2,240, all 9 painted coins physically picked up even riding straight. Under `?flowplan=1` 7 of the
  9 lie past the 08→video hand-over (credited, not swum through).
* **07** — M2 kept `?match07=1&m07fill=1&m07gold=1&m07wall=1&m07coins=1&m07river=1` (mirrored near-water diamond gone,
  doubled upper-left band gone, solid gold paddles, no gold smear steering right, far trail coins tidy); still view
  unchanged (scenery 95.55 %, whole 80.06 %). Pictures `qa/match/07/m2r4/pictures/`, moving `qa/match/07/m2r4/motion_k5/`.
  APK `builds/rainbow-debug-07-2026-11-17-r4.apk`. **Next (M3):** far coin row flatter than the painted line; near water
  while steering = repeating stream tile, less detail; purple perforated patches far off; thin slivers on far paddle
  sides at 10 u; passing paddle lower face purple at 20 u. Flag to re-check: protected 05 BEFORE differed from
  `qa/pilot05/wave9/baseline/05.png` by 32,280 px in the 07 container at its UNCHANGED start commit (pre-existing,
  probably machine rendering differences — verify in the lead container).
* **05 (line B, never merge with line A)** — M2: whole 89.44 %, scenery 93.7 %, water 96.5 %. APK
  `builds/rainbow-debug-05-2026-11-17-r3.apk`. **Next:** M3 per `S05.md` (coin-hole rings, right-wall bubble, lower-left
  gold frame bevel, wake water, moving checks). User priority among 04/05/06: **05 first**.
* **06** — M1: scenery 98.8 %, whole 79.1 %. APK built by the lead: `builds/rainbow-debug-06-2026-11-17-r3.apk` (lead
  branch). **Next:** M2 per `S06.md` (floor/river tile repetition while moving, tile-only river from ~10 u, far coin trail).
* **04** — M3: scenery 98.2 %, whole 81.8 %. APK `builds/rainbow-debug-04-2026-11-17-r3.apk`. **Next:** M4 per `S04.md`
  (hard water/wall edge at 15–20 u, ~4.7 u swirl-tile repeat, water flow along the painted streaks, coins at painted spots).
* **User's order of work:** 08 (Benny, camera, scenery) → 07 → 05 → 06 → 04, at most two sessions at once (usage).
  Nothing is approved; final approval only after full-size APPROVED / BEFORE / NEW + moving-view comparisons.

## How to restart the workstreams on the next account (exact procedure)
1. For each workstream create a NEW branch `<old>-c5` from the newest `-c4` tip (`git push origin <sha>:refs/heads/<new>`)
   — account 4's containers may keep autosaving to `-c4`; never write to the same branch from two accounts. Lead: the
   new session's own branch, started from the newest `ccr-067047f0-up5d1m` commit.
2. `create_session` per workstream (source_revision = outcome_branch = its `-c5` branch, same `rainbow-` style
   environment) with the text of its brief from `docs/briefs/2026-11-17-r4/` (replace `-c4` by `-c5` and the lead session
   id by the new lead's id). **Initial prompts were dropped twice on account 4:** check `list_events` (kinds user/assistant)
   after setup and re-send the task with `send_message` if the session sits idle with no conversation.
3. Max two sessions at a time; each finishes ONE milestone, pushes, verifies remote == HEAD, reports once, stops.

## Keys and paid services (never in git, chat or APKs)
* Secrets do NOT transfer between Claude accounts. On account 4 the `rainbow-` environment started with NO secrets
  (World Labs free read = HTTP 401); the user re-entered both through `request_credential`:
  - World Labs Marble: host `api.worldlabs.ai`, header `WLT-Api-Key`, no prefix.
  - fal.ai: host `queue.fal.run`, header `Authorization`, prefix `Key`. Downloads of fal results come from
    `v3.fal.media` / `v3b.fal.media` (add to the environment's allowed hosts only when a user-approved job needs them).
* Free verification reads (no credits): `python3 -I scripts/verify-assets.py worldlabs` (expect **5,420** credits; the two
  old Screen 05 pilot worlds return 404 — files are in Git LFS); `curl https://api.worldlabs.ai/marble/v1/worlds/32b5b2f4-32bc-4fa5-80a5-861129a528c8`
  → 200 (Screen 08 world = same account); `curl https://queue.fal.run/fal-ai/nano-banana-2/requests/01a1ea70-42d8-7943-b035-7bb5f129d872/status`
  → 200 COMPLETED (same fal account; the dollar balance is dashboard-only; the user bought $10).
* Scripts that read keys from variables: placeholders only — `WORLD_LABS_API_KEY=proxy-injected`, `FAL_KEY=proxy-injected`,
  `NODE_USE_ENV_PROXY=1`; the proxy injects the real header. Image-Blaster: `bash scripts/setup-image-blaster.sh`
  (+ `tools/imageblaster/image-blaster-local.patch`; not installed in account 4's lead container, only needed for paid jobs).
* Paid ledger: World Labs 7,000 → 5,420 (Screen 08 world, 1,580); fal: two Screen 08 edits + ONE Screen 04 clean plate
  (request `01a1ea70`, DONE — reuse `qa/match/04/fal/`). Screen 06 / 07 fal plates PREPARED, NOT approved, NOT run.
  No paid job ran on account 4.

## Google Flow plan (`docs/FLOW_VIDEO.md`)
01–03 opening video · 04–08 playable 3D · 09–11 ending video, behind `?flowplan=1` (default build unchanged; real-time
fallback scenes kept). `node scripts/flowplan-test.mjs` → A–E pass (E = full run with both videos = exactly 91 coins /
2,240). The user's real `public/video/intro.mp4` / `ending.mp4` are NOT in the repo yet; never generate videos.

## What could NOT be transferred (state it to the user)
Claude login and chat history (sanitized transcripts are autosaved under `backups/claude-sessions/`; this section is the
summary), live sessions and their containers (account 4's lead + 5 specialist sessions stay on account 4), environment
secrets and settings (re-enter keys; environment setup script = `scripts/cloud-env-setup.sh`), the optional World Labs
Atlas connector and context7 MCP (not needed). No APK has been tested on a real phone. Uncommitted edits inside account 4
containers after their last autosave (if any) are not recoverable.

---
# OLDER: RAINBOW — new Claude account handoff (written 2026-11-17 ~14:30 UTC, session 03b94f36)

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
Scores: scenery 97.4 % (SSIM 0.959), upper 98.9 %, middle 91.0 %, lower 99.2 %, Benny + splash **66.2 %** (Benny round,
2026-11-17 ~14:45: placed on the painted Benny, rounder body, stronger approved splash), whole frame **83.4 %** (BEFORE 4.0 %).
**User status: the METHOD is approved; Screen 08 itself is NOT approved — finish Benny's fur/knit detail first
(plan: `qa/match/08/NOTES.md` → BENNY ROUND → NEXT, port line B's benny05 bake as an 08 variant, never merge).** Gameplay test 8/8 both builds.
Remaining: Benny's fur/knit/pom surface detail (position + size now match); darker band at the lower-left edge 3–6 u
forward; coins wobble ±3°. APK `builds/rainbow-debug-match08-2026-11-17b.apk` (newest; `…-17.apk` = previous; Git LFS, built with
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

## 11. Install + test the APK on an Android phone (not done yet — no phone in the cloud)
1. On GitHub open `builds/rainbow-debug-match08-2026-11-17b.apk` on branch `ccr-9c4a8ad6-xovgsx` → **Download** (LFS
   file, ~21 MB). Or with a computer: `git lfs pull --include=builds/rainbow-debug-match08-2026-11-17b.apk`.
2. Phone: Settings → Security/Apps → allow "Install unknown apps" for your browser/files app; open the APK → Install.
   (Computer + USB debugging: `adb install -r builds/rainbow-debug-match08-2026-11-17b.apk`.)
3. Play through to 08 · FINAL SPIN CHAMBER (this APK has the Screen 08 switch built in). Check: the chamber looks like
   the approved picture, Benny rides the S-river, coins collect, frame rate feels smooth, no crash.
4. Report back (screenshot from the phone helps). Only then may the Android test be called passed.
