# Rainbow — Claude account transfer guide (account 8 + transfer session 94cf04e3, 2026-11-16 ~01:30 UTC)

Rainbow is an EXISTING, playable 11-screen 3D Android game. Never restart it. Everything below was checked in
these sessions unless marked "last verified on account N".

## ▶ 0. Final verified backup (transfer session `94cf04e3`, branch `ccr-937c7fbb-htsrgt`) — read first
**Two Claude sessions were saving at the same time** at hand-off: account 8 on `ccr-4f6c3e0e-5kxgr0` (with the
washer-environment-modeler still running) and the transfer session on `ccr-937c7fbb-htsrgt`. The transfer branch
merged everything account 8 had pushed up to `8d7464b` (01:19 UTC). If account 8 kept saving after that, its
newer commits are only on `ccr-4f6c3e0e-5kxgr0`, so **always run `scripts/resume-newest-work.sh`** (§2): it merges
every remote `ccr-*`/`claude/*` branch your session does not yet contain, restores LFS and runs the checks.

Verified in the transfer session (2026-11-16 01:17–01:35 UTC):
| Check | Result |
|---|---|
| Branch containment (after `git fetch --unshallow`) | `ccr-937c7fbb-htsrgt` contains all 9 earlier branches: `ccr-6f431adf-7h0m8y` 81e639e, `claude/rainbow-3d-recovery-m4v347` b83b7e0, `ccr-8b6fc834-7kd55l` 8a36270, `ccr-d4bb0ad3-8ycajb` 648f531, `ccr-e033f912-8b40f5` 3c0fe33, `claude/rainbow-3d-account-transfer-syorak` 7ae64c3, `ccr-93add0fa-q17ey6` **08fb461** (merged; its content was already here), `ccr-4f6c3e0e-5kxgr0` **8d7464b** (merged) |
| **Git LFS downloadable from GitHub** | fresh `git clone` of the branch into an empty folder + `git lfs pull` → **24/24 files downloaded, SHA-256 == pointer oid and size, identical to the working copy**; `git lfs fsck` OK. Includes all 17 Marble/World Labs binaries (table in §7) |
| References | `sha256sum -c scripts/reference.sha256` 12/12 OK |
| Agents | 10/10 `.claude/agents/*.md` present (SHA-256 list in §3) |
| Build / game | `npm ci` OK, `tsc --noEmit` OK, `npm run test:continuity` ok (all 10 stage gaps 0, 05→06 gap 0, 07→08 verticalDrop 61.19, max step tangent 6.24°), `node scripts/gameplay-test.mjs` **pass** (pause, continuous travel, no camera cut, no teleport, plunge 61.41, real coin pickups, heart loss on wall bump, victory, errors []) — re-run on the code with the environment specialist's final wave-7 edits (merged from `7cc4869`) |
| Resume script | `bash scripts/resume-newest-work.sh` → `RESUME CHECK: OK` |
| Autosave | `AUTOSAVE OK … (match)` on `ccr-937c7fbb-htsrgt`; `autosave.config.json` now targets this branch and protects `ccr-4f6c3e0e-5kxgr0` |
| World Labs credits | **none spent** in the transfer session; balance re-read 01:35 UTC = **5,190**; both pilot worlds still on the API account; the draft pano (newly listed by the API) downloaded free → `draft/pano.png` |

## 1. Repository, branch, commit
| | |
|---|---|
| Repository | `josiahscalia5-dev/rainbow-` (private, GitHub) |
| **Newest work** | **`ccr-937c7fbb-htsrgt`** (transfer session; contains everything below) — plus any commits account 8 pushed to **`ccr-4f6c3e0e-5kxgr0`** after 01:19 UTC (merge them; §2) |
| Latest verified commit | the final commit is reported to the user in chat; the doc cannot contain its own SHA. Always use the remote tips: `git ls-remote origin refs/heads/ccr-937c7fbb-htsrgt refs/heads/ccr-4f6c3e0e-5kxgr0` |
| Contains | every earlier branch (checked after `git fetch --unshallow`): `ccr-6f431adf-7h0m8y` (original), `claude/rainbow-3d-recovery-m4v347`, `ccr-8b6fc834-7kd55l`, `ccr-d4bb0ad3-8ycajb`, `ccr-e033f912-8b40f5`, `claude/rainbow-3d-account-transfer-syorak`, `ccr-93add0fa-q17ey6` (08fb461), `ccr-4f6c3e0e-5kxgr0` (to 8d7464b) |
| Protected (autosave refuses to push) | all branches above — `backups/autosave.config.json` → `protected_branches`. The next account must add `ccr-937c7fbb-htsrgt` too |
| Default branch warning | the repo's GitHub default branch is the OLD original `ccr-6f431adf-7h0m8y` (81e639e). A session that starts there has the old game — run §2 first |

