# Rainbow — Claude account transfer guide (written 2026-11-16 ~01:20 UTC, account 8)

Rainbow is an EXISTING, playable 11-screen 3D Android game. Never restart it. Everything below was checked in
this session unless marked "last verified on account N".

## 1. Repository, branch, commit
| | |
|---|---|
| Repository | `josiahscalia5-dev/rainbow-` (private, GitHub) |
| **Source branch (newest work)** | **`ccr-4f6c3e0e-5kxgr0`** |
| Latest verified commit | see the newest `committed+pushed` row in `backups/BACKUP_LOG.md` (the autosave keeps pushing while this session lives); at the time of writing `7f157d2`. Always use the remote branch tip: `git ls-remote origin refs/heads/ccr-4f6c3e0e-5kxgr0` |
| Contains | every earlier branch (checked after `git fetch --unshallow`): `ccr-6f431adf-7h0m8y` (original), `claude/rainbow-3d-recovery-m4v347`, `ccr-8b6fc834-7kd55l`, `ccr-d4bb0ad3-8ycajb`, `ccr-e033f912-8b40f5`, `claude/rainbow-3d-account-transfer-syorak`, and `ccr-93add0fa-q17ey6` up to `6cf0b4f` (its later `08fb461` only added account-7 transcript lines, copied in here) |
| Protected (autosave refuses to push) | all branches above — `backups/autosave.config.json` → `protected_branches` |

## 2. Safe new working branch on the next account
A new Claude Code cloud session gets its own `ccr-*` (or `claude/*`) branch. Start it FROM the source branch:
```bash
git fetch origin ccr-4f6c3e0e-5kxgr0 && git fetch --unshallow origin 2>/dev/null || true
git checkout -B <your-new-session-branch> origin/ccr-4f6c3e0e-5kxgr0   # only if the session did not start on it
git merge-base --is-ancestor origin/ccr-4f6c3e0e-5kxgr0 HEAD && echo "contains source: OK"
```
Then add `ccr-4f6c3e0e-5kxgr0` to `protected_branches` and set `"branch"` + `commit_trailer` in
`backups/autosave.config.json` to the new session (as done for every previous account). Never force-push.

## 3. The ten specialist agents
`.claude/agents/*.md` — android-build-performance, animation-and-gameplay-engineer, benny-character-artist,
cartoon-girl-character-artist, foam-bubbles-particles, path-camera-transition-engineer, playwright-visual-qa,
reference-match-director, washer-environment-modeler, water-fx-specialist. They load automatically as project
subagents (Agent tool, `subagent_type` = file name without `.md`). Do not recreate or rename them.
Status, finished work and who must be relaunched: **`backups/AGENTS_STATUS.md` (top table)**. Relaunch brief
template: `qa/pilot05/COORDINATION_WAVE7.md` + the specialist's own `qa/pilot05/wave7/<name>/NOTES.md`.

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
Wave-7 baseline `qa/pilot05/wave7/baseline/05.png`; ranked difference table in `qa/pilot05/COORDINATION_WAVE6.md`.
Wave 7 result (all three specialists DONE): `qa/pilot05/wave7/handoff/05_side_by_side.png` (approved | before | now);
whole-frame mad 59.0 → 51.2, hue_corr 0.809 → 0.856, edge_corr 0.117 → 0.177, near band 63.8 → 46.7, tunnel band
62.6 → 61.0 (lower mad / higher corr = closer). Gameplay test pass after the wave.
1. Walls: now de-swirled slot rows, but too VIOLET (70–80 % vs ref 29–46 %) → pinker magenta metal; more white-pink
   lengthwise streaks (2.0–3.6 % vs ref 5.1 %) (environment).
2. Rings: band shading done; colour is rose/salmon — make the bands read more YELLOW-gold with brighter highlight;
   ring 2 at y198 vs ref 170 and one extra far ring (positions in path-camera's far block) (environment + path-camera).
3. Lids: shading a bit flat; keep round puck shape of the approved image (environment).
4. Near gold frame: DONE (3D, 05 only); tune its gold share (32–43 % vs ref 43–50 %).
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
| `node scripts/gameplay-test.mjs` | pass: victory, heart loss on wall bump, plunge 61.41, errors [] | account 8, 2026-11-16 00:41 |
| `npm run test:continuity` | all stage gaps 0 | account 8 |
| `npx tsc --noEmit` | OK | account 8 (also by water + foam specialists) |
| `sha256sum -c scripts/reference.sha256` | 12/12 OK | account 8 |
| `git lfs fsck` | OK (all LFS files present) | account 8 |
| 05 capture | 86 draw calls, ~633k tris | account 8 |
| Android `assembleDebug` | BUILD SUCCESSFUL, APK 7.29 MB (`builds/rainbow-debug.apk`), not run on a device | last verified on account 6 |

## 12. Exact next tasks
1. Verify (§2, §9, §10), then read `backups/AGENTS_STATUS.md` and `qa/pilot05/wave7/*/NOTES.md`.
2. Launch path-camera-transition-engineer for the far river/VP strip, far ring positions and far foam rims
   (§6 items 2 and 5, `qa/pilot05/REQUESTS.md`), and a second washer-environment-modeler pass (§6 items 1–3).
4. Water + foam polish passes (§6 items 6–7), then reference-match-director + playwright-visual-qa report with
   approved vs before (`qa/pilot05/wave7/baseline/05.png`) vs after at 864×1536.
5. Marble: Blender render of the full splats from the locked 05 camera; decide on HQ mesh (ask the user).
6. Screen 06 raised water arch; then 04/07 using the same method. Rebuild + verify the Android APK.