## 2. Safe new working branch on the next account
A new Claude Code cloud session gets its own `ccr-*` (or `claude/*`) branch, possibly started from the old default
branch. From the repo folder, get the resume script from the newest branch and run it (works from any start point;
it only fetches and merges — never resets, deletes or force-pushes):
```bash
git fetch origin ccr-937c7fbb-htsrgt
git show FETCH_HEAD:scripts/resume-newest-work.sh > /tmp/resume-newest-work.sh
bash /tmp/resume-newest-work.sh            # add --tools to also install Blender 5.3, Android SDK 34, World Labs plugin
git push -u origin "$(git branch --show-current)"
```
Expect `RESUME CHECK: OK`, `24 tracked, 0 still pointer stubs`, `10 agent definitions`, `tsc OK`, and every
`ccr-*`/`claude/*` branch listed as `ok`. If it stops with `CONFLICT`, resolve keeping both sides, `git commit`.
Then add `ccr-937c7fbb-htsrgt` to `protected_branches` and set `"branch"` + `commit_trailer` in
`backups/autosave.config.json` to the new session branch (as done for every previous account). Never force-push.

## 3. The ten specialist agents
`.claude/agents/*.md` — android-build-performance, animation-and-gameplay-engineer, benny-character-artist,
cartoon-girl-character-artist, foam-bubbles-particles, path-camera-transition-engineer, playwright-visual-qa,
reference-match-director, washer-environment-modeler, water-fx-specialist. They load automatically as project
subagents (Agent tool, `subagent_type` = file name without `.md`). Do not recreate or rename them.
Status, finished work and who must be relaunched: **`backups/AGENTS_STATUS.md` (top table)**. Relaunch brief
template: `qa/pilot05/COORDINATION_WAVE7.md` + the specialist's own `qa/pilot05/wave7/<name>/NOTES.md`.

Relaunch on the next account (state at 01:30 UTC):
| Agent | Relaunch? |
|---|---|
| washer-environment-modeler | **Wave 7 DONE** (log written 01:23 UTC): `it06` KEPT — rings with band shading + 20 spots, rose-copper lids, wall swirl removed, warm VP throat, real-3D near gold frame corners (gated to the 05 straight, no pops). Whole-frame mad 59.0 → 51.2, tunnel+VP 62.6 → 61.0, Benny+near water 63.8 → 46.7; regression 06/07/08 pixel-identical, 04 own share 0.091 %. Handoff capture `qa/pilot05/wave7/handoff/`. Relaunch for the **next wave** with its "Left undone" list in `qa/pilot05/wave7/environment/NOTES.md`: walls overshoot to violet (70–80 % vs ref 29–46 %), VP core too small/orange, lids flatter than ref, far rings at wrong virtual depths (request in `qa/pilot05/REQUESTS.md` for path-camera). It deliberately did NOT adopt the Marble 0.87 R ring spacing — the approved image shows ≈1.75 R bays |
| path-camera-transition-engineer | YES — next task (far river/VP strip, §6 item 5, + the far-ring depth request in `qa/pilot05/REQUESTS.md`); never started |
| water-fx-specialist, foam-bubbles-particles | later polish passes only (wave 7 DONE) |
| reference-match-director, playwright-visual-qa | YES, after the environment + path-camera work lands |
| benny-character-artist, cartoon-girl-character-artist, animation-and-gameplay-engineer | idle — no relaunch needed |
| android-build-performance | YES at the end — rebuild the APK (the committed `builds/rainbow-debug.apk` is from 2026-11-15 18:00, before the Screen 05 waves 4–7) |

Definition checksums (unchanged; compare with `sha256sum .claude/agents/*.md`):
`android-build-performance b0c45161…`, `animation-and-gameplay-engineer c48094c3…`, `benny-character-artist cde203af…`,
`cartoon-girl-character-artist 52058503…`, `foam-bubbles-particles f6341dcd…`, `path-camera-transition-engineer 4244cc82…`,
`playwright-visual-qa 0f14c32f…`, `reference-match-director b977e3f7…`, `washer-environment-modeler 7abdea78…`,
`water-fx-specialist b160f12f…`.

## 4. Tools — exact setup
Cloud environment (claude.ai → Claude Code → environment settings) for the new account:
* Personal environment named `rainbow-` with repository `josiahscalia5-dev/rainbow-`.
* Network: unrestricted, or "limited + package managers" plus hosts `download.blender.org`, `dl.google.com`,
  `api.atlas.worldlabs.ai`, `api.worldlabs.ai`, `cdn.marble.worldlabs.ai`, `storage.googleapis.com`.
* Setup script = the contents of `scripts/cloud-env-setup.sh` (LFS fix + `git lfs pull`, `npm ci`, Blender 5.3.0,
  Android SDK 34, World Labs plugin). Each step is non-fatal.
Manual equivalents inside a session:
```bash
cd rainbow-
git config --unset-all "lfs.https://github.com/josiahscalia5-dev/rainbow-.git/info/lfs.access"; git lfs pull && git lfs fsck
npm ci && npx tsc --noEmit
bash scripts/setup-blender.sh          # Blender 5.3.0 headless → /usr/local/bin/blender
bash scripts/setup-android-sdk.sh      # SDK platform 34 + build-tools 34.0.0 (export ANDROID_HOME=/opt/android-sdk)
bash scripts/setup-worldlabs-plugin.sh # worldlabs@worldlabs plugin (skills); its duplicate MCP copy disabled
```
Playwright/Chromium are preinstalled in Claude cloud containers (`require('playwright')`); captures:
`node scripts/capture.mjs 05 --out=<dir>`. MCP/plugin reconnection notes: `backups/MCP_SETUP.md`.

## 5. Status of the 11 screens (all real-time 3D; continuous course)
| Screen | State |
|---|---|
| 01 Inside the Washing Machine, 02 Whirlpool Tumble | real-time cinematics (girl + Benny). Optional Google Flow intro video plays silently, then hands over to live 3D (`src/ui/cinematicVideo.ts`, `docs/FLOW_VIDEO.md`); **no real Flow MP4 committed yet** |
| 03 Whirlpool Twirl, 04 Through the Five Arrows | playable; visually still clearly different from the references |
| **05 Flow Into the Current** | **active work** — camera LOCKED, S-curve refit (wave 6); wave 7 environment + water + foam DONE (see §6) |
| 06 Crest the Rinse Arch | playable; next after 05: rebuild the raised water arch to its reference; keep the 05→06 join and stage anchors |
| 07 Dive the Washer Tube → 08 Final Spin Chamber | real continuous plunge (verticalDrop 61.41, gaps 0) — must be preserved |
| 09 Ride the Final Wave, 10 Slide Into Hiding | playable; visual work pending |
| 11 Safely Home | victory cinematic, `FINAL SPIN COMPLETE`, girl lifts the towel while Benny hides |
Gameplay systems: coins, hearts (loss on wall bump), pause/resume, steering, HUD, collisions, stage transitions.

## 6. Unfinished Screen 05 work (approved image `references/05_flow_into_the_current.png` ALWAYS wins)
User's goal (unchanged): recreate the APPROVED Screen 05 as real playable 3D, ideally 90–95 % visually similar
where achievable — rich metallic purple perforated washer walls, properly sized reflective golden tunnel rings,
thick glossy cyan-and-pink winding water in continuous S-curves into the golden light, natural foam, splashes and
translucent bubbles, Benny exactly as approved, correct camera framing and premium lighting. The approved
screenshot beats the Marble world. Keep the finished gameplay systems and the locked camera; do not redo work the
specialists already finished (wave-7 water/foam DONE). Report measured differences, never invented percentages.
Wave-7 baseline `qa/pilot05/wave7/baseline/05.png`; ranked difference table in `qa/pilot05/COORDINATION_WAVE6.md`.
Wave 7 result (water, foam and environment specialists all DONE): `qa/pilot05/wave7/handoff/05_side_by_side.png`
(approved | before | now); whole-frame mad 59.0 → 51.2, hue_corr 0.809 → 0.856, edge_corr 0.117 → 0.177, near band
63.8 → 46.7, tunnel band 62.6 → 61.0 (lower mad / higher corr = closer). Gameplay test pass after the wave (account 8
and transfer session). Remaining items, from the environment "Left undone" list in `qa/pilot05/wave7/environment/NOTES.md`:
1. Walls: swirl removed, slot rows + streaks done — but too VIOLET (70–80 % vs ref 29–46 %) → pinker magenta metal /
   warmer F0; more white-pink lengthwise streaks (2.0–3.6 % vs ref 5.1 %) (environment).
2. Rings: band shading + 20 spots done; colour reads rose/salmon — make the bands more YELLOW-gold with a brighter
   highlight; ring 2 at y198 vs ref 170 and one extra far ring (virtual depths in path-camera's far block,
   `qa/pilot05/REQUESTS.md`) (environment + path-camera). Ring spacing follows the approved image (≈1.75 R bays),
   not the Marble 0.87–0.93 R.
3. Lids: rose-copper round pucks done — shading flatter than ref (V std 0.15 vs 0.22); far lids stay mid-bay (environment).
4. Near gold frame corners: DONE as real 3D (05 only); tune its gold share (32/33/43 % vs ref 43/50/45 %). VP core now
   too small/orange.
5. Far river at the VP (y 470–560) still straight 06-style stripes → keep winding S-bends + coins into the light;
   far foam rims (path-camera-transition-engineer, `class ForcedTunnel` / `// ---- 05 far tunnel` block).
6. Water polish: brighter near highlights (p95 225 → 247), ~2× glints, sweep starts (water-fx).
7. Foam polish: bluer near clumps, lower-left clump inset (foam).
8. Then reference-match-director + playwright-visual-qa: whole-frame review, side-by-side report.
Rules: 864×1536 captures, `scripts/screen_report.py`, ≤130 draw calls / ≤650k tris, 04/06/07/08 regression,
no static image/video substitutes, no invented fidelity percentages.

## 7. Marble (World Labs) — results and next steps
Full ledger, IDs and asset table: **`qa/worldlabs/05/pilot/LEDGER.md`**.
* User's website world "Vibrant Tunnel of Fortune" `f0be2178-4291-4f90-848f-6506b53cc87d`: official
  `GET /marble/v1/worlds/{id}` → **404** with the API key; `worlds:list` → 0. Not accessible to the API account;
  its 3D files would need a paid Marble app plan export (not done). A screenshot of it is in
  `qa/worldlabs/05/marble_user_world/`.
* Generated from the approved 05 image (crop `qa/worldlabs/05/geometry_ref/2_geometry_reference_05.png` +
  `qa/worldlabs/05/pilot/prompt_05.txt`): draft `5fd3d7a7-21ae-45c7-a3fe-b7ed47bdd13f` and full
  `c0c9dc57-afa3-4330-b2f0-9c6d4dddfef9`. All splat sizes, collider GLBs, PLY exports, pano, thumbnails, Blender
  imports (`import/*.blend`) and measurements are in `qa/worldlabs/05/pilot/{draft,full}/` (Git LFS).
* Measured: ring spacing ≈ 0.87–0.93 × tube radius, river ≈ 0.71–0.73 × diameter, wall rgb ≈ (178–184,62–71,160).
* Next: give the environment specialist the unrolled bay textures (`*/analysis/bay_unrolled.png`) and the
  Blender scenes as modelling/texture references; render the splats from the locked 05 camera in Blender for a
  material comparison; only then decide on the HQ mesh export (3,500 credits, needs the user's OK).
* Budget: user approved max US$5 (6,250 credits) for this pilot, no auto-recharge. Spent 1,810; API balance
  5,190 at hand-off.

Exact asset inventory (all in Git LFS unless noted; every LFS file verified downloadable from GitHub, §0):
| World | Generation | Saved files | Not available / not bought |
|---|---|---|---|
| draft `5fd3d7a7-21ae-45c7-a3fe-b7ed47bdd13f` | op `4a549a9d-3de2-424b-8324-db24a8d1b9bd`, `marble-1.0-draft`, 230 credits (pano 80 + draft 150), 00:55 UTC | `draft/collider.glb` (35,795 tris), `splats_100k.spz`, `splats_500k.spz`, `splats_full_res.spz`, `splats_500k.ply` (free export), `pano.png` (2304×1152; listed by the API only later, downloaded free 01:36), `thumbnail.{webp,png}`, `world.json`, `world_refresh_2026-11-16.json`, `operation_response.sanitized.json`, `import/draft05.blend` + `draft05_underlay.glb` + preview + `draft05_measure.json`, `analysis/` | no HQ / full-res mesh (not generated) |
| full `c0c9dc57-afa3-4330-b2f0-9c6d4dddfef9` | op `12a08430-f687-4a09-bdc7-3a469c76363d`, `marble-1.1`, 1,580 credits (pano 80 + world 1,500), 00:58 UTC | `full/collider.glb`, `splats_100k.spz`, `splats_150k.spz`, `splats_500k.spz`, `splats_full_res.spz`, `splats_500k.ply`, `pano.png` (4608×2304) + `pano_preview_2048.jpg`, `thumbnail.{webp,png}`, `world_refresh_2026-11-16.json`, `operation_response.sanitized.json` (metric_scale_factor 1.5619, ground_plane_offset 0.9745), `import/full05.blend` + underlay + preview + measure, `analysis/` | HQ mesh export (3,500 credits) not bought — needs the user's OK |
| Inputs | — | approved crop `qa/worldlabs/05/geometry_ref/2_geometry_reference_05.png`, `qa/worldlabs/05/pilot/prompt_05.txt`; upload/generate/export calls in `tools/worldlabs/marble_pilot.py`; analysis `tools/worldlabs/analyze_splats.py`, `bay_texture.py`; Blender import `tools/blender/import_world_asset.py` | the media-asset ID of the uploaded input image was not recorded (re-upload is free) |
Both worlds are private to the World API account that made them. Re-download (free, needs that account's key):
`python3 -I tools/worldlabs/marble_pilot.py world <world_id> out.json` → fresh CDN links.

## 8. World Labs authentication (no credentials here)
| Connection | State on account 8 | On the next account |
|---|---|---|
| Marble World API key | NEW key (the exposed account-7 key is retired) saved by the user via the secure credential form as a network secret on account 8's `rainbow-` environment (host `api.worldlabs.ai`, header `WLT-Api-Key`). Tested: `GET /credits` 200 | **Does not transfer.** In the new session the assistant calls `request_credential` (host `api.worldlabs.ai`, header `WLT-Api-Key`); the user pastes the same platform key (or a fresh one from platform.worldlabs.ai/api-keys) ONLY into that form. Credits stay on the World Labs platform account |
| World Labs Atlas (claude.ai connector) | connected, `list_projects` OK ("My project", credits available); nothing run | Re-add the connector in claude.ai settings and sign in again |
| worldlabs@worldlabs plugin | installed by the setup script (skills only) | reinstalled by `scripts/cloud-env-setup.sh` |
| GitHub | session git proxy; pushes verified | connect GitHub to the new Claude account + install the Claude GitHub App on the repo |
| Playwright MCP | plugin, connected | re-enable the plugin if missing; Chromium is preinstalled |
| Other plugin MCPs (Figma, Notion, Slack, Linear, Atlassian, Intercom, context7) | need sign-in; not used by Rainbow | ignore unless needed |
Nothing about Claude account logins, live MCP sessions or connector sign-ins travels through GitHub.

Transfer session `94cf04e3` (same date, a different Claude account from account 8 — its environments are
"Default", "Christmas-", "bubblegames"; no "rainbow-" environment): at 01:35 UTC the user saved a Marble World API
key through the secure credential form on that account's **Default** environment (host `api.worldlabs.ai`, header
`WLT-Api-Key`). Free reads: `GET /credits` → **5,190** (unchanged); `GET /worlds/{id}` → both pilot worlds present,
so the key belongs to the same World Labs platform account. The user had first pasted a key in chat: it was never
used in a command, is redacted in the exported transcripts (`[REDACTED-PRIVATE]`) and is in no git commit (checked on
all branches). **Advice given: delete that pasted key at platform.worldlabs.ai and use a fresh one** via the form
on the next account. Credentials never travel through GitHub — the next account must enter the key in its own form.
Atlas connector `list_projects` OK (project "My project", Personal workspace,
`credits_available: true`, nothing run). GitHub MCP + git proxy pushes OK. Plugins seen: superpowers,
parallax-threejs (playwright-mcp, chrome-devtools-mcp, threejs-devtools-mcp connected; **spector failed to
connect**), playwright, context7 (**needs sign-in**), feature-dev, code-review, frontend-design,
claude-code-setup. The worldlabs@worldlabs plugin was **not** installed in that container, and Blender / Android
SDK were not installed there either (its environment setup script did not run) — run `--tools` (§2) or
`scripts/cloud-env-setup.sh`. Hosts `download.blender.org` and `dl.google.com` answered 200.

## 9. Git LFS restore
```bash
git config --unset-all "lfs.https://github.com/josiahscalia5-dev/rainbow-.git/info/lfs.access"
git lfs pull && git lfs fsck && git lfs ls-files | awk '$2=="-"' | wc -l   # expect "Git LFS fsck OK" and 0
```
Tracked: `*.glb *.ply *.spz *.blend *.fbx *.hdr *.exr *.ktx2 *.psd *.mp4` + the kit ZIP and APK.

## 10. Five-minute autosave
* `scripts/rainbow-autosave.py` (commit + push + verify remote == local), daemon `scripts/autosave-daemon.sh`,
  re-armed by the SessionStart hook in `.claude/settings.json` → `scripts/autosave-hook.sh`.
* Check: `python3 -I scripts/autosave-status.py` (expect `AUTOSAVE OK … (match)`).
* Manual / before ending: `python3 scripts/rainbow-autosave.py --reason manual:end`, then confirm
  `git ls-remote origin refs/heads/<branch>` == `git rev-parse HEAD`.
* Backups stop when the cloud environment is closed; nothing can push then.

## 11. Last successful tests
| Test | Result | When |
|---|---|---|
| Fresh-clone LFS download from GitHub | 24/24 files, SHA-256 == oid, fsck OK | transfer session, 2026-11-16 ~01:20 |
| `node scripts/gameplay-test.mjs` | pass: all 8 checks, plunge 61.41, errors [] — re-run on the final wave-7 environment code | transfer session, 2026-11-16 ~01:28 |
| `npm run test:continuity`, `tsc`, refs 12/12 | ok / OK / OK | transfer session, ~01:20 and again via `resume-newest-work.sh` |
| `node scripts/gameplay-test.mjs` | pass: victory, heart loss on wall bump, plunge 61.41, errors [] | account 8, 2026-11-16 00:41 |
| `npm run test:continuity` | all stage gaps 0 | account 8 |
| `npx tsc --noEmit` | OK | account 8 (also by water + foam specialists) |
| `sha256sum -c scripts/reference.sha256` | 12/12 OK | account 8 |
| `git lfs fsck` | OK (all LFS files present) | account 8 |
| 05 capture | 86 draw calls, ~633k tris | account 8 |
| Android `assembleDebug` | BUILD SUCCESSFUL, APK 7.29 MB (`builds/rainbow-debug.apk`), not run on a device | last verified on account 6 |

## 12. Exact next tasks
1. Run §2 (`resume-newest-work.sh`), check §9/§10, then read `backups/AGENTS_STATUS.md` and
   `qa/pilot05/wave7/*/NOTES.md`. Give the user a short recovery report.
2. Launch path-camera-transition-engineer for the far river/VP strip, far ring positions and far foam rims
   (§6 items 2 and 5, `qa/pilot05/REQUESTS.md`).
3. Second washer-environment-modeler pass on its "Left undone" list (§6 items 1–4: pinker wall metal, yellower ring
   gold, lid shading, VP core) — can run alongside step 2 with strict file ownership; far rings belong to step 2.
4. Water + foam polish passes (§6 items 6–7), then reference-match-director + playwright-visual-qa report with
   approved vs before (`qa/pilot05/wave7/baseline/05.png`) vs after at 864×1536.
5. Marble: Blender render of the full splats from the locked 05 camera; decide on HQ mesh (ask the user).
6. Screen 06 raised water arch; then 04/07 using the same method. Rebuild + verify the Android APK.
